// ADF-COVERS(verification): REQ-011-008, REQ-011-022, REQ-011-023, REQ-011-024, REQ-009-026, REQ-009-027, REQ-009-028, REQ-009-029, REQ-009-030, REQ-009-031, REQ-009-032, REQ-009-033
// ADF-COVERS(verification): REQ-049-006, REQ-049-007, REQ-049-008, REQ-049-009, REQ-049-010, REQ-049-011, REQ-049-012, REQ-049-013, REQ-049-015, REQ-049-016, REQ-049-017
//
// 追跡Issue管理機構の配布物実装検証（Issue #2437、OU-06）。
// - Tool 操作契約の追跡Issue操作（issue_list、issue_read 拡張、issue_update labels、
//   issue_comment 読取、issue_reopen）とカタログ登録
// - 副作用操作の VERIFY 完了後成功返却（読み戻し不一致は失敗）、読み取り操作の応答自己整合
// - 物理写像（role/kind/状態とラベルの対応）の機械適用と三段写像の導出
// - ローカル版のローカルIssue（単一採番空間、role 条件付きスキーマ、PR 系操作の role: case 限定）
// - 上位層（skills/commands）の Tool 操作契約経由（物理ラベル・保存先の直接参照なし）
// - 自然言語操作入口の網羅（11 操作種別）と GitHub 実装詳細の非要求

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  AGENTDEV_GH_OPERATION_SPECS,
  runAgentdevGhOperation,
} from "../../../../../src/opencode/tools/agentdev-gh/index.ts";
import { buildGhToolEnv, type GhToolEnv } from "../../../../../src/opencode/tools/agentdev-gh/engine.ts";
import {
  GH_TOOL_OPERATIONS,
  GH_TOOL_OPERATION_CATALOG,
} from "../../../../../src/opencode/tools/agentdev-gh/contracts.ts";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../../../../../src/opencode/tools/agentdev-gh/runner.ts";
import {
  buildTrackingLabels,
  deriveKind,
  deriveRole,
  deriveTrackingState,
  kindToLabel,
  labelToKind,
  labelToTrackingState,
  TRACKING_KINDS,
  TRACKING_ROLE_LABEL,
  TRACKING_STATES,
} from "../../../../../src/opencode/tools/agentdev-gh/tracking-schema.ts";
import {
  createLocalRunner,
  validateLocalIssue,
  localLabelValues,
  localStatusValues,
  localTerminalStatuses,
  type LocalIssueFrontmatter,
} from "../../../../../src/opencode-local/agentdev-gh-cli/runner-local.ts";

const TEMP_BASE = path.join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `issue-tracking-2437-${crypto.randomUUID().slice(0, 8)}`;
const SCRATCH = path.join(TEMP_BASE, RUN_ID);

beforeAll(() => {
  fs.mkdirSync(SCRATCH, { recursive: true });
});

afterAll(() => {
  fs.rmSync(SCRATCH, { recursive: true, force: true });
});

function makeIssuesDir(): string {
  return fs.mkdtempSync(path.join(SCRATCH, "issues-"));
}

function localEnv(issuesDir: string): GhToolEnv {
  const result = buildGhToolEnv(
    { repo: "local/issues" },
    { tempDir: () => path.join(SCRATCH, "tmp") },
    createLocalRunner({ issuesDir }),
  );
  if (!result.ok) throw new Error("env build failed");
  return result.env;
}

function ghLabelNames(labels: readonly string[]): { name: string }[] {
  return labels.map((name) => ({ name }));
}

