import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FLEStatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function FLEStatsCard({ icon, label, value, subtitle, color = "text-primary" }: FLEStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-4 text-center"
    >
      <div className={`${color}`}>{icon}</div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {subtitle && <span className="text-[10px] text-muted-foreground/60">{subtitle}</span>}
    </motion.div>
  );
}
