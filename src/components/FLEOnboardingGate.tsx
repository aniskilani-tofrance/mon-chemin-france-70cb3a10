import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic, Sparkles, ChevronDown, ArrowRight, GraduationCap, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface FLEOnboardingGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FLEOnboardingGate({ open, onOpenChange }: FLEOnboardingGateProps) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-none sm:rounded-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-2xl"
        >
          {/* Gradient header */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 pt-8 pb-6 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5 blur-xl" />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.5 }}
              className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
            >
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-primary-foreground"
            >
              Débloquez votre parcours de français
            </motion.h2>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-5">
            {/* Main message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-muted-foreground leading-relaxed"
            >
              Les cours de français sont accessibles après le parcours avec Marianne.
              Ce parcours nous permet de mieux comprendre votre situation, votre niveau et vos besoins pour vous proposer un apprentissage{" "}
              <span className="font-semibold text-foreground">vraiment adapté</span>.
            </motion.p>

            {/* Benefits pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {[
                { icon: Target, label: "Personnalisé" },
                { icon: Sparkles, label: "Adapté à votre niveau" },
                { icon: Heart, label: "Gratuit" },
              ].map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  <pill.icon className="h-3 w-3" />
                  {pill.label}
                </span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2 text-base"
                asChild
              >
                <Link to="/onboarding">
                  <Mic className="h-5 w-5" />
                  Commencer le parcours avec Marianne
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowWhy(!showWhy)}
              >
                <GraduationCap className="h-4 w-4" />
                Pourquoi ce parcours ?
                <motion.div
                  animate={{ rotate: showWhy ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Expandable explanation */}
            <AnimatePresence>
              {showWhy && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      Commencez d'abord le parcours avec Marianne pour activer vos cours.
                      Cela ne prend que <span className="font-medium text-foreground">quelques minutes</span> et vous permettra d'accéder à un contenu plus utile, plus personnalisé et plus efficace pour :
                    </p>
                    <ul className="mt-3 space-y-2">
                      {[
                        "Votre vie quotidienne en France",
                        "Vos démarches administratives",
                        "Votre projet professionnel",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                            <Sparkles className="h-3 w-3 text-primary" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
