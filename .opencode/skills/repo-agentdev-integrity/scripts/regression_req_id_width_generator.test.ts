import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import {
  collectReqFiles,
  collectReqMetrics,
  generateReqActiveTable,
  generateReqMetricsTable,
} from "./generate_indexes.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `req-index-width-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);
const REQ_DIR = join(TEMP_ROOT, "requirements");

function writeReqFile(): void {
  mkdirSync(REQ_DIR, { recursive: true });
  writeFileSync(
    join(REQ_DIR, "REQ-001.md"),
    [
      "---",
      "id: REQ-001",
      "title: Current requirement",
      "created: 2026-07-26",
      "updated: 2026-07-26",
      "tags:",
      "  - test",
      "---",
      "",
      "# REQ-001",
      "",
      "| REQ-001-001 | Current requirement |",
      "",
    ].join("\n"),
    "utf-8",
  );
}

beforeAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
  writeReqFile();
});

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("REQ-001 generator namespace", () => {
  it("preserves REQ-001 in collection and generated active table", () => {
    const infos = collectReqFiles(REQ_DIR);
    expect(infos).toHaveLength(1);
    expect(infos[0]?.id).toBe("REQ-001");
    expect(infos[0]?.num).toBe(1);
    const table = generateReqActiveTable(infos).join("\n");
    expect(table).toContain("REQ-001");
    expect(table).not.toContain("REQ-0001");
  });

  it("preserves REQ-001 in collected metrics and metrics table", () => {
    const metrics = collectReqMetrics(REQ_DIR);
    expect(metrics).toHaveLength(1);
    expect(metrics[0]?.id).toBe("REQ-001");
    const table = generateReqMetricsTable(metrics, "2026-07-26").join("\n");
    expect(table).toContain("REQ-001");
    expect(table).not.toContain("REQ-0001");
  });
});
