export const COMPANY_STATUS_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "CUSTOMER", label: "Cliente" },
  { value: "PARTNER", label: "Parceiro" },
  { value: "SUPPLIER", label: "Fornecedor" },
  { value: "INACTIVE", label: "Inativo" },
] as const;

export type CompanyStatus = (typeof COMPANY_STATUS_OPTIONS)[number]["value"];

export function getCompanyStatusLabel(status: string): string {
  return (
    COMPANY_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export const LEAD_SOURCE_OPTIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "SITE", label: "Site" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "GOOGLE", label: "Google" },
  { value: "INDICATION", label: "Indicação" },
  { value: "API", label: "API" },
  { value: "IMPORT", label: "Importação" },
] as const;
