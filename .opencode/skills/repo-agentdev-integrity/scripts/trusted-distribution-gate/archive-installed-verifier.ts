// Physical archive-installed verifier (parent defect #8).
//
// The launcher's archive-installed projection is a deterministic .opencode/**
// mapping of source-runtime. Verifying it by re-deriving the mapping from
// in-memory bytes is tautological — it proves the mapping is deterministic,
// not that the actual consumer install would produce those files. This
// module performs the real check:
//
//   1. Extract the STAGED archive into a fresh temp directory.
//   2. Read scripts/install-from-archive.ps1 from the BASE oid via
//      `git cat-file blob <base>:scripts/install-from-archive.ps1`. NEVER
//      trust the candidate copy or the working tree — the candidate could
//      have tampered with the installer to lie about its output.
//   3. Write the trusted installer into the temp dir.
//   4. Execute it with array-form argv (no shell), pointing at the
//      extracted archive's src/opencode tree as Source and a fresh temp
//      .opencode dir as Target.
//   5. Walk the installed Target and compare every file's path+digest+size
//      to the archive-installed manifest entries.
//
// Any mismatch is fatal (DigestMismatch). The temp dir is always cleaned
// up. The trusted installer bytes are NOT cached across invocations.

import * as cp from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { GitOid, ManifestEntry, ManifestSet } from "./types.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import { GitBlobMissingError, readBlob } from "./git-blob-reader.ts";
import { PathSafetyError } from "./types.ts";
import { extractZip } from "./archive-zip.ts";
import { computeSha256 } from "./archive-builder.ts";

export interface VerifyInstalledInput {
  readonly adapter: RawGitAdapter;
  /** Base OID; the trusted installer is read from this oid. */
  readonly baseOid: GitOid;
  /** Path to the staged archive zip (before publish). */
  readonly archivePath: string;
  /** Expected archive-installed manifest (the launcher's source of truth). */
  readonly expected: ManifestSet;
  /** Wrapped archive root directory name (e.g. "agentdev-release-abc12345"). */
  readonly archiveRootName: string;
}

export type VerifyInstalledResult =
  | { readonly kind: "ok" }
  | { readonly kind: "mismatch"; readonly reason: string };

/**
 * Verify the archive-installed projection by physically installing the
 * archive with the BASE-OID installer and comparing the result to the
 * expected manifest. Returns ok or a typed mismatch.
 *
 * Throws only for infrastructure failures (cannot extract, cannot execute,
 * cannot read installed files). The launcher maps these to ExitCode.Unexpected.
 */
