// Distribution reference boundary checker (adapter).
//
// This file is the adapter over the canonical side-effect-free detector at
// ./lib/distribution-boundary.ts. Per docs/specs/integrity/distribution-boundary.md
// (stable implementation contract) the canonical detector owns classification;
// this adapter adds filesystem scanning, baseline/exemption/delta bookkeeping,
// the repo-self-hosting-specific IR-046/047/048 rules, and the CLI.
//
// Detection behaviour (patterns, template allowance, README allowance) is
// owned by the lib module. This adapter only translates lib Detection records
// into the legacy BoundaryFailure shape and applies baseline/exemption policy.
//
// Exit codes: 0 ok, 1 violation, 2 error.

import * as path from "path";
import * as fs from "fs";
import {
  classifyContent,
  decideGate,
  PROJECTIONS,
  type Projection,
  type Detection,
} from "./lib/distribution-boundary.ts";

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

export interface BaselineEntry {
  file: string;
  category: BoundaryFailure["category"];
  matched: string;
  count: number;
}

export interface BaselineFile {
  version: 1;
  rule_id: "IR-059";
  generated_at: string;
  description: string;
  entries: BaselineEntry[];
}

// §6.4.1 explicit exemption mechanism (B3).
// Exemptions are approval-backed exceptions, distinct from the baseline
// (which is unresolved debt). Only entries with review_status="accepted"
// are applied. rationale_ref must point at docs/adr/** or an accepted SPEC.
export type ExemptionRationaleCategory =
  | "harness_reference"
  | "accepted_canonical_doc"
  | "historical_context";

export type ExemptionReviewStatus = "accepted" | "rejected" | "pending";

export interface ExemptionEntry {
  id: string;
  rule: string;
  file: string;
  matched: string;
  rationale_category: ExemptionRationaleCategory;
  rationale_ref: string;
  added_at_commit: string;
  review_status: ExemptionReviewStatus;
}

export interface ExemptionFile {
  version: 1;
  description: string;
  entries: ExemptionEntry[];
}

export interface DeltaReport {
  new_failures: BoundaryFailure[];
  resolved: Array<{
    file: string;
    category: BoundaryFailure["category"];
    matched: string;
    baseline_count: number;
    current_count: number;
  }>;
  ok: boolean;
  stats: {
    current_total: number;
    baseline_total: number;
    new_delta: number;
    resolved_count: number;
  };
}

// Re-export the patterns so any downstream tooling that imported them from
// this adapter continues to work.
export {
  CONCRETE_ID_PATTERN,
  DOCS_PATH_PATTERN,
  FIXED_URL_PATTERN,
  RAW_FIXED_URL_PATTERN,
  isConcreteDocsPath,
} from "./lib/distribution-boundary.ts";

// Repository layout constants used to enumerate scan targets. Both the
// adapter's collectTargets and the IR-046/047/048 rules reference these.
const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
const PUBLIC_SKILLS_PARENT = "src/opencode/skills";

function normalizeProfileToProjection(profile: string): Projection | null {
  switch (profile) {
    case "source":
      return "source";
    case "link":
    case "installed":
      return "link";
    case "archive":
      return "archive";
    case "archive-installed":
    case "release":
      return "archive-installed";
    default:
      return null;
  }
}

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
      // node_modules サブツリーは third-party README の fixed_url false positive を防ぐためスキップ
      if (ent.name === "node_modules") continue;
      result.push(...listMarkdownFiles(full, true));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      result.push(full.replace(/\\/g, "/"));
    }
  }
  return result;
}

function isLineExempt(_line: string): boolean {
  // Deprecated: line-level exemption hints were removed because they hid real
  // IDs on the same line. Template/glob forms are excluded by the lib patterns
  // themselves. Retained as a no-op for any external caller.
  return false;
}

