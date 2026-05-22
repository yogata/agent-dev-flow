# 完了報告フォーマット

各コマンド完了時の報告フォーマットを定義する。

## 必須フォーマット宣言

全agentdevコマンドは完了報告時に**必ず**本ファイルの該当セクションのフォーマットを使用すること。独自フォーマットの使用は禁止する（SHALL）。各セクションのコードブロック内の変数（`{...}`）のみを実際の値に置換して出力すること。

### 汎用締め文の禁止

完了報告では以下の汎用締め文を禁止する（MUST NOT）:
- 「次にやるべきことがあれば指示してください」
- 「他にご要望があればお知らせください」
- 「何かあればお気軽にどうぞ」
- その他、ユーザーへの次回アクション委譲を促す汎用的な文言

**理由**: 各コマンドの完了報告には `completion-reports.md` で定義された具体的な `次のステップ` または終端として明示的な完了宣言が含まれるため、汎用締め文は不要であり、フォーマット統一を損なう。

## 完了報告出力順序ルール

全agentdevコマンドの完了報告ステップにおいて、以下の順序を**必ず**守ること。

1. **TodoWrite更新（先）**: TodoWriteの「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 本スキルの完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite更新と完了報告テキストの間に、他の中間出力（ログ・進捗報告・確認メッセージ等）を挟まない

**適用対象**: req-define, req-save, case-open, case-run, case-run (Epic Orchestrator), case-close, case-update, intake-from-github, intake-open, learning-refine, learning-promote, intake-capture, intake-review, intake-promote, integrity-check の全完了報告ステップ

**理由**: 完了報告テキストがユーザーに最後に表示されることで、最終結果の視認性が向上する

## req-define 完了時

```
✅ 要件定義が完了しました（{日本語名称}：{規模}）。
  {機能追加の場合: 壁打ちドラフトを .sisyphus/drafts/ に保存しました。}
  次のステップ: {機能追加の場合: /agentdev/req-save / バグ修正・軽微変更の場合: /agentdev/case-open}
```
- Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照

### 壁打ち結論ハイライト

req-define完了時は以下のハイライトを報告に続けて出力する。

```
📋 壁打ち結論ハイライト
  背景: {課題の1行サマリ}
  目標: {達成すべきゴール}
  要件数: {機能要件の数}
   主要な判断: {壁打ちで合意した技術判断}
```

### Epic規模判定時

req-define完了時、Epic規模と判定された場合は以下の追加報告を出力する。

```
✅ 要件定義が完了しました（機能追加 Epic：大規模機能追加）。
  壁打ちドラフトを .sisyphus/drafts/ に保存しました。
  規模判定: Epic（複数モジュール跨ぎ、分割推奨）
  次のステップ: /agentdev/req-save
```

## req-save 完了時

```
✅ 要件をdocs/に保存しました（REQ-{NNNN} を{CREATE/APPEND/UPDATE}）。
  {ADR作成がある場合: ADR-{NNNN} を作成しました。}
  次のステップ: /agentdev/case-open
```

## case-open 完了時

```
✅ Issue #{N} を作成しました（{日本語名称}）。
  {機能追加の場合: REQ-{NNNN} をIssue本文に反映しました。}
  次のステップ: /agentdev/case-run {N}
```

### Epic作成時

Epic Issueを作成した場合は以下の報告を出力する。

```
✅ Epic Issue #{epic_N} を作成しました（機能追加 Epic）。
  REQ-{NNNN} をEpic本文に反映しました。
  子Issue: #{child1}, #{child2}, #{child3}（{count}件）
  Wave構成: {wave_count} Wave（{wave_summary}）
  次のステップ: /agentdev/case-run {epic_N}
```

## learning-refine 完了時

```
✅ learning-refine 完了
  - 問題クラス数: {N}（未分類含む）
  - 処理したエントリ数: {N}（inbox → archive）
  - prune したエントリ数: {N}
  - evaluation-report.md: {path}
  - git 永続化:
      - 変更: {あり/なし}
      - {変更ありの場合: commit: {hash}, files: {file_list}, push: {成功/失敗}}
      - {変更なしの場合: commit/push スキップ}
```

## learning-promote 完了時

```
✅ learning-promote 完了
  - 生成 stub: {N}件（{file_list}）
  - prune 結果: 除去 {N}件 / 残存 {N}件
  - git 永続化:
      - 変更: {あり/なし}
      - {変更ありの場合: commit: {hash}, files: {file_list}, push: {成功/失敗}}
      - {変更なしの場合: commit/push スキップ}
  - 次のステップ: /agentdev/req-define {stub_path}
```

## case-run 完了時

```
✅ case-run 完了
  PR: {PR_URL}
  現在の状態: レビュー待ち
  head: {branch_name}
  base: {base_branch}
  次のステップ: レビューが通ったら /agentdev/case-close
```

## case-update 完了時

更新種別に応じた報告フォーマットを使用する。

**`--body` の場合**:
```
✅ Issue #{N} の本文を更新しました（--body）。
  次のステップ: /agentdev/case-run {N}
```

**`--comment` の場合**:
```
✅ Issue #{N} にコメントを追加しました（--comment）。
  次のステップ: /agentdev/case-run {N}
```

