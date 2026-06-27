---
draft_type: req_draft
topic_slug: docs-integrity-maintenance
status: saved
created_at: 2026-06-27T00:00:00+09:00
source_rus:
  - RU-0008
  - RU-0009
  - RU-0010
  - RU-0012
  - RU-0013
  - RU-0014
---

# draft-data

```yaml
work_type: maintenance

summary: |
  AgentDevFlow の文書整合性・ツール検出精度・worktree並列安全性を一括で保守する。
  対象は req-units RU-0008〜RU-0015 のうち処理対象6件（RU-0011解消済み除外、RU-0015懸念不成立で除外）。
  内訳は2件の既存REQ UPDATE（RU-0008: REQ-0145へ実装要件追記、RU-0014: REQ-0144へF-2解決要件追記）、3件の既存規範横展開適用（RU-0009: docs/requirements/操作主体明示・SPEC移送、RU-0010: X-7 SPEC残作業完了確認、RU-0013: docs/guides/・src/opencode/skills/構造整形）、1件の技術spike（RU-0012: case-close post-merge worktree隔離設計の破綻事例調査）。
  RU-0012はOracle分析により現設計がADR-0125+REQ-0137の意図的トレードオフであることが判明。設計変更要件の定義前に技術spikeで破綻有無を判定する。
  全件 ADR不要（RU-0012はspike結果で条件付きADR候補）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      check_integrity.ts の isBehaviorPredicateContext 関数に、件数・内容規定を含む行の exemption を拒否する予防的ガード句を追加する。
      SPEC IR-044 は「件数・内容規定を含む場合は免除しない」を既に規定済み（REQ-0145-002/012、REQ-0108-259/262）だが、実装レベルのガード句要件が未カバー。
      REQ-0145 に実装要件を追記し、isBehaviorPredicateContext に件数・内容規定検出時の exemption 拒否ロジックを要件化する。
      優先度は低（偽陰性未観測）。

  - id: AG-002
    content: |
      docs-check の安定NG F-1（req-range陳腐化）を解消する。
      REQ-0144-007 は docs/guides/*.md と vocabulary-registry.md の実REQ最大番号追従要件（時点REQ-0151）を規定済み。
      F-1 は追従先のREQ番号が陳腐化していることが根因。
      REQ-0144-007 の時点REQ番号を最新（REQ-0155）に更新する運用要件を明記し、docs-check の検出ロジックが最新REQ番号を動的に参照するよう是正する。

  - id: AG-003
    content: |
      docs-check の安定NG F-2（command-capture-duty keyword不在）の根因を特定し、解消する。
      整合性ルールカタログ（IR-001〜IR-054）および intake-capture SPEC に command-capture-duty ルールが存在しない。
      docs-check が期待するキーワードが未定義であることが根因候補。
      REQ-0144 にF-2解決要件を追記し、command-capture-duty の定義（新規ルール化または既存ルールへの統合、または docs-check 検出ロジックの陳腐化判定）を確定する。

  - id: AG-004
    content: |
      docs/requirements/ 配下の39 REQ + README について、以下の既存規範を横展開適用する。
      - REQ-0140-028（操作主体明示）: 各REQの要件行に操作主体（command/skill/subagent/harness）を明示する。
      - REQ-0140-029（件数排除）: 件数規定をSPECへ移送する。docs/requirements/README.md は索引表形式のため操作主体明示の対象外とする。
      - REQ-0101-055/067/068（SPEC移送）: SPEC分離基準に該当する要件行をSPECへ移送する。
      新規REQの定義ではなく、既存規範の適用作業である。

  - id: AG-005
    content: |
      X-7 backticks SPEC（status: accepted、2026-06-25確定）の残作業を完了する。
      残作業は以下の3件。
      - 完全カタログ再生成: backticks識別子閾値ルールの全カタログを再生成する。
      - X-2本文是正: X-2 backticks SPEC の本文を是正する。
      - X-7残存件数確定: 再grep で X-7 違反が0件であることを証明する。
      完了証明は REQ-0153-001/002（再grep 0件証拠の完了条件化とPR本文記載）に基づき実施する。
      Issue #1118 完了条件 AG-008〜AG-012 の最終受け入れ判断を含む。

  - id: AG-006
    content: |
      docs/guides/ + src/opencode/skills/ について、以下の既存規範を横展開適用する。
      - REQ-0140-003/019（アクター明示）: SUB-B-1 アクター明示を完了する。
      - REQ-0140-031（SKILL.md概要節/機能節役割分担）: SUB-C SKILL.md役割分担を完了する。
      - REQ-0155-001（SPEC 5論理区分）: SUB-B-2 概念分割を完了する。
      - REQ-0155-003（文書7分類）: 文書分類の妥当性を検証する。
      新規REQの定義ではなく、既存規範の適用作業である。

  - id: AG-007
    content: |
      case-close post-merge Steps 9-11 のworktree隔離設計について、技術spikeを実施し現設計の破綻有無を判定する。
      Oracle分析（bg_135d2892）の結論: 現設計はADR-0125がcase-closeの安全性をREQ-0137（明示パスcommit規律）に意図的に委譲しており、「設計缺口」ではなく「意図的トレードオフ」の可能性が高い。
      REQ-0137は「並列実行のスケジューリング、プロセスロック機構そのものの実装」を明示的に対象外としている。ADR-0129は「複数case-close並列書き込みの複雑化」をネガティブ影響として認識済みだがper-body単一書き手で受容。
      本spikeの目標: 並列case-close競合シナリオを実証実験し、現設計（REQ-0137明示パス + Step 9-1検出）が実際に破綻するか（データ損失、巻き込みコミット、原子性破壊の発生有無）を判定する。
      判定結果で分岐:
      - 現設計十分 → ADR-0129ネガティブ影響に「現REQ-0137で緩和済み」を追記して終了。設計変更不要。
      - 破綻発見 → 新規ADR候補（case-close post-merge並列安全性モデル、relates-to ADR-0125/0128/0129）として別途req-define再入。設計方向は(a)case worktree lifecycle延長、(b)post-merge専用worktree新設、(c)協調/ロック機構のいずれかを破綻内容に基づき選定。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0145
    source_items: [AG-001]
    content: |
      REQ-0145 に以下の実装要件を追記する。

      ## check_integrity.ts exemption 境界の実装要件

      isBehaviorPredicateContext 関数は、件数・内容規定を含む行の exemption を拒否する予防的ガード句を実装すること。
      SPEC IR-044（REQ-0145-002/012、REQ-0108-259/262）で規定済みの「件数・内容規定を含む場合は免除しない」を、実装レベルで保証する。
      検出対象: 件数表現（「N件」「N個」等）または内容規定（具体要件の列挙、数量制限）を含む行。
      ガード句は exemption 判定前にこれらの表現を検出し、該当行を exemption 対象外とすること。
      優先度は低（偽陰性未観測）。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0144
    source_items: [AG-002, AG-003]
    content: |
      REQ-0144 に以下の安定NG解決要件を追記する。

      ## docs-check 安定NG解決要件

      ### F-1: req-range 陳腐化解消

      REQ-0144-007 の時点REQ番号を最新（REQ-0155）に更新する運用要件を明記する。
      docs-check の req-range 検出ロジックは、docs/guides/*.md と vocabulary-registry.md に記載の時点REQ番号を動的に参照し、実REQ最大番号と照合すること。
      時点REQ番号が実REQ最大番号より古い場合、安定NGとして検出すること。
      時点REQ番号の更新は新規REQ確定時（req-save 完了後）に自動追従する仕組みを検討する。

      ### F-2: command-capture-duty keyword 不在解消

      docs-check が期待する command-capture-duty キーワードの根因を特定し、以下のいずれかで解消すること。
      1. command-capture-duty ルールを整合性ルールカタログ（IR-001〜IR-054）に新規定義する。
      2. 既存ルール（intake-capture 関連）へ統合する。
      3. docs-check の検出ロジックが陳腐化している場合、当該検出を廃止または修正する。
      根因特定は実装修復作業の最初のステップとし、特定結果に基づいて上記いずれかを採用する。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0011（session-context-detection.md orphan参照）の処理方針
    resolution: |
      PR #1279（Issue #1251）で既に orphan 解消済み。
      SKILL.md L133 に references/session-context-detection.md への明示参照が存在。
      要件化不要、除外確定（ユーザー同意済み）。

  - id: CR-002
    conflict: RU-0012（worktree隔離設計）の処理方針
    resolution: |
      当初は別セッション切り出し（ユーザー判断b）としていたが、ユーザー判断により同一セッション組み込みに変更。
      Oracle分析（bg_135d2892）の結果、現設計はADR-0125+REQ-0137の意図的トレードオフであり「設計缺口」ではない可能性が高い。
      設計変更要件の定義前に技術spike（AG-007）で破綻有無を判定する方針。
      spike結果で破綻発見時は新規ADR候補として別途req-define再入。

  - id: CR-003
    conflict: RU-0015（vocabulary-registry.md パス不整合）の処理方針
    resolution: |
      explore grep 結果、src/opencode/skills/ 配下で vocabulary-registry.md を言及する文档は存在しない。
      docs/ 配下9ファイル（IR-050, IR-051, integrity-rule-catalog.md, integrity-contracts.md, ADR-0106.md, artifact-responsibilities.md, REQ-0144.md等）は正規パス（.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md）で正しく参照。
      ADR-0106（repo-local namespace）で repo-local として扱われる。
      パス不整合の懸念は不成立。残るは PR #1287 cp932 文字化けの再解釈（L267周辺確認）のみ。
      除外候補（Step 11 でユーザー確認予定）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_req: REQ-0145
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_req: ["REQ-0145"]
      artifact_action: "ACT-REQ-001"
      source_items: ["AG-001"]
      operation: "update"
      added_requirement_ids: ["REQ-0145-013"]

  - ou_id: OU-002
    source_ru: RU-0009
    target_req: REQ-0140  # 規範源REQ。docs/requirements/配下39 REQへの規範横展開適用（REQ-0140自体の変更ではない）
    operation: update
    scale: large
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}

  - ou_id: OU-003
    source_ru: RU-0010
    target_req: REQ-0153  # 完了証明基準REQ。X-7 SPEC残作業の完了確認（REQ-0153自体の変更ではない）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-004
    source_ru: RU-0013
    target_req: REQ-0140  # 規範源REQ。docs/guides/+src/opencode/skills/への規範横展開適用（REQ-0140自体の変更ではない）
    operation: update
    scale: large
    depends_on: []
    recommended_order: 5
    issue_policy: epic
    result: {}

  - ou_id: OU-005
    source_ru: RU-0014
    target_req: REQ-0144
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      saved_req: ["REQ-0144"]
      artifact_action: "ACT-REQ-002"
      source_items: ["AG-002", "AG-003"]
      operation: "update"
      added_requirement_ids: ["REQ-0144-018", "REQ-0144-019"]

  - ou_id: OU-006
    source_ru: RU-0012
    target_req: REQ-0137  # 調査対象REQ（REQ-0137自体の変更ではなく、現設計の破綻有無検証）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-0145 に実装要件が追記されたことを確認する。
      check_integrity.ts の isBehaviorPredicateContext に件数・内容規定検出時の exemption 拒否ロジックが実装されたことを確認する。
      既存テストケースに「件数・内容規定を含む行」のテストを追加し、exemption が拒否されることを検証する。
    pass_criteria: |
      件数・内容規定を含む行が exemption 対象外となること。
      既存の exemption 対象ケースが回帰しないこと。
      check_integrity.ts のユニットテストが全件成功すること。
    on_failure: |
      fix-and-reverify（実装不良のため。ガード句ロジックを修正して再検証する）。

  - id: TS-002
    target_item: AG-002
    verification: |
      docs-check の req-range 検出が最新REQ番号（REQ-0155）を参照していることを確認する。
      docs/guides/*.md と vocabulary-registry.md の時点REQ番号が更新されていることを確認する。
      docs-check 実行時、F-1 が検出されないことを確認する。
    pass_criteria: |
      docs-check 実行時、F-1（req-range陳腐化）が検出されないこと。
      req-range が最新REQ番号を動的に参照していること。
      docs-check の安定NGが0件となること。
    on_failure: |
      fix-and-reverify（検出ロジックの修正のため。req-range 参照先を修正して再検証する）。

  - id: TS-003
    target_item: AG-003
    verification: |
      command-capture-duty の根因が特定されたことを確認する。
      整合性ルールカタログまたは intake-capture SPEC に定義が追加されたこと、または docs-check 検出ロジックが修正されたことを確認する。
      docs-check 実行時、F-2 が検出されないことを確認する。
    pass_criteria: |
      docs-check 実行時、F-2（command-capture-duty keyword不在）が検出されないこと。
      command-capture-duty の扱いがドキュメント化されていること（新規定義、統合、または廃止）。
      docs-check の安定NGが0件となること。
    on_failure: |
      fix-and-reverify（根因特定後、修正のため。特定結果に基づき定義追加または検出ロジック修正して再検証する）。

  - id: TS-004
    target_item: AG-004
    verification: |
      docs/requirements/ 配下の39 REQ について、各要件行に操作主体が明示されていることを確認する。
      件数規定がSPECへ移送されていることを確認する。
      README が索引表形式で操作主体明示対象外であることを確認する。
      SPEC分離基準に該当する要件行がSPECへ移送されていることを確認する。
    pass_criteria: |
      REQ-0140-028（操作主体明示）が全39 REQ に適用されていること。
      REQ-0140-029（件数排除）が適用され、件数規定がSPECへ移送されていること。
      README が操作主体明示対象外として妥当に扱われていること。
      REQ-0101-055/067/068（SPEC移送）が適用されていること。
    on_failure: |
      fix-and-reverify（適用漏れの修正のため。未適用箇所を特定して修正し再検証する）。

  - id: TS-005
    target_item: AG-005
    verification: |
      完全カタログが再生成されていることを確認する。
      X-2本文が是正されていることを確認する。
      X-7残存件数が再grep 0件で確定されていることを確認する。
      REQ-0153-001/002 の完了証明がPR本文に記載されていることを確認する。
    pass_criteria: |
      X-7 backticks SPEC の残作業3件が完了していること。
      再grep で X-7 違反が0件であることが証明されていること。
      Issue #1118 AG-008〜AG-012 の受け入れ基準を満たしていること。
      完了証拠がPR本文に記載されていること。
    on_failure: |
      fix-and-reverify（残作業の完了のため。未完了項目を特定して完了させ再検証する）。

  - id: TS-006
    target_item: AG-006
    verification: |
      docs/guides/ + src/opencode/skills/ について、各文書にアクターが明示されていることを確認する（SUB-B-1）。
      概念分割が妥当に行われていることを確認する（SUB-B-2）。
      SKILL.md の概要節と機能節の役割分担が完了していることを確認する（SUB-C）。
      SPEC 5論理区分と文書7分類の妥当性を確認する。
    pass_criteria: |
      REQ-0140-003/019（アクター明示）が適用されていること（SUB-B-1完了）。
      REQ-0155-001（SPEC 5論理区分）が適用されていること（SUB-B-2完了）。
      REQ-0140-031（SKILL.md役割分担）が適用されていること（SUB-C完了）。
      REQ-0155-003（文書7分類）の妥当性が確認されていること。
    on_failure: |
      fix-and-reverify（適用漏れの修正のため。未適用箇所を特定して修正し再検証する）。

  - id: TS-007
    target_item: AG-007
    verification: |
      並列case-close競合シナリオの実証実験を実施する。
      実験内容: 複数のcase-closeが同時にmain worktreeでSteps 9-11を実行する状況を再現し、以下を検証する。
      - REQ-0137-002/003（明示パスステージング）が競合を防止できるか
      - Step 9-1（重複ファイルチェック再実行）が並列セッションの未コミット変更を検出できるか
      - G17（明示パスステージング、.agentdev/限定スコープ）が他パスを巻き込まないか
      - データ損失、巻き込みコミット、原子性破壊の発生有無
      実験結果を記録し、現設計の破綻有無を判定する。
    pass_criteria: |
      以下のいずれかが明確に判定されていること:
      (A) 現設計十分: REQ-0137 + Step 9-1で競合が防止され、破綻なし。この場合、設計変更不要と判定。
      (B) 破綻発見: 特定の競合シナリオでデータ損失/巻き込みコミット/原子性破壊が発生。この場合、破綻内容と推奨設計方向を記録。
      いずれの場合も実証証拠（実験ログ、再現手順）をPR本文のFindingsに記録すること。
    on_failure: |
      record-in-findings（spike結果が不明確な場合、Findingsにout-of-scopeとして記録し、別途req-define再入で設計方向を確定する）。

case_open_hints:
  epic_needed: true
  decomposition:
    - ou_id: OU-002
      ru_id: RU-0009
      description: docs/requirements/ 配下39 REQ + README の文書構造整形（操作主体明示・SPEC移送・件数排除）。Epic規模。
      related_ou: OU-004
      related_note: RU-0013（docs/guides/・src/opencode/skills/構造整形）と同じ文書整形の横展開作業。推奨実行順は独立だが、作業手法の共通化を推奨。
    - ou_id: OU-004
      ru_id: RU-0013
      description: docs/guides/ + src/opencode/skills/ の構造的整形（アクター明示・概念分割・SKILL.md役割分担）。Epic規模。
      related_ou: OU-002
      related_note: RU-0009（docs/requirements/文書整形）と同じ文書整形の横展開作業。
  wave_hints:
    - wave: 1
      ou_ids: [OU-003]
      note: RU-0010 X-7 SPEC完了確認。最も独立しており、先行実施可能。
    - wave: 2
      ou_ids: [OU-001, OU-005]
      note: RU-0008（REQ-0145 UPDATE）と RU-0014（REQ-0144 UPDATE）。REQ変更を伴う、req-save経由。
    - wave: 3
      ou_ids: [OU-002, OU-004]
      note: RU-0009とRU-0013の横展開作業（Epic）。最後に実施。作業手法の共通化を推奨。
    - wave: 4
      ou_ids: [OU-006]
      note: RU-0012 技術spike（並列case-close競合シナリオ実証）。独立した調査タスク、他OUと依存なし。spike結果で設計変更要否が分岐。
```

