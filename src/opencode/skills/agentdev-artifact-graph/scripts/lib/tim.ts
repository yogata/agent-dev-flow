/**
 * TIM (Traceability Information Model) semantic catalog.
 *
 * REQ-{NNNN}-{NNN}: TIM is the canonical logical model for artifact
 * traceability. The Artifact Graph is a regenerable derived index built from
 * TIM-based traceability information; its physical storage format is NOT the
 * TIM itself.
 *
 * REQ-{NNNN}-{NNN}: artifact types and trace link types adopt vocabulary
 * established by SysML, OSLC, OpenFastTrace (and Dublin Core where a precise
 * match exists) before defining ADF-specific terms. ADF-specific relations are
 * added only when standard vocabulary cannot express the required meaning.
 *
 * REQ-{NNNN}-{NNN}: `decision` is an ADF-specific artifact type extension on
 * the TIM. No decision-specific relation type is added unconditionally;
 * Decision relations reuse the standard relation types below.
 *
 * REQ-{NNNN}-{NNN}: exploration direction and participation for
 * purpose-specific queries are DERIVED from the relation meaning declared
 * here. Link direction (source→target as described) and change impact
 * direction are distinct.
 *
 * 影響方向の値体系と標準5関係型への割当ては TIM 語彙カタログ SPEC
 * （docs/specs/<foundations/traceability-model>.md）が正規所有する。本テーブルは
 * その in-code 反映であり、augmentation で再定義できない。
 */

// ─── Change impact direction (REQ-{NNNN}-{NNN}) ────────────────────────────────

/**
 * Change impact direction of a trace link, relative to its described direction
 * (source→target). Impact direction is never inferred from link direction.
 *
 * - forward: source change impacts target
 * - backward: target change impacts source
 * - bidirectional: changes impact both ends
 * - none: the link carries no change impact semantics
 */
export const CHANGE_IMPACT_DIRECTIONS = ["forward", "backward", "bidirectional", "none"] as const
export type ChangeImpactDirection = (typeof CHANGE_IMPACT_DIRECTIONS)[number]

// ─── Semantics slots (REQ-{NNNN}-{NNN} meaning families) ───────────────────────

/**
 * Meaning slots established by standard traceability vocabulary. Relations map
 * to one slot when a standard meaning applies; genuinely ADF-specific meanings
 * may omit the slot (meaning text + impact direction are still required).
 */
export const SEMANTICS_SLOTS = [
  "general_reference", // 一般参照 (SysML «trace»)
  "supersede", // 置換・改訂 (Dublin Core dct:replaces)
  "decompose", // 分解 (SysML containment / OSLC decomposedBy)
  "refine", // 具体化 (SysML «refine»)
  "specify", // 仕様化・定義所在 (OSLC specifiedBy family)
  "constrain", // 制約 (OSLC constrainedBy)
  "depend", // 依存 (UML/SysML dependency)
  "realize", // 実現 (UML «realize»)
  "satisfy", // 充足 (SysML «satisfy»)
  "implement", // 実装 (OpenFastTrace impl coverage)
  "verify", // 検証 (SysML «verify»)
  "validate", // 妥当性確認 (OSLC validatedBy)
] as const
export type SemanticsSlot = (typeof SEMANTICS_SLOTS)[number]

/**
 * Slots whose traversal for the dependency profile follows the described link
 * direction (source depends on target).
 */
const DEPENDENCY_FORWARD_SLOTS: ReadonlySet<SemanticsSlot> = new Set([
  "decompose", // parent decomposition completeness depends on children
  "specify", // artifact depends on the file that defines it
  "refine", // refinement depends on the refined base
  "constrain", // constrained artifact depends on its constraint
  "depend", // direct dependency
])

/**
 * Slots whose traversal for the dependency profile runs against the described
 * link direction (link points from realization to requirement; the requirement
 * depends on the realization/verification artifacts).
 */
const DEPENDENCY_REVERSE_SLOTS: ReadonlySet<SemanticsSlot> = new Set([
  "realize",
  "satisfy",
  "implement",
  "verify",
  "validate",
])

/** Slots participating in the implementation profile (実現・実装・充足系列). */
export const IMPLEMENTATION_SLOTS: ReadonlySet<SemanticsSlot> = new Set([
  "realize",
  "satisfy",
  "implement",
])

// ─── Relation semantics definition ─────────────────────────────────────────────

/**
 * Required semantic information for a trace link type. Extension relation types
 * that want to participate in purpose-specific (high-level) queries MUST
 * declare this information explicitly (REQ-{NNNN}-{NNN}, REQ-{NNNN}-{NNN}).
 * Meaning is never inferred from relation type names or via LLM estimation.
 */
