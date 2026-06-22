import { z } from "zod";

export const createProductGroupSchema = z.object({
  familyId: z.string().min(1, "Selecione uma família"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductGroupSchema = createProductGroupSchema.extend({
  id: z.string().min(1),
});

export const deleteProductGroupSchema = z.object({
  id: z.string().min(1),
});
