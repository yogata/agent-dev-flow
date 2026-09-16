---
draft_type: req_draft
topic_slug: ru0024-bun-test-prereqs
status: draft
created_at: 2026-09-16T00:00:00+09:00
source_rus:
  - RU-0024
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: docs_chore

# summary: 当該 draft が何を合意したかの1段落要約
summary: bun test 3 cwd 分割正規形の環境前提（依存解決前置・worktree plugins 分割差）が暗黙知である問題を、REQ-060 への APPEND（公開契約）と実行契約文書への明記で解消する。依存解決前置は package.json と bun.lock が存在する場所ごとの bun install --cwd を前提とし、リポジトリルートに package.json が存在しないためルート実行で依存解決が完了しないことを前提条件として明記する。worktree では .opencode/plugins の junction 未伝播により plugins 分割が実行対象から欠落し得るため、分割実行の実施範囲を実行ログ・注記から読み取れる運用注記を明記する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: bun test 実行形態契約には 3 cwd 分割正規形の環境前提を含めること。依存解決の前置は、package.json と bun.lock が存在する場所ごとに bun install --cwd を実行することを前提とし、リポジトリルートに package.json が存在しないためルートでの bun install 実行では依存解決が完了しないことを前提条件として明記する。新規 clone 環境や worktree 作成直後で node_modules が無い場合に、依存解決前置を実行せず bun test を起動した際の fail（Cannot find package 等の依存解決失敗）は環境前提の未実施由来であることを識別できるようにする。この規定は REQ-060（bun test 実行形態の統一）へ新規行として追加し、QG-4 フル suite 正規形（agentdev-quality-gates 正規所有）の所有権を侵食せず、参照・補完に留める。根拠：bun test 3 分割正規形の依存解決前置がルート package.json 不在のためルート実行で失敗する事例は Case #2846 F-002 で観測され、Case #2856 で再確認、2026-09-16 再実査でリポジトリルートの package.json 不在を確認済み。checker 実行契約 Design「bun test 実行形態契約」節には worktree 実行時の依存パッケージ前置の要否確認のみがあり、ルート package.json 不在前提と bun install --cwd の一般原則は明記されていない。
  - id: AG-002
    content: 依存解決前置手順（ルート package.json 不在前提、package.json と bun.lock のある場所ごとの bun install --cwd）を、checker 実行契約 Design「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節（bun test 単独実行・ファイル単体指定の実行形態契約の正本、REQ-060 の Design 側正本）へ明記する。既存の「worktree 実行時は依存パッケージ前置（bun install）の要否を事前確認する」条項を一般原則へ拡張する形とし、QG-4 reference（qg-4-final-acceptance.md）が列挙する bun install --cwd 対象2箇所（src/opencode/skills/agentdev-project-extensions/scripts と .opencode/skills/repo-agentdev-integrity/scripts）と矛盾しない表現とする。
  - id: AG-003
    content: worktree 実行時の plugins 分割環境差を運用注記として明記する。worktree 環境では .opencode/plugins が junction 未伝播のため存在せず、plugins 分割（bun test ./.opencode/plugins/ ./scripts/）が ./scripts/ のみ実行となる。動作自体は妥当だが plugins 分割が実行されないことが実行ログから読み取りにくく、検証カバレッジの見落としリスクがある（Case #2831 / #2846 で観測、検出自体は main 側 full-audit で担保済み）。明記先は QG-4 reference（qg-4-final-acceptance.md）「3 cwd 分割実行」節とし、worktree 実行時に分割③の対象が ./scripts/ のみとなる環境差、実行ログの件数突合で分割実行の実施範囲を確認すること、main root から --root 指定等で plugins 分割を代替実行できること（checker 実行契約 Design の worktree 検査対象 checker の起動契約と整合）を注記する。REQ-018（worktree 構造的制約とテスト fallback）および agentdev-git-worktree の worktree 構造的制約と矛盾しない。

