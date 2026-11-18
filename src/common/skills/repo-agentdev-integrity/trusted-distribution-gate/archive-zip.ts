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
    //
    // Uses the .NET ZipFile API directly under pwsh (PowerShell 7) instead
    // of the Microsoft.PowerShell.Archive module (Expand-Archive): when this
    // process tree is launched from pwsh, the inherited PSModulePath makes a
    // child Windows PowerShell 5.1 load the PS7 Archive module, whose
    // 3-argument ExtractToDirectory call has no .NET Framework overload —
    // extraction silently produces an empty tree and archive verification
    // fails with every entry missing. The 2-argument .NET overload is stable
    // across runtimes; the destination is always a fresh temp directory.
    const script =
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; ` +
      `[System.IO.Compression.ZipFile]::ExtractToDirectory($env:TRUST_ZIP, $env:TRUST_DST)`;
    execFileSync(
      "pwsh",
      ["-NoProfile", "-NonInteractive", "-Command", script],
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
    // cannot break out of the script string. Same .NET-direct rationale as
    // extractZip: no Microsoft.PowerShell.Archive module dependency. The
    // `$false` includeBaseDirectory argument stores entries without the
    // stage-dir prefix (equivalent to the previous `-Path '<stage>\*'`).
    const script =
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; ` +
      `[System.IO.Compression.ZipFile]::CreateFromDirectory($env:TRUST_STAGE, $env:TRUST_ZIP, [System.IO.Compression.CompressionLevel]::Optimal, $false)`;
    execFileSync(
      "pwsh",
      ["-NoProfile", "-NonInteractive", "-Command", script],
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
