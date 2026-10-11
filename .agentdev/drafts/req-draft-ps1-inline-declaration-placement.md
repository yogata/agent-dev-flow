---
draft_type: req_draft
topic_slug: ps1-inline-declaration-placement
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0012
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  .ps1 ファイルの inline ADF-COVERS 宣言コメントの運用位置づけを「撤去（sidecar 正規配置への集約）」に
  確定し、宣言配置規約（inline 宣言の走査対象は .md / .ts のみであり、対象外拡張子ファイルの対応宣言は
  sidecar へ宣言する。対象外拡張子ファイル内の ADF-COVERS 形式コメントを正規対応宣言として扱わない）を
  checker 実行契約 Design へ明文化する。既存の scripts/install.ps1・scripts/self-sync.ps1 の inline 宣言
  コメント（runtime-package-boundary.md 側への移管を注記するコメントを含む）を撤去する。
  REQ-050・REQ-058 系 REQ 行の機械検査充足は Case #3605 で追加済みの sidecar 宣言
  （traceability/installer-host-projection.yaml）で維持される。トレーサビリティ走査スコープ
  （DEFAULT_SCAN_EXTENSIONS = .md / .ts）と check エンジンの判定ロジックは変更しない。REQ 行の新設は
  行わない（RU-0012 の対象外宣言どおり規約明確化のみ）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      宣言配置規約の明文化（RU-0012 受け入れ条件 (2)）。checker 実行契約 Design（検出対象除外規定節の
      近傍）へ次を規定する: inline 宣言の走査対象は拡張子 .md / .ts のファイルのみであり（現行の走査
      対象方針の維持）、対象外拡張子のファイル（.ps1 等のスクリプト）の implementation / design 対応は
      top-level traceability/ 配下の sidecar へ宣言する。対象外拡張子ファイル内の ADF-COVERS 形式
      コメントは正規の対応宣言として扱わず、新規に配置しない。
  - id: AG-002
    content: |
      .ps1 inline 宣言コメントの撤去（RU-0012 受け入れ条件 (1)）。scripts/install.ps1・scripts/
      self-sync.ps1 に現存する inline ADF-COVERS(implementation) コメント（runtime-package-boundary.md
      側への移管を注記するコメントを含む）を撤去する。当該コメントが担当していた REQ 行（REQ-050-015、
      REQ-058-001/004/005/006/008/012）の機械検査上の充足は、Case #3605 で case-run 側が追加した sidecar
      （traceability/installer-host-projection.yaml）の implementation 宣言（7 行）で既に成立しており、
      撤去により機械検査の充足状態は変化しない（RU-0012 受け入れ条件 (3)）。撤去により宣言の二重管理
      （Design .md 側宣言・sidecar・.ps1 コメント）が解消され、rename・移動時の追随漏れの温床を除去する。
      関連観察（本 Case の対象外）: 本 draft 作成時の実測で、撤去対象 2 ファイル以外にも対象外拡張子
      ファイル内の ADF-COVERS 形式コメントが現存する（scripts/consumer/common.ps1、
      scripts/self/release/package-release-archive.ps1、scripts/self/release/trusted-distribution-gate.ps1、
      scripts/consumer/archive/install.ps1、拡張子なしファイル scripts/self/supervisor-bridge/opencode・
      ocenv）。RU-0012 の対象範囲（install.ps1・self-sync.ps1）を超えるため本 Case では処置せず、
      AG-001 の規約適用の残存ギャップとして記録し、将来の intake/inspect 対象とする。

