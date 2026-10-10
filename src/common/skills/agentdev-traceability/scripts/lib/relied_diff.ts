// 依拠版に基づく差分・変更影響・増分更新の決定論的エンジン
// （agentdev-traceability Design「impact 拡張（差分候補）」節の実装）。
//
// - 既存の下流成果物が依拠した上流版（依拠版）と現行上流版の比較に基づき、
//   影響候補を更新必要（update）・更新不要（up-to-date）・作成（create）・
//   未確認（unverified）の4区分と根拠（basis）で分類する
// - Git の変更事実（blob hash、name-status、中間変更履歴）と内容・意味上の
//   変更を区別する。Git の変更事実は意味変更の確定ではなく、意味判断は
//   影響評価に必要な箇所に限定して呼出側が行う
// - 変更起点は、正味差分がゼロでも中間変更があれば後続へ引き継ぐ
//   （propagationRequired。中間版に依拠する下流成果物への影響を無条件に除外しない）
// - 比較基準（依拠版）を特定できない場合は unverified を返し、
//   「影響なし」や「完了」の判定を出さない（fullyPropagated は undetermined）
// - 本エンジンは Git コマンド結果（事実収集）と分類（純関数）を分離する。
//   分類は coverage・impact・check と同様に宣言走査に依存しない
//   （明示対応が空でも無影響の証明として扱わない）

import { execFileSync } from "node:child_process";

export type PathChangeKind =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "renamed-from"
  | "unchanged";

export type ImpactClassification = "update" | "up-to-date" | "create" | "unverified";

/** 1パス分の Git 事実（依拠版・現行版の blob、中間変更履歴、name-status）。 */
export interface PathGitFacts {
  readonly path: string;
  /** 依拠版時点の blob hash。当該版にパスが存在しない場合は null。 */
  readonly reliedBlob: string | null;
  /** 現行版時点の blob hash。当該版にパスが存在しない場合は null。 */
  readonly headBlob: string | null;
  /** 依拠版以降（依拠版..現行版）の間でいずれかのコミットが当該パスを触れた。 */
  readonly intermediateTouched: boolean;
  readonly changeKind: PathChangeKind;
  /** renamed / renamed-from 時の対パス（renamed は移動元、renamed-from は移動先）。 */
  readonly renamePeer?: string;
}

/** 1パス分の影響分類結果。 */
export interface PathImpact {
  readonly path: string;
  readonly changeKind: PathChangeKind;
  readonly classification: ImpactClassification;
  /** 分類の判断根拠（Git 事実の具体的な対応付け）。 */
  readonly basis: string;
  /**
   * 変更起点の後続伝播対象。正味差分ゼロでも中間変更があれば true
   * （中間工程で更新不要と評価されても起点を後続工程へ引き継ぐ）。
   */
  readonly propagationRequired: boolean;
  readonly reliedBlob: string | null;
  readonly headBlob: string | null;
  readonly intermediateTouched: boolean;
  readonly renamePeer?: string;
}

/** 下流成果物の存在確認結果（作成分類の入力）。 */
export interface DownstreamStatus {
  readonly path: string;
  /** 現行版に下流成果物が存在する。 */
  readonly exists: boolean;
  /** 不在時は create（作成候補）。旧下流成果物との比較を要求しない。 */
  readonly classification: ImpactClassification | null;
  readonly basis: string;
}

/** 再利用する検証証拠の上流整合確認結果。 */
export interface EvidenceIntegration {
  readonly status: "confirmed" | "stale" | "unconfirmed";
  /** 証拠対象版と現行版の blob が一致するパス。 */
  readonly freshPaths: readonly string[];
  /** 証拠対象版と現行版の blob が異なるパス（再検証要求）。 */
  readonly stalePaths: readonly string[];
  readonly note: string;
}

export interface ReliedDiffReport {
  readonly mode: "relied-diff";
  /** 依拠版コミット（解決済み）。比較基準を特定できない場合は null。 */
  readonly reliedCommit: string | null;
  readonly headCommit: string;
  /** 比較範囲（依拠版解決時は "<relied>..headCommit"。未解決時は "unresolved"）。 */
  readonly comparisonRange: string;
  /** 代替整合確認の判断根拠（呼出側から受領した記録。未受領時は null）。 */
  readonly basisNote: string | null;
  readonly impacts: readonly PathImpact[];
  readonly downstream: DownstreamStatus | null;
  readonly evidence: EvidenceIntegration;
  /**
   * 個別工程の正式確定と、影響する必要な全工程への変更反映完了を別に判定する出力。
   * update または create 必要な候補が残れば no、unverified が残れば undetermined、
   * up-to-date（create 不在）のみで yes。
   */
  readonly fullyPropagated: "yes" | "no" | "undetermined";
  readonly emptyResult: boolean;
  readonly note?: string;
}

