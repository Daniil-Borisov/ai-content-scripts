import { NextResponse } from "next/server";
import { getBuildInfo } from "@/lib/build-info";
import { db } from "@/lib/db";

export type HealthStatusType = {
  status: "ok" | "degraded" | "error";
  build: {
    gitSha: string;
    gitShaFull: string;
    builtAt: string;
    branch: string;
  };
  checks: {
    database: {
      ok: boolean;
      latencyMs: number | null;
      error?: string;
    };
  };
  timestamp: string;
};

export const GET = async (): Promise<NextResponse<HealthStatusType>> => {
  const timestamp = new Date().toISOString();
  const build = await getBuildInfo();
  const startedAt = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startedAt;

    return NextResponse.json(
      {
        status: "ok",
        build,
        checks: {
          database: { ok: true, latencyMs },
        },
        timestamp,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    return NextResponse.json(
      {
        status: "error",
        build,
        checks: {
          database: {
            ok: false,
            latencyMs: null,
            error: message,
          },
        },
        timestamp,
      },
      { status: 503 }
    );
  }
};
