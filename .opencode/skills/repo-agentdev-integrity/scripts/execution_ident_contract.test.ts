// ADF-COVERS(verification): REQ-048-001, REQ-048-002, REQ-048-003, REQ-048-004, REQ-048-005, REQ-048-016
// 実行識別情報セクション契約テスト（Issue #2400 Area1、Issue #2600 で新 REQ-048 の意図へ再構成）。
// テンプレートの実行識別情報セクションが機械的に解析可能な構造化形式を持ち、
// Case・ADF 工程・実行単位・委譲単位・PR・実行結果の相関が機械判別できること（REQ-048-001、REQ-048-002）、
// harness 側識別子が必須契約になっていないこと（REQ-048-003、REQ-048-004）、
// 識別情報欠落時は N/A 記録で workflow を停止しないこと（REQ-048-004、REQ-048-005）を検証する。
// adf_* field 集合の全体固定は REQ-048-014 のとおり REQ-048 の成立条件としない。本テストは
// REQ-048-001 が要求する相関の成立に必要な key のみを検査し、REQ-048-012 の実験契約に従う変更を妨げない。
// テンプレートは src/opencode/（原本）を優先読込する（worktree は junction 未伝播、REQ-018-001 と同一 fallback 構成）。
import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const PROJECTION_TEMPLATES_DIR = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
const SOURCE_TEMPLATES_DIR = path.join(
  REPO_ROOT,
  "src",
  "opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
const TEMPLATES_DIR = fs.existsSync(PROJECTION_TEMPLATES_DIR)
  ? PROJECTION_TEMPLATES_DIR
  : SOURCE_TEMPLATES_DIR;
const SOURCE_SKILLS_DIR = path.join(REPO_ROOT, "src", "opencode", "skills");

const ISSUE_TEMPLATES = [
  "issue_desc_feature.md",
  "issue_desc_bug.md",
  "issue_desc_epic.md",
  "issue_desc_child.md",
] as const;

// REQ-048-001 が対応付けを要求する相関の成立に必要な key（Case・ADF 工程・実行単位・委譲単位・PR・実行結果）。
// adf_upstream_confirmed 等の他 key は REQ-048-014 のとおり成立条件として固定しない。
const ISSUE_CORRELATION_KEYS = [
  "adf_case",
  "adf_phase",
  "adf_execution_unit",
] as const;

const PR_CORRELATION_KEYS = [
  "adf_case",
  "adf_pr",
  "adf_execution_unit",
  "adf_delegation",
  "adf_result",
] as const;

// harness 側の詳細実行履歴・識別子を必須契約としない（REQ-048-003、REQ-048-004）。
const FORBIDDEN_REQUIRED_KEYS = [
  "adf_session",
  "adf_session_id",
  "adf_model",
  "adf_token",
  "adf_tool_call",
  "adf_message",
  "adf_part",
  "adf_compaction",
] as const;

const RESULT_STATES = [
  "completed-pr",
  "blocked",
  "failed",
  "delegation-unavailable",
] as const;

// Epic と child の実行単位（adf_execution_unit）の規約形式。実行単位の値から
// 親子実行関係（REQ-048-001）が機械判別できることを検査するために参照する。
const EXECUTION_UNIT_FORMATS: Record<string, string> = {
  "issue_desc_epic.md": "epic:",
  "issue_desc_child.md": "standard:",
};

function readTemplate(file: string): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8");
}

/**
 * 実行識別情報セクションを機械的に解析する。
 * セクション内の `- adf_{key}: {value}` 行のみを正とし、
 * 自由文中に偶然出現する ID には依存しない（REQ-048-001、REQ-048-002）。
 */
