import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DragMatchExerciseProps {
  pairs: { term: string; definition: string }[];
  onComplete: (isCorrect: boolean, score: number) => void;
}

function DraggableTerm({ id, children, disabled }: { id: string; children: string; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        "rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3 text-center font-medium cursor-grab active:cursor-grabbing select-none touch-none",
        isDragging && "opacity-50 shadow-lg z-50",
        disabled && "opacity-40 cursor-default"
      )}
    >
      {children}
    </div>
  );
}

function DroppableSlot({ id, children, matched, isCorrect }: { id: string; children: React.ReactNode; matched: string | null; isCorrect: boolean | null }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border-2 border-dashed p-3 min-h-[56px] flex items-center justify-center transition-colors",
        isOver && !matched && "border-primary bg-primary/10",
        matched && isCorrect === true && "border-green-500 bg-green-50",
        matched && isCorrect === false && "border-destructive bg-destructive/5",
        !matched && !isOver && "border-muted-foreground/30"
      )}
    >
      {matched ? (
        <div className="flex items-center gap-2">
          {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
          <span className="font-medium">{matched}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Glissez ici</span>
      )}
    </div>
  );
}

export function DragMatchExercise({ pairs, onComplete }: DragMatchExerciseProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  // Shuffle terms
  const [shuffledTerms] = useState(() =>
    [...pairs].sort(() => Math.random() - 0.5).map((p) => p.term)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const matchedTerms = new Set(Object.values(matches));
  const availableTerms = shuffledTerms.filter((t) => !matchedTerms.has(t));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const term = active.id as string;
    const defId = over.id as string;

    // Remove term from any previous slot
    setMatches((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (next[k] === term) delete next[k]; });
      next[defId] = term;
      return next;
    });
  }, []);

  const handleCheck = useCallback(() => {
    const res: Record<string, boolean> = {};
    let correct = 0;
    pairs.forEach((p) => {
      const matched = matches[p.definition];
      const isCorrect = matched === p.term;
      res[p.definition] = isCorrect;
      if (isCorrect) correct++;
    });
    setResults(res);
    setChecked(true);
    const score = Math.round((correct / pairs.length) * 100);
    onComplete(score >= 60, score);
  }, [matches, pairs, onComplete]);

  const handleReset = useCallback(() => {
    setMatches({});
    setResults({});
    setChecked(false);
  }, []);

  const allMatched = Object.keys(matches).length === pairs.length;

  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* Available terms */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Termes à placer :</p>
          <div className="flex flex-wrap gap-2">
            {availableTerms.map((term) => (
              <DraggableTerm key={term} id={term} disabled={checked}>
                {term}
              </DraggableTerm>
            ))}
            {availableTerms.length === 0 && !checked && (
              <p className="text-sm text-muted-foreground italic">Tous les termes sont placés !</p>
            )}
          </div>
        </div>

        {/* Definition slots */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Définitions :</p>
          {pairs.map((pair) => (
            <div key={pair.definition} className="grid grid-cols-2 gap-3 items-center">
              <div className="text-sm text-foreground">{pair.definition}</div>
              <DroppableSlot
                id={pair.definition}
                matched={matches[pair.definition] || null}
                isCorrect={checked ? results[pair.definition] ?? null : null}
              >
                {null}
              </DroppableSlot>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Correction for wrong answers */}
      {checked && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
            {pairs.map((p) =>
              !results[p.definition] ? (
                <p key={p.definition} className="text-sm text-muted-foreground">
                  ✏️ <strong>{p.term}</strong> → {p.definition}
                </p>
              ) : null
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="flex gap-3 justify-center">
        {!checked && allMatched && (
          <Button onClick={handleCheck} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Vérifier
          </Button>
        )}
        {checked && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Recommencer
          </Button>
        )}
      </div>
    </div>
  );
}
