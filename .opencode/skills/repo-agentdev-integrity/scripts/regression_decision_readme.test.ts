/**
 * Regression tests: Decision README AUTOGEN generators (DEC-009, Issue #2135).
 *
 * (1) Decision ID width preservation
 *     Verifies that a canonical file `DEC-001.md` is represented as stable
 *     ID `DEC-001` (filename-derived digits kept verbatim, no zero-padding
 *     rewrite) in:
 *       - DecisionInfo from collectDecisionFiles / collectRetiredDecisionFiles
 *       - generated AUTOGEN block bodies (baseline table, status list, retired table)
 *
 * (2) Baseline caption format
 *     Verifies the decision-baseline-count caption wording:
 *     「現行の承認済み Decision はN件、提案中の Decision はM件である。」
 *     (accepted / proposed counts derived from docs/decisions/DEC-*.md)
 *
 * (3) Baseline table coverage
 *     Verifies that the baseline table emits ALL decisions (proposed /
 *     superseded included) with the status column, matching
 *     docs/decisions/README.md decision-baseline-table structure.
 */
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import {
  collectDecisionFiles,
  collectRetiredDecisionFiles,
  generateDecisionBaselineCaption,
  generateDecisionBaselineTable,
  generateDecisionStatusList,
  generateDecisionRetiredTable,
  type DecisionInfo,
} from "./generate_indexes.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `decision-readme-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

function writeDecisionFile(
  dir: string,
  filename: string,
  fields: { title: string; status: string; created: string },
): void {
  mkdirSync(dir, { recursive: true });
  const id = filename.replace(/\.md$/, "");
  const content = [
    "---",
    `id: ${id}`,
    `title: ${fields.title}`,
    `status: ${fields.status}`,
    `created: ${fields.created}`,
    "---",
    "",
    `# ${id}: ${fields.title}`,
    "",
  ].join("\n");
  writeFileSync(join(dir, filename), content, "utf-8");
}

function makeDecision(id: string, status: string): DecisionInfo {
  return {
    id,
    num: Number(id.replace(/^DEC-/, "")),
    title: `Title for ${id}`,
    status,
    created: "2026-08-15",
    filename: `${id}.md`,
    relPath: `${id}.md`,
  };
}

beforeAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("Decision ID width: DEC-001.md generates DEC-001 in every affected AUTOGEN block", () => {
  const decisionsDir = join(TEMP_ROOT, "active");

  beforeAll(() => {
    writeDecisionFile(decisionsDir, "DEC-001.md", {
      title: "意思決定 A",
      status: "accepted",
      created: "2026-07-24",
    });
    writeDecisionFile(decisionsDir, "DEC-002.md", {
      title: "意思決定 B",
      status: "proposed",
      created: "2026-08-15",
    });
  });

  it("collectDecisionFiles returns id DEC-001 with filename-derived digits", () => {
    const infos = collectDecisionFiles(decisionsDir);
    expect(infos.length).toBe(2);
    expect(infos[0].id).toBe("DEC-001");
    expect(infos[0].filename).toBe("DEC-001.md");
    expect(infos[0].relPath).toBe("DEC-001.md");
    expect(infos[0].num).toBe(1);
    expect(infos[1].id).toBe("DEC-002");
  });

  it("decision-baseline-table emits all statuses with the status column", () => {
    const infos = collectDecisionFiles(decisionsDir);
    const lines = generateDecisionBaselineTable(infos);
    expect(lines[0]).toBe("| Decision番号 | タイトル | ステータス | 作成日 |");
    const joined = lines.join("\n");
    expect(joined).toContain("| DEC-001 | 意思決定 A | accepted | 2026-07-24 |");
    expect(joined).toContain("| DEC-002 | 意思決定 B | proposed | 2026-08-15 |");
  });

  it("decision-status-accepted links [DEC-001](DEC-001.md)", () => {
    const infos = collectDecisionFiles(decisionsDir);
    const lines = generateDecisionStatusList(infos, "accepted");
    expect(lines).toEqual(["- [DEC-001](DEC-001.md)（意思決定 A）"]);
  });
});

describe("Decision retired table: retired/DEC-*.md rows with links", () => {
  const retiredDir = join(TEMP_ROOT, "retired");

  beforeAll(() => {
    writeDecisionFile(retiredDir, "DEC-003.md", {
      title: "廃止済み意思決定",
      status: "superseded",
      created: "2026-07-01",
    });
  });

  it("collectRetiredDecisionFiles returns relPath with retired/ prefix", () => {
    const infos = collectRetiredDecisionFiles(retiredDir);
    expect(infos.length).toBe(1);
    expect(infos[0].id).toBe("DEC-003");
    expect(infos[0].relPath).toBe("retired/DEC-003.md");
  });

  it("decision-retired-table links [DEC-003](retired/DEC-003.md)", () => {
    const infos = collectRetiredDecisionFiles(retiredDir);
    const lines = generateDecisionRetiredTable(infos);
    expect(lines[0]).toBe("| Decision番号 | タイトル | retired時ステータス |");
    expect(lines.join("\n")).toContain(
      "[DEC-003](retired/DEC-003.md)",
    );
  });

  it("empty retired set emits header + separator only", () => {
    const lines = generateDecisionRetiredTable([]);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe("|---------|---------|-------------------|");
  });
});

describe("Decision baseline caption: accepted/proposed counts", () => {
  it("caption derives accepted and proposed counts from the full list", () => {
    const decisions = [
      makeDecision("DEC-001", "accepted"),
      makeDecision("DEC-002", "accepted"),
      makeDecision("DEC-003", "proposed"),
    ];
    const lines = generateDecisionBaselineCaption(decisions);
    expect(lines).toEqual([
      "現行の承認済み Decision は2件、提案中の Decision は1件である。",
    ]);
  });

  it("caption counts zero cases explicitly", () => {
    const lines = generateDecisionBaselineCaption([
      makeDecision("DEC-001", "superseded"),
    ]);
    expect(lines[0]).toBe(
      "現行の承認済み Decision は0件、提案中の Decision は0件である。",
    );
  });
});
