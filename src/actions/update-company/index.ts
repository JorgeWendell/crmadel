"use server";

import { and, eq, ne } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { companiesTable } from "@/db/schema";
import { normalizeCnpj } from "@/lib/cnpj";
import { getAuthContext } from "@/lib/server-auth";
import { updateCompanySchema } from "../create-company/schema";

export const updateCompanyAction = actionClient
  .schema(updateCompanySchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const cnpj = normalizeCnpj(parsedInput.cnpj);

    if (cnpj) {
      const existing = await db
        .select({ id: companiesTable.id })
        .from(companiesTable)
        .where(
          and(
            eq(companiesTable.organizationId, auth.organizationId),
            eq(companiesTable.cnpj, cnpj),
            ne(companiesTable.id, parsedInput.id),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "Este CNPJ já está cadastrado" };
      }
    }

    await db
      .update(companiesTable)
      .set({
        name: parsedInput.name,
        tradeName: parsedInput.tradeName || null,
        cnpj,
        email: parsedInput.email || null,
        phone: parsedInput.phone || null,
        city: parsedInput.city || null,
        status: parsedInput.status,
        source: parsedInput.source,
        website: parsedInput.website || null,
        industry: parsedInput.industry || null,
        notes: parsedInput.notes || null,
        ownerId: parsedInput.ownerId || null,
        isActive: parsedInput.isActive,
        updatedBy: auth.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(companiesTable.id, parsedInput.id),
          eq(companiesTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
