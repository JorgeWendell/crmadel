"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCnpj } from "@/lib/cnpj";
import { getCompanyStatusLabel } from "@/lib/company-status";
import { formatDateTime } from "@/lib/format-date";

export type CompanyRow = {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  status: string;
  source: string;
  website: string | null;
  industry: string | null;
  notes: string | null;
  isActive: boolean;
  ownerId: string | null;
  ownerName: string | null;
  responsibleName: string | null;
  updatedAt: Date;
  createdAt: Date;
};

type CompanyViewDialogProps = {
  company: CompanyRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function CompanyViewDialog({
  company,
  open,
  onOpenChange,
}: CompanyViewDialogProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{company.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Nome fantasia" value={company.tradeName || "—"} />
          <Detail
            label="CNPJ"
            value={company.cnpj ? formatCnpj(company.cnpj) : "—"}
          />
          <Detail label="Responsável" value={company.responsibleName || "—"} />
          <Detail label="Cidade" value={company.city || "—"} />
          <Detail label="Email" value={company.email || "—"} />
          <Detail label="Telefone" value={company.phone || "—"} />
          <Detail label="Status" value={getCompanyStatusLabel(company.status)} />
          <Detail label="Vendedor" value={company.ownerName || "—"} />
          <Detail label="Setor" value={company.industry || "—"} />
          <Detail label="Website" value={company.website || "—"} />
          <Detail
            label="Último contato"
            value={formatDateTime(company.updatedAt)}
          />
          <Detail
            label="Cadastrado em"
            value={formatDateTime(company.createdAt)}
          />
        </div>
        {company.notes && (
          <div>
            <p className="text-xs text-muted-foreground">Observações</p>
            <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
