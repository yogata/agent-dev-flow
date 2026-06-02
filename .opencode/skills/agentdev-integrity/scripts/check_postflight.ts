/**
 * Postflight diff checking script for AgentDevFlow.
 *
 * Verifies that read-only commands do not modify local files after execution.
 * This implements Phase 1 of the postflight diff checking plan defined in
 * docs/specs/integrity-contracts.md.
 *
 * Usage:
 *   snapshot phase:
 *     bun run check_postflight.ts snapshot [--json] [--output <path>]
 *   verify phase:
 *     bun run check_postflight.ts verify --snapshot <path> [--json] [--allow <glob>]
 *   diff phase (standalone):
 *     bun run check_postflight.ts diff --snapshot <path> [--json]
 *
 * Allowed changes profiles are defined per-command in the Allowed Changes
 * Profile section of docs/specs/integrity-contracts.md.
 */

import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  parseArgs,
  printHelp,
  ok,
  warn,
  ng,
  computeSummary,
  formatJsonReport,
  formatMarkdownReport,
  determineExitCode,
  findRepoRoot,
} from "./cli_utils.ts";

import type {
  CheckResult,
  ScanSummary,
  IntegrityReport,
} from "./cli_utils.ts";

const SCRIPT_NAME = "check_postflight.ts";
const SCRIPT_DESCRIPTION = "Postflight diff checker for read-only commands";
const SCRIPT_USAGE =
  "bun run .opencode/skills/agentdev-integrity/scripts/check_postflight.ts <snapshot|verify|diff> [options]";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileEntry {
  relPath: string;
  hash: string;
  size: number;
  mtimeMs: number;
}

interface Snapshot {
  timestamp: string;
  command: string;
  rootDir: string;
  files: FileEntry[];
}

interface AllowedChangesProfile {
  command: string;
  allowed: string[];
  forbidden: string[];
}

// ---------------------------------------------------------------------------
// Allowed Changes Profiles (from docs/specs/integrity-contracts.md)
// ---------------------------------------------------------------------------

const READ_ONLY_COMMANDS: string[] = [
  "req-define",
  "backlog-review",
  "req-restructure-review",
  "integrity-check",
];

const ALLOWED_CHANGES_PROFILES: AllowedChangesProfile[] = [
  { command: "req-define", allowed: [], forbidden: ["**"] },
  { command: "req-save", allowed: ["docs/requirements/**", "docs/adr/**", "docs/DOC-MAP.md"], forbidden: [".agentdev/**", ".opencode/**"] },
  { command: "case-open", allowed: [], forbidden: [] }, // GitHub only
  { command: "case-run", allowed: ["**"], forbidden: [".agentdev/**"] },
  { command: "case-close", allowed: [], forbidden: [".agentdev/intake/inbox/**"] }, // GitHub + worktree
  { command: "case-update", allowed: [], forbidden: [] }, // GitHub only
  { command: "integrity-check", allowed: [".agentdev/integrity/reports/**"], forbidden: [] },
  { command: "intake-capture", allowed: [".agentdev/intake/inbox/**"], forbidden: [] },
  { command: "intake-from-github", allowed: [".agentdev/intake/inbox/**"], forbidden: [] },
  { command: "intake-review", allowed: [".agentdev/intake/inbox/**", ".agentdev/intake/archive/**"], forbidden: [] },
  { command: "intake-promote", allowed: [".agentdev/intake/promoted/**"], forbidden: [] },
  { command: "learning-refine", allowed: [".agentdev/learning/**"], forbidden: [] },
  { command: "learning-promote", allowed: [".agentdev/learning/promoted/**"], forbidden: [] },
  { command: "backlog-review", allowed: [], forbidden: ["**"] },
  { command: "backlog-save", allowed: ["docs/requirements/**"], forbidden: [".opencode/**"] },
  { command: "req-restructure-review", allowed: [], forbidden: ["**"] },
];

// ---------------------------------------------------------------------------
// Glob matching (minimal implementation)
// ---------------------------------------------------------------------------

