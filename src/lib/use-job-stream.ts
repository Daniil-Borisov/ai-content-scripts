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

export function useJobStream(jobId: string | null) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      disconnect();
      return;
    }

    const eventSource = new EventSource(`/api/jobs/stream?jobId=${jobId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as JobStatus;
        setStatus(data);

        if (data.state === "completed" || data.state === "failed" || data.state === "not_found") {
          disconnect();
        }
      } catch (error) {
        console.error("SSE parse error:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // EventSource will auto-reconnect
    };

    return () => {
      disconnect();
    };
  }, [jobId, disconnect]);

  return { status, isConnected };
}
