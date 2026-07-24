---
draft_type: req_draft
topic_slug: spec-create-update-process
status: saved
created_at: 2026-07-23T10:00:00+09:00
source_rus: [RU-0015, RU-0018, RU-0025]
agentdev_handoff: true
spec_actions_consumed: true
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# RU-0015/0018/0025 全て feature。C7 クラスタ（SPEC作成・更新プロセス）担当。
work_type: feature

# scale: feature のみ standard / large。3件統合、RU-0018 は新規 SPEC 作成のため standard。
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  SPEC 作成・更新プロセス（C7 クラスタ）の3件 RU を、現行契約との照合で再構成した。
  RU-0015 はガイド自動更新を不採用とし、docs/guides/*.md と vocabulary-registry.md の動的 REQ 件数・番号範囲を削除して docs/requirements/README.md への参照へ置換する（重複削除方式）。
  RU-0018 は新規 command-authoring-standards.md SPEC 作成を不採用とし、既存所有先（artifact-responsibilities.md、agentdev-project-extensions/SKILL.md、agentdev-command-authoring 群）で既に充足する boilerplate 許容指針を covered とする。command 公開契約全体の4行上限は根拠不足で rejected（reason_code: unsupported_generalization）。
  RU-0025 は宣言形式（document-model.md `### SPEC 宣言形式` 節 L456）と伝播フィールド schema（artifact-contracts.md `## 分類根拠伝播契約`）が現行契約で既に確立しているため大部分を covered とし、残る新規要素（宣言率指標、spec-save CREATE/UPDATE 宣言付与フロー）のみを実行対象とする。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  # ===== RU-0025: spec-save frontmatter 宣言付与フロー整備（feature）=====
  # RU-0025 の宣言形式（document-model.md `### SPEC 宣言形式` 節）と伝播フィールド schema
  # （artifact-contracts.md `## 分類根拠伝播契約`）は現行契約で既に確立している。
  # 残る新規要素（宣言率指標、spec-save 宣言付与フロー）のみを実行対象とする。
  - id: AG-008
    content: |
      spec-save command の CREATE 手順（src/opencode/commands/agentdev/spec-save.md）に、新規 SPEC 作成時の spec_logical_division / canonical_owner frontmatter 宣言付与を必須ステップとして追加する。foundations/document-model.md の主論理区分規定（L399-404）と SPEC 宣言形式節（L406-432）で規定済みの宣言形式を参照する。宣言付与は CREATE 時に必須とし、spec-save が対象 SPEC へ宣言なしで完了することを禁止する。
  - id: AG-010
    content: |
      spec-save command の UPDATE 手順でも、既存 SPEC への宣言付与を CREATE と同じく必須とする（RU-0025 レビュー指摘「CREATE/UPDATE 宣言要件の統一」への対応）。UPDATE 対象 SPEC が frontmatter または冒頭宣言節で spec_logical_division / canonical_owner を未宣言の場合、付与を必須とする。後方互換性は soft-contract（ADR-0124）運用で担保し、欠落時は unknown で警告を出し処理を継続する。不合格閾値は設けない（AG-011 警告モード）。これにより CREATE と UPDATE で宣言付与要件を一本化し、宣言率指標化（AG-011）の前提を CREATE/UPDATE 双方で整える。
  - id: AG-011
    content: |
      docs/specs/quality/spec-health-metrics.md の測定対象と計測方法表へ、「宣言率（spec_logical_division）」「宣言率（canonical_owner）」の指標を追加する。各指標は frontmatter または冒頭宣言節での宣言有無を grep / parse で機械的に算出可能とする（RU-0025 制約「指標の機械化」）。指標は警告モードで運用し、不合格閾値は設けない（RU-0025 制約「強制度」）。横断的再評価（QG-3/QG-4）で宣言ベースの判定が機能するよう、段階的な宣言率向上を追跡可能にする。
  - id: AG-012
    content: |
      後方互換性を維持する。既存 SPEC 141ファイル（foundations/document-model.md のみ宣言持ち、他141ファイルは未宣言）の一括宣言付与は行わない。REQ-0136-035（段階適用、警告モード棚卸し → 重複解消 → 新規/変更 SPEC 強制 → 全件強制）と ADR-0124（soft-contract、欠落時 unknown で警告を出し処理を継続、既存 SPEC/req_draft/RU を拒否しない）に従う。宣言率指標（AG-011）は警告モードで、不合格閾値を設けず段階的改善を追跡する。

# artifact_actions: REQ/ADR/SPEC への保存対象を1つの配列に統合
artifact_actions:
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/quality/spec-health-metrics.md
    target_area: "## 測定対象と計測方法"
    source_items: [AG-011]
    content: |
      ## 測定対象と計測方法

      | メトリクス | 定義 | 計測方法 |
      |---|---|---|
      | SPEC行数 | SPECファイルの人手管理本文行数 | frontmatter、HTMLコメント、AUTOGENブロック全体を除外して計測する |
      | status放置期間 | draft状態のSPECが最終更新から経過した日数 | frontmatter `updated`から算出する |
      | ドメイン分類適合 | SPECが文書モデルの配置規則へ適合するか | ファイルパスとドメイン定義を照合する |
      | 宣言率（spec_logical_division） | 主論理区分を宣言済みの SPEC 数 / 全 SPEC 数 | 下記「宣言率指標の定義」参照 |
      | 宣言率（canonical_owner） | 正規所有対象を宣言済みの SPEC 数 / 全 SPEC 数 | 下記「宣言率指標の定義」参照 |

      AUTOGENブロックは `AUTOGEN:BEGIN` マーカーから対応する `AUTOGEN:END` マーカーまでを除外する。本節をSPEC行数計測定義の正本とする。

      ### 宣言率指標の定義

      宣言率は SPEC の主論理区分（`spec_logical_division`）、正規所有対象（`canonical_owner`）の宣言状況を機械的に集計する指標である（REQ-0156-013、REQ-0136-035、RU-0025、ADR-0139）。

      - **分子**: 宣言対象フィールド（`spec_logical_division` または `canonical_owner`）を frontmatter または冒頭宣言節のいずれかで宣言している SPEC ファイル数
      - **分母**: `docs/specs/**/*.md` に存在する全 SPEC ファイル数（`_template.md` を除く）
      - **計算方法**: 各 SPEC ファイルの frontmatter と冒頭宣言節を grep / parse し、対象フィールドの宣言有無を判定する。frontmatter 形式（YAML frontmatter 内の当該フィールド）と冒頭宣言節形式（`../foundations/document-model.md`「SPEC 宣言形式」が定義する冒頭宣言節内の当該フィールド）の両方を計測対象とし、いずれか一方でも宣言されていれば宣言済みと数える
      - **unknown 扱い**: フィールド値が `unknown`、または欠落している SPEC は「未宣言」として扱い、分子に含めない（分母には含める）。警告モード運用（ADR-0124 soft-contract）と整合し、欠落を理由に SPEC を拒否しない
      - **閾値**: 設けない（警告モード）。不合格による保存拒否、配置一貫性検証の強制を行わない。段階適用（REQ-0136-035）に従い、新規 SPEC から順次宣言付与を適用し、宣言率の推移を追跡する
      - **再現性**: 同一 commit 状態に対して grep / parse 集計を行えば誰でも同一結果を得られる。集計ロジックは本 SPEC が定義し、実行は `inspect-docs`、`/repo/docs-check` が担う（本 SPEC 自体は計測ロジックを実装しない）

      宣言率指標は警告モードで運用し、不合格閾値を設けない（REQ-0136-035 段階適用、ADR-0124 soft-contract）。新規 SPEC から順次宣言付与を適用し、段階的な宣言率向上を追跡する。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/responsibilities/artifact-contracts.md
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    target_area: "## 分類根拠伝播契約"
    source_items: [AG-008, AG-010]
    content: |
      ## 分類根拠伝播契約

      learning/intake → RU → req-define → spec-save の各工程間で引き継ぐ分類根拠フィールドを定義する（REQ-0136-033、AG-004、AG-008、AG-010、RU-20260722-02 合意、RU-0025、ADR-0139）。SPEC ファイルが主論理区分・正規所有対象を宣言する形式（frontmatter フィールド名、冒頭宣言節フォーマット）の正規所有者は `../foundations/document-model.md`「SPEC 宣言形式」とし、本節は工程間伝播フィールドの schema と、req-define から spec-save へのシリアライズ位置を正規所有する。両者は `spec_logical_division`、`canonical_owner` のフィールド名を共有し、工程間で同一の名前を用いる。req-define は SPEC action の `artifact_actions` と `operation_units` へ分類根拠を出力し、spec-save はこれを読み取って CREATE/UPDATE 各操作で SPEC frontmatter または冒頭宣言節へ宣言を付与する。

      ### 伝播フィールド一覧

      | フィールド | 型 | 内容 | soft-contract 扱い |
      |---|---|---|---|
      | change_nature | enum | 変更の性質: `new_user_requirement`、`external_contract_change`、`variation_addition`、`edge_case`、`parameter_adjustment`、`nonconformance_fix`、`internal_restructuring`、`document_correction` のいずれか | 欠落時は `unknown` で警告 |
      | req_impact | enum | REQ影響の有無: `yes`、`no`、`unknown` | 欠落時は `unknown` で警告 |
      | target_stakeholder | string | 変更が影響するステークホルダー（利用者、運用者、開発者、外部システム等） | 欠落時は `unknown` で警告 |
      | user_visible_change | enum | 利用者から見える変更の有無: `yes`、`no`、`unknown` | 欠落時は `unknown` で警告 |
      | spec_logical_division | enum | SPEC論理区分: `behavior`、`catalog`、`cross_cutting_contract`、`parameter`、`implementation_detail`、`unknown` のいずれか | 欠落時は `unknown` で警告 |
      | canonical_owner | string | 正規所有対象（対象 command、skill、workflow、品質ルール、整合性ルール等の関心キー） | 欠落時は `unknown` で警告 |
      | destination_selection_reason | string | 追記先を選択した理由 | 欠落時は `unknown` で警告 |
      | observed_evidence | string | 根拠となる観測事実（CI 失敗、誤検出、エッジケース発見等） | 欠落時は `unknown` で警告 |

      ### soft-contract 運用（ADR-0124 準拠）

      - 分類根拠は soft-contract（ADR-0124）として追加情報扱いとする
      - 厳格なスキーマ検証、JSON Schema、バリデータを導入しない
      - 欠落時は `unknown` 既定値で警告を出し、処理を継続する（後方互換）
      - 既存の採用済み成果物、RU、req_draft を欠落により拒否しない
      - 具体的なシリアライズ形式は各工程の成果物形式（RU frontmatter、draft-data YAML、SPEC frontmatter 等）に従う

      ### 各工程での扱い

      | 工程 | 入力 | 出力 |
      |---|---|---|
      | learning-promote | 学びから change_nature、observed_evidence を推定 | 採用済み成果物（promoted artifact）に分類根拠を添付 |
      | intake-promote | inbox item から change_nature、observed_evidence を推定 | 採用済み成果物に分類根拠を添付 |
      | backlog-review | 採用済み成果物から読取、`tentative_classification` と併せて RU frontmatter へ記録 | RU frontmatter に `tentative_classification` と分類根拠を記録 |
      | req-define | RU の分類根拠を暫定入力とし、最終分類を自身で確定。SPEC action（`artifact: spec`）の各 entry へ `spec_logical_division` と `canonical_owner` を最終分類確定値として出力する | draft-data の `artifact_actions`（各 SPEC action）と `operation_units` へ最終分類根拠を反映 |
      | spec-save | draft-data の `artifact_actions`（各 SPEC action）から分類根拠を読取、配置一貫性検証の入力とする。CREATE 操作では新規 SPEC frontmatter または冒頭宣言節へ `spec_logical_division` と `canonical_owner` を宣言として書き込む。UPDATE 操作では変更対象 SPEC に宣言がなく分類値が `unknown` 以外に確定している場合に宣言を補完する。分類値が `unknown` または欠落の場合は警告して処理を継続する（宣言欠落を理由に保存拒否しない） | 配置一貫性検証結果を commit message、完了報告に反映。宣言付与結果を SPEC ファイルへ反映 |

      ### REQ 拡張可否判定ルール

      change_nature が `new_user_requirement` または `external_contract_change` の場合のみ、REQ の作成または拡張を候補とする（REQ-0136-033）。それ以外の change_nature は、既存 REQ が要求を既に保持している限り REQ を拡張せず、SPEC 等への配置を検討する。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/commands/req-define.md
    target_spec: docs/specs/commands/req-define.md
    target_area: "## REQ影響判定とSPEC正規所有者確定"
    source_items: [AG-008, AG-010]
    content: |
      ## REQ影響判定とSPEC正規所有者確定

      req-define は backlog-review の暫定分類（`tentative_classification`）を暫定入力とし、最終分類を自身で確定する（REQ-0102-087、AG-005、AG-008、AG-010、RU-20260722-02 合意、RU-0025、ADR-0139）。

      ### 最終分類確定ステップで判定する項目

      req-define は次の7項目を判定し、`artifact_actions`、`operation_units` へ反映する:

      | 判定項目 | 内容 |
      |---|---|
      | 新しいステークホルダー要求か | 既存REQ が要求を保持していない新しい要求か |
      | 既存REQ が要求を既に保持しているか | 同一関心が既存REQ に存在するか |
      | 利用者から見える外部契約が変わるか | 外部契約変更（change_nature: `external_contract_change`）に該当するか |
      | REQ の作成・更新が必要か | 上記3項目から REQ 作成・更新要否を確定 |
      | SPEC の論理区分 | REQ-0155-009 の5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）のいずれか |
      | 正規所有者 | 対象 command、skill、workflow、品質ルール、整合性ルール等の関心キー（REQ-0119-038） |
      | 正規追記先 | 既存 SPEC のどの領域へ追記するか（target_area、target_spec） |

      ### SPEC action への分類根拠出力（AG-008、AG-010、RU-0025）

      最終分類確定ステップで `artifact: spec` の SPEC action 各 entry へ `spec_logical_division` と `canonical_owner` を最終分類確定値として出力する。出力値は `artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド一覧（`spec_logical_division`、`canonical_owner`）と一致し、後続の spec-save が SPEC frontmatter または冒頭宣言節へ宣言を付与するための入力となる。分類値が確定できない場合は `unknown` とし、soft-contract（ADR-0124）に従い spec-save へ警告付きで引き継ぐ。

      ### REQ 影響なし時の取扱い

      REQ 影響なしと確定した変更からは `artifact_actions` の `artifact: req` エントリを生成しない（REQ-0102-088、AG-005）。代わりに `artifact: spec` エントリのみを生成し、SPEC への配置のみを行う。SPEC action には前項「SPEC action への分類根拠出力」を適用する。

      ### 分類根拠の引き継ぎ

      req-define は RU から引き継いだ分類根拠（`artifact-contracts.md`「分類根拠伝播契約」参照）を暫定入力とし、最終分類を確定した上で draft-data へ反映する。分類根拠の soft-contract 運用（欠落時 unknown 既定値、警告）は ADR-0124 に従う。

      ### tentative_classification との関係

      backlog-review が付与する `tentative_classification`（REQ-0155-003 の7値）は暫定値であり、req-define が最終分類を上書きする。最終分類確定時のバリデーション（7値チェック、フィールド欠落時の停止、上書き値の7値チェック）は前述「tentative_classification 最終確定のバリデーション」に従う。

      ### Step 3 構造的分析フレーム先行手順（REQ-0102-083, REQ-0102-084, REQ-0102-085）

      Step 3（壁打ち対話）の開始時に、入力（RU、セッションコンテキスト、明示入力ファイル）の構造を入力データの性質に応じた分析フレームで先行して整理し、個別論点の深掘り前に全体構造をユーザーに提示する。

      #### 分析フレームの選択

      入力データの性質に応じて以下のフレームから選択する:

      | 入力データの性質 | 推奨フレーム |
      |---|---|
      | 複数RU・複数改善候補 | 対象×変更種別の二軸マトリクス |
      | 既存要件との照合が必要 | 既有件化/未要件化/SPEC配置の3分類表 |
      | 修正要否の判定 | 実装面/SPEC面の両面分析表 |

      上記は推奨例であり、入力データの性質に応じて適切なフレームを選択する。分析フレームは個別論点の深掘りに先行して提示する。

      #### 二項選択回答規定

      ユーザーが二項選択（「AかBか」）を求めた質問に対し、「混在」「要確認」単独の回答を出力しない。件数と根拠でいずれかを明示して回答する。両選択肢に該当する場合は、それぞれの件数と根拠を明示して両方を提示する。

      #### 実装/SPEC両面分析規定

      修正の要否を検討する際、実装面（ソースコード、スクリプト、スキル定義ファイル等の変更）と SPEC 面（docs/specs/ 配下の文書変更）の両面を分析し、各面の修正対象と修正内容を明示する。片面のみの分析で修正要否を断定しない。

      #### agentdev-req-analysis SKILL 連携

      上記手順の詳細（質問運用ルール、分析フレーム選択基準）は `agentdev-req-analysis` SKILL（`src/opencode/skills/agentdev-req-analysis/SKILL.md`）の「質問運用ルール」「要件分析観点」セクションに反映する。本 SPEC は手順の要件を定義し、SKILL は実装詳細を定義する（原本src→配置先.opencode の文書間投影規則に準拠）。

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target: docs/specs/commands/spec-save.md
    target_spec: docs/specs/commands/spec-save.md
    target_area: "## 配置一貫性検証"
    source_items: [AG-008, AG-010]
    content: |
      ## 配置一貫性検証

      spec-save は SPEC ファイル保存に先立ち、対象 SPEC の主論理区分・正規所有対象と保存内容の整合を「配置一貫性検証」として検証する（REQ-0136-034、AG-006、AG-007、AG-008、AG-010、RU-20260722-02 合意、RU-0025、ADR-0139）。配置一貫性検証は確定済み分類・所有情報と保存先の整合確認であり、「内容品質の再査読」ではない（REQ-0136-030 との整合）。内容品質は引き続き req-define QG-1 の責務である。

      ### 検証項目

      | 検証項目 | 内容 | 不一致検出時 |
      |---|---|---|
      | 論理区分整合 | 変更の論理区分（artifact_action が示す SPEC 論理区分）と対象 SPEC の主論理区分が整合する | 保存を停止し、分類または追記先の再判定へ戻す |
      | 所有対象整合 | 変更の所有対象（artifact_action が示す正規所有対象）と対象 SPEC の正規所有対象が整合する | 同上 |
      | 別所有SPEC 不存在 | 同一関心の別の正規所有 SPEC が存在しない（REQ-0119-038 違反でない） | 同上 |
      | 横断SPEC 不当配置 不存在 | command 固有仕様を不当に横断 SPEC へ配置していない | 同上 |
      | パラメータ不当混入 不存在 | パラメータ変更を不当に挙動説明またはカタログへ混入させていない（REQ-0155-009 準拠） | 同上 |
      | accepted 間分界矛盾 不存在 | accepted SPEC 間で責任分界が矛盾しない | 同上 |

      不一致を検出した場合、保存せず、分類または追記先の再判定へ戻す。

      ### 強制ゲート（保存拒否）の有効化条件

      強制ゲート（保存拒否条件: 重複所有、配置不一致）は SPEC 宣言形式（主論理区分、正規所有対象）の定義完了後に有効化する（REQ-0136-035、AG-007）。宣言形式の定義は `../foundations/document-model.md`「SPEC 宣言形式」を正規所有者とし、`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド名（`spec_logical_division`、`canonical_owner`）と一致させる。

      ### 宣言付与フロー（CREATE/UPDATE）（AG-008、AG-010、RU-0025）

      spec-save は req-define が `artifact_actions` の SPEC action へ出力した `spec_logical_division` と `canonical_owner` を読み取り、CREATE/UPDATE 各操作で SPEC frontmatter または冒頭宣言節（`../foundations/document-model.md`「SPEC 宣言形式」が定義する形式）へ宣言を付与する。CREATE と UPDATE で宣言付与要件を一本化する。

      - **CREATE**: 新規 SPEC の frontmatter または冒頭宣言節へ `spec_logical_division` と `canonical_owner` を宣言として書き込む。spec-save が対象 SPEC を宣言なしで完了することを禁止する
      - **UPDATE**: 変更対象 SPEC が frontmatter または冒頭宣言節で当該宣言を未宣言の場合、かつ req-define から渡された分類値が `unknown` 以外に確定している場合に、宣言を補完する。分類値が `unknown` または欠落の場合は警告して処理を継続する（宣言欠落だけを理由に保存拒否しない）
      - **既存 SPEC の一括更新**: 行わない。未変更 SPEC へ遡及的に宣言を付与しない（REQ-0136-035 段階適用、ADR-0124 soft-contract）。宣言率指標（`../quality/spec-health-metrics.md`「測定対象と計測方法」参照）が段階的な宣言率向上を追跡する

      宣言形式の正規所有者は `../foundations/document-model.md`「SPEC 宣言形式」、伝播フィールドの schema の正規所有者は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」である。本節は宣言付与の実行ステップを定義する。

      ### 段階適用

      宣言未完了の既存 SPEC は警告モードで経過観察する（後方互換期間）。段階適用は次の5ステップとする:

      | ステップ | 内容 |
      |---|---|
      | (a) 宣言形式定義 | SPEC frontmatter または冒頭宣言節で主論理区分・正規所有対象の宣言形式を定義する（完了: `../foundations/document-model.md`「SPEC 宣言形式」） |
      | (b) 警告モード棚卸し | 既存 SPEC を警告モードで棚卸し、宣言形式の適用状況を把握する |
      | (c) 重複解消 | 同一関心キーに対する複数正規所有宣言を解消する |
      | (d) 新規/変更 SPEC 強制 | 新規作成、または変更がある SPEC に対して配置一貫性検証を強制する |
      | (e) 全件強制 | 全 SPEC に対して配置一貫性検証を強制する |

      bootstrap 問題（宣言前に強制すると既存 SPEC 処理不能）を避けるため、強制は段階的に有効化する。各ステップの移行条件、タイミングは別途 inspect/backlog 経由で判断する。

      ### 検証と内容品質の責務分離

      配置一貫性検証は配置先の整合確認であり、内容品質の再査読ではない。内容品質は req-define QG-1 の責務（REQ-0136-030）。spec-save が配置一貫性検証で不一致を検出した場合、保存を停止するが、内容品質の再評価は実施しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0025 の spec_logical_division / canonical_owner 宣言付与必須化（旧 AG-008）と、後方互換運用（REQ-0136-035 段階適用、ADR-0124 soft-contract）が衝突すると想定された。宣言付与必須化は既存 SPEC を不合格とし、spec-save を停止する可能性があった。
    resolution: |
      実ファイル確認の結果、宣言形式（document-model.md `### SPEC 宣言形式` 節 L456）と伝播フィールド schema（artifact-contracts.md `## 分類根拠伝播契約`）は現行契約で既に確立している。frontmatter 形式、冒頭宣言節形式、soft-contract 運用（欠落時 unknown で警告）、REQ-0136-033/REQ-0156-013 準拠は全て既規定。本ドラフトの想定した衝突は現行契約で解消済み。
      AG-008/010 の宣言伝播・付与フローは req-define から spec-save までを同一関心として扱う。宣言率指標（AG-011）は新規 SPEC 変更として実行対象。

  - id: CR-002
    conflict: |
      RU-0015/0018/0025 レビューで、command 文書形式の既存 SPEC と責任重複させない指摘、動的な REQ 件数や範囲を guide へ重複記載しない指摘、自動更新対象にするより重複記述自体を削除する指摘がそれぞれ出られた。
    resolution: |
      RU-0015 は重複削除へ転換。docs/guides/*.md と vocabulary-registry.md の動的 REQ 件数・番号範囲を削除し、docs/requirements/README.md への参照へ置換する。req-save の自動更新は不採用。
      RU-0018 は既存所有先（artifact-responsibilities.md、agentdev-project-extensions/SKILL.md、agentdev-command-authoring 群）で boilerplate 許容指針が既に充足しているため covered。新規 SPEC 作成は rejected（reason_code: duplicate_owner）。command 公開契約全体の4行上限は根拠不足で rejected（reason_code: unsupported_generalization）。
      RU-0025 は宣言形式と伝播フィールド schema が現行契約で既確立のため大部分が covered。残る新規要素（宣言率指標、req-define→spec-save 宣言伝播・付与フロー）のみ実行対象。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0015
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    target_artifacts:
      - docs/guides/project-docs-and-specs.md
      - docs/guides/*.md（REQ 範囲表記を含む他のガイド）
      - src/opencode/skills/agentdev-gh-cli/references/vocabulary-registry.md
    note: |
      docs/guides/*.md と vocabulary-registry.md の動的 REQ 件数・番号範囲表記を削除し、docs/requirements/README.md への参照へ置換する。req-save の自動更新は不採用。docs/requirements/README.md が正とする現行契約（patterns.md L98）に従う。
    result: {}

  - ou_id: OU-002
    source_ru: RU-0025
    source_actions: [ACT-SPEC-003]
    target_spec: docs/specs/quality/spec-health-metrics.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-0025
    source_actions: [ACT-SPEC-005, ACT-SPEC-006, ACT-SPEC-007]
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    target_artifacts:
      - docs/specs/responsibilities/artifact-contracts.md
      - docs/specs/commands/req-define.md
      - docs/specs/commands/spec-save.md
      - src/opencode/commands/agentdev/req-define.md
      - src/opencode/commands/agentdev/spec-save.md
    note: |
      req-define から spec-save までの分類根拠伝播と CREATE/UPDATE 時の宣言付与を同一関心として扱う。req-define は SPEC action へ spec_logical_division と canonical_owner を出力する。artifact-contracts.md は伝播フィールドのシリアライズ位置を明確化する。spec-save CREATE は宣言を新規 SPEC へ書き込み、spec-save UPDATE は変更対象 SPEC に宣言がなく分類値が確定している場合に補完する。分類値が unknown または欠落の場合は警告して継続する。既存の未変更 SPEC は一括更新しない。宣言欠落だけを理由に保存拒否しない。
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。1 entry = 1 AG 参照
test_strategy:
  - id: TS-004
    target_item: AG-008
    verification: |
      spec-save CREATE で新規 SPEC を作成した後、対象 SPEC の frontmatter または冒頭宣言節に spec_logical_division と canonical_owner の宣言が付与されていることを確認する。テスト用 SPEC を spec-save で作成し、frontmatter または冒頭宣言節を Read で確認する。
    pass_criteria: |
      新規作成 SPEC の frontmatter または冒頭宣言節に spec_logical_division と canonical_owner の両宣言が含まれること。宣言値が req-define から渡された分類根拠と整合すること。宣言形式自体は現行契約（document-model.md `### SPEC 宣言形式` 節 L456）で既規定のため、新規追加ではなく既存形式の適用を確認する。
    on_failure: |
      fix-and-reverify。spec-save CREATE 手順の宣言付与 Step が未実装または req-define からの分類根拠伝播が不正の可能性が高い。spec-save.md の CREATE 手順と req-define.md の分類根拠出力を確認し、Step を修正して再検証する。
  - id: TS-006
    target_item: AG-010
    verification: |
      spec-save UPDATE で既存 SPEC を更新した後、対象 SPEC の frontmatter または冒頭宣言節に spec_logical_division と canonical_owner の宣言が付与されていることを確認する。テスト用 SPEC を spec-save で更新し、frontmatter または冒頭宣言節を Read で確認する。UPDATE 対象 SPEC が宣言未宣言の場合、req-define から渡された分類値が unknown 以外に確定していれば宣言が補完されることを確認する。
    pass_criteria: |
      更新 SPEC の frontmatter または冒頭宣言節に spec_logical_division と canonical_owner の両宣言が含まれること。宣言値が req-define から渡された分類根拠と整合すること。宣言形式自体は現行契約（document-model.md `### SPEC 宣言形式` 節 L456）で既規定のため、新規追加ではなく既存形式の適用を確認する。分類値が unknown または欠落の場合は警告されて処理が継続し、宣言欠落だけを理由に保存拒否されないこと。
    on_failure: |
      fix-and-reverify。spec-save UPDATE 手順の宣言付与 Step が未実装または req-define からの分類根拠伝播が不正の可能性が高い。spec-save.md の UPDATE 手順と req-define.md の分類根拠出力を確認し、Step を修正して再検証する。
  - id: TS-005
    target_item: AG-011
    verification: |
      docs/specs/quality/spec-health-metrics.md の測定対象と計測方法表に「宣言率（spec_logical_division）」と「宣言率（canonical_owner）」の2指標行が追加されていることを確認する。宣言率が機械的に算出可能（grep / parse で集計可能）であることを確認するため、宣言率算出スクリプトまたは grep コマンドを実行する。
    pass_criteria: |
      対象 SPEC の測定対象表に2つの宣言率指標行が存在すること。各指標が frontmatter または冒頭宣言節のフィールド有無を機械的に集計する計測方法を持つこと。宣言率指標が警告モード（不合格閾値なし）で運用されることが SPEC 本文に明記されていること。
    on_failure: |
      fix-and-reverify。spec-health-metrics.md への spec-update（OU-002）が未完了、または target_area 一致でスキップされた可能性が高い。spec-save の target_area 処理と spec-health-metrics.md の該当セクションを確認し、spec-update を再実行する。
  - id: TS-008
    target_item: AG-001
    verification: |
      docs/guides/*.md（project-docs-and-specs.md 等）と vocabulary-registry.md（references 配下）から動的 REQ 件数・番号範囲表記（「REQ-0101 から REQ-0162 までの 53 件」等）が削除され、docs/requirements/README.md への参照へ置換されていることを grep で確認する。AG-001 の原本（ガイド自動更新）は rejected だが、採用された代替（重複削除）が OU-001 で実行された結果を検証する。
    pass_criteria: |
      docs/guides/*.md と vocabulary-registry.md に動的 REQ 件数・番号範囲表記が存在しないこと。代わりに docs/requirements/README.md への参照が存在すること。req-range-notation-freshness（IR-018）が docs-check で NG を報告しないこと（動的表記が削除されたため検出対象自体がなくなる）。
    on_failure: |
      fix-and-reverify。重複削除が未完了、または一部ガイドに動的表記が残っている可能性が高い。対象ガイドを再確認し、動的表記を docs/requirements/README.md 参照へ置換して再検証する。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  epic_slug: backlog26-rus-integrated
  referenced_reqs: [REQ-0136-035, REQ-0156-013, REQ-0155-009, REQ-0147-001, REQ-0119-034]
  referenced_adrs: [ADR-0124, ADR-0139, ADR-0105, ADR-0135]
  implementation_notes:
    - "RU-0015: docs/guides/*.md と vocabulary-registry.md の動的 REQ 件数・番号範囲表記を削除し、docs/requirements/README.md への参照へ置換する。req-save の自動更新は不採用。原本側（docs/guides/、src/opencode/skills/agentdev-gh-cli/references/）を編集する"
    - "RU-0025: src/opencode/commands/agentdev/spec-save.md（原本）の CREATE/UPDATE 手順へ宣言付与ステップを追加。原本側 src/opencode/ を編集し sync で反映（ADR-0105）"
  decomposition: |
    C7 は3件の RU からなり、3つの子 Issue（OU-001、OU-002、OU-003）として扱う。
    OU-001（RU-0015）は docs/guides/*.md と vocabulary-registry.md の重複削除。
    OU-002（RU-0025）は spec-health-metrics.md へ宣言率指標追記。
    OU-003（RU-0025）は spec-save command の CREATE/UPDATE 手順拡張。OU-002 完了後に実施。
    RU-0018 は全項目 covered または rejected のため Issue を作成しない。
  wave_hints:
    - "Wave 1: OU-001（RU-0015 重複削除）、OU-002（RU-0025 宣言率指標）、OU-003（RU-0025 req-define→spec-save 宣言伝播・付与フロー同一関心）。対象ファイルが重ならず意味的依存もないため並列可能"

review_dispositions:
  - id: RD-001
    source_ru: RU-0015
    source_item: AG-001
    disposition: rejected
    reason_code: superseded_by
    reason: ガイド自動更新は不採用。動的 REQ 件数・番号範囲の重複記述自体を削除し、docs/requirements/README.md への参照へ置換する方針へ転換。REQ-0144-029 append も不要。
    evidence:
      - path: docs/guides/project-docs-and-specs.md
        section: L26（REQ 範囲表記の重複記述）
        checked_at_commit: null
      - path: docs/specs/foundations/patterns.md
        section: L98（docs/requirements/README.md を正とする現行契約）
        checked_at_commit: null
    related_removed_items: [AG-002, AG-003, ACT-REQ-001, TS-001]

  - id: RD-002
    source_ru: RU-0018
    source_item: AG-004
    disposition: rejected
    reason_code: duplicate_owner
    reason: 既存所有先で boilerplate 許容指針が充足済み。新規 command-authoring-standards.md SPEC は重複所有となるため作成しない。
    evidence:
      - path: docs/specs/responsibilities/artifact-responsibilities.md
        section: 公開契約宣言と詳細契約の分離（project extensions boilerplate 適用パターン1）
        checked_at_commit: null
      - path: src/opencode/skills/agentdev-project-extensions/SKILL.md
        section: boilerplate 重複検出時の判定マトリクス
        checked_at_commit: null
      - path: docs/specs/skills/agentdev-command-authoring.md
        section: command 全般の責務と reference 分割基準
        checked_at_commit: null
    related_removed_items: [AG-006, AG-007, ACT-SPEC-001, ACT-SPEC-002, TS-002, TS-003]

  - id: RD-003
    source_ru: RU-0018
    source_item: AG-005
    disposition: partially_covered
    reason_code: unsupported_generalization
    reason: |
      extension boilerplate の4行構成、許容・違反判定基準、project-extensions 判定マトリクスとの整合は既存所有先で充足済み（採用部分、covered 相当）。command 公開契約全体（extension 以外も含む）への4行上限の一般化は、extension 以外の command で根拠となる契約・測定事例がないため不採用（unsupported_generalization、非採用部分）。採用部分は既存所有先（artifact-responsibilities.md、project-extensions/SKILL.md）で代替し、非採用部分は別途根拠が整うまで保留とする。
    evidence:
      - path: docs/specs/responsibilities/artifact-responsibilities.md
        section: 公開契約宣言と詳細契約の分離、extension boilerplate 4行上限、REQ-0119-034 違反判定
        checked_at_commit: null
      - path: src/opencode/skills/agentdev-project-extensions/SKILL.md
        section: 宣言文1行 + boilerplate 4行構成、許容・違反判定マトリクス
        checked_at_commit: null
      - path: docs/specs/responsibilities/artifact-responsibilities.md
        section: 公開契約宣言と詳細契約の分離（command 公開契約全体への4行上限一般化の根拠なし、extension boilerplate に限定）
        checked_at_commit: null
    related_removed_items: []

  - id: RD-004
    source_ru: RU-0025
    source_item: AG-008
    disposition: partially_covered
    reason_code: partially_satisfied
    reason: 宣言形式（frontmatter、冒頭宣言節）と伝播フィールド schema は現行契約で既確立（covered 部分）。spec-save CREATE 手順での宣言付与フローは implementation（OU-003）として残る（実行対象部分）。
    evidence:
      - path: docs/specs/foundations/document-model.md
        section: L456-484（`### SPEC 宣言形式` 節、frontmatter 形式、冒頭宣言節形式）
        checked_at_commit: null
      - path: docs/specs/responsibilities/artifact-contracts.md
        section: L133-148（`## 分類根拠伝播契約`、伝播フィールド一覧）
        checked_at_commit: null
    related_removed_items: []

  - id: RD-005
    source_ru: RU-0025
    source_item: AG-010
    disposition: partially_covered
    reason_code: partially_satisfied
    reason: UPDATE 対象 SPEC への宣言付与も CREATE と同じ宣言形式を参照する（covered 部分）。spec-save UPDATE 手順での宣言付与フローは implementation（OU-003）として残る（実行対象部分）。
    evidence:
      - path: docs/specs/foundations/document-model.md
        section: L456-484（`### SPEC 宣言形式` 節、CREATE と UPDATE で同じ宣言形式を参照）
        checked_at_commit: null
    related_removed_items: []

  - id: RD-006
    source_ru: RU-0025
    source_item: AG-012
    disposition: covered
    reason_code: already_satisfied
    reason: 後方互換性と soft-contract 運用は現行契約で既確立。既存 SPEC への一括宣言付与を行わない方針も soft-contract 運用と整合する。
    evidence:
      - path: docs/specs/foundations/document-model.md
        section: L469（soft-contract ADR-0124、欠落時 unknown で警告）
        checked_at_commit: null
      - path: docs/specs/responsibilities/artifact-contracts.md
        section: L150-156（soft-contract 運用、既存 SPEC/req_draft/RU を拒否しない）
        checked_at_commit: null
    related_removed_items: []
```

# summary

C7 クラスタ（SPEC作成・更新プロセス）の3件 RU を、現行契約との照合で再構成した要件ドラフト。

RU-0015 はガイド自動更新を不採用とし、docs/guides/*.md と vocabulary-registry.md の動的 REQ 件数・番号範囲を削除して docs/requirements/README.md への参照へ置換する。

RU-0018 は既存所有先（artifact-responsibilities.md、agentdev-project-extensions/SKILL.md、agentdev-command-authoring 群）で boilerplate 許容指針が充足済みのため covered、新規 SPEC 作成は rejected（reason_code: duplicate_owner）。command 公開契約全体の4行上限は根拠不足で rejected（reason_code: unsupported_generalization）。

RU-0025 は宣言形式（document-model.md `### SPEC 宣言形式` 節 L456）と伝播フィールド schema（artifact-contracts.md）が現行契約で既確立のため大部分が covered。残る新規要素（宣言率指標、req-define→spec-save 宣言伝播・付与フロー）のみを実行対象とする。

実行対象は OU-001（RU-0015 重複削除）、OU-002（RU-0025 SPEC 変更: spec-health-metrics.md 宣言率指標）、OU-003（RU-0025 req-define→spec-save 宣言伝播・付与フロー同一関心）。RU-0018 は covered/rejected のため Issue を作成しない。
