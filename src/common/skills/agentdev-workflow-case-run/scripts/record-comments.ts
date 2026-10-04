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

// Case Issue 本文の進行状況セクションを構築する。
// Root Case は正規状態と開始・終了日時のみ、Child は開始・終了日時のみを保持する
// （workflows/issue-lifecycle-records Design「正規状態と日時」節）。case-run は
// 完了条件チェックボックスを更新しない。
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
export function applySection(existingBody: string, sectionMarkdown: string): string {
  const heading = sectionMarkdown.split("\n", 1)[0]?.replace(/^##\s*/, "").trim() ?? "";
  const lines = existingBody.replace(/\n+$/, "\n").split("\n");
  const headingLine = `## ${heading}`;

  const startIndex = lines.indexOf(headingLine);
  if (startIndex >= 0) {
    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i]?.startsWith("## ")) {
        endIndex = i;
        break;
      }
    }
    const before = lines.slice(0, startIndex).join("\n").replace(/\n+$/, "");
    const after = lines.slice(endIndex).join("\n");
    return `${before}\n${sectionMarkdown.replace(/\n+$/, "\n")}${after.startsWith("\n") ? after : `\n${after}`}`;
  }

  const base = existingBody.replace(/\n+$/, "");
  return `${base}\n${sectionMarkdown.replace(/\n+$/, "\n")}`;
}
