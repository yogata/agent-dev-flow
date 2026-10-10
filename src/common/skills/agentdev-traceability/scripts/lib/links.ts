// 採用された隣接工程間対応（links）の解析コア。
// covers 対応関係に加わる有界な標準関係として、プロジェクトの採用した
// 隣接工程間の成果物・追跡単位を明示的に関連付ける（v4-traceability-model
// Design「標準関係の構造（v5 語義）」節の語義に従う。物理形式は隣接工程間対応の
// 適用範囲の対象外であり、本モジュールの宣言形式は機械解決の実装面）。
//
// - 宣言は下流側成果物から上流側成果物への参照（direction: upstream）のみを
//   許容する。上流→下流の逆方向は links クエリ（../src/links.ts）の逆引きで
//   追跡でき、双方向の宣言を要求しない（宣言の二重管理と逆整合矛盾を防ぐ）
// - links の完全性検査は存在しない。links 宣言の不在は不合格に計上せず、
//   採用されていない詳細工程への対応を強制しない
// - links 対応は covers の対応完全性（missing-*）の代替にならず、
//   missing-* 判定に入れない（グループ化しても子要件行単位の検証義務が消えない）
// - 行単位のパターン照合のみを行い、意味推定を行わない
// - 解析対象は covers と同一の正規宣言位置（コメント記法内部の宣言行）。
//   本文 prose 内のマーカー形状の言及は対象外とする
// - sidecar はトップレベルキー `links` の `upstream` 配下へ
//   「source（下流成果物）パス → target（上流成果物）パスの列挙」を記述する

export type LinkDirection = "upstream";
export const LINK_DIRECTIONS = ["upstream"] as const;

export interface LinkRelation {
  /** 下流側成果物のリポジトリ相対パス（宣言を保持する側、inline は file と同一）。 */
  readonly source: string;
  /** 上流側成果物のリポジトリ相対パス。 */
  readonly target: string;
  /** 宣言方向（現行は upstream のみ）。 */
  readonly direction: LinkDirection;
  /** 宣言種別。 */
  readonly origin: "inline" | "sidecar";
  /** 宣言を保持するファイル（inline は source と同一、sidecar は sidecar パス）。 */
  readonly sourceFile: string;
  /** 宣言位置。inline は 1-based 行番号、sidecar 正規化分は 0（位置情報を保持しない）。 */
  readonly line: number;
}

export type LinkIssueReason =
  | "malformed-link-declaration"
  | "unknown-link-direction"
  | "invalid-sidecar-links-schema";

export interface LinkIssue {
  readonly reason: LinkIssueReason;
  /** 宣言を保持するファイルのリポジトリ相対パス。 */
  readonly file: string;
  readonly line?: number;
  readonly text?: string;
  readonly detail: string;
}

export interface LinkParseResult {
  readonly links: readonly LinkRelation[];
  readonly issues: readonly LinkIssue[];
}

const LINK_DECLARATION_RE = /ADF-LINKS\((upstream)\):\s*([^\s][^]*)$/;
const LINK_DIRECTION_PROBE_RE = /ADF-LINKS\(([A-Za-z][A-Za-z0-9-]*)\)/;
const MARKDOWN_COMMENT_LINE_RE = /^\s*<!--\s*(.*?)\s*-->\s*$/;
const TS_LINE_COMMENT_RE = /^\s*\/\/(.*)$/;

function isLinkDirection(value: string): value is LinkDirection {
  return (LINK_DIRECTIONS as readonly string[]).includes(value);
}

