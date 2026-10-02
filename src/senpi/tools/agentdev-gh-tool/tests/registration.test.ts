//
// Senpi 向け agentdev_gh 登録単位のテスト。
//
// 登録単位の構造（name/description/args/execute）、公開スキーマの正本参照
// （engine 公開スキーマと同一）、execute の引数・結果・実行 context 変換、
// fail-closed 出力（リポジトリ解決不能）、およびバックエンドの単一選択構造
// （同じ Tool 名で両バックエンドを同時有効化しない）を検証する。
// Local 実装の検出は一時フィクスチャで行う（実環境に触れない）。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  createAgentdevGhSenpiRegistration,
  LOCAL_RUNNER_PROJECTION,
  type AgentdevGhSenpiDeps,
} from "../registration.ts";
import type { SenpiToolContext } from "../../tool-registration.ts";
import { AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA } from "../../../../common/tools/agentdev-gh/public-schema.ts";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../../../../common/tools/agentdev-gh/runner.ts";
import { AGENTDEV_GH_OPERATION_SPECS } from "../../../../common/tools/agentdev-gh/index.ts";
import { GH_TOOL_OPERATIONS } from "../../../../common/tools/agentdev-gh/contracts.ts";

function makeContext(worktree: string): SenpiToolContext {
  return { worktree };
}

function fakeRunner(handler: (request: GhRunnerRequest) => Promise<GhRunnerReply>): GhRunner {
  return { run: handler };
}

function okReply(payload: unknown): GhRunnerReply {
  return { ok: true, payload };
}

function failingRunner(): GhRunner {
  return fakeRunner(async () => ({ ok: false, error: "unused", exitCode: 1, failureClass: "operation-failed" }));
}

describe("登録単位の構造", () => {
  test("registration は name/description/args/execute を持ち、公開名は agentdev_gh である", () => {
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => "owner/repo",
      createRunner: () => failingRunner(),
    });
    expect(registration.name).toBe("agentdev_gh");
    expect(typeof registration.description).toBe("string");
    expect((registration.description as string).length).toBeGreaterThan(0);
    expect(Object.keys(registration.args)).toEqual(["request"]);
    expect(typeof registration.execute).toBe("function");
  });

  test("registration は単一の Tool 定義のみを公開する（両バックエンドの同時公開を持たない）", () => {
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => "owner/repo",
      createRunner: () => failingRunner(),
    });
    expect(Object.keys(registration)).toContain("name");
    expect((registration as unknown as Record<string, unknown[]>)["tools"]).toBeUndefined();
  });

  test("args.request は engine 公開スキーマと同一の正本参照である", () => {
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => "owner/repo",
      createRunner: () => failingRunner(),
    });
    expect(registration.args.request).toBe(AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA);
    const schema = registration.args.request as typeof AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA;
    const enumValues = schema.properties.operation.enum;
    expect([...enumValues].sort()).toEqual([...GH_TOOL_OPERATIONS].sort());
  });

  test("公開スキーマの操作集合は操作スペック（操作カタログ）と一致する", () => {
    const specOperations = AGENTDEV_GH_OPERATION_SPECS.map((s) => s.operation).sort();
    const schemaEnum = [...(AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA.properties.operation.enum as readonly string[])].sort();
    expect(schemaEnum).toEqual(specOperations);
  });
});

