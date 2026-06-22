"use server";

import { and, eq, ne } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { updateProductSchema } from "../create-product/schema";

export const updateProductAction = actionClient
  .schema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const existing = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.organizationId, auth.organizationId),
          eq(productsTable.code, parsedInput.code),
          ne(productsTable.id, parsedInput.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Já existe um produto com este código" };
    }

    await db
      .update(productsTable)
      .set({
        groupId: parsedInput.groupId,
        code: parsedInput.code,
        name: parsedInput.name,
        description: parsedInput.description || null,
        unit: parsedInput.unit,
        type: parsedInput.type,
        unitPrice: parsedInput.unitPrice || "0",
        isActive: parsedInput.isActive,
        updatedBy: auth.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productsTable.id, parsedInput.id),
          eq(productsTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
