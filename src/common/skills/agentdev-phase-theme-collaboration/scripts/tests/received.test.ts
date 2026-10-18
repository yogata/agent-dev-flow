import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseReceivedRecordMeta } from "../lib/schema.ts";
import { resolveReceivedAt, receivedDatePart, buildReceivedRecord } from "../lib/received-record.ts";

const RECORD_A = `---
receivedAt: 2026-10-13T09:00:00Z
theme: THEME-001
purpose: "テーマAの具体化の外部意見"
question: "分割の判断材料は何か"
references: ["docs/designs/workflows/v51-phase-driven-collaboration-model.md"]
---

## 採用

- E-001 を明示採用（根拠: 利用者の判断）

## 不採用

- E-002 は不採用として記録
`;

const RECORD_B = `---
receivedAt: 2026-10-14T10:00:00Z
theme: THEME-002
purpose: "テーマBの検証範囲の外部意見"
references: ["docs/requirements/REQ-110.md"]
---

## 保留

- E-001 は確認対象として保留
`;

async function createReceivedDir(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "phase-received-test-"));
  await mkdir(join(root, "received"), { recursive: true });
  await writeFile(join(root, "received", "2026-10-13-THEME-001.md"), RECORD_A, "utf8");
  await writeFile(join(root, "received", "2026-10-14-THEME-002.md"), RECORD_B, "utf8");
  return root;
}

describe("受領記録 frontmatter の検証", () => {
  test("受領情報（受領日時・テーマ識別・目的・問い・参照元）を解析する", () => {
    const meta = parseReceivedRecordMeta(
      {
        receivedAt: "2026-10-13T09:00:00Z",
        theme: "THEME-001",
        purpose: "テーマAの具体化の外部意見",
        question: "分割の判断材料は何か",
        references: ["docs/designs/workflows/v51-phase-driven-collaboration-model.md"],
      },
      "2026-10-13-THEME-001.md",
    );
    expect(meta.theme).toBe("THEME-001");
    expect(meta.question).toBe("分割の判断材料は何か");
    expect(meta.references.length).toBe(1);
  });

  test("receivedAt・theme・purpose の欠落は例外で拒否する（破損記録を受領済み知見として扱わない）", () => {
    expect(() => parseReceivedRecordMeta({ theme: "THEME-001" }, "broken.md")).toThrow();
    expect(() => parseReceivedRecordMeta({ receivedAt: "2026-10-13", purpose: "目的" }, "broken.md")).toThrow();
    expect(() => parseReceivedRecordMeta(null, "broken.md")).toThrow();
  });

  test("references の非配列は例外で拒否する", () => {
    expect(() =>
      parseReceivedRecordMeta({ receivedAt: "x", theme: "T", purpose: "p", references: "docs" }, "broken.md"),
    ).toThrow();
  });
});

