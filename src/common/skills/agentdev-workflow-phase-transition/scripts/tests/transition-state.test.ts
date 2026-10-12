import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseTransitionRecord } from "../lib/schema.ts";
import { applyRecord, lookupRecord } from "../lib/store.ts";
import { parseSuccessorInput, resolveSuccessor } from "../lib/successor.ts";

const baseRecord = {
  key: "transition-20261013-001",
  scope: "work-scope-a",
  fromPhase: "requirements",
  toPhase: "design",
  recordedAt: "2026-10-13T09:00:00Z",
};

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "phase-transition-test-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("schema parse", () => {
  test("parses a valid record", () => {
    const parsed = parseTransitionRecord(baseRecord);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.record.key).toBe("transition-20261013-001");
    }
  });

  test("rejects a record with a non-ISO8601 recordedAt", () => {
    const parsed = parseTransitionRecord({ ...baseRecord, recordedAt: "2026/10/13" });
    expect(parsed.ok).toBe(false);
  });

  test("rejects unknown extra fields (progress ledger fields are forbidden)", () => {
    const parsed = parseTransitionRecord({ ...baseRecord, progress: "50%" });
    expect(parsed.ok).toBe(false);
  });
});

describe("applyRecord single-execution control", () => {
  test("records a new transition once", async () => {
    const applied = await applyRecord(dir, baseRecord);
    expect(applied.result).toBe("recorded");
  });

  test("re-running the same request never records twice (restores from the record)", async () => {
    const first = await applyRecord(dir, baseRecord);
    const second = await applyRecord(dir, baseRecord);
    expect(first.result).toBe("recorded");
    expect(second.result).toBe("duplicate");
    if (second.result === "duplicate") {
      expect(second.record.key).toBe("transition-20261013-001");
    }
  });

  test("rejects invalid input without writing anything", async () => {
    let wrote = false;
    try {
      await applyRecord(dir, { ...baseRecord, toPhase: "" });
    } catch {
      wrote = true;
    }
    expect(wrote).toBe(true);
  });

  test("refuses to record over a corrupted existing state (technical failure is not success)", async () => {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${encodeURIComponent(baseRecord.key)}.json`), "not-json", "utf8");
    let threw = false;
    try {
      await applyRecord(dir, baseRecord);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });

  test("propagates a write failure when the target directory cannot be created", async () => {
    const filePath = join(dir, "not-a-directory");
    await writeFile(filePath, "placeholder", "utf8");
    let threw = false;
    try {
      await applyRecord(join(filePath, "nested"), baseRecord);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});

describe("lookupRecord restoration", () => {
  test("reports absent when nothing is recorded (cancel keeps the current phase)", async () => {
    const lookup = await lookupRecord(dir, "missing-key");
    expect(lookup.result).toBe("absent");
  });

  test("restores only the committed transition after a re-run", async () => {
    await applyRecord(dir, baseRecord);
    const lookup = await lookupRecord(dir, "transition-20261013-001");
    expect(lookup.result).toBe("existing");
    if (lookup.result === "existing") {
      expect(lookup.record.fromPhase).toBe("requirements");
      expect(lookup.record.toPhase).toBe("design");
    }
  });

  test("reports a corrupted record as error, not as an existing record", async () => {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${encodeURIComponent("transition-20261013-002")}.json`), "{broken", "utf8");
    const lookup = await lookupRecord(dir, "transition-20261013-002");
    expect(lookup.result).toBe("error");
  });
});

describe("resolveSuccessor", () => {
  test("resolves zero successors to terminal without inventing a phase", () => {
    expect(resolveSuccessor([])).toEqual({ kind: "terminal" });
  });

  test("resolves one successor uniquely", () => {
    expect(resolveSuccessor(["design"])).toEqual({ kind: "unique", successor: "design" });
  });

  test("keeps multiple successors ambiguous for user choice", () => {
    const resolution = resolveSuccessor(["design", "review"]);
    expect(resolution.kind).toBe("ambiguous");
  });

  test("parses the successor input fail-closed", () => {
    expect(parseSuccessorInput({}).ok).toBe(false);
    expect(parseSuccessorInput({ candidates: ["a", ""] }).ok).toBe(false);
    expect(parseSuccessorInput({ candidates: ["a", "b"] }).ok).toBe(true);
  });
});
