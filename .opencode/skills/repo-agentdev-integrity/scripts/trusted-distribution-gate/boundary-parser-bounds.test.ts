import { describe, expect, test } from "bun:test";
import { extractDocsPaths } from "./boundary-docs-path-parser.ts";

describe("docs path owner cap", () => {
  test("exact cap returns every path without overflow", () => {
    const line = Array.from({ length: 63 }, (_, i) => `docs/specs/x${i}.md`).join(" ");
    const result = extractDocsPaths(line, 63);
    expect(result.paths).toHaveLength(63);
    expect(result.overflow).toBe(false);
  });

  test("cap plus one returns capped paths with overflow", () => {
    const line = Array.from({ length: 64 }, (_, i) => `docs/specs/x${i}.md`).join(" ");
    const result = extractDocsPaths(line, 63);
    expect(result.paths).toHaveLength(63);
    expect(result.overflow).toBe(true);
  });
});