describe("受領済み知見の再取得", () => {
  test("received/ 配下の記録を一覧し、テーマ識別で限定照会できる", async () => {
    const root = await createReceivedDir();
    try {
      const { readdir, readFile } = await import("node:fs/promises");
      const entries = (await readdir(join(root, "received"))).filter((entry) => entry.endsWith(".md")).sort();
      expect(entries.length).toBe(2);
      const meta = parseReceivedRecordMeta(
        Bun.YAML.parse(/^---\n([\s\S]*?)\n---/.exec(await readFile(join(root, "received", entries[0] ?? ""), "utf8"))?.[1] ?? ""),
        entries[0] ?? "",
      );
      expect(meta.theme).toBe("THEME-001");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test("受領していないテーマは記録が存在せず返らない（未受領内容を復元したと扱わない）", async () => {
    const root = await createReceivedDir();
    try {
      const { readdir, readFile } = await import("node:fs/promises");
      const entries = (await readdir(join(root, "received"))).filter((entry) => entry.endsWith(".md"));
      const themeRecords = [];
      for (const entry of entries) {
        const meta = parseReceivedRecordMeta(
          Bun.YAML.parse(/^---\n([\s\S]*?)\n---/.exec(await readFile(join(root, "received", entry), "utf8"))?.[1] ?? ""),
          entry,
        );
        if (meta.theme === "THEME-999") themeRecords.push(entry);
      }
      expect(themeRecords.length).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("受領日時の信頼性（REQ-110-028）", () => {
  test("受領日時は受領操作時点の時計から取得する（注入した時計の時刻がそのまま記録される）", () => {
    const clock = () => new Date("2026-10-18T01:02:03.456Z");
    expect(resolveReceivedAt(clock)).toBe("2026-10-18T01:02:03.456Z");
  });

  test("時計が無効で受領日時を取得できない場合は例外で失敗を明示し、日時を捏造しない", () => {
    const brokenClock = () => new Date(Number.NaN);
    expect(() => resolveReceivedAt(brokenClock)).toThrow(/受領日時を取得できない/);
  });

  test("入力本文中の日付は受領実施時刻として代用されない（本文に古い日付があっても操作時刻を記録する）", () => {
    const operationTime = resolveReceivedAt(() => new Date("2026-10-18T09:00:00.000Z"));
    const bodyWithOldDate = "この外部資料は 2020-01-01 に作成された内容に基づく。";
    const record = buildReceivedRecord({
      receivedAt: operationTime,
      theme: "THEME-001",
      purpose: "入力側の日付と受領操作時刻が異なる事例",
      provenance: "user-provided",
      adoptionBasis: null,
      body: bodyWithOldDate,
    });
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(record.content)?.[1] ?? "";
    const meta = parseReceivedRecordMeta(Bun.YAML.parse(frontmatter), record.fileName);
    expect(meta.receivedAt).toBe("2026-10-18T09:00:00.000Z");
    expect(meta.receivedAt).not.toBe("2020-01-01");
    expect(record.fileName.startsWith("2026-10-18")).toBe(true);
  });

  test("受領日時の形式が不正な場合は日付部分を抽出できず例外で拒否する（fail-closed）", () => {
    expect(() => receivedDatePart("2026/10/18 09:00")).toThrow();
    expect(() => receivedDatePart("")).toThrow();
  });
});

describe("由来と採用根拠の区別（REQ-110-029・読み出し側）", () => {
  test("4由来を含む受領記録群で、由来と採用根拠が区別して読み出せる", () => {
    const operationTime = resolveReceivedAt(() => new Date("2026-10-18T09:00:00.000Z"));
    const inputs = [
      {
        receivedAt: operationTime,
        theme: "THEME-001",
        purpose: "利用者の明示した内容",
        provenance: "user-provided",
        adoptionBasis: "user-explicit",
        body: "利用者の明示判断を根拠とする採用",
      },
      {
        receivedAt: operationTime,
        theme: "THEME-001",
        purpose: "有効な正規決定を根拠とする採用",
        provenance: "user-provided",
        adoptionBasis: "decision",
        body: "正規決定を根拠とする採用",
      },
      {
        receivedAt: operationTime,
        theme: "THEME-001",
        purpose: "委任された範囲から導出された内容",
        provenance: "delegated-derivation",
        adoptionBasis: null,
        body: "委任導出の内容（採用根拠なし）",
      },
      {
        receivedAt: operationTime,
        theme: "THEME-001",
        purpose: "評価者の所見",
        provenance: "evaluator-finding",
        adoptionBasis: null,
        body: "評価者の所見（採用根拠なし）",
      },
    ] as const;
    const names: string[] = [];
    const metas = inputs.map((input) => {
      const record = buildReceivedRecord({ ...input, existingFileNames: names });
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(record.content)?.[1] ?? "";
      const meta = parseReceivedRecordMeta(Bun.YAML.parse(frontmatter), record.fileName);
      names.push(record.fileName);
      return meta;
    });
    expect(names[0]).toBe("2026-10-18-THEME-001.md");
    expect(names[1]).toBe("2026-10-18-THEME-001-2.md");
    expect(new Set(names).size).toBe(4);
    expect(metas[0]?.provenance).toBe("user-provided");
    expect(metas[0]?.adoptionBasis).toBe("user-explicit");
    expect(metas[1]?.adoptionBasis).toBe("decision");
    expect(metas[2]?.provenance).toBe("delegated-derivation");
    expect(metas[2]?.adoptionBasis).toBeNull();
    expect(metas[3]?.provenance).toBe("evaluator-finding");
    expect(metas[3]?.adoptionBasis).toBeNull();
  });

  test("採用済み判定は採用根拠のみから導出され、由来だけで採用済みと扱われない", () => {
    const operationTime = resolveReceivedAt(() => new Date("2026-10-18T09:00:00.000Z"));
    const build = (provenance: string, adoptionBasis: string | null) => {
      const record = buildReceivedRecord({
        receivedAt: operationTime,
        theme: "THEME-001",
        purpose: "採用済み判定の導出検証",
        provenance: provenance as Parameters<typeof buildReceivedRecord>[0]["provenance"],
        adoptionBasis: adoptionBasis as Parameters<typeof buildReceivedRecord>[0]["adoptionBasis"],
        body: "本文",
      });
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(record.content)?.[1] ?? "";
      const meta = parseReceivedRecordMeta(Bun.YAML.parse(frontmatter), record.fileName);
      return { adopted: meta.adoptionBasis !== null, provenance: meta.provenance, adoptionBasis: meta.adoptionBasis };
    };
    expect(build("user-provided", "user-explicit").adopted).toBe(true);
    expect(build("user-provided", "decision").adopted).toBe(true);
    expect(build("delegated-derivation", null).adopted).toBe(false);
    expect(build("evaluator-finding", null).adopted).toBe(false);
  });

  test("委任導出や評価所見は採用根拠の値域に含まれず、指定すると例外で拒否する（fail-closed）", () => {
    const operationTime = resolveReceivedAt(() => new Date("2026-10-18T09:00:00.000Z"));
    const invalidBasis = "delegated-derivation" as unknown as Parameters<typeof buildReceivedRecord>[0]["adoptionBasis"];
    expect(() =>
      buildReceivedRecord({
        receivedAt: operationTime,
        theme: "THEME-001",
        purpose: "不正な採用根拠",
        provenance: "user-provided",
        adoptionBasis: invalidBasis,
        body: "本文",
      }),
    ).toThrow(/採用根拠が不正/);
  });

  test("provenance・adoptionBasis の値域外の値を含む受領記録は読み出しで例外になる（fail-closed）", () => {
    expect(() =>
      parseReceivedRecordMeta(
        {
          receivedAt: "2026-10-13T09:00:00Z",
          theme: "THEME-001",
          purpose: "目的",
          provenance: "external-claim",
        },
        "broken.md",
      ),
    ).toThrow(/provenance が不正/);
    expect(() =>
      parseReceivedRecordMeta(
        {
          receivedAt: "2026-10-13T09:00:00Z",
          theme: "THEME-001",
          purpose: "目的",
          provenance: "user-provided",
          adoptionBasis: "evaluator-finding",
        },
        "broken.md",
      ),
    ).toThrow(/adoptionBasis が不正/);
  });

  test("旧様式（provenance・adoptionBasis 欠落）の受領記録は null として読め、既存の照会動作を維持する", () => {
    const meta = parseReceivedRecordMeta(
      {
        receivedAt: "2026-10-13T09:00:00Z",
        theme: "THEME-001",
        purpose: "旧様式の記録",
        question: "問い",
        references: ["docs/requirements/REQ-110.md"],
      },
      "legacy.md",
    );
    expect(meta.provenance).toBeNull();
    expect(meta.adoptionBasis).toBeNull();
    expect(meta.adoptionBasis !== null).toBe(false);
  });
});
