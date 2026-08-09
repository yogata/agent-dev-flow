---
description: 採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する
---

# Backlog レビュー

`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md` の採用済み成果物を読み込み、分析、統合してユーザーに判定を提示し、承認後に直接 RU を生成する。

**このコマンドはユーザー承認後に RU を生成する。
ユーザー承認は RU 作成承認を兼ねる。
**

## 入力

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの採用済み成果物）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの採用済み成果物）
- `.agentdev/inspect/promoted/*.md`（inspect パイプラインからの採用済み成果物）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、全ディレクトリの採用済み成果物を対象とする

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した採用済み成果物の削除

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/backlog-review.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## RU フォーマット

RU-*.md の構造（frontmatter: `source_type`, `generated_by`, `generated_at`, `status`, `depends_on`, `tentative_classification`, `sources` / 本文: Sources, Source Summary, 統合理由, 要件化の方向）は `agentdev-backlog-integration` を正とする。`tentative_classification` は document-model SPEC（extension 経由）の文書7分類モデル（REQ、挙動SPEC、カタログSPEC、guide、learning維持、作業記録、対象外）のいずれかを記録する（REQ）。

## session由来RU 生成形式（参照）

`source_type: chat` かつ `generated_by: session` のRU（session由来RU）の生成形式は、一時成果物ライフサイクル要件と artifact-contracts SPEC「RU アーティファクト契約（session由来RU）」セクションを正規原本とする。本コマンドは frontmatter 必須フィールド、二段階承認、`agreement_confirmed_at`、session 論理URI、RU 本文必須8セクション、永続ID 採番、`tentative_classification` の各要件を同 SPEC へ委譲し、再定義しない

## 手順

### Step 1: 実行前同期

`git pull --ff-only` を実行する。
失敗時は構造化エラーメッセージを表示して停止する（`agentdev-git-worktree` と同一のエラー形式）。

### Step 2: 成果物検出

引数の有無に応じて対象を切り替える:

**引数なしの場合**: 三ディレクトリから採用済み成果物を検出:
- `.agentdev/intake/promoted/*.md`
- `.agentdev/learning/promoted/*.md`
- `.agentdev/inspect/promoted/*.md`

**引数ありの場合**: 指定されたファイルパスのみを対象。
存在しないパスはエラー報告してスキップ。

検出結果の判定:
- **0件**: 正常終了（エラー扱いとしない）。完了報告で「対象なし」と報告
- **1件以上**: ファイルパス昇順で Step 3 へ

### Step 3: 成果物読み込み、分析 + 暫定分類付与

分析基準、前工程からの引き継ぎメタデータ付与ルールは `agentdev-backlog-integration` を参照

**暫定分類付与（REQ）**: 各 RU 候補について、document-model SPEC（extension 経由）の文書7分類モデル（REQ、挙動SPEC、カタログSPEC、guide、learning維持、作業記録、対象外）を参照して暫定分類を付与する。
暫定分類は後続 `/agentdev/req-define` の Step 5-2 で最終確定される候補であり、本コマンドが確定しない。
分析結果と併せて RU frontmatter に `tentative_classification` として記録する。

### Step 4: 統合、分割判定 + depends_on 依存解決 + ユーザー承認

統合、分割判定基準、depends_on 依存解決ルールは `agentdev-backlog-integration` を参照

**構成、review、承認の順序（REQ-015-008）**: Step 4 前半（統合、分割判定、depends_on 依存解決）で RU 構成案を確定し、続く Step 4-1（adversarial-review 呼出、default-on）を経て、Step 4 後半（ユーザー承認）で承認を確定する。構成、review、承認の順序の正規所有者は backlog-review command SPEC「adversarial-review 挿入境界（経路E）」節である。

**矛盾なしの場合の単一承認（REQ）**: 後続の Step 5 で矛盾が検出されない場合、本 Step 4 の統合、分割判定承認を RU 生成承認（Step 5/6）としても扱う。
単一承認で処理し、追加の HITL は不要。

### Step 4-1: adversarial-review 呼出（経路E、REQ-015-008）

backlog-review 経路E の adversarial-review 挿入境界。Step 4 前半（構成）完了後、Step 4 後半（承認）前に挿入する。挿入境界、発動条件、順序、矛盾取扱いの正規所有者は backlog-review command SPEC「adversarial-review 挿入境界（経路E）」節であり、本 Step は実行時投影先である。候補判断基準、内部手続きの詳細は `agentdev-backlog-integration` を参照。

**発動条件判定（REQ-015-001/002/003）**: backlog-review は adversarial-review を原則実行する（default-on、REQ-015-002）。RU 構成案（統合・分割判定、depends_on 依存解決）に意味的決定が存在する場合に発動する。ユーザー明示指定は通常発動の必須条件ではない。発動条件判定 Step と review 呼出 Step を分離する（REQ-015-001）。