function collectTargets(repoRoot: string, projection: Projection): string[] {
  const targets: string[] = [];
  // source/archive projections inspect the producer source tree (src/opencode/).
  // link/archive-installed projections inspect the consumer-side installed tree
  // (.opencode/), per docs/specs/integrity/distribution-boundary.md
  // "projection の分離". The directory contents are expected to be equivalent
  // (consumer install copies src/opencode/** -> .opencode/**).
  const isInstalledProjection =
    projection === "link" || projection === "archive-installed";
  const commandRel = isInstalledProjection
    ? path.join(".opencode", "commands", "agentdev")
    : PUBLIC_COMMAND_DIR;
  const skillsRel = isInstalledProjection
    ? path.join(".opencode", "skills")
    : PUBLIC_SKILLS_PARENT;
  // Public commands
  targets.push(...listMarkdownFiles(path.join(repoRoot, commandRel), true));
  // Public skills (agentdev-* only)
  const skillsParent = path.join(repoRoot, skillsRel);
  if (dirExists(skillsParent)) {
    const entries = fs.readdirSync(skillsParent, { withFileTypes: true }) as Array<fs.Dirent>;
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (!ent.name.startsWith("agentdev-")) continue;
      const skillDir = path.join(skillsParent, ent.name);
      targets.push(...listMarkdownFiles(skillDir, true));
    }
  }
  return targets;
}

function detectionToFailure(d: Detection): BoundaryFailure {
  return {
    category: d.category as BoundaryFailure["category"],
    file: d.file,
    line: d.line,
    snippet: d.snippet,
    matched: d.matched,
  };
}

