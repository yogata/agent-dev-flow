---
description: inbox.mdから正規化、分類、8軸評価、HITL確定を経て採用済み成果物を生成する
agent: sisyphus
---

# 学びの正規化、評価、昇華判定と採用済み成果物生成

`.agentdev/learning/inbox.md` の学びエントリを読み込み、正規化、問題クラス分類、8軸評価、廃棄判定、既存対策確認、HITL承認を経て採用済み成果物を生成する。

**重要**: `.opencode/` への直接配置、直接反映は行わない。
反映ルート: promoted → `/agentdev/backlog-review`（RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`。
旧 `learning-refine` の全機能を吸収済み（事前実行不要）。

## project doc-inputs

本コマンドは以下の6歩で docs を解決する（ADR-0133）。

1. `.agentdev/config.yaml` を読み込む
2. `.agentdev/doc-inputs/commands/learning-promote.yaml` を読み込む
3. `must_read` に列挙された paths を読み込む
4. `conditional_read` の条件が該当する場合のみ、当該 paths を読み込む
5. doc-input に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない
6. doc-input が存在しない場合は `config.yaml` の `roots` と明示入力のみを使う

## 入力

- `.agentdev/learning/inbox.md`（必須）— 未処理の学びエントリ
- `.agentdev/learning/deferred.md`（任意）— 過去エントリ参照用

## 出力

- `.agentdev/learning/evaluation-report.md`（8軸評価レポート、評価根拠中間成果物）
- `.agentdev/learning/promoted/{category}-{name}.md`（採用済み成果物）
- `.agentdev/learning/deferred.md`（inbox からの移動分を追記）
- `.agentdev/learning/inbox.md`（ヘッダーのみにクリア）

## 手順

### Step 1: inbox.md 読込

ファイルなし → エラー終了（「先に `agentdev-learning-capture` skill で学びを追加してください」）。`---` 区切りエントリをカウント、0件 → 「分析対象の学びがありません」と終了

### Step 2: deferred.md 読込

存在すれば読込、不存在は空として扱う

### Step 3: 全エントリの読込と旧フォーマット正規化

`agentdev-learning-pipeline` を参照

### Step 4: 問題クラス分類

`agentdev-learning-pipeline` を参照

### Step 5: 8軸評価スコアリング

`agentdev-learning-pipeline` を参照

### Step 6: evaluation-report.md 生成、更新

`agentdev-learning-pipeline` を参照

### Step 7: 廃棄判定（11カテゴリ + duplicate）

`agentdev-learning-pipeline` を参照

**昇華可能性評価、無条件自動REQ化禁止（REQ-0155-005）**: 各問題クラスについて恒久契約（REQ/ADR/SPEC）への昇華可能性を評価する。
8軸評価スコア、禁止条件フィルタリングゲート、既存対策照合を基に昇華可否を判定する。
**無条件の自動REQ化は禁止する**。
学びは昇華（`promoted/` → `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save`）を経て初めて REQ 化される。
学びを直接 REQ 化しない。

**living pool 維持（REQ-0155-005）**: 昇華不能な知見（`deferred` 判定、情報が断片的、出現回数が少ない等）は `deferred.md` の living pool で維持し、REQ 化しない。`deferred.md` は deferred カテゴリ（11廃棄判定カテゴリの1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する多状態の living pool である（AG-005）。終端保管ではなく、次回 `/agentdev/learning-promote` 実行時に再評価の対象となる。

### Step 8: 既存対策確認

`agentdev-learning-pipeline` を参照

### Step 9: ユーザーへの判定結果提示

`agentdev-learning-pipeline` を参照

### Step 10: ユーザー承認

`agentdev-learning-pipeline` を参照

**判定基準参照**: Step 3〜10 の判定基準、スコアリングルール、提示形式、承認フローは、全て `agentdev-learning-pipeline` の該当 Phase を参照。

### Step 11: 実行前同期（git pull）

- `git pull --ff-only` を実行
- **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（自動解消しない）

### Step 12: 採用済み成果物生成（staging領域のみ）

- 出力先: `.agentdev/learning/promoted/{disposal-category}-{name}.md`
- **`.opencode/` 直接書込禁止**/ **`case-run` への直接受け渡し禁止**（`backlog-review` 経由で RU 化）
- フォーマット: `agentdev-learning-pipeline` を参照

### Step 13: アーカイブ移動（原子的操作）

- **Step 13-1**: inbox.md 全エントリを deferred.md に追記（`**移動日**: YYYY-MM-DD` フィールド追加）
- **Step 13-2**: deferred.md 書込検証（追記エントリ数をカウント照合）
- **Step 13-3**: Step 13-2 成功時のみ inbox.md をヘッダーのみにクリア:
 ```markdown
 # 学び、教訓

 このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
 まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

 ---
 ```
- Step 13-2 失敗 → inbox.md 変更せず、エラー内容を報告

### Step 14: 昇華時 prune（deferred.md からの除去）

- **prune 対象**: staged（採用済み成果物生成済み）/ rejected/ duplicate のエントリのみ
- **prune 非対象**: deferred/ 未処理のエントリは残す（REQ-0147-007）
- **証拠保存**: staged エントリ除去時に採用済み成果物の「元learning item/ 根拠」セクションに保存
- **自動実行**（REQ-0147-006）: Step 10 のユーザー承認（判定確定）と同時に prune も承認済みとみなす。staged（根拠は採用済み成果物に保存済み）/ rejected / duplicate（判定理由は記録済み）のエントリは追加確認なしで削除する。
- 詳細は `agentdev-learning-pipeline` を参照

### Step 15: .agentdev 変更の commit と push

- `git diff --name-only` で `.agentdev/` 配下の変更を確認
- **変更なし時**: commit/push せず完了報告で「変更なし」と報告
- **変更あり時**:
 1. `git add` は `.agentdev/learning/` 配下のみを対象とする。
 並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い明示パスでステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。
 `.agentdev/` 全体の一括スコープは禁止し、スイープ操作（`git add -A`/ `git add .` 等）も禁止
 2. commit message: `chore(agentdev): promote learning findings`
 3. `git push` 実行
 4. **push 失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（完了扱いにしない）

### Step 16: 完了報告

template: `.opencode/commands/agentdev/templates/learning-promote/standard.md`。以下を含める:
- 8軸評価サマリ（加重合計スコア分布）
- 判定結果（promote/defer/reject/duplicate 件数）
- 後続ルート（`/agentdev/backlog-review`）
- git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）

## ガードレール

- G01: `.opencode/` 直接反映禁止: 採用済み成果物は `.agentdev/learning/promoted/` のみに生成
- G02: `evaluation-report.md` は本コマンドが生成、管理: 外部コマンドの事前生成に依存しない
- G03: `case-run` への直接受け渡し禁止: `/agentdev/backlog-review` 経由のみ
- G04: 主入力は `inbox.md`: raw learning item の再分類は禁止
- G05: 既存対策を優先: 「新規X化」より「既存Xへ反映」を優先
- G06: ユーザー承認必須: 判定、prune ともに承認なしに実行しない
- G07: 管理用ファイル（`elevation-ledger.md` 等）は生成しない
- G08: `learning-refine` への依存禁止: 本コマンドは旧機能を内包し事前実行を前提としない
- G09: 破壊的変更（inbox.md 全体強制クリア、大量エントリ一括削除等）は Step 10 承認とは別に明示承認を維持する（REQ-0147-005）
- G10: 無条件の自動REQ化禁止（REQ-0155-005）: 学びを直接 REQ 化しない。恒久契約（REQ/ADR/SPEC）への昇華可能性を Step 7 で評価し、昇華可能なもののみ `promoted/` へ出力する。昇華不能な知見は living pool（`deferred.md`）で維持する

## ユーザー確認ポイント

1. **Step 9-10**: 廃棄判定結果、8軸評価スコアの確認、修正、承認（判断の確定、REQ-0147-003）

2. **Step 14**: prune は Step 10 承認と同時に承認済みとみなし自動実行（REQ-0147-006）。
staged/rejected/duplicate の追加確認は不要。

## エラー処理

| エラー | 対処 |
|--------|------|
| inbox.md が存在しない | エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」 |
| 学びが0件 | 「分析対象の学びがありません」と報告して終了 |
| クラスタが0件 | 「昇華対象のクラスタがありません」と報告して終了 |
| ユーザーが承認しない | 「昇華をキャンセルしました」と報告して終了 |
| 旧フォーマットパース失敗 | 当該エントリをスキップし警告出力、処理継続 |
| staging領域書込失敗 | エラー内容を報告 |
| deferred.md prune 失敗 | 採用済み成果物は保持。prune エラー報告し手動 prune 案内 |
| deferred.md 書込失敗 | inbox.md は変更しない。エラー内容を報告 |
| git pull --ff-only 失敗 | 構造化エラー表示して停止。自動解消しない |
| git push 失敗 | 構造化エラー表示。完了扱いにしない |

## 成果物ライフサイクル

各成果物の役割、性格、ライフサイクル詳細は `agentdev-learning-pipeline` を参照。

**learning-promote の責務**: normalize → classify → 8-axis eval → evaluation-report → disposal judgment → HITL → 採用済み成果物生成 → archive move → prune。
採用済み成果物は `/agentdev/backlog-review` 経由で RU 化後に `/agentdev/req-define` に合流する。


