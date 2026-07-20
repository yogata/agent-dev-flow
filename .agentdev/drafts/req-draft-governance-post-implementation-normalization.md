---
draft_type: req_draft
topic_slug: governance-post-implementation-normalization
status: saved
created_at: 2026-07-20T15:00:00+09:00
source_rus:
  - RU-20260720-01
spec_consumed: true
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  ガバナンス統合再編後の恒久文書純化と完了状態の是正。
  ガバナンス統合再編工程で使用した一時的な識別子（Phase、Wave、AG、CR、ACT、TS、Issue/PR 番号、RU 番号、intake ファイル名、一時的な検出件数、作業計画）が、現行 REQ、accepted ADR、accepted SPEC の本文へ混入していることを是正する。
  併せて、SC-002（索引類自動生成 SPEC）の内部矛盾（実装対象外宣言と Phase C〜E 実装記述の併存、Phase E 完了宣言と未対応領域の併存）、SC-003（監査台帳ライフサイクル SPEC）の今回固有監査運用の恒久化、ADR-0127 の重複・矛盾・実装詳細残留、ADR-0134 の status 未確定（proposed 残留）、SKILL.md の DERIVE 表明過大を解消する。
  新規要件の追加ではなく、既存の REQ-0101-043〜060、REQ-0102-006/007、REQ-0162-007/008 の強制適用および既存 REQ/ADR/SPEC の本文純化が主眼。複数 REQ/SPEC/ADR を横断し、全 SKILL.md 横断スキャンを伴うため Epic 規模とし、6 操作単位（OU-001 横断純化、OU-002 SC-002 正常化、OU-003 SC-003 統合、OU-004 ADR 体系正常化、OU-005 SKILL 原本参照正常化、OU-006 派生文書確認）へ分解する。
  依存順序として OU-001 を先行 Wave で実施し、検出結果に基づいて OU-002〜OU-005 を処理し、最後に OU-006 を実施する。新規 REQ を1件追加してまとめるのではなく、既存 REQ・ADR・SPEC の正規所有者へ変更を配分する構成とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      現行 REQ、accepted ADR、accepted SPEC の本文は、現在の恒久基準として成立するために必要な情報のみを保持し、再編工程、監査、移行作業に固有の識別子を含まない。
      対象識別子は Phase、Wave、AG、CR、ACT、TS、Issue 番号、PR 番号、RU 番号、intake/learning 個別ファイル名、一時的な検出件数（NG/WARNING 件数等）、作業計画、実施順序、作業完了の証拠、将来の実装計画、既に完了した導入段階である。
      例外として、現在契約そのものを識別するために不可欠な正式 ID（REQ-NNNN、ADR-NNNN、SC-NNN、IR-NNN 形式）は保持する。
      履歴情報は git 履歴、Issue、PR、retired 文書または作業記録で保持し、現行基準の本文では扱わない。
      適用対象は docs/requirements/REQ-*.md、docs/adr/ADR-*.md（accepted のみ）、docs/specs/**/*.md（accepted のみ）の全文とする。
  - id: AG-002
    content: |
      docs/specs/integrity/index-auto-generation.md（SC-002）は、導入計画ではなく現在稼働している索引生成契約として再構成する。
      再構成にあたり Phase A〜E という導入履歴自体を削除し、現在契約として次の4点を定義する。
      - 現在 AUTOGEN されている領域（frontmatter 由来で機械生成される件数、一覧、ステータス別ビュー等）。
      - 現在人手管理されている領域（導出規則未確定、混合領域、人手判断を含む領域）。
      - 各領域の正規情報源（frontmatter、各文書本文のセクション構造、宣言等）。
      - 人手管理領域に対する整合性確認方法（docs-check による検出、人手レビュー等）。
      再構成後の SC-002 は以下を満たす。
      - 生成スクリプトが存在する現在状態を frontmatter 由来で記述する。
      - IR-061 による検査契約を現在形で記述する。
      - 「実装は対象外」「本 SPEC は Phase B 成果物」等の旧状態、Phase A〜E の導入履歴、完了宣言を現在契約から除去する。
      - Phase E または「全索引展開完了」を名乗らない。未対応領域が残る限り完了扱いしない。
      - 5領域は現在契約上の人手管理領域として確定する。「永久に自動化しない」決定ではなく、「現在実装されていない機能を実装済み契約として扱わない」決定である。将来、導出規則と生成機構を別要件で確定すれば SC-002 を更新できる。
      5領域の扱い:
      - ADR README トピック別ビュー: 人手管理
      - ADR README Decision Map: 人手管理
      - ADR README 関連 REQ 表: 人手管理
      - docs/specs/README.md: 人手管理または既存生成部分のみ AUTOGEN
      - docs/requirements/mapping-table.md: 人手判断を含むため人手管理
      - 自動生成対象、生成元、人手編集領域、検査方法を一意に定める。
  - id: AG-003
    content: |
      docs/requirements/REQ-0162.md（配布物の harness 実行制御分離）は、配布物と harness の責務境界および最終的に満たすべき配布物状態だけを保持する要件へ縮約する。
      以下の作業識別子を REQ-0162 本文から除去する。
      - REQ-0162-009: Epic #1515、TS-004、16件残留、RU-0007 等の特定作業記録。除去。
      - REQ-0162-010: concrete ID 参照段階除去の分割 case 実施方法、RU-0011 baseline 参照。除去（最終状態「concrete ID 参照を含まない」は REQ-0162-007 で既規定）。
      - REQ-0162-011: NG 218件/WARNING 10件、IR-055、intake ファイル名（intake-2026-07-19-concrete-id-path-remaining-216-ng-10-warn.md）参照、PR 本文 grep 証拠手順。除去（完了証明の作業手順であり、完了状態は REQ-0162-007 で規定済）。
      - REQ-0162-012: 文脈保持型置換、REQ-0142 適用手順等の作業手段。除去（作業手段は case/Issue で扱う）。
      残す最終状態要件は REQ-0162-001〜008 のみとする。REQ-0162-007（プロジェクト固有識別子を含まない）、REQ-0162-008（消費プロジェクト固有パスを含まない）が最終状態の本体であり、これらを保持する。
  - id: AG-004
    content: |
      docs/specs/local/audit-ledger-lifecycle.md（SC-003）の一般契約を docs/specs/workflows/backlog-artifact-lifecycle.md（RU/採用済み成果物/draft ライフサイクル SPEC）へ統合し、SC-003 は現行 SPEC 一覧から退役させる。
      統合対象は以下の一般契約のみに限定する。
      - one-time 成果物は恒久状態として扱わない。
      - 後続入力が自足した時点で廃棄できる。
      - 廃棄前に移管漏れを検査する。
      - 廃棄の事実は git 履歴で追跡できる。
      SC-003 に残存する今回固有情報（Phase 1、Phase 2、Phase 3、AG 番号、CR 番号、計画 Section 番号、特定監査台帳パス audit-ledger-governance-system-audit.md、既知適用例、既に完了した廃棄の「廃棄予定」表記）は統合しない。
      統合完了後、SC-003 は frontmatter に superseded_by: docs/specs/workflows/backlog-artifact-lifecycle.md を宣言し、docs/specs/README.md の一覧表から退役表示する。
  - id: AG-005
    content: |
      docs/adr/ADR-0127.md（case-auto 構成工程の委譲によるスケーラビリティ確立）は以下の状態へ純化する。
      - case-auto の構成工程委譲という意思決定に限定する。
      - §4「コンテキスト分離効果」と§5「コンテキスト分離効果とインライン実行（ADR-0127 UPDATE、ADR-0137 反映）」の重複記載を統合する。§5 を残し §4 を統合する。
      - 背景 §1「直近の case-auto 実行でこの指摘が複数回あった」等の過去の実行履歴、行数（5コマンド定義約594行、各100〜数百行）、具体的 REQ 行番号（REQ-0114-006/007/073 等）を本文から除去する。 REQ 番号は「関連する決定」セクションの参照のみで保持する。
      - 「Epic Issue ステータス追跡テーブル更新（単一書き手制約、REQ-0114-081）」を case-auto 保持責務から外し、ADR-0128 と整合する形で Epic Issue 本文の単一書き手を case-close へ統一する記述へ修正する。
      - side effect の詳細契約は SPEC（docs/specs/commands/case-auto.md、docs/specs/workflows/workflow-contracts.md）へ移す旨を注記し、ADR 本文では意思決定のみを保持する。
      - 改訂記録セクション（2026-07-19: 第2フェーズ監査再編 AG-005、ACT-ADR-003 等）を除去する。変更履歴は frontmatter `updated` と git log で追跡する。
      - 現在有効な決定、理由、代替案、影響だけを保持する。
  - id: AG-006
    content: |
      docs/adr/ADR-0134.md（配布物依存スキルの src 昇格方針）は status: proposed から status: accepted へ確定する。
      判断根拠: REQ-0159 で本判断の要件化は完了しており、japanese-tech-writing は PR #1332 で既に src/opencode/skills/ へトラック化済み、docs-check（check_integrity.ts）が未トラックスキル参照を検出する機構も実装済みであり、現行アーキテクチャ判断として独立して保持する意義が確認されたため。
      本文からプロジェクト固有参照（PR #1332 等）を除去し、意思決定の本体のみを残す。
      代替案に withdrawn/deprecated の選択肢も存在したが、本判断が今後の配布物依存スキル管理の方針として継続的に参照されるため accepted とする。
  - id: AG-007
    content: |
      src/opencode/skills/**/SKILL.md の全ファイルを横断スキャンし、DERIVE 完了の表明を持つものを検出する。ただし全ファイルを変更するわけではなく、実際に誤った DERIVE 表明を持つファイルのみを修正する。宣言を持たない SKILL.md へ一律に新しい節を追加しない。
      修正対象は「SPEC を SSoT として DERIVE する」「DERIVE 機構完了」等、機械生成または機械検証が存在しないのに DERIVE 表明を行っている箇所である。先行変更で約25ファイルへほぼ同一の「SPEC を SSoT として DERIVE する」宣言が追加されたが、これは機械生成ではなく参照優先順位の宣言であるため REFERENCE 表現へ直す。
      .opencode/ 側を原本として直接修正せず、src/opencode/skills/ 側を修正する（source/projection 分離、ADR-0105 準拠）。
      修正後の意味は次のとおり。
      「SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。」
      DERIVE 分類は、少なくとも以下のいずれかを満たす場合にのみ使用する。
      - SPEC から対象領域を機械生成する。
      - SPEC と SKILL.md の対応領域を機械検証する。
      - 共通テンプレートから原本宣言を生成する。
      - 手作業複製ではなく、変更追従を保証する仕組みが存在する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0101
    target_area: REQ-0101-060
    source_items: [AG-001]
    content: |
      REQ-0101-060（変更後）: docs/requirements/*.md、docs/adr/*.md（accepted のみ）、docs/specs/**/*.md（accepted のみ）の全文において、過去前提、移行経緯、将来予定、未実装予定、検討過程、再編工程固有識別子（Phase、Wave、AG、CR、ACT、TS、Issue/PR/RU/intake 参照、一時的な検出件数、作業計画、実施順序）が混入していないこと。現在契約を識別するために不可欠な正式 ID（REQ/ADR/SC/IR 番号）は保持する。履歴情報は git 履歴、Issue、PR、retired 文書で保持し、現行基準の本文では扱わない。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0162
    source_items: [AG-003]
    content: |
      docs/requirements/REQ-0162.md の要件テーブルを REQ-0162-001 から REQ-0162-008 の8行へ縮約する。
      除去対象行: REQ-0162-009、REQ-0162-010、REQ-0162-011、REQ-0162-012（作業記録、一時件数、特定 Epic/TS/RU/intake 参照、作業手段）。
      残す要件行（REQ-0162-001〜008）は配布物と harness の責務境界および最終的に満たすべき配布物状態のみを保持する。 REQ-0162-007（プロジェクト固有識別子を含まない）、REQ-0162-008（消費プロジェクト固有パスを含まない）が最終状態の本体。
      REQ-0162-001〜008 の内容自体は変更しない（既存のまま保持）。
      frontmatter `updated` を更新し、`## 関連情報` セクションに記載がある特定 intake ファイル名参照（intake-2026-07-19-concrete-id-path-remaining-216-ng-10-warn.md）も本文から除去する。
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: integrity
      slug: index-auto-generation
    source_items: [AG-002]
    content: |
      docs/specs/integrity/index-auto-generation.md を現在契約へ再構成する。
      修正要点:
      - frontmatter updated を更新。
      - Phase A〜E という導入履歴自体を削除し、現在契約として次の4点を定義するセクションへ再構成する。
        (1) 現在 AUTOGEN されている領域（frontmatter 由来で機械生成される件数、一覧、ステータス別ビュー等）。
        (2) 現在人手管理されている領域（導出規則未確定、混合領域、人手判断を含む領域）。
        (3) 各領域の正規情報源（frontmatter、各文書本文のセクション構造、宣言等）。
        (4) 人手管理領域に対する整合性確認方法（docs-check による検出、人手レビュー等）。
      - 冒頭「本 SPEC は機構の契約を定義し、実装（生成スクリプト、CI 組込、pre-commit hook 等）は対象外とする」は維持する。
      - Phase A（F-001/002/005 即時修正）、Phase B（要件 SPEC 化）、Phase C（生成スクリプト実装）、Phase D（docs-check 組込）、Phase E（全索引展開）の各 Phase 記述、「本 SPEC は Phase B の成果物である」、「Wave 1〜5 で完了」等の導入履歴を本文から除去する。
      - 「実装は対象外」「Phase B 成果物」等の旧状態を除去する。
      - 実装（生成スクリプト .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts、IR-061 docs-check 組込）の存在は「現在稼働している生成契約」として現在形で記述する。
      - 「全索引展開完了」「Phase E 完了」の表現を使用しない。
      - 「段階導入」セクション全体を除去し、現在稼働している自動生成契約として再構成する。
      - 5領域を「現在契約上の人手管理領域」として明示する。これは「永久に自動化しない」決定ではなく、「現在実装されていない機能を実装済み契約として扱わない」決定である旨を明記する。将来、導出規則と生成機構を別要件で確定すれば SC-002 を更新できる拡張ポイントである旨を記述する。
        - ADR README トピック別ビュー: 人手管理（導出規則未確定のため）
        - ADR README Decision Map: 人手管理（各 ADR 本文の宣言から導出、導出規則未確定のため）
        - ADR README 関連 REQ 表: 人手管理（各 ADR の関連宣言から導出、導出規則未確定のため）
        - docs/specs/README.md: 人手管理または既存生成部分のみ AUTOGEN（status 列は AUTOGEN 可能だが、責務列等の混合領域が大半のため、現状では一部列のみ AUTOGEN または人手管理）
        - docs/requirements/mapping-table.md: 人手判断（migrated/retired-no-successor/historical-only 判定）を含むため人手管理
      - 関連情報セクションの AG-006 候補参照、F-001/F-002/F-005 参照は「導入経緯」として残さず、git 履歴で追跡可能な履歴情報として扱う。現在契約の根拠として必要な場合は「検査契約: IR-061、IR-038、IR-039、IR-042」のみを残す。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: local
      slug: audit-ledger-lifecycle
    source_items: [AG-004]
    content: |
      docs/specs/local/audit-ledger-lifecycle.md を superseded へ遷移させる。
      修正要点:
      - frontmatter に superseded_by: ../workflows/backlog-artifact-lifecycle.md を追加。
      - status: accepted から status: superseded へ変更。
      - 本文の冒頭に「本 SPEC は docs/specs/workflows/backlog-artifact-lifecycle.md へ統合済みであり、現行契約としては参照しないこと。履歴参照用途。」を追記。
      - 既存の本文（Phase 1、Phase 2、CR-004、AG-009 等の今回固有情報を含む）は履歴参照としてそのまま残す。これは superseded 宣言により docs-check/inspect-docs の検査対象外となるため（REQ-0101-077）。
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: workflows
      slug: backlog-artifact-lifecycle
    target_area: "## one-time 成果物ライフサイクル（監査台帳等）"
    source_items: [AG-004]
    content: |
      docs/specs/workflows/backlog-artifact-lifecycle.md へ SC-003 の一般契約を統合する。
      新規セクション「## one-time 成果物ライフサイクル（監査台帳等）」を追加し、以下を記述する。
      - one-time 成果物（監査台帳、照合表、一時分析ファイル等）は、特定監査フェーズの入力として実ファイル列挙、不整合検出、処置候補抽出を集約する中間アーティファクトであり、フェーズ横断の進捗管理台帳として恒久化しない。
      - 後続入力が自足した時点で廃棄できる。廃棄前に移管漏れを検査する。
      - 廃棄の事実は git 履歴で追跡できる（PR 本文への明記、git rm による削除、後続フェーズ用入力ファイルへの移行元参照記録）。
      - 廃棄条件: (a) 次フェーズ用入力の自足性、(b) 移管漏れ確認の両立。
      統合元 SC-003 に固有の Phase 番号、AG/CR 番号、特定監査台帳パス、既知適用例は本セクションへ含めない。
      本セクションは SC-003（docs/specs/local/audit-ledger-lifecycle.md）から移管された一般契約である旨を注記する。
  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: ADR-0127
    source_items: [AG-005]
    content: |
      docs/adr/ADR-0127.md を純化する。
      修正要点:
      - frontmatter updated を更新。
      - §4「コンテキスト分離効果」と§5「コンテキスト分離効果とインライン実行（ADR-0127 UPDATE、ADR-0137 反映）」の重複を統合。§5 の内容（case-auto は構成工程を独立コンテキストへ委譲し、case-run は ADR-0137 により case-auto 内でインライン実行）を残し、§4 は「委譲モデル」セクションへ統合。
      - 背景 §1 の「直近の case-auto 実行でこの指摘が複数回あった」「5コマンド定義（約594行）」「各コマンドが参照するスキル群（各100〜数百行）」等の過去の行数、実行履歴を除去。
      - 「REQ-0114-073 との矛盾」等の特定 REQ 行番号参照を「親コンテキスト非累積の要件」と一般化して記述。REQ 番号は「関連する決定」セクションの参照のみで保持。
      - 「Epic Issue ステータス追跡テーブル更新（単一書き手制約、REQ-0114-081）」を case-auto 保持責務から除去し、ADR-0128 と整合する形で「Epic Issue 本文の単一書き手は case-close が担う」へ修正。
      - §3「case-auto の保持責務」から「Epic Issue ステータス追跡テーブル更新」を削除。
      - 改訂記録セクション（## 改訂記録、2026-07-19 エントリ）を除去。変更履歴は frontmatter `updated` と git log で追跡する（REQ-0101-073 適用）。
      - 「関連する決定」セクションの ADR-0114、ADR-0125、ADR-0128、ADR-0136、ADR-0137、ADR-0138 への参照は維持。各 relates-to の説明文から作業履歴、実装詳細を除去し、意思決定の関係のみを記述。
      - status: accepted を維持。
  - id: ACT-ADR-002
    artifact: adr
    operation: update
    target: ADR-0134
    source_items: [AG-006]
    content: |
      docs/adr/ADR-0134.md の status を accepted へ確定する。
      修正要点:
      - frontmatter status: proposed を status: accepted へ変更。
      - frontmatter updated を更新。
      - 本文から PR #1332 等のプロジェクト固有参照を除去。一般化して「既存の配布物依存スキル（japanese-tech-writing 等）は src/opencode/skills/ へトラック化済み」と記述。
      - 「## 結果、影響」セクションの docs-check（check_integrity.ts）による検出機構の記述は維持（現在稼働契約として必要）。
      - 「## 関連する決定」セクションの ADR-0105、REQ-0159 への参照を維持。
      - 提案時の代替案（.gitignore ホワイトリスト方式）の記述は維持（意思決定の根拠）。

