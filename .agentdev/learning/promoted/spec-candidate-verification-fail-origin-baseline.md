# 検証 fail の由来判定基準（baseline commit 基準・検証環境記録）（spec 候補）

## 背景

「full integrity suite pass」等の検証 fail の由来判定（pre-existing vs 当該変更起因）で、基準の不定性に起因する2つの問題が発生した:

1. **基準 commit の不定性**: PR base（直前 staging）相対で由来判定すると、同一 Epic 内の先行 Wave 起因の失敗が「元から存在」に見える。OU-008a で Wave 4/5 の「26件は base から同一」記録が、remediation 開始前 baseline commit（`49f4db17`）基準では 24件が新規発生だった。false-positive completion に直結（PR #2118 / Issue #2108）
2. **検証環境による fail 構成の変化**: worktree（junction 未伝播）と main でテスト数・fail 構成が一致しない（1873 pass / 3 fail vs 1964 pass / 4 fail）。main 固有の node_modules 検出・junction 環境の stale 参照、worktree 固有の false positive が双方に存在（Issue 2108 / PR 2118）

## 問題

由来判定の基準 commit と検証環境が受入れ基準に規定されず、検証実施者の判断に委ねられる。誤った合格（false-positive completion）と誤った不合格の双方を生みうる。

## 望ましい変更

1. Epic 完了検証・受入れ判定の由来判定は「remediation 開始前 baseline commit での当該テスト状態」を基準とする手順を明文化する（被差し戻し PR の「base から同一」表記を pre-existing 証拠として採用しない）
2. 受入れ記録への検証環境明記（worktree / main、junction 伝播、node_modules 有無）と fail 全件の由来分類証跡を規定する

## 対象範囲

### 対象

- **delta（本成果物の独自範囲）**: 由来判定の baseline commit 基準、fail 全件の由来分類証跡形式
- 受入れ基準・検証環境記録要件の全体枠組みは、同主題の intake item が管理中のため本成果物では重複定義しない

### 対象外

- 「full integrity suite pass」受入れ基準の全体（除外基準・証跡形式・検証環境記録要件）— `intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md`（intake inbox）が管理。backlog-review で本成果物と統合前提
- 個別の既知欠陥（ADR README 由来、check_templates worktree 系）の修正

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec 候補 | 品質ゲート側（QG-4 / case-close SPEC または integrity 契約。配置は backlog-review → req-define で判断） | 由来判定の baseline commit 基準と由来分類証跡の規定。受入れ基準全体は intake 側候補と統合して確定 |
| skill reference | `src/opencode/skills/agentdev-quality-gates/`、case-close の QG-4 references | 検証環境明記と由来分類証跡の検査観点候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（同主題の intake item）
- **該当ファイル**: `.agentdev/intake/inbox/intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 当該 intake 候補は受入れ基準（全 green vs 由来別除外）・除外基準・証跡形式・検証環境記録要件を含むが、**由来判定の baseline commit 基準を含まない**。本成果物は当該 delta を補完する

## 制約

- 本成果物は delta（baseline commit 基準・由来分類証跡）に主眼を置く。受入れ基準・環境記録の全体規定は intake 側候補と backlog-review で統合して確定する（二重トラック回避）
- 本成果物は検証環境明記を予防策に含み自己完結しているため、intake item が reject されても孤立しない

## 受け入れ条件

- [ ] 由来判定の基準 commit（remediation 開始前 baseline）が手順・受入れ基準に明文化されている
- [ ] 受入れ記録に検証環境（worktree / main、junction、node_modules）の明記が要件化されている
- [ ] fail 全件の由来分類証跡（全件列挙 + 由来根拠 + 関連 intake リンク）が形式として規定されている
- [ ] intake 側 SPEC確定候補との統合が backlog-review で判断されている

## 元learning item / 根拠

- **要約**: 検証 fail の由来判定の基準 commit と検証環境が受入れ基準に未規定で、false-positive completion と判定揺れが発生
- **根拠**: PR #2118 / Issue #2108（v1 §4 の暫定再実行基準、baseline commit `49f4db17` との git show 比較で 24 件を remediation 由来と確定、AC-17 差し戻し→fix→v2 pass）、case-close 独立再検証での main/worktree の fail 構成差
- **再発条件**: 複数 Wave・複数検証環境にまたがる Epic の完了検証で由来判定を行う場合
- **横展開可能性**: 高い。複数環境・複数 Wave を持つ検証全般

## 推奨Issue分類

- **分類**: chore（受入れ基準・手順の明文化）
- **推奨ラベル**: documentation, testing, quality-gate
- **関連Issue**: #2108（クローズ済み発生元）、intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md
