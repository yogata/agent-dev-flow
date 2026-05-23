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

引数なし実行時、promoted artifact を全件自動処理する（一括処理モード）。引数あり実行時は指定された artifact のみ処理する。各 artifact は独立して処理され、1件の失敗が後続の処理を妨げない（continue-on-error）。全 artifact の処理完了後に git 永続化を1回だけ実行する（REQ-0029）。

### Step 0: 実行前同期（git pull --ff-only）

全 artifact 処理の前に `git pull --ff-only` を1回だけ実行する（REQ-0029-007, 008）。

- `git pull --ff-only` を実行する
- **失敗時**: 以下の構造化エラーメッセージを表示して停止する（artifact 処理を開始せず全体停止）。自動解消しない:
  ```
  ## Git 同期エラー

  **エラー種別**: pull --ff-only 失敗
  **停止理由**: リモートに未取り込みの変更があり、fast-forward マージできない
  **対象ブランチ**: {current_branch}
  **ユーザーアクション**: 手動で `git pull --rebase` または `git stash && git pull --ff-only && git stash pop` を実行してください
  **raw git output**:
  {git_error_output}
  ```

### Step 1: Artifact 検出

引数の有無に応じて promoted artifact を特定する（REQ-0029-001, 002, 003, 013）:

- 引数なし + promoted artifact が0件 → エラー停止: `promoted artifact が存在しません。/agentdev/intake-promote で整形してください。`
- 引数なし + promoted artifact が1件以上 → ファイル名昇順で全件取得し、一括処理モードで Step 2 へ進む
- 引数あり → 指定されたファイル名に対応する `.agentdev/intake/promoted/intake-open/{filename}` のみを取得し、Step 2 へ進む

artifact の検索方法: `.agentdev/intake/promoted/intake-open/*.md` のファイル一覧を取得する。

### Step 2: Artifact 反復ループ

Step 1 で検出された artifact をファイル名昇順で順次処理する（REQ-0029-002, 004, 005, 006）。

各 artifact について以下の 2a〜2e を実行する:

#### 2a: Artifact 読み込み

promoted artifact の内容をパースする:
- frontmatter は持たない（ディレクトリ配置が一次状態）
- 整形済み item 群: タイトル、概要、対象範囲、完了条件等
- 後続ルート情報: 単一 Issue または Epic + 子Issue 構成
- **情報不足の検証**（REQ-0029-015）: Issue 化に必要な情報（タイトル、概要等）が不足する artifact は failed として扱い、Issue 作成を試行せずファイルを変更せず残す（SHALL）

#### 2b: 構成判定

artifact の内容から Issue 構成を判定する（REQ-0029-004）:
- 単一 item → **Single Issue flow**（2c-i）
- 複数 item または Epic 構成指定あり → **Epic flow**（2c-ii）

#### 2c: Issue 作成

構成判定結果に応じて、以下のいずれかの flow を実行する:

##### 2c-i: [Single Issue flow]

1. **テンプレート選択**: item の内容に応じてテンプレートを選択する:
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` または `issue_desc_bug.md`
   - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て Issue 本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。

2. **Issue 作成**:
   - artifact の内容から Issue 本文を生成
   - ラベル: item 内容に応じて選定（`enhancement` または `bug` 等）
   - `agentdev-gh-cli` に従って `--body-file` で作成
   - `agentdev-gh-cli` の VERIFY操作（書き込み内容検証）を実行すること

##### 2c-ii: [Epic flow]

1. **Epic Issue 作成**:
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md`
   - artifact のサマリー情報から Epic Issue 本文を生成
   - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て Epic Issue 本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
   - タイトル: artifact のサマリーから生成
   - ラベル: `enhancement`, `epic`
   - `agentdev-gh-cli` に従って `--body-file` で作成
   - `agentdev-gh-cli` の VERIFY操作（書き込み内容検証）を実行すること
   - 作成された Issue 番号を `{epic_number}` として記録

2. **子Issue 作成**: 各 item を Epic 配下の子Issue として作成する:
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md`
   - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て子Issue 本文に含まれること。
   - `Parent: #{epic_number}` を先頭行に配置
   - ラベル: `enhancement`
   - `agentdev-gh-cli` に従って `--body-file` で作成
   - `agentdev-gh-cli` の VERIFY操作（書き込み内容検証）を実行すること

