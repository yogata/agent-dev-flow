---
draft_type: req_draft
topic_slug: minimal-tim-traceability-redesign
status: saved
created_at: "2026-08-21T07:47:31+09:00"
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  トレーサビリティ体系を Artifact Graph（汎用グラフ・派生索引）から要件中心の最小 TIM（要件行単位、covers、design/implementation/verification の3役割）へ再定義し、標準機能を agentdev-traceability（coverage、impact、check、正規成果物の直接走査）へ再構成する。ADF ワークフロー各工程へ統合した上で、全現行要件への実装対応・検証対応の対応付けを移行し、旧 Artifact Graph を互換層なしで撤去する。RU-0001〜RU-0004 を単一要件doc・4 OU 構成として統合する（通常Case、feature / large、main）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      最小 TIM モデルを確立する。TIM の要件単位は REQ 文書全体ではなく個別の要件行（REQ-{NNNN}-{MMM}）とし、標準コア関係は成果物が要件へ明示的に対応する covers（対応関係）のみとする。要件へ対応する成果物の役割は design、implementation、verification の3種を標準とする。各現行要件には、要件を実現する実装成果物と要件を検証する検証手段が各1件以上明示的に対応付けられる（対応関係の完全性規則）。要件と Design 文書の対応付けは任意とし、対応しない要件を許容する。実装成果物および検証手段は要件へ直接対応付け、Design 対応を経由して実装または検証が成立したものと推定しない。1つの成果物が複数の要件へ対応でき、複数の役割を持てる。implementation はソースコードという物理種別ではなく要件を実現する永続成果物の役割であり、verification は要件を検証する永続的な検証手段を表し、個々の検証実行結果は TIM に保持しない。Decision は ADF の正式文書として維持するが最小 TIM の標準成果物型には含めない。一般的な文書参照、Markdown リンク、言及を意味的なトレース関係として扱わない。関係ごとの変更影響方向を正規データとして保持せず、分解・具体化・依存・実現等の多数の関係型や汎用拡張機構を標準 TIM へ持ち込まない。TIM は派生索引、グラフDB、物理保存形式を規定しない。coverage / covers は機械識別子または外部標準との対応説明で使用できるが、日本語本文の正式用語は「対応関係」「対応付け」を用いる。

  - id: AG-002
    content: |
      標準トレーサビリティ機能を agentdev-traceability として再構成する（agentdev-artifact-graph の廃止）。標準公開能力は coverage、impact、check を基本とする。coverage は要件起点で対応する Design 文書・実装成果物・検証手段を、成果物起点で対応する要件を取得し、明示された対応関係を全件返して候補数上限・ランキング・探索深度で黙って切り捨てない。impact は要件起点で当該要件へ明示的に対応する成果物を、成果物起点で要件を経由して同じ要件へ対応する他成果物を再確認候補として取得し、任意深度のグラフ探索を行わず成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索せず、空結果を「影響なし」の証明として扱わない。check は不正な対応宣言、未知の成果物役割、存在しない要件への参照、実装対応の欠落、検証対応の欠落、対応宣言の根拠箇所を取得できない状態を決定的に検査する。標準実装は正規成果物を直接走査し対応関係をその場で解決する。`.agentdev/graph/` のような派生 Graph を標準動作の必須入力・必須生成物とせず、派生索引の鮮度判定・再生成・生成バージョン・設定ダイジェスト等を必須契約としない。neighbors、path、provenance、related、dependency、implementation、diagnostics の旧公開動作との互換性を必須とせず、一般文書探索、任意経路探索、構造診断、依存関係探索を責務へ取り込まない。OpenFastTrace、Eclipse Capra、専用グラフDBを標準実行依存として導入せず、性能について数値の受け入れ基準を設けない。将来、直接走査が実運用上の問題として観測された場合は coverage、impact、check の外部契約を変えずにキャッシュまたは索引を追加できる構造とする。対応宣言の具体的な表記は Design で確定し、要件では文字列形式を固定しない。対応宣言は対応する成果物自身を正規情報源として保持し、中央台帳を新設しない。現行 Artifact Graph のファイル探索・Markdown 解析・要件ID解決等の実装資産は、設計に適合する場合のみ再利用する。

  - id: AG-003
    content: |
      トレーサビリティを ADF ワークフローへ統合する。req-define は既存の明示的な対応関係と impact を変更影響候補の確認に利用でき、トレーサビリティ情報だけで変更対象・正規所有者・対象範囲を確定せず、impact の空結果を「影響なし」の根拠とせず、将来作成される成果物との対応関係を推測して正規情報として保存しない。req-save は正式な要件IDの保存を担当し、実装対応・検証対応の作成責務を持たず、新規要件保存時点で対応が0件でも失敗しない。design-save は req-define で Design action と対象要件の対応が明示確定している場合にその情報を利用して Design 対応を保存でき、Design 本文の自由記述から対象要件を再推論して正規の対応関係を生成せず、Design action が存在しない要件の処理を妨げない。case-open は上流工程で確定した対象要件と実行契約を Issue へ引き継ぎ、req-define と重複して一般的な変更影響探索や依存関係探索を行い対象範囲を再決定しない。case-run の実行担当は、実際に要件を実現する成果物へ実装対応を、実際に要件を検証する永続的な検証手段へ検証対応を明示し、変更されたファイルであることだけを理由に要件へ自動対応付けせず、PR 作成前に対象要件について check を実行して実装対応・検証対応・対応宣言の整合性を検査する。check の不合格が承認済み対象範囲内で修正可能な場合は修正して再検証し、要件変更・対象範囲拡大・追加設計判断・外部依存解消が必要な場合は反復を停止し blocked として必要な判断事項を報告する。case-close は QG-4 の一部として対象要件の実装対応と検証対応の完全性を正規成果物から独立して再検査し、欠落が残る場合はマージせず停止し、対応関係を自動追加・修正せず、検査失敗を case-run 側の修正対象として差し戻せる。TIM は「何が要件を検証するか」という検証手段との対応関係を保持し、Issue、PR、QG は「今回その検証を実行して合格したか」という実行結果を扱い、特定時点の検証結果を TIM の恒久的な対応関係として保存しない。中断後の再実行では正規成果物に保存済みの対応関係を再利用し、同じ対応宣言を重複生成しない。トレーサビリティ機能の実行失敗だけを理由に ADF 標準ワークフローを恒常停止させず、正規成果物の異常と探索機能の異常を区別する。

  - id: AG-004
    content: |
      既存要件の対応付け移行と旧 Artifact Graph 撤去を行う。移行順序は、最小 TIM の確定（RU-0001）、agentdev-traceability 基礎機能の利用可能化（RU-0002）を先行とする。旧 Artifact Graph、通常のファイル探索、rg、既存文書参照を既存要件の対応候補を見つける補助手段として利用でき、旧 Artifact Graph の結果だけから実装対応または検証対応を正規情報として自動確定しない。各現行要件について、実際に要件を実現する実装成果物と実際に要件を検証する永続的な検証手段を確認し、正規成果物側へ対応を保存する。全現行要件について check を実行し未解決の不合格がないことを確認した後に、case-close / QG-4 の強制検査を有効化する。標準ワークフローの旧 Artifact Graph 利用箇所を agentdev-traceability または本来の正規所有機能へ切り替えた後、旧スキル、設定（.agentdev/artifact-graph.yaml）、生成処理、派生生成物（.agentdev/graph/）、旧公開APIを撤去する。移行完了後に、旧 Artifact Graph の互換層、移行専用の恒久例外台帳、旧要件だけを除外する legacy モードを残さない。blocked または未検証項目が残る場合に移行完了と判定しない。過去の Artifact Graph 効果評価 Report は履歴上の非規範資料として保持できる。既存要件の棚卸しをどの処理単位へ分割するかは case-open の実行計画で決定する。

  - id: AG-005
    content: |
      REQ 体系を再編する。REQ-012 は全面更新して存続させ、Artifact Graph 標準化ではなく成果物トレーサビリティ（最小 TIM と agentdev-traceability の coverage、impact、check）の正規要件を所有させる。REQ-020 は独立 REQ として廃止（RETIRE）とし、解析品質・試験設計として必要な内容のみ新しい Design またはテストへ移す。REQ-021 は存続させるが、ADF ワークフローのどこでトレーサビリティ能力を利用・検査するかに限定した内容へ大幅に縮小する。REQ-040 は独立 REQ として廃止（RETIRE）とし、必要な coverage、impact、check の外部能力を REQ-012 へ統合する。

  - id: AG-006
    content: |
      Decision 体系を再編する。DEC-017 は、今回の最小 TIM、要件中心の対応モデル、Artifact Graph を必須としない構造、正規成果物の直接走査を中心とする方針へ全面再構成する。現行 DEC-017 の4層分離、Decision の TIM 必須参加、多数の関係意味を前提とする決定は新方針へ置換する。再構成 DEC-017 は、DEC-007 が所有してきた標準配布スキル地位の決定（agentdev-artifact-graph の標準配布スキルとしての地位終結と agentdev-traceability への置換、互換層なし・legacy モードなし、移行期間のみ旧 Graph を候補探索に利用し全要件対応付け完了後に撤去）を引き継いで所有する（CR-001）。DEC-007 は新 DEC-017 が承認された時点で置換済み（superseded）として扱い、Artifact Graph を標準探索モデルとする決定を並立させない。DEC-019 の「一般処理は標準APIへ委譲し、ADF固有意味論だけを所有する」原則は維持し、Artifact Graph 固有参照のみ後継機能へ追従させる。

  - id: AG-007
    content: |
      診断・レビュー系工程の旧 Artifact Graph 由来の候補探索能力は継承しない。inspect-docs、inspect-skills、backlog-review、agentdev-adversarial-review、agentdev-doc-diagnostics は、agentdev-traceability の coverage、impact、check を一般文書探索・構造診断・依存関係探索の用途に利用しない。これらの工程の候補探索は、README 索引、正規成果物の直接読取、rg 等の独立探索手段によって行う（CR-002）。この能力の切り替えは、各 command Design / skill Design の「Artifact Graph 利用」節の削除・置換として実装する。

  - id: AG-008
    content: |
      Design 再編の全体像を次のとおりとする。設計本文は design-save および各 Case が作成し、要件doc では対象と目的を確定する。(1) docs/designs/foundations/traceability-model.md を最小 TIM へ全面再設計する（design-save 対象。要件行単位、covers、3役割、完全性規則、用語政策を所有）。(2) docs/designs/skills/agentdev-artifact-graph.md に代わる後継 agentdev-traceability の Design を新設する（design-save 対象。対応宣言の表記、coverage、impact、check の詳細契約、正規成果物の直接走査、旧実装資産の再利用判定を所有）。(3) req-define、design-save、case-open、case-run、case-close の各 command Design の Artifact Graph 利用節を agentdev-traceability 利用へ切り替える（OU-3 の Case 範囲、RU-0003 要件どおり）。(4) agentdev-doc-diagnostics、inspect-docs、inspect-skills、backlog-review、agentdev-adversarial-review の各 Design の Artifact Graph 利用節を削除し独立探索手段へ切り替える（AG-007 の実装、OU-3 の Case 範囲）。(5) docs/designs/integrity/targeted-docs-guard-implementation.md の Artifact Graph node 関係整合検査は `.agentdev/graph/` 除去でデータソースを喪失するため、廃止または rg ベースの代替へ再設計する（OU-4 の Case 範囲）。現行 tim.ts、profiles.ts、edges.ts、Graph 生成、問い合わせ、拡張、鮮度管理等の実装は、新 Design への適合性を個別に評価し、必要な小規模資産だけ再利用する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-001, AG-002, AG-005]
    content: |
      # 指示: frontmatter は id: REQ-012、title: "成果物トレーサビリティ"、created: "2026-08-08"、updated: "2026-08-21" とする。
      # 本文全体を以下の変更後全文へ置換する。要件行 ID の new:tim-NN は req-save が採番した REQ-012-{MMM}（現行 max+1 連番）へ置換する。

      ## 目的

      AgentDevFlow の Traceability Information Model（TIM）を、汎用成果物グラフではなく、要件を中心とした最小の対応モデルとして定義する。各要件について、要件を実現する実装成果物と要件を検証する検証手段を明示的に対応付け、対応漏れと不整合を決定的に検査できることを目的とする。標準機能として agentdev-traceability（coverage、impact、check）を提供し、正規成果物の直接走査によって対応関係を解決する。外部標準（SysML、OSLC、OpenFastTrace）は概念上の参照元とし、日本語本文の正式用語は「対応関係」「対応付け」を用いる。旧 Artifact Graph（汎用グラフ、派生索引、旧公開API）は移行完了後に撤去する（DEC-017）。

      ## 要件

      | ID | 要件 |
      |---|---|
      | new:tim-01 | TIM の要件単位は REQ 文書全体ではなく、個別の要件行（`REQ-{NNNN}-{MMM}`）とすること |
      | new:tim-02 | TIM の標準コア関係は、成果物が要件へ明示的に対応する対応関係（covers）のみとすること |
      | new:tim-03 | 要件へ対応する成果物の役割は、design、implementation、verification の3種を標準とすること |
      | new:tim-04 | 各現行要件について、その要件を実現する実装成果物が1件以上明示的に対応付けられていること |
      | new:tim-05 | 各現行要件について、その要件を検証する検証手段が1件以上明示的に対応付けられていること |
      | new:tim-06 | 要件と Design 文書の対応付けは任意とし、対応する Design 文書が存在しない要件を許容すること |
      | new:tim-07 | 実装成果物および検証手段は要件へ直接対応付けること。Design 文書との対応関係を経由して、要件に対する実装または検証が成立したものと推定しないこと |
      | new:tim-08 | 1つの成果物が複数の要件へ対応できること。1つの成果物が複数の役割を持てること |
      | new:tim-09 | implementation はソースコードという物理種別ではなく、要件を実現する永続成果物の役割として扱うこと |
      | new:tim-10 | verification は要件を検証する永続的な検証手段を表すこと。個々の検証実行結果を TIM に保持しないこと |
      | new:tim-11 | Decision は ADF の正式文書として維持するが、最小 TIM の標準成果物型に含めないこと |
      | new:tim-12 | 一般的な文書参照、Markdown リンク、言及を、TIM の意味的なトレース関係として扱わないこと |
      | new:tim-13 | 関係ごとの変更影響方向を TIM の正規データとして保持しないこと |
      | new:tim-14 | 分解、具体化、依存、実現、実装、検証などの多数の関係型を、標準 TIM へ持ち込まないこと |
      | new:tim-15 | 任意の成果物型や関係型を追加する汎用拡張機構を、最小 TIM の必須機能としないこと |
      | new:tim-16 | TIM は派生索引、グラフDB、物理保存形式を規定しないこと |
      | new:tim-17 | coverage / covers は機械識別子または外部標準との対応説明で使用できるが、日本語本文の正式用語は「対応関係」「対応付け」とすること |
      | new:tim-18 | トレーサビリティ標準機能の配布スキル名は `agentdev-traceability` とし、artifact-graph を新しい標準機能名として引き継がないこと |
      | new:tim-19 | 標準公開能力は coverage、impact、check を基本とすること |
      | new:tim-20 | coverage は、要件を指定して対応する Design 文書、実装成果物、検証手段を取得でき、成果物を指定してその成果物が対応する要件を取得できること。明示された対応関係を全件返し、候補数上限、ランキング、探索深度によって黙って切り捨てないこと |
      | new:tim-21 | impact は、要件を起点に当該要件へ明示的に対応する成果物を、成果物を起点にその成果物が対応する要件を経由して同じ要件へ対応する他の成果物を、変更時の再確認候補として取得できること。任意深度のグラフ探索を行わず、成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索せず、impact の空結果を「影響なし」の証明として扱わないこと |
      | new:tim-22 | check は、少なくとも不正な対応宣言、未知の成果物役割、存在しない要件への参照、実装対応の欠落、検証対応の欠落、対応宣言の根拠箇所を取得できない状態を決定的に検査できること |
      | new:tim-23 | 標準実装は正規成果物を直接走査し、対応関係をその場で解決できること。`.agentdev/graph/` のような派生 Graph を標準動作の必須入力または必須生成物とせず、派生索引の鮮度判定、再生成、生成バージョン、設定ダイジェスト等を必須契約としないこと |
      | new:tim-24 | neighbors、path、provenance、related、dependency、implementation、diagnostics の旧公開動作との互換性を必須としないこと。一般文書探索、任意経路探索、構造診断、依存関係探索を agentdev-traceability の責務へ取り込まないこと。OpenFastTrace、Eclipse Capra、専用グラフDBを標準実行依存として導入しないこと。性能について数値の受け入れ基準を設けないこと |
      | new:tim-25 | 将来、直接走査が実運用上の問題として観測された場合、coverage、impact、check の外部契約を変えずにキャッシュまたは索引を追加できる構造とすること。対応宣言の具体的な表記は Design で確定し、要件では文字列形式を固定しないこと。旧 Artifact Graph の互換層、移行専用の恒久例外台帳、旧要件だけを除外する legacy モードを移行完了後に残さないこと |

      ## 適用範囲

      **対象**: 最小 TIM（要件行単位、covers、design/implementation/verification の3役割、対応関係の完全性規則、用語政策）、agentdev-traceability 標準配布スキル（coverage、impact、check、正規成果物の直接走査、対応宣言の解析・検査）、旧機能撤去の最終状態（互換層なし、恒久例外台帳なし、legacy モードなし）

      **対象外**: ADF ワークフロー統合の工程割り当て（REQ-021）、一般文書探索、任意経路探索、構造診断、依存関係探索、意味類似検索、ソースコード依存解析、実行順序やワークフロー依存の表現、Decision の理由探索、個々の検証実行結果の保存、グラフDB、派生索引とその鮮度管理、OpenFastTrace 等の本番依存化、性能の数値基準、LLM による対応関係の自動確定、既存要件の棚卸し移行作業の実行計画（case-open が決定）

      ## 関連情報

      **関連 REQ**: REQ-002（配布成果物の責務境界）、REQ-008（一時成果物ライフサイクル）、REQ-021（トレーサビリティのワークフロー統合）、REQ-020（廃止。解析品質・試験設計として必要な内容は後継 Design またはテストへ移行）、REQ-040（廃止。coverage、impact、check の外部能力は本 REQ へ統合）
      **関連 Decision**: DEC-017（最小トレーサビリティモデルの採用と Artifact Graph の廃止）、DEC-007（置換済み）、DEC-019（一般処理の標準API委譲とADF固有意味論の所有境界）

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-020.md
    source_items: [AG-005]
    content: |
      # 指示: frontmatter へ status: retired を追記し、updated を "2026-08-21" へ変更する。frontmatter 終了直後（## 目的 の前）へ以下の履歴注記 quote ブロックを挿入する。

      > 履歴注記（RETIRE、status: retired、2026-08-21）:
      >
      > - 後継: REQ-012（成果物トレーサビリティ）。解析スクリプトの対応 YAML 構造の明示と未対応構造の診断に相当する品質保証は、後継スキル `agentdev-traceability` の Design（対応宣言の解析仕様）と test strategy が所有する
      > - 理由: 最小トレーサビリティモデルへの再設計（RU-0001〜RU-0004、DEC-017 再構成）により、Artifact Graph の解析品質・代表質問回帰検証の体系は旧機能とともに廃止する。必要な検証は後継の test strategy へ統合した

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-003, AG-005, AG-007]
    content: |
      # 指示: frontmatter は id: REQ-021、title: "トレーサビリティのワークフロー統合"、created: "2026-08-10"、updated: "2026-08-21" とする。
      # 本文全体を以下の変更後全文へ置換する。要件行 ID の new:wfi-NN は req-save が採番した REQ-021-{MMM}（現行 max+1 連番）へ置換する。

      ## 目的

      AgentDevFlow の各ワークフロー工程が、最小 TIM に基づくトレーサビリティ能力（`agentdev-traceability` の coverage、impact、check）を既存の責務境界の内で利用・作成・検査する割り当てを定める。対応関係を作成する工程と検査する工程を分離し、トレーサビリティ情報だけで変更対象、正規所有者、対象範囲を確定しない。本 REQ はワークフロー統合の割り当てのみを所有し、TIM の定義とトレーサビリティ機能の公開契約は REQ-012 が所有する（DEC-017）。

      ## 要件

      | ID | 要件 |
      |---|---|
      | new:wfi-01 | req-define は、既存の明示的な対応関係と impact を変更影響候補の確認に利用できること。トレーサビリティ情報だけで変更対象、正規所有者、対象範囲を確定せず、impact の空結果を「影響なし」の根拠とせず、将来作成される実装成果物または検証手段との対応関係を推測して正規情報として保存しないこと |
      | new:wfi-02 | req-save は正式な要件IDの保存を担当し、実装対応または検証対応を作成する責務を持たないこと。新規要件の保存時点で実装対応または検証対応が存在しないことを理由に req-save を失敗させないこと |
      | new:wfi-03 | design-save は、req-define で Design action と対象要件の対応が明示的に確定している場合、その情報を利用して Design 文書と要件の対応関係を保存できること。Design 本文の自由記述から対象要件を再推論して正規の対応関係を生成せず、Design action が存在しない要件の処理を妨げないこと |
      | new:wfi-04 | case-open は、上流工程で確定した対象要件と実行契約を Issue へ引き継ぐこと。req-define と重複して一般的な変更影響探索や依存関係探索を行い、対象範囲を再決定しないこと |
      | new:wfi-05 | case-run の実行担当は、実際に要件を実現する成果物へ実装対応を明示し、実際に要件を検証する永続的な検証手段へ検証対応を明示すること。単に変更されたファイルであることを理由に、そのファイルを要件へ自動的に対応付けないこと |
      | new:wfi-06 | case-run の実行担当は PR 作成前に対象要件について check を実行し、実装対応、検証対応、対応宣言の整合性を検査すること。check の不合格が承認済み対象範囲内で修正可能な場合、修正して再検証すること |
      | new:wfi-07 | check の不合格を解消するために要件変更、対象範囲拡大、追加設計判断、外部依存解消が必要な場合、case-run の実行担当は反復を停止し、blocked として必要な判断事項を報告すること |
      | new:wfi-08 | case-close は QG-4 の一部として、対象要件の実装対応と検証対応の完全性を正規成果物から独立して再検査すること。対象要件に実装対応または検証対応の欠落が残る場合、マージせず停止し、不足する対応関係を自動追加または修正せず、検査失敗を case-run 側の修正対象として差し戻せること |
      | new:wfi-09 | TIM は「何が要件を検証するか」という検証手段との対応関係を保持し、Issue、PR、QG は「今回その検証を実行して合格したか」という実行結果を扱うこと。特定時点の検証結果を TIM の恒久的な対応関係として保存しないこと |
      | new:wfi-10 | 中断後の再実行でも、正規成果物に保存済みの対応関係を再利用し、同じ対応宣言を重複生成しないこと |
      | new:wfi-11 | inspect-docs、inspect-skills、backlog-review、agentdev-adversarial-review、agentdev-doc-diagnostics は、agentdev-traceability の coverage、impact、check を一般文書探索、構造診断、依存関係探索の用途に利用しないこと。これらの工程の候補探索は、README 索引、正規成果物の直接読取、rg 等の独立探索手段によって行うこと |
      | new:wfi-12 | agentdev-traceability の実行失敗だけを理由として ADF 標準ワークフローを恒常停止させないこと。正規成果物そのものの異常と、トレーサビリティ機能側の異常を区別すること |

      ## 適用範囲

      **対象**: req-define、req-save、design-save、case-open、case-run、case-close / QG-4 のトレーサビリティ能力の利用・作成・検査の割り当て、検証手段と検証実行結果の分離、診断・レビュー系コマンド（inspect-docs、inspect-skills、backlog-review、agentdev-adversarial-review、agentdev-doc-diagnostics）の旧 Artifact Graph 利用の除去と独立探索手段への切替

      **対象外**: TIM の定義と agentdev-traceability の公開契約（REQ-012）、case-open への新しい対象範囲決定権の追加、case-run 本体への意味判断の追加、case-close による自動修正、変更ファイルからの対応関係自動推定、LLM による恒久的な対応関係の自動確定、個々の検証結果を TIM へ保存する仕組み、check 呼出位置や対応宣言の内部データ形式の設計（Design）

      ## 関連情報

      **関連 REQ**: REQ-012（成果物トレーサビリティ）、REQ-017（Issue Execution Contract）、REQ-020（廃止）、REQ-040（廃止）
      **関連 Decision**: DEC-017（最小トレーサビリティモデルの採用と Artifact Graph の廃止）、DEC-007（置換済み）、DEC-019（一般処理の標準API委譲とADF固有意味論の所有境界）

  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-040.md
    source_items: [AG-005]
    content: |
      # 指示: frontmatter へ status: retired を追記し、updated を "2026-08-21" へ変更する。frontmatter 終了直後（## 目的 の前）へ以下の履歴注記 quote ブロックを挿入する。

      > 履歴注記（RETIRE、status: retired、2026-08-21）:
      >
      > - 後継: REQ-012（成果物トレーサビリティ）。旧 高位問い合わせ5種（related、impact、dependency、implementation、diagnostics）のうち業務に必要な能力は、agentdev-traceability の coverage、impact、check として REQ-012 が統合所有する。related・diagnostics 系の問い合わせは後継外とし、README 索引、正規成果物の直接読取、rg 等の独立探索手段で代替する
      > - 理由: 最小トレーサビリティモデルへの再設計（RU-0001〜RU-0004、DEC-017 再構成）により、TIM 派生索引を前提とする問い合わせプロファイル層を廃止する

  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-017.md
    source_items: [AG-001, AG-002, AG-004, AG-006]
    content: |
      # 指示: DEC-017 を以下の変更後全文へ全面再構成する（status は proposed を維持）。

      ---
      id: DEC-017
      title: "最小トレーサビリティモデルの採用と Artifact Graph の廃止"
      status: proposed
      created: "2026-08-17"
      updated: "2026-08-21"
      ---

      # DEC-017: 最小トレーサビリティモデルの採用と Artifact Graph の廃止

      ## 背景

      現行 Artifact Graph は、汎用ノード・関係モデル、派生索引、根拠情報、拡張定義、鮮度管理、複数の問い合わせ種別を持つ。運用の結果、仕様駆動開発で本当に必要なのは、各要件について実装成果物と検証手段を明示的に対応付け、対応漏れと不整合を検査できることであり、汎用グラフ機能の大半は不要であると確認された。SysML、OSLC、OpenFastTrace 等を概念参照元としてトレーサビリティをゼロベースで再検討した。OpenFastTrace は概念・検査方法の参照実装として有用だが、Java 実行環境等の適合コストから標準実行依存とはしない。Eclipse Capra、専用グラフDBも今回の最小機能に対して過大である。

      ## 決定

      1. Traceability Information Model（TIM）を、汎用成果物グラフではなく、要件を中心とした最小の対応モデルとして採用する。要件単位は個別の要件行（REQ-xxx-nnn）とし、標準コア関係は成果物が要件へ明示的に対応する covers（対応関係）のみとする。成果物の役割は design、implementation、verification の3種を標準とし、各現行要件へ実装成果物と検証手段を各1件以上直接対応付ける。Design 対応は任意、Decision は標準成果物型に含めない。
      2. 派生索引を前提としない。標準実装は正規成果物を直接走査して対応関係をその場で解決する。`.agentdev/graph/` の生成・鮮度管理を標準動作に含めない。将来、直接走査が実運用上の問題として観測された場合のみ、外部契約を変えずにキャッシュまたは索引を追加する。
      3. 標準配布スキル `agentdev-artifact-graph` を廃止し、後継標準機能 `agentdev-traceability`（coverage、impact、check）へ置換する。旧公開API（neighbors、path、provenance、related、dependency、implementation、diagnostics）との互換層、移行専用の恒久例外台帳、legacy モードを設けない。
      4. 移行は段階的に行う。最小 TIM の確定と agentdev-traceability の基礎機能の利用可能化を先行し、旧 Artifact Graph は移行期間中のみ既存要件の対応候補探索の補助手段として利用を許す。旧 Graph の結果だけから対応関係を正規情報として自動確定しない。全現行要件の実装対応・検証対応が成立し check の未解決不合格が0件となった後に case-close / QG-4 の強制検査を有効化し、旧スキル、設定、生成処理、派生生成物、旧公開APIを撤去する。blocked または未検証項目が残る場合は移行完了と判定しない。
      5. 日本語本文の正式用語は「対応関係」「対応付け」を用いる。coverage / covers は機械識別子または外部標準との対応説明に限定する。

      ## 結果、影響

      - REQ-012 は「成果物トレーサビリティ」として全面更新され、REQ-040 の coverage、impact、check 相当の外部能力を統合所有する。REQ-021 はワークフロー統合の割り当てのみへ縮小され、REQ-020 は廃止される
      - DEC-007（Artifact Graph 標準化と配布スキル昇格）は本 Decision が承認された時点で置換済み（superseded）となる。配布スキル地位、open extensibility、augmentation、派生索引の決定論性、verification feedback は廃止する
      - 汎用文書探索、任意経路探索、構造診断、依存関係探索はトレーサビリティ機能の責務外とする。利用工程は README 索引、正規成果物の直接読取、rg 等の独立探索手段を用いる
      - 性能の数値受け入れ基準を設けない。性能問題が観測された場合の対応は決定2のとおり

      ## 関連する決定

      - supersedes: DEC-007（Artifact Graph 標準化と配布スキル昇格）。本 Decision 承認時に置換済みとする
      - relates-to DEC-009: Decision は正式文書として維持するが、TIM の標準成果物型には含めない
      - relates-to DEC-019: 一般処理の標準API委譲の原則は維持する。agentdev-artifact-graph 固有の参照は後継機能へ追従させる
      - relates-to DEC-002: 後継スキル `agentdev-traceability` の原本は src/opencode/ へ配置する

  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-007.md
    source_items: [AG-006]
    content: |
      # 指示: frontmatter の status を accepted から superseded へ変更し、updated を "2026-08-21" へ変更する。
      # frontmatter 終了直後（# DEC-007 見出しの前）へ以下の置換注記 quote ブロックを挿入する。

      > 置換注記（SUPERSEDED、2026-08-21）:
      >
      > - 本 Decision は DEC-017（最小トレーサビリティモデルの採用と Artifact Graph の廃止）により置換される。Artifact Graph を標準探索モデルとする決定は並立しない
      > - 標準配布スキルの地位は `agentdev-traceability` が引き継ぐ。open extensibility、augmentation 分離、派生索引の決定論性、verification feedback は廃止する。fail-open の趣旨（基盤障害だけでワークフローを恒常停止させない）は後継の REQ-012・REQ-021 が維持する

  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: traceability-model
    target_area: "# Traceability Information Model（TIM）語彙カタログ（文書全体を置換）"
    source_items: [AG-001, AG-008]
    content: |
      # 指示: frontmatter を title: 最小トレーサビリティモデル（TIM）、status: draft、created: "2026-08-17"、updated: "2026-08-21" へ変更し、本文全体を以下へ置換する。

      ## 目的

      要件を中心とした最小のトレーサビリティ対応モデル（TIM）の概念定義を正規所有する。REQ-012 が要件契約を、本 Design がモデル要素の定義と用語政策の実体を所管する。対応宣言の表記と coverage、impact、check の実行契約は skills/agentdev-traceability.md が所管する。

      ## モデル要素

      | 要素 | 定義 |
      |---|---|
      | 要件行（requirement line） | TIM の要件単位。`REQ-{NNNN}-{MMM}` 形式の個別要件行 |
      | 対応関係（covers） | 成果物が要件へ明示的に対応する、TIM の標準コア関係 |
      | 成果物役割（artifact role） | design、implementation、verification の3種 |
      | 実装対応 | implementation 役割の対応関係。要件を実現する永続成果物が保持する |
      | 検証対応 | verification 役割の対応関係。要件を検証する永続的な検証手段が保持する |
      | Design 対応 | design 役割の対応関係。任意であり、欠けても不完全と判定しない |

      規則:

      - 実装対応・検証対応は要件へ直接対応付け、Design 対応を経由して実装または検証が成立したものと推定しない（推移阻止）
      - 1つの成果物が複数の要件へ対応でき、複数の役割を持てる
      - implementation は永続成果物の役割であり、ソースコードという物理種別を前提しない
      - verification は永続的な検証手段の役割であり、個々の検証実行結果は TIM に保持しない
      - Decision、一般的文書参照、Markdown リンク、言及は、TIM の標準成果物型・意味的関係に含めない

      ## 対応関係の完全性規則

      - 実装対応1件以上かつ検証対応1件以上で、対応関係の完全性を満たす
      - 実装対応0件は実装対応の欠落として個別に検出する
      - 検証対応0件は検証対応の欠落として個別に検出する
      - Design 対応0件のみを理由に不完全と判定しない
      - Design 対応のみが存在する要件を、実装済みまたは検証済みと判定しない

      ## 正規情報源と直接走査

      - 対応宣言の正規情報源は対応する成果物自身とし、中央台帳を新設しない
      - 成果物の所在はリポジトリ相対パスを基本とし、必要な場合のみファイル内位置を根拠として扱う
      - トレーサビリティ機能は正規成果物を直接走査して対応関係をその場で解決する。派生索引、グラフDB、物理保存形式を規定しない
      - 実装成果物および検証手段に専用の恒久IDを新設しない（要件行IDとリポジトリ相対パスで識別する）

      ## 用語政策

      - 日本語本文の正式用語は「対応関係」「対応付け」「実装対応」「検証対応」「Design 対応」を用いる
      - coverage / covers は機械識別子または外部標準（OpenFastTrace 等）との対応説明でのみ使用する
      - 影響方向カタログ、関係型カタログ、拡張関係、派生索引の鮮度管理等の旧語彙は本モデルで所有しない

      ## 対象外

      - 一般文書探索、任意経路探索、構造診断、依存関係探索（README 索引、正規成果物の直接読取、rg 等の独立探索手段が担う）
      - ADF ワークフロー統合の工程割り当て（REQ-021、各 command Design）
      - 対応宣言の文字列表記と解析仕様（skills/agentdev-traceability.md）

  - id: ACT-DESIGN-002
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: skills
      slug: agentdev-traceability
    source_items: [AG-002, AG-008]
    content: |
      # 指示: docs/designs/skills/agentdev-traceability.md を以下の本文で新規作成する（frontmatter: title: agentdev-traceability Design、status: draft、created: "2026-08-21"、updated: "2026-08-21"）。

      ## 目的

      標準配布スキル `agentdev-traceability` は、最小 TIM（foundations/traceability-model.md）に基づき、要件と成果物の明示的な対応関係について coverage、impact、check の3能力を提供する。正規成果物を直接走査し、対応関係をその場で解決する。旧 `agentdev-artifact-graph` の後継であり、旧公開APIとの互換層を持たない（REQ-012、DEC-017）。

      ## 適用対象

      **USE FOR**: coverage、impact、check の実行、対応宣言の解析と検査
      **DO NOT USE FOR**: 一般文書探索、任意経路探索、構造診断、依存関係探索、派生索引の生成・鮮度管理、対応関係の意味推定

      ## 対応宣言の表記（正規情報源）

      - 対応宣言は対応する成果物自身が保持し、中央台帳（traceability.yaml 等）を新設しない
      - 宣言形式: `ADF-COVERS(<role>): <REQ-ID>{, <REQ-ID>}*`（role は design / implementation / verification、REQ-ID は `REQ-{NNNN}-{MMM}` 形式の要件行ID）
      - 宣言は各ファイル種別のコメント記法（Markdown は HTML コメント、TypeScript は `//` 等）の内部に1行で記述する。マーカー文字列 `ADF-COVERS(...)` 自体はファイル種別に依存しない
      - 1ファイルに複数の宣言行を含められる。解析結果は和集合とする
      - 解析は行単位のパターン照合で行い、意味推定を行わない。存在しない要件IDへの参照は check が検出する

      ## 公開能力

      ### coverage

      - 要件起点: 対応する Design 文書、実装成果物、検証手段を役割付きで返す
      - 成果物起点: 当該成果物が対応する要件を返す
      - 明示された対応関係を全件返し、候補数上限、ランキング、探索深度によって黙って切り捨てない

      ### impact

      - 要件起点: 当該要件へ明示的に対応する成果物を変更時の再確認候補として返す
      - 成果物起点: 当該成果物が対応する要件を経由して、同じ要件へ対応する他成果物を再確認候補として返す
      - 成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索しない（任意深度のグラフ探索を行わない）
      - 空結果を「影響なし」の証明として扱わない。空結果である旨を明示して返す

      ### check

      次を決定的に検査する。検査結果は項目ごとに pass / fail（欠落種別、対象要件、対象成果物付き）で返す。

      - 不正な対応宣言（形式・構文違反）
      - 未知の成果物役割
      - 存在しない要件への参照
      - 実装対応の欠落（現行要件で0件）
      - 検証対応の欠落（現行要件で0件）
      - 対応宣言の根拠箇所を取得できない状態（ファイル不在・読取不能）

      ## 実装構成

      - 標準実装は正規成果物（docs/requirements/、docs/designs/、実装・検証成果物）を直接走査する。`.agentdev/graph/` 等の派生 Graph を必須入力・必須生成物としない
      - 現行 Artifact Graph のファイル探索、Markdown 解析、要件ID解決、存在確認等の実装資産は、本 Design に適合する場合のみ再利用する（graph 生成、鮮度管理、拡張機構は再利用しない）
      - 将来、直接走査が実運用上の問題として観測された場合、coverage、impact、check の外部契約を変えずにキャッシュまたは索引を追加できる構造とする
      - OpenFastTrace、Eclipse Capra、専用グラフDBを標準実行依存として導入しない

      ## 対象外

      - 旧公開API（neighbors、path、provenance、related、dependency、implementation、diagnostics）の互換層
      - ワークフロー統合の工程割り当て（REQ-021、各 command Design）
      - 性能の数値基準（受け入れ基準を設けない）

