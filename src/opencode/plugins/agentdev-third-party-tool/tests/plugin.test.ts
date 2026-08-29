// agentdev-third-party-tool Plugin のテスト（登録配線と execute 契約）。


import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  createAgentdevThirdPartyToolDefinition,
  createAgentdevThirdPartyToolPlugin,
} from "../plugin.ts";
import { createGitHubSourceFetcher } from "../../../tools/agentdev-third-party/index.ts";
import { startMockGitHubSource, type MockSourceServer } from "../../../tools/agentdev-third-party/tests/mock-source.ts";

let testRoot: string;
let worktree: string;
let mock: MockSourceServer;

beforeEach(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tp-plugin-test-"));
  worktree = testRoot;
  mock = await startMockGitHubSource({
    files: new Map<string, string>([["skills/gamma/SKILL.md", "# gamma\n"]]),
    directories: new Set<string>(["skills/gamma"]),
  });
  await fs.mkdir(path.join(worktree, ".opencode", "skills"), { recursive: true });
  await fs.writeFile(
    path.join(worktree, "skills.yaml"),
    "skills:\n" +
      `  - name: gamma\n    source: https://github.com/${mock.owner}/${mock.repo}/tree/${mock.ref}/skills/gamma\n`,
    "utf8",
  );
});

afterEach(async () => {
  await mock.stop();
  await fs.rm(testRoot, { recursive: true, force: true });
});

function makeDeps() {
  return {
    resolveDeclarationPath: () => path.join(worktree, "skills.yaml"),
    resolveSkillsRoot: () => path.join(worktree, ".opencode", "skills"),
    tmpDir: () => path.join(worktree, "tmp"),
    createFetcher: () =>
      createGitHubSourceFetcher({ rawBaseUrl: mock.rawBaseUrl, apiBaseUrl: mock.apiBaseUrl }),
  };
}

describe("Plugin 登録配線", () => {
  test("createAgentdevThirdPartyToolPlugin は agentdev_third_party を hooks.tool に登録する", async () => {
    const plugin = createAgentdevThirdPartyToolPlugin(makeDeps());
    const hooks = await plugin({ worktree, directory: worktree });
    const tools = hooks.tool as Record<string, unknown>;
    expect(tools["agentdev_third_party"]).toBeDefined();
  });

  test("Tool 定義は公開名と args スキーマを公開する", () => {
    const definition = createAgentdevThirdPartyToolDefinition(makeDeps());
    expect(definition.description).toContain("third-party");
    expect(definition.args.request).toBeDefined();
  });
});

describe("execute 契約", () => {
  test("取得成功は ok:true と対象別明細を返す", async () => {
    const definition = createAgentdevThirdPartyToolDefinition(makeDeps());
    const result = await definition.execute(
      { request: { operation: "acquire" } },
      { sessionID: "s", directory: worktree, worktree },
    );
    expect(result.metadata?.ok).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.ok).toBe(true);
    expect(parsed.success.report.summary.succeeded).toBe(1);
    expect(parsed.success.report.results[0].name).toBe("gamma");
    const placed = await fs.readFile(
      path.join(worktree, ".opencode", "skills", "gamma", "SKILL.md"),
      "utf8",
    );
    expect(placed).toBe("# gamma\n");
  });

  test("dry-run は配置せず計画を返す", async () => {
    const definition = createAgentdevThirdPartyToolDefinition(makeDeps());
    const result = await definition.execute(
      { request: { operation: "acquire", dryRun: true } },
      { sessionID: "s", directory: worktree, worktree },
    );
    expect(result.metadata?.ok).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.success.report.dryRun).toBe(true);
    const entries = await fs.readdir(path.join(worktree, ".opencode", "skills"));
    expect(entries).toEqual([]);
  });

  test("宣言不在は ok:false（config-uninterpretable）で成功扱いにしない", async () => {
    const deps = { ...makeDeps(), resolveDeclarationPath: () => path.join(worktree, "missing.yaml") };
    const definition = createAgentdevThirdPartyToolDefinition(deps);
    const result = await definition.execute(
      { request: { operation: "acquire" } },
      { sessionID: "s", directory: worktree, worktree },
    );
    expect(result.metadata?.ok).toBe(false);
    const parsed = JSON.parse(result.output);
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("config-uninterpretable");
  });
});
