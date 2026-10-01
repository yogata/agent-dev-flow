# proxy-case-close payload: merge & close for Issue #3299（OU-0003・Wave 1・差し戻し修正済み HEAD）

- 対象操作: Custom Tool `agentdev_gh` 相当の GitHub 書込み 5操作（順序固定。本文中の verbatim 値を使用）
  - ① `issue_update` #3299（body = 下記「① issue_update #3299 用 最終本文（verbatim）」。完了条件 checkbox 4件 [x] 化 + 「## 完了報告」節追記済みの全体置換本文）
  - ② `pr_update` PR #3307（title = 下記「② pr_update PR #3307 用 新 title（verbatim）」。GitHub auto-close 回避のため merge 前に Refs 追記。squash commit subject は PR title から採られる）
  - ③ `pr_merge` PR #3307（method: squash、base: main。head case-3299 = 5448916f）
  - ④ `issue_close` #3299（reason: completed）
  - ⑤ `comment_create` #3299（body = 下記「⑤ comment_create #3299 用 対応記録コメント（verbatim）」）
- 実行前提: PR #3307 は OPEN・MERGEABLE・base main・head case-3299（commit 5448916f = case-run 差し戻し修正「docs/designs/ パス参照の節名参照化」2 files 2 lines 込み）。Issue #3299 は OPEN・完了条件 checkbox 4件とも未チェック。case-close 再実行委譲（DEL-3299-3・STEP-2 から）で QG-4 4/4 成立・STEP-3 全 gate 合格（targeted docs guard case-close profile failures 0 / warnings 0〔PR 変更 5 files 指定〕・配布依存境界 source profile 违反 0 / 360 files・check_integrity IR-055 findings 0〔親 f4d68185 から新規 delta 0・eliminated 2件の解消維持〕・full integrity suite 2635 pass / 4 fail〔4 fail は環境起因サブプロセス 15秒タイムアウト・3点比較で変更由来 0 と分類・IR-055 実質は --json 直実行で独立確認〕・traceability --req REQ-032-025,REQ-032-026 9 pass / 0 fail・3完全性ゲート合格・Design 棚卸し昇格候補 0 件）
- blocker 事象: `agentdev_gh` が gh exit 66（起動環境障害・stderr 空・REQ-093 既知事象・回復は serve 再起動のみ）で書込み不能。DEL-3299-3 で probe（issue_read #3299）＋持続確認 write 1回（issue_update #3299）の両方が exit 66。raw gh WRITE は禁止どおり未実施
- 冪等性: 各操作の実行前に現在状態を確認し、済んでいる操作（例: title 更新済み・PR merge 済み・Issue close 済み）は skip して次へ。最終状態（PR #3307 merged・#3299 closed・checkbox 4件 [x]・対応記録コメント投稿済み）が揃えばよい
- 補足: リポジトリ設定 deleteBranchOnMerge=true のため merge 後 origin/case-3299 は自動削除される。必須 status checks なし（STEP-5 CI 通過確認は N/A）。--delete-branch 不使用（ブランチ削除は独立 STEP）
- 実行後処理: 本 payload（および同時永続化された他 payload）の consume 削除 → resume procedure（proxy-case-close-docs-current-model-alignment-resume-procedure.md）に従い case-auto 再開

## ① issue_update #3299 用 最終本文（verbatim）

以下の markdown を #3299 の body として全体置換する:

````markdown
Parent: #3296

## 概要
<!-- 【必須】 -->

