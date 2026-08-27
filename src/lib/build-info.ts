import { readFile } from "node:fs/promises";
import path from "node:path";

export type BuildInfoType = {
  gitSha: string;
  gitShaFull: string;
  builtAt: string;
  branch: string;
};

const FALLBACK_BUILD_INFO: BuildInfoType = {
  gitSha: "unknown",
  gitShaFull: "unknown",
  builtAt: "unknown",
  branch: "unknown",
};

export const getBuildInfo = async (): Promise<BuildInfoType> => {
  try {
    const filePath = path.join(process.cwd(), "public", "build-info.json");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<BuildInfoType>;

    return {
      gitSha: parsed.gitSha ?? FALLBACK_BUILD_INFO.gitSha,
      gitShaFull: parsed.gitShaFull ?? FALLBACK_BUILD_INFO.gitShaFull,
      builtAt: parsed.builtAt ?? FALLBACK_BUILD_INFO.builtAt,
      branch: parsed.branch ?? FALLBACK_BUILD_INFO.branch,
    };
  } catch {
    return {
      gitSha: process.env.NEXT_PUBLIC_GIT_SHA ?? FALLBACK_BUILD_INFO.gitSha,
      gitShaFull: process.env.GIT_SHA_FULL ?? FALLBACK_BUILD_INFO.gitShaFull,
      builtAt: process.env.NEXT_PUBLIC_BUILT_AT ?? FALLBACK_BUILD_INFO.builtAt,
      branch: process.env.DEPLOY_BRANCH ?? FALLBACK_BUILD_INFO.branch,
    };
  }
};
