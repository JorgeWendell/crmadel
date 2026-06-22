"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TablePagination,
  TABLE_PAGE_SIZE,
} from "@/components/ui/table-pagination";
import { getContactsAction } from "@/actions/get-contacts";
import { deleteContactAction } from "@/actions/delete-contact";
import { formatDateTime } from "@/lib/format-date";
import { ContactForm } from "./contact-form";
import {
  ContactViewDialog,
  type ContactRow,
} from "./contact-view-dialog";

export function ContactsTable() {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingContact, setEditingContact] = useState<ContactRow | null>(
    null,
  );
  const [viewContact, setViewContact] = useState<ContactRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const paginated = contacts.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );

  const { execute: fetchContacts } = useAction(getContactsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setContacts(data.data as ContactRow[]);
      } else if (data?.error) {
        toast.error(data.error);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar contatos");
      setIsLoading(false);
    },
  });

  const { execute: deleteContact } = useAction(deleteContactAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Contato excluído com sucesso!");
        fetchContacts({});
        setDeleteDialogOpen(false);
        setContactToDelete(null);
      }
    },
    onError: () => toast.error("Erro ao excluir contato"),
  });

  useEffect(() => {
    fetchContacts({});
  }, [fetchContacts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [contacts.length]);

  useEffect(() => {
    const handleChange = () => fetchContacts({});
    window.addEventListener("contacts-changed", handleChange);
    return () => window.removeEventListener("contacts-changed", handleChange);
  }, [fetchContacts]);

  const handleRowClick = (contact: ContactRow) => {
    setViewContact(contact);
    setViewDialogOpen(true);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ContactForm />
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Último contato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  Nenhum contato cadastrado
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(contact)}
                >
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.companyName}</TableCell>
                  <TableCell>{contact.city || "—"}</TableCell>
                  <TableCell>{formatDateTime(contact.updatedAt)}</TableCell>
                  <TableCell>
                    {contact.phone || contact.mobile || "—"}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingContact(contact);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setContactToDelete(contact.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          totalItems={contacts.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={TABLE_PAGE_SIZE}
        />
      </div>

      <ContactForm
        contact={editingContact}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingContact(null);
        }}
      />

      <ContactViewDialog
        contact={viewContact}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contato? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                contactToDelete && deleteContact({ id: contactToDelete })
              }
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
