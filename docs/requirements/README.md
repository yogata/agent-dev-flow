# REQ インデックス

## 現行要件

<!-- AUTOGEN:BEGIN:id=req-active-count -->
現在の要件判断では、以下77件を第一参照先とする。
<!-- AUTOGEN:END -->

各 REQ の詳細関心は各 REQ ファイル本文を参照のこと。
本表の「タイトル」列は核心契約の要約に留まる。

<!-- AUTOGEN:BEGIN:id=req-active-table -->
| REQ ID | タイトル |
|---|---|
| [REQ-001](REQ-001.md) | 文書体系と持続可能な基準構造 |
| [REQ-002](REQ-002.md) | 配布成果物の責務境界 |
| [REQ-003](REQ-003.md) | 委譲時の判断・承認・副作用境界 |
| [REQ-004](REQ-004.md) | 要求の形成と合意 |
| [REQ-005](REQ-005.md) | ワークフロープロトコルと工程接続 |
| [REQ-006](REQ-006.md) | Case実行オーケストレーション |
| [REQ-007](REQ-007.md) | 完了報告と成果物品質ゲート |
| [REQ-008](REQ-008.md) | 一時成果物ライフサイクル |
| [REQ-009](REQ-009.md) | 配布基盤と導入モデル |
| [REQ-010](REQ-010.md) | 自己監査コマンド（docs-check） |
| [REQ-011](REQ-011.md) | I/O境界と外部連携手段 |
| [REQ-012](REQ-012.md) | 成果物トレーサビリティ |
| [REQ-014](REQ-014.md) | adversarial-review caller integration 共通契約 |
| [REQ-015](REQ-015.md) | adversarial-review caller integration（7 caller と case-auto 停止伝播） |
| [REQ-017](REQ-017.md) | Issue Execution Contract |
| [REQ-018](REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-021](REQ-021.md) | トレーサビリティのワークフロー統合 |
| [REQ-027](REQ-027.md) | Capability Skill・Soft guard・代表ケース検証 |
| [REQ-029](REQ-029.md) | 配布依存境界 |
| [REQ-030](REQ-030.md) | case-open 実行契約（Root Case 確立と Definition Package） |
| [REQ-031](REQ-031.md) | case-run 実行契約（実装実行と委譲） |
| [REQ-032](REQ-032.md) | case-close 実行契約（完了判定とマージ） |
| [REQ-034](REQ-034.md) | case-auto 実行契約（自走オーケストレーション） |
| [REQ-035](REQ-035.md) | Epic と Wave 実行モデル |
| [REQ-036](REQ-036.md) | 検出と診断コマンド群（inspect 系） |
| [REQ-037](REQ-037.md) | 取り込みパイプライン（intake） |
| [REQ-038](REQ-038.md) | 学習パイプライン（learning） |
| [REQ-039](REQ-039.md) | バックログ統合（backlog-review） |
| [REQ-041](REQ-041.md) | backlog 一括整理コマンド（backlog-auto）実行契約 |
| [REQ-044](REQ-044.md) | 標準API委譲の状態制約 |
| [REQ-047](REQ-047.md) | 規則所有権の一方向化 |
| [REQ-048](REQ-048.md) | ADF 実行観測と統制縮小評価 |
| [REQ-049](REQ-049.md) | 追跡Issue管理機構 |
| [REQ-050](REQ-050.md) | scripts 公開入口境界 |
| [REQ-051](REQ-051.md) | ガードレール識別体系と機械検査の再編 |
| [REQ-052](REQ-052.md) | Custom Tool・Plugin/Hook の種別契約と配布境界 |
| [REQ-053](REQ-053.md) | 文書と配布物の文章品質契約 |
| [REQ-054](REQ-054.md) | 変更誘発境界リスク分析 |
| [REQ-055](REQ-055.md) | production-equivalent verification の定義 |
| [REQ-056](REQ-056.md) | Project Knowledge の所有と workflow 利用 |
| [REQ-058](REQ-058.md) | ADF 管理投影物の廃止時クリーンアップ契約 |
| [REQ-059](REQ-059.md) | Decision と REQ の関連宣言管理 |
| [REQ-060](REQ-060.md) | bun test 実行形態の統一（リポジトリルートを cwd にして実行・`./` 付きパス指定） |
| [REQ-061](REQ-061.md) | case-ready 実行契約 |
| [REQ-062](REQ-062.md) | case-revise 実行契約 |
| [REQ-082](REQ-082.md) | 対論型レビュー審議契約 |
| [REQ-083](REQ-083.md) | 設計PRの状態契約（通常 Pull Request・ブランチ命名・用語・正規操作完結） |
| [REQ-088](REQ-088.md) | ADF v4 基盤要件（三層責務・情報寿命・Project Contract・中核文書モデル） |
| [REQ-091](REQ-091.md) | Supervisor 環境向け credential 供給ブリッジの原本管理 |
| [REQ-094](REQ-094.md) | ADF の Markdown 日本語表現および用語選択基準 |
| [REQ-095](REQ-095.md) | agentdev_gh 起票・読取操作の呼出側規律 |
| [REQ-096](REQ-096.md) | ADF判断アーキテクチャ（判断方法・確定権限・人間判断境界） |
| [REQ-097](REQ-097.md) | third-party 成果物の運用前提と導入検知 |
| [REQ-099](REQ-099.md) | ADF 共通原本とホスト接続領域の分離によるマルチホスト併存利用 |
| [REQ-100](REQ-100.md) | ADF が起票する Issue タイトルの記述規則 |
| [REQ-101](REQ-101.md) | Case Issue 工程記録モデル |
| [REQ-102](REQ-102.md) | Git 操作の非対話認証 |
| [REQ-103](REQ-103.md) | ADF v4 正規モデル再確定と現行規範の全面収束 |
| [REQ-104](REQ-104.md) | ADF v5 基盤要件（共通責務とプロジェクト別工程構成） |
| [REQ-105](REQ-105.md) | ADF v5 成果物の意味と工程別正式確定 |
| [REQ-106](REQ-106.md) | ADF v5 差分・変更影響と増分更新 |
| [REQ-107](REQ-107.md) | ADF v5 工程間追跡と品質検証の責務分離 |
| [REQ-108](REQ-108.md) | ADF v5 有限実行とワークフロー責務再編 |
| [REQ-109](REQ-109.md) | ADF v5 移行と互換性の境界 |
| [REQ-110](REQ-110.md) | ADF v5.1 工程駆動コラボレーション（検討テーマ・外部検討と正規成果物の段階形成） |
| [REQ-111](REQ-111.md) | ADF v5.1 工程遷移・独立レビューと変更駆動併存 |
| [REQ-112](REQ-112.md) | local package tsconfig 二重管理統合・typecheck gate 組込みの方針決定 |
| [REQ-113](REQ-113.md) | local package tsconfig 統合・typecheck 組込みの実装 |
| [REQ-114](REQ-114.md) | backlog-auto 一気通貫実行とパッチリリース実行契約 |
| [REQ-115](REQ-115.md) | case-run scripts 配下の型検査基盤導入方針 |
| [REQ-116](REQ-116.md) | GitHub 版隔離検証環境の管理者事前準備常備方針 |
| [REQ-117](REQ-117.md) | docs 整合・検査体系と機械工程の堅牢化（15 作業単位） |
| [REQ-118](REQ-118.md) | 検証に伴う一時資材の取扱いと後片付け責任 |
| [REQ-123](REQ-123.md) | 構造スリム化リファクタリング（trusted-distribution-gate 過剰防御の解体・traceability 試験再編・巨大設計書スリム化・大型スクリプト分割）（6 作業単位） |
| [REQ-124](REQ-124.md) | backlog 一式 20261121 の corpus 現行化と req-define 面強化（10 作業単位） |
| [REQ-125](REQ-125.md) | ADF ワークフローのトークン消費構造改善 |
<!-- AUTOGEN:END -->

## 基準構造

- 現行 REQ: `docs/requirements/REQ-{NNN}.md`
- 廃止済み REQ のIDは再利用しない
- 文書間に矛盾がある場合は現行 REQ を優先する

## 過去版との関係

現行 REQ は `REQ-001〜` の3桁IDを使用する。
過去版の REQ（`REQ-01XX` 番号帯）は tag `v2.11.0` を参照し、`v2:REQ-01XX` の表記で区別する。
過去版と現行 REQ の対応関係は、現行要件の根拠にせず版管理履歴で確認する。
