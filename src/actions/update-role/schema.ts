import { z } from "zod";

export const updateRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});
