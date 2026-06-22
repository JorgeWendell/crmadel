"use server";

import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { userRolesTable, usersTable } from "@/db/schema";
import { getRoleUsersSchema } from "./schema";

export const getRoleUsersAction = actionClient
  .schema(getRoleUsersSchema)
  .action(async ({ parsedInput }) => {
    const members = await db
      .select({
        userId: userRolesTable.userId,
        roleId: userRolesTable.roleId,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(userRolesTable)
      .innerJoin(usersTable, eq(userRolesTable.userId, usersTable.id))
      .where(eq(userRolesTable.roleId, parsedInput.roleId));

    return { success: true, data: members };
  });
