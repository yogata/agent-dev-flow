// lib/builtin-checks.ts — IR レジストリ外のエンジン内蔵検査。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md「保持する検査能力」。
//  - 未追跡かつ gitignore 管理対象外ファイル検出（REQ-010-084、DEC-065 決定2）
//  - 既知混入形の異言語文字混入検出（REQ-010-083）
// sidecar 重複キー検出（REQ-117-006）は実装が
// src/common/skills/agentdev-traceability/scripts/lib/sidecar.ts に存在するため、
// 本モジュールは回帰テスト経由での保持のみを担う。

import * as fs from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import type { IntegrityContext, ParsedFile, RuleViolation } from "../engine/types.ts";

const UNTRACKED_RULE_LABEL = "untracked-residue";
const KNOWN_CORRUPTION_RULE_LABEL = "known-corruption-literal";

export const UNTRACKED_SCAN_TARGETS = ["docs", "src", ".agentdev", "traceability", "scripts"] as const;

/**
 * 既知混入形リテラルの列挙。旧 content-corruption-checker Design（Wave-1 削除済み）
 * の「既知混入形の確定一致検出」を引き継ぎ、実装内が単一所有する。
 * 確定一致のため正規の片仮名語（カード等）は構造的に一致しない。
 */
export const KNOWN_CORRUPTION_LITERALS: readonly string[] = ["卡out"];

/**
 * known-corruption-literal の走査対象（旧 checker の対象維持:
 * docs design 本文を含む走査対象 = docs/designs、配布 commands/skills）。
 */
export const KNOWN_CORRUPTION_SCAN_GLOBS: readonly string[] = [
  "src/common/commands/**",
  "src/common/skills/**",
  "docs/designs/**",
];

class UntrackedInspectionError extends Error {
  constructor(repoRoot: string, cause: Error) {
    super(`git ls-files による未追跡検査を実行できません (${repoRoot}): ${cause.message}`, { cause });
    this.name = "UntrackedInspectionError";
  }
}

/**
 * 未追跡かつ gitignore 管理対象外のファイル・ディレクトリを列挙する
 * （REQ-010-084）。承認一覧（ng-baseline）による恒久管理は行わず、検出は
 * 都度の解消または gitignore 対象化の明示判断で処理する。
 */
export function detectUntrackedResidue(repoRoot: string): string[] {
  try {
    const out = execFileSync(
      "git",
      ["ls-files", "--others", "--exclude-standard", "-z"],
      { cwd: repoRoot, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 },
    );
    return out.split("\0").filter((file) => file.length > 0);
  } catch (cause) {
    if (cause instanceof Error) throw new UntrackedInspectionError(repoRoot, cause);
    throw cause;
  }
}

export function checkUntrackedResidue(repoRoot: string): RuleViolation[] {
  return detectUntrackedResidue(repoRoot).map((rel) => ({
    ruleId: UNTRACKED_RULE_LABEL,
    severity: "error" as const,
    filePath: rel,
    message:
      `untracked file/directory not managed by gitignore remains: ${rel}: ` +
      "正規の非追跡領域であれば .gitignore への追加で宣言し、それ以外は対象側の直接修正（残存物の削除）で解消すること。検出違反は baseline による承認一覧へ登録せず免除しない（REQ-010-084）",
    remediationHint: "commit, or gitignore declaration for legitimate non-tracked areas",
  }));
}

/** known-corruption-literal の走査対象ファイルを context から選択する。 */
function scanTargets(ctx: IntegrityContext): ParsedFile[] {
  const out: ParsedFile[] = [];
  const seen = new Set<string>();
  for (const glob of KNOWN_CORRUPTION_SCAN_GLOBS) {
    for (const file of ctx.getFilesByGlob(glob)) {
      if (!seen.has(file.path)) {
        seen.add(file.path);
        out.push(file);
      }
    }
  }
  return out;
}

/**
 * 既知混入形の異言語文字混入（確定一致）を検出する（REQ-010-083）。
 * 文字平面の走査のため frontmatter も含む生ファイル行を対象とする。
 */
export function checkKnownCorruptionLiterals(ctx: IntegrityContext): RuleViolation[] {
  const violations: RuleViolation[] = [];
  for (const file of scanTargets(ctx)) {
    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i]!;
      for (const literal of KNOWN_CORRUPTION_LITERALS) {
        let idx = line.indexOf(literal);
        while (idx !== -1) {
          violations.push({
            ruleId: KNOWN_CORRUPTION_RULE_LABEL,
            severity: "error" as const,
            filePath: file.path,
            line: i + 1,
            message: `Known corruption literal '${literal}' (fixed-match of an incident-record mixed-in string; enumeration owner: lib/builtin-checks.ts KNOWN_CORRUPTION_LITERALS) (REQ-010-083)`,
          });
          idx = line.indexOf(literal, idx + literal.length);
        }
      }
    }
  }
  return violations;
}

/** 内蔵検査を一括実行する（IR レジストリと独立に runner から呼ばれる）。 */
export function runBuiltinChecks(
  ctx: IntegrityContext,
): RuleViolation[] {
  return [
    ...checkUntrackedResidue(ctx.repoRoot),
    ...checkKnownCorruptionLiterals(ctx),
  ];
}

/** intake inbox への起票で使用する内蔵検査の既定ラベル一覧。 */
export const BUILTIN_CHECK_LABELS: readonly string[] = [
  UNTRACKED_RULE_LABEL,
  KNOWN_CORRUPTION_RULE_LABEL,
];

/** worktree 判定（レポート環境ラベル用。.git 実体の有無で判定）。 */
export function isInsideWorktree(repoRoot: string): boolean {
  return !fs.existsSync(join(repoRoot, ".git"));
}
