// ADF-COVERS(verification): REQ-053-025, REQ-053-027
//
// 完成予定全文の再構成テスト。write（新規・更新）、edit（一意置換・replaceAll・
// 改行・失敗系）、apply_patch（Add / Update / Delete / Move to / 複数ファイル / End of File /
// 不正入力）の現行 OpenCode 入力形式に対する適用結果を固定する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  applyUpdateChunks,
  parsePatchText,
  reconstructApplyPatch,
  reconstructEdit,
  reconstructWrite,
} from "../lib/reconstruct.ts";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-rec-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  return root;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

describe("reconstructWrite", () => {
  test("content がそのまま完成予定全文になる（新規・更新同一形状）", () => {
    const root = makeProject({ "docs/a.md": "旧内容" });
    const r1 = reconstructWrite({ filePath: path.join(root, "docs", "new.md"), content: "# 新規" });
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      expect(r1.writes[0]?.kind).toBe("create");
      expect(r1.writes[0]?.content).toBe("# 新規");
    }
    const r2 = reconstructWrite({ filePath: path.join(root, "docs", "a.md"), content: "# 更新" });
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.writes[0]?.kind).toBe("update");
  });

  test("引数不正は再構成不能", () => {
    expect(reconstructWrite({ content: "x" }).ok).toBe(false);
    expect(reconstructWrite({ filePath: "/a/b.md" }).ok).toBe(false);
    expect(reconstructWrite({ filePath: "/a/b.md", content: 1 }).ok).toBe(false);
  });
});

