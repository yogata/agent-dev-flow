# SKILL.md frontmatter `name:` バッククォート検出の判定基準

> **原本**: backticks-identifier-threshold SPEC「適用対象外（PR #1334 事例に基づく明示）」。
> 本ファイルは inspect-skills 診断観点「SKILL.md frontmatter `name:` バッククォート検出」（REQ-0125-003 準拠）の判定基準詳細を集約する運用ビューである。
> 原本と内容が重複する場合は原本を優先する（REQ-0125-004）。

## 適用範囲

Command→Skill 参照妥当性診断で、配布物（`src/opencode/skills/agentdev-*/SKILL.md`）の frontmatter `name:` 行が YAML スカラー値として不正なバッククォート囲み形式になっているかを検出する。

frontmatter は構造データであり Markdown インラインコード表記の対象外である。バッククォート囲みの name は opencode のスキル名解決を不正にし、名前空間解決の不具合を引き起こす（PR #1334 事例）。

## 背景: PR #1334 事例

PR #1334（commit ad086200, 2026-06-28）の機械横断是正で、`src/opencode/skills/agentdev-*/SKILL.md` 計27ファイルの frontmatter `name:` 行にバッククォートが誤って付与された。
本来バッククォートは Markdown 本文の識別子に付与するものだが、frontmatter 値（YAML スカラー値）に対して誤付与された。
この事例に基づき、backticks-identifier-threshold SPEC「適用対象外」で frontmatter 値への backticks 付与を明示的に禁止し、本検出基準で再発を防止する。

## 検出パターン

SKILL.md frontmatter `name:` 行が以下の正規表現に一致する場合を違反とする。

```
^name:\s*`[a-z0-9-]+`\s*$
```

バッククォートで囲まれた name 値。YAML ではこの形式は文字列スカラー値として `` `agentdev-xxx` `` 全体を name 値と解釈し、ディレクトリ名（`agentdev-xxx`）と不一致となる。

正常形式（非違反）は以下の正規表現に一致する。

```
^name:\s*[a-z0-9-]+\s*$
```

## 診断手順

### 1. スキャン対象の限定

本検出の対象は配布物の `src/opencode/skills/agentdev-*/SKILL.md` の frontmatter（先頭 `---` で始まる最初のブロック）のみ。以下は対象外:

- `src/opencode-local/` 配下（ローカル版、別系統）
- `.opencode/skills/` 配下（ジャンクション、原本修正で自動反映）
- frontmatter 以外の Markdown 本文（コードブロック内テンプレート例示等）

### 2. frontmatter `name:` 行の抽出

各 SKILL.md の frontmatter ブロック（先頭 `---` 〜 次の `---` まで）の `name:` 行を抽出する。frontmatter の外にある `name:` 行は対象外。

### 3. バッククォート囲みの判定

抽出した `name:` 行が検出パターンの正規表現に一致するかを判定する。一致した場合を違反とする。

### 4. IR-007（skill-name-dir-match）との協調

バッククォート付き name は `` `agentdev-xxx` `` 全体が YAML スカラー値となるため、ディレクトリ名（`agentdev-xxx`）と不一致となる。結果として IR-007（skill-name-dir-match 整合性ルール）違反を併発する。

本検出はバッククォート囲みそのものを strict 違反候補として検出し、IR-007 は name/dir 不一致を検出する。両者は同じ根本原因（frontmatter name のバッククォート誤付与）から派生する異なる観点の検出であり、併発を前提とする。検出時は両方の違反を併記し、推奨経路を一本化する。

## 推奨経路

検出した違反に対し、ファイル修正は行わず以下を推奨 route として提示する（REQ-0125-005 準拠、検出のみで修正は実施しない）。

- **推奨 route**: `skill`
- **推奨修正**: 該当 SKILL.md の frontmatter `name:` 行からバッククォートを除去し、`name: agentdev-xxx` 形式（YAML スカラー値）に修正する

## 出力形式

検出した違反は SKILL.md「出力形式」セクションの Finding 形式で報告する。
Classification には `skill-frontmatter-name-backtick` を使用する。IR-007 違反を併発する場合は両方の Classification を併記する。

## 対象外

- frontmatter の他フィールド（`description:` 等）へのバッククォート付与は本検出の対象外。`description:` 値は自由記述可能な文字列であり、バッククォート囲みが YAML 構文違反にならないため。
- Markdown 本文の backticks 使用は backticks-identifier-threshold SPEC の別基準で扱う。
- 機械的検出の実装（lint スクリプト等）は本診断の対象外。本ファイルは検出基準を定義し、実装は別工程とする。

## See Also

- **原本**: backticks-identifier-threshold SPEC「適用対象外（PR #1334 事例に基づく明示）」
- **IR-007**: skill-name-dir-match 整合性ルール（IR-007、integrity-rule-catalog 経由で参照）
- **REQ-0125-003**: Skill frontmatter 整合（本検出の根拠 REQ）
- **REQ-0125-005**: 推奨 route 提示、修正実施禁止
