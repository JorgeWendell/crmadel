"use server";

import { and, eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { userRolesTable } from "@/db/schema";
import { assignUserRoleSchema } from "./schema";

export const assignUserRoleAction = actionClient
  .schema(assignUserRoleSchema)
  .action(async ({ parsedInput }) => {
    const existing = await db
      .select({ userId: userRolesTable.userId })
      .from(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, parsedInput.userId),
          eq(userRolesTable.roleId, parsedInput.roleId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Usuário já possui esta role" };
    }

    await db.insert(userRolesTable).values({
      userId: parsedInput.userId,
      roleId: parsedInput.roleId,
    });

    return { success: true };
  });
