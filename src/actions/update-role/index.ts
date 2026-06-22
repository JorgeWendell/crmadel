"use server";

import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { rolesTable } from "@/db/schema";
import { updateRoleSchema } from "./schema";

export const updateRoleAction = actionClient
  .schema(updateRoleSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(rolesTable)
      .set({
        name: parsedInput.name,
        description: parsedInput.description || null,
        updatedAt: new Date(),
      })
      .where(eq(rolesTable.id, parsedInput.id));

    return { success: true };
  });
