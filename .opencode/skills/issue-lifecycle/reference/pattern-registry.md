# Pattern Registry

Issueラベルの定義、パターン判定、およびパターン固有の動作ルールを定義する。

## Pattern 定義

| Pattern | 名称 | 付与ラベル | 規模 | docs/更新 | ワークフロー経路 |
|---------|------|-----------|------|-----------|----------------|
| A | バグ修正・軽微変更 | `bug`, `critical` | 小 | なし | issue-req → issue-create → issue-work → issue-close |
| B | 機能追加 | `enhancement`, `feature` | 中 | あり | issue-req → issue-save-req → issue-create → issue-work → issue-close |
| C | リファクタリング・保守作業 | `refactor`, `maintenance` | 小 | なし | issue-req → issue-create → issue-work → issue-close |
| D | ドキュメント・雑務 | `docs`, `chore` | 小 | なし | issue-req → issue-create → issue-work → issue-close |

## 規模判定 (Pattern Bのみ)

Pattern B（機能追加）の規模を判定し、Epic分割の要否を決定する。**Pattern C/DはEpic分割に対応しない**（規模判定は適用されない）。

### 規模判定基準

以下の3つの条件のいずれか1つでも満たす場合、`scale: large`（Epic）と判定する：

1. **複数モジュールにまたがる機能追加** (e.g., UI + API + DB)
2. **1 Issue (1 issue-work) で実装しきれない規模** (PR肥大化リスク)
3. **段階的リリースが必要** (フェーズ分け・マイルストーン分割)

いずれの条件も満たさない場合、`scale: standard`（デフォルト）とする。

### 規模値

| 値 | 説明 | 動作 |
|----|------|------|
| `standard` | 通常規模の機能追加（デフォルト） | 単一Issueとして作成・実行 |
| `large` | 大規模機能追加（Epic） | Epic + 子Issueとして分割・作成 |

### Epic振る舞いルール (Pattern B - large)

| コマンド | 振る舞い |
|----------|----------|
| `issue-req` | 規模判定を実行し、draft-metaに `scale: standard/large` を記録 |
| `issue-create` | `scale: large` の場合、Epic + 子Issueを一括作成（`issue_desc_epic.md` / `issue_desc_child.md`） |
| `issue-backlog` | 残課題を抽出・分類し、解消チェック後にdraftとして保存 |
| `issue-backlog-create` | `issue_desc_backlog_epic.md` / `issue_desc_backlog_child.md` テンプレートでEpic + 子Issueを作成 |
| `issue-work` | 子Issue群を既存並列機能で一括実行 |
| `issue-close` | 既存のEpic自動クローズ機能を利用（変更なし） |

### Epicラベル

| 側面 | 付与ラベル |
|------|-----------|
| Epic側 | `enhancement`, `feature`, `epic` |
| 子Issue側 | `enhancement`, `feature` |

## Pattern 判定ルール

- `bug`, `critical` → Pattern A
- `enhancement`, `feature` → Pattern B
- `refactor`, `maintenance` → Pattern C
- `docs`, `chore` → Pattern D
- `needs-discussion` は任意のPatternに付与可能（判定には影響しない）

## Pattern 昇格ルール（FIX-023）

Pattern A で ADR が必要な場合（`adr-guidelines` の閾値判定で「必要」となった場合）、Pattern B に昇格する。昇格時は `enhancement`, `feature` ラベルを付与し、`issue-save-req` を実行する。REQファイル・ADRファイルの作成が必要となるため。

## Pattern 固有の動作ルール

| 項目 | Pattern A | Pattern B | Pattern C | Pattern D |
|------|-----------|-----------|-----------|-----------|
| REQ ファイル | 作成しない | `issue-save-req` で作成 | 作成しない | 作成しない |
| ADR ファイル | 必要に応じて | `issue-save-req` で作成 | 必要に応じて | 必要に応じて |
| specs 更新 | スキップ | `issue-work` で更新 | スキップ | スキップ |
| ドラフト保存 | しない | `.sisyphus/drafts/` に保存 | しない | しない |
| issue-save-req | 実行不可 | 実行する | 実行不可 | 実行不可 |
| ブランチ type | `fix` | `feature` | `refactor` | `chore` |
| Issue テンプレート | `issue_desc_bug.md` | `issue_desc_feature.md` | `issue_desc_bug.md` ※ | `issue_desc_bug.md` ※ |
| コメントテンプレート | `issue_comment_bug_analysis.md` | `issue_comment_feature_technical.md` | `issue_comment_bug_analysis.md` ※ | `issue_comment_bug_analysis.md` ※ |
| close テンプレート | `issue_comment_bug_record.md` | `issue_comment_feature_implementation.md` | `issue_comment_bug_record.md` ※ | `issue_comment_bug_record.md` ※ |
| docs 検証 (close) | スキップ | 実行する | スキップ | スキップ |

### Pattern B 固有ルール: Epic (large)

