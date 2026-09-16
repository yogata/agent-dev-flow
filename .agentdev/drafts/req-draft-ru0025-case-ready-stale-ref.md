---
draft_type: req_draft
topic_slug: ru0025-case-ready-stale-ref
status: draft
created_at: "2026-09-16T12:02:52+09:00"
source_rus: [RU-0025]
---

# draft-data

```yaml
work_type: maintenance
summary: "case-ready SKILL.md の移設残骸参照を実在する case-open 側実装へ解決可能な表現に修正し、解消済みの ng-baseline ReferencePath legacy エントリを同一変更で除去する。"
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |
      agentdev-workflow-case-ready SKILL.md L88 の `scripts/src/inspect_cross_dependencies.ts` は case-open へ移設された実装を case-ready 側ディレクトリから解決しようとする参照残骸である。スキル名による横断参照表現を維持しながら、実在する case-open 側実装へ正しく解決される表現へ修正し、配布物へ実行環境固有の絶対パスを直書きしない。full-audit の IR-062 reference-path-existence で baseline-known 検出が消失する状態を満たす。
  - id: AG-002
    content: |
      参照修正と同一変更で、`.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` の ReferencePath bucket にある対象 legacy エントリ（case-ready SKILL.md、evidence scripts/src/inspect_cross_dependencies.ts、provenance legacy）を除去する。解消済みの既知欠陥を baseline に残さず、baseline JSON の他エントリと構文を維持する。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    target_area: "要件テーブル（REQ-057-029 の後続。REQ-057-033 は擬似行番号）"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-057-033 | 配布 skill 本体の移設残骸参照は実在する参照先へ解決され、解消後の IR-062 reference-path-existence による baseline-known 検出は ng-baseline の ReferencePath bucket（provenance: legacy）から除去されること。case-ready SKILL.md の横断依存検査エンジン参照を対象とし、スキル名による横断表現を維持して実行環境固有の絶対パス直書きを導入しないこと |
conflict_resolutions:
  - id: CR-001
    conflict: "REQ-057-033 の行番号は現行最大行との関係で確定が必要。"
    resolution: "共有採番計画により REQ-057 の追加行は 030=ru0030、031/032=ru0033、034=ru0029、035=ru0026、036=ru0028 に割当済みのため、本 draft は 033 を使用する。REQ-057-033 は擬似行番号として使用し、case-open の決定的採番で確定する。"
  - id: CR-002
    conflict: "明示絶対パス化とスキル横断相対表現修正の選択。"
    resolution: "配布物への実行環境固有パス直書きを避けるため、スキル名による横断参照表現を正しく解決する修正を採用する。"
  - id: CR-003
    conflict: "指示にある src 側 baseline の存在。"
    resolution: "実ファイル照合で ng-baseline.json は `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` のみに存在したため、同ファイルだけを除去対象とする。repo-agentdev-integrity は repo-local・配布対象外である。"
  - id: CR-004
    conflict: "repo-local baseline が REQ-057 の対象列挙に明示されていない。また REQ-057-026（配布物本文の陳腐化した運用記述の残存禁止）および REQ-057-002（docs corpus の不存在参照の残存禁止）が近接する既存所有であるため、新規行 APPEND との重複所有検討が必要。"
    resolution: "REQ-057-026 は配布物本文の陳腐化運用記述全般の状態要件、REQ-057-002 は docs corpus の不存在参照全般の状態要件であり、いずれも本件が新規に所有する IR-062 reference-path-existence の baseline-known エントリ除去（REQ-057-024 は IR-055 限定で IR-062 を含まない）と対象ファイル特定の運用詳細を所有しないため、一般規定（既存行）と実行詳細（本行）の階層として重複所有とならない。REQ-057-024 の baseline 鮮度管理にも包含されない IR-062 baseline 除去の運用基準として REQ-057 への APPEND を維持する。"
operation_units:
  - ou_id: OU-001
    source_ru: RU-0025
    target_req: REQ-057
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
      repo root cwd で full-audit の IR-062 reference-path-existence を実行し、case-ready SKILL.md の参照行を確認する。修正後の表現が実在する `src/opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts` を指すことを実ファイル突合する。
    pass_criteria: |
      対象参照の baseline-known 検出が 0 件となり、SKILL.md に解決不能な参照残骸が残らない。既存 docs-check・full-audit に新規違反を生じない。
    on_failure: |
      fix-and-reverify を選択する。参照残骸の解消は本要件の中核であり、記録だけでは REQ-053-023 の品質契約を満たさないため、表現を修正して full-audit を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      ng-baseline.json の ReferencePath bucket を機械的に突合し、対象 file と evidence の legacy エントリが存在しないこと、JSON が checker に読み込めることを確認する。
    pass_criteria: |
      対象エントリだけが除去され、baseline の他エントリ・JSON 構造が維持される。full-audit 再実行で対象参照の baseline-known 検出が 0 件となる。
    on_failure: |
      fix-and-reverify を選択する。baseline の残存・誤除去・構文破損は検出ノイズの直接原因であるため、baseline を修正して再突合する。
realization_actions:
  - id: RA-001
    concern: "case-ready SKILL.md の横断依存検査エンジン参照修正"
    responsibility: "配布 skill 本体の参照整合を維持し、移設後の case-open 側実装へ解決可能な横断参照を保持する。"
    ownership_hints: ["src/opencode/skills/agentdev-workflow-case-ready/SKILL.md L88", "src/opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts", "REQ-053-023、IR-062 reference-path-existence"]
    intent: "解決不能な移設残骸参照と baseline-known 検出を解消する。"
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: "ng-baseline ReferencePath legacy エントリ除去"
    responsibility: "解消済み参照の既知欠陥 baseline を更新し、解消後の検出を隠す残置を防ぐ。"
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json L1645-L1652", "ReferencePath / provenance: legacy", "REQ-057-024 baseline 鮮度管理"]
    intent: "修正済み参照に対応する baseline エントリを除去し、検査結果を現行状態へ合わせる。"
    verification_refs: [TS-002]
    source_items: [AG-002]
review_dispositions:
  - id: RD-001
    source_ru: RU-0025
    source_item: RU-0025:case-ready-skill-stale-ref
    disposition: covered
    reason_code: promoted_to_agreed_item
    reason: "参照修正と baseline エントリ除去を AG-001/AG-002、RA-001/RA-002、TS-001/TS-002 へ反映した。"
    evidence: {path: .agentdev/backlog/req-units/RU-0025.md, section: Sources, checked_at_commit: null}
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

変更誘発境界リスクは、dependency（SKILL.md の参照修正を baseline 除去に先行させ、解消済み状態を確認してから baseline を更新する順序を確認済み）、client-server（case-ready が参照する case-open 側の単一実装と、参照表現を保持する SKILL.md の責務境界を確認済み）、execution（full-audit の reference-path-existence と baseline 突合を順に実行する検証境界を確認済み）、build-runtime（JSON baseline の構文と checker 読込を維持し、参照修正による integrity 検査回帰を検出する境界を確認済み）、environment-propagation（src/opencode の正本と `.opencode` 投影、repo-local baseline の配置差を確認済み）の5観点すべてを確認した。参照修正と baseline 更新は単一成果物・単一論点であり、REQ-057-033 の1行として構成する。SPLIT 要否: 不要。