/** GitHub REST 相当の応答を返す偽 runner（gh 実行なしで契約を通す）。 */
function fakeGithubRunner(issues: Map<number, Record<string, unknown>>): GhRunner {
  let next = Math.max(0, ...issues.keys()) + 1;
  return {
    async run(request: GhRunnerRequest): Promise<GhRunnerReply> {
      const args = request.args as Record<string, unknown>;
      const number = typeof args.number === "number" ? args.number : null;
      switch (request.operation) {
        case "issue_create": {
          const labels = ((args.labels as string[] | undefined) ?? []).slice();
          const n = next++;
          issues.set(n, {
            number: n,
            title: args.title,
            body: args.body,
            state: "open",
            state_reason: null,
            labels: ghLabelNames(labels),
            html_url: `https://example.com/i/${n}`,
          });
          return { ok: true, payload: { number: n, url: `https://example.com/i/${n}` } };
        }
        case "issue_read": {
          const issue = number !== null ? issues.get(number) : undefined;
          if (issue === undefined) return { ok: false, error: "not found", exitCode: 1 };
          return {
            ok: true,
            payload: {
              number,
              title: issue.title,
              body: issue.body,
              state: issue.state,
              labels: (issue.labels as { name: string }[]).map((l) => l.name),
              role: deriveRole((issue.labels as { name: string }[]).map((l) => l.name)),
              kind: deriveKind((issue.labels as { name: string }[]).map((l) => l.name)),
              trackingState: deriveTrackingState(
                (issue.labels as { name: string }[]).map((l) => l.name),
                issue.state as "open" | "closed",
                issue.state_reason as string | null,
              ).trackingState,
              closeReason: deriveTrackingState(
                (issue.labels as { name: string }[]).map((l) => l.name),
                issue.state as "open" | "closed",
                issue.state_reason as string | null,
              ).closeReason,
              stateReason: issue.state_reason,
            },
          };
        }
        case "issue_update": {
          const issue = number !== null ? issues.get(number) : undefined;
          if (issue === undefined) return { ok: false, error: "not found", exitCode: 1 };
          if (typeof args.title === "string") issue.title = args.title;
          if (typeof args.body === "string") issue.body = args.body;
          if (Array.isArray(args.labels)) {
            issue.labels = ghLabelNames(args.labels as string[]);
          }
          return { ok: true, payload: { number, url: `https://example.com/i/${number}` } };
        }
        case "issue_close": {
          const issue = number !== null ? issues.get(number) : undefined;
          if (issue === undefined) return { ok: false, error: "not found", exitCode: 1 };
          issue.state = "closed";
          issue.state_reason = args.reason ?? "completed";
          return { ok: true, payload: { number, state: "closed" } };
        }
        case "issue_reopen": {
          const issue = number !== null ? issues.get(number) : undefined;
          if (issue === undefined) return { ok: false, error: "not found", exitCode: 1 };
          issue.state = "open";
          issue.state_reason = null;
          return { ok: true, payload: { number, state: "open" } };
        }
        case "issue_list": {
          const list = [...issues.values()].map((issue) => ({
            number: issue.number,
            title: issue.title,
            html_url: `https://example.com/i/${issue.number}`,
            state: issue.state,
            state_reason: issue.state_reason,
            labels: issue.labels,
          }));
          return { ok: true, payload: { issues: list } };
        }
        case "issue_comment": {
          if (args.body !== undefined) {
            return { ok: true, payload: { number, url: `https://example.com/c/${number}` } };
          }
          return {
            ok: true,
            payload: {
              number,
              comments: [
                { body: "1件目", createdAt: "2026-08-25T01:00:00Z", url: "https://example.com/c/1" },
                { body: "2件目", createdAt: "2026-08-25T02:00:00Z", url: "https://example.com/c/2" },
              ],
            },
          };
        }
        default:
          return { ok: false, error: `unsupported in fake: ${request.operation}`, exitCode: 1 };
      }
    },
  };
}

function ghEnv(runner: GhRunner): GhToolEnv {
  const result = buildGhToolEnv(
    { repo: "owner/repo" },
    { tempDir: () => path.join(SCRATCH, "tmp") },
    runner,
  );
  if (!result.ok) throw new Error("env build failed");
  return result.env;
}