export type RelationSemantics = {
  /** Human-readable meaning of the link (Japanese). */
  readonly meaning: string
  /** Standard meaning slot; omitted only for genuinely ADF-specific meanings. */
  readonly semantics_slot?: SemanticsSlot
  /** Change impact direction relative to the described source→target direction. */
  readonly change_impact_direction: ChangeImpactDirection
  /** Standard vocabulary this type adopts (traceability of adoption, REQ-{NNNN}-{NNN}). */
  readonly standard_vocabulary: readonly string[]
  /**
   * Relation constraints (REQ-{NNNN}-{NNN}): allowed source/target artifact
   * types. Absent means unconstrained.
   */
  readonly source_types?: readonly string[]
  readonly target_types?: readonly string[]
}

/** Traversal orientation used by a profile at a link. */
export type TraversalOrientation = "forward" | "reverse"

export type ProfileParticipation = {
  /** related profile: any explicitly linked candidate (traces + general references). */
  readonly related: boolean
  readonly impact: boolean
  readonly dependency: readonly TraversalOrientation[]
  readonly implementation: readonly TraversalOrientation[]
}

/**
 * Derive purpose-specific query participation from the declared relation
 * meaning (REQ-{NNNN}-{NNN}). Participation is not declared per query.
 */
export function deriveProfileParticipation(semantics: RelationSemantics): ProfileParticipation {
  const slot = semantics.semantics_slot
  const dependency: TraversalOrientation[] = []
  const implementation: TraversalOrientation[] = []
  if (slot !== undefined) {
    if (DEPENDENCY_FORWARD_SLOTS.has(slot)) dependency.push("forward")
    if (DEPENDENCY_REVERSE_SLOTS.has(slot)) dependency.push("reverse")
    if (IMPLEMENTATION_SLOTS.has(slot)) implementation.push("reverse")
  }
  return {
    related: true,
    impact: semantics.change_impact_direction !== "none",
    dependency,
    implementation,
  }
}

// ─── Default trace link type catalog (standard core) ───────────────────────────

/**
 * Semantics for the 5 standard core relation types. These meanings are owned by
 * the TIM vocabulary catalog (docs/specs/<foundations/traceability-model>.md);
 * project augmentation cannot redefine them.
 */
export const DEFAULT_RELATION_SEMANTICS: Readonly<Record<string, RelationSemantics>> = {
  references: {
    meaning: "一般的文書参照。変更影響・依存・実現・充足・検証の意味を持たない",
    semantics_slot: "general_reference",
    change_impact_direction: "none",
    standard_vocabulary: ["SysML «trace»"],
  },
  supersedes: {
    meaning: "後継成果物が先行成果物を置換・改訂する。置換後の旧成果物は凍結され、新旧の間で変更は波及しない",
    semantics_slot: "supersede",
    change_impact_direction: "none",
    standard_vocabulary: ["Dublin Core dct:replaces"],
  },
  defined_in: {
    meaning: "成果物の定義が当該ファイルに存在する。ファイルの変更は定義済み成果物に影響する",
    semantics_slot: "specify",
    change_impact_direction: "backward",
    standard_vocabulary: ["OSLC specifiedBy（定義所在の意味近似）"],
  },
  contains: {
    meaning: "分解関係。コンテナと被包含成果物は変更影響を双方向に受けうる",
    semantics_slot: "decompose",
    change_impact_direction: "bidirectional",
    standard_vocabulary: ["SysML requirement containment", "OSLC decomposedBy"],
  },
  extends: {
    meaning: "拡張成果物が基盤成果物の適用範囲を追加定義で広げる。基盤の変更は拡張へ波及し、拡張の変更は拡張の妥当性を変える",
    semantics_slot: "refine",
    change_impact_direction: "bidirectional",
    standard_vocabulary: ["UML «extend»"],
  },
}

// ─── Artifact type catalog ─────────────────────────────────────────────────────

/** Roles an artifact type can carry (REQ-{NNNN}-{NNN}: role, not name, identifies index/aggregation artifacts). */
export const NODE_TYPE_ROLES = ["index", "aggregation"] as const
export type NodeTypeRole = (typeof NODE_TYPE_ROLES)[number]

/**
 * Origin of an artifact type on the TIM. `standard` types map to established
 * vocabulary; `adf` types are ADF-specific extensions (REQ-{NNNN}-{NNN},
 * REQ-{NNNN}-{NNN}).
 */
