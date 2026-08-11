// Protected-path verification stage.
//
// Reads each trust-root file at base and candidate OIDs via git-blob-reader
// and reports the first modification, deletion, or addition. Returns null
// when no protected path differs between the two OIDs.

import type { GitOid } from "./types.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import { readBlob } from "./git-blob-reader.ts";
import {
  DEFAULT_PROTECTED_PATH_SET,
  listAllProtectedPaths,
} from "./protected-paths.ts";
import { computeSha256 } from "./archive-builder.ts";

export function checkProtectedPaths(
  adapter: RawGitAdapter,
  baseOid: GitOid,
  candidateOid: GitOid,
): string | null {
  const protectedSet = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
  for (const p of protectedSet) {
    const baseDigest = safeReadBlobDigest(adapter, baseOid, p);
    const candDigest = safeReadBlobDigest(adapter, candidateOid, p);
    if (baseDigest !== null && candDigest === null) {
      return `protected path deleted: ${p}`;
    }
    if (baseDigest !== null && candDigest !== null && baseDigest !== candDigest) {
      return `protected path modified: ${p}`;
    }
    if (baseDigest === null && candDigest !== null) {
      return `protected path added: ${p}`;
    }
  }
  return null;
}

function safeReadBlobDigest(
  adapter: RawGitAdapter,
  oid: GitOid,
  filePath: string,
): string | null {
  try {
    const bytes = readBlob(adapter, oid, "protected", filePath);
    return computeSha256(bytes);
  } catch {
    return null;
  }
}
