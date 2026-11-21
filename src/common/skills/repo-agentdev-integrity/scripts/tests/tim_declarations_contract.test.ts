// ADF-COVERS(verification): REQ-012-026, REQ-012-027, REQ-012-028, REQ-012-029, REQ-012-030, REQ-012-031, REQ-012-032, REQ-012-033, REQ-012-034, REQ-012-035, REQ-012-036, REQ-012-037, REQ-012-038, REQ-012-039, REQ-012-040, REQ-012-041, REQ-012-042, REQ-123-002
//
// TIM 対応宣言のコーパス契約検証（最小構成）。TIM 契約が壊れたこと——REQ-012-026〜042
// の各要件行の対応完全性欠落・未知の成果物役割・未知の要件行参照——だけを検知する。
// 宣言の行単位解析は producer 側 parseDeclarations を直接利用し（check と同一の解析契約）、
// 宣言ピンの静的検証・フィクスチャによるモデル規則の再検証は持たない（DEC-030・REQ-012-026）。

import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { findRepoRoot } from "../../lib/cli_utils.ts";
import {
  DEFAULT_EXCLUDE_DIR_PATHS,
  enumerateCorpusFiles,
} from "../../../../skills/agentdev-traceability/scripts/lib/corpus.ts";
import { parseDeclarations } from "../../../../skills/agentdev-traceability/scripts/lib/declarations.ts";
import { currentRequirementLineIds } from "../../../../skills/agentdev-traceability/scripts/lib/requirements.ts";

const SCRIPT_DIR = import.meta.dir;
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);

// 完全性判定の対象要件行（REQ-012-026〜042）。
const TIM_SCOPE: readonly string[] = Array.from(
  { length: 17 },
  (_, i) => `REQ-012-${String(26 + i).padStart(3, "0")}`,
);

function walkTestFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkTestFiles(full, out);
    else if (name.endsWith(".ts")) out.push(full);
  }
  return out;
}

// 正規成果物コーパス（docs + repo-integrity scripts 配下の .ts）の解析結果。
// 直接走査で判定が成立する（派生索引、グラフDBを前提としない。REQ-012-041）。
function parseCorpus(): {
  declarations: ReturnType<typeof parseDeclarations>["declarations"];
  issues: ReturnType<typeof parseDeclarations>["issues"];
} {
  const docs = enumerateCorpusFiles(REPO_ROOT, {
    extensions: [".md"],
    excludeDirPaths: DEFAULT_EXCLUDE_DIR_PATHS,
  }).filter((file) => file.startsWith("docs/"));
  const results = [
    ...docs.map((rel) => parseDeclarations(rel, readFileSync(join(REPO_ROOT, rel), "utf-8"))),
    ...walkTestFiles(SCRIPT_DIR).map((full) =>
      parseDeclarations(relative(REPO_ROOT, full).replaceAll("\\", "/"), readFileSync(full, "utf-8")),
    ),
  ];
  return {
    declarations: results.flatMap((r) => r.declarations),
    issues: results.flatMap((r) => r.issues),
  };
}

describe("TIM 対応宣言コーパス契約（実リポジトリ）", () => {
  it("REQ-012-026〜042 の各要件行へ実装対応が1件以上保存されている", () => {
    const { declarations } = parseCorpus();
    const lacking = TIM_SCOPE.filter(
      (reqId) => !declarations.some((d) => d.role === "implementation" && d.reqIds.includes(reqId)),
    );
    expect(lacking).toEqual([]);
  });

  it("REQ-012-026〜042 の各要件行へ Design 対応が1件以上保存されている（DEC-030 決定1）", () => {
    const { declarations } = parseCorpus();
    const lacking = TIM_SCOPE.filter(
      (reqId) => !declarations.some((d) => d.role === "design" && d.reqIds.includes(reqId)),
    );
    expect(lacking).toEqual([]);
  });

  it("REQ-012-026〜042 の各要件行へ検証対応が1件以上保存されている", () => {
    const { declarations } = parseCorpus();
    const lacking = TIM_SCOPE.filter(
      (reqId) => !declarations.some((d) => d.role === "verification" && d.reqIds.includes(reqId)),
    );
    expect(lacking).toEqual([]);
  });

  it("コーパス内の全参照要件IDが現行 REQ ファイルの要件行として存在する", () => {
    const { declarations } = parseCorpus();
    const known = new Set(currentRequirementLineIds(REPO_ROOT));
    const unknown = declarations.flatMap((d) => d.reqIds.filter((id) => !known.has(id)));
    expect(unknown).toEqual([]);
  });

  it("コーパス内に未知の成果物役割を持つ宣言が存在しない（REQ-012-028/040）", () => {
    const { issues } = parseCorpus();
    expect(issues).toEqual([]);
  });
});
