---
draft_type: req_draft
topic_slug: ir044-req-spec-boundary-fix
status: saved
created_at: 2026-06-28T12:00:00+09:00
source_rus:
  - RU-0011
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: docs_chore

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: null

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  IR-044（REQ/SPEC 境界違反検出）の WARNING 11件を true positive（SPEC 詳細混入）と false positive（META 規則行、または意味判断対象で inspect-docs 委譲）に分類し、個別に是正する。true positive は該当 SPEC、ルールカタログ、command reference、skill reference のいずれかへ SPEC 詳細を切り出し、REQ 側は外部契約・状態要件の要約へ置換する（REQ-0108-259 triage_action、REQ-0145-001 準拠）。false positive は META 規則行として機械免除可能か（検出パターンの拡張）、意味判断対象として inspect-docs 委譲が妥当かを確定し、IR-044 SPEC ファイルへ反映する。11件の個別分類結果、行番号、REQ-ID は実装詳細として test_strategy.verification と SPEC 本文で扱い、要件行、agreed_items には混入させない。本件は既存 REQ（REQ-0108-259、REQ-0144-017、REQ-0145-001/012）の履行が主軸であり、新規 REQ 行の追加や既存 REQ 行の修正を伴わないため work_type を docs_chore とする。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  # auto_ready が false の場合、または未解決 item が残る場合、後続コマンドは停止する
  auto_ready: true
  unresolved_questions: []      # 未解決質問が残る場合は停止理由として列挙
  unresolved_conflicts: []      # 未解決衝突が残る場合は停止理由として列挙
  out_of_repo_operations: []    # repo 外操作が必要な場合は停止理由として列挙
  stop_reasons: []              # その他の停止理由

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
# 必要十分な長文として保持し、項目数を増やして短い値を多数並べない
agreed_items:
  - id: AG-001
    content: |
      IR-044 が WARNING として報告した 11件（対象 REQ-ID、行番号等の個別情報は実装詳細として test_strategy.verification に列挙し、本項には混入させない）を true positive（SPEC 詳細の混入）と false positive（META 規則行、または意味判断対象で inspect-docs 委譲）に分類し、分類結果に沿って個別に是正する。true positive に分類した件は SPEC 詳細を該当 SPEC、ルールカタログ、command reference、skill reference のいずれかへ切り出し、REQ 側は外部契約・状態要件の要約へ置換する（REQ-0108-259 triage_action、REQ-0145-001 準拠）。false positive に分類した件は、検出パターンの拡張により META 規則行として機械免除できるか、意味判断を要するため inspect-docs へ委譲するかを確定し、IR-044 SPEC ファイルの exemption 記述へ反映する（REQ-0108-259、REQ-0145-002/012 準拠）。個別件の切り出し先 SPEC、command reference、skill reference の特定は実装修復作業（case-run）で行い、本 draft では方向性のみを示す。REQ-0144-009（RU-0011 で判断保留とされた件）を含め、11件全てについて分類を確定し、未確定件を残さない。
  - id: AG-002
    content: |
      IR-044 SPEC ファイル（docs/specs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md）の exemption 条件セクション、true positive 保護リスト、是正済み経緯欄を是正済み実情に一致させる（REQ-0144-017 準拠）。true positive として是正した件は「是正済み経緯（保護対象から除外）」欄へ追記し、SPEC 詳細を残留させない旨を明記することで、当該件を根拠としたテスト設計の前提崩壊を防ぐ。false positive として exemption 取扱を確定した件は、META 規則行 exemption 表または inspect-docs 委譲表の該当箇所へ反映し、機械判定根拠または委譲先を明示する。保護対象の真陽性は件数・内容を規定する SPEC 詳細の残留実例に限定し続ける。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
