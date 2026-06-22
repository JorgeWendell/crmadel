"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CompaniesTable } from "./companies-table";
import { ContactsTable } from "./contacts-table";

const tabs = [
  { id: "companies", label: "Empresas" },
  { id: "contacts", label: "Pessoas" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ContactsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("companies");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Clientes
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gerencie empresas clientes e seus contatos
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "companies" ? <CompaniesTable /> : <ContactsTable />}
    </div>
  );
}
