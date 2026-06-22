"use server";

import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productFamiliesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { deleteProductFamilySchema } from "../create-product-family/schema";

export const deleteProductFamilyAction = actionClient
  .schema(deleteProductFamilySchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    await db
      .delete(productFamiliesTable)
      .where(
        and(
          eq(productFamiliesTable.id, parsedInput.id),
          eq(productFamiliesTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
