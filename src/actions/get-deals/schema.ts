import { z } from "zod";

export const getDealsSchema = z.object({
  pipelineId: z.string().min(1),
  search: z.string().optional(),
});
