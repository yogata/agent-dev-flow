// ADF-COVERS(implementation): REQ-010-063
// Skill rename symmetry checker (REQ-026).
//
// Deterministic checks for skill rename operations. Verifies three symmetries
// that must hold after a rename:
//
//   REQ-026-001 (path-symmetry):
//     For every distributed skill `src/opencode/skills/{X}/` there must be a
//     matching Design `docs/designs/skills/{X}.md`, and vice versa. Design with
//     status `superseded` is exempt (skill dir intentionally removed).
//
//   REQ-026-002 (frontmatter-id):
//     SKILL.md frontmatter `name` must equal the parent directory name.
//     Design frontmatter `title` must contain the skill name token matching
//     the Design filename stem.
//
//   REQ-026-003 (graph-node):
//     Artifact Graph skill nodes (`.agentdev/graph/nodes.jsonl`) must match
//     the current skill directory names. Orphans (graph node without dir)
//     and missing (dir without graph node) are reported as warnings because
//     the graph is regenerated data and may lag behind the source.
//
// Scope: distribution skills `agentdev-*` only. Repo-local skills
// (`repo-agentdev-*` under `.opencode/skills/`) and third-party skills
// without the `agentdev-` prefix are out of scope (REQ-002 boundary).
//
// Exit codes: 0 ok, 1 violation, 2 input error.

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export type SymmetryCategory =
  | "path-symmetry"
  | "frontmatter-id"
  | "graph-node";

export type SymmetryLevel = "ng" | "warning" | "ok" | "info";

export interface SymmetryFailure {
  category: SymmetryCategory;
  level: SymmetryLevel;
  message: string;
  file?: string;
  expected?: string;
  evidence?: string;
}

export interface SymmetryReport {
  ok: boolean;
  failures: SymmetryFailure[];
  stats: {
    skills_scanned: number;
    designs_scanned: number;
    graph_skill_nodes_scanned: number;
    path_symmetry_violations: number;
    frontmatter_id_violations: number;
    graph_node_violations: number;
    graph_missing: boolean;
  };
}

const DISTRIBUTION_SKILLS_PARENT = "src/opencode/skills";
const DESIGNS_SKILLS_DIR = "docs/designs/skills";
const GRAPH_NODES_PATH = ".agentdev/graph/nodes.jsonl";
const TEMPLATE_DESIGN = "_template.md";

function dirExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
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

/**
 * Parse YAML frontmatter from a Markdown source. Returns an empty object when
 * frontmatter is missing or unparseable. Only the subset used by this checker
 * (key: value lines) is supported; values are stripped of surrounding quotes
 * and backticks.
 */
export function parseFrontmatter(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return out;
  const body = match[1];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2].trim();
    // Strip surrounding double or single quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/**
 * Extract the skill name token from a Design `title` frontmatter value.
 * Titles follow conventions like:
 *   `agentdev-doc-writing` Design
 *   "agentdev-gh-cli" Design
 *   agentdev-workflow-lifecycle Design
 * Returns the leading contiguous token (alphanumeric, dash, underscore) or
 * null when no token can be extracted.
 */
