---
draft_type: req_draft
topic_slug: corpus-renewal-20261121
status: draft
created_at: 2026-11-21T18:58:44+09:00
source_rus: [RU-20261121-01, RU-20261121-02, RU-20261121-03, RU-20261121-04, RU-20261121-05, RU-20261121-06, RU-20261121-07, RU-20261121-08, RU-20261121-09, RU-20261121-10]
---

# draft-data

```yaml
work_type: feature
scale: large
summary: >-
  backlog-auto stage 4（一式識別子 20261121-171426・基準点 v5.2.3・開始コミット 5872539bc）で承認確定した RU 10件を単一要件docに統合した。
  inspect 59検出事項を統合した現行化 7 RU（公開コマンドモデル・完了済み作業パッケージ RETIRE・integrity 系 Design corpus・文書種別配置モデル系 Design・workflow command 系 Design・REQ 行現行化と参照整合・docs 入口 guides 層）と、
  learning 由来の機能追加候補 3 RU（req-define の IR-044 シグナル語事前走査・worktree-operations.md の junction 判定規約補記・検索型合格条件の解釈注記指針）からなる。
  壁打ち判断事項 Q1〜Q8 は利用者回答（Q1=B; Q2=A; Q3=A; Q4=A; Q5=A; Q6=B; Q7=A; Q8=A・RETIRE 提案への異議なし）で確定済み。
  新規 Decision は作らず、既存 DEC-006/DEC-021 への部分置換注記で整合を回復する。
  REQ・Decision 層の変更は artifact_actions（Definition 保存対象）とし、Design・docs・配布 skill の現行化作業は operation_units 10 件として後続実行工程に引き渡す。
  実行適用は本 doc の範囲外であり、後続の実行工程が担当する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: RU 10件を単一の draft に統合し、operation_units 10 件（OU-001〜OU-010、RU と 1:1 対応）で表現する。複数要件docへの分割は行わない。新規作成 REQ は作業単位行（10 行）を収容し、SPLIT シグナルは要件行数 10 行で閾値未満。scale は large（実装スコープシグナル: inspect 59検出事項カタログ・影響ファイル一覧 40 超・修正候補リスト 10 件を含むため large 昇格、昇格理由は提示工程で利用者へ提示する）。
  - id: AG-002
    content: 公開コマンド集合・内部 workflow モデルへの現行化（OU-001）。REQ-036-002・REQ-041-016 を正規参照表モデル（公開8コマンド・inspect/learning/intake 系5処理は backlog-auto が Workflow Skill として駆動する内部 workflow）へ現行化する。DEC-006 は利用者回答 Q1=B により status: accepted を維持した上で、決定2（3件正規化）の部分置換注記（後継参照: v5 再編・正規参照表）を本文へ追記する。新規 Decision は作らない。配布 command backlog-auto 本体・workflow-skill-model Design の command 数・分類実数（DESIGN-31）・intake-promote.md の実リンク切れ2件と不存在 Design へのリンク1件（DESIGN-30）・guides glossary/troubleshooting の不存在入口名 intake-capture（DOC-07）と inspect 系コマンド分類（DOC-08）を現行所有者へ付け替える。各 Workflow Skill soft guard の宣言と正規参照表の整合を検収条件に含める。
  - id: AG-003
    content: 完了済み作業パッケージ REQ-119/REQ-120/REQ-122 の RETIRE（OU-002）。利用者回答により異議なし確定。根拠: traceability/req-122-wave4-phase4.yaml の実行済み記録、pre-commit 廃止（AGENTS.md 最上位制約・local-verification-gates Design・commit aeec56f38）、intake-triage 統合削除記録（traceability/policy.yaml:916-918）、IR-072 廃止（DEC-065 決定2）、REQ-120 集約先パス不存在。行単位の部分現行化はしない。RETIRE の一括解消は REQ-058（廃止時クリーンアップ契約）に従い実施する。参照残存確認の実測: traceability/ 配下 15 ファイル（69 箇所）、docs/ 配下 28 ファイル（docs/reports/ は履歴記録領域として対象外）、traceability/policy.yaml の verification スコープ（REQ-018-006/007・REQ-120/122 系エントリ）、DEC-065/DEC-066 frontmatter related_reqs（REQ-122）。付随: integrity-engine-plugin-architecture.md の intake-triage 幽霊参照（DESIGN-04・REQ-04 同根）除去、REQ-038-006 の調整注記（REQ-122 RETIRE 実行と同時実施の実行計画上の調整・硬依存ではないため depends_on としない）、REQ-123 内の REQ-122 参照の整理。
  - id: AG-004
    content: integrity 系 Design corpus の陳腐化参照現行化（OU-003・13件統合）。廃止済み command-file-format.md 参照6箇所の現行所有者（quality-specs.md・skill-authoring/command-authoring 各 Design）への付け替え（DESIGN-01）、不存在移行計画への規範参照3件の解消（DESIGN-02）、baseline 運用廃止後の concrete-abstraction.md と IR-064/067/068 の baseline 記述現行化（DESIGN-03/08・形式模範は IR-055 更新済みテーブル）、rule-ownership.md の削除済み IR-047/048 現行記述（DESIGN-05）・実装パス cli.ts ＋ engine ＋ rules/ レジストリ現行化（DESIGN-06）・不存在節参照除去（DESIGN-16）、vocabulary-registry.md の扱いは利用者回答 Q2=A により参照除去・現行所有者（quality-specs.md 等）への付け替えと IR-055/058 除外リスト現行化（7ドキュメント・後継レジストリ復元は行わない）、安定実装契約パスの src/common/skills/repo-agentdev-integrity/trusted-distribution-gate 現行化（DESIGN-09）、req-impact-map.md の IR-047/048 存続記述と幽霊後継 IR-074 参照除去（DESIGN-15）、references 移管後の孤立フラグメント2件削除（DESIGN-18）、integrity-contracts.md の不実行 command 記述・廃止 ADR 語彙・CLI 注記現行化（DESIGN-14・OU-001 と共有対象のため同時実施調整）、DEC-064 懸垂参照2箇所（req-impact-map・integrity-rule-catalog）の利用者回答 Q3=A による参照付け替え（現行判断実体は DEC-067・削除は commit 1e33e0125）と decisions/README.md への欠番散文追記（DEC-018 前例様式）。
  - id: AG-005
    content: 文書種別・配置モデル系基盤 Design の現行化（OU-004・7件統合）。harness-separation-model.md の完了済み移行の現在時制化（DESIGN-10）、artifact-responsibilities.md:92 の原本配置を DEC-049・multi-host-canonical-model の src/common 正本へ付け替え（DESIGN-12）、artifact-contracts.md の旧パス（src/common/tools/）と現行3本スクリプト（setup-hooks.ts・install.ps1・self-sync.ps1）への現行化（DESIGN-13）、document-type-responsibilities.md の完了済み修正の未来記述現行化・固定件数記述の同ファイル規則に従う除去・計画残骸除去（DESIGN-19）、幽霊所有者 textlint-quality-runtime の agentdev-textlint-guard（DEC-047）への付け替え（DESIGN-20）、numbering-policy.md の ADR 移行現在時制化と現行スクリプト名 alloc-decision-number.ts への付け替え（DESIGN-21）、durable-state-and-recovery.md の本文なし見出し残骸除去（DESIGN-22）。
  - id: AG-006
    content: workflow・command 系 Design の現行化（OU-005・9件統合）。case-close.md Design の移管済み節参照を case-auto/references/parallel-orchestration.md へ付け替え（DESIGN-24）、scale 判定「feature のみ」の2 Design を canonical（standard-lifecycle・SKILL 本体宣言の全 work_type）へ現行化（DESIGN-25）、workflow-lifecycle Design の references 列挙とマクロ/マイクロ対応記述を SKILL 本体宣言へ整合（DESIGN-26）、case-run Design See Also の廃止構成記述除去（DESIGN-27）、delegation-contracts.md の controlled_case_execution は利用者回答 Q4=A により現行用途（単一 Issue 実行委譲・result 4状態付き実行担当サブエージェント委譲）へ再定義し廃止済み Epic/Wave 参照を除去（DESIGN-28）、accepted Design 内将来計画混入の (2)〜(5) は現行化または削除、(1) の phase 系 Design は利用者回答 Q5=A により新設整備を行わず将来計画記述を削除現行化（DESIGN-32）、完遂済み歴史段階債務記述3箇所の参照解除（DESIGN-33・Minimal-by-Default で現行の姿のみを残す）、STEP-W* 識別子の現行 STEP-S1〜S6 への付け替え（DESIGN-34）、編集ラベル残存5箇所の除去（DESIGN-35）。
  - id: AG-007
    content: REQ 行の現行化・参照整合・MOVE 判定（OU-006・12件統合）。REQ-034-025 の参照先を REQ-002-004 から正規所有 REQ-035-004（pending 戻し所有）へ修正。REQ-116-002 の RA-005 同名異義（REQ-111 realization action との衝突）を解消し判断記録の正（docs/knowledge/gh-isolated-verification-repository.md）への参照を付与。REQ-116-005 に Case #3779 処置完遂後に歴史化対象となる条件注記を追加。REQ-110 TS-012 の消費済み一時成果物 RU-0242 への間接依存を現行の対象宣言（traceability YAML 群）への参照へ置換。REQ-061 内の名前参照「Epic と Wave 実行モデル REQ」2箇所（本文・対象外）へ REQ-035 の ID 併記。REQ-009-002 を現行正（REQ-050-001 3本構成）へ要約更新し、DEC-021 は利用者回答 Q6=B により status: accepted を維持した上で部分置換注記（後継参照: DEC-066〔setup-hooks.ts 新設〕と REQ-050-001）を本文へ追記、新規 Decision は作らない。REQ-004-066〜068 は委譲先（draft-generation.md が同一内容を正規所有・REQ-004-065 の委譲関係は維持）への MOVE 判定により行削除、covers（req-define.md command Design・agentdev-design-file-manager.md Design）と traceability sidecar の該当エントリ整理を含む。REQ-018-006/007 は委譲先（agentdev-git-worktree skill references〔worktree-operations.md〕・REQ-018-002 の明文化契約）への MOVE 判定により行削除、covers（agentdev-git-worktree-test-fallback.md Design）と traceability/agentdev-git-worktree.yaml・policy.yaml の該当エントリ整理を含む。REQ-038-006 は内部保存構造と読込アルゴリズムの規範化を委譲表現へ現行化（REQ-008 対象外条項との重複解消）。REQ-030 の STEP 番号直接参照行（実測 3行: REQ-030-012/027/030）を機能名・段階名参照へ現行化（IR-044 系・RU-08 の事前走査と相互参照）。REQ-032-011 の「上級オーケストレータ」を case-auto 用語へ統一。REQ-012 の ADF-COVERS 宣言（REQ-012-026/042）を要件表分断状態から文書先頭へ移動。REQ 行の廃止・移管に伴う旧行 ID 参照残存確認は実施済み（docs/・traceability/・extensions yaml 網羅・docs/reports/ は履歴記録領域として除外）で、検出分は本 AG の covers/sidecar 整理に織り込み済み。
  - id: AG-008
    content: docs 入口・guides 層の現行化（OU-007・6件統合）。docs/README.md の横断 Design 索引・integrity 索引の正本対し5行欠落補完と authoring 所有者記述の正本（designs/README.md・quality-specs ＋ skill/command-authoring 各 Design）整合を同時実施（DOC-01/10）、guides 層の REQ-111-013 併存契約無リンク再述4箇所へリンク付与または縮約（DOC-03・guides 層は規範的権限を持たない前提を維持）、guides の日付付き履歴叙述を正規記録箇所（decisions/README.md:298）への参照導線に置換（DOC-05）、PR セクション名「Findings / Capture候補」のテンプレート実見出し（pr_desc.md）への表記統合をテンプレート側も含め一括是正（DOC-06）、guides の「の正」権限語表記修正（DOC-09）。
  - id: AG-009
    content: req-define の draft 産出・組立工程への IR-044 シグナル語事前走査の追加（OU-008・機能追加）。IR-044 ルール定義のシグナル語パターン（Step 番号直接参照・Phase 番号・schema/enum/テストデータ/チェッカー個別ルール/FP 抑制/内部アルゴリズム/作業履歴）に従い、ドラフト組立時点でシグナル語を走査し表記ガイダンス（段階名・機能名参照への置換、前例 REQ-006-099）を適用する。利用者回答 Q7=A により IR-044 exemption 条件整備とゲート warning 扱い変更は行わない（既存統制を変更しない・予防は事前走査で担う・実害再発時は DEC-067 手続で再評価）。case-open Design の停止理由分類への IR-044 由来物理ブロックの記録候補を含める。恒久命題のため REQ-004 へ追記行を保存する（ACT-REQ-015）。対象外: 合意済み REQ 行（REQ-123-003〜005）の表記修正・hook 実装自体の変更・Root Case #4167 の後始末。本バッチ自身の draft にも走査を適用する（dogfooding・TS-008 の合格条件に含む）。
  - id: AG-010
    content: worktree-operations.md への junction 判定規約補記（OU-009）。src/common/skills/agentdev-git-worktree/references/worktree-operations.md の junction 作成・削除手順節へ「Dirent ベース判定は使用不可・fs.lstatSync または PowerShell Get-Item の LinkType -eq 'Junction' を使用」の補記と、junction 列挙・復元系スクリプト手順への期待件数突合（0件を異常扱いする fail-fast）観点の明示を追加する。投影同期（src/common → .opencode）を含める。知識面の詳細は docs/knowledge/windows-junction-detection-not-symlink-in-dirent.md（保存済み）を参照。REQ-018-002 の既存委譲契約の反映であり新規 REQ 行は付けない。対象外: Linux/macOS 環境の symlink 判定・junction 構造自体の変更。
  - id: AG-011
    content: 検索型合格条件の解釈注記指針の req-define 契約面への反映（OU-010・機能追加）。利用者回答 Q8=A により反映する。req-define の検索型合格条件作成ガイダンスに「REQ 本体の定義行・網羅範囲外領域（docs/reports/ 等・完了条件文言に従う領域）を計上対象外とする解釈注記を事前に含める」指針を追加し、解体系 REQ 実行時の Findings 根拠記録必須運用（case-close で確認）の明文化先を req-define 契約面とする。恒久命題のため REQ-004 へ追記行を保存する（ACT-REQ-016）。知識面の解釈基準詳細は docs/knowledge/grep-zero-criteria-legacy-term-quotation.md（更新済み）を参照。対象外: 検査側（grep 0件基準・IR）の実装変更・REQ-123 本体の完了条件文言変更。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:corpus-renewal-20261121
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011]
    content: |
      # 要件ファイル新設本文（REQ 番号と要件行 ID は保存時の決定的採番結果を正とする。以下の行番号は作業単位順を示す）

      ---
      id: <alloc>
      title: "backlog 一式 20261121 の corpus 現行化と req-define 面強化（10 作業単位）"
      created: <save-date>
      updated: <save-date>
      ---

      ## 目的

      backlog-auto 一式識別子 20261121-171426（stage 4・基準点 v5.2.3・開始コミット 5872539bc）で承認確定した RU 10件を収容する。
      inspect 59検出事項を統合した現行化 7 RU と learning 由来機能追加候補 3 RU を単一 REQ の 10 作業単位として所有する。
      各行は達成状態が判定可能な命題として書かれ、検証手段は検証列（TS-001〜TS-010）と全体統合検証（TS-011）に従う。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | <alloc>-001 | 公開コマンド集合・内部 workflow モデルの現行化: REQ-036-002・REQ-041-016 を正規参照表モデル（公開8コマンド・inspect/learning/intake 系5処理は内部 workflow）へ現行化し、DEC-006 に部分置換注記を追記し、配布 command 本体・workflow-skill-model Design・guides の旧モデル記述とリンク切れを現行所有者へ付け替えること。各 Workflow Skill soft guard の宣言と正規参照表の整合を検収条件に含めること | 旧モデル記述（単独実行・既存5コマンド・3件構成）が修正対象集合で 0 件となり soft guard 宣言と正規参照表が整合すること | TS-001 |
      | <alloc>-002 | 完了済み作業パッケージ REQ-119・REQ-120・REQ-122 を RETIRE 判定し、REQ-058 の廃止時クリーンアップ契約に従い REQ ファイル・索引行・traceability sidecar・policy.yaml・docs 内参照を一括解消すること。行単位の部分現行化はしないこと | REQ 3件の実ファイルが不存在となり規範参照（reports/ と retired 明示マーキングを除く）が 0 件となること | TS-002 |
      | <alloc>-003 | integrity 系 Design corpus の陳腐化参照を現行所有者へ現行化すること（廃止済み command-file-format 参照付け替え・不存在移行計画参照解消・baseline 記述現行化・vocabulary-registry 参照除去現行化〔後継復元は行わない〕・IR-055/058 除外リスト現行化・DEC-064 懸垂参照の付け替えと欠番散文追記・安定実装契約パス現行化・孤立フラグメント除去） | 対象集合で DEC-064・vocabulary-registry・command-file-format の現行参照が 0 件となり docs-check 全量が通過すること | TS-003 |
      | <alloc>-004 | 文書種別・配置モデル系基盤 Design を現行正本へ現行化すること（原本配置・Custom Tool 原本パス・scripts 名の現行化・幽霊所有者 textlint-quality-runtime の付け替え・完了済み移行の現在時制化・空見出しと計画残骸と固定件数記述の除去） | 旧パス・旧スクリプト名・幽霊所有者が修正対象集合で 0 件となること | TS-004 |
      | <alloc>-005 | workflow・command 系 Design を現行構成へ現行化すること（移管済み節参照の現行所有 references への付け替え・scale 判定と references 列挙の canonical 整合・STEP-W* 識別子の現行 STEP-S1〜S6 への付け替え・編集ラベル除去・controlled_case_execution の単一 Issue 実行委譲への再定義・将来計画記述の削除現行化〔phase 系 Design 新設は行わない〕・完遂済み歴史段階債務記述の参照解除） | STEP-W*・編集ラベル・廃止構成参照・将来計画記述が修正対象集合で 0 件となり controlled_case_execution が現行用途を参照すること | TS-005 |
      | <alloc>-006 | REQ 行の現行化・参照整合・MOVE 判定を実施すること（REQ-034-025 参照先修正・REQ-116-002 同名異義解消と判断記録正への参照付与・REQ-116-005 歴史化条件注記・REQ-110 TS-012 間接依存解消・REQ-061 ID 併記・REQ-009-002 要約更新〔DEC-021 は部分置換注記で後継参照を明記・新規 Decision は作らない〕・REQ-004-066〜068 と REQ-018-006/007 の委譲先移管〔行削除と covers/sidecar 参照切りを含む〕・REQ-038-006 委譲表現化・REQ-030 STEP 番号直接参照行の段階名参照化・REQ-032-011 用語統一・REQ-012 宣言配置移動）。旧行 ID を指す参照の残存は docs/・traceability/・extensions yaml で 0 件とすること | 各行の変更後文言が適用後成果物に verbatim 存在し旧行 ID 参照残存が 0 件となること | TS-006 |
      | <alloc>-007 | docs 入口・guides 層を現行化すること（docs/README.md 索引5行補完と authoring 所有者記述の正本整合・guides の無リンク再述へのリンク付与または縮約・履歴叙述の正規記録箇所への参照導線置換・PR セクション名のテンプレート実見出しへの統合・guides の権限語表記修正） | 索引欠落5行が補完され正本との乖離記述が 0 件となること | TS-007 |
      | <alloc>-008 | req-define の draft 産出・組立工程へ IR-044 シグナル語事前走査と表記ガイダンス適用を追加すること（IR-044 ルール定義のシグナル語パターンに従う。exemption 条件整備とゲート warning 扱い変更は行わない。case-open Design の停止理由分類への IR-044 由来物理ブロックの記録候補を含める） | シグナル語を含む入力でドラフト組立時の検出とガイダンス適用が確認できること | TS-008 |
      | <alloc>-009 | worktree-operations.md の junction 作成・削除手順節へ判定規約補記を追加すること（Dirent ベース判定は使用不可・fs.lstatSync または PowerShell Get-Item の LinkType -eq 'Junction' を使用・期待件数突合〔0件を異常扱いする fail-fast〕の観点明示・投影同期を含む） | 補記が該当節に存在し投影同期が確認できること | TS-009 |
      | <alloc>-010 | 検索型合格条件作成ガイダンスへ解釈注記指針を反映すること（REQ 本体の定義行・網羅範囲外領域〔docs/reports/ 等・完了条件文言に従う領域〕を計上対象外とする解釈注記を事前に含める。Findings 根拠記録必須運用の明文化先を req-define 契約面とする） | 指針が反映先に存在し検索型合格条件のサンプル適用で解釈注記が付与されること | TS-010 |

      ## 適用範囲

      - 対象: OU-001〜OU-010 の対象集合（正規参照表系・integrity 系 Design corpus・文書種別配置モデル系 Design・workflow command 系 Design・REQ 11ファイル・docs 入口 guides 層・req-define 契約面・worktree-operations.md）
      - 対象外: 一式外の RU・ドラフト・Issue、pre-commit/pre-push hook 実装自体の変更、Root Case #4167 の後始末、REQ-123-003〜005 の表記修正（req-define 再合意を要する別判断）、docs/reports/ 配下（履歴記録領域）、REQ-018 の配置先契約（REQ-018-008）

      ## 検証

      検証手段は要件テーブルの検証列（TS-001〜TS-010）に加え、全体統合検証（TS-011・docs-check 全量・traceability check〔missing-design 0件・参照切れ 0件〕・検証エンジン テストスイート〔REQ-060 の実行形態〕）で行う。

      ## 備考

      入力根拠は RU-20261121-01〜10 の 10 件（明示列挙・depends_on なし・tentative_classification REQ → 最終分類 REQ 確定）。RETIRE 判定（REQ-119/120/122）は壁打ち Q1〜Q8 の利用者回答で異議なし確定。REQ 番号と要件行 ID は決定的採番スクリプト（alloc-req-number.ts・alloc-composite-id.ts）の採番結果を正とする。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    source_items: [AG-002]
    content: |
      目的節の現行化（2行）: 「本 REQ は、検出処理群（inspect-docs、inspect-skills、inspect-promote）と検出ドメインの命名・用語基盤を所有し、docs と配布物の意味診断、検出事項の分類・昇格の実行責務を担う。検出処理は backlog-auto が Workflow Skill として駆動する内部 workflow であり、公開コマンド集合の正は正規参照表（src/common/commands/agentdev/README.md）である。」
      「3 command は DEC-006（inspect 3-command 構成への正規化）が定める単一の正規化単位であり、本 REQ の関心単位とする。」の行は「inspect 系処理の責務分離（決定的検査・意味診断・処分）の原則は DEC-006 の部分置換注記（v5 再編後の現行モデルへの後継参照）と整合して維持され、本 REQ の関心単位とする。」へ置換。
      REQ-036-002 の置換後文言: 「公開コマンド集合の正は正規参照表（公開8コマンド・inspect/learning/intake 系5処理は backlog-auto が Workflow Skill として駆動する内部 workflow）とすること。inspect 系処理の責務分離（決定的検査を IR-056 / docs-check、意味診断を inspect-skills、finding 処分を inspect-promote workflow）を維持すること」
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-041.md
    source_items: [AG-002]
    content: |
      目的節: 「子コマンド（inspect-docs、inspect-promote、learning-promote、intake-promote、backlog-review）の各実行責務は REQ-036〜REQ-039 が所有する」を「子処理（inspect・learning・intake 系5処理、backlog-review）の各実行責務は REQ-036〜REQ-039 が所有する」へ、「既存の個別コマンドを置換せず」を「既存の個別処理を置換せず」へ現行化。
      REQ-041-016 の置換後文言: 「子処理（inspect・learning・intake 系5処理および backlog-review）は backlog-auto が Workflow Skill として駆動する内部 workflow であり、backlog-auto がその公開契約を変更しないこと（子 workflow 自身の契約変更は各所有 REQ の正規変更経路による）。通常の backlog-auto 実行によって inspect-promote --auto を暗黙的に有効化しないこと」
      対象外行: 「既存5コマンドの廃止、置換、単独実行契約の変更」を「子処理（内部 workflow）の公開契約の変更」へ現行化。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    source_items: [AG-007]
    content: |
      REQ-009-002 の置換後文言: 「同一リポジトリ内の同期と導入先へのインストールは別手段として分離すること。scripts/ 直下の公開入口の境界（現行は REQ-050-001 の3本構成、モード、誤実行防止）は REQ-050 が所有する」
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-034.md
    source_items: [AG-007]
    content: |
      REQ-034-025 内の参照修正（意味不変）: 「REQ-002-004 の pending 戻し対象は当該実行の後続 stage から除外して再開時に扱う」を「REQ-035-004 の pending 戻し対象は当該実行の後続 stage から除外して再開時に扱う」へ置換（pending 戻しの正規所有は REQ-035-004）。
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-116.md
    source_items: [AG-007]
    content: |
      REQ-116-002 の現行化: 「RA-005 判断（代替の構造的等価性は同等以上と認めない）」を「REQ-116 系の処置判断 RA-005（GitHub 版隔離検証環境の代替構造は production-equivalent verification として同等以上と認めない判断。判断記録の正は docs/knowledge/gh-isolated-verification-repository.md）」へ置換し REQ-111 の realization action との同名異義を解消する。
      REQ-116-005 に文末へ条件注記を追加: 「本行の処置は Case #3779 の完遂をもって歴史化対象となる（完遂後の本行の状態整理は当該 Case の完了工程で行う）。」
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-110.md
    source_items: [AG-007]
    content: |
      TS-012 の現行化（消費済み一時成果物 RU-0242 への間接依存の解消・REQ-103-020 と REQ-008 整合）: 「各工程系コマンドおよびワークフロースキル（RU-0242 の対象と同一のファイル群）は」を「各工程系コマンドおよびワークフロースキル（対象ファイル群の正は traceability/agentdev-workflow-phase-*.yaml 各ファイルおよび traceability/agentdev-phase-theme-collaboration.yaml の対象宣言）は」へ置換。
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-061.md
    source_items: [AG-007]
    content: |
      名前参照の ID 併記（2箇所・表記統一）: 「Epic/Wave 実行モデルの実行規則は Epic と Wave 実行モデル REQ が所有し」を「Epic/Wave 実行モデルの実行規則は Epic と Wave 実行モデル REQ（REQ-035）が所有し」へ、対象外行の「Epic/Wave 実行モデルの実行規則（Epic と Wave 実行モデル REQ）」を「Epic/Wave 実行モデルの実行規則（REQ-035）」へ置換。同一文書内の他参照様式（ID 併記）と整合させる。
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    source_items: [AG-007]
    content: |
      REQ-004-066・REQ-004-067・REQ-004-068 の行削除（MOVE 判定: コード囲み認識規則の Design 詳細は委譲先 draft-generation.md が同一内容を正規所有・REQ-004-065 の委譲関係と転記規約行は維持）。付随の参照切り: docs/designs/commands/req-define.md の ADF-COVERS(design) REQ-004-066/067/068 行、docs/designs/skills/agentdev-design-file-manager.md の ADF-COVERS(design) REQ-004-066/067 行、traceability/agentdev-workflow-req-define.yaml・traceability/agentdev-design-file-manager.yaml の REQ-004-066〜068 エントリの除去。
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-018.md
    source_items: [AG-007]
    content: |
      REQ-018-006・REQ-018-007 の行削除（MOVE 判定: fs API・パス形式の実装詳細は委譲先 agentdev-git-worktree skill references〔worktree-operations.md〕と REQ-018-002 の明文化契約が正規所有・REQ-018-002 と REQ-018-005/008 は維持）。付随の参照切り: docs/designs/skills/agentdev-git-worktree-test-fallback.md の ADF-COVERS(design) から REQ-018-006/007 を除去、traceability/agentdev-git-worktree.yaml・traceability/policy.yaml の該当エントリ整理。
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: docs/requirements/REQ-038.md
    source_items: [AG-007]
    content: |
      REQ-038-006 の委譲表現化: deferred プールの保存構造・命名・frontmatter スキーマと突合スコープの読込アルゴリズム詳細（1トピック1ファイル・2フェーズ読込の内部規定）を REQ 側の規範から除外し、「learning-promote の deferred 読込は deferred プールに対してプールサイズに依存しない突合スコープで行い、候補0件または判定が曖昧なエントリの全面読みフォールバックを契約とすること。プールの保存構造・スキーマ・読込アルゴリズムの詳細は learning pipeline 系 Design と REQ-008 の対象外条項へ委譲する。処分区分・living pool 維持・自動削除禁止（REQ-003-024）の意味仕様は変更しないこと」へ置換。実施時期は OU-002（REQ-119/120/122 RETIRE・参照一括解消）と同時実施の実行計画上の調整対象（硬依存ではない）。
  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: docs/requirements/REQ-030.md
    source_items: [AG-007, AG-009]
    content: |
      STEP 番号直接参照行の段階名参照化（REQ-001-049 整合・実測 3行）:
      REQ-030-012 冒頭「case-open は STEP-5 冪等確認の実行時、」を「case-open は draft と未クローズ Case 群の冪等確認の実行時、」へ。
      REQ-030-027 冒頭「case-open は STEP-4 受入検査で、」を「case-open は artifact_actions の受入検査で、」へ。
      REQ-030-030 冒頭「case-open は STEP-4 機械工程で DefinitionEdit の入力 JSON を組立後、」を「case-open は DefinitionEdit の入力 JSON の組立後機械事前確認で、」へ。
      残存する STEP 番号直接参照の有無は実行工程の IR-044 シグナル語事前走査（AG-009）で最終確認する。
  - id: ACT-REQ-013
    artifact: req
    operation: update
    target: docs/requirements/REQ-032.md
    source_items: [AG-007]
    content: |
      REQ-032-011 の置換後文言: 「case-close は rebase でコンフリクトが発生した場合実装変更を行わず case-auto へエスカレーションすること」（「上級オーケストレータ」を REQ-003-016・REQ-034 の case-auto 用語へ統一）。
  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-007]
    content: |
      配置修正のみ: 要件テーブル内に存在する「<!-- ADF-COVERS(implementation): REQ-012-026, REQ-012-042 -->」宣言を文書先頭（frontmatter 直後・要件表の直前）へ移動する。inline 宣言自体は REQ-012-054 で正当・正規配置は文書先頭。要件表の分断を解消する。
  - id: ACT-REQ-015
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    source_items: [AG-009]
    content: |
      追記行（ID は保存時採番）: 「req-define は draft の産出・組立工程で IR-044 ルール定義のシグナル語パターン（Step 番号直接参照・Phase 番号・schema/enum・テストデータ・チェッカー個別ルール・FP 抑制・内部アルゴリズム・作業履歴）による事前走査を実施し、検出時に表記ガイダンス（段階名・機能名参照への置換）を適用してから draft を確定すること。IR-044 の exemption 条件整備とゲート warning 扱いの変更は本行の対象としないこと」
      design 対応: agentdev-workflow-req-define 側の組立手順 Design 更新（OU-008 実装）と covers 付与を case-ready 前後で整合させる調整を case_open_hints に記録。
  - id: ACT-REQ-016
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    source_items: [AG-011]
    content: |
      追記行（ID は保存時採番）: 「req-define は検索型合格条件（rg 等の検索で合格判定する条件）を作成する際、REQ 本体の定義行・網羅範囲外領域（docs/reports/ 等・完了条件文言に従う領域）を計上対象外とする解釈注記を事前に含めること。解体系 REQ 実行時の Findings 根拠記録必須運用の明文化先は req-define 契約面とすること」
      design 対応: 反映先ガイダンスの Design 更新（OU-010 実装）と covers 付与を case-ready 前後で整合させる調整を case_open_hints に記録。
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-006.md
    source_items: [AG-002]
    content: |
      本文へ部分置換注記を追記（status: accepted 維持・frontmatter updated 更新・DEC-041 型の部分置換記録様式）:
      「部分置換記録: 決定2（公開 inspect command 集合の3件正規化）は v5 再編（公開経路の8コマンド収斂と inspect/learning/intake 系5処理の内部 workflow 化・REQ-108/REQ-114 系の責務再編）により部分置換された。現行の正は正規参照表（src/common/commands/agentdev/README.md）と各 Workflow Skill の soft guard である。決定3（extension 検査の3層責務分離・責務割当表の原則）は現行の内部 workflow 構成に継承される。」
  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-021.md
    source_items: [AG-007]
    content: |
      本文へ部分置換注記を追記（status: accepted 維持・frontmatter updated 更新）:
      「部分置換記録: 決定1の公開入口2本固定は、ローカル Git Hook 検証ゲートの導入（DEC-066・scripts/setup-hooks.ts 新設）により部分置換された。現行の公開入口集合の正は REQ-050-001（install.ps1・self-sync.ps1・setup-hooks.ts の3本）である。決定2（公開入口名の安定契約・追加は後継 Decision を要する）と決定3（公開入口としない内部処理区分）は維持する。」
  - id: ACT-DEC-003
    artifact: decision
    operation: update
    target: docs/decisions/README.md
    source_items: [AG-004]
    content: |
      現行 Decision 節の欠番散文（DEC-018 記載の隣）へ追記:
      「DEC-064 は欠番であり、対応する Decision ファイルは存在しない。実験前提に基づく既存統制変更原則の採用に関する判断であったが、現行の判断実体は DEC-067（仮説に基づく既存統制変更原則）が部分置換・継承しており、ファイルはスリム化整理で削除された。削除後の参照解決は Git 履歴で行う。」
  - id: ACT-DEC-004
    artifact: decision
    operation: update
    target: docs/decisions/DEC-065.md
    source_items: [AG-003]
    content: |
      frontmatter related_reqs から REQ-122 を除去し、本文 関係 節へ1文追記: 「REQ-122（整合性検証体制の刷新・RETIRE 判定済みの完了済み作業パッケージ）は本決定の実行 REQ であった。削除後の参照解決は Git 履歴で行う。」
  - id: ACT-DEC-005
    artifact: decision
    operation: update
    target: docs/decisions/DEC-066.md
    source_items: [AG-003]
    content: |
      frontmatter related_reqs から REQ-122 を除去し、本文 承認記録 節末尾へ1文追記: 「関連した REQ-122 は RETIRE 判定済みの完了済み作業パッケージであり、削除後の参照解決は Git 履歴で行う。」
conflict_resolutions:
  - id: CR-001
    conflict: REQ-009-002「2本限定」と REQ-050-001「3本限定」（実ファイル3本）の矛盾・DEC-021 後継 Decision 不存在（REQ-13）
    resolution: REQ-050-001 を現行正として REQ-009-002 を要約更新し、DEC-021 は部分置換注記（後継参照: DEC-066 と REQ-050-001）で整合を回復する。利用者回答 Q6=B で確定。新規 Decision は作らない（3本化の Decision レベル判断は DEC-066 が既に担う）
  - id: CR-002
    conflict: REQ-036-002・REQ-041-016・DEC-006 の公開 inspect 3-command モデルと現行正規参照表モデルの矛盾（REQ-01/02・DESIGN-29）
    resolution: REQ 2行を現行参照表モデルへ現行化し、DEC-006 は部分置換注記（後継参照: v5 再編・正規参照表）で整合を回復する。利用者回答 Q1=B で確定
  - id: CR-003
    conflict: 廃止済み vocabulary-registry.md を現行正として扱う7ドキュメント（DESIGN-07）
    resolution: 参照除去・現行所有者（quality-specs.md 等）への付け替えと IR-055/058 除外リスト現行化。後継レジストリ復元は行わない。利用者回答 Q2=A で確定（DEC-065 廃止決定順合）
  - id: CR-004
    conflict: 不存在 DEC-064 への懸垂参照2箇所と承認記録内言及（DOC-02）
    resolution: 現行判断実体は DEC-067 が部分置換・継承しているため参照を DEC-067 または Git 履歴参照へ付け替え、decisions/README.md に欠番散文を追記する。ファイル復元は行わない。利用者回答 Q3=A で確定
  - id: CR-005
    conflict: delegation-contracts.md の controlled_case_execution が廃止済み Epic/Wave 実行を参照（DESIGN-28）
    resolution: 現行用途（単一 Issue 実行委譲・result 4状態付き）への再定義。委譲種別行の削除は実行 adapter 系参照を欠落させるため行わない。利用者回答 Q4=A で確定
  - id: CR-006
    conflict: accepted Design 内の将来計画混入 (1) の phase 系 Design 整備要否（DESIGN-32）
    resolution: phase 系 Design は新設整備しない（REQ-110/111・DEC-057/058 と accepted Design が既に正を持つ・Minimal-by-Default）。将来計画記述を削除現行化する。(2)〜(5) は現行化または削除。利用者回答 Q5=A で確定
  - id: CR-007
    conflict: IR-044 exemption 条件整備・ゲート warning 扱い変更と既存統制の緊張（RU-08）
    resolution: exemption 整備と warning 扱い変更は行わない（DEC-066/REQ-122-008/009 の既存統制変更は DEC-067 の7条件立証が必須・IR-044 Design の「META 規則行のみ免除・ホワイトリスト禁止」契約と緊張）。予防は req-define の事前走査で担う。利用者回答 Q7=A で確定
  - id: CR-008
    conflict: REQ-119/120/122 の行単位部分現行化 vs 完了済み作業パッケージ RETIRE 一括解消（REQ-03〜06）
    resolution: RETIRE 一括解消を採用（検出事項の推奨経路・traceability 実行済み記録・AGENTS.md/Design の廃止宣言を根拠）。利用者回答により異議なし確定。実行は REQ-058 廃止時クリーンアップ契約に従う
  - id: CR-009
    conflict: REQ-120-002（evidence 拡張子規則・恒久所有宣言）と REQ-120-003（状態表約束範囲）の恒久命題アンカーと REQ-120 RETIRE の緊張（対論レビュー発見）
    resolution: 規則の実質所有は backlog-auto references の Evidence 節と .agentdev/README.md の状態表規則に現存し現行機能するため、REQ アンカー消失を許容する（Minimal-by-Default・規範は現行の姿に現存）。OU-002 の参照整理時に REQ-120 経由の参照が規則本文へ到達していないことを確認する（TS-002 の網羅範囲に含む）
  - id: CR-010
    conflict: REQ-030 の STEP 番号直接参照行数が RU 記録で4行・現行 grep 実測は3行（REQ-030-012/027/030）の差（対論レビュー発見）
    resolution: 現行実測を正とし3行を対象化。残存1行の有無は実行工程の IR-044 シグナル語事前走査（AG-009）で最終確認する（TS-006・TS-008 に確認を織り込み）
operation_units:
  - ou_id: OU-001
    source_ru: RU-20261121-01
    target_req: REQ-036
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-20261121-02
    target_req: REQ-119
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-20261121-03
    target_design: docs/designs/integrity/rule-ownership.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-20261121-04
    target_design: docs/designs/responsibilities/artifact-responsibilities.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    source_ru: RU-20261121-05
    target_design: docs/designs/workflows/delegation-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    source_ru: RU-20261121-06
    target_req: REQ-009
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    source_ru: RU-20261121-07
    target_design: docs/README.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
  - ou_id: OU-008
    source_ru: RU-20261121-08
    target_design: src/common/skills/agentdev-workflow-req-define/references/draft-generation.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
  - ou_id: OU-009
    source_ru: RU-20261121-09
    target_design: src/common/skills/agentdev-git-worktree/references/worktree-operations.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
  - ou_id: OU-010
    source_ru: RU-20261121-10
    target_design: src/common/skills/agentdev-workflow-req-define/references/draft-generation.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      OU-001 対象ファイル集合（REQ-036・REQ-041・DEC-006・配布 command backlog-auto 本体・workflow-skill-model Design・intake-promote.md・guides glossary/troubleshooting）に対し rg で旧モデル記述（「単独実行」「既存5コマンド」「{inspect-docs, inspect-skills, inspect-promote} の3件」「3 command は DEC-006」）を検索する。検索の網羅範囲は OU-001 の修正対象列挙（promoted inspect 証跡の file:line 含む）と一致させる。
    pass_criteria: |
      旧モデル記述が修正対象集合で 0 件。正規参照表の公開8コマンド・内部 workflow 5処理の記述と各 Workflow Skill soft guard 宣言（DO NOT USE FOR: 単独起動）の整合を目視・機械の両面で確認。リンク切れ2件と不存在 Design リンク1件が解消されていること。
    on_failure: |
      fix-and-reverify（残置箇所を現行所有者へ付け替えして再検証する。付け替え先が一意に決まらない場合は inspect-docs finding 経路へ記録）
  - id: TS-002
    target_item: AG-003
    verification: |
      RETIRE 実行後に rg で REQ-119/REQ-120/REQ-122 を docs/（docs/reports/ は履歴記録領域として除外・retired 明示マーキング行は計上対象外）と traceability/ と .agentdev/extensions/skills/*.yaml に対して検索する。対象3ファイルの実不存在と docs/requirements/README.md AUTOGEN 索引からの消滅を確認する。REQ-120 経由で規則本文（evidence 拡張子規則・状態表約束範囲）へ到達する参照が残っていないことも確認する（CR-009）。
    pass_criteria: |
      REQ 3件の実ファイル不存在・索引行消滅・規範参照 0 件（マーキング付き歴史参照は不問）。traceability check の参照切れ 0 件。
    on_failure: |
      fix-and-reverify（残存参照を除去または現行所有者へ付け替えして再検証する）
  - id: TS-003
    target_item: AG-004
    verification: |
      OU-003 対象ファイル集合に対し rg で「DEC-064」「vocabulary-registry」「command-file-format」「IR-047」「IR-048」「移行計画 §」を検索する（retired 明示・Git 履歴参照・欠番散文は計上対象外と明示）。docs-check 全量実行。
    pass_criteria: |
      現行参照が対象集合で 0 件。IR-055/058 除外リストが現行所有者を指す。欠番散文が decisions/README.md に存在。docs-check 全量通過。
    on_failure: |
      fix-and-reverify（付け替え漏れを現行所有者へ修正して再検証する）
  - id: TS-004
    target_item: AG-005
    verification: |
      OU-004 対象ファイル集合に対し rg で「textlint-quality-runtime」「sync-opencode.ps1」「install-sync」「alloc-adr-number」「alloc-dec-number」「src/opencode/tools/」を検索する。完了済み移行記述の現在時制を目視確認する。
    pass_criteria: |
      旧パス・旧スクリプト名・幽霊所有者が修正対象集合で 0 件。空見出し・計画残骸・固定件数記述が 0 件。
    on_failure: |
      fix-and-reverify（残置箇所を現行正本へ付け替えして再検証する）
  - id: TS-005
    target_item: AG-006
    verification: |
      OU-005 対象ファイル集合に対し rg で「STEP-W」「（新規セクション）」「epic-wave workflow」「6軸実行契約」「第13段」「v4.0.0 final」を検索する。controlled_case_execution の定義文が現行用途（単一 Issue 実行委譲）を参照することを目視確認する。
    pass_criteria: |
      STEP-W*・編集ラベル・廃止構成参照・将来計画記述・完遂済み歴史段階債務記述が修正対象集合で 0 件。controlled_case_execution が現行用途を定義していること。
    on_failure: |
      fix-and-reverify（現行識別子・現行語彙への付け替え漏れを修正して再検証する）
  - id: TS-006
    target_item: AG-007
    verification: |
      変更後の REQ 行（REQ-036-002・REQ-041-016・REQ-009-002・REQ-034-025・REQ-116-002/005・REQ-110 TS-012・REQ-061 2箇所・REQ-038-006・REQ-030 3行・REQ-032-011・REQ-012 宣言位置）について、適用後成果物への verbatim 包含突合を実施する。REQ-004-066〜068・REQ-018-006/007 の行不存在と、旧行 ID を指す参照の rg 検索（docs/・traceability/・.agentdev/extensions/skills/*.yaml・docs/reports/ 除外）を実施する。検索の網羅範囲は修正対象列挙（ACT-REQ-005〜014 の対象）と一致させる。
    pass_criteria: |
      変更後文言が verbatim 存在・削除行の不存在・旧行 ID 参照残存 0 件（マーキング付き歴史参照は不問）。
    on_failure: |
      fix-and-reverify（未適用行・残存参照を修正して再検証する）
  - id: TS-007
    target_item: AG-008
    verification: |
      docs/README.md の横断 Design 索引と designs/README.md の実在 Design 行の機械突合（5行補完確認）。guides 層の「の正」表記・無リンク再述・履歴叙述の rg 検索（修正対象集合）。DOC-06 の PR セクション名とテンプレート実見出し（pr_desc.md）の突合。
    pass_criteria: |
      索引欠落 0 行・guides の権限語表記 0 件・履歴叙述が参照導線へ置換済み・セクション名がテンプレート実見出しと一致。
    on_failure: |
      fix-and-reverify（補完漏れ・表記不一致を修正して再検証する）
  - id: TS-008
    target_item: AG-009
    verification: |
      production-equivalent: 実 req-define workflow 実行で、IR-044 シグナル語（Phase 番号・Step 番号直接参照等）を含むテスト入力の draft 組立時に走査が発火し表記ガイダンス適用が記録されることを確認する。本バッチ自身の新規 REQ 行・追記行に対する走査適用（IR-044 検出 0 件）も合格条件に含める。case-open Design の停止理由分類への記録候補の存在を確認する。
    pass_criteria: |
      シグナル語入力で走査発火とガイダンス適用が確認できること。本バッチ成果物の IR-044 検出 0 件。case-open Design への記録候補存在。
    on_failure: |
      fix-and-reverify（走査パターン適用漏れを修正して再検証する。検出の構造的回避が必要な場合は DEC-067 手続の提起として Findings へ記録）
  - id: TS-009
    target_item: AG-010
    verification: |
      worktree-operations.md の junction 作成・削除手順節に補記（Dirent ベース判定不可・fs.lstatSync または PowerShell Get-Item の LinkType -eq 'Junction'・期待件数突合 fail-fast）が存在することを rg で確認する。投影同期（src/common → .opencode）の同一性確認。
    pass_criteria: |
      補記存在・期待件数突合の観点明示・投影同期確認（両側同一文言）。
    on_failure: |
      fix-and-reverify（補記追加・同期実施して再検証する）
  - id: TS-010
    target_item: AG-011
    verification: |
      反映先（req-define 契約面のガイダンス）に解釈注記指針文が存在することを rg で確認する。検索型合格条件のサンプル（REQ 本体定義行を列挙する REQ に対する grep 0件条件）への指針適用で解釈注記が付与されることを確認する。
    pass_criteria: |
      指針文存在・サンプル適用で解釈注記が付与されること。
    on_failure: |
      fix-and-reverify（指針追記・ガイダンス修正をして再検証する）
  - id: TS-011
    target_item: AG-001
    verification: |
      全体統合検証: docs-check 全量実行・traceability check（coverage missing-design 0 件・参照切れ 0 件）・検証エンジン テストスイート実行（REQ-060 の実行形態・リポジトリルート cwd）・索引 AUTOGEN 再生成結果の鮮度確認。
    pass_criteria: |
      全検証 Exit 0・索引鮮度ゲート通過。
    on_failure: |
      fix-and-reverify（原因を修正して再検証する。検証エンジン自体の不具合は case-close QG-4 の既存経路へ記録）
realization_actions:
  - id: RA-001
    concern: req-define draft 組立工程への IR-044 シグナル語事前走査の実装
    responsibility: req-define workflow skill の組立手順契約と表記ガイダンス（IR-044 ルール定義のシグナル語パターンに従う）
    ownership_hints: ["src/common/skills/agentdev-workflow-req-define/SKILL.md", "src/common/skills/agentdev-workflow-req-define/references/draft-generation.md", "docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md", "docs/designs/commands/case-open.md（停止理由分類への記録候補）"]
    intent: 合意済み draft の明示パス commit が IR-044 warning で物理ブロックされる構造的再発（case 4162・4167 の同型前例2件）を、合意時点の事前走査と表記ガイダンス適用で未然に防ぐ。既存統制（exemption・warning 扱い）は変更しない
    verification_refs: [TS-008]
    source_items: [AG-009]
  - id: RA-002
    concern: worktree-operations.md への junction 判定規約補記
    responsibility: agentdev-git-worktree skill references の junction 作成・削除手順節（REQ-018-002 の明文化契約）
    ownership_hints: ["src/common/skills/agentdev-git-worktree/references/worktree-operations.md", "docs/knowledge/windows-junction-detection-not-symlink-in-dirent.md"]
    intent: Windows の Dirent 種別判定が junction を symlink として報告しない実装差による誤判定（実在 55件を 0件と誤判定した前例）を、判定方法統一と期待件数突合（fail-fast）で防ぐ
    verification_refs: [TS-009]
    source_items: [AG-010]
  - id: RA-003
    concern: 検索型合格条件の解釈注記指針の req-define 契約面への反映
    responsibility: req-define の検索型合格条件作成ガイダンス（test strategy 定義面）
    ownership_hints: ["src/common/skills/agentdev-req-analysis/", "src/common/skills/agentdev-workflow-req-define/references/", "docs/knowledge/grep-zero-criteria-legacy-term-quotation.md"]
    intent: 検索型合格条件が REQ 本体定義行へ自己ヒットして機械的達成不能となる事例（Case #4167・PR #4173）を、合格条件作成時の事前解釈注記で防ぐ
    verification_refs: [TS-010]
    source_items: [AG-011]
  - id: RA-004
    concern: REQ-119/120/122 の RETIRE 実行と参照一括解消
    responsibility: REQ-058（廃止時クリーンアップ契約）と REQ-008（一時成果物ライフサイクル）に従う削除・参照切り・索引再生成
    ownership_hints: ["docs/requirements/REQ-119.md", "docs/requirements/REQ-120.md", "docs/requirements/REQ-122.md", "traceability/（sidecar 15ファイル）", "traceability/policy.yaml", "docs/decisions/DEC-065.md", "docs/decisions/DEC-066.md"]
    intent: 実行済み作業パッケージの残存行（pre-commit・intake-triage・IR-072・集約先パスの陳腐化）が現行構造と矛盾したまま残る状態を、行単位の部分現行化ではなく一括 RETIRE と REQ-058 契約に従う参照解消で一掃する
    verification_refs: [TS-002]
    source_items: [AG-003]
review_dispositions:
  - id: RD-001
    source_ru: RU-20261121-01
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou001
    reason: |
      公開コマンドモデル現行化・DEC-006 部分置換注記（Q1=B）・リンク切れ解消・soft guard 整合検収条件を OU-001/AG-002/ACT-REQ-002/003/ACT-DEC-001/TS-001 として全項 covered。DESIGN-14 の intake-capture/intake-from-github 許可プロファイル行除去は AG-004（OU-003）との共有対象として同時実施調整を AG-004 に記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-01.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-20261121-02
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou002
    reason: |
      RETIRE 3件・参照一括解消（REQ-058 契約）・intake-triage 幽霊参照除去・REQ-038-006 調整注記を OU-002/AG-003/ACT-REQ-011/ACT-DEC-004/005/RA-004/TS-002 として全項 covered。利用者回答で異議なし確定。参照残存確認の実測（sidecar 15ファイル・docs 28ファイル）を AG-003 に記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-02.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-20261121-03
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou003
    reason: |
      integrity 系 corpus 現行化・vocabulary-registry 参照除去（Q2=A）・DEC-064 欠番整理（Q3=A）・IR-055/058 除外リスト現行化・baseline 現行化を OU-003/AG-004/ACT-DEC-003/TS-003 として全項 covered。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-03.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-20261121-04
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou004
    reason: |
      文書種別・配置モデル系 Design 現行化（原本配置・幽霊所有者・現在時制化・計画残骸除去）を OU-004/AG-005/TS-004 として全項 covered。DESIGN-19 の固定件数記述は同ファイル規則に従う除去として AG-005 に織り込み。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-04.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-20261121-05
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou005
    reason: |
      workflow・command 系 Design 現行化・controlled_case_execution 再定義（Q4=A）・phase 系 Design 不整備と将来計画削除（Q5=A）を OU-005/AG-006/TS-005 として全項 covered。DESIGN-32 (1) の要否判断条件は CR-006 で解消。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-05.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-20261121-06
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou006
    reason: |
      REQ 11ファイルの行現行化・MOVE 判定・DEC-021 部分置換注記（Q6=B）・旧行 ID 参照残存確認を OU-006/AG-007/ACT-REQ-004〜014/TS-006 として全項 covered。REQ-09 の歴史化条件は AG-007（REQ-116-005 注記）に織り込み。REQ-17 の REQ-122 併施調整は CR-008 と ACT-REQ-011 の調整注記で表現（硬依存ではないため depends_on としない）。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-06.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-20261121-07
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou007
    reason: |
      docs 入口・guides 層現行化（索引補完・所有者記述整合・リンク付与・履歴叙述導線・表記統合・権限語修正）を OU-007/AG-008/TS-007 として全項 covered。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-07.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-20261121-08
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou008
    reason: |
      IR-044 シグナル語事前走査の採用（委譲裁量確定）・exemption 整備なし（Q7=A）・case-open Design 停止理由分類への記録候補を OU-008/AG-009/ACT-REQ-015/RA-001/TS-008 として全項 covered。対象外（REQ-123-003〜005 表記修正・hook 実装変更・#4167 後始末）は AG-009 と新 REQ 適用範囲に記録。REQ-030 との相互参照（IR-044 / REQ-001-049 系同根領域）は AG-007/AG-009・CR-010 で表現。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-08.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-20261121-09
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou009
    reason: |
      junction 判定規約補記・期待件数突合 fail-fast・投影同期を OU-009/AG-010/RA-002/TS-009 として全項 covered。REQ-018-002 既存委譲契約の反映のため新規 REQ 行は付けない（REQ-120 選別原理）。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-09.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-20261121-10
    source_item: 要件化の方向（全項）
    disposition: covered
    reason_code: covered_by_ou010
    reason: |
      解釈注記指針の反映（Q8=A）・Findings 根拠記録必須運用の明文化先判断を OU-010/AG-011/ACT-REQ-016/RA-003/TS-010 として全項 covered。対象外（検査側実装変更・REQ-123 完了条件文言変更）は AG-011 に記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-20261121-10.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
assembly_evidence: []
case_open_hints:
  epic_needed: true
  decomposition: >-
    10 作業単位（OU-001〜OU-010）を Epic 構成候補とする。全 OU は対象ファイル集合上で概ね素集合だが次の調整注記がある:
    (a) OU-002（RETIRE・参照一括解消）と OU-006（REQ-038-006 委譲表現化）は同一検証（traceability check）を共有するため同一 Wave 配置または直列化調整・REQ-038-006 の実施時期は OU-002 と同時を推奨（硬依存ではない・REQ-038-006 の調整注記は REQ 行本文へは書かず実行計画上の調整として扱う）,
    (b) OU-001 と OU-003 は DESIGN-14（integrity-contracts.md の不実行 command 記述）を共有修正対象とするため同時実施調整,
    (c) OU-008/OU-010 に対応する REQ-004 新規2行は、対応する Design 更新と covers 付与を case-ready の前後で整合させる調整（missing-design 0件ゲートは新規行を検査対象とするため）,
    (d) RETIRE 実行後は索引 AUTOGEN 再生成（docs/requirements/README.md・decisions/README.md）を同時実施する。
  wave_hints: ["OU-001〜OU-007 は並列実行候補（調整注記 (a)(b) に従う）", "OU-008〜OU-010 は独立・後続 Wave 候補（機能追加・実装寄り）"]
notifications:
  - notified_at: 2026-11-21T18:32:09+09:00
    via: HITL_REQUIRED（orchestrator 経由で利用者へ提示・受領）
    scope: REQ-119/120/122 RETIRE 提案・REQ-009-002/DEC-021 整理・REQ-036-002/REQ-041-016 現行化と DEC-006 扱い・Design corpus 大規模現行化の方針（ドラフト保存前の事前通知）
  - notified_at: 2026-11-21T18:58:44+09:00
    via: STEP-11 完了報告（STEP-4 以降で判明した重要変更の追加通知）
    scope: RETIRE 参照カスケードの規模（docs 28ファイル・traceability sidecar 15ファイル・policy.yaml・REQ-123 内参照・REQ-120 恒久命題アンカーの許容判断〔CR-009〕。実行は REQ-058 廃止時クリーンアップ契約に従う）
```

