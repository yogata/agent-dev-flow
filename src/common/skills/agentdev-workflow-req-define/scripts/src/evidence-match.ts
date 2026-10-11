/**
 * 組立検査証拠の再開時照合（純粋関数）。
 *
 * Design「組立検査証拠の同一実行内引継ぎ」節の契約に従う:
 * - 同一実行の再開では現在条件を照合し、すべて一致した有効な証拠だけを再利用する
 * - 欠損・不一致なら影響する検査を再実行し、意味判断への影響も再評価する
 * - 影響しない証拠まで一律に破棄しない（invalidates の2区分で影響範囲を区別する）
 * - 欠損・形状不備の証拠は検証済みと扱わない（fail-closed）
 *
 * checks_summary、diff_compact、executed_at は照合対象にしない
 * （結果の記録であり条件ではない。現在側の生成時刻と比較すると常に不一致になる）。
 */

import { type AssemblyEvidence } from "./assemble-draft-section.ts";

export type AssemblyEvidenceMatch = {
  reusable: boolean;
  mismatch_reasons: string[];
  invalidates: { assembly: boolean; inspection: boolean };
};

const REQUIRED_STORED_FIELDS = [
  "target_file",
  "target_content_sha256",
  "check_scope",
  "execution_conditions",
  "checker",
  "result_affecting_references",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasRequiredFields(value: Record<string, unknown>): boolean {
  return REQUIRED_STORED_FIELDS.every((field) => value[field] !== undefined);
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => deepEqual(item, right[index]));
  }
  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    if (leftKeys.length !== rightKeys.length) return false;
    if (!leftKeys.every((key, index) => key === rightKeys[index])) return false;
    return leftKeys.every((key) => deepEqual(left[key], right[key]));
  }
  return false;
}

export function matchAssemblyEvidence(stored: unknown, current: AssemblyEvidence): AssemblyEvidenceMatch {
  if (!isRecord(stored) || !hasRequiredFields(stored)) {
    return {
      reusable: false,
      mismatch_reasons: ["evidence-missing"],
      invalidates: { assembly: true, inspection: true },
    };
  }

  const mismatch_reasons: string[] = [];
  let assembly = false;
  let inspection = false;

  const invalidateAssembly = () => {
    assembly = true;
    inspection = true;
  };

  if (stored.target_file !== current.target_file) {
    mismatch_reasons.push("target_file");
    invalidateAssembly();
  }
  if (stored.target_content_sha256 !== current.target_content_sha256) {
    mismatch_reasons.push("target_content_sha256");
    invalidateAssembly();
  }
  if (!deepEqual(stored.check_scope, current.check_scope)) {
    mismatch_reasons.push("check_scope");
    invalidateAssembly();
  }
  if (!deepEqual(stored.execution_conditions, current.execution_conditions)) {
    mismatch_reasons.push("execution_conditions");
    assembly = true;
  }
  if (!deepEqual(stored.checker, current.checker)) {
    mismatch_reasons.push("checker");
    inspection = true;
  }
  if (!deepEqual(stored.result_affecting_references, current.result_affecting_references)) {
    mismatch_reasons.push("result_affecting_references");
    inspection = true;
  }

  if (mismatch_reasons.length === 0) {
    return { reusable: true, mismatch_reasons: [], invalidates: { assembly: false, inspection: false } };
  }
  return { reusable: false, mismatch_reasons, invalidates: { assembly, inspection } };
}
