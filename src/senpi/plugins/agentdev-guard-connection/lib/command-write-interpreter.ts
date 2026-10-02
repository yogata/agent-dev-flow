// Senpi 生の書込み経路（コマンド実行系）の入力解釈。
//
// コマンド実行系の引数からコマンド文字列という意味論パラメータを解釈する。
// 抽出したコマンド文字列は呼出側で guard 共通判定
//（src/common/guards/gh-write/gh-command-detector.ts）へ接続される。
// コマンド文字列を検証不能なら検査不能を返し、呼出側は fail-closed として
// 扱う（検査不能を成功扱いしない）。
//
// Pure: no fs/path/I/O imports; same input => same output.

export type CommandInterpretation =
  | { readonly ok: true; readonly command: string }
  | { readonly ok: false; readonly detail: string };

/**
 * コマンド実行系の引数からコマンド文字列を解釈する。
 * 欠落・非 string・空文字列は検証不能（fail-closed）。
 */
export function interpretSenpiRawWriteCommand(
  args: Record<string, unknown>,
): CommandInterpretation {
  const command = args["command"];
  if (typeof command !== "string") {
    return { ok: false, detail: "command argument is missing or not a string" };
  }
  if (command.length === 0) {
    return { ok: false, detail: "command argument is empty" };
  }
  return { ok: true, command };
}
