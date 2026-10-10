// 採用規約（採用済み工程・工程間関係・必須成果物）の宣言 schema 型と検証。
// v5 採用規約機構 Design（docs/designs/foundations/v5-adopted-conventions.md）の
// 実装側（機械的解決器）。
//
// - 採用規約は宣言的である。参照モデルの工程を既定で必須化せず、
//   採用されていない工程・成果物は判定基準に含まれない
// - 工程構成の説明（プロセスモデル: processes）と対象システムの成果物の所在
//   （requiredArtifacts）は別のトップレベルキーで分離し、混同しない
// - 工程（プロセスモデル）と対象システムの設計内容は別の関心として区別する。
//   本 schema はプロセスモデル側のみを宣言対象とし、設計内容を所有しない
// - 工程・成果物の分割・統合（再構成）では、元の要求・制約・受け入れ条件・
//   検証義務の継承宣言を必須とする（fail-closed。継承宣言なしの再構成は schema 違反）
// - schema 不適合・未知キーを黙って読み飛ばさない（silent skip 禁止）

/** 採用宣言の version 固定値。schema 変更時は後方互換の判断を伴う別 version とする。 */
export const CONVENTIONS_VERSION = "adopted-conventions-v1";

/** 採用宣言の既定配置先（対象プロジェクト root からの相対パス）。 */
export const DEFAULT_DECLARATION_PATH = ".agentdev/adopted-conventions.yaml";

/** 元の工程から再構成後の工程へ継承される義務（要求・制約・受け入れ条件・検証義務）。 */
export interface InheritedObligations {
  readonly requirements: readonly string[];
  readonly constraints: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly verificationObligations: readonly string[];
}

/** 採用済み工程。requires で工程間関係（順序・依存）を宣言する。 */
export interface AdoptedProcess {
  readonly id: string;
  readonly title?: string;
  /** 前置工程（この工程の開始前に完了が前提となる採用済み工程の id）。 */
  readonly requires: readonly string[];
  /** 分割・統合の元となった工程の id。指定時は inheritsObligations が必須。 */
  readonly restructuredFrom: readonly string[];
  /** 再構成元の工程から継承する義務。 */
  readonly inheritsObligations: InheritedObligations | null;
}

/** 採用済み工程の必須成果物。path は対象プロジェクト root からの相対パス。 */
export interface RequiredArtifact {
  readonly process: string;
  readonly path: string;
  readonly purpose?: string;
}

/** 根拠のある除外宣言（採用規約上の採用外・省略の明示）。 */
export interface Exclusion {
  readonly process: string;
  readonly artifact: string;
  readonly reason: string;
}

/** 採用宣言（採用規約の正規保存形式）。 */
export interface AdoptedConventions {
  readonly version: string;
  /** 採用の適用開始点（ISO 8601 日付文字列）。 */
  readonly adoptedAt: string;
  readonly processes: readonly AdoptedProcess[];
  readonly requiredArtifacts: readonly RequiredArtifact[];
  readonly exclusions: readonly Exclusion[];
}

export interface SchemaIssue {
  /** 違反箇所の schema path（例: processes[0].requires[1]）。 */
  readonly path: string;
  readonly text?: string;
  readonly detail: string;
}

export interface ConventionsValidationResult {
  readonly declarations: AdoptedConventions | null;
  readonly issues: readonly SchemaIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/** 未知キーの検出（silent skip 禁止）。 */
function checkUnknownKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: SchemaIssue[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      issues.push({ path, text: key, detail: `未知のキー（許容キーは ${allowed.join(" / ")} のみ）` });
    }
  }
}

/** 継承義務の検証（分割・統合時は継承宣言が必須。空宣言は義務喪失として拒否する）。 */
function parseObligations(value: unknown, path: string, issues: SchemaIssue[]): InheritedObligations | null {
  if (!isRecord(value)) {
    issues.push({ path, detail: "継承義務は requirements / constraints / acceptanceCriteria / verificationObligations のオブジェクト" });
    return null;
  }
  checkUnknownKeys(value, ["requirements", "constraints", "acceptanceCriteria", "verificationObligations"], path, issues);
  const obligations: { requirements: string[]; constraints: string[]; acceptanceCriteria: string[]; verificationObligations: string[] } = {
    requirements: [],
    constraints: [],
    acceptanceCriteria: [],
    verificationObligations: [],
  };
  for (const key of ["requirements", "constraints", "acceptanceCriteria", "verificationObligations"] as const) {
    const entry = value[key];
    if (entry === undefined) continue;
    if (!isStringArray(entry) || entry.some((s) => !isNonEmptyString(s))) {
      issues.push({ path: `${path}.${key}`, detail: "非空文字列の配列" });
      continue;
    }
    obligations[key] = [...entry];
  }
  if (obligations.requirements.length === 0 && obligations.constraints.length === 0 && obligations.acceptanceCriteria.length === 0 && obligations.verificationObligations.length === 0) {
    issues.push({ path, detail: "継承義務が空である（分割・統合では元の要求・制約・受け入れ条件・検証義務の継承宣言が必須。空宣言は義務喪失として拒否する）" });
    return null;
  }
  return obligations;
}

