"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  salesPipelineStagesTable,
  salesPipelinesTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { createSalesPipelineWithStagesSchema } from "../create-sales-pipeline/schema";

const DEFAULT_STAGE_COLORS = [
  "#94A3B8",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F97316",
  "#A78BFA",
];

export const createSalesPipelineWithStagesAction = actionClient
  .schema(createSalesPipelineWithStagesSchema)
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

    const now = new Date();
    const pipelineId = randomUUID();

    await db.transaction(async (tx) => {
      if (parsedInput.isDefault) {
        await tx
          .update(salesPipelinesTable)
          .set({ isDefault: false, updatedAt: now })
          .where(eq(salesPipelinesTable.organizationId, auth.organizationId));
      }

      await tx.insert(salesPipelinesTable).values({
        id: pipelineId,
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

      for (let index = 0; index < parsedInput.stages.length; index++) {
        const stage = parsedInput.stages[index];
        const color =
          stage.color ||
          DEFAULT_STAGE_COLORS[index % DEFAULT_STAGE_COLORS.length];

        await tx.insert(salesPipelineStagesTable).values({
          id: randomUUID(),
          pipelineId,
          name: stage.name,
          description: stage.description || null,
          color,
          sortOrder: index,
          probability: stage.probability ?? 0,
          isWon: index === parsedInput.stages.length - 1,
          isLost: false,
          isEditable: true,
          isActive: true,
          ownerId: auth.userId,
          createdBy: auth.userId,
          updatedBy: auth.userId,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    return { success: true, id: pipelineId };
  });
