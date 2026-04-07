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

export function FLEStatsCard({ icon, label, value, subtitle, color = "text-primary", bgGradient }: FLEStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-2xl border border-border/40 p-3 text-center overflow-hidden",
        "bg-gradient-to-br",
        bgGradient || "from-card to-card"
      )}
    >
      <div className={cn("relative z-10", color)}>
        {icon}
      </div>
      <motion.span
        className="relative z-10 text-xl font-extrabold text-foreground"
        key={String(value)}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {value}
      </motion.span>
      <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {subtitle && <span className="text-[10px] text-muted-foreground/60">{subtitle}</span>}
    </motion.div>
  );
}
