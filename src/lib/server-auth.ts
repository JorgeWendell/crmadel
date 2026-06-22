import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { userOrganizationsTable } from "@/db/schema";

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

export async function getCurrentOrganizationId(
  userId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ organizationId: userOrganizationsTable.organizationId })
    .from(userOrganizationsTable)
    .where(eq(userOrganizationsTable.userId, userId))
    .limit(1);

  return row?.organizationId ?? null;
}

export async function getAuthContext(): Promise<{
  userId: string;
  organizationId: string;
} | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const organizationId = await getCurrentOrganizationId(userId);
  if (!organizationId) return null;

  return { userId, organizationId };
}