export type ArtifactTypeOrigin = "standard" | "adf"

export type ArtifactTypeSemantics = {
  readonly origin: ArtifactTypeOrigin
  readonly standard_vocabulary: readonly string[]
  readonly role?: NodeTypeRole
}

/**
 * Standard core artifact types. `decision` is an ADF-specific TIM extension
 * (REQ-{NNNN}-{NNN}): it reuses standard relation types and adds no
 * decision-specific relation type.
 */
export const DEFAULT_ARTIFACT_TYPE_SEMANTICS: Readonly<Record<string, ArtifactTypeSemantics>> = {
  requirement: {
    origin: "standard",
    standard_vocabulary: ["SysML «requirement»", "OSLC Requirement", "OpenFastTrace requirement"],
  },
  decision: {
    origin: "adf",
    standard_vocabulary: [],
  },
  specification: {
    origin: "standard",
    standard_vocabulary: ["OSLC Specification"],
  },
}

// ─── Trace Query profiles (REQ-{NNNN}-{NNN}) ───────────────────────────────────

/** 高位問い合わせ（Trace Query）のプロファイル種別。diagnostics は構造診断を担う。 */
export type ProfileKind = "related" | "impact" | "dependency" | "implementation" | "diagnostics"

export const PROFILE_KINDS: readonly ProfileKind[] = [
  "related",
  "impact",
  "dependency",
  "implementation",
  "diagnostics",
]

// ─── Query settings (REQ-{NNNN}-{NNN}/007) ─────────────────────────────────────

/** augmentation の問い合わせ設定（query_settings）のスキーマ。 */
export type QuerySettingsSpec = {
  readonly limits?: Readonly<Record<string, number>>
  readonly depths?: Readonly<Record<string, number>>
  readonly concentration_threshold?: number
}

/**
 * 標準問い合わせ設定 (REQ-{NNNN}-{NNN}/007)。候補数上限はコードへ直書きせず
 * 問い合わせ設定として管理し、プロジェクト拡張で上書きする。
 * 標準上限値 12 は TIM 語彙カタログ置換後の代表ケース再計測に基づく決定値
 * （AG SPEC「標準候補数上限の決定手順」、Issue #2204）。diagnostics は
 * 構造診断であり候補数上限回帰の対象外としているため決定対象としない。
 */
export const DEFAULT_QUERY_SETTINGS = {
  limits: {
    related: 12,
    impact: 12,
    dependency: 12,
    implementation: 12,
    diagnostics: 50,
  },
  depths: {
    related: 2,
    impact: 2,
    dependency: 2,
    implementation: 3,
    diagnostics: 2,
  },
  concentration_threshold: 20,
} as const

export type QuerySettings = {
  readonly limits: Readonly<Record<ProfileKind, number>>
  readonly depths: Readonly<Record<ProfileKind, number>>
  readonly concentration_threshold: number
}

// ─── Relation constraints (REQ-{NNNN}-{NNN}) ───────────────────────────────────

/** TIM 関係制約（リンク元・リンク先成果物型の組合せ制約）。定義された場合のみ diagnostics が制約違反を判定する。 */
export type RelationConstraintSpec = {
  readonly relation_type: string
  readonly allowed_source_types: readonly string[]
  readonly allowed_target_types: readonly string[]
}

export type RelationConstraint = {
  readonly relationType: string
  readonly allowedSourceTypes: ReadonlySet<string>
  readonly allowedTargetTypes: ReadonlySet<string>
}

// ─── Trace model ───────────────────────────────────────────────────────────────

/**
 * 高位問い合わせ（Trace Query）実行時の解決済みモデル。関係意味・役割は
 * augmentation 解決済み設定（ResolvedConfig）から、問い合わせ設定と関係制約は
 * augmentation から解決する（resolveTraceModel、augmentation.ts）。
 */
export type TraceModel = {
  readonly relationSemantics: ReadonlyMap<string, RelationSemantics>
  readonly nodeRoles: ReadonlyMap<string, NodeTypeRole>
  readonly relationConstraints: readonly RelationConstraint[]
  readonly querySettings: QuerySettings
}

export function isChangeImpactDirection(value: string): value is ChangeImpactDirection {
  return (CHANGE_IMPACT_DIRECTIONS as readonly string[]).includes(value)
}

export function isSemanticsSlot(value: string): value is SemanticsSlot {
  return (SEMANTICS_SLOTS as readonly string[]).includes(value)
}

export function isNodeTypeRole(value: string): value is NodeTypeRole {
  return (NODE_TYPE_ROLES as readonly string[]).includes(value)
}
