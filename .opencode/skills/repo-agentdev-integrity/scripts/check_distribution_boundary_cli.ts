// CLI entry for the distribution boundary adapter.
//
// Split out of check_distribution_boundary.ts so the orchestrator stays
// under the 250 pure-LOC ceiling. Preserves the documented CLI contract:
//   bun run check_distribution_boundary.ts [--profile P] [--json]
//     [--save-baseline <path> | --delta <path>] [--exemptions <path>]
//     [repoRoot]
//   exit codes: 0 ok, 1 violation, 2 error.
//
// Profile values map to lib Projection (source/link/archive/archive-installed
// per docs/designs/integrity/distribution-boundary.md "projection の分離").
// Legacy installed/release values are accepted as aliases for
// link/archive-installed so existing invocations continue to work.

import type { BoundaryFailure, BoundaryReport } from "./lib/distribution-boundary-types.ts";
import type { Projection } from "./lib/distribution-boundary.ts";
import {
  buildBaseline,
  computeDelta,
  loadBaseline,
  saveBaseline,
} from "./lib/distribution-boundary-baseline.ts";
import { applyExemptions, loadExemptions } from "./lib/distribution-boundary-exemptions.ts";
import { checkDistributionRules } from "./lib/distribution-boundary-rules.ts";
import { checkDistributionBoundary } from "./check_distribution_boundary.ts";

function normalizeProfileToProjection(profile: string): Projection | null {
  switch (profile) {
    case "source":
      return "source";
    case "link":
    case "installed":
      return "link";
    case "archive":
      return "archive";
    case "archive-installed":
    case "release":
      return "archive-installed";
    default:
      return null;
  }
}

function countCategory(failures: readonly BoundaryFailure[], cat: BoundaryFailure["category"]): number {
  return failures.filter((f) => f.category === cat).length;
}

export function runCli(): void {
  const args = process.argv.slice(2);
  // Strip `--flag value` pairs before computing positional args so that a
  // profile value like "archive-installed" is not mistaken for a path.
  const STRIP_VALUE_FLAGS = new Set([
    "--profile",
    "--save-baseline",
    "--delta",
    "--exemptions",
  ]);
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (STRIP_VALUE_FLAGS.has(args[i]!)) {
      i++;
      continue;
    }
    if (args[i]!.startsWith("--")) continue;
    positional.push(args[i]!);
  }
  const repoRoot = positional[0] || process.cwd();
  const json = args.includes("--json");

  let profile = "source";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--profile" && i + 1 < args.length) {
      const next = args[i + 1];
      if (next !== undefined) profile = next;
      i++;
    }
  }
  const projection = normalizeProfileToProjection(profile);
  if (projection === null) {
    process.stderr.write(
      `error: --profile must be source|link|archive|archive-installed (or legacy installed|release) (got '${profile}')\n`,
    );
    process.exit(2);
  }

  const saveBaselineIdx = args.indexOf("--save-baseline");
  const deltaBaselineIdx = args.indexOf("--delta");
  const exemptionsIdx = args.indexOf("--exemptions");
  const baselinePath = saveBaselineIdx >= 0
    ? args[saveBaselineIdx + 1]
    : deltaBaselineIdx >= 0
      ? args[deltaBaselineIdx + 1]
      : null;
  const exemptionsPath = exemptionsIdx >= 0 ? args[exemptionsIdx + 1] : null;

  const rawReport = checkDistributionBoundary(repoRoot, projection);
  const exemptions = exemptionsPath ? loadExemptions(exemptionsPath) : null;
  const exemptionResult = applyExemptions(rawReport.failures, exemptions, repoRoot);
  const report: BoundaryReport = {
    ok: exemptionResult.remaining.length === 0,
    failures: exemptionResult.remaining,
    stats: {
      scanned_files: rawReport.stats.scanned_files,
      concrete_id_hits: countCategory(exemptionResult.remaining, "concrete-id"),
      concrete_path_hits: countCategory(exemptionResult.remaining, "concrete-path"),
      fixed_url_hits: countCategory(exemptionResult.remaining, "fixed-url"),
    },
  };

  if (saveBaselineIdx >= 0 && baselinePath) {
    const baseline = buildBaseline(
      rawReport,
      repoRoot,
      "IR-059 distribution reference boundary known-violations baseline",
    );
    saveBaseline(baseline, baselinePath);
    if (json) {
      process.stdout.write(
        JSON.stringify({ saved: baselinePath, entries: baseline.entries.length }, null, 2) + "\n",
      );
    } else {
      process.stdout.write(`baseline saved: ${baselinePath}\n`);
      process.stdout.write(`entries: ${baseline.entries.length}\n`);
    }
    process.exit(0);
  }

  if (deltaBaselineIdx >= 0 && baselinePath) {
    const baseline = loadBaseline(baselinePath);
    if (baseline === null) {
      process.stderr.write(`error: cannot load baseline at ${baselinePath}\n`);
      process.exit(2);
    }
    const delta = computeDelta(report, baseline, repoRoot);
    if (json) {
      const payload = { ...delta, exempted_count: exemptionResult.exempted.length };
      process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
    } else {
      process.stdout.write(`check_distribution_boundary.ts - delta guard\n`);
      process.stdout.write(`=============================================================\n`);
      process.stdout.write(`profile: ${profile}\n`);
      process.stdout.write(`repoRoot: ${repoRoot}\n`);
      process.stdout.write(`baseline: ${baselinePath}\n`);
      if (exemptionsPath) {
        process.stdout.write(
          `exemptions: ${exemptionsPath} (${exemptionResult.exempted.length} exempted)\n`,
        );
      }
      process.stdout.write(`ok: ${delta.ok}\n`);
      process.stdout.write(`stats: ${JSON.stringify(delta.stats, null, 2)}\n`);
      process.stdout.write(`new failures (${delta.new_failures.length}):\n`);
      for (const f of delta.new_failures) {
        process.stdout.write(
          `  [${f.category}] ${f.file}:${f.line} matched=${f.matched}\n    snippet: ${f.snippet}\n`,
        );
      }
      if (delta.resolved.length > 0) {
        process.stdout.write(`resolved (${delta.resolved.length}):\n`);
        for (const r of delta.resolved) {
          process.stdout.write(
            `  [${r.category}] ${r.file} matched=${r.matched} (${r.baseline_count} -> ${r.current_count})\n`,
          );
        }
      }
    }
    process.exit(delta.ok ? 0 : 1);
  }

  // IR-046/047/048 観点を正規実行経路へ統合（AC-04/05: detector 到達可能性）
  const rulesResult = checkDistributionRules(repoRoot);
  const combinedOk = report.ok && rulesResult.ok;

  if (json) {
    const payload = { ...report, rules: rulesResult };
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    process.stdout.write(`check_distribution_boundary.ts - distribution reference boundary\n`);
    process.stdout.write(`=============================================================\n`);
    process.stdout.write(`profile: ${profile}\n`);
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.category}] ${f.file}:${f.line} matched=${f.matched}\n    snippet: ${f.snippet}\n`,
      );
    }
    process.stdout.write(
      `\nrules findings (IR-046/047/048, scanned=${rulesResult.stats.scanned_files}):\n`,
    );
    for (const f of rulesResult.findings) {
      process.stdout.write(
        `  [${f.rule}] ${f.file}:${f.line} matched=${f.matched}\n    ${f.description}\n`,
      );
    }
  }
  process.exit(combinedOk ? 0 : 1);
}