# 1 action = 1 artifact × 1 editing concern（REQ-ID 単位でも箇条書き1行単位でもない）
# 同一関心の複数 agreed items は単一 action に複数段落の content としてまとめる
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md
    target_area: IR-044 exemption 条件
    source_items: [AG-001, AG-002]
    content: |
      ## IR-044 exemption 条件 セクション（update）

      IR-044 SPEC ファイルの当該セクション配下（META 規則行 exemption 表、inspect-docs 委譲 表、true positive 保護、是正済み経緯欄）を是正済み実情に一致させる。

      ### META 規則行 exemption 表（拡張）

      false positive として分類した件のうち、検出パターン拡張により META 規則行として機械免除可能と確定したものを、既存の判定基準表（「REQ-NNNN-MMM 形式 + SPEC 種別列挙を名指しする責務範囲規定行」）へ反映する。個別 REQ-ID をホワイトリストとして列挙せず、行構造パターンを拡張し、件数・内容規定を含む行は引き続き免除しない（REQ-0145-012）。

      ### inspect-docs 委譲 表（拡張）

      false positive として分類した件のうち、意味判断を要するため inspect-docs へ委譲すると確定したものを、既存の文脈免除表（isNegationContext、isDelegationContext、isMetaScopeRuleContext、isBehaviorPredicateContext、IR044_STABLE_CONTRACT_PATTERN）に追記、または既存区分の適用例として明記する。docs-check 側での機械免除は行わない（REQ-0108-259/262、REQ-0145-002 準拠）。

      ### true positive 保護・是正済み経緯（追記）

      true positive として分類し SPEC 詳細を切り出した件を「是正済み経緯（保護対象から除外）」欄へ追記する。対象 REQ-ID、切り出し先 SPEC、command reference または skill reference の区別、是正根拠 PR 番号を記録する。これにより、当該件を真陽性保護の根拠とした回帰テスト設計の前提崩壊を防ぐ（REQ-0144-017 準拠）。保護対象として残す真陽性は、件数・内容を規定する SPEC 詳細の残留実例のみとする。

      個別 REQ-ID、切り出し先ファイルパス、行番号等の実装詳細は case-run で特定し、本 draft では方針のみを規定する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
