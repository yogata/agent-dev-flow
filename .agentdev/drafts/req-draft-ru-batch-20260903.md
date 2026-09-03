---
draft_type: req_draft
topic_slug: ru-batch-20260903
status: saved
created_at: 2026-09-03T23:45:00+09:00
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004, RU-0005, RU-0006, RU-0007, RU-0008, RU-0009, RU-0010, RU-0011, RU-0012, RU-0013, RU-0014, RU-0015, RU-0016, RU-0017, RU-0018, RU-0019, RU-0020, RU-0021, RU-0022, RU-0023, RU-0024, RU-0025, RU-0026, RU-0027, RU-0028]
---

# draft-data

```yaml
# work_type: REQ/Design 操作（保存契約の確定・追加）を主体とし実装変更を伴うバッチであるため feature
# scale: 25 OU・REQ 7 操作・Decision 1 操作・Design 22 操作・実現面 19 項目の大型バッチ（Epic 構成想定）
work_type: feature
scale: large

summary: |
  2026-09-03 backlog-review で生成された 28 RU のうち 26 RU を 25 の operation unit に構成した
  契約確定・現行化・是正バッチ。RU-0002 は正規所有先不在のため取り下げ、RU-0004 は解消済み確認により
  要件化対象外とし、いずれも判断根拠を review_dispositions に記録した。中核の合意は
  (1) DEC-023 を accepted に昇格し third-party 配置投影物を検査許容（INSPECTION-TOLERATED）モデルで管理する、
  (2) check_extensions の NG baseline 運用は SPEC（共用 ng-baseline・additions manifest 必須）を正として実装を整合させる、
  (3) 検査定義 yaml（command-format-rules・distribution-targets）を正本として checker に読み込む単一経路に統合する、
  (4) ID プレースホルダー裸出力は表の根拠列等の特定領域で文脈許容と明文化する、
  (5) SKILL.md description 集合は圧縮により 17850 字予算内に収める（閾値変更なし）、の 5 点。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      DEC-023（third-party Skill 分離管理）は accepted に昇格されること。昇格に伴い、REQ-057-009 の
      (proposed) 注記、docs/README.md の Decision 記述（本文の proposed 内訳記述と一覧表 DEC-023 行の
      「（proposed）」接尾辞の双方）、docs/decisions/README.md の AUTOGEN
      分類・件数（accepted 16 / proposed 8）、runtime-package-boundary.md 冒頭コメントの
      「DEC-023 (proposed) 注記」は実態と整合すること。
  - id: AG-002
    content: |
      third-party 取得機構経由で配置された投影物は projection manifest 突合の管理対象として検査許容
      （INSPECTION-TOLERATED）され、検出ノイズとして計上されないこと。worktree junction 未伝播に由来する
      既知検出差分は環境差として扱い、変更起因検出と混同しないこと。japanese-tech-writing の遺構投影
      ディレクトリ（.opencode/skills/japanese-tech-writing/）は削除され、skills_structure 検査は上記許容
      モデルに準拠すること（走査除外ではなく許容モデル準拠）。
  - id: AG-003
    content: |
      check_integrity の既知残存違反（content-corruption-checker の REQ-0108 系語彙扱い、
      third-party-sync の system.md 記載要否、IR-055 baseline 52 件の heuristic 違反）は、
      baseline 登録 / 個別修正 / 検出器調整の統一選択基準に従い個別に処置され、処置記録を伴わない
      未処置違反が残存しないこと。TODO マーカー 2 件は現行不在を確認済みのため対象外とする。
  - id: AG-004
    content: |
      check_extensions の NG baseline 運用は integrity-contracts の SPEC（共用 ng-baseline・
      additions manifest 必須）を正とし、実装（分離 baseline 想定・未作成）が SPEC に整合すること。
      demotion 挙動が baseline 運用契約どおり機能すること。
  - id: AG-005
    content: |
      順序ラベル様式（### Step N 等）の適用対象において references/ 配下の見出しは対象外であることが
      command-file-format Design に明文化され、E系サブステップラベル（E4-1 / E5b 等）の正規形と
      判定根拠の例示が定義されること。
  - id: AG-006
    content: |
      検査定義 yaml（command-format-rules.yaml・distribution-targets.yaml）は検査定義の正本として
      checker に読み込まれる単一経路に統合されること（読込統合）。定義の二重管理が解消され、
      REQ-047-005（外部契約不変更）と両立すること。yaml 欠損時は checker が fail-closed で
      停止すること。
  - id: AG-007
    content: |
      ローカル版 references を指す Issue 対象範囲パスの正規表記（src/opencode-local 配下であることの
      明示様式）が workflow-templates Design に定義されること。
  - id: AG-008
    content: |
      Issue 監査値には計測基準（基準 commit または時点）が記録され、第三者が監査値の鮮度を検証できること
      （基準記録運用）。case-open が生成する Issue に計測基準の記載欄が反映されること。
  - id: AG-009
    content: |
      docs/knowledge/ の機械検査は frontmatter（title / created / updated）を検査範囲に含むことが
      REQ-056-010 上明文化され、checker が frontmatter 欠落・不備を検出できること。
  - id: AG-010
    content: |
      case-close の docs 検証 reference（docs-and-design-promotion.md）に
      qg-4-final-acceptance.md への明示参照が追加され、bun test 実行の正規形契約の所在が
      追跡可能になること。
  - id: AG-011
    content: |
      traceability check CLI の実行例は root を明示し、実行時のカレントディレクトリに依存して
      検証対象の欠落が静かに見逃されることがないこと。
  - id: AG-012
    content: |
      inspect-skills 内の不在参照 contracts.md への言及（検出時点 16〜45 箇所）は実在する正規 Design への
      参照に修正され、不存在参照が残存しないこと（contracts.md は新規作成しない）。現行で言及が
      検出されない場合は解消済みと確認し、その旨を記録して本項を完了とすること
      （adversarial-review F-4: 現行 grep で contracts 語 0 件）。
  - id: AG-013
    content: |
      intake-from-github のガイドレール表記は GitHub I/O を Custom Tool（agentdev_gh）経由に統一され、
      gh CLI 直接実行を指示する記述が残らないこと（REQ-011-002 / 008 / 014 準拠。API 直接呼び出し
      不可の意味は保持する）。
  - id: AG-014
    content: |
      配布 skill の references/ 配下は既知不備（簡体字混入・誤記リンク表記・参照残骸・
      docs/decisions<README>.md 誤記 7 箇所・「-066 準拠」の限定されない参照表記）を保持しないこと。
      センチネル検査（prose-quality-sentinel-checks）の対象集合が references/ を含むこと。
      ただし japanese-replacement-dictionary.md 内の置換辞書語彙源は意図的残存として除外規則の対象とすること。
  - id: AG-015
    content: |
      配布 skill の SKILL.md description 集合は 17850 字（平均 350 × 技能数）の予算内に収まること。
      対応手段は description 圧縮とし、閾値は変更しないこと。
  - id: AG-016
    content: |
      ADF-COVERS 実装対応宣言の正規配置先カタログが artifact-responsibilities Design に定義され、
      残存 68 件の未付与行は当該カタログに従い段階的に付与されること。triage で retire を選択した
      要求行は宣言対象外であること。
  - id: AG-017
    content: |
      draft Design 2 件（agentdev-artifact-validation・agentdev-design-file-manager）は IR-054 に従い
      triage（accepted 昇格 / 更新 / retire）され、frontmatter status が実態と一致すること。
      昇格を実行する場合は昇格前の検証契約の現行性を再確認すること。
  - id: AG-018
    content: |
      REQ-057-011 / 012 の integrity suite 実装が完遂されること（期待値動的化・flaky 解消・
      STEP 識別子除去の残存分。Case 冒頭で traceability check の missing-implementation 現行計上を
      再確認し残存分を特定する）。実装完了後に ADF-COVERS(implementation) 宣言が付与されること
      （実装完了まで宣言を付与しない PR #2523 判断を継承）。
  - id: AG-019
    content: |
      PR #2541 の実装挙動が Design に明文化されること。(1) stale 管理投影物の機械的確定基準
      （正本相対ターゲット一致・LocalMode リダイレクト先包含・broken junction reparse data 参照）と
      管理物判定不能 junction の非破壊境界は runtime-package-boundary に、(2) dry-run の
      WOULD REMOVE 予測対象（stale junction + stale shim）と表示形式は install-script-usability に、
      (3) 管理物判定不能物の [INFO] 報告（乖離に数えない・check 終了コード非反映）は
      install-script-usability の状態分類に、それぞれ記載されること。
  - id: AG-020
    content: |
      ADR 機能用語は機械的棚卸し（除外規則: 検出器語彙・テンプレートセクション名・履歴言及・retired 成果物。
      適用範囲: docs/** と src/**。.agentdev/extensions/** は project-local のため対象外）により
      正規名称（Decision）へ現行化されること。「実現面」語彙は REQ-004-037 変更後本文を正典とし、
      vocabulary-registry の正典配置契約と req-define Design の該当表記（実装面 → 実現面）が整合すること。
  - id: AG-021
    content: |
      破損・不整合参照は次のとおり現行化され、不整合参照が残存しないこと。
      (1) .agentdev/extensions/skills/agentdev-workflow-case-auto.yaml L25 の REQ-006-112〜114 dangling
      参照は REQ-034-032〜034 へ付け替え、(2) integrity-contracts.md L477 の normative 不所存参照
      （.omo/plans/ 移行計画）は REQ-057-015 に従い除去、(3) IR-044 の REQ-001-031 参照は
      REQ-001-049 へ付け替え（fixture 連動含む）、(4) integrity-contracts.md L512 の過去版裸 4 桁
      表記は v2: 付き表記へ修正されること（design-save.md L165 は現行で当該表記が不在のため
      Case 冒頭で再確認し、不在なら解消済みと記録する）、(5) scripts/self/release/package-release-archive.ps1
      L93 の裸 REQ-0145-014 コメントも同様に v2: 付き表記へ修正されること。
  - id: AG-022
    content: |
      docs/README.md の現行要件記述（本文件数・一覧表）は AUTOGEN・実ファイルと一致すること
      （49 件・REQ-058 行を含む）。IR-042（hardcoded-req-count）の affected_artifacts に
      docs/README.md が追加され、件数乖離が機械検出できること。
  - id: AG-023
    content: |
      stdout 証跡を要する checker の安定実行経路が checker-execution-contracts に契約化されること。
      基本経路はモジュール import 経由（node --experimental-strip-types）の標準化とし、
      process.exit を呼ぶ CLI 実行は stdout flush 保証を例外経路として併記されること。
      Windows + bun 環境で機械可読 stdout レポートが失われないこと。
  - id: AG-024
    content: |
      配布境界 gate（agentdev-distribution-boundary-guard）の outside-root 判定は例外規則
      （事前承認済み TEMP ディレクトリ等）として一般化され、個別特例の追加ではなく判定基準の
      一般化で解消されること（REQ-057-010 方針）。未承認パスへの書き込みは fail-closed を維持すること。
  - id: AG-025
    content: |
      ID プレースホルダーの正規様式は、表の根拠列等の特定領域における裸出力（IR-{NNNN} 等）を
      許容すると IR-064 に明文化されること。配布依存境界 gate の unclassified-entry 検出は
      許容領域を除外規則として扱い、既存 51 箇所の整形を不要とすること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-057.md
    source_items: [AG-001]
    content: |
      REQ-057-009 行を次の内容に更新する:
      | REQ-057-009 | 配布依存境界の baseline（ir-055/ir-059）は既知残存の記録として整備され、新規違反を隠蔽しないこと。引用する Decision の状態注記は実態と整合し、昇格済み Decision を (proposed) と記載しないこと | high |
      （現行行の前半（baseline 整備・新規違反隠蔽禁止）は維持し、後半の「DEC-023 は (proposed) 注記付き」
      括弧書きのみ昇格後の実態に合わせた状態要件へ更新する。adversarial-review F-2 反映）
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-023.md
    source_items: [AG-001]
    content: |
      frontmatter の status を proposed から accepted へ変更する。本文末尾に昇格記録を追記する:
      「2026-09-03: accepted に昇格。third-party Skill 分離管理モデルを正規採用し、third-party 取得
      機構経由で配置された投影物は検査許容（INSPECTION-TOLERATED）モデルで管理する（ru-batch-20260903）」
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-018.md
    source_items: [AG-002]
    content: |
      REQ-018（配布整合性）に 2 行を追加する:
      | REQ-018-003 | third-party 取得機構経由で配置された投影物は projection manifest 突合の管理対象として検査許容され、検出ノイズとして計上されないこと | high |
      | REQ-018-004 | worktree junction 未伝播に由来する既知検出差分は環境差として扱い、変更起因検出と混同しないこと | high |
      （採番は req-save が現行行数を確認のうえ確定する。上記は次番号候補）
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-068-skill-projection-manifest.md
    target_area: exemption（許容条件）
    source_items: [AG-002]
    content: |
      third-party 許容 exemption 節を追加する:
      「third-party 取得機構（agentdev_third_party 操作契約）経由で配置された投影物は管理対象として
      許容する（INSPECTION-TOLERATED）。許容対象の機械的識別は skill-projection-manifest の管理登録
      （third-party 由来であることの宣言）で行い、未登録の third-party 起源配置は引き続き検出する。
      許容は検出ノイゼス抑制であり走査除外ではない。」
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/integrity/distribution-boundary.md
    target_area: 候補抽出から決定までのパイプライン
    source_items: [AG-002]
    content: |
      検出パイプラインにおける third-party 配置の扱いを追記する:
      「配布依存境界 gate は、third-party 取得機構経由の配置（管理登録済み）を許容配置として扱い、
      unmanaged 検出から除外する。除外は manifest 登録の有無で機械判定する。」
  - id: ACT-DESIGN-021
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_area: 現行の境界（2026-07-03 時点）
    source_items: [AG-002]
    content: |
      成果物表の japanese-tech-writing 行（配布物依存・個別 junction 対象との記載）を現行化する:
      「japanese-tech-writing は third-party 起源の遺構投影であり投影ディレクトリを削除済み。
      third-party Skill は DEC-023（accepted）の分離管理・検査許容モデルで扱い、本表の管理対象から
      除外する」
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_area: NG baseline 運用手順（全カテゴリ strict pass、v2:REQ-0161-005 統合）
    source_items: [AG-003, AG-004]
    content: |
      baseline 運用契約節に 2 段落を追記・確定する:
      「check_extensions の NG baseline 運用は共用 ng-baseline（additions manifest 必須）を正とする。
      分離 baseline（check-extensions-baseline.json）は作成せず、実装を共用 baseline 運用に整合させる
      （SPEC を正とする確定: ru-batch-20260903）」
      「既知残存違反の処置は次の統一選択基準で行う: (a) 意図的残存（検出器語彙・パターン定義内言及）は
      baseline 登録し根拠を注記する、(b) 実不備は個別修正する、(c) 検出器の誤検出は検出器調整で解消する。
      処置は baseline 登録・修正・調整のいずれかに分類記録され、未分類残存を許さない」
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/authoring/command-file-format.md
    target_area: 順序ラベル様式（サブステップ識別子・工程一覧表ラベル・工程参照形式）
    source_items: [AG-005]
    content: |
      順序ラベル様式節に適用対象の確定を追記する:
      「順序ラベル様式（### Step N 形式）の適用対象は Command 本体・SKILL.md 本文の工程見出しであり、
      references/ 配下ファイルの見出しは適用対象外とする（対象外の明文化: ru-batch-20260903）。
      E系サブステップラベルの正規形は E{N}-{M}（例: E4-1）および E{N}{小文字}（例: E5b）とし、
      E 番号は直上位の Step 番号に対応させる。判定根拠は case-run / case-close / epic-wave-close の
      実例参照による」
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-047.md
    source_items: [AG-006]
    content: |
      REQ-047（docs-check）に行を追加する:
      | REQ-047-009 | 検査定義 yaml（command-format-rules・distribution-targets）は検査定義の正本であり、checker は yaml を読み込む単一経路で検査を実行すること。yaml 欠損時は fail-closed で停止すること | high |
      （採番は req-save が現行行数を確認のうえ確定する。上記は次番号候補）
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: data yaml 宣言的データ運用
    source_items: [AG-006]
    content: |
      宣言的データ読込原則節を追加する:
      「検査対象の定義データ（検査ルール・配布対象一覧等）は宣言的データファイル（yaml）を正本とし、
      checker は定義をコード内に複製せず正本を読み込んで検査を実行する。正本欠損時は検査を実行せず
      fail-closed で停止する。command-format-rules.yaml・distribution-targets.yaml は本原則の適用対象と
      する（読込統合: ru-batch-20260903）」
  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-templates.md
    target_area: Execution Contract
    source_items: [AG-007]
    content: |
      対象範囲表記節にローカル版 references パスの正規表記を追加する:
      「Issue 本文の対象範囲にローカル版（src/opencode-local 配下等）の references パスを記載する際は、
      配置領域の接頭辞（src/opencode-local/）を明示し、配布物（.opencode/）の同名パスと区別できる
      表記を正規形とする」
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-017.md
    source_items: [AG-008]
    content: |
      REQ-017（execution contract）に行を追加する:
      | REQ-017-018 | Issue 監査値には計測基準（基準 commit または時点）が記録され、第三者が監査値の鮮度を検証できること | high |
      （採番は req-save が現行行数を確認のうえ確定する。上記は次番号候補）
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-056.md
    source_items: [AG-009]
    content: |
      REQ-056-010 行を次の内容に更新する:
      | REQ-056-010 | docs/knowledge/ の正規配置・命名・必須内容を機械検査できること。検査範囲は本体 5 項目に加え frontmatter（title / created / updated）を含むこと | high |
      （検査範囲に frontmatter を含む旨を明文化）
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: docs/requirements/REQ-053.md
    source_items: [AG-014]
    content: |
      REQ-053（文章品質）に行を追加する:
      | REQ-053-023 | 配布 skill の references/ 配下は既知不備（簡体字混入・誤記リンク表記・参照残骸）を保持しないこと。ただし置換辞書の語彙源としての意図的残存は除外規則の対象とすること | high |
      （採番は req-save が現行行数を確認のうえ確定する。上記は次番号候補）
  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target: docs/designs/integrity/prose-quality-sentinel-checks.md
    target_area: 対象ファイル集合
    source_items: [AG-014]
    content: |
      センチネル検査の対象集合に references/ 配下を追加する:
      「S-05（簡体字混入）・S-06（誤記リンク表記）・S-08（参照残骸）の検出対象パスに配布 skill の
      references/ ディレクトリを含める。japanese-replacement-dictionary.md は置換辞書の語彙源のため
      検出対象から除外する（除外規則）」
  - id: ACT-REQ-007
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    source_items: [AG-016]
    content: |
      REQ-057（現行化バッチ）に行を追加する:
      | REQ-057-023 | ADF-COVERS 実装対応宣言の未付与行は正規配置先カタログ（artifact-responsibilities）に従い段階的に付与され、triage で retire を選択した要求行は宣言対象外であること | high |
      （採番は req-save が現行行数を確認のうえ確定する。上記は次番号候補）
  - id: ACT-DESIGN-010
    artifact: design
    operation: append
    target: docs/designs/responsibilities/artifact-responsibilities.md
    target_area: 操作 skill 正規所有者台帳
    placement: after_anchor
    source_items: [AG-016]
    content: |
      ADF-COVERS 実装対応宣言の正規配置先カタログ節を追加する:
      「ADF-COVERS(implementation) 宣言の正規配置先は実装成果物の種別ごとに次のとおり定める:
      (a) 配布 skill・command 本体 → 当該 SKILL.md / command .md 冒頭 HTML コメント、
      (b) checker・スクリプト → 対応する Design（integrity/local domain）の該当節、
      (c) 検証コード（test） → テスト対象契約を所有する REQ のカバレージ記録または監査レポート、
      (d) テンプレート・運用資産 → 正規所有 Design の該当節。triage で retire を選択した要求行には
      宣言を付与しない。残存 68 件の未付与行は本カタログに従い段階的に付与する」
  - id: ACT-DESIGN-011
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_area: stale 管理投影物の削除境界
    source_items: [AG-019]
    content: |
      stale 管理投影物の削除境界節に機械的確定基準を追記する:
      「stale 管理投影物の確定は次の機械的基準で行う: (1) 正本相対でターゲットパスが一致すること、
      (2) LocalMode リダイレクト先を包含判定に含めること、(3) broken junction は reparse data の
      参照先で判定すること。管理物と判定できない junction は削除せず非破壊に [INFO] 報告する」
  - id: ACT-DESIGN-012
    artifact: design
    operation: update
    target: docs/designs/local/install-script-usability.md
    target_area: dry-run/check/apply の技術的差
    source_items: [AG-019]
    content: |
      dry-run の予測対象を追記する:
      「dry-run の WOULD REMOVE 予測対象は stale junction と stale shim の両方とし、表示形式は
      種別（junction / shim）・パス・判定根拠の 3 要素を 1 行で示す」
  - id: ACT-DESIGN-013
    artifact: design
    operation: update
    target: docs/designs/local/install-script-usability.md
    target_area: install.ps1 -Mode check の検査カタログ
    source_items: [AG-019]
    content: |
      状態分類節に管理物判定不能物の扱いを追記する:
      「管理物判定不能物（reparse data 不参照・ターゲット解決不能の junction 等）は [INFO] で報告し、
      乖離（DRIFT / UNMANAGED）には数えない。check の終了コードには反映しない（非破壊報告）」
  - id: ACT-DESIGN-014
    artifact: design
    operation: update
    target: docs/designs/authoring/vocabulary-registry.md
    target_area: 配置と連携
    source_items: [AG-020]
    content: |
      実現面語彙の正典配置契約を追加する:
      「『実現面』語彙の正典は REQ-004-037 変更後の本文であり、Design（vocabulary-registry を含む）は
      正典を参照する。Design 側に語彙の定義本文を複製しない」
  - id: ACT-DESIGN-015
    artifact: design
    operation: update
    target: docs/designs/commands/req-define.md
    target_area: 壁打ち対話 構造的分析フレーム先行手順（REQ-004-034, REQ-004-035, REQ-004-036）
    source_items: [AG-020]
    content: |
      L164 付近の「実装面/Design面の両面分析表」および L175-178 付近の「実装/Design両面分析規定」の
      表記を「実現面」を用いた現行語彙へ更新する（REQ-004-037 変更後語彙への整合）。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_area: 実行プロファイル分離
    source_items: [AG-021]
    content: |
      L477 の normative 参照（不所存パス .omo/plans/agentdev-migration-2026-08-05.md）を除去する。
      除去は REQ-057-015（Design は将来計画を保持しない）に従う。周辺文は参照なしで完結するよう
      整形する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_area: release profile
    source_items: [AG-021]
    content: |
      L512 の裸 4 桁過去版 REQ 表記（REQ-0145-014）を v2:REQ-0145-014 形式に修正する。
  - id: ACT-DESIGN-016
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md
    target_area: 検査項目
    source_items: [AG-021]
    content: |
      裸 REQ-01XX（過去版 4 桁帯）参照の検出扱いを明文化する:
      「過去版 REQ の参照は v2:REQ-{0141+}-{NNN} 形式を正とし、裸 4 桁表記（REQ-0136-029 等）は
      検出対象とする。ただし IR-067 の旧 4 桁帯検出除外規則（0141 未満）は維持する」
  - id: ACT-DESIGN-017
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-042-hardcoded-req-count.md
    target_area: IR-042: hardcoded-req-count
    source_items: [AG-022]
    content: |
      本ファイルは表形式（H1 直下の Field/Value テーブル）のため、target_area は H1 見出しを指定する。
      affected_artifacts フィールドを更新する:
      「| affected_artifacts | [Design, guides, AGENTS.md, docs/README.md] |」
      docs/README.md の現行要件件数・一覧表が AUTOGEN・実ファイルと一致することを検査対象に含める。
  - id: ACT-DESIGN-018
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: 安定実行経路
    placement: tail
    source_items: [AG-023]
    content: |
      安定実行経路節を追加する:
      「stdout 証跡を要する checker（機械可読レポートを stdout 出力する checker）の実行は、モジュール
      import 経由（node --experimental-strip-types）を標準経路とする。Windows + bun 環境では bun run
      経由の process.exit 実行で stdout レポートが失われることがあるため、CLI 経由で実行する場合は
      process.exit 前に stdout の flush を保証する終了手順を例外経路として用いる。
      安定実行経路の詳細は docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md を参照する」
  - id: ACT-DESIGN-020
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_area: repo-local Plugin の配布・投影契約
    source_items: [AG-024]
    content: |
      outside-root 判定の例外規則を一般化して追記する:
      「outside-root 判定は、ワークスペース外の書き込みを原則ブロック（fail-closed）しつつ、事前承認
      済みディレクトリ（OS 標準 TEMP 等、実行環境が提供する一時領域）への書き込みを例外として許可する。
      例外はパス個別の特例列挙ではなく、承認済み一時領域カテゴリとして判定基準に組み込む
      （一般化: ru-batch-20260903、REQ-057-010 方針）」
  - id: ACT-DESIGN-022
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_area: 目的
    source_items: [AG-001]
    content: |
      文書冒頭のコメント（目的節に先行、L13 付近）の「DEC-023 (proposed) 注記」を DEC-023（accepted）
      を参照する現行表記へ更新する。
  - id: ACT-DESIGN-019
    artifact: design
    operation: update
    target: docs/designs/integrity/distribution-boundary.md
    target_area: ベースラインと個別承認例外の区別
    source_items: [AG-025]
    content: |
      unclassified-entry 検出の扱いを追記する:
      「ID プレースホルダー（IR-{NNNN} 等）の裸出力は、表の根拠列・パターン定義内など正規様式として
      許容する領域を除外規則で定義する。許容領域の裸出力は unclassified-entry 検出の対象外とする
      （IR-064 文脈許容様式との連動: ru-batch-20260903）」
  - id: ACT-DESIGN-023
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-064-unresolved-placeholder.md
    target_area: exemption（許容条件）
    source_items: [AG-025]
    content: |
      正規様式の文脈許容を明文化する:
      「IR-{NNNN} 等の ID プレースホルダーは、本文中では backtick 包囲を正とする。ただし表の根拠列・
      検出器語彙・パターン定義内など、様式上 backtick 包囲が成立しない領域は裸出力を許容する。
      許容領域の定義は distribution-boundary Design の除外規則と一致させる」

  - id: ACT-DESIGN-024
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-templates.md
    target_area: 追加セクション構成
    source_items: [AG-008]
    content: |
      追加セクション構成（execution contract セクション）の監査値要素に計測基準の記載欄を含める:
      「監査値（bun test 件数・検出件数等）には計測基準（基準 commit または時点）を併記する」
      （REQ-017-018 に対応する Issue 本文構成要素。adversarial-review F-8 により追加）

conflict_resolutions:
  - id: CR-001
    conflict: "check_extensions の NG baseline 運用が SPEC（共用 ng-baseline・additions manifest 必須）と実装（分離 baseline 想定・未作成）で分岐していた（RU-0001）"
    resolution: "SPEC を正とし実装を整合させる（ユーザー決定 2026-09-03）。integrity-contracts の baseline 運用契約節に SPEC 正の確定を明文化し、実装側を共用 baseline 運用へ修正する"
  - id: CR-002
    conflict: "japanese-tech-writing 投影について『走査除外・削除』（RU-0016 系）と『checker の third-party 許容拡張』（RU-0017 系）が逆方向の管理モデルを提示していた"
    resolution: "DEC-023 を accepted 昇格のうえ検査許容（INSPECTION-TOLERATED）モデルで統一（ユーザー決定 2026-09-03）。遺構投影ディレクトリは削除するが、以後の third-party 起源配置は除外ではなく許容として管理する"
  - id: CR-003
    conflict: "intake-from-github ガードレールの『gh CLI のみ使用』表記が REQ-011-002/008/014（gh 直接記述の後退防止）と矛盾していた（RU-0013）"
    resolution: "Custom Tool（agentdev_gh）経由の表記に統一して解消。REQ-011 の変更は不要（既存行の適用で是正）"
  - id: CR-004
    conflict: "DEC-023 が proposed のまま引用されており accepted-adr-only 系検査（DEC-023 引用 2 箇所）に違反していた（RU-0011）"
    resolution: "DEC-023 を accepted に昇格して解決（ユーザー決定）。引用付け替えは不要で、(proposed) 注記系を現行化する"
  - id: CR-005
    conflict: "integrity-contracts L477 の normative 参照が不所存パス（.omo/plans/ 移行計画）を指しており、REQ-057-015（Design は将来計画を保持しない）と緊張していた（RU-0025 系）"
    resolution: "normative 参照を除去する（REQ-057-015 の適用）"
  - id: CR-006
    conflict: "RU-0002 の AG SPEC 確定候補 2 件の正規所有先（AG SPEC）が DEC-017 で廃止済みであり、後継 traceability は候補数上限概念を持たない"
    resolution: "RU-0002 を取り下げ（ユーザー決定 2026-09-03）。判断根拠を review_dispositions（RD-001）に記録"
  - id: CR-007
    conflict: "REQ-057・REQ-017 が SPLIT 予兆シグナル 2（要件行多数・関心分類混在・成果物種別複数）に到達していた"
    resolution: "いずれも APPEND 継続（ユーザー決定 2026-09-03）。本バッチの追記は 1〜2 行と少量で既存系統（現行化・execution contract）の延長であるため"

operation_units:
  # OU-001/002 を先行する順序は DEC-023 昇格が検査許容モデルの正規根拠となるため（推奨順序）
  - ou_id: OU-001
    source_ru: RU-0011
    target_req: REQ-057
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: completed
      saved_req_docs: [REQ-057]
      artifact_actions: [ACT-REQ-001, ACT-DEC-001]
      applied_rows: [REQ-057-009(update)]
      decision_updates: [DEC-023(proposed->accepted)]
      unclassified_verification_rows: []
  - ou_id: OU-002
    source_ru: [RU-0016, RU-0017]
    target_req: REQ-018
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      status: completed
      saved_req_docs: [REQ-018]
      artifact_actions: [ACT-REQ-002]
      applied_rows: [REQ-018-003, REQ-018-004]
      unclassified_verification_rows: [REQ-018-003, REQ-018-004]
  - ou_id: OU-003
    source_ru: RU-0018
    target_design: docs/designs/integrity/integrity-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0001
    target_design: docs/designs/integrity/integrity-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0003
    target_design: docs/designs/authoring/command-file-format.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0005
    target_req: REQ-047
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result:
      status: completed
      saved_req_docs: [REQ-047]
      artifact_actions: [ACT-REQ-003]
      applied_rows: [REQ-047-009]
      unclassified_verification_rows: [REQ-047-009]
  - ou_id: OU-007
    source_ru: RU-0006
    target_design: docs/designs/skills/agentdev-workflow-templates.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-0007
    target_req: REQ-017
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result:
      status: completed
      saved_req_docs: [REQ-017]
      artifact_actions: [ACT-REQ-004]
      applied_rows: [REQ-017-018]
      unclassified_verification_rows: [REQ-017-018]
  - ou_id: OU-009
    source_ru: RU-0008
    target_req: REQ-056
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result:
      status: completed
      saved_req_docs: [REQ-056]
      artifact_actions: [ACT-REQ-005]
      applied_rows: [REQ-056-010(update)]
      unclassified_verification_rows: []
  # OU-010〜OU-013 は実行系 OU（REQ/Design ファイル操作なし。case 実行主体の作業単位）
  - ou_id: OU-010
    source_ru: RU-0009
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    result: {}
  - ou_id: OU-011
    source_ru: RU-0010
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
    result: {}
  - ou_id: OU-012
    source_ru: RU-0012
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
    result: {}
  - ou_id: OU-013
    source_ru: RU-0013
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
    result: {}
  - ou_id: OU-014
    source_ru: RU-0014
    target_req: REQ-053
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 13
    issue_policy: single
    result:
      status: completed
      saved_req_docs: [REQ-053]
      artifact_actions: [ACT-REQ-006]
      applied_rows: [REQ-053-023]
      unclassified_verification_rows: [REQ-053-023]
  - ou_id: OU-015
    source_ru: RU-0015
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 14
    issue_policy: single
    result: {}
  - ou_id: OU-016
    source_ru: RU-0020
    target_req: REQ-057
    operation: append
    scale: standard
    depends_on: [OU-017]
    recommended_order: 16
    issue_policy: single
    result:
      status: completed
      saved_req_docs: [REQ-057]
      artifact_actions: [ACT-REQ-007]
      applied_rows: [REQ-057-023]
      unclassified_verification_rows: [REQ-057-023]
  # OU-016 の宣言付与実行は OU-017（draft Design triage）完了後（RU frontmatter depends_on 継承）
  - ou_id: OU-017
    source_ru: RU-0021
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 15
    issue_policy: single
    result: {}
  - ou_id: OU-018
    source_ru: RU-0022
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 17
    issue_policy: single
    result: {}
  - ou_id: OU-019
    source_ru: RU-0023
    target_design: docs/designs/local/runtime-package-boundary.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 18
    issue_policy: single
    result: {}
  - ou_id: OU-020
    source_ru: RU-0024
    target_design: docs/designs/authoring/vocabulary-registry.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 19
    issue_policy: single
    result: {}
  - ou_id: OU-021
    source_ru: RU-0025
    target_design: docs/designs/integrity/integrity-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 20
    issue_policy: single
    result: {}
  - ou_id: OU-022
    source_ru: RU-0026
    target_design: docs/designs/integrity/rules/IR-042-hardcoded-req-count.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 21
    issue_policy: single
    result: {}
  - ou_id: OU-023
    source_ru: RU-0027
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 22
    issue_policy: single
    result: {}
  - ou_id: OU-024
    source_ru: RU-0028
    target_design: docs/designs/local/runtime-package-boundary.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 23
    issue_policy: single
    result: {}
  - ou_id: OU-025
    source_ru: RU-0019
    target_design: docs/designs/integrity/rules/IR-064-unresolved-placeholder.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 24
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      DEC-023.md の frontmatter status が accepted であることを確認する。docs-check を実行し
      accepted-adr-only 系の引用警告が 0 件であることを確認する。docs/decisions/README.md の
      AUTOGEN 分類・件数（accepted 16 / proposed 8）と docs/README.md L97 の表記が実態と一致する
      ことを確認する。
    pass_criteria: |
      status=accepted、引用警告 0 件、AUTOGEN 件数と注記表記が実態と一致している。
    on_failure: |
      fix-and-reverify。表記・分類の修正は軽微であり確定契約（accepted 昇格）に直結するため。
  - id: TS-002
    target_item: AG-002
    verification: |
      bun test の skills_structure 系テストが全件 pass すること（現行 4 fail の解消）。check_integrity
      実行で japanese-tech-writing の projection-extra warning が 0 件であることを確認する。
      併せて worktree junction 環境（環境伝播境界）で third-party 管理登録済み配置が許容扱いとなる
      ことを確認する。
    pass_criteria: |
      テスト全 pass、warning 0 件、許容モデルが環境差にかかわらず機能する。
    on_failure: |
      fix-and-reverify。検査・テストの失敗は許容モデル実装の不備であり修正可能な範囲のため。
  - id: TS-003
    target_item: AG-003
    verification: |
      check_integrity を実行し、baseline-known 以外の未処置違反が 0 件であることを確認する。
      IR-055 baseline 52 件が baseline 登録 / 個別修正 / 検出器調整のいずれかに分類記録されている
      ことを確認する。
    pass_criteria: |
      未分類残存 0 件、処置記録が全件存在する。
    on_failure: |
      fix-and-reverify。処置漏れは統一選択基準の適用不足であり個別修正で解消できるため。
  - id: TS-004
    target_item: AG-004
    verification: |
      check_extensions を共用 ng-baseline（additions manifest 必須）運用で実行し、demotion 挙動が
      baseline 運用契約どおり機能することを確認する。分離 baseline（check-extensions-baseline.json）
      が作成されていないことを確認する。
    pass_criteria: |
      SPEC 運用どおりの demotion 挙動、分離 baseline 不在。
    on_failure: |
      fix-and-reverify。実装側の baseline 解釈修正は限定された変更のため。
  - id: TS-005
    target_item: AG-005
    verification: |
      command-file-format Design に references 見出しの対象外明文化と E系正規形（E4-1 / E5b の
      判定根拠例示を含む）が記載されていることを確認する。
    pass_criteria: |
      対象外明文化と正規形定義の双方が記載されている。
    on_failure: |
      fix-and-reverify。Design 記載の欠落は追記で解消できるため。
  - id: TS-006
    target_item: AG-006
    verification: |
      checker が command-format-rules.yaml・distribution-targets.yaml を読み込む単一経路で動作する
      ことを確認する。yaml を一時リネイムして checker が fail-closed で停止することを確認する
      （依存境界）。docs-check の出力形式が変更されないことを確認する（REQ-047-005 外部契約）。
    pass_criteria: |
      単一経路での読込、欠損時 fail-closed、外部契約の出力不変。
    on_failure: |
      fix-and-reverify。読込統合の実装不備は修正可能なため。
  - id: TS-007
    target_item: AG-007
    verification: |
      workflow-templates Design に src/opencode-local 配下の明示様式を含む正規表記が記載されている
      ことを確認する。
    pass_criteria: |
      正規表記の記載が存在する。
    on_failure: |
      fix-and-reverify。
  - id: TS-008
    target_item: AG-008
    verification: |
      REQ-017 に計測基準記録の行が追加されていることを確認する。case-open が生成する Issue 本文に
      計測基準の記載欄が反映されることを確認する。
    pass_criteria: |
      REQ 行の存在と Issue テンプレートへの反映。
    on_failure: |
      fix-and-reverify。
  - id: TS-009
    target_item: AG-009
    verification: |
      checker が docs/knowledge/ の frontmatter 欠落・不備（title / created / updated）を検出することを
      正常 fixture と欠落 fixture で確認する。REQ-056-010 行に検査範囲の明文化があることを確認する。
    pass_criteria: |
      欠落 fixture の検出と正常 fixture の非検出、REQ 行の明文化。
    on_failure: |
      fix-and-reverify。checker 拡張の実装不備は修正可能なため。
  - id: TS-010
    target_item: AG-010
    verification: |
      docs-and-design-promotion.md に qg-4-final-acceptance.md への明示参照が存在することを
      grep で確認する。
    pass_criteria: |
      参照が存在する。
    on_failure: |
      fix-and-reverify。
  - id: TS-011
    target_item: AG-011
    verification: |
      scripts ディレクトリ以外のカレントディレクトリから traceability check CLI の実行例どおりに
      実行し、正しく動作することを確認する。SKILL.md の実行例に root 明示があることを確認する。
    pass_criteria: |
      cwd 非依存で検証が動作する。
    on_failure: |
      fix-and-reverify。
  - id: TS-012
    target_item: AG-012
    verification: |
      Case 冒頭で inspect-skills 配下（SKILL.md + references）に contracts.md への言及が現行どれだけ
      残存するかを grep で再確認する。言及が残存する場合は付け替え先の参照先がすべて実在することを
      確認する。現行 0 件の場合は解消済みと記録する（adversarial-review F-4）。
    pass_criteria: |
      不在参照 0 件（解消済み記録を含む）、参照先すべて実在。
    on_failure: |
      fix-and-reverify。
  - id: TS-013
    target_item: AG-013
    verification: |
      intake-from-github.md に gh CLI 直接実行を指示する記述が残っていないことを grep で確認する。
      Custom Tool 経由の表記と API 直接呼出不可の意味が保持されていることを確認する。
    pass_criteria: |
      直接実行記述 0 件、Tool 経由表記の維持。
    on_failure: |
      fix-and-reverify。
  - id: TS-014
    target_item: AG-014
    verification: |
      既知不備（docs/decisions<README>.md 誤記 7 箇所・「-066 準拠」1 箇所・查読系は Case 冒頭の
      センチネル出力から再特定）の是正後、センチネル検査（S-05 / S-06 / S-08 の対象集合拡大後）を
      references/ 配下に実行して検出 0 件であることを確認する。ただし
      japanese-replacement-dictionary.md は除外規則適用のことを確認する。
    pass_criteria: |
      検出 0 件（除外規則対象を除く）。
    on_failure: |
      fix-and-reverify。是正漏れは個別修正で解消できるため。
  - id: TS-015
    target_item: AG-015
    verification: |
      lint_skills.ts を実行し、description 集合の合計が 17850 字以下であることを確認する。
      DESC_AVERAGE_BUDGET = 350 が変更されていないことを確認する。
    pass_criteria: |
      集合 17850 字以下、閾値不変。
    on_failure: |
      fix-and-reverify。圧縮不足は追加圧縮で解消できるため。
  - id: TS-016
    target_item: AG-016
    verification: |
      artifact-responsibilities Design に宣言配置先カタログが記載されていること、REQ-057 に新行が
      追加されていることを確認する。
    pass_criteria: |
      カタログ記載と REQ 行の存在。
    on_failure: |
      fix-and-reverify。
  - id: TS-017
    target_item: AG-017
    verification: |
      draft Design 2 件の frontmatter status が draft 以外（accepted 等）に更新されていること、
      または retire されていること（ファイル不在）を確認する。docs-check で IR-054 違反が
      0 件であることを確認する。
    pass_criteria: |
      2 件とも draft 残存でない、IR-054 違反 0 件。
    on_failure: |
      fix-and-reverify。triage 実行の不備は status 操作で解消できるため。
  - id: TS-018
    target_item: AG-018
    verification: |
      bun test の integrity suite 関連テストが全件 pass すること。traceability check で
      REQ-057-011 / 012 分の missing-implementation 計上が 0 件であることを確認する。
      両 REQ に対する ADF-COVERS(implementation) 宣言が付与されていることを確認する。
    pass_criteria: |
      テスト全 pass、missing-implementation 0 件、宣言付与済み。
    on_failure: |
      fix-and-reverify。実装完遂は本バッチの確定合意のため。
  - id: TS-019
    target_item: AG-019
    verification: |
      runtime-package-boundary・install-script-usability の両 Design に明文化内容が記載されている
      ことを確認する。install script の dry-run 出力（WOULD REMOVE 対象・表示形式・[INFO] 報告）が
      Design 記載と一致することを確認する。
    pass_criteria: |
      Design 記載と実装挙動の一致。
    on_failure: |
      fix-and-reverify。
  - id: TS-020
    target_item: AG-020
    verification: |
      ADR 用語棚卸しの結果（検出リストと除外規則の適用記録）が存在すること。docs/designs/ と src/ の
      正規成果物で ADR 機能用語の残存が除外規則対象のみであることを確認する。req-define Design で
      「実装面」表記が 0 件であることを grep で確認する。
    pass_criteria: |
      棚卸し記録の存在、残存が除外規則対象のみ、「実装面」0 件。
    on_failure: |
      fix-and-reverify。
  - id: TS-021
    target_item: AG-021
    verification: |
      修正後に (1) REQ-006-112 dangling 参照 (2) .omo/plans/ normative 参照 (3) REQ-001-031 参照
      （IR-044 系・fixtures 連動分を含む全箇所） (4) 裸 4 桁表記（integrity-contracts.md・release
      script。design-save.md は Case 冒頭の再確認結果に従う）のそれぞれが grep で 0 件であることを
      確認する。bun test の fixture 系テストが全件 pass することを確認する。
    pass_criteria: |
      不整合参照 0 件、fixture 系テスト全 pass。
    on_failure: |
      fix-and-reverify。参照付け替えは機械的修正のため。
  - id: TS-022
    target_item: AG-022
    verification: |
      docs/README.md の本文件数が 49 件・一覧表に REQ-058 行が存在することを確認する。
      IR-042 の検査対象に docs/README.md が含まれた状態で、件数を意図的に崩した場合に検出される
      ことを確認する（検査動作確認後は元に戻す）。
    pass_criteria: |
      記述一致と乖離検出の動作確認。
    on_failure: |
      fix-and-reverify。
  - id: TS-023
    target_item: AG-023
    verification: |
      checker-execution-contracts に安定実行経路節が追加されていることを確認する。Windows + bun
      環境で stdout 証跡を要する checker を実行し、機械可読 stdout レポートが失われないことを
      確認する（実行境界）。
    pass_criteria: |
      契約記載の存在と stdout 証跡の安定取得。
    on_failure: |
      fix-and-reverify。実行経路の不備は経路切り替えで解消できるため。
  - id: TS-024
    target_item: AG-024
    verification: |
      配布境界 gate が事前承認済み TEMP ディレクトリへの書き込みを許可すること、および未承認
      ワークスペース外パスへの書き込みを引き続きブロックすること（fail-closed 維持）を確認する。
    pass_criteria: |
      例外許可と fail-closed の両立。
    on_failure: |
      fix-and-reverify。例外規則の実装不備は修正可能なため。
  - id: TS-025
    target_item: AG-025
    verification: |
      IR-064 に文脈許容様式が明文化されていること、distribution-boundary の除外規則が連動している
      ことを確認する。許容領域の裸出力（表の根拠列等）で gate の unclassified-entry 警告が
      0 件であることを確認する。
    pass_criteria: |
      明文化・連動の記載と許容領域での警告 0 件。
    on_failure: |
      fix-and-reverify。

realization_actions:
  - id: RA-001
    concern: japanese-tech-writing 遺構投影ディレクトリの削除と skills_structure 検査の許容モデル準拠
    responsibility: 配布境界・投影管理の実現面を third-party 検査許容モデルへ整合させる
    ownership_hints:
      - .opencode/skills/japanese-tech-writing/（削除対象の遺構投影）
      - .opencode/skills/repo-agentdev-integrity/scripts/skills_structure.test.ts（4 fail の是正）
      - docs/designs/integrity/rules/IR-068-skill-projection-manifest.md（許容 exemption の正規 Design）
    intent: jtw 遺構による検査ノイズ（projection-extra warning・bun test 4 fail）を除去し、以後の third-party 配置を許容モデルで管理する
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-002
    concern: check_integrity 既知残存違反の統一基準処置の実行
    responsibility: 既知残存違反を baseline 登録 / 個別修正 / 検出器調整に分類処置する
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/（content-corruption-checker の REQ-0108 系語彙扱い）
      - src/opencode/commands/agentdev/third-party-sync.md（system.md 記載要否の expanded-readme-sync 判定基準確認）
      - .agentdev または checker data の ir-055-baseline.json（heuristic 52 件の個別分類）
    intent: 処置記録を伴わない未処置違反を解消し、残存違反の根拠を明確にする
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-003
    concern: check_extensions の baseline 実装を共用 ng-baseline 運用へ整合
    responsibility: 分離 baseline 想定の実装を SPEC（共用 ng-baseline・additions manifest 必須）へ整合させる
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts
      - .opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json
    intent: SPEC と実装の分岐を解消し demotion 挙動を契約どおりにする
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-004
    concern: 検査定義 yaml の checker 読込統合の実装
    responsibility: command-format-rules.yaml・distribution-targets.yaml を正本として checker が読み込む単一経路を実装する
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml
      - .opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml
      - .opencode/skills/repo-agentdev-integrity/scripts/（docs-check 系 checker の読込変更）
      - .opencode/skills/repo-agentdev-integrity/lib/distribution-boundary.ts
    intent: 定義の二重管理を解消し、定義変更が checker に直接反映される単一真実源を実現する
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-005
    concern: docs/knowledge/ frontmatter 検査の checker 実装
    responsibility: checker に knowledge frontmatter（title / created / updated）検査を実装する
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/（knowledge 配下検査 checker）
      - docs/knowledge/（検査対象）
    intent: REQ-056-010 の検査範囲明文化に対応する機械検査を実装する
    verification_refs: [TS-009]
    source_items: [AG-009]
  - id: RA-006
    concern: case-close docs 検証 reference への qg-4 明示参照追加
    responsibility: docs-and-design-promotion.md に qg-4-final-acceptance.md への明示参照を追加する
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md
      - src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
    intent: bun test 実行の正規形契約の所在を追跡可能にする
    verification_refs: [TS-010]
    source_items: [AG-010]
  - id: RA-007
    concern: traceability check CLI の root 明示・cwd 依存排除
    responsibility: SKILL.md 実行例に root を明示し誤動作（静かな欠落）を防ぐ
    ownership_hints:
      - src/opencode/skills/agentdev-traceability/SKILL.md（L67-73 の --root . 表記）
      - src/opencode/skills/agentdev-traceability/scripts/（check.ts の絶対パス解決）
    intent: cwd 依存の静かな検証欠落を解消する
    verification_refs: [TS-011]
    source_items: [AG-011]
  - id: RA-008
    concern: inspect-skills の contracts.md 不在参照の解消
    responsibility: 残存する言及を実在する正規 Design へ付け替える（現行 0 件の場合は解消済みと記録する）
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-inspect-skills/（検出時点は SKILL.md 2 箇所・references 43 箇所。現行 grep で contracts 語 0 件のため Case 冒頭に再確認）
    intent: 不存在参照を解消し参照先を正規原本に一致させる
    verification_refs: [TS-012]
    source_items: [AG-012]
  - id: RA-009
    concern: intake-from-github の GitHub I/O 表記統一
    responsibility: L43 の gh CLI 直接実行記述を Custom Tool（agentdev_gh）経由表記へ修正する
    ownership_hints:
      - src/opencode/commands/agentdev/intake-from-github.md:43
    intent: REQ-011-002/008/014 とガードレール表記の矛盾を解消する
    verification_refs: [TS-013]
    source_items: [AG-013]
  - id: RA-010
    concern: references 既知不備の是正（查読系は Case 冒頭に再特定）
    responsibility: 簡体字混入・誤記リンク表記・参照残骸を是正する（置換辞書語彙源は除外）
    ownership_hints:
      - src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md（置換辞書の語彙源・除外規則対象）
      - src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md
      - src/opencode/skills/agentdev-doc-writing/references/review-output.md
      - src/opencode/skills/agentdev-decision-file-manager/references/validation-and-consistency.md（docs/decisions<README>.md 誤記 5 箇所）
      - src/opencode/skills/agentdev-workflow-case-open/references/issue-creation-flows.md（同 2 箇所）
      - src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md（L104「-066 準拠」）
      - 查読系の実所在は Case 冒頭のセンチネル出力から再特定する（adversarial-review F-5: 検出時点の所在指定に現行乖離）
    intent: 配布 references の既知品質不良を解消する
    verification_refs: [TS-014]
    source_items: [AG-014]
  - id: RA-011
    concern: SKILL.md description 集合の圧縮
    responsibility: lint_skills 出力の長大 description 上位ファイルを圧縮し 17850 字予算内に収める
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts（DESC_AVERAGE_BUDGET=350 は不変）
      - 長大 description 上位の配布 skill（Case 冒頭の lint 出力から選定）
    intent: 集合予算超過（18263 → 17850 以下）を圧縮で解消する
    verification_refs: [TS-015]
    source_items: [AG-015]
  - id: RA-012
    concern: draft Design 2 件の triage 実行
    responsibility: agentdev-artifact-validation・agentdev-design-file-manager の triage（昇格 / 更新 / retire）を実行する
    ownership_hints:
      - docs/designs/skills/agentdev-artifact-validation.md（draft, updated 2026-07-24）
      - docs/designs/skills/agentdev-design-file-manager.md（draft, updated 2026-07-28）
    intent: IR-054 違反（draft 残存）を解消し status を実態に一致させる
    verification_refs: [TS-017]
    source_items: [AG-017]
  - id: RA-013
    concern: REQ-057-011 / 012 の integrity suite 実装完遂と宣言付与
    responsibility: 残存欠陥の再特定と実装完遂、完了後の ADF-COVERS(implementation) 宣言付与
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/check_workflow_preventive.test.ts（現行 ≥18 比較は解消済み）
      - .opencode/skills/repo-agentdev-integrity/scripts/commands_e2e.test.ts（deriveExpectedCommands 導入済み）
      - Case 冒頭で traceability check の missing-implementation 現行計上を再確認
    intent: 両 REQ の実装対応を完遂し宣言を完備する（PR #2523 判断継承: 完了まで宣言しない）
    verification_refs: [TS-018]
    source_items: [AG-018]
  - id: RA-014
    concern: ADR 機能用語の機械的棚卸し実行
    responsibility: docs/** と src/** の ADR 語彙を除外規則込みで正規名称へ現行化する
    ownership_hints:
      - docs/**（66 ファイル）・src/**（77 ファイル）の「ADR」言及（AG-020 の適用範囲定義による）
      - 除外規則: 検出器語彙・テンプレートセクション名・履歴言及・retired 成果物
    intent: 廃止された ADR 機能用語の残存を正規名称（Decision）へ整理する（検出リストと除外規則の適用記録を残す）
    verification_refs: [TS-020]
    source_items: [AG-020]
  - id: RA-015
    concern: 破損・不整合参照の付け替え実行
    responsibility: extensions yaml dangling 参照・normative 不所存参照・IR-044 系参照・裸 4 桁表記の修正を実行する
    ownership_hints:
      - .agentdev/extensions/skills/agentdev-workflow-case-auto.yaml:25（REQ-006-112〜114 → REQ-034-032〜034。project-local 資産のため実行前提の明示を伴う）
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts（v2: fixture 連動）
      - docs/designs/commands/design-save.md:165（REQ-0136-029 → v2: 表記。現行で当該表記が不在のため Case 冒頭に再確認）
      - scripts/self/release/package-release-archive.ps1:93（REQ-0145-014 → v2: 表記）
      - docs/designs/integrity/rules/IR-044 候補語対照表連携（REQ-001-031 → REQ-001-049 付け替え）
    intent: 不整合参照を現行の正参照へ付け替え検査・テストの整合を保つ
    verification_refs: [TS-021]
    source_items: [AG-021]
  - id: RA-016
    concern: docs/README.md の現行要件記述の現行化
    responsibility: 本文件数 49 件化・REQ-058 行追加を実行する
    ownership_hints:
      - docs/README.md（本文・一覧表）
      - docs/requirements/README.md（AUTOGEN の正本）
    intent: docs/README.md と AUTOGEN・実ファイルの乖離を解消する
    verification_refs: [TS-022]
    source_items: [AG-022]
  - id: RA-017
    concern: 配布境界 gate の outside-root 例外規則の実装
    responsibility: agentdev-distribution-boundary-guard に承認済み一時領域カテゴリの例外判定を実装する
    ownership_hints:
      - agentdev-distribution-boundary-guard plugin（gate 実装）
      - docs/designs/local/runtime-package-boundary.md（判定基準の正規 Design）
    intent: TEMP 書き込みの over-block を一般化された例外規則で解消する（fail-closed 維持）
    verification_refs: [TS-024]
    source_items: [AG-024]
  - id: RA-018
    concern: DEC-023 昇格に伴う配布物・README の注記現行化
    responsibility: docs/README.md L97 と docs/decisions/README.md AUTOGEN の (proposed) 表記・分類を現行化する
    ownership_hints:
      - docs/README.md:97
      - docs/decisions/README.md（AUTOGEN 再生成）
    intent: 昇格後の実態に注記系を一致させる（ACT-DEC-001 と一体の反映）
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-019
    concern: stdout 証跡 checker の実行経路見直し
    responsibility: stdout 証跡を要する checker の実行・検証手順を安定実行経路（import 標準）へ見直す
    ownership_hints:
      - case-run / case-close の検証手順記述（stdout 証跡取得箇所）
      - docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md（適用知識）
    intent: Windows + bun 環境で checker の stdout 証跡が失われる実リスクを契約・手順の両面で解消する
    verification_refs: [TS-023]
    source_items: [AG-023]

review_dispositions:
  - id: RD-001
    source_ru: RU-0002
    source_item: RU-0002
    disposition: not_applicable
    reason_code: stale_target
    reason: |
      AG SPEC 確定候補 2 件（augmentation 実行契機の明示・rebase 時再計測手順）の正規所有先である
      AG SPEC は DEC-017 で廃止済みであり現存しない。後継の agentdev-traceability は
      REQ-012-045（候補数上限による黙った切り捨て禁止・全件返し）が候補数上限概念を所有しない。
      augmentation 意味定義（delegates_to / governs）も DEC-017 後の現行モデルに非適合である。
      ユーザー決定（2026-09-03）により取り下げる。
    evidence:
      path: docs/decisions/DEC-017.md
      section: AG SPEC 廃止
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0004
    source_item: RU-0004
    disposition: not_applicable
    reason_code: already_satisfied
    reason: |
      extractYamlField の YAML 解析二重経路は現行コードに存在しない。check_workflow_preventive.ts は
      check_extensions.ts から resolveExtensionState を import して再利用しており（L50, L448）、
      extractYamlField は repo 全域で不存在。共有 lib 再利用への統合が実装済みと確認できるため
      要件化作業対象外とする。
    evidence:
      path: .opencode/skills/repo-agentdev-integrity/scripts/check_workflow_preventive.ts
      section: resolveExtensionState import
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0012
    source_item: RU-0012
    disposition: partially_covered
    reason_code: already_satisfied
    reason: |
      RU-0012 の検出時点（2026-09-03）の「contracts.md 不在参照 16 箇所」は、現行の inspect-skills
      配下（SKILL.md + references）で contracts 語自体が 0 件（adversarial-review F-4 機械確認）。
      並行する参照方式の extension 経由切替（SKILL.md L84）により解消済みの可能性が高い。
      Case 冒頭に再確認を実施し、解消済みなら記録のみで AG-012 を完了する。
    evidence:
      path: src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md
      section: L84 付近（Design 参照は extension 経由で解決の記述）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    25 OU 構成。REQ 操作 6（REQ-057 update・REQ-018 update・REQ-047 append・REQ-017 append・
    REQ-056 update・REQ-053 append・REQ-057 append のうち設計確定に先行するもの）と Decision 操作 1
    （DEC-023 昇格）は req-save / design-save フェーズで完結し、実行系 OU（OU-003〜005 一部・
    OU-010〜018 の実装・是正作業）は case で実行する。design-save 対象は 23 ACT-DESIGN 操作。
  wave_hints:
    - "Wave 1（契約基盤）: OU-001（DEC-023 昇格）→ OU-002（検査許容モデル）。昇格が許容モデルの正規根拠"
    - "Wave 2（契約確定の残り）: OU-003〜009・OU-014・OU-019〜025（Design 確定・REQ 追記。相互依存なし）"
    - "Wave 3（triage 連鎖）: OU-017（draft Design triage）→ OU-016（宣言配置先カタログ適用。depends_on）"
    - "Wave 4（実行・是正）: OU-010〜013・OU-015・OU-018（実装・是正。契約確定後の実行が安全な順序）"
    - "技術的依存: OU-002 の実装（RA-001）は ACT-DESIGN-001/002 の Design 確定後。OU-018（RA-013）は単独で完結可能"
    - "同一 target_design への複数 OU・ACT（integrity-contracts.md: OU-003/004/021、runtime-package-boundary.md: OU-019/024 ほか、checker-execution-contracts.md: OU-006/023、workflow-templates: OU-007/008、install-script-usability: OU-019 内 2 ACT）は Wave 内で直列化すること（case-run Wave 内並列での同一ファイル競合防止。adversarial-review 戦略メタ反証反映）"
```

# summary

2026-09-03 の backlog サイクルで生成された 28 RU のうち 26 RU を要件化するバッチである。中核は 5 つの合意（DEC-023 昇格と third-party 検査許容モデル、baseline 運用は SPEC を正、検査定義 yaml の読込統合、ID プレースホルダーの文脈許容、description 集合の圧縮対応）であり、残りは契約確定・現行化・是正の個別作業である。RU-0002 は所有先不在のため取り下げ、RU-0004 は解消済み確認により対象外とした（根拠は review_dispositions）。REQ-057・REQ-017 の SPLIT 予兆は APPEND 継続で解消した（conflict_resolutions CR-007）。
