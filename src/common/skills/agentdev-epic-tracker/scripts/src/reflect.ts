// CLI entry for the coordination reflect engine.
//
// Deterministic write-path helper: reads the LATEST Epic Issue body from a
// file, applies one coordination/closing/overall update to what was read,
// and writes the merged body to stdout as JSON. Callers (workflow agent or
// script) own the GitHub I/O and the per-Epic exclusive serialization; this
// tool never performs network writes.
//
// Usage:
//   bun run reflect.ts reflect --epic-body <file> --report '<json>'
//   bun run reflect.ts closing --epic-body <file> --child <N> \
//       --status <completed|blocked|failed> [--pr <N>] [--pr-url <url>]
//   bun run reflect.ts overall --epic-body <file> --evaluation '<json>' \
//       --child-issues '42,43,44'
//   (--report / --evaluation also accept --report-file / --evaluation-file)
//
// Output (stdout, single JSON object):
//   { "ok": true, "body": "<merged body>", "applied": true, "skipped": null }
//   { "ok": false, "errors": ["..."] }   exit code 1

import { readFileSync } from "node:fs";
import {
  applyClosingStatus,
  applyReflectEntry,
  evaluateOverallCompletion,
  upsertOverallEvaluation,
  type ClosingApplyResult,
  type OverallCriterionInput,
  type OverallEvaluation,
  type ReflectApplyResult,
  type ReflectEntry,
} from "../lib/epic-reflect.ts";
import {
  readChildStatus,
  type PersistedStatus,
} from "../lib/tracking-table.ts";

interface CliResult {
  ok: boolean;
  body?: string;
  applied?: boolean;
  skipped?: string | null;
  evaluation?: OverallEvaluation;
  errors?: string[];
}

