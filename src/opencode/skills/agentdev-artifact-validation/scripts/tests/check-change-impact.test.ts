import { test, expect, describe } from "bun:test";
import { pathMatchesPrefix, checkChangeImpact } from "../src/check-change-impact.ts";

describe("pathMatchesPrefix", () => {
  test("matches path within globbed directory", () => {
    expect(pathMatchesPrefix("docs\\u002Frequirements/REQ\u002D0103.md", "docs\\u002Frequirements/**")).toBe(true);
  });

  test("matches exact file path when no glob", () => {
    expect(pathMatchesPrefix("docs\\u002FREADME.md", "docs\\u002FREADME.md")).toBe(true);
  });

  test("does not match path outside directory", () => {
    expect(pathMatchesPrefix("docs\\u002Fspecs/foo.md", "docs\\u002Frequirements/**")).toBe(false);
  });

  test("matches draft directory glob", () => {
    expect(pathMatchesPrefix(".agentdev/drafts/req-draft-1.md", ".agentdev/drafts/**")).toBe(true);
  });

  test("does not match sibling directory", () => {
    expect(pathMatchesPrefix("docs\\u002Fadr/ADR\u002D0101.md", "docs\\u002Frequirements/**")).toBe(false);
  });

  test("bare ** matches everything", () => {
    expect(pathMatchesPrefix("any/path/file.txt", "**")).toBe(true);
  });
});

describe("checkChangeImpact", () => {
  test("ok when all changes are within allowed paths", () => {
    const result = checkChangeImpact(
      ["docs\\u002Frequirements/REQ\u002D0103.md", "docs\\u002Fadr/ADR\u002D0128.md"],
      ["docs\\u002Frequirements/**", "docs\\u002Fadr/**"],
    );
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("reports violations when changes are outside allowed paths", () => {
    const result = checkChangeImpact(
      ["docs\\u002Frequirements/REQ\u002D0103.md", "src/index.ts"],
      ["docs\\u002Frequirements/**"],
    );
    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(["src/index.ts"]);
    expect(result.errors).toHaveLength(1);
  });

  test("handles empty changed list", () => {
    const result = checkChangeImpact([], ["docs\\u002Frequirements/**"]);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("reports multiple violations", () => {
    const result = checkChangeImpact(
      ["src/a.ts", "src/b.ts", "docs\\u002Frequirements/REQ\u002D0103.md"],
      ["docs\\u002Frequirements/**"],
    );
    expect(result.violations).toEqual(["src/a.ts", "src/b.ts"]);
    expect(result.errors[0]).toContain("2 path");
  });
});
