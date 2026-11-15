---
draft_type: req_draft
topic_slug: backlog-auto-e2e-20261115T191842JST
status: draft
created_at: "2026-11-15T21:25:00+09:00"
source_rus: [RU-0281, RU-0282, RU-0283, RU-0284, RU-0285, RU-0286, RU-0287, RU-0288, RU-0289, RU-0290, RU-0291, RU-0292, RU-0293, RU-0294, RU-0295, RU-0296, RU-0297, RU-0298, RU-0299, RU-0300, RU-0301, RU-0302]
---

# 要件doc draft: backlog-auto 一式 20261115T191842JST 整合是正（RU-0281〜RU-0302）

2026-11-15 の backlog-auto 一式識別子 20261115T191842JST で backlog-review が採用した RU 22 件（RU-0281〜RU-0302）を単一の要件docへ収容する。いずれも既存正規成果物・配布資産・検査体系の保守と整合是正であり、新規 REQ の採番創出を伴わず、既存 REQ/Decision への APPEND/UPDATE（REQ-010・REQ-119・REQ-120・DEC-009）、Design 操作 3 件（distribution-boundary.md 追記・v4-v5-crosswalk.md 更新・checker-execution-contracts.md 追記）、および実現面変更 22 作業単位として構成する。RA-002（#3970）撤去（CLOSED 2026-11-08）と PR 4043 マージ（MERGED 2026-11-13）の両前提は確認済みである。

## 入力と区別

- 確定事実（機械実測付き）: 22 RU の全文（`.agentdev/backlog/req-units/RU-0281.md〜RU-0302.md`）、set-state 義務スナップショット（`.agentdev/backlog-auto/end-to-end/20261115T191842JST/set-state.json`・22 RU の必須要求と受け入れ義務を抽出済み）、RA-002（#3970）CLOSED（2026-11-08）、PR 4043 MERGED（2026-11-13）、REQ-010 テーブル 2 列構造・現行最終行 REQ-010-084、REQ-119.md:35「（本文は現行最大 REQ-118 時点の次番号を仮記）」と REQ-120.md:41「（本文は現行最大 REQ-119 時点の次番号 REQ-120 を仮記）」の実在、DEC-009「### 移行方針」節実在（103 行）、docs/designs/integrity/distribution-boundary.md「## 配布物本文の記述規則」節実在（178 行）、docs/designs/integrity/checker-execution-contracts.md「## 安定実行経路」節実在（338 行・L229 に Bun ランタイム API 依存 checker の bun 経由規律が既存）、docs/designs/foundations/references/v4-v5-crosswalk.md 実在（96 行・frontmatter status: draft・updated: 2026-10-14・ADF-COVERS 宣言 REQ-108-012/REQ-111-013）
- 利用者の判断（採用根拠）: HITL 質問 Q-RD-20261115-01 に対する relayed answer「選択肢 A（ADR 導入不採用・DEC-009 維持）」を受理（2026-10-02 standing order〔推奨付き質問は推奨オプションが relay される〕による推奨オプション relay。provenance: orchestrator relay・Hermes-supervisor injection 経由・回答受理 2026-11-15）。RU の採用自体は backlog-review の採用済み成果物として受理済み
- 監督者指示（本実行の入口）: 入力は 22 列挙 RU のみ（引数なし全件処理でない）、単一要件doc（operation_units 構造・複数 doc 分割なし）、既存 draft 2 件（req-draft-caseready-cleanup-suppression・req-draft-correction-3887-verification）は対象外、RU ファイルの削除は行わない（case-open/ready 後段の契約）、Issue/PR 操作・tag・release・orchestrator 所有の set-state 編集は行わない
- 境界外: 既存 draft 2 件の編集、RU 本文の再解釈による義務スナップショット対象の削減、機械工程 script 本体の要件変更（PR #3982 で完結済み・REQ-117 系が正本）、QG-4 の分割構成そのもの、旧機構の再導入、書込み guard の解除・迂回

## 統合/分離判定（複数RU処理）

- 22 件は同一一式（backlog-auto 20261115T191842JST）だが、変更対象実現面が相互独立。実行単位（OU）は RU 単位の 22 件に分離し、単一 draft・単一 Case バッチに束ねた
- 必須依存は OU-004（RU-0283）→ OU-003（RU-0282）の 1 件のみ（区分け結果を整備判断の入力として参照）。その他は相互独立
- SPLIT シグナル計測（req-health-metrics・定量閾値）: 本 draft は REQ 新規採番（CREATE）を伴わないため「新規 CREATE ドラフトの要件行数 51 行超」の SPLIT 提案対象外。計測値: REQ 新規要件行 1 行（REQ-010 への追記行）、関心分類 8 系統（撤去追随・suite fail 整備・実行環境整備・参照整合・配布境界・IR 整合・機械工程規律・表層軽微是正）、成果物種別 5 種（REQ・Decision・Design・配布資産/スクリプト・検査/テスト）

## Decision判断記録（STEP-5）

- 判断結果: 新規 Decision 0 件（`new:{topic-slug}` の Decision 判断記録なし）
- 適用基準: Decision 禁止ゲート（agentdev-decision-guidelines）。22 RU いずれも仕様変更のみ・文書是正・規律追記・参照整理・実現面整備を含み、方式選択・アーキテクチャ変更・hard-to-reverse な技術的決定を含まない
- RU-0294（ADR 受理形式）は HITL 質問 Q-RD-20261115-01 で選択肢 A（ADR 導入不採用）が relayed answer として確定。これにより DEC-009（ADR から Decision への正規成果物モデル移行・status: accepted）が正として維持され、新規 Decision は不要。確定記録の DEC-009 への追記（ACT-DEC-001）は既存方針の明確化であり、Decision の方針変更を伴わない
- 既存 Decision との重複確認: DEC-009（ADR モデル移行）・DEC-001（統制是正原則）・DEC-027 系（観測ループ）との重複なし。RU-0295 の edit-semantics 共通部収束は PR 4043 Design 確定候補（マージ済み）と REQ-099-013/014 の既存方針への追随であり新規決定を含まない。RU-0285 の相互参照解決可能性検査は汎用 checker の候補設計と採否判断の実施を義務とし、採否は判断実施の結果として case 経路へ記録される（本 draft は採否の確定を含まない）
- Decision 要否判断群は Jev 適用対象外（STEP-5 適用不採用の維持・requirement-development reference の記録どおり）

## Jev 先行評価の記録

- 既存REQ照合判断（STEP-3）: evaluate 成功（evaluator jev-1.13.0・confidence 0.68）。evaluator 結果: 20 RU「REQ操作なし」・RU-0287「APPEND」（0.69）・RU-0294「保留」（0.86）・追加確認不要（boolean false・0.6）。ただし reference digest 形式エラーにより観測の永続化が失敗（warning）。契約どおり rollback・再実行・擬似再生成は行わず、本 warning を完了報告に明示する。最終判断: evaluator 結果に RU-0292 のみ修正を加え「REQ update（REQ-119/120 本文機械的修正）」と確定（evaluator は「REQ操作なし」0.58）。差異理由 semantic_disagreement（REQ 文書への変更は artifact_actions〔artifact: req〕として Definition 保存内部責務で実行すべき旨の契約解釈による）。観測不在のため差異の観測反映はできず、本記録と完了報告で明記する。その他 21 RU は evaluator と最終判断が一致
- 要件展開の最終分類・Design 分離（STEP-4）: 観測 `20261115T122103Z-05b8`（.agentdev/jev-observations/・confidence 1.0・observation_write で最終判断追記済み）。RU-0281=実現面のみ・RU-0285=Design行帰属（distribution-boundary.md 追記）・RU-0287=REQ行帰属（REQ-010 APPEND）・RU-0289=Design行帰属（crosswalk update）・RU-0300=Design行帰属（checker-execution-contracts.md 追記）は evaluator と最終判断一致。RU-0292 は evaluator「実現面のみ」（0.76）に対し最終判断「REQ行帰属」を semantic_disagreement で観測へ記録済み

## 重要変更の事前通知の実施記録

- 第1次（ドラフト保存〔STEP-9〕に先行して実行出力へ通知済み・本記録はその通知の後にドラフトへ記録された）: (1) docs/decisions/DEC-009.md「### 移行方針」節への ADR 導入不採用確定記録の追記（変更理由・変更内容・影響・確定事項・未確認事項を通知済み）、(2) docs/designs/foundations/references/v4-v5-crosswalk.md の内容更新 + frontmatter updated 最新化（triage (b)・内容更新の範囲確定は本 Design の更新判断手順に従う旨を通知済み）、(3) docs/requirements/REQ-119.md:35・REQ-120.md:41 の採番仮記括弧句除去（軽微な機械的更新として併せて通知済み）

## HITL 壁打ち質問と回答の記録

- 質問 Q-RD-20261115-01（2026-11-15・req-define STEP-2/4/5 壁打ち HITL）: RU-0294 の ADR 受理形式契約の方向性（選択肢 A〔推奨〕: ADR 導入不採用を確定し DEC-009 を維持・新契約は新設せず正規 lib ADR helper は死装備として廃止対象／選択肢 B: ADR 受理形式契約を新設し Decision new:adr-acceptance-contract を作成）
- 回答: 選択肢 A。provenance: 2026-10-02 standing order（推奨付き質問は推奨オプションが relay される）に基づく orchestrator relay・Hermes-supervisor injection 経由（2026-11-15 受理）。利用者の明示回答ではなく standing order による推奨 relay であることを本記録により明示する
- 回答に基づく処置: RU-0294 を「ADR 導入不採用の確定記録（DEC-009「### 移行方針」節追記）+ 正規 lib ADR helper（4 桁固定走査）の廃止」の実現面変更として AG-014・OU-014・TS-014・RA-014・ACT-DEC-001 へ構成化。新規 Decision 候補の解消（Decision 判断記録は新規 0 件で確定）

## STEP-8 adversarial-review 実施記録

- 実施形態: 構造・変更前提検査（機械検査スクリプトによる ID 形式・連番・3 要素・参照整合・enum 値・fence 完結性・文字化け検査）の後、呼出元 Reviewer 役割による対称的相互反証（AG↔RU 義務スナップショット忠実性・操作分類・Design 分離の妥当性・検証手段の質・依存と推奨順序・HITL provenance・境界外混入の6観点）+ 収束判定
- 第1パス機械検査 findings F1〜F2: F1 `result: {}` 欠落（テンプレート契約・operation_units の後の出力必須）→ F1 は反映済み（operation_units 末尾へ追加・再検査で確認）。F2 検査器誤検出（AG 抽出正規表現のインデント不一致・RD/OU の source_ru 区別なし）→ 検査器修正で解消・本体に影響なし。修正版検査の結果: AG/OU/TS/RA/RD 連番 22 件・TS 3 要素 22 件完備・TS→AG・RA→TS/AG・OU 依存・RD 一意性（22 件）すべて整合・未確定語彙スキャン（TBD/TODO/未定/後続工程で確定/case-run で確定）0 件
- 第2パス意味レビュー findings F3〜F5（対称的相互反証）:
  - F3: AG-017（同名テスト評価）の「判断は評価完了後に確定」が未確定内容抑止キーワードに近接 → 判定: 該当せず。根拠: 「判断の実施」が確定済み義務であり判断結果は作業成果であること（先行前例の実装側判断明示委譲と同型）・TS-017 に record-in-findings を定義済み・auto_ready: true と整合
  - F4: ACT-DESIGN-002 の target_area「frontmatter updated」が target_area 契約（対象セクション見出し）と形式が異なる → 判定: 許容。根拠: 更新対象が frontmatter updated を含む本文更新であり、内容更新範囲の確定手順（親更新の波及検討・living tracking 併存整理）を content に明記済み・実施時に target_area 見出し一致手順が適用される
  - F5: OU-014 の description 内「Design 操作対象外」記録が OU スキーマの target_design と紛らわしい → 判定: 許容。根拠: target_design フィールド自体は出力しておらず、description での説明は記録として妥当
- 収束判定: F1 反映済み・F2〜F5 は本体変更不要の判定で収束。AG↔RU 忠実性（22 RU の必須要求と受け入れ義務の突合・set-state 義務スナップショットの全 22 件を AG が網羅）・`result: {}` 追加後の再検査を以って収束とする

# draft-data