conflict_resolutions:
  - id: CR-001
    conflict: |
      スキル置換・移行方針（agentdev-artifact-graph の標準配布スキル地位の終結と agentdev-traceability への置換、互換層なし・legacy モードなし、移行期間のみ旧 Graph を候補探索に利用し全要件対応付け完了後に撤去）の Decision 所有先が、RU-0004 要件16の DEC-017 再構成項目列挙（最小 TIM・要件中心対応モデル・Graph 非必須・直接走査）に含まれていなかった。DEC-007 が現に所有する「標準配布スキル」地位の決定を置換する主体が未決だった。
    resolution: |
      再構成 DEC-017 へ集約して所有する（新規 Decision を分離しない）。根拠: RU-0004 要件18が新 DEC-017 を DEC-007 の置換主体として明示的に指定しており、DEC-007 supersede の受け皿として DEC-017 が決定3（スキル置換）・決定4（移行方針）を所有する構造が自然である。アーキテクチャ助言（agentdev-architecture-advisory 経路）も (i) 再構成 DEC-017 への集約を推奨した。ACT-DEC-001 の決定3・4として反映済み。
  - id: CR-002
    conflict: |
      inspect-docs、inspect-skills、backlog-review、agentdev-adversarial-review、agentdev-doc-diagnostics が現状 Artifact Graph から得ている構造診断候補・関係候補の探索能力は、最小 TIM（coverage、impact、check）では代替されない（RU-0002 要件14・15で後継外）。RU-0003 の工程列挙にこれらの診断・レビュー系コマンドが含まれず、能力喪失の扱いが未確定だった。
    resolution: |
      能力喪失を受け入れ、独立探索手段へ切替する。これらの工程の候補探索は README 索引、正規成果物の直接読取、rg 等の独立探索手段によって行う。根拠: RU-0002 要件15（構造診断等は後継の責務外）と RU-0004 要件9（旧利用箇所を agentdev-traceability または本来の正規所有機能へ切替）の合意済み内容から直接導出される。AG-007 および REQ-021 の要件行（new:wfi-11）として正文化し、5 Design の「Artifact Graph 利用」節削除を AG-008 (4) に含めた。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-012
    target_design:
      operation: update
      domain: foundations
      slug: traceability-model
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-012]
      source_ru_to_req: {RU-0001: REQ-012}
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-012
    target_design:
      operation: create
      domain: skills
      slug: agentdev-traceability
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs: [REQ-012]
      source_ru_to_req: {RU-0002: REQ-012}
  - ou_id: OU-003
    source_ru: RU-0003
    target_req: REQ-021
    operation: update
    scale: large
    depends_on: [OU-001, OU-002]
    recommended_order: 3
    issue_policy: single
    result:
      saved_req_docs: [REQ-021]
      source_ru_to_req: {RU-0003: REQ-021}
  - ou_id: OU-004
    source_ru: RU-0004
    target_req: REQ-012
    operation: update
    scale: large
    depends_on: [OU-001, OU-002, OU-003]
    recommended_order: 4
    issue_policy: single
    result:
      saved_req_docs: [REQ-012]
      source_ru_to_req: {RU-0004: REQ-012}

