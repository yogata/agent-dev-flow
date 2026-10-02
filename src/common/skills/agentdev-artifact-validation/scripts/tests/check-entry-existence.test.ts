import { test, expect, describe } from "bun:test";
import { idExistsInContent, checkIdInFiles } from "../src/check-entry-existence.ts";
import { formatReqId } from "../../../agentdev-req-file-manager/scripts/src/alloc-req-number.ts";

describe("idExistsInContent", () => {
  test("returns true when id is substring of content", () => {
    const id = formatReqId(103);
    expect(idExistsInContent(id, `${id} is here`)).toBe(true);
  });

  test("returns false when id is absent", () => {
    expect(idExistsInContent(formatReqId(9999), `${formatReqId(103)} is here`)).toBe(false);
  });

  test("returns true for partial matches within larger tokens", () => {
    const id = formatReqId(103);
    expect(idExistsInContent(id, `${id}-001 row`)).toBe(true);
  });
});

describe("checkIdInFiles", () => {
  test("ok when id is found in at least one file", () => {
    const id = formatReqId(103);
    const files = [
      { path: "README.md", content: `# Index\n${id}\n` },
      { path: "other-index.md", content: "Other content" },
    ];
    const result = checkIdInFiles(id, files);
    expect(result.ok).toBe(true);
    expect(result.found).toEqual(["README.md"]);
  });

  test("not ok when id is found in no files", () => {
    const files = [
      { path: "README.md", content: `# Index\n${formatReqId(101)}\n` },
    ];
    const result = checkIdInFiles(formatReqId(9999), files);
    expect(result.ok).toBe(false);
    expect(result.found).toEqual([]);
    expect(result.errors).toHaveLength(1);
  });

  test("returns all files where id is found", () => {
    const id = formatReqId(103);
    const files = [
      { path: "README.md", content: id },
      { path: "index-2.md", content: `${id} here too` },
      { path: "other-index.md", content: "no match" },
    ];
    const result = checkIdInFiles(id, files);
    expect(result.found).toEqual(["README.md", "index-2.md"]);
  });
});