export function verifyArchiveInstalled(input: VerifyInstalledInput): VerifyInstalledResult {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "trust-installed-"));
  try {
    return verifyInDir(input, work);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

function verifyInDir(input: VerifyInstalledInput, work: string): VerifyInstalledResult {
  const extractDir = path.join(work, "extract");
  fs.mkdirSync(extractDir, { recursive: true });
  extractZip(input.archivePath, extractDir);

  // Locate the wrapped archive root inside the extract dir.
  const archiveRoot = path.join(extractDir, input.archiveRootName);
  if (!fs.existsSync(archiveRoot) || !fs.statSync(archiveRoot).isDirectory()) {
    return mismatch(`archive root '${input.archiveRootName}' not found in archive`);
  }
  const sourceDir = path.join(archiveRoot, "src", "opencode");
  if (!fs.existsSync(sourceDir)) {
    return mismatch(`archive src/opencode missing under ${input.archiveRootName}`);
  }

  // Read trusted installer from BASE oid. The candidate may have tampered
  // with scripts/install-from-archive.ps1 — we ignore the candidate copy.
  let installerBytes: Uint8Array;
  try {
    installerBytes = readBlob(
      input.adapter,
      input.baseOid,
      "base-installer",
      "scripts/install-from-archive.ps1",
    );
  } catch (e) {
    if (e instanceof GitBlobMissingError) {
      return mismatch(`trusted install-from-archive.ps1 missing at base oid ${input.baseOid}`);
    }
    throw e;
  }

  // Write trusted installer into the work dir under a stable filename.
  const installerPath = path.join(work, "install-from-archive.ps1");
  fs.writeFileSync(installerPath, installerBytes);

  // Target: fresh temp .opencode directory.
  const targetOpencode = path.join(work, "opencode");
  fs.mkdirSync(targetOpencode, { recursive: true });

  // Execute the trusted installer with array-form argv (no shell injection).
  // The installer's contract: -Source <src/opencode> -Target <.opencode> -Mode copy.
  const args = [
    "-NoProfile",
    "-NonInteractive",
    "-File",
    installerPath,
    "-Source",
    sourceDir,
    "-Target",
    targetOpencode,
    "-Mode",
    "copy",
  ];
  let exitCode: number;
  try {
    cp.execFileSync("pwsh", args, {
      cwd: work,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf-8",
      maxBuffer: 64 * 1024 * 1024,
    });
    exitCode = 0;
  } catch (e) {
    const err = e as { status?: number; code?: string };
    if (typeof err.status === "number") {
      exitCode = err.status;
    } else {
      const spawnCode = err.code ?? "unknown";
      throw new Error(
        `trusted install-from-archive.ps1 spawn failed (code=${spawnCode}); cannot classify as installer exit`,
      );
    }
  }
  if (exitCode !== 0) {
    return mismatch(`trusted install-from-archive.ps1 exited ${exitCode} during physical install`);
  }

  // Walk the installed Target and gather actual file digests.
  const actual = collectInstalled(targetOpencode);

  // Compare to the expected archive-installed manifest. The manifest paths
  // are repo-relative with forward slashes starting at .opencode/. Convert
  // them to the same shape for comparison.
  const expectedMap = new Map<string, ManifestEntry>();
  for (const e of input.expected.entries) {
    expectedMap.set(e.path, e);
  }
  const actualMap = new Map<string, ActualFile>();
  for (const a of actual) actualMap.set(a.canonicalPath, a);

  const missing: string[] = [];
  const extra: string[] = [];
  const digestMismatches: string[] = [];
  for (const [p] of expectedMap) {
    if (!actualMap.has(p)) missing.push(p);
  }
  for (const [p] of actualMap) {
    if (!expectedMap.has(p)) extra.push(p);
  }
  for (const [p, e] of expectedMap) {
    const a = actualMap.get(p);
    if (a && (a.sha256 !== e.sha256 || a.size !== e.size)) {
      digestMismatches.push(p);
    }
  }
  if (missing.length === 0 && extra.length === 0 && digestMismatches.length === 0) {
    return { kind: "ok" };
  }
  return mismatch(
    `archive-installed physical install mismatch: missing=${JSON.stringify(missing)} extra=${JSON.stringify(extra)} digest_mismatches=${JSON.stringify(digestMismatches)}`,
  );
}

interface ActualFile {
  /** Canonical path: .opencode/... with forward slashes. */
  readonly canonicalPath: string;
  readonly sha256: string;
  readonly size: number;
}

function collectInstalled(targetOpencode: string): ActualFile[] {
  const out: ActualFile[] = [];
  const targetAbs = path.resolve(targetOpencode);
  const walk = (dir: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const rel = path.relative(targetAbs, full).replace(/\\/g, "/");
        const canonical = ".opencode/" + rel;
        assertSafeRelativePath(canonical);
        const bytes = fs.readFileSync(full);
        out.push({
          canonicalPath: canonical,
          sha256: computeSha256(new Uint8Array(bytes)),
          size: bytes.length,
        });
      }
    }
  };
  walk(targetAbs);
  return out;
}

function assertSafeRelativePath(p: string): void {
  // Exact `..` segment match (parent blocker #6). A filename like
  // "foo..bar.md" (double-dot inside) is NOT a traversal; only an actual
  // ".." path segment is.
  const normalized = p.replace(/\\/g, "/");
  const segments = normalized.split("/");
  for (const seg of segments) {
    if (seg === "..") {
      throw new PathSafetyError("path-traversal", `installed file escaped target: ${p}`);
    }
  }
}

function mismatch(reason: string): VerifyInstalledResult {
  return { kind: "mismatch", reason };
}
