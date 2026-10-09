// ADF-COVERS(verification): REQ-110-005
// ADF-COVERS(verification): REQ-032-001
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  checkCompletionJudgmentPath,
  judgeLine,
  type CompletionJudgmentReport,
} from "./check_completion_judgment_path.ts";

function writeTree(root: string, files: Record<string, string>): void {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
  }
}

const SINGLE_POINT_FILES: Record<string, string> = {
  "src/common/skills/agentdev-workflow-case-close/SKILL.md":
    "# case-close\n完了条件チェックボックスを最終評価、更新する。\n",
  "src/common/skills/agentdev-quality-gates/SKILL.md": "# quality gates\n",
  "docs/designs/commands/case-close.md": "# case-close design\n",
};

const SCAN_ROOT_FILLER: Record<string, string> = {
  ".opencode/skills/repo-agentdev-integrity/scripts/placeholder.ts": "export const x = 1;\n",
  "scripts/self/placeholder.mjs": "export const y = 2;\n",
};

function makeFixtureRepo(extra: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cjp-fixture-"));
  writeTree(root, { ...SINGLE_POINT_FILES, ...SCAN_ROOT_FILLER, ...extra });
  return root;
}

describe("judgeLine (pure line classification)", () => {
  test("affirmative checkbox update outside ownership is a bypass", () => {
    const j = judgeLine("driver が完了条件チェックボックスを更新する");
    expect(j.classification).toBe("bypass");
    expect(j.klass).toBe("checkbox-finalize");
  });

  test("achievement treatment without negation is a bypass", () => {
    const j = judgeLine("実装済みの条件をすべて達成扱いにする");
    expect(j.classification).toBe("bypass");
  });

  test("affirmative verb with prohibition context is an exempted declaration", () => {
    const j = judgeLine("実行担当は完了条件チェックボックスを更新しない（評価するのは case-close である）");
    expect(j.classification).toBe("exempted");
    expect(j.exemption).toBe("negation");
  });

  test("negation-only state mention without an affirmative verb is not a trigger", () => {
    expect(judgeLine("case-run は完了条件チェックボックスを更新しない").classification).toBe("not-a-trigger");
  });

  test("single-writer ownership declaration is exempted", () => {
    const j = judgeLine("完了条件の達成状態の確定（`[ ]` → `[x]`）は case-close だけが行う");
    expect(j.classification).toBe("exempted");
    expect(j.exemption).toBe("ownership");
  });

  test("bare list-option checkbox bullet without completion vocabulary is not a trigger", () => {
    expect(judgeLine("- [x] NG").classification).toBe("not-a-trigger");
  });

  test("attribution to case-close duty is exempted", () => {
    const j = judgeLine("完了条件チェックボックスを更新するのは case-close の責務である");
    expect(j.classification).toBe("exempted");
    expect(j.exemption).toBe("ownership");
  });

  test("completion declaration outside case-close is a bypass", () => {
    const j = judgeLine("driver が完遂状態へ遷移する");
    expect(j.classification).toBe("bypass");
    expect(j.klass).toBe("completion-declaration");
  });

  test("final acceptance exercise outside case-close is a bypass", () => {
    const j = judgeLine("実装担当が最終受入判定を合格とする");
    expect(j.classification).toBe("bypass");
    expect(j.klass).toBe("final-acceptance-exercise");
  });

  test("bare wave-iteration 完遂 verb is not a trigger (DEC-057 decision 4)", () => {
    expect(judgeLine("stage 3 は Wave 反復制御を完遂する").classification).toBe("not-a-trigger");
  });

  test("condition TEXT edit (case-ready wording authority) is not a trigger", () => {
    expect(judgeLine("case-ready が合意変更を完了条件へ反映する").classification).toBe("not-a-trigger");
    expect(judgeLine("case-ready が合意変更内容を完了条件へ更新する").classification).toBe("not-a-trigger");
  });

  test("passive state description is not a trigger", () => {
    expect(judgeLine("完了条件チェックボックスは現行値として更新される").classification).toBe("not-a-trigger");
  });

  test("version tagging after judgment is not a completion declaration", () => {
    expect(judgeLine("完遂判定後に完成コミットを識別し、新しい版（タグ）を付与する").classification).toBe(
      "not-a-trigger",
    );
  });

  test("prohibition transfer with ならない is exempted", () => {
    const j = judgeLine("反例を Findings へ分類しただけでは元条件の達成扱いとならないことを明示する");
    expect(j.classification).toBe("exempted");
    expect(j.exemption).toBe("negation");
  });
});

