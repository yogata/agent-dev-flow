# Node.js一時スクリプトでのテンプレートリテラル禁止パターン追加

## 背景

gh CLI出力をNode.js `node -e`で処理する一時スクリプトで、テンプレートリテラル内に中括弧`{...}`を含むパス文字列（例: `.opencode/commands/agentdev/templates/{command}/{variant}.md`）を記述した際、JavaScriptの式補間`${...}`と競合して`ReferenceError`が発生した。agentdev-gh-cliのquote conflictパターンには`node -e`でのsingle quote・pipe問題は記載されているが、template literalの`${...}` vs brace `{command}`の競合は未カバー。

## 問題

agentdev-gh-cli SKILL.mdのquote conflictセクションに以下が欠けている:
- テンプレートリテラル内の`${...}`と中括弧パス（`{command}`, `{variant}`等）の競合パターン
- 一時スクリプトでテンプレートリテラルを使わず配列`join("\n")`または文字列結合を使用する推奨

## 望ましい変更

agentdev-gh-cli SKILL.mdのquote conflictセクション（items 5-8付近）に以下を追加:
- 「一時スクリプトではテンプレートリテラル（バックティック）を使わない」をMUST NOTとして追加
- 理由: `${...}`パターンと中括弧パスの競合で`ReferenceError`が発生
- 推奨代替: 配列の`join("\n")`または`+`による文字列結合
- 複雑な文字列処理は`node -e`ではなく外部`.js`ファイルに退避

## 対象範囲

### 対象

- `.opencode/skills/agentdev-gh-cli/SKILL.md` — quote conflict / Windows回避策セクション

### 対象外

- case-close.md — スクリプト作成はskillの推奨に従うため
- 他スキル・コマンド

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-gh-cli/SKILL.md` | quote conflictセクションにテンプレートリテラル禁止と代替手段を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-gh-cli/SKILL.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: lines 77-87にquote conflictパターン（items 5-8）があり、`node -e`でのsingle quote・pipe問題をカバー。MUST NOTルールもある。しかしテンプレートリテラルの`${...}` vs brace `{command}`の競合パターンは未記載。バックティック使用時の制約が明示されていない。

## 制約

- 既存のquote conflictパターン（items 5-8）の構造・フォーマットに合わせる
- 3段リトライロジック等の他セクションに影響しない
- agentdev-gh-cliの既存のMUST NOTルールと整合性を保つ

## 受け入れ条件

- [ ] quote conflictセクションにテンプレートリテラル（バックティック）使用禁止のMUST NOTルールが追加されている
- [ ] 代替手段（配列joinまたは文字列結合）が推奨として記載されている
- [ ] 複雑な文字列処理は外部.jsファイルに退避する推奨が記載されている

## 元learning item / 根拠

- **要約**: Node.js `node -e`内のテンプレートリテラルで中括弧パスと`${...}`が競合しReferenceError発生
- **根拠**: case-closeのコメント投稿スクリプトで`.opencode/commands/agentdev/templates/{command}/{variant}.md`パスをテンプレートリテラル内に記述し、中括弧が式補間と解釈されてエラー
- **再発条件**: (1) Node.js一時スクリプトでテンプレートリテラル使用、(2) 文字列内に`${...}`や中括弧パターンを含む、(3) `node -e`のインライン実行
- **横展開可能性**: Node.jsで一時スクリプトを書く全パターン。特にgh CLI出力の後処理スクリプト

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, documentation
- **関連Issue**: なし
