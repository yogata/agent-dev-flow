// ADF-COVERS(verification): REQ-110-002
// G4 反例14種の隔離環境投入と期待挙動表照合の恒常 test。
// 検証義務: 4領域の振る舞いが実行時に実証され、Design 保存の期待挙動表どおりに
// 判定されること。カタログ・台帳・Design 本体の三重照合を含む。

import { existsSync, readFileSync } from "node:fs";
import { describe, expect, test } from "bun:test";
import {
  aggregateVerdict,
  buildCounterexampleClaim,
  evaluateClaim,
  G4_COUNTEREXAMPLE_CASES,
  INJECTABLE_CASE_IDS,
  type ExpectedBehavior,
  type Verdict,
} from "./case-catalog.ts";
import {
  createIsolatedCase,
  fixtureIncompleteMigration,
  fixtureMissingAdoptedArtifact,
  fixtureMissingRelationTarget,
  isInsideOsTempDir,
} from "./isolation.ts";

// bun test は repo root を cwd とする（REQ-060）。
const DESIGN_PATH = "docs/designs/quality/v5-completion-judgment.md";
const LEDGER_PATH = "docs/reports/adf-v5-completion-conditions-ledger.md";

const EXPECTED_BEHAVIOR_MAP: Readonly<Record<string, ExpectedBehavior>> = {
  拒否: "reject",
  留保: "reserve",
  回復: "recover",
  "検証器側を fail": "verifier-fail",
};

interface CatalogRow {
  readonly name: string;
  readonly expectedBehavior: ExpectedBehavior;
}

// Design 正規原本の「G4 反例カタログ（期待挙動表）」節から表を抽出する。
function extractCatalogFromDesign(): readonly CatalogRow[] {
  const content = readFileSync(DESIGN_PATH, "utf8");
  const sectionHeader = content.indexOf("## G4 反例カタログ（期待挙動表）");
  if (sectionHeader < 0) throw new Error(`section not found in ${DESIGN_PATH}`);
  const nextSection = content.indexOf("\n## ", sectionHeader + 1);
  const section = content.slice(sectionHeader, nextSection < 0 ? undefined : nextSection);
  const rows: CatalogRow[] = [];
  for (const line of section.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.startsWith("|---")) continue;
    const cells = trimmed.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
    const name = cells[0];
    const behaviorCell = cells[1];
    if (name === undefined || behaviorCell === undefined || cells.length !== 2) continue;
    if (name === "反例") continue;
    const behaviorEntry = Object.entries(EXPECTED_BEHAVIOR_MAP).find(([key]) =>
      behaviorCell.startsWith(key),
    );
    const behavior = behaviorEntry?.[1];
    if (behavior === undefined) {
      throw new Error(`unknown expected behavior cell: ${behaviorCell}`);
    }
    rows.push({ name, expectedBehavior: behavior });
  }
  return rows;
}

// 台帳の「反例識別子と期待挙動」表（4 列構成）を抽出する。
function extractLedgerRows(): readonly { id: string; name: string; expectedBehavior: string }[] {
  const content = readFileSync(LEDGER_PATH, "utf8");
  const rows: { id: string; name: string; expectedBehavior: string }[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("| G4-X")) continue;
    const cells = trimmed.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
    if (cells.length !== 4) continue;
    const id = cells[0];
    const name = cells[1];
    const expectedBehavior = cells[2];
    if (id === undefined || name === undefined || expectedBehavior === undefined) continue;
    rows.push({ id, name, expectedBehavior });
  }
  return rows;
}

function detect(claim: Parameters<typeof evaluateClaim>[0]): Verdict {
  return aggregateVerdict(evaluateClaim(claim));
}

