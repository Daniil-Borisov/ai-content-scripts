import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreditsCard } from "@/components/credits-card";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-[800px]">
          <h1 className="font-heading text-3xl mb-2">
            Welcome, {session.user.name || "Creator"}
          </h1>
          <p className="text-muted-foreground mb-10">
            Create your first content pack to get started.
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
            <div className="bg-card border border-border rounded-[12px] p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No projects yet. Create your first one to get started.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