function globToRegex(pattern: string): RegExp {
  let regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]")
    .replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${regex}$`);
}

function matchesGlob(filePath: string, pattern: string): boolean {
  return globToRegex(pattern).test(filePath.replace(/\\/g, "/"));
}

function matchesAnyGlob(filePath: string, patterns: string[]): boolean {
  return patterns.some((p) => matchesGlob(filePath, p));
}

// ---------------------------------------------------------------------------
// Snapshot operations
// ---------------------------------------------------------------------------

function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function collectFiles(rootDir: string): FileEntry[] {
  const entries: FileEntry[] = [];
  const ignoreDirs = new Set([
    "node_modules", ".git", ".sisyphus", "tmp",
  ]);

  function walk(dir: string): void {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        if (ignoreDirs.has(item.name)) continue;
        walk(path.join(dir, item.name));
      } else if (item.isFile()) {
        const fullPath = path.join(dir, item.name);
        const stat = fs.statSync(fullPath);
        entries.push({
          relPath: path.relative(rootDir, fullPath).replace(/\\/g, "/"),
          hash: hashFile(fullPath),
          size: stat.size,
          mtimeMs: stat.mtimeMs,
        });
      }
    }
  }

  walk(rootDir);
  return entries;
}

function takeSnapshot(rootDir: string, command: string): Snapshot {
  return {
    timestamp: new Date().toISOString(),
    command,
    rootDir: rootDir,
    files: collectFiles(rootDir),
  };
}

function writeSnapshot(snapshot: Snapshot, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), "utf-8");
}

function readSnapshot(inputPath: string): Snapshot {
  const content = fs.readFileSync(inputPath, "utf-8");
  return JSON.parse(content) as Snapshot;
}

// ---------------------------------------------------------------------------
// Diff computation
// ---------------------------------------------------------------------------

interface DiffEntry {
  relPath: string;
  change: "added" | "removed" | "modified";
  beforeHash?: string;
  afterHash?: string;
}

function computeDiff(before: Snapshot, after: Snapshot): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const beforeMap = new Map<string, FileEntry>();
  const afterMap = new Map<string, FileEntry>();

  for (const f of before.files) beforeMap.set(f.relPath, f);
  for (const f of after.files) afterMap.set(f.relPath, f);

  // Files in after but not before = added
  for (const [relPath, entry] of afterMap) {
    if (!beforeMap.has(relPath)) {
      diffs.push({ relPath, change: "added", afterHash: entry.hash });
    }
  }

  // Files in before but not after = removed
  for (const [relPath, entry] of beforeMap) {
    if (!afterMap.has(relPath)) {
      diffs.push({ relPath, change: "removed", beforeHash: entry.hash });
    }
  }

  // Files in both = check hash
  for (const [relPath, beforeEntry] of beforeMap) {
    const afterEntry = afterMap.get(relPath);
    if (afterEntry && beforeEntry.hash !== afterEntry.hash) {
      diffs.push({
        relPath,
        change: "modified",
        beforeHash: beforeEntry.hash,
        afterHash: afterEntry.hash,
      });
    }
  }

  return diffs.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

// ---------------------------------------------------------------------------
// Verification against allowed-changes profile
// ---------------------------------------------------------------------------

interface VerifyResult {
  command: string;
  diffs: DiffEntry[];
  violations: CheckResult[];
}

function verifyDiffs(
  command: string,
  diffs: DiffEntry[],
  extraAllowed: string[],
): VerifyResult {
  const profile = ALLOWED_CHANGES_PROFILES.find((p) => p.command === command);
  const results: CheckResult[] = [];

  if (!profile) {
  results.push(warn(
      "Postflight",
      "profile-lookup",
      `No allowed-changes profile for command "${command}"`,
    ));
  }

  const allowed = [...(profile?.allowed || []), ...extraAllowed];
  const forbidden = profile?.forbidden || [];

  if (diffs.length === 0) {
    results.push(ok(
      "Postflight",
      "file-changes",
      `No file changes detected for "${command}" command`,
    ));
    return { command, diffs, violations: results };
  }

  for (const diff of diffs) {
    const isAllowed = matchesAnyGlob(diff.relPath, allowed);
    const isForbidden = matchesAnyGlob(diff.relPath, forbidden);
    const isReadOnly = READ_ONLY_COMMANDS.includes(command);

    if (isReadOnly && diff.change !== "removed") {
      results.push(warn(
        "Postflight",
        "read-only-violation",
        `Read-only command "${command}" modified file: ${diff.relPath} (${diff.change})`,
        diff.relPath,
      ));
    } else if (isForbidden && !isAllowed) {
      results.push(warn(
        "Postflight",
        "forbidden-change",
        `Command "${command}" modified forbidden path: ${diff.relPath} (${diff.change})`,
        diff.relPath,
      ));
    } else if (!isAllowed && forbidden.length > 0) {
      results.push(info(
        "Postflight",
        "unlisted-change",
        `Command "${command}" changed unlisted path: ${diff.relPath} (${diff.change})`,
        diff.relPath,
      ));
    } else {
      results.push(ok(
        "Postflight",
        "allowed-change",
        `Change to ${diff.relPath} is within allowed profile for "${command}"`,
      ));
    }
  }

  return { command, diffs, violations: results };
}

// ---------------------------------------------------------------------------
// CLI subcommands
// ---------------------------------------------------------------------------

function cmdSnapshot(options: ReturnType<typeof parseArgs>): void {
  const rootDir = findRepoRoot(process.cwd());
  const command = options.paths[0] || "unknown";

  const snapshot = takeSnapshot(rootDir, command);
  const defaultOutput = path.join(
    rootDir, ".sisyphus", "tmp",
    `postflight-snapshot-${Date.now()}.json`,
  );
  const outputPath = options.paths[1] || defaultOutput;

  writeSnapshot(snapshot, outputPath);

  if (options.json) {
    console.log(JSON.stringify({
      status: "ok",
      snapshotPath: outputPath,
      fileCount: snapshot.files.length,
      timestamp: snapshot.timestamp,
    }, null, 2));
  } else {
    console.log(`Snapshot saved: ${outputPath}`);
    console.log(`Files: ${snapshot.files.length}`);
    console.log(`Command: ${command}`);
    console.log(`Timestamp: ${snapshot.timestamp}`);
  }
}

function cmdVerify(options: ReturnType<typeof parseArgs>): void {
  const snapshotPath = options.paths[0];
  if (!snapshotPath) {
    console.error("Error: snapshot path required for verify command");
    process.exit(EXIT_ERROR);
  }

  if (!fs.existsSync(snapshotPath)) {
    console.error(`Error: snapshot file not found: ${snapshotPath}`);
    process.exit(EXIT_ERROR);
  }

  const beforeSnapshot = readSnapshot(snapshotPath);
  const rootDir = findRepoRoot(process.cwd());
  const afterSnapshot = takeSnapshot(rootDir, beforeSnapshot.command);

  const diffs = computeDiff(beforeSnapshot, afterSnapshot);
  const extraAllowed: string[] = [];
  const allowIdx = process.argv.indexOf("--allow");
  if (allowIdx !== -1 && process.argv[allowIdx + 1]) {
    extraAllowed.push(...process.argv[allowIdx + 1].split(","));
  }

  const verifyResult = verifyDiffs(beforeSnapshot.command, diffs, extraAllowed);

  const summary = computeSummary(verifyResult.violations);
  const report: IntegrityReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    scanned: { "snapshot-files": beforeSnapshot.files.length, "current-files": afterSnapshot.files.length },
    summary,
    results: verifyResult.violations,
  };

  if (options.json) {
    console.log(formatJsonReport(report));
  } else {
    console.log(formatMarkdownReport(report));
    if (diffs.length > 0) {
      console.log("## 変更ファイル一覧");
      console.log("");
      for (const d of diffs) {
        console.log(`- ${d.change}: ${d.relPath}`);
      }
      console.log("");
    }
  }

  process.exit(determineExitCode(summary));
}

function cmdDiff(options: ReturnType<typeof parseArgs>): void {
  const snapshotPath = options.paths[0];
  if (!snapshotPath) {
    console.error("Error: snapshot path required for diff command");
    process.exit(EXIT_ERROR);
  }

  if (!fs.existsSync(snapshotPath)) {
    console.error(`Error: snapshot file not found: ${snapshotPath}`);
    process.exit(EXIT_ERROR);
  }

  const beforeSnapshot = readSnapshot(snapshotPath);
  const rootDir = findRepoRoot(process.cwd());
  const afterSnapshot = takeSnapshot(rootDir, beforeSnapshot.command);

  const diffs = computeDiff(beforeSnapshot, afterSnapshot);

  if (options.json) {
    console.log(JSON.stringify({
      command: beforeSnapshot.command,
      diffCount: diffs.length,
      diffs,
    }, null, 2));
  } else {
    console.log(`Postflight diff for command: ${beforeSnapshot.command}`);
    console.log(`Changes detected: ${diffs.length}`);
    console.log("");
    if (diffs.length === 0) {
      console.log("No file changes detected.");
    } else {
      for (const d of diffs) {
        const icon = d.change === "added" ? "+" : d.change === "removed" ? "-" : "~";
        console.log(`  ${icon} ${d.relPath}`);
      }
    }
  }

  process.exit(diffs.length > 0 ? EXIT_NG : EXIT_OK);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    printHelp(SCRIPT_NAME, SCRIPT_DESCRIPTION, SCRIPT_USAGE);
    console.log("SUBCOMMANDS:");
    console.log("  snapshot [command] [output]   Take a file state snapshot");
    console.log("  verify <snapshot-path>        Verify no unexpected changes since snapshot");
    console.log("  diff <snapshot-path>          Show raw diff since snapshot");
    process.exit(subcommand ? EXIT_OK : EXIT_ERROR);
  }

  const remainingArgs = args.slice(1);
  const options = parseArgs(remainingArgs);

  switch (subcommand) {
    case "snapshot":
      cmdSnapshot(options);
      break;
    case "verify":
      cmdVerify(options);
      break;
    case "diff":
      cmdDiff(options);
      break;
    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      console.error("Use --help for usage information");
      process.exit(EXIT_ERROR);
  }
}

// Export for testing
export {
  globToRegex,
  matchesGlob,
  matchesAnyGlob,
  collectFiles,
  computeDiff,
  verifyDiffs,
  takeSnapshot,
  readSnapshot,
  READ_ONLY_COMMANDS,
  ALLOWED_CHANGES_PROFILES,
};

const isMainModule = typeof Bun !== "undefined"
  && typeof Bun.main === "string"
  && import.meta.path === Bun.main;
if (isMainModule) main();
