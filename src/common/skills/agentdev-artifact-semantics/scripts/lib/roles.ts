// 成果物の意味役割（artifact role）の決定的判定。
//
// 成果物の意味と工程別正式確定の要件（本コンポーネントの sidecar を正とする）のうち、
// 次の2点を実現する:
// - 要求・Decision・設計・実装・検証の意味が区別され、各工程の成果物が自らの意味を
//   所有すること
// - 同じファイルが設計と実装の双方の役割を担う場合、役割ごとの別ファイルを必須とせず、
//   必要な検証を行えること
//
// 判定経路は2段で決定的とする:
// 1. 成果物の自らの宣言（frontmatter `artifact_roles`）
// 2. 配置規約による既定役割（正解が確実な配置のみ。誤った役割を導出しない）
//
// どちらの経路でも解決できない成果物は unclassified として報告する（誤解決しない、
// fail-closed）。

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const ARTIFACT_ROLES = [
  "requirement",
  "decision",
  "design",
  "implementation",
  "verification",
] as const;

export type ArtifactRole = (typeof ARTIFACT_ROLES)[number];

export const ARTIFACT_ROLE_LABELS: Readonly<Record<ArtifactRole, string>> = {
  requirement: "要求（満たすべき条件）",
  decision: "重要判断と理由",
  design: "設計（実現方式）",
  implementation: "実装（実体）",
  verification: "検証（方法と証拠）",
};

export const DECLARED_ROLES_FIELD = "artifact_roles";

// 配置規約による既定役割。現行実効運用の配置契約（文書種別責務・配置基準）のうち、
// 配置から正解が決定的に導けるものだけを登録する。実装・検証成果物の多くは配置から
// 一意に導けないため（同一パスで実装と検証が混在し得る）、ここには置かない。
// 各成果物は frontmatter 宣言で自らの意味を所有する（第一経路）。
const PATH_ROLE_RULES: readonly { prefix: string; role: ArtifactRole }[] = [
  { prefix: "docs/requirements/", role: "requirement" },
  { prefix: "docs/decisions/", role: "decision" },
  { prefix: "docs/designs/", role: "design" },
];

// 検証手段（verification）の決定的配置。テストファイルの標準配置規約。
const VERIFICATION_FILE_SUFFIX = ".test.ts";
const VERIFICATION_DIRS = ["tests/", "test/"];

export interface RoleAssessment {
  readonly file: string;
  /** frontmatter 宣言（artifact_roles）。宣言が無い場合は null。 */
  readonly declaredRoles: readonly ArtifactRole[] | null;
  /** 配置規約から導出した既定役割。 */
  readonly derivedRoles: readonly ArtifactRole[];
  /** 最終採用役割（宣言優先。宣言が無ければ導出。解決不能は空配列）。 */
  readonly roles: readonly ArtifactRole[];
  /** 宣言・配置規約のいずれでも解決できなかった場合 true（誤解決しない fail-closed 報告）。 */
  readonly unclassified: boolean;
  /** 役割ごとの意味（5つの意味境界の対比表）。 */
  readonly roleNotes: Readonly<Record<ArtifactRole, string>>;
}

export class RoleAssessmentError extends Error {
  constructor(
    message: string,
    readonly file: string,
  ) {
    super(message);
    this.name = "RoleAssessmentError";
  }
}

function extractDeclaredRoles(content: string, file: string): readonly ArtifactRole[] | null {
  // frontmatter の解析は単純 scalar 行のサブセットに限定する（既存成果物の
  // frontmatter は複数行プレーンスカラー等の完全 YAML 解析に耐えない値を含み得る）。
  // 本判定器が注目するのは artifact_roles の1キーのみであり、その他のキーの
  // 解析を行わないことで既存成果物の形式差異に影響されない。
  const normalized = content.replace(/^\uFEFF/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(normalized);
  const block = match?.[1];
  if (block === undefined) return null;
  for (const line of block.split(/\r?\n/)) {
    const m = /^artifact_roles:\s*(.*)$/.exec(line);
    if (!m) continue;
    const raw = m[1]?.trim() ?? "";
    if (raw === "") {
      throw new RoleAssessmentError(
        `${DECLARED_ROLES_FIELD} 宣言が空である。宣言しない（フィールドを置かない）か、1つ以上の役割を宣言すること`,
        file,
      );
    }
    const inner = raw.startsWith("[") && raw.endsWith("]") ? raw.slice(1, -1) : raw;
    const labels = inner
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const roles: ArtifactRole[] = [];
    for (const entry of labels) {
      const role = ARTIFACT_ROLES.find((r) => r === entry);
      if (!role) {
        throw new RoleAssessmentError(
          `宣言された役割「${entry}」は既知の役割ではない（既知: ${ARTIFACT_ROLES.join(", ")}）。誤解決しないため宣言を不合格にする`,
          file,
        );
      }
      if (!roles.includes(role)) roles.push(role);
    }
    if (roles.length === 0) {
      throw new RoleAssessmentError(
        `${DECLARED_ROLES_FIELD} 宣言が空である。宣言しない（フィールドを置かない）か、1つ以上の役割を宣言すること`,
        file,
      );
    }
    return roles;
  }
  return null;
}

function derivedRolesFrom(file: string): readonly ArtifactRole[] {
  const normalized = file.replaceAll("\\", "/");
  const roles: ArtifactRole[] = [];
  for (const rule of PATH_ROLE_RULES) {
    if (normalized.startsWith(rule.prefix) && !roles.includes(rule.role)) roles.push(rule.role);
  }
  if (normalized.endsWith(VERIFICATION_FILE_SUFFIX)) {
    if (!roles.includes("verification")) roles.push("verification");
  }
  for (const dir of VERIFICATION_DIRS) {
    if (normalized.split("/").slice(0, -1).some((part) => part === dir.replace("/", ""))) {
      if (!roles.includes("verification")) roles.push("verification");
    }
  }
  return roles;
}

export function assessArtifactRoles(root: string, file: string): RoleAssessment {
  const normalizedFile = file.replaceAll("\\", "/").replace(/^\.\//, "");
  let declaredRoles: readonly ArtifactRole[] | null;
  try {
    const content = readFileSync(join(root, normalizedFile), "utf-8");
    declaredRoles = extractDeclaredRoles(content, normalizedFile);
  } catch (error) {
    if (error instanceof RoleAssessmentError) throw error;
    const detail = error instanceof Error ? error.message : "unknown error";
    throw new RoleAssessmentError(`成果物を読み取れない（${normalizedFile}）: ${detail}`, normalizedFile);
  }
  const derivedRoles = derivedRolesFrom(normalizedFile);
  const roles = declaredRoles ?? derivedRoles;
  return {
    file: normalizedFile,
    declaredRoles,
    derivedRoles,
    roles,
    unclassified: roles.length === 0,
    roleNotes: ARTIFACT_ROLE_LABELS,
  };
}
