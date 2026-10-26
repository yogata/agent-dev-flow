// ADF-COVERS(verification): REQ-009-053
import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { formatCompositeId, extractAllCompositeIds, nextRowNumber } from "../../../../../src/common/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts";
import { extractCompositeIdNumbers as readAllocated } from "../../../../../src/common/skills/agentdev-req-file-manager/scripts/lib/frontmatter.ts";
import { extractCompositeIdNumbers, extractReqNumber } from "../../../../../src/common/skills/agentdev-artifact-validation/scripts/lib/frontmatter.ts";
import { reqNumberFromFilename } from "../../../../../src/common/skills/agentdev-artifact-validation/scripts/lib/fs-helpers.ts";
import { checkSingleFile } from "../../../../../src/common/skills/agentdev-artifact-validation/scripts/src/check-frontmatter-consistency.ts";
import { DEFAULT_ID_PATTERN } from "../../../../../src/common/skills/agentdev-artifact-validation/scripts/src/check-req-row-existence.ts";
import { currentRequirementLineIds } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/requirements.ts";
import { parseDeclarations } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/declarations.ts";
import { parseSidecar } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/sidecar.ts";
import { parseVerificationPolicy } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/verification_scope.ts";
import { buildInventory } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/inventory.ts";
import { isReqRowId, REQ_ROW_ID_LIST_PATTERN } from "../../../../../src/common/skills/agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts";
import { readSharedAreaRegistration } from "../../../../../src/common/skills/agentdev-workflow-case-open/scripts/lib/shared_area_registration.ts";
import { runValidateInputOnly, validateInput } from "../../../../../src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts";
import { countReqRequirementLines } from "../generate_indexes.ts";
import { extractCurrentReqRefs } from "../current_refs.ts";

