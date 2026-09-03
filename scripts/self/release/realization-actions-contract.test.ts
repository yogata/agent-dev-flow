// Contract alignment test for the realization_actions schema (REQ-008-060,
// DEC-026). Pins the 3-way contract between:
//   - the req-draft template:
//     src/opencode/commands/agentdev/templates/req-define/req-draft.md
//   - the schema owner:
//     docs/designs/responsibilities/artifact-contracts.md
//     ("### realization_actions 構造" section)
//   - the document model note:
//     docs/designs/foundations/document-model.md
//     ("realization_actions 分離" line)
// as a permanent regression guard (TS-005, Issue #2546):
//   - the template holds a realization_actions section between test_strategy
//     and review_dispositions
//   - the 7-field entry contract (id, concern, responsibility,
//     ownership_hints, intent, verification_refs, source_items) matches
//     across the 3 locations
//   - domain neutrality: no fixed artifact-kind enum (skill / command /
//     plugin / frontend / backend) is defined as a YAML value in the
//     template section; prose mentions are allowed and are excluded from
//     the detection

// ADF-COVERS(verification): REQ-008-060

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const TEMPLATE_REL =
  "src/opencode/commands/agentdev/templates/req-define/req-draft.md";
const CONTRACTS_REL = "docs/designs/responsibilities/artifact-contracts.md";
const DOC_MODEL_REL = "docs/designs/foundations/document-model.md";

const EXPECTED_FIELDS: readonly string[] = [
  "id",
  "concern",
  "responsibility",
  "ownership_hints",
  "intent",
  "verification_refs",
  "source_items",
];

// Artifact-kind words that must never appear as a fixed enum value.
const ENUM_WORDS: readonly string[] = [
  "skill",
  "command",
  "plugin",
  "frontend",
  "backend",
];

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

/** Strip whole-line and trailing ` # ...` comments. YAML values in this template never contain `#`. */
function stripComments(line: string): string {
  const hash = line.indexOf("#");
  return (hash === -1 ? line : line.slice(0, hash)).trimEnd();
}

/** Return the top-level YAML key of the line, or null for indented/comment lines. */
function topLevelKey(line: string): string | null {
  if (line.startsWith("#") || /^\s/.test(line)) return null;
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):/);
  return m ? m[1] : null;
}

/** Extract the `# draft-data` fenced YAML block from the template. */
function extractDraftDataYaml(template: string): string {
  const fence = template.match(/```yaml\r?\n([\s\S]*?)```/);
  expect(fence).not.toBeNull();
  return fence![1];
}

/** Extract the leading comment lines, key line, and body lines of a top-level `key:` section. The body ends at the next top-level key or its leading comments. */
function extractTopLevelSection(
  yaml: string,
  key: string,
): { comments: string[]; body: string[] } {
  const lines = yaml.split(/\r?\n/);
  const start = lines.findIndex((l) => topLevelKey(l) === key);
  if (start === -1) return { comments: [], body: [] };
  const comments: string[] = [];
  for (let i = start - 1; i >= 0; i--) {
    if (lines[i].startsWith("#")) comments.unshift(lines[i]);
    else break;
  }
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (topLevelKey(lines[i]) !== null) break;
    if (lines[i].startsWith("#")) break;
    body.push(lines[i]);
  }
  return { comments, body };
}

function sectionText(section: { comments: string[]; body: string[] }): string {
  return [...section.comments, ...section.body].join("\n");
}

