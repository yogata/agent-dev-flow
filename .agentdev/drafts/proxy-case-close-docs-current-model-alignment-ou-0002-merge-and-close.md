# proxy-case-close payload: merge & close for Issue #3298（OU-0002・Wave 1・差し戻し修正済み HEAD）

- 対象操作: Custom Tool `agentdev_gh` 相当の GitHub 書込み 5操作（順序固定。本文中の verbatim 値を使用）
  - ① `issue_update` #3298（body = 下記「① issue_update #3298 用 最終本文（verbatim）」。完了条件 checkbox 3件 [x] 化 + 「## 完了報告」節追記済みの全体置換本文）
  - ② `pr_update` PR #3306（title = 下記「② pr_update PR #3306 用 新 title（verbatim）」。GitHub auto-close 回避のため merge 前に Refs 追記。squash commit subject は PR title から採られる）
  - ③ `pr_merge` PR #3306（method: squash、base: main。head case-3298 = 0b2e1e7b）
  - ④ `issue_close` #3298（reason: completed）
  - ⑤ `comment_create` #3298（body = 下記「⑤ comment_create #3298 用 対応記録コメント（verbatim）」）
- 実行前提: PR #3306 は OPEN・MERGEABLE・base main・head case-3298（commit 0b2e1e7b = case-run 差し戻し修正「契約テスト期待値の現行語彙同期」1 file 1 line 込み）。Issue #3298 は OPEN・完了条件 checkbox 3件とも未チェック。case-close 再実行委譲（DEL-3298-3・STEP-2 から）で QG-4 3/3 合格・STEP-3 全 gate 合格（契約テスト case-ready-definition-readiness 59 pass / 0 fail・bun test ./scripts/ 263 pass / 0 fail・targeted docs guard case-close profile failures 0 / warnings 0〔files_checked 2〕・check_extensions failures 0・配布依存境界 source profile 违反 0・traceability --req REQ-061-003 9 pass / 0 fail・3完全性ゲート合格・full integrity suite 2635 pass / 4 fail〔4 fail は 15s spawn-timeout の環境起因・main root 同一再現・変更領域非交差で無効分類〕・Design 棚卸し draft 0 件・昇格対象なし）
- blocker 事象: `agentdev_gh` が gh exit 66（起動環境障害・stderr 空・REQ-093 既知事象・回復は serve 再起動のみ）で書込み不能。DEL-3298-3 で probe（issue_read #3298）＋持続確認 write 1回（issue_update #3298）の両方が exit 66。raw gh WRITE は禁止どおり未実施
- 冪等性: 各操作の実行前に現在状態を確認し、済んでいる操作（例: title 更新済み・PR merge 済み・Issue close 済み）は skip して次へ。最終状態（PR #3306 merged・#3298 closed・checkbox 3件 [x]・対応記録コメント投稿済み）が揃えばよい
- 補足: リポジトリ設定 deleteBranchOnMerge=true のため merge 後 origin/case-3298 は自動削除される。必須 status checks なし（STEP-5 CI 通過確認は N/A）
- 実行後処理: 本 payload（および同時永続化された他 payload）の consume 削除 → resume procedure（proxy-case-close-docs-current-model-alignment-resume-procedure.md）に従い case-auto 再開

## ① issue_update #3298 用 最終本文（verbatim）

以下の markdown を #3298 の body として全体置換する:

````markdown
Parent: #3296

## 概要
<!-- 【必須】 -->

