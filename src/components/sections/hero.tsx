import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative min-h-[720px] lg:min-h-[840px] flex items-center overflow-hidden bg-surface">
      <div className="container mx-auto px-4 relative z-10 py-32 lg:py-40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          <div className="max-w-[580px]">
            <h1 className="font-heading text-white text-[40px] leading-[105%] tracking-[-0.03em] lg:text-[56px] lg:leading-[110%] mb-6">
              From idea to publish-ready scripts in minutes
            </h1>

            <p className="text-white/60 text-base lg:text-lg max-w-[520px] mb-10 leading-relaxed">
              Turn any topic into platform-perfect scripts for YouTube, TikTok,
              Reels, Shorts, Instagram, and LinkedIn. One idea, five platforms,
              zero guesswork.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[10px] px-8 h-[52px] text-base font-medium"
                )}
              >
                Get started free
              </Link>
              <Link
                href="#how-it-works"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/20 hover:bg-white/50 rounded-[10px] px-8 h-[52px] text-black"
                )}
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="hidden lg:block w-full max-w-[560px]">
            <img
              src="/images/hero-illustration.svg"
              alt="ScriptForge AI content generation workflow showing idea to multi-platform scripts"
              className="w-full h-auto rounded-[16px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
