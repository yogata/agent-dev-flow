---
draft_type: req_draft
topic_slug: ir-portfolio-audit
status: saved
created_at: 2026-08-11T00:00:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  IR 体系全体を監査・再編し、現存 IR を 8 項目の存在条件（canonical basis + invariant + executable detector + regression test + execution route + finding route + 他 IR 非包含）を満たす実行可能な恒久統制に限定する。全 59 IR を KEEP/MERGE/IMPLEMENT/DELETE に判定し、tombstone 廃止と lifecycle_state/enforcement_mode/baseline_status 簡素化（finding-baseline 分離）を統合した DEC-013「IR 登録モデル簡素化」を新設する。新規 IR 登録 gate は「IR 存在資格 gate（全新規 IR 対象、hard）」と「hard governance 追加 gate（blocking hard-control IR 対象、DEC-001 決定4 の 7 条件立証）」の 2 種とし、enforcement_mode 非依存で blocking/non-blocking 区別とする。detector 共有は個別到達性と回帰証拠が追跡可能な場合に許容する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons:
    - ユーザー確認事項 Q-A〜Q-D 解消済み（Q-A: 修正版 c 2種 gate、Q-B: baseline_status IR属性除去、Q-C: OU-001..007 7 OU化、Q-D: Q-B反映条件付きDEC-013統合）
    - adversarial-review Audit CA-1（交叉参照の正規所有者）および CA-2（別種検査の終了条件監視機構）は AG-008/AG-006 へ反映済み
    - OU-005（Phase 4 IR管理モデル再設計）の DEC-013 依存: case-open 時点で DEC-013 が accepted/current authority であることを依存成立条件とする（現時点で DEC-013 存在を前提としない）

