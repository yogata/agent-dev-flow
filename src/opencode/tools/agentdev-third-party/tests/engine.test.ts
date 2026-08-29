// fail-closed 実行ゲートのテスト（Issue #2448 テスト戦略より）。
//
// 操作契約の検証: 正常取得後に読み戻し検証
// が実行されることを dry-run モードの計画表示と照合して確認し、不正
// source URL による失敗時に成功を返さないことを確認する。
//
// 検証はローカル mock ソース（tests/mock-source.ts）で実行し、外部
// ネットワークに依存しない。


import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { buildTpToolEnv, executeAcquire, type TpToolEnv } from "../engine.ts";
import { createGitHubSourceFetcher } from "../transport.ts";
import { PROVENANCE_FILENAME } from "../acquisition.ts";
import { startMockGitHubSource, type MockSourceServer } from "./mock-source.ts";

let testRoot: string;
let skillsRoot: string;
let stagingRoot: string;
let declarationPath: string;
let mock: MockSourceServer;
let env: TpToolEnv;

beforeEach(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tp-engine-test-"));
  skillsRoot = path.join(testRoot, "opencode", "skills");
  stagingRoot = path.join(testRoot, "staging");
  declarationPath = path.join(testRoot, "skills.yaml");
  await fs.mkdir(skillsRoot, { recursive: true });
  await fs.mkdir(stagingRoot, { recursive: true });
  mock = await startMockGitHubSource({
    files: new Map<string, string>([
      ["skills/alpha/SKILL.md", "# alpha\n"],
      ["skills/alpha/references/g.md", "# g\n"],
      ["skills/beta/SKILL.md", "# beta\n"],
    ]),
    directories: new Set<string>(["skills/alpha", "skills/alpha/references", "skills/beta"]),
  });
  const fetcher = createGitHubSourceFetcher({
    rawBaseUrl: mock.rawBaseUrl,
    apiBaseUrl: mock.apiBaseUrl,
  });
  const built = buildTpToolEnv(
    { declarationPath, skillsRoot },
    {
      skillsRoot: (candidates) => candidates[0] ?? null,
      stagingRoot: () => stagingRoot,
    },
    fetcher,
  );
  if (!built.ok) throw new Error("env build failed");
  env = built.env;
});

afterEach(async () => {
  await mock.stop();
  await fs.rm(testRoot, { recursive: true, force: true });
});

async function writeDeclaration(text: string): Promise<void> {
  await fs.writeFile(declarationPath, text, "utf8");
}

