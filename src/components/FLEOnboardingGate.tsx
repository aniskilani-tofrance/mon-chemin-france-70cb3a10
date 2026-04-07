import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic, Sparkles, ChevronDown, ArrowRight, GraduationCap, Target, Heart, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface FLEOnboardingGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FLEOnboardingGate({ open, onOpenChange }: FLEOnboardingGateProps) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none sm:rounded-3xl [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-2xl"
        >
          {/* Hero header with layered gradient */}
          <div className="relative px-6 pt-10 pb-8 text-center overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-px w-24 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.15, duration: 0.6 }}
              className="relative mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25"
            >
              <BookOpen className="h-8 w-8 text-primary-foreground" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="relative text-[22px] font-bold leading-tight text-foreground tracking-tight"
            >
              Débloquez votre parcours
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                de français
              </span>
            </motion.h2>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 space-y-5">
            {/* Main message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-center text-[15px] text-muted-foreground leading-relaxed"
            >
              Les cours de français sont accessibles après le parcours avec Marianne.
              Ce parcours nous permet de mieux comprendre votre situation et vos besoins pour un apprentissage{" "}
              <span className="font-semibold text-foreground">vraiment adapté</span>.
            </motion.p>

            {/* Benefits row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { icon: Target, label: "Personnalisé", color: "text-primary bg-primary/10" },
                { icon: GraduationCap, label: "Adapté", color: "text-success bg-success/10" },
                { icon: Heart, label: "Gratuit", color: "text-accent bg-accent/10" },
              ].map((pill, i) => (
                <motion.div
                  key={pill.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary/40 py-3 px-2"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${pill.color}`}>
                    <pill.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{pill.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Time indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Quelques minutes seulement</span>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="space-y-2.5"
            >
              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2 text-[15px] h-13 rounded-2xl"
                asChild
              >
                <Link to="/onboarding">
                  <Mic className="h-5 w-5" />
                  Commencer avec Marianne
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <button
                className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowWhy(!showWhy)}
              >
                Pourquoi ce parcours ?
                <motion.div
                  animate={{ rotate: showWhy ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.div>
              </button>
            </motion.div>

            {/* Expandable */}
            <AnimatePresence>
              {showWhy && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl bg-secondary/40 border border-border/40 p-4 space-y-3">
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      Le parcours avec Marianne vous donne accès à un contenu plus utile et efficace pour :
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Votre vie quotidienne en France",
                        "Vos démarches administratives",
                        "Votre projet professionnel",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-[13px] text-foreground/80">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
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
