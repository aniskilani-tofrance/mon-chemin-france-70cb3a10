import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FLEStatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  bgGradient?: string;
}

const GRADIENTS = [
  "from-amber-400/20 to-orange-400/10",
  "from-sky-400/20 to-blue-400/10",
  "from-violet-400/20 to-purple-400/10",
  "from-emerald-400/20 to-green-400/10",
];

export function FLEStatsCard({ icon, label, value, subtitle, color = "text-primary", bgGradient }: FLEStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-2xl border-2 border-border/50 p-4 text-center overflow-hidden cursor-default",
        "bg-gradient-to-br",
        bgGradient || "from-card to-card"
      )}
    >
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-primary/5 blur-xl" />

      <motion.div
        className={cn("relative z-10", color)}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <motion.span
        className="relative z-10 text-2xl font-extrabold text-foreground"
        key={String(value)}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {value}
      </motion.span>
      <span className="relative z-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {subtitle && <span className="text-[10px] text-muted-foreground/60">{subtitle}</span>}
    </motion.div>
  );
}
