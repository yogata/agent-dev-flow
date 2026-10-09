// ADF-COVERS(verification): REQ-110-001
// 完遂条件台帳と REQ-104〜109 の義務行集合の突合 test。
// 検証義務: REQ-104〜109 の全義務行（本 Case による追加行を含む）の各行が
// 台帳の対応範囲に含まれ、台帳の全項目に判定列と証拠参照列が存在すること。
// 正規原本: docs/reports/adf-v5-completion-conditions-ledger.md、docs/requirements/REQ-104〜109.md

import { readFileSync } from "node:fs";
import { describe, expect, test } from "bun:test";

const LEDGER_PATH = "docs/reports/adf-v5-completion-conditions-ledger.md";
const REQ_IDS = ["REQ-104", "REQ-105", "REQ-106", "REQ-107", "REQ-108", "REQ-109"];
const REQ_LINE_RE = /^\|\s*(REQ-(?:10[4-9])-\d{3})\s*\|/;

interface LedgerAssignmentRow {
  readonly reqLine: string;
  readonly addedByThisCase: boolean;
  readonly area: string;
  readonly judgmentCell: string;
  readonly evidenceCell: string;
}

function collectReqLineIds(): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const reqId of REQ_IDS) {
    const content = readFileSync(`docs/requirements/${reqId}.md`, "utf8");
    for (const line of content.split("\n")) {
      const match = REQ_LINE_RE.exec(line);
      if (match?.[1] !== undefined) ids.add(match[1]);
    }
  }
  return ids;
}

function collectLedgerAssignmentRows(): readonly LedgerAssignmentRow[] {
  const content = readFileSync(LEDGER_PATH, "utf8");
  const sectionHeader = content.indexOf("## 対応要件行割当表");
  if (sectionHeader < 0) throw new Error(`section not found in ${LEDGER_PATH}`);
  const nextSection = content.indexOf("\n## ", sectionHeader + 1);
  const section = content.slice(sectionHeader, nextSection < 0 ? undefined : nextSection);
  const rows: LedgerAssignmentRow[] = [];
  for (const line of section.split("\n")) {
    const trimmed = line.trim();
    const match = REQ_LINE_RE.exec(trimmed);
    if (match?.[1] === undefined) continue;
    const cells = trimmed.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
    const addedByThisCase = cells[1] === "本 Case";
    const area = cells[2] ?? "";
    const judgmentCell = cells[4] ?? "";
    const evidenceCell = cells[5] ?? "";
    rows.push({ reqLine: match[1], addedByThisCase, area, judgmentCell, evidenceCell });
  }
  return rows;
}

describe("完遂条件台帳と REQ-104〜109 の義務行突合", () => {
  test("REQ-104〜109 の全義務行が台帳の割当表に含まれる（欠落 0）", () => {
    const reqLines = collectReqLineIds();
    const ledgerLines = new Set(collectLedgerAssignmentRows().map((r) => r.reqLine));
    const missing = [...reqLines].filter((id) => !ledgerLines.has(id));
    expect(missing).toEqual([]);
  });

  test("台帳の割当表に REQ ファイルに存在しない行が含まれない（過剰 0）", () => {
    const reqLines = collectReqLineIds();
    const extras = collectLedgerAssignmentRows().filter((r) => !reqLines.has(r.reqLine));
    expect(extras.map((r) => r.reqLine)).toEqual([]);
  });

  test("台帳の割当行数は 58 行である", () => {
    const rows = collectLedgerAssignmentRows();
    expect(rows.length).toBe(58);
  });

  test("本 Case による追加行 6 行が台帳に含まれる", () => {
    const rows = collectLedgerAssignmentRows();
    const added = rows.filter((r) => r.addedByThisCase).map((r) => r.reqLine);
    expect(added).toEqual([
      "REQ-104-008",
      "REQ-105-009",
      "REQ-106-010",
      "REQ-107-009",
      "REQ-108-013",
      "REQ-109-009",
    ]);
  });

  test("割当表の全行に判定列と証拠参照列が存在する", () => {
    const rows = collectLedgerAssignmentRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.judgmentCell.length).toBeGreaterThan(0);
      expect(row.evidenceCell.length).toBeGreaterThan(0);
    }
  });

  test("台帳のゲート行は G0〜G10 の 11 行を持つ", () => {
    const content = readFileSync(LEDGER_PATH, "utf8");
    const sectionHeader = content.indexOf("## 完遂条件体系の構造");
    if (sectionHeader < 0) throw new Error(`section not found in ${LEDGER_PATH}`);
    const nextSection = content.indexOf("\n## ", sectionHeader + 1);
    const section = content.slice(sectionHeader, nextSection < 0 ? undefined : nextSection);
    for (let n = 0; n <= 10; n++) {
      const gateRow = section.split("\n").find((line) => line.trim().startsWith(`| G${n} |`));
      expect(gateRow).toBeDefined();
      if (gateRow === undefined) continue;
      const cells = gateRow.trim().split("|").map((c) => c.trim()).filter((c) => c.length > 0);
      // ゲート行: ゲート | 領域 | 定義本文 | 受け入れ条件 | 判定 | 証拠参照 の 6 列。
      expect(cells.length).toBe(6);
      const area = cells[1] ?? "";
      const judgment = cells[4] ?? "";
      const evidence = cells[5] ?? "";
      expect(area.length).toBeGreaterThan(0);
      expect(judgment.length).toBeGreaterThan(0);
      expect(evidence.length).toBeGreaterThan(0);
    }
  });
});
