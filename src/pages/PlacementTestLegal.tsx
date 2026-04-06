import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69409edef41e4f2a833c897b/ac7782ec6_logopefpetit.png";

const pages: Record<string, { title: string; content: string }> = {
  "mentions-legales": {
    title: "Mentions légales",
    content: `
**Éditeur du site**
Ce test de positionnement en français langue étrangère est édité dans un cadre pédagogique.

**Hébergement**
Le site est hébergé par Lovable Cloud.

**Propriété intellectuelle**
L'ensemble du contenu de ce test (questions, textes, design) est protégé par le droit d'auteur.

**Responsabilité**
Ce test est indicatif et ne constitue en aucun cas une certification officielle du niveau de français.
    `,
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    content: `
**Objet**
Les présentes CGU régissent l'utilisation du test de positionnement en ligne.

**Accès au service**
Le test est accessible gratuitement. Un candidat ne peut repasser le test qu'après un délai de 3 mois.

**Données personnelles**
Les données collectées (nom, email, téléphone) sont utilisées uniquement pour la réalisation du test et la communication des résultats.

**Résultats**
Les résultats sont indicatifs et ne constituent pas une certification officielle CECRL.

**Propriété intellectuelle**
Toute reproduction du contenu du test est interdite sans autorisation préalable.
    `,
  },
  confidentialite: {
    title: "Politique de confidentialité",
    content: `
**Données collectées**
- Nom, prénom
- Adresse email
- Numéro de téléphone (facultatif)
- Réponses au test
- Score et niveau estimé

**Finalité du traitement**
Les données sont collectées pour réaliser le test de positionnement et communiquer les résultats.

**Conservation**
Les données sont conservées pendant une durée maximale de 12 mois.

**Droits des utilisateurs**
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous par email pour exercer ces droits.

**Cookies**
Ce site n'utilise pas de cookies de tracking. Seuls des cookies techniques nécessaires au fonctionnement sont utilisés.
    `,
  },
  faq: {
    title: "Questions fréquentes",
    content: `
**Combien de temps dure le test ?**
Le test dure environ 30 minutes et contient 71 questions.

**Le test est-il gratuit ?**
Oui, le test est entièrement gratuit.

**Puis-je repasser le test ?**
Oui, mais vous devez attendre 3 mois entre chaque passage.

**Le résultat est-il une certification officielle ?**
Non. Ce test est indicatif et ne remplace pas une certification CECRL officielle (DELF, DALF, TCF, etc.).

**Quels niveaux sont évalués ?**
Le test évalue les niveaux A1, A2, B1, B2, C1 et C2 du Cadre Européen Commun de Référence pour les Langues.

**Comment est calculé mon niveau ?**
Le score est basé sur le pourcentage de bonnes réponses. Les questions de production écrite et orale sont évaluées par intelligence artificielle.
    `,
  },
};

export default function PlacementTestLegal() {
  const { page } = useParams<{ page: string }>();
  const content = pages[page || ""] || { title: "Page introuvable", content: "Cette page n'existe pas." };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafa" }}>
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
          <Link to="/placement-test" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <img src={LOGO_URL} alt="PEF" className="h-10 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold" style={{ color: "#00504e" }}>{content.title}</h1>
        <div className="prose prose-sm max-w-none text-gray-600">
          {content.content.split("\n").map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return <h3 key={i} className="mt-6 mb-2 text-base font-semibold text-gray-800">{line.replace(/\*\*/g, "")}</h3>;
            }
            if (line.trim().startsWith("- ")) {
              return <li key={i} className="ml-4">{line.replace("- ", "")}</li>;
            }
            if (line.trim()) {
              return <p key={i} className="mb-2">{line}</p>;
            }
            return null;
          })}
        </div>
      </main>
    </div>
  );
}
