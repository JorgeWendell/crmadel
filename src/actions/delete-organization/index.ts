"use server";

import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { organizationsTable } from "@/db/schema";
import { deleteOrganizationSchema } from "./schema";

export const deleteOrganizationAction = actionClient
  .schema(deleteOrganizationSchema)
  .action(async ({ parsedInput }) => {
    await db
      .delete(organizationsTable)
      .where(eq(organizationsTable.id, parsedInput.id));

    return { success: true };
  });
