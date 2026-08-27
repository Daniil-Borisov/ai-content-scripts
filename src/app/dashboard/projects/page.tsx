"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  FileText,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  topic: string;
  status: string;
  createdAt: string;
  scripts: {
    id: string;
    platform: string;
    status: string;
    createdAt: string;
  }[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  ideas_generated: { label: "Ideas", color: "bg-blue-100 text-blue-700" },
  researching: { label: "Researching", color: "bg-amber-100 text-amber-700" },
  research_complete: {
    label: "Researched",
    color: "bg-amber-100 text-amber-700",
  },
  generating: { label: "Generating", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
};

const platformLabels: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  reels: "Reels",
  shorts: "Shorts",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X / Threads",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
            href="/dashboard/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px]"
            )}
          >
            <Plus size={14} className="mr-1.5" />
            New project
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[800px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl mb-1">Projects</h1>
              <p className="text-muted-foreground">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-card border border-border rounded-[12px] p-12 text-center">
              <FileText
                size={40}
                className="mx-auto mb-4 text-muted-foreground"
              />
              <h2 className="font-heading text-xl mb-2">No projects yet</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first project to start generating scripts.
              </p>
              <Link
                href="/dashboard/new"
                className={cn(
                  buttonVariants(),
                  "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px]"
                )}
              >
                <Plus size={16} className="mr-2" />
                Create project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/project/${project.id}`}
                  className="block bg-card border border-border rounded-[12px] p-5 hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium truncate">
                          {project.title}
                        </h3>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full shrink-0",
                            (statusLabels[project.status] || statusLabels.draft)
                              .color
                          )}
                        >
                          {(statusLabels[project.status] || statusLabels.draft)
                            .label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-3">
                        {project.topic}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatDate(project.createdAt)}
                        </div>
                        {project.scripts.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            {project.scripts.map((script) => (
                              <span
                                key={script.id}
                                className="text-xs bg-muted px-1.5 py-0.5 rounded"
                              >
                                {platformLabels[script.platform] ||
                                  script.platform}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground shrink-0 mt-1"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