agreed_items:
  - id: AG-001
    content: |
      IR は以下の 8 項目をすべて満たす場合にのみ現行成果物として存在できる。
      (1) 現行 REQ、Decision、SPEC のいずれかに canonical basis が存在する。
      (2) 将来も維持すべき repository invariant を表している。
      (3) 決定的または許容された機械的判定として executable detector が存在する。detector 関数の専有は必須ではなく、invariant ごとの到達性が追跡可能で回帰証拠が存在すれば、他 IR との detector 共有を許容する（REQ-010-269 包括カバー許容、catalog 行173「二系統で IR ルールを共有」に基づく）。
      (4) IR が規定する detection method を detector が実装している。共有 detector の場合、当該 IR の invariant を検出するコードパスが存在し regression test で証拠付けられる。
      (5) detector の正常検出・非検出を確認できる regression test が存在する。
      (6) docs-check、CI、保存工程等の正規実行経路から detector が到達可能である。
      (7) 検出結果が定義された severity / gate / finding route に接続されている。
      (8) 他 IR に完全包含されていない。他 IR の detector が同一 invariant を同一到達性でカバーする場合、重複として包含関係を判定する。
      既存であることのみを KEEP の根拠としてはならない。
      （adversarial-review 争点1 修正条件反映: detector 関数専有不要、個別到達性 + 回帰証拠必須を明記）
  - id: AG-002
    content: |
      以下の状態を恒久的な現行 IR として許容しない。
      - detector が存在しない
      - detector が detection method の一部しか実装していない
      - regression test が存在しない
      - 正規実行経路から到達不能
      - finding が実処理へ接続されない
      必要な invariant である場合は IMPLEMENT として不足を解消し、不要な場合は DELETE または MERGE とする。
  - id: AG-003
    content: |
      全 file-backed IR および catalog-only IR を対象に、少なくとも以下を双方向で調査する。
      IR → 実装方向: canonical basis、invariant、detector、detection coverage、regression test、runtime reachability、severity、gate、finding route、baseline、他 IR との重複、 migration 固有性、現行 artifact 依存、KEEP/MERGE/IMPLEMENT/DELETE 判定、判定根拠。
      実装 → IR 方向: checker/detector/test/baseline/catalog/ownership/impact-map/index から IR への逆引き。所有 IR 不明の検査が残存しないことを確認する。
  - id: AG-004
    content: |
      全既存 IR を KEEP/MERGE/IMPLEMENT/DELETE のいずれかに分類する。
      - KEEP: 現行 invariant として存在条件をすべて満たす
      - IMPLEMENT: invariant は有効だが detector、coverage、test、route 等に不足がある
      - MERGE: 他 IR または共通検出機構へ統合できる
      - DELETE: 現行 IR として存在する必要がない
      未判定のまま存続させない。外部依存や追加要件判断により判定不能な場合のみ blocked とし、理由と必要な判断を明示する。
  - id: AG-005
    content: |
      個々の IR の存廃判定後、同種の invariant を横断的に再評価する。特に移行残存検査（obsolete namespace/path/identifier/reference form/migration residual）について、IR 単位で恒久増殖させず、共通 detector と declarative data に統合可能かを評価する。
      検出方式、severity、例外条件、failure semantics が異なるものを無理に統合してはならない。
  - id: AG-006
    content: |
      一時的な移行作業のみを目的とする検査は、原則として独立した恒久 IR としない。
      継続的な再発防止価値がある場合のみ IR とし、一時的な検査で十分な場合は migration 固有の checker/config/test 等として扱い、移行完了後に削除可能な構造とする。
      別種検査の所在は対象 SPEC または migration plan 配下とし、終了条件を明示する。終了条件の監視機構（期限超過警告、または docs-check 等の既存鮮度監視経路の拡張）を併せて規定する。
      （adversarial-review 争点3 + Audit CA-2 修正条件反映: 別種検査の registry 所在と終了条件監視機構を明記。放置で別形の不活化 IR 群が再発生するリスクを防止）
  - id: AG-007
    content: |
      文脈解釈、意味判断、設計妥当性判断等を必要とする検査を docs-check の IR として保持しない。
      価値のある診断である場合は、既存 inspect/diagnostics 責務（inspect-docs、inspect-skills、agentdev-doc-writing）へ移管する。
      （advisory 確定: Candidate 2 は Decision 不要、REQ-010-003/004/018..028 が一般原則を所有。DEC-006 amendment も不可）
  - id: AG-008
    content: |
      廃止済み IR の履歴保存のみを目的とする file-backed tombstone を保持しない。
      廃止した IR ファイルは物理削除可能とし、識別子の再利用禁止は numbering-policy が保持し、Git 履歴により履歴性を担保する。
      欠番管理は IR 本体ではなく numbering-policy の責務とする。
      廃止 IR が交叉参照（v2:REQ-NNN 等の cross-domain 参照）を持つ場合、物理削除前に当該参照データを正規所有者（req-impact-map.md または retired/ 配下）へ再配置する。numbering-policy は欠番の存在宣言のみを担う。
      （adversarial-review 争点2 + Audit CA-1 修正条件反映: 交叉参照の再配置先は numbering-policy ではなく req-impact-map/retired/ が正規所有者）
  - id: AG-009
    content: |
      現行の lifecycle_state（active/superseded/deleted）、enforcement_mode（enforcement/observation/none）、baseline_status（known/new/resolved/superseded）は、IR の存在条件を厳格化した後も必要か再評価する。
      少なくとも「現存 IR = 現行」「現存 IR = executable detector を持つ」を成立させること。
      active + none のような「現行だが実行可能な検査を持たない IR」を恒久状態として許容しないこと。
      lifecycle_state / enforcement_mode / baseline_status のすべてを IR の属性から除去し、同一状態を複数の属性で重複管理しないこと。
      baseline_status は finding-baseline の分類（current finding = new/known、resolved = 現行 finding/baseline 集合からの除去）へ分離し、IR schema には保持しない。detector の実装修復済み/未実装は IR 存在条件が所有し、別の状態軸を作らない。
      （ユーザー Q-B 回答反映: baseline_status を IR 属性から除去、finding-baseline 分離。「実装修復済み」resolved も IR には残さない）
  - id: AG-010
    content: |
      IR を DELETE または MERGE する場合、IR ファイルだけを変更してはならない。必要に応じて以下の残存物を確認・整理する。
      checker/detector branch、test/fixture、baseline、catalog、rule ownership、impact map、index/generated metrics、gate routing、finding generation、docs-check、repo-agentdev-integrity skill、その他参照。
      MERGE の場合は旧 IR が保証していた有効な検出ケースが統合先の regression test で維持されること。
      baseline_status を IR schema から除去（AG-009 連携）。current finding の new/known 分類と resolved（現行集合からの除去）は finding-baseline の状態として別途定義する。tombstone 群（IR-011 型 file-backed）は AG-008 で物理削除。
  - id: AG-011
    content: |
      新規 IR 登録 gate は以下の 2 種を分離する。
      (a) IR 存在資格 gate（すべての新規 IR 対象）: hard。canonical basis / invariant / executable detector / regression test / execution route が同時に成立しなければ登録・merge 不可。「後から detector/test を実装する予定」の状態で恒久 IR を追加しない。
      (b) hard governance 追加 gate（blocking を発生させる新規 IR 対象）: hard。(a) に加え DEC-001 決定4 の 7 条件を全て立証する。
      非 blocking IR（heuristic / observation 相当）は (b) の 7 条件立証を要しないが、(a) IR 存在資格は必須。「observation だから未実装 IR を登録してよい」とはしない。
      blocking / non-blocking 区別は enforcement_mode フィールドに依存せず、新規 IR が blocking hard-control か非 blocking かで判定する。
      （ユーザー Q-A 回答反映: 修正版 (c) 採用、blocking hard-control IR / non-blocking IR で区別、IR 存在資格 gate は双方 hard）
  - id: AG-012
    content: |
      IR 見直しの成功を IR 件数の削減数で評価してはならない。
      存在条件を満たした結果として必要な IR が残ることを優先し、恣意的な件数目標を設定しない。
      （adversarial-review 争点4: AG-012 は件数目標禁止、AG-004 DELETE は存在条件不合格由来。実質的緊張関係なし）

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: docs/requirements/REQ-028.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012]
    content: |
      # REQ-028: IR 体系の実効性監査と存在条件厳格化

      ## 目的
      Integrity Rule（IR）体系全体を監査・再編し、現存 IR を実行可能な恒久統制（canonical basis + invariant + executable detector + regression test + execution route + finding route + 他 IR 非包含の 8 項目存在条件）に限定する。tombstone 廃止と lifecycle_state/enforcement_mode 簡素化を統合した DEC-013「IR 登録モデル簡素化」と連動し、IR の再肥大化・再形骸化を防止する。

      ## 要件
      | ID | 要件 |
      |---|---|
      | REQ-028-001 | IR は 8 項目存在条件をすべて満たす場合にのみ現行成果物として存在できる。detector 関数の専有は必須ではなく、invariant ごとの到達性が追跡可能で回帰証拠が存在すれば他 IR との detector 共有を許容する。既存であることのみを KEEP の根拠としてはならない。 |
      | REQ-028-002 | 非実効 IR（detector 不在、部分実装、test 不在、到達不能、finding 未接続）を恒久的な現行 IR として許容しない。必要な invariant は IMPLEMENT、不要な場合は DELETE/MERGE とする。 |
      | REQ-028-003 | 全 file-backed IR および catalog-only IR を対象に、IR→実装と実装→IR の双方向でポートフォリオ監査を実施する。 |
      | REQ-028-004 | 全既存 IR を KEEP/MERGE/IMPLEMENT/DELETE に分類する。未判定存続を禁止し、判定不能な場合は blocked として理由を明示する。 |
      | REQ-028-005 | 同種 invariant（migration residual 等）の横断的再評価を行い、共通 detector と declarative data への統合可能性を評価する。検出方式/severity/例外/failure semantics が異なるものは無理に統合しない。 |
      | REQ-028-006 | 一時移行検査は原則として恒久 IR とせず、期限/終了条件を持つ別種検査として扱う。別種検査の所在は対象 SPEC または migration plan 配下、終了条件監視機構（期限超過警告等）を規定する。継続的再発防止価値がある場合のみ IR とする。 |
      | REQ-028-007 | 文脈解釈・意味判断・設計妥当性判断を必要とする検査を docs-check の IR から除外し、inspect/diagnostics（inspect-docs、inspect-skills、agentdev-doc-writing）へ移管する。 |
      | REQ-028-008 | 廃止済み IR の履歴保存のみを目的とする file-backed tombstone を保持しない。廃止 IR ファイルは物理削除可能、識別子非再利用は numbering-policy、履歴性は Git で担保。廃止 IR の交叉参照（v2:REQ-NNN 等）は物理削除前に req-impact-map.md または retired/ 配下へ再配置する。 |
      | REQ-028-009 | lifecycle_state（active/superseded/deleted）、enforcement_mode（enforcement/observation/none）、baseline_status（known/new/resolved/superseded）を現行 IR 属性から全て削除し、「現存 IR = 現行 = executable detector」を成立させる。active+none の恒久状態を禁止する。finding-baseline 分類（new/known/resolved）は IR schema から分離し finding の状態として別途定義する。 |
      | REQ-028-010 | baseline_status を IR schema から除去する。current finding の new/known 分類、resolved（現行 finding/baseline 集合からの除去）は finding-baseline の状態として定義する。tombstone 群（IR-011 型 file-backed）の移行は REQ-028-008（AG-008）で物理削除。 |
      | REQ-028-011 | IR を DELETE/MERGE する場合、checker/test/fixture/baseline/catalog/ownership/impact-map/index/generated-metrics/gate-routing/finding-generation/docs-check/repo-agentdev-integrity-skill/他参照の残存物を確認・整理する。MERGE 時は統合先で有効検出ケースを維持する。 |
      | REQ-028-012 | 新規 IR 登録 gate は (a) IR 存在資格 gate（全新規 IR 対象、hard。canonical basis/invariant/executable detector/regression test/execution route の同時成立が必要）と (b) hard governance 追加 gate（blocking hard-control IR 対象、hard。DEC-001 決定4 の 7 条件立証）の 2 種とする。非 blocking IR は (a) のみ必須、(b) は不要。区別は enforcement_mode 非依存、blocking/non-blocking で判定。 |
      | REQ-028-013 | IR 見直しの成功を IR 件数削減数で評価しない。存在条件満たした結果必要な IR が残ることを優先する。 |

      ## 適用範囲
      - 対象: docs/specs/integrity/rules/IR-*.md、integrity rule catalog、integrity contracts、rule ownership/impact mapping、IR 採番・廃止 ID 管理、repo-agentdev-integrity の checker/detector、integrity regression tests/fixtures、IR baseline、docs-check の IR 実行経路、repo-agentdev-integrity SKILL、IR 関連 index/generated metrics、IR lifecycle/enforcement 契約、IR 新規登録条件、migration residual 検査方式、IR から inspect/diagnostics への責務移管
      - 対象外: inspect/diagnostics 体系そのものの全面再設計、IR と無関係な REQ/Decision/SPEC の再編、consumer project 向け新機能追加、integrity finding の後続 intake/promote workflow の全面変更、IR 件数を特定数まで削減すること
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    target_area: 適用範囲
    source_items: [AG-008, AG-009]
    content: |
      REQ-010 適用範囲節のうち「IR（integrity rule）の状態モデル（lifecycle_state、enforcement_mode）、有効組合せ、全登録 IR ID の排他的分割、enforcement_mode: none の IR の 4 面除外」を削除し、「IR 体系の実効性監査と存在条件厳格化は REQ-028 を参照」へ更新。
      REQ-010-058（既存 severity、gate_level、baseline_status を維持）は UPDATE し、baseline_status を維持対象から除外。severity と gate_level のみ維持対象とする。baseline_status の除去は REQ-028-010 へ移管。
  - id: ACT-REQ-003
    artifact: req
    operation: retire
    target: docs/requirements/REQ-010.md
    source_items: [AG-008, AG-009]
    content: |
      REQ-010-053（lifecycle_state）、REQ-010-054（enforcement_mode）、REQ-010-055（有効組合せ5件）、REQ-010-056（file-backed ID と catalog-only ID の排他分割）、REQ-010-057（enforcement_mode: none の 4 面除外）の 5 項目を RETIRE。
      REQ-028-009 が存在条件厳格化でこれらを置換。REQ-010-058（severity/gate_level/baseline_status 維持）は維持。
      ID 不変原則（REQ-001-008）に従い欠番維持、再利用禁止（DEC-009 CR-001 適用外）。
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: docs/decisions/DEC-013.md
    source_items: [AG-008, AG-009]
    content: |
      # DEC-013: IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定

      ## 背景
      現行の IR 状態モデルは lifecycle_state（active/superseded/deleted）× enforcement_mode（enforcement/observation/none）の 2 軸 5 状態（REQ-010-053..057）。このモデルは「現行だが実行可能な検査を持たない IR」（active+none）を恒久状態として許容し、detector 未実装の IR（Layer D 約17件）や file-backed tombstone（IR-011）の残存を可能にしている。
      RU-IR-008（tombstone 廃止）と RU-IR-009（lifecycle/enforcement 簡素化）は、いずれも「現存 IR = 現行 = executable detector」という単一の将来状態を志向する。両者は因果連鎖する（AG-009 なしの AG-008 は superseded state の行き場を失い、AG-008 なしの AG-009 は orphan tombstone を残す）。

      ## 決定

      ### AG-008 系: tombstone 廃止
      1. 廃止済み IR の履歴保存のみを目的とする file-backed tombstone を保持しない。
      2. 廃止 IR ファイルは物理削除可能。識別子の再利用禁止は numbering-policy が保持し、Git 履歴で履歴性を担保する。
      3. 欠番管理は IR 本体ではなく numbering-policy の責務。交叉参照（v2:REQ-NNN 等）は物理削除前に req-impact-map.md または retired/ 配下へ再配置する。

      ### AG-009 系: lifecycle/enforcement/baseline_status 簡素化
      4. 現存 IR は恒久 invariant、実行可能 detector、回帰テスト、実行経路を備える。
      5. lifecycle_state、enforcement_mode、baseline_status のすべてを現行 IR の属性から除去し、「現存 IR = 現行 = executable detector」へ統一する。
      6. active+none を恒久状態として許容しない。
      7. severity、gate_level は実行中の IR に対する独立軸としてのみ維持し、IR lifecycle の代替にしない（REQ-010-058 UPDATE、baseline_status は維持対象から除外）。
      8. finding-baseline 分類（current finding = new/known、resolved = 現行 finding/baseline 集合からの除去）は IR lifecycle から分離し、finding の状態として定義する。
      （ユーザー Q-B/Q-D 回答反映: tombstone削除 + lifecycle/enforcement/baseline_status 等の不要なIR状態軸を除去し、現存IR = current + executable とする。finding baseline はIR lifecycleから分離する）

      ## 結果、影響
      - REQ-010-053..057 を RETIRE（REQ-028-009 が置換）。
      - REQ-010-058 を UPDATE（baseline_status を維持対象から除外、severity と gate_level のみ維持）。
      - numbering-policy の既知の欠番表が交叉参照の正規所有者（req-impact-map.md/retired/）と協調して gap-reason 管理を担う。
      - 一時移行検査（RU-IR-006）は IR 集合から分離され、別種検査（終了条件付き）として運用される。
      - 既存 baseline_status を持つ IR（tombstone 群を含む）は AG-008 で物理削除、active IR から baseline_status を除去。finding-baseline 分類（new/known/resolved）は finding 側へ分離。

      ## 関連する決定
      - DEC-001 決定4（新規統制追加原則）: relates-to。本 Decision は lifecycle/enforcement の削除と新規存在条件の導入を伴う。削除/統合/interface 縮小を優先（条件3）し、新規 IR 登録 gate（RU-IR-011）の hard gate 化は別途 DEC-001 決定4 の 7 条件立証が必要。
      - DEC-009 CR-001（ID 不変原則のスコープ例外）: relates-to。本 Decision は REQ-010-053..057 の RETIRE（欠番維持）であり、DEC-009 CR-001（ADR→Decision 移行の ID 変更例外）の適用外。
      - DEC-006（inspect 3-command 正規化）: relates-to。意味検査移管（RU-IR-007）は DEC-006 の適用範囲拡張ではなく、REQ-010-003/004/018..028 の一般原則の適用。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-rules-catalog
    target_area: check_integrity.ts 実装範囲
    source_items: [AG-001, AG-009]
    content: |
      catalog 記述「check_integrity.ts は全 IR ルール（full-audit gate_level）を実装する」を事実化。
      「check_integrity.ts は現存 IR の detector を実装する。detector 共有は個別到達性と回帰証拠が追跡可能な場合に許可（REQ-010-269 包括カバー許容）」へ更新。
      lifecycle_state/enforcement_mode/baseline_status フィールド記述を全て削除。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: baseline_status 定義
    source_items: [AG-009, AG-010]
    content: |
      baseline_status を IR schema から除去。finding-baseline 分類（current finding = new/known、resolved = 現行 finding/baseline 集合からの除去）を finding の状態として新たに定義する。
      tombstone 群（IR-011 型 file-backed）は AG-008 で物理削除。
      lifecycle_state/enforcement_mode の契約定義を削除。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: numbering-policy
    target_area: 既知の欠番
    source_items: [AG-008]
    content: |
      欠番管理の責務を明記。IR 廃止時の交叉参照（v2:REQ-NNN 等）の再配置先として req-impact-map.md/retired/ を正規所有者として指定。
      numbering-policy は欠番の存在宣言のみを担い、交叉参照データの体系的蓄積は req-impact-map/retired/ が担う。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: IR lifecycle 属性
    source_items: [AG-009]
    content: |
      IR frontmatter の lifecycle_state/enforcement_mode/baseline_status フィールドを全て削除。
      severity と gate_level フィールドは維持（REQ-010-058 UPDATE）。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: rule-ownership
    target_area: IR 別関連マッピング
    source_items: [AG-003, AG-004, AG-010]
    content: |
      全 IR の KEEP/MERGE/IMPLEMENT/DELETE 判定後の所有権マッピングを更新。
      RETIRE/MERGE された IR の行を削除、IMPLEMENT IR の detector/test 責務を明記。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: req-impact-map
    target_area: IR → REQ 逆方向参照
    source_items: [AG-008, AG-010]
    content: |
      廃止 IR の交叉参照（v2:REQ-NNN 等）の再配置先として正規所有者化。
      RETIRE/MERGE された IR の逆方向参照を整理。
  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: vocabulary-registry
    target_area: 文意品質検出対象語（IR-045 参照）
    source_items: [AG-010]
    content: |
      IR-045（catalog-only deleted）の参照整理。vocabulary-registry.md「文意品質検出対象語（IR-045）」の参照を、agentdev-doc-writing への移管完了状態へ更新。

