---
name: adr-guidelines
description: Evaluates whether architectural decisions require an ADR. USE FOR: proposing architecture changes, selecting tech stacks, or making hard-to-reverse technical decisions. DO NOT USE FOR: creating or managing ADR files, requirement analysis, or implementation planning.
---

# ADR評価ガイドライン

## 評価基準（いずれかに該当すればADR作成推奨）

1. **アーキテクチャ上の重要性**: システム全体の構造・主要コンポーネント間の関係に影響
2. **長期的影響**: 将来の開発や運用に長期的に影響を与える
3. **逆転の困難さ**: 後で変更するコストが非常に高い・困難

## ADR作成ガイドライン

### ADRを作成すべき基準
すべての変更に対してADRを作成する必要はありません。「アーキテクチャ上重要である（Architecturally Significant）」と判断される決定に対して作成します。

### 作成が必要な例
- **技術スタックの選定**: 言語、フレームワーク、ライブラリ、ミドルウェアの採用や変更
- **アーキテクチャパターン**: フォルダ構成、通信プロトコル、データアクセスパターン（例：Repositoryパターンの採用）
- **セキュリティ・認証**: 認証・認可方式の決定、暗号化アルゴリズムの選定
- **データモデル**: データベースのスキーマ設計における重要な方針、外部サービスとのデータ同期戦略
- **主要な外部サービス**: 決済、メール配信、監視などのサードパーティサービスの選定

### 作成が不要な例
- **バグ修正**: 既存の設計に基づいた不具合の修正
- **UIの微調整**: レイアウトやスタイルの変更（デザインシステム全体の変更はADR対象となり得る）
- **軽微なリファクタリング**: 外部仕様やアーキテクチャに影響しないコードの整理
- **機能実装**: 既存のアーキテクチャパターンに従った新機能の追加

## ADRのライフサイクル
ADRの状態は以下のいずれかをとります。一度 Accepted された ADR は**直接書き換えず**、変更が必要な場合は新しい ADR を作成して古いものを Superseded/Deprecated にします。

- **Proposed**: 提案中。議論が行われている状態。
- **Accepted**: 合意済み。現在のプロジェクトに適用されている状態。
- **Superseded**: 他の新しい決定（別のADR）によって置き換えられた状態。新しいADRへの参照を含める必要があります。
- **Deprecated**: 推奨されなくなった、または廃止された状態。

## 運用ルール
- **不変性**: Accepted された ADR は不変（Immutable）として扱います。背景が変わり決定を覆す場合は、新しい連番で ADR を作成してください。
- **レビュー**: ADR はプルリクエストを通じて提案され、チームメンバーによる合意（Accepted）を得る必要があります。
- **AIエージェントへの指示**: AIエージェントが開発を行う際は、本ガイドラインに従い、アーキテクチャ上の重要な決定を伴う場合は自律的に ADR を起草してください。

## 保存先・命名規則

- 保存先: `docs/adr/ADR-{NNNN}.md`
- 命名: `ADR-{NNNN}` は4桁ゼロ埋め連番（既存ADRの最大番号 + 1）。ファイル管理の詳細は `adr-file-manager` を参照

## 出力形式

- ADR作成推奨: `[アーキテクチャ的な重要性や判断理由]`
- ADR不要: `[不要と判断した理由]`

---

## See Also

- **adr-file-manager**: ADRファイルの作成・追記・更新操作とバリデーション
- **req-analysis**: 要件分析におけるADR閾値判定ブリッジ
- **issue-guide-phases**: issue-*ワークフロー統括ハブ（フェーズ定義・SSoT遷移・パターン判定）
