import { z } from "zod";
import { cnpjSchema } from "@/lib/cnpj";
import {
  organizationCurrencySchema,
  organizationLanguageSchema,
} from "@/lib/organization-options";

export const updateOrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  tradeName: z.string().optional(),
  cnpj: cnpjSchema,
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  language: organizationLanguageSchema,
  currency: organizationCurrencySchema,
  isActive: z.boolean(),
});
