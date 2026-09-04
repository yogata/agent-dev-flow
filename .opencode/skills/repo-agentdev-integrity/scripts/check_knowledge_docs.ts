// ADF-COVERS(implementation): REQ-056-010, REQ-056-011
/**
 * check_knowledge_docs.ts — docs/knowledge/ 構造検査 checker (REQ-056-010/011).
 *
 * docs/knowledge/ 配下のプロジェクト知識文書について、次の4点を機械検査する
 * （REQ-056-010「docs/knowledge/ の正規配置、命名、必須内容を機械検査できること。
 * 検査範囲は本体 5 項目に加え frontmatter（title / created / updated）を含むこと」）:
 *
 *   1. non-regular-placement: docs/knowledge/ 配下は知識文書（1知識1 Markdown ファイル、
 *      REQ-056-001）と領域案内 README.md のみを配置する。サブディレクトリと
 *      非 Markdown ファイルは違反
 *   2. invalid-slug: ファイル名は kebab-case の slug（REQ-056-001、patterns Design
 *      「Knowledge frontmatter 規約」）。README.md は領域案内のため命名検査の対象外
 *   3. missing-frontmatter / invalid-frontmatter: frontmatter（title / created / updated、
 *      patterns Design「Knowledge frontmatter 規約」）を検査する。ブロック欠落（missing）、
 *      必須フィールド欠落、ISO 8601 日付（YYYY-MM-DD）形式不備、updated が created 以降でない
 *      ことを検出する（invalid）
 *   4. missing-required-section: 本体は知識内容、適用条件、適用対象、根拠、関連知識の
 *      5項目を見出しとして備える（REQ-056-003、patterns Design「Knowledge frontmatter 規約」）
 *
 * REQ-056-011（知識文書の意味的妥当性を機械検査で確定させない）に従い、本 checker は
 * 構造面（配置、ファイル名、必須見出しの存在）のみを検査する。セクション本文の内容品質、
 * 内容とセクション名の意味一致は検査対象に含まない（見出しが存在すれば本文が空でも合格）。
 *
 * 参考 REQ:    docs/requirements/REQ-056.md（REQ-056-001/003/010/011）
 * 参考 Design: docs/designs/foundations/patterns.md「Knowledge frontmatter 規約」
 * 参考 領域:   docs/knowledge/README.md（配置規約の案内）
 *
 * 使用資産: `cli_utils.ts`（共通 CLI 契約）。
 * require/import 混在許容（AG-001、既存資産踏襲）。
 */
import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  findRepoRoot,
  parseArgs,
} from "./cli_utils.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "check_knowledge_docs.ts";
const DESCRIPTION =
  "docs/knowledge/ structure gate — regular placement, kebab-case slug naming, frontmatter (title / created / updated), and required 5 sections (REQ-056-010/011)";
const USAGE =
  "bun run check_knowledge_docs.ts [--help] [--json] [--dry-run] [--root <path>]";

// ─── 検査対象定義 ─────────────────────────────────────────────────────────

/** 本体必須5項目（REQ-056-003）。見出しテキストとの trim 後完全一致で判定する。 */
export const REQUIRED_SECTIONS: readonly string[] = [
  "知識内容",
  "適用条件",
  "適用対象",
  "根拠",
  "関連知識",
];

/** 領域案内ファイル名。知識文書ではないため命名・必須セクション検査の対象外。 */
export const AREA_README_FILENAME = "README.md";

/** kebab-case slug（REQ-056-001）。小英字・数字をハイフンで連結する。 */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 知識文書の配置領域（repo root 相対）。 */
export const KNOWLEDGE_DIR = "docs/knowledge";

/** ISO 8601 日付（YYYY-MM-DD）形式（patterns Design「Knowledge frontmatter 規約」）。 */
export const FRONTMATTER_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** frontmatter 必須フィールド（REQ-056-010、patterns Design「Knowledge frontmatter 規約」）。 */
export const REQUIRED_FRONTMATTER_FIELDS: readonly string[] = [
  "title",
  "created",
  "updated",
];

// ─── 出力契約 ─────────────────────────────────────────────────────────────

export type KnowledgeFindingKind =
  | "non-regular-placement"
  | "invalid-slug"
  | "missing-frontmatter"
  | "invalid-frontmatter"
  | "missing-required-section";

