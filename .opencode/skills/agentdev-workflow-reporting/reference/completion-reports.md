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

**理由**: 各コマンドの完了報告には `completion-reports.md` で定義された具体的な `次のコマンド` または終端として明示的な完了宣言が含まれるため、汎用締め文は不要であり、フォーマット統一を損なう。

## 完了報告出力順序ルール

全agentdevコマンドの完了報告ステップにおいて、以下の順序を**必ず**守ること。

1. **TodoWrite更新（先）**: TodoWriteの「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 本スキルの完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite更新と完了報告テキストの間に、他の中間出力（ログ・進捗報告・確認メッセージ等）を挟まない

**適用対象**: req-define, req-save, case-open, case-run, case-run (Epic Orchestrator), case-close, case-update, intake-capture, intake-from-github, intake-review, intake-promote, req-backlog, learning-refine, learning-promote, integrity-check の全完了報告ステップ

**理由**: 完了報告テキストがユーザーに最後に表示されることで、最終結果の視認性が向上する

## req-define 完了時

```
✅ req-define 完了

完了コマンド: /agentdev/req-define
対象: 壁打ちドラフト（{日本語名称}：{規模}）
結果:
  - 要件定義の壁打ちが完了
  - 壁打ちドラフトを .sisyphus/drafts/ に保存
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド:
  - 機能追加の場合: /agentdev/req-save
  - バグ修正・軽微変更の場合: /agentdev/case-open
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
✅ req-define 完了

完了コマンド: /agentdev/req-define
対象: 壁打ちドラフト（機能追加 Epic：大規模機能追加）
結果:
  - 要件定義の壁打ちが完了（Epic規模）
  - 壁打ちドラフトを .sisyphus/drafts/ に保存
  - 規模判定: Epic（複数モジュール跨ぎ、分割推奨）
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: /agentdev/req-save
```

## req-save 完了時

```
✅ req-save 完了

完了コマンド: /agentdev/req-save
対象: REQ-{NNNN}（{CREATE/APPEND/UPDATE}）{ADR作成がある場合: / ADR-{NNNN}}
結果:
  - REQ-{NNNN} を docs/requirements/ に保存
  - {ADR作成がある場合: ADR-{NNNN} を docs/adr/ に作成}
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド: /agentdev/case-open
```

### SPLIT検出時

req-save完了時、SPLIT検出した場合は完了報告に以下を追加する。

```
⚠️ SPLIT候補: REQ-{NNNN} の要件が膨張・関心分離の基準に該当。別Issueでの review/follow-up を推奨。
Finding を作成しました: `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`
 次のコマンド: finding ファイルを入力として `/agentdev/req-define` を実行してください
 ```

### DOC-MAP更新時

req-save完了時、DOC-MAP更新の有無により以下のいずれかを完了報告に追加する。

DOC-MAP更新が不要だった場合:
```
DOC-MAP更新: なし（該当する DOC-MAP エントリがないため）
```

DOC-MAP更新が必要だった場合:
```
DOC-MAP更新: あり（{what was updated}）
```

## case-open 完了時

```
✅ case-open 完了

完了コマンド: /agentdev/case-open
対象: Issue #{N}（{日本語名称}）
結果:
  - Issue #{N} を作成
  - {機能追加の場合: REQ-{NNNN} をIssue本文に反映}
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: /agentdev/case-run {N}
```

### Epic作成時

Epic Issueを作成した場合は以下の報告を出力する。

```
✅ case-open 完了

完了コマンド: /agentdev/case-open
対象: Epic Issue #{epic_N}（機能追加 Epic）
結果:
  - Epic Issue #{epic_N} を作成
  - REQ-{NNNN} をEpic本文に反映
  - 子Issue: #{child1}, #{child2}, #{child3}（{count}件）
  - Wave構成: {wave_count} Wave（{wave_summary}）
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: /agentdev/case-run {epic_N}
```

## case-run 完了時

```
✅ case-run 完了

完了コマンド: /agentdev/case-run
対象: PR {PR_URL}
結果:
  - PR作成完了（head: {branch_name} → base: {base_branch}）
  - 現在の状態: レビュー待ち
  - Findings / Intake候補: {count}件（{該当なしの場合は「該当なし」}）
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: レビュー通過後: /agentdev/case-close
```

## case-run Epic Orchestrator 集約完了報告

Epic Orchestrator モード（`/agentdev/case-run {epic_N}`）で全 Wave 完了後に出力する集約報告フォーマット。各子 Issue の subagent が個別の case-run 完了報告を出力した後に、親エージェントが本フォーマットで集約結果を報告する。

### 全件成功時

