/**
 * Structural contract test for the distribution-boundary final gate routing.
 *
 * Asserts the per-PR final gate is wired identically into both case-close routes
 * by scanning the real workflow files and verifying structural routing tokens:
 *
 *   - single-Issue route: case-close STEP-3 Step 3-1
 *       (references/docs-and-spec-promotion.md)
 *   - Epic Wave route: case-close STEP-E4-0
 *       (references/epic-wave-close.md)
 *   - case-run post-implementation final gate: case-run Step 7-1
 *       (commands/agentdev/case-run.md)
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
const DOCS_AND_SPEC_PROMOTION = resolveWorkflowPath(
  "skills/agentdev-workflow-case-close/references/docs-and-spec-promotion.md",
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

function assertSectionExists(result: SectionExtractionResult, fileName: string): void {
  if (result.sectionId === null || result.section === "") {
    throw new TestFixtureError(`Section not found in ${fileName}`);
  }
}

describe("distribution-boundary final gate routing contract", () => {
  it("case-run command file is reachable from the test harness", () => {
    expect(fs.existsSync(CASE_RUN_COMMAND)).toBe(true);
  });

  it("case-close references are reachable from the test harness", () => {
    expect(fs.existsSync(DOCS_AND_SPEC_PROMOTION)).toBe(true);
    expect(fs.existsSync(EPIC_WAVE_CLOSE)).toBe(true);
    expect(fs.existsSync(CASE_CLOSE_SKILL)).toBe(true);
  });

  describe("single-Issue route (Step 3-1) references the detector with profile token", () => {
    const content = readFileIfExists(DOCS_AND_SPEC_PROMOTION) ?? "";
    const step31 = extractSection(content, "### Step 3-1:");

    it("Step 3-1 section exists", () => {
      assertSectionExists(step31, "docs-and-spec-promotion.md");
    });

    it(`section contains detector entry point: ${DETECTOR_ENTRYPOINT}`, () => {
      expect(step31.section).toContain(DETECTOR_ENTRYPOINT);
    });

    it(`section contains profile token: ${PROFILE_TOKEN}`, () => {
      expect(step31.section).toContain(PROFILE_TOKEN);
    });
  });

  describe("Epic Wave route (E4-0) references the same detector with profile token", () => {
    const content = readFileIfExists(EPIC_WAVE_CLOSE) ?? "";
    const e40 = extractSection(content, "#### E4-0:");

    it("E4-0 section exists", () => {
      assertSectionExists(e40, "epic-wave-close.md");
    });

    it(`section contains detector entry point: ${DETECTOR_ENTRYPOINT}`, () => {
      expect(e40.section).toContain(DETECTOR_ENTRYPOINT);
    });

    it(`section contains profile token: ${PROFILE_TOKEN}`, () => {
      expect(e40.section).toContain(PROFILE_TOKEN);
    });

    it("E4-0 occurs before E4-1 in Epic route", () => {
      const e40Index = content.indexOf("#### E4-0:");
      const e41Index = content.indexOf("#### E4-1:");
      expect(e40Index).toBeGreaterThanOrEqual(0);
      expect(e41Index).toBeGreaterThanOrEqual(0);
      expect(e40Index).toBeLessThan(e41Index);
    });

    it("E4-0 contains result-state token: blocked", () => {
      expect(e40.section).toContain("blocked");
    });

    it("E4-0 references exclusion from merge sequence", () => {
      expect(e40.section).toContain("E4-1");
    });
  });

  describe("case-close SKILL control plane table structure declares the gate in both routes", () => {
    const content = readFileIfExists(CASE_CLOSE_SKILL) ?? "";

    it("docs-and-spec-promotion row exists in control plane table", () => {
      const docsRow = content.match(/\|\s*STEP-[^\n]*docs-and-spec-promotion\.md[^\n]*\n/);
      expect(docsRow).not.toBeNull();
      if (docsRow !== null) {
        expect(docsRow[0]).toContain(
          "[references/docs-and-spec-promotion.md](references/docs-and-spec-promotion.md)",
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

  describe("case-run Step 7-1 preserves adapter result protocol", () => {
    const content = readFileIfExists(CASE_RUN_COMMAND) ?? "";
    const step71 = extractSection(content, "### Step 7-1:");

    it("Step 7-1 section exists", () => {
      assertSectionExists(step71, "case-run.md");
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
});
