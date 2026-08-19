---
name: agentdev-workflow-learning-promote
description: "learning-promote command の workflow 実装本体。inbox.md エントリの読込・正規化、問題クラス分類・8軸評価・evaluation-report 生成、廃棄判定・既存対策確認、adversarial-review 経路D、自律確定判定とユーザー判断必要項目の HITL、採用済み成果物生成・deferred 移動・prune・git 永続化の各 STEP を独立 resume point として所有する。USE FOR: learning-promote 実行時の workflow 制御。DO NOT USE FOR: 学びの検知・抽出・inbox.md 蓄積、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# learning-promote workflow スキル

learning-promote command の workflow 実装本体。
`.agentdev/learning/inbox.md` の学びエントリを読み込み、正規化、問題クラス分類、8軸評価、廃棄判定、既存対策確認、自律確定判定（一意に確定できる項目の自律確定）とユーザー判断が必要な項目のみの HITL 承認を経て採用済み成果物を生成する制御構造を所有する。
`.opencode/` への直接配置、直接反映は行わない（反映ルート: promoted → `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`）。

learning-promote command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と learning-promote command の公開契約のみを前提とする。SPEC ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- learning-promote command から渡される `.agentdev/learning/inbox.md`（必須。未処理の学びエントリ）
- `.agentdev/learning/deferred.md`（任意。過去エントリ参照用の living pool）

## 出力

- `.agentdev/learning/evaluation-report.md`（8軸評価レポート、評価根拠中間成果物）
- `.agentdev/learning/promoted/{category}-{name}.md`（採用済み成果物）
- `.agentdev/learning/deferred.md`（inbox からの移動分を追記、prune 適用）
- `.agentdev/learning/inbox.md`（ヘッダーのみにクリア）
- 8軸評価サマリ、判定結果、git 永続化結果を含む完了報告

## 副作用

- `.agentdev/learning/` 配下の inbox.md、deferred.md、evaluation-report.md、promoted/ の更新
- `.agentdev/learning/` 配下の変更の commit / push
- 当該 Workflow Skill は worktree root 配下以外を編集しない（learning-promote command の worktree 隔離に従う）

## Control Plane（STEP 一覧）

learning-promote workflow は次の7 STEP で構成する。
各 STEP は resume point を持ち（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）、会話コンテキストに依存せず、durable state（inbox.md / deferred.md / evaluation-report.md / promoted/ の実ファイル状態、分類確定状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 入力読込・正規化 | inbox.md にエントリ存在 | 正規化済みエントリ群（deferred.md 読込含む） | [references/analysis-and-review.md](references/analysis-and-review.md) |
| STEP-2 | 評価（分類・8軸・evaluation-report） | 正規化済みエントリ確定 | 問題クラス分類、8軸評価スコア、evaluation-report.md 生成・更新 | [references/analysis-and-review.md](references/analysis-and-review.md) |
| STEP-3 | 判定（廃棄判定・既存対策確認） | evaluation-report.md 反映済み | 処分区分判定（11カテゴリ + duplicate）、既存対策照合結果、昇華可能性評価 | [references/analysis-and-review.md](references/analysis-and-review.md) |
| STEP-4 | review（adversarial-review 経路D） | evaluation-report.md に STEP-2/STEP-3 結果反映済み | review 結果反映（evaluation-report 戻しループ含む。skip 時は従来フロー継承） | [references/analysis-and-review.md](references/analysis-and-review.md) |
| STEP-5 | 判定確定（自律確定・HITL） | STEP-3 完了、STEP-4 skip または反映済み | 判定確定（自律確定分はユーザー承認なし、ユーザー判断必要分はユーザー承認済み。promote/defer/reject/duplicate） | [references/hitl-and-persistence.md](references/hitl-and-persistence.md) |
| STEP-6 | 永続化（成果物生成・deferred 移動・prune・commit/push） | 判定確定（自律確定またはユーザー承認） | 採用済み成果物、deferred 移動済み、prune 済み、クリア済み inbox.md、commit/push | [references/hitl-and-persistence.md](references/hitl-and-persistence.md) |
| STEP-7 | 完了報告 | 永続化完了 | 8軸評価サマリ、判定結果、後続ルート、git 永続化結果を含む完了報告 | [references/hitl-and-persistence.md](references/hitl-and-persistence.md) |

