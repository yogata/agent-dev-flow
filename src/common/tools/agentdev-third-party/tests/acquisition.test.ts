// 取得プロファイルのテスト（Issue #2448 テスト戦略より）。
//
// ディレクトリ型: 再帰取得・相対構造保持・Skill ディレクトリ外非取得。
// 途中失敗 source で取得開始前に存在した正常な配置が破壊・部分更新されない
// こと、機構管理外の同名 Skill の無断上書きが拒否されること。
//
// 検証はローカル mock ソース（tests/mock-source.ts）で実行し、外部
// ネットワークに依存しない。


import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  acquireTarget,
  classifyExisting,
  planTarget,
  PROVENANCE_FILENAME,
  type AcquisitionEnv,
} from "../acquisition.ts";
import { createGitHubSourceFetcher } from "../transport.ts";
import { startMockGitHubSource, type MockSourceServer } from "./mock-source.ts";

const SKILL_MD = "# my-skill\n\nSkill body.\n";
const REFERENCE = "# guide\n";
const ADVANCED = "# advanced\n";
const RUN_SH = "#!/bin/sh\necho ok\n";

function makeSourceSpecs(): {
  directories: Set<string>;
  files: Map<string, string>;
  failPaths: Set<string>;
} {
  return {
    directories: new Set([
      "skills/my-skill",
      "skills/my-skill/references",
      "skills/my-skill/references/deep",
      "skills/my-skill/scripts",
      "skills/other-skill",
    ]),
    files: new Map<string, string>([
      ["skills/my-skill/SKILL.md", SKILL_MD],
      ["skills/my-skill/references/guide.md", REFERENCE],
      ["skills/my-skill/references/deep/advanced.md", ADVANCED],
      ["skills/my-skill/scripts/run.sh", RUN_SH],
      // Skill ディレクトリ外のファイル（取得されてはならない）
      ["skills/other-skill/OUTSIDE.md", "# outside\n"],
      ["README.md", "# repo readme\n"],
    ]),
    failPaths: new Set<string>(),
  };
}

let testRoot: string;
let skillsRoot: string;
let stagingRoot: string;
let mock: MockSourceServer;
let env: AcquisitionEnv;

const DECLARED_SOURCE = () =>
  `https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/my-skill`;

beforeEach(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tp-acq-test-"));
  skillsRoot = path.join(testRoot, "skills");
  stagingRoot = path.join(testRoot, "staging");
  await fs.mkdir(skillsRoot, { recursive: true });
  await fs.mkdir(stagingRoot, { recursive: true });
  const spec = makeSourceSpecs();
  mock = await startMockGitHubSource({ files: spec.files, directories: spec.directories });
  env = {
    fetcher: createGitHubSourceFetcher({ rawBaseUrl: mock.rawBaseUrl, apiBaseUrl: mock.apiBaseUrl }),
    skillsRoot,
    stagingRoot,
    now: () => new Date("2026-08-30T00:00:00.000Z"),
  };
});

afterEach(async () => {
  await mock.stop();
  await fs.rm(testRoot, { recursive: true, force: true });
});

async function writePlacement(relPath: string, content: string): Promise<void> {
  const target = path.join(skillsRoot, ...relPath.split("/"));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, "utf8");
}

async function readPlacement(relPath: string): Promise<string> {
  return fs.readFile(path.join(skillsRoot, ...relPath.split("/")), "utf8");
}

describe("ディレクトリ型の再帰取得・相対構造保持・Skill ディレクトリ外非取得", () => {
  test("多階層 Skill ディレクトリが相対構造を保持して配置される", async () => {
    const plan = await planTarget(env, "my-skill", DECLARED_SOURCE());
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const outcome = await acquireTarget(env, "my-skill", DECLARED_SOURCE(), plan.resolved, plan.target.existing);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.action).toBe("acquired");
    expect(outcome.fileCount).toBe(4);

    // 相対構造保持 + 内容一致（読み戻し）
    expect(await readPlacement("my-skill/SKILL.md")).toBe(SKILL_MD);
    expect(await readPlacement("my-skill/references/guide.md")).toBe(REFERENCE);
    expect(await readPlacement("my-skill/references/deep/advanced.md")).toBe(ADVANCED);
    expect(await readPlacement("my-skill/scripts/run.sh")).toBe(RUN_SH);
  });

  test("Skill ディレクトリ外のファイルは配置されない", async () => {
    const plan = await planTarget(env, "my-skill", DECLARED_SOURCE());
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const outcome = await acquireTarget(env, "my-skill", DECLARED_SOURCE(), plan.resolved, plan.target.existing);
    expect(outcome.ok).toBe(true);

    await expect(readPlacement("other-skill/OUTSIDE.md")).rejects.toThrow();
    await expect(readPlacement("README.md")).rejects.toThrow();

    const placed = new Set((await listAll(skillsRoot)).map((p) => path.relative(skillsRoot, p)));
    expect(placed.size).toBe(5); // 4 files + provenance marker
    for (const p of placed) {
      expect(p.startsWith("my-skill")).toBe(true);
    }
  });

  test("単一ファイル型は SKILL.md へ正規化される", async () => {
    const singleSource = `https://raw.githubusercontent.com/${mock.owner}/${mock.repo}/${mock.ref}/skills/my-skill/SKILL.md`;
    const plan = await planTarget(env, "my-skill", singleSource);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.target.profile).toBe("single-file");
    const outcome = await acquireTarget(env, "my-skill", singleSource, plan.resolved, plan.target.existing);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.fileCount).toBe(1);
    expect(await readPlacement("my-skill/SKILL.md")).toBe(SKILL_MD);
  });

  test("provenance マーカーが配置され、管理対象として分類される", async () => {
    const plan = await planTarget(env, "my-skill", DECLARED_SOURCE());
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    await acquireTarget(env, "my-skill", DECLARED_SOURCE(), plan.resolved, plan.target.existing);
    expect(await classifyExisting(skillsRoot, "my-skill")).toBe("managed");
    const provenance = JSON.parse(await readPlacement(`my-skill/${PROVENANCE_FILENAME}`));
    expect(provenance.tool).toBe("agentdev_third_party");
    expect(provenance.name).toBe("my-skill");
    expect(provenance.profile).toBe("directory");
  });
});

