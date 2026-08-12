// Bootstrap digest report generator.
//
// Produces an independent JSON digest report of every trust-root file at
// a given OID. Used for PR review evidence: the launcher cannot validate
// itself (chicken-and-egg), so the bootstrap PR's review uses this report
// to audit trust-root integrity at the base OID before accepting the
// candidate.
//
// This module does NOT run the launcher pipeline. It reads git blobs
// directly and emits a self-contained JSON report.

import type { GitOid, RepoPath } from "./types.ts";
import { assertGitOid } from "./types.ts";
import { makeProductionAdapter } from "./git-blob-reader.ts";
import {
  DEFAULT_PROTECTED_PATH_SET,
  listAllProtectedPaths,
} from "./protected-paths.ts";
import { computeSha256 } from "./archive-builder.ts";

export interface BootstrapReportEntry {
  readonly path: string;
  readonly sha256: string | null;
  readonly size: number;
  readonly status: "present" | "missing";
}

export interface BootstrapReport {
  readonly ok: boolean;
  readonly oid: string;
  readonly generated_at: string;
  readonly entries: readonly BootstrapReportEntry[];
}

export function bootstrapDigestReport(
  repoRoot: string,
  oidStr: string,
): BootstrapReport & { ok: boolean } {
  let oid: GitOid;
  try {
    oid = assertGitOid(oidStr);
  } catch {
    return {
      ok: false,
      oid: oidStr,
      generated_at: new Date().toISOString(),
      entries: [],
    };
  }
  const adapter = makeProductionAdapter(repoRoot as RepoPath);
  const paths = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
  const entries: BootstrapReportEntry[] = [];
  let allPresent = true;
  for (const p of paths) {
    try {
      const buf = adapter.spawnGit(["cat-file", "blob", `${oid}:${p}`]);
      const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
      entries.push({
        path: p,
        sha256: computeSha256(bytes),
        size: bytes.length,
        status: "present",
      });
    } catch (e) {
      void e;
      entries.push({ path: p, sha256: null, size: 0, status: "missing" });
      allPresent = false;
    }
  }
  return {
    ok: allPresent,
    oid: oidStr,
    generated_at: new Date().toISOString(),
    entries,
  };
}
