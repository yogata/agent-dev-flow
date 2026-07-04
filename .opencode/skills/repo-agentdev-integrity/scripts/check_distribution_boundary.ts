// Distribution reference boundary checker.
//
// Distributed command/skill bodies must not contain concrete references
// (specific IDs, specific file paths, fixed URLs) to project-local ADR or
// REQ or SPEC documents. Project-specific context must flow through the
// project extension layer instead.
//
// Detection is line-based:
//   1. Concrete IDs matching \b(ADR|REQ)-\d{4}\b
//   2. Concrete docs paths under docs/(adr,requirements,specs) that are
//      individual .md files (README.md and template forms are exempt)
//   3. Fixed blob/raw URLs that pin a specific revision
//
// Lines containing template placeholders ({NNNN}, <...>, glob '*') are
// skipped for the ID and path checks so templates remain valid.
// Exit codes: 0 ok, 1 violation, 2 error.

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export interface BoundaryFailure {
  category: "concrete-id" | "concrete-path" | "fixed-url";
  file: string;
  line: number;
  snippet: string;
  matched: string;
}

export interface BoundaryReport {
  ok: boolean;
  failures: BoundaryFailure[];
  stats: {
    scanned_files: number;
    concrete_id_hits: number;
    concrete_path_hits: number;
    fixed_url_hits: number;
  };
}

const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
const PUBLIC_SKILLS_PARENT = "src/opencode/skills";

// Concrete IDs: ADR-1234, REQ-1234 (excludes ADR-{NNNN}, REQ-NNNN, ADR-*, etc.)
const CONCRETE_ID_PATTERN = /\b(ADR|REQ)-\d{4}\b/g;

// Candidate concrete paths. We match any docs/(adr|requirements|specs)/...
// path token and then decide whether it is a concrete file or a template.
const DOCS_PATH_PATTERN =
  /docs\/(adr|requirements|specs)\/[^\s)\]\|\\"'`<>{}]+/g;

// Fixed URLs that point to a specific blob/raw of this repo. Owner/repo
// kept generic so the rule travels if the self-host repo is renamed.
const FIXED_URL_PATTERN =
  /github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/(blob|raw)\//g;
const RAW_FIXED_URL_PATTERN =
  /raw\.githubusercontent\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\//g;

// Whole-line exemption hints. If any of these substrings appear on the line,
// the line is skipped entirely for both concrete-id and concrete-path checks.
// Fixed-URL check is never exempted (URLs are never templated this way).
const LINE_EXEMPTION_HINTS = [
  "{NNNN}",
  "<NNNN>",
  "<existing-spec>",
  "<domain>",
  "<command>",
  "<spec>",
  "<rule>",
  "docs/specs/<",
  "docs/specs/{",
  "docs/specs/**",
  "docs/adr/<",
  "docs/adr/{",
  "docs/adr/**",
  "docs/requirements/<",
  "docs/requirements/{",
  "docs/requirements/**",
  "ADR-{NNNN}",
  "REQ-{NNNN}",
  "ADR-*",
  "REQ-*",
];

function dirExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function readText(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf-8") as string;
  } catch {
    return null;
  }
}

function listMarkdownFiles(dirPath: string, recursive: boolean): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory() && recursive) {
      result.push(...listMarkdownFiles(full, true));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      result.push(full.replace(/\\/g, "/"));
    }
  }
  return result;
}

function isLineExempt(line: string): boolean {
  for (const hint of LINE_EXEMPTION_HINTS) {
    if (line.includes(hint)) return true;
  }
  return false;
}

/**
 * Decide whether a candidate docs path token (already stripped of surrounding
 * punctuation) is a concrete file reference or a template.
 *
 * Returns true when the token is a CONCRETE reference (i.e. a violation).
 */
function isConcreteDocsPath(token: string): boolean {
  // README.md is an index, not an individual document. Always allowed.
  if (token.endsWith("/README.md")) return false;
  // Template placeholders anywhere in the token mean it is not concrete.
  if (/[<>{}]/.test(token)) return false;
  // Glob wildcard means it is not concrete.
  if (token.includes("*")) return false;
  // Must end with .md to be a doc reference at all.
  if (!token.endsWith(".md")) return false;
  return true;
}

function collectTargets(repoRoot: string): string[] {
  const targets: string[] = [];
  // Public commands
  targets.push(...listMarkdownFiles(path.join(repoRoot, PUBLIC_COMMAND_DIR), true));
  // Public skills (agentdev-* only)
  const skillsParent = path.join(repoRoot, PUBLIC_SKILLS_PARENT);
  if (dirExists(skillsParent)) {
    const entries = fs.readdirSync(skillsParent, { withFileTypes: true }) as any[];
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (!ent.name.startsWith("agentdev-")) continue;
      const skillDir = path.join(skillsParent, ent.name);
      targets.push(...listMarkdownFiles(skillDir, true));
    }
  }
  return targets;
}

export function checkDistributionBoundary(repoRoot: string): BoundaryReport {
  const failures: BoundaryFailure[] = [];
  const stats = {
    scanned_files: 0,
    concrete_id_hits: 0,
    concrete_path_hits: 0,
    fixed_url_hits: 0,
  };

  const targets = collectTargets(repoRoot);
  stats.scanned_files = targets.length;

  for (const file of targets) {
    const text = readText(file);
    if (text === null) continue;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("#")) {
        // Comments in scripts are .ts only; .md headings may still contain
        // refs, so we do NOT skip markdown headings.
      }

      // Fixed URL check is never exempted by template hints.
      const urlMatches =
        line.match(FIXED_URL_PATTERN) || line.match(RAW_FIXED_URL_PATTERN);
      if (urlMatches && urlMatches.length > 0) {
        for (const m of urlMatches) {
          stats.fixed_url_hits += 1;
          failures.push({
            category: "fixed-url",
            file,
            line: i + 1,
            snippet: trimmed.substring(0, 200),
            matched: m,
          });
        }
      }

      // Template lines skip id and path checks.
      if (isLineExempt(line)) continue;

      // Concrete ID check.
      const idMatches = line.match(CONCRETE_ID_PATTERN);
      if (idMatches && idMatches.length > 0) {
        for (const m of idMatches) {
          stats.concrete_id_hits += 1;
          failures.push({
            category: "concrete-id",
            file,
            line: i + 1,
            snippet: trimmed.substring(0, 200),
            matched: m,
          });
        }
      }

      // Concrete docs path check.
      const pathCandidates = line.match(DOCS_PATH_PATTERN);
      if (pathCandidates && pathCandidates.length > 0) {
        for (const candidate of pathCandidates) {
          if (isConcreteDocsPath(candidate)) {
            stats.concrete_path_hits += 1;
            failures.push({
              category: "concrete-path",
              file,
              line: i + 1,
              snippet: trimmed.substring(0, 200),
              matched: candidate,
            });
          }
        }
      }
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    stats,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const repoRoot = args[0] || process.cwd();
  const json = args.includes("--json");
  const report = checkDistributionBoundary(repoRoot);
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`check_distribution_boundary.ts - distribution reference boundary\n`);
    process.stdout.write(`=============================================================\n`);
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.category}] ${f.file}:${f.line} matched=${f.matched}\n    snippet: ${f.snippet}\n`,
      );
    }
  }
  process.exit(report.ok ? 0 : 1);
}