export interface KnowledgeFinding {
  /** repo root 相対パス（ディレクトリ違反時はディレクトリパス）。 */
  file: string;
  /** 違反種別。 */
  kind: KnowledgeFindingKind;
  /** 種別判定根拠（人間が読める形式）。 */
  detail: string;
}

export interface KnowledgeReport {
  /** スクリプト実行の ISO timestamp。 */
  timestamp: string;
  /** スクリプト名。 */
  script: string;
  /** スキャン対象領域の存在。false の場合は領域未設置（違反としない）。 */
  area_present: boolean;
  /** スキャンしたファイル数（README.md を含む）。 */
  files_scanned: number;
  /** 検出した構造違反の件数。 */
  findings_count: number;
  /** 構造違反の内訳。 */
  findings: KnowledgeFinding[];
}

// ─── 検査ロジック ─────────────────────────────────────────────────────────

/** Markdown 見出し行（`#`〜`######`）のテキスト部分を trim して返す。非見出し行は無視。 */
export function extractHeadings(content: string): string[] {
  const headings: string[] = [];
  for (const line of content.split(/\r?\n/)) {
    const m = /^#{1,6}\s+(.+)$/.exec(line);
    if (m) headings.push(m[1].trim());
  }
  return headings;
}

/** 本文が必須5項目の見出しを備えるか検査し、欠落している項目名の配列を返す（REQ-056-003）。 */
export function findMissingSections(content: string): string[] {
  const headings = new Set(extractHeadings(content));
  return REQUIRED_SECTIONS.filter((s) => !headings.has(s));
}

/** slug（拡張子を除いた stem）が kebab-case か判定する（REQ-056-001）。 */
export function isKebabCaseSlug(stem: string): boolean {
  return SLUG_PATTERN.test(stem);
}

/**
 * ISO 8601 日付（YYYY-MM-DD）として妥当か判定する。
 * Date.parse は存在しない日付（例: 2026-02-30）を繰り越し解釈するため、
 * 月末日数によるカレンダー妥当性を自前で検証する。
 */
export function isValidIsoDate(value: string): boolean {
  if (!FRONTMATTER_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

/** frontmatter ブロック（先頭 `---` 行〜次の `---` 行）の内部行配列を返す。ブロック欠落時は null。 */
export function extractFrontmatterLines(content: string): string[] | null {
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === "---") return lines.slice(1, i);
  }
  return null;
}

export interface FrontmatterViolation {
  kind: "missing-frontmatter" | "invalid-frontmatter";
  problem: string;
}

/**
 * frontmatter 検査（REQ-056-010、patterns Design「Knowledge frontmatter 規約」）。
 * 構造面のみを検査し、問題ごとに1要素を返す:
 *   - ブロック欠落（missing-frontmatter）: 先頭 `---` 〜 閉じ `---` が存在しない
 *   - 必須フィールド（title / created / updated）の欠落・空値（invalid-frontmatter）
 *   - created / updated の ISO 8601 日付（YYYY-MM-DD）形式不備（invalid-frontmatter）
 *   - updated が created 以降でない（invalid-frontmatter）
 */
export function findFrontmatterViolations(content: string): FrontmatterViolation[] {
  const lines = extractFrontmatterLines(content);
  if (lines === null) {
    return [
      {
        kind: "missing-frontmatter",
        problem:
          "frontmatter ブロック（先頭 --- 〜 閉じ ---）が存在しない。" +
          `title / created / updated を --- で挟んで記述する`,
      },
    ];
  }
  const fields = new Map<string, string>();
  for (const line of lines) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (m && !fields.has(m[1])) fields.set(m[1], m[2].trim());
  }
  const violations: FrontmatterViolation[] = [];
  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    const value = fields.get(field);
    if (value === undefined || value === "") {
      violations.push({
        kind: "invalid-frontmatter",
        problem: `必須 frontmatter フィールド「${field}」が存在しないまたは空`,
      });
    }
  }
  const created = fields.get("created");
  const updated = fields.get("updated");
  for (const [name, value] of [
    ["created", created],
    ["updated", updated],
  ] as const) {
    if (value === undefined || value === "") continue;
    if (!isValidIsoDate(value)) {
      violations.push({
        kind: "invalid-frontmatter",
        problem: `frontmatter フィールド「${name}」は ISO 8601 日付（YYYY-MM-DD）とする`,
      });
    }
  }
  if (
    created !== undefined &&
    updated !== undefined &&
    isValidIsoDate(created) &&
    isValidIsoDate(updated) &&
    updated < created
  ) {
    violations.push({
      kind: "invalid-frontmatter",
      problem: "frontmatter フィールド「updated」は「created」以降の日付とする",
    });
  }
  return violations;
}

