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
import { createCompanyAction } from "@/actions/create-company";
import { updateCompanyAction } from "@/actions/update-company";
import { getUsersAction } from "@/actions/get-users";
import {
  COMPANY_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
} from "@/lib/company-status";
import { formatCnpj } from "@/lib/cnpj";
import { cn } from "@/lib/utils";
import type { CompanyRow } from "./company-view-dialog";

const companyFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  status: z.enum([
    "LEAD",
    "PROSPECT",
    "CUSTOMER",
    "PARTNER",
    "SUPPLIER",
    "INACTIVE",
  ]),
  source: z.enum([
    "MANUAL",
    "SITE",
    "WHATSAPP",
    "FACEBOOK",
    "INSTAGRAM",
    "GOOGLE",
    "INDICATION",
    "API",
    "IMPORT",
  ]),
  website: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  ownerId: z.string().optional(),
  isActive: z.boolean(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

type UserOption = { id: string; name: string };

type CompanyFormProps = {
  company?: CompanyRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
);

export function CompanyForm({
  company,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: CompanyFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const isEditMode = !!company;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      tradeName: "",
      cnpj: "",
      email: "",
      phone: "",
      city: "",
      status: "LEAD",
      source: "MANUAL",
      website: "",
      industry: "",
      notes: "",
      ownerId: "",
      isActive: true,
    },
  });

  const { execute: fetchUsers } = useAction(getUsersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setUsers(data.data.map((u) => ({ id: u.id, name: u.name })));
      }
    },
  });

  useEffect(() => {
    if (open) fetchUsers({});
  }, [open, fetchUsers]);

  useEffect(() => {
    if (company && open) {
      form.reset({
        name: company.name,
        tradeName: company.tradeName || "",
        cnpj: company.cnpj ? formatCnpj(company.cnpj) : "",
        email: company.email || "",
        phone: company.phone || "",
        city: company.city || "",
        status: company.status as CompanyFormValues["status"],
        source: company.source as CompanyFormValues["source"],
        website: company.website || "",
        industry: company.industry || "",
        notes: company.notes || "",
        ownerId: company.ownerId || "",
        isActive: company.isActive,
      });
    } else if (!company && open) {
      form.reset({
        name: "",
        tradeName: "",
        cnpj: "",
        email: "",
        phone: "",
        city: "",
        status: "LEAD",
        source: "MANUAL",
        website: "",
        industry: "",
        notes: "",
        ownerId: "",
        isActive: true,
      });
    }
  }, [company, open, form]);

  const { execute: createCompany } = useAction(createCompanyAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Empresa cadastrada com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("contacts-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao cadastrar empresa"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updateCompany } = useAction(updateCompanyAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Empresa atualizada com sucesso!");
        setOpen(false);
        window.dispatchEvent(new Event("contacts-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao atualizar empresa"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: CompanyFormValues) => {
    const payload = {
      ...data,
      ownerId: data.ownerId || undefined,
    };
    if (isEditMode && company) {
      updateCompany({ id: company.id, ...payload });
    } else {
      createCompany(payload);
    }
  };

  const dialogContent = (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? "Editar Empresa" : "Cadastrar Empresa"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados da empresa cliente"
            : "Cadastre uma nova empresa cliente"}
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
                  <Input placeholder="Razão social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome fantasia</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      {...field}
                      onChange={(e) =>
                        field.onChange(formatCnpj(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      className={selectClassName}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {COMPANY_STATUS_OPTIONS.map((option) => (
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
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendedor</FormLabel>
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
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Empresa ativa</FormLabel>
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
        <Button>Cadastrar Empresa</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
