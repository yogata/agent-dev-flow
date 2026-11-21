// Index auto-generation の CLI orchestration 本体（generate_indexes.ts 分割モジュール）。
//
// 対象索引（Wave 1）:
//   - `docs/designs/integrity/integrity-rule-catalog.md`（catalog IR エントリ一覧）
//   - `docs/designs/integrity/rule-ownership.md`（IR 別関連マッピング appendix）
//
// 自動生成マーカー（HTML コメント形式）で囲まれた領域を実ファイルから再生成し、
// 鮮度比較で差分のあるファイルのみを書き込む。
// docs-check（`check_integrity.ts`）の IR-061 検査が整合性を検証する。
//
// 参考 Design: `docs/designs/integrity/index-auto-generation.md`（SC-002）
// 参考 IR:   `docs/designs/integrity/rules/IR-061-index-generation-consistency.md`
//
// 使用資産: `cli_utils.ts`（parseArgs, findRepoRoot, EXIT_*）、分割モジュール
// （collectors / integrity_indexes / decision_readme / req_readme / docs_readme /
//   skill_manifest / measure_date / writer / markers）
// require/import 混在許容（AG-001、既存資産踏襲）。

import { EXIT_OK, EXIT_ERROR } from "../../lib/cli_utils.ts";
import type { CliOptions } from "../../lib/cli_utils.ts";
import {
  CATALOG_BLOCK_ID,
  DECISION_BASELINE_COUNT_BLOCK_ID,
  DECISION_BASELINE_TABLE_BLOCK_ID,
  DECISION_RELATED_REQ_TABLE_BLOCK_ID,
  DECISION_STATUS_ACCEPTED_BLOCK_ID,
  DECISION_STATUS_DEPRECATED_BLOCK_ID,
  DECISION_STATUS_PROPOSED_BLOCK_ID,
  DECISION_STATUS_SUPERSEDED_BLOCK_ID,
  README_DECISION_SUMMARY_TABLE_BLOCK_ID,
  README_REQ_SUMMARY_COUNT_BLOCK_ID,
  README_REQ_SUMMARY_TABLE_BLOCK_ID,
  REQ_ACTIVE_COUNT_BLOCK_ID,
  REQ_ACTIVE_TABLE_BLOCK_ID,
  REQ_IMPACT_MAP_BLOCK_ID,
  RULE_OWNERSHIP_BLOCK_ID,
  findAutogenBlocks,
  replaceAutogenBlock,
} from "./markers.ts";
import { readText } from "./markdown.ts";
import {
  collectDecisionFiles,
  collectIrFiles,
  collectReqFiles,
} from "./collectors.ts";
import {
  generateCatalogEntries,
  generateReqImpactMapCrossref,
  generateRuleOwnershipAppendix,
} from "./integrity_indexes.ts";
import {
  extractRelatedReqNotes,
  generateDecisionBaselineCaption,
  generateDecisionBaselineTable,
  generateDecisionRelatedReqTable,
  generateDecisionStatusList,
} from "./decision_readme.ts";
import { generateReqActiveCaption, generateReqActiveTable } from "./req_readme.ts";
import {
  generateDocsReadmeDecisionTable,
  generateReadmeReqSummaryCount,
} from "./docs_readme.ts";
import {
  SKILL_PROJECTION_MANIFEST_REL,
  deriveSkillProjectionManifestSkills,
  replaceSkillProjectionManifestGeneratedAt,
  replaceSkillProjectionManifestSkills,
} from "./skill_manifest.ts";
import { deriveMeasureDateFromLastCommit } from "./measure_date.ts";
import {
  pushIndexUpdateIfChanged,
  reportDryRunUpdates,
  writeIndexUpdates,
  type IndexUpdate,
} from "./writer.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

/**
 * セクション入力の不存在時の扱いを本体 / 導入先で分岐する。
 * 本体（rules dir 存在 = IR 管理対象）では従来どおり fail-fast で異常終了し、
 * 導入先（rules dir 不在）では IR-061 と同一の適用範囲（マーカー不在 =
 * 検証対象外）でスキップを記録して継続する（自動生成領域を持たない索引ファイルは
 * 導入先として正常な状態である）。
 */
function skipOrExit(hasIntegrityStructure: boolean, message: string): void {
  if (hasIntegrityStructure) {
    console.error(`[generate_indexes] ${message}`);
    process.exit(EXIT_ERROR);
  }
  console.log(
    `[generate_indexes] ${message} (integrity structure absent, skipping)`,
  );
}