export function checkDistributionBoundary(repoRoot: string, projection: Projection = "source"): BoundaryReport {
  const failures: BoundaryFailure[] = [];
  const stats = {
    scanned_files: 0,
    concrete_id_hits: 0,
    concrete_path_hits: 0,
    fixed_url_hits: 0,
  };

  const targets = collectTargets(repoRoot, projection);
  stats.scanned_files = targets.length;

  for (const file of targets) {
    const text = readText(file);
    if (text === null) continue;
    const detections = classifyContent(text, file, projection);
    for (const d of detections) {
      const f = detectionToFailure(d);
      if (f.category === "concrete-id") stats.concrete_id_hits += 1;
      else if (f.category === "concrete-path") stats.concrete_path_hits += 1;
      else if (f.category === "fixed-url") stats.fixed_url_hits += 1;
      failures.push(f);
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    stats,
  };
}

function normalizeFileForBaseline(file: string, repoRoot: string): string {
  const norm = file.replace(/\\/g, "/");
  const root = repoRoot.replace(/\\/g, "/");
  if (norm.startsWith(root + "/")) {
    return norm.slice(root.length + 1);
  }
  return norm;
}

function countBySignature(
  failures: BoundaryFailure[],
  repoRoot: string,
): Map<string, { file: string; category: BoundaryFailure["category"]; matched: string; count: number }> {
  const map = new Map<string, { file: string; category: BoundaryFailure["category"]; matched: string; count: number }>();
  for (const f of failures) {
    const file = normalizeFileForBaseline(f.file, repoRoot);
    const key = `${file}\u0000${f.category}\u0000${f.matched}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { file, category: f.category, matched: f.matched, count: 1 });
    }
  }
  return map;
}

export function buildBaseline(report: BoundaryReport, repoRoot: string, description: string): BaselineFile {
  const counts = countBySignature(report.failures, repoRoot);
  const entries = Array.from(counts.values()).sort((a, b) => {
    if (a.file !== b.file) return a.file < b.file ? -1 : 1;
    if (a.category !== b.category) return a.category < b.category ? -1 : 1;
    return a.matched < b.matched ? -1 : a.matched > b.matched ? 1 : 0;
  });
  return {
    version: 1,
    rule_id: "IR-059",
    generated_at: new Date().toISOString().slice(0, 10),
    description,
    entries,
  };
}

export function saveBaseline(baseline: BaselineFile, baselinePath: string): void {
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n", "utf8");
}

export function loadBaseline(baselinePath: string): BaselineFile | null {
  const text = readText(baselinePath);
  if (text === null) return null;
  try {
    const parsed = JSON.parse(text) as BaselineFile;
    if (parsed.version !== 1 || parsed.rule_id !== "IR-059" || !Array.isArray(parsed.entries)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function loadExemptions(exemptionsPath: string): ExemptionFile | null {
  const text = readText(exemptionsPath);
  if (text === null) return null;
  try {
    const parsed = JSON.parse(text) as ExemptionFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.entries)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface ExemptionMatchResult {
  exempted: BoundaryFailure[];
  remaining: BoundaryFailure[];
}

export function applyExemptions(
  failures: BoundaryFailure[],
  exemptions: ExemptionFile | null,
  repoRoot: string,
): ExemptionMatchResult {
  if (exemptions === null || exemptions.entries.length === 0) {
    return { exempted: [], remaining: failures };
  }
  const accepted = exemptions.entries.filter((e) => e.review_status === "accepted");
  if (accepted.length === 0) {
    return { exempted: [], remaining: failures };
  }
  const exempted: BoundaryFailure[] = [];
  const remaining: BoundaryFailure[] = [];
  for (const f of failures) {
    const normalizedFile = normalizeFileForBaseline(f.file, repoRoot);
    const hit = accepted.find(
      (e) => e.file === normalizedFile && e.matched === f.matched,
    );
    if (hit) {
      exempted.push(f);
    } else {
      remaining.push(f);
    }
  }
  return { exempted, remaining };
}

export function computeDelta(report: BoundaryReport, baseline: BaselineFile, repoRoot: string): DeltaReport {
  const currentCounts = countBySignature(report.failures, repoRoot);
  const baselineMap = new Map<string, BaselineEntry>();
  for (const e of baseline.entries) {
    baselineMap.set(`${e.file}\u0000${e.category}\u0000${e.matched}`, e);
  }

  const newFailures: BoundaryFailure[] = [];
  const resolved: DeltaReport["resolved"] = [];

  for (const [key, current] of currentCounts) {
    const base = baselineMap.get(key);
    const baselineCount = base ? base.count : 0;
    if (current.count > baselineCount) {
      const overshoot = current.count - baselineCount;
      const matches = report.failures.filter(
        (f) =>
          normalizeFileForBaseline(f.file, repoRoot) === current.file &&
          f.category === current.category &&
          f.matched === current.matched,
      );
      for (let i = 0; i < overshoot; i++) {
        const src = matches[baselineCount + i] ?? matches[matches.length - 1];
        if (src) newFailures.push(src);
      }
    } else if (current.count < baselineCount) {
      resolved.push({
        file: current.file,
        category: current.category,
        matched: current.matched,
        baseline_count: baselineCount,
        current_count: current.count,
      });
    }
  }

  for (const [key, base] of baselineMap) {
    if (!currentCounts.has(key)) {
      resolved.push({
        file: base.file,
        category: base.category,
        matched: base.matched,
        baseline_count: base.count,
        current_count: 0,
      });
    }
  }

  const baselineTotal = baseline.entries.reduce((sum, e) => sum + e.count, 0);
  return {
    new_failures: newFailures,
    resolved: resolved.sort((a, b) => {
      if (a.file !== b.file) return a.file < b.file ? -1 : 1;
      if (a.category !== b.category) return a.category < b.category ? -1 : 1;
      return a.matched < b.matched ? -1 : a.matched > b.matched ? 1 : 0;
    }),
    ok: newFailures.length === 0,
    stats: {
      current_total: report.failures.length,
      baseline_total: baselineTotal,
      new_delta: newFailures.length,
      resolved_count: resolved.length,
    },
  };
}

if (require.main === module) {
const args = process.argv.slice(2);
// Strip `--flag value` pairs before computing positional args so that a
// profile value like "archive-installed" is not mistaken for a path.
const STRIP_VALUE_FLAGS = new Set(["--profile", "--save-baseline", "--delta", "--exemptions"]);
const positional: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (STRIP_VALUE_FLAGS.has(args[i]!)) {
    i++; // skip the value too
    continue;
  }
  if (args[i]!.startsWith("--")) continue;
  positional.push(args[i]!);
}
const repoRoot = positional[0] || process.cwd();
const json = args.includes("--json");

  // Profile maps to lib Projection (source/link/archive/archive-installed per
  // docs/specs/integrity/distribution-boundary.md "projection の分離"). Legacy
  // installed/release values are accepted as aliases for link/archive-installed
  // so existing invocations continue to work.
  let profile = "source";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--profile" && i + 1 < args.length) {
      profile = args[i + 1];
      i++;
    }
  }
  const projection = normalizeProfileToProjection(profile);
  if (projection === null) {
    process.stderr.write(
      `error: --profile must be source|link|archive|archive-installed (or legacy installed|release) (got '${profile}')\n`,
    );
    process.exit(2);
  }

  const saveBaselineIdx = args.indexOf("--save-baseline");
  const deltaBaselineIdx = args.indexOf("--delta");
  const exemptionsIdx = args.indexOf("--exemptions");
  const baselinePath = saveBaselineIdx >= 0 ? args[saveBaselineIdx + 1] : deltaBaselineIdx >= 0 ? args[deltaBaselineIdx + 1] : null;
  const exemptionsPath = exemptionsIdx >= 0 ? args[exemptionsIdx + 1] : null;

  const rawReport = checkDistributionBoundary(repoRoot, projection);

  const exemptions = exemptionsPath ? loadExemptions(exemptionsPath) : null;
  const exemptionResult = applyExemptions(rawReport.failures, exemptions, repoRoot);
  const report: BoundaryReport = {
    ok: exemptionResult.remaining.length === 0,
    failures: exemptionResult.remaining,
    stats: {
      scanned_files: rawReport.stats.scanned_files,
      concrete_id_hits: countCategory(exemptionResult.remaining, "concrete-id"),
      concrete_path_hits: countCategory(exemptionResult.remaining, "concrete-path"),
      fixed_url_hits: countCategory(exemptionResult.remaining, "fixed-url"),
    },
  };

  if (saveBaselineIdx >= 0 && baselinePath) {
    const baseline = buildBaseline(
      rawReport,
      repoRoot,
      "IR-059 distribution reference boundary known-violations baseline",
    );
    saveBaseline(baseline, baselinePath);
    if (json) {
      process.stdout.write(JSON.stringify({ saved: baselinePath, entries: baseline.entries.length }, null, 2) + "\n");
    } else {
      process.stdout.write(`baseline saved: ${baselinePath}\n`);
      process.stdout.write(`entries: ${baseline.entries.length}\n`);
    }
    process.exit(0);
  }

  if (deltaBaselineIdx >= 0 && baselinePath) {
    const baseline = loadBaseline(baselinePath);
    if (baseline === null) {
      process.stderr.write(`error: cannot load baseline at ${baselinePath}\n`);
      process.exit(2);
    }
    const delta = computeDelta(report, baseline, repoRoot);
    if (json) {
      const payload = {
        ...delta,
        exempted_count: exemptionResult.exempted.length,
      };
      process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
    } else {
      process.stdout.write(`check_distribution_boundary.ts - delta guard\n`);
      process.stdout.write(`=============================================================\n`);
      process.stdout.write(`profile: ${profile}\n`);
      process.stdout.write(`repoRoot: ${repoRoot}\n`);
      process.stdout.write(`baseline: ${baselinePath}\n`);
      if (exemptionsPath) {
        process.stdout.write(`exemptions: ${exemptionsPath} (${exemptionResult.exempted.length} exempted)\n`);
      }
      process.stdout.write(`ok: ${delta.ok}\n`);
      process.stdout.write(`stats: ${JSON.stringify(delta.stats, null, 2)}\n`);
      process.stdout.write(`new failures (${delta.new_failures.length}):\n`);
      for (const f of delta.new_failures) {
        process.stdout.write(
          `  [${f.category}] ${f.file}:${f.line} matched=${f.matched}\n    snippet: ${f.snippet}\n`,
        );
      }
      if (delta.resolved.length > 0) {
        process.stdout.write(`resolved (${delta.resolved.length}):\n`);
        for (const r of delta.resolved) {
          process.stdout.write(`  [${r.category}] ${r.file} matched=${r.matched} (${r.baseline_count} -> ${r.current_count})\n`);
        }
      }
    }
    process.exit(delta.ok ? 0 : 1);
  }

  // IR-046/047/048 観点を正規実行経路へ統合（AC-04/05: detector 到達可能性）
  const rulesResult = checkDistributionRules(repoRoot);
  const combinedOk = report.ok && rulesResult.ok;

  if (json) {
    const payload = { ...report, rules: rulesResult };
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    process.stdout.write(`check_distribution_boundary.ts - distribution reference boundary\n`);
    process.stdout.write(`=============================================================\n`);
    process.stdout.write(`profile: ${profile}\n`);
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.category}] ${f.file}:${f.line} matched=${f.matched}\n    snippet: ${f.snippet}\n`,
      );
    }
    process.stdout.write(`\nrules findings (IR-046/047/048, scanned=${rulesResult.stats.scanned_files}):\n`);
    for (const f of rulesResult.findings) {
      process.stdout.write(
        `  [${f.rule}] ${f.file}:${f.line} matched=${f.matched}\n    ${f.description}\n`,
      );
    }
  }
  process.exit(combinedOk ? 0 : 1);
}

