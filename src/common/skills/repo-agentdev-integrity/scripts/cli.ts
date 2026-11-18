// scripts/cli.ts — 検証エンジンのエントリーポイント。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md
// 「モジュール構成（src/ 正本）」「差分実行・自動起票ランナー」、
// docs/designs/integrity/targeted-docs-guard-implementation.md（targeted docs guard）。
// フラグ: --changed / --emit-intake / --rule <id> / --json
//         --workflow <name>（targeted docs guard モード）:
//         --files <path...> / --base-ref <ref> / --declared-files <path...> /
//         --fail-level <strict|warning>
// Exit codes: 0 = OK（対象外のみの差分実行を含む）、1 = 違反または warning あり、2 = 実行エラー。

import * as fs from "node:fs";
import * as path from "node:path";
import { buildContext } from "../engine/context.ts";
import { collectViolations, runRules, selectRules } from "../engine/runner.ts";
import {
  computeSummary,
  emitIntake,
  formatMarkdownReport,
  writeReportFile,
} from "../engine/reporter.ts";
import type { RuleResult } from "../engine/types.ts";
import {
  TARGETED_WORKFLOWS,
  createNodeTargetedDeps,
  formatTargetedDocsTextReport,
  runTargetedDocsGate,
} from "../engine/targeted-gate.ts";
import type { TargetedFailLevel, TargetedWorkflow } from "../engine/targeted-gate.ts";
import { isInsideWorktree, runBuiltinChecks } from "../lib/builtin-checks.ts";
import { rules } from "../rules/index.ts";

const EXIT_OK = 0;
const EXIT_NG = 1;
const EXIT_ERROR = 2;

interface CliOptions {
  help: boolean;
  json: boolean;
  changed: boolean;
  emitIntake: boolean;
  rule: string | null;
  root: string | null;
  workflow: TargetedWorkflow | null;
  files: string[];
  baseRef: string | null;
  declaredFiles: string[];
  failLevel: TargetedFailLevel;
}

function isTargetedWorkflow(value: string): value is TargetedWorkflow {
  return (TARGETED_WORKFLOWS as readonly string[]).includes(value);
}