describe("操作契約（読み戻し検証、dry-run 計画照合、不正 source での失敗）", () => {
  test("正常取得は読み戻し検証を通過した後に成功を返す", async () => {
    await writeDeclaration(
      "skills:\n" +
        `  - name: alpha\n    source: https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/alpha\n`,
    );
    const result = await executeAcquire(env, { operation: "acquire" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // 出力契約: 対象一覧、取得成否、配置パス
    expect(result.success.report.summary.succeeded).toBe(1);
    expect(result.success.report.results[0]?.placementPath).toBe(path.join(skillsRoot, "alpha"));

    // 保証: 読み戻し検証の痕跡（provenance マーカーの読み戻しまで含む）が配置に残る
    const provenance = JSON.parse(
      await fs.readFile(path.join(skillsRoot, "alpha", PROVENANCE_FILENAME), "utf8"),
    );
    expect(provenance.source).toContain("tree");
    const placed = await fs.readFile(path.join(skillsRoot, "alpha", "references", "g.md"), "utf8");
    expect(placed).toBe("# g\n");
  });

  test("dry-run は実行せず計画（対象一覧、配置先、衝突検出）を返す", async () => {
    await writeDeclaration(
      "skills:\n" +
        `  - name: alpha\n    source: https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/alpha\n`,
    );
    const result = await executeAcquire(env, { operation: "acquire", dryRun: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.success.report.dryRun).toBe(true);
    expect(result.success.report.targets[0]?.placementPath).toBe(path.join(skillsRoot, "alpha"));
    expect(result.success.report.summary.requested).toBe(1);
    // 実行されない（配置なし）
    const entries = await fs.readdir(skillsRoot);
    expect(entries).toEqual([]);
  });

  test("dry-run 計画の配置パスが実取得の配置パスと一致する", async () => {
    const decl =
      "skills:\n" +
      `  - name: alpha\n    source: https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/alpha\n`;
    await writeDeclaration(decl);

    const dryRun = await executeAcquire(env, { operation: "acquire", dryRun: true });
    expect(dryRun.ok).toBe(true);
    if (!dryRun.ok) return;
    const planned = dryRun.success.report.targets.map((t) => t.placementPath);

    const result = await executeAcquire(env, { operation: "acquire" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const placed = result.success.report.results.map((r) => r.placementPath);
    expect(placed).toEqual(planned);
  });

  test("不正 source URL の失敗時に成功を返さず、配置も残さない", async () => {
    // 宣言レベルの https 検証は通るが、source URL 形式判定が拒否する
    // 非対応ホスト・非対応形式（git clone URL 相当）を使用する。
    await writeDeclaration(
      "skills:\n  - name: bad-skill\n    source: https://gitlab.com/owner/repo/tree/main/skills/bad-skill\n",
    );
    const result = await executeAcquire(env, { operation: "acquire" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failure.kind).toBe("operation-failed");
    expect(result.failure.detail).toContain("bad-skill");
    // 開始前状態の維持（配置なし）
    const entries = await fs.readdir(skillsRoot);
    expect(entries).toEqual([]);
  });

  test("管理外衝突は拒否として報告され、操作全体は成功にならない", async () => {
    await fs.mkdir(path.join(skillsRoot, "alpha"), { recursive: true });
    await fs.writeFile(path.join(skillsRoot, "alpha", "SKILL.md"), "# handcrafted\n", "utf8");

    await writeDeclaration(
      "skills:\n" +
        `  - name: alpha\n    source: https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/alpha\n`,
    );
    const result = await executeAcquire(env, { operation: "acquire" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.report?.conflicts.length).toBe(1);
    expect(result.report?.conflicts[0]?.name).toBe("alpha");
    expect(result.failure.detail).toContain("refused");
    // 無断上書きされない
    const content = await fs.readFile(path.join(skillsRoot, "alpha", "SKILL.md"), "utf8");
    expect(content).toBe("# handcrafted\n");
  });

  test("宣言ファイル不在は config-uninterpretable で失敗し、取得を実行しない", async () => {
    const result = await executeAcquire(env, { operation: "acquire" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.kind).toBe("config-uninterpretable");
    }
  });

  test("出荷宣言と同一の schema_version 行を含む宣言を読み込める", async () => {
    await writeDeclaration(
      'schema_version: "1.0"\n' +
        "skills:\n" +
        `  - name: alpha\n    source: https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/alpha\n`,
    );
    const result = await executeAcquire(env, { operation: "acquire", dryRun: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.success.report.targets.map((t) => t.name)).toEqual(["alpha"]);
  });

  test("未宣言の対象 Skill 名は失敗として報告する", async () => {
    await writeDeclaration("skills:\n");
    const result = await executeAcquire(env, { operation: "acquire", skill: "nope" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.detail).toContain("not declared");
    }
  });

  test("操作名不正は invalid-input", async () => {
    const result = await executeAcquire(env, { operation: "unknown-op" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.kind).toBe("invalid-input");
    }
  });

  test("path-unresolvable（staging root 解決不能）は取得を実行しない", async () => {
    const built = buildTpToolEnv(
      { declarationPath, skillsRoot },
      { skillsRoot: (candidates) => candidates[0] ?? null, stagingRoot: () => null },
      createGitHubSourceFetcher(),
    );
    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.failure.kind).toBe("path-unresolvable");
  });
});

describe("gist source の取得（単一 SKILL.md 型）", () => {
  test("gist raw エンドポイントから SKILL.md を取得し provenance に gist URL を記録する", async () => {
    const gistMock = await startMockGitHubSource({
      files: new Map<string, string>(),
      directories: new Set<string>(),
      gistFiles: new Map<string, string>([["SKILL.md", "# gist skill\n"]]),
      gistUser: "k16shikano",
      gistId: "fd287c3133457c4fd8f5601d34aa817d",
    });
    try {
      const gistFetcher = createGitHubSourceFetcher({
        rawBaseUrl: gistMock.rawBaseUrl,
        gistRawBaseUrl: gistMock.gistRawBaseUrl,
        apiBaseUrl: gistMock.apiBaseUrl,
      });
      const gistDecl = path.join(testRoot, "skills-gist.yaml");
      await fs.writeFile(
        gistDecl,
        "skills:\n  - name: gist-skill\n    source: https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d\n",
        "utf8",
      );
      const built = buildTpToolEnv(
        { declarationPath: gistDecl, skillsRoot },
        {
          skillsRoot: (candidates) => candidates[0] ?? null,
          stagingRoot: () => stagingRoot,
        },
        gistFetcher,
      );
      if (!built.ok) throw new Error("env build failed");

      const result = await executeAcquire(built.env, { operation: "acquire" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.success.report.summary.succeeded).toBe(1);
      expect(result.success.report.results[0]?.placementPath).toBe(path.join(skillsRoot, "gist-skill"));

      const placed = await fs.readFile(path.join(skillsRoot, "gist-skill", "SKILL.md"), "utf8");
      expect(placed).toBe("# gist skill\n");
      const provenance = JSON.parse(
        await fs.readFile(path.join(skillsRoot, "gist-skill", PROVENANCE_FILENAME), "utf8"),
      );
      expect(provenance.source).toBe("https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d");
      expect(provenance.profile).toBe("single-file");
    } finally {
      await gistMock.stop();
    }
  });

  test("gist に SKILL.md が存在しない場合は取得せず失敗する（fail-closed）", async () => {
    const gistMock = await startMockGitHubSource({
      files: new Map<string, string>(),
      directories: new Set<string>(),
      gistFiles: new Map<string, string>([["README.md", "# no skill here\n"]]),
      gistUser: "k16shikano",
      gistId: "fd287c3133457c4fd8f5601d34aa817d",
    });
    try {
      const gistFetcher = createGitHubSourceFetcher({
        rawBaseUrl: gistMock.rawBaseUrl,
        gistRawBaseUrl: gistMock.gistRawBaseUrl,
        apiBaseUrl: gistMock.apiBaseUrl,
      });
      const gistDecl = path.join(testRoot, "skills-gist-missing.yaml");
      await fs.writeFile(
        gistDecl,
        "skills:\n  - name: gist-missing\n    source: https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d\n",
        "utf8",
      );
      const built = buildTpToolEnv(
        { declarationPath: gistDecl, skillsRoot },
        {
          skillsRoot: (candidates) => candidates[0] ?? null,
          stagingRoot: () => stagingRoot,
        },
        gistFetcher,
      );
      if (!built.ok) throw new Error("env build failed");

      const result = await executeAcquire(built.env, { operation: "acquire" });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.failure.kind).toBe("operation-failed");
      expect(result.failure.detail).toContain("gist-missing");
      const entries = await fs.readdir(skillsRoot);
      expect(entries).toEqual([]);
    } finally {
      await gistMock.stop();
    }
  });
});
