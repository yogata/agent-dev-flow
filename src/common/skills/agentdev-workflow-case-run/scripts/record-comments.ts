// Case Issue 工程記録の取りまとめ実行経路向け決定的処理。
//
// 記録契機（停止、判断変更、検証証拠）と記録コメントの対応、種別別必須項目の
// 検証、Case Issue 本文の進行状況・結果セクションの構築と適用を提供する。
// 着手・引き渡し・再開を契機とするコメント生成は廃止した（workflows/
// issue-lifecycle-records Design「コメント種別と実装語彙」節）。表示用の
// 進行状態4値の写像も廃止し、進行状況は正規状態と開始・終了日時で表現する。
// 判定主体（case-close 等）が完了条件と証拠を照合する意味判断は本モジュール
// の対象外であり、本モジュールは呼び出し側が持つ事実・根拠の構造化と検査
// （決定的処理）のみを担う。Custom Tool `agentdev_gh` の操作契約は変更しない。

import { join } from "node:path";

// 記録契機（3種）。着手・引き渡し・再開は記録契機から削除した。
// 完了（completion）は検証のみで完了する Issue の証拠を記録する契機であり、
// 完了判定自体は case-close が完了条件と証拠の照合で行う（コメントへ転記しない）。
export const RECORD_KINDS = [
  "hold",
  "decision_change",
  "completion",
] as const;

export type RecordKind = (typeof RECORD_KINDS)[number];

// 記録種別の表示名。
export const RECORD_KIND_LABELS: Record<RecordKind, string> = {
  hold: "停止",
  decision_change: "判断変更",
  completion: "検証証拠",
};

// 記録コメントの基本項目。
export const RECORD_BASE_SECTIONS = [
  "記録種別",
  "対象工程",
  "事実・結果",
  "理由・根拠",
  "次の行動",
  "関連合意・成果物",
] as const;

// 種別別必須セクション。停止=再開条件、判断変更=撤回対象、
// 検証証拠=判定根拠（検証詳細は成果物を参照し重複記載しない）。
export const KIND_REQUIRED_SECTIONS: Record<RecordKind, readonly string[]> = {
  hold: ["再開条件"],
  decision_change: ["撤回対象"],
  completion: ["判定根拠"],
};

// 記録コメントテンプレート（agentdev-workflow-templates 配下の正本）。
const TEMPLATE_ROOT = join(
  import.meta.dir,
  "..",
  "..",
  "agentdev-workflow-templates",
  "templates",
);

export function recordTemplatePath(kind: RecordKind): string {
  return join(TEMPLATE_ROOT, `issue_comment_record_${kind}.md`);
}

// 本文から見出し（`## {heading}`）セクションの本文を抽出する。
// 見出し行は行頭一致、セクション本文は次の `## ` 見出し（または文書末尾）まで。
// frontmatter（`---` で始まる冒頭ブロック）は走査対象から除外する。
export function extractSectionBody(body: string, heading: string): string | null {
  const lines = stripFrontmatter(body).split("\n");
  const headingLine = `## ${heading}`;
  let inSection = false;
  const collected: string[] = [];
  for (const line of lines) {
    if (!inSection) {
      if (line === headingLine) {
        inSection = true;
      }
      continue;
    }
    if (line.startsWith("## ")) {
      break;
    }
    collected.push(line);
  }
  if (!inSection) {
    return null;
  }
  // 見出し直後の HTML コメント（必須/任意マーカーとその注記）を本文評価から除外する。
  const contentLines = collected.filter((line) => !line.trimStart().startsWith("<!--"));
  return contentLines.join("\n").replace(/^\n+/, "").replace(/\n+$/, "\n").trim();
}

function stripFrontmatter(body: string): string {
  if (!body.startsWith("---\n")) {
    return body;
  }
  const end = body.indexOf("\n---", 4);
  if (end < 0) {
    return body;
  }
  const after = body.indexOf("\n", end + 1);
  return after < 0 ? "" : body.slice(after + 1);
}

function isMissingContent(content: string | null): boolean {
  if (content === null || content.trim() === "") {
    return true;
  }
  const normalized = content.trim().replace(/\s+/g, "");
  return normalized === "該当なし";
}

export interface RecordCommentValidation {
  ok: boolean;
  violations: string[];
}

// 記録コメント本文を検証する。基本セクションの存在と、記録種別の一致、
// 種別別必須セクションの内容（空・「該当なし」は不備）を確認する。
// 基本セクションのうち「理由・根拠」「関連合意・成果物」は非該当時に省略できる。
export function validateRecordComment(kind: RecordKind, body: string): RecordCommentValidation {
  const violations: string[] = [];

  const kindLabel = RECORD_KIND_LABELS[kind];
  const kindContent = extractSectionBody(body, "記録種別");
  if (kindContent === null || kindContent.trim() !== kindLabel) {
    violations.push(`記録種別セクションに「${kindLabel}」が記録されていない`);
  }

  for (const section of ["対象工程", "事実・結果", "次の行動"] as const) {
    if (isMissingContent(extractSectionBody(body, section))) {
      violations.push(`基本項目「${section}」が空または「該当なし」`);
    }
  }

  for (const section of KIND_REQUIRED_SECTIONS[kind]) {
    if (isMissingContent(extractSectionBody(body, section))) {
      violations.push(`種別別必須項目「${section}」が空または「該当なし」`);
    }
  }

  if (kind === "completion" && isMissingContent(extractSectionBody(body, "判定根拠"))) {
    // 到達しない（KIND_REQUIRED_SECTIONS で網羅）が、完了=判定根拠の対応を明示的に保持する
    violations.push("完了の判定根拠が空または「該当なし」");
  }

  return { ok: violations.length === 0, violations };
}

