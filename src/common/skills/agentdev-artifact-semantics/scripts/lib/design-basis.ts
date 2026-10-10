// 設計責務判定（design basis）。
//
// 成果物の意味と工程別正式確定の要件（本コンポーネントの sidecar を正とする）のうち、
// 次の3点を実現する判定器である:
// - 設計責務の成立は独立 Design 文書の存在に一律依存しないこと
// - 独立設計書を必須成果物として採用した場合の欠落検出
// - コードや設定の存在、対応宣言の存在だけを根拠に設計の妥当性を合格としないこと
//
// 決定的に判定する範囲としない範囲を明確に分離する:
// - 判定する範囲: 設計根拠宣言の存在、宣言参照先成果物の実在、採用規約に基づく
//   根拠の種別（独立設計書 / 代替成果物）と欠落
// - 判定しない範囲: 設計内容の妥当性そのもの。designValidity は常に
//   not-evaluated-by-this-tool を返す。宣言が confirmed であっても妥当性確認は
//   別の手続き（設計内容と根拠を確認する閉じた意味判断）に属し、対応宣言の存在や
//   参照先成果物の存在を妥当性の合格根拠にしない構造保証である

import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { normalizeArtifactPath } from "./cli_utils.ts";
import type { ArtifactSemanticsConventions } from "./conventions.ts";
import { parseRequirementCoverageReport } from "./coverage-report.ts";

export const INDEPENDENT_DESIGN_DIR_PREFIX = "docs/designs/";

export type DesignBasisStatus = "confirmed" | "missing";

export type DesignBasisKind = "independent-design" | "alternative-artifact";

export type DesignBasisMissingReason =
  | "no-design-basis-declaration"
  | "declared-artifact-not-found"
  | "alternative-basis-not-allowed-by-conventions";

export interface DesignDeclarationRef {
  readonly file: string;
  readonly line: number;
}

export interface DesignBasisAssessment {
  readonly reqId: string;
  readonly adoptionSource: ArtifactSemanticsConventions["source"];
  readonly independentDesignRequired: boolean;
  readonly alternativeDesignBasisAllowed: boolean;
  readonly independentDesignDeclarations: readonly DesignDeclarationRef[];
  readonly alternativeDesignDeclarations: readonly DesignDeclarationRef[];
  /** 宣言はあるが参照先成果物が実在せず根拠として数えられなかった宣言。 */
  readonly unresolvedDeclarations: readonly DesignDeclarationRef[];
  readonly designBasis: DesignBasisStatus;
  readonly basisKind?: DesignBasisKind;
  readonly missingReason?: DesignBasisMissingReason;
  /**
   * 設計妥当性は本判定器の出力対象外。対応宣言や参照先成果物の
   * 存在を根拠に妥当性を合格としない。妥当性確認は別手続きに属する。
   */
  readonly designValidity: "not-evaluated-by-this-tool";
}

export class DesignBasisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DesignBasisError";
  }
}

function isIndependentDesignArtifact(file: string): boolean {
  return normalizeArtifactPath(file).startsWith(INDEPENDENT_DESIGN_DIR_PREFIX);
}

function artifactExists(root: string, file: string): boolean {
  const normalized = normalizeArtifactPath(file);
  try {
    return statSync(join(root, normalized)).isFile();
  } catch {
    return false;
  }
}

export function assessDesignBasis(
  root: string,
  coverageReportJson: string,
  conventions: ArtifactSemanticsConventions,
): DesignBasisAssessment {
  const report = parseRequirementCoverageReport(coverageReportJson);
  if (!existsSync(join(root, "docs", "requirements"))) {
    throw new DesignBasisError("現行要件の配置（docs/requirements）が見つからない。--root を確認すること");
  }

  const designDecls = report.relations.filter((r) => r.role === "design");
  const independentDecls: DesignDeclarationRef[] = [];
  const alternativeDecls: DesignDeclarationRef[] = [];
  const unresolvedDecls: DesignDeclarationRef[] = [];
  for (const decl of designDecls) {
    if (!artifactExists(root, decl.file)) {
      unresolvedDecls.push({ file: decl.file, line: decl.line });
      continue;
    }
    if (isIndependentDesignArtifact(decl.file)) {
      independentDecls.push({ file: decl.file, line: decl.line });
    } else {
      alternativeDecls.push({ file: decl.file, line: decl.line });
    }
  }

  let designBasis: DesignBasisStatus;
  let basisKind: DesignBasisKind | undefined;
  let missingReason: DesignBasisMissingReason | undefined;
  if (independentDecls.length > 0) {
    designBasis = "confirmed";
    basisKind = "independent-design";
  } else if (alternativeDecls.length > 0) {
    if (conventions.alternativeDesignBasisAllowed) {
      designBasis = "confirmed";
      basisKind = "alternative-artifact";
    } else {
      designBasis = "missing";
      missingReason = "alternative-basis-not-allowed-by-conventions";
    }
  } else if (unresolvedDecls.length > 0) {
    // 宣言は存在するが参照先成果物が実在しない。宣言の存在だけを根拠に合格にしない
    designBasis = "missing";
    missingReason = "declared-artifact-not-found";
  } else {
    designBasis = "missing";
    missingReason = "no-design-basis-declaration";
  }

  return {
    reqId: report.reqId,
    adoptionSource: conventions.source,
    independentDesignRequired: conventions.independentDesignRequired,
    alternativeDesignBasisAllowed: conventions.alternativeDesignBasisAllowed,
    independentDesignDeclarations: independentDecls,
    alternativeDesignDeclarations: alternativeDecls,
    unresolvedDeclarations: unresolvedDecls,
    designBasis,
    ...(basisKind !== undefined ? { basisKind } : {}),
    ...(missingReason !== undefined ? { missingReason } : {}),
    designValidity: "not-evaluated-by-this-tool",
  };
}
