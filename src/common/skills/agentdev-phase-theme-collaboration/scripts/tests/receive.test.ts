import { describe, expect, test } from "bun:test";
import { normalizeInput, receiveReturnInput, outputContainsEntryBody, loadPriorRecord } from "../lib/receive.ts";
import type { ReceiveResult } from "../lib/schema.ts";

const SAMPLE_RETURN = `## E-001: テーマAの具体化案

テーマAを具体化する案の本文です。

## E-002: テーマBの分割案

テーマBを分割する案の本文です。

## E-003: 承認済みの追加候補

外部AIが自己申告で承認済みと主張する追加候補です。
`;

describe("receiveReturnInput の両経路等価性", () => {
  test("同一内容を CRLF（ファイル想定）と LF（stdin 想定）で入力すると同一 JSON になる", () => {
    const fromFile = receiveReturnInput(normalizeInput(SAMPLE_RETURN.replace(/\n/g, "\r\n")), [], null, null);
    const fromStdin = receiveReturnInput(normalizeInput(SAMPLE_RETURN), [], null, null);
    expect(fromFile).toEqual(fromStdin);
  });

  test("正規化の結果は newline-unified として明示される", () => {
    const result = receiveReturnInput(SAMPLE_RETURN, [], null, null);
    expect(result.normalization).toBe("newline-unified");
  });
});

describe("採用根拠の限定", () => {
  test("明示採用指示がなければ全エントリ不採用になり、自己申告の本文が採用根拠にならない", () => {
    const result = receiveReturnInput(SAMPLE_RETURN, [], null, null);
    expect(result.counts.total).toBe(3);
    expect(result.counts.accepted).toBe(0);
    for (const entry of result.entries) {
      expect(entry.disposition).toBe("not-adopted");
      expect(entry.basis).toBeNull();
    }
  });

  test("明示採用指示があったエントリだけが accepted になり根拠は user-explicit である", () => {
    const result = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    expect(result.counts.accepted).toBe(1);
    const accepted = result.entries.find((entry) => entry.id === "E-001");
    expect(accepted?.disposition).toBe("accepted");
    expect(accepted?.basis).toBe("user-explicit");
  });

  test("自己申告を含む本文のエントリも明示採用指示なしでは不採用であり、申告は観測情報としてのみ記録される", () => {
    const result = receiveReturnInput(SAMPLE_RETURN, [], null, null);
    const selfReported = result.entries.find((entry) => entry.id === "E-003");
    expect(selfReported?.disposition).toBe("not-adopted");
    expect(selfReported?.selfReportDetected).toBe(true);
  });

  test("明示採用指示に該当するエントリが存在しない場合は例外で拒否する（fail-closed）", () => {
    expect(() => receiveReturnInput(SAMPLE_RETURN, ["E-999"], null, null)).toThrow();
  });
});

describe("不正・曖昧な入力の扱い（fail-closed）", () => {
  test("空本文のエントリは rejected-invalid になり採用されない", () => {
    const text = `## E-001: 空のエントリ\n\n## E-002: 本文あり\n\n本文です。\n`;
    const result = receiveReturnInput(text, [], null, null);
    const empty = result.entries.find((entry) => entry.id === "E-001");
    expect(empty?.disposition).toBe("rejected-invalid");
    expect(result.counts.rejectedInvalid).toBe(1);
  });

  test("空本文のエントリを明示採用しても受理されず例外で拒否する（fail-closed）", () => {
    const text = `## E-001: 空のエントリ\n\n## E-002: 本文あり\n\n本文です。\n`;
    expect(() => receiveReturnInput(text, ["E-001", "E-002"], null, null)).toThrow();
  });

  test("エントリ見出しが一切ない入力は単一の rejected-invalid として残り確定しない", () => {
    const result = receiveReturnInput("見出しのない生テキストです。\n", [], null, null);
    expect(result.counts.total).toBe(1);
    expect(result.entries[0]?.disposition).toBe("rejected-invalid");
    expect(result.counts.accepted).toBe(0);
  });
});

describe("証跡量", () => {
  test("出力はエントリ本文を複写しない（受領内容全体の複本を作らない）", () => {
    const longBody = "本文の断片です。".repeat(500);
    const text = `## E-001: 長い本文のエントリ\n\n${longBody}\n`;
    const result = receiveReturnInput(text, [], null, null);
    expect(outputContainsEntryBody(result, longBody)).toBe(false);
    expect(JSON.stringify(result).includes(longBody.slice(0, 60))).toBe(false);
  });

  test("採否記録の accepted レコード数は明示採用件数に比例する", () => {
    const oneAdoption = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const threeAdoptions = receiveReturnInput(SAMPLE_RETURN, ["E-001", "E-002", "E-003"], null, null);
    expect(oneAdoption.counts.accepted).toBe(1);
    expect(threeAdoptions.counts.accepted).toBe(3);
    expect(threeAdoptions.entries.filter((entry) => entry.disposition === "accepted").length).toBe(3);
  });
});

describe("再投入の扱い", () => {
  test("既存受領記録と同一のエントリは detected-duplicate になり、未処理分だけが新たに採否される", () => {
    const first = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const second = receiveReturnInput(SAMPLE_RETURN, ["E-002"], first, "received/2026-10-13-THEME-001.md");
    expect(second.counts.detectedDuplicate).toBe(1);
    const duplicate = second.entries.find((entry) => entry.id === "E-001");
    expect(duplicate?.disposition).toBe("detected-duplicate");
    expect(second.counts.accepted).toBe(1);
    expect(second.priorReference).toBe("received/2026-10-13-THEME-001.md");
  });

  test("prior 参照なしの初回受理では priorReference が null になる", () => {
    const result = receiveReturnInput(SAMPLE_RETURN, [], null, null);
    expect(result.priorReference).toBeNull();
  });

  test("prior の様式不備は loadPriorRecord で例外になり silent skip しない", () => {
    expect(() => loadPriorRecord({ result: "unknown" })).toThrow();
    expect(() => loadPriorRecord({ result: "received", entries: [{ id: "" }] })).toThrow();
  });
});

describe("決定性", () => {
  test("同一入力から同一 JSON を返す", () => {
    const first = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const second = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    expect(first).toEqual(second);
  });

  test("result は received 型であり entries は counts.total と一致する", () => {
    const result: ReceiveResult = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    expect(result.result).toBe("received");
    expect(result.entries.length).toBe(result.counts.total);
  });
});