OU-0002（Wave 1・並列・依存なし）: REQ-061-003 更新後の判断境界（人間に留保された判断〔REQ-096-005〕の新規確定と既存安全境界の操作承認に限定した HITL 境界）を、case-ready 関連の実行時投影（src/opencode/skills/** の Workflow Skill・reference・テンプレート）へ意味的に同期する（AG-001・RA-002 の case-ready 系部分）。Definition 面（REQ-061-003 行、docs/designs/commands/case-ready.md、docs/designs/foundations/system.md の該当節）は Definition PR #3294 として merge 済みであり、本 Issue は実現面のみを扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #3296（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- src/opencode/skills/agentdev-workflow-case-ready/SKILL.md
- src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
- src/opencode/skills/agentdev-workflow-templates/SKILL.md、src/opencode/skills/agentdev-workflow-templates/templates/（case-ready 系のテンプレート文言）
- src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md、src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md、src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md のうち、case-ready の判断境界（Definition 受入・Decision 受理・不整合処理）に対応する旧判断境界語の残存箇所
- 判定基準: 各言及を現行契約上の意味で分類し、旧判断境界を意味として使用する箇所のみ変更する。人間に留保された判断または既存安全境界の操作承認として正当な HITL は維持する。proposed Decision の受理評価は REQ-061-021 の導出ベース判定を維持する

## REQ参照
<!-- 【必須】 -->

REQ-061（REQ-061-003。判断アーキテクチャの正は REQ-096 / DEC-048）

## 提案内容
<!-- 【必須】 -->

- RA-002（case-ready 系部分）: src/opencode の case-ready 関連実行時投影から旧判断境界を、更新後の REQ-061-003・case-ready Design と同一の意味（人間に留保された判断〔REQ-096-005〕の新規確定、または既存の安全境界が要求する操作承認を要する場合に停止し HITL とし、既存の正規契約から導出できる解消と委譲された裁量の範囲内の判断〔作業仮定の明示を含む〕は自律確定とする。人間判断への移送の判定は語の使用だけで行わず REQ-096-005 の留保事項該当性で行う。REQ-096-003、REQ-096-004、REQ-096-006。停止理由は REQ-096-012 の原因分類へ対応）へ同期する
- intent: 正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない（AG-001、RU §2.6）
- verification_refs: [TS-001, TS-002]
- source_items: [AG-001]

## 完了条件
<!-- 【必須】 -->

- [x] src/opencode の case-ready 関連正規文書・配布物において、旧判断境界を意味として使用する残存が 0 件であること（正当な意味として説明できる箇所はその説明を検証記録に残すこと。TS-001 pass_criteria のうち case-ready 系対象。検証記録は対応記録コメント参照）
- [x] case-ready 実行時投影の Definition 受入・Decision 受理・不整合処理の判断境界が、REQ-096-005 の留保事項該当性で人間判断移送を判定する現行境界と一致すること（AC-03）。判断の難易度・確信度・評価器間の不一致・結果状態・唯一解でないことだけを理由とする移送規則が残っていないこと（AC-01 のうち case-ready 系対象。TS-002 突合合格、対応記録コメント参照）
- [x] 変更が case-ready 系対象ファイルに限定されており、case-auto 系（OU-0001）・case-close 系・design-file-manager 系（OU-0003）の対象変更を含まないこと（PR #3306 変更ファイルは case-ready SKILL.md・references/definition-acceptance.md・readiness 契約テスト・traceability sidecar の4ファイルのみ）

## テスト戦略
<!-- 【必須】 -->

- id: TS-001
  target_item: AG-001（case-ready 系対象部分）
  verification: |
   rg '一意に回答|一意確定|新しい意味判断|意味判断が必要' を docs/requirements/、docs/designs/、docs/guides/、src/opencode/ に実行し、残存箇所を列挙する。本 Issue では case-ready 系対象ファイル（上記対象範囲）の残存解消を行い、HITL 発動根拠が旧判断モデル依存の箇所も同様に列挙・解消する。
  pass_criteria: |
   case-ready 系修正対象ファイルにおいて、旧判断境界を意味として使用する残存が 0 件。正当な意味として説明できる箇所はその説明を検証記録に残していること。
  on_failure: |
   fix-and-reverify。残存箇所を現行語彙へ修正し再検証する。正当理由の判定は AG-001 の基準に従う。
- id: TS-002
  target_item: AG-001（case-ready Design 対応節）
  verification: |
   src/opencode/skills/agentdev-workflow-case-ready/SKILL.md の Definition 受入・Decision 受理・不整合処理・HITL 停止関連節を、更新後の REQ-061-003 本文および REQ-096-003〜006/010/012/015 と突き合わせる。
  pass_criteria: |
   いずれの節も判断主体、自律確定範囲、人間判断の発動根拠、停止理由の原因分類が REQ-096 と矛盾しないこと。「新しい意味判断が必要なら HITL」「一意に確定できないなら停止」等の旧境界で読み取れる記述が残っていないこと。proposed Decision の受理評価が REQ-061-021 の導出ベース判定として維持されていること。
  on_failure: |
   fix-and-reverify。該当節を REQ-096 語彙へ修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- implementation: src/opencode/skills/agentdev-workflow-case-ready/SKILL.md
- implementation: src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
- implementation: src/opencode/skills/agentdev-workflow-templates/SKILL.md および templates/ 配下の case-ready 系文言
- implementation: 上記対象範囲に挙げた case-ready 判断境界関連 reference・skill 文言（検索で検出された分のみ）

### 必須品質統制
- implementation 変更 → Skill 品質査読（構造 lint・Command/Skill 参照妥当性）と targeted docs guard・textlint gate。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- DEC-048 / REQ-096 を判断アーキテクチャの正とする。DEC-008 は歴史的判断記録として参照維持し本文を編集しない。DEC-008 frontmatter への相互参照追記は本 Case 対象外・将来 intake（CR-004）

### scope-affecting impact candidate
- docs/designs/foundations/system.md を OU-0001（Wave 1・並列）と共有。system.md の主要編集は Definition PR #3294 で単一実施済みであり、追加修正が生じる場合のみ衝突リスク。重複許容の Wave 1 記録（親 Epic「Wave 重複前置検出」節）に従い、衝突解消担当は後着 merge 側
- src/opencode/skills/agentdev-workflow-case-ready/ は本実行 Case 自身の workflow skill であり、変更は本 lifecycle 以降の実行から有効になる（実行中 lifecycle の動作は開始時に確定済み）
- TS-001 の検索は docs 全体・src/opencode 全体に及ぶが、修正対象は case-ready 系に限定する。横断残存は OU-0001（case-auto 系）・OU-0003（case-close 系）・OU-0008（最終同期）が受け持つ

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-002（case-ready 系部分のみを本 Issue で実施）: concern「case 系 workflow skill・reference の判断境界・見送り記録語彙同期」、responsibility「case-ready に関係する実行時 Workflow Skill・reference・テンプレートのうち旧判断境界語を使用する箇所を、更新後の REQ・Design 契約と同一の意味へ同期する。各言及を現行契約上の意味で分類し、Design 本文書き込みを要求する箇所のみ変更する」、ownership_hints（case-ready 系）「src/opencode/skills/agentdev-workflow-case-ready/SKILL.md、src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md、src/opencode/skills/agentdev-workflow-templates/SKILL.md、src/opencode/skills/agentdev-workflow-templates/templates/、src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md、src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md、src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md」、intent「正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない」、verification_refs「TS-001, TS-002」、source_items「AG-001」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #3296 の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0002 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない

## 完了報告

- 実行結果: 完了。PR #3306 を squash merge（base main）で統合し、本 Issue の完了条件 3 項目すべてを達成した。
- 実装内容: case-ready 実行時投影の判断境界を REQ-061-003 更新後の現行契約（人間に留保された判断〔REQ-096-005〕の新規確定と既存安全境界の操作承認に限定した HITL 境界）へ同期した（agentdev-workflow-case-ready SKILL.md 3箇所、references/definition-acceptance.md 3箇所、traceability sidecar へ REQ-061-003 implementation 対応追加）。契約テスト期待値を現行語彙へ同期した（scripts/self/release/case-ready-definition-readiness.test.ts、case-run 差し戻し分の修正）。
- 主要検証（case-close QG-4 評価、HEAD 0b2e1e7b）: 契約テスト 59 pass / 0 fail。traceability check --req REQ-061-003 pass 9 / fail 0。targeted docs guard（case-close profile）failures 0 / warnings 0。配布依存境界 最終 gate 違反 0 件。check_extensions（IR）failures 0。lint_skills NG 0 / Warning 1（既知傾向管理 warn）。Design 棚卸し draft 0件。bun test ./scripts/ 263 pass / 0 fail。
- 検証差分と対応記録: 対応記録コメント（case-close 工程分の検証差分テーブル）を参照すること。

Refs: #3296
Refs: #3306
````

## ② pr_update PR #3306 用 新 title（verbatim）

```
refactor(case-ready): Definition 受入の判断境界を REQ-061-003 更新後の現行契約へ同期 (Refs #3298)
```

## ③ pr_merge 要求行

```
PR #3306 を squash merge（base: main、head: case-3298 = 0b2e1e7b、merge commit subject は ②適用後の PR title 使用。--delete-branch 不使用）
```

## ④ issue_close 要求行

```
Issue #3298 を close（reason: completed）
```

## ⑤ comment_create #3298 用 対応記録コメント（verbatim）

````markdown
## 対応記録（case-close）: Issue #3298 / PR #3306

case-close の検証記録。対象: Issue #3298 / PR #3306 / HEAD 0b2e1e7b（test expectation 現行語彙同期済み）。前段階（case-run）の PR 本文検証差分セクションとの差分で finding を分類する。

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | 新規 | 修正済み | 既出 | 撤回 | 無効 |
|---|---|---|---|---|---|---|---|
| case-close | QG-4 完了条件評価（Issue #3298 完了条件 3 項目、HEAD 0b2e1e7b 再評価） | 合格（3/3 達成） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-close | 契約テスト case-ready-definition-readiness.test.ts（HEAD 0b2e1e7b 再実行） | 59 pass / 0 fail | 該当なし | TS-003 (a) expectation 不一致（前回 case-close 検出、case-run 差し戻し）を commit 0b2e1e7b（test expectation 現行語彙同期）で解消、再評価で合格 | 該当なし | 該当なし | 該当なし |
| case-close | scripts 契約テスト全体（bun test ./scripts/、worktree root 起点） | 263 pass / 0 fail | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-close | targeted docs guard（check_changed_docs.ts --workflow case-close、src/opencode 配布物 2 ファイル明示指定） | failures 0 / warnings 0 | 該当なし | 該当なし | case-run の docs-check profile 実行（failures 0）と同結果 | 該当なし | 該当なし |
| case-close | 配布依存境界 最終 gate（check_distribution_boundary.ts --profile source） | 違反 0 件 | 該当なし | 該当なし | case-run と同結果（違反 0 件） | 該当なし | 該当なし |
| case-close | check_extensions（IR-056 validation、worktree root 起点実行） | failures 0 | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-close | traceability check --req REQ-061-003（case-run 事前検査と独立の再検査） | pass 9 / fail 0（completenessScope REQ-061-003。missing-design / missing-implementation / missing-verification なし、policy required 判定正常） | 該当なし | 該当なし | case-run と同結果（pass 9 / fail 0） | 該当なし | 該当なし |
| case-close | full integrity suite（bun test ./.opencode/skills/repo-agentdev-integrity/scripts/、worktree root 起点） | 2635 pass / 4 fail（4 fail はいずれも約15秒の spawn-timeout。check_integrity.ts 直接実行で本体検査完走・asserts 通過を確認） | 該当なし | 該当なし | 該当なし | 該当なし | spawn-timeout 4 fail（IR-055 実修復回帰 2、NG21 N16/N17 是正回帰 2）は実行環境起因の既知 flake として無効。check_integrity.ts 直接実行で検出の new unmanaged NG（REQ-003-055 phantom citation 3件、REQ-032.md updated freshness 等）は main root でも同一検出の他 Case・環境起因（本変更対象ファイル外）であり本変更非起因として無効 |
| case-close | Skill 構造 lint（lint_skills.ts --root worktree） | NG 0 / Warning 1 | 該当なし | 該当なし | AG-005 description aggregate budget warn（case-run 記録と同一、本変更非起因の既知傾向管理 warn） | 該当なし | 該当なし |
| case-close | Design 状態評価（棚卸し、PR 本文申告候補の統合を含む全件評価） | 実フロントマター status: draft 0 件、昇格対象なし（PR 本文申告「Design確定候補: 該当なし」と一致） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |

### 差し戻し → 修正済みの経緯

1. 前回 case-close 実行（1st round）で QG-4 の一部として契約テスト TS-003 (a) の expectation 不一致を検出し、case-run へ差し戻した。不一致内容: definition-acceptance.md の自動 merge 条件文言が現行契約語彙（人間に留保された判断（REQ-{NNNN}-{NNN}）の新規確定が不要で、既存の正規契約から導出できる解消と委譲された裁量の範囲内の判断である場合）へ更新済みだった一方、テスト expectation が旧語彙（新しい意味判断を必要としない場合）のまま残存。
2. case-run 再実行により commit 0b2e1e7b（test expectation 現行語彙への同期、1 file 1 line）で解消。
3. 本再実行（HEAD 0b2e1e7b）で契約テストを再評価し 59 pass / 0 fail を確認。QG-4 完了条件 3 項目は新 HEAD で再評価しすべて達成。

### TS-001 正当残存の検証記録（pass_criteria 要求分）

PR 本文「検証差分」節に記録済みの正当な意味として維持した残存（execution-structure.md の「一意に導出できる」「閉じた意味判断」、inspect-promote の「高確信度」、common-gate-contract.md、decision-acceptance.md の禁止条項、root-case-report.md テンプレート文言）は、HEAD 間差分（test expectation 1 行のみ）により本再実行でも全て変更なし。再確認の残存検索では case-ready 系対象ファイルの旧判断境界語残存 0 件を維持。

### 完了判定

- QG-4 最終完了判定: 合格。完了条件 3 項目すべて達成。
- 対応記録: Issue #3298 本文完了条件チェックボックス更新済み。PR #3306 squash merge 済み（base main）。Design 確定なし（昇格対象 draft 0 件）。
- Epic #3296 のステータス追跡テーブル更新は 単一書き手（case-close）で実施。
````
