/**
 * check_test_impact.ts — Test impact detection gate (REQ-019).
 *
 * リファクタリング PR で SPEC 変更に連動する周辺テストの陳腐化を検出する。
 * 変更 SPEC ファイルを抽出し、当該 SPEC を参照するテストファイルのうち
 * 同一 PR で未変更のものを「陳腐化候補」として報告する。
 *
 * 処理層 (5層):
 *   1. changed file resolver    — --files / --base-ref から変更ファイルを特定
 *   2. spec change classifier   — 変更ファイルを SPEC/REQ/ADR 変更へ分類
 *   3. test file discovery       — test-glob で走査対象テストファイルを発見
 *   4. reference scanner         — 各テストファイルから SPEC 参照を抽出
 *   5. staleness evaluator       — 参照テストが同一 PR で変更されたか評価
 *
 * CLI 詳細は docs/specs/integrity/test-impact-detection-gate.md「チェッカー実装契約」節参照。
 */

import {
  EXIT_OK,
  EXIT_ERROR,
  findRepoRoot,
} from "./cli_utils.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "check_test_impact.ts";
const DESCRIPTION = "Test impact detection gate for SPEC changes (REQ-019)";
const USAGE =
  "bun run check_test_impact.ts [--base-ref <git-ref> | --files <path...>] [--test-glob <pattern>] [--json] [--root <path>]";
const DEFAULT_TEST_GLOB = "**/*.test.ts";

// SPEC 系ファイルのパス分類。docs/specs/**、docs/requirements/REQ-*、docs/adr/ADR-* を対象とする。
const SPEC_PATH_PATTERNS = [
  /^docs\/specs\/.*\.md$/,
  /^docs\/requirements\/REQ-.*\.md$/,
  /^docs\/adr\/ADR-.*\.md$/,
];

// 走査除外ディレクトリ（相対パス先頭一致）。ビルド成果物、外部依存、worktree、retired を除く。
const SCAN_EXCLUDE_DIRS = [
  "node_modules/",
  ".worktrees/",
  ".agentdev-plugin/",
  ".git/",
  "docs/requirements/retired/",
  "docs/adr/retired/",
];

// basename 照合の停止リスト。汎用名称は basename 単独では照合しない
// （full-path 照合は継続して有効）。REQ/ADR ID 照合にも影響しない。
const BASENAME_STOPLIST = new Set([
  "README.md",
  "_template.md",
  "CHANGELOG.md",
  "LICENSE",
  "package.json",
  "tsconfig.json",
]);

// REQ/ADR ID 抽出用正規表現。
const REQ_ID_PATTERN = /\b(REQ-\d{3})\b/g;
const ADR_ID_PATTERN = /\b(ADR-\d{3})\b/g;

type SpecLifecycle = "added" | "deleted" | "renamed" | "modified" | "unknown";
type ReferenceKind = "full-path" | "basename" | "req-id" | "adr-id";

interface TestImpactFinding {
  spec_path: string;
  spec_lifecycle: SpecLifecycle;
  test_path: string;
  reference_kind: ReferenceKind;
  reference_snippet: string;
  reference_line: number;
}

interface TestImpactReport {
  base_ref: string | null;
  files_declared: string[];
  spec_changes: string[];
  tests_scanned: number;
  stale_candidates: TestImpactFinding[];
  warnings: string[];
}

interface ParsedArgs {
  files: string[];
  baseRef: string | null;
  testGlob: string;
  json: boolean;
  help: boolean;
  root?: string;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    files: [],
    baseRef: null,
    testGlob: DEFAULT_TEST_GLOB,
    json: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
    } else if (a === "--json") {
      parsed.json = true;
    } else if (a === "--base-ref") {
      const v = args[i + 1];
      if (!v) throw new Error("--base-ref requires a value");
      parsed.baseRef = v;
      i++;
    } else if (a === "--files") {
      i++;
      while (i < args.length && !args[i].startsWith("--")) {
        for (const token of args[i].split(",")) {
          const trimmed = token.trim();
          if (trimmed.length > 0) parsed.files.push(trimmed);
        }
        i++;
      }
      i--;
    } else if (a === "--test-glob") {
      const v = args[i + 1];
      if (!v) throw new Error("--test-glob requires a value");
      parsed.testGlob = v;
      i++;
    } else if (a === "--root") {
      const v = args[i + 1];
      if (!v) throw new Error("--root requires a value");
      parsed.root = v;
      i++;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return parsed;
}

