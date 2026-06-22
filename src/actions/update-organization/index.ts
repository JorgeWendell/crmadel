"use server";

import { and, eq, ne } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { organizationsTable } from "@/db/schema";
import { normalizeCnpj } from "@/lib/cnpj";
import { updateOrganizationSchema } from "./schema";

export const updateOrganizationAction = actionClient
  .schema(updateOrganizationSchema)
  .action(async ({ parsedInput }) => {
    const cnpj = normalizeCnpj(parsedInput.cnpj);

    if (cnpj) {
      const existingCnpj = await db
        .select({ id: organizationsTable.id })
        .from(organizationsTable)
        .where(
          and(
            eq(organizationsTable.cnpj, cnpj),
            ne(organizationsTable.id, parsedInput.id),
          ),
        )
        .limit(1);

      if (existingCnpj.length > 0) {
        return { success: false, error: "Este CNPJ já está em uso" };
      }
    }

    await db
      .update(organizationsTable)
      .set({
        name: parsedInput.name,
        tradeName: parsedInput.tradeName || null,
        cnpj,
        email: parsedInput.email || null,
        phone: parsedInput.phone || null,
        language: parsedInput.language,
        currency: parsedInput.currency,
        isActive: parsedInput.isActive,
        updatedAt: new Date(),
      })
      .where(eq(organizationsTable.id, parsedInput.id));

    return { success: true };
  });
