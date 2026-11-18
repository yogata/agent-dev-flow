// targeted-gate.test.ts — targeted docs guard（engine 明示対象経路）の回帰テスト。
//
// 対象契約: docs/designs/integrity/targeted-docs-guard-implementation.md
// （false-clean 予防、files_checked 空時の警告、full_docs_check_recommended 条件）、
// docs/designs/integrity/integrity-contracts.md「TargetedDocsReport 型契約」節、
// REQ-010-076（files_checked 空 = 検証モード問わず FAILURE）、
// REQ-031-025/026（worktree --root 指定・untracked を含む --files 標準モード）、
// REQ-032-023（変更ファイルと files_checked の不一致を検査見逃しとして扱う）、
// REQ-029-015（実装体欠落時の fail-closed と代替経路案内）。
//
// Issue #4154 Wave-2（Oracle 結論）の移行回帰:
// untracked-only / staged+unstaged mix / post-merge PR list /
// empty・mismatch・failed-enumeration / update flags / implementation absence。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { globToRegExp, parseParsedFile } from "../../engine/context.ts";
import type { IntegrityContext, IntegrityRule, ParsedFile } from "../../engine/types.ts";
import {
  TARGETED_WORKFLOWS,
  TargetedGateError,
  formatTargetedDocsTextReport,
  profileFor,
  runTargetedDocsGate,
} from "../../engine/targeted-gate.ts";
import type { TargetedGateDeps } from "../../engine/targeted-gate.ts";
import {
  buildKnownGateArgContracts,
  buildKnownWorkflowIntegrityGateSpec,
  evaluateGateAvailability,
  preValidateGateSpecWithContracts,
} from "../../../agentdev-artifact-validation/scripts/lib/gate-execution.ts";

const REPO_ROOT = "/repo";

interface DepsSpec {
  existing: ReadonlySet<string>;
  raw: Map<string, string>;
  git: (args: readonly string[]) => string;
}

function fakeDeps(spec: DepsSpec): TargetedGateDeps {
  return {
    pathExists(relPath: string): boolean {
      return spec.existing.has(relPath);
    },
    readRaw(relPath: string): string | null {
      return spec.raw.get(relPath) ?? null;
    },
    runGit(args: readonly string[]): string {
      return spec.git(args);
    },
  };
}

function gitNever(args: readonly string[]): string {
  throw new Error(`git not available: ${args.join(" ")}`);
}

function fakeContext(files: readonly ParsedFile[]): IntegrityContext {
  return {
    repoRoot: REPO_ROOT,
    files,
    readFile: (p) => files.find((f) => f.path === p) ?? null,
    pathExists: (p) => files.some((f) => f.path === p),
    readRaw: () => null,
    getFilesByGlob: (pattern) => files.filter((f) => globToRegExp(pattern).test(f.path)),
    listDir: () => [],
    changedFiles: files.map((f) => f.path),
  };
}

/** 常に固定違反を返すテスト用ルール（ctx 非依存）。 */
function fixedViolationRule(
  id: string,
  violations: { filePath: string; severity: "error" | "warning"; line?: number }[],
): IntegrityRule {
  return {
    id,
    slug: id.toLowerCase(),
    title: id,
    description: `test rule ${id}`,
    relatedReqs: [],
    targetGlobs: ["docs/**/*.md"],
    globalScan: false,
    severity: "strict",
    check: () =>
      violations.map((v) => ({
        ruleId: id,
        severity: v.severity,
        filePath: v.filePath,
        line: v.line,
        message: `${id} violation`,
        remediationHint: "fix it",
      })),
  };
}

const DESIGN_DOC = `---
title: テスト Design
status: draft
---
# 本文
`;

function parsed(rel: string, content: string): ParsedFile {
  return parseParsedFile(rel, content);
}