# artifact_actions: REQ/Decision/Design への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-060.md
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-060-006 | bun test 3 cwd 分割正規形の実行契約は環境前提を明記すること。依存解決前置は、package.json と bun.lock が存在する場所ごとに bun install --cwd を実行することを前提とし、リポジトリルートに package.json が存在しないためルート実行では依存解決が完了しないことを前提条件として含めること。worktree 実行時は .opencode/plugins の junction 未伝播により plugins 分割が実行対象から欠落し得ることを環境差として明記し、分割実行の実施範囲を実行ログ・注記から読み取れるようにすること（QG-4 フル suite 正規形の所有権は侵食しない） |

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: 依存解決の解消手段として、(1) 実行契約への依存解決前置手順の明記と、(2) リポジトリルートへの最小 package.json 追加の2案が存在した。また worktree plugins 分割差の明記先として QG-4 reference への運用注記追加と環境差補足の2方式が存在した。
    resolution: 手順明記で完結する方式 (1) を採用し、ルートへの最小 package.json 追加は不採用とする。根拠：ルート package.json の追加は配布境界（distribution-boundary）への影響評価が前提であり、影響大に対し本 RU の論点（環境前提の明記）は手順明記で閉じる。明記先は実ファイル照合で確定し、依存解決前置の一般原則は checker 実行契約 Design「bun test 実行形態契約」節（bun test 実行形態の Design 側正本）、plugins 分割環境差の運用注記は QG-4 reference「3 cwd 分割実行」節（分割実行の正規形を所有）へ配置する。既存の bun install --cwd 対象2箇所の列挙（QG-4 reference）と一般原則の両立を確認済み。work_type は文書明記のみで完結するため docs_chore を維持し、maintenance への昇格は不要と判断した（実行手順の振る舞い変更を行わない）。
  - id: CR-002
    conflict: REQ-060 の現行最大行は REQ-060-005 であり、本 draft の APPEND 先行番号（REQ-060-006）は複数の req-define 実行間で採番衝突し得る。
    resolution: REQ-060-006 は擬似採番であり、case-open が決定的採番により再確定する。case-open 以降の工程は本 draft の行番号を直接確定値として扱わない。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0024
    target_req: REQ-060
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

# test_strategy: 各合意項目（AG-*）の検証方法
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-060.md を再読取し、新規行（擬似 REQ-060-006、case-open の決定的採番で確定）が要件テーブルへ APPEND されていることを確認する。
      行本文が「package.json と bun.lock のある場所ごとの bun install --cwd 前提」「ルート package.json 不在によりルート実行で依存解決が完了しない」「worktree の plugins 分割欠落環境差」「分割実行の実施範囲の読み取り可能性」の4点を含むことを確認する。
      REQ-060-003（QG-4 フル suite 正規形の所有権侵食禁止）との整合を確認する。
      行 ID と docs/requirements/README.md の AUTOGEN 索引の整合（行追加後の再生成）を確認する。
    pass_criteria: |
      REQ-060.md の要件テーブルに当該行が存在し、環境前提4点が行本文として含まれる。
      行 ID が REQ-060 の現行最大行の次の連番であり、AUTOGEN 索引が再生成済みで鮮度検査が exit 0 である。
      行本文が QG-4 正規形の所有権を侵食しない参照・補完の範囲に留まる。
    on_failure: |
      fix-and-reverify。行本文の文言修正または索引再生成の再実行で解消できる文書不備であるため、修正後に同一検証を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/designs/integrity/checker-execution-contracts.md の最終 HEAD 実ファイル全文を再読取する。
      「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節に、ルート package.json 不在前提と package.json と bun.lock のある場所ごとの bun install --cwd 前置手順が明記されていることを確認する。
      既存の「worktree 実行時は依存パッケージ前置（bun install）の要否を事前確認する」条項との整合、逸脱時の検知条件との整合を確認する。
      QG-4 reference の bun install --cwd 対象2箇所と矛盾しない表現であることを確認する。
    pass_criteria: |
      「bun test 実行形態契約」節にルート package.json 不在前提の依存解決前置手順が存在する。
      bun install --cwd 対象の QG-4 reference 列挙との矛盾がなく、REQ-060-006 と整合する。
      docs-check の該当検査が pass である。
    on_failure: |
      fix-and-reverify。節内条項の文言修正で解消できる文書不備であるため、修正後に全文再読取で再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（配布 references）の最終 HEAD 実ファイル全文を再読取する。
      「3 cwd 分割実行」節に、worktree 時の .opencode/plugins junction 未伝播による分割③対象欠落の環境差注記、件数突合による分割実行の実施範囲の確認、main root からの --root 指定等の代替実行の注記が存在することを確認する。
      QG-4 フル suite 正規形（3 分割実行、正規ランナー構成確認、環境ラベル、fail 由来分類）の既存規定が削除・改変されていないことを確認する。
      配布物整合性のため、src 側 reference の変更が配置先投影（.opencode/skills/ 配下同期）で反映されることを配布物整合性検査の契約に従い確認する。
    pass_criteria: |
      「3 cwd 分割実行」節に worktree plugins 分割欠落の環境差運用注記が存在し、実行ログ・注記から分割実行の実施範囲が読み取れる記述である。
      QG-4 正規形の既存規定と機械受理基準が維持されている。
      配布物整合性検査（src→配置先投影）が pass である。
    on_failure: |
      fix-and-reverify。注記の文言修正または投影同期の再実行で解消できる文書不備であるため、修正後に全文再読取で再検証する。

