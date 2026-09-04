// ADF-COVERS(verification): REQ-012-044, REQ-012-048, REQ-012-049
//
// agentdev-traceability 配布スキルの3能力（coverage、impact、check）の統合検証
// （OU-002、Issue #2360）。派生 Graph が存在しない状態での動作（AC-001）、
// 旧公開API非依存（AC-009）、`.agentdev/graph/` の生成・鮮度管理の非実行（AC-010）、
// および REQ-012-043〜050 の対応宣言の完全性（完了条件6）を検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_EXCLUDE_DIRS,
  scanCorpus,
} from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { parseDeclarations } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts";
import { coverageByRequirement, impactByArtifact } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/query.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import { currentRequirementLineIds } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/requirements.ts";
import { findRepoRoot } from "../cli_utils.ts";

const SCRIPT_DIR = import.meta.dir;
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const SKILL_SCRIPTS = join(
  REPO_ROOT,
  "src",
  "opencode",
  "skills",
  "agentdev-traceability",
  "scripts",
);

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-int-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);

const MARKER = ["ADF", "-", "COVERS"].join("");

// フィクスチャ用の宣言行生成。実リポジトリのコーパス走査での誤検出を避けるため
// マーカーはパーツ結合経由で組み立てる。
function decl(role: string, ids: string): string {
  return `<!-- ${MARKER}(${role}): ${ids} -->`;
}

