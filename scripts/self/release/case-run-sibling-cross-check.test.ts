// ADF-COVERS(verification): REQ-035-021
//
// Existence verification for REQ-035-021 (並列兄弟 branch 実差分交差確認):
//   - the distribution reference (references/single.md) carries the runtime
//     procedure section with the four procedure elements (兄弟 branch 変更
//     ファイルの取得〔merge-base 起点の差分〕、交差判定、検出時の警告と
//     調整記録、取得不能時の報告〔検査省略としない〕) and is NOT framed as
//     a pre-delegation gate (STEP-S3) obligation;
//   - the SKILL.md control plane references the procedure section;
//   - the canonical Design section (docs/designs/commands/case-run.md) keeps
//     the three mandatory statements: 警告・調整記録と case-close Level 1
//     rebase 担当契約との整合、宣言ベース前置検出を代替しない旨、取得不能
//     時に検査省略としない旨;
//   - the sidecar (traceability/agentdev-workflow-case-run.yaml) declares
//     REQ-035-021 implementation / verification relations for these
//     artifacts.

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const SINGLE_REL =
  "src/common/skills/agentdev-workflow-case-run/references/single.md";
const SKILL_REL = "src/common/skills/agentdev-workflow-case-run/SKILL.md";
const DESIGN_REL = "docs/designs/commands/case-run.md";
const SIDECAR_REL = "traceability/agentdev-workflow-case-run.yaml";

const CROSS_CHECK_HEADING =
  "## 並列兄弟 branch 実差分交差確認（commit・push 前置）";
const SINGLE_SECTION_END = "\n## 配布物本体 ADF-COVERS 宣言の除去可否判定";
const DESIGN_HEADING =
  "#### 並列兄弟 branch 実差分交差確認（commit・push 前置）";

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

function sectionBetween(
  content: string,
  startHeading: string,
  endHeading: string,
): string {
  const start = content.indexOf(startHeading);
  if (start === -1) return "";
  const rest = content.slice(start);
  if (endHeading === "") return rest;
  const end = rest.indexOf(endHeading, startHeading.length);
  return end === -1 ? rest : rest.slice(0, end);
}

// Sidecar rows are fixed 2-level YAML:
//   implementation:
//     <artifact path>:
//       - REQ-NNN-NNN
//   verification:
//     <artifact path>:
//       - REQ-NNN-NNN
function reqIdsUnderArtifact(
  sidecarContent: string,
  roleSection: string,
  artifactKey: string,
): string[] {
  const ids: string[] = [];
  let inRole = false;
  let inArtifact = false;
  for (const line of sidecarContent.split("\n")) {
    if (line === `${roleSection}:`) {
      inRole = true;
      inArtifact = false;
      continue;
    }
    if (!inRole) continue;
    if (line.length > 0 && !line.startsWith(" ")) {
      // next top-level key: leave the role section
      inRole = false;
      inArtifact = false;
      continue;
    }
    if (line.startsWith("  ") && !line.startsWith("    ")) {
      inArtifact = line.trim() === `${artifactKey}:`;
      continue;
    }
    if (inArtifact && line.startsWith("    - ")) {
      ids.push(line.slice(6).trim());
    }
  }
  return ids;
}

