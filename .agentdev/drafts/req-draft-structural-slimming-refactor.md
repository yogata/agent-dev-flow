---
draft_type: req_draft
topic_slug: structural-slimming-refactor
status: draft
created_at: "2026-11-20T13:46:38Z"
source_rus: [RU-0304]
---

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  構造スリム化リファクタリング（Phase 1〜4 一括実行、RU-0304 由来）。trusted-distribution-gate の過剰防御の解体（試験29→6〜8・敵対的バイパス検知層撤去・text-binary 統合）、traceability 試験の再編（14→3・tim 圧縮）、巨大設計書3件のスリム化（責務重複解消含む）、generate_indexes.ts 分割（出力バイト一致）と agentdev-inspect-skills 判定・インデックス最新化。外部契約（IR-058/059 実行契約・CLI 引数・配布境界検査基本機能）維持を境界とする。準拠は DEC-067・IR-075、アンカーは REQ-122（Phase 1・4）・REQ-117（Phase 2・3）。AC-1〜AC-6 を REQ-123-001〜006 と適用範囲（対象外）へ反映する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      Phase 1（trusted-distribution-gate の解体）: 外部契約（ir-058/059 のエクスポート・CLI 引数）の棚卸しを先頭に実施し、破壊してはならない公開API面を確定する。敵対的バイパス検知層3モジュールを撤去し、決定論的スキャンの最小ロジックを distribution-boundary-detector.ts / boundary-pipeline.ts へ集約する（外部参照なしは監督実測済み・実行時に再確認）。過剰防御試験4ファイルを削除し、text-binary を単一モジュールへ統合し、試験を29→6〜8ファイルへ統合する。代表ケースの選定は実行側の裁量である。列挙の詳細は REQ-123-001。
  - id: AG-002
    content: |
      Phase 2（traceability 試験の再編）: 14ファイルを3ファイルへ統合して統合元をすべて削除する（統合先と残す観点は REQ-123-002 のとおり。サイドカー重複キー異常系を含む）。tim_declarations_contract.test.ts を TIM 契約破壊検知の最小構成（8,192バイト以下）へ圧縮する。削除・リネームした試験ファイル名への参照をすべて更新する。
  - id: AG-003
    content: |
      Phase 3（巨大設計書のスリム化）: system.md・document-model.md を各15〜20KB、runtime-package-boundary.md を15KB前後へ圧縮する（ハブ化・重複排除。必須仕様は移管完了後に削除）。runtime-package-boundary.md は Phase 1 の実態に合わせ廃止パーサ詳細と敵対的回避エッジケースを削除し、distribution-boundary.md との責務重複を解消し、配布パッケージの物理構造・同梱許可/禁止パス規則・インストール境界契約のみを残す。残す内容の詳細は REQ-123-003。
  - id: AG-004
    content: |
      Phase 4（大型スクリプト分割）: generate_indexes.ts（60,412バイト）を責務別モジュールと薄いCLI入口（scripts/generate_indexes.ts）へ分割する（モジュール構成は実行側の裁量）。使われなくなったインデックス種別向けのデッドコードがあれば削除し、generate_indexes.test.ts を代表ケースへスリム化し、分割前後で出力がバイト単位で一致することを確認する。
  - id: AG-005
    content: |
      Phase 4（残存資産の確認と最新化）: agentdev-inspect-skills をリポジトリ全体で検索し、実体スキル・内部参照の存在しない不要な残骸であれば Design と関連項目を削除・整合更新し、実利用されている場合は維持して維持理由と参照箇所を最終報告に明記する（判定は実行側の裁量、報告は義務）。generate_indexes.ts を実行し全自動生成README・カタログへ Phase 1〜4 の変更を反映する。
  - id: AG-006
    content: |
      実行規律と最終一括検証: Phase ごとに独立コミット（Conventional Commits）を作成し、Phase 終了ごとに該当範囲の試験・型検査・整合性検査を実行してから次へ進む（工程順序: Phase 3 は Phase 1 の実態を参照、Phase 4 が再生成と最終検証を担う）。開始条件は REQ-123 目的節のとおり。最終一括検証は REQ-123-005・TS-006 のとおり。
  - id: AG-007
    content: |
      判断の記録と禁止事項: 完了報告に agentdev-inspect-skills の扱い（削除根拠または維持理由と参照箇所）、意図的に残した試験・設計記述の根拠、コミット履歴（git log --oneline a0c0384..HEAD）、変更前後の定量比較表、検証結果サマリー、判断ログを含める（DEC-067 決定4）。禁止事項（NEVER 4項）は REQ-123 適用範囲（対象外）へ逐語反映する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:structural-slimming-refactor
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      ---
      id: REQ-123
      title: "構造スリム化リファクタリング（trusted-distribution-gate 過剰防御の解体・traceability 試験再編・巨大設計書スリム化・大型スクリプト分割）（6 作業単位）"
      created: "2026-11-20"
      updated: "2026-11-20"
      ---

      <!-- ADF-COVERS(design): REQ-123-001, REQ-123-002, REQ-123-003, REQ-123-004, REQ-123-005, REQ-123-006（実行義務 REQ の構造判断面。撤去・統合・分割・圧縮の構成判断は本 REQ の記録と実行時の付随的 Design 編集〔system・document-model・runtime-package-boundary・distribution-boundary 等〕で保持する。REQ-116 型の covers 宣言） -->

      ## 目的

      単一の領域・単一ファイルへの肥大化——配布境界ゲート70ファイル、traceability 試験14ファイル、50KB超の設計書3件、60KB超のスクリプト——を解消し、AIエージェントと人間の認知負荷（コンテキスト消費）を最小化する。準拠原則は DEC-067（仮説に基づく既存統制変更原則）・IR-075（単一ファイルの肥大化防止）。仮説: 撤去対象の敵対的バイパス検知・過剰な試験・重複記述は構造的冗長であり、外部契約（IR-058/IR-059 の実行契約・CLI 引数・配布境界検査の基本機能）を維持したまま削減しても実運用の不変条件は保たれる。問題が判明した場合は Git 履歴から旧実装を復元してロールバックする。削減の事実は結果として確認できるが、処理時間・品質・自律性への効果は未測定のため立証済みと扱わない（DEC-067 決定3）。Phase 1・4 の領域は REQ-122、Phase 2・3 の検査体系は REQ-117 を正規アンカーとする。検証資産の正本は src/common/skills/repo-agentdev-integrity/（.opencode/ 側は投影）。開始条件は git status がクリーンであり基準コミット（a0c0384）時点で既存試験が PASS することであり、開始時 HEAD が基準コミットから進んでいる場合は差分と対象ファイルの重なりを確認し、重なる場合は実行を開始せず監督へ停止報告する。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | REQ-123-001 | trusted-distribution-gate の過剰防御と重複モジュールを解体すること。rules/ir-058.ts・rules/ir-059.ts・scripts/・.githooks/ 等から参照されるエクスポート・CLI 引数の外部契約棚卸しを先頭で実施すること。敵対的バイパス検知層（boundary-url-authority.ts・boundary-url-parser.ts・boundary-reconstruction.ts）を撤去し、通常のファイルパス・Markdownリンク・URL文字列の決定論的スキャンに必要な最小ロジックを distribution-boundary-detector.ts / boundary-pipeline.ts 側へ集約すること（外部参照なしは実行時に再確認）。過剰防御だけを検証する試験4ファイル（boundary-pipeline-evasion・boundary-span-overflow・boundary-gate-bounds・boundary-parser-bounds の各 .test.ts）を削除し、text-binary.ts と distribution-boundary-text-binary.ts を単一モジュール（text-binary.ts）へ統合してインポート元をすべて更新し、試験を29ファイルからドメイン別6〜8ファイルへ統合すること（目安: distribution-boundary・archive-builder・manifest・launcher〔bootstrap-report は統合可〕・git-blob-reader の各 test.ts。launcher-extra・launcher-regression・launcher-blockers・protected-paths-complete は必須ケースを統合先へ移して削除。代表ケースの選定は実行側の裁量） | 試験ファイルが6〜8ファイル構成であり、撤去3モジュールと指定4試験ファイルが存在せず、text-binary の重複が解消されており、ir-058/ir-059・CLI 引数の公開API面が変更されていないこと。src 側 bun test（trusted-distribution-gate 配下）、bunx tsc --noEmit（trusted-distribution-gate の tsconfig）、cli.ts 実行がすべて PASS すること | TS-001 |
      | REQ-123-002 | traceability 試験を契約ベースで3ファイルへ再編し、統合元14ファイルをすべて削除すること。統合先と残す観点: traceability_core.test.ts（統合元: traceability_declarations / links / sidecar / sidecar_duplicate_key / derivation / inventory / reuse。宣言・リンク・サイドカー解析〔重複キー異常系含む〕・派生・インベントリの基本契約）、traceability_diff_and_policy.test.ts（統合元: check / policy / relied_diff / impact / coverage。差分影響判定・ポリシー違反検知・カバレッジ算出の代表正常系・異常系）、traceability_workflow.test.ts（統合元: integration / workflow_integration。ワークフロー横断の代表E2Eシナリオ）。tim_declarations_contract.test.ts は check_test_impact.ts や他の試験と重複する静的宣言ピン検証を削り、TIM 契約が壊れたことだけを検知する最小構成（8,192バイト以下）へ圧縮すること。削除・リネームした試験ファイル名が宣言ファイル・サイドカー・check_test_impact.ts・設計書から参照されている場合はすべて更新すること | traceability 関連の試験が3ファイル構成で統合元14ファイルが存在せず、tim_declarations_contract.test.ts が8,192バイト以下であること。src 側 bun test（scripts 配下）と check_test_impact.ts（既存の実行方法に従う）が PASS すること | TS-002 |
      | REQ-123-003 | 50KBを超える巨大設計書3件をスリム化すること（ハブ化と重複排除）。docs/designs/foundations/system.md（目標15〜20KB）は operating-model・responsibility-boundaries・runtime-execution-model・durable-state-and-recovery の各 Design に既述の詳細仕様を重複排除して明示的な相対リンクへ置換し、システム全体像・主要コンポーネント境界・不変条件サマリー・基礎設計書へのナビゲーション表を残すこと。docs/designs/foundations/document-model.md（目標15〜20KB）は document-type-responsibilities・artifact-contracts との重複を洗い出し、種別ごとの個別仕様を responsibilities/ 側へ片寄せ（欠けている必須仕様があれば移管してから削除）し、全ドキュメント共通のフロントマター規約・ライフサイクル状態遷移・ディレクトリ配置原則・正本と投影の原則を残すこと。docs/designs/local/runtime-package-boundary.md（目標15KB前後）は Phase 1 で簡素化した実態に合わせて廃止したパーサ詳細と敵対的回避のエッジケース記述を削除し、docs/designs/integrity/distribution-boundary.md との責務重複を解消し（帰属は DEC-014 と同 Design の帰属節による）、配布パッケージの物理構造・同梱許可/禁止パス規則・インストール境界契約のみを残すこと。文書契約（IR-070/067/044/062/064）を遵守し、見出し削除・統合に伴う節参照・リンク切れを grep と検査器で確認・修正すること。移管が必要な必須仕様は移管完了後に削除すること | system.md・document-model.md が各15〜20KB、runtime-package-boundary.md が15KB前後であること。check_knowledge_docs.ts と cli.ts が PASS し、IR-070/067/044/062/064 遵守と参照リンク切れなし（grep・検査器確認）が成立すること | TS-003 |
      | REQ-123-004 | 大型スクリプトの分割と廃止コマンド由来の残存資産の確認・インデックス最新化を行うこと。generate_indexes.ts（60,412バイト）を責務別モジュール（ファイル走査・メタデータ抽出、各インデックスのMarkdown生成、書き込み・鮮度比較）と薄いCLI入口（scripts/generate_indexes.ts）へ分割し（モジュール構成は実行側の裁量）、使われなくなったインデックス種別向けのデッドコードがあれば削除し、generate_indexes.test.ts を代表ケースへスリム化し、分割前後で出力がバイト単位で一致することを確認すること。リポジトリ全体を inspect-skills / agentdev-inspect-skills で検索し、残存資産が実体スキル・内部参照の存在しない不要な残骸であれば docs/designs/skills/agentdev-inspect-skills.md と関連項目（skill-projection-manifest.yaml・インデックス等）を削除・整合更新し、実利用されている場合は削除せず維持して維持理由と参照箇所を報告すること（判定は実行側の裁量、報告は義務）。generate_indexes.ts を実行し Phase 1〜4 の変更をすべての自動生成README・カタログへ反映すること | generate_indexes.ts が薄いCLI入口と lib 側モジュール群の構成であり分割前後の出力がバイト単位で一致していること。agentdev-inspect-skills の扱い（削除根拠または維持理由と参照箇所）が報告されていること。自動生成インデックスが最新化されていること | TS-004, TS-005 |
      | REQ-123-005 | Phase 1〜4 完了後の最終一括検証を通過させること。generate_indexes.ts 実行、check_autogen_freshness.ts、check_knowledge_docs.ts、cli.ts、bunx tsc --noEmit（scripts と trusted-distribution-gate の両 tsconfig）、bun test（src 側 scripts と trusted-distribution-gate の両方）がすべて PASS かつエラー0件であること。git status --short が空であること | 列挙した全検証が Exit Code 0・エラー0件で完了し、git status --short が空であること | TS-006 |
      | REQ-123-006 | Phase ごとに独立したコミット（Conventional Commits 形式）を作成し、Phase 終了ごとに該当範囲の試験・型検査・整合性検査を実行してから次の Phase へ進むこと。完了報告に、agentdev-inspect-skills の扱い（削除した場合は根拠、維持した場合は維持理由と参照箇所）、意図的に残した試験・設計記述があればその根拠、コミット履歴（git log --oneline a0c0384..HEAD）、変更前後の定量比較表、検証結果サマリー、判断ログを含めること（DEC-067 決定4） | Phase 数分の独立コミットが存在し各 Phase 終了時点で該当範囲の検証が PASS していること。完了報告に上記全項目が含まれること | TS-006, TS-007 |

      ## 適用範囲

      - 対象: trusted-distribution-gate の実装・試験資産、traceability 試験（scripts/tests/）、巨大設計書3件と責務重複解消、generate_indexes.ts の分割と generate_indexes.test.ts のスリム化、agentdev-inspect-skills 残存資産の判定、自動生成インデックスの最新化、Phase 別コミットと最終一括検証
      - 対象外: 旧構成との互換シム、廃止資産の再監視テスト、履歴パッチ単位の試験ファイル（*-gaps.test.ts・*-extra.test.ts・*-regression.test.ts 等）の新規作成。.agentdev/learning/inbox/・.agentdev/learning/deferred/・.agentdev/blocked/ 等への、処理されないまま残るファイルの追加・残置。試験失敗や整合性チェック違反（IR-*・check_autogen_freshness.ts・check_knowledge_docs.ts）のスキップ・無効化（test.skip・ルール緩和）による誤魔化し。配布境界検査の基本機能（開発用ファイル・内部参照の配布物混入検知、保護パス違反検知、アーカイブ生成検証）と IR-058 / IR-059 の実行契約の破壊

      ## 検証

      検証手段は要件テーブルの検証列（TS-001〜TS-007）が所有する。test_strategy の詳細（verification / pass_criteria / on_failure）は親 Case の要件doc（.agentdev/drafts/req-draft-structural-slimming-refactor.md）を投影元とし、完了判定は検証手段の実行と証跡記録で行う。検証コマンドの正規形は pre-push と同じ src 側（./ 付きパス指定・リポジトリルート cwd。REQ-060）とする。

      （採番注記: REQ 番号は保存時に現行の採番規則で決定する。target: new:structural-slimming-refactor がその指定である。2026-11-20 時点の割当期待値は REQ-123（max=122）であり、本文中の行 ID はこの採番を前提とした表記である）

