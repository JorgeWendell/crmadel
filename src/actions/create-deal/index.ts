"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  companiesTable,
  contactsTable,
  salesDealCollaboratorsTable,
  salesDealProductsTable,
  salesDealsTable,
  salesPipelineStagesTable,
  salesPipelinesTable,
} from "@/db/schema";
import { parseCurrencyInput } from "@/lib/currency";
import { getAuthContext } from "@/lib/server-auth";
import { createDealSchema } from "./schema";

export const createDealAction = actionClient
  .schema(createDealSchema)
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

    const [stage] = await db
      .select({
        id: salesPipelineStagesTable.id,
        probability: salesPipelineStagesTable.probability,
      })
      .from(salesPipelineStagesTable)
      .where(
        and(
          eq(salesPipelineStagesTable.id, parsedInput.stageId),
          eq(salesPipelineStagesTable.pipelineId, parsedInput.pipelineId),
        ),
      )
      .limit(1);

    if (!stage) {
      return { success: false, error: "Etapa não encontrada neste funil" };
    }

    if (parsedInput.companyId) {
      const [company] = await db
        .select({ id: companiesTable.id })
        .from(companiesTable)
        .where(
          and(
            eq(companiesTable.id, parsedInput.companyId),
            eq(companiesTable.organizationId, auth.organizationId),
          ),
        )
        .limit(1);

      if (!company) {
        return { success: false, error: "Cliente não encontrado" };
      }
    }

    if (parsedInput.contactId) {
      const contactConditions = [
        eq(contactsTable.id, parsedInput.contactId),
        eq(contactsTable.organizationId, auth.organizationId),
      ];

      if (parsedInput.companyId) {
        contactConditions.push(eq(contactsTable.companyId, parsedInput.companyId));
      }

      const [contact] = await db
        .select({ id: contactsTable.id })
        .from(contactsTable)
        .where(and(...contactConditions))
        .limit(1);

      if (!contact) {
        return { success: false, error: "Contato não encontrado" };
      }
    }

    const now = new Date();
    const id = randomUUID();
    const value = parsedInput.value
      ? parseCurrencyInput(parsedInput.value)
      : null;

    const startDate = parsedInput.startDate
      ? new Date(`${parsedInput.startDate}T12:00:00`)
      : null;

    await db.insert(salesDealsTable).values({
      id,
      organizationId: auth.organizationId,
      pipelineId: parsedInput.pipelineId,
      stageId: parsedInput.stageId,
      companyId: parsedInput.companyId || null,
      contactId: parsedInput.contactId || null,
      ownerId: parsedInput.ownerId || auth.userId,
      title: parsedInput.title.trim(),
      value,
      probability: stage.probability,
      startDate,
      source: parsedInput.source || null,
      tags: parsedInput.tags?.trim() || null,
      status: "OPEN",
      isActive: true,
      createdBy: auth.userId,
      updatedBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });

    if (parsedInput.collaboratorIds?.length) {
      await db.insert(salesDealCollaboratorsTable).values(
        parsedInput.collaboratorIds.map((userId) => ({
          dealId: id,
          userId,
          createdAt: now,
        })),
      );
    }

    if (parsedInput.productIds?.length) {
      await db.insert(salesDealProductsTable).values(
        parsedInput.productIds.map((productId) => ({
          dealId: id,
          productId,
          createdAt: now,
        })),
      );
    }

    return { success: true, id };
  });
