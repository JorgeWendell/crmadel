import { z } from "zod";

export const createProductFamilySchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductFamilySchema = createProductFamilySchema.extend({
  id: z.string().min(1),
});

export const deleteProductFamilySchema = z.object({
  id: z.string().min(1),
});
