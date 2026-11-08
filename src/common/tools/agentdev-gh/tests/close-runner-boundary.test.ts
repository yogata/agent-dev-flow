import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { createCliRunner } from "../runner-cli.ts";
import { createLocalRunner } from "../local/runner-local.ts";
import { createGitHubStub } from "./four-combination-shared.ts";
import { makeCloseAcceptanceFixture, writeCloseAcceptanceRecord, writeRawCloseAcceptanceRecord } from "./four-combination-shared.ts";

describe("TS-007 runner 直接終了境界", () => {
  test("FN-1: CliRunner 直接呼出しでも記録なしの Case Issue を閉じない", async () => {
    const root = fs.mkdtempSync(path.join(import.meta.dir, "tmp-close-boundary-"));
    try {
      const stub = createGitHubStub({ issues: [{
        number: 3932, title: "case", body: "body", state: "open",
        state_reason: null, labels: ["feature"], updated_at: "2026-11-05T00:00:00Z",
      }] });
      const runner = createCliRunner({ repo: "owner/repo", tempDir: root, exec: stub.exec });
      const result = await runner.run({ operation: "issue_close", args: { number: 3932 } });
      expect(result.ok).toBe(false);
      expect(stub.issues[0]?.state).toBe("open");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("FN-2: LocalRunner 直接呼出しでも frontmatter role case の記録なし終了を拒否する", async () => {
    const root = fs.mkdtempSync(path.join(import.meta.dir, "tmp-close-boundary-"));
    try {
      const runner = createLocalRunner({ issuesDir: root });
      await runner.run({ operation: "issue_create", args: { title: "case", body: "body", role: "case", labels: [] } });
      const before = fs.readFileSync(path.join(root, "issue-0001.md"), "utf8");
      const result = await runner.run({ operation: "issue_close", args: { number: 1 } });
      expect(result.ok).toBe(false);
      expect(fs.readFileSync(path.join(root, "issue-0001.md"), "utf8")).toBe(before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

for (const backend of ["GitHub", "Local"] as const) {
  describe(`TS-007 ${backend} runner 直接呼出しの拒否マトリクス`, () => {
    for (const condition of ["missing", "unreadable", "malformed", "issue-mismatch", "denied", "stale", "missing-judgment", "valid"] as const) {
      test(`${condition}: 検証成立時だけ副作用を実行する`, async () => {
        const fixture = makeCloseAcceptanceFixture("tmp-direct-close-");
        const issuesDir = path.join(fixture.mainRoot, ".agentdev", "issues");
        const revision = "2026-11-05T00:00:00.000Z";
        const stub = createGitHubStub({ issues: [{ number: 1, title: "case", body: "body", state: "open", state_reason: null, labels: [], updated_at: revision }] });
        const io = condition === "unreadable" ? {
          ...fixture.io,
          readTextFile: (_path: string): string => { throw new Error("EACCES: unreadable record"); },
        } : fixture.io;
        try {
          const runner = backend === "GitHub"
            ? createCliRunner({ repo: "owner/repo", tempDir: fixture.mainRoot, exec: stub.exec, closeAcceptanceIo: io })
            : createLocalRunner({ issuesDir, closeAcceptanceIo: io, now: () => new Date(revision) });
          if (backend === "Local") {
            await runner.run({ operation: "issue_create", args: { title: "case", body: "body", role: "case", labels: [] } });
          }
          if (condition !== "missing") {
            writeCloseAcceptanceRecord(fixture, 1, {
              issueNumber: condition === "issue-mismatch" ? 2 : 1,
              targetRevision: condition === "stale" ? "2020-01-01T00:00:00Z" : revision,
              generatedAt: "2026-11-05T01:00:00Z",
              ...(condition === "missing-judgment"
                ? // 旧様式相当: 旧台帳照合の結果のみを含み、判定内容（accepted）を含まない記録。
                  { verificationResources: { state: "confirmed-empty", entries: [] } }
                : { accepted: condition !== "denied" }),
            });
          }
          if (condition === "malformed") writeRawCloseAcceptanceRecord(fixture, 1, "{invalid");
          const result = await runner.run({ operation: "issue_close", args: { number: 1 } });
          expect(result.ok).toBe(condition === "valid");
          if (!result.ok) expect(result.failureClass).toBe("verification-incomplete");
          if (backend === "GitHub") {
            expect(stub.issues[0]?.state).toBe(condition === "valid" ? "closed" : "open");
          } else {
            const raw = fs.readFileSync(path.join(issuesDir, "issue-0001.md"), "utf8");
            expect(raw).toContain(condition === "valid" ? "status: closed" : "status: open");
          }
        } finally {
          fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
        }
      });
    }
  });
}
