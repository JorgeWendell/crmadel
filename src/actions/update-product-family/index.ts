"use server";

import { and, eq, ne } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productFamiliesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { updateProductFamilySchema } from "../create-product-family/schema";

export const updateProductFamilyAction = actionClient
  .schema(updateProductFamilySchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const existing = await db
      .select({ id: productFamiliesTable.id })
      .from(productFamiliesTable)
      .where(
        and(
          eq(productFamiliesTable.organizationId, auth.organizationId),
          eq(productFamiliesTable.name, parsedInput.name),
          ne(productFamiliesTable.id, parsedInput.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Já existe uma família com este nome" };
    }

    await db
      .update(productFamiliesTable)
      .set({
        name: parsedInput.name,
        description: parsedInput.description || null,
        isActive: parsedInput.isActive,
        updatedBy: auth.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productFamiliesTable.id, parsedInput.id),
          eq(productFamiliesTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
