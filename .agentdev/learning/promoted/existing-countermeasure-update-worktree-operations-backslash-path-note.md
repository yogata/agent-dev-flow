# bash 経由 checker --root の backslash パス破損を明記する

## 背景

引用符なし Windows backslash パスが bash escape 解釈で破損し空コーパスの missing 3 fail。forward slash 形式で pass 9 / fail 0。

## 問題

bash は backslash を escape 文字として解釈するため、引用符なし Windows 形式パスは引数段階で破損し、checker は空コーパス走査で fail-closed 契約どおり missing を返す（チェッカー異常ではない見かけ上の全件 missing）

## 望ましい変更

checker 実行コマンド例のパス表記を forward slash 形式に統一、durable state 解消済み行の誤判定崩し手（記録値との突合）と併用

## 対象範囲

### 対象

- worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」節

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」節 | backslash パスが破損し全件 missing となる注意記載が欠落。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」節
- **ギャップ分類**: fix gap
- **ギャップ詳細**: backslash パスが破損し全件 missing となる注意記載が欠落。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: bash 経由 checker --root の backslash パス破損を明記する
- **根拠**: 引用符なし Windows backslash パスが bash escape 解釈で破損し空コーパスの missing 3 fail。forward slash 形式で pass 9 / fail 0。
- **再発条件**: evaluation-report の問題クラス12および原エントリを参照
- **横展開可能性**: Windows bash checker 実行全般

### 原エントリ（証跡）

### Inbox 原文 1

## bash から checker の --root に backslash パスを渡すと escape 解釈で破損し traceability check が見かけ上 missing を返す

- **問題事象**: bash セッションから traceability check に `--root C:\Users\...`（backslash 含む生パス）を渡すと、シェルの escape 解釈でパスが破損（`C:Users...`）し、対応宣言が 1 件も走査されない状態で missing-design / missing-implementation / missing-verification の 3 fail が返る
- **発生局面**: 運用（case-close STEP-2/3 の QG-4 トレーサビリティ独立再検査。Case #3088 case-close 再開実行）
- **検知方法**: 同一コマンドを forward slash 形式（`C:/Users/...`）で再実行したところ pass 9 / fail 0 となり、worktree 起点でも同値（pass 9 / fail 0）を確認。case-run の記録値との突合で破損パス実行が誤判定の原因と特定
- **根本原因**: bash は backslash を escape 文字として解釈するため、引用符なしの Windows 形式パスは引数段階で破損する。チェッカー側は破損パスを root として空コーパスを走査し、fail-closed 契約どおり missing を返す（チェッカー異常ではない）
- **自律対応内容**: forward slash 形式への統一で解消。main root 起点と worktree HEAD 起点の両方で pass 9 / fail 0 を再取得し、durable state 上で解消済みの対象行を本変更起因の失敗と誤判定していないことを確認して対応記録コメントへ補足記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Windows 環境で bash 経由の checker 実行パス指定は forward slash 形式（または引用符付き）に統一する。記録値との突合は「durable state 上で解消済みの対象行を誤失敗扱いしない」崩し手として有効
- **再発条件**: bash から Windows 形式（backslash）パスを引用符なしで checker のパス引数へ渡した場合
- **予防策候補**: checker 実行コマンド例のパス表記を forward slash 形式に統一する旨を実行手順例へ明記する
- **想定反映先**: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」節の例示補足
- **関連**: Case #3088、PR #3097、agentdev-traceability check CLI
- **タグ**: `#bash` `#Windows` `#パス指定` `#traceability`

---

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 12
- **確定処分**: 既存対策の更新 (category 5)
- **加重合計**: 25/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 3/5 | QG-4 独立再検査の誤判定リスク |
| 横展開性 | 3/5 | Windows bash checker 実行全般 |
| 反映先明確度 | 5/5 | worktree-operations.md の節を特定 |
| 自動化適性 | 2/5 | 表記統一の運用 |
| プロジェクト固有知識再利用性 | 4/5 |  |
| 再発可能性 | 3/5 | backslash パスの記述ミスは頻出 |
| 費用対効果 | 4/5 | 例示補足のみ |

### 判定基礎（evaluation-report verbatim）

### 問題クラス12: bash 経由 checker --root への backslash パス破損
- **根本原因**: bash は backslash を escape 文字として解釈するため、引用符なし Windows 形式パスは引数段階で破損し、checker は空コーパス走査で fail-closed 契約どおり missing を返す（チェッカー異常ではない見かけ上の全件 missing）
- **再発条件**: bash から Windows 形式（backslash）パスを引用符なしで checker のパス引数へ渡した場合
- **予防策**: checker 実行コマンド例のパス表記を forward slash 形式に統一、durable state 解消済み行の誤判定崩し手（記録値との突合）と併用

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 3/5 | QG-4 独立再検査の見かけ上全件 missing（完了ゲート誤判定リスク） |
| 横展開性 | 3/5 | Windows bash 環境の checker 実行全般 |
| 反映先明確度 | 5/5 | worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」節（例は forward slash・表記注意の明記なしを検証済み） |
| 自動化適性 | 2/5 | 表記統一の運用 |
| プロジェクト固有知識再利用性 | 4/5 | |
| 再発可能性 | 3/5 | backslash パスの自然な記述ミスは頻出 |
| 費用対効果 | 4/5 | 例示補足のみ |
| **加重合計** | **25/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— worktree-operations.md 当該節は例示が forward slash 形式だが「backslash パスは escape 解釈で破損し全件 missing を返す」旨の注意記載が欠落（fix gap）。出現1件だが、完了ゲート（QG-4 独立再検査）の信頼性に直結する既存手順の記述欠落であり反映先と修正内容が一意に確定できる
- **エントリ一覧**: bash から checker の --root に backslash パスを渡すと escape 解釈で破損し traceability check が見かけ上 missing を返す [inbox]

