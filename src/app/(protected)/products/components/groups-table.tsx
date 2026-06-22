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
import { getProductGroupsAction } from "@/actions/get-product-groups";
import { deleteProductGroupAction } from "@/actions/delete-product-group";
import { ActiveBadge } from "./active-badge";
import { GroupForm, type GroupRow } from "./group-form";
import { ProductForm } from "./product-form";

export function GroupsTable() {
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productGroupId, setProductGroupId] = useState<string | undefined>();

  const paginated = groups.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );

  const { execute: fetchGroups } = useAction(getProductGroupsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setGroups(data.data as GroupRow[]);
      } else if (data?.error) toast.error(data.error);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar grupos");
      setIsLoading(false);
    },
  });

  const { execute: deleteGroup } = useAction(deleteProductGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Grupo excluído com sucesso!");
        fetchGroups({});
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
      }
    },
    onError: () => toast.error("Erro ao excluir grupo"),
  });

  useEffect(() => {
    fetchGroups({});
  }, [fetchGroups]);

  useEffect(() => {
    setCurrentPage(1);
  }, [groups.length]);

  useEffect(() => {
    const handleChange = () => fetchGroups({});
    window.addEventListener("products-changed", handleChange);
    return () => window.removeEventListener("products-changed", handleChange);
  }, [fetchGroups]);

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <GroupForm
          onCreateProduct={(group) => {
            setProductGroupId(group.id);
            setProductDialogOpen(true);
          }}
        />
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Família</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-8 text-center"
                >
                  Nenhum grupo cadastrado
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.familyName}</TableCell>
                  <TableCell>{group.description || "—"}</TableCell>
                  <TableCell>
                    <ActiveBadge isActive={group.isActive} />
                  </TableCell>
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
                            setEditingGroup(group);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setGroupToDelete(group.id);
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
          totalItems={groups.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={TABLE_PAGE_SIZE}
        />
      </div>

      <GroupForm
        group={editingGroup}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingGroup(null);
        }}
      />

      <ProductForm
        defaultGroupId={productGroupId}
        open={productDialogOpen}
        onOpenChange={(open) => {
          setProductDialogOpen(open);
          if (!open) setProductGroupId(undefined);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este grupo? Produtos vinculados
              também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                groupToDelete && deleteGroup({ id: groupToDelete })
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
