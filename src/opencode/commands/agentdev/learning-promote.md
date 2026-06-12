---
description: inbox.mdから正規化・分類・8軸評価・HITL確定を経てpromoted artifactを生成する
agent: sisyphus
---

# 学びの正規化・評価・昇華判定と promoted artifact 生成

`.agentdev/learning/inbox.md` の学びエントリを読み込み、正規化・問題クラス分類・8軸評価・廃棄判定・既存対策確認・HITL承認を経て promoted artifact を生成する。

**重要**: `.opencode/` への直接配置・直接反映は行わない。反映ルート: promoted → `/agentdev/backlog-review`（RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`。旧 `learning-refine` の全機能を吸収済み（事前実行不要）。

## Input

- `.agentdev/learning/inbox.md`（必須）— 未処理の学びエントリ
- `.agentdev/learning/archive/active.md`（任意）— 過去エントリ参照用

## Output

- `.agentdev/learning/evaluation-report.md` — 8軸評価レポート（評価根拠中間成果物）
- `.agentdev/learning/promoted/{category}-{name}.md` — promoted artifact
- `.agentdev/learning/archive/active.md` — inbox からの移動分を追記
- `.agentdev/learning/inbox.md` — ヘッダーのみにクリア

## Steps

### Phase 1: Inbox Scan

1. **inbox.md 読込**: ファイルなし → エラー終了（「先に `agentdev-learning-capture` skill で学びを追加してください」）。`---` 区切りエントリをカウント、0件 → 「分析対象の学びがありません」と終了
2. **archive/active.md 読込**: 存在すれば読込、不存在は空として扱う

### Phase 2-5: Normalize → Classify → Evaluate → Dispose → HITL

**判定基準参照**: Step 3〜10 の判定基準・スコアリングルール・提示形式・承認フローは、全て `agentdev-learning-pipeline` skill の `references/promote-judgment-logic.md` の該当 Phase を参照。

3. **全エントリの読込と旧フォーマット正規化**（→ promote-judgment-logic.md Phase 2）
4. **問題クラス分類**（→ Phase 3: 問題クラス分類）
5. **8軸評価スコアリング**（→ Phase 3: 8軸評価スコアリング）
6. **evaluation-report.md 生成・更新**（→ Phase 3: evaluation-report.md の生成・更新）
7. **廃棄判定**（11カテゴリ + duplicate）（→ Phase 4: 廃棄判定）
8. **既存対策確認**（→ Phase 4: 既存対策確認）
9. **ユーザーへの判定結果提示**（→ Phase 5: ユーザーへの判定結果提示）
10. **ユーザー承認**（→ Phase 5: ユーザー承認）

### Phase 6: Execute + Git

11. **実行前同期（git pull）**:
    - `git pull --rebase` を実行
    - **失敗時**: 構造化エラーを表示して停止（自動解消しない）:
      ```
      ## Git 同期エラー
      **エラー種別**: pull --rebase 失敗
      **停止理由**: リモートに未取り込みの変更があり、rebase マージできない
      **対象ブランチ**: {current_branch}
      **ユーザーアクション**: 手動で rebase のコンフリクトを解決してください
      **raw git output**: {git_error_output}
      ```

12. **promoted artifact 生成**（staging領域のみ）:
     - 出力先: `.agentdev/learning/promoted/{disposal-category}-{name}.md`
     - **`.opencode/` 直接書込禁止** / **`case-run` への直接受け渡し禁止**（`backlog-review` 経由で RU 化）
     - フォーマット: `agentdev-learning-pipeline` skill の「Requirement Source Staging Stub Schema」に従う

13. **アーカイブ移動**（原子的操作）:
    - **Step 13-1**: inbox.md 全エントリを archive/active.md に追記（`**移動日**: YYYY-MM-DD` フィールド追加）
    - **Step 13-2**: archive/active.md 書込検証（追記エントリ数をカウント照合）
    - **Step 13-3**: Step 13-2 成功時のみ inbox.md をヘッダーのみにクリア:
      ```markdown
      # 学び・教訓

      このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
      まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

      ---
      ```
    - Step 13-2 失敗 → inbox.md 変更せず、エラー内容を報告

14. **昇華時 prune**（archive/active.md からの除去）:
    - **prune 対象**: staged（promoted artifact 生成済み）/ rejected / duplicate のエントリのみ
    - **prune 非対象**: deferred / 未処理のエントリは残す
    - **証拠保存**: staged エントリ除去時に promoted artifact の「元learning item / 根拠」セクションに保存
    - 詳細は `agentdev-learning-pipeline` skill の「Prune 方針 → promote 時 prune」を参照
    - **実行手順**: 1) prune 対象特定 → 2) ユーザーに prune 計画提示 → 3) 承認時のみ実行 → 4) 該当エントリ除去

 15. **.agentdev 変更の commit と push**:
     - `git diff --name-only` で `.agentdev/` 配下の変更を確認
     - **変更なし時**: commit/push せず完了報告で「変更なし」と報告
     - **変更あり時**:
        1. `git add` は `.agentdev/` のみ対象
        2. commit message: `chore(agentdev): promote learning findings`
        3. `git push` 実行
        4. **push 失敗時**: 構造化エラーを表示し完了扱いにしない:
          ```
          ## Git Push エラー
          **エラー種別**: push 失敗
          **停止理由**: リモートへのプッシュに失敗
          **対象ブランチ**: {current_branch}
          **変更ファイル**: {changed_files}
          **ユーザーアクション**: 手動で `git push` を実行してください
          **raw git output**: {git_error_output}
          ```

16. **完了報告** → template: `.opencode/commands/agentdev/templates/learning-promote/standard.md`。以下を含める:
    - 8軸評価サマリ（加重合計スコア分布）
    - 判定結果（promote/defer/reject/duplicate 件数）
    - 後続ルート（`/agentdev/backlog-review`）
    - git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）

## Guardrails

- G01: `.opencode/` 直接反映禁止: promoted artifact は `.agentdev/learning/promoted/` のみに生成
- G02: `evaluation-report.md` は本コマンドが生成・管理: 外部コマンドの事前生成に依存しない
- G03: `case-run` への直接受け渡し禁止: `/agentdev/backlog-review` 経由のみ
- G04: 主入力は `inbox.md`: raw learning item の再分類は禁止
- G05: 既存対策を優先: 「新規X化」より「既存Xへ反映」を優先
- G06: ユーザー承認必須: 判定・prune ともに承認なしに実行しない
- G07: 管理用ファイル（`elevation-ledger.md` 等）は生成しない
- G08: `learning-refine` への依存禁止: 本コマンドは旧機能を内包し事前実行を前提としない

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
| 旧フォーマットパース失敗 | 当該エントリをスキップし警告出力、処理継続 |
| staging領域書込失敗 | エラー内容を報告 |
| archive/active.md prune 失敗 | promoted artifact は保持。prune エラー報告し手動 prune 案内 |
| archive/active.md 書込失敗 | inbox.md は変更しない。エラー内容を報告 |
| git pull --rebase 失敗 | 構造化エラー表示して停止。自動解消しない |
| git push 失敗 | 構造化エラー表示。完了扱いにしない |

## Artifact Lifecycle

各成果物の役割・性格・lifecycle 詳細は `agentdev-learning-pipeline` skill の「Artifact Lifecycle」を参照。

**learning-promote の責務**: normalize → classify → 8-axis eval → evaluation-report → disposal judgment → HITL → promoted artifact 生成 → archive move → prune。promoted artifact は `/agentdev/backlog-review` 経由で RU 化後に `/agentdev/req-define` に合流する。
