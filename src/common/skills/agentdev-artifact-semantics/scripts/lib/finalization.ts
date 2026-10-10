// 工程別正式確定の判定（finalization）。
//
// 成果物の意味と工程別正式確定の要件（本コンポーネントの sidecar を正とする）のうち、
// 次の2点を実現する判定器である:
// - 各工程の成果物は、当該工程の要求充足、上流整合、必要な検証の成立をもって、
//   後続工程を待たずに正式確定できること
// - 正式確定と最終的な要求充足は別判定であり、設計成果物の正式確定をもって
//   最終的な要求充足済みと判定しないこと
//
// 正式確定の判定条件（決定的に確認できるもの）:
// 1. 成果物が実在する
// 2. 成果物が当該工程の意味役割を所有する（自らの宣言または配置規約で解決できる）
// 3. 上流整合: 指定した上流要求行が現行要件として存在し、かつ成果物への対応宣言が
//    存在する（対応宣言の解析は agentdev-traceability coverage の消費）
// 4. 必要な検証の成立: 指定した検証根拠が実在し、検証の意味役割を持つ
//
// 正式確定は後続工程の成果物（例: 実装成果物）を要求しない。
// requirementSatisfaction は常に not-assessed-by-this-tool を返す。正式確定と最終的な
// 要求充足の別判定の構造保証であり、本判定器は確定から要求充足を導出しない。

import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { normalizeArtifactPath } from "./cli_utils.ts";
import { parseArtifactCoverageReport } from "./coverage-report.ts";
import { assessArtifactRoles, type ArtifactRole } from "./roles.ts";
import { currentRequirementLineIds } from "../../../agentdev-traceability/scripts/lib/requirements.ts";

export interface UpstreamAlignment {
  readonly requested: readonly string[];
  readonly aligned: readonly string[];
  readonly unaligned: readonly string[];
  /** 現行要件行として存在しない上流参照。unaligned の理由内訳。 */
  readonly unknownRequirementLines: readonly string[];
  /** 対応宣言が存在しない上流参照。unaligned の理由内訳。 */
  readonly undeclaredRelations: readonly string[];
}

export interface VerificationEvidence {
  readonly requested: readonly string[];
  readonly resolved: readonly string[];
  readonly missing: readonly string[];
}

export interface FinalizationAssessment {
  readonly artifact: string;
  readonly phase: ArtifactRole;
  readonly artifactExists: boolean;
  readonly artifactRoles: readonly ArtifactRole[];
  /** 成果物が当該工程の意味役割を所有するか。 */
  readonly roleOwned: boolean;
  readonly upstreamAlignment: UpstreamAlignment;
  readonly verificationEvidence: VerificationEvidence;
  readonly finalized: boolean;
  /**
   * 最終的な要求充足の判定。正式確定をもって要求充足済みと
   * 判定しない構造保証。要求充足の最終判定は後続工程（実装・検証）の結果を
   * 入力に別手続きで行う。
   */
  readonly requirementSatisfaction: {
    readonly status: "not-assessed-by-this-tool";
    readonly reason: string;
  };
}

// phase に使える役割の集合。成果物役割と同一の語彙である。
export const ARTIFACT_PHASES: readonly ArtifactRole[] = [
  "requirement",
  "decision",
  "design",
  "implementation",
  "verification",
];

export class FinalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinalizationError";
  }
}

function fileExists(root: string, file: string): boolean {
  const normalized = normalizeArtifactPath(file);
  try {
    return statSync(join(root, normalized)).isFile();
  } catch {
    return false;
  }
}

export function assessFinalization(
  root: string,
  artifact: string,
  phase: ArtifactRole,
  upstream: readonly string[],
  verification: readonly string[],
  artifactCoverageReportJson: string,
): FinalizationAssessment {
  if (!existsSync(join(root, "docs", "requirements"))) {
    throw new FinalizationError("現行要件の配置（docs/requirements）が見つからない。--root を確認すること");
  }
  if (!ARTIFACT_PHASES.includes(phase)) {
    throw new FinalizationError(
      `phase は成果物役割の1つであること（既知: ${ARTIFACT_PHASES.join(", ")}）`,
    );
  }

  const normalizedArtifact = normalizeArtifactPath(artifact);
  const artifactExists = fileExists(root, normalizedArtifact);
  let artifactRoles: readonly ArtifactRole[] = [];
  if (artifactExists) {
    const assessment = assessArtifactRoles(root, normalizedArtifact);
    artifactRoles = assessment.roles;
  }

  const coverage = parseArtifactCoverageReport(artifactCoverageReportJson);
  const coverageArtifact = normalizeArtifactPath(coverage.artifact);
  if (coverageArtifact !== normalizedArtifact) {
    throw new FinalizationError(
      `coverage 報告の成果物（${coverageArtifact}）が対象成果物（${normalizedArtifact}）と一致しない。--artifact を coverage --artifact と同一にして coverage 報告を再生成すること`,
    );
  }
  const declaredReqIds = new Set(coverage.relations.map((r) => r.reqId));

  const currentReqLines = new Set(currentRequirementLineIds(root));
  const aligned: string[] = [];
  const unknownRequirementLines: string[] = [];
  const undeclaredRelations: string[] = [];
  for (const reqId of upstream) {
    if (!currentReqLines.has(reqId)) {
      unknownRequirementLines.push(reqId);
      continue;
    }
    if (!declaredReqIds.has(reqId)) {
      undeclaredRelations.push(reqId);
      continue;
    }
    aligned.push(reqId);
  }

  const resolvedVerification: string[] = [];
  const missingVerification: string[] = [];
  for (const path of verification) {
    const normalized = normalizeArtifactPath(path);
    if (!fileExists(root, normalized)) {
      missingVerification.push(normalized);
      continue;
    }
    const roles = assessArtifactRoles(root, normalized).roles;
    if (!roles.includes("verification")) {
      missingVerification.push(normalized);
      continue;
    }
    resolvedVerification.push(normalized);
  }

  const roleOwned = artifactRoles.includes(phase);
  const finalized =
    artifactExists &&
    roleOwned &&
    upstream.length > 0 &&
    unknownRequirementLines.length === 0 &&
    undeclaredRelations.length === 0 &&
    verification.length > 0 &&
    missingVerification.length === 0;

  return {
    artifact: normalizedArtifact,
    phase,
    artifactExists,
    artifactRoles,
    roleOwned,
    upstreamAlignment: {
      requested: [...upstream],
      aligned,
      unaligned: [...unknownRequirementLines, ...undeclaredRelations],
      unknownRequirementLines,
      undeclaredRelations,
    },
    verificationEvidence: {
      requested: verification.map((p) => normalizeArtifactPath(p)),
      resolved: resolvedVerification,
      missing: missingVerification,
    },
    finalized,
    requirementSatisfaction: {
      status: "not-assessed-by-this-tool",
      reason:
        "正式確定と最終的な要求充足は別判定である。本判定器は工程成果物の正式確定のみを判定し、確定をもって最終的な要求充足済みと判定しない。要求充足の最終判定は後続工程の結果を入力に別手続きで行う",
    },
  };
}
