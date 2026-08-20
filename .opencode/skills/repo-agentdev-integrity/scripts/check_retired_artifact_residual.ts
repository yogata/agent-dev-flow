// check_retired_artifact_residual.ts
//
// Common detector for IR-025 (retired ADR path rule), IR-037
// (retired-ADR-current-baseline-ref), and IR-043 (retired-readme-coverage).
//
// Consolidates the three strict + literal/structural detection rules per
// Phase 3 §4.2 group A of cross-cutting-integration-design-20260811.md.
// Detection data is loaded from data/retired-artifact-registry.yaml.
// The YAML is a detection-view; canonical rules live in the IR files under
// docs/designs/integrity/rules/ and in the referenced SPECs.
//
// Each rule's severity / gate_level / failure semantics are preserved
// (physical consolidation of perspectives only, not IR lifecycle substitution).
//
// Exit codes: 0 ok, 1 violation, 2 error.

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export type RetiredKind = "IR-025" | "IR-037" | "IR-043";

export interface RetiredArtifactFinding {
  rule_id: RetiredKind;
  file: string;
  line: number;
  matched: string;
  description: string;
}

export interface RetiredArtifactReport {
  ok: boolean;
  findings: RetiredArtifactFinding[];
  stats: {
    ir_025_violations: number;
    ir_037_violations: number;
    ir_043_violations: number;
    scanned_files: number;
  };
}

interface RegistryData {
  schema_version: number;
  retired_adr_path_patterns?: {
    forbidden_filename_regex?: string;
    scan_directory?: string;
    allowed_filename_regex?: string;
  };
  retired_decisions_as_current_baseline?: {
    retired_ids?: string[];
    v2_prefix_exemption?: string;
  };
  retired_readme_coverage_targets?: {
    targets?: Array<{
      path: string;
      artifact_kind: string;
      rule_refs?: string[];
    }>;
  };
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

function findDataFile(repoRoot: string): string {
  // scripts/ is a junction that may not propagate in worktrees; resolve via
  // repoRoot/.opencode/skills/repo-agentdev-integrity/data/.
  const candidate = path.join(
    repoRoot,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "data",
    "retired-artifact-registry.yaml",
  );
  return candidate;
}

/**
 * Minimal YAML loader for the narrow schema used by this detector. We avoid a
 * full YAML dependency to keep the script self-contained (matches
 * check_distribution_boundary.ts style). Only the fields used by this
 * detector are parsed; unknown fields are ignored.
 */
function loadRegistry(filePath: string): RegistryData | null {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf-8");
  const data: RegistryData = {};
  let section: keyof RegistryData | null = null;
  let inRetiredIds = false;
  let inTargets = false;
  const targets: NonNullable<RegistryData["retired_readme_coverage_targets"]>["targets"] = [];
  const retiredIds: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, "");
    if (line.startsWith("#") || line.trim() === "") continue;

    if (line.startsWith("retired_adr_path_patterns:")) {
      section = "retired_adr_path_patterns";
      inRetiredIds = false;
      inTargets = false;
      data.retired_adr_path_patterns = {};
      continue;
    }
    if (line.startsWith("retired_decisions_as_current_baseline:")) {
      section = "retired_decisions_as_current_baseline";
      inRetiredIds = false;
      inTargets = false;
      data.retired_decisions_as_current_baseline = {};
      continue;
    }
    if (line.startsWith("retired_readme_coverage_targets:")) {
      section = "retired_readme_coverage_targets";
      inRetiredIds = false;
      inTargets = false;
      data.retired_readme_coverage_targets = {};
      continue;
    }

    if (section === "retired_adr_path_patterns" && data.retired_adr_path_patterns) {
      const m = line.match(/^\s+forbidden_filename_regex:\s+"(.+)"\s*$/);
      if (m) data.retired_adr_path_patterns.forbidden_filename_regex = m[1];
      const m2 = line.match(/^\s+scan_directory:\s+(\S+)\s*$/);
      if (m2) data.retired_adr_path_patterns.scan_directory = m2[1];
      const m3 = line.match(/^\s+allowed_filename_regex:\s+"(.+)"\s*$/);
      if (m3) data.retired_adr_path_patterns.allowed_filename_regex = m3[1];
    }

