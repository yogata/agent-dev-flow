---
draft_type: req_draft
topic_slug: adf-version-tag-release-record
status: draft
created_at: "2026-10-16T21:40:00+09:00"
source_rus: [RU-0228]
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  ADF本体の版タグ（正式 SemVer タグと RC タグ、2026-10-16 時点で37件）ごとにタグ名と一致する
  GitHub Release を1件だけ対応させる。対応する Release のない版タグには草稿を作り、既存 Release
  の本文と公開状態を変えない。草稿の作成・読み戻しを workflow 実行範囲（agentdev_gh 操作
  カタログ経路）に含め、公開は草稿作成とは別に利用者が明確に認めた場合に限る。stage 7 リリース
  はタグ送信後に全版タグの Release 対応を確認し、読み戻し確認まで工程を完了としない。既存タグ
  補完（v2.9.0・v3.2.0・v3.3.0 の注釈付きタグの通常 push を含む33件の草稿作成）を今回限定で
  実行する。DEC-059 の「公開操作」規則を後継 Decision で部分置換する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      ADF本体の版タグ（正式 SemVer タグと RC タグを含む。非 SemVer ベースラインタグは除外する）
      ごとに、タグ名と一致する GitHub Release を1件だけ対応させること。対応する Release のない
      版タグには草稿を作り、既存の Release（公開・草稿とも）の本文と公開状態を変えないこと。
      RC 版タグの Release は草稿かつプレリリースとして作ること（版番号の基準から RC を除く
      Decision の規則は変更しない）。
  - id: AG-002
    content: >
      どの工程も Release 草稿を自動公開しないこと。公開は、草稿作成とは別に利用者が明確に
      認めた場合に限ること。
  - id: AG-003
    content: >
      stage 7 リリースは、タグをリモートへ送った後、現在あるすべての版タグを確認し、対応する
      Release がないものに草稿を作ること。GitHub から読み戻して版タグと Release の対応を確認
      するまでリリース工程を完了としないこと。
  - id: AG-004
    content: >
      Release 草稿の作成・読み戻しは ADF が認めた経路（Custom Tool 操作カタログ）だけで行い、
      生コマンド実行でカタログ外の書き込み経路を迂回しないこと。必要な操作がカタログにない
      場合は、カタログへ必要な機能だけを追加すること（カタログ操作の入力契約に公開モードを
      含めない）。
  - id: AG-005
    content: >
      草稿作成に失敗した場合はタグを移動・再作成せず、Release が欠けているため工程を完了でき
      ない旨を報告して停止すること。やり直し時も既存のタグと Release を使い、同一タグへ二つ目
      の Release を作らないこと。
  - id: AG-006
    content: >
      リモートに存在しない既存の版タグ（v2.9.0、v3.2.0、v3.3.0）は、注釈付きの元のタグを上書き
      しない通常の push で送り、リモートとローカルでタグ識別子が一致することを確認した上で
      対応する Release 草稿を作ること。Release がない33件の草稿作成を今回限定の既存タグ補完に
      含めること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-114.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      REQ-114-010 を次の文へ置き換える:
      | REQ-114-010 | 正式リリースは、一式全体の完遂、リリース条件（Decision `DEC-059` の適用規則）、公開操作の権限がすべて成立した場合に限り、対象プロジェクトの採用方式に従って作成すること。少なくとも正式バージョン、リリース対象コミット、タグ、リリース内容が確認可能であること。追加の公開成果物は対象プロジェクトの採用方式に従い、ADF本体では版タグ（正式 SemVer タグと RC タグを含む）ごとにタグ名と一致する GitHub Release を1件だけ対応させ、対応する Release のない版タグには草稿を作ること。既存の Release の本文と公開状態を変えず、草稿を自動公開しないこと（公開は、草稿作成とは別に利用者が明確に認めた場合に限る） |
      要件テーブルへ次の2行を REQ-114-015 の後に追記する:
      | REQ-114-016 | リリース工程における GitHub Release の作成・読み戻しは、ADF が認めた経路（Custom Tool 操作契約のカタログ）だけで行い、生コマンド実行でカタログ外の書き込み経路を迂回しないこと。版タグと Release の対応を GitHub から読み戻して確認するまでリリース工程を完了とせず、草稿作成に失敗した場合はタグを移動・再作成せず、Release が欠けているため工程を完了できない旨を報告して停止すること。再開時は既存のタグと Release を使い、同一タグへ二つ目の Release を作らないこと。Release 記録の補完は版番号の消費とタグの作成・移動を伴わない記録操作であり、REQ-114-008 の完遂前の新規リリース作成禁止の対象外であること |
      | REQ-114-017 | リモートに存在しない既存の版タグは、注釈付きの元のタグを上書きしない通常の push で送り、リモートとローカルでタグ識別子が一致することを確認した上で対応する Release 草稿を作ること。RC 版タグの Release は草稿かつプレリリースとして作ること（版番号の基準から RC を除く規則は変更しない） |
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:adf-release-record-publication-path
    source_items: [AG-002, AG-004]
    content: |
      タイトル案: ADF本体の GitHub Release 記録と公開承認境界
      背景: DEC-059 は追加公開成果物について「Custom Tool カタログに含まれない操作はワークフローが準備（リリースノート草稿・対象確認）までを行い、公開権限の確認後に所定経路で実行する」と定めた。ADF本体で版タグごとの GitHub Release 記録を整備するにあたり（2026-10-16 RU-0228 合意）、草稿作成・読み戻しまでを workflow 実行範囲に含めるための規則変更が必要となった。
      決定:
      (1) DEC-059 決定(1) のうち「公開操作」規則を次のとおり部分置換する。一般規則（追加公開成果物はプロジェクトの採用方式に従う）は維持する。ADF本体の採用方式として、GitHub Release の草稿作成と読み戻し確認を workflow 実行範囲に含め、実行経路は Custom Tool 操作カタログ（agentdev_gh）に限定する。カタログ操作の入力契約に公開モードを含めない。承認境界は副作用の有無ではなく公開の有無によるものとし、公開（draft の publish 化を含む）は利用者が草稿作成とは別に明確に認めた場合に限る。
      (2) 版番号規則、正式リリースの基準、リリース条件、完遂済み・リリース保留、タグ権威・不移動は DEC-059 / DEC-039 のとおり維持する。
      (3) カタログへの追加は Release 草稿作成・Release 読み戻しに必要な機能のみとし、操作契約（custom-tool-contracts Design）と操作カタログ列挙の契約テストを同時更新する。
      代替案: 「準備」の解釈拡張として非意味変更で扱う案（GitHub 上の草稿作成は WRITE 副作用の実行であり準備に含まないため不採用）。草稿も公開操作とみなし作成まで利用者実行とする案（GitHub の draft Release は write 権限保持者のみ可視であり公開物ではないため不採用）。
      結果、影響: REQ-114-010、REQ-114-016、REQ-114-017 に適用する。stage 7 リリース（backlog-auto）と agentdev_gh 操作カタログが対象。
      relations: supersedes DEC-059（部分置換: 決定(1)の公開操作規則のみ。他の決定は維持）、relates-to DEC-039（タグ権威・不移動の継承）、relates-to DEC-001（決定6 リリース条件の適用維持）
      ADF-COVERS(decision): REQ-114-010, REQ-114-016, REQ-114-017
  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-059.md
    source_items: [AG-004]
    content: |
      frontmatter へ supersede_note を追記する（status は accepted 維持。部分置換のため本文冒頭注記は必須としない）:
      supersede_note: "決定(1)の「公開操作」規則（GitHub Release 等の追加公開成果物の実行経路）は、後継 Decision（ADF本体の GitHub Release 記録と公開承認境界。番号は Definition 保存時に採番確定）が部分置換する。版番号規則、正式リリースの基準、リリース条件、完遂済み・リリース保留、タグ権威・不移動の各決定は本 Decision が維持する。"
      後継 Decision 番号の確定値は Definition 保存内部責務（case-ready）の適用時に反映する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_area: stage 7 リリース（STEP-11）の Design 記述
    source_items: [AG-003, AG-005, AG-006]
    content: |
      stage 7 リリースの Design 記述へ Release 記録対応を追記する:
      - タグをリモートへ送った後、版タグ（正式 SemVer タグと RC タグ。非 SemVer ベースラインタグは除外）をすべて列挙し、対応する Release の有無を Custom Tool の Release 読取で確認する
      - 対応する Release のない版タグへ草稿を作る（RC 版タグは prerelease 有効）。既存の Release は対象外とし本文・公開状態を変更しない
      - 作成後、GitHub から読み戻して版タグと Release の対応（同名 Release の存在、draft・prerelease 状態）を確認するまで Release 工程を完了としない
      - 草稿作成の失敗時、および読み戻しで同名 Release が2件検出された場合は、既存を削除せず報告して停止する（利用者判断）
      - リモートに存在しない既存の版タグは、注釈付きタグを通常の push（非 force）で送り、リモートとローカルのタグ識別子一致を確認してから草稿を作る。push の拒否（リモートに同名タグが異なるオブジェクトで存在する場合等）は失敗として報告し、force による解消を行わない
      - 重複作成防止: 草稿作成前に存在確認を行い、再開時は既存 Release を検出して作成を省略する
      - ADF-COVERS(design) 宣言へ REQ-114-016, REQ-114-017 を追記する
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-004]
    content: |
      agentdev_gh の操作カタログへ Release 系操作を追加する:
      - 追加操作: Release 草稿作成（タグ名、タイトル、本文、prerelease を入力とする WRITE。作成後の読み戻しでタグ対応・draft 状態・prerelease を VERIFY）、Release 一覧読取・Release 読み戻し（READ。タグと Release の対応確認用に正規化して返す）
      - 入力契約: 公開モード（draft の解除、publish 相当のフィールド）を公開契約に含めない。契約外の公開指定フィールドを含む要求は副作用発生前に入力契約違反として拒否する
      - カタログ列挙の更新（16操作から追加後の件数へ）と操作カタログ列挙の契約テストを同時更新する
      - GitHub 版 / Local 版等価性の例外宣言: Release 系操作は GitHub 接続専用とし、Local 版は構造化失敗（operation-failed、詳細にローカル環境では GitHub Release 相当の状態を持たない旨）を返す
      - 失敗分類は既存の値域を維持する
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/commands/backlog-auto.md
    source_items: [AG-003, AG-004]
    content: |
      追加公開成果物の記述を更新する: 「追加公開成果物の準備物作成（リリースノート草稿・対象確認。Custom Tool カタログに含まれない操作の実行は承認後の所定経路）」を、ADF本体では GitHub Release の草稿作成・読み戻しまでを Custom Tool カタログ経路で実行し、公開は利用者が草稿作成とは別に明確に認めた場合に限る旨へ更新する。副作用の一覧へ GitHub Release 草稿作成を追記する。

