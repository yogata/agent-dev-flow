# STEP-1 / STEP-2: 診断対象読込・診断観点評価・分類・route 提示（skill-structure-diagnostics）

> 本 reference は `agentdev-workflow-inspect-skills` SKILL.md の Control Plane STEP-1、STEP-2 詳細である。read-only-diagnostic型のため resume point を持たない。

## 開始条件

- STEP-1: inspect-skills command の実行開始
- STEP-2: 診断対象（Command/ Skill 定義）の把握完了

## 結果

- 検出事項リスト（対象、観点、分類、根拠、推奨 route 付き）

## 手順

### STEP-1-1: 診断対象の読込

Command/ Skill 定義を読み込み、Command→Skill 参照、Skill frontmatter、本文構造、references 利用、template/ script 参照を把握する。

### STEP-2-1: 各診断観点の評価

`agentdev-inspect-skills` に従い、参照妥当性、粒度、段階的開示、責務境界、canonical name、内部構造依存を評価する。

### STEP-2-2: 配布物構文健全性、責務整合診断

配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）について、docs-spec-rebuild-integrity SPEC（extension 経由）が定義する検査パターンのうち Command/Skill 構造に関わる観点（frontmatter 重複、見出し重複、Markdown 構文破損、存在しない command 参照、エンコーディング不整合、壊れた括弧、command と関連 skill 間の責務説明矛盾）を `agentdev-inspect-skills` に従って診断する。

存在しない command 参照の検出は、README listing と command 本文の相互参照について存在しない command を指す参照を検出事項とし、実在する command 参照は検出対象外とする（docs-spec-rebuild-integrity SPEC 構文健全性検査準拠）。

エンコーディング不整合の検出は、配布物 Markdown の UTF-8 BOM 付きファイルと単一ファイル内の CRLF/LF 混在を検出事項とし、BOM なし UTF-8 かつ単一改行コードで構成されたファイルは検出対象外とする（同上）。

### STEP-2-3: 分類

検出事項ごとに診断分類ラベルを付与する。NG 分類（false positive/ pre-existing/ 今回修正対象）は docs-spec-rebuild-integrity SPEC（extension 経由）の NG 分類表に従い、各検出事項に分類、理由、後続対象を付ける。

### STEP-2-4: route 提示

修正は実行せず、推奨 route を提示する。

## エラー処理

| エラー | 対処 |
|--------|------|
| 対象ファイルが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| 参照先 Skill が存在しない | 検出事項として報告し、canonical name の確認を推奨 |

## 関連 STEP

- 前: なし（workflow 先頭）
- 次: STEP-3（finding-output-and-persist）

## 関連 Capability Skill

- `agentdev-inspect-skills`: 診断観点と判定基準（STEP-2-1、2-2）
- `agentdev-project-extensions`: docs-spec-rebuild-integrity SPEC の extension 経由解決

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G01（ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成は例外として許可）
- 不変条件（自動修正せず、推奨 route の提示に留める）
