import { describe, expect, test } from "bun:test";
import { normalizeInput, receiveReturnInput, outputContainsEntryBody, loadPriorRecord, digestBody } from "../lib/receive.ts";
import { resolveReceivedFileName, buildReceivedRecord } from "../lib/received-record.ts";
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

describe("複数受領の区別保存（REQ-110-026・1受領1ファイル契約）", () => {
  test("同日・同一テーマの2回目の受領は連番ファイル名で区別され、1回目の名前を変わらない", () => {
    const receivedAt = "2026-10-18T09:00:00.000Z";
    const first = resolveReceivedFileName([], receivedAt, "THEME-001");
    const second = resolveReceivedFileName([first], receivedAt, "THEME-001");
    expect(first).toBe("2026-10-18-THEME-001.md");
    expect(second).toBe("2026-10-18-THEME-001-2.md");
  });

  test("同日・同一テーマの3回受領で3つの記録名が互いに区別され、既存のどの名前も返さない（上書きしない）", () => {
    const receivedAt = "2026-10-18T09:00:00.000Z";
    const names: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const next = resolveReceivedFileName(names, receivedAt, "THEME-001");
      expect(names).not.toContain(next);
      names.push(next);
    }
    expect(new Set(names).size).toBe(3);
    expect(names).toEqual([
      "2026-10-18-THEME-001.md",
      "2026-10-18-THEME-001-2.md",
      "2026-10-18-THEME-001-3.md",
    ]);
  });

  test("同日・同一テーマで連続生成した受領記録は各受領ごとに別ファイルで、frontmatter の受領日時で互いに区別できる", () => {
    const names: string[] = [];
    const records = [
      buildReceivedRecord({
        receivedAt: "2026-10-18T09:00:00.000Z",
        theme: "THEME-001",
        purpose: "1回目の受領",
        provenance: "user-provided",
        adoptionBasis: null,
        body: "1回目の受領本文",
        existingFileNames: names,
      }),
      buildReceivedRecord({
        receivedAt: "2026-10-18T10:30:00.000Z",
        theme: "THEME-001",
        purpose: "2回目の受領",
        provenance: "user-provided",
        adoptionBasis: null,
        body: "2回目の受領本文",
        existingFileNames: [...names, "2026-10-18-THEME-001.md"],
      }),
    ];
    names.push(...records.map((record) => record.fileName));
    expect(new Set(names).size).toBe(2);
    expect(names[0]).not.toBe(names[1]);
    expect(records[0]?.content).toContain("receivedAt: 2026-10-18T09:00:00.000Z");
    expect(records[1]?.content).toContain("receivedAt: 2026-10-18T10:30:00.000Z");
  });

  test("ファイル名は受領日時から導出した日付とテーマ識別のみで決まり、入力本文の日付に影響されない", () => {
    const record = buildReceivedRecord({
      receivedAt: "2026-10-18T09:00:00.000Z",
      theme: "THEME-001",
      purpose: "入力本文に古い日付を含む受領",
      provenance: "user-provided",
      adoptionBasis: null,
      body: "この文書は 2020-01-01 に作成された外部資料に基づく。",
    });
    expect(record.fileName).toBe("2026-10-18-THEME-001.md");
    expect(record.content).toContain("receivedAt: 2026-10-18T09:00:00.000Z");
    expect(record.content).not.toContain("2026-10-18-THEME-001.md: 2020-01-01");
  });

  test("テーマ識別が空の受領はファイル名を決定できず例外で拒否する（fail-closed）", () => {
    expect(() => resolveReceivedFileName([], "2026-10-18T09:00:00.000Z", "  ")).toThrow();
  });
});

