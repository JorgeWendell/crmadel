"use server";

import { desc, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productFamiliesTable, productGroupsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getProductGroupsSchema } from "./schema";

export const getProductGroupsAction = actionClient
  .schema(getProductGroupsSchema)
  .action(async () => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const groups = await db
      .select({
        id: productGroupsTable.id,
        familyId: productGroupsTable.familyId,
        familyName: productFamiliesTable.name,
        name: productGroupsTable.name,
        description: productGroupsTable.description,
        isActive: productGroupsTable.isActive,
        createdAt: productGroupsTable.createdAt,
        updatedAt: productGroupsTable.updatedAt,
      })
      .from(productGroupsTable)
      .innerJoin(
        productFamiliesTable,
        eq(productGroupsTable.familyId, productFamiliesTable.id),
      )
      .where(eq(productGroupsTable.organizationId, auth.organizationId))
      .orderBy(desc(productGroupsTable.createdAt));

    return { success: true, data: groups };
  });