describe("対象解決と files_checked の実検査証拠", () => {
  test("untracked-only: --files の未追跡ファイルが files_checked に含まれ追加 lifecycle 判定される", async () => {
    const untracked = "docs/designs/integrity/new-rule-design.md";
    const deps = fakeDeps({
      existing: new Set([untracked, "docs/designs/README.md", "docs/DOC-MAP.md", "docs/README.md"]),
      raw: new Map([
        [untracked, DESIGN_DOC],
        ["docs/DOC-MAP.md", "# DOC-MAP\n既存の記載のみ\n"],
      ]),
      git: (args) => {
        const joined = args.join(" ");
        if (joined === "diff --name-status --diff-filter=ADRMCR HEAD -- " + untracked) return "";
        if (joined === "status --porcelain -- " + untracked) return `?? ${untracked}`;
        throw new Error(`unexpected git call: ${joined}`);
      },
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-run",
        files: [untracked],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([parsed(untracked, DESIGN_DOC)]),
    );
    expect(outcome.report.files_checked).toEqual([untracked]);
    expect(outcome.report.coupled_files_checked).toEqual([
      "docs/DOC-MAP.md",
      "docs/README.md",
      "docs/designs/README.md",
    ]);
    // lifecycle added（untracked）は索引影響とみなす（Design 追加）
    expect(outcome.report.spec_readme_update_required).toBe(true);
    expect(outcome.report.doc_map_update_required).toBe(true);
    expect(outcome.report.extensions_check_required).toBe(true);
    expect(outcome.exitCode).toBe(0);
  });

  test("staged+unstaged mix: 両方の変更が lifecycle 判定され frontmatter 差分で README 更新フラグが立つ", async () => {
    const staged = "docs/requirements/REQ-900.md";
    const unstaged = "docs/requirements/REQ-901.md";
    const deps = fakeDeps({
      existing: new Set([
        staged,
        unstaged,
        "docs/requirements/README.md",
        "docs/DOC-MAP.md",
        "docs/README.md",
        "AGENTS.md",
      ]),
      raw: new Map([
        [staged, "---\nid: REQ-900\nupdated: \"2026-11-18\"\n---\n# 新タイトル\n"],
        [unstaged, "---\nid: REQ-901\nupdated: \"2026-11-18\"\n---\n# 新タイトル\n"],
      ]),
      git: (args) => {
        const joined = args.join(" ");
        if (joined === "diff --name-status --diff-filter=ADRMCR HEAD -- " + staged) {
          return `M\t${staged}`;
        }
        if (joined === "diff --name-status --diff-filter=ADRMCR HEAD -- " + unstaged) {
          return "";
        }
        if (joined === "status --porcelain -- " + unstaged) return ` M ${unstaged}`;
        if (joined === "status --porcelain -- " + staged) return "";
        if (joined === "show HEAD:" + staged) {
          return "---\nid: REQ-900\nupdated: \"2026-11-17\"\n---\n# 旧タイトル\n";
        }
        if (joined === "show HEAD:" + unstaged) {
          return "---\nid: REQ-901\nupdated: \"2026-11-17\"\n---\n# 旧タイトル\n";
        }
        throw new Error(`unexpected git call: ${joined}`);
      },
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "req-save",
        files: [staged, unstaged],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    // updated（索引対象外キー）だけの変更では README 更新要否は立たない
    expect(outcome.report.requirements_readme_update_required).toBe(false);
    expect(outcome.report.files_checked).toEqual([staged, unstaged]);
    expect(outcome.exitCode).toBe(0);
  });

  test("post-merge PR list: case-close の --files 指定で全ファイルが検査対象になり declared 差異が検出される", async () => {
    const merged = ["docs/designs/commands/case-run.md", "src/common/skills/agentdev-workflow-case-run/SKILL.md"];
    const deps = fakeDeps({
      existing: new Set([...merged, "docs/DOC-MAP.md", "docs/README.md", "docs/designs/README.md"]),
      raw: new Map(),
      git: () => "",
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-close",
        files: merged,
        baseRef: null,
        declaredFiles: ["docs/designs/commands/case-run.md", "docs/requirements/REQ-032.md"],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.files_checked).toEqual(merged);
    expect(outcome.report.unchecked_reasons).toEqual([]);
    // 宣言済みだが実変更にないファイル = missing、実変更だが宣言にない = extra
    expect(outcome.report.declared_files_check).not.toBeNull();
    expect(outcome.report.declared_files_check!.missing).toEqual(["docs/requirements/REQ-032.md"]);
    expect(outcome.report.declared_files_check!.extra).toEqual([
      "src/common/skills/agentdev-workflow-case-run/SKILL.md",
    ]);
    expect(outcome.exitCode).toBe(0);
  });
});

describe("false-clean 予防（REQ-010-076・REQ-032-023）", () => {
  test("存在しない --files 指定は not-found となり files_checked 空で strict FAILURE", async () => {
    const deps = fakeDeps({ existing: new Set(), raw: new Map(), git: () => "" });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-run",
        files: ["docs/missing.md"],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.files_checked).toEqual([]);
    expect(outcome.report.unchecked_reasons).toEqual([{ path: "docs/missing.md", reason: "not-found" }]);
    const targetEmpty = outcome.report.failures.find((f) => f.rule_id === "TARGET-EMPTY");
    expect(targetEmpty).toBeDefined();
    expect(targetEmpty!.severity).toBe("strict");
    expect(outcome.report.warnings.length).toBe(1);
    expect(outcome.exitCode).toBe(1);
  });

  test("profile 対象外の --files 指定は out-of-profile となり files_checked 空で FAILURE", async () => {
    const deps = fakeDeps({ existing: new Set(["package.json"]), raw: new Map(), git: () => "" });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-run",
        files: ["package.json"],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.files_checked).toEqual([]);
    expect(outcome.report.unchecked_reasons).toEqual([{ path: "package.json", reason: "out-of-profile" }]);
    expect(outcome.report.failures.some((f) => f.rule_id === "TARGET-EMPTY" && f.severity === "strict")).toBe(true);
    expect(outcome.exitCode).toBe(1);
  });

  test("--base-ref の git 列挙失敗は空成功ではなく TargetedGateError（exit 2 相当）", async () => {
    const deps = fakeDeps({ existing: new Set(), raw: new Map(), git: gitNever });
    expect(
      runTargetedDocsGate(
        {
          repoRoot: REPO_ROOT,
          workflow: "case-close",
          files: [],
          baseRef: "origin/main",
          declaredFiles: [],
          failLevel: "strict",
        },
        deps,
        [],
        () => fakeContext([]),
      ),
    ).rejects.toBeInstanceOf(TargetedGateError);
  });

  test("--files と --base-ref の両方未指定は TargetedGateError", async () => {
    const deps = fakeDeps({ existing: new Set(), raw: new Map(), git: () => "" });
    expect(
      runTargetedDocsGate(
        {
          repoRoot: REPO_ROOT,
          workflow: "case-run",
          files: [],
          baseRef: null,
          declaredFiles: [],
          failLevel: "strict",
        },
        deps,
        [],
        () => fakeContext([]),
      ),
    ).rejects.toBeInstanceOf(TargetedGateError);
  });

  test("--base-ref の空 diff も（モード問わず）files_checked 空 FAILURE となる", async () => {
    const deps = fakeDeps({
      existing: new Set(),
      raw: new Map(),
      git: (args) => {
        expect(args).toEqual(["diff", "--name-only", "origin/main...HEAD"]);
        return "";
      },
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-close",
        files: [],
        baseRef: "origin/main",
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.files_checked).toEqual([]);
    expect(outcome.report.failures.some((f) => f.rule_id === "TARGET-EMPTY")).toBe(true);
    expect(outcome.exitCode).toBe(1);
  });
});

describe("残存ルール再利用と違反の対象フィルタ", () => {
  test("対象外ファイルの違行は報告されず、対象ファイルの違反のみ strict/warning 写像で報告される", async () => {
    const target = "docs/designs/integrity/x.md";
    const rule = fixedViolationRule("IR-TEST", [
      { filePath: target, severity: "error", line: 3 },
      { filePath: "docs/designs/other-out-of-target.md", severity: "error", line: 1 },
      { filePath: "docs/DOC-MAP.md", severity: "warning", line: 2 },
    ]);
    const deps = fakeDeps({
      existing: new Set([target, "docs/DOC-MAP.md", "docs/README.md", "docs/designs/README.md"]),
      raw: new Map([[target, DESIGN_DOC]]),
      git: () => "",
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-run",
        files: [target],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [rule],
      () => fakeContext([parsed(target, DESIGN_DOC)]),
    );
    // files_checked + coupled_files_checked に含まれる違反のみ（連動対象の warning は保持）
    expect(outcome.report.failures).toEqual([
      { rule_id: "IR-TEST", severity: "strict", file: target, line: 3, message: "IR-TEST violation", expected: "fix it" },
      { rule_id: "IR-TEST", severity: "warning", file: "docs/DOC-MAP.md", line: 2, message: "IR-TEST violation", expected: "fix it" },
    ]);
    // warning のみの failLevel=warning 指定時は失敗扱い、既定 strict では対象外
    expect(outcome.exitCode).toBe(1);
  });
});

describe("更新要否フラグ（行レベル意味差分）", () => {
  const coupledForDesign = new Set([
    "docs/designs/README.md",
    "docs/DOC-MAP.md",
    "docs/README.md",
  ]);

  test("Design status 変更（frontmatter 差分）で spec_readme_update_required が立つ", async () => {
    const design = "docs/designs/integrity/sample.md";
    const deps = fakeDeps({
      existing: new Set([...coupledForDesign, design]),
      raw: new Map([[design, DESIGN_DOC]]),
      git: (args) => {
        const joined = args.join(" ");
        if (joined === "diff --name-status --diff-filter=ADRMCR HEAD -- " + design) return `M\t${design}`;
        if (joined === "show HEAD:" + design) {
          return "---\ntitle: テスト Design\nstatus: accepted\n---\n# 本文\n";
        }
        throw new Error(`unexpected git call: ${joined}`);
      },
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "design-save",
        files: [design],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.spec_readme_update_required).toBe(true);
  });

  test("references/ 配下の Design ファイルは spec_readme_update_required の対象外", async () => {
    const reference = "docs/designs/integrity/references/detail.md";
    const deps = fakeDeps({
      existing: new Set([...coupledForDesign, reference]),
      raw: new Map([[reference, DESIGN_DOC]]),
      git: (args) => {
        const joined = args.join(" ");
        if (joined === "status --porcelain -- " + reference) return `?? ${reference}`;
        return "";
      },
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-run",
        files: [reference],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.spec_readme_update_required).toBe(false);
    expect(outcome.report.extensions_check_required).toBe(false);
  });

  test("REQ 新規追加で requirements_readme_update_required が立つ", async () => {
    const req = "docs/requirements/REQ-950.md";
    const deps = fakeDeps({
      existing: new Set([req, "docs/requirements/README.md", "docs/DOC-MAP.md", "docs/README.md", "AGENTS.md"]),
      raw: new Map([[req, "---\nid: REQ-950\n---\n# 本文\n"]]),
      git: (args) => {
        const joined = args.join(" ");
        if (joined === "status --porcelain -- " + req) return `?? ${req}`;
        return "";
      },
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "req-save",
        files: [req],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.requirements_readme_update_required).toBe(true);
    expect(outcome.report.extensions_check_required).toBe(true);
  });

  test("case-close で integrity ルール群変更時に full_docs_check_recommended が立つ", async () => {
    const ruleDoc = "docs/designs/integrity/rules/IR-070-design-frontmatter-required-keys.md";
    const deps = fakeDeps({
      existing: new Set([ruleDoc, "docs/designs/README.md", "docs/DOC-MAP.md", "docs/README.md"]),
      raw: new Map(),
      git: () => "",
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-close",
        files: [ruleDoc],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.full_docs_check_recommended).toBe(true);
    // case-close profile は requirements/docmap フラグを計算しない
    expect(outcome.report.requirements_readme_update_required).toBe(false);
    expect(outcome.report.doc_map_update_required).toBe(false);
  });

  test("case-run は full_docs_check_recommended を持たない（case-close の責務）", async () => {
    const ruleDoc = "docs/designs/integrity/rules/IR-070-design-frontmatter-required-keys.md";
    const deps = fakeDeps({
      existing: new Set([ruleDoc, "docs/designs/README.md", "docs/DOC-MAP.md", "docs/README.md"]),
      raw: new Map(),
      git: () => "",
    });
    const outcome = await runTargetedDocsGate(
      {
        repoRoot: REPO_ROOT,
        workflow: "case-run",
        files: [ruleDoc],
        baseRef: null,
        declaredFiles: [],
        failLevel: "strict",
      },
      deps,
      [],
      () => fakeContext([]),
    );
    expect(outcome.report.full_docs_check_recommended).toBe(false);
  });
});

describe("REQ-029-015: 下位契約の gate 実行体欠落は fail-closed", () => {
  const SCRIPTS_DIR = path.resolve(import.meta.dir, "..");
  const CLI_PATH = path.join(SCRIPTS_DIR, "cli.ts");

  function newSubordinateGateSpec(cliPath: string) {
    return buildKnownWorkflowIntegrityGateSpec({
      command: "bun",
      scriptArgs: [cliPath],
      cwd: SCRIPTS_DIR,
      workflow: "case-run",
      allowedWorkflowValues: [...TARGETED_WORKFLOWS],
      root: REPO_ROOT,
    });
  }

  test("新しい下位契約（cli.ts --workflow case-run --root ...）の gate spec が固定生成・事前検証を通過する", () => {
    const spec = newSubordinateGateSpec(CLI_PATH);
    expect(spec.args).toEqual([CLI_PATH, "--workflow", "case-run", "--root", REPO_ROOT]);
    expect(() =>
      preValidateGateSpecWithContracts(spec, buildKnownGateArgContracts(/^REQ-\d+(?:-\d+)?$/)),
    ).not.toThrow();
  });

  test("実装体が不在の局面では可用性検査が missing を返す（代替経路案内対象）", () => {
    const spec = newSubordinateGateSpec(path.join(SCRIPTS_DIR, "does-not-exist.ts"));
    const availability = evaluateGateAvailability([spec], () => false);
    expect(availability.missing).toEqual([spec.name]);
    expect(availability.records[0]!.alternativeRoutes.length).toBeGreaterThan(0);
  });

  test("実装体が実在する局面では可用性検査を通過する", () => {
    const spec = newSubordinateGateSpec(CLI_PATH);
    const availability = evaluateGateAvailability([spec], (absolutePath) => fs.existsSync(absolutePath));
    expect(availability.missing).toEqual([]);
  });
});

describe("profile とテキスト出力", () => {
  test("case-run profile は docs/traceability/AGENTS.md/README.md を網羅する（REQ-010-077）", () => {
    const profile = profileFor("case-run");
    expect(profile.appliesTo("docs/knowledge/anything.md")).toBe(true);
    expect(profile.appliesTo("traceability/sidecar.yaml")).toBe(true);
    expect(profile.appliesTo("AGENTS.md")).toBe(true);
    expect(profile.appliesTo("README.md")).toBe(true);
    expect(profile.appliesTo("docs/DOC-MAP.md")).toBe(true);
    expect(profile.appliesTo("src/common/skills/x/SKILL.md")).toBe(false);
    expect(profile.appliesTo("package.json")).toBe(false);
  });

  test("docs-check profile は全ファイルを対象にする（代替検査指定）", () => {
    expect(profileFor("docs-check").appliesTo("src/common/skills/x/SKILL.md")).toBe(true);
  });

  test("text 出力は unchecked_reasons を含む機械検証可能な行を持つ", () => {
    const text = formatTargetedDocsTextReport({
      workflow: "case-run",
      files_checked: [],
      coupled_files_checked: [],
      unchecked_reasons: [{ path: "package.json", reason: "out-of-profile" }],
      failures: [],
      warnings: [],
      doc_map_update_required: false,
      spec_readme_update_required: false,
      requirements_readme_update_required: false,
      full_docs_check_recommended: false,
      extensions_check_required: false,
      declared_files_check: null,
    });
    expect(text).toContain("unchecked reasons: 1");
    expect(text).toContain("package.json (out-of-profile)");
    expect(text).toContain("spec_readme_update_required: false");
  });
});
