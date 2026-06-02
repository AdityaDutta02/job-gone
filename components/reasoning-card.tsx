"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Bot } from "lucide-react";
import type { ReasoningPoint } from "@/lib/types";

const ICONS = {
  alert: AlertTriangle,
  trend: TrendingUp,
  bot: Bot,
} as const;

const ICON_COLORS = {
  alert: "text-orange-500 bg-orange-50",
  trend: "text-blue-500 bg-blue-50",
  bot: "text-violet-500 bg-violet-50",
} as const;

interface ReasoningCardProps {
  point: ReasoningPoint;
  index: number;
}

export function ReasoningCard({ point, index }: ReasoningCardProps) {
  const Icon = ICONS[point.icon];
  const colorClass = ICON_COLORS[point.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 + index * 0.12 }}
      className="h-full rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-[0_2px_16px_-12px_rgba(9,9,11,0.2)] hover:shadow-[0_6px_24px_-12px_rgba(9,9,11,0.25)] transition-shadow"
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colorClass}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="font-semibold text-zinc-900 text-sm mb-1">{point.title}</h3>
      <p className="text-zinc-500 text-[13px] leading-relaxed">{point.text}</p>
    </motion.div>
  );
}
