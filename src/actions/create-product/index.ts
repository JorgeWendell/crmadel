"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productGroupsTable, productsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { createProductSchema } from "./schema";

export const createProductAction = actionClient
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const [group] = await db
      .select({ id: productGroupsTable.id })
      .from(productGroupsTable)
      .where(
        and(
          eq(productGroupsTable.id, parsedInput.groupId),
          eq(productGroupsTable.organizationId, auth.organizationId),
        ),
      )
      .limit(1);

    if (!group) {
      return { success: false, error: "Grupo não encontrado" };
    }

    const existing = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.organizationId, auth.organizationId),
          eq(productsTable.code, parsedInput.code),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Já existe um produto com este código" };
    }

    const now = new Date();
    const id = randomUUID();

    await db.insert(productsTable).values({
      id,
      organizationId: auth.organizationId,
      groupId: parsedInput.groupId,
      code: parsedInput.code,
      name: parsedInput.name,
      description: parsedInput.description || null,
      unit: parsedInput.unit,
      type: parsedInput.type,
      unitPrice: parsedInput.unitPrice || "0",
      isActive: parsedInput.isActive ?? true,
      ownerId: auth.userId,
      createdBy: auth.userId,
      updatedBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
