// B1-1（Issue #4014・委譲 DEL-4014-1）変更前特性化の golden 記録スクリプト。
//
// 変更前のリポジトリ状態で実行し、3工程入口の CLI 特性化結果（正規化済み）を
// golden/characterization.json へ UTF-8 明示で書き出す。さらに TS-002 のための
// B1-1 利用側 4 skill の CLI baseline を .agentdev/tmp/del4014-evidence/ へ退避する
//（退避は当該実行内で比較・消費し、実行内で削除する）。
//
// golden の更新は原則禁止（特性化の SSoT は変更前実測）。意図的な契約変更時に限り
// 対応する Case の手順で更新する。

import * as fs from "node:fs";
import * as path from "node:path";
import {
  EVIDENCE_DIR,
  REPO_ROOT,
  cleanupFixtures,
  persistCliSkillBaseline,
  recordGateEntryOutcomes,
} from "./characterization-lib.ts";

// golden 再生成なしで CLI 利用側 4 skill の baseline だけを退避するモード
//（golden は変更前実測の SSoT であり、変更後の再退避では上書きしない）。
if (process.argv.includes("--cli-baseline-only")) {
  const baselineRelative = persistCliSkillBaseline();
  console.log(`cli-skill baseline evidence written: ${baselineRelative}`);
  process.exit(0);
}

const golden = {
  recordedPurpose: "B1-1 (Issue #4014 / DEL-4014-1) pre-change characterization of the 3 gate entry scripts (TS-001)",
  recordedAt: new Date().toISOString(),
  gateEntryOutcomes: recordGateEntryOutcomes(),
};

const goldenRelative = "scripts/self/case-gate-shared-lib-b1-1/golden/characterization.json";
const goldenAbsolute = path.join(REPO_ROOT, goldenRelative);
fs.mkdirSync(path.dirname(goldenAbsolute), { recursive: true });
fs.writeFileSync(goldenAbsolute, `${JSON.stringify(golden, null, 2)}\n`, "utf-8");

const baselineRelative = persistCliSkillBaseline();

console.log(`golden written: ${goldenRelative}`);
console.log(`cli-skill baseline evidence written: ${baselineRelative}`);
console.log(`entries recorded: ${Object.keys(golden.gateEntryOutcomes).length}`);
for (const [entry, outcomes] of Object.entries(golden.gateEntryOutcomes)) {
  console.log(`  ${entry}: ${Object.keys(outcomes).length} cases`);
}
console.log(`evidence dir (in-run only): ${EVIDENCE_DIR}`);
