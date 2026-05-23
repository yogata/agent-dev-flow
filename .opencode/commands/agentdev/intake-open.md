---
description: intake-promote が生成した artifact から GitHub Issue を作成
agent: sisyphus
load_skills:
  - agentdev-gh-cli
  - agentdev-epic-tracker
  - agentdev-workflow-templates
  - agentdev-workflow-reporting
---

# Intake Open

`intake-promote` が生成した Issue 化入力 artifact（`.agentdev/intake/promoted/intake-open/`）を読み込み、GitHub Issue または Epic + 子Issue を作成する（REQ-0017-026a）。

**このコマンドは Issue 作成のみを行う。** 候補抽出・解消チェック・採否判断・review は含めない（REQ-0017-026b）。

## Input

- `intake-promote` が生成した promoted artifact（`.agentdev/intake/promoted/intake-open/` 内の Markdown ファイル）
- 省略可能な artifact ファイル名引数（明示的な指定用）

## Output

- GitHub Issue（単一）、または Epic + 子Issue 群
- promoted artifact の削除（Issue 作成成功時のみ）

## Steps

1. **Artifact 検出**: 引数の有無に応じて promoted artifact を特定する:
   - 引数なし + promoted artifact が1件 → 自動検出して次 Step へ進む
   - 引数なし + promoted artifact が0件 → エラー停止: `promoted artifact が存在しません。/agentdev/intake-promote で整形してください。`
   - 引数なし + promoted artifact が2件以上 → 候補一覧を表示して停止: `promoted artifact が複数あります。対象を指定してください: {候補一覧}`
   - 引数あり → 指定されたファイル名に対応する `.agentdev/intake/promoted/intake-open/{filename}` を読み込む

   artifact の検索方法: `.agentdev/intake/promoted/intake-open/*.md` のファイル一覧を取得する。

2. **Artifact 読み込み**: promoted artifact の内容をパースする:
   - frontmatter は持たない（ディレクトリ配置が一次状態）
   - 整形済み item 群: タイトル、概要、対象範囲、完了条件等
   - 後続ルート情報: 単一 Issue または Epic + 子Issue 構成

3. **構成判定**: artifact の内容から Issue 構成を判定する:
   - 単一 item → **Single Issue flow**（Step 4〜6）
   - 複数 item または Epic 構成指定あり → **Epic flow**（Step 7〜12）

4. **[Single Issue] テンプレート選択**: item の内容に応じてテンプレートを選択する:
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` または `issue_desc_bug.md`
   - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て Issue 本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。

5. **[Single Issue] Issue 作成**:
   - artifact の内容から Issue 本文を生成
   - ラベル: item 内容に応じて選定（`enhancement` または `bug` 等）
   - `agentdev-gh-cli` に従って `--body-file` で作成
   - `agentdev-gh-cli` の VERIFY操作（書き込み内容検証）を実行すること

6. **[Single Issue] 完了報告** → Step 13 へ

7. **[Epic flow] Epic Issue 作成**:
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md`
   - artifact のサマリー情報から Epic Issue 本文を生成
   - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て Epic Issue 本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
   - タイトル: artifact のサマリーから生成
   - ラベル: `enhancement`, `epic`
   - `agentdev-gh-cli` に従って `--body-file` で作成
   - `agentdev-gh-cli` の VERIFY操作（書き込み内容検証）を実行すること
   - 作成された Issue 番号を `{epic_number}` として記録

8. **[Epic flow] 子Issue 作成**: 各 item を Epic 配下の子Issue として作成する:
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md`
   - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て子Issue 本文に含まれること。
   - `Parent: #{epic_number}` を先頭行に配置
   - ラベル: `enhancement`
   - `agentdev-gh-cli` に従って `--body-file` で作成
   - `agentdev-gh-cli` の VERIFY操作（書き込み内容検証）を実行すること

9. **[Epic flow] Epic 更新**: 全子Issue 作成後、Epic Issue 本文の子Issue リンクを実際の Issue 番号で更新する:
   - `agentdev-gh-cli` に従って `--body-file` で更新
   - テンプレートの `【必須】` セクションが維持されていることを確認

10. **[Epic flow] ステータス追跡更新**: `agentdev-epic-tracker` に従って Epic のステータスを初期化する。

11. **[Epic flow] 完了報告** → Step 13 へ

12. *(reserved for future expansion)*

12b. **実行前同期（git pull）**:
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

13. **Artifact 削除**: Issue 作成が成功した（VERIFY で検証済みの）promoted artifact を `.agentdev/intake/promoted/intake-open/` から削除する。
    - **削除条件**: Issue 作成 + VERIFY が正常完了した場合のみ
    - **削除しない場合**: Issue 作成失敗・VERIFY 失敗・エラー発生時は artifact を残す（リトライ可能にするため）

13b. **.agentdev/intake 変更の commit と push**:
     - `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する
     - **変更なし時**: commit/push せず、Step 14 の完了報告で「変更なし」と報告
     - **変更あり時**:
       1. `git add` は `.agentdev/intake/` 配下の変更ファイルのみを対象とする（SHALL）。他のパスを巻き込まない
       2. commit message: `chore(agentdev): issue intake items`（Conventional Commits 形式）（SHALL）
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

14. **完了報告** → `agentdev-workflow-reporting` の完了報告フォーマット（`completion-reports.md` → intake-open 完了時）に従って出力。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Guardrails

### 責務境界（REQ-0017-026a/026b, REQ-0019-026）
- G01: 候補抽出を行わない（`intake-capture` / `intake-from-github` が担当）
- G02: 解消チェックを行わない（`intake-review` 等が担当）
- G03: 採否判断を行わない（`intake-review` が担当）
- G04: review を行わない（`intake-review` が担当）
- G05: Issue 作成のみを担当する
- G06: intake item 群から learning item を作成しない（MUST NOT）（REQ-0019-026）

### 実行制約
- G07: データ取得は `gh` CLI のみ使用（GitHub API 直接呼び出し不可）
- G08: テンプレートの【必須】セクションが全て Issue 本文に含まれていることを確認してから `gh issue create` を実行すること。欠落セクションがある場合は再生成すること
- G09: 子Issue 本文の先頭行に `Parent: #{epic_number}` を必ず含める（Epic flow のみ）
- G10: 全子Issue の作成完了後に Epic 本文を更新する（部分更新は禁止）

### 委譲・参照制約
- G11: `agentdev-gh-cli` に従って `--body-file` を使用すること（`--body` 直接指定は禁止）
- G12: `agentdev-workflow-templates` のテンプレートを使用すること

### 出力制約
- G13: サブエージェントの最終出力は verbatim で出力する（再フォーマット禁止）
