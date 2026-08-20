# STEP-6〜11: 整合確認・永続化・報告（verification-and-persistence）

> 本 reference は `agentdev-workflow-design-save` SKILL.md の STEP-6〜STEP-11 詳細である。
> インデックス整合、Design 一覧整合確認、ドラフト status 更新、変更範囲検証、コミット・プッシュ、完了報告を提供する。

## 目次

- STEP-6: インデックス整合
- STEP-7: Design 一覧整合確認
- STEP-8: ドラフト status 更新
- STEP-9: 変更範囲検証
- STEP-10: コミット・プッシュ
- STEP-11: 完了報告

## STEP-6: インデックス整合

### Purpose

新規 Design を `docs/designs/README.md` の Design 一覧へ登録する。

### Input Resolution

1. SSoT 再構成: `docs/designs/README.md`、新規 Design ファイル
2. identifier 保持: Design パス、domain
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-5 で新規 Design が作成されている（既存追記時は本 STEP をスキップ可）

### Procedure

新規 Design 作成時は Design 一覧へ追加する。
既存 Design 追記時は README 更新不要とする。
新規 Design 作成後に `agentdev-artifact-validation` の公開検証契約（`check-entry-existence`）で登録を検証する。
CLI 形式、stdin JSON 入力、stdout schema は同 SKILL.md を参照。

### Result

- README 一覧登録済み（check-entry-existence 検証合格）

### Evidence

- 更新後 README、check-entry-existence の JSON 結果

### Completion Verification

- 新規 Design のエントリが Design 一覧表に存在すること

### Resume-Idempotency

- エントリ存在確認で登録済みを検出した場合は再追加しない

## STEP-7: Design 一覧整合確認

### Purpose

Design 一覧表の整合を確認し、targeted docs guard と extension 更新要否確認を実施する。

### Input Resolution

1. SSoT 再構成: `docs/designs/README.md`、`.agentdev/extensions/**`
2. identifier 保持: Design パス
3. 最小 scalar: なし
4. runtime artifact: 変更 Design ファイル一覧

### Preconditions

- STEP-6 のインデックス整合が完了している

### Procedure

Design 新規作成時は `docs/designs/README.md` の Design 一覧表に追加済みであることを確認する（STEP-6 で実施済みの場合は重複確認）。
Design 一覧表の整合は Design 探索導線の維持に必要な更新のみを対象とし、要件、判断、仕様の更新は含まない。

- **extension 更新要否の確認**: Design の追加、移動、分割が `.agentdev/extensions/**` に影響するか確認する。移動または分割により extension 参照先 Design パスが変わる場合、当該 extension の context paths を更新する。extension 参照先 Design を移動した場合はエラーとし、design-save 自身は移動を完了させずユーザー判断を仰ぐ（check #5 strict 違反を防止）。Design 新規作成で既存 command/skill の実行時参照が増える場合、対応 extension の `context` への追加をユーザーに提案する（直接編集しない）
- **targeted docs guard**: 変更 Design ファイルと連動ファイル（`docs/designs/README.md`）に対し `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_changed_docs.ts --workflow design-save --files <changed Design files> --json` を実行する（bun run 起動。モード使い分けの標準は コミット前の worktree 上での検証 = `--base-ref`、コミット後・PR 作成後の main 環境 = `--files` であり、保存直後ファイルの直接指定には `--files` を使用する。PowerShell で複数パスを渡す場合は配列変数経由（`$files = @('a.md','b.md')` を `--files $files` で渡す）または個別渡しとし、引用符まとめ渡し（`--files "a.md b.md"`）は使用しない）。`failures` に strict severity を含む場合は保存工程を継続せず修正して再実行する。`spec_readme_update_required` が true の場合は STEP-6 の更新要否判定に反映する。`full_docs_check_recommended` が true の場合は全体監査（self-hosting リポジトリ限定の自己監査コマンド）の実行をユーザーに提案する

### Result

- 一覧整合確認結果、targeted docs guard 結果、extension 更新要否

### Evidence

- check_changed_docs.ts の JSON 結果

### Completion Verification

- targeted docs guard の failures に strict severity を含まないこと

### Resume-Idempotency

- 読取と guard 実行であり再実行可能

## STEP-8: ドラフト status 更新

### Purpose

ドラフトへ Design 消費済みフラグを記録する。

### Input Resolution

1. SSoT 再構成: ドラフト frontmatter
2. identifier 保持: topic-slug
3. 最小 scalar: Design 消費済みフラグ
4. runtime artifact: ドラフトファイル

### Preconditions

- STEP-7 の一覧整合確認が完了している

### Procedure

