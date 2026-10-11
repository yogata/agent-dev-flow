/**
 * req-define の局所修正・追記を既存原文から決定的に組み立て、前後検査する。
 *
 * 見出し検索は search-target-area.ts の契約（normalizeTargetArea、完全一致のみ）に従う。
 * スキル間の実行時依存を作らないため、同一の純粋な走査規則を本スキル内に置く。
 */

import { createHash } from "node:crypto";
import { readFileContent, writeFileContent } from "../lib/fs-helpers.ts";
import { emitError, emitJson } from "../lib/result.ts";

export type Operation = "replace" | "append";

export type AssembleInput = {
  operation: Operation;
  target_file: string;
  target_area?: string;
  old_text?: string;
  new_text?: string;
  expected_old_count?: number;
  anchor?: string;
  content?: string;
};

export type CheckResult = { name: string; ok: boolean; detail: string };
export type HeadingMatch = { line: number; text: string; level: number; heading: string };

/** 組立検査器の識別。evidence-match.ts の再開時照合で版・設定不一致を検査再実行の根拠とする。 */
export const ASSEMBLY_CHECKER = {
  name: "assemble-draft-section",
  version: "0.1.0", // scripts/package.json の version と同期（tests で突合）
  settings: {
    heading_match: "exact-after-normalization",
    old_text_count_check: true,
  },
} as const;

/** 結果に影響する参照対象の識別（Design「組立検査証拠の同一実行内引継ぎ」節）。 */
export type ResultAffectingReferences = {
  heading_match_rule: string;
  scan_scope: string;
};

/**
 * 組立検査証拠。draft-data 内 `assembly_evidence` へ記録する論理記録であり
 * 生の組立入力・出力を含まない。checks_summary と diff_compact は
 * 前後検査結果と差分の論理サマリ。
 */
export type AssemblyEvidence = {
  target_file: string;
  target_content_sha256: string;
  check_scope: { heading: string; start_line: number; end_line: number };
  execution_conditions: { operation: Operation; edit_sha256: string; expected_old_count: number | null };
  checker: typeof ASSEMBLY_CHECKER;
  result_affecting_references: ResultAffectingReferences;
  checks_summary: { pre: { count: number; all_ok: boolean }; post: { count: number; all_ok: boolean } };
  diff_compact: { changed_lines_count: number; added: number; removed: number };
  executed_at: string;
};

export type AssembleRejected = {
  ok: false;
  operation: Operation;
  location: { file: string; heading: string | null; line: number | null };
  match_count: number;
  replaced_count: 0;
  checks: { pre: CheckResult[]; post: CheckResult[] };
  reason: string;
};

export type AssembleSuccess = {
  ok: true;
  operation: Operation;
  location: { file: string; heading: string; line: number };
  match_count: number;
  replaced_count: number;
  checks: { pre: CheckResult[]; post: CheckResult[] };
  diff_summary: {
    changed_lines_count: number;
    added: number;
    removed: number;
    hunks: Array<{ start_line: number; before: string[]; after: string[] }>;
  };
  evidence: AssemblyEvidence;
  written: boolean;
  assembled_content: string;
};

export type AssembleResult = AssembleSuccess | AssembleRejected;

export function normalizeTargetArea(targetArea: string): string {
  const match = /^#{1,6}\s+(.*)$/.exec(targetArea);
  return match?.[1] ? match[1].trim() : targetArea.trim();
}

export function headingMatchesTarget(headingText: string, targetArea: string): boolean {
  return headingText === targetArea;
}

export function findTargetAreaHeadings(targetArea: string, content: string): HeadingMatch[] {
  const normalized = normalizeTargetArea(targetArea);
  const matches: HeadingMatch[] = [];
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const match = /^(#{1,6})\s+(.*)$/.exec(lines[index]!);
    if (!match || !headingMatchesTarget(match[2]!.trim(), normalized)) continue;
    matches.push({ line: index + 1, text: match[2]!.trim(), level: match[1]!.length, heading: lines[index]! });
  }
  return matches;
}

