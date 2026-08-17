import { join } from "node:path"
import type { ExtractionRule, Manifest } from "./model.ts"
import {
  DEFAULT_NODE_TYPE_VOCABULARY,
  DEFAULT_RELATION_TYPE_VOCABULARY,
  defaultConfig,
  type LabelSourceStep,
  type NodeTypeRule,
  type RelationTypeRule,
  type ResolvedConfig,
} from "./config.ts"
import {
  DEFAULT_QUERY_SETTINGS,
  isChangeImpactDirection,
  isNodeTypeRole,
  isSemanticsSlot,
  PROFILE_KINDS,
  type NodeTypeRole,
  type ProfileKind,
  type QuerySettings,
  type QuerySettingsSpec,
  type RelationConstraint,
  type RelationConstraintSpec,
  type RelationSemantics,
  type TraceModel,
} from "./tim.ts"

export type AugmentationFile = {
  readonly node_types?: readonly {
    readonly name: string
    readonly path_pattern: string
    readonly id_template?: string
    readonly label_source?: readonly LabelSourceStep[]
    readonly extraction_rule?: ExtractionRule
    readonly role?: string
  }[]
  readonly relation_types?: readonly {
    readonly name: string
    readonly fields?: readonly string[]
    readonly reverse_direction?: boolean
    readonly semantics?: unknown
  }[]
  readonly indexed_paths?: readonly string[]
  readonly discovery_roots?: readonly string[]
  readonly query_settings?: QuerySettingsSpec
  readonly relation_constraints?: readonly RelationConstraintSpec[]
}

export const AUGMENTATION_DEFAULT_PATH = ".agentdev/artifact-graph.yaml"

function parseLabelSource(
  raw: unknown,
  fallback: readonly LabelSourceStep[],
): readonly LabelSourceStep[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback
  return raw.map((step) => {
    if (typeof step !== "object" || step === null || !("kind" in step)) {
      throw new TypeError(`label_source step must have kind: ${JSON.stringify(step)}`)
    }
    const s = step as Record<string, unknown>
    switch (s["kind"]) {
      case "frontmatter_field":
        return { kind: "frontmatter_field", field: String(s["field"] ?? "") }
      case "first_heading":
        return { kind: "first_heading" }
      case "filename_stem":
        return { kind: "filename_stem" }
      case "path_group":
        return { kind: "path_group", group: Number(s["group"] ?? 1) }
      case "literal":
        return { kind: "literal", value: String(s["value"] ?? "") }
      case "path":
        return { kind: "path" }
      default:
        throw new TypeError(`unknown label_source kind: ${String(s["kind"])}`)
    }
  })
}

/**
 * Parse augmentation-declared relation semantics. A semantics block, when
 * present, must declare the required semantic information completely
 * (meaning + change_impact_direction); incomplete declarations are boundary
 * errors, not silently ignored metadata (REQ-{NNNN}-{NNN}). Standard core type
 * semantics are owned by the TIM vocabulary catalog and cannot be redefined.
 */
function parseRelationSemantics(
  raw: unknown,
  name: string,
  isStandardType: boolean,
): RelationSemantics | undefined {
  if (raw === undefined || raw === null) return undefined
  if (isStandardType) {
    throw new TypeError(
      `augmentation relation_type '${name}' cannot declare semantics: standard core semantics are owned by the TIM vocabulary catalog`,
    )
  }
  if (typeof raw !== "object") {
    throw new TypeError(`augmentation relation_type '${name}' semantics must be an object`)
  }
  const s = raw as Record<string, unknown>
  const meaning = typeof s["meaning"] === "string" ? s["meaning"] : ""
  if (meaning.length === 0) {
    throw new TypeError(`augmentation relation_type '${name}' semantics requires meaning`)
  }
  const direction = typeof s["change_impact_direction"] === "string" ? s["change_impact_direction"] : ""
  if (!isChangeImpactDirection(direction)) {
    throw new TypeError(
      `augmentation relation_type '${name}' semantics requires change_impact_direction in (forward, backward, bidirectional, none)`,
    )
  }
  const slot = s["semantics_slot"]
  if (slot !== undefined && (typeof slot !== "string" || !isSemanticsSlot(slot))) {
    throw new TypeError(
      `augmentation relation_type '${name}' semantics_slot must be one of the TIM semantics slots`,
    )
  }
  const vocabulary = Array.isArray(s["standard_vocabulary"])
    ? s["standard_vocabulary"].map((entry) => String(entry))
    : []
  const sourceTypes = optionalTypeList(s["source_types"], name, "source_types")
  const targetTypes = optionalTypeList(s["target_types"], name, "target_types")
  return {
    meaning,
    semantics_slot: slot as RelationSemantics["semantics_slot"],
    change_impact_direction: direction,
    standard_vocabulary: vocabulary,
    ...(sourceTypes === undefined ? {} : { source_types: sourceTypes }),
    ...(targetTypes === undefined ? {} : { target_types: targetTypes }),
  }
}

