import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifySlackSignature(req: Request, rawBody: string) {
  const signingSecret = Deno.env.get("SLACK_SIGNING_SECRET");
  if (!signingSecret) return { ok: false, reason: "missing_signing_secret" };

  const timestamp = req.headers.get("x-slack-request-timestamp") || "";
  const signature = req.headers.get("x-slack-signature") || "";
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);

  if (!timestamp || !signature || !Number.isFinite(ts)) return { ok: false, reason: "missing_signature_headers" };
  if (Math.abs(now - ts) > 60 * 5) return { ok: false, reason: "stale_request" };

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(signingSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(`v0:${timestamp}:${rawBody}`));
  const hash = Array.from(new Uint8Array(signed)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return { ok: `v0=${hash}` === signature, reason: `v0=${hash}` === signature ? "verified" : "invalid_signature" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody || "{}");

    if (payload.type === "url_verification" && payload.challenge) {
      console.log("Slack URL verification received");
      return new Response(payload.challenge, { headers: { ...corsHeaders, "Content-Type": "text/plain" } });
    }

    const verification = await verifySlackSignature(req, rawBody);
    if (!verification.ok) {
      console.warn("Slack event rejected", verification.reason);
      return new Response(JSON.stringify({ ok: false, error: verification.reason }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = payload.event || {};
    console.log("Slack event received", {
      type: event.type,
      subtype: event.subtype,
      channel: event.channel,
      user: event.user,
      text: typeof event.text === "string" ? event.text.slice(0, 180) : undefined,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Slack event handler error", error);
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});