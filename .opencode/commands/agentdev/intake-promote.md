---
description: レビュー済み intake item を後続コマンド（req-define / intake-open）に渡せる入力 artifact に整形する
agent: sisyphus
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
---

# Intake Promote

`.agentdev/intake/accepted/` 内のレビュー済み intake item を、`req-define` または `intake-open` に渡せる入力 artifact に整形する。

**このコマンドは整形のみを行う。** GitHub Issue の作成は行わない（REQ-0017-026）。

## Input

- レビュー済み intake item 群（`.agentdev/intake/accepted/` 内の Markdown ファイル）
- ユーザーによる整形指示・追加コンテキスト（対話的に）

## Output

- 整形済み入力 artifact（`req-define` 用 または `intake-open` 用）
- 整形済み item は `.agentdev/intake/promoted/` に保存

## 整形の方向性

レビュー済み item の後続ルートに応じて整形内容が異なる（REQ-0017-027）:

| 後続ルート | 条件 | 整形内容 |
|------------|------|----------|
| `req-define` | 要件定義が必要な item | req-define への入力に適した形式に整理 |
| `intake-open` | Issue 化可能な item | intake-open への入力 artifact 形式に整形 |

## Steps

1. **accepted の確認**: `.agentdev/intake/accepted/` 内の intake item を一覧表示する:
   - ファイル一覧の取得
   - item 数のカウント
   - accepted が空の場合はその旨を報告して終了

2. **item の読み込み**: 各 intake item を読み込み、内容と review 時の判定を把握する。

3. **後続ルートの確認**: 各 item について、ユーザーに後続ルートを確認する:
   - `req-define` ルート: 要件定義が必要（新規機能・仕様変更等）
   - `intake-open` ルート: Issue 化可能（バグ修正・小規模改善等）
   - 複数 item を束ねて1つの artifact にすることも可能（ユーザーの指示による）
   - **ユーザーが確認したルートを promoted artifact の frontmatter `route` フィールドに記録する**

4. **整形**: 後続ルートに応じて item を整形する:

   **req-define 用**:
   - 観測内容・影響・課題を整理
   - req-define で壁打ちしやすい形式に構造化
   - 既存要件との関連・差分を明記

   **intake-open 用**:
   - Issue 本文として使用可能な形式に整形
   - タイトル・概要・対象範囲・完了条件を整理
   - 複数 item を束ねる場合は Epic + 子 Issue 構成を提示
   - intake-open がそのまま入力として使用できる形式（REQ-0017-026a）

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
    - 保存先: `.agentdev/intake/promoted/`
    - ディレクトリが存在しない場合は作成する
    - ファイル名: `YYYY-MM-DD-{topic-slug}.md`（元 item 名を維持、または束ねた内容に応じた名前）
    - frontmatter に後続ルートとステータスを記録する（Step 3 でユーザーが確認したルートを使用）:
      ```yaml
      ---
      route: {route_value}
      status: promoted
      ---
      ```

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

7. **完了報告** → `agentdev-workflow-reporting` の完了報告フォーマット（`completion-reports.md` → intake-promote 完了時）に従って出力。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Guardrails

### 責務境界（REQ-0017-026, REQ-0019-004）
- G01: GitHub Issue の作成を行わない（`intake-open` が担当）
- G02: intake item の元の内容を改変しない（整理・構造化のみ）
- G03: `req-define` や `intake-open` を自動起動しない（次ステップの提示のみ）
- G04: learning pipeline の入力を生成しない（MUST NOT）。review 済み intake item の後続ルートは `req-define` または `intake-open` のみ（REQ-0019-003, REQ-0019-004）
- G05: learning item の保存・分類・昇華を担当しない（REQ-0019-023）

### 形式制約（REQ-0017-032〜039）
- G06: workflow 管理 artifact として扱わない（REQ-0017-033）
- G07: 整形結果に frontmatter・状態値を必須にしない（REQ-0017-035）
- G08: 整形結果に重複排除キー・後続 artifact 参照を含めない（REQ-0017-039）
- G09: 元 item の本文に整形結果を書き込まない（REQ-0017-038）

### 実行制約
- G10: 整形はユーザーとの対話を通じて行う
- G11: 保存先は `.agentdev/intake/promoted/` のみ
- G12: 整形後の item を accepted ディレクトリから移動・削除しない（intake-open 側で管理）
