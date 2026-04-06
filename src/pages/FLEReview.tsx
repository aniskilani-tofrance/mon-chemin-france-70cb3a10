import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FLEReview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Révision</h1>
          <p className="text-muted-foreground mb-6">
            Tout est à jour ! Revenez demain pour réviser vos exercices 🎉
          </p>
          <Button onClick={() => navigate("/fle")} variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Retour au dashboard
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default FLEReview;
