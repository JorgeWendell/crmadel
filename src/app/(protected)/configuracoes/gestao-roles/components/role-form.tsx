"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createRoleAction } from "@/actions/create-role";
import { updateRoleAction } from "@/actions/update-role";

const roleFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

type Role = {
  id: string;
  name: string;
  description: string | null;
};

type RoleFormProps = {
  organizationId: string;
  role?: Role | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function RoleForm({
  organizationId,
  role,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: RoleFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!role;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (role && open) {
      form.reset({
        name: role.name,
        description: role.description || "",
      });
    } else if (!role && open) {
      form.reset({ name: "", description: "" });
    }
  }, [role, open, form]);

  const { execute: createRole } = useAction(createRoleAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Role cadastrada com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("role-changed"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar role");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updateRole } = useAction(updateRoleAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Role atualizada com sucesso!");
        setOpen(false);
        window.dispatchEvent(new Event("role-changed"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar role");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: RoleFormValues) => {
    if (isEditMode && role) {
      updateRole({ id: role.id, ...data });
    } else {
      createRole({ organizationId, ...data });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) form.reset();
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? "Editar Role" : "Cadastrar Role"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados da role"
            : "Preencha os dados para cadastrar uma nova role"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Administrador" {...field} />
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
                  <Input placeholder="Descrição opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !organizationId}>
              {isSubmitting
                ? isEditMode
                  ? "Atualizando..."
                  : "Cadastrando..."
                : isEditMode
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

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
        <Button disabled={!organizationId}>Cadastrar Role</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