ドラフトの Design artifact_actions 消費状態を記録する（`draft-data` に Design 消費済みフラグを付与）。
commit/push より前に更新し、commit 対象に含める。

### Result

- Design 消費済みフラグ記録済み

### Evidence

- 更新後 draft-data

### Completion Verification

- フラグが commit 対象に含まれていること

### Resume-Idempotency

- フラグの存在（durable state）で消費済み否かを再構成できる。二重更新は冪等

## STEP-9: 変更範囲検証

### Purpose

変更ファイルが許可パスリスト内であることを検証する。

### Input Resolution

1. SSoT 再構成: `git diff --name-only`
2. identifier 保持: なし
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-8 の status 更新が完了している

### Procedure

**決定的処理のスクリプト呼出**: `git diff --name-only` で変更ファイル一覧を取得し、許可パスリスト（G02）との照合を `agentdev-artifact-validation` の公開検証契約（`check-change-impact`）で実行する。
許可範囲外の変更を検出したらエラーを報告し指示を待つ（自動破棄しない）。
`violations` が空でない場合は G02 違反として報告し指示を待つ。
CLI 形式、stdin JSON 入力、stdout schema は同 SKILL.md を参照。

### Result

- 変更範囲検証結果

### Evidence

- check-change-impact の JSON 結果

### Completion Verification

- violations 0件であること

### Resume-Idempotency

- 読取検査であり再実行可能

## STEP-10: コミット・プッシュ

### Purpose

変更を明示パスでコミットし、main ブランチへ push する。

### Input Resolution

1. SSoT 再構成: `git status`、変更ファイル一覧
2. identifier 保持: Design パス
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-9 の変更範囲検証が合格している

### Procedure

`agentdev-conventional-commits` に従い main ブランチに push する。
STEP-8 の status 変更を commit 対象に含める。
並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git add <path>` で明示パスステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。
スイープ操作は禁止する。
最終的な commit/push は明示パス指定で一括実行する（複数 Design action の並列委譲時も直列集約対象）。

### Result

- commit・push 完了

### Evidence

- commit hash、push 結果、commit 対象パス一覧

### Completion Verification

- 変更が全てコミット済みであり、push が成功していること

### Resume-Idempotency

- commit 前中断時は `git status` から未コミット変更を再検出して再実行する。push 拒絶（external Git failure）時はエラー報告し、同一 commit からリトライする

## STEP-11: 完了報告

### Purpose

保存結果を報告する。

### Input Resolution

1. SSoT 再構成: STEP-10 の結果、保存済み Design 一覧
2. identifier 保持: Design パス群
3. 最小 scalar: なし
4. runtime artifact: follow-up 一覧

### Preconditions

- STEP-10 の push が完了している（no-op 時は STEP-1 判定直後）

### Procedure

完了報告 template に従い、保存した Design 一覧（新規/追記別）、スキップ有無、follow-up（安定契約例外で除外した候補）を出力する。

### Result

- 完了報告出力

### Evidence

- 完了報告本文

### Completion Verification

- 保存・スキップ・follow-up の全数が報告されていること

### Resume-Idempotency

- 報告のみで副作用を持たない

## 関連 STEP

- 前: STEP-5（placement-and-save.md）
- 次: なし（workflow 終了。後続は case-open）

## 関連 Capability Skill

- `agentdev-artifact-validation`: check-entry-existence、check-change-impact
- `agentdev-conventional-commits`: commit message 生成
- `agentdev-git-worktree`: 並列実行安全ステージング
- integrity checker skill（repo 固有）: check_changed_docs.ts（--workflow design-save）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（分離根拠・配置先判定の再分類禁止）
- 不変条件（Design status 昇格は case-close の責務）
- G12（Issue 作成禁止）

## 検証観点（品質ゲート: 適用結果の整合性検証）

- `target_area` 置換結果の整合性（STEP-5 の `search-target-area.ts` 結果と置換後本体の一致）
- Design status の整合性（新規作成時 `status: draft`、既存追記時 `status` 変更なし）
- インデックスの整合性（`docs/designs/README.md` エントリと新規 Design の一致、STEP-6 の `check-entry-existence.ts` 結果）
- 変更範囲の妥当性（STEP-9 の `check-change-impact.ts` 結果）
- 配置一貫性検証入力の整合性（`canonical_owner` が `unknown`・欠落時に警告付き継続、Design ファイルの基本frontmatterは `title`、`status`、`created`、`updated` の4キー）
- 内容の品質（Design 分離基準適合性等）は再検証しない（req-define の QG-1 の責務。STEP-4 の最終確認は分離基準の最終チェックであり内容品質の再審査ではない）