# summary

## 対論レビュー（STEP-8・発動・記録）

発動条件: scale large・Decision 対象あり・意味的決定あり（skip 条件非該当のため default-on 発動）。req-define 対論契約（3論理役割・対称的相互反証・収束監査）に従い審議を実施した。

主な争点と反証（いずれも合意候補の再検証で解消・未解決争点なし）:

1. REQ-120 RETIRE と恒久命題アンカーの緊張 → CR-009 として記録・解消（規範は現行の姿〔backlog-auto references・.agentdev/README.md 状態表規則〕に現存、REQ アンカー消失を許容、OU-002 参照整理時に TS-002 で確認）。
2. REQ-030 対象行数の RU 記録（4行）と実測（3行）の差 → CR-010 として記録・解消（実測を正とし、残存確認を IR-044 事前走査と TS-006/TS-008 に織り込み）。
3. design 対応事前確認 → REQ-036-002 は inspect-docs.md・inspect-promote.md Design、REQ-041-016 は backlog-auto.md・agentdev-workflow-backlog-auto.md Design が covers 宣言しており欠落なし。対象 Design の現行化は OU-001 内で同時実施されるため対応関係は維持される。REQ-004-066〜068・REQ-018-006/007 の移管に伴う covers/sidecar 参照切りは ACT-REQ-009/010 に織り込み済み（実測: req-define.md command Design・agentdev-design-file-manager.md・agentdev-git-worktree-test-fallback.md・traceability 3ファイル・policy.yaml）。
4. 変更誘発境界リスク（5観点）→ dependency boundary: RETIRE 参照カスケード（TS-002・REQ-058 契約）。execution boundary: OU-008 の req-define 実行契約変更（TS-008・production-equivalent）。build/runtime boundary: 配布 skill 変更の投影同期（TS-009）。environment propagation: guides・docs 入口の利用者導線（TS-007）。client/server boundary: 該当なし（外部ネットワーク経路の変更なし）。各リスクは test strategy へ投影済み（QG-1 投影完全性の機械検査対象）。
5. 検索系検証の網羅範囲・修正対象列挙一致 → TS-001〜TS-007 は対象パス集合を修正対象列挙と一致させ、See Also 等の参照行と docs/reports/（履歴記録領域）の扱いを各 verification 内で明示済み。

