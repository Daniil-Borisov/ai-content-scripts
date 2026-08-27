import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreditsCard } from "@/components/credits-card";
import { Navbar } from "@/components/layout/navbar";
import { Clock, ChevronRight } from "lucide-react";

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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const projects = userId
    ? await db.project.findMany({
        where: { userId },
        include: {
          scripts: {
            select: { id: true, platform: true },
            take: 4,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-[800px]">
          <h1 className="font-heading text-3xl mb-2">
            Welcome, {session.user.name || "Creator"}
          </h1>
          <p className="text-muted-foreground mb-10">
            {projects.length > 0
              ? "Continue where you left off or start a new project."
              : "Create your first content pack to get started."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-[12px] p-6">
              <h2 className="font-heading text-xl mb-2">New Project</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Start with a topic and generate scripts for all platforms.
              </p>
              <Link
                href="/dashboard/new"
                className={cn(
                  buttonVariants(),
                  "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px]"
                )}
              >
                Create project
              </Link>
            </div>

            <CreditsCard />
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl">Recent Projects</h2>
              <Link
                href="/dashboard/projects"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="bg-card border border-border rounded-[12px] p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No projects yet. Create your first one to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => {
                  const status =
                    statusLabels[project.status] || statusLabels.draft;

                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/project/${project.id}`}
                      className="block bg-card border border-border rounded-[12px] p-5 hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="font-medium truncate">
                              {project.title}
                            </h3>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full shrink-0",
                                status.color
                              )}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-2">
                            {project.topic}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {formatDate(project.createdAt)}
                            {project.scripts.length > 0 && (
                              <span className="ml-2">
                                · {project.scripts.length} script
                                {project.scripts.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground shrink-0 mt-1"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
