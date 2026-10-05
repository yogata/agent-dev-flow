// agentdev-textlint-guard 共通実行基盤: ファイル単位結果の保存と読込み。
//
// - 再利用対象は正常に完了した合格・不合格の両方。異常終了、読込み失敗、タイムアウト、
//   不完全出力は正常結果として保存しない（保存関数の呼出側が実検査成功結果のみ渡す）
// - 保存は再生成可能な内部データとして扱う実行時データであり、配布・投影の対象外である
//   （runtime-package-boundary.md「repo-local Plugin の配布・投影契約」節）
// - 途中書込みの読込みを防ぐため、一時ファイル + rename の原子書込みを行う
// - 読込み時は JSON 解析・schema 検証・key/path 照合・結果形状検証を行い、
//   欠落・破損・不一致は null を返して実検査へ戻す
// - 容量上限（エントリ数）を設け、超過時は最古のエントリから削除する（無制限な保存を防ぐ）
// - 同一性キーにプロジェクトルートの解決済み絶対パスが含まれるため、プロジェクト・
//   worktree 間の誤流用はキー不一致として検出され再利用されない

import * as fs from "node:fs";
import * as path from "node:path";
import type { FileInspectionResult, Severity } from "./results.ts";

/** 保存先（ルート相対）。実行時データ領域であり、配布・投影の対象外。 */
export const STORE_RELATIVE_DIRECTORY = ".agentdev/cache/agentdev-textlint-guard/results/v1";

/** 保存エントリ数の上限（無制限な保存を防ぐ）。超過時は mtime 最古から削除する。 */
export const STORE_MAX_ENTRIES = 512;

/** 保存レコード。正常に完了した検査結果（合格・不合格の双方）のみ保存する。 */
export interface StoredFileResult {
  readonly schemaVersion: number;
  /** ファイル単位の同一性キー。 */
  readonly key: string;
  /** ルート相対パス（/ 区切り）。 */
  readonly path: string;
  /** 正常に完了した検査結果。 */
  readonly result: FileInspectionResult;
}

export function storeDirectoryFor(root: string): string {
  return path.join(root, ...STORE_RELATIVE_DIRECTORY.split("/"));
}

function entryPathFor(root: string, key: string): string {
  return path.join(storeDirectoryFor(root), `${key}.json`);
}

/** キーは 64 文字 hex（SHA256）であることを要求する（パスへの混入を防ぐ）。 */
function isValidKey(key: string): boolean {
  return /^[0-9a-f]{64}$/.test(key);
}

const SEVERITY_VALUES: readonly string[] = ["info", "advice", "hard"];

function isValidStoredRecord(value: unknown, expectedKey: string, expectedPath: string): value is StoredFileResult {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<StoredFileResult>;
  if (record.schemaVersion !== 1) return false;
  if (record.key !== expectedKey || record.path !== expectedPath) return false;
  const result = record.result;
  if (typeof result !== "object" || result === null) return false;
  if ((result as Partial<FileInspectionResult>).path !== expectedPath) return false;
  const findings = (result as Partial<FileInspectionResult>).findings;
  if (!Array.isArray(findings)) return false;
  for (const finding of findings) {
    if (typeof finding !== "object" || finding === null) return false;
    const f = finding as Partial<Exclude<StoredFileResult["result"]["findings"][number], undefined>>;
    if (f.path !== expectedPath) return false;
    if (typeof f.line !== "number" || typeof f.column !== "number") return false;
    if (typeof f.ruleId !== "string" || typeof f.message !== "string") return false;
    if (f.excerpt !== null && typeof f.excerpt !== "string") return false;
    if (f.replacement !== null && typeof f.replacement !== "string") return false;
    if (!SEVERITY_VALUES.includes(String(f.severity))) return false;
  }
  const hardCount = (result as Partial<FileInspectionResult>).hardCount;
  const actualHard = findings.filter((f) => (f as { severity?: Severity }).severity === "hard").length;
  if (typeof hardCount !== "number" || hardCount !== actualHard) return false;
  return true;
}

/**
 * 実検査に成功した結果を保存する。保存の失敗は無視できる（
 * 保存失敗時は実検査へ戻る。当該対象の実検査は既に完了しているため、
 * 保存の成否は検査結果の信頼性に影響しない）。成功時 true。
 */
export function storeFileResult(
  root: string,
  key: string,
  rootRelativePath: string,
  result: FileInspectionResult,
): boolean {
  if (!isValidKey(key)) return false;
  const record: StoredFileResult = { schemaVersion: 1, key, path: rootRelativePath, result };
  const dir = storeDirectoryFor(root);
  try {
    fs.mkdirSync(dir, { recursive: true });
    enforceCapacityLimit(root);
    const finalPath = entryPathFor(root, key);
    const tempPath = `${finalPath}.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // 原子書込み: 一時ファイルへ書いてから rename する（途中書込みの読込みを防ぐ）。
    fs.writeFileSync(tempPath, JSON.stringify(record, null, 2), "utf8");
    try {
      fs.renameSync(tempPath, finalPath);
    } catch (e) {
      try {
        fs.rmSync(tempPath, { force: true });
      } catch {
        // 一時ファイルの掃除に失敗しても保存の成否判定には影響しない
      }
      throw e;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 同一性キーに対応する保存済み結果を読む。欠落・破損・途中書込み・キー/パス不一致は
 * null を返し、呼出側は実検査へ戻す。
 */
export function loadStoredFileResult(
  root: string,
  key: string,
  rootRelativePath: string,
): FileInspectionResult | null {
  if (!isValidKey(key)) return null;
  let raw: string;
  try {
    raw = fs.readFileSync(entryPathFor(root, key), "utf8");
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isValidStoredRecord(parsed, key, rootRelativePath)) return null;
  return parsed.result;
}

/** 容量上限の適用。エントリ数が上限を超えていれば mtime 最古から削除する。 */
function enforceCapacityLimit(root: string): void {
  const dir = storeDirectoryFor(root);
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true }) as fs.Dirent[];
  } catch {
    return;
  }
  const files = entries.filter((e) => e.isFile() && e.name.endsWith(".json"));
  if (files.length < STORE_MAX_ENTRIES) return;
  const withTime = files
    .map((f) => {
      const abs = path.join(dir, f.name);
      let mtimeMs = 0;
      try {
        mtimeMs = fs.statSync(abs).mtimeMs;
      } catch {
        mtimeMs = 0;
      }
      return { abs, mtimeMs };
    })
    .sort((a, b) => a.mtimeMs - b.mtimeMs);
  const excess = files.length - STORE_MAX_ENTRIES + 1;
  for (const target of withTime.slice(0, excess)) {
    try {
      fs.rmSync(target.abs, { force: true });
    } catch {
      // 削除失敗は無視する（次回の保存時に再適用される）
    }
  }
}
