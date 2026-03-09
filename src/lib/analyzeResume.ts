import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/lib/skillData";
import { roles } from "@/lib/skillData";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function analyzeResume(
  file: File,
  targetRole: string,
  jobDescription?: string,
): Promise<AnalysisResult> {
  const roleData = roles.find((r) => r.role === targetRole);
  const roleSkills = roleData?.required ?? [];

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  
  let body: Record<string, unknown>;

  if (isPdf) {
    const base64 = await fileToBase64(file);
    body = { resumeBase64: base64, mimeType: "application/pdf", targetRole, roleSkills, jobDescription };
  } else {
    const resumeText = await readFileAsText(file);
    body = { resumeText, targetRole, roleSkills, jobDescription };
  }

  const { data, error } = await supabase.functions.invoke("analyze-resume", { body });

  if (error) {
    throw new Error(error.message || "Failed to analyze resume");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    matchedSkills: data.matchedSkills ?? [],
    missingSkills: data.missingSkills ?? [],
    partialSkills: data.partialSkills ?? [],
    skillScore: typeof data.skillScore === "number" ? data.skillScore : 0,
    priorityOrder: data.priorityOrder ?? [],
    recommendations: data.recommendations ?? {},
  };
}
