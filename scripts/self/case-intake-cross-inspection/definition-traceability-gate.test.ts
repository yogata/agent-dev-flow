import { describe, expect, test } from "bun:test";

import { consumeDefinitionTraceability } from "../../../src/common/skills/agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts";

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
  "derived-declaration-conflicts",
] as const;

type CheckKind = typeof CHECK_KINDS[number];
type Finding = { readonly reqId?: string };
type Check = {
  readonly kind: CheckKind;
  readonly status: "pass" | "fail";
  readonly findings: readonly Finding[];
};

function check(kind: CheckKind, findings: readonly Finding[] = []): Check {
  return { kind, status: findings.length === 0 ? "pass" : "fail", findings };
}

function report(
  reqIds: readonly string[],
  overrides: Partial<Record<CheckKind, Check>> = {},
) {
  const checks = Object.fromEntries(
    CHECK_KINDS.map((kind) => [kind, overrides[kind] ?? check(kind)]),
  );
  const results = Object.values(checks);
  const failCount = results.filter((result) => result.status === "fail").length;
  return {
    checks,
    summary: { pass: results.length - failCount, fail: failCount },
    completenessScope: reqIds,
    verificationPolicyUnavailable: false,
    structuralOnly: true,
  };
}

function consume(checkResult: unknown, reqIds: readonly string[], exitCode = 2) {
  return consumeDefinitionTraceability({
    exitCode,
    stdout: JSON.stringify(checkResult),
    targetReqIds: reqIds,
  });
}

describe("Definition-stage traceability gate consumption", () => {
  const reqId = "REQ-110-001";

  test("implementation and verification failures stay raw findings and become deferred obligations", () => {
    const raw = report([reqId], {
      "missing-implementation": check("missing-implementation", [{ reqId }]),
      "missing-verification": check("missing-verification", [{ reqId }]),
    });

    const result = consume(raw, [reqId]);

    expect(result.status).toBe("warn");
    if (result.status === "warn") {
      expect(result.deferredObligations).toEqual([
        { check: "missing-implementation", reqIds: [reqId] },
        { check: "missing-verification", reqIds: [reqId] },
      ]);
    }
  });

  test("target missing-design remains a blocking failure", () => {
    const raw = report([reqId], {
      "missing-design": check("missing-design", [{ reqId }]),
    });

    expect(consume(raw, [reqId]).status).toBe("fail");
  });

  test("structural and policy failures remain blocking alongside deferred failures", () => {
    const raw = report([reqId], {
      "missing-implementation": check("missing-implementation", [{ reqId }]),
      "malformed-declarations": check("malformed-declarations", [{ reqId }]),
    });

    expect(consume(raw, [reqId]).status).toBe("fail");
    expect(consume({ ...raw, verificationPolicyUnavailable: true }, [reqId]).status).toBe("fail");
  });

  test("incomplete reports, mismatched scope, and mismatched exit status fail closed", () => {
    const raw = report([reqId]);
    const { "dangling-links": omitted, ...incompleteChecks } = raw.checks;
    void omitted;

    expect(consume({ ...raw, checks: incompleteChecks }, [reqId], 0).status).toBe("fail");
    expect(consume({ ...raw, completenessScope: [] }, [reqId], 0).status).toBe("fail");
    expect(consume(raw, [reqId], 2).status).toBe("fail");
  });

  test("out-of-scope implementation findings are not deferred", () => {
    const raw = report([reqId], {
      "missing-implementation": check("missing-implementation", [{ reqId: "REQ-104-001" }]),
    });

    expect(consume(raw, [reqId]).status).toBe("fail");
  });

  test("accepts a valid 12-item checker report including a passing derived-declaration-conflicts check", () => {
    const raw = report([reqId]);

    const result = consume(raw, [reqId], 0);

    expect(result.status).toBe("pass");
    expect(result.blocking).toBe(false);
    expect(result.summary).toBe("pass=12 fail=0");
    expect(result.deferredObligations).toEqual([]);
  });

  test("treats a derived-declaration-conflicts failure as a non-deferrable blocking failure", () => {
    const raw = report([reqId], {
      "derived-declaration-conflicts": check("derived-declaration-conflicts", [{ reqId }]),
    });

    const result = consume(raw, [reqId]);

    expect(result.status).toBe("fail");
    expect(result.blocking).toBe(true);
    expect(result.reason).toBe("non-deferrable traceability check failed: derived-declaration-conflicts");
    expect(result.deferredObligations).toEqual([]);
  });

  test("rejects an unknown extra check kind beyond the 12 known kinds", () => {
    const raw = report([reqId]);
    const withUnknownKind = {
      ...raw,
      checks: { ...raw.checks, "future-check": { kind: "future-check", status: "pass", findings: [] } },
    };

    const result = consume(withUnknownKind, [reqId], 0);

    expect(result.status).toBe("fail");
    expect(result.reason).toBe("traceability checker report is structurally invalid");
  });
});
