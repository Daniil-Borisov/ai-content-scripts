"use client";

import { useState, use } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Image,
  Type,
  BarChart3,
  Video,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Palette,
  Target,
  Zap,
} from "lucide-react";

interface ThumbnailConcept {
  concept: string;
  description: string;
  style: string;
  colors: string[];
}

interface TitleScore {
  overallScore: number;
  titleScore: number;
  thumbnailScore: number | null;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  emotionalTriggers: string[];
}

interface VisualAsset {
  type: string;
  description: string;
  dimensions: string;
  elements: string[];
  textOverlay: string;
}

interface BRollSuggestion {
  timestamp: string;
  description: string;
  searchTerms: string[];
  mood: string;
}

export default function VisualsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState<"thumbnails" | "scoring" | "visuals" | "broll">("thumbnails");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");

  // Thumbnail concepts
  const [concepts, setConcepts] = useState<ThumbnailConcept[]>([]);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  // Scoring
  const [score, setScore] = useState<TitleScore | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  // Visual assets
  const [visuals, setVisuals] = useState<VisualAsset[]>([]);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);

  // B-roll
  const [broll, setBroll] = useState<BRollSuggestion[]>([]);
  const [isGeneratingBRoll, setIsGeneratingBRoll] = useState(false);
  const [scriptContent, setScriptContent] = useState("");

  const generateThumbnails = async () => {
    if (!title || !topic) return;
    setIsGeneratingThumbnails(true);
    try {
      const res = await fetch("/api/generate/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, topic, platform: "youtube" }),
      });
      const data = await res.json();
      if (data.concepts) setConcepts(data.concepts);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsGeneratingThumbnails(false);
    }
  };

  const scoreTitle = async () => {
    if (!title) return;
    setIsScoring(true);
    try {
      const res = await fetch("/api/generate/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (data.score) setScore(data.score);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsScoring(false);
    }
  };

  const generateVisuals = async () => {
    if (!title || !topic) return;
    setIsGeneratingVisuals(true);
    try {
      const res = await fetch("/api/generate/visuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, topic, platform: "instagram" }),
      });
      const data = await res.json();
      if (data.assets) setVisuals(data.assets);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsGeneratingVisuals(false);
    }
  };

  const generateBRoll = async () => {
    if (!scriptContent) return;
    setIsGeneratingBRoll(true);
    try {
      const res = await fetch("/api/generate/broll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptContent, platform: "youtube" }),
      });
      const data = await res.json();
      if (data.suggestions) setBroll(data.suggestions);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsGeneratingBRoll(false);
    }
  };

  const tabs = [
    { id: "thumbnails" as const, label: "Thumbnails", icon: Image },
    { id: "scoring" as const, label: "Title Scoring", icon: BarChart3 },
    { id: "visuals" as const, label: "Visual Assets", icon: Palette },
    { id: "broll" as const, label: "B-Roll", icon: Video },
  ];

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
            Projects
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Sparkles size={20} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="font-heading text-3xl">AI Pre-production Studio</h1>
              <p className="text-muted-foreground">
                Thumbnails, scoring, visuals, and B-roll suggestions
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="bg-card border border-border rounded-[12px] p-6 mb-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Video/Post Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 10 AI Tools That Will Change Your Life"
                  className="w-full h-10 px-3 rounded-[8px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., AI productivity tools"
                  className="w-full h-10 px-3 rounded-[8px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted p-1 rounded-[10px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-sm transition-colors",
                    activeTab === tab.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Thumbnails tab */}
          {activeTab === "thumbnails" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl">Thumbnail Concepts</h2>
                <button
                  onClick={generateThumbnails}
                  disabled={!title || !topic || isGeneratingThumbnails}
                  className={cn(
                    buttonVariants(),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px]",
                    "disabled:opacity-50"
                  )}
                >
                  {isGeneratingThumbnails ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Image size={16} className="mr-2" />
                  )}
                  Generate concepts
                </button>
              </div>

              {concepts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {concepts.map((concept, i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-[12px] p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium">{concept.concept}</h3>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {concept.style}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {concept.description}
                      </p>
                      <div className="flex gap-2">
                        {concept.colors.map((color, j) => (
                          <div
                            key={j}
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-[12px] p-12 text-center">
                  <Image size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Enter a title and topic above to generate thumbnail concepts
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Scoring tab */}
          {activeTab === "scoring" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl">Title & Thumbnail Scoring</h2>
                <button
                  onClick={scoreTitle}
                  disabled={!title || isScoring}
                  className={cn(
                    buttonVariants(),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px]",
                    "disabled:opacity-50"
                  )}
                >
                  {isScoring ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <BarChart3 size={16} className="mr-2" />
                  )}
                  Score title
                </button>
              </div>

              {score ? (
                <div className="space-y-4">
                  {/* Score cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-[12px] p-5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Overall
                      </p>
                      <p className="text-4xl font-heading">{score.overallScore}</p>
                      <p className="text-xs text-muted-foreground">/ 100</p>
                    </div>
                    <div className="bg-card border border-border rounded-[12px] p-5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Title
                      </p>
                      <p className="text-4xl font-heading">{score.titleScore}</p>
                      <p className="text-xs text-muted-foreground">/ 100</p>
                    </div>
                    <div className="bg-card border border-border rounded-[12px] p-5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Thumbnail
                      </p>
                      <p className="text-4xl font-heading">
                        {score.thumbnailScore || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {score.thumbnailScore ? "/ 100" : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-[12px] p-5">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Target size={14} className="text-green-600" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {score.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground pl-4 border-l border-green-200">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-card border border-border rounded-[12px] p-5">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Zap size={14} className="text-amber-600" />
                        Weaknesses
                      </h3>
                      <ul className="space-y-2">
                        {score.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-muted-foreground pl-4 border-l border-amber-200">
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-card border border-border rounded-[12px] p-5">
                    <h3 className="text-sm font-medium mb-3">Suggestions</h3>
                    <ul className="space-y-2">
                      {score.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground pl-4 border-l border-border">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Emotional triggers */}
                  {score.emotionalTriggers.length > 0 && (
                    <div className="bg-card border border-border rounded-[12px] p-5">
                      <h3 className="text-sm font-medium mb-3">Emotional Triggers</h3>
                      <div className="flex flex-wrap gap-2">
                        {score.emotionalTriggers.map((t, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-[12px] p-12 text-center">
                  <BarChart3 size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Enter a title above to get a CTR score
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Visuals tab */}
          {activeTab === "visuals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl">Visual Assets</h2>
                <button
                  onClick={generateVisuals}
                  disabled={!title || !topic || isGeneratingVisuals}
                  className={cn(
                    buttonVariants(),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px]",
                    "disabled:opacity-50"
                  )}
                >
                  {isGeneratingVisuals ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Palette size={16} className="mr-2" />
                  )}
                  Generate assets
                </button>
              </div>

              {visuals.length > 0 ? (
                <div className="space-y-3">
                  {visuals.map((asset, i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-[12px] p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium capitalize">{asset.type.replace(/_/g, " ")}</h3>
                          <p className="text-xs text-muted-foreground">{asset.dimensions}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {asset.description}
                      </p>
                      {asset.textOverlay && (
                        <div className="mb-3 p-2 bg-muted rounded-[8px]">
                          <p className="text-xs font-medium mb-1">Text Overlay:</p>
                          <p className="text-sm">{asset.textOverlay}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {asset.elements.map((el, j) => (
                          <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded">
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-[12px] p-12 text-center">
                  <Palette size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Enter a title and topic to generate visual asset specs
                  </p>
                </div>
              )}
            </div>
          )}

          {/* B-Roll tab */}
          {activeTab === "broll" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl">B-Roll Suggestions</h2>
                <button
                  onClick={generateBRoll}
                  disabled={!scriptContent || isGeneratingBRoll}
                  className={cn(
                    buttonVariants(),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px]",
                    "disabled:opacity-50"
                  )}
                >
                  {isGeneratingBRoll ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Video size={16} className="mr-2" />
                  )}
                  Suggest B-roll
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Script Content
                </label>
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="Paste your script content here..."
                  className="w-full px-3 py-2.5 rounded-[8px] border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
                  rows={6}
                />
              </div>

              {broll.length > 0 ? (
                <div className="space-y-3">
                  {broll.map((item, i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-[12px] p-5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                          {item.timestamp}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">
                          {item.mood}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.searchTerms.map((term, j) => (
                          <span key={j} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-[12px] p-12 text-center">
                  <Video size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Paste your script content above to get B-roll suggestions
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
