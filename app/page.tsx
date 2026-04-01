"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useEmbedToken } from "@/hooks/use-embed-token";
import { JobInput } from "@/components/job-input";
import { LoadingReveal } from "@/components/loading-reveal";
import { ResultDisplay } from "@/components/result-display";
import type { AnalysisResult, AnalyzeResponse } from "@/lib/types";

type AppState = "input" | "loading" | "result" | "error";

export default function HomePage() {
  const embedToken = useEmbedToken();
  const [state, setState] = useState<AppState>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(role: string) {
    if (!embedToken) {
      setError("Waiting for authentication token from Terminal AI viewer. The token is delivered via postMessage but never arrived. See issue details below.");
      setState("error");
      return;
    }

    setJobRole(role);
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole: role, embedToken }),
      });

      const data: AnalyzeResponse = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Analysis failed");
      }

      if (data.result) {
        setResult(data.result);
        setState("result");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleReset() {
    setState("input");
    setResult(null);
    setJobRole("");
    setError("");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
      <AnimatePresence mode="wait">
        {state === "input" && (
          <JobInput
            key="input"
            onSubmit={handleSubmit}
            isLoading={false}
          />
        )}

        {state === "loading" && <LoadingReveal key="loading" />}

        {state === "result" && result && (
          <ResultDisplay
            key="result"
            result={result}
            jobRole={jobRole}
            onReset={handleReset}
          />
        )}

        {state === "error" && (
          <div
            key="error"
            className="flex flex-col items-center gap-4 text-center"
          >
            <p className="text-destructive font-medium">{error}</p>
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              Try again
            </button>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
