// Projection chain test for the realization_actions → execution contract
// flow (REQ-017-017, TS-006, Issue #2547; updated for the REQ-030 state
// transition refactor, Issue #2808). Pins the chain between:
//   - the req-draft template (realization_actions source section):
//     src/opencode/commands/agentdev/templates/req-define/req-draft.md
//   - the case-open workflow skill (handoff contract): case-open holds
//     realization_actions as a Definition Package constituent and does not
//     finalize the execution contract (REQ-030-003, REQ-030-008)
//   - the case-run execution adapter skill (consumption as a settled
//     contract); the case-open / case-ready / case-run public command
//     definitions were removed by Case #2981 / DEC-033 and case-auto drives
//     them as internal lifecycle stages
//   - the requirement:
//     docs/requirements/REQ-017.md (REQ-017-017)
// as a permanent regression guard (TS-006):
//   - case-open declares the realization_actions processing target and holds
//     it in the Definition Package without loss
//   - case-run declares consumption of the projected policy as a settled
//     contract: no re-decision, internal implementation policy only,
//     blocked boundary for realization-responsibility changes
//   - after case-ready success, case-run obtains change responsibility,
//     intent, and verification policy from the Issue body alone
//     (no req_draft re-read, REQ-017-016)

// ADF-COVERS(verification): REQ-017-017
// ADF-COVERS(verification): REQ-030-003, REQ-030-008

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const DRAFT_TEMPLATE_REL =
  "src/opencode/commands/agentdev/templates/req-define/req-draft.md";
const CASE_OPEN_SKILL_REL =
  "src/opencode/skills/agentdev-workflow-case-open/SKILL.md";
const CASE_OPEN_REF_REL =
  "src/opencode/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md";
const CASE_RUN_ADAPTER_REL =
  "src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md";
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

describe("case-open workflow skill handoff contract (REQ-030-003/008)", () => {
  // Case #2981（DEC-033）: the contract moved to the workflow skill body.
  const doc = read(CASE_OPEN_SKILL_REL);

  test("lists realization_actions as a draft processing target", () => {
    expect(doc).toMatch(/`agreed_items` \/ `artifact_actions` \/ `operation_units` \/ `realization_actions`/);
  });

  test("holds realization_actions as a Definition Package constituent without loss", () => {
    expect(read(CASE_OPEN_REF_REL)).toMatch(/Definition Package の構成要素として保持する/);
  });

  test("does not finalize the execution contract (projection is case-ready's responsibility)", () => {
    expect(doc).toMatch(/execution contract の確定、Standard \/ Epic の最終確定、Child Issue \/ Wave の作成、RU 削除、proposed Decision の受理評価は行わない/);
    expect(doc).toContain("case-ready 実行契約 REQ へ移管");
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

    test(`${label} template declares the projection contract and the functional projection anchor`, () => {
      const section = extractHeadingSection(read(rel), `### ${PROJECTION_SECTION}`);
      expect(section).not.toBe("");
      expect(section).toMatch(/realization_actions を本セクションへ投影する/);
      expect(section).toContain("（実現面投影契約）");
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

describe("case-run execution adapter consumption contract (REQ-017-017)", () => {
  // Case #2981（DEC-033）: the contract moved to the execution adapter skill.
  const doc = read(CASE_RUN_ADAPTER_REL);

  test("consumes the projected realization policy as a settled contract", () => {
    expect(doc).toMatch(/実現面の変更方針（realization_actions 由来）は既確定契約として消費/);
  });

  test("does not re-decide responsibility, intent, or verification policy", () => {
    expect(doc).toMatch(/実現責務・変更意図・検証方針を再決定せず/);
  });

  test("limits decisions to internal implementation policy within the settled scope", () => {
    expect(doc).toMatch(/その範囲内の内部実装方針だけを決定する（実現面投影契約）/);
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
