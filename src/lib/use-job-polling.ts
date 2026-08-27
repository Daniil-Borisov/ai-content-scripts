"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface JobStatus {
  id: string;
  type: string;
  state: string;
  progress: number;
  result: Record<string, unknown> | null;
  failedReason: string | null;
}

export function useJobPolling(jobId: string | null, interval = 1000) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/status?jobId=${id}`);
      const data = await res.json();
      setStatus(data);

      if (data.state === "completed" || data.state === "failed") {
        stopPolling();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Polling error:", error);
      return false;
    }
  }, [stopPolling]);

  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      stopPolling();
      return;
    }

    setIsPolling(true);

    // Initial poll
    pollStatus(jobId);

    // Start interval
    intervalRef.current = setInterval(async () => {
      const done = await pollStatus(jobId);
      if (done && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, interval);

    return () => {
      stopPolling();
    };
  }, [jobId, interval, pollStatus, stopPolling]);

  return { status, isPolling, stopPolling };
}