/** content 内に存在しない AUTOGEN block ID の一覧を返す（全て存在すれば空配列）。 */
function missingAutogenIds(
  content: string,
  expectedIds: readonly string[],
): string[] {
  const foundIds = new Set(findAutogenBlocks(content).map((b) => b.id));
  return expectedIds.filter((id) => !foundIds.has(id));
}

export async function run(options: CliOptions, root: string): Promise<void> {
  const rulesDir = path.join(
    root,
    "docs", "designs",
    "integrity",
    "rules",
  );
  const catalogPath = path.join(
    root,
    "docs", "designs",
    "integrity",
    "integrity-rule-catalog.md",
  );
  const ruleOwnershipPath = path.join(
    root,
    "docs", "designs",
    "integrity",
    "rule-ownership.md",
  );
  const reqImpactMapPath = path.join(
    root, "docs", "designs", "responsibilities", "req-impact-map.md",
  );
  const skillProjectionManifestPath = path.join(
    root, ...SKILL_PROJECTION_MANIFEST_REL.split("/"),
  );
  const sourceSkillsDir = path.join(root, "src", "common", "skills");
  const decisionsDir = path.join(root, "docs", "decisions");
  const reqDir = path.join(root, "docs", "requirements");
  const decisionReadmePath = path.join(decisionsDir, "README.md");
  const reqReadmePath = path.join(reqDir, "README.md");

  // IR 管理対象判定: rules dir の存在は check_integrity.ts
  // checkIndexGenerationConsistency（IR-061）が既に使用する同一の存在条件である。
  // 本体（producer, rules dir 存在）では従来どおり全セクション必須の fail-fast を
  // 維持する。導入先（consumer, rules dir 不在）では integrity 系セクションを
  // スキップし、AUTOGEN 領域を保持するファイルのみを再生成する（IR-061 exemption
  // 「自動生成マーカーが存在しないファイルは検証対象外」と同一の適用範囲。
  // REQ-029-001: 配布成果物は producer 内部依存に依存しない）。
  //
  // ただし rules dir 不在でも catalog / rule-ownership が残存する場合は
  // consumer と分類しない。両ファイルは producer モードでは必須成果物であり、
  // 導入先（REQ-029: integrity 構造は producer 内部成果物）には存在しないため、
  // この残存は producer 側 integrity 構造の部分欠損を示す。consumer と誤分類すると
  // 全 fail-fast が skip 記録に退化し exit 0 で正常終了するため、rules dir 不在時の
  // 旧実装（#3898以前）と同一の fail-closed（exit 2）を維持する。
  const hasIntegrityStructure = fs.existsSync(rulesDir);
  if (
    !hasIntegrityStructure &&
    (fs.existsSync(catalogPath) || fs.existsSync(ruleOwnershipPath))
  ) {
    console.error(`[generate_indexes] rules dir not found: ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }
  const infos = hasIntegrityStructure ? collectIrFiles(rulesDir) : [];
  if (hasIntegrityStructure && infos.length === 0) {
    console.error(`[generate_indexes] no IR-*.md files found in ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }

  const decisionInfos = collectDecisionFiles(decisionsDir);
  const reqInfos = collectReqFiles(reqDir);

  const decisionBaselineCaption = generateDecisionBaselineCaption(
    decisionInfos,
  );
  const decisionBaselineTable = generateDecisionBaselineTable(decisionInfos);
  const decisionStatusAccepted = generateDecisionStatusList(
    decisionInfos,
    "accepted",
  );
  const decisionStatusProposed = generateDecisionStatusList(
    decisionInfos,
    "proposed",
  );
  const decisionStatusSuperseded = generateDecisionStatusList(
    decisionInfos,
    "superseded",
  );
  const decisionStatusDeprecated = generateDecisionStatusList(
    decisionInfos,
    "deprecated",
  );
  const reqActiveCaption = generateReqActiveCaption(reqInfos);
  const reqActiveTable = generateReqActiveTable(reqInfos);

  const readmeReqSummary = generateReadmeReqSummaryCount({
    activeReqCount: reqInfos.length,
  });

  // integrity 系の生成ブロックは rules dir が存在する場合のみ生成する。
  // カタログは rules レジストリから生成する（DEC-065 決定3 単一ソース）。
  // rules レジストリはカタログ生成源（DEC-065 決定3）。main 実行時の遅延 import
  // により、rules/index.ts ↔ generate_indexes.ts の静的循環 import を避ける
  // （ir-061.ts が generate_indexes.ts を静的 import するため）。
  const { rules: registryRules } = await import("../../rules/index.ts");
  const catalogEntries = hasIntegrityStructure
    ? generateCatalogEntries(registryRules)
    : [];
  const ruleOwnershipLines = hasIntegrityStructure
    ? generateRuleOwnershipAppendix(infos)
    : [];

  const updates: IndexUpdate[] = [];

  if (hasIntegrityStructure) {
    // catalog 更新
    const catalogOriginal = readText(catalogPath);
    if (catalogOriginal === null) {
      console.error(`[generate_indexes] catalog not found: ${catalogPath}`);
      process.exit(EXIT_ERROR);
    }
    let catalogUpdated = catalogOriginal;
    const catalogBlocks = findAutogenBlocks(catalogOriginal).filter(
      (b) => b.id === CATALOG_BLOCK_ID,
    );
    if (catalogBlocks.length === 0) {
      console.error(
        `[generate_indexes] catalog AUTOGEN markers not found. ` +
          `Expected id: ${CATALOG_BLOCK_ID}`,
      );
      process.exit(EXIT_ERROR);
    }
    catalogUpdated = replaceAutogenBlock(
      catalogUpdated,
      CATALOG_BLOCK_ID,
      catalogEntries,
    );
    pushIndexUpdateIfChanged(updates, catalogPath, catalogOriginal, catalogUpdated);

    // rule-ownership 更新
    const ruleOwnershipOriginal = readText(ruleOwnershipPath);
    if (ruleOwnershipOriginal === null) {
      console.error(
        `[generate_indexes] rule-ownership not found: ${ruleOwnershipPath}`,
      );
      process.exit(EXIT_ERROR);
    }
    const ruleOwnershipBlocks = findAutogenBlocks(
      ruleOwnershipOriginal,
    ).filter((b) => b.id === RULE_OWNERSHIP_BLOCK_ID);
    if (ruleOwnershipBlocks.length === 0) {
      console.error(
        `[generate_indexes] rule-ownership AUTOGEN marker not found. ` +
          `Expected id: ${RULE_OWNERSHIP_BLOCK_ID}`,
      );
      process.exit(EXIT_ERROR);
    }
    const ruleOwnershipUpdated = replaceAutogenBlock(
      ruleOwnershipOriginal,
      RULE_OWNERSHIP_BLOCK_ID,
      ruleOwnershipLines,
    );
    pushIndexUpdateIfChanged(updates, ruleOwnershipPath, ruleOwnershipOriginal, ruleOwnershipUpdated);

    // req-impact-map 逆方向対応（REQ → 影響する Rule IDs）の AUTOGEN 更新（B3-1）。
    // ファイル不在・マーカー不在時は人手編集領域として扱い、変更せず記録する
    // （他 README 系と同一の扱い。fail-fast しない）。
    const reqImpactMapOriginal = readText(reqImpactMapPath);
    if (reqImpactMapOriginal === null) {
      console.log(
        `[generate_indexes] req-impact-map not found, skipping: ${reqImpactMapPath}`,
      );
    } else {
      const reqImpactMapBlocks = findAutogenBlocks(reqImpactMapOriginal).filter(
        (b) => b.id === REQ_IMPACT_MAP_BLOCK_ID,
      );
      if (reqImpactMapBlocks.length === 0) {
        console.log(
          `[generate_indexes] req-impact-map AUTOGEN marker not found, skipping: ${REQ_IMPACT_MAP_BLOCK_ID}`,
        );
      } else {
        const reqImpactMapLines = generateReqImpactMapCrossref(infos, reqInfos);
        const reqImpactMapUpdated = replaceAutogenBlock(
          reqImpactMapOriginal,
          REQ_IMPACT_MAP_BLOCK_ID,
          reqImpactMapLines,
        );
        pushIndexUpdateIfChanged(updates, reqImpactMapPath, reqImpactMapOriginal, reqImpactMapUpdated);
      }
    }
  } else {
    console.log(
      `[generate_indexes] integrity catalog / rule-ownership not found, skipping (integrity structure absent)`,
    );
  }

  // skill-projection-manifest.yaml の skills セクション再生成（B3-3）。
  // 正規情報源（src/common/skills 列挙）から導出し、third_party_skills と
  // ヘッダーは既存内容を保持する。manifest 不在時はスキップ（導入先に manifest は
  // 存在しない。IR-068 検査の skip 挙動と同一の適用範囲）。
  const manifestOriginal = readText(skillProjectionManifestPath);
  if (manifestOriginal === null) {
    console.log(
      `[generate_indexes] skill-projection-manifest not found, skipping: ${skillProjectionManifestPath}`,
    );
  } else if (!fs.existsSync(sourceSkillsDir)) {
    console.log(
      `[generate_indexes] src/common/skills not found, manifest regeneration skipped`,
    );
  } else {
    const skills = deriveSkillProjectionManifestSkills(sourceSkillsDir);
    const generatedAt =
      deriveMeasureDateFromLastCommit(root, [sourceSkillsDir]) ??
      new Date().toISOString().slice(0, 10);
    let manifestUpdated = replaceSkillProjectionManifestSkills(
      manifestOriginal,
      skills,
    );
    manifestUpdated = replaceSkillProjectionManifestGeneratedAt(
      manifestUpdated,
      generatedAt,
    );
    pushIndexUpdateIfChanged(updates, skillProjectionManifestPath, manifestOriginal, manifestUpdated);
    if (options.dryRun) {
      console.log(
        `[generate_indexes] skill-projection-manifest: ${skills.length} skills derived from src/common/skills`,
      );
    }
  }

  // Decision README 更新 (AG-008 / DEC-009)。対象ファイル不存在時はスキップ。
  const decisionReadmeOriginal = readText(decisionReadmePath);
  if (decisionReadmeOriginal === null) {
    console.log(
      `[generate_indexes] Decision README not found, skipping: ${decisionReadmePath}`,
    );
  } else {
    const decisionReadmeExpectedIds = [
      DECISION_BASELINE_COUNT_BLOCK_ID,
      DECISION_BASELINE_TABLE_BLOCK_ID,
      DECISION_STATUS_ACCEPTED_BLOCK_ID,
      DECISION_STATUS_PROPOSED_BLOCK_ID,
      DECISION_STATUS_SUPERSEDED_BLOCK_ID,
      DECISION_STATUS_DEPRECATED_BLOCK_ID,
      DECISION_RELATED_REQ_TABLE_BLOCK_ID,
    ];
    const decisionReadmeMissing = missingAutogenIds(
      decisionReadmeOriginal,
      decisionReadmeExpectedIds,
    );
    if (decisionReadmeMissing.length > 0) {
      skipOrExit(
        hasIntegrityStructure,
        `Decision README AUTOGEN markers not found: ${decisionReadmeMissing.join(", ")}`,
      );
    }
    // 欠落マーカーがあっても、存在する AUTOGEN 領域は独立に再生成する
    // （PR #3898 本文「マーカーがあれば通常再生成」。部分マーカーで
    // 既存領域の陳腐化を残さない）。replaceAutogenBlock は未検出 block を
    // unchanged で返すため、欠落分は書込み差分にならない。
    const relatedReqNotes = extractRelatedReqNotes(decisionReadmeOriginal);
    const decisionRelatedReqTable = generateDecisionRelatedReqTable(
      decisionInfos,
      relatedReqNotes,
    );
    let decisionReadmeUpdated = decisionReadmeOriginal;
    const decisionReadmeReplacements: Record<string, string[]> = {
      [DECISION_BASELINE_COUNT_BLOCK_ID]: decisionBaselineCaption,
      [DECISION_BASELINE_TABLE_BLOCK_ID]: decisionBaselineTable,
      [DECISION_STATUS_ACCEPTED_BLOCK_ID]: decisionStatusAccepted,
      [DECISION_STATUS_PROPOSED_BLOCK_ID]: decisionStatusProposed,
      [DECISION_STATUS_SUPERSEDED_BLOCK_ID]: decisionStatusSuperseded,
      [DECISION_STATUS_DEPRECATED_BLOCK_ID]: decisionStatusDeprecated,
      [DECISION_RELATED_REQ_TABLE_BLOCK_ID]: decisionRelatedReqTable,
    };
    for (const blockId of decisionReadmeExpectedIds) {
      decisionReadmeUpdated = replaceAutogenBlock(
        decisionReadmeUpdated,
        blockId,
        decisionReadmeReplacements[blockId]!,
      );
    }
    pushIndexUpdateIfChanged(updates, decisionReadmePath, decisionReadmeOriginal, decisionReadmeUpdated);
  }

  // REQ README 更新 (AG-009)。マーカー欠落は IR-061 と同一の取り扱い
  // （マーカー不在 = 検証対象外）で記録し、本体では従来どおり fail-fast。
  // 欠落があっても存在する AUTOGEN 領域は独立に再生成する。
  const reqReadmeOriginal = readText(reqReadmePath);
  if (reqReadmeOriginal === null) {
    skipOrExit(hasIntegrityStructure, `REQ README not found: ${reqReadmePath}`);
  } else {
    const reqReadmeExpectedIds = [
      REQ_ACTIVE_COUNT_BLOCK_ID,
      REQ_ACTIVE_TABLE_BLOCK_ID,
    ];
    const reqReadmeMissing = missingAutogenIds(
      reqReadmeOriginal,
      reqReadmeExpectedIds,
    );
    if (reqReadmeMissing.length > 0) {
      skipOrExit(
        hasIntegrityStructure,
        `REQ README AUTOGEN markers not found: ${reqReadmeMissing.join(", ")}`,
      );
    }
    // 欠落マーカーがあっても、存在する AUTOGEN 領域は独立に再生成する
    // （PR #3898 本文「マーカーがあれば通常再生成」。部分マーカーで
    // 既存領域の陳腐化を残さない）。
    let reqReadmeUpdated = reqReadmeOriginal;
    const reqReadmeReplacements: Record<string, string[]> = {
      [REQ_ACTIVE_COUNT_BLOCK_ID]: reqActiveCaption,
      [REQ_ACTIVE_TABLE_BLOCK_ID]: reqActiveTable,
    };
    for (const blockId of reqReadmeExpectedIds) {
      reqReadmeUpdated = replaceAutogenBlock(
        reqReadmeUpdated,
        blockId,
        reqReadmeReplacements[blockId]!,
      );
    }
    pushIndexUpdateIfChanged(updates, reqReadmePath, reqReadmeOriginal, reqReadmeUpdated);
  }

  // docs/README.md 更新 (Phase E 残, Wave 5 / REQ-057-018 readme-req-summary-table)
  const docsReadmePath = path.join(root, "docs", "README.md");
  const docsReadmeOriginal = readText(docsReadmePath);
  if (docsReadmeOriginal === null) {
    skipOrExit(
      hasIntegrityStructure,
      `docs/README.md not found: ${docsReadmePath}`,
    );
  } else {
    const docsReadmeExpectedIds = [
      README_REQ_SUMMARY_COUNT_BLOCK_ID,
      README_REQ_SUMMARY_TABLE_BLOCK_ID,
      README_DECISION_SUMMARY_TABLE_BLOCK_ID,
    ];
    const docsReadmeMissing = missingAutogenIds(
      docsReadmeOriginal,
      docsReadmeExpectedIds,
    );
    if (docsReadmeMissing.length > 0) {
      skipOrExit(
        hasIntegrityStructure,
        `docs/README.md AUTOGEN markers not found: ${docsReadmeMissing.join(", ")}`,
      );
    }
    // 欠落マーカーがあっても、存在する AUTOGEN 領域は独立に再生成する
    // （他 README セクションと同一の扱い）。
    let docsReadmeUpdated = docsReadmeOriginal;
    const docsReadmeReplacements: Record<string, string[]> = {
      [README_REQ_SUMMARY_COUNT_BLOCK_ID]: readmeReqSummary,
      [README_REQ_SUMMARY_TABLE_BLOCK_ID]: generateReqActiveTable(
        reqInfos,
        "requirements/",
      ),
      [README_DECISION_SUMMARY_TABLE_BLOCK_ID]: generateDocsReadmeDecisionTable(
        decisionInfos,
      ),
    };
    for (const blockId of docsReadmeExpectedIds) {
      docsReadmeUpdated = replaceAutogenBlock(
        docsReadmeUpdated,
        blockId,
        docsReadmeReplacements[blockId]!,
      );
    }
    pushIndexUpdateIfChanged(updates, docsReadmePath, docsReadmeOriginal, docsReadmeUpdated);
  }

  if (options.dryRun) {
    if (hasIntegrityStructure) {
      console.log(
        `[generate_indexes] dry-run: ${infos.length} IR files collected`,
      );
      console.log(
        `[generate_indexes] catalog entries: ${catalogEntries.length} entries`,
      );
      console.log(
        `[generate_indexes] catalog source: rules registry (single source),`,
      );
      console.log(
        `[generate_indexes] rule-ownership appendix: ${ruleOwnershipLines.length} rows (incl. header)`,
      );
    }
    console.log(
      `[generate_indexes] Decision README: ${decisionInfos.length} decisions`,
    );
    console.log(
      `[generate_indexes] REQ README: ${reqInfos.length} REQs`,
    );
    console.log(
      `[generate_indexes] docs/README.md: REQ summary=${reqInfos.length}, table=${reqActiveTable.length - 2} rows, Decision table=${decisionInfos.length} rows`,
    );
    reportDryRunUpdates(updates);
    process.exit(EXIT_OK);
  }

  writeIndexUpdates(updates);
  process.exit(EXIT_OK);
}
