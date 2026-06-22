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
import { createContactAction } from "@/actions/create-contact";
import { updateContactAction } from "@/actions/update-contact";
import { getCompaniesAction } from "@/actions/get-companies";
import { cn } from "@/lib/utils";
import type { ContactRow } from "./contact-view-dialog";

const contactFormSchema = z.object({
  companyId: z.string().min(1, "Selecione uma empresa"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  isPrimary: z.boolean(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

type CompanyOption = { id: string; name: string };

type ContactFormProps = {
  contact?: ContactRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
);

export function ContactForm({
  contact,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: ContactFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const isEditMode = !!contact;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      companyId: "",
      name: "",
      jobTitle: "",
      department: "",
      email: "",
      phone: "",
      mobile: "",
      whatsapp: "",
      isPrimary: false,
      notes: "",
      isActive: true,
    },
  });

  const { execute: fetchCompanies } = useAction(getCompaniesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setCompanies(
          data.data.map((c) => ({ id: c.id, name: c.name })),
        );
      }
    },
  });

  useEffect(() => {
    if (open) fetchCompanies({});
  }, [open, fetchCompanies]);

  useEffect(() => {
    if (contact && open) {
      form.reset({
        companyId: contact.companyId,
        name: contact.name,
        jobTitle: contact.jobTitle || "",
        department: contact.department || "",
        email: contact.email || "",
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        whatsapp: contact.whatsapp || "",
        isPrimary: contact.isPrimary,
        notes: contact.notes || "",
        isActive: contact.isActive,
      });
    } else if (!contact && open) {
      form.reset({
        companyId: "",
        name: "",
        jobTitle: "",
        department: "",
        email: "",
        phone: "",
        mobile: "",
        whatsapp: "",
        isPrimary: false,
        notes: "",
        isActive: true,
      });
    }
  }, [contact, open, form]);

  const { execute: createContact } = useAction(createContactAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Contato cadastrado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("contacts-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao cadastrar contato"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updateContact } = useAction(updateContactAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Contato atualizado com sucesso!");
        setOpen(false);
        window.dispatchEvent(new Event("contacts-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao atualizar contato"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: ContactFormValues) => {
    if (isEditMode && contact) {
      updateContact({ id: contact.id, ...data });
    } else {
      createContact(data);
    }
  };

  const dialogContent = (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? "Editar Pessoa" : "Cadastrar Pessoa"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados do contato"
            : "Cadastre um novo contato vinculado a uma empresa"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <select
                    className={selectClassName}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
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
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPrimary"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-y-0 space-x-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Contato principal da empresa</FormLabel>
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
                <FormLabel>Contato ativo</FormLabel>
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
                ? isEditMode
                  ? "Salvando..."
                  : "Cadastrando..."
                : isEditMode
                  ? "Salvar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) form.reset();
        }}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  if (controlledOpen !== undefined) {
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) form.reset();
        }}
      >
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Cadastrar Pessoa</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
