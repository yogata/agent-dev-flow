// Anchor test for the case-run blocked resume route, staleness difference
// reporting, and docs consistency linkage (REQ-031-004, REQ-031-010,
// REQ-031-011, Issue #2810). Pins the distribution artifacts to the
// canonical requirements:
//   - the case-run workflow skill (workflow implementation body; the public
//     command definition was removed by Case #2981 / DEC-033 and case-auto
//     drives case-run as an internal lifecycle stage):
//     src/opencode/skills/agentdev-workflow-case-run/ (SKILL.md + references)
//   - the requirements:
//     docs/requirements/REQ-031.md (changed rows 004 / 010 / 011)
// as a permanent regression guard:
//   - blocked transitions follow the Root Case resume_command canonical
//     restart route (req-define for new semantic judgment, case-revise for
//     re-agreed changes)
//   - staleness check differences are reported (never rewritten alone into
//     the Issue body) and block the run
//   - docs changes in the PR trigger the docs consistency check whose
//     result is recorded in the PR body and handed to case-close

// ADF-COVERS(verification): REQ-031-004, REQ-031-010, REQ-031-011

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const SKILL_REL = "src/opencode/skills/agentdev-workflow-case-run/SKILL.md";
const REF_SINGLE_REL = "src/opencode/skills/agentdev-workflow-case-run/references/single.md";
const REQ_031_REL = "docs/requirements/REQ-031.md";

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

/** Extract the markdown table row starting with the given REQ id. */
function reqRow(markdown: string, reqId: string): string {
  const row = markdown.split(/\r?\n/).find((l) => l.startsWith(`| ${reqId} |`));
  expect(row).toBeDefined();
  return row!;
}

describe("canonical requirement rows exist", () => {
  const doc = read(REQ_031_REL);

  test("REQ-031-004 pins the blocked resume route with case-revise", () => {
    const row = reqRow(doc, "REQ-031-004");
    expect(row).toContain("resume_command");
    expect(row).toContain("req-define");
    expect(row).toContain("case-revise");
  });

  test("REQ-031-010 forbids sole rewrite of the Issue body on staleness difference", () => {
    const row = reqRow(doc, "REQ-031-010");
    expect(row).toContain("Issue 本文を単独で書き換えず");
    expect(row).toContain("resume_command");
  });

  test("REQ-031-011 requires docs consistency check recording for docs changes", () => {
    const row = reqRow(doc, "REQ-031-011");
    expect(row).toContain("docs 整合性検査を実行し結果を PR 本文に記録して case-close へ連携する");
  });
});

// Case #2981（DEC-033）: the case-run public command definition was removed.
// The blocked resume route contracts are anchored to the workflow skill body
// (「blocked 正規再開経路」constraint), which carries the same clauses.
describe("case-run workflow skill pins the blocked resume route (REQ-031-004, REQ-031-010)", () => {
  const doc = read(SKILL_REL);

  test("in-scope impact is handled autonomously, scope changes are blocked", () => {
    expect(doc).toMatch(/既存 Issue scope 内で処理可能な内部実装上の影響は自律処理する/);
    expect(doc).toMatch(/Issue scope、完了条件、REQ\/Decision\/Design、必須品質統制の追加変更が必要な場合は blocked とし、Root Case の resume_command による正規再開経路（新しい意味判断が必要な場合は req-define、再合意済みの場合は case-revise）に従う/);
  });

  test("staleness difference is reported and blocked, Issue body never rewritten alone", () => {
    expect(doc).toMatch(/staleness check で差異を検出した場合も Issue 本文を単独で書き換えず、差異を報告して blocked とし同一の正規再開経路に従う/);
  });
});

describe("case-run workflow skill pins the same contracts", () => {
  const doc = read(SKILL_REL);

  test("common constraints own the blocked resume route (req-define / case-revise)", () => {
    expect(doc).toMatch(/blocked 正規再開経路/);
    expect(doc).toMatch(/新しい意味判断が必要な場合は req-define、再合意済みの場合は case-revise/);
  });

  test("common constraints own the docs consistency linkage to case-close", () => {
    expect(doc).toMatch(/docs 整合性検査連携/);
    expect(doc).toMatch(/docs 整合性検査を実行し、結果を PR 本文に記録して case-close へ連携する/);
  });

  test("no dangling reference to the abolished case-update remains", () => {
    expect(doc).not.toMatch(/case-update/);
  });
});

describe("single workflow reference pins the operational details", () => {
  const doc = read(REF_SINGLE_REL);

  test("blocked transition reports via Issue comment and PR body, follows resume_command", () => {
    expect(doc).toMatch(/blocked 遷移と正規再開経路/);
    expect(doc).toMatch(/case-run は Issue 本文を単独で書き換えず、Root Case の resume_command による正規再開経路（新しい意味判断が必要な場合は req-define、再合意済みの場合は case-revise）に従う/);
  });

  test("STEP-S3-3 staleness check reports the difference and blocks", () => {
    expect(doc).toMatch(/差異検出時は Issue 本文を単独で書き換えず、差異を報告して blocked とし、Root Case の resume_command による正規再開経路に従う/);
  });

  test("docs consistency check result is recorded for the case-close handoff", () => {
    expect(doc).toMatch(/### docs-integrity/);
    expect(doc).toMatch(/--files/);
  });

  test("no dangling reference to the abolished case-update remains", () => {
    expect(doc).not.toMatch(/case-update/);
  });
});
