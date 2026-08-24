// Plugin フックの fail-closed 異常系テスト（TS 相当: 強制機能の fail-closed）。
//
// 設定解釈不能・強制処理異常終了・必須検証未了の各異常系を意図的に発生させ、
// 対象副作用（コマンド実行）が成功扱いにならない（フックが throw して block する）
// ことを検証する。パス解決不能系は Tool（agentdev-gh engine）側のテストが担保する。


import { describe, expect, test } from "bun:test";
import { detectGhWriteCommand } from "../lib/gh-command-detector.ts";
import {
  GUARD_CONFIG_ENV,
  interpretGuardConfig,
  interpretGuardConfigFromEnv,
} from "../lib/guard-config.ts";
import {
  GuardBlockError,
  makeGuardHooks,
  type DetectFn,
} from "../plugin.ts";

function hookInput(tool: string) {
  return { tool, sessionID: "s", callID: "c" };
}

function hookOutput(command: unknown) {
  return { args: { command } };
}

async function expectBlock(hooks: ReturnType<typeof makeGuardHooks>, tool: string, command: unknown): Promise<string> {
  const promise = hooks["tool.execute.before"]?.(hookInput(tool), hookOutput(command));
  await expect(promise).rejects.toThrow(GuardBlockError);
  try {
    await promise;
    throw new Error("unreachable");
  } catch (e) {
    return e instanceof GuardBlockError ? e.message : "";
  }
}

async function expectPass(hooks: ReturnType<typeof makeGuardHooks>, tool: string, command: unknown): Promise<void> {
  await hooks["tool.execute.before"]?.(hookInput(tool), hookOutput(command));
}

const okConfig = interpretGuardConfig(undefined);
if (!okConfig.ok) throw new Error("default config must be valid");

describe("正常系: 検出と迂回防止", () => {
  test("生 gh WRITE を block する", async () => {
    const hooks = makeGuardHooks(detectGhWriteCommand, okConfig);
    const message = await expectBlock(hooks, "bash", "gh issue close 5");
    expect(message).toContain("agentdev-gh");
  });

  test("読み取り系 gh コマンドは素通りする", async () => {
    const hooks = makeGuardHooks(detectGhWriteCommand, okConfig);
    await expectPass(hooks, "bash", "gh issue view 5");
  });

  test("検査対象外ツール（write 等）は素通りする", async () => {
    const hooks = makeGuardHooks(detectGhWriteCommand, okConfig);
    await expectPass(hooks, "write", { filePath: "a", content: "gh issue close 5" });
    await expectPass(hooks, "edit", { command: "gh pr merge 7" });
  });
});

describe("異常系1: 設定を解釈できない（config-uninterpretable）", () => {
  test.each([
    ["不正 JSON", "not json {", "not valid JSON"],
    ["非オブジェクト", '"string-config"', "must be an object"],
    ["enforcedTools 型違反", JSON.stringify({ enforcedTools: "bash" }), "non-empty array"],
    ["enforcedTools 空", JSON.stringify({ enforcedTools: [] }), "non-empty array"],
    ["ツール名形式違反", JSON.stringify({ enforcedTools: ["Bad Name"] }), "tool names"],
  ])("%s は解釈失敗になる", (_label, raw, expectedDetailPart) => {
    const result = interpretGuardConfig(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain(expectedDetailPart);
  });

  test("設定解釈不能時は bash（既定検査対象）を block し、検査対象外は素通りする", async () => {
    const broken = interpretGuardConfig("not json {");
    expect(broken.ok).toBe(false);
    const hooks = makeGuardHooks(detectGhWriteCommand, broken);
    const message = await expectBlock(hooks, "bash", "echo hello");
    expect(message).toContain("uninterpretable");
    await expectPass(hooks, "write", { filePath: "a", content: "x" });
  });

  test("環境変数経由の設定解釈も失敗を伝える", () => {
    const result = interpretGuardConfigFromEnv({
      [GUARD_CONFIG_ENV]: "{invalid",
    });
    expect(result.ok).toBe(false);
  });

  test("環境変数がなければ既定設定（bash のみ）", () => {
    const result = interpretGuardConfigFromEnv({});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.enforcedTools).toEqual(["bash"]);
  });
});

describe("異常系2: 強制処理自体が異常終了した（enforcement-crashed）", () => {
  test("検出器が例外を投げた場合、block する", async () => {
    const crashingDetect: DetectFn = () => {
      throw new Error("detector bug");
    };
    const hooks = makeGuardHooks(crashingDetect, okConfig);
    const message = await expectBlock(hooks, "bash", "gh issue view 5");
    expect(message).toContain("detection crashed");
    expect(message).toContain("detector bug");
  });
});

describe("異常系3: 必須検証が完了できない（verification-incomplete）", () => {
  test("command 引数が文字列でない場合、block する", async () => {
    const hooks = makeGuardHooks(detectGhWriteCommand, okConfig);
    const message = await expectBlock(hooks, "bash", 12345);
    expect(message).toContain("cannot verify");
  });

  test("command 引数が欠落した場合、block する", async () => {
    const hooks = makeGuardHooks(detectGhWriteCommand, okConfig);
    const message = await expectBlock(hooks, "bash", undefined);
    expect(message).toContain("cannot verify");
  });

  test("command 引数が空文字列の場合、block する", async () => {
    const hooks = makeGuardHooks(detectGhWriteCommand, okConfig);
    await expectBlock(hooks, "bash", "");
  });
});
