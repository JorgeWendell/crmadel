"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { getOrganizationsAction } from "@/actions/get-organizations";
import { RoleForm } from "./components/role-form";
import { RolesTable } from "./components/roles-table";
import { cn } from "@/lib/utils";

type Organization = {
  id: string;
  name: string;
};

export default function GestaoRolesPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");

  const { execute: fetchOrganizations } = useAction(getOrganizationsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setOrganizations(data.data);
        if (data.data.length === 1) {
          setSelectedOrganizationId(data.data[0].id);
        }
      }
    },
    onError: () => toast.error("Erro ao carregar empresas"),
  });

  useEffect(() => {
    fetchOrganizations({});
  }, [fetchOrganizations]);

  const selectClassName = cn(
    "h-9 w-full max-w-md min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Roles
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Cadastre roles por empresa e atribua aos usuários
          </p>
        </div>
        <RoleForm organizationId={selectedOrganizationId} />
      </div>

      <div className="mb-6 space-y-2">
        <Label>Empresa</Label>
        <select
          className={selectClassName}
          value={selectedOrganizationId}
          onChange={(e) => setSelectedOrganizationId(e.target.value)}
        >
          <option value="">Selecione uma empresa</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <RolesTable organizationId={selectedOrganizationId} />
    </div>
  );
}
