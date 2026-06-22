"use server";

import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productGroupsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { deleteProductGroupSchema } from "../create-product-group/schema";

export const deleteProductGroupAction = actionClient
  .schema(deleteProductGroupSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    await db
      .delete(productGroupsTable)
      .where(
        and(
          eq(productGroupsTable.id, parsedInput.id),
          eq(productGroupsTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
