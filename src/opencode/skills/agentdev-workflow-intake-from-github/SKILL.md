---
name: agentdev-workflow-intake-from-github
description: "intake-from-github command の workflow 実装本体。クローズ済み GitHub Issue/PR の本文・コメントから未回収の変更候補を抽出し、intake item として `.agentdev/intake/inbox/` に保存、git 永続化、サマリーレポート、完了報告までの保存専用 workflow を所有する（capture-only 型、STEP model 対象外）。USE FOR: intake-from-github 実行時の workflow 実行（期間解釈・データ取得・構造的検出・LLM 全文解析・item 生成・保存・サマリーレポート）。DO NOT USE FOR: 採用可否の判断・review・分類、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---
<!-- ADF-COVERS(implementation): REQ-037-001, REQ-037-004, REQ-037-006, REQ-037-007 -->

# intake-from-github workflow スキル

intake-from-github command の workflow 実装本体。
クローズ済みの GitHub Issue/PR の本文、コメントから未回収の変更候補を抽出し、intake item として `.agentdev/intake/inbox/` に保存する保存専用 workflow を所有する。
GitHub Issue の作成、採用可否の判断、review、整形、分類は行わない。

intake-from-github command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md が担う（抽出の判定基準は Capability Skill へ委譲し、references/ を持たない）。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` Design が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-intake-from-github.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と intake-from-github command の公開契約のみを前提とする。Design ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **Design 内部パスの固定知識化の禁止**: extension に列挙されていない Design 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- intake-from-github command から渡されるユーザーの自然言語による期間指定（「直近1週間」「今月」「2026-05-02から」等）
- または特定の Issue/PR 番号の指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item（候補ごとに1ファイル）
- 抽出サマリーレポート（ユーザー確認用）
- git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）を含む完了報告

## 副作用

- `.agentdev/intake/inbox/` 配下へのファイル作成
- `.agentdev/intake/` 配下の変更の commit / push
- GitHub Issue/PR の読み取り（書き込みは行わない）
- 当該 Workflow Skill は worktree root 配下以外を編集しない（intake-from-github command の worktree 隔離に従う）

## workflow model（capture-only型、STEP model 対象外）

本スキルは capture-only型の workflow であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。
resume point / export / import を持たない。
工程は逐次実行し、中断時は workflow を最初から再実行する。
抽出の再実行は読み取りのみのため安全であり、保存済みファイルとの重複はファイル名への連番付与で吸収する。

| STEP | 名称 | 内容 |
|---|---|---|
| STEP-1 | 期間解釈 | 期間指定または Issue/PR 番号指定を解釈する（抽出アルゴリズムは `agentdev-intake-pipeline`） |
| STEP-2 | データ取得 | クローズ済み Issue/PR のデータを取得する（gh CLI、`agentdev-gh-cli` の読み取り手続き） |
| STEP-3 | 構造的検出 | 抽出ルールに基づき構造的に残課題候補を検出する（`agentdev-intake-pipeline`） |
| STEP-4 | LLM 全文解析 | キーワードリスト、コンテキスト付与ルールに基づき全文解析する（`agentdev-intake-pipeline`） |
| STEP-5 | intake item 生成・実行前同期 | item 生成ルール、ファイル名規則に従い item を生成する（`agentdev-intake-pipeline`）。`git pull --ff-only` を実行する |
| STEP-6 | 保存・永続化 | `.agentdev/intake/inbox/` へ保存し、`.agentdev/intake/` 配下の変更を commit / push する |
| STEP-7 | サマリーレポート提示 | 抽出結果をサマリーとしてユーザーに提示する（対象期間、対象数、抽出候補数、保存先、一覧表） |
| STEP-8 | 完了報告 | 完了報告 template に従って出力する。git 永続化結果を含める |

## Intake Item 形式

intake item は `agentdev-workflow-intake-capture` と同一の推奨標準形（観測、今回扱わない理由、影響、レビューで決めること、根拠（任意））を使用する。
frontmatter、状態フィールド、重複排除キーは持たない。
各セクションの見出し名は固定せず、抽出内容に合わせて整理する。
内容がないセクションを作成しない。

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-intake-pipeline`: GitHub 残課題抽出の判定基準（期間解釈、データ取得、構造的検出、LLM 全文解析、item 生成ルール、ファイル名規則）
- `agentdev-gh-cli`: GitHub Issue/PR の安全な読み取り手続き
- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ（並列実行安全ステージング、構造化エラー形式）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-intake-from-github.yaml`、`kind: workflow-extension`）を読み込む場合がある（DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-intake-from-github/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、intake-from-github command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **保存専用**: GitHub Issue の作成、採用可否の判断、review、整形、分類を行わない。Issue/PR へのコメント投稿、マーカー付与も行わない（command 側ガードレール G01・G04 ほか、不変条件の詳細実装）
- **データ取得**: GitHub Issue/PR のデータ取得は `gh` CLI のみ使用する（GitHub API 直接呼び出し不可、G09）。対象はクローズ済み Issue/PR のみ（オープン中は対象外、command 不変条件）。読み取り操作は `agentdev-gh-cli` に従う（command 不変条件）
- **保存先**: `.agentdev/intake/inbox/` のみ（G12）。ディレクトリが存在しない場合は作成する。同名ファイルが存在する場合は連番を付与する
- **成果物本文 verbatim**: 保存対象ファイル本文は verbatim で扱う。判定結果、調査過程、中間ログ、読解メモは要約し、成果物パス、根拠、capture候補へ圧縮して返す（command 不変条件）
- **git 永続化**: commit message は `chore(agentdev): capture intake items from github`（Conventional Commits 形式）。変更なし時は commit/push せず完了報告で「変更なし」と報告する。push 失敗時は構造化エラー形式で停止する（完了扱いにしない）
- **実行前同期**: `git pull --ff-only` 失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の「Git 同期エラー」形式で表示して停止する（自動解消しない）
- **サマリーレポート**: 対象期間、対象 Issue/PR 数、抽出候補数、保存先、候補一覧表（番号、タイトル、元 Issue/PR、ファイル名）を含める
- **完了報告**: template は `.opencode/commands/agentdev/templates/intake-from-github/standard.md` に従う

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **intake-from-github command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