function printHelp(): void {
  console.error(`usage: ${USAGE}`);
  console.error("");
  console.error(`description: ${DESCRIPTION}`);
  console.error("");
  console.error("options:");
  console.error("  --base-ref <ref>     git base ref to compute changed files; for worktree env (pre-merge, case-run). mutually exclusive with --files");
  console.error("  --files <path...>    changed files (space-separated recommended; comma-separated also accepted); for main env (post-merge, case-close). mutually exclusive with --base-ref");
  console.error(`  --test-glob <pat>    test file glob (default: ${DEFAULT_TEST_GLOB})`);
  console.error("  --json               emit JSON report (default: text)");
  console.error("  --root <path>        explicit repository root (worktree/CI support)");
}

// ─── Layer 1: changed file resolver ────────────────────────────────────────

function resolveChangedFiles(
  root: string,
  files: string[],
  baseRef: string | null,
): string[] {
  if (files.length > 0) {
    return files
      .map((f) => (path.isAbsolute(f) ? f : path.resolve(root, f)))
      .filter((f) => fs.existsSync(f));
  }
  if (baseRef) {
    const { execSync } = require("child_process") as typeof import("child_process");
    try {
      const out = execSync(
        `git diff --name-only ${baseRef}...HEAD`,
        { cwd: root, encoding: "utf-8" },
      ) as string;
      return out
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((rel) => path.join(root, rel.replace(/\//g, path.sep)));
    } catch (e) {
      throw new Error(
        `git diff against --base-ref ${baseRef} failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
  return [];
}

// ─── Layer 2: spec change classifier ───────────────────────────────────────

function isSpecPath(relPath: string): boolean {
  return SPEC_PATH_PATTERNS.some((p) => p.test(relPath));
}

interface SpecChange {
  relPath: string;
  lifecycle: SpecLifecycle;
  basename: string;
  reqIds: string[]; // 変更 SPEC から抽出した REQ-NNN（REQ ファイル自身の ID 等）
  adrIds: string[]; // 変更 SPEC から抽出した ADR-NNN
}

function gitNameStatus(
  root: string,
  rel: string,
  baseRef: string | null,
): { status: "A" | "D" | "R" | "M" | null } {
  const { execSync } = require("child_process") as typeof import("child_process");
  try {
    const diffCmd = baseRef
      ? `git diff --name-status --diff-filter=ADRMCR ${baseRef}...HEAD -- "${rel}"`
      : `git diff --name-status --diff-filter=ADRMCR HEAD -- "${rel}"`;
    const out = execSync(diffCmd, { cwd: root, encoding: "utf-8" }) as string;
    const line = out.split("\n").find((l) => l.trim().length > 0);
    if (!line) return { status: null };
    const statusCode = line.split("\t")[0];
    if (statusCode.startsWith("R") || statusCode.startsWith("C")) return { status: "R" };
    if (statusCode === "A") return { status: "A" };
    if (statusCode === "D") return { status: "D" };
    if (statusCode === "M") return { status: "M" };
    return { status: null };
  } catch {
    return { status: null };
  }
}

function classifySpecChanges(
  root: string,
  changedFiles: string[],
  baseRef: string | null,
): SpecChange[] {
  const result: SpecChange[] = [];
  for (const absPath of changedFiles) {
    const rel = path.relative(root, absPath).replace(/\\/g, "/");
    if (!isSpecPath(rel)) continue;
    const status = gitNameStatus(root, rel, baseRef);
    let lifecycle: SpecLifecycle = "unknown";
    if (status.status === "A") lifecycle = "added";
    else if (status.status === "D") lifecycle = "deleted";
    else if (status.status === "R") lifecycle = "renamed";
    else if (status.status === "M") lifecycle = "modified";
    // 伝播対象 ID は「ファイル自身の ID」のみ。
    // REQ/ADR ファイル名由来の ID のみを採用し、SPEC 本文の ADR/REQ 言及は伝播させない
    // （SPEC が ADR-001 を言及しても ADR-001 変更ではなく、過検出になるため）。
    const reqIds: string[] = [];
    const adrIds: string[] = [];
    const reqFileMatch = rel.match(/REQ-(\d{3})/);
    if (reqFileMatch) reqIds.push(`REQ-${reqFileMatch[1]}`);
    const adrFileMatch = rel.match(/ADR-(\d{3})/);
    if (adrFileMatch) adrIds.push(`ADR-${adrFileMatch[1]}`);
    result.push({
      relPath: rel,
      lifecycle,
      basename: path.basename(rel),
      reqIds,
      adrIds,
    });
  }
  return result;
}

// ─── Layer 3: test file discovery ───────────────────────────────────────────

function shouldExclude(relPath: string): boolean {
  return SCAN_EXCLUDE_DIRS.some((d) => relPath.startsWith(d));
}

function globMatch(pattern: string, relPath: string): boolean {
  // 最小限の glob 実装。**/*.test.ts 等の一般的なパターンをサポート。
  // ** → 任意ディレクトリ階層、* → 単一階層の任意文字列。
  const regexStr = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "::DBLSTAR::")
    .replace(/\*/g, "[^/]*")
    .replace(/::DBLSTAR::/g, ".*");
  return new RegExp(`^${regexStr}$`).test(relPath);
}

function discoverTestFiles(root: string, testGlob: string): string[] {
  const results: string[] = [];
  function walk(dir: string): void {
    let entries: ReturnType<typeof fs.readdirSync>;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      const rel = path.relative(root, abs).replace(/\\/g, "/");
      if (ent.isDirectory()) {
        if (shouldExclude(rel + "/")) continue;
        walk(abs);
      } else if (ent.isFile()) {
        if (shouldExclude(rel)) continue;
        if (globMatch(testGlob, rel)) results.push(abs);
      }
    }
  }
  walk(root);
  return results.sort();
}

// ─── Layer 4: reference scanner ─────────────────────────────────────────────

interface ReferenceHit {
  spec_rel_path: string;
  test_path: string;
  reference_kind: ReferenceKind;
  reference_snippet: string;
  reference_line: number;
}

function findReferencesInTest(
  root: string,
  testAbsPath: string,
  specChanges: SpecChange[],
): ReferenceHit[] {
  let content: string;
  try {
    content = fs.readFileSync(testAbsPath, "utf-8") as string;
  } catch {
    return [];
  }
  const testRel = path.relative(root, testAbsPath).replace(/\\/g, "/");
  const lines = content.split("\n");
  const hits: ReferenceHit[] = [];
  const seen = new Set<string>(); // (spec_path, kind, line) 重複抑止

  const fullPathSet = new Map<string, SpecChange>();
  const basenameSet = new Map<string, SpecChange[]>();
  const reqIdSet = new Map<string, SpecChange[]>();
  const adrIdSet = new Map<string, SpecChange[]>();
  for (const sc of specChanges) {
    fullPathSet.set(sc.relPath, sc);
    const arr1 = basenameSet.get(sc.basename) ?? [];
    arr1.push(sc);
    basenameSet.set(sc.basename, arr1);
    for (const id of sc.reqIds) {
      const arr = reqIdSet.get(id) ?? [];
      arr.push(sc);
      reqIdSet.set(id, arr);
    }
    for (const id of sc.adrIds) {
      const arr = adrIdSet.get(id) ?? [];
      arr.push(sc);
      adrIdSet.set(id, arr);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    // 1. SPEC 相対パス（full-path）参照
    for (const [specPath, sc] of fullPathSet) {
      if (line.includes(specPath)) {
        const key = `${sc.relPath}|full-path|${lineNumber}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push({
            spec_rel_path: sc.relPath,
            test_path: testRel,
            reference_kind: "full-path",
            reference_snippet: truncate(line.trim(), 120),
            reference_line: lineNumber,
          });
        }
      }
    }
    // 2. SPEC basename 参照（汎用名称は stoplist で除外、full-path は別途照合）
    for (const [basename, scs] of basenameSet) {
      if (BASENAME_STOPLIST.has(basename)) continue;
      if (line.includes(basename)) {
        for (const sc of scs) {
          const key = `${sc.relPath}|basename|${lineNumber}`;
          if (!seen.has(key)) {
            seen.add(key);
            hits.push({
              spec_rel_path: sc.relPath,
              test_path: testRel,
              reference_kind: "basename",
              reference_snippet: truncate(line.trim(), 120),
              reference_line: lineNumber,
            });
          }
        }
      }
    }
    // 3. REQ ID 参照
    let m: RegExpExecArray | null;
    const reqRe = new RegExp(REQ_ID_PATTERN);
    while ((m = reqRe.exec(line)) !== null) {
      const scs = reqIdSet.get(m[1]);
      if (scs) {
        for (const sc of scs) {
          const key = `${sc.relPath}|req-id|${lineNumber}|${m[1]}`;
          if (!seen.has(key)) {
            seen.add(key);
            hits.push({
              spec_rel_path: sc.relPath,
              test_path: testRel,
              reference_kind: "req-id",
              reference_snippet: truncate(line.trim(), 120),
              reference_line: lineNumber,
            });
          }
        }
      }
    }
    // 4. ADR ID 参照
    const adrRe = new RegExp(ADR_ID_PATTERN);
    while ((m = adrRe.exec(line)) !== null) {
      const scs = adrIdSet.get(m[1]);
      if (scs) {
        for (const sc of scs) {
          const key = `${sc.relPath}|adr-id|${lineNumber}|${m[1]}`;
          if (!seen.has(key)) {
            seen.add(key);
            hits.push({
              spec_rel_path: sc.relPath,
              test_path: testRel,
              reference_kind: "adr-id",
              reference_snippet: truncate(line.trim(), 120),
              reference_line: lineNumber,
            });
          }
        }
      }
    }
  }
  return hits;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

// ─── Layer 5: staleness evaluator ───────────────────────────────────────────

function evaluateStaleness(
  root: string,
  specChanges: SpecChange[],
  testFiles: string[],
  changedRelFiles: Set<string>,
): { findings: TestImpactFinding[]; warnings: string[] } {
  const findings: TestImpactFinding[] = [];
  const warnings: string[] = [];
  let totalReferenceHits = 0;
  const lifecycleByPath = new Map<string, SpecLifecycle>();
  for (const sc of specChanges) lifecycleByPath.set(sc.relPath, sc.lifecycle);
  for (const testAbs of testFiles) {
    const hits = findReferencesInTest(root, testAbs, specChanges);
    totalReferenceHits += hits.length;
    const testRel = path.relative(root, testAbs).replace(/\\/g, "/");
    // 同一 PR で変更済みのテストは陳腐化候補から除外
    if (changedRelFiles.has(testRel)) continue;
    for (const hit of hits) {
      findings.push({
        spec_path: hit.spec_rel_path,
        spec_lifecycle: lifecycleByPath.get(hit.spec_rel_path) ?? "unknown",
        test_path: hit.test_path,
        reference_kind: hit.reference_kind,
        reference_snippet: hit.reference_snippet,
        reference_line: hit.reference_line,
      });
    }
  }
  // silent pass 回避: SPEC 変更あり、かつ参照ヒット 0 件の場合は警告
  if (specChanges.length > 0 && totalReferenceHits === 0 && testFiles.length > 0) {
    warnings.push(
      `SPEC 変更 ${specChanges.length} 件を検出したが、走査したテストファイルから参照を検出できなかった。test-glob の設定、参照形式、除外ディレクトリを確認すること。`,
    );
  }
  return { findings, warnings };
}

// ─── Reporter ───────────────────────────────────────────────────────────────

function emitJson(report: TestImpactReport): void {
  console.log(JSON.stringify(report, null, 2));
}

function emitText(report: TestImpactReport): void {
  console.log(`Test Impact Detection Gate — REQ-019`);
  console.log(`base_ref: ${report.base_ref ?? "(none)"}`);
  console.log(`files_declared: ${report.files_declared.length}`);
  console.log(`spec_changes: ${report.spec_changes.length}`);
  for (const s of report.spec_changes) console.log(`  ${s}`);
  console.log(`tests_scanned: ${report.tests_scanned}`);
  console.log(`stale_candidates: ${report.stale_candidates.length}`);
  for (const f of report.stale_candidates) {
    console.log(
      `  [${f.reference_kind}] ${f.test_path}:${f.reference_line} -> ${f.spec_path} (${f.spec_lifecycle})`,
    );
    console.log(`    ${f.reference_snippet}`);
  }
  console.log(`warnings: ${report.warnings.length}`);
  for (const w of report.warnings) console.log(`  ${w}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(args);
  } catch (e) {
    console.error(`[test_impact] ${e instanceof Error ? e.message : String(e)}`);
    process.exit(EXIT_ERROR);
  }

  if (parsed.help) {
    printHelp();
    process.exit(EXIT_OK);
  }

  if (parsed.files.length === 0 && !parsed.baseRef) {
    console.error("[test_impact] either --files or --base-ref is required");
    printHelp();
    process.exit(EXIT_ERROR);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: parsed.root });

  const changedFiles = resolveChangedFiles(root, parsed.files, parsed.baseRef);
  const changedRelSet = new Set(
    changedFiles.map((f) => path.relative(root, f).replace(/\\/g, "/")),
  );

  const specChanges = classifySpecChanges(root, changedFiles, parsed.baseRef);
  const testFiles = discoverTestFiles(root, parsed.testGlob);

  const { findings, warnings } = evaluateStaleness(
    root,
    specChanges,
    testFiles,
    changedRelSet,
  );

  const report: TestImpactReport = {
    base_ref: parsed.baseRef,
    files_declared: parsed.files,
    spec_changes: specChanges.map((s) => s.relPath),
    tests_scanned: testFiles.length,
    stale_candidates: findings,
    warnings,
  };

  if (parsed.json) {
    emitJson(report);
  } else {
    emitText(report);
  }

  process.exit(EXIT_OK);
}

if (import.meta.main) {
  main();
}
