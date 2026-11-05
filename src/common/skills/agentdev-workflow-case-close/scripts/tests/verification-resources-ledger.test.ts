import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

import {
  appendEntry,
  evaluateChildCompletion,
  evaluateParentTerminationUnit,
  isConfirmedEmptyBasis,
  LedgerFormatError,
  LedgerInputError,
  parseLedgerText,
  readLedger,
  registerResource,
  resolveLedgerPath,
  resolveMainRepoRoot,
  serializeLedger,
  validateRegistrationInput,
  type LedgerIo,
  type VerificationResourceEntry,
  type VerificationResourceRegistrationInput,
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
const FIXTURE_ROOT = path.join(REPO_ROOT, ".agentdev/tmp/test-fixture-verification-resources");

afterAll(() => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
});

function validInput(overrides: Partial<VerificationResourceRegistrationInput> = {}): VerificationResourceRegistrationInput {
  return {
    caseId: "3928",
    kind: "clone",
    location: "C:/tmp/case-3928/verification-clone",
    identifiers: { path: "C:/tmp/case-3928/verification-clone", repoIdentity: "agent-dev-flow#issue-3930" },
    collector: "case-run:3930",
    ownership: "child",
    childIssue: 3930,
    recordedBy: "case-run",
    createdAt: "2026-11-05T12:00:00.000Z",
    ...overrides,
  };
}

/** メインrepo root を差し替え可能な偽 I/O。 */
function fakeIo(overrides: {
  mainGitCommonDir?: string;
  existingLedgerText?: string | null;
} = {}): LedgerIo & { written: { absolutePath: string; content: string }[] } {
  const ledgerText = overrides.existingLedgerText === undefined ? null : overrides.existingLedgerText;
  return {
    written: [],
    exists(absolutePath) {
      return ledgerText !== null && absolutePath.endsWith(".json");
    },
    readTextFile() {
      if (ledgerText === null) throw new Error("unexpected read of missing file");
      return ledgerText;
    },
    writeTextFile(absolutePath, content) {
      this.written.push({ absolutePath, content });
    },
    mkdirRecursive() {},
    gitCommonDir() {
      return overrides.mainGitCommonDir ?? "C:/repo/main/.git";
    },
  };
}

