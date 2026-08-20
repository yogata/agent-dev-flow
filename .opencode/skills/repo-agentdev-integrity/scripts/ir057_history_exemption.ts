/**
 * ir057_history_exemption.ts — IR-057 文書レベル履歴注記 exemption（Issue #1768）
 *
 * IR-057 Design「例外登録（現行ADRの履歴記載）」セクション（docs/designs/integrity/
 * rules/IR-057-obsolete-spec-path-after-domain-split.md）に基づく免除判定の
 * 純粋関数群。targeted guard（check_changed_docs.ts）と full audit
 * （check_integrity.ts）で同じ例外規則を使用する（REQ-0144-024）。
 *
 * 本モジュールは2層の免除判定を提供する:
 *   1. パス単位免除 `isIr057PathExempt` — exemption 表に基づくファイル単位の免除。
 *      旧Design直下パス検出と legacy vocabulary 検出の両方で共通使用する。
 *   2. コンテンツ単位免除 `isFileLevelHistoryExempt` / `isIr057LineExempt` —
 *      ADR 文書レベル履歴注記、行レベル履歴マーカーによる免除。
 *
 * 依存: なし（純粋関数のみ）。fs, path への依存を持たない。
 */

/**
 * ADR ファイルパス判定。`docs/adr/ADR-*.md` 形式（retired 配下を除く）。
 */
export function isAdrFile(relPath: string): boolean {
  if (relPath.startsWith("docs/adr/retired/")) return false;
  return /^docs\/adr\/ADR-\d+.*\.md$/.test(relPath);
}

/**
 * frontmatter から指定キーの値を抽出する。
 * frontmatter がない、またはキーが存在しない場合は null を返す。
 *
 * frontmatter 形式:
 *   ---
 *   key1: value1
 *   key2: "value2"
 *   ---
 */
export function extractFrontmatterValue(
  content: string,
  key: string,
): string | null {
  const lines = content.split("\n");
  if (lines.length === 0 || lines[0].trim() !== "---") return null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") break;
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    if (k === key) {
      return line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

/**
 * frontmatter 終了直後から最初の見出し（`#` 〜 `######`）までの本文を抽出する。
 * frontmatter がない場合はファイル先頭から。本文がない（最初の行が見出し）場合は空文字。
 */
export function extractBodyBeforeFirstHeading(content: string): string {
  const lines = content.split("\n");
  let start = 0;
  if (lines.length > 0 && lines[0].trim() === "---") {
    let i = 1;
    for (; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        start = i + 1;
        break;
      }
    }
    if (start === 0) return ""; // frontmatter 閉じなし
  }
  const body: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n").trim();
}

/**
 * 文書レベル履歴注記の条件1: frontmatter 終了直後から最初の見出しまでの本文が存在するか。
 * 空でないテキストがある場合に true。
 *
 * IR-057 ルール「例外登録」第一条件: frontmatter 終了直後から最初の見出し（`#` または
 * `##`）までの本文が存在すること。当該本文は文書レベル履歴注記として扱い、文書全体が
 * 歴史経緯の記録であるとみなす。
 */
export function hasDocumentLevelHistoryNoteBody(content: string): boolean {
  return extractBodyBeforeFirstHeading(content).length > 0;
}

// 文書レベル履歴注記ブロックとして認識する定型フレーズ。
// IR-057 ルール「例外登録」第二条件が例示する表現に加え、ADR-0131 で使用中の表現を含む。
const HISTORY_BLOCKQUOTE_PHRASES = [
  "本文書は歴史的経緯を記録する",
  "本 ADR は移行履歴を保持する",
  "本ADRは移行履歴を保持する",
  "歴史文書である",
  "旧語彙の引用について",
  "歴史的経緯を記録する",
  "移行履歴を保持する",
  "歴史的経緯を記録する歴史文書",
];

/**
 * 文書レベル履歴注記の条件2: 明示的な引用ブロック（`>` 起点行）による履歴注記が存在するか。
 *
 * IR-057 ルール「例外登録」第二条件: `> 本文書は歴史的経緯を記録する`、
 * `> 本 ADR は移行履歴を保持する` 等の引用ブロック形式で、文書全体が歴史経緯の
 * 記録であることを示す注記を認識する。
 */
export function hasExplicitHistoryBlockQuote(content: string): boolean {
  const lines = content.split("\n");
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed.startsWith(">")) continue;
    if (HISTORY_BLOCKQUOTE_PHRASES.some((p) => trimmed.includes(p))) {
      return true;
    }
  }
  return false;
}

