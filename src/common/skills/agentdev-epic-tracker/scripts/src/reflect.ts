// CLI entry for the Epic reflection engine.
//
// Deterministic write-path helper: reads the LATEST Epic Issue body from a
// file, applies one closing/reset update to what was read, or evaluates the
// overall completion, and writes the result to stdout as JSON. Callers
// (workflow agent or script) own the GitHub I/O and the per-Epic exclusive
// serialization; this tool never performs network writes.
//
// Epic 本文への書き込みは実行構成の状態反映（closing / reset）に限定される。
// overall モードは評価結果を返すのみで本文を書き換えない（評価の記録先は
// 正規の完了条件チェックの確定と証拠であり、Epic 本文への中間投影を保存しない）。
//
// Usage:
//   bun run reflect.ts closing --epic-body <file> --child <N> \
//       --status <pending|completed|blocked|failed>
//   bun run reflect.ts reset --epic-body <file> --child <N>
//   bun run reflect.ts overall --epic-body <file> --evaluation '<json>' \
//       --child-issues '42,43,44'
//   (--evaluation also accepts --evaluation-file)
//
// Output (stdout, single JSON object):
//   { "ok": true, "body": "<merged body>", "applied": true, "skipped": null }
//   { "ok": false, "errors": ["..."] }   exit code 1

import { readFileSync } from "node:fs";
import {
  applyClosingStatus,
  evaluateOverallCompletion,
  resetChildToPending,
  type ClosingApplyResult,
  type OverallCriterionInput,
  type OverallEvaluation,
} from "../lib/epic-reflect.ts";
import {
  readChildStatus,
  type PersistedStatus,
} from "../lib/tracking-table.ts";

const PERSISTED_STATUS_VALUES: readonly PersistedStatus[] = [
  "pending",
  "completed",
  "blocked",
  "failed",
];

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

const KNOWN_OPTIONS = new Set([
  "epic-body",
  "evaluation",
  "evaluation-file",
  "child-issues",
  "child",
  "status",
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
  if (mode === "closing") {
    const body = readBody(args.values["epic-body"]);
    const child = Number(args.values.child);
    const status = args.values.status;
    if (!Number.isInteger(child) || child <= 0) {
      fail(["--child must be a positive integer"]);
    }
    if (
      typeof status !== "string" ||
      !(PERSISTED_STATUS_VALUES as readonly string[]).includes(status)
    ) {
      fail([`--status must be one of ${PERSISTED_STATUS_VALUES.join(", ")}`]);
    }
    const result: ClosingApplyResult = applyClosingStatus(
      body,
      child,
      status as PersistedStatus,
    );
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
  if (mode === "reset") {
    const body = readBody(args.values["epic-body"]);
    const child = Number(args.values.child);
    if (!Number.isInteger(child) || child <= 0) {
      fail(["--child must be a positive integer"]);
    }
    const result = resetChildToPending(body, child);
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
    const payload: CliResult = {
      ok: true,
      body,
      applied: false,
      skipped: null,
      evaluation,
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  fail([`unknown mode: ${String(mode)} (expected closing | reset | overall)`]);
}

main();