# summary

## 処理対象と判定結果

本ドラフトは req-units RU-0008〜RU-0015 のうち、処理対象6件を構造化した成果物。

### 除外2件

| RU | 除外理由 |
|----|---------|
| RU-0011 | 解消済み（PR #1279 / Issue #1251）。要件化不要 |
| RU-0015 | 懸念不成立（src/opencode/skills/配下にvocabulary-registry.md言及文档なし）。PR #1287 cp932再解釈のみ残る |

### 処理対象6件

| RU | 判定 | work_type | scale |
|----|------|-----------|-------|
| RU-0008 | REQ-0145 UPDATE（実装要件追記） | maintenance | standard |
| RU-0009 | 既存規範適用（REQ-0140/0101） | maintenance | large（Epic） |
| RU-0010 | 既存規範適用（REQ-0153、完了確認） | maintenance | standard |
| RU-0012 | 技術spike（worktree隔離設計の破綻事例調査） | maintenance | standard |
| RU-0013 | 既存規範適用（REQ-0140/0155） | maintenance | large（Epic） |
| RU-0014 | REQ-0144 UPDATE（F-2解決要件追記） | maintenance | standard |

### ADR判断

RU-0008/0009/0010/0013/0014: ADR不要。既存アーキテクチャ変更なし、既存ADRとの衝突なし。
RU-0012: Oracle分析（bg_135d2892）の結果、現設計はADR-0125+REQ-0137の意図的トレードオフ。技術spike（AG-007）で破綻有無を判定後、破綻発見時に新規ADR候補として別途req-define再入。

### 後続コマンド

artifact_actions に artifact: req entry（ACT-REQ-001, ACT-REQ-002）が含まれるため、req-save が実行される。REQ-0145 と REQ-0144 の UPDATE を保存後、case-open で6件の operation_units を Issue化する。

RU-0009（OU-002）と RU-0013（OU-004）は epic_needed: true。case-open で Epic Issue を起票する。
RU-0012（OU-006）は技術spikeタスク。spike結果で設計変更要否が分岐する。
