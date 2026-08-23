---
name: agentdev-workflow-backlog-review
description: "backlog-review command の workflow 実装本体。採用済み成果物（intake/learning/inspect の promoted）の検出・読込・分析・暫定分類、統合・分割判定・depends_on 依存解決、adversarial-review、ユーザー承認、矛盾検出、RU 生成・成功成果物削除、git 永続化の各 STEP を独立 resume point として所有する。USE FOR: backlog-review 実行時の workflow 制御。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# backlog-review workflow スキル

backlog-review command の workflow 実装本体。
`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md` の採用済み成果物を読み込み、分析、統合してユーザーに判定を提示し、承認後に直接 RU（Requirement Unit）を生成する制御構造を所有する。
ユーザー承認は RU 作成承認を兼ねる。

backlog-review command は公開 interface（入出力契約・ガードレール・RU フォーマット委譲契約）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` Design が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-backlog-review.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と backlog-review command の公開契約のみを前提とする。Design ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **Design 内部パスの固定知識化の禁止**: extension に列挙されていない Design 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- backlog-review command から渡される採用済み成果物（`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md`）
- 引数指定時は指定されたファイルパスのみを対象とする。引数なしの場合は全ディレクトリの採用済み成果物を対象とする

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した採用済み成果物の削除
- RU 生成結果、git 永続化結果を含む完了報告（全成功 / partial success / 対象なしのテンプレート別）

## 副作用

- `.agentdev/backlog/req-units/` 配下への RU ファイル作成
- RU 生成が成功した採用済み成果物の削除（`.agentdev/{intake,learning,inspect}/promoted/` 配下）
- `.agentdev/` 配下の変更の commit / push
- 当該 Workflow Skill は worktree root 配下以外を編集しない（backlog-review command の worktree 隔離に従う）

## Control Plane（STEP 一覧）

backlog-review workflow は次の8 STEP で構成する。
各 STEP は resume point を持ち（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）、会話コンテキストに依存せず、durable state（promoted/ 残存成果物、RU-*.md 実ファイルと frontmatter、req-units/ 配下状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 実行前同期・成果物検出 | backlog-review 起動 | 対象成果物一覧（0件時は正常終了） | [references/analysis-composition-and-review.md](references/analysis-composition-and-review.md) |
| STEP-2 | 分析・暫定分類付与 | 対象成果物 1件以上 | 分析結果、RU frontmatter の `tentative_classification` 付与 | [references/analysis-composition-and-review.md](references/analysis-composition-and-review.md) |
| STEP-3 | 統合・分割判定・depends_on 依存解決 | 分析完了 | RU 構成案（統合・分割判定、depends_on 解決結果） | [references/analysis-composition-and-review.md](references/analysis-composition-and-review.md) |
| STEP-4 | review（adversarial-review） | RU 構成案確定 | review 結果反映（矛盾は STEP-6 へ引継ぎ。skip 時は従来フロー継承） | [references/analysis-composition-and-review.md](references/analysis-composition-and-review.md) |
| STEP-5 | HITL（ユーザー承認、RU 生成承認を兼ねる） | RU 構成案確定、review skip または完了 | 承認確定（矛盾なし時は単一承認で RU 生成承認と同時に扱う） | [references/analysis-composition-and-review.md](references/analysis-composition-and-review.md) |
| STEP-6 | 矛盾検出・追加判断 | 承認確定 | 矛盾検出結果（なし / あり+追加判断、partial success 扱い） | [references/contradiction-ru-and-persistence.md](references/contradiction-ru-and-persistence.md) |
| STEP-7 | RU 生成・成功成果物削除 | 承認確定、矛盾処理完了 | `.agentdev/backlog/req-units/RU-*.md`、RU 化成功成果物の削除 | [references/contradiction-ru-and-persistence.md](references/contradiction-ru-and-persistence.md) |
| STEP-8 | Git 永続化・完了報告 | RU 生成・削除完了 | commit/push、完了報告（テンプレート別） | [references/contradiction-ru-and-persistence.md](references/contradiction-ru-and-persistence.md) |

### STEP 間の依存と分岐

- **正常経路**: STEP-1 → STEP-2 → STEP-3 → STEP-4（skip 条件該当時は省略）→ STEP-5 → STEP-6 → STEP-7 → STEP-8
- **構成、review、承認の順序**: STEP-3（統合、分割判定、depends_on 依存解決）で RU 構成案を確定し、続く STEP-4（adversarial-review 呼出、default-on）を経て、STEP-5（ユーザー承認）で承認を確定する。順序の正規所有者は backlog-review command Design「adversarial-review 挿入境界（backlog-review）」節である
- **矛盾なしの場合の単一承認**: 後続の STEP-6 で矛盾が検出されない場合、STEP-5 の統合、分割判定承認を RU 生成承認（STEP-7）としても扱う。単一承認で処理し、追加の HITL は不要
- **対象 0 件**: STEP-1 で正常終了（エラー扱いとしない。「対象なし」を報告）
- **review unresolved 残存時**: RU 生成（STEP-7）、採用済み成果物削除、Git 永続化（STEP-8）等の後続不可逆処理へ進まない

## Resume Protocol（durable state による再開）

会話コンテキストを権威情報源とせず、durable state から current STEP を再構成する（DEC-{N}）。
優先順位は `<workflows/input-resolution-and-durable-state>` Design に従う。

1. SSoT 再構成: `.agentdev/{intake,learning,inspect}/promoted/` と `.agentdev/backlog/req-units/` の実ファイル状態
2. identifier 保持: 成果物パス、RU-ID（RU frontmatter の `source_type`、`generated_by`、`status`、`depends_on`、`tentative_classification`、`sources`）
3. 最小 scalar: RU 生成数、統合・分割数、矛盾数
4. runtime artifact: RU 構成案、adversarial-review findings（REQ-{NNNN} lifecycle）

### current STEP 再構成規則

| durable state の観察結果 | 再開 STEP | 承認状態の解釈 |
|---|---|---|
| promoted に成果物残存、req-units に該当 RU なし | STEP-2（分析から。RU 構成案は promoted 実ファイルから再構築） | 未承認（HITL をやり直す） |
| RU 生成済み（req-units に RU 存在）、対応 promoted が削除済み | STEP-8（git 永続化から） | 承認済み（RU 実ファイルが承認・生成証跡。再承認を求めない） |
| RU 生成済み、対応 promoted が残存 | STEP-7（成果物削除から） | 承認済み |
| 対象成果物 0 件 | 正常終了（「対象なし」報告のみ） | - |

HITL（STEP-5）の承認状態は単独では durable state に記録されない。
RU 実ファイル（STEP-7 の成果物）を承認証跡として扱い、証跡がない場合は未承認と解釈して STEP-5 をやり直す。
不可逆処理（RU 生成、採用済み成果物削除）は承認確定後にのみ実行する。

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-backlog-integration`: 採用済み成果物の読込、分析、統合・分割判定、depends_on 依存解決、矛盾検出、RU 生成ルール（frontmatter、セクション構成、採番、upstream handoff 転記）。backlog-review の review 候補判断と内部手続き
- `agentdev-adversarial-review`: backlog-review の review 呼出（共通契約の正規所有者は adversarial-review Design、REQ-{NNNN}）
- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ（並列実行安全ステージング、構造化エラー形式）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open。document-model Design の文書7分類モデルは extension 経由で参照）

