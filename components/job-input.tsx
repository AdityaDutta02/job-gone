"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface JobInputProps {
  onSubmit: (jobRole: string) => void;
  isLoading: boolean;
}

export function JobInput({ onSubmit, isLoading }: JobInputProps) {
  const [jobRole, setJobRole] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (jobRole.trim() && !isLoading) {
      onSubmit(jobRole.trim());
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
          HOW LONG UNTIL AI
          <span className="block text-[#FF3B30]">TAKES YOUR JOB?</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          Based on research from Anthropic, McKinsey, PwC &amp; the World
          Economic Forum
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <Input
          type="text"
          placeholder="Enter your job role..."
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="h-14 text-lg px-5 bg-white border-border/60 shadow-sm focus-visible:ring-[#FF3B30]/30"
          disabled={isLoading}
          autoFocus
        />
        <Button
          type="submit"
          disabled={!jobRole.trim() || isLoading}
          className="h-14 text-lg font-bold bg-[#FF3B30] hover:bg-[#E0352B] text-white shadow-lg shadow-[#FF3B30]/20 transition-all duration-200"
        >
          Find Out
        </Button>
      </form>

      <p className="text-xs text-muted-foreground/60 text-center">
        Powered by AI analysis of major workforce automation reports
      </p>
    </motion.div>
  );
}
