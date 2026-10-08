# prepare_definition_pr の traceabilityGate 判定を missing-design status へ限定する

## 背景

case-open STEP-4 の機械工程（prepare_definition_pr.ts）が、新規 REQ 行を含む Definition PR で traceability check の exit code を一律 fail として扱い、機械工程が failure 終了・proposal PR 本文が空になる事象が Case #3507 と Case #3525 で再発した（PR #3350 に先行例）。traceability check の exit code は 9 種検査全体の合否であり、case-run/case-ready 段階の前提である missing-implementation/verification 未充足を含むため、case-open の正規ゲート（missing-design 0 件）と意味が一致しない。

## 問題

prepare_definition_pr.ts L417-419 は check.exitCode !== 0 を一律 fail（assembleReport(false)）として扱い、stdout JSON の checks.missing-design.status に基づく判定を実装していない（実測確認済み）。恒久対なしでは新規 REQ 行追加を伴う case-open STEP-4 で毎回再発する。

## 望ましい変更

prepare_definition_pr.ts の traceabilityGate 判定を、exit code でなく stdout JSON の checks.missing-design.status（pass/fail）に基づく判定へ限定する。または gate 対象 check 名を明示する。case-open Design「機械工程の script 呼び出し契約」節に gate 判定粒度の契約を明記する。

## 対象範囲

### 対象
- src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts
- docs/designs/commands/case-open.md（機械工程の script 呼び出し契約節）

### 対象外
- traceability check 本体（9 種検査の exit code 体系は別契約）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill script | src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts | traceabilityGate 判定の missing-design status 限定 |
| Design | docs/designs/commands/case-open.md | gate 判定粒度の契約明記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: prepare_definition_pr.ts（gate 実装自体）、deferred L2045（missing-verification 必然性の知見）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: gate 判定の粒度（exit code 一律 vs missing-design status）が未実装・未契約

## 制約

- script 変更を伴うため実現方法の確定は req-define の変更影響分析に委ねる（Decision/REQ 候補は制約として記録）

## 受け入れ条件

- [ ] traceabilityGate 判定が missing-design status に基づくことが実装または契約で明示される
- [ ] 新規 REQ 行を含む Definition PR で機械工程が failure 終了しないことが確認される

## 元learning item / 根拠

- **要約**: traceabilityGate exit code 判定粒度（2エントリ: Case #3507・#3525、PR #3350 先行例）
- **根拠**: prepare_definition_pr.ts L417-419 の一律 fail 実装（実測）、Case #3525 での exit 2 / failure 終了・PR 本文空の実害
- **再発条件**: 新規 REQ 行追加を伴う case-open STEP-4 機械工程（恒久対なしでは毎回）
- **横展開可能性**: 複数検査を集約する checker の exit code を単一ゲートへ使う場面一般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: なし
