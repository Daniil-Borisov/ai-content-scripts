"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send } from "lucide-react";

interface FeedbackButtonsProps {
  scriptId: string;
  blockId?: string;
  initialRating?: "up" | "down" | null;
  onFeedback?: (rating: "up" | "down", comment?: string) => void;
}

export function FeedbackButtons({
  scriptId,
  blockId,
  initialRating,
  onFeedback,
}: FeedbackButtonsProps) {
  const [rating, setRating] = useState<"up" | "down" | null>(initialRating || null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = async (newRating: "up" | "down") => {
    if (submitted) return;

    setRating(newRating);

    // If thumbs down, show comment input
    if (newRating === "down") {
      setShowComment(true);
      return;
    }

    // Submit positive feedback immediately
    await submitFeedback(newRating);
  };

  const submitFeedback = async (finalRating: "up" | "down", finalComment?: string) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptId,
          blockId,
          rating: finalRating,
          comment: finalComment || comment || undefined,
        }),
      });
      setSubmitted(true);
      onFeedback?.(finalRating, finalComment || comment || undefined);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    await submitFeedback("down", comment);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Thanks for your feedback</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleRate("up")}
          disabled={isSubmitting}
          className={cn(
            "p-1 rounded-md transition-colors",
            rating === "up"
              ? "bg-green-100 text-green-600"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          title="Good"
        >
          <ThumbsUp size={14} />
        </button>
        <button
          onClick={() => handleRate("down")}
          disabled={isSubmitting}
          className={cn(
            "p-1 rounded-md transition-colors",
            rating === "down"
              ? "bg-red-100 text-red-600"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          title="Needs improvement"
        >
          <ThumbsDown size={14} />
        </button>
        {!showComment && rating !== "down" && (
          <button
            onClick={() => setShowComment(true)}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Add comment"
          >
            <MessageSquare size={14} />
          </button>
        )}
      </div>

      {showComment && (
        <div className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What could be improved?"
            className="flex-1 h-8 px-3 rounded-[6px] border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-foreground/20"
            onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
            autoFocus
          />
          <button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !comment.trim()}
            className="p-1.5 rounded-md bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            <Send size={12} />
          </button>
          <button
            onClick={() => {
              setShowComment(false);
              setComment("");
            }}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
