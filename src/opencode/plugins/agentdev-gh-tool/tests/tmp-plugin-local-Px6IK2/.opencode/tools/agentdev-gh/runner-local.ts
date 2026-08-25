import type { GhRunner } from "../../../../../../../src/opencode/tools/agentdev-gh/runner.ts";
export function createLocalRunner(options: { issuesDir: string }): GhRunner {
  return {
    async run(request) {
      if (request.operation === "issue_read") {
        return { ok: true, payload: { number: 1, title: "LOCAL", body: "B", state: "open" } };
      }
      return { ok: false, error: "local stub: unsupported op", exitCode: null };
    },
  };
}