describe("reconstructEdit", () => {
  test("一意な oldString の置換後全文を再構成する", () => {
    const root = makeProject({ "docs/a.md": "一行目\n二行目\n三行目\n" });
    const r = reconstructEdit({
      filePath: path.join(root, "docs", "a.md"),
      oldString: "二行目",
      newString: "に行目（修正）",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.writes[0]?.content).toBe("一行目\nに行目（修正）\n三行目\n");
  });

  test("CRLF ファイルは LF 正規化入力を CRLF へ戻す（現行 tool と同じ意味論）", () => {
    const root = makeProject({ "docs/crlf.md": "一行目\r\n二行目\r\n" });
    const r = reconstructEdit({
      filePath: path.join(root, "docs", "crlf.md"),
      oldString: "二行目",
      newString: "修正",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.writes[0]?.content).toBe("一行目\r\n修正\r\n");
  });

  test("replaceAll は全置換後全文を返す", () => {
    const root = makeProject({ "docs/a.md": "x と x と x" });
    const r = reconstructEdit({
      filePath: path.join(root, "docs", "a.md"),
      oldString: "x",
      newString: "y",
      replaceAll: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.writes[0]?.content).toBe("y と y と y");
  });

  test("複数箇所一致（replaceAll なし）は再構成不能として拒否", () => {
    const root = makeProject({ "docs/a.md": "x と x" });
    const r = reconstructEdit({ filePath: path.join(root, "docs", "a.md"), oldString: "x", newString: "y" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.detail).toContain("multiple");
  });

  test("oldString 不在は再構成不能（推測で通過させない）", () => {
    const root = makeProject({ "docs/a.md": "内容\n" });
    const r = reconstructEdit({
      filePath: path.join(root, "docs", "a.md"),
      oldString: "存在しない",
      newString: "y",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.detail).toContain("not found verbatim");
  });

  test("同一文字列・読込失敗・引数不正は再構成不能", () => {
    const root = makeProject({ "docs/a.md": "内容\n" });
    expect(
      reconstructEdit({ filePath: path.join(root, "docs", "a.md"), oldString: "s", newString: "s" }).ok,
    ).toBe(false);
    expect(
      reconstructEdit({ filePath: path.join(root, "docs", "missing.md"), oldString: "s", newString: "t" }).ok,
    ).toBe(false);
    expect(reconstructEdit({ filePath: path.join(root, "docs", "a.md"), oldString: 1, newString: "t" }).ok).toBe(false);
    expect(
      reconstructEdit({
        filePath: path.join(root, "docs", "a.md"),
        oldString: "s",
        newString: "t",
        replaceAll: "yes",
      }).ok,
    ).toBe(false);
  });

  test("oldString 空の新規作成形式を扱う", () => {
    const root = makeProject();
    const r = reconstructEdit({ filePath: path.join(root, "docs", "new.md"), oldString: "", newString: "# 新規\n" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.writes[0]?.kind).toBe("create");
      expect(r.writes[0]?.content).toBe("# 新規\n");
    }
    // 既存ファイルへの空 oldString は現行 tool 同様に拒否
    const root2 = makeProject({ "docs/a.md": "内容" });
    expect(
      reconstructEdit({ filePath: path.join(root2, "docs", "a.md"), oldString: "", newString: "x" }).ok,
    ).toBe(false);
  });
});

describe("parsePatchText（V4A 形式）", () => {
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
    const hunks = parsePatchText(patch);
    expect(hunks).toHaveLength(3);
    expect(hunks[0]).toEqual({ type: "add", path: "docs/new.md", contents: "# 見出し\n\n本文" });
    expect(hunks[1]).toMatchObject({ type: "update", path: "docs/old.md", movePath: "docs/renamed.md" });
    expect(hunks[2]).toEqual({ type: "delete", path: "docs/gone.md" });
  });

  test("End of File マーカーと複数チャンクを解析する", () => {
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/a.md",
      "@@",
      " context",
      "*** End of File",
      "*** End Patch",
    ].join("\n");
    const hunks = parsePatchText(patch);
    expect(hunks[0]).toMatchObject({ type: "update" });
    const hunk = hunks[0] as unknown as { chunks: { isEndOfFile?: boolean }[] };
    expect(hunk.chunks[0]?.isEndOfFile).toBe(true);
  });

  test("Begin/End マーカー不在・空パッチは解析不能", () => {
    expect(() => parsePatchText("not a patch")).toThrow();
    expect(() => parsePatchText("*** Begin Patch\n*** End Patch")).toThrow();
  });
});

describe("applyUpdateChunks / reconstructApplyPatch", () => {
  test("チャンク適用で更新後全文を組む", () => {
    expect(applyUpdateChunks("A\nB\nC\n", [{ oldLines: ["B"], newLines: ["B2"] }], "docs/a.md")).toBe("A\nB2\nC\n");
    // 行追加チャンク（old 空）
    expect(applyUpdateChunks("A\nB\n", [{ oldLines: [], newLines: ["X"] }], "docs/a.md")).toBe("A\nB\nX\n");
  });

  test("一致しないチャンクは再構成不能", () => {
    expect(() => applyUpdateChunks("A\n", [{ oldLines: ["Z"], newLines: ["Y"] }], "docs/a.md")).toThrow();
  });

  test("複数ファイルのパッチで全対象の完成予定全文を返す", () => {
    const root = makeProject({ "docs/a.md": "A\n", "docs/b.md": "B\n" });
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/a.md",
      "@@",
      "-A",
      "+A2",
      "*** Add File: docs/c.md",
      "+新規",
      "*** End Patch",
    ].join("\n");
    const r = reconstructApplyPatch({ patchText: patch }, root);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.writes).toHaveLength(2);
      const a = r.writes.find((w) => toPosix(w.absolutePath).endsWith("docs/a.md"));
      const c = r.writes.find((w) => toPosix(w.absolutePath).endsWith("docs/c.md"));
      expect(a?.content).toBe("A2\n");
      expect(a?.kind).toBe("update");
      expect(c?.content).toBe("新規");
      expect(c?.kind).toBe("create");
    }
  });

  test("Move to は変更先パスを movePath として持つ", () => {
    const root = makeProject({ "docs/old.md": "内容\n" });
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/old.md",
      "*** Move to: docs/renamed.md",
      "@@",
      " 内容",
      "*** End Patch",
    ].join("\n");
    const r = reconstructApplyPatch({ patchText: patch }, root);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.writes[0]?.movePath).toBe(path.join(root, "docs", "renamed.md"));
      expect(r.writes[0]?.content).toBe("内容\n");
    }
  });

  test("Delete の対象ファイルは内容を確認せず拒否しない（削除は検査対象外）", () => {
    const root = makeProject({ "docs/gone.md": "内容\n" });
    const patch = "*** Begin Patch\n*** Delete File: docs/gone.md\n*** End Patch";
    const r = reconstructApplyPatch({ patchText: patch }, root);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.writes[0]?.kind).toBe("delete");
  });

  test("更新対象の読込失敗・引数不正は再構成不能", () => {
    const root = makeProject();
    const patch = "*** Begin Patch\n*** Update File: docs/missing.md\n@@\n*** End Patch";
    expect(reconstructApplyPatch({ patchText: patch }, root).ok).toBe(false);
    expect(reconstructApplyPatch({}, root).ok).toBe(false);
    expect(reconstructApplyPatch({ patchText: "bad" }, root).ok).toBe(false);
  });
});