/** Extract the markdown body following a heading, until the next heading of the same level. */
function extractHeadingSection(markdown: string, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const level = heading.match(/^#+/)?.[0].length ?? 0;
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start === -1) return "";
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (new RegExp(`^#{1,${level}}\\s`).test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

/** Collect entry field names (e.g. `- id:` / `concern:`) from the template section, in order. */
function extractEntryFieldNames(sectionLines: readonly string[]): string[] {
  const names: string[] = [];
  for (const raw of sectionLines) {
    const code = stripComments(raw);
    const m = code.match(/^\s*-\s+([A-Za-z_][A-Za-z0-9_]*):/) ?? code.match(/^\s+([A-Za-z_][A-Za-z0-9_]*):/);
    if (m) names.push(m[1]);
  }
  return names;
}

/** Collect backticked field names from the Design field table rows. */
function extractTableFieldNames(section: string): string[] {
  const names: string[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = line.match(/^\|\s*`([a-z_]+)`\s*\|/);
    if (m) names.push(m[1]);
  }
  return names;
}

/** Enum words appearing in non-comment code positions of the section lines. */
function findEnumWordsInCode(sectionLines: readonly string[]): string[] {
  const hits = new Set<string>();
  for (const raw of sectionLines) {
    const code = stripComments(raw);
    if (!code.trim()) continue;
    for (const word of ENUM_WORDS) {
      if (new RegExp(`\\b${word}\\b`).test(code)) hits.add(word);
    }
  }
  return [...hits];
}

describe("realization_actions template section (REQ-008-060)", () => {
  const yaml = extractDraftDataYaml(read(TEMPLATE_REL));

  test("draft-data YAML holds a realization_actions top-level key", () => {
    const keys = yaml.split(/\r?\n/).map(topLevelKey).filter((k): k is string => k !== null);
    expect(keys).toContain("realization_actions");
  });

  test("realization_actions sits between test_strategy and review_dispositions", () => {
    const keys = yaml.split(/\r?\n/).map(topLevelKey).filter((k): k is string => k !== null);
    const iTest = keys.indexOf("test_strategy");
    const iRA = keys.indexOf("realization_actions");
    const iReview = keys.indexOf("review_dispositions");
    expect(iRA).toBeGreaterThan(iTest);
    expect(iRA).toBeGreaterThan(-1);
    expect(iRA).toBeLessThan(iReview);
  });

  test("entry fields follow the schema owner order (id, concern, responsibility, ownership_hints, intent, verification_refs, source_items)", () => {
    const fields = extractEntryFieldNames(extractTopLevelSection(yaml, "realization_actions").body);
    expect(fields).toEqual([...EXPECTED_FIELDS]);
  });

  test("id uses the RA-NNN identifier shape and verification_refs refer to TS-* items", () => {
    const section = extractTopLevelSection(yaml, "realization_actions").body.join("\n");
    expect(section).toMatch(/-\s+id:\s+RA-\{NNN\}/);
    expect(section).toMatch(/verification_refs:\s+\[TS-\{NNN\}\]/);
    expect(section).toMatch(/source_items:\s+\[AG-\{NNN\}\]/);
  });

  test("carries the soft-contract note (DEC-003): absence must not be rejected downstream", () => {
    const section = sectionText(extractTopLevelSection(yaml, "realization_actions"));
    expect(section).toMatch(/soft.?contract/i);
    expect(section).toMatch(/拒否しない/);
  });

  test("domain-neutral: no fixed artifact-kind enum value in YAML code positions", () => {
    const hits = findEnumWordsInCode(extractTopLevelSection(yaml, "realization_actions").body);
    expect(hits).toEqual([]);
  });

  test("declares the domain-neutrality rule and the artifact_actions separation in comments", () => {
    const section = sectionText(extractTopLevelSection(yaml, "realization_actions"));
    expect(section).toMatch(/固定 enum として列挙しない/);
    expect(section).toMatch(/artifact_actions とは分離/);
  });
});

describe("realization_actions schema owner (artifact-contracts.md)", () => {
  const section = extractHeadingSection(
    read(CONTRACTS_REL),
    "### realization_actions 構造",
  );

  test("schema owner section exists", () => {
    expect(section).not.toBe("");
  });

  test("field table matches the 7-field contract set in order", () => {
    expect(extractTableFieldNames(section)).toEqual([...EXPECTED_FIELDS]);
  });

  test("declares domain neutrality: no fixed artifact-kind enum", () => {
    expect(section).toMatch(/固定 enum として列挙しない/);
  });

  test("declares the soft-contract status (DEC-003)", () => {
    expect(section).toMatch(/soft contract/);
  });

  test("field table defines no artifact-kind enum column values", () => {
    const tableRows = section
      .split(/\r?\n/)
      .filter((l) => /^\|/.test(l));
    const offenders: string[] = [];
    for (const row of tableRows) {
      for (const word of ENUM_WORDS) {
        if (row.includes(`\`${word}\``)) offenders.push(word);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("realization_actions note (document-model.md)", () => {
  const doc = read(DOC_MODEL_REL);

  test("standard data model line includes realization_actions", () => {
    const line = doc
      .split(/\r?\n/)
      .find((l) => l.includes("**標準データモデル**"));
    expect(line).toBeDefined();
    expect(line!).toContain("realization_actions");
  });

  test("realization_actions 分離 line exists and forbids adding an artifact-kind enum to artifact_actions", () => {
    const line = doc
      .split(/\r?\n/)
      .find((l) => l.includes("**realization_actions 分離**"));
    expect(line).toBeDefined();
    expect(line!).toContain("realization_actions");
    expect(line!).toContain("enum を追加しない");
  });
});

describe("3-way field set alignment (template × schema owner × document model)", () => {
  test("template entry fields and schema owner table fields are identical", () => {
    const templateFields = extractEntryFieldNames(
      extractTopLevelSection(extractDraftDataYaml(read(TEMPLATE_REL)), "realization_actions").body,
    );
    const designFields = extractTableFieldNames(
      extractHeadingSection(read(CONTRACTS_REL), "### realization_actions 構造"),
    );
    expect(templateFields).toEqual([...EXPECTED_FIELDS]);
    expect(designFields).toEqual([...EXPECTED_FIELDS]);
    expect(templateFields).toEqual(designFields);
  });

  test("document model delegates the field structure to the schema owner and carries the same concepts", () => {
    const doc = read(DOC_MODEL_REL);
    // document-model.md delegates the detailed field structure to the schema
    // owner and must not re-declare a diverging field list.
    expect(doc).toContain("docs/designs/responsibilities/artifact-contracts.md");
    const separation = doc
      .split(/\r?\n/)
      .find((l) => l.includes("**realization_actions 分離**"));
    expect(separation!).toContain("正規所有責務");
    expect(separation!).toContain("検証");
  });
});
