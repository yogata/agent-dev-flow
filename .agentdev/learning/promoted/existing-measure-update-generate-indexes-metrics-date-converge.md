# generate_indexes 派生物の計測日収束規律を Definition PR 工程へ補足する

## 背景

generate_indexes の req-metrics 計測日は計測対象ファイルの commit author date から導出されるため、commit 前実行では 1 日遅れの値を出力する（Case #3507）。RA-009 の工程順序修正（check_integrity/traceability-check を stage-and-commit 後へ移動）後も、generate_indexes は「REQ 行編集、generate_indexes、stage・commit」順で commit 前配置のままであり、初回実行で計測日がずれた場合は同一 PR 内の再 commit で収束する運用がとられている。

## 問題

definition-pr-and-idempotency.md:29 の工程順序契約は後段 2 検査（check_integrity、traceability check）のみを対象とし、generate_indexes 派生物の計測日ずれを再 commit で収束させる運用の規律は工程文書へ未反映（adversarial-review で実証。docs/knowledge/ にも該当知識なし）。

## 望ましい変更

definition-pr-and-idempotency.md へ「generate_indexes は commit 前配置で計測日が 1 日遅れになり得る。計測日が対象ファイルの最終内容変更日とずれた場合は同一 PR 内で派生物を再 commit して収束させる」の一文規律を追加する。

## 対象範囲

### 対象
- src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md

### 対象外
- generate_indexes の計測日導出方式の変更（別契約）
- IR-072 の鮮度判定方式（別契約）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | 計測日収束（同一 PR 内再 commit）の一文規律 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: definition-pr-and-idempotency.md:29（後段 2 検査の工程順序契約）、deferred L1211（AUTOGEN 計測日の日付境界発火）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: generate_indexes 派生物の計測日収束運用が未明文化（review 実測）

## 制約

- なし（一文規律の追記）

## 受け入れ条件

- [ ] 計測日ずれの再 commit 収束規律が工程文書へ記載される

## 元learning item / 根拠

- **要約**: generate_indexes req-metrics 計測日の 1 日遅れと収束運用（Case #3507・旧 C2 entry 3。adversarial-review により promote へ分割）
- **根拠**: 計測日の commit author date 導出の実装、RA-009 適用後も commit 前配置が残る実測
- **再発条件**: REQ 行編集を伴う Definition PR 機械工程（毎回計測日ずれの可能性）
- **横展開可能性**: git 履歴依存の日付を持つ派生物生成一般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