conflict_resolutions:
  - id: CR-001
    conflict: RU-IR-008 の tombstone 廃止が履歴性を損なう可能性（IR-011 の交叉参照データ消失リスク）
    resolution: |
      Git 履歴は履歴性を担保するが、HEAD で参照可能な gap-reason は別途必要。
      numbering-policy の既知の欠番表が欠番存在宣言を担い、交叉参照（v2:REQ-NNN 等）は req-impact-map.md/retired/ 配下が正規所有者として担う。
      物理削除前に交叉参照を再配置することが AG-008 に明記された（adversarial-review Audit CA-1）。
  - id: CR-002
    conflict: RU-IR-009 の lifecycle 簡素化が一時移行検査（RU-IR-006）の滞在場所を奪う可能性
    resolution: |
      一時移行検査は IR 集合から分離され、別種検査（終了条件付き）として運用。
      別種検査の所在は対象 SPEC/migration plan 配下、終了条件監視機構（期限超過警告等）を AG-006 に明記した（adversarial-review 争点3 + Audit CA-2）。
      継続的再発防止価値がある場合は IR へ昇格（8 項目存在条件を満たす必要あり）。
  - id: CR-003
    conflict: AG-012「件数削減禁止」と AG-004「DELETE」の緊張関係
    resolution: |
      AG-012 は恣意的件数目標の禁止。AG-004 DELETE は存在条件不合格由来の構造的帰結。
      両者は論理的に独立。存在条件の厳格度（AG-001 修正条件: detector 共有許可 + 個別到達性 + 回帰証拠）が適正なら、緊張関係は発火しない（adversarial-review 争点4）。

