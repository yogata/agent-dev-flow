import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  copyFileSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";

import { isIr057PathExempt } from "./ir057_history_exemption.ts";

const SCRIPT_DIR = import.meta.dir;
const TEMP_ROOT = join(
  "C:",
  "WINDOWS",
  "TEMP",
  "opencode",
  `ir057-rule-exemption-${crypto.randomUUID().slice(0, 8)}`,
);
const FIXTURE_SCRIPT_DIR = join(
  TEMP_ROOT,
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "scripts",
);
const RULES_DIR = join(TEMP_ROOT, "docs", "specs", "integrity", "rules");

type GuardReport = {
  readonly failures: readonly {
    readonly rule_id: string;
    readonly file: string;
  }[];
};

const LEGACY_VOCAB_LINE = "Detect `generated_by: local-opencode-transform` in inputs.";

function writeRule(fileName: string): void {
  writeFileSync(
    join(RULES_DIR, fileName),
    [
      "---",
      "status: accepted",
      "---",
      "",
      "# Fixture rule",
      "",
      LEGACY_VOCAB_LINE,
      "",
    ].join("\n"),
    "utf-8",
  );
}

function writeFixtureAtRelPath(relPath: string): void {
  const abs = join(TEMP_ROOT, ...relPath.split("/"));
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, `${LEGACY_VOCAB_LINE}\n`, "utf-8");
}

