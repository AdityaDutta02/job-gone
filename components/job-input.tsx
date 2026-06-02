"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface JobInputProps {
  onSubmit: (jobRole: string) => void;
  isLoading: boolean;
}

export function JobInput({ onSubmit, isLoading }: JobInputProps) {
  const [jobRole, setJobRole] = useState("");
  const canSubmit = jobRole.trim().length >= 2 && !isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) onSubmit(jobRole.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-9 w-full max-w-lg mx-auto"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-4 h-4 rounded-[5px] bg-zinc-900 rotate-45" />
        <span className="text-sm font-bold tracking-widest text-zinc-900 uppercase">
          Job Gone
        </span>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
          Will AI take
          <br />
          your job?
        </h1>
        <p className="text-zinc-500 text-base sm:text-lg">
          Type your role. Get your number.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. graphic designer"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            disabled={isLoading}
            autoFocus
            className="w-full h-16 pl-6 pr-16 text-lg rounded-2xl bg-white border border-zinc-200 shadow-[0_2px_20px_-8px_rgba(9,9,11,0.12)] outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:shadow-[0_4px_30px_-8px_rgba(9,9,11,0.18)]"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Analyze"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-xl bg-zinc-900 text-white transition-all hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      <p className="text-xs text-zinc-400 text-center">
        Based on research from Anthropic · McKinsey · PwC · World Economic Forum
      </p>
    </motion.div>
  );
}
