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
//
// 引数の型解析（path/filakePath 表記差吸収・欠落/非文字列の undefined 正直返し）は
// 共通部（agentdev-textlint-guard lib/edit-semantics.ts・PR 4043 で切り出し済み）を
// 参照して利用する（Case #4087・RU-0295 収束。解析結果の消費方法〔検査不能への変換・
// SenpiEditOperation 正準化・oldString/newString 欠落の空文字列正準化・replaceAll
// 無効型の黙認〕が本モジュールの固有条件）。
import {
  parseApplyPatchToolArgs,
  parseEditToolArgs,
  parseWriteToolArgs,
} from "../../../../opencode/plugins/agentdev-textlint-guard/lib/edit-semantics.ts";

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
  if (semantics === "patch-apply") {
    // 消費方法（Senpi 固有条件）: 共通解析の undefined を検査不能へ変換する。
    const patchText = parseApplyPatchToolArgs(args).patchText;
    if (patchText === undefined) {
      return { ok: false, detail: "patch-apply requires a string patch text" };
    }
    return { ok: true, operation: { kind: "patch-apply", patchText } };
  }
  if (semantics === "full-replace") {
    const write = parseWriteToolArgs(args);
    // 消費方法（Senpi 固有条件）: filePath・content の欠落/非文字列は検査不能へ変換する。
    if (write.filePath === undefined || write.content === undefined) {
      return {
        ok: false,
        detail:
          write.filePath === undefined
            ? "target path is missing or not a string"
            : "full-replace requires a string content",
      };
    }
    return { ok: true, operation: { kind: "full-replace", filePath: write.filePath, content: write.content } };
  }
  const edit = parseEditToolArgs(args);
  // 消費方法（Senpi 固有条件）: oldString/newString の欠落・非文字列は空文字列へ正準化し、
  // replaceAll の無効型は false へ正準化する。filePath の欠落・非文字列・空のみ検査不能へ変換する。
  if (edit.filePath === undefined) {
    return { ok: false, detail: "target path is missing or not a string" };
  }
  return {
    ok: true,
    operation: {
      kind: "partial-replace",
      filePath: edit.filePath,
      oldString: edit.oldString ?? "",
      newString: edit.newString ?? "",
      replaceAll: edit.replaceAll ?? false,
    },
  };
}
