"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productFamiliesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { createProductFamilySchema } from "./schema";

export const createProductFamilyAction = actionClient
  .schema(createProductFamilySchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const existing = await db
      .select({ id: productFamiliesTable.id })
      .from(productFamiliesTable)
      .where(
        and(
          eq(productFamiliesTable.organizationId, auth.organizationId),
          eq(productFamiliesTable.name, parsedInput.name),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Já existe uma família com este nome" };
    }

    const now = new Date();
    const id = randomUUID();

    await db.insert(productFamiliesTable).values({
      id,
      organizationId: auth.organizationId,
      name: parsedInput.name,
      description: parsedInput.description || null,
      isActive: parsedInput.isActive ?? true,
      ownerId: auth.userId,
      createdBy: auth.userId,
      updatedBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