## 重要変更の通知（REQ-108 契約）

- 事前通知（ドラフト保存前・2026-11-21T18:32:09+09:00）: HITL_REQUIRED 本文で RETIRE 提案・DEC-021/DEC-006 整理・REQ 現行化・Design corpus 現行化の方針を通知済み（利用者受領済み）。
- 追加通知（2026-11-21T18:58:44+09:00）: STEP-4 で判明した RETIRE 参照カスケードの規模（docs 28ファイル・traceability sidecar 15ファイル・policy.yaml・REQ-123 内参照）と REQ-120 恒久命題アンカーの許容判断（CR-009）を本完了報告で通知する。実行は REQ-058 廃止時クリーンアップ契約に従う。

## 判定結果

work_type: feature（根拠: OU-008/OU-010 が req-define 実行契約面への新規能力追加〔配布契約変更＝システム変更〕を含む。現行化主体の OU-001〜007 は docs 整理性質だがバッチ全体では最上位分類の feature を採用）
scale: large（根拠: 実装スコープシグナル〔検出事項カタログ 59件・影響ファイル一覧 40超・修正候補リスト 10件〕により large 昇格。Epic 構成候補・10 作業単位。昇格理由は本提示により利用者へ提示済み）
SPLIT シグナル: 新規 REQ の要件行数 10 行・関心分類数 3（現行化/RETIRE/機能追加）・成果物種別数 3（REQ/Design/配布 skill）で SPLIT 閾値未満。単一要件docを維持（AG-001）。
Decision 判断: 新規 Decision 不要（DEC-067 準拠の既存統制変更なし・Q1/Q6 は部分置換注記・RETIRE と欠番整理は REQ/Decision ライフサイクル操作・作業手段の Decision 禁止ゲート該当なし）。判断根拠は CR-001〜CR-010 に記録。
