// Archive verification: extract a zip into a temp dir and compare its
// entries' path+digest+size to an expected set.
//
// Extracted from archive-builder.ts to keep that module under the 250 pure
// LOC ceiling. Pure functions over expected/actual entry sets.

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { collectActualEntries, extractZip } from "./archive-zip.ts";
import { computeSha256 } from "./archive-builder.ts";

export interface ExpectedEntry {
  readonly path: string;
  readonly sha256: string;
  readonly size: number;
}

export interface VerifyResult {
  readonly ok: boolean;
  readonly missing: readonly string[];
  readonly extra: readonly string[];
  readonly digest_mismatches: readonly string[];
}

export function verifyArchive(
  zipPath: string,
  expected: readonly ExpectedEntry[],
): VerifyResult {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "trust-archive-verify-"));
  try {
    extractZip(zipPath, tmpDir);
    const actualEntries = collectActualEntries(tmpDir);
    const expectedMap = new Map(expected.map((e) => [e.path, e]));
    const actualMap = new Map(actualEntries.map((e) => [e.path, e]));

    const missing: string[] = [];
    const extra: string[] = [];
    const digestMismatches: string[] = [];

    for (const [p] of expectedMap) {
      if (!actualMap.has(p)) missing.push(p);
    }
    for (const [p] of actualMap) {
      if (!expectedMap.has(p)) extra.push(p);
    }
    for (const [p, expectedEntry] of expectedMap) {
      const a = actualMap.get(p);
      if (a && (a.sha256 !== expectedEntry.sha256 || a.size !== expectedEntry.size)) {
        digestMismatches.push(p);
      }
    }
    return {
      ok: missing.length === 0 && extra.length === 0 && digestMismatches.length === 0,
      missing: missing.sort(),
      extra: extra.sort(),
      digest_mismatches: digestMismatches.sort(),
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// Re-export for callers that previously imported computeSha256 + verifyArchive
// from archive-builder.ts.
export { computeSha256 };