function parseProcess(value: unknown, path: string, issues: SchemaIssue[]): AdoptedProcess | null {
  if (!isRecord(value)) {
    issues.push({ path, detail: "工程はオブジェクト" });
    return null;
  }
  checkUnknownKeys(value, ["id", "title", "requires", "restructuredFrom", "inheritsObligations"], path, issues);
  const id = value["id"];
  if (!isNonEmptyString(id)) {
    issues.push({ path: `${path}.id`, detail: "必須の非空文字列" });
    return null;
  }
  const titleRaw = value["title"];
  if (titleRaw !== undefined && !isNonEmptyString(titleRaw)) {
    issues.push({ path: `${path}.title`, detail: "非空文字列" });
  }
  const title = isNonEmptyString(titleRaw) ? titleRaw : undefined;
  const requiresRaw = value["requires"];
  if (requiresRaw !== undefined && (!isStringArray(requiresRaw) || requiresRaw.some((s) => !isNonEmptyString(s)))) {
    issues.push({ path: `${path}.requires`, detail: "非空文字列の配列（前置工程の id）" });
  }
  const requires = isStringArray(requiresRaw) && requiresRaw.every((s) => isNonEmptyString(s)) ? requiresRaw : [];
  const restructuredFromRaw = value["restructuredFrom"];
  if (restructuredFromRaw !== undefined && (!isStringArray(restructuredFromRaw) || restructuredFromRaw.some((s) => !isNonEmptyString(s)))) {
    issues.push({ path: `${path}.restructuredFrom`, detail: "非空文字列の配列（分割・統合元の工程 id）" });
  }
  const restructuredFrom = isStringArray(restructuredFromRaw) && restructuredFromRaw.every((s) => isNonEmptyString(s)) ? restructuredFromRaw : [];
  const restructured = restructuredFrom.length > 0;
  let inheritsObligations: InheritedObligations | null = null;
  const obligations = value["inheritsObligations"];
  if (obligations !== undefined && obligations !== null) {
    inheritsObligations = parseObligations(obligations, `${path}.inheritsObligations`, issues);
  }
  if (restructured && inheritsObligations === null) {
    issues.push({
      path: `${path}.inheritsObligations`,
      text: id,
      detail: "分割・統合の元工程（restructuredFrom）を指定した工程は、元の要求・制約・受け入れ条件・検証義務の継承宣言（inheritsObligations）が必須",
    });
  }
  return {
    id,
    ...(title !== undefined ? { title } : {}),
    requires,
    restructuredFrom,
    inheritsObligations,
  };
}

function parseRequiredArtifact(value: unknown, path: string, issues: SchemaIssue[]): RequiredArtifact | null {
  if (!isRecord(value)) {
    issues.push({ path, detail: "必須成果物はオブジェクト" });
    return null;
  }
  checkUnknownKeys(value, ["process", "path", "purpose"], path, issues);
  const process = value["process"];
  const artifactPath = value["path"];
  const purposeRaw = value["purpose"];
  if (!isNonEmptyString(process)) {
    issues.push({ path: `${path}.process`, detail: "必須の非空文字列（採用済み工程の id）" });
  }
  if (!isNonEmptyString(artifactPath)) {
    issues.push({ path: `${path}.path`, detail: "必須の非空文字列（対象プロジェクト root からの相対パス）" });
  }
  if (purposeRaw !== undefined && !isNonEmptyString(purposeRaw)) {
    issues.push({ path: `${path}.purpose`, detail: "非空文字列（成立条件の説明）" });
  }
  if (!isNonEmptyString(process) || !isNonEmptyString(artifactPath)) return null;
  const purpose = isNonEmptyString(purposeRaw) ? purposeRaw : undefined;
  return {
    process,
    path: artifactPath.replace(/\\/g, "/"),
    ...(purpose !== undefined ? { purpose } : {}),
  };
}

function parseExclusion(value: unknown, path: string, issues: SchemaIssue[]): Exclusion | null {
  if (!isRecord(value)) {
    issues.push({ path, detail: "除外宣言はオブジェクト" });
    return null;
  }
  checkUnknownKeys(value, ["process", "artifact", "reason"], path, issues);
  const process = value["process"];
  const artifact = value["artifact"];
  const reason = value["reason"];
  if (!isNonEmptyString(process)) {
    issues.push({ path: `${path}.process`, detail: "必須の非空文字列（採用済み工程の id）" });
  }
  if (!isNonEmptyString(artifact)) {
    issues.push({ path: `${path}.artifact`, detail: "必須の非空文字列（必須成果物の path）" });
  }
  if (!isNonEmptyString(reason)) {
    issues.push({ path: `${path}.reason`, detail: "必須の非空文字列（採用外・省略の根拠。空の根拠は除外宣言として不成立）" });
  }
  if (!isNonEmptyString(process) || !isNonEmptyString(artifact) || !isNonEmptyString(reason)) return null;
  return { process, artifact: artifact.replace(/\\/g, "/"), reason };
}

