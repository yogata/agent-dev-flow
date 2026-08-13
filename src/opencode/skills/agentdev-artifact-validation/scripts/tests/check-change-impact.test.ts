import { test, expect, describe } from "bun:test";
import { pathMatchesPrefix, checkChangeImpact } from "../src/check-change-impact.ts";

describe("pathMatchesPrefix", () => {
  test("matches path within globbed directory", () => {
    expect(pathMatchesPrefix("app/src/module-001.ts", "app/src/**")).toBe(true);
  });

  test("matches exact file path when no glob", () => {
    expect(pathMatchesPrefix("app/README.md", "app/README.md")).toBe(true);
  });

  test("does not match path outside directory", () => {
    expect(pathMatchesPrefix("app/test/foo.ts", "app/src/**")).toBe(false);
  });

  test("matches draft directory glob", () => {
    expect(pathMatchesPrefix(".agentdev/drafts/req-draft-1.md", ".agentdev/drafts/**")).toBe(true);
  });

  test("does not match sibling directory", () => {
    expect(pathMatchesPrefix("app/fix/patch-002.ts", "app/src/**")).toBe(false);
  });

  test("bare ** matches everything", () => {
    expect(pathMatchesPrefix("any/path/file.txt", "**")).toBe(true);
  });
});

describe("checkChangeImpact", () => {
  test("ok when all changes are within allowed paths", () => {
    const result = checkChangeImpact(
      ["app/src/module-001.ts", "app/fix/patch-003.ts"],
      ["app/src/**", "app/fix/**"],
    );
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("reports violations when changes are outside allowed paths", () => {
    const result = checkChangeImpact(
      ["app/src/module-001.ts", "src/index.ts"],
      ["app/src/**"],
    );
    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(["src/index.ts"]);
    expect(result.errors).toHaveLength(1);
  });

  test("handles empty changed list", () => {
    const result = checkChangeImpact([], ["app/src/**"]);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("reports multiple violations", () => {
    const result = checkChangeImpact(
      ["src/a.ts", "src/b.ts", "app/src/module-001.ts"],
      ["app/src/**"],
    );
    expect(result.violations).toEqual(["src/a.ts", "src/b.ts"]);
    expect(result.errors[0]).toContain("2 path");
  });
});
