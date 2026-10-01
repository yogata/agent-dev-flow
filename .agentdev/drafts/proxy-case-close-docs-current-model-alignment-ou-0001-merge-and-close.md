# proxy-case-close payload: merge & close for Issue #3297（OU-0001・Wave 1）

- 対象操作: Custom Tool `agentdev_gh` 相当の GitHub 書込み 4操作（順序固定。本文中の verbatim 値を使用）
  - ① `issue_update` #3297（body = 下記「① issue_update #3297 用 最終本文（verbatim）」）
  - ② `pr_merge` PR #3305（method: squash、base: main。head case-3297 = 5c4e8d34）
  - ③ `issue_close` #3297（reason: completed）
  - ④ `comment_create` #3297（body = 下記「④ comment_create #3297 用 対応記録コメント（verbatim）」）
- 実行前提: PR #3305 は OPEN・MERGEABLE/CLEAN・base main・head case-3297（commit 5c4e8d34）。Issue #3297 は OPEN・完了条件 checkbox 3件とも未チェック。case-close 委譲（DEL 相当: case-close fan-in 1 of 3）で QG-4 3/3 合格・STEP-3 全 gate 合格（targeted docs guard failure 0・IR gate ok・配布依存境界違反 0・full integrity suite 2635 pass + 4件 spawn timeout は直接実行で assert 全件 pass 確認・トレーサビリティ check 9 pass/0 fail・3完全性ゲート合格）・Design 昇格対象なし・merge 前状態検査 pass（先行 commit は .agentdev/ 配下のみで PR 変更ファイルと無関係）まで完了済み
- blocker 事象: `agentdev_gh` が gh exit 66（起動環境障害・stderr 空・REQ-093 既知事象・回復は serve 再起動のみ）で書込み全滅。case-close 委譲内で 4操作 ×（初回＋1リトライ）計 8試行すべて同一障害。raw gh WRITE は禁止どおり未実施
- 冪等性: 各操作の実行前に現在状態を確認し、済んでいる操作（例: PR merge 済み・Issue close 済み）は skip して次へ。最終状態（PR #3305 merged・#3297 closed・checkbox 3件 [x]・対応記録コメント投稿済み）が揃えばよい
- 補足: リポジトリ設定 deleteBranchOnMerge=true のため merge 後 origin/case-3297 は自動削除される（case-close 契約どおり GitHub 自動削除に委譲）。必須 status checks なし（STEP-5 CI 通過確認は N/A）。PR title は "(#3297)" 付きで auto-close キーワードなし（merge だけでは #3297 は閉じないため ③ が必要）
- 実行後処理: 本 payload（および同時永続化された他 payload）の consume 削除 → resume procedure（proxy-case-close-docs-current-model-alignment-resume-procedure.md）に従い case-auto 再開

## ① issue_update #3297 用 最終本文（verbatim）

以下の markdown を #3297 の body として全体置換する（現行本文の完了条件 checkbox 3件を [x] 化し、末尾に「## 完了報告」節を追記したもの）:

````markdown
Parent: #3296

## 概要
<!-- 【必須】 -->

