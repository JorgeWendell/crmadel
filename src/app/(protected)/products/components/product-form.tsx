"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Plus } from "lucide-react";

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
import { createProductAction } from "@/actions/create-product";
import { updateProductAction } from "@/actions/update-product";
import { getProductGroupsAction } from "@/actions/get-product-groups";
import {
  PRODUCT_TYPE_OPTIONS,
  UNIT_MEASURE_OPTIONS,
  productTypeSchema,
  unitMeasureSchema,
} from "@/lib/product-options";
import { cn } from "@/lib/utils";

const productFormSchema = z.object({
  groupId: z.string().min(1, "Selecione um grupo"),
  code: z.string().min(1, "O código é obrigatório"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  unit: z.enum(unitMeasureSchema),
  type: z.enum(productTypeSchema),
  unitPrice: z.string().optional(),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export type ProductRow = {
  id: string;
  groupId: string;
  groupName: string;
  familyName: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  type: string;
  unitPrice: string | null;
  isActive: boolean;
};

type CreatedProduct = {
  id: string;
  name: string;
  code: string;
  groupId: string;
};

type GroupOption = {
  id: string;
  name: string;
  familyName: string;
};

type ProductFormProps = {
  product?: ProductRow | null;
  defaultGroupId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
);

export function ProductForm({
  product,
  defaultGroupId,
  open: controlledOpen,
  onOpenChange,
}: ProductFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [createdProduct, setCreatedProduct] = useState<CreatedProduct | null>(
    null,
  );
  const [lastGroupId, setLastGroupId] = useState("");
  const isEditMode = !!product;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      groupId: "",
      code: "",
      name: "",
      description: "",
      unit: "UN",
      type: "PRODUCT",
      unitPrice: "0",
      isActive: true,
    },
  });

  const resetDialog = (groupId = defaultGroupId || lastGroupId || "") => {
    form.reset({
      groupId,
      code: "",
      name: "",
      description: "",
      unit: "UN",
      type: "PRODUCT",
      unitPrice: "0",
      isActive: true,
    });
    setCreatedProduct(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetDialog();
  };

  const { execute: fetchGroups } = useAction(getProductGroupsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setGroups(
          data.data.map((g) => ({
            id: g.id,
            name: g.name,
            familyName: g.familyName,
          })),
        );
      }
    },
  });

  useEffect(() => {
    if (open) fetchGroups({});
  }, [open, fetchGroups]);

  useEffect(() => {
    if (product && open) {
      setCreatedProduct(null);
      form.reset({
        groupId: product.groupId,
        code: product.code,
        name: product.name,
        description: product.description || "",
        unit: product.unit as ProductFormValues["unit"],
        type: product.type as ProductFormValues["type"],
        unitPrice: product.unitPrice || "0",
        isActive: product.isActive,
      });
    } else if (!product && open) {
      resetDialog(defaultGroupId || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, open, defaultGroupId]);

  const { execute: createProduct } = useAction(createProductAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.id) {
        toast.success("Produto cadastrado com sucesso!");
        const groupId = form.getValues("groupId");
        setLastGroupId(groupId);
        setCreatedProduct({
          id: data.id,
          name: form.getValues("name"),
          code: form.getValues("code"),
          groupId,
        });
        window.dispatchEvent(new Event("products-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao cadastrar produto"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updateProduct } = useAction(updateProductAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Produto atualizado com sucesso!");
        setOpen(false);
        window.dispatchEvent(new Event("products-changed"));
      } else if (data?.error) toast.error(data.error);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || "Erro ao atualizar produto"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEditMode && product) {
      updateProduct({ id: product.id, ...data });
    } else {
      createProduct(data);
    }
  };

  const handleAddAnother = () => {
    if (!createdProduct) return;
    resetDialog(createdProduct.groupId);
  };

  const dialogContent = (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>
          {createdProduct
            ? "Produto criado"
            : isEditMode
              ? "Editar Produto"
              : "Adicionar Produto"}
        </DialogTitle>
        <DialogDescription>
          {createdProduct
            ? `O produto "${createdProduct.name}" foi cadastrado. Você pode adicionar outro ou fechar.`
            : isEditMode
              ? "Altere os dados do produto"
              : "Cadastre um novo produto vinculado a um grupo"}
        </DialogDescription>
      </DialogHeader>

      {createdProduct ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {createdProduct.name}
          </p>
          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
            Código: {createdProduct.code}
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo</FormLabel>
                  <FormControl>
                    <select
                      className={selectClassName}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="">Selecione um grupo</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.familyName} / {group.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU-001" {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <select
                        className={selectClassName}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {UNIT_MEASURE_OPTIONS.map((option) => (
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <select
                        className={selectClassName}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
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
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço unitário</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
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

      {createdProduct && (
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="secondary" onClick={handleAddAnother}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar outro
          </Button>
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
        <Button>Adicionar Produto</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
