import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { matchAssemblyEvidence } from "../src/evidence-match.ts";

const SCRIPT = fileURLToPath(new URL("../src/assemble-draft-section.ts", import.meta.url));
const ORIGINAL = "# Doc\n\n## Target\n\nold phrase\nkeep this\n\n## Other\nuntouched\n";

let workDir: string;

function runScript(args: string[], stdinJson: unknown): { exitCode: number; stdout: string; stderr: string } {
  const proc = Bun.spawnSync({
    cmd: [process.execPath, SCRIPT, ...args],
    cwd: import.meta.dir,
    stdin: Buffer.from(JSON.stringify(stdinJson), "utf-8"),
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    exitCode: proc.exitCode ?? -1,
    stdout: proc.stdout.toString(),
    stderr: proc.stderr.toString(),
  };
}

function docPath(): string {
  return join(workDir, "doc.md");
}

function freshDoc(): void {
  writeFileSync(docPath(), ORIGINAL, "utf-8");
}

beforeAll(() => {
  workDir = mkdtempSync(join(process.env.TEMP ?? process.env.TMP ?? "/tmp", "assembly-realpath-"));
  freshDoc();
});

afterAll(() => {
  rmSync(workDir, { recursive: true, force: true });
});

describe("real-path assembly (actual CLI invocation)", () => {
  test("assembles a local replacement and preserves untouched text", () => {
    freshDoc();
    const run = runScript([], {
      operation: "replace",
      target_file: docPath(),
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    });

    expect(run.exitCode).toBe(0);
    const parsed = JSON.parse(run.stdout) as {
      ok: boolean;
      diff_summary: { added: number; removed: number; hunks: Array<{ before: string[]; after: string[] }> };
      evidence: { target_content_sha256: string; executed_at: string };
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.diff_summary.added).toBe(1);
    expect(parsed.diff_summary.removed).toBe(1);
    expect(parsed.diff_summary.hunks[0]?.before).toEqual(["old phrase"]);
    expect(parsed.diff_summary.hunks[0]?.after).toEqual(["new phrase"]);
    expect(parsed.evidence.target_content_sha256).toHaveLength(64);
    expect(readFileSync(docPath(), "utf-8")).toBe(ORIGINAL);
  });

  test("writes the assembled content only with --write", () => {
    freshDoc();
    const run = runScript(["--write"], {
      operation: "replace",
      target_file: docPath(),
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    });

    expect(run.exitCode).toBe(0);
    expect(readFileSync(docPath(), "utf-8")).toBe(ORIGINAL.replace("old phrase", "new phrase"));
  });

  test("rejects missing, ambiguous, and count-mismatched inputs without writing", () => {
    freshDoc();
    const rejectCases: Array<Record<string, unknown>> = [
      { operation: "replace", target_file: docPath(), target_area: "Missing", old_text: "old phrase", new_text: "new phrase" },
      { operation: "replace", target_file: join(workDir, "dup.md"), target_area: "Target", old_text: "old phrase", new_text: "new phrase" },
      { operation: "replace", target_file: docPath(), target_area: "Target", old_text: "keep", new_text: "changed", expected_old_count: 2 },
    ];
    // 複数一致は重複見出しの原文（dup.md）で再現する
    writeFileSync(join(workDir, "dup.md"), `${ORIGINAL}\n## Target\nsecond\n`, "utf-8");

    for (const input of rejectCases) {
      const run = runScript(["--write"], input);
      expect(run.exitCode).not.toBe(0);
      expect(run.stderr.length).toBeGreaterThan(0);
    }
    expect(readFileSync(docPath(), "utf-8")).toBe(ORIGINAL);
  });

  test("reuses persisted evidence on same-condition resume without re-running", () => {
    freshDoc();
    const input = {
      operation: "replace",
      target_file: docPath(),
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    };
    const first = runScript([], input);
    expect(first.exitCode).toBe(0);
    const firstParsed = JSON.parse(first.stdout) as { evidence: unknown };

    const storedEvidence = JSON.parse(JSON.stringify(firstParsed.evidence)) as unknown;
    const current = JSON.parse(JSON.stringify(firstParsed.evidence)) as Parameters<typeof matchAssemblyEvidence>[1];
    const resumed = matchAssemblyEvidence(storedEvidence, current);
    expect(resumed.reusable).toBe(true);
    expect(resumed.invalidates.assembly).toBe(false);
    expect(resumed.invalidates.inspection).toBe(false);
  });

  test("re-runs and re-evaluates when the source content changed", () => {
    freshDoc();
    const input = {
      operation: "replace",
      target_file: docPath(),
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    };
    const first = runScript([], input);
    const firstEvidence = JSON.parse(JSON.stringify((JSON.parse(first.stdout) as { evidence: unknown }).evidence)) as unknown;

    writeFileSync(docPath(), ORIGINAL.replace("keep this", "keep this too"), "utf-8");
    const second = runScript([], input);
    expect(second.exitCode).toBe(0);
    const secondEvidence = JSON.parse(JSON.stringify((JSON.parse(second.stdout) as { evidence: unknown }).evidence)) as Parameters<typeof matchAssemblyEvidence>[1];

    const staleMatch = matchAssemblyEvidence(firstEvidence, secondEvidence);
    expect(staleMatch.reusable).toBe(false);
    expect(staleMatch.mismatch_reasons).toContain("target_content_sha256");
    expect(staleMatch.invalidates.assembly).toBe(true);
    expect(secondEvidence.target_content_sha256).not.toBe((firstEvidence as { target_content_sha256: string }).target_content_sha256);
  });

  test("re-runs verification when the stored evidence is missing", () => {
    freshDoc();
    const input = {
      operation: "replace",
      target_file: docPath(),
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    };
    const first = runScript([], input);
    const current = JSON.parse(JSON.stringify((JSON.parse(first.stdout) as { evidence: unknown }).evidence)) as Parameters<typeof matchAssemblyEvidence>[1];

    const missingMatch = matchAssemblyEvidence(null, current);
    expect(missingMatch.reusable).toBe(false);
    expect(missingMatch.mismatch_reasons).toContain("evidence-missing");
    expect(missingMatch.invalidates.assembly).toBe(true);
    expect(missingMatch.invalidates.inspection).toBe(true);
  });
});