conflict_resolutions:
  - id: CR-001
    conflict: 操作分類 — REQ-122/117 への APPEND/UPDATE か CREATE か
    resolution: CREATE。目的は構造スリム化（認知負荷最小化の引き算）で完了済みバッチ REQ（REQ-122/117）とは独立し、REQ-117/119/122 と同一のバッチ REQ 構成をとる（照合5軸の主軸で判定）。
  - id: CR-002
    conflict: 引き算方針対、防御テスト・パーサ残存の保守的圧力
    resolution: 引き算を維持する（DEC-067 で承認済み）。advisory 確定: 撤去3モジュールは DEC-014 契約面にも IR-059 import 経路にも含まれず衝突しない。問題判明時は Git 履歴復元（DEC-067 決定4）で対処し、追加の防御機構は設けない。
  - id: CR-003
    conflict: 新規 Decision の要否
    resolution: 不要。作成不可条件（削除・統合・再構築主題の禁止）に全 Phase が該当し、枠組みは DEC-067 が確定済みで重複する（UPDATE も不要）。判断の記録は既存成果物で確認可能とする（DEC-067 決定4）。
  - id: CR-004
    conflict: Phase 3 の Design 再編集 — artifact_actions design 操作か realization_actions か
    resolution: 責務境界の仕様変更ではなく DEC-014 と distribution-boundary Design 帰属節が確定した構造の実施である（advisory Q2）。design 操作分離は発生せず、REQ-123-003 の実現作業（RA-003）として Phase 3 で実行し、ADF-COVERS(design) 宣言と sidecar で記録する（REQ-117/122 と同一構成）。
  - id: CR-005
    conflict: RU の検証コマンド表記（.opencode/... 直指定）と REQ-060 実行形態・利用者指定
    resolution: 正規形は pre-push と同じ src 側（./ 付き・リポジトリルート cwd）。.opencode/... 直指定は0件実行の exit 0 になる既知の前提があるため採らない。test_strategy はすべて src 側正規形。
  - id: CR-006
    conflict: 既存行（REQ-122-007・REQ-117-006・REQ-117-011・REQ-060）との矛盾
    resolution: いずれも矛盾しない（advisory Q4）。REQ-122-007 の受け入れ条件（bun test 全件 PASS）は維持、REQ-117-006 の重複キー異常系は traceability_core の残す観点に明示、REQ-117-011 が依存する generate_indexes 経路・報告形式は CLI 入口維持と出力バイト一致で不変、REQ-060 は正規形指定で遵守。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0304
    target_req: REQ-123
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
result: {}

