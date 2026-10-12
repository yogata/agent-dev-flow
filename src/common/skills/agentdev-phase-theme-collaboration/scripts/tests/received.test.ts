import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseReceivedRecordMeta } from "../lib/schema.ts";

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