export function extractSkillNameFromTitle(title: string): string | null {
  if (!title) return null;
  const stripped = title
    .replace(/^[`"']+/, "")
    .replace(/[`"']+$/, "")
    .trim();
  const m = stripped.match(/^([A-Za-z0-9][A-Za-z0-9_-]*)/);
  return m ? m[1] : null;
}

interface SkillEntry {
  name: string;
  dir: string;
}

interface DesignEntry {
  name: string;
  file: string;
  status: string;
  title: string;
}

function listDistributionSkills(repoRoot: string): SkillEntry[] {
  const parent = path.join(repoRoot, DISTRIBUTION_SKILLS_PARENT);
  const out: SkillEntry[] = [];
  if (!dirExists(parent)) return out;
  const entries = fs.readdirSync(parent, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (!ent.name.startsWith("agentdev-")) continue;
    out.push({ name: ent.name, dir: path.join(parent, ent.name) });
  }
  return out;
}

function listDesigns(repoRoot: string): DesignEntry[] {
  const dir = path.join(repoRoot, DESIGNS_SKILLS_DIR);
  const out: DesignEntry[] = [];
  if (!dirExists(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".md")) continue;
    if (ent.name === TEMPLATE_DESIGN) continue;
    const stem = ent.name.slice(0, -3);
    if (!stem.startsWith("agentdev-")) continue;
    const file = path.join(dir, ent.name);
    const text = readText(file);
    const fm = text ? parseFrontmatter(text) : {};
    out.push({
      name: stem,
      file,
      status: fm.status || "",
      title: fm.title || "",
    });
  }
  return out;
}

function isSupersededStatus(status: string): boolean {
  return status === "superseded";
}

/**
 * REQ-026-001: physical path symmetry between distribution skills and Designs.
 */
function checkPathSymmetry(
  skills: SkillEntry[],
  designs: DesignEntry[],
): SymmetryFailure[] {
  const failures: SymmetryFailure[] = [];
  const skillNames = new Set(skills.map((s) => s.name));
  const designByName = new Map(designs.map((s) => [s.name, s] as const));

  // skill dir exists → Design must exist
  for (const skill of skills) {
    if (!designByName.has(skill.name)) {
      failures.push({
        category: "path-symmetry",
        level: "ng",
        message:
          `distribution skill \`${skill.name}\` has no matching Design at ${DESIGNS_SKILLS_DIR}/${skill.name}.md`,
        file: skill.dir,
        expected: `${DESIGNS_SKILLS_DIR}/${skill.name}.md`,
      });
    }
  }

  // Design exists → skill dir must exist (unless superseded)
  for (const design of designs) {
    if (skillNames.has(design.name)) continue;
    if (isSupersededStatus(design.status)) {
      // superseded Design intentionally has no skill dir; not a violation
      continue;
    }
    const level = design.status === "accepted" ? "ng" : "warning";
    failures.push({
      category: "path-symmetry",
      level,
      message:
        `Design \`${design.name}\` (status: ${design.status || "unknown"}) has no matching distribution skill at ${DISTRIBUTION_SKILLS_PARENT}/${design.name}`,
      file: design.file,
      expected: `${DISTRIBUTION_SKILLS_PARENT}/${design.name}/SKILL.md`,
    });
  }

  return failures;
}

/**
 * REQ-026-002: frontmatter id consistency.
 *
 * SKILL.md `name` must equal parent directory name.
 * Design `title` must contain the skill name token matching the filename stem.
 */
function checkFrontmatterId(
  skills: SkillEntry[],
  designs: DesignEntry[],
): SymmetryFailure[] {
  const failures: SymmetryFailure[] = [];

  for (const skill of skills) {
    const skillMd = path.join(skill.dir, "SKILL.md");
    const text = readText(skillMd);
    if (text === null) {
      failures.push({
        category: "frontmatter-id",
        level: "ng",
        message: `SKILL.md not found at ${skillMd}`,
        file: skillMd,
      });
      continue;
    }
    const fm = parseFrontmatter(text);
    const name = fm.name;
    if (!name) {
      failures.push({
        category: "frontmatter-id",
        level: "ng",
        message: `SKILL.md frontmatter missing \`name\` field`,
        file: skillMd,
        expected: `name: ${skill.name}`,
      });
      continue;
    }
    if (name !== skill.name) {
      failures.push({
        category: "frontmatter-id",
        level: "ng",
        message:
          `SKILL.md frontmatter \`name\` (${name}) does not match parent directory (${skill.name})`,
        file: skillMd,
        expected: `name: ${skill.name}`,
        evidence: `name: ${name}`,
      });
    }
  }

  for (const design of designs) {
    if (!design.title) {
      // missing title is out of scope for this check; frontmatter required-fields
      // is owned by check_integrity.ts. Skip silently.
      continue;
    }
    const extracted = extractSkillNameFromTitle(design.title);
    if (extracted === null) {
      failures.push({
        category: "frontmatter-id",
        level: "warning",
        message:
          `Design title \`${design.title}\` does not contain a parseable skill name token`,
        file: design.file,
        expected: design.name,
      });
      continue;
    }
    if (extracted !== design.name) {
      failures.push({
        category: "frontmatter-id",
        level: "warning",
        message:
          `Design title token \`${extracted}\` does not match filename stem \`${design.name}\``,
        file: design.file,
        expected: design.name,
        evidence: design.title,
      });
    }
  }

  return failures;
}

interface GraphSkillNode {
  id: string;
  label: string;
}

/**
 * Read `.agentdev/graph/nodes.jsonl` and extract skill nodes.
 * Returns null when the graph is absent (caller reports info, not failure).
 */
function readGraphSkillNodes(repoRoot: string): GraphSkillNode[] | null {
  const nodesPath = path.join(repoRoot, GRAPH_NODES_PATH);
  const text = readText(nodesPath);
  if (text === null) return null;
  const out: GraphSkillNode[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj && obj.type === "skill" && typeof obj.id === "string") {
        out.push({ id: obj.id, label: obj.label || obj.id });
      }
    } catch {
      // skip malformed lines silently; graph integrity is owned elsewhere
    }
  }
  return out;
}

