"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_STATUS_LABELS = [
  "Initializing...",
  "Analyzing topic...",
  "Generating content...",
  "Refining output...",
  "Finalizing...",
  "Almost done...",
];

type GenerationProgressPropsType = {
  description: string;
  icon: ReactNode;
  isConnected: boolean;
  accent?: "default" | "cta";
  statusLabels?: string[];
};

export function GenerationProgress({
  description,
  icon,
  isConnected,
  accent = "default",
  statusLabels = DEFAULT_STATUS_LABELS,
}: GenerationProgressPropsType) {
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    setLabelIndex(0);
    const id = window.setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % statusLabels.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [statusLabels]);

  const isCta = accent === "cta";

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-t-transparent animate-spin",
            isCta ? "border-cta" : "border-foreground"
          )}
        />
        <div
          className={cn(
            "absolute inset-2 rounded-full border border-dashed animate-[spin_3s_linear_infinite] opacity-40",
            isCta ? "border-cta" : "border-foreground"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className="font-medium mb-1 transition-opacity duration-300">
        {statusLabels[labelIndex]}
      </p>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      <div className="w-full max-w-[400px] mx-auto">
        <div className="h-2 bg-muted rounded-full overflow-hidden relative">
          <div
            className={cn(
              "absolute inset-y-0 w-2/5 rounded-full animate-indeterminate-bar",
              isCta ? "bg-cta" : "bg-foreground"
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            isConnected
              ? "bg-green-500 animate-pulse"
              : "bg-muted-foreground animate-pulse"
          )}
        />
        <span className="text-xs text-muted-foreground">
          {isConnected ? "Connected" : "Connecting..."}
        </span>
      </div>
    </div>
  );
}