## 候補探索（独立探索手段）

本スキルの既存正規成果物との関係候補の探索は、採用済み成果物に含まれる REQ、Decision、Design、canonical owner 等の明示情報を起点に、README 索引、正規成果物の直接読取、`rg` 等の独立探索手段で行う。
agentdev-traceability の coverage、impact、check を一般文書探索、構造診断、依存関係探索の用途に利用しない。
統合、分割、depends_on 依存解決（STEP-3）の補助 evidence 探索に利用する。

- 探索結果は候補提供であり、統合、分割、depends_on、意味的重複の判断は正規成果物本文と `rg` 等の独立探索での確認後に下す
- promoted artifact 自体を特定の探索機構の正規 node とすることは必須でない

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-backlog-review.yaml`、`kind: workflow-extension`）を読み込む場合がある（DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-backlog-review/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、backlog-review command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **RU フォーマット**: RU-*.md の構造（frontmatter: `source_type`, `generated_by`, `generated_at`, `status`, `depends_on`, `tentative_classification`, `sources` / 本文: Sources, Source Summary, 統合理由, 要件化の方向）は `agentdev-backlog-integration` を正とする。`tentative_classification` は document-model Design（extension 経由）の文書7分類モデル（REQ、挙動Design、カタログDesign、guide、learning維持、作業記録、対象外）のいずれかを記録する。暫定分類は後続 `/agentdev/req-define` で最終確定される候補であり、本 workflow は確定しない
- **session由来RU**: `source_type: chat` かつ `generated_by: session` の RU は、一時成果物ライフサイクル要件と artifact-contracts Design「RU アーティファクト契約（session由来RU）」セクションを正規原本とする（frontmatter 必須フィールド、二段階承認、`agreement_confirmed_at`、session 論理URI、RU 本文必須8セクション、永続ID 採番）。本 workflow は再定義しない
- **単純コピー禁止**: 採用済み成果物のパススルー（単純コピー）を生成しない。`depends_on` に採用済み成果物パスを指定しない（RU-ID のみ許容）
- **削除条件**: RU 生成が成功した採用済み成果物のみを削除する（当該成果物が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ）。RU 化に失敗した成果物、矛盾により除外された成果物は残置する
- **非更新対象**: `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/deferred.md` を更新しない
- **矛盾検出時**: ユーザーの指示を待ち、自動的に解決しない。矛盾する artifact を RU 化せずユーザーに確認する。矛盾しない artifact は通常通り RU 化する（partial success）
- **破壊的変更の明示承認**: 矛盾解消、要件仕様スコープ変更、大量成果物削除等は明示承認を維持する
- **git 永続化**: 並列実行安全ステージングプロシージャに従い明示パスでステージする。生成した RU は `.agentdev/backlog/req-units/` 配下、削除した採用済み成果物は `.agentdev/{intake,learning,inspect}/promoted/` 配下の各パスを `git add <path>`/ `git rm <path>` で明示的にステージする。`.agentdev/` 全体の一括 `git add` は禁止。commit message は `chore(agentdev): generate requirement units via backlog-review`。`git commit -- <paths>`（--only pathspec 形式）を実行し `git push` を行う。失敗時は構造化エラーメッセージを表示して停止する
- **完了報告**: 全て成功時は `.opencode/commands/agentdev/templates/backlog-review/standard.md`、partial success（矛盾あり）時は `partial.md`、採用済み成果物なし時は `zero-promoted.md` に従う。RU 生成結果、git 永続化結果を含め、次のコマンド（`/agentdev/req-define`）を提示する

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`<workflows/input-resolution-and-durable-state>` Design**: durable state 優先順位、current STEP 再構成
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **backlog-review command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
