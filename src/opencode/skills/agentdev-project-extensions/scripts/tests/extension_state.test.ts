/**
 * Regression tests for the shared extension load-time state machine.
 *
 * Covered cases: YAML syntax error, missing required fields, legacy kind,
 * unknown kind, valid extension, empty input, type mismatch, colon/#
 * inside quotes, CRLF, nesting, arrays.
 *
 * Guaranteed YAML scope only: anchors, aliases, custom tags and multiple
 * documents are intentionally NOT tested (not guaranteed features).
 */

import { describe, expect, test } from "bun:test";
import {
  parseExtensionYaml,
  resolveExtensionState,
  validateExtensionEntries,
} from "../lib/extension_state.ts";

const validDoc = (kind: string) =>
  `version: 1\nkind: ${kind}\nid: agentdev-workflow-demo\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n`;

describe("parseExtensionYaml (Bun.YAML delegation, availability evidence)", () => {
  test("Bun.YAML.parse is available and handles the guaranteed YAML scope", () => {
    const result = parseExtensionYaml(
      'num: 1\nstr: "x"\nplain: y\nflag: true\nnil: null\nlist: [1, a, "b"]\nnested:\n  - id: e1\n    paths:\n      - "docs/a.md"\n',
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      const data = result.data as Record<string, unknown>;
      expect(data.num).toBe(1);
      expect(data.str).toBe("x");
      expect(data.plain).toBe("y");
      expect(data.flag).toBe(true);
      expect(data.nil).toBe(null);
      expect(data.list).toEqual([1, "a", "b"]);
      expect(Array.isArray(data.nested)).toBe(true);
    }
  });

  test("converts syntax errors into a value instead of throwing", () => {
    const result = parseExtensionYaml(":\n\t- ][{ ::\n\tversion: [[[\n");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveExtensionState (regression cases)", () => {
  test("missing when the input is null", () => {
    expect(resolveExtensionState(null)).toEqual({ state: "missing" });
  });

  test("malformed on YAML syntax error", () => {
    const resolution = resolveExtensionState(":\n\t- ][{ ::\n\tversion: [[[\n");
    expect(resolution.state).toBe("malformed");
  });

  test("malformed on empty input", () => {
    const resolution = resolveExtensionState("");
    expect(resolution.state).toBe("malformed");
    if (resolution.state === "malformed") {
      expect(resolution.reasons.some((r) => r.includes("'version'"))).toBe(true);
    }
  });

  test("malformed on missing required fields", () => {
    const resolution = resolveExtensionState("version: 1\nkind: workflow-extension\n");
    expect(resolution.state).toBe("malformed");
    if (resolution.state === "malformed") {
      expect(resolution.reasons.some((r) => r.includes("'id'"))).toBe(true);
      expect(resolution.reasons.some((r) => r.includes("'context'"))).toBe(true);
    }
  });

  test("malformed on type mismatch (wrong version value, numeric kind, non-array section)", () => {
    expect(resolveExtensionState(validDoc("workflow-extension").replace("version: 1", "version: 2")).state).toBe("malformed");
    expect(resolveExtensionState(validDoc("workflow-extension").replace("version: 1", "version: true")).state).toBe("malformed");
    expect(resolveExtensionState(validDoc("workflow-extension").replace("kind: workflow-extension", "kind: 123")).state).toBe("malformed");
    expect(resolveExtensionState(validDoc("workflow-extension").replace("context: []", "context: not-an-array")).state).toBe("malformed");
    expect(resolveExtensionState(validDoc("workflow-extension").replace("context: []", "context: {}")).state).toBe("malformed");
  });

  test("malformed when the document root is not a mapping (all required keys reported)", () => {
    const listRoot = resolveExtensionState("- a\n- b\n");
    expect(listRoot.state).toBe("malformed");
    if (listRoot.state === "malformed") {
      expect(listRoot.reasons.some((r) => r.includes("'version'"))).toBe(true);
    }
    const scalarRoot = resolveExtensionState("hello\n");
    expect(scalarRoot.state).toBe("malformed");
  });

  test("migration-required on legacy command-extension", () => {
    expect(resolveExtensionState(validDoc("command-extension"))).toEqual({
      state: "migration-required",
      kind: "command-extension",
    });
  });

  test("migration-required on legacy skill-extension", () => {
    expect(resolveExtensionState(validDoc("skill-extension"))).toEqual({
      state: "migration-required",
      kind: "skill-extension",
    });
  });

  test("schema-violation on unknown kind", () => {
    expect(resolveExtensionState(validDoc("solar-extension"))).toEqual({
      state: "schema-violation",
      kind: "solar-extension",
    });
  });

  test("valid for each official kind", () => {
    for (const kind of [
      "workflow-extension",
      "internal-workflow-extension",
      "capability-skill-extension",
    ] as const) {
      expect(resolveExtensionState(validDoc(kind))).toEqual({ state: "valid", kind });
    }
  });

  test("valid with quoted version \"1\" (legacy acceptance kept)", () => {
    const resolution = resolveExtensionState(validDoc("workflow-extension").replace("version: 1", 'version: "1"'));
    expect(resolution).toEqual({ state: "valid", kind: "workflow-extension" });
  });

  test("valid with colon and # inside quoted strings", () => {
    const doc =
      'version: 1\nkind: workflow-extension\nid: "agentdev-workflow-demo"\n\ncontext:\n  - id: "ctx: one # two"\n    when: "a: b"\n    paths:\n      - "docs/x#y.md"\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n';
    const resolution = resolveExtensionState(doc);
    expect(resolution).toEqual({ state: "valid", kind: "workflow-extension" });
  });

  test("valid with CRLF line endings", () => {
    const resolution = resolveExtensionState(validDoc("workflow-extension").replace(/\n/g, "\r\n"));
    expect(resolution).toEqual({ state: "valid", kind: "workflow-extension" });
  });

  test("valid with nesting and populated arrays", () => {
    const doc = [
      "version: 1",
      "kind: workflow-extension",
      "id: agentdev-workflow-demo",
      "",
      "context:",
      "  - id: must-1",
      "    when: always",
      "    paths:",
      "      - \"docs/foundation-guide/nested-path.md\"",
      "    purpose: shared state machine contract",
      "rules:",
      "  - id: rule-1",
      "    when: implementation",
      "    skill: agentdev-req-analysis",
      "checks:",
      "  - id: check-1",
      "    skill: repo-agentdev-integrity",
      "acceptance_gates:",
      "  - gate one",
      "  - gate two",
      "must_not:",
      "  - prohibition one",
      "",
    ].join("\n");
    const resolution = resolveExtensionState(doc);
    expect(resolution).toEqual({ state: "valid", kind: "workflow-extension" });
    if (resolution.state === "valid") {
      const parsed = parseExtensionYaml(doc);
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        const data = parsed.data as Record<string, unknown>;
        expect(validateExtensionEntries(data)).toEqual([]);
        expect((data.acceptance_gates as string[]).length).toBe(2);
      }
    }
  });
});

describe("validateExtensionEntries (entry structure validation)", () => {
  test("accepts the legacy wording source shapes", () => {
    const doc = parseExtensionYaml(
      'version: 1\nkind: workflow-extension\nid: x\n\ncontext:\n  - id: c1\n    paths:\n      - "docs/a.md"\nrules: []\nchecks: []\nacceptance_gates:\n  - gate\nmust_not: []\n',
    );
    expect(doc.ok).toBe(true);
    if (doc.ok) expect(validateExtensionEntries(doc.data)).toEqual([]);
  });

  test("rejects non-object section entries with the legacy message", () => {
    const messages = validateExtensionEntries({
      context: ["not-an-object"],
      rules: [],
      checks: [],
      acceptance_gates: [],
      must_not: [],
    });
    expect(messages).toContain("context[0] must be an object");
  });

  test("rejects entries missing the id string with the legacy message", () => {
    const messages = validateExtensionEntries({
      context: [{ when: "always" }],
      rules: [{ when: "x" }],
      checks: [],
      acceptance_gates: [],
      must_not: [],
    });
    expect(messages).toContain("context[0] missing 'id' string");
    expect(messages).toContain("rules[0] missing 'id' string");
  });

  test("rejects non-string acceptance_gates / must_not elements", () => {
    const messages = validateExtensionEntries({
      context: [],
      rules: [],
      checks: [],
      acceptance_gates: [1],
      must_not: [true],
    });
    expect(messages).toContain("acceptance_gates[0] must be a string");
    expect(messages).toContain("must_not[0] must be a string");
  });

  test("rejects wrong entry field shapes (when, paths)", () => {
    const messages = validateExtensionEntries({
      context: [{ id: "c1", when: 1, paths: "docs/a.md" }],
      rules: [],
      checks: [],
      acceptance_gates: [],
      must_not: [],
    });
    expect(messages.some((m) => m.startsWith("context[0] field 'when' must be a string"))).toBe(true);
    expect(messages.some((m) => m.startsWith("context[0] field 'paths' must be an array of strings"))).toBe(true);
  });
});
