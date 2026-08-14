// Review-v8 blocker #4: docs prefix scan linearization (performance).
//
// ROOT CAUSE: boundary-docs-path-parser.ts prefixResolvesToDocs scans
// backward for every `docs` occurrence to find the start of the prefix
// region, then dot-segment-normalizes the prefix. On adversarial input
// where `docs` appears many times in one line with no left boundary
// (e.g. ("a/docs").repeat(8000) = 48K chars, 8000 docs occurrences),
// each occurrence re-scans the entire prefix, giving O(n^2) total work.
// Measured baseline: ~3.2s for n=8000, ~24s for n=16000.
//
// FIX: Replace the per-doc backward scan with a single forward pass
// that incrementally maintains the dot-segment normalization state.
// Each docs candidate is answered in O(1) from the running state, so
// the total scan is linear in line.length.
//
// RED: the perf case must complete under the 1000ms budget AND emit
// zero path candidates (none of the `a/docs` occurrences resolve to
// docs). Two functional controls verify the linearized scanner still
// accepts real dot-segment prefixes.

import { describe, expect, test } from "bun:test";
import { extractDocsPaths } from "./boundary-docs-path-parser.ts";

describe("v8 #4 docs prefix scan linearization", () => {
  test("('a/docs').repeat(8000) completes under 1000ms and emits 0 paths", () => {
    const text = "a/docs".repeat(8000);
    expect(text.length).toBe(48000);
    const t0 = performance.now();
    const r = extractDocsPaths(text, 100);
    const t1 = performance.now();
    expect(r.paths).toHaveLength(0);
    expect(r.overflow).toBe(false);
    const elapsedMs = t1 - t0;
    expect(elapsedMs).toBeLessThan(1000);
  });

  test("control: ../../docs/specs/foo.md -> 1 path (value starts at docs token)", () => {
    const r = extractDocsPaths("../../docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
  });

  test("control: a/b/c/../../../docs/specs/foo.md -> 1 path (dot-segment cancel)", () => {
    const r = extractDocsPaths("a/b/c/../../../docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
  });
});