operation_units:
  - ou_id: OU-001
    target_req: REQ-028
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-028 (docs/requirements/REQ-028.md)
      saved_decision_docs:
        - DEC-013 (docs/decisions/DEC-013.md)
      ou_to_req_mapping:
        target_req: REQ-028
        req_doc: docs/requirements/REQ-028.md
      source_items_to_req:
        AG-001..AG-012: REQ-028-001..013 (draft ACT-REQ-001 content を verbatim で保存)
      case_open_input:
        epic_needed: true
        ou_ready: true
        dec_013_status: accepted
    content_summary: |
      Phase 0: 現状 baseline 固定。変更前の IR/detector/test/baseline/gate/docs-check 実行結果を記録。
  - ou_id: OU-002
    target_req: REQ-028
    operation: create
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-028 (docs/requirements/REQ-028.md)
      saved_decision_docs:
        - DEC-013 (docs/decisions/DEC-013.md)
      ou_to_req_mapping:
        target_req: REQ-028
        req_doc: docs/requirements/REQ-028.md
      source_items_to_req:
        AG-003: REQ-028-003 (双方向ポートフォリオ監査)
      case_open_input:
        epic_needed: true
        ou_ready: true
        dec_013_status: accepted
    content_summary: |
      Phase 1: 全 IR 双方向監査。IR→実装、実装→IR の両方向で証拠収集。14 項目調査。全 59 IR + catalog-only IR。
  - ou_id: OU-003
    target_req: REQ-028
    operation: create
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-028 (docs/requirements/REQ-028.md)
      saved_decision_docs:
        - DEC-013 (docs/decisions/DEC-013.md)
      ou_to_req_mapping:
        target_req: REQ-028
        req_doc: docs/requirements/REQ-028.md
      source_items_to_req:
        AG-004: REQ-028-004 (KEEP/MERGE/IMPLEMENT/DELETE 4値分類)
      case_open_input:
        epic_needed: true
        ou_ready: true
        dec_013_status: accepted
    content_summary: |
      Phase 2: KEEP/MERGE/IMPLEMENT/DELETE 判定。各 IR の存在条件（AG-001）に照らして 4 値へ分類。
  - ou_id: OU-004
    target_req: REQ-028
    operation: create
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-028 (docs/requirements/REQ-028.md)
      saved_decision_docs:
        - DEC-013 (docs/decisions/DEC-013.md)
      ou_to_req_mapping:
        target_req: REQ-028
        req_doc: docs/requirements/REQ-028.md
      source_items_to_req:
        AG-005: REQ-028-005 (横断的再評価、共通 detector 統合可能性)
      case_open_input:
        epic_needed: true
        ou_ready: true
        dec_013_status: accepted
    content_summary: |
      Phase 3: 横断統合設計。migration residual 等の共通化と重複 IR の統合方式を決定。
  - ou_id: OU-005
    target_req: REQ-028
    operation: create
    scale: standard
    depends_on: [OU-004]
    recommended_order: 5
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-028 (docs/requirements/REQ-028.md)
        - REQ-010 (docs/requirements/REQ-010.md; REQ-010-053..057 RETIRE, REQ-010-058 UPDATE)
      saved_decision_docs:
        - DEC-013 (docs/decisions/DEC-013.md; status: accepted)
      ou_to_req_mapping:
        target_req: REQ-028
        req_doc: docs/requirements/REQ-028.md
        req_010_doc: docs/requirements/REQ-010.md
      source_items_to_req:
        AG-008: REQ-028-008 + DEC-013 AG-008 系 + REQ-010-053..057 RETIRE
        AG-009: REQ-028-009 + REQ-028-010 + DEC-013 AG-009 系 + REQ-010-058 UPDATE
      case_open_input:
        epic_needed: true
        ou_ready: true
        dec_013_dependency_satisfied: true
        dec_013_status: accepted
    content_summary: |
      Phase 4: IR 管理モデル再設計。lifecycle/enforcement/baseline_status 除去、tombstone 廃止、新規登録 gate を存在条件に合わせて簡素化。DEC-013 適用、REQ-010-053..057 RETIRE、REQ-010-058 UPDATE、SPEC 群 UPDATE。
      依存成立条件: case-open 時点で DEC-013 が accepted/current authority であること（現時点で DEC-013 存在を前提としない）。
  - ou_id: OU-006
    target_req: REQ-028
    operation: create
    scale: large
    depends_on: [OU-005]
    recommended_order: 6
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-028 (docs/requirements/REQ-028.md)
      saved_decision_docs:
        - DEC-013 (docs/decisions/DEC-013.md)
      ou_to_req_mapping:
        target_req: REQ-028
        req_doc: docs/requirements/REQ-028.md
      source_items_to_req:
        AG-010: REQ-028-011 (DELETE/MERGE 残存物確認)
        AG-012: REQ-028-013 (件数目標禁止)
      case_open_input:
        epic_needed: true
        ou_ready: true
        dec_013_status: accepted
    content_summary: |
      Phase 5: 判定結果適用。KEEP/MERGE/IMPLEMENT/DELETE を checker/test/fixture/baseline/catalog 等へ一貫反映。完全除去（AG-010）の実行。baseline_status を IR から除去し finding-baseline 分類へ分離。
  - ou_id: OU-007
    target_req: REQ-028
    operation: create
    scale: standard
    depends_on: [OU-006]
    recommended_order: 7
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-028 (docs/requirements/REQ-028.md)
      saved_decision_docs:
        - DEC-013 (docs/decisions/DEC-013.md)
      ou_to_req_mapping:
        target_req: REQ-028
        req_doc: docs/requirements/REQ-028.md
      source_items_to_req:
        AG-001..AG-012: REQ-028-001..013 全体再検証 (AC-01..22)
      case_open_input:
        epic_needed: true
        ou_ready: true
        dec_013_status: accepted
    content_summary: |
      Phase 6: 全体再検証。存在条件および AC-01〜22 を再検証。

