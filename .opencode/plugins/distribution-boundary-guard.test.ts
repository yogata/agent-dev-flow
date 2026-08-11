/**
 * Tests for distribution-boundary-guard plugin helpers (TS-005).
 *
 * Validates fail-fast behavior: write/edit/apply_patch operations that would
 * introduce producer-internal references into distributed text artifacts are
 * blocked. The helpers are pure functions; the plugin shell wires them into
 * OpenCode's tool.execute.before hook.
 */

import { expect, test, describe } from "bun:test";
import {
  evaluateWriteContent,
  evaluateEdit,
  evaluateApplyPatch,
  shouldInspectTool,
  formatBlockMessage,
  type GuardDetectionsResult,
} from "./distribution-boundary-guard.ts";

describe("shouldInspectTool - tool allowlist", () => {
  test("inspects write, edit, apply_patch", () => {
    expect(shouldInspectTool("write")).toBe(true);
    expect(shouldInspectTool("edit")).toBe(true);
    expect(shouldInspectTool("apply_patch")).toBe(true);
  });
  test("passes through other tools (read, bash, grep, etc.)", () => {
    expect(shouldInspectTool("read")).toBe(false);
    expect(shouldInspectTool("bash")).toBe(false);
    expect(shouldInspectTool("grep")).toBe(false);
    expect(shouldInspectTool("glob")).toBe(false);
    expect(shouldInspectTool("")).toBe(false);
  });
});

describe("evaluateWriteContent - write tool gate", () => {
  test("blocks write introducing concrete ID", () => {
    const r = evaluateWriteContent(
      "src/opencode/commands/agentdev/sample.md",
      "# title\nSee ADR-0135 for context.\n",
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.length).toBe(1);
      expect(r.detections[0]!.matched).toBe("ADR-0135");
    }
  });
  test("blocks write introducing concrete docs path", () => {
    const r = evaluateWriteContent(
      "src/opencode/skills/agentdev-foo/SKILL.md",
      "ref docs/requirements/REQ-0149.md",
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const pathHit = r.detections.find((d) => d.category === "concrete-path");
      expect(pathHit).toBeDefined();
      expect(pathHit!.matched).toBe("docs/requirements/REQ-0149.md");
    }
  });
  test("blocks write introducing producer-internal docs URL", () => {
    const r = evaluateWriteContent(
      "src/opencode/commands/agentdev/sample.md",
      "see https://github.com/yogata/agent-dev-flow/blob/main/docs/specs/foo.md",
    );
    expect(r.ok).toBe(false);
  });
  test("allows write with template placeholders only", () => {
    const r = evaluateWriteContent(
      "src/opencode/commands/agentdev/sample.md",
      "template: docs/specs/<domain>/<spec>.md is fine. ADR-{NNNN} also fine.",
    );
    expect(r.ok).toBe(true);
  });
  test("allows write with no references", () => {
    const r = evaluateWriteContent(
      "src/opencode/commands/agentdev/sample.md",
      "# plain command\nbody\n",
    );
    expect(r.ok).toBe(true);
  });
  test("skips non-distributed paths (docs/, scripts/)", () => {
    const r = evaluateWriteContent(
      "docs/specs/integrity/distribution-boundary.md",
      "ref ADR-0135",
    );
    expect(r.ok).toBe(true);
    if (!r.ok) {
      // sanity: should not reach here
      expect(r.detections.length).toBe(0);
    }
  });
});

describe("evaluateEdit - edit tool gate", () => {
  test("blocks edit whose newString introduces a concrete ID", () => {
    const r = evaluateEdit({
      filePath: "src/opencode/commands/agentdev/sample.md",
      currentContent: "# title\nbody\n",
      oldString: "body",
      newString: "ref ADR-0135 here",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections[0]!.matched).toBe("ADR-0135");
    }
  });
  test("allows edit whose newString is clean", () => {
    const r = evaluateEdit({
      filePath: "src/opencode/commands/agentdev/sample.md",
      currentContent: "ref ADR-0135 here",
      oldString: "ADR-0135",
      newString: "REQ-{NNNN}",
    });
    // The newString itself is clean (template). The current content has ADR-0135
    // but that is pre-existing; the gate inspects what the edit introduces, not
    // the full file after edit (full-file inspection is the final gate's job).
    expect(r.ok).toBe(true);
  });
  test("passes through edit on non-distributed path", () => {
    const r = evaluateEdit({
      filePath: "README.md",
      currentContent: "x",
      oldString: "x",
      newString: "ref ADR-0135",
    });
    expect(r.ok).toBe(true);
  });
  test("replaceAll flag does not change classification of newString", () => {
    const r = evaluateEdit({
      filePath: "src/opencode/commands/agentdev/sample.md",
      currentContent: "a\na\n",
      oldString: "a",
      newString: "ADR-0001",
      replaceAll: true,
    });
    expect(r.ok).toBe(false);
  });
});

describe("evaluateApplyPatch - apply_patch tool gate", () => {
  test("blocks Add File introducing a concrete ID", () => {
    const patchText = [
      "*** Begin Patch",
      "*** Add File: src/opencode/commands/agentdev/new.md",
      "+# new",
      "+ref ADR-0135",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatch(patchText);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.length).toBe(1);
      expect(r.detections[0]!.matched).toBe("ADR-0135");
    }
  });
  test("blocks Update File whose additions introduce a concrete path", () => {
    const patchText = [
      "*** Begin Patch",
      "*** Update File: src/opencode/commands/agentdev/sample.md",
      "@@ ...",
      "+ref docs/requirements/REQ-0149.md",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatch(patchText);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const pathHit = r.detections.find((d) => d.category === "concrete-path");
      expect(pathHit).toBeDefined();
      expect(pathHit!.matched).toBe("docs/requirements/REQ-0149.md");
    }
  });
  test("allows Add File with clean content", () => {
    const patchText = [
      "*** Begin Patch",
      "*** Add File: src/opencode/commands/agentdev/new.md",
      "+# clean",
      "+template docs/specs/<x>.md allowed",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatch(patchText);
    expect(r.ok).toBe(true);
  });
  test("allows Update File whose additions are clean (only - lines have refs)", () => {
    const patchText = [
      "*** Begin Patch",
      "*** Update File: src/opencode/commands/agentdev/sample.md",
      "@@ ...",
      "-ref ADR-0135",
      "+clean line",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatch(patchText);
    expect(r.ok).toBe(true);
  });
  test("skips non-distributed file paths in patch", () => {
    const patchText = [
      "*** Begin Patch",
      "*** Add File: docs/foo.md",
      "+ref ADR-0135",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatch(patchText);
    expect(r.ok).toBe(true);
  });
  test("malformed patch returns adapter-failure (gate-not-passed, not clean)", () => {
    const r = evaluateApplyPatch("not a real patch at all");
    // Per SPEC: inspection errors are gate-not-passed. Malformed patch input
    // should NOT silently pass.
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // Either detections (if we managed to find a violation) or an error flag.
      expect(r.detections.length).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("formatBlockMessage - error message", () => {
  test("includes rule id and violation count", () => {
    const fake: GuardDetectionsResult = {
      ok: false,
      detections: [
        {
          text: "x",
          line: 1,
          file: "src/opencode/commands/agentdev/sample.md",
          projection: "source",
          classification: "producer-internal",
          matched: "ADR-0135",
          snippet: "x",
          category: "concrete-id",
        },
      ],
    };
    const msg = formatBlockMessage("write", fake);
    expect(msg).toContain("distribution-boundary-guard");
    expect(msg).toContain("ADR-0135");
    expect(msg).toContain("producer-internal");
  });
});