OU-0001（Wave 1・並列・依存なし）: REQ-034-032 更新後の判断境界（REQ-096 確定権限3分類ベースの自律解決境界）を、case-auto 関連の実行時投影（src/opencode/skills/** の Workflow Skill・reference・テンプレート）へ意味的に同期する（AG-001・RA-002 の case-auto 系部分）。Definition 面（REQ-034-032 行、docs/designs/commands/case-auto.md、docs/designs/foundations/system.md の該当節）は Definition PR #3294 として merge 済みであり、本 Issue は実現面のみを扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #3296（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- src/opencode/skills/agentdev-workflow-case-auto/SKILL.md
- case-auto・case-revise に関係する実行時 Workflow Skill・reference・テンプレートのうち、旧判断境界語（一意に回答、一意確定、新しい意味判断、意味判断が必要、HITL 発動根拠の旧モデル依存）を自律確定境界として使用する箇所
- 判定基準: 各言及を現行契約上の意味で分類し、旧判断境界を意味として使用する箇所のみ変更する。「HITL」という語のうち人間に留保された判断または既存安全境界の操作承認として正当なものは維持する。Design 本文への書き込みを要求する箇所は対象外（AG-002・OU-0003 の責務）

## REQ参照
<!-- 【必須】 -->

REQ-034（REQ-034-032。判断アーキテクチャの正は REQ-096 / DEC-048）

## 提案内容
<!-- 【必須】 -->

- RA-002（case-auto 系部分）: src/opencode の case-auto 関連実行時投影から旧判断境界を、更新後の REQ-034-032・case-auto Design と同一の意味（正規契約からの導出〔REQ-096-003〕、委譲された裁量〔REQ-096-015〕の範囲を自律解決範囲とし、判断の難易度・確信度・評価器間の不一致・結果状態・唯一解でないことを人間判断の発動根拠としない〔REQ-096-004〕、人間に留保された判断〔REQ-096-005〕と既存安全境界の操作承認は既存停止経路に従う、停止理由は REQ-096-012 の8原因分類へ対応）へ同期する
- intent: 正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない（AG-001、RU §2.6）
- verification_refs: [TS-001, TS-002]
- source_items: [AG-001]

## 完了条件
<!-- 【必須】 -->

- [x] src/opencode の case-auto 関連正規文書・配布物において、旧判断境界を意味として使用する残存が 0 件であること（残存語のうち正当な意味〔定義・用語注記・歴史・引用〕として説明できる箇所はその説明を検証記録に残すこと。TS-001 pass_criteria のうち case-auto 系対象）
- [x] 変更した各節の判断主体・自律確定範囲・人間判断の発動根拠・停止理由の原因分類が REQ-096-003〜006/010/012/015 と矛盾しないこと（TS-002 pass_criteria のうち case-auto Design 対応節）
- [x] 変更が case-auto・case-revise 系対象ファイルに限定されており、case-ready 系（OU-0002）・case-close 系・design-file-manager 系（OU-0003）の対象変更を含まないこと

## テスト戦略
<!-- 【必須】 -->

- id: TS-001
  target_item: AG-001（case-auto 系対象部分）
  verification: |
   rg '一意に回答|一意確定|新しい意味判断|意味判断が必要' を docs/requirements/、docs/designs/、docs/guides/、src/opencode/ に実行し、残存箇所を列挙する。各残存について REQ-096 自身の定義・用語注記、歴史文書、引用・禁止例示のいずれかに該当するかを判定する。See Also 等の純参照行と retired/ 配下は除外する。本 Issue では case-auto・case-revise 系対象ファイルの残存解消と、全領域の残存列挙（検証記録として保存し OU-0007・OU-0008 の最終同期へ引き継ぐ）を行う。
  pass_criteria: |
   case-auto 系修正対象ファイル（src/opencode 正規文書・配布物）において、旧判断境界を意味として使用する残存が 0 件。残存語のうち正当な意味として説明できる箇所はその説明を検証記録に残していること。
   on_failure: |
   fix-and-reverify。残存箇所を現行語彙へ修正し再検証する。正当理由の判定は AG-001 の基準（HITL 語の維持条件を含む）に従う。
- id: TS-002
  target_item: AG-001（case-auto Design 対応節）
  verification: |
   src/opencode/skills/agentdev-workflow-case-auto/SKILL.md の bounded parent decision resolution・承認/HITL 境界・停止理由分類関連節を、更新後の REQ-034-032 本文および REQ-096-003〜006/010/012/015 と突き合わせる。
  pass_criteria: |
   いずれの節も判断主体、自律確定範囲、人間判断の発動根拠、停止理由の原因分類が REQ-096 と矛盾しないこと。「一意に回答可能」「新しい意味判断が必要なら HITL」等の旧境界で読み取れる記述が残っていないこと。
   on_failure: |
   fix-and-reverify。該当節を REQ-096 語彙へ修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- implementation: src/opencode/skills/agentdev-workflow-case-auto/SKILL.md
- implementation: case-auto・case-revise に関係する Workflow Skill・reference・テンプレート（RA-002 ownership_hints のうち case-auto・case-revise 系。検索で検出された分のみ）

### 必須品質統制
- implementation 変更 → Skill 品質査読（構造 lint・Command/Skill 参照妥当性）と targeted docs guard・textlint gate。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- DEC-048 / REQ-096 を判断アーキテクチャの正とする。DEC-008 は歴史的判断記録として参照維持し本文を編集しない（CR-003 解消済み・Definition merge 済み）。DEC-008 frontmatter への相互参照追記は本 Case 対象外・将来 intake（CR-004）

### scope-affecting impact candidate
- docs/designs/foundations/system.md を OU-0002（Wave 1・並列）と共有。system.md の主要編集は Definition PR #3294 で単一実施済みであり、追加修正が生じる場合のみ衝突リスク。重複許容の Wave 1 記録（親 Epic「Wave 重複前置検出」節）に従い、衝突解消担当は後着 merge 側
- TS-001 の検索は docs 全体・src/opencode 全体に及ぶが、修正対象は case-auto・case-revise 系に限定する。横断残存は OU-0002（case-ready 系）・OU-0003（case-close 系）・OU-0008（最終同期）が受け持つ

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-002（case-auto 系部分のみを本 Issue で実施）: concern「case 系 workflow skill・reference の判断境界・見送り記録語彙同期」、responsibility「case-auto・case-revise に関係する実行時 Workflow Skill・reference・テンプレートのうち旧判断境界語を使用する箇所を、更新後の REQ・Design 契約と同一の意味へ同期する。各言及を現行契約上の意味で分類し、Design 本文書き込みを要求する箇所のみ変更する」、ownership_hints（case-auto・case-revise 系）「src/opencode/skills/agentdev-workflow-case-auto/SKILL.md、src/opencode/skills/agentdev-workflow-case-revise/references/handoff-and-update.md」、intent「正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない」、verification_refs「TS-001, TS-002」、source_items「AG-001」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #3296 の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0001 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない

## 完了報告

- 2026-10-01 case-close（QG-4 最終完了判定）: 完了条件 3件すべて達成を確認し [x] へ更新した。
  - TS-001: case-auto・case-revise 系（src/opencode/skills/agentdev-workflow-case-auto、src/opencode/skills/agentdev-workflow-case-revise）の旧判断境界語検索（rg '一意に回答|一意確定|新しい意味判断|意味判断が必要'）で残存 0 件を独立再検証した（PR #3305 テスト結果と同一結果）。正当な意味として維持した箇所の説明は PR #3305 本文「Findings/ Capture候補」の intake 記録どおり。
  - TS-002: 変更節 3箇所（case-auto SKILL.md 導入節・終了条件（停止終了）、case-revise handoff-and-update.md Definition PR 受入フロー）を REQ-096-003/005/012/015 と突合し矛盾 0 件（「人間に留保された判断」の定義は REQ-096-005 と同型、自動確定条件は REQ-096-003 の確定権限区分と REQ-096-015 に整合）。
  - 範囲限定: PR #3305 変更 5ファイル（case-auto SKILL.md、case-revise reference、traceability sidecar 3件）で case-ready 系（OU-0002）・case-close 系・design-file-manager 系（OU-0003）の変更なしを確認。
- STEP-3 検証（worktree case-3297 = 5c4e8d34 で実施）: targeted docs guard（case-close workflow・5ファイル）failure 0 / warning 0、check_extensions.ts（IR gate）ok=true、配布依存境界 最終 gate（check_distribution_boundary.ts・source profile・360ファイル）違反 0 件、full integrity suite（bun test 正規形・2639 tests / 107 files）2635 pass（4 fail は子プロセス spawn の 15s timeout により assert 未到達の実行環境タイミング起因で、check_integrity.ts 直接実行により同等 assert 全件 pass を確認）、トレーサビリティ check（--req REQ-034-032,REQ-062-006・対象行スコープ）9 pass / 0 fail（missing-design / missing-implementation / missing-verification いずれも pass・3完全性ゲート合格）。
- Design 状態評価（棚卸し制・全件評価）: docs/designs/ 配下の status: draft Design は実質 0 件（該当表記は template・説明記述のみ）。Design確定候補なし（PR #3305 本文申告と一致）、昇格対象なし。
- 実装: PR #3305（head case-3297 = 5c4e8d34、squash merge 先 main）。対応記録は本 Issue コメント参照。
````

## ② pr_merge 要求行

```
PR #3305 を squash merge（base: main、head: case-3297 = 5c4e8d34、merge commit title は PR title 使用）
```

## ③ issue_close 要求行

```
Issue #3297 を close（reason: completed）
```

## ④ comment_create #3297 用 対応記録コメント（verbatim）

````markdown
## 対応記録

### 対応日時

2026-10-01

### 対応内容

- `src/opencode/skills/agentdev-workflow-case-auto/SKILL.md`: 導入節の停止発動根拠と終了条件（停止終了）の「新しい意味判断」を「人間に留保された判断（新しい目的・価値・優先順位・対象範囲・外部契約・受け入れ条件・恒久規範、または既存正規契約だけでは解決不能な規範間優先関係の新規確定を要する判断）」へ更新（REQ-096-005 と同型の現行語彙）
- `src/opencode/skills/agentdev-workflow-case-revise/references/handoff-and-update.md`: Definition PR 受入フローの自動確定条件を「新しい意味判断が不要な場合」から「既存の正規契約からの導出または委譲された裁量の範囲内で自律確定できる場合」へ更新（REQ-096-003 の確定権限区分・REQ-096-015 に整合）
- `traceability/agentdev-workflow-case-auto.yaml`: SKILL.md → REQ-034-032 の実装対応宣言を追加。併せて batch 系 sidecar（src-opencode-correction）に誤配置されていた SKILL.md の REQ-094 宣言を component 側 sidecar へ集約し duplicate-inconsistencies を解消
- `traceability/agentdev-workflow-case-revise.yaml`: handoff-and-update.md → REQ-062-006 の実装対応宣言を追加し、欠落していた REQ-062-006 の design 宣言（docs/designs/commands/case-revise.md「再確定の委譲」節を根拠）を補完
- `traceability/src-opencode-correction.yaml`: batch 系 sidecar から SKILL.md の REQ-094 宣言を除去（component 側集約に伴う）
- スコープ限定: case-ready 系（OU-0002）・case-close 系・design-file-manager 系（OU-0003）の実行時投影は変更していない

### コミット

- 5c4e8d34: refactor(agentdev): case-auto・case-revise 実行時投影の判断境界語彙を REQ-096 確定権限3分類へ同期（PR #3305、squash merge 先 main）

### テスト結果

- QG-4 完了条件評価: 3件すべて達成（Issue 本文チェックボックスを [x] へ更新。評価根拠は本文「完了報告」節）
- TS-001: case-auto・case-revise 系の旧判断境界語残存 0 件（case-close 独立再検証。rg '一意に回答|一意確定|新しい意味判断|意味判断が必要'）
- TS-002: 変更節 3箇所と REQ-096-003/005/012/015 の突合矛盾 0 件（case-close 独立再検証）
- targeted docs guard（case-close workflow・PR 変更 5ファイル）: failure 0 / warning 0
- check_extensions.ts（IR gate）: ok=true（schema 違反・malformed・doc_inputs 残存 0）
- 配布依存境界 最終 gate（check_distribution_boundary.ts・source profile・360ファイル走査）: 違反 0 件（case-run と同一 detector）
- full integrity suite（bun test 正規形 `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`・repo root cwd・timeout 600s・2639 tests / 107 files）: 2635 pass / 4 fail。4 fail は check_integrity.test.ts 内の子プロセス spawn（`bun run check_integrity.ts --json`）が 15s timeout で打ち切られた実行環境タイミング起因で assert 未到達。check_integrity.ts 直接実行により同等 assert を全件確認: IR-055 新規違反（ng/warning × strict/heuristic）0 件、baseline-known（info）40 ≤ 548、skill-category-gap ng/warning 0 + ok（"All 31 SKILL.md categories have corresponding implementation"）、command-capture-duty から case-close.md 除去済み
- トレーサビリティ check（`check.ts --root . --req REQ-034-032,REQ-062-006`・対象行スコープ）: 9 pass / 0 fail。missing-design / missing-implementation / missing-verification すべて pass（3完全性ゲート合格）
- Design 状態評価（棚卸し制・docs/designs/ 全件評価）: status: draft の Design 実質 0 件（該当表記は template・説明記述のみ）。Design確定候補なし（PR 本文申告と一致）、昇格対象なし

### 検証差分

| 実行工程 | 検証種別 | 検証結果 | 新規 | 修正済み | 既出 | 撤回 | 無効 |
|---|---|---|---|---|---|---|---|
| case-close | QG-4 完了条件チェックボックス評価（Issue 本文 3件） | pass（3/3 達成・[x] 更新） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-close | TS-001 残存検索（case-close 独立再検証） | pass（case-auto・case-revise 系残存 0 件） | 該当なし | 該当なし | case-run 再検証と同一結果（pass） | 該当なし | 該当なし |
| case-close | TS-002 REQ-096 突合（case-close 独立再検証） | pass（変更節 3箇所とも矛盾なし） | 該当なし | 該当なし | case-run と同一結果（pass） | 該当なし | 該当なし |
| case-close | targeted docs guard（case-close workflow・5ファイル） | pass（failure 0 / warning 0） | 該当なし | 該当なし | case-run（case-run workflow・同対象 5ファイル）pass の再確認 | 該当なし | 該当なし |
| case-close | check_extensions.ts（IR gate） | pass（ok=true） | 該当なし（違反 finding なし。case-run 検証差分に単独行がなく本工程で新規実行） | 該当なし | 該当なし | 該当なし | 該当なし |
| case-close | 配布依存境界 最終 gate（source profile・360ファイル） | pass（違反 0 件） | 該当なし | 該当なし | case-run と同一 detector・同一結果（pass） | 該当なし | 該当なし |
| case-close | full integrity suite（初回・cwd トリビア実行〔scripts ディレクトリ内で bun test 単体〕） | fail（8件。全て `src\opencode\...` 相対パス ENOENT 6件 + 子 spawn JSON EOF 2件） | 該当なし | 該当なし | 該当なし | 8件（bun test 実行形態契約〔repo root cwd + `./` prefix 明示指定〕非準拠による人工的 fail。正規形での再実行により撤回） | 該当なし |
| case-close | full integrity suite（正規形・2639 tests / 107 files） | 2635 pass / 4 fail | 4件（check_integrity.test.ts の子プロセス spawn 15s timeout。assert 未到達） | 該当なし | 該当なし | 該当なし | 4件（check_integrity.ts 直接実行で同等 assert 全件 pass を確認。内容乖離なしの実行環境タイミング起因） |
| case-close | トレーサビリティ check（--req REQ-034-032,REQ-062-006・対象行スコープ） | pass（9 pass / 0 fail・3完全性ゲート合格） | 該当なし | 該当なし | case-run 再検証（REQ-034-032・REQ-094 群・REQ-062-006 完検）と同一結果（pass） | 該当なし | 該当なし |
| case-close | Design 状態評価（棚卸し制・全件評価） | 確定（draft 実質 0 件・昇格対象なし） | 該当なし | 該当なし | PR 本文申告「Design確定候補: 該当なし」と一致 | 該当なし | 該当なし |
| case-close | マージ前状態検査（mergeable・先行 commit・同期リスク事前検出） | pass（mergeable MERGEABLE / mergeState CLEAN。main 側先行 commit 5件の差分は .agentdev/learning/inbox.md のみで PR 変更 5ファイルと重複なし） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |

### adversarial-review 判定

- 判定値: 非発動
- 非発動理由: Issue 本文に adversarial-review 非発動が記録済み（ユーザー明示指定なし。Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）。合意済み Definition（Definition PR #3294 で merge 済み）で確定した実現面変更の実行時投影への機械的同期であり、実装方針の新規合意形成・規範間の優先関係の新規確定を伴わない
- 非発動時の代替自己反証: PR #3305 本文「adversarial-review skip 記録」のとおり（旧境界保持案は REQ-096-004 違反残存を生むため却下、用語注記残存案は TS-001 pass_criteria の残存 0 件要求により不採用、unresolved なし確認）。case-close 再検証でも新規 unresolved の発生なし

### 残課題

- なし（本 Issue の完了条件に関わる残課題なし。TS-001 全領域残存列挙は PR #3305 本文「Findings/ Capture候補」の intake 記録どおり case-ready 系（OU-0002）・case-run 系の最終同期（OU-0008）の承認済み対象範囲として引き継ぎ済み）
````