OU-0003（Wave 1・並列・依存なし）: REQ-032-025 更新後の見送り記録保存先契約（当該 Case の Issue への対応記録コメントへ保存し、現在 Design 本文へ作業履歴として新規保存しない）を、design-file-manager および case-close 系の実行時投影（src/opencode/skills/**）へ同期し、Design 履歴混入の再生成経路を実行時投影から遮断する（AG-002・RA-001・RA-002 case-close 系部分）。Definition 面（REQ-032-025 行、docs/designs/skills/agentdev-design-file-manager.md、docs/designs/commands/case-close.md）は Definition PR #3294 として merge 済みであり、本 Issue は実現面のみを扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #3296（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- src/opencode/skills/agentdev-design-file-manager/SKILL.md
- src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md
- src/opencode/skills/agentdev-workflow-case-close/SKILL.md
- src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md、cleanup-and-capture.md、epic-wave-close.md、pr-merge-and-conflict.md
- src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md、pr_desc.md（対応記録・見送り記録の保存先文言）
- src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md、src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md のうち、Design 本文への対応記録・見送り記録保存を要求する記述
- 判定基準: accepted 昇格・見送り処理が Design 本文への対応記録等の作業履歴の新規生成を要求する記述・テンプレート・生成処理のみを変更する。評価の実施、評価結果の確定、追跡可能性の要求自体は維持する

## REQ参照
<!-- 【必須】 -->

REQ-032（REQ-032-025・REQ-032-026。文書種別責務の正は REQ-001-003 / REQ-001-014 / REQ-001-015）

## 提案内容
<!-- 【必須】 -->

- RA-001: src/opencode/skills/agentdev-design-file-manager/ の実行時投影から Design 本文への対応記録新規生成要求を除去し、昇格評価の証跡を既存履歴チャネル（当該 Case の Issue への対応記録コメント）へ保存する手順へ更新する。冪等認定（REQ-032-026 相当）の参照先を履歴チャネルへ同期する
- RA-002（case-close 系部分）: case-close 系 Workflow Skill・reference・テンプレートのうち、見送り記録の Design 本体保存を要求する箇所を、REQ-032-025 更新後の契約と同一の意味（対応記録コメント保存、Design 本体除く、再評価契機を持つ未解決の見送り事項は追跡Issue として育成）へ同期する
- intent: Design 履歴混入の再生成経路を実行時投影から遮断する（AG-002）。Design は現在設計のみを保持し、評価証跡は既存履歴チャネルから復元可能にする
- verification_refs: [TS-003]
- source_items: [AG-002]

## 完了条件
<!-- 【必須】 -->

- [x] Design 本文への作業履歴新規生成を要求する契約記述・実行時投影・テンプレートの残存が 0 件であること（TS-003 pass_criteria）
- [x] 評価の実施、評価結果の確定、追跡可能性（REQ-032-024/025/026）、Design status と追跡情報源の整合（REQ-001-026/028）の要求が維持されていること
- [x] REQ-032-026 の冪等認定の参照先が履歴チャネル（対応記録コメント）の見送り記録へ同期されていること
- [x] 変更が design-file-manager・case-close 系対象ファイルに限定されており、case-auto 系（OU-0001）・case-ready 系（OU-0002）の対象変更を含まないこと

## テスト戦略
<!-- 【必須】 -->

- id: TS-003
  target_item: AG-002
  verification: |
   src/opencode/skills/agentdev-design-file-manager/（SKILL.md、references/）、src/opencode/skills/agentdev-workflow-case-close/ の全参照ファイル、src/opencode/skills/agentdev-workflow-templates/templates/ を確認し、accepted 昇格・見送り処理が Design 本文への対応記録等の作業履歴の新規生成を要求する記述・テンプレート・生成処理を列挙する。Design 履歴混入を生成する既存テスト・テンプレート（存在する場合）を特定し実行する。
  pass_criteria: |
   Design 本文への作業履歴新規生成を要求する契約記述・実行時投影・テンプレート・テストの残存が 0 件。評価の実施、評価結果の確定、追跡可能性、Design status と追跡情報源の整合の要求が維持されていること。REQ-032-026 の冪等認定の参照先が履歴チャネルの見送り記録へ同期されていること。
  on_failure: |
   fix-and-reverify。保存先契約を履歴チャネルへ修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- implementation: src/opencode/skills/agentdev-design-file-manager/SKILL.md
- implementation: src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md
- implementation: src/opencode/skills/agentdev-workflow-case-close/SKILL.md および references/（docs-and-design-promotion.md、cleanup-and-capture.md、epic-wave-close.md、pr-merge-and-conflict.md）
- implementation: src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md、templates/pr_desc.md
- implementation: 上記対象範囲に挙げた保存先文言関連 reference（検索で検出された分のみ）

### 必須品質統制
- implementation 変更 → Skill 品質査読（構造 lint・Command/Skill 参照妥当性）と targeted docs guard・textlint gate。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- REQ-001 の文書種別責務を正とする（REQ-001-020 の現行要件文書優先）。見送り記録の Design 本体保存を決定した accepted Decision は存在しないため、後継 Decision ではなく既存契約の適用（違反状態解消）として処理する（CR-001 解消済み・Definition merge 済み）
- 新しい恒久文書種別や一時状態は追加しない（AG-002）。既存の履歴チャネル（対応記録コメント、追跡Issue、Git 履歴、PR）を利用する

### scope-affecting impact candidate
- docs/designs/commands/case-ready.md と case-revise.md の `## 対応記録` 見出しの除去は OU-0004（Wave 2）の純化スイープが担当する。本 Issue は実行時投影の再生成防止のみを扱い、Design 本体の編集は行わない
- 保存先変更は case-close の Design 状態評価（REQ-032-024〜026）の動作に影響する。case-close 実行時投影は本 Issue で同期されるため、OU-0004 の純化（Wave 2）以降に実行される case-close から新契約が適用される

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-001: concern「design-file-manager 実行時投影の保存契約同期」、responsibility「src/opencode/skills/agentdev-design-file-manager/ の実行時投影（SKILL.md、references/design-lifecycle-application.md）から Design 本文への対応記録新規生成要求を除去し、昇格評価の証跡を既存履歴チャネルへ保存する手順へ更新する。冪等認定（REQ-032-026 相当）の参照先を履歴チャネルへ同期する」、ownership_hints「src/opencode/skills/agentdev-design-file-manager/SKILL.md、src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md、docs/designs/skills/agentdev-design-file-manager.md（ACT-DESIGN-004 と同一変更連鎖。Definition merge 済み）」、intent「Design 履歴混入の再生成経路を実行時投影から遮断する（AG-002）。Design は現在設計のみを保持し、評価証跡は既存履歴チャネルから復元可能にする」、verification_refs「TS-003」、source_items「AG-002」
- RA-002（case-close 系部分のみを本 Issue で実施）: concern「case 系 workflow skill・reference の判断境界・見送り記録語彙同期」、responsibility（case-close 系部分）「見送り記録の Design 本体保存を要求する箇所を対応記録コメント保存の契約へ同期する」、ownership_hints（case-close 系）「src/opencode/skills/agentdev-workflow-case-close/SKILL.md、references/docs-and-design-promotion.md、cleanup-and-capture.md、epic-wave-close.md、pr-merge-and-conflict.md、src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md、templates/pr_desc.md、src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md、src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md」、verification_refs「TS-003」、source_items「AG-002」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #3296 の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0003 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない

## 完了報告

- 対応 PR: #3307（squash merge 先 main）
- 実行: case-close（委譲 DEL-3299-3、STEP-2 から再開。case-run 差し戻し分〔IR-055 新規 delta 2件〕の修正 commit 5448916f を受入して再検証）
- QG-4: **合格**（完了条件 4/4 成立。チェックボックス更新は case-close が別コンテキスト再読込のうえ実施）
- 検証結果: targeted docs guard（case-close profile）0 failures / 0 warnings、distribution boundary 最終 gate 違反 0 件 / 360 files、traceability check（REQ-032-025,REQ-032-026 限定）9 pass / 0 fail かつ 3 完全性ゲート合格、check_integrity IR-055 findings 0 件（親 f4d68185 からの新規 delta 0、eliminated 2 件の解消維持）、full integrity suite 2635 pass / 4 fail（4 fail は全て環境起因サブプロセス 15 秒タイムアウト〔IR-055 実修復回帰 2件・NG21 回帰 2件〕。main root で同一再現、変更領域〔design-file-manager 文面 2行〕と非交差のため変更由来 0、IR-055 実質は --json 直実行で 0 を独立確認）
- Design 状態評価（棚卸し制）: 昇格候補 0 件（本 Case 変更に docs/designs/ 配下の変更なし、PR 本文の Design確定候補「該当なし」）
- 対応記録: 本 Issue の対応記録コメントを参照
````

## ② pr_update PR #3307 用 新 title（verbatim）

```
fix(skills): Design 本文への対応記録・見送り記録の新規保存要求を対応記録コメント保存の契約へ同期 (Refs #3299)
```

## ③ pr_merge 要求行

```
PR #3307 を squash merge（base: main、head: case-3299 = 5448916f、merge commit subject は ②適用後の PR title 使用。--delete-branch 不使用、ブランチ削除は独立 STEP）
```

## ④ issue_close 要求行

```
Issue #3299 を close（reason: completed）
```

## ⑤ comment_create #3299 用 対応記録コメント（verbatim）

````markdown
## 対応記録

### 対応日時

2026-10-01

### 対応内容

- RA-001: `src/opencode/skills/agentdev-design-file-manager/SKILL.md`、`references/design-lifecycle-application.md` — accepted 昇格の契約を「Design 本体への対応記録・見送り記録の新規保存」から「Design status frontmatter と Design 管理インデックス（Design README 一覧の status 列）の状態更新のみを行い、評価証跡（評価契機・評価根拠・対象 Case/PR・REQ 整合確認結果）は当該 Case の Issue への対応記録コメントへ保存」へ同期。冪等認定（REQ-032-026 相当）の参照先を履歴チャネルへ同期
- RA-002（case-close 系部分）: `src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md` — Design 状態評価テーブル (c) 見送りの処理を対応記録コメント（検証差分節）への記録へ同期（Design ファイル本体を保存先列挙から除去）。冪等（再実行）と Resume-Idempotency の見送り記録参照先 2箇所を「対応記録コメントに保存された既存の見送り記録」へ同期（REQ-032-025/026）
- トレーサビリティ: `traceability/agentdev-design-file-manager.yaml`（REQ-032-025 implementation 宣言追加）、`traceability/agentdev-workflow-case-close.yaml`（REQ-032-025/REQ-032-026 implementation 宣言追加）
- 差し戻し対応の経緯: case-close 1回目で full integrity suite の IR-055 runtime-unresolved-reference 新規 delta 2件（変更由来・fail-closed）を検出し case-run へ差し戻し。case-run が commit 5448916f で design-file-manager 契約文の literal `docs/designs/README.md の status 列` 参照を section 名参照へリフレーズし修正。本回（委譲 DEL-3299-3、STEP-2 から再開）で IR-055 新規 delta 0 を再検証し全 gate 合格を確認

### コミット

- 5448916f（5448916f260e1f639cbc7b8cb38553e25b927b05）: fix(skills): reference design placement rules by section name instead of docs path in design-file-manager contract sentences (Refs: #3299)
- PR #3307（base main、squash merge）。squash commit subject は PR title 更新後の値（上記 ②）で確定

### テスト結果

| 検査 | 実行形式 | 結果 |
|---|---|---|
| targeted docs guard（case-close profile） | `check_changed_docs.ts --workflow case-close --files <PR 変更 5 files> --json` | 0 failures / 0 warnings |
| distribution boundary 最終 gate | `check_distribution_boundary_cli.ts --json` | 違反 0 件 / 360 files（rules も 0） |
| check_integrity IR-055 delta | `check_integrity.ts --json` | IR-055 findings 0 件（親 f4d68185 から新規 delta 0・eliminated 2 件の解消維持） |
| full integrity suite | `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`（worktree root） | 2635 pass / 4 fail（4 fail は環境起因サブプロセス 15 秒タイムアウト。main root 同一再現・変更領域非交差で変更由来 0。IR-055 実質は直実行で独立確認） |
| traceability check | `check.ts --root <worktree> --req REQ-032-025,REQ-032-026` | 9 pass / 0 fail、3 完全性ゲート合格 |
| Design 状態評価（棚卸し制） | PR 本文 Design確定候補 + docs/designs/ 変更確認 | 昇格候補 0 件 |
| TS-003 pass_criteria（現 HEAD 再確認） | grep 残存確認（commit 5448916f 時点） | Design 本体新規保存要求の残存 0 件 |

### adversarial-review 判定

- 判定値: 非発動
- 非発動理由: Issue 本文に非発動の記録済み（Root Case #3293 本文の skip 判定・REQ-015-003）。本件は Definition PR #3294 で合意済みの REQ-032-025 行および Design 正典（agentdev-design-file-manager.md・case-close.md）の既定文言を実行時投影へ同一変更で反映する実現面同期であり、実装方針の新規選択・規範間優先関係の新規確定・対象範囲の変更を含まない
- 非発動時の代替自己反証: 却下案1「見送り記録の保存先として対応記録コメントと Design 本体の併用を維持」→ REQ-032-025 更新後契約（Design 本体への新規保存禁止）と矛盾のため却下。却下案2「既存 Design 本文の対応記録節を本 Issue で除去」→ OU-0004（Wave 2 純化スイープ）の担当範囲であり対象範囲拡大のため却下。unresolved な本質的争点・ユーザー判断事項なし

### 検証差分

| 実行工程 | 検証種別 | 検証結果 | finding 差分（新規/修正済み/既出/撤回/無効） |
|---|---|---|---|
| case-close（1回目） | full integrity suite IR-055 delta | fail（新規 2件・fail-closed）→ case-run 差し戻し | 新規: IR-055 runtime-unresolved-reference 2件（＋派生 warning_total_cap 超過 1件） |
| case-run（差し戻し対応） | TS-003 修正・IR-055 解消 | commit 5448916f で修正 | 修正済み: IR-055 2件 eliminated・派生 warning 超過解消 |
| case-close（本回 DEL-3299-3） | check_integrity IR-055 delta | findings 0（added 0） | 修正済み: 前回新規 2件の解消を本回で確認 |
| case-close（本回） | targeted docs guard（case-close profile） | 0 failures / 0 warnings | 既出: 前回同値（0/0） |
| case-close（本回） | distribution boundary 最終 gate | 違反 0 件 / 360 files | 既出: 違反 0 は前回同値（スキャン対象 359→360 は変動のみ） |
| case-close（本回） | traceability check（REQ-032-025/026） | 9 pass / 0 fail・3完全性ゲート合格 | 既出: 前回同値 |
| case-close（本回） | full integrity suite | 2635 pass / 4 fail | 新規: 環境起因サブプロセス 15 秒タイムアウト 4件（3-point comparison〔worktree HEAD / main root / parent f4d68185 変更非交差〕で変更由来 0 と分類、gate 不成立としない。IR-055 は直実行で独立確認済み） |
| case-close（本回） | Design 状態評価（棚卸し制） | 昇格候補 0 件 | 既出: PR 本文「該当なし」・docs/designs/ 変更 0 件 |

### 残課題

- なし（本 Issue スコープ内）。docs/designs/** 正典の純化と既存 Design 本文の対応記録節除去は OU-0004（#3300、Wave 2）が担当する
````
