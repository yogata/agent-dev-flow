---
description: inbox.mdとarchive.mdをセマンティック分析し、evaluation-report.mdを出力後inbox→archive移動を行う
agent: sisyphus
load_skills:
  - agentdev-learning-capture
  - agentdev-learning-pipeline
  - agentdev-workflow-reporting
  - agentdev-no-ai-slop-writing
---

# 学びの問題クラス分類・8軸評価とアーカイブ

`.agentdev/learning/inbox.md` の学びエントリと `.agentdev/learning/archive.md` の過去エントリを正規化・問題クラス分類し、8軸評価スコアを算出して `.agentdev/learning/evaluation-report.md` に出力。refine 時 prune（任意）を実施後、ユーザー承認を経て inbox → archive へ原子的に移動する。

evaluation-report.md は評価済み中間レポートであり、learning-promote が昇格・保留・破棄を判断するための境界成果物である。毎回上書きし、長期履歴にはしない。

## Input

- `.agentdev/learning/inbox.md`（必須）— 未処理の学びエントリ
- `.agentdev/learning/archive.md`（任意）— 過去エントリ

## Output

- `.agentdev/learning/evaluation-report.md`（毎回上書き）
- `.agentdev/learning/archive.md`（inbox からの移動分を追記）
- `.agentdev/learning/inbox.md`（ヘッダーのみにクリア）

## Steps

### 1. inbox.md の内容確認

- `.agentdev/learning/inbox.md` を読み込む
- ファイルが存在しない → エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」
- `---` 区切りのエントリをカウント（ヘッダー除く）
- 0件 → 「分析対象の学びがありません」と報告して終了

### 2. archive.md の読込

- `.agentdev/learning/archive.md` が存在すれば読み込む
- 存在しない場合は空として扱う

### 3. 全エントリの読込と旧フォーマット正規化

- inbox.md + archive.md から全エントリをパース
- **旧フォーマット正規化**を必ず実施。スキーマとマッピングは `agentdev-learning-pipeline` skill の「Inbox Entry Schema」を参照
- 正規化は解析時のみ適用し、元ファイル（inbox.md / archive.md）の内容は書き換えない

### 4. 問題クラス分類

- 分類基準は `agentdev-learning-pipeline` skill の「問題クラス分類基準」を参照
- テーマクラスタリングではなく、**問題クラス**（根本原因 + 再発条件 + 予防策が同じ単位）で分類する

### 5. 8軸評価スコアリング

- 評価ディメンションとスコア基準は `agentdev-learning-pipeline` skill の「8軸評価ディメンション」を参照
- 各問題クラスに対して8軸で評価（各1-5スケール）し、加重合計スコア（満点40）を算出

### 6. evaluation-report.md の生成

- パス: `.agentdev/learning/evaluation-report.md`（毎回上書き、追記しない）
- スキーマは `agentdev-learning-pipeline` skill の「Evaluation-Report Schema」に従う

### 7. refine 時 prune（MAY、任意）

archive.md 内の古い単発レアケースを削除候補として特定する。**必須ではない。** inboxエントリ数が15件未満の場合やユーザーが明示的にスキップを指定した場合は実施しない。

- prune 対象の特定基準、削除禁止エントリ、実施フローは `agentdev-learning-pipeline` skill の「Prune 方針 → refine 時 prune」を参照

### 8. ユーザーに分析結果提示

- evaluation-report.md の内容を表示（問題クラス一覧と8軸評価スコア、prune 結果、全体傾向）
- アーカイブ移動の承認を求める
- ユーザーが承認しない → 「アーカイブをキャンセルしました。evaluation-report.mdは保存済みです」と報告して終了

### 8b. 実行前同期（git pull）

- `git pull --ff-only` を実行する
- **失敗時**: 以下の構造化エラーメッセージを表示して停止する（自動解消しない）:
  ```
  ## Git 同期エラー
  
  **エラー種別**: pull --ff-only 失敗
  **停止理由**: リモートに未取り込みの変更があり、fast-forward マージできない
  **対象ブランチ**: {current_branch}
  **ユーザーアクション**: 手動で `git pull --rebase` または `git stash && git pull --ff-only && git stash pop` を実行してください
  **raw git output**:
  {git_error_output}
  ```

