---
draft_type: req_draft
topic_slug: distribution-artifact-unresolved-reference-cleanup
status: saved
created_at: 2026-06-28T10:15:00+09:00
source_rus:
  - RU-20260628-02
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  AgentDevFlow 配布物内の既存の導入先未解決参照（REQ/ADR ID、src/opencode/、
  /repo/*、repo-*、本体 docs / SPEC / guide）を docs-check report / intake / backlog
  経由で段階解消する運用方針を要件化する。
  RU-01（検出ルール新設）で検出された既存違反を、一括置換ではなく
  意味保持を確認できる粒度で領域別・ファイル群別に処理する。
  実行時に必要な判断基準は配布物内に自己完結させ、根拠ID・設計根拠は
  docs/specs/{commands,skills}/ 側に寄せる。
  本要件は REQ-0103-079/080/081 の既存原則の適用活動であり、
  新規原則の創出ではない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      既存配布物の導入先未解決参照は、docs-check report / intake / backlog 経由で
      領域別・ファイル群別に段階解消する。
      一括置換ではなく、意味保持を確認できる粒度で処理する。
      本運用は REQ-0108-025/050（docs-check report → intake）の延長であり、
      REQ-0103-079/080/081（配布物は導入先で解決可能な参照のみ）の適用活動である。

  - id: AG-002
    content: |
      対象領域は以下とする:
      - src/opencode/commands/agentdev/**/*.md
      - src/opencode/skills/agentdev-*/**/*.md
      - src/opencode/skills/agentdev-*/references/**/*.md
      - src/opencode/skills/agentdev-*/SKILL.md

  - id: AG-003
    content: |
      解消方針は以下とする:
      1. 配布 command / skill から REQ/ADR ID 固定参照を除去する
      2. 配布 command / skill から src/opencode/ 参照を除去し、
         導入先で解決可能な .opencode/ 相対パスまたはシンボリックパスへ置換する
      3. 配布 command / skill から /repo/* command 参照および repo-* skill 参照を除去する
      4. 配布 command / skill から本体 docs / SPEC / guide への実行時依存参照を除去する

  - id: AG-004
    content: |
      実行時に必要な判断基準は SKILL.md 本体または references/ に自己完結させる。
      根拠ID・設計根拠・履歴説明・SPEC 的詳細は docs/specs/{commands,skills}/
      または内部 docs 側に保持する。
      command / skill 本文では、ID 参照ではなく意味名・実行時ルール名で表現する。

  - id: AG-005
    content: |
      増分違反（PR #1318 由来等の新規追加分）は既存違反全体とは分離し、
      先行修正として扱う。

  - id: AG-006
    content: |
      修正後、導入先プロジェクトで解決不能な参照が新規に増えていないことを
      docs-check または delta guard で確認する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0108
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |
      REQ-0108-NNN: 既存配布物（src/opencode/commands/agentdev/**/*.md、
      src/opencode/skills/agentdev-*/**/*.md、references/ 配下、SKILL.md 含む）内の
      導入先未解決参照（REQ/ADR ID、src/opencode/、/repo/*、repo-*、本体 docs / SPEC / guide）は、
      docs-check report / intake / backlog 経由で領域別・ファイル群別に段階解消すること。
      一括置換ではなく、意味保持を確認できる粒度で処理すること
      （REQ-0103-079/080/081 原則に基づく）。

      REQ-0108-NNN: 配布 command / skill の段階解消において、実行時に必要な判断基準は
      SKILL.md 本体または references/ に自己完結させ、根拠ID・設計根拠・履歴説明・SPEC 的詳細は
      docs/specs/{commands,skills}/ または内部 docs 側に保持すること。
      command / skill 本文では ID 参照ではなく意味名・実行時ルール名で表現すること。

      REQ-0108-NNN: 既存違反の段階解消において、増分違反（新規追加分由来）は
      既存違反全体とは分離し、先行修正として扱うこと。

conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-02 の主対象REQ候補に REQ-0103（アーティファクト責任分界）と
      REQ-0108（docs-check / 検証・テスト）が挙がっていた。
      REQ-0103 は84行・SPLIT シグナル +2（肥大化）のため APPEND 非推奨。
    resolution: |
      REQ-0108 APPEND（要件テーブル30行・SPLIT シグナル +0）で対応する。
      REQ-0108-025/050（docs-check report → intake）の延長であり、
      責務範囲（適用範囲「report から通常 intake item への接続」）に含まれる。
      REQ-0103-079/080/081 原則は既存で変更不要、REQ-0108 要件行から参照する。
      REQ-0108 の「対象外: 個別検出事項の修正」は個別ファイル修正作業を指し、
      RU-02 の「段階解消の運用方針」は該当しない（運用方針の要件化であり個別修正ではない）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260628-02
    target_req: REQ-0108
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
      REQ-0108 に docs-check report / intake / backlog 経由の段階解消ライフサイクルが
      要件行として存在することを確認する。
    pass_criteria: |
      要件行が「report / intake / backlog 経由」「領域別・ファイル群別」
      「一括置換ではなく意味保持を確認できる粒度」を含む。
    on_failure: |
      fix-and-reverify。要件行の表現が不十分な場合、修正して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      ドラフト agreed_items AG-002 に対象領域4種が明記されていることを確認する。
    pass_criteria: |
      command（src/opencode/commands/agentdev/**/*.md）、
      skill（src/opencode/skills/agentdev-*/**/*.md）、
      references（references/**/*.md）、SKILL.md の4領域すべてが列挙されている。
    on_failure: |
      fix-and-reverify。対象領域に漏れがある場合、AG-002 を修正して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      ドラフト agreed_items AG-003 に解消方針4種が明記されていることを確認する。
    pass_criteria: |
      REQ/ADR ID 除去、src/opencode/ 除去、/repo/*・repo-* 除去、
      本体 docs / SPEC / guide 参照除去の4方針すべてが列挙されている。
    on_failure: |
      fix-and-reverify。解消方針に漏れがある場合、AG-003 を修正して再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      要件行に「実行時判断基準は自己完結」「根拠ID は docs/specs/{commands,skills}/ へ」
      「本文は意味名・実行時ルール名」が含まれることを確認する。
    pass_criteria: |
      3要素すべてが要件行または agreed_items に表現されている。
    on_failure: |
      fix-and-reverify。表現に漏れがある場合、要件行または AG-004 を修正して再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |
      要件行に「増分違反は既存違反全体とは分離し先行修正として扱う」が
      含まれることを確認する。
    pass_criteria: |
      要件行が増分違反の分離扱いを明記している。
    on_failure: |
      fix-and-reverify。分離扱いの表現が不十分な場合、要件行を修正して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      ドラフト agreed_items AG-006 に「修正後、導入先で解決不能な参照が新規に増えていない
      ことを docs-check または delta guard で確認」が含まれることを確認する。
    pass_criteria: |
      AG-006 が修正後確認手順（docs-check または delta guard）を明記している。
    on_failure: |
      fix-and-reverify。確認手順の表現が不十分な場合、AG-006 を修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

既存配布物内の導入先未解決参照を docs-check report / intake / backlog 経由で段階解消する運用方針の要件化。RU-01（検出ルール新設）で検出された既存違反を、一括置換ではなく意味保持を確認できる粒度で領域別・ファイル群別に処理する。

REQ-0108（docs-check / 検証・テスト）への APPEND で対応する。REQ-0108-025/050（report → intake）の延長であり、REQ-0103-079/080/081（配布物は導入先で解決可能な参照のみ）の適用活動。REQ-0103 は84行・SPLIT +2 で肥大化のため APPEND 非推奨、REQ-0108 APPEND（要件テーブル30行・SPLIT +0）で対応する。

新規 ADR 不要、SPEC 変更不要。RU-01 で 3層検出構造、ADR-0106/0103/0104 の枠組みを確定済み、RU-02 はその適用活動。RU-02 は運用方針の要件化であり、個別ファイルの修正作業は別 Issue（docs-check report / intake / backlog 経由で領域別に生成）で処理する。
