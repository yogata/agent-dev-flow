import { describe, it, expect } from "bun:test";
import {
  parseReqImpactMap,
  lookupImpactMatrix,
  lookupDeltaGuard,
  ReqImpactMapParseError,
} from "./req_impact_map_parser.ts";

const MINIMAL_MAP = `# REQ Impact Map

Intro text.

## Impact Matrix

| REQ | タイトル | 影響する Rule IDs | 影響する Artifact |
|-----|---------|------------------|------------------|
| REQ-0101 | 文書・REQ管理基準 | IR-001, IR-002, IR-017 | REQ, DOC-MAP |
| REQ-0108 | Integrity/Validation/Tests | IR-001~IR-003 (全件) | 全 artifact |
| REQ-0110 | Git worktree cleanup | — (infrastructure) | — |

## Requirement-Line Impact

Some content here.

### Delta Guard Rule Selection

| 変更種別 | 実行 Rules |
|---------|-----------|
| Command 追加/変更 | IR-006, IR-007, IR-013, IR-024 |
| Skill 追加/変更 | IR-007, IR-008, IR-014 |
| REQ 追加/変更 | IR-001, IR-002, IR-004, IR-022 |

### Recurrence Triage

More content.
`;

describe("parseReqImpactMap - minimal fixture", () => {
  const map = parseReqImpactMap(MINIMAL_MAP);

  it("parses Impact Matrix entries", () => {
    expect(map.impactMatrix).toHaveLength(3);
    expect(map.impactMatrix[0].reqId).toBe("REQ-0101");
  });

  it("parses csv rule IDs", () => {
    expect(map.impactMatrix[0].ruleIds).toEqual([
      "IR-001",
      "IR-002",
      "IR-017",
    ]);
  });

  it("parses artifacts as list", () => {
    expect(map.impactMatrix[0].artifacts).toEqual(["REQ", "DOC-MAP"]);
  });

  it("expands range IR-001~IR-003 to 3 IDs", () => {
    expect(map.impactMatrix[1].ruleIds).toEqual(["IR-001", "IR-002", "IR-003"]);
  });

  it("preserves raw cell for range entry", () => {
    expect(map.impactMatrix[1].raw).toContain("IR-001~IR-003");
    expect(map.impactMatrix[1].raw).toContain("(全件)");
  });

  it("returns empty ruleIds for em-dash placeholder", () => {
    expect(map.impactMatrix[2].ruleIds).toEqual([]);
    expect(map.impactMatrix[2].artifacts).toEqual([]);
  });

  it("parses Delta Guard table entries", () => {
    expect(map.deltaGuardTable).toHaveLength(3);
    expect(map.deltaGuardTable[0].changeType).toBe("Command 追加/変更");
    expect(map.deltaGuardTable[0].ruleIds).toEqual([
      "IR-006",
      "IR-007",
      "IR-013",
      "IR-024",
    ]);
  });
});

describe("parseReqImpactMap - error cases", () => {
  it("throws on empty content", () => {
    expect(() => parseReqImpactMap("")).toThrow(/empty/);
  });

  it("throws on missing top-level header", () => {
    expect(() => parseReqImpactMap("# Wrong Title\n")).toThrow(/REQ Impact Map/);
  });

  it("throws on missing Impact Matrix section", () => {
    const noMatrix = `# REQ Impact Map\n\n### Delta Guard Rule Selection\n\n| 変更種別 | 実行 Rules |\n|---------|-----------|\n| Command | IR-006 |\n`;
    expect(() => parseReqImpactMap(noMatrix)).toThrow(/Impact Matrix/);
  });

  it("throws on missing Delta Guard section", () => {
    const noDelta = `# REQ Impact Map\n\n## Impact Matrix\n\n| REQ | t | r | a |\n|---|---|---|---|\n| REQ-0101 | t | IR-001 | a |\n`;
    expect(() => parseReqImpactMap(noDelta)).toThrow(/Delta Guard/);
  });
});

describe("lookupImpactMatrix / lookupDeltaGuard", () => {
  const map = parseReqImpactMap(MINIMAL_MAP);

  it("lookupImpactMatrix finds by REQ id", () => {
    expect(lookupImpactMatrix(map, "REQ-0101")?.ruleIds).toContain("IR-001");
  });

  it("lookupImpactMatrix returns undefined for unknown", () => {
    expect(lookupImpactMatrix(map, "REQ-9999")).toBeUndefined();
  });

  it("lookupDeltaGuard finds by change type", () => {
    expect(lookupDeltaGuard(map, "Skill 追加/変更")?.ruleIds).toEqual([
      "IR-007",
      "IR-008",
      "IR-014",
    ]);
  });

  it("lookupDeltaGuard returns undefined for unknown", () => {
    expect(lookupDeltaGuard(map, "Bogus 変更")).toBeUndefined();
  });
});

describe("parseReqImpactMap - real impact-map (QA Scenarios 2 & 3)", () => {
  function readReal(): string {
    const fs = require("fs");
    const path = require("path");
    let dir = path.resolve(__dirname);
    for (let i = 0; i < 10; i++) {
      const candidate = path.join(dir, "docs", "specs", "req-impact-map.md");
      if (fs.existsSync(candidate)) return fs.readFileSync(candidate, "utf-8");
      dir = path.dirname(dir);
    }
    throw new Error("req-impact-map.md fixture not found");
  }

  const map = parseReqImpactMap(readReal());

  it("QA Scenario 2: REQ-0101 maps to IR-001,002,003,004,017,018,022", () => {
    const entry = lookupImpactMatrix(map, "REQ-0101");
    expect(entry).toBeDefined();
    expect(entry!.ruleIds).toEqual([
      "IR-001",
      "IR-002",
      "IR-003",
      "IR-004",
      "IR-017",
      "IR-018",
      "IR-022",
    ]);
  });

  it("QA Scenario 3: Command 追加/変更 maps to IR-006,007,013,024", () => {
    const entry = lookupDeltaGuard(map, "Command 追加/変更");
    expect(entry).toBeDefined();
    expect(entry!.ruleIds).toEqual(["IR-006", "IR-007", "IR-013", "IR-024"]);
  });

  it("REQ-0108 range expands to 24 rule IDs", () => {
    const entry = lookupImpactMatrix(map, "REQ-0108");
    expect(entry).toBeDefined();
    expect(entry!.ruleIds).toHaveLength(24);
    expect(entry!.ruleIds[0]).toBe("IR-001");
    expect(entry!.ruleIds[23]).toBe("IR-024");
  });

  it("impact matrix covers 10+ active REQs", () => {
    expect(map.impactMatrix.length).toBeGreaterThanOrEqual(10);
  });

  it("delta guard table has 7 change types", () => {
    expect(map.deltaGuardTable).toHaveLength(7);
  });
});