/**
 * REQ-026-003: Artifact Graph skill node integrity.
 *
 * Graph node labels must match current distribution skill names. Orphans and
 * missing entries indicate the graph was not regenerated after a rename.
 */
function checkGraphNodeIntegrity(
  skills: SkillEntry[],
  graphNodes: GraphSkillNode[] | null,
): SymmetryFailure[] {
  const failures: SymmetryFailure[] = [];
  if (graphNodes === null) {
    // graph absent: not a violation, callers handle via stats.graph_missing
    return failures;
  }
  const skillNames = new Set(skills.map((s) => s.name));
  const graphLabels = new Set(graphNodes.map((n) => n.label));

  for (const node of graphNodes) {
    if (!skillNames.has(node.label)) {
      failures.push({
        category: "graph-node",
        level: "warning",
        message:
          `Artifact Graph skill node \`${node.label}\` has no matching distribution skill directory (graph likely stale after rename/removal)`,
        evidence: node.id,
        expected: `${DISTRIBUTION_SKILLS_PARENT}/${node.label}/`,
      });
    }
  }

  for (const skill of skills) {
    if (!graphLabels.has(skill.name)) {
      failures.push({
        category: "graph-node",
        level: "warning",
        message:
          `distribution skill \`${skill.name}\` is not present in Artifact Graph (graph likely stale after rename/add)`,
        evidence: skill.dir,
        expected: `skill:${skill.name}`,
      });
    }
  }

  return failures;
}

export function checkSkillRenameSymmetry(repoRoot: string): SymmetryReport {
  const skills = listDistributionSkills(repoRoot);
  const designs = listDesigns(repoRoot);
  const graphNodes = readGraphSkillNodes(repoRoot);

  const pathFailures = checkPathSymmetry(skills, designs);
  const frontmatterFailures = checkFrontmatterId(skills, designs);
  const graphFailures = checkGraphNodeIntegrity(skills, graphNodes);

  const failures: SymmetryFailure[] = [
    ...pathFailures,
    ...frontmatterFailures,
    ...graphFailures,
  ];

  const stats = {
    skills_scanned: skills.length,
    designs_scanned: designs.length,
    graph_skill_nodes_scanned: graphNodes ? graphNodes.length : 0,
    path_symmetry_violations: pathFailures.length,
    frontmatter_id_violations: frontmatterFailures.length,
    graph_node_violations: graphFailures.length,
    graph_missing: graphNodes === null,
  };

  const blocking = failures.filter(
    (f) => f.level === "ng" || f.level === "warning",
  );

  return {
    ok: blocking.length === 0,
    failures,
    stats,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(
      `check_skill_rename_symmetry.ts - skill rename symmetry checker (REQ-026)

USAGE:
  bun .opencode/skills/repo-agentdev-integrity/scripts/check_skill_rename_symmetry.ts [repoRoot] [--json]

OPTIONS:
  --help, -h   Show this help message
  --json       Output results in JSON format

ARGUMENTS:
  repoRoot     Repository root (default: current working directory)

CHECKS:
  path-symmetry    REQ-026-001: src/opencode/skills/{X} <-> docs/designs/skills/{X}.md
  frontmatter-id   REQ-026-002: SKILL.md name == dir, Design title token == filename stem
  graph-node       REQ-026-003: Artifact Graph skill nodes match skill directories

EXIT CODES:
  0  No issues found
  1  Issues detected (NG or warning)
  2  Input error or execution failure
`);
    process.exit(0);
  }

  const json = args.includes("--json");
  const positional = args.filter((a) => !a.startsWith("-"));
  const repoRoot = positional[0] ? path.resolve(positional[0]) : process.cwd();

  if (!dirExists(repoRoot)) {
    process.stderr.write(`error: repoRoot does not exist: ${repoRoot}\n`);
    process.exit(2);
  }

  const report = checkSkillRenameSymmetry(repoRoot);

  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(
      `check_skill_rename_symmetry.ts - skill rename symmetry (REQ-026)\n`,
    );
    process.stdout.write(
      `=============================================================\n`,
    );
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    if (report.failures.length > 0) {
      process.stdout.write(`\nfailures (${report.failures.length}):\n`);
      for (const f of report.failures) {
        const loc = f.file ? ` file=${f.file}` : "";
        const exp = f.expected ? ` expected=${f.expected}` : "";
        const evi = f.evidence ? ` evidence=${f.evidence}` : "";
        process.stdout.write(
          `  [${f.category}/${f.level}] ${f.message}${loc}${exp}${evi}\n`,
        );
      }
    }
  }

  process.exit(report.ok ? 0 : 1);
}
