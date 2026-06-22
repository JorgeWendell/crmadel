"use server";

import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { deleteProductSchema } from "../create-product/schema";

export const deleteProductAction = actionClient
  .schema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    await db
      .delete(productsTable)
      .where(
        and(
          eq(productsTable.id, parsedInput.id),
          eq(productsTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
