export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function stripCep(value: string): string {
  return value.replace(/\D/g, "");
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = stripCep(cep);
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (!response.ok) {
    throw new Error("Erro ao consultar CEP");
  }

  const data: ViaCepResponse = await response.json();

  if (data.erro) {
    return null;
  }

  return data;
}