req_save_result:
  saved_req_docs: [REQ-012, REQ-021]
  retired_req_docs: [REQ-020, REQ-040]
  updated_decisions: [DEC-017, DEC-007]
  artifact_action_results:
    ACT-REQ-001: "applied: REQ-012 update（要件行 REQ-012-026〜REQ-012-050 採番）"
    ACT-REQ-002: "applied: REQ-020 retire（status: retired、履歴注記挿入、retired/ へ移管）"
    ACT-REQ-003: "applied: REQ-021 update（要件行 REQ-021-011〜REQ-021-022 採番）"
    ACT-REQ-004: "applied: REQ-040 retire（status: retired、履歴注記挿入、retired/ へ移管）"
    ACT-DEC-001: "applied: DEC-017 全面再構成（status: proposed 維持）"
    ACT-DEC-002: "applied: DEC-007 superseded（置換注記挿入）"
  source_ru_to_req_operations:
    RU-0001: "REQ-012 update"
    RU-0002: "REQ-012 update"
    RU-0003: "REQ-021 update"
    RU-0004: "REQ-012 update + REQ-020/REQ-040 retire + DEC-017 再構成/DEC-007 superseded"

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-save 実行後、docs/requirements/REQ-012.md を読み、要件行（REQ-012-0NN〜）と RU-0001 要件3.1〜3.18（RU 本文「3. 要件」の18項目）を対比する。完全性規則（実装対応・検証対応の各1件以上）、推移阻止、Design 対応の任意性、Decision の標準成果物型除外、用語政策（「対応関係」「対応付け」）が反映されていることを確認する。
    pass_criteria: |
      RU-0001 の全要件の意図が要件行として網羅されており、日本語本文で coverage の直訳語を正式用語として使用していない。
    on_failure: |
      fix-and-reverify。draft の ACT-REQ-001 content を修正して req-save を再実行する（req-save 側で本文を生成・補完しないため、修正は必ず draft 側で行う）。
  - id: TS-002
    target_item: AG-002
    verification: |
      design-save 実行後、docs/designs/skills/agentdev-traceability.md を読み、coverage・impact・check の公開契約、全件返却・黙った切り捨て禁止、探索範囲の上限（成果物 ↔ 要件 ↔ 成果物）、直接走査、旧公開API互換の非要求を RU-0002 要件1〜19 と対比する。
    pass_criteria: |
      RU-0002 の公開能力要件（coverage/impact/check）と実装方針（直接走査、派生索引非必須、外部依存なし）が Design に反映されている。
    on_failure: |
      fix-and-reverify。draft の ACT-DESIGN-002 content を修正して design-save を再実行する。
  - id: TS-003
    target_item: AG-003
    verification: |
      req-save 実行後、docs/requirements/REQ-021.md を読み、工程別の割り当て（req-define/req-save/design-save/case-open/case-run/case-close・QG-4）、blocked 判定、独立再検査、検証手段と検証実行結果の分離、重複宣言防止を RU-0003 の工程別要件（1〜24）と対比する。
    pass_criteria: |
      RU-0003 の全工程要件が REQ-021 の要件行へ網羅されており、REQ-012 との責務境界（公開契約は REQ-012、割り当ては REQ-021）が明示されている。
    on_failure: |
      fix-and-reverify。draft の ACT-REQ-003 content を修正して req-save を再実行する。
  - id: TS-004
    target_item: AG-004
    verification: |
      OU-004 の移行 Case 完了時に、(1) 全現行要件について check を実行し pass/fail/blocked を要件ごとに記録する。(2) リポジトリ全体を rg で探索し、agentdev-artifact-graph、.agentdev/graph/、.agentdev/artifact-graph.yaml、旧公開APIの実行時参照が0件であることを確認する。(3) 移行完了判定時に blocked・未検証項目が残っていないことを確認する。
    pass_criteria: |
      RU-0004 の受け入れ条件 AC-001〜AC-013 が全て pass である（性能は not applicable）。未解決 fail・blocked が残る状態で移行完了と判定していない。
    on_failure: |
      fix-and-reverify。対応付け欠落は正規成果物側へ対応を保存して再検査する。撤去漏れは除去して再探索する。要件変更・対象範囲拡大が必要な場合は blocked として判断事項を報告する（自動補完しない）。
  - id: TS-005
    target_item: AG-005
    verification: |
      req-save 実行後、docs/requirements/REQ-020.md と docs/requirements/REQ-040.md が履歴注記（RETIRE）付きで retired/ へ移管され、docs/requirements/README.md の現行表から除去され廃止済み表へ登録されていることを確認する。REQ-012 が coverage・impact・check を統合所有していることを REQ-012 本文で確認する。
    pass_criteria: |
      REQ-020・REQ-040 が独立 REQ としての現行責務を持たず、必要能力の移管先が履歴注記に明記されている。インデックスと実ファイルが一致している。
    on_failure: |
      fix-and-reverify。draft の ACT-REQ-002・ACT-REQ-004 content を修正して req-save を再実行する。
  - id: TS-006
    target_item: AG-006
    verification: |
      req-save 実行後、docs/decisions/DEC-017.md が再構成版の全文（スキル置換・移行方針を決定3・4として所有）になっており、docs/decisions/DEC-007.md の status が superseded で置換注記が付いていることを確認する。docs/decisions/README.md の Decision Map・関連 REQ 表が更新されていることを確認する。
    pass_criteria: |
      再構成 DEC-017 が最小 TIM・直接走査・スキル置換・移行方針を所有し、DEC-007 と新 DEC-017 が現行決定として並立していない（RU-0004 AC-011 相当）。
    on_failure: |
      fix-and-reverify。draft の ACT-DEC-001・ACT-DEC-002 content を修正して req-save を再実行する。
  - id: TS-007
    target_item: AG-007
    verification: |
      OU-003 の Case 完了時に、agentdev-doc-diagnostics、inspect-docs、inspect-skills、backlog-review、agentdev-adversarial-review の各 Design について「Artifact Graph」節が削除され、README 索引・正規成果物の直接読取・rg 等の独立探索手段への切替が記述されていることを確認する。
    pass_criteria: |
      5 Design のいずれにも agentdev-traceability を一般文書探索・構造診断・依存関係探索へ利用する記述が残っていない。
    on_failure: |
      fix-and-reverify。該当 Design の該当節を修正して Case を再実行する。
  - id: TS-008
    target_item: AG-008
    verification: |
      design-save 実行後、docs/designs/foundations/traceability-model.md が最小 TIM 版へ置換され、docs/designs/skills/agentdev-traceability.md が新規作成され、docs/designs/README.md の基盤 Design 一覧・skill Design 一覧へ登録されていることを確認する。
    pass_criteria: |
      2 Design が保存され、インデックス登録が実ファイルと一致している。旧語彙カタログの内容（関係型カタログ、影響方向、拡張関係）が最小 TIM 版に残っていない。
    on_failure: |
      fix-and-reverify。draft の ACT-DESIGN-001・ACT-DESIGN-002 content を修正して design-save を再実行する。

