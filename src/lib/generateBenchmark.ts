import { supabase } from "@/integrations/supabase/client";

export interface SkillComparison {
  skill: string;
  candidateLevel: number;
  industryAverage: number;
  demand: "rising" | "stable" | "declining";
}

export interface BenchmarkData {
  percentile: number;
  averageScore: number;
  topPerformerScore: number;
  skillComparisons: SkillComparison[];
  marketInsights: string[];
  competitiveEdges: string[];
  biggestGaps: string[];
}

export async function generateBenchmark(
  matchedSkills: string[],
  missingSkills: string[],
  partialSkills: { has: string; missing: string }[],
  skillScore: number,
  targetRole: string,
): Promise<BenchmarkData> {
  const { data, error } = await supabase.functions.invoke("generate-benchmark", {
    body: { matchedSkills, missingSkills, partialSkills, skillScore, targetRole },
  });

  if (error) throw new Error(error.message || "Failed to generate benchmark");
  if (data?.error) throw new Error(data.error);

  return data as BenchmarkData;
}
