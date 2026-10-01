# proxy-case-run payload: PR create for Issue #3299（OU-0003・Wave 1）

- 対象操作: Custom Tool `agentdev_gh` の `pr_create`（title / body は本ファイルの verbatim 値を使用。base: `main`, head: `case-3299`）
- 実行前提: branch `case-3299` は push 済み（origin/case-3299 = commit `f4d68185083532998b213f409e350ef396b47316`、worktree `.worktrees/3299-case/`）。実装・検証は委譲 DEL-3299-1 で完了（TS-003 合格、配布依存境界 0 違反、textlint PASS、Skill lint ng 0、traceability check 9/9 pass、check_extensions ok）
- blocker 事象: `agentdev_gh` が gh exit 66（起動環境障害・stderr 空・REQ-093 既知事象）で書込み全滅。委譲内 2回（形式誤り1回＋正形式1回は施工側の起動失敗を含み有効試行としては初回＋規定リトライ1回と同等の扱い）＋ orchestrator 再試行 1回（#3298 で実施・全操作同一障害）、いずれも同一障害。raw gh WRITE は write-guard 禁止どおり未実施
- 本文に関する注記: 委譲セッションで組み立てられた PR 本文の完全文字列は agentdev_gh 障害により成果物化されず、セッション継続も不能のため、orchestrator が委譲最終報告の本文構成仕様・commit 差分・検証結果から忠実に再構成した（本文内に注記あり）
- 実行後処理: PR 作成確認（PR URL readback）→ case-close(#3299)（Workflow Skill `agentdev-workflow-case-close` を load した subagent 委譲: QG-4、squash merge 先 main、Issue #3299 クローズ、Epic #3296 ステータス追跡テーブル更新〔case-close 単一書き手〕）→ Wave 1 fan-in 継続
- 実行後の本 payload: consume 済みとして削除（過去の proxy payload 運用と同一）

## Title（verbatim）

fix(skills): Design 本文への対応記録・見送り記録の新規保存要求を対応記録コメント保存の契約へ同期

## Body（verbatim）

```markdown
## 概要

OU-0003（Wave 1・Issue #3299・DEL-3299-1）: REQ-032-025 更新後の見送り記録保存先契約（当該 Case の Issue への対応記録コメントへ保存し、現在 Design 本文へ作業履歴として新規保存しない）を、design-file-manager および case-close 系の実行時投影（src/opencode/skills/**）へ同期し、Design 履歴混入の再生成経路を実行時投影から遮断した。Definition 面（REQ-032-025 行、docs/designs/skills/agentdev-design-file-manager.md、docs/designs/commands/case-close.md）は Definition PR #3294（commit 76e43819）で merge 済みであり、本 PR は実現面のみを扱う。docs/** は編集していない。

※ 本 PR 本文は、実行担当サブエージェントの agentdev_gh pr_create が gh exit 66 持続障害で失敗したため、委譲内で組み立てられた本文構成仕様に基づき case-auto orchestration が再構成した proxy 実行版である。

## 実行識別情報

- adf_case: #3293 (Root)
- adf_execution_unit: OU-0003/Issue #3299 (standard)
- adf_delegation: DEL-3299-1
- adf_harness_ref: N/A

## 実装内容

RA-001（design-file-manager 実行時投影の保存契約同期）:

- `src/opencode/skills/agentdev-design-file-manager/SKILL.md`: accepted 昇格の契約を「Design 本体に `## 対応記録` 標準形式セクションを設け記録する」から「Design status frontmatter と Design 管理インデックス（docs/designs/README.md の status 列）の状態更新のみを行い、Design 本文へ作業履歴・評価記録を追記しない。昇格評価の証跡（評価契機、評価根拠、対象 Case/PR、REQ との整合確認結果）は当該 Case の Issue への対応記録コメントに保存する」へ更新。状態遷移とインデックス status 列との整合維持要求は維持
- `src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md`: 「accepted 昇格時の対応記録」節を同契約へ同期（4必須項目の保存先を対応記録コメントへ）。見送り記録は対応記録コメントに保存し現在 Design 本文へ作業履歴として新規保存しない、再評価契機を持つ未解決の見送り事項は追跡Issue として育成できる、既存 Design 本文に残存する対応記録節の除去は純化処理の対象であり本節は再生成防止の契約のみを所有する、を明記

RA-002（case-close 系部分の見送り記録語彙同期）:

- `src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md`: Design 状態評価テーブル (c) 見送りの処理を「対応記録コメントの検証差分へ記録し、Design ファイル本体へ最小限の経緯記録を追記する」から「対応記録コメント（検証差分節）へ記録し、現在 Design 本文へ作業履歴として新規保存しない」へ更新。見送り記録の保存先列挙から Design ファイル本体を除去（履歴チャネル〔対応記録コメント〕に限定）。冪等（再実行）と Resume-Idempotency の「既存の見送り記録を評価結果として認定」の参照先を「対応記録コメントに保存された既存の見送り記録」へ同期（REQ-032-026 冪等認定の参照先同期、2箇所）

トレーサビリティ:

- `traceability/agentdev-design-file-manager.yaml`: SKILL.md・design-lifecycle-application.md へ REQ-032-025 の implementation 宣言を追加
- `traceability/agentdev-workflow-case-close.yaml`: docs-and-design-promotion.md へ REQ-032-025/REQ-032-026 の implementation 宣言を追加

維持した要求（保存先のみ変更）: 評価の実施、評価結果の確定、追跡可能性（REQ-032-024/025/026）、Design status と追跡情報源の整合（REQ-001-026/028）、全件評価ゲート、見送り（評価実施・確定不可）と未評価（評価未実施）の区別記録、新規の一時成果物種別・新規ドメイン状態の不作成（AG-002）。

対象外（スコープ遵守）: docs/designs/** 正典（Design 本体の編集・`## 対応記録` 見出し除去は OU-0004 の純化スイープ担当）、case-auto 系（OU-0001）・case-ready 系（OU-0002）対象ファイル、templates/pr_desc.md（保存先要求文言なしと判定し変更せず）。

### adversarial-review skip 記録

- 判定理由: Issue 本文に非発動の記録済み（Root Case #3293 本文の skip 判定・REQ-015-003）。本委譲は Definition PR #3294 で合意済みの REQ-032-025 行および Design 正典（agentdev-design-file-manager.md・case-close.md）の既定文言を実行時投影へ同一変更で反映する実現面同期であり、実装方針の新規選択・規範間優先関係の新規確定・対象範囲の変更を含まない
- 代替自己反証（却下案1）: 見送り記録の保存先として対応記録コメントと Design 本体の併用を維持する案 → REQ-032-025 更新後契約（Design 本体への新規保存禁止）と矛盾するため却下
- 代替自己反証（却下案2）: 既存 Design 本文の対応記録節を本 Issue で除去する案 → OU-0004（純化スイープ）の担当範囲であり対象範囲拡大となるため却下（Design 正典の移設契約に従い純化時に対応記録コメントへ移設）
- unresolved な本質的争点・ユーザー判断事項: なし

## 完了条件

- [x] Design 本文への作業履歴新規生成を要求する契約記述・実行時投影・テンプレートの残存が 0 件であること（TS-003 pass_criteria）— 修正前 6 箇所を検出・修正、再検証で残存 0 件
- [x] 評価の実施、評価結果の確定、追跡可能性（REQ-032-024/025/026）、Design status と追跡情報源の整合（REQ-001-026/028）の要求が維持されていること — 全件評価ゲート・見送り/未評価区別・status 列同時更新・Design 一覧表整合の維持を確認
- [x] REQ-032-026 の冪等認定の参照先が履歴チャネル（対応記録コメント）の見送り記録へ同期されていること — docs-and-design-promotion.md 2箇所を同期
- [x] 変更が design-file-manager・case-close 系対象ファイルに限定されており、case-auto 系（OU-0001）・case-ready 系（OU-0002）の対象変更を含まないこと — 変更は 3 skill ファイル + traceability sidecar 2件のみ

（チェックボックスは実装側の完了申告。最終評価は case-close QG-4 の責務）

## テスト結果

- id: TS-003（target_item: AG-002）: **合格**
  - verification: design-file-manager（SKILL.md、references/）、case-close の全参照ファイル、workflow-templates/templates/ を確認し、accepted 昇格・見送り処理が Design 本文への作業履歴の新規生成を要求する記述・テンプレート・生成処理を列挙（修正前 6 箇所）。Design 履歴混入を生成する既存テスト・テンプレートの特定を実施（design-file-manager の search-target-area.ts は target_area 検索のみで対象外、テンプレートに生成要求なし、生成スクリプトなしと確認）
  - pass_criteria 達成: 残存 0 件、評価実施・確定・追跡可能性・status/インデックス整合の要求維持、冪等認定参照先の履歴チャネル同期
  - 実行 cwd: worktree root（.worktrees/3299-case）、commit f4d68185 時点

## 品質メトリクス

| 検査 | 結果 |
|---|---|
| TS-003 test-fix ループ | ✅ 合格（残存 0 件） |
| distribution boundary（--profile source、worktree HEAD） | ✅ 違反 0 件（base baseline 0 件と同値） |
| textlint gate | ✅ PASS（545 ファイル、hard 違反 0） |
| Skill 構造 lint（lint_skills） | ✅ ng 0（warning 1 は既知の description aggregate budget 傾向管理・本変更無関係） |
| traceability check（REQ-032-025/026 スコープ） | ✅ 9/9 pass（sidecar implementation 宣言追加後） |
| targeted docs guard | ✅ 適用外（case-run profile は docs/ 系対象。本変更は src/opencode 配布物のみ） |
| check_extensions | ✅ ok（違反 0） |
| 対象範囲遵守 | ✅ design-file-manager・case-close 系 + traceability sidecar のみ |
| worktree 隔離・tsconfig 変更検出 | ✅ worktree 内のみ・tsconfig 変更なし |

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | finding 差分（新規/修正済み/既出/撤回/無効） |
|---|---|---|---|
| case-run | TS-003 test-fix ループ | 合格 | 新規: 修正前 6 箇所の Design 本体保存要求 → 修正済み（残存 0） |
| case-run | distribution boundary（source） | 違反 0 件 | 新規なし |
| case-run | textlint gate | PASS | 新規なし |
| case-run | Skill 構造 lint | ng 0 | 既出: description aggregate budget warning 1（base 同一・傾向管理） |
| case-run | traceability check（REQ-032-025/026） | pass 9 / fail 0 | 修正済み: sidecar implementation 宣言追加 |
| case-run | targeted docs guard | 適用外（記録） | 無効: case-run profile の appliesTo が src/opencode を対象外とするため |
| case-run | check_extensions | ok | 新規なし |

## Findings/ Capture候補

### intake

該当なし

### learning

1. targeted docs guard の case-run workflow profile は src/opencode 配下の配布物変更を appliesTo とせず、--files 明示指定でも TARGET-EMPTY（strict fail）となる。src/opencode 配布物のみの変更では docs-check profile（appliesTo 広域）で実行するのが実態に合致する。発見元: check_changed_docs.ts 実行時の files_checked 空確認。分類: learning

## Design確定候補

該当なし

## 関連Issue

Refs: #3299
Parent: #3296
Root Case: #3293
```
