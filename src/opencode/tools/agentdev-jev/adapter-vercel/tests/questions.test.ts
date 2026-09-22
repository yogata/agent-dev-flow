// 質問形式（boolean/choice/score）の gateway 送信前 criteria マッピングの単体テスト。
// 評価 SDK（ai.experimental_evaluate）を mock.module で差し替え、adapter が構築する
// questions を観測する（実 API 呼出しは行わない。実 gateway 検証は TS-003 で実施）。

import { describe, expect, mock, test } from "bun:test";

const evaluateInputs: Array<{ questions: Record<string, unknown> }> = [];

mock.module("ai", () => ({
  experimental_evaluate: async (input: { questions: Record<string, unknown> }) => {
    evaluateInputs.push(input);
    return {
      answers: {},
      usage: undefined,
      response: undefined,
      providerMetadata: undefined,
    };
  },
}));

const { VERCEL_JEV_CREDENTIAL_ENV, createVercelJevProvider } = await import("../index.ts");

describe("質問形式の criteria マッピング", () => {
  test("boolean 形式は type と instructions を送信する", async () => {
    const provider = createVercelJevProvider({ env: { [VERCEL_JEV_CREDENTIAL_ENV]: "token" } });
    await provider.evaluate({
      state: "判断対象の状態",
      questions: [{ id: "q1", form: "boolean", prompt: "契約は妥当か" }],
    });
    expect(evaluateInputs.length).toBe(1);
    const sent = evaluateInputs[0]?.questions ?? {};
    expect(Object.keys(sent)).toEqual(["q1"]);
    expect(sent["q1"]).toEqual({ type: "boolean", instructions: "契約は妥当か" });
  });

  test("choice 形式は候補ラベルを criteria キーとする候補マップで送信する", async () => {
    const provider = createVercelJevProvider({ env: { [VERCEL_JEV_CREDENTIAL_ENV]: "token" } });
    await provider.evaluate({
      state: "判断対象の状態",
      questions: [{ id: "c1", form: "choice", prompt: "どの案か", options: ["案A", "案B", "案C"] }],
    });
    const sent = evaluateInputs.at(-1)?.questions ?? {};
    expect(sent["c1"]).toEqual({
      type: "choice",
      instructions: "どの案か",
      criteria: { 案A: null, 案B: null, 案C: null },
    });
  });

  test("score 形式は scale 水準ラベルの空でない文字列配列を criteria として送信する（null を含まない）", async () => {
    const provider = createVercelJevProvider({ env: { [VERCEL_JEV_CREDENTIAL_ENV]: "token" } });
    await provider.evaluate({
      state: "判断対象の状態",
      questions: [{ id: "s1", form: "score", prompt: "どの水準か", scale: ["低", "中", "高"] }],
    });
    const sent = evaluateInputs.at(-1)?.questions ?? {};
    const question = sent["s1"] as { type?: unknown; instructions?: unknown; criteria?: unknown };
    expect(question.type).toBe("score");
    expect(question.instructions).toBe("どの水準か");
    const criteria = question.criteria;
    expect(Array.isArray(criteria)).toBe(true);
    const levels = criteria as unknown[];
    expect(levels.length).toBeGreaterThanOrEqual(2);
    expect(levels).toEqual(["低", "中", "高"]);
    for (const level of levels) {
      expect(level).not.toBeNull();
      expect(typeof level).toBe("string");
      expect((level as string).length).toBeGreaterThan(0);
    }
  });
});
