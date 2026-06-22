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
import { getProductFamiliesAction } from "@/actions/get-product-families";
import { deleteProductFamilyAction } from "@/actions/delete-product-family";
import { ActiveBadge } from "./active-badge";
import { FamilyForm, type FamilyRow } from "./family-form";
import { GroupForm } from "./group-form";
import { ProductForm } from "./product-form";

export function FamiliesTable() {
  const [families, setFamilies] = useState<FamilyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingFamily, setEditingFamily] = useState<FamilyRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<string | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupFamilyId, setGroupFamilyId] = useState<string | undefined>();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productGroupId, setProductGroupId] = useState<string | undefined>();

  const paginated = families.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );

  const { execute: fetchFamilies } = useAction(getProductFamiliesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setFamilies(data.data as FamilyRow[]);
      } else if (data?.error) toast.error(data.error);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar famílias");
      setIsLoading(false);
    },
  });

  const { execute: deleteFamily } = useAction(deleteProductFamilyAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Família excluída com sucesso!");
        fetchFamilies({});
        setDeleteDialogOpen(false);
        setFamilyToDelete(null);
      }
    },
    onError: () => toast.error("Erro ao excluir família"),
  });

  useEffect(() => {
    fetchFamilies({});
  }, [fetchFamilies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [families.length]);

  useEffect(() => {
    const handleChange = () => fetchFamilies({});
    window.addEventListener("products-changed", handleChange);
    return () => window.removeEventListener("products-changed", handleChange);
  }, [fetchFamilies]);

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <FamilyForm
          onCreateGroup={(family) => {
            setGroupFamilyId(family.id);
            setGroupDialogOpen(true);
          }}
        />
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {families.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center"
                >
                  Nenhuma família cadastrada
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((family) => (
                <TableRow key={family.id}>
                  <TableCell className="font-medium">{family.name}</TableCell>
                  <TableCell>{family.description || "—"}</TableCell>
                  <TableCell>
                    <ActiveBadge isActive={family.isActive} />
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
                            setEditingFamily(family);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setFamilyToDelete(family.id);
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
          totalItems={families.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={TABLE_PAGE_SIZE}
        />
      </div>

      <FamilyForm
        family={editingFamily}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingFamily(null);
        }}
      />

      <GroupForm
        defaultFamilyId={groupFamilyId}
        open={groupDialogOpen}
        onOpenChange={(open) => {
          setGroupDialogOpen(open);
          if (!open) setGroupFamilyId(undefined);
        }}
        onCreateProduct={(group) => {
          setProductGroupId(group.id);
          setProductDialogOpen(true);
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
              Tem certeza que deseja excluir esta família? Grupos e produtos
              vinculados também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                familyToDelete && deleteFamily({ id: familyToDelete })
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
