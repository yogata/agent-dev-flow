// Release 系操作（3 操作）のスペック実装。
//
// 各スペックは操作ごとの差分（入力検証、runner 要求の組立て、応答解釈、
// 読み戻し照合）のみを所有する。fail-closed の制御順序は engine.ts が所有する。
// 入力契約に公開モード（draft の解除、publish 相当フィールド）は存在せず、
// 契約外の公開指定フィールドを含む要求は副作用発生前に unknown-field として
// 拒否される（Design custom-tool-contracts.md「Release 操作」）。


import type { GhToolRequest, GhToolSuccess, ReleaseListItem } from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";
import type { OperationSpec, ValidateOutcome } from "./engine.ts";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

// 出力 URL: GitHub 実装は https URL。Release 操作は GitHub 接続専用のため
// ローカル実装の絶対パス識別子は生じない。
function isHttpUrl(v: string): boolean {
  return /^https:\/\//.test(v);
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

function releaseReadRunnerRequest(tagName: string): GhRunnerRequest {
  return { operation: "release_read", args: { tagName } };
}

/** runner 応答から正規化済み Release 読み取り結果を取り出す（照合用）。 */
function readRelease(
  runner: GhRunner,
  tagName: string,
): Promise<Record<string, unknown> | null> {
  return runner.run(releaseReadRunnerRequest(tagName)).then((reply) => {
    if (!reply.ok || !isRecord(reply.payload)) return null;
    if (str(reply.payload.tagName) !== tagName) return null;
    return reply.payload;
  });
}

// ---------------------------------------------------------------------------
// release_create（草稿作成。公開モードは入力契約に存在しない）
// ---------------------------------------------------------------------------

const releaseCreateSpec: OperationSpec = {
  operation: "release_create",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) {
      return {
        ok: false,
        error: { code: "missing-field", field: "tagName", detail: "required field 'tagName' is missing for release_create" },
      };
    }
    const unknown = checkUnknownFields(raw, [
      "operation",
      "tagName",
      "title",
      "body",
      "prerelease",
    ]);
    if (unknown !== null) return unknown;
    for (const field of ["tagName", "title", "body", "prerelease"] as const) {
      if (raw[field] === undefined) {
        return {
          ok: false,
          error: {
            code: "missing-field",
            field,
            detail: `required field '${field}' is missing for release_create`,
          },
        };
      }
    }
    const tagName = str(raw.tagName);
    const title = str(raw.title);
    const body = str(raw.body);
    if (tagName === null || tagName.length === 0) {
      return { ok: false, error: { code: "invalid-field", field: "tagName", detail: "tagName must be a non-empty string" } };
    }
    if (title === null || title.length === 0) {
      return { ok: false, error: { code: "invalid-field", field: "title", detail: "title must be a non-empty string" } };
    }
    if (body === null) {
      return { ok: false, error: { code: "invalid-field", field: "body", detail: "body must be a string" } };
    }
    if (typeof raw.prerelease !== "boolean") {
      return { ok: false, error: { code: "invalid-field", field: "prerelease", detail: "prerelease must be a boolean" } };
    }
    return {
      ok: true,
      request: { operation: "release_create", tagName, title, body, prerelease: raw.prerelease },
    };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "release_create" }>;
    return {
      operation: "release_create",
      args: { tagName: r.tagName, title: r.title, body: r.body, prerelease: r.prerelease },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const tagName = str(payload.tagName);
    const url = str(payload.url);
    if (payload.draft !== true) return null;
    if (typeof payload.prerelease !== "boolean") return null;
    if (tagName === null || tagName.length === 0 || url === null || !isHttpUrl(url)) return null;
    return {
      operation: "release_create",
      tagName,
      url,
      draft: true,
      prerelease: payload.prerelease,
    };
  },
  async verify(runner, request, _success) {
    const req = request as Extract<GhToolRequest, { operation: "release_create" }>;
    const release = await readRelease(runner, req.tagName);
    if (release === null) return false;
    if (release.draft !== true) return false;
    return release.prerelease === req.prerelease;
  },
};

