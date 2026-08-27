"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJobStream } from "@/lib/use-job-stream";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  Zap,
} from "lucide-react";

interface ScriptBlock {
  type: string;
  content: string;
  order: number;
}

interface Script {
  platform: string;
  blocks: ScriptBlock[];
  title: string;
  description: string;
  status: "pending" | "generating" | "completed" | "failed";
  jobId?: string;
}

const platformLabels: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  reels: "Reels",
  shorts: "Shorts",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X / Threads",
};

const blockTypeLabels: Record<string, string> = {
  hook: "Hook",
  intro: "Introduction",
  body: "Main Content",
  cta: "Call to Action",
  title: "Title Options",
  description: "Description",
  broll: "B-Roll Suggestions",
  caption: "Caption",
  hashtags: "Hashtags",
  "on-screen": "On-Screen Text",
  slides: "Slides",
  thread: "Thread",
};

function ScriptCard({
  script,
  onCopy,
}: {
  script: Script;
  onCopy: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const { status: jobStatus } = useJobStream(
    script.status === "generating" ? script.jobId || null : null
  );

  const toggleBlock = (index: number) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGenerating = script.status === "generating";
  const progress = (jobStatus?.progress as number) || 0;

  return (
    <div className="bg-card border border-border rounded-[12px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {platformLabels[script.platform] || script.platform}
          </span>
          {isGenerating && (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          )}
          {script.status === "completed" && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
              Ready
            </span>
          )}
          {script.status === "failed" && (
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
              Failed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {script.status === "completed" && (
            <>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Copy script"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar for generating */}
      {isGenerating && (
        <div className="px-5 pb-3">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      {expanded && script.status === "completed" && (
        <div className="border-t border-border px-5 py-4">
          {script.title && (
            <h3 className="font-heading text-base mb-1">{script.title}</h3>
          )}
          {script.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {script.description}
            </p>
          )}

          <div className="space-y-2">
            {script.blocks.map((block, i) => (
              <div
                key={i}
                className="border border-border rounded-[8px] overflow-hidden"
              >
                <button
                  onClick={() => toggleBlock(i)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {blockTypeLabels[block.type] || block.type}
                  </span>
                  {expandedBlocks.has(i) ? (
                    <ChevronUp size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  )}
                </button>
                {expandedBlocks.has(i) && (
                  <div className="px-3 pb-3 pt-1">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {block.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const startGeneration = async () => {
    if (selectedPlatforms.length === 0) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "Sample topic",
          idea: "Sample idea",
          research: {
            keyFacts: ["Fact 1", "Fact 2"],
            insights: ["Insight 1"],
            statistics: ["Stat 1"],
          },
          platforms: selectedPlatforms,
        }),
      });
      const data = await res.json();
      if (data.jobIds) {
        setScripts(
          data.jobIds.map(
            (item: { platform: string; jobId: string }) => ({
              platform: item.platform,
              blocks: [],
              title: "",
              description: "",
              status: "generating" as const,
              jobId: item.jobId,
            })
          )
        );
      }
    } catch (error) {
      console.error("Failed to start generation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScript = (script: Script) => {
    const text = [
      `# ${script.title}`,
      "",
      script.description,
      "",
      ...script.blocks.map(
        (b) => `[${(blockTypeLabels[b.type] || b.type).toUpperCase()}]\n${b.content}`
      ),
    ].join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const copyAllScripts = () => {
    const text = scripts
      .filter((s) => s.status === "completed")
      .map((script) => {
        return [
          `=== ${platformLabels[script.platform]} ===`,
          "",
          `# ${script.title}`,
          "",
          script.description,
          "",
          ...script.blocks.map(
            (b) => `[${(blockTypeLabels[b.type] || b.type).toUpperCase()}]\n${b.content}`
          ),
        ].join("\n");
      })
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
  };

  const completedCount = scripts.filter((s) => s.status === "completed").length;
  const totalCount = scripts.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <span className="text-white font-bold text-xs">SF</span>
            </div>
            <span className="font-heading text-lg tracking-tight">
              ScriptForge
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {completedCount > 0 && (
              <button
                onClick={copyAllScripts}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-[8px]"
                )}
              >
                <Download size={14} className="mr-1.5" />
                Export all
              </button>
            )}
            <Link
              href="/dashboard/projects"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" })
              )}
            >
              <ArrowLeft size={14} className="mr-1.5" />
              Projects
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[900px] mx-auto">
          <h1 className="font-heading text-3xl mb-2">Content Pack</h1>
          <p className="text-muted-foreground mb-8">
            Generate scripts for multiple platforms at once.
          </p>

          {/* Platform selection */}
          {scripts.length === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl mb-4">Select platforms</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    { id: "youtube", label: "YouTube", desc: "5–30+ min" },
                    { id: "tiktok", label: "TikTok", desc: "15–90 sec" },
                    { id: "reels", label: "Reels", desc: "15–90 sec" },
                    { id: "shorts", label: "Shorts", desc: "15–60 sec" },
                    { id: "instagram", label: "Instagram", desc: "5–10 slides" },
                    { id: "linkedin", label: "LinkedIn", desc: "Post" },
                    { id: "x", label: "X / Threads", desc: "Thread" },
                  ].map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => {
                          setSelectedPlatforms((prev) =>
                            prev.includes(platform.id)
                              ? prev.filter((p) => p !== platform.id)
                              : [...prev, platform.id]
                          );
                        }}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-3 rounded-[10px] text-left transition-all",
                          isSelected
                            ? "bg-foreground text-white"
                            : "bg-card border border-border hover:border-foreground/20"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{platform.label}</p>
                          <p
                            className={cn(
                              "text-xs",
                              isSelected ? "text-white/60" : "text-muted-foreground"
                            )}
                          >
                            {platform.desc}
                          </p>
                        </div>
                        {isSelected && <Check size={14} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={startGeneration}
                  disabled={selectedPlatforms.length === 0 || isGenerating}
                  className={cn(
                    buttonVariants(),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] px-6",
                    "disabled:opacity-50"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Zap size={16} className="mr-2" />
                      Generate {selectedPlatforms.length} script
                      {selectedPlatforms.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Scripts grid */}
          {scripts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl">
                  Scripts ({completedCount}/{totalCount})
                </h2>
                {completedCount === totalCount && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    All complete
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {scripts.map((script, i) => (
                  <ScriptCard
                    key={script.platform}
                    script={script}
                    onCopy={() => copyScript(script)}
                  />
                ))}
              </div>

              {completedCount === totalCount && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={copyAllScripts}
                    className={cn(
                      buttonVariants(),
                      "bg-foreground text-background hover:bg-foreground/90 rounded-[8px]"
                    )}
                  >
                    <Download size={16} className="mr-2" />
                    Export all scripts
                  </button>
                  <Link
                    href="/dashboard/new"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-[8px]"
                    )}
                  >
                    New project
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
