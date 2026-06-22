"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format-date";

export type ContactRow = {
  id: string;
  companyId: string;
  name: string;
  jobTitle: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  whatsapp: string | null;
  isPrimary: boolean;
  isActive: boolean;
  notes: string | null;
  updatedAt: Date;
  createdAt: Date;
  companyName: string;
  city: string | null;
  updatedByName: string | null;
};

type ContactViewDialogProps = {
  contact: ContactRow | null;
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

export function ContactViewDialog({
  contact,
  open,
  onOpenChange,
}: ContactViewDialogProps) {
  if (!contact) return null;

  const phone = contact.phone || contact.mobile || contact.whatsapp || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{contact.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Empresa" value={contact.companyName} />
          <Detail label="Cidade" value={contact.city || "—"} />
          <Detail label="Cargo" value={contact.jobTitle || "—"} />
          <Detail label="Departamento" value={contact.department || "—"} />
          <Detail label="Email" value={contact.email || "—"} />
          <Detail label="Telefone" value={phone} />
          <Detail
            label="Contato principal"
            value={contact.isPrimary ? "Sim" : "Não"}
          />
          <Detail
            label="Último contato"
            value={formatDateTime(contact.updatedAt)}
          />
          <Detail
            label="Atualizado por"
            value={contact.updatedByName || "—"}
          />
          <Detail
            label="Cadastrado em"
            value={formatDateTime(contact.createdAt)}
          />
        </div>
        {contact.notes && (
          <div>
            <p className="text-xs text-muted-foreground">Observações</p>
            <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