test_strategy:
  - id: TS-001
    target_item: AG-004
    verification: |
      全 file-backed IR（IR-001..061、IR-017 欠番、IR-045 catalog-only）について、KEEP/MERGE/IMPLEMENT/DELETE の判定記録（audit log または catalog フィールド）を確認する。
    pass_criteria: |
      全 IR ID に 4 値のいずれかの判定が存在する。未判定存続なし。
    on_failure: |
      fix-and-reverify。未判定 IR を特定し、存在条件（AG-001）に照らして判定を付与する。
  - id: TS-002
    target_item: AG-003
    verification: |
      各 IR の判定について、canonical basis/detector/test/route の証拠記録を確認する。
    pass_criteria: |
      全判定に具体的な証拠が記録されている。
    on_failure: |
      fix-and-reverify。証拠欠損 IR を特定し、証拠を補完する。
  - id: TS-003
    target_item: AG-001
    verification: |
      現存する全 IR に現行 canonical basis（REQ/Decision/SPEC のいずれか）が存在することを確認する。
    pass_criteria: |
      現存全 IR に canonical basis が存在する。
    on_failure: |
      fix-and-reverify。canonical basis 欠落 IR を DELETE または IMPLEMENT（basis 再同定）へ再分類。
  - id: TS-004
    target_item: AG-001
    verification: |
      現存する全 IR に executable detector（専有または共有）が存在することを確認する。
    pass_criteria: |
      現存全 IR に detector が存在する。共有 detector の場合は個別到達性が追跡可能。
    on_failure: |
      fix-and-reverify。detector 欠落 IR を IMPLEMENT または DELETE へ再分類。
  - id: TS-005
    target_item: AG-001
    verification: |
      docs-check/CI/保存工程の正規実行経路から各 IR の detector が到達可能であることを確認する。
    pass_criteria: |
      現存全 IR の detector が正規実行経路から到達可能。
    on_failure: |
      fix-and-reverify。到達不能 IR を IMPLEMENT（route 追加）または DELETE へ再分類。
  - id: TS-006
    target_item: AG-001
    verification: |
      現存する全 IR に regression test が存在することを確認する。
    pass_criteria: |
      現存全 IR に regression test が存在する。
    on_failure: |
      fix-and-reverify。test 欠落 IR を IMPLEMENT または DELETE へ再分類。
  - id: TS-007
    target_item: AG-001
    verification: |
      各 IR の detection method と detector implementation の coverage を比較する。共有 detector の場合は個別 invariant のコードパスと regression 証拠を確認する。
    pass_criteria: |
      現存全 IR で detection method と detector の coverage が一致する。
    on_failure: |
      fix-and-reverify。coverage 不一致 IR を IMPLEMENT（coverage 拡張）または MERGE/DELETE へ再分類。
  - id: TS-008
    target_item: AG-003
    verification: |
      checker/detector から IR を逆引きし、所有 IR が不明な検査が残存しないか確認する。
    pass_criteria: |
      所有 IR 不明の検査が残存しない。
    on_failure: |
      fix-and-reverify。所有者不明検査を特定 IR へ紐付けるか削除する。
  - id: TS-009
    target_item: AG-010
    verification: |
      DELETE/MERGE 対象 IR の checker/test/fixture/baseline が orphan として残存しないか検索する。
    pass_criteria: |
      orphan test/fixture/baseline が残存しない。
    on_failure: |
      fix-and-reverify。orphan を特定し削除する。
  - id: TS-010
    target_item: AG-007
    verification: |
      docs-check の IR 集合を走査し、意味判断・文脈判断を必要とする IR が残存しないか確認する。
    pass_criteria: |
      意味判断・文脈判断を必要とする IR が docs-check に残存しない。
    on_failure: |
      fix-and-reverify。該当 IR を inspect/diagnostics へ移管する。
  - id: TS-011
    target_item: AG-008
    verification: |
      file-backed tombstone IR（IR-011 型）が残存しないか確認する。物理削除済みであることを検証する。
    pass_criteria: |
      file-backed tombstone IR が残存しない。
    on_failure: |
      fix-and-reverify。残存 tombstone の交叉参照を req-impact-map/retired/ へ再配置後、物理削除する。
  - id: TS-012
    target_item: AG-008
    verification: |
      廃止 IR ID が再利用されていないことを numbering-policy の既知の欠番表と照合する。
    pass_criteria: |
      廃止 IR ID の再利用なし。
    on_failure: |
      fix-and-reverify。再利用 ID を別 ID へ振り直す。
  - id: TS-013
    target_item: AG-009
    verification: |
      現存全 IR に lifecycle_state/enforcement_mode/baseline_status 属性が存在しないことを確認する。
    pass_criteria: |
      detector を持たない現行 IR が存在しない。lifecycle_state/enforcement_mode/baseline_status フィールドが現行 IR から削除済み。
    on_failure: |
      fix-and-reverify。属性残存 IR を修正する。
  - id: TS-014
    target_item: AG-010
    verification: |
      baseline_status が IR schema から除去され、finding-baseline 分類（new/known/resolved）が finding 側で定義されていることを確認する。
    pass_criteria: |
      IR schema に baseline_status が存在しない。finding-baseline 分類が別途定義されている。
    on_failure: |
      fix-and-reverify。baseline_status 残存 IR を修正、finding-baseline 分類を補完する。
  - id: TS-015
    target_item: AG-005
    verification: |
      migration 固有の検査が不必要に恒久 IR として増殖していないか、AG-006 の別種検査 registry と照合する。
    pass_criteria: |
      migration 固有検査の恒久 IR 増殖構造が解消されている。
    on_failure: |
      fix-and-reverify。該当 IR を別種検査へ移行する。
  - id: TS-016
    target_item: AG-005
    verification: |
      MERGE された IR の有効な検出ケースが統合先の regression test で維持されていることを確認する。
    pass_criteria: |
      MERGE 前後で検出ケースが維持されている。
    on_failure: |
      fix-and-reverify。統合先 test へ検出ケースを追加する。
  - id: TS-017
    target_item: AG-010
    verification: |
      DELETE された IR の不要な checker/test/baseline/catalog/ownership/gate 等の残存参照を全 repository 検索する。
    pass_criteria: |
      残存参照が存在しない。
    on_failure: |
      fix-and-reverify。残存参照を削除する。
  - id: TS-018
    target_item: AG-003
    verification: |
      catalog/index/ownership/generated metrics が実在する現行 IR 集合と一致することを確認する。
    pass_criteria: |
      catalog/index/ownership/generated metrics が現行 IR 集合と一致する。
    on_failure: |
      fix-and-reverify。不整合を修正する。
  - id: TS-019
    target_item: AG-007
    verification: |
      docs-check および repo-agentdev-integrity の記述と実装が現行 Decision/REQ/SPEC モデルと一致することを確認する。
    pass_criteria: |
      記述と実装が現行モデルと一致する。
    on_failure: |
      fix-and-reverify。
  - id: TS-020
    target_item: AG-011
    verification: |
      新規 IR 登録時に canonical basis/detector/regression test/execution route の存在を確認できる手順が存在することを確認する。
    pass_criteria: |
      新規 IR 登録 gate 手順が存在し、4 要素の同時成立を検証できる。
    on_failure: |
      fix-and-reverify。gate 手順を補完する（未決事項: hard gate vs 運用 gate の確認後）。
  - id: TS-021
    target_item: AG-003
    verification: |
      変更前 baseline（OU-001 Phase 0 記録）と比較し、検出 coverage の差分を確認する。意図的削除による coverage 低下を区別する。
    pass_criteria: |
      意図的削除以外の coverage 低下がない。意図的削除は finding として記録されユーザー承認済み。
    on_failure: |
      record-in-findings。意図的削除に由来しない coverage 低下を finding として記録し、ユーザー承認を得る。fix-and-reverify へ切替可能。
  - id: TS-022
    target_item: AG-010
    verification: |
      関連 test suite を実行し、本変更起因の未解消 regression がないことを確認する。
    pass_criteria: |
      本変更起因の未解消 regression がない。
    on_failure: |
      fix-and-reverify。regression を修正する。

