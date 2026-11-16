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
type TestFinding = { readonly reqId?: string };
type CheckOverride = {
  readonly status: "pass" | "fail";
  readonly findings: readonly TestFinding[];
};

export function traceabilityReport(
  targetReqIds: readonly string[],
  overrides: Partial<Record<CheckKind, CheckOverride>> = {},
): string {
  const checks = Object.fromEntries(CHECK_KINDS.map((kind) => [
    kind,
    { kind, ...(overrides[kind] ?? { status: "pass", findings: [] }) },
  ]));
  const results = Object.values(checks);
  const failCount = results.filter((result) => result.status === "fail").length;
  return JSON.stringify({
    checks,
    summary: { pass: results.length - failCount, fail: failCount },
    completenessScope: targetReqIds,
    verificationPolicyUnavailable: false,
    structuralOnly: true,
  });
}

export function traceabilityReportFromArgs(args: readonly string[]): string {
  const reqFlag = args.indexOf("--req");
  const reqValue = reqFlag >= 0 ? args[reqFlag + 1] : undefined;
  return traceabilityReport(typeof reqValue === "string" ? reqValue.split(",") : []);
}

/**
 * 全体を対象とする検査（--req 指定なし・対象 REQ 行 0 件案件の正規経路）の
 * checker 報告。completenessScope は実 checker の全体実行出力に合わせて文字列 "all"。
 */
export function wholeScopeTraceabilityReport(
  overrides: Partial<Record<CheckKind, CheckOverride>> = {},
): string {
  const checks = Object.fromEntries(CHECK_KINDS.map((kind) => [
    kind,
    { kind, ...(overrides[kind] ?? { status: "pass", findings: [] }) },
  ]));
  const results = Object.values(checks);
  const failCount = results.filter((result) => result.status === "fail").length;
  return JSON.stringify({
    checks,
    summary: { pass: results.length - failCount, fail: failCount },
    completenessScope: "all",
    verificationPolicyUnavailable: false,
    structuralOnly: true,
  });
}