describe("Tool 操作契約の追跡Issue操作（カタログと契約）", () => {
  it("issue_list と issue_reopen が操作カタログへ登録されている", () => {
    expect([...GH_TOOL_OPERATIONS]).toContain("issue_list");
    expect([...GH_TOOL_OPERATIONS]).toContain("issue_reopen");
    const specOps = AGENTDEV_GH_OPERATION_SPECS.map((s) => s.operation);
    expect(specOps).toContain("issue_list");
    expect(specOps).toContain("issue_reopen");
    expect(GH_TOOL_OPERATION_CATALOG.find((e) => e.operation === "issue_list")?.kind).toBe("read-only");
    expect(GH_TOOL_OPERATION_CATALOG.find((e) => e.operation === "issue_reopen")?.kind).toBe("side-effect");
  });

  it("issue_read は role/kind/trackingState/closeReason を含むメタデータを返す", async () => {
    const issues = new Map<number, Record<string, unknown>>([
      [7, {
        number: 7,
        title: "T",
        body: "B",
        state: "open",
        state_reason: null,
        labels: ghLabelNames([TRACKING_ROLE_LABEL, kindToLabel("risk"), "agentdev-tracking-status/on-hold"]),
      }],
    ]);
    const result = await runAgentdevGhOperation(ghEnv(fakeGithubRunner(issues)), {
      operation: "issue_read",
      number: 7,
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.success.operation === "issue_read") {
      expect(result.success.role).toBe("tracking");
      expect(result.success.kind).toBe("risk");
      expect(result.success.trackingState).toBe("on-hold");
      expect(result.success.closeReason).toBeNull();
      expect(result.success.labels).toEqual([
        TRACKING_ROLE_LABEL,
        "agentdev-kind/risk",
        "agentdev-tracking-status/on-hold",
      ]);
    }
  });

  it("issue_update は labels 更新を反映し読み戻しで確認する", async () => {
    const issues = new Map<number, Record<string, unknown>>([
      [5, { number: 5, title: "T", body: "B", state: "open", state_reason: null, labels: ghLabelNames([]) }],
    ]);
    const result = await runAgentdevGhOperation(ghEnv(fakeGithubRunner(issues)), {
      operation: "issue_update",
      number: 5,
      labels: ["enhancement"],
    });
    expect(result.ok).toBe(true);
    const labels = (issues.get(5)?.labels as { name: string }[]).map((l) => l.name);
    expect(labels).toEqual(["enhancement"]);
  });

  it("issue_comment は body 省略でコメント履歴を読み取る", async () => {
    const issues = new Map<number, Record<string, unknown>>([
      [3, { number: 3, title: "T", body: "B", state: "open", state_reason: null, labels: ghLabelNames([]) }],
    ]);
    const result = await runAgentdevGhOperation(ghEnv(fakeGithubRunner(issues)), {
      operation: "issue_comment",
      number: 3,
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.success.operation === "issue_comment") {
      expect(result.success.comments.length).toBe(2);
      expect(result.success.comments[0]?.body).toBe("1件目");
      expect(result.success.comments[1]?.createdAt).toBe("2026-08-25T02:00:00Z");
    }
  });

  it("issue_reopen は state=open への復帰を検証して成功を返す", async () => {
    const issues = new Map<number, Record<string, unknown>>([
      [9, { number: 9, title: "T", body: "B", state: "closed", state_reason: "completed", labels: ghLabelNames([TRACKING_ROLE_LABEL]) }],
    ]);
    const result = await runAgentdevGhOperation(ghEnv(fakeGithubRunner(issues)), {
      operation: "issue_reopen",
      number: 9,
    });
    expect(result.ok).toBe(true);
    expect(issues.get(9)?.state).toBe("open");
  });

  it("読み戻し不一致の副作用操作は成功扱いとしない", async () => {
    const lying: GhRunner = {
      async run(request) {
        if (request.operation === "issue_update") {
          return { ok: true, payload: { number: 4, url: "https://example.com/i/4" } };
        }
        const issue = { number: 4, title: "違う", body: "B", state: "open", state_reason: null, labels: [] };
        return { ok: true, payload: issue };
      },
    };
    const result = await runAgentdevGhOperation(ghEnv(lying), {
      operation: "issue_update",
      number: 4,
      title: "正しい",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("verification-incomplete");
  });
});

describe("物理写像の機械適用（写像表の単一所有）", () => {
  it("role は物理ラベルの有無で機械判定できる", () => {
    expect(deriveRole([TRACKING_ROLE_LABEL, kindToLabel("problem")])).toBe("tracking");
    expect(deriveRole(["enhancement", "feature"])).toBe("case");
    expect(deriveRole([])).toBe("case");
  });

  it("kind は 4 値をラベルへ双方向に写像する", () => {
    for (const kind of TRACKING_KINDS) {
      expect(labelToKind(kindToLabel(kind))).toBe(kind);
    }
    expect(labelToKind("enhancement")).toBeNull();
    expect(labelToKind(TRACKING_ROLE_LABEL)).toBeNull();
  });

  it("状態の三段写像に従って GitHub state と close reason を導出する", () => {
    for (const state of ["created", "in-discussion", "on-hold", "ready", "resolved"] as const) {
      const r = deriveTrackingState(
        [TRACKING_ROLE_LABEL, "agentdev-tracking-status/" + state],
        "open",
        null,
      );
      expect(r.trackingState).toBe(state);
      expect(r.closeReason).toBeNull();
    }
    expect(deriveTrackingState([TRACKING_ROLE_LABEL], "closed", "completed")).toEqual({
      trackingState: "closed",
      closeReason: "completed",
    });
    expect(deriveTrackingState([TRACKING_ROLE_LABEL], "closed", "not_planned")).toEqual({
      trackingState: "closed",
      closeReason: "not_planned",
    });
    expect(deriveTrackingState(["feature"], "closed", "completed").trackingState).toBeNull();
  });

  it("追跡Issue軸のラベル構成は既存ラベルを保持して置換する", () => {
    const next = buildTrackingLabels(
      [TRACKING_ROLE_LABEL, "agentdev-kind/idea", "agentdev-tracking-status/created", "priority"],
      "risk",
      "on-hold",
    );
    expect(next).toEqual([
      TRACKING_ROLE_LABEL,
      "agentdev-kind/risk",
      "agentdev-tracking-status/on-hold",
      "priority",
    ]);
  });

  it("ラベルへの状態写像は非終端状態のみを受け付ける", () => {
    expect(labelToTrackingState("agentdev-tracking-status/resolved")).toBe("resolved");
    expect(labelToTrackingState("agentdev-tracking-status/closed")).toBeNull();
    expect(labelToTrackingState("agentdev-kind/risk")).toBeNull();
  });

  it("追跡Issue状態は 6 値（起票、検討中、保留、実行準備完了、解決済み、クローズ済み）", () => {
    expect([...TRACKING_STATES]).toEqual([
      "created",
      "in-discussion",
      "on-hold",
      "ready",
      "resolved",
      "closed",
    ]);
  });
});

describe("ローカルIssueの role 条件付きスキーマ（単一採番空間）", () => {
  const fm = (overrides: Partial<LocalIssueFrontmatter>): LocalIssueFrontmatter => ({
    id: "issue-0001",
    title: "件名",
    role: "tracking",
    status: "created",
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
    closed_at: "",
    labels: ["problem"],
    ...overrides,
  });

  it("role ごとの status 値域、labels 値域、終端状態が定義される", () => {
    expect([...localStatusValues("tracking")]).toHaveLength(6);
    expect([...localStatusValues("case")]).toEqual([
      "open",
      "running",
      "blocked",
      "review",
      "closed",
      "cancelled",
    ]);
    expect([...localLabelValues("tracking")]).toEqual(["problem", "idea", "task", "risk"]);
    expect([...localLabelValues("case")]).toContain("feature");
    expect([...localTerminalStatuses("tracking")]).toEqual(["closed"]);
    expect([...localTerminalStatuses("case")]).toEqual(["closed", "cancelled"]);
  });

  it("追跡Issueは kind をちょうど1つ、終端状態は closed_at を要求する", () => {
    expect(validateLocalIssue(fm({}), "issue-0001.md").valid).toBe(true);
    expect(validateLocalIssue(fm({ labels: [] }), "issue-0001.md").valid).toBe(false);
    expect(validateLocalIssue(fm({ labels: ["risk", "task"] }), "issue-0001.md").valid).toBe(false);
    expect(validateLocalIssue(fm({ status: "closed", closed_at: "" }), "issue-0001.md").valid).toBe(false);
    expect(
      validateLocalIssue(fm({ status: "closed", closed_at: "2026-08-25T00:00:00Z" }), "issue-0001.md").valid,
    ).toBe(true);
    expect(validateLocalIssue(fm({ status: "review" }), "issue-0001.md").valid).toBe(false);
  });

  it("採番は role をまたぐ単一空間で既存最大 + 1", async () => {
    const issuesDir = makeIssuesDir();
    const env = localEnv(issuesDir);
    const case1 = await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "Case",
      body: "b",
      labels: ["feature"],
    });
    expect(case1.ok).toBe(true);
    const tracking2 = await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "追跡",
      body: "b",
      labels: [],
      role: "tracking",
      kind: "task",
    });
    expect(tracking2.ok).toBe(true);
    if (tracking2.ok && case1.ok) {
      expect(tracking2.success.number).toBe(case1.success.number + 1);
    }
    expect(fs.readdirSync(issuesDir).sort()).toEqual(["issue-0001.md", "issue-0002.md"]);
  });

  it("同一の Tool 操作契約で追跡Issue操作が完結する（ローカル版）", async () => {
    const issuesDir = makeIssuesDir();
    const env = localEnv(issuesDir);
    const created = await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "論点",
      body: "## 背景\n\n本文",
      labels: [],
      role: "tracking",
      kind: "idea",
    });
    expect(created.ok).toBe(true);

    const listed = await runAgentdevGhOperation(env, {
      operation: "issue_list",
      role: "tracking",
      kind: "idea",
    });
    expect(listed.ok).toBe(true);
    if (listed.ok && listed.success.operation === "issue_list") {
      expect(listed.success.issues.length).toBe(1);
      expect(listed.success.issues[0]?.role).toBe("tracking");
    }

    const commented = await runAgentdevGhOperation(env, {
      operation: "issue_comment",
      number: 1,
      body: "検討を開始した",
    });
    expect(commented.ok).toBe(true);
    const history = await runAgentdevGhOperation(env, {
      operation: "issue_comment",
      number: 1,
    });
    expect(history.ok).toBe(true);
    if (history.ok && history.success.operation === "issue_comment") {
      expect(history.success.comments.length).toBe(1);
      expect(history.success.comments[0]?.body).toContain("検討を開始した");
    }

    const resolved = await runAgentdevGhOperation(env, {
      operation: "issue_update",
      number: 1,
      trackingState: "resolved",
    });
    expect(resolved.ok).toBe(true);
    const closed = await runAgentdevGhOperation(env, {
      operation: "issue_close",
      number: 1,
      reason: "completed",
    });
    expect(closed.ok).toBe(true);
    const reopened = await runAgentdevGhOperation(env, {
      operation: "issue_reopen",
      number: 1,
    });
    expect(reopened.ok).toBe(true);
  });

  it("PR 相当情報は role: case のローカルIssueのみが保持対象となる", async () => {
    const issuesDir = makeIssuesDir();
    const env = localEnv(issuesDir);
    await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "追跡",
      body: "b",
      labels: [],
      role: "tracking",
      kind: "risk",
    });
    const onlyTracking = await runAgentdevGhOperation(env, {
      operation: "pr_create",
      title: "PR",
      body: "b",
      base: "main",
      head: "feature/x",
    });
    expect(onlyTracking.ok).toBe(false);
    if (!onlyTracking.ok) {
      expect(onlyTracking.ok).toBe(false);
    }

    await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "Case",
      body: "## Design確定候補\n\n- なし\n\n## Findings / Capture候補\n\n### intake\n\n- なし\n\n### learning\n\n- なし\n",
      labels: ["feature"],
    });
    const pr = await runAgentdevGhOperation(env, {
      operation: "pr_create",
      title: "PR",
      body: "b",
      base: "main",
      head: "feature/x",
    });
    expect(pr.ok).toBe(true);
    if (pr.ok && pr.success.operation === "pr_create") {
      expect(pr.success.number).toBe(2);
    }
    const trackingRaw = fs.readFileSync(path.join(issuesDir, "issue-0001.md"), "utf8");
    expect(trackingRaw).not.toContain("### PR title:");
    const caseRaw = fs.readFileSync(path.join(issuesDir, "issue-0002.md"), "utf8");
    expect(caseRaw).toContain("### PR title: PR");
  });

  it("マージ結果セクションへの記録と blocked 更新が同一契約で構成できる", async () => {
    const issuesDir = makeIssuesDir();
    const env = localEnv(issuesDir);
    await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "Case",
      body: "## Design確定候補\n\n- なし\n\n## Findings / Capture候補\n\n### intake\n\n- なし\n\n### learning\n\n- なし\n",
      labels: ["feature"],
    });
    const pr = await runAgentdevGhOperation(env, {
      operation: "pr_create",
      title: "PR",
      body: "本文",
      base: "main",
      head: "feature/x",
      number: 1,
    });
    expect(pr.ok).toBe(true);
    const merged = await runAgentdevGhOperation(env, {
      operation: "pr_merge",
      number: 1,
      method: "squash",
    });
    expect(merged.ok).toBe(true);
    const raw = fs.readFileSync(path.join(issuesDir, "issue-0001.md"), "utf8");
    expect(raw).toContain("## マージ結果");
    expect(raw).toContain("結果: PASS");

    const read = await runAgentdevGhOperation(env, { operation: "issue_read", number: 1 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "issue_read") {
      const failing = read.success.body
        .replace(/\n+$/, "")
        .concat("\n\n## マージ結果（再取り込み）\n\n- 操作: ローカル再取り込み\n- 実行日時: 2026-08-25T00:00:00Z\n- 結果: FAIL\n")
        .replace("status: open", "status: blocked");
      const updated = await runAgentdevGhOperation(env, {
        operation: "issue_update",
        number: 1,
        body: failing,
      });
      expect(updated.ok).toBe(true);
      const after = fs.readFileSync(path.join(issuesDir, "issue-0001.md"), "utf8");
      expect(after).toContain("status: blocked");
      expect(after).toContain("結果: FAIL");
    }
  });
});

