import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeServerClient } from "@/lib/stripe";
import { stripePriceIdToPlan, upsertUserSubscription } from "@/lib/subscription";

export const runtime = "nodejs";

function subscriptionStatusToPlan(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;
  const productId = typeof price?.product === "string" ? price.product : price?.product?.id;
  return stripePriceIdToPlan(price?.id, productId);
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId =
    subscription.metadata.user_id ||
    (typeof subscription.customer === "string" ? undefined : subscription.customer.metadata?.user_id);

  if (!userId) {
    return;
  }

  await upsertUserSubscription({
    userId,
    plan: subscriptionStatusToPlan(subscription),
    status: subscription.status,
    stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripeServerClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "subscription" && typeof session.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      if (session.client_reference_id) {
        await upsertUserSubscription({
          userId: session.client_reference_id,
          plan: subscriptionStatusToPlan(subscription),
          status: subscription.status,
          stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        });
      }
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await syncSubscription(subscription);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata.user_id;

    if (userId) {
      await upsertUserSubscription({
        userId,
        plan: "free",
        status: subscription.status,
        stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: null,
      });
    }
  }

  return NextResponse.json({ received: true });
}