# 記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しない
conflict_resolutions:
  - id: CR-001
    conflict: 11件の個別分類結果、対象 REQ-ID、行番号、切り出し先ファイルパスを要件行、agreed_items、artifact_actions.content のいずれに記述すべきか。RU-0011 は11件の個別分類まで指示しているが、要件行や agreed_items へ個別 REQ-ID を列挙すると G03（実装詳細の排除）と要件行記述基準（REQ-0102）に違反する。
    resolution: 11件の個別分類結果、対象 REQ-ID、行番号、切り出し先ファイルパスは実装詳細として test_strategy.verification と SPEC 本文で扱い、要件行、agreed_items、artifact_actions.content には抽象化した方針のみを記述する。根拠は G03、要件行記述基準（agentdev-req-file-manager「REQ 要件行の記述基準」）、RU-0011 の明示（「11件の個別分類は実装詳細」）。後続コマンドは本件についてユーザーへ再確認しない。

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    target_spec: docs/specs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素（verification / pass_criteria / on_failure）を必須とする
# on_failure（不合格時の処置）を持たない検証項目は test_strategy に含めないこと（REQ-0102-075）
# 項目識別子: TS-NNN 形式（NNNは3桁ゼロ埋め連番）
# on_failure アクション種別: fix-and-reverify（実装を修正して再検証）/ record-in-findings（Findings に out-of-scope として記録）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      RU-0011 に列挙された 11件（REQ-0101-055、REQ-0101-067、REQ-0101-068、REQ-0108-001、REQ-0108-258、REQ-0114-099、REQ-0140-028、REQ-0144-009、REQ-0144-016、REQ-0145-001、REQ-0145-012）について、各件を true positive（SPEC 詳細混入）または false positive（META 規則行、または意味判断対象で inspect-docs 委譲）に分類する。分類根拠を各件ごとに記録する。true positive 件は該当 SPEC、ルールカタログ、command reference、skill reference のいずれかに SPEC 詳細が切り出され、REQ 側が外部契約・状態要件の要約へ置換されたことを各 REQ ファイルと切り出し先ファイルで確認する。false positive 件は検出パターン拡張による機械免除か inspect-docs 委譲のいずれかに確定し、IR-044 SPEC ファイルの該当表へ反映されたことを確認する。11件以外の新規検出が発生した場合は本件の対象外とし、別 RU として扱う。
    pass_criteria: |
      11件全てについて true positive または false positive の分類が確定し、未確定件が残存しないこと。true positive 件の切り出し先 SPEC、ルールカタログ、command reference または skill reference に SPEC 詳細が移行済みであり、元の REQ 要件行が SPEC 詳細を含まない外部契約・状態要件の要約へ置換されていること。false positive 件の exemption 取扱（検出パターン拡張による機械免除、または inspect-docs 委譲）が IR-044 SPEC ファイルの該当表に明記されていること。
    on_failure: |
      分類ミスや取扱未確定件があれば fix-and-reverify とする。当該件を再分類し、SPEC、REQ、IR-044 SPEC ファイルを再更新した後に再検証する。11件の範囲を超える新規検出は本件の対象外のため record-in-findings とし、Findings に out-of-scope 件として記録した上で別 RU 化を案内する。選択理由: 11件は RU-0011 で範囲が確定しており、範囲内の不合格は実装修復で解決可能だが、範囲外は別件として扱う必要があるため。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md の ## IR-044 exemption 条件 セクション配下を確認する。true positive として是正した件が「是正済み経緯（保護対象から除外）」欄へ追記され、切り出し先 SPEC、command reference または skill reference の区別、是正根拠が明記されていることを確認する。false positive として exemption 取扱を確定した件が META 規則行 exemption 表または inspect-docs 委譲表の該当箇所へ反映されていることを確認する。true positive 保護の記述が、件数・内容を規定する SPEC 詳細の残留実例のみに限定されていることを確認する。scripts/check_integrity.test.ts の IR-044 正規スイート（REQ-9001〜REQ-9009）が、更新後の exemption 境界で真陽性保護と false positive 抑制をともに満たすことを確認する（REQ-0108-259/055 準拠）。
    pass_criteria: |
      IR-044 SPEC ファイルの exemption 条件セクションが是正済み実情を反映していること。是正済み true positive 件が保護対象から除外され、是正済み経緯欄に明記されていること。未是正の true positive 件が保護対象に残っていないこと。false positive 件の exemption 取扱根拠が SPEC 本文に明記されていること。IR-044 正規スイートの回帰テストが全件合格すること。
    on_failure: |
      fix-and-reverify とする。IR-044 SPEC ファイルの記述漏れ、テスト不合格があれば、SPEC 本文またはテスト fixture を修正した後に再検証する。選択理由: SPEC とテストの不一致は本件の範囲内で完結する実装修復可能な不合格であり、別件への切り出しを要しないため。

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []

# spec_artifacts_consumed: spec-save が artifact: spec entry を消費済み（OU-001, ACT-SPEC-001）
spec_artifacts_consumed: true
```

# summary

RU-0011 は IR-044（REQ/SPEC 境界違反検出）の WARNING 11件を true positive / false positive に分類し、個別是正することを合意した要件ドラフトである。true positive は SPEC 詳細を SPEC、ルールカタログ、command reference、skill reference のいずれかへ切り出し、REQ 側は外部契約・状態要件の要約へ置換する。false positive は META 規則行として機械免除可能か、inspect-docs 委譲が妥当かを確定し、IR-044 SPEC ファイルへ反映する。

本件は既存 REQ（REQ-0108-259、REQ-0144-017、REQ-0145-001/012）が既に規定する方針の履行が主軸であり、新規 REQ 行の追加や既存 REQ 行の修正を伴わない。このため work_type を docs_chore とし、REQ ファイルを作成せずに case-open へ進む。artifact_actions は IR-044 SPEC ファイルの exemption 条件セクション更新1件に集約し、11件の個別分類結果、対象 REQ-ID、行番号、切り出し先ファイルパスは実装詳細として test_strategy.verification と SPEC 本文で扱い、要件行、agreed_items、artifact_actions.content には混入させない（G03、要件行記述基準、RU-0011 明示）。

ADR は不要である。アーキテクチャ変更、複数システム影響、長期間有効な決定、取り返しのつかない変更のいずれにも該当せず、単一 SPEC ファイルの既存セクション更新にとどまるため（agentdev-req-analysis「ADR閾値判定ブリッジ」準拠）。
