---
draft_type: req_draft
topic_slug: distribution-boundary-enforcement
status: saved
spec_consumed: true
created_at: 2026-08-11T00:00:00+09:00
saved_at: 2026-08-11T22:03:56.403+09:00
spec_saved_at: 2026-08-11T23:06:41.308+09:00
source_rus: []
---

<!-- req-define 生成成果物。後続工程（req-save/spec-save/case-open/case-run）が参照する
     原本は下記 # draft-data YAML ブロック。soft contract（LLM 推論経由で消費）。
     本 draft は adversarial-review 収束後の合意構造を符号化する。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  配布成果物と producer 内部成果物の間の意味依存境界を新 REQ-029 として確立し、
  従来 REQ-002-021..026、032 に分散していた自己完結性・harness 非依存・producer
  内部参照禁止を REQ-029 の 8 行へ MOVE して REQ-002 から行ごと除去する。REQ-002 は
  種別責務、原本と配置先、名前空間、skill 構造、Project Extensions 機構、委譲境界、
  SPEC 委譲という本来責務へ縮約し、移行・作業由来品質検査の 028/029/035 は既存品質
  契約と Epic 完了条件へ集約して RETIRE する。REQ-002 の生存行は 001..020、027、030、
  031、033、034 である（交叉参照行は残さない）。REQ-010 は保存・完了・release 経路の
  最終保証行を 1 行追加し、REQ-009 は通常の consumer link インストールと具体化された
  release archive projection（別個の配布・検証 projection）の区別を既存 009 行へ反映
  のうえ配布境界準拠の新規 045 行を 1 行だけ追加する。DEC-014 は多層 enforcement、
  共有 detector、fail-fast adapter、最終保証 gate、projection 分離、archive 公開前
  検査について長寿命決定を記録し、DEC-006 全体を置換せず IR-059 を IR-056 へ統合
  せずに、IR-059 の affected_artifact 範囲と source/save/complete/release の各
  enforcement 経路を本 Decision において変更する（別の後続決定へは委ねない）。新 SPEC
  docs/specs/integrity/distribution-boundary.md が意味モデル、分類値、配布テキスト
  成果物対象モデル、決定的判定と未分類扱い、候補抽出から決定までのパイプライン、
  generic と template 許容、ベースラインと個別承認例外の区別、誤検出抑制、共有 engine
  と adapter、検査エラー意味、source/installed/release projection、事前書き込み gate
  と最終 gate の契約、archive 公開前検査に加え、ユーザーが確定した安定実装契約（共有
  module パス、plugin パス、tool.execute.before フック種別、archive 検査呼び出し点、
  archive-installed 検証配置）までを一括して正規所有する。関数署名と実装コードは
  Epic 実装詳細へ委ねる。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      新規 REQ-029「配布依存境界」を 8 行で作成する。本 REQ は配布成果物と producer
      内部成果物の間の意味依存境界を統括し、従来 REQ-002-021〜026 および 032 に分散
      していた自己完結性・harness 非依存・producer 内部参照禁止を一本化する。
      REQ-029-001 は producer 内部依存と consumer で解決可能な依存を区別する。
      REQ-029-002 は境界を Markdown 本文に限定せず配布対象の全テキスト成果物へ適用する。
      REQ-029-003 は観察可能な意味境界不変条件として定式化し、検出器の実装手法を含まない。
      REQ-029-004 は producer 内部へ解決しない generic または template 参照を許容する。
      REQ-029-005 は producer 内部成果物を消費環境の runtime authority として要求しない。
      REQ-029-006 は runtime 依存が fresh consumer 環境で解決することを定める。
      REQ-029-007 は harness 固有の実行制御詳細への依存を禁止する。
      REQ-029-008 は harness 非依存の workflow 契約だけを残し、harness 側 runtime 状態
      管理を規定しない。各要件行は状態要件として肯定文の主文で記述し、境界条件と例外は
      否定文で併記する。REQ-029 は意味境界を所有し、検出モデルと分類値は新 SPEC が、
      検出器と adapter の実装は Epic が所有する（検出器詳細を REQ 本文へ混入しない）。

  - id: AG-002
    content: |
      REQ-002 を本来責務へ縮約する。種別責務、原本と配置先、正規名前空間と repo-local
      名前空間、ドメイン状態ディレクトリ、skill 命名と frontmatter と段階的開示、
      ガードレールスクリプト配置、配布物依存スキルの src 昇格、Project Extensions 機構
      と読込境界、subagent 委譲プロトコルの配布成果物側正規所有、安定外部契約の SPEC
      委譲は REQ-002 に残置する。これら以外の依存境界・自己完結性・harness 非依存は
      REQ-029 へ MOVE し、REQ-002 からは行ごと除去する（交叉参照行へ書き換えない）。
      保存後の REQ-002 の生存行は 001..020、027、030、031、033、034 である。
      行処理は以下の通り確定する。
      REQ-002-021「新規 clone 環境で依存先が解決できない参照を含まない」は
      REQ-029-005 と REQ-029-006 へ MOVE し、REQ-002 から除去する。
      REQ-002-022「harness 固有詳細を含まない」は REQ-029-007 へ MOVE し、
      REQ-002 から除去する。
      REQ-002-023「業務ワークフロー契約のみを記述」と REQ-002-024「runtime workspace
      管理は harness 側」は REQ-029-008 へ MOVE し、REQ-002 から除去する。ただし
      ワークフロー契約の肯定要素（工程目的、入力、前提、進行停止条件、永続成果物、
      許可禁止副作用、品質ゲート、結果契約）は SPEC 側へ残置する。
      REQ-002-025「プロジェクト固有識別子を含まない」、REQ-002-026「docs 内部パスを
      含まない」、REQ-002-032「project extension でトレーサビリティ補完」の 3 行は
      REQ-029-003 と REQ-029-004 へ意味更新付きで MOVE し、REQ-002 から除去する。
      032 の extension-only トレーサビリティは参照更新後に意図的に廃止する
      （extension を唯一の解決手段とする規定からの撤回）。extension 機構自体は
      REQ-002-030 と REQ-002-031 が残置するため維持される。
      REQ-002-027「導入先プロジェクトで解決可能な .opencode/ 相対パスまたは
      シンボリックパスのみを使用」は REQ-002 に残置するが、表現を「配布成果物が
      実行時依存として使用するパスは、導入先環境で解決可能であること」へ意味境界へ
      寄せて更新する。これは generic や template 参照の許容（REQ-029-004）と衝突
      しない（resolved 実参照だけを対象にするため）。

  - id: AG-003
    content: |
      REQ-002-027 の更新文を確定する。新文は
      「配布成果物が実行時依存として使用するパスは、導入先環境で解決可能であること」
      とする。「.opencode/ 相対パスまたはシンボリックパスのみ」という具体表現を
      除外し、解決可能性という観察可能な境界へ寄せる。これにより REQ-002-027 と
      REQ-029-004 の generic/template 許容が衝突しない（generic/template は実行時
      依存として解決対象ではないため）。

  - id: AG-004
    content: |
      REQ-002-028「内部 ID 除去後に Markdown 構文破損、主要構造の意図せぬ重複、壊れた
      参照残骸を残さない」、REQ-002-029「内部 ID 除去後に command、skill、SPEC 間で
      責務説明が矛盾しない」、REQ-002-035「case-auto.md の distribution-boundary 違反
      18 件の段階解消」の 3 行を RETIRE する。これらは移行・作業由来の品質検査を
      REQ 行として保持していたが、同等の検査は既存品質契約（docs-spec-rebuild-
      integrity.md、req-health-metrics.md、responsibilities/document-type-
      responsibilities.md）と Epic 完了条件で担保する。REQ-007 へ新規行を作成しない。
      028/029/035 の番号は欠番として維持し、REQ-002 の生存行は 001..020、027、030、
      031、033、034 となる。

  - id: AG-005
    content: |
      REQ-010 に行 REQ-010-060 を 1 行だけ追加する。新行は
      「self-hosting における AgentDevFlow 所有の保存・完了・release 経路は、配布境界
      検査の合格前に永続成果物を確定せず正常完了を報告せず、検査不能時は未合格として
      停止すること。」とする。振る舞い契約のみを記述し、ツール詳細を含まない。
      既存 REQ-010-012「保存工程と完了工程での変更ファイル限定検査」は case-run と
      case-close の最終 gate 基底としてそのまま維持する。authoring prevention 行
      （執筆時 prevention を REQ-010 へ新設する案）は採用せず、authoring は
      agentdev-skill-authoring.md と agentdev-command-authoring.md の両 SPEC 更新で
      対応する。

  - id: AG-006
    content: |
      REQ-009 は 2 件の別々の操作を行う。1 件は既存 REQ-009-009「シンボリックリンク
      ベースのインストールを推奨し、コピーベース、npm/package 化は対象外」の更新で、
      通常の consumer 導入は symlink/junction ベースの link mode であること、
      具体化された release archive は別個の配布および検証 projection であること、
      任意の手動 copy インストールと npm/package 配布は引き続き対象外であること、
      release archive を通常の copy インストールの延長として説明しないこと、を明示する。
      REQ-009-009 の適用範囲（対象・対象外）も同様に更新する。
      2 件目は行 REQ-009-045 を 1 行だけ追加する。新行は
      「AgentDevFlow が生成または管理する installed projection および release artifact
      は REQ-029 の配布依存境界を満たし、境界違反を含む release artifact を正常な配布
      成果物として生成してはならない。」とする。

  - id: AG-007
    content: |
      DEC-014「配布依存境界の多層 enforcement」を新規作成する。本 Decision は、
      DEC-006 が確立した inspect 3-command 正規化と IR-056 の Project Extensions
      検査分離を維持しつつ、IR-059 の affected_artifact 範囲と source/save/complete/
      release の各 enforcement 経路を変更する後続決定そのものである。DEC-006 全体を
      置換せず、IR-059 を IR-056 へ統合しない。長寿命決定だけを記録し、関数署名や
      実装コードは実装詳細へ委ねる。決定事項は次の通り。
      (1) 多層 enforcement: 共有 detector、repo-local pre-write plugin、ADF 所有の
      保存・完了・release gate が重畳して境界を担保する。
      (2) 共有 detector は副作用なし（side-effect-free）とし、複数の呼出経路で同一の
      判定を返す。
      (3) plugin は fail-fast adapter として振る舞い、検出結果を書き込み前に反映する。
      (4) ADF 所有の save/complete/release gate が最終保証となり、adapter バイパス時
      も最終経路で停止する。
      (5) 検査エラー（検査対象欠落、読込不能、未分類、adapter 起動失敗）はすべて
      gate-not-passed として扱い、clean として通過させない。
      (6) source、installed、release の各 projection を分離して検査する。
      (7) archive は公開前に検査し、違反残存時は最終 archive と成功経路を残さない。
      DEC-001 決定4「新規統制追加の原則」の7条件立証を附属証拠として明示する。
      (1) 問題の再現性: REQ-002 従来行と IR-059 の構文・パス検出中心では、producer
      内部への意味依存の一部を検出できないことが複数回観測された。
      (2) 被害の重大性: 配布成果物が consumer 環境で実行時欠落する事態は hard
      governance 該当（状態破壊、作業喪失、下流工程実行不能）に直結する。
      (3) 削除・統合・縮小では防げない: 構文検出に閉じた IR-059 単独では意味境界
      不変条件を扱えず、guidance 改善だけでは恒久担保できない。
      (4) 強制可能性: 共有 detector と fail-fast adapter と最終 gate の組合せで
      機械的強制が可能。
      (5) 正規所有者の一意性: 意味境界は REQ-029、検出モデルは新 SPEC、最終保証は
      REQ-010-060、長寿命判断は DEC-014 へ一意に定まる。
      (6) 既存の削除・簡略化: REQ-002-028/029/035 を RETIRE し、REQ-007 行を
      新設せず既存品質契約へ集約する。構文検査の重複を除去する。
      (7) 将来の再評価・削除条件: 配布成果物の producer 内部依存が生成パイプライン
      構造上発生し得なくなった場合、DEC-014 が定める多層 enforcement のうち
      pre-write adapter を段階的に縮小できる。その場合も最終保証 gate は維持する。

  - id: AG-008
    content: |
      docs/specs/integrity/distribution-boundary.md を新規作成する。本 SPEC は
      配布依存境界の意味モデルと検出契約に加え、ユーザーが確定した安定実装契約を
      一括して正規所有する。所有範囲は以下の通り。producer と distribution の意味
      モデル、依存分類値、実際に配布されるテキスト成果物の対象モデル、決定的に判定
      可能なテキストとバイナリの取扱い、未分類エントリの取扱い、候補抽出から解決・
      分類・決定までのパイプライン、generic と template 参照の許容、ベースラインと
      個別承認例外（individual accepted exception）の区別、誤検出抑制、共有 detector
      と adapter の契約、検査エラーの意味、source/link/archive/archive-installed の
      各 projection、事前書き込み gate と最終 gate の契約、archive 公開前検査。
      ユーザーが SPEC 候補へ配置を確定した安定実装契約は次の通り。これらは SPEC
      本文が正規所有し、Epic はこれに従う。
      (a) 副作用なしの共有 module は repo-agentdev-integrity 配下が所有し、想定
      モジュールパスを .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts
      とする。既存の checker はこの共有 module への adapter となる。
      (b) repo-local plugin のパスを .opencode/plugins/distribution-boundary-guard.ts
      とする。
      (c) 事前書き込み gate は OpenCode の tool.execute.before フック（サポート対象は
      edit、write、apply_patch）で構成し、prospective content を評価し、違反または
      検査エラー時に書き込みを block する。
      (d) scripts/package-release-archive.ps1 は最終公開前に一時 archive を検証する。
      (e) archive-installed 検証は一時的な consumer/archive-install パスを用い、
      check-consumer-opencode.ps1 へ新たな責務を追加しない。
      関数署名と実装コードは実装詳細として本 SPEC に含めない。

  - id: AG-009
    content: |
      既存の規範所有 SPEC に対して UPDATE 操作を行う。各 SPEC は実ファイルの既存
      節構造を読み取ったうえで対象節を更新する。更新内容は以下の通り。
      foundations/project-extensions.md「配布物参照境界の責務分担」節は境界所有を
      REQ-029 と新 SPEC へ寄せ、extension-only トレーサビリティを唯一の解決手段と
      する規定を削除する。extension 機構自体は維持する。
      foundations/harness-separation-model.md は依存と harness 境界の所有を
      REQ-029 と新 SPEC へ参照させ、移行済み行への旧参照を除去する。
      local/runtime-package-boundary.md は実際の配布対象集合と、link projection と
      具体化された archive projection の区別を反映する。
      integrity/integrity-contracts.md は source/installed/release の各 profile
      境界検査、workflow routing、検査エラー、release 公開契約を更新する。
      integrity/rules/IR-059-distribution-reference-boundary.md はルール固有の
      シグナル、許容、個別例外、severity、gate と実行経路、finding 経路を更新し、
      影響 artifact の意味を更新して意味モデルを新 SPEC へ参照させる。
      integrity/integrity-rule-catalog.md、integrity/rule-ownership.md、
      responsibilities/req-impact-map.md、integrity/docs-spec-rebuild-integrity.md
      は所有者と参照の変更を同期し、可能な箇所で REQ-002-021、022、023、024、025、
      026、028、029、032、035 の旧参照（MOVE 先への差し替えまたは RETIRE 扱い）を
      除去する。参照先ファイルまたは節が実在しない場合は内容を捏造せず実構造を
      使う。
      skills/agentdev-skill-authoring.md と skills/agentdev-command-authoring.md
      は執筆時 prevention 原則を追加する（REQ 行を新設しない）。
      commands/case-run.md と commands/case-close.md は変更経路 routing を共有
      境界 adapter へ接続し、REQ-010-012 を最終 gate 基底として再利用する。
      responsibilities/document-type-responsibilities.md、responsibilities/artifact-contracts.md、
      foundations/design-principles.md、foundations/patterns.md は、MOVE または RETIRE 後に
      stale となる REQ-002-021〜026、028、029、032 の参照を REQ-029 または更新後の REQ-002 へ
      差し替える。

  - id: AG-010
    content: |
      実装は Epic で管理し、REQ と Decision の本文には持ち込まない。安定実装契約
      （モジュールパス、plugin パス、フック種別、archive 検査呼び出し点）は
      docs/specs/integrity/distribution-boundary.md が正規所有し、Epic 受け入れ条件と
      実装仮定はこれに従う。関数署名と実装コードは実装詳細である。記録する内容は
      以下の通り。
      (a) 共有 detector module は SPEC 候補が定めるパス
      （.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts）
      へ実装し、既存 checker を adapter とする。
      (b) repo-local pre-write plugin は SPEC 候補が定めるパス
      （.opencode/plugins/distribution-boundary-guard.ts）と tool.execute.before
      フック（edit/write/apply_patch）へ実装する。Epic は公式 API が当該契約を満たす
      ことを検証し、満たせない場合は blocker として報告し user/architecture decision
      へ差し戻す（TS-005）。final-gate-only への静かな縮退は許さない。
      (c) .opencode/plugins/** は最小限の git tracking とする。
      (d) case-run と case-close の最終経路は共有 adapter を呼び出す。
      (e) scripts/package-release-archive.ps1 は最終公開前に一時 archive を検証する。
      (f) fresh consumer における link projection と archive-installed projection の
      検査を分離する。archive-installed 検証は一時的な consumer/archive-install
      パスを使用し、check-consumer-opencode.ps1 に新たな責務を追加しない。
      (g) 最終状態で violations=0、IR-059 ベースラインエントリ=0、個別承認例外
      エントリ=0 を満たす。ルールレベルの generic/template 許容は正当な clean
      fixture として残置する。
      (h) 既存違反の修復後に、構文、意味意図、参照残骸、command/skill/SPEC の責務
      整合が健全であることを Epic 完了証拠とする（新規 REQ 行は作成しない）。
      (i) agentdev-skill-authoring.md と agentdev-command-authoring.md の両
      SPEC 経由で執筆時 prevention を案内する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:distribution-boundary-enforcement
    source_items: [AG-001]
    content: |
      REQ-029: 配布依存境界

      ## 目的

      配布成果物と producer 内部成果物の間の意味依存境界を統括する。
      AgentDevFlow が適用先プロジェクトへ配布する成果物は、producer 内部の構成体、
      内部文書、harness 実行制御の詳細に依存して成立してはならない。
      本 REQ は従来 REQ-002 に分散していた自己完結性、harness 非依存、producer 内部
      参照禁止、runtime 依存解決を一本化し、観察可能な意味境界不変条件として定式化する。
      検出モデルと分類値は docs/specs/integrity/distribution-boundary.md が正規所有
      し、検出器、adapter、release archive 検査の実装詳細は Epic が所有する。
      本 REQ は状態要件を宣言し、実装手法を規定しない。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-029-001 | 配布成果物は、producer 内部依存と consumer で解決可能な依存を区別し、前者に依存しないこと |
      | REQ-029-002 | 配布依存境界は Markdown 本文に限定せず、配布対象のテキスト成果物すべてへ適用されること |
      | REQ-029-003 | 配布成果物は producer 内部成果物への具体参照に依存せず、producer 内部依存の境界は artifact 名称または ID 形式の既知集合に閉じないこと |
      | REQ-029-004 | producer 内部へ解決しない generic または template 参照は、配布成果物に許容されること |
      | REQ-029-005 | 配布成果物は、consumer 環境に不在の producer 内部成果物を runtime authority として要求しないこと |
      | REQ-029-006 | 配布成果物の runtime 依存は、新規 clone 相当の fresh consumer 環境で解決可能であること |
      | REQ-029-007 | 配布成果物は、harness 固有の実行制御詳細（エージェント名、モデル名、起動 API、timeout、retry、context 管理方式）に依存しないこと |
      | REQ-029-008 | 配布成果物は harness 非依存の workflow 契約（工程目的、入力、前提、進行停止条件、永続成果物、許可禁止副作用、品質ゲート、結果契約）だけを残し、harness 側 runtime 状態管理を規定しないこと |

      ## 適用範囲

      - **対象**: 配布成果物（command、skill、template、script のテキスト成果物）
        と producer 内部成果物の間の意味依存境界、producer 内部依存と consumer 解決
        可能依存の区別、意味境界不変条件の宣言、generic/template 許容、runtime 依存
        解決、harness 非依存、workflow 契約保持
      - **対象外**: 配布成果物の種別責務、原本と配置先、名前空間、Project Extensions
        機構、skill 構造、subagent 委譲プロトコル（REQ-002）、配布基盤と導入モデル
        （REQ-009）、検出器・adapter・release archive 検査の実装詳細（Epic）、
        検出シグナル、分類値、誤検出抑制、projection 判定、gate 実行経路の詳細
        （docs/specs/integrity/distribution-boundary.md）

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-002
    target_area: "目的、要件（REQ-002-021〜029、032、035）、適用範囲"
    source_items: [AG-002, AG-003, AG-004]
    content: |
      REQ-002 を本来責務へ縮約する。REQ-002-021〜026、032 は REQ-029 へ MOVE して
      REQ-002 から行ごと除去する（交叉参照行へ書き換えない）。REQ-002-028/029/035 は
      移行・作業由来品質検査行として RETIRE し、欠番を維持する。保存後の REQ-002 の
      生存行は 001..020、027、030、031、033、034 である。

      ## 目的（更新後）

      配布成果物（command、skill、template、script）の種別責務、原本と配置先、正規
      名前空間と repo-local 名前空間、ドメイン状態ディレクトリ、skill 命名と
      frontmatter と段階的開示、ガードレールスクリプト配置、配布物依存スキルの src
      昇格、Project Extensions 機構と読込境界、subagent 委譲プロトコルの配布成果物側
      正規所有、安定外部契約の SPEC 委譲を統括する。依存境界、自己完結性、harness
      非依存、producer 内部参照禁止、runtime 依存解決は REQ-029 が所有する。

      ## 行処理

      REQ-002-021（MOVE、REQ-029-005/006 へ移行、REQ-002 から除去）:
      新規 clone 環境で依存先が解決できない参照を含まないという runtime 自己完結性
      要求は REQ-029-005 と REQ-029-006 へ MOVE する。REQ-002-021 行は除去する。

      REQ-002-022（MOVE、REQ-029-007 へ移行、REQ-002 から除去）:
      harness 固有詳細の非依存は REQ-029-007 へ MOVE する。REQ-002-022 行は除去する。

      REQ-002-023（MOVE、REQ-029-008 へ移行、REQ-002 から除去）:
      業務ワークフロー契約のみを記述するという肯定要件のうち harness 非依存の側面は
      REQ-029-008 へ MOVE する。ワークフロー契約の肯定要素（工程目的、入力、前提、
      進行停止条件、永続成果物、許可禁止副作用、品質ゲート、結果契約）は SPEC
      （harness-separation-model.md、document-type-responsibilities.md、
      workflows/workflow-contracts.md）へ残置する。REQ-002-023 行は除去する。

      REQ-002-024（MOVE、REQ-029-008 へ移行、REQ-002 から除去）:
      runtime workspace 管理が harness 側責務である点は REQ-029-008 へ MOVE する。
      REQ-002-024 行は除去する。

      REQ-002-025（MOVE、REQ-029-003/004 へ意味更新付きで移行、REQ-002 から除去）:
      プロジェクト固有識別子の非含有は REQ-029-003 と REQ-029-004 へ MOVE する。
      REQ-002-025 行は除去する。

      REQ-002-026（MOVE、REQ-029-003/004 へ意味更新付きで移行、REQ-002 から除去）:
      docs 内部パスの非含有は REQ-029-003 と REQ-029-004 へ MOVE する。
      REQ-002-026 行は除去する。

      REQ-002-027（更新後、REQ-002 に残置）:
      配布成果物が実行時依存として使用するパスは、導入先環境で解決可能であること
      （generic と template 参照（REQ-029-004 許容）は実行時依存に該当しないため、
      本行と衝突しない）

      REQ-002-028（RETIRE、欠番維持）:
      内部 ID 除去後の構文健全性検査は docs-spec-rebuild-integrity.md と既存品質契約が
      担保する。REQ-007 行は新設しない。

      REQ-002-029（RETIRE、欠番維持）:
      内部 ID 除去後の責務整合検査は req-health-metrics.md、
      document-type-responsibilities.md、docs-spec-rebuild-integrity.md が担保する。
      REQ-007 行は新設しない。

      REQ-002-030（更新なし、REQ-002 に残置）:
      Project Extensions は workflow/capability responsibility 中心の単位で配置する。

      REQ-002-031（更新なし、REQ-002 に残置）:
      extension 読込の fail-open 契約。

      REQ-002-032（MOVE、REQ-029-003/004 へ意味更新付きで移行、REQ-002 から除去）:
      配布 command/skill 本文のプロジェクト固有 Decision、REQ、SPEC 具体 ID、具体
      パス、固定 URL への非依存は REQ-029-003 と REQ-029-004 へ MOVE する。
      extension-only トレーサビリティ条項は意図的に廃止する（extension は
      トレーサビリティを補完する手段の一つであり得るが、唯一の解決手段ではなくなる）。
      extension 機構自体は REQ-002-030 と REQ-002-031 が所有する。REQ-002-032 行は
      除去する。

      REQ-002-033（更新なし、REQ-002 に残置）:
      subagent 委譲プロトコルの配布成果物側正規所有。

      REQ-002-034（更新なし、REQ-002 に残置）:
      安定外部契約の SPEC 委譲。

      REQ-002-035（RETIRE、欠番維持）:
      case-auto.md の distribution-boundary 違反 18 件の段階解消は、REQ-029 確立と
      Epic 完了条件、既存 IR-059 検出で担保する。REQ-007 行は新設しない。

      ## 適用範囲（更新後）

      - **対象**: 配布成果物の種別責務、原本と配置先の規約、正規名前空間と
        repo-local 名前空間の宣言、ドメイン状態ディレクトリ、skill 命名と
        frontmatter と段階的開示の基本構造、ガードレールスクリプトの配置、配布物
        依存スキルの src 昇格、Project Extensions との配置と読込境界、subagent 委譲
        プロトコルの配布成果物側正規所有、安定外部契約の SPEC 委譲
      - **対象外**: 配布依存境界、自己完結性、harness 非依存、producer 内部参照禁止、
        runtime 依存解決（REQ-029）、配布基盤と導入モデル（REQ-009）、委譲時の判断、
        承認、副作用発動の境界（REQ-003）、REQ/Decision/SPEC の文書体系基盤と正規
        所有モデル（REQ-001）、要件定義プロセス（REQ-004）、ワークフロー protocol
        と工程接続（REQ-005）、個別 command、skill、template、script の詳細手順と
        実装詳細、inspect-* 検出と診断（REQ-010）、個別 IR 番号、正規表現、exemption
        条件、severity、repo-local 検査実装、導入先固有の extension 内容

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-010
    target_area: REQ-010-060
    source_items: [AG-005]
    content: |
      REQ-010-060（追加）:
      self-hosting における AgentDevFlow 所有の保存・完了・release 経路は、配布境界
      検査の合格前に永続成果物を確定せず正常完了を報告せず、検査不能時は未合格として
      停止すること。

      併記事項: 既存 REQ-010-012「保存工程と完了工程での変更ファイル限定検査」は
      case-run と case-close の最終 gate 基底として維持する。authoring prevention
      行は新設せず、authoring SPEC 両者（agentdev-skill-authoring.md と
      agentdev-command-authoring.md）の UPDATE で対応する。

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-009
    target_area: REQ-009-009
    source_items: [AG-006]
    content: |
      REQ-009-009（更新後）:
      通常の consumer 導入は symlink または junction ベースの link mode を推奨する。
      具体化された release archive は別個の配布および検証 projection であり、
      REQ-009-045 が別途正規所有する。任意の手動 copy インストールと npm/package
      配布は引き続き対象外とする。release archive を通常の copy インストールの
      延長として説明しないこと。

      REQ-009 適用範囲（対象・対象外）も同期して更新する。link インストールと
      release archive projection の区別を反映し、copy インストールと npm/package 化の
      対象外は維持する。

  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: REQ-009
    target_area: REQ-009-045
    source_items: [AG-006]
    content: |
      REQ-009-045（追加）:
      AgentDevFlow が生成または管理する installed projection および release artifact
      は REQ-029 の配布依存境界を満たし、境界違反を含む release artifact を正常な
      配布成果物として生成してはならない。

  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:distribution-boundary-enforcement
    source_items: [AG-007]
    content: |
      DEC-014: 配布依存境界の多層 enforcement

      ## 背景

      REQ-029 が新たに確立する配布依存境界は、観察可能な意味不変条件として定式化
      される。意味境界を保全するには、執筆時、保存時、完了時、release 公開時の複数
      経路で一貫した検査と最終保証が必要である。従来の IR-059 は構文・パス検出に
      限定され、DEC-006 は inspect 3-command 正規化を確立したが、いずれも多層
      enforcement の全体像を長寿命決定として記録していない。本 Decision は重畳する
      検査経路と最終保証を長寿命決定として確定するとともに、IR-059 の affected_
      artifact 範囲と enforcement 経路を本 Decision において変更する。検出器・adapter
      ・gate の関数署名と実装コードは Epic 実装詳細へ委ねる。

      ## 決定

      次の長寿命決定を確定する。関数署名と実装コードは本 Decision に含めず、Epic
      実装詳細とする。安定実装契約（モジュールパス、plugin パス、フック種別、
      archive 検査呼び出し点）は docs/specs/integrity/distribution-boundary.md が正規
      所有する。

      1. 多層 enforcement: 配布依存境界は、共有 detector と repo-local pre-write
         plugin と ADF 所有の保存・完了・release gate が重畳して担保する。単一の
         経路だけに依存しない。
      2. 共有 detector: 副作用なし（side-effect-free）の detector を共有し、
         複数の呼出経路で同一の判定を返す。detector は状態を変化させない。
      3. fail-fast adapter: repo-local pre-write plugin は検出結果を書き込み前に
         反映する fail-fast adapter として振る舞う。
      4. 最終保証 gate: ADF 所有の save/complete/release gate が最終保証となる。
         adapter を利用者または編集経路がバイパスしても、最終経路で停止する。
      5. 検査エラー意味: 検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗
         などの検査エラーはすべて gate-not-passed として扱い、clean として通過
         させない。
      6. projection 分離: source、installed、release の各 projection を分離して
         検査する。いずれかの projection で違反が残存する場合、全体を通過扱いに
         しない。
      7. archive 公開前検査: archive は公開前に検査し、違反残存時は最終 archive と
         成功経路を残さない。

      ## DEC-006 および IR-056、IR-059 との関係

      本 Decision は、DEC-006 が確立した inspect 3-command 正規化（docs-check、
      inspect-skills、inspect-promote）と、IR-056 の Project Extensions 検査分離を
      維持しつつ、IR-059 の affected_artifact 範囲と source/save/complete/release
      の各 enforcement 経路を変更する後続決定そのものである。DEC-006 全体を置換
      せず、IR-059 を IR-056 へ統合しない。本 Decision が IR-059 の範囲と経路を
      確定するため、IR-059 の範囲変更を別の後続決定へ委ねることはない。

      ## DEC-001 決定4（新規統制追加の原則）の7条件立証

      本 Decision に伴う多層 enforcement と最終保証は、DEC-001 決定4 の7条件に対し
      次の証拠を立証する。

      1. 再現可能または複数回観測された問題: REQ-002 従来行と IR-059 の構文・パス
         検出中心では、producer 内部への意味依存の一部を検出できないことが複数回
         観測された。
      2. hard control に値する被害: 配布成果物が consumer 環境で実行時欠落する事態
         は、DEC-001 決定3 の状態破壊、作業または永続情報の喪失、下流工程の実行不能
         に直結する。
      3. 削除・統合・interface 縮小・guidance 改善では防げない: 構文検出に閉じた
         IR-059 単独では意味境界不変条件を扱えず、guidance 改善だけでは恒久担保
         できない。
      4. 機械的または運用上の強制可能性: 共有 detector と fail-fast adapter と
         最終 gate の組合せで機械的強制が可能である。
      5. 正規所有者の一意性: 意味境界は REQ-029、検出モデルと安定実装契約は新 SPEC、
         最終保証は REQ-010-060、長寿命判断は本 Decision へ一意に定まる。
      6. 既存の削除・簡略化: REQ-002-028/029/035 を RETIRE し、REQ-007 行を新設
         せず既存品質契約へ集約する。構文検査の重複を除去する。
      7. 将来の削除条件または再評価条件: 配布成果物の producer 内部依存が生成
         パイプライン構造上発生し得なくなった場合、本 Decision の多層 enforcement
         のうち pre-write adapter を段階的に縮小できる。その場合も最終保証 gate
         （REQ-010-060）は維持する。

      ## 結果、影響

      - REQ-029 が意味境界の正規所有者となり、REQ-002 は種別責務と原本/配置境界
        へ縮約される。
      - REQ-010-060 が最終保証 gate の安定契約を宣言する。
      - docs/specs/integrity/distribution-boundary.md が検出モデル、安定実装契約、
        projection 契約の正規所有者となる。
      - 既存 SPEC 群（project-extensions.md、harness-separation-model.md、
        runtime-package-boundary.md、integrity-contracts.md、IR-059、rule-catalog、
        rule-ownership、req-impact-map、docs-spec-rebuild-integrity、両 authoring
        SPEC、case-run.md、case-close.md）は所有者と参照の同期更新を受ける。
      - IR-059 の affected_artifact 範囲と source/save/complete/release の各
        enforcement 経路は本 Decision により変更される。別の後続決定は発生しない。

      ## 関連する決定

      - DEC-001 決定4（新規統制追加の原則）: relates-to。本 Decision は7条件立証を
        附属証拠として明示する。
      - DEC-006（inspect 3-command 構成への正規化）: relates-to。本 Decision は
        DEC-006 の正規化と IR-056 の Project Extensions 検査分離を維持しつつ、
        IR-059 の範囲と経路を変更する後続決定である。DEC-006 全体を置換しない。
      - DEC-013（IR 登録モデルの簡素化）: relates-to。IR 存在条件モデルに従い、
        IR-059 の範囲変更は本 Decision で確定する。

  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: integrity
      slug: distribution-boundary
    source_items: [AG-008]
    content: |
      配布依存境界 SPEC

      本 SPEC は docs/specs/integrity/distribution-boundary.md として新規作成する。
      REQ-029 が宣言する意味境界を検証するための意味モデル、分類、検出パイプライン、
      projection 契約、gate 契約に加え、ユーザーが確定した安定実装契約を一括して
      正規所有する。関数署名と実装コードは実装詳細として本 SPEC に含めない。

      ## 目的

      配布依存境界の検証モデルを確立し、producer 内部依存と consumer 解決可能依存の
      区別、配布テキスト成果物の対象定義、決定的判定と未分類扱い、generic と template
      許容、ベースラインと個別承認例外の区別、誤検出抑制、検査エラー意味、各 projection
      の検査契約、事前書き込み gate と最終 gate の契約、archive 公開前検査、安定実装
      契約を正規所有する（REQ-029、REQ-010-060、DEC-014）。

      ## producer と distribution の意味モデル

      producer は配布成果物を生成・管理する AgentDevFlow 本体を指す。distribution は
      consumer 環境へ配布されるテキスト成果物の集合を指す。配布成果物は consumer
      環境で自己完結して実行されるため、producer 内部の構成体、内部文書、harness
      実行制御の詳細に依存して成立してはならない（REQ-029-001）。

      依存分類値は次の通り。

      - consumer-resolvable（許容）: consumer 環境で runtime 解決可能な参照。
      - generic-or-template（許容）: producer 内部へ解決しない汎用参照または
        template 参照（REQ-029-004）。
      - producer-internal（不許容）: consumer 環境に不在の producer 内部成果物への
        具体参照。
      - unclassified（gate-not-passed）: 検査時点で分類不能。検査エラーと同等に
        gate-not-passed 扱いとする。

      ## 配布テキスト成果物の対象モデル

      境界は Markdown 本文に限定しない（REQ-029-002）。配布対象のテキスト成果物
      （command 定義、skill 定義、template、script ソース、附属するテキスト形式の
      設定や README）すべてへ適用する。テキストと判定可能な成果物とバイナリと判定
      される成果物を決定的に区別し、判定不能なエントリは unclassified として
      gate-not-passed 扱いとする。

      ## 候補抽出から決定までのパイプライン

      検出パイプラインは次の 4 段階で構成する。各段階で副作用を発生させない。

      1. 候補抽出: 配布テキスト成果物から依存候補を抽出する。
      2. 解決: 候補を consumer 環境の仮定で解決試行する。
      3. 分類: 解決結果に基づき consumer-resolvable、generic-or-template、
         producer-internal、unclassified のいずれかへ分類する。
      4. 決定: 分類結果に基づき gate 合格または gate-not-passed を決定する。

      ## generic と template 許容

      REQ-029-004 が許容する generic および template 参照は、producer 内部へ解決
      しないことを条件に許容する。ルールレベルで許容集合を定義し、個別承認例外
      （individual accepted exception）とは区別する。

      ## ベースラインと個別承認例外の区別

      ベースライン（baseline）は既知の検出事項集合を管理する運用機構であり、
      ルールレベルの許容（generic と template）とは別物である。個別承認例外は
      特定の検出事項に対して個別に付与された承認であり、ルール一般を書き換えない。
      誤検出抑制（false-positive suppression）は検出器の挙動であり、承認例外とは
      区別する。

      ## 共有 detector と adapter の契約

      共有 detector は副作用なし（side-effect-free）とし、複数経路から同一入力に
      対し同一判定を返す（DEC-014）。adapter は detector の判定を書き込み前に反映
      する fail-fast な経路である。両者の契約は本 SPEC が正規所有し、実装詳細は
      Epic が所有する。

      ## 検査エラーの意味

      検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗などの検査エラーは
      すべて gate-not-passed として扱う。clean として通過させない（DEC-014 決定5）。

      ## projection の分離

      次の 4 projection を分離して検査する。

      - source projection: src/opencode/ など原本領域。
      - link projection: 通常の consumer リンクインストールで展開される配置先。
      - archive projection: release として具体化された配布アーカイブ。
      - archive-installed projection: archive を展開し install した状態。

      いずれかの projection で違反が残存する場合、全体を通過扱いにしない。

      ## 事前書き込み gate と最終 gate の契約

      事前書き込み gate は執筆・編集経路で動作する fail-fast adapter であり、
      書き込み前に検出結果を反映する。最終 gate は REQ-010-060 が宣言する
      ADF 所有の保存・完了・release 経路での最終保証である。adapter を利用者または
      編集経路がバイパスしても、最終 gate で停止する。事前 gate を通過しても
      最終 gate を省略しない。

      ## archive 公開前検査

      archive は公開前に検査する。違反が残存する場合は最終 archive と成功経路を
      残さない（DEC-014 決定7、REQ-009-045）。

      ## 安定実装契約

      ユーザーが本 SPEC 候補へ配置を確定した安定実装契約。Epic 実装はこれに従う。
      関数署名、実装コード、内部データ表現は実装詳細として本節に含めない。

      - 共有 module: 副作用なし（side-effect-free）の canonical detector module は
        repo-agentdev-integrity 配下が所有する。想定モジュールパスは
        `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts`。
        既存の checker はこの共有 module への adapter となる。
      - repo-local plugin: plugin パスは
        `.opencode/plugins/distribution-boundary-guard.ts`。
      - 事前書き込み gate: OpenCode の `tool.execute.before` フック（サポート対象は
        `edit`、`write`、`apply_patch`）で構成する。adapter は prospective content を
        評価し、違反または検査エラー時に書き込みを block する。
      - archive 公開前検査の呼び出し点: `scripts/package-release-archive.ps1` が
        最終公開前に一時 archive を検証する。
      - archive-installed 検証の配置: 一時的な consumer/archive-install パスを用いて
        archive-installed projection を検証する。`check-consumer-opencode.ps1` へ
        新たな責務を追加しない。

      ## 関連 SPEC と実装詳細の帰属

      - 検出シグナル、正規表現、exemption 条件、severity、gate 実行経路の詳細:
        IR-059 と integrity-rule-catalog.md、rule-ownership.md、
        req-impact-map.md の同期更新で整理する。
      - 各 projection の技術詳細（link 構成、install 手順、archive レイアウト）:
        runtime-package-boundary.md、integrity-contracts.md の各 UPDATE で反映する。
      - 関数署名、実装コード、内部データ表現: Epic 実装詳細。本 SPEC は安定実装
        契約（モジュールパス、plugin パス、フック種別、archive 検査呼び出し点）の
        みを正規所有する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: project-extensions
    target_area: "配布物参照境界の責務分担"
    source_items: [AG-009]
    content: |
      docs/specs/foundations/project-extensions.md「配布物参照境界の責務分担」節を
      更新する。境界所有を REQ-029 と docs/specs/integrity/distribution-boundary.md
      へ寄せる。extension-only トレーサビリティを唯一の解決手段とする規定を削除し、
      extension 機構自体は追加・拡張・非上書き原則を維持して残置する。extension は
      トレーサビリティを補完する手段の一つであり、意味境界の唯一解でないことを明示
      する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: harness-separation-model
    target_area: "配布物の harness 非依存性"
    source_items: [AG-009]
    content: |
      docs/specs/foundations/harness-separation-model.md を更新する。依存境界と
      harness 境界の所有を REQ-029 と docs/specs/integrity/distribution-boundary.md
      へ参照させる。REQ-002-021、022、023、024、025、026、028、029、032、035 の
      移行済み行または RETIRE 済み行への旧参照を除去し、意味境界の
      正規所有者を REQ-029 へ明示する。harness 非依存性の原則は維持し、検出モデル
      の参照先だけを更新する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: "導入方式ポリシー（Installation Method Policy）"
    source_items: [AG-009]
    content: |
      docs/specs/local/runtime-package-boundary.md を更新する。実際の配布対象集合と、
      link projection と具体化された archive projection の区別を反映する。
      導入方式ポリシー表の copy 行と plugin/npm/package 行の位置づけを整理し、
      release archive projection が copy 型インストールの延長として誤解されないよう
      明示する。配布依存境界の検出契約は docs/specs/integrity/distribution-boundary.md
      を参照させる。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: "実行プロファイル分離"
    source_items: [AG-009]
    content: |
      docs/specs/integrity/integrity-contracts.md を更新する。source/installed/
      release の各 profile 境界検査、workflow routing、検査エラーの意味、release
      公開契約を更新する。検査エラーは gate-not-passed 扱いとし（DEC-014 決定5）、
      release profile は公開前検査を経て違反残存時に成功経路を残さない（DEC-014
      決定7、REQ-009-045）。Workflow × 使用ツールマトリックスの case-run と
      case-close 行は共有境界 adapter へ接続し、REQ-010-012 を最終 gate 基底として
      再利用する旨を追記する。配布依存境界の意味モデルは
      docs/specs/integrity/distribution-boundary.md を参照させる。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md
    target_area: "IR-059: distribution-reference-boundary"
    source_items: [AG-009]
    content: |
      # IR-059: distribution-reference-boundary

      配布テキスト成果物に含まれるプロジェクト固有の具体ID、具体パス、固定URLを検出する。本IR文書を検知パターン、exemption、severity、false-positive条件の正本とする。意味モデルと検出パイプラインの正規参照先は `distribution-boundary.md` である。

      | Field | Value |
      |---|---|
      | rule_id | IR-059 |
      | description | 配布テキスト成果物の具体ID、具体パス、固定URLを検出する |
      | severity | strict |
      | category | canonical-conflict |
      | detection_method | 具体ID、具体パス、固定URLのパターン検出と generic/template 許容、個別承認例外判定 |
      | affected_artifacts | `src/opencode/commands/**`, `src/opencode/skills/**`, template, script ソースなど配布対象テキスト成果物全般 |
      | related_req | REQ-029 |
      | related_spec | `distribution-boundary.md`, `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
      | gate_level | full-audit |
      | false_positive_risk | テンプレートプレースホルダー、検査対象宣言、索引参照を exemption で抑制する |
      | regression_test | 具体ID、具体パス、固定URL、各 exemption、generic/template 許容、個別承認例外の正常・異常 fixture を検証する |
      | finding_route | intake |
      | triage_action | generic 表記へ是正し、traceability を extension で補完する |

      ## 検知対象

      - 具体ID: `ADR-NNNN`、`REQ-NNNN`、`REQ-NNNN-NNN`
      - 具体パス: `docs/decisions/`、`docs/requirements/`、`docs/specs/`配下の具体ファイル
      - 固定URL: 特定owner/repositoryを含むGitHub blob、raw URL

      ## exemption

      - `{NNNN}`、`<NNNN>`、`<existing-spec>`、`<domain>`、`<command>`、`<spec>`、`<rule>`等のテンプレートプレースホルダー
      - 検査対象を説明するためのパターン定義と検査対象path宣言
      - 索引として許可されたREADME参照
      - producer 内部へ解決しない generic または template 参照（REQ-029-004）

      個別承認例外は特定の検出事項に付与する承認であり、ルールレベルの許容とは区別する。個別承認例外はルール一般を書き換えず、最終状態で件数0を受け入れ条件とする。

      ## IR-056との関係

      IR-056はProject Extensions構造と配置を検査し、IR-059は配布テキスト成果物の具体参照を検査する。両者は独立した検出対象である。DEC-006が確立したinspect 3-command正規化とIR-056のProject Extensions検査分離を維持しつつ、DEC-014がIR-059の affected_artifact 範囲と source/save/complete/release の各 enforcement 経路を変更する後続決定である。DEC-006全体を置換せず、IR-059をIR-056へ統合しない。

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    target_area: "ルールインデックス"
    source_items: [AG-009]
    content: |
      docs/specs/integrity/integrity-rule-catalog.md を更新する。IR-059 エントリの
      related_req と related_spec を REQ-029 と docs/specs/integrity/distribution-boundary.md
      へ更新する。REQ-002-021、022、023、024、025、026、032 の旧参照は MOVE 先
      （REQ-029）へ差し替える。REQ-002-028、029、035 の旧参照は RETIRE 扱いとして
      除去する。実在しない参照先は捏造せず、catalog の実構造を使う。

  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: rule-ownership
    target_area: "IR 別関連マッピング（自動生成）"
    source_items: [AG-009]
    content: |
      docs/specs/integrity/rule-ownership.md を更新する。IR-059 行の canonical
      参照を REQ-029 と docs/specs/integrity/distribution-boundary.md へ更新する。
      REQ-002-021、022、023、024、025、026、032 の旧参照は MOVE 先（REQ-029）へ
      差し替える。REQ-002-028、029、035 の旧参照は RETIRE 扱いとして除去する。
      実在しない参照先は捏造せず、実構造を使う。

  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: req-impact-map
    target_area: "要件行影響（Requirement-Line Impact）"
    source_items: [AG-009]
    content: |
      docs/specs/responsibilities/req-impact-map.md を更新する。REQ-002-021、022、
      023、024、025、026、032 の影響エントリは REQ-029-001〜008（MOVE 先）へ差し
      替える。REQ-002-027 は更新後の意味へ差し替える。REQ-002-028、029、035 は
      RETIRE 扱いへ明示し、Retired cross-references 節へ移行先（既存品質契約と
      Epic 完了条件）を追記する。REQ-007 行は新設しない。実在しない参照先は捏造
      せず、実構造を使う。

  - id: ACT-SPEC-010
    artifact: spec
    operation: append
    target_spec:
      operation: update
      domain: integrity
      slug: docs-spec-rebuild-integrity
    source_items: [AG-009]
    content: |
      ## REQ-002-028/029/035 RETIRE 後の正規根拠

      REQ-002-028 と REQ-002-029 が保有していた構文健全性検査と責務整合検査（移行・作業由来品質検査行）の正規根拠は、本 SPEC（docs-spec-rebuild-integrity.md）と `responsibilities/document-type-responsibilities.md`、`quality/req-health-metrics.md` の既存品質契約へ集約する。REQ-007 行は新設しない。

      REQ-002-035 が保有していた case-auto.md 段階解消（移行・作業由来品質検査行）の正規根拠は、Epic 完了条件と IR-059 検出へ集約する。

      配布依存境界の意味モデルの正規所有者は `integrity/distribution-boundary.md` である。本 SPEC は意味モデルを再定義せず、同 SPEC を参照する。

  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-skill-authoring
    target_area: "skill authoring 段階的開示基準"
    source_items: [AG-009]
    content: |
      docs/specs/skills/agentdev-skill-authoring.md を更新する。執筆時 prevention
      原則として、producer 内部参照・docs 内部パス・具体 ID の混入を未然に防ぐ
      ガイドを追記する。REQ 行は新設せず、REQ-029 と docs/specs/integrity/distribution-boundary.md
      を参照させる。検出契約と最終 gate は REQ-010-060 を参照させる。

  - id: ACT-SPEC-012
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-command-authoring
    target_area: "command authoring 基準"
    source_items: [AG-009]
    content: |
      docs/specs/skills/agentdev-command-authoring.md を更新する。執筆時 prevention
      原則として、producer 内部参照・docs 内部パス・具体 ID の混入を未然に防ぐ
      ガイドを追記する。REQ 行は新設せず、REQ-029 と docs/specs/integrity/distribution-boundary.md
      を参照させる。検出契約と最終 gate は REQ-010-060 を参照させる。

  - id: ACT-SPEC-013
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    target_area: "docs/** 変更時の targeted docs guard（REQ-006-035）"
    source_items: [AG-009]
    content: |
      docs/specs/commands/case-run.md を更新する。docs/** 変更時の targeted docs
      guard 節と changed-path routing を共有境界 adapter へ接続する。最終 gate 基底
      は REQ-010-012 を再利用し、検査エラー時は gate-not-passed として扱う
      （DEC-014 決定5）。配布依存境界の検出契約は
      docs/specs/integrity/distribution-boundary.md を参照させる。

  - id: ACT-SPEC-014
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    target_area: "targeted docs guard (v2:REQ-0158-003)"
    source_items: [AG-009]
    content: |
      docs/specs/commands/case-close.md を更新する。targeted docs guard 節と
      changed-path routing を共有境界 adapter へ接続する。最終 gate 基底は
      REQ-010-012 を再利用し、検査エラー時は gate-not-passed として扱う
      （DEC-014 決定5）。配布依存境界の検出契約は
      docs/specs/integrity/distribution-boundary.md を参照させる。

  - id: ACT-SPEC-015
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: "文書種別責務、配置基準"
    source_items: [AG-009]
    content: |
      docs/specs/responsibilities/document-type-responsibilities.md の冒頭に残る
      REQ-002-032 の詳細参照先宣言を、MOVE 先である REQ-029-003 と REQ-029-004
      へ差し替える。文書種別責務と配置基準の内容自体は変更しない。

  - id: ACT-SPEC-016
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: "コマンドフロントマター契約"
    source_items: [AG-009]
    content: |
      docs/specs/responsibilities/artifact-contracts.md のコマンドフロントマター契約に
      残る REQ-002-021..029 の範囲参照を除去する。配布物の種別責務は更新後の
      REQ-002、自己完結性と内部参照境界は REQ-029-003〜006 へ参照を分ける。

  - id: ACT-SPEC-017
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: design-principles
    target_area: "6. 実行時、執筆関心分離（Runtime / Authoring）"
    source_items: [AG-009]
    content: |
      docs/specs/foundations/design-principles.md の REQ-002-022 参照を、MOVE 先である
      REQ-029-007 へ差し替える。DEC-001 の harness 分離原則への参照は維持する。

  - id: ACT-SPEC-018
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: patterns
    target_area: "コマンド frontmatter 規約"
    source_items: [AG-009]
    content: |
      docs/specs/foundations/patterns.md の REQ-002-022 参照を、MOVE 先である
      REQ-029-007 へ差し替える。command frontmatter の harness 分離根拠を
      REQ-029-007 と DEC-001 へ同期する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      従来の境界表現は、REQ-002-025/026/032 と IR-059 が「具体 ID・具体パス・固定
      URL」という文字列・パス境界を検出対象としていた。他方、producer 内部依存と
      consumer 解決可能依存の区別という意味境界は、構文的検出では一部しか捕捉
      できない。両者の表現が混在していた。
    resolution: |
      文字列・パス境界から意味依存境界へ寄せる。REQ-029-003 を観察可能な意味境界
      不変条件として定式化し、検出器の HOW を REQ 本文から除外する。構文検出は
      意味境界の一部を代理検出する手段とし、意味モデルの正規所有は新 SPEC が持つ。

  - id: CR-002
    conflict: |
      REQ-002-027 が「導入先プロジェクトで解決可能な .opencode/ 相対パスまたは
      シンボリックパスのみを使用」としていた。他方、generic/template 参照の許容
      （REQ-029-004）は、具体的な解決対象でない参照を許容する。両者は「許容対象」
      の表現で衝突しうる。
    resolution: |
      REQ-002-027 を「配布成果物が実行時依存として使用するパスは、導入先環境で
      解決可能であること」へ更新する。実行時依存（resolved reference）だけを対象
      とすることで、generic/template 参照（REQ-029-004 許容）との衝突を除去する。

  - id: CR-003
    conflict: |
      REQ-029-003 の意味境界不変条件は、検出器実装を規定すると SPEC と Epic の
      境界を曖昧にする。他方、意味境界を宣言しないと観察可能な契約が失われる。
    resolution: |
      REQ/SPEC 境界を分割する。REQ-029-003 は観察可能な意味境界不変条件として
      宣言し、検出器の HOW を含めない。検出モデル、分類値、判定パイプラインは
      docs/specs/integrity/distribution-boundary.md が所有する。実装は Epic が
      所有する。

  - id: CR-004
    conflict: |
      REQ-009-009 はコピーベースと npm/package 化を対象外としていた。他方、
      release archive projection は具体的な配布物として存在し、copy 型インストール
      の延長として誤解されうる。
    resolution: |
      link インストールと release archive projection を区別する。REQ-009-009 は
      通常の consumer link インストールを推奨とし、release archive projection を
      別途正規所有する（REQ-009-045）。任意の手動 copy と npm/package は対象外を
      維持し、release archive を通常 copy 型インストールの延長として説明しない。

  - id: CR-005
    conflict: |
      DEC-006 は inspect 3-command 正規化と IR-056 の Project Extensions 検査分離
      を確立した。配布依存境界の多層 enforcement と IR-059 範囲変更を別の後続決定
      で扱うべきか、それとも一本化すべきかが問われた。
    resolution: |
      DEC-014 を、DEC-006 の inspect 3-command 正規化と IR-056 の Project Extensions
      検査分離を維持しつつ、IR-059 の affected_artifact 範囲と source/save/complete/
      release の各 enforcement 経路を変更する後続決定そのものとして一本化する。
      DEC-006 全体を置換せず、IR-059 を IR-056 へ統合しない。IR-059 の範囲と経路の
      変更を別の後続決定へ委ねず、本 Decision で確定する。

  - id: CR-006
    conflict: |
      REQ-002-028/029/035 を RETIRE する場合、それらが担っていた一回限りの構文・
      意味・責務整合検査の行き場が必要である。REQ-007 へ新規行を作る案と、既存
      品質契約へ集約する案が対立した。
    resolution: |
      REQ-007 行は新設しない。028/029/035 の検査は docs-spec-rebuild-integrity.md、
      req-health-metrics.md、document-type-responsibilities.md の既存品質契約と
      Epic 完了条件で担保する。番号は欠番として維持する。

  - id: CR-007
    conflict: |
      IR-059 のルールレベル許容（generic と template）と、個別承認例外
      （individual accepted exception）は、どちらも「検出事項を clean 扱いする」
      点で混同されやすい。両者を区別しないと、ルールが個別例外で侵食される。
    resolution: |
      両者を明示的に区別する。ルールレベル許容は generic/template のような
      構文的に定まる許容集合であり、ルール一般を書き換えない検出器の挙動である。
      個別承認例外は特定の検出事項へ個別に付与される承認であり、ルール一般を
      書き換えない。両者は別物として運用し、最終状態で個別承認例外エントリ=0 を
      受け入れ条件に含める。

operation_units:
  - ou_id: OU-001
    target_req: REQ-029
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-029.md
      action_mapping:
        ACT-REQ-001: docs/requirements/REQ-029.md
      allocated_req_id: REQ-029
      rows: [REQ-029-001, REQ-029-002, REQ-029-003, REQ-029-004, REQ-029-005, REQ-029-006, REQ-029-007, REQ-029-008]

  - ou_id: OU-002
    target_req: REQ-002
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-002.md
      action_mapping:
        ACT-REQ-002: docs/requirements/REQ-002.md
      moved_to_req029: [REQ-002-021, REQ-002-022, REQ-002-023, REQ-002-024, REQ-002-025, REQ-002-026, REQ-002-032]
      retired: [REQ-002-028, REQ-002-029, REQ-002-035]
      updated: [REQ-002-027]
      surviving_rows: [001..020, 027, 030, 031, 033, 034]

  - ou_id: OU-003
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-010.md
      action_mapping:
        ACT-REQ-003: docs/requirements/REQ-010.md
      appended_rows: [REQ-010-060]
      preserved_gaps: [053..057]

  - ou_id: OU-004
    target_req: REQ-009
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    non_overlap_boundary: "REQ-009-009 UPDATE と REQ-009-045 APPEND を同一 OU 内で実施。他 REQ 操作とは重複しない。"
    result:
      saved_docs:
        - docs/requirements/REQ-009.md
      action_mapping:
        ACT-REQ-004: docs/requirements/REQ-009.md
        ACT-REQ-005: docs/requirements/REQ-009.md
      updated_rows: [REQ-009-009]
      appended_rows: [REQ-009-045]

  - ou_id: OU-005
    operation: create
    target_artifact: docs/decisions/DEC-014.md
    target_decision: DEC-014
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result:
      saved_docs:
        - docs/decisions/DEC-014.md
      action_mapping:
        ACT-DEC-001: docs/decisions/DEC-014.md
      allocated_decision_id: DEC-014
      initial_status: proposed

  - ou_id: OU-006
    target_spec:
      operation: create
      domain: integrity
      slug: distribution-boundary
    target_artifact: docs/specs/integrity/distribution-boundary.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001, OU-005]
    recommended_order: 3
    issue_policy: single
    result:
      saved_docs:
        - docs/specs/integrity/distribution-boundary.md
      action_mapping:
        ACT-SPEC-001: docs/specs/integrity/distribution-boundary.md
      initial_status: draft
      spec_logical_division: 規範
      canonical_owner_declared: true

  - ou_id: OU-007
    target_spec:
      - docs/specs/foundations/project-extensions.md
      - docs/specs/foundations/harness-separation-model.md
      - docs/specs/local/runtime-package-boundary.md
      - docs/specs/integrity/integrity-contracts.md
      - docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md
      - docs/specs/integrity/integrity-rule-catalog.md
      - docs/specs/integrity/rule-ownership.md
      - docs/specs/responsibilities/req-impact-map.md
      - docs/specs/integrity/docs-spec-rebuild-integrity.md
      - docs/specs/skills/agentdev-skill-authoring.md
      - docs/specs/skills/agentdev-command-authoring.md
      - docs/specs/commands/case-run.md
      - docs/specs/commands/case-close.md
      - docs/specs/responsibilities/document-type-responsibilities.md
      - docs/specs/responsibilities/artifact-contracts.md
      - docs/specs/foundations/design-principles.md
      - docs/specs/foundations/patterns.md
    operation: spec-update
    scale: large
    depends_on: [OU-006]
    recommended_order: 4
    issue_policy: single
    non_overlap_boundary: "全 UPDATE 対象は OU-006 で作成した新 SPEC を参照する。既存節を実ファイルから解決して UPDATE する。"
    result:
      saved_docs:
        - docs/specs/foundations/project-extensions.md
        - docs/specs/foundations/harness-separation-model.md
        - docs/specs/local/runtime-package-boundary.md
        - docs/specs/integrity/integrity-contracts.md
        - docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md
        - docs/specs/integrity/integrity-rule-catalog.md
        - docs/specs/integrity/rule-ownership.md
        - docs/specs/responsibilities/req-impact-map.md
        - docs/specs/integrity/docs-spec-rebuild-integrity.md
        - docs/specs/skills/agentdev-skill-authoring.md
        - docs/specs/skills/agentdev-command-authoring.md
        - docs/specs/commands/case-run.md
        - docs/specs/commands/case-close.md
        - docs/specs/responsibilities/document-type-responsibilities.md
        - docs/specs/responsibilities/artifact-contracts.md
        - docs/specs/foundations/design-principles.md
        - docs/specs/foundations/patterns.md
      action_mapping:
        ACT-SPEC-002: docs/specs/foundations/project-extensions.md
        ACT-SPEC-003: docs/specs/foundations/harness-separation-model.md
        ACT-SPEC-004: docs/specs/local/runtime-package-boundary.md
        ACT-SPEC-005: docs/specs/integrity/integrity-contracts.md
        ACT-SPEC-006: docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md
        ACT-SPEC-007: docs/specs/integrity/integrity-rule-catalog.md
        ACT-SPEC-008: docs/specs/integrity/rule-ownership.md
        ACT-SPEC-009: docs/specs/responsibilities/req-impact-map.md
        ACT-SPEC-010: docs/specs/integrity/docs-spec-rebuild-integrity.md
        ACT-SPEC-011: docs/specs/skills/agentdev-skill-authoring.md
        ACT-SPEC-012: docs/specs/skills/agentdev-command-authoring.md
        ACT-SPEC-013: docs/specs/commands/case-run.md
        ACT-SPEC-014: docs/specs/commands/case-close.md
        ACT-SPEC-015: docs/specs/responsibilities/document-type-responsibilities.md
        ACT-SPEC-016: docs/specs/responsibilities/artifact-contracts.md
        ACT-SPEC-017: docs/specs/foundations/design-principles.md
        ACT-SPEC-018: docs/specs/foundations/patterns.md
      target_area_resolution:
        single_match: 16
      ir059_related_req_updated: REQ-002 -> REQ-029
      ir059_related_spec_updated: added distribution-boundary.md
      index_readme_updated: docs/specs/README.md

  - ou_id: OU-008
    operation: implementation
    scale: large
    depends_on: [OU-002, OU-003, OU-004, OU-005, OU-006, OU-007]
    recommended_order: 5
    issue_policy: epic
    target_artifacts:
      - 共有 detector（副作用なし、repo-agentdev-integrity 配下）
      - thin な repo-local pre-write plugin（サポート対象の編集/書き込み/apply_patch フック、公式 API 検証後に接続点確定）
      - .opencode/plugins/** の最小 git tracking
      - case-run と case-close の最終経路を共有 adapter へ接続
      - package release 検査（実際の archive テキスト成果物へ適用）
      - fresh consumer での link projection 検査と archive-installed projection 検査の分離
    non_overlap_boundary: "実装詳細のみ。REQ/Decision/SPEC の正規本文は OU-001..007 が所有。check-consumer-opencode.ps1 への責務追加は行わない。"
    result: {}

  - ou_id: OU-009
    operation: verify-only
    scale: large
    depends_on: [OU-008]
    recommended_order: 6
    issue_policy: epic
    target: "TS-001..TS-012 を含む全 Acceptance を実成果物で再検証"
    result: {}

test_strategy:
  - id: TS-001
    target_item: [AG-001, AG-002, AG-004]
    verification: |
      REQ-029、REQ-002、REQ-010、REQ-009 の各 REQ ファイルを実ファイルで確認する。
      REQ-029 は REQ-029-001..008 の 8 行であることを検証する。
      REQ-002 は 021、022、023、024、025、026、028、029、032、035 が除去または
      欠番扱いであり、生存行が 001..020、027、030、031、033、034 であることを
      検証する。REQ-010 は REQ-010-060 が 1 行だけ追加され、053..057 の欠番が
      維持されていることを検証する。REQ-009 は REQ-009-009 が更新され、
      REQ-009-045 が 1 行だけ追加されていることを検証する。REQ-007 への新規行
      追加がないことを検証する。REQ-002 へ交叉参照行として 021..026、032 が
      残置されていないことを検証する。
    pass_criteria: |
      REQ-029=8 行、REQ-010 追加=1 行（REQ-010-060）、REQ-009 追加=1 行
      （REQ-009-045）、REQ-007 新規アクション=0 件。REQ-002 生存行=
      001..020、027、030、031、033、034。021..026、032 は MOVE により除去、
      028/029/035 は欠番。交叉参照行は不存在。
    on_failure: |
      fix-and-reverify。行数、欠番、または MOVE 扱いに不備がある場合は req-save を
      再実行して修正後に再検証する。REQ-002 へ交叉参照行が誤って残置されていた
      場合は当該行を除去して再検証する。REQ-007 行が誤って作成されていた場合は
      当該行を取り下げて再検証する。

  - id: TS-002
    target_item: AG-001
    verification: |
      正規の意味境界 detector の positive/negative fixture を検証する。fixture は
      既知の名称・ID 形式の列挙に閉じず、変更された名称や ID 形式でも検出できる
      ことを含む。producer 内部参照を含む配布テキスト成果物は検出し、consumer
      解決可能参照と generic/template 参照は検出しないことを確認する。
    pass_criteria: |
      全 positive fixture が検出され、全 negative fixture が検出対象外である。
      検出が既知の列挙へ閉じないことが、変更された名称や ID 形式の fixture で
      確認されている。
    on_failure: |
      fix-and-reverify。検出漏れまたは誤検出は detector 実装を修正して再検証する。

  - id: TS-003
    target_item: [AG-001, AG-008]
    verification: |
      IR-059 と docs/specs/integrity/distribution-boundary.md におけるルール
      レベルの generic/template 許容と、個別承認例外（individual accepted
      exception）の取扱いを検証する。両者が別物として運用されていることを確認
      する。個別承認例外エントリの最終状態件数を検証する。
    pass_criteria: |
      ルールレベル許容と個別承認例外が明示的に区別されている。最終状態で
      個別承認例外エントリ=0 である。ルールレベルの generic/template 許容は
      正当な clean fixture として残置されている。
    on_failure: |
      fix-and-reverify。混同または不正承認例外は実装と SPEC を修正して再検証する。

  - id: TS-004
    target_item: AG-001
    verification: |
      source 配布テキスト成果物（src/opencode/{commands,skills}/**、template、
      script ソース）に対して配布依存境界検査を実施する。Markdown に限定せず
      テキスト成果物全般へ適用されることを確認する。
    pass_criteria: |
      source 配布テキスト成果物の全対象が検査され、producer 内部依存=0 件である。
      Markdown 以外のテキスト成果物も検査対象であることが確認されている。
    on_failure: |
      fix-and-reverify。検査対象漏れまたは違反は実装修復後に再検証する。

  - id: TS-005
    target_item: [AG-005, AG-007, AG-010]
    verification: |
      サポート対象の執筆/編集ツール（write、edit、apply_patch 相当）について、
      事前書き込み gate が fail-fast adapter として振る舞うことを検証する。
      adapter をバイパスした状態で違反を含む変更を加えた場合、最終 gate
      （REQ-010-012 を基底とする保存/完了/release 経路）で停止することを検証する。
    pass_criteria: |
      事前 gate が違反を書き込み前に阻止する。adapter バイパス時は最終 gate で
      必ず停止する。両経路とも検査エラーを gate-not-passed として扱う。
    on_failure: |
      fix-and-reverify。adapter または最終 gate の不備は実装修復後に再検証する。
      公式 API の検証で合意した pre-write 契約の実現が不可能と判明した場合は、
      より弱い設計へ勝手に置き換えず、既存 workflow の blocker として報告し、
      user/architecture decision へ差し戻す。final-gate-only への静かな縮退を許さない。

  - id: TS-006
    target_item: [AG-005, AG-009]
    verification: |
      case-run と case-close の changed-path routing が同じ違反 fixture に対し
      共有境界 adapter へ接続し、最終 gate で停止することを検証する。REQ-010-012
      が最終 gate 基底として再利用されていることを確認する。
    pass_criteria: |
      両ワークフローで同一の違反 fixture が検出され、最終 gate で停止する。
      REQ-010-012 の最終 gate 基底としての役割が維持されている。
    on_failure: |
      fix-and-reverify。routing または gate 基底の不備は実装修復後に再検証する。

  - id: TS-007
    target_item: [AG-006, AG-010]
    verification: |
      fresh consumer 環境へ link projection を展開し、配布依存境界検査を実施する。
      link 先が producer 内部へ解決しないことを確認する。
    pass_criteria: |
      fresh consumer の link projection で producer 内部依存=0 件である。
      runtime 依存が fresh 環境で解決可能である。
    on_failure: |
      fix-and-reverify。link 構成または配布成果物の不備は実装修復後に再検証する。

  - id: TS-008
    target_item: [AG-006, AG-007, AG-010]
    verification: |
      release archive を生成し、archive 内のテキスト成果物エントリに対して配布
      依存境界検査を実施する。次に archive を install した archive-installed
      projection に対して同一検査を実施する。
    pass_criteria: |
      archive と archive-installed の両 projection で producer 内部依存=0 件
      である。両 projection の検査が分離されている。
    on_failure: |
      fix-and-reverify。archive 構成または install 手順の不備は実装修復後に
      再検証する。

  - id: TS-009
    target_item: [AG-005, AG-007]
    verification: |
      検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗の各ケースについて
      gate が gate-not-passed として扱うことを検証する。いずれのケースも clean
      扱いにならないことを確認する。
    pass_criteria: |
      全検査エラーケースが gate-not-passed として扱われ、clean 扱い=0 件である。
    on_failure: |
      fix-and-reverify。エラー扱いの不備は detector または gate 実装を修正して
      再検証する。

  - id: TS-010
    target_item: [AG-005, AG-006, AG-007]
    verification: |
      release archive を公開前検査し、違反残存時に最終 archive と成功経路が
      残らないことを検証する。公開前検査を経て合格した場合のみ最終 archive が
      生成されることを確認する。
    pass_criteria: |
      違反残存時は最終 archive が生成されず、成功経路が報告されない。合格時のみ
      最終 archive が生成される。
    on_failure: |
      fix-and-reverify。公開前検査または archive 生成手順の不備は実装修復後に
      再検証する。

  - id: TS-011
    target_item: [AG-001, AG-008, AG-010]
    verification: |
      最終状態で violations=0、IR-059 ベースラインエントリ=0、個別承認例外
      エントリ=0 を検証する。ルールレベルの generic/template 許容は正当な
      clean fixture として残置されていることを確認する。
    pass_criteria: |
      violations=0、IR-059 ベースラインエントリ=0、個別承認例外エントリ=0。
      ルールレベル generic/template 許容の clean fixture は残置されている。
    on_failure: |
      fix-and-reverify。残存違反は実装修復後に再検証する。ベースライン陳腐化に
      起因する場合は根因特定のうえ baseline 更新を正当化して再検証する。

  - id: TS-012
    target_item: [AG-002, AG-009, AG-010]
    verification: |
      既存違反を修復した後に、構文健全性、意味意図、参照残骸、command/skill/SPEC
      責務整合が健全であることを検証する。これらを Epic 完了証拠とし、新規 REQ
      行が作成されていないことを確認する。MOVE または RETIRE した REQ-002-021〜026、
      028、029、032、035 を現行根拠として参照する stale reference が0件であることを
      全 docs/specs/** で確認する。
    pass_criteria: |
      構文、意味意図、参照残骸、責務整合の全観点で健全である。新規 REQ 行は
      作成されていない（REQ-007 行を含まない）。Epic 完了証拠として記録されて
      いる。MOVE または RETIRE 済み REQ-002 行への現行根拠参照が0件である。
    on_failure: |
      fix-and-reverify。不備は実装修復後に再検証する。新規 REQ 行が誤って
      作成されていた場合は取り下げて再検証する。

review_dispositions:
  - id: RD-001
    source_item: RU-1
    disposition: covered
    reason_code: accepted_into_new_req_and_new_spec
    reason: |
      RU-1 Distribution Boundary definition は REQ-029-001 へ受け入れた。意味モデル
      は新 SPEC docs/specs/integrity/distribution-boundary.md へ受け入れた。
      追加の Issue 作成は行わない。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-001 (REQ-029-001), ACT-SPEC-001
      checked_at_commit: null
    related_removed_items: []

  - id: RD-002
    source_item: RU-2
    disposition: covered
    reason_code: accepted_into_new_req_and_new_spec
    reason: |
      RU-2 Reference Boundary、no concrete internal refs、no fixed-enumeration-only
      boundary は REQ-029-003 へ受け入れた。意味境界の検出モデルは新 SPEC へ受け
      入れた。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-001 (REQ-029-003), ACT-SPEC-001
      checked_at_commit: null
    related_removed_items: []

  - id: RD-003
    source_item: RU-3
    disposition: covered
    reason_code: accepted_into_new_req
    reason: |
      RU-3 Runtime Self-Containment は REQ-029-005 と REQ-029-006 へ受け入れた。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-001 (REQ-029-005, REQ-029-006)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-004
    source_item: RU-4
    disposition: covered
    reason_code: split_between_decision_spec_and_epic
    reason: |
      RU-4 Canonical Detector は DEC-014（多層 enforcement の長寿命決定）と新 SPEC
      （検出モデルと安定実装契約）と Epic 実装（関数署名、実装コード）へ受け入れた。
      REQ と Decision の本文へ実装詳細を持ち込まない。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-DEC-001, ACT-SPEC-001, AG-010
      checked_at_commit: null
    related_removed_items: []

  - id: RD-005
    source_item: RU-5
    disposition: covered
    reason_code: accepted_into_new_req_and_existing_spec
    reason: |
      RU-5 Distribution Target canonical set、all text は REQ-029-002 へ受け入れた。
      runtime-package-boundary.md と新 SPEC が配布対象集合とテキスト成果物対象を
      正規所有する。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-001 (REQ-029-002), ACT-SPEC-001, ACT-SPEC-004
      checked_at_commit: null
    related_removed_items: []

  - id: RD-006
    source_item: RU-6
    disposition: covered
    reason_code: accepted_into_new_req_and_rule
    reason: |
      RU-6 Generic/Template allowance は REQ-029-004 へ受け入れた。ルールレベル
      許容として新 SPEC と IR-059 が個別承認例外と明示的に区別する（CR-007）。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-001 (REQ-029-004), ACT-SPEC-001, ACT-SPEC-006, CR-007
      checked_at_commit: null
    related_removed_items: []

  - id: RD-007
    source_item: RU-7
    disposition: covered
    reason_code: accepted_into_epic_ac_only
    reason: |
      RU-7 existing violation resolution zero は Epic 完了条件と test strategy へ
      受け入れた。REQ 行は新設しない。最終状態で violations=0、IR-059 ベースライン
      エントリ=0、個別承認例外エントリ=0 を受け入れ条件とする。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: AG-010, TS-011, case_open_hints.acceptance_overrides
      checked_at_commit: null
    related_removed_items: []

  - id: RD-008
    source_item: RU-8
    disposition: covered
    reason_code: accepted_into_existing_spec
    reason: |
      RU-8 Authoring Prevention は既存の agentdev-skill-authoring.md と
      agentdev-command-authoring.md の両 SPEC 更新へ受け入れた。REQ-010 行は新設
      しない。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-SPEC-011, ACT-SPEC-012
      checked_at_commit: null
    related_removed_items: []

  - id: RD-009
    source_item: RU-9
    disposition: covered
    reason_code: split_between_req_decision_spec_and_epic
    reason: |
      RU-9 OpenCode Pre-write Enforcement は REQ-010-060（最終保証 gate の安定
      契約）と DEC-014（多層 enforcement の長寿命決定）と新 SPEC（安定実装契約）
      と Epic plugin 実装へ受け入れた。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-003 (REQ-010-060), ACT-DEC-001, ACT-SPEC-001, AG-010
      checked_at_commit: null
    related_removed_items: []

  - id: RD-010
    source_item: RU-10
    disposition: covered
    reason_code: accepted_into_decision_and_spec
    reason: |
      RU-10 Plugin fail-fast not final guarantee は DEC-014（plugin は fail-fast
      adapter、ADF 所有 gate が最終保証）と新 SPEC（事前 gate と最終 gate の契約）
      へ受け入れた。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-DEC-001 (決定3, 決定4), ACT-SPEC-001
      checked_at_commit: null
    related_removed_items: []

  - id: RD-011
    source_item: RU-11
    disposition: covered
    reason_code: accepted_into_existing_req_and_spec
    reason: |
      RU-11 Workflow/Repository Enforcement は既存 REQ-010-012 と REQ-010-060、
      case-run.md、case-close.md、integrity-contracts.md の各 SPEC 更新へ受け入れ
      た。最終 gate 基底として REQ-010-012 を再利用する。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-003 (REQ-010-060), ACT-SPEC-005, ACT-SPEC-013, ACT-SPEC-014
      checked_at_commit: null
    related_removed_items: []

  - id: RD-012
    source_item: RU-12
    disposition: covered
    reason_code: accepted_into_req_and_spec
    reason: |
      RU-12 Installed/Release Verification は REQ-009-045（追加行）と REQ-009-009
      （更新）と runtime-package-boundary.md、integrity-contracts.md、新 SPEC の
      各更新へ受け入れた。link インストールと release archive projection を区別
      した。
    evidence:
      path: .agentdev/drafts/req-draft-distribution-boundary-enforcement.md
      section: ACT-REQ-004, ACT-REQ-005, ACT-SPEC-001, ACT-SPEC-004, ACT-SPEC-005
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  epic_scale: large
  decomposition: |
    scale large のため Wave 構成で Epic 配下に複数 Issue を展開する。Normative
    save 相当（OU-001..007）は req-save と spec-save へ委ね、Epic 本体は OU-008
    の実装と OU-009 の検証を管理する。子 worktree が共有正規文書（REQ-029、
    REQ-002、REQ-010、REQ-009、DEC-014、docs/specs/integrity/distribution-boundary.md、
    UPDATE 対象の既存 SPEC 群）を独自更新して競合させない。
  execution_contract:
    propagation: |
      case-open は生成する Issue の execution contract へ、配布境界検査を最終
      gate の一部として含める。case-run と case-close は共有境界 adapter を経由
      して REQ-010-012 を最終 gate 基底として再利用する。検査エラーは
      gate-not-passed として扱い、clean 扱いにしない。
  implementation_assumptions:
    shared_detector_location: "共有 module パスは SPEC 候補が正規所有する（.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts）。Epic はこれに従い実装する"
    pre_write_plugin: "plugin パス（.opencode/plugins/distribution-boundary-guard.ts）と tool.execute.before フック（edit/write/apply_patch）は SPEC 候補が正規所有する。Epic は公式 API が当該契約を満たすことを検証したうえで実装する"
    plugins_git_tracking: ".opencode/plugins/** は最小限の git tracking とする"
    case_routing: "case-run と case-close の最終経路は共有境界 adapter へ接続する"
    package_release: "scripts/package-release-archive.ps1 が最終公開前に一時 archive を検証する（SPEC 候補が正規所有）"
    projection_separation: "fresh consumer での link projection 検査と archive-installed projection 検査を分離する（archive-installed 検証は一時的な consumer/archive-install パスを使用）"
    check_consumer_script: "check-consumer-opencode.ps1 への責務追加は行わない"
    authoring_prevention: "agentdev-skill-authoring.md と agentdev-command-authoring.md の両 SPEC 経由で執筆時 prevention を案内する（REQ 行は新設しない）"
  acceptance_overrides:
    distribution_boundary: |
      最終状態で violations=0、IR-059 ベースラインエントリ=0、個別承認例外
      エントリ=0 を満たす。ルールレベルの generic/template 許容は正当な clean
      fixture として残置する。これらを Epic 完了条件へ含め、新規 REQ 行は作成
      しない。
  completion_gating:
    final_acceptance_report: required
    distribution_boundary_gate_pass: required
  wave_hints:
    - wave: Wave 1
      corresponds_to: [OU-001, OU-002, OU-003, OU-004, OU-005]
      description: normative REQ/Decision save（REQ-029 create、REQ-002 update、REQ-010 append、REQ-009 update+append、DEC-014 create）
      worktree_policy: shared_normative_docs
    - wave: Wave 2
      corresponds_to: [OU-006]
      description: 新 SPEC create（docs/specs/integrity/distribution-boundary.md）
      worktree_policy: shared_normative_docs
    - wave: Wave 3
      corresponds_to: [OU-007]
      description: 既存 SPEC 17 件の UPDATE（project-extensions、harness-separation-model、runtime-package-boundary、integrity-contracts、IR-059、integrity-rule-catalog、rule-ownership、req-impact-map、docs-spec-rebuild-integrity、両 authoring、case-run、case-close、document-type-responsibilities、artifact-contracts、design-principles、patterns）
      worktree_policy: parallel_worktrees_no_shared_file_edits
    - wave: Wave 4
      corresponds_to: [OU-008]
      description: Epic 実装（共有 detector、pre-write plugin、.gitignore、case routing、package release 検査、projection 分離）
      parallelizable: true
      worktree_policy: parallel_worktrees_no_shared_file_edits
    - wave: Wave 5
      corresponds_to: [OU-009]
      description: 最終検証（TS-001..TS-012 を含む全 Acceptance を実成果物で再検証）
      worktree_policy: integration_side_serial
  split_forecast:
    signal_total: 2
    classification: split_consideration
    handling: |
      req-health ルールに基づく SPLIT シグナル集計: 8 新規 REQ 行=+0、関心分類
      2 以上=+1、成果物種別 3（REQ+Decision+SPEC）=+1、補正後 SPEC 分離違反=+0、
      合計=2。分類は split_consideration とする。選択する handling は、合意された
      REQ-002 分割（021..026、032 を REQ-029 へ MOVE、028/029/035 を RETIRE）と
      Epic/Wave 実装分解（OU-008..009）である。REQ-029 のさらなる分割は行わない。
```

# summary

本 draft は配布成果物と producer 内部成果物の間の意味依存境界を REQ-029 として新設し、
従来 REQ-002-021..026、032 に分散していた自己完結性・harness 非依存・producer 内部
参照禁止を REQ-029 の 8 行へ MOVE して REQ-002 から行ごと除去する合意構造を符号化
する。REQ-002 は種別責務、原本と配置先、名前空間、Project Extensions 機構、subagent
委譲の本来責務へ縮約し、移行・作業由来品質検査の 028/029/035 は既存品質契約と Epic
完了条件へ集約して RETIRE する（REQ-007 行は新設しない）。REQ-002 の生存行は
001..020、027、030、031、033、034 であり、交叉参照行は残さない。REQ-010-060 が
保存・完了・release 経路の最終保証を宣言し、REQ-009-009 と REQ-009-045 が link
インストールと具体化された release archive projection（別個の配布・検証 projection）
の区別と配布境界準拠を正規化する。DEC-014 は多層 enforcement、副作用なし共有
detector、fail-fast adapter、最終保証 gate、projection 分離、archive 公開前検査を
長寿命決定として記録し、DEC-006 全体を置換せず IR-059 を IR-056 へ統合せずに、
IR-059 の affected_artifact 範囲と source/save/complete/release の各 enforcement
経路を本 Decision において変更する（別の後続決定へは委ねない）。新 SPEC
docs/specs/integrity/distribution-boundary.md が意味モデル、分類、検出パイプライン、
projection 契約、事前 gate と最終 gate、archive 公開前検査に加え、ユーザーが確定
した安定実装契約（共有 module パス、plugin パス、tool.execute.before フック種別、
archive 検査呼び出し点、archive-installed 検証配置）を一括正規所有する。関数署名と
実装コードは Epic 実装詳細へ委ねる。最終状態で violations=0、IR-059 ベースライン
エントリ=0、個別承認例外エントリ=0 を満たし、ルールレベルの generic/template 許容は
正当な clean fixture として残置する。
