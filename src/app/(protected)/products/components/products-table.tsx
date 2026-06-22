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
import { getProductsAction } from "@/actions/get-products";
import { deleteProductAction } from "@/actions/delete-product";
import {
  getProductTypeLabel,
  getUnitMeasureLabel,
} from "@/lib/product-options";
import { ActiveBadge } from "./active-badge";
import { ProductForm, type ProductRow } from "./product-form";

function formatPrice(value: string | null): string {
  const amount = Number(value ?? 0);
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ProductsTable() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const paginated = products.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );

  const { execute: fetchProducts } = useAction(getProductsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setProducts(data.data as ProductRow[]);
      } else if (data?.error) toast.error(data.error);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar produtos");
      setIsLoading(false);
    },
  });

  const { execute: deleteProduct } = useAction(deleteProductAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Produto excluído com sucesso!");
        fetchProducts({});
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    },
    onError: () => toast.error("Erro ao excluir produto"),
  });

  useEffect(() => {
    fetchProducts({});
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  useEffect(() => {
    const handleChange = () => fetchProducts({});
    window.addEventListener("products-changed", handleChange);
    return () => window.removeEventListener("products-changed", handleChange);
  }, [fetchProducts]);

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ProductForm />
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground py-8 text-center"
                >
                  Nenhum produto cadastrado
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <div>{product.groupName}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.familyName}
                    </div>
                  </TableCell>
                  <TableCell>{getUnitMeasureLabel(product.unit)}</TableCell>
                  <TableCell>{getProductTypeLabel(product.type)}</TableCell>
                  <TableCell>{formatPrice(product.unitPrice)}</TableCell>
                  <TableCell>
                    <ActiveBadge isActive={product.isActive} />
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
                            setEditingProduct(product);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setProductToDelete(product.id);
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
          totalItems={products.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={TABLE_PAGE_SIZE}
        />
      </div>

      <ProductForm
        product={editingProduct}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                productToDelete && deleteProduct({ id: productToDelete })
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