# BASE = ./src/common/skills/repo-agentdev-integrity（正規形: ./ 付き・リポジトリルート cwd。REQ-060・CR-005）。TS 内の BASE はこの値に解釈する。
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      Phase 1 完了時に次を実行する。
      1. 構成検査: trusted-distribution-gate 配下の .test.ts が6〜8件、撤去7ファイル（boundary-url-authority.ts・boundary-url-parser.ts・boundary-reconstruction.ts・boundary-pipeline-evasion.test.ts・boundary-span-overflow.test.ts・boundary-gate-bounds.test.ts・boundary-parser-bounds.test.ts）と distribution-boundary-text-binary.ts が不在であることを確認する。
      2. 外部契約検査: ir-058.ts・ir-059.ts の CLI 引数・エクスポート・import 経路（check_distribution_boundary.ts・distribution-boundary.ts）に差分がないことを確認する。撤去3モジュール名の参照残存を rg で検索する（網羅範囲: src/・docs/全体〔docs/reports/ は対象外〕・scripts/・リポジトリルート直下 Markdown・traceability/ 配下 sidecar・.agentdev/extensions/**）。
      3. 実行検査: bun test BASE/trusted-distribution-gate/、bunx tsc --noEmit -p BASE/trusted-distribution-gate/tsconfig.json、bun run BASE/scripts/cli.ts を実行する。
    pass_criteria: |
      試験ファイル数6〜8件。削除対象8ファイル（撤去3モジュール・過剰防御試験4・distribution-boundary-text-binary.ts）不在。text-binary 単一モジュール。公開API面変更なし。参照残存0件。3コマンドすべて Exit Code 0。
    on_failure: |
      fix-and-reverify。公開API面に差分があれば外部契約を元に戻して再検証する。試験・型検査失敗は統合ミスとして実装を修正して再検証する。参照残存を検出した場合は参照側の更新または削除を実施して再検証する（外部参照が新たに判明した場合は AG-001 の棚卸し結果を更新する）。検査のスキップ・無効化は NEVER 対象のため行わない。
  - id: TS-002
    target_item: AG-002
    verification: |
      Phase 2 完了時に次を実行する。
      1. 構成検査: scripts/tests/ 配下に3統合ファイルが存在し、REQ-123-002 列挙の統合元14ファイルが存在しないことを確認する。tim_declarations_contract.test.ts が8,192バイト以下であること、traceability_core.test.ts がサイドカー重複キー異常系のケースを含むこと（REQ-117-006 の達成状態維持）を確認する。
      2. 参照更新検査: 削除・リネームした試験ファイル名が宣言ファイル・traceability/ 配下 sidecar・check_test_impact.ts・docs/designs/ 配下から参照されていないことを rg で確認する（docs/reports/ は対象外）。
      3. 実行検査: bun test BASE/scripts/ を実行し、check_test_impact.ts を既存の実行方法（REQ-019 gate の単独実行スクリプト。bun run check_test_impact.ts の既存 CLI 使用法〔--base-ref または --files 指定〕に従う）で実行する。
    pass_criteria: |
      3ファイル構成・統合元14ファイル不在・tim 8,192バイト以下・重複キー異常系のケース残存・参照残存0件・bun test と check_test_impact.ts がともに Exit Code 0。
    on_failure: |
      fix-and-reverify。参照残存は参照側を更新して再検証する。重複キー異常系の欠落は REQ-117-006 達成状態の破壊であるため代表ケースへ復元して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      Phase 3 完了時に次を実行する。
      1. サイズ検査: 3設計書（docs/designs/foundations/system.md・document-model.md、docs/designs/local/runtime-package-boundary.md）のバイト数を測定する。
      2. 文書契約検査: check_knowledge_docs.ts と cli.ts（全量。IR-070/067/044/062/064 を含む）を BASE から実行する。
      3. リンク検査: 見出し削除・統合した節への節参照・リンク切れを grep と検査器で確認する（docs/ 全体。docs/reports/ は対象外）。必須仕様の移管完了を移管先 Design の該当節の存在で確認する。
    pass_criteria: |
      3ファイルが目標サイズ範囲内（15〜20KB・15〜20KB・15KB前後）。check_knowledge_docs.ts・cli.ts が Exit Code 0。IR 違反0件・参照リンク切れ0件・移管済み必須仕様が移管先に存在。
    on_failure: |
      fix-and-reverify。リンク切れ・IR 違反は参照側または被参照側を修正して再検証する。サイズ超過は残す内容指定に照らして削減・移管を進めて再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      分割前に generate_indexes.ts を実行して全インデックス出力を記録（ハッシュ・バイト数）し、分割後に再度実行して全出力ファイルをバイト単位で比較する。bun test BASE/scripts/（スリム化後の generate_indexes.test.ts を含む）と bunx tsc --noEmit -p BASE/scripts/tsconfig.json を実行する。
    pass_criteria: |
      分割前後の出力がバイト単位で一致（差分0バイト）。generate_indexes.test.ts が代表ケースへスリム化済み。bun test・tsc が Exit Code 0。
    on_failure: |
      fix-and-reverify。出力差分は分割過程のロジック改変として分割を修正して再比較する（出力バイト一致は決定的受け入れ条件のため record-in-findings では扱わない）。
  - id: TS-005
    target_item: AG-005
    verification: |
      Phase 4 完了時に、agentdev-inspect-skills の扱い（削除根拠または維持理由と参照箇所）が実行記録・完了報告に記載されていることを確認する。削除時は docs/designs/skills/agentdev-inspect-skills.md の不在と関連項目（skill-projection-manifest.yaml・インデックス等）の整合更新を、維持時は実体スキル・内部参照の実在を確認する。check_autogen_freshness.ts を BASE から実行する。
    pass_criteria: |
      判定と報告の記録が存在し、削除・維持の実態が記録と一致している。check_autogen_freshness.ts が Exit Code 0。
    on_failure: |
      fix-and-reverify。鮮度違反は generate_indexes.ts を再実行して解消する。判定記録の欠落は報告へ追記して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      Phase 1〜4 完了後（最終コミット後）に次をすべて実行する。
      1. bun run BASE/scripts/generate_indexes.ts
      2. bun run BASE/scripts/check_autogen_freshness.ts
      3. bun run BASE/scripts/check_knowledge_docs.ts
      4. bun run BASE/scripts/cli.ts（全量）
      5. bunx tsc --noEmit -p BASE/scripts/tsconfig.json と bunx tsc --noEmit -p BASE/trusted-distribution-gate/tsconfig.json
      6. bun test BASE/scripts/ と bun test BASE/trusted-distribution-gate/
      7. git status --short
    pass_criteria: |
      1〜6 がすべて Exit Code 0・エラー0件。git status --short が空。Phase 数分の独立コミットが存在し、各 Phase 終了時点で該当範囲の検証が PASS 済みであること。
    on_failure: |
      fix-and-reverify。最終一括検証は決定的受け入れ条件のため、失敗項目を修正して全項目を再実行する。検査のスキップ・無効化は NEVER 対象のため行わない。
  - id: TS-007
    target_item: AG-007
    verification: |
      完了報告に agentdev-inspect-skills の扱い、意図的に残した試験・設計記述と根拠、コミット履歴（git log --oneline a0c0384..HEAD）、変更前後の定量比較表、検証結果サマリー、判断ログが含まれることを確認する。NEVER 4項への違反が0件であることをコミット履歴と変更差分で検証する。
    pass_criteria: |
      完了報告に AC-5 の全項目が含まれる（DEC-067 決定4）。NEVER 4項への違反0件。
    on_failure: |
      fix-and-reverify。報告項目の欠落は報告へ追記して再確認する。NEVER 違反の変更は当該変更を戻すか対象外として切り出して再検証する（報告様式の新設は行わない）。

realization_actions:
  - id: RA-001
    concern: trusted-distribution-gate のスリム化（Phase 1）
    responsibility: 検出能力・CLI 契約・アーカイブ検証は gate が所有したまま、敵対的バイパス検知層を撤去し決定論的スキャンの最小ロジックを distribution-boundary-detector.ts / boundary-pipeline.ts へ集約し、text-binary を単一化し、試験を6〜8ファイルへ統合する。ir-058/059 の import 経路（check_distribution_boundary.ts・distribution-boundary.ts）と公開API面は変更せず、集約後のスキャンは副作用なし・同一入力同一判定を維持する。
    ownership_hints:
      - src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/（正本。.opencode/ 側は投影）
      - rules/ir-058.ts・ir-059.ts、docs/designs/integrity/distribution-boundary.md「安定実装契約」節
    intent: 外部契約を維持したまま検証資産の認知負荷を削減する（DEC-067 適用）
    verification_refs: [TS-001, TS-006]
    source_items: [AG-001]
  - id: RA-002
    concern: traceability 試験の再編（Phase 2）
    responsibility: traceability 検証の契約（宣言・リンク・サイドカー解析・重複キー異常系・派生・インベントリ・差分影響・ポリシー違反・カバレッジ・E2E 代表）は scripts/tests/ の3統合ファイルが代表ケースで保持する。tim は最小構成へ圧縮し、削除・リネームファイル名への参照をすべて更新する。
    ownership_hints:
      - src/common/skills/repo-agentdev-integrity/scripts/tests/ と check_test_impact.ts
      - traceability/ 配下 sidecar・docs/designs/（参照更新対象）
    intent: 試験数削減と代表ケース集約で保守コストを下げる（REQ-117-006 は重複キー異常系残存で維持）
    verification_refs: [TS-002, TS-006]
    source_items: [AG-002]
  - id: RA-003
    concern: 巨大設計書3件のスリム化と責務重複解消（Phase 3）
    responsibility: 3設計書がハブとして正規仕様を所有し、詳細仕様は基礎設計書（operating-model・responsibility-boundaries・runtime-execution-model・durable-state-and-recovery・document-type-responsibilities・artifact-contracts）へ移管・片寄せする。runtime-package-boundary.md と distribution-boundary.md の重複は DEC-014 帰属節の構造に従って解消し、必須仕様は移管完了後に削除する。
    ownership_hints:
      - docs/designs/foundations/system.md・document-model.md、docs/designs/local/runtime-package-boundary.md
      - docs/designs/integrity/distribution-boundary.md（帰属の正規所有側）と移管先各 Design
    intent: 50KB超の設計書を15〜20KBへ圧縮しコンテキスト消費を最小化する（IR-075・文書契約遵守）
    verification_refs: [TS-003, TS-006]
    source_items: [AG-003]
  - id: RA-004
    concern: generate_indexes.ts の分割（Phase 4）
    responsibility: 正規入口を薄いCLI入口（scripts/generate_indexes.ts）に維持し、走査・生成・書き込み・鮮度比較を lib 側モジュール群（構成は裁量）へ分割し、出力はバイト単位で一致させる。REQ-117-011 の計測日補正 step が依存する実行経路と報告形式は不変とする。
    ownership_hints:
      - src/common/skills/repo-agentdev-integrity/scripts/generate_indexes.ts と tests/generate_indexes.test.ts
      - lib 分割先（例: lib/index-gen/）
    intent: 責務分割で保守性を改善し、出力保証で既存消費者（補正 step・鮮度チェック）の影響をゼロにする
    verification_refs: [TS-004, TS-006]
    source_items: [AG-004]
  - id: RA-005
    concern: agentdev-inspect-skills 判定とインデックス最新化（Phase 4）
    responsibility: 残存資産はリポジトリ全体検索による実在確認に基づき、削除（Design と skill-projection-manifest.yaml・インデックス等の整合更新を含む）または維持（維持理由と参照箇所の報告義務）を判定する。全自動生成README・カタログは generate_indexes.ts 実行で最新化する。
    ownership_hints:
      - docs/designs/skills/agentdev-inspect-skills.md・skill-projection-manifest.yaml・README AUTOGEN ブロック
    intent: 廃止済み資産の残骸を解消しインデックスを現状に一致させる（Clean Deletion・DEC-067 決定4）
    verification_refs: [TS-005, TS-006, TS-007]
    source_items: [AG-005, AG-007]

review_dispositions:
  - id: RD-001
    source_ru: RU-0304
    source_item: AC-1
    disposition: covered
    reason_code: mapped_to_requirement_row
    reason: AC-1 は REQ-123-001 と TS-001 へ省略・弱化・反転なく反映した。
    evidence: {path: .agentdev/backlog/req-units/RU-0304.md, section: 決定的受け入れ条件, checked_at_commit: null}
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0304
    source_item: AC-2
    disposition: covered
    reason_code: mapped_to_requirement_row
    reason: AC-2 は REQ-123-002 と TS-002 へ反映した。
    evidence: {path: .agentdev/backlog/req-units/RU-0304.md, section: 決定的受け入れ条件, checked_at_commit: null}
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0304
    source_item: AC-3
    disposition: covered
    reason_code: mapped_to_requirement_row
    reason: AC-3 は REQ-123-003 と TS-003 へ反映した。
    evidence: {path: .agentdev/backlog/req-units/RU-0304.md, section: 決定的受け入れ条件, checked_at_commit: null}
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0304
    source_item: AC-4
    disposition: covered
    reason_code: mapped_to_requirement_rows
    reason: AC-4 は REQ-123-004 と REQ-123-005 の2行へ分割反映した（整理であり省略・弱化ではない）。
    evidence: {path: .agentdev/backlog/req-units/RU-0304.md, section: 決定的受け入れ条件, checked_at_commit: null}
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0304
    source_item: AC-5
    disposition: covered
    reason_code: mapped_to_requirement_row
    reason: AC-5 は REQ-123-006 と TS-007 へ反映した。
    evidence: {path: .agentdev/backlog/req-units/RU-0304.md, section: 決定的受け入れ条件, checked_at_commit: null}
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0304
    source_item: AC-6
    disposition: covered
    reason_code: mapped_to_out_of_scope_section
    reason: AC-6 は covered（REQ-123 対象外節への NEVER 4項の逐語反映と TS-001・TS-006・TS-007 の on_failure 明記で反映済み）。
    evidence: {path: .agentdev/backlog/req-units/RU-0304.md, section: 対象外（NEVER）, checked_at_commit: null}
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: true
  decomposition: |
    Phase 1〜4 を子 Issue 単位に分解する（Phase 1: gate 解体、Phase 2: traceability 試験再編、Phase 3: 設計書スリム化、Phase 4: generate_indexes 分割・残存資産判定・最終一括検証）。工程順序どおり逐次実行し、Phase 別独立コミットと Phase 終了ごとの該当範囲検証を守る。
```
