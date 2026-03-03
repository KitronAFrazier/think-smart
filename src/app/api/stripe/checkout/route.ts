import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { PlanTier } from "@/lib/plans";
import { getStripeServerClient } from "@/lib/stripe";
import { getServerAuthContext } from "@/lib/supabase/server";
import { getUserSubscription, upsertUserSubscription } from "@/lib/subscription";

export const runtime = "nodejs";

type CheckoutPayload = {
  plan?: PlanTier;
  billingInterval?: "month" | "year";
  studentCount?: number;
};

function getConfiguredPlanStripeId(plan: PlanTier, billingInterval: "month" | "year") {
  if (plan === "family") {
    if (billingInterval === "year") {
      return process.env.STRIPE_PRICE_FAMILY_YEARLY ?? process.env.STRIPE_PRICE_FAMILY ?? process.env.STRIPE_PRODUCT_FAMILY;
    }
    return process.env.STRIPE_PRICE_FAMILY_MONTHLY ?? process.env.STRIPE_PRICE_FAMILY ?? process.env.STRIPE_PRODUCT_FAMILY;
  }

  if (plan === "family_plus") {
    if (billingInterval === "year") {
      return process.env.STRIPE_PRICE_FAMILY_PLUS_YEARLY ?? process.env.STRIPE_PRICE_FAMILY_PLUS ?? process.env.STRIPE_PRODUCT_FAMILY_PLUS;
    }
    return process.env.STRIPE_PRICE_FAMILY_PLUS_MONTHLY ?? process.env.STRIPE_PRICE_FAMILY_PLUS ?? process.env.STRIPE_PRODUCT_FAMILY_PLUS;
  }

  if (plan === "co_op") {
    if (billingInterval !== "year") {
      return null;
    }
    return (
      process.env.STRIPE_PRICE_CO_OP_YEARLY ??
      process.env.STRIPE_PRICE_COOP_YEARLY ??
      process.env.STRIPE_PRICE_CO_OP ??
      process.env.STRIPE_PRICE_COOP ??
      process.env.STRIPE_PRODUCT_CO_OP ??
      process.env.STRIPE_PRODUCT_COOP
    );
  }

  return null;
}

async function resolveCheckoutPriceId(plan: PlanTier, billingInterval: "month" | "year") {
  const configuredStripeId = getConfiguredPlanStripeId(plan, billingInterval);
  if (!configuredStripeId) {
    return null;
  }

  if (configuredStripeId.startsWith("price_")) {
    return configuredStripeId;
  }

  if (!configuredStripeId.startsWith("prod_")) {
    return null;
  }

  const stripe = getStripeServerClient();
  const product = await stripe.products.retrieve(configuredStripeId, {
    expand: ["default_price"],
  });

  const defaultPrice = product.default_price;
  if (typeof defaultPrice === "string") {
    return defaultPrice;
  }

  if (defaultPrice?.id) {
    return defaultPrice.id;
  }

  const prices = await stripe.prices.list({
    product: configuredStripeId,
    active: true,
    type: "recurring",
    limit: 100,
  });

  const matchedPrice = prices.data.find((price) => price.recurring?.interval === billingInterval);
  return matchedPrice?.id ?? null;
}

export async function POST(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CheckoutPayload;
  try {
    body = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = body.plan;
  const billingInterval = body.billingInterval === "year" ? "year" : "month";

  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  if (plan === "co_op") {
    if (billingInterval !== "year") {
      return NextResponse.json({ error: "Co-Op pricing is yearly only." }, { status: 400 });
    }

    const studentCount = Number(body.studentCount);
    if (!Number.isFinite(studentCount) || studentCount < 10) {
      return NextResponse.json({ error: "Co-Op pricing requires at least 10 students." }, { status: 400 });
    }
  }

  try {
    const priceId = await resolveCheckoutPriceId(plan, billingInterval);
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe ${billingInterval === "year" ? "yearly" : "monthly"} price/product ID for ${plan}.` },
        { status: 400 },
      );
    }

    const stripe = getStripeServerClient();
    const currentSubscription = await getUserSubscription(auth.user.id);

    let customerId = currentSubscription?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email,
        metadata: {
          user_id: auth.user.id,
        },
      });
      customerId = customer.id;
    }

    await upsertUserSubscription({
      userId: auth.user.id,
      plan: currentSubscription?.plan ?? "free",
      status: currentSubscription?.status ?? "inactive",
      stripeCustomerId: customerId,
      stripeSubscriptionId: currentSubscription?.stripe_subscription_id ?? null,
      currentPeriodEnd: currentSubscription?.current_period_end ?? null,
    });

    const headerStore = await headers();
    const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded",
      redirect_on_completion: "if_required",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: auth.user.id,
      metadata: {
        user_id: auth.user.id,
        plan,
        billing_interval: billingInterval,
      },
      allow_promotion_codes: true,
    });

    if (!session.client_secret) {
      return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create checkout session.";
    console.error("POST /api/stripe/checkout failed:", error);

    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY in server environment. Add it to .env.local and restart dev server." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