export const EVIDENCE_REUSE_NOTE =
  "未変更部分と再利用する検証証拠も、新しい上流への整合を確認せずに合格としない。" +
  "freshPaths は blob 一致の機械的事実であり、証拠が対象とした工程・入力と現行の一致は呼出側の意味判断である。";

export const EMPTY_RELIED_DIFF_NOTE =
  "空結果は「影響なし」の証明ではない。比較範囲・対象パスの指定漏れ、依拠版の解決不能等の別原因の可能性を残す。";

function toForwardSlash(value: string): string {
  return value.replaceAll("\\", "/");
}

/** git コマンドを実行する。実行不能（git 不在・非 git リポジトリ等）は ok: false で返す。 */
export function runGit(
  root: string,
  args: readonly string[],
): { ok: true; stdout: string } | { ok: false; reason: string } {
  try {
    const stdout = execFileSync("git", ["-C", root, ...args], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, stdout };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: message };
  }
}

/** 参照をコミットハッシュへ解決する。解決不能（存在しない参照等）は null。 */
export function resolveCommit(root: string, ref: string): string | null {
  const result = runGit(root, ["rev-parse", "--verify", `${ref}^{commit}`]);
  if (!result.ok) return null;
  const commit = result.stdout.trim();
  return commit.length > 0 ? commit : null;
}

/** 指定版・指定パスの blob hash。当該版にパスが存在しない場合は null。 */
export function blobAt(root: string, rev: string, path: string): string | null {
  const result = runGit(root, ["rev-parse", `${rev}:${path}`]);
  if (!result.ok) return null;
  const blob = result.stdout.trim();
  return blob.length > 0 ? blob : null;
}

/** from..to の間でいずれかのコミットが触れたパス集合（git log --name-only）。 */
export function listTouchedPaths(root: string, from: string, to: string): ReadonlySet<string> {
  const result = runGit(root, ["log", "--format=", "--name-only", `${from}..${to}`]);
  const touched = new Set<string>();
  if (!result.ok) return touched;
  for (const line of result.stdout.split(/\r?\n/)) {
    const p = line.trim();
    if (p.length > 0) touched.add(toForwardSlash(p));
  }
  return touched;
}

/**
 * from と to の name-status 差分（git diff --name-status -M）を解析する。
 * 戻り値のキーはパス、値は changeKind と rename 対パス。列挙順は git 出力順であり、
 * 候補集合の決定性は呼出側のソートで保証する。
 */
export function parseNameStatus(
  stdout: string,
): readonly { path: string; kind: PathChangeKind; peer?: string }[] {
  const entries: { path: string; kind: PathChangeKind; peer?: string }[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (line.trim().length === 0) continue;
    const parts = line.split("\t");
    const status = parts[0] ?? "";
    if (status.startsWith("R") || status.startsWith("C")) {
      // R100\t<old>\t<new> / C<score>\t<old>\t<new>
      const oldPath = toForwardSlash(parts[1] ?? "");
      const newPath = toForwardSlash(parts[2] ?? "");
      if (newPath.length > 0) entries.push({ path: newPath, kind: "renamed", peer: oldPath });
      if (oldPath.length > 0) entries.push({ path: oldPath, kind: "renamed-from", peer: newPath });
      continue;
    }
    const path = toForwardSlash(parts[1] ?? "");
    if (path.length === 0) continue;
    if (status === "A") entries.push({ path, kind: "added" });
    else if (status === "M") entries.push({ path, kind: "modified" });
    else if (status === "D") entries.push({ path, kind: "deleted" });
    else if (status === "T") entries.push({ path, kind: "modified" });
    else entries.push({ path, kind: "modified" });
  }
  return entries;
}

/** from と to の name-status 差分を取得する。実行不能は null。 */
export function diffNameStatus(
  root: string,
  from: string,
  to: string,
  paths?: readonly string[],
): readonly { path: string; kind: PathChangeKind; peer?: string }[] | null {
  const args = ["diff", "--name-status", "-M", from, to];
  if (paths && paths.length > 0) args.push("--", ...paths);
  const result = runGit(root, args);
  if (!result.ok) return null;
  return parseNameStatus(result.stdout);
}

/**
 * 1パス分の Git 事実から影響分類を決定する純関数。
 *
 * 決定表（依拠版 R・現行版 H・パス p）:
 * - R 不在 / H 存在: unverified（依拠版に存在しない上流。下流の作成要否は採用規約・
 *   合意対象範囲の確認が必要。根拠なしに影響なし・完了としない）
 * - R 存在 / H 不在: update（上流の削除・移動元。旧版から内容を読み下流の対応処理を確認）
 * - 両方存在・blob 同一・中間変更なし: up-to-date
 * - 両方存在・blob 同一・中間変更あり: up-to-date + propagationRequired=true
 *   （正味差分ゼロでも中間版に依拠する下流への影響を無条件に除外しない）
 * - 両方存在・blob 異なる: update
 */
