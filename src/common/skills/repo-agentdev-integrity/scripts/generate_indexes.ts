// ADF-COVERS(implementation): REQ-010-011, REQ-059-002, REQ-059-003, REQ-047-013, REQ-123-004, REQ-123-005, REQ-123-006
// ADF-COVERS(verification): REQ-103-022, REQ-103-024, REQ-103-025, REQ-123-005, REQ-123-006
/**
 * Index auto-generation script (SC-002 Phase C, IR-061) — 薄い CLI 入口。
 *
 * 本体は `generate_indexes/` 配下の責務別モジュール構成:
 *   - `generate_indexes/markers.ts`        AUTOGEN マーカー検出・ブロック操作・block ID レジストリ
 *   - `generate_indexes/markdown.ts`       frontmatter 解析・本文表抽出・共通ファイル読取
 *   - `generate_indexes/collectors.ts`     ファイル走査・メタデータ抽出（IR/REQ/Decision）
 *   - `generate_indexes/integrity_indexes.ts`  catalog / rule-ownership / req-impact-map 生成
 *   - `generate_indexes/decision_readme.ts`    Decision README 生成（REQ-059）
 *   - `generate_indexes/req_readme.ts`         REQ README 生成（AG-009）
 *   - `generate_indexes/docs_readme.ts`        docs/README.md 生成（AG-005 / Phase E 残）
 *   - `generate_indexes/skill_manifest.ts`     skill-projection-manifest 再生成（B3-3）
 *   - `generate_indexes/measure_date.ts`       計測日導出（SC-002「計測日導出」）
 *   - `generate_indexes/writer.ts`             書き込み・鮮度比較
 *   - `generate_indexes/run.ts`                CLI orchestration 本体
 *
 * 対象索引、自動生成マーカーの契約、IR 管理対象/導入先の適用範囲は
 * `generate_indexes/run.ts` のモジュールヘッダを参照。
 *
 * 参考 Design: `docs/designs/integrity/index-auto-generation.md`（SC-002）
 * 参考 IR:   `docs/designs/integrity/rules/IR-061-index-generation-consistency.md`
 *
 * 使用資産: `cli_utils.ts`（parseArgs, findRepoRoot, EXIT_*）
 * require/import 混在許容（AG-001、既存資産踏襲）。
 */
import {
  EXIT_OK,
  EXIT_ERROR,
  parseArgs,
  findRepoRoot,
} from "../lib/cli_utils.ts";
import { run } from "./generate_indexes/run.ts";

const SCRIPT_NAME = "generate_indexes.ts";
const DESCRIPTION =
  "AgentDevFlow index auto-generation script (SC-002 Phase C, IR-061)";
const USAGE =
  "bun run generate_indexes.ts [--help] [--dry-run] [--root <path>]";

const HELP_TEXT = `${SCRIPT_NAME} ― ${DESCRIPTION}

USAGE:
  ${USAGE}

OPTIONS:
  --help            Show this help message
  --dry-run         Show what would be regenerated without writing files
  --root <path>     Explicit repository root (worktree/CI support)

EXIT CODES:
  0  All targeted indexes regenerated (or dry-run completed)
  1  Unused (kept for compatibility with EXIT_NG)
  2  Input error or execution failure

TARGET FILES (SC-002 Phase C):
  Wave 1:
    - docs/designs/integrity/integrity-rule-catalog.md (catalog IR entries)
    - docs/designs/integrity/rule-ownership.md (IR cross-reference appendix)
  Wave 2 (AG-008/009, DEC-009):
  - docs/decisions/README.md (decision-* blocks; skipped when absent)
    - docs/requirements/README.md (active REQ tables)
  Wave 5 (Phase E 残):
    - docs/README.md (REQ count summary + detailed table, readme-req-summary-*)

GENERATION SOURCE:
  - docs/designs/integrity/rules/IR-*.md (frontmatter + body Field/Value table)
  - docs/decisions/DEC-*.md (frontmatter; DEC-009)
  - docs/requirements/REQ-*.md (frontmatter)
  - docs/designs/**/*.md (file count, frontmatter status)

RELATED:
  - Design: docs/designs/integrity/index-auto-generation.md (SC-002)
  - IR:   docs/designs/integrity/rules/IR-061-index-generation-consistency.md
  - docs-check: check_integrity.ts checkIndexGenerationConsistency (IR-061)
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let options;
  try {
    options = parseArgs(args);
  } catch (e) {
    console.error(
      `[generate_indexes] ${e instanceof Error ? e.message : String(e)}`,
    );
    process.exit(EXIT_ERROR);
  }

  if (options.help) {
    // ヘルプテキストを標準形式で表示（exit 0）。
    console.log(HELP_TEXT);
    process.exit(EXIT_OK);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: options.root });

  await run(options, root);
}

if (import.meta.main) {
  main();
}
