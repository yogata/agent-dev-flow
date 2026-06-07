---
description: inbox.mdから正規化・分類・8軸評価・HITL確定を経てRequirement Source stubを生成する
agent: sisyphus
---

# 学びの正規化・評価・昇華判定と Requirement Source stub 生成

`.agentdev/learning/inbox.md` の学びエントリを直接読み込み、内部フェーズとして正規化・問題クラス分類・8軸評価を実行する（REQ-0105-052, 053）。評価結果を evaluation-report.md として生成・更新した後（REQ-0105-054）、廃棄判定・既存対策確認を経てユーザーの HITL 承認により昇格・保留・却下を確定する（REQ-0105-055）。確定後、`.agentdev/learning/promoted/` に Requirement Source 形式の stub を生成する。

**重要**: `.opencode/` への直接配置・直接反映は行わない。生成した stub は `/agentdev/backlog-review` が読み込み、RU 生成後に `/agentdev/req-define` に合流する。反映ルート: promoted → `/agentdev/backlog-review`（分析・承認・RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`。

本コマンドは旧 `learning-refine` の全機能を吸収しており、`learning-refine` を事前実行する必要はない（REQ-0105-051, 056）。

## Input

- `.agentdev/learning/inbox.md`（必須）— 未処理の学びエントリ
- `.agentdev/learning/archive/active.md`（任意）— 過去エントリ参照用

## Output

- `.agentdev/learning/evaluation-report.md` — 8軸評価レポート（評価根拠中間成果物）（REQ-0105-054）
- `.agentdev/learning/promoted/{category}-{name}.md` — Requirement Source 形式の stub
- `.agentdev/learning/archive/active.md` — inbox からの移動分を追記
- `.agentdev/learning/inbox.md` — ヘッダーのみにクリア

## Steps

### Phase 1: Inbox Scan

1. **inbox.md の内容確認**:
   - `.agentdev/learning/inbox.md` を読み込む
   - ファイルが存在しない → エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」
   - `---` 区切りのエントリをカウント（ヘッダー除く）
   - 0件 → 「分析対象の学びがありません」と報告して終了

2. **archive/active.md の読込**:
   - `.agentdev/learning/archive/active.md` が存在すれば読み込む
   - 存在しない場合は空として扱う

### Phase 2: Internal Normalize（旧 learning-refine から吸収、REQ-0105-052）

3. **全エントリの読込と旧フォーマット正規化**: 判定基準・スコアリングルールは `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 2: Internal Normalize」を参照

### Phase 3: Internal Classify + 8-axis Evaluation（旧 learning-refine から吸収、REQ-0105-052, 053）

4. **問題クラス分類**: 判定基準は `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 3: 問題クラス分類」を参照

5. **8軸評価スコアリング**: スコアリングルールは `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 3: 8軸評価スコアリング」を参照

6. **evaluation-report.md の生成・更新**（REQ-0105-054）: スキーマは `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 3: evaluation-report.md の生成・更新」を参照

### Phase 4: Disposal Judgment + Existing Measure Check

7. **廃棄判定**（11カテゴリ + duplicate）: 判定基準は `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 4: 廃棄判定」を参照

8. **既存対策確認**: 確認対象とギャップ分類は `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 4: 既存対策確認」を参照

### Phase 5: HITL Confirmation（REQ-0105-055）

9. **ユーザーへの判定結果提示**: 提示形式は `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 5: ユーザーへの判定結果提示」を参照

