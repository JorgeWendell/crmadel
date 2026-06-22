"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { formatCurrencyDisplay } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { moveDealStageAction } from "@/actions/move-deal-stage";
import { getStageIcon, type DealCard, type PipelineStage } from "./pipeline-types";

type DealsKanbanProps = {
  stages: PipelineStage[];
  deals: DealCard[];
  isLoading?: boolean;
};

function DealCardItem({
  deal,
  stageId,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOverStage,
  onDropOnStage,
}: {
  deal: DealCard;
  stageId: string;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOverStage: (stageId: string) => void;
  onDropOnStage: (stageId: string, dealId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/deal-id", deal.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOverStage(stageId);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const dealId = e.dataTransfer.getData("text/deal-id");
        if (dealId) onDropOnStage(stageId, dealId);
      }}
      className={cn(
        "cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow active:cursor-grabbing hover:shadow-md dark:border-slate-700 dark:bg-slate-950",
        isDragging && "opacity-50",
        isDropTarget && "ring-2 ring-blue-400 ring-offset-1",
      )}
    >
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
        {deal.title}
      </h4>

      <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {formatCurrencyDisplay(deal.value)}
      </p>

      {deal.companyName && (
        <p className="mt-2 truncate text-xs text-muted-foreground">
          {deal.companyName}
          {deal.contactName ? ` · ${deal.contactName}` : ""}
        </p>
      )}

      {deal.ownerName && (
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {deal.ownerName}
        </p>
      )}

      {deal.tags && (
        <p className="mt-2 truncate text-xs text-blue-600 dark:text-blue-400">
          {deal.tags}
        </p>
      )}
    </div>
  );
}

export function DealsKanban({ stages, deals, isLoading }: DealsKanbanProps) {
  const [localDeals, setLocalDeals] = useState(deals);
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [dropTargetStageId, setDropTargetStageId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const { execute: moveDeal } = useAction(moveDealStageAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        window.dispatchEvent(new Event("deals-changed"));
      } else if (data?.error) {
        toast.error(data.error);
        setLocalDeals(deals);
      }
      setDraggingDealId(null);
      setDropTargetStageId(null);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao mover negócio");
      setLocalDeals(deals);
      setDraggingDealId(null);
      setDropTargetStageId(null);
    },
  });

  const handleDrop = (stageId: string, dealId: string) => {
    const deal = localDeals.find((item) => item.id === dealId);
    if (!deal || deal.stageId === stageId) {
      setDraggingDealId(null);
      setDropTargetStageId(null);
      return;
    }

    setLocalDeals((current) =>
      current.map((item) =>
        item.id === dealId ? { ...item, stageId } : item,
      ),
    );

    moveDeal({ dealId, stageId });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Carregando funil...
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        <p className="text-sm">Este funil ainda não possui etapas.</p>
        <p className="mt-1 text-xs">
          Edite o funil e adicione etapas na aba &quot;Etapas&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-h-[calc(100vh-280px)] min-w-max gap-0">
        {stages.map((stage, index) => {
          const Icon = getStageIcon(index);
          const stageDeals = localDeals.filter(
            (deal) => deal.stageId === stage.id,
          );
          const isDropTarget = dropTargetStageId === stage.id;

          return (
            <div
              key={stage.id}
              className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 last:border-r-0 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-5 w-5 shrink-0"
                    style={{ color: stage.color || "#94A3B8" }}
                  />
                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {stage.name}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stageDeals.length}{" "}
                  {stageDeals.length === 1 ? "negócio" : "negócios"}
                </p>
              </div>

              <div
                className={cn(
                  "flex min-h-[200px] flex-1 flex-col gap-2 p-3 transition-colors",
                  isDropTarget && "bg-blue-50/80 dark:bg-blue-950/30",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDropTargetStageId(stage.id);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropTargetStageId((current) =>
                      current === stage.id ? null : current,
                    );
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const dealId =
                    e.dataTransfer.getData("text/deal-id") || draggingDealId;
                  if (dealId) handleDrop(stage.id, dealId);
                }}
              >
                {stageDeals.length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-muted-foreground dark:border-slate-700",
                      isDropTarget && "border-blue-400 bg-blue-50/50",
                    )}
                  >
                    {isDropTarget ? "Solte aqui" : "Nenhum negócio"}
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <DealCardItem
                      key={deal.id}
                      deal={deal}
                      stageId={stage.id}
                      isDragging={draggingDealId === deal.id}
                      isDropTarget={
                        isDropTarget && draggingDealId !== deal.id
                      }
                      onDragStart={() => setDraggingDealId(deal.id)}
                      onDragEnd={() => {
                        setDraggingDealId(null);
                        setDropTargetStageId(null);
                      }}
                      onDragOverStage={setDropTargetStageId}
                      onDropOnStage={handleDrop}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
