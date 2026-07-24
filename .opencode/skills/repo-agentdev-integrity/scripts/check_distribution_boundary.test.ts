/**
 * Tests for check_distribution_boundary.ts.
 *
 * Covers concrete-id / concrete-path / fixed-url detection, plus the
 * template-line exemptions and README.md allowance. Uses an in-memory
 * fixture tree so the test does not depend on the real repo state.
 */

import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import {
  checkDistributionBoundary,
  buildBaseline,
  saveBaseline,
  loadBaseline,
  computeDelta,
} from "./check_distribution_boundary.ts";
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

describe("baseline build / save / load", () => {
  test("buildBaseline dedupes by (file, category, matched) and counts occurrences", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "test baseline");
    expect(baseline.version).toBe(1);
    expect(baseline.rule_id).toBe("IR-059");
    expect(baseline.description).toBe("test baseline");

    const idEntry = baseline.entries.find(
      (e) => e.category === "concrete-id" && e.matched === "ADR-0135",
    );
    expect(idEntry).toBeDefined();
    expect(idEntry!.count).toBe(1);
    expect(idEntry!.file).toBe("src/opencode/commands/agentdev/sample.md");

    const totalCount = baseline.entries.reduce((s, e) => s + e.count, 0);
    expect(totalCount).toBe(report.failures.length);
  });

  test("saveBaseline then loadBaseline round-trips", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "roundtrip");
    const tmpFile = path.join(TMP_ROOT, "baseline.json");
    saveBaseline(baseline, tmpFile);
    const reloaded = loadBaseline(tmpFile);
    expect(reloaded).not.toBeNull();
    expect(reloaded!.entries.length).toBe(baseline.entries.length);
    expect(reloaded!.description).toBe("roundtrip");
    fs.unlinkSync(tmpFile);
  });

  test("loadBaseline returns null for malformed or wrong-rule files", () => {
    const bad = path.join(TMP_ROOT, "bad.json");
    fs.writeFileSync(bad, JSON.stringify({ version: 2, rule_id: "other" }), "utf8");
    expect(loadBaseline(bad)).toBeNull();
    fs.writeFileSync(bad, "not json at all", "utf8");
    expect(loadBaseline(bad)).toBeNull();
    expect(loadBaseline(path.join(TMP_ROOT, "absent.json"))).toBeNull();
    fs.unlinkSync(bad);
  });
});

describe("computeDelta", () => {
  test("delta is empty when current matches baseline", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const delta = computeDelta(report, baseline, TMP_ROOT);
    expect(delta.ok).toBe(true);
    expect(delta.new_failures.length).toBe(0);
    expect(delta.resolved.length).toBe(0);
    expect(delta.stats.new_delta).toBe(0);
    expect(delta.stats.current_total).toBe(report.failures.length);
    expect(delta.stats.baseline_total).toBe(report.failures.length);
  });

  test("delta flags a newly introduced violation", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const newFailure = {
      category: "concrete-id" as const,
      file: path.join(TMP_ROOT, "src/opencode/commands/agentdev/sample.md"),
      line: 99,
      snippet: "Newly introduced REQ-1234 reference",
      matched: "REQ-1234",
    };
    const reportWithExtra = { ...report, failures: [...report.failures, newFailure] };
    const delta = computeDelta(reportWithExtra, baseline, TMP_ROOT);
    expect(delta.ok).toBe(false);
    expect(delta.new_failures.length).toBe(1);
    expect(delta.new_failures[0]!.matched).toBe("REQ-1234");
    expect(delta.stats.new_delta).toBe(1);
  });

  test("delta reports resolved when a baseline violation disappears", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const pruned = report.failures.filter((f) => f.matched !== "ADR-0135");
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const delta = computeDelta(
      { ...report, failures: pruned },
      baseline,
      TMP_ROOT,
    );
    expect(delta.ok).toBe(true);
    expect(delta.resolved.length).toBeGreaterThan(0);
    const resolvedAdr = delta.resolved.find((r) => r.matched === "ADR-0135");
    expect(resolvedAdr).toBeDefined();
    expect(resolvedAdr!.baseline_count).toBe(1);
    expect(resolvedAdr!.current_count).toBe(0);
  });

  test("delta counts overshoot within the same signature as new violations", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const sameFile = path.join(TMP_ROOT, "src/opencode/commands/agentdev/sample.md");
    const extra = {
      category: "concrete-id" as const,
      file: sameFile,
      line: 200,
      snippet: "duplicate ADR-0135",
      matched: "ADR-0135",
    };
    const reportWithExtra = { ...report, failures: [...report.failures, extra] };
    const delta = computeDelta(reportWithExtra, baseline, TMP_ROOT);
    expect(delta.ok).toBe(false);
    expect(delta.stats.new_delta).toBe(1);
    expect(delta.new_failures[0]!.matched).toBe("ADR-0135");
  });
});
