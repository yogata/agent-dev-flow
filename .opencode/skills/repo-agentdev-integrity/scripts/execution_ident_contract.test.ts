// ADF-COVERS(verification): REQ-048-001, REQ-048-002, REQ-048-003, REQ-048-004, REQ-048-005, REQ-048-016
// 実行識別情報セクション契約テスト（Issue #2400 Area1、Issue #2600 で新 REQ-048 の意図へ再構成、
// Issue #2602 で縮小後 field 集合の相関成立確認へ更新、Issue #3407 で Issue 本文からの廃止へ追随）。
// PR 本文テンプレートの実行識別情報セクションが機械的に解析可能な構造化形式を持ち、
// Case・実行単位・委譲単位の相関が機械判別できること（REQ-048-001、REQ-048-002）。
// Issue 本文テンプレートには実行識別情報セクションを設けず（agentdev-workflow-templates Design
// 「実行識別情報・検証差分のテンプレートセクション形式」節）、Case・実行単位・親子実行関係は
// Issue 番号、親Epic: #N、実行構成表、Refs 行等の canonical 成果物関係から相関できること、
// harness 側識別子が必須契約になっていないこと（REQ-048-003、REQ-048-004）、
// 識別情報欠落時は N/A 記録で workflow を停止しないこと（REQ-048-004、REQ-048-005）を検証する。
// テンプレートは src/common/（共通正本）を優先読込する（worktree は junction 未伝播、REQ-018-001 と同一 fallback 構成）。
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
  "common",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
const TEMPLATES_DIR = fs.existsSync(PROJECTION_TEMPLATES_DIR)
  ? PROJECTION_TEMPLATES_DIR
  : SOURCE_TEMPLATES_DIR;
const SOURCE_SKILLS_DIR = path.join(REPO_ROOT, "src", "common", "skills");

// Issue 本文テンプレート。実行識別情報セクションを持たない（canonical 成果物関係から相関する）。
const ISSUE_TEMPLATES = [
  "issue_desc_feature.md",
  "issue_desc_bug.md",
  "issue_desc_epic.md",
  "issue_desc_child.md",
] as const;

// PR 本文テンプレート。実行識別情報セクションを持つ（PR は委譲単位識別子を相関に要する）。
const PR_TEMPLATES = [
  "pr_desc.md",
  "case-revise/amendment-pr.md",
] as const;

// REQ-048-001 が対応付けを要求する相関の成立に必要な最小 key（Case・実行単位）。
// 削除済み field（adf_phase、adf_upstream_confirmed）は canonical 成果物関係から導出する。
const PR_CORRELATION_KEYS = [
  "adf_case",
  "adf_execution_unit",
  "adf_delegation",
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

function readTemplate(file: string): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, ...file.split("/")), "utf-8");
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

describe("REQ-048-001/002: Issue 本文テンプレートは実行識別情報セクションを持たない", () => {
  const sectionHeading = "## 実行識別情報";

  for (const file of ISSUE_TEMPLATES) {
    describe(`template: ${file}`, () => {
      const content = readTemplate(file);

      it("実行識別情報セクションを設けない（canonical 成果物関係から相関する）", () => {
        expect(content.includes(sectionHeading)).toBe(false);
      });

      it("配布物内部 ID（REQ-XXXX 数字つき）を含まない", () => {
        expect(/REQ-\d/.test(content)).toBe(false);
      });
    });
  }

  it("子Issue テンプレートは親 Epic 判別の 親Epic: #N 行を規定する", () => {
    // REQ-048-001 の Epic 関係の canonical derivation。Case・実行単位・親子実行関係は
    // 本文冒頭の 親Epic: #N 行との組み合わせで相関できる。
    const content = readTemplate("issue_desc_child.md");
    expect(content.includes("親Epic: #{epic_number}")).toBe(true);
    expect(content.includes("Parent: #{epic_number}")).toBe(false);
  });

  it("Epic テンプレートは実行構成表（| Wave | Issue | 前提 | 状態 |）を規定する", () => {
    // REQ-048-001 の親子実行関係の相関。Epic 本文の実行構成表が子 Issue 一覧を
    // 機械判別可能な形で保持する。
    const content = readTemplate("issue_desc_epic.md");
    expect(content.includes("| Wave | Issue | 前提 | 状態 |")).toBe(true);
  });

  it("実行識別情報セクションを持つのは PR テンプレートのみ（この目的の新規テンプレート種別を新設しない）（REQ-048-016）", () => {
    const entries = fs.readdirSync(TEMPLATES_DIR, { recursive: true })
      .map((f) => String(f).replace(/\\/g, "/"))
      .filter((f) => f.endsWith(".md"))
      .sort();
    const withSection = entries.filter((f) => {
      try {
        return readTemplate(f).includes(sectionHeading);
      } catch {
        return false;
      }
    });
    expect(withSection).toEqual([...PR_TEMPLATES].sort());
  });
});

