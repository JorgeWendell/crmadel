"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
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
import { getOrganizationsAction } from "@/actions/get-organizations";
import { deleteOrganizationAction } from "@/actions/delete-organization";
import { formatCnpj } from "@/lib/cnpj";
import { OrganizationForm } from "./organization-form";
import { OrganizationUsersDialog } from "./organization-users-dialog";

type Organization = {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  slug: string;
  language: string;
  currency: string;
  isActive: boolean;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export function OrganizationsTable() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const paginated = organizations.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );

  const { execute: fetchOrganizations } = useAction(getOrganizationsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setOrganizations(data.data);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar empresas");
      setIsLoading(false);
    },
  });

  const { execute: deleteOrganization } = useAction(deleteOrganizationAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Empresa excluída com sucesso!");
        fetchOrganizations({});
        setDeleteDialogOpen(false);
        setOrgToDelete(null);
      }
    },
    onError: () => toast.error("Erro ao excluir empresa"),
  });

  useEffect(() => {
    fetchOrganizations({});
  }, [fetchOrganizations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [organizations.length]);

  useEffect(() => {
    const handleChange = () => fetchOrganizations({});
    window.addEventListener("organization-changed", handleChange);
    return () =>
      window.removeEventListener("organization-changed", handleChange);
  }, [fetchOrganizations]);

  const handleDeleteConfirm = () => {
    if (orgToDelete) deleteOrganization({ id: orgToDelete });
  };

  const handleManageUsers = (org: Organization) => {
    setSelectedOrganization(org);
    setUsersDialogOpen(true);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Usuários</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground py-8 text-center"
              >
                Nenhuma empresa cadastrada
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">
                  <div>{org.name}</div>
                  {org.tradeName && (
                    <div className="text-xs text-muted-foreground">
                      {org.tradeName}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {org.cnpj ? formatCnpj(org.cnpj) : "—"}
                </TableCell>
                <TableCell>{org.email || "—"}</TableCell>
                <TableCell>{org.memberCount}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      org.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {org.isActive ? "Ativa" : "Inativa"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleManageUsers(org)}>
                        <Users className="mr-2 h-4 w-4" />
                        Usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingOrganization(org);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setOrgToDelete(org.id);
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
        totalItems={organizations.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={TABLE_PAGE_SIZE}
      />

      <OrganizationForm
        organization={editingOrganization}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingOrganization(null);
        }}
      />

      <OrganizationUsersDialog
        organization={selectedOrganization}
        open={usersDialogOpen}
        onOpenChange={setUsersDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta empresa? Usuários vinculados e
              roles serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
