import Link from "next/link";

import { Users, ChevronRight, Building2, Shield } from "lucide-react";



export default function Configuracoes() {

  return (

    <div className="p-6">

      <div className="space-y-3">

        <Link

          href="/configuracoes/gestao-usuarios"

          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"

        >

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">

            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />

          </div>

          <div className="flex-1">

            <h3 className="font-semibold text-gray-900 dark:text-white">

              Gestão de usuários

            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">

              Cadastro de usuários e convites de acesso

            </p>

          </div>

          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />

        </Link>



        <Link

          href="/configuracoes/gestao-empresas"

          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"

        >

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">

            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />

          </div>

          <div className="flex-1">

            <h3 className="font-semibold text-gray-900 dark:text-white">

              Gestão de empresas

            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">

              Cadastro de empresas e vínculo com usuários

            </p>

          </div>

          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />

        </Link>



        <Link

          href="/configuracoes/gestao-roles"

          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"

        >

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">

            <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />

          </div>

          <div className="flex-1">

            <h3 className="font-semibold text-gray-900 dark:text-white">

              Gestão de roles

            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">

              Cadastro de roles e atribuição aos usuários

            </p>

          </div>

          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />

        </Link>

      </div>

    </div>

  );

}

