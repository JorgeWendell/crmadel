"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  ListFilter,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createDealAction } from "@/actions/create-deal";
import { getPipelineStagesAction } from "@/actions/get-pipeline-stages";
import { getCompaniesAction } from "@/actions/get-companies";
import { getContactsAction } from "@/actions/get-contacts";
import { getUsersAction } from "@/actions/get-users";
import { getProductsAction } from "@/actions/get-products";
import { authClient } from "@/lib/auth-client";
import { LEAD_SOURCE_OPTIONS } from "@/lib/company-status";
import { formatCurrencyInput } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { StageStepper } from "./stage-stepper";
import type { PipelineStage, PipelineSummary } from "./pipeline-types";

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
);

const dealFormSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  value: z.string().optional(),
  tags: z.string().optional(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  source: z
    .enum([
      "MANUAL",
      "SITE",
      "WHATSAPP",
      "FACEBOOK",
      "INSTAGRAM",
      "GOOGLE",
      "INDICATION",
      "API",
      "IMPORT",
    ])
    .optional(),
  ownerId: z.string().optional(),
  startDate: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

type Option = { id: string; name: string };

type DealFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelines: PipelineSummary[];
  defaultPipelineId: string | null;
  onSaved?: () => void;
};

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function MultiSelectField({
  label,
  options,
  selectedIds,
  onChange,
  placeholder,
}: {
  label: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
}) {
  const selected = options.filter((option) => selectedIds.includes(option.id));

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="min-h-9 rounded-lg border border-input px-2 py-1.5 dark:bg-input/30">
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800"
            >
              {item.name}
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {selected.length === 0 ? placeholder : "+ Adicionar"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <DropdownMenuItem disabled>Nenhuma opção</DropdownMenuItem>
              ) : (
                options.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => toggle(option.id)}
                  >
                    <span
                      className={cn(
                        selectedIds.includes(option.id) && "font-medium",
                      )}
                    >
                      {option.name}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function DealFormDialog({
  open,
  onOpenChange,
  pipelines,
  defaultPipelineId,
  onSaved,
}: DealFormDialogProps) {
  const { data: session } = authClient.useSession();
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [showMoreInfo, setShowMoreInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [contacts, setContacts] = useState<
    Array<Option & { companyId: string }>
  >([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);

  const selectedPipeline = pipelines.find((p) => p.id === pipelineId);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      value: "",
      tags: "",
      companyId: "",
      contactId: "",
      source: undefined,
      ownerId: "",
      startDate: getTodayDateInputValue(),
    },
  });

  const companyId = form.watch("companyId");

  const filteredContacts = useMemo(
    () =>
      companyId
        ? contacts.filter((contact) => contact.companyId === companyId)
        : [],
    [contacts, companyId],
  );

  const { execute: fetchStages } = useAction(getPipelineStagesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        const nextStages = data.data.stages as PipelineStage[];
        setStages(nextStages);
        setSelectedStageId((current) => {
          if (current && nextStages.some((stage) => stage.id === current)) {
            return current;
          }
          return nextStages[0]?.id ?? null;
        });
      } else {
        setStages([]);
        setSelectedStageId(null);
      }
    },
  });

  const { execute: fetchCompanies } = useAction(getCompaniesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setCompanies(data.data.map((c) => ({ id: c.id, name: c.name })));
      }
    },
  });

  const { execute: fetchContacts } = useAction(getContactsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setContacts(
          data.data.map((c) => ({
            id: c.id,
            name: c.name,
            companyId: c.companyId,
          })),
        );
      }
    },
  });

  const { execute: fetchUsers } = useAction(getUsersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setUsers(data.data.map((u) => ({ id: u.id, name: u.name })));
      }
    },
  });

  const { execute: fetchProducts } = useAction(getProductsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setProducts(data.data.map((p) => ({ id: p.id, name: p.name })));
      }
    },
  });

  const { execute: createDeal } = useAction(createDealAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Negócio criado com sucesso!");
        onOpenChange(false);
        onSaved?.();
        window.dispatchEvent(new Event("deals-changed"));
      } else if (data?.error) {
        toast.error(data.error);
      }
      setIsSubmitting(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar negócio");
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (!open) return;

    const initialPipelineId =
      defaultPipelineId && pipelines.some((p) => p.id === defaultPipelineId)
        ? defaultPipelineId
        : pipelines[0]?.id ?? null;

    setPipelineId(initialPipelineId);
    setCollaboratorIds([]);
    setProductIds([]);
    setShowMoreInfo(true);
    form.reset({
      title: "",
      value: "",
      tags: "",
      companyId: "",
      contactId: "",
      source: undefined,
      ownerId: session?.user?.id ?? "",
      startDate: getTodayDateInputValue(),
    });

    fetchCompanies({});
    fetchContacts({});
    fetchUsers({});
    fetchProducts({});
  }, [
    open,
    defaultPipelineId,
    pipelines,
    form,
    session?.user?.id,
    fetchCompanies,
    fetchContacts,
    fetchUsers,
    fetchProducts,
  ]);

  useEffect(() => {
    if (!open || !pipelineId) {
      setStages([]);
      setSelectedStageId(null);
      return;
    }
    fetchStages({ pipelineId });
  }, [open, pipelineId, fetchStages]);

  useEffect(() => {
    form.setValue("contactId", "");
  }, [companyId, form]);

  const onSubmit = (data: DealFormValues) => {
    if (!pipelineId) {
      toast.error("Selecione um funil");
      return;
    }
    if (!selectedStageId) {
      toast.error("Selecione uma etapa do funil");
      return;
    }

    setIsSubmitting(true);
    createDeal({
      pipelineId,
      stageId: selectedStageId,
      title: data.title,
      value: data.value,
      tags: data.tags,
      companyId: data.companyId || undefined,
      contactId: data.contactId || undefined,
      source: data.source,
      ownerId: data.ownerId || undefined,
      startDate: data.startDate,
      collaboratorIds,
      productIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[760px]">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <span className="text-lg font-semibold">Novo Negócio em</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[180px] justify-between">
                <span className="flex items-center gap-2 truncate">
                  <Banknote
                    className="h-4 w-4 shrink-0"
                    style={{ color: selectedPipeline?.color || "#22C55E" }}
                  />
                  {selectedPipeline?.name || "Selecione"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              {pipelines.map((pipeline) => (
                <DropdownMenuItem
                  key={pipeline.id}
                  onClick={() => setPipelineId(pipeline.id)}
                >
                  {pipeline.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border-b px-6 py-3">
          <StageStepper
            stages={stages}
            selectedStageId={selectedStageId}
            onSelect={setSelectedStageId}
          />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="space-y-4 overflow-y-auto px-6 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <select
                            className={selectClassName}
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="">Selecione</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <ListFilter className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                            R$
                          </span>
                          <Input
                            className="pl-10"
                            placeholder="0,00"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(formatCurrencyInput(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <select
                            className={cn(
                              selectClassName,
                              !companyId && "cursor-not-allowed opacity-60",
                            )}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!companyId}
                          >
                            <option value="">Selecione</option>
                            {filteredContacts.map((contact) => (
                              <option key={contact.id} value={contact.id}>
                                {contact.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <ListFilter className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marcadores</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem</FormLabel>
                      <FormControl>
                        <select
                          className={selectClassName}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? (e.target.value as DealFormValues["source"])
                                : undefined,
                            )
                          }
                        >
                          <option value="">Selecione</option>
                          {LEAD_SOURCE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowMoreInfo((current) => !current)}
                className="flex w-full items-center justify-between rounded-md bg-slate-100 px-4 py-2 text-sm font-medium dark:bg-slate-800"
              >
                Outras informações
                {showMoreInfo ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showMoreInfo && (
                <div className="space-y-4 rounded-md border p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="ownerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável</FormLabel>
                          <FormControl>
                            <select
                              className={selectClassName}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="">Selecione</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Início</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <MultiSelectField
                    label="Usuários colaboradores"
                    options={users}
                    selectedIds={collaboratorIds}
                    onChange={setCollaboratorIds}
                    placeholder="Selecione usuários"
                  />

                  <MultiSelectField
                    label="Produtos relacionados"
                    options={products}
                    selectedIds={productIds}
                    onChange={setProductIds}
                    placeholder="Selecione produtos"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
