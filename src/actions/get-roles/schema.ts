import { z } from "zod";

export const getRolesSchema = z.object({
  organizationId: z.string().min(1),
});