3. **Epic 更新**: 全子Issue 作成後、Epic Issue 本文の子Issue リンクを実際の Issue 番号で更新する:
   - `agentdev-gh-cli` に従って `--body-file` で更新
   - テンプレートの `【必須】` セクションが維持されていることを確認

4. **ステータス追跡更新**: `agentdev-epic-tracker` に従って Epic のステータスを初期化する。

#### 2d: Artifact 削除

Issue 作成および VERIFY が成功した場合のみ、当該 promoted artifact を `.agentdev/intake/promoted/intake-open/` から削除する（REQ-0029-005）。
- **削除条件**: Issue 作成 + VERIFY が正常完了した場合のみ
- **削除しない場合**: Issue 作成失敗・VERIFY 失敗・エラー発生時は artifact を残す（リトライ可能にするため）

#### 2e: 失敗時の継続

artifact 単位の処理失敗時は、当該 artifact を残したうえで後続 artifact の処理を継続する（REQ-0029-006）。
- 失敗した artifact のファイル名とエラー内容を記録する
- 後続 artifact の処理を妨げない（前の artifact の失敗が後続に影響しない）
- ループ終了後、Step 4 の完了報告で成功・失敗の全件を報告する
- **failed artifact のファイル変更禁止**（REQ-0029-014）: `status: failed` 等の frontmatter 追加、`.failed` 等へのリネーム、内容の書き換えを行わないこと（MUST NOT）
- **再実行時の再試行**（REQ-0029-017）: failed は永続状態ではなく前回実行結果の分類である。再実行時は残存 artifact を通常の処理対象として再試行する（SHALL）

### Step 3: Git 永続化

全 artifact の処理完了後、`.agentdev/intake/` 配下の変更を1 commit / 1 push する（REQ-0029-009, 010）。

- `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する
- **変更なし時**: commit/push せず、Step 4 の完了報告で「変更なし」と報告
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

### Step 4: 完了報告

`agentdev-workflow-reporting` の完了報告フォーマット（`completion-reports.md` → intake-open 一括処理完了時）に従って出力する（REQ-0029-011, 012）。

以下を含める:
- 成功件数、失敗件数
- 削除済み artifact 一覧
- 残存 artifact 一覧（失敗・リトライ対象）
- 作成 Issue 番号一覧（単一 Issue および Epic + 子Issue）
- git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）
- 検証結果（`agentdev-gh-cli` VERIFY 操作の結果）

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して全体停止。artifact 処理を開始しない（REQ-0029-008） |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない（REQ-0029-010） |
| artifact 読み込み失敗 | 当該 artifact をスキップし、後続 artifact の処理を継続。失敗を記録して Step 4 で報告 |
| artifact の情報不足 | 当該 artifact を failed として扱い、Issue 作成を試行せず残す。後続 artifact の処理を継続（REQ-0029-015） |
| Issue 作成失敗 | 当該 artifact を残し、後続 artifact の処理を継続。失敗を記録して Step 4 で報告 |
| VERIFY 失敗 | 当該 artifact を残し、後続 artifact の処理を継続。失敗を記録して Step 4 で報告 |
| 引数なし + artifact 0件 | エラーメッセージを表示して停止（一括処理対象なし） |

## Guardrails

### 責務境界（REQ-0017-026a/026b, REQ-0019-026）
- G01: 候補抽出を行わない（`intake-capture` / `intake-from-github` が担当）
- G02: 解消チェックを行わない（`intake-review` 等が担当）
- G03: 採否判断を行わない（`intake-review` が担当）
- G04: review を行わない（`intake-review` が担当）
- G05: Issue 作成のみを担当する
- G06: intake item 群から learning item を作成しない（MUST NOT）（REQ-0019-026）
- G16: promoted artifact の内容を実現するための質問を行わないこと（MUST NOT）（REQ-0029-016）

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

### 一括処理制約（REQ-0029）
- G14: 引数なし + 1件以上の全件処理時、artifact 単位の失敗で全体停止しないこと
- G15: ループ内の各 artifact 処理は独立しており、前の artifact の失敗が後続に影響しないこと
