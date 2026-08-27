"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJobStream } from "@/lib/use-job-stream";
import { useCredits } from "@/lib/use-credits";
import { FeedbackButtons } from "@/components/feedback-buttons";
import { GenerationProgress } from "@/components/generation-progress";
import {
  Search,
  FileText,
  ArrowRight,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  RefreshCw,
  Copy,
  Check as CheckIcon,
  X,
  Save,
  Zap,
  Coins,
} from "lucide-react";

type ResearchType = {
  keyFacts: string[];
  insights: string[];
  sources: string[];
  statistics: string[];
  expertQuotes: string[];
};

type ScriptBlockType = {
  type: string;
  content: string;
  order: number;
};

type ScriptType = {
  blocks: ScriptBlockType[];
  title: string;
  description: string;
};

function GenerateContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "";
  const idea = searchParams.get("idea") || "";

  const [step, setStep] = useState<"research" | "script" | "complete">("research");
  const [research, setResearch] = useState<ResearchType | null>(null);
  const [script, setScript] = useState<ScriptType | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([0]));
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [regeneratingBlock, setRegeneratingBlock] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const researchEnqueuedRef = useRef(false);

  // Job IDs for SSE streaming
  const [researchJobId, setResearchJobId] = useState<string | null>(null);
  const [scriptJobId, setScriptJobId] = useState<string | null>(null);

  // SSE streams
  const { status: researchStatus, isConnected: researchConnected } = useJobStream(researchJobId);
  const { status: scriptStatus, isConnected: scriptConnected } = useJobStream(scriptJobId);

  // Credits
  const { credits, deductCredits } = useCredits();

  // Handle research job completion
  useEffect(() => {
    if (researchStatus?.state === "completed" && researchStatus.result) {
      const result = researchStatus.result as { research: ResearchType };
      setResearch(result.research);
      setStep("script");
      setResearchJobId(null);
    }
  }, [researchStatus]);

  // Handle script job completion
  useEffect(() => {
    if (scriptStatus?.state === "completed" && scriptStatus.result) {
      const result = scriptStatus.result as { script: ScriptType };
      setScript(result.script);
      setStep("complete");
      setExpandedBlocks(new Set([0]));
      setScriptJobId(null);
    }
  }, [scriptStatus]);

  const enqueueResearch = async () => {
    try {
      const res = await fetch("/api/generate/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, idea }),
      });
      const data = await res.json();
      if (data.jobId) {
        setResearchJobId(data.jobId);
      }
    } catch (error) {
      console.error("Failed to enqueue research:", error);
    }
  };

  const enqueueScript = async () => {
    if (!research) return;

    // Check credits
    if (!credits || credits.balance < 1) {
      alert("Insufficient credits. Please purchase a script pack.");
      return;
    }

    // Deduct credit
    const deducted = await deductCredits(1, "YouTube script generation");
    if (!deducted) {
      alert("Failed to deduct credits. Please try again.");
      return;
    }

    try {
      const res = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          idea,
          research,
          platform: "youtube",
        }),
      });
      const data = await res.json();
      if (data.jobId) {
        setScriptJobId(data.jobId);
      }
    } catch (error) {
      console.error("Failed to enqueue script:", error);
    }
  };

  const regenerateBlock = async (index: number) => {
    if (!script || !research) return;
    setRegeneratingBlock(index);
    try {
      const block = script.blocks[index];
      const res = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          idea,
          research,
          platform: "youtube",
          regenerateBlock: block.type,
          existingBlocks: script.blocks.filter((_, i) => i !== index),
        }),
      });
      const data = await res.json();
      if (data.jobId) {
        // Use SSE for this regeneration
        const eventSource = new EventSource(`/api/jobs/stream?jobId=${data.jobId}`);
        eventSource.onmessage = (event) => {
          try {
            const statusData = JSON.parse(event.data);
            if (statusData.state === "completed" && statusData.result) {
              eventSource.close();
              const result = statusData.result as { script: ScriptType };
              if (result.script?.blocks?.[0]) {
                const newBlocks = [...script.blocks];
                newBlocks[index] = result.script.blocks[0];
                setScript({ ...script, blocks: newBlocks });
              }
              setRegeneratingBlock(null);
            } else if (statusData.state === "failed") {
              eventSource.close();
              setRegeneratingBlock(null);
            }
          } catch (error) {
            console.error("SSE parse error:", error);
          }
        };
        eventSource.onerror = () => {
          eventSource.close();
          setRegeneratingBlock(null);
        };
      }
    } catch (error) {
      console.error("Failed to regenerate block:", error);
      setRegeneratingBlock(null);
    }
  };

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

  const startEditingBlock = (index: number) => {
    if (!script) return;
    setEditingBlock(index);
    setEditContent(script.blocks[index].content);
    setExpandedBlocks((prev) => new Set([...prev, index]));
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const saveBlock = () => {
    if (editingBlock === null || !script) return;
    const newBlocks = [...script.blocks];
    newBlocks[editingBlock] = { ...newBlocks[editingBlock], content: editContent };
    setScript({ ...script, blocks: newBlocks });
    setEditingBlock(null);
    setEditContent("");
  };

  const cancelEditing = () => {
    setEditingBlock(null);
    setEditContent("");
  };

  const startEditingTitle = () => {
    if (!script) return;
    setEditingTitle(true);
    setEditTitle(script.title);
  };

  const saveTitle = () => {
    if (!script) return;
    setScript({ ...script, title: editTitle });
    setEditingTitle(false);
  };

  const startEditingDescription = () => {
    if (!script) return;
    setEditingDescription(true);
    setEditDescription(script.description);
  };

  const saveDescription = () => {
    if (!script) return;
    setScript({ ...script, description: editDescription });
    setEditingDescription(false);
  };

  const copyScript = () => {
    if (!script) return;
    const text = [
      `# ${script.title}`,
      "",
      script.description,
      "",
      ...script.blocks.map((b) => `[${b.type.toUpperCase()}]\n${b.content}`),
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
  };

  const isGeneratingResearch = researchJobId !== null && researchStatus?.state !== "completed" && researchStatus?.state !== "failed";
  const isGeneratingScript = scriptJobId !== null && scriptStatus?.state !== "completed" && scriptStatus?.state !== "failed";

  useEffect(() => {
    if (topic && idea && !research && !researchJobId && !researchEnqueuedRef.current) {
      researchEnqueuedRef.current = true;
      enqueueResearch();
    }
  }, [topic, idea]);

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
            {/* Credits display */}
            <div className="flex items-center gap-1.5 text-sm">
              <Coins size={14} className="text-muted-foreground" />
              <span className="font-medium">{credits?.balance || 0}</span>
            </div>
            {script && (
              <button
                onClick={copyScript}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-[8px]"
                )}
              >
                {copied ? (
                  <>
                    <CheckIcon size={14} className="mr-1.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1.5" />
                    Copy all
                  </>
                )}
              </button>
            )}
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" })
              )}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[900px] mx-auto">
          {/* Progress steps */}
          <div className="flex items-center gap-4 mb-8">
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                step === "research"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step === "research" && isGeneratingResearch ? (
                <Loader2 size={16} className="animate-spin" />
              ) : step === "research" ? (
                <Search size={16} />
              ) : (
                <Check size={16} className="text-green-600" />
              )}
              Research
            </div>
            <div className="flex-1 h-px bg-border" />
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                step === "script"
                  ? "text-foreground font-medium"
                  : step === "complete"
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
              )}
            >
              {step === "script" && isGeneratingScript ? (
                <Loader2 size={16} className="animate-spin" />
              ) : step === "complete" ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <FileText size={16} />
              )}
              Script
            </div>
            <div className="flex-1 h-px bg-border" />
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                step === "complete"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground/50"
              )}
            >
              <ArrowRight size={16} />
              Edit
            </div>
          </div>

          {/* Topic & Idea */}
          <div className="bg-card border border-border rounded-[12px] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Topic
                </p>
                <p className="font-medium">{topic}</p>
              </div>
              <div className="text-right max-w-[50%]">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Angle
                </p>
                <p className="text-sm text-muted-foreground">{idea}</p>
              </div>
            </div>
          </div>

          {/* Research section */}
          {step === "research" && (
            <div className="bg-card border border-border rounded-[12px] p-8">
              {isGeneratingResearch ? (
                <GenerationProgress
                  description="Gathering facts, insights, and sources for your content."
                  icon={<Zap size={20} className="text-foreground" />}
                  isConnected={researchConnected}
                  statusLabels={[
                    "Initializing research...",
                    "Scanning sources...",
                    "Collecting key facts...",
                    "Finding insights...",
                    "Pulling statistics...",
                    "Almost done...",
                  ]}
                />
              ) : (
                <div className="text-center">
                  <Search
                    size={32}
                    className="mx-auto mb-4 text-muted-foreground"
                  />
                  <p className="font-medium mb-2">Ready to research</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    We&apos;ll gather key facts, insights, and sources for your
                    content.
                  </p>
                  <button
                    onClick={enqueueResearch}
                    className={cn(
                      buttonVariants(),
                      "bg-foreground text-background hover:bg-foreground/90 rounded-[8px]"
                    )}
                  >
                    Start research
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Research results */}
          {research && step !== "research" && (
            <div className="space-y-4 mb-6">
              <h2 className="font-heading text-xl">Research Results</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-[12px] p-5">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Key Facts
                  </h3>
                  <ul className="space-y-2">
                    {research.keyFacts.map((fact, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground pl-4 border-l border-border"
                      >
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-[12px] p-5">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Insights
                  </h3>
                  <ul className="space-y-2">
                    {research.insights.map((insight, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground pl-4 border-l border-border"
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-[12px] p-5">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Statistics
                  </h3>
                  <ul className="space-y-2">
                    {research.statistics.map((stat, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground pl-4 border-l border-border"
                      >
                        {stat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-[12px] p-5">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Sources
                  </h3>
                  <ul className="space-y-2">
                    {research.sources.map((source, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground pl-4 border-l border-border"
                      >
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {step === "script" && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={enqueueScript}
                    disabled={isGeneratingScript}
                    className={cn(
                      buttonVariants(),
                      "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] px-6",
                      "disabled:opacity-50"
                    )}
                  >
                    {isGeneratingScript ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Generating script...
                      </>
                    ) : (
                      <>
                        Generate YouTube script
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Script generation progress */}
          {step === "script" && isGeneratingScript && (
            <div className="bg-card border border-border rounded-[12px] p-8 mb-6">
              <GenerationProgress
                accent="cta"
                description="Creating your YouTube script with hooks, structure, and CTAs."
                icon={<FileText size={20} className="text-cta" />}
                isConnected={scriptConnected}
                statusLabels={[
                  "Initializing script...",
                  "Crafting the hook...",
                  "Building structure...",
                  "Writing main content...",
                  "Adding CTAs...",
                  "Almost done...",
                ]}
              />
            </div>
          )}

          {/* Script Editor */}
          {script && step === "complete" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl">Script Editor</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  YouTube
                </span>
              </div>

              {/* Title & Description */}
              <div className="bg-card border border-border rounded-[12px] p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest">
                      Title
                    </label>
                    {!editingTitle && (
                      <button
                        onClick={startEditingTitle}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    )}
                  </div>
                  {editingTitle ? (
                    <div className="flex gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-[8px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                        autoFocus
                      />
                      <button
                        onClick={saveTitle}
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "rounded-[8px]"
                        )}
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setEditingTitle(false)}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "rounded-[8px]"
                        )}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <p className="font-heading text-lg">{script.title}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest">
                      Description
                    </label>
                    {!editingDescription && (
                      <button
                        onClick={startEditingDescription}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    )}
                  </div>
                  {editingDescription ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-[8px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={saveDescription}
                          className={cn(
                            buttonVariants({ size: "sm" }),
                            "rounded-[8px]"
                          )}
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => setEditingDescription(false)}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "rounded-[8px]"
                          )}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {script.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Script Blocks */}
              <div className="space-y-2">
                {script.blocks.map((block, i) => (
                  <div
                    key={i}
                    className={cn(
                      "border rounded-[12px] overflow-hidden transition-colors",
                      editingBlock === i
                        ? "border-foreground/30 bg-card"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <button
                        onClick={() => toggleBlock(i)}
                        className="flex items-center gap-2 flex-1 text-left"
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditingBlock(i)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit block"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => regenerateBlock(i)}
                          disabled={regeneratingBlock === i}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          title="Regenerate block"
                        >
                          {regeneratingBlock === i ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RefreshCw size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedBlocks.has(i) && (
                      <div className="px-4 pb-4">
                        {editingBlock === i ? (
                          <div className="space-y-2">
                            <textarea
                              ref={textareaRef}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-[8px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none min-h-[120px]"
                              rows={6}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={saveBlock}
                                className={cn(
                                  buttonVariants({ size: "sm" }),
                                  "rounded-[8px]"
                                )}
                              >
                                <Save size={14} className="mr-1.5" />
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className={cn(
                                  buttonVariants({ variant: "ghost", size: "sm" }),
                                  "rounded-[8px]"
                                )}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed mb-3">
                              {block.content}
                            </p>
                            <FeedbackButtons
                              scriptId="current"
                              blockId={`block-${i}`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <button
                  onClick={copyScript}
                  className={cn(
                    buttonVariants(),
                    "bg-foreground text-background hover:bg-foreground/90 rounded-[8px]"
                  )}
                >
                  {copied ? (
                    <>
                      <CheckIcon size={16} className="mr-2" />
                      Copied to clipboard
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy full script
                    </>
                  )}
                </button>
                <Link
                  href="/dashboard/project/new/pack"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-[8px]"
                  )}
                >
                  Generate for all platforms
                </Link>
                <Link
                  href="/dashboard/new"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "rounded-[8px]"
                  )}
                >
                  New project
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