review_dispositions: []

case_open_hints:
  epic_needed: true
  decomposition: |
    Phase 0-6 を 7 operation_units（OU-001..007）へ 1 対 1 対応で分割。
    OU-001 は Phase 0 baseline 固定（標準）。
    OU-002 は Phase 1 双方向監査（large、全 59 IR）。
    OU-003 は Phase 2 KEEP/MERGE/IMPLEMENT/DELETE 判定（標準）。
    OU-004 は Phase 3 横断統合設計（標準）。
    OU-005 は Phase 4 IR 管理モデル再設計（標準、DEC-013 依存: case-open 時点で DEC-013 accepted を依存成立条件）。
    OU-006 は Phase 5 判定結果適用（large、完全除去 + baseline_status 除去含む）。
    OU-007 は Phase 6 全体再検証（標準、AC-01..22）。
  wave_hints:
    - "Wave 0: OU-001 (Phase 0 baseline 固定)"
    - "Wave 1: OU-002 (Phase 1 双方向監査)"
    - "Wave 2: OU-003 (Phase 2 判定)"
    - "Wave 3: OU-004 (Phase 3 横断統合設計) → OU-005 (Phase 4 IR 管理モデル再設計、DEC-013 依存)"
    - "Wave 4: OU-006 (Phase 5 判定結果適用)"
    - "Wave 5: OU-007 (Phase 6 全体再検証)"
    - "実際の依存解析・並列化は case-open が決定する"
