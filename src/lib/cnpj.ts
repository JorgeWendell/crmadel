import { z } from "zod";

export function stripCnpj(value: string): string {
  return value.replace(/\D/g, "").slice(0, 14);
}

export function formatCnpj(value: string): string {
  const digits = stripCnpj(value);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function calculateCnpjDigit(numbers: number[], weights: number[]): number {
  const sum = numbers.reduce(
    (total, number, index) => total + number * weights[index],
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const digits = stripCnpj(value);

  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const numbers = digits.split("").map(Number);
  const firstDigit = calculateCnpjDigit(numbers.slice(0, 12), [
    5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);
  const secondDigit = calculateCnpjDigit(numbers.slice(0, 13), [
    6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);

  return numbers[12] === firstDigit && numbers[13] === secondDigit;
}

export const cnpjSchema = z
  .union([z.string(), z.literal("")])
  .optional()
  .refine((value) => !value || isValidCnpj(value), {
    message: "CNPJ inválido",
  });

export function normalizeCnpj(value?: string | null): string | null {
  if (!value) return null;
  const digits = stripCnpj(value);
  return digits.length > 0 ? digits : null;
}
