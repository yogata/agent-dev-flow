// Projection chain test for the realization_actions → execution contract
// flow (REQ-017-017, TS-006, Issue #2547). Pins the projection chain between:
//   - the req-draft template (realization_actions source section):
//     src/opencode/commands/agentdev/templates/req-define/req-draft.md
//   - the case-open command (projection contract):
//     src/opencode/commands/agentdev/case-open.md
//   - the Issue body templates (projection target section):
//     src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md
//     src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md
//   - the case-run command (consumption as a settled contract):
//     src/opencode/commands/agentdev/case-run.md
//   - the requirement:
//     docs/requirements/REQ-017.md (REQ-017-017)
// as a permanent regression guard (TS-006):
//   - case-open declares the realization_actions processing target and the
//     projection into the Issue / Epic Execution Contract section
//   - both Issue templates define the projection target section
//     ("実現面の変更方針（realization_actions 由来）") with the same name
//   - case-run declares consumption of the projected policy as a settled
//     contract: no re-decision, internal implementation policy only,
//     blocked boundary for realization-responsibility changes
//   - after case-open success, case-run obtains change responsibility,
//     intent, and verification policy from the Issue body alone
//     (no req_draft re-read, REQ-017-016)

// ADF-COVERS(verification): REQ-017-017

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const DRAFT_TEMPLATE_REL =
  "src/opencode/commands/agentdev/templates/req-define/req-draft.md";
const CASE_OPEN_REL = "src/opencode/commands/agentdev/case-open.md";
const CASE_RUN_REL = "src/opencode/commands/agentdev/case-run.md";
const CHILD_TEMPLATE_REL =
  "src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md";
const EPIC_TEMPLATE_REL =
  "src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md";
const REQ_REL = "docs/requirements/REQ-017.md";

/** Projection target section name shared by commands and both Issue templates. */
const PROJECTION_SECTION = "実現面の変更方針（realization_actions 由来）";

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

/** Extract the markdown body following a heading, until the next heading of the same level. */
function extractHeadingSection(markdown: string, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const level = heading.match(/^#+/)?.[0].length ?? 0;
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start === -1) return "";
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (new RegExp(`^#{1,${level}}\\s`).test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

describe("projection chain source (req-draft template)", () => {
  test("template holds the realization_actions source section", () => {
    expect(read(DRAFT_TEMPLATE_REL)).toContain("realization_actions:");
  });
});

describe("case-open command projection contract (REQ-017-017)", () => {
  const doc = read(CASE_OPEN_REL);

  test("lists realization_actions as a draft processing target", () => {
    expect(doc).toMatch(/draft 全体の `agreed_items`、`artifact_actions`、`operation_units`、`realization_actions` を処理対象/);
  });

  test("declares the projection into the Issue / Epic Execution Contract section", () => {
    expect(doc).toContain(`「${PROJECTION_SECTION}」へ投影`);
    expect(doc).toMatch(/Issue \/ Epic 本文の Execution Contract セクション/);
  });

  test("keeps the req-define confirmed policy without loss", () => {
    expect(doc).toMatch(/req-define が確定した内容を失わず Issue 本文へ永続化する/);
  });

  test("enables case-run to read change responsibility, intent, and verification policy from the Issue body alone", () => {
    expect(doc).toMatch(/case-run が Issue 本文だけで変更責務、変更意図、検証方針を取得できる/);
  });

  test("anchors the projection to REQ-017-017", () => {
    expect(doc).toContain("REQ-017-017");
  });
});

describe("Issue template projection target (Execution Contract)", () => {
  for (const [label, rel] of [
    ["child", CHILD_TEMPLATE_REL],
    ["epic", EPIC_TEMPLATE_REL],
  ] as const) {
    test(`${label} template defines the projection target section under Execution Contract`, () => {
      const doc = read(rel);
      const ec = extractHeadingSection(doc, "## Execution Contract");
      expect(ec).not.toBe("");
      expect(ec).toContain(`### ${PROJECTION_SECTION}`);
    });

    test(`${label} template declares the projection contract and the REQ-017-017 anchor`, () => {
      const section = extractHeadingSection(read(rel), `### ${PROJECTION_SECTION}`);
      expect(section).not.toBe("");
      expect(section).toMatch(/realization_actions を本セクションへ投影する/);
      expect(section).toContain("REQ-017-017");
    });

    test(`${label} template declares the soft-contract fallback for missing projection source`, () => {
      const section = extractHeadingSection(read(rel), `### ${PROJECTION_SECTION}`);
      expect(section).toMatch(/投影対象がない場合は「該当なし」と記載する/);
    });

    test(`${label} template carries the RA entry structure (concern, responsibility, ownership_hints, intent, verification_refs, source_items)`, () => {
      const section = extractHeadingSection(read(rel), `### ${PROJECTION_SECTION}`);
      expect(section).toMatch(/RA-\{NNN\} ごとに/);
      for (const field of [
        "concern",
        "responsibility",
        "ownership_hints",
        "intent",
        "verification_refs",
        "source_items",
      ]) {
        expect(section).toContain(field);
      }
    });

    test(`${label} template forbids case-run re-decision of the projected policy`, () => {
      const section = extractHeadingSection(read(rel), `### ${PROJECTION_SECTION}`);
      expect(section).toMatch(/既確定契約として消費/);
      expect(section).toMatch(/再決定せず/);
    });
  }

  test("child and epic templates use the identical projection section name", () => {
    expect(read(CHILD_TEMPLATE_REL)).toContain(`### ${PROJECTION_SECTION}`);
    expect(read(EPIC_TEMPLATE_REL)).toContain(`### ${PROJECTION_SECTION}`);
  });
});

describe("case-run command consumption contract (REQ-017-017)", () => {
  const doc = read(CASE_RUN_REL);

  test("consumes the projected realization policy as a settled contract", () => {
    expect(doc).toMatch(/実現面の変更方針（realization_actions 由来）は既確定契約として消費/);
  });

  test("does not re-decide responsibility, intent, or verification policy", () => {
    expect(doc).toMatch(/実現責務・変更意図・検証方針を再決定せず/);
  });

  test("limits decisions to internal implementation policy within the settled scope", () => {
    expect(doc).toMatch(/その範囲内の内部実装方針（関数配置、命名、データ構造、実装順序、具体的 diff）だけを決定する/);
  });

  test("routes realization-responsibility changes to the existing blocked boundary", () => {
    expect(doc).toMatch(/実現責務の変更が必要と判断した場合は既存の blocked 境界に従う/);
  });

  test("reads change responsibility, intent, and verification policy from the Issue body alone (REQ-017-016)", () => {
    expect(doc).toMatch(/req_draft を再読込せず Issue 本文だけで変更責務、変更意図、検証方針を取得する/);
    expect(doc).toContain("REQ-017-016");
    expect(doc).toContain("REQ-017-017");
  });
});

describe("requirement anchor (docs/requirements/REQ-017.md)", () => {
  const doc = read(REQ_REL);

  test("REQ-017-017 requires the projection and the settled-contract consumption", () => {
    const row = doc.split(/\r?\n/).find((l) => l.startsWith("| REQ-017-017 |"));
    expect(row).toBeDefined();
    expect(row!).toContain("realization_actions を Issue / Epic の execution contract へ投影");
    expect(row!).toContain("Issue 本文だけで変更責務、変更意図、検証方針を取得");
    expect(row!).toContain("再決定せず");
  });
});