function parseCliArgs(args: readonly string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    json: false,
    changed: false,
    emitIntake: false,
    rule: null,
    root: null,
    workflow: null,
    files: [],
    baseRef: null,
    declaredFiles: [],
    failLevel: "strict",
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--changed") options.changed = true;
    else if (arg === "--emit-intake") options.emitIntake = true;
    else if (arg === "--rule") {
      i += 1;
      options.rule = args[i] ?? null;
    } else if (arg === "--root") {
      i += 1;
      options.root = args[i] ?? null;
    } else if (arg === "--workflow") {
      i += 1;
      const value = args[i];
      if (value === undefined || !isTargetedWorkflow(value)) {
        throw new Error(
          `--workflow must be one of: ${TARGETED_WORKFLOWS.join(", ")} (got: ${value ?? "(none)"})`,
        );
      }
      options.workflow = value;
    } else if (arg === "--files") {
      i++;
      while (i < args.length && !args[i]!.startsWith("--")) {
        // space 区切り推奨。comma 区切り（例: --files a.md,b.md）も受入（混在可）。
        for (const token of args[i]!.split(",")) {
          const trimmed = token.trim();
          if (trimmed.length > 0) options.files.push(trimmed);
        }
        i++;
      }
      i--;
    } else if (arg === "--base-ref") {
      i += 1;
      const value = args[i];
      if (value === undefined || value.length === 0) {
        throw new Error("--base-ref requires a value");
      }
      options.baseRef = value;
    } else if (arg === "--declared-files") {
      i++;
      while (i < args.length && !args[i]!.startsWith("--")) {
        for (const token of args[i]!.split(",")) {
          const trimmed = token.trim();
          if (trimmed.length > 0) options.declaredFiles.push(trimmed);
        }
        i++;
      }
      i--;
    } else if (arg === "--fail-level") {
      i += 1;
      const value = args[i];
      if (value !== "strict" && value !== "warning") {
        throw new Error(`--fail-level must be strict or warning (got: ${value ?? "(none)"})`);
      }
      options.failLevel = value;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return options;
}

function printHelp(): void {
  process.stdout.write(
    `cli.ts — AgentDevFlow integrity engine (DEC-065 decision 3)

USAGE:
  bun run cli.ts [--changed] [--emit-intake] [--rule <id>] [--json] [--root <path>]
  bun run cli.ts --workflow <name> (--files <path...> | --base-ref <ref>)
                 [--declared-files <path...>] [--fail-level <strict|warning>]
                 [--json] [--root <path>]

FLAGS:
  --changed        Differential run: only rules whose targetGlobs match the staged
                   changes (git diff --cached; falls back to git diff --name-only HEAD).
                   Non-target-only changes exit 0 immediately.
  --emit-intake    Auto-ticket severity: warning violations to
                   .agentdev/intake/inbox/YYYY-MM-DD-auto-<rule-id-lower>.md
                   (idempotent: an existing auto ticket for the same rule id is skipped).
  --rule <id>      Run a single rule (e.g. --rule IR-001).
  --json           JSON report output.
  --root <path>    Explicit repository root.

TARGETED DOCS GUARD (--workflow mode):
  --workflow <name>          req-save | design-save | case-run | case-close | docs-check.
  --files <path...>          Explicit changed files (space-separated recommended;
                            comma-separated also accepted). Standard mode for pre-commit
                            worktree verification including untracked files, and for
                            explicit PR file specification on main (case-close).
                            Empty files_checked is a FAILURE (REQ-010-076).
  --base-ref <git-ref>       Committed-diff base (base...HEAD). Run after commit and
                            before push only. Empty files_checked is a FAILURE.
                            Git enumeration failure exits 2 (never an empty success).
  --declared-files <path...> Cross-check declared doc update targets vs actual changes.
  --fail-level <level>       strict (default) | warning.
  Report: files_checked (derived from input via existence + profile filtering, not an
  echo), unchecked_reasons, failures, warnings, and update-required flags
  (doc_map/spec_readme/requirements_readme, full_docs_check_recommended,
  extensions_check_required). Workflow side judges empty/mismatch fail-closed
  (REQ-010-076, REQ-032-023); the engine exit code alone never decides acceptance.
  PowerShell: pass multiple paths via an array variable or individually; never
  --files "a.md b.md" (quoted bundling can fail to split).

EXIT CODES:
  0  no violations/warnings (or --changed run with no target matches)
  1  violations or warnings detected
  2  execution error (bad arguments, git enumeration failure)
`,
  );
}

function runGit(repoRoot: string, args: readonly string[]): string | null {
  const { execFileSync } = require("node:child_process") as typeof import("node:child_process");
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf-8",
      maxBuffer: 64 * 1024 * 1024,
    }) as string;
  } catch {
    return null;
  }
}

function getChangedFiles(repoRoot: string): string[] {
  const staged = runGit(repoRoot, ["diff", "--cached", "--name-only"]);
  if (staged !== null) {
    const files = staged.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (files.length > 0) return files;
  }
  const unstaged = runGit(repoRoot, ["diff", "--name-only", "HEAD"]);
  if (unstaged === null) return [];
  return unstaged.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
}