conflict_resolutions:
  - id: CR-001
    conflict: DEC-059 は追加公開成果物について「ワークフローが準備までを行い、公開権限の確認後に所定経路で実行する」と定めており、RU-0228 の「Release 草稿作成・読み戻しを workflow 範囲に含める」と衝突する。
    resolution: 意味変更として後継 Decision による部分置換で解消する（document-model Design「accepted Decision の意味変更は後継 Decision を必須とし、直接適用しない」。部分置換の記録様式は decision-lifecycle Design に従い、DEC-059 は status accepted 維持・supersede_note 記録）。
  - id: CR-002
    conflict: agentdev_gh の操作カタログは16操作として契約テストで固定されており、Release 系操作の追加と衝突する。
    resolution: 操作契約 Design（custom-tool-contracts.md）と契約テストの同時更新による正規追加で解消する。契約テストの固定は Design・テスト更新を伴わない追加を検出する仕組みであり、正規追加は両者の同時更新で行う。
  - id: CR-003
    conflict: REQ-114-008 は「一式全体の完遂前に新規のタグ・リリースを作成しない」と定めており、既存タグへの Release 補完との関係が曖昧になり得る。
    resolution: Release 記録の補完は版番号の消費とタグの作成・移動を伴わない記録操作であり、REQ-114-008 の禁止対象外である旨を REQ-114-016 へ明示して解消する（stage 7 は完遂判定後に実行されるため時間的にも充足する）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0228
    target_req: REQ-114
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
      機能適用後、GitHub の Release 一覧を読み戻し（Custom Tool の Release 読取）、ADF本体の全版タグ（git tag で列挙した正式 SemVer タグと RC タグ。2026-10-16 時点で37件 + 補完実行時に作成されたタグ）と突合する。作業前に既存4件の Release（公開3・草稿1）の本文・公開状態を記録しておき、作業後と比較する。
    pass_criteria: |
      各版タグにタグ名と一致する Release がちょうど1件存在する。既存4件の本文・draft/prerelease/publish 状態が作業前の記録と一致する。
    on_failure: |
      fix-and-reverify（対応漏れ・既存 Release への変更検出は実装不備として修正し再検証する）。
  - id: TS-002
    target_item: AG-006
    verification: |
      git ls-remote --tags origin で v2.9.0、v3.2.0、v3.3.0 のリモートタグ識別子を取得し、ローカルの注釈付きタグオブジェクトの識別子と一致することを確認する。push 実行記録に --force が含まれないことを確認する。
    pass_criteria: |
      3タグがリモートに存在し、タグ識別子がローカルと完全一致する。force push の実行記録がない。
    on_failure: |
      fix-and-reverify（不一致時は push をやり直すのではなく原因を特定して報告・修正する。--force による解消は行わない）。
  - id: TS-003
    target_item: AG-002
    verification: |
      Custom Tool の Release 読み戻しで v4.0.0-rc.1 と v4.0.0-rc.2 の Release が draft かつ prerelease であることを確認する。全工程の実行記録に公開操作（publish）が含まれないことを確認する。公開 Release の総数が作業前後で不変であることを確認する。
    pass_criteria: |
      RC 2件が draft: true かつ prerelease: true である。公開操作の実行記録がない。公開 Release 数に増減がない。
    on_failure: |
      fix-and-reverify（誤公開の検出時は直ちに利用者へ報告し、対象を草稿へ戻す処置を含む）。
  - id: TS-004
    target_item: AG-003
    verification: |
      stage 7 の Release 記録工程について、単体・統合テストで「対応 Release がない版タグへの草稿作成」「読み戻し確認までの完了扱い禁止」「失敗時の停止とエラー報告」「再実行で既存 Release を検出し二重作成しない」を検証する。実環境での初回適用（補完実行）後、全版タグと Release の 1:1 対応と重複なしを読み戻しで確認する。
    pass_criteria: |
      単体・統合テストが全て合格する。実環境で全版タグ×Release が 1:1 であり、重複作成がない。
    on_failure: |
      fix-and-reverify（完了条件・冪等性の不備は実装を修正して再検証する）。
  - id: TS-005
    target_item: AG-004
    verification: |
      生 gh WRITE 迂回 guard のテストが引き続き合格すること（gh release create 等の block 維持）を確認する。agentdev_gh の契約テスト（操作カタログ列挙）を追加操作込みで更新し全テスト合格を確認する。Release 系操作の入力スキーマに公開モード（publish 相当フィールド）が存在しないことを検証する。Local 版が Release 系操作へ構造化失敗を返すことを unit test で確認する。typecheck と bun test を実行する。
    pass_criteria: |
      guard テスト・契約テスト・typecheck・bun test が全て合格する。Release 系入力スキーマに公開モードが存在しない。Local 版の未対応失敗が確認できる。
    on_failure: |
      fix-and-reverify（契約テストと Design の同時更新漏れ・入力契約違反は実装を修正して再検証する）。
  - id: TS-006
    target_item: AG-001
    verification: |
      ドキュメント整合を検証する。対象: docs/requirements/REQ-114.md（REQ-114-010 置換・016/017 追記）、新規 Decision と docs/decisions/DEC-059.md（supersede_note）、docs/designs/skills/agentdev-workflow-backlog-auto.md、docs/designs/responsibilities/custom-tool-contracts.md、docs/designs/commands/backlog-auto.md（ADF-COVERS 宣言の追記を含む）。check_changed_docs の該当検査を実行する。検索系検証の網羅範囲は上記修正対象ファイルと一致させ、See Also 等の参照行は検出対象外とする扱いを明示する。
    pass_criteria: |
      check_changed_docs の該当検査が合格する。REQ-114-016/017 の ADF-COVERS 宣言（design・decision）が追記されている。相互参照の不一致がない。
    on_failure: |
      fix-and-reverify（カバー宣言欠落・参照不一致は文書を修正して再検証する）。