function extractLinkDeclarationLineText(file: string, raw: string): string | null {
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

/** 宣言本文（コロン以降）から target パス列を分割する。カンマ区切り・空白正規化。 */
function splitLinkTargets(body: string): readonly string[] {
  return body
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * 1ファイル分の内容から ADF-LINKS 宣言を解析する。file はリポジトリ相対パス
 * （フォワードスラッシュ）。covers の parseDeclarations と同一の正規宣言位置
 * 対象外判定を使う（prose 対象外、正規位置の形式不備は引き続き検出する）。
 *
 * 検出規則:
 * - 正規位置の行が完全形式（upstream 方向 + コロン + target パス列）に合致すれば対応宣言
 * - マーカーと開き括弧を持つが完全形式でない場合、方向が upstream なら
 *   malformed-link-declaration、それ以外の識別子なら unknown-link-direction を報告
 * - target パス列が空（コロン後に実質内容がない）場合は malformed を報告
 */
export function parseLinkDeclarations(file: string, content: string): LinkParseResult {
  const links: LinkRelation[] = [];
  const issues: LinkIssue[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!.replace(/\r$/, "");
    const candidate = extractLinkDeclarationLineText(file, raw);
    if (candidate === null) continue;
    const m = candidate.match(LINK_DECLARATION_RE);
    if (m) {
      const targets = splitLinkTargets(m[2]!);
      if (targets.length === 0) {
        issues.push({
          reason: "malformed-link-declaration",
          file,
          line: i + 1,
          text: raw.trim(),
          detail: "ADF-LINKS 宣言の target パス列が空（upstream 方向のコロン後にリポジトリ相対パスを列挙する）",
        });
        continue;
      }
      for (const target of targets) {
        links.push({
          source: file,
          target,
          direction: "upstream",
          origin: "inline",
          sourceFile: file,
          line: i + 1,
        });
      }
      continue;
    }
    const probe = candidate.match(LINK_DIRECTION_PROBE_RE);
    if (!probe) continue;
    const direction = probe[1]!;
    if (isLinkDirection(direction)) {
      issues.push({
        reason: "malformed-link-declaration",
        file,
        line: i + 1,
        text: raw.trim(),
        detail: "ADF-LINKS マーカーが upstream 方向とともにあるが、宣言形式（コロンとリポジトリ相対パスのカンマ区切り列挙）を満たさない",
      });
    } else {
      issues.push({
        reason: "unknown-link-direction",
        file,
        line: i + 1,
        text: raw.trim(),
        detail: `未知の links 方向 ${direction}（許容: upstream。下流→上流の参照のみを宣言し、逆方向は links クエリの逆引きで追跡する）`,
      });
    }
  }
  return { links, issues };
}

export interface SidecarLinksResult {
  readonly links: readonly LinkRelation[];
  readonly issues: readonly LinkIssue[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * sidecar 本文のトップレベル `links` キーの値を解析する。
 * 値は `upstream: { <source パス>: [<target パス>, ...] }` のマッピング。
 * schema 不適合は silent skip せず invalid-sidecar-links-schema として報告する
 * （checker 実行契約 Design の宣言的データの silent skip 禁止と同一規定）。
 */
export function parseSidecarLinks(file: string, value: unknown): SidecarLinksResult {
  const links: LinkRelation[] = [];
  const issues: LinkIssue[] = [];
  if (value === undefined) return { links, issues };
  if (!isRecord(value)) {
    issues.push({
      reason: "invalid-sidecar-links-schema",
      file,
      text: "links",
      detail: "links キーの値は「方向 → source パス → target パス列」のマッピング",
    });
    return { links, issues };
  }
  const directionKeys = Object.keys(value);
  for (const directionKey of directionKeys) {
    if (!isLinkDirection(directionKey)) {
      issues.push({
        reason: "invalid-sidecar-links-schema",
        file,
        text: directionKey,
        detail: `未知の links 方向（許容: ${LINK_DIRECTIONS.join(" / ")}）`,
      });
      continue;
    }
    const sources = value[directionKey];
    if (!isRecord(sources)) {
      issues.push({
        reason: "invalid-sidecar-links-schema",
        file,
        text: directionKey,
        detail: "方向キーの値は「source パス → target パス列」のマッピング",
      });
      continue;
    }
    for (const [source, targetsValue] of Object.entries(sources)) {
      if (source.trim() === "") {
        issues.push({
          reason: "invalid-sidecar-links-schema",
          file,
          text: directionKey,
          detail: "source パスは非空のリポジトリ相対パス（POSIX 区切り）",
        });
        continue;
      }
      if (!Array.isArray(targetsValue) || targetsValue.length === 0) {
        issues.push({
          reason: "invalid-sidecar-links-schema",
          file,
          text: source,
          detail: "source の値は target パスの非空配列",
        });
        continue;
      }
      const targets: string[] = [];
      for (const target of targetsValue) {
        if (typeof target !== "string" || target.trim() === "") {
          issues.push({
            reason: "invalid-sidecar-links-schema",
            file,
            text: source,
            detail: "target は非空のリポジトリ相対パス（POSIX 区切り）の文字列",
          });
          continue;
        }
        targets.push(target);
      }
      for (const target of targets) {
        links.push({
          source: source.replaceAll("\\", "/"),
          target: target.replaceAll("\\", "/"),
          direction: directionKey,
          origin: "sidecar",
          sourceFile: file,
          line: 0,
        });
      }
    }
  }
  return { links, issues };
}