export function classifyPathImpact(facts: PathGitFacts): PathImpact | null {
  const { path, reliedBlob, headBlob, intermediateTouched, changeKind, renamePeer } = facts;
  const base = {
    path,
    changeKind,
    propagationRequired: intermediateTouched,
    reliedBlob,
    headBlob,
    intermediateTouched,
    ...(renamePeer !== undefined ? { renamePeer } : {}),
  };
  if (reliedBlob === null && headBlob === null) return null;
  if (reliedBlob === null) {
    return {
      ...base,
      classification: "unverified",
      basis:
        "依拠版に上流パスが存在しない（依拠版以降に追加された上流）。" +
        "下流の作成要否は採用済み規約または合意済み対象範囲の確認が必要であり、" +
        "根拠なしに影響なし・完了としない",
      propagationRequired: false,
    };
  }
  if (headBlob === null) {
    return {
      ...base,
      classification: "update",
      basis:
        "現行版に上流パスが存在しない（削除・移動元）。削除・移動元は依拠版から内容を読み、" +
        "下流の対応処理（参照先更新・後継への追従）を確認する必要がある",
    };
  }
  if (reliedBlob !== headBlob) {
    return {
      ...base,
      classification: "update",
      basis: `依拠版 blob（${reliedBlob.slice(0, 12)}）と現行版 blob（${headBlob.slice(0, 12)}）が異なる内容差分`,
    };
  }
  if (intermediateTouched) {
    return {
      ...base,
      classification: "up-to-date",
      basis:
        "依拠版と現行版の blob は一致するが、依拠版以降に中間変更がある。" +
        "変更起点は後続工程へ引き継ぐ（正味差分ゼロでも中間版に依拠する下流への影響を無条件に除外しない）",
      propagationRequired: true,
    };
  }
  return {
    ...base,
    classification: "up-to-date",
    basis: "依拠版と現行版の blob が一致し、依拠版以降の中間変更もない",
    propagationRequired: false,
  };
}

/** 下流成果物の存在確認から作成分類を決定する純関数。 */
export function classifyDownstream(path: string, headBlob: string | null): DownstreamStatus {
  if (headBlob !== null) {
    return {
      path,
      exists: true,
      classification: null,
      basis: "現行版に下流成果物が存在する",
    };
  }
  return {
    path,
    exists: false,
    classification: "create",
    basis:
      "現行版に下流成果物が存在しない（作成候補）。採用済み規約または合意済み対象範囲から" +
      "必要と確認された場合の作成対象であり、存在しない旧下流成果物との比較を要求しない",
  };
}

/**
 * 再利用する検証証拠の上流整合を確認する純関数。
 * 証拠対象版（evidenceCommit）時点の blob と現行版の blob を比較する。
 * 証拠対象版が特定できない場合は unconfirmed（整合未確認。合格の根拠にしない）。
 */
export function classifyEvidenceIntegration(
  entries: readonly { path: string; evidenceBlob: string | null; headBlob: string | null }[],
  evidenceResolved: boolean,
): EvidenceIntegration {
  if (!evidenceResolved) {
    return {
      status: "unconfirmed",
      freshPaths: [],
      stalePaths: [],
      note: EVIDENCE_REUSE_NOTE + " 証拠対象版が特定できないため上流整合は未確認である。",
    };
  }
  const freshPaths: string[] = [];
  const stalePaths: string[] = [];
  for (const entry of entries) {
    if (entry.evidenceBlob !== null && entry.headBlob !== null && entry.evidenceBlob === entry.headBlob) {
      freshPaths.push(entry.path);
    } else {
      stalePaths.push(entry.path);
    }
  }
  freshPaths.sort();
  stalePaths.sort();
  return {
    status: stalePaths.length > 0 ? "stale" : "confirmed",
    freshPaths,
    stalePaths,
    note: EVIDENCE_REUSE_NOTE,
  };
}

/**
 * 個別工程の正式確定（各候補の分類）と、影響する必要な全工程への変更反映完了を
 * 別に判定する純関数。
 * update または create 必要な候補が残れば no、unverified が残れば undetermined。
 * 根拠のない「完了」判定を機械的に出さないため、unverified は判定不能として扱う。
 */
export function judgePropagationCompletion(
  impacts: readonly PathImpact[],
  downstream: DownstreamStatus | null,
): "yes" | "no" | "undetermined" {
  if (impacts.some((i) => i.classification === "unverified")) return "undetermined";
  if (
    impacts.some((i) => i.classification === "update") ||
    downstream?.classification === "create"
  ) {
    return "no";
  }
  return "yes";
}
