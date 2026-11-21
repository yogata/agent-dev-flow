// rules/ir-071.ts — integrity-rule-related-req-existence。
// ルール詳細: docs/designs/integrity/rules/IR-071-integrity-rule-related-req-existence.md
// related_req の本文表抽出は generate_indexes/markdown.ts parseBodyTableArray を再利用し、
// rule-ownership.md AUTOGEN 派生表と単一情報源を維持する（I/O は IntegrityContext 経由）。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { parseBodyTableArray } from "../scripts/generate_indexes/markdown.ts";
import { buildReqRowIndex } from "./ir-067.ts";

const ROW_ID_RE = /^REQ-(\d+)-(\d+)$/;
const FILE_ID_RE = /^REQ-(\d+)$/;
const IR_FILENAME_RE = /^IR-(\d+)-.*\.md$/;
const REQ_FILENAME_RE = /^(REQ-\d+)\.md$/;

function irIdFromFilename(fileName: string): string | null {
  const m = fileName.match(IR_FILENAME_RE);
  if (!m) return null;
  return `IR-${String(Number(m[1])).padStart(3, "0")}`;
}

function buildReqFileIndex(ctx: IntegrityContext): Set<string> {
  const files = new Set<string>();
  for (const file of ctx.getFilesByGlob("docs/requirements/**/*.md")) {
    const m = (file.path.split("/").pop() ?? "").match(REQ_FILENAME_RE);
    if (m) files.add(m[1]!);
  }
  return files;
}

export const ir071: IntegrityRule = {
  id: "IR-071",
  slug: "integrity-rule-related-req-existence",
  title: "integrity-rule-related-req-existence",
  description:
    "integrity rules（docs/designs/integrity/rules/IR-*.md）の related_req に記述された参照先 REQ の実在性を機械検査する。",
  relatedReqs: ["REQ-051-009"],
  targetGlobs: [
    "docs/designs/integrity/rules/**",
    "docs/requirements/*.md",
  ],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    if (!ctx.pathExists("docs/designs/integrity/rules")) {
      return violations;
    }
    const rowIndex = buildReqRowIndex(ctx);
    const fileIndex = buildReqFileIndex(ctx);
    for (const file of ctx.getFilesByGlob("docs/designs/integrity/rules/IR-*.md")) {
      const fileName = file.path.split("/").pop() ?? "";
      const irId = irIdFromFilename(fileName);
      if (irId === null) continue;
      for (const rawId of parseBodyTableArray(file.rawContent, "related_req")) {
        if (rawId.startsWith("v2:")) continue;
        const isRowId = ROW_ID_RE.test(rawId);
        const isFileId = FILE_ID_RE.test(rawId);
        if (!isRowId && !isFileId) continue;
        const exists = isRowId ? rowIndex.has(rawId) : fileIndex.has(rawId);
        if (exists) continue;
        violations.push({
          ruleId: "IR-071",
          severity: "error",
          filePath: file.path,
          message: `Phantom related_req '${rawId}' in integrity rule ${irId}: referenced REQ does not exist as a requirement row or file (REQ-051-009, IR-071)`,
          remediationHint: isRowId
            ? `${rawId} must exist as a requirement row in docs/requirements`
            : `${rawId} must exist as docs/requirements/${rawId}.md`,
        });
      }
    }
    return violations;
  },
};

