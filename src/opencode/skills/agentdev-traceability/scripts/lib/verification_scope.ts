// 検証対応要否カタログの解析・展開（foundations/traceability-model.md
// 「対応関係の完全性規則」が所有する要否区分カタログの実装側）。
//
// - カタログの正規情報源はトレーサビリティモデル references 配下の Markdown ファイル
// - エントリは `## 任意行エントリ` 節の箇条書き行のみ。他節（形式説明等）は対象外
// - エントリ形式は `REQ-{NNNN}-{MMM}`（単一）または
//   `REQ-{NNNN}-{MMM}..REQ-{NNNN}-{MMM}`（同一REQファイル内の範囲）
// - エントリに後置された説明文は解釈しない
// - 範囲は既知要件行との積として展開する（中間の欠番行は参照エラーにしない）。
//   両端は既知要件行として実在しなければならない
// - 未登録の要件行は検証対応必須として扱う（安全側既定）は check 側の挙動。
//   本モジュールは登録行集合（optionalReqIds）の解決のみを担う
//
// 本モジュールは解析のみを担い、検査（check.ts）や CLI（../src/）から分離している。

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_VERIFICATION_SCOPE_CATALOG =
  "docs/designs/foundations/references/verification-scope-catalog.md";

const ENTRY_SECTION_HEADING_RE = /^##\s*任意行エントリ\s*$/;
const NEXT_HEADING_RE = /^##\s/;
const BULLET_RE = /^-\s+(.*)$/;
const ENTRY_TOKEN_RE = /^(REQ-\d{3}-\d{3})(?:\.\.(REQ-\d{3}-\d{3}))?/;
const REQ_LINE_RE = /^REQ-(\d{3})-(\d{3})$/;

export interface VerificationScopeEntry {
  readonly line: number;
  readonly startId: string;
  readonly endId: string | undefined;
  readonly text: string;
}

export type VerificationScopeIssueReason =
  | "malformed-entry"
  | "cross-req-file-range"
  | "reversed-range"
  | "unknown-req-ref"
  | "unreadable-catalog";

export interface VerificationScopeIssue {
  readonly reason: VerificationScopeIssueReason;
  readonly line: number;
  readonly reqId: string | undefined;
  readonly text: string;
  readonly detail: string;
}

export interface VerificationScopeResolution {
  /** カタログのリポジトリ相対パス（未解決時は空文字）。 */
  readonly catalogFile: string;
  /** 検証対応任意行（カタログ登録行）の要件行ID集合。 */
  readonly optionalReqIds: ReadonlySet<string>;
  /** カタログの無効なエントリ・参照（check の invalid-catalog-refs 検査の入力）。 */
  readonly issues: readonly VerificationScopeIssue[];
}

interface ReqLineParts {
  readonly file: string;
  readonly line: number;
}

function parseReqLine(id: string): ReqLineParts | undefined {
  const m = id.match(REQ_LINE_RE);
  if (!m) return undefined;
  return { file: m[1]!, line: Number(m[2]) };
}

/**
 * カタログ本文を解析する。`## 任意行エントリ` 節の箇条書き行をエントリとして抽出し、
 * 形式を満たさない行・同一REQファイル外の範囲・逆順の範囲を issue として報告する。
 * issue となったエントリは展開対象から除外する（該当行は検証対応必須のまま）。
 */
export function parseVerificationScopeCatalog(content: string): {
  entries: readonly VerificationScopeEntry[];
  issues: readonly VerificationScopeIssue[];
} {
  const entries: VerificationScopeEntry[] = [];
  const issues: VerificationScopeIssue[] = [];
  const lines = content.split("\n");
  let inSection = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!.replace(/\r$/, "");
    if (ENTRY_SECTION_HEADING_RE.test(raw)) {
      inSection = true;
      continue;
    }
    if (inSection && NEXT_HEADING_RE.test(raw)) {
      inSection = false;
      continue;
    }
    if (!inSection) continue;
    const bullet = raw.match(BULLET_RE);
    if (!bullet) continue;
    const token = bullet[1]!.match(ENTRY_TOKEN_RE);
    if (!token) {
      issues.push({
        reason: "malformed-entry",
        line: i + 1,
        reqId: undefined,
        text: raw.trim(),
        detail:
          "エントリ形式（REQ-{NNNN}-{MMM} または REQ-{NNNN}-{MMM}..REQ-{NNNN}-{MMM}）を満たさない",
      });
      continue;
    }
    const startId = token[1]!;
    const endId = token[2];
    if (endId !== undefined) {
      const start = parseReqLine(startId);
      const end = parseReqLine(endId);
      if (start?.file !== end?.file) {
        issues.push({
          reason: "cross-req-file-range",
          line: i + 1,
          reqId: undefined,
          text: raw.trim(),
          detail: `範囲の両端が同一REQファイル内にない（${startId}..${endId}）`,
        });
        continue;
      }
      if (start && end && start.line > end.line) {
        issues.push({
          reason: "reversed-range",
          line: i + 1,
          reqId: undefined,
          text: raw.trim(),
          detail: `範囲の開始行が終了行より後である（${startId}..${endId}）`,
        });
        continue;
      }
    }
    entries.push({ line: i + 1, startId, endId: endId ?? undefined, text: raw.trim() });
  }
  return { entries, issues };
}

