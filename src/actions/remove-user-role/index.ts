"use server";

import { and, eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { userRolesTable } from "@/db/schema";
import { removeUserRoleSchema } from "./schema";

export const removeUserRoleAction = actionClient
  .schema(removeUserRoleSchema)
  .action(async ({ parsedInput }) => {
    await db
      .delete(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, parsedInput.userId),
          eq(userRolesTable.roleId, parsedInput.roleId),
        ),
      );

    return { success: true };
  });
