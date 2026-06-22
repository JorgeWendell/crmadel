"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Filter, LayoutGrid, Settings, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSalesPipelinesAction } from "@/actions/get-sales-pipelines";
import { getPipelineStagesAction } from "@/actions/get-pipeline-stages";
import { getDealsAction } from "@/actions/get-deals";
import { PipelineSelector } from "./pipeline-selector";
import { PipelineFormDialog } from "./pipeline-form-dialog";
import { DealFormDialog } from "./deal-form-dialog";
import { DealsKanban } from "./deals-kanban";
import type { DealCard, PipelineStage, PipelineSummary } from "./pipeline-types";

export function DealsPage() {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null,
  );
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<DealCard[]>([]);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(true);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { execute: fetchPipelines } = useAction(getSalesPipelinesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        const list = data.data as PipelineSummary[];
        setPipelines(list);

        setSelectedPipelineId((current) => {
          if (current && list.some((p) => p.id === current)) return current;
          const defaultPipeline = list.find((p) => p.isDefault);
          return defaultPipeline?.id ?? list[0]?.id ?? null;
        });
      } else if (data?.error) {
        toast.error(data.error);
      }
      setIsLoadingPipelines(false);
    },
    onError: () => {
      toast.error("Erro ao carregar funis");
      setIsLoadingPipelines(false);
    },
  });

  const { execute: fetchStages } = useAction(getPipelineStagesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setStages(data.data.stages as PipelineStage[]);
      } else if (data?.error) {
        toast.error(data.error);
        setStages([]);
      }
      setIsLoadingStages(false);
    },
    onError: () => {
      toast.error("Erro ao carregar etapas");
      setStages([]);
      setIsLoadingStages(false);
    },
  });

  const { execute: fetchDeals } = useAction(getDealsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setDeals(data.data as DealCard[]);
      } else if (data?.error) {
        toast.error(data.error);
        setDeals([]);
      }
    },
    onError: () => {
      toast.error("Erro ao carregar negócios");
      setDeals([]);
    },
  });

  const loadBoard = useCallback(
    (pipelineId: string, search?: string) => {
      setIsLoadingStages(true);
      fetchStages({ pipelineId });
      fetchDeals({ pipelineId, search: search || undefined });
    },
    [fetchStages, fetchDeals],
  );

  const loadPipelines = useCallback(() => {
    setIsLoadingPipelines(true);
    fetchPipelines({});
  }, [fetchPipelines]);

  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  useEffect(() => {
    if (!selectedPipelineId) {
      setStages([]);
      setDeals([]);
      return;
    }
    loadBoard(selectedPipelineId, searchQuery);
  }, [selectedPipelineId, searchQuery, loadBoard]);

  useEffect(() => {
    const handleChange = () => {
      loadPipelines();
      if (selectedPipelineId) {
        loadBoard(selectedPipelineId, searchQuery);
      }
    };
    window.addEventListener("pipelines-changed", handleChange);
    window.addEventListener("deals-changed", handleChange);
    return () => {
      window.removeEventListener("pipelines-changed", handleChange);
      window.removeEventListener("deals-changed", handleChange);
    };
  }, [loadPipelines, selectedPipelineId, searchQuery, loadBoard]);

  const handlePipelineSaved = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    loadBoard(pipelineId, searchQuery);
  };

  if (isLoadingPipelines) {
    return (
      <div className="p-6 py-8 text-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-950">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Negócios
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gerencie seu funil de vendas e negócios
          </p>
        </div>

        <PipelineSelector
          pipelines={pipelines}
          selectedId={selectedPipelineId}
          onSelect={setSelectedPipelineId}
          onCreateClick={() => setCreateDialogOpen(true)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-950">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquise título ou pelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Exibir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Em breve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Em breve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Funil
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Em breve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Em breve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          disabled={!selectedPipelineId || stages.length === 0}
          onClick={() => setDealDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {!selectedPipelineId ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <p className="text-sm">Nenhum funil selecionado.</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              Criar seu primeiro funil
            </Button>
          </div>
        ) : (
          <DealsKanban
            stages={stages}
            deals={deals}
            isLoading={isLoadingStages}
          />
        )}
      </div>

      <PipelineFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSaved={handlePipelineSaved}
      />

      <DealFormDialog
        open={dealDialogOpen}
        onOpenChange={setDealDialogOpen}
        pipelines={pipelines}
        defaultPipelineId={selectedPipelineId}
        onSaved={() => {
          if (selectedPipelineId) {
            loadBoard(selectedPipelineId, searchQuery);
          }
        }}
      />
    </div>
  );
}
