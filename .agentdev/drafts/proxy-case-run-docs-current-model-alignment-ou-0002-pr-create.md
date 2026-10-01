# proxy-case-run payload: PR create for Issue #3298（OU-0002・Wave 1）

- 対象操作: Custom Tool `agentdev_gh` の `pr_create`（title / body は本ファイルの verbatim 値を使用。base: `main`, head: `case-3298`）
- 実行前提: branch `case-3298` は push 済み（origin/case-3298 = commit `4d0284a4552a9c11821247805ae0f78937aabb92`、worktree `.worktrees/3298-case/`）。実装・検証は委譲 DEL-3298-1 で完了（TS-001/TS-002 合格、配布依存境界 0 違反、textlint PASS、Skill lint NG 0、traceability check pass 9/fail 0）
- blocker 事象: `agentdev_gh` が gh exit 66（起動環境障害・stderr 空・REQ-093 既知事象）で書込み全滅。委譲内 2回（初回＋規定リトライ1回）＋ orchestrator 再試行 1回、いずれも同一障害。raw gh WRITE は write-guard 禁止どおり未実施
- 実行後処理: PR 作成確認（PR URL readback）→ case-close(#3298)（Workflow Skill `agentdev-workflow-case-close` を load した subagent 委譲: QG-4、squash merge 先 main、Issue #3298 クローズ、Epic #3296 ステータス追跡テーブル更新〔case-close 単一書き手〕）→ Wave 1 fan-in 継続
- 実行後の本 payload: consume 済みとして削除（過去の proxy payload 運用と同一）

## Title（verbatim）

refactor(case-ready): Definition 受入の判断境界を REQ-061-003 更新後の現行契約へ同期

## Body（verbatim）

```markdown
## 概要

OU-0002（Wave 1・Issue #3298・DEL-3298-1）: REQ-061-003 更新後の判断境界（人間に留保された判断（REQ-096-005）の新規確定と既存安全境界の操作承認に限定した HITL 境界）を、case-ready 関連の実行時投影（src/opencode/skills/**）へ意味的に同期した。Definition 面（REQ-061-003 行、docs/designs/commands/case-ready.md L27/L41）は Definition PR #3294（commit 76e43819）で merge 済みであり、本 PR は実現面のみを扱う。docs/** は編集していない。

## 実行識別情報

- adf_case: #3293
- adf_execution_unit: standard（OU-0002 / Issue #3298・親 Epic #3296）
- adf_delegation: DEL-3298-1
- adf_harness_ref: N/A

## 実装内容

1. src/opencode/skills/agentdev-workflow-case-ready/SKILL.md（3箇所）
   - HITL 分岐（STEP-1）: 語ベース判定（新しい Decision、意味変更、対象範囲拡大、意味的な不整合解消が必要なら停止）を、REQ-096-005 留保事項該当性ベースの判定へ更新。語の使用だけで人間判断へ移送しないこと、判断の難易度・確信度・評価器間の不一致・結果状態・唯一解でないことだけを理由に移送しないことを明記（REQ-096-003/004/006 に対応）
   - 終了条件（停止終了）: 「新しい意味判断が必要な場合」を「人間に留保された判断（REQ-096-005）の新規確定または既存の安全境界が要求する操作承認が必要な場合」へ更新し、停止理由の原因分類（REQ-096-012）対応を追記
   - 共通制約（Definition 受入）: 自動 merge 条件を「人間に留保された判断の新規確定が不要で、既存の正規契約から導出できる解消と委譲された裁量の範囲内の判断である場合」へ更新（docs/designs/commands/case-ready.md L27 と同一変更）
2. src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md（3箇所）
   - 忠実性確認: 「新しい意味判断は行わない」を「人間に留保された判断（REQ-096-005）を新規に確定しない」へ更新
   - 確定判定と merge: 自動 merge 条件を現行契約文言へ更新
   - HITL 停止条件: 語列挙の箇条書きを留保事項該当性判定の記述へ再構成（語は移送判定の対象例示として保持、留保事項列挙は REQ-096-005 定義語へ同期）。停止理由の原因分類対応を追記
3. traceability/agentdev-workflow-case-ready.yaml: definition-acceptance.md の implementation 対応へ REQ-061-003 を追加（本変更で同ファイルが REQ-061-003 の実現面を担うため。配布物本文への concrete ID 直書きは行わず sidecar で保持）

正当な HITL の維持: isDraft: true 時の blocked 停止（GitHub Draft PR は正規 lifecycle 外であり merge 不可という既存安全境界の操作承認）、proposed Decision 受理の導出不能時のユーザー判断（REQ-061-021 導出ベース判定）は現行契約として変更せず維持した。

配布物本文への concrete REQ/Decision ID の直書きは行わず、参照は既存慣行の REQ-{NNNN}-{NNN} プレースホルダー表記（concrete ID は docs/designs/commands/case-ready.md と traceability sidecar が正規所有）に従った。

## 完了条件

- [x] src/opencode の case-ready 関連正規文書・配布物において、旧判断境界を意味として使用する残存が 0 件であること（TS-001 修正後 reverify で case-ready 系対象ファイルの検索語残存 0 件。正当な意味として維持した箇所は「検証差分」節に検証記録として記載）
- [x] case-ready 実行時投影の Definition 受入・Decision 受理・不整合処理の判断境界が、REQ-096-005 の留保事項該当性で人間判断移送を判定する現行境界と一致すること（TS-002 突合合格。判断の難易度・確信度・評価器間の不一致・結果状態・唯一解でないことだけを理由とする移送規則の残存なし。proposed Decision の受理評価は decision-acceptance.md の導出ベース判定（REQ-061-021）を既存のまま維持）
- [x] 変更が case-ready 系対象ファイルに限定されており、case-auto 系（OU-0001）・case-close 系・design-file-manager 系（OU-0003）の対象変更を含まないこと（diff は case-ready SKILL.md、references/definition-acceptance.md、traceability sidecar の3ファイルのみ。templates/ は case-ready 系判断境界文言の該当なしを確認し未変更）
- [x] 契約テスト期待値の更新と固定トークン確認: 該当なし（構造変更なし。Markdown 文言同期のみで command/skill/template の構造様式変更を含まない）

## テスト結果

- **実行 cwd**: host repo root（C:/Users/ogatay/work/agent-dev-flow。読取系 checker は host 配置の repo-agentdev-integrity / agentdev-traceability 起点で --root に worktree 絶対パスを指定。textlint gate は worktree 内 plugin で bun install && bun run build:engine を前置）
- **起動コマンド形式**: bun + scripts パス指定（例: bun .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts --root "C:/Users/ogatay/work/agent-dev-flow/.worktrees/3298-case"、bun src/opencode/skills/agentdev-traceability/scripts/src/check.ts --root "...3298-case" --req REQ-061-003）

| 項目 | 結果 |
|---|---|
| TS-001（AG-001 case-ready 系残存検索。rg '一意に回答|一意確定|新しい意味判断|意味判断が必要'） | 合格。修正後 reverify で case-ready 系対象ファイルの残存 0 件 |
| TS-002（case-ready SKILL 節と REQ-061-003 / REQ-096-003〜006/010/012/015 の突合） | 合格。判断主体・自律確定範囲・人間判断の発動根拠・停止理由の原因分類が REQ-096 と一致。旧境界で読み取れる記述の残存なし。REQ-061-021 導出ベース判定は既存のまま維持を確認 |

ユニットテスト（bun test）新規実行は本 PR の変更対象に対応する既存 test を含まない（文言同期のみ）。bun test フル suite の受理判断は QG-4（case-close）の所有。

## 品質メトリクス

| メトリクス | 結果 | 基準 | 判定 |
|---|---|---|---|
| TS-001 case-ready 系旧判断境界語残存 | 0 件 | 0 件 | ✅ |
| Skill 構造 lint（lint_skills.ts --root worktree） | NG 0 / Warning 1 | NG 0 | ✅（Warning は AG-005 description aggregate budget の既知傾向管理 warn。本 PR は description 未変更で非起因） |
| 配布依存境界（check_distribution_boundary.ts --root worktree、profile source） | 違反 0 件 | base baseline（0 件）と同値 | ✅ |
| targeted docs guard（check_changed_docs.ts --workflow docs-check --files 2ファイル --root worktree） | failures 0 / files_checked 2件一致 | failures 0、files_checked 一致 | ✅ |
| textlint gate（gate.ts --root worktree） | PASS（545 files、hard violation 0） | hard violation 0 | ✅ |
| traceability check（--req REQ-061-003、sidecar 追加後） | pass 9 / fail 0 | fail 0 | ✅ |

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | 新規 | 修正済み | 既出 | 撤回 | 無効 |
|---|---|---|---|---|---|---|---|
| case-run | TS-001 残存検索（初回） | 不合格（case-ready 系5箇所） | case-ready SKILL.md HITL分岐/停止終了/Definition受入、definition-acceptance.md 忠実性確認/merge 条件 | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | TS-001 reverify（修正後） | 合格（case-ready 系残存 0 件） | 該当なし | 上記5箇所を現行語彙へ修正済み | 該当なし | 該当なし | 該当なし |
| case-run | TS-002 Design・REQ 突合 | 合格 | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | traceability check（--req REQ-061-003,REQ-061-021） | REQ-061-003 完全合格。REQ-061-021 に missing-design | REQ-061-021 missing-design の本委譲内初検出（base 同一状態・本変更非起因。「Findings/ Capture候補」参照） | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | traceability check（--req REQ-061-003、sidecar 追加後） | pass 9 / fail 0 | 該当なし | definition-acceptance.md へ REQ-061-003 implementation 対応追加済み | 該当なし | 該当なし | 該当なし |
| case-run | Skill 構造 lint・Command/Skill 参照妥当性（lint_skills.ts、References 98 OK） | NG 0 | AG-005 aggregate budget warn（既知傾向管理、本変更非起因） | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | 配布依存境界（profile source） | 違反 0 件（concrete_id_hits 0） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | targeted docs guard（--workflow docs-check、--files 明示指定） | failures 0 / warnings 0 | case-run profile では src/opencode 配下が appliesTo 外で TARGET-EMPTY となるため docs-check profile を使用（「Findings/ Capture候補」learning 参照） | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | textlint gate | PASS（hard violation 0） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |

正当な意味として維持した残存（TS-001 pass_criteria の検証記録）:
- agentdev-workflow-case-ready/references/execution-structure.md の「一意に導出できる」: REQ-096-002/REQ-096-007 の現行定義語（決定的処理の判別基準）であり、旧一意性中心の自律確定規則を意味として使用しない
- 同「閉じた意味判断」: 閉じた意味評価の同義表記であり、判断境界（確定権限）を意味として使用しない
- agentdev-workflow-inspect-promote/SKILL.md の「高確信度」: --auto 明示 opt-in のカテゴリ限定であり、確信度を人間判断への移送理由として使用しない（同ファイルは現行境界〔一意性ではなく正規契約からの導出または委譲された裁量で判定〕を明記）
- agentdev-quality-gates/references/common-gate-contract.md: 現行語彙（人間に留保された新しい判断・正規情報源間の未解決規範矛盾の場合のみ人間判断へ移行）
- agentdev-workflow-case-ready/references/decision-acceptance.md の「一意の解でないこと、判断の難易度、確信度の低さだけを理由に停止しない」: 禁止条項（現行境界の表明）
- templates/case-ready/root-case-report.md の「追加承認なしで自動確定」: 現行契約語彙
- case-run / case-auto / case-revise 系の「新しい意味判断」残存: 本 Issue の修正対象外（OU-0001 / OU-0003 / OU-0008 が担当。concrete 箇所は「Findings/ Capture候補」intake へ記録）

## Findings/ Capture候補

### intake

1. REQ-061-021 に design 対応 0 件（traceability check missing-design）。base（95d32719）と同一状態で本変更非起因（host root でも同一検出）。REQ-061-021 の Design 対応 sidecar 登録要否の確認候補。発見元: traceability check（--req REQ-061-003,REQ-061-021）。分類: intake
2. 横断残存の concrete 箇所（OU-0001 / OU-0003 / OU-0008 の TS-001 解消用の参照情報）: src/opencode/skills/agentdev-workflow-case-run/SKILL.md（blocked 正規再開経路節）、src/opencode/skills/agentdev-workflow-case-run/references/single.md、src/opencode/skills/agentdev-workflow-case-revise/references/handoff-and-update.md（case-ready の Definition PR 受入フロー記述に旧語「新しい意味判断が不要な場合の自動確定・merge」）、src/opencode/skills/agentdev-workflow-case-auto/SKILL.md（2箇所）。docs/ 正典（REQ-096-027、REQ-005-029、DEC-008、DEC-029）は編集対象外（歴史的判断記録・正典）。発見元: TS-001 検索。分類: intake

### learning

1. targeted docs guard の case-run workflow profile は src/opencode 配下の配布物変更を appliesTo とせず、--files 明示指定でも TARGET-EMPTY（strict fail）となる。src/opencode 配布物のみの変更では docs-check profile（appliesTo 広域）で実行するのが実態に合致する。発見元: check_changed_docs.ts 実行時の files_checked 空確認。分類: learning

## Design確定候補

該当なし

## adversarial-review skip 記録

本委譲は adversarial-review 非発動（Issue 本文に記録済み）。skip の判定理由と代替自己反証:

- 判定理由: 本委譲は Definition PR #3294 で合意済みの REQ-061-003 行および docs/designs/commands/case-ready.md（L27/L41）の既定文言を実行時投影へ同一変更で反映する RA-002 実現面同期であり、実装方針の新規選択、規範間の優先関係の新規確定、対象範囲の変更を含まない
- 代替自己反証（却下案1）: 留保事項の定義語列挙を配布物へ展開せず節名参照のみにする案 → Definition 面との意味同期（新旧契約の併存を残さない）を満たすため、REQ-096-005 留保事項の定義語を投影する現案を採用（concrete ID は直書きせずプレースホルダー表記で ID 依存を回避）
- 代替自己反証（却下案2）: HITL 停止条件の語列挙を完全廃止する案 → REQ-061-003 は「語の使用だけで判定しない」ことを求めるのみで語の例示自体は許容するため、語例示と留保事項該当性判定方法の併記する現案を採用
- unresolved な本質的争点・ユーザー判断事項: なし（REQ-061-021 の既存 missing-design は base 同一状態であり本 PR の対象範囲外。Findings/intake として記録）

## 関連Issue

Refs: #3298
```
