"use server";

import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { userOrganizationsTable, usersTable } from "@/db/schema";
import { getOrganizationUsersSchema } from "./schema";

export const getOrganizationUsersAction = actionClient
  .schema(getOrganizationUsersSchema)
  .action(async ({ parsedInput }) => {
    const members = await db
      .select({
        userId: userOrganizationsTable.userId,
        organizationId: userOrganizationsTable.organizationId,
        isOwner: userOrganizationsTable.isOwner,
        createdAt: userOrganizationsTable.createdAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(userOrganizationsTable)
      .innerJoin(usersTable, eq(userOrganizationsTable.userId, usersTable.id))
      .where(
        eq(userOrganizationsTable.organizationId, parsedInput.organizationId),
      );

    return { success: true, data: members };
  });
