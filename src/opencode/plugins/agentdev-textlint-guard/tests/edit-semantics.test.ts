// ガード間共通部（lib/edit-semantics.ts）の試験。B3-5a（Design「共有 detector と
// adapter の契約」節）により、write/edit/apply_patch の引数解析と完成予定全文の
// 再構成の挙動はここで1箇所管理する。各ガードの固有の拒否条件の試験は
// 各ガードが保持する（textlint: tests/plugin.test.ts・tests/reconstruct.test.ts、
// 配布依存境界: src/opencode/plugins/agentdev-distribution-boundary-guard/tests/plugin.test.ts）。
// 純関数のため fs への依存はなく、ファイル読込は注入 reader のみで検証する。

import { describe, expect, test } from "bun:test";
import {
  applyEditToContent,
  applyUpdateChunks,
  extractAddedLines,
  hasArg,
  joinAddContent,
  parseApplyPatchToolArgs,
  parseEditToolArgs,
  parsePatch,
  parseWriteToolArgs,
  safeReadFile,
  splitUpdateChunks,
  stripHeredoc,
} from "../lib/edit-semantics.ts";

describe("tool 引数の型解析", () => {
  test("write: filePath/content を文字列として返す", () => {
    expect(parseWriteToolArgs({ filePath: "a.md", content: "x" })).toEqual({ filePath: "a.md", content: "x" });
    expect(parseWriteToolArgs({ path: "a.md", content: "x" })).toEqual({ filePath: "a.md", content: "x" });
    expect(parseWriteToolArgs({ path: "a.md", filePath: "b.md", content: "x" })).toEqual({ filePath: "a.md", content: "x" });
  });

  test("write: 欠落・非文字列・空パスは undefined として正直に返す", () => {
    expect(parseWriteToolArgs({ content: "x" }).filePath).toBeUndefined();
    expect(parseWriteToolArgs({ filePath: "a.md" }).content).toBeUndefined();
    expect(parseWriteToolArgs({ filePath: 1, content: "x" }).filePath).toBeUndefined();
    expect(parseWriteToolArgs({ filePath: "", content: "x" }).filePath).toBeUndefined();
    expect(parseWriteToolArgs({}).content).toBeUndefined();
  });

  test("edit: replaceAll は boolean のみ受理し、欠落と無効型を undefined で区別できる", () => {
    expect(parseEditToolArgs({ filePath: "a", oldString: "x", newString: "y" })).toEqual({
      filePath: "a",
      oldString: "x",
      newString: "y",
      replaceAll: undefined,
    });
    expect(parseEditToolArgs({ filePath: "a", oldString: "x", newString: "y", replaceAll: "yes" }).replaceAll).toBeUndefined();
    expect(hasArg({ filePath: "a", oldString: "x", newString: "y", replaceAll: "yes" }, "replaceAll")).toBe(true);
    expect(hasArg({ filePath: "a" }, "oldString")).toBe(false);
  });

  test("apply_patch: patchText は文字列のみ受理", () => {
    expect(parseApplyPatchToolArgs({ patchText: "*** Begin Patch" }).patchText).toBe("*** Begin Patch");
    expect(parseApplyPatchToolArgs({}).patchText).toBeUndefined();
    expect(parseApplyPatchToolArgs({ patchText: 3 }).patchText).toBeUndefined();
  });
});

describe("edit の置換適用（現行 tool 意味論）", () => {
  test("単一一致の置換後全文と matchCount を返す", () => {
    const r = applyEditToContent("一行目\n二行目\n三行目\n", "二行目", "に行目（修正）", false);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.content).toBe("一行目\nに行目（修正）\n三行目\n");
      expect(r.result.matchCount).toBe(1);
    }
  });

  test("CRLF ファイルは LF 入力を CRLF へ正規化して一致させる", () => {
    const r = applyEditToContent("一行目\r\n二行目\r\n", "二行目", "修正", false);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result.content).toBe("一行目\r\n修正\r\n");
  });

  test("replaceAll は全置換し、matchCount に出現数を返す", () => {
    const r = applyEditToContent("x と x と x", "x", "y", true);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.content).toBe("y と y と y");
      expect(r.result.matchCount).toBe(3);
    }
  });

  test("複数一致では最初の1箇所を置換し matchCount を報告する（一意性要求はガードの固有条件）", () => {
    const r = applyEditToContent("x と x", "x", "y", false);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.content).toBe("y と x");
      expect(r.result.matchCount).toBe(2);
    }
  });

  test("oldString 不在は old-string-not-found（fail-closed の素）", () => {
    expect(applyEditToContent("内容\n", "存在しない", "y", false).ok).toBe(false);
  });

  test("空 oldString + 非 replaceAll は先頭挿入", () => {
    const r = applyEditToContent("既存\n", "", "先頭\n", false);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result.content).toBe("先頭\n既存\n");
  });

  test("空 oldString + replaceAll は適用不能（fail-closed）", () => {
    const r = applyEditToContent("既存\n", "", "x", true);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("empty-old-string-with-replace-all");
  });
});

