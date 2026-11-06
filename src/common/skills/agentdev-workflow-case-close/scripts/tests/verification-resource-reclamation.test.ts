import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

import {
  readLedger,
  resolveLedgerPath,
  serializeLedger,
  type VerificationResourceEntry,
} from "../src/verification-resources-ledger";
import {
  reclaimCloseAcceptanceRecord,
  reclaimLedger,
  recordEntryCollected,
  ReclamationInputError,
  ReclamationStateError,
  type ReclamationConfirmation,
  type ReclamationIo,
} from "../src/verification-resource-reclamation";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);

// テスト用一時領域（worktree 内 .agentdev/tmp/ 配下。gitignore 対象。afterAll で削除）。
const FIXTURE_ROOT = path.join(REPO_ROOT, ".agentdev/tmp/test-fixture-verification-resource-reclamation");
const FIXTURE_MAIN_ROOT = path.join(FIXTURE_ROOT, "main-repo");
const FIXTURE_LEDGER_DIR = path.join(FIXTURE_MAIN_ROOT, ".agentdev", "tmp", "verification-resources");
const FIXTURE_CLOSE_ACCEPTANCE_DIR = path.join(FIXTURE_ROOT, "close-acceptance");

// 正式な成果物（テストソース・テストデータ）の区別を検証するための固定ファイル。
const OFFICIAL_TEST_SOURCE = path.join(FIXTURE_ROOT, "official", "some-test.test.ts");
const OFFICIAL_TEST_DATA = path.join(FIXTURE_ROOT, "official", "some-test-data.json");

afterAll(() => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
});

beforeEach(() => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
});

/** 実 fs に接続した台帳 I/O（回収面は deleteFile を加えて構成する）。 */
function nodeIo(): ReclamationIo {
  return {
    exists(absolutePath) {
      return fs.existsSync(absolutePath);
    },
    readTextFile(absolutePath) {
      return fs.readFileSync(absolutePath, "utf-8");
    },
    writeTextFile(absolutePath, content) {
      fs.writeFileSync(absolutePath, content, "utf-8");
    },
    mkdirRecursive(absolutePath) {
      fs.mkdirSync(absolutePath, { recursive: true });
    },
    gitCommonDir() {
      return path.join(FIXTURE_MAIN_ROOT, ".git");
    },
    deleteFile(absolutePath) {
      fs.rmSync(absolutePath, { force: true });
    },
  };
}

function writeLedger(entries: readonly VerificationResourceEntry[]): string {
  fs.mkdirSync(FIXTURE_LEDGER_DIR, { recursive: true });
  const ledgerPath = resolveLedgerPath(FIXTURE_MAIN_ROOT, "3928");
  fs.writeFileSync(ledgerPath, serializeLedger(entries), "utf-8");
  return ledgerPath;
}

function entry(id: string, childIssue: number, collectedAt: string | null): VerificationResourceEntry {
  return {
    id,
    caseId: "3928",
    kind: "clone",
    location: `${FIXTURE_ROOT}/verification-clone-${childIssue}`,
    identifiers: { path: `${FIXTURE_ROOT}/verification-clone-${childIssue}` },
    collector: "case-run",
    ownership: "child",
    childIssue,
    recordedBy: "case-run",
    createdAt: "2026-11-05T12:00:00.000Z",
    registrationBasis: "creation-time-machine-registration",
    collectedAt,
  };
}

function confirmation(targetIds: readonly string[]): ReclamationConfirmation {
  return { confirmedBy: "case-close 機械工程（削除確認フロー成立後の回収手続き）", confirmedAt: "2026-11-05T18:00:00.000Z", targetIds };
}

