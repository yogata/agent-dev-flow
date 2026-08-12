// Blob loading + classification stage.
//
// Reads every candidate-tree blob, classifies it as text or binary (strict
// UTF-8), and projects it into one of source-runtime / source-bootstrap /
// extra (archive extras). Files outside these projections are skipped —
// the manifest builder only consumes projected entries.
//
// Fail-closed contract for shipped projection entries (parent defect #4):
//   - Strict UTF-8 validation. Invalid UTF-8 / NUL byte is EncodingViolation.
//   - Binary is allowed ONLY by explicit extension allowlist. Unknown
//     extension with binary bytes is UnclassifiedEntry (fail-closed).
//   - We never silently treat a shipped artifact as "binary, skip scan".

import type { GitOid, Projection } from "./types.ts";
import { ExitCode } from "./types.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import { readBlob } from "./git-blob-reader.ts";
import type { GitTreeEntry } from "./types.ts";
import { classifyBytes } from "./text-binary.ts";
import {
  isRequiredArchiveExtraPath,
  isRequiredBootstrapPath,
  isRequiredRuntimePath,
  type ManifestEntryInput,
} from "./manifest.ts";
import { computeSha256 } from "./archive-builder.ts";

export interface LoadedBlob {
  readonly projection: Projection | "extra";
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

// Extensions whose binary content is allowed in shipped projections.
// Adding a new binary kind is a trust-root change (review required).
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
  const blobs: LoadedBlob[] = [];
  for (const e of entries) {
    let bytes: Uint8Array;
    try {
      bytes = readBlob(adapter, candidateOid, "candidate", e.path);
    } catch (err_) {
      return {
        kind: "error",
        code: ExitCode.Unexpected,
        message: `git cat-file failed for ${e.path}: ${errMsg(err_)}`,
      };
    }
    const projection: Projection | "extra" | null = pickProjection(e.path);
    if (projection === null) continue;

    const classification = classifyBytes(bytes);
    let text: string | null;
    if (classification.kind === "text") {
      text = classification.text ?? "";
    } else {
      // Binary bytes. Allow ONLY if the path's extension is on the
      // explicit allowlist. Anything else fails closed: invalid UTF-8/NUL
      // in a shipped projection is either tampering or an unclassified
      // new binary kind — both block the gate.
      if (!isAllowlistedBinaryPath(e.path)) {
        return {
          kind: "error",
          code: ExitCode.EncodingViolation,
          message: `binary content (reason: ${classification.reason ?? "unknown"}) in non-allowlisted shipped projection entry: ${e.path}`,
        };
      }
      text = null;
    }

    blobs.push({
      projection,
      entry: {
        path: e.path,
        sha256: computeSha256(bytes),
        size: bytes.length,
      },
      bytes,
      text,
    });
  }
  return { kind: "ok", blobs };
}

function pickProjection(path: string): Projection | "extra" | null {
  if (isRequiredRuntimePath(path)) return "source-runtime";
  if (isRequiredBootstrapPath(path)) return "source-bootstrap";
  if (isRequiredArchiveExtraPath(path)) return "extra";
  return null;
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
