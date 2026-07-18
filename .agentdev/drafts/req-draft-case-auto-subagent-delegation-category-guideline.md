---
draft_type: feature
topic_slug: case-auto-subagent-delegation-category-guideline
status: saved
created_at: 2026-07-18T00:00:00+09:00
source_rus:
  - RU-0014
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  case-auto から case-open を category=writing で委譲した際、文書監査
  ファイル生成・draft 作成へスコープ逸脱（#1538）。category=unspecified-high
  + MUST NOT DO 強化プロンプトで解決したが、category 選定基準と MUST NOT DO
  記載要件が SPEC に未明文化で case-open 等の事務的手続き委譲時に毎回直面
  する。新規 REQ（subagent 委譲プロトコル要件）で category 選定ガイド
  ライン（事務的手続きは unspecified-high 推奨、writing は執筆作業のみ）と
  MUST NOT DO セクション必須化を要件化し、case-auto.md、capture-boundaries.md、
  adapter SKILL.md の3層へ実装修復する。汎用化し case-auto 委譲時に限定
  せず case-open/run/update/close 全場面に適用可能な形で整備する。

auto_gate:
  auto_ready: true
  open_questions: []
  conflicts: []

agreed_items:
  - id: AG-001
    statement: >-
      根本原因（#1538 事例）: (1) category=writing が「文書作業」を連想させ
      subagent が文書監査・校正的振る舞いを誘発（japanese-tech-writing 等の
      発火スキルとの相互作用）、(2) subagent プロンプトで MUST NOT DO が
      明示されずスコープ境界が弱かった、(3) writing category が「書く」作業
      全般を意味するため case-open の事務的手続き作業と認識されなかった。
      category=unspecified-high + MUST NOT DO 強化で正常完了したことから
      逆算的に原因特定。
    source_rus: [RU-0014]
  - id: AG-002
    statement: >-
      category 選定ガイドライン: 事務的手続き（Issue 作成・VERIFY・ラベル
      設定・状態遷移等）は unspecified-high を推奨。writing category は
      執筆作業（docs 記述、article 作成等）のみに限定。category 名が
      subagent の「作業の意味」を誤誘導しないよう、command の責務と category
      の意味的距離を評価して選定する。
    source_rus: [RU-0014]
  - id: AG-003
    statement: >-
      MUST NOT DO セクション必須化: case-auto から subagent へ委譲する全
      プロンプトに MUST NOT DO セクションを必須とする。スコープ外作業の
      明示的禁止（draft ファイル作成禁止、文書監査禁止、REQ/SPEC/src 修正
      禁止等）を列挙する。
    source_rus: [RU-0014]
  - id: AG-004
    statement: >-
      汎用化: case-auto 委譲時に限定せず、case-open, case-run, case-update,
      case-close 等 subagent 委譲する全場面に適用可能な形で整備する。
      特に command 名と category 名の意味的距離が大きい場合は要注意。
    source_rus: [RU-0014]
  - id: AG-005
    statement: >-
      writing category の発火スキル無効化（japanese-tech-writing 等との
      相互作用抑制）は仕組みの検討段階とし、即時実装は必須としない。
      別 Issue で具体化する。本 draft は category 選定ガイドラインと
      MUST NOT DO 必須化に限定する。
    source_rus: [RU-0014]

artifact_actions:
  - target: new:subagent-delegation-protocol-requirements
    operation: create
    description: >-
      新規 REQ を作成。case-auto/case-open/case-run/case-update/case-close 等
      subagent 委譲プロトコルの要件。category 選定ガイドライン（事務的手続き
      は unspecified-high 推奨、writing は執筆作業のみ）、MUST NOT DO セクション
      必須化、subagent プロンプトテンプレート要件を要件化。
    rationale: >-
      REQ-0105（RU lifecycle）は case-auto の役割を定義するが、subagent 委譲
      プロトコルの細部（category 選定、MUST NOT DO）は別関心。REQ-0149 は
      gh CLI 委譲基盤で対象外。新規 REQ として整理。
  - target: src/opencode/commands/agentdev/case-auto.md
    operation: 実装修復
    description: >-
      subagent 委譲時の category 選定ガイドライン節を追記。事務的手続きは
      unspecified-high 推奨、writing は執筆作業のみ、category 名と command
      責務の意味的距離評価。subagent プロンプトテンプレートの MUST NOT DO
      セクション必須化を明記。
  - target: src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md
    operation: 実装修復
    description: >-
      subagent プロトコルの MUST NOT DO 記載要件を追記。case-auto/case-open/
      case-run/case-update/case-close の各委譲で MUST NOT DO が必須であること。
  - target: src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md
    operation: 実装修復
    description: >-
      委譲プロトコルと category 設計の関係を整理。writing category の発火
      スキル（japanese-tech-writing 等）との相互作用、事務的手続きでは
      unspecified-high を推奨する根拠を記載。

