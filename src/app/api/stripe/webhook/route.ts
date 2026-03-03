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

function resolveCustomerUserId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string | undefined {
  if (typeof customer === "string") {
    return undefined;
  }

  if ("deleted" in customer && customer.deleted) {
    return undefined;
  }

  return customer.metadata?.user_id;
}

function resolveCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customer === "string" ? customer : customer.id;
}

function resolveCurrentPeriodEnd(subscription: Stripe.Subscription): string | null {
  const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return typeof currentPeriodEnd === "number" ? new Date(currentPeriodEnd * 1000).toISOString() : null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id || resolveCustomerUserId(subscription.customer);

  if (!userId) {
    return;
  }

  await upsertUserSubscription({
    userId,
    plan: subscriptionStatusToPlan(subscription),
    status: subscription.status,
    stripeCustomerId: resolveCustomerId(subscription.customer),
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: resolveCurrentPeriodEnd(subscription),
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
          stripeCustomerId: resolveCustomerId(subscription.customer),
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: resolveCurrentPeriodEnd(subscription),
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
        stripeCustomerId: resolveCustomerId(subscription.customer),
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: null,
      });
    }
  }

  return NextResponse.json({ received: true });
}