describe("再投入・内容変更の重複判定（REQ-110-027）", () => {
  test("(a) 同一入力の再投入: 確定済みエントリは重複として扱われ、既存の採用は失われない", () => {
    const first = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const second = receiveReturnInput(SAMPLE_RETURN, ["E-002"], first, "received/2026-10-18-THEME-001.md");
    expect(second.counts.detectedDuplicate).toBe(1);
    expect(second.entries.find((entry) => entry.id === "E-001")?.disposition).toBe("detected-duplicate");
    expect(second.entries.find((entry) => entry.id === "E-002")?.disposition).toBe("accepted");
    const firstAdoption = first.entries.find((entry) => entry.id === "E-001");
    expect(firstAdoption?.disposition).toBe("accepted");
    expect(firstAdoption?.basis).toBe("user-explicit");
  });

  test("(b) 同識別子・同表題で本文が相違する入力は同一と断定せず、新たな受理・採否の対象になる", () => {
    const first = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const modified = `## E-001: テーマAの具体化案\n\nテーマAを具体化する案の本文を修正した。判断材料が変わったため再確認を求める。\n`;
    const second = receiveReturnInput(modified, ["E-001"], first, "received/2026-10-18-THEME-001.md");
    const entry = second.entries.find((item) => item.id === "E-001");
    expect(entry?.disposition).toBe("accepted");
    expect(entry?.updatedFromPrior).toBe(true);
    expect(second.counts.detectedDuplicate).toBe(0);
  });

  test("(b) 本文相違を明示採用しない場合は不採用として残り、確定済み事実を失わせない", () => {
    const first = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const modified = `## E-001: テーマAの具体化案\n\n本文を変更した版。採用指示は今回ない。\n`;
    const second = receiveReturnInput(modified, [], first, "received/2026-10-18-THEME-001.md");
    const entry = second.entries.find((item) => item.id === "E-001");
    expect(entry?.disposition).toBe("not-adopted");
    expect(entry?.updatedFromPrior).toBe(true);
    const firstAdoption = first.entries.find((item) => item.id === "E-001");
    expect(firstAdoption?.disposition).toBe("accepted");
  });

  test("(c) 実質同一の入力（空白・改行のみの差）は内容同一として重複扱いになる", () => {
    const first = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const respaced = `## E-001: テーマAの具体化案\n\n     テーマAを具体化する案の本文です。     \n\n\n`;
    const second = receiveReturnInput(respaced, [], first, "received/2026-10-18-THEME-001.md");
    expect(second.counts.detectedDuplicate).toBe(1);
    expect(second.entries.find((entry) => entry.id === "E-001")?.disposition).toBe("detected-duplicate");
  });

  test("bodyDigest は正規化本文の SHA-256（64桁16進）であり、エントリ本文を複写しない", () => {
    const result = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    const entry = result.entries.find((item) => item.id === "E-001");
    expect(entry?.bodyDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(entry?.bodyDigest).toBe(digestBody("テーマAを具体化する案の本文です。"));
    expect(JSON.stringify(result)).not.toContain("テーマAを具体化する案の本文です");
  });

  test("本文ダイジェストを持たない旧様式の prior は同一断定で除外せず、新たな受理・採否の対象にする", () => {
    const legacy = loadPriorRecord({
      result: "received",
      entries: [
        {
          id: "E-001",
          title: "テーマAの具体化案",
          disposition: "accepted",
          basis: "user-explicit",
          selfReportDetected: false,
          reason: null,
        },
      ],
    });
    const second = receiveReturnInput(SAMPLE_RETURN, ["E-001"], legacy, "legacy.json");
    const entry = second.entries.find((item) => item.id === "E-001");
    expect(entry?.disposition).toBe("accepted");
    expect(second.counts.detectedDuplicate).toBe(0);
  });

  test("重複判定を含む受理・解釈は入力サイズに対して線形の走査で完結する（prior 構築も O(n)）", () => {
    const lines: string[] = [];
    const ids: string[] = [];
    for (let i = 1; i <= 200; i += 1) {
      const id = `E-${String(i).padStart(3, "0")}`;
      ids.push(id);
      lines.push(`## ${id}: エントリ${i}\n\nエントリ${i}の本文です。\n`);
    }
    const large = lines.join("\n");
    const first = receiveReturnInput(large, ids, null, null);
    expect(first.counts.accepted).toBe(200);
    const second = receiveReturnInput(large, [], first, "prior.json");
    expect(second.counts.detectedDuplicate).toBe(200);
    expect(second.counts.accepted).toBe(0);
  });
});

describe("由来と採用根拠の区別（REQ-110-029・受理側の記録）", () => {
  test("明示指定した由来がエントリごとに記録され、採用根拠（basis）とは独立している", () => {
    const result = receiveReturnInput(
      SAMPLE_RETURN,
      ["E-001"],
      null,
      null,
      ["delegated-derivation", "E-002=evaluator-finding"],
    );
    const adopted = result.entries.find((entry) => entry.id === "E-001");
    const evaluated = result.entries.find((entry) => entry.id === "E-002");
    const unspecified = result.entries.find((entry) => entry.id === "E-003");
    expect(adopted?.provenance).toBe("delegated-derivation");
    expect(adopted?.basis).toBe("user-explicit");
    expect(evaluated?.provenance).toBe("evaluator-finding");
    expect(evaluated?.basis).toBeNull();
    expect(unspecified?.provenance).toBe("delegated-derivation");
  });

  test("由来指定なしの従来入力では provenance が null で、既存の受理動作は変わらない", () => {
    const result = receiveReturnInput(SAMPLE_RETURN, ["E-001"], null, null);
    for (const entry of result.entries) {
      expect(entry.provenance).toBeNull();
    }
  });

  test("由来の値が値域外なら例外で拒否する（fail-closed）", () => {
    expect(() => receiveReturnInput(SAMPLE_RETURN, [], null, null, ["external-claim"])).toThrow();
    expect(() => receiveReturnInput(SAMPLE_RETURN, [], null, null, ["E-001="])).toThrow();
    expect(() => receiveReturnInput(SAMPLE_RETURN, [], null, null, ["=user-provided"])).toThrow();
  });
});