describe("REQ-035-021 配布 reference の実差分交差確認手順節", () => {
  const single = read(SINGLE_REL);
  const crossCheckSection = sectionBetween(
    single,
    CROSS_CHECK_HEADING,
    SINGLE_SECTION_END,
  );

  test("single.md に実差分交差確認手順節が存在する", () => {
    expect(single).toContain(CROSS_CHECK_HEADING);
    expect(crossCheckSection).not.toBe("");
  });

  test("手順要素4点（兄弟 branch 変更ファイルの取得・交差判定・警告と調整記録・取得不能報告）がある", () => {
    // 兄弟 branch 変更ファイルの取得（merge-base 起点の差分）
    expect(crossCheckSection).toContain("merge-base 起点の `git diff --name-only`");
    expect(crossCheckSection).toContain("兄弟 branch の変更ファイル集合の取得");
    // 交差判定
    expect(crossCheckSection).toContain("**交差判定**");
    // 検出時の警告と調整記録（マージ順序・所有正当）
    expect(crossCheckSection).toContain("競合リスク情報として警告");
    expect(crossCheckSection).toContain("(1) マージ順序の調整決定");
    expect(crossCheckSection).toContain("(2) 変更対象の所有正当の確認");
    // 取得不能時の報告（検査省略としない）
    expect(crossCheckSection).toContain("検査省略とせず");
    expect(crossCheckSection).toContain("検出不能は交差なしを意味しない");
  });

  test("case-close Level 1 rebase 担当契約との整合がある", () => {
    expect(crossCheckSection).toContain("case-close のコンフリクト解消（Level 1 rebase）担当契約へ引き継ぐ");
  });

  test("宣言ベース前置検出を代替しない旨がある", () => {
    expect(crossCheckSection).toContain("補完関係にあり置換しない");
    expect(crossCheckSection).toContain("宣言ベース前置検出の結果を無効化しない");
  });

  test("前置 gate（STEP-S3）での実施を前提とした記述がない", () => {
    // 実施位置は commit・push 直前（commit 前 3 検査と同一位置）であり、
    // 手順節自身が前置 gate 実施位置を否定する
    expect(crossCheckSection).toContain("commit 前 3 検査と同一位置");
    expect(crossCheckSection).toContain("前置 gate での実施を前提とした手順としない");
    // STEP-S3 節内に交差確認手順が紐づいていないこと
    const s3Section = sectionBetween(
      single,
      "## STEP-S3:",
      `\n${CROSS_CHECK_HEADING}`,
    );
    expect(s3Section).not.toBe("");
    expect(s3Section).not.toContain("実差分交差確認");
  });
});

describe("REQ-035-021 の SKILL.md 制御平面参照", () => {
  const skill = read(SKILL_REL);

  test("制御平面から当該手順への参照がある", () => {
    expect(skill).toContain("並列兄弟 branch 実差分交差確認（commit・push 前置）");
    expect(skill).toContain("references/single.md「並列兄弟 branch 実差分交差確認（commit・push 前置）」");
  });

  test("制御平面の参照が前置 gate（STEP-S3）実施を前提としない", () => {
    const controlPlaneEntry = sectionBetween(
      skill,
      "- **並列兄弟 branch 実差分交差確認**:",
      "\n### 再開プロトコル",
    );
    expect(controlPlaneEntry).not.toBe("");
    expect(controlPlaneEntry).toContain("STEP-S4 委譲内");
    expect(controlPlaneEntry).toContain("前置 gate 群（STEP-S3）では実施しない");
  });
});

describe("REQ-035-021 の case-run Design 手順節（正）", () => {
  const design = read(DESIGN_REL);
  const designSection = sectionBetween(design, DESIGN_HEADING, "\n#### ");

  test("Design 手順節が存在し3点の記述がある", () => {
    expect(design).toContain(DESIGN_HEADING);
    expect(designSection).not.toBe("");
    // 警告・調整記録・case-close Level 1 rebase 担当契約との整合
    expect(designSection).toContain("case-close の Level 1 rebase 担当契約へ引き継ぐ");
    // 宣言ベース前置検出を代替しない旨
    expect(designSection).toContain("補完関係にあり置換しない");
    // 取得不能時に検査省略としない旨
    expect(designSection).toContain("検査省略とせず取得不能として報告する");
  });
});

describe("REQ-035-021 の sidecar 宣言", () => {
  const sidecar = read(SIDECAR_REL);

  test("implementation 宣言（SKILL.md・single.md）がある", () => {
    expect(
      reqIdsUnderArtifact(
        sidecar,
        "implementation",
        "src/common/skills/agentdev-workflow-case-run/SKILL.md",
      ),
    ).toContain("REQ-035-021");
    expect(
      reqIdsUnderArtifact(
        sidecar,
        "implementation",
        "src/common/skills/agentdev-workflow-case-run/references/single.md",
      ),
    ).toContain("REQ-035-021");
  });

  test("verification 宣言（本 test）がある", () => {
    expect(
      reqIdsUnderArtifact(
        sidecar,
        "verification",
        "scripts/self/release/case-run-sibling-cross-check.test.ts",
      ),
    ).toContain("REQ-035-021");
  });
});
