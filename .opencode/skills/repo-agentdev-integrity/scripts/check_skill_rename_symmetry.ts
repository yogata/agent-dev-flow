// ADF-COVERS(implementation): REQ-010-063
// Skill rename symmetry checker.
//
// Deterministic checks under the REQ-010-063 inspection contract
// (docs/designs/integrity/targeted-docs-guard-implementation.md
// "skill rename 対称性検査観点"):
//
//   Constant checks (always run):
//     frontmatter-id: SKILL.md frontmatter `name` == skill directory name,
//     and Design frontmatter title token == Design filename stem.
//
//   Rename-time checks (only when renames are declared via `--rename`):
//     path-symmetry between the old and new names of each declared rename:
//     `src/opencode/skills/{name}` and `docs/designs/skills/{name}.md` must
//     move together. Same-name Skill Design existence is NOT a constant
//     invariant (Workflow Skills may have no dedicated same-name Design).
//     Maintained exceptions: a `superseded` Design without its skill dir is
//     tolerated; a `draft` Design symmetry break is reported as warning.
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
  | "frontmatter-id";

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
    renames_checked: number;
    path_symmetry_violations: number;
    frontmatter_id_violations: number;
  };
}

export interface RenamePair {
  from: string;
  to: string;
}

export interface SymmetryOptions {
  renames?: RenamePair[];
}

const DISTRIBUTION_SKILLS_PARENT = "src/opencode/skills";
const DESIGNS_SKILLS_DIR = "docs/designs/skills";
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
 * REQ-010-063 rename-time path symmetry. For each declared rename
 * `from` -> `to`, the skill dir and the same-name Design must move together:
 *
 *  R1: both old and new skill dirs exist        -> ng (incomplete rename)
 *  R2: both old and new Designs exist           -> ng (incomplete rename;
 *      a `superseded` old Design is exempt)
 *  R3: skill moved, Design remains at old name  -> ng (warning when the old
 *      Design is `draft`; `superseded` exempt)
 *  R3b: Design moved, skill dir remains at old name -> ng (warning when the
 *      new Design is `draft`; `superseded` exempt)
 *
 * Skills without a same-name Design (e.g. Workflow Skills) rename freely:
 * with no Design at either name, no correspondence exists to break.
 */
function checkRenamePathSymmetry(
  skills: SkillEntry[],
  designs: DesignEntry[],
  renames: RenamePair[],
): SymmetryFailure[] {
  const failures: SymmetryFailure[] = [];
  const skillByName = new Map(skills.map((s) => [s.name, s] as const));
  const designByName = new Map(designs.map((d) => [d.name, d] as const));

  for (const { from, to } of renames) {
    const skillFrom = skillByName.get(from);
    const skillTo = skillByName.get(to);
    const designFrom = designByName.get(from);
    const designTo = designByName.get(to);

    if (skillFrom && skillTo) {
      failures.push({
        category: "path-symmetry",
        level: "ng",
        message:
          `rename \`${from}\` -> \`${to}\`: both old and new skill dirs exist (old dir left behind)`,
        file: skillFrom.dir,
        expected: `only ${DISTRIBUTION_SKILLS_PARENT}/${to}`,
      });
    }

    if (designFrom && designTo && !isSupersededStatus(designFrom.status)) {
      failures.push({
        category: "path-symmetry",
        level: "ng",
        message:
          `rename \`${from}\` -> \`${to}\`: both old and new Design files exist (old Design left behind)`,
        file: designFrom.file,
        expected: `only ${DESIGNS_SKILLS_DIR}/${to}.md`,
      });
    }

    if (
      skillTo &&
      !skillFrom &&
      designFrom &&
      !isSupersededStatus(designFrom.status) &&
      !designTo
    ) {
      failures.push({
        category: "path-symmetry",
        level: designFrom.status === "draft" ? "warning" : "ng",
        message:
          `rename \`${from}\` -> \`${to}\`: skill dir moved but its Design remains at ${DESIGNS_SKILLS_DIR}/${from}.md`,
        file: designFrom.file,
        expected: `${DESIGNS_SKILLS_DIR}/${to}.md`,
      });
    }

    if (
      designTo &&
      !designFrom &&
      skillFrom &&
      !skillTo &&
      !isSupersededStatus(designTo.status)
    ) {
      failures.push({
        category: "path-symmetry",
        level: designTo.status === "draft" ? "warning" : "ng",
        message:
          `rename \`${from}\` -> \`${to}\`: Design moved but skill dir remains at ${DISTRIBUTION_SKILLS_PARENT}/${from}`,
        file: skillFrom.dir,
        expected: `${DISTRIBUTION_SKILLS_PARENT}/${to}/SKILL.md`,
      });
    }
  }

  return failures;
}

