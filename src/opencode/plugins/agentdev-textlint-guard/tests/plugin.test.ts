// ADF-COVERS(verification): REQ-053-025, REQ-053-026, REQ-053-027, REQ-053-028, REQ-053-029, REQ-053-030
// ADF-COVERS(verification): REQ-052-002, REQ-052-004
//
// TS-004: pre-write Plugin の検査契約。
// - write の新規と更新、edit、複数ファイル apply_patch の正常と違反
// - tool 入力不正、読込失敗、再構成不能とルート外パス
// - 違反または検査不能時に対象ディスクの内容が変わらない
// - 複数ファイル操作全体が拒否される
// - 設定不正は対象外ファイルへの操作も含めて拒否し、修復後の次回操作から反映する
// - 結果に位置、rule、該当箇所と利用可能な修正情報がある

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache, configPathFor } from "../lib/config.ts";
import {
  GUARDED_TOOLS,
  GuardBlockError,
  guardOperation,
  makeGuardHooks,
  default as pluginModule,
} from "../plugin.ts";

const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";
const VIOLATING = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-plg-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  return root;
}

function readSafe(abs: string): string | null {
  try {
    return fs.readFileSync(abs, "utf8");
  } catch {
    return null;
  }
}

beforeEach(() => {
  invalidateConfigCache();
});

async function expectBlocked(tool: string, args: Record<string, unknown>, root: string): Promise<string> {
  const detail = await guardOperation(tool, args, root);
  expect(detail).not.toBeNull();
  return detail ?? "";
}