- **skip 条件**: RU 構成要素が1件のみ（統合・分割判定不要、depends_on 解決不要）で矛盾検出対象が存在しない場合、省略して従来フロー（Step 4 後半以降）を継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない
- **ユーザー明示指定時の必須実行**: ユーザーが明示的に adversarial-review を指定した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）

**review 呼出（REQ-015-001）**: 発動条件該当時、`agentdev-adversarial-review` を起動する。審議対象は Step 4 前半で確定した RU 構成案（統合・分割判定結果、depends_on 解決結果、暫定分類付与結果）。呼出契約、返却契約、副作用境界は `agentdev-adversarial-review` と delegation-contracts SPEC（`semantic_review`、書き込み禁止型）を正とする。

**矛盾の扱い（REQ-015-008）**: review 審議で採用済み成果物間の矛盾が指摘された場合、当該矛盾は Step 5（既存矛盾検出）へ引き渡す。adversarial-review 自身は矛盾を自動解決せず、矛盾の判定、partial success 扱い、ユーザー追加判断への委ねは Step 5 の既存矛盾検出ロジックが正である。

**従来フロー維持（REQ-015-003）**: skip 条件該当時、呼出失敗時（REQ-014-010）のいずれの場合も、従来フロー（Step 4 後半以降）を維持する。review 挿入境界は既存 Step を追加、削除、並べ替えしない。

**accepted finding 反映と再 review（REQ-014-006/007）**: accepted finding の RU 構成案への反映は本コマンド（呼出元）の責務である。反映後に RU 構成案の意味内容が変更された場合、必要な既存検証（depends_on 再解決、矛盾検出再実行）を行い、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる。同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない。

**unresolved 時の取扱い（REQ-014-009）**: unresolved な本質的争点またはユーザー判断事項が残る場合、RU 生成（Step 6）、採用済み成果物削除（Step 7）、Git 永続化（Step 8）等の後続不可逆処理へ進まない。

### Step 5: 矛盾検出 + 必要に応じて追加判断

矛盾検出ロジック、出力形式は `agentdev-backlog-integration` を参照

**矛盾検出時の追加判断（REQ）**: 矛盾が検出された場合のみ、ユーザーに追加判断を求める。
矛盾する artifact を RU 化せずユーザーに確認する。
矛盾しない artifact は通常通り RU 化する（partial success）。
自動解決しない（G05）

### Step 6: RU 生成

RU 生成ルール、frontmatter スキーマ、depends_on 検証は `agentdev-backlog-integration` を参照

**session由来RU の場合**: `source_type: chat`、`generated_by: session` のRU は「session由来RU 生成形式（参照）」セクションに従う。二段階承認、frontmatter 必須フィールド、session 論理URI、RU 本文必須8セクション、採番、保存手続きは正規原本（一時成果物ライフサイクル要件、artifact-contracts SPEC「RU アーティファクト契約（session由来RU）」）へ委譲する

### Step 7: 成功成果物の削除

RU 生成が成功した採用済み成果物のみを削除する:

- **削除条件**: 当該成果物が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ
- **残置対象**: RU 化に失敗した成果物、矛盾により除外された成果物
- 削除結果を記録する

### Step 8: Git 永続化

`.agentdev/` 配下の変更を commit/ push する:

- `git diff --name-only` で `.agentdev/` 配下の変更を確認
- **変更なし時**: commit/push せず完了報告で「変更なし」と報告
- **変更あり時**:
 1. 並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い明示パスでステージする。
 生成した RU は `.agentdev/backlog/req-units/` 配下、削除した採用済み成果物は `.agentdev/{intake,learning,inspect}/promoted/` 配下の各パスを `git add <path>`/ `git rm <path>` で明示的にステージする。
 `.agentdev/` 全体の一括 `git add` は禁止
 2. commit message: `chore(agentdev): generate requirement units via backlog-review`
 3. `git commit -- <paths>`（--only pathspec 形式）を実行し、`git push` を行う。失敗時は構造化エラーメッセージを表示して停止

### Step 9: 完了報告

完了報告 → 完了報告templateに従って出力:
- 全て成功 → `.opencode/commands/agentdev/templates/backlog-review/standard.md`
- partial success（矛盾あり）→ `.opencode/commands/agentdev/templates/backlog-review/partial.md`
- 採用済み成果物なし → `.opencode/commands/agentdev/templates/backlog-review/zero-promoted.md`

RU 生成結果、git 永続化結果を含める。次のコマンド: `/agentdev/req-define`

## ガードレール

- G01: REQ ファイルの保存を行わない（`req-save` が担当）
- G02: GitHub Issue の作成を行わない（`case-open` が担当）
- G03: 採用済み成果物の単純コピー（パススルー）を生成しない
- G04: `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/deferred.md` を更新しない
- G05: 矛盾検出時はユーザーの指示を待ち、自動的に解決しない
- G06: RU 生成に失敗した成果物は削除しない
- G07: depends_on に採用済み成果物パスを指定しない。RU-ID のみ許容
- G08: 破壊的変更（矛盾解消、要件仕様スコープ変更、大量成果物削除等）は明示承認を維持する（REQ）



