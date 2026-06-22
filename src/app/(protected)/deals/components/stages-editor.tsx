"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createEmptyStage,
  DEFAULT_STAGE_COLORS,
  type StageDraft,
} from "./pipeline-types";

type StagesEditorProps = {
  stages: StageDraft[];
  onChange: (stages: StageDraft[]) => void;
};

export function StagesEditor({ stages, onChange }: StagesEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...stages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const updateStage = (index: number, patch: Partial<StageDraft>) => {
    onChange(
      stages.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)),
    );
  };

  const addStage = () => {
    onChange([...stages, createEmptyStage(stages.length)]);
  };

  const removeStage = (index: number) => {
    onChange(stages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Arraste para reordenar as etapas do funil.
      </p>

      {stages.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nenhuma etapa adicionada
        </div>
      ) : (
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div
              key={stage.id || `draft-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "flex items-start gap-2 rounded-lg border bg-card p-3 transition-opacity",
                dragIndex === index && "opacity-50",
              )}
            >
              <button
                type="button"
                className="mt-2 cursor-grab text-muted-foreground active:cursor-grabbing"
                aria-label="Arrastar etapa"
              >
                <GripVertical className="h-4 w-4" />
              </button>

              <div
                className="mt-2 h-4 w-4 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    stage.color ||
                    DEFAULT_STAGE_COLORS[index % DEFAULT_STAGE_COLORS.length],
                }}
              />

              <Input
                className="flex-1"
                placeholder="Nome da etapa"
                value={stage.name}
                onChange={(e) => updateStage(index, { name: e.target.value })}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-1 shrink-0"
                onClick={() => removeStage(index)}
                disabled={stages.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={addStage} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adicionar etapa
      </Button>
    </div>
  );
}
