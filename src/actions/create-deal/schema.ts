import { z } from "zod";

const leadSourceSchema = z.enum([
  "MANUAL",
  "SITE",
  "WHATSAPP",
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE",
  "INDICATION",
  "API",
  "IMPORT",
]);

export const createDealSchema = z.object({
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  value: z.string().optional(),
  tags: z.string().optional(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  source: leadSourceSchema.optional(),
  ownerId: z.string().optional(),
  startDate: z.string().optional(),
  collaboratorIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
});
