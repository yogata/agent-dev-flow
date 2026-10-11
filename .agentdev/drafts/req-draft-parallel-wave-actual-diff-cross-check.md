---
draft_type: req_draft
topic_slug: parallel-wave-actual-diff-cross-check
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0009
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  並列同一 Wave 内で実行中の子 Issue について、commit・push の前に兄弟 branch の変更ファイルとの
  実差分交差確認（同一ファイル交差の検出）を行う要件を REQ-035 へ追加し、実施位置・対象・検出時の挙動を
  case-run Design へ規定する。宣言ベースの Wave 重複前置検出（case-ready、REQ-061-019・REQ-035-012）は
  置換せず補完として維持する（Wave 構成時の宣言ベース検出と実行時の実差分確認の二段構え）。交差検出時は
  競合リスク情報として警告を提示し、調整決定の記録と Level 1 rebase 担当の引継ぎは case-close の現行契約
  と整合して行う。Epic #3560 Wave-2 で宣言上重複なしでも実差分で同一ファイル（req-define.md）が重複し、
  マージ直前まで衝突リスクが見えない実害を解消する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      実差分交差確認の要件（RU-0009 受け入れ条件 (1)(2)）。同一 Wave 内で並列実行する子 Issue は、
      commit・push の前に、並列実行中の兄弟 branch の変更ファイルとの実差分交差確認を行う。交差確認の
      対象は、同一 Wave 内で並列実行中の兄弟 Issue の branch の変更ファイル集合（merge-base 起点の差分で
      取得）と自 branch の変更ファイル集合の交差である。宣言ベースの Wave 重複前置検出（case-ready の
      Wave 構成時情報収集。REQ-061-019、REQ-035-012）との関係は補完であり置換しない。宣言ベース検出は
      Wave 構成時（投入前）、実差分交差確認は実行時（commit・push 前）の二段構えとして両立する。
  - id: AG-002
    content: |
      交差検出時の挙動（RU-0009 受け入れ条件 (3)）。交差検出時はエラーではなく競合リスク情報として警告を
      投入者（case-auto 配下では親判断解決）へ提示し、(1) マージ順序の調整決定、(2) 変更対象の所有正当の
      確認、を調整記録として実行記録へ残す。コンフリクト発生時の Level 1 rebase 担当は case-close の現行
      契約（マージ順序調整・Level 1 rebase 担当の引き継ぎ先）のままとし、本要件は引き継ぎ先を変更しない。
      交差未検出であっても宣言ベース前置検出の結果を無効化しない。

conflict_resolutions:
  - id: CR-001
    conflict: |
      実差分交差確認の位置づけ。(a) case-auto orchestration の Wave 重複前置検出契約へ統合する、
      (b) case-run 実行契約の commit・push 前置チェックとして位置づける、の二方向が取り得る。
    resolution: |
      (b) を採用する。根拠: 実差分は各子 Issue の実行が commit を重ねる途中で確定するため、確定時点
      （commit・push 前）で検査する構造が最も検出精度が高い。Wave 構成時（case-ready）には実差分が存在
      しないため (a) は検出時点として成立しない。case-run の委譲・gate 意味論（前置 gate と最終 gate）に
      沿った前置チェックとして追加し、宣言ベース前置検出（case-ready）は現行のまま補完関係とする。
      RU-0009 の受け入れ条件 (3)（調整・rebase 担当の引き継ぎ先が既存 case-close 契約と整合）を維持する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-035
    target_area: 要件
    source_items: [AG-001, AG-002]
    content: |
      | REQ-035-021 | 同一 Wave 内で並列実行する子 Issue は、commit・push の前に、並列実行中の兄弟
      branch の変更ファイルとの実差分交差確認を行うこと。交差検出時は競合リスク情報として警告を提示し、
      調整決定の記録とコンフリクト解消（Level 1 rebase）への引継ぎを既存の case-close 契約と整合して
      行うこと。Wave 構成時の宣言ベース重複前置検出を代替しないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-run
    target_area: case-run gate 意味論（前置 gate と最終 gate）
    source_items: [AG-001, AG-002]
    content: |
      case-run gate 意味論節の直後に「並列兄弟 branch 実差分交差確認（commit・push 前置）」節を追加する。
      (1) 実施位置: 同一 Wave 内で兄弟 Issue が並列実行中の子 Issue の commit・push 前。委譲先の実行担当
      サブエージェントが commit・push する直前（commit 前 3 検査と同一位置）に実施する。case-run の
      前置 gate 群（STEP-S3）は委譲開始前に実行されるため当該時点では自 branch の変更ファイルが存在せず、
      実施位置にはならない（前置 gate での実施を前提した記述にしない）。
      (2) 対象: 並列実行中の兄弟 branch の変更ファイル集合（merge-base 起点の git diff --name-only で
      取得。パスは正規化して比較）と自 branch の変更ファイル集合の交差。
      (3) 検出時の挙動: エラーではなく競合リスク情報としての警告。調整決定（マージ順序・所有正当）の
      記録、case-close の Level 1 rebase 担当契約への引継ぎ（AG-002）。
      (4) 宣言ベースの Wave 重複前置検出（case-ready Design「v3 epic-wave-model Design からの吸収」節、
      REQ-061-019・REQ-035-012）とは補完関係にあり置換しない。単独実行（兄弟 Issue なし）の場合は
      発動条件不成立としてスキップする。兄弟 branch の状態が取得不能な場合は検査省略而非検出として扱わず
      取得不能を報告する（検出不能は交差なしを意味しない）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0009
    target_req: REQ-035
    target_design: docs/designs/commands/case-run.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      (1) REQ-035 の要件表に REQ-035-021 行が追加されていること、frontmatter updated が追随している
      ことを確認する。(2) 追加行の design 対応（case-run Design 新節 + sidecar
      traceability/agentdev-workflow-case-run.yaml への REQ-035-021 design/implementation 宣言追加）が
      行われていることを確認し、トレーサビリティ check --req REQ-035-021 で missing-design が 0 件である
      ことを確認する。(3) case-run 配布 reference（references/single.md）の commit/push 前工程に実差分
      交差確認手順が追記されていることを機械的検索（rg）で確認する。(4) 新行の verification 対応の
      追随（policy.yaml の扱いの明示、verification 実体〔scripts/self/release 側の手順存在検証 test〕の
      追加、sidecar verification 宣言）が行われていることを確認する。
    pass_criteria: |
      REQ-035-021 行の追加・design 対応宣言・missing-design 0 件・配布 reference 手順の追記・
      verification 対応（手順存在検証 test と sidecar verification 宣言。REQ-035-019/020 の
      verification 対応と同型）がすべて成立していること。REQ-035 の他行（REQ-035-012 等）が変更されて
      いないこと。
    on_failure: |
      fix-and-reverify。行追加・宣言追随・手順追記の欠落を検出した場合は修正して再検証する
      （design 対応欠落は case-ready の lifecycle gate completeness で停止するため、完了前に解消する）。
  - id: TS-002
    target_item: AG-002
    verification: |
      case-run Design の新節において、(1) 交差検出時の警告・調整記録・case-close Level 1 rebase 契約との
      整合記述、(2) 宣言ベース前置検出を代替しない旨、(3) 兄弟 branch 状態取得不能時に検査省略としない
      （取得不能を報告する）旨、が記述されていることを全文読取で確認する。
    pass_criteria: |
      (1)〜(3) の記述が存在し、case-close の現行契約（マージ順序調整・Level 1 rebase 担当）の記述が
      変更されていないこと。
    on_failure: |
      fix-and-reverify。記述の欠落・既存契約との矛盾を検出した場合は修正して再検証する。

