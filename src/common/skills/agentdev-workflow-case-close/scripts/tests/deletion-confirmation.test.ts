import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

import {
  buildDeletionProposal,
  evaluateDeletionConfirmation,
  type DeletionTargetObservation,
  type UserDeletionConfirmation,
} from "../src/deletion-confirmation";
import {
  LedgerInputError,
  markEntryCollected,
  parseLedgerText,
  recordDeletionConfirmation,
  serializeLedger,
  type LedgerIo,
  type VerificationResourceEntry,
} from "../src/verification-resources-ledger";

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
const FIXTURE_ROOT = path.join(REPO_ROOT, ".agentdev/tmp/test-fixture-deletion-confirmation");

afterAll(() => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
});

function ledgerEntry(overrides: Partial<VerificationResourceEntry> = {}): VerificationResourceEntry {
  return {
    id: "vr-3928-1",
    caseId: "3928",
    kind: "clone",
    location: "C:/tmp/case-3928/verify-clone",
    identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify" },
    collector: "case-run:3930",
    ownership: "child",
    childIssue: 3930,
    recordedBy: "case-run",
    createdAt: "2026-11-05T10:00:00.000Z",
    registrationBasis: "creation-time-machine-registration",
    collectedAt: null,
    ...overrides,
  };
}

function userConfirmation(overrides: Partial<UserDeletionConfirmation> = {}): UserDeletionConfirmation {
  return {
    entryId: "vr-3928-1",
    source: "user-explicit",
    purpose: "deletion",
    confirmedAt: "2026-11-05T12:00:00.000Z",
    identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify" },
    ...overrides,
  };
}

function observation(overrides: Partial<DeletionTargetObservation> = {}): DeletionTargetObservation {
  return {
    entryId: "vr-3928-1",
    location: "C:/tmp/case-3928/verify-clone",
    kind: "clone",
    identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify" },
    exists: true,
    ...overrides,
  };
}

function fakeIo(existingLedgerText: string | null): LedgerIo & {
  written: { absolutePath: string; content: string }[];
} {
  return {
    written: [],
    exists(absolutePath) {
      return existingLedgerText !== null && absolutePath.endsWith(".json");
    },
    readTextFile() {
      if (existingLedgerText === null) throw new Error("unexpected read of missing file");
      return existingLedgerText;
    },
    writeTextFile(absolutePath, content) {
      this.written.push({ absolutePath, content });
    },
    mkdirRecursive() {},
    gitCommonDir() {
      return "C:/repo/main/.git";
    },
  };
}

