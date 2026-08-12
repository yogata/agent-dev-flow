// ZIP compress/extract helpers for archive-builder.
//
// Extracted from archive-builder.ts to keep that module under the 250 pure
// LOC ceiling. These helpers wrap platform-specific zip tools using
// argument-array APIs (parent defect #2: no shell-string interpolation).

import * as fs from "fs";
import { execFileSync } from "child_process";
import { computeSha256 } from "./archive-builder.ts";

export interface ActualEntry {
  readonly path: string;
  readonly sha256: string;
  readonly size: number;
}

export function extractZip(zipPath: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  if (process.platform === "win32") {
    // Argument-array invocation: no shell, no string interpolation. The
    // zipPath/dst are passed as literal argv elements via env vars so any
    // quote or metacharacter in them cannot escape the argument boundary.
    const script =
      `Expand-Archive -LiteralPath $env:TRUST_ZIP -DestinationPath $env:TRUST_DST -Force`;
    execFileSync(
      "powershell",
      ["-NoProfile", "-Command", script],
      {
        env: {
          ...process.env,
          TRUST_ZIP: zipPath,
          TRUST_DST: dst,
        },
      },
    );
  } else {
    execFileSync("unzip", ["-o", "-q", zipPath, "-d", dst]);
  }
}

export function collectActualEntries(root: string): ActualEntry[] {
  const out: ActualEntry[] = [];
  const walk = (dir: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${ent.name}`;
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const rel = full.substring(root.length + 1).replace(/\\/g, "/");
        const bytes = fs.readFileSync(full);
        out.push({
          path: rel,
          sha256: computeSha256(new Uint8Array(bytes)),
          size: bytes.length,
        });
      }
    }
  };
  walk(root);
  return out;
}

export function compressStage(stageDir: string, zipPath: string): void {
  fs.rmSync(zipPath, { force: true });
  if (process.platform === "win32") {
    // Argument-array invocation: paths are passed via env vars and read
    // inside PowerShell as $env:*, so metacharacters in stageDir/zipPath
    // cannot break out of the script string. Compress-Archive -Path
    // '${stage}\*' would include the dir name as a prefix; we pass the
    // glob explicitly via env to compress contents only.
    const script =
      `Compress-Archive -Path (Join-Path $env:TRUST_STAGE '*') -DestinationPath $env:TRUST_ZIP -Force`;
    execFileSync(
      "powershell",
      ["-NoProfile", "-Command", script],
      {
        env: {
          ...process.env,
          TRUST_STAGE: stageDir,
          TRUST_ZIP: zipPath,
        },
      },
    );
  } else {
    // POSIX: cwd is set via execFileSync option (no shell, no `cd X &&`
    // string). zip stores entries without the stage-dir prefix.
    execFileSync("zip", ["-r", "-q", zipPath, "."], { cwd: stageDir });
  }
}
