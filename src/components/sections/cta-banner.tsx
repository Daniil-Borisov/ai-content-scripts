import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CtaBanner() {
  return (
    <section className="container mx-auto px-4 my-10">
      <div className="bg-surface text-surface-foreground rounded-[12px] py-8 px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-heading text-[26px] md:text-[30px] tracking-[-0.025em] leading-[115%] text-white text-center md:text-left">
          Ready to create your first content pack?
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants(),
            "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] px-8 h-[48px] text-base font-medium w-full md:w-auto shrink-0"
          )}
        >
          Start for $4.99
        </Link>
      </div>
    </section>
  );
}
