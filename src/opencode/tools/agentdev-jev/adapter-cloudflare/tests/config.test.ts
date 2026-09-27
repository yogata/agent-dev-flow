// Cloudflare adapter の接続設定事前判定と接続契約テスト（API 呼出しを伴わない経路のみ実測）。
// request 構成（endpoint /ai/run、model typesafe/jev、Bearer CLOUDFLARE_API_TOKEN、
// account CLOUDFLARE_ACCOUNT_ID、Gateway ID 非要求）は request.test.ts が fetch double で実測する。

import { describe, expect, test } from "bun:test";
import {
  CLOUDFLARE_JEV_ACCOUNT_ENV,
  CLOUDFLARE_JEV_MODEL_ID,
  CLOUDFLARE_JEV_PROVIDER_ID,
  CLOUDFLARE_JEV_TOKEN_ENV,
  createCloudflareJevProvider,
  isCloudflareJevConfigured,
} from "../index.ts";

describe("isCloudflareJevConfigured", () => {
  test("両方未設定は false（呼出し前判定）", () => {
    expect(isCloudflareJevConfigured({})).toBe(false);
  });

  test("片方のみの設定は false", () => {
    expect(isCloudflareJevConfigured({ [CLOUDFLARE_JEV_ACCOUNT_ENV]: "acct" })).toBe(false);
    expect(isCloudflareJevConfigured({ [CLOUDFLARE_JEV_TOKEN_ENV]: "token" })).toBe(false);
  });

  test("空文字は false", () => {
    expect(isCloudflareJevConfigured({ [CLOUDFLARE_JEV_ACCOUNT_ENV]: "", [CLOUDFLARE_JEV_TOKEN_ENV]: "" })).toBe(false);
  });

  test("両方設定済みは true", () => {
    expect(isCloudflareJevConfigured({ [CLOUDFLARE_JEV_ACCOUNT_ENV]: "acct", [CLOUDFLARE_JEV_TOKEN_ENV]: "token" })).toBe(true);
  });

  test("Gateway ID は設定契約に含まれない（credential 環境変数は2つのみ）", () => {
    // REQ-090-001/021: default AI Gateway を利用し、Gateway ID を ADF の設定契約として持たない。
    expect(CLOUDFLARE_JEV_ACCOUNT_ENV).toBe("CLOUDFLARE_ACCOUNT_ID");
    expect(CLOUDFLARE_JEV_TOKEN_ENV).toBe("CLOUDFLARE_API_TOKEN");
  });
});

describe("createCloudflareJevProvider", () => {
  test("providerId と要求 model は接続契約の識別と model ID", () => {
    const provider = createCloudflareJevProvider({
      env: { [CLOUDFLARE_JEV_ACCOUNT_ENV]: "acct", [CLOUDFLARE_JEV_TOKEN_ENV]: "token" },
    });
    expect(provider.providerId).toBe(CLOUDFLARE_JEV_PROVIDER_ID);
    expect(provider.providerId).toBe("cloudflare-ai-gateway");
    expect(provider.requestedModel).toBe(CLOUDFLARE_JEV_MODEL_ID);
    expect(provider.requestedModel).toBe("typesafe/jev");
  });

  test("未設定 provider は isConfigured false であり、呼出しは拒否される（構造化は engine が担う）", async () => {
    const provider = createCloudflareJevProvider({ env: {} });
    expect(provider.isConfigured()).toBe(false);
    await expect(
      provider.evaluate({ state: "状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toThrow("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN are not set");
  });

  test("未設定環境では外部 API を呼ばず拒否する（fetch double で確認。TS-002）", async () => {
    let fetchCalls = 0;
    const provider = createCloudflareJevProvider({
      env: {},
      fetchImpl: async () => {
        fetchCalls += 1;
        throw new Error("fetch must not be called when credentials are unset");
      },
    });
    await expect(
      provider.evaluate({ state: "状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toThrow("are not set");
    expect(fetchCalls).toBe(0);
  });
});
