"use client";

import { useState, useEffect, useCallback } from "react";

interface Credits {
  balance: number;
  totalUsed: number;
}

export function useCredits() {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/credits");
      const data = await res.json();
      if (data.balance !== undefined) {
        setCredits({ balance: data.balance, totalUsed: data.totalUsed });
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deductCredits = useCallback(
    async (amount: number, description?: string) => {
      try {
        const res = await fetch("/api/credits/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, description }),
        });
        const data = await res.json();
        if (data.balance !== undefined) {
          setCredits({ balance: data.balance, totalUsed: data.totalUsed });
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to deduct credits:", error);
        return false;
      }
    },
    []
  );

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, isLoading, fetchCredits, deductCredits };
}
