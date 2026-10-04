# checker baseline の provenance 保全・merge 側登録の運用確立

## 背景

checker baseline の登録・更新経路で provenance（判断記録）の保全と merge 側での登録が未整備なため、NG 計上残続・判断記録喪失・pre-existing 分類の反復が3系統で観測された。

## 問題

(1) 廃止 REQ 行参照の文言是正だけでは phantom NG（IR-067・REQ-003-055）が解消せず、NG baseline の provenance 付き登録が必要だった。(2) IR-055 baseline 再生成（--update-ir055-baseline）は既存 approved エントリの provenance（classification/reason・Issue #3211 由来の判断記録）を喪失させる（git restore で復旧、cap のみ手動更新で対処）。(3) 他 Case の REQ 行 merge 起因の frontmatter updated ドリフト（16ファイル・19件）が baseline 未登録のまま後続 worktree 実測で pre-existing として反復観測される。

## 望ましい変更

REQ-010-079（baseline 追加は provenance を伴い、cap 引上げは既存契約の明示フラグ経由のみ）の運用を手順へ反映する: (a) baseline 更新で cap 引上げと全量再生成を使い分け（再生成実行前の approved エントリ確認を前置）、(b) REQ 行 merge を伴う case-close の baseline 更新手順で frontmatter ドリフト・NG baseline の provenance 付き登録を規約化、(c) 参照是正系 ACT には NG baseline 要否の実測確認を案内。

## 対象範囲

### 対象

- case-close の baseline 更新手順（`src/common/skills/agentdev-workflow-case-close/references/` 側）
- integrity-contracts.md の NG baseline 運用・IR-055 手順（docs/designs/integrity/integrity-contracts.md 実在）
- REQ-010-079 の運用面（docs/requirements/REQ-010.md L53 実在）

### 対象外

- checker の baseline 形式・コマンド仕様の変更（--update-warning-cap / --raise-warning-cap 等の現行フラグ運用は維持）
- REQ-010-079 の要件本文変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-close/references/（baseline 更新手順） | merge 側での provenance 付き baseline 登録・再生成時の保全確認の規約化 |
| Design | docs/designs/integrity/integrity-contracts.md | baseline 更新運用の明文化候補 |
| 配布skill reference | req-define 側 artifact_actions テンプレート | 参照是正系 ACT の NG baseline 要否確認の案内候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（運用不備）
- **該当ファイル**: docs/requirements/REQ-010.md REQ-010-079（baseline は provenance を伴う等。2026-10-05 実測）
- **ギャップ分類**: fix gap + application miss
- **ギャップ詳細**: 要件は存在するが、merge 側（case-close baseline 手順）での登録規約・再生成経路の保全確認手順が未整備で、要件の適用が部分的

## 制約

- REQ-010-079 の契約内容は変更しない（運用の整備のみ）
- baseline 再生成コマンドの廃止・変更を本件で要求しない

## 受け入れ条件

- [ ] baseline 更新手順に cap 更新と全量再生成の使い分けと approved エントリ確認が明記される
- [ ] REQ 行 merge を伴う case-close での baseline 登録（frontmatter ドリフト・NG baseline）が規約化される
- [ ] 参照是正系 ACT の baseline 要否確認が案内される

## 元learning item / 根拠

- **要約**: baseline provenance 保全・登録欠落の3系統（phantom NG baseline 未登録・再生成による provenance 喪失・frontmatter ドリフト未登録）
- **根拠**: Case #3336・PR #3346（REQ-003-055 phantom NG 残存・REQ-003-030 は baseline-known で処理される対比）、Case #3431・PR #3438（baseline 再生成で approved provenance 喪失・git restore で復旧し cap 手動更新）、Case #3447・PR #3453（frontmatter updated ドリフト 19件が worktree と main root で同数・他 Case merge 起因）
- **再発条件**: baseline 再生成を cap 更新目的で実行する場合、REQ 行 merge 後に baseline 未登録で後続 Case が分岐する場合、廃止 REQ 行参照を是正しても baseline 登録しない場合
- **横展開可能性**: baseline 運用を持つ checker 系全般（IR-055・IR-067・frontmatter freshness）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, workflow
- **関連Issue**: Issue #3293 Wave 1（phantom citation 起点・参照）
