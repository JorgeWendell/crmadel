"use server";

import { desc, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { salesPipelinesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getSalesPipelinesSchema } from "./schema";

export const getSalesPipelinesAction = actionClient
  .schema(getSalesPipelinesSchema)
  .action(async () => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const pipelines = await db
      .select({
        id: salesPipelinesTable.id,
        name: salesPipelinesTable.name,
        description: salesPipelinesTable.description,
        color: salesPipelinesTable.color,
        isDefault: salesPipelinesTable.isDefault,
        isActive: salesPipelinesTable.isActive,
        createdAt: salesPipelinesTable.createdAt,
      })
      .from(salesPipelinesTable)
      .where(eq(salesPipelinesTable.organizationId, auth.organizationId))
      .orderBy(desc(salesPipelinesTable.isDefault), desc(salesPipelinesTable.createdAt));

    return { success: true, data: pipelines };
  });
