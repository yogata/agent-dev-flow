import { describe, it, expect } from "bun:test";
import {
  selectApplicableRuleIds,
  applicableCheckCategories,
  classifyChangeType,
  IR_TO_CHECK_CATEGORIES,
} from "./gate_filter.ts";
import {
  parseIntegrityRuleCatalog,
  filterRulesByGate,
} from "./integrity_catalog_parser.ts";
import { parseReqImpactMap } from "./req_impact_map_parser.ts";

function readFixture(name: string): string {
  const fs = require("fs");
  const path = require("path");
  let dir = path.resolve(__dirname);
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, "docs", "specs", name);
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate, "utf-8");
    dir = path.dirname(dir);
  }
  throw new Error(`${name} fixture not found`);
}

function loadReal() {
  return {
    catalog: parseIntegrityRuleCatalog(readFixture("integrity-rule-catalog.md")),
    impactMap: parseReqImpactMap(readFixture("req-impact-map.md")),
  };
}

describe("classifyChangeType", () => {
  it("classifies command paths", () => {
    expect(classifyChangeType("src/opencode/commands/agentdev/case-run.md")).toBe(
      "Command",
    );
  });
  it("classifies REQ paths", () => {
    expect(classifyChangeType("docs/requirements/REQ-0101.md")).toBe("REQ");
  });
  it("classifies ADR paths", () => {
    expect(classifyChangeType("docs/adr/ADR-0123.md")).toBe("ADR");
  });
  it("classifies SPEC paths", () => {
    expect(classifyChangeType("docs/specs/patterns.md")).toBe("SPEC");
  });
  it("classifies skill paths", () => {
    expect(classifyChangeType("src/opencode/skills/agentdev-foo/SKILL.md")).toBe(
      "Skill",
    );
  });
  it("returns unknown for unclassifiable", () => {
    expect(classifyChangeType("README.md")).toBe("unknown");
  });
});

describe("selectApplicableRuleIds - full-audit", () => {
  const { catalog, impactMap } = loadReal();

  it("returns all catalog rule IDs (backward compat)", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "full-audit",
      gatePaths: [],
      reqs: [],
    });
    expect(sel.gate).toBe("full-audit");
    expect(sel.ruleIds.size).toBe(44);
  });

  it("full-audit ignores --paths and --reqs", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "full-audit",
      gatePaths: ["docs/requirements/REQ-0101.md"],
      reqs: ["REQ-0101"],
    });
    expect(sel.ruleIds.size).toBe(44);
  });
});

describe("selectApplicableRuleIds - delta-guard", () => {
  const { catalog, impactMap } = loadReal();

  it("without --paths returns all delta-guard-tagged rules (13)", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "delta-guard",
      gatePaths: [],
      reqs: [],
    });
    expect(sel.gate).toBe("delta-guard");
    expect(sel.ruleIds.size).toBe(13);
  });

  it("with --paths REQ file adds Delta Guard table rules for REQ change type", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "delta-guard",
      gatePaths: ["docs/requirements/REQ-0101.md"],
      reqs: [],
    });
    expect(sel.changeTypes).toContain("REQ");
    expect(sel.ruleIds.has("IR-001")).toBe(true);
    expect(sel.ruleIds.has("IR-002")).toBe(true);
    expect(sel.ruleIds.has("IR-004")).toBe(true);
    expect(sel.ruleIds.has("IR-022")).toBe(true);
  });

  it("with --paths Command file adds IR-006, IR-007, IR-013, IR-024", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "delta-guard",
      gatePaths: ["src/opencode/commands/agentdev/case-run.md"],
      reqs: [],
    });
    expect(sel.changeTypes).toContain("Command");
    expect(sel.ruleIds.has("IR-006")).toBe(true);
    expect(sel.ruleIds.has("IR-007")).toBe(true);
    expect(sel.ruleIds.has("IR-013")).toBe(true);
    expect(sel.ruleIds.has("IR-024")).toBe(true);
  });

  it("notes unclassifiable paths", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "delta-guard",
      gatePaths: ["README.md"],
      reqs: [],
    });
    expect(sel.notes.some((n) => n.includes("unclassified"))).toBe(true);
  });
});

describe("selectApplicableRuleIds - impact-guard", () => {
  const { catalog, impactMap } = loadReal();

  it("without --reqs returns impact-guard-tagged rules (2)", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "impact-guard",
      gatePaths: [],
      reqs: [],
    });
    expect(sel.ruleIds.size).toBe(2);
    expect(sel.ruleIds.has("IR-020")).toBe(true);
    expect(sel.ruleIds.has("IR-023")).toBe(true);
  });

  it("with --reqs REQ-0101 adds Impact Matrix rules", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "impact-guard",
      gatePaths: [],
      reqs: ["REQ-0101"],
    });
    expect(sel.ruleIds.has("IR-001")).toBe(true);
    expect(sel.ruleIds.has("IR-022")).toBe(true);
  });

  it("with --reqs REQ-0108 expands range to 24 IDs", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "impact-guard",
      gatePaths: [],
      reqs: ["REQ-0108"],
    });
    expect(sel.ruleIds.has("IR-001")).toBe(true);
    expect(sel.ruleIds.has("IR-024")).toBe(true);
  });

  it("notes unknown REQ IDs", () => {
    const sel = selectApplicableRuleIds(catalog, impactMap, {
      gate: "impact-guard",
      gatePaths: [],
      reqs: ["REQ-9999"],
    });
    expect(sel.notes.some((n) => n.includes("REQ-9999"))).toBe(true);
  });
});

describe("applicableCheckCategories", () => {
  it("maps known IR IDs to check category strings", () => {
    const cats = applicableCheckCategories(new Set(["IR-001", "IR-016"]));
    expect(cats.has("frontmatter-filename")).toBe(true);
    expect(cats.has("source-projection-consistency")).toBe(true);
  });

  it("returns empty set for unmapped IR IDs", () => {
    const cats = applicableCheckCategories(new Set(["IR-999"]));
    expect(cats.size).toBe(0);
  });
});

describe("IR_TO_CHECK_CATEGORIES coverage", () => {
  const { catalog } = loadReal();
  const deltaGuardRules = filterRulesByGate(catalog, "delta-guard");

  it("delta-guard rules with check mappings cover the common categories", () => {
    const allCats = applicableCheckCategories(new Set(deltaGuardRules.map((r) => r.rule_id)));
    expect(allCats.size).toBeGreaterThan(0);
    expect(allCats.has("implementation-pattern")).toBe(true);
  });
});
