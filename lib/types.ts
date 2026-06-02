export interface ReasoningPoint {
  title: string;
  icon: "alert" | "trend" | "bot";
  text: string;
}

export interface AnalysisResult {
  riskScore: number;
  timelineRange: string;
  verdict: "Low Risk" | "Moderate Risk" | "High Risk";
  reasoning: [ReasoningPoint, ReasoningPoint, ReasoningPoint];
}

export interface AnalyzeRequest {
  jobRole: string;
}

/**
 * What the AI returns (and what /api/analyze forwards). Either a valid
 * analysis, a rejection with a fun quip, or a transport error.
 */
export type AnalyzeResponse =
  | { valid: true; result: AnalysisResult }
  | { valid: false; quip: string }
  | { error: string; code?: string };
