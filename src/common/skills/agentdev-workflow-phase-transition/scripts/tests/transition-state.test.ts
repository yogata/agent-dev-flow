import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isTerminalRecord, parseTransitionRecord } from "../lib/schema.ts";
import { applyRecord, lookupRecord } from "../lib/store.ts";
import { checkIdentityAgainstRecord, parseIdentity } from "../lib/identity.ts";
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

  test("rejects an empty-string toPhase even for a terminal intent", () => {
    const parsed = parseTransitionRecord({ ...baseRecord, toPhase: "" });
    expect(parsed.ok).toBe(false);
  });
});

describe("terminal transition records", () => {
  const terminalRecord = { ...baseRecord, toPhase: null };

  test("parses a terminal record and reconstructs terminal from it", () => {
    const parsed = parseTransitionRecord(terminalRecord);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(isTerminalRecord(parsed.record)).toBe(true);
    }
  });

  test("reconstructs a normal record as non-terminal", () => {
    const parsed = parseTransitionRecord(baseRecord);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(isTerminalRecord(parsed.record)).toBe(false);
    }
  });

  test("still rejects unknown fields on a terminal record", () => {
    const parsed = parseTransitionRecord({ ...terminalRecord, progress: "100%" });
    expect(parsed.ok).toBe(false);
  });

  test("records a terminal transition once and restores it from the record", async () => {
    const first = await applyRecord(dir, terminalRecord);
    expect(first.result).toBe("recorded");
    const second = await applyRecord(dir, terminalRecord);
    expect(second.result).toBe("duplicate");
    const lookup = await lookupRecord(dir, "transition-20261013-001");
    expect(lookup.result).toBe("existing");
    if (lookup.result === "existing") {
      expect(lookup.record.toPhase).toBeNull();
      expect(isTerminalRecord(lookup.record)).toBe(true);
    }
  });

  test("keeps normal and terminal records distinguishable in the same directory", async () => {
    await applyRecord(dir, baseRecord);
    await applyRecord(dir, { ...terminalRecord, key: "transition-20261013-002" });
    const normal = await lookupRecord(dir, "transition-20261013-001");
    const terminal = await lookupRecord(dir, "transition-20261013-002");
    expect(normal.result).toBe("existing");
    expect(terminal.result).toBe("existing");
    if (normal.result === "existing" && terminal.result === "existing") {
      expect(isTerminalRecord(normal.record)).toBe(false);
      expect(isTerminalRecord(terminal.record)).toBe(true);
    }
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

describe("same-key content match (duplicate restoration vs fail-closed refusal)", () => {
  test("treats a same-key re-run with a differing recordedAt as duplicate (recordedAt is not compared)", async () => {
    const first = await applyRecord(dir, baseRecord);
    expect(first.result).toBe("recorded");
    const second = await applyRecord(dir, { ...baseRecord, recordedAt: "2026-10-13T11:30:00Z" });
    expect(second.result).toBe("duplicate");
    if (second.result === "duplicate") {
      expect(second.record.recordedAt).toBe("2026-10-13T09:00:00Z");
    }
  });

  test("refuses a same-key request with a differing scope without restoring, overwriting, or saving", async () => {
    await applyRecord(dir, baseRecord);
    let threw = false;
    try {
      await applyRecord(dir, { ...baseRecord, scope: "work-scope-b" });
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
    const lookup = await lookupRecord(dir, baseRecord.key);
    expect(lookup.result).toBe("existing");
    if (lookup.result === "existing") {
      expect(lookup.record.scope).toBe("work-scope-a");
    }
    const files = await readdir(dir);
    expect(files.filter((f) => f.endsWith(".json")).length).toBe(1);
  });

  test("refuses a same-key request with a differing toPhase and keeps the recorded transition", async () => {
    await applyRecord(dir, baseRecord);
    let threw = false;
    try {
      await applyRecord(dir, { ...baseRecord, toPhase: "review" });
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
    const lookup = await lookupRecord(dir, baseRecord.key);
    expect(lookup.result).toBe("existing");
    if (lookup.result === "existing") {
      expect(lookup.record.toPhase).toBe("design");
    }
    const files = await readdir(dir);
    expect(files.filter((f) => f.endsWith(".json")).length).toBe(1);
  });

  test("refuses a same-key request with a differing fromPhase", async () => {
    await applyRecord(dir, baseRecord);
    let threw = false;
    try {
      await applyRecord(dir, { ...baseRecord, fromPhase: "plan" });
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});

describe("unreadable record area is error, never absence", () => {
  test("reports an unreadable record area as error, not as absence", async () => {
    const filePath = join(dir, "blocked");
    await writeFile(filePath, "placeholder", "utf8");
    const lookup = await lookupRecord(filePath, "transition-20261013-001");
    expect(lookup.result).toBe("error");
    if (lookup.result === "error") {
      expect(lookup.path).toBe(filePath);
    }
  });

  test("refuses to record over an unverifiable existing state without saving", async () => {
    const filePath = join(dir, "blocked");
    await writeFile(filePath, "placeholder", "utf8");
    let threw = false;
    try {
      await applyRecord(filePath, baseRecord);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
    const lookup = await lookupRecord(filePath, baseRecord.key);
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

describe("identity check at the re-acquisition entry (REQ-111-023)", () => {
  test("parses the flat identity file with quoted values", () => {
    const identity = parseIdentity('undertaking: "work-scope-a"\ntarget_version: ""\ncurrent_phase: "design"\n');
    expect(identity).toEqual({ undertaking: "work-scope-a", currentPhase: "design" });
  });

  test("matches a post-transition identity (current_phase equals toPhase)", () => {
    const check = checkIdentityAgainstRecord(
      { undertaking: "work-scope-a", currentPhase: "design" },
      baseRecord,
    );
    expect(check).toEqual({ ok: true, undertaking: "match", currentPhase: "match-toPhase" });
  });

  test("matches a pre-finalized identity (current_phase equals fromPhase)", () => {
    const check = checkIdentityAgainstRecord(
      { undertaking: "work-scope-a", currentPhase: "requirements" },
      baseRecord,
    );
    expect(check).toEqual({ ok: true, undertaking: "match", currentPhase: "match-fromPhase" });
  });

  test("holds a different undertaking (opN-b class: another undertaking inheriting the recorded transition)", () => {
    const check = checkIdentityAgainstRecord(
      { undertaking: "work-scope-z unrelated tool", currentPhase: "design" },
      baseRecord,
    );
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.reasons.some((reason) => reason.includes("work-scope-z unrelated tool"))).toBe(true);
    }
  });

  test("holds an empty undertaking instead of treating it as a match", () => {
    const check = checkIdentityAgainstRecord({ undertaking: "", currentPhase: "design" }, baseRecord);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.reasons[0]).toContain("undertaking is empty");
    }
  });

  test("holds a current_phase matching neither fromPhase nor toPhase", () => {
    const check = checkIdentityAgainstRecord(
      { undertaking: "work-scope-a", currentPhase: "implementation" },
      baseRecord,
    );
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.reasons[0]).toContain("current_phase");
    }
  });

  test("a terminal record (toPhase null) only matches fromPhase", () => {
    const terminal = { ...baseRecord, toPhase: null };
    expect(checkIdentityAgainstRecord({ undertaking: "work-scope-a", currentPhase: "requirements" }, terminal).ok).toBe(true);
    expect(checkIdentityAgainstRecord({ undertaking: "work-scope-a", currentPhase: "design" }, terminal).ok).toBe(false);
  });

  test("does not auto-resolve a label-only difference (exact string comparison)", () => {
    const check = checkIdentityAgainstRecord(
      { undertaking: "work-scope-a (tool)", currentPhase: "design" },
      baseRecord,
    );
    expect(check.ok).toBe(false);
  });
});
