"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coins, Loader2 } from "lucide-react";
import { useCredits } from "@/lib/use-credits";

export function CreditsCard() {
  const { credits, isLoading } = useCredits();

  const balance = credits?.balance || 0;
  const totalUsed = credits?.totalUsed || 0;

  return (
    <div className="bg-card border border-border rounded-[12px] p-6">
      <h2 className="font-heading text-xl mb-2">Your Credits</h2>
      {isLoading ? (
        <div className="flex items-center gap-2 mb-4">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-3xl font-heading">{balance}</p>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>
          {totalUsed > 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              {totalUsed} used total
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            {balance === 0
              ? "Purchase a script pack to start generating."
 : `${balance} script${balance !== 1 ? "s" : ""} remaining.`}
          </p>
        </>
      )}
      <Link
        href="/#pricing"
        className={cn(
          buttonVariants({ variant: balance === 0 ? "default" : "outline" }),
          "rounded-[8px]",
          balance === 0 && "bg-cta text-cta-foreground hover:bg-cta/90"
        )}
      >
        {balance === 0 ? "Get credits" : "Buy more"}
      </Link>
    </div>
  );
}
