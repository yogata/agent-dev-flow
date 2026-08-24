// ADF-COVERS(verification): REQ-029-008
/**
 * Structural contract test for the distribution-boundary final gate routing.
 *
 * Asserts the per-PR final gate is wired identically into both case-close routes
 * by scanning the real workflow files and verifying structural routing tokens:
 *
 *   - single-Issue route: case-close STEP-3 Step 3-1
 *       (references/docs-and-design-promotion.md)
 *   - Epic Wave route: case-close STEP-E4-1
 *       (references/epic-wave-close.md)
 *   - case-run post-implementation final gate: workflow-case-run STEP-S5-1
 *       (skills/agentdev-workflow-case-run/references/delegation-and-result.md).
 *       The former command-side gate paragraph was removed with the thin
 *       Command model (DEC-022, Issue #2428): the command keeps only a
 *       name-level delegation and the routing tokens live in the Workflow
 *       Skill reference.
 *
 * All three must reference the same detector entry point and profile token.
 * Assertions verify only routing-bearing machine/LLM-dispatch tokens:
 * section IDs, detector entrypoint, profile token, result-state tokens,
 * and ordering/exclusion structure. No natural language prose assertions.
 */
import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);

function resolveWorkflowPath(relAfterOpencode: string): string {
  const projection = path.join(REPO_ROOT, ".opencode", relAfterOpencode);
  if (fs.existsSync(projection)) return projection;
  const source = path.join(REPO_ROOT, "src", "opencode", relAfterOpencode);
  return source;
}

function readFileIfExists(p: string): string | null {
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf-8");
}

const CASE_RUN_COMMAND = resolveWorkflowPath("commands/agentdev/case-run.md");
const CASE_RUN_DELEGATION_AND_RESULT = resolveWorkflowPath(
  "skills/agentdev-workflow-case-run/references/delegation-and-result.md",
);
const DOCS_AND_SPEC_PROMOTION = resolveWorkflowPath(
  "skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md",
);
const EPIC_WAVE_CLOSE = resolveWorkflowPath(
  "skills/agentdev-workflow-case-close/references/epic-wave-close.md",
);
const CASE_CLOSE_SKILL = resolveWorkflowPath(
  "skills/agentdev-workflow-case-close/SKILL.md",
);

const DETECTOR_ENTRYPOINT = "check_distribution_boundary.ts";
const PROFILE_TOKEN = "--profile source";

interface SectionExtractionResult {
  section: string;
  sectionId: string | null;
}

class TestFixtureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestFixtureError";
  }
}