```

# summary

本 draft は RU「IR 体系の実効性監査・再編と存在条件厳格化」を要件化したもの。REQ-028（新規 CREATE、13 要件項目）と DEC-013（新規 CREATE、AG-008 tombstone 廃止 + AG-009 lifecycle/enforcement/baseline_status 簡素化を統合）を中核とし、REQ-010-053..057（5 項目）を RETIRE、REQ-010-058 を UPDATE（baseline_status を維持対象から除外）、7 SPEC を UPDATE する。

architecture-advisory（Step 5-4）で Candidate 1（tombstone 廃止 + lifecycle 簡素化）の Decision 必要・統合を確定、Candidate 2（意味検査移管）は Decision 不要を確定。

adversarial-review（経路A、Step 10 前）で 6 争点を審議し、5 争点で合意候補形成、1 争点（AG-012 vs AG-004）は実質的争点なしとして棄却。Audit で新規 2 争点（CA-1: 交叉参照の正規所有者、CA-2: 別種検査の終了条件監視）を抽出し、AG-008/AG-006 へ反映済み。

ユーザー確認事項 Q-A〜Q-D 解消済み（auto_ready: true）:
- Q-A: AG-011 修正版 (c) 採用。IR 存在資格 gate（全新規 IR、hard）+ hard governance 追加 gate（blocking hard-control IR、DEC-001 決定4 の 7 条件立証）の 2 種。enforcement_mode 非依存、blocking/non-blocking 区別。
- Q-B: baseline_status を IR schema から除去。finding-baseline 分類（new/known/resolved）は finding 側へ分離。「実装修復済み」resolved も IR には残さない。
- Q-C: OU-001..007（7 OU）↔ Phase 0..6 へ修正。Wave 0-5 構成参考、実際は case-open が決定。
- Q-D: DEC-013 統合承認（Q-B 反映条件付き）。AG-008 + AG-009 は「IR の現在性を複数状態フィールドで管理せず、存在そのものと実効性を一致させる」という同一設計判断。

Phase 0-6 を 7 operation_units（OU-001..007）へ 1 対 1 対応で分割し、Scale: large、Epic 規模候補。OU-005（Phase 4）は case-open 時点で DEC-013 が accepted であることを依存成立条件とする（現時点で DEC-013 存在を前提としない）。
