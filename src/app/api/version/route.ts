import { NextResponse } from "next/server";
import { getBuildInfo } from "@/lib/build-info";

export const GET = async () => {
  const build = await getBuildInfo();
  return NextResponse.json(build, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
