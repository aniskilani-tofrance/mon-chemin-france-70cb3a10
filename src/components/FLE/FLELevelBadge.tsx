import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  alpha: { label: "Alpha", color: "bg-orange-100 text-orange-700 border-orange-200", emoji: "🌱" },
  post_alpha: { label: "Post-Alpha", color: "bg-amber-100 text-amber-700 border-amber-200", emoji: "🌿" },
  a1: { label: "A1", color: "bg-sky-100 text-sky-700 border-sky-200", emoji: "⭐" },
  a2: { label: "A2", color: "bg-blue-100 text-blue-700 border-blue-200", emoji: "🌟" },
  b1: { label: "B1", color: "bg-indigo-100 text-indigo-700 border-indigo-200", emoji: "💫" },
};

interface FLELevelBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FLELevelBadge({ level, size = "md", className }: FLELevelBadgeProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.a1;
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
