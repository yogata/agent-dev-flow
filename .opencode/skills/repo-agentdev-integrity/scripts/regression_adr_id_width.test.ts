/**
 * Regression tests: ADR README AUTOGEN generators (deep-review findings).
 *
 * (1) ADR ID width preservation
 *     Verifies that a canonical ADR file `ADR-001.md` is represented as stable
 *     ID `ADR-001` (not `ADR-0001`) in:
 *       - AdrInfo.id from collectAdrFiles / collectRetiredAdrFiles
 *       - generated AUTOGEN block bodies (baseline table, status list, retired table)
 *     Also verifies that historical v2 four-digit ADR filenames
 *     (ADR-0001.md, ADR-0101.md) preserve their four-digit IDs.
 *     Root cause: extractAdrInfo normalized via `padStart(4, "0")`, turning
 *     `ADR-001.md` into id `ADR-0001` and colliding with the historical
 *     four-digit v2 namespace.
 *
 * (2) ADR baseline caption version neutrality
 *     Verifies that generateAdrBaselineCaption emits version-neutral wording
 *     with no v2-era `ADR-01XX` token and reports the current accepted count.
 *     Root cause: caption hardcoded `ADR-01XX` tied to the v2 four-digit band.
 *
 * The current canonical ADR collection uses three-digit IDs (ADR-001..ADR-005
 * per docs/adr/README.md).
 */
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import {
  collectAdrFiles,
  collectRetiredAdrFiles,
  generateAdrBaselineCaption,
  generateAdrBaselineTable,
  generateAdrStatusList,
  generateAdrRetiredTable,
  type AdrInfo,
} from "./generate_indexes.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `adr-id-width-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

