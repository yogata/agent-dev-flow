---
name: agentdev-workflow-intake-capture
description: "intake-capture command の workflow 実装本体。ユーザーの手動入力から intake item を生成し、`.agentdev/intake/inbox/` へ保存、git 永続化、完了報告までの保存専用 workflow を所有する（capture-only 型、STEP model 対象外）。USE FOR: intake-capture 実行時の workflow 実行（入力受領・item 生成・ファイル名生成・実行前同期・保存・git 永続化・完了報告）。DO NOT USE FOR: 採用可否の判断・review・分類・振り分け、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# intake-capture workflow スキル

intake-capture command の workflow 実装本体。
ユーザーの手動入力から未分類の作業候補、不整合、規約違反、未回収課題を intake item として `.agentdev/intake/inbox/` に保存する保存専用 workflow を所有する。
GitHub Issue の作成、採用可否の判断、review、整形、分類は行わない。

intake-capture command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 入力

- intake-capture command から渡されるユーザーの自然言語による変更候補の記述
- 任意で観測元、影響、判断保留事項の指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item
- git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）を含む完了報告

## 副作用

- `.agentdev/intake/inbox/` 配下へのファイル作成
- `.agentdev/intake/` 配下の変更の commit / push
- 当該 Workflow Skill は worktree root 配下以外を編集しない（intake-capture command の worktree 隔離に従う）

## workflow model（capture-only型、STEP model 対象外）

本スキルは capture-only型の workflow であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。
resume point / export / import を持たない。
工程は逐次実行し、中断時は workflow を最初から再実行する。
保存済みファイルとの重複はファイル名への連番付与で吸収するため、再実行は安全である。

| STEP | 名称 | 内容 |
|---|---|---|
| STEP-1 | 入力の受領 | ユーザーから変更候補の内容を受領する。自然言語で記述された内容をそのまま取り扱う |
| STEP-2 | intake item の生成 | 入力を推奨標準形に整理する。ユーザーが明示的に指定していないセクションは推測・補完せず省略する |
| STEP-3 | ファイル名の生成・実行前同期 | `YYYY-MM-DD-{topic-slug}.md` 形式でファイル名を生成する。`git pull --ff-only` を実行する |
| STEP-4 | 保存・永続化 | `.agentdev/intake/inbox/` へ保存し、`.agentdev/intake/` 配下の変更を commit / push する |
| STEP-5 | 完了報告 | 完了報告 template に従って出力する。git 永続化結果を含める |

## Intake Item 形式

intake item は以下の推奨標準形に従う Markdown 成果物とする。
workflow 管理用の frontmatter、状態フィールド、重複排除キーは持たない。

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

セクションに関する制約:

- 各セクションの見出し名は固定しない。ユーザーの入力に合わせて整理する
- 必須セクション、省略不可セクションを設けない
- 内容がないセクションを形式維持のためだけに作成しない
- frontmatter、状態値、メタデータフィールドを必須にしない

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ（並列実行安全ステージング、構造化エラー形式）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `agentdev-workflow-orchestration`: intake と learning の capture 振り分け基準（作業知見のみで具体的修正対象がない内容は learning 対象）

## 共通制約

- **保存専用**: GitHub Issue の作成、採用可否の判断、review、整形、分類、item の変更・更新を行わない（command 側ガードレールと不変条件の詳細実装）
- **補完禁止**: ユーザーの入力に含まれない情報を自動生成・推論して記載しない。元の意図を保ったまま整理する（command 不変条件）
- **保存先**: `.agentdev/intake/inbox/` のみ。ディレクトリが存在しない場合は作成する。同名ファイルが存在する場合は `{topic-slug}-2`、`{topic-slug}-3` のように連番を付与する
- **topic-slug 生成**: タイトルから生成する（小文字英数字、ハイフン区切り、30文字以内）。日付は実行時のシステム日付（`YYYY-MM-DD`）
- **git 永続化**: commit message は `chore(agentdev): capture intake item`（Conventional Commits 形式）。変更なし時は commit/push せず完了報告で「変更なし」と報告する。push 失敗時は構造化エラー形式で停止する（完了扱いにしない）
- **実行前同期**: `git pull --ff-only` 失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の「Git 同期エラー」形式で表示して停止する（自動解消しない）
- **完了報告**: template は `.opencode/commands/agentdev/templates/intake-capture/standard.md` に従う

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **intake-capture command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
