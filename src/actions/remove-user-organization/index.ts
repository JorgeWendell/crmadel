"use server";

import { and, eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { userOrganizationsTable } from "@/db/schema";
import { removeUserOrganizationSchema } from "./schema";

export const removeUserOrganizationAction = actionClient
  .schema(removeUserOrganizationSchema)
  .action(async ({ parsedInput }) => {
    await db
      .delete(userOrganizationsTable)
      .where(
        and(
          eq(userOrganizationsTable.userId, parsedInput.userId),
          eq(
            userOrganizationsTable.organizationId,
            parsedInput.organizationId,
          ),
        ),
      );

    return { success: true };
  });
