import { z } from "zod";

export const createRoleSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});
