---
name: agentdev-workflow-intake-promote
description: "intake-promote command の workflow 実装本体。inbox 内 intake item の classification（確認・読込・評価・暫定分類・自律確定候補判定）、review（adversarial-review 経路C）、HITL（ユーザー判断必要 item の承認・分類確定）、persistence（採用 item 整形・promoted 保存）、destructive handling（振り分け・inbox 削除・破壊的変更の明示承認・git 永続化）の各 STEP を独立 resume point として所有する。USE FOR: intake-promote 実行時の workflow 制御。DO NOT USE FOR: inbox item の新規保存、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# intake-promote workflow スキル

intake-promote command の workflow 実装本体。
`.agentdev/intake/inbox/` 内の intake item を直接読み込み、内部 review フェーズで分類したのち、採用 item を `backlog-review` に渡せる採用済み成果物に整形する制御構造を所有する。
classification → review → HITL → persistence → destructive handling の各段階を独立 resume point として構成する。

intake-promote command は公開 interface（入出力契約・ガードレール・分類値契約）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。
各 item の分類確定は、横断契約Designの詳細判定表に基づき、取得可能な根拠から一意に確定できる item を自律確定し、ユーザー判断が必要な item のみを HITL 対象とする（後述「自律確定とHITL境界」）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` Design が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-intake-promote.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と intake-promote command の公開契約のみを前提とする。Design ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **Design 内部パスの固定知識化の禁止**: extension に列挙されていない Design 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- intake-promote command から渡される intake item 群（`.agentdev/intake/inbox/` 内の Markdown ファイル）
- ユーザーによる追加コンテキスト、分類修正指示（対話的に）

## 出力

- 採用 item の採用済み成果物（`.agentdev/intake/promoted/*.md`、フラット構造、`backlog-review` 用）
- 分類結果レポート（採用/ 保留/ 却下）
- git 永続化結果を含む完了報告

## 副作用

- `.agentdev/intake/promoted/` 配下へのファイル作成
- 採用 item の inbox 元ファイル削除、reject item の即時削除（保留 item は inbox に残置）
- `.agentdev/intake/` 配下の変更の commit / push
- 当該 Workflow Skill は worktree root 配下以外を編集しない（intake-promote command の worktree 隔離に従う）

## Control Plane（STEP 一覧）

intake-promote workflow は次の6 STEP で構成する。
各 STEP は resume point を持ち（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）、classification / review / HITL / persistence / destructive handling の5段階がそれぞれ独立した resume point である。
会話コンテキストに依存せず、durable state（inbox / promoted の実ファイル状態、分類確定状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | classification（inbox 確認・item 読込・評価・暫定分類提示・自律確定候補判定） | inbox item 存在 | 暫定分類表（採用/保留/却下、根拠、自律確定候補/ユーザー判断必要の判定） | [references/classification-and-review.md](references/classification-and-review.md) |
| STEP-2 | review（adversarial-review 経路C） | 暫定分類の意味的決定が存在、またはユーザー明示指定 | review 経由を要する自律確定候補は review 完了後に確定。反映済み暫定分類（skip 時は STEP-1 結果をそのまま継承） | [references/classification-and-review.md](references/classification-and-review.md) |
| STEP-3 | HITL（ユーザー確認・分類承認） | ユーザー判断必要 item が残存（全 item 自律確定時は HITL 提示を省略し確定内容を報告） | 分類確定（自律確定 item は根拠に基づく確定、ユーザー判断必要 item はユーザー承認済み） | [references/hitl-persistence-and-destructive.md](references/hitl-persistence-and-destructive.md) |
| STEP-4 | persistence（採用 item 整形・promoted 保存） | 分類確定（採用 item あり） | `.agentdev/intake/promoted/` 配下の採用済み成果物 | [references/hitl-persistence-and-destructive.md](references/hitl-persistence-and-destructive.md) |
| STEP-5 | destructive handling（振り分け・削除・git 永続化） | 分類確定 + 採用済み成果物保存済み（保留のみ確定時は振り分けから） | inbox 振り分け完了（採用削除・保留残置・reject 即時削除）、commit/push 済み | [references/hitl-persistence-and-destructive.md](references/hitl-persistence-and-destructive.md) |
| STEP-6 | 完了報告 | 振り分け・永続化完了 | 分類結果と git 永続化結果を含む完了報告 | [references/hitl-persistence-and-destructive.md](references/hitl-persistence-and-destructive.md) |

### STEP 間の依存と分岐

- **正常経路**: STEP-1 → STEP-2（skip 条件該当時は省略）→ STEP-3（ユーザー判断必要 item のみ）→ STEP-4（採用 item あり時）→ STEP-5 → STEP-6
- **全 item 自律確定時**: STEP-3 の HITL 提示を省略し、確定内容（分類、主要根拠、HITL不要理由）を報告して STEP-4 へ進む
- **保留・却下のみ確定時**: STEP-3 → STEP-5（STEP-4 を省略し振り分けから実行）
- **inbox 空**: STEP-1 で終了（HITL を発生させない「対象なし」報告として正常完了）
- **review unresolved 残存時**: 該当 item は自律確定せず STEP-3 の既存 HITL 経由で扱い、保存、inbox 削除等の不可逆処理へ進まない

## 自律確定とHITL境界

各 item の分類確定は、横断契約Design（extension 経由で解決）「promote系判断確定とHITL境界」節の詳細判定表（自律確定可能要件、HITL移送条件、判定と運用の共通規則）に基づいて行う。本スキルは詳細判定表を重複保持しない（DEC-{N}）。

- **判定位置**（intake-promote command Design「自律確定の判定位置とHITLフォールバック」節）:
  - classification（STEP-1）: 取得可能な根拠から採用・保留・却下を一意に確定できる item は自律確定候補とする
  - review（STEP-2）: 自律確定候補のうち対論型レビューが必要な item は review を経た後に確定する
  - HITL（STEP-3）: ユーザー判断が必要な item のみを HITL 対象とする（REQ-{NNNN}-{NNN}）
  - persistence（STEP-4、STEP-5）: 確定済み分類に従い自動実行する
- **部分自律確定**: 同一実行内に自律確定可能 item とユーザー判断必要 item が混在する場合、未決項目に依存しない item を先行確定し、ユーザー判断必要 item のみ HITL 対象とする
- **HITL 提示形式**: STEP-3 ではユーザー判断が必要な item のみを提示し、自律確定済み item は確定内容の報告にとどめる
- **証跡**: 自律確定 item の判定結果、主要根拠、HITL不要理由は既存の分類結果、完了報告を優先利用して記録し、新規永続成果物を必須としない
- **空入力**: 処理対象が空の場合は HITL を発生させず正常な「対象なし」として完了する（STEP-1 の inbox 空分岐）
- **安全境界**: 破壊的変更の明示承認（command 側ガードレール G18）等、明示承認そのものを安全境界と要求する契約は自律確定によって迂回しない

## Resume Protocol（durable state による再開）

会話コンテキストを権威情報源とせず、durable state から current STEP を再構成する（DEC-{N}）。
優先順位は `<workflows/input-resolution-and-durable-state>` Design に従う。

1. SSoT 再構成: `.agentdev/intake/inbox/` と `.agentdev/intake/promoted/` の実ファイル状態
2. identifier 保持: item ファイルパス、採用済み成果物パス
3. 最小 scalar: 採用・保留・却下の件数
4. runtime artifact: 暫定分類表、adversarial-review findings（REQ-{NNNN} lifecycle）

### current STEP 再構成規則

| durable state の観察結果 | 再開 STEP | 承認状態の解釈 |
|---|---|---|
| inbox に item 残存、promoted に対応成果物なし | STEP-1 | 未確定（暫定分類と自律確定候補判定をやり直し、ユーザー判断必要 item があれば HITL をやり直す） |
| promoted に採用済み成果物保存済み、inbox 元ファイル残存 | STEP-5 | 承認済み（persistence 完了の実ファイルが承認証跡。再承認を求めない） |
| inbox が空、promoted に成果物存在、commit 未実行 | STEP-5（git 永続化から） | 承認済み |
| reject 相当の削除完了、commit に却下理由未記録 | STEP-5（commit message 確定から） | 承認済み |
| 保留 item のみ残存、他の振り分け完了 | STEP-5 の残処理または STEP-6 | 承認済み |
| 全 item の振り分けと commit/push 完了 | STEP-6（完了報告のみ） | 承認済み |

HITL（STEP-3）の承認状態は単独では durable state に記録されない。
そのため、persistence の成果物（promoted 実ファイル）を承認証跡として扱い、証跡がない場合は未確定と解釈して STEP-1（自律確定候補判定を含む）からやり直す。自律確定済み item も同様に persistence の実ファイルをもって確定証跡とする。
不可逆処理（inbox 削除、reject 即時削除）は確定後にのみ実行する。

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-intake-pipeline`: inbox 確認、Review 観点、分類提示形式、採用 item 整形、保存と振り分け、Git 永続化の判定基準。経路C の review 候補判断と内部手続き
- `agentdev-adversarial-review`: 経路C の review 呼出（共通契約の正規所有者は adversarial-review Design、REQ-{NNNN}）
- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ（並列実行安全ステージング、構造化エラー形式）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-intake-promote.yaml`、`kind: workflow-extension`）を読み込む場合がある（DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-intake-promote/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、intake-promote command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **分類承認後の自動実行**: 分類が確定した場合（STEP-3 のユーザー承認、または STEP-1/STEP-2 での自律確定）、STEP-4〜STEP-5（採用 item 整形 / promoted 保存 / inbox 削除 / git pull / commit-push）は追加確認なしで自動実行する。分類未確定、修正中の場合は進まない
- **破壊的変更の明示承認**: inbox 大量削除、重要 item の誤分類是正等の破壊的変更は STEP-3 の分類承認とは別に明示承認を維持する（command 側ガードレール G18 の詳細実装）
- **保存先**: `.agentdev/intake/promoted/` 直下のみ（フラット構造、G16）。整形結果に frontmatter（route/status 等）、重複排除キー、後続成果物参照を含めない（command 不変条件）
- **元 item 不変**: intake item の元の内容は改変しない（整理、構造化のみ、command 不変条件）。元 item の本文に整形結果を書き込まない（G12）
- **accepted/ 廃止**: `.agentdev/intake/accepted/` を参照、使用しない（command 不変条件）
- **git 永続化**: `.agentdev/intake/` 配下の変更のみを対象とする。commit message は `chore(agentdev): review and promote intake items`（Conventional Commits 形式）。reject item を含む場合は commit message に却下理由を含める（AG-{NNN}、監査証跡の補強）。変更なし時は commit/push せず「変更なし」と報告。push 失敗時は構造化エラー形式で停止（完了扱いにしない）
- **実行前同期**: `git pull --ff-only` 失敗時は構造化エラーメッセージを表示して停止する（自動解消しない）
- **完了報告**: template は `.opencode/commands/agentdev/templates/intake-promote/standard.md` に従う。分類結果（採用、保留、却下の件数、一覧。自律確定 item は主要根拠とHITL不要理由を含む）と git 永続化結果を含める

## See Also

- **`<workflows/workflow-contracts>` Design**: promote系判断確定とHITL境界の詳細判定表の集約所有者
- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`<workflows/input-resolution-and-durable-state>` Design**: durable state 優先順位、current STEP 再構成
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **intake-promote command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
