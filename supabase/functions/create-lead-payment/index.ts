import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("Non authentifié");

    const { leadId } = await req.json();
    if (!leadId) throw new Error("leadId requis");

    // Fetch lead with provider check
    const { data: lead, error: leadErr } = await supabaseClient
      .from("leads")
      .select("id, price_charged, purchased_at, provider_id, match_score, training_id, trainings(title, certification_type)")
      .eq("id", leadId)
      .single();

    if (leadErr || !lead) throw new Error("Lead introuvable");
    if (lead.purchased_at) throw new Error("Lead déjà acheté");

    const price = lead.price_charged || 150;
    const trainingTitle = (lead as any).trainings?.title || "Lead ToFrance";
    const certType = (lead as any).trainings?.certification_type || "language";
    const tier = (lead.match_score ?? 50) >= 80 ? "Premium" : (lead.match_score ?? 50) >= 50 ? "Standard" : "Éco";

    // Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(Number(price) * 100),
            product_data: {
              name: `Lead ${tier} — ${trainingTitle}`,
              description: `Déblocage lead ${certType.toUpperCase()} · Score ${lead.match_score ?? "—"}%`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { lead_id: leadId },
      success_url: `${req.headers.get("origin") || Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "https://localhost"}/partner-dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&lead_id=${leadId}`,
      cancel_url: `${req.headers.get("origin") || Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "https://localhost"}/partner-dashboard?payment=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("create-lead-payment error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