describe("execute の引数・結果・実行 context 変換", () => {
  test("context.worktree を基点に engine へ委譲し、結果を SenpiToolResult へ直列化する", async () => {
    const seenRepos: string[] = [];
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => {
        seenRepos.push("called");
        return "owner/repo";
      },
      createRunner: () =>
        fakeRunner(async (request) => {
          if (request.operation === "issue_read") {
            return okReply({
              number: 7,
              title: "T",
              body: "B",
              state: "open",
              labels: [],
              role: "case",
              kind: null,
              trackingState: null,
              closeReason: null,
            });
          }
          return { ok: false, error: "unexpected op", exitCode: 1, failureClass: "operation-failed" };
        }),
    });
    const result = await registration.execute(
      { request: { operation: "issue_read", number: 7 } },
      makeContext("C:/w"),
    );
    expect(result.metadata?.ok).toBe(true);
    expect(result.metadata?.operation).toBe("issue_read");
    expect(result.title).toContain("issue_read ok");
    const parsed = JSON.parse(result.output) as { ok: boolean; success: { operation: string } };
    expect(parsed.ok).toBe(true);
    expect(parsed.success.operation).toBe("issue_read");
  });

  test("リポジトリ解決不能時は config-uninterpretable で fail-closed する", async () => {
    const registration = createAgentdevGhSenpiRegistration({ resolveRepo: () => null });
    const result = await registration.execute(
      { request: { operation: "issue_read", number: 7 } },
      makeContext("C:/w"),
    );
    expect(result.metadata?.ok).toBe(false);
    const parsed = JSON.parse(result.output) as {
      failure: { kind: string; detail: string };
    };
    expect(parsed.failure.kind).toBe("config-uninterpretable");
    expect(parsed.failure.detail).toContain("AGENTDEV_GH_REPO");
  });
});

describe("バックエンドの単一選択構造（両バックエンドの同時有効化を行わない）", () => {
  test("同一 worktree の連続 execute は runner を1度だけ構築する（単一バックエンドへの収束）", async () => {
    let created = 0;
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => "owner/repo",
      createRunner: () => {
        created += 1;
        return failingRunner();
      },
    });
    await registration.execute({ request: { operation: "issue_read", number: 1 } }, makeContext("C:/w"));
    await registration.execute({ request: { operation: "issue_read", number: 2 } }, makeContext("C:/w"));
    expect(created).toBe(1);
  });

  test("Local 実装投影パスが存在する場合、Local 実装を単一 runner として使用し GitHub 実装を構築しない", async () => {
    const worktree = fs.mkdtempSync(path.join(os.tmpdir(), "senpi-gh-local-"));
    try {
      const projectionDir = path.join(worktree, ".senpi", "tools", "agentdev-gh");
      fs.mkdirSync(projectionDir, { recursive: true });
      fs.writeFileSync(
        path.join(projectionDir, "runner-local.ts"),
        [
          'import type { GhRunner } from "../../../../../../../src/common/tools/agentdev-gh/runner.ts";',
          "export function createLocalRunner(options: { issuesDir: string }): GhRunner {",
          "  return {",
          "    async run(request) {",
          "      if (request.operation === \"issue_read\") {",
          "        return { ok: true, payload: { number: 1, title: \"LOCAL\", body: \"B\", state: \"open\", labels: [], role: \"case\", kind: null, trackingState: null, closeReason: null } };",
          "      }",
          "      return { ok: false, error: \"local stub: unsupported op\", exitCode: null };",
          "    },",
          "  };",
          "}",
          "",
        ].join("\n"),
        "utf8",
      );
      const registration = createAgentdevGhSenpiRegistration({ resolveRepo: () => "owner/repo" });
      const result = await registration.execute(
        { request: { operation: "issue_read", number: 1 } },
        makeContext(worktree),
      );
      const parsed = JSON.parse(result.output) as { ok: boolean; success?: { title: string } };
      expect(parsed.ok).toBe(true);
      expect(parsed.success?.title).toBe("LOCAL");
    } finally {
      fs.rmSync(worktree, { recursive: true, force: true });
    }
  });

  test("deps.createRunner 指定時はバックエンド選択が注入実装へ収束する（Local 検出を介さない）", async () => {
    const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "senpi-gh-inject-"));
    try {
      fs.mkdirSync(path.join(testRoot, LOCAL_RUNNER_PROJECTION, ".."), { recursive: true });
      const calls: string[] = [];
      const deps: AgentdevGhSenpiDeps = {
        resolveRepo: () => "owner/repo",
        createRunner: () => {
          calls.push("injected");
          return failingRunner();
        },
      };
      const registration = createAgentdevGhSenpiRegistration(deps);
      const result = await registration.execute(
        { request: { operation: "issue_read", number: 1 } },
        makeContext(testRoot),
      );
      expect(result.metadata?.ok).toBe(false);
      expect(calls).toEqual(["injected"]);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });
});
