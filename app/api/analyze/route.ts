import { NextRequest, NextResponse } from "next/server";
import { callGateway, GatewayError } from "@/lib/terminal-ai";
import type { AnalysisResult } from "@/lib/types";

const SYSTEM_PROMPT = `You are an AI job displacement analyst. You analyze job roles and estimate how soon AI will significantly replace or transform them.

STEP 1 — RELEVANCE CHECK (do this first):
Decide whether the user's input names a real occupation, job role, profession, trade, or industry.
- VALID: any real line of work, including obscure ones (falconer, actuary, sommelier, longshoreman) and modern/internet roles (influencer, streamer, prompt engineer, content creator). Industries count (e.g. "trucking", "journalism").
- INVALID: a person's name (Steve, Taylor, Aditya), gibberish/keyboard mash (asdf, qwerty, test), random objects/places, or non-work words.
If INVALID, respond with ONLY this JSON and nothing else:
{ "valid": false, "quip": "<one short, funny, mock-celebratory line under 140 chars that playfully points out it isn't a job and asks them to enter a real one>" }
Do NOT invent a risk score for invalid input.

STEP 2 — ANALYSIS (only if VALID):
BASE YOUR ANALYSIS ON THESE RESEARCH FINDINGS:

**Anthropic Economic Index (2025):**
- AI can now perform 4-15% of tasks across occupations at a cost-effective level
- Computer/mathematical occupations have highest exposure (up to 37% of tasks)
- Writing, analysis, and routine cognitive tasks are most automatable
- Physical/manual tasks remain largely unaffected

**McKinsey Global Institute:**
- ~30% of hours worked globally could be automated by 2030
- Knowledge workers in STEM, creative, business, and legal face highest exposure
- Jobs requiring physical presence, unpredictable manual work, or deep human judgment are most resilient

**PwC Global AI Study - Three Waves:**
- Algorithm Wave (to 2027): data analysis, simple digital tasks
- Augmentation Wave (2025-2030): repeatable tasks, pattern recognition, semi-autonomous systems
- Autonomy Wave (2028-2035+): physical labor automation, complex problem-solving

**World Economic Forum Future of Jobs Report:**
- 23% of jobs will change by 2027
- Analytical and creative thinking are the most valued human skills
- Data entry clerks, admin assistants, and accounting roles face highest displacement

INSTRUCTIONS FOR VALID ROLES:
- Consider which specific tasks within the role are automatable vs resilient
- Be honest and specific — reference real AI tools and companies by name
- riskScore 0-100: 0-39 = Low Risk, 40-69 = Moderate Risk, 70-100 = High Risk
- timelineRange = when AI will handle >50% of core tasks (e.g. "3-5 years", "10+ years")
- Each reasoning text must be 1-2 punchy sentences (they appear on a share card)

For a VALID role respond with ONLY this JSON and nothing else:
{
  "valid": true,
  "riskScore": <number 0-100>,
  "timelineRange": "<string>",
  "verdict": "<'Low Risk' | 'Moderate Risk' | 'High Risk'>",
  "reasoning": [
    { "title": "Already Happening", "icon": "alert", "text": "<where AI already does this work, with specific examples>" },
    { "title": "Industry Outlook", "icon": "trend", "text": "<what major reports predict for this role>" },
    { "title": "Tool Effectiveness", "icon": "bot", "text": "<current AI tools that do tasks in this role, named>" }
  ]
}`;

type AnalyzeBody = { jobRole?: string; embedToken?: string };

type AiPayload =
  | { valid: false; quip?: string }
  | ({ valid: true } & AnalysisResult);

/** Extract the first JSON object from a model response that may include prose. */
function parseAiJson(raw: string): AiPayload {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object in model response");
  }
  return JSON.parse(raw.slice(start, end + 1)) as AiPayload;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AnalyzeBody;
  const { jobRole, embedToken } = body;

  if (!embedToken) {
    return NextResponse.json({ error: "Missing embed token" }, { status: 401 });
  }

  const trimmed = jobRole?.trim() ?? "";
  if (trimmed.length < 2) {
    return NextResponse.json({ error: "Missing job role" }, { status: 400 });
  }

  try {
    const responseText = await callGateway(
      [{ role: "user", content: `Analyze this job role: "${trimmed}"` }],
      embedToken,
      { category: "chat", tier: "quality", system: SYSTEM_PROMPT }
    );

    const parsed = parseAiJson(responseText);

    if (parsed.valid === false) {
      return NextResponse.json({
        valid: false,
        quip:
          parsed.quip ??
          "That's not quite a job. Amazing effort though — try a real one!",
      });
    }

    const { valid: _valid, ...result } = parsed;
    void _valid;
    return NextResponse.json({ valid: true, result });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