interface KnowledgeEntry {
  /** repo root 相対パス。 */
  relPath: string;
  /** 絶対パス。 */
  absPath: string;
  isDirectory: boolean;
  fileName: string;
}

/**
 * docs/knowledge/ 直下のエントリを列挙する。
 * サブディレクトリは違反検出対象であり、その内部は走査しない
 * （1知識1 Markdown ファイル、REQ-056-001 のため領域はフラットである）。
 */
function listKnowledgeEntries(root: string): { entries: KnowledgeEntry[]; areaPresent: boolean } {
  const areaAbs = path.join(root, "docs", "knowledge");
  if (!fs.existsSync(areaAbs)) {
    return { entries: [], areaPresent: false };
  }
  const dirents = fs.readdirSync(areaAbs, { withFileTypes: true }) as fs.Dirent[];
  const entries = dirents
    .map((d) => ({
      relPath: `${KNOWLEDGE_DIR}/${d.name}`,
      absPath: path.join(areaAbs, d.name),
      isDirectory: d.isDirectory(),
      fileName: d.name,
    }))
    .sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));
  return { entries, areaPresent: true };
}

/**
 * docs/knowledge/ 配下の構造検査（REQ-056-010/011）。
 * 検査は構造面（配置、kebab-case 命名、必須5項目見出しの存在）に限定し、
 * 意味的妥当性は判定しない（REQ-056-011）。
 * 領域（docs/knowledge/）が存在しない場合は違反としない（領域未設置は検査対象外）。
 */
export function scanKnowledgeDocs(root: string): {
  findings: KnowledgeFinding[];
  filesScanned: number;
  areaPresent: boolean;
} {
  const findings: KnowledgeFinding[] = [];
  const { entries, areaPresent } = listKnowledgeEntries(root);

  for (const entry of entries) {
    if (entry.isDirectory) {
      findings.push({
        file: entry.relPath,
        kind: "non-regular-placement",
        detail:
          `サブディレクトリは配置できない（1知識1 Markdown ファイル、REQ-056-001）。` +
          `docs/knowledge/ 配下はフラットに配置する`,
      });
      continue;
    }
    if (entry.fileName === AREA_README_FILENAME) {
      // 領域案内 README は知識文書ではないため命名・必須セクション検査の対象外。
      continue;
    }
    if (!entry.fileName.endsWith(".md")) {
      findings.push({
        file: entry.relPath,
        kind: "non-regular-placement",
        detail: `知識文書は Markdown ファイルのみ配置できる（REQ-056-001）`,
      });
      continue;
    }
    const stem = entry.fileName.slice(0, -".md".length);
    if (!isKebabCaseSlug(stem)) {
      findings.push({
        file: entry.relPath,
        kind: "invalid-slug",
        detail: `ファイル名は kebab-case の slug とする（REQ-056-001）。期待形式: /^[a-z0-9]+(-[a-z0-9]+)*\\.md$/`,
      });
      continue;
    }
    const content = fs.readFileSync(entry.absPath, "utf-8") as string;
    for (const v of findFrontmatterViolations(content)) {
      findings.push({
        file: entry.relPath,
        kind: v.kind,
        detail: `${v.problem}（REQ-056-010、patterns Design「Knowledge frontmatter 規約」）`,
      });
    }
    const missing = findMissingSections(content);
    for (const section of missing) {
      findings.push({
        file: entry.relPath,
        kind: "missing-required-section",
        detail: `必須セクション「${section}」の見出しが存在しない（REQ-056-003）`,
      });
    }
  }

  return {
    findings,
    filesScanned: entries.length,
    areaPresent,
  };
}

// ─── 出力 formatter ──────────────────────────────────────────────────────

function formatJson(report: KnowledgeReport): string {
  return JSON.stringify(report, null, 2);
}

