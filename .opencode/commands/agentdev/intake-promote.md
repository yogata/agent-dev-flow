---
description: レビュー済み intake item を後続コマンド（backlog-review）に渡せる入力 artifact に整形する
agent: sisyphus
---

# Intake Promote

`.agentdev/intake/accepted/` 内のレビュー済み intake item を、`backlog-review` に渡せる入力 artifact に整形する。

**このコマンドは整形のみを行う。** GitHub Issue の作成は行わない（REQ-0103）。

## Input

- レビュー済み intake item 群（`.agentdev/intake/accepted/` 内の Markdown ファイル）
- ユーザーによる整形指示・追加コンテキスト（対話的に）

## Output

- 整形済み入力 artifact（`backlog-review` 用）
- 整形済み item は `.agentdev/intake/promoted/*.md` に保存（フラット構造）

## 整形の方向性

レビュー済み item の後続ルートに応じて整形内容が異なる（REQ-0103）:

| 後続ルート | 条件 | 整形内容 |
|------------|------|----------|
| `backlog-review` | 全 item | backlog-review が分析しやすい形式に整理（観測内容・影響・課題・既存要件との関連を構造化） |

## Steps

1. **accepted の確認**: `.agentdev/intake/accepted/` 内の intake item を一覧表示する:
   - ファイル一覧の取得
   - item 数のカウント
   - accepted が空の場合はその旨を報告して終了

2. **item の読み込み**: 各 intake item を読み込み、内容と review 時の判定を把握する。

3. **後続ルートの確認**: 全 item を `backlog-review` が処理するため、後続ルートの確認は不要:
   - 複数 item を束ねて1つの artifact にすることも可能（ユーザーの指示による）
   - **artifact を `.agentdev/intake/promoted/` 直下にフラット配置する。artifact の frontmatter には route/status を記録しない（REQ-0105）**

4. **整形**: item を backlog-review 向けに整形する:
   - 観測内容・影響・課題を整理
   - backlog-review が分析しやすい形式に構造化
   - 既存要件との関連・差分を明記
   - 複数 item を束ねる場合は統合内容を整理

5. **ユーザー確認**: 整形結果を提示し、ユーザーの確認を得る:
    - 内容の修正指示
    - ルートの変更指示
    - 束ね方の調整

5b. **実行前同期（git pull）**:
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

6. **保存**:
    - 保存先: `.agentdev/intake/promoted/`（フラット構造）
    - `promoted/` ディレクトリが存在しない場合は作成する
    - ファイル名: `YYYY-MM-DD-{topic-slug}.md`（元 item 名を維持、または束ねた内容に応じた名前）
    - artifact の frontmatter に route や status を記録しない（REQ-0105）

6a. **accepted item の archive/promoted 移動**:
    - Step 6 で保存元とした accepted item（`.agentdev/intake/accepted/{item}.md`）を `.agentdev/intake/archive/promoted/` に移動する
    - `archive/promoted/` ディレクトリが存在しない場合は作成する

6b. **.agentdev/intake 変更の commit と push**:
    - `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する
    - **変更なし時**: commit/push せず、Step 7 の完了報告で「変更なし」と報告
    - **変更あり時**:
      1. `git add` は `.agentdev/intake/` 配下の変更ファイルのみを対象とする（SHALL）。他のパスを巻き込まない
      2. commit message: `chore(agentdev): promote intake items`（Conventional Commits 形式）（SHALL）
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

7. **完了報告** → `agentdev-workflow-reporting` の完了報告variantに従って出力。variant: completion-reports/intake-promote/standard.md。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Guardrails

### 責務境界（REQ-0103, REQ-0105）
- G01: GitHub Issue の作成を行わない（`backlog-save` / `case-open` が担当）
- G02: intake item の元の内容を改変しない（整理・構造化のみ）
- G03: `backlog-review` を自動起動しない（次ステップの提示のみ）
 - G04: learning pipeline の入力を生成しない（MUST NOT）。review 済み intake item の後続ルートは `backlog-review` のみ（REQ-0105, REQ-0105, REQ-0105）
 - G04a: REQ再構成intake（`.agentdev/intake/accepted/req-restructure/` 配下）を通常の `backlog-review` 向け短期作業候補として処理してはならない（REQ-0109）。REQ再構成intakeの promote 先は backlog-review ではなく、将来のREQ再構成レビューの入力として扱う
- G05: learning item の保存・分類・昇華を担当しない（REQ-0105）

### 形式制約（REQ-0103〜039）
- G06: workflow 管理 artifact として扱わない（REQ-0103）
- G07: 整形結果に frontmatter（route/status 等）を含めてはならない（MUST NOT）（REQ-0103, REQ-0105）
- G08: 整形結果に重複排除キー・後続 artifact 参照を含めない（REQ-0103）
- G09: 元 item の本文に整形結果を書き込まない（REQ-0103）

### 実行制約
- G10: 整形はユーザーとの対話を通じて行う
- G11: 保存先は `.agentdev/intake/promoted/` 直下のみ（フラット構造）
- G12: 整形元の accepted item は artifact 保存後に `.agentdev/intake/archive/promoted/` に移動する
