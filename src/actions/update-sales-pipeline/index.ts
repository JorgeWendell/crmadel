"use server";

import { and, eq, ne } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { salesPipelinesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { updateSalesPipelineSchema } from "../create-sales-pipeline/schema";

export const updateSalesPipelineAction = actionClient
  .schema(updateSalesPipelineSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const existing = await db
      .select({ id: salesPipelinesTable.id })
      .from(salesPipelinesTable)
      .where(
        and(
          eq(salesPipelinesTable.organizationId, auth.organizationId),
          eq(salesPipelinesTable.name, parsedInput.name),
          ne(salesPipelinesTable.id, parsedInput.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Já existe um funil com este nome" };
    }

    if (parsedInput.isDefault) {
      await db
        .update(salesPipelinesTable)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(salesPipelinesTable.organizationId, auth.organizationId));
    }

    await db
      .update(salesPipelinesTable)
      .set({
        name: parsedInput.name,
        description: parsedInput.description || null,
        color: parsedInput.color,
        isDefault: parsedInput.isDefault,
        isActive: parsedInput.isActive,
        updatedBy: auth.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(salesPipelinesTable.id, parsedInput.id),
          eq(salesPipelinesTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
