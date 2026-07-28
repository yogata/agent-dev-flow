---
draft_type: req_draft
topic_slug: case-auto-handoff-and-phase0
status: saved
created_at: 2026-07-28
source_rus:
  - RU-0012
  - RU-0013
agentdev_handoff: true
---

# draft-data

```yaml
work_type: bugfix

summary: |
  case-auto の引き継ぎ標識（agentdev_handoff: true）の扱いと Phase 0（req-save + spec-save）の完全性・原子性について、
  RU-0012 と RU-0013 を入力として要件定義した。RU-0012 の要求4項目は全て REQ-005-018〜022、REQ-006-086 および
  agentdev-workflow-lifecycle skill、case-auto SPEC Step 7-1 で充足済みであり、新規REQ要件は追加しない。
  RU-0013 の要求6項目のうち4項目（SPEC 所有事項の case-run 先送り禁止、決定的 script 失敗時の LLM 代替禁止、
  warn と pass/fail の区別、accepted SPEC 間矛盾の commit 禁止）は REQ-008-030/032/033、QG-1 SPEC、spec-save SPEC で
  充足済みまたは implementation レベルの適合修正で対応する。残り2項目（未確定プレースホルダーの auto_ready 抑止、
  定義適用完了と OU 完了の区別報告）を REQ-008-059、REQ-006-110 として新規 APPEND する。
  REQ-006 の SPLIT（行数シグナル +2）は別課題とし、本ドラフトでは先行しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0012 の要求4項目（self-hosting で停止せず provenance 保持、consumer で停止して引き継ぎ報告、
      case-auto/open/run で同一 repository-kind 判定ロジック、誤停止の停止条件(11)分類）は、全て既有件・既SPEC・既 skill で
      充足済みである。新規REQ要件は追加しない。ただし implementation で case-auto/open/run が共通の repository-kind 判定導線
      （agentdev-workflow-lifecycle skill）を経由していることを検証し、差分があれば契約適合 bugfix として扱う。
  - id: AG-002
    content: |
      RU-0013 の要求6項目のうち次の4項目は既有件・既SPECで充足済みとして REQ 追加対象から除外する。
      (a) SPEC 所有事項の case-run 工程への先送り禁止 → REQ-008-030、REQ-008-032、REQ-008-033 および QG-1 SPEC で充足。
      (b) 決定的 script 失敗時の LLM 推論代替禁止 → spec-save SPEC の search-target-area.ts 未検出時 skip + follow-up 手続きで充足。
          implementation で spec-save command が本 SPEC へ適合していることを検証する。
      (c) accepted SPEC 間矛盾の commit 禁止 → spec-save SPEC の accepted SPEC 責任分界矛盾検出時の保存停止手続きで充足。
          implementation で spec-save command が本 SPEC へ適合していることを検証する。
      (d) warn を完了と集計しない（pass/warn/fail 区別の保持）→ case-auto SPEC Step 4 output_contract で pass/warn/fail 保持は
          定義済み。ただし warn 時の完了判定基準（必須 action skipped/failed 時の扱い）は未規定であり、AG-003 の REQ-006-110 で明文化する。
  - id: AG-003
    content: |
      RU-0013 の残り2項目をREQ追加対象とする。
      (1) 未確定プレースホルダーを含む draft の auto_ready:true 抑止 → REQ-008-059 として REQ-008 へ APPEND する（ACT-REQ-008-059）。
          REQ-008-034 は auto_ready:false を要求するが、未確定プレースホルダーの具体例と決定的マーカー検査が未規定であり、具体化する。
      (2) 各工程結果・artifact_action 適用結果・定義適用工程完了状態・OU ライフサイクル完了状態の区別集約報告
          → REQ-006-110 として REQ-006 へ APPEND する（ACT-REQ-006-110）。
          warn を pass 変換して集約しないこと、Phase 0 成功（artifact_actions 適用完了）と OU 完了（Issue/PR/Case 完了）の区別を含む。
  - id: AG-004
    content: |
      REQ-006 の SPLIT（行数シグナル +2、肥大化）は別課題として扱い、本要件定義では先行しない。
      SPLIT を先行させると今回の不具合是正が大規模 REQ 再編へ拡大するため、本ドラフトでは REQ-006-110 の1件 APPEND のみ実施する。
      REQ-006 SPLIT の要否は case-close 後または別途のメンテナンス課題として扱う。

artifact_actions:
  - id: ACT-REQ-008-059
    artifact: req
    operation: append
    target: docs/req/REQ-008.md
    source_items: [AG-003]
    content: |
      ### REQ-008-059: 未確定内容の auto_ready 抑止

      req-define は、後続工程で決定する必要がある未確定事項、必須内容の欠落、暫定プレースホルダーが agreed_items または
      artifact_actions に残る場合、auto_gate.auto_ready を true にしないこと。

      判定は決定的マーカー検査（"TBD"、"TODO"、"未定"、"後続工程で確定"、"case-run で確定" 等の代表 fixture）と
      QG-1 の意味判定（必須フィールド欠落、曖昧要件、測定不能条件）を組み合わせる。禁止事項や過去事例として当該文字列を
      引用した文を誤検知しないこと。停止時に該当 AG-ID または ACT-ID と理由を auto_gate.stop_reasons へ記録すること。
  - id: ACT-REQ-006-110
    artifact: req
    operation: append
    target: docs/req/REQ-006.md
    source_items: [AG-003]
    content: |
      ### REQ-006-110: case-auto の結果状態区別報告

      case-auto は、次の4状態を区別して集約・報告すること。

      1. 各工程の実行結果（pass / warn / fail）
      2. 各 artifact_action の適用結果（applied / skipped / failed / no-op）
      3. 定義適用工程の完了状態（req-save/spec-save の成否）
      4. OU ライフサイクルの完了状態（Issue 作成 / PR 作成 / PR マージ / Issue クローズ）

      warn であっても全必須 action が applied または正当な no-op なら「警告付き工程完了」とできる。必須 action に skipped または
      failed が1件以上ある場合は「定義適用完了」と報告しないこと。warn を pass へ変換して集約しないこと。
      定義適用工程が成功していても OU ライフサイクルが完了していなければ OU 完了と報告しないこと。Phase 0 成功（artifact_actions
      適用完了）と OU 完了（Issue/PR/Case 完了）は別々に報告すること。

conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-006 は行数シグナル +2（肥大化、SPLIT 強く推奨）であり、RU-0013 の REQ-006-110 APPEND 実施前に
      REQ-006 SPLIT を先行すべきか。
    resolution: |
      REQ-006 SPLIT は別課題とし、本要件定義では先行しない。SPLIT を先行させると今回の不具合是正が大規模 REQ 再編へ拡大し、
      bugfix の迅速な解決を阻害するため。REQ-006-110 の1件 APPEND のみ実施し、SPLIT 要否は case-close 後または別途の
      メンテナンス課題として扱う（ユーザー承認、2026-07-28）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0013
    target_req: REQ-008
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0013
    target_req: REQ-006
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: |
      REQ-008-059（未確定内容の auto_ready 抑止）の検証。

      (1) req-define へ入力する draft の artifact_actions.content に "TBD"、"TODO"、"未定"、"後続工程で確定"、"case-run で確定"
          のいずれかを含む代表 fixture を与え、auto_gate.auto_ready が false になることを確認する。
      (2) 上記文字列を禁止事項や過去事例として引用した文（例: "TBD を残さないこと"）では auto_ready が true のままであること、
          すなわち誤検知しないことを確認する。
      (3) 停止時に該当 AG-ID または ACT-ID と理由が auto_gate.stop_reasons へ記録されることを確認する。
      (4) QG-1 の意味判定（必須フィールド欠落、曖昧要件、測定不能条件）でも auto_ready が false になることを確認する。
    pass_criteria: |
      - 代表 fixture 5種（TBD/TODO/未定/後続工程で確定/case-run で確定）で全て auto_ready=false になること。
      - 引用 fixture（"TBD を残さないこと" 等）では auto_ready=true を維持し誤検知しないこと。
      - stop_reasons に該当 ID と理由が記録されること。
      - QG-1 意味判定の必須フィールド欠落 fixture で auto_ready=false になること。
    on_failure: |
      fix-and-reverify。auto_ready が true になる場合、決定的マーカー検査または意味判定ロジックの不備であり、
      実装を修正して再検証する。
  - id: TS-002
    target_item: AG-003
    verification: |
      REQ-006-110（case-auto の結果状態区別報告）の検証。

      (1) case-auto の工程結果モデルとして、command 結果の pass/warn/fail と artifact_action の applied/skipped/failed/no-op を
          保持する fixture を与える。
      (2) warn かつ全必須 action が applied または正当な no-op の場合、「警告付き工程完了」と報告されることを確認する。
      (3) 必須 action に skipped または failed が1件以上ある場合、「定義適用完了」と報告されないことを確認する。
      (4) warn を pass へ変換して集約していないことを確認する。
      (5) req-save/spec-save が成功していても case-open 未実行時点では OU 完了扱いしないことを確認する。
      (6) Phase 0 成功（artifact_actions 適用完了）と OU 完了（Issue/PR/Case 完了）が別々に報告されることを確認する。
    pass_criteria: |
      - pass/warn/fail および applied/skipped/failed/no-op が保持されること。
      - warn かつ全必須 action applied/no-op で「警告付き工程完了」になること。
      - 必須 action skipped/failed 時に「定義適用完了」を報告しないこと。
      - warn から pass への変換集約がないこと。
      - Phase 0 成功だけでは OU 完了を報告しないこと。
      - Phase 0 成功と OU 完了が別々に報告されること。
    on_failure: |
      fix-and-reverify。結果状態の区別または集約ロジックの不備であり、実装を修正して再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0012
    source_item: ru0012-req-1
    disposition: covered
    reason_code: already_satisfied
    reason: |
      agent-dev-flow 本体リポジトリでは AgentDevFlow 本体が現在プロジェクトの成果物であり、agentdev_handoff: true を停止条件と
      せず provenance として扱い通常 req/case workflow 入力として処理する。REQ-005-018 および REQ-005-022 で既充足。
    evidence:
      path: docs/req/REQ-005.md
      section: REQ-005-018, REQ-005-022
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0012
    source_item: ru0012-req-2
    disposition: covered
    reason_code: already_satisfied
    reason: |
      consumer リポジトリで agentdev_handoff: true を検出した場合は停止し、agent-dev-flow repo への手動取り込み対象として報告する。
      REQ-005-021 で既充足。
    evidence:
      path: docs/req/REQ-005.md
      section: REQ-005-021
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0012
    source_item: ru0012-req-3
    disposition: covered
    reason_code: verify_only
    reason: |
      case-auto/open/run での repository-kind 判定ロジックの統一は、現在 case-open と case-run が agentdev-workflow-lifecycle skill へ
      委譲している導線で充足する。新規REQ要件ではなく、implementation で次の3点を検証する。
      (a) case-auto の要件doc入力経路が case-open の判定を経由するか。
      (b) Issue 直接入力経路とインライン case-run が case-run の判定を省略しないか。
      (c) repository-kind 判定を各 command が独自実装していないか。
      差分があれば契約適合 bugfix として扱う。
    evidence:
      path: src/opencode/skills/agentdev-workflow-lifecycle/
      section: repository kind 判定
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0012
    source_item: ru0012-req-4
    disposition: covered
    reason_code: already_satisfied
    reason: |
      誤停止の分類（停止条件(11) command 契約・実装不整合）は、REQ-006-086 の停止理由分類要求と case-auto SPEC Step 7-1 の
      「command 契約・実装不整合」分類で充足済み。
    evidence:
      path: docs/req/REQ-006.md
      section: REQ-006-086
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0013
    source_item: ru0013-req-1
    disposition: partially_covered
    reason_code: partial_gap
    reason: |
      未確定プレースホルダーを含む draft の auto_ready:true 抑止は、REQ-008-034 で auto_ready:false 要求自体は既充足。
      ただし未確定プレースホルダーの具体例と決定的マーカー検査（TBD/TODO/未定/後続工程で確定 等）が未規定であり、
      REQ-008-059 として新規 APPEND し具体化する（ACT-REQ-008-059）。
    evidence:
      path: docs/req/REQ-008.md
      section: REQ-008-034
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0013
    source_item: ru0013-req-2
    disposition: covered
    reason_code: already_satisfied
    reason: |
      SPEC 所有事項の case-run 工程への先送り禁止は、REQ-008-030（SPEC action の content 完全確定）、REQ-008-032
      （SPEC update の target_area 必須）、REQ-008-033（変更後セクション全文保持）および QG-1 SPEC（曖昧要件・測定不能条件・
      必須フィールド欠落の fail 扱い）で既充足。
    evidence:
      path: docs/req/REQ-008.md
      section: REQ-008-030, REQ-008-032, REQ-008-033
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0013
    source_item: ru0013-req-3
    disposition: covered
    reason_code: verify_only
    reason: |
      決定的 script 失敗時の LLM 推論代替禁止は、spec-save SPEC の search-target-area.ts 未検出時 skip + follow-up 手続きで充足。
      implementation で spec-save command が本 SPEC へ適合していることを検証し、LLM 推論による代替位置への追記・置換を行わないことを確認する。
    evidence:
      path: docs/specs/workflows/spec-save.md
      section: target_area 未検出時の取り扱い
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0013
    source_item: ru0013-req-4
    disposition: partially_covered
    reason_code: partial_gap
    reason: |
      warn と pass/fail の区別保持は case-auto SPEC Step 4 output_contract で既定義。ただし warn 時の完了判定基準
      （必須 action skipped/failed 時の扱い、warn を pass 変換して集約しないこと）が未規定。REQ-006-110 として新規 APPEND し明文化する
      （ACT-REQ-006-110）。
    evidence:
      path: src/opencode/commands/agentdev/case-auto.md
      section: Step 4 output_contract
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0013
    source_item: ru0013-req-5
    disposition: covered
    reason_code: verify_only
    reason: |
      accepted SPEC 間矛盾の commit 禁止は、spec-save SPEC の accepted SPEC 責任分界矛盾検出時の保存停止手続きで充足。
      implementation で spec-save command が本 SPEC へ適合していること、矛盾検出時に commit/push が実行されないことを検証する。
    evidence:
      path: docs/specs/workflows/spec-save.md
      section: accepted SPEC 間矛盾検出
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0013
    source_item: ru0013-req-6
    disposition: partially_covered
    reason_code: partial_gap
    reason: |
      Phase 0 成功（artifact_actions 適用完了）と OU 完了（Issue/PR/Case 完了）の区別報告は、REQ-006-085 の「完了済み/進行中/未実行の
      各委譲単位と再開コマンド」報告で部分的に充足。ただし定義適用完了と OU ライフサイクル完了の区別モデルが未規定。
      REQ-006-110 に統合して新規 APPEND する（ACT-REQ-006-110）。
    evidence:
      path: docs/req/REQ-006.md
      section: REQ-006-085
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    3 Issue へ分解する。3 Issue は依存関係なし、並列実行可能。

    - Issue A (RU-0012 verify): REQ 変更なし。case-auto/open/run の repository-kind 判定導線検証と契約適合 bugfix。
      agentdev-workflow-lifecycle skill の判定導線を3 command が経由しているかを検証し、差分があれば command/SPEC を修正する。
    - Issue B (OU-001): REQ-008-059 APPEND + 関連 SPEC/command 適合修正（REQ-008-030/032/033、QG-1 SPEC、spec-save SPEC の適合確認）。
    - Issue C (OU-002): REQ-006-110 APPEND + 関連 SPEC/command 適合修正（case-auto SPEC Step 4/7-1、REQ-006-085/086 の整合確認）。
  wave_hints:
    - wave: 1
      ou_ids: [OU-001, OU-002]
      rationale: REQ-008/REQ-006 への APPEND 2件は依存なし。RU-0012 verify Issue も Wave 1 に並列追加可能。
```

# summary

RU-0012 と RU-0013 を入力とした要件定義（bugfix）。RU-0012 の要求4項目は全て既有件・既SPEC・既 skill で充足済みのため REQ 追加なし、implementation で verify を行う。RU-0013 の要求6項目のうち4項目は既有件・既SPECで充足済みまたは implementation レベルの適合修正で対応し、残り2項目を REQ-008-059（未確定プレースホルダーの auto_ready 抑止）と REQ-006-110（case-auto の結果状態区別報告）として新規 APPEND する。REQ-006 の SPLIT は別課題とし本ドラフトでは先行しない。3 Issue（RU-0012 verify / OU-001 / OU-002）は並列実行可能。