realization_actions:
  - id: RA-001
    concern: agentdev_gh への Release 系操作追加
    responsibility: Custom Tool agentdev_gh の操作カタログへ Release 草稿作成（WRITE、prerelease 指定付き）と Release 一覧読取・読み戻し（READ）を追加する。入力契約に公開モードを含めない。操作カタログ列挙の契約テストを同時更新する。Local 版は構造化失敗（operation-failed）を返す。
    ownership_hints:
      - "src/common/tools/agentdev-gh/（specs, contracts, public-schema, engine, runner-cli, local/runner-local.ts, tests）"
      - "docs/designs/responsibilities/custom-tool-contracts.md（操作契約）"
    intent: Release 記録の作成・読み戻しを ADF が認めた経路（Custom Tool カタログ）で実行可能にし、生コマンドによる制限迂回を起こさない。
    verification_refs: [TS-005]
    source_items: [AG-004]
  - id: RA-002
    concern: backlog-auto stage 7 の Release 記録工程の実装
    responsibility: backlog-auto workflow skill の stage 7（STEP-11 リリース）手順へ、タグ送信後の全版タグ列挙・Release 対応確認・草稿作成・読み戻し完了条件・失敗時停止・欠落タグの通常 push 補完を実装する。SKILL.md と references/end-to-end-execution.md（STEP-11、公開操作の実行経路、異常系）を更新する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-backlog-auto/SKILL.md"
      - "src/common/skills/agentdev-workflow-backlog-auto/references/end-to-end-execution.md"
    intent: 版タグと Release の対応を毎回のリリース工程で確定し、記録抜けと重複作成を防ぐ。
    verification_refs: [TS-004]
    source_items: [AG-003, AG-005, AG-006]
  - id: RA-003
    concern: 既存タグ補完の実行
    responsibility: v2.9.0、v3.2.0、v3.3.0 の注釈付きタグを通常 push で送り、識別子一致確認後、Release がない33件（RC 2件を含む）へ草稿を作成し、読み戻しで対応を確認する。stage 7 機能の初回適用として E2E 検証を兼ねる。
    ownership_hints:
      - "リポジトリ git タグ（ローカル既存）と GitHub Release（yogata/agent-dev-flow）"
      - "stage 7 リリース手順（RA-002 の適用経路）"
    intent: 2026-10-16 時点の版タグ37件すべてへ Release を対応させ、記録の欠落を解消する。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-006]
  - id: RA-004
    concern: 生 gh WRITE 迂回 guard の維持確認
    responsibility: gh-command-detector が gh release 系 WRITE を block 継続することと、Release 操作が Custom Tool 経由（runner 内部呼出）で guard 対象外となる補完関係が維持されることを確認する。guard の変更は行わない。
    ownership_hints:
      - "src/common/guards/gh-write/gh-command-detector.ts"
    intent: カタログ追加後も生コマンドによる書き込み経路の迂回を防止する。
    verification_refs: [TS-005]
    source_items: [AG-004]

