// Senpi 編集操作の意味論解釈（ホスト接続側の編集意味論の解釈集約点）。
//
// マルチホスト正本モデル Design「guard 編集解釈の分離」節に
// 従い、Senpi ホストの編集操作（write/edit/patch 等の対応編集）の入力を、
// 編集意味論種別と意味論パラメータとして解釈して、guard 共通判定
//（src/common/guards/distribution-boundary/）が消費する中間表現へ正準化する。
//
// 入力キーの機械的な変更だけで編集意味論を同一と扱わない（guard 編集解釈の分離）。
// 本解釈レイヤは tool 名が決定する編集意味論種別が要求する意味論パラメータのみを
// 消費する。他の意味論種別のキー（例: full-replace が要求する content）は
// 別の意味論として消費されず、要求パラメータの欠落は検査不能（fail-closed）
// として返す。
//
// Pure: no fs/path/I/O imports; same input => same output.
//
// Senpi 実ランタイムの tool 名・引数形式は Wave 3 の全組合せ試験で確定する。
// 変更点は本モジュールの対応表と解釈のみに局所化する。

export type EditOperationKind =
  | "full-replace"
  | "partial-replace"
  | "patch-apply";

/** tool 名 → 編集意味論種別。対応は本解釈レイヤが単一所有する。 */
const TOOL_SEMANTICS: Readonly<Record<string, EditOperationKind>> = {
  write: "full-replace",
  edit: "partial-replace",
  apply_patch: "patch-apply",
};

export type SenpiEditOperation =
  | {
      readonly kind: "full-replace";
      readonly filePath: string;
      readonly content: string;
    }
  | {
      readonly kind: "partial-replace";
      readonly filePath: string;
      readonly oldString: string;
      readonly newString: string;
      readonly replaceAll: boolean;
    }
  | {
      readonly kind: "patch-apply";
      readonly patchText: string;
    };

export type InterpretationResult =
  | { readonly ok: true; readonly operation: SenpiEditOperation }
  | { readonly ok: false; readonly detail: string };

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

/**
 * 対象パスの意味論パラメータ解釈。`path` と `filePath` は同一パラメータ
 *（対象パス）の表記差であり、`path` を優先する。対象パスが欠落・非 string・
 * 空なら検査不能。
 */
function interpretTargetPath(args: Record<string, unknown>): { ok: true; filePath: string } | { ok: false; detail: string } {
  const raw = args["path"] ?? args["filePath"];
  if (!isString(raw)) return { ok: false, detail: "target path is missing or not a string" };
  if (raw.length === 0) return { ok: false, detail: "target path is empty" };
  return { ok: true, filePath: raw };
}

/**
 * Senpi 編集操作の入力を編集意味論へ解釈する。
 *
 * 検査不能（ok: false）は呼出側で fail-closed の拒否として扱う。
 * 意味論種別が要求しないキーは意味論パラメータとして消費されない

 */
export function interpretSenpiEditOperation(
  tool: string,
  args: Record<string, unknown>,
): InterpretationResult {
  const semantics = TOOL_SEMANTICS[tool];
  if (semantics === undefined) {
    return { ok: false, detail: `unknown edit operation tool name (${tool})` };
  }
  const target = interpretTargetPath(args);
  if (semantics === "patch-apply") {
    const patchText = args["patchText"];
    if (!isString(patchText)) {
      return { ok: false, detail: "patch-apply requires a string patch text" };
    }
    return { ok: true, operation: { kind: "patch-apply", patchText } };
  }
  if (!target.ok) {
    return { ok: false, detail: target.detail };
  }
  if (semantics === "full-replace") {
    const content = args["content"];
    if (!isString(content)) {
      return { ok: false, detail: "full-replace requires a string content" };
    }
    return { ok: true, operation: { kind: "full-replace", filePath: target.filePath, content } };
  }
  const oldString = args["oldString"];
  const newString = args["newString"];
  const replaceAll = args["replaceAll"];
  return {
    ok: true,
    operation: {
      kind: "partial-replace",
      filePath: target.filePath,
      oldString: isString(oldString) ? oldString : "",
      newString: isString(newString) ? newString : "",
      replaceAll: isBoolean(replaceAll) ? replaceAll : false,
    },
  };
}