```
✅ case-run 完了（Epic Orchestrator）

完了コマンド: /agentdev/case-run
対象: Epic #{epic_N}
結果:
  | Wave | Issue | 状態 | PR | 備考 |
  |------|-------|------|----|----|
  | 1 | #{child1_N} | ✅ 完了 | #{pr1_N} | — |
  | 2 | #{child2_N} | ✅ 完了 | #{pr2_N} | — |
  | 3 | #{child3_N} | ✅ 完了 | #{pr3_N} | — |

  成功: {success_count}件 / 失敗: 0件 / スキップ: 0件
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: レビュー通過後: /agentdev/case-close
```

### 部分失敗・スキップあり

```
⚠️ case-run 完了（Epic Orchestrator）

完了コマンド: /agentdev/case-run
対象: Epic #{epic_N}
結果:
  | Wave | Issue | 状態 | PR | 備考 |
  |------|-------|------|----|----|
  | 1 | #{child1_N} | ✅ 完了 | #{pr1_N} | — |
  | 2 | #{child2_N} | ❌ 失敗 | — | 実装フェーズでエラー |
  | 3 | #{child3_N} | ⏭ スキップ | — | Wave 2 失敗依存 |

  成功: {success_count}件 / 失敗: {fail_count}件 / スキップ: {skip_count}件
検証結果: ⚠️ 注意
git 永続化: 該当なし
次のコマンド:
  - 成功したIssueのレビュー通過後: /agentdev/case-close
  - 失敗したIssueの修正後: /agentdev/case-run {failed_issue_N}
```

### 全件失敗時

```
❌ case-run 完了（Epic Orchestrator）

完了コマンド: /agentdev/case-run
対象: Epic #{epic_N}
結果:
  | Wave | Issue | 状態 | PR | 備考 |
  |------|-------|------|----|----|
  | 1 | #{child1_N} | ❌ 失敗 | — | {error_summary_1} |
  | 2 | #{child2_N} | ❌ 失敗 | — | {error_summary_2} |

  成功: 0件 / 失敗: {fail_count}件 / スキップ: 0件
検証結果: ❌ NG
git 永続化: 該当なし
次のコマンド: 失敗原因を確認後、再実行: /agentdev/case-run {epic_N}
```

### フォーマット共通ルール

- 状態値: `✅ 完了` / `❌ 失敗` / `⏭ スキップ` の3種類
- PR列: 成功時はPR番号リンク、失敗・スキップ時は `—`
- 備考列: 成功時は `—`、失敗時はエラー概要、スキップ時は依存先Wave番号
- Wave列: Wave番号（Epic本文の実行順序テーブルに対応）
- 集約行: 成功・失敗・スキップ件数のサマリー

## case-update 完了時

更新種別に応じた報告フォーマットを使用する。

**`--body` の場合**:
```
✅ case-update 完了

完了コマンド: /agentdev/case-update
対象: Issue #{N}
結果:
  - Issue本文を更新（--body）
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: /agentdev/case-run {N}
```

**`--comment` の場合**:
```
✅ case-update 完了

完了コマンド: /agentdev/case-update
対象: Issue #{N}
結果:
  - Issue #{N} にコメントを追加（--comment）
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: /agentdev/case-run {N}
```

**`--req` の場合**:
```
✅ case-update 完了

完了コマンド: /agentdev/case-update
対象: Issue #{N} / REQ-{NNNN}（{APPEND/UPDATE}）
結果:
  - REQ-{NNNN} を更新（--req）
  - 更新セクション: {更新したセクション名のリスト}
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: /agentdev/case-run {N}
```

**`--review-ng` の場合**:
```
⚠️ case-update 完了

完了コマンド: /agentdev/case-update
対象: Issue #{N}
結果:
  - レビューNG報告を投稿（--review-ng）
  - 乖離タイプ: {spec-bug / impl-bug / scope-creep}
  - 影響REQ番号: {REQ番号のリスト}
  - 推奨アクション: {修正 / 承認 / 差し戻し}
検証結果: ⚠️ 注意
git 永続化: 該当なし
次のコマンド:
  - 修正の場合: /agentdev/case-run {N}
  - 差し戻しの場合: /agentdev/req-define
```

## case-close 完了時

```
✅ case-close 完了

完了コマンド: /agentdev/case-close
対象: Issue #{N} / PR #{PR_N}
結果:
  - PR #{PR_N} をマージ
  - Issue #{N} をクローズ
  - ブランチ・worktree をクリーンアップ
  - {機能追加の場合: ドキュメント（REQ・specs）を更新済み}
  - {Epic自動クローズの場合: Epic #{epic_N} を自動クローズ（全子Issue完了）}
  - {Epicスキップの場合: Epic #{epic_N}: N件未完了のためスキップ}
  - Findings回収: {回収済みN件 / 保存済みN件}（{該当なしの場合は「該当なし」}）
検証結果: ✅ OK（{N}件の書き込み操作を検証済み）
git 永続化: 変更なし（commit/push スキップ）
次のコマンド: なし
```

## intake-capture 完了時

