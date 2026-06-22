import { z } from "zod";

export const createContactSchema = z.object({
  companyId: z.string().min(1, "Selecione uma empresa"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateContactSchema = createContactSchema.extend({
  id: z.string().min(1),
});

export const deleteContactSchema = z.object({
  id: z.string().min(1),
});