function writeFixture(rel: string, lines: readonly string[]): void {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("派生 Graph が存在しない状態での3能力の動作（AC-001、REQ-012-044）", () => {
  it("coverage、impact、check がすべて正規成果物の直接走査のみで成立する", () => {
    writeFixture("docs/requirements/REQ-910.md", [
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-910-001 | 統合用 |",
    ]);
    writeFixture("docs/designs/int.md", [decl("design", "REQ-910-001")]);
    writeFixture("src/int.ts", [decl("implementation", "REQ-910-001")]);
    writeFixture("tests/int.test.ts", [decl("verification", "REQ-910-001")]);
    // フィクスチャルートに派生 Graph は存在しない
    expect(readdirSync(ROOT).includes(".agentdev")).toBe(false);

    const scan = scanCorpus(ROOT);
    expect(scan.declarations).toHaveLength(3);

    const coverage = coverageByRequirement(scan.declarations, "REQ-910-001");
    expect(coverage.counts).toEqual({
      design: 1,
      implementation: 1,
      verification: 1,
      total: 3,
    });

    const impact = impactByArtifact(scan.declarations, "src/int.ts");
    expect(impact.recheckCandidates.map((c) => c.file).sort()).toEqual([
      "docs/designs/int.md",
      "tests/int.test.ts",
    ]);

    const known = currentRequirementLineIds(ROOT);
    expect(known).toContain("REQ-910-001");
    const report = runChecks(scan, known, { completenessReqIds: ["REQ-910-001"] });
    // 7種検査（invalid-catalog-refs 追加に伴い 6 → 7。フィクスチャにカタログはなく pass）
    expect(report.summary).toEqual({ pass: 7, fail: 0 });
  });
});

describe("4桁第1セグメント REQ の要件行収集（Issue #2594）", () => {
  it("4桁 REQ ファイル名と4桁要件行テーブル行を収集する（3桁ファイルも併存受理）", () => {
    writeFixture("docs/requirements/REQ-0037.md", [
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-0037-001 | 4桁要件1 |",
      "| REQ-0037-002 | 4桁要件2 |",
    ]);
    writeFixture("docs/requirements/REQ-911.md", [
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-911-001 | 3桁要件 |",
    ]);
    const known = currentRequirementLineIds(ROOT);
    expect(known).toContain("REQ-0037-001");
    expect(known).toContain("REQ-0037-002");
    expect(known).toContain("REQ-911-001");
    expect(known).toContain("REQ-910-001");
  });
});

describe("旧公開API・旧 Graph 生成物への非依存（AC-009、AC-010、REQ-012-049）", () => {
  it("旧 artifact-graph 実装を import していない", () => {
    let files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, name.name);
        if (name.isDirectory()) {
          if (name.name === "node_modules") continue;
          walk(full);
        } else if (name.name.endsWith(".ts")) files.push(full);
      }
    };
    walk(SKILL_SCRIPTS);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      // 検査対象は import 文のみ（コメント・文字列内の言及は対象外）
      const importLines = readFileSync(file, "utf-8")
        .split("\n")
        .filter((line) => line.trim().startsWith("import "));
      expect(importLines.join("\n")).not.toContain("artifact-graph");
    }
  });

  it("旧 Graph 生成物を配置しても走査対象に含めない（.agentdev 除外）", () => {
    writeFixture(".agentdev/graph/nodes.jsonl", ["{}"]);
    writeFixture("visible.md", [decl("implementation", "REQ-910-001")]);
    const scan = scanCorpus(ROOT);
    expect(scan.declarations.every((d) => !d.file.startsWith(".agentdev/"))).toBe(true);
    expect(scan.declarations.some((d) => d.file === "visible.md")).toBe(true);
    expect(DEFAULT_EXCLUDE_DIRS).toContain(".agentdev");
    expect(DEFAULT_EXCLUDE_DIRS).toContain(".worktrees");
    expect(DEFAULT_EXCLUDE_DIRS).toContain("node_modules");
  });

  it("シンボリックリンク・ジャンクション配下を走査しない", () => {
    const outside = join(TEMP_BASE, `${RUN_ID}-outside`);
    mkdirSync(outside, { recursive: true });
    writeFileSync(join(outside, "linked.md"), decl("implementation", "REQ-910-001") + "\n", "utf-8");
    const linkPath = join(ROOT, "linkeddir");
    try {
      rmSync(linkPath, { recursive: true, force: true });
      symlinkSync(outside, linkPath, "dir");
      const scan = scanCorpus(ROOT);
      expect(scan.declarations.every((d) => !d.file.startsWith("linkeddir/"))).toBe(true);
    } finally {
      rmSync(linkPath, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

describe("REQ-012-043〜050 の対応宣言の完全性（OU-002 完了条件6、実コーパス）", () => {
  const OU002_SCOPE: readonly string[] = Array.from(
    { length: 8 },
    (_, i) => `REQ-012-${String(43 + i).padStart(3, "0")}`,
  );

  // 宣言コーパスは tim_declarations_contract.test.ts と同一（docs + repo-integrity scripts）。
  // 配布物（src/opencode/skills/agentdev-traceability/）は concrete 要件行ID を持たないため
  // （配布依存境界、DEC-014）、実装対応は agentdev-traceability Design が、検証対応は
  // repo-local の traceability_*.test.ts が保持する。
  function corpusDeclarations() {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        if (name.name === "node_modules") continue;
        const full = join(dir, name.name);
        if (name.isDirectory()) walk(full);
        else if (name.name.endsWith(".md") || name.name.endsWith(".ts")) files.push(full);
      }
    };
    walk(join(REPO_ROOT, "docs"));
    walk(join(REPO_ROOT, ".opencode", "skills", "repo-agentdev-integrity", "scripts"));
    return files.flatMap((f) =>
      parseDeclarations(
        f.slice(REPO_ROOT.length + 1).replaceAll("\\", "/"),
        readFileSync(f, "utf-8"),
      ).declarations,
    );
  }

  it("各要件行へ実装対応が1件以上保存されている", () => {
    const declarations = corpusDeclarations();
    const lacking = OU002_SCOPE.filter(
      (reqId) =>
        !declarations.some((d) => d.role === "implementation" && d.reqIds.includes(reqId)),
    );
    expect(lacking).toEqual([]);
  });

  it("各要件行へ検証対応が1件以上保存されている", () => {
    const declarations = corpusDeclarations();
    const lacking = OU002_SCOPE.filter(
      (reqId) =>
        !declarations.some((d) => d.role === "verification" && d.reqIds.includes(reqId)),
    );
    expect(lacking).toEqual([]);
  });

  it("配布スキル配下に concrete 要件行ID が存在しない（宣言は非配布領域へ保存）", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        if (name.name === "node_modules") continue;
        const full = join(dir, name.name);
        if (name.isDirectory()) walk(full);
        else files.push(full);
      }
    };
    walk(join(SKILL_SCRIPTS, "..")); // スキルルート全体（SKILL.md + scripts/）
    const concrete = /(?:REQ|DEC|ADR)-\d{1,}/;
    for (const file of files) {
      const hits = readFileSync(file, "utf-8")
        .split(/\r?\n/)
        .filter((line) => concrete.test(line));
      expect({ file, hits }).toEqual({ file, hits: [] });
    }
  });
});