function extractSection(
  content: string,
  sectionHeading: string
): SectionExtractionResult {
  const startIdx = content.indexOf(sectionHeading);
  if (startIdx === -1) {
    return { section: "", sectionId: null };
  }

  const afterStart = content.slice(startIdx);
  const nextHeading = afterStart.search(/\n#{1,3} /);
  if (nextHeading === -1) {
    return { section: afterStart, sectionId: sectionHeading };
  }
  return {
    section: afterStart.slice(0, nextHeading),
    sectionId: sectionHeading
  };
}
// case-run 最終 gate の routing トークンは thin Command モデル移行後、
// Workflow Skill 側 reference（delegation-and-result.md STEP-S5-1）が所有する。
// 段落の終端は次の見出しまたは次のリスト項目。
function extractCaseRunGateParagraph(content: string): SectionExtractionResult {
  const marker = "STEP-S5-1:";
  const startIdx = content.indexOf(marker);
  if (startIdx === -1) {
    return { section: "", sectionId: null };
  }

  const afterStart = content.slice(startIdx);
  const nextHeadingIdx = afterStart.search(/\n#{1,4} /);
  const nextListItemIdx = afterStart.indexOf("\n- **");
  const candidates = [nextHeadingIdx, nextListItemIdx].filter((i) => i > 0);
  const end = candidates.length > 0 ? Math.min(...candidates) : afterStart.length;
  return { section: afterStart.slice(0, end), sectionId: marker };
}

function assertSectionExists(result: SectionExtractionResult, fileName: string): void {
  if (result.sectionId === null || result.section === "") {
    throw new TestFixtureError(`Section not found in ${fileName}`);
  }
}

describe("distribution-boundary final gate routing contract", () => {
  it("case-run command and workflow gate reference are reachable from the test harness", () => {
    expect(fs.existsSync(CASE_RUN_COMMAND)).toBe(true);
    expect(fs.existsSync(CASE_RUN_DELEGATION_AND_RESULT)).toBe(true);
  });

  it("case-close references are reachable from the test harness", () => {
    expect(fs.existsSync(DOCS_AND_SPEC_PROMOTION)).toBe(true);
    expect(fs.existsSync(EPIC_WAVE_CLOSE)).toBe(true);
    expect(fs.existsSync(CASE_CLOSE_SKILL)).toBe(true);
  });

  describe("single-Issue route (Step 3-1) references the detector with profile token", () => {
    const content = readFileIfExists(DOCS_AND_SPEC_PROMOTION) ?? "";
    const step31 = extractSection(content, "### STEP-3-1:");

    it("Step 3-1 section exists", () => {
      assertSectionExists(step31, "docs-and-design-promotion.md");
    });

    it(`section contains detector entry point: ${DETECTOR_ENTRYPOINT}`, () => {
      expect(step31.section).toContain(DETECTOR_ENTRYPOINT);
    });

    it(`section contains profile token: ${PROFILE_TOKEN}`, () => {
      expect(step31.section).toContain(PROFILE_TOKEN);
    });
  });

  describe("Epic Wave route (E4-1) references the same detector with profile token", () => {
    const content = readFileIfExists(EPIC_WAVE_CLOSE) ?? "";
    const e41 = extractSection(content, "#### E4-1:");

    it("E4-1 section exists", () => {
      assertSectionExists(e41, "epic-wave-close.md");
    });

    it(`section contains detector entry point: ${DETECTOR_ENTRYPOINT}`, () => {
      expect(e41.section).toContain(DETECTOR_ENTRYPOINT);
    });

    it(`section contains profile token: ${PROFILE_TOKEN}`, () => {
      expect(e41.section).toContain(PROFILE_TOKEN);
    });

    it("E4-1 occurs before E4-2 in Epic route", () => {
      const e41Index = content.indexOf("#### E4-1:");
      const e42Index = content.indexOf("#### E4-2:");
      expect(e41Index).toBeGreaterThanOrEqual(0);
      expect(e42Index).toBeGreaterThanOrEqual(0);
      expect(e41Index).toBeLessThan(e42Index);
    });

    it("E4-1 contains result-state token: blocked", () => {
      expect(e41.section).toContain("blocked");
    });

    it("E4-1 references exclusion from merge sequence", () => {
      expect(e41.section).toContain("E4-2");
    });
  });

  describe("case-close SKILL control plane table structure declares the gate in both routes", () => {
    const content = readFileIfExists(CASE_CLOSE_SKILL) ?? "";

    it("docs-and-design-promotion row exists in control plane table", () => {
      const docsRow = content.match(/\|\s*STEP-[^\n]*docs-and-design-promotion\.md[^\n]*\n/);
      expect(docsRow).not.toBeNull();
      if (docsRow !== null) {
        expect(docsRow[0]).toContain(
          "[references/docs-and-design-promotion.md](references/docs-and-design-promotion.md)",
        );
      }
    });

    it("STEP-E1〜E6 table row exists and references distribution-boundary gate", () => {
      const epicRow = content.match(/\|\s*STEP-E1[〜~]E6\s*\|[^\n]*\n/);
      expect(epicRow).not.toBeNull();
      if (epicRow !== null) {
        expect(epicRow[0]).toContain(
          "[references/epic-wave-close.md](references/epic-wave-close.md)",
        );
      }
    });
  });

  describe("case-run 配布依存境界の最終変更経路 gate preserves adapter result protocol", () => {
    const content = readFileIfExists(CASE_RUN_DELEGATION_AND_RESULT) ?? "";
    const step71 = extractCaseRunGateParagraph(content);

    it("gate section exists", () => {
      assertSectionExists(step71, "delegation-and-result.md");
    });

    it(`section contains detector entry point: ${DETECTOR_ENTRYPOINT}`, () => {
      expect(step71.section).toContain(DETECTOR_ENTRYPOINT);
    });

    it(`section contains profile token: ${PROFILE_TOKEN}`, () => {
      expect(step71.section).toContain(PROFILE_TOKEN);
    });

    it("section contains result-state token: completed-pr", () => {
      expect(step71.section).toContain("completed-pr");
    });

    it("section maintains completed-pr state without blocking transition for gate failure", () => {
      expect(step71.section).toContain("completed-pr");
      expect(step71.section).toContain("blocked");
      expect(step71.section).not.toMatch(
        /completed-pr[^\n]*(?:->|→|=|:)[^\n]*blocked/,
      );
    });
  });

  describe("both case-close trigger paths route through the same detector", () => {
    const docsContent = readFileIfExists(DOCS_AND_SPEC_PROMOTION) ?? "";
    const epicContent = readFileIfExists(EPIC_WAVE_CLOSE) ?? "";
    const caseRunContent = readFileIfExists(CASE_RUN_DELEGATION_AND_RESULT) ?? "";

    const step31 = extractSection(docsContent, "### STEP-3-1:");
    const e41 = extractSection(epicContent, "#### E4-1:");
    const step71 = extractCaseRunGateParagraph(caseRunContent);

    it("all three gate sections reference the identical detector entrypoint", () => {
    expect(step31.section).toContain(DETECTOR_ENTRYPOINT);
      expect(e41.section).toContain(DETECTOR_ENTRYPOINT);
      expect(step71.section).toContain(DETECTOR_ENTRYPOINT);
    });

    it("all three gate sections use the identical --profile source token", () => {
      expect(step31.section).toContain(PROFILE_TOKEN);
      expect(e41.section).toContain(PROFILE_TOKEN);
      expect(step71.section).toContain(PROFILE_TOKEN);
    });

    it("neither case-close route embeds a producer physical path literal", () => {
      expect(step31.section).not.toContain("src/opencode/");
      expect(e41.section).not.toContain("src/opencode/");
    });

    it("both case-close routes describe the trigger via source-profile vocabulary", () => {
      expect(step31.section).toMatch(/配布.*ソース面|source.*profile/i);
      expect(e41.section).toMatch(/配布.*ソース面|source.*profile/i);
    });

    it("single-Issue and Epic Wave routes both stop merge on gate violation", () => {
      // E4-1 uses "blocked" state; Step 3-1 uses "gate-not-passed" classification.
      expect(step31.section).toMatch(/gate/i);
      expect(e41.section).toContain("blocked");
    });

    it("SKILL.md control plane declares the final gate in both route rows", () => {
      const skillContent = readFileIfExists(CASE_CLOSE_SKILL) ?? "";
      const singleRow = skillContent.match(/\|\s*STEP-3\s*\|[^\n]*docs-and-design-promotion[^\n]*\n/);
      const epicRow = skillContent.match(/\|\s*STEP-E1[〜~]E6\s*\|[^\n]*\n/);
      expect(singleRow).not.toBeNull();
      expect(epicRow).not.toBeNull();
      if (singleRow !== null) {
        expect(singleRow[0]).toContain("docs-and-design-promotion.md");
      }
      if (epicRow !== null) {
        expect(epicRow[0]).toContain("epic-wave-close.md");
      }
    });
  });
});