describe("G4 反例カタログ正投影", () => {
  test("カタログは 14 種を保持する", () => {
    expect(G4_COUNTEREXAMPLE_CASES.length).toBe(14);
  });

  test("カタログの名称と期待挙動は Design 期待挙動表と一致する", () => {
    const designRows = extractCatalogFromDesign();
    expect(designRows.length).toBe(G4_COUNTEREXAMPLE_CASES.length);
    G4_COUNTEREXAMPLE_CASES.forEach((caseEntry, index) => {
      const row = designRows[index];
      if (row === undefined) {
        throw new Error(`design row not found at index ${index}`);
      }
      expect(caseEntry.name).toBe(row.name);
      expect(caseEntry.expectedBehavior).toBe(row.expectedBehavior);
    });
  });

  test("台帳の反例識別子・反例名・期待挙動はカタログと一致する", () => {
    const ledgerRows = extractLedgerRows();
    expect(ledgerRows.length).toBe(G4_COUNTEREXAMPLE_CASES.length);
    G4_COUNTEREXAMPLE_CASES.forEach((caseEntry) => {
      const row = ledgerRows.find((r) => r.id === caseEntry.id);
      if (row === undefined) {
        throw new Error(`ledger row not found: ${caseEntry.id}`);
      }
      expect(row.name).toBe(caseEntry.name);
      expect(row.expectedBehavior).toBe(caseEntry.expectedBehavior);
    });
  });

  test("投入対象は verifier-fail を除く 13 種である", () => {
    expect(INJECTABLE_CASE_IDS.length).toBe(13);
    expect(INJECTABLE_CASE_IDS.includes("G4-X14")).toBe(false);
  });

  test("台帳の検証器偽陽性確認記録は 3 確認項目を保持する", () => {
    const ledger = readFileSync(LEDGER_PATH, "utf8");
    const sectionHeader = ledger.indexOf("### 検証器偽陽性の確認記録");
    if (sectionHeader < 0) throw new Error(`section not found in ${LEDGER_PATH}`);
    const nextSection = ledger.indexOf("\n## ", sectionHeader + 1);
    const section = ledger.slice(sectionHeader, nextSection < 0 ? undefined : nextSection);
    const confirmRows = section
      .split("\n")
      .filter((line) => line.trim().startsWith("|"))
      .filter((line) => !line.includes("確認項目"))
      .filter((line) => !line.startsWith("|---"))
      .map((line) => line.trim().split("|").map((c) => c.trim()).filter((c) => c.length > 0))
      .filter((cells) => cells.length === 5);
    expect(confirmRows.length).toBe(3);
    const expectedKeywords = ["正常系投入の誤不合格化", "反例投入の不合格の合格化", "偽陽性注入時の検証器 fail 判定"];
    for (const keyword of expectedKeywords) {
      expect(confirmRows.some((cells) => cells[0]?.includes(keyword))).toBe(true);
    }
  });
});

describe("G4 反例投入（隔離環境・ファイル実体を伴う反例）", () => {
  test("G4-X01 採用成果物の欠落は reject を識別する", async () => {
    const isolated = await createIsolatedCase("x01");
    try {
      expect(isInsideOsTempDir(isolated.root)).toBe(true);
      const facts = await fixtureMissingAdoptedArtifact(isolated);
      const claim = buildCounterexampleClaim("G4-X01", facts);
      expect(detect(claim)).toBe("reject");
    } finally {
      await isolated.cleanup();
    }
    expect(existsSync(isolated.root)).toBe(false);
  });

  test("G4-X07 追跡先欠落・参照不整合は reject を識別する", async () => {
    const isolated = await createIsolatedCase("x07");
    try {
      expect(isInsideOsTempDir(isolated.root)).toBe(true);
      const facts = await fixtureMissingRelationTarget(isolated);
      const claim = buildCounterexampleClaim("G4-X07", facts);
      expect(detect(claim)).toBe("reject");
    } finally {
      await isolated.cleanup();
    }
    expect(existsSync(isolated.root)).toBe(false);
  });

  test("G4-X11 移行情報欠落は reject を識別する", async () => {
    const isolated = await createIsolatedCase("x11");
    try {
      expect(isInsideOsTempDir(isolated.root)).toBe(true);
      const facts = await fixtureIncompleteMigration(isolated);
      const claim = buildCounterexampleClaim("G4-X11", facts);
      expect(detect(claim)).toBe("reject");
    } finally {
      await isolated.cleanup();
    }
    expect(existsSync(isolated.root)).toBe(false);
  });
});

describe("G4 反例投入（隔離環境・構造投入反例）", () => {
  const STRUCTURAL_CASES: readonly { id: string; expected: Verdict }[] = [
    { id: "G4-X02", expected: "reject" },
    { id: "G4-X03", expected: "reject" },
    { id: "G4-X04", expected: "reject" },
    { id: "G4-X05", expected: "reserve" },
    { id: "G4-X06", expected: "reject" },
    { id: "G4-X08", expected: "reject" },
    { id: "G4-X09", expected: "reserve" },
    { id: "G4-X10", expected: "reserve" },
    { id: "G4-X12", expected: "recover" },
    { id: "G4-X13", expected: "recover" },
  ];

  for (const { id, expected } of STRUCTURAL_CASES) {
    test(`${id} は ${expected} を識別する`, () => {
      const claim = buildCounterexampleClaim(id, {});
      expect(detect(claim)).toBe(expected);
    });
  }
});

describe("G4 反例投入の正規状態非破壊", () => {
  test("隔離ディレクトリは OS 一時ディレクトリ配下に限定される", () => {
    expect(isInsideOsTempDir("/repo-elsewhere/not-isolated")).toBe(false);
    expect(isInsideOsTempDir("C:\\work\\repo\\not-isolated")).toBe(false);
  });
});