conflict_resolutions:
  - id: CR-001
    description: >-
      新規 REQ CREATE と REQ-0105 APPEND の使い分け。
    resolution: >-
      新規 REQ CREATE。REQ-0105 は RU lifecycle 全般で、subagent 委譲
      プロトコルの細部（category 選定、MUST NOT DO）は別関心。責務境界を
      明確にするため新規 REQ とする。
  - id: CR-002
    description: >-
      writing category の発火スキル無効化の即時実装要否。
    resolution: >-
      即時実装は必須としない。本 draft は category 選定ガイドラインと
      MUST NOT DO 必須化に限定。発火スキル無効化は別 Issue で具体化。

operation_units:
  - id: OU-001
    description: >-
      新規 REQ（subagent-delegation-protocol-requirements）を CREATE。
      採番は req-save 任せ（REQ-0163 以降を想定）。
    depends_on: []
    artifact: docs/requirements/REQ-NNNN.md
  - id: OU-002
    description: >-
      case-auto.md に category 選定ガイドライン節と MUST NOT DO 必須化を
      追記。
    depends_on: [OU-001]
    artifact: src/opencode/commands/agentdev/case-auto.md
  - id: OU-003
    description: >-
      capture-boundaries.md に subagent プロトコルの MUST NOT DO 記載要件
      を追記。
    depends_on: [OU-001]
    artifact: src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md
  - id: OU-004
    description: >-
      adapter SKILL.md に委譲プロトコルと category 設計の関係を整理。
    depends_on: [OU-001]
    artifact: src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md

test_strategy:
  - id: TS-001
    verification: >-
      新規 REQ が docs/requirements/ に作成されていること。
    pass_criteria: >-
      subagent 委譲プロトコル要件を内容とする REQ ファイルが存在。
    on_failure: OU-001 の CREATE 実施。
  - id: TS-002
    verification: >-
      case-auto.md に category 選定ガイドライン節と MUST NOT DO 必須化が
      記載されていること。
    pass_criteria: >-
      category 選定ガイドライン節と MUST NOT DO 必須化の記載あり。
    on_failure: OU-002 の追記実施。
  - id: TS-003
    verification: >-
      capture-boundaries.md と adapter SKILL.md に MUST NOT DO 記載要件・
      category 設計整理が記載されていること。
    pass_criteria: >-
      両ファイルとも subagent プロトコル要件への言及あり。
    on_failure: OU-003, OU-004 の追記実施。
  - id: TS-004
    verification: >-
      実証: #1538 と同等の case-open 委譲を category=unspecified-high +
      MUST NOT DO 強化プロンプトで実施し、文書監査・draft 作成へスコープ
      逸脱せず case-open 本来責務（Issue 作成・VERIFY）へ到達すること。
    pass_criteria: >-
      case-open 委譲がスコープ逸脱なく完了すること。
    on_failure: >-
      プロンプトテンプレートと category 選定を再確認・調整。

case_open_hints:
  recommended_label: "type:feature, scope:case-auto+workflow-orchestration, area:subagent-delegation-protocol"
  scope_statement: >-
    case-auto から subagent へ委譲する際の category 選定ガイドラインと
    MUST NOT DO 必須化を新規 REQ で要件化し、case-auto.md、capture-boundaries.md、
    adapter SKILL.md の3層へ実装修復する。
  suggested_breakdown:
    - "Wave 1: 新規 REQ CREATE"
    - "Wave 2: case-auto.md category 選定ガイドライン + MUST NOT DO 必須化"
    - "Wave 3: capture-boundaries.md subagent プロトコル MUST NOT DO 記載要件"
    - "Wave 4: adapter SKILL.md 委譲プロトコルと category 設計整理"
    - "Wave 5: #1538 と同等ケースでの実証確認"
  dependencies:
    - "REQ-0105（RU lifecycle）との責務境界整理"
    - "Issue #1538, PR #1539 由来"
    - "writing category 発火スキル無効化は別 Issue"
```

# summary

RU-0014（case-auto subagent 委譲 category 選定ガイドライン）を処理。#1538 事例で category=writing が文書監査・draft 作成へスコープ逸脱を誘発、category=unspecified-high + MUST NOT DO 強化で解決済みだが SPEC 化されていない。新規 REQ（subagent-delegation-protocol-requirements）で category 選定ガイドライン（事務的手続きは unspecified-high 推奨、writing は執筆作業のみ）と MUST NOT DO セクション必須化を要件化、case-auto.md、capture-boundaries.md、adapter SKILL.md の3層へ実装修復。汎用化し case-auto 委譲時に限定せず全場面に適用。

work_type=feature、scale=standard。新規 ADR 不要。test_strategy は4件。Wave 5段階での分割実装を推奨。writing category 発火スキル無効化は別 Issue。
