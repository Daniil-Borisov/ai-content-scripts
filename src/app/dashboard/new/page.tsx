"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Lightbulb, ArrowRight, Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateIdeas = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock ideas
    setIdeas([
      `The ultimate guide to ${topic} for beginners`,
      `5 mistakes everyone makes with ${topic}`,
      `How ${topic} changed my life in 30 days`,
      `${topic}: What nobody tells you`,
      `The science behind ${topic}`,
      `${topic} vs alternatives: Which is better?`,
      `My honest review of ${topic} after 1 year`,
      `${topic} tips that actually work`,
      `Why ${topic} is trending in 2026`,
      `${topic}: A step-by-step tutorial`,
    ]);

    setIsGenerating(false);
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
        <div className="max-w-[720px]">
          <h1 className="font-heading text-3xl mb-2">New Project</h1>
          <p className="text-muted-foreground mb-10">
            Enter a topic and we&apos;ll generate 10 angles for your content.
          </p>

          {/* Topic input */}
          <div className="mb-8">
            <label
              htmlFor="topic"
              className="block text-sm font-medium mb-2"
            >
              What&apos;s your topic?
            </label>
            <div className="flex gap-3">
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI productivity tools, home workouts, personal finance"
                className="flex-1 h-[44px] px-4 rounded-[8px] border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              <button
                onClick={generateIdeas}
                disabled={!topic.trim() || isGenerating}
                className={cn(
                  buttonVariants(),
                  "bg-foreground text-background hover:bg-foreground/90 rounded-[8px] px-6 h-[44px] shrink-0",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate ideas"
                )}
              </button>
            </div>
          </div>

          {isGenerating && (
            <div className="bg-card border border-border rounded-[12px] p-8 mb-8 text-center">
              <div className="relative w-14 h-14 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full border-2 border-muted" />
                <div className="absolute inset-0 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lightbulb size={18} className="text-foreground" />
                </div>
              </div>
              <p className="font-medium mb-1">Cooking up angles...</p>
              <p className="text-sm text-muted-foreground mb-5">
                Generating 10 content ideas for your topic.
              </p>
              <div className="w-full max-w-[320px] mx-auto">
                <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 w-2/5 bg-foreground rounded-full animate-indeterminate-bar" />
                </div>
              </div>
            </div>
          )}

          {/* Ideas list */}
          {ideas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl">
                  Select an angle
                </h2>
                <span className="text-sm text-muted-foreground">
                  {ideas.length} ideas generated
                </span>
              </div>

              <div className="space-y-2 mb-8">
                {ideas.map((idea, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIdea(index)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-[8px] transition-colors flex items-center gap-3",
                      selectedIdea === index
                        ? "bg-foreground text-white"
                        : "bg-card border border-border hover:border-foreground/20"
                    )}
                  >
                    <Lightbulb
                      size={16}
                      className={
                        selectedIdea === index
                          ? "text-white/70"
                          : "text-muted-foreground"
                      }
                    />
                    <span className="text-sm">{idea}</span>
                  </button>
                ))}
              </div>

              {selectedIdea !== null && (
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/project/generate?topic=${encodeURIComponent(topic)}&idea=${encodeURIComponent(ideas[selectedIdea])}`}
                    className={cn(
                      buttonVariants(),
                      "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] px-6 h-[44px]"
                    )}
                  >
                    Generate scripts
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <button
                    onClick={() => {
                      setIdeas([]);
                      setSelectedIdea(null);
                    }}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-[8px] px-6 h-[44px]"
                    )}
                  >
                    Start over
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {ideas.length === 0 && !isGenerating && (
            <div className="bg-card border border-border rounded-[12px] p-12 text-center">
              <Lightbulb
                size={32}
                className="mx-auto mb-4 text-muted-foreground"
              />
              <p className="text-muted-foreground">
                Enter a topic above to generate content ideas
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
