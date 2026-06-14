---
description: 未分類の変更候補を手動入力から intake item として保存する
agent: sisyphus
---

# Intake Capture（手動入力）

ユーザーの手動入力から、未分類の作業候補・不整合・規約違反・未回収課題を intake item として作成し、`.agentdev/intake/inbox/` に保存する。

**このコマンドは保存専用である。** GitHub Issue の作成・採用可否の判断は行わない。作業知見だけの内容は対象外である（`agentdev-workflow-orchestration` skill の Split Rule を参照）。

## Input

- ユーザーの自然言語による変更候補の記述
- 任意で観測元・影響・判断保留事項の指定

## Output

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item

## Intake Item 形式

intake item は以下の推奨標準形に従う Markdown artifact とする。workflow 管理用の frontmatter・状態フィールド・重複排除キーは持たない。

```markdown
# {タイトル}

## 観測
{何が観測されたか}

## 今回扱わない理由
{なぜ今すぐ対応しないのか}

## 影響
{影響の評価}

## レビューで決めること
{レビューで判断すべき点}

## 根拠（任意）
{補足情報・証拠}
```

**セクションに関する制約**:
- 各セクションの見出し名は固定しない。ユーザーの入力に合わせて適切に整理する
- 必須セクション・省略不可セクションを設けない
- 内容がないセクションを形式維持のためだけに作成しない
- frontmatter・状態値・メタデータフィールドを必須にしない

## Steps

1. **入力の受領**: ユーザーから変更候補の内容を受け取る。自然言語で記述された内容をそのまま取り扱う。

2. **intake item の生成**: ユーザーの入力を上記推奨標準形に整理する。ユーザーが明示的に指定していないセクションは推測・補完せず、そのセクションを省略する（内容がないセクションを作成しない）。ユーザーの入力に含まれない情報を自動生成・推論して記載することを禁止する。

3. **ファイル名の生成**:
    - 日付: 実行時のシステム日付（`YYYY-MM-DD`）
    - topic-slug: タイトルから生成（小文字英数字・ハイフン区切り、30文字以内）
    - 形式: `YYYY-MM-DD-{topic-slug}.md`

3-1. **実行前同期**:
    - `git pull --ff-only` を実行する
    - **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の「Git 同期エラー」形式で表示して停止する（自動解消しない）

4. **保存**:
    - 保存先: `.agentdev/intake/inbox/`
    - ディレクトリが存在しない場合は作成する
    - 同名ファイルが存在する場合は `{topic-slug}-2`, `{topic-slug}-3` のように連番を付与する

 4-1. **.agentdev/intake 変更の commit と push**:
     - `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する
     - **変更なし時**: commit/push せず、Step 5 の完了報告で「変更なし」と報告
     - **変更あり時**:
       1. `git add` は `.agentdev/intake/` 配下の変更ファイルのみを対象とする。他のパスを巻き込まない
       2. commit message: `chore(agentdev): capture intake item`（Conventional Commits 形式）
       3. `git push` を実行する
        4. **push 失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の「Git Push エラー」形式で表示し、完了扱いにしない

5. **完了報告** → 完了報告templateに従って出力。template: .opencode/commands/agentdev/templates/intake-capture/standard.md。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Guardrails

### 責務境界
- G01: GitHub Issue の作成を行わない（`case-open` が担当）
- G02: 採用可否の判断を行わない（`intake-promote` が担当）
- G03: intake item の変更・更新を行わない（保存のみ）
- G04: review・整形・分類を行わない（後続コマンドの責務）
- G05: 対象は「未分類の作業候補・不整合・規約違反・未回収課題」に限定する。作業知見だけの内容（再発防止知見のみで具体的修正対象がないもの）は対象外
- G06: learning item の保存・分類・昇華を担当しない。再発防止知見のみの観測は `/agentdev/learning-capture` に委ねる

### 形式制約
- G07: workflow 管理 artifact として扱わない
- G08: frontmatter・状態値・重複排除キー・後続 artifact 参照を必須にしない
- G09: 特定セクションを必須セクションとして扱わない
- G10: review 結果を item に書き込まない

### 実行制約
- G11: ユーザーの入力内容を過度に解釈・変形しない（元の意図を保ったまま整理する）
- G12: 保存先は `.agentdev/intake/inbox/` のみ（他ディレクトリへの保存は禁止）
- G13: 推測不能なセクションは省略し、過度な補完を禁止する（ユーザーが明示的に提供した内容のみを整理する）