| 項目 | Epic (large) |
|------|-------------|
| Issue作成単位 | Epic + 子Issue一括作成 |
| 子Issueラベル | `enhancement`, `feature` |
| Epicラベル | `enhancement`, `feature`, `epic` |
| 実行方法 | 子Issue群を並列実行（既存並列機能を利用） |
| ドラフト保存 | `.sisyphus/drafts/` に保存（Epic + 子Issue構成） |
| 親子関係 | 子Issue本文に `Parent: #{EPI-C_ISSUE番号}` を記載 |
| 進捗追跡 | Epic本文にステータス追跡テーブル（☐/🔄/✅/❌）を配置 |
| Epicクローズ | 全子Issue完了時に自動クローズ（既存機能を利用） |

## Pattern A〜D 対応表（REQ-0001-009）

各Patternの属性対応表を定義する。

| 項目 | Pattern A | Pattern B | Pattern C | Pattern D |
|------|-----------|-----------|-----------|-----------|
| Type labels | `bug`, `critical` | `enhancement`, `feature` | `refactor`, `maintenance` | `docs`, `chore` |
| Branch type | `fix` | `feature` | `refactor` | `chore` |
| REQ要否 | 不要 | 必要 | 不要 | 不要 |
| ADR要否 | 不要（必要に応じて） | 必要 | 不要（必要に応じて） | 不要（必要に応じて） |
| specs更新要否 | 不要 | 必要 | 不要 | 不要 |
| Review focus | 修正の正確性 | 要件充足・設計妥当性 | 既存機能の非退化 | 正確性・完全性 |

## Pattern C/D テンプレート再利用

Pattern C/DはPattern Aと同等のlightweight workflowであるため、Pattern Aのテンプレートを再利用する。

- **Issue テンプレート**: `issue_desc_bug.md`
- **コメント テンプレート**: `issue_comment_bug_analysis.md`
- **close テンプレート**: `issue_comment_bug_record.md`

> **注意**: Pattern C/Dはバグ修正ではないが、専用テンプレートが存在しないためPattern Aテンプレートを再利用する。テンプレート内の「バグ」「修正」等の表現と実際の作業内容にセマンティックな不一致が生じるが、ユーザーによって許容されている。将来の改善で専用テンプレートの導入が検討される場合、この再利用関係を解消すること。

## Pattern C/D + Epic 制約

Pattern C/DはEpic分割に対応しない。規模判定はPattern B（機能追加）のみの仕組みであり、C/Dに`scale`判定は適用されない。

- `refactor`/`maintenance`/`docs`/`chore`ラベルを持つIssueに`epic`ラベルが付与された場合、エージェントはEpic分割を実行せず、ユーザーに確認すること
- C/Dは常に単一Issueとして扱う

## ラベル矛盾検知ガード節（REQ-0001-010）

コマンド実行時に、検出されたPatternとラベルが暗示するPatternが矛盾する場合、コマンドは**直ちに停止**しユーザーに確認を求める。自動推定で矛盾を解消してはならない。

**判定ロジック**: `detected_pattern ≠ label_implied_pattern` の場合に停止。

**矛盾の例**:

| 矛盾パターン | 検出ラベル | 暗示Pattern | 実際のPattern | 検知理由 |
|-------------|-----------|------------|-------------|---------|
| bug + refactor | `bug`, `refactor` | A と C が競合 | — | 複数Patternにまたがるラベル矛盾 |
| enhancement + docs | `enhancement`, `docs` | B と D が競合 | — | 機能追加とドキュメント作業の混在 |
| feature + chore | `feature`, `chore` | B と D が競合 | — | 機能追加と雑務の混在 |
| bug + enhancement | `bug`, `enhancement` | A と B が競合 | — | バグ修正と機能追加の混在 |

**参照**: REQ-0001-010「label と metadata/template-type が矛盾する場合、コマンドは停止してユーザー確認を求めなければならない（SHALL）」

## ラベルマッピング

| 変更種別           | 付与ラベル                                                |
| ------------------ | --------------------------------------------------------- |
| バグ修正           | `bug`                                                     |
| バグ修正（緊急）   | `bug`, `critical`                                         |
| 機能追加           | `enhancement`, `feature`                                  |
| 機能追加（要検討） | `enhancement`, `feature`, `needs-discussion`              |
| 機能追加（大規模/Epic） | `enhancement`, `feature`, `epic`                         |
| リファクタリング   | `refactor`                                                |
| 保守作業           | `maintenance`                                             |
| ドキュメント       | `docs`                                                    |
| 雑務               | `chore`                                                   |
| バックログEpic        | Epic: `enhancement`, `epic` / 子Issue: `enhancement`    |

## 参照

- **アーティファクト責務境界**: [`reference/artifact-boundaries.md`](./artifact-boundaries.md)
- **コマンド関連マップ**: [`reference/command-map.md`](./command-map.md)