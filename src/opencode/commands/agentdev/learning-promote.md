---
description: evaluation-report.mdとarchive/active.mdから昇華判定を行い、Requirement Source stubを生成する
agent: sisyphus
---

# 学びの昇華判定と Requirement Source stub 生成

`.agentdev/learning/evaluation-report.md` の問題クラスを主入力とし、`.agentdev/learning/archive/active.md` の過去エントリを参照して廃棄判定を行う。ユーザー承認後に `.agentdev/learning/promoted/` に Requirement Source 形式の stub を生成し、処理済みエントリを archive/active.md から pruning する。

**重要**: `.opencode/` への直接配置・直接反映は行わない。生成した stub は `/agentdev/backlog-review` が読み込み、RU 生成後に `/agentdev/req-define` に合流する。反映ルート: promoted → `/agentdev/backlog-review`（分析・承認）→ `/agentdev/backlog-save`（RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`。

## Input

- `.agentdev/learning/evaluation-report.md`（必須）— learning-refine が生成した評価レポート
- `.agentdev/learning/archive/active.md`（任意）— 過去エントリ参照用

## Output

- `.agentdev/learning/promoted/{category}-{name}.md` — Requirement Source 形式の stub

## Steps

1. **evaluation-report.mdの存在確認**:
   - `.agentdev/learning/evaluation-report.md` を確認
   - 存在しない → エラー終了。「先に `/agentdev/learning-refine` を実行して分析レポートを生成してください」

2. **データ読込**:
   - evaluation-report.md を読込（クラスタ一覧・テーマ概要・重み・エントリ数を把握）
   - archive/active.md を読込（該当クラスタの過去エントリの日付・タイトル・内容を確認）

3. **廃棄判定**（11カテゴリ + duplicate）:
   - **主入力**: evaluation-report.md の問題クラスラスタ（raw learning item の再分類は禁止）
   - 廃棄カテゴリ一覧、反映先マッピングは `agentdev-learning-pipeline` skill の「処分区分」を参照
   - 各クラスタに対し最適な廃棄先を判定

4. **既存対策確認**:
   - 各クラスタの内容に対し、既存の command/skill/template/docs に類似対策が存在するか確認
   - 確認対象とギャップ分類は `agentdev-learning-pipeline` skill の「処分区分 → 既存対策照合」を参照
   - 「新規X化」より「既存Xへ反映」を優先

 5. **ユーザーへの判定結果提示**: 判定結果を表形式で提示（クラスタ / テーマ / 廃棄判定 / 既存対策 / 理由）。統計サマリ（昇華対象・保留・却下・重複の件数）を併記。

6. **ユーザー承認**:
   - ユーザーが各クラスタの廃棄判定を確認・修正
   - 判定の変更指示があれば Step 3〜4 を再実行
   - 承認したクラスタのみ処理
   - 承認しない → 「昇華をキャンセルしました」と報告して終了

   **6b. 実行前同期（git pull）**:
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

7. **Requirement Source stub 生成**（staging領域のみ）:
   - 出力先: `.agentdev/learning/promoted/`（REQ-0105）
   - ファイル名: `{disposal-category}-{name}.md`
   - **`.opencode/` への直接書込は禁止**
   - **`case-run` への直接受け渡しは禁止**（`backlog-review` → `backlog-save` を経由して RU 化すること）
   - stub フォーマットは `agentdev-learning-pipeline` skill の「Requirement Source Staging Stub Schema」に従う
   - カテゴリ別の反映先パス例は `agentdev-learning-pipeline` skill を参照

8. **昇華時 prune**（archive/active.md からの除去）:
   - **prune 対象**: staged（stub 生成済み）/ rejected / duplicate のエントリのみ
   - **prune 非対象**: deferred / 未処理のエントリは archive/active.md に残す
   - **証拠保存**: staged エントリを除去する際、stub の「元learning item / 根拠」セクションに保存してから除去
   - 詳細は `agentdev-learning-pipeline` skill の「Prune 方針 → promote 時 prune」を参照
   - **実行手順**:
      1. prune 対象エントリの特定（staged/rejected/duplicate のクラスタに属するエントリ）
      2. ユーザーに prune 計画を提示
      3. ユーザーが prune を承認した場合のみ実行
      4. archive/active.md から該当エントリを除去（deferred・未処理は保持）

   **8b. .agentdev 変更の commit と push**:
   - `git diff --name-only` で `.agentdev/` 配下の変更ファイルを確認する
   - **変更なし時**: commit/push せず、Step 9 の完了報告で「変更なし」と報告
   - **変更あり時**:
      1. `git add` は `.agentdev/` 配下の変更ファイルのみを対象とする（SHALL）。他のパスを巻き込まない
      2. commit message: `chore(agentdev): promote learning findings`（Conventional Commits 形式）（SHALL）
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

 9. **完了報告** → 完了報告templateに従って出力。template: .opencode/commands/agentdev/templates/learning-promote/standard.md。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Guardrails

- G01: `.opencode/` 直接反映禁止: stub は `.agentdev/learning/promoted/` のみに生成
- G02: `evaluation-report.md` は読込専用: 変更・削除は禁止
- G03: `case-run` への直接受け渡し禁止: `/agentdev/backlog-review` 経由のみ
- G04: 主入力は `evaluation-report.md`: raw learning item の再分類は禁止（REQ-0103）
- G05: 既存対策を優先: 「新規X化」より「既存Xへ反映」を優先
- G06: ユーザー承認必須: 判定・prune ともに承認なしに実行しない
- G07: 管理用ファイル（`elevation-ledger.md` 等）は生成しない

## ユーザー確認ポイント

1. **Step 5-6**: 廃棄判定結果の確認・修正・承認
2. **Step 8**: prune 計画の承認

## Error Handling

| エラー | 対処 |
|--------|------|
| evaluation-report.mdが存在しない | エラー終了。「先に `/agentdev/learning-refine` を実行して分析レポートを生成してください」 |
| クラスタが0件 | 「昇華対象のクラスタがありません」と報告して終了 |
| ユーザーが承認しない | 「昇華をキャンセルしました」と報告して終了 |
| staging領域の書込失敗 | エラー内容を報告 |
| archive/active.mdの prune 失敗 | stub 生成は保持。prune エラー内容を報告し、手動での prune を案内 |
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Artifact Lifecycle

各成果物（archive/active.md, evaluation-report.md, promoted/）の役割・性格・lifecycle 詳細は `agentdev-learning-pipeline` skill の「Artifact Lifecycle」を参照。

**learning-promote の責務**: 廃棄判定 → stub 生成 → prune（REQ-0105）。stub は `.opencode/` に直接反映せず、`/agentdev/backlog-review` が読み込み RU 化後に `/agentdev/req-define` に合流する。
