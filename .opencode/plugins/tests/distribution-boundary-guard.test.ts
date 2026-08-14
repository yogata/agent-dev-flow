/**
 * Tests for distribution-boundary-guard plugin helpers (TS-005).
 *
 * Validates fail-fast behavior: write/edit/apply_patch operations that would
 * introduce producer-internal references into distributed text artifacts are
 * blocked. The helpers are pure functions; the plugin shell wires them into
 * OpenCode's tool.execute.before hook.
 *
 * Stage B regression (PR #2092): the plugin now reads current file content
 * for edit and apply_patch Update, reconstructs prospective full-file content,
 * parses external args into typed values (no `as string`, no broad catch),
 * classifies URLs by explicit repository identity, treats unknown bytes as
 * fail-closed, matches distributed paths case-insensitively on Windows, and
 * covers all distributed source paths including japanese-tech-writing. The
 * parser and reconstruction are split into focused modules so the plugin
 * orchestrator stays under the 250 pure-LOC ceiling.
 */

import { expect, test, describe } from "bun:test";
import {
  evaluateWriteContent,
  evaluateEdit,
  evaluateApplyPatch,
  shouldInspectTool,
  formatBlockMessage,
  parseWriteArgs,
  parseEditArgs,
  parseApplyPatchArgs,
  makeGuardEnv,
  isDistributedPath,
  evaluateWriteContentEnv,
  evaluateEditEnv,
  evaluateApplyPatchEnv,
  DEFAULT_PLUGIN_REPOSITORY_IDENTITY,
  type GuardDetectionsResult,
  type GuardEnv,
  classifyPath,
  classifyPathNoRoot,
  default as pluginDefault,
} from "../distribution-boundary-guard.ts";

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
      if (pathHit) {
        expect(pathHit.matched).toBe("docs/requirements/REQ-0149.md");
      }
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

  test("reconstructs full post-edit content (Oracle finding 4)", () => {
    // Edit that splits a reference across old and new content:
    // currentContent has "docs/adr/" and edit adds "DEC-014.md"
    const r = evaluateEdit({
      filePath: "src/opencode/commands/agentdev/sample.md",
      currentContent: "see docs/adr/",
      oldString: "docs/adr/",
      newString: "docs/adr/DEC-014.md",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const pathHit = r.detections.find((d) => d.category === "concrete-path");
      expect(pathHit).toBeDefined();
    }
  });

  test("fails closed when oldString not found (Oracle finding 4)", () => {
    const r = evaluateEdit({
      filePath: "src/opencode/commands/agentdev/sample.md",
      currentContent: "existing content",
      oldString: "not present",
      newString: "clean content",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });

  test("normalizes Windows backslash paths (Oracle finding 4)", () => {
    const r = evaluateEdit({
      filePath: "src\\opencode\\commands\\agentdev\\sample.md",
      currentContent: "body",
      oldString: "body",
      newString: "ref ADR-0001",
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
    // Stage B regression: Update now reconstructs against current file
    // content. Use evaluateApplyPatchEnv with a readFile that returns content
    // matching the patch context so reconstruction succeeds and the added
    // concrete path is detected.
    const currentContent = "title\n";
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/commands/agentdev/sample.md" ? currentContent : null,
    });
    const patchText = [
      "*** Begin Patch",
      "*** Update File: src/opencode/commands/agentdev/sample.md",
      "@@ ctx",
      " title",
      "+ref docs/requirements/REQ-0149.md",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patchText })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const pathHit = r.detections.find((d) => d.category === "concrete-path");
      expect(pathHit).toBeDefined();
      if (pathHit) {
        expect(pathHit.matched).toBe("docs/requirements/REQ-0149.md");
      }
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
  test("allows Update File that removes a ref and adds a clean line", () => {
    // Stage B regression: reconstruction reads current content. The patch
    // removes the offending line and adds a clean one. After reconstruction
    // the resulting content has no violations.
    const currentContent = "ref ADR-0135\n";
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/commands/agentdev/sample.md" ? currentContent : null,
    });
    const patchText = [
      "*** Begin Patch",
      "*** Update File: src/opencode/commands/agentdev/sample.md",
      "@@ ctx",
      "-ref ADR-0135",
      "+clean line",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patchText })!, env);
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
      errorKind: "violation",
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

// =============================================================================
// Stage B regression (PR #2092).
// =============================================================================

describe("Stage B regression: distributed path coverage", () => {
  test("src/opencode/commands/agentdev/ is distributed", () => {
    expect(isDistributedPath("src/opencode/commands/agentdev/foo.md")).toBe(true);
  });
  test("src/opencode/skills/agentdev-* is distributed", () => {
    expect(isDistributedPath("src/opencode/skills/agentdev-foo/SKILL.md")).toBe(true);
  });
  test("src/opencode/skills/japanese-tech-writing/ is distributed", () => {
    expect(
      isDistributedPath("src/opencode/skills/japanese-tech-writing/SKILL.md"),
    ).toBe(true);
  });
  test("non-distributed paths are skipped", () => {
    expect(isDistributedPath("docs/specs/foo.md")).toBe(false);
    expect(isDistributedPath("scripts/install.ps1")).toBe(false);
    expect(isDistributedPath("README.md")).toBe(false);
  });
  test("Windows backslash distributed path matches case-insensitively", () => {
    expect(
      isDistributedPath("SRC\\OpenCode\\Commands\\AgentDev\\sample.md"),
    ).toBe(true);
    expect(
      isDistributedPath("src\\opencode\\skills\\Japanese-Tech-Writing\\SKILL.md"),
    ).toBe(true);
  });
});

describe("Stage B regression: typed argument parsing", () => {
  test("parseWriteArgs extracts filePath and content as strings", () => {
    const r = parseWriteArgs({
      filePath: "src/opencode/commands/agentdev/x.md",
      content: "ADR-0001",
    });
    expect(r).not.toBeNull();
    if (r) {
      expect(r.filePath).toBe("src/opencode/commands/agentdev/x.md");
      expect(r.content).toBe("ADR-0001");
    }
  });
  test("parseWriteArgs returns null when filePath missing or non-string", () => {
    expect(parseWriteArgs({})).toBeNull();
    expect(parseWriteArgs({ filePath: 42, content: "x" })).toBeNull();
    expect(parseWriteArgs({ filePath: "x", content: 42 })).toBeNull();
  });
  test("parseEditArgs extracts filePath/oldString/newString/replaceAll", () => {
    const r = parseEditArgs({
      filePath: "x.md",
      oldString: "a",
      newString: "b",
      replaceAll: true,
    });
    expect(r).not.toBeNull();
    if (r) {
      expect(r.filePath).toBe("x.md");
      expect(r.oldString).toBe("a");
      expect(r.newString).toBe("b");
      expect(r.replaceAll).toBe(true);
    }
  });
  test("parseEditArgs treats missing oldString/newString as empty string (edit tool contract)", () => {
    const r = parseEditArgs({ filePath: "x.md" });
    expect(r).not.toBeNull();
    if (r) {
      expect(r.oldString).toBe("");
      expect(r.newString).toBe("");
      expect(r.replaceAll).toBe(false);
    }
  });
  test("parseEditArgs returns null when filePath is not a string", () => {
    expect(parseEditArgs({ filePath: 1 })).toBeNull();
  });
  test("parseApplyPatchArgs extracts patchText", () => {
    const r = parseApplyPatchArgs({ patchText: "*** Begin Patch\n*** End Patch" });
    expect(r).not.toBeNull();
    if (r) expect(r.patchText).toBe("*** Begin Patch\n*** End Patch");
  });
  test("parseApplyPatchArgs returns null when patchText missing or non-string", () => {
    expect(parseApplyPatchArgs({})).toBeNull();
    expect(parseApplyPatchArgs({ patchText: 1 })).toBeNull();
  });
});

describe("Stage B regression: edit read failure must fail closed", () => {
  test("edit tool fails closed when current file cannot be read", () => {
    const env: GuardEnv = makeGuardEnv({
      readFile: () => null,
    });
    const r = evaluateEditEnv(
      {
        filePath: "src/opencode/commands/agentdev/sample.md",
        oldString: "x",
        newString: "ADR-0001",
        replaceAll: false,
      },
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
  test("edit tool fails closed when read throws (no swallow to clean)", () => {
    const env: GuardEnv = makeGuardEnv({
      readFile: () => {
        throw new Error("permission denied");
      },
    });
    const r = evaluateEditEnv(
      {
        filePath: "src/opencode/commands/agentdev/sample.md",
        oldString: "x",
        newString: "ADR-0001",
        replaceAll: false,
      },
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
});

describe("Stage B regression: apply_patch Add/Update/Move full-file reconstruction", () => {
  test("Add File: classify new content at destination path", () => {
    const env = makeGuardEnv();
    const patch = [
      "*** Begin Patch",
      "*** Add File: src/opencode/commands/agentdev/new.md",
      "+ref ADR-0001",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.some((d) => d.matched === "ADR-0001")).toBe(true);
    }
  });

  test("Update File: classify reconstructed full content (current + additions)", () => {
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/commands/agentdev/sample.md" ? "title\nbody\n" : null,
    });
    // OpenCode apply_patch Update format: space prefix = context, `-` = remove, `+` = add.
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/commands/agentdev/sample.md",
      "@@ ctx",
      " title",
      "+ref ADR-0001",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.some((d) => d.matched === "ADR-0001")).toBe(true);
    }
  });

  test("Update File: existing content + addition combines to form a violation", () => {
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/commands/agentdev/sample.md" ? "see docs/adr/\n" : null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/commands/agentdev/sample.md",
      "@@ ctx",
      " see docs/adr/",
      "-",
      "+DEC-014.md",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
  });

  test("Move File: source content is inspected at the destination distributed path", () => {
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/skills/agentdev-old/SKILL.md"
          ? "# old skill\nref ADR-9999 here\n"
          : null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/skills/agentdev-old/SKILL.md",
      "*** Move to: src/opencode/skills/agentdev-new/SKILL.md",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.some((d) => d.matched === "ADR-9999")).toBe(true);
    }
  });

  test("Move File: fail closed when source cannot be read", () => {
    const env = makeGuardEnv({
      readFile: () => null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/skills/agentdev-old/SKILL.md",
      "*** Move to: src/opencode/skills/agentdev-new/SKILL.md",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });

  test("Update File: fail closed when current file cannot be read", () => {
    const env = makeGuardEnv({
      readFile: () => null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/commands/agentdev/sample.md",
      "@@ ctx",
      "+ref ADR-0001",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
});

describe("Stage B regression: malformed / incomplete patches fail closed", () => {
  test("patch missing Begin Patch marker fails closed", () => {
    const env = makeGuardEnv();
    const r = evaluateApplyPatchEnv(
      parseApplyPatchArgs({ patchText: "*** Add File: x\n+ref ADR-0001" })!,
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
  test("patch missing End Patch marker fails closed", () => {
    const env = makeGuardEnv();
    const r = evaluateApplyPatchEnv(
      parseApplyPatchArgs({
        patchText: "*** Begin Patch\n*** Add File: x\n+ref ADR-0001",
      })!,
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
  test("patch with no recognized operation marker fails closed", () => {
    const env = makeGuardEnv();
    const r = evaluateApplyPatchEnv(
      parseApplyPatchArgs({
        patchText: "*** Begin Patch\ngarbage\n*** End Patch",
      })!,
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
  test("empty patch text fails closed (not silently clean)", () => {
    const env = makeGuardEnv();
    const r = evaluateApplyPatchEnv(
      parseApplyPatchArgs({ patchText: "" })!,
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
  test("patch with Add File missing file path fails closed", () => {
    const env = makeGuardEnv();
    const r = evaluateApplyPatchEnv(
      parseApplyPatchArgs({
        patchText: "*** Begin Patch\n*** Add File:\n+ref ADR-0001\n*** End Patch",
      })!,
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
});

describe("Stage B regression: repository identity at boundary", () => {
  test("DEFAULT_PLUGIN_REPOSITORY_IDENTITY is yogata/agent-dev-flow on main", () => {
    expect(DEFAULT_PLUGIN_REPOSITORY_IDENTITY.owner_slash_name).toBe(
      "yogata/agent-dev-flow",
    );
    expect(DEFAULT_PLUGIN_REPOSITORY_IDENTITY.default_branch).toBe("main");
  });
  test("producer-repo URL at non-docs path is blocked (path-content-independent)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "ref https://github.com/yogata/agent-dev-flow/blob/main/scripts/install.ps1",
      env,
    );
    expect(r.ok).toBe(false);
  });
  test("external-repo URL is allowed (not silently blocked, not silently passed as violation)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "ref https://github.com/sst/opencode/blob/main/packages/plugin/src/index.ts",
      env,
    );
    expect(r.ok).toBe(true);
  });
  test("custom repository identity via makeGuardEnv is honored", () => {
    const env = makeGuardEnv({
      repository_identity: {
        owner_slash_name: "myorg/myrepo",
        default_branch: "develop",
      },
    });
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "ref https://github.com/yogata/agent-dev-flow/blob/main/docs/x.md",
      env,
    );
    expect(r.ok).toBe(true);
    const r2 = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "ref https://github.com/myorg/myrepo/blob/develop/scripts/install.ps1",
      env,
    );
    expect(r2.ok).toBe(false);
  });
});

describe("Stage B regression: unclassified IDs do not silently pass", () => {
  test("write introducing OU-1 fails closed (not in default producer set)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "see OU-1",
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
  test("write introducing a known producer ID is a violation (not inspection-error)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "see ADR-0001",
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("violation");
    }
  });
});

// =============================================================================
// Stage B regression round 2 (PR #2092 review): runtime blockers.
//
// These tests cover the four blockers the post-merge review reproduced:
//   1. Path classifier must resolve absolute paths under the worktree
//      (native write/edit/apply_patch emit `path`, often absolute).
//   2. Outside-root absolute paths and traversal escapes must fail closed
//      (not silently pass as "non-distributed").
//   3. Malformed supported-tool args must fail closed (parser returns null
//      -> plugin shell throws inspection-error, does not silently return).
//   4. apply_patch Move + Update body must inspect the reconstructed
//      destination content, not just the source bytes.
// Plus: parser accepts the real OpenCode field name `path` (was `filePath`),
// and the V2 default export `{ id, server }` loads cleanly under
// OpenCode 1.18.x (verified end-to-end by `opencode debug config`).
// =============================================================================

describe("Stage B round 2: classifyPath resolves absolute paths under worktree", () => {
  test("absolute POSIX path under root, distributed suffix", () => {
    expect(classifyPath("/home/me/proj/src/opencode/commands/agentdev/x.md", "/home/me/proj")).toBe("distributed");
  });
  test("absolute POSIX path under root, non-distributed suffix", () => {
    expect(classifyPath("/home/me/proj/README.md", "/home/me/proj")).toBe("non-distributed");
  });
  test("absolute POSIX path equal to root", () => {
    expect(classifyPath("/home/me/proj", "/home/me/proj")).toBe("non-distributed");
  });
  test("absolute POSIX path with .. that resolves to non-distributed suffix", () => {
    expect(
      classifyPath(
        "/home/me/proj/src/opencode/commands/agentdev/../../../etc/passwd",
        "/home/me/proj",
      ),
    ).toBe("non-distributed");
  });
  test("absolute POSIX path with .. that escapes root fails closed", () => {
    expect(
      classifyPath("/home/me/proj/foo/../../etc/passwd", "/home/me/proj"),
    ).toBe("outside-root");
  });
  test("absolute POSIX path sibling of root fails closed", () => {
    expect(classifyPath("/home/me/other-proj/src/x.md", "/home/me/proj")).toBe("outside-root");
  });
  test("absolute POSIX path completely unrelated fails closed", () => {
    expect(classifyPath("/etc/passwd", "/home/me/proj")).toBe("outside-root");
  });
  test("absolute Windows path under root (backslashes)", () => {
    expect(
      classifyPath(
        "C:\\Users\\me\\proj\\src\\opencode\\commands\\agentdev\\x.md",
        "C:/Users/me/proj",
      ),
    ).toBe("distributed");
  });
  test("absolute Windows path under root (forward slashes)", () => {
    expect(
      classifyPath(
        "C:/Users/me/proj/src/opencode/skills/agentdev-foo/SKILL.md",
        "C:\\Users\\me\\proj",
      ),
    ).toBe("distributed");
  });
  test("absolute Windows path outside root fails closed", () => {
    expect(classifyPath("C:/Windows/System32/drivers/etc/hosts", "C:/Users/me/proj")).toBe("outside-root");
  });
  test("drive letter case-insensitive", () => {
    expect(
      classifyPath(
        "c:/Users/me/proj/src/opencode/commands/agentdev/x.md",
        "C:/Users/me/proj",
      ),
    ).toBe("distributed");
  });
  test("relative path with leading .. escapes root fails closed", () => {
    expect(classifyPath("../etc/passwd", "/home/me/proj")).toBe("outside-root");
  });
  test("relative path with .. that resolves back into a distributed path", () => {
    expect(
      classifyPath(
        "src/opencode/skills/agentdev-foo/sub/../../agentdev-bar/SKILL.md",
        "/home/me/proj",
      ),
    ).toBe("distributed");
  });
  test("relative path with .. that resolves to a non-distributed path", () => {
    expect(
      classifyPath("src/opencode/commands/agentdev/../../../etc/passwd", "/home/me/proj"),
    ).toBe("non-distributed");
  });
  test("empty projectRoot: absolute paths fail closed", () => {
    expect(classifyPathNoRoot("/home/me/proj/src/opencode/commands/agentdev/x.md")).toBe("outside-root");
  });
  test("empty projectRoot: relative distributed paths still distribute", () => {
    expect(classifyPathNoRoot("src/opencode/commands/agentdev/x.md")).toBe("distributed");
  });
});

describe("Stage B round 2: evaluate*Env threads projectRoot", () => {
  test("evaluateWriteContentEnv detects absolute path under worktree", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "/home/me/proj/src/opencode/commands/agentdev/x.md",
      "ref ADR-0001",
      env,
      "/home/me/proj",
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.some((d) => d.matched === "ADR-0001")).toBe(true);
    }
  });
  test("evaluateWriteContentEnv outside-root absolute fails closed", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "/etc/passwd",
      "ref ADR-0001",
      env,
      "/home/me/proj",
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
  test("evaluateWriteContentEnv Windows backslash absolute under worktree", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "C:\\proj\\src\\opencode\\commands\\agentdev\\x.md",
      "ref ADR-0001",
      env,
      "C:/proj",
    );
    expect(r.ok).toBe(false);
  });
  test("evaluateWriteContentEnv legacy no-projectRoot: absolute fails closed", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "/home/me/proj/src/opencode/commands/agentdev/x.md",
      "ref ADR-0001",
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });
});

describe("Stage B round 2: parser reads OpenCode field name `path`", () => {
  test("parseWriteArgs reads `path` (canonical OpenCode field)", () => {
    const r = parseWriteArgs({ path: "src/opencode/commands/agentdev/x.md", content: "ADR-0001" });
    expect(r).not.toBeNull();
    if (r) {
      expect(r.filePath).toBe("src/opencode/commands/agentdev/x.md");
      expect(r.content).toBe("ADR-0001");
    }
  });
  test("parseWriteArgs accepts `filePath` as legacy alias", () => {
    const r = parseWriteArgs({ filePath: "x.md", content: "x" });
    expect(r).not.toBeNull();
  });
  test("parseWriteArgs prefers `path` over `filePath` when both present", () => {
    const r = parseWriteArgs({ path: "from-path.md", filePath: "from-filepath.md", content: "x" });
    expect(r).not.toBeNull();
    if (r) expect(r.filePath).toBe("from-path.md");
  });
  test("parseEditArgs reads `path`", () => {
    const r = parseEditArgs({ path: "x.md", oldString: "a", newString: "b" });
    expect(r).not.toBeNull();
    if (r) expect(r.filePath).toBe("x.md");
  });
  test("parseEditArgs treats empty `path` as malformed (returns null)", () => {
    expect(parseEditArgs({ path: "" })).toBeNull();
  });
  test("parseWriteArgs empty content is valid (empty file write)", () => {
    const r = parseWriteArgs({ path: "x.md", content: "" });
    expect(r).not.toBeNull();
  });
});

describe("Stage B round 2: plugin shell fail-closes on malformed args", () => {
  // Direct invocation of the V2 server. Throws when the parser returns null.
  async function runHook(
    tool: string,
    args: Record<string, unknown>,
    worktree: string,
  ): Promise<{ threw: boolean; message?: string }> {
    const hooks = await pluginDefault.server({
      worktree,
      directory: "/plugin/dir",
      project: { worktree },
    });
    try {
      await hooks["tool.execute.before"]!({ tool, sessionID: "s", callID: "c" }, { args });
      return { threw: false };
    } catch (e) {
      return { threw: true, message: e instanceof Error ? e.message : String(e) };
    }
  }

  test("write with missing path throws (fail closed)", async () => {
    const r = await runHook("write", { content: "ADR-0001" }, "/home/me/proj");
    expect(r.threw).toBe(true);
    if (r.message) expect(r.message).toContain("blocked write");
  });

  test("write with non-string path throws", async () => {
    const r = await runHook("write", { path: 42, content: "x" }, "/home/me/proj");
    expect(r.threw).toBe(true);
  });

  test("write with missing content throws", async () => {
    const r = await runHook("write", { path: "x.md" }, "/home/me/proj");
    expect(r.threw).toBe(true);
  });

  test("edit with missing path throws", async () => {
    const r = await runHook("edit", { oldString: "a", newString: "b" }, "/home/me/proj");
    expect(r.threw).toBe(true);
  });

  test("apply_patch with missing patchText throws", async () => {
    const r = await runHook("apply_patch", {}, "/home/me/proj");
    expect(r.threw).toBe(true);
  });

  test("apply_patch with non-string patchText throws", async () => {
    const r = await runHook("apply_patch", { patchText: 42 }, "/home/me/proj");
    expect(r.threw).toBe(true);
  });

  test("non-inspected tool (read) is a no-op even with empty args", async () => {
    const r = await runHook("read", {}, "/home/me/proj");
    expect(r.threw).toBe(false);
  });

  test("write to distributed path with violation throws", async () => {
    const r = await runHook(
      "write",
      { path: "src/opencode/commands/agentdev/x.md", content: "ref ADR-0001" },
      "/home/me/proj",
    );
    expect(r.threw).toBe(true);
    if (r.message) expect(r.message).toContain("ADR-0001");
  });

  test("write to absolute path under worktree with violation throws", async () => {
    const r = await runHook(
      "write",
      {
        path: "/home/me/proj/src/opencode/commands/agentdev/x.md",
        content: "ref ADR-0001",
      },
      "/home/me/proj",
    );
    expect(r.threw).toBe(true);
  });

  test("write to outside-root absolute path throws (fail closed)", async () => {
    const r = await runHook(
      "write",
      { path: "/etc/passwd", content: "ref ADR-0001" },
      "/home/me/proj",
    );
    expect(r.threw).toBe(true);
    if (r.message) expect(r.message).toContain("inspection error");
  });

  test("write to non-distributed repo-relative path passes (no throw)", async () => {
    const r = await runHook(
      "write",
      { path: "README.md", content: "ref ADR-0001" },
      "/home/me/proj",
    );
    expect(r.threw).toBe(false);
  });
});

describe("Stage B round 2: apply_patch Move + Update body reconstructs destination", () => {
  test("Move with body that introduces a producer-internal ID at destination is blocked", () => {
    // Source content is clean. The patch moves the file to a distributed path
    // AND adds a line that introduces ADR-0001. The destination content is
    // "<source>\nref ADR-0001" -> inspected at the destination distributed path
    // -> violation.
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/skills/agentdev-old/SKILL.md" ? "# clean source\n" : null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/skills/agentdev-old/SKILL.md",
      "*** Move to: src/opencode/skills/agentdev-new/SKILL.md",
      "@@ ctx",
      " # clean source",
      "+ref ADR-0001",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.some((d) => d.matched === "ADR-0001")).toBe(true);
    }
  });

  test("Move with empty body inspects source at destination (existing behavior preserved)", () => {
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/skills/agentdev-old/SKILL.md" ? "# old\nref ADR-9999 here\n" : null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/skills/agentdev-old/SKILL.md",
      "*** Move to: src/opencode/skills/agentdev-new/SKILL.md",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.detections.some((d) => d.matched === "ADR-9999")).toBe(true);
    }
  });

  test("Move with body that REMOVES the offending line passes", () => {
    // Source has ADR-9999. Patch moves to a distributed path AND removes the
    // offending line. After reconstruction the destination content has no
    // violation.
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/skills/agentdev-old/SKILL.md"
          ? "# old\nref ADR-9999 here\n"
          : null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/skills/agentdev-old/SKILL.md",
      "*** Move to: src/opencode/skills/agentdev-new/SKILL.md",
      "@@ ctx",
      " # old",
      "-ref ADR-9999 here",
      "+clean",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(true);
  });

  test("Move to outside-root destination fails closed", () => {
    const env = makeGuardEnv({
      readFile: () => "# source\n",
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/skills/agentdev-old/SKILL.md",
      "*** Move to: /etc/passwd",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(
      parseApplyPatchArgs({ patchText: patch })!,
      env,
      "/home/me/proj",
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });

  test("Move to non-distributed destination passes (no inspection)", () => {
    const env = makeGuardEnv({
      readFile: (p: string) =>
        p === "src/opencode/skills/agentdev-old/SKILL.md" ? "ref ADR-0001\n" : null,
    });
    const patch = [
      "*** Begin Patch",
      "*** Update File: src/opencode/skills/agentdev-old/SKILL.md",
      "*** Move to: docs/notes.md",
      "*** End Patch",
    ].join("\n");
    const r = evaluateApplyPatchEnv(parseApplyPatchArgs({ patchText: patch })!, env);
    expect(r.ok).toBe(true);
  });
});

describe("Stage B round 2: V2 default export shape", () => {
  test("default export is V2 shape { id, server }", () => {
    expect(pluginDefault).toBeDefined();
    expect(typeof pluginDefault).toBe("object");
    expect(pluginDefault.id).toBe("distribution-boundary-guard");
    expect(typeof pluginDefault.server).toBe("function");
  });

  test("server returns hooks with tool.execute.before", async () => {
    const hooks = await pluginDefault.server({
      worktree: "/home/me/proj",
      directory: "/plugin/dir",
      project: { worktree: "/home/me/proj" },
    });
    expect(typeof hooks["tool.execute.before"]).toBe("function");
  });
});

// =============================================================================
// Stage B round 3: distributed-workflow-control prefixes preserved.
//
// The canonical DetectorConfig gained a required `distributed_workflow_
// control_prefixes` field (default ["STEP","QG"]) so legitimate workflow
// labels like STEP-1 and QG-4 ship in restored executable docs without
// tripping the boundary gate, while still-unclassified families (OU-1,
// TS-1, AG-1) stay fail-closed.
//
// These tests prove the plugin's makeGuardEnv preserves DEFAULT_DETECTOR_
// CONFIG's STEP/QG defaults rather than dropping the field to undefined
// (which would crash resolveCandidateConfig on every ID candidate).
// =============================================================================

describe("Stage B round 3: distributed-workflow-control prefixes preserved by makeGuardEnv", () => {
  test("STEP-1 in distributed content is allowed (no Detection)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "- STEP-1 で Epic Issue と判定",
      env,
    );
    expect(r.ok).toBe(true);
  });

  test("QG-4 in distributed content is allowed (no Detection)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "QG-4 観点8 に基づく評価スコープ切替",
      env,
    );
    expect(r.ok).toBe(true);
  });

  test("STEP-N for N=1..6 all pass as distributed-control", () => {
    const env = makeGuardEnv();
    for (const n of ["STEP-1", "STEP-2", "STEP-3", "STEP-4", "STEP-5", "STEP-6"]) {
      const r = evaluateWriteContentEnv(
        "src/opencode/commands/agentdev/x.md",
        `次: ${n}`,
        env,
      );
      expect(r.ok).toBe(true);
    }
  });

  test("OU-1 still fails closed (not in producer set, not in distributed-control set)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "see OU-1",
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("inspection-error");
    }
  });

  test("producer-internal ADR-0001 still flagged as violation (not relaxed)", () => {
    const env = makeGuardEnv();
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "see ADR-0001",
      env,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errorKind).toBe("violation");
    }
  });

  test("custom distributed_workflow_control_prefixes can extend the allowed set", () => {
    const env = makeGuardEnv({
      distributed_workflow_control_prefixes: ["STEP", "QG", "WP"],
    });
    const r = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "see WP-3",
      env,
    );
    expect(r.ok).toBe(true);
  });

  test("overriding producer_internal_id_prefixes does not drop STEP/QG defaults", () => {
    const env = makeGuardEnv({
      producer_internal_id_prefixes: ["IR"],
    });
    // STEP-1 still allowed
    const stepR = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "STEP-1 ok",
      env,
    );
    expect(stepR.ok).toBe(true);
    // IR-0001 now flagged as producer-internal violation
    const irR = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "see IR-0001",
      env,
    );
    expect(irR.ok).toBe(false);
    if (!irR.ok) {
      expect(irR.errorKind).toBe("violation");
    }
    // ADR-0001 is now unclassified (not in IR set) -> fail closed
    const adrR = evaluateWriteContentEnv(
      "src/opencode/commands/agentdev/x.md",
      "see ADR-0001",
      env,
    );
    expect(adrR.ok).toBe(false);
    if (!adrR.ok) {
      expect(adrR.errorKind).toBe("inspection-error");
    }
  });

  test("detector_config constructed by makeGuardEnv is total (no undefined fields)", () => {
    const env = makeGuardEnv();
    expect(Array.isArray(env.detector_config.distributed_workflow_control_prefixes)).toBe(true);
    expect(env.detector_config.distributed_workflow_control_prefixes).toContain("STEP");
    expect(env.detector_config.distributed_workflow_control_prefixes).toContain("QG");
    expect(Array.isArray(env.detector_config.producer_internal_id_prefixes)).toBe(true);
    expect(env.detector_config.repository_identity).toBeDefined();
  });
});
