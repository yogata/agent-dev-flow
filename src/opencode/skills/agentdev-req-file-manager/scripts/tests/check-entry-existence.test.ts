import { test, expect, describe } from "bun:test";
import { idExistsInContent, checkIdInFiles } from "../src/check-entry-existence.ts";

describe("idExistsInContent", () => {
  test("returns true when id is substring of content", () => {
    expect(idExistsInContent("REQ-0103", "REQ-0103 is here")).toBe(true);
  });

  test("returns false when id is absent", () => {
    expect(idExistsInContent("REQ-9999", "REQ-0103 is here")).toBe(false);
  });

  test("returns true for partial matches within larger tokens", () => {
    expect(idExistsInContent("REQ-0103", "REQ-0103-001 row")).toBe(true);
  });
});

describe("checkIdInFiles", () => {
  test("ok when id is found in at least one file", () => {
    const files = [
      { path: "README.md", content: "# Index\nREQ-0103\n" },
      { path: "DOC-MAP.md", content: "Other content" },
    ];
    const result = checkIdInFiles("REQ-0103", files);
    expect(result.ok).toBe(true);
    expect(result.found).toEqual(["README.md"]);
  });

  test("not ok when id is found in no files", () => {
    const files = [
      { path: "README.md", content: "# Index\nREQ-0101\n" },
    ];
    const result = checkIdInFiles("REQ-9999", files);
    expect(result.ok).toBe(false);
    expect(result.found).toEqual([]);
    expect(result.errors).toHaveLength(1);
  });

  test("returns all files where id is found", () => {
    const files = [
      { path: "README.md", content: "REQ-0103" },
      { path: "DOC-MAP.md", content: "REQ-0103 here too" },
      { path: "mapping-table.md", content: "no match" },
    ];
    const result = checkIdInFiles("REQ-0103", files);
    expect(result.found).toEqual(["README.md", "DOC-MAP.md"]);
  });
});
