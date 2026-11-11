// B1-1（Issue #4014・委譲 DEL-4014-1）変更後の CLI 利用側 4 skill baseline 比較。
//
// record-golden.ts が変更前に退避した .agentdev/tmp/del4014-evidence/cli-skill-baseline.json
// と、変更後に同一条件で実行した結果を比較する（compare: true のデータ非依存条件のみ）。
// 差分 0 件であることを TS-002 の非悪化証拠とする。終了後に cleanupFixtures() で
// 一時資材を回収する。

import { compareCliSkillBaseline, cleanupFixtures } from "./characterization-lib.ts";

const comparison = compareCliSkillBaseline();
console.log(`compared cases: ${comparison.compared}`);
if (comparison.differences.length === 0) {
  console.log("cli-skill baseline comparison: 0 differences (TS-002 non-regression confirmed)");
} else {
  console.log("cli-skill baseline comparison: DIFFERENCES FOUND");
  for (const difference of comparison.differences) {
    console.log(`  - ${difference}`);
  }
}
console.log(`baseline evidence: ${comparison.baselinePath}`);
cleanupFixtures();
process.exit(comparison.differences.length === 0 ? 0 : 1);
