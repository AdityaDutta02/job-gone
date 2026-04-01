"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Download } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface ShareButtonProps {
  result: AnalysisResult;
  jobRole: string;
}

export function ShareButton({ result, jobRole }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = [
      `AI Job Risk Analysis: ${jobRole}`,
      `Risk Score: ${result.riskScore}% (${result.verdict})`,
      `Timeline: ${result.timelineRange}`,
      "",
      ...result.reasoning.map((r) => `${r.title}: ${r.text}`),
      "",
      "Analyze your job at Job Gone",
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, jobRole]);

  const handleDownload = useCallback(async () => {
    const el = document.getElementById("result-card");
    if (!el) return;

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(el, {
      backgroundColor: "#FAFAFA",
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = `job-gone-${jobRole.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [jobRole]);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-2"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {copied ? "Copied!" : "Copy Result"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Save Image
      </Button>
    </div>
  );
}
