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

function parseArgs(argv: readonly string[]): ParsedArgs {
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
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? "";
    switch (a) {
      case "--base-oid": result.base_oid = argv[++i]; break;
      case "--candidate-oid": result.candidate_oid = argv[++i]; break;
      case "--repo-root": result.repo_root = argv[++i]; break;
      case "--output-dir": result.output_dir = argv[++i]; break;
      case "--repository-identity": result.repository_identity = argv[++i]; break;
      case "--default-branch": result.default_branch = argv[++i] ?? "main"; break;
      case "--bootstrap-mode": result.bootstrap_mode = true; break;
      case "--bootstrap-report": result.mode = "report"; result.base_oid = argv[++i]; break;
      case "--help": case "-h":
        printUsage();
        process.exit(0);
      default:
        // Unknown args are an error: strict parser, no silent acceptance.
        process.stderr.write(`cli.ts: unknown argument: ${a}\n`);
        process.exit(ExitCode.InputContract);
    }
  }
  return result;
}

function printUsage(): void {
  process.stdout.write(
    `usage: bun cli.ts --base-oid <oid> --candidate-oid <oid> --repo-root <path>\n` +
    `                   --output-dir <path> --repository-identity <owner/name>\n` +
    `                   [--default-branch main] [--bootstrap-mode]\n` +
    `   or: bun cli.ts --bootstrap-report <oid> --repo-root <path>\n`,
  );
}

function main(): void {
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
