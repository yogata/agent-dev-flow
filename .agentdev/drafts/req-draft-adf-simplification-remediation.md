---
draft_type: req_draft
topic_slug: adf-simplification-remediation
status: draft
created_at: "2026-11-15T02:37:26+09:00"
source_rus: [RU-0272, RU-0273, RU-0274, RU-0275, RU-0276, RU-0277, RU-0278]
---

# 要件doc draft: ADF 全体簡素化調査是正バッチ（RU-0272〜RU-0278）

2026-11-14 の ADF 全体簡素化調査で特定し、利用者が 2026-11-15 に実装承認した是正・統廃合7件を一括して要件化する。いずれも REQ/Decision/Design の新規保存を伴わない既存正規成果物・配布資産の実現面変更であり、Definition 保存操作なし（direct_case 構成）で case-run へ引き継ぐ。

## 入力と区別

- 確定事実（機械実測付き）: 各 RU の対象・根拠・受け入れ条件。3複製の行数実測（127/101/70行）、command-creator SKILL.md 29行（正本 src/common と投影 .opencode に同一内容）、対象20ファイルの実在、docs/requirements 全域に command-creator 言及0件、`skill-projection-manifest.yaml` L40 の登録、`ng-baseline.json` L2511 の当該 SKILL.md pin、check_integrity.ts L12080 の annotateIrIds IR-020 名義（本 req-define 実行時および STEP-8 review で再確認）
- 利用者の判断（採用根拠）: 2026-11-14 ADF 全体簡素化調査の是正・簡素化候補として、利用者が 2026-11-15 に実装を承認（`agreement_confirmed_at: 2026-11-15T00:53:19+09:00`。RU-0272 は Issue #4052 起票済み）
- 監督者指示（本実行の入口）: RU-0272〜0278 の7件をすべて入力として扱う（内部バッチ分割可・関連RU統合可）。`agentdev_handoff: true` も本リポジトリは自己ホストのため通常入力として処理。既存草案2件（req-draft-caseready-cleanup-suppression.md、req-draft-correction-3887-verification.md）は本プールの対象外
- 境界外: 既存草案2件の編集、RU-0272 の Issue #4052 起票内容の再審、RU-0273 対象外の実装本体（lib/yaml）、RU-0274 の textlint 規則・しきい値変更、RU-0275 の system.md 外移設・検査ロジック本体・REQ 定義変更、RU-0276 の authoring 再構成・品質基準変更、RU-0277 の agentdev-adversarial-review 本体・共通契約 Design 節・docs/ 移設・配布経路変更、RU-0278 の IR-074/integrity-contracts.md 再構成・検出器の挙動変更・IR ID 採番、履歴領域（docs/reports/、.agentdev/）の旧参照是正、baseline 整理（C-06）そのもの

## 統合/分離判定（複数RU処理）

- 7件は同一トピック（簡素化調査是正）・同一承認由来だが、変更対象実現面が相互独立。いずれも Definition 保存操作（REQ/Decision/Design の新規保存・追記・更新）を伴わないため Definition 単位の統合対象は存在せず、実行単位（OU）は RU 単位の7件に分離し、監督者指示を踏まえ単一 draft・単一 Case バッチに束ねた
- 必須依存なし。機械的衝突が集中する近接実行グループ（{OU-002, OU-007}、{OU-003, OU-004}）は wave_hints に参考記録した

## Decision判断記録（STEP-5）

- 判断結果: Decision 不要（新規 Decision 0件）
- 適用基準: Decision 禁止ゲート（agentdev-decision-guidelines 経由）— 7件いずれも仕様変更のみ・文書是正・統廃合・参照整理を含み、技術的決定（方式選択・アーキテクチャ変更）を含まない。RU-0277 の所有境界は既存 Decision（REQ-014-003/014-011 の正規所有構造）を維持する方向で解決済み（CR-004）
- 根拠事実: 既存 Decision との重複確認済み（対論型レビューの共通契約所有は DEC-027 系の観測ループとも独立）。判定は Jev 適用対象外（STEP-5 適用不採用の維持）

## Jev 先行評価の記録

- 既存REQ照合判断（STEP-3）: 観測 `20261114T171700Z-aad7` — 全7RU「REQ操作なし」・追加確認不要（evaluator 確率 0.99〜1.0、最終判断一致・差異なし）
- 要件展開の最終分類・Design 分離（STEP-4）: 観測 `20261114T171758Z-67a9` — evaluator は RU-0273/0274/0277/0278 を「Design 保存」と主評価（0.52〜0.75）。最終判断は従来基準（Design 分離基準は要件行からの切り出しに適用され本バッチに要件行なし、docs_chore/maintenance は Definition 生成なしが典型、case 系の docs 編集規律、RU-0275/0277 の実装側判断への明示委譲により artifact_actions の content 全面確定は不能）により全7RU「実現面変更のみ」と確定。差異理由: semantic_disagreement（4件）として観測へ記録済み

## STEP-8 adversarial-review 実施記録

- 実施形態: 独立 Reviewer stream（Oracle、セッション ses_e24f3cccfffeCkpmIY7i5w5mVU）2パス（challenge・convergence audit）+ 呼出元 counter-challenge（主要事実の実装・実在を spot 検証）+ 収束判定
- 第1パス findings F1〜F9（essential 4・non-essential 5）: F1 draft 本文未引渡し（呼出元起因）、F2 廃止3点セット欠落、F3 死んだアンカー（REQ-002.md 関連行）と実在参照群、F4 共通契約の意味所有者（adversarial-review Design）との衝突、F5 分割②③件数重複、F6 是正対象2箇所の特定、F7 IR 削除手続（req-impact-map 再配置・L105 引用・IR-020 旧パス）、F8 近接実行グループ、F9 realization-only 根拠記録
- 第2パス（convergence audit）: F1〜F9 全件 resolved を確認。内容レベル審査（AG↔RU 忠実性・マーカー語スキャン0件・TS 3要素・auto_gate 正当・ID 形式）全観点 PASS。新規 F10（AG-008/TS-008 の See Also 検出対象外条項が RU 承認済み除外集合〔履歴・.agentdev のみ〕を無断拡張し TS-005 と内部矛盾）、F11（check_integrity.ts L12080 annotateIrIds の IR-020 名義が AG-007/TS-007 の対象外）、F12（RD 7件の誤字「ほ反映された」）、F13（wave_hints リスト形式）
- 収束: verdict は「NOT CONVERGED: F10（F10 文言修正 + F12 誤字修正で即座に収束・保存可能）」。呼出元は F10〜F13 全件を受理し、レビュアー提示の修正処方を適用した（F10: 限定文言へ差替、F11: AG-007/RA-007/TS-007 へ L12080 処置を追加、F12: 7件修正、F13: wave_hints リスト化）。適用済みをもって収束とする

