import { motion } from "framer-motion";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FLELevelBadge } from "./FLELevelBadge";

interface PathwayModule {
  id: string;
  title: string;
  icon: string;
  cecrlLevel: string;
  durationMinutes: number;
  progress: number;
  unlocked: boolean;
  completed: boolean;
}

interface FLEPathwayMapProps {
  modules: PathwayModule[];
  onModuleClick: (moduleId: string) => void;
}

export function FLEPathwayMap({ modules, onModuleClick }: FLEPathwayMapProps) {
  return (
    <div className="relative">
      {modules.map((module, index) => {
        const isAccessible = module.unlocked || module.completed;
        const isLast = index === modules.length - 1;

        return (
          <div key={module.id} className="relative">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[27px] top-[56px] w-0.5 h-6 bg-border/60" />
            )}

            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={isAccessible ? { x: 4 } : {}}
              whileTap={isAccessible ? { scale: 0.98 } : {}}
              onClick={() => isAccessible && onModuleClick(module.id)}
              className={cn(
                "relative flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left transition-all mb-1",
                isAccessible
                  ? "hover:bg-accent cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              )}
            >
              {/* Node circle */}
              <div
                className={cn(
                  "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl border-2 text-2xl transition-colors",
                  module.completed
                    ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                    : module.unlocked && module.progress > 0
                    ? "border-primary bg-primary/5"
                    : module.unlocked
                    ? "border-border bg-card"
                    : "border-border/40 bg-muted/30"
                )}
              >
                {module.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : !module.unlocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground/40" />
                ) : (
                  <span>{module.icon}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-semibold text-sm truncate",
                    isAccessible ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {module.title}
                  </h3>
                  <FLELevelBadge level={module.cecrlLevel} size="sm" />
                </div>
                {isAccessible && module.progress > 0 && !module.completed && (
                  <div className="mt-1.5 h-1.5 w-full max-w-[200px] rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                )}
                {module.completed && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Terminé ✓</p>
                )}
              </div>

              {/* Action indicator */}
              {isAccessible && !module.completed && (
                <PlayCircle className="h-5 w-5 text-primary shrink-0" />
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}