function optionalTypeList(raw: unknown, name: string, field: string): readonly string[] | undefined {
  if (raw === undefined || raw === null) return undefined
  if (!Array.isArray(raw) || raw.some((entry) => typeof entry !== "string" || entry.length === 0)) {
    throw new TypeError(`augmentation relation_type '${name}' ${field} must be a list of type names`)
  }
  return raw as readonly string[]
}

function parseNodeTypeRole(raw: unknown, name: string, isStandardType: boolean): NodeTypeRole | undefined {
  if (raw === undefined || raw === null) return undefined
  if (isStandardType) {
    throw new TypeError(
      `augmentation node_type '${name}' cannot declare role: standard core artifact types are owned by the TIM vocabulary catalog`,
    )
  }
  if (typeof raw !== "string" || !isNodeTypeRole(raw)) {
    throw new TypeError(`augmentation node_type '${name}' role must be 'index' or 'aggregation'`)
  }
  return raw
}

export function resolveConfig(augmentation: AugmentationFile | undefined): ResolvedConfig {
  const base = defaultConfig()
  if (augmentation === undefined) return base

  const baseNodeRules: NodeTypeRule[] = [...base.node_type_rules]
  const nodeVocab = new Set(base.node_type_vocabulary)
  const nodeRoles = new Map(base.node_type_roles)
  const augmentedNodeRules: NodeTypeRule[] = []
  for (const raw of augmentation.node_types ?? []) {
    if (raw.name === undefined || raw.name.length === 0) {
      throw new TypeError("augmentation node_type requires name")
    }
    const isStandardType = (DEFAULT_NODE_TYPE_VOCABULARY as readonly string[]).includes(raw.name)
    const role = parseNodeTypeRole(raw.role, raw.name, isStandardType)
    nodeVocab.add(raw.name)
    if (role !== undefined) nodeRoles.set(raw.name, role)
    const existing = baseNodeRules.find((r) => r.name === raw.name)
    if (existing === undefined) {
      augmentedNodeRules.push({
        name: raw.name,
        path_pattern: raw.path_pattern,
        id_template: raw.id_template ?? `${raw.name}:{path}`,
        label_source: parseLabelSource(raw.label_source, [{ kind: "first_heading" }]),
        extraction_rule: raw.extraction_rule ?? "frontmatter",
        ...(role === undefined ? {} : { role }),
      })
    } else if (raw.path_pattern !== existing.path_pattern) {
      const idx = baseNodeRules.indexOf(existing)
      baseNodeRules[idx] = {
        name: raw.name,
        path_pattern: raw.path_pattern,
        id_template: raw.id_template ?? existing.id_template,
        label_source: parseLabelSource(raw.label_source, existing.label_source),
        extraction_rule: raw.extraction_rule ?? existing.extraction_rule,
        ...(role === undefined ? {} : { role }),
      }
    }
  }
  // Augmentation rules take priority over defaults: more specific project patterns
  // are tried before general standard patterns (e.g., integrity_rule before specification).
  const nodeRules = [...augmentedNodeRules, ...baseNodeRules]

  const relRules: RelationTypeRule[] = [...base.relation_type_rules]
  const relVocab = new Set(base.relation_type_vocabulary)
  const relSemantics = new Map(base.relation_semantics)
  for (const raw of augmentation.relation_types ?? []) {
    if (raw.name === undefined || raw.name.length === 0) {
      throw new TypeError("augmentation relation_type requires name")
    }
    const isStandardType = (DEFAULT_RELATION_TYPE_VOCABULARY as readonly string[]).includes(raw.name)
    const semantics = parseRelationSemantics(raw.semantics, raw.name, isStandardType)
    relVocab.add(raw.name)
    if (semantics !== undefined) relSemantics.set(raw.name, semantics)
    const existing = relRules.find((r) => r.name === raw.name)
    const fields = raw.fields !== undefined ? [...raw.fields] : existing?.fields ?? []
    const reverse = raw.reverse_direction ?? existing?.reverse_direction ?? false
    if (existing === undefined) {
      relRules.push({
        name: raw.name,
        fields,
        reverse_direction: reverse,
        ...(semantics === undefined ? {} : { semantics }),
      })
    } else {
      const idx = relRules.indexOf(existing)
      relRules[idx] = {
        name: raw.name,
        fields,
        reverse_direction: reverse,
        ...(semantics === undefined ? {} : { semantics }),
      }
    }
  }

  const indexedPaths = mergeUnique(base.indexed_paths, augmentation.indexed_paths ?? [])
  const discoveryRoots = mergeUnique(base.discovery_roots, augmentation.discovery_roots ?? [])

  return {
    node_type_rules: nodeRules,
    node_type_vocabulary: [...nodeVocab].sort(),
    relation_type_rules: relRules,
    relation_type_vocabulary: [...relVocab].sort(),
    indexed_paths: indexedPaths,
    discovery_roots: discoveryRoots,
    excluded_paths: base.excluded_paths,
    relation_semantics: relSemantics,
    node_type_roles: nodeRoles,
  }
}