function countCategory(failures: BoundaryFailure[], cat: BoundaryFailure["category"]): number {
  return failures.filter((f) => f.category === cat).length;
}

// ---- IR-046/047/048 観点集約（Phase 3 §6.3 / Phase 6 委譲事項） ----
// declarative data は data/distribution-targets.yaml（Wave 6 作成）。
// 自己ホスト環境で検出可能な観点を最小限実装し、consumer 環境固有の検出は
// 別途 install-consumer-opencode.ps1 実行後の検証で担う。

export interface DistributionRuleFinding {
  rule: "ir046" | "ir047" | "ir048";
  file: string;
  line: number;
  matched: string;
  description: string;
}

export function checkDistributionRules(repoRoot: string): {
  ok: boolean;
  findings: DistributionRuleFinding[];
  stats: { ir046_hits: number; ir047_hits: number; ir048_hits: number; scanned_files: number };
} {
  const IR046_MARKERS = [
    "AgentDevFlow プラグインの設定を管理するリポジトリ",
  ];
  const IR047_ALLOWED = ["agentdev-gh-cli"];
  const IR048_PREFIX = "generated_by:";
  const findings: DistributionRuleFinding[] = [];
  const stats = { ir046_hits: 0, ir047_hits: 0, ir048_hits: 0, scanned_files: 0 };

  // IR-046: src/opencode/ 配下の markdown に self-hosting-only marker が含まれないこと。
  // これらの marker は README.md 等の自己ホスト向けファイルでは正当だが、配布物
  // （src/opencode/）には混入しない。
  const publicCmd = path.join(repoRoot, "src", "opencode", "commands", "agentdev");
  const publicSkills = path.join(repoRoot, "src", "opencode", "skills");
  const publicTargets: string[] = [
    ...listMarkdownFiles(publicCmd, true),
  ];
  if (dirExists(publicSkills)) {
    for (const ent of fs.readdirSync(publicSkills, { withFileTypes: true }) as any[]) {
      if (ent.isDirectory() && ent.name.startsWith("agentdev-")) {
        publicTargets.push(...listMarkdownFiles(path.join(publicSkills, ent.name), true));
      }
    }
  }
  stats.scanned_files += publicTargets.length;
  for (const file of publicTargets) {
    const text = readText(file);
    if (text === null) continue;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      for (const marker of IR046_MARKERS) {
        if (lines[i].includes(marker)) {
          stats.ir046_hits += 1;
          findings.push({
            rule: "ir046",
            file,
            line: i + 1,
            matched: marker,
            description: "self-hosting-only marker detected in distributed content",
          });
        }
      }
    }
  }

  // IR-047: src/opencode-local/ 配下のサブディレクトリは allowed set のみ。
  const localRoot = path.join(repoRoot, "src", "opencode-local");
  if (dirExists(localRoot)) {
    const subs = (fs.readdirSync(localRoot, { withFileTypes: true }) as any[])
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    for (const sub of subs) {
      if (!IR047_ALLOWED.includes(sub)) {
        stats.ir047_hits += 1;
        findings.push({
          rule: "ir047",
          file: path.join(localRoot, sub).replace(/\\/g, "/"),
          line: 0,
          matched: sub,
          description: `src/opencode-local/ subdir not in allowed set ${JSON.stringify(IR047_ALLOWED)}`,
        });
      }
    }
  }

  // IR-048: src/opencode-local/agentdev-gh-cli/ の hand-maintained files が
  // generated_by marker を誤って主張していないこと。local mode では
  // agentdev-gh-cli は link 対象であり、機械生成物ではない。
  const localGhCli = path.join(repoRoot, "src", "opencode-local", "agentdev-gh-cli");
  if (dirExists(localGhCli)) {
    const files = listMarkdownFiles(localGhCli, true);
    stats.scanned_files += files.length;
    for (const file of files) {
      const text = readText(file);
      if (text === null) continue;
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(IR048_PREFIX)) {
          stats.ir048_hits += 1;
          findings.push({
            rule: "ir048",
            file,
            line: i + 1,
            matched: IR048_PREFIX,
            description: "local-mode link target must not declare generated_by marker",
          });
        }
      }
    }
  }

  return { ok: findings.length === 0, findings, stats };
}
