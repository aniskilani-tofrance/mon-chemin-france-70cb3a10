import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69409edef41e4f2a833c897b/ac7782ec6_logopefpetit.png";

export default function PlacementTestTrainer() {
  const navigate = useNavigate();
  const [trainerName, setTrainerName] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) {
      toast.error("Veuillez remplir le nom et l'email du candidat.");
      return;
    }

    sessionStorage.setItem("placement_candidate", JSON.stringify({
      name: candidateName.trim(),
      email: candidateEmail.trim().toLowerCase(),
      phone: candidatePhone.trim(),
      gdpr_consent: true,
      trainer_name: trainerName.trim(),
    }));

    navigate("/placement-test/test");
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f8fafa" }}>
      <form onSubmit={handleLaunch} className="mx-4 w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <img src={LOGO_URL} alt="PEF" className="mx-auto mb-4 h-14 w-auto" />
          <UserPlus className="mx-auto h-10 w-10" style={{ color: "#17c3b2" }} />
          <h1 className="mt-3 text-xl font-bold" style={{ color: "#00504e" }}>Lancer un test</h1>
          <p className="mt-1 text-sm text-gray-500">Saisir les informations du candidat</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Votre nom (formateur)</label>
            <Input value={trainerName} onChange={(e) => setTrainerName(e.target.value)} placeholder="Nom du formateur" />
          </div>
          <hr />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nom du candidat *</label>
            <Input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Nom complet" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email du candidat *</label>
            <Input type="email" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} placeholder="email@exemple.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone du candidat</label>
            <Input type="tel" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} placeholder="06 12 34 56 78" />
          </div>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full text-white border-0"
          size="lg"
          style={{ background: "linear-gradient(135deg, #00504e 0%, #17c3b2 100%)" }}
        >
          Démarrer le test
        </Button>
      </form>
    </div>
  );
}
