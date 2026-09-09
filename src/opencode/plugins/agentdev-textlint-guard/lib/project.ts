// ADF-COVERS(implementation): REQ-053-025, REQ-053-027, REQ-053-033
// agentdev-textlint-guard 共通実行基盤: プロジェクト解決。
//
// OpenCode 初期化入力の input.worktree を第一候補とし、現行 API と既存 Plugin 契約で
// 確認できるプロジェクト情報だけを代替候補にする。Plugin の配置場所と import.meta.url
// をプロジェクトルートとして使わない。単独実行入口も呼出側が特定したプロジェクト情報を
// 同じ解決処理へ渡す。

import * as path from "node:path";

/** OpenCode Plugin の初期化入力（本 Plugin が消費するフィールドのみ）。 */
export interface ProjectRootInput {
  readonly worktree?: unknown;
  readonly directory?: unknown;
  readonly project?: unknown;
}

export type ProjectRootResolution =
  | { readonly ok: true; readonly root: string }
  | { readonly ok: false; readonly reason: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * プロジェクトルートの解決。候補順:
 * 1. input.worktree（OpenCode Plugin 初期化入力の第一候補）
 * 2. input.directory
 * 3. input.project.worktree（既存 Plugin 契約で確認できる情報）
 *
 * いずれも絶対パス化した時点で存在チェックは行わない（存在確認は呼出側の
 * ファイル読込失敗が fail-closed で担保する）。候補が1つも確定できない場合のみ
 * 解決失敗とする（検査不能 = 拒否対象）。
 */
export function resolveProjectRoot(input: ProjectRootInput): ProjectRootResolution {
  if (isNonEmptyString(input.worktree)) {
    return { ok: true, root: path.resolve(input.worktree) };
  }
  if (isNonEmptyString(input.directory)) {
    return { ok: true, root: path.resolve(input.directory) };
  }
  if (
    typeof input.project === "object" &&
    input.project !== null &&
    isNonEmptyString((input.project as { worktree?: unknown }).worktree)
  ) {
    return { ok: true, root: path.resolve((input.project as { worktree: string }).worktree) };
  }
  return {
    ok: false,
    reason:
      "cannot resolve the project root (expected input.worktree, input.directory, or input.project.worktree from the OpenCode plugin initialization input)",
  };
}

/**
 * ルート相対パスの安全性分類。
 * - ルート内の相対パス（"docs/a.md"）は in-root
 * - ルート外（"..", 絶対パス指定による外部）は outside-root
 * - 区分不能（区切り混在の解釈不能等）は unsafe
 */
export type RelativePathClass = "in-root" | "outside-root" | "unsafe";

export function classifyRelativePath(root: string, absolutePath: string): RelativePathClass {
  const rel = path.relative(path.resolve(root), path.resolve(absolutePath));
  if (rel === "") return "in-root";
  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
    return "outside-root";
  }
  // Windows でドライブ違い等、relative が解決不能に落ちるケースは絶対パスとして返る。
  if (path.isAbsolute(path.resolve(absolutePath)) && !absolutePath.includes(rel)) {
    return "unsafe";
  }
  return "in-root";
}

/** ルート相対パス（区切り / 正規化）への変換。ルート外は null。 */
export function toRootRelative(root: string, absolutePath: string): string | null {
  if (classifyRelativePath(root, absolutePath) !== "in-root") return null;
  const rel = path.relative(path.resolve(root), path.resolve(absolutePath));
  return rel.split(path.sep).join("/");
}
