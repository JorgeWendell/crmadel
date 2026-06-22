"use client";

import {
  Cloud,
  CloudSun,
  Sun,
  CloudRain,
  CloudFog,
  type LucideIcon,
} from "lucide-react";

const STAGE_ICONS: LucideIcon[] = [Cloud, CloudFog, CloudRain, CloudSun, Sun];

export function getStageIcon(index: number): LucideIcon {
  return STAGE_ICONS[index % STAGE_ICONS.length];
}

export type StageDraft = {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  probability: number;
};

export const DEFAULT_STAGE_COLORS = [
  "#94A3B8",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F97316",
  "#A78BFA",
];

export function getStageProbability(index: number, total: number): number {
  if (total <= 1) return 100;
  return Math.round((index / (total - 1)) * 100);
}

export function createEmptyStage(index: number): StageDraft {
  return {
    name: "",
    description: "",
    color: DEFAULT_STAGE_COLORS[index % DEFAULT_STAGE_COLORS.length],
    probability: 0,
  };
}

export type PipelineSummary = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  isActive: boolean;
};

export type PipelineStage = {
  id: string;
  pipelineId: string;
  name: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  isActive: boolean;
  dealCount: number;
};

export type DealCard = {
  id: string;
  stageId: string;
  pipelineId: string;
  title: string;
  value: string | null;
  tags: string | null;
  probability: number | null;
  status: string;
  companyId: string | null;
  contactId: string | null;
  companyName: string | null;
  contactName: string | null;
  ownerName: string | null;
  updatedAt: Date;
  createdAt: Date;
};
