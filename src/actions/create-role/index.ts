"use server";

import { randomUUID } from "crypto";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { rolesTable } from "@/db/schema";
import { createRoleSchema } from "./schema";

export const createRoleAction = actionClient
  .schema(createRoleSchema)
  .action(async ({ parsedInput }) => {
    const now = new Date();
    const id = randomUUID();

    await db.insert(rolesTable).values({
      id,
      organizationId: parsedInput.organizationId,
      name: parsedInput.name,
      description: parsedInput.description || null,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
