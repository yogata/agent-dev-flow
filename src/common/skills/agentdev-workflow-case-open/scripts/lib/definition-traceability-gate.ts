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

/**
 * 対象 REQ 行 0 件案件の正規経路（REQ-030-032）で対照基準とする main baseline の
 * 既知欠落（識別子集合）。missing-implementation と missing-verification の
 * 識別子集合を main 実測（全体実行）から保持する。
 */
export type WholeScopeKnownMissingBaseline = {
  readonly missingImplementation: readonly string[];
  readonly missingVerification: readonly string[];
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

/**
 * REQ 行ID の許容書式（traceability checker 契約と同じ REQ-{NNN}-{NNN} 形式）。
 * 受理検査が要求するのは形式妥当性のみとする: REQ- 接頭辞、ハイフン区切り、
 * 数値セグメント2つ、各セグメント最小1桁。桁数上限は設けない
 * （「要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離」Decision 参照）。
 * 表示上のゼロ埋め（pad3/pad4 等の pad 指定）は最小幅の表示規則（切詰めなし）であり、
 * 受理上限として機能させない。
 * 機械工程 script は本関数を共有して検証する（工程別 script 側で書式を再定義しない）。
 */
const REQ_ROW_ID_SOURCE = "REQ-\\d+-\\d+";
const REQ_ROW_ID_PATTERN = new RegExp(`^${REQ_ROW_ID_SOURCE}$`);

export function isReqRowId(value: string): boolean {
  return REQ_ROW_ID_PATTERN.test(value);
}

/**
 * 定義PR準備・受入検査・クローズ機械工程の `--req` 引数契約で共有する
 * REQ 行ID カンマ連結リストの受理パターン（単一実装）。ID 1件の受理条件は
 * isReqRowId（形式妥当性のみ・桁数上限なし）と同一である。
 */
export const REQ_ROW_ID_LIST_PATTERN = new RegExp(`^${REQ_ROW_ID_SOURCE}(,${REQ_ROW_ID_SOURCE})*$`);

function parseReport(value: unknown): ParsedReport | null {
  const parsed = parseChecksAndSummary(value);
  if (parsed === null) return null;
  const scope = isRecord(value) ? value.completenessScope : undefined;
  if (!Array.isArray(scope) || !scope.every((reqId) => typeof reqId === "string" && isReqRowId(reqId))) return null;
  return { ...parsed, completenessScope: scope };
}

/**
 * 全体を対象とする検査（--req 指定なし・REQ-029-017/REQ-030-032 の正規経路）の
 * checker 報告を解析する。全体実行の completenessScope は文字列 "all" であり、
 * 対象行配列形式とは受容契約が異なる。
 */
function parseWholeScopeReport(value: unknown): ParsedReport | null {
  const parsed = parseChecksAndSummary(value);
  if (parsed === null) return null;
  if (!isRecord(value) || value.completenessScope !== "all") return null;
  return { ...parsed, completenessScope: [] };
}

function parseChecksAndSummary(value: unknown): Omit<ParsedReport, "completenessScope"> | null {
  if (!isRecord(value)) return null;
  const rawChecks = value.checks;
  const summary = value.summary;
  if (!isRecord(rawChecks) || !isRecord(summary)) return null;
  if (
    typeof summary.pass !== "number" || !Number.isInteger(summary.pass) || summary.pass < 0 ||
    typeof summary.fail !== "number" || !Number.isInteger(summary.fail) || summary.fail < 0 ||
    value.verificationPolicyUnavailable !== false || value.structuralOnly !== true
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
          case "derived-declaration-conflicts":
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

type WholeScopeTraceabilityInput = {
  readonly exitCode: number;
  readonly stdout: string;
};

/**
 * 対象 REQ 行 0 件案件の正規の入力構成（REQ-029-017・case-open 段階の門）における
 * 全体を対象とする検査の実行結果を消費する。対象集合が空であるため Design 対応と
 * deferred 義務の適用対象はなく、missing-* の findings は他 Case の背景診断として
 * 不合格の原因にしない。構造・policy 系検査（missing-* 以外）の fail は
 * 変更 Case が corpus 構造を壊した可能性を示すため fail-closed で拒否する。
 */
export function consumeDefinitionTraceabilityWholeScope(input: WholeScopeTraceabilityInput): TraceabilityConsumption {
  const outcome = evaluateWholeScope(input);
  return "failure" in outcome ? outcome.failure : passWholeScope(outcome.report);
}

/**
 * 対象 REQ 行 0 件案件の case-close 機械工程における正規の経路（REQ-030-032）:
 * 全体実行の結果を main baseline の既知欠落（識別子集合）と対照し、悪化 0 件を
 * 機械証明する。missing-implementation / missing-verification の識別子集合が
 * baseline の集合の部分集合であるかぎり不合格の原因にせず、baseline 外の識別子
 * （新規の違反）が 1 件でも現れた場合は不合格とする。baseline は missing 系のみを
 * 既知欠落として保持するため、missing-design と構造・policy 系検査の fail は
 * 新規違反として fail-closed で拒否する。
 */
export function consumeDefinitionTraceabilityAgainstBaseline(
  input: WholeScopeTraceabilityInput & { readonly baseline: WholeScopeKnownMissingBaseline },
): TraceabilityConsumption {
  const baselineInvalid = (message: string): TraceabilityConsumption => fail(`traceability known-missing baseline is invalid: ${message}`);
  for (const kind of ["missingImplementation", "missingVerification"] as const) {
    const ids = input.baseline[kind];
    if (!Array.isArray(ids) || ids.some((reqId) => typeof reqId !== "string" || !isReqRowId(reqId))) {
      return baselineInvalid(`${kind} must be an array of REQ row ids`);
    }
    if (new Set(ids).size !== ids.length) {
      return baselineInvalid(`${kind} contains duplicate identifiers`);
    }
  }
  const outcome = evaluateWholeScope(input);
  if ("failure" in outcome) return outcome.failure;
  for (const check of outcome.report.checks) {
    if (check.status !== "fail") continue;
    if (check.kind === "missing-design") {
      return fail("new traceability violation against the main baseline: missing-design");
    }
    if (check.kind === "missing-implementation" || check.kind === "missing-verification") {
      const known = new Set(
        check.kind === "missing-implementation" ? input.baseline.missingImplementation : input.baseline.missingVerification,
      );
      const newViolations = check.findings
        .map((finding) => finding.reqId)
        .filter((reqId): reqId is string => reqId !== undefined)
        .filter((reqId) => !known.has(reqId));
      if (newViolations.length > 0) {
        return fail(
          `new traceability violation against the main baseline (${check.kind}): ${[...new Set(newViolations)].sort().join(", ")}`,
        );
      }
    }
  }
  return passWholeScope(outcome.report);
}

function passWholeScope(report: ParsedReport): TraceabilityConsumption {
  return {
    status: "pass",
    blocking: false,
    summary: `pass=${report.passCount} fail=${report.failCount}`,
    reason: null,
    deferredObligations: [],
  };
}

type WholeScopeOutcome = { readonly report: ParsedReport } | { readonly failure: TraceabilityConsumption };

/**
 * 全体実行の報告を検証して解析する。実行失敗・JSON 不正・報告形式不正・終了コードと
 * summary の不整合は failure として返す。missing-* 以外の検査の fail は新規の構造
 * 違反として failure とし、missing-* の fail は呼出側の経路（case-open 段階の
 * 背景診断扱い / case-close 段階の baseline 対照）へ委ねる。
 */
function evaluateWholeScope(input: WholeScopeTraceabilityInput): WholeScopeOutcome {
  if (input.exitCode !== 0 && input.exitCode !== 2) {
    return { failure: fail("traceability checker execution failed") };
  }
  let rawReport: unknown;
  try {
    rawReport = JSON.parse(input.stdout);
  } catch (error) {
    if (error instanceof SyntaxError) return { failure: fail("traceability checker returned invalid JSON") };
    throw error;
  }
  const report = parseWholeScopeReport(rawReport);
  if (report === null) return { failure: fail("traceability checker report is structurally invalid") };
  if ((report.failCount === 0 && input.exitCode !== 0) ||
    (report.failCount > 0 && input.exitCode !== 2)) {
    return { failure: fail("traceability checker exit code does not match its report") };
  }
  for (const check of report.checks) {
    if (check.status !== "fail") continue;
    switch (check.kind) {
      case "missing-design":
      case "missing-implementation":
      case "missing-verification":
        if (check.findings.some((finding) => finding.reqId === undefined)) {
          return { failure: fail(`${check.kind} finding has no REQ row identifier`) };
        }
        continue;
      default:
        return { failure: fail(`non-deferrable traceability check failed: ${check.kind}`) };
    }
  }
  return { report };
}
