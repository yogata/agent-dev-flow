// Manifest diff / equality helpers.
//
// Extracted from manifest.ts to keep that module under the 250 pure LOC
// ceiling. Pure functions over readonly ManifestEntry[].

import type { ManifestEntry } from "./types.ts";

export interface ManifestDiff {
  readonly extra: readonly ManifestEntry[];
  readonly missing: readonly ManifestEntry[];
  readonly digest_mismatches: readonly ManifestEntry[];
}

export function manifestEntryEquals(a: ManifestEntry, b: ManifestEntry): boolean {
  return a.path === b.path && a.sha256 === b.sha256 && a.size === b.size;
}

export function diffManifests(
  expected: readonly ManifestEntry[],
  actual: readonly ManifestEntry[],
): ManifestDiff {
  const expectedMap = new Map(expected.map((e) => [e.path, e]));
  const actualMap = new Map(actual.map((e) => [e.path, e]));
  const extra: ManifestEntry[] = [];
  const missing: ManifestEntry[] = [];
  const digestMismatches: ManifestEntry[] = [];

  for (const [path, e] of actualMap) {
    if (!expectedMap.has(path)) extra.push(e);
  }
  for (const [path, e] of expectedMap) {
    const a = actualMap.get(path);
    if (!a) {
      missing.push(e);
    } else if (a.sha256 !== e.sha256 || a.size !== e.size) {
      digestMismatches.push(e);
    }
  }
  return {
    extra: extra.sort((x, y) => x.path.localeCompare(y.path)),
    missing: missing.sort((x, y) => x.path.localeCompare(y.path)),
    digest_mismatches: digestMismatches.sort((x, y) => x.path.localeCompare(y.path)),
  };
}
