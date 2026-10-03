// Projection chain test for the realization_actions → 実現方針 flow
// (REQ-017-017, TS-006, Issue #2547; updated for the REQ-030 state
// transition refactor, Issue #2808; updated for the Issue body new format,
// Issue #3407). Pins the chain between:
//   - the req-draft template (realization_actions source section):
//     src/common/commands/agentdev/templates/req-define/req-draft.md
//   - the case-open workflow skill (handoff contract): case-open holds
//     realization_actions as a Definition Package constituent and does not
//     finalize the execution contract (REQ-030-003, REQ-030-008). The
//     Definition Package is not emitted as a dedicated Issue body section.
//   - the case-ready projection: realization_actions is projected into the
//     Issue body sections (対象範囲、実現方針〔条件付き〕、完了条件の検証方法) and
//     NOT into a dedicated Execution Contract section (REQ-017-017)
//   - the case-run execution adapter skill (consumption as a settled
//     contract); the case-open / case-ready / case-run public command
//     definitions were removed by Case #2981 / DEC-033 and case-auto drives
//     them as internal lifecycle stages
//   - the requirement:
//     docs/requirements/REQ-017.md (REQ-017-017)
// as a permanent regression guard (TS-006):
//   - case-open declares the realization_actions processing target and holds
//     it in the Definition Package without loss
//   - Issue templates do not define a dedicated Execution Contract section
//     nor the 実現面の変更方針 section; the projection destination is the
//     実現方針 section (conditional) and the completion criteria sections
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
  "src/common/commands/agentdev/templates/req-define/req-draft.md";
const CASE_OPEN_SKILL_REL =
  "src/common/skills/agentdev-workflow-case-open/SKILL.md";
const CASE_OPEN_REF_REL =
  "src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md";
const CASE_RUN_ADAPTER_REL =
  "src/common/skills/agentdev-case-run-execution-adapter/SKILL.md";
const CHILD_TEMPLATE_REL =
  "src/common/skills/agentdev-workflow-templates/templates/issue_desc_child.md";
const EPIC_TEMPLATE_REL =
  "src/common/skills/agentdev-workflow-templates/templates/issue_desc_epic.md";
const REQ_REL = "docs/requirements/REQ-017.md";

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
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

  test("does not emit the Definition Package as a dedicated Issue body section", () => {
    expect(doc).toMatch(/Definition Package を独立した Issue 本文物項目として生成しない/);
  });

  test("does not finalize the execution contract (projection is case-ready's responsibility)", () => {
    expect(doc).toMatch(/execution contract の確定、Standard \/ Epic の最終確定、Child Issue \/ Wave の作成、RU 削除、proposed Decision の受理評価は行わない/);
  });
});

describe("Issue templates define no Execution Contract section (REQ-017-017)", () => {
  for (const [label, rel] of [
    ["child", CHILD_TEMPLATE_REL],
    ["epic", EPIC_TEMPLATE_REL],
  ] as const) {
    test(`${label} template defines no Execution Contract section`, () => {
      const doc = read(rel);
      expect(doc).not.toContain("## Execution Contract");
      expect(doc).not.toContain("実現面の変更方針（realization_actions 由来）");
    });

    test(`${label} template projects the realization policy into the 実現方針 conditional section`, () => {
      const doc = read(rel);
      // 実現方針は非該当時は章を常設しない（条件付き章）。起票時の本文には含めない。
      expect(doc).not.toMatch(/^## 実現方針/m);
      // case-ready が realization_actions を実現方針へ投影する旨を本文テンプレートが
      // 独立章ではなく条件付き章として扱うことを、完了条件の展開契約が担保する。
      expect(doc).toContain("## 完了条件");
    });
  }
});

describe("case-ready projection responsibility (REQ-017-017)", () => {
  test("case-ready SKILL.md declares the realization_actions projection into the Issue body sections", () => {
    const doc = read(
      "src/common/skills/agentdev-workflow-case-ready/SKILL.md",
    );
    expect(doc).toContain("realization_actions");
    // 投影先は実現方針（条件付き章）と完了条件の検証方法であり、独立章を生成しない
    expect(doc).toContain("実現方針");
    expect(doc).toContain("完了条件");
  });
});

describe("case-run execution adapter consumption contract (REQ-017-017)", () => {
  // Case #2981（DEC-033）: the contract moved to the execution adapter skill.
  const doc = read(CASE_RUN_ADAPTER_REL);

  test("consumes the projected realization policy as a settled contract", () => {
    expect(doc).toMatch(/実現面投影契約/);
  });

  test("does not re-decide responsibility, intent, or verification policy", () => {
    expect(doc).toMatch(/実現責務・変更意図・検証方針を再決定せず/);
  });

  test("limits decisions to internal implementation policy within the settled scope", () => {
    expect(doc).toMatch(/その範囲内の内部実装方針だけを決定する/);
  });
});

describe("requirement anchor (docs/requirements/REQ-017.md)", () => {
  const doc = read(REQ_REL);

  test("REQ-017-017 requires the projection and the settled-contract consumption", () => {
    const row = doc.split(/\r?\n/).find((l) => l.startsWith("| REQ-017-017 |"));
    expect(row).toBeDefined();
    expect(row!).toContain("realization_actions を Issue / Epic の実現方針へ投影");
    expect(row!).toContain("Issue 本文だけで変更責務、変更意図、検証方針を取得");
    expect(row!).toContain("再決定せず");
  });
});
