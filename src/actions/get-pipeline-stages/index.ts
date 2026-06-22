"use server";

import { asc, eq, sql } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  salesDealsTable,
  salesPipelineStagesTable,
  salesPipelinesTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getPipelineStagesSchema } from "./schema";

export const getPipelineStagesAction = actionClient
  .schema(getPipelineStagesSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const [pipeline] = await db
      .select({
        id: salesPipelinesTable.id,
        name: salesPipelinesTable.name,
        description: salesPipelinesTable.description,
        color: salesPipelinesTable.color,
        isDefault: salesPipelinesTable.isDefault,
        isActive: salesPipelinesTable.isActive,
      })
      .from(salesPipelinesTable)
      .where(
        eq(salesPipelinesTable.id, parsedInput.pipelineId),
      )
      .limit(1);

    if (!pipeline) {
      return { success: false, error: "Funil não encontrado" };
    }

    const stages = await db
      .select({
        id: salesPipelineStagesTable.id,
        pipelineId: salesPipelineStagesTable.pipelineId,
        name: salesPipelineStagesTable.name,
        description: salesPipelineStagesTable.description,
        color: salesPipelineStagesTable.color,
        sortOrder: salesPipelineStagesTable.sortOrder,
        probability: salesPipelineStagesTable.probability,
        isWon: salesPipelineStagesTable.isWon,
        isLost: salesPipelineStagesTable.isLost,
        isActive: salesPipelineStagesTable.isActive,
        dealCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${salesDealsTable}
          WHERE ${salesDealsTable.stageId} = ${salesPipelineStagesTable.id}
            AND ${salesDealsTable.isActive} = true
        )`.as("deal_count"),
      })
      .from(salesPipelineStagesTable)
      .where(eq(salesPipelineStagesTable.pipelineId, parsedInput.pipelineId))
      .orderBy(asc(salesPipelineStagesTable.sortOrder));

    return { success: true, data: { pipeline, stages } };
  });