// ---------------------------------------------------------------------------
// release_list（一覧読取。版タグと Release の対応確認用）
// ---------------------------------------------------------------------------

function parseReleaseListItem(v: unknown): ReleaseListItem | null {
  if (!isRecord(v)) return null;
  const tagName = str(v.tagName);
  const title = str(v.title);
  const url = str(v.url);
  if (typeof v.draft !== "boolean") return null;
  if (typeof v.prerelease !== "boolean") return null;
  if (tagName === null || tagName.length === 0) return null;
  if (title === null) return null;
  if (url === null || !isHttpUrl(url)) return null;
  return { tagName, title, draft: v.draft, prerelease: v.prerelease, url };
}

const releaseListSpec: OperationSpec = {
  operation: "release_list",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) {
      return {
        ok: false,
        error: { code: "missing-field", field: "operation", detail: "request must be an object with an operation field" },
      };
    }
    const unknown = checkUnknownFields(raw, ["operation"]);
    if (unknown !== null) return unknown;
    return { ok: true, request: { operation: "release_list" } };
  },
  buildRequest(): GhRunnerRequest {
    return { operation: "release_list", args: {} };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    if (!Array.isArray(payload.releases)) return null;
    const releases: ReleaseListItem[] = [];
    for (const entry of payload.releases) {
      const item = parseReleaseListItem(entry);
      if (item === null) return null;
      releases.push(item);
    }
    return { operation: "release_list", releases };
  },
  async verify() {
    // 一覧読取は取得時点の正規化結果を返す（READ 操作の応答自己整合は
    // parseSuccess の構造確認による）。時間変動に追従した再読取一致は要求しない。
    return true;
  },
};

// ---------------------------------------------------------------------------
// release_read（読み戻し。対応する Release が存在しない場合は runner が失敗）
// ---------------------------------------------------------------------------

const releaseReadSpec: OperationSpec = {
  operation: "release_read",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) {
      return {
        ok: false,
        error: { code: "missing-field", field: "tagName", detail: "required field 'tagName' is missing for release_read" },
      };
    }
    const unknown = checkUnknownFields(raw, ["operation", "tagName"]);
    if (unknown !== null) return unknown;
    if (raw.tagName === undefined) {
      return {
        ok: false,
        error: { code: "missing-field", field: "tagName", detail: "required field 'tagName' is missing for release_read" },
      };
    }
    const tagName = str(raw.tagName);
    if (tagName === null || tagName.length === 0) {
      return { ok: false, error: { code: "invalid-field", field: "tagName", detail: "tagName must be a non-empty string" } };
    }
    return { ok: true, request: { operation: "release_read", tagName } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "release_read" }>;
    return releaseReadRunnerRequest(r.tagName);
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const tagName = str(payload.tagName);
    const title = str(payload.title);
    const body = str(payload.body);
    const url = str(payload.url);
    if (typeof payload.draft !== "boolean") return null;
    if (typeof payload.prerelease !== "boolean") return null;
    if (tagName === null || tagName.length === 0) return null;
    if (title === null || body === null) return null;
    if (url === null || !isHttpUrl(url)) return null;
    return {
      operation: "release_read",
      tagName,
      title,
      body,
      draft: payload.draft,
      prerelease: payload.prerelease,
      url,
    };
  },
  async verify(runner, _request, success) {
    const read = success as Extract<GhToolSuccess, { operation: "release_read" }>;
    const release = await readRelease(runner, read.tagName);
    if (release === null) return false;
    if (release.title !== read.title) return false;
    if (release.draft !== read.draft) return false;
    return release.prerelease === read.prerelease;
  },
};

/** Release 系操作のスペック一覧。 */
export const RELEASE_OPERATION_SPECS: readonly OperationSpec[] = [
  releaseCreateSpec,
  releaseListSpec,
  releaseReadSpec,
];
