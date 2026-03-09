import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchedSkills, missingSkills, partialSkills, skillScore, targetRole } = await req.json();

    if (!targetRole) {
      return new Response(
        JSON.stringify({ error: "targetRole is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("DEVX_AI_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("DEVX_AI_API_KEY is not configured");
    }

    const systemPrompt = `You are an industry benchmarking expert for tech careers. Given a candidate's skill profile for a specific role, generate realistic industry benchmark data showing how they compare to average candidates.

You MUST respond by calling the "generate_benchmark" tool. Do NOT respond with plain text.

Guidelines:
- Generate realistic percentile data based on the candidate's skill score and profile
- Create skill-level comparisons showing candidate vs average proficiency (0-100)
- Include market insights about skill demand trends
- Be realistic — don't inflate or deflate numbers artificially
- Base benchmarks on real industry patterns and hiring trends`;

    const userPrompt = `Generate industry benchmarks for a "${targetRole}" candidate with:
- Overall skill score: ${skillScore}/100
- Matched skills: ${matchedSkills?.join(", ") || "none"}
- Missing skills: ${missingSkills?.join(", ") || "none"}
- Partial skills: ${partialSkills?.map((s: any) => `${s.has} → ${s.missing}`).join(", ") || "none"}

Call the generate_benchmark tool with realistic industry comparison data.`;

    const response = await fetch("https://ai.gateway.devx.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_benchmark",
              description: "Return the industry benchmark comparison data",
              parameters: {
                type: "object",
                properties: {
                  percentile: {
                    type: "number",
                    description: "Candidate's percentile ranking among all applicants for this role (0-100)",
                  },
                  averageScore: {
                    type: "number",
                    description: "Average skill score of candidates applying for this role (0-100)",
                  },
                  topPerformerScore: {
                    type: "number",
                    description: "Typical score of top 10% candidates for this role (0-100)",
                  },
                  skillComparisons: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        candidateLevel: {
                          type: "number",
                          description: "Candidate's proficiency 0-100 (100 = has skill, 0 = missing, 30-70 = partial)",
                        },
                        industryAverage: {
                          type: "number",
                          description: "Average proficiency among candidates for this role 0-100",
                        },
                        demand: {
                          type: "string",
                          enum: ["rising", "stable", "declining"],
                          description: "Current market demand trend for this skill",
                        },
                      },
                      required: ["skill", "candidateLevel", "industryAverage", "demand"],
                    },
                    description: "Per-skill comparison between candidate and industry average (include top 8-12 most relevant skills)",
                  },
                  marketInsights: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 brief market insights about the role and skill trends",
                  },
                  competitiveEdges: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 skills where the candidate is above average",
                  },
                  biggestGaps: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 skills with the largest gap vs industry average",
                  },
                },
                required: [
                  "percentile",
                  "averageScore",
                  "topPerformerScore",
                  "skillComparisons",
                  "marketInsights",
                  "competitiveEdges",
                  "biggestGaps",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_benchmark" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      throw new Error("AI did not return structured benchmark data");
    }

    const benchmark = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(benchmark), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-benchmark error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