review_dispositions: []

case_open_hints:
  epic_needed: true
  decomposition: |
    OU-001〜OU-003 は depends_on チェーンどおり単一 Issue として順次実行する。OU-004（既存要件の対応付け移行と旧 Artifact Graph 撤去）は分割候補: (a) 全現行要件の棚卸し・対応付け保存（37 REQ 規模、RU-0004 作業仮定どおり移行専用 Case として分割実行可）、(b) check 全件検証と QG-4 強制検査の有効化、(c) 旧スキル・設定・派生生成物・旧公開APIの撤去と依存除去検証。棚卸しの処理単位分割は case-open の実行計画が決定する（RU-0004 未決事項）。
  wave_hints:
    - OU-001 → OU-002 → OU-003 は厳密な逐次依存（最小 TIM の確定 → 基礎機能の利用可能化 → ワークフロー統合）。並列化しない
    - OU-004 は OU-003 完了後のみ開始可能。棚卸し (a) は要件単位で並列化できる
    - DEC-019（標準API委譲）の agentdev-artifact-graph scripts を対象とする移行 Case が未実行の場合、OU-004 の撤去 (c) より前に完了または再設定すること（撤去による対象消滅を防ぐ順序制約）
    - 移行完了（check 全件 pass）までは旧 Artifact Graph を候補探索の補助手段として利用できる。QG-4 強制検査の有効化は棚卸し完了後
```

# summary

AgentDevFlow のトレーサビリティ体系を、Artifact Graph（汎用グラフ・派生索引）から要件中心の最小 TIM（要件行単位、covers、design/implementation/verification の3役割、実装対応・検証対応の完全性規則）へ再定義する。標準機能は agentdev-traceability（coverage、impact、check、正規成果物の直接走査）へ再構成し、ADF ワークフロー各工程（req-define、req-save、design-save、case-open、case-run、case-close/QG-4）へ統合する。全現行要件への対応付け移行を完了した後、旧 Artifact Graph を互換層なし・legacy モードなしで撤去する。RU-0001〜RU-0004 を単一要件doc・4 OU 構成（OU-001 モデル → OU-002 機能 → OU-003 ワークフロー統合 → OU-004 移行と撤去）として統合した。通常Case（feature / large、main ブランチ）。スキル置換・移行方針は再構成 DEC-017 が所有する（CR-001）。診断・レビュー系コマンドの候補探索は独立探索手段へ切替える（CR-002）。