## 重要変更の事前通知の実施記録

- 第1次（2026-11-15T02:37+09:00、ドラフト保存〔write 実行〕に先行）: 正規 Design 文書の廃止・統合（backticks-identifier-threshold.md、IR-023/IR-020、agentdev-command-creator スキルとその skill Design）、system.md 縮約、rule-ownership.md 是正、adversarial-review-integration.md 正本化を含む変更理由・変更内容・影響・確定事項と未確認事項の区別を本 req-define の実行出力として通知した

# draft-data

```yaml
work_type: maintenance
scale: large
summary: >-
  2026-11-14 の ADF 全体簡素化調査で特定し、利用者が 2026-11-15 に実装承認した是正・統廃合7件
  （RU-0272〜RU-0278）を一括して要件化する。（1）QG-4 系参照文書・委譲手順・試験 fixture の
  起動コマンド表記3箇所を受け入れ範囲 bun test ./src/ へ整合（Issue #4052 紐づけ）、
  （2）rule-ownership.md の所有記述是正と IR-004/018/027/034 の last_verified 更新、
  （3）backticks 識別子基準文書の document-type-responsibilities.md への統合・廃止、
  （4）system.md 索引的節群の統合・縮約、（5）agentdev-command-creator の
  agentdev-command-authoring への吸収・廃止（正本・投影・投影 manifest の3点セット）、
  （6）adversarial-review-integration.md の3複製に重複する共通実行手続の正本1本+参照化
  （共通契約の意味所有は adversarial-review Design が維持）、（7）IR-023/IR-020 の実所有者への
  移管と廃止。いずれも REQ/Decision/Design の新規保存を伴わない既存正規成果物・配布資産の
  実現面変更（成果物管理基盤自体の保守。意味契約の新設なし）であり、変更方針を
  realization_actions へ構造化して case-run へ渡す（Definition 保存操作なし、direct_case 構成）。
  影響ファイル数が10ファイル超の実装スコープシグナルにより scale は large。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      QG-4 参照文書・委譲手順・試験 fixture の起動コマンド表記の整合（RU-0272、調査 F-01、Issue #4052 紐づけ）。
      Issue #4026 で利用者が確定した受け入れ検証範囲 bun test ./src/ 全体へ、3箇所の旧表記
      bun test ./src/common/skills/ を同一変更で整合させる。対象は
      src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md の分割②起動コマンド例
      （330行付近）、src/common/skills/agentdev-workflow-case-run/references/delegation-and-result.md の
      同一コマンドブロック再掲（53行付近）、src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts
      の fixture 内 command 期待値（448行・676行）の3箇所。文書のみ修正すると fixture が旧表記を検証し続けるため
      3箇所を同一変更とする。退避ファイル名の採番様式（stdout-N.log・stderr-N.log の実行ごとの採番と
      stdout 側・stderr 側の対応判別形式）は既存様式に従う。分割②の対象が ./src/ 全体へ拡大されることに伴い、
      分割③（.opencode/plugins/ 系）との走査重複の可能性を件数突合（Ran N tests across M files）から
      判別可能な形で記録する。周辺記述（QG-4 本文の分割説明、再掲、fixture 期待値）に前後矛盾を残さない。
      QG-4 の分割構成そのものとその他の起動コマンド表記、close_mechanical_steps.ts 本体の要件、
      Issue #4052 の起票内容の再審は対象外。同一内容の重複 Issue を新規起票せず Issue #4052 を完了へ導く
      （bugfix/Direct 経路）。
  - id: AG-002
    content: >-
      規則文書群の所有記述と last_verified の陳腐化是正（RU-0273、調査 C-13/C-15）。
      docs/designs/integrity/rule-ownership.md の2箇所（配布境界行の「現行 checker は本 yaml を読まない」記述
      〔92行相当〕と同期条件行の同一主旨記述〔103行相当〕）を、loadDistributionTargets が
      data/distribution-targets.yaml を fail-closed で読み込み IR-046〜048 の検出に使用する実装と
      意味一致するよう是正する。docs/designs/integrity/rules/ の IR-004・IR-018・IR-027・IR-034 の
      last_verified を、#4039 での検証と 2026-11-14 調査での統合機械確認の根拠とともに更新する。
      検出実装本体（lib/distribution-boundary-rules.ts、distribution-targets.yaml）と上記4件以外の
      last_verified・規則文書内容は対象外。監督側ブランチ fix/integrity-rule-metadata-c13-c15 の差分は
      参照資料とし、PR #4053 は正規経路への引き継ぎ後に閉鎖する。
  - id: AG-003
    content: >-
      backticks 識別子基準文書の document-type-responsibilities.md への統合・廃止（RU-0274、調査 C-20）。
      docs/designs/integrity/backticks-identifier-threshold.md の実質内容（適用対象外条項〔frontmatter の
      name 値への backticks 禁止、PR #1334 再発防止〕、識別子/一般名詞分類、機械判定の考え方）を、
      自らが正本と宣言する docs/designs/responsibilities/document-type-responsibilities.md の
      識別子と散文普通名詞の区別節配下へ移設して廃止する。しきい値表を機械が消費する実体は存在しない
      （A-17 実測: 消費 .ts/.json 0件）。リポジトリ全域に存在しない mechanical-replacement-rules.md への
      相互参照宣言と、inspect-docs 検出処理が参照する等の機械消費を前提とする記述を撤去する。
      現行層の参照更新（docs/README.md、docs/designs/foundations/document-model.md、
      src/common/skills/agentdev-inspect-skills/SKILL.md と references/skill-frontmatter-name-backtick.md、
      src/common/skills/agentdev-skill-authoring/references/review-protocol.md）と索引
      （docs/designs/README.md・docs/README.md）再生成を伴う。適用対象外条項の内容自体は統合先で維持する。
      textlint 規則と検出しきい値の変更、履歴 report 内の旧パス言及は対象外。
  - id: AG-004
    content: >-
      system.md の索引的節群の統合・縮約（RU-0275、調査 C-18）。docs/designs/foundations/system.md 内の
      複数の索引・一覧節（コマンド一覧・Workflow Inventory 等）を同一パスのまま整理・統合し、維持負担を下げる。
      機械参照との整合は維持する: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts の
      checkExpandedReadmeSync（コマンド名の全文一致照合）と IR-042 の REQ 言及走査、
      baselines/ng-baseline.json の workflow-status-prohibition 項目、data/obsolete-path-map.yaml の該当2項目、
      関連試験7本（A-16 実測）。節の統合・縮約の設計判断（どの節をどう統合するか）は A-16 の影響範囲
      （検査1本・baseline1件・対照表2件・試験7本）に収まる範囲で実装側が決定する。カタログ対象の
      system.md 外への移設、check_integrity.ts の検査ロジック本体と baseline 項目の意味変更、REQ 定義の変更は
      対象外。
  - id: AG-005
    content: >-
      agentdev-command-creator の agentdev-command-authoring への吸収・廃止（RU-0276、調査 C-01、
      確度中・行単位包含確認を条件とする）。29行の簡易参照スキル agentdev-command-creator を、同領域を網羅する
      agentdev-command-authoring（3ファイル776行）へ吸収して廃止する。廃止は3点セットとして実施する:
      (1) 正本 src/common/skills/agentdev-command-creator/ の削除、(2) 投影 .opencode/skills/agentdev-command-creator/
      （.gitignore による生成物）の削除、(3) .opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml
      （40行相当の登録）からの除去。吸収前に creator の全行と authoring の対応を行単位で列挙し、authoring 側に
      存在しない固有行があれば authoring へ移す（列挙記録を残す）。削除に伴う現行層の参照更新:
      docs/designs/skills/agentdev-command-creator.md（skill Design 本体の廃止）、
      docs/designs/skills/agentdev-command-authoring.md（58行相当のリンク）、docs/designs/README.md
      （135行相当の索引行）、baselines/ng-baseline.json（src/common/skills/agentdev-command-creator/SKILL.md を
      pin する known-NG エントリ、2508〜2516行相当）の整理、repo-agentdev-integrity/references/vocabulary-registry.md
      の言及確認。必要な対照登録は retired-artifact-registry/obsolete-path-map の現行様式に従う。
      agentdev-command-authoring の既存内容の再構成、Command 定義品質基準の変更、整備用 integrity 検査
      （exemptions/baseline）の意味変更（参照置換のみ）は対象外。RU-0277 と同型の変更だが同時実行は必須でない。
  - id: AG-006
    content: >-
      adversarial-review-integration.md の3複製の整理（RU-0277、調査 C-11、確度高・md5 不一致機械確認済み）。
      共通契約（caller integration 契約）の意味は、既存どおり adversarial-review Design
      （docs/designs/skills/agentdev-adversarial-review.md「adversarial-review caller integration 共通契約」節、
      REQ-014-003/014-011）が正規所有者として所有したまま変更しない。本変更は、3スキルに複製され内容が乖離した
      参照ファイル（agentdev-case-run-execution-adapter 版127行、agentdev-workflow-case-open 版101行、
      agentdev-workflow-req-define 版70行）間で重複している共通の実行手続のみを正本1本へ集約し、
      他2箇所を正本への参照に置き換える（スキル固有の節は各スキル側に残す）。統合前に3版の差分
      （共通部分・各スキル固有部分）を列挙し、差分行の行き先を記録する。正本とするファイルの最終判断は
      実装側の差分列挙に基づく（RU は最長の case-run-execution-adapter 版を候補として示す）。
      対論型レビュー審議プロトコル（agentdev-adversarial-review 本体）の変更、adversarial-review Design の
      共通契約節の変更、正本の docs/ への移設、配布経路の変更は対象外。変更適用後、req-define（STEP-8）を
      含む3スキルの消費経路から正本への参照が解決できることを確認する。
  - id: AG-007
    content: >-
      IR-023/IR-020 規則文書の実所有者への移管と廃止（RU-0278、調査 C-05）。実体を他の規則・文書が所有する
      整合性規則文書2件を移管して廃止する。IR-023（基盤 drift 検出、prose-only、回帰試験名
      prevention_gates.test.ts は不存在の死んだ参照。実際の drift 抑制は IR-074 checkIrRuleClassification
      （2026-11-13 検証）が担う）は docs/designs/integrity/rules/IR-074-ir-rule-classification-traceability.md へ
      統合する。IR-020（baseline 既知/新規の区別、独立の機械検出なし。wired は IR-055 と共用名義。baseline 運用は
      docs/designs/integrity/integrity-contracts.md が契約として正規所有）は integrity-contracts.md へ統合する。
      廃止前に各条項の行き先（統合先の節）を記録する。廃止に伴う参照更新: 規則カタログ・索引
      （rule-ownership.md AUTOGEN ブロックは物理削除で自動除外）、交叉参照の req-impact-map.md
      Retired cross-references 節への再配置（rule-ownership.md 20行相当の削除手続に従う）、rule-ownership.md の
      IR-023 を現行陳腐化検出機構として引用する記述（105行相当）の更新、check_integrity.ts の annotateIrIds に
      おける IR-020 名義（12080行相当。コメント「baseline-known 判別は IR-020 実装」を含む）の整理
      （削除済み IR ID による検出結果ラベルの残存解消。検出器の挙動は不変とし、RU 対象外の検出器実装変更では
      なく参照整理として扱う）、当該 IR ID を引用する文書と baseline/exemptions の対応付け。IR-020 本文の旧
      baseline パス記述（.agentdev/integrity/baseline.json は現行では不存在）は移管先へ持ち込まない。IR-074 と
      integrity-contracts.md の既存内容の再構成（移管分の追記のみ）、検出器の実装変更（IR-055 共用名義
      checkRuntimeUnresolvedReference はそのまま）、IR ID の採番変更は対象外。検出名義と baseline の対応は
      baseline 整理（C-06）と順序関係があり得るため、baseline 対応付けの維持を優先し、整理が必要な場合は
      判断を記録する。
  - id: AG-008
    content: >-
      横断整合条件（バッチ全体）。7変更の適用後、check_integrity 系検査全体、受け入れ検証範囲
      bun test ./src/ 全体、textlint 関連の配布側試験が不合格なく完了すること。RU-0273 と RU-0278 は
      docs/designs/integrity/ の同一領域（rule-ownership.md、規則カタログ・索引）を編集し、RU-0274 と
      RU-0275 は同一の README 索引 AUTOGEN ブロック（docs/README.md・docs/designs/README.md）を再生成対象と
      するため、双方の適用が競合なく成立すること。参照残存検索の網羅範囲は修正対象列挙と一致させる。
      検索の対象外は docs/reports/（履歴記録領域）と .agentdev/（作業記録領域）の旧参照に限定し、
      廃止・統合後も実在し続ける参照ファイル（参照化後の各スキル references/adversarial-review-integration.md）
      への消費者リンクは旧参照に含めない扱いを明示する（See Also 行を一律対象外とする除外は設けない）。
conflict_resolutions:
  - id: CR-001
    conflict: 7 RU の統合/分離（同一トピック・同一承認由来だが変更対象実現面が相互独立）
    resolution: >-
      いずれの RU も Definition 保存操作（REQ/Decision/Design の新規保存・追記・更新）を伴わないため
      Definition 単位の統合対象は存在しない。実行単位は RU 単位の7 OU に分離し、監督者指示
      （内部バッチ分割可・関連RU統合可）を踏まえ単一 draft・単一 Case バッチに束ねる。
      RU-0276 と RU-0277 は同型変更だが同時実行必須でないため統合しない。
  - id: CR-002
    conflict: 入力 RU 7件が agentdev_handoff: true を持つ（本来は前工程引き継ぎ用 RU 入力として整理する経路）
    resolution: >-
      本リポジトリは AgentDevFlow 自己ホストであり、変更対象（配布 skill・docs・Design）は本プロジェクト自身の
      正規成果物・実現面である。監督者指示により通常入力として処理し、出力に agentdev_handoff を含めない。
  - id: CR-003
    conflict: docs/designs/** 配下の正規 Design 文書への是正・統合を Definition 保存操作（artifact_actions）として扱うか、実現面変更（realization_actions）として扱うか
    resolution: >-
      本バッチは既存正規成果物の是正的維持（記述是正・メタデータ更新・統合・廃止・参照化）であり、
      新規の Design 定義の保存を伴わない（成果物管理基盤自体の保守であり、意味契約の新設なし）。
      利用者の承認が確定させているのは変更方針（移管先・統合先・受け入れ条件）であり、統合後の最終本文の
      組立は RU-0275 等が実装側判断に明示的に委譲している範囲である。よって artifact_actions は空とし、
      変更方針を realization_actions へ構造化する（実現面変更方針の構造化ハンドオフ契約）。
      この扱いにより後続経路は設計PRなし（direct_case）となる。
  - id: CR-004
    conflict: RU-0277 の「共通契約部分を正本1本へ統合」する方向と、既存の正規所有構造（共通 caller integration 契約の意味所有者は adversarial-review Design、REQ-014-003/014-011）の関係
    resolution: >-
      共通契約の意味は adversarial-review Design が所有したまま変更しない。統合対象は参照ファイル間で重複する
      共通の実行手続の記述のみとし、正本となった参照ファイルが共通契約の意味所有者へ昇格しない文言構成を取る
      （正本ファイルは Design を補完する実行手続きの正本であり、Design と矛盾する場合は Design を正とする
      既存関係を維持する）。正本ファイルの選定は実装側の差分列挙に基づく判断である。
artifact_actions: []
operation_units:
  - ou_id: OU-001
    source_ru: RU-0272
    description: |
      QG-4 系起動コマンド表記3箇所の整合と Issue #4052 の完了（AG-001、RA-001）。
      bugfix/Direct 経路で Issue #4052 に紐づけて実行する
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    verification_refs: [TS-001]
  - ou_id: OU-002
    source_ru: RU-0273
    description: |
      rule-ownership.md 所有記述是正（2箇所）と IR-004/018/027/034 の last_verified 更新、
      PR #4053 の引き継ぎ閉鎖（AG-002、RA-002）
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    verification_refs: [TS-002]
  - ou_id: OU-003
    source_ru: RU-0274
    description: |
      backticks 識別子基準文書の document-type-responsibilities.md への統合・廃止と
      参照更新・索引再生成（AG-003、RA-003）
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    verification_refs: [TS-003]
  - ou_id: OU-004
    source_ru: RU-0275
    description: |
      system.md 索引的節群の統合・縮約と機械参照整合の維持（AG-004、RA-004）
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    verification_refs: [TS-004]
  - ou_id: OU-005
    source_ru: RU-0276
    description: |
      agentdev-command-creator の agentdev-command-authoring への吸収・廃止（正本・投影・
      投影 manifest の3点セット）と Design 文書・索引・baseline・対照登録の更新（AG-005、RA-005）
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    verification_refs: [TS-005]
  - ou_id: OU-006
    source_ru: RU-0277
    description: |
      adversarial-review-integration.md の3複製に重複する共通実行手続の正本1本+参照化
      （共通契約の意味所有は adversarial-review Design が維持）（AG-006、RA-006）
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    verification_refs: [TS-006]
  - ou_id: OU-007
    source_ru: RU-0278
    description: |
      IR-023/IR-020 の実所有者への移管・廃止と参照・交叉参照再配置・annotateIrIds 整理・
      baseline 対応付けの整合（AG-007、RA-007）
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    verification_refs: [TS-007]
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      3箇所（qg-4-final-acceptance.md 330行付近の分割②起動コマンド例、delegation-and-result.md 53行付近の再掲、
      close_mechanical_steps.test.ts 448行・676行の fixture 期待値）が bun test ./src/ 表記へ更新されたことを
      機械検索（grep）で確認する。旧表記 bun test ./src/common/skills/ が3ファイルとその周辺記述に残存しないことを
      確認する（履歴 report・引用行は対象外）。退避ファイル名の採番様式（stdout-N.log・stderr-N.log の実行ごとの
      採番と stdout 側・stderr 側の対応判別形式）が既存実例（同一コマンドブロックの他分割の退避指定）と同一様式で
      あることを照合する。分割②の対象拡大に伴い、分割ごとの件数実測（Ran N tests across M files）と
      分割③（.opencode/plugins/ 系）との走査重複の有無を識別して記録する。check_integrity 系検査と
      close_mechanical_steps 関連試験（bun test ./src/common/skills/agentdev-workflow-case-close/）を実行する。
      Issue #4052 が重複起票なしで完了へ導かれたことは case-close の完了判定で確認する。
    pass_criteria: |
      3箇所とも新表記へ更新され、周辺記述（QG-4 本文の分割説明、再掲、fixture 期待値）に前後矛盾がない。
      退避ファイル名の様式が既存と一致する。分割②③の件数実測と重複識別が記録されている。check_integrity 系が
      不合格なく、close_mechanical_steps 関連試験が合格する。旧表記の現行層残存が0件（対象外領域・行を除く）。
    on_failure: |
      fix-and-reverify。表記・fixture の不整合は実装修正で解消し再検証する（文書と fixture の同期が本変更の
      中核のため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      rule-ownership.md の2箇所（配布境界行〔92行相当〕と同期条件行〔103行相当〕）の是正後記述が、
      .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-rules.ts の
      loadDistributionTargets の実装（yaml の fail-closed 読込と検出使用）と意味一致することを実装の実読と
      突合して確認する。IR-004/018/027/034 の last_verified が検証根拠（#4039 の検証、2026-11-14 調査の
      統合機械確認）とともに更新されていることを確認する。check_design_frontmatter・check_autogen_freshness・
      check_integrity 系を実行する。PR #4053 が正規経路への引き継ぎ後に閉鎖されたことを確認する。
    pass_criteria: |
      2箇所の記述と実装の意味一致、4件の last_verified 更新と根拠記載、検査3系の不合格なし、
      PR #4053 の閉鎖。
    on_failure: |
      fix-and-reverify。記述是正の不備は実装修正で解消し再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      統合先（document-type-responsibilities.md の識別子と散文普通名詞の区別節配下）に適用対象外条項
      （frontmatter の name 値への backticks 禁止、PR #1334 再発防止）が存在することを grep で確認する。
      mechanical-replacement-rules.md への言及が統合後の文書群に残らないことを rg で確認する
      （docs/reports/・.agentdev/ は履歴・作業記録領域として対象外）。現行層5ファイル（docs/README.md、
      document-model.md、agentdev-inspect-skills の SKILL.md と skill-frontmatter-name-backtick.md、
      agentdev-skill-authoring の review-protocol.md）と索引（docs/designs/README.md・docs/README.md）に
      backticks-identifier-threshold への旧パス・旧ファイル名参照が残らないことを確認する。
      check_design_frontmatter・索引再生成・check_integrity 系・配布側試験（textlint 関連を含む）を実行する。
    pass_criteria: |
      適用対象外条項が統合先に存在し、機械消費前提記述が撤去済みで、現行層の旧参照残存が0件（対象外領域を除く）。
      検査群が不合格なく完了する。
    on_failure: |
      fix-and-reverify。統合漏れ・参照残存は実装修正で解消し再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      統合後の system.md に対し、check_integrity.ts の checkExpandedReadmeSync（コマンド名の全文一致照合）と
      IR-042 の REQ 言及走査が合格することを確認する。ng-baseline.json の workflow-status-prohibition 項目と
      data/obsolete-path-map.yaml の該当2項目との対応付けが維持されるか、意図的な更新として記録されることを
      確認する。check_integrity 系の関連試験7本を実行する。節アンカーを参照する外部消費者が存在しないこと
      （A-16 実測: 0件）を踏まえ、リンク検査が合格することを確認する。
    pass_criteria: |
      検査・走査が合格し、baseline 対応付けの整合（維持または意図的更新の記録）が確認でき、関連試験7本が
      不合格なく、リンク検査が合格する。
    on_failure: |
      fix-and-reverify。機械参照との不整合は実装修正で解消し再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      吸収前に creator SKILL.md（29行）の全行と authoring（3ファイル）の対応を行単位で列挙した記録が存在し、
      authoring 側に存在しない固有行が移行済みであることを確認する。廃止が3点セット（src/common 正本・
      .opencode 投影・skill-projection-manifest.yaml 登録）として完了し、投影再生成で復活しないことを確認する。
      削除後、現行層に agentdev-command-creator への参照が残らないことを rg で確認する（docs/reports/・
      .agentdev/ の履歴記録は対象外。docs/designs/skills/agentdev-command-creator.md の廃止、
      agentdev-command-authoring.md のリンク更新、docs/designs/README.md 索引行の除去、ng-baseline.json の
      当該 known-NG エントリの整理、vocabulary-registry.md の言及処置を含む）。check_integrity 系
      （規則カタログ・索引・リンク・retired 系）を実行し、retired-artifact-registry/obsolete-path-map への
      対照登録が現行様式に従うことを確認する。
    pass_criteria: |
      行単位の列挙記録が存在し包含が確認できる。3点セットの廃止が完了し投影再生成で復活しない。現行層の
      参照残存が0件（対象外領域を除く）。対照登録が現行様式に従い、check_integrity 系が不合格なく完了する。
    on_failure: |
      fix-and-reverify。包含未確認の行は authoring へ移行し、廃止3点セットの漏れは補完して再確認する。
  - id: TS-006
    target_item: AG-006
    verification: |
      3版（127/101/70行）の差分列挙（共通部分・各スキル固有部分の区分）の記録が存在し、固有部分の行き先が
      保存されていることを確認する。統合後、共通実行手続の内容を持つファイルが正本1本であり、
      workflow-case-open 版と workflow-req-define 版が正本への参照であることを確認する。正本の所在が差分列挙記録と
      整合していることを確認する。正本ファイルが共通契約（caller integration 契約）の意味所有者として
      adversarial-review Design に言及し、Design と矛盾する場合は Design を正とする既存関係を維持する文言を
      持つことを確認する。配布側試験と check_integrity 系を実行する。変更適用後、req-define（STEP-8）を含む
      3スキルの消費経路から正本への参照が解決できることを確認する。
    pass_criteria: |
      差分列挙記録が完備し、正本1本+参照2箇所の構成となり、Design 所有境界の文言が維持され、配布側試験・
      check_integrity 系が不合格なく完了する。
    on_failure: |
      fix-and-reverify。参照化の不備・所有境界文言の欠落は実装修正で解消し再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      廃止前に IR-023/IR-020 の各条項の行き先（IR-074・integrity-contracts.md の統合先の節）が記録されている
      ことを確認する。削除後、docs/ 全体、repository top-level traceability/ 配下 sidecar、
      .agentdev/extensions/skills/*.yaml の ADF-COVERS 宣言を網羅する検索で、廃止2 ID（IR-023・IR-020）への
      未整理参照が残らないことを確認する（docs/reports/ は履歴記録領域として対象外）。交叉参照が
      req-impact-map.md の Retired cross-references 節へ再配置されていること、rule-ownership.md の IR-023 に
      よる現行機構引用記述が更新されていることを確認する。check_integrity.ts の annotateIrIds から IR-020 名義
      （12080行相当。コメントを含む）が整理され、検出挙動が不変であることを確認する。IR-074 と
      integrity-contracts.md の移管追記分が IR-020 本文の旧 baseline パス記述
      （.agentdev/integrity/baseline.json）を含まないことを確認する。check_integrity 系（規則カタログ整合・索引・
      リンク・annotateIrIds 系）と ng-baseline 対応付けを確認する。
    pass_criteria: |
      条項行き先の記録が存在し、未整理参照残存が0件（対象外領域を除く）、交叉参照の再配置と引用記述の更新と
      annotateIrIds の IR-020 名義整理が完了し、移管分に旧パス記述が含まれない。check_integrity 系と
      ng-baseline 対応付けが不合格なく完了する。
    on_failure: |
      fix-and-reverify。移管漏れ・参照残存・旧パス持ち込みは実装修正で解消し再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      全7変更の適用完了後、check_integrity 系検査全体と bun test ./src/ を受け入れ検証範囲どおり実行し、
      textlint 関連の配布側試験を含む不合格がないことを確認する。RU-0273 と RU-0278 の編集が
      docs/designs/integrity/ 同一領域で、RU-0274 と RU-0275 の編集が同一 README 索引 AUTOGEN ブロックで、
      それぞれ競合なく適用済みであることを確認する。各検索系検証の網羅範囲と修正対象列挙の一致を確認する
      （検索対象外は docs/reports/・.agentdev/ の履歴領域と、廃止・統合後も実在し続ける参照ファイル
      〔参照化後の各スキル references/adversarial-review-integration.md〕への消費者リンク〔旧参照ではない〕に
      限定する扱いの明示。See Also 行を一律対象外とする除外は設けない）。
    pass_criteria: |
      全検査・全試験の不合格なし。同一領域・同一 AUTOGEN ブロックへの編集の競合解消が確認できる。
    on_failure: |
      fix-and-reverify。横断的な相互作用由来の不合格は原因となった変更単位を特定して修正し再検証する。
realization_actions:
  - id: RA-001
    concern: QG-4 系起動コマンド表記の受け入れ範囲への整合
    responsibility: 配布 skill 参照文書2件と case-close 試験 fixture の表記保持責務
    ownership_hints:
      - src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（330行付近・分割②の起動コマンド例と3分割表 320-331行）
      - src/common/skills/agentdev-workflow-case-run/references/delegation-and-result.md（53行付近・同一コマンドブロックの再掲）
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts（448行・676行・fixture 内 command 期待値）
      - Issue #4052（追跡Case。対象・根拠・受け入れ条件の正規所有者）
      - Epic #4026 の利用者コメント 6854467536 第5項・6857637376（起点コミット eecb5b033 は参照資料）
    intent: >-
      3箇所を同一変更で bun test ./src/ へ更新する。退避ファイル名の採番様式は既存様式に従う。
      分割②と分割③の件数実測と走査重複の識別を記録する。周辺記述の前後矛盾を残さない。
      close_mechanical_steps.ts 本体の要件と QG-4 の分割構成は変更しない。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: 整合性規則の所有記述是正と last_verified 更新
    responsibility: integrity 規則文書群の記述・メタデータ保持責務
    ownership_hints:
      - docs/designs/integrity/rule-ownership.md（所有対照の正本。配布境界行92行相当・同期条件行103行相当の2箇所）
      - docs/designs/integrity/rules/IR-004-req-index-actual-consistency.md
      - docs/designs/integrity/rules/IR-018-req-range-notation-freshness.md
      - docs/designs/integrity/rules/IR-027-retired-adr-current-authority-citation.md
      - docs/designs/integrity/rules/IR-034-skill-internal-section-step-reference-detection.md
      - .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-rules.ts（loadDistributionTargets・参照専用）
      - .opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml（参照専用）
      - ブランチ fix/integrity-rule-metadata-c13-c15 と PR #4053（参照資料・引き継ぎ後に閉鎖）
    intent: >-
      2箇所の「現行 checker は本 yaml を読まない」系記述を loadDistributionTargets の実装と意味一致するよう
      是正する。IR-004/018/027/034 の last_verified を検証根拠とともに更新する。実装本体（lib/yaml）と
      上記4件以外の規則文書は変更しない。PR #4053 は正規経路への引き継ぎ後に閉鎖する。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: backticks 識別子基準文書の document-type-responsibilities.md への統合・廃止
    responsibility: 文書種別責務の正本（document-type-responsibilities.md）への統合責務と旧文書の廃止
    ownership_hints:
      - docs/designs/integrity/backticks-identifier-threshold.md（統合元）
      - docs/designs/responsibilities/document-type-responsibilities.md（識別子と散文普通名詞の区別節・統合先正本）
      - docs/README.md、docs/designs/foundations/document-model.md（参照更新）
      - src/common/skills/agentdev-inspect-skills/SKILL.md と references/skill-frontmatter-name-backtick.md（参照更新）
      - src/common/skills/agentdev-skill-authoring/references/review-protocol.md（参照更新）
      - docs/designs/README.md・docs/README.md（索引再生成）
    intent: >-
      適用対象外条項・識別子/一般名詞分類・機械判定の考え方を統合先へ移設し、mechanical-replacement-rules.md
      への相互参照宣言と機械消費前提記述を撤去し、現行層5ファイルの参照を更新し、旧文書を削除して索引を
      再生成する。適用対象外条項の内容自体は統合先で維持する。textlint 規則と検出しきい値は変更しない。
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: system.md 索引的節群の統合・縮約
    responsibility: foundations システム仕様文書の構造保持責務
    ownership_hints:
      - docs/designs/foundations/system.md（対象文書）
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（checkExpandedReadmeSync 845-901行相当・IR-042 走査 4898-4935行相当・参照専用）
      - .opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json
      - .opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml
      - 関連試験7本（check_integrity 系）
    intent: >-
      索引的節（コマンド一覧・Workflow Inventory 等）を同一パスで統合・縮約する。節構成の設計判断は
      A-16 の影響範囲（検査1本・baseline1件・対照表2件・試験7本）に収まる範囲で実装側が決定する。
      検査ロジック本体と baseline 項目の意味、REQ 定義は変更しない。カタログ対象の system.md 外への移設は行わない。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: agentdev-command-creator の agentdev-command-authoring への吸収・廃止（正本・投影・投影 manifest の3点セット）
    responsibility: 配布スキルの配置規則・frontmatter 説明の保持責務（command-authoring 側）
    ownership_hints:
      - src/common/skills/agentdev-command-creator/SKILL.md（正本・29行・吸収対象）
      - .opencode/skills/agentdev-command-creator/（投影・.gitignore 生成物・削除対象）
      - .opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml（40行相当の登録・除去対象）
      - .opencode/skills/agentdev-command-authoring/（吸収先・3ファイル776行）
      - docs/designs/skills/agentdev-command-creator.md（skill Design 本体・廃止）
      - docs/designs/skills/agentdev-command-authoring.md（58行相当のリンク・参照更新）
      - docs/designs/README.md（135行相当の索引行・除去）
      - .opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json（src/common/skills/agentdev-command-creator/SKILL.md を pin する known-NG エントリ 2508-2516行相当・整理対象）
      - .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md（言及確認）
      - retired-artifact-registry/obsolete-path-map（対照登録は現行様式に従う）
    intent: >-
      creator の全行と authoring の対応を行単位で列挙し（記録を残す）、authoring 側に存在しない固有行を
      authoring へ移したうえで、廃止を3点セット（src/common 正本の削除・.opencode 投影の削除・
      skill-projection-manifest.yaml からの除去）として実施する。Design 本体の廃止、authoring Design の
      リンク更新、designs/README 索引行の除去、ng-baseline 既知エントリの整理、vocabulary-registry の言及処置、
      retired-artifact-registry/obsolete-path-map への対照登録を行う。command-authoring の既存内容の再構成と
      品質基準の変更、検査（exemptions/baseline）の意味変更は行わない（参照置換のみ）。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-006
    concern: adversarial-review-integration.md の3複製に重複する共通実行手続の正本1本+参照化
    responsibility: 配布 skill references の実行手続き保持責務（正本候補: agentdev-case-run-execution-adapter 版）
    ownership_hints:
      - src/common/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md（127行・正本候補）
      - src/common/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md（101行版・参照化）
      - src/common/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md（70行版・参照化）
      - docs/designs/skills/agentdev-adversarial-review.md（「adversarial-review caller integration 共通契約」節・共通契約の意味所有者・参照専用）
    intent: >-
      3版の差分（共通部分・各スキル固有部分）を列挙し、重複する共通実行手続を正本1本へ集約して他2箇所を
      正本への参照に置き換える（スキル固有の節は各スキル側に残す。差分行の行き先を記録する）。正本ファイルは
      Design を補完する実行手続きの正本であり、Design と矛盾する場合は Design を正とする既存関係を維持する
      文言を持たせる。共通契約の意味所有は adversarial-review Design が維持する（正本ファイルへ昇格しない）。
      agentdev-adversarial-review 本体、adversarial-review Design の共通契約節、正本の配置場所（docs/ 移設）、
      配布経路は変更しない。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-007
    concern: IR-023/IR-020 規則文書の実所有者への移管と廃止
    responsibility: 整合性規則の所有対照整合責務（IR-074・integrity-contracts.md・rule-ownership.md）
    ownership_hints:
      - docs/designs/integrity/rules/IR-023-integrity-artifact-validator-drift.md（IR-074 へ移管して廃止）
      - docs/designs/integrity/rules/IR-020-baseline-known-vs-new-finding.md（integrity-contracts.md へ移管して廃止）
      - docs/designs/integrity/rules/IR-074-ir-rule-classification-traceability.md（IR-023 の統合先）
      - docs/designs/integrity/integrity-contracts.md（IR-020 の統合先）
      - docs/designs/integrity/rule-ownership.md（所有対照の更新・AUTOGEN ブロックは自動除外・IR-023 引用記述105行相当の更新）
      - docs/designs/responsibilities/req-impact-map.md（Retired cross-references 節への交叉参照再配置・rule-ownership.md 20行相当の削除手続）
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（annotateIrIds の IR-020 名義 12080行相当・参照整理。検出挙動は不変）
      - 規則カタログ・索引、当該 IR ID を引用する文書、baseline/exemptions の対応付け
    intent: >-
      廃止前に各条項の行き先（統合先の節）を記録し、移管分の追記のみを行い（既存内容の再構成はしない。
      IR-020 本文の旧 baseline パス記述は移管先へ持ち込まない）、2文書を削除し、規則カタログ・索引・
      引用文書・交叉参照の req-impact-map.md Retired cross-references 節への再配置・check_integrity.ts の
      annotateIrIds における IR-020 名義の整理（検出挙動不変の参照整理）・baseline/exemptions 対応付けを
      更新する。検出器の実装（IR-055 共用名義 checkRuntimeUnresolvedReference）と IR ID 採番は変更しない。
      baseline 対応付けの維持を優先し、baseline 整理（C-06）との順序関係で整理が必要な場合は判断を記録する。
    verification_refs: [TS-007]
    source_items: [AG-007]
review_dispositions:
  - id: RD-001
    source_ru: RU-0272
    source_item: qg4-bun-test-scope-notation-f01
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0272 の目的・対象3箇所・対象外・受け入れ条件が AG-001・RA-001・TS-001・OU-001 へ反映された。
      review で追加特定された分割②③件数重複の識別記録を含む。
    evidence:
      path: .agentdev/backlog/req-units/RU-0272.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0273
    source_item: rule-doc-ownership-yaml-and-last-verified-staleness
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0273 の目的（C-13/C-15）・対象・対象外・受け入れ条件が AG-002・RA-002・TS-002・OU-002 へ反映された。
      是正対象が2箇所（92行相当・103行相当）である旨を明示した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0273.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0274
    source_item: backticks-threshold-doc-consolidation
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0274 の目的（C-20）・統合対象・対象外・受け入れ条件が AG-003・RA-003・TS-003・OU-003 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0274.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0275
    source_item: system-md-index-section-consolidation
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0275 の目的（C-18）・対象・機械参照整合・対象外・受け入れ条件が AG-004・RA-004・TS-004・OU-004 へ反映された。
    evidence:
      path: .agentdev/backlog/req-units/RU-0275.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0276
    source_item: command-creator-absorption-into-authoring
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0276 の目的（C-01）・吸収前提確認・参照更新・対象外・受け入れ条件が AG-005・RA-005・TS-005・OU-005 へ
      反映された。review により廃止の3点セット（正本・投影・投影 manifest）と実在参照群への置換を反映した
      （RU の REQ-002.md 関連行アンカーは実在しないため不採用）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0276.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0277
    source_item: adversarial-review-integration-single-source
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0277 の目的（C-11）・正本確定手順・参照化・対象外・受け入れ条件が AG-006・RA-006・TS-006・OU-006 へ
      反映された。review により共通契約の意味所有は adversarial-review Design が維持する旨の再スコープを反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0277.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0278
    source_item: ir-023-ir-020-rule-doc-migration
    disposition: covered
    reason_code: integrated_in_draft
    reason: |
      RU-0278 の目的（C-05）・移管先・参照更新・対象外・受け入れ条件が AG-007・RA-007・TS-007・OU-007 へ反映された。
      review により交叉参照の req-impact-map.md 再配置・IR-020 旧パス持ち込み禁止・annotateIrIds の IR-020 名義
      整理を追加反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0278.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
assembly_evidence: []
case_open_hints:
  epic_needed: true
  decomposition: >-
    RU 単位の7 OU。全 OU に必須依存は存在しない。近接実行が望ましい機械的衝突グループが2組ある:
    {OU-002 RU-0273, OU-007 RU-0278}（docs/designs/integrity/ 同一領域と rule-ownership.md AUTOGEN 再生成）と
    {OU-003 RU-0274, OU-004 RU-0275}（docs/README.md・docs/designs/README.md の同一索引 AUTOGEN 再生成）。
    RU-0272（OU-001）は既存追跡Case Issue #4052 に紐づけて実行し、重複起票しない。
    TS-008（横断整合）はバッチ完了時の最終確認に使用する。
  wave_hints:
    - "{OU-002, OU-007} は docs/designs/integrity/ 同一領域と rule-ownership.md AUTOGEN 再生成で機械的衝突が集中するため近接実行（同一実行単位での逐次処理または近接Wave配置）を推奨"
    - "{OU-003, OU-004} は docs/README.md・docs/designs/README.md の同一索引 AUTOGEN 再生成で機械的衝突が集中するため近接実行を推奨"
    - "技術的依存に基づく Wave 境界は存在しない（全 OU 相互独立）。Wave 構成の最終決定は case-open が行う"
```

## summary

本 draft は 2026-11-14 の ADF 全体簡素化調査由来の是正・統廃合7件（RU-0272〜0278、利用者承認済み 2026-11-15）を単一 Case バッチとして要件化したものである。7件とも REQ/Decision/Design の新規保存を伴わない実現面変更（direct_case 構成）であり、変更方針は AG-001〜008 の合意項目、RA-001〜007 の実現面変更方針、TS-001〜008 の検証戦略、OU-001〜007 の実行単位へ構造化されている。STEP-8 対論型レビュー（独立 Reviewer 2パス + counter-challenge + 収束監査、findings F1〜F13 全件反映済み）と Jev 先行評価（観測2件）を経て確定した。検討経緯の詳細は本文書の各記録節を参照。
