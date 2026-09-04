// ADF-COVERS(verification): REQ-048-001, REQ-048-002, REQ-048-003, REQ-048-004, REQ-048-008, REQ-048-016
// 検証差分セクション契約テスト（Issue #2403 Area4、Issue #2600 で新 REQ-048 の意図へ再構成）。
// PR テンプレートの検証差分セクションが検証種別・検証結果・finding 差分を機械的に判別できる構造を持ち、
// 工程行の比較（incremental finding value、REQ-048-008）と検証結果の相関判別（REQ-048-001、REQ-048-002）が
// 成立すること、harness 履歴を必須化しないこと（REQ-048-003、REQ-048-004）、
// 記録先は既存テンプレートと既存正規情報源に限ること（REQ-048-016）を検証する。
// finding 差分の分類集合・表形式は REQ-048-014 のとおり REQ-048 の成立条件としない。本テストは
// Design（agentdev-workflow-templates Design「実行識別情報・検証差分のテンプレートセクション形式」）が
// 現行ベースラインとして宣言する現行セットとの一致のみを検査し、REQ-048-012 の実験契約に従う変更を妨げない。
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

// finding 差分の分類集合は REQ-048-014 のとおり REQ-048 の成立条件として固定しない。
// 本定数は Design（agentdev-workflow-templates Design「実行識別情報・検証差分のテンプレートセクション形式」）
// が現行ベースラインとして宣言する現行セットであり、テンプレートと Design 宣言の一致検査に用いる。
// REQ-048-012 の実験契約に従う変更は、Design 宣言とテンプレートと本定数の同期更新で完結する。
// 撤回と無効は「撤回または無効となった finding」の内訳。
const FINDING_DIFF_CLASSES = [
  "新規",
  "修正済み",
  "既出",
  "撤回",
  "無効",
] as const;

// テンプレートディレクトリ直下の既存テンプレート構成。
// 検証差分の記録先として新規テンプレート種別を新設しないことを固定する（REQ-048-016）。
const KNOWN_TEMPLATE_FILES = [
  "issue_comment_bug_analysis.md",
  "issue_comment_bug_record.md",
  "issue_comment_feature_implementation.md",
  "issue_comment_feature_technical.md",
  "issue_comment_review_ng.md",
  "issue_comment_update.md",
  "issue_desc_bug.md",
  "issue_desc_child.md",
  "issue_desc_epic.md",
  "issue_desc_feature.md",
  "pr_desc.md",
] as const;

function readTemplate(file: string): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8");
}

function readSourceSkill(relPath: string): string {
  return fs.readFileSync(path.join(SOURCE_SKILLS_DIR, relPath), "utf-8");
}

/**
 * 検証差分セクション本文を抽出する。
 * セクション終端は次の `## ` 見出し行（行頭）とし、規約コメント内の `## ...` 言及では切断しない。
 */
