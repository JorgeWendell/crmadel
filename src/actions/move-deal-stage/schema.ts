import { z } from "zod";

export const moveDealStageSchema = z.object({
  dealId: z.string().min(1),
  stageId: z.string().min(1),
});
