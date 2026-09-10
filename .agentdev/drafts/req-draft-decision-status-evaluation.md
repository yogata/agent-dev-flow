---
draft_type: req_draft
topic_slug: decision-status-evaluation
status: saved
created_at: 2026-09-10T10:45:43+09:00
source_rus: [RU-0001]
---

# draft-data

```yaml
design_actions_consumed: true

work_type: feature

scale: standard

summary: >-
  Decision の受理評価を case-open の正規工程へ組み込む（REQ-030 への APPEND）とともに、
  その前提となる Decision↔REQ 関係の正規情報源として Decision frontmatter の関連REQ宣言
  （related_reqs）と Decision 索引の AUTOGEN 化を確立する（新規 REQ）。あわせて inspect-docs に
  Decision 状態乖離の DRIFT 診断を追加する（REQ-036 への APPEND）。Design 側（棚卸し制・
  Design DRIFT）は前 draft（req-draft-design-status-evaluation-inventory）で確定済みであり、
  本 draft は RU-0001 の Decision 側を受け持つ。TIM の成果物型・関係型は変更しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons:
    - >-
      REQ-036-025 未確定または対象外除外文言不在（先行 draft design-status-evaluation-inventory
      が未 req-save の場合、本 draft の req-save は実行しない）

agreed_items:
  - id: AG-001
    content: >-
      Decision ファイルは frontmatter の標準フィールド related_reqs で関連 REQ 識別子を宣言的に
      保持する。関連 REQ が存在しない Decision は空の宣言として明示する（未宣言と無関係を区別する）。
      decisions/README.md の関連REQ表は当該フィールドから自動生成（AUTOGEN）とし、宣言を持たない
      Decision の検出と frontmatter・索引表間の整合検査を機械検査で行う。検出は finding
      （IR-061 系索引整合検査の拡張）とし、工程停止条件としない（DEC-001 決定4 の新規 hard control
      に該当しない構成。欠落時の停止は RU-0001 受け入れ条件 5 の取得不能停止として既合意の
      振る舞いに帰着する）。既存 Decision 全件（現行27件）へのバックフィルを当該実装 Case で実施し、
      写像は現行手動表と Decision 本文を原材料として人間確認の下で確定する。README 手動表に行の
      無い Decision（DEC-022/025/026/027）は Decision 本文の関係記述から導出する。
      バックフィルの明示承認記録は Case の対応記録コメントと人手レビュー結果の記録で満たす
      （architecture-advisory 2026-09-10 確定事項 5・8、U-1/U-4 推奨適用）。
  - id: AG-002
    content: >-
      case-open は Case Issue 作成前に、対象 REQ が related_reqs 宣言に含まれる Decision のうち
      status が proposed のものを評価対象として特定し、受理可否を評価する。req-define での合意内容と
      現行 REQ・Design・実装の状態から受理可否が一意に確定できる場合は既存ライフサイクル規則と
      承認記録形式に従って accepted へ自律遷移し、一意に確定できない場合はユーザー判断を求め、
      受理不能または情報不足の場合は Case を開始せず停止理由を報告する（RU-0001 受け入れ条件 1〜4、
      HITL 方針は REQ-003-055 共通原則、ユーザー合意 2026-09-10）。
  - id: AG-003
    content: >-
      関連 Decision の特定は正規情報源（related_reqs 宣言）のみを用い、本文の意味、文字列類似、
      周辺参照等の意味推測で補完しない。宣言欠落は機械検査で検出し、推測による代替を行わない
      （RU-0001 受け入れ条件 5）。related_reqs は REQ ファイル単位の宣言であり行レベルの関連は
      表現しないため、同一 REQ ファイル内の無関係行の Case でも評価対象に含まれ得る
      （過剰包含は受理評価漏れ防止の安全側方向。行レベルの正規記録先が確定した場合は
      限界を縮小できる）。
  - id: AG-004
    content: >-
      inspect-docs は、単なる proposed Decision の存在を異常とみなさず、関連 REQ の実装 Case が
      進行しているにもかかわらず受理評価されないままの proposed Decision を DRIFT として区別診断する。
      診断は検出・報告のみとし Decision の status を直接変更しない。判定は related_reqs 宣言と
      Case 完了状態の組合せによる（RU-0001 受け入れ条件 14）。
  - id: AG-005
    content: >-
      case-open の Decision 状態評価の再実行時に、既に accepted の Decision に対して重複する
      状態遷移や承認記録を生成しない（RU-0001 受け入れ条件 13 の Decision 側）。
  - id: AG-006
    content: >-
      本要件は TIM の標準成果物型・意味的関係に Decision を含めず、agentdev-traceability の
      公開 API（coverage / impact / check）を変更しない。related_reqs は Decision 成果物の
      ローカルメタデータであり、TIM の covers 関係とは独立に管理される
      （RU-0001 受け入れ条件 18 の維持）。decisions/README.md 関連REQ表の AUTOGEN 化は
      REQ-001-026/028 系の索引類自動生成機構（index-auto-generation Design の既約拡張ポイント）
      の適用領域拡張であり、TIM の派生索引ではなく、正規情報源は Decision frontmatter である
      （README 表は SSoT ではない）（architecture-advisory 2026-09-10 確定事項 1・2）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:decision-req-relations
    source_items: [AG-001, AG-003]
    content: |
      新規 REQ（Decision と REQ の関連宣言管理）を作成する。要件テーブル:
      | DRR-001 | Decision ファイルは frontmatter の標準フィールド（related_reqs）で関連 REQ 識別子を宣言的に保持すること。関連 REQ が存在しない Decision は空の宣言として明示すること |
      | DRR-002 | Decision 索引（decisions/README.md）の関連REQ表は Decision frontmatter から自動生成されること。手動での編集結果が frontmatter と矛盾する状態を残さないこと |
      | DRR-003 | 関連REQ宣言を持たない Decision（未宣言）を機械検出できること。未宣言と空宣言（関連なし）を区別すること。検出は索引整合検査（IR-061 系）の finding とし、工程停止条件としないこと |
      | DRR-004 | req-save は Decision 作成時に要件doc（draft-data）で確定した関連 REQ を当該フィールドへ保存すること |

      目的: Decision↔REQ の関連を、TIM の成果物型・関係型に依存せず Decision 成果物の
      ローカルメタデータとして正規管理し、ワークフロー（case-open、inspect-docs）が正規情報源から
      一意に取得できるようにする。

      適用範囲:
      - 対象: Decision frontmatter の関連REQ宣言、Decision 索引の関連REQ表の自動生成、未宣言検出、req-save での保存
      - 対象外: TIM（ADF-COVERS 宣言、成果物型、covers 関係）への Decision の組み込み、agentdev-traceability の API、関連の意味推測による自動確定
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-030.md
    source_items: [AG-002, AG-003, AG-005]
    content: |
      要件テーブルへ追加:
      | REQ-030-023 | case-open は Case Issue 作成前に、対象 REQ が Decision frontmatter の関連REQ宣言（related_reqs）に含まれ、かつ status が proposed の Decision を評価対象として特定すること。特定は正規情報源のみを用い、本文の意味・文字列類似・周辺参照等の意味推測で補完しないこと。評価対象が 0 件の場合は既存と同様に Case 作成を継続できること |
      | REQ-030-024 | case-open は評価対象の各 proposed Decision について受理可否を評価し、req-define での合意内容と現行 REQ・Design・実装の状態から一意に確定できる場合は既存ライフサイクル規則と承認記録形式に従って accepted への状態遷移を実行してから Case 作成を継続すること。一意に確定できない場合はユーザー判断を求め、受理不能または判断情報が不足する場合は proposed のまま Case を開始せず停止理由を報告すること |
      | REQ-030-025 | case-open は Decision 状態評価の再実行時に、既に accepted へ遷移済みの Decision に対して重複する状態遷移や承認記録を生成しないこと |

      適用範囲の「対象」へ追記:
      - Case Issue 作成前の関連 Decision 状態評価（正規情報源による特定、受理評価と accepted 遷移または開始阻止、再実行時の冪等）
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-036.md
    source_items: [AG-004]
    content: |
      適用前提: REQ-036-025（先行 draft design-status-evaluation-inventory が追加）の先行確定と、
      当該 draft が REQ-036 適用範囲の対象外へ追記した Decision 側除外文言の実在が必要である。
      本 draft は同 draft の req-save 完了後に req-save すること。

      要件テーブルへ追加:
      | REQ-036-026 | inspect-docs は、単なる proposed Decision の存在を異常とみなさず、関連 REQ の実装 Case が進行しているにもかかわらず受理評価されないままの proposed Decision を DRIFT として区別診断できること。診断は検出・報告のみとし Decision の status を直接変更しないこと |

      適用範囲の更新:
      - 「対象」へ追記: 関連 REQ の実装 Case 進行と Decision 状態の乖離 DRIFT 診断（読み取り限定）
      - 「対象外」の更新: 前 draft（design-status-evaluation-inventory）で追記した「Decision 状態評価と Decision の状態乖離診断（…別要件）」の除外文言は、本要件の追加により削除する
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: foundations
      slug: patterns
    source_items: [AG-001, AG-002]
    content: |
      ## Decision frontmatter 関連REQ宣言（related_reqs）規約と承認記録形式

      ### related_reqs フィールド

      - Decision frontmatter の標準フィールド related_reqs は REQ 識別子（REQ-{NNNN}）のリストとする
      - 関連 REQ が存在しない Decision は `related_reqs: []`（空宣言）として明示する。
        未宣言（フィールド自体の欠落）は機械検出の対象であり、正規状態とは扱わない
      - 宣言は Decision 成果物のローカルメタデータであり、TIM の ADF-COVERS 宣言・covers 関係とは
        独立に管理される。agentdev-traceability は本フィールドを消費しない
      - req-save が Decision 作成時に要件doc（draft-data）の関連情報から保存し、
        既存 Decision への付与はバックフィル（一括付与）による
      - 本規約は patterns.md が Decision frontmatter 規約を持たない現状の解消を兼ねる
        （共通文書モデル規約の正本としての配置。decision-lifecycle Design は意味境界・関係・粒度・
        健全性に特化し、形式規約の正本とはしない）

      ### 承認記録セクション形式（正規所有）

      - Decision の accepted 遷移には、本文末尾に「## 承認記録」セクションを追記する
      - 形式: 「YYYY-MM-DD に Decision ライフサイクルの確認手続きに従い承認した
        （status: proposed → accepted）。{承認根拠}（REQ-001-021 との矛盾解消）。」
      - 承認根拠には、評価時点で照合した根拠（合意内容と現行 REQ・Design・実装の一致、
        またはユーザー承認の旨）を記載する
      - 本形式は DEC-008 / DEC-015 / DEC-019〜027 / DEC-028 の昇格実績で採用された慣行の
        正規化である。遷移の実行主体（case-open、確認手続きによる一括昇格）を問わず同一形式を用いる
      - 形式の正本は本 Design（patterns.md）、テンプレート実体は doc_decision.md、
        存在確認・検証は agentdev-decision-file-manager、「明示承認記録が存在する」存在要件は
        document-model.md（現状維持）が所有する
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: index-auto-generation
    source_items: [AG-001]
    content: |
      ## Decision 関連REQ表の自動生成

      - decisions/README.md の関連REQ表を AUTOGEN ブロック化し、Decision frontmatter の
        related_reqs から生成する
      - 生成対象: 各 Decision の関連 REQ 列（既存の手動表の列構造を引き継ぐ）。
        「説明」列は frontmatter から導出できない人手判断列として保持する混合領域構成とする
        （生成処理は Decision/関連REQ 列のみ上書きし説明列を保存）
      - 整合検査: frontmatter と AUTOGEN ブロックの不一致、および未宣言 Decision
        （related_reqs フィールド欠落）の検出を index 生成整合の機械検査へ組み込む
      - 管理区分の変更（人手管理領域からの移動）に伴い、本 Design の適用範囲の管理区分記述
        （「現在人手管理される領域」等）、「自動生成の対象領域と生成元」表の関連REQ表行
        （人手管理 → 自動生成/混合への区分変更）、「現在人手管理領域の4領域」節
        （3領域への更新）を更新し、generate_indexes.ts への生成処理追加、IR-061 系整合検査の
        拡張を同一 Case で実施する
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: skills
      slug: agentdev-decision-file-manager
    source_items: [AG-001, AG-003]
    content: |
      ## related_reqs フィールド管理

      - CREATE 時: req-save が要件doc（draft-data）の Decision 対象操作から関連 REQ の初期値を
        決定的に取得する規約に基づき保存する（取得元の draft-data 内構造は patterns.md
        （ACT-DESIGN-001）で確定する。draft-data schema の拡張要否は REQ-008・DEC-003 の管轄との
        整合で design-save 時に確定する）
      - UPDATE 時: 関連 REQ の変更（要件再構成、Decision の置換・再確認）をフィールド更新として
        扱う。status 遷移とは独立に更新できる
      - 検証: REQ 識別子形式（REQ-{NNNN}）、空宣言と未宣言の区別、実在 REQ の指先確認
      - 承認記録: accepted 遷移時の「## 承認記録」セクション形式（日付・遷移・理由）の追記を
        UPDATE 操作の標準手順に含める（形式の正規所有は patterns.md Design）
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: commands
      slug: case-open
    source_items: [AG-002, AG-003, AG-005]
    content: |
      ## Decision 状態評価（Issue 作成前工程）

      本工程は Standard flow、Epic flow、混在構成の全ルートで最初の GitHub Issue 作成前に実行する。
      Epic flow では Epic Issue 作成前に、構成確定後の全対象 REQ 群を評価対象とする。

      ### 評価対象の特定

      1. 当該 Case の対象 REQ を特定する（Issue 構成の入力である要件doc / REQ ファイルから導出）
      2. 全 Decision の frontmatter related_reqs から、対象 REQ を含む宣言を持つ Decision を列挙する
      3. 列挙のうち frontmatter status が proposed のものを評価対象とする（accepted / superseded /
         deprecated は対象外）。評価対象 0 件の場合は記録の上、既存フローを継続する
      4. 関連の特定は本手順（正規情報源）のみを用いる。宣言欠落・解釈不能な宣言に遭遇した場合は
         意味推測で補完せず、フィールド整備（宣言付与）を促す停止理由として報告する

      本節の特定手順（手順1〜4）の結果は、EC-4（関連 Decision 拘束条件の特定と反映）および
      Standard flow の「関連Decision特定」で再利用し、重複特定を行わない。既存の特定記述が
      related_reqs 以外の方法（本文読解等の推測的導出）に依存する場合、本節の追加時に
      正規情報源へ寄せて書き換えることを確定事項とする。

      ### 受理評価と遷移

      - 各評価対象について、req-define での合意内容（要件doc の Decision 判断記録）と現行の
        REQ・Design・実装の状態を照合し、受理可否が一意に確定できるかを判定する
      - 一意確定できる場合: 既存ライフサイクル規則（proposed → accepted）に従って状態遷移し、
        承認記録（patterns.md Design の正規形式）を追記する。遷移確認後に Case 作成を継続する
      - 一意に確定できない場合: ユーザー判断を求める（HITL）。受理不能または判断情報不足の場合は
        proposed のまま Case を開始せず、停止理由を報告する
      - 再実行時: 既に accepted の Decision を評価対象から除外し、重複する遷移・承認記録を
        生成しない

      本工程の HITL 分岐（一意確定不能時のユーザー判断、受理不能・情報不足時の開始阻止）は
      REQ-003-055 共通原則および workflow-contracts Design の HITL 移送条件一覧に従う。
      case-open Design の「承認・HITL 境界」セクションへ本判断点を追記する
      （入力要件doc への新たな承認点を追加するものではない旨を明示する）。

      ### Design 正規列挙セクションへの反映

      本節の追加に伴い、case-open Design の「副作用」セクションへ Decision ファイル更新
      （frontmatter status 変更、承認記録セクション追記。git commit/push は既存の並列実行安全
      ステージング規律・明示パス指定に従う）を、「停止状態」セクションへ本工程由来の停止条件
      （受理不能・判断情報不足・関連取得不能・宣言欠落・解釈不能宣言）の列挙追加を、
      それぞれ明記する。
  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: skills
      slug: agentdev-doc-diagnostics
    source_items: [AG-004]
    content: |
      ## Decision 状態乖離 DRIFT 診断観点

      ### 判定基準

      - 対象: frontmatter status が proposed の Decision
      - 乖離条件: 関連REQ宣言（related_reqs）に含まれる REQ の実装 Case が進行している
        （完了 Case が存在する、またはオープンな実装 Case が存在する）にもかかわらず、
        受理評価されないまま proposed であること
      - Case 進行の判定は、ローカル版では .agentdev/issues/ の永続ファイル、GitHub 版では
        Tool 操作契約経由の読み取りによる（診断は読み取りと報告のみ）
      - 単なる proposed の存在は指摘しない（新規作成直後で Case 未着手の Decision は指摘対象外）
      - 適用起点は本診断の実装以降に進行した Case を対象とし、実装前の Case（移行期間中に
        開かれた Case を含む）へ遡って適用しない（baseline 注記）
      - Design 状態乖離 DRIFT（前 draft で追加）とは観点として分離し、判定基準を混用しない

      ### 出力と副作用

      - 検出は DRIFT カテゴリの finding として報告し、推奨アクションは case-open の
        Decision 状態評価への差し戻しを提示する。finding には REQ ファイル単位の近似判定で
        ある旨を明示する
      - 診断は Design の status と同様に Decision の status・frontmatter を直接変更しない
      - 本観点は観点レジストリ（REQ-036-024 の正規実体）へ登録する

conflict_resolutions:
  - id: CR-001
    conflict: Decision↔REQ 関係の正規情報源の設計（frontmatter 宣言 + AUTOGEN vs 手動表の運用確定 vs TIM への関係型追加）
    resolution: >-
      frontmatter 宣言（related_reqs）+ 索引 AUTOGEN 化を採用する。手動表の運用確定は網羅性を
      機械検証できず推測排除の前提を満たさない。TIM への関係型追加は DEC-017 の最小モデル
      （traceability-model.md: Decision は TIM の標準成果物型に含めない）と衝突する。
      frontmatter 宣言は Decision 成果物のローカルメタデータであり TIM 不変・機械可読・
      単一情報源の三条件を満たす（ユーザー指示 2026-09-10「部品2を実行するためのドラフトを作成」に基づく）。
  - id: CR-002
    conflict: Decision 昇格の HITL 要否
    resolution: >-
      REQ-003-055 共通原則を適用（一意に確定できる場合は自律昇格、判断材料不足時のみ HITL または
      開始阻止）。ユーザー合意 2026-09-10（質問2の回答）。
  - id: CR-003
    conflict: Decision 状態評価の発火点（case-open vs case-close）
    resolution: >-
      case-open。Decision の accepted は判断の受理であり実装完了を意味しないため実装開始前評価が
      適切（RU-0001 改訂で合意済み）。
  - id: CR-004
    conflict: RU-0001 は「Decision↔REQ の関係モデル、関係型、保存形式、宣言形式の新設または変更」を対象外としていた
    resolution: >-
      本 draft は対象外指定を維持したまま先送りするのではなく、ユーザー指示（2026-09-10）により
      関係情報源を明示的な要件スコープ（OU-001、新規 REQ）として正規化する。暗黙的な追加ではなく
      要件化を経た正規の導入であり、RU の受け入れ条件 18（TIM 成果物型・関係型の暗黙追加禁止）は
      AG-006 により維持される。
  - id: CR-005
    conflict: >-
      architecture-advisory（2026-09-10、bg_628c254b）のユーザー確認事項 U-1〜U-5
      （checker 停止強度、related_reqs 形式の正本配置、承認記録形式の正本配置と OU 構成変更、
      バックフィルの承認記録運用、README 表説明列の扱い）。
    resolution: >-
      5点すべて助言の推奨案を適用した: (U-1) checker は finding 検出（IR-061 系拡張）とし
      工程停止条件としない（DEC-001 決定4 の7条件立証を要しない構成。AG-001/DRR-003 に反映）。
      (U-2) related_reqs 宣言形式の正本は patterns.md（ACT-DESIGN-001）。(U-3) 承認記録形式の
      正本も patterns.md とし、旧 ACT-DESIGN-005（decision-lifecycle.md への追加）は
      ACT-DESIGN-001 へ統合して削除した（decision-lifecycle Design は意味境界・関係・粒度・
      健全性に特化する現行宣言を維持）。(U-4) バックフィルの明示承認記録は Case 対応記録
      コメントと人手レビュー記録で満たす（AG-001/TS-001）。(U-5) README 表の説明列は
      人手判断列として保持する混合領域構成（ACT-DESIGN-002）。いずれも軽微な設計選択であり
      ユーザーの合意スタンス（推奨案適用、STEP-10 の提示で差し戻し可能）に従った。
      助言の確定事項（TIM 非違反・AUTOGEN 既存拡張ポイント・新規 REQ 妥当・新規 Decision 不要
      維持・backfill は意味的不変の非意味修正）は AG-001/AG-006/CR-001/TS-009 へ反映済み。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: new:decision-req-relations
    target_design: docs/designs/foundations/patterns.md
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs: [REQ-059]
      artifact_actions: [ACT-REQ-001]
      source_ru: [RU-0001]
      unclassified_verification_rows: [REQ-059-001, REQ-059-002, REQ-059-003, REQ-059-004]
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-030
    target_design: docs/designs/commands/case-open.md
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_reqs: [REQ-030]
      artifact_actions: [ACT-REQ-002]
      source_ru: [RU-0001]
      unclassified_verification_rows: [REQ-030-023, REQ-030-024, REQ-030-025]
  - ou_id: OU-003
    source_ru: RU-0001
    target_req: REQ-036
    target_design: docs/designs/skills/agentdev-doc-diagnostics.md
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_reqs: [REQ-036]
      artifact_actions: [ACT-REQ-003]
      source_ru: [RU-0001]
      unclassified_verification_rows: [REQ-036-026]

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      既存 Decision 全件（27件）の frontmatter を検査する。バックフィル実施後、related_reqs
      フィールドが全 Decision に存在し（空宣言を含む）、宣言内容が現行手動表・Decision 本文と
      整合することを人間確認記録とともに検証する。
    pass_criteria: |
      未宣言の Decision が 0 件であること。宣言値が原材料（手動表・本文）と一致していること。
      バックフィルの写像確認記録（Case 対応記録コメントへの人手レビュー結果の記録）が
      残っていること。これがバックフィルの明示承認記録を満たす。
    on_failure: |
      fix-and-reverify。欠落・誤写像は修正して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      generate_indexes による Decision 関連REQ表の再生成を実行し、frontmatter と AUTOGEN ブロックの
      整合を検査する。意図的な不一致（手動編集・宣言欠落）を仕込んだ状態で機械検査が検出することを
      確認する。
    pass_criteria: |
      再生成後に差分 0 件であること。仕込んだ不一致・未宣言を機械検査が検出すること。
    on_failure: |
      fix-and-reverify。検出漏れは checker 実装を修正して再検証する。
  - id: TS-003
    target_item: AG-002
    verification: |
      評価対象（関連 proposed Decision）が 0 件の要件で case-open を実行する。
    pass_criteria: |
      0 件確認が記録され、既存と同様に Case 作成が継続されること（エラー停止しないこと）。
    on_failure: |
      fix-and-reverify。0 件を異常扱いする実装は修正して再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      関連 proposed Decision を持つ要件で case-open を実行する。合意内容と現行状態の一致が
      確定できるケース（自律昇格）と、ユーザー判断が必要なケースの両方を確認する。
    pass_criteria: |
      自律昇格ケース: accepted 遷移（frontmatter status + 承認記録セクション）が確認された後で
      Case Issue が作成されること。HITL ケース: ユーザー判断が求められ、受理不能時は Case が
      作成されず停止理由が報告されること。
    on_failure: |
      fix-and-reverify。遷移順序の違反（評価前の Issue 作成）、無承認の遷移、停止条件の欠落は
      修正して再検証する。
  - id: TS-005
    target_item: AG-002
    verification: |
      受理可否が一意に確定できない Decision（合意内容と現行実装の乖離が存在する状態）を含む要件で
      case-open を実行する。
    pass_criteria: |
      意味推測による自律判断を行わず、ユーザー判断または停止理由の報告に分岐すること。
      proposed のまま Case が開始されないこと。
    on_failure: |
      fix-and-reverify。自律判断の逸脱は修正して再検証する。
  - id: TS-006
    target_item: AG-003
    verification: |
      related_reqs 宣言が欠落した Decision が存在する状態で case-open と機械検査を実行する。
    pass_criteria: |
      機械検査が未宣言 Decision を検出すること。case-open が宣言欠落を意味推測で補完せず、
      フィールド整備を促す停止理由として報告すること。
    on_failure: |
      fix-and-reverify。推測補完の実装は除去して再検証する。
  - id: TS-007
    target_item: AG-004
    verification: |
      (a) 関連 REQ の実装 Case が進行中の proposed Decision、(b) 新規作成直後で Case 未着手の
      proposed Decision、(c) accepted Decision、の3状態が混在するリポジトリで inspect-docs を実行する。
    pass_criteria: |
      (a) のみが DRIFT の finding として報告され、(b)(c) が指摘されないこと。
      診断実行後に Decision の status・frontmatter が変化しないこと。
    on_failure: |
      fix-and-reverify。誤検出・副作用は修正して再検証する。
  - id: TS-008
    target_item: AG-005
    verification: |
      Decision 状態評価実施済みの状態で case-open を再実行する。
    pass_criteria: |
      既に accepted の Decision に対して重複する状態遷移・承認記録が生成されないこと。
    on_failure: |
      fix-and-reverify。重複生成は修正して再検証する。
  - id: TS-009
    target_item: AG-006
    verification: |
      本要件の実装差分（新規 REQ、REQ-030/036、各 Design、配布 skill・script 変更）を確認する。
    pass_criteria: |
      TIM の成果物型・関係型・ADF-COVERS 宣言形式に変更がないこと。
      agentdev-traceability の公開 API（coverage / impact / check）に変更がないこと。
      decisions/README.md 関連REQ表の AUTOGEN 化が REQ-001-026/028 系の索引類自動生成機構の
      対象拡張として実装されており、TIM の派生索引を新設していないこと
      （正規情報源は Decision frontmatter、README 表は SSoT ではない）。
    on_failure: |
      fix-and-reverify。対象外の実装混入は除去して再検証する。
  - id: TS-010
    target_item: AG-001
    verification: |
      配布物変更（agentdev-decision-file-manager skill、case-open workflow skill、doc-diagnostics
      skill、generate_indexes 等の script）を含む PR で targeted docs guard および配布依存境界の
      最終 gate を実行する。
    pass_criteria: |
      配布物整合性検査と配布依存境界 gate が failures 0 で通過すること（既知 delta の増分がないこと）。
    on_failure: |
      fix-and-reverify。配布物整合の違反は修正して再検証する。
  - id: TS-011
    target_item: AG-002
    verification: |
      自律昇格と HITL の判定境界を構造確認する（case-open Design の判定条件と REQ-003-055 の
      共通原則との対応）。
    pass_criteria: |
      判定根拠（合意内容・現行状態の照合結果）が評価記録に残り、一意確定と非確定の分岐が
      判定記録から再構成できること。
    on_failure: |
      fix-and-reverify。判定記録の欠落は修正して再検証する。
  - id: TS-012
    target_item: AG-001
    verification: |
      新規 Decision 作成を含む req-save を実行する（検証用の Decision 作成を含む要件doc で
      確認する）。
    pass_criteria: |
      draft-data で確定した関連 REQ が frontmatter related_reqs へ保存されること。
      関連無し Decision が空宣言（related_reqs: []）で作成されること。
    on_failure: |
      fix-and-reverify。初期保存・空宣言の欠落は req-save 実装を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: Decision↔REQ 関係の正規情報源を実装する
    responsibility: >-
      Decision frontmatter の related_reqs フィールド管理（検証、空宣言の扱い）、req-save での
      初期保存、既存27件のバックフィル（人間確認付き）、decisions/README.md 関連REQ表の AUTOGEN
      化と整合 checker（未宣言検出を含む）。
    ownership_hints:
      - src/opencode/skills/agentdev-decision-file-manager/SKILL.md
      - .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts
      - docs/designs/foundations/patterns.md（ACT-DESIGN-001 で設計確定）
      - docs/designs/integrity/index-auto-generation.md（ACT-DESIGN-002 で設計確定）
    intent: >-
      RU-0001 受け入れ条件 5（関係取得不能時の停止）の前提となる正規情報源を確立し、
      意味推測に依存しない関連 Decision 特定を可能にする。
    verification_refs: [TS-001, TS-002, TS-006, TS-010, TS-012]
    source_items: [AG-001, AG-003]
  - id: RA-002
    concern: case-open に Decision 状態評価工程を追加する
    responsibility: >-
      case-open Workflow Skill への評価工程（正規情報源による特定、受理評価、自律遷移または
      HITL/開始阻止、承認記録追記、冪等除外）の実装。承認記録形式は patterns.md Design
      の正規形式に従う。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-open/SKILL.md
      - docs/designs/commands/case-open.md（ACT-DESIGN-004 で設計確定）
      - docs/designs/foundations/patterns.md（ACT-DESIGN-001 で承認記録形式を設計確定）
    intent: >-
      REQ-030-023〜025 の外部振る舞いを実現する。proposed Decision を実装開始前に必ず受理評価する
      発火点を確立する。
    verification_refs: [TS-003, TS-004, TS-005, TS-008, TS-011]
    source_items: [AG-002, AG-003, AG-005]
  - id: RA-003
    concern: inspect-docs に Decision 状態乖離 DRIFT 診断観点を追加する
    responsibility: >-
      agentdev-doc-diagnostics skill の診断観点（観点レジストリ、diagnostic-categories）へ
      Decision 状態乖離 DRIFT を追加する。判定基準（related_reqs × Case 進行状態）、read-only 契約、
      Design DRIFT との観点分離の実装。
    ownership_hints:
      - src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md
      - docs/designs/skills/agentdev-doc-diagnostics.md（ACT-DESIGN-006 で設計確定）
    intent: >-
      REQ-036-026 の外部振る舞いを実現する。case-open の評価をすり抜けた状態乖離の第二層検出。
    verification_refs: [TS-007]
    source_items: [AG-004]

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: 要件化の方向「Decision 状態評価」（受け入れ条件 1〜5）
    disposition: covered
    reason_code: adopted
    reason: >-
      case-open の Decision 状態評価として REQ-030-023〜025、case-open Design、patterns.md
      Design（承認記録形式の正規化）、実現面 RA-002 へ反映した。前提となる正規情報源を OU-001
      （新規 REQ）として内包した。
    evidence:
      path: .agentdev/drafts/req-draft-decision-status-evaluation.md
      section: agreed_items / artifact_actions / realization_actions
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: 要件化の方向「状態乖離診断」の Decision 側（受け入れ条件 14）
    disposition: covered
    reason_code: adopted
    reason: >-
      Decision DRIFT 診断として REQ-036-026、doc-diagnostics Design、実現面 RA-003 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-decision-status-evaluation.md
      section: agreed_items / artifact_actions / realization_actions
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: 対象外・外部依存（Decision↔REQ 関係モデル、関係型、保存形式、宣言形式の新設または変更）
    disposition: superseded
    reason_code: superseded_by
    reason: >-
      ユーザー指示（2026-09-10「部品2を実行するためのドラフトを作成」）により、関係情報源を
      先送り前提の対象外から本 draft の明示的スコープ（OU-001、新規 REQ decision-req-relations）
      へ昇格した。TIM の成果物型・関係型は変更しない前提（AG-006）を維持する。
    evidence:
      path: .agentdev/drafts/req-draft-decision-status-evaluation.md
      section: conflict_resolutions / CR-004
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: 主対象「REQ-030（case-open 実行契約）」
    disposition: covered
    reason_code: adopted
    reason: >-
      REQ-030 への APPEND（REQ-030-023〜025）として反映した（前 draft の RD-004 による
      not_applicable 判定を本 draft が引き継ぎ解消する）。
    evidence:
      path: .agentdev/drafts/req-draft-decision-status-evaluation.md
      section: artifact_actions / operation_units
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: 3 OU（OU-001 が前提、OU-002/003 が並列消費）で単一の依存連結成分を構成する
  wave_hints:
    - wave 1: OU-001（関係情報源の確立。バックフィル含む）
    - wave 2: OU-002（case-open 評価）と OU-003（Decision DRIFT）は並列実行可
```

# summary

Decision の受理評価を case-open の正規工程へ組み込む要件。後回しの原因だった「関連 Decision 特定のための正規情報源の不在」を、Decision frontmatter の related_reqs 宣言と索引 AUTOGEN 化（新規 REQ）として自前で解決する構成。TIM は変更しない。3 OU・2 Wave の Epic 構成（Wave 1 で情報源を確立し、Wave 2 で評価と DRIFT 診断を並列実装）。architecture-advisory（2026-09-10）の確定事項8項目・確認事項 U-1〜U-5 の推奨案をすべて反映済み（checker は finding 構成、承認記録形式と related_reqs 形式の正本は patterns.md、バックフィルの承認記録は対応記録コメント運用、README 表説明列は混合領域）。ブロッカーなし。
