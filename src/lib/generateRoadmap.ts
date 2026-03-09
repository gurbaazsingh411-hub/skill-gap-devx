import { supabase } from "@/integrations/supabase/client";

export interface RoadmapResource {
  title: string;
  url?: string;
  type: "course" | "documentation" | "video" | "book" | "tutorial" | "project";
  isFree: boolean;
  estimatedHours?: number;
}

export interface RoadmapPhase {
  name: string;
  weeks: string;
  description: string;
  skills: string[];
  resources: RoadmapResource[];
  project: {
    title: string;
    description: string;
  };
  milestone: string;
}

export interface LearningRoadmap {
  totalWeeks: number;
  summary: string;
  phases: RoadmapPhase[];
}

export async function generateRoadmap(
  missingSkills: string[],
  partialSkills: { has: string; missing: string }[],
  matchedSkills: string[],
  targetRole: string,
): Promise<LearningRoadmap> {
  const { data, error } = await supabase.functions.invoke("generate-roadmap", {
    body: { missingSkills, partialSkills, matchedSkills, targetRole },
  });

  if (error) {
    throw new Error(error.message || "Failed to generate roadmap");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    totalWeeks: data.totalWeeks ?? 12,
    summary: data.summary ?? "",
    phases: data.phases ?? [],
  };
}
