import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const PRODUCT_MAP: Record<string, "marianne" | "placement_test" | "shared_diagnostic"> = {
  marianne: "marianne",
  placement_test: "placement_test",
  placement: "placement_test",
  shared_diagnostic: "shared_diagnostic",
  diagnostic: "shared_diagnostic",
};

function inferProduct(sub: Stripe.Subscription): "marianne" | "placement_test" | "shared_diagnostic" {
  const metaKey = (sub.metadata?.product || "").toLowerCase();
  if (PRODUCT_MAP[metaKey]) return PRODUCT_MAP[metaKey];
  const item = sub.items?.data?.[0];
  const priceMeta = (item?.price?.metadata?.product || "").toLowerCase();
  if (PRODUCT_MAP[priceMeta]) return PRODUCT_MAP[priceMeta];
  const nick = (item?.price?.nickname || "").toLowerCase();
  for (const k of Object.keys(PRODUCT_MAP)) if (nick.includes(k)) return PRODUCT_MAP[k];
  // Fallback: cheapest tier → marianne (le tronc)
  return "marianne";
}

function toIso(ts: number | null | undefined): string | null {
  return ts ? new Date(ts * 1000).toISOString() : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const upsertSubscription = async (sub: Stripe.Subscription) => {
    const item = sub.items?.data?.[0];
    const price = item?.price;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

    // Resolve email + user_id from Stripe customer + Supabase auth
    let email: string | null = null;
    let userId: string | null = null;
    if (customerId) {
      try {
        const cust = await stripe.customers.retrieve(customerId);
        if (cust && !(cust as any).deleted) email = (cust as Stripe.Customer).email ?? null;
      } catch (e) {
        console.warn("Could not retrieve customer", e);
      }
    }
    if (email) {
      const { data: existing } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();
      if (existing?.user_id) {
        userId = existing.user_id;
      } else {
        // Look up auth user by email
        const { data: list } = await supabaseAdmin.auth.admin.listUsers();
        const match = list?.users?.find((u) => u.email?.toLowerCase() === email!.toLowerCase());
        if (match) userId = match.id;
      }
    }

    if (!userId) {
      console.warn(`No user_id resolved for subscription ${sub.id} (email=${email}). Skipping upsert.`);
      return;
    }

    const payload = {
      user_id: userId,
      email,
      product: inferProduct(sub),
      status: sub.status as any,
      amount_cents: price?.unit_amount ?? 0,
      currency: (price?.currency || "eur").toLowerCase(),
      interval: price?.recurring?.interval || "month",
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: sub.id,
      stripe_price_id: price?.id ?? null,
      current_period_start: toIso((sub as any).current_period_start),
      current_period_end: toIso((sub as any).current_period_end),
      cancel_at_period_end: !!sub.cancel_at_period_end,
      canceled_at: toIso(sub.canceled_at),
      trial_end: toIso(sub.trial_end),
      metadata: sub.metadata ?? {},
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(payload, { onConflict: "stripe_subscription_id" });

    if (error) console.error("Subscription upsert error:", error, payload);
    else console.log(`Subscription ${sub.id} synced (${sub.status})`);
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Legacy: lead payment
        if (session.payment_status === "paid" && session.metadata?.lead_id) {
          const { error } = await supabaseAdmin
            .from("leads")
            .update({ purchased_at: new Date().toISOString() })
            .eq("id", session.metadata.lead_id);
          if (error) console.error("Lead update error:", error);
          else console.log(`Lead ${session.metadata.lead_id} marked purchased`);
        }

        // Subscription checkout
        if (session.mode === "subscription" && session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
      case "customer.subscription.trial_will_end": {
        await upsertSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(
            typeof subId === "string" ? subId : subId.id
          );
          await upsertSubscription(sub);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
