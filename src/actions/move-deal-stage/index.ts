"use server";

import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  salesDealsTable,
  salesPipelineStagesTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { moveDealStageSchema } from "./schema";

export const moveDealStageAction = actionClient
  .schema(moveDealStageSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const [deal] = await db
      .select({
        id: salesDealsTable.id,
        pipelineId: salesDealsTable.pipelineId,
        stageId: salesDealsTable.stageId,
      })
      .from(salesDealsTable)
      .where(
        and(
          eq(salesDealsTable.id, parsedInput.dealId),
          eq(salesDealsTable.organizationId, auth.organizationId),
          eq(salesDealsTable.isActive, true),
        ),
      )
      .limit(1);

    if (!deal) {
      return { success: false, error: "Negócio não encontrado" };
    }

    if (deal.stageId === parsedInput.stageId) {
      return { success: true };
    }

    const [stage] = await db
      .select({
        id: salesPipelineStagesTable.id,
        probability: salesPipelineStagesTable.probability,
        isWon: salesPipelineStagesTable.isWon,
        isLost: salesPipelineStagesTable.isLost,
      })
      .from(salesPipelineStagesTable)
      .where(
        and(
          eq(salesPipelineStagesTable.id, parsedInput.stageId),
          eq(salesPipelineStagesTable.pipelineId, deal.pipelineId),
        ),
      )
      .limit(1);

    if (!stage) {
      return { success: false, error: "Etapa inválida para este funil" };
    }

    const now = new Date();

    await db
      .update(salesDealsTable)
      .set({
        stageId: stage.id,
        probability: stage.probability,
        status: stage.isWon ? "WON" : stage.isLost ? "LOST" : "OPEN",
        wonAt: stage.isWon ? now : null,
        lostAt: stage.isLost ? now : null,
        closedAt: stage.isWon || stage.isLost ? now : null,
        updatedBy: auth.userId,
        updatedAt: now,
      })
      .where(eq(salesDealsTable.id, parsedInput.dealId));

    return { success: true };
  });
