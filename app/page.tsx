"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEmbedToken } from "@/hooks/use-embed-token";
import { JobInput } from "@/components/job-input";
import { LoadingReveal } from "@/components/loading-reveal";
import { ResultDisplay } from "@/components/result-display";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, AnalyzeResponse } from "@/lib/types";

type AppState = "input" | "loading" | "result" | "invalid" | "error";

export default function HomePage() {
  const embedToken = useEmbedToken();
  const [state, setState] = useState<AppState>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [quip, setQuip] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(role: string) {
    if (!embedToken) {
      setError(
        "Waiting for the Terminal AI session token. Refresh the page if this persists."
      );
      setState("error");
      return;
    }

    setJobRole(role);
    setState("loading");
    setError("");
    setQuip("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole: role, embedToken }),
      });

      const data: AnalyzeResponse = await res.json();

      if ("error" in data) {
        throw new Error(data.error);
      }

      if (data.valid === false) {
        setQuip(data.quip);
        setState("invalid");
        return;
      }

      setResult(data.result);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleReset() {
    setState("input");
    setResult(null);
    setJobRole("");
    setQuip("");
    setError("");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-5 py-8 sm:py-10">
      <AnimatePresence mode="wait">
        {state === "input" && (
          <JobInput key="input" onSubmit={handleSubmit} isLoading={false} />
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

        {state === "invalid" && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 text-center max-w-sm"
          >
            <motion.div
              initial={{ rotate: -12, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              Amazing career choice!
            </h2>
            <p className="text-zinc-500 leading-relaxed">{quip}</p>
            <Button
              onClick={handleReset}
              className="h-11 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
            >
              Try a real one
            </Button>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center max-w-sm"
          >
            <p className="text-rose-600 font-medium">{error}</p>
            <button
              onClick={handleReset}
              className="text-sm text-zinc-500 underline hover:text-zinc-900"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