describe("検証用一時資材の台帳回収・終了判定記録回収（終了時回収の実行面）", () => {
  describe("台帳回収（追跡記録自体の終了時回収）", () => {
    test("全エントリ回収済みの台帳を回収すると台帳ファイルが不在になり、最終記録の収束材料が返る", () => {
      const ledgerPath = writeLedger([entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z")]);
      const result = reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", confirmation(["vr-3928-1"]));
      expect(result.status).toBe("reclaimed");
      expect(fs.existsSync(ledgerPath)).toBe(false);
      const read = readLedger(nodeIo(), ledgerPath);
      expect(read.state).toBe("missing");
      expect(result.reclaimedEntryCount).toBe(1);
    });

    test("収束材料には回収対象の記録（ID、種別、所在、識別情報、所有区分、子Issue、回収時刻）が含まれ、本体Issue/PRへ記載できる形で返る", () => {
      writeLedger([
        entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z"),
        { ...entry("vr-3928-2", 3931, "2026-11-05T14:00:00.000Z"), kind: "remote", identifiers: { url: "https://example.test/verification.git" } },
      ]);
      const result = reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", confirmation(["vr-3928-1", "vr-3928-2"]));
      expect(result.status).toBe("reclaimed");
      expect(result.convergenceMaterial).toContain("vr-3928-1");
      expect(result.convergenceMaterial).toContain("clone");
      expect(result.convergenceMaterial).toContain(FIXTURE_ROOT);
      expect(result.convergenceMaterial).toContain("vr-3928-2");
      expect(result.convergenceMaterial).toContain("remote");
      expect(result.convergenceMaterial).toContain("https://example.test/verification.git");
      expect(result.convergenceMaterial).toContain("2026-11-05T13:00:00.000Z");
      expect(result.convergenceMaterial).toContain("2026-11-05T14:00:00.000Z");
      expect(result.convergenceMaterial).toContain("verification-resource-ledger-final:v1");
    });

    test("収束材料の記録行から台帳記録（ID、種別、所在、回収時刻）を機械に復元できる（回収後の台帳なしで記録内容が復元できる）", () => {
      writeLedger([entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z")]);
      const result = reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", confirmation(["vr-3928-1"]));
      const material = result.convergenceMaterial ?? "";
      const machineLine = material.split("\n").find((line) => line.startsWith("| vr-3928-1"));
      expect(machineLine).toBeDefined();
      const cells = (machineLine as string).split("|").map((cell) => cell.trim());
      expect(cells[1]).toBe("vr-3928-1");
      expect(cells[2]).toBe("clone");
      expect(cells[3]).toBe(`${FIXTURE_ROOT}/verification-clone-3930`);
      expect(cells[cells.length - 2]).toBe("2026-11-05T13:00:00.000Z");
    });

    test("未回収エントリが残る台帳の回収要求は実行せず拒否として返す（全体未完了の維持）", () => {
      const ledgerPath = writeLedger([
        entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z"),
        entry("vr-3928-2", 3931, null),
      ]);
      const result = reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", confirmation(["vr-3928-1", "vr-3928-2"]));
      expect(result.status).toBe("uncollected-entries");
      expect(result.reclaimedEntryCount).toBe(0);
      expect(fs.existsSync(ledgerPath)).toBe(true);
    });

    test("台帳不在は回収対象の記録欠落として返し、作成物なしの根拠にしない", () => {
      fs.mkdirSync(FIXTURE_LEDGER_DIR, { recursive: true });
      const result = reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", confirmation([]));
      expect(result.status).toBe("ledger-missing");
    });

    test("確認対象の台帳エントリ ID と台帳記録が一致しない回収要求を拒否する", () => {
      writeLedger([entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z")]);
      const mismatched = confirmation(["vr-3928-9"]);
      expect(() => reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", mismatched)).toThrow(ReclamationInputError);
      const superset = confirmation(["vr-3928-1", "vr-3928-2"]);
      expect(() => reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", superset)).toThrow(ReclamationInputError);
    });

    test("確認申告の必須項目が欠ける回収要求を拒否する（確認なしの回収を行わない）", () => {
      writeLedger([entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z")]);
      const io = nodeIo();
      expect(() => reclaimLedger(io, FIXTURE_MAIN_ROOT, "3928", { confirmedBy: "", confirmedAt: "2026-11-05T18:00:00.000Z", targetIds: ["vr-3928-1"] })).toThrow(ReclamationInputError);
      expect(() => reclaimLedger(io, FIXTURE_MAIN_ROOT, "3928", { confirmedBy: "x", confirmedAt: "not-an-iso", targetIds: ["vr-3928-1"] })).toThrow(ReclamationInputError);
      expect(() => reclaimLedger(io, FIXTURE_MAIN_ROOT, "3928", { confirmedBy: "x", confirmedAt: "2026-11-05T18:00:00.000Z", targetIds: [] })).toThrow(ReclamationInputError);
    });
  });

  describe("個別エントリの回収記録（collectedAt の実行面）", () => {
    test("確認成立を伴う回収記録はエントリの collectedAt を更新する", () => {
      const ledgerPath = writeLedger([entry("vr-3928-1", 3930, null)]);
      const result = recordEntryCollected(nodeIo(), FIXTURE_MAIN_ROOT, "3928", "vr-3928-1", confirmation(["vr-3928-1"]), "2026-11-05T18:30:00.000Z");
      expect(result.entry.collectedAt).toBe("2026-11-05T18:30:00.000Z");
      const read = readLedger(nodeIo(), ledgerPath);
      expect(read.entries[0]?.collectedAt).toBe("2026-11-05T18:30:00.000Z");
    });

    test("確認対象 ID に該当エントリが含まれない回収記録を拒否する", () => {
      writeLedger([entry("vr-3928-1", 3930, null)]);
      expect(() => recordEntryCollected(nodeIo(), FIXTURE_MAIN_ROOT, "3928", "vr-3928-1", confirmation(["vr-3928-2"]), "2026-11-05T18:30:00.000Z")).toThrow(ReclamationInputError);
    });

    test("存在しないエントリの回収記録は拒否する", () => {
      writeLedger([entry("vr-3928-1", 3930, null)]);
      expect(() => recordEntryCollected(nodeIo(), FIXTURE_MAIN_ROOT, "3928", "vr-3928-9", confirmation(["vr-3928-9"]), "2026-11-05T18:30:00.000Z")).toThrow(ReclamationStateError);
    });

    test("台帳不在のエントリ回収記録は拒否する（不在台帳への単独書込みを行わない）", () => {
      fs.mkdirSync(FIXTURE_LEDGER_DIR, { recursive: true });
      expect(() => recordEntryCollected(nodeIo(), FIXTURE_MAIN_ROOT, "3928", "vr-3928-1", confirmation(["vr-3928-1"]), "2026-11-05T18:30:00.000Z")).toThrow(ReclamationStateError);
    });

    test("既に回収済みのエントリへの再記録は冪等に既存の回収時刻を保持する", () => {
      const ledgerPath = writeLedger([entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z")]);
      const result = recordEntryCollected(nodeIo(), FIXTURE_MAIN_ROOT, "3928", "vr-3928-1", confirmation(["vr-3928-1"]), "2026-11-05T19:00:00.000Z");
      expect(result.entry.collectedAt).toBe("2026-11-05T13:00:00.000Z");
      const read = readLedger(nodeIo(), ledgerPath);
      expect(read.entries[0]?.collectedAt).toBe("2026-11-05T13:00:00.000Z");
    });
  });

  describe("終了判定記録の終了後回収", () => {
    test("終了操作の完了申告を伴う回収は終了判定記録を不在にする", () => {
      fs.mkdirSync(FIXTURE_CLOSE_ACCEPTANCE_DIR, { recursive: true });
      const recordPath = path.join(FIXTURE_CLOSE_ACCEPTANCE_DIR, "issue-3934.json");
      fs.writeFileSync(recordPath, JSON.stringify({ issue: 3934, verdict: "pass" }), "utf-8");
      const result = reclaimCloseAcceptanceRecord(nodeIo(), { recordPath, terminalOperationCompleted: true });
      expect(result.status).toBe("reclaimed");
      expect(fs.existsSync(recordPath)).toBe(false);
    });

    test("終了操作の完了申告がない回収要求は記録を保持する（Tool 境界検証が読み取る必要がある期間の保持）", () => {
      fs.mkdirSync(FIXTURE_CLOSE_ACCEPTANCE_DIR, { recursive: true });
      const recordPath = path.join(FIXTURE_CLOSE_ACCEPTANCE_DIR, "issue-3935.json");
      fs.writeFileSync(recordPath, JSON.stringify({ issue: 3935, verdict: "pass" }), "utf-8");
      const result = reclaimCloseAcceptanceRecord(nodeIo(), { recordPath, terminalOperationCompleted: false });
      expect(result.status).toBe("retained");
      expect(fs.existsSync(recordPath)).toBe(true);
    });

    test("記録不在の回収要求は回収対象なしとして冪等に受理する", () => {
      const recordPath = path.join(FIXTURE_CLOSE_ACCEPTANCE_DIR, "issue-3999.json");
      const result = reclaimCloseAcceptanceRecord(nodeIo(), { recordPath, terminalOperationCompleted: true });
      expect(result.status).toBe("record-missing");
    });
  });

  describe("正式な成果物（テストソース・テストデータ）は回収対象外である区別", () => {
    test("台帳回収が削除するのは台帳ファイルのみであり、正式なテストソースとテストデータを削除しない", () => {
      fs.mkdirSync(path.dirname(OFFICIAL_TEST_SOURCE), { recursive: true });
      fs.writeFileSync(OFFICIAL_TEST_SOURCE, "import { test } from \"bun:test\";\ntest(\"official\", () => {});\n", "utf-8");
      fs.writeFileSync(OFFICIAL_TEST_DATA, JSON.stringify({ expectation: "kept" }), "utf-8");
      writeLedger([entry("vr-3928-1", 3930, "2026-11-05T13:00:00.000Z")]);
      const result = reclaimLedger(nodeIo(), FIXTURE_MAIN_ROOT, "3928", confirmation(["vr-3928-1"]));
      expect(result.status).toBe("reclaimed");
      expect(fs.existsSync(OFFICIAL_TEST_SOURCE)).toBe(true);
      expect(fs.existsSync(OFFICIAL_TEST_DATA)).toBe(true);
    });

    test("終了判定記録回収が削除するのは指定された判定記録ファイルのみであり、正式なテストソースとテストデータを削除しない", () => {
      fs.mkdirSync(path.dirname(OFFICIAL_TEST_SOURCE), { recursive: true });
      fs.mkdirSync(FIXTURE_CLOSE_ACCEPTANCE_DIR, { recursive: true });
      fs.writeFileSync(OFFICIAL_TEST_SOURCE, "import { test } from \"bun:test\";\ntest(\"official\", () => {});\n", "utf-8");
      fs.writeFileSync(OFFICIAL_TEST_DATA, JSON.stringify({ expectation: "kept" }), "utf-8");
      const recordPath = path.join(FIXTURE_CLOSE_ACCEPTANCE_DIR, "issue-3936.json");
      fs.writeFileSync(recordPath, JSON.stringify({ issue: 3936, verdict: "pass" }), "utf-8");
      const result = reclaimCloseAcceptanceRecord(nodeIo(), { recordPath, terminalOperationCompleted: true });
      expect(result.status).toBe("reclaimed");
      expect(fs.existsSync(OFFICIAL_TEST_SOURCE)).toBe(true);
      expect(fs.existsSync(OFFICIAL_TEST_DATA)).toBe(true);
    });
  });
});