/**
 * ADR ファイルが文書レベル履歴注記条件を満たすか（ファイル全体が歴史経緯の記録であるか）。
 *
 * IR-057 ルール「例外登録」: frontmatter `status` が `accepted` または `superseded`
 * であり、かつ次のいずれかの文書レベル履歴注記条件を満たす ADR ファイルである。
 *   - 条件1: frontmatter 終了直後から最初の見出しまでの本文が存在
 *   - 条件2: 明示的な `>` 引用ブロック形式の履歴注記が存在
 *
 * 満たす場合、検出行への履歴マーカー付与を要求せず免除する。
 */
export function isAdrWithDocumentLevelHistoryNote(content: string): boolean {
  const status = extractFrontmatterValue(content, "status");
  if (status !== "accepted" && status !== "superseded") return false;
  return (
    hasDocumentLevelHistoryNoteBody(content) ||
    hasExplicitHistoryBlockQuote(content)
  );
}

// IR-057 ルール「例外登録」セクションが列挙する行レベル marker（「廃止」以外は単独で歴史扱い）。
const PRIMARY_LINE_MARKERS = [
  "旧",
  "移行前",
  "前提",
  "historical",
  "legacy",
  "deprecated",
];

// 周辺文脈判定で補助的に使用する歴史経緯語彙。IR-057 ルールは「固定の語彙リストのみに依存せず、
// 文書レベル注記、行レベル marker、周辺文脈で行う」と宣言するため、補助語彙を保持する。
const CONTEXTUAL_LINE_MARKERS = [
  "移行後",
  "時代",
  "履歴",
  "歴史",
  "経緯",
  "過去",
  "以前",
  "従来",
];

/**
 * 行が履歴経緯マーカーを含むか（文書レベル注記を満たさない ADR ファイル向け）。
 *
 * IR-057 ルール「例外登録」: 文書レベル履歴注記条件を満たさない ADR ファイルは、
 * 検出行が履歴マーカー（`旧`、`移行前`、`廃止`、`前提`、`historical`、`legacy`、
 * `deprecated`）を含む場合のみ免除する。現行機能の記述は検出対象とする。
 *
 * 「廃止」は時制判定する: 過去形・完了形（廃止された/済み/確定）は歴史、
 * 能望形（廃止する）は現行。
 */
export function hasLineLevelHistoryMarker(line: string): boolean {
  if (PRIMARY_LINE_MARKERS.some((m) => line.includes(m))) return true;
  if (/廃止(された|済み|確定|済)/.test(line)) return true;
  if (CONTEXTUAL_LINE_MARKERS.some((m) => line.includes(m))) return true;
  return false;
}

/**
 * ファイル全体が歴史経緯の記録であるか（ファイル単位免除）。
 *
 * targeted guard（check_changed_docs.ts）と full audit（check_integrity.ts）で
 * 共通使用する。IR-057 ルール「例外登録（現行ADRの履歴記載）」セクション準拠。
 *
 * ADR ファイル（`docs/adr/ADR-*.md`、retired 配下を除く）について文書レベル履歴注記
 * 条件を判定する。条件は frontmatter `status` が `accepted` または `superseded` であり、
 * かつ次のいずれかを満たすこと。
 *   - 条件1: frontmatter 終了直後から最初の見出しまでの本文が存在
 *   - 条件2: 明示的な `>` 引用ブロック形式の履歴注記が存在
 *
 * これらを満たす ADR ファイルは検出行への履歴マーカー付与を要求せず免除する。
 * ADR 以外のファイルは本関数では免除しない（行レベル marker を別途適用）。
 */
export function isFileLevelHistoryExempt(
  relPath: string,
  content: string,
): boolean {
  if (!isAdrFile(relPath)) return false;
  return isAdrWithDocumentLevelHistoryNote(content);
}

