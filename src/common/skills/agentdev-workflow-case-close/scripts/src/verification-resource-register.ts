//
// 検証用一時資材の作成ヘルパー（作成と同時の台帳登録の正規入口）。
// case-open・case-run・委譲先からの作成報告を受領する実行処理から呼び出され、
// 検証用一時資材を案件スコープの専用領域へ作成した実行処理が、作成と同時に
// 台帳（生成記録）へ登録するために使用する。
// 様式の正は 検証用一時資材のライフサイクル Design「台帳（生成記録）」節、
// 委譲先への作成義務・報告義務の接続は v4-delegation-contracts Design
// 「検証用一時資材の作成・報告義務」節。
//
// 呼出し:
//   bun ./src/common/skills/agentdev-workflow-case-close/scripts/src/verification-resource-register.ts \
//     --case <案件識別子> --kind <種別> --location <所在> \
//     --ownership <parent|child|common> [--child <子Issue番号>] \
//     --collector <回収担当（記録した入口の識別）> --recorded-by <作成経路（記録主体）> \
//     --identifier <key=value>... [--main-repo-root <パス>] [--now <ISO時刻>]
// 出力: stdout に登録結果 JSON。終了コード: 成功 0、登録拒否 1。
// 必須項目欠落・列挙外の値は台帳を書換えずに拒否する（fail-closed）。
//

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";

import {
  LedgerInputError,
  registerResource,
  resolveMainRepoRoot,
  validateRegistrationInput,
  type LedgerIo,
} from "./verification-resources-ledger";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-close/scripts/src/verification-resource-register.ts --case <caseId> --kind <kind> --location <path-or-url> --ownership <parent|child|common> [--child <issueNumber>] --collector <entryPoint> --recorded-by <recorder> --identifier <key=value>... [--main-repo-root <path>] [--now <iso>]`;

/** CLI 引数の解析結果。mainRepoRoot は未指定時は git 解決（worktree-context 独立）。 */
export interface RegisterCliArgs {
  input: ReturnType<typeof validateRegistrationInput>;
  mainRepoRoot: string | null;
}

/** CLI 引数を登録入力へ解析する。必須引数欠落・不正値は LedgerInputError。 */
export function parseRegisterArgs(
  argv: readonly string[],
  nowProvider: () => string,
): RegisterCliArgs {
  const flags: Record<string, string> = {};
  const identifiers: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;
    const eqIndex = arg.indexOf("=");
    const isIdentifier = arg.startsWith("--identifier=");
    let flag: string;
    let value: string;
    if (eqIndex > 2 && (arg.startsWith("--") && (isIdentifier || isKnownFlagName(arg.slice(2, eqIndex))))) {
      flag = isIdentifier ? "--identifier" : `--${arg.slice(2, eqIndex)}`;
      value = arg.slice(eqIndex + 1);
    } else if (arg.startsWith("--") && argv[i + 1] !== undefined) {
      flag = arg;
      value = argv[i + 1]!;
      i += 1;
    } else {
      throw new LedgerInputError(`unknown or malformed argument: ${arg}\n${USAGE}`);
    }
    if (flag === "--identifier") {
      const separator = value.indexOf("=");
      if (separator <= 0 || separator === value.length - 1) {
        throw new LedgerInputError(`--identifier requires key=value form (got: ${value})`);
      }
      identifiers[value.slice(0, separator)] = value.slice(separator + 1);
      continue;
    }
    flags[flag] = value;
  }
  for (const flagName of Object.keys(flags)) {
    if (!isKnownFlagName(flagName.slice(2))) {
      throw new LedgerInputError(`unknown argument: ${flagName}\n${USAGE}`);
    }
  }
  const childIssueRaw = flags["--child"];
  let childIssue: number | null = null;
  if (childIssueRaw !== undefined) {
    const parsed = Number(childIssueRaw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new LedgerInputError(`--child requires a positive integer issue number (got: ${childIssueRaw})`);
    }
    childIssue = parsed;
  }
  const input = validateRegistrationInput({
    caseId: flags["--case"] ?? "",
    kind: flags["--kind"] ?? "",
    location: flags["--location"] ?? "",
    identifiers,
    collector: flags["--collector"] ?? "",
    ownership: flags["--ownership"] ?? "",
    childIssue,
    recordedBy: flags["--recorded-by"] ?? "",
    createdAt: flags["--now"] ?? nowProvider(),
  });
  return { input, mainRepoRoot: flags["--main-repo-root"] ?? null };
}

const KNOWN_FLAG_NAMES = [
  "case",
  "kind",
  "location",
  "ownership",
  "child",
  "collector",
  "recorded-by",
  "identifier",
  "main-repo-root",
  "now",
] as const;

function isKnownFlagName(name: string): boolean {
  return (KNOWN_FLAG_NAMES as readonly string[]).includes(name);
}

/** node 実行時の LedgerIo。gitCommonDir はメインrepo の .git を返す（worktree cwd でもメインrepo 基準）。 */
export function createNodeLedgerIo(cwd: string): LedgerIo {
  return {
    exists(absolutePath) {
      return fs.existsSync(absolutePath);
    },
    readTextFile(absolutePath) {
      return fs.readFileSync(absolutePath, "utf8");
    },
    writeTextFile(absolutePath, content) {
      fs.writeFileSync(absolutePath, content, "utf8");
    },
    mkdirRecursive(absolutePath) {
      fs.mkdirSync(absolutePath, { recursive: true });
    },
    gitCommonDir() {
      const result = spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
        cwd,
        encoding: "utf8",
      });
      if (result.status !== 0) {
        throw new LedgerInputError(
          `git rev-parse --path-format=absolute --git-common-dir failed (exit ${result.status}): ${result.stderr.trim()}`,
        );
      }
      return result.stdout;
    },
  };
}

/** CLI 実行。登録結果 JSON を stdout へ出力し終了コードを返す（成功 0、登録拒否 1）。 */
export function runRegisterCli(
  argv: readonly string[],
  io: LedgerIo,
  nowProvider: () => string,
  out: { writeStdout(text: string): void; writeStderr(text: string): void },
): number {
  try {
    const args = parseRegisterArgs(argv, nowProvider);
    const mainRepoRoot = args.mainRepoRoot ?? resolveMainRepoRoot(io);
    const result = registerResource(io, mainRepoRoot, args.input);
    out.writeStdout(`${JSON.stringify(result)}\n`);
    return 0;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    out.writeStderr(`error: ${message}\n`);
    return 1;
  }
}

if (import.meta.main) {
  const exitCode = runRegisterCli(
    process.argv.slice(2),
    createNodeLedgerIo(process.cwd()),
    () => new Date().toISOString(),
    { writeStdout: (text) => process.stdout.write(text), writeStderr: (text) => process.stderr.write(text) },
  );
  process.exit(exitCode);
}
