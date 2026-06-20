"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ReasoningCard } from "@/components/reasoning-card";
import { ShareButton } from "@/components/share-button";
import { RotateCcw } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface ResultDisplayProps {
  result: AnalysisResult;
  jobRole: string;
  onReset: () => void;
}

function riskTheme(score: number): {
  accent: string;
  ring: string;
  chip: string;
} {
  if (score < 40) {
    return {
      accent: "#10b981",
      ring: "#10b981",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (score < 70) {
    return {
      accent: "#f59e0b",
      ring: "#f59e0b",
      chip: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    accent: "#f43f5e",
    ring: "#f43f5e",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
  };
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 48;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}</span>;
}

export function ResultDisplay({ result, jobRole, onReset }: ResultDisplayProps) {
  const { accent, ring, chip } = riskTheme(result.riskScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-3.5 h-3.5 rounded-[4px] bg-zinc-900 rotate-45" />
        <span className="text-xs font-bold tracking-widest text-zinc-900 uppercase">
          Job Gone
        </span>
      </div>

      {/* Score row */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
      >
        <div
          className="relative grid place-items-center w-36 h-36 rounded-full shrink-0"
          style={{
            border: `10px solid ${ring}`,
            boxShadow: `0 20px 50px -20px ${accent}80`,
          }}
        >
          <span
            className="text-5xl font-extrabold tabular-nums leading-none"
            style={{ color: accent }}
          >
            <AnimatedCounter target={result.riskScore} />
          </span>
          <span
            className="text-[10px] font-bold tracking-widest mt-1"
            style={{ color: accent }}
          >
            % AT RISK
          </span>
        </div>

        <div className="text-center sm:text-left space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            {jobRole}
          </p>
          <span
            className={`inline-block text-sm px-3 py-1 rounded-full border font-semibold ${chip}`}
          >
            {result.verdict}
          </span>
          <p className="text-lg text-zinc-900">
            Gone in{" "}
            <span className="font-bold" style={{ color: accent }}>
              ~{result.timelineRange}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Reasoning — 3 columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {result.reasoning.map((point, i) => (
          <ReasoningCard key={point.title} point={point} index={i} />
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <ShareButton result={result} jobRole={jobRole} />
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-2 rounded-full text-zinc-500 hover:text-zinc-900"
        >
          <RotateCcw className="w-4 h-4" />
          Try another
        </Button>
      </motion.div>

      <p className="text-[10px] text-zinc-400 text-center max-w-md">
        Sources: Anthropic Economic Index · McKinsey Global Institute · PwC
        Global AI Study · WEF Future of Jobs
      </p>
    </motion.div>
  );
}
