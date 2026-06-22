"use server";

import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { companiesTable, contactsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { updateContactSchema } from "../create-contact/schema";

export const updateContactAction = actionClient
  .schema(updateContactSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const [contact] = await db
      .select({
        id: contactsTable.id,
        companyId: contactsTable.companyId,
      })
      .from(contactsTable)
      .where(
        and(
          eq(contactsTable.id, parsedInput.id),
          eq(contactsTable.organizationId, auth.organizationId),
        ),
      )
      .limit(1);

    if (!contact) {
      return { success: false, error: "Contato não encontrado" };
    }

    const now = new Date();

    if (parsedInput.isPrimary) {
      await db
        .update(contactsTable)
        .set({ isPrimary: false, updatedAt: now, updatedBy: auth.userId })
        .where(eq(contactsTable.companyId, parsedInput.companyId));
    }

    await db
      .update(contactsTable)
      .set({
        companyId: parsedInput.companyId,
        name: parsedInput.name,
        jobTitle: parsedInput.jobTitle || null,
        department: parsedInput.department || null,
        email: parsedInput.email || null,
        phone: parsedInput.phone || null,
        mobile: parsedInput.mobile || null,
        whatsapp: parsedInput.whatsapp || null,
        isPrimary: parsedInput.isPrimary,
        notes: parsedInput.notes || null,
        isActive: parsedInput.isActive,
        updatedBy: auth.userId,
        updatedAt: now,
      })
      .where(eq(contactsTable.id, parsedInput.id));

    await db
      .update(companiesTable)
      .set({ updatedAt: now, updatedBy: auth.userId })
      .where(eq(companiesTable.id, parsedInput.companyId));

    return { success: true };
  });
