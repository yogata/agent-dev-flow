// issue_close の終了前提検証（Case Issue）で読み取る機械受理の終了判定記録。
//
// - 判定記録の保存場所はメイン repo root の
//   `.agentdev/close-acceptance/issue-{NNNN}.json` に固定し、worktree コンテキスト
//   から呼び出された場合も main repo root 側へ解決する（呼出側 cwd に依存しない
//   単一の決定的解決規則。git-common-dir 導出。agentdev_jev 観測と同一の内部解決）。
// - Tool は呼出元の申告を受け取らず、自ら記録を読み取り、対象 Issue 番号と
//   判定対象版（close 時点の対象を識別する版情報。対象 Issue の updated_at）への
//   束縛と判定内容（変更後の正規完了判定に基づく機械受理の成立）を検証する。
// - 記録が存在しない、読み取れない、対象と一致しない、判定が不成立のいずれかの
//   場合は終了の副作用を実行せず構造化失敗を返す（fail-closed）。
//   記録不在を「正当な空（作成物ゼロ）」の根拠にしない。
// - 同一マシン上の呼出元による判定記録の偽造防止は契約の対象外であり、本
//   モジュールは読み取り検証のみを担う。


import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

const CLOSE_ACCEPTANCE_DIR = path.join(".agentdev", "close-acceptance");

/** 判定記録 I/O 注入。単体テストでは偽 I/O、実行時は node 実装を使用する。 */
export interface CloseAcceptanceIo {
  exists(absolutePath: string): boolean;
  readTextFile(absolutePath: string): string;
  /**
   * メイン repo root の .git ディレクトリ絶対パスを返す（worktree 内の cwd でも
   * メイン repo の .git を指す）。解決不能・リポジトリ不在時は null。
   */
  gitCommonDir(cwd: string): string | null;
}

/** 既定の I/O 実装（node fs + git rev-parse）。 */
export function defaultCloseAcceptanceIo(): CloseAcceptanceIo {
  return {
    exists: (p) => fs.existsSync(p),
    readTextFile: (p) => fs.readFileSync(p, "utf8"),
    gitCommonDir: (cwd) => {
      const r = spawnSync(
        "git",
        ["rev-parse", "--path-format=absolute", "--git-common-dir"],
        { cwd, encoding: "utf8" },
      );
      if (r.status !== 0) return null;
      const out = typeof r.stdout === "string" ? r.stdout.trim() : "";
      return out.length > 0 ? out : null;
    },
  };
}

/** 判定記録（Design 様式の4項目。様式の正はライフサイクル Design）。 */
export interface CloseAcceptanceRecord {
  /** 対象 Issue 番号。 */
  readonly issueNumber: number;
  /** 判定対象版（close 時点の対象を識別する版情報。対象 Issue の updated_at。過去の合格結果の再利用を拒否する束縛）。 */
  readonly targetRevision: string;
  /** 判定生成時刻（ISO 8601）。 */
  readonly generatedAt: string;
  /** 判定内容（変更後の正規完了判定に基づく機械受理の成立: 必須完了条件の評価結果。旧台帳照合の結果は含まない）。 */
  readonly accepted: boolean;
}

/** 判定記録のファイル名（対象 Issue 番号はローカルIssue物理名と同一の4桁ゼロ埋め）。 */
export function closeAcceptanceRecordFileName(issueNumber: number): string {
  return `issue-${String(issueNumber).padStart(4, "0")}.json`;
}

/** 判定記録の保存場所（メイン repo root 基準の決定的パス）。 */
export function resolveCloseAcceptanceRecordPath(
  mainRepoRoot: string,
  issueNumber: number,
): string {
  return path.join(
    mainRepoRoot.replace(/[\\/]+$/, ""),
    CLOSE_ACCEPTANCE_DIR,
    closeAcceptanceRecordFileName(issueNumber),
  );
}

/**
 * メイン repo root の解決（worktree-context 独立）。git-common-dir（メイン repo の
 * .git）の親ディレクトリをメイン repo root とする。worktree 内の cwd から呼んでも
 * メイン repo root を返す。
 */
export function resolveMainRepoRoot(
  io: CloseAcceptanceIo,
  cwd: string,
): { ok: true; root: string } | { ok: false; detail: string } {
  const commonDir = io.gitCommonDir(cwd);
  if (commonDir === null || !path.isAbsolute(commonDir.trim())) {
    return {
      ok: false,
      detail:
        "the main repo root could not be resolved (git rev-parse --git-common-dir failed); " +
        "the close acceptance record location is fixed to the main repo root",
    };
  }
  const root = path.dirname(commonDir.trim());
  if (root === commonDir) {
    return {
      ok: false,
      detail: `could not derive the main repo root from the git common dir: ${commonDir}`,
    };
  }
  return { ok: true, root };
}

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * 判定記録テキストの様式検証。Design 様式の4項目（対象 Issue 番号、判定対象版、
 * 判定生成時刻、判定内容）を必須とし、型不正・必須欠落は様式不正として拒否する。
 * 記録の追加項目（機械工程の報告詳細等）は様式束縛の対象外として保持する。
 */
