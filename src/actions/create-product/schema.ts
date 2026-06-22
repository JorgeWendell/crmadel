import { z } from "zod";

import {
  productTypeSchema,
  unitMeasureSchema,
} from "@/lib/product-options";

export const createProductSchema = z.object({
  groupId: z.string().min(1, "Selecione um grupo"),
  code: z.string().min(1, "O código é obrigatório"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  unit: z.enum(unitMeasureSchema),
  type: z.enum(productTypeSchema).default("PRODUCT"),
  unitPrice: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1),
});

export const deleteProductSchema = z.object({
  id: z.string().min(1),
});
