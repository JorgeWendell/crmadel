import { z } from "zod";

const companyStatusSchema = z.enum([
  "LEAD",
  "PROSPECT",
  "CUSTOMER",
  "PARTNER",
  "SUPPLIER",
  "INACTIVE",
]);

const leadSourceSchema = z.enum([
  "MANUAL",
  "SITE",
  "WHATSAPP",
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE",
  "INDICATION",
  "API",
  "IMPORT",
]);

export const createCompanySchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  status: companyStatusSchema.default("LEAD"),
  source: leadSourceSchema.default("MANUAL"),
  website: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  ownerId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateCompanySchema = createCompanySchema.extend({
  id: z.string().min(1),
});

export const deleteCompanySchema = z.object({
  id: z.string().min(1),
});
