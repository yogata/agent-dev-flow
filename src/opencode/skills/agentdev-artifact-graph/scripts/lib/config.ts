import { createHash } from "node:crypto"
import type { ExtractionRule } from "./model.ts"
import {
  DEFAULT_ARTIFACT_TYPE_SEMANTICS,
  DEFAULT_RELATION_SEMANTICS,
  type NodeTypeRole,
  type RelationSemantics,
} from "./tim.ts"

// ─── Default vocabulary (REQ-{NNNN}-{NNN}, REQ-{NNNN}-{NNN}, DEC-{N} decision 3) ───

/**
 * Standard core default indexed_paths: 3 only.
 * Self-hosting-specific paths (src/opencode, .opencode, .agentdev/extensions,
 * scripts, tests) are NOT included — they belong in self-hosting augmentation
 * (Issue #1951 scope, REQ-{NNNN}-{NNN}).
 */
export const DEFAULT_INDEXED_PATHS = [
  "docs/requirements",
  "docs/decisions",
  "docs/designs",
] as const

/**
 * Standard core default node_types vocabulary: 3 only.
 * command, skill, integrity_rule, extension, source_file are added by
 * augmentation (REQ-{NNNN}-{NNN}).
 */
export const DEFAULT_NODE_TYPE_VOCABULARY = [
  "requirement",
  "decision",
  "design",
] as const

/**
 * Standard core default relation_types vocabulary: 5.
 * delegates_to, governs are added by augmentation (DEC-{N} decision 3).
 */
export const DEFAULT_RELATION_TYPE_VOCABULARY = [
  "references",
  "supersedes",
  "defined_in",
  "contains",
  "extends",
] as const

// ─── Excluded paths (same semantics as repo-local) ────────────────────────────

export const EXCLUDED_PATHS = [
  ".agentdev/graph/**",
  ".agentdev/artifact-graph.yaml",
  ".git/**",
  ".worktrees/**",
  "node_modules/**",
  "dist/**",
  "outputs/**",
  ".cache/**",
  ".omo/**",
  ".sisyphus/**",
  "**/*.tmp",
] as const

const EXCLUDED_SEGMENTS = new Set([
  ".git", ".worktrees", "node_modules", "dist", "outputs", ".cache", ".omo", ".sisyphus",
])

const INPUT_EXTENSIONS = new Set([
  ".md", ".yaml", ".yml", ".ts", ".tsx", ".mts", ".cts", ".json", ".jsonc", ".ps1", ".sh",
])

export function isExcludedPath(path: string): boolean {
  const parts = path.split("/")
  if (parts.some((part) => EXCLUDED_SEGMENTS.has(part))) return true
  if (path === ".agentdev/graph" || path.startsWith(".agentdev/graph/")) return true
  if (path === ".agentdev/artifact-graph.yaml") return true
  return path.endsWith(".tmp")
}

export function isInputFile(path: string): boolean {
  const dot = path.lastIndexOf(".")
  return dot >= 0 && INPUT_EXTENSIONS.has(path.slice(dot).toLowerCase())
}

// ─── Open extension point: rules and config (REQ-{NNNN}-{NNN}, DEC-{N} decision 2) ─

export type LabelSourceStep =
  | { readonly kind: "frontmatter_field"; readonly field: string }
  | { readonly kind: "first_heading" }
  | { readonly kind: "filename_stem" }
  | { readonly kind: "path_group"; readonly group: number }
  | { readonly kind: "literal"; readonly value: string }
  | { readonly kind: "path" }

export type NodeTypeRule = {
  readonly name: string
  readonly path_pattern: string
  readonly id_template: string
  readonly label_source: readonly LabelSourceStep[]
  readonly extraction_rule: ExtractionRule
  /** Index/aggregation role (REQ-{NNNN}-{NNN}). Absent means the type carries no role. */
  readonly role?: NodeTypeRole
}

export type RelationTypeRule = {
  readonly name: string
  readonly fields: readonly string[]
  readonly reverse_direction: boolean
  /**
   * Declared TIM semantics. Required for extension relation types that join
   * purpose-specific queries (REQ-{NNNN}-{NNN}, REQ-{NNNN}-{NNN}). Standard
   * core types resolve their semantics from the TIM catalog, not from this field.
   */
  readonly semantics?: RelationSemantics
}

export type ResolvedConfig = {
  readonly node_type_rules: readonly NodeTypeRule[]
  readonly node_type_vocabulary: readonly string[]
  readonly relation_type_rules: readonly RelationTypeRule[]
  readonly relation_type_vocabulary: readonly string[]
  readonly indexed_paths: readonly string[]
  readonly discovery_roots: readonly string[]
  readonly excluded_paths: readonly string[]
  /** Resolved TIM semantics per relation type (defaults + complete augmentation declarations). */
  readonly relation_semantics: ReadonlyMap<string, RelationSemantics>
  /** Resolved index/aggregation roles per artifact type (REQ-{NNNN}-{NNN}). */
  readonly node_type_roles: ReadonlyMap<string, NodeTypeRole>
}

// ─── Default rules ─────────────────────────────────────────────────────────────

