// ADF-COVERS 対応宣言の解析コア（agentdev-traceability Design
// 「対応宣言の表記（正規情報源）」の実装）。
//
// - 行単位のパターン照合のみを行い、意味推定を行わない
// - 宣言形式: ADF-COVERS(<role>): <REQ-ID>{, <REQ-ID>}*
//   role は design / implementation / verification、REQ-ID は REQ-{NNNN}-{MMM}
// - 1ファイルに複数の宣言行を含められる。解析結果は和集合とする
// - マーカー文字列 ADF-COVERS(...) 自体はファイル種別に依存しない
// - 解析対象は正規宣言位置（ファイル種別のコメント記法内部の宣言行）に限定する。
//   本文 prose（見出し・段落・箇条書き等）内のマーカー形状の言及は
//   説明文コンテキスト対象外判定により文字列一致対象から除外する。
//   正規位置の形式不備宣言は引き続き malformed-declaration として検出する
//   （検出縮退禁止、agentdev-traceability Design「対応宣言の表記（正規情報源）」）
//
// 本モジュールは解析のみを担い、走査（corpus.ts）や CLI（../src/）から分離している。
// この分離により、coverage、impact、check の外部契約を変えずに、
// 将来キャッシュまたは索引を追加できる構造を保持する。

export const COVER_ROLES = ["design", "implementation", "verification"] as const;
export type CoverRole = (typeof COVER_ROLES)[number];

export interface CoverDeclaration {
  readonly role: CoverRole;
  readonly reqIds: readonly string[];
  readonly file: string;
  readonly line: number;
}

export type DeclarationIssueKind = "malformed-declaration" | "unknown-role";

export interface DeclarationIssue {
  readonly kind: DeclarationIssueKind;
  readonly file: string;
  readonly line: number;
  readonly text: string;
  readonly detail: string;
}

const DECLARATION_RE =
  /ADF-COVERS\((design|implementation|verification)\):\s*(REQ-\d{3,4}-\d{3}(?:\s*,\s*REQ-\d{3,4}-\d{3})*)/;
const ROLE_PROBE_RE = /ADF-COVERS\(([A-Za-z][A-Za-z0-9-]*)\)/;
const MARKDOWN_COMMENT_LINE_RE = /^\s*<!--\s*(.*?)\s*-->\s*$/;
const TS_LINE_COMMENT_RE = /^\s*\/\/(.*)$/;

function isCoverRole(value: string): value is CoverRole {
  return (COVER_ROLES as readonly string[]).includes(value);
}

/**
 * 正規宣言位置（ファイル種別のコメント記法内部の宣言行）から解析候補テキストを抽出する。
 * 本文 prose 行は説明文コンテキスト対象外として null を返す。
 * - .md: 行全体が HTML コメント（<!-- ... -->）で完結する行のみ正規位置
 * - .ts: 行頭 // コメント行のみ正規位置
 * - それ以外の拡張子は従来どおり行全体を対象とする（マーカーはファイル種別に依存しない）
 */
function extractDeclarationLineText(file: string, raw: string): string | null {
  if (file.endsWith(".md")) {
    const m = raw.match(MARKDOWN_COMMENT_LINE_RE);
    if (!m) return null;
    const inner = m[1]!;
    return inner.trim() === "" ? null : inner;
  }
  if (file.endsWith(".ts")) {
    const m = raw.match(TS_LINE_COMMENT_RE);
    if (!m) return null;
    const inner = m[1]!;
    return inner.trim() === "" ? null : inner;
  }
  return raw;
}

/**
 * 1ファイル分の内容を解析する。file はリポジトリ相対パス（フォワードスラッシュ）。
 *
 * 検出規則:
 * - 正規宣言位置（コメント記法内部の宣言行）のみを解析対象とし、本文 prose 行は
 *   対象外判定により除外する
 * - 正規位置の行が完全形式（既知ロール + コロン + REQ-ID リスト）に合致すれば対応宣言とする
 * - 正規位置の行が ADF-COVERS(<識別子>) の形状だが完全形式でない場合、ロールが既知3種なら
 *   malformed-declaration、未知なら unknown-role を報告する
 * - ロール部が識別子形式でない行（説明文のプレースホルダ <role> 等）は対象外とする
 */
export function parseDeclarations(
  file: string,
  content: string,
): { declarations: CoverDeclaration[]; issues: DeclarationIssue[] } {
  const declarations: CoverDeclaration[] = [];
  const issues: DeclarationIssue[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!.replace(/\r$/, "");
    const candidate = extractDeclarationLineText(file, raw);
    if (candidate === null) continue;
    const m = candidate.match(DECLARATION_RE);
    if (m) {
      declarations.push({
        role: m[1] as CoverRole,
        reqIds: m[2]!.split(/\s*,\s*/),
        file,
        line: i + 1,
      });
      continue;
    }
    const probe = candidate.match(ROLE_PROBE_RE);
    if (!probe) continue;
    const role = probe[1]!;
    if (isCoverRole(role)) {
      issues.push({
        kind: "malformed-declaration",
        file,
        line: i + 1,
        text: raw.trim(),
        detail: "ADF-COVERS マーカーが既知ロールとともにあるが、宣言形式（コロンと REQ-{NNNN}-{MMM} の ID リスト）を満たさない",
      });
    } else {
      issues.push({
        kind: "unknown-role",
        file,
        line: i + 1,
        text: raw.trim(),
        detail: `未知の成果物役割 ${role}（既知: design / implementation / verification）`,
      });
    }
  }
  return { declarations, issues };
}
