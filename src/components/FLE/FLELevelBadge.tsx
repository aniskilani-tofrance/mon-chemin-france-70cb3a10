import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<string, { label: string; gradient: string; border: string; emoji: string; shadow: string }> = {
  alpha: { label: "Alpha", gradient: "from-orange-400 to-amber-500", border: "border-orange-300", emoji: "🌱", shadow: "shadow-orange-200/40" },
  post_alpha: { label: "Post-α", gradient: "from-amber-400 to-yellow-500", border: "border-amber-300", emoji: "🌿", shadow: "shadow-amber-200/40" },
  a1: { label: "A1", gradient: "from-sky-400 to-blue-500", border: "border-sky-300", emoji: "⭐", shadow: "shadow-sky-200/40" },
  a2: { label: "A2", gradient: "from-blue-400 to-indigo-500", border: "border-blue-300", emoji: "🌟", shadow: "shadow-blue-200/40" },
  b1: { label: "B1", gradient: "from-purple-400 to-violet-500", border: "border-purple-300", emoji: "💫", shadow: "shadow-purple-200/40" },
};

interface FLELevelBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FLELevelBadge({ level, size = "md", className }: FLELevelBadgeProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.a1;
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-0.5",
    md: "text-xs px-3 py-1 gap-1",
    lg: "text-sm px-4 py-1.5 gap-1.5",
  };

  return (
    <motion.span
      whileHover={{ scale: 1.1 }}
      className={cn(
        "inline-flex items-center rounded-full border-2 font-extrabold text-white shadow-md",
        `bg-gradient-to-r ${config.gradient}`,
        config.border,
        config.shadow,
        sizeClasses[size],
        className
      )}
    >
      <span>{config.emoji}</span>
      <span className="drop-shadow-sm">{config.label}</span>
    </motion.span>
  );
}
