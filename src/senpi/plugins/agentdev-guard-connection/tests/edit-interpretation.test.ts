// Senpi 編集解釈レイヤの単体テスト（REQ-099-013 の構造的固定）。
//
// 編集意味論は tool 名が決定する意味論種別が要求する意味論パラメータのみを
// 消費すること。入力キーの機械的な変更だけで別の編集意味論を同一と扱わない
// ことを、対になる入力で固定する。検査不能（ok: false）は呼出側の
// fail-closed 拒否の入力である。

import { describe, expect, test } from "bun:test";
import { interpretSenpiEditOperation } from "../lib/edit-interpretation.ts";

describe("tool 名と編集意味論種別の対応", () => {
  test("write は full-replace として解釈される", () => {
    const r = interpretSenpiEditOperation("write", {
      path: "src/common/skills/agentdev-foo/SKILL.md",
      content: "# body\n",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.operation.kind).toBe("full-replace");
      if (r.operation.kind === "full-replace") {
        expect(r.operation.filePath).toBe("src/common/skills/agentdev-foo/SKILL.md");
        expect(r.operation.content).toBe("# body\n");
      }
    }
  });

  test("edit は partial-replace として解釈される", () => {
    const r = interpretSenpiEditOperation("edit", {
      path: "a.md",
      oldString: "x",
      newString: "y",
      replaceAll: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.operation.kind).toBe("partial-replace");
      if (r.operation.kind === "partial-replace") {
        expect(r.operation.oldString).toBe("x");
        expect(r.operation.newString).toBe("y");
        expect(r.operation.replaceAll).toBe(true);
      }
    }
  });

  test("apply_patch は patch-apply として解釈される", () => {
    const r = interpretSenpiEditOperation("apply_patch", { patchText: "*** Begin Patch\n*** End Patch" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.operation.kind).toBe("patch-apply");
    }
  });

  test("partial-replace の省略可能パラメータは edit 契約の既定値に正準化される", () => {
    const r = interpretSenpiEditOperation("edit", { path: "a.md" });
    expect(r.ok).toBe(true);
    if (r.ok && r.operation.kind === "partial-replace") {
      expect(r.operation.oldString).toBe("");
      expect(r.operation.newString).toBe("");
      expect(r.operation.replaceAll).toBe(false);
    }
  });
});

describe("REQ-099-013: 入力キーの機械的な変更だけで編集意味論を同一と扱わない", () => {
  test("partial-replace のパラメータだけを write に渡しても全文置換と同一視されず検査不能になる", () => {
    const r = interpretSenpiEditOperation("write", {
      path: "a.md",
      oldString: "x",
      newString: "y",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.detail).toContain("content");
  });

  test("full-replace の content は partial-replace の意味論パラメータとして消費されない", () => {
    const r = interpretSenpiEditOperation("edit", {
      path: "a.md",
      content: "# replaced whole file\n",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.operation.kind).toBe("partial-replace");
      if (r.operation.kind === "partial-replace") {
        // content は edit の意味論パラメータではない。完成予定全文は
        // 共通判定側が現行内容と oldString/newString から再構成する。
        expect(JSON.stringify(r.operation)).not.toContain("# replaced whole file");
      }
    }
  });

  test("path と filePath は同一の対象パスパラメータの表記差として同じ対象に正準化される", () => {
    const viaPath = interpretSenpiEditOperation("write", { path: "a.md", content: "x" });
    const viaAlias = interpretSenpiEditOperation("write", { filePath: "a.md", content: "x" });
    expect(viaPath.ok).toBe(true);
    expect(viaAlias.ok).toBe(true);
    if (viaPath.ok && viaAlias.ok) {
      expect(viaPath.operation).toEqual(viaAlias.operation);
    }
  });

  test("path と filePath の両方があるとき path を優先する", () => {
    const r = interpretSenpiEditOperation("write", { path: "canonical.md", filePath: "alias.md", content: "x" });
    expect(r.ok).toBe(true);
    if (r.ok && r.operation.kind === "full-replace") {
      expect(r.operation.filePath).toBe("canonical.md");
    }
  });
});

describe("検査不能（fail-closed の入力）", () => {
  test.each([
    ["不明 tool 名", "move_file", { path: "a.md", content: "x" }, "unknown edit operation"],
    ["path 欠落", "write", { content: "x" }, "target path"],
    ["path が非 string", "write", { path: 123, content: "x" }, "target path"],
    ["path が空文字", "write", { path: "", content: "x" }, "target path"],
    ["write で content 欠落", "write", { path: "a.md" }, "content"],
    ["write で content が非 string", "write", { path: "a.md", content: 42 }, "content"],
    ["apply_patch で patchText 欠落", "apply_patch", { path: "a.md" }, "patch text"],
    ["apply_patch で patchText が非 string", "apply_patch", { patchText: 7 }, "patch text"],
  ])("%s は検査不能になる", (_label, tool, args, expectedDetailPart) => {
    const r = interpretSenpiEditOperation(tool as string, args as Record<string, unknown>);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.detail).toContain(expectedDetailPart);
  });
});