const root = mkdtempSync(join(process.cwd(), ".agentdev/tmp/req-digit-roundtrip-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));
const declaration = (id: string) => `<!-- ${["ADF", "COVERS"].join("-")}(design): ${id} -->`;

describe("TS-007/008 allocation and consumer round-trip", () => {
  for (const [req, previous] of [[1, 0], [1024, 999], [12345, 1233]] as const) {
    test(`accepts allocator output for req ${req} and row after ${previous}`, () => {
      const id = formatCompositeId(req, nextRowNumber([previous]));
      const reqId = id.slice(0, id.lastIndexOf("-"));
      const fixtureRoot = join(root, id);
      mkdirSync(join(fixtureRoot, "docs/requirements"), { recursive: true });
      const body = `---\nid: ${reqId}\n---\n| ${id} | fixture |\n`;
      writeFileSync(join(fixtureRoot, "docs/requirements", `${reqId}.md`), body, "utf8");
      expect(readAllocated(id)).toEqual({ req, row: previous + 1 });
      expect(extractCompositeIdNumbers(id)).toEqual({ req, row: previous + 1 });
      expect(extractAllCompositeIds(body)).toEqual([id]);
      expect(isReqRowId(id)).toBe(true);
      expect(REQ_ROW_ID_LIST_PATTERN.test(id)).toBe(true);
      expect(currentRequirementLineIds(fixtureRoot)).toEqual([id]);
      expect(parseDeclarations("fixture.md", declaration(id)).declarations[0]?.reqIds).toEqual([id]);
      const sidecar = parseSidecar("traceability/fixture.yaml", `component: fixture\ndesign:\n  fixture.md: [${id}]\n`);
      expect(sidecar.issues).toEqual([]);
      expect(sidecar.relations[0]?.reqIds).toEqual([id]);
      const policy = parseVerificationPolicy(`verification:\n  optional: [${id}]\n`);
      expect(policy.issues).toEqual([]);
      expect(policy.optionalReqIds.has(id)).toBe(true);
      expect(buildInventory(fixtureRoot).discoveredCandidates).not.toContain(`docs/requirements/${reqId}.md`);
      expect(countReqRequirementLines(body, reqId)).toBe(1);
      expect(checkSingleFile(`${reqId}.md`, body, "req").ok).toBe(true);
      const gate = join(process.cwd(), "src/common/skills/agentdev-traceability/scripts/src/check.ts");
      const command = (name: string, args: string[]) => ({ name, command: "bun", args, cwd: root });
      const input = {
        repoRoot: root, worktreeRoot: ".worktrees/probe", branch: "definition/issue-0",
        baseRef: "origin/main", rootCaseId: "#0", definitionEdits: [{ path: "a.md", oldText: "a", newText: "b" }],
        requiresIndexRegeneration: false, stagePaths: ["a.md"], commitMessage: "probe",
        traceabilityReqIds: [id], generateIndexesGate: command("generate_indexes", [gate]),
        checkIntegrityGate: command("check_integrity", [gate, "--profile", "source"]),
        traceabilityGate: command("traceability-check", [gate, "--root", root, "--req", id]),
      };
      expect(runValidateInputOnly(validateInput(input), existsSync).ok).toBe(true);
    });
  }

  test.each(["XRQ-12345-1234", "REQ-abc-1234", "REQ-123451234", "REQ--1234", "REQ-12345-", "REQ-12345-12x"])("rejects malformed %s", (id) => {
    expect(isReqRowId(id)).toBe(false);
    expect(REQ_ROW_ID_LIST_PATTERN.test(id)).toBe(false);
    expect(extractCompositeIdNumbers(id)).toBeNull();
    expect(readAllocated(id)).toBeNull();
    expect(parseDeclarations("fixture.md", declaration(id)).declarations).toEqual([]);
    expect(parseSidecar("x.yaml", `component: x\ndesign:\n  x.md: [${id}]\n`).issues.length).toBeGreaterThan(0);
    expect(parseVerificationPolicy(`verification:\n  optional: [${id}]\n`).issues.length).toBeGreaterThan(0);
  });

  test("does not truncate four-digit row numbers or five-digit requirement numbers", () => {
    const text = "REQ-0063-0123 REQ-12345-001";
    expect(extractAllCompositeIds(text)).toEqual(["REQ-0063-0123", "REQ-12345-001"]);
    expect(text.match(new RegExp(DEFAULT_ID_PATTERN, "g"))).toEqual(["REQ-0063-0123", "REQ-12345-001"]);
    expect([...readSharedAreaRegistration("req-row-mentions", text)]).toEqual(["REQ-0063-0123", "REQ-12345-001"]);
    expect(extractCurrentReqRefs(`${text} REQ-12345`)).toEqual(["REQ-12345"]);
    expect(extractReqNumber("REQ-12345")).toBe(12345);
    expect(reqNumberFromFilename("REQ-12345.md")).toBe(12345);
  });

  test("expands shared-area ranges across the former row-width limit", () => {
    const ids = readSharedAreaRegistration("req-row-mentions", "REQ-12345-999..REQ-12345-2000");
    expect(ids.size).toBe(1002);
    expect(ids.has("REQ-12345-1000")).toBe(true);
    expect(ids.has("REQ-12345-2000")).toBe(true);
  });

  test("TS-004 directly accepts native and Git Bash root paths with a nonempty population", () => {
    const id = formatCompositeId(12345, 1234);
    writeFileSync(join(root, "shared.md"), id, "utf8");
    const current = { case_ref: "probe", epic_ref: null, artifact_paths: ["shared.md"], target_rows: [id], is_epic_intake: false };
    const input = {
      mode: "case-open", current_case: current, unclosed_cases: [current],
      shared_areas: [{ area_id: "shared", display_name: "shared", kind: "req-row-mentions", file_paths: ["shared.md"] }],
    };
    const inputFile = join(root, "cross.json");
    writeFileSync(inputFile, JSON.stringify(input), "utf8");
    const native = root.replaceAll("\\", "/");
    const bashPath = native.replace(/^([A-Za-z]):/, (_prefix, drive: string) => `/${drive.toLowerCase()}`);
    const script = join(process.cwd(), "src/common/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts");
    for (const rootPath of [native, bashPath]) {
      const result = spawnSync(process.execPath, [script, "--input", inputFile, "--root", rootPath], { encoding: "utf8" });
      expect(result.status).toBe(0);
      const report: unknown = JSON.parse(result.stdout);
      expect(report).toMatchObject({ ok: true, scan: { population_count: 1 }, detection_unavailable: [], condition_b: [{ file_results: [{ read_ok: true }] }] });
    }
  });

});