conflict_resolutions:
  - id: CR-001
    conflict: Q1（対象範囲）について、広範スキャン（現行REQ全54件、accepted ADR全25件、accepted SPEC全件）と RU明示対象のみの二択。
    resolution: |
      広範スキャンを採用。根拠は RU 受け入れ条件 #16 が「現行REQ、accepted ADR、accepted SPEC に今回の再編固有の Phase/Wave/AG/CR/ACT/Issue/PR/件数/作業計画が残っていないこと」を明示的に要求しており、対象を RU 明示分に限定すると受け入れ条件 #16 を満たせないため。
      RU 明示対象外の backlog-artifact-lifecycle.md にも AG-008 が残存する事実が確認されており、明示対象のみの修正では残存を見逃す。
      ただし文字列の一括削除ではなく、各出現箇所を次の基準で文脈判定する。
      - 今回の再編工程に固有の履歴・作業識別子なら除去または履歴側へ移す。
      - 現在も有効な一般契約なら残す。
      - 「Phase」「Issue」「PR」等の一般語を無条件に禁止しない。
      - 「case-open が Issue を作成する」のような現行動作は対象外。
      - 「Phase 2 で実施した」のような完了済み作業履歴は除去対象。
      つまり全件検出・文脈判定・該当箇所だけ是正である。要件定義としては AG-001 で対象範囲と判定基準を宣言し、実際のスキャンと除去は case作業（OU-001）で実施する。
  - id: CR-002
    conflict: Q2（SC-002 未対応索引の扱い）について、自動生成対象外と明示、別途検討として残す、自動生成対象に含めるの三択。
    resolution: |
      「Phase A〜E という導入履歴自体を削除し、現在契約上の人手管理領域として確定」を採用。根拠は RU 受け入れ条件 #3「未対応領域が残る場合、Phase E または全索引展開を完了扱いとしていないこと」、#4「未対応領域を自動生成対象外とする場合、その対象外判断が現在契約として明記されていること」を満たすため。
      SC-002 に「Phase E の対象外」と残すのではなく、Phase A〜E という導入履歴自体を削除し、現在契約として次の4点を定義する。(1) 現在 AUTOGEN されている領域、(2) 現在人手管理されている領域、(3) 各領域の正規情報源、(4) 人手管理領域に対する整合性確認方法。
      5領域の扱いは以下のとおり確定する。
      - ADR README トピック別ビュー: 人手管理
      - ADR README Decision Map: 人手管理
      - ADR README 関連 REQ 表: 人手管理
      - docs/specs/README.md: 人手管理または既存生成部分のみ AUTOGEN
      - docs/requirements/mapping-table.md: 人手判断を含むため人手管理
      これは「永久に自動化しない」決定ではなく、「現在実装されていない機能を実装済み契約として扱わない」決定である。将来、導出規則と生成機構を別要件で確定すれば SC-002 を更新できる。
      代替の「別途検討として残す（B）」は未決事項を accepted SPEC へ残すため不適切。「自動生成対象に含める（C）」は今回 RU の対象外である新規生成機構・機能拡張に踏み込むため採用しない。
  - id: CR-003
    conflict: Q3（SC-003 統合先 SPEC）について、RU は「既存の draft、backlog、artifact lifecycle を所有する SPEC」と抽象的。
    resolution: |
      docs/specs/workflows/backlog-artifact-lifecycle.md（RU/採用済み成果物/draft ライフサイクル SPEC）を採用。根拠は同 SPEC が RU、採用済み成果物、draft、検出事項のライフサイクルを所有しており、SC-003 の one-time 監査成果物ライフサイクルと同じアーティファクトライフサイクル系の関心対象であるため。
      代替候補（document-type-responsibilities.md、artifact-responsibilities.md）は文書種別責務が主であり、ライフサイクル観点では backlog-artifact-lifecycle.md が最適。
  - id: CR-004
    conflict: Q4（ADR-0134 の最終 status）について、accepted、superseded、deprecated の三択。
    resolution: |
      accepted を採用。根拠は ADR-0134 が次の3つの独立したアーキテクチャ判断（配布物依存スキルは src/opencode/skills/ へ昇格、repo-local スキルは .opencode/skills/ へ残置、.gitignore ホワイトリスト方式は不採用）を持ち、ADR として成立する「採用案と不採用案を伴う構造判断」であるため。ADR-0105 は source/projection 物理分離の一般原則を定めるが、依存関係に基づくスキル昇格基準やホワイトリスト方式の不採用までは定めていない。
      REQ-0159 は ADR-0134 を実行可能な要件へ展開したものであり、ADR を置き換えるものではない。REQ 側も ADR-0134 を関連 ADR として明記している。japanese-tech-writing は PR #1332 で src 昇格済み、docs-check による未トラックスキル検出機構も実装済みであり、現行アーキテクチャ判断として独立して保持する意義が確認されている。
      処理としては ADR-0134 を現在状態へ純化し、PR 番号や「残存する可能性」等の移行時記述を除去し、status: accepted へ変更し、ADR-0105 とは relates-to を維持する。
      代替の superseded（ADR-0105 へ吸収、superseded_by: ADR-0105 宣言）は、ADR-0105 が一般原則であり具体判断を独立保持する方が後続参照で有用なため意味的に誤り。deprecated は要件化（REQ-0159）が完了しており継続参照されるため不適切。
  - id: CR-005
    conflict: Q5（SKILL.md 修正範囲）について、原本宣言を含む SKILL.md のみ、全 SKILL.md の二択。
    resolution: |
      全 SKILL.md をスキャンし、誤った DERIVE 表明を持つファイルのみ修正を採用。根拠は (a) 先行変更で約25ファイルへほぼ同一の「SPEC を SSoT として DERIVE する」宣言が追加された事実を網羅的に検出する必要がある、(b) 宣言の有無を事前に機械的に特定するよりも全件スキャンが確実、のため。
      ただし全ファイルを変更するわけではない。修正は実際に誤った DERIVE 表明を持つファイルのみとし、宣言を持たない SKILL.md へ一律に新しい節を追加しない。
      .opencode/ 側を原本として直接修正せず、src/opencode/skills/ 側を修正する（source/projection 分離、ADR-0105 準拠）。
      修正後の表現は「SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。」とする。DERIVE 分類は機械生成または機械検証が導入された場合にのみ使用する。
  - id: CR-006
    conflict: Q6（Scale）について、standard と large（Epic）の二択。
    resolution: |
      large（Epic）を採用。根拠は (a) CR-001 で広範スキャンを選択し現行 REQ 54件、accepted ADR 25件、accepted SPEC 全件を横断対象とする、(b) 7つの改善候補が REQ-0101、REQ-0162、SC-002、SC-003、ADR-0127、ADR-0134、配布物 SKILL.md 群と複数アーティファクト種別へ分散する、(c) SC-003 統合先 SPEC の追加更新も発生する、(d) 全 SKILL.md 横断スキャンを伴う、ため Epic 規模の作業となる。
      operation_units で6つの OU へ分割し、各 OU を独立実行可能とする。依存順序は OU-001（先行スキャン・横断純化）→ OU-002/003/004/005（結果に基づく各領域正常化、並列実行可能）→ OU-006（派生文書・整合性確認の最終工程）。新規 REQ を1件追加してまとめるのではなく、既存 REQ・ADR・SPEC の正規所有者へ変更を配分する構成とする。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260720-01
    target_req: REQ-0101
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}
    note: |
      現行文書横断純化。docs/requirements/REQ-*.md（54件）、docs/adr/ADR-*.md（accepted 25件）、docs/specs/**/*.md（accepted 全件）を横断スキャンし、今回の再編工程に固有の履歴・作業識別子を検出・除去する。
      文字列一括削除ではなく、各出現箇所を文脈判定する。
      - 再編工程固有の履歴・作業識別子（Phase 1/2/3、AG-XXX、CR-XXX、ACT-XXX、特定Epic番号、特定RU番号、intake/learning 個別ファイル名、一時件数等）は除去または履歴側へ移す。
      - 現在も有効な一般契約は残す。
      - 「Phase」「Issue」「PR」等の一般語を無条件に禁止しない。
      - 「case-open が Issue を作成する」等の現行動作は対象外。
      - 「Phase 2 で実施した」等の完了済み作業履歴は除去対象。
      含まれる主たる artifact_actions: ACT-REQ-001（REQ-0101-060 UPDATE）、ACT-REQ-002（REQ-0162 縮約）。
      併せて、スキャンで検出された追加の再編固有識別子を各ファイルの正規所有者へ直接編集する。複数 REQ/ADR/SPEC を横断し、文脈判定を伴うため scale: large。
  - ou_id: OU-002
    source_ru: RU-20260720-01
    target_spec:
      operation: update
      domain: integrity
      slug: index-auto-generation
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
    note: |
      索引生成契約正常化。SC-002（docs/specs/integrity/index-auto-generation.md）を現在契約へ再構成する。
      Phase A〜E という導入履歴自体を削除し、現在 AUTOGEN されている領域、現在人手管理されている領域、各領域の正規情報源、人手管理領域に対する整合性確認方法を定義する。
      含まれる主たる artifact_actions: ACT-SPEC-001。
      OU-001 の横断スキャン結果に基づき、SC-002 本文に残存する再編固有識別子を含めて処理する。
  - ou_id: OU-003
    source_ru: RU-20260720-01
    target_spec:
      operation: update
      domain: local
      slug: audit-ledger-lifecycle
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}
    note: |
      one-time 成果物ライフサイクル統合。SC-003（docs/specs/local/audit-ledger-lifecycle.md）の一般契約を docs/specs/workflows/backlog-artifact-lifecycle.md へ統合し、SC-003 を退役（superseded）させる。
      含まれる主たる artifact_actions: ACT-SPEC-002（SC-003 superseded）、ACT-SPEC-003（backlog-artifact-lifecycle.md へ統合セクション追加）。
      統合する一般契約は4項目（one-time 成果物は恒久化しない、後続入力が自足した時点で廃棄可能、削除前に移管漏れ確認、削除履歴は git で追跡）のみ。Phase 1/2/3、AG/CR、計画 Section、特定監査台帳パス、既知適用例は移管しない。
  - ou_id: OU-004
    source_ru: RU-20260720-01
    target_req: null
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 4
    issue_policy: single
    result: {}
    note: |
      ADR 体系正常化。ADR-0127（docs/adr/ADR-0127.md）の重複・矛盾・実装詳細を除去し純化する。ADR-0134（docs/adr/ADR-0134.md）の status を accepted へ確定し、本文を純化する。
      含まれる主たる artifact_actions: ACT-ADR-001（ADR-0127 UPDATE）、ACT-ADR-002（ADR-0134 UPDATE）。
      target_req は null だが ACT-ADR-001/002 が対象 ADR を明示する。
      ADR-0127 の修正で「Epic Issue 本文の単一書き手を case-close へ統一」を行う場合、ADR-0125、ADR-0128、epic-wave-model.md、case-close.md との整合確認を要する。関連 ADR への影響は本 OU で確認する。
  - ou_id: OU-005
    source_ru: RU-20260720-01
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 5
    issue_policy: single
    result: {}
    note: |
      SKILL 原本参照表現正常化。src/opencode/skills/**/SKILL.md の全ファイルを横断スキャンし、DERIVE 表明（「SPEC を SSoT として DERIVE する」「DERIVE 機構完了」等）を検出する。
      検出されたファイルのみを修正する。宣言を持たない SKILL.md へ一律に新しい節を追加しない。
      修正後の表現は「SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。」とする。
      .opencode/ 側を原本として直接修正せず、src/opencode/skills/ 側を修正する（ADR-0105 準拠）。
      配布物（src/opencode/）は artifact_actions の対象外（req/adr/spec のみ）。AG-007 の実装は case作業として処理される。
      全 SKILL.md 横断スキャンを伴うため scale: large。
  - ou_id: OU-006
    source_ru: RU-20260720-01
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-004, OU-005]
    recommended_order: 6
    issue_policy: single
    result: {}
    note: |
      派生文書・整合性確認。docs/README.md、docs/DOC-MAP.md、docs/requirements/README.md、docs/adr/README.md、docs/specs/README.md、docs/requirements/mapping-table.md の再生成と整合性確認、docs-check 最終確認を実施する。
      AUTOGEN ブロックの自動生成スクリプト（.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts）を再実行し、差分がないことを確認する。
      変更後の status（SC-003 superseded、ADR-0134 accepted 等）が各インデックスへ反映されていることを確認する。
      対応する test_strategy: TS-017、TS-018、TS-019、TS-020。
      OU-001〜OU-005 の全変更完了後に実施する最終確認工程。

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      docs/specs/integrity/index-auto-generation.md に対し、以下の文字列を grep で検索する。
      - 「実装は対象外」「本 SPEC は Phase B 成果物」「Phase A」「Phase B」「Phase C」「Phase D」「Phase E」「全索引展開完了」「別途検討事項」
      各キーワードのヒット数を記録する。
    pass_criteria: |
      上記全キーワードのヒット数が 0 件であること。
      ただし「Phase」そのものは他の正当な文脈（CI パイプラインの Phase 等）で使用される可能性があるため、「Phase A」「Phase B」「Phase C」「Phase D」「Phase E」の固有組み合わせを対象とする。
    on_failure: |
      fix-and-reverify。SC-002 の再構成が不完全であり、ACT-SPEC-001 の content に沿って未除去箇所を追加で純化する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/integrity/index-auto-generation.md の「自動生成の対象領域と生成元」セクションが、自動生成対象、生成元、人手編集領域、検査契約を一意に説明していることを人手で確認する。
    pass_criteria: |
      各索引類について、自動生成対象領域、生成元 frontmatter/メタデータ、人手編集領域、検査契約（IR-061 等）が過不足なく記述されており、解釈が一意に定まること。
    on_failure: |
      fix-and-reverify。説明不足の箇所を補完し、曖昧さを解消して再検証する。
  - id: TS-003
    target_item: AG-002
    verification: |
      docs/specs/integrity/index-auto-generation.md に「完了」「Phase E 完了」「全索引展開完了」等の完了宣言が含まれていないことを grep で確認する。
      また「別途検討事項」「別途検討」が残っていないことを確認する。
    pass_criteria: |
      完了宣言、別途検討事項の記述が 0 件であること。
    on_failure: |
      fix-and-reverify。該当記述を除去し、現在契約として未対応領域を明示する形へ書き直す。
  - id: TS-004
    target_item: AG-002
    verification: |
      docs/specs/integrity/index-auto-generation.md に、5領域（ADR README トピック別ビュー、Decision Map、関連 REQ 表、docs/specs/README.md 混合列、docs/requirements/mapping-table.md）が「自動生成対象外」「将来拡張ポイント」として明記されていることを確認する。
    pass_criteria: |
      5領域全てについて、自動生成対象外である旨とその理由（frontmatter 由来でなく導出規則確定を要する等）が明記されていること。
    on_failure: |
      fix-and-reverify。対象外宣言を追加し、理由を明記する。
  - id: TS-005
    target_item: AG-003
    verification: |
      docs/requirements/REQ-0162.md に対し、以下の文字列を grep で検索する。
      - 「#1515」「Epic #」「TS-004」「NG 218」「WARNING 10」「RU-0007」「RU-0011」「intake-2026-07-19」「文脈保持型置換」「IR-055」「AG-005」「REQ-0153」
      各キーワードのヒット数を記録する。
    pass_criteria: |
      上記全キーワードのヒット数が 0 件であること。
      REQ-0162-009、REQ-0162-010、REQ-0162-011、REQ-0162-012 の4行が要件テーブルから除去されていること。
    on_failure: |
      fix-and-reverify。REQ-0162 の縮約が不完全であり、ACT-REQ-002 の content に沿って未除去箇所を追加で除去する。
  - id: TS-006
    target_item: AG-003
    verification: |
      docs/requirements/REQ-0162.md の要件テーブルが REQ-0162-001 から REQ-0162-008 の8行のみであることを確認する。
      また各要件行が配布物と harness の責務境界、最終状態の不変条件を保持していることを人手で確認する。
    pass_criteria: |
      要件テーブル行数が8行であること。
      REQ-0162-007（プロジェクト固有識別子を含まない）、REQ-0162-008（消費プロジェクト固有パスを含まない）が保持されていること。
    on_failure: |
      fix-and-reverify。残すべき要件行が誤って除去されている場合は復元し、除去すべき作業識別子が残っている場合は追加除去する。
  - id: TS-007
    target_item: AG-004
    verification: |
      docs/specs/workflows/backlog-artifact-lifecycle.md に SC-003 の一般契約（one-time 成果物ライフサイクル）が統合されたセクションが存在することを確認する。
      統合された契約が one-time 成果物の恒久化禁止、廃棄条件、移管漏れ検査、git 履歴追跡を含むことを人手で確認する。
    pass_criteria: |
      backlog-artifact-lifecycle.md に「one-time 成果物ライフサイクル」セクション（または同等のセクション）が存在し、SC-003 からの一般契約4項目が全て含まれていること。
    on_failure: |
      fix-and-reverify。統合セクションを補完し、SC-003 の一般契約を過不足なく移管する。
  - id: TS-008
    target_item: AG-004
    verification: |
      SC-003 にしか存在しなかった必要な一般契約（one-time 成果物の廃棄条件、移管漏れ確認、git 履歴追跡等）が、backlog-artifact-lifecycle.md の統合セクションへ過不足なく移管されていることを人手で確認する。
      統合元 SC-003 と統合先の記述を突合する。
    pass_criteria: |
      SC-003 の一般契約4項目が全て backlog-artifact-lifecycle.md へ移管されており、意味的内容に欠落がないこと。
    on_failure: |
      fix-and-reverify。欠落している契約を統合先へ追加し、再度突合する。
  - id: TS-009
    target_item: AG-004
    verification: |
      docs/specs/local/audit-ledger-lifecycle.md の frontmatter が status: superseded、superseded_by: ../workflows/backlog-artifact-lifecycle.md であることを確認する。
      docs/specs/README.md の基盤 SPEC 一覧（local/ 表）で SC-003 の status 列が superseded 表示されていることを確認する。
    pass_criteria: |
      SC-003 の frontmatter と docs/specs/README.md の一覧表が共に superseded を示していること。
    on_failure: |
      fix-and-reverify。frontmatter または一覧表を更新し、整合させる。
  - id: TS-010
    target_item: AG-005
    verification: |
      docs/adr/ADR-0127.md の §4「コンテキスト分離効果」と §5「コンテキスト分離効果とインライン実行」が統合され、重複記述が解消されていることを確認する。
      ADR 本文内で「コンテキスト分離効果」を主題とするセクションが1つのみであることを確認する。
    pass_criteria: |
      ADR-0127 に「コンテキスト分離効果」を主題とするセクションが1つのみ存在すること。
    on_failure: |
      fix-and-reverify。§4 と §5 を統合し、単一セクションへ再構成する。
  - id: TS-011
    target_item: AG-005
    verification: |
      ADR-0127、ADR-0125、ADR-0128、docs/specs/workflows/epic-wave-model.md、docs/specs/commands/case-close.md の各文書で、Epic Issue 本文の単一書き手が case-close である記述で一致していることを確認する。
      各文書で「Epic Issue 本文の更新」「ステータス追跡テーブルの更新」の責務が case-close に帰属しているかを突合する。
    pass_criteria: |
      上記5文書の全てで、Epic Issue 本文更新の責務が case-close に一致していること。
    on_failure: |
      fix-and-reverify。責務が case-auto 等に残留している文書を case-close へ更新する。ただし、ADR-0125、epic-wave-model.md、case-close.md の修正は本要件の範囲を超える場合は follow-up 課題として記録し、ADR-0127 のみを本要件で純化する。
  - id: TS-012
    target_item: AG-005
    verification: |
      docs/adr/ADR-0127.md に対し、以下を grep で検索する。
      - 行数言及（「約594行」「各100〜数百行」等）
      - 具体的 REQ 行番号（「REQ-0114-006」「REQ-0114-073」等、ただし「関連する決定」セクション内の参照は除外）
      - 再編工程識別子（「AG-005」「ACT-ADR-003」「第2フェーズ監査再編」等）
      - 「直近の case-auto 実行でこの指摘が複数回あった」等の作業履歴
      - 「改訂記録」セクション
      各キーワードのヒット数を記録する。
    pass_criteria: |
      上記キーワードのヒット数が 0 件であること（「関連する決定」セクション内の REQ-NNNN 形式参照は例外として許容）。
    on_failure: |
      fix-and-reverify。該当記述を除去し、純化する。
  - id: TS-013
    target_item: AG-006
    verification: |
      docs/adr/ADR-0134.md の frontmatter status が accepted であることを確認する。
      docs/adr/README.md のステータス別ビューで ADR-0134 が accepted リストへ移動し、proposed リストから除去されていることを確認する。
    pass_criteria: |
      ADR-0134 の frontmatter status が accepted であり、docs/adr/README.md のステータス別ビューが整合していること。
    on_failure: |
      fix-and-reverify。frontmatter または README のステータス別ビューを更新する。
  - id: TS-014
    target_item: AG-007
    verification: |
      src/opencode/skills/**/SKILL.md の全ファイルをスキャンし、DERIVE 表明（「SPEC を SSoT として DERIVE する」「DERIVE 機構完了」「DERIVE 済」等）を検出する。
      検出された各 SKILL.md について、修正後の表現「SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。」へ置換されていることを確認する。
      宣言を持たない SKILL.md へ新しい節が追加されていないことも確認する（一律追加はしない）。
      src/opencode/skills/ 側が修正されており、.opencode/ 側は直接修正されていないことを確認する。
    pass_criteria: |
      スキャンで検出された全 DERIVE 表明が REFERENCE 表現へ修正されていること。
      宣言を持たない SKILL.md へ一律に新しい節が追加されていないこと。
      src/opencode/skills/ 側が修正元であること。
    on_failure: |
      fix-and-reverify。未修正の DERIVE 表明を REFERENCE 表現へ修正する。誤って追加された新しい節があれば除去する。
  - id: TS-015
    target_item: AG-007
    verification: |
      src/opencode/skills/**/SKILL.md 全ファイルに対し、「DERIVE 機構完了」「DERIVE 完了」「DERIVE 済」「SSoT として DERIVE」を grep で検索する。
    pass_criteria: |
      上記キーワードのヒット数が 0 件であること。
    on_failure: |
      fix-and-reverify。該当表現を REFERENCE 表現または原本参照維持の表現へ書き直す。
  - id: TS-016
    target_item: AG-001
    verification: |
      docs/requirements/REQ-*.md（54件）、docs/adr/ADR-*.md（accepted 25件）、docs/specs/**/*.md（accepted 全件）に対し、広範スキャンを実施する。
      検索対象識別子: 「Phase 1」「Phase 2」「Phase 3」「Phase A」「Phase B」「Phase C」「Phase D」「Phase E」「Wave 1」「Wave 2」「AG-00」「CR-00」「ACT-」「TS-0」「intake-2026」「learning-2026」「audit-ledger-」等の再編工程固有識別子。
      ただし正式 ID（REQ-NNNN、ADR-NNNN、SC-NNN、IR-NNN）は検索対象外。
      ヒットした文書、行、識別子を全て記録する。
    pass_criteria: |
      現行 REQ、accepted ADR、accepted SPEC の本文で、再編工程固有識別子のヒット数が 0 件であること。
      ただし現在契約を識別するために不可欠な正式 ID（REQ/ADR/SC/IR 番号）は例外として許容。
    on_failure: |
      fix-and-reverify。ヒットした各箇所を文脈保持型置換（識別子非依存表現へ）または除去で純化する。修正範囲が広範な場合は文書ごとに分割 case として処理する。
  - id: TS-017
    target_item: AG-001
    verification: |
      docs/README.md、docs/DOC-MAP.md、docs/requirements/README.md、docs/adr/README.md、docs/specs/README.md、docs/requirements/mapping-table.mdが、変更後の status（SC-003 superseded、ADR-0134 accepted 等）と整合していることを確認する。
      各インデックスの AUTOGEN ブロックが自動生成スクリプトの再実行で最新状態へ更新されていることを確認する。
    pass_criteria: |
      全てのインデックス類が変更後の status、退役、統合先と整合していること。
      AUTOGEN ブロックの内容が実ファイルと一致していること。
    on_failure: |
      fix-and-reverify。インデックス類を更新し、必要に応じて自動生成スクリプトを再実行する。
  - id: TS-018
    target_item: AG-001
    verification: |
      /repo/docs-check を実行し、変更対象文書（REQ-0101、REQ-0162、SC-002、SC-003、backlog-artifact-lifecycle.md、ADR-0127、ADR-0134、配布物 SKILL.md 群）に起因する failure および warning が 0 件であることを確認する。
    pass_criteria: |
      変更対象文書に起因する failure、warning が 0 件であること。
      既存の無関連な failure/warning は本要件の対象外とするが、記録する。
    on_failure: |
      fix-and-reverify。変更が起因する failure/warning を修正する。既存の無関連な failure/warning が検出された場合は record-in-findings として Findings へ記録し、本要件の完了条件から除外する。
  - id: TS-019
    target_item: AG-001
    verification: |
      自動生成スクリプト（.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts）を再実行し、差分が発生しないことを確認する。
    pass_criteria: |
      自動生成スクリプトの再実行による差分が 0 件であること。
    on_failure: |
      fix-and-reverify。差分が発生した場合、AUTOGEN ブロックの内容と実ファイルが不一致であるため、スクリプトを再実行して差分を解消する。
  - id: TS-020
    target_item: AG-001
    verification: |
      src/opencode/commands/agentdev/*.md の各 command 定義について、公開動作、入力、出力、停止条件、side effect が変更前と一致していることを確認する。
      git diff で各 command 定義の差分を確認し、公開動作への影響がないことを人手で確認する。
    pass_criteria: |
      全ての command 定義で公開動作、入力、出力、停止条件、side effect に変更がないこと。
    on_failure: |
      record-in-findings。本要件は文書純化が主眼であり、command 公開動作の変更を意図しない。変更が検出された場合は意図しないデグレードであるため、Findings に記録し、別途 case として処理する。

case_open_hints:
  epic_needed: true
  decomposition: |
    6 操作単位（OU-001〜OU-006）へ分解。各 OU は独立実行可能だが、依存順序を厳格に守る。
    OU-001（現行文書横断純化）を先行 Wave で実施し、検出結果に基づいて OU-002〜OU-005 を処理し、最後に OU-006（派生文書・整合性確認）を実施する。
    新規 REQ を1件追加してまとめるのではなく、既存 REQ・ADR・SPEC の正規所有者へ変更を配分する構成とする。
  wave_hints:
    - wave: 1
      ous: [OU-001]
      rationale: 現行文書横断純化（全REQ/ADR/SPEC スキャン + 再編固有識別子除去）。REQ-0101-060 UPDATE、REQ-0162 縮約を含む。後続 OU への前提情報（残存識別子の検出結果）を提供するため最先行。
    - wave: 2
      ous: [OU-002, OU-003, OU-004, OU-005]
      rationale: OU-001 のスキャン結果に基づき、各領域の正常化を実施。OU-002（SC-002 再構成）、OU-003（SC-003 統合・退役）、OU-004（ADR-0127/0134 UPDATE）、OU-005（SKILL.md DERIVE 表現是正）は互いに独立するため並列実行可能。
    - wave: 3
      ous: [OU-006]
      rationale: 派生文書（README、DOC-MAP、SPEC 索引）の再生成と docs-check 最終確認。OU-001〜OU-005 の全変更完了後に実施する最終工程。
```

# summary

本ドラフトは、ガバナンス統合再編後の恒久文書純化と完了状態の是正を要件化したものである。

RU-20260720-01 が指摘した6つの問題（SC-002 内部矛盾、Phase 3 完了宣言不一致、REQ-0162 作業識別子残留、SC-003 固有監査の恒久化、ADR-0127/0134 の矛盾・重複・status 未確定、SKILL.md DERIVE 表明過大）を、7つの合意項目（AG-001〜AG-007）として整理した。

本要件は新規要件の追加ではなく、既存の REQ-0101-043〜060、REQ-0102-006/007、REQ-0162-007/008 の強制適用と、既存 REQ/ADR/SPEC 本文の純化が主眼である。したがって SPLIT 予兆は低く、各 REQ への UPDATE で対応可能である。ただし対象範囲は現行 REQ 54件、accepted ADR 25件、accepted SPEC 全件、配布物 SKILL.md 全ファイルへ及ぶため Epic 規模とし、6 操作単位（OU-001〜OU-006）へ分解した。

Step 3 の壁打ちでは6つの未決分岐（Q1〜Q6）を抽出した。ユーザーから全質問へ明示回答を得たため、各回答を conflict_resolutions（CR-001〜CR-006）へ根拠付きで記録し、auto_ready: true でドラフトを確定した。

主な決定内容:
- Q1（対象範囲）: 広範スキャン（全REQ/ADR/SPEC）。文字列一括削除ではなく文脈判定・該当箇所のみ是正。
- Q2（SC-002 未対応索引）: Phase A〜E 導入履歴自体を削除し、現在契約として AUTOGEN 領域・人手管理領域・正規情報源・整合性確認方法を定義。5領域は現在契約上の人手管理領域として確定（「永久に自動化しない」ではなく「現在実装されていない機能を実装済み契約として扱わない」）。
- Q3（SC-003 統合先）: docs/specs/workflows/backlog-artifact-lifecycle.md へ統合。一般契約4項目のみ移管。
- Q4（ADR-0134 status）: accepted。独立した構造判断（src 昇格、repo-local 残置、ホワイトリスト不採用）を保持。superseded_by: ADR-0105 は意味的に誤り。
- Q5（SKILL.md 修正範囲）: 全 SKILL.md をスキャン、誤った DERIVE 表明を持つファイルのみ修正。宣言のないファイルへ一律追加しない。修正後は REFERENCE 表現へ。
- Q6（Scale）: large/Epic。6 OU 構成で分解。

依頼順序として OU-001（横断純化）を先行 Wave で実施し、検出結果に基づいて OU-002〜OU-005 を処理し、最後に OU-006（派生文書・整合性確認）を実施する。新規 REQ を1件追加してまとめるのではなく、既存 REQ・ADR・SPEC の正規所有者へ変更を配分する構成とした。

新規 ADR 作成は不要（Step 6-4 作業手段ADR拒否ゲート適用外）。既存 ADR-0127、ADR-0134 の UPDATE のみ。

test_strategy は20項目（TS-001〜TS-020）で、RU受け入れ条件の20項目に対応する。各項目は verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素を完全に持つ。
