# REQ インデックス

## 現行要件

<!-- AUTOGEN:BEGIN:id=req-active-count -->
現在の要件判断では、以下21件を第一参照先とする。
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
| [REQ-010](REQ-010.md) | 自己監査と診断・是正候補抽出 |
| [REQ-011](REQ-011.md) | I/O境界と外部連携手段 |
| [REQ-012](REQ-012.md) | Artifact Graph 標準化 |
| [REQ-013](REQ-013.md) | DOC-MAP 依存除去 |
| [REQ-014](REQ-014.md) | adversarial-review caller integration 共通契約 |
| [REQ-015](REQ-015.md) | adversarial-review caller integration 7経路+case-auto |
| [REQ-016](REQ-016.md) | adversarial-review caller integration 横断整合 |
| [REQ-017](REQ-017.md) | Issue Execution Contract |
| [REQ-018](REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-020](REQ-020.md) | Artifact Graph 解析品質と検証 |
| [REQ-021](REQ-021.md) | Artifact Graph ワークフロー統合 |
<!-- AUTOGEN:END -->

## 廃止済み要件

<!-- AUTOGEN:BEGIN:id=req-retired-table -->
| REQ ID | タイトル |
|---|---|
<!-- AUTOGEN:END -->

## 基準構造

- 現行 REQ: `docs/requirements/REQ-{NNN}.md`
- 廃止済み REQ のIDは再利用しない
- 文書間に矛盾がある場合は現行 REQ を優先する

## 過去版との関係

現行 REQ は `REQ-001〜` の3桁IDを使用する。
過去版の REQ（`REQ-01XX` 番号帯）は tag `v2.11.0` を参照し、`v2:REQ-01XX` の表記で区別する。
過去版と現行 REQ の対応関係は、現行要件の根拠にせず版管理履歴で確認する。