### 9. アーカイブ移動（原子的操作 — 最重要）

- **Step A**: inbox.md の全エントリを archive.md に追記。各エントリに `**移動日**: YYYY-MM-DD` フィールドを追加
- **Step B**: archive.md の書込を検証（追記したエントリ数をカウントして照合）
- **Step C**: Step B が成功した場合のみ、inbox.md をヘッダーのみにクリア:
  ```markdown
  # 学び・教訓

  このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
  まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

  ---
  ```
- Step B が失敗 → inbox.md は変更しない。エラー内容を報告

### 9b. .agentdev 変更の commit と push

- `git diff --name-only` で `.agentdev/` 配下の変更ファイルを確認する
- **変更なし時**: commit/push せず、Step 10 の完了報告で「変更なし」と報告
- **変更あり時**:
  1. `git add` は `.agentdev/` 配下の変更ファイルのみを対象とする（SHALL）。他のパスを巻き込まない
  2. commit message: `chore(agentdev): refine learning entries`（Conventional Commits 形式）（SHALL）
  3. `git push` を実行する
  4. **push 失敗時**: 以下の構造化エラーメッセージを表示し、完了扱いにしない（SHALL）:
     ```
     ## Git Push エラー
     
     **エラー種別**: push 失敗
     **停止理由**: リモートへのプッシュに失敗
     **対象ブランチ**: {current_branch}
     **変更ファイル**: {changed_files}
     **ユーザーアクション**: 手動で `git push` を実行してください
     **raw git output**:
     {git_error_output}
     ```

### 10. 完了報告

完了報告 → `agentdev-workflow-reporting` の完了報告フォーマット（completion-reports.md → learning-refine 完了時）に従って出力。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## ユーザー確認ポイント

1. **Step 7**: prune 候補の承認（任意実施時）
2. **Step 8**: アーカイブ移動の承認

## Error Handling

| エラー | 対処 |
|--------|------|
| inbox.md が存在しない | エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」 |
| 学びが0件 | 「分析対象の学びがありません」と報告して終了 |
| ユーザーがアーカイブ承認しない | 「アーカイブをキャンセルしました。evaluation-report.mdは保存済みです」と報告 |
| archive.md 書込失敗 | inbox.md は変更しない。エラー内容を報告 |
| 旧フォーマットパース失敗 | 当該エントリをスキップし、警告を出力。処理は継続 |
| prune候補抽出エラー | prune をスキップし、分類・評価・アーカイブ移動は継続 |
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Artifact Lifecycle 責務

learning-refine が扱う3つの成果物の役割・性格・ライフサイクル振る舞いを以下に定義する。各 artifact の性質を誤解しないことが、パイプライン全体の正しい運用において必須である（REQ-0027-001, REQ-0027-003, REQ-0027-008, REQ-0027-009, REQ-0027-014, REQ-0027-016）。

| Artifact | 役割 | 性格 | Lifecycle 振る舞い |
|----------|------|------|--------------------|
| **inbox.md** | 未整理 learning entry の active queue | 一時的。永続ストレージではない | capture で蓄積し、refine 成功後にヘッダーのみにクリアされる。エントリは archive へ移動した後に残らない |
| **archive.md** | refine 済み learning entry の保持プール | Living pool（終端保管ではない）。`archive` は終端保管を意味しない | refine で inbox から移動した entry を保持し、promote の入力として参照される。refine 時 prune（任意）および promote 時 prune により動的に変化する |
| **evaluation-report.md** | refine/promote 間の境界 artifact | 中間生成物。長期履歴として扱わない | 毎回上書きされる。promote はこの report を主入力とする。過去レポートは保持しない |

**learning-refine の責務**: normalize → classify → evaluate → move（正規化→分類→評価→移動）。昇格判定自体は `/agentdev/learning-promote` の役割である。

## 注意事項

- **evaluation-report.md の取り扱い** → **Artifact Lifecycle 責務** 参照（毎回上書き・境界成果物）
- **archive.md の取り扱い** → **Artifact Lifecycle 責務** 参照（living pool、prune で動的に変化）
- **昇格判定は別コマンド**: evaluation-report.md に基づく昇格推奨は `/agentdev/learning-promote` の役割