### STEP 間の依存と分岐

- **正常経路**: STEP-1 → STEP-2 → STEP-3 → STEP-4（skip 条件該当時は省略）→ STEP-5 → STEP-6 → STEP-7
- **部分自律確定（STEP-5 内）**: 同一実行内に自律確定可能項目とユーザー判断必要項目が混在する場合、未決項目に依存しない自律確定可能項目を先行確定し、ユーザー判断必要項目のみ HITL 対象とする。自律確定可能項目を HITL 待ちにしない
- **全項目自律確定時（STEP-5 内）**: ユーザー判断必要項目が残らない場合、HITL を発生させず STEP-6 へ進む
- **evaluation-report 戻しループ（review 反映時）**: STEP-4 の accepted finding 反映で意味内容が変更された場合、STEP-2 → STEP-3 → STEP-4（発動条件判定）の順で再実行し、再 review 発動条件を満たす場合のみ再 review。停止条件（4点）を満たした時点でループを離脱し STEP-5 へ進む
- **inbox.md 空または不在**: STEP-1 で終了（不在時はエラー終了）。HITL を発生させない
- **unresolved 残存時**: STEP-5（判定確定）、STEP-6（deferred 移動、prune、commit/push）等の不可逆処理へ進まない

## Resume Protocol（durable state による再開）

会話コンテキストを権威情報源とせず、durable state から current STEP を再構成する（DEC-{N}）。
優先順位は `<workflows/input-resolution-and-durable-state>` SPEC に従う。

1. SSoT 再構成: `.agentdev/learning/` 配下の inbox.md、deferred.md、evaluation-report.md、promoted/ の実ファイル状態
2. identifier 保持: エントリ区切り（`---`）、問題クラス、採用済み成果物パス
3. 最小 scalar: promote/defer/reject/duplicate の件数、8軸評価スコア
4. runtime artifact: 正規化結果、adversarial-review findings（REQ-{NNNN} lifecycle）

### current STEP 再構成規則

| durable state の観察結果 | 再開 STEP | 承認状態の解釈 |
|---|---|---|
| inbox.md にエントリ残存、evaluation-report.md なしまたは未反映 | STEP-1 / STEP-2 | 未承認（分析を再構築し HITL をやり直す） |
| evaluation-report.md 生成済み、inbox.md エントリ残存（deferred 未移動）、promoted なし | STEP-3 / STEP-4 / STEP-5 | 未承認（evaluation-report は判定資料であり承認証跡ではない） |
| promoted に採用済み成果物生成済み、または inbox.md クリア・deferred.md 追記済み | STEP-6（残処理から） | 承認済み（永続化成果物が承認証跡。再承認を求めない） |
| inbox.md クリア、promoted なし（全 defer/reject/duplicate） | STEP-6（prune / commit から） | 承認済み |
| 全永続化と commit/push 完了 | STEP-7（完了報告のみ） | 承認済み |