/** 採用宣言オブジェクトの schema 検証。不適合箇所を全部収集する（先頭で打ち切らない）。 */
export function validateConventions(value: unknown): ConventionsValidationResult {
  const issues: SchemaIssue[] = [];
  if (!isRecord(value)) {
    return { declarations: null, issues: [{ path: "", detail: "採用宣言はオブジェクト（YAML マッピング）" }] };
  }
  checkUnknownKeys(value, ["version", "adoptedAt", "processes", "requiredArtifacts", "exclusions"], "", issues);
  const version = value["version"];
  if (version !== CONVENTIONS_VERSION) {
    issues.push({ path: "version", text: typeof version === "string" ? version : String(version), detail: `version は ${CONVENTIONS_VERSION} 固定` });
  }
  const adoptedAt = isNonEmptyString(value["adoptedAt"]) ? value["adoptedAt"] : null;
  if (adoptedAt === null) {
    issues.push({ path: "adoptedAt", detail: "必須の非空文字列（採用の適用開始点。ISO 8601 日付）" });
  }
  const processesRaw = value["processes"];
  if (processesRaw !== undefined && !Array.isArray(processesRaw)) {
    issues.push({ path: "processes", detail: "採用済み工程の配列" });
  }
  const requiredArtifactsRaw = value["requiredArtifacts"];
  if (!Array.isArray(requiredArtifactsRaw)) {
    issues.push({ path: "requiredArtifacts", detail: "必須成果物の配列（空配列を許容。採用済み必須成果物がない場合は明示する）" });
  }
  const exclusionsRaw = value["exclusions"];
  if (exclusionsRaw !== undefined && !Array.isArray(exclusionsRaw)) {
    issues.push({ path: "exclusions", detail: "除外宣言の配列" });
  }
  const processes: AdoptedProcess[] = [];
  if (Array.isArray(processesRaw)) {
    for (const [index, entry] of processesRaw.entries()) {
      const process = parseProcess(entry, `processes[${index}]`, issues);
      if (process !== null) processes.push(process);
    }
  }
  const requiredArtifacts: RequiredArtifact[] = [];
  if (Array.isArray(requiredArtifactsRaw)) {
    for (const [index, entry] of requiredArtifactsRaw.entries()) {
      const artifact = parseRequiredArtifact(entry, `requiredArtifacts[${index}]`, issues);
      if (artifact !== null) requiredArtifacts.push(artifact);
    }
  }
  const exclusions: Exclusion[] = [];
  if (Array.isArray(exclusionsRaw)) {
    for (const [index, entry] of exclusionsRaw.entries()) {
      const exclusion = parseExclusion(entry, `exclusions[${index}]`, issues);
      if (exclusion !== null) exclusions.push(exclusion);
    }
  }
  // 参照整合の検証（process id の一意性、参照先の存在、除外対象の存在）
  const processIds = new Set<string>();
  for (const process of processes) {
    if (processIds.has(process.id)) {
      issues.push({ path: `processes`, text: process.id, detail: "工程 id が重複している" });
    }
    processIds.add(process.id);
  }
  for (const process of processes) {
    for (const [index, required] of process.requires.entries()) {
      if (!processIds.has(required)) {
        issues.push({ path: `processes.${process.id}.requires[${index}]`, text: required, detail: "前置工程の id が採用済み工程に存在しない" });
      }
    }
    for (const [index, origin] of process.restructuredFrom.entries()) {
      if (!processIds.has(origin)) {
        issues.push({ path: `processes.${process.id}.restructuredFrom[${index}]`, text: origin, detail: "分割・統合元の工程 id が採用済み工程に存在しない" });
      }
    }
  }
  for (const [index, artifact] of requiredArtifacts.entries()) {
    if (!processIds.has(artifact.process)) {
      issues.push({ path: `requiredArtifacts[${index}].process`, text: artifact.process, detail: "参照先の工程 id が採用済み工程に存在しない" });
    }
  }
  const artifactKeys = new Set(requiredArtifacts.map((a) => `${a.process}\n${a.path}`));
  for (const [index, exclusion] of exclusions.entries()) {
    if (!artifactKeys.has(`${exclusion.process}\n${exclusion.artifact}`)) {
      issues.push({ path: `exclusions[${index}]`, text: `${exclusion.process}:${exclusion.artifact}`, detail: "除外対象が必須成果物（requiredArtifacts）に存在しない。採用外・省略の明示は必須成果物の宣言に対してのみ成立する" });
    }
  }
  if (issues.length > 0 || adoptedAt === null) {
    return { declarations: null, issues };
  }
  return {
    declarations: {
      version: CONVENTIONS_VERSION,
      adoptedAt,
      processes,
      requiredArtifacts,
      exclusions,
    },
    issues: [],
  };
}