function fail(errors: string[]): never {
  const payload: CliResult = { ok: false, errors };
  console.log(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readBody(path: string | undefined): string {
  if (!path) return fail(["--epic-body is required"]);
  try {
    return readFileSync(path, "utf-8");
  } catch (e) {
    return fail([
      `cannot read --epic-body: ${e instanceof Error ? e.message : String(e)}`,
    ]);
  }
}

function readJson(
  value: string | undefined,
  file: string | undefined,
  label: string,
): unknown {
  try {
    if (value === undefined && file === undefined) {
      return fail([`--${label} or --${label}-file is required`]);
    }
    const raw = file !== undefined ? readFileSync(file, "utf-8") : value;
    return JSON.parse(raw as string);
  } catch (e) {
    return fail([
      `invalid --${label}: ${e instanceof Error ? e.message : String(e)}`,
    ]);
  }
}

function parseReflectReport(raw: unknown): ReflectEntry {
  if (typeof raw !== "object" || raw === null) {
    fail(["--report must be a JSON object"]);
  }
  const r = raw as Record<string, unknown>;
  const childIssue = Number(r.childIssue);
  if (!Number.isInteger(childIssue) || childIssue <= 0) {
    fail(["--report.childIssue must be a positive integer"]);
  }
  const entry: ReflectEntry = {
    childIssue,
    trigger: r.trigger as ReflectEntry["trigger"],
    phase: String(r.phase ?? ""),
    state: r.state as ReflectEntry["state"],
  };
  if (r.endedKind !== undefined) entry.endedKind = r.endedKind as ReflectEntry["endedKind"];
  if (r.waitingReason !== undefined) entry.waitingReason = String(r.waitingReason);
  if (r.nextAction !== undefined) entry.nextAction = String(r.nextAction);
  if (r.owner !== undefined) entry.owner = String(r.owner);
  if (r.latestRecordRef !== undefined) entry.latestRecordRef = String(r.latestRecordRef);
  if (r.resultBasis !== undefined) entry.resultBasis = String(r.resultBasis);
  if (r.prNumber !== undefined) entry.prNumber = Number(r.prNumber);
  if (r.prUrl !== undefined) entry.prUrl = String(r.prUrl);
  return entry;
}

const KNOWN_OPTIONS = new Set([
  "epic-body",
  "report",
  "report-file",
  "evaluation",
  "evaluation-file",
  "child-issues",
  "child",
  "status",
  "pr",
  "pr-url",
]);

interface ParsedArgs {
  mode: string | undefined;
  values: Record<string, string | undefined>;
}

function parseCliArgs(argv: string[]): ParsedArgs {
  const values: Record<string, string | undefined> = {};
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const name = arg.slice(2);
    if (!KNOWN_OPTIONS.has(name)) {
      fail([`unknown option: --${name}`]);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      fail([`missing value for --${name}`]);
    }
    values[name] = value;
    i++;
  }
  return { mode: positionals[0], values };
}

function main(): void {
  const { mode, values } = parseCliArgs(process.argv.slice(2));
  const args = { values };
  if (mode === "reflect") {
    const body = readBody(args.values["epic-body"]);
    const raw = readJson(args.values.report, args.values["report-file"], "report");
    const entry = parseReflectReport(raw);
    const result: ReflectApplyResult = applyReflectEntry(body, entry);
    const payload: CliResult = {
      ok: true,
      body: result.body,
      applied: result.applied,
      skipped: null,
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  if (mode === "closing") {
    const body = readBody(args.values["epic-body"]);
    const child = Number(args.values.child);
    const status = args.values.status;
    if (!Number.isInteger(child) || child <= 0) {
      fail(["--child must be a positive integer"]);
    }
    if (status !== "completed" && status !== "blocked" && status !== "failed") {
      fail(["--status must be completed | blocked | failed"]);
    }
    const prRaw = args.values.pr !== undefined ? Number(args.values.pr) : undefined;
    const result: ClosingApplyResult = applyClosingStatus(body, child, {
      status: status as PersistedStatus,
      prNumber: prRaw !== undefined && !Number.isNaN(prRaw) ? prRaw : undefined,
      prUrl: args.values["pr-url"],
    });
    const payload: CliResult = {
      ok: result.skipped !== "row-missing",
      body: result.body,
      applied: result.applied,
      skipped: result.skipped,
    };
    console.log(JSON.stringify(payload, null, 2));
    if (result.skipped === "row-missing") process.exit(1);
    return;
  }
  if (mode === "overall") {
    const body = readBody(args.values["epic-body"]);
    const raw = readJson(
      args.values.evaluation,
      args.values["evaluation-file"],
      "evaluation",
    );
    if (typeof raw !== "object" || raw === null) {
      fail(["--evaluation must be a JSON object"]);
    }
    const r = raw as Record<string, unknown>;
    if (!Array.isArray(r.evaluatedCriteria)) {
      fail(["--evaluation.evaluatedCriteria must be an array"]);
    }
    const evaluatedCriteria: OverallCriterionInput[] = r.evaluatedCriteria.map(
      (c) => {
        if (typeof c !== "object" || c === null) {
          fail(["evaluatedCriteria entries must be objects"]);
        }
        const cc = c as Record<string, unknown>;
        return {
          criterion: String(cc.criterion ?? ""),
          met: Boolean(cc.met),
          basis: String(cc.basis ?? ""),
        };
      },
    );
    const childIssues = String(r.childIssues ?? args.values["child-issues"] ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
    const childStatuses: Record<number, PersistedStatus | undefined> = {};
    for (const c of childIssues) {
      childStatuses[c] = readChildStatus(body, c)?.status;
    }
    const evaluation = evaluateOverallCompletion({
      childIssues,
      childStatuses,
      evaluatedCriteria,
    });
    const nextBody = upsertOverallEvaluation(body, evaluation);
    const payload: CliResult = {
      ok: true,
      body: nextBody,
      applied: true,
      skipped: null,
      evaluation,
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  fail([`unknown mode: ${String(mode)} (expected reflect | closing | overall)`]);
}

main();
