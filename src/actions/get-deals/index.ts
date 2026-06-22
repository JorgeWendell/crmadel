"use server";

import { and, desc, eq, ilike, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  companiesTable,
  contactsTable,
  salesDealsTable,
  salesPipelinesTable,
  usersTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getDealsSchema } from "./schema";

const ownerUser = alias(usersTable, "owner_user");

export const getDealsAction = actionClient
  .schema(getDealsSchema)
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

    const search = parsedInput.search?.trim();

    const deals = await db
      .select({
        id: salesDealsTable.id,
        stageId: salesDealsTable.stageId,
        pipelineId: salesDealsTable.pipelineId,
        title: salesDealsTable.title,
        value: salesDealsTable.value,
        tags: salesDealsTable.tags,
        probability: salesDealsTable.probability,
        status: salesDealsTable.status,
        companyId: salesDealsTable.companyId,
        contactId: salesDealsTable.contactId,
        companyName: companiesTable.name,
        contactName: contactsTable.name,
        ownerName: ownerUser.name,
        updatedAt: salesDealsTable.updatedAt,
        createdAt: salesDealsTable.createdAt,
      })
      .from(salesDealsTable)
      .leftJoin(companiesTable, eq(salesDealsTable.companyId, companiesTable.id))
      .leftJoin(contactsTable, eq(salesDealsTable.contactId, contactsTable.id))
      .leftJoin(ownerUser, eq(salesDealsTable.ownerId, ownerUser.id))
      .where(
        and(
          eq(salesDealsTable.pipelineId, parsedInput.pipelineId),
          eq(salesDealsTable.organizationId, auth.organizationId),
          eq(salesDealsTable.isActive, true),
          search
            ? or(
                ilike(salesDealsTable.title, `%${search}%`),
                ilike(companiesTable.name, `%${search}%`),
                ilike(contactsTable.name, `%${search}%`),
                ilike(salesDealsTable.tags, `%${search}%`),
              )
            : undefined,
        ),
      )
      .orderBy(desc(salesDealsTable.updatedAt));

    return { success: true, data: deals };
  });
