//
// 操作契約の契約テスト。
//
// Design custom-tool-contracts.md が所有する対象操作の境界（20操作カタログ）と、
// 操作カタログの契約整合（副作用分類、継続契約）を完全列挙で固定する。
// 対象外 GitHub 機能（Issue 削除、PR close/reopen、review、inline review comment、
// assignee、milestone、Projects、lock/unlock、pin/unpin、Release 公開モード付き作成、
// Release 更新・削除等）の追加は列挙固定によって検出される。廃止済みの
// issue_comment（二重モード操作）も禁止対象として固定する。release_publish は
// カタログ内の正規公開操作であり、release_update・release_delete・
// release_create_published（公開モード付き作成）は禁止対象のまま固定する。
//


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
  test("20操作カタログを完全列挙で固定する", () => {
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
      "release_create",
      "release_list",
      "release_read",
      "release_publish",
    ]);
  });

  test("20操作カタログは Comment 4操作と pr_update と Release 4操作を含む", () => {
    const catalog = new Set(GH_TOOL_OPERATIONS);
    for (const op of [
      "comment_create",
      "comment_list",
      "comment_update",
      "comment_delete",
      "pr_update",
      "release_create",
      "release_list",
      "release_read",
      "release_publish",
    ]) {
      expect(catalog.has(op as (typeof GH_TOOL_OPERATIONS)[number])).toBe(true);
    }
  });

  test("対象外操作（削除・review・管理系 GitHub 機能・廃止済み issue_comment・Release 更新・削除・公開モード付き作成）はカタログへ追加されていない", () => {
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
      "issue_comment",
      "release_update",
      "release_delete",
      "release_create_published",
    ];
    for (const op of forbidden) {
      expect(catalog.has(op)).toBe(false);
    }
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

  test("Release 草稿作成は side-effect、Release 一覧読取・読み戻しは read-only、公開は side-effect", () => {
    const kindOf = (op: string) =>
      GH_TOOL_OPERATION_CATALOG.find((e) => e.operation === op)?.kind;
    expect(kindOf("release_create")).toBe("side-effect");
    expect(kindOf("release_list")).toBe("read-only");
    expect(kindOf("release_read")).toBe("read-only");
    expect(kindOf("release_publish")).toBe("side-effect");
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

describe("Release 操作の入力契約（公開モード非包含）", () => {
  const specOf = (op: string) => {
    const spec = AGENTDEV_GH_OPERATION_SPECS.find((s) => s.operation === op);
    if (spec === undefined) throw new Error(`spec missing for operation: ${op}`);
    return spec;
  };

  test("release_create は公開相当フィールド（draft、published 等）を含む要求を副作用発生前に拒否する", () => {
    const spec = specOf("release_create");
    for (const extra of ["draft", "published", "publish", "make_latest"]) {
      const raw = {
        operation: "release_create",
        tagName: "v1.2.3",
        title: "t",
        body: "b",
        prerelease: false,
        [extra]: true,
      };
      const validated = spec.validate(raw);
      expect(validated.ok).toBe(false);
      if (!validated.ok) {
        expect(validated.error.code).toBe("unknown-field");
        expect(validated.error.field).toBe(extra);
      }
    }
  });

  test("release_create の正常要求は受理し、prerelease は boolean で必須", () => {
    const spec = specOf("release_create");
    const ok = spec.validate({
      operation: "release_create",
      tagName: "v1.2.3-rc.1",
      title: "t",
      body: "",
      prerelease: true,
    });
    expect(ok.ok).toBe(true);
    for (const invalid of [
      { operation: "release_create", tagName: "v", title: "t", body: "b", prerelease: "yes" },
      { operation: "release_create", tagName: "v", title: "t", body: "b" },
      { operation: "release_create", tagName: "", title: "t", body: "b", prerelease: true },
    ]) {
      expect(spec.validate(invalid).ok).toBe(false);
    }
  });

  test("release_list は引数を受け付けず、release_read は tagName を必須とする", () => {
    expect(specOf("release_list").validate({ operation: "release_list" }).ok).toBe(true);
    expect(specOf("release_list").validate({ operation: "release_list", tagName: "v1" }).ok).toBe(false);
    expect(specOf("release_read").validate({ operation: "release_read", tagName: "v1.2.3" }).ok).toBe(true);
    expect(specOf("release_read").validate({ operation: "release_read" }).ok).toBe(false);
    expect(specOf("release_read").validate({ operation: "release_read", draft: true }).ok).toBe(false);
  });

  test("release_publish は承認根拠を欠く要求を副作用発生前に拒否する（missing-field / invalid-field / unknown-field）", () => {
    const spec = specOf("release_publish");
    const missingTagName = spec.validate({ operation: "release_publish", approvalBasis: "b" });
    expect(missingTagName.ok).toBe(false);
    if (!missingTagName.ok) {
      expect(missingTagName.error.code).toBe("missing-field");
      expect(missingTagName.error.field).toBe("tagName");
    }
    const missingBasis = spec.validate({ operation: "release_publish", tagName: "v1.2.3" });
    expect(missingBasis.ok).toBe(false);
    if (!missingBasis.ok) {
      expect(missingBasis.error.code).toBe("missing-field");
      expect(missingBasis.error.field).toBe("approvalBasis");
    }
    for (const empty of ["", "   "]) {
      const invalid = spec.validate({ operation: "release_publish", tagName: "v1.2.3", approvalBasis: empty });
      expect(invalid.ok).toBe(false);
      if (!invalid.ok) {
        expect(invalid.error.code).toBe("invalid-field");
        expect(invalid.error.field).toBe("approvalBasis");
      }
    }
    const nonString = spec.validate({ operation: "release_publish", tagName: "v1.2.3", approvalBasis: 7 });
    expect(nonString.ok).toBe(false);
  });

  test("release_publish は契約外フィールド（draft、publish、published 等の公開指定フィールド）を含む要求を副作用発生前に拒否する", () => {
    const spec = specOf("release_publish");
    for (const extra of ["draft", "publish", "published", "make_latest", "title", "body", "prerelease"]) {
      const raw = {
        operation: "release_publish",
        tagName: "v1.2.3",
        approvalBasis: "HITL 質問 ID: Q-1、回答の記録参照",
        [extra]: true,
      };
      const validated = spec.validate(raw);
      expect(validated.ok).toBe(false);
      if (!validated.ok) {
        expect(validated.error.code).toBe("unknown-field");
        expect(validated.error.field).toBe(extra);
      }
    }
  });

  test("release_publish の正常要求（タグ名と承認根拠）は受理する", () => {
    const spec = specOf("release_publish");
    const ok = spec.validate({
      operation: "release_publish",
      tagName: "v1.2.3",
      approvalBasis: "HITL 質問 ID: Q-1、回答の記録参照",
    });
    expect(ok.ok).toBe(true);
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
