import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative min-h-[720px] lg:min-h-[840px] flex items-center overflow-hidden bg-surface">
      <div className="container mx-auto px-4 relative z-10 py-32 lg:py-40">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
          <div className="max-w-[680px]">
            <h1 className="font-heading text-white text-[40px] leading-[105%] tracking-[-0.03em] lg:text-[56px] lg:leading-[110%] mb-6">
              From idea to publish-ready scripts in minutes
            </h1>

            <p className="text-white/60 text-base lg:text-lg max-w-[520px] mb-10 leading-relaxed">
              Turn any topic into platform-perfect scripts for YouTube, TikTok,
              Reels, Shorts, Instagram, and LinkedIn. One idea, five platforms,
              zero guesswork.
            </p>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[10px] px-8 h-[52px] text-base font-medium"
              )}
            >
              Get started
            </Link>
          </div>

          <div className="hidden lg:block w-full max-w-[480px]">
            <div className="bg-white/5 border border-white/10 rounded-[16px] p-8 h-[360px] flex flex-col justify-between">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-4">Content Pack Preview</div>
                <div className="space-y-3">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-5/6" />
                  <div className="h-px bg-white/10 my-4" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/10 rounded w-4/5" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div>
                  <div className="h-2.5 bg-white/10 rounded w-24 mb-1" />
                  <div className="h-2 bg-white/5 rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