describe("上位層の Tool 操作契約経由（直接読み書きなし）", () => {
  const DIST_ROOTS = [
    path.join("src", "opencode", "skills"),
    path.join("src", "opencode", "commands"),
  ];
  const FORBIDDEN = [
    "agentdev-tracking-status/",
    "agentdev-kind/",
    ".agentdev/issues",
    "docs/issue-list",
  ];

  function markdownFiles(root: string): string[] {
    const out: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (entry.isFile() && entry.name.endsWith(".md")) out.push(p);
      }
    };
    walk(root);
    return out;
  }

  it("skills/commands の配布テキストに物理ラベル・保存先・旧課題管理の残存がない", () => {
    for (const root of DIST_ROOTS) {
      for (const file of markdownFiles(root)) {
        const text = fs.readFileSync(file, "utf8");
        for (const literal of FORBIDDEN) {
          if (text.includes(literal)) {
            throw new Error(`distributed text artifact references physical detail: ${file}: ${literal}`);
          }
        }
      }
    }
  });

  it("追跡Issue操作入口の SKILL と command が自然言語操作種別を網羅する", () => {
    const workflow = fs.readFileSync(
      path.join("src", "opencode", "skills", "agentdev-workflow-issue", "SKILL.md"),
      "utf8",
    );
    for (const op of [
      "新規起票",
      "検索・参照",
      "更新",
      "検討経過の追加",
      "保留",
      "再評価",
      "実行準備完了",
      "解決",
      "反映確認",
      "クローズ",
      "再オープン",
    ]) {
      if (!workflow.includes(op)) {
        throw new Error(`workflow-issue SKILL.md misses operation: ${op}`);
      }
    }
    const command = fs.readFileSync(
      path.join("src", "opencode", "commands", "agentdev", "issue.md"),
      "utf8",
    );
    for (const op of ["起票", "検索", "参照", "更新", "保留", "再評価", "解決", "反映確認", "クローズ", "再オープン"]) {
      if (!command.includes(op)) {
        throw new Error(`issue command misses operation: ${op}`);
      }
    }
  });

  it("GitHub 実装詳細の把握をユーザーに要求せず、リポジトリ内課題ファイルを作成しない境界が明示される", () => {
    const command = fs.readFileSync(
      path.join("src", "opencode", "commands", "agentdev", "issue.md"),
      "utf8",
    );
    expect(command).toContain("ラベル名等の操作文法や GitHub 実装詳細をユーザーに要求しない");
    expect(command).toContain("リポジトリ内に課題ファイルを作成し、commit しない");
    const capability = fs.readFileSync(
      path.join("src", "opencode", "skills", "agentdev-issue-tracking", "SKILL.md"),
      "utf8",
    );
    expect(capability).toContain("サブコマンド、ラベル名、Issue Type、Field 名等の GitHub 実装詳細の把握をユーザーに要求しない");
  });

  it("起票時の事前解決・重複回避・代理確定禁止とコメント正規履歴が定義される", () => {
    const capability = fs.readFileSync(
      path.join("src", "opencode", "skills", "agentdev-issue-tracking", "SKILL.md"),
      "utf8",
    );
    expect(capability).toContain("事前解決の試行");
    expect(capability).toContain("既存追跡Issue検索");
    expect(capability).toContain("勝手に確定しない");
    expect(capability).toContain("コメントを正規の時系列履歴とする");
    expect(capability).toContain("二重保持しない");
    expect(capability).toContain("保留理由と再評価条件");
    expect(capability).toContain("反映先と反映状態");
  });
});
