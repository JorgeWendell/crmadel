export const UNIT_MEASURE_OPTIONS = [
  { value: "UN", label: "Unidade (UN)" },
  { value: "CX", label: "Caixa (CX)" },
  { value: "PC", label: "Peça (PC)" },
  { value: "KG", label: "Quilograma (KG)" },
  { value: "G", label: "Grama (G)" },
  { value: "L", label: "Litro (L)" },
  { value: "ML", label: "Mililitro (ML)" },
  { value: "M", label: "Metro (M)" },
  { value: "CM", label: "Centímetro (CM)" },
  { value: "MM", label: "Milímetro (MM)" },
  { value: "M2", label: "Metro² (M2)" },
  { value: "M3", label: "Metro³ (M3)" },
  { value: "KIT", label: "Kit (KIT)" },
  { value: "PAR", label: "Par (PAR)" },
  { value: "OUTRO", label: "Outro" },
] as const;

export const PRODUCT_TYPE_OPTIONS = [
  { value: "PRODUCT", label: "Produto" },
  { value: "SERVICE", label: "Serviço" },
] as const;

export type UnitMeasure = (typeof UNIT_MEASURE_OPTIONS)[number]["value"];
export type ProductType = (typeof PRODUCT_TYPE_OPTIONS)[number]["value"];

export function getUnitMeasureLabel(unit: string): string {
  return (
    UNIT_MEASURE_OPTIONS.find((option) => option.value === unit)?.label ?? unit
  );
}

export function getProductTypeLabel(type: string): string {
  return (
    PRODUCT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}

export const unitMeasureSchema = [
  "UN",
  "CX",
  "PC",
  "KG",
  "G",
  "L",
  "ML",
  "M",
  "CM",
  "MM",
  "M2",
  "M3",
  "KIT",
  "PAR",
  "OUTRO",
] as const;

export const productTypeSchema = ["PRODUCT", "SERVICE"] as const;
