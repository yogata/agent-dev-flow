// Blob loading + classification stage.
//
// Reads every candidate-tree blob, classifies it as text or binary (strict
// UTF-8), and projects it into one of source-runtime / source-bootstrap /
// extra (archive extras). Files outside these projections are skipped —
// the manifest builder only consumes projected entries.

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
  readonly text: string | null;
}

export type LoadResult =
  | { readonly kind: "ok"; readonly blobs: readonly LoadedBlob[] }
  | {
      readonly kind: "error";
      readonly code: typeof ExitCode[keyof typeof ExitCode];
      readonly message: string;
    };

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
    const classification = classifyBytes(bytes);
    const projection: Projection | "extra" | null = pickProjection(e.path);
    if (projection === null) continue;

    blobs.push({
      projection,
      entry: {
        path: e.path,
        sha256: computeSha256(bytes),
        size: bytes.length,
      },
      bytes,
      text: classification.kind === "text" ? classification.text ?? null : null,
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