/**
 * エントリを既知要件行IDと突合して展開する。単一エントリおよび範囲の両端が
 * 既知要件行に存在しない場合は unknown-req-ref を報告し、当該エントリは
 * 展開対象から除外する（安全側: 該当行は検証対応必須のまま）。
 */
export function resolveVerificationScope(
  entries: readonly VerificationScopeEntry[],
  knownReqIds: readonly string[],
  options: { catalogFile?: string; issues?: readonly VerificationScopeIssue[] } = {},
): VerificationScopeResolution {
  const known = new Set(knownReqIds);
  const knownByFile = new Map<string, number[]>();
  for (const id of knownReqIds) {
    const parts = parseReqLine(id);
    if (!parts) continue;
    const bucket = knownByFile.get(parts.file) ?? [];
    bucket.push(parts.line);
    knownByFile.set(parts.file, bucket);
  }

  const issues: VerificationScopeIssue[] = [...(options.issues ?? [])];
  const optional = new Set<string>();
  for (const entry of entries) {
    const refs = entry.endId === undefined ? [entry.startId] : [entry.startId, entry.endId];
    const unknown = refs.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      for (const id of unknown) {
        issues.push({
          reason: "unknown-req-ref",
          line: entry.line,
          reqId: id,
          text: entry.text,
          detail: "カタログが参照する要件行が現行要件として存在しない",
        });
      }
      continue;
    }
    if (entry.endId === undefined) {
      optional.add(entry.startId);
      continue;
    }
    const start = parseReqLine(entry.startId)!;
    const end = parseReqLine(entry.endId)!;
    const idOf = (lineNo: number) => `REQ-${start.file}-${String(lineNo).padStart(3, "0")}`;
    for (const lineNo of knownByFile.get(start.file) ?? []) {
      if (lineNo >= start.line && lineNo <= end.line) optional.add(idOf(lineNo));
    }
  }
  return {
    catalogFile: options.catalogFile ?? "",
    optionalReqIds: optional,
    issues,
  };
}

/**
 * root 配下の既定パスからカタログを読み込み、検証対応任意行集合を解決する。
 * カタログファイルが存在しない場合は空の解決結果を返す（全要件行が検証対応必須 =
 * カタログ機構導入前と同一の挙動）。存在するが読み取れない場合は
 * unreadable-catalog を報告する（安全側: 全要件行が検証対応必須）。
 */
export function resolveVerificationScopeFromRoot(
  root: string,
  knownReqIds: readonly string[],
  catalogPath: string = DEFAULT_VERIFICATION_SCOPE_CATALOG,
): VerificationScopeResolution {
  const full = join(root, catalogPath);
  try {
    statSync(full);
  } catch {
    return { catalogFile: catalogPath, optionalReqIds: new Set(), issues: [] };
  }
  let content: string;
  try {
    content = readFileSync(full, "utf-8");
  } catch {
    return {
      catalogFile: catalogPath,
      optionalReqIds: new Set(),
      issues: [
        {
          reason: "unreadable-catalog",
          line: 0,
          reqId: undefined,
          text: catalogPath,
          detail: "検証対応要否カタログを読み取れない",
        },
      ],
    };
  }
  const parsed = parseVerificationScopeCatalog(content);
  return resolveVerificationScope(parsed.entries, knownReqIds, {
    catalogFile: catalogPath,
    issues: parsed.issues,
  });
}
