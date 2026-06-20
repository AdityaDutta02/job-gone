"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2 } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface ShareButtonProps {
  result: AnalysisResult;
  jobRole: string;
}

function buildCardUrl(result: AnalysisResult, jobRole: string): string {
  const params = new URLSearchParams({
    role: jobRole,
    score: String(result.riskScore),
    verdict: result.verdict,
    timeline: result.timelineRange,
    r1: result.reasoning[0]?.text ?? "",
    r2: result.reasoning[1]?.text ?? "",
    r3: result.reasoning[2]?.text ?? "",
  });
  return `/api/card?${params.toString()}`;
}

function buildSummary(result: AnalysisResult, jobRole: string): string {
  return [
    `Congrats 🎉 — ${jobRole} is ${result.riskScore}% automatable (${result.verdict}).`,
    `AI handles most of it in ~${result.timelineRange}.`,
    `Find your number at Job Gone.`,
  ].join(" ");
}

export function ShareButton({ result, jobRole }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle");

  const handleShare = useCallback(async () => {
    setStatus("working");
    const fileName = `job-gone-${jobRole.toLowerCase().replace(/\s+/g, "-")}.png`;
    const summary = buildSummary(result, jobRole);

    try {
      const res = await fetch(buildCardUrl(result, jobRole));
      if (!res.ok) throw new Error("card render failed");
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });

      // Mobile: native share sheet with the image.
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: summary, title: "Job Gone" });
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2000);
        return;
      }

      // Desktop: download the PNG.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      // Last resort: copy a text summary.
      try {
        await navigator.clipboard.writeText(summary);
      } catch {
        /* clipboard blocked — nothing more we can do */
      }
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [result, jobRole]);

  return (
    <Button
      onClick={handleShare}
      disabled={status === "working"}
      className="h-11 px-6 gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm"
    >
      {status === "working" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : status === "done" ? (
        <Check className="w-4 h-4" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      {status === "done" ? "Shared!" : "Share your doom"}
    </Button>
  );
}
