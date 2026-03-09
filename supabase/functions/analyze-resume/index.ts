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
    const { resumeText, resumeBase64, mimeType, targetRole, roleSkills, jobDescription } = await req.json();

    if ((!resumeText && !resumeBase64) || !targetRole) {
      return new Response(
        JSON.stringify({ error: "Resume content and targetRole are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are SkillGap, an expert resume analyzer. You compare a resume against a target job role and identify skill gaps.

You MUST respond by calling the "analyze_skill_gap" tool. Do NOT respond with plain text.

Analysis guidelines:
- Extract ALL technical and soft skills from the resume
- Compare extracted skills against the role's required skills
- Identify partial matches (e.g., user knows CSS but not Responsive Design specifically)
- Score from 0-100 based on coverage of required skills
- Prioritize missing skills by industry importance
- Provide 2-3 specific, actionable learning recommendations per missing skill`;

    const roleInfo = jobDescription
      ? `Job description provided by the user:\n---\n${jobDescription.substring(0, 4000)}\n---\nExtract the required skills from this job description and compare against the resume.`
      : roleSkills?.length
        ? `Required skills for this role: ${roleSkills.join(", ")}`
        : "";

    // Build messages depending on whether we have PDF or text
    const userContent: any[] = [];

    if (resumeBase64) {
      // Multimodal: send PDF as inline_data for Gemini to read
      userContent.push({
        type: "text",
        text: `Analyze this resume (attached as PDF) for the "${targetRole}" role.\n\n${roleInfo}\n\nExtract all skills from the PDF and call the analyze_skill_gap tool with results.`,
      });
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType || "application/pdf"};base64,${resumeBase64}`,
        },
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze this resume for the "${targetRole}" role.\n\n${roleInfo}\n\nResume content:\n---\n${resumeText.substring(0, 8000)}\n---\n\nAnalyze the resume and call the analyze_skill_gap tool with results.`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_skill_gap",
              description: "Return the skill gap analysis results",
              parameters: {
                type: "object",
                properties: {
                  matchedSkills: {
                    type: "array",
                    items: { type: "string" },
                    description: "Skills the candidate already has",
                  },
                  missingSkills: {
                    type: "array",
                    items: { type: "string" },
                    description: "Skills required but not found in resume",
                  },
                  partialSkills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        has: { type: "string" },
                        missing: { type: "string" },
                      },
                      required: ["has", "missing"],
                    },
                    description: "Skills partially present",
                  },
                  skillScore: {
                    type: "number",
                    description: "Overall skill match percentage 0-100",
                  },
                  priorityOrder: {
                    type: "array",
                    items: { type: "string" },
                    description: "Missing skills ranked by importance to learn first",
                  },
                  recommendations: {
                    type: "object",
                    additionalProperties: {
                      type: "array",
                      items: { type: "string" },
                    },
                    description: "Learning recommendations per missing/partial skill. Key is skill name, value is array of 2-3 recommendations.",
                  },
                },
                required: ["matchedSkills", "missingSkills", "partialSkills", "skillScore", "priorityOrder", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_skill_gap" } },
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
      throw new Error("AI did not return structured analysis");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
