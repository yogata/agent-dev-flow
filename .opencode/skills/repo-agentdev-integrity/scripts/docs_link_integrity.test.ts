// ADF-COVERS(verification): REQ-010-072, REQ-010-073
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import {
  checkDecisionReadmeRetiredReqLink,
  checkDesignsRelativeLinkExistence,
} from "./check_integrity.ts";

const root = join("C:", "WINDOWS", "TEMP", "opencode", `docs-link-${crypto.randomUUID()}`);

function write(relativePath: string, content: string): void {
  const target = join(root, relativePath);
  mkdirSync(join(target, ".."), { recursive: true });
  writeFileSync(target, content, "utf8");
}

beforeAll(() => {
  rmSync(root, { recursive: true, force: true });
  write("docs/requirements/REQ-001.md", "# REQ-001\n");
  write("docs/requirements/retired/REQ-028.md", "# REQ-028\n");
  write("docs/decisions/README.md", [
    "# Decisions",
    "",
    "## 関連 REQ",
    "",
    "| Decision | 関連REQ | 説明 |",
    "|---|---|---|",
    "| DEC-001 | [REQ-028](../requirements/retired/REQ-028.md)（retired、後継: DEC-013）, [REQ-001](../requirements/REQ-001.md) | test |",
    "",
  ].join("\n"));
  write("docs/designs/existing.md", "# Existing\n");
  write("docs/designs/links.md", [
    "# Links",
    "",
    "[existing](existing.md)",
    "[missing](missing.md)",
    "`[example](example.md)`",
    "[report](../reports/missing.md)",
    "",
  ].join("\n"));
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("checkDecisionReadmeRetiredReqLink", () => {
  it("accepts retired path with annotation and active path", () => {
    const failures = checkDecisionReadmeRetiredReqLink(root).filter((r) => r.level === "ng");
    expect(failures).toHaveLength(0);
  });

  it("reports a retired REQ linked through the active path", () => {
    write("docs/decisions/README.md", [
      "## 関連 REQ",
      "| Decision | 関連REQ | 説明 |",
      "|---|---|---|",
      "| DEC-001 | [REQ-028](../requirements/REQ-028.md) | test |",
    ].join("\n"));
    const failures = checkDecisionReadmeRetiredReqLink(root).filter((r) => r.level === "ng");
    expect(failures.some((r) => r.check === "retired-req-link-path")).toBe(true);
  });

  it("reports any non-canonical path for a retired REQ", () => {
    write("docs/decisions/README.md", [
      "## 関連 REQ",
      "| Decision | 関連REQ | 説明 |",
      "|---|---|---|",
      "| DEC-001 | [REQ-028](../requirements/old/REQ-028.md)（retired） | test |",
    ].join("\n"));
    const failures = checkDecisionReadmeRetiredReqLink(root).filter((r) => r.level === "ng");
    expect(failures.some((r) => r.check === "retired-req-link-path")).toBe(true);
  });

  it("reports a missing retired annotation", () => {
    write("docs/decisions/README.md", [
      "## 関連 REQ",
      "| Decision | 関連REQ | 説明 |",
      "|---|---|---|",
      "| DEC-001 | [REQ-028](../requirements/retired/REQ-028.md) | test |",
    ].join("\n"));
    const failures = checkDecisionReadmeRetiredReqLink(root).filter((r) => r.level === "ng");
    expect(failures.some((r) => r.check === "retired-req-link-annotation")).toBe(true);
  });
});

describe("checkDesignsRelativeLinkExistence", () => {
  it("reports missing links and ignores code spans and docs/reports", () => {
    const failures = checkDesignsRelativeLinkExistence(root).filter((r) => r.level === "ng");
    expect(failures).toHaveLength(1);
    expect(failures[0].message).toContain("missing.md");
  });

  it("passes when all checked links exist", () => {
    write("docs/designs/links.md", [
      "# Links",
      "",
      "[existing](existing.md)",
      "`[example](example.md)`",
      "[report](../reports/missing.md)",
    ].join("\n"));
    const failures = checkDesignsRelativeLinkExistence(root).filter((r) => r.level === "ng");
    expect(failures).toHaveLength(0);
  });
});
