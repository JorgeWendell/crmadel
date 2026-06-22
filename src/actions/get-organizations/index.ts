"use server";

import { sql } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  organizationsTable,
  userOrganizationsTable,
} from "@/db/schema";
import { desc } from "drizzle-orm";
import { getOrganizationsSchema } from "./schema";

export const getOrganizationsAction = actionClient
  .schema(getOrganizationsSchema)
  .action(async () => {
    const organizations = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
        tradeName: organizationsTable.tradeName,
        cnpj: organizationsTable.cnpj,
        email: organizationsTable.email,
        phone: organizationsTable.phone,
        slug: organizationsTable.slug,
        language: organizationsTable.language,
        currency: organizationsTable.currency,
        isActive: organizationsTable.isActive,
        createdAt: organizationsTable.createdAt,
        updatedAt: organizationsTable.updatedAt,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${userOrganizationsTable}
          WHERE ${userOrganizationsTable.organizationId} = ${organizationsTable.id}
        )`.as("member_count"),
      })
      .from(organizationsTable)
      .orderBy(desc(organizationsTable.createdAt));

    return { success: true, data: organizations };
  });
