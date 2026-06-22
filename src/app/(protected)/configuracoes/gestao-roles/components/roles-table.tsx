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
import { getRolesAction } from "@/actions/get-roles";
import { deleteRoleAction } from "@/actions/delete-role";
import { RoleForm } from "./role-form";
import { RoleUsersDialog } from "./role-users-dialog";

type Role = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type RolesTableProps = {
  organizationId: string;
};

export function RolesTable({ organizationId }: RolesTableProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const paginated = roles.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );

  const { execute: fetchRoles } = useAction(getRolesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setRoles(data.data);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar roles");
      setIsLoading(false);
    },
  });

  const { execute: deleteRole } = useAction(deleteRoleAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Role excluída com sucesso!");
        fetchRoles({ organizationId });
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
      }
    },
    onError: () => toast.error("Erro ao excluir role"),
  });

  useEffect(() => {
    if (organizationId) {
      setIsLoading(true);
      fetchRoles({ organizationId });
    } else {
      setRoles([]);
    }
  }, [organizationId, fetchRoles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roles.length]);

  useEffect(() => {
    const handleChange = () => {
      if (organizationId) fetchRoles({ organizationId });
    };
    window.addEventListener("role-changed", handleChange);
    return () => window.removeEventListener("role-changed", handleChange);
  }, [organizationId, fetchRoles]);

  const handleDeleteConfirm = () => {
    if (roleToDelete) deleteRole({ id: roleToDelete });
  };

  if (!organizationId) {
    return (
      <div className="text-muted-foreground rounded-md border py-12 text-center">
        Selecione uma empresa para gerenciar as roles
      </div>
    );
  }

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Usuários</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground py-8 text-center"
              >
                Nenhuma role cadastrada
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description || "—"}</TableCell>
                <TableCell>{role.userCount}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedRole(role);
                          setUsersDialogOpen(true);
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingRole(role);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setRoleToDelete(role.id);
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
        totalItems={roles.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={TABLE_PAGE_SIZE}
      />

      <RoleForm
        organizationId={organizationId}
        role={editingRole}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingRole(null);
        }}
      />

      <RoleUsersDialog
        role={selectedRole}
        open={usersDialogOpen}
        onOpenChange={(open) => {
          setUsersDialogOpen(open);
          if (!open) setSelectedRole(null);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta role? Os vínculos com
              usuários serão removidos. Esta ação não pode ser desfeita.
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
