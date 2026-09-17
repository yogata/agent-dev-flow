# agentdev_gh 本文更新の全文置換モデル明示と最小差分編集手順の整備

## 背景

agentdev_gh の issue_update / pr_update は渡した body 全文による全面置換である。この操作モデルの把握不足により、case-close で要約版 body を書き込んで元セクションを欠落させた事案（Case #2902、2026-09-17）と、子 agent による長文本文の全面再構成が2回失敗した事案（Case #2898 の case-ready stage）が発生した。いずれも再読込の事後確認で検知・復元したが、予防手順が規約化されていない。

## 問題

- issue_update / pr_update が全文置換であるという操作モデルが操作手順書に明示されていない
- 「元本文取得 → 最小差分変換 → 全文書き戻し」の編集手順が workflow・委譲プロンプトに明文化されていない
- 長文本文の更新を子 agent に委譲する場合の部分更新指定（precise old/new 行指定）と Tool 管理フィールド（trackingState 等）の親適用原則が delegation 指針にない

## 望ましい変更

- Issue/PR 本文更新操作の説明に全文置換モデルを明示する
- 「元本文取得 → 最小差分行編集 → 全文書き戻し → 再読込全文前後比較」を一連の安全手順として手順書に規約化する
- case-ready / case-run 等の delegation 指針に「本文更新は precise old/new 行指定による部分更新」「trackingState 等 Tool 管理フィールドは親または正規機構で適用」を明記する
- 更新後の VERIFY に state 突合を含める（deferred L2269: body 更新のみの issue_update 後に Issue state が closed へ変化した事象の統合）

## 対象範囲

### 対象

- agentdev-issue-management / agentdev-issue-tracking の Issue・PR 更新操作手順
- case-close、case-revise、epic-tracker、issue 等の本文更新を行う workflow
- case-ready / case-run の delegation 指針（委譲プロンプトテンプレート）

### 対象外

- agentdev_gh ツール側の部分更新 API 追加（Tool 仕様変更は別要件）
- Issue 本文テンプレート自体の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | 既存の前後内容比較節（L80-89）へ全文置換モデルの明示と最小差分行編集手順を追記 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-close/ 等の本文更新手順 | 全文書き戻し手順の規約化 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-ready/ , agentdev-workflow-case-run/ delegation 指針 | 部分更新指定・trackingState 親適用の明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md（L80-89 に元本文スナップショット取得・再読込前後比較・セクション欠落確認・構造検証が既存）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存の前後比較手順に対し、(1) issue_update が全文置換である操作モデルの明示、(2) 最小差分行編集（precise old/new）による本文組立手順の新規記述、(3) delegation prompt への部分更新指定と Tool 管理フィールド親適用の組込み、(4) 更新後 VERIFY への state 突合追加（deferred L2269 統合）が不足（adversarial-review B-3 により既存記述と不足記述を精緻化）

## 制約

- agentdev-issue-management の手順は verify 契約（read-back）と整合させる
- 子 agent 委譲時の byte-exact 保存要件（前後内容比較）を維持する

## 受け入れ条件

- [ ] 本文更新手順に全文置換モデルの明示と最小差分編集手順がある
- [ ] 長文本文の委譲更新に部分更新指定の指針が組込まれている
- [ ] 更新後 VERIFY に state 突合が含まれている

## 元learning item / 根拠

- **要約**: issue_update 全文置換モデルの把握不足による本文セクション欠落・更新失敗と、最小差分編集手順の不在
- **根拠**: Case #2902（case-close の完了条件チェックボックス更新で要約版 body を書き込み実行識別情報・テスト戦略等のセクション欠落、再読込で検知し元本文ベースの全文書き戻しで復元）、Case #2898 case-ready stage（子 agent が長文本文の全面再構成で2回失敗、親の部分更新で解決）+ deferred L2269（body 更新のみの issue_update 後に state が closed へ変化）
- **再発条件**: 元本文を再構築せず要約・部分版 body を渡す更新、部分更新指定なしで長文本文の更新を子 agent に委譲した場合
- **横展開可能性**: Issue/PR 本文を更新する全 workflow（issue、case-close、case-revise、epic-tracker）。agentdev_gh 操作モデルに固有

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: Case #2902, Case #2898