describe("検証用一時資材 台帳モジュール（生成記録）", () => {
  describe("台帳の保存場所と worktree-context 独立解決", () => {
    test("台帳パスはメインrepo root の .agentdev/tmp/verification-resources/{案件識別子}.json で案件単位に分離される", () => {
      const p1 = resolveLedgerPath("C:/repo/main", "3928");
      const p2 = resolveLedgerPath("C:/repo/main", "3900");
      expect(p1.replace(/\\/g, "/")).toBe("C:/repo/main/.agentdev/tmp/verification-resources/3928.json");
      expect(p2.replace(/\\/g, "/")).toBe("C:/repo/main/.agentdev/tmp/verification-resources/3900.json");
    });

    test("メインrepo root は git rev-parse --path-format=absolute --git-common-dir の返り値から解決し、worktree の .git ファイルでもメインrepo の .git ディレクトリ由来になる", () => {
      // worktree 内では .git はファイルであり、--git-common-dir はメインrepo の .git ディレクトリを返す。
      const io = fakeIo({ mainGitCommonDir: "C:/repo/main/.git" });
      expect(resolveMainRepoRoot(io).replace(/\\/g, "/")).toBe("C:/repo/main");
    });
  });

  describe("空状態の区別", () => {
    test("台帳ファイル不在は missing 状態として返す", () => {
      const io = fakeIo({ existingLedgerText: null });
      const result = readLedger(io, "C:/repo/main/.agentdev/tmp/verification-resources/3928.json");
      expect(result.state).toBe("missing");
    });

    test("台帳ファイルが存在し記録ゼロの場合は不在と区別される", () => {
      const io = fakeIo({ existingLedgerText: "[]" });
      const result = readLedger(io, "C:/repo/main/.agentdev/tmp/verification-resources/3928.json");
      expect(result.state).toBe("present");
      expect(result.entries.length).toBe(0);
    });

    test("台帳不在は作成物なしの根拠にならず、記録ゼロの台帳だけが作成物なしの根拠になる", () => {
      const missing = readLedger(fakeIo({ existingLedgerText: null }), "C:/x/3928.json");
      const presentEmpty = readLedger(fakeIo({ existingLedgerText: "[]" }), "C:/x/3928.json");
      expect(isConfirmedEmptyBasis(missing)).toBe(false);
      expect(isConfirmedEmptyBasis(presentEmpty)).toBe(true);
    });

    test("破損台帳（不正 JSON・不正エントリ）は空扱いにせず fail-closed で拒否する", () => {
      expect(() => parseLedgerText("not-json")).toThrow(LedgerFormatError);
      expect(() => parseLedgerText(JSON.stringify([{ id: "x" }]))).toThrow(LedgerFormatError);
    });
  });

  describe("登録（必須項目の記録と fail-closed 検証）", () => {
    test("必須項目（案件・種別・所在・識別情報・回収担当・所有区分・作成経路・作成時刻）を保持した記録を台帳へ登録する", () => {
      const validated = validateRegistrationInput(validInput());
      const { entry } = appendEntry([], validated);
      expect(entry.caseId).toBe("3928");
      expect(entry.kind).toBe("clone");
      expect(entry.location).toBe("C:/tmp/case-3928/verification-clone");
      expect(entry.identifiers.repoIdentity).toBe("agent-dev-flow#issue-3930");
      expect(entry.collector).toBe("case-run:3930");
      expect(entry.ownership).toBe("child");
      expect(entry.childIssue).toBe(3930);
      expect(entry.recordedBy).toBe("case-run");
      expect(entry.createdAt).toBe("2026-11-05T12:00:00.000Z");
      expect(entry.collectedAt).toBeNull();
    });

    test("識別情報が空の登録は拒否する", () => {
      expect(() => validateRegistrationInput(validInput({ identifiers: {} }))).toThrow(LedgerInputError);
    });

    test("種別が許容列挙外の登録は拒否する", () => {
      expect(() =>
        validateRegistrationInput(validInput({ kind: "unknown-kind" as never })),
      ).toThrow(LedgerInputError);
    });

    test("所有区分が許容列挙外の登録は拒否する", () => {
      expect(() =>
        validateRegistrationInput(validInput({ ownership: "shared" as never })),
      ).toThrow(LedgerInputError);
    });

    test("所有区分 child は子Issue番号必須で、欠落時は拒否する", () => {
      expect(() => validateRegistrationInput(validInput({ childIssue: null }))).toThrow(LedgerInputError);
    });

    test("必須項目欠落の入力（自由文の自己申告だけの経路）では台帳記録が成立しない", () => {
      // 案件・所在・回収担当の欠落は登録入力として拒否される（fail-closed）。
      expect(() => validateRegistrationInput(validInput({ caseId: "" }))).toThrow(LedgerInputError);
      expect(() => validateRegistrationInput(validInput({ location: "" }))).toThrow(LedgerInputError);
      expect(() => validateRegistrationInput(validInput({ collector: "" }))).toThrow(LedgerInputError);
      expect(() => validateRegistrationInput(validInput({ createdAt: "" }))).toThrow(LedgerInputError);
    });

    test("登録IDは台帳内で一意の連番を採番する", () => {
      const first = appendEntry([], validateRegistrationInput(validInput())).entry;
      const second = appendEntry([first], validateRegistrationInput(validInput())).entry;
      expect(first.id).not.toBe(second.id);
      expect(first.id.startsWith("vr-3928-")).toBe(true);
      expect(second.id.startsWith("vr-3928-")).toBe(true);
    });

    test("台帳へ直列化した記録は解析で往復する", () => {
      const { entry } = appendEntry([], validateRegistrationInput(validInput()));
      const parsed = parseLedgerText(serializeLedger([entry]));
      expect(parsed.length).toBe(1);
      expect(parsed[0]!).toEqual(entry);
    });
  });

  describe("評価単位（親・子・共通の所有区分）", () => {
    const childUncollected: VerificationResourceEntry = {
      id: "vr-3928-1",
      caseId: "3928",
      kind: "remote",
      location: "https://example.com/verify.git",
      identifiers: { url: "https://example.com/verify.git" },
      collector: "case-open:3928",
      ownership: "child",
      childIssue: 3930,
      recordedBy: "case-open",
      createdAt: "2026-11-05T10:00:00.000Z",
      collectedAt: null,
    };
    const childCollected: VerificationResourceEntry = { ...childUncollected, id: "vr-3928-2", collectedAt: "2026-11-05T11:00:00.000Z" };
    const parentResidue: VerificationResourceEntry = {
      ...childUncollected,
      id: "vr-3928-3",
      kind: "bare-repository",
      ownership: "parent",
      childIssue: null,
    };
    const commonResidue: VerificationResourceEntry = {
      ...childUncollected,
      id: "vr-3928-4",
      kind: "temporary-output",
      ownership: "common",
      childIssue: null,
    };

    test("子完了判定は子所有の一時資材のみを評価し、子所有が全回収済みなら子close許可になる", () => {
      const evaluation = evaluateChildCompletion([childCollected, parentResidue, commonResidue], 3930);
      expect(evaluation.childOwnedTotal).toBe(1);
      expect(evaluation.childOwnedUncollected).toBe(0);
      expect(evaluation.childClosePermitted).toBe(true);
    });

    test("子所有に未回収が残る場合は子close許可にならない", () => {
      const evaluation = evaluateChildCompletion([childUncollected], 3930);
      expect(evaluation.childClosePermitted).toBe(false);
    });

    test("子close許可判定では他の子Issue所有の資材を評価しない", () => {
      const otherChild: VerificationResourceEntry = { ...childUncollected, id: "vr-3928-5", childIssue: 3931 };
      const evaluation = evaluateChildCompletion([childCollected, otherChild], 3930);
      expect(evaluation.childOwnedTotal).toBe(1);
      expect(evaluation.childClosePermitted).toBe(true);
    });

    test("親・共通の一時資材が残存する場合、親の管理する終了単位は全体未完了として機械判定される", () => {
      const evaluation = evaluateChildCompletion([childCollected, parentResidue, commonResidue], 3930);
      expect(evaluation.terminationUnitBlocked).toBe(true);
      expect(evaluation.parentOrCommonResidue.map((r) => r.ownership).sort()).toEqual(["common", "parent"]);
    });

    test("親・共通が回収済みで子所有も全回収済みのときは終了単位は未完了にならない", () => {
      const collectedParent: VerificationResourceEntry = { ...parentResidue, collectedAt: "2026-11-05T12:00:00.000Z" };
      const collectedCommon: VerificationResourceEntry = { ...commonResidue, collectedAt: "2026-11-05T12:00:00.000Z" };
      const evaluation = evaluateChildCompletion([childCollected, collectedParent, collectedCommon], 3930);
      expect(evaluation.terminationUnitBlocked).toBe(false);
    });

    test("親の管理する終了単位の評価は親・共通・子の全件を評価し、全件回収済みのときだけ完了になる", () => {
      const complete = evaluateParentTerminationUnit([childCollected, parentResidue, commonResidue].map((e) =>
        e.id === parentResidue.id || e.id === commonResidue.id ? { ...e, collectedAt: "2026-11-05T12:00:00.000Z" } : e,
      ));
      expect(complete.terminationUnitComplete).toBe(true);
      const blocked = evaluateParentTerminationUnit([childCollected, parentResidue, commonResidue]);
      expect(blocked.uncollected).toBe(2);
      expect(blocked.uncollectedByOwnership.parent).toBe(1);
      expect(blocked.uncollectedByOwnership.common).toBe(1);
      expect(blocked.terminationUnitComplete).toBe(false);
    });
  });

  describe("作成と同時の台帳登録（作成ヘルパー本体）", () => {
    test("登録→保存を1回の呼出で行い、台帳不在の案件では新規台帳を作成する", () => {
      const io = fakeIo({ existingLedgerText: null });
      const result = registerResource(io, "C:/repo/main", validInput());
      expect(result.ok).toBe(true);
      expect(io.written.length).toBe(1);
      expect(io.written[0]!.absolutePath.replace(/\\/g, "/")).toBe(
        "C:/repo/main/.agentdev/tmp/verification-resources/3928.json",
      );
      const parsed = parseLedgerText(io.written[0]!.content);
      expect(parsed.length).toBe(1);
      expect(parsed[0]!.id).toBe(result.entryId);
      expect(result.entryCount).toBe(1);
    });

    test("既存台帳への登録は追記になり、既存記録を壊さない", () => {
      const existing = serializeLedger([appendEntry([], validateRegistrationInput(validInput())).entry]);
      const io = fakeIo({ existingLedgerText: existing });
      const result = registerResource(
        io,
        "C:/repo/main",
        validInput({ kind: "capture-log", location: "C:/tmp/case-3928/verification.log" }),
        { tempRoot: "C:/Users/verify/AppData/Local/Temp" },
      );
      const parsed = parseLedgerText(io.written[0]!.content);
      expect(parsed.length).toBe(2);
      expect(parsed[0]!.id).not.toBe(parsed[1]!.id);
      expect(result.entryCount).toBe(2);
    });

    test("必須項目欠落の入力は台帳を書換えずに拒否する（fail-closed）", () => {
      const io = fakeIo({ existingLedgerText: "[]" });
      expect(() => registerResource(io, "C:/repo/main", validInput({ identifiers: {} }))).toThrow(LedgerInputError);
      expect(io.written.length).toBe(0);
    });
  });

  describe("作成先確認（環境指定TEMPまたは案件専用領域への制限）", () => {
    const tempRoot = "C:/Users/verify/AppData/Local/Temp";

    test("作成先が環境指定TEMP配下の絶対パスの場合は登録する", () => {
      const io = fakeIo({ existingLedgerText: null });
      const location = `${tempRoot}/adf-3928-verify/verification.log`;
      const result = registerResource(
        io,
        "C:/repo/main",
        validInput({ location, identifiers: { path: location } }),
        { tempRoot },
      );
      expect(result.ok).toBe(true);
      expect(io.written.length).toBe(1);
    });

    test("作成先が案件識別子をパス要素に含む案件専用領域（repo外）の場合は登録する", () => {
      const io = fakeIo({ existingLedgerText: null });
      const result = registerResource(
        io,
        "C:/repo/main",
        validInput({ location: "D:/adf-cases/case-3928/verify-clone" }),
        { tempRoot },
      );
      expect(result.ok).toBe(true);
      expect(io.written.length).toBe(1);
    });

    test("URL形の所在（remote種別）は作成先確認の対象外として登録する", () => {
      const io = fakeIo({ existingLedgerText: null });
      const result = registerResource(
        io,
        "C:/repo/main",
        validInput({
          kind: "remote",
          location: "https://github.com/example/adf-3928-verify-target.git",
        }),
        { tempRoot },
      );
      expect(result.ok).toBe(true);
    });

    test("プロジェクト親ディレクトリ等の案件識別子を含まない作成先違反は機械拒否し、台帳を書換えない", () => {
      const io = fakeIo({ existingLedgerText: null });
      for (const location of [
        "C:/work/adf-ru0255-github-verify",
        "C:/work/verify-RU0258-public/env",
        tempRoot.replace(/\/$/, "") + "..",
      ]) {
        expect(() =>
          registerResource(io, "C:/repo/main", validInput({ location }), { tempRoot }),
        ).toThrow(LedgerInputError);
      }
      expect(io.written.length).toBe(0);
    });

    test("リポジトリ内部（プロジェクトディレクトリ配下）の作成先は案件専用領域でないため拒否する", () => {
      const io = fakeIo({ existingLedgerText: null });
      expect(() =>
        registerResource(
          io,
          "C:/repo/main",
          validInput({ location: "C:/repo/main/.agentdev/tmp/verify-clone" }),
          { tempRoot },
        ),
      ).toThrow(LedgerInputError);
      expect(io.written.length).toBe(0);
    });

    test("相対パスの作成先は絶対パスを要求して拒否する", () => {
      const io = fakeIo({ existingLedgerText: null });
      expect(() =>
        registerResource(io, "C:/repo/main", validInput({ location: "./verify-clone" }), {
          tempRoot,
        }),
      ).toThrow(LedgerInputError);
      expect(io.written.length).toBe(0);
    });
  });

  describe("実 fs での台帳往復（一時領域・afterAll 削除）", () => {
    test("登録→保存→読み出しの往復で記録内容が保持され、不在と記録ゼロが区別される", () => {
      const mainRoot = path.join(FIXTURE_ROOT, "main-repo");
      const ledgerDir = path.join(mainRoot, ".agentdev", "tmp", "verification-resources");
      fs.mkdirSync(ledgerDir, { recursive: true });
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
      const ledgerPath = resolveLedgerPath(mainRoot, "3928");
      // 不在（記録欠落）の読取。
      expect(readLedger(nodeIo, ledgerPath).state).toBe("missing");
      expect(isConfirmedEmptyBasis(readLedger(nodeIo, ledgerPath))).toBe(false);
      // 登録と往復。
      const result = registerResource(nodeIo, mainRoot, validInput());
      const after = readLedger(nodeIo, ledgerPath);
      expect(after.state).toBe("present");
      expect(after.entries.length).toBe(1);
      expect(after.entries[0]!.id).toBe(result.entryId);
      // 記録ゼロ台帳の作成。
      const emptyLedgerPath = resolveLedgerPath(mainRoot, "3900");
      nodeIo.writeTextFile(emptyLedgerPath, serializeLedger([]));
      const emptyRead = readLedger(nodeIo, emptyLedgerPath);
      expect(emptyRead.state).toBe("present");
      expect(emptyRead.entries.length).toBe(0);
      expect(isConfirmedEmptyBasis(emptyRead)).toBe(true);
    });
  });
});
