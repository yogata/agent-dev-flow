// Blob loading + classification stage.
//
// Reads every candidate-tree blob in a SINGLE git subprocess via
// `git cat-file --batch` (parent defect #12), classifies it as text or
// binary (strict UTF-8), and projects it into one of the internal source
// subsets: runtime, bootstrap, or archive-extra. Files outside these
// subsets are skipped — the manifest builder only consumes projected
// entries.
//
// Fail-closed contract for shipped subset entries (parent defect #4):
//   - Strict UTF-8 validation. Invalid UTF-8 / NUL byte is EncodingViolation.
//   - Binary is allowed ONLY by explicit extension allowlist. Unknown
//     extension with binary bytes is UnclassifiedEntry (fail-closed).
//   - We never silently treat a shipped artifact as "binary, skip scan".

import type { GitOid, SourceSubset } from "./types.ts";
import { ExitCode } from "./types.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import { readBlobsBatched } from "./git-blob-reader.ts";
import type { GitTreeEntry } from "./types.ts";
import { classifyBytes } from "./text-binary.ts";
import {
  classifySourceSubset,
  type ManifestEntryInput,
} from "./manifest.ts";
import { computeSha256 } from "./archive-builder.ts";

export interface LoadedBlob {
  readonly subset: SourceSubset;
  readonly entry: ManifestEntryInput;
  readonly bytes: Uint8Array;
  /** Text content; null means binary (allowlisted) — not scannable. */
  readonly text: string | null;
}

export type LoadResult =
  | { readonly kind: "ok"; readonly blobs: readonly LoadedBlob[] }
  | {
      readonly kind: "error";
      readonly code: typeof ExitCode[keyof typeof ExitCode];
      readonly message: string;
    };

const BINARY_EXTENSION_ALLOWLIST: readonly string[] = [
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
  ".zip", ".gz", ".tar", ".tgz",
  ".pdf",
  ".lock",
];

function extOf(p: string): string {
  const slash = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  const leaf = slash >= 0 ? p.substring(slash + 1) : p;
  const dot = leaf.lastIndexOf(".");
  return dot >= 0 ? leaf.substring(dot).toLowerCase() : "";
}

function isAllowlistedBinaryPath(p: string): boolean {
  return BINARY_EXTENSION_ALLOWLIST.includes(extOf(p));
}

export function loadAndClassify(
  adapter: RawGitAdapter,
  candidateOid: GitOid,
  entries: readonly GitTreeEntry[],
): LoadResult {
  const candidates = entries.filter((e) => classifySourceSubset(e.path) !== null);
  if (candidates.length === 0) return { kind: "ok", blobs: [] };

  // Single batched read: one subprocess for all blobs (parent defect #12).
  // Catch protocol/adapter failures and convert to typed LoadResult so
  // runLauncher always returns a JSON-shaped LauncherResult (blocker #2).
  const requests = candidates.map((e) => `${candidateOid}:${e.path}`);
  let batched;
  try {
    batched = readBlobsBatched(adapter, requests);
  } catch (e) {
    return {
      kind: "error",
      code: ExitCode.Unexpected,
      message: `git cat-file --batch failed during blob load: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const blobs: LoadedBlob[] = [];
  for (const e of candidates) {
    const req = `${candidateOid}:${e.path}`;
    const bytes = batched.found.get(req);
    if (!bytes) {
      return {
        kind: "error",
        code: ExitCode.UnclassifiedEntry,
        message: `git cat-file missing for ${e.path}`,
      };
    }
    const subset = classifySourceSubset(e.path)!;
    const classification = classifyBytes(bytes);
    let text: string | null;
    if (classification.kind === "text") {
      text = classification.text ?? "";
    } else {
      if (!isAllowlistedBinaryPath(e.path)) {
        return {
          kind: "error",
          code: ExitCode.EncodingViolation,
          message: `binary content (reason: ${classification.reason ?? "unknown"}) in non-allowlisted shipped subset entry: ${e.path}`,
        };
      }
      text = null;
    }
    blobs.push({
      subset,
      entry: { path: e.path, sha256: computeSha256(bytes), size: bytes.length },
      bytes,
      text,
    });
  }
  return { kind: "ok", blobs };
}
