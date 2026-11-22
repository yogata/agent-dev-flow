import { describe, expect, test } from "bun:test";
import { collectStatusSummary, selectByDotPaths } from "../lib/status_summary.ts";
import type {
  CollectInput,
  Collectors,
  SectionRequest,
} from "../lib/status_summary_types.ts";
import { parseArgs } from "../src/collect_status_summary.ts";

function fakeCollectors(overrides: Partial<Collectors> = {}): Collectors {
  return {
    runGit: (args) => {
      if (args[0] === "rev-parse" && args[1] === "HEAD") {
        return { status: 0, stdout: "abc123def\n" };
      }
      if (args[0] === "rev-parse") {
        return { status: 0, stdout: "feature/test\n" };
      }
      if (args[0] === "status") {
        return { status: 0, stdout: " M a.md\n?? b.md\n" };
      }
      if (args[0] === "worktree") {
        return {
          status: 0,
          stdout: "worktree /repo\nHEAD abc123def\n\nworktree /wt1\nHEAD abc123def\n",
        };
      }
      return { status: 1, stdout: "" };
    },
    runGh: () => ({ status: 0, stdout: '[{"number":1,"title":"t"}]' }),
    stat: () => ({ exists: true, bytes: 13 }),
    readText: () => "line1\nline2\n",
    hashText: (t) => `sha:${t.length}`,
    listFiles: () => [{ name: "a.md", modifiedMs: 1000 }],
    nowMs: () => 1000 + 3 * 24 * 3600 * 1000,
    ...overrides,
  };
}

function baseInput(): CollectInput {
  return {
    root: "/repo",
    files: ["a.md", "b.md"],
    stalenessQueues: [".agentdev/intake/inbox"],
    issuesArgs: ["issue", "list", "--json", "number"],
    limit: 10,
    offset: 0,
    maxBytes: 15360,
  };
}

const allSections: SectionRequest = {
  git: true,
  files: true,
  staleness: true,
  issues: true,
};

describe("collect_status_summary: 全セクション成立の正常系", () => {
  test("各セクションの状態が ok で構造化フィールドが揃う", () => {
    const report = collectStatusSummary(baseInput(), allSections, fakeCollectors());
    expect(report.ok).toBe(true);
    expect(report.sections.git?.status).toBe("ok");
    expect(report.sections.git?.head_commit).toBe("abc123def");
    expect(report.sections.git?.branch).toBe("feature/test");
    expect(report.sections.git?.status_entries).toEqual([" M a.md", "?? b.md"]);
    expect(report.sections.git?.worktree_total).toBe(2);
    expect(report.sections.files?.status).toBe("ok");
    expect(report.sections.files?.entries[0]).toEqual({
      path: "a.md",
      exists: true,
      sha256: "sha:12",
      bytes: 12,
      lines: 2,
    });
    expect(report.sections.staleness?.status).toBe("ok");
    expect(report.sections.staleness?.queues[0]?.oldest_age_days).toBe(3);
    expect(report.sections.issues?.status).toBe("ok");
    expect(report.sections.issues?.total).toBe(1);
    expect(report.output_bytes).toBeGreaterThan(0);
    expect(report.output_bytes).toBeLessThanOrEqual(15360);
  });
});

describe("collect_status_summary: 大量結果の件数上限", () => {
  test("total と returned が分離し、entries は limit 件に制限される", () => {
    const manyFiles = Array.from({ length: 500 }, (_, i) => `f${i}.md`);
    const manyIssues = Array.from({ length: 50 }, (_, i) => ({ number: i }));
    const collectors = fakeCollectors({
      runGh: () => ({ status: 0, stdout: JSON.stringify(manyIssues) }),
    });
    const input: CollectInput = { ...baseInput(), files: manyFiles, limit: 10 };
    const report = collectStatusSummary(input, allSections, collectors);
    expect(report.ok).toBe(true);
    expect(report.sections.files?.total).toBe(500);
    expect(report.sections.files?.returned).toBe(10);
    expect(report.sections.files?.entries).toHaveLength(10);
    expect(report.sections.issues?.total).toBe(50);
    expect(report.sections.issues?.returned).toBe(10);
    // 全件取得ではないため partial（切り詰めの明示）。
    expect(report.sections.issues?.status).toBe("partial");
    expect(report.output_bytes).toBeLessThanOrEqual(input.maxBytes);
  });
});

