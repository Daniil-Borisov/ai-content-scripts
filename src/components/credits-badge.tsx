"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coins, Loader2 } from "lucide-react";
import { useCredits } from "@/lib/use-credits";

interface CreditsBadgeProps {
  showPurchaseLink?: boolean;
}

export function CreditsBadge({ showPurchaseLink = true }: CreditsBadgeProps) {
  const { credits, isLoading } = useCredits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
      </div>
    );
  }

  const balance = credits?.balance || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Coins size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium">{balance}</span>
        <span className="text-xs text-muted-foreground">credits</span>
      </div>
      {showPurchaseLink && balance === 0 && (
        <Link
          href="/#pricing"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-[6px] text-xs h-6 px-2"
          )}
        >
          Buy credits
        </Link>
      )}
    </div>
  );
}
