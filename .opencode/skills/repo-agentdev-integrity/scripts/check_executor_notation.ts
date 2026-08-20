// check_executor_notation.ts
//
// Common detector for IR-050 (load_skills command mis-specification) and
// IR-051 (executor skill notation misrecognition).
//
// Consolidates the two strict + grep detection rules per Phase 3 §4.8 of
// cross-cutting-integration-design-20260811.md. Detection data is loaded
// from data/distribution-targets.yaml (executor classification) and from
// authoring/vocabulary-registry.md (load_skills exemption list).
//
// Exit codes: 0 ok, 1 violation, 2 error.

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export type ExecutorRuleId = "IR-050" | "IR-051";

export interface ExecutorFinding {
  rule_id: ExecutorRuleId;
  file: string;
  line: number;
  matched: string;
  description: string;
}

export interface ExecutorReport {
  ok: boolean;
  findings: ExecutorFinding[];
  stats: {
    ir_050_violations: number;
    ir_051_violations: number;
    scanned_files: number;
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

export function listMarkdownRecursive(dir: string): string[] {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }) as any[]) {
    const full = path.join(dir, ent.name).replace(/\\/g, "/");
    if (ent.isDirectory()) {
      // Skip unrelated subtrees to keep the scan focused.
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      out.push(...listMarkdownRecursive(full));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

// IR-050: load_skills command argument must reference a Capability Skill
// (agentdev-*). Forbidden forms include skills: that don't exist, deprecated
// skill names, or passing non-skill tokens. We verify that load_skills values
// start with the agentdev- prefix and reference an existing skill directory.
const LOAD_SKILLS_RE = /\bload_skills\s*[:=]\s*\[([^\]]*)\]/g;
const LOAD_SKILLS_ITEM_RE = /['"`]([^'"`]+)['"`]/g;

// IR-051: executor subject classification. The vocabulary bans referring to a
// command/harness/subagent as a "skill" (and vice versa). Detection targets
// the explicit misclassification signal `skill が`/`skill は` immediately
// preceded by a command name (`/agentdev/...`) or harness term.
const COMMAND_AS_SKILL_RE = /\/agentdev\/[a-z-]+\s*\([^)]*\)\s*(?:は|が)\s*skill/g;
const SUBAGENT_AS_COMMAND_RE = /\b(?:case-run|adapter|delegation)\s+(?:subagent|サブエージェント)\s*\([^)]*\)\s*を\s*\/?agentdev\//g;

const REQUIRED_SKILL_PREFIX = "agentdev-";

const EXEMPT_NON_AGENTDEV_SKILLS = new Set<string>([
  "japanese-tech-writing",
]);

function isPlaceholderToken(s: string): boolean {
  if (/^\.\.\.?$/.test(s)) return true;
  if (s.includes("{") || s.includes("<") || s.includes("*")) return true;
  if (s === "quick" || s === "deep" || s === "none") return true;
  return false;
}

function collectScanFiles(repoRoot: string): string[] {
  const dirs = [
    path.join(repoRoot, "src", "opencode", "commands"),
    path.join(repoRoot, "src", "opencode", "skills"),
    path.join(repoRoot, "docs", "specs"),
    path.join(repoRoot, "docs", "requirements"),
  ];
  const out: string[] = [];
  for (const d of dirs) out.push(...listMarkdownRecursive(d));
  return out;
}

function checkIr050(files: string[], repoRoot: string): ExecutorFinding[] {
  const findings: ExecutorFinding[] = [];
  const skillsDir = path.join(repoRoot, "src", "opencode", "skills");
  const knownSkills = new Set<string>();
  if (fs.existsSync(skillsDir)) {
    for (const ent of fs.readdirSync(skillsDir, { withFileTypes: true }) as any[]) {
      if (ent.isDirectory() && ent.name.startsWith(REQUIRED_SKILL_PREFIX)) {
        knownSkills.add(ent.name);
      }
    }
  }

  for (const file of files) {
    const text = fs.readFileSync(file, "utf-8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      LOAD_SKILLS_RE.lastIndex = 0;
      const listMatch = LOAD_SKILLS_RE.exec(line);
      if (!listMatch) continue;
      const inner = listMatch[1];
      LOAD_SKILLS_ITEM_RE.lastIndex = 0;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = LOAD_SKILLS_ITEM_RE.exec(inner)) !== null) {
        const skillName = itemMatch[1];
        if (!skillName) continue;
        if (isPlaceholderToken(skillName)) continue;
        if (EXEMPT_NON_AGENTDEV_SKILLS.has(skillName)) continue;
        if (!skillName.startsWith(REQUIRED_SKILL_PREFIX)) {
          findings.push({
            rule_id: "IR-050",
            file,
            line: i + 1,
            matched: skillName,
            description: `load_skills value '${skillName}' lacks required '${REQUIRED_SKILL_PREFIX}' prefix (REQ-010-261).`,
          });
          continue;
        }
        if (knownSkills.size > 0 && !knownSkills.has(skillName)) {
          findings.push({
            rule_id: "IR-050",
            file,
            line: i + 1,
            matched: skillName,
            description: `load_skills value '${skillName}' does not match a known skill directory under src/opencode/skills/ (REQ-010-261).`,
          });
        }
      }
    }
  }
  return findings;
}

function checkIr051(files: string[]): ExecutorFinding[] {
  const findings: ExecutorFinding[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf-8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip lines that describe the prohibition itself (meta-discussion).
      if (line.includes("IR-051") || line.includes("表記誤認検出")) continue;
      const m1 = line.match(COMMAND_AS_SKILL_RE);
      if (m1) {
        for (const m of m1) {
          findings.push({
            rule_id: "IR-051",
            file,
            line: i + 1,
            matched: m,
            description: `Executor misclassification: command referenced as skill (REQ-010-261). Use 'command' for /agentdev/* and 'skill' for agentdev-* capabilities.`,
          });
        }
      }
      const m2 = line.match(SUBAGENT_AS_COMMAND_RE);
      if (m2) {
        for (const m of m2) {
          findings.push({
            rule_id: "IR-051",
            file,
            line: i + 1,
            matched: m,
            description: `Executor misclassification: subagent referenced via /agentdev/ invocation form (REQ-010-261). Subagents are delegated via task(), not invoked as commands.`,
          });
        }
      }
    }
  }
  return findings;
}

export function checkExecutorNotation(repoRoot?: string): ExecutorReport {
  const root = findRepoRoot(repoRoot ?? process.cwd());
  const files = collectScanFiles(root);

  const ir050 = checkIr050(files, root);
  const ir051 = checkIr051(files);
  const findings = [...ir050, ...ir051];

  return {
    ok: findings.length === 0,
    findings,
    stats: {
      ir_050_violations: ir050.length,
      ir_051_violations: ir051.length,
      scanned_files: files.length,
    },
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("usage: bun run check_executor_notation.ts [--root <path>] [--json]");
    process.exit(0);
  }
  const rootIdx = args.indexOf("--root");
  const repoRoot = rootIdx >= 0 ? args[rootIdx + 1] : undefined;
  const report = checkExecutorNotation(repoRoot);

  if (args.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`check_executor_notation.ts`);
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