realization_actions:
  - id: RA-001
    concern: case-run 配布 skill（reference 手順と制御平面）への実差分交差確認手順の実装と verification 対応
    responsibility: >
      case-run の実行手順を所有する配布 skill。references/single.md の commit・push 前工程へ実差分交差
      確認手順（兄弟 branch 変更ファイルの取得・交差判定・検出時の警告と調整記録・取得不能時の報告）を
      追記し、SKILL.md の制御平面から当該手順を参照する。あわせて新行 REQ-035-021 の verification 対応
      として、配布 reference・Design の手順節の存在を検証する test（REQ-035-019/020 の verification
      対応と同型）を scripts/self/release へ追加し、sidecar へ verification 宣言を追加する
      （policy.yaml は verification 必須の既定扱いとし、任意行登録は行わない）。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-run/references/single.md（commit 前 3 検査・push 前手順の節）"
      - "src/common/skills/agentdev-workflow-case-run/SKILL.md（制御平面の参照追加）"
      - "Design の正: docs/designs/commands/case-run.md「並列兄弟 branch 実差分交差確認（commit・push 前置）」節（ACT-DESIGN-001 で追加）"
      - "sidecar: traceability/agentdev-workflow-case-run.yaml（REQ-035-021 の design/implementation/verification 宣言追加）"
      - "verification 対応の前例: scripts/self/release/epic-reflect-coordination.test.ts（REQ-035-019/020 の verification 対応）"
    intent: >
      宣言ベース検出では検出できない実差分の交差（Epic #3560 Wave-2 で Issue #3563/#3564 が
      docs/designs/commands/req-define.md の別節を変更し重複した実例）をマージ直前でなく commit・push 前に
      可視化し、調整決定の前置と case-close Level 1 rebase への引継ぎ記録を早期化する。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0009
    source_item: RU-0009
    disposition: covered
    reason_code: covered
    reason: |
      実差分交差確認の REQ/Design 変更を AG-001 / AG-002 + ACT-REQ-001（REQ-035-021 追加）+
      ACT-DESIGN-001（case-run Design 新節）+ RA-001（配布 skill 手順）で採用。受け入れ条件 (1)(2)(3) を
      TS-001 / TS-002 で検証。位置づけ（orchestration 統合 vs case-run 前置）の判断を CR-001 に記録。
      対象外（マージ順序調整・Level 1 rebase 担当の引き継ぎ先変更）を AG-002 に反映。
    evidence:
      path: docs/designs/workflows/references/execution-unit-construction.md
      section: 連結成分アルゴリズム（依存ヒント・重複前置検出は Wave 構成時の情報収集であり実差分交差の検出は現行契約対象外であることを確認）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0009 を単独 Case として処理する（feature）。並列 Wave の実差分交差確認を commit・push 前の前置
チェックとして case-run 実行契約へ追加し、REQ-035 へ新行（REQ-035-021）を追加する。宣言ベースの Wave
重複前置検出（case-ready）は補完として維持し、交差検出時の調整・Level 1 rebase 引継ぎは case-close の
現行契約と整合させる。位置づけの判断（case-run 前置チェック採用）は CR-001 に根拠を記録した。