# realization_actions: 実現面の変更方針
realization_actions:
  - id: RA-001
    concern: bun test 実行形態契約への依存解決前置一般原則の明記
    responsibility: bun test 単独実行・ファイル単体指定の実行形態契約は checker 実行契約 Design（docs/designs/integrity/checker-execution-contracts.md）が正規所有し、QG-4 フル suite 正規形の所有権（agentdev-quality-gates）を侵食しない。依存解決前置の一般原則は同 Design「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節へ明記する。
    ownership_hints:
      - "変更対象: docs/designs/integrity/checker-execution-contracts.md「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節"
      - "拡張対象の既存条項: 「worktree 実行時は依存パッケージ前置（bun install）の要否を事前確認する」（同節）"
      - "整合対象: src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md「3 cwd 分割実行」節の bun install --cwd 対象2箇所の列挙"
      - "正規所有 REQ: REQ-060（bun test 実行形態の統一）"
      - "整合 REQ: REQ-018（worktree 構造的制約とテスト fallback）"
    intent: ルート package.json 不在による bun install 失敗と、package.json + bun.lock のある場所ごとの bun install --cwd 前置を暗黙知から実行契約の明記へ変え、新規環境・worktree での初動失敗を文書のみで予防する。
    verification_refs: [TS-002]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: QG-4 reference への worktree plugins 分割環境差の運用注記明記
    responsibility: QG-4 フル suite 正規形（3 cwd 分割実行を含む）は agentdev-quality-gates（配布 references：src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md）が正規所有する。worktree 環境差の運用注記は同 reference「3 cwd 分割実行」節への補足として配置し、正規形の所有権を侵食しない。
    ownership_hints:
      - "変更対象: src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md「3 cwd 分割実行」節（配布 references、配置先投影 .opencode/skills/agentdev-quality-gates/references/ 同期対象）"
      - "環境差の実体: worktree では .opencode/plugins junction 未伝播により分割③（bun test ./.opencode/plugins/ ./scripts/）が ./scripts/ のみ実行となる"
      - "整合 Design: checker 実行契約 Design の worktree 検査対象 checker 起動契約（host 側起点、--root 明示指定）、agentdev-git-worktree worktree 構造的制約"
      - "正規所有 REQ: REQ-060（参照・補完に留まる）、REQ-018"
      - "cover 担保: 検出自体は main 側 full-audit で担保済みのため、本注記は worktree 実行時の読み取り可能性の向上が目的"
    intent: worktree 実行時に plugins 分割が実行されない状態を実行ログ・注記から読み取れるようにし、検証カバレッジの見落としリスクを運用注記で緩和する。
    verification_refs: [TS-003]
    source_items: [AG-001, AG-003]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0024
    source_item: bun-install-prereq-documentation
    disposition: covered
    reason_code: requirements_mapped
    reason: |
      RU-0024 の Source 1（ルート package.json 不在による bun install 不能）は AG-001（REQ-060-006 行）、AG-002（checker 実行契約 Design への依存解決前置明記）へ反映した。
      ルート package.json 追加の対応候補は CR-001 で不採用と判断し、related_removed_items には含めない（本 RU 内の対応方式の選択であり、別 RU への振り分け対象ではない）。
    evidence:
      path: docs/designs/integrity/checker-execution-contracts.md
      section: bun test 実行形態契約（単独実行・ファイル単体指定を含む）
      checked_at_commit: null
  - id: RD-002
    source_ru: RU-0024
    source_item: worktree-plugins-split-gap-note
    disposition: covered
    reason_code: requirements_mapped
    reason: |
      RU-0024 の Source 2（worktree で plugins 分割が junction 未伝播により不在）は AG-003（QG-4 reference への運用注記明記）へ反映した。
      N:1 統合のとおり両 Source は同一ドメイン・同一明記先群（bun test 正規形の環境前提）であり、単一 REQ 行（REQ-060-006）と2箇所の実現面明記で一貫して扱う。
    evidence:
      path: src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
      section: 3 cwd 分割実行
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints:
    - RU-0026 が checker-execution-contracts.md の別節（checker 共通実行契約）を Design update で編集するため、同一 Wave への並列配置を避けて直列化する。
```

# summary

REQ-060 への APPEND（擬似 REQ-060-006、3 cwd 分割正規形の環境前提）と実現面2箇所（checker 実行契約 Design への依存解決前置一般原則明記、QG-4 reference「3 cwd 分割実行」節への worktree plugins 分割環境差運用注記明記）で構成する。
ルート package.json 追加は不採用（配布境界への影響評価が前提で影響大）とし、手順明記で完結する。
擬似採番 REQ-060-006 は case-open が決定的採番により確定する。
