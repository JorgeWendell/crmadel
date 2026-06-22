"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createSalesPipelineWithStagesAction } from "@/actions/create-sales-pipeline-with-stages";
import { updateSalesPipelineAction } from "@/actions/update-sales-pipeline";
import { savePipelineStagesAction } from "@/actions/save-pipeline-stages";
import { getPipelineStagesAction } from "@/actions/get-pipeline-stages";
import { cn } from "@/lib/utils";
import { StagesEditor } from "./stages-editor";
import {
  createEmptyStage,
  getStageProbability,
  type PipelineSummary,
  type StageDraft,
} from "./pipeline-types";

const pipelineFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

type PipelineFormValues = z.infer<typeof pipelineFormSchema>;

type PipelineFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline?: PipelineSummary | null;
  onSaved?: (pipelineId: string) => void;
};

const tabs = [
  { id: "pipeline", label: "Funil" },
  { id: "stages", label: "Etapas" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function mapStagesForSave(stages: StageDraft[]) {
  return stages.map((stage, index) => ({
    id: stage.id,
    name: stage.name.trim(),
    description: stage.description,
    color: stage.color,
    probability: getStageProbability(index, stages.length),
  }));
}

function validateStages(stages: StageDraft[]): boolean {
  if (stages.length === 0) {
    toast.error("Adicione pelo menos uma etapa");
    return false;
  }

  const invalid = stages.some((s) => s.name.trim().length < 2);
  if (invalid) {
    toast.error("Preencha o nome de todas as etapas");
    return false;
  }

  return true;
}

export function PipelineFormDialog({
  open,
  onOpenChange,
  pipeline,
  onSaved,
}: PipelineFormDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [stages, setStages] = useState<StageDraft[]>([createEmptyStage(0)]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!pipeline;

  const form = useForm<PipelineFormValues>({
    resolver: zodResolver(pipelineFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      isDefault: false,
      isActive: true,
    },
  });

  const { execute: fetchStages } = useAction(getPipelineStagesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setStages(
          data.data.stages.map((stage) => ({
            id: stage.id,
            name: stage.name,
            description: stage.description || "",
            color: stage.color || undefined,
            probability: stage.probability,
          })),
        );
      }
    },
  });

  useEffect(() => {
    if (!open) return;

    setActiveTab("pipeline");

    if (pipeline) {
      setPipelineId(pipeline.id);
      form.reset({
        name: pipeline.name,
        description: pipeline.description || "",
        color: pipeline.color || "#3B82F6",
        isDefault: pipeline.isDefault,
        isActive: pipeline.isActive,
      });
      fetchStages({ pipelineId: pipeline.id });
    } else {
      setPipelineId(null);
      form.reset({
        name: "",
        description: "",
        color: "#3B82F6",
        isDefault: false,
        isActive: true,
      });
      setStages([
        createEmptyStage(0),
        createEmptyStage(1),
        createEmptyStage(2),
        createEmptyStage(3),
        createEmptyStage(4),
      ]);
    }
  }, [open, pipeline, form, fetchStages]);

  const finishSuccess = (id: string) => {
    toast.success(isEditMode ? "Funil atualizado com sucesso!" : "Funil criado com sucesso!");
    onSaved?.(id);
    onOpenChange(false);
    window.dispatchEvent(new Event("pipelines-changed"));
    setIsSubmitting(false);
  };

  const { execute: createPipelineWithStages } = useAction(
    createSalesPipelineWithStagesAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.id) {
          finishSuccess(data.id);
        } else if (data?.error) {
          toast.error(data.error);
          setIsSubmitting(false);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao criar funil");
        setIsSubmitting(false);
      },
    },
  );

  const { execute: updatePipeline } = useAction(updateSalesPipelineAction, {
    onSuccess: ({ data }) => {
      if (data?.success && pipelineId) {
        saveStages({
          pipelineId,
          stages: mapStagesForSave(stages),
        });
      } else if (data?.error) {
        toast.error(data.error);
        setIsSubmitting(false);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar funil");
      setIsSubmitting(false);
    },
  });

  const { execute: saveStages } = useAction(savePipelineStagesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && pipelineId) {
        finishSuccess(pipelineId);
      } else if (data?.error) {
        toast.error(data.error);
        setIsSubmitting(false);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao salvar etapas");
      setIsSubmitting(false);
    },
  });

  const goToStagesTab = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    setActiveTab("stages");
  };

  const handleSave = async () => {
    const pipelineValid = await form.trigger();
    if (!pipelineValid) {
      setActiveTab("pipeline");
      return;
    }

    if (!validateStages(stages)) {
      setActiveTab("stages");
      return;
    }

    const pipelineData = form.getValues();
    setIsSubmitting(true);

    if (isEditMode && pipelineId) {
      updatePipeline({ id: pipelineId, ...pipelineData });
      return;
    }

    createPipelineWithStages({
      ...pipelineData,
      stages: mapStagesForSave(stages),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Funil" : "Criar Funil"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize o funil e suas etapas"
              : "Preencha o funil e adicione pelo menos uma etapa para salvar"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === "stages") {
                  void goToStagesTab();
                  return;
                }
                setActiveTab(tab.id);
              }}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "pipeline" ? (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void goToStagesTab();
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do funil</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Funil de Vendas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Input type="color" className="h-10 w-16 p-1" {...field} />
                        <Input {...field} className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-y-0 space-x-3 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Funil padrão</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Continuar para etapas
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <StagesEditor stages={stages} onChange={setStages} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("pipeline")}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar funil"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
