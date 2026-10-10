// 採用規約（成果物の意味と設計根拠に関する規約）の解決。
//
// 成果物の意味と工程別正式確定の要件（本コンポーネントの sidecar を正とする）のうち、
// 次の2点を実現する解決器である:
// - プロジェクトが v5 の工程・成果物規約の採用宣言を行うまでの間は、当該プロジェクトの
//   現に実効している工程・成果物の運用を採用済み規約として扱うこと
// - 設計責務の成立は独立 Design 文書の存在に一律依存せず、採用規約が認める成果物から
//   設計根拠を確認できること。独立設計書を必須として採用した場合はその欠落を見逃さないこと
//
// 解決手順（単一経路）:
// 1. 採用宣言（--adopted 指定 YAML）が存在する場合: その宣言を正規の採用規約として解決する
// 2. 採用宣言が存在しない場合: 移行期デフォルトを接続する
//
// 解決不能（YAML 解析失敗、schema 不適合）は判定を下さず fail-closed で失敗する。

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseOrThrow } from "./yaml.ts";

export interface ArtifactSemanticsConventions {
  /**
   * プロジェクトが独立設計書（独立 Design 文書）を必須成果物として採用しているか。
   * 独立設計書必須採用下の欠落検出は、この採用が行われている場合に効く。
   */
  readonly independentDesignRequired: boolean;
  /**
   * 独立 Design 文書以外の、採用規約が認める適切な成果物からの設計根拠宣言を
   * 有効とするか（一律依存でない性質）。
   */
  readonly alternativeDesignBasisAllowed: boolean;
  /** 規約の解決元。移行期は migration-default。 */
  readonly source: "adopted" | "migration-default";
  /** 採用宣言の適用開始点（採用宣言がある場合のみ）。 */
  readonly adoptedAt?: string;
}

/**
 * 移行期デフォルト。本リポジトリの現に実効している運用の根拠:
 * - independentDesignRequired: true — 現行要件行への design 対応（独立 Design 文書型
 *   docs/designs/** への covers）を原則必須とする運用（agentdev-traceability check の
 *   missing-design 運用、case-ready の設計根拠対応ゲート）が実効している
 * - alternativeDesignBasisAllowed: true — 同時に、独立した Design 文書の存在を一律の
 *   必須条件とせず、採用規約が認める適切な成果物から設計内容と根拠を確認できる運用が
 *   実効しているため、独立 Design 文書以外の成果物からの設計根拠宣言も有効とする
 */
export const MIGRATION_DEFAULT_CONVENTIONS: ArtifactSemanticsConventions = {
  independentDesignRequired: true,
  alternativeDesignBasisAllowed: true,
  source: "migration-default",
};

export const CONVENTIONS_ROOT_FIELD = "artifact_semantics";

export class ConventionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConventionsError";
  }
}

function conventionsFromRecord(record: Record<string, unknown>): ArtifactSemanticsConventions {
  const independent = record.independentDesignRequired;
  const alternative = record.alternativeDesignBasisAllowed;
  if (typeof independent !== "boolean" || typeof alternative !== "boolean") {
    throw new ConventionsError(
      `${CONVENTIONS_ROOT_FIELD} には independentDesignRequired（boolean）と alternativeDesignBasisAllowed（boolean）の双方が必須である`,
    );
  }
  const adoptedAt = record.adoptedAt;
  if (adoptedAt !== undefined && typeof adoptedAt !== "string") {
    throw new ConventionsError(`${CONVENTIONS_ROOT_FIELD}.adoptedAt は文字列で宣言すること`);
  }
  return {
    independentDesignRequired: independent,
    alternativeDesignBasisAllowed: alternative,
    source: "adopted",
    ...(adoptedAt !== undefined ? { adoptedAt } : {}),
  };
}

export function parseAdoptedConventions(content: string): ArtifactSemanticsConventions {
  const parsed = parseOrThrow(content, "採用宣言の YAML 解析に失敗した");
  const root = parsed[CONVENTIONS_ROOT_FIELD];
  if (root === undefined || root === null) {
    throw new ConventionsError(`採用宣言に ${CONVENTIONS_ROOT_FIELD} セクションが存在しない`);
  }
  if (typeof root !== "object" || Array.isArray(root)) {
    throw new ConventionsError(`${CONVENTIONS_ROOT_FIELD} セクションはオブジェクトとして宣言すること`);
  }
  return conventionsFromRecord(root as Record<string, unknown>);
}

/**
 * 採用規約の解決。adoptedContent が指定されればそれを採用宣言として解析し、
 * なければ移行期デフォルトを返す。採用宣言ファイルの読取失敗・解析失敗は
 * fail-closed の ConventionsError とする（解決不能で移行期デフォルトへは
 * フォールバックしない。宣言があるのに読めない場合に黙って既定を適用しない）。
 */
export function resolveConventions(adoptedContent: string | undefined): ArtifactSemanticsConventions {
  if (adoptedContent === undefined) return MIGRATION_DEFAULT_CONVENTIONS;
  return parseAdoptedConventions(adoptedContent);
}

export function readAdoptedConventionsFile(root: string, relativePath: string): string {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\.\//, "");
  try {
    return readFileSync(join(root, normalized), "utf-8");
  } catch {
    throw new ConventionsError(`採用宣言ファイルを読み取れない（${normalized}）`);
  }
}