```
✅ intake-capture 完了

完了コマンド: /agentdev/intake-capture
対象: .agentdev/intake/inbox/{YYYY-MM-DD}-{topic-slug}.md
結果:
  - intake item を保存（タイトル: {タイトル}）
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド: /agentdev/intake-review
```

## intake-from-github 完了時

```
✅ intake-from-github 完了

完了コマンド: /agentdev/intake-from-github
対象: .agentdev/intake/inbox/（{file_count}件）
結果:
  - 対象期間: {since} 〜 {until}
  - 対象 Issue/PR 数: {N}
  - 抽出候補数: {M}
  - 保存先: .agentdev/intake/inbox/（{file_count}件）
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド: /agentdev/intake-review
```

## intake-review 完了時

```
✅ intake-review 完了

完了コマンド: /agentdev/intake-review
対象: .agentdev/intake/inbox/（{N}件）
結果:
  - レビュー対象: {N}件
  - 採用: {A}件（req-define: {R}件, intake-promote: {P}件）
  - 保留: {H}件
  - 却下: {D}件
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド:
  - 採用（要件定義が必要）: /agentdev/req-define
  - 採用（Issue化可能）: /agentdev/intake-promote
```

## intake-promote 完了時

```
✅ intake-promote 完了

完了コマンド: /agentdev/intake-promote
対象: .agentdev/intake/promoted/（{N}件）
結果:
  - 整形対象: {N}件
  - promoted artifact: {N}件
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド: /agentdev/req-backlog
```

## req-backlog 完了時

```
✅ req-backlog 完了

完了コマンド: /agentdev/req-backlog
対象: promoted artifact {promoted_count}件（intake: {intake_count}, learning: {learning_count}）
結果:
  - 生成 RU: {success_count}件
  - 削除済み artifact: {deleted_count}件
  - 残存 artifact: {remaining_count}件
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: /agentdev/req-define
```

### 部分成功あり

```
⚠️ req-backlog 完了

完了コマンド: /agentdev/req-backlog
対象: promoted artifact {promoted_count}件
結果:
  - 生成 RU: {success_count}件
  - 削除済み artifact: {deleted_count}件
  - 残存 artifact（矛盾・失敗）: {remaining_count}件
  - 残存詳細: {artifact_name}: {reason}
検証結果: ⚠️ 注意
git 永続化: 該当なし
次のコマンド: /agentdev/req-define
```

### promoted artifact 0件時

```
✅ req-backlog 完了

完了コマンド: /agentdev/req-backlog
対象: promoted artifact 0件
結果:
  - 処理対象なし（正常終了）
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド: なし
```

## learning-refine 完了時

```
✅ learning-refine 完了

完了コマンド: /agentdev/learning-refine
対象: .agentdev/learning/inbox.md / evaluation-report.md
結果:
  - 問題クラス数: {N}（未分類含む）
  - 処理したエントリ数: {N}（inbox → archive）
  - prune したエントリ数: {N}
  - evaluation-report.md: {path}
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド:
  - 昇華推奨あり: /agentdev/learning-promote
  - 昇華推奨なし: なし
```

## learning-promote 完了時

```
✅ learning-promote 完了

完了コマンド: /agentdev/learning-promote
対象: .agentdev/learning/promoted/
結果:
  - 生成 artifact: {N}件（{file_list}）
  - prune 結果: 除去 {N}件 / 残存 {N}件
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド: /agentdev/req-backlog
```

## integrity-check 完了時

```
✅ integrity-check 完了

完了コマンド: /agentdev/integrity-check
対象: 全 command 定義 / completion-reports.md
結果:
  - 検証対象: {N} command 定義
  - 違反検出: {N}件
  - {違反なしの場合: 全 command 定義が completion-reports.md を参照}
  - {違反ありの場合: 違反内容のサマリ}
検証結果: {✅ OK / ⚠️ 注意（違反あり）}
git 永続化: 該当なし
  次のコマンド: なし
```

## req-restructure-review 完了時

```
✅ req-restructure-review 完了

完了コマンド: /agentdev/req-restructure-review
対象: REQ体系（active {active_count}件 / retired {retired_count}件）
結果:
  - 診断観点: {観点リスト}
  - 問題候補: {problem_count}件
  - 推奨アクション: {action_summary}
  - req-define入力案: {draft_count}件（{0件の場合は「該当なし」}）
検証結果: ✅ OK
git 永続化: 該当なし
次のコマンド:
  - 再構成が必要な場合: /agentdev/req-define
  - 問題なしの場合: なし
```

### git 永続化セクションのルール

- learning-refine, learning-promote, case-close, intake-capture, intake-from-github, intake-review, intake-promote の完了報告に git 永続化セクションを含める
- 変更なしの場合は「変更なし（commit/push スキップ）」と表示する
- push 失敗時は「push: 失敗」と表示し、完了報告全体を ⚠️ に変更する
