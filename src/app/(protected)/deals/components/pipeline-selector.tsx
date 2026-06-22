"use client";

import { ChevronDown, Plus, Banknote } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PipelineSummary } from "./pipeline-types";

type PipelineSelectorProps = {
  pipelines: PipelineSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
};

export function PipelineSelector({
  pipelines,
  selectedId,
  onSelect,
  onCreateClick,
}: PipelineSelectorProps) {
  const selected = pipelines.find((p) => p.id === selectedId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Funil</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <span className="flex items-center gap-2 truncate">
              <Banknote
                className="h-4 w-4 shrink-0 text-green-600"
                style={{ color: selected?.color || undefined }}
              />
              {selected?.name || "Selecione um funil"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {pipelines.length === 0 ? (
            <DropdownMenuItem disabled>Nenhum funil criado</DropdownMenuItem>
          ) : (
            pipelines.map((pipeline) => (
              <DropdownMenuItem
                key={pipeline.id}
                onClick={() => onSelect(pipeline.id)}
                className={cn(
                  selectedId === pipeline.id && "bg-accent font-medium",
                )}
              >
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: pipeline.color || "#3B82F6" }}
                />
                {pipeline.name}
                {pipeline.isDefault && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Padrão
                  </span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Criar
      </Button>
    </div>
  );
}
