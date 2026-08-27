"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const niches = [
  "Tech & AI",
  "Fitness & Health",
  "Business & Finance",
  "Education",
  "Gaming",
  "Lifestyle & Travel",
  "Creative & Design",
  "Marketing & Social",
  "Food & Cooking",
  "Personal Development",
];

const platforms = [
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "reels", label: "Reels" },
  { id: "shorts", label: "Shorts" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X / Threads" },
];

const tones = [
  "Professional",
  "Casual & Friendly",
  "Educational",
  "Entertaining",
  "Inspirational",
  "Conversational",
  "Authoritative",
];

export default function ProfilePage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedTone, setSelectedTone] = useState("");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <span className="text-white font-bold text-xs">SF</span>
            </div>
            <span className="font-heading text-lg tracking-tight">
              ScriptForge
            </span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-[640px]">
          <h1 className="font-heading text-3xl mb-2">Creator Profile</h1>
          <p className="text-muted-foreground mb-10">
            Tell us about your content style. We&apos;ll use this to generate
            scripts that sound like you.
          </p>

          <form className="space-y-8">
            {/* Niche */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Your niche
              </label>
              <div className="grid grid-cols-2 gap-2">
                {niches.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => setSelectedNiche(niche)}
                    className={cn(
                      "px-4 py-2.5 rounded-[8px] text-sm text-left transition-colors",
                      selectedNiche === niche
                        ? "bg-foreground text-white"
                        : "bg-card border border-border hover:border-foreground/20"
                    )}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div>
              <label
                htmlFor="audience"
                className="block text-sm font-medium mb-2"
              >
                Target audience
              </label>
              <textarea
                id="audience"
                rows={3}
                placeholder="e.g., Young professionals aged 25-35 interested in productivity and career growth"
                className="w-full px-3 py-2.5 rounded-[8px] border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Tone of voice
              </label>
              <div className="flex flex-wrap gap-2">
                {tones.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={cn(
                      "px-4 py-2 rounded-[8px] text-sm transition-colors",
                      selectedTone === tone
                        ? "bg-foreground text-white"
                        : "bg-card border border-border hover:border-foreground/20"
                    )}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Target platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "px-4 py-2 rounded-[8px] text-sm transition-colors",
                      selectedPlatforms.includes(platform.id)
                        ? "bg-foreground text-white"
                        : "bg-card border border-border hover:border-foreground/20"
                    )}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style notes */}
            <div>
              <label
                htmlFor="style"
                className="block text-sm font-medium mb-2"
              >
                Additional style notes (optional)
              </label>
              <textarea
                id="style"
                rows={3}
                placeholder="e.g., I use humor, avoid jargon, always include data points"
                className="w-full px-3 py-2.5 rounded-[8px] border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={cn(
                  buttonVariants(),
                  "bg-foreground text-background hover:bg-foreground/90 rounded-[8px] px-8 h-[44px]"
                )}
              >
                Save profile
              </button>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-[8px] px-8 h-[44px]"
                )}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
