import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripeServerClient } from "@/lib/stripe";
import { getServerAuthContext } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST() {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getUserSubscription(auth.user.id);

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found for this account." }, { status: 400 });
  }

  const stripe = getStripeServerClient();

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