function mergeUnique(base: readonly string[], additions: readonly string[]): readonly string[] {
  const seen = new Set(base)
  for (const p of additions) seen.add(p)
  return [...seen]
}

export async function loadAugmentation(root: string, explicitPath?: string): Promise<AugmentationFile | undefined> {
  const path = explicitPath ?? AUGMENTATION_DEFAULT_PATH
  const fullPath = join(root, path)
  const file = Bun.file(fullPath)
  if (!(await file.exists())) return undefined
  const text = await file.text()
  return Bun.YAML.parse(text) as AugmentationFile
}

// ─── Trace model resolution (Trace Query 実行時、REQ-{NNNN}-{NNN}) ──────────────

function parseSettings(augmentation: AugmentationFile): QuerySettings {
  const raw = augmentation.query_settings
  const limits: Record<ProfileKind, number> = { ...DEFAULT_QUERY_SETTINGS.limits }
  const depths: Record<ProfileKind, number> = { ...DEFAULT_QUERY_SETTINGS.depths }
  let threshold: number = DEFAULT_QUERY_SETTINGS.concentration_threshold
  if (raw !== undefined) {
    for (const [profile, value] of Object.entries(raw.limits ?? {})) {
      if (!(PROFILE_KINDS as readonly string[]).includes(profile)) {
        throw new TypeError(`unknown query profile in limits: ${profile}`)
      }
      limits[profile as ProfileKind] = Number(value)
    }
    for (const [profile, value] of Object.entries(raw.depths ?? {})) {
      if (!(PROFILE_KINDS as readonly string[]).includes(profile)) {
        throw new TypeError(`unknown query profile in depths: ${profile}`)
      }
      depths[profile as ProfileKind] = Number(value)
    }
    if (raw.concentration_threshold !== undefined) {
      threshold = Number(raw.concentration_threshold)
    }
  }
  return { limits, depths, concentration_threshold: threshold }
}

function parseConstraints(raw: readonly RelationConstraintSpec[] | undefined): readonly RelationConstraint[] {
  return (raw ?? []).map((entry) => ({
    relationType: entry.relation_type,
    allowedSourceTypes: new Set(entry.allowed_source_types),
    allowedTargetTypes: new Set(entry.allowed_target_types),
  }))
}

/**
 * 高位問い合わせ（Trace Query）実行時の TraceModel を解決する。関係意味と
 * 役割は派生索引の manifest に保存された解決結果（TIM カタログ + augmentation
 * の意味定義）から、問い合わせ設定と関係制約は augmentation から解決する。
 * 標準コア関係型の意味は TIM 語彙カタログが正規所有するため augmentation では
 * 再定義できない。
 */
export function resolveTraceModel(
  manifest: Pick<Manifest, "relation_semantics" | "node_type_roles">,
  augmentation?: AugmentationFile,
): TraceModel {
  return {
    relationSemantics: new Map(Object.entries(manifest.relation_semantics)),
    nodeRoles: new Map(Object.entries(manifest.node_type_roles)),
    relationConstraints: parseConstraints(augmentation?.relation_constraints),
    querySettings: parseSettings(augmentation ?? {}),
  }
}