conflict_resolutions:
  - id: CR-001
    conflict: |
      解消方向の選択。(a) トレーサビリティ走査スコープを拡張し（DEFAULT_SCAN_EXTENSIONS へ .ps1 を追加）
      .ps1 inline 宣言を機械検査に反映する、(b) 宣言配置規約として sidecar 正規配置への集約を明示し
      .ps1 inline コメントを撤去する、の二方向が取り得る。
    resolution: |
      (b) を採用する。根拠: (a) は Design .md 側宣言・sidecar・.ps1 コメントの三重管理を温存し、
      rename・移動時の追随漏れの温床が残る。また走査コーパスの拡大は宣言解析対象の増加を伴う。
      (b) は Case #3605 の実解決（sidecar 追加で機械検査充足）と整合し、正規配置を sidecar の単一へ
      収束させる。あわせて checker 実行契約 Design の既存規定（「inline declaration の走査対象拡張子は
      現行の .md、.ts を維持する。inline declaration は producer-only serialization であり、対応関係の
      完全性判定は sidecar を正規情報源として行う」）が sidecar 正規情報源の原則を既に定めており、
      本方向はこの既存規定の自然な帰結である。走査スコープ・check エンジンの判定ロジックは現行維持であり、
      RU-0012 の対象外（check エンジン本体の判定ロジック変更。走査スコープ選択時の拡張子定義変更を除く）
      との関係では走査スコープ変更を行わないため対象外どおりとなる。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: 検出対象除外規定
    source_items: [AG-001]
    content: |
      検出対象除外規定節へ宣言配置規約を追記する: inline 宣言の走査対象は拡張子 .md / .ts の
      producer-only artifact のみであり（現行の走査対象方針を維持）、対象外拡張子のファイル（.ps1 等）の
      implementation / design 対応は top-level traceability/ 配下の sidecar へ宣言する。対象外拡張子
      ファイル内の ADF-COVERS 形式コメントは正規の対応宣言として扱わず、新規に配置しない。既存の
      対象外拡張子ファイル内の同形式コメントは sidecar 宣言への集約後に撤去する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0012
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      修正後の checker 実行契約 Design（docs/designs/integrity/checker-execution-contracts.md）を対象に、
      検出対象除外規定節へ宣言配置規約（対象外拡張子の対応は sidecar へ、対象外拡張子の ADF-COVERS
      形式コメントを正規宣言として扱わない）の追記があることを機械的検索（rg）と全文読取で確認する。
      あわせて走査スコープの現行記述（.md / .ts）が変更されていないことを確認する。
    pass_criteria: |
      宣言配置規約の追記が存在し、走査対象方針（.md / .ts のみ）が現行のまま維持されていること。
    on_failure: |
      fix-and-reverify。規約の欠落・走査スコープの意図しない変更を検出した場合は修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      (1) 機械的検索（rg 'ADF-COVERS'）で scripts/install.ps1・scripts/self-sync.ps1 から inline 宣言
      コメントが撤去されていることを確認する。検索の網羅範囲は撤去対象の 2 ファイル
      （scripts/install.ps1、scripts/self-sync.ps1）と修正対象列挙（RA-001）を一致させる。履歴文書
      （docs/reports/）・参照行・AG-002 の関連観察に記録した他ファイルは検出対象外とする。
      (2) トレーサビリティ check（--root <repo-root>）を実行し、REQ-050-015、
      REQ-058-001/004/005/006/008/012 の missing-implementation が 0 件であること（sidecar 宣言で充足
      維持）を確認する。
    pass_criteria: |
      撤去対象 2 ファイルから ADF-COVERS 宣言コメントが消失しており（2 ファイルの該当検索 0 件）、
      撤去後に REQ-050・REQ-058 系の対象行の missing-implementation が 0 件を維持していること。
    on_failure: |
      fix-and-reverify。撤去漏れ、または sidecar 宣言の不足により missing-implementation が発生した場合は
      sidecar 宣言の追加・コメント撤去の完了を行ってから再実行して確認する（正規配置への集約を前提とし、
      .ps1 inline への戻しでは解消しない）。

realization_actions:
  - id: RA-001
    concern: scripts/install.ps1・scripts/self-sync.ps1 の inline ADF-COVERS 宣言コメント撤去
    responsibility: >
      導入系スクリプト（公開入口 2 本固定の scripts 配下 .ps1）。inline ADF-COVERS(implementation)
      コメントと runtime-package-boundary.md 側への移管注記コメントを撤去する。
    ownership_hints:
      - "scripts/install.ps1（inline ADF-COVERS 宣言コメントの現存を実測確認）"
      - "scripts/self-sync.ps1（同上）"
      - "正規配置: traceability/installer-host-projection.yaml（Case #3605 で追加の implementation 宣言 7 行）"
      - "規約の正: docs/designs/integrity/checker-execution-contracts.md 検出対象除外規定節（ACT-DESIGN-001 で追記）"
    intent: >
      宣言の二重管理（Design .md 側宣言・sidecar・.ps1 コメント）による rename・移動時の追随漏れの温床を
      除去し、宣言の正規配置を sidecar の単一に収束させる。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0012
    source_item: RU-0012
    disposition: covered
    reason_code: covered
    reason: |
      .ps1 inline 宣言の運用位置づけ確定（撤去）と宣言配置規約の明文化を AG-001 / AG-002 +
      ACT-DESIGN-001（checker 実行契約 Design）+ RA-001（.ps1 コメント撤去）で採用。受け入れ条件
      (1)(2)(3) を TS-001 / TS-002 で検証。方向選択（走査スコープ拡張 vs sidecar 集約）の判断を CR-001 に
      記録。対象外（REQ 行の新設、check エンジン本体の判定ロジック変更）を AG-001・summary に反映。
    evidence:
      path: src/common/skills/agentdev-traceability/scripts/lib/corpus.ts
      section: DEFAULT_SCAN_EXTENSIONS（L29。.md / .ts のみであることと .ps1 が走査対象外であることを実測確認）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0012 を単独 Case として処理する。.ps1 inline ADF-COVERS 宣言の運用位置づけを「撤去（sidecar 正規
配置への集約）」に確定し、宣言配置規約を checker 実行契約 Design へ明文化する。走査スコープ（.md / .ts）
と check エンジンは現行維持とし、REQ-050・REQ-058 系の機械検査充足が sidecar 宣言で維持されることを
撤去後の check 実行で確認する。方向選択の根拠（走査スコープ拡張の不採用）は CR-001 に記録した。
