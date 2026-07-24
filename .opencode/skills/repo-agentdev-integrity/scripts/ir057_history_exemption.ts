/**
 * ir057_history_exemption.ts — IR-057 文書レベル履歴注記 exemption（Issue #1768）
 *
 * IR-057 SPEC「例外登録（現行ADRの履歴記載）」セクション（docs/specs/integrity/
 * rules/IR-057-obsolete-spec-path-after-domain-split.md）に基づく免除判定の
 * 純粋関数群。targeted guard（check_changed_docs.ts）と full audit
 * （check_integrity.ts）で同じ例外規則を使用する（REQ-0144-024）。
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
 * SPEC IR-057「例外登録」第一条件: frontmatter 終了直後から最初の見出し（`#` または
 * `##`）までの本文が存在すること。当該本文は文書レベル履歴注記として扱い、文書全体が
 * 歴史経緯の記録であるとみなす。
 */
export function hasDocumentLevelHistoryNoteBody(content: string): boolean {
  return extractBodyBeforeFirstHeading(content).length > 0;
}

// 文書レベル履歴注記ブロックとして認識する定型フレーズ。
// SPEC「例外登録」第二条件が例示する表現に加え、ADR-0131 で使用中の表現を含む。
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
 * SPEC IR-057「例外登録」第二条件: `> 本文書は歴史的経緯を記録する`、
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
 * SPEC IR-057「例外登録」: frontmatter `status` が `accepted` または `superseded`
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

// SPEC「例外登録」セクションが列挙する行レベル marker（「廃止」以外は単独で歴史扱い）。
const PRIMARY_LINE_MARKERS = [
  "旧",
  "移行前",
  "前提",
  "historical",
  "legacy",
  "deprecated",
];

// 周辺文脈判定で補助的に使用する歴史経緯語彙。SPEC は「固定の語彙リストのみに依存せず、
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
 * SPEC IR-057「例外登録」: 文書レベル履歴注記条件を満たさない ADR ファイルは、
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
 * 共通使用する。SPEC IR-057「例外登録（現行ADRの履歴記載）」セクション準拠。
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
