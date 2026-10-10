// agentdev-traceability coverage CLI 出力の消費用型。
//
// 本判定器は対応宣言（covers）の解析を所有しない。coverage CLI
// （src/common/skills/agentdev-traceability/scripts/src/coverage.ts）の出力を
// 入力として消費し、宣言の解析そのものは agentdev-traceability が正規所有する。

export type CoverageRelationRole = "decision" | "design" | "implementation" | "verification";

export interface RequirementCoverageRelation {
  readonly role: CoverageRelationRole;
  readonly file: string;
  readonly line: number;
}

export interface RequirementCoverageReport {
  readonly mode: "requirement";
  readonly reqId: string;
  readonly relations: readonly RequirementCoverageRelation[];
}

export interface ArtifactCoverageRelation {
  readonly reqId: string;
  readonly role: CoverageRelationRole;
  readonly line: number;
}

export interface ArtifactCoverageReport {
  readonly mode: "artifact";
  readonly artifact: string;
  readonly relations: readonly ArtifactCoverageRelation[];
}

export class CoverageReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoverageReportError";
  }
}

export function parseRequirementCoverageReport(json: string): RequirementCoverageReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new CoverageReportError(
      `coverage 報告の JSON 解析に失敗した: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new CoverageReportError("coverage 報告がオブジェクトでない");
  }
  const record = parsed as Record<string, unknown>;
  if (record.mode !== "requirement") {
    throw new CoverageReportError(`coverage 報告の mode が requirement でない（${String(record.mode)}）。--req 実行の出力を渡すこと`);
  }
  if (typeof record.reqId !== "string") {
    throw new CoverageReportError("coverage 報告に reqId が無い");
  }
  if (!Array.isArray(record.relations)) {
    throw new CoverageReportError("coverage 報告に relations 配列が無い");
  }
  const relations: RequirementCoverageRelation[] = [];
  for (const entry of record.relations) {
    if (typeof entry !== "object" || entry === null) {
      throw new CoverageReportError("coverage 報告の relations 要素がオブジェクトでない");
    }
    const rel = entry as Record<string, unknown>;
    if (
      (rel.role !== "decision" && rel.role !== "design" && rel.role !== "implementation" && rel.role !== "verification") ||
      typeof rel.file !== "string" ||
      typeof rel.line !== "number"
    ) {
      throw new CoverageReportError("coverage 報告の relations 要素が期待する構造でない（role / file / line）");
    }
    relations.push({ role: rel.role, file: rel.file, line: rel.line });
  }
  return { mode: "requirement", reqId: record.reqId, relations };
}

export function parseArtifactCoverageReport(json: string): ArtifactCoverageReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new CoverageReportError(
      `coverage 報告の JSON 解析に失敗した: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new CoverageReportError("coverage 報告がオブジェクトでない");
  }
  const record = parsed as Record<string, unknown>;
  if (record.mode !== "artifact") {
    throw new CoverageReportError(`coverage 報告の mode が artifact でない（${String(record.mode)}）。--artifact 実行の出力を渡すこと`);
  }
  if (typeof record.artifact !== "string") {
    throw new CoverageReportError("coverage 報告に artifact が無い");
  }
  if (!Array.isArray(record.relations)) {
    throw new CoverageReportError("coverage 報告に relations 配列が無い");
  }
  const relations: ArtifactCoverageRelation[] = [];
  for (const entry of record.relations) {
    if (typeof entry !== "object" || entry === null) {
      throw new CoverageReportError("coverage 報告の relations 要素がオブジェクトでない");
    }
    const rel = entry as Record<string, unknown>;
    if (
      (rel.role !== "decision" && rel.role !== "design" && rel.role !== "implementation" && rel.role !== "verification") ||
      typeof rel.reqId !== "string" ||
      typeof rel.line !== "number"
    ) {
      throw new CoverageReportError("coverage 報告の relations 要素が期待する構造でない（reqId / role / line）");
    }
    relations.push({ reqId: rel.reqId, role: rel.role, line: rel.line });
  }
  return { mode: "artifact", artifact: record.artifact, relations };
}
