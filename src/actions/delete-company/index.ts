"use server";

import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { companiesTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { deleteCompanySchema } from "../create-company/schema";

export const deleteCompanyAction = actionClient
  .schema(deleteCompanySchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    await db
      .delete(companiesTable)
      .where(
        and(
          eq(companiesTable.id, parsedInput.id),
          eq(companiesTable.organizationId, auth.organizationId),
        ),
      );

    return { success: true };
  });