describe("checkCompletionJudgmentPath (fixture repos)", () => {
  let root: string;
  let report: CompletionJudgmentReport;

  beforeAll(() => {
    root = makeFixtureRepo({
      ".opencode/skills/other/skill.md": "# other\ndriver が完了条件チェックボックスを更新する\n",
    });
    report = checkCompletionJudgmentPath(root);
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  test("bypass trigger outside the single path fails (fail-closed)", () => {
    expect(report.ok).toBe(false);
    const bypass = report.failures.filter((f) => f.check === "bypass-trigger");
    expect(bypass.length).toBe(1);
    expect(bypass[0]?.file).toBe(".opencode/skills/other/skill.md");
    expect(bypass[0]?.line).toBe(2);
  });

  test("enumerated counts reconcile (列挙件数突合)", () => {
    const s = report.stats;
    expect(s.trigger_points_enumerated).toBe(s.single_path + s.exempted + s.bypass);
    expect(report.trigger_points.length).toBe(s.trigger_points_enumerated);
  });

  test("single-path file trigger points are enumerated as single-path", () => {
    const single = report.trigger_points.filter((t) => t.classification === "single-path");
    expect(single.length).toBeGreaterThanOrEqual(1);
    expect(single[0]?.file).toContain("/agentdev-workflow-case-close/");
  });
});

describe("checkCompletionJudgmentPath (violation classes)", () => {
  test("completion-declaration and final-acceptance bypasses are both detected", () => {
    const root = makeFixtureRepo({
      ".opencode/skills/other/skill.md": "# other\ndriver が完遂状態へ遷移する\n実装担当が最終受入判定を合格とする\n",
    });
    try {
      const report = checkCompletionJudgmentPath(root);
      const bypass = report.failures.filter((f) => f.check === "bypass-trigger");
      expect(bypass.length).toBe(2);
      const klasses = report.trigger_points.filter((t) => t.classification === "bypass").map((t) => t.klass);
      expect(klasses).toContain("completion-declaration");
      expect(klasses).toContain("final-acceptance-exercise");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("negation, ownership, See Also and fence lines are exempted (ok=true)", () => {
    const root = makeFixtureRepo({
      ".opencode/skills/other/skill.md": [
        "# other",
        "実行担当は完了条件チェックボックスを更新しない（評価するのは case-close である）。",
        "完了条件の達成状態の確定（`[ ]` → `[x]`）は case-close だけが行う。",
        "",
        "## See Also",
        "",
        "- 完了条件チェックボックスを更新する関連参照",
        "",
        "```",
        "driver が完了条件チェックボックスを更新する (example)",
        "```",
        "",
        "## 別節",
        "",
        "通常の本文行。",
      ].join("\n"),
    });
    try {
      const report = checkCompletionJudgmentPath(root);
      expect(report.ok).toBe(true);
      expect(report.stats.bypass).toBe(0);
      const exempted = report.trigger_points.filter((t) => t.classification === "exempted");
      expect(exempted.length).toBe(2);
      expect(report.stats.reference_lines).toBeGreaterThanOrEqual(3);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("missing scan root fails closed", () => {
    const root = makeFixtureRepo();
    fs.rmSync(path.join(root, "scripts"), { recursive: true, force: true });
    try {
      const report = checkCompletionJudgmentPath(root);
      expect(report.ok).toBe(false);
      expect(report.failures.some((f) => f.check === "scan-root-missing")).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("scan root resolving to zero files fails closed (zero-targets)", () => {
    const root = makeFixtureRepo();
    fs.rmSync(path.join(root, "scripts", "self", "placeholder.mjs"), { force: true });
    try {
      const report = checkCompletionJudgmentPath(root);
      expect(report.ok).toBe(false);
      expect(report.failures.some((f) => f.check === "scan-root-missing")).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("missing single-path ownership structure fails closed", () => {
    const root = makeFixtureRepo();
    fs.rmSync(path.join(root, "docs", "designs", "commands", "case-close.md"), { force: true });
    try {
      const report = checkCompletionJudgmentPath(root);
      expect(report.ok).toBe(false);
      const missing = report.failures.filter((f) => f.check === "single-point-missing");
      expect(missing.length).toBe(1);
      expect(missing[0]?.file).toBe("/commands/case-close.md");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("empty enumeration fails closed (non-vacuous guard)", () => {
    const root = makeFixtureRepo({
      "src/common/skills/agentdev-workflow-case-close/SKILL.md": "# case-close\n本文のみ。\n",
    });
    try {
      const report = checkCompletionJudgmentPath(root);
      expect(report.ok).toBe(false);
      expect(report.failures.some((f) => f.check === "enumeration-empty")).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("*.test.ts fixture files are exempt from scanning", () => {
    const root = makeFixtureRepo({
      ".opencode/skills/other/check.test.ts": "driver が完了条件チェックボックスを更新する\n",
    });
    try {
      const report = checkCompletionJudgmentPath(root);
      expect(report.stats.bypass).toBe(0);
      expect(report.ok).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("checkCompletionJudgmentPath (real repository regression)", () => {
  const REPO_ROOT = process.cwd();
  let report: CompletionJudgmentReport;

  beforeAll(() => {
    report = checkCompletionJudgmentPath(REPO_ROOT);
  });

  test("no bypass path exists: every enumerated trigger routes through case-close QG-4", () => {
    expect(report.stats.bypass).toBe(0);
    expect(report.ok).toBe(true);
  });

  test("enumeration is non-vacuous and covers the canonical path (coverage proof)", () => {
    expect(report.stats.files_scanned).toBeGreaterThan(300);
    expect(report.stats.roots_scanned).toBe(4);
    expect(report.stats.single_path).toBeGreaterThanOrEqual(5);
    expect(report.stats.trigger_points_enumerated).toBe(
      report.stats.single_path + report.stats.exempted + report.stats.bypass,
    );
  });

  test("all enumerated single-path points belong to the case-close QG-4 ownership set", () => {
    for (const t of report.trigger_points.filter((p) => p.classification === "single-path")) {
      const matched =
        t.file.includes("/agentdev-workflow-case-close/") ||
        t.file.includes("/agentdev-quality-gates/") ||
        t.file.includes("/commands/case-close.md");
      expect(matched).toBe(true);
    }
  });
});
