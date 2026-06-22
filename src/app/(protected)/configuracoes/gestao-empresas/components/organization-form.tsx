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
import { createOrganizationAction } from "@/actions/create-organization";
import { updateOrganizationAction } from "@/actions/update-organization";
import {
  ORGANIZATION_CURRENCIES,
  ORGANIZATION_LANGUAGES,
  organizationCurrencySchema,
  organizationLanguageSchema,
} from "@/lib/organization-options";
import { cnpjSchema, formatCnpj } from "@/lib/cnpj";
import { cn } from "@/lib/utils";

const organizationFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  tradeName: z.string().optional(),
  cnpj: cnpjSchema,
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  language: organizationLanguageSchema,
  currency: organizationCurrencySchema,
  isActive: z.boolean(),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

type Organization = {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  language: string;
  currency: string;
  isActive: boolean;
};

type OrganizationFormProps = {
  organization?: Organization | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
);

export function OrganizationForm({
  organization,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: OrganizationFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!organization;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      tradeName: "",
      cnpj: "",
      email: "",
      phone: "",
      language: "pt-BR",
      currency: "BRL",
      isActive: true,
    },
  });

  useEffect(() => {
    if (organization && open) {
      form.reset({
        name: organization.name,
        tradeName: organization.tradeName || "",
        cnpj: organization.cnpj ? formatCnpj(organization.cnpj) : "",
        email: organization.email || "",
        phone: organization.phone || "",
        language:
          organization.language === "en" ? "en" : "pt-BR",
        currency: organization.currency === "USD" ? "USD" : "BRL",
        isActive: organization.isActive,
      });
    } else if (!organization && open) {
      form.reset({
        name: "",
        tradeName: "",
        cnpj: "",
        email: "",
        phone: "",
        language: "pt-BR",
        currency: "BRL",
        isActive: true,
      });
    }
  }, [organization, open, form]);

  const { execute: createOrganization } = useAction(createOrganizationAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Empresa cadastrada com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("organization-changed"));
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar empresa");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updateOrganization } = useAction(updateOrganizationAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Empresa atualizada com sucesso!");
        setOpen(false);
        window.dispatchEvent(new Event("organization-changed"));
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar empresa");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: OrganizationFormValues) => {
    if (isEditMode && organization) {
      updateOrganization({ id: organization.id, ...data });
    } else {
      createOrganization(data);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) form.reset();
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? "Editar Empresa" : "Cadastrar Empresa"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados da empresa"
            : "Preencha os dados para cadastrar uma nova empresa"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razão social</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Empresa LTDA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tradeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome fantasia</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Minha Empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00.000.000/0000-00"
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@empresa.com"
                      {...field}
                    />
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
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
                  <FormControl>
                    <select
                      className={selectClassName}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {ORGANIZATION_LANGUAGES.map((option) => (
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
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <FormControl>
                    <select
                      className={selectClassName}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {ORGANIZATION_CURRENCIES.map((option) => (
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
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Empresa ativa</FormLabel>
                </div>
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
        <Button>Cadastrar Empresa</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
