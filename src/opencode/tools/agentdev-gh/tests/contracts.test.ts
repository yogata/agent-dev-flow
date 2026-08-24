// 操作契約の契約テスト。
//
// Design custom-tool-contracts.md が所有する対象操作の初期セットと、
// 操作カタログの契約整合（副作用分類、継続契約）を固定する。


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

describe("操作カタログ（Design 初期セットとの一致）", () => {
  test("初期セットの10操作を公開する", () => {
    expect([...GH_TOOL_OPERATIONS]).toEqual([
      "issue_create",
      "issue_read",
      "issue_update",
      "issue_comment",
      "issue_close",
      "pr_create",
      "pr_read",
      "pr_merge",
      "pr_changed_files",
      "pr_mergeable",
    ]);
  });

  test("カタログは全操作を重複なく網羅する", () => {
    const catalogOps = GH_TOOL_OPERATION_CATALOG.map((e) => e.operation);
    expect(new Set(catalogOps).size).toBe(GH_TOOL_OPERATIONS.length);
    expect(catalogOps.sort()).toEqual([...GH_TOOL_OPERATIONS].sort());
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
