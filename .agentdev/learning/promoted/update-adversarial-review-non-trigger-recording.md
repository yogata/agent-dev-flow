# adversarial-review 発動契約非該当時の判定理由記録様式の整備（silent skip 回避）

## 背景

Batch 対象 10 Case（#2831 / #2832、PR #2876 / #2877 を含む）の case-run 委譲と case-close 対応記録コメント作成において、adversarial-review の発動契約に非該当（Issue 本文の契約「該当なし」）の case で審議をスキップした際、判定理由を記録する様式が規定されていなかった。実行者が独自に PR 本文・対応記録へ理由を残したが、記録する／しないは実行者依存であり、silent skip では後工程の独立性検査（QG-4 等）で「レビュー未実施」と区別できなくなる。

## 問題

発動契約（default-on、skip policy、adapter の発動条件判定）は存在するが、条件非該当でスキップする際に判定理由を記録する様式・義務が規定されていない。特に (a) case-close の対応記録コメントテンプレートに adversarial-review の判定欄がなく、検証差分テーブルに行が存在しない case が「未実施」と誤認され得る、(b) 委譲 prompt の default-on 指示と Issue 本文の発動契約「該当なし」が不一致になる委譲で、非発動の判断根拠が委譲先に伝わらず silent skip になる、の2局面がある。

## 望ましい変更

- 対応記録コメントテンプレートへ adversarial-review の判定欄（発動 / 非発動+理由）を追加する
- 委譲 prompt に「adversarial-review の発動条件は Issue 本文の実行契約を正とする」を明記する
- 非発動時は PR 本文（case-run 委譲）または対応記録コメント（case-close）へ判定理由の記録を必須とし、代替としての自己反証（却下案・緩和策・unresolved なしの確認）の実施・記録を様式化する

## 対象範囲

### 対象

- workflow-templates の対応記録コメントテンプレート（issue_comment_bug_record.md 系）
- agentdev-case-run-execution-adapter の委譲 prompt・adversarial-review 統合 reference（非発動時の記録義務）
- case-run の委譲 prompt 作成手順、case-close の対応記録コメント作成手順

### 対象外

- adversarial-review 自体の審議プロトコル・発動条件の変更（adversarial-review Design が正規所有）
- 発動契約セクションを持つ Issue テンプレート（issue_desc_child.md / issue_desc_feature.md）の構造変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| template | .opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md | 対応記録への adversarial-review 判定欄（発動/非発動+理由）追加 |
| 配布skill | .opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md | 非発動時の判定理由記録義務・自己反証の様式規定 |
| 配布skill | case-run の委譲 prompt 手順（references） | 「発動条件は Issue 本文契約を正とする」の明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: adapter reference「発動条件判定」節（発動条件はユーザー明示指定のみを正とする、発動条件判定と review 呼出の分離、非該当時の従来フロー維持）、Issue テンプレート「adversarial-review 発動契約（任意）」節
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 非発動時の記録様式・記録義務が規定されていない（対応記録テンプレートに判定欄なし、adapter reference に非発動記録の要求なし）。silent skip が「レビュー未実施」と区別不能なまま残る

## 制約

- 発動条件判定・再 review 条件の正は adversarial-review Design が所有する（本変更は記録様式の整備に留める）
- 対応記録コメントは case-close が単一書き手となる運用を維持する

## 受け入れ条件

- [ ] 対応記録コメントテンプレートに adversarial-review の判定欄（発動 / 非発動+理由）が存在すること
- [ ] 委譲 prompt 手順に「発動条件は Issue 本文契約を正とする」旨が明記されていること
- [ ] 非発動時の判定理由記録が必須化され、非発動 case でも対応記録・PR 本文から実施有無と理由が確認できること

## 元learning item / 根拠

- **要約**: adversarial-review 発動契約非該当の case（bugfix / maintenance 系）で審議をスキップする際、判定理由を記録しないと「レビュー未実施」と誤認され得る。Batch 10 Case の case-close 対応記録と case-run 委譲（Case #2831 / #2832、PR #2876 / #2877）の両面で、非発動理由の明記と代替の自己反証を記録する運用を実施し、有効性を確認した。
- **根拠**: 発動条件の判定主体は Issue 本文の実行契約（ユーザー明示指定のみを正とする）が委譲 prompt の default-on 指示に優先するが、この判定主体と非発動時の記録義務が委譲先に伝わっていなかった。非発動 case も「発動契約非該当（対象: bugfix/maintenance の機械検証中心、合意形成対象なし）」を対応記録へ明記すれば検証証跡として完備する。
- **再発条件**: 発動契約を持つ検査（adversarial-review）を条件非該当でスキップする case、および default-on 指示と Issue 本文の発動契約「該当なし」が不一致になる委譲（bugfix / maintenance 系で高頻度）
- **横展開可能性**: 条件分岐する検査（発動契約持ち gate）とサブエージェント委譲全般。silent skip は後工程の独立性検査で未実施と区別できなくなる
- **prune 証拠**: inbox.md 2026-09-16 実行分「adversarial-review 発動契約非該当の case も判定理由を対応記録に残す（silent skip 回避）」「adversarial-review の発動条件非該当時は silent skip せず判定理由を記録し、代替として自己反証を実施する」の2エントリ（削除前の完全本文は git 履歴の inbox.md @ 795bfb19 を正とする）

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: documentation, workflow
- **関連Issue**: Case #2831、Case #2832、PR #2876、PR #2877
