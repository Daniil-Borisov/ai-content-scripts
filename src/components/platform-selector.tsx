"use client";

import { cn } from "@/lib/utils";
import {
  Play,
  Camera,
  Briefcase,
  Hash,
  Clapperboard,
  Check,
} from "lucide-react";

const platforms = [
  { id: "youtube", label: "YouTube", icon: Play, description: "5–30+ min" },
  { id: "tiktok", label: "TikTok", icon: Clapperboard, description: "15–90 sec" },
  { id: "reels", label: "Reels", icon: Camera, description: "15–90 sec" },
  { id: "shorts", label: "Shorts", icon: Play, description: "15–60 sec" },
  { id: "instagram", label: "Instagram", icon: Camera, description: "5–10 slides" },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase, description: "Post" },
  { id: "x", label: "X / Threads", icon: Hash, description: "Thread" },
];

interface PlatformSelectorProps {
  selected: string[];
  onChange: (platforms: string[]) => void;
  maxSelections?: number;
}

export function PlatformSelector({
  selected,
  onChange,
  maxSelections = 7,
}: PlatformSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id));
    } else if (selected.length < maxSelections) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selected.includes(platform.id);
        return (
          <button
            key={platform.id}
            onClick={() => toggle(platform.id)}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-[10px] text-left transition-all",
              isSelected
                ? "bg-foreground text-white"
                : "bg-card border border-border hover:border-foreground/20"
            )}
          >
            <Icon size={16} className={isSelected ? "text-white/80" : "text-muted-foreground"} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{platform.label}</p>
              <p className={cn("text-xs", isSelected ? "text-white/60" : "text-muted-foreground")}>
                {platform.description}
              </p>
            </div>
            {isSelected && (
              <Check size={14} className="text-white shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
