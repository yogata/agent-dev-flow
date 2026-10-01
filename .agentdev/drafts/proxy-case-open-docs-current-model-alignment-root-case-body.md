## 概要
<!-- 【必須】 -->

2026-10-01 時点で成立済みの AgentDevFlow 第4世代運用モデルと ADF 判断アーキテクチャ（REQ-096 / DEC-048）、文書種別責務（REQ-001）を、docs/** の現行正規文書全体へ意味的に行き渡らせる。既知の旧判断境界残存（REQ-034-032「一意に回答可能」、REQ-061-003 包括 HITL 条件、case-auto / case-ready / system Design の旧語彙）、Design 履歴混入の再生成契約（REQ-032-025 と agentdev-design-file-manager 系の Design 本文対応記録保存）、Design 本文の履歴表現純化、v3→v4 移行文書の現在責務分離、入口文書の現在像への統合、同一意味重複の限定的縮約、実装・検証投影の最終同期を、単一の意味変更連鎖（共通原則 → REQ → Design → 実行時投影 → 検証）ごとに完了単位として是正する。新しい設計思想の追加、新規 Decision、accepted Decision 本文の変更、新規恒久文書種別の追加は行わない。

機能要件、非機能要件、制約、対象外、受け入れ条件は新規に作成せず合意済み入力を反映する。合意済み本文の正は draft-data（`.agentdev/drafts/req-draft-docs-current-model-alignment-and-compression-foundation.md`、source_rus: RU-20261001-01）である。work_type: maintenance / scale: large。

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とする。取得不能な識別情報は N/A とする -->
- adf_case: ADF_CASE_PLACEHOLDER
- adf_execution_unit: N/A（実行構成未確定。case-ready が execution contract 確定後に確定する）
- adf_harness_ref: N/A

## 対象 REQ
<!-- 【必須】 -->

<!-- case-open は Root Case を確立する際に対象 REQ 番号を埋め込む -->
- REQ-034: case-auto 実行契約（自走オーケストレーション）。REQ-034-032 行の意味更新（ACT-REQ-001）
- REQ-061: case-ready 実行契約。REQ-061-003 行の意味更新（ACT-REQ-002）
- REQ-032: case-close 実行契約（完了判定とマージ）。REQ-032-025 行および適用範囲の見送り記録記述の意味更新（ACT-REQ-003）

## Definition Package
<!-- 【必須】 -->

- 要件行: 既存3行の意味更新（変更後本文の正は draft-data artifact_actions content）。ACT-REQ-001: docs/requirements/REQ-034.md REQ-034-032 行（REQ-096 確定権限3分類ベースの自律解決境界へ）。ACT-REQ-002: docs/requirements/REQ-061.md REQ-061-003 行（人間留保判断・既存安全境界の操作承認ベースへ）。ACT-REQ-003: docs/requirements/REQ-032.md REQ-032-025 行と適用範囲の見送り記録記述（見送り記録保存先を対応記録コメントへ限定、Design 本体保存を除去）
- Decision: 新規 Decision なし。accepted Decision 本文の変更なし（DEC-008 は歴史的判断記録として参照維持、現行境界の正は REQ-096 / DEC-048。CR-003 は REQ・Design 正典からの旧境界参照除去で解消、CR-004 は本 Case 対象外・将来 intake 項目。req-define 段階で合意済み）
- Design: 7件（operation: update。変更内容の正は draft-data artifact_actions content）。ACT-DESIGN-001: docs/designs/commands/case-auto.md（語彙写像横断適用、bounded parent decision resolution、停止理由分類、承認・HITL 境界）。ACT-DESIGN-002: docs/designs/commands/case-ready.md（語彙写像横断適用、Definition 受入・Decision 受理・不整合処理の判断境界）。ACT-DESIGN-003: docs/designs/foundations/system.md（語彙写像横断適用、コマンド概要要約の現行化）。ACT-DESIGN-004: docs/designs/skills/agentdev-design-file-manager.md（accepted 昇格時の対応記録要求を廃止し昇格は状態更新のみへ）。ACT-DESIGN-005: docs/designs/commands/case-close.md（見送り記録保存先を対応記録コメントへ、冪等認定参照先同期）。ACT-DESIGN-006: docs/designs/foundations/v3-v4-crosswalk.md（現行移行機能契約の現在形保持と本体再編履歴の分離）。ACT-DESIGN-007: docs/designs/foundations/v4-migration-and-release.md（現行移行・release 機能の現在形保持と Sequence 等履歴の分離）
- design 対応事前確認（coverage --req 実査、HEAD 8c471d3e）: REQ-034-032 design 対応あり（case-auto.md）、REQ-032-025 design 対応あり（case-close.md）、REQ-061-003 design 対応欠落（0件）を検出。契約どおり REQ-061-003 の ADF-COVERS(design) 宣言追記（docs/designs/commands/case-ready.md、行限定 check の missing-design 解消）を ACT-DESIGN-002 の対象ファイルへ組込み合意を完了
- トレーサビリティポリシー追随: 不要（REQ 行の新設・追記・移管・廃止なし、既存3行の意味更新のみ。traceability/policy.yaml のエントリ追加は不要と判断）
- Issue 構成案: operation_units OU-0001〜OU-0008 8件（全て operation: update、issue_policy: single、scale: standard。依存: OU-0004←OU-0003、OU-0005←OU-0004、OU-0006←OU-0001/0002/0005、OU-0007←OU-0003/0006、OU-0008←OU-0007）。case_open_hints: epic_needed: true（子 Issue 8件）、Wave 構成案 Wave1=OU-0001/0002/0003、Wave2=OU-0004、Wave3=OU-0005、Wave4=OU-0006、Wave5=OU-0007、Wave6=OU-0008。Epic / Child Issue / Wave の作成は case-ready が実行する（本 Case では作成しない）。物理削除を伴う docs-chore OU なし（全 OU operation: update。実行時設定参照の追随検査は対象外）
- 受入条件一式: 決定的受け入れ条件 AC-01〜AC-15（RU-20261001-01 §7。判断権限一貫性、case-auto 親判断解決、case-ready 判断境界、失敗原因別回復、Design 現在形、Design 履歴再生成防止、既存対応記録整理、移行文書責務分離、入口文書現在像、Project Contract 説明、正規所有者一方向化、accepted Decision/Report 履歴保持、実装整合、整合性検査、意味上の完了）とテスト戦略 TS-001〜TS-009（draft-data test_strategy。各 verification / pass_criteria / on_failure は draft-data を正とする）
- realization_actions: RA-001〜RA-006（構造化ハンドオフとして保持。execution contract への投影は case-ready が実行する）
- Definition PR: DEFINITION_PR_PLACEHOLDER

## Case 状態と次工程
<!-- 【必須】 -->

- 状態: open（実装開始不許可。execution contract 確定、Standard / Epic 最終確定、Child Issue / Wave 作成、ready 遷移は case-ready が実行する）
- Definition PR: DEFINITION_PR_PLACEHOLDER2
- 次工程: `case-ready`

## レビュー判断
<!-- 【必須】 -->

- RD-001（source_item: RU-20261001-01-2.1-REQ005）: disposition: covered / reason_code: already_satisfied。REQ-005-029 は 2026-10-01 付で「人間に留保された判断（新しい意味判断、REQ-096 参照）を行わないこと」へ部分整列済み。括弧内の用語注記は REQ-096-027 と同型の正当な言及であり REQ-005 への追加操作は不要。TS-001 の網羅検索で同種残存の有無を再確認。evidence: docs/requirements/REQ-005.md、REQ-005-029、checked_at_commit: 8c471d3e
- RD-002（source_item: RU-20261001-01-2.1-inspect-promote-design）: disposition: covered / reason_code: already_satisfied。inspect-promote Design は「自律確定の判定位置とHITLフォールバック」節（L74-76、L84）で既に REQ-096 を参照し frontmatter に ADF-COVERS(REQ-096-004/005/006/018/022) を持つ。判断境界の正規整列は成立済みで Design 保存操作（artifact_actions）は不要。残る HITL 言及の正当性は TS-001・TS-002 の横断検証で確認。evidence: docs/designs/commands/inspect-promote.md、自律確定の判定位置とHITLフォールバック、checked_at_commit: 8c471d3e
- RD-003（source_item: RU-20261001-01-6-work1-inventory）: disposition: covered / reason_code: superseded_by。RU §6 作業1 の横断インベントリ（単純検索 43 ファイル候補）は draft-data の実測基準（HEAD 8c471d3e で履歴候補表現 15 ファイル、`## 対応記録` 見出し 2 ファイル）へ更新して引き継ぐ。数値差はパターン集合の違いであり単純一致件数を欠陥件数とみなさない。インベントリの確定は RA-005・TS-004 の前置として実施時に完了。evidence: .agentdev/backlog/req-units/RU-20261001-01.md、§6 作業1、checked_at_commit: 8c471d3e

## 補足情報（オプション）

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / draft: `.agentdev/drafts/req-draft-docs-current-model-alignment-and-compression-foundation.md` / source_rus: [RU-20261001-01]
- work_type: maintenance / scale: large / case_open_hints: epic_needed true・Wave 6本
- 作業基準版: agent-dev-flow-main-2026-10-01.zip（RU §5.3）。HEAD が基準より進む場合は既知 finding の現存確認を前置し解消済み箇所へ古い修正を再適用しない（RA-005・TS-004 の前置として case-run で実施）
- adversarial-review: skip（REQ-015-003。Root Case 本文候補と Definition Package 構成案は合意済み draft-data の機械的投影のみで新しい意味的決定を含まず、ユーザー明示指定なし。req-define 段階の review_dispositions RD-001〜003 を本 Issue へ転記済み）
- GitHub I/O 切替記録: Custom Tool `agentdev_gh` が gh exit 66（起動環境障害、stderr 空）を全操作で持続（issue_read 2回・issue_list 1回・issue_create 1回が失敗。gh CLI 単体実測は auth / repo view / issue list / pr view すべて正常）。REQ-093 既知事象（serve プロセス内部の spawn 劣化、回復は serve 再起動のみ）と learning inbox 先例に従い、gh 非依存工程を先行完了の上 proxy payload として本ファイルへ永続化した
