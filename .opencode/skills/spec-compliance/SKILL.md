---
name: spec-compliance
description: Detects deviations between implementation and requirements (REQ), work plan, and architecture decisions (ADR) as a quality gate. USE FOR: completing implementation, before creating PRs, or during post-implementation review. DO NOT USE FOR: requirement analysis, test execution, code quality reviews without requirement comparison, or general code review.
---

# Deviation Check スキル

このスキルは、実装と要件・work plan・ADRの乖離を検出し、品質ゲートとして機能する。

---

## 概要

実装と要件・work plan・ADRの乖離検出・品質ゲート。②構造的実行フェーズの完了時と③レビュー完了フェーズで使用。

- **役割**: 要件（REQ）・work plan・ADRと実際の実装を比較し、乖離を検出
- **タイミング**: ②構造的実行フェーズの完了時（PR作成前）と③レビュー完了フェーズ（マージ前）
- **依存**: issue-*コマンドから参照される専門スキル

---

## 乖離の定義

何をもって「乖離」とするかの基準を定義する。

### 重大乖離

要件（REQ）・work plan・ADRのいずれかの記載内容を満たさない実装。

- **例**: チェックボックスが未実装
- **例**: 受け入れ基準のGiven-When-Thenを満たさない
- **例**: 要件に明記された機能が欠落している
- **例**: work planに記載されたタスクが未実装
- **例**: ADRで決定したアーキテクチャが実装されていない

### 軽微乖離

実装は受け入れ基準を満たすが、意図しない追加変更を含む。

- **例**: スコープ外ファイルの変更
- **例**: 要件・work planにないリファクタリング
- **例**: 追加された設定変更

---

## 検出観点

エージェントが乖離を検出する際の観点を定義する。

### 要件docのチェックボックス vs 実装の対応

- 全ボックスが実装されているか
- 各ボックスの内容が正しく実装されているか

### work planの範囲 vs 実際の変更ファイル

- 計画外の変更がないか
- 変更ファイルがwork planの範囲内か

### 決定事項の Consequences vs 実際の影響

- 予想外の副作用がないか
- 決定事項の影響範囲と実際の影響が一致しているか

---

## 品質メトリクス収集

乖離検出時に併せて品質メトリクスを自動収集する。メトリクス定義は `docs/specs/quality-specs.md` を参照。

### 収集対象

プロジェクトで利用可能なメトリクスを自動判定し、収集可能なものを実行する:

- **型チェック**: `lsp_diagnostics` または型チェッカーコマンドでエラー数を収集
- **Lint**: プロジェクトにlinterが設定されている場合、その結果を収集
- **ビルド**: ビルドコマンドの成否を確認
- **テスト**: テストフレームワークが利用可能な場合、テスト結果とカバレッジを収集

### 報告形式

収集したメトリクスは乖離検出報告に併記する:

```markdown
## 品質メトリクス

| メトリクス | 結果 | 基準 | 判定 |
|---|---|---|---|
| {メトリクス名} | {値} | {基準値} | ✅/❌ |
```

### 連携

- issue-work Phase C Step 8（乖離検出）でメトリクス収集を実行
- 収集結果は PR 本文（pr_desc.md テンプレートの「テスト結果」セクション）に含める
- メトリクス基準値は `docs/specs/quality-specs.md` で管理

---

## 報告フォーマット

乖離の報告形式を定義する。

### 報告項目

- **影響度**: 重大 / 軽微
- **乖離タイプ**: `spec-bug` | `impl-bug` | `scope-creep`
- **対象**: 要件docの該当セクション / work planの該当タスク / ADRの該当決定 / 変更ファイル
- **内容**: 乖離の具体的な説明
- **影響REQ番号**: REQ番号の配列（例: `[REQ-3.2, REQ-3.3]`）
- **修正方針**: `req-update(APPEND)` | `req-update(UPDATE)` | `code-fix` | `scope-reduction`
- **推奨アクション**: 修正 / 承認 / 差し戻し
- **理由**: 推奨アクションの根拠

### 報告例

```
## 乖離検出報告

### 乖離1
- **影響度**: 重大
- **乖離タイプ**: impl-bug
- **対象**: 要件doc セクション3.2 / src/components/Button.tsx
- **内容**: チェックボックス「バリデーションエラー表示」が未実装
- **影響REQ番号**: [REQ-3.2]
- **修正方針**: code-fix
- **推奨アクション**: 修正
- **理由**: 受け入れ基準を満たしていない

### 乖離2
- **影響度**: 軽微
- **乖離タイプ**: scope-creep
- **対象**: 変更ファイル / src/utils/format.ts
- **内容**: スコープ外のユーティリティ関数がリファクタリングされている
- **影響REQ番号**: []
- **修正方針**: scope-reduction
- **推奨アクション**: 承認
- **理由**: 品質向上であり、要件を満たしている
```

---

## 乖離タイプ分類

### spec-bug（仕様バグ）

要件定義と実装の間に論理的矛盾がある。

- 要件自体に矛盾や欠陥が存在する
- 実装は要件に従っているが、結果として正しくない

### impl-bug（実装バグ）

要件定義は正しいが実装が仕様を満たさない。

- 実装が要件の意図を正しく反映していない
- テストが通過しない、または受け入れ基準を満たさない

### scope-creep（スコープ外逸脱）

実装が要件定義の範囲を超えている。

- 要件にない機能が追加実装されている
- 計画外のファイル変更やリファクタリングが含まれている

---

## issue-update連携

### 乖離タイプ→issue-updateフラグ マッピング

| 乖離タイプ | issue-updateコマンド | 説明 |
|---|---|---|
| `spec-bug` | `/issue/issue-update {N} --req --review-ng` | 要件定義の修正が必要 |
| `impl-bug` | `/issue/issue-update {N} --comment --review-ng` | 実装の修正が必要（要件は不変） |
| `scope-creep` | `/issue/issue-update {N} --req --review-ng` | 要件スコープの再定義が必要 |

### 出力テンプレート

報告フォーマットの出力は `issue_comment_review_ng.md` にそのまま埋め込める形式とする。

```markdown
## 乖離検出報告

### 乖離1
- **影響度**: [重大 / 軽微]
- **乖離タイプ**: [spec-bug / impl-bug / scope-creep]
- **対象**: [要件docの該当セクション / work planの該当タスク / ADRの該当決定 / 変更ファイル]
- **内容**: [乖離の具体的な説明]
- **影響REQ番号**: [REQ番号の配列]
- **修正方針**: [req-update(APPEND) / req-update(UPDATE) / code-fix / scope-reduction]
- **推奨アクション**: [修正 / 承認 / 差し戻し]
- **理由**: [推奨アクションの根拠]
```

---

## ループバック判定

①バイブス壁打ちへの差し戻し基準を定義する。

### 差し戻し基準

- **重大乖離が2件以上** → ①バイブス壁打ちフェーズ全体を差し戻し
- **重大乖離1件** → 該当する要件docのセクション / work planタスク / ADR決定のみ再壁打ち
- **軽微乖離のみ** → そのまま進行（乖離内容を実装記録に併記）

### 重要事項

自動ループバックはしない。エージェントが推奨アクションを提案し、ユーザーが決定する。

---

## See Also

- **req-analysis**: 要件分析手法（乖離検出の基準となる品質基準）
- **req-file-manager**: REQファイル管理（乖離対象の要件doc参照）
