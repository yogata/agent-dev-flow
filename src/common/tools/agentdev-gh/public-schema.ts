// agentdev-gh Custom Tool の host 非依存公開スキーマ（Tool 引数の JSON Schema）。
//
// 公開される Tool スキーマは操作契約（contracts.ts）に追従する。operation の
// enum は操作カタログ（GH_TOOL_OPERATIONS）から生成し、スキーマと validator の
// 漂流を防ぐ。OpenCode（plugins/agentdev-gh-tool）と Senpi（src/senpi/tools/）
// の両ホスト接続が本モジュールを参照し、ホスト別にスキーマを複製しない。

import { GH_TOOL_OPERATIONS } from "./contracts.ts";

/** 操作要求の公開スキーマ（JSON Schema）。正の契約は Tool の contracts.ts が所有する。 */
export const AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA = {
  type: "object",
  description:
    "Structured GitHub issue/PR operation request. See the agentdev_gh operation contract " +
    "(issue_create, issue_read, issue_update, issue_close, pr_create, pr_read, pr_merge, pr_changed_files, " +
    "pr_mergeable, pr_update, issue_list, issue_reopen, comment_create, comment_list, comment_update, " +
    "comment_delete). " +
    "Tracking-issue operations expose logical values (role, kind, trackingState); physical label mapping " +
    "is applied inside the tool. Comments are a shared logical resource of issues and pull requests, " +
    "identified by commentId (public type: string). Side-effect operations are verified by read-back " +
    "before success is returned (fail-closed).",
  properties: {
    operation: {
      type: "string",
      enum: [...GH_TOOL_OPERATIONS],
      description: "Operation name from the agentdev_gh operation catalog.",
    },
    number: {
      type: "integer",
      minimum: 1,
      description:
        "Issue/PR (or local issue) number. comment_create/comment_list use the parent issue or PR number.",
    },
    commentId: {
      type: "string",
      description: "Comment identifier for comment_update / comment_delete (public type: string).",
    },
    title: { type: "string", description: "Title for issue_create / issue_update / pr_create / pr_update." },
    body: {
      type: "string",
      description:
        "Markdown body for write operations (issues, PRs, comments).",
    },
    labels: {
      type: "array",
      items: { type: "string" },
      description:
        "Labels accepted by issue_create, issue_update, and issue_list; required for issue_create. Tracking-axis labels are managed by the tool.",
    },
    role: {
      type: "string",
      enum: ["tracking", "case"],
      description: "Logical issue role for issue_create / issue_list.",
    },
    kind: {
      type: "string",
      enum: ["problem", "idea", "task", "risk"],
      description: "Logical tracking-issue kind for issue_create / issue_update / issue_list.",
    },
    trackingState: {
      type: "string",
      enum: ["created", "in-discussion", "on-hold", "ready", "resolved", "closed"],
      description:
        "Logical tracking-issue state. issue_update accepts non-terminal states only; issue_list accepts all.",
    },
    state: {
      type: "string",
      enum: ["open", "closed"],
      description: "Open/closed filter for issue_list.",
    },
    search: {
      type: "string",
      description:
        "Server-side title search for issue_list; pushed to the GitHub search API (search/issues, in:title, tokenized match — not a substring filter).",
    },
    reason: { type: "string", enum: ["completed", "not_planned"], description: "Close reason for issue_close." },
    base: { type: "string", description: "Base branch for pr_create." },
    head: { type: "string", description: "Head branch for pr_create." },
    method: { type: "string", enum: ["merge", "squash", "rebase"], description: "Merge method for pr_merge." },
  },
  required: ["operation"],
  additionalProperties: false,
} as const;
