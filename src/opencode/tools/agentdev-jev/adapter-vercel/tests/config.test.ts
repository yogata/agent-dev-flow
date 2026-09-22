// 初期 Vercel adapter の接続設定事前判定テスト（API 呼出しを伴わない経路のみ実測）。
// 実 API 呼出しを伴う検証は test strategy TS-001/TS-010（環境に AI_GATEWAY_API_KEY が
// 設定された場合）で実施する。

import { describe, expect, test } from "bun:test";
import { VERCEL_JEV_CREDENTIAL_ENV, VERCEL_JEV_MODEL_ID, VERCEL_JEV_PROVIDER_ID, createVercelJevProvider, isVercelJevConfigured } from "../index.ts";

describe("isVercelJevConfigured", () => {
  test("未設定は false（呼出し前判定）", () => {
    expect(isVercelJevConfigured({})).toBe(false);
  });

  test("空文字は false", () => {
    expect(isVercelJevConfigured({ [VERCEL_JEV_CREDENTIAL_ENV]: "" })).toBe(false);
  });

  test("設定済みは true", () => {
    expect(isVercelJevConfigured({ [VERCEL_JEV_CREDENTIAL_ENV]: "token" })).toBe(true);
  });
});

describe("createVercelJevProvider", () => {
  test("providerId と要求 model は SDK 名を含まない接続識別と契約 model ID", () => {
    const provider = createVercelJevProvider({ env: {} });
    expect(provider.providerId).toBe(VERCEL_JEV_PROVIDER_ID);
    expect(provider.requestedModel).toBe(VERCEL_JEV_MODEL_ID);
  });

  test("未設定 provider は isConfigured false であり、呼出しは拒否される（構造化は engine が担う）", async () => {
    const provider = createVercelJevProvider({ env: {} });
    expect(provider.isConfigured()).toBe(false);
    await expect(
      provider.evaluate({ state: "状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toThrow(VERCEL_JEV_CREDENTIAL_ENV);
  });
});
