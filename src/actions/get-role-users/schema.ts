import { z } from "zod";

export const getRoleUsersSchema = z.object({
  roleId: z.string().min(1),
});