    if (section === "retired_decisions_as_current_baseline" && data.retired_decisions_as_current_baseline) {
      if (/^\s+retired_ids:\s*$/.test(line)) {
        inRetiredIds = true;
        continue;
      }
      if (inRetiredIds) {
        if (/^\s{4,}-\s/.test(line) || /^\s+-\s/.test(line)) {
          // Skip empty list (line "[]" handled separately).
        } else if (/^\s*\[\]\s*$/.test(line)) {
          inRetiredIds = false;
        } else if (/^[A-Za-z]/.test(line.trim())) {
          inRetiredIds = false;
        }
        const idMatch = line.match(/^\s+-\s+"?([A-Za-z0-9:_-]+)"?\s*$/);
        if (idMatch) retiredIds.push(idMatch[1]);
      }
      const m = line.match(/^\s+v2_prefix_exemption:\s+"?([^"]+)"?\s*$/);
      if (m) data.retired_decisions_as_current_baseline.v2_prefix_exemption = m[1];
    }

    if (section === "retired_readme_coverage_targets" && data.retired_readme_coverage_targets) {
      if (/^\s+targets:\s*$/.test(line)) {
        inTargets = true;
        continue;
      }
      if (inTargets) {
        const entryMatch = line.match(/^\s+-\s+path:\s+(\S+)\s*$/);
        if (entryMatch) {
          targets.push({ path: entryMatch[1], artifact_kind: "" });
          continue;
        }
        const kindMatch = line.match(/^\s+artifact_kind:\s+(\S+)\s*$/);
        if (kindMatch && targets.length > 0) {
          targets[targets.length - 1].artifact_kind = kindMatch[1];
          continue;
        }
        if (/^[A-Za-z]/.test(line.trim())) {
          inTargets = false;
        }
      }
    }
  }

  if (data.retired_decisions_as_current_baseline && retiredIds.length > 0) {
    data.retired_decisions_as_current_baseline.retired_ids = retiredIds;
  }
  if (data.retired_readme_coverage_targets && targets.length > 0) {
    data.retired_readme_coverage_targets.targets = targets;
  }
  return data;
}

function listMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".md"))
    .map((f: string) => path.join(dir, f).replace(/\\/g, "/"));
}