/**
 * REQ-010-063 constant frontmatter-id check.
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

export function checkSkillRenameSymmetry(
  repoRoot: string,
  options?: SymmetryOptions,
): SymmetryReport {
  const renames = options?.renames ?? [];
  const skills = listDistributionSkills(repoRoot);
  const designs = listDesigns(repoRoot);

  const frontmatterFailures = checkFrontmatterId(skills, designs);
  const pathFailures = checkRenamePathSymmetry(skills, designs, renames);

  const failures: SymmetryFailure[] = [
    ...frontmatterFailures,
    ...pathFailures,
  ];

  const stats = {
    skills_scanned: skills.length,
    designs_scanned: designs.length,
    renames_checked: renames.length,
    path_symmetry_violations: pathFailures.length,
    frontmatter_id_violations: frontmatterFailures.length,
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

function parseRenameArgs(args: string[]): RenamePair[] {
  const renames: RenamePair[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    let value: string | null = null;
    if (a === "--rename") {
      value = args[i + 1] ?? null;
      if (value !== null) i++;
    } else if (a.startsWith("--rename=")) {
      value = a.slice("--rename=".length);
    } else {
      continue;
    }
    if (value === null || value === "") {
      throw new Error("--rename requires a value (<old>=<new>)");
    }
    const eq = value.indexOf("=");
    if (eq <= 0 || eq === value.length - 1) {
      throw new Error(`--rename expects <old>=<new> (got '${value}')`);
    }
    const from = value.slice(0, eq);
    const to = value.slice(eq + 1);
    if (from === to) {
      throw new Error(`--rename old and new names must differ (got '${value}')`);
    }
    renames.push({ from, to });
  }
  return renames;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(
      `check_skill_rename_symmetry.ts - skill rename symmetry checker (REQ-010-063)

USAGE:
  bun .opencode/skills/repo-agentdev-integrity/scripts/check_skill_rename_symmetry.ts [repoRoot] [--json] [--rename <old>=<new>]...

OPTIONS:
  --help, -h          Show this help message
  --json              Output results in JSON format
  --rename <old>=<new>
                      Declare a skill rename (repeatable). Enables the
                      rename-time path-symmetry check for the pair: the skill
                      dir and the same-name Design must move together.

ARGUMENTS:
  repoRoot            Repository root (default: current working directory)

CHECKS:
  frontmatter-id   constant: SKILL.md name == dir, Design title token == filename stem
  path-symmetry    rename-time only (--rename): src/opencode/skills/{name} and
                   docs/designs/skills/{name}.md move together (same-name Skill
                   Design existence is not a constant invariant)

EXIT CODES:
  0  No issues found
  1  Issues detected (NG or warning)
  2  Input error or execution failure
`);
    process.exit(0);
  }

  const json = args.includes("--json");

  let renames: RenamePair[];
  try {
    renames = parseRenameArgs(args);
  } catch (e) {
    process.stderr.write(`error: ${(e as Error).message}\n`);
    process.exit(2);
  }

  const positional = args.filter(
    (a, idx) => !a.startsWith("-") && args[idx - 1] !== "--rename",
  );
  const repoRoot = positional[0] ? path.resolve(positional[0]) : process.cwd();

  if (!dirExists(repoRoot)) {
    process.stderr.write(`error: repoRoot does not exist: ${repoRoot}\n`);
    process.exit(2);
  }

  const report = checkSkillRenameSymmetry(repoRoot, { renames });

  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(
      `check_skill_rename_symmetry.ts - skill rename symmetry (REQ-010-063)\n`,
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