describe("一時資材回収の削除確認フロー（TS-005）", () => {
  describe("削除提案の識別情報付与", () => {
    test("パス、種別、内容識別、PIDとコマンドライン、URLの識別情報が削除提案へ付与される", () => {
      const entry = ledgerEntry({
        kind: "dedicated-process",
        location: "C:/tmp/case-3928/verify-server",
        identifiers: {
          path: "C:/tmp/case-3928/verify-server",
          contentHash: "sha256:aaaa1111",
          pid: "4242",
          commandLine: "bun run verify-server.ts --port 18080",
          url: "http://127.0.0.1:18080",
        },
      });
      const proposal = buildDeletionProposal(entry);
      expect(proposal.entryId).toBe("vr-3928-1");
      expect(proposal.kind).toBe("dedicated-process");
      expect(proposal.location).toBe("C:/tmp/case-3928/verify-server");
      expect(proposal.identifiers.path).toBe("C:/tmp/case-3928/verify-server");
      expect(proposal.identifiers.contentHash).toBe("sha256:aaaa1111");
      expect(proposal.identifiers.pid).toBe("4242");
      expect(proposal.identifiers.commandLine).toBe("bun run verify-server.ts --port 18080");
      expect(proposal.identifiers.url).toBe("http://127.0.0.1:18080");
      // 人間可読の提示文にも識別情報が現れる（HITL 提示面）。
      expect(proposal.presentation).toContain("dedicated-process");
      expect(proposal.presentation).toContain("C:/tmp/case-3928/verify-server");
      expect(proposal.presentation).toContain("4242");
      expect(proposal.presentation).toContain("http://127.0.0.1:18080");
    });

    test("remote の削除提案には所在 URL と識別情報が付与される", () => {
      const entry = ledgerEntry({
        kind: "remote",
        location: "https://example.com/verify.git",
        identifiers: { url: "https://example.com/verify.git" },
      });
      const proposal = buildDeletionProposal(entry);
      expect(proposal.identifiers.url).toBe("https://example.com/verify.git");
    });
  });

  describe("削除実行の確認境界（決定的判定）", () => {
    test("利用者の明示確認と全識別情報の一致がある対象の削除だけを許可する", () => {
      const entry = ledgerEntry();
      const evaluation = evaluateDeletionConfirmation(
        [entry],
        [userConfirmation()],
        [observation()],
      );
      expect(evaluation.permitted).toBe(true);
      expect(evaluation.confirmedIds).toEqual(["vr-3928-1"]);
      expect(evaluation.refusals.length).toBe(0);
    });

    test("確認なしの削除は実行しない", () => {
      const entry = ledgerEntry();
      const evaluation = evaluateDeletionConfirmation([entry], [], [observation()]);
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("confirmation-missing");
    });

    test("実行担当が生成した approval 等の機械可読値だけでは削除が実行されない", () => {
      const entry = ledgerEntry();
      const machineConfirmation = userConfirmation({ source: "machine-issued" });
      const evaluation = evaluateDeletionConfirmation(
        [entry],
        [machineConfirmation],
        [observation()],
      );
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("machine-confirmation-not-accepted");
      // 機械可読値の確認があった対象は削除許可対象に含めない。
      expect(evaluation.confirmedIds).toEqual([]);
    });

    test("削除提案からの対象の追加変更（識別情報不一致）では削除を実行しない", () => {
      const entry = ledgerEntry();
      const changedObservation = observation({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify", extraOutput: "C:/tmp/extra" },
      });
      const evaluation = evaluateDeletionConfirmation(
        [entry],
        [userConfirmation()],
        [changedObservation],
      );
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("identifier-mismatch");
    });

    test("別物への入替え（内容識別の不一致）では削除を実行しない", () => {
      const entry = ledgerEntry({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", contentHash: "sha256:aaaa1111" },
      });
      const substituted = observation({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", contentHash: "sha256:bbbb2222" },
      });
      const confirmation = userConfirmation({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", contentHash: "sha256:aaaa1111" },
      });
      const evaluation = evaluateDeletionConfirmation([entry], [confirmation], [substituted]);
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("identifier-mismatch");
    });

    test("同名別物（パス同一・内容識別不一致）では削除を実行しない", () => {
      const entry = ledgerEntry({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", contentHash: "sha256:aaaa1111" },
      });
      const sameNameDifferentObject = observation({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", contentHash: "sha256:cccc3333" },
      });
      const confirmation = userConfirmation({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", contentHash: "sha256:aaaa1111" },
      });
      const evaluation = evaluateDeletionConfirmation([entry], [confirmation], [sameNameDifferentObject]);
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("identifier-mismatch");
      expect(evaluation.refusals[0]?.detail).toContain("contentHash");
    });

    test("PID再利用（PID同一・コマンドライン不一致）では削除を実行しない", () => {
      const entry = ledgerEntry({
        kind: "dedicated-process",
        identifiers: { pid: "4242", commandLine: "bun run verify-server.ts --port 18080" },
      });
      const reusedPid = observation({
        kind: "dedicated-process",
        identifiers: { pid: "4242", commandLine: "bun run unrelated-server.ts --port 9090" },
      });
      const confirmation = userConfirmation({
        identifiers: { pid: "4242", commandLine: "bun run verify-server.ts --port 18080" },
      });
      const evaluation = evaluateDeletionConfirmation([entry], [confirmation], [reusedPid]);
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("identifier-mismatch");
      expect(evaluation.refusals[0]?.detail).toContain("commandLine");
    });

    test("symlink/junction の参照先不一致では削除を実行しない（参照先誤消去の防止）", () => {
      const entry = ledgerEntry({
        kind: "helper-script",
        identifiers: { path: "C:/tmp/case-3928/link", linkTarget: "C:/tmp/case-3928/real-target" },
      });
      const redirectedLink = observation({
        kind: "helper-script",
        identifiers: { path: "C:/tmp/case-3928/link", linkTarget: "C:/tmp/case-3928/other-target" },
      });
      const confirmation = userConfirmation({
        identifiers: { path: "C:/tmp/case-3928/link", linkTarget: "C:/tmp/case-3928/real-target" },
      });
      const evaluation = evaluateDeletionConfirmation([entry], [confirmation], [redirectedLink]);
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("identifier-mismatch");
      expect(evaluation.refusals[0]?.detail).toContain("linkTarget");
    });

    test("確認済み識別情報との対応を残置許容の例外として流用した確認では削除を実行しない", () => {
      const entry = ledgerEntry();
      const residueAllowanceConfirmation = userConfirmation({ purpose: "residue-allowance" });
      const evaluation = evaluateDeletionConfirmation(
        [entry],
        [residueAllowanceConfirmation],
        [observation()],
      );
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("confirmation-purpose-not-deletion");
    });

    test("利用者確認の識別情報スナップショットが台帳記録と一致しない場合は削除を実行しない", () => {
      const entry = ledgerEntry();
      const mismatchedConfirmation = userConfirmation({
        identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#other" },
      });
      const evaluation = evaluateDeletionConfirmation(
        [entry],
        [mismatchedConfirmation],
        [observation()],
      );
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("confirmation-target-mismatch");
    });

    test("削除実行直前の観測がない対象は照合不能として削除を実行しない", () => {
      const entry = ledgerEntry();
      const evaluation = evaluateDeletionConfirmation([entry], [userConfirmation()], []);
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("observation-missing");
    });

    test("台帳登録済み資材が削除確認記録なしに回収（消失）した場合は削除確認の不存在として検出する", () => {
      const vanished: VerificationResourceEntry = {
        ...ledgerEntry(),
        collectedAt: "2026-11-05T11:00:00.000Z",
      };
      const evaluation = evaluateDeletionConfirmation([vanished], [], []);
      expect(evaluation.permitted).toBe(false);
      expect(evaluation.refusals[0]?.code).toBe("deletion-confirmation-record-missing");
    });

    test("削除確認記録付きの回収済み資材は削除確認不存在として検出しない", () => {
      const collected: VerificationResourceEntry = {
        ...ledgerEntry(),
        collectedAt: "2026-11-05T12:10:00.000Z",
        deletionConfirmation: {
          source: "user-explicit",
          confirmedBy: "user",
          confirmedAt: "2026-11-05T12:00:00.000Z",
          identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify" },
        },
      };
      const evaluation = evaluateDeletionConfirmation([collected], [], []);
      expect(evaluation.permitted).toBe(true);
      expect(evaluation.refusals.length).toBe(0);
    });
  });

  describe("台帳への削除確認状態追跡（collectedAt 再利用）", () => {
    test("削除確認記録の台帳付与は対象エントリへ記録され、既存記録を壊さない", () => {
      const existing = serializeLedger([
        ledgerEntry(),
        ledgerEntry({ id: "vr-3928-2", identifiers: { path: "C:/tmp/other" } }),
      ]);
      const io = fakeIo(existing);
      const result = recordDeletionConfirmation(io, "C:/repo/main", "3928", "vr-3928-1", {
        source: "user-explicit",
        confirmedBy: "user",
        confirmedAt: "2026-11-05T12:00:00.000Z",
        identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify" },
      });
      expect(result.ok).toBe(true);
      expect(io.written.length).toBe(1);
      const parsed = parseLedgerText(io.written[0]!.content);
      expect(parsed.length).toBe(2);
      expect(parsed[0]!.deletionConfirmation?.source).toBe("user-explicit");
      expect(parsed[0]!.deletionConfirmation?.identifiers.path).toBe("C:/tmp/case-3928/verify-clone");
      expect(parsed[1]!.deletionConfirmation).toBeUndefined();
    });

    test("削除確認記録なしのエントリへの回収（削除）記録付与を拒否する（fail-closed）", () => {
      const existing = serializeLedger([ledgerEntry()]);
      const io = fakeIo(existing);
      expect(() =>
        markEntryCollected(io, "C:/repo/main", "3928", "vr-3928-1", "2026-11-05T12:10:00.000Z"),
      ).toThrow(LedgerInputError);
      expect(io.written.length).toBe(0);
    });

    test("削除確認記録付きのエントリへの回収（削除）記録付与は collectedAt を設定する", () => {
      const entryWithConfirmation: VerificationResourceEntry = {
        ...ledgerEntry(),
        deletionConfirmation: {
          source: "user-explicit",
          confirmedBy: "user",
          confirmedAt: "2026-11-05T12:00:00.000Z",
          identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify" },
        },
      };
      const io = fakeIo(serializeLedger([entryWithConfirmation]));
      const result = markEntryCollected(io, "C:/repo/main", "3928", "vr-3928-1", "2026-11-05T12:10:00.000Z");
      expect(result.ok).toBe(true);
      const parsed = parseLedgerText(io.written[0]!.content);
      expect(parsed[0]!.collectedAt).toBe("2026-11-05T12:10:00.000Z");
      expect(parsed[0]!.deletionConfirmation?.source).toBe("user-explicit");
    });

    test("実 fs での削除確認記録の往復（一時領域・afterAll 削除）", () => {
      const mainRoot = path.join(FIXTURE_ROOT, "main-repo");
      const ledgerDir = path.join(mainRoot, ".agentdev", "tmp", "verification-resources");
      fs.mkdirSync(ledgerDir, { recursive: true });
      const ledgerPath = path.join(ledgerDir, "3928.json");
      fs.writeFileSync(ledgerPath, serializeLedger([ledgerEntry()]), "utf8");
      const nodeIo: LedgerIo = {
        exists(p) {
          return fs.existsSync(p);
        },
        readTextFile(p) {
          return fs.readFileSync(p, "utf8");
        },
        writeTextFile(p, content) {
          fs.writeFileSync(p, content, "utf8");
        },
        mkdirRecursive(p) {
          fs.mkdirSync(p, { recursive: true });
        },
        gitCommonDir() {
          return path.join(mainRoot, ".git");
        },
      };
      recordDeletionConfirmation(nodeIo, mainRoot, "3928", "vr-3928-1", {
        source: "user-explicit",
        confirmedBy: "user",
        confirmedAt: "2026-11-05T12:00:00.000Z",
        identifiers: { path: "C:/tmp/case-3928/verify-clone", repoIdentity: "agent-dev-flow#verify" },
      });
      const parsed = parseLedgerText(fs.readFileSync(ledgerPath, "utf8"));
      expect(parsed[0]!.deletionConfirmation?.source).toBe("user-explicit");
      markEntryCollected(nodeIo, mainRoot, "3928", "vr-3928-1", "2026-11-05T12:10:00.000Z");
      const afterCollect = parseLedgerText(fs.readFileSync(ledgerPath, "utf8"));
      expect(afterCollect[0]!.collectedAt).toBe("2026-11-05T12:10:00.000Z");
    });
  });

});