/**
 * IR-057 の行単位・ファイル単位 exemption を統合判定する。
 * targeted guard と full audit で同じ例外規則を使用する（REQ-0144-024）。
 *
 * `relPath`: repo-relative path（`docs/adr/ADR-0131.md` 形式）
 * `content`: ファイル全体の内容。ファイル単位免除判定に使用
 * `line`: 検出対象行のテキスト。行レベル marker 判定に使用
 */
export function isIr057LineExempt(
  relPath: string,
  content: string,
  line: string,
): boolean {
  if (isFileLevelHistoryExempt(relPath, content)) return true;
  return hasLineLevelHistoryMarker(line);
}

// ===== パス単位免除（IR-057 exemption 表、REQ-0144-024）=====
//
// Design docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md
// 「exemption（検出対象外）」セクションが列挙するファイルを免除する。
// targeted guard（check_changed_docs.ts）と full audit（check_integrity.ts）で
// 同一の免除集合を使用し、検出器間の判定乖離を防ぐ。

// IR-046 / IR-048 / IR-057 ルールファイル。exemption 表が「IR-046、IR-048
// ルールファイル」「IR-057 ルール説明としての旧パス例」として列挙する。
// ワイルドカードではなく正確なファイル名で列挙し、near-name が免除されないことを保証する。
const IR_057_EXEMPT_RULE_FILES: ReadonlySet<string> = new Set([
  "docs/designs/integrity/rules/IR-046-consumer-generated-repo-type-fp-prevention.md",
  "docs/designs/integrity/rules/IR-048-generated-by-identifier-integrity.md",
  "docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md",
]);

// exemption 表が正規の参照文書として列挙する repo-relative exact paths。
const IR_057_EXEMPT_EXACT_PATHS: ReadonlySet<string> = new Set([
  ".opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml",
  "docs/designs/integrity/integrity-rule-catalog.md",
  "docs/designs/integrity/rule-ownership.md",
  "docs/requirements/REQ-009.md",
  "docs/designs/local/runtime-package-boundary.md",
  "docs/guides/glossary.md",
  ".opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts",
]);

// 検査スクリプトの skill ドキュメント・参照資料。
// vocabulary-registry.md は exemption 表が明示する。SKILL.md および references/
// は検出ルールの説明・語彙対照表を含む正当な参照文書。
const IR_057_EXEMPT_DETECTOR_DOCS = /^\.opencode\/skills\/repo-agentdev-integrity\/(SKILL\.md|references\/[^/]+\.md)$/;

/**
 * IR-057 exemption 表に基づくパス単位免除判定（REQ-0144-024）。
 *
 * `relPath`: repo-relative path。Windows 区切り (`\`) は正規化して受け取る。
 *
 * 以下を免除する（exemption 表に基づく）:
 *   - `docs/requirements/retired/`, `docs/adr/retired/` 配下（履歴参照領域）
 *   - テスト fixture（`*.test.ts`）
 *   - `IR_057_EXEMPT_EXACT_PATHS` に列挙された正規参照文書
 *   - `IR_057_EXEMPT_RULE_FILES` に列挙された IR-046/048/057 ルールファイル（正確名）
 *   - `vocabulary-registry.md`（正規語彙対照表）
 *   - 検査スクリプト skill ドキュメント・参照資料（SKILL.md, references/*.md）
 *
 * これら以外は免除しない。削除済みの旧 local 生成 SPEC と旧 REQ は、
 * exemption 表に存在しないため免除対象外。
 */
export function isIr057PathExempt(relPath: string): boolean {
  const p = relPath.replace(/\\/g, "/");
  // 履歴参照領域（retired 配下）
  if (p.startsWith("docs/requirements/retired/")) return true;
  if (p.startsWith("docs/adr/retired/")) return true;
  // テスト fixture
  if (p.endsWith(".test.ts")) return true;
  // SPEC 列挙の exact path
  if (IR_057_EXEMPT_EXACT_PATHS.has(p)) return true;
  // IR-046 / IR-048 / IR-057 ルールファイル（正確名、ワイルドカードなし）
  if (IR_057_EXEMPT_RULE_FILES.has(p)) return true;
  // vocabulary-registry.md（正規語彙対照表）
  if (p.endsWith("/vocabulary-registry.md")) return true;
  // 検査スクリプト skill ドキュメント・参照資料
  if (IR_057_EXEMPT_DETECTOR_DOCS.test(p)) return true;
  return false;
}
