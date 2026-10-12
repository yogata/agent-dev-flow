import { describe, expect, test } from "bun:test";
import { checkHandoff, REQUIRED_SECTIONS } from "../lib/handoff.ts";

const COMPLETE_HANDOFF = `# 外部検討の持出し

## 目的

検討テーマの具体化を進めるための外部意見を得る。

## 問い

テーマAを分割する場合、判断材料として何を先に確定すべきか。

## 前提

現行の正規成果物として REQ-110 の範囲契約が有効である。

## 参照元

docs/designs/workflows/ の工程駆動コラボレーションモデル設計。
`;

describe("持出し文書の構成検証", () => {
  test("必須4要素が揃った持出し文書は complete で result ok になる", () => {
    const result = checkHandoff(COMPLETE_HANDOFF);
    expect(result.complete).toBe(true);
    expect(result.result).toBe("ok");
    expect(result.sections).toEqual(REQUIRED_SECTIONS);
  });

  test("必須要素が欠けた持出し文書は欠落を報告する", () => {
    const text = `## 目的\n\n目的のみの文書です。\n`;
    const result = checkHandoff(text);
    expect(result.complete).toBe(false);
    expect(result.missing.length).toBe(3);
    expect(result.findings.filter((finding) => finding.kind === "missing-section").length).toBe(3);
  });
});

describe("既知の機密指定情報の混入検出", () => {
  test("認証値トークンの混入を検出し行位置を報告する", () => {
    const text = `## 目的\n\n外部意見を得る。\n\n## 問い\n\n分割の判断材料は何か。\n\n## 前提\n\n認証は設定済み ghp_ABCDEFGHIJKLMNOPQRST1234 である。\n\n## 参照元\n\ndocs/guides/。\n`;
    const result = checkHandoff(text);
    expect(result.result).toBe("findings");
    const secretFinding = result.findings.find((finding) => finding.kind === "secret-pattern");
    expect(secretFinding).toBeDefined();
    expect(secretFinding?.line).toBe(11);
  });

  test("認証値の代入形を検出する", () => {
    const text = `## 目的\n\n外部意見を得る。\n\n## 問い\n\n何か。\n\n## 前提\n\napi_key = abc123secret を使う。\n\n## 参照元\n\ndocs/。\n`;
    const result = checkHandoff(text);
    expect(result.result).toBe("findings");
    expect(result.findings.some((finding) => finding.detail.includes("認証値の代入形"))).toBe(true);
  });

  test("既知の認証環境変数名の参照を検出する", () => {
    const text = `## 目的\n\n外部意見を得る。\n\n## 問い\n\n何か。\n\n## 前提\n\nCLOUDFLARE_API_TOKEN を使う。\n\n## 参照元\n\ndocs/。\n`;
    const result = checkHandoff(text);
    expect(result.result).toBe("findings");
    expect(result.findings.some((finding) => finding.detail.includes("認証環境変数"))).toBe(true);
  });

  test("機密を含まない通常の持出し文書は findings 0 件になる", () => {
    const result = checkHandoff(COMPLETE_HANDOFF);
    expect(result.findings.filter((finding) => finding.kind === "secret-pattern").length).toBe(0);
  });
});

describe("送信しない契約の構造的保証", () => {
  test("検証結果の JSON に送出先・送信操作を示すフィールドが存在しない", () => {
    const result = checkHandoff(COMPLETE_HANDOFF);
    const keys = Object.keys(result);
    expect(keys).toEqual(["complete", "missing", "findings", "result", "sections"]);
    expect(JSON.stringify(result).includes("send")).toBe(false);
    expect(JSON.stringify(result).includes("deliver")).toBe(false);
  });
});

describe("決定性", () => {
  test("同一入力から同一 JSON を返す", () => {
    expect(checkHandoff(COMPLETE_HANDOFF)).toEqual(checkHandoff(COMPLETE_HANDOFF));
  });
});
