"use server";

import { randomUUID } from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { organizationsTable } from "@/db/schema";
import { normalizeCnpj } from "@/lib/cnpj";
import { slugify } from "@/lib/slug";
import { createOrganizationSchema } from "./schema";

export const createOrganizationAction = actionClient
  .schema(createOrganizationSchema)
  .action(async ({ parsedInput }) => {
    const now = new Date();
    const slug = slugify(parsedInput.name);
    const cnpj = normalizeCnpj(parsedInput.cnpj);

    if (!slug) {
      return { success: false, error: "Não foi possível gerar um slug válido" };
    }

    const existingSlug = await db
      .select({ id: organizationsTable.id })
      .from(organizationsTable)
      .where(eq(organizationsTable.slug, slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return { success: false, error: "Este slug já está em uso" };
    }

    if (cnpj) {
      const existingCnpj = await db
        .select({ id: organizationsTable.id })
        .from(organizationsTable)
        .where(eq(organizationsTable.cnpj, cnpj))
        .limit(1);

      if (existingCnpj.length > 0) {
        return { success: false, error: "Este CNPJ já está em uso" };
      }
    }

    const id = randomUUID();

    await db.insert(organizationsTable).values({
      id,
      name: parsedInput.name,
      tradeName: parsedInput.tradeName || null,
      cnpj,
      email: parsedInput.email || null,
      phone: parsedInput.phone || null,
      slug,
      language: parsedInput.language,
      currency: parsedInput.currency,
      isActive: parsedInput.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
