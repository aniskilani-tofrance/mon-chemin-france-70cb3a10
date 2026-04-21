const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";
import { sendOutlookMail } from "../_shared/outlook-mail.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Checkpoint {
  id: string;
  email: string;
  language: string;
  created_at: string;
  reminder_1h_sent: boolean;
  reminder_24h_sent: boolean;
  reminder_72h_sent: boolean;
}

const SUBJECTS: Record<string, Record<string, string>> = {
  "1h": {
    fr: "Reprenez votre parcours ToFrance 🇫🇷",
    en: "Continue your ToFrance journey 🇫🇷",
    ar: "أكمل مسيرتك مع ToFrance 🇫🇷",
    es: "Continúa tu camino en ToFrance 🇫🇷",
  },
  "24h": {
    fr: "Votre parcours ToFrance vous attend !",
    en: "Your ToFrance journey awaits!",
    ar: "مسيرتك مع ToFrance بانتظارك!",
    es: "¡Tu camino en ToFrance te espera!",
  },
  "72h": {
    fr: "Dernière chance : finalisez votre parcours ToFrance",
    en: "Last chance: complete your ToFrance journey",
    ar: "فرصة أخيرة: أكمل مسيرتك مع ToFrance",
    es: "Última oportunidad: completa tu camino en ToFrance",
  },
};

function getEmailBody(lang: string, tier: string, resumeUrl: string): string {
  const bodies: Record<string, Record<string, string>> = {
    "1h": {
      fr: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#1e3a5f;font-size:22px">Bonjour 👋</h1>
        <p>Vous avez commencé votre parcours d'orientation sur ToFrance. Votre progression a été sauvegardée !</p>
        <p>Reprenez là où vous en étiez en un clic :</p>
        <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Reprendre mon parcours</a>
        <p style="color:#666;font-size:13px">— L'équipe ToFrance</p>
      </div>`,
      en: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#1e3a5f;font-size:22px">Hello 👋</h1>
        <p>You started your orientation on ToFrance. Your progress has been saved!</p>
        <p>Pick up where you left off with one click:</p>
        <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Resume my journey</a>
        <p style="color:#666;font-size:13px">— The ToFrance team</p>
      </div>`,
    },
    "24h": {
      fr: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#1e3a5f;font-size:22px">Votre parcours vous attend ! 🎯</h1>
        <p>Vous êtes déjà à mi-chemin de votre orientation. En quelques minutes, vous pourrez recevoir des recommandations personnalisées de formation.</p>
        <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Finaliser mon parcours</a>
        <p style="color:#666;font-size:13px">— L'équipe ToFrance</p>
      </div>`,
      en: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#1e3a5f;font-size:22px">Your journey awaits! 🎯</h1>
        <p>You're already halfway through your orientation. In just a few minutes, you can get personalized training recommendations.</p>
        <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Complete my journey</a>
        <p style="color:#666;font-size:13px">— The ToFrance team</p>
      </div>`,
    },
    "72h": {
      fr: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#1e3a5f;font-size:22px">Ne manquez pas cette opportunité 🚀</h1>
        <p>Votre parcours d'orientation ToFrance est presque terminé ! Finalisez-le pour accéder à des formations adaptées à votre profil.</p>
        <p>C'est notre dernier rappel — après cela, nous ne vous enverrons plus de message.</p>
        <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Terminer maintenant</a>
        <p style="color:#666;font-size:13px">— L'équipe ToFrance</p>
      </div>`,
      en: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#1e3a5f;font-size:22px">Don't miss this opportunity 🚀</h1>
        <p>Your ToFrance orientation is almost complete! Finish it to access training tailored to your profile.</p>
        <p>This is our last reminder — we won't message you again after this.</p>
        <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Finish now</a>
        <p style="color:#666;font-size:13px">— The ToFrance team</p>
      </div>`,
    },
  };
  return bodies[tier]?.[lang] || bodies[tier]?.fr || bodies["1h"].fr;
}

async function sendEmail(to: string, subject: string, html: string, tier?: string, lang?: string) {
  const result = await sendOutlookMail({
    to,
    subject,
    html,
    log: {
      template: `onboarding-reengagement-${tier ?? "unknown"}`,
      sourceFunction: "onboarding-reengagement",
      metadata: { tier, lang },
    },
  });
  if (result.ok) {
    console.log(`✉️  Outlook OK to ${to} in ${result.attempts} attempt(s) (${result.durationMs}ms)`);
  } else {
    console.error(
      `✉️  Outlook FAIL to ${to} after ${result.attempts} attempt(s): ${result.error} (permanent=${result.permanent === true})`
    );
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const resumeUrl = "https://mon-chemin-france.lovable.app/onboarding";

    // Fetch incomplete checkpoints with email that haven't had all reminders sent
    const { data: checkpoints, error } = await supabase
      .from("onboarding_checkpoints")
      .select("id, email, language, created_at, reminder_1h_sent, reminder_24h_sent, reminder_72h_sent")
      .eq("completed", false)
      .not("email", "is", null)
      .or("reminder_1h_sent.eq.false,reminder_24h_sent.eq.false,reminder_72h_sent.eq.false");

    if (error) throw error;
    if (!checkpoints || checkpoints.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;

    for (const cp of checkpoints as Checkpoint[]) {
      const createdAt = new Date(cp.created_at);
      const ageMs = now.getTime() - createdAt.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      const lang = cp.language || "fr";

      let tier: string | null = null;
      let updateField: string | null = null;

      if (!cp.reminder_1h_sent && ageHours >= 1) {
        tier = "1h";
        updateField = "reminder_1h_sent";
      } else if (!cp.reminder_24h_sent && ageHours >= 24) {
        tier = "24h";
        updateField = "reminder_24h_sent";
      } else if (!cp.reminder_72h_sent && ageHours >= 72) {
        tier = "72h";
        updateField = "reminder_72h_sent";
      }

      if (tier && updateField) {
        const subject = SUBJECTS[tier]?.[lang] || SUBJECTS[tier]?.fr || "Reprenez votre parcours ToFrance";
        const html = getEmailBody(lang, tier, resumeUrl);
        const result = await sendEmail(cp.email, subject, html, tier, lang);

        // Mark as sent on success OR on permanent failure (avoid infinite retry loops
        // on bad addresses, auth errors, etc.). Transient failures are left unmarked
        // so the next cron run retries automatically.
        if (result.ok || result.permanent) {
          await supabase
            .from("onboarding_checkpoints")
            .update({ [updateField]: true })
            .eq("id", cp.id);
          if (result.ok) processed++;
        } else {
          console.warn(`[reengagement] transient failure for cp=${cp.id}, will retry next cycle`);
        }
      }
    }

    return new Response(JSON.stringify({ processed, total: checkpoints.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Reengagement error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
