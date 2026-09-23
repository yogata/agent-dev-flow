# project-knowledge: 自己完結 checker への決定的実装共有は同一形式リーダー複製 + 対決テストで機械担保する

## 背景

PR #3075 case-run（Case #3063・Issue #3069・DEL-3069-3）で、check_integrity へ既知欠番レジストリ免除（REQ-087-004、numbering-policy.md「既知の欠番」節の読込）を実装した際、抽出ロジックを alloc-req-number.ts の `extractKnownGapNumbers` と共有する構成を検討した。checker（.opencode/skills/repo-* 配下）は自己完結実行が前提で、テストは checker を一時 fixture へ copy して実行する fixture 進行テスト構成（copyScripts 規約）を取る。静的 import で決定的実装を共有すると、fixture copy 構成で import 解決が失敗し全テストが起動不能になる前提衝突を検知した。

## 問題

自己完結 checker への決定的実装の静的 import 共有は、fixture 進行テスト構成（一時 fixture への copy + 実行）と衝突する。衝突を避けつつ単一情報源を担保する「同一形式リーダー複製 + 対決テスト」パターンが PR #3075 で実装・機械検証されたが、パターン自体の手順・規約としての文書化が不在で、次回 checker 追加・改修時に同じ設計検討をゼロから繰り返すことになる。

## 望ましい変更

次のパターンを手順・規約として文書化する:

1. **同一形式リーダー複製**: 抽出ロジックを文字列レベルで同一の形式で複製する（データ単一情報源は複製せず、動的読込で維持する）
2. **対決テスト**: 実リポジトリの単一情報源データ + 合成データパターン（PR #3075 実績では 6パターン）で、両リーダー出力の同値性を機械検証する。これにより複製の逸脱を恒常的に検出し、単一情報源契約を維持する

反映先の最終選択は下流で確定する（docs/knowledge/ 知識文書としての保存は backlog-review の利用者承認後に直接保存され、RU → req-define の要件化経路を通らない）。

## 対象範囲

### 対象

- パターン文書の新規作成（docs/knowledge/ 知識文書、または repo-agentdev-integrity の実装規約）
- 検討対象になる実装面: docs/knowledge/（1知識1ファイル・kebab-case slug・必須内容5項目の知識文書契約）、src/opencode/skills/repo-agentdev-integrity/（SKILL.md または references の実装規約）

### 対象外

- PR #3075 で完了した実装自体の変更（check_integrity.ts / check_integrity.test.ts）
- copyScripts fixture 規約自体の変更（既存規約を前提とする知見）
- 配布 skill・command への反映（本件は repo-local checker 系の実装パターン）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/（新規知識文書。slug 例: checker-fixture-import-share-adversarial-test-pattern） | パターンの手順文書化（fixture copy 構成での import 共有禁止と、リーダー複製 + 対決テストによる単一情報源担保の手順） |
| 配布skill（repo-local・実装規約） | src/opencode/skills/repo-agentdev-integrity/（SKILL.md または references） | checker 実装規約へのパターン規約追記 |

## 既存対策確認

- **確認結果**: あり（部分的。fixture copy 規約は既存、パターン文書は不在）
- **該当ファイル**: 対応実装: src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts L560-562（単一情報源維持コメント・対決テスト言及）、同 scripts/check_integrity.test.ts L17（「REQ-087-004 対決テスト用」）・L5166（実リポジトリ numbering-policy での同値性検証テスト）。git commit e4264eb9（PR #3075）の commit message に「抽出形式は alloc-req-number.ts の extractKnownGapNumbers と同一（単一情報源は numbering-policy.md、対決テストで機械検証）」明記。fixture copy 規約の既存記録: deferred pool の 2026-09-12 IR-062 copyScripts エントリ（設計知見）。パターンの手順・規約文書: なし（配下 grep で対決テスト言及は test.ts と check_integrity.ts のみを機械確認）
- **ギャップ分類**: fix gap（実装パターンの手順文書不在）
- **ギャップ詳細**: パターンが特定実装内にしか存在せず、一般規約・手順として参照できない。checker 追加・改修時に実装共有が必要になるたびに同種の前提衝突と設計検討が再発する

## 制約

- 対応実装は完了済み（PR #3075・e4264eb9、回帰テスト 7 件追加済み）。req-define は既存実装を再調査の上、文書化の実現面を確定する
- docs/knowledge/ 保存の場合は知識文書契約（1知識1ファイル、kebab-case slug、必須内容5項目）に従い、backlog-review の利用者承認後に直接保存される（RU → req-define 経路を通らない）
- 本パターンは repo-local checker 系（.opencode/skills/repo-*）に特化した知見であり、配布対象 Skill への一般化は行わない
- 単一情報源契約（第二のレジストリ不在）の維持が本パターンの目的であり、複製はデータではなくロジックに限る

## 受け入れ条件

- [ ] 「fixture 進行テスト構成では自己完結 checker への静的 import 共有が不可避的に壊れる」前提と、「同一形式リーダー複製 + 対決テスト」パターンの手順が文書化されている
- [ ] パターン適用の対象範囲（repo-local checker 系の決定的実装共有）と単一情報源契約の維持条件が明記されている
- [ ] 既存実装（PR #3075）との整合（パターンの実例への参照）が取れている

## 元learning item / 根拠

- **要約**: 自己完結 checker への実装共有は fixture 進行テスト構成と衝突するため同一形式リーダー複製 + 対決テストで担保する
- **根拠**: PR #3075 case-run 実測。fixture テスト構成分析で import 解決失敗の前提衝突を検知 → 同一形式リーダー複製（抽出ロジック文字列レベル同一・データ単一情報源 numbering-policy 動的読込維持）+ 対決テスト（実リポジトリ numbering-policy + 合成 policy 6パターンで両リーダー出力の同値性を機械検証）で単一情報源を恒常担保。実装・テスト・commit message の証跡を本評価実行で機械確認。単一情報源契約は維持（第二のレジストリ〔欠番データ実体〕は存在しない）
- **再発条件**: 自己完結 checker（.opencode/skills/repo-* 配下）への決定的実装共有が必要になった場合
- **横展開可能性**: repo-local checker 系（.opencode/skills/repo-*）の決定的実装共有全般。fixture copy 規約を持つ同種構成のプロジェクトでも発生し得る

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #3069・Case #3063（PR #3075）