function sectionEnd(lines: string[], startIndex: number, level: number): number {
  for (let index = startIndex + 1; index < lines.length; index++) {
    const match = /^(#{1,6})\s+/.exec(lines[index]!);
    if (match && match[1]!.length <= level) return index;
  }
  return lines.length;
}

function countOccurrences(text: string, value: string): number {
  if (!value) return 0;
  let count = 0;
  let position = 0;
  while ((position = text.indexOf(value, position)) !== -1) {
    count++;
    position += value.length;
  }
  return count;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function makeDiff(before: string, after: string): AssembleSuccess["diff_summary"] {
  const oldLines = before.split(/\r?\n/);
  const newLines = after.split(/\r?\n/);
  let prefix = 0;
  while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix++;
  let oldEnd = oldLines.length;
  let newEnd = newLines.length;
  while (oldEnd > prefix && newEnd > prefix && oldLines[oldEnd - 1] === newLines[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  const removed = oldLines.slice(prefix, oldEnd);
  const added = newLines.slice(prefix, newEnd);
  return {
    changed_lines_count: Math.max(removed.length, added.length),
    added: added.length,
    removed: removed.length,
    hunks: removed.length || added.length ? [{ start_line: prefix + 1, before: removed, after: added }] : [],
  };
}

function rejected(
  input: AssembleInput,
  heading: HeadingMatch | undefined,
  matchCount: number,
  pre: CheckResult[],
  reason: string,
): AssembleRejected {
  return {
    ok: false,
    operation: input.operation,
    location: { file: input.target_file, heading: heading?.heading ?? null, line: heading?.line ?? null },
    match_count: matchCount,
    replaced_count: 0,
    checks: { pre, post: [] },
    reason,
  };
}

export function assembleDraftSection(
  input: AssembleInput,
  original: string,
  executedAt = new Date().toISOString(),
): AssembleResult {
  const target = input.operation === "replace" ? input.target_area : input.anchor;
  if (!target) return rejected(input, undefined, 0, [{ name: "target", ok: false, detail: "target_area / anchor is required" }], "target is required");

  const matches = findTargetAreaHeadings(target, original);
  const pre: CheckResult[] = [{ name: "target_unique", ok: matches.length === 1, detail: `exact heading matches: ${matches.length}` }];
  if (matches.length !== 1) return rejected(input, matches[0], matches.length, pre, matches.length ? "target heading is ambiguous" : "target heading was not found");
  const heading = matches[0]!;
  const lines = original.split(/\r?\n/);
  const start = heading.line - 1;
  const end = sectionEnd(lines, start, heading.level);
  let assembled: string;
  let replacedCount = 0;
  let editMaterial: string;

  if (input.operation === "replace") {
    if (!input.old_text || input.new_text === undefined) {
      return rejected(input, heading, matches.length, [...pre, { name: "replace_input", ok: false, detail: "old_text and new_text are required" }], "replace requires non-empty old_text and new_text");
    }
    const expected = input.expected_old_count ?? 1;
    const sectionText = lines.slice(start, end).join("\n");
    const actual = countOccurrences(sectionText, input.old_text);
    pre.push({ name: "old_text_expected_count", ok: actual === expected, detail: `expected ${expected}, found ${actual}` });
    if (actual !== expected) return rejected(input, heading, actual, pre, "old_text occurrence count did not match expected_old_count");
    let remaining = expected;
    const replacement = sectionText.replaceAll(input.old_text, () => {
      if (remaining-- > 0) replacedCount++;
      return input.new_text!;
    });
    assembled = [...lines.slice(0, start), ...replacement.split("\n"), ...lines.slice(end)].join("\n");
    editMaterial = input.new_text;
  } else {
    if (input.content === undefined) return rejected(input, heading, matches.length, [...pre, { name: "append_content", ok: false, detail: "content is required" }], "append requires content");
    const insertion = input.content.replace(/\r?\n$/, "");
    const section = lines.slice(start, end);
    while (section.at(-1) === "") section.pop();
    const updatedSection = [...section, "", ...insertion.split(/\r?\n/), ""];
    assembled = [...lines.slice(0, start), ...updatedSection, ...lines.slice(end)].join("\n");
    replacedCount = insertion.length ? 1 : 0;
    editMaterial = input.content;
  }
  pre.push({ name: "preconditions_passed", ok: true, detail: "target and edit preconditions accepted" });

  const post: CheckResult[] = [];
  const resultingMatches = findTargetAreaHeadings(target, assembled);
  post.push({ name: "target_preserved", ok: resultingMatches.length === 1, detail: `exact heading matches after assembly: ${resultingMatches.length}` });
  if (input.operation === "replace" && input.old_text) {
    const resultLines = assembled.split(/\r?\n/);
    const updatedHeading = resultingMatches[0];
    const updatedEnd = updatedHeading ? sectionEnd(resultLines, updatedHeading.line - 1, updatedHeading.level) : 0;
    const remainingCount = updatedHeading ? countOccurrences(resultLines.slice(updatedHeading.line - 1, updatedEnd).join("\n"), input.old_text) : 0;
    post.push({ name: "old_text_removed", ok: remainingCount === 0, detail: `remaining occurrences: ${remainingCount}` });
    if (remainingCount !== 0) return rejected(input, heading, matches.length, pre, "old_text remained after assembly");
  }
  const beforeCount = lines.length;
  const afterCount = assembled.split(/\r?\n/).length;
  const diff = makeDiff(original, assembled);
  const lineCountOk = afterCount === beforeCount - diff.removed + diff.added;
  post.push({ name: "line_count_consistent", ok: lineCountOk, detail: `before ${beforeCount}, after ${afterCount}` });
  if (!post.every((check) => check.ok)) return rejected(input, heading, matches.length, pre, "post-assembly inspection failed");

  return {
    ok: true,
    operation: input.operation,
    location: { file: input.target_file, heading: heading.heading, line: heading.line },
    match_count: matches.length,
    replaced_count: replacedCount,
    checks: { pre, post },
    diff_summary: diff,
    evidence: {
      target_file: input.target_file,
      target_content_sha256: sha256(original),
      check_scope: { heading: heading.heading, start_line: heading.line, end_line: end },
      execution_conditions: { operation: input.operation, edit_sha256: sha256(editMaterial), expected_old_count: input.operation === "replace" ? input.expected_old_count ?? 1 : null },
      checker: ASSEMBLY_CHECKER,
      result_affecting_references: {
        heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only",
        scan_scope: "target section only",
      },
      checks_summary: {
        pre: { count: pre.length, all_ok: pre.every((check) => check.ok) },
        post: { count: post.length, all_ok: post.every((check) => check.ok) },
      },
      diff_compact: { changed_lines_count: diff.changed_lines_count, added: diff.added, removed: diff.removed },
      executed_at: executedAt,
    },
    written: false,
    assembled_content: assembled,
  };
}

function isInput(value: unknown): value is AssembleInput {
  if (typeof value !== "object" || value === null) return false;
  const input = value as Partial<AssembleInput>;
  return (input.operation === "replace" || input.operation === "append") && typeof input.target_file === "string";
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf-8");
}

async function main(): Promise<void> {
  const raw = await readStdin();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    emitError("stdin must contain valid JSON");
  }
  if (!isInput(parsed)) emitError('stdin JSON must include operation (replace|append) and target_file');
  const original = readFileContent(parsed.target_file);
  const result = assembleDraftSection(parsed, original);
  if (!result.ok) {
    emitJson(result);
    throw new Error(result.reason);
  }
  const write = process.argv.includes("--write");
  if (write) {
    writeFileContent(parsed.target_file, result.assembled_content);
    result.written = true;
  }
  const { assembled_content: _assembledContent, ...summary } = result;
  emitJson(summary);
}

if (import.meta.main) await main();