describe("write（新規と更新）", () => {
  test("正常な新規作成は許可され、拒否時はディスクが変わらない", async () => {
    const root = makeProject({ "docs/keep.md": CLEAN });
    const target = path.join(root, "docs", "new.md");

    expect(await guardOperation("write", { filePath: target, content: CLEAN }, root)).toBeNull();
    // ディスク未変更はフックが許可しても tool 前提（フックは書かない）
    expect(readSafe(target)).toBeNull();

    const detail = await expectBlocked("write", { filePath: target, content: VIOLATING }, root);
    expect(detail).toContain("rejected");
    expect(readSafe(target)).toBeNull();
    expect(readSafe(path.join(root, "docs", "keep.md"))).toBe(CLEAN);
  });

  test("違反する更新は拒否され、既存内容が変わらない", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const before = readSafe(path.join(root, "docs", "a.md"));
    const detail = await expectBlocked("write", { filePath: path.join(root, "docs", "a.md"), content: VIOLATING }, root);
    expect(detail).toContain("rejected");
    expect(detail).toContain("docs/a.md:3:");
    expect(readSafe(path.join(root, "docs", "a.md"))).toBe(before);
  });

  test("対象外ファイルへの書込みは一般文章検査を適用せず許可する", async () => {
    const root = makeProject();
    const src = path.join(root, "src", "main.ts");
    expect(await guardOperation("write", { filePath: src, content: "export const x = 1;\n" }, root)).toBeNull();
    // docs 直下の .md 以外（例: .txt）も対象外
    const txt = path.join(root, "docs", "note.txt");
    expect(await guardOperation("write", { filePath: txt, content: "\uFF71\uFF72\uFF73" }, root)).toBeNull();
  });

  test("tool 入力不正は拒否する（fail-closed）", async () => {
    const root = makeProject();
    await expectBlocked("write", { content: "x" }, root);
    await expectBlocked("write", { filePath: path.join(root, "docs", "a.md") }, root);
    await expectBlocked("write", { filePath: path.join(root, "docs", "a.md"), content: 123 }, root);
  });

  test("ルート外パスは安全に分類できないため拒否する", async () => {
    const root = makeProject();
    const outside = path.join(os.tmpdir(), `adftl-outside-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
    const detail = await expectBlocked("write", { filePath: outside, content: CLEAN }, root);
    expect(detail).toContain("outside the project root");
    expect(fs.existsSync(outside)).toBe(false);
  });
});

describe("edit", () => {
  test("違反内容への置換は拒否され、ディスクが変わらない", async () => {
    const root = makeProject({ "docs/a.md": "# 見出し\n\n正常文。\n" });
    const before = readSafe(path.join(root, "docs", "a.md"));
    await expectBlocked(
      "edit",
      { filePath: path.join(root, "docs", "a.md"), oldString: "正常文。", newString: "半角カナ\uFF71混入。" },
      root,
    );
    expect(readSafe(path.join(root, "docs", "a.md"))).toBe(before);
  });

  test("正常な置換は許可する", async () => {
    const root = makeProject({ "docs/a.md": "# 見出し\n\n古い文。\n" });
    expect(
      await guardOperation(
        "edit",
        { filePath: path.join(root, "docs", "a.md"), oldString: "古い文。", newString: "新しい文。" },
        root,
      ),
    ).toBeNull();
  });

  test("再構成不能（oldString 不在）は拒否する", async () => {
    const root = makeProject({ "docs/a.md": "# 見出し\n\n本文。\n" });
    const detail = await expectBlocked(
      "edit",
      { filePath: path.join(root, "docs", "a.md"), oldString: "不在", newString: "新文。" },
      root,
    );
    expect(detail).toContain("cannot verify edit");
  });
});

describe("apply_patch（複数ファイル）", () => {
  test("1件でも違反があれば操作全体を拒否し、全対象ディスクが変わらない", async () => {
    const root = makeProject({ "docs/a.md": "# A\n\n正常。\n", "docs/b.md": "# B\n\n正常。\n" });
    const beforeA = readSafe(path.join(root, "docs", "a.md"));
    const beforeB = readSafe(path.join(root, "docs", "b.md"));
    const addedLines = VIOLATING.split("\n").map((l) => `+${l}`).join("\n");
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/a.md",
      "@@",
      " # A",
      "*** Add File: docs/c.md",
      addedLines,
      "*** End Patch",
    ].join("\n");
    const detail = await expectBlocked("apply_patch", { patchText: patch }, root);
    expect(detail).toContain("rejected");
    expect(readSafe(path.join(root, "docs", "a.md"))).toBe(beforeA);
    expect(readSafe(path.join(root, "docs", "b.md"))).toBe(beforeB);
    expect(fs.existsSync(path.join(root, "docs", "c.md"))).toBe(false);
  });

  test("全対象が正常なら許可する（対象外ファイルを含む場合も通す）", async () => {
    const root = makeProject({ "docs/a.md": "# A\n\n正常。\n", "src/s.ts": "export {}\n" });
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/a.md",
      "@@",
      " # A",
      "*** Update File: src/s.ts",
      "@@",
      " export {}",
      "*** End Patch",
    ].join("\n");
    expect(await guardOperation("apply_patch", { patchText: patch }, root)).toBeNull();
  });

  test("move は変更先パスの対象判定と完成予定内容を検査する", async () => {
    const root = makeProject({ "docs/old.md": "# 旧\n\n正常文。\n" });
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/old.md",
      "*** Move to: docs/renamed.md",
      "@@",
      " # 旧",
      "*** End Patch",
    ].join("\n");
    expect(await guardOperation("apply_patch", { patchText: patch }, root)).toBeNull();

    const violatingPatch = [
      "*** Begin Patch",
      "*** Update File: docs/old.md",
      "*** Move to: docs/renamed2.md",
      "@@",
      " # 旧",
      "*** End Patch",
    ].join("\n");
    // move 先は docs 配下のため検査対象。内容は現行ファイル全文（違反なし）。
    expect(await guardOperation("apply_patch", { patchText: violatingPatch }, root)).toBeNull();
  });

  test("不正パッチ（マーカー欠落）は拒否する", async () => {
    const root = makeProject();
    await expectBlocked("apply_patch", { patchText: "not a patch" }, root);
    await expectBlocked("apply_patch", {}, root);
  });
});

describe("設定の fail-closed と再読込み", () => {
  test("不正な設定は対象外ファイルへの操作も含めて拒否する", async () => {
    const root = makeProject();
    const configAbs = configPathFor(root);
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 3\n", "utf8");
    // docs 対象
    await expectBlocked("write", { filePath: path.join(root, "docs", "a.md"), content: CLEAN }, root);
    // 対象外ファイル
    const detail = await expectBlocked("write", { filePath: path.join(root, "src", "main.ts"), content: "x" }, root);
    expect(detail).toContain("config is uninterpretable");
    expect(detail).toContain("external editor");
    expect(fs.readFileSync(configAbs, "utf8")).toBe("version: 3\n");
  });

  test("修復後の次回操作から再起動なしに反映する", async () => {
    const root = makeProject();
    const configAbs = configPathFor(root);
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 3\n", "utf8");
    await expectBlocked("write", { filePath: path.join(root, "docs", "a.md"), content: CLEAN }, root);
    fs.writeFileSync(configAbs, "version: 1\nadditional_targets: []\n", "utf8");
    expect(await guardOperation("write", { filePath: path.join(root, "docs", "a.md"), content: CLEAN }, root)).toBeNull();
  });

  test("additional_targets で追加した対象も検査する（加算は標準対象を無効化しない）", async () => {
    const root = makeProject();
    const configAbs = configPathFor(root);
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 1\nadditional_targets:\n  - notes/**/*.md\n", "utf8");
    // 追加対象への違反書込みは拒否
    await expectBlocked("write", { filePath: path.join(root, "notes", "n.md"), content: VIOLATING }, root);
    // 標準対象も引き続き検査する
    await expectBlocked("write", { filePath: path.join(root, "docs", "d.md"), content: VIOLATING }, root);
    // 対象外は従来どおり許可
    expect(await guardOperation("write", { filePath: path.join(root, "other", "o.md"), content: VIOLATING }, root)).toBeNull();
  });
});

describe("hooks 配線（OpenCode 契約形状）", () => {
  test("tool.execute.before フックは write/edit/apply_patch だけを検査する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const hooks = makeGuardHooks(root);
    const before = hooks["tool.execute.before"];
    expect(before).toBeDefined();
    if (before === undefined) return;
    // 対象外 tool は素通り
    await before({ tool: "read", sessionID: "s", callID: "c" }, { args: { filePath: path.join(root, "docs", "a.md") } });
    await before({ tool: "bash", sessionID: "s", callID: "c" }, { args: { command: "echo hi" } });
    // 違反 write は GuardBlockError
    let threw = false;
    try {
      await before({ tool: "write", sessionID: "s", callID: "c" }, { args: { filePath: path.join(root, "docs", "a.md"), content: VIOLATING } });
    } catch (e) {
      threw = e instanceof GuardBlockError;
    }
    expect(threw).toBe(true);
  });

  test("server は PluginInput からプロジェクトルートを解決する（worktree 第一）", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const hooks = (await pluginModule.server({ worktree: root, directory: "C:/somewhere-else" })) as {
      "tool.execute.before"?: (i: { tool: string; sessionID: string; callID: string }, o: { args: Record<string, unknown> }) => Promise<void>;
    };
    const before = hooks["tool.execute.before"];
    expect(before).toBeDefined();
    if (before === undefined) return;
    let threw = false;
    try {
      await before({ tool: "write", sessionID: "s", callID: "c" }, { args: { filePath: path.join(root, "docs", "a.md"), content: VIOLATING } });
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });

  test("server は worktree 未解決の初期化入力で fail-closed フックを返す", async () => {
    const hooks = (await pluginModule.server({})) as {
      "tool.execute.before"?: (i: { tool: string; sessionID: string; callID: string }, o: { args: Record<string, unknown> }) => Promise<void>;
    };
    const before = hooks["tool.execute.before"];
    expect(before).toBeDefined();
    if (before === undefined) return;
    let message = "";
    try {
      await before({ tool: "write", sessionID: "s", callID: "c" }, { args: { filePath: "C:/x/a.md", content: "x" } });
    } catch (e) {
      message = e instanceof Error ? e.message : String(e);
    }
    expect(message).toContain("cannot resolve the project root");
  });

  test("GUARDED_TOOLS は現行 OpenCode tool 名（write/edit/apply_patch）", () => {
    expect(GUARDED_TOOLS).toEqual(["write", "edit", "apply_patch"]);
  });
});