10. **ユーザー承認**: 承認フローは `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の「Phase 5: ユーザー承認」を参照

### Phase 6: Execute + Git

11. **実行前同期（git pull）**:
    - `git pull --rebase` を実行する
    - **失敗時**: 以下の構造化エラーメッセージを表示して停止する（自動解消しない）:
      ```
      ## Git 同期エラー

      **エラー種別**: pull --rebase 失敗
      **停止理由**: リモートに未取り込みの変更があり、rebase マージできない
      **対象ブランチ**: {current_branch}
      **ユーザーアクション**: 手動で rebase のコンフリクトを解決してください
      **raw git output**:
      {git_error_output}
      ```

12. **Requirement Source stub 生成**（staging領域のみ）:
    - 出力先: `.agentdev/learning/promoted/`（REQ-0105）
    - ファイル名: `{disposal-category}-{name}.md`
    - **`.opencode/` への直接書込は禁止**
    - **`case-run` への直接受け渡しは禁止**（`backlog-review` を経由して RU 化すること）
    - stub フォーマットは `agentdev-learning-pipeline` skill の「Requirement Source Staging Stub Schema」に従う
    - カテゴリ別の反映先パス例は `agentdev-learning-pipeline` skill を参照

13. **アーカイブ移動**（原子的操作 — 最重要）:
    - **Step A**: inbox.md の全エントリを archive/active.md に追記。各エントリに `**移動日**: YYYY-MM-DD` フィールドを追加
    - **Step B**: archive/active.md の書込を検証（追記したエントリ数をカウントして照合）
    - **Step C**: Step B が成功した場合のみ、inbox.md をヘッダーのみにクリア:
      ```markdown
      # 学び・教訓

      このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
      まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

      ---
      ```
    - Step B が失敗 → inbox.md は変更しない。エラー内容を報告

14. **昇華時 prune**（archive/active.md からの除去）:
    - **prune 対象**: staged（stub 生成済み）/ rejected / duplicate のエントリのみ
    - **prune 非対象**: deferred / 未処理のエントリは archive/active.md に残す
    - **証拠保存**: staged エントリを除去する際、stub の「元learning item / 根拠」セクションに保存してから除去
    - 詳細は `agentdev-learning-pipeline` skill の「Prune 方針 → promote 時 prune」を参照
    - **実行手順**:
       1. prune 対象エントリの特定（staged/rejected/duplicate のクラスタに属するエントリ）
       2. ユーザーに prune 計画を提示
       3. ユーザーが prune を承認した場合のみ実行
       4. archive/active.md から該当エントリを除去（deferred・未処理は保持）

15. **.agentdev 変更の commit と push**:
    - `git diff --name-only` で `.agentdev/` 配下の変更ファイルを確認する
    - **変更なし時**: commit/push せず、Step 16 の完了報告で「変更なし」と報告
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

16. **完了報告**（REQ-0105-056）:
    完了報告 → 完了報告templateに従って出力。template: `.opencode/commands/agentdev/templates/learning-promote/standard.md`。以下を含める:
    - 8軸評価サマリ（加重合計スコア分布）
    - 判定結果（promote/defer/reject/duplicate の件数）
    - 後続ルート（`/agentdev/backlog-review`）
    - git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）

## Guardrails

- G01: `.opencode/` 直接反映禁止: stub は `.agentdev/learning/promoted/` のみに生成
- G02: `evaluation-report.md` は本コマンドが生成・管理: 外部コマンドの事前生成に依存しない（REQ-0105-051, 056）
- G03: `case-run` への直接受け渡し禁止: `/agentdev/backlog-review` 経由のみ
- G04: 主入力は `inbox.md`: raw learning item の再分類は禁止（REQ-0103）
- G05: 既存対策を優先: 「新規X化」より「既存Xへ反映」を優先
- G06: ユーザー承認必須: 判定・prune ともに承認なしに実行しない（REQ-0105-055）
- G07: 管理用ファイル（`elevation-ledger.md` 等）は生成しない
- G08: `learning-refine` への依存禁止: 本コマンドは旧 `learning-refine` の機能を内包し、事前実行を前提としない（REQ-0105-051, 056）

## ユーザー確認ポイント

1. **Step 9-10**: 廃棄判定結果・8軸評価スコアの確認・修正・承認
2. **Step 14**: prune 計画の承認

## Error Handling

| エラー | 対処 |
|--------|------|
| inbox.md が存在しない | エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」 |
| 学びが0件 | 「分析対象の学びがありません」と報告して終了 |
| クラスタが0件 | 「昇華対象のクラスタがありません」と報告して終了 |
| ユーザーが承認しない | 「昇華をキャンセルしました」と報告して終了 |
| 旧フォーマットパース失敗 | 当該エントリをスキップし、警告を出力。処理は継続 |
| staging領域の書込失敗 | エラー内容を報告 |
| archive/active.md の prune 失敗 | stub 生成は保持。prune エラー内容を報告し、手動での prune を案内 |
| archive/active.md 書込失敗 | inbox.md は変更しない。エラー内容を報告 |
| git pull --rebase 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Artifact Lifecycle

各成果物（inbox.md, archive/active.md, evaluation-report.md, promoted/）の役割・性格・lifecycle 詳細は `agentdev-learning-pipeline` skill の「Artifact Lifecycle」を参照。

**learning-promote の責務**: normalize → classify → 8-axis eval → evaluation-report → disposal judgment → HITL → stub 生成 → archive move → prune（REQ-0105-052）。stub は `.opencode/` に直接反映せず、`/agentdev/backlog-review` が読み込み RU 化後に `/agentdev/req-define` に合流する。
