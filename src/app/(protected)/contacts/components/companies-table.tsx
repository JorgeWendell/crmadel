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
import { getCompaniesAction } from "@/actions/get-companies";
import { deleteCompanyAction } from "@/actions/delete-company";
import { getCompanyStatusLabel } from "@/lib/company-status";
import { formatDateTime } from "@/lib/format-date";
import { CompanyForm } from "./company-form";
import {
  CompanyViewDialog,
  type CompanyRow,
} from "./company-view-dialog";

export function CompaniesTable() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCompany, setEditingCompany] = useState<CompanyRow | null>(
    null,
  );
  const [viewCompany, setViewCompany] = useState<CompanyRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const paginated = companies.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );

  const { execute: fetchCompanies } = useAction(getCompaniesAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setCompanies(data.data as CompanyRow[]);
      } else if (data?.error) {
        toast.error(data.error);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar empresas");
      setIsLoading(false);
    },
  });

  const { execute: deleteCompany } = useAction(deleteCompanyAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Empresa excluída com sucesso!");
        fetchCompanies({});
        setDeleteDialogOpen(false);
        setCompanyToDelete(null);
      }
    },
    onError: () => toast.error("Erro ao excluir empresa"),
  });

  useEffect(() => {
    fetchCompanies({});
  }, [fetchCompanies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [companies.length]);

  useEffect(() => {
    const handleChange = () => fetchCompanies({});
    window.addEventListener("contacts-changed", handleChange);
    return () => window.removeEventListener("contacts-changed", handleChange);
  }, [fetchCompanies]);

  const handleRowClick = (company: CompanyRow) => {
    setViewCompany(company);
    setViewDialogOpen(true);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <CompanyForm />
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Último contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-8 text-center"
                >
                  Nenhuma empresa cadastrada
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((company) => (
                <TableRow
                  key={company.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(company)}
                >
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.responsibleName || "—"}</TableCell>
                  <TableCell>{company.city || "—"}</TableCell>
                  <TableCell>{formatDateTime(company.updatedAt)}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium dark:bg-slate-800">
                      {getCompanyStatusLabel(company.status)}
                    </span>
                  </TableCell>
                  <TableCell>{company.ownerName || "—"}</TableCell>
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
                            setEditingCompany(company);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCompanyToDelete(company.id);
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
          totalItems={companies.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={TABLE_PAGE_SIZE}
        />
      </div>

      <CompanyForm
        company={editingCompany}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingCompany(null);
        }}
      />

      <CompanyViewDialog
        company={viewCompany}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta empresa? Os contatos
              vinculados também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                companyToDelete && deleteCompany({ id: companyToDelete })
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
