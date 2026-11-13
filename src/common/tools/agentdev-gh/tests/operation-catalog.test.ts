//
// 操作定義正本（operation-catalog.ts）の契約テスト。
//
// 操作一覧・副作用分類・共通入力検査の正本テーブルと、validateOperationInput の
// 型別定型検査を固定する。正本テーブル自体の20操作完全列挙固定は contracts.test.ts
// （独立外部契約検査）が所有し、本テストは派生源の振る舞いを所有する。
//

import { describe, expect, test } from "bun:test";
import {
  GH_TOOL_OPERATION_DEFINITIONS,
  validateOperationInput,
} from "../operation-catalog.ts";

describe("正本テーブルの構造", () => {
  test("全エントリは operation・kind・nonRecord を持つ", () => {
    for (const definition of GH_TOOL_OPERATION_DEFINITIONS) {
      expect(definition.operation.length).toBeGreaterThan(0);
      expect(["side-effect", "read-only"]).toContain(definition.kind);
      expect(definition.nonRecord.field.length).toBeGreaterThan(0);
      expect(definition.nonRecord.detail.length).toBeGreaterThan(0);
    }
  });

  test("enum 型フィールドは enumValues を持つ", () => {
    for (const definition of GH_TOOL_OPERATION_DEFINITIONS) {
      for (const field of definition.fields) {
        if (field.type === "enum") {
          expect(field.enumValues?.length ?? 0).toBeGreaterThan(0);
        }
      }
    }
  });

  test("フィールド名はエントリ内で重複しない", () => {
    for (const definition of GH_TOOL_OPERATION_DEFINITIONS) {
      const names = definition.fields.map((fd) => fd.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("validateOperationInput（共通入力検査の正本実装）", () => {
  test("契約外フィールドを unknown-field で検出する", () => {
    const outcome = validateOperationInput("issue_read", {
      operation: "issue_read",
      number: 1,
      milestone: "v1",
    });
    expect(outcome?.error.code).toBe("unknown-field");
    expect(outcome?.error.field).toBe("milestone");
  });

  test("必須欠落を missing-field で検出する（宣言順の最初の欠落）", () => {
    const outcome = validateOperationInput("issue_create", {
      operation: "issue_create",
      body: "B",
      labels: [],
    });
    expect(outcome?.error.code).toBe("missing-field");
    expect(outcome?.error.field).toBe("title");
  });

  test.each([
    ["空文字列", ""],
    ["非文字列", 7],
  ])("nonempty-string 型は %s を invalid-field で拒否する", (_label, value) => {
    const create = validateOperationInput("comment_create", {
      operation: "comment_create",
      number: 1,
      body: value,
    });
    expect(create?.error.code).toBe("invalid-field");
    expect(create?.error.field).toBe("body");
  });

  test("string 型（空文字列許容）は空の body を受理する（pr_create・release_create・pr_update の契約）", () => {
    expect(
      validateOperationInput("pr_create", {
        operation: "pr_create",
        title: "T",
        body: "",
        base: "main",
        head: "x",
      }),
    ).toBeNull();
    expect(
      validateOperationInput("release_create", {
        operation: "release_create",
        tagName: "v1.2.3",
        title: "T",
        body: "",
        prerelease: false,
      }),
    ).toBeNull();
  });

  test.each([
    ["非整数", 1.5],
    ["0", 0],
    ["負数", -3],
    ["非数値", "7"],
  ])("positive-int 型は %s を invalid-field で拒否する", (_label, value) => {
    const outcome = validateOperationInput("pr_create", {
      operation: "pr_create",
      title: "T",
      body: "B",
      base: "main",
      head: "x",
      number: value,
    });
    expect(outcome?.error.code).toBe("invalid-field");
    expect(outcome?.error.field).toBe("number");
  });

  test("string-array 型は文字列以外の要素を invalid-field で拒否する", () => {
    const outcome = validateOperationInput("issue_create", {
      operation: "issue_create",
      title: "T",
      body: "B",
      labels: ["a", 7],
    });
    expect(outcome?.error.code).toBe("invalid-field");
    expect(outcome?.error.field).toBe("labels");
  });

  test("boolean 型は非 boolean を invalid-field で拒否する", () => {
    const outcome = validateOperationInput("release_create", {
      operation: "release_create",
      tagName: "v",
      title: "t",
      body: "b",
      prerelease: "yes",
    });
    expect(outcome?.error.code).toBe("invalid-field");
    expect(outcome?.error.field).toBe("prerelease");
  });

  test("enum 型は値域外を invalid-field で拒否する", () => {
    const outcome = validateOperationInput("issue_list", {
      operation: "issue_list",
      state: "running",
    });
    expect(outcome?.error.code).toBe("invalid-field");
    expect(outcome?.error.field).toBe("state");
  });

  test("省略可能フィールドの欠落は受理する", () => {
    expect(validateOperationInput("issue_list", { operation: "issue_list" })).toBeNull();
    expect(validateOperationInput("issue_close", { operation: "issue_close", number: 1 })).toBeNull();
  });

  test.each([
    ["issue 系は operation 欄", "issue_read", "operation"],
    ["pr 系は number 欄", "pr_read", "number"],
    ["release_create は tagName 欄", "release_create", "tagName"],
    ["release_list は operation 欄", "release_list", "operation"],
  ])("非オブジェクト要求は %s の missing-field で拒否される", (_label, operation, field) => {
    const outcome = validateOperationInput(operation, "not-an-object");
    expect(outcome?.error.code).toBe("missing-field");
    expect(outcome?.error.field).toBe(field);
  });

  test("正本テーブルに存在しない操作名は null（specs 登録の専管。index.ts が unknown operation を返す）", () => {
    expect(validateOperationInput("unknown_op", { operation: "unknown_op" })).toBeNull();
  });
});
