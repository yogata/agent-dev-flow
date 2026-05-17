---
name: issue-lifecycle
description: Provides development workflow phase definitions, SSoT transitions, pattern matching criteria, command mappings, and docs structure for the issue-* command pipeline. USE FOR: determining workflow phases, Pattern A/B/C/D classification, scale assessment, resolving command dependencies, or understanding docs/ directory layout. DO NOT USE FOR: specific command execution logic, requirement analysis, or compliance checking.
---

# Issue Lifecycle スキル

issue-*系コマンドのフェーズ定義・SSoT遷移・Pattern判定基準・コマンド関連を提供する。

- **知識ベース**: フェーズ定義、SSoT遷移、パターン判定基準、コマンド関連
- **参照先**: issue-*コマンドおよびissue-nextから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

---

## USE FOR

- ワークフローフェーズ（マクロ/マイクロ）の判定
- Pattern A/B/C/Dの分類と規模判定（Pattern B）
- SSoT遷移ルールとdraftライフサイクルの確認
- 各コマンドの入出力SSoT・データフローの理解
- 並列実行パターンの依存関係レベル判定
- docs/ディレクトリ構造とアーティファクト責務境界の把握

## DO NOT USE FOR

- 特定コマンドの実行ロジック・手順記述
- 要件分析手法や壁打ちメソッドロジー（`req-analysis`参照）
- 仕様適合性検出・ループバック判定（`spec-compliance`参照）
- ADR/REQファイルの具体的作成・更新操作（`adr-file-manager`/`req-file-manager`参照）
- レビューNG時の対応フロー（`issue-review-routing`参照）
- 完了報告フォーマット・チェックボックス更新（`issue-reporting`参照）

## 対象コマンド

| コマンド | 用途 |
|----------|------|
| issue-req | 要件壁打ち・分析 |
| issue-save-req | 要件をREQ/ADRファイルとして保存 |
| issue-create | REQファイルからGitHub Issue作成 |
| issue-work | 計画立案から実装・コミット・PR作成まで一括実行 |
| issue-update | Issue本文更新・コメント追加・REQファイル更新 |
| issue-close | PRマージ・記録追記・Issueクローズ・ブランチ削除 |
| issue-next | 次コマンド推論 |
| issue-backlog | クローズ済みissue/PRから残課題抽出・分類・draft保存 |
| issue-backlog-create | 承認済みバックログdraftからEpic+子Issue作成 |

## reference/ 構成一覧

| ファイル | 内容 |
|---------|------|
| phases.md | フェーズ体系（マクロ/マイクロフェーズ定義） |
| ssot-transitions.md | SSoT遷移ルール・draft定位・フェーズ境界ルール |
| pattern-registry.md | Pattern A/B/C/D定義・規模判定・ラベル体系・昇格ルール |
| command-map.md | コマンド関連マップ・入出力SSoT・データフロー図 |
| artifact-boundaries.md | Anchored Development・アーティファクト責務境界・docs構造 |

## See Also

- **issue-reporting**: 完了報告フォーマット・チェックボックス更新ルール・サブエージェント出力ポリシー
- **issue-review-routing**: レビューNG時の対応フロー・issue-next推論ルール
- **adr-file-manager**: ADRファイル管理
- **adr-guidelines**: ADR閾値判定
- **req-file-manager**: REQファイル管理
- **req-analysis**: 要件分析手法
- **spec-compliance**: 仕様適合性検出