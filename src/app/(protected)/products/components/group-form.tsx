"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createProductGroupAction } from "@/actions/create-product-group";
import { updateProductGroupAction } from "@/actions/update-product-group";
import { getProductFamiliesAction } from "@/actions/get-product-families";
import { cn } from "@/lib/utils";

const groupFormSchema = z.object({
  familyId: z.string().min(1, "Selecione uma família"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

export type GroupRow = {
  id: string;
  familyId: string;
  familyName: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type CreatedGroup = {
  id: string;
  name: string;
  familyName: string;
};

type FamilyOption = { id: string; name: string };

type GroupFormProps = {
  group?: GroupRow | null;
  defaultFamilyId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreateProduct?: (group: CreatedGroup) => void;
};

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
);

export function GroupForm({
  group,
  defaultFamilyId,
  open: controlledOpen,
  onOpenChange,
  onCreateProduct,
}: GroupFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [families, setFamilies] = useState<FamilyOption[]>([]);
  const [createdGroup, setCreatedGroup] = useState<CreatedGroup | null>(null);
  const isEditMode = !!group;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      familyId: "",
      name: "",
      description: "",
      isActive: true,
    },
  });

  const resetDialog = () => {
    form.reset({
      familyId: defaultFamilyId || "",
      name: "",
      description: "",
      isActive: true,
    });
    setCreatedGroup(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetDialog();
  };

  const { execute: fetchFamilies } = useAction(getProductFamiliesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setFamilies(data.data.map((f) => ({ id: f.id, name: f.name })));
      }
    },
  });

  useEffect(() => {
    if (open) fetchFamilies({});
  }, [open, fetchFamilies]);

  useEffect(() => {
    if (group && open) {
      setCreatedGroup(null);
      form.reset({
        familyId: group.familyId,
        name: group.name,
        description: group.description || "",
        isActive: group.isActive,
      });
    } else if (!group && open) {
      resetDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, open, defaultFamilyId]);

  const { execute: createGroup } = useAction(createProductGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.id) {
        toast.success("Grupo cadastrado com sucesso!");
        const name = form.getValues("name");
        const familyId = form.getValues("familyId");
        const familyName =
          families.find((f) => f.id === familyId)?.name || "—";
        setCreatedGroup({ id: data.id, name, familyName });
        window.dispatchEvent(new Event("products-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao cadastrar grupo"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updateGroup } = useAction(updateProductGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Grupo atualizado com sucesso!");
        setOpen(false);
        window.dispatchEvent(new Event("products-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao atualizar grupo"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: GroupFormValues) => {
    if (isEditMode && group) {
      updateGroup({ id: group.id, ...data });
    } else {
      createGroup(data);
    }
  };

  const handleCreateProduct = () => {
    if (!createdGroup) return;
    onCreateProduct?.(createdGroup);
    setOpen(false);
    resetDialog();
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {createdGroup
            ? "Grupo criado"
            : isEditMode
              ? "Editar Grupo"
              : "Adicionar Grupo"}
        </DialogTitle>
        <DialogDescription>
          {createdGroup
            ? `O grupo "${createdGroup.name}" foi cadastrado. Você pode criar um produto agora ou fechar.`
            : isEditMode
              ? "Altere os dados do grupo de produtos"
              : "Cadastre um novo grupo vinculado a uma família"}
        </DialogDescription>
      </DialogHeader>

      {createdGroup ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {createdGroup.name}
          </p>
          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
            Família: {createdGroup.familyName}
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="familyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Família</FormLabel>
                  <FormControl>
                    <select
                      className={selectClassName}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="">Selecione uma família</option>
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.name}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Smartphones" {...field} />
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
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Ativo</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : isEditMode
                    ? "Salvar"
                    : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}

      {createdGroup && (
        <DialogFooter className="sm:justify-between">
          {onCreateProduct ? (
            <Button type="button" variant="secondary" onClick={handleCreateProduct}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Criar produto
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  );

  if (controlledOpen !== undefined) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Adicionar Grupo</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
