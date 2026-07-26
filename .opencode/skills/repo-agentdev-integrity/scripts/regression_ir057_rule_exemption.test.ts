import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  copyFileSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { join } from "path";

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
      "Detect `generated_by: local-opencode-transform` in inputs.",
      "",
    ].join("\n"),
    "utf-8",
  );
}

function runGuard(fileName: string): {
  readonly exitCode: number;
  readonly report: GuardReport;
} {
  const scriptPath = join(FIXTURE_SCRIPT_DIR, "check_changed_docs.ts");
  const relativePath = `docs/specs/integrity/rules/${fileName}`;
  const process = Bun.spawnSync(
    [
      "bun",
      "run",
      scriptPath,
      "--workflow",
      "docs-check",
      "--files",
      relativePath,
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
  writeRule("IR-049-non-exempt-fixture.md");
});

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("IR-057 rule-definition exemptions", () => {
  it("does not flag IR-046 when it names the legacy identifier it detects", () => {
    // Given: IR-046 defines detection of the retired generated_by identifier.
    // When: the targeted docs guard checks that rule definition.
    const result = runGuard(
      "IR-046-consumer-generated-repo-type-fp-prevention.md",
    );

    // Then: the documented IR-046 exemption prevents an IR-057 failure.
    expect(result.exitCode).toBe(0);
    expect(result.report.failures).toEqual([]);
  });

  it("still flags the same legacy identifier in a non-exempt rule file", () => {
    // Given: an ordinary rule file contains the retired identifier.
    // When: the targeted docs guard checks that file.
    const result = runGuard("IR-049-non-exempt-fixture.md");

    // Then: IR-057 remains strict outside the documented exemptions.
    expect(result.exitCode).not.toBe(0);
    expect(result.report.failures).toContainEqual(
      expect.objectContaining({
        rule_id: "IR-057",
        file: "docs/specs/integrity/rules/IR-049-non-exempt-fixture.md",
      }),
    );
  });
});
