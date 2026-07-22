import { test, expect, describe } from "bun:test";
import { pathMatchesPrefix, checkChangeImpact } from "../src/check-change-impact.ts";

describe("pathMatchesPrefix", () => {
  test("matches path within globbed directory", () => {
    expect(pathMatchesPrefix("docs/requirements/REQ-0103.md", "docs/requirements/**")).toBe(true);
  });

  test("matches exact file path when no glob", () => {
    expect(pathMatchesPrefix("docs/README.md", "docs/README.md")).toBe(true);
  });

  test("does not match path outside directory", () => {
    expect(pathMatchesPrefix("docs/specs/foo.md", "docs/requirements/**")).toBe(false);
  });

  test("matches draft directory glob", () => {
    expect(pathMatchesPrefix(".agentdev/drafts/req-draft-1.md", ".agentdev/drafts/**")).toBe(true);
  });

  test("does not match sibling directory", () => {
    expect(pathMatchesPrefix("docs/adr/ADR-0101.md", "docs/requirements/**")).toBe(false);
  });

  test("bare ** matches everything", () => {
    expect(pathMatchesPrefix("any/path/file.txt", "**")).toBe(true);
  });
});

describe("checkChangeImpact", () => {
  test("ok when all changes are within allowed paths", () => {
    const result = checkChangeImpact(
      ["docs/requirements/REQ-0103.md", "docs/adr/ADR-0128.md"],
      ["docs/requirements/**", "docs/adr/**"],
    );
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("reports violations when changes are outside allowed paths", () => {
    const result = checkChangeImpact(
      ["docs/requirements/REQ-0103.md", "src/index.ts"],
      ["docs/requirements/**"],
    );
    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(["src/index.ts"]);
    expect(result.errors).toHaveLength(1);
  });

  test("handles empty changed list", () => {
    const result = checkChangeImpact([], ["docs/requirements/**"]);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("reports multiple violations", () => {
    const result = checkChangeImpact(
      ["src/a.ts", "src/b.ts", "docs/requirements/REQ-0103.md"],
      ["docs/requirements/**"],
    );
    expect(result.violations).toEqual(["src/a.ts", "src/b.ts"]);
    expect(result.errors[0]).toContain("2 path");
  });
});
