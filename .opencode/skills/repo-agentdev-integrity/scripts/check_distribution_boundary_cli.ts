// ADF-COVERS(implementation): REQ-047-009
// CLI entry for the distribution boundary adapter.
//
// Split out of check_distribution_boundary.ts so the orchestrator stays
// under the 250 pure-LOC ceiling. Preserves the documented CLI contract:
//   bun run check_distribution_boundary.ts [--profile P] [--json] [repoRoot]
//   exit codes: 0 ok, 1 violation, 2 error. baseline / exemption 運用は撤廃済みで
//   あり、検出違反は免除せず対象側の直接修正で解消する。
//
// Profile values map to lib Projection (source/link/archive/archive-installed
// per docs/designs/integrity/distribution-boundary.md "projection の分離").
// Legacy installed/release values are accepted as aliases for
// link/archive-installed so existing invocations continue to work.

import type { Projection } from "./lib/distribution-boundary.ts";
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

export function runCli(): void {
  const args = process.argv.slice(2);
  // Strip `--flag value` pairs before computing positional args so that a
  // profile value like "archive-installed" is not mistaken for a path.
  const STRIP_VALUE_FLAGS = new Set([
    "--profile",
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

  const report = checkDistributionBoundary(repoRoot, projection);
  const warnings = report.warnings ?? [];
  if (warnings.length > 0) {
    for (const w of warnings) {
      process.stderr.write(`warning: ${w}\n`);
    }
  }

  // IR-059/IR-047/IR-048 観点を正規実行経路へ統合（AC-04/05: detector 到達可能性）。
  // data/distribution-targets.yaml は正本定義（REQ-047-009）: 欠損・不正時は
  // fail-closed で検査を実行せず停止する（exit 2）。
  let rulesResult;
  try {
    rulesResult = checkDistributionRules(repoRoot);
  } catch (err) {
    process.stderr.write(
      `check_distribution_boundary.ts: ${err instanceof Error ? err.message : err}\n`,
    );
    process.exit(2);
  }
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
    if (warnings.length > 0) {
      process.stdout.write(`warnings (${warnings.length}):\n`);
      for (const w of warnings) {
        process.stdout.write(`  ${w}\n`);
      }
    }
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.category}] ${f.file}:${f.line} matched=${f.matched}\n    snippet: ${f.snippet}\n`,
      );
    }
    process.stdout.write(
      `\nrules findings (IR-047/048, scanned=${rulesResult.stats.scanned_files}):\n`,
    );
    for (const f of rulesResult.findings) {
      process.stdout.write(
        `  [${f.rule}] ${f.file}:${f.line} matched=${f.matched}\n    ${f.description}\n`,
      );
    }
  }
  process.exit(combinedOk ? 0 : 1);
}

if (import.meta.main) {
  runCli();
}
