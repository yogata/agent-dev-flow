# PowerShell 環境での Node.js -e 複雑式回避策

## 背景

PowerShell 環境で `node -e` を使用してインライン JavaScript を実行する際、シングルクォートやパイプを含む複雑な jq 式が PowerShell のパーサーに干渉し、SyntaxError や ParserError が発生する。agentdev-gh-cli skill は `node -e` を安全な読み取り手順として推奨しているが、複雑式での制約が記載されていない。

## 問題

agentdev-gh-cli skill の安全な読み取り手順で `node -e` の使用を推奨しているが、以下の制約が記載されていない:

- PowerShell は `node -e` 内の文字列に対しても変数展開（`$`）とパイプ（`|`）を解釈する
- 複雑な jq 式（`[-1]`、`sort_by`、パイプを含む式）で顕著に発生
- 回避策として `.js` スクリプトファイル経由の実行が有効だが、その旨の記載がない

## 望ましい変更

agentdev-gh-cli skill の「安全な読み取り手順」セクションに以下を追加:

- 複雑な jq 式を使用する場合は `node -e` ではなく `.js` スクリプトファイル（Write tool で作成）を使用することを推奨
- シングルクォートやパイプを含む式で `node -e` を使用してはならない旨の MUST NOT を追加

## 対象範囲

### 対象

- `.opencode/skills/agentdev-gh-cli/SKILL.md` の「安全な読み取り手順」セクション

### 対象外

- case-run コマンド（skill を参照）
- 他の PowerShell 関連スキル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-gh-cli/SKILL.md` | 安全な読み取り手順に複雑式時の.jsファイル推奨とMUST NOTを追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（guardrail insufficiency）
- **該当ファイル**: `.opencode/skills/agentdev-gh-cli/SKILL.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: `node -e` を使用した安全な読み取り手順は記載されているが、PowerShell環境での複雑式使用時の制約と代替手段（.jsファイル）の記載がない

## 制約

- 既存の `node -e` 推奨手順は単純式では有効なため維持
- 追記形式で追加（既存内容の変更なし）
- MUST NOT は複雑式に限定（単純式での `node -e` は禁止しない）

## 受け入れ条件

- [ ] agentdev-gh-cli skill に複雑式時の .js ファイル推奨が追加されている
- [ ] シングルクォート・パイプを含む式での `node -e` 使用が MUST NOT に追加されている
- [ ] 既存の `node -e` 推奨手順が変更されていない

## 元learning item / 根拠

- **要約**: PowerShell 環境で `node -e` のシングルクォートが意図通り解釈されない
- **根拙**: `gh issue view` の jq 式で `[-1]` や `sort_by` を使用時に SyntaxError が発生。.js ファイル経由で回避
- **再発条件**: PowerShell 環境で `node -e` 内にシングルクォートやパイプを含むコマンドを渡す場合（再発可能性 4/5）
- **横展開可能性**: PowerShell 環境での開発全般で発生（横展開性 4/5）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: case-close #790-#794 の VERIFY 操作
