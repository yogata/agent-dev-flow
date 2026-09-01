# PR テンプレートの close キーワード自動クローズ抑止（Refs: 形式への変更）

## 背景

PR テンプレート（pr_desc.md）に `Closes #$ISSUE_NUMBER` 形式が現存し、マージ時に Issue が自動クローズする。case-close 工程ではマージ後に検証対応・完了条件確認・最終コメント等の後続処理が存在するため、マージ時の自動クローズは工程の前提と不整合になる（未修正ギャップが現存、grep 実証）。

## 問題

- .opencode/skills/agentdev-workflow-templates/templates/pr_desc.md L120 の `Closes #$ISSUE_NUMBER` がマージ時の Issue 自動クローズを誘発する
- case-close の close 契約（Issue は工程側で明示クローズ）と矛盾する

## 望ましい変更

テンプレートのキーワードを `Closes` → `Refs:` へ変更する。あわせて case-close 側にマージ前の PR 本文 close キーワード検査の追加を検討する。

## 対象範囲

### 対象

- src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md（キーワード変更）
- src/opencode/skills/agentdev-workflow-case-close/（マージ前検査の追加候補）

### 対象外

- GitHub 側の自動クローズ機構自体の設定変更
- Issue テンプレート類（PR テンプレートのみが対象）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| template | src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md | `Closes #$ISSUE_NUMBER` を `Refs: #$ISSUE_NUMBER` 形式へ変更 |
| skill | src/opencode/skills/agentdev-workflow-case-close/ | マージ前の PR 本文 close キーワード検査（候補・別判断可） |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし
- **ギャップ分類**: 対策不存在
- **ギャップ詳細**: pr_desc.md L120 に `Closes #$ISSUE_NUMBER` が現存するのを grep で実証（未修正）

## 制約

- テンプレート変更は既存の PR 作成手順（gh pr create --body 等）と矛盾しない
- close キーワード検査の追加はマージ手順の複雑化と費用対効果を勘案して別判断可

## 受け入れ条件

- [ ] pr_desc.md の close キーワードが `Refs:` 形式に変更されている
- [ ] 変更後の PR 作成で Issue が自動クローズしないことを確認できる

## 元learning item / 根拠

- **要約**: PR 本文の close キーワードによるマージ時 Issue 自動クローズの抑止
- **根拠**: 「PR 本文の close キーワードはマージ時に Issue を自動クローズする（Refs: 形式を使う）」— 8軸評価 29/40相当（反映先明確5・未修正ギャップ現存を実証）
- **再発条件**: pr_desc.md テンプレートの `Closes` 形式を使って PR を作成・マージした場合
- **横展開可能性**: GitHub PR を使う全 workflow（ADR-0127 フォールバックの直接 PR 作成を含む）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, workflow
- **関連Issue**: なし
