/**
 * Tests for check_distribution_boundary.ts.
 *
 * Covers concrete-id / concrete-path / fixed-url detection, plus the
 * template-line exemptions and README.md allowance. Uses an in-memory
 * fixture tree so the test does not depend on the real repo state.
 */

import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { checkDistributionBoundary } from "./check_distribution_boundary.ts";
import * as path from "path";
import * as fs from "fs";

const TMP_ROOT = path.join(
  process.cwd(),
  ".worktrees-tmp-test-distribution-boundary",
);

function writeFile(rel: string, content: string): void {
  const full = path.join(TMP_ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

beforeAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });

  // Public command body with each violation category.
  writeFile(
    "src/opencode/commands/agentdev/sample.md",
    [
      "# sample command",
      "",
      "Read ADR-0135 first.",
      "See docs/adr/README.md for the index.",
      "Template form docs/specs/<domain>/<spec>.md is allowed.",
      "Glob form docs/requirements/REQ-*.md is allowed.",
      "Bad: docs/requirements/REQ-0149.md is a concrete ref.",
      "Bad: <https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md>",
      "Bad: raw.githubusercontent.com/yogata/agent-dev-flow/main/x.md",
      "",
    ].join("\n"),
  );

  // Public skill body, all-clean.
  writeFile(
    "src/opencode/skills/agentdev-foo/SKILL.md",
    [
      "# foo skill",
      "",
      "References must flow via extension layer.",
      "Pattern docs/specs/** is fine.",
      "ID template REQ-{NNNN} is fine.",
      "",
    ].join("\n"),
  );

  // Non-agentdev skill should be ignored even if it has refs.
  writeFile(
    "src/opencode/skills/other-skill/SKILL.md",
    "Ignore: ADR-9999 and docs/adr/ADR-9999.md\n",
  );

  // README.md under commands should still be scanned (it is in commands/).
  writeFile(
    "src/opencode/commands/agentdev/README.md",
    "# commands index\nNo concrete refs here.\n",
  );
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

describe("checkDistributionBoundary", () => {
  test("flags concrete IDs, concrete paths, and fixed URLs", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    expect(report.ok).toBe(false);

    const categories = report.failures.map((f) => f.category).sort();
    expect(categories).toContain("concrete-id");
    expect(categories).toContain("concrete-path");
    expect(categories).toContain("fixed-url");

    // Concrete ID: ADR-0135 on line 3 of sample.md
    const idHit = report.failures.find(
      (f) => f.category === "concrete-id" && f.matched === "ADR-0135",
    );
    expect(idHit).toBeDefined();
    expect(idHit!.line).toBe(3);

    // Concrete path: docs/requirements/REQ-0149.md
    const pathHit = report.failures.find(
      (f) => f.category === "concrete-path" && f.matched === "docs/requirements/REQ-0149.md",
    );
    expect(pathHit).toBeDefined();

    // Fixed URL
    const urlHit = report.failures.find((f) => f.category === "fixed-url");
    expect(urlHit).toBeDefined();
  });

  test("exempts template forms and README index", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    // README index path should NOT be flagged.
    const readmeHit = report.failures.find(
      (f) => f.matched === "docs/adr/README.md",
    );
    expect(readmeHit).toBeUndefined();

    // Template forms should NOT be flagged.
    const tmplHits = report.failures.filter(
      (f) =>
        f.matched.includes("docs/specs/<") ||
        f.matched.includes("REQ-*") ||
        f.matched.includes("{NNNN}"),
    );
    expect(tmplHits.length).toBe(0);
  });

  test("ignores non-agentdev skills", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    // other-skill had ADR-9999 but should not be scanned.
    const strangerHit = report.failures.find((f) =>
      f.file.includes("other-skill"),
    );
    expect(strangerHit).toBeUndefined();
  });

  test("stats are well-formed", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    expect(report.stats.scanned_files).toBeGreaterThan(0);
    expect(report.stats.concrete_id_hits).toBeGreaterThan(0);
    expect(report.stats.concrete_path_hits).toBeGreaterThan(0);
    expect(report.stats.fixed_url_hits).toBeGreaterThan(0);
  });
});
