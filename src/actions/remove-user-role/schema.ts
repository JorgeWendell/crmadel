import { z } from "zod";

export const removeUserRoleSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
});
