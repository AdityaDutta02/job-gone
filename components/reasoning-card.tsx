"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
    >
      <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex gap-4 p-5">
          <div
            className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground text-sm">
              {point.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {point.text}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
