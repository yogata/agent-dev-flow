// ADF-COVERS(implementation): REQ-011-030
// PR 系操作（6 操作）のスペック実装。
//
// 各スペックは操作ごとの差分（入力検証、runner 要求の組立て、応答解釈、
// 読み戻し照合）のみを所有する。fail-closed の制御順序は engine.ts が所有する。


import {
  prNumber,
  type GhToolRequest,
  type GhToolSuccess,
} from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";
import type { OperationSpec, ValidateOutcome } from "./engine.ts";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function positiveInt(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
}

// 出力 URL: GitHub 実装は https URL、Local 実装（Case ファイル）は絶対パスを識別子として返す（REQ-{NNNN}-{NNN}）。
function isAcceptedUrl(v: string): boolean {
  return /^https:\/\//.test(v) || v.startsWith("/") || /^[A-Za-z]:[\\/]/.test(v);
}

function parseMergeable(v: unknown): "MERGEABLE" | "CONFLICTING" | "UNKNOWN" | null {
  if (v === "MERGEABLE" || v === "CONFLICTING" || v === "UNKNOWN") return v;
  return null;
}

function prReadRequest(number: number): GhRunnerRequest {
  return { operation: "pr_read", args: { number } };
}

async function readPr(
  runner: GhRunner,
  number: number,
): Promise<Record<string, unknown> | null> {
  const reply = await runner.run(prReadRequest(number));
  if (!reply.ok || !isRecord(reply.payload)) return null;
  if (positiveInt(reply.payload.number) !== number) return null;
  return reply.payload;
}

function parsePrState(v: unknown): "open" | "closed" | "merged" | null {
  if (v === "open" || v === "closed" || v === "merged") return v;
  return null;
}

function missingNumberOutcome(operation: string): ValidateOutcome {
  return {
    ok: false,
    error: {
      code: "missing-field",
      field: "number",
      detail: `required field 'number' is missing for ${operation}`,
    },
  };
}

function invalidNumberOutcome(): ValidateOutcome {
  return {
    ok: false,
    error: {
      code: "invalid-field",
      field: "number",
      detail: "number must be a positive integer",
    },
  };
}

