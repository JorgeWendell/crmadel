"use server";

import { randomUUID } from "crypto";
import { and, eq, notInArray } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  salesPipelineStagesTable,
  salesPipelinesTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { savePipelineStagesSchema } from "../create-sales-pipeline/schema";

const DEFAULT_STAGE_COLORS = [
  "#94A3B8",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F97316",
  "#A78BFA",
];

export const savePipelineStagesAction = actionClient
  .schema(savePipelineStagesSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const [pipeline] = await db
      .select({ id: salesPipelinesTable.id })
      .from(salesPipelinesTable)
      .where(
        and(
          eq(salesPipelinesTable.id, parsedInput.pipelineId),
          eq(salesPipelinesTable.organizationId, auth.organizationId),
        ),
      )
      .limit(1);

    if (!pipeline) {
      return { success: false, error: "Funil não encontrado" };
    }

    const now = new Date();
    const keptIds = parsedInput.stages
      .map((stage) => stage.id)
      .filter((id): id is string => !!id);

    if (keptIds.length > 0) {
      await db
        .delete(salesPipelineStagesTable)
        .where(
          and(
            eq(salesPipelineStagesTable.pipelineId, parsedInput.pipelineId),
            notInArray(salesPipelineStagesTable.id, keptIds),
          ),
        );
    } else {
      await db
        .delete(salesPipelineStagesTable)
        .where(eq(salesPipelineStagesTable.pipelineId, parsedInput.pipelineId));
    }

    for (let index = 0; index < parsedInput.stages.length; index++) {
      const stage = parsedInput.stages[index];
      const color =
        stage.color ||
        DEFAULT_STAGE_COLORS[index % DEFAULT_STAGE_COLORS.length];

      if (stage.id) {
        await db
          .update(salesPipelineStagesTable)
          .set({
            name: stage.name,
            description: stage.description || null,
            color,
            sortOrder: index,
            probability: stage.probability ?? 0,
            updatedBy: auth.userId,
            updatedAt: now,
          })
          .where(
            and(
              eq(salesPipelineStagesTable.id, stage.id),
              eq(salesPipelineStagesTable.pipelineId, parsedInput.pipelineId),
            ),
          );
      } else {
        await db.insert(salesPipelineStagesTable).values({
          id: randomUUID(),
          pipelineId: parsedInput.pipelineId,
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
    }

    await db
      .update(salesPipelinesTable)
      .set({ updatedAt: now, updatedBy: auth.userId })
      .where(eq(salesPipelinesTable.id, parsedInput.pipelineId));

    return { success: true };
  });