review_dispositions:
  - id: RD-001
    source_ru: RU-0228
    source_item: RU-0228-all
    disposition: covered
    reason_code: fully_reflected
    reason: |
      RU-0228 の必須の要求（要件化の方向）と決定的受け入れ条件1〜5を、AG-001〜AG-006、artifact_actions（REQ-114-010 置換・016/017 追記、後継 Decision、Design 3件）、test_strategy（TS-001〜006）、realization_actions（RA-001〜004）へ過不足なく反映した。対象外（草稿自動公開、既存タグの移動・作り直し、版番号規則変更、既存4件 Release の変更、新リリースノート形式、常時監視）はいずれも要件・実現面に含めていない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0228.md
      section: 要件化の方向 / 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  decomposition: >
    実装順序の参考: (1) agentdev_gh カタログ追加と契約テスト更新（RA-001）→ (2) stage 7 手順の
    workflow skill 実装（RA-002。RA-001 に依存）→ (3) docs 更新（REQ/Decision/Design。
    ACT-* を case-ready Definition 保存として適用）→ (4) 既存タグ補完の実行（RA-003。
    E2E 検証を兼ねる。RA-001/002 の完了後）。単一 Issue で (1)(2)(3) を実装し、(4) を
    検証段階で実行する構成も可能。
  wave_hints: []
```

# summary

ADF本体の版タごとの GitHub Release 記録対応を、REQ-114 の拡張（REQ-114-010 意味変更と REQ-114-016/017 追記）、DEC-059「公開操作」規則の後継 Decision による部分置換、agentdev_gh 操作カタログへの Release 系操作追加（Design 2件・workflow skill 実装）、および今回限定の既存タグ補完（3タグの通常 push を含む33件の草稿作成）として定義した。公開は草稿作成とは別に利用者が明確に認めた場合に限り、作成・読み戻しは Custom Tool カタログ経路だけとする。