function checkUnknownFields(
  raw: Record<string, unknown>,
  allowed: readonly string[],
): ValidateOutcome | null {
  for (const key of Object.keys(raw)) {
    if (!allowed.includes(key)) {
      return {
        ok: false,
        error: {
          code: "unknown-field",
          field: key,
          detail: `field '${key}' is not part of the ${String(raw.operation)} input contract`,
        },
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// pr_create
// ---------------------------------------------------------------------------

const prCreateSpec: OperationSpec = {
  operation: "pr_create",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingNumberOutcome("pr_create");
    const unknown = checkUnknownFields(raw, [
      "operation",
      "title",
      "body",
      "base",
      "head",
      "draft",
    ]);
    if (unknown !== null) return unknown;
    for (const field of ["title", "body", "base", "head"] as const) {
      if (raw[field] === undefined) {
        return {
          ok: false,
          error: {
            code: "missing-field",
            field,
            detail: `required field '${field}' is missing for pr_create`,
          },
        };
      }
    }
    const title = str(raw.title);
    const body = str(raw.body);
    const base = str(raw.base);
    const head = str(raw.head);
    if (title === null || title.length === 0) {
      return { ok: false, error: { code: "invalid-field", field: "title", detail: "title must be a non-empty string" } };
    }
    if (body === null) {
      return { ok: false, error: { code: "invalid-field", field: "body", detail: "body must be a string" } };
    }
    if (base === null || base.length === 0) {
      return { ok: false, error: { code: "invalid-field", field: "base", detail: "base must be a non-empty string" } };
    }
    if (head === null || head.length === 0) {
      return { ok: false, error: { code: "invalid-field", field: "head", detail: "head must be a non-empty string" } };
    }
    const request: GhToolRequest = { operation: "pr_create", title, body, base, head };
    if (raw.draft !== undefined && typeof raw.draft !== "boolean") {
      return { ok: false, error: { code: "invalid-field", field: "draft", detail: "draft must be a boolean" } };
    }
    if (raw.draft === true) return { ok: true, request: { ...request, draft: true } };
    return { ok: true, request };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_create" }>;
    return {
      operation: "pr_create",
      args: { title: r.title, body: r.body, base: r.base, head: r.head, draft: r.draft },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !isAcceptedUrl(url)) return null;
    return { operation: "pr_create", number: prNumber(number), url };
  },
  async verify(runner, request, success) {
    const req = request as Extract<GhToolRequest, { operation: "pr_create" }>;
    const created = success as Extract<GhToolSuccess, { operation: "pr_create" }>;
    const pr = await readPr(runner, created.number);
    if (pr === null) return false;
    return str(pr.title) === req.title && str(pr.state) === "open";
  },
};

// ---------------------------------------------------------------------------
// pr_read
// ---------------------------------------------------------------------------

const prReadSpec: OperationSpec = {
  operation: "pr_read",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingNumberOutcome("pr_read");
    const unknown = checkUnknownFields(raw, ["operation", "number"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingNumberOutcome("pr_read");
    const number = positiveInt(raw.number);
    if (number === null) return invalidNumberOutcome();
    return { ok: true, request: { operation: "pr_read", number: prNumber(number) } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_read" }>;
    return prReadRequest(r.number);
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const title = str(payload.title);
    const state = parsePrState(payload.state);
    const mergeable = parseMergeable(payload.mergeable);
    const body = str(payload.body);
    if (number === null || title === null || state === null || mergeable === null) return null;
    if (body === null) return null;
    return {
      operation: "pr_read",
      number: prNumber(number),
      title,
      body,
      state,
      mergeable,
    };
  },
  async verify(runner, _request, success) {
    const read = success as Extract<GhToolSuccess, { operation: "pr_read" }>;
    const pr = await readPr(runner, read.number);
    return pr !== null && str(pr.title) === read.title && parsePrState(pr.state) === read.state;
  },
};

// ---------------------------------------------------------------------------
// pr_merge
// ---------------------------------------------------------------------------

const prMergeSpec: OperationSpec = {
  operation: "pr_merge",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingNumberOutcome("pr_merge");
    const unknown = checkUnknownFields(raw, ["operation", "number", "method"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingNumberOutcome("pr_merge");
    const number = positiveInt(raw.number);
    if (number === null) return invalidNumberOutcome();
    if (raw.method === undefined) {
      return {
        ok: false,
        error: {
          code: "missing-field",
          field: "method",
          detail: "required field 'method' is missing for pr_merge",
        },
      };
    }
    const method = str(raw.method);
    if (method !== "merge" && method !== "squash" && method !== "rebase") {
      return {
        ok: false,
        error: {
          code: "invalid-field",
          field: "method",
          detail: "method must be merge, squash, or rebase",
        },
      };
    }
    return { ok: true, request: { operation: "pr_merge", number: prNumber(number), method } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_merge" }>;
    return { operation: "pr_merge", args: { number: r.number, method: r.method } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    if (payload.merged !== true) return null;
    return { operation: "pr_merge", number: prNumber(number), merged: true };
  },
  async verify(runner, _request, success) {
    const merged = success as Extract<GhToolSuccess, { operation: "pr_merge" }>;
    const pr = await readPr(runner, merged.number);
    return pr !== null && parsePrState(pr.state) === "merged";
  },
};

// ---------------------------------------------------------------------------
// pr_changed_files
// ---------------------------------------------------------------------------

const prChangedFilesSpec: OperationSpec = {
  operation: "pr_changed_files",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingNumberOutcome("pr_changed_files");
    const unknown = checkUnknownFields(raw, ["operation", "number"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingNumberOutcome("pr_changed_files");
    const number = positiveInt(raw.number);
    if (number === null) return invalidNumberOutcome();
    return { ok: true, request: { operation: "pr_changed_files", number: prNumber(number) } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_changed_files" }>;
    return { operation: "pr_changed_files", args: { number: r.number } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    if (!Array.isArray(payload.files)) return null;
    if (!payload.files.every((f) => typeof f === "string" && f.length > 0)) return null;
    return { operation: "pr_changed_files", number: prNumber(number), files: payload.files };
  },
  async verify(runner, success) {
    const changed = success as Extract<GhToolSuccess, { operation: "pr_changed_files" }>;
    const pr = await readPr(runner, changed.number);
    return pr !== null;
  },
};

// ---------------------------------------------------------------------------
// pr_mergeable
// ---------------------------------------------------------------------------

const prMergeableSpec: OperationSpec = {
  operation: "pr_mergeable",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingNumberOutcome("pr_mergeable");
    const unknown = checkUnknownFields(raw, ["operation", "number"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingNumberOutcome("pr_mergeable");
    const number = positiveInt(raw.number);
    if (number === null) return invalidNumberOutcome();
    return { ok: true, request: { operation: "pr_mergeable", number: prNumber(number) } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_mergeable" }>;
    return { operation: "pr_mergeable", args: { number: r.number } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const mergeable = parseMergeable(payload.mergeable);
    if (number === null || mergeable === null) return null;
    return { operation: "pr_mergeable", number: prNumber(number), mergeable };
  },
  async verify(_runner, request, success) {
    // 時間変動 READ 値のため、直後の再読取との一致確認は行わない（CR-002）。
    // 単一読取の正規化結果（UNKNOWN を含む）と要求番号の一致のみを確認する。
    const req = request as Extract<GhToolRequest, { operation: "pr_mergeable" }>;
    const result = success as Extract<GhToolSuccess, { operation: "pr_mergeable" }>;
    return result.number === req.number;
  },
};

// ---------------------------------------------------------------------------
// pr_update（title と body の項目単位部分更新）
// ---------------------------------------------------------------------------

const prUpdateSpec: OperationSpec = {
  operation: "pr_update",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingNumberOutcome("pr_update");
    const unknown = checkUnknownFields(raw, ["operation", "number", "title", "body"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingNumberOutcome("pr_update");
    const number = positiveInt(raw.number);
    if (number === null) return invalidNumberOutcome();
    const title = raw.title === undefined ? null : str(raw.title);
    if (raw.title !== undefined && (title === null || title.length === 0)) {
      return {
        ok: false,
        error: { code: "invalid-field", field: "title", detail: "title must be a non-empty string when present" },
      };
    }
    const body = raw.body === undefined ? null : str(raw.body);
    if (raw.body !== undefined && body === null) {
      return {
        ok: false,
        error: { code: "invalid-field", field: "body", detail: "body must be a string when present" },
      };
    }
    if (title === null && body === null) {
      return {
        ok: false,
        error: {
          code: "empty-update",
          field: "title",
          detail: "specify at least one of title, body",
        },
      };
    }
    const request = {
      operation: "pr_update",
      number: prNumber(number),
    } as {
      operation: "pr_update";
      number: ReturnType<typeof prNumber>;
      title?: string;
      body?: string;
    };
    if (title !== null) request.title = title;
    if (body !== null) request.body = body;
    return { ok: true, request };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_update" }>;
    return {
      operation: "pr_update",
      args: { number: r.number, title: r.title, body: r.body },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !isAcceptedUrl(url)) return null;
    return { operation: "pr_update", number: prNumber(number), url };
  },
  async verify(runner, request, _success) {
    const req = request as Extract<GhToolRequest, { operation: "pr_update" }>;
    const pr = await readPr(runner, req.number);
    if (pr === null) return false;
    if (req.title !== undefined && str(pr.title) !== req.title) return false;
    if (req.body !== undefined && str(pr.body) !== req.body) return false;
    return true;
  },
};

/** PR 系操作のスペック一覧。 */
export const PR_OPERATION_SPECS: readonly OperationSpec[] = [
  prCreateSpec,
  prReadSpec,
  prMergeSpec,
  prChangedFilesSpec,
  prMergeableSpec,
  prUpdateSpec,
];
