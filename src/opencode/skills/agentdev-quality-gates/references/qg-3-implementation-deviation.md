# QG-3: Implementation Deviation Gate

case-run で PR 作成前に、実装が Issue / REQ / ADR / SPEC / work plan から乖離していないかを検証する Gate。本ファイルは QG-3 の判定基準・検査観点・乖離分類を定義する。共通契約は [common-gate-contract.md](common-gate-contract.md) を参照。

## 配置

| コマンド | 配置ステップ | 対象成果物 |
|---------|-------------|-----------|
| case-run | Step 8（提出フェーズ・乖離検出） | git diff（実装差分）・変更ファイル一覧 |

## 乖離の定義

何をもって「乖離」とするかの基準を定義する。

### 重大乖離

Issue / REQ / ADR / SPEC / work plan のいずれかの記載内容を満たさない実装。

- チェックボックスが未実装
- 受け入れ基準（完了条件）を満たさない
- 要件に明記された機能が欠落している
- work plan に記載されたタスクが未実装
- ADR で決定したアーキテクチャが実装されていない

### 軽微乖離

実装は受け入れ基準を満たすが、意図しない追加変更を含む。

- スコープ外ファイルの変更
- 要件 / work plan にないリファクタリング
- 追加された設定変更

## 検査観点

### 1. Issue 完了条件チェックボックス vs 実装の対応

- 全完了条件チェックボックスが実装されているか
- 各チェックボックスの内容が正しく実装されているか

### 2. work plan の範囲 vs 実際の変更ファイル

- 計画外の変更がないか
- 変更ファイルが work plan の範囲内か

### 3. REQ / ADR の決定事項 vs 実装

- REQ の必達要件が実装されているか
- ADR で決定したアーキテクチャ制約が守られているか

### 4. 関連ドキュメントの整合性 vs 変更後仕様

- 実装変更に伴う仕様変化と、関連ドキュメント（SPEC, guides, README 等）の記述に矛盾がないか
- 旧仕様の記述が残っていないか
- ドキュメント更新漏れを乖離として検出する

## 乖離分類

| 分類 | 意味 | 修正方針 |
|------|------|---------|
| `no-deviation` | 乖離なし | — |
| `impl-bug` | 要件定義は正しいが実装が仕様を満たさない | `code-fix`（実装修正） |
| `spec-bug` | 要件定義と実装の間に論理的矛盾がある | `req-update(UPDATE)`（REQ 修正） |
| `scope-creep` | 実装が要件定義の範囲を超えている | `scope-reduction`（スコープ削減）or 承認 |

### impl-bug（実装バグ）

要件定義は正しいが実装が仕様を満たさない。

- 実装が要件の意図を正しく反映していない
- テストが通過しない、または受け入れ基準を満たさない

### spec-bug（仕様バグ）

要件定義と実装の間に論理的矛盾がある。

- 要件自体に矛盾や欠陥が存在する
- 実装は要件に従っているが、結果として正しくない

### scope-creep（スコープ外逸脱）

実装が要件定義の範囲を超えている。

- 要件にない機能が追加実装されている
- 計画外のファイル変更やリファクタリングが含まれている

## pass / warn / fail 基準

- **pass**: `no-deviation`。実装は Issue / REQ / ADR / SPEC / work plan に整合。
- **warn**: 軽微乖離のみ（`scope-creep` 等）。そのまま進行可能（乖離内容を実装記録に併記）。
- **fail**: 重大乖離あり（`impl-bug` / `spec-bug`）。ユーザー指示待機（自動修正禁止）。

## 報告フォーマット

```markdown
## QG-3: Implementation Deviation Gate

- **判定**: pass / warn / fail
- **対象**: git diff（変更ファイル N 件）

### 乖離1
- **影響度**: 重大 / 軽微
- **乖離タイプ**: impl-bug / spec-bug / scope-creep
- **対象**: 完了条件セクション / work plan タスク / ADR 決定 / 変更ファイル
- **内容**: 乖離の具体的な説明
- **影響REQ番号**: [REQ-NNNN-NNN]
- **修正方針**: code-fix / req-update(UPDATE) / scope-reduction
- **推奨アクション**: 修正 / 承認 / 差し戻し
- **理由**: 推奨アクションの根拠
```

乖離 0 件の場合は `判定: pass` のみを報告する。

## ループバック判定

壁打ちフェーズへの差し戻し基準。

- **重大乖離 ≥ 2 件** → 壁打ちフェーズ全体を差し戻し推奨
- **重大乖離 1 件** → 該当する要件セクション / work plan タスク / ADR 決定のみ再壁打ち推奨
- **軽微乖離のみ** → そのまま進行（乖離内容を実装記録に併記）

### 重要事項

自動ループバックはしない。エージェントが推奨アクションを提示し、ユーザーが決定する。

## case-update 連携

QG-3 は乖離の分類と推奨アクションの提示までを責務とし、REQ 更新の最終判断は case-update（ユーザー承認入力）に委譲する。

### 乖離タイプ → case-update フラグ mapping

| 乖離タイプ | case-update コマンド | 説明 |
|---|---|---|
| `spec-bug` | `/agentdev/case-update {N} --req --review-ng` | 要件定義の修正が必要 |
| `impl-bug` | `/agentdev/case-update {N} --comment --review-ng` | 実装の修正が必要（要件は不変） |
| `scope-creep` | `/agentdev/case-update {N} --req --review-ng` | 要件スコープの再定義が必要 |

報告フォーマットの出力は `issue_comment_review_ng.md` テンプレートに埋め込める形式とする。

## 委譲接続点

QG-3 の検査をサブエージェントに委譲する場合:

- サブエージェントは乖離候補・影響度候補・乖離タイプ候補・根拠のみを返す。
- 親エージェントが pass/warn/fail を確定し、ユーザーへの報告と指示待機を行う。

## 責務境界

- QG-3 は**乖離の分類と推奨アクションの提示**に限定する。
- REQ ファイルの更新判断・更新実行は行わない（case-update の責務）。
- 品質メトリクス収集（型チェック / Lint / ビルド / テスト）は行わない（case-run Step 11-1 ローカル検証の責務）。
- docs 全体の意味レビューは行わない（`/agentdev/inspect-docs` の責務）。

## See Also

- [common-gate-contract.md](common-gate-contract.md)
- [qg-4-final-acceptance.md](qg-4-final-acceptance.md) — 下流の最終受け入れ（QG-4 は QG-3 の結果を前提とする）
- **agentdev-workflow-routing**: case-update --review-ng 手順（QG-3 結果の消費先）
- **agentdev-workflow-templates**: `issue_comment_review_ng.md` テンプレート