export function extractExecutionIdent(content: string): Map<string, string> {
  const lines = content.split(/\r?\n/);
  const keys = new Map<string, string>();
  let inSection = false;
  const kvRe = /^-\s+(adf_[a-z_]+)\s*:\s*(.*)$/;
  for (const line of lines) {
    if (/^##\s/.test(line)) {
      const heading = line.replace(/^##\s+/, "").trim();
      inSection = heading === "実行識別情報";
      continue;
    }
    if (!inSection) continue;
    const m = line.match(kvRe);
    if (m) {
      keys.set(m[1], m[2].trim());
    }
  }
  return keys;
}

describe("REQ-048-001/002: 実行識別情報セクションの機械判別可能性", () => {
  const sectionHeading = "## 実行識別情報";
  const markerRe = /<!--\s*【必須】\s*-->/;

  for (const file of [...ISSUE_TEMPLATES, "pr_desc.md"]) {
    describe(`template: ${file}`, () => {
      const content = readTemplate(file);

      it("実行識別情報セクションを含む", () => {
        expect(content.includes(sectionHeading)).toBe(true);
      });

      it("実行識別情報セクションは【必須】マーカーを持つ", () => {
        const idx = content.indexOf(sectionHeading);
        const after = content.slice(idx, idx + 200);
        expect(markerRe.test(after)).toBe(true);
      });

      it("機械的解析で相関 key（Case・工程・実行単位・委譲単位・PR・実行結果）を復元できる", () => {
        const keys = extractExecutionIdent(content);
        const required =
          file === "pr_desc.md" ? PR_CORRELATION_KEYS : ISSUE_CORRELATION_KEYS;
        for (const key of required) {
          expect(keys.has(key)).toBe(true);
          expect(keys.get(key)).not.toBe("");
        }
      });

      it("解析はセクション外の adf_ 形式行に依存しない", () => {
        // セクション外に紛れ込んだ key-value 行を解析結果から除外する構造であること。
        // テンプレートではセクション外に adf_ 行が存在しないことを確認する。
        const lines = content.split(/\r?\n/);
        const kvRe = /^-\s+adf_[a-z_]+\s*:/;
        const sectionLineNo = lines.findIndex(
          (l) => l.trim() === sectionHeading,
        );
        expect(sectionLineNo).toBeGreaterThanOrEqual(0);
        const nextHeadingRe = /^##\s+/;
        let nextSectionLineNo = lines.length;
        for (let i = sectionLineNo + 1; i < lines.length; i++) {
          if (nextHeadingRe.test(lines[i])) {
            nextSectionLineNo = i;
            break;
          }
        }
        for (let i = 0; i < lines.length; i++) {
          if (i > sectionLineNo && i < nextSectionLineNo) continue;
          expect(kvRe.test(lines[i])).toBe(false);
        }
      });

      it("配布物内部 ID（REQ-XXXX 数字つき）を含まない", () => {
        expect(/REQ-\d/.test(content)).toBe(false);
      });

      const unitFormat = EXECUTION_UNIT_FORMATS[file];
      if (unitFormat !== undefined) {
        it("実行単位の値は親子実行関係を機械判別できる形式を規定する", () => {
          // REQ-048-001 の親子実行関係の相関。Epic は epic:{N}、child は standard:{N} の
          // 形式を規約として宣言し、実行単位の値の先頭から親子の区別が機械判別できること。
          const unit = extractExecutionIdent(content).get("adf_execution_unit");
          expect(unit).toBeDefined();
          expect(unit!.includes(unitFormat)).toBe(true);
        });
      }
    });
  }

  it("実行識別情報の記録先は既存テンプレートのみ（この目的の新規テンプレート種別を新設しない）", () => {
    const files = fs
      .readdirSync(TEMPLATES_DIR)
      .filter((f) => f.endsWith(".md"))
      .sort();
    // 実行識別情報セクションを持つのは既存5テンプレートのみであること（REQ-048-016）。
    const withSection = files.filter((f) =>
      readTemplate(f).includes(sectionHeading),
    );
    expect(withSection).toEqual([...ISSUE_TEMPLATES, "pr_desc.md"].sort());
  });
});

describe("REQ-048-003/004: harness 側識別子と OpenCode 内部履歴の非必須化", () => {
  for (const file of [...ISSUE_TEMPLATES, "pr_desc.md"]) {
    it(`${file}: harness 側識別子・OpenCode 内部履歴を必須 key としない`, () => {
      const keys = extractExecutionIdent(readTemplate(file));
      for (const forbidden of FORBIDDEN_REQUIRED_KEYS) {
        expect(keys.has(forbidden)).toBe(false);
      }
    });

    it(`${file}: adf_harness_ref は任意として明記される`, () => {
      const content = readTemplate(file);
      expect(content.includes("- adf_harness_ref:")).toBe(true);
      const line = content
        .split(/\r?\n/)
        .find((l) => l.startsWith("- adf_harness_ref:"));
      expect(line).toBeDefined();
      expect(line!.includes("任意")).toBe(true);
    });
  }
});

describe("REQ-048-004/005: 識別情報欠落時の N/A 記録と非停止", () => {
  for (const file of [...ISSUE_TEMPLATES, "pr_desc.md"]) {
    it(`${file}: 欠落時 N/A 記録と停止しない旨をセクション規約に含む`, () => {
      const content = readTemplate(file);
      const sectionComment = content.slice(
        content.indexOf("## 実行識別情報"),
        content.indexOf("## 実行識別情報") + 900,
      );
      expect(sectionComment.includes("N/A")).toBe(true);
      expect(sectionComment.includes("停止しない")).toBe(true);
    });
  }
});

describe("REQ-048-001/002: 委譲識別情報ブロックと PR 転記の対応", () => {
  const harnessDelegationPath = path.join(
    SOURCE_SKILLS_DIR,
    "agentdev-case-run-execution-adapter",
    "references",
    "harness-delegation.md",
  );

  it("委譲識別情報ブロックの雛形が存在する", () => {
    expect(fs.existsSync(harnessDelegationPath)).toBe(true);
    const content = fs.readFileSync(harnessDelegationPath, "utf-8");
    expect(content.includes("<delegation-ident>")).toBe(true);
    expect(content.includes("adf_delegation_id")).toBe(true);
    expect(content.includes("adf_delegation_purpose")).toBe(true);
    expect(content.includes("adf_parent")).toBe(true);
    expect(content.includes("adf_child")).toBe(true);
  });

  it("委譲単位識別子は DEL-{N}-{seq} 形式を規定する", () => {
    const content = fs.readFileSync(harnessDelegationPath, "utf-8");
    expect(content.includes("DEL-{N}-{seq}")).toBe(true);
  });

  it("PR テンプレートの adf_delegation は委譲 prompt からの転記を規定する", () => {
    const line = readTemplate("pr_desc.md")
      .split(/\r?\n/)
      .find((l) => l.startsWith("- adf_delegation:"));
    expect(line).toBeDefined();
    expect(line!.includes("DEL-{N}-{seq}")).toBe(true);
    expect(line!.includes("転記")).toBe(true);
  });

  it("PR テンプレートの adf_result は result 契約の4状態を列挙する", () => {
    const line = readTemplate("pr_desc.md")
      .split(/\r?\n/)
      .find((l) => l.startsWith("- adf_result:"));
    expect(line).toBeDefined();
    for (const state of RESULT_STATES) {
      expect(line!.includes(state)).toBe(true);
    }
  });
});

describe("REQ-048-016: 実行識別情報の記録基盤と Design 現行ベースライン宣言", () => {
  const templatesDesignPath = path.join(
    REPO_ROOT,
    "docs",
    "designs",
    "skills",
    "agentdev-workflow-templates.md",
  );

  it("agentdev-workflow-templates Design は識別情報 field 集合を現行ベースラインとして宣言する", () => {
    // 識別情報 field 集合は REQ-048-014 のとおり REQ-048 の成立条件として固定しない。
    // Design の現行ベースライン宣言セクションがこの運用（REQ-048-012 の実験契約に従う変更）を
    // 宣言していることを機械検査し、実験による変更を Design 宣言の更新から始められる状態を固定する。
    const design = fs.readFileSync(templatesDesignPath, "utf-8");
    expect(
      design.includes("## 実行識別情報・検証差分のテンプレートセクション形式"),
    ).toBe(true);
    expect(design.includes("現行ベースライン")).toBe(true);
    expect(design.includes("固定しない")).toBe(true);
    expect(design.includes("REQ-048-012")).toBe(true);
  });
});
