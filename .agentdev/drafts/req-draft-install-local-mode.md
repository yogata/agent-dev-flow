---
draft_type: req_draft
topic_slug: install-local-mode
status: saved
created_at: 2026-06-24T00:00:00+09:00
source_rus: [RU-0008]
---

# draft-data

```yaml
work_type: feature
scale: standard

spec_actions_consumed:
  status: consumed
  consumed_at: 2026-06-24
  consumed_actions: [ACT-SPEC-001]

summary: >
  install-consumer-opencode.ps1 に local mode（consumer-generated）のリンク設定を追加する。
  local mode では agentdev-gh-cli のみ src/opencode-local/agentdev-gh-cli/ へ接続し、
  それ以外の command/skill は src/opencode/ 配下へ接続する（REQ-0103-158, ADR-0131 決定 #3）。
  設計判断として -LocalMode スイッチ拡張を採用し、別スクリプト新設は行わない。
  REQ-0103-158 は REQ-0134.md:38 の projection にのみ存在し REQ-0103.md 本体に source 記載がない
  （dangling reference）ため、REQ-0103.md へ source 要件を追記して ADR-0105 source/projection
  整合性を回復する。runtime-package-boundary SPEC へ link mode 接続手順の技術詳細領域を新設する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      install-consumer-opencode.ps1 は local mode（consumer-generated）のリンク設定をサポートし、
      agentdev-gh-cli のみ .agentdev-plugin/src/opencode-local/agentdev-gh-cli/ へ接続し、
      それ以外の command/skill は .agentdev-plugin/src/opencode/ 配下へ接続すること
      （REQ-0103-158, ADR-0131 決定 #3 準拠）。
  - id: AG-002
    content: >
      REQ-0103-158 を REQ-0103.md 本体の要件テーブルへ source 要件として追記し、REQ-0134.md の
      projection と source/projection 整合性（ADR-0105）を回復する。追記により dangling reference を解消する。
  - id: AG-003
    content: >
      runtime-package-boundary SPEC は link mode 接続手順の技術詳細領域を新設し、local mode の
      リンク構成（agentdev-gh-cli の差し替え接続先）、install-consumer-opencode.ps1 -LocalMode の契約、
      check-consumer-opencode.ps1 の local mode 検出条件を明文化すること。
  - id: AG-004
    content: >
      ローカル版導入がスクリプト1実行で完結すること。README の導入手順と推奨 .gitignore 設定が
      local mode に対応すること。check-consumer-opencode.ps1 が local mode のリンク状態を検出できること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0103.md
    target_area: 要件テーブル（REQ-0103-158 source 要件）
    source_items: [AG-002]
    content: |
      REQ-0103.md の要件テーブルへ REQ-0103-158 を source 要件として追記する。
      内容は REQ-0134.md:38 に既存の projection エントリと同一とし、source/projection 整合性を回復する。

      追記エントリ:
      | REQ-0103-158 | ローカル版では、agentdev-gh-cli 以外の command/skill を `src/opencode/` 配下へ接続し、`.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続すること（REQ-0150 参照） |

      備考: REQ-0103-155〜157, 159〜160 も同一パターンの dangling reference だが、本 draft の
      scope（install-local-mode）は REQ-0103-158 に限定し、他は別課題として扱う。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/runtime-package-boundary.md
    target_area: link mode 接続手順技術詳細
    source_items: [AG-003]
    content: |
      runtime-package-boundary.md へ link mode 接続手順の技術詳細領域を新設する。
      以下を明文化する:
      - local mode のリンク構成（agentdev-gh-cli のみ src/opencode-local/agentdev-gh-cli/ へ接続）
      - install-consumer-opencode.ps1 -LocalMode の入出力契約
      - check-consumer-opencode.ps1 の local mode リンク状態検出条件
      - link target 確認方式（ADR-0131 決定 #6 準拠）

conflict_resolutions:
  - id: CR-001
    conflict: >
      設計判断: install-consumer-opencode.ps1 へ -LocalMode スイッチを追加するか、
      別スクリプト（install-consumer-opencode-local.ps1）を新設するか未確定（RU-0008 Sources）。
    resolution: >
      -LocalMode スイッチ追加を採用。根拠: 既存 -Mode パラメータパターンと整合し、clone/update ロジックの
      重複を避け、README のエントリポイントを単一に保てる。ADR-0131 は link mode 統一を決定済みであり、
      スイッチ vs 別スクリプトは ADR-0131 の実装選択に過ぎない。ADR 候補として評価したが新規 ADR 不要と判断
      （ADR-0131 の実装詳細、将来の設計・運用・文書体系を制約しない局所判断）。
  - id: CR-002
    conflict: >
      REQ-0103-158 が REQ-0134.md:38 の projection にのみ存在し、REQ-0103.md 本体に source 記載がない
      （RU-0008 注意事項: dangling reference）。REQ-0103.md へ追記するか、参照元を整理するか未確定。
    resolution: >
      REQ-0103.md へ source 要件として追記する（APPEND）。ADR-0105 source/projection 分離では
      projection（REQ-0134）は source（REQ-0103.md）の投影であるため、source 側への追記が整合的。
      「参照元を整理する」（REQ-0134 を正とし RU-0008 の dangling 指摘を撤回）は採用しない。理由: 048〜077 等、
      REQ-0103.md に source が存在する projection エントリが多数ある一方で 155〜160 だけ source がない状態は
      非対称であり、source 追記による整合回復が一貫的。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_req: REQ-0103
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
```

# summary

install-consumer-opencode.ps1 へ local mode（consumer-generated）の agentdev-gh-cli リンク差し替えを追加する。RU-0008 が指摘する設計判断（-LocalMode スイッチ vs 別スクリプト新設）は -LocalMode スイッチで確定した。既存の -Mode パラメータ（dry-run/check/apply）パターンと整合し、clone/update ロジックの重複を避ける。

REQ-0103-158（ローカル版のリンク構成要件）は REQ-0134.md:38 の projection にのみ存在し REQ-0103.md 本体に source 記載がない dangling reference であった。REQ-0103.md へ source 要件を追記（APPEND）して ADR-0105 source/projection 整合性を回復する。155〜157, 159〜160 も同一パターンだが本 draft scope 外とし別課題扱いとする。

runtime-package-boundary SPEC へ link mode 接続手順技術詳細領域を新設し、install-consumer-opencode.ps1 -LocalMode と check-consumer-opencode.ps1 の契約を明文化する。check-consumer-opencode.ps1 の local mode 検出機能追加、README の local mode 導入手順と .gitignore 更新は case-open 実装作業となる。

ADR 候補（-LocalMode vs 別スクリプト）は評価の結果、新規 ADR 不要と判断した。ADR-0131（link mode 統一）の実装詳細であり、文書体系・運用モデルの根本変更に該当しない。
