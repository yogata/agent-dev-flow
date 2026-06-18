/**
 * Gate selection logic for the 3-layer integrity gate (REQ-0136-040, Issue #898).
 *
 * Given the parsed catalog + impact map + CLI options, computes the set of
 * applicable IR IDs for the requested gate, and maps IR IDs to the check
 * category names emitted by `check_integrity.ts` so results can be filtered.
 *
 * - full-audit (default): every catalog rule → no filtering (backward compat)
 * - delta-guard: rules tagged `delta-guard` in the catalog, optionally narrowed
 *   by `--paths` via the Delta Guard change-type table
 * - impact-guard: rules tagged `impact-guard` in the catalog, optionally
 *   expanded by `--reqs` via the Impact Matrix
 */
import type { GateLevel, CliOptions } from "./cli_utils.ts";
import type { IntegrityRule } from "./integrity_catalog_parser.ts";
import type { ReqImpactMap } from "./req_impact_map_parser.ts";

export type ChangeType =
  | "Command"
  | "Skill"
  | "REQ"
  | "ADR"
  | "SPEC"
  | "Template"
  | "Source/projection"
  | "unknown";

const DELTA_TABLE_LABEL: Record<ChangeType, string> = {
  Command: "Command 追加/変更",
  Skill: "Skill 追加/変更",
  REQ: "REQ 追加/変更",
  ADR: "ADR 追加/変更",
  SPEC: "SPEC 変更",
  Template: "Template 変更",
  "Source/projection": "Source/projection 変更",
  unknown: "",
};

export function classifyChangeType(filePath: string): ChangeType {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.includes("/commands/")) return "Command";
  if (normalized.includes("/skills/") && normalized.includes("/templates/")) {
    return "Template";
  }
  if (normalized.includes("/skills/")) return "Skill";
  if (normalized.includes("/templates/")) return "Template";
  if (
    normalized.startsWith("docs/requirements/") ||
    normalized.includes("/requirements/REQ-")
  ) {
    return "REQ";
  }
  if (normalized.includes("/adr/")) return "ADR";
  if (normalized.startsWith("docs/specs/") || normalized.includes("/specs/")) {
    return "SPEC";
  }
  if (
    normalized.startsWith("src/opencode/") ||
    normalized.includes("sync-opencode")
  ) {
    return "Source/projection";
  }
  return "unknown";
}

export interface GateSelection {
  gate: GateLevel;
  ruleIds: Set<string>;
  changeTypes: ChangeType[];
  notes: string[];
}

export function selectApplicableRuleIds(
  catalog: IntegrityRule[],
  impactMap: ReqImpactMap,
  options: Pick<CliOptions, "gate" | "gatePaths" | "reqs">,
): GateSelection {
  const gate = options.gate;
  const notes: string[] = [];

  if (gate === "full-audit") {
    return {
      gate,
      ruleIds: new Set(catalog.map((r) => r.rule_id)),
      changeTypes: [],
      notes,
    };
  }

  const tagged = catalog
    .filter((r) => r.gate_level.includes(gate))
    .map((r) => r.rule_id);
  const ruleIds = new Set<string>(tagged);

  const changeTypes: ChangeType[] = [];

  if (gate === "delta-guard") {
    if (options.gatePaths.length > 0) {
      const detected = new Set<ChangeType>();
      for (const p of options.gatePaths) {
        const ct = classifyChangeType(p);
        if (ct !== "unknown") detected.add(ct);
        else notes.push(`unclassified path (ignored): ${p}`);
      }
      for (const ct of detected) {
        changeTypes.push(ct);
        const label = DELTA_TABLE_LABEL[ct];
        const entry = impactMap.deltaGuardTable.find(
          (e) => e.changeType === label,
        );
        if (entry) {
          for (const id of entry.ruleIds) ruleIds.add(id);
        } else {
          notes.push(`no Delta Guard table row for change type "${label}"`);
        }
      }
      if (detected.size === 0) {
        notes.push(
          "no classifiable --paths; falling back to delta-guard-tagged rules",
        );
      }
    } else {
      notes.push(
        "no --paths given; running all delta-guard-tagged rules",
      );
    }
  }

  if (gate === "impact-guard") {
    if (options.reqs.length > 0) {
      for (const reqId of options.reqs) {
        const entry = impactMap.impactMatrix.find((e) => e.reqId === reqId);
        if (entry) {
          for (const id of entry.ruleIds) ruleIds.add(id);
        } else {
          notes.push(`REQ ${reqId} not found in Impact Matrix`);
        }
      }
    } else {
      notes.push(
        "no --reqs given; running all impact-guard-tagged rules",
      );
    }
  }

  return { gate, ruleIds, changeTypes, notes };
}

// IR-NNN → check `category` strings emitted by check_integrity.ts functions.
// Conservative mapping: only rules with clearly attributable check categories.
// Unmapped IRs are full-audit-only (no enforcement at this foundation stage).
export const IR_TO_CHECK_CATEGORIES: Record<string, string[]> = {
  "IR-001": ["frontmatter-filename"],
  "IR-002": ["required-fields"],
  "IR-003": ["active-retired-duplication"],
  "IR-004": ["readme-index-sync"],
  "IR-005": ["adr-req-crossref"],
  "IR-006": ["implementation-pattern", "cmd-implementation-pattern"],
  "IR-007": ["skill-name-dir-match"],
  "IR-008": ["reference-path-existence"],
  "IR-009": ["legacy-namespace", "expanded-legacy-namespace"],
  "IR-010": ["adr-status-normalization"],
  "IR-011": ["mapping-table-completeness"],
  "IR-012": ["variant-required-fields", "fragment-patterns"],
  "IR-013": ["variant-existence", "variant-path-existence"],
  "IR-014": ["obsolete-reference-dir"],
  "IR-015": ["retired-in-active-index"],
  "IR-016": ["source-projection-consistency"],
  "IR-017": ["docmap-req-sync"],
  "IR-021": ["abolished-skill-reference"],
  "IR-024": ["command-readme-sync", "command-inventory"],
  "IR-025": ["retired-adr-path"],
  "IR-038": ["adr-readme-index-sync"],
};

export function applicableCheckCategories(ruleIds: Set<string>): Set<string> {
  const cats = new Set<string>();
  for (const id of ruleIds) {
    for (const c of IR_TO_CHECK_CATEGORIES[id] ?? []) cats.add(c);
  }
  return cats;
}
