import { z } from "zod";

export const ORGANIZATION_LANGUAGES = [
  { value: "pt-BR", label: "Português" },
  { value: "en", label: "Inglês" },
] as const;

export const ORGANIZATION_CURRENCIES = [
  { value: "BRL", label: "BRL" },
  { value: "USD", label: "USD" },
] as const;

export const organizationLanguageSchema = z.enum(["pt-BR", "en"]);
export const organizationCurrencySchema = z.enum(["BRL", "USD"]);

export type OrganizationLanguage = z.infer<typeof organizationLanguageSchema>;
export type OrganizationCurrency = z.infer<typeof organizationCurrencySchema>;