**`--req` の場合**:
```
✅ Issue #{N} のREQファイルを更新しました（--req: {APPEND/UPDATE} REQ-{NNNN}）。
  更新内容: {更新したセクション名のリスト}
  次のステップ: /agentdev/case-run {N}
```

**`--review-ng` の場合**:
```
⚠️ Issue #{N} にレビューNG報告を投稿しました（--review-ng）。
  乖離タイプ: {spec-bug / impl-bug / scope-creep}
  影響REQ番号: {REQ番号のリスト}
  推奨アクション: {修正 / 承認 / 差し戻し}
  次のステップ: ユーザーの判断に基づき対応（修正 → /agentdev/case-run {N} / 差し戻し → /agentdev/req-define）
```

## case-close 完了時

```
✅ case-close 完了
  - Issue #{N} をクローズ
  - PR #{PR_N} をマージ
  - 関連リソースをクリーンアップ
  {機能追加の場合: - ドキュメント（REQ・specs）を更新済み}
  {Epic自動クローズの場合: - Epic #{epic_N} を自動クローズ（全子Issue完了）}
  {Epicスキップの場合: - Epic #{epic_N}: N件未完了のためスキップ}
  - git 永続化:
      - 変更: {あり/なし}
      - {変更ありの場合: commit: {hash}, files: {file_list}, push: {成功/失敗}}
      - {変更なしの場合: commit/push スキップ}
```

## intake-from-github 完了時

```
✅ intake-from-github 抽出完了
  - 対象期間: {since} 〜 {until}
  - 対象 Issue/PR 数: {N}
  - 抽出候補数: {M}
  - 保存先: .agentdev/intake/inbox/（{file_count}件）
  - 次のステップ: /agentdev/intake-review
```

## intake-open 完了時

```
✅ intake-open 完了
  - Issue: #{N}
  - promoted artifact: {artifact_path}（issued）
  - 検証結果: ✅ OK（N件の書き込み操作を検証済み）
  - 次のステップ: /agentdev/case-run {N}
```

### Epic作成時

Epic + 子Issue を作成した場合は以下の報告を出力する。

```
✅ intake-open 完了（Epic）
  - Epic: #{epic_N}
  - 子Issue: #{child1}, #{child2}, ...（{count}件）
  - ステータス追跡: ☐ 未着手 {count}件
  - promoted artifact: {artifact_path}（issued）
  - 検証結果: ✅ OK（N件の書き込み操作を検証済み）
  - 次のステップ: /agentdev/case-run {epic_N}
```

## case-run Epic Orchestrator 集約完了報告

Epic Orchestrator モード（`/agentdev/case-run {epic_N}`）で全 Wave 完了後に出力する集約報告フォーマット。各子 Issue の subagent が個別の case-run 完了報告を出力した後に、親エージェントが本フォーマットで集約結果を報告する。

### 全件成功時

```
✅ Epic Orchestrator 実行結果（Epic #{epic_N}）

| Wave | Issue | 状態 | PR | 備考 |
|------|-------|------|----|----|
| 1 | #{child1_N} | ✅ 完了 | #{pr1_N} | — |
| 2 | #{child2_N} | ✅ 完了 | #{pr2_N} | — |
| 3 | #{child3_N} | ✅ 完了 | #{pr3_N} | — |

**成功**: {success_count}件 / **失敗**: 0件 / **スキップ**: 0件
```

### 部分失敗・スキップあり

```
⚠️ Epic Orchestrator 実行結果（Epic #{epic_N}）

| Wave | Issue | 状態 | PR | 備考 |
|------|-------|------|----|----|
| 1 | #{child1_N} | ✅ 完了 | #{pr1_N} | — |
| 2 | #{child2_N} | ❌ 失敗 | — | 実装フェーズでエラー |
| 3 | #{child3_N} | ⏭ スキップ | — | Wave 2 失敗依存 |

**成功**: {success_count}件 / **失敗**: {fail_count}件 / **スキップ**: {skip_count}件
```

### 全件失敗時

```
❌ Epic Orchestrator 実行結果（Epic #{epic_N}）

| Wave | Issue | 状態 | PR | 備考 |
|------|-------|------|----|----|
| 1 | #{child1_N} | ❌ 失敗 | — | {error_summary_1} |
| 2 | #{child2_N} | ❌ 失敗 | — | {error_summary_2} |

**成功**: 0件 / **失敗**: {fail_count}件 / **スキップ**: 0件
```

### フォーマット共通ルール

- 状態値: `✅ 完了` / `❌ 失敗` / `⏭ スキップ` の3種類
- PR列: 成功時はPR番号リンク、失敗・スキップ時は `—`
- 備考列: 成功時は `—`、失敗時はエラー概要、スキップ時は依存先Wave番号
- Wave列: Wave番号（Epic本文の実行順序テーブルに対応）
- 集約行: 成功・失敗・スキップ件数のサマリー

### git 永続化セクションのルール

- learning-refine, learning-promote, case-close の完了報告にのみ git 永続化セクションを含める
- 変更なしの場合は「commit/push スキップ」とだけ表示する
- push 失敗時は「push: 失敗」と表示し、完了報告全体を ⚠️ に変更する