"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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

function getVerdictColor(score: number): string {
  if (score < 40) return "#22C55E";
  if (score < 70) return "#EAB308";
  return "#FF3B30";
}

function getVerdictBg(score: number): string {
  if (score < 40) return "bg-green-50 text-green-700 border-green-200";
  if (score < 70) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
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
  const color = getVerdictColor(result.riskScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-xl mx-auto flex flex-col items-center gap-6"
    >
      <div id="result-card" className="w-full space-y-6 p-6 rounded-2xl bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
            {jobRole}
          </p>

          <div className="flex items-baseline justify-center gap-1">
            <span
              className="text-7xl sm:text-8xl font-black tabular-nums"
              style={{ color }}
            >
              <AnimatedCounter target={result.riskScore} />
            </span>
            <span
              className="text-3xl font-bold"
              style={{ color }}
            >
              %
            </span>
          </div>

          <Badge
            variant="outline"
            className={`text-sm px-3 py-1 font-semibold ${getVerdictBg(result.riskScore)}`}
          >
            {result.verdict}
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-lg text-foreground">
            AI could handle most of this role in{" "}
            <span className="font-bold" style={{ color }}>
              ~{result.timelineRange}
            </span>
          </p>
        </motion.div>

        <div className="space-y-3">
          {result.reasoning.map((point, i) => (
            <ReasoningCard key={point.title} point={point} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-[10px] text-muted-foreground/50 text-center"
        >
          Sources: Anthropic Economic Index, McKinsey Global Institute, PwC
          Global AI Study, WEF Future of Jobs Report
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <ShareButton result={result} jobRole={jobRole} />
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Another Role
        </Button>
      </motion.div>
    </motion.div>
  );
}
