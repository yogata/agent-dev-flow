// ADF-COVERS 対応宣言の解析コア（agentdev-traceability Design
// 「対応宣言の表記（正規情報源）」の実装）。
//
// - 行単位のパターン照合のみを行い、意味推定を行わない
// - 宣言形式: ADF-COVERS(<role>): <REQ-ID>{, <REQ-ID>}*
//   role は design / implementation / verification、REQ-ID は REQ-{NNNN}-{MMM}
// - 1ファイルに複数の宣言行を含められる。解析結果は和集合とする
// - マーカー文字列 ADF-COVERS(...) 自体はファイル種別に依存しない
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

function isCoverRole(value: string): value is CoverRole {
  return (COVER_ROLES as readonly string[]).includes(value);
}

/**
 * 1ファイル分の内容を解析する。file はリポジトリ相対パス（フォワードスラッシュ）。
 *
 * 検出規則:
 * - 行が完全形式（既知ロール + コロン + REQ-ID リスト）に合致すれば対応宣言とする
 * - ADF-COVERS(<識別子>) の形状だが完全形式でない場合、ロールが既知3種なら
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
    const m = raw.match(DECLARATION_RE);
    if (m) {
      declarations.push({
        role: m[1] as CoverRole,
        reqIds: m[2]!.split(/\s*,\s*/),
        file,
        line: i + 1,
      });
      continue;
    }
    const probe = raw.match(ROLE_PROBE_RE);
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
