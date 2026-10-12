import { describe, expect, test } from "bun:test";

import {
  runPrepareDefinitionPr,
  type CommandResult,
  type GateCommandSpec,
  type MechanicalRunner,
  type PrepareDefinitionPrInput,
} from "../src/prepare_definition_pr";

const TARGET_REQ_ID = ["REQ", "110", "001"].join("-");
const CHECK_KINDS = [
  "malformed-declarations",
  "unknown-roles",
  "unknown-req-refs",
  "invalid-artifact-paths",
  "missing-design",
  "missing-implementation",
  "missing-verification",
  "policy-invalid",
  "duplicate-inconsistencies",
  "malformed-links",
  "dangling-links",
] as const;

type CheckKind = typeof CHECK_KINDS[number];
type Check = {
  readonly kind: CheckKind;
  readonly status: "pass" | "fail";
  readonly findings: readonly { readonly reqId?: string }[];
};

function report(overrides: Partial<Record<CheckKind, Check>> = {}) {
  const checks = Object.fromEntries(CHECK_KINDS.map((kind) => [
    kind,
    overrides[kind] ?? { kind, status: "pass", findings: [] },
  ]));
  const failed = Object.values(checks).filter((check) => check.status === "fail").length;
  return {
    checks,
    summary: { pass: CHECK_KINDS.length - failed, fail: failed },
    completenessScope: [TARGET_REQ_ID],
    verificationPolicyUnavailable: false,
    structuralOnly: true,
  };
}

function gate(name: string): GateCommandSpec {
  return { name, command: "bun", args: [name], cwd: "C:/repo" };
}

function input(): PrepareDefinitionPrInput {
  return {
    repoRoot: "C:/repo",
    worktreeRoot: ".worktrees/3653-definition",
    branch: "definition/issue-3653",
    baseRef: "origin/main",
    rootCaseId: "#3653",
    definitionEdits: [{ path: "REQ.md", oldText: "old", newText: "new" }],
    requiresIndexRegeneration: true,
    stagePaths: ["REQ.md"],
    commitMessage: "docs(definition): Case #3653",
    traceabilityReqIds: [TARGET_REQ_ID],
    generateIndexesGate: gate("generate_indexes"),
    checkIntegrityGate: gate("check_integrity"),
    traceabilityGate: gate("traceability-check"),
  };
}

function runner(traceabilityReport: object): MechanicalRunner {
  return {
    run(spec): CommandResult {
      const isTraceability = spec.args.includes("traceability-check");
      return {
        exitCode: isTraceability ? 2 : 0,
        stdout: isTraceability ? JSON.stringify(traceabilityReport) : "",
        stderr: "",
      };
    },
    readTextFile() {
      return "old";
    },
    writeTextFile() {},
    exists() {
      return false;
    },
  };
}

describe("case-open Definition-stage traceability gate consumption", () => {
  test("records raw implementation/verification failures as deferred and allows the stage gate", () => {
    const raw = report({
      "missing-implementation": { kind: "missing-implementation", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
      "missing-verification": { kind: "missing-verification", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
    });

    const result = runPrepareDefinitionPr(input(), runner(raw));
    const traceabilityStep = result.result.steps.find((step) => step.name === "traceability-check");

    expect(traceabilityStep?.status).toBe("warn");
    expect(traceabilityStep?.detail.exitCode).toBe(2);
    expect(traceabilityStep?.detail.stdout).toBe(JSON.stringify(raw));
    expect(traceabilityStep?.detail.deferredObligations).toEqual([
      { check: "missing-implementation", reqIds: [TARGET_REQ_ID] },
      { check: "missing-verification", reqIds: [TARGET_REQ_ID] },
    ]);
    expect(result.result.exitCategory).toBe("needs-judgment");
  });

  test("does not defer target missing-design or structural failures", () => {
    const designFailure = report({
      "missing-design": { kind: "missing-design", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
    });
    const structuralFailure = report({
      "malformed-declarations": { kind: "malformed-declarations", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
    });

    expect(runPrepareDefinitionPr(input(), runner(designFailure)).result.exitCategory).toBe("failure");
    expect(runPrepareDefinitionPr(input(), runner(structuralFailure)).result.exitCategory).toBe("failure");
  });
});