export function extractDiffSection(content: string): string {
  const start = content.indexOf("## 検証差分");
  if (start === -1) return "";
  const rest = content.slice(start + 1);
  const nextHeading = rest.match(/^##\s/m);
  const end = nextHeading?.index !== undefined ? start + 1 + nextHeading.index : content.length;
  return content.slice(start, end);
}

/**
 * 検証差分セクション内の最初のテーブルヘッダー行を抽出する。
 * 機械的判別はセクション内のテーブル行のみを正とする。
 */
export function extractDiffTableHeader(content: string): string[] {
  const lines = content.split(/\r?\n/);
  let inSection = false;
  for (const line of lines) {
    if (/^##\s/.test(line)) {
      inSection = line.replace(/^##\s+/, "").trim() === "検証差分";
      continue;
    }
    if (!inSection) continue;
    if (/^\|/.test(line)) {
      return line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
    }
  }
  return [];
}

describe("REQ-048-001/002: 検証差分セクションの機械判別可能性と finding 比較", () => {
  const sectionHeading = "## 検証差分";
  const markerRe = /<!--\s*【必須】\s*-->/;
  const templatesDesignPath = path.join(
    REPO_ROOT,
    "docs",
    "designs",
    "skills",
    "agentdev-workflow-templates.md",
  );

  it("PR テンプレートは検証差分セクションを含む", () => {
    expect(readTemplate("pr_desc.md").includes(sectionHeading)).toBe(true);
  });

  it("検証差分セクションは【必須】マーカーを持つ", () => {
    const content = readTemplate("pr_desc.md");
    const idx = content.indexOf(sectionHeading);
    const after = content.slice(idx, idx + 200);
    expect(markerRe.test(after)).toBe(true);
  });

  it("テーブルヘッダーは Design 現行セット（実行工程・検証種別・検証結果・finding 差分分類）と一致する", () => {
    // 分類集合は REQ-048-014 のとおり成立条件として固定しない。FINDING_DIFF_CLASSES は
    // Design が現行ベースラインとして宣言する現行セットとの一致検査に用いる。
    const header = extractDiffTableHeader(readTemplate("pr_desc.md"));
    const expected = ["実行工程", "検証種別", "検証結果", ...FINDING_DIFF_CLASSES];
    expect(header).toEqual(expected);
  });

  it("agentdev-workflow-templates Design は検証差分の分類・表形式を現行ベースラインとして宣言する", () => {
    // 検証差分の具体分類・表形式の変更は REQ-048-012 の実験契約に従い、Design 宣言の更新から
    // 始められることを機械検査する（REQ-048-008、REQ-048-014 の成立条件非固定の運用担保）。
    const design = fs.readFileSync(templatesDesignPath, "utf-8");
    expect(
      design.includes("## 実行識別情報・検証差分のテンプレートセクション形式"),
    ).toBe(true);
    expect(design.includes("現行ベースライン")).toBe(true);
    expect(design.includes("固定しない")).toBe(true);
    expect(design.includes("REQ-048-012")).toBe(true);
  });

  it("セクション規約コメントは finding 差分分類と初回検証の全 finding 新規扱いを規定する", () => {
    const section = extractDiffSection(readTemplate("pr_desc.md"));
    for (const cls of FINDING_DIFF_CLASSES) {
      expect(section.includes(cls)).toBe(true);
    }
    expect(section.includes("初回検証")).toBe(true);
    expect(section.includes("新規として記録")).toBe(true);
  });
});

describe("REQ-048-008: 工程間比較の可能性", () => {
  it("セクション規約コメントは同種検証の複数工程実施時の行並びと工程間比較を規定する", () => {
    const section = extractDiffSection(readTemplate("pr_desc.md"));
    expect(section.includes("複数工程")).toBe(true);
    expect(section.includes("工程ごとに行を並べ")).toBe(true);
    expect(section.includes("工程間で読み比べ")).toBe(true);
  });

  it("templates スキルの工程間比較規則が case-run と case-close の記録先を定める", () => {
    const skill = readSourceSkill(
      path.join("agentdev-workflow-templates", "SKILL.md"),
    );
    expect(skill.includes("工程ごとに行を並べ")).toBe(true);
    expect(skill.includes("実行工程: case-run")).toBe(true);
    expect(skill.includes("実行工程: case-close")).toBe(true);
    expect(skill.includes("対応記録コメントへ本セクションと同一形式")).toBe(true);
  });
});

describe("REQ-048-016: 記録先は既存テンプレートと既存正規情報源のみ", () => {
  it("検証差分セクションを持つテンプレートは pr_desc.md のみ（新規テンプレート種別を新設しない）", () => {
    const files = fs
      .readdirSync(TEMPLATES_DIR)
      .filter((f) => f.endsWith(".md"))
      .sort();
    expect(files).toEqual([...KNOWN_TEMPLATE_FILES].sort());
    const withSection = files.filter((f) =>
      readTemplate(f).includes("## 検証差分"),
    );
    expect(withSection).toEqual(["pr_desc.md"]);
  });

  it("PR テンプレートは配布物内部 ID（REQ-XXXX 数字つき）を含まない", () => {
    expect(/REQ-\d/.test(readTemplate("pr_desc.md"))).toBe(false);
  });

  it("templates スキルは検証差分セクション規約と5分類定義を持つ", () => {
    const skill = readSourceSkill(
      path.join("agentdev-workflow-templates", "SKILL.md"),
    );
    expect(skill.includes("### 検証差分セクション")).toBe(true);
    expect(skill.includes("#### finding 差分の5分類")).toBe(true);
    for (const cls of FINDING_DIFF_CLASSES) {
      expect(skill.includes(cls)).toBe(true);
    }
  });
});

describe("REQ-048-016: Findings セクションとの共存（置換しない）", () => {
  it("PR テンプレートの Findings セクションと intake / learning 小見出しが残存する", () => {
    const content = readTemplate("pr_desc.md");
    expect(content.includes("## Findings/ Capture候補")).toBe(true);
    expect(content.includes("### intake")).toBe(true);
    expect(content.includes("### learning")).toBe(true);
  });

  it("検証差分セクションの規約コメントは Findings セクションへの記録分離を規定する", () => {
    const section = extractDiffSection(readTemplate("pr_desc.md"));
    expect(section.includes("共存、置換しない")).toBe(true);
    expect(section.includes("## Findings/ Capture候補` セクションへ記録")).toBe(true);
  });

  it("templates スキルは共存規則を正規所有する", () => {
    const skill = readSourceSkill(
      path.join("agentdev-workflow-templates", "SKILL.md"),
    );
    expect(
      skill.includes("Findings セクション（intake / learning 小見出し）を置換せず共存"),
    ).toBe(true);
  });
});

describe("REQ-048-008: 審議中 finding 状態と修正証跡の所有境界を変更しない", () => {
  it("templates スキルは対論型レビューの審議中 finding 状態と品質ゲート完了報告の修正証跡の所有境界非変更を明記する", () => {
    const skill = readSourceSkill(
      path.join("agentdev-workflow-templates", "SKILL.md"),
    );
    expect(skill.includes("審議中 finding 状態の追跡")).toBe(true);
    expect(skill.includes("欠陥類型単位の修正証跡")).toBe(true);
    expect(skill.includes("所有境界を変更しない")).toBe(true);
  });

  it("case-close の検証差分記録指示は品質ゲート完了報告の修正証跡を置換しない", () => {
    const ref = readSourceSkill(
      path.join(
        "agentdev-workflow-case-close",
        "references",
        "pr-merge-and-conflict.md",
      ),
    );
    expect(ref.includes("修正証跡記録を本記録で置換しない")).toBe(true);
  });

  it("対論型レビュースキルの審議中 finding 状態の所有箇所を変更しない（実行差分の対象外確認）", () => {
    const adversarial = readSourceSkill(
      path.join(
        "agentdev-adversarial-review",
        "references",
        "adversarial-review-protocol.md",
      ),
    );
    expect(
      adversarial.includes(
        "finding 状態は審議中の一時状態とし、新しい正規 artifact または永続 schema を導入しない",
      ),
    ).toBe(true);
  });
});

describe("REQ-048-008/016: 配布物への適用（case-run / case-close の検証記録指示）", () => {
  it("adapter スキルは PR 本文への検証差分セクション記録を指示する", () => {
    const skill = readSourceSkill(
      path.join("agentdev-case-run-execution-adapter", "SKILL.md"),
    );
    expect(skill.includes("検証差分セクション")).toBe(true);
    expect(skill.includes("新規、修正済み、既出、撤回、無効")).toBe(true);
    expect(skill.includes("検証差分セクション規約")).toBe(true);
  });

  it("adapter の委譲実装ノートは PR 作成時の検証差分セクション記録を指示する", () => {
    const ref = readSourceSkill(
      path.join(
        "agentdev-case-run-execution-adapter",
        "references",
        "harness-delegation.md",
      ),
    );
    expect(ref.includes("検証差分セクション")).toBe(true);
    expect(ref.includes("実行工程 case-run の行として記録")).toBe(true);
  });

  it("case-run の委譲 STEP は検証差分の記録指示を委譲 prompt へ含める", () => {
    const ref = readSourceSkill(
      path.join(
        "agentdev-workflow-case-run",
        "references",
        "delegation-and-result.md",
      ),
    );
    expect(ref.includes("**検証差分の記録指示**")).toBe(true);
    expect(ref.includes("5分類")).toBe(true);
  });

  it("case-close は対応記録コメントへの検証差分記録を case-run との差分で行う", () => {
    const ref = readSourceSkill(
      path.join(
        "agentdev-workflow-case-close",
        "references",
        "pr-merge-and-conflict.md",
      ),
    );
    expect(ref.includes("**対応記録コメントへの検証差分記録**")).toBe(true);
    expect(ref.includes("実行工程 case-close の行")).toBe(true);
    expect(ref.includes("新規、修正済み、既出、撤回、無効")).toBe(true);
  });
});
