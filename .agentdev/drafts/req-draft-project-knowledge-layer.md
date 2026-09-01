---
draft_type: req_draft
topic_slug: project-knowledge-layer
status: saved
created_at: 2026-09-01
source_rus:
  - RU-0001
---

# draft-data

```yaml
work_type: feature

scale: large

summary: プロジェクト知識を Capability Skill から分離し、docs/knowledge/ 配下の独立した正規知識層（Knowledge 文書種別）として管理する。learning 由来は backlog-review の利用者承認後に直接 docs/knowledge/ へ保存する軽量経路とし、learning 以外の明示的登録入口は REQ-056 に存在要求のみを持たせ command 詳細契約は command 級 REQ に分離する。REQ-056 をプロジェクト知識一般へ一般化し、REQ-001/038/039/054 を Knowledge 経路へ整合させ、Decision を新設する。通常Case、feature/large、Epic 規模。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      Knowledge 文書種別を導入し、docs/knowledge/ 配下をプロジェクト知識の正規所有領域とする。
      1知識1 Markdown ファイル、ファイル名は kebab-case の slug、固定 ID 採番なし。
      各知識文書は必須内容5項目（知識内容、適用条件、適用対象、根拠、関連知識）を備える。
      正規配置、命名、必須内容を機械検査できること。知識文書の意味的妥当性は機械検査で確定させない。
  - id: AG-002
    content: |
      REQ-056 を技術固有知識（リスク判断知識）限定からプロジェクト知識一般へ一般化する。
      REQ-056-005 の「Knowledge 独立文書種別の導入は未決事項」の記述を解消する。
      REQ-056-002 の「Capability Skill Extension 経由で接続する」契約は削除ではなく、
      docs/knowledge/ を正規知識領域として認識し利用可能なハーネスの探索能力を通じて利用する契約へ置換する。
      extension 機構そのものの契約（REQ-002-030/031）は変更しない。
  - id: AG-003
    content: |
      learning 由来の知識化経路は learning → learning-promote（project knowledge 候補へ分類）→
      backlog-review → 利用者承認 → docs/knowledge/ 直接保存とし、RU → req-define → case-run の
      要件化経路を通さない。Knowledge は要件変更ではなく恒久資産の追加である。
      REQ-039-001/004/006 を「docs/knowledge/ への知識文書保存」を正規完了経路として含む契約へ変更し、
      保存に成功した採用済み成果物も promoted から削除されるようにする。
      REQ-039-006 の「昇華先が現行体系に存在しない知識は deferred として保留」の記述は解消する。
      REQ-038-005 の「learning-promote → backlog-review → RU → req-define の固定経路」記述を、
      プロジェクト知識候補の分岐可能な経路へ変更する。
  - id: AG-004
    content: |
      learning 以外からプロジェクト知識を明示的に登録できる入口の存在要求を REQ-056 に置く。
      実際の公開 command の入出力・副作用・承認境界等の詳細契約は 1 command 1 REQ 原則に従い
      新規 command 級 REQ として別途定義し、REQ-056 には存在要求のみを持たせる。
      REQ-036/037 へ入口を配置しない（intake を知識入口化しない合意と REQ-037 の intake 責務に衝突する）。
  - id: AG-005
    content: |
      知識文書の新規、更新、置換、削除は利用者承認必須とする。
      learning 由来の直接保存経路も利用者承認を経る。
  - id: AG-006
    content: |
      責務分離と対象外境界を確定する。intake はプロジェクト知識の登録入口化しない。
      最小トレーサビリティモデル（TIM）は知識探索のために拡張しない。
      Project Extension はプロジェクト知識の正規所有先としない。
      配布成果物は docs/knowledge/ に依存せず自己完結を維持する（REQ-001-031 維持）。
      ADF 独自の検索機構を持たず、利用可能なハーネスの探索能力を前提とする。
  - id: AG-007
    content: |
      初期利用箇所は req-analysis（REQ-054 の変更誘発境界リスク分析）とする。
      REQ-054-002 の参照経路を extension 読込から docs/knowledge/ + ハーネス探索へ変更する。
      知識が不在の場合は ADF core の一般規則のみで 5観点境界分析を実行し、分析を省略しない。
  - id: AG-008
    content: |
      知識文書種別を文書体系へ統合する。REQ-001 の文書種別列挙に知識を追加する。
      document-model Design の責務マトリックスへ Knowledge 行を追加する。
      patterns Design へ知識文書フォーマット規約を追加する。
      document-type-responsibilities Design へ知識文書の配置基準を追加する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-056
    source_items: [AG-001, AG-002, AG-004, AG-005, AG-006]
    content: |
      REQ-056.md の本文を次の内容で置換する（frontmatter の updated は req-save の責務）。

      ## 目的

      プロジェクト知識（プロジェクト固有の再利用可能な判断材料）を Capability Skill から分離し、docs/knowledge/ 配下の独立した正規知識層として管理する。ADF core（配布成果物）は一般規則のみを持ち、プロジェクト知識を ADF core に埋め込まない。知識は learning から昇華されて成長し、判断の材料として使われる成長する資産として扱う。

      本 REQ が所有するのは docs/knowledge/ の知識文書契約、知識の登録経路、workflow からの利用契約である。extension 機構・Capability Skill モデルの契約は REQ-002-030/031・REQ-027 が正規所有のまま変更せず、本 REQ が所有面の正本である。禁止面（配布成果物がプロジェクト知識を保持しない）の正本は REQ-002、所有面の正本は本 REQ として相互参照する（REQ-002-039 の例外条件に適合）。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-056-001 | プロジェクト知識は docs/knowledge/ 配下へ 1知識1 Markdown ファイルとして配置し、ファイル名は kebab-case の slug とすること。固定 ID 採番を持たず、slug が識別子となること |
      | REQ-056-002 | プロジェクト知識を利用する判断処理は、docs/knowledge/ を正規知識領域として認識し、利用可能なハーネスの探索能力を通じて関連知識を判断材料として利用できること |
      | REQ-056-003 | 各知識文書は知識内容、適用条件、適用対象、根拠、関連知識を備えること |
      | REQ-056-004 | learning 由来のプロジェクト知識候補は、backlog-review が利用者承認後に docs/knowledge/ へ直接保存する経路を持つこと（REQ-039） |
      | REQ-056-005 | learning 以外からプロジェクト知識を明示的に登録できる公開入口が存在すること |
      | REQ-056-006 | 知識文書の新規、更新、置換、削除は利用者承認を経ること |
      | REQ-056-007 | intake はプロジェクト知識の登録入口としないこと |
      | REQ-056-008 | 最小トレーサビリティモデルはプロジェクト知識の探索のために拡張しないこと |
      | REQ-056-009 | Project Extension はプロジェクト知識の正規所有先としないこと |
      | REQ-056-010 | docs/knowledge/ の正規配置、命名、必須内容を機械検査できること |
      | REQ-056-011 | 知識文書の意味的妥当性を機械検査で確定させないこと |

      ## 適用範囲

      - **対象**: docs/knowledge/ 配下のプロジェクト知識文書、知識の登録経路（learning 昇華と明示的登録）、workflow からの利用契約、知識成長サイクル（learning 流入 → 保管 → 利用）
      - **対象外**: extension 機構の配置と読込境界（REQ-002-030/031）、Capability Skill 抽出契約（REQ-027、workflow-skill-model Design）、明示的登録入口となる公開 command の入出力・副作用・承認境界の詳細契約（command 級 REQ が所有）、learning 昇華先ルーティングの契約本体（REQ-039）、配布成果物側のプロジェクト知識非保持（REQ-002、禁止面の正本）、最小トレーサビリティモデル（REQ-012）

      ## 関連情報

      **関連 REQ**: REQ-054（変更誘発境界リスク分析、知識の利用側）、REQ-002（配布成果物の責務境界、禁止面の正本と extension 機構）、REQ-039（バックログ統合、learning 由来知識候補の docs/knowledge/ 直接保存）、REQ-001（文書体系、知識文書種別の列挙）
      **関連 Design**: document-model Design（知識文書種別の基準境界）、patterns Design（知識文書フォーマット規約）、document-type-responsibilities Design（配置基準と執筆時判定）、backlog-review Design（learning 由来の知識文書保存手順）、req-analysis Design（分析観点での知識参照）
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-039
    source_items: [AG-003, AG-005]
    content: |
      REQ-039.md の次の行を変更後の内容で置換する。

      REQ-039-001（変更後）:
      backlog-review は採用済み成果物を分析、統合し、ユーザー承認を経て RU（要件ユニット）を生成すること。プロジェクト知識候補については docs/knowledge/ への知識文書保存（REQ-056）を RU と同等の正規完了経路として生成すること

      REQ-039-004（変更後）:
      backlog-review は RU 化に成功した採用済み成果物を promoted から削除し、失敗した成果物と矛盾成果物は残置すること。docs/knowledge/ への知識文書保存に成功した採用済み成果物も promoted から削除すること

      REQ-039-006（変更後）:
      backlog-review は learning-promote が渡した反映先分類結果を消費し、分類に応じて (a) 恒久所有先（既存 REQ/Decision/Design 反映、ガードレール移管、docs/knowledge/ への知識文書保存、Project Extension の接続更新）への昇華、(b) 通常の Issue による修正、(c) 重複・陳腐化した知識の削除、(d) 現時点で反映不能なものの保留、へルーティングすること。適用対象は learning 由来の分類結果とし、intake/inspect 由来は現行の RU 化経路を維持すること。docs/knowledge/ への知識文書保存は利用者承認を経て backlog-review が直接実行する正規昇華経路とする（REQ-056）。ADF リポジトリ外の project-local 資産への昇華は backlog-review が直接書き換えず、書き込み先の実行前提（git 管理境界）を明示した指示を出力に含めること。RU 以外への昇華も REQ-039-001 の承認原則に準拠してユーザー承認を経ること

      適用範囲・対象外（変更後）:
      - **対象外**: 一時成果物の配置、ライフサイクル、構造化契約（REQ-008）、取り込みパイプライン、学習パイプライン、検出コマンド群（各分割先 REQ）、RU の要件化（req-define、REQ-004）、docs/knowledge/ の知識文書契約（REQ-056）
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-038
    source_items: [AG-003]
    content: |
      REQ-038.md の次の行を変更後の内容で置換する。

      REQ-038-005（変更後）:
      learning pipeline は学びを保存するだけでなく、再発防止のために反映先（既存 REQ / Decision / Design への反映、Skill の改善、決定論的な検査・ガードレールへの移管、既存処理手順の改善、通常の Issue による修正、重複・陳腐化した知識の削除、docs/knowledge/ への知識文書保存、現時点では反映不能なものの保留）を評価して分類すること。learning-promote がこれらを直接変更せず、learning-promote → backlog-review の承認経路を維持すること。プロジェクト知識候補は backlog-review の利用者承認後に docs/knowledge/ へ直接保存され、RU → req-define の要件化経路を通らないこと（REQ-056、REQ-039）。構造改善先の分類結果を後続工程へ渡すこと
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-054
    source_items: [AG-007, AG-006]
    content: |
      REQ-054.md の次の行を変更後の内容で置換する。

      REQ-054-002（変更後）:
      変更誘発境界リスク分析は、docs/knowledge/ 配下のプロジェクト知識（リスク導出規則を含む判断知識）を参照できること。知識の参照は docs/knowledge/ を正規知識領域とし、利用可能なハーネスの探索能力を通じて行うこと（REQ-056）。知識が不在の場合は ADF core の一般規則のみで 5観点境界分析を実行すること（分析を省略しない）
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-001
    source_items: [AG-008]
    content: |
      REQ-001.md の次の行を変更後の内容で置換する。

      REQ-001-001（変更後）:
      | REQ-001-001 | 文書種別（要件、判断記録、設計、知識、案内、報告、索引、状態早見）ごとの責務は重複せず、各文書の配置基準が一意に定まること |
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: REQ-001
    target_area: 要件テーブル末尾（REQ-001-065 行の後）
    source_items: [AG-001, AG-008]
    content: |
      REQ-001.md の要件テーブルへ次の行を追加する（ID は req-save の採番規則で検証する）。

      | REQ-001-066 | プロジェクト知識文書はプロジェクト固有の再利用可能な判断材料を正規文書として所有し、docs/knowledge/ 配下へ配置し、知識内容、適用条件、適用対象、根拠、関連知識を備えること（REQ-056） |
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:project-knowledge-layer
    source_items: [AG-002]
    content: |
      # プロジェクト知識を Capability Skill から分離し、独立した正規知識層として管理する

      ## 背景

      プロジェクト知識（リスク導出規則等のプロジェクト固有の再利用可能な判断材料）の所有先は、Design と project-local Capability Skill に分担し、Capability Skill Extension 経由で workflow へ接続する構造（REQ-056）だった。知識がリポジトリ外の project-local 資産に保管されるため、ハーネスからの探索性、承認経路、成長サイクルの管理に課題がある。Knowledge 独立文書種別の導入は REQ-056-005 で未決事項として分離されていた。

      ## 決定

      プロジェクト知識を Capability Skill から分離し、docs/knowledge/ 配下の独立した正規知識層（Knowledge 文書種別）として管理する。

      - docs/knowledge/ をプロジェクト知識の正規所有領域とする。1知識1 Markdown ファイル（kebab-case slug、固定 ID 採番なし）
      - 知識利用は ADF 独自の検索機構を持たず、利用可能なハーネスの探索能力を前提とする
      - learning 由来の知識候補は backlog-review の利用者承認後に docs/knowledge/ へ直接保存する軽量経路とし、RU → req-define の要件化経路を通さない
      - learning 以外の明示的登録入口の存在要求は REQ-056 に置き、公開 command の詳細契約は command 級 REQ として別途定義する
      - Capability Skill Extension 経由の知識接続契約（旧 REQ-056-002）は廃止する。extension 機構自体の契約（REQ-002-030/031）は変更しない
      - 詳細な文書形式、配置基準、検査契約は REQ-056 と各 Design（document-model、patterns、document-type-responsibilities）に委譲する

      ## 根拠

      - 知識は要件変更ではなく恒久資産の蓄積であり、RU 化・Issue 化は知識化の目的に合わない
      - repo 内正規文書とすることで、ハーネス探索性、構造検査、履歴管理が得られる
      - 既存の学習昇華経路（learning-promote → backlog-review）が RU 以外の恒久所有先への振り分け責務を既に持ち、docs/knowledge/ 直接保存はその自然な拡張である
      - DEC-024 は変更誘発境界リスク分析の導入を決めたものであり、知識の所有構造は決めていないため、本判断を DEC-024 に混在させない
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "## 責務マトリックス"
    canonical_owner: document-model
    source_items: [AG-008, AG-001]
    content: |
      ## 責務マトリックス

      | 文書種別 | 記述するもの | 記述しないもの |
      |---|---|---|
      | REQ | 現行要件（WHAT: 何を満たすべきか） | 実装詳細、HOW、現在の動作記述 |
      | Decision | 将来の設計、運用、文書システムを制約する決定とその理由（WHY）<!-- REQ-001 --> | 可逆的な運用手順、状態遷移、形式定義 |
      | Design | REQ を満たすために現在採用している内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータ（現在のHOW）※リポジトリ内部設計文書。実行時配布物の依存先ではない（REQ-001）。Architecture を一部として含む | 新規要件、将来案、判断根拠（Decision の管轄）、採用理由、却下理由、作業履歴、監査結果、評価結果、実測値、実装コードそのもの、検証実行結果（REQ-001-003） |
      | Knowledge | プロジェクト固有の再利用可能な判断材料（知識内容、適用条件、適用対象、根拠、関連知識）。docs/knowledge/ 配下へ 1知識1 Markdown ファイル（kebab-case slug、固定 ID 採番なし）（REQ-056） | 実装コードそのもの、要件本文・判断記録本文・Design 本文との重複、標準知識（配布対象） |
      | Guides | 人間向けナビゲーション層。規範的権限を持たない（REQ-001） | 要件本文、契約本文、REQ/Decision/Design 内容の重複 |
      | Report | 監査、評価、観測、測定等の事実記録。必達要件の規範表現を持たない（REQ-001-065） | 規範要件、必達条件、現在設計の記述 |
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: foundations
      slug: patterns
    target_area: "### Knowledge frontmatter 規約"
    placement: after_anchor
    anchor: "### Design frontmatter 形式"
    canonical_owner: patterns
    source_items: [AG-001, AG-008]
    content: |
      ### Knowledge frontmatter 規約

      Knowledge 文書（docs/knowledge/ 配下、REQ-056）の frontmatter は以下の基本構造とする。

      | フィールド | 必須 | 内容 |
      |---|---|---|
      | title | 必須 | 知識の主題を表す名称 |
      | created | 必須 | 作成日（ISO 8601 の日付） |
      | updated | 必須 | 最終更新日。created 以降 |

      Knowledge 文書は固定 ID 採番を持たず、ファイル名 slug（kebab-case）が識別子となる。
      本体の必須セクションは知識内容、適用条件、適用対象、根拠、関連知識の5項目とする（REQ-056）。
      Knowledge 文書は独立文書種別であり、REQ・Decision・Design への ADF-COVERS 宣言を持たない。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: "### Knowledge 文書の配置基準（執筆時判断）"
    placement: after_anchor
    anchor: "### REQ と Design の配置境界（執筆時判断）"
    canonical_owner: document-type-responsibilities
    source_items: [AG-001, AG-008]
    content: |
      ### Knowledge 文書の配置基準（執筆時判断）

      | 判断 | 配置先 |
      |---|---|
      | プロジェクト固有の再利用可能な判断材料（リスク導出規則、設計ノウハウ、運用手順の背後にある判断根拠等）で、REQ/Decision/Design へ昇華する前に蓄積・共有する段階のもの | Knowledge 文書（docs/knowledge/、REQ-056） |
      | 現行要件として確定した成果 | REQ |
      | 採否判断とその理由 | Decision |
      | 現在の内部構造・動作 | Design |

      Knowledge 文書は1知識1ファイル（kebab-case slug）、必須内容5項目（知識内容、適用条件、適用対象、根拠、関連知識）とする。
      新規、更新、置換、削除は利用者承認を経る（REQ-056）。
      要求として確定すべき内容、現行設計として確定すべき内容は Knowledge に留めず、REQ/Decision/Design へ昇華する。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: commands
      slug: backlog-review
    target_area: "## learning 由来プロジェクト知識の docs/knowledge/ 直接保存"
    placement: after_anchor
    anchor: "## 現在の動作"
    canonical_owner: backlog-review
    source_items: [AG-003, AG-005]
    content: |
      ## learning 由来プロジェクト知識の docs/knowledge/ 直接保存

      learning-promote の反映先分類で docs/knowledge/ への知識文書保存（REQ-056、REQ-039-006）に振り分けられた採用済み成果物は、RU 化を経ずに以下の手順で処理する。

      1. 知識候補の内容を知識文書契約（1知識1ファイル、kebab-case slug、必須内容5項目）へ整形する
      2. 既存 docs/knowledge/ 配下ファイルとの重複・陳腐化を確認し、新規、更新、置換、削除の操作種別を判定する
      3. 操作種別ごとの変更内容を利用者へ提示し、承認を得る。承認なしの書き込みは行わない
      4. 承認後、docs/knowledge/ へファイルを書き込み、保存に成功した採用済み成果物を promoted から削除する

      構造整合性（正規配置、命名、必須内容）は docs-check 系の機械検査が担保し、意味的妥当性は機械で確定しない（REQ-056）。
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: skills
      slug: agentdev-req-analysis
    target_area: "## プロジェクト知識の参照観点"
    placement: after_anchor
    anchor: "## 信頼境界を扱う対象の非機能受け入れ条件観点"
    canonical_owner: req-analysis
    source_items: [AG-007]
    content: |
      ## プロジェクト知識の参照観点

      要件分析・壁打ちでは、docs/knowledge/ 配下のプロジェクト知識（REQ-056）を判断材料として参照できる。
      利用可能なハーネスの探索能力を通じて関連知識を検索し、知識の適用条件が分析対象に一致する場合のみ判断材料へ加える。
      知識が不在の場合、または適用条件が一致しない場合は ADF core の一般規則のみで分析を実行する（分析を省略しない、REQ-054-002）。
      知識の存在を理由に REQ/Decision/Design への確認を省略しない。

conflict_resolutions:
  - id: CR-001
    conflict: REQ-056-002 の旧契約（Capability Skill Extension 経由で接続）の扱い
    resolution: 削除ではなく Knowledge 利用契約（docs/knowledge/ を正規知識領域としてハーネス探索経由で利用）への置換を採用。REQ-056 は引き続き知識の workflow 利用契約を所有し、extension 機構自体は REQ-002-030/031 に残る。ユーザー確定済み（論点3-2）。
  - id: CR-002
    conflict: learning 以外の明示的登録入口の所有先（REQ-056 へ置くか、REQ-036/037 へ入れるか）
    resolution: REQ-056 に入口の存在要求のみを置き、公開 command の詳細契約は新規 command 級 REQ とする2層構成を採用。REQ-037 の intake 責務と「intake を知識入口化しない」合意の衝突を回避し、1 command 1 REQ 原則に整合。ユーザー確定済み（論点2）。
  - id: CR-003
    conflict: learning 由来知識候補の完了経路（RU → req-define を通すか、backlog-review から直接 docs/knowledge/ へ保存するか）
    resolution: backlog-review から利用者承認後に直接保存する経路を採用。Knowledge は要件変更ではなく、現行 backlog-review が RU 以外の恒久所有先への振り分け責務を持つ自然な拡張である。ユーザー確定済み（論点1、案A）。
  - id: CR-004
    conflict: REQ-056-005（Knowledge 導入の未決事項記述）の解消方法（行削除か、ID 維持の置換か）
    resolution: ID を維持した置換を採用。REQ-056-005 を「learning 以外の明示的登録入口の存在要求」へ転用し、削除による ID 欠番を避ける。
  - id: CR-005
    conflict: 実証Case の要否
    resolution: 通常Case を採用。Knowledge の所有構造・責務契約は設計段階で確定済みであり、実装後の通常テストと構造検査で検証可能。REQ-043-002 の「単なる追加調査は実証としない」に整合。ユーザー確定済み（論点4）。
  - id: CR-006
    conflict: RU-0001 frontmatter の REQ-008-051 必須4フィールド（generation_actor、agreement_confirmed_at、generation_stage、logical_key）欠落と tentative_classification 欠落
    resolution: session由来RU は backlog-review を経ないため暫定分類バリデーション（backlog-review への差し戻し）を適用せず、壁打ちで最終分類をユーザー確定済み。frontmatter 不備は RU 生成時契約違反として報告済みであり、内容の自足性は保たれているため本 draft では消費を継続する。後続工程で RU-0001 の物理的な修正は行わない（参照専用入力）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-056
    target_design:
      - docs/designs/foundations/document-model.md
      - docs/designs/foundations/patterns.md
      - docs/designs/responsibilities/document-type-responsibilities.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-039
    target_design:
      - docs/designs/commands/backlog-review.md
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: epic
    result: {}
  - ou_id: OU-003
    source_ru: RU-0001
    target_req: REQ-054
    target_design:
      - docs/designs/skills/agentdev-req-analysis.md
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: epic
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      実装された知識文書検査 script（docs-check 系 checker）を実行し、docs/knowledge/ 配下の
      正規配置、kebab-case 命名、必須内容5項目（知識内容、適用条件、適用対象、根拠、関連知識）の
      違反を検出できることを確認する。意味的妥当性が機械判定の対象に含まれていないことも確認する。
    pass_criteria: |
      検査が正常終了し、構造違反の報告が0件であること。意図的な構造違反サンプルを投入した場合に
      違反として検出されること。
    on_failure: |
      fix-and-reverify。検査 script または知識文書の配置を修正し、再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-056.md の本文を確認し、変更後の要件テーブル（REQ-056-001〜011）と目的・適用範囲が
      draft-data ACT-REQ-001 の content と一致することを確認する。
      旧記述（Knowledge 導入の未決事項、extension 接続契約）が現行文に残存しないことを確認する。
    pass_criteria: |
      REQ-056-005 が明示的登録入口の存在要求であること。REQ-056-002 がハーネス探索契約であること。
      旧記述の残存が0件であること。
    on_failure: |
      fix-and-reverify。REQ-056.md の内容を修正し、再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      backlog-review の知識文書保存経路を動作確認する。learning 由来の project knowledge 候補が
      利用者承認後に docs/knowledge/ へ保存され、保存に成功した採用済み成果物が promoted から
      削除されることを確認する。承認なしの書き込みが発生しないことも確認する。
    pass_criteria: |
      経路が正常動作し、promoted 削除が実行されること。承認なしの書き込みが0件であること。
    on_failure: |
      fix-and-reverify。backlog-review の実装または Design を修正し、再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-056.md に learning 以外の明示的登録入口の存在要求行（REQ-056-005）が存在することを確認する。
      公開 command の詳細契約が REQ-056 内に混入していないことも確認する。
    pass_criteria: |
      存在要求行が存在し、command 詳細契約の混入が0件であること。
    on_failure: |
      fix-and-reverify。REQ-056.md を修正し、再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      backlog-review Design（docs/designs/commands/backlog-review.md）の知識文書保存手順に
      利用者承認ステップが含まれること、および REQ-056-006 に承認必須の契約行が存在することを確認する。
    pass_criteria: |
      承認ステップと承認必須契約行の両方が存在すること。
    on_failure: |
      fix-and-reverify。Design または REQ の記述を修正し、再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      リポジトリ横断で確認する。grep により、(1) Capability Skill をプロジェクト知識の正規所有先とする
      記述、(2) Knowledge 導入の未決事項記述、(3) docs/knowledge/ へ依存する配布成果物
      （src/opencode/ 配下の command/skill 原本）の3点が残存しないことを確認する。
    pass_criteria: |
      3点の残存が0件であること（REQ-001-031 の配布成果物自己完結性が維持されること）。
    on_failure: |
      fix-and-reverify。該当記述・依存を修正し、再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      req-analysis の分析観点に docs/knowledge/ の参照が含まれることを確認する。
      知識が不在の場合に ADF core の一般規則のみで 5観点境界分析が実行される（分析が省略されない）
      ことを動作確認する。
    pass_criteria: |
      docs/knowledge/ 参照が分析観点に含まれ、知識不在時に分析が省略されないこと。
    on_failure: |
      fix-and-reverify。req-analysis の実装または Design を修正し、再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      document-model Design の責務マトリックスに Knowledge 行が存在すること、patterns Design に
      Knowledge frontmatter 規約セクションが存在すること、document-type-responsibilities Design に
      Knowledge 文書の配置基準セクションが存在すること、REQ-001 の文書種別列挙に知識が含まれることを
      確認する。
    pass_criteria: |
      全ての行・セクションが存在し、docs-check の Design 突合検査が合格すること。
    on_failure: |
      fix-and-reverify。該当 Design または REQ を修正し、再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001.変更対象候補-REQ-002
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      REQ-056 が所有面の正本として更新され、REQ-002 の extension 機構契約（REQ-002-030/031）は
      機構自体の契約であり変更不要。Capability Skill を知識の正規所有先とする記述は REQ-002 に存在せず、
      旧構造の残存確認は TS-006 の横断確認で担保する。
    evidence:
      path: docs/requirements/REQ-002.md
      section: REQ-002-030
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: RU-0001.Design配布物候補-learning-pipeline-backlog-integration
    disposition: partially_covered
    reason_code: consolidated_elsewhere
    reason: |
      learning 由来知識化手順の Design 正本を再確認した結果、backlog-review の実行詳細を所有する
      docs/designs/commands/backlog-review.md へ集約する。learning-pipeline Design と backlog-integration
      Design への個別変更は行わない（learning-pipeline は learning-promote の pipeline、backlog-integration
      は RU 生成の知識ベースであり、docs/knowledge/ 保存手順の正本ではない）。
    evidence:
      path: docs/designs/commands/backlog-review.md
      section: 現在の動作
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: RU-0001.Design配布物候補-索引案内
    disposition: partially_covered
    reason_code: deferred_to_implementation
    reason: |
      文書体系の索引・案内（README 入口表への知識文書追加、Knowledge を利用する command/skill の
      所在案内）は案内層の反映作業として実装工程で実施する。REQ/Design の変更対象から除外する。
      契約面は REQ-001-066（知識文書種別の追加行）と document-model の Knowledge 行で確定済み。
    evidence:
      path: docs/requirements/REQ-001.md
      section: REQ-001-055
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: RU-0001.Design配布物候補-文書整合性検査
    disposition: partially_covered
    reason_code: consolidated_elsewhere
    reason: |
      構造整合性検査の存在契約は REQ-056-010（機械検査要件）と REQ-056-011（意味検査の機械確定禁止）
      で採用済み。検査 checker の実装詳細（IR 追加、validator 構成、docs-check への統合方式）は
      実装工程での判断事項であり、本 draft では契約面のみ確定する。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0001
    source_item: RU-0001.方向5
    disposition: partially_covered
    reason_code: split_to_command_level_req
    reason: |
      learning 以外の明示的登録入口は REQ-056-005 の存在要求として採用。公開 command の入出力・
      副作用・承認境界等の詳細契約は 1 command 1 REQ 原則に従い新規 command 級 REQ として別途定義する
      （壁打ち論点2 の合意、REQ-037 の intake 責務との衝突回避）。入口の実装は本 draft の後続 Case の
      スコープ判断に委ねる。
    evidence:
      path: docs/requirements/REQ-056.md
      section: REQ-056-005（変更後）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    3系統の Epic Wave 構成候補。OU-001 知識文書契約の確立（REQ-001/056 更新、Decision 新設、
    document-model/patterns/document-type-responsibilities Design 更新、docs/knowledge/ 初期構造）。
    OU-002 learning 由来昇華経路（REQ-039/038 更新、backlog-review Design 更新、実装）。
    OU-003 知識利用と構造検査（REQ-054 更新、req-analysis Design 更新、docs-check 系検査拡張）。
    いずれも REQ-056 変更（ACT-REQ-001）と ACT-REQ-005/006（REQ-001）を OU-001 に含める。
  wave_hints:
    - OU-001 を Wave 1 とする
    - OU-002、OU-003 を Wave 2 とする（いずれも OU-001 の docs/knowledge/ 契約に必須依存）
```

