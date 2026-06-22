"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";

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
import { createProductFamilyAction } from "@/actions/create-product-family";
import { updateProductFamilyAction } from "@/actions/update-product-family";

const familyFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type FamilyFormValues = z.infer<typeof familyFormSchema>;

export type FamilyRow = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type CreatedFamily = {
  id: string;
  name: string;
};

type FamilyFormProps = {
  family?: FamilyRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreateGroup?: (family: CreatedFamily) => void;
};

export function FamilyForm({
  family,
  open: controlledOpen,
  onOpenChange,
  onCreateGroup,
}: FamilyFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdFamily, setCreatedFamily] = useState<CreatedFamily | null>(
    null,
  );
  const isEditMode = !!family;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: { name: "", description: "", isActive: true },
  });

  const resetDialog = () => {
    form.reset({ name: "", description: "", isActive: true });
    setCreatedFamily(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetDialog();
  };

  useEffect(() => {
    if (family && open) {
      setCreatedFamily(null);
      form.reset({
        name: family.name,
        description: family.description || "",
        isActive: family.isActive,
      });
    } else if (!family && open) {
      resetDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family, open]);

  const { execute: createFamily } = useAction(createProductFamilyAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.id) {
        toast.success("Família cadastrada com sucesso!");
        const name = form.getValues("name");
        setCreatedFamily({ id: data.id, name });
        window.dispatchEvent(new Event("products-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao cadastrar família"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updateFamily } = useAction(updateProductFamilyAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Família atualizada com sucesso!");
        setOpen(false);
        window.dispatchEvent(new Event("products-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao atualizar família"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: FamilyFormValues) => {
    if (isEditMode && family) {
      updateFamily({ id: family.id, ...data });
    } else {
      createFamily(data);
    }
  };

  const handleCreateGroup = () => {
    if (!createdFamily) return;
    onCreateGroup?.(createdFamily);
    setOpen(false);
    resetDialog();
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {createdFamily
            ? "Família criada"
            : isEditMode
              ? "Editar Família"
              : "Adicionar Família"}
        </DialogTitle>
        <DialogDescription>
          {createdFamily
            ? `A família "${createdFamily.name}" foi cadastrada. Você pode criar um grupo agora ou fechar.`
            : isEditMode
              ? "Altere os dados da família de produtos"
              : "Cadastre uma nova família de produtos"}
        </DialogDescription>
      </DialogHeader>

      {createdFamily ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {createdFamily.name}
          </p>
          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
            Pronta para receber grupos de produtos.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Eletrônicos" {...field} />
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
                  <FormLabel>Ativa</FormLabel>
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

      {createdFamily && (
        <DialogFooter className="sm:justify-between">
          {onCreateGroup ? (
            <Button type="button" variant="secondary" onClick={handleCreateGroup}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Criar grupo
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
        <Button>Adicionar Família</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