describe("REQ-048-001/002: PR テンプレートの実行識別情報セクションの機械判別可能性", () => {
  const sectionHeading = "## 実行識別情報";
  const markerRe = /<!--\s*【必須】\s*-->/;

  for (const file of PR_TEMPLATES) {
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

      it("機械的解析で相関 key（Case・実行単位・委譲単位）を復元できる", () => {
        const keys = extractExecutionIdent(content);
        for (const key of PR_CORRELATION_KEYS) {
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
    });
  }

  it("PR 番号と実行結果は field 重複記録せず canonical 成果物関係から判別する（pr_desc.md）", () => {
    // REQ-048-001 の導出可能値の重複所有排除。PR 番号は PR 自身の API 番号、
    // 実行結果（result 契約の4状態）は PR の存在（completed-pr）と Issue コメント
    // SSoT（blocked、failed、delegation-unavailable）から判別する。
    const content = readTemplate("pr_desc.md");
    const keys = extractExecutionIdent(content);
    expect(keys.has("adf_pr")).toBe(false);
    expect(keys.has("adf_result")).toBe(false);
    expect(content.includes("Refs: #$ISSUE_NUMBER")).toBe(true);
  });

  it("PR テンプレートの adf_delegation は委譲 prompt からの転記を規定する（pr_desc.md）", () => {
    const line = readTemplate("pr_desc.md")
      .split(/\r?\n/)
      .find((l) => l.startsWith("- adf_delegation:"));
    expect(line).toBeDefined();
    expect(line!.includes("DEL-{N}-{seq}")).toBe(true);
    expect(line!.includes("転記")).toBe(true);
  });
});

describe("REQ-048-003/004: harness 側識別子と OpenCode 内部履歴の非必須化", () => {
  for (const file of PR_TEMPLATES) {
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
      expect(line!.includes("任意") || line!.includes("N/A")).toBe(true);
    });
  }
});

describe("REQ-048-004/005: 識別情報欠落時の N/A 記録と非停止", () => {
  for (const file of PR_TEMPLATES) {
    it(`${file}: 欠落時 N/A 記録と停止しない旨をセクション規約に含む`, () => {
      const content = readTemplate(file);
      const idx = content.indexOf("## 実行識別情報");
      const sectionComment = content.slice(idx, idx + 900);
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
  });

  it("委譲単位識別子は DEL-{N}-{seq} 形式を規定する", () => {
    const content = fs.readFileSync(harnessDelegationPath, "utf-8");
    expect(content.includes("DEL-{N}-{seq}")).toBe(true);
  });

  it("委譲ブロックは親子実行関係と委譲目的の重複 key を持たず導出規定を持つ", () => {
    // REQ-048-001 の導出可能値の重複所有排除。親子実行関係は委譲単位識別子と
    // 構造化文脈から導出し、委譲目的は実行 command 指定と category（処理区分）で
    // 表現する。同値 key（adf_child）と導出可能 key（adf_parent）は統合・除去済み。
    const content = fs.readFileSync(harnessDelegationPath, "utf-8");
    expect(content.includes("- adf_parent:")).toBe(false);
    expect(content.includes("- adf_child:")).toBe(false);
    expect(content.includes("- adf_delegation_purpose:")).toBe(false);
    const derivationLine = content
      .split(/\r?\n/)
      .find((l) => l.includes("親子実行関係") && l.includes("導出"));
    expect(derivationLine).toBeDefined();
  });
});

describe("REQ-048-016: 実行識別情報の記録基盤と Design 現行宣言", () => {
  const templatesDesignPath = path.join(
    REPO_ROOT,
    "docs",
    "designs",
    "skills",
    "agentdev-workflow-templates.md",
  );

  it("agentdev-workflow-templates Design は Issue 本文からの実行識別情報セクション廃止を宣言する", () => {
    // 識別情報の相関は canonical 成果物関係から再構成し、本文へ一覧化しない（REQ-048-001）。
    // Design の現行宣言がこの運用を宣言していることを機械検査し、
    // Issue 本文への逆導入を Design 宣言の変更から始められる状態を固定する。
    const design = fs.readFileSync(templatesDesignPath, "utf-8");
    expect(
      design.includes("## 実行識別情報・検証差分のテンプレートセクション形式"),
    ).toBe(true);
    expect(
      design.includes("実行識別情報を独立した Issue 本文物項目として生成しない"),
    ).toBe(true);
    expect(design.includes("本文へ一覧化しない")).toBe(true);
  });
});
