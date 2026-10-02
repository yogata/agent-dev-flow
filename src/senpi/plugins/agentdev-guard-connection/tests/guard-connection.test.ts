// Senpi guard 接続の fail-closed 契約テスト（TS-007 スライス: guard 編集操作）。
//
// write/edit/patch の対応編集と生の書込み経路のそれぞれで:
//   1. guard 拒否時に副作用が発生しないこと（fs 書込み API 呼出 0 件）
//   2. 正常操作が正しく許可されること（誤拒否 0 件）
//   3. 検査不能が成功扱いにならないこと（検査不能・検査エラーは block）
// を固定する。
//
// 分布対象パスは repo 相対パス（src/common/skills/agentdev-*/…）で表現する。
// edit の現行内容は GuardEnv.readFile の注入で供給する（OS テンポラリ配下の
// 絶対パスは path 分類の承認テンポラリカテゴリに吸収されるため、分布対象の
// 分類検証には使えない。distribution-boundary-guard-paths.ts 参照）。

import { afterEach, describe, expect, spyOn, test } from "bun:test";
import * as fs from "fs";
import { join } from "node:path";
import { makeGuardEnv, type GuardEnv } from "../../../../common/guards/distribution-boundary/distribution-boundary-guard-env.ts";
import {
  enforceSenpiEditOperation,
  enforceSenpiRawWriteCommand,
  evaluateSenpiEditOperation,
  evaluateSenpiRawWriteCommand,
  GuardBlockError,
} from "../lib/guard-connection.ts";

const DISTRIBUTED_SKILL_PATH = "src/common/skills/agentdev-foo/SKILL.md";
const DISTRIBUTED_COMMAND_PATH = "src/common/commands/agentdev/sample.md";

/**
 * 現行内容をメモリ上で供給する GuardEnv を組む。読取は接続が現行内容の
 * 再構成に使うだけであり、テスト対象の接続は fs 書込みを持たない。
 */
function makeEnvWithCurrentFiles(currentFiles: ReadonlyMap<string, string>): GuardEnv {
  return makeGuardEnv({
    readFile: (path: string) => currentFiles.get(path) ?? null,
  });
}

describe("Senpi 編集操作: 正常操作の許可（誤拒否 0 件）", () => {
  test("非配布パスへの違反含み write も許可される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation(
      "write",
      { path: "docs/designs/integrity/distribution-boundary.md", content: "ref ADR-0135" },
      env,
    );
    expect(verdict.outcome).toBe("allow");
  });

  test("配布対象パスでも内容がクリーンなら許可される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation(
      "write",
      { path: DISTRIBUTED_SKILL_PATH, content: "# plain skill\nbody\n" },
      env,
    );
    expect(verdict.outcome).toBe("allow");
  });

  test("既存内容にクリーンな edit は許可される", () => {
    const env = makeEnvWithCurrentFiles(
      new Map([[DISTRIBUTED_COMMAND_PATH, "ref ADR-0135 here"]]),
    );
    const verdict = evaluateSenpiEditOperation(
      "edit",
      { path: DISTRIBUTED_COMMAND_PATH, oldString: "ADR-0135", newString: "REQ-{NNNN}" },
      env,
    );
    expect(verdict.outcome).toBe("allow");
  });

  test("クリーンな apply_patch は許可される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation(
      "apply_patch",
      { patchText: "*** Begin Patch\n*** Add File: src/common/commands/agentdev/new.md\n+# plain\n*** End Patch" },
      env,
    );
    expect(verdict.outcome).toBe("allow");
  });
});

describe("Senpi 編集操作: guard 拒否（違反検出）", () => {
  test("配布対象への concrete ID 書込みは拒否される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation(
      "write",
      { path: DISTRIBUTED_SKILL_PATH, content: "# title\nSee ADR-0135 for context.\n" },
      env,
    );
    expect(verdict.outcome).toBe("block");
    if (verdict.outcome === "block") expect(verdict.reason).toContain("ADR-0135");
  });

  test("edit が配布対象へ concrete ID を導入するなら拒否される", () => {
    const env = makeEnvWithCurrentFiles(
      new Map([[DISTRIBUTED_SKILL_PATH, "# title\nbody\n"]]),
    );
    const verdict = evaluateSenpiEditOperation(
      "edit",
      { path: DISTRIBUTED_SKILL_PATH, oldString: "body", newString: "ref ADR-0135" },
      env,
    );
    expect(verdict.outcome).toBe("block");
    if (verdict.outcome === "block") expect(verdict.reason).toContain("ADR-0135");
  });

  test("apply_patch の Add File が配布対象へ concrete ID を導入するなら拒否される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation(
      "apply_patch",
      {
        patchText:
          "*** Begin Patch\n*** Add File: " +
          DISTRIBUTED_SKILL_PATH +
          "\n+ref docs/requirements/REQ-0149.md\n*** End Patch",
      },
      env,
    );
    expect(verdict.outcome).toBe("block");
  });
});

