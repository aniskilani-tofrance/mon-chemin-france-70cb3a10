import { motion } from "framer-motion";
import marianneAvatar from "@/assets/marianne-avatar.png";

type AgentState = "idle" | "listening" | "speaking" | "processing" | "thinking";

interface AnimatedAgentProps {
  state: AgentState;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AnimatedAgent({ 
  state, 
  onClick, 
  disabled = false,
  size = "lg" 
}: AnimatedAgentProps) {
  const sizeMap = { sm: 80, md: 140, lg: 200 };
  const s = sizeMap[size];

  const bodyAnim = () => {
    if (state === "speaking") return { y: [0, -3, 0], transition: { duration: 0.6, repeat: Infinity } };
    if (state === "listening") return { scale: [1, 1.02, 1], transition: { duration: 0.8, repeat: Infinity } };
    if (state === "processing" || state === "thinking") return { rotate: [0, 1, -1, 0], transition: { duration: 2, repeat: Infinity } };
    return { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } };
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
      style={{ width: s, height: s }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-[-12px] rounded-full bg-primary/15 blur-2xl"
        animate={{
          scale: state === "listening" ? [1, 1.4, 1] : state === "speaking" ? [1, 1.25, 1] : [1, 1.1, 1],
          opacity: state === "idle" ? [0.1, 0.25, 0.1] : [0.2, 0.45, 0.2],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Pulse rings for listening */}
      {state === "listening" && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive/40"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive/20"
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </>
      )}

      {/* Speaking sound waves */}
      {state === "speaking" && (
        <>
          <motion.div
            className="absolute -right-2 top-1/2 h-6 w-1 rounded-full bg-primary/40"
            animate={{ scaleY: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -right-4 top-1/2 h-4 w-1 rounded-full bg-primary/30"
            animate={{ scaleY: [1, 2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
          />
        </>
      )}

      {/* Main avatar image */}
      <motion.div
        className="relative z-10 overflow-hidden rounded-full"
        style={{ width: s, height: s }}
        animate={bodyAnim()}
      >
        <img
          src={marianneAvatar}
          alt="Marianne – votre conseillère ToFrance"
          className="h-full w-full object-cover object-top"
          draggable={false}
        />
        
        {/* Overlay for processing state */}
        {(state === "processing" || state === "thinking") && (
          <motion.div
            className="absolute inset-0 bg-primary/10"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Status indicator dot */}
      <motion.div
        className="absolute -bottom-1 -right-1 z-20 flex items-center justify-center rounded-full border-2 border-background"
        style={{ width: s * 0.22, height: s * 0.22 }}
        animate={
          state === "listening"
            ? { backgroundColor: ["hsl(0,84%,60%)", "hsl(0,84%,45%)", "hsl(0,84%,60%)"], transition: { duration: 0.8, repeat: Infinity } }
            : state === "speaking"
            ? { backgroundColor: "hsl(142,76%,36%)" }
            : state === "processing" || state === "thinking"
            ? { backgroundColor: ["hsl(45,93%,47%)", "hsl(45,93%,60%)", "hsl(45,93%,47%)"], transition: { duration: 1, repeat: Infinity } }
            : { backgroundColor: "hsl(142,76%,36%)" }
        }
      >
        <span className="text-white" style={{ fontSize: s * 0.09 }}>
          {state === "listening" ? "🎤" : state === "speaking" ? "🔊" : state === "processing" || state === "thinking" ? "🤔" : "✓"}
        </span>
      </motion.div>
    </motion.button>
  );
}
