import { motion } from "framer-motion";
import { CheckCircle2, Lock, PlayCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FLELevelBadge } from "./FLELevelBadge";
import { playDing, playWhoosh } from "@/lib/sounds";

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

const NODE_COLORS = [
  { bg: "from-sky-400/20 to-blue-400/10", border: "border-sky-300 dark:border-sky-700", glow: "shadow-sky-200/30" },
  { bg: "from-violet-400/20 to-purple-400/10", border: "border-violet-300 dark:border-violet-700", glow: "shadow-violet-200/30" },
  { bg: "from-emerald-400/20 to-green-400/10", border: "border-emerald-300 dark:border-emerald-700", glow: "shadow-emerald-200/30" },
  { bg: "from-amber-400/20 to-orange-400/10", border: "border-amber-300 dark:border-amber-700", glow: "shadow-amber-200/30" },
  { bg: "from-rose-400/20 to-pink-400/10", border: "border-rose-300 dark:border-rose-700", glow: "shadow-rose-200/30" },
  { bg: "from-teal-400/20 to-cyan-400/10", border: "border-teal-300 dark:border-teal-700", glow: "shadow-teal-200/30" },
];

export function FLEPathwayMap({ modules, onModuleClick }: FLEPathwayMapProps) {
  return (
    <div className="relative space-y-2">
      {modules.map((module, index) => {
        const isAccessible = module.unlocked || module.completed;
        const isLast = index === modules.length - 1;
        const colorSet = NODE_COLORS[index % NODE_COLORS.length];
        const isNext = isAccessible && !module.completed && module.progress === 0;

        return (
          <div key={module.id} className="relative">
            {/* Connector */}
            {!isLast && (
              <div className={cn(
                "absolute left-[31px] top-[62px] w-1 h-4 rounded-full",
                isAccessible ? "bg-primary/30" : "bg-border/40"
              )} />
            )}

            <motion.button
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, type: "spring", stiffness: 200 }}
              whileHover={isAccessible ? { scale: 1.02, x: 6 } : {}}
              whileTap={isAccessible ? { scale: 0.97 } : {}}
              onClick={() => { if (isAccessible) { playDing(); onModuleClick(module.id); } }}
              className={cn(
                "relative flex items-center gap-3 w-full rounded-2xl px-3 py-3 text-left transition-all",
                isAccessible
                  ? "cursor-pointer"
                  : "opacity-30 cursor-not-allowed",
                isNext && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
              )}
            >
              {/* Node */}
              <motion.div
                animate={isNext ? { y: [0, -3, 0] } : {}}
                transition={isNext ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
                className={cn(
                  "flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border-2 text-2xl transition-all shadow-md",
                  module.completed
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-100 to-green-50 dark:from-emerald-950/40 dark:to-green-950/20 shadow-emerald-200/40"
                    : isAccessible
                    ? cn("bg-gradient-to-br", colorSet.bg, colorSet.border, colorSet.glow)
                    : "border-border/30 bg-muted/20"
                )}
              >
                {module.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </motion.div>
                ) : !module.unlocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground/30" />
                ) : (
                  <span>{module.icon}</span>
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-bold text-sm truncate",
                    isAccessible ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {module.title}
                  </h3>
                  <FLELevelBadge level={module.cecrlLevel} size="sm" />
                </div>

                {/* Progress bar */}
                {isAccessible && module.progress > 0 && !module.completed && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 max-w-[180px] rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${module.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent-foreground"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-primary">{module.progress}%</span>
                  </div>
                )}

                {module.completed && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-1">Terminé !</span>
                  </div>
                )}

                {isNext && (
                  <p className="text-xs text-primary font-medium mt-1">Prochaine étape →</p>
                )}
              </div>

              {/* Action */}
              {isAccessible && !module.completed && (
                <motion.div
                  animate={isNext ? { scale: [1, 1.15, 1] } : {}}
                  transition={isNext ? { repeat: Infinity, duration: 1.5 } : {}}
                >
                  <PlayCircle className="h-6 w-6 text-primary shrink-0" />
                </motion.div>
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}
