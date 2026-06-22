"use server";

import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { rolesTable } from "@/db/schema";
import { deleteRoleSchema } from "./schema";

export const deleteRoleAction = actionClient
  .schema(deleteRoleSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(rolesTable).where(eq(rolesTable.id, parsedInput.id));

    return { success: true };
  });