```yaml
work_type: maintenance
scale: large
summary: >-
  backlog-auto 一式 20261115T191842JST の採用済み RU 22 件（RU-0281〜RU-0302）を単一要件docへ収容する。
  (1) RA-002 撤去追随の旧機構参照・文言・sidecar 対応行の整理、(2) integrity suite 既存 fail の区分けと
  fixture・テスト条件是正、(3) suite 実行環境前提・標準実行形の整備、(4) 配布物参照・相対リンクの整合是正、
  (5) 配布境界検査の整備（gate 除外領域適用・相互参照解決可能性検査候補設計・backtick 運用明文化）、
  (6) integrity 規則メタデータ・検査器・検査データの整合是正、(7) IR-072 既知 NG 是正と frontmatter updated
  運用規則の整備（REQ-010 への追記を含む）、(8) IR-053 検出器の否定文文脈許容改善、(9) v4-v5-crosswalk.md の
  draft 放置解消（triage (b)・Design update）、(10) worktree 運用規律の整備、(11) case-close 機械工程規律の
  整備、(12) 正規文書の表層・参照・鮮度の軽微是正（REQ-119/120 仮記括弧句除去を含む）、(13) 機械工程計測日
  収束 trigger の表記不一致修正、(14) ADR 導入不採用の確定（DEC-009 追記・helper 廃止）、(15) ガード編集意味論
  共通部の第3実装（Senpi）の収束、(16) promote 系 workflow skill の本文複製境界精査、(17) 同名試験ファイル
  2系統の残存評価、(18) senpi guard-connection 試験不合格の追試と分類、(19) textlint-guard gate 本体の
  vendor 未生成 crash 対応、(20) checker 実行ランタイム選択規律の Design 補強、(21) case-open 円等検出の
  複数トークン・二段検証、(22) yomiyasu lint 一時ファイル配置指示と書込み guard 境界の整合。
  新規 REQ 採番なし・既存 REQ/Decision への APPEND/UPDATE 4 件と Design 操作 3 件・実現面変更 22 作業単位。
  影響対象が 30 ファイル超の実装スコープシグナルにより scale は large。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      RA-002 撤去追随の旧機構参照・文言・sidecar 対応行の整理（RU-0281）。実施前に RA-002（#3970）の実施状況を
      確認する冪等確認を前置する（モジュール撤去済みなら追随の要否を実在確認から判断し、既に追随済みの項目は
      完了扱いとする。#3970 は CLOSED 2026-11-08 の実績）。adapter SKILL.md（agentdev-case-run-execution-adapter・
      src/common 正本と .opencode 投影の双方）L94 の文言を作成ヘルパー・台帳参照から現行の受け入れ評価接続
      （後片付けは作業完遂責任の一部・報告義務は v4-delegation-contracts Design「検証用一時資材の作成・報告義務」節）
      へ現行化する。リポジトリ直下 AGENTS.md（repo-local・配布対象外）の作成ヘルパー関連文言（「作成先確認の制約
      （作成ヘルパーの機械検査に接続）」等）を現行の受け入れ評価接続・後片付け責任（REQ-118）の文言へ現行化する。
      RA-002 のモジュール削除に伴い、traceability/agentdev-workflow-case-close.yaml の旧機構モジュール
      （verification-resources-ledger.ts・verification-resource-register.ts・deletion-confirmation.ts・
      verification-resource-reclamation.ts 台帳部分）への implementation/verification 対応行を削除し、撤去済み機構に
      対応付けられた REQ-118 系要件行の retired 判定を実施する。該当行の実在確認を前置し、現行行が撤去後の新契約
      （REQ-118 の現行 9 行は受け入れ評価接続ベース）として妥当な場合は retired 対象なしを証跡として記録する。
      sidecar 更新後に traceability check（対象要件行限定）で missing 系 findings が新規に立たないことを確認する。
      SKILL.md 修正時は投影同期（src/common → .opencode）を含める。
  - id: AG-002
    content: >-
      integrity suite 既存 fail の区分けと fixture・テスト条件是正（RU-0282）。区分けを先行する: baseline 存在
      fail 群（timeout 11件〔worktree 環境固有〕・consumer fixture 9件・vendor 依存 2件・checkExtensions 1件・
      split3 環境依存系 11件・relied_diff T6）について、環境調整（vendor 生成・junction 適用・実行形態整備）で
      消える fail と真の欠陥を区分けし、別案件管理対象への追加要否を確定する。fixture 是正: makeConsumerRepo へ
      機械工程前提検証（REQ-009-053）の対象 script（close_mechanical_steps.ts 等）を含める、または check ベース
      アサーションの実行条件を fixture 構成に応じて調整する。vendor 依存是正: vendor 生成状態に依存しないテスト
      条件へ是正、または実行環境前提（vendor 生成済み/未生成）の明記と条件分岐を行う。repo-state 依存是正:
      relied-diff（AC01〜AC09・T1〜T5）・allocation round-trip・上位層 docs 検査系テストの独立性是正（fixture 化・
      docs 記述の実在確認への変換等）の要否を判断する。pin 2件・T6 は撤去系実現単位（RU-0270・RA-002〔#3970〕/
      RA-006〔#3971〕）への投影漏れがないかを突合する。check_extensions strict failure 2件
      （backticks-identifier-threshold.md 不存在）の実修復（Design 文書作成または参照削除）を含めて判断する。
  - id: AG-003
    content: >-
      suite 実行環境前提・標準実行形の整備（RU-0283）。正規 3 分割の実行手順（機械工程 script・委譲 prompt・
      基線固定記録）の実行形を cd-form（cd <suite-dir> && bun test）に統一する。bun の directory 引数解決の
      挙動差（whole-cwd fallback）を検査で明示する選択肢の要否を含めて判断する。worktree 作成手順
      （agentdev-git-worktree）への依存復元前置（bun install --cwd・scripts/self-sync.ps1 -Mode apply 等）の
      明示、または suite 計数の環境前提（node_modules / junction / vendor 状態）の記録様式への追加を判断・実施する。
      Windows CI runner での bun test 分割③（install.ps1 e2e 系）定期実行と、fail クラス baseline の機械突合
      （既知 fail クラス集合との差分検出）を整備する。実現により Wave 境界ごとの人手 fail set 突合を機械化する。
  - id: AG-004
    content: >-
      配布物参照・相対リンクの整合是正（RU-0284）。repo-agentdev-integrity SKILL.md 206行の integrity-rule-catalog.md
      リンクを正しい相対パス（docs/designs/integrity/integrity-rule-catalog.md）へ修正する（1行）。あわせて検査器自身が
      .opencode 配下 skill 文書の相対リンクを検査対象にしているか確認し、対象外なら再発防止の検査範囲見直し候補を
      評価する。vocabulary-registry.md 340行・363行の IR-055・IR-065・IR-066 リンク3件を正しい深さ（../../../../docs/...）
      へ修正する。委譲 prompt テンプレート（機械工程・checker 実行の指定箇所）のトレーサビリティ check 記載パスを
      正規実体（src/common/skills/agentdev-traceability/scripts/src/check.ts）へ是正する。または checker 指定の実在
      確認前置の追加を判断する。Issue/Design/Skill 文面中の scripts/src/ 旧配置参照を実配置
      （.opencode/skills/repo-agentdev-integrity/scripts/ 等）へ更新する。存在しない機械工程 script
      （close_mechanical_steps.ts 等）への参照は実在する等価手続または削除の判断材料として精査する
      （inspect-skills・inspect-docs 経由の機械診断で列挙できる）。agentdev-gh-tool README の2リンクについて
      consumer 環境の配置で解決するかを確認する。解決する場合は誤検出として扱い、解決しない場合は配布時の複写対応と
      参照不一致の是正を実施する。IR-055 の導入先未解決参照検出が相対 Markdown リンク形式を検出対象にしているかを
      確認する。履歴報告（docs/reports/integrity/ 等）の参照リンク34件について、履歴報告に参照を追随させる義務があるかの
      契約上の確認を前提とする。許容されるなら不整合として扱わない判断を確定し、義務がある場合は追随修正の対象範囲を
      確定する。
  - id: AG-005
    content: >-
      配布境界検査の整備（RU-0285）。trusted-distribution-gate の boundary detector へ distribution-boundary.md
      「検査対象の除外領域」規定を適用する（tests 配下の検出刺激用サンプル文字列の除外）。検出 bound 設定と
      unclassified 扱いを見直す。blob 分類（loadAndClassify）と manifest projection entries が空になる経路を
      解明・整備する（main root・Windows 環境での pipeline 実行前提の検証手順整備を含む）。配布物本文内の相互参照
      パスの解決可能性を検査する汎用 checker の候補設計を行う（配布レイアウトでの実在解決の検証・運用記述の
      src/common 形式を誤検出しない除外設計を含む）と採否判断を実施する。配布境界 Design
      （docs/designs/integrity/distribution-boundary.md）の「## 配布物本文の記述規則」節へ「配布 skill 間の正本参照は
      backtick パスで記述し Markdown リンクを使用しない」運用を追記する。配布境界 checker の concrete path 検証
      （hits 0 確認）を併記する。
  - id: AG-006
    content: >-
      integrity 規則メタデータ・検査器・検査データの整合是正（RU-0286）。IR-013: 検出関数 checkVariantPathExistence を
      check_integrity.ts の results 統合へ接続し machine-check へ再分類する（frontmatter detection_method_class・
      implementation_path・verification_path を IR-074 機械照合対象へ追随）。req-define が接続方向を確定する
      （根拠: 検出関数が実装済みであり意図された検出の正規経路化が prose-only 後退より整合する）。IR-018・IR-042:
      検出関数に対する専用 fixture 試験（違反パターン・適合パターンの最小 fixture）を追加し、verification_path を
      専用試験へ限定する。IR-074 のパス実在・IR ID 参照一致検査との整合を維持する。IR-045: check_integrity.test.ts の
      fixture 参照を現行の移管先規則（IR ID・語彙）へ更新するか、fixture を廃止する。IR-069 の欠番記録との整合を
      確認する。IR-055: baseline entries と checker evidence の正規化規則（repo-* / repo-local 等）を明文化し、
      外部突合スクリプト実装時の注意書きとして収録する。IR-066: agentdev-command-creator の retired 語彙追加
      （obsolete-vocabulary-map.yaml + check_integrity.ts IR066_VOCAB_PATTERNS 同一 PR 更新）の要否を検出コストと
      再発リスクの比較で判断し、実施する。obsolete-path-map.yaml: backticks 対照登録2件の new 側を現行の統合先
      （document-type-responsibilities.md の識別子と散文普通名詞の区別節）へ更新する。または retired 様式に従い
      new 側不在の表現へ整理する。対照登録の現行様式と checker 同期条件を確認のうえ実施する。
  - id: AG-007
    content: >-
      IR-072 既知 NG 是正と frontmatter updated 運用規則の整備（RU-0287）。IR-072 の NG 残存対象 REQ/Design
      （updated と最終内容変更 commit 日付の不一致・REQ-012/REQ-047/REQ-110・Design 10件以上の既知 NG を含む）を
      洗出し、updated を実施日へ更新する実修復を基本とし、対価に見合わない対象は integrity-contracts.md
      「既知残存違反の統一選択基準」に従い baseline 登録（provenance 付き）へ分類する。個別対象
      docs/designs/local/adf-simplification-deferred-records.md（updated 2026-11-13 vs 最終 content-change commit
      2026-11-14・Epic #4054 で base 起因証跡化済み）を含める。意図的な updated 進行を伴う PR で merge 後に IR-072 が
      新規検出される構造への運用規則（REQ 更新手順の一手順化・内容変更 PR での updated 同時進行）を
      docs/requirements/REQ-010.md の要件テーブルへ新規行（REQ-010-085・REQ-010-081 の運用判断枠の延長）として
      追記し（ACT-REQ-003）、許容幅規則（例: 同日内差分の扱い）の調整要否を検討のうえ判断する。
  - id: AG-008
    content: >-
      IR-053 検出器の否定文文脈許容改善（RU-0288・inspect D-1 false positive 確定を継承）。IR-053 検出器に
      否定文文脈許容条件を追加する。設計は受け入れ条件（RT-3）の3点（否定形記述〔「発行しない」「〜しない」等〕の
      構造的許容の設計・area-based 除外宣言方式〔REQ-010-066 準拠の語彙引用・記録領域管理〕との整合検討・IR-053 の
      正規検出条件と既知許容〔検出器仕様〕との照合）を検討対象とする。ng-baseline / exemptions への仮登録は行わない
      （検出側推奨どおり・正の検出器仕様を迂回しない）。改善実装までの間の warning 継続検出は許容する。対象 README
      （src/common/skills/agentdev-workflow-case-close/scripts/README.md:7）の gh pr view 記述そのものの文言は
      req-define が判断し、否定文説明として正当であるため文言を維持し、検出器側の許容で解消する（根拠: inspect D-1 が
      false positive 確定〔confidence high・現物確認済み〕・文言は agentdev_gh Custom Tool 境界の現行契約の説明として正当）。
  - id: AG-009
    content: >-
      v4-v5-crosswalk.md の draft 放置解消（RU-0289・inspect S-1 triage (b) 確定を継承）。triage (b) として
      docs/designs/foundations/references/v4-v5-crosswalk.md の内容更新と frontmatter updated の最新化を
      実施する（ACT-DESIGN-002）。内容更新の範囲（親 v5-adopted-conventions.md の 2026-11-04「解決手順」節更新
      〔L68-79 target_area 追記〕の子側波及を含めるか）と、living tracking（planned → confirmed → executed）の
      長期休止期間と updated 最新化の併存整理（IR-054 false_positive_risk「中」への対応）は、実施時に本 Design の
      更新判断手順に従って確定した上で適用する。実施時に inbox 残置の R-1（REQ-035-006 旧 Wave 語彙の現行化）と
      S-2（REQ-111-013 covers 宣言重複の集約判断）を同時再評価対象として扱う（両項の defer 記録は
      .agentdev/inspect/inbox/inspect-docs-finding-20261115T103843Z.md 側に保持）。docs/designs/README.md:193 の
      親行備考へ joint triage 記録を追記する。
  - id: AG-010
    content: >-
      worktree 運用規律の整備（RU-0290）。worktree-operations.md（agentdev-git-worktree reference）cleanup 系節へ
      「untracked ファイル削除判定は『内容確認 → 中止判断 → 削除実行』を別 bash コマンドに分離して実行する」
      「並行 case-auto 環境では .agentdev/jev-observations/ 等の当日タイムスタンプ物を自 run の一時物と断定せず、
      観測メタデータ（workflow・subject 等）で所有 run を照合する」を追記する。同じく cleanup 系節へ「後片付けの
      削除は自分が作成した具体ファイル名を個別指定し wildcard を使用しない（連番・タイムスタンプ等の衝突し得る
      パターンでの共有領域 wildcard 削除は禁止）」を追記する。「1.5 remove 前退避ファイル掃除」節の掃除対象に
      依存整備物（node_modules・vendor 等 gitignore 対象・明示パス指定）を追加する。case-close 側 cleanup 参照行
      （cleanup-and-capture.md STEP-6-1）の文言追随を含める。「bun test 実行の環境前提」節へ bun install
      --frozen-lockfile 前置の明記と、bun run --cwd の package 直下 node_modules/.bin 解決要件・tsc PATH 解決失敗時の
      node_modules/.bin/tsc 直接起動フォールバックを補記する。--frozen-lockfile 規律の正規配置先として QG-4
      （qg-4-final-acceptance.md 依存パッケージ前置節）側への配置の選択肢を含めて判断する。
  - id: AG-011
    content: >-
      case-close 機械工程規律の整備（RU-0291）。case-close SKILL.md「完了判定の契約状態記録・未追跡残存検証」節へ
      (1) 終了判定記録（.agentdev/close-acceptance/）は恒久 commit 対象の契約状態記録ではなく一時保護記録であり
      contractStatePaths の範囲導出に含めない旨の明示、(2) humanConfirmedPaths 指定前に git ls-files --others
      --exclude-standard で観測形（省略形ならディレクトリ接頭辞・ファイル形ならファイルパス）を確認する前置、を
      補記する。cleanup-and-capture.md STEP-5 へ「Issue 書込み（コメント投稿・本文更新）をすべて完了した後に、
      fresh revision（再 issue_read）で機械工程を冪等再実行して終了判定記録を再生成し、直後に issue_close を実行する
      （間に Issue 書込みを挟まない）」の順序を明記する。同じく cleanup-and-capture.md STEP-5 の verify-only closure 時の
      機械工程入力組み立て手順を正規化する（ワークアラウンド構成〔prNumber 0 + mergeablePolling maxAttempts 0〕の
      除去・prNumber 0 正規構成〔PR #3982 現行実装〕への追随）。対象は workflow skill 本文（配布手順記述）であり
      機械工程 script 本体は対象外（PR #3982 で完結済み）。close_mechanical_steps.test.ts の
      completeMachineAcceptanceRecord fixture の分割番号割当を QG-4 正規形（①=integrity suite・②=src 側・③=plugins 系）
      へ整合させる（fixture とテスト期待値の同時更新・bun test pass 確認込み）。case-close scripts README.md へ
      「CLI runner は deleteFile を提供しないため reclamation 指定時は fail-closed 報告が正・手動回収経路
      （実在確認 → 証跡退避 → 明示パス削除 → 不存在確認）が現行正常系であること」の標準手順を明記する。あわせて
      main() runner への deleteFile 注入（removeFile と同一の fs 実装）を機構整理候補として保持する。
  - id: AG-012
    content: >-
      正規文書の表層・参照・鮮度の軽微是正（RU-0292・修正方向一意の6件一括整理）。(1) textlint-guard plugin README
      （src/opencode/plugins/agentdev-textlint-guard/ 配下および配布物側）の最終検査コマンド例を bun <path> 直実行へ
      統一する。(2) agentdev-artifact-validation scripts README.md 59行の textlint 助言（sentence-length・110文字）を
      文分割・文体調整で解消する。(3) req-define-detailed-gates.md 85行の req-impact-map.md 削除済み「影響する Artifact」列
      への語彙参照を、現行の正本（req-impact-map.md・IR frontmatter の AUTOGEN 導出対応表）への参照へ更新する。
      (4) archive-builder.test.ts・boundary-pipeline.test.ts（trusted-distribution-gate 配下）の UTF-8 BOM を除去する
      （意図的な固定でないことを確認のうえ実施。両ファイルの本文に BOM 扱う試験記述なし・リポジトリ唯一の BOM 付与
      ファイル2件）。(5) skill-projection-manifest.yaml を AUTOGEN 正規手順で再生成して main の手動残置分と導出結果の
      差分を解消する。手動残置が正当な理由がある場合はその根拠を記録し、dry-run が WOULD UPDATE を報告しない状態へ
      戻す。あわせて manifest 鮮度の機械検査（AUTOGEN freshness 系 checker への組み込み）の要否を評価する。
      (6) REQ-119.md:35・REQ-120.md:41 の採番仮記括弧句を除去する（採番確定済み・REQ-001-014 過去前提不含原則の
      表現残留是正・docs-check pass の維持確認込み・ACT-REQ-001/002）。
  - id: AG-013
    content: >-
      prepare_definition_pr.ts 計測日収束 trigger の表記不一致修正（RU-0293）。hasMeasurementDrift 判定の正規表現
      /IndexGenerationConsistency/（キャメル表記）を check_integrity.ts の実出力表記 index-generation-consistency
      （ケバブ表記）と突合するように修正する。これにより case-open STEP-4 機械工程で計測日収束の派生物補正 commit と
      frontmatter updated 追随が発動せず派生物が uncommitted で残る逸脱（Case #3964・PR #3965 で手動 contingency
      〔補正 commit 8f4053eb4・bd215ec33〕で回復済みの再現性のある欠陥）を構造的に解消する。対応する機械突合テスト
      （scripts/tests/prepare_definition_pr.test.ts または prepare-validate-input.test.ts）へ、checker 実出力文字列を
      trigger 判定が捕捉することのテストを追加する。
  - id: AG-014
    content: >-
      ADR 受理形式の確定と正規 lib ADR helper 走査仕様の再評価（RU-0294・HITL Q-RD-20261115-01 回答選択肢 A）。
      ADR 導入不採用を確定する（DEC-009「ADR から Decision への正規成果物モデル移行」status: accepted を維持）。
      ADR 受理形式の権威ある契約は新設しない。DEC-009「### 移行方針」節へ「ADR の将来導入は行わない（2026-11-15
      確定・ADR 受理形式の新契約は新設しない）」の確定記録を追記する（ACT-DEC-001。既存の移行方針本文は変更しない）。
      根拠: 現行リポジトリに ADR ファイルは 0 件（docs 配下・retired 配下とも実在せず機械実測済み）であり、受理形式
      契約の新設の実利が現状ゼロであること。契約確定に伴い正規 lib（artifact-validation scripts/lib/frontmatter.ts）の
      ADR helper（adrNumberFromFilename・extractAdrNumber の歴史互換走査〔4 桁固定〕）を ADR 導入前提の死装備として
      廃止対象とし、helper の利用箇所・テスト・参照の有無を精査した上で廃止する（req-file-manager 側の未使用局所
      helper 2 関数は Case #4005（PR #4017）で廃止済み）。廃止に伴う検査・参照の追随確認を含める。
  - id: AG-015
    content: >-
      ガード編集意味論共通部の第3実装（Senpi edit-interpretation.ts）の収束（RU-0295）。実施前に PR 4043 の E4-1 gate
      違反修正（コメント内 producer 内部 ID 除去）とマージの完了状況を確認する（PR 4043 は MERGED 2026-11-13 の実績・
      実装時に E4-1 修正の完了を再確認する）。Senpi edit-interpretation.ts（src/senpi/plugins/agentdev-guard-connection/
      lib/edit-interpretation.ts・REQ-099-013/014 対応）を lib/edit-semantics.ts（共通部）への参照または同等実装の
      移設へ収束させる。実施時は PR 4043 Design 確定候補の差異処理パターン（解析結果の消費方法での分離:
      matchCount 消費・unknownLines malformed 化・@@ anchor 強制・replaceAll 無効型拒否の有無で固有条件を分離）を
      適用する。
  - id: AG-016
    content: >-
      promote 系 workflow skill 等の lifecycle 正本節との本文複製境界精査（RU-0296）。promote 系 workflow skill
      （agentdev-workflow-intake-promote・agentdev-workflow-learning-promote・agentdev-workflow-inspect-promote）・
      agentdev-doc-diagnostics・agentdev-workflow-inspect-docs の各記述が「呼出条件・工程位置の記述」に留まり、
      lifecycle 正本節（agentdev-workflow-lifecycle「共通報告・Decision・自律確定規約」節・B2-1 集約先〔PR #4038
      で確定〕の完了報告の必須要素 / decision 成果物の役割と正本の優先度への参照 / promote 系操作の自律確定と
      HITL 境界 / inspect-* コマンド選択 routing）と本文複製になっていないかを精査する。精査は inspect-skills
      （意味的重複検出）経由の機械診断で実施できる。複製が検出された場合は正本への名レベル参照へ置換する。
  - id: AG-017
    content: >-
      同名試験ファイル 2系統の残存評価（RU-0297）。同名の試験ファイルが2系統存在し内容が一致しない:
      .opencode/skills/repo-agentdev-integrity/scripts/tests/check_integrity.test.ts（2026-10-02・18,160B）と
      scripts/check_integrity.test.ts（2026-11-13・251,068B）、scripts/self/release/package-release-archive.test.ts
      （2026-10-03・6,134B）と .opencode/skills/repo-agentdev-integrity/scripts/package-release-archive.test.ts
      （2026-11-13・35,094B）。旧い側の試験が固有の検証義務を持つか、現行の試験が必要な範囲を代替できるか、
      bun test の収集範囲で実際に両方が実行されているかを確認した上で、削除・維持を判断する（判断は評価完了後に
      確定する。削除を前提としない）。2026-10 の src/common 正本化移行（#3325/#3326）の残骸である可能性の確認を
      含める。
  - id: AG-018
    content: >-
      senpi guard-connection 試験 1件不合格の通常配置追試と分類（RU-0298）。通常の位置に checkout した環境での
      追試を前提とする（評価用 worktree〔コミット e0f551be・Temp 配下〕で bun test ./src/ 実行時、
      src/senpi/plugins/agentdev-guard-connection/tests/guard-connection.test.ts 159行の1件のみ不合格・2007合格）。
      合格する場合は環境条件（worktree 配下での実行時の projectRoot 解釈差等）の明記のみを行う。どの環境でも
      不合格する場合は、isApprovedTemporaryPath の判定順序（一時領域判定の先行）と projectRoot 外パス分類の試験
      期待経路の不整合として、実装か試験のどちらを正とするかを判断・修正する。
  - id: AG-019
    content: >-
      textlint-guard gate 本体の vendor 未生成 crash に対する fail-closed 案内経路の整合（RU-0299）。vendor 未生成時の
      gate 本体の起動検査（crash 前の fail-closed 停止と導入手順案内の表示）を追加するかの要否を判断し、必要なら
      実装する（vendor 未生成環境で gate 本体〔bun src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .〕が
      Windows crash〔exit 3221226505〕し得る実測に基づく。vendor 生成後の再実行で exit 0 実績・crash 分の証跡
      textlint-final.exit は PR #4020 証拠退避に保持）。導入形態ごとの実行場所は plugin README「導入時の依存生成手順」を
      参照先とする。
  - id: AG-020
    content: >-
      checker 実行ランタイム選択規律の Design 補強（RU-0300）。checker-execution-contracts.md「安定実行経路」節へ
      (1) vendored bundle（blob: URL 動的 import）を含む checker は bun 経由で実行する（node は vendor 非依存 checker
      向けの選択肢。根拠: Case #3970 で node v26 の既定 ESM loader が blob: URL 動的 import を fail-closed ブロックし
      gate が検査不能〔exit 1・0 inspected〕となった実測）、(2) checker の依存 API（Bun.YAML・import.meta.path・
      require・vendored bundle）と実行経路の対応表を追記する。安定実行経路の標準（stdout 証跡を要する checker の
      module import 経由）は vendor 非依存 checker の規律として維持する。既存 L229 の Bun ランタイム API 依存 checker
      の bun 経由規律行と重複・矛盾しない形で統合する（ACT-DESIGN-003）。
  - id: AG-021
    content: >-
      case-open 円等検出の複数トークン・二段検証（RU-0301）。issue-operation-safety.md「search トークンの選択性指針」節へ
      「ヒット 0 件時は合意済み対象・目的から導出した主題語と対象 REQ 番号による再検索を実施する二段検証」を追加する。
      case-open references（definition-pr-and-idempotency.md STEP-2 節等）の円等検出手順に複数トークン検索
      （topic_slug + 主題語 + REQ 番号）を明記する。背景: case-open STEP-2 の円等検出で draft topic_slug 単独の
      search トークンが空振りし、既存 Root Case（#3988）と設計 PR（#3991）が既存であることが判明後に重複新規作成した
      実害（Case #3989・PR #3990・tree 差分 0 件の内容不備なし証明済み）。横展開として、既存成果物の円等検出を行う全
      workflow（case-ready・case-revise・case-close）へ同種の複数トークン・二段検証の適用を検討対象に含める。
  - id: AG-022
    content: >-
      yomiyasu lint 一時ファイル配置指示と書込み guard 境界の整合（RU-0302）。lifecycle SKILL.md「文章品質・書込み規約」
      節の yomiyasu lint 配置指示（L158）を「project root 内の gitignore 対象領域（.agentdev/tmp/ 等・検査後削除）へ
      新規作成」へ統一する。同文書の guard 実効範囲（L172-183）と scripts/README.md の配置指針（workspace 外 temp 禁止・
      project root 内限定・commit 対象外・検査後削除）の 4 方針に整合させる。背景: 配置指示（リポジトリ外）に従う工程で
      textlint 書込み guard の project root 外書込み fail-closed 拒否に恒常衝突（Case #4054・#4069 の 2 工程観測）。
      書込み guard の fail-closed は維持する（guard の解除・迂回は行わない）。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-119.md
    target_area: "## 検証"
    source_items: [AG-012]
    content: |
      REQ-119.md「## 検証」節（35行）の段落末尾「REQ-119 の番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする（本文は現行最大 REQ-118 時点の次番号を仮記）。」から仮記括弧句「（本文は現行最大 REQ-118 時点の次番号を仮記）」を除去し、「REQ-119 の番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする。」とする。
      根拠: 採番は確定済み（REQ-122 まで採番済み・現行最大は REQ-121）であり、括弧句は採番前の一時状態記述の残留（REQ-001-014「現行文書の本文は過去前提を含まない」違反の表現残留）。inspect R-5（自律確定済み finding・修正方向一意）の是正対象。意味を変えない機械的更新であり重要変更の通知対象外（併せて通知済み）。
      突合確認済み（STEP-6）: 対象段落は「## 検証」節内・旧文は一意に存在。docs-check pass の維持を確認する。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-120.md
    target_area: "## 備考"
    source_items: [AG-012]
    content: |
      REQ-120.md「## 備考」節（41行）の箇条書き行「- 要件番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする（本文は現行最大 REQ-119 時点の次番号 REQ-120 を仮記）。」から仮記括弧句「（本文は現行最大 REQ-119 時点の次番号 REQ-120 を仮記）」を除去し、「- 要件番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする。」とする。
      根拠: ACT-REQ-001 と同一（採番確定済み・表現残留是正・意味を変えない機械的更新）。突合確認済み（STEP-6）: 対象行は「## 備考」節内・旧文は一意に存在。docs-check pass の維持を確認する。
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    target_area: "## 要件"
    source_items: [AG-007]
    content: |
      REQ-010.md「## 要件」テーブル（2列構造「| ID | 要件 |」・現行最終行 REQ-010-084）の末尾へ、次の新規行（REQ-010-085・採番は決定的採番スクリプト alloc-req-number.ts の結果を正とする）を追記する:
      | REQ-010-085 | docs-check または CI は、意図的な frontmatter updated 進行を含む内容変更 PR が merge された場合に IR-072（req-updated-freshness）が新規検出される構造に対し、内容変更 PR での frontmatter updated 同時進行（REQ 更新手順の一手順化）を運用規則として所有すること。updated 進行を PR 本体と同一変更セットで行うことを標準とし、merge 後の補正 commit を既定としないこと。許容幅規則（同日内差分の扱い等）の調整要否は実装時に検討して確定し、その判断記録を Definition に含めること（REQ-010-081 の運用判断枠の延長・RU-0287） |
      根拠: IR-072 の既知 NG が複数件残存し、意図的な updated 進行を伴う PR の構造的性質により新規検出が繰り返されるため、運用規則の恒久命題を REQ 行として所有する（Jev 既存REQ照合判断 APPEND・0.69・最終判断一致）。突合確認済み（STEP-6）: REQ-010 テーブルは 2列構造・現行最終行 REQ-010-084・テーブル後は空行 +「## 適用範囲」。
  - id: ACT-DEC-001
    artifact: decision
    operation: append
    target: docs/decisions/DEC-009.md
    target_area: "### 移行方針"
    source_items: [AG-014]
    content: |
      DEC-009.md「### 移行方針」節（46行〜・節末尾）へ、次の確定記録段落を追記する（既存の移行方針本文は変更しない）:
      ADR の将来導入は行わない（2026-11-15 確定・HITL 質問 Q-RD-20261115-01 の relayed answer 選択肢 A）。ADR 受理形式の権威ある契約は新設しない。正規 lib（artifact-validation scripts/lib/frontmatter.ts）の ADR helper（adrNumberFromFilename・extractAdrNumber の歴史互換走査〔4 桁固定〕）は ADR 導入前提の死装備として廃止対象とし、実現面変更（backlog-auto 一式 20261115T191842JST・RU-0294・AG-014）で廃止する。根拠: 現行リポジトリに ADR ファイルは 0 件（docs 配下・retired 配下とも機械実測・2026-11-15）であり、受理形式契約の新設の実利が現状ゼロであること。本記録は既存の移行方針（ADR から Decision への正規成果物モデル移行・status: accepted）の明確化であり、方針変更を伴わない。
      突合確認済み（STEP-6）: DEC-009 は「### 移行方針」節（46行）実在・節内は既存段落で構成。frontmatter updated の進行（実施日へ更新）を同時に行う。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/integrity/distribution-boundary.md
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    target_area: "## 配布物本文の記述規則"
    source_items: [AG-005]
    content: |
      distribution-boundary.md「## 配布物本文の記述規則」節（43行〜・節末尾）へ、次の運用規律を追記する:
      配布 skill 間の正本参照は backtick パス（Markdown リンクなし）で記述する運用を正とする。配布先でのリンク破損を回避するため、配布物本文内の skill 間正本参照は Markdown リンクを使用しない。配布境界 checker の concrete path 検証（hits 0 確認）を併記し、backtick パス記述の運用が concrete path 検出の誤検出源にならないことを確認する。背景: PR #4065 本文の記録にのみ存在した運用（配布先でのリンク破損回避）を Design 様式として正規化する。
      突合確認済み（STEP-6）: 対象節は「## 配布物本文の記述規則」（43行）実在・追記先は節末尾。frontmatter updated の進行を同時に行う。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_design:
      operation: update
      domain: foundations
      slug: v4-v5-crosswalk
    target_area: "frontmatter updated"
    source_items: [AG-009]
    content: |
      v4-v5-crosswalk.md の frontmatter updated（現行 2026-10-14）を実施日へ最新化する。あわせて triage (b)（inspect S-1 決定的導出・IR-054 draft 放置解消）として内容更新を実施する: (1) 親 v5-adopted-conventions.md の 2026-11-04「解決手順」節更新（L68-79 target_area 追記）の子側波及の検討と反映、(2) living tracking（planned → confirmed → executed）の長期休止期間と updated 最新化の併存整理（IR-054 false_positive_risk「中」への対応）、(3) inbox 残置の R-1（REQ-035-006 旧 Wave 語彙の現行化）と S-2（REQ-111-013 covers 宣言重複の集約判断）の同時再評価（両項の defer 記録は .agentdev/inspect/inbox/inspect-docs-finding-20261115T103843Z.md 側に保持）、(4) docs/designs/README.md:193 の親行備考へ joint triage 記録の追記。
      内容更新の範囲確定は本 Design の更新判断手順（親更新の波及検討・living tracking 併存整理）に従って実施時に確定し、確定結果を検証差分に記録する。廃止・昇格は行わない（REQ-108-012 が本 crosswalk 構造を現行義務として要求中・triage (a)/(c) は不適の決定的導出済み）。突合確認済み（STEP-6）: 実パス実在（96 行・frontmatter status: draft・updated: 2026-10-14）。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: "## 安定実行経路"
    source_items: [AG-020]
    content: |
      checker-execution-contracts.md「## 安定実行経路」節（183行〜）へ、次の実行ランタイム選択規律と対応表を追記する（節末尾・既存 L229 の規律行と統合）:
      (1) vendored bundle（blob: URL 動的 import）を含む checker は bun 経由で実行する。node は vendor 非依存 checker 向けの選択肢である。根拠: node v26 の既定 ESM loader は blob: URL 動的 import を fail-closed ブロックし、vendored engine bundle（textlint-engine.bundle.json）を含む checker ラッパを node --experimental-strip-types で実行すると検査不能（exit 1・0 inspected・Case #3970 実測）となる。(2) checker の依存 API 別の実行経路対応表: Bun.YAML 依存 → bun 経由（bun run）／ import.meta.path 依存 → bun 経由を標準・node 互換の import.meta.url 置換可／ require 依存 → createRequire 互換化後に node import 経由、または CLI 例外経路／ vendored bundle 含有 → bun 経由のみ。既存の L229 行（Bun ランタイム API 依存 checker は bun 経由）は本対応表に統合し、重複行は除去する。安定実行経路の標準（stdout 証跡を要する checker の module import 経由）は vendor 非依存 checker の規律として維持する。
      突合確認済み（STEP-6）: 対象節「## 安定実行経路」（183行）実在・L229 に既存規律行・節内に ESM 互換性要件（189行〜）・link profile 実効実行要件（196行〜）等のサブ節構造。frontmatter updated の進行を同時に行う。
conflict_resolutions:
  - id: CR-001
    conflict: RU-0294（ADR 受理形式契約の確定）は DEC-009（ADR から Decision への移行・accepted）と選択肢に応じて衝突し得る（契約新設 = DEC-009 の再評価方向）。また RU-0292 の仮記括弧句除去対象（REQ-119/120 本文）は inspect R-5 finding と REQ 本体変更（重要変更の通知対象か軽微か）の区分を要する
    resolution: HITL 質問 Q-RD-20261115-01 に選択肢 A（ADR 導入不採用・DEC-009 維持）が relayed answer として確定し、衝突を解消（新規 Decision 不要・DEC-009「### 移行方針」節への確定記録追記は既存方針の明確化）。REQ-119/120 の修正は意味を変えない機械的更新として軽微に区分し、ドラフト保存前に併せて通知済み（重要変更の事前通知の実施記録を参照）
operation_units:
  - ou_id: OU-001
    source_ru: RU-0281
    target_req: REQ-118
    description: |
      RA-002 撤去追随の旧機構参照・文言・sidecar 対応行の整理（AG-001・RA-001）。
      冪等確認前置（#3970 CLOSED 実績の再確認）の下で adapter SKILL.md・AGENTS.md 文言現行化、
      traceability sidecar 旧機構モジュール対応行削除、REQ-118 系 retired 判定（実在確認前置）、
      traceability check（対象要件行限定）で missing findings 新規立ちなし確認。投影同期を含める
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    verification_refs: [TS-001]
  - ou_id: OU-002
    source_ru: RU-0293
    description: |
      prepare_definition_pr.ts 計測日収束 trigger の表記不一致修正（AG-013・RA-013）。
      単一 root cause の bugfix。正規表現ケバブ表記突合修正 + 機械突合テスト追加
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    verification_refs: [TS-013]
  - ou_id: OU-003
    source_ru: RU-0282
    description: |
      integrity suite 既存 fail の区分けと fixture・テスト条件是正（AG-002・RA-002）。
      区分けを先行し、fixture 是正・vendor 依存是正・repo-state 依存是正判断・pin/T6 突合・
      check_extensions strict failure 実修復判断を実施
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    verification_refs: [TS-002]
  - ou_id: OU-004
    source_ru: RU-0283
    description: |
      suite 実行環境前提・標準実行形の整備（AG-003・RA-003）。区分け結果（OU-003）を参照。
      cd-form 統一・worktree 依存復元前置明示・Windows CI runner 定期実行整備と
      fail クラス baseline 機械突合
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    verification_refs: [TS-003]
  - ou_id: OU-005
    source_ru: RU-0284
    description: |
      配布物参照・相対リンクの整合是正（AG-004・RA-004）。integrity SKILL.md リンク修正・
      vocabulary-registry リンク3件修正・委譲 prompt check パス是正・scripts/src 旧配置参照更新・
      gh-tool README リンク確認・履歴報告参照追随義務の契約確認
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    verification_refs: [TS-004]
  - ou_id: OU-006
    source_ru: RU-0285
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    description: |
      配布境界検査の整備（AG-005・RA-005）。boundary detector への除外領域規定適用・
      blob 分類と manifest projection entries 空経路の解明・整備・相互参照解決可能性検査の
      汎用 checker 候補設計と採否判断・backtick 運用を distribution-boundary.md へ追記（ACT-DESIGN-001）
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    verification_refs: [TS-005]
  - ou_id: OU-007
    source_ru: RU-0286
    description: |
      integrity 規則メタデータ・検査器・検査データの整合是正（AG-006・RA-006）。
      IR-013 接続方向確定（machine-check 再分類）・IR-018/042 専用 fixture 試験・IR-045 fixture 参照現行化・
      IR-055 正規化規則明文化・IR-066 retired 語彙追加要否判断と実施・obsolete-path-map new 側更新
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    verification_refs: [TS-006]
  - ou_id: OU-008
    source_ru: RU-0287
    target_req: REQ-010
    description: |
      IR-072 既知 NG 是正と frontmatter updated 運用規則の整備（AG-007・RA-007）。
      NG 残存対象の洗出しと実修復基本・baseline 登録は統一選択基準に従う・
      REQ-010-085 新規行追記（ACT-REQ-003）・許容幅規則調整要否判断。
      IR-072 の updated 進行を伴うため OU-013 と近接実行推奨
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    verification_refs: [TS-007]
  - ou_id: OU-009
    source_ru: RU-0288
    description: |
      IR-053 検出器の否定文文脈許容改善（AG-008・RA-008）。RT-3 の3点を検討対象とした
      検出器改善の実装。ng-baseline 登録は行わない。対象 README 文言は維持（req-define 確定）
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    verification_refs: [TS-008]
  - ou_id: OU-010
    source_ru: RU-0289
    target_design:
      operation: update
      domain: foundations
      slug: v4-v5-crosswalk
    description: |
      v4-v5-crosswalk.md の draft 放置解消・triage (b)（AG-009・RA-009）。
      内容更新 + frontmatter updated 最新化（ACT-DESIGN-002）・R-1・S-2 同時再評価・
      docs/designs/README.md:193 joint triage 記録追記
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
    verification_refs: [TS-009]
  - ou_id: OU-011
    source_ru: RU-0290
    description: |
      worktree 運用規律の整備（AG-010・RA-010）。worktree-operations.md cleanup 系節への規律追記
      （コマンド分離・所有 run 照合・具体ファイル名個別指定・wildcard 禁止）・1.5 節掃除対象追加・
      bun test 環境前提補記・QG-4 側配置選択肢判断。case-close cleanup 参照行文言追随を含める
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
    verification_refs: [TS-010]
  - ou_id: OU-012
    source_ru: RU-0291
    description: |
      case-close 機械工程規律の整備（AG-011・RA-011）。case-close SKILL.md 節補記・
      cleanup-and-capture.md STEP-5 freshness 順序明記と verify-only 入力正規化・
      close_mechanical_steps.test.ts fixture 分割番号割当 QG-4 正規形整合・
      scripts README へ reclamation 手動回収標準手順明記・deleteFile 注入は機構整理候補として保持
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
    verification_refs: [TS-011]
  - ou_id: OU-013
    source_ru: RU-0292
    target_req: REQ-119
    description: |
      正規文書の表層・参照・鮮度の軽微是正6件（AG-012・RA-012）。textlint-guard README コマンド例統一・
      artifact-validation scripts README textlint 助言解消・req-define-detailed-gates.md 語彙参照更新・
      BOM 除去2件・skill-projection-manifest.yaml AUTOGEN 再生成・REQ-119/120 仮記括弧句除去
      （ACT-REQ-001/002）。IR-072 の updated 進行を伴うため OU-008 と近接実行推奨
    scale: standard
    depends_on: []
    recommended_order: 13
    issue_policy: single
    verification_refs: [TS-012]
  - ou_id: OU-014
    source_ru: RU-0294
    description: |
      ADR 受理形式の確定と正規 lib ADR helper 走査仕様の再評価（AG-014・RA-014）。
      HITL Q-RD-20261115-01 回答選択肢 A。ADR 導入不採用の確定記録を DEC-009「### 移行方針」節へ追記
      （ACT-DEC-001・target: docs/decisions/DEC-009.md）し、正規 lib ADR helper（4桁固定走査）を
      利用箇所・テスト・参照の精査の上で廃止。Design 操作対象外（Decision 追記が正）
    scale: standard
    depends_on: []
    recommended_order: 14
    issue_policy: single
    verification_refs: [TS-014]
  - ou_id: OU-015
    source_ru: RU-0295
    description: |
      ガード編集意味論共通部の第3実装（Senpi edit-interpretation.ts）の収束（AG-015・RA-015）。
      PR 4043 マージ済み（MERGED 2026-11-13・実装時に E4-1 修正完了を再確認）の下で、
      Senpi edit-interpretation.ts を lib/edit-semantics.ts 共通部への参照または同等実装移設へ収束。
      PR 4043 Design 確定候補の差異処理パターンを適用
    scale: standard
    depends_on: []
    recommended_order: 15
    issue_policy: single
    verification_refs: [TS-015]
  - ou_id: OU-016
    source_ru: RU-0296
    description: |
      promote 系 workflow skill 等の lifecycle 正本節との本文複製境界精査（AG-016・RA-016）。
      inspect-skills 機械診断経由の複製精査と複製検出時の正本名レベル参照置換
    scale: standard
    depends_on: []
    recommended_order: 16
    issue_policy: single
    verification_refs: [TS-016]
  - ou_id: OU-017
    source_ru: RU-0297
    description: |
      同名試験ファイル 2系統の残存評価（AG-017・RA-017）。固有検証義務・現行側代替可否・
      bun test 収集での両方実行の実否確認の上で削除・維持判断（評価完了後に確定・削除前提としない）。
      #3325/#3326 残骸可能性確認を含める
    scale: standard
    depends_on: []
    recommended_order: 17
    issue_policy: single
    verification_refs: [TS-017]
  - ou_id: OU-018
    source_ru: RU-0298
    description: |
      senpi guard-connection 試験 1件不合格の通常配置追試と分類（AG-018・RA-018）。
      通常配置での追試→合格なら環境条件明記・不合格なら実装か試験の正判断と修正
    scale: standard
    depends_on: []
    recommended_order: 18
    issue_policy: single
    verification_refs: [TS-018]
  - ou_id: OU-019
    source_ru: RU-0299
    description: |
      textlint-guard gate 本体の vendor 未生成 crash 対応（AG-019・RA-019）。
      起動検査要否判断と実装（crash 前の fail-closed 停止と導入手順案内表示）
    scale: standard
    depends_on: []
    recommended_order: 19
    issue_policy: single
    verification_refs: [TS-019]
  - ou_id: OU-020
    source_ru: RU-0300
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    description: |
      checker 実行ランタイム選択規律の Design 補強（AG-020・RA-020）。
      checker-execution-contracts.md「安定実行経路」節へ vendored bundle → bun 規律と
      依存 API 別実行経路対応表を追記（ACT-DESIGN-003）。既存 L229 行と統合。
      OU-006 と docs/designs/integrity/ 領域が近接のため近接実行推奨
    scale: standard
    depends_on: []
    recommended_order: 20
    issue_policy: single
    verification_refs: [TS-020]
  - ou_id: OU-021
    source_ru: RU-0301
    description: |
      case-open 円等検出の複数トークン・二段検証（AG-021・RA-021）。
      issue-operation-safety.md 選択性指針節への二段検証追加・case-open references への
      複数トークン検索明記・case-ready/case-revise/case-close への横展開適用検討
    scale: standard
    depends_on: []
    recommended_order: 21
    issue_policy: single
    verification_refs: [TS-021]
  - ou_id: OU-022
    source_ru: RU-0302
    description: |
      yomiyasu lint 一時ファイル配置指示と書込み guard 境界の整合（AG-022・RA-022）。
      lifecycle SKILL.md 配置指示の project root 内 gitignore 対象領域への統一・
      4 方針整合。書込み guard fail-closed は維持
    scale: standard
    depends_on: []
    recommended_order: 22
    issue_policy: single
    verification_refs: [TS-022]
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      (1) 実在確認証跡: adapter SKILL.md（src/common/skills/agentdev-case-run-execution-adapter/SKILL.md と .opencode 投影）の現行文言への更新差分と、作成ヘルパー・台帳参照の旧文言の grep 0 件確認（docs・src・.opencode・AGENTS.md 範囲）。(2) sidecar: traceability/agentdev-workflow-case-close.yaml の旧機構モジュール名（verification-resources-ledger.ts 等 4 種）の参照行が 0 件になったことを grep で確認。(3) retired 判定: 該当行の実在確認結果と retired 判定の実施記録（または retired 対象なし証跡）を検証差分で確認。(4) traceability check（対象要件行限定）の実行結果で missing 系 findings が新規に立たないことを確認。(5) 投影同期（src/common → .opencode）の確認。
    pass_criteria: |
      旧文言 grep 0 件・sidecar 旧機構モジュール参照行 0 件・retired 判定の実施記録（または retired 対象なし証跡）存在・traceability check（対象要件行限定）missing findings 新規 0 件・投影同期確認がすべて成立すること。
    on_failure: |
      fix-and-reverify（文言残存・sidecar 参照残存は修正して再検証。traceability check の missing findings は sidecar 行と REQ 行の対応再確認後に再実行）。
  - id: TS-002
    target_item: AG-002
    verification: |
      (1) 区分け結果の記録確認: baseline 存在 fail 群（timeout 11件・consumer fixture 9件・vendor 依存 2件・checkExtensions 1件・split3 11件・T6）の区分け（環境調整で消える fail / 真の欠陥 / 別案件管理対象追加）が証跡付きで記録されていることを確認。(2) 区分けに基づく是正後、対象テストを bun test（cd-form・依存復元済み環境）で実行し、是正対象 fail が解消していることを Ran N tests 出力で確認。(3) pin 2件・T6 の投影突合記録と check_extensions strict failure 2件の実修復判断記録を確認。
    pass_criteria: |
      区分け記録が全対象を網羅し、区分け結果に基づく是正後の対象テストが合格すること（環境調整で消える fail は環境整備後の実行で解消・真の欠陥は是正で解消）。pin/T6 突合記録と strict failure 実修復判断記録が存在すること。
    on_failure: |
      fix-and-reverify（区分け誤りは対象の再区分けと是正修正後に再検証）。
  - id: TS-003
    target_item: AG-003
    verification: |
      (1) 正規 3 分割の実行手順（機械工程 script・委譲 prompt・基線固定記録）の実行形が cd-form に統一されていることを該当文書群の grep で確認（directory 引数付き bun test 実行記述の残存 0 件）。(2) worktree 作成手順への依存復元前置明示（または計数環境前提の記録様式追加）の実施を確認。(3) Windows CI runner での bun test 分割③定期実行と fail クラス baseline 機械突合の整備を、CI 設定と baseline 突合の動作確認（既知 fail 集合との差分 0 件の状態）で確認。
    pass_criteria: |
      cd-form 統一の記述残存 0 件・依存復元前置の明示存在・CI runner での定期実行と baseline 機械突合が動作し差分 0 件であること。
    on_failure: |
      fix-and-reverify（CI 設定・baseline 突合の不具合は修正後に再実行）。
  - id: TS-004
    target_item: AG-004
    verification: |
      (1) 修正対象リンク（integrity SKILL.md 206行・vocabulary-registry.md 340/363行の3件）が解決することをパス実在確認で検証。(2) 委譲 prompt テンプレートの check パスが正規実体（src/common/skills/agentdev-traceability/scripts/src/check.ts）と一致することを grep で確認。(3) scripts/src/ 旧配置参照の実配置更新後、旧参照パス（存在しない機械工程 script 参照）の残存が精査記録付きで解消していることを機械診断で確認。(4) gh-tool README 2リンクの consumer 配置解決確認記録と、IR-055 の相対 Markdown リンク検出対象確認記録を確認。(5) 履歴報告の参照追随義務の契約確認記録を確認。
    pass_criteria: |
      修正対象リンクがすべて解決（実在パス）し、委譲 prompt パスが正規実体と一致し、旧配置参照の残存が判断記録付きで 0 件（許容判断付きの場合はその記録存在）であり、4 件の確認記録が存在すること。
    on_failure: |
      fix-and-reverify（未解決リンクは修正後に再検証。判断記録の不足は記録追記後に再確認）。
  - id: TS-005
    target_item: AG-005
    verification: |
      (1) trusted-distribution-gate pipeline（bootstrap mode）を main root で実行し、boundary detector が tests 配下の検出刺激用サンプル文字列を除外（distribution-boundary.md「検査対象の除外領域」規定適用）して unclassified 大量検出が解消し code 0 で完走することを確認。(2) blob 分類（loadAndClassify）と manifest projection entries の空経路解明・整備の記録と main root・Windows pipeline 実行前提の検証手順を確認。(3) 相互参照解決可能性検査の汎用 checker 候補設計と採否判断の記録を確認。(4) distribution-boundary.md「## 配布物本文の記述規則」節への backtick 運用追記（ACT-DESIGN-001）と concrete path 検証（hits 0 確認）の併記を確認し、gate 実行で hits 0 が確認できること。
    pass_criteria: |
      bootstrap mode pipeline が code 0 完走・除外領域適用の検証記録存在・空経路の解明記録存在・checker 候補設計と採否判断記録存在・backtick 運用追記と hits 0 確認が成立すること（AG-013 最終合格確認の実行可能性回復）。
    on_failure: |
      fix-and-reverify（gate 実行失敗は検査設定・除外適用の修正後に再実行）。
  - id: TS-006
    target_item: AG-006
    verification: |
      (1) IR-013: check_integrity 実行で variant path 実在検出が results 統合に現れ、frontmatter（detection_method_class=machine-check・implementation_path・verification_path）が IR-074 機械照合を通過することを確認。(2) IR-018・IR-042: 追加された専用 fixture 試験が bun test で合格し、verification_path が専用試験を指すことを IR-074 機械照合で確認。(3) IR-045: fixture 参照の現行化（または廃止）と IR-069 欠番記録整合の確認記録を確認。(4) IR-055: 正規化規則の明文化収録を確認。(5) IR-066: retired 語彙追加の要否判断記録と実施（実施時は obsolete-vocabulary-map.yaml と IR066_VOCAB_PATTERNS の同一変更セット）を確認。(6) obsolete-path-map.yaml: backticks 2件の new 側更新（または retired 様式整理）と対照登録様式・checker 同期条件の確認記録を確認。check_integrity 全体の実行で新規 NG が立たないことを確認。
    pass_criteria: |
      IR-013 の分類と実装実態の乖離が解消（machine-check 接続）し、IR-018/042 専用試験合格・verification_path 機械照合通過、IR-045/055/066/obsolete-path-map の各整合確認記録が存在し、check_integrity 実行で新規 NG 0 件であること。
    on_failure: |
      fix-and-reverify（IR-074 機械照合不合格は frontmatter・パス修正後に再照合。checker 実行 NG は原因修正後に再実行）。
  - id: TS-007
    target_item: AG-007
    verification: |
      (1) IR-072 実行（check_integrity）で既知 NG 残存対象（REQ-012/REQ-047/REQ-110・Design 10件以上・adf-simplification-deferred-records.md を含む）が解消または baseline 登録（provenance 付き・integrity-contracts.md 統一選択基準準拠）に分類されていることを確認。(2) docs/requirements/REQ-010.md への REQ-010-085 新規行追記（ACT-REQ-003）を確認し、表列構造（2列）が維持されることを確認。(3) 許容幅規則調整の判断記録を確認。(4) 追記行の採番は決定的採番スクリプトの結果と一致することを確認。
    pass_criteria: |
      IR-072 の NG が解消または baseline 登録分類済み・REQ-010-085 行が 2列構造で追記され docs-check pass・判断記録存在であること。
    on_failure: |
      fix-and-reverify（IR-072 NG の残存は updated 修正後に再実行。表構造崩れは行修正後に再検証）。
  - id: TS-008
    target_item: AG-008
    verification: |
      (1) IR-053 検出器の実行で、src/common/skills/agentdev-workflow-case-close/scripts/README.md:7 の否定文記述（gh pr view を発行しない旨の説明）が warning として検出されないこと（否定文文脈許容条件の動作確認）。(2) 検出器仕様（正規検出条件と既知許容）の照合記録と、area-based 除外宣言方式（REQ-010-066 準拠）との整合検討記録を確認。(3) ng-baseline / exemptions への新規登録が 0 件であることを確認。(4) 対象 README の文言が維持されていることを確認。
    pass_criteria: |
      対象行の IR-053 warning が解消（検出器側の許容で）し、ng-baseline/exemptions 新規登録 0 件・照合と整合検討の記録存在・README 文言維持であること。
    on_failure: |
      fix-and-reverify（許容条件の設計不備は検出器修正後に再実行。文言側の修正は本行の確定〔文言維持〕に反するため、文言修正が必要になった場合は判断記録の更新を要する）。
  - id: TS-009
    target_item: AG-009
    verification: |
      (1) docs/designs/foundations/references/v4-v5-crosswalk.md の frontmatter updated が実施日へ更新され IR-054 warning が解消していることを check_integrity 実行で確認。(2) 内容更新（親 2026-11-04「解決手順」節更新の子側波及検討・living tracking 併存整理）の実施と判断記録を検証差分で確認。(3) R-1・S-2 の同時再評価結果の記録（または再評価の実施記録）を確認。(4) docs/designs/README.md:193 の親行備考への joint triage 記録追記を確認。(5) status: draft が維持されること（triage (b) であり昇格しない）を確認。
    pass_criteria: |
      IR-054 warning 解消・内容更新と判断記録存在・R-1/S-2 再評価実施記録存在・joint triage 記録追記済み・status: draft 維持であること。
    on_failure: |
      fix-and-reverify（IR-054 warning 残存は updated・内容更新の反映漏れ修正後に再実行）。
  - id: TS-010
    target_item: AG-010
    verification: |
      (1) worktree-operations.md cleanup 系節への4規律追記（コマンド分離・所有 run 照合・具体ファイル名個別指定・wildcard 禁止）の本文存在を grep で確認。(2) 「1.5 remove 前退避ファイル掃除」節の掃除対象に依存整備物（明示パス指定）が追加されていることを確認。(3) cleanup-and-capture.md STEP-6-1 の文言追随を確認。(4) 「bun test 実行の環境前提」節への frozen-lockfile 前置・bun run --cwd .bin 解決要件・tsc fallback 補記を確認。(5) QG-4 側配置選択肢の判断記録を確認。(6) 追記後の関連テスト（bun test 対象範囲・cd-form）が合格することを確認。
    pass_criteria: |
      4規律の追記・掃除対象追加・文言追随・環境前提補記がすべて存在し、判断記録存在・関連テスト合格であること。
    on_failure: |
      fix-and-reverify（規律記述の欠落は追記後に再確認。テスト失敗は原因修正後に再実行）。
  - id: TS-011
    target_item: AG-011
    verification: |
      (1) case-close SKILL.md「完了判定の契約状態記録・未追跡残存検証」節への2補記（終了判定記録の範囲導出除外明示・humanConfirmedPaths 前の観測形確認前置）を確認。(2) cleanup-and-capture.md STEP-5 の freshness 順序明記と verify-only 入力正規化（ワークアラウンド構成除去・prNumber 0 正規構成）を確認（mergeablePolling maxAttempts 0 の記述残存 0 件）。(3) close_mechanical_steps.test.ts の fixture 分割番号割当が QG-4 正規形（①=integrity suite・②=src 側・③=plugins 系）と一致し、bun test で当該テストが合格することを Ran N tests 出力で確認。(4) scripts README.md への reclamation 手動回収標準手順明記と deleteFile 注入の機構整理候補保持記録を確認。
    pass_criteria: |
      2補記・順序明記・入力正規化・fixture 整合・README 明記がすべて存在し、close_mechanical_steps.test.ts が合格すること。
    on_failure: |
      fix-and-reverify（fixture 不整合は fixture と期待値の同時修正後に再実行）。
  - id: TS-012
    target_item: AG-012
    verification: |
      (1) textlint-guard README の最終検査コマンド例が bun <path> 直実行形式に統一されていることを確認（bun run 形式の残存 0 件）。(2) artifact-validation scripts README.md 59行の textlint 助言が解消していることを textlint 実行で確認。(3) req-define-detailed-gates.md 85行の語彙参照が現行正本参照に更新されていることを確認。(4) archive-builder.test.ts・boundary-pipeline.test.ts の先頭バイトが EF BB BF でないことを node 検査で確認（BOM 除去後の両テスト合格込み）。(5) generate_indexes.ts --dry-run が skill-projection-manifest.yaml について WOULD UPDATE を報告しない状態を main root クリーン状態で確認。(6) REQ-119.md:35・REQ-120.md:41 の仮記括弧句が 0 件（grep「仮記」で該当箇所なし）で docs-check pass を確認。
    pass_criteria: |
      6 件すべてが解消し（文言・textlint 助言・語彙参照・BOM・manifest 鮮度・仮記括弧句）、docs-check pass と関連テスト合格が成立すること。
    on_failure: |
      fix-and-reverify（各是正の残存は対象修正後に再検証）。
  - id: TS-013
    target_item: AG-013
    verification: |
      (1) prepare_definition_pr.ts の hasMeasurementDrift 判定が check_integrity 実出力表記（index-generation-consistency）を捕捉することを、実出力文字列を入力とした機械突合テスト（scripts/tests/prepare_definition_pr.test.ts または prepare-validate-input.test.ts に追加したテスト）の合格で確認。(2) 修正後の実コードに /IndexGenerationConsistency/ キャメル表記の残存がないことを grep で確認。(3) 計測日収束 step の発動（派生物補正 commit・frontmatter updated 追随）が手動 contingency を不要にする構造であることをテストで確認。
    pass_criteria: |
      追加テストが合格し（checker 実出力文字列の捕捉を検証）、旧表記の残存 0 件であること。
    on_failure: |
      fix-and-reverify（正規表現修正の不備は修正後に再実行）。
  - id: TS-014
    target_item: AG-014
    verification: |
      (1) docs/decisions/DEC-009.md「### 移行方針」節への確定記録追記（ACT-DEC-001）を確認し、既存本文の無変更を git diff で確認（追記のみ）。(2) 正規 lib（scripts/lib/frontmatter.ts）の ADR helper（adrNumberFromFilename・extractAdrNumber）の廃止後、helper 名の参照残存（src・scripts・tests 範囲）が 0 件であることを grep で確認。(3) 廃止に伴うテスト・参照の追随修正後、artifact-validation 系テストが合格することを bun test で確認。(4) frontmatter updated の進行を確認。
    pass_criteria: |
      DEC-009 追記済み（既存本文無変更）・ADR helper 参照残存 0 件・artifact-validation 系テスト合格であること。
    on_failure: |
      fix-and-reverify（参照残存は廃止漏れ箇所の修正後に再検証。テスト失敗は原因修正後に再実行）。
  - id: TS-015
    target_item: AG-015
    verification: |
      (1) PR 4043 の E4-1 修正完了とマージの完了状況確認記録を確認（MERGED 2026-11-13 実績の再確認）。(2) src/senpi/plugins/agentdev-guard-connection/lib/edit-interpretation.ts が lib/edit-semantics.ts 共通部への参照または同等実装移設へ収束していることを実装差分で確認（edit-interpretation.ts 独自実装の解析ロジック残存 0 件または参照化）。(3) PR 4043 Design 確定候補の差異処理パターン（matchCount 消費・unknownLines malformed 化・@@ anchor 強制・replaceAll 無効型拒否）の適用を guard-connection テスト（bun test ./src/ 通常配置）で確認。
    pass_criteria: |
      収束完了（独自解析ロジックの重複解消）・差異処理パターン適用・guard-connection テスト合格であること。
    on_failure: |
      fix-and-reverify（収束不備・テスト失敗は修正後に再実行）。
  - id: TS-016
    target_item: AG-016
    verification: |
      (1) inspect-skills 機械診断の実行結果（promote 系 3 workflow・doc-diagnostics・inspect-docs 対象）を確認。(2) 複製検出時の正本名レベル参照置換の実施記録を確認（複製検出 0 件の場合は精査記録で完結）。(3) 置換後の対象 skill が配布境界 checker・docs-check を通過することを確認。
    pass_criteria: |
      精査記録（機械診断結果）が存在し、複製は置換済みまたは検出 0 件であり、配布境界 checker・docs-check pass であること。
    on_failure: |
      fix-and-reverify（複製残存は参照置換後に再検査）。
  - id: TS-017
    target_item: AG-017
    verification: |
      (1) 同名試験ファイル 2系統（check_integrity.test.ts・package-release-archive.test.ts の各ペア）の評価記録（固有検証義務の有無・現行側による代替可否・bun test 収集での両方実行の実否確認・#3325/#3326 残骸可能性確認）を確認。(2) 削除・維持の判断記録（評価完了後に確定）を確認。(3) 判断実施後、bun test が想定収集数で実行され重複収集が解消（維持判断の場合は両方実行の意図性が記録）されていることを確認。
    pass_criteria: |
      評価記録と削除・維持判断記録が存在し、判断実施後の bun test 実行状態が判断内容と一致すること。
    on_failure: |
      record-in-findings（評価結果が判断に影響する範囲で不確実な場合は Findings に out-of-scope として記録し判断の再評価条件を明記。選択理由: 評価完了後判断は RU 自身が委譲した判断であり、実施時の証跡で確定させるため）。
  - id: TS-018
    target_item: AG-018
    verification: |
      (1) 通常配置（main checkout）での bun test ./src/ 実行結果を確認し、guard-connection.test.ts 159行の当該試験の合否を確認。(2) 合格の場合は環境条件明記（worktree 配下の projectRoot 解釈差等）の実施記録を確認。(3) 不合格の場合は isApprovedTemporaryPath 判定順序と試験期待経路の不整合分析記録と、実装か試験のどちらを正とするかの判断・修正記録を確認し、修正後のテスト合格を確認。
    pass_criteria: |
      追試結果の記録が存在し、合格なら環境条件明記あり・不合格なら判断と修正の記録と修正後合格があること。
    on_failure: |
      fix-and-reverify（不合格時の修正後は通常配置と worktree 配置の双方で再実行）。
  - id: TS-019
    target_item: AG-019
    verification: |
      (1) vendor 未生成環境（vendor 削除または未生成の plugin package）で gate 本体を実行し、crash（exit 3221226505）ではなく fail-closed 停止と導入手順案内表示（plugin README「導入時の依存生成手順」参照）で停止することを確認（起動検査実装時）。(2) 起動検査不要と判断した場合は判断記録と crash 経路の許容理由を確認。(3) vendor 生成後の gate 実行が exit 0 であることを再確認。
    pass_criteria: |
      起動検査実装時: vendor 未生成環境で crash せず fail-closed 停止と案内表示・vendor 生成後 exit 0。不要判断時: 判断記録存在。のいずれかが成立すること。
    on_failure: |
      fix-and-reverify（crash 経路の残存は起動検査の追加・修正後に再実行）。
  - id: TS-020
    target_item: AG-020
    verification: |
      (1) checker-execution-contracts.md「## 安定実行経路」節への vendored bundle → bun 規律と依存 API 別実行経路対応表の追記（ACT-DESIGN-003）を確認。(2) 既存 L229 行との統合後、重複・矛盾記述の残存がないことを確認。(3) 対応表の各経路が実在の checker 実行例（Case #3970・#3988 実績）と整合することを確認。(4) 安定実行経路の標準（module import 経由）が vendor 非依存 checker 規律として維持されていることを確認。frontmatter updated の進行を確認。
    pass_criteria: |
      規律と対応表の追記済み・重複矛盾なし・実績整合・標準維持・updated 進行であること。
    on_failure: |
      fix-and-reverify（記述不整合は追記修正後に再確認）。
  - id: TS-021
    target_item: AG-021
    verification: |
      (1) issue-operation-safety.md「search トークンの選択性指針」節への二段検証追加（ヒット 0 件時の主題語 + REQ 番号再検索）を確認。(2) case-open references（definition-pr-and-idempotency.md STEP-2 節等）への複数トークン検索明記を確認。(3) 横展開（case-ready・case-revise・case-close）への適用検討記録を確認。(4) 変更後の対象 skill 配布物が配布境界 checker を通過することを確認。
    pass_criteria: |
      二段検証追加・複数トークン明記・横展開検討記録が存在し、配布境界 checker pass であること。
    on_failure: |
      fix-and-reverify（記述欠落は追記後に再確認）。
  - id: TS-022
    target_item: AG-022
    verification: |
      (1) lifecycle SKILL.md L158 の配置指示が「project root 内の gitignore 対象領域（.agentdev/tmp/ 等・検査後削除）へ新規作成」へ更新されていることを確認。(2) L172-183 の guard 実効範囲記述と scripts/README.md の配置指針との 4 方針整合を確認（矛盾記述の残存 0 件）。(3) 書込み guard の fail-closed が維持されていること（guard 設定・実装の無変更）を確認。(4) 更新後の lifecycle SKILL.md が配布境界 checker・docs-check を通過することを確認。
    pass_criteria: |
      配置指示統一・4 方針整合・guard fail-closed 維持・checker pass であること。
    on_failure: |
      fix-and-reverify（指示の残存矛盾は文言修正後に再確認）。
realization_actions:
  - id: RA-001
    concern: RA-002 撤去追随の旧機構参照・文言・sidecar 対応行の整理
    responsibility: 配布 Workflow Skill（adapter）の委譲手順記述・repo-local ガイドレール・traceability sidecar の対応行の現行性維持責務（REQ-118・REQ-119-007 系の文言現行化債務の残部）
    ownership_hints:
      - src/common/skills/agentdev-case-run-execution-adapter/SKILL.md（L94・検証用一時資材の作成報告節。src/common 正本と .opencode 投影の双方）
      - AGENTS.md（リポジトリ直下・repo-local・配布対象外・作成先確認の制約文言）
      - traceability/agentdev-workflow-case-close.yaml（旧機構モジュール対応行・REQ-118 系参照）
      - docs/designs/foundations/ 配下の v4-delegation-contracts Design「検証用一時資材の作成・報告義務」節（現行文言の参照正本）
    intent: >-
      冪等確認前置（#3970 CLOSED 再確認）の下で文言現行化・sidecar 対応行削除・retired 判定を実施する。
      traceability check（対象要件行限定）で missing findings の新規立ちを確認して閉じる。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: integrity suite 既存 fail の区分けと fixture・テスト条件是正
    responsibility: integrity suite / bun test の baseline 存在 fail 群の区分け判断と fixture・テスト条件の保持責務（REQ-009-053 機械工程前提検証・REQ-113-002 品質検査経路の実現面）
    ownership_hints:
      - scripts/self/release/scripts-behavior.test.ts（makeConsumerRepo fixture・check ベースアサーション 9件）
      - textlint-guard-distribution.test.ts（vendor 生成状態依存 2件）
      - relied-diff 系（AC01〜AC09・T1〜T5）・allocation round-trip・上位層 docs 検査系テスト（repo-state 依存）
      - scripts/check_integrity.ts / check_extensions 系（backticks-identifier-threshold.md 不存在 strict failure 2件）
    intent: >-
      区分けを先行して確定し、区分け結果に基づく fixture・テスト条件是正を実施する。
      pin 2件・T6 の投影突合と別案件管理対象への追加要否確定を含める。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: suite 実行環境前提・標準実行形の整備
    responsibility: 正規 3 分割の実行手順・基線固定記録・worktree 作成手順・CI runner 実行環境の整備責務（REQ-113-002 品質検査経路の実行形態の実現面）
    ownership_hints:
      - 正規 3 分割の実行手順（機械工程 script・委譲 prompt・基線固定記録・2026-11-10 固定基線 5,598 試験）
      - src/common/skills/agentdev-git-worktree/references/worktree-operations.md（依存復元前置の明示候補）
      - Windows CI runner 設定（bun test 分割③ install.ps1 e2e 系）
    intent: >-
      cd-form への統一・依存復元前置の明示（または計数環境前提の記録様式追加）・
      CI runner での定期実行と fail クラス baseline 機械突合の整備を実施する。
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: 配布物参照・相対リンクの整合是正
    responsibility: 正規文書・配布物・委譲 prompt 中の参照パス・相対リンクの解決可能性維持責務（IR-055 導入先未解決参照検出の検出対象との整合）
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/SKILL.md（206行・integrity-rule-catalog.md リンク）
      - src/common/skills/agentdev-adopted-conventions/references/ 配下の vocabulary-registry.md（340行・363行）
      - 委譲 prompt テンプレート（機械工程・checker 実行の指定箇所・check_traceability.ts 旧パス）
      - Issue/Design/Skill 文面中の scripts/src/ 旧配置参照（inspect-skills・inspect-docs 経由の機械診断で列挙）
      - docs/reports/integrity/（履歴報告・参照追随義務の契約確認対象。docs/reports/ は履歴記録領域として検出対象除外の既定に注意）
    intent: >-
      修正方向が一意のリンク・パス参照を修正し、確認前提の判断（gh-tool README・履歴報告義務）は
      契約確認記録で確定する。検査器の .opencode 相対リンク検査範囲の確認を含める。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: 配布境界検査の整備（gate 除外領域適用・相互参照解決可能性検査・backtick 運用明文化）
    responsibility: trusted-distribution-gate pipeline・boundary detector・配布境界 Design の整備責務（REQ-099-020 共通原本構成・AG-013 最終合格確認の実行可能性回復）
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/（boundary detector・loadAndClassify・manifest projection entries）
      - docs/designs/integrity/distribution-boundary.md（「検査対象の除外領域」節・「## 配布物本文の記述規則」節）
      - 配布物本文内の相互参照パス（src/common 形式・配布レイアウト）
    intent: >-
      gate への除外領域規定適用・空経路の解明整備・汎用 checker 候補設計と採否判断の実施・
      backtick 運用の Design 追記（ACT-DESIGN-001）を実施する。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-006
    concern: integrity 規則メタデータ・検査器・検査データの整合是正
    responsibility: IR 規則の分類・検査・データの整合維持責務（IR-013/018/042/045/055/066・IR-069・IR-074・obsolete-path-map の機械照合体制）
    ownership_hints:
      - scripts/check_integrity.ts（checkVariantPathExistence・IR066_VOCAB_PATTERNS・results 統合）
      - docs/designs/integrity/rules/ 配下の IR 規則文書（frontmatter detection_method_class・implementation_path・verification_path）
      - scripts/check_integrity.test.ts（IR-045 fixture 参照残置）
      - obsolete-vocabulary-map.yaml・obsolete-path-map.yaml（対照登録と checker 同期条件）
      - IR-055 baseline JSON（正規化規則 repo-* / repo-local）
    intent: >-
      IR-013 は接続方向（machine-check 再分類）で確定・IR-018/042 に専用 fixture 試験を追加・
      IR-045/055/066/obsolete-path-map を整合させる。IR-074 機械照合との整合を常に維持する。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-007
    concern: IR-072 既知 NG 是正と frontmatter updated 運用規則の整備
    responsibility: IR-072 鮮度債務の是正運用と REQ-010 の運用規律所有責務（REQ-010-081 の運用判断枠の延長）
    ownership_hints:
      - docs/requirements/REQ-010.md（「## 要件」テーブル・REQ-010-081 現行行・REQ-010-085 追記先）
      - docs/designs/local/adf-simplification-deferred-records.md（frontmatter updated 2026-11-13 vs commit 2026-11-14）
      - docs/designs/integrity/integrity-contracts.md（「既知残存違反の統一選択基準」・baseline 登録 provenance）
      - scripts/check_integrity.ts（IR-072 検出）
    intent: >-
      実修復を基本とし baseline 登録は統一選択基準に従って分類する。
      REQ-010-085 新規行で updated 同時進行の運用規律を恒久所有させる。
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-008
    concern: IR-053 検出器の否定文文脈許容改善
    responsibility: IR-053 検出器の検出条件設計責務（正の検出器仕様を迂回しない改善方針・REQ-010-066 area-based 除外宣言方式との整合）
    ownership_hints:
      - scripts/check_integrity.ts（IR-053 検出器・gh pr view 直接記述検出）
      - src/common/skills/agentdev-workflow-case-close/scripts/README.md（7行・対象行・文言維持）
      - docs/designs/integrity/integrity-contracts.md（既知許容・検出器仕様）
    intent: >-
      否定文文脈許容条件を検出器に追加し、README 文言は維持する（req-define 確定）。
      ng-baseline / exemptions への仮登録は行わない。
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-009
    concern: v4-v5-crosswalk.md の draft 放置解消（triage (b)）
    responsibility: v4 現行要件行の v5 処遇を記録する棚卸し構造（crosswalk）の維持責務（REQ-108-012 の設計対応・REQ-111-013 covers 宣言）
    ownership_hints:
      - docs/designs/foundations/references/v4-v5-crosswalk.md（96行・status: draft・updated 2026-10-14）
      - docs/designs/foundations/ 配下の親 v5-adopted-conventions.md（2026-11-04「解決手順」節 L68-79）
      - docs/designs/README.md（193行・親行備考）
      - .agentdev/inspect/inbox/inspect-docs-finding-20261115T103843Z.md（R-1・S-2 defer 記録）
    intent: >-
      triage (b) として内容更新と updated 最新化を実施する。更新判断手順（波及検討・
      living tracking 併存整理）に従って範囲を確定し、R-1・S-2 を同時再評価する。
    verification_refs: [TS-009]
    source_items: [AG-009]
  - id: RA-010
    concern: worktree 運用規律の整備（所有者確認・個別指定削除・remove 前掃除・frozen-lockfile 前置）
    responsibility: worktree 構造上の運用規律と cleanup 系節の保持責務（実害・反復失敗の再発防止規律。REQ-118 後片付け責任の実現面）
    ownership_hints:
      - src/common/skills/agentdev-git-worktree/references/worktree-operations.md（cleanup 系節・1.5 remove 前退避ファイル掃除節・bun test 実行の環境前提節）
      - src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md（STEP-6-1 cleanup 参照行）
      - src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（--frozen-lockfile 配置候補・依存パッケージ前置節）
    intent: >-
      4規律の追記と依存整備物の掃除対象追加、frozen-lockfile 前置の明記（配置先は判断）を
      実施する。実害 Case（#4005・#4026 等）の学習由来であることを記録に残す。
    verification_refs: [TS-010]
    source_items: [AG-010]
  - id: RA-011
    concern: case-close 機械工程規律の整備（入力構成・freshness 順序・標本整合・手動回収手順）
    responsibility: case-close workflow skill 本文・references・scripts 標本の規律整備責務（機械工程 script 本体は PR #3982 で完結済み・対象外）
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/SKILL.md（完了判定の契約状態記録・未追跡残存検証節 L84-95 付近）
      - src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md（STEP-5・STEP-6-1）
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts（completeMachineAcceptanceRecord fixture）
      - src/common/skills/agentdev-workflow-case-close/scripts/README.md（reclamation 手動回収標準手順）
    intent: >-
      反復失敗（3-4 Case 実績）の学習由来規律を補記する。fixture 分割番号割当を QG-4 正規形に
      整合させ、reclamation の手動回収経路を標準手順として明記する。deleteFile 注入は機構整理候補として保持する。
    verification_refs: [TS-011]
    source_items: [AG-011]
  - id: RA-012
    concern: 正規文書の表層・参照・鮮度の軽微是正（6件）
    responsibility: 正規文書・配布物・REQ 本体の表層・参照・鮮度の機械的整合維持責務（docs-check pass 維持）
    ownership_hints:
      - src/opencode/plugins/agentdev-textlint-guard/（README・最終検査コマンド例・配布物側）
      - src/common/skills/agentdev-artifact-validation/scripts/README.md（59行）
      - src/common/skills/agentdev-workflow-req-define/references/req-define-detailed-gates.md（85行）
      - .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/（archive-builder.test.ts・boundary-pipeline.test.ts の BOM）
      - .opencode/skills/ 配下の skill-projection-manifest.yaml（AUTOGEN 再生成）
      - docs/requirements/REQ-119.md（35行）・docs/requirements/REQ-120.md（41行）
    intent: >-
      修正方向一意の 6 件を一括整理する。BOM は意図的固定でない確認のうえ除去、
      manifest は AUTOGEN 正規手順で再生成（正当性確認込み）する。
    verification_refs: [TS-012]
    source_items: [AG-012]
  - id: RA-013
    concern: prepare_definition_pr.ts 計測日収束 trigger の表記不一致修正
    responsibility: case-open STEP-4 機械工程の自動収束機構の保持責務（REQ-117 系機械工程堅牢化の実現面・単一 root cause bugfix）
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（hasMeasurementDrift・runMeasurementDateConvergence）
      - scripts/tests/prepare_definition_pr.test.ts または prepare-validate-input.test.ts（機械突合テスト追加先）
      - scripts/check_integrity.ts（実出力表記 index-generation-consistency の正本）
    intent: >-
      正規表現をケバブ表記に突合させ、checker 実出力文字列の捕捉テストを追加する。
      手動 contingency（8f4053eb4・bd215ec33）を不要にする構造修正である。
    verification_refs: [TS-013]
    source_items: [AG-013]
  - id: RA-014
    concern: ADR 受理形式の確定（導入不採用）と正規 lib ADR helper 走査仕様の再評価
    responsibility: 正規成果物モデル（ADR から Decision への移行・DEC-009）の維持と正規 lib frontmatter 走査の整理責務
    ownership_hints:
      - docs/decisions/DEC-009.md（「### 移行方針」節・確定記録追記先）
      - scripts/lib/frontmatter.ts または src/common/skills/agentdev-artifact-validation/scripts/lib/frontmatter.ts（adrNumberFromFilename・extractAdrNumber・4桁固定走査）
      - artifact-validation 系テスト（helper 廃止の追随修正先）
    intent: >-
      HITL relayed answer（選択肢 A）に従い ADR 導入不採用を DEC-009 へ確定記録し、
      死装備の ADR helper を利用箇所精査の上で廃止する。
    verification_refs: [TS-014]
    source_items: [AG-014]
  - id: RA-015
    concern: ガード編集意味論共通部の第3実装（Senpi edit-interpretation.ts）の収束
    responsibility: guard 編集意味論の共通化方針（1箇所で管理・固有条件のみ分離）の維持責務（REQ-099-013/014・PR 4043 Design 確定候補）
    ownership_hints:
      - src/senpi/plugins/agentdev-guard-connection/lib/edit-interpretation.ts（第3実装・収束対象）
      - src/common/guards/ 配下の lib/edit-semantics.ts（共通部・PR 4043 で切り出し済み）
      - src/senpi/plugins/agentdev-guard-connection/tests/guard-connection.test.ts（収束後の動作確認）
    intent: >-
      PR 4043 マージ済み前提（E4-1 修正完了の再確認込み）の下で共通部へ収束し、
      差異処理パターン（matchCount 消費・unknownLines malformed 化・@@ anchor 強制・replaceAll 無効型拒否）を適用する。
    verification_refs: [TS-015]
    source_items: [AG-015]
  - id: RA-016
    concern: promote 系 workflow skill 等の lifecycle 正本節との本文複製境界精査
    responsibility: workflow skill 本文の正本節参照構造（呼出条件・工程位置の記述に限定）の維持責務（B2-1・CR-001 集約方針の追随）
    ownership_hints:
      - src/common/skills/agentdev-workflow-intake-promote/SKILL.md・src/common/skills/agentdev-workflow-learning-promote/SKILL.md・src/common/skills/agentdev-workflow-inspect-promote/SKILL.md
      - src/common/skills/agentdev-doc-diagnostics/SKILL.md・src/common/skills/agentdev-workflow-inspect-docs/SKILL.md
      - src/common/skills/agentdev-workflow-lifecycle/SKILL.md（「共通報告・Decision・自律確定規約」節・正本）
      - inspect-skills 機械診断（意味的重複検出）
    intent: >-
      inspect-skills 機械診断で複製を検出し、検出分を正本への名レベル参照へ置換する。
      複製 0 件の場合は精査記録で完結する。
    verification_refs: [TS-016]
    source_items: [AG-016]
  - id: RA-017
    concern: 同名試験ファイル 2系統の残存評価
    responsibility: テスト収集範囲の整合（bun test 再帰収集の重複排除）と検証義務の保持責務（2026-10 src/common 正本化移行 #3325/#3326 の残存整理）
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/tests/check_integrity.test.ts（2026-10-02・18,160B）
      - scripts/check_integrity.test.ts（2026-11-13・251,068B）
      - scripts/self/release/package-release-archive.test.ts（2026-10-03・6,134B）
      - .opencode/skills/repo-agentdev-integrity/scripts/package-release-archive.test.ts（2026-11-13・35,094B）
    intent: >-
      固有検証義務・代替可否・両方実行の実否を確認し、評価完了後に削除・維持を判断する。
      削除を前提としない。
    verification_refs: [TS-017]
    source_items: [AG-017]
  - id: RA-018
    concern: senpi guard-connection 試験 1件不合格の通常配置追試と分類
    responsibility: guard-connection 検査の projectRoot 解釈・isApprovedTemporaryPath 判定順序の整合責務（実装と試験のどちらを正とするかの判断義務）
    ownership_hints:
      - src/senpi/plugins/agentdev-guard-connection/tests/guard-connection.test.ts（159行・当該試験）
      - src/senpi/plugins/agentdev-guard-connection/lib/ 配下の distribution-boundary-guard-paths.ts（isApprovedTemporaryPath）
    intent: >-
      通常配置で追試し、結果に応じて環境条件明記または正判断と修正を行う。
      評価用 worktree（e0f551be・Temp 配下）の不合格実測を起点とする。
    verification_refs: [TS-018]
    source_items: [AG-018]
  - id: RA-019
    concern: textlint-guard gate 本体の vendor 未生成 crash に対する fail-closed 案内経路の整合
    responsibility: textlint-guard plugin gate 本体の起動経路と fail-closed 停止・案内の整合責務（plugin README「導入時の依存生成手順」との整合）
    ownership_hints:
      - src/opencode/plugins/agentdev-textlint-guard/gate.ts（起動検査の追加先候補）
      - src/opencode/plugins/agentdev-textlint-guard/README.md（「導入時の依存生成手順」・参照先）
      - vendor/ 配下（依存成果物・未生成環境の再現に使用）
    intent: >-
      vendor 未生成時の起動検査（crash 前の fail-closed 停止と案内表示）の要否を判断し、
      必要なら実装する。fail-closed の意図された停止と crash の区別を明確にする。
    verification_refs: [TS-019]
    source_items: [AG-019]
  - id: RA-020
    concern: checker 実行ランタイム選択規律の Design 補強（vendored bundle → bun・依存 API 別対応表）
    responsibility: checker 実行契約 Design（checker-execution-contracts.md「安定実行経路」節）の規律所有責務（Case #3970・#3988 の実績知見の正規化）
    ownership_hints:
      - docs/designs/integrity/checker-execution-contracts.md（「## 安定実行経路」節 L183・既存 L229 規律行）
      - src/opencode/plugins/agentdev-textlint-guard/（vendored engine bundle textlint-engine.bundle.json 含有 checker ラッパ）
      - docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md（安定実行経路の詳細参照先）
    intent: >-
      vendored bundle → bun 規律と依存 API 別実行経路対応表を Design へ追記し、
      既存 L229 行と統合する。安定実行経路の標準（module import 経由）は維持する。
    verification_refs: [TS-020]
    source_items: [AG-020]
  - id: RA-021
    concern: case-open 円等検出の複数トークン・二段検証
    responsibility: Issue 検索の選択性指針と円等検出手順の整備責務（重複 Root Case・重複設計 PR 作成実害の再発防止・Case #3989/#3988 実績）
    ownership_hints:
      - src/common/skills/agentdev-issue-management/references/issue-operation-safety.md（「search トークンの選択性指針」節 L63-65 付近）
      - src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（STEP-2 節等の円等検出手順）
      - case-ready・case-revise・case-close の円等検出実施箇所（横展開検討対象）
    intent: >-
      二段検証（ヒット 0 件時の主題語 + REQ 番号再検索）を規律として追加し、
      case-open 円等検出手順に複数トークン検索を明記する。横展開は検討対象として記録する。
    verification_refs: [TS-021]
    source_items: [AG-021]
  - id: RA-022
    concern: yomiyasu lint 一時ファイル配置指示と書込み guard 境界の整合
    responsibility: lifecycle SKILL.md 文章品質・書込み規約節の配置指示と書込み guard 実効範囲の整合責務（guard fail-closed 維持を前提とした配置手順側の統一）
    ownership_hints:
      - src/common/skills/agentdev-workflow-lifecycle/SKILL.md（「文章品質・書込み規約」節 L158・L172-183）
      - src/common/skills/agentdev-artifact-validation/scripts/README.md または scripts/README.md（配置指針・workspace 外 temp 禁止・project root 内限定）
      - textlint 書込み guard（project root 外書込み fail-closed 拒否・解除・迂回は行わない）
    intent: >-
      配置指示を project root 内の gitignore 対象領域（.agentdev/tmp/ 等・検査後削除）へ統一し、
      4 方針（workspace 外 temp 禁止・project root 内限定・commit 対象外・検査後削除）に整合させる。
      guard の fail-closed は維持する。
    verification_refs: [TS-022]
    source_items: [AG-022]
review_dispositions:
  - id: RD-001
    source_ru: RU-0281
    source_item: ra002-followup-legacy-reference-cleanup
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0281 の冪等確認前置・adapter SKILL.md/AGENTS.md 文言現行化・sidecar 対応行削除・REQ-118 系 retired 判定・
      traceability check 確認が AG-001・RA-001・TS-001・OU-001 へ反映された。RA-002（#3970）CLOSED 実績を
      冪等確認の実績として記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0281.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0282
    source_item: integrity-suite-baseline-fail-triage-fixture-repair
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0282 の区分け先行・fixture 是正・vendor 依存是正・repo-state 依存是正判断・pin/T6 突合・
      check_extensions strict failure 実修復判断が AG-002・RA-002・TS-002・OU-003 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0282.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0283
    source_item: suite-execution-env-cdform-ci-runner
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0283 の cd-form 統一・依存復元前置明示・Windows CI runner 定期実整備が AG-003・RA-003・TS-003・OU-004 へ
      反映された。区分け結果（RU-0282）への依存を OU-004 depends_on に記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0283.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0284
    source_item: distribution-reference-link-resolution
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0284 の N-01/02/04/07 由来リンク・参照パス是正と確認前提判断（gh-tool README・履歴報告義務）が
      AG-004・RA-004・TS-004・OU-005 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0284.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0285
    source_item: distribution-boundary-gate-checker-backtick
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0285 の gate 除外領域適用・blob 分類空経路解明・汎用 checker 候補設計と採否判断・backtick 運用明文化が
      AG-005・RA-005・TS-005・OU-006・ACT-DESIGN-001 へ反映された。target_design 実パス（docs/designs/integrity/
      distribution-boundary.md・178行）を実在確認済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0285.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0286
    source_item: integrity-rule-metadata-checker-data-consistency
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0286 の IR-013/018/042/045/055/066・obsolete-path-map 整合が AG-006・RA-006・TS-006・OU-007 へ反映された。
      IR-013 の接続方向確定（req-define に委譲された判断）を記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0286.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0287
    source_item: ir072-known-ng-remediation-updated-rules
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0287 の IR-072 NG 是正・updated 運用規則整備が AG-007・RA-007・TS-007・OU-008・ACT-REQ-003（REQ-010-085
      新規行）へ反映された。Jev 既存REQ照合判断（APPEND・0.69）と最終判断一致。
    evidence:
      path: .agentdev/backlog/req-units/RU-0287.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0288
    source_item: ir053-negative-context-tolerance
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0288 の IR-053 検出器改善（RT-3 の3点検討対象）・ng-baseline 不使用・対象 README 文言判断が
      AG-008・RA-008・TS-008・OU-009 へ反映された。文言維持・検出器側許容の確定を記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0288.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0289
    source_item: crosswalk-draft-staleness-triage-b
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0289 の triage (b) 内容更新 + updated 最新化・R-1/S-2 同時再評価・joint triage 記録が
      AG-009・RA-009・TS-009・OU-010・ACT-DESIGN-002 へ反映された。重要変更の事前通知を実施済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0289.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0290
    source_item: worktree-operations-discipline-updates
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0290 の worktree-operations.md cleanup 系節への4規律追記・掃除対象追加・frozen-lockfile 前置が
      AG-010・RA-010・TS-010・OU-011 へ反映された。QG-4 側配置選択肢判断を含める。
    evidence:
      path: .agentdev/backlog/req-units/RU-0290.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0291
    source_item: case-close-mechanical-step-discipline
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0291 の case-close SKILL.md 補記・freshness 順序明記・verify-only 入力正規化・fixture 分割番号整合・
      reclamation 標準手順明記が AG-011・RA-011・TS-011・OU-012 へ反映された。機械工程 script 本体対象外の
      境界を記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0291.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0292
    source_item: canonical-doc-surface-reference-freshness-minor-fixes
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0292 の軽微是正6件が AG-012・RA-012・TS-012・OU-013 と ACT-REQ-001/002（REQ-119/120 仮記括弧句除去）へ
      反映された。Jev 既存REQ照合判断に対する semantic_disagreement（REQ update 確定）を Jev 先行評価の記録に残し、
      STEP-4 観測 20261115T122103Z-05b8 に差異を記録済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0292.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0293
    source_item: prepare-definition-pr-drift-trigger-mismatch
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0293 の hasMeasurementDrift 正規表現修正と機械突合テスト追加が AG-013・RA-013・TS-013・OU-002 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0293.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0294
    source_item: adr-acceptance-contract-direction
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0294 の ADR 受理形式契約の確定が HITL Q-RD-20261115-01 の relayed answer（選択肢 A・standing order による
      推奨 relay・provenance 記録済み）で確定し、ADR 導入不採用の DEC-009 確定記録追記（ACT-DEC-001）と
      正規 lib ADR helper 廃止が AG-014・RA-014・TS-014・OU-014 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0294.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-015
    source_ru: RU-0295
    source_item: guard-edit-semantics-third-impl-convergence
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0295 の Senpi edit-interpretation.ts の共通部収束と差異処理パターン適用が AG-015・RA-015・TS-015・OU-015 へ
      反映された。PR 4043 MERGED（2026-11-13）実績を前提確認として記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0295.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-016
    source_ru: RU-0296
    source_item: promote-workflow-lifecycle-canonical-duplication-audit
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0296 の promote 系 workflow skill 等の本文複製精査（inspect-skills 機械診断経由）と参照置換が
      AG-016・RA-016・TS-016・OU-016 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0296.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-017
    source_ru: RU-0297
    source_item: duplicate-test-file-pairs-assessment
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0297 の同名試験ファイル 2系統の評価と削除・維持判断（評価完了後に確定・削除前提としない）が
      AG-017・RA-017・TS-017・OU-017 へ反映された。判断は評価実施時に確定する義務として構成化。
    evidence:
      path: .agentdev/backlog/req-units/RU-0297.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-018
    source_ru: RU-0298
    source_item: guard-connection-test-fail-retrial-classification
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0298 の guard-connection 試験 1件の通常配置追試と分類（合格なら環境条件明記・不合格なら正判断と修正）が
      AG-018・RA-018・TS-018・OU-018 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0298.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-019
    source_ru: RU-0299
    source_item: textlint-guard-gate-vendor-crash-fail-closed
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0299 の gate 本体 vendor 未生成時起動検査の要否判断と実装が AG-019・RA-019・TS-019・OU-019 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0299.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-020
    source_ru: RU-0300
    source_item: checker-runtime-selection-vendored-bundle-design
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0300 の checker 実行ランタイム選択規律と依存 API 別対応表の Design 追記が AG-020・RA-020・TS-020・OU-020・
      ACT-DESIGN-003 へ反映された。target_design 実パス（docs/designs/integrity/checker-execution-contracts.md・338行）
      を実在確認済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0300.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-021
    source_ru: RU-0301
    source_item: case-open-idempotency-two-stage-search
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0301 の search トークン選択性指針への二段検証追加・case-open references への複数トークン明記・横展開検討が
      AG-021・RA-021・TS-021・OU-021 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0301.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-022
    source_ru: RU-0302
    source_item: yomiyasu-lint-temp-file-guard-alignment
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0302 の lifecycle SKILL.md 配置指示の project root 内 gitignore 対象領域への統一と 4 方針整合が
      AG-022・RA-022・TS-022・OU-022 へ反映された。書込み guard fail-closed 維持を明記。
    evidence:
      path: .agentdev/backlog/req-units/RU-0302.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
assembly_evidence: []
case_open_hints:
  epic_needed: true
  decomposition: >-
    RU 単位の 22 OU（OU-001〜OU-022・source_ru 1:1 対応）。必須依存は OU-004 → OU-003 の 1 件のみ
    （RU-0283 の整備判断が RU-0282 の区分け結果を入力として参照）。近接実行が望ましい機械的衝突グループが3組ある:
    {OU-008 RU-0287, OU-013 RU-0292}（IR-072 の frontmatter updated 進行を共有・REQ 本体更新と REQ-010 追記の
    近接）、{OU-006 RU-0285, OU-020 RU-0300}（docs/designs/integrity/ 同一領域の Design 追記）、
    {OU-007 RU-0286, OU-009 RU-0288}（scripts/check_integrity.ts 系 checker 本体修正の衝突可能性）。
    OU-001（RU-0281）は sidecar 削除後に traceability check を実行するため REQ 行変更を伴う他 OU との
    近接配置を推奨。OU-010（RU-0289）は R-1・S-2 の同時再評価を伴うため単独処理が望ましい。
    Artifact 保存操作（ACT-REQ-001〜003・ACT-DEC-001・ACT-DESIGN-001〜003）は Definition 保存内部責務
    （case-ready / case-revise）で実行される。
  wave_hints:
    - "{OU-003, OU-004} は区分け依存（OU-004 は OU-003 の区分け結果を参照）のため同一 Wave での順次実行または OU-003 先行 Wave 配置を推奨"
    - "{OU-008, OU-013} は IR-072 の frontmatter updated 進行を共有するため近接実行（同一実行単位での逐次処理または近接 Wave 配置）を推奨"
    - "{OU-006, OU-020} は docs/designs/integrity/ 同一領域の Design 追記のため近接実行を推奨"
    - "{OU-007, OU-009} は scripts/check_integrity.ts 系 checker 本体修正の衝突可能性があるため近接実行を推奨"
    - "その他の OU は技術的依存なし（相互独立）。Wave 構成の最終決定は case-open が行う"
```

## summary

本 draft は 2026-11-15 の backlog-auto 一式（20261115T191842JST・RU-0281〜RU-0302・22 件）を単一 Case バッチとして要件化したものである。22 件とも新規 REQ 採番を伴わない既存正規成果物・配布資産・検査体系の保守と整合是正であり、既存 REQ/Decision への APPEND/UPDATE 4 件（REQ-010 追記行・REQ-119/120 本文機械的修正・DEC-009 確定記録追記）、Design 操作 3 件（distribution-boundary.md 追記・v4-v5-crosswalk.md 更新・checker-execution-contracts.md 追記）、実現面変更 22 作業単位（OU-001〜OU-022）として構造化されている。変更方針は AG-001〜022・RA-001〜022・TS-001〜022・OU-001〜022 へ構造化されている。壁打ち HITL（Q-RD-20261115-01・RU-0294 ADR 方向性）は standing order による推奨 relay（選択肢 A）で確定し、provenance を本文書に記録した。Jev 先行評価 2 件（STEP-3 観測書込み warning あり・STEP-4 観測 20261115T122103Z-05b8）を実施済み。検討経緯の詳細は本文書の各記録節を参照。
