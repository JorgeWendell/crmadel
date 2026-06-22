"use server";

import { and, eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { userOrganizationsTable } from "@/db/schema";
import { assignUserOrganizationSchema } from "./schema";

export const assignUserOrganizationAction = actionClient
  .schema(assignUserOrganizationSchema)
  .action(async ({ parsedInput }) => {
    const existing = await db
      .select({ userId: userOrganizationsTable.userId })
      .from(userOrganizationsTable)
      .where(
        and(
          eq(userOrganizationsTable.userId, parsedInput.userId),
          eq(
            userOrganizationsTable.organizationId,
            parsedInput.organizationId,
          ),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userOrganizationsTable)
        .set({ isOwner: parsedInput.isOwner })
        .where(
          and(
            eq(userOrganizationsTable.userId, parsedInput.userId),
            eq(
              userOrganizationsTable.organizationId,
              parsedInput.organizationId,
            ),
          ),
        );
    } else {
      await db.insert(userOrganizationsTable).values({
        userId: parsedInput.userId,
        organizationId: parsedInput.organizationId,
        isOwner: parsedInput.isOwner,
        createdAt: new Date(),
      });
    }

    return { success: true };
  });
