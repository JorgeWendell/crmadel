import { z } from "zod";

export const removeUserOrganizationSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().min(1),
});