HITL（STEP-5）の承認状態は単独では durable state に記録されない。
採用済み成果物（promoted/）、inbox.md クリア、deferred.md 追記のいずれかを承認証跡として扱い、証跡がない場合は未承認と解釈して STEP-5 をやり直す。
ただし自律確定分の証跡はユーザー承認ではなく evaluation-report.md の自律確定記録（判定結果、主要根拠、HITL 不要理由）であり、当該記録と永続化成果物の双方から再構成できる。
不可逆処理（deferred 移動、prune、採用済み成果物生成）は判定確定（自律確定またはユーザー承認）後にのみ実行する。

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-learning-pipeline`: inbox entry schema、正規化ルール、問題クラス分類基準、8軸評価ディメンション、evaluation-report schema、処分区分（11カテゴリ + duplicate）、既存対策照合、採用済み成果物スキーマ、prune 方針、deferred 移動の原子的操作契約。経路D の review 候補判断と内部手続き
- `agentdev-adversarial-review`: 経路D の review 呼出（共通契約の正規所有者は adversarial-review SPEC、REQ-{NNNN}）
- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ（並列実行安全ステージング、構造化エラー形式）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml`、`kind: workflow-extension`）を読み込む場合がある（DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-learning-promote/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、learning-promote command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **無条件の自動REQ化禁止**: 学びを直接 REQ 化しない。恒久契約（REQ/Decision/SPEC）への昇華可能性を STEP-3 で評価し、昇華可能なもののみ `promoted/` へ出力する。学びは昇華（`promoted/` → `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save`）を経て初めて REQ 化される
- **living pool 維持**: 昇華不能な知見（deferred 判定、情報が断片的、出現回数が少ない等）は `deferred.md` の living pool で維持し、REQ 化しない。`deferred.md` は deferred カテゴリのエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する多状態の living pool である（AG-{NNN}）。終端保管ではなく、次回実行時に再評価の対象となる
- **自律確定と HITL フォールバック**: 問題クラス分類、8軸評価、廃棄判定、昇華可能性、既存対策との関係の評価（STEP-2〜STEP-4）を経て、取得可能な根拠で処置を一意に確定できる項目はユーザー承認なしで確定し、ユーザー判断が必要な項目のみ HITL 対象とする。自律確定はユーザー承認の擬制ではなく、モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない。自律確定可否の詳細判定表（自律確定可能要件、HITL移送条件、判定と運用の共通規則）は横断契約SPEC `<workflows/workflow-contracts>`「promote系判断確定とHITL境界」節が集約所有し、本スキルは判定表を複製しない（extension 経由で解決）。deferred・未処理項目を自動削除しない既存の安全境界は自律確定によって迂回しない。自律確定項目の証跡（判定結果、主要根拠、HITL 不要理由）は evaluation-report.md 等の既存成果物を優先利用し、新規永続成果物を必須としない
- **prune 対象**: staged（採用済み成果物生成済み）/ rejected / duplicate のエントリのみ。deferred / 未処理のエントリは残す。staged エントリ除去時に採用済み成果物の「元learning item/ 根拠」セクションに証拠を保存する。STEP-5 の判定確定（自律確定またはユーザー承認）と同時に prune も承認済みとみなし、追加確認なしで削除する
- **直接反映禁止**: 採用済み成果物は `.agentdev/learning/promoted/` のみに生成する。`.opencode/` 直接書込、`case-run` への直接受け渡しは禁止（`/agentdev/backlog-review` 経由のみ）
- **evaluation-report.md**: 本 workflow が生成、管理する（外部コマンドの事前生成に依存しない）。毎回上書きされ長期履歴ではない
- **破壊的変更の明示承認**: inbox.md 全体強制クリア、大量エントリ一括削除等は STEP-5 の確定（自律確定を含む）とは別に明示承認を維持する
- **git 永続化**: `git add` は `.agentdev/learning/` 配下のみを対象とする（明示パス、`git commit -- <paths>` の --only pathspec 形式）。`.agentdev/` 全体の一括スコープ、スイープ操作は禁止。commit message は `chore(agentdev): promote learning findings`。変更なし時は commit/push せず「変更なし」と報告。push 失敗時は構造化エラー形式で停止（完了扱いにしない）
- **実行前同期**: `git pull --ff-only` 失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の該当形式で表示して停止する（自動解消しない）
- **完了報告**: template は `.opencode/commands/agentdev/templates/learning-promote/standard.md` に従う。8軸評価サマリ、判定結果（promote/defer/reject/duplicate 件数）、後続ルート（`/agentdev/backlog-review`）、git 永続化結果を含める

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`<workflows/input-resolution-and-durable-state>` SPEC**: durable state 優先順位、current STEP 再構成
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **learning-promote command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
