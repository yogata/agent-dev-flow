# Epic Wave 並列 PR の同一ファイル衝突と Level 1 機械解消の限界（spec 候補）

## 背景

Epic #2134（Wave 1・Wave 2）、Epic #2156（Wave 1）、Epic #1719（Wave 2）で、同一 Wave の並列子Issue の変更範囲が同一ファイルで重なり、連続 squash merge の際に先行マージが他方を CONFLICTING にする事象が4回反復した。競合の内容は (a) 同一リージョンの文言選択、(b) 隣接行の機械置換、(c) AUTOGEN ブロックの再生成同士の衝突、の3種で、いずれも git rebase の機械的解消（Level 1）の範囲を超え、Level 2/3 エスカレーションと Wave 停止が発生した。

## 問題

epic-wave-model SPEC の execution_unit 構成（連結成分アルゴリズム）は技術的依存のみをエッジとして扱い、変更ファイルの重複・AUTOGEN 対象ファイルの重複・行近接の機械置換を並列配置の抑制要素として考慮しない。このため衝突が確定的に発生する Wave 構成が組まれ、マージフェーズで停止する。また case-auto の Level 2 解消レシピに「AUTOGEN は新 base 上での再生成で解消する」という正道が明記されていない。

## 望ましい変更

1. execution_unit 構成アルゴリズムの技術的依存判定へ「変更ファイルの重複」「AUTOGEN 対象ファイル（health-metrics、integrity-rule-catalog、rule-ownership 等）の重複」「同一ファイル行近接の機械置換」を依存ヒントとして反映する
2. 重複を検知した場合の構成判断（直列化・依付与・単一 PR 集約）を Wave 構成基準へ明記する
3. case-auto の Level 2 コンフリクト解消レシピへ「AUTOGEN 再生成同士の衝突は手動マージではなく新 base での `generate_indexes.ts` 再実行で解消する」を明記する

## 対象範囲

### 対象

- `docs/specs/workflows/epic-wave-model.md`（execution_unit 構成契約）
- `docs/specs/workflows/references/execution-unit-construction.md`（連結成分アルゴリズム・3軸判断モデルの機械的判定手順）
- case-auto の Level 2 コンフリクト解消レシピ（`docs/specs/commands/case-auto.md` および workflow-case-auto skill references）

### 対象外

- Level 1 rebase 手順自体（既存契約の変更なし）
- case-close のマージシーケンス（検知・エスカレーション挙動は既存どおり）
- squash merge 以外のマージ戦略の導入

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/workflows/references/execution-unit-construction.md` | 連結成分アルゴリズムのエッジ判定へ変更ファイル重複・AUTOGEN 対象重複・行近接機械置換を追加 |
| spec | `docs/specs/workflows/epic-wave-model.md` | Wave 構成基準へ重複検知時の直列化・依存付与判断を追記 |
| spec | `docs/specs/commands/case-auto.md` | Level 2 解消レシピへ AUTOGEN 再生成解消を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/specs/workflows/epic-wave-model.md`（execution_unit 間の並列可否は連結成分（技術的依存のみがエッジ）で判定）、`docs/specs/workflows/references/execution-unit-construction.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 技術的依存の判定要素に変更ファイル重複・AUTOGEN 対象重複・行近接が含まれず、Level 2 解消レシピに再生成解消の明記なし

## 制約

- 既存の連結成分アルゴリズム（REQ-006-004、execution_unit 構成契約）の構造を維持し、エッジ判定要素の追加に留める
- 全ファイル重複を禁止すると過剰制約になるため（テストファイルの末尾追記等は自動解消可能）、重複の種別・近接度による判断を含める

## 受け入れ条件

- [ ] execution_unit 構成の依存判定に変更ファイル重複（特に AUTOGEN 対象・同一リージョン・隣接行）が反映されていること
- [ ] 重複検知時の Wave 構成判断基準（直列化・依存付与・単一 PR 集約）が規定されていること
- [ ] case-auto の Level 2 レシピに AUTOGEN 再生成による解消手順が明記されていること

## 元learning item / 根拠

- **要約**: 同一 Wave の並列子Issue が同一ファイルを変更する構成での確定的コンフリクトと、Level 1（rebase）で機械解消不能な衝突の種別
- **根拠**: (1) Epic #2134 Wave 1: PR #2147（ファイル全面再構成）マージ直後に PR #2146（同一ファイルの期待値更新）が CONFLICTING、rebase が内容コンフリクトで失敗（文言選択型。Issue #2137）。(2) Epic #2134 Wave 2: PR #2152 マージ後の PR #2151 が `spec-health-metrics.md` の AUTOGEN ブロックで失敗（生成物同士の衝突。正解は新 base での再生成。Issue #2136）。(3) Epic #2156 Wave 1: 4番目の PR #2171 が docs/specs/skills/agentdev-doc-diagnostics.md の隣接行（L98/L99）機械置換で失敗（git の 3-way merge は隣接行変更を自動解消しない）。【living pool 由来（prune 済み）】(4) Epic #1719 Wave 2: PR #1732/#1733 が共通ファイルへ直交する意図の変更を行い semantically 競合、Level 2 手動 rebase（HEAD ba2df921）で意図統合して解消した事例（同一 skill 配下への複数 OU 影響が Wave 構成警告のトリガになり得ることを実証）
- **再発条件**: 同一 Wave の並列子Issue の変更範囲が同一ファイルで重なり、かつ同一リージョン・隣接行・AUTOGEN ブロックのいずれかを双方が編集する場合
- **横展開可能性**: 高い。並列 Wave + squash merge を使う開発全般

## 推奨Issue分類

- **分類**: feature（構成アルゴリズムの判定要素追加を伴う）
- **推奨ラベル**: enhancement, epic-wave, merge-conflict
- **関連Issue**: #2136 (OPEN), #2137 (OPEN), Epic #2134, #2156, #1719
