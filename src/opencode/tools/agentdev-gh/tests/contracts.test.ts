// ADF-COVERS(verification): REQ-011-022, REQ-011-023
//
// 操作契約の契約テスト。
//
// Design custom-tool-contracts.md が所有する対象操作の境界（16操作カタログ）と、
// 操作カタログの契約整合（副作用分類、継続契約）を完全列挙で固定する。
// 対象外 GitHub 機能（Issue 削除、PR close/reopen、review、inline review comment、
// assignee、milestone、Projects、lock/unlock、pin/unpin 等）の追加は列挙固定に
// よって検出される。温存中の deprecated 操作 issue_comment は移行完了（#2689）
// まで期待値として許容する。


import { describe, expect, test } from "bun:test";
import {
  GH_TOOL_OPERATIONS,
  GH_TOOL_OPERATION_CATALOG,
  issueNumber,
  prNumber,
} from "../contracts.ts";
import {
  AGENTDEV_GH_OPERATION_SPECS,
  AGENTDEV_GH_PUBLIC_CONTRACTS,
  AGENTDEV_GH_TOOL_DESCRIPTION,
  AGENTDEV_GH_TOOL_NAME,
} from "../index.ts";

describe("操作カタログ（Design 対象操作との一致）", () => {
  test("16操作カタログ + 温存中の issue_comment を完全列挙で固定する", () => {
    expect([...GH_TOOL_OPERATIONS]).toEqual([
      "issue_create",
      "issue_read",
      "issue_update",
      "issue_close",
      "pr_create",
      "pr_read",
      "pr_merge",
      "pr_changed_files",
      "pr_mergeable",
      "pr_update",
      "issue_list",
      "issue_reopen",
      "comment_create",
      "comment_list",
      "comment_update",
      "comment_delete",
      "issue_comment",
    ]);
  });

  test("16操作カタログは Comment 4操作と pr_update を含む", () => {
    const catalog = new Set(GH_TOOL_OPERATIONS);
    for (const op of [
      "comment_create",
      "comment_list",
      "comment_update",
      "comment_delete",
      "pr_update",
    ]) {
      expect(catalog.has(op as (typeof GH_TOOL_OPERATIONS)[number])).toBe(true);
    }
  });

  test("対象外操作（削除・review・管理系 GitHub 機能）はカタログへ追加されていない", () => {
    const catalog = new Set<string>(GH_TOOL_OPERATIONS);
    const forbidden = [
      "issue_delete",
      "pr_close",
      "pr_reopen",
      "pr_review",
      "pr_review_comment",
      "issue_assign",
      "issue_milestone",
      "issue_lock",
      "issue_unlock",
      "issue_pin",
      "issue_unpin",
      "issue_projects",
      "issue_transfer",
      "pr_draft_update",
      "pr_base_update",
    ];
    for (const op of forbidden) {
      expect(catalog.has(op)).toBe(false);
    }
  });

  test("issue_comment は温存されている（廃止は #2689 の完了条件）", () => {
    expect(GH_TOOL_OPERATIONS).toContain("issue_comment");
    expect(GH_TOOL_OPERATION_CATALOG.find((e) => e.operation === "issue_comment")?.kind).toBe(
      "side-effect",
    );
  });

  test("カタログは全操作を重複なく網羅する", () => {
    const catalogOps = GH_TOOL_OPERATION_CATALOG.map((e) => e.operation);
    expect(new Set(catalogOps).size).toBe(GH_TOOL_OPERATIONS.length);
    expect(catalogOps.sort()).toEqual([...GH_TOOL_OPERATIONS].sort());
  });

  test("Comment WRITE は side-effect、comment_list は read-only", () => {
    const kindOf = (op: string) =>
      GH_TOOL_OPERATION_CATALOG.find((e) => e.operation === op)?.kind;
    expect(kindOf("comment_create")).toBe("side-effect");
    expect(kindOf("comment_update")).toBe("side-effect");
    expect(kindOf("comment_delete")).toBe("side-effect");
    expect(kindOf("comment_list")).toBe("read-only");
    expect(kindOf("pr_update")).toBe("side-effect");
  });
});

describe("補助能力の継続契約", () => {
  test("副作用操作は代替なし・継続不可（fail-closed）", () => {
    for (const entry of GH_TOOL_OPERATION_CATALOG) {
      if (entry.kind !== "side-effect") continue;
      expect(entry.contingency.canContinue).toBe(false);
      expect(entry.contingency.fallbacks).toEqual([]);
    }
  });

  test("読み取り操作は代替手段を持ち継続可能", () => {
    const readOnly = GH_TOOL_OPERATION_CATALOG.filter((e) => e.kind === "read-only");
    expect(readOnly.length).toBeGreaterThan(0);
    for (const entry of readOnly) {
      expect(entry.contingency.canContinue).toBe(true);
      expect(entry.contingency.fallbacks.length).toBeGreaterThan(0);
    }
  });

  test("公開契約（AGENTDEV_GH_PUBLIC_CONTRACTS）はカタログと一致する", () => {
    expect(AGENTDEV_GH_PUBLIC_CONTRACTS.length).toBe(GH_TOOL_OPERATION_CATALOG.length);
    for (const pub of AGENTDEV_GH_PUBLIC_CONTRACTS) {
      const entry = GH_TOOL_OPERATION_CATALOG.find((e) => e.operation === pub.operation);
      if (entry === undefined) {
        throw new Error(`catalog entry missing for operation: ${pub.operation}`);
      }
      expect(pub.sideEffect).toBe(entry.kind === "side-effect");
      expect(pub.canContinue).toBe(entry.contingency.canContinue);
      expect(pub.fallbacks).toEqual(entry.contingency.fallbacks);
    }
  });
});

describe("登録構造", () => {
  test("全操作にスペックが定義されている", () => {
    expect(AGENTDEV_GH_OPERATION_SPECS.length).toBe(GH_TOOL_OPERATIONS.length);
    const specOps = AGENTDEV_GH_OPERATION_SPECS.map((s) => s.operation);
    expect(new Set(specOps).size).toBe(GH_TOOL_OPERATIONS.length);
  });

  test("Tool 名と説明が非空で公開されている", () => {
    expect(AGENTDEV_GH_TOOL_NAME).toBe("agentdev_gh");
    expect(AGENTDEV_GH_TOOL_DESCRIPTION.length).toBeGreaterThan(0);
  });
});

describe("識別番号のブランド型", () => {
  test("issueNumber は正整数のみ受け付ける", () => {
    const one: number = issueNumber(1);
    expect(one).toBe(1);
    expect(() => issueNumber(0)).toThrow();
    expect(() => issueNumber(-3)).toThrow();
    expect(() => issueNumber(1.5)).toThrow();
  });

  test("prNumber は正整数のみ受け付ける", () => {
    const seven: number = prNumber(7);
    expect(seven).toBe(7);
    expect(() => prNumber(0)).toThrow();
    expect(() => prNumber(-1)).toThrow();
  });
});
