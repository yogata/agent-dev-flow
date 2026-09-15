// ADF-COVERS(verification): REQ-030-012, REQ-030-013, REQ-030-014, REQ-061-029, REQ-061-030, REQ-061-031
//
// 横断依存検査の workflow skill 本体への組み込み構造の回帰ガード。
// case-open STEP-5（REQ-030-012〜014）と case-ready 検証対応要否ゲート
// （REQ-061-029〜031）の検査手順・警告文言・委譲境界・非阻止制約が
// 配布物本文に保持されていること、および比較手続きの単一実装配置
// （RA-001）と具体パス排除（RA-003、TS-004）を検証する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dir, "..", "..", "..");
const CASE_OPEN_SKILL = path.join(
  REPO_ROOT, "src", "opencode", "skills", "agentdev-workflow-case-open", "SKILL.md",
);
const CASE_OPEN_STEP5_REF = path.join(
  REPO_ROOT,
  "src", "opencode", "skills", "agentdev-workflow-case-open", "references",
  "definition-pr-and-idempotency.md",
);
const CASE_READY_SKILL = path.join(
  REPO_ROOT, "src", "opencode", "skills", "agentdev-workflow-case-ready", "SKILL.md",
);
const CASE_READY_GATE_REF = path.join(
  REPO_ROOT,
  "src", "opencode", "skills", "agentdev-workflow-case-ready", "references",
  "readiness-and-cleanup.md",
);
const SHARED_ENGINE_ENTRY = path.join(
  REPO_ROOT,
  "src", "opencode", "skills", "agentdev-workflow-case-open", "scripts", "src",
  "inspect_cross_dependencies.ts",
);
const ENGINE_TREE = path.join(
  REPO_ROOT, "src", "opencode", "skills", "agentdev-workflow-case-open", "scripts",
);
const CASE_READY_SKILL_DIR = path.join(
  REPO_ROOT, "src", "opencode", "skills", "agentdev-workflow-case-ready",
);

function read(file: string): string {
  return fs.readFileSync(file, "utf-8");
}

function walkFiles(dir: string, exts: readonly string[]): string[] {
  const out: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (exts.includes(path.extname(entry.name))) {
        out.push(full);
      }
    }
  }
  return out;
}

describe("case-open STEP-5 への横断依存検査の組み込み（REQ-030-012〜014）", () => {
  test("SKILL.md の STEP-5 行に横断依存検査の結果が反映されている", () => {
    const skill = read(CASE_OPEN_SKILL);
    const step5 = skill.split("\n").find((l) => l.includes("| STEP-5 |"));
    expect(step4rowHasInspection(step5 ?? "")).toBe(true);
  });

  function step4rowHasInspection(step5Row: string): boolean {
    return step5Row.includes("横断依存検査") && step5Row.includes("警告提示記録");
  }

  test("SKILL.md の対応宣言に REQ-030-012〜014 が含まれる", () => {
    const skill = read(CASE_OPEN_SKILL);
    for (const id of ["REQ-030-012", "REQ-030-013", "REQ-030-014"]) {
      expect(skill).toContain(id);
    }
  });

  test("STEP-5 詳細 reference に検査手順・検出源限定・選択肢・非阻止・検出不能・委譲境界が定義されている", () => {
    const ref = read(CASE_OPEN_STEP5_REF);
    expect(ref).toContain("横断依存検査（STEP-5 実行時");
    expect(ref).toContain("artifact_actions");
    expect(ref).toContain("検出源の限定");
    expect(ref).toContain("時間窓による狭域化はしない");
    expect(ref).toContain("inspect_cross_dependencies.ts");
    expect(ref).toContain("先行整備 Case の切り出し提案");
    expect(ref).toContain("既存 Case への登録責務の割り当て");
    expect(ref).toContain("このまま並行投入");
    expect(ref).toContain("警告のみで Root Case の確立を自動阻止しない");
    expect(ref).toContain("検出不能として報告");
    expect(ref).toContain("Wave 重複前置検出");
    expect(ref).toContain("再実行時も本検査を再実行し、警告を再提示する");
  });
});

describe("case-ready 検証ゲートへの横断次元の組み込み（REQ-061-029〜031）", () => {
  test("SKILL.md の STEP-6 行に横断依存検査が反映されている", () => {
    const skill = read(CASE_READY_SKILL);
    const step6 = skill.split("\n").find((l) => l.includes("| STEP-6 |"));
    expect(step6).toBeDefined();
    expect(step6).toContain("横断依存検査");
    expect(step6).toContain("ready 遷移判定を変更しない");
  });

  test("SKILL.md の対応宣言に REQ-061-029〜031 が含まれる", () => {
    const skill = read(CASE_READY_SKILL);
    for (const id of ["REQ-061-029", "REQ-061-030", "REQ-061-031"]) {
      expect(skill).toContain(id);
    }
  });

  test("ゲート詳細 reference に横断次元・検出源・同時提示・非影響・委譲・共有領域解決が定義されている", () => {
    const ref = read(CASE_READY_GATE_REF);
    expect(ref).toContain("横断依存検査（ゲート横断次元");
    expect(ref).toContain("canonical Definition");
    expect(ref).toContain("とともに先行整備の選択肢");
    expect(ref).toContain("ready 遷移判定を変更しない");
    expect(ref).toContain("execution-structure の前置検出");
    expect(ref).toContain("project-extensions");
    expect(ref).toContain("時間窓による狭域化はしない");
    expect(ref).toContain("inspect_cross_dependencies.ts");
    expect(ref).toContain("decision_context");
  });
});

