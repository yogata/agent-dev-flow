// Trust-root CLI entry.
//
// Invoked by scripts/trusted-distribution-gate.ps1 as
// `bun cli.ts --base-oid ... --candidate-oid ... --repo-root ...
//    --output-dir ... --repository-identity ... [--default-branch ...]
//    [--bootstrap-mode]`.
//
// Parses argv with a strict parser (no shell interpolation), runs the
// launcher, writes the JSON LauncherResult to stdout, and exits with the
// launcher's exit code. Stable across $ErrorActionPreference='Stop'
// (PowerShell side) — the bun process exit code is authoritative.
//
// Also supports a `--bootstrap-report <oid>` mode that emits a JSON digest
// report for the trust-root files at the given OID, WITHOUT running the
// launcher pipeline. This is for PR review evidence: the launcher cannot
// validate itself, so the bootstrap report is produced by an independent
// code path that reads base_oid only.

import { parseArgs as nodeParseArgs } from "node:util";
import { runLauncher } from "./launcher.ts";
import { bootstrapDigestReport } from "./bootstrap-report.ts";
import { ExitCode } from "./types.ts";

interface ParsedArgs {
  readonly mode: "run" | "report";
  readonly base_oid?: string;
  readonly candidate_oid?: string;
  readonly repo_root?: string;
  readonly output_dir?: string;
  readonly repository_identity?: string;
  readonly default_branch: string;
  readonly bootstrap_mode: boolean;
}

// node:util.parseArgs への委譲（Issue #2354 / OU-003、DEC-019 決定1）。
// 構文解析（値結合、`=` 形式、短縮クラスタ、`--`）は標準 API が行う。
// 本 CLI は strict parser 契約（未知引数は無声受理しない）のため、未知 token を
// 旧実装と同一のメッセージ・終了コードで拒否する。オプション間の必須検証は
// mainInner 側の ADF 検証として残留する。
// strict:false では値を持たない文字列オプションが true になるため、
// token の value === undefined を値欠落（= 未指定）として扱う。

const CLI_OPTIONS = {
  "base-oid": { type: "string" },
  "candidate-oid": { type: "string" },
  "repo-root": { type: "string" },
  "output-dir": { type: "string" },
  "repository-identity": { type: "string" },
  "default-branch": { type: "string" },
  "bootstrap-report": { type: "string" },
  "bootstrap-mode": { type: "boolean" },
  "seed-mode": { type: "boolean" },
  help: { type: "boolean", short: "h" },
} as const;

interface CliTokenOption {
  kind: "option";
  index: number;
  name: string;
  rawName: string;
  value?: string;
  inlineValue?: boolean;
}
interface CliTokenPositional {
  kind: "positional";
  index: number;
  value: string;
}
interface CliTokenTerminator {
  kind: "option-terminator";
  index: number;
}
type CliToken = CliTokenOption | CliTokenPositional | CliTokenTerminator;

function clusterArgIndexes(tokens: readonly CliToken[]): Set<number> {
  const counts = new Map<number, number>();
  for (const t of tokens) {
    if (t.kind === "option" && !t.rawName.startsWith("--")) {
      counts.set(t.index, (counts.get(t.index) ?? 0) + 1);
    }
  }
  const clustered = new Set<number>();
  for (const [index, count] of counts) {
    if (count > 1) clustered.add(index);
  }
  return clustered;
}

