import { z } from "zod";

export const deleteRoleSchema = z.object({
  id: z.string().min(1),
});
