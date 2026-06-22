"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { salesPipelinesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { createSalesPipelineSchema } from "./schema";

export const createSalesPipelineAction = actionClient
  .schema(createSalesPipelineSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const existing = await db
      .select({ id: salesPipelinesTable.id })
      .from(salesPipelinesTable)
      .where(
        and(
          eq(salesPipelinesTable.organizationId, auth.organizationId),
          eq(salesPipelinesTable.name, parsedInput.name),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Já existe um funil com este nome" };
    }

    if (parsedInput.isDefault) {
      await db
        .update(salesPipelinesTable)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(salesPipelinesTable.organizationId, auth.organizationId));
    }

    const now = new Date();
    const id = randomUUID();

    await db.insert(salesPipelinesTable).values({
      id,
      organizationId: auth.organizationId,
      name: parsedInput.name,
      description: parsedInput.description || null,
      color: parsedInput.color,
      isDefault: parsedInput.isDefault ?? false,
      isActive: parsedInput.isActive ?? true,
      ownerId: auth.userId,
      createdBy: auth.userId,
      updatedBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
