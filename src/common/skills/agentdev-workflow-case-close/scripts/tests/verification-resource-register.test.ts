import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

import {
  LedgerInputError,
  parseLedgerText,
  type LedgerIo,
} from "../src/verification-resources-ledger";
import {
  parseRegisterArgs,
  runRegisterCli,
} from "../src/verification-resource-register";
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
const FIXTURE_ROOT = path.join(REPO_ROOT, ".agentdev/tmp/test-fixture-verification-resource-register");
const FIXED_NOW = "2026-11-05T12:30:00.000Z";

afterAll(() => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
});

function fakeIo(overrides: { existingLedgerText?: string | null } = {}): LedgerIo & {
  written: { absolutePath: string; content: string }[];
} {
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
      return "C:/repo/main/.git";
    },
  };
}

function outBuffer() {
  return {
    stdout: "",
    stderr: "",
    writeStdout(text: string) {
      this.stdout += text;
    },
    writeStderr(text: string) {
      this.stderr += text;
    },
  };
}

function baseArgs(overrides: string[] = []): string[] {
  return [
    "--case",
    "3928",
    "--kind",
    "capture-log",
    "--location",
    "C:/tmp/case-3928/verification.log",
    "--ownership",
    "child",
    "--child",
    "3930",
    "--collector",
    "case-run:3930",
    "--recorded-by",
    "case-run",
    "--identifier",
    "path=C:/tmp/case-3928/verification.log",
    "--identifier",
    "size=1024",
    ...overrides,
  ];
}

describe("検証用一時資材 作成ヘルパー（verification-resource-register）", () => {
  describe("引数解析（parseRegisterArgs）", () => {
    test("必須引数から登録入力を構築し、identifier は key=value の繰返しで複数項目を保持する", () => {
      const { input } = parseRegisterArgs(baseArgs(), () => FIXED_NOW);
      expect(input.caseId).toBe("3928");
      expect(input.kind).toBe("capture-log");
      expect(input.location).toBe("C:/tmp/case-3928/verification.log");
      expect(input.ownership).toBe("child");
      expect(input.childIssue).toBe(3930);
      expect(input.collector).toBe("case-run:3930");
      expect(input.recordedBy).toBe("case-run");
      expect(input.identifiers).toEqual({
        path: "C:/tmp/case-3928/verification.log",
        size: "1024",
      });
      expect(input.createdAt).toBe(FIXED_NOW);
    });

    test("--flag=value 形式の引数も解析できる", () => {
      const { input } = parseRegisterArgs(baseArgs(["--case=3929"]), () => FIXED_NOW);
      expect(input.caseId).toBe("3929");
    });

    test("--now 未指定時は nowProvider の現在時刻を作成時刻として採用する", () => {
      const { input } = parseRegisterArgs(baseArgs(), () => "2026-11-05T09:00:00.000Z");
      expect(input.createdAt).toBe("2026-11-05T09:00:00.000Z");
    });

    test("--identifier の key=value 形式違反は拒否する", () => {
      expect(() => parseRegisterArgs(baseArgs(["--identifier", "novalue"]), () => FIXED_NOW)).toThrow(
        LedgerInputError,
      );
      expect(() => parseRegisterArgs(baseArgs(["--identifier", "=value"]), () => FIXED_NOW)).toThrow(
        LedgerInputError,
      );
    });

    test("--child が正の整数でない場合は拒否する", () => {
      expect(() => parseRegisterArgs(baseArgs(["--child", "abc"]), () => FIXED_NOW)).toThrow(LedgerInputError);
      expect(() => parseRegisterArgs(baseArgs(["--child", "0"]), () => FIXED_NOW)).toThrow(LedgerInputError);
    });

    test("必須引数の欠落は登録入力検証で拒否する（自由文の自己申告だけでは記録が成立しない）", () => {
      expect(() => parseRegisterArgs([], () => FIXED_NOW)).toThrow(LedgerInputError);
      expect(() => parseRegisterArgs(argsWithout("--collector"), () => FIXED_NOW)).toThrow(LedgerInputError);
    });

    test("所有区分 parent・common では --child の指定を拒否する", () => {
      expect(() =>
        parseRegisterArgs(baseArgs(["--ownership", "parent"]), () => FIXED_NOW),
      ).toThrow(LedgerInputError);
    });

    test("未知の引数は拒否する", () => {
      expect(() => parseRegisterArgs(baseArgs(["--self-report", "作成済み"]), () => FIXED_NOW)).toThrow(
        LedgerInputError,
      );
    });
  });

  describe("CLI 実行（runRegisterCli）", () => {
    test("成功時は登録結果 JSON を stdout へ出力し終了コード 0、台帳へ登録される", () => {
      const io = fakeIo();
      const out = outBuffer();
      const exitCode = runRegisterCli(baseArgs(), io, () => FIXED_NOW, out);
      expect(exitCode).toBe(0);
      const result = JSON.parse(out.stdout) as { ok: boolean; ledgerPath: string; entryId: string };
      expect(result.ok).toBe(true);
      expect(result.ledgerPath.replace(/\\/g, "/")).toBe(
        "C:/repo/main/.agentdev/tmp/verification-resources/3928.json",
      );
      const parsed = parseLedgerText(io.written[0]!.content);
      expect(parsed.length).toBe(1);
      expect(parsed[0]!.id).toBe(result.entryId);
    });

    test("メインrepo root 未指定時は git common dir から解決し、worktree context でもメインrepo root 基準の台帳へ書込む", () => {
      const io = fakeIo();
      const out = outBuffer();
      const exitCode = runRegisterCli(baseArgs(), io, () => FIXED_NOW, out);
      expect(exitCode).toBe(0);
      const result = JSON.parse(out.stdout) as { ledgerPath: string };
      expect(result.ledgerPath.replace(/\\/g, "/")).toBe(
        "C:/repo/main/.agentdev/tmp/verification-resources/3928.json",
      );
    });

    test("登録拒否時は台帳を書換えずに stderr へ error: を出力し終了コード 1（fail-closed）", () => {
      const io = fakeIo({ existingLedgerText: "[]" });
      const out = outBuffer();
      const exitCode = runRegisterCli(
        baseArgs(["--ownership", "common"]),
        io,
        () => FIXED_NOW,
        out,
      );
      expect(exitCode).toBe(1);
      expect(out.stderr.startsWith("error: ")).toBe(true);
      expect(io.written.length).toBe(0);
    });
  });
});

function argsWithout(flag: string): string[] {
  const args = baseArgs();
  const flagIndex = args.indexOf(flag);
  if (flagIndex < 0) throw new Error(`flag not found in base args: ${flag}`);
  args.splice(flagIndex, 2);
  return args;
}
