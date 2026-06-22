"use server";

import { desc, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productFamiliesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getProductFamiliesSchema } from "./schema";

export const getProductFamiliesAction = actionClient
  .schema(getProductFamiliesSchema)
  .action(async () => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const families = await db
      .select({
        id: productFamiliesTable.id,
        name: productFamiliesTable.name,
        description: productFamiliesTable.description,
        isActive: productFamiliesTable.isActive,
        createdAt: productFamiliesTable.createdAt,
        updatedAt: productFamiliesTable.updatedAt,
      })
      .from(productFamiliesTable)
      .where(eq(productFamiliesTable.organizationId, auth.organizationId))
      .orderBy(desc(productFamiliesTable.createdAt));

    return { success: true, data: families };
  });
