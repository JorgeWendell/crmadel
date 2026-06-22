"use server";

import { desc, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  productFamiliesTable,
  productGroupsTable,
  productsTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getProductsSchema } from "./schema";

export const getProductsAction = actionClient
  .schema(getProductsSchema)
  .action(async () => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const products = await db
      .select({
        id: productsTable.id,
        groupId: productsTable.groupId,
        groupName: productGroupsTable.name,
        familyName: productFamiliesTable.name,
        code: productsTable.code,
        name: productsTable.name,
        description: productsTable.description,
        unit: productsTable.unit,
        type: productsTable.type,
        unitPrice: productsTable.unitPrice,
        isActive: productsTable.isActive,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .innerJoin(
        productGroupsTable,
        eq(productsTable.groupId, productGroupsTable.id),
      )
      .innerJoin(
        productFamiliesTable,
        eq(productGroupsTable.familyId, productFamiliesTable.id),
      )
      .where(eq(productsTable.organizationId, auth.organizationId))
      .orderBy(desc(productsTable.createdAt));

    return { success: true, data: products };
  });
