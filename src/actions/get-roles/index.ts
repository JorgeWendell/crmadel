"use server";

import { sql } from "drizzle-orm";
import { eq, desc } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { rolesTable, userRolesTable } from "@/db/schema";
import { getRolesSchema } from "./schema";

export const getRolesAction = actionClient
  .schema(getRolesSchema)
  .action(async ({ parsedInput }) => {
    const roles = await db
      .select({
        id: rolesTable.id,
        organizationId: rolesTable.organizationId,
        name: rolesTable.name,
        description: rolesTable.description,
        createdAt: rolesTable.createdAt,
        updatedAt: rolesTable.updatedAt,
        userCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${userRolesTable}
          WHERE ${userRolesTable.roleId} = ${rolesTable.id}
        )`.as("user_count"),
      })
      .from(rolesTable)
      .where(eq(rolesTable.organizationId, parsedInput.organizationId))
      .orderBy(desc(rolesTable.createdAt));

    return { success: true, data: roles };
  });
