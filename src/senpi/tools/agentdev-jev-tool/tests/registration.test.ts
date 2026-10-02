//
// Senpi 向け agentdev_jev 登録単位のテスト。
//
// 登録単位の構造（name/description/args/execute）、公開スキーマの正本参照
// （engine 公開スキーマと同一）、execute の引数・結果・実行 context 変換
// （worktree を engine へ引き渡し、credential 未設定相当は not_configured として
// 構造化失敗になる）を検証する。


import { describe, expect, test } from "bun:test";
import { createAgentdevJevSenpiRegistration } from "../registration.ts";
import type { SenpiToolContext } from "../../tool-registration.ts";
import { AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA } from "../../../../common/tools/agentdev-jev/public-schema.ts";
import type { JevProvider } from "../../../../common/tools/agentdev-jev/provider.ts";

function makeContext(worktree: string): SenpiToolContext {
  return { worktree };
}

describe("登録単位の構造", () => {
  test("registration は name/description/args/execute を持ち、公開名は agentdev_jev である", () => {
    const registration = createAgentdevJevSenpiRegistration();
    expect(registration.name).toBe("agentdev_jev");
    expect(typeof registration.description).toBe("string");
    expect(registration.description.length).toBeGreaterThan(0);
    expect(registration.description).toContain("not_configured");
    expect(Object.keys(registration.args)).toEqual(["request"]);
    expect(typeof registration.execute).toBe("function");
  });

  test("args.request は engine 公開スキーマと同一の正本参照である", () => {
    const registration = createAgentdevJevSenpiRegistration();
    expect(registration.args.request).toBe(AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA);
    const schema = registration.args.request as typeof AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA;
    expect(schema.properties.operation.enum).toContain("evaluate");
    expect(schema.properties.operation.enum).toContain("observation_write");
  });
});

describe("execute の引数・結果・実行 context 変換", () => {
  test("credential 未解決（resolveProvider null）時は not_configured で構造化失敗する", async () => {
    const registration = createAgentdevJevSenpiRegistration({
      resolveProvider: (): JevProvider | null => null,
    });
    const result = await registration.execute(
      {
        request: {
          operation: "evaluate",
          state: "判断対象",
          instructions: "指示",
          questions: [{ id: "q1", form: "boolean", prompt: "判断基準を満たすか" }],
          observationMetadata: { workflow: "wf", evaluationKind: "k", subject: "対象", sourceRevision: "rev1" },
        },
      },
      makeContext("C:/w"),
    );
    expect(result.metadata?.ok).toBe(false);
    expect(result.metadata?.operation).toBe("evaluate");
    const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("not_configured");
  });

  test("invalid な要求は操作契約の invalid-input として構造化失敗する", async () => {
    const registration = createAgentdevJevSenpiRegistration();
    const result = await registration.execute(
      { request: { operation: "evaluate" } },
      makeContext("C:/w"),
    );
    expect(result.metadata?.ok).toBe(false);
    const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("invalid_input");
  });
});
