# STEP-6: 終了処理・クリーンアップ（termination-and-cleanup）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の Control Plane STEP-6 詳細である。
> コメント追加、draft/RU 削除（Form Zero）、完了報告を提供する。

## Purpose

Issue 作成後の共通終了処理（コメント追加、draft/RU 削除、完了報告）を実施する。

## Input Resolution

1. SSoT 再構成: 作成済み Issue 番号、draft ファイルパス、RU ファイルパス
2. identifier 保持: Issue番号、topic-slug、RU-ID
3. 最小 scalar: なし
4. runtime artifact: なし

## Preconditions

- STEP-5 で GitHub Issue 作成が完了している

## Result

- Issue へのコメント追加完了（テンプレート準拠）
- draft/RU 削除完了（Form Zero、即時 commit + push）
- draft/RU 削除残存検証合格
- 統合先同期確認合格（不一致検出時は停止）
- 完了報告出力

## Procedure

### STEP-6-1: コメント追加（共通終了処理）

`agentdev-workflow-templates` の選定ルールに従いコメント用テンプレートを読み込む（Epic flow では Epic Issue にコメント追加）→ VERIFY。

### STEP-6-2: ドラフト削除（共通終了処理）

ドラフトが存在する場合、`.agentdev/drafts/req-draft-{topic-slug}.md` を削除（Standard/Epic 全フロー共通）。

**Form Zero**: 削除は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git rm <draft-path>` で明示パスをステージし、同一ステップ内で `git commit -- <draft-path>` により即時コミットする。
未ステージの削除を作業ツリーに残存させないこと。

### STEP-6-2-1: RU ファイル削除（共通終了処理）

詳細、委譲接続点は `agentdev-req-file-manager` を参照。
削除は並列実行安全ステージングプロシージャに従い `git rm <RU-path>` で明示パスをステージし、同一ステップ内で `git commit -- <RU-path>` により即時コミットする（Form Zero）。

実証Case の RU/draft 削除は通常Caseと同一の手順で実行する。
実証Issue 作成と VERIFY が成功した RU は評価ブランチ削除後に main 側で未処理 RU として再出現しない。
ADF 制御状態の正規位置は main であり、RU 消費等のドメイン状態の変更は main 側で維持する（REQ-042-012、REQ-043-012 の実行詳細）。

### STEP-6-2-2: draft/RU 削除残存検証（共通終了処理）

STEP-6-2/6-2-1 の削除後、当該ファイルが作業ツリー、index に残存していないことを検証。

- 検証コマンド: `git status --porcelain -- <draft-path> <RU-path>` が空、またはファイル非存在確認
- 残存を検出した場合: 即座に停止し残存ファイル一覧を報告
- Standard flow と Epic flow の双方で実施

### STEP-6-2-3: 統合先同期確認と draft/RU 削除 commit 後の即時 push

RU ファイル削除後、統合先ブランチ（REQ-042 の定義による、既定 main）の作業ディレクトリとリモートの同期を確認する（REQ-030-020）。
不一致を検出した場合は即時 push を行わず停止し、不一致の内容を報告する。

同期を確認した後、STEP-6-2/6-2-1 の削除コミットに対し `git push` を即時実行する（case-run 引き継ぎ時の `git pull --ff-only` 失敗を防止するため）。
push 失敗時は構造化エラーメッセージを表示して停止する。

### STEP-6-3: 完了報告（共通終了処理）

テンプレート種別（`agentdev-workflow-templates` の `templates/case-open/` 配下）:

- Standard → `.opencode/skills/agentdev-workflow-templates/templates/case-open/standard.md`
- 単一REQ Epic → `.opencode/skills/agentdev-workflow-templates/templates/case-open/epic.md`
- マルチREQ Epic → `.opencode/skills/agentdev-workflow-templates/templates/case-open/multi-req-epic.md`

**Capture結果 小節**: case-open 実行中に実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存した場合、保存した capture 成果物のパス・分類・保存結果のみを含める（capture 本体は含めない、成果物が無い場合は省略、共通意味契約は `artifact-contracts` SPEC「Capture結果 小節」節参照）。

## Evidence

- コメント追加の VERIFY 結果、削除 commit hash と push 結果、`git status --porcelain` による残存検証結果、統合先同期確認結果、完了報告出力

## Completion Verification

- draft/RU 削除残存検証が合格であること（作業ツリー、index に残存なし）。統合先同期確認が不合格であれば停止していること。削除 commit の即時 push が成功していること

## Resume-Idempotency

- 削除済みパス（durable state: ファイル非存在、commit history）で再開点を判定する。コメント追加・完了報告は読取冪等であり、未実行分のみ再実行する

## resume point

- コメント追加状態
- draft/RU 削除状態（各パス、commit hash、push 成功）
- 削除残存検証結果
- 統合先同期確認結果
- 完了報告出力状態

## 関連 STEP

- 前: STEP-5（issue-creation-flows）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- `agentdev-workflow-templates`: コメント用テンプレート、完了報告テンプレート
- `agentdev-req-file-manager`: RU ファイル削除
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（Form Zero）
- `agentdev-gh-cli`: コメント追加・VERIFY
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: deviation capture 委譲

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（自工程で実観測した deviation を learning-capture または intake-pipeline へ委譲保存、`intake-capture` command 等の別 command を直接呼ばない、capture 本体は完了報告に含めず保存した成果物のパス・分類・保存結果のみを `Capture結果` 小節へ含める）
- G23・不変条件（並列実行安全 git 操作、明示パス指定 + `git commit -- <paths>` の --only pathspec 形式、`git add -A`/`git add .`/`git add --all`/`git commit -a` 等のスイープ操作禁止、Form Zero、`.agentdev/` 全体一括スコープではなく明示パス限定）