const FALLBACK_LABEL: readonly LabelSourceStep[] = [
  { kind: "frontmatter_field", field: "title" },
  { kind: "first_heading" },
  { kind: "filename_stem" },
]

export const DEFAULT_NODE_TYPE_RULES: readonly NodeTypeRule[] = [
  {
    name: "requirement",
    path_pattern: "^docs/requirements/(REQ-\\d+)\\.md$",
    id_template: "requirement:{match1}",
    label_source: FALLBACK_LABEL,
    extraction_rule: "frontmatter",
  },
  {
    name: "decision",
    path_pattern: "^docs/decisions/(?:retired/)?(DEC-\\d+)\\.md$",
    id_template: "decision:{match1}",
    label_source: FALLBACK_LABEL,
    extraction_rule: "frontmatter",
  },
  {
    name: "design",
    path_pattern: "^docs/designs/(?!.*README\\.md$).+\\.md$",
    id_template: "design:{path}",
    label_source: [
      { kind: "frontmatter_field", field: "title" },
      { kind: "first_heading" },
      { kind: "path" },
    ],
    extraction_rule: "frontmatter",
  },
]

export const DEFAULT_RELATION_TYPE_RULES: readonly RelationTypeRule[] = [
  {
    name: "references",
    fields: ["canonical_owner", "context.paths"],
    reverse_direction: false,
  },
  {
    name: "supersedes",
    fields: ["superseded_by"],
    reverse_direction: true,
  },
  // defined_in, contains, extends are in the vocabulary but have no field-based
  // extraction. They are generated by containment/extension logic when the
  // relevant node types exist via augmentation.
]

export function defaultConfig(): ResolvedConfig {
  return {
    node_type_rules: DEFAULT_NODE_TYPE_RULES,
    node_type_vocabulary: [...DEFAULT_NODE_TYPE_VOCABULARY].sort(),
    relation_type_rules: DEFAULT_RELATION_TYPE_RULES,
    relation_type_vocabulary: [...DEFAULT_RELATION_TYPE_VOCABULARY].sort(),
    indexed_paths: [...DEFAULT_INDEXED_PATHS],
    discovery_roots: [],
    excluded_paths: [...EXCLUDED_PATHS],
    relation_semantics: defaultRelationSemantics(),
    node_type_roles: defaultNodeTypeRoles(),
  }
}

function defaultRelationSemantics(): ReadonlyMap<string, RelationSemantics> {
  const entries: readonly (readonly [string, RelationSemantics])[] = [...DEFAULT_RELATION_TYPE_VOCABULARY]
    .flatMap((name) => {
      const semantics = DEFAULT_RELATION_SEMANTICS[name]
      return semantics === undefined ? [] : [[name, semantics] as const]
    })
  return new Map(entries)
}

function defaultNodeTypeRoles(): ReadonlyMap<string, NodeTypeRole> {
  const entries = [...DEFAULT_NODE_TYPE_VOCABULARY]
    .flatMap((name) => {
      const role = DEFAULT_ARTIFACT_TYPE_SEMANTICS[name]?.role
      return role === undefined ? [] : [[name, role] as const]
    })
  return new Map(entries)
}

export function validNodeTypes(config: ResolvedConfig): ReadonlySet<string> {
  return new Set(config.node_type_vocabulary)
}

export function validRelationTypes(config: ResolvedConfig): ReadonlySet<string> {
  return new Set(config.relation_type_vocabulary)
}

// ─── Graph config digest (REQ-{NNNN}-{NNN}, REQ-{NNNN}-{NNN}) ──────────────────

/**
 * Digest over generation-affecting configuration. Freshness is judged by the
 * 4 elements (input_digest, graph_config_digest, generator_version,
 * schema_version). Query-time settings (discovery_roots, candidate limits,
 * display settings) are deliberately excluded so that changing them never
 * triggers index regeneration.
 */
export function computeGraphConfigDigest(config: ResolvedConfig): string {
  const canonical = {
    excluded_paths: [...config.excluded_paths].sort(),
    indexed_paths: [...config.indexed_paths].sort(),
    node_type_roles: sortedRecordEntries(config.node_type_roles),
    node_type_rules: [...config.node_type_rules]
      .map((rule) => ({
        extraction_rule: rule.extraction_rule,
        id_template: rule.id_template,
        label_source: rule.label_source,
        name: rule.name,
        path_pattern: rule.path_pattern,
        role: rule.role ?? null,
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
    relation_semantics: sortedRecordEntries(config.relation_semantics),
    relation_type_rules: [...config.relation_type_rules]
      .map((rule) => ({
        fields: [...rule.fields].sort(),
        name: rule.name,
        reverse_direction: rule.reverse_direction,
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
  }
  const hash = createHash("sha256")
  hash.update(canonicalJson(canonical))
  return hash.digest("hex")
}

function sortedRecordEntries<T>(map: ReadonlyMap<string, T>): Record<string, T> {
  const record: Record<string, T> = {}
  for (const key of [...map.keys()].sort()) {
    const value = map.get(key)
    if (value !== undefined) record[key] = value
  }
  return record
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`).join(",")}}`
  }
  return JSON.stringify(value)
}
