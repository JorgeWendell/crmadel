"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  productFamiliesTable,
  productGroupsTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { createProductGroupSchema } from "./schema";

export const createProductGroupAction = actionClient
  .schema(createProductGroupSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const [family] = await db
      .select({ id: productFamiliesTable.id })
      .from(productFamiliesTable)
      .where(
        and(
          eq(productFamiliesTable.id, parsedInput.familyId),
          eq(productFamiliesTable.organizationId, auth.organizationId),
        ),
      )
      .limit(1);

    if (!family) {
      return { success: false, error: "Família não encontrada" };
    }

    const existing = await db
      .select({ id: productGroupsTable.id })
      .from(productGroupsTable)
      .where(
        and(
          eq(productGroupsTable.organizationId, auth.organizationId),
          eq(productGroupsTable.familyId, parsedInput.familyId),
          eq(productGroupsTable.name, parsedInput.name),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "Já existe um grupo com este nome nesta família",
      };
    }

    const now = new Date();
    const id = randomUUID();

    await db.insert(productGroupsTable).values({
      id,
      organizationId: auth.organizationId,
      familyId: parsedInput.familyId,
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