function findRepoRoot(start: string): string {
  let cur = path.resolve(start);
  while (!fs.existsSync(path.join(cur, ".git"))) {
    const parent = path.dirname(cur);
    if (parent === cur) return start;
    cur = parent;
  }
  return cur;
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    process.exit(EXIT_OK);
  }
  // --root は検査対象リポジトリルートの明示指定であり権威である（上位 .git
  // 探索で誤リポジトリへ解決しない。誤解決は検査見逃しとして扱う）。
  const repoRoot = options.root !== null ? path.resolve(options.root) : findRepoRoot(process.cwd());

  if (options.workflow !== null) {
    if (options.changed || options.rule !== null || options.emitIntake) {
      throw new Error(
        "--workflow (targeted docs guard) cannot be combined with --changed / --rule / --emit-intake",
      );
    }
    const outcome = await runTargetedDocsGate(
      {
        repoRoot,
        workflow: options.workflow,
        files: options.files,
        baseRef: options.baseRef,
        declaredFiles: options.declaredFiles,
        failLevel: options.failLevel,
      },
      createNodeTargetedDeps(repoRoot),
      rules,
    );
    const output = options.json
      ? JSON.stringify(outcome.report, null, 2) + "\n"
      : formatTargetedDocsTextReport(outcome.report) + "\n";
    process.stdout.write(output);
    process.exit(outcome.exitCode);
  }
  if (options.files.length > 0 || options.baseRef !== null || options.declaredFiles.length > 0) {
    throw new Error("--files / --base-ref / --declared-files require --workflow");
  }

  const changedFiles = options.changed ? getChangedFiles(repoRoot) : [];
  const ruleFilter = options.rule;
  const selection = selectRules(rules, changedFiles, ruleFilter);

  if (selection.nonTargetOnly) {
    const message =
      `--changed: ${changedFiles.length} changed file(s) match no rule targetGlobs; exiting 0 (non-target-only changes)`;
    if (options.json) {
      process.stdout.write(
        JSON.stringify({ mode: "changed", nonTargetOnly: true, changedFiles, exitReason: message }, null, 2) + "\n",
      );
    } else {
      process.stdout.write(message + "\n");
    }
    process.exit(EXIT_OK);
  }

  const ctx = buildContext(repoRoot, changedFiles);
  const results: RuleResult[] = await runRules(selection.selected, ctx);
  const builtinViolations = runBuiltinChecks(ctx);
  const violations = [...collectViolations(results), ...builtinViolations];

  const timestamp = new Date().toISOString();
  const summary = computeSummary([
    ...results,
    { ruleId: "builtin-checks", violations: builtinViolations },
  ]);
  const mode: "full" | "changed" | "rule" = options.changed
    ? "changed"
    : ruleFilter !== null
      ? "rule"
      : "full";
  const meta = {
    timestamp,
    mode,
    repoRootLabel: `${repoRoot} (environment=${isInsideWorktree(repoRoot) ? "worktree" : "main"})`,
    scannedFiles: ctx.files.length,
    changedFiles: changedFiles.length,
    rulesRun: selection.selected.length,
    skipped: selection.skipped,
  };

  const intakeResult = options.emitIntake ? emitIntake(repoRoot, violations) : null;

  if (options.json) {
    const output = {
      ...meta,
      summary,
      builtinViolations,
      intake: intakeResult,
      results,
    };
    process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  } else {
    process.stdout.write(formatMarkdownReport(meta, summary, results) + "\n");
    if (builtinViolations.length > 0) {
      process.stdout.write("## 内蔵検査（IR レジストリ外）\n\n");
      for (const violation of builtinViolations) {
        const location = violation.line === undefined ? violation.filePath : `${violation.filePath}:${violation.line}`;
        const level = violation.severity === "error" ? "NG" : "WARNING";
        process.stdout.write(`- **[${level}]** ${violation.ruleId}: ${violation.message} [${location}]\n`);
      }
      process.stdout.write("\n");
    }
    if (intakeResult !== null) {
      for (const ticket of intakeResult.written) {
        process.stdout.write(`intake ticket written: ${ticket.filePath}\n`);
      }
      if (intakeResult.skipped.length > 0) {
        process.stdout.write(
          `intake tickets skipped (idempotent, existing rule-id ticket): ${intakeResult.skipped.join(", ")}\n`,
        );
      }
    }
    const reportPath = writeReportFile(
      repoRoot,
      formatMarkdownReport(meta, summary, results) +
        (builtinViolations.length > 0
          ? "\n## 内蔵検査（IR レジストリ外）\n\n" +
            builtinViolations
              .map((v) => `- [${v.severity === "error" ? "NG" : "WARNING"}] ${v.ruleId}: ${v.message} [${v.filePath}]`)
              .join("\n") +
            "\n"
          : ""),
    );
    process.stderr.write(`Report written to: ${reportPath}\n`);
  }

  const hasErrors = results.some((r) => r.error !== undefined);
  const exitCode = hasErrors || summary.violations > 0 || summary.warnings > 0 ? EXIT_NG : EXIT_OK;
  process.exit(exitCode);
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(`[integrity-engine] ${e instanceof Error ? e.message : String(e)}`);
    process.exit(EXIT_ERROR);
  });
}