describe("比較手続きの単一実装配置（RA-001）", () => {
  test("共有エンジンの比較ロジックは case-open scripts 配下に単一実装として存在する", () => {
    expect(fs.existsSync(SHARED_ENGINE_ENTRY)).toBe(true);
    expect(fs.existsSync(path.join(ENGINE_TREE, "lib", "cross_dependency_engine.ts"))).toBe(true);
  });

  test("case-ready 側に比較エンジンの重複実装が存在しない", () => {
    const duplicates = walkFiles(CASE_READY_SKILL_DIR, [".ts"]).filter(
      (f) => f.includes("cross_dependency") || f.includes("inspect_cross"),
    );
    expect(duplicates).toEqual([]);
  });

  test("case-ready のゲート手順が case-open 側の共有エンジンを参照している", () => {
    const ref = read(CASE_READY_GATE_REF);
    expect(ref).toContain("agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts");
    expect(ref).toContain("重複実装しない");
  });
});

describe("配布物の具体参照排除（RA-003、TS-004）", () => {
  // SKILL.md の See Also 等、横断依存検査と無関係の既存行（テンプレート参照
  // `DEC-{N}` を含む行等）は本 Case の追加対象ではないため、検査対象は
  // 横断依存検査関連の追加行とエンジン配布ファイルに限定する。
  function inspectionRelatedLines(content: string): string[] {
    return content
      .split(/\r?\n/)
      .filter((l) => l.includes("横断依存検査") || l.includes("inspect_cross_dependencies"));
  }

  function inspectionSection(content: string, heading: string): string {
    const lines = content.split(/\r?\n/);
    const start = lines.findIndex((l) => l.includes(heading));
    expect(start, `section not found: ${heading}`).toBeGreaterThanOrEqual(0);
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((l) => /^#{2,3} /.test(l));
    return rest.slice(0, end === -1 ? rest.length : end).join("\n");
  }

  test("SKILL.md の横断依存検査関連行に docs/ 具体パスが含まれない", () => {
    for (const file of [CASE_OPEN_SKILL, CASE_READY_SKILL]) {
      for (const line of inspectionRelatedLines(read(file))) {
        expect(`${path.relative(REPO_ROOT, file)}: ${line.slice(0, 60)}`).not.toContain("docs/");
      }
    }
  });

  test("ゲート手順セクションに docs/ 具体パスと共有領域の具体ファイル名が含まれない", () => {
    const openSection = inspectionSection(read(CASE_OPEN_STEP5_REF), "横断依存検査（STEP-5 実行時");
    const readySection = inspectionSection(read(CASE_READY_GATE_REF), "横断依存検査（ゲート横断次元");
    for (const [name, section] of [
      ["case-open", openSection],
      ["case-ready", readySection],
    ] as const) {
      for (const forbidden of ["docs/designs/", "docs/requirements/", "docs/decisions/", "verification-scope-catalog"]) {
        expect(section.includes(forbidden), `${name}: ${forbidden}`).toBe(false);
      }
    }
  });

  test("エンジン配布ファイルに docs/ 具体パスが含まれない", () => {
    for (const file of walkFiles(ENGINE_TREE, [".ts", ".md"])) {
      const content = read(file);
      for (const forbidden of ["docs/designs/", "docs/requirements/", "docs/decisions/"]) {
        expect(content.includes(forbidden), `${path.relative(REPO_ROOT, file)}: ${forbidden}`).toBe(false);
      }
      expect(content.includes("verification-scope-catalog"), path.relative(REPO_ROOT, file)).toBe(false);
    }
  });

  test("エンジン配布ファイルに宣言行以外の具体要件行IDが含まれない", () => {
    const concreteIdRe = /REQ-\d{3,4}-\d{3}/;
    for (const file of walkFiles(ENGINE_TREE, [".ts", ".md"])) {
      const content = read(file);
      const nonDeclarationLines = content
        .split(/\r?\n/)
        .filter((l) => !l.includes("ADF-COVERS("));
      for (const line of nonDeclarationLines) {
        expect(`${path.relative(REPO_ROOT, file)}: ${line.slice(0, 60)}`).not.toMatch(concreteIdRe);
      }
    }
  });
});
