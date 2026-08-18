# IR-055 baseline 超過（agentdev-artifact-graph 系 docs/specs 参照）と bucket 再計算の時期

## 観測
IR-055 runtime-unresolved-reference 実修復回帰テスト（Issue #1782）が失敗する。src/opencode/skills/agentdev-artifact-graph/SKILL.md:268 と references/tim.md:5 の docs/specs/ 参照2件が ir-055-baseline.json の既知 bucket を超過（heuristic 違反）。バッチ定義層 commit 由来と推定され、base（5d89b9df）でも再現する既存失敗。

## 今回扱わない理由
SPEC は heuristic 違反の bucket 再計算を許容するが、integrity-contracts「baseline 再生成分実行契約」の並列 Wave での同一 baseline 二重更新禁止に従い、Wave 1 並列実行中の各 PR では対処せず記録に留めた。

## 影響
full integrity suite が恒常的に失敗する（文書参照は解決しており誤検出側の問題）。checker 準拠更新（狭域化）は Issue #2210（OU-0015、Epic #2205 Wave 2）が担う。

## レビューで決めること
- #2210 の checker 準拠更新と合わせて bucket 再計算・baseline 再生成を実施するか、参照側（SKILL.md / tim.md の参照解決）を修正するか。

## 根拠
- PR 2254 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2254）