function runGuardForRelPath(relPath: string): {
  readonly exitCode: number;
  readonly report: GuardReport;
} {
  const scriptPath = join(FIXTURE_SCRIPT_DIR, "check_changed_docs.ts");
  const process = Bun.spawnSync(
    [
      "bun",
      "run",
      scriptPath,
      "--workflow",
      "docs-check",
      "--files",
      relPath,
      "--json",
    ],
    {
      cwd: TEMP_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  return {
    exitCode: process.exitCode ?? -1,
    report: JSON.parse(process.stdout.toString("utf-8")),
  };
}

beforeAll(() => {
  mkdirSync(FIXTURE_SCRIPT_DIR, { recursive: true });
  mkdirSync(RULES_DIR, { recursive: true });
  mkdirSync(join(TEMP_ROOT, "docs", "specs", "integrity"), {
    recursive: true,
  });

  for (const fileName of [
    "check_changed_docs.ts",
    "cli_utils.ts",
    "ir057_history_exemption.ts",
  ]) {
    copyFileSync(join(SCRIPT_DIR, fileName), join(FIXTURE_SCRIPT_DIR, fileName));
  }

  writeFileSync(
    join(TEMP_ROOT, "docs", "specs", "integrity", "obsolete-path-map.yaml"),
    [
      "entries:",
      "legacy_local_generation_vocabulary:",
      '  - term: "local-opencode-transform"',
      '    severity: "ng"',
      "",
    ].join("\n"),
    "utf-8",
  );

  writeRule("IR-046-consumer-generated-repo-type-fp-prevention.md");
  writeRule("IR-048-generated-by-identifier-integrity.md");
  writeRule("IR-049-non-exempt-fixture.md");
  writeRule("IR-046-unrelated-topic.md");
  writeRule("IR-048-unrelated-topic.md");

  for (const rel of [
    "docs/requirements/REQ-009.md",
    "docs/specs/local/runtime-package-boundary.md",
    "docs/guides/glossary.md",
    "docs/specs/local/local-generation.md",
    "docs/something.test.ts",
  ]) {
    writeFixtureAtRelPath(rel);
  }
});

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("isIr057PathExempt pure predicate (shared semantics)", () => {
  it("exempts the canonical IR-046 rule file by exact name", () => {
    expect(
      isIr057PathExempt(
        "docs/specs/integrity/rules/IR-046-consumer-generated-repo-type-fp-prevention.md",
      ),
    ).toBe(true);
  });

  it("exempts the canonical IR-048 rule file by exact name", () => {
    expect(
      isIr057PathExempt(
        "docs/specs/integrity/rules/IR-048-generated-by-identifier-integrity.md",
      ),
    ).toBe(true);
  });

  it("exempts the IR-057 rule definition by exact name", () => {
    expect(
      isIr057PathExempt(
        "docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md",
      ),
    ).toBe(true);
  });

  it("does NOT exempt an IR-046 near-name (no wildcard)", () => {
    expect(
      isIr057PathExempt("docs/specs/integrity/rules/IR-046-unrelated-topic.md"),
    ).toBe(false);
  });

  it("does NOT exempt an IR-048 near-name (no wildcard)", () => {
    expect(
      isIr057PathExempt("docs/specs/integrity/rules/IR-048-unrelated-topic.md"),
    ).toBe(false);
  });

  it("exempts SPEC-listed fixtures: obsolete-path-map, catalog, rule-ownership, REQ-009, runtime-package-boundary, glossary", () => {
    expect(isIr057PathExempt("docs/specs/integrity/obsolete-path-map.yaml")).toBe(true);
    expect(isIr057PathExempt("docs/specs/integrity/integrity-rule-catalog.md")).toBe(true);
    expect(isIr057PathExempt("docs/specs/integrity/rule-ownership.md")).toBe(true);
    expect(isIr057PathExempt("docs/requirements/REQ-009.md")).toBe(true);
    expect(isIr057PathExempt("docs/specs/local/runtime-package-boundary.md")).toBe(true);
    expect(isIr057PathExempt("docs/guides/glossary.md")).toBe(true);
  });

  it("exempts retired dirs, test fixtures, vocabulary-registry, check_integrity.ts, SKILL/references", () => {
    expect(isIr057PathExempt("docs/requirements/retired/v2:REQ-0158.md")).toBe(true);
    expect(isIr057PathExempt("docs/adr/retired/ADR-9999.md")).toBe(true);
    expect(isIr057PathExempt("foo/bar.test.ts")).toBe(true);
    expect(
      isIr057PathExempt(
        ".opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md",
      ),
    ).toBe(true);
    expect(
      isIr057PathExempt(
        ".opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts",
      ),
    ).toBe(true);
    expect(
      isIr057PathExempt(".opencode/skills/repo-agentdev-integrity/SKILL.md"),
    ).toBe(true);
  });

  it("does NOT exempt stale local-generation path", () => {
    expect(isIr057PathExempt("docs/specs/local/local-generation.md")).toBe(false);
  });

  it("does NOT exempt deleted REQ-0141 / REQ-0158 (stale exemptions removed)", () => {
    expect(isIr057PathExempt("docs/requirements/REQ-0141.md")).toBe(false);
    expect(isIr057PathExempt("docs/requirements/REQ-0158.md")).toBe(false);
  });

  it("normalizes Windows backslash separators", () => {
    expect(
      isIr057PathExempt("docs\\guides\\glossary.md"),
    ).toBe(true);
  });
});

describe("IR-057 rule-definition exemptions (targeted guard)", () => {
  it("does not flag IR-046 when it names the legacy identifier it detects", () => {
    // Given: IR-046 defines detection of the retired generated_by identifier.
    // When: the targeted docs guard checks that rule definition.
    const result = runGuardForRelPath(
      "docs/specs/integrity/rules/IR-046-consumer-generated-repo-type-fp-prevention.md",
    );

    // Then: the documented IR-046 exemption prevents an IR-057 failure.
    expect(result.exitCode).toBe(0);
    expect(result.report.failures).toEqual([]);
  });

  it("does not flag IR-048 when it names the legacy identifier it detects", () => {
    // Given: IR-048 defines detection of the retired generated_by identifier.
    // When: the targeted docs guard checks that rule definition.
    const result = runGuardForRelPath(
      "docs/specs/integrity/rules/IR-048-generated-by-identifier-integrity.md",
    );

    // Then: the documented IR-048 exemption prevents an IR-057 failure.
    expect(result.exitCode).toBe(0);
    expect(result.report.failures).toEqual([]);
  });

  it("still flags the same legacy identifier in a non-exempt rule file", () => {
    // Given: an ordinary rule file contains the retired identifier.
    // When: the targeted docs guard checks that file.
    const result = runGuardForRelPath(
      "docs/specs/integrity/rules/IR-049-non-exempt-fixture.md",
    );

    // Then: IR-057 remains strict outside the documented exemptions.
    expect(result.exitCode).not.toBe(0);
    expect(result.report.failures).toContainEqual(
      expect.objectContaining({
        rule_id: "IR-057",
        file: "docs/specs/integrity/rules/IR-049-non-exempt-fixture.md",
      }),
    );
  });

  it("flags an IR-046 near-name rule file (no wildcard exemption)", () => {
    // Given: a rule file with an IR-046 prefix but not the canonical name.
    // When: the targeted docs guard checks that file.
    const result = runGuardForRelPath(
      "docs/specs/integrity/rules/IR-046-unrelated-topic.md",
    );

    // Then: the near-name is not exempt; IR-057 fires.
    expect(result.exitCode).not.toBe(0);
    expect(result.report.failures).toContainEqual(
      expect.objectContaining({
        rule_id: "IR-057",
        file: "docs/specs/integrity/rules/IR-046-unrelated-topic.md",
      }),
    );
  });

  it("flags an IR-048 near-name rule file (no wildcard exemption)", () => {
    // Given: a rule file with an IR-048 prefix but not the canonical name.
    // When: the targeted docs guard checks that file.
    const result = runGuardForRelPath(
      "docs/specs/integrity/rules/IR-048-unrelated-topic.md",
    );

    // Then: the near-name is not exempt; IR-057 fires.
    expect(result.exitCode).not.toBe(0);
    expect(result.report.failures).toContainEqual(
      expect.objectContaining({
        rule_id: "IR-057",
        file: "docs/specs/integrity/rules/IR-048-unrelated-topic.md",
      }),
    );
  });
});

describe("IR-057 SPEC-listed fixture exemptions (targeted guard)", () => {
  it("does not flag legacy vocab in docs/specs/local/runtime-package-boundary.md", () => {
    const result = runGuardForRelPath(
      "docs/specs/local/runtime-package-boundary.md",
    );
    expect(result.exitCode).toBe(0);
    expect(result.report.failures).toEqual([]);
  });

  it("does not flag legacy vocab in docs/requirements/REQ-009.md", () => {
    const result = runGuardForRelPath("docs/requirements/REQ-009.md");
    expect(result.exitCode).toBe(0);
    expect(result.report.failures).toEqual([]);
  });

  it("does not flag legacy vocab in docs/guides/glossary.md", () => {
    const result = runGuardForRelPath("docs/guides/glossary.md");
    expect(result.exitCode).toBe(0);
    expect(result.report.failures).toEqual([]);
  });

  it("does not flag legacy vocab in a *.test.ts fixture", () => {
    const result = runGuardForRelPath("docs/something.test.ts");
    expect(result.exitCode).toBe(0);
    expect(result.report.failures).toEqual([]);
  });
});

describe("IR-057 stale exemption removal (targeted guard)", () => {
  it("flags legacy vocab in the stale local-generation path (not exempt)", () => {
    // Given: the stale local-generation.md path contains legacy vocab.
    // When: the targeted docs guard checks that file.
    const result = runGuardForRelPath(
      "docs/specs/local/local-generation.md",
    );

    // Then: the stale exemption is removed; IR-057 fires.
    expect(result.exitCode).not.toBe(0);
    expect(result.report.failures).toContainEqual(
      expect.objectContaining({
        rule_id: "IR-057",
        file: "docs/specs/local/local-generation.md",
      }),
    );
  });
});