# summary

## 合意内容

プロジェクト知識（リスク導出規則等のプロジェクト固有の再利用可能な判断材料）を Capability Skill から分離し、`docs/knowledge/` 配下の独立した正規知識層（Knowledge 文書種別）として管理する。壁打ちで5論点を確定した。

| 論点 | 判断 |
|---|---|
| learning 由来の知識化経路 | backlog-review から利用者承認後に直接 docs/knowledge/ へ保存（RU → req-define を通さない） |
| learning 以外の明示的登録入口 | REQ-056 に存在要求のみ。command 詳細契約は command 級 REQ に分離 |
| REQ-056 の UPDATE | 005 未決解消（置換転用）、002 は Knowledge 利用契約への置換、対象をプロジェクト知識一般へ拡張 |
| 実証 | 通常Case（評価ブランチ不要） |
| work_type / Scale / Decision | feature / large / Decision 新設（主題: プロジェクト知識を Capability Skill から分離し、独立した正規知識層として管理する） |

## 保存対象

- **REQ 更新（req-save 対象）**: REQ-056（主対象、全体一般化）、REQ-039（Knowledge 昇華経路）、REQ-038（固定経路の分岐可能化）、REQ-054（参照経路変更）、REQ-001（文書種別列挙の更新 + 知識文書種別の新規行）
- **Decision 新設（req-save 対象）**: new:project-knowledge-layer
- **Design 更新（design-save 対象）**: document-model（責務マトリックスに Knowledge 行）、patterns（Knowledge frontmatter 規約）、document-type-responsibilities（配置基準）、backlog-review（learning 由来保存手順）、req-analysis（知識参照観点）

## adversarial-review 結果

実施済み（2系統独立 stream、convergence audit 完了）。accepted finding 2件を反映:
1. REQ-056 対象外に「Capability Skill 抽出契約（REQ-027）」を維持（ACT-REQ-001 content 反映済み）
2. TS-001 verification に「実装された検査 script の実行」を明記

unresolved なユーザー判断事項なし。

## 補足

- RU-0001 の frontmatter 不備（REQ-008-051 必須4フィールド、tentative_classification 欠落）は conflict_resolutions CR-006 に記録済み。session由来RU のため差し戻しは適用せず、最終分類は壁打ちでユーザー確定済み
- 検証対応要否: 検証対応必須行なし（docs 変更中心のため実行時検証は構造検査と動作確認で充足）
