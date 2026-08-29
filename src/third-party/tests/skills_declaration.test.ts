/**
 * Regression tests for the third-party skills.yaml declaration loader and
 * validation (TS-010: AG-011 name constraints).
 *
 * Covered cases: YAML syntax error, structure violations, unknown fields
 * (including revision / type, which are not part of the schema), missing
 * required fields, kebab-case violations, reserved prefixes (agentdev-,
 * repo-), fail-closed halting, and the shipped skills.yaml self-consistency.
 *
 * Guaranteed YAML scope only: anchors, aliases, custom tags and multiple
 * documents are intentionally NOT tested (not guaranteed features).
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DECLARATION_SCHEMA_VERSION,
  type DeclarationViolation,
  loadSkillsDeclaration,
  parseSkillsYaml,
  validateSkillName,
  validateSkillsDeclaration,
} from "../lib/skills_declaration.ts";

const validDoc = (name: string, source: string) =>
  `schema_version: "${DECLARATION_SCHEMA_VERSION}"\nskills:\n  - name: ${name}\n    source: ${source}\n`;

describe("parseSkillsYaml (Bun.YAML delegation)", () => {
  test("parses the guaranteed YAML scope", () => {
    const result = parseSkillsYaml('schema_version: "1.0"\nskills: []\n');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const data = result.data as Record<string, unknown>;
      expect(data.schema_version).toBe("1.0");
      expect(data.skills).toEqual([]);
    }
  });

  test("converts syntax errors into a value instead of throwing", () => {
    const result = parseSkillsYaml(":\n\t- ][{ ::\n\tskills: [[[\n");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

describe("validateSkillName (AG-002, AG-011)", () => {
  test("accepts kebab-case names without reserved prefixes", () => {
    expect(validateSkillName("example-skill")).toEqual([]);
    expect(validateSkillName("a")).toEqual([]);
    expect(validateSkillName("a1-b2-c3")).toEqual([]);
  });

  test("rejects non-kebab-case names", () => {
    expect(validateSkillName("Example-Skill").length).toBeGreaterThan(0);
    expect(validateSkillName("example_skill").length).toBeGreaterThan(0);
    expect(validateSkillName("-example").length).toBeGreaterThan(0);
    expect(validateSkillName("example-").length).toBeGreaterThan(0);
    expect(validateSkillName("example--skill").length).toBeGreaterThan(0);
  });

  test("rejects agentdev- and repo- prefixes", () => {
    expect(validateSkillName("agentdev-example").some((m) => m.includes("agentdev-"))).toBe(true);
    expect(validateSkillName("repo-example").some((m) => m.includes("repo-"))).toBe(true);
  });
});

describe("loadSkillsDeclaration (TS-010: violation names halt fetching)", () => {
  test("accepts a valid declaration and returns entries", () => {
    const result = loadSkillsDeclaration(validDoc("example-skill", "https://example.com/example-skill/SKILL.md"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entries).toEqual([
        { name: "example-skill", source: "https://example.com/example-skill/SKILL.md" },
      ]);
    }
  });

  test("accepts an empty skills list", () => {
    const result = loadSkillsDeclaration('schema_version: "1.0"\nskills: []\n');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entries).toEqual([]);
    }
  });

  test("halts on agentdev- prefixed name (fetch not executed)", () => {
    const result = loadSkillsDeclaration(validDoc("agentdev-impostor", "https://example.com/SKILL.md"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations.some((v: DeclarationViolation) => v.message.includes("agentdev-"))).toBe(true);
    }
  });

  test("halts on repo- prefixed name (fetch not executed)", () => {
    const result = loadSkillsDeclaration(validDoc("repo-impostor", "https://example.com/SKILL.md"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations.some((v: DeclarationViolation) => v.message.includes("repo-"))).toBe(true);
    }
  });

  test("halts on non-kebab-case names (fetch not executed)", () => {
    for (const name of ["NonKebab", "under_score", "-leading", "trailing-", "double--dash"]) {
      const result = loadSkillsDeclaration(validDoc(name, "https://example.com/SKILL.md"));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.violations.some((v: DeclarationViolation) => v.message.includes("kebab-case"))).toBe(true);
      }
    }
  });

  test("halts on syntax errors (fetch not executed)", () => {
    const result = loadSkillsDeclaration(":\n\t- ][{ ::\n");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations[0]?.kind).toBe("syntax");
    }
  });

  test("halts when skills is missing or not an array", () => {
    expect(loadSkillsDeclaration(`schema_version: "1.0"\n`).ok).toBe(false);
    expect(loadSkillsDeclaration(`schema_version: "1.0"\nskills: not-an-array\n`).ok).toBe(false);
    expect(loadSkillsDeclaration(`schema_version: "1.0"\nskills:\n  - just-a-string\n`).ok).toBe(false);
  });
});

describe("validateSkillsDeclaration (schema: name + source only)", () => {
  test("rejects revision field (not part of the schema)", () => {
    const doc = `schema_version: "1.0"\nskills:\n  - name: example-skill\n    source: https://example.com/SKILL.md\n    revision: "v1.2.3"\n`;
    const result = validateSkillsDeclaration(parseSkillsYaml(doc).ok ? parseSkillsYaml(doc).data : null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations.some((v) => v.message.includes("revision"))).toBe(true);
    }
  });

  test("rejects type field (not part of the schema)", () => {
    const doc = `schema_version: "1.0"\nskills:\n  - name: example-skill\n    source: https://example.com/SKILL.md\n    type: single-file\n`;
    const result = validateSkillsDeclaration(parseSkillsYaml(doc).ok ? parseSkillsYaml(doc).data : null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations.some((v) => v.message.includes("type"))).toBe(true);
    }
  });

  test("rejects unknown top-level keys and wrong schema_version", () => {
    const doc = `schema_version: "2.0"\nunknown_top: true\nskills: []\n`;
    const result = loadSkillsDeclaration(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations.some((v) => v.message.includes("unknown_top"))).toBe(true);
      expect(result.violations.some((v) => v.message.includes("schema_version"))).toBe(true);
    }
  });

  test("rejects entries missing name or source, and empty source", () => {
    const missingName = `schema_version: "1.0"\nskills:\n  - source: https://example.com/SKILL.md\n`;
    const missingSource = `schema_version: "1.0"\nskills:\n  - name: example-skill\n`;
    const emptySource = `schema_version: "1.0"\nskills:\n  - name: example-skill\n    source: ""\n`;
    expect(loadSkillsDeclaration(missingName).ok).toBe(false);
    expect(loadSkillsDeclaration(missingSource).ok).toBe(false);
    expect(loadSkillsDeclaration(emptySource).ok).toBe(false);
  });

  test("fail-closed: returns no entries when one entry violates constraints among valid ones", () => {
    const doc = `schema_version: "1.0"\nskills:\n  - name: valid-skill\n    source: https://example.com/a/SKILL.md\n  - name: agentdev-impostor\n    source: https://example.com/b/SKILL.md\n`;
    const result = loadSkillsDeclaration(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations.length).toBeGreaterThan(0);
    }
  });
});

describe("shipped skills.yaml self-consistency", () => {
  test("the declaration file itself passes validation with an empty skills list", () => {
    const text = readFileSync(join(import.meta.dir, "..", "skills.yaml"), "utf8");
    const result = loadSkillsDeclaration(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entries).toEqual([]);
    }
  });
});
