import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { suggestBRoll } from "@/lib/llm";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scriptContent, platform } = await req.json();

  if (!scriptContent) {
    return NextResponse.json({ error: "Script content required" }, { status: 400 });
  }

  try {
    const result = await suggestBRoll(scriptContent, platform || "youtube");

    return NextResponse.json(result);
  } catch (error) {
    console.error("B-roll suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate B-roll suggestions" },
      { status: 500 }
    );
  }
}
