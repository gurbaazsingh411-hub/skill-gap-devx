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
    const { missingSkills, partialSkills, targetRole, matchedSkills } = await req.json();

    if (!targetRole || (!missingSkills?.length && !partialSkills?.length)) {
      return new Response(
        JSON.stringify({ error: "targetRole and skills data are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("DEVX_AI_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("DEVX_AI_API_KEY is not configured");
    }

    const systemPrompt = `You are SkillGap Roadmap Generator, an expert career advisor. Given a candidate's skill gaps for a target role, generate a detailed, personalized learning roadmap.

You MUST respond by calling the "generate_roadmap" tool. Do NOT respond with plain text.

Guidelines:
- Create a phased learning plan (Foundation → Intermediate → Advanced)
- Each phase should be 2-6 weeks with clear milestones
- Recommend REAL, specific courses/resources (Udemy, Coursera, freeCodeCamp, YouTube channels, official docs, books)
- Include free AND paid options, clearly labeled
- Suggest hands-on projects for each phase
- Consider skill dependencies (learn fundamentals before advanced topics)
- Estimate total learning time realistically
- Prioritize skills by impact on employability for the target role`;

    const skillsToLearn = [
      ...(missingSkills || []),
      ...(partialSkills || []).map((s: any) => `${s.has} → ${s.missing}`),
    ];

    const userPrompt = `Generate a personalized learning roadmap for a candidate targeting the "${targetRole}" role.

Skills they already have: ${(matchedSkills || []).join(", ") || "None specified"}

Skills they need to learn or improve:
${skillsToLearn.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

Create a structured, phased roadmap with specific course recommendations and projects.`;

    const response = await fetch("https://ai.gateway.devx.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_roadmap",
              description: "Return the structured learning roadmap",
              parameters: {
                type: "object",
                properties: {
                  totalWeeks: {
                    type: "number",
                    description: "Estimated total weeks to complete the roadmap",
                  },
                  summary: {
                    type: "string",
                    description: "A 2-3 sentence overview of the learning journey",
                  },
                  phases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Phase name e.g. 'Foundation', 'Core Skills', 'Advanced'" },
                        weeks: { type: "string", description: "Duration e.g. 'Weeks 1-3'" },
                        description: { type: "string", description: "What this phase covers" },
                        skills: {
                          type: "array",
                          items: { type: "string" },
                          description: "Skills covered in this phase",
                        },
                        resources: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              url: { type: "string", description: "Direct URL to the resource" },
                              type: { type: "string", enum: ["course", "documentation", "video", "book", "tutorial", "project"] },
                              isFree: { type: "boolean" },
                              estimatedHours: { type: "number", description: "Estimated hours to complete" },
                            },
                            required: ["title", "type", "isFree"],
                          },
                        },
                        project: {
                          type: "object",
                          properties: {
                            title: { type: "string", description: "Hands-on project name" },
                            description: { type: "string", description: "What to build and why" },
                          },
                          required: ["title", "description"],
                        },
                        milestone: { type: "string", description: "What you should be able to do by end of this phase" },
                      },
                      required: ["name", "weeks", "description", "skills", "resources", "project", "milestone"],
                    },
                  },
                },
                required: ["totalWeeks", "summary", "phases"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_roadmap" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      throw new Error("AI did not return structured roadmap");
    }

    const roadmap = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(roadmap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