// Case Issue 本文の進行状況セクションの正規状態値（Root Case）。
// 値域とトークンの正は v4-lifecycle-state-machine Design（ローカル版 case status
// rules/status.yaml と同一の7値トークン、終端 = closed）。blocked・failed は
// 子 Issue の状態として Epic 実行構成が所有するが、Root 自身の継続条件不足は
// Root 固有の blocked で表す（子状態の重複コピー禁止とは区別する）。
export type CanonicalCaseState =
  | "open"
  | "ready"
  | "running"
  | "blocked"
  | "review"
  | "closed"
  | "cancelled";

export interface ProgressSectionInput {
  /** Root Case（Standard Case / Epic Root）の正規状態。Child では指定しない（日時のみ）。 */
  canonicalState?: CanonicalCaseState;
  startDate: string;
  endDate: string;
}

// 進行状況日時欄の値様式。正は workflows/issue-lifecycle-records Design
// 「正規状態と日時」節（開始日時上書き禁止・終了日時設定条件・実作業時間
// 非保存の規律は変更しない）。実測値のみを記載する原則を維持した上で、
// 観測事実（ブランチ作成、初回 commit、PR 作成等の実測可能な時刻）に基づく
// 既知の上限・下限時刻の併記による境界表現を書式例外として受理する。
// 境界表現は観測事実のみで構成され、未観測時刻の推定値を実測値の位置へ
// 記載した値は受理しない。実測が確定した時点で実測値へ置換する。

export type ProgressDateKind = "measured" | "not-set" | "bounded";

export interface ProgressDateValidation {
  ok: boolean;
  kind: ProgressDateKind | null;
  violations: string[];
}

// 実測値の前置形式: `YYYY-MM-DD` で始まる日付（`2026-10-04 05:25 JST`、
// ISO 8601 の `2026-10-04T05:25:00+09:00` 等を含む）。
const MEASURED_PREFIX_RE = /^\d{4}-\d{2}-\d{2}/;
// 未観測時刻の境界表現。下限・上限の一方または両方を併記する。
const BOUNDED_RE = /^未観測（(?:下限: (.+?)(?:、上限: (.+))?|上限: (.+))）$/u;
// 推定語彙。観測事実のみで構成された境界表現・実測値には含まれない。
const ESTIMATION_HINT_RE = /推定|頃|あたり|およそ|約\d/;

function dateComponentOk(component: string | undefined): boolean {
  if (component === undefined) {
    return false;
  }
  const trimmed = component.trim();
  if (!MEASURED_PREFIX_RE.test(trimmed)) {
    return false;
  }
  return !ESTIMATION_HINT_RE.test(trimmed);
}

// 進行状況日時欄の1値（開始日時・終了日時のいずれか）を検証する。
// 受理する値域: 実測値（日付前置の時刻文字列）、`N/A`（未設定。終了日時の
// 未確定等）、境界表現（`未観測（下限: {時刻}、上限: {時刻}）` 形式。下限・
// 上限は観測事実に基づく実測時刻のみ。一方のみの片側併記も許容）。
// 推定語彙を含む値、様式不一致の自由文は拒否する（観測事実のない推定値を
// 実測値の位置へ記載させない）。
export function validateProgressDate(value: string): ProgressDateValidation {
  const trimmed = value.trim();
  if (trimmed === "N/A") {
    return { ok: true, kind: "not-set", violations: [] };
  }
  if (ESTIMATION_HINT_RE.test(trimmed)) {
    return {
      ok: false,
      kind: null,
      violations: [`推定語彙を含む値を実測値の位置へ記載している（未観測時刻は境界表現で記載する）: ${trimmed}`],
    };
  }
  const bounded = trimmed.match(BOUNDED_RE);
  if (bounded !== null) {
    const lower = bounded[1];
    const upper = bounded[2] ?? bounded[3];
    if (lower !== undefined && !dateComponentOk(lower)) {
      return { ok: false, kind: null, violations: [`境界表現の下限が実測時刻形式でない: ${lower}`] };
    }
    if (upper !== undefined && !dateComponentOk(upper)) {
      return { ok: false, kind: null, violations: [`境界表現の上限が実測時刻形式でない: ${upper}`] };
    }
    return { ok: true, kind: "bounded", violations: [] };
  }
  if (MEASURED_PREFIX_RE.test(trimmed)) {
    return { ok: true, kind: "measured", violations: [] };
  }
  return {
    ok: false,
    kind: null,
    violations: [`実測値・N/A・境界表現のいずれの様式でもない値: ${trimmed}`],
  };
}

