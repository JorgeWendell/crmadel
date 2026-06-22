"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { companiesTable, contactsTable } from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { createContactSchema } from "./schema";

export const createContactAction = actionClient
  .schema(createContactSchema)
  .action(async ({ parsedInput }) => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const [company] = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(
        and(
          eq(companiesTable.id, parsedInput.companyId),
          eq(companiesTable.organizationId, auth.organizationId),
        ),
      )
      .limit(1);

    if (!company) {
      return { success: false, error: "Empresa não encontrada" };
    }

    const now = new Date();
    const id = randomUUID();

    if (parsedInput.isPrimary) {
      await db
        .update(contactsTable)
        .set({ isPrimary: false, updatedAt: now, updatedBy: auth.userId })
        .where(eq(contactsTable.companyId, parsedInput.companyId));
    }

    await db.insert(contactsTable).values({
      id,
      organizationId: auth.organizationId,
      companyId: parsedInput.companyId,
      name: parsedInput.name,
      jobTitle: parsedInput.jobTitle || null,
      department: parsedInput.department || null,
      email: parsedInput.email || null,
      phone: parsedInput.phone || null,
      mobile: parsedInput.mobile || null,
      whatsapp: parsedInput.whatsapp || null,
      isPrimary: parsedInput.isPrimary ?? false,
      notes: parsedInput.notes || null,
      ownerId: auth.userId,
      isActive: parsedInput.isActive ?? true,
      createdBy: auth.userId,
      updatedBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });

    await db
      .update(companiesTable)
      .set({ updatedAt: now, updatedBy: auth.userId })
      .where(eq(companiesTable.id, parsedInput.companyId));

    return { success: true, id };
  });