function rejectUnknownArgument(a: string): never {
  // Unknown args are an error: strict parser, no silent acceptance.
  process.stderr.write(`cli.ts: unknown argument: ${a}\n`);
  process.exit(ExitCode.InputContract);
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  const { tokens } = nodeParseArgs({
    args: [...argv],
    options: CLI_OPTIONS,
    strict: false,
    allowPositionals: true,
    tokens: true,
  }) as unknown as { tokens: CliToken[] };
  const clustered = clusterArgIndexes(tokens);
  const clusterShorts = new Map<number, string[]>();
  for (const t of tokens) {
    if (t.kind === "option" && clustered.has(t.index)) {
      const shorts = clusterShorts.get(t.index) ?? [];
      shorts.push(t.rawName.slice(1));
      clusterShorts.set(t.index, shorts);
    }
  }

  const result: {
    mode: "run" | "report";
    base_oid?: string;
    candidate_oid?: string;
    repo_root?: string;
    output_dir?: string;
    repository_identity?: string;
    default_branch: string;
    bootstrap_mode: boolean;
  } = {
    mode: "run",
    default_branch: "main",
    bootstrap_mode: false,
  };

  for (const t of tokens) {
    if (t.kind === "option" && clustered.has(t.index)) {
      // 短縮クラスタ（-hx 等）は分割前の元引数として拒否する。
      rejectUnknownArgument("-" + (clusterShorts.get(t.index) ?? []).join(""));
    }
    if (t.kind === "positional") {
      rejectUnknownArgument(t.value);
    }
    if (t.kind === "option-terminator") {
      rejectUnknownArgument("--");
    }
    // t is an option token, not a cluster member.
    if (t.inlineValue === true) {
      // `--opt=value` 形式は旧実装では未知引数のため、元引数として拒否する。
      rejectUnknownArgument(`${t.rawName}=${t.value}`);
    }
    if (t.name === "help") {
      printUsage();
      process.exit(0);
    }
    if (!(t.name in CLI_OPTIONS)) {
      rejectUnknownArgument(t.rawName);
    }
    switch (t.name) {
      case "base-oid":
        result.base_oid = t.value;
        break;
      case "candidate-oid":
        result.candidate_oid = t.value;
        break;
      case "repo-root":
        result.repo_root = t.value;
        break;
      case "output-dir":
        result.output_dir = t.value;
        break;
      case "repository-identity":
        result.repository_identity = t.value;
        break;
      case "default-branch":
        result.default_branch = t.value ?? "main";
        break;
      case "bootstrap-mode":
      case "seed-mode":
        result.bootstrap_mode = true;
        break;
      case "bootstrap-report":
        result.mode = "report";
        result.base_oid = t.value;
        break;
    }
  }
  return result;
}

function printUsage(): void {
  process.stdout.write(
    `usage: bun cli.ts --base-oid <oid> --candidate-oid <oid> --repo-root <path>\n` +
    `                   --output-dir <path> --repository-identity <owner/name>\n` +
    `                   [--default-branch main] [--bootstrap-mode|--seed-mode]\n` +
    `   or: bun cli.ts --bootstrap-report <oid> --repo-root <path>\n`,
  );
}

function main(): void {
  try {
    mainInner();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const fallback = {
      exit_code: ExitCode.Unexpected,
      error: `cli.ts unhandled: ${msg}`,
    };
    process.stdout.write(JSON.stringify(fallback, null, 2) + "\n");
    process.exit(ExitCode.Unexpected);
  }
}

function mainInner(): void {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.mode === "report") {
    if (!parsed.base_oid || !parsed.repo_root) {
      process.stderr.write("cli.ts: --bootstrap-report requires --base-oid and --repo-root\n");
      process.exit(ExitCode.InputContract);
    }
    const report = bootstrapDigestReport(parsed.repo_root, parsed.base_oid);
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    process.exit(report.ok ? 0 : ExitCode.Unexpected);
  }

  if (!parsed.base_oid || !parsed.candidate_oid || !parsed.repo_root ||
      !parsed.output_dir || !parsed.repository_identity) {
    process.stderr.write("cli.ts: missing required argument(s)\n");
    printUsage();
    process.exit(ExitCode.InputContract);
  }
  const result = runLauncher({
    repo_root: parsed.repo_root,
    base_oid: parsed.base_oid,
    candidate_oid: parsed.candidate_oid,
    output_dir: parsed.output_dir,
    repository_identity: {
      owner_slash_name: parsed.repository_identity,
      default_branch: parsed.default_branch,
    },
    bootstrap_mode: parsed.bootstrap_mode,
  });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.exit_code);
}

main();
