"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Plus,
} from "lucide-react";

interface ScriptBlock {
  id: string;
  type: string;
  content: string;
  order: number;
}

interface Script {
  id: string;
  platform: string;
  status: string;
  content: {
    title?: string;
    description?: string;
    blocks?: ScriptBlock[];
  } | null;
  blocks: ScriptBlock[];
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  topic: string;
  status: string;
  createdAt: string;
  scripts: Script[];
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
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedScripts, setExpandedScripts] = useState<Set<string>>(
    new Set()
  );
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        if (data.project.scripts.length > 0) {
          setExpandedScripts(new Set([data.project.scripts[0].id]));
        }
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScript = (scriptId: string) => {
    setExpandedScripts((prev) => {
      const next = new Set(prev);
      if (next.has(scriptId)) {
        next.delete(scriptId);
      } else {
        next.add(scriptId);
      }
      return next;
    });
  };

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  const copyScript = (script: Script) => {
    const title = script.content?.title || "Untitled";
    const description = script.content?.description || "";
    const blocks = script.blocks || [];
    const text = [
      `# ${title}`,
      "",
      description,
      "",
      ...blocks.map(
        (b) => `[${(blockTypeLabels[b.type] || b.type).toUpperCase()}]\n${b.content}`
      ),
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedScript(script.id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Link
            href="/dashboard/projects"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-[8px]"
            )}
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

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
          <Link
            href="/dashboard/projects"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <ArrowLeft size={14} className="mr-1.5" />
            All projects
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[900px] mx-auto">
          {/* Project header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-heading text-3xl">{project.title}</h1>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  project.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {project.status}
              </span>
            </div>
            <p className="text-muted-foreground mb-3">{project.topic}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} />
              Created {formatDate(project.createdAt)}
            </div>
          </div>

          {/* Scripts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl">
                Scripts ({project.scripts.length})
              </h2>
              <Link
                href={`/dashboard/project/generate?topic=${encodeURIComponent(project.topic)}&idea=${encodeURIComponent(project.title)}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-[8px]"
                )}
              >
                <Plus size={14} className="mr-1.5" />
                Add script
              </Link>
            </div>

            {project.scripts.length === 0 ? (
              <div className="bg-card border border-border rounded-[12px] p-8 text-center">
                <FileText
                  size={32}
                  className="mx-auto mb-3 text-muted-foreground"
                />
                <p className="text-muted-foreground">
                  No scripts generated yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.scripts.map((script) => (
                  <div
                    key={script.id}
                    className="bg-card border border-border rounded-[12px] overflow-hidden"
                  >
                    {/* Script header */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <button
                        onClick={() => toggleScript(script.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <span className="text-sm font-medium">
                          {platformLabels[script.platform] || script.platform}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            script.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : script.status === "generating"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {script.status}
                        </span>
                        {expandedScripts.has(script.id) ? (
                          <ChevronUp
                            size={14}
                            className="text-muted-foreground"
                          />
                        ) : (
                          <ChevronDown
                            size={14}
                            className="text-muted-foreground"
                          />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(script.createdAt)}
                        </span>
                        <button
                          onClick={() => copyScript(script)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy script"
                        >
                          {copiedScript === script.id ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Script content */}
                    {expandedScripts.has(script.id) && (
                      <div className="border-t border-border px-5 py-4">
                        {script.content?.title && (
                          <h3 className="font-heading text-lg mb-1">
                            {script.content.title}
                          </h3>
                        )}
                        {script.content?.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {script.content.description}
                          </p>
                        )}

                        {script.blocks.length > 0 ? (
                          <div className="space-y-2">
                            {script.blocks.map((block) => (
                              <div
                                key={block.id}
                                className="border border-border rounded-[8px] overflow-hidden"
                              >
                                <button
                                  onClick={() => toggleBlock(block.id)}
                                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                                >
                                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {blockTypeLabels[block.type] || block.type}
                                  </span>
                                  {expandedBlocks.has(block.id) ? (
                                    <ChevronUp
                                      size={14}
                                      className="text-muted-foreground"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-muted-foreground"
                                    />
                                  )}
                                </button>
                                {expandedBlocks.has(block.id) && (
                                  <div className="px-3 pb-3 pt-1">
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                      {block.content}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No content blocks available.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
