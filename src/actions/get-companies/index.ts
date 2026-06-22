"use server";

import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  companiesTable,
  contactsTable,
  usersTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getCompaniesSchema } from "./schema";

const ownerUser = alias(usersTable, "owner_user");

export const getCompaniesAction = actionClient
  .schema(getCompaniesSchema)
  .action(async () => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const companies = await db
      .select({
        id: companiesTable.id,
        name: companiesTable.name,
        tradeName: companiesTable.tradeName,
        cnpj: companiesTable.cnpj,
        email: companiesTable.email,
        phone: companiesTable.phone,
        city: companiesTable.city,
        status: companiesTable.status,
        source: companiesTable.source,
        website: companiesTable.website,
        industry: companiesTable.industry,
        notes: companiesTable.notes,
        isActive: companiesTable.isActive,
        ownerId: companiesTable.ownerId,
        ownerName: ownerUser.name,
        updatedAt: companiesTable.updatedAt,
        createdAt: companiesTable.createdAt,
        responsibleName: sql<string | null>`(
          SELECT ${contactsTable.name}
          FROM ${contactsTable}
          WHERE ${contactsTable.companyId} = ${companiesTable.id}
            AND ${contactsTable.isPrimary} = true
          LIMIT 1
        )`.as("responsible_name"),
      })
      .from(companiesTable)
      .leftJoin(ownerUser, eq(companiesTable.ownerId, ownerUser.id))
      .where(eq(companiesTable.organizationId, auth.organizationId))
      .orderBy(desc(companiesTable.updatedAt));

    return { success: true, data: companies };
  });
