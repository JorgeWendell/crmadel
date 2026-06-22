import { z } from "zod";

export const getOrganizationUsersSchema = z.object({
  organizationId: z.string().min(1),
});
