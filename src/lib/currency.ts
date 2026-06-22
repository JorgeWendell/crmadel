export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const number = Number(digits) / 100;
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyInput(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;

  const number = Number(digits) / 100;
  return number.toFixed(2);
}

export function formatCurrencyDisplay(value: string | null | undefined): string {
  if (!value) return "R$ 0,00";

  const number = Number(value);
  if (Number.isNaN(number)) return "R$ 0,00";

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
