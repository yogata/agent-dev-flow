---
draft_type: req_draft
topic_slug: skill-projection-distribution-fix
status: draft
created_at: 2026-10-13T12:40:00Z
source_rus:
  - RU-0221
---

# draft-data

```yaml
# phase 6スキル投影未登録の解消と配布境界違反の明確修正。REQ/Decision/Design 保存対象なし（実現面修正）
work_type: maintenance

scale: standard

summary: phase 系 6 スキルを skill-projection-manifest.yaml へ登録して junction を再構築し（SkillProjection 12 NG 解消）、REQ-106 short-form 参照 3 件を IR-055 strict の自己完結表現へ書換する（RuntimeReference 3 NG 解消）。REQ-106/107 の併記部分は併記全体の自己完結化とし、検索系検証の網羅範囲に REQ-107 を含める。残り 8 failures の処遇（RU-0222）と lint_skills AG-005 NG 3 件は対象外。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      ①manifest 登録と junction 再構築（SkillProjection 12 NG 解消）:
      phase 系 6 スキル（agentdev-phase-theme-collaboration、agentdev-workflow-phase-artifacts-update、
      agentdev-workflow-phase-review、agentdev-workflow-phase-tasks-create、
      agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-transition）を
      .opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml の
      skills: 一覧へ登録し、scripts/install.ps1 -Mode apply による junction 再構築を実施する。
      実測根拠: src/common/skills/ 配下に phase 系 6 スキルが存在するが manifest 未登録かつ
      .opencode/skills/ 投影に不在（2026-10-13 実測）。manifest の同期条件
      （スキル追加・削除・リネームは同一 PR で更新）どおりの補正である。
  - id: AG-002
    content: |
      ②REQ-106 short-form 参照 3 件の自己完結表現への書換（RuntimeReference 3 NG 解消）:
      対象は phase-theme-collaboration SKILL.md:96（「REQ-106/107 の契約」）、
      workflow-phase-artifacts-update SKILL.md:27（「REQ-106 の差分義務に従う」）、
      同 SKILL.md:83（「REQ-106 の正規契約に従い」）。
      IR-055 strict に基づく自己完結表現へ書換する。
      書換文面の詳細は REQ-106 の該当内容を参照して Case 実行時に確定してよい（RU 本文どおり）。
      adversarial-review 反映: phase-theme-collaboration:96 は「REQ-106/107 の契約」との併記であり、
      REQ-106 のみを書換すると REQ-107 short-form が残留して再検出の再発リスクがあるため、
      併記全体を自己完結表現へ書換する（REQ-106 差分義務、REQ-107 品質検証責務分離の内容表現へ）。
  - id: AG-003
    content: |
      対象外（RU 本文どおり）:
      残り 8 failures の処遇（RU-0222 へ分離済み）、
      lint_skills AG-005 NG 3 件（既知 LINT01 と同一のため処分変更しない）。
  - id: AG-004
    content: |
      受け入れ条件（RU 本文どおり）:
      check_distribution_boundary（repo root）の RuntimeReference 3 NG と
      check_integrity の SkillProjection 12 NG が解消されること。
      実測基準: check_distribution_boundary の 2026-10-13 実行で RuntimeReference 相当の
      REQ-106 検出 3 件（phase-theme-collaboration:96、workflow-phase-artifacts-update:27,83）を確認済み。

artifact_actions: []

conflict_resolutions:
  - id: CR-001
    conflict: "agentdev_handoff: true の RU に対する前工程からの引き継ぎ判定"
    resolution: "本リポジトリ（自己ホスティング）では通常入力として扱い、前工程引き継ぎ停止を発動しない（Batch D 共通方針、ユーザー指示 (a)）"
  - id: CR-002
    conflict: "REQ-106/107 併記部分（phase-theme-collaboration:96）の書換範囲（REQ-106 のみか併記全体か）"
    resolution: "併記全体を自己完結表現へ書換する。checker の現行検出は REQ-106 のみだが REQ-107 も同形式の short-form であり、REQ-106 のみ書換では同形式残留が残る（adversarial-review で併記全体書換を合意）"

operation_units:
  - ou_id: OU-001
    source_ru: RU-0221
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_integrity（IR-068 skill-projection-manifest）を repo root から実行する。
      projection 突合は junction 環境（.opencode/skills に非 repo-* ディレクトリが存在）で実施され、
      worktree（junction 未伝播）では info で skip される契約に従い、
      main root 実体からの実行または junction 再構築後の実行で確認する。
    pass_criteria: |
      phase 系 6 スキルの SkillProjection 検出（未登録・投影不在）が 0 件となり
      12 NG が解消されること。
    on_failure: |
      fix-and-reverify: manifest 登録漏れまたは junction 未構築の対象を修正して再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      check_distribution_boundary（repo root、profile: source）を実行し、
      対象 3 行（phase-theme-collaboration SKILL.md:96、workflow-phase-artifacts-update SKILL.md:27,83）
      の検出が消えていることを確認する。
    pass_criteria: |
      RuntimeReference 相当の REQ-106 検出 3 件が 0 件となり 3 NG が解消されること
      （RU-0222 対象の 8 failures は本修正の判定対象外であること）。
    on_failure: |
      fix-and-reverify: 書換漏れの行を修正して再実行する。
  - id: TS-003
    target_item: AG-002
    verification: |
      検索系検証: rg 'REQ-10[67]' で修正対象 2 ファイル（agentdev-phase-theme-collaboration/SKILL.md、
      agentdev-workflow-phase-artifacts-update/SKILL.md）を検索する。
      網羅範囲は修正対象列挙（2 ファイル 3 行）と一致させる。
      adversarial-review 反映により検索パターンに REQ-107 を含め、併記残留を検出対象にする。
      See Also 等の参照行は修正対象ではないが、対象 2 ファイルの REQ-106/107 言及は
      すべて本修正の書換対象であるため網羅範囲から除外する参照行は存在しない（確認済み）。
    pass_criteria: |
      修正対象 2 ファイル内に REQ-106/REQ-107 の short-form 参照（consumer 解決不能な concrete ID 参照）
      が 0 件となること（自己完結表現への書換済みであること）。
    on_failure: |
      fix-and-reverify: 残存する short-form 参照を自己完結表現へ書換して再検索する。

realization_actions:
  - id: RA-001
    concern: skill-projection-manifest.yaml への phase 系 6 スキル登録
    responsibility: "検出データ（skill-projection-manifest.yaml）の同期条件（src/common/skills/ へのスキル追加・削除・リネームは同一 PR で更新）の履行"
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml（skills: 一覧）"
    intent: SkillProjection 12 NG（phase 系 6 スキルの未登録検出）を解消する
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: .opencode/skills/ 投影の junction 再構築
    responsibility: 投影（.opencode/skills junction）契約（runtime-package-boundary Design）に従う投影像の再構築
    ownership_hints:
      - "scripts/install.ps1 -Mode apply"
    intent: phase 系 6 スキルの投影不在を解消する
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-003
    concern: REQ-106 short-form 参照 3 件の自己完結表現への書換
    responsibility: "配布 skill 本文（SKILL.md）の配布物本文記述規則（distribution-boundary Design: 一般化表現・concrete ID 非記載）への適合"
    ownership_hints:
      - "src/common/skills/agentdev-phase-theme-collaboration/SKILL.md:96（REQ-106/107 併記全体を自己完結化）"
      - "src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md:27"
      - "src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md:83"
    intent: consumer 環境で解決不能な REQ short-form 参照を解消し、内容表現として自己完結させる
    verification_refs: [TS-002, TS-003]
    source_items: [AG-002, AG-004]

review_dispositions:
  - id: RD-001
    source_ru: RU-0221
    source_item: RU-0221.対象外（残り 8 failures の処遇）
    disposition: rejected
    reason_code: out_of_scope
    reason: "1:N 分割の副側 RU-0222 に分離済み。本 draft では扱わない。"
    evidence:
      path: .agentdev/backlog/req-units/RU-0221.md
      section: 統合理由
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0221
    source_item: RU-0221.対象外（lint_skills AG-005 NG 3 件）
    disposition: rejected
    reason_code: already_satisfied
    reason: "既知 LINT01 と同一の検出であり処分変更しない（RU 本文どおり）。"
    evidence:
      path: .agentdev/backlog/req-units/RU-0221.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

phase 系 6 スキルの投影 manifest 登録と junction 再構築（SkillProjection 12 NG 解消）、および REQ-106 short-form 参照 3 件の自己完結表現への書換（RuntimeReference 3 NG 解消）を実現面修正として確定した。
phase-theme-collaboration:96 の「REQ-106/107 の契約」併記は併記全体を自己完結化し、検索系検証の網羅範囲に REQ-107 を含める（adversarial-review 反映）。
残り 8 failures の処遇（RU-0222）と lint_skills AG-005 NG 3 件は対象外。
