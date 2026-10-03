// Case Issue 工程記録の取りまとめ実行経路向け決定的処理。
//
// 記録契機（着手、引き渡し、停止、再開、判断変更、完了）と記録コメントの
// 対応、種別別必須項目の検証、Case Issue 本文の現在地・結果セクションの
// 構築と適用を提供する。
// 判定主体（case-close 等）が完了条件と証拠を照合する意味判断は本モジュール
// の対象外であり、本モジュールは呼び出し側が持つ事実・根拠の構造化と検査
// （決定的処理）のみを担う。Custom Tool `agentdev_gh` の操作契約は変更しない。

import { join } from "node:path";

// 記録契機（6種）。委譲要求は着手と同一視しないため、委譲起動は記録契機に含めない。
export const RECORD_KINDS = [
  "start",
  "handoff",
  "hold",
  "resume",
  "decision_change",
  "completion",
] as const;

export type RecordKind = (typeof RECORD_KINDS)[number];

// 記録種別の表示名。
export const RECORD_KIND_LABELS: Record<RecordKind, string> = {
  start: "着手",
  handoff: "引き渡し",
  hold: "停止",
  resume: "再開",
  decision_change: "判断変更",
  completion: "完了",
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

// 種別別必須セクション。停止=再開条件、判断変更=撤回対象、引き渡し=残作業と受取役割、
// 完了=判定根拠。再開は停止コメントに記録された再開条件の充足と最新条件の引き渡しを
// 証跡化するため最新条件参照を必須とする。
export const KIND_REQUIRED_SECTIONS: Record<RecordKind, readonly string[]> = {
  start: [],
  handoff: ["残作業と受取役割"],
  hold: ["再開条件"],
  resume: ["最新条件参照"],
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

// 進行状態4値（表示）。記録契機からの写像であり、第二の進行管理を構成しない。
export const PROGRESS_STATES = ["未着手", "実行中", "待機", "終了"] as const;

export type ProgressState = (typeof PROGRESS_STATES)[number];

export function mapRecordKindToProgressState(kind: RecordKind): ProgressState {
  switch (kind) {
    case "start":
    case "handoff":
    case "resume":
    case "decision_change":
      return "実行中";
    case "hold":
      return "待機";
    case "completion":
      return "終了";
  }
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

export interface CurrentLocationInput {
  phase: string;
  progressState: ProgressState;
  nextAction: string;
  ownerRole: string;
  holdReason?: string;
  latestRecordRef?: string;
}

// Case Issue 本文の現在地セクションを構築する。
export function buildCurrentLocationSection(input: CurrentLocationInput): string {
  return [
    "## 現在地",
    "",
    `- 工程: ${input.phase}`,
    `- 進行状態: ${input.progressState}`,
    `- 次の行動: ${input.nextAction}`,
    `- 担当役割: ${input.ownerRole}`,
    `- 停止・待機理由: ${input.holdReason ?? "該当なし"}`,
    `- 最新記録参照: ${input.latestRecordRef ?? "該当なし"}`,
    "",
  ].join("\n");
}

export interface ResultSectionInput {
  deliverables: string;
  finalJudgmentAndBasis: string;
  remainingItems: string;
}

// Case Issue 本文の結果セクションを構築する（完了契機）。
export function buildResultSection(input: ResultSectionInput): string {
  return [
    "## 結果",
    "",
    `- 成果物: ${input.deliverables}`,
    `- 最終判定と根拠: ${input.finalJudgmentAndBasis}`,
    `- 残件の扱い: ${input.remainingItems}`,
    "",
  ].join("\n");
}

// 既存本文へセクションを適用する。同名セクションが存在する場合は置換、
// 存在しない場合は「補足情報」で始まる見出しセクションの直前に挿入し、
// それも存在しない場合は本文末尾へ追加する。既存セクションの順序と内容は保持する。
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

  const supplementIndex = lines.findIndex((line) => line.startsWith("## 補足情報"));
  if (supplementIndex >= 0) {
    const before = lines.slice(0, supplementIndex).join("\n").replace(/\n+$/, "");
    const after = lines.slice(supplementIndex).join("\n");
    return `${before}\n${sectionMarkdown.replace(/\n+$/, "\n")}${after.startsWith("\n") ? after : `\n${after}`}`;
  }

  const base = existingBody.replace(/\n+$/, "");
  return `${base}\n${sectionMarkdown.replace(/\n+$/, "\n")}`;
}