function writeAdrFile(
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

function makeAcceptedAdr(id: string): AdrInfo {
  return {
    id,
    num: Number(id.replace(/^ADR-/, "")),
    title: `Title for ${id}`,
    status: "accepted",
    created: "2026-07-26",
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

describe("ADR ID width: ADR-001.md generates ADR-001 in every affected AUTOGEN block", () => {
  const adrDir = join(TEMP_ROOT, "active-3digit");

  beforeAll(() => {
    writeAdrFile(adrDir, "ADR-001.md", {
      title: "Three-digit canonical",
      status: "accepted",
      created: "2026-07-26",
    });
    writeAdrFile(adrDir, "ADR-005.md", {
      title: "Three-digit canonical high",
      status: "accepted",
      created: "2026-07-26",
    });
  });

  it("collectAdrFiles returns id ADR-001 (not ADR-0001) for ADR-001.md", () => {
    const infos = collectAdrFiles(adrDir);
    expect(infos.length).toBe(2);
    const first = infos[0];
    expect(first.id).toBe("ADR-001");
    expect(first.filename).toBe("ADR-001.md");
    expect(first.relPath).toBe("ADR-001.md");
    expect(first.num).toBe(1);
    expect(infos[1].id).toBe("ADR-005");
  });

  it("adr-baseline-table block references ADR-001 (no link, id preserved)", () => {
    const infos = collectAdrFiles(adrDir);
    const accepted = infos.filter((a) => a.status === "accepted");
    const lines = generateAdrBaselineTable(accepted);
    const joined = lines.join("\n");
    expect(joined).toContain("| ADR-001 |");
    expect(joined).toContain("| ADR-005 |");
    // Negative: padStart(4) regression would have produced ADR-0001 / ADR-0005
    expect(joined).not.toContain("ADR-0001");
    expect(joined).not.toContain("ADR-0005");
  });

  it("adr-status-accepted block links [ADR-001](ADR-001.md)", () => {
    const infos = collectAdrFiles(adrDir);
    const lines = generateAdrStatusList(infos, "accepted");
    expect(lines).toContain("- [ADR-001](ADR-001.md)（Three-digit canonical）");
    expect(lines).toContain("- [ADR-005](ADR-005.md)（Three-digit canonical high）");
    const joined = lines.join("\n");
    expect(joined).not.toContain("ADR-0001");
    expect(joined).not.toContain("ADR-0005");
  });
});

describe("ADR ID width: historical v2 four-digit filenames are not rewritten", () => {
  const retiredDir = join(TEMP_ROOT, "retired-4digit");

  beforeAll(() => {
    writeAdrFile(retiredDir, "ADR-0001.md", {
      title: "Historical v2 short",
      status: "retired",
      created: "2026-06-08",
    });
    writeAdrFile(retiredDir, "ADR-0101.md", {
      title: "Historical v2 mid",
      status: "retired",
      created: "2026-06-08",
    });
  });

  it("collectRetiredAdrFiles preserves ADR-0001 and ADR-0101 as ids", () => {
    const infos = collectRetiredAdrFiles(retiredDir);
    expect(infos.length).toBe(2);
    expect(infos[0].id).toBe("ADR-0001");
    expect(infos[0].filename).toBe("ADR-0001.md");
    expect(infos[0].relPath).toBe("retired/ADR-0001.md");
    expect(infos[0].num).toBe(1);
    expect(infos[1].id).toBe("ADR-0101");
    expect(infos[1].num).toBe(101);
  });

  it("adr-retired-table block links [ADR-0001](retired/ADR-0001.md) and [ADR-0101](retired/ADR-0101.md)", () => {
    const infos = collectRetiredAdrFiles(retiredDir);
    const lines = generateAdrRetiredTable(infos);
    const joined = lines.join("\n");
    expect(joined).toContain("[ADR-0001](retired/ADR-0001.md)");
    expect(joined).toContain("[ADR-0101](retired/ADR-0101.md)");
  });
});

describe("ADR ID width: 3-digit and 4-digit coexist without id collision", () => {
  // Same numeric value (1) but different filename widths must produce distinct ids.
  const activeDir = join(TEMP_ROOT, "coexist-active");
  const retiredDir = join(TEMP_ROOT, "coexist-retired");

  beforeAll(() => {
    writeAdrFile(activeDir, "ADR-001.md", {
      title: "Current canonical",
      status: "accepted",
      created: "2026-07-26",
    });
    writeAdrFile(retiredDir, "ADR-0001.md", {
      title: "Historical v2",
      status: "retired",
      created: "2026-06-08",
    });
  });

  it("active ADR-001 and retired ADR-0001 keep distinct ids despite equal num", () => {
    const active = collectAdrFiles(activeDir);
    const retired = collectRetiredAdrFiles(retiredDir);
    expect(active[0].id).toBe("ADR-001");
    expect(active[0].num).toBe(1);
    expect(retired[0].id).toBe("ADR-0001");
    expect(retired[0].num).toBe(1);
    expect(active[0].id).not.toBe(retired[0].id);
  });
});

describe("ADR baseline caption: version-neutral, no ADR-01XX", () => {
  // Current canonical accepted set mirrors docs/adr/README.md (ADR-001..ADR-005).
  const canonicalAccepted: AdrInfo[] = ["ADR-001", "ADR-002", "ADR-003", "ADR-004", "ADR-005"]
    .map(makeAcceptedAdr);

  it("caption contains no v2-era ADR-01XX token", () => {
    const lines = generateAdrBaselineCaption(canonicalAccepted);
    expect(lines.length).toBe(1);
    expect(lines[0]).not.toContain("ADR-01XX");
    expect(lines[0]).not.toContain("01XX");
  });

  it("caption reports 5件 for the current canonical accepted ADR count", () => {
    const lines = generateAdrBaselineCaption(canonicalAccepted);
    expect(lines[0]).toBe("現行の承認済み ADR は5件である。");
    expect(lines[0]).toContain("5件");
  });

  it("caption count tracks acceptedAdrs.length", () => {
    const one = generateAdrBaselineCaption(["ADR-001"].map(makeAcceptedAdr));
    expect(one[0]).toBe("現行の承認済み ADR は1件である。");
    const zero = generateAdrBaselineCaption([]);
    expect(zero[0]).toBe("現行の承認済み ADR は0件である。");
  });

  it("caption is version-neutral (no v2/v3 era markers)", () => {
    const line = generateAdrBaselineCaption(canonicalAccepted)[0];
    expect(line).not.toContain("v2");
    expect(line).not.toContain("v3");
    expect(line).not.toContain("ADR-01");
  });
});
