import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_PASSWORD = "DemoToFrance2026!";

const DEMO_ACCOUNTS = [
  { key: "apprenant", email: "demo.apprenant@tofrance.fr", full_name: "Awa Diallo (démo)", role: "user", redirect: "/dashboard" },
  { key: "formateur", email: "demo.formateur@tofrance.fr", full_name: "Marc Petit (démo)", role: "formateur", redirect: "/formateur" },
  { key: "directeur", email: "demo.directeur@tofrance.fr", full_name: "Sophie Lambert (démo)", role: "directeur", redirect: "/directeur" },
  { key: "cip", email: "demo.cip@tofrance.fr", full_name: "Karim Benali (démo CIP)", role: "cip", redirect: "/cip" },
  { key: "benevole", email: "demo.benevole@tofrance.fr", full_name: "Claire Moreau (démo bénévole)", role: "benevole", redirect: "/partner-dashboard" },
];

const EXTRA_LEARNERS = [
  { email: "demo.apprenant2@tofrance.fr", full_name: "Yassin Ouali (démo)", french_level_cecrl: "a2", city: "Saint-Denis", postal_code: "93200" },
  { email: "demo.apprenant3@tofrance.fr", full_name: "Fatou Sylla (démo)", french_level_cecrl: "b1", city: "Aubervilliers", postal_code: "93300" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non autorisé" }, 401);

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) return json({ error: "Utilisateur non trouvé" }, 401);

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Réservé aux admins" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "list") {
      const accounts = await Promise.all(
        DEMO_ACCOUNTS.map(async (acc) => {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const exists = list?.users?.some((u: any) => u.email?.toLowerCase() === acc.email);
          return { ...acc, exists, password: DEMO_PASSWORD };
        })
      );
      return json({ accounts });
    }

    if (action === "provision") {
      const created: Record<string, string> = {};

      // 1. Create / reset core demo accounts
      for (const acc of DEMO_ACCOUNTS) {
        const userId = await ensureUser(supabaseAdmin, acc.email, acc.full_name);
        await ensureRole(supabaseAdmin, userId, acc.role);
        await ensureProfile(supabaseAdmin, userId, acc.email, acc.full_name);
        created[acc.key] = userId;
      }

      // 2. Extra apprenants
      const extraIds: string[] = [];
      for (const e of EXTRA_LEARNERS) {
        const id = await ensureUser(supabaseAdmin, e.email, e.full_name);
        await ensureRole(supabaseAdmin, id, "user");
        await supabaseAdmin.from("profiles").upsert({
          user_id: id, email: e.email, full_name: e.full_name,
          french_level_cecrl: e.french_level_cecrl, city: e.city, postal_code: e.postal_code,
        }, { onConflict: "user_id" });
        extraIds.push(id);
      }

      // 2.b Demo establishment "Association de démo" (owned by directeur)
      const providerId = await ensureDemoProvider(supabaseAdmin, created.directeur);

      // Affiliate staff demo accounts as members of the demo establishment
      const memberSeeds: Array<{ user_id: string; role: string; email: string; full_name: string }> = [
        { user_id: created.formateur, role: "formateur", email: "demo.formateur@tofrance.fr", full_name: "Marc Petit (démo)" },
        { user_id: created.cip, role: "cip", email: "demo.cip@tofrance.fr", full_name: "Karim Benali (démo CIP)" },
        { user_id: created.benevole, role: "benevole", email: "demo.benevole@tofrance.fr", full_name: "Claire Moreau (démo bénévole)" },
      ];
      for (const m of memberSeeds) {
        await supabaseAdmin.from("provider_members").upsert({
          provider_id: providerId,
          user_id: m.user_id,
          email: m.email,
          full_name: m.full_name,
          role: m.role,
          status: "active",
          invited_by: created.directeur,
          accepted_at: new Date().toISOString(),
        }, { onConflict: "provider_id,user_id" });
      }


      // 3. Link learners to formateur
      const formateurId = created.formateur;
      const allLearners = [created.apprenant, ...extraIds];
      for (const lid of allLearners) {
        await supabaseAdmin.from("formateur_learners").upsert(
          { formateur_id: formateurId, learner_id: lid },
          { onConflict: "formateur_id,learner_id", ignoreDuplicates: true }
        );
      }

      // 4. Create demo diagnostics
      const { data: codeA } = await supabaseAdmin.rpc("generate_access_code");
      const { data: codeB } = await supabaseAdmin.rpc("generate_access_code");

      const { data: existingDiags } = await supabaseAdmin
        .from("shared_diagnostics")
        .select("id, learner_id, status")
        .in("learner_id", allLearners);

      const diagByLearner = new Map((existingDiags || []).map((d: any) => [d.learner_id, d]));

      // In-progress diagnostic for main apprenant
      if (!diagByLearner.has(created.apprenant)) {
        await supabaseAdmin.from("shared_diagnostics").insert({
          formateur_id: formateurId,
          learner_id: created.apprenant,
          access_code: codeA as string,
          learner_language: "fr",
          status: "in_progress",
        });
      }

      // Completed diagnostic for second apprenant + experiences + scoring
      if (!diagByLearner.has(extraIds[0])) {
        const { data: diag2 } = await supabaseAdmin.from("shared_diagnostics").insert({
          formateur_id: formateurId,
          learner_id: extraIds[0],
          access_code: codeB as string,
          learner_language: "fr",
          status: "completed",
          completed_at: new Date().toISOString(),
        }).select().single();

        if (diag2) {
          await supabaseAdmin.from("shared_diagnostic_experiences").upsert([
            {
              diagnostic_id: diag2.id, category: "travail",
              description: "J'ai travaillé comme vendeuse sur un marché à Dakar pendant 5 ans : accueil des clients, gestion de la caisse, négociation des prix, gestion du stock.",
              activities: ["vente", "accueil client", "caisse", "stock", "négociation"],
            },
            {
              diagnostic_id: diag2.id, category: "famille",
              description: "Je m'occupe de mes 3 enfants : repas, école, rendez-vous médicaux, budget familial. J'aide aussi ma mère âgée pour ses démarches administratives.",
              activities: ["cuisine", "organisation", "budget", "accompagnement personne âgée"],
            },
          ], { onConflict: "diagnostic_id,category" });

          await supabaseAdmin.rpc("score_shared_diagnostic_competences", { _diagnostic_id: diag2.id });
        }
      }

      return json({
        success: true,
        accounts: DEMO_ACCOUNTS.map((a) => ({ ...a, password: DEMO_PASSWORD })),
        extra_learners_created: extraIds.length,
      });
    }

    if (action === "switch") {
      const targetEmail = String(body.email || "").toLowerCase().trim();
      if (!targetEmail) return json({ error: "email requis" }, 400);

      const account = DEMO_ACCOUNTS.find((a) => a.email === targetEmail);
      if (!account) return json({ error: "Compte non démo" }, 400);

      // Ensure user exists
      const userId = await ensureUser(supabaseAdmin, account.email, account.full_name);
      await ensureRole(supabaseAdmin, userId, account.role);
      await ensureProfile(supabaseAdmin, userId, account.email, account.full_name);

      // Generate magic link
      const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: account.email,
        options: { redirectTo: `${new URL(req.url).origin.replace("/functions/v1", "")}` },
      });
      if (linkErr) throw linkErr;

      return json({
        success: true,
        email: account.email,
        password: DEMO_PASSWORD,
        action_link: link.properties?.action_link,
        redirect: account.redirect,
      });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (error) {
    console.error("admin-demo-accounts error:", error);
    return json({ error: String(error) }, 500);
  }
});

async function ensureUser(admin: any, email: string, full_name: string): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u: any) => u.email?.toLowerCase() === email);
  if (existing) {
    // Reset password to ensure demo predictability
    await admin.auth.admin.updateUserById(existing.id, { password: DEMO_PASSWORD, email_confirm: true });
    return existing.id;
  }
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password: DEMO_PASSWORD, email_confirm: true, user_metadata: { full_name, demo: true },
  });
  if (error) throw error;
  return created.user!.id;
}

async function ensureRole(admin: any, user_id: string, role: string) {
  await admin.from("user_roles").upsert({ user_id, role }, { onConflict: "user_id,role", ignoreDuplicates: true });
}

async function ensureProfile(admin: any, user_id: string, email: string, full_name: string) {
  const { data: existing } = await admin.from("profiles").select("id").eq("user_id", user_id).maybeSingle();
  if (!existing) {
    await admin.from("profiles").insert({ user_id, email, full_name });
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