describe("collect_status_summary: 空の検索結果と滞留ゼロの区別", () => {
  test("issues の空配列は empty、滞留ゼロのキューは ok として区別される", () => {
    const collectors = fakeCollectors({
      runGh: () => ({ status: 0, stdout: "[]" }),
      listFiles: () => [],
    });
    const report = collectStatusSummary(baseInput(), allSections, collectors);
    expect(report.ok).toBe(true);
    expect(report.sections.issues?.status).toBe("empty");
    expect(report.sections.issues?.total).toBe(0);
    expect(report.sections.issues?.error).toBeUndefined();
    expect(report.sections.staleness?.status).toBe("ok");
    expect(report.sections.staleness?.queues[0]?.count).toBe(0);
    expect(report.sections.staleness?.queues[0]?.oldest_age_days).toBeNull();
  });
});

describe("collect_status_summary: 部分取得不能の区別", () => {
  test("git 不成立でも他セクションの集約は成立し、全不能のときだけ ok false", () => {
    const dead = fakeCollectors({ runGit: () => null });
    const report = collectStatusSummary(baseInput(), allSections, dead);
    expect(report.sections.git?.status).toBe("unavailable");
    expect(report.sections.git?.head_commit).toBeNull();
    expect(report.sections.git?.error).toContain("unavailable");
    expect(report.sections.files?.status).toBe("ok");
    expect(report.ok).toBe(true);

    const ghDead = fakeCollectors({ runGit: () => null, runGh: () => null });
    const gitOnly: SectionRequest = { git: true, files: false, staleness: false, issues: true };
    const report2 = collectStatusSummary(baseInput(), gitOnly, ghDead);
    expect(report2.ok).toBe(false);
    expect(report2.error).toBe("all requested sections unavailable");
  });
});

describe("collect_status_summary: 出力バイト上限の fail-closed", () => {
  test("maxBytes 超過時は ok false で集約を成立させない", () => {
    const report = collectStatusSummary(
      { ...baseInput(), maxBytes: 10 },
      allSections,
      fakeCollectors(),
    );
    expect(report.ok).toBe(false);
    expect(report.error).toContain("exceeds maxBytes 10");
    expect(report.output_bytes).toBeGreaterThan(10);
  });
});

describe("collect_status_summary: offset/limit による範囲指定", () => {
  test("files と issues が同一の窗口規則で部分集合を返す", () => {
    const files = ["a", "b", "c", "d", "e"];
    const issues = [{ number: 1 }, { number: 2 }, { number: 3 }];
    const collectors = fakeCollectors({
      runGh: () => ({ status: 0, stdout: JSON.stringify(issues) }),
    });
    const input: CollectInput = { ...baseInput(), files, limit: 2, offset: 1 };
    const report = collectStatusSummary(input, allSections, collectors);
    expect(report.sections.files?.entries.map((e) => e.path)).toEqual(["b", "c"]);
    expect(report.sections.files?.returned).toBe(2);
    expect(report.sections.issues?.items.map((i) => i.number)).toEqual([2, 3]);
    expect(report.sections.issues?.offset).toBe(1);
  });
});

describe("selectByDotPaths: 必要フィールド限定の抽出", () => {
  test("存在する path は値、未存在 path は null", () => {
    const report = collectStatusSummary(baseInput(), allSections, fakeCollectors());
    const out = selectByDotPaths(report, [
      "sections.git.head_commit",
      "sections.files.total",
      "sections.nonexistent",
    ]);
    expect(out["sections.git.head_commit"]).toBe("abc123def");
    expect(out["sections.files.total"]).toBe(2);
    expect(out["sections.nonexistent"]).toBeNull();
  });
});

describe("CLI parseArgs: gh 読取サブコマンド許可リスト", () => {
  test("読取サブコマンドは受理し、書込みサブコマンドは実行前に拒否する", () => {
    const okList = parseArgs([
      "--sections", "issues",
      "--issues-args", "issue list --state open --json number,title --limit 50",
    ]);
    expect("args" in okList && okList.args.issuesArgs?.[0]).toBe("issue");

    const okView = parseArgs(["--sections", "issues", "--issues-args", "pr view 12 --json number"]);
    expect("args" in okView).toBe(true);

    const rejectedEdit = parseArgs(["--sections", "issues", "--issues-args", "issue edit 1 --add-label x"]);
    expect("error" in rejectedEdit).toBe(true);

    const rejectedClose = parseArgs(["--sections", "issues", "--issues-args", "pr close 1"]);
    expect("error" in rejectedClose).toBe(true);
  });
  test("未対応の引数形式は fail-closed で拒否する", () => {
    expect("error" in parseArgs(["--sections", "unknown"])).toBe(true);
    expect("error" in parseArgs(["--sections", "files"])).toBe(true);
    expect("error" in parseArgs(["--limit", "-1"])).toBe(true);
    expect("error" in parseArgs(["--unknown-flag", "x"])).toBe(true);
  });
});
