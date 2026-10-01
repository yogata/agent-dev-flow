# proxy-case-run payload: PR create for Issue #3297（OU-0001・Wave 1）

- 対象操作: Custom Tool `agentdev_gh` の `pr_create`（title / body は本ファイルの verbatim 値を使用。base: `main`, head: `case-3297`）
- 実行前提: branch `case-3297` は push 済み（origin/case-3297 = commit `5c4e8d34bd6acefe275a6d03b8cf965edd483307`、worktree `.worktrees/3297-case/`）。実装・検証は委譲 DEL-3297-1 で完了（TS-001/TS-002 合格、トレーサビリティ check 対象行完検、配布依存境界 0 違反、textlint PASS、Skill lint 対象 2 skill ok、Workflow 予防検査 7/7）
- blocker 事象: `agentdev_gh` が gh exit 66（起動環境障害・stderr 空・REQ-093 既知事象）で書込み全滅。委譲内 2回（初回＋規定リトライ1回）＋ orchestrator 再試行 1回（#3298 で実施・全操作同一障害）、いずれも同一障害。raw gh WRITE は write-guard 禁止どおり未実施
- 実行後処理: PR 作成確認（PR URL readback）→ case-close(#3297)（Workflow Skill `agentdev-workflow-case-close` を load した subagent 委譲: QG-4、squash merge 先 main、Issue #3297 クローズ、Epic #3296 ステータス追跡テーブル更新〔case-close 単一書き手〕）→ Wave 1 fan-in 継続
- 実行後の本 payload: consume 済みとして削除（過去の proxy payload 運用と同一）

## Title（verbatim）

refactor(agentdev): case-auto・case-revise 実行時投影の判断境界語彙を REQ-096 確定権限3分類へ同期 (#3297)

## Body（verbatim）

```markdown
## 概要

OU-0001（Wave 1・並列・依存なし、Issue #3297）: REQ-034-032 更新後の判断境界（REQ-096 確定権限3分類ベースの自律解決境界）を、case-auto・case-revise 系の実行時投影（src/opencode/skills/**）へ意味的に同期した（AG-001・RA-002 の case-auto 系部分）。Definition 面（REQ-034-032 行・docs/designs/commands/case-auto.md）は Definition PR #3294 で merge 済みであり、本 PR は実現面のみを扱う。

## 実行識別情報

- adf_case: #3293 (Root Case)
- adf_execution_unit: standard (OU-0001 / Issue #3297)
- adf_delegation: DEL-3297-1
- adf_harness_ref: N/A

## 実装内容

- `src/opencode/skills/agentdev-workflow-case-auto/SKILL.md`: 導入節の停止発動根拠と終了条件（停止終了）の「新しい意味判断」を「人間に留保された判断（新しい目的・価値・優先順位・対象範囲・外部契約・受け入れ条件・恒久規範、または既存正規契約だけでは解決不能な規範間優先関係の新規確定を要する判断）」へ更新。case-auto Design の承認・HITL 境界節・終了条件節の現行語彙と同一の語彙へ整列し、`references/stop-and-decision-resolution.md` の新規ユーザー判断事項の発動根拠定義（既に REQ-096-005 と同型）と一貫させた
- `src/opencode/skills/agentdev-workflow-case-revise/references/handoff-and-update.md`: Definition PR 受入フローの自動確定条件を「新しい意味判断が不要な場合」から「既存の正規契約からの導出または委譲された裁量の範囲内で自律確定できる場合」へ更新（case-ready 実行契約の現行語彙と整合）
- `traceability/agentdev-workflow-case-auto.yaml`: 編集成果物の実装対応宣言を追加（SKILL.md → REQ-034-032）。併せて、batch 系 sidecar（src-opencode-correction）に誤配置されていた SKILL.md の REQ-094 宣言を component 側 sidecar へ集約し duplicate-inconsistencies を解消
- `traceability/agentdev-workflow-case-revise.yaml`: handoff-and-update.md の実装対応宣言を追加（REQ-062-006）し、欠落していた REQ-062-006 の design 宣言（docs/designs/commands/case-revise.md「再確定の委譲」節を根拠）を補完
- **スコープ限定**: case-ready 系（OU-0002）・case-close 系・design-file-manager 系（OU-0003）の実行時投影は一切変更していない

### adversarial-review skip 記録

- **判定理由**: Issue 本文に adversarial-review 非発動が記録済み（ユーザー明示指定なし）。本委譲は合意済み Definition（Definition PR #3294 で merge 済み）で確定した実現面変更の実行時投影への機械的同期であり、実装方針の新規合意形成・規範間の優先関係の新規確定を伴わない
- **代替自己反証（却下案）**: 「一意に確定できない場合のみ停止する」旧境界の保持案 → REQ-096-004 が禁止する一意性中心の自律確定規則の残存を生むため却下
- **代替自己反証（緩和策）**: 「新しい意味判断」を用語注記として実行時投影に残存させる案 → TS-001 pass_criteria が case-auto 系修正対象ファイルの残存 0 件を要求するため不採用。正当な言及は docs 正典側（REQ-096-027・REQ-005-029 の用語注記）に現存し、実行時投影での注記追加は新旧契約の併存を生む
- **unresolved なしの確認**: 変更は既存 reference・Design の語彙への整列のみで、未解決の本質的争点・ユーザー判断事項は発生していない（TS-001・TS-002 再検証で確認）

## 完了条件

- [x] src/opencode の case-auto 関連正規文書・配布物において、旧判断境界を意味として使用する残存が 0 件であること（case-auto・case-revise 系対象ファイルの残存 0 件を検証済み。正当な意味として維持した箇所の説明は「テスト結果」の TS-001 詳細と「Findings/ Capture候補」の intake 記録に記載）
- [x] 変更した各節の判断主体・自律確定範囲・人間判断の発動根拠・停止理由の原因分類が REQ-096-003〜006/010/012/015 と矛盾しないこと（TS-002 突合合格。詳細は「テスト結果」）
- [x] 変更が case-auto・case-revise 系対象ファイルに限定されており、case-ready 系（OU-0002）・case-close 系・design-file-manager 系（OU-0003）の対象変更を含まないこと（実現面の変更は case-auto SKILL.md と case-revise reference のみ。traceability/ 配下の sidecar 3件は対応関係管理の repo-level 成果物であり、実行時投影の本文変更を含まない）
- [x] 契約テスト期待値の更新と固定トークン確認: 該当なし（構造変更なし。配布物本文の語彙置換と sidecar YAML のみで、command・skill・template の構造様式変更を伴わない）

## テスト結果

**TS-001（fix-and-reverify ループ完遂・合格）**: 初回列挙で case-auto 系 3箇所（SKILL.md 導入節・終了条件、handoff-and-update.md 受入フロー）の旧判断境界語を検出し修正、再検証で case-auto・case-revise 系ディレクトリの残存 0 件を確認。正当な意味として維持した言及（変更不要の判定根拠）は「Findings/ Capture候補」の intake 記録を参照。

**TS-002（合格）**: SKILL.md の bounded parent decision resolution（STEP-6）・承認/HITL 境界・停止理由分類（STEP-4）関連節を REQ-034-032 本文と REQ-096 突合: 判断主体（自律解決 = 正規契約からの導出、作業仮定 = 委譲された裁量、reference 側で確定権限ラベル明示）、自律確定範囲（対象範囲・受け入れ条件を変更しない可逆的内部詳細に限定）、人間判断の発動根拠（新しい目的・価値・優先順位等の留保事項の新規確定のみ。難易度・確信度・結果状態・唯一解でないことを根拠とする記述は case-auto 系に 0 件）、停止理由の原因分類（上位合意矛盾 = 正規情報源間の不一致/未解決規範矛盾、新規ユーザー判断 = 人間に留保された新しい判断、並列起動不能 = 外部依存・運用前提）のいずれも REQ-096 と矛盾なし。「一意に回答可能」「新しい意味判断が必要なら HITL」等の旧境界で読み取れる記述の残存 0 件。

- **実行 cwd**: C:/Users/ogatay/work/agent-dev-flow/.worktrees/3297-case（worktree root）
- **起動コマンド形式**: `bun src/opencode/skills/agentdev-traceability/scripts/src/check.ts --root . --req REQ-034-032,...`（traceability、worktree は .opencode junction 非伝播のため src 側パスで起動）/ `bun .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-run --root <worktree絶対パス> --files <5ファイル> --json` / `bun .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts` / `bun .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts --root . --json` / `bun .opencode/skills/repo-agentdev-integrity/scripts/check_workflow_preventive.ts --root .` / `bun install && bun run build:engine` の後 `bun run gate.ts --root <worktree絶対パス>`（src/opencode/plugins/agentdev-textlint-guard/ 内）
- **既存試験**: 影響範囲検出の結果、変更は配布物 Markdown 2ファイルと traceability sidecar YAML 3ファイルのみで .ts・テスト対象構造の変更なし。既存 test suite への影響なし（最終横断検証は親 Epic の TS-008 で OU-0008 が実施）

## 品質メトリクス

| メトリクス | 結果 | 基準 | 判定 |
|---|---|---|---|
| TS-001: case-auto・case-revise 系旧判断境界語残存 | 0 件 | 0 件 | ✅ |
| TS-002: REQ-096 突合矛盾箇所 | 0 件 | 0 件 | ✅ |
| 配布依存境界違反（source profile・検査 359 ファイル） | 0 件 | 0 件（base baseline 同等） | ✅ |
| textlint gate hard 違反（545 対象ファイル） | 0 件 | 0 件 | ✅ |
| Skill 構造 lint NG（対象 2 skill） | 0 件 | 0 件 | ✅ |
| Workflow 予防検査（7 項目） | 全 PASS | 全 PASS | ✅ |
| トレーサビリティ check（対象行スコープ）NG | 0 件 | 0 件 | ✅ |

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | 新規 | 修正済み | 既出 | 撤回 | 無効 |
|---|---|---|---|---|---|---|---|
| case-run | TS-001 旧判断境界語検索（初回列挙・全領域） | fail（case-auto・case-revise 系 3箇所） | SKILL.md 導入節・終了条件の「新しい意味判断」、handoff-and-update.md 受入フローの「新しい意味判断が不要」 | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | TS-001 再検証（修正後） | pass（case-auto・case-revise 系残存 0 件。正当な言及は intake 記録の判定根拠どおり維持） | 該当なし | 上記 3箇所を REQ-096 語彙へ修正 | 該当なし | 該当なし | 該当なし |
| case-run | TS-002 REQ-096 突合（SKILL.md 関連節） | pass（矛盾 0 件） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | トレーサビリティ check（対象行スコープ・初回） | fail（duplicate-inconsistencies 1件・missing-design 1件） | SKILL.md 実装宣言の 2 sidecar 分裂（component 側追加に伴う重複検出）、REQ-062-006 missing-design | 該当なし | REQ-096-010 missing-implementation、REQ-096-003〜006/010/012/015 missing-verification（base commit 95d32719 で同一 fail を確認済みの corpus 既存ギャップ。RA-003/OU-0008 の検証資産・対応宣言最終同期の対象） | 該当なし | 該当なし |
| case-run | トレーサビリティ check（再検証） | pass（対象行 REQ-034-032・REQ-094 群・REQ-062-006 全て完検） | 該当なし | duplicate-inconsistencies（SKILL.md 宣言を component 側 sidecar へ集約して解消）、REQ-062-006 missing-design（design 宣言補完で解消） | 上記 corpus 既存ギャップ（未処理・スコープ外） | 該当なし | 該当なし |
| case-run | targeted docs guard（case-run workflow・--files 5ファイル） | pass（traceability 3件 checked、failure 0。src/opencode は case-run workflow の appliesTo 対象外のため src 側は配布依存境界・lint・textlint で担保） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | 配布依存境界（source profile） | pass（違反 0 件。base baseline 0 件と同等） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | Skill 構造 lint | pass（対象 2 skill の全検査 ok） | 該当なし | 該当なし | description aggregate budget warning（全 49 skill 集計の傾向管理 warning。本変更は description 未変更のため base と同一） | 該当なし | 該当なし |
| case-run | Workflow 予防検査（check_workflow_preventive） | pass（7/7） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | textlint gate | pass（545 ファイル、hard 違反 0） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |

## Findings/ Capture候補

### intake

**TS-001 全領域残存列挙（OU-0007・OU-0008 への引き継ぎリスト。作業基準 HEAD 95d32719 時点・本 PR 修正後の再検証値）**

修正が必要な残存（本 PR では未修正・各 OU の承認済み対象範囲）:

- case-ready 系（OU-0002 の対象）: `src/opencode/skills/agentdev-workflow-case-ready/SKILL.md` L72・L103（「新しい意味判断が必要な場合/を必要としない場合」）、`src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md` L20・L34（同種。L20 は確定権限語彙併記済み）
- case-run 系（RA-002 の OU 割当外・最終同期での処理対象候補）: `src/opencode/skills/agentdev-workflow-case-run/SKILL.md` L117、`src/opencode/skills/agentdev-workflow-case-run/references/single.md` L86（blocked 正規再開経路の記述「新しい意味判断が必要な場合は req-define」）

docs 正典側の正当な言及（変更不要・TS-001 判定基準の正当意味該当）:

- `docs/requirements/REQ-096.md` REQ-096-027（REQ-096 自身の定義語彙）
- `docs/requirements/REQ-005.md` REQ-005-029（用語注記「人間に留保された判断（新しい意味判断、REQ-096 参照）」。Epic RD-001 で already_satisfied 判定済み）

実行時投影側の正当な言及（本判定で変更不要と確認・維持）:

- `src/opencode/skills/agentdev-workflow-case-revise/SKILL.md`（description・L11・L70・L90・L105）と `references/definition-revision.md` L8・L25 の「意味判断は req-define が所有/case-revise は意味判断しない」: REQ-096-024/027 と同型の現行語彙であり、TS-001 検索語「意味判断が必要」の旧境界意味での使用ではない
- `src/opencode/skills/agentdev-workflow-orchestration/references/case-auto-recovery.md` L73「証跡から対象の stage 進行度を一意に判定できない場合は blocked 報告」: 決定的処理の導出性（証拠不足）の安全側処理であり、人間判断への移送（旧 HITL 境界）を意味しない。REQ-096-002 の「一意に導出」語彙と同系
- `src/opencode/skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md` L53・L119 の「HITL 境界」言及: 既存安全境界の呼称として正当（case-auto Design 同節と同型の現行表現）

### learning

- traceability sidecar への対応宣言追加時に、component/sidecar 対応一覧の事前確認（sidecar-and-policy.md の予防手順）を省略した結果、batch 系 sidecar（src-opencode-correction.yaml）との duplicate-inconsistencies が検出され、宣言集約の手戻りが発生した。batch 系 sidecar には他 component の artifact 宣言が構造的に残存し得るため、対応宣言追加前の事前確認と、batch sidecar 内の他 component artifact 宣言の一覧化（将来的な component 側集約）を推奨

## Design確定候補

該当なし（本変更は Definition PR #3294 で更新済みの case-auto Design 語彙の実行時投影への同期であり、新規の Design レベル詳細の発見はない）

## 関連Issue

Refs: #3297
```
