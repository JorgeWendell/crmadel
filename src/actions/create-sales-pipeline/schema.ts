import { z } from "zod";

export const createSalesPipelineSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().default("#3B82F6"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateSalesPipelineSchema = createSalesPipelineSchema.extend({
  id: z.string().min(1),
});

export const pipelineStageItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "O nome da etapa deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().optional(),
  probability: z.number().min(0).max(100).default(0),
});

export const savePipelineStagesSchema = z.object({
  pipelineId: z.string().min(1),
  stages: z.array(pipelineStageItemSchema).min(1, "Adicione pelo menos uma etapa"),
});

export const createSalesPipelineWithStagesSchema = createSalesPipelineSchema.extend({
  stages: z.array(pipelineStageItemSchema).min(1, "Adicione pelo menos uma etapa"),
});
