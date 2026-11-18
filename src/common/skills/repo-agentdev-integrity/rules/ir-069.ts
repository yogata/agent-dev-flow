// rules/ir-069.ts — req-number-gap-recorded。
// ルール詳細: docs/designs/integrity/rules/IR-069-req-number-gap-recorded.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { buildAutogenLineMask } from "./ir-067.ts";

const REQ_FILE_RE = /^REQ-(\d+)\.md$/;
const RANGE_RE = /REQ-(\d+)\s*[〜~]\s*REQ-(\d+)/g;
const SINGLE_RE = /REQ-(\d+)(?!\d)/g;

function collectReqNumbers(ctx: IntegrityContext): Set<number> {
  const numbers = new Set<number>();
  for (const file of ctx.getFilesByGlob("docs/requirements/**/*.md")) {
    const fileName = file.path.split("/").pop() ?? "";
    const m = fileName.match(REQ_FILE_RE);
    if (!m) continue;
    if (m[1]!.length === 4 && Number.parseInt(m[1]!, 10) < 141) continue;
    numbers.add(Number.parseInt(m[1]!, 10));
  }
  return numbers;
}

interface GapClaims {
  ranges: { lo: number; hi: number; line: number; claim: string }[];
  missingSingles: { n: number; line: number }[];
}

function parseGapClaims(
  ctx: IntegrityContext,
  readmePath: string,
  existing: Set<number>,
): GapClaims | null {
  const file = ctx.readFile(readmePath);
  if (file === null) return null;
  const mask = buildAutogenLineMask(file.lines);
  const ranges: GapClaims["ranges"] = [];
  const missingSingles: GapClaims["missingSingles"] = [];
  for (let i = 0; i < file.lines.length; i++) {
    if (mask[i]) continue;
    const line = file.lines[i] ?? "";
    if (!line.includes("欠番")) continue;
    const rangeSpans: Array<[number, number]> = [];
    RANGE_RE.lastIndex = 0;
    let rm: RegExpExecArray | null;
    while ((rm = RANGE_RE.exec(line)) !== null) {
      rangeSpans.push([rm.index, rm.index + rm[0].length]);
      const a = Number.parseInt(rm[1]!, 10);
      const b = Number.parseInt(rm[2]!, 10);
      ranges.push({
        lo: Math.min(a, b),
        hi: Math.max(a, b),
        line: i + 1,
        claim: rm[0].replace(/\s+/g, ""),
      });
    }
    SINGLE_RE.lastIndex = 0;
    let sm: RegExpExecArray | null;
    while ((sm = SINGLE_RE.exec(line)) !== null) {
      if (rangeSpans.some(([s, e]) => (sm!.index ?? 0) >= s && (sm!.index ?? 0) < e)) {
        continue;
      }
      const n = Number.parseInt(sm[1]!, 10);
      if (!existing.has(n)) {
        missingSingles.push({ n, line: i + 1 });
      }
    }
  }
  return { ranges, missingSingles };
}

function formatNumber(n: number): string {
  return `REQ-${String(n).padStart(3, "0")}`;
}

function formatRun(run: number[]): string {
  if (run.length === 1) return formatNumber(run[0]!);
  return `${formatNumber(run[0]!)}〜${formatNumber(run[run.length - 1]!)}`;
}

export const ir069: IntegrityRule = {
  id: "IR-069",
  slug: "req-number-gap-recorded",
  title: "req-number-gap-recorded",
  description:
    "現行採番帯の無記録欠番と陳腐化した欠番範囲明記を README 突合で検出する（末尾予約枠は許容）。",
  relatedReqs: ["REQ-010-068", "REQ-010-070"],
  targetGlobs: ["docs/requirements/*.md", "docs/requirements/retired/*.md", "docs/README.md"],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const numbers = collectReqNumbers(ctx);
    const band = [...numbers].filter((n) => n >= 1).sort((a, b) => a - b);
    if (band.length === 0) {
      return violations;
    }
    const existing = new Set(band);
    const max = band[band.length - 1]!;
    const prev = band.length >= 2 ? band[band.length - 2]! : 0;
    const requiredGaps: number[] = [];
    const reservationWindow: number[] = [];
    for (let n = 1; n <= max; n++) {
      if (existing.has(n)) continue;
      if (n > prev) reservationWindow.push(n);
      else requiredGaps.push(n);
    }

    const readmeRels = ["docs/requirements/README.md", "docs/README.md"];
    for (const rel of readmeRels) {
      const claims = parseGapClaims(ctx, rel, existing);
      if (claims === null) continue;
      const covered = new Set<number>();
      for (const range of claims.ranges) {
        for (let n = range.lo; n <= range.hi; n++) covered.add(n);
      }
      for (const single of claims.missingSingles) covered.add(single.n);

      const unrecorded = requiredGaps.filter((n) => !covered.has(n));
      let run: number[] = [];
      const flushRun = (): void => {
        if (run.length === 0) return;
        violations.push({
          ruleId: "IR-069",
          severity: "error",
          filePath: rel,
          message: `Gap ${formatRun(run)} has no REQ file but is not annotated as 欠番 in ${rel} (REQ-010-070, IR-069)`,
          remediationHint: `annotate ${formatRun(run)} as 欠番 on a line outside AUTOGEN blocks in ${rel}`,
        });
        run = [];
      };
      for (const n of unrecorded) {
        if (run.length > 0 && n === run[run.length - 1]! + 1) {
          run.push(n);
        } else {
          flushRun();
          run = [n];
        }
      }
      flushRun();

      for (const range of claims.ranges) {
        let allExist = true;
        for (let n = range.lo; n <= range.hi; n++) {
          if (!existing.has(n)) {
            allExist = false;
            break;
          }
        }
        if (allExist) {
          violations.push({
            ruleId: "IR-069",
            severity: "error",
            filePath: rel,
            line: range.line,
            message: `Range annotation ${range.claim} on a 欠番 line covers only existing REQ numbers (stale gap annotation, ${rel}:${range.line}) (IR-069)`,
            remediationHint: `annotate only numbers without REQ files, or remove the stale range from ${rel}`,
          });
        }
      }
    }
    return violations;
  },
};