describe("Senpi 編集操作: 検査不能の成功扱いなし（fail-closed）", () => {
  test("不明 tool 名は拒否される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation("move_file", { path: "a.md", content: "x" }, env);
    expect(verdict.outcome).toBe("block");
    if (verdict.outcome === "block") expect(verdict.reason).toContain("cannot verify");
  });

  test("write の content 欠落は拒否される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation("write", { path: "a.md" }, env);
    expect(verdict.outcome).toBe("block");
  });

  test("現行内容が読めない edit は検査エラーとして拒否される（検査不能を成功扱いしない）", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation(
      "edit",
      { path: DISTRIBUTED_SKILL_PATH, oldString: "a", newString: "b" },
      env,
    );
    expect(verdict.outcome).toBe("block");
    if (verdict.outcome === "block") expect(verdict.reason).toContain("inspection error");
  });

  test("projectRoot 外の絶対パスは検査エラーとして拒否される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const root = process.cwd();
    const outsideSibling = join(root, "..", "senpi-guard-outside-target.md");
    const verdict = evaluateSenpiEditOperation(
      "write",
      { path: outsideSibling, content: "x" },
      env,
      root,
    );
    expect(verdict.outcome).toBe("block");
    if (verdict.outcome === "block") expect(verdict.reason).toContain("inspection error");
  });

  test("不正な patch text は拒否される", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation("apply_patch", { patchText: "not a patch" }, env);
    expect(verdict.outcome).toBe("block");
  });
});

describe("Senpi 生の書込み経路: gh WRITE 迂回検出（TS-007 スライス）", () => {
  test("生 gh WRITE は拒否される", () => {
    const verdict = evaluateSenpiRawWriteCommand({ command: "gh issue close 5" });
    expect(verdict.outcome).toBe("block");
    if (verdict.outcome === "block") expect(verdict.reason).toContain("gh WRITE");
  });

  test("読み取り系 gh コマンドは許可される（誤拒否 0 件）", () => {
    expect(evaluateSenpiRawWriteCommand({ command: "gh issue view 5" }).outcome).toBe("allow");
    expect(evaluateSenpiRawWriteCommand({ command: "gh pr list" }).outcome).toBe("allow");
  });

  test("gh 無関係のコマンドは許可される", () => {
    expect(evaluateSenpiRawWriteCommand({ command: "echo hello" }).outcome).toBe("allow");
  });

  test.each([
    ["command 欠落", {}],
    ["command が非 string", { command: 12345 }],
    ["command が空文字", { command: "" }],
  ])("%s は検査不能として拒否される（成功扱いにしない）", (_label, args) => {
    const verdict = evaluateSenpiRawWriteCommand(args as Record<string, unknown>);
    expect(verdict.outcome).toBe("block");
    if (verdict.outcome === "block") expect(verdict.reason).toContain("cannot verify");
  });
});

describe("拒否時の副作用なし（TS-007: fs 書込み API 呼出 0 件）", () => {
  const writeSpies: ReturnType<typeof spyOn>[] = [];

  afterEach(() => {
    for (const spy of writeSpies) spy.mockRestore();
    writeSpies.length = 0;
  });

  test("block となる編集操作一式で fs 書込み API が呼ばれず、現行内容も不変", () => {
    const currentFiles = new Map([[DISTRIBUTED_SKILL_PATH, "# title\nbody\n"]]);
    for (const method of ["writeFileSync", "appendFileSync", "mkdirSync", "unlinkSync"] as const) {
      writeSpies.push(spyOn(fs, method));
    }

    const env = makeEnvWithCurrentFiles(currentFiles);
    const outcomes = [
      evaluateSenpiEditOperation(
        "write",
        { path: DISTRIBUTED_SKILL_PATH, content: "See ADR-0135" },
        env,
      ).outcome,
      evaluateSenpiEditOperation("unknown_tool", { path: "a.md", content: "x" }, env).outcome,
      evaluateSenpiEditOperation(
        "edit",
        { path: DISTRIBUTED_SKILL_PATH, oldString: "body", newString: "ref ADR-0135" },
        env,
      ).outcome,
      evaluateSenpiRawWriteCommand({ command: "gh pr merge 7" }).outcome,
    ];

    expect(outcomes).toEqual(["block", "block", "block", "block"]);
    for (const spy of writeSpies) expect(spy).not.toHaveBeenCalled();
    expect(currentFiles.get(DISTRIBUTED_SKILL_PATH)).toBe("# title\nbody\n");
  });

  test("allow となる操作でも接続自体は書込みを行わない（書込みはホスト側の責務）", () => {
    for (const method of ["writeFileSync", "appendFileSync", "unlinkSync"] as const) {
      writeSpies.push(spyOn(fs, method));
    }
    const env = makeEnvWithCurrentFiles(new Map());
    const verdict = evaluateSenpiEditOperation(
      "write",
      { path: "docs/notes.md", content: "plain" },
      env,
    );
    expect(verdict.outcome).toBe("allow");
    for (const spy of writeSpies) expect(spy).not.toHaveBeenCalled();
  });
});

describe("enforce 契約（Senpi hook 配線が消費する強制適用）", () => {
  test("block 判定は GuardBlockError を投げて副作用前の停止を表現する", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    expect(() =>
      enforceSenpiEditOperation(
        "write",
        { path: DISTRIBUTED_SKILL_PATH, content: "See ADR-0135" },
        env,
      ),
    ).toThrow(GuardBlockError);
    expect(() => enforceSenpiRawWriteCommand({ command: "gh pr merge 7" })).toThrow(GuardBlockError);
  });

  test("allow 判定は投げない", () => {
    const env = makeEnvWithCurrentFiles(new Map());
    expect(() =>
      enforceSenpiEditOperation("write", { path: "docs/notes.md", content: "plain" }, env),
    ).not.toThrow();
    expect(() => enforceSenpiRawWriteCommand({ command: "gh issue view 5" })).not.toThrow();
  });
});
