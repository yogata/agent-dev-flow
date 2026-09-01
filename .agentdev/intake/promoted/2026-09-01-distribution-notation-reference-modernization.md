# 配布物・docs の表記・参照・用語の現行化（16件統合）

## 背景

REQ-053 文書品質 sweeps、ADR→Decision 用語移行、STEP モデル移行後も、配布物と docs に旧表記・旧参照・旧用語・broken link が残存している（16件の intake item が同一性質の残存を指摘）。

## 問題

現行規約・現行構造と矛盾する表記・参照・用語が複数ファイルに残存し、読者誘導と機械検査の信頼性を損なう。

## 望ましい変更

各残存箇所を現行の表記・参照・用語へ更新する（置換対象は下表のとおり。機械置換可能なものは mechanical-replacement-rules 経路を優先）。

## 対象範囲

### 対象

| item（元ファイル名） | 残存箇所と対応 |
|---|---|
| command-file-format-spec-stale-en-prefix | command-file-format SPEC の typo・旧前提・旧例（L52,55,103-121）を現行記述へ |
| x4-html-comment-multisentence-split | HTML コメント内複数文の分割（X-4）。機械置換＋検出器のコメント除外 |
| case-close-cleanup-capture-one-line-3-lines | cleanup-and-capture.md L39,121,172 の一文一行違反 3行 |
| guides-broken-links-specs-local | consumer-project-setup.md 等の docs/specs/local 参照切れ 5件を docs/designs/local へ |
| learning-pipeline-phase5-legacy-structure | promote-judgment-logic.md L80-81 の旧 Step10 参照を現行 Phase/STEP へ |
| reqadr-enumeration-34-normalization | 配布物の REQ/ADR/Design 旧語彙 34件の正規化（訳語表準拠） |
| workflow-status-prohibition-remaining-2 | design-save.md L93・artifact-contracts.md L124 の backtick 化（検出器対応か修正かの選択を備考） |
| legacy-adr-terminology-distribution-wide | agentdev-doc-writing 等の旧 ADR 用語 → Decision 用語へ |
| learning-pipeline-entry-term-inconsistency | learning-pipeline SKILL「entry」vs learning-promote command「エントリ」の統一 |
| references-stale-control-plane-heading-refs | references/ 32ファイルの「Control Plane」旧見出し参照の現行化 |
| case-close-command-driver-term-residue | case-close.md L12 の「case-run/ driver/ 外部実行バックエンド」旧用語 |
| workflow-templates-retired-l014-guardrail-id | workflow-templates SKILL.md L243 の retired ガードレール ID（L-014）除去 |
| system-md-preflight-itemization-stale | system.md L181「preflight 5項目」→ 6項目へ |
| inspect-skills-gh-table-id-removal-residue | inspect-skills SKILL.md L59 の表記残骸（IR-053 言及・「(REQ / AG-{NNN})」等） |
| legacy-step-rowid-references-remaining | 旧「Step N」番号参照の棚卸し（quality-gates.md L44/45/79/100/137/152、req-health-metrics.md L12/75/156 ほか）と現行 STEP 参照へ更新 |
| distribution-qualitative-req-id-convention | 定性的 REQ-ID 表記規約の route 判断（要件化 or learning routing・備考） |

### 対象外

- 意味内容の変更（表記・参照・用語の現行化のみ）
- inspect findings F-01〜F-07 の dangling 行参照（inspect promoted 側と統合）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec/command/skill/guides | 各残存箇所（上表） | 現行表記・参照・用語への置換 |

## 既存対策確認

- **確認結果**: 検出器は既存（IR-055・文書品質 checker）、是正は未実施
- **該当ファイル**: 上表各箇所（全て現存を検証済み）
- **ギャップ分類**: application miss（検出は既存・適用未了）

## 制約

- 機械置換は mechanical-replacement-rules の3段階手順に従う
- 旧表現を禁止する是正注記で旧表現の字面を引用しない（grep 0件基準との衝突回避）

## 受け入れ条件

- [ ] 上表16件の残存箇所が現行表記へ更新されている
- [ ] 対象の機械検査（IR-055 baseline・docs-check）が新規違反を生まない

## 元learning item / 根拠

- **根拠**: 各 intake item の現存確認（A群・B群分析で grep/行番号実証済み）。legacy-step-rowid は review Stream A の誤却下修正により採用化
- **横展開可能性**: 配布物・docs 全般の表記現行化作業

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし
