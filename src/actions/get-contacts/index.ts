"use server";

import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  companiesTable,
  contactsTable,
  usersTable,
} from "@/db/schema";
import { getAuthContext } from "@/lib/server-auth";
import { getContactsSchema } from "./schema";

const updatedByUser = alias(usersTable, "updated_by_user");

export const getContactsAction = actionClient
  .schema(getContactsSchema)
  .action(async () => {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Organização não encontrada" };
    }

    const contacts = await db
      .select({
        id: contactsTable.id,
        companyId: contactsTable.companyId,
        name: contactsTable.name,
        jobTitle: contactsTable.jobTitle,
        department: contactsTable.department,
        email: contactsTable.email,
        phone: contactsTable.phone,
        mobile: contactsTable.mobile,
        whatsapp: contactsTable.whatsapp,
        isPrimary: contactsTable.isPrimary,
        isActive: contactsTable.isActive,
        notes: contactsTable.notes,
        updatedAt: contactsTable.updatedAt,
        createdAt: contactsTable.createdAt,
        companyName: companiesTable.name,
        city: companiesTable.city,
        updatedByName: updatedByUser.name,
      })
      .from(contactsTable)
      .innerJoin(companiesTable, eq(contactsTable.companyId, companiesTable.id))
      .leftJoin(updatedByUser, eq(contactsTable.updatedBy, updatedByUser.id))
      .where(eq(contactsTable.organizationId, auth.organizationId))
      .orderBy(desc(contactsTable.updatedAt));

    return { success: true, data: contacts };
  });
