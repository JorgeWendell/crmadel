import { z } from "zod";

export const getPipelineStagesSchema = z.object({
  pipelineId: z.string().min(1),
});
