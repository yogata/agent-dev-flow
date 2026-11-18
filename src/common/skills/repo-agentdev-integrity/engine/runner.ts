// engine/runner.ts — glob フィルタリング・並列実行オーケストレータ。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md
// 「差分実行・自動起票ランナー」。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleResult,
  RuleViolation,
} from "./types.ts";

export interface RuleSelection {
  selected: IntegrityRule[];
  /** 選択されなかったルール id（規約上の skip 記録）。 */
  skipped: string[];
  /**
   * 変更ファイルが全て非対象（どのルールの targetGlob にも該当しない）場合
   * true。cli.ts はこの場合即時 Exit 0 で終了する。
   */
  nonTargetOnly: boolean;
}

/** glob（1段内の `*` と任意段の `**`）に repo ルート相対パスを照合する。 */
function matchesAnyGlob(relPath: string, globs: readonly string[], matchers: (RegExp | null)[]): boolean {
  const segments = relPath.split("/");
  for (let i = 0; i < globs.length; i++) {
    const pattern = globs[i]!;
    let re = matchers[i] ?? null;
    if (re === null) {
      // 動的 import を避け、単一ファイルの正規表現化のみ行う（I/O なし）。
      re = compileSegmentGlob(pattern);
      matchers[i] = re;
    }
    if (re.test(relPath) || (re.global === false && reTestAnyPrefix(re, segments))) {
      return true;
    }
  }
  return false;
}

function reTestAnyPrefix(re: RegExp, segments: string[]): boolean {
  for (let cut = segments.length - 1; cut >= 1; cut--) {
    if (re.test(segments.slice(0, cut).join("/") + "/")) return true;
  }
  return false;
}

/** `**` を含む glob を正規表現へ変換する（context.globToRegExp と同一文法）。 */
function compileSegmentGlob(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  let out = "";
  for (let i = 0; i < escaped.length; i++) {
    const ch = escaped[i];
    if (ch === "*" && escaped[i + 1] === "*") {
      if (escaped[i + 2] === "/") {
        out += "(?:.*/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
      continue;
    }
    if (ch === "*") {
      out += "[^/]*";
      continue;
    }
    if (ch === "?") {
      out += "[^/]";
      continue;
    }
    out += ch;
  }
  return new RegExp(`^${out}$`);
}

export function selectRules(
  rules: readonly IntegrityRule[],
  changedFiles: readonly string[],
  ruleFilter: string | null,
): RuleSelection {
  if (ruleFilter !== null) {
    const wanted = ruleFilter.toLowerCase();
    const selected = rules.filter((r) => r.id.toLowerCase() === wanted);
    const selectedIds = new Set(selected.map((r) => r.id));
    return {
      selected,
      skipped: rules.filter((r) => !selectedIds.has(r.id)).map((r) => r.id),
      nonTargetOnly: false,
    };
  }

  if (changedFiles.length === 0) {
    return { selected: [...rules], skipped: [], nonTargetOnly: false };
  }

  const globMatchers: (RegExp | null)[] = [];
  const targetPaths = new Set<string>();
  for (const changed of changedFiles) {
    const normalized = changed.replace(/\\/g, "/");
    for (const rule of rules) {
      if (matchesAnyGlob(normalized, rule.targetGlobs, globMatchers)) {
        targetPaths.add(normalized);
        break;
      }
    }
  }

  if (targetPaths.size === 0) {
    return { selected: [], skipped: rules.map((r) => r.id), nonTargetOnly: true };
  }

  const selectedIds = new Set<string>();
  for (const rule of rules) {
    if (rule.globalScan) {
      selectedIds.add(rule.id);
      continue;
    }
    for (const changed of changedFiles) {
      const normalized = changed.replace(/\\/g, "/");
      if (matchesAnyGlob(normalized, rule.targetGlobs, globMatchers)) {
        selectedIds.add(rule.id);
        break;
      }
    }
  }
  const selected = rules.filter((r) => selectedIds.has(r.id));
  return {
    selected,
    skipped: rules.filter((r) => !selectedIds.has(r.id)).map((r) => r.id),
    nonTargetOnly: false,
  };
}

/**
 * 選択ルールを並列実行する。ルールの check が throw した場合は当該ルールを
 * error 結果として記録し、他ルールの実行を妨げない。
 */
export async function runRules(
  selected: readonly IntegrityRule[],
  ctx: IntegrityContext,
): Promise<RuleResult[]> {
  const results = await Promise.all(
    selected.map(async (rule): Promise<RuleResult> => {
      try {
        const violations = rule.check(ctx);
        return { ruleId: rule.id, violations };
      } catch (e) {
        return {
          ruleId: rule.id,
          violations: [],
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }),
  );
  return results;
}

/** 全結果から違反一覧を集約する（error は違反へは含めない）。 */
export function collectViolations(results: readonly RuleResult[]): RuleViolation[] {
  return results.flatMap((r) => r.violations);
}
