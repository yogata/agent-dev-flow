# REQ インデックス

## 現行要件

<!-- AUTOGEN:BEGIN:id=req-active-count -->
現在の要件判断では、以下43件を第一参照先とする。
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
| [REQ-016](REQ-016.md) | adversarial-review caller integration 横断整合 |
| [REQ-017](REQ-017.md) | Issue Execution Contract |
| [REQ-018](REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-021](REQ-021.md) | トレーサビリティのワークフロー統合 |
| [REQ-027](REQ-027.md) | Capability Skill・Soft guard・代表ケース検証 |
| [REQ-029](REQ-029.md) | 配布依存境界 |
| [REQ-030](REQ-030.md) | case-open 実行契約（Issue構成生成） |
| [REQ-031](REQ-031.md) | case-run 実行契約（実装実行と委譲） |
| [REQ-032](REQ-032.md) | case-close 実行契約（完了判定とマージ） |
| [REQ-033](REQ-033.md) | case-update 実行契約（Issue・要件更新） |
| [REQ-034](REQ-034.md) | case-auto 実行契約（自走オーケストレーション） |
| [REQ-035](REQ-035.md) | Epic と Wave 実行モデル |
| [REQ-036](REQ-036.md) | 検出と診断コマンド群（inspect 系） |
| [REQ-037](REQ-037.md) | 取り込みパイプライン（intake） |
| [REQ-038](REQ-038.md) | 学習パイプライン（learning） |
| [REQ-039](REQ-039.md) | バックログ統合（backlog-review） |
| [REQ-041](REQ-041.md) | backlog 一括整理コマンド（backlog-auto）実行契約 |
| [REQ-042](REQ-042.md) | Case統合先とブランチモデル |
| [REQ-043](REQ-043.md) | 評価ブランチ実証ワークフロー |
| [REQ-044](REQ-044.md) | 標準API委譲の状態制約 |
| [REQ-045](REQ-045.md) | 現行成果物体系の整合性網羅監査 |
| [REQ-046](REQ-046.md) | 横断正規化後の不変条件 |
| [REQ-047](REQ-047.md) | 規則所有権の一方向化 |
| [REQ-048](REQ-048.md) | ADF 実行効率第1次改善（実行観測基盤） |
| [REQ-049](REQ-049.md) | 追跡Issue管理機構 |
| [REQ-050](REQ-050.md) | scripts 公開入口境界 |
| [REQ-051](REQ-051.md) | ガードレール識別体系と機械検査の再編 |
| [REQ-052](REQ-052.md) | Custom Tool・Plugin/Hook の種別契約と配布境界 |
<!-- AUTOGEN:END -->

## 廃止済み要件

<!-- AUTOGEN:BEGIN:id=req-retired-table -->
| REQ ID | タイトル |
|---|---|
| [REQ-013](retired/REQ-013.md) | DOC-MAP 依存除去 |
| [REQ-020](retired/REQ-020.md) | Artifact Graph 解析品質と検証 |
| [REQ-022](retired/REQ-022.md) | Artifact Graph augmentation 配置先正規化 |
| [REQ-023](retired/REQ-023.md) | Artifact Graph 問い合わせ結果の関係情報拡張 |
| [REQ-024](retired/REQ-024.md) | Artifact Graph 未解決参照 warning の分類と抽出規則改善 |
| [REQ-025](retired/REQ-025.md) | IR 検証ルールの Decision 移行残存修復 |
| [REQ-026](retired/REQ-026.md) | skill rename 対称性検査観点の targeted docs guard 追加 |
| [REQ-028](retired/REQ-028.md) | IR 体系の実効性監査と存在条件厳格化 |
| [REQ-040](retired/REQ-040.md) | トレーサビリティ高位問い合わせ（Trace Query） |
<!-- AUTOGEN:END -->

## 基準構造

- 現行 REQ: `docs/requirements/REQ-{NNN}.md`
- 廃止済み REQ のIDは再利用しない
- 文書間に矛盾がある場合は現行 REQ を優先する

## 過去版との関係

現行 REQ は `REQ-001〜` の3桁IDを使用する。
過去版の REQ（`REQ-01XX` 番号帯）は tag `v2.11.0` を参照し、`v2:REQ-01XX` の表記で区別する。
過去版と現行 REQ の対応関係は、現行要件の根拠にせず版管理履歴で確認する。