function formatText(report: KnowledgeReport): string {
  const lines: string[] = [];
  lines.push(`# ${SCRIPT_NAME} Report`);
  lines.push("");
  lines.push(`- 実行日時: ${report.timestamp}`);
  lines.push(`- スクリプト: ${report.script}`);
  lines.push(`- 領域 (${KNOWLEDGE_DIR}/): ${report.area_present ? "存在" : "未設置"}`);
  lines.push(`- スキャンファイル数: ${report.files_scanned}`);
  lines.push(`- 検出構造違反: ${report.findings_count} 件`);
  lines.push("");

  if (report.findings.length > 0) {
    lines.push("## 詳細");
    lines.push("");
    const kindLabel: Record<KnowledgeFindingKind, string> = {
      "non-regular-placement": "正規配置違反",
      "invalid-slug": "命名違反",
      "missing-frontmatter": "frontmatter 欠落",
      "invalid-frontmatter": "frontmatter 不備",
      "missing-required-section": "必須セクション欠落",
    };
    for (const f of report.findings) {
      lines.push(`### [${kindLabel[f.kind]}] ${f.file}`);
      lines.push(`- 詳細: ${f.detail}`);
      lines.push("");
    }
  } else {
    lines.push("docs/knowledge/ 配下の構造違反は検出されませんでした。");
    lines.push("");
  }

  return lines.join("\n");
}

// ─── main ────────────────────────────────────────────────────────────────

interface Options {
  help: boolean;
  json: boolean;
  dryRun: boolean;
  root?: string;
}

function parseCliArgs(args: string[]): Options {
  // cli_utils.parseArgs（node:util.parseArgs 委譲、REQ-044-001）を利用する。
  const parsed = parseArgs(args);
  return {
    help: parsed.help,
    json: parsed.json,
    dryRun: parsed.dryRun,
    root: parsed.root,
  };
}

function main(): void {
  let options: Options;
  try {
    options = parseCliArgs(process.argv.slice(2));
  } catch (e) {
    console.error(
      `[${SCRIPT_NAME}] ${e instanceof Error ? e.message : String(e)}`,
    );
    process.exit(EXIT_ERROR);
  }

  if (options.help) {
    const helpText = `${SCRIPT_NAME} ― ${DESCRIPTION}

USAGE:
  ${USAGE}

OPTIONS:
  --help            Show this help message
  --json            Output results in JSON format
  --dry-run         List scan target area without running checks
  --root <path>     Explicit repository root (worktree/CI support)

EXIT CODES:
  0  No structure violations found
  1  Structure violations detected (placement / slug / frontmatter / required sections)
  2  Input error or execution failure

CHECKS (REQ-056-010, structure only — REQ-056-011):
  non-regular-placement   Subdirectories and non-Markdown files under docs/knowledge/
  invalid-slug            Filenames that are not kebab-case slugs (README.md exempt)
  missing-frontmatter     Knowledge docs without a frontmatter block (leading --- ... closing ---)
  invalid-frontmatter     Missing/empty title, created, updated; non ISO 8601 date
                          (YYYY-MM-DD); updated earlier than created
  missing-required-section  Knowledge docs missing any of the required 5 section headings:
                          ${REQUIRED_SECTIONS.join(", ")}

RELATED:
  - REQ: docs/requirements/REQ-056.md (REQ-056-001/003/010/011)
  - Design: docs/designs/foundations/patterns.md "Knowledge frontmatter 規約"
  - Area: docs/knowledge/README.md
  - docs-check: /repo/docs-check (Step 1)
`;
    console.log(helpText);
    process.exit(EXIT_OK);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: options.root });

  if (options.dryRun) {
    const { entries, areaPresent } = listKnowledgeEntries(root);
    console.log(
      `[${SCRIPT_NAME}] dry-run: docs/knowledge/ ${areaPresent ? "present" : "absent"}, ${entries.length} entries`,
    );
    for (const e of entries) {
      console.log(`  ${e.relPath}${e.isDirectory ? "/" : ""}`);
    }
    process.exit(EXIT_OK);
  }

  const { findings, filesScanned, areaPresent } = scanKnowledgeDocs(root);

  const report: KnowledgeReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    area_present: areaPresent,
    files_scanned: filesScanned,
    findings_count: findings.length,
    findings,
  };

  if (options.json) {
    console.log(formatJson(report));
  } else {
    console.log(formatText(report));
  }

  process.exit(findings.length > 0 ? EXIT_NG : EXIT_OK);
}

if (import.meta.main) {
  main();
}
