"use server";

import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { contactsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { deleteContactSchema } from "../create-contact/schema";

export const deleteContactAction = actionClient
  .schema(deleteContactSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    await db
      .delete(contactsTable)
      .where(
        and(
          eq(contactsTable.id, parsedInput.id),
          eq(contactsTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
