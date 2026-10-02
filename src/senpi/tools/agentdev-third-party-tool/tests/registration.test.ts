//
// Senpi 向け agentdev_third_party 登録単位のテスト。
//
// 登録単位の構造（name/description/args/execute）、公開スキーマの正本参照、
// および実行 context 変換（Senpi 向け skillsRoot への取得。宣言ファイル解決は
// engine 正本）を engine の mock source で検証する。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach } from "bun:test";
import { createAgentdevThirdPartySenpiRegistration } from "../registration.ts";
import type { SenpiToolContext } from "../../tool-registration.ts";
import { AGENTDEV_THIRD_PARTY_REQUEST_PROPERTY_SCHEMA } from "../../../../common/tools/agentdev-third-party/public-schema.ts";
import { createGitHubSourceFetcher } from "../../../../common/tools/agentdev-third-party/index.ts";
import { startMockGitHubSource, type MockSourceServer } from "../../../../common/tools/agentdev-third-party/tests/mock-source.ts";

let testRoot: string;
let worktree: string;
let mock: MockSourceServer;

beforeEach(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tp-senpi-test-"));
  worktree = testRoot;
  mock = await startMockGitHubSource({
    files: new Map<string, string>([["skills/gamma/SKILL.md", "# gamma\n"]]),
    directories: new Set<string>(["skills/gamma"]),
  });
  await fs.mkdir(path.join(worktree, "src", "third-party"), { recursive: true });
  await fs.writeFile(
    path.join(worktree, "src", "third-party", "skills.yaml"),
    "skills:\n" +
      `  - name: gamma\n    source: https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/gamma\n`,
    "utf8",
  );
});

afterEach(async () => {
  await mock.stop();
  await fs.rm(testRoot, { recursive: true, force: true });
});

function makeContext(): SenpiToolContext {
  return { worktree };
}

describe("登録単位の構造", () => {
  test("registration は name/description/args/execute を持ち、公開名は agentdev_third_party である", () => {
    const registration = createAgentdevThirdPartySenpiRegistration();
    expect(registration.name).toBe("agentdev_third_party");
    expect(typeof registration.description).toBe("string");
    expect(registration.description.length).toBeGreaterThan(0);
    expect(Object.keys(registration.args)).toEqual(["request"]);
    expect(typeof registration.execute).toBe("function");
  });

  test("args.request は engine 公開スキーマと同一の正本参照である", () => {
    const registration = createAgentdevThirdPartySenpiRegistration();
    expect(registration.args.request).toBe(AGENTDEV_THIRD_PARTY_REQUEST_PROPERTY_SCHEMA);
    const schema = registration.args.request as typeof AGENTDEV_THIRD_PARTY_REQUEST_PROPERTY_SCHEMA;
    expect(schema.properties.operation.enum).toEqual(["acquire"]);
  });
});

describe("execute の実行 context 変換（Senpi 向け skillsRoot）", () => {
  test("取得は Senpi 向け skillsRoot（.senpi/skills）へ配置される", async () => {
    const registration = createAgentdevThirdPartySenpiRegistration({
      createFetcher: () => createGitHubSourceFetcher({ rawBaseUrl: mock.rawBaseUrl, apiBaseUrl: mock.apiBaseUrl }),
    });
    const result = await registration.execute(
      { request: { operation: "acquire" } },
      makeContext(),
    );
    expect(result.metadata?.ok).toBe(true);
    expect(result.title).toContain("acquire ok");
    const placed = await fs.readFile(path.join(worktree, ".senpi", "skills", "gamma", "SKILL.md"), "utf8");
    expect(placed).toContain("# gamma");
    const report = JSON.parse(result.output) as {
      success: { report: { targets: { placementPath: string }[] } };
    };
    expect(report.success.report.targets[0]?.placementPath).toContain(path.join(".senpi", "skills", "gamma"));
  });

  test("dry-run は配置を行わず計画のみを返す", async () => {
    const registration = createAgentdevThirdPartySenpiRegistration({
      createFetcher: () => createGitHubSourceFetcher({ rawBaseUrl: mock.rawBaseUrl, apiBaseUrl: mock.apiBaseUrl }),
    });
    const result = await registration.execute(
      { request: { operation: "acquire", dryRun: true } },
      makeContext(),
    );
    expect(result.metadata?.ok).toBe(true);
    const gammaPlaced = await fs
      .access(path.join(worktree, ".senpi", "skills", "gamma", "SKILL.md"))
      .then(() => true)
      .catch(() => false);
    expect(gammaPlaced).toBe(false);
    const report = JSON.parse(result.output) as { ok: boolean; success: { report: { summary: { requested: number } } } };
    expect(report.ok).toBe(true);
    expect(report.success.report.summary.requested).toBe(1);
  });
});
