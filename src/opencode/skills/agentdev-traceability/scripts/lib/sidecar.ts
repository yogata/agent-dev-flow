// top-level traceability/ 配下 component / package 単位 sidecar の読み込みと
// 論理対応関係への正規化（agentdev-traceability Design
// 「対応関係データの取得と正規化」、TIM traceability-model.md
// 「対応関係データの保存方式」の実装側）。
//
// - sidecar の最小データは component 識別子、artifact のリポジトリ相対パス、
//   role、要件行 ID のみ。専用 artifact ID、関係 ID、revision、digest は必須としない
// - YAML 解析は保証サブセット（anchor、alias、カスタムタグ、
//   複数ドキュメントを除く）に従い標準 API（Bun.YAML.parse）へ委譲する
// - schema 不適合・未知キーを黙って読み飛ばさない（checker 実行契約 Design
//   の宣言的データの silent skip 禁止と同一規定）
// - 解析した対応関係は inline declaration と同一の論理対応関係
//   （artifact パス、role、要件行 ID）へ正規化される

import { COVER_ROLES, type CoverRole } from "./declarations.ts";

export const TRACEABILITY_DIR = "traceability";

export interface SidecarRelation {
  readonly role: CoverRole;
  /** 対応対象成果物のリポジトリ相対パス（POSIX 区切り）。 */
  readonly artifact: string;
  readonly reqIds: readonly string[];
}

export type SidecarIssueReason = "unreadable-sidecar" | "invalid-syntax" | "invalid-schema";

export interface SidecarIssue {
  readonly reason: SidecarIssueReason;
  /** sidecar ファイルのリポジトリ相対パス。 */
  readonly file: string;
  /** 違反箇所の artifact キー（reqId 形式違反等で特定できる場合）。 */
  readonly artifact?: string;
  readonly text?: string;
  readonly detail: string;
}

export interface SidecarParseResult {
  readonly component: string;
  readonly relations: readonly SidecarRelation[];
  readonly issues: readonly SidecarIssue[];
}

const REQ_LINE_RE = /^REQ-\d{3,4}-\d{3}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCoverRole(value: string): value is CoverRole {
  return (COVER_ROLES as readonly string[]).includes(value);
}

function parseSidecarObject(file: string, value: Record<string, unknown>): SidecarParseResult {
  const issues: SidecarIssue[] = [];
  const relations: SidecarRelation[] = [];
  const component = value["component"];
  if (typeof component !== "string" || component.trim() === "") {
    issues.push({
      reason: "invalid-schema",
      file,
      detail: "トップレベルキー component は必須の非空文字列（traceability-model.md sidecar schema）",
    });
  }
  const roleKeys = Object.keys(value).filter((k) => k !== "component");
  for (const roleKey of roleKeys) {
    if (!isCoverRole(roleKey)) {
      issues.push({
        reason: "invalid-schema",
        file,
        text: roleKey,
        detail: `未知のトップレベルキー（role キーは ${COVER_ROLES.join(" / ")} のみ許容）`,
      });
      continue;
    }
    const roleValue = value[roleKey];
    if (!isRecord(roleValue)) {
      issues.push({
        reason: "invalid-schema",
        file,
        text: roleKey,
        detail: "role キーの値は「artifact パス → 要件行 ID の列挙」のマッピング",
      });
      continue;
    }
    for (const [artifact, reqIdsValue] of Object.entries(roleValue)) {
      if (artifact.trim() === "") {
        issues.push({
          reason: "invalid-schema",
          file,
          text: roleKey,
          detail: "artifact パスは非空のリポジトリ相対パス（POSIX 区切り）",
        });
        continue;
      }
      if (!Array.isArray(reqIdsValue) || reqIdsValue.length === 0) {
        issues.push({
          reason: "invalid-schema",
          file,
          artifact,
          text: roleKey,
          detail: "artifact の値は REQ-{NNNN}-{MMM} 形式の要件行 ID の非空配列",
        });
        continue;
      }
      const reqIds: string[] = [];
      for (const reqId of reqIdsValue) {
        if (typeof reqId !== "string" || !REQ_LINE_RE.test(reqId)) {
          issues.push({
            reason: "invalid-schema",
            file,
            artifact,
            text: typeof reqId === "string" ? reqId : roleKey,
            detail: "要件行 ID は REQ-{NNNN}-{MMM} 形式の文字列",
          });
          continue;
        }
        reqIds.push(reqId);
      }
      if (reqIds.length === 0) continue;
      relations.push({
        role: roleKey,
        artifact: artifact.replaceAll("\\", "/"),
        reqIds,
      });
    }
  }
  return { component: typeof component === "string" ? component : "", relations, issues };
}

/**
 * sidecar 本文を解析し、論理対応関係（role、artifact パス、要件行 ID）へ正規化する。
 * YAML 解析失敗は invalid-syntax、schema 不適合は invalid-schema として報告する
 * （silent skip 禁止）。issue とならない範囲の対応関係は引き続き返す。
 */
export function parseSidecar(file: string, content: string): SidecarParseResult {
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(content);
  } catch (error) {
    return {
      component: "",
      relations: [],
      issues: [
        {
          reason: "invalid-syntax",
          file,
          text: content.slice(0, 200),
          detail: `YAML 解析に失敗した（${error instanceof Error ? error.message : "unknown error"}）`,
        },
      ],
    };
  }
  if (!isRecord(parsed)) {
    return {
      component: "",
      relations: [],
      issues: [
        {
          reason: "invalid-schema",
          file,
          detail: "sidecar の内容はトップレベルに component と role キーを持つマッピング",
        },
      ],
    };
  }
  return parseSidecarObject(file, parsed);
}
