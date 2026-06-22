"use client";

import { cn } from "@/lib/utils";
import type { PipelineStage } from "./pipeline-types";

type StageStepperProps = {
  stages: PipelineStage[];
  selectedStageId: string | null;
  onSelect: (stageId: string) => void;
};

export function StageStepper({
  stages,
  selectedStageId,
  onSelect,
}: StageStepperProps) {
  if (stages.length === 0) return null;

  return (
    <div className="flex w-full overflow-x-auto">
      {stages.map((stage, index) => {
        const isActive = stage.id === selectedStageId;
        const isLast = index === stages.length - 1;

        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onSelect(stage.id)}
            className={cn(
              "relative flex min-w-0 flex-1 items-center justify-center px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
              !isLast &&
                "after:absolute after:top-0 after:right-0 after:z-10 after:h-full after:w-4 after:translate-x-1/2 after:skew-x-[-20deg] after:content-['']",
              !isLast &&
                (isActive
                  ? "after:bg-violet-600"
                  : "after:bg-slate-100 dark:after:bg-slate-800"),
            )}
            style={{
              clipPath: isLast
                ? undefined
                : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)",
              marginLeft: index > 0 ? "-8px" : undefined,
              zIndex: stages.length - index,
            }}
          >
            <span className="truncate">{stage.name}</span>
          </button>
        );
      })}
    </div>
  );
}