describe("V4A パッチ解析", () => {
  test("Add / Update / Delete / Move to を解析する", () => {
    const patch = [
      "*** Begin Patch",
      "*** Add File: docs/new.md",
      "+# 見出し",
      "+",
      "+本文",
      "*** Update File: docs/old.md",
      "*** Move to: docs/renamed.md",
      "@@ 一行目",
      " 一行目",
      "-二行目",
      "+二行目（修正）",
      "*** Delete File: docs/gone.md",
      "*** End Patch",
    ].join("\n");
    const r = parsePatch(patch);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.patch.entries).toHaveLength(3);
    expect(r.patch.entries[0]).toMatchObject({ kind: "add", path: "docs/new.md", addContent: "# 見出し\n\n本文" });
    expect(r.patch.entries[1]).toMatchObject({ kind: "update", path: "docs/old.md", moveTo: "docs/renamed.md" });
    expect(r.patch.entries[2]).toMatchObject({ kind: "delete", path: "docs/gone.md" });
    expect(r.patch.unknownLines).toHaveLength(0);
  });

  test("update のチャンク分離と End of File マーカー", () => {
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/a.md",
      "@@",
      " context",
      "*** End of File",
      "*** End Patch",
    ].join("\n");
    const r = parsePatch(patch);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const chunks = r.patch.entries[0]?.chunks ?? [];
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ oldLines: ["context"], newLines: ["context"], isEndOfFile: true });
  });

  test("Begin/End マーカー不在・空パッチ・entries 空・パス空・Move コンテキスト外は malformed", () => {
    expect(parsePatch("not a patch").ok).toBe(false);
    expect(parsePatch("").ok).toBe(false);
    expect(parsePatch("*** Begin Patch\n*** End Patch").ok).toBe(false);
    expect(parsePatch("*** Begin Patch\n*** Add File:\n+x\n*** End Patch").ok).toBe(false);
    expect(parsePatch("*** Begin Patch\n*** Move to: x\n*** End Patch").ok).toBe(false);
    expect(parsePatch("*** Begin Patch\n*** Add File: c\n*** Move to: d\n*** End Patch").ok).toBe(false);
  });

  test("分類不能行（裸行）は unknownLines に記録して続行する（malformed 判断はガードの固有条件）", () => {
    const r = parsePatch("*** Begin Patch\ngarbage\n*** Add File: a.md\n+ok\nbare\n*** End Patch");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.patch.unknownLines.map((u) => u.line)).toEqual([2, 5]);
    expect(r.patch.unknownLines[1]?.text).toBe("bare");
  });

  test("heredoc 形式を剥がして解析する", () => {
    const r = parsePatch([
      "cat <<'PATCH'",
      "*** Begin Patch",
      "*** Add File: a.md",
      "+x",
      "*** End Patch",
      "PATCH",
    ].join("\n"));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.patch.entries[0]).toMatchObject({ kind: "add", addContent: "x" });
  });

  test("CRLF 入力は行末 CR を除去して解析する", () => {
    const r = parsePatch("*** Begin Patch\r\n*** Add File: a.md\r\n+x\r\n*** End Patch\r\n");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.patch.entries[0]).toMatchObject({ addContent: "x" });
  });
});

describe("update チャンクの適用", () => {
  test("置換・行追加・複数チャンク・末尾改行の現行 tool 意味論", () => {
    expect(applyUpdateChunks("A\nB\nC\n", [{ oldLines: ["B"], newLines: ["B2"] }], "docs/a.md")).toBe("A\nB2\nC\n");
    expect(applyUpdateChunks("A\nB\n", [{ oldLines: [], newLines: ["X"] }], "docs/a.md")).toBe("A\nB\nX\n");
    expect(() => applyUpdateChunks("A\n", [{ oldLines: ["Z"], newLines: ["Y"] }], "docs/a.md")).toThrow();
  });

  test("完全一致 → trimEnd → trim の3パス一致", () => {
    expect(applyUpdateChunks("A \nB\n", [{ oldLines: ["A"], newLines: ["A2"] }], "a")).toBe("A2\nB\n");
    expect(applyUpdateChunks("A\nB\n", [{ oldLines: [" A "], newLines: ["A2"] }], "a")).toBe("A2\nB\n");
  });

  test("splitUpdateChunks は生行からチャンクを分離する（共有関数）", () => {
    const chunks = splitUpdateChunks(["@@ ctx", " ctx", "-old", "+new"]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ oldLines: ["ctx", "old"], newLines: ["ctx", "new"] });
  });
});

describe("add 本文の組立てと抽出", () => {
  test("joinAddContent は + 行を連結し末尾改行を1つ除去する", () => {
    expect(joinAddContent(["+# 見出し", "+", "+本文"])).toBe("# 見出し\n\n本文");
    expect(joinAddContent(["+x"])).toBe("x");
    expect(joinAddContent(["no prefix"])).toBe("");
  });

  test("extractAddedLines は + 行のみ抽出する", () => {
    expect(extractAddedLines(["+a", " b", "-c", "+d"])).toEqual(["a", "d"]);
  });
});

describe("safeReadFile（注入 reader の fail-closed 正規化）", () => {
  test("reader の null 返却と throw を null に正規化する", () => {
    expect(safeReadFile(() => "content", "a")).toBe("content");
    expect(safeReadFile(() => null, "a")).toBeNull();
    expect(safeReadFile(() => {
      throw new Error("boom");
    }, "a")).toBeNull();
  });
});

describe("stripHeredoc", () => {
  test("heredoc 形式のみ剥がし、それ以外は原形を維持する", () => {
    expect(stripHeredoc("cat <<'EOF'\nbody\nEOF")).toBe("body");
    expect(stripHeredoc("plain text")).toBe("plain text");
  });
});