function listMarkdownRecursive(dir: string): string[] {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }) as any[]) {
    const full = path.join(dir, ent.name).replace(/\\/g, "/");
    if (ent.isDirectory()) {
      out.push(...listMarkdownRecursive(full));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

// IR-025: 4-digit ADR filename must NOT exist under docs/decisions/.
function checkIr025(repoRoot: string, reg: RegistryData): RetiredArtifactFinding[] {
  const findings: RetiredArtifactFinding[] = [];
  const cfg = reg.retired_adr_path_patterns;
  if (!cfg || !cfg.forbidden_filename_regex || !cfg.scan_directory) return findings;
  const scanDir = path.join(repoRoot, cfg.scan_directory);
  const re = new RegExp(cfg.forbidden_filename_regex);
  for (const file of listMarkdown(scanDir)) {
    const base = path.basename(file);
    if (re.test(base)) {
      findings.push({
        rule_id: "IR-025",
        file,
        line: 1,
        matched: base,
        description: `Forbidden 4-digit ADR filename under docs/decisions/. Use DEC-NNN form (REQ-001-047, 048).`,
      });
    }
  }
  return findings;
}

// IR-037: active docs must not cite retired Decision ids as current baseline.
// Only the registry-listed retired ids are flagged. v2: prefix is exempt.
function checkIr037(repoRoot: string, reg: RegistryData): RetiredArtifactFinding[] {
  const findings: RetiredArtifactFinding[] = [];
  const cfg = reg.retired_decisions_as_current_baseline;
  if (!cfg || !cfg.retired_ids || cfg.retired_ids.length === 0) {
    // Empty registry: no retired DEC-NNN ids yet. Detector is a no-op while
    // preserving the IR-037 route. Re-evaluated when numbering-policy records
    // a retired DEC-NNN.
    return findings;
  }
  const exemption = cfg.v2_prefix_exemption ?? "v2:";
  const scanDirs = [
    path.join(repoRoot, "docs", "requirements"),
    path.join(repoRoot, "docs", "specs"),
    path.join(repoRoot, "docs", "guides"),
  ];
  for (const dir of scanDirs) {
    for (const file of listMarkdownRecursive(dir)) {
      const text = fs.readFileSync(file, "utf-8");
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const id of cfg.retired_ids) {
          const re = new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
          if (re.test(line)) {
            // Exempt v2: prefix occurrences (historical reference).
            const v2Re = new RegExp(`${exemption}${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
            if (v2Re.test(line)) continue;
            findings.push({
              rule_id: "IR-037",
              file,
              line: i + 1,
              matched: id,
              description: `Retired Decision ${id} cited as current baseline. Use v2: prefix for historical reference or replace with active successor.`,
            });
          }
        }
      }
    }
  }
  return findings;
}

// IR-043: README inventory files must remain consistent with active artifact
// set. Here we verify the listed README files exist; deeper AUTOGEN coverage
// is owned by IR-061 and generate_indexes.ts.
function checkIr043(repoRoot: string, reg: RegistryData): RetiredArtifactFinding[] {
  const findings: RetiredArtifactFinding[] = [];
  const cfg = reg.retired_readme_coverage_targets;
  if (!cfg || !cfg.targets) return findings;
  for (const target of cfg.targets) {
    const full = path.join(repoRoot, target.path);
    if (!fs.existsSync(full)) {
      findings.push({
        rule_id: "IR-043",
        file: target.path,
        line: 1,
        matched: target.path,
        description: `README inventory ${target.path} (${target.artifact_kind}) is missing. Active artifact coverage cannot be verified.`,
      });
    }
  }
  return findings;
}

export function checkRetiredArtifactResidual(
  repoRoot?: string,
): RetiredArtifactReport {
  const root = findRepoRoot(repoRoot ?? process.cwd());
  const dataPath = findDataFile(root);
  const reg = loadRegistry(dataPath);
  if (reg === null) {
    return {
      ok: false,
      findings: [],
      stats: { ir_025_violations: 0, ir_037_violations: 0, ir_043_violations: 0, scanned_files: 0 },
    };
  }

  const ir025 = checkIr025(root, reg);
  const ir037 = checkIr037(root, reg);
  const ir043 = checkIr043(root, reg);
  const findings = [...ir025, ...ir037, ...ir043];

  return {
    ok: findings.length === 0,
    findings,
    stats: {
      ir_025_violations: ir025.length,
      ir_037_violations: ir037.length,
      ir_043_violations: ir043.length,
      scanned_files: 0,
    },
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("usage: bun run check_retired_artifact_residual.ts [--root <path>] [--json]");
    process.exit(0);
  }
  const rootIdx = args.indexOf("--root");
  const repoRoot = rootIdx >= 0 ? args[rootIdx + 1] : undefined;
  const report = checkRetiredArtifactResidual(repoRoot);

  if (args.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`check_retired_artifact_residual.ts`);
    console.log(`=============================================================`);
    console.log(`ok: ${report.ok}`);
    console.log(`stats: ${JSON.stringify(report.stats, null, 2)}`);
    if (report.findings.length > 0) {
      console.log(`findings (${report.findings.length}):`);
      for (const f of report.findings) {
        console.log(`  [${f.rule_id}] ${f.file}:${f.line} matched=${f.matched}`);
        console.log(`    ${f.description}`);
      }
    }
  }
  process.exit(report.ok ? 0 : 1);
}
