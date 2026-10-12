import { describe, expect, test } from "bun:test";

import {
  runAcceptDefinitionChecks,
  type AcceptDefinitionInput,
  type CommandResult,
  type GateCommandSpec,
  type MechanicalRunner,
} from "../src/accept_definition_checks";

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

function gate(name: string, args: readonly string[] = [name]): GateCommandSpec {
  return { name, command: "bun", args, cwd: "C:/repo" };
}

function input(): AcceptDefinitionInput {
  return {
    phase: "acceptance-checks",
    repoRoot: "C:/repo",
    branch: "definition/issue-3653",
    prNumber: 37,
    integrityGates: [gate("check_integrity")],
    traceabilityGate: gate("traceability-check", ["./check.ts", "--root", "C:/repo", "--req", TARGET_REQ_ID]),
    overlapGate: gate("overlap-cross-check"),
    generateIndexesGate: gate("generate_indexes"),
  };
}

function runner(traceabilityReport: object): MechanicalRunner {
  return {
    run(spec): CommandResult {
      const isTraceability = spec.args.includes("--req");
      return {
        exitCode: isTraceability ? 2 : 0,
        stdout: isTraceability ? JSON.stringify(traceabilityReport) : "",
        stderr: "",
      };
    },
  };
}

describe("case-ready Definition readiness traceability consumption", () => {
  test("defers implementation and verification failures without failing readiness", () => {
    const raw = report({
      "missing-implementation": { kind: "missing-implementation", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
      "missing-verification": { kind: "missing-verification", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
    });

    const result = runAcceptDefinitionChecks(input(), runner(raw));
    const traceabilityStep = result.result.steps.find((step) => step.name === "traceability-check");

    expect(traceabilityStep?.detail.summary).toBe("pass=9 fail=2");
    expect(traceabilityStep?.status).toBe("warn");
    expect(traceabilityStep?.detail.exitCode).toBe(2);
    expect(traceabilityStep?.detail.stdout).toBe(JSON.stringify(raw));
    expect(traceabilityStep?.detail.deferredObligations).toEqual([
      { check: "missing-implementation", reqIds: [TARGET_REQ_ID] },
      { check: "missing-verification", reqIds: [TARGET_REQ_ID] },
    ]);
    expect(result.result.exitCategory).toBe("needs-judgment");
  });

  test("keeps policy and malformed declaration failures blocking", () => {
    const raw = report({
      "missing-implementation": { kind: "missing-implementation", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
      "policy-invalid": { kind: "policy-invalid", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
    });

    expect(runAcceptDefinitionChecks(input(), runner(raw)).result.exitCategory).toBe("failure");
  });

  test("keeps targeted missing-design findings blocking", () => {
    const raw = report({
      "missing-design": { kind: "missing-design", status: "fail", findings: [{ reqId: TARGET_REQ_ID }] },
    });

    expect(runAcceptDefinitionChecks(input(), runner(raw)).result.exitCategory).toBe("failure");
  });
});
