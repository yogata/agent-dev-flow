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
type DeferredCheckKind = Extract<CheckKind, "missing-implementation" | "missing-verification">;

export type DeferredObligation = {
  readonly check: DeferredCheckKind;
  readonly reqIds: readonly string[];
};

type TraceabilityConsumption = {
  readonly status: "pass" | "warn" | "fail";
  readonly blocking: boolean;
  readonly summary: string;
  readonly reason: string | null;
  readonly deferredObligations: readonly DeferredObligation[];
};

type ParsedCheck = {
  readonly kind: CheckKind;
  readonly status: "pass" | "fail";
  readonly findings: readonly { readonly reqId?: string }[];
};

type ParsedReport = {
  readonly checks: readonly ParsedCheck[];
  readonly passCount: number;
  readonly failCount: number;
  readonly completenessScope: readonly string[];
};

type TraceabilityInput = {
  readonly exitCode: number;
  readonly stdout: string;
  readonly targetReqIds: readonly string[];
};

class UnexpectedTraceabilityValueError extends Error {
  readonly name = "UnexpectedTraceabilityValueError";
}

function assertNever(value: never): never {
  throw new UnexpectedTraceabilityValueError(String(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCheckKind(value: string): value is CheckKind {
  return CHECK_KINDS.some((kind) => kind === value);
}

function isReqRowId(value: string): boolean {
  return /^REQ-\d{3}-\d{3}$/.test(value);
}

function parseReport(value: unknown): ParsedReport | null {
  if (!isRecord(value)) return null;
  const rawChecks = value.checks;
  const summary = value.summary;
  const scope = value.completenessScope;
  if (!isRecord(rawChecks) || !isRecord(summary) || !Array.isArray(scope)) return null;
  if (
    typeof summary.pass !== "number" || !Number.isInteger(summary.pass) || summary.pass < 0 ||
    typeof summary.fail !== "number" || !Number.isInteger(summary.fail) || summary.fail < 0 ||
    value.verificationPolicyUnavailable !== false || value.structuralOnly !== true ||
    !scope.every((reqId) => typeof reqId === "string" && isReqRowId(reqId))
  ) return null;

  const checks: ParsedCheck[] = [];
  for (const key of Object.keys(rawChecks)) {
    if (!isCheckKind(key)) return null;
  }
  for (const kind of CHECK_KINDS) {
    const rawCheck = rawChecks[kind];
    if (!isRecord(rawCheck) || rawCheck.kind !== kind ||
      (rawCheck.status !== "pass" && rawCheck.status !== "fail") ||
      !Array.isArray(rawCheck.findings)) return null;

    const findings: { readonly reqId?: string }[] = [];
    for (const rawFinding of rawCheck.findings) {
      if (!isRecord(rawFinding)) return null;
      const reqId = rawFinding.reqId;
      if (reqId !== undefined && (typeof reqId !== "string" || !isReqRowId(reqId))) return null;
      findings.push(typeof reqId === "string" ? { reqId } : {});
    }
    if ((rawCheck.status === "pass" && findings.length > 0) ||
      (rawCheck.status === "fail" && findings.length === 0)) return null;
    checks.push({ kind, status: rawCheck.status, findings });
  }

  if (Object.keys(rawChecks).length !== CHECK_KINDS.length ||
    checks.filter((check) => check.status === "pass").length !== summary.pass ||
    checks.filter((check) => check.status === "fail").length !== summary.fail) return null;

  return {
    checks,
    passCount: summary.pass,
    failCount: summary.fail,
    completenessScope: scope,
  };
}

function fail(reason: string): TraceabilityConsumption {
  return { status: "fail", blocking: true, summary: reason, reason, deferredObligations: [] };
}

export function consumeDefinitionTraceability(input: TraceabilityInput): TraceabilityConsumption {
  if (input.targetReqIds.length === 0 || input.targetReqIds.some((reqId) => !isReqRowId(reqId)) ||
    new Set(input.targetReqIds).size !== input.targetReqIds.length) {
    return fail("target REQ row scope is absent or invalid");
  }
  if (input.exitCode !== 0 && input.exitCode !== 2) return fail("traceability checker execution failed");

  let rawReport: unknown;
  try {
    rawReport = JSON.parse(input.stdout);
  } catch (error) {
    if (error instanceof SyntaxError) return fail("traceability checker returned invalid JSON");
    throw error;
  }
  const report = parseReport(rawReport);
  if (report === null) return fail("traceability checker report is structurally invalid");

  const targetIds = new Set(input.targetReqIds);
  if (report.completenessScope.length !== targetIds.size ||
    report.completenessScope.some((reqId) => !targetIds.has(reqId))) {
    return fail("traceability completeness scope does not match the Definition target rows");
  }
  if ((report.failCount === 0 && input.exitCode !== 0) ||
    (report.failCount > 0 && input.exitCode !== 2)) {
    return fail("traceability checker exit code does not match its report");
  }

  const deferred = new Map<DeferredCheckKind, Set<string>>();
  for (const check of report.checks) {
    switch (check.status) {
      case "pass":
        continue;
      case "fail":
        switch (check.kind) {
          case "missing-design":
            if (check.findings.some((finding) => finding.reqId === undefined)) {
              return fail("missing-design finding has no REQ row identifier");
            }
            if (check.findings.some((finding) => targetIds.has(finding.reqId ?? ""))) {
              return fail("a targeted REQ row has no Design correspondence");
            }
            continue;
          case "missing-implementation":
          case "missing-verification":
            if (check.findings.some((finding) => finding.reqId === undefined || !targetIds.has(finding.reqId))) {
              return fail(`deferred traceability finding is outside the Definition target scope: ${check.kind}`);
            }
            deferred.set(check.kind, new Set(check.findings.map((finding) => finding.reqId).filter((reqId): reqId is string => reqId !== undefined)));
            continue;
          case "malformed-declarations":
          case "unknown-roles":
          case "unknown-req-refs":
          case "invalid-artifact-paths":
          case "policy-invalid":
          case "duplicate-inconsistencies":
          case "malformed-links":
          case "dangling-links":
            return fail(`non-deferrable traceability check failed: ${check.kind}`);
          default:
            return assertNever(check.kind);
        }
      default:
        return assertNever(check.status);
    }
  }

  const deferredObligations: DeferredObligation[] = [...deferred].map(([check, reqIds]) => ({
    check,
    reqIds: [...reqIds].sort(),
  }));
  return deferredObligations.length === 0
    ? {
        status: "pass",
        blocking: false,
        summary: `pass=${report.passCount} fail=${report.failCount}`,
        reason: null,
        deferredObligations: [],
      }
    : {
        status: "warn",
        blocking: false,
        summary: `pass=${report.passCount} fail=${report.failCount}`,
        reason: null,
        deferredObligations,
      };
}
