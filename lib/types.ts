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
  embedToken: string;
}

export interface AnalyzeResponse {
  result?: AnalysisResult;
  error?: string;
}
