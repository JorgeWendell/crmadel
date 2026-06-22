import { z } from "zod";

export const assignUserOrganizationSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().min(1),
  isOwner: z.boolean().default(false),
});