export interface ProgressSectionValidation {
  ok: boolean;
  violations: string[];
}

// 進行状況セクションの入力（開始日時・終了日時）を検証する。開始日時の
// 上書き禁止等の規律の判定は取りまとめの責務であり、本検証は値の様式のみ
// を扱う（決定的処理）。
export function validateProgressSection(input: ProgressSectionInput): ProgressSectionValidation {
  const violations: string[] = [];
  for (const [label, value] of [["開始日時", input.startDate], ["終了日時", input.endDate]] as const) {
    for (const violation of validateProgressDate(value).violations) {
      violations.push(`${label}: ${violation}`);
    }
  }
  return { ok: violations.length === 0, violations };
}

// Case Issue 本文の進行状況セクションを構築する。
// Root Case は正規状態と開始・終了日時のみ、Child は開始・終了日時のみを保持する
// （workflows/issue-lifecycle-records Design「正規状態と日時」節）。case-run は
// 完了条件チェックボックスを更新しない。日時欄の様式は validateProgressSection
// で検証する（様式どおりでない値の構築を事前検証で抑止する）。
export function buildProgressSection(input: ProgressSectionInput): string {
  const lines: string[] = ["## 進行状況", ""];
  if (input.canonicalState !== undefined) {
    lines.push(`- 正規状態: ${input.canonicalState}`);
  }
  lines.push(`- 開始日時: ${input.startDate}`);
  lines.push(`- 終了日時: ${input.endDate}`);
  lines.push("");
  return lines.join("\n");
}

export interface ResultSectionInput {
  deliverables: string;
  remainingItems: string;
}

// Case Issue 本文の結果セクションを構築する（完了・中止確定時のみ作成）。
// 終了状態は進行状況の正規状態が正であり、本セクションでは重複保存しない。
export function buildResultSection(input: ResultSectionInput): string {
  return [
    "## 結果",
    "",
    `- 成果物: ${input.deliverables}`,
    `- 残件の扱い: ${input.remainingItems}`,
    "",
  ].join("\n");
}

// 既存本文へセクションを適用する。同名セクションが存在する場合は置換、
// 存在しない場合は本文末尾へ追加する。既存セクションの順序と内容は保持する。
// 置換対象セクションの後に「## 」見出しが現れない（文書末尾セクションの）場合、
// 後続する HTML コメント・注記を置換対象から除外する（endIndex 初期値 lines.length
// による後続コメント群の消費を防ぐ境界検出）。
export function applySection(existingBody: string, sectionMarkdown: string): string {
  const heading = sectionMarkdown.split("\n", 1)[0]?.replace(/^##\s*/, "").trim() ?? "";
  const lines = existingBody.replace(/\n+$/, "\n").split("\n");
  const headingLine = `## ${heading}`;
  // 見出し直前の空行 1 行保証（REQ-117-013・AG-013）。置換・追記両分岐の連結前に
  // before 末尾へ空行 1 行を保証する（sectionMarkdown 側の先頭行見出し抽出契約は
  // 壊さない）。Root Case #3820 の本文構造崩壊を恒久化する。
  const joinWithBlankLine = (before: string): string =>
    before.length === 0 ? before : `${before.replace(/\n+$/, "")}\n\n`;

  const startIndex = lines.indexOf(headingLine);
  if (startIndex >= 0) {
    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i]?.startsWith("## ")) {
        endIndex = i;
        break;
      }
    }
    if (endIndex === lines.length) {
      const trailingStart = trailingCommentStartIndex(lines, startIndex);
      if (trailingStart !== null) {
        endIndex = trailingStart;
      }
    }
    const before = joinWithBlankLine(lines.slice(0, startIndex).join("\n"));
    const after = lines.slice(endIndex).join("\n");
    return `${before}${sectionMarkdown.replace(/\n+$/, "\n")}${after.startsWith("\n") ? after : `\n${after}`}`;
  }

  const base = joinWithBlankLine(existingBody);
  return `${base}${sectionMarkdown.replace(/\n+$/, "\n")}`;
}

// 文書末尾から逆走し、空行と完了した HTML コメントブロック（`<!--` 〜 `-->`）の
// 連続領域の開始位置を返す。後続する HTML コメント・注記が存在しない場合、
// コメントブロックの開始が置換対象セクションの見出し位置まで到達した場合、
// 未閉鎖のコメント断片で停止した場合は null（セクション本文を後続領域と誤認しない）。
function trailingCommentStartIndex(lines: readonly string[], sectionStartIndex: number): number | null {
  let i = lines.length;
  let sawComment = false;
  while (i > sectionStartIndex + 1) {
    const line = lines[i - 1] ?? "";
    if (line.trim() === "") {
      i -= 1;
      continue;
    }
    if (!line.trim().endsWith("-->")) {
      break;
    }
    let open = i - 1;
    while (open > sectionStartIndex && !(lines[open]?.includes("<!--") ?? false)) {
      open -= 1;
    }
    if (open <= sectionStartIndex || !(lines[open]?.includes("<!--") ?? false)) {
      break;
    }
    i = open;
    sawComment = true;
  }
  return sawComment ? i : null;
}
