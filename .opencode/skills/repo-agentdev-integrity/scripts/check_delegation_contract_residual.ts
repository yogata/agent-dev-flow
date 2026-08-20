// check_delegation_contract_residual.ts
//
// Common detector for IR-032 (delegation_type / on_result required-envelope
// prohibition) and IR-033 (lightweight-delegation primary-pattern prohibition).
//
// Consolidates the two strict + grep detection rules per Phase 3 §4.5 of
// cross-cutting-integration-design-20260811.md. Detection data is loaded from
// data/delegation-contract-patterns.yaml. The YAML is a detection-view;
// canonical rules live in IR-032 / IR-033 files and in
// docs/designs/workflows/delegation-contracts.md.
//
// Exit codes: 0 ok, 1 violation, 2 error.

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export type DelegationRuleId = "IR-032" | "IR-033";

export interface DelegationFinding {
  rule_id: DelegationRuleId;
  file: string;
  line: number;
  matched: string;
  description: string;
}

export interface DelegationReport {
  ok: boolean;
  findings: DelegationFinding[];
  stats: {
    ir_032_violations: number;
    ir_033_violations: number;
    scanned_files: number;
  };
}

interface PatternGroup {
  description?: string;
  forbidden_patterns?: string[];
  scan_targets?: string[];
  exemption_hints?: string[];
}

interface DelegationPatternData {
  schema_version: number;
  required_envelope_prohibition?: PatternGroup;
  lightweight_delegation_primary_prohibition?: PatternGroup;
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
  return path.join(
    repoRoot,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "data",
    "delegation-contract-patterns.yaml",
  );
}

function loadData(filePath: string): DelegationPatternData | null {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf-8");
  const data: DelegationPatternData = {};
  let section: keyof DelegationPatternData | null = null;
  // Track the active list within the current section: "patterns" | "exemptions" | "targets" | null
  let activeList: "patterns" | "exemptions" | "targets" | null = null;
  const patternsByKey: Record<string, string[]> = {
    required_envelope_prohibition: [],
    lightweight_delegation_primary_prohibition: [],
  };
  const exemptionsByKey: Record<string, string[]> = {
    required_envelope_prohibition: [],
    lightweight_delegation_primary_prohibition: [],
  };
  const targetsByKey: Record<string, string[]> = {
    required_envelope_prohibition: [],
    lightweight_delegation_primary_prohibition: [],
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, "");
    if (line.startsWith("#") || line.trim() === "") continue;

    if (line.startsWith("required_envelope_prohibition:")) {
      section = "required_envelope_prohibition";
      data.required_envelope_prohibition = {};
      activeList = null;
      continue;
    }
    if (line.startsWith("lightweight_delegation_primary_prohibition:")) {
      section = "lightweight_delegation_primary_prohibition";
      data.lightweight_delegation_primary_prohibition = {};
      activeList = null;
      continue;
    }

    if (section === null) continue;
    const sec = section;

    if (/^\s+forbidden_patterns:\s*$/.test(line)) {
      activeList = "patterns";
      continue;
    }
    if (/^\s+exemption_hints:\s*$/.test(line)) {
      activeList = "exemptions";
      continue;
    }
    if (/^\s+scan_targets:\s*$/.test(line)) {
      activeList = "targets";
      continue;
    }

    // List items under the active list.
    const listItemMatch = line.match(/^\s+-\s+"?(.+?)"?\s*$/);
    if (listItemMatch && activeList !== null) {
      const value = listItemMatch[1];
      if (activeList === "patterns") patternsByKey[sec].push(value);
      else if (activeList === "exemptions") exemptionsByKey[sec].push(value);
      else if (activeList === "targets") targetsByKey[sec].push(value);
      continue;
    }

    // Non-list key inside the section: capture simple scalars and reset activeList.
    if (/^\s+[A-Za-z_]+:/.test(line)) {
      activeList = null;
      const kvMatch = line.match(/^\s+([A-Za-z_]+):\s+(.+)$/);
      if (kvMatch && data[sec]) {
        const rawValue = kvMatch[2].replace(/^"(.*)"$/, "$1");
        (data[sec] as PatternGroup)[kvMatch[1] as keyof PatternGroup] = rawValue as any;
      }
    }
  }

  for (const key of Object.keys(patternsByKey) as Array<keyof DelegationPatternData>) {
    const group = data[key] as PatternGroup | undefined;
    if (group) {
      group.forbidden_patterns = patternsByKey[key];
      group.exemption_hints = exemptionsByKey[key];
      group.scan_targets = targetsByKey[key];
    }
  }
  return data;
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