export function parseCloseAcceptanceRecord(
  text: string,
): { ok: true; record: CloseAcceptanceRecord } | { ok: false; detail: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return {
      ok: false,
      detail: `the close acceptance record is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, detail: "the close acceptance record must be a JSON object" };
  }
  const v = parsed as Record<string, unknown>;
  const issueNumber = v.issueNumber;
  if (typeof issueNumber !== "number" || !Number.isInteger(issueNumber) || issueNumber <= 0) {
    return {
      ok: false,
      detail: "the close acceptance record requires a positive integer issueNumber",
    };
  }
  const targetRevision = v.targetRevision;
  if (typeof targetRevision !== "string" || targetRevision.trim().length === 0) {
    return {
      ok: false,
      detail: "the close acceptance record requires a non-empty targetRevision",
    };
  }
  const generatedAt = v.generatedAt;
  if (typeof generatedAt !== "string" || !ISO_8601.test(generatedAt) || !Number.isFinite(Date.parse(generatedAt))) {
    return {
      ok: false,
      detail:
        "the close acceptance record requires a generatedAt in ISO 8601 format (e.g. 2026-11-05T00:00:00Z)",
    };
  }
  if (typeof v.accepted !== "boolean") {
    return {
      ok: false,
      detail:
        "the close acceptance record requires a boolean accepted " +
        "(the judgment content: the evaluation result of the mandatory completion criteria; " +
        "a legacy verification-resources ledger result is not part of the format)",
    };
  }
  return {
    ok: true,
    record: { issueNumber, targetRevision, generatedAt, accepted: v.accepted },
  };
}

export type CloseAcceptanceVerification =
  | { readonly ok: true; readonly record: CloseAcceptanceRecord }
  | {
      readonly ok: false;
      /** path-unresolvable: main repo root 解決不能。verification-incomplete: その他の拒否。 */
      readonly kind: "path-unresolvable" | "verification-incomplete";
      readonly detail: string;
    };

/**
 * issue_close の終了前提検証。対象 Issue の現在版（updated_at）と判定記録を照合し、
 * 記録不在・読取不能・様式不正・対象不一致・対象版不一致（過去の合格結果の再利用を
 * 含む）・判定不成立のいずれかを拒否する。成立時のみ ok を返す。
 */
export function verifyCloseAcceptanceForClose(
  io: CloseAcceptanceIo,
  cwd: string,
  issueNumber: number,
  currentRevision: string,
): CloseAcceptanceVerification {
  const root = resolveMainRepoRoot(io, cwd);
  if (!root.ok) {
    return { ok: false, kind: "path-unresolvable", detail: root.detail };
  }
  const recordPath = resolveCloseAcceptanceRecordPath(root.root, issueNumber);
  if (!io.exists(recordPath)) {
    return {
      ok: false,
      kind: "verification-incomplete",
      detail:
        `the close acceptance record is missing: ${recordPath}; ` +
        `issue_close of a case issue requires the mechanical acceptance record ` +
        `generated by the case-close mechanical steps`,
    };
  }
  let text: string;
  try {
    text = io.readTextFile(recordPath);
  } catch (e) {
    return {
      ok: false,
      kind: "verification-incomplete",
      detail: `the close acceptance record could not be read: ${recordPath} ` +
        `(${e instanceof Error ? e.message : String(e)})`,
    };
  }
  const parsed = parseCloseAcceptanceRecord(text);
  if (!parsed.ok) {
    return {
      ok: false,
      kind: "verification-incomplete",
      detail: `${parsed.detail} (${recordPath})`,
    };
  }
  const record = parsed.record;
  if (record.issueNumber !== issueNumber) {
    return {
      ok: false,
      kind: "verification-incomplete",
      detail:
        `the close acceptance record targets issue ${record.issueNumber}, not the requested issue ${issueNumber} (${recordPath})`,
    };
  }
  if (record.targetRevision !== currentRevision) {
    return {
      ok: false,
      kind: "verification-incomplete",
      detail:
        `the close acceptance record targets revision ${record.targetRevision}, ` +
        `but the current issue revision is ${currentRevision}; ` +
        `reusing a past acceptance result is refused — re-run the case-close mechanical steps (${recordPath})`,
    };
  }
  if (record.accepted !== true) {
    return {
      ok: false,
      kind: "verification-incomplete",
      detail:
        `the close acceptance record exists but the judgment is not accepted (accepted=false) (${recordPath})`,
    };
  }
  return { ok: true, record };
}
