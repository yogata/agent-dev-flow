---
name: agentdev-workflow-intake-capture
description: "intake-capture command の workflow 実装本体。ユーザーの手動入力から intake item を生成し、`.agentdev/intake/inbox/` へ保存、git 永続化、完了報告までの保存専用 workflow を所有する（capture-only 型、STEP model 対象外）。USE FOR: intake-capture 実行時の workflow 実行（入力受領・item 生成・ファイル名生成・実行前同期・保存・git 永続化・完了報告）。DO NOT USE FOR: 採用可否の判断・review・分類・振り分け、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# intake-capture workflow スキル

intake-capture command の workflow 実装本体。
ユーザーの手動入力から未分類の作業候補、不整合、規約違反、未回収課題を intake item として `.agentdev/intake/inbox/` に保存する保存専用 workflow を所有する。
GitHub Issue の作成、採用可否の判断、review、整形、分類は行わない。

intake-capture command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md が担う（workflow 実装が単純なため references/ を持たない）。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-intake-capture.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と intake-capture command の公開契約のみを前提とする。SPEC ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

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

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-intake-capture.yaml`、`kind: workflow-extension`）を読み込む場合がある（DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-intake-capture/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、intake-capture command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **保存専用**: GitHub Issue の作成、採用可否の判断、review、整形、分類、item の変更・更新を行わない（command 側ガードレール G01・G03・G12 と不変条件の詳細実装）
- **補完禁止**: ユーザーの入力に含まれない情報を自動生成・推論して記載しない。元の意図を保ったまま整理する（command 不変条件）
- **保存先**: `.agentdev/intake/inbox/` のみ（G12）。ディレクトリが存在しない場合は作成する。同名ファイルが存在する場合は `{topic-slug}-2`、`{topic-slug}-3` のように連番を付与する
- **topic-slug 生成**: タイトルから生成する（小文字英数字、ハイフン区切り、30文字以内）。日付は実行時のシステム日付（`YYYY-MM-DD`）
- **git 永続化**: commit message は `chore(agentdev): capture intake item`（Conventional Commits 形式）。変更なし時は commit/push せず完了報告で「変更なし」と報告する。push 失敗時は構造化エラー形式で停止する（完了扱いにしない）
- **実行前同期**: `git pull --ff-only` 失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の「Git 同期エラー」形式で表示して停止する（自動解消しない）
- **完了報告**: template は `.opencode/commands/agentdev/templates/intake-capture/standard.md` に従う

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **intake-capture command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