function collectScanFiles(repoRoot: string, scanTargets: string[] | undefined): string[] {
  if (!scanTargets) return [];
  const files: string[] = [];
  for (const rel of scanTargets) {
    const abs = path.join(repoRoot, rel);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
      files.push(...listMarkdownRecursive(abs));
    }
  }
  return files;
}

function isLineExempt(line: string, hints: string[] | undefined): boolean {
  if (!hints) return false;
  for (const hint of hints) {
    if (line.includes(hint)) return true;
  }
  return false;
}

function scanPatterns(
  ruleId: DelegationRuleId,
  files: string[],
  patterns: string[] | undefined,
  exemptions: string[] | undefined,
  description: string,
): DelegationFinding[] {
  const findings: DelegationFinding[] = [];
  if (!patterns || patterns.length === 0) return findings;
  const compiled = patterns.map((p) => new RegExp(p));
  for (const file of files) {
    const text = fs.readFileSync(file, "utf-8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isLineExempt(line, exemptions)) continue;
      for (let pi = 0; pi < compiled.length; pi++) {
        const re = compiled[pi];
        const m = line.match(re);
        if (m) {
          findings.push({
            rule_id: ruleId,
            file,
            line: i + 1,
            matched: m[0],
            description,
          });
        }
      }
    }
  }
  return findings;
}

export function checkDelegationContractResidual(
  repoRoot?: string,
): DelegationReport {
  const root = findRepoRoot(repoRoot ?? process.cwd());
  const dataPath = findDataFile(root);
  const data = loadData(dataPath);

  if (data === null) {
    return {
      ok: false,
      findings: [],
      stats: { ir_032_violations: 0, ir_033_violations: 0, scanned_files: 0 },
    };
  }

  const ir032Files = collectScanFiles(root, data.required_envelope_prohibition?.scan_targets);
  const ir033Files = collectScanFiles(
    root,
    data.lightweight_delegation_primary_prohibition?.scan_targets,
  );

  const ir032 = scanPatterns(
    "IR-032",
    ir032Files,
    data.required_envelope_prohibition?.forbidden_patterns,
    data.required_envelope_prohibition?.exemption_hints,
    "Forbidden: delegation_type / on_result treated as required envelope (REQ-003-017, 018).",
  );
  const ir033 = scanPatterns(
    "IR-033",
    ir033Files,
    data.lightweight_delegation_primary_prohibition?.forbidden_patterns,
    data.lightweight_delegation_primary_prohibition?.exemption_hints,
    "Forbidden: lightweight-delegation treated as primary delegation pattern (REQ-003-015, 016).",
  );

  const findings = [...ir032, ...ir033];
  return {
    ok: findings.length === 0,
    findings,
    stats: {
      ir_032_violations: ir032.length,
      ir_033_violations: ir033.length,
      scanned_files: ir032Files.length + ir033Files.length,
    },
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("usage: bun run check_delegation_contract_residual.ts [--root <path>] [--json]");
    process.exit(0);
  }
  const rootIdx = args.indexOf("--root");
  const repoRoot = rootIdx >= 0 ? args[rootIdx + 1] : undefined;
  const report = checkDelegationContractResidual(repoRoot);

  if (args.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`check_delegation_contract_residual.ts`);
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