describe("途中失敗での非破壊と管理外上書きの拒否", () => {
  test("途中失敗する source で既存の正常な配置が破壊されない", async () => {
    const declared = DECLARED_SOURCE();

    // 開始前状態: 正常な管理対象配置
    const plan = await planTarget(env, "my-skill", declared);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const first = await acquireTarget(env, "my-skill", declared, plan.resolved, plan.target.existing);
    expect(first.ok).toBe(true);
    const beforeSk = await readPlacement("my-skill/SKILL.md");
    const beforeGuide = await readPlacement("my-skill/references/guide.md");
    const beforeAdvanced = await readPlacement("my-skill/references/deep/advanced.md");

    // 途中失敗する source: deep/advanced.md の fetch を 500 にする
    await mock.stop();
    const failingSpec = makeSourceSpecs();
    failingSpec.failPaths = new Set(["skills/my-skill/references/deep/advanced.md"]);
    mock = await startMockGitHubSource({ ...failingSpec, owner: mock.owner, repo: mock.repo, ref: mock.ref });
    const failingEnv: AcquisitionEnv = {
      fetcher: createGitHubSourceFetcher({ rawBaseUrl: mock.rawBaseUrl, apiBaseUrl: mock.apiBaseUrl }),
      skillsRoot,
      stagingRoot,
      now: env.now,
    };

    const plan2 = await planTarget(failingEnv, "my-skill", declared);
    expect(plan2.ok).toBe(true);
    if (!plan2.ok) return;
    expect(plan2.target.existing).toBe("managed");

    const outcome = await acquireTarget(
      failingEnv,
      "my-skill",
      declared,
      plan2.resolved,
      plan2.target.existing,
    );

    // 失敗を成功扱いとしない
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.reason).toBe("staging-failed");
      expect(outcome.detail).toContain("advanced.md");
    }

    // 既存 Skill の内容・配置が開始前と一致（非破壊）
    expect(await readPlacement("my-skill/SKILL.md")).toBe(beforeSk);
    expect(await readPlacement("my-skill/references/guide.md")).toBe(beforeGuide);
    expect(await readPlacement("my-skill/references/deep/advanced.md")).toBe(beforeAdvanced);
    expect(await classifyExisting(skillsRoot, "my-skill")).toBe("managed");
  });

  test("機構管理外の同名 Skill は上書きされずに拒否される", async () => {
    await writePlacement("my-skill/SKILL.md", "# handcrafted\n");
    expect(await classifyExisting(skillsRoot, "my-skill")).toBe("unmanaged");

    const plan = await planTarget(env, "my-skill", DECLARED_SOURCE());
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    const outcome = await acquireTarget(env, "my-skill", DECLARED_SOURCE(), plan.resolved, plan.target.existing);

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.reason).toBe("refused-unmanaged");
      expect(outcome.detail).toContain(PROVENANCE_FILENAME);
    }
    // 無断上書きされない（内容不変）
    expect(await readPlacement("my-skill/SKILL.md")).toBe("# handcrafted\n");
  });

  test("管理対象配置の更新は置換される（updated）", async () => {
    const declared = DECLARED_SOURCE();
    const plan = await planTarget(env, "my-skill", declared);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    await acquireTarget(env, "my-skill", declared, plan.resolved, plan.target.existing);
    const second = await acquireTarget(env, "my-skill", declared, plan.resolved, "managed");
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.action).toBe("updated");
    expect(await readPlacement("my-skill/SKILL.md")).toBe(SKILL_MD);
  });
});

async function listAll(root: string): Promise<string[]> {
  const results: string[] = [];
  async function walk(dir: string): Promise<void> {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        results.push(full);
      }
    }
  }
  await walk(root);
  return results;
}
