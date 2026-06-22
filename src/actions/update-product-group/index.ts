"use server";

import { and, eq, ne } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productGroupsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { updateProductGroupSchema } from "../create-product-group/schema";

export const updateProductGroupAction = actionClient
  .schema(updateProductGroupSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const existing = await db
      .select({ id: productGroupsTable.id })
      .from(productGroupsTable)
      .where(
        and(
          eq(productGroupsTable.organizationId, auth.organizationId),
          eq(productGroupsTable.familyId, parsedInput.familyId),
          eq(productGroupsTable.name, parsedInput.name),
          ne(productGroupsTable.id, parsedInput.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "Já existe um grupo com este nome nesta família",
      };
    }

    await db
      .update(productGroupsTable)
      .set({
        familyId: parsedInput.familyId,
        name: parsedInput.name,
        description: parsedInput.description || null,
        isActive: parsedInput.isActive,
        updatedBy: auth.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productGroupsTable.id, parsedInput.id),
          eq(productGroupsTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
