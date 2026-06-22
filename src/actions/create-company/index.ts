"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { companiesTable } from "@/db/schema";
import { normalizeCnpj } from "@/lib/cnpj";
import { getAuthContext } from "@/lib/server-auth";
import { createCompanySchema } from "./schema";

export const createCompanyAction = actionClient
  .schema(createCompanySchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const now = new Date();
    const cnpj = normalizeCnpj(parsedInput.cnpj);

    if (cnpj) {
      const existing = await db
        .select({ id: companiesTable.id })
        .from(companiesTable)
        .where(
          and(
            eq(companiesTable.organizationId, auth.organizationId),
            eq(companiesTable.cnpj, cnpj),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "Este CNPJ já está cadastrado" };
      }
    }

    const id = randomUUID();

    await db.insert(companiesTable).values({
      id,
      organizationId: auth.organizationId,
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
      ownerId: parsedInput.ownerId || auth.userId,
      isActive: parsedInput.isActive ?? true,
      createdBy: auth.userId,
      updatedBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
