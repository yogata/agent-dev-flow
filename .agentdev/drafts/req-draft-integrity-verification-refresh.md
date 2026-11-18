---
draft_type: req_draft
topic_slug: integrity-verification-refresh
status: draft
created_at: 2026-11-18T13:30:00+09:00
source_rus:
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  実行指示書（architecture-refactoring-plan-20261118.md、2026-11-18 受領）を決定済み仕様として受理し、
  整合性検証体制の刷新（IR ルール 56→24+IR-075 への削減、検証エンジンのプラグイン型再構築と src/ 正本化、
  ローカル Git Hook による決定論的検証ゲート新設、巨大コマンド・スキルの 250 行上限と references/ 分割、
  intake-triage コマンド新設、.agentdev/learning/ の 1トピック1ファイル構造移行）を要件として確定した。
  新規収容 REQ 1件（16作業単位行）、既存 REQ 6件の現行化（REQ-010/053/050/036/002/047）、
  新規 Decision 2件（検証体制中核化・ローカル Git Hook ゲート）、Design 5アクション（3新規・2更新）を定義する。
  重要変更（32 IR ルール廃止・textlint プロジェクト側運用廃止に伴う REQ-053 全面改訂等）は
  ドラフト保存前に利用者へ事前通知済みである（2026-11-18、当該通知は保存実行より先に出力した）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      IR 整合性ルール体系を56個から24個へ削減する。廃止対象は実行指示書が列挙する32ファイルが正である
      （カテゴリA: 旧世代〔Retired REQ/ADR〕の過剰監視 9件、カテゴリB: AIの記述スタイル・ステップ番号・
      委譲構文への過剰介入 13件、カテゴリC: 禁止用語・散文品質・メタデータ鮮度・残骸監視 10件）。
      廃止32＋残存24＝56と実物が完全に一致することを確認済み（2026-11-18・HEAD 91c078b1f 実測）。
      フェーズ完了コミットのメッセージに含める個数は実数（32）で記載する。
  - id: AG-002
    content: |
      廃止ルールに連動するデータ・参照資産・設計書・設定を削除する。対象は
      data/command-format-rules.yaml、data/delegation-contract-patterns.yaml、references/vocabulary-registry.md
      （いずれも .opencode/skills/repo-agentdev-integrity/ 配下に解決）、docs/designs/authoring/command-file-format.md、
      docs/designs/authoring/vocabulary-registry.md（参照なしを確認の上で削除）、
      docs/designs/integrity/content-corruption-checker.md、docs/designs/integrity/prose-quality-sentinel-checks.md、
      docs/designs/quality/textlint-quality-runtime.md、.agentdev/config/plugins/agentdev-textlint-guard-prh.yml、
      .agentdev/config/plugins/agentdev-textlint-guard.yaml、textlint_guard_project_config.test.ts。
      agentdev-textlint-guard Plugin 本体（src/opencode/plugins/ 等）は削除対象外とし配布資産として維持する。
  - id: AG-003
    content: |
      残存24コアルールを4分類として維持する（スキーマ・ID・ファイル名整合 7、リンク・参照パス・未解決
      プレースホルダ 8、自動生成・インデックス・投影同期 5、配布境界 4）。指示書に列挙されない残存検証資産
      （check_design_frontmatter・check_extensions・check_distribution_boundary・lint_skills・current_refs・lib/ 等）
      は残存24ルールへの対応付けを決めて新構造へ移行するか削除し、放置された旧チェッカーを残さない。
  - id: AG-004
    content: |
      .agentdev/learning/ を .agentdev/intake/ と同一の1トピック1ファイル構造へ移行する。
      .agentdev/learning/inbox.md と deferred.md を削除し、.agentdev/learning/inbox/.gitkeep と
      .agentdev/learning/deferred/.gitkeep を作成する（promoted/.gitkeep は維持）。deferred 項目の保存先は
      .agentdev/learning/deferred/ ディレクトリ（1トピック1ファイル）とし、命名規則と frontmatter スキーマは
      inbox と同一、status フィールドで deferred・未処理・再評価対象の状態区分を保持する（現行 deferred.md の
      実データは 0 件のためデータ移行は発生しない）。inbox/ 配下ファイルの命名規則は YYYY-MM-DD-<slug>.md、
      frontmatter スキーマは id: learn-YYYYMMDD-<slug>、created_at、source、status: inbox の4フィールドとし、
      本文は既存の13フィールド形式を保持する。agentdev-learning-capture、agentdev-workflow-learning-promote、
      docs/designs/commands/learning-promote.md（正本 src/ 側を含む）内の参照パスを更新する。
  - id: AG-005
    content: |
      検証エンジン（repo-agentdev-integrity）をプラグイン型アーキテクチャへ再構築し src/ 正本化する。
      モジュール構成は scripts/cli.ts（--changed / --emit-intake / --rule <id> / --json）、generate_indexes.ts、
      check_autogen_freshness.ts、engine/（types.ts・context.ts・runner.ts・reporter.ts）、rules/（index.ts と
      1ルール1ファイルの24+IR-075 モジュール）、lib/、trusted-distribution-gate/、data/（distribution-targets.yaml・
      skill-projection-manifest.yaml）。正本を src/ 配下（既存 src/ 構造に準拠）に配置し .opencode/ 側を投影とする。
      repo-local・配布対象外の位置づけは維持する。既存の検査能力（REQ-117-006 の sidecar 重複キー検出、
      REQ-010-084 の未追跡ファイル検出、REQ-010-083 の異言語文字混入検出を含む）は新構造へ移行して保持する。
  - id: AG-006
    content: |
      共通コンテキストキャッシュ・差分実行・自動起票を実装する。IntegrityContext は対象ディレクトリ配下の
      Markdown/YAML を1回だけ走査し、ParsedFile（path、rawContent、lines、frontmatter、markdownLinks、
      reqReferences）をキャッシュする。個別ルールでの fs.readFileSync・glob 直接呼出を禁止し ctx 経由とする。
      cli.ts --changed はステージング（空の場合は HEAD 差分）から変更ファイルを取得し targetGlobs 照合で
      該当ルール（と globalScan ルール）のみ並列実行し、対象外のみの場合は即時 Exit 0 とする。
      --emit-intake は severity: warning の違反を .agentdev/intake/inbox/YYYY-MM-DD-auto-<rule-id-lower>.md
      として自動起票し、同一 rule-id の既存自動起票ファイル存在時はスキップする（冪等性）。
      generate_indexes.ts は rules/index.ts 登録の全 IntegrityRule メタデータから
      integrity-rule-catalog.md を自動生成する（ドキュメントと実装の二重管理を廃止、単一ソース化）。
  - id: AG-007
    content: |
      旧モノリス・過剰チェッカー・肥大化テストを削除・統合する。削除対象は check_integrity.ts・check_integrity.test.ts・
      check_changed_docs（.test.ts 含む）・check_command_format（lib/command-format-rules 含む）・check_executor_notation・
      check_delegation_contract_residual・check_content_corruption（.test.ts 含む）・check_knowledge_docs（.test.ts 含む）・
      check_templates（.test.ts 含む）・check_workflow_preventive（.test.ts 含む）・textlint_guard_project_config.test.ts。
      trusted-distribution-gate/ 配下のバージョン履歴別テスト20ファイルを削除し、重要な境界テストケースを
      boundary-pipeline.test.ts・boundary-gate.test.ts へ統合する。scripts/rules/rules.test.ts を新設し
      残存ルールの正常系・異常系をインメモリ IntegrityContext モックで高速検証する。
  - id: AG-008
    content: |
      scripts/git-hooks/pre-commit を実装する（目標実行時間2秒以内）。Step1: git diff --cached --name-only に
      src/ 配下のステージングを含む場合のみ投影・ビルドスクリプトを自動実行し、更新された .opencode/ 配下の
      差分を git add .opencode/ で自動ステージする（投影忘れによる IR-016 違反の未然防止。REPO_ROOT は
      git rev-parse --show-toplevel 起点）。Step2: cli.ts --changed による差分整合性チェック。Step3: docs/・src/ に
      変更が含まれる場合 check_autogen_freshness.ts によるインデックス鮮度チェック。いずれかの失敗は非ゼロ終了で
      コミットを物理ブロックし、緊急時の git commit --no-verify バイパスをエラーメッセージに案内する。
  - id: AG-009
    content: |
      scripts/git-hooks/pre-push を実装する（目標実行時間10秒以内）。Step1: cli.ts 全量実行（全24+IR-075 ルールを
      リポジトリ全体へ適用）。Step2: トレーサビリティ検証（agentdev-traceability の check.ts または投影先スクリプト）。
      Step3: bun test による検証エンジン自体のユニットテスト（実行形態は REQ-060 に従う）。
  - id: AG-010
    content: |
      scripts/setup-hooks.ts を実装する。git rev-parse --git-common-dir と --show-toplevel を用いて通常クローンと
      git worktree の双方で動作する。git config core.hooksPath scripts/git-hooks を設定（設定済みの場合は冪等に
      スキップ）し、両フックスクリプトへ実行権限（0o755）を付与する。.gitattributes へ
      scripts/git-hooks/* text eol=lf を追記する。ルート package.json は存在しないため scripts セクション追記は
      適用外とし、README-INSTALL.md のセットアップ手順へ bun run scripts/setup-hooks.ts の記載と、
      実行後 git config --get core.hooksPath が scripts/git-hooks であることの確認を含める。
  - id: AG-011
    content: |
      IR-075（ir-file-size）を新設する。対象パスは src/**/commands/*.md、src/**/skills/*/SKILL.md、
      .opencode/commands/**/*.md、.opencode/skills/*/SKILL.md、docs/designs/commands/*.md（_template.md を除く）。
      上限は YAML Frontmatter を含む総行数 250 行とし、違反判定は総行数超過で行う。8,192 bytes は目安の併記とし、
      バイト数のみの超過は違反としない（指示書「総行数で判定」の文言に基づく確定事項）。
      除外対象は **/references/**/*.md とする。エラーメッセージは超過ファイルパスと現在の行数・バイト数の両方を
      出力し、references/<name>/ 配下への詳細セクション分離を案内する。
  - id: AG-012
    content: |
      250 行超過の巨大コマンド・スキル6ファイル（docs/designs/commands/req-define.md 653行・case-auto.md 634行・
      case-run.md 604行・case-close.md 394行・case-open.md 319行、repo-agentdev-integrity SKILL.md 262行）を、
      メインファイル（制御フロー骨格、150〜200行以内）＋ references/<name>/（詳細仕様・例外処理・プロンプト
      テンプレート、オンデマンド読込）へ分割する。メインファイルには遅延読み込み指示（詳細手順は
      references/<command-name>/<phase>.md を実行時に読み込む旨）を明記する。src 側正本と docs/designs/commands/
      の双方に適用する。投影マニフェスト・ビルドスクリプトの走査対象に references/ ディレクトリが含まれることを
      確認する。分割後の references/ パスは IR-008・IR-062 で自動検証される。
  - id: AG-013
    content: |
      intake-triage コマンドを新設する。正本は src/common/commands/agentdev/intake-triage.md（200行以内の軽量設計）、
      設計書は docs/designs/commands/intake-triage.md、Workflow Skill（agentdev-workflow-intake-triage）への委譲は
      REQ-002-001/002 により必須とする。Step1: .agentdev/intake/inbox/*.md と .agentdev/learning/inbox/*.md
      （.gitkeep 除く）を一括走査し、対象コンポーネント・関連 IR/REQ ID・問題種類の重複・類似でクラスタリングする。
      Step2: 3ルート自動振り分け。Route A（即時決済）は設計判断を伴わず1〜2ファイルで完結する軽微修正をその場で
      直接修正し処理済み inbox ファイルを削除する。Route B（即時破棄）は DEC-064 の原則に照らして不要・陳腐化した
      提案を理由を記録せず即時に削除する。Route C（バックログ昇格）は複数ファイルの構造変更や新規設計が必要な案件を
      クラスタ単位で統合した要件ユニットとして .agentdev/backlog/req-units/ へ生成（REQ-039-007 の採番規律を適用）
      し元の inbox ファイルを削除する。Step3: サマリー出力（Route A/B/C 各件数と残件 0 件の確認）を行う。
  - id: AG-014
    content: |
      AGENTS.md・既存 Design・スキル文書など残存ドキュメントから削除した資産・ルール・旧チェッカーへの言及を
      参照除去する（AGENTS.md の textlint 共通基盤正規参照点記述を含む）。grep 等でリンク切れ・言い残しがない
      ことを各フェーズの完了チェックで確認する。traceability/ 配下 YAML から削除した IR ルール・旧チェッカーへの
      紐付け（verified_by / rules 等）を削除し、参照切れ（IR-062/IR-067 違反）が起きないよう整合させる。
      編集対象ファイルの ADF-COVERS コメント行など既存の契約コメントは保持し、docs/** 編集は repo 契約の
      yomiyasu 工程を踏む。
  - id: AG-015
    content: |
      Phase 1〜4 を通しで完遂する。各フェーズ完了時点でその時点の検証に通ったことを確認してローカルコミット
      （refactor(phase1..2) / feat(phase3..4)）を作成する。最終検証として投影スクリプト実行・generate_indexes 実行・
      bash scripts/git-hooks/pre-commit が ir-file-size 含めエラー0件・bash scripts/git-hooks/pre-push が全量整合性
      チェック・トレーサビリティ検査・bun test 全て Exit Code 0 を確認する。完了報告に①削減された IR ルール数と
      ファイルサイズ変化のビフォー・アフター、②分割されたコマンド・スキルの一覧、③pre-commit/pre-push の
      実測実行時間を含める。Git 操作は非対話経路で実行する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:integrity-verification-refresh
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012, AG-013, AG-014, AG-015]
    content: |
      # タイトル案: 整合性検証体制の刷新（IR 減量・検証エンジン分割・ローカル Git Hook ゲート・巨大コマンド分割・自動トリアージ）

      ## 目的

      整合性検証体制の刷新を16作業単位の要求行として収容する。DEC-064（実験前提の3原則）に基づく過剰統制の削減
      （IR ルール 56→24+IR-075）、検証エンジンのプラグイン型再構築と src/ 正本化、ローカル Git Hook による
      決定論的検証ゲートの新設、巨大コマンド・スキルの分割と行数上限の導入、intake-triage コマンドの新設、
      learning inbox の構造移行を対象とする。既存 REQ/Design/Decision への付随的編集操作は本 REQ の実現経路で
      行い、各行は達成状態が判定可能な命題として書かれる。検証手段は検証列（TS-001〜TS-015）に従う。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | new:integrity-verification-refresh-001 | IR 整合性ルール体系を56個から24個へ削減すること。廃止対象は実行指示書が列挙する32ファイル（カテゴリA 旧世代監視9・B 記述スタイル過剰介入13・C 禁止用語・散文品質・残骸監視10）が正であること | docs/designs/integrity/rules/ のルール定義ファイルが残存24＋IR-075 となり、廃止32ファイルの削除と残存24の過不足なしを機械確認できること | TS-001 |
      | new:integrity-verification-refresh-002 | 廃止ルールに連動するデータ・参照資産・設計書・設定を削除すること（AG-002 列挙の実パス解決済み対象。Plugin 本体は削除対象外） | 列挙資産の実在削除と、残存ドキュメントからの参照除去（リンク切れ・言及0件）を grep で確認できること | TS-002 |
      | new:integrity-verification-refresh-003 | 残存24コアルールを4分類構成として維持し、指示書に列挙されない残存検証資産を新構造へ移行するか削除して放置された旧チェッカーを残さないこと | カタログ自動生成の結果が24+IR-075 構成と一致し、旧構造由来のチェッカー残存がないこと | TS-006 |
      | new:integrity-verification-refresh-004 | .agentdev/learning/ を1トピック1ファイル構造へ移行すること（inbox.md・deferred.md 削除、learning/inbox/.gitkeep と learning/deferred/.gitkeep 作成、deferred 項目の保存先は learning/deferred/ ディレクトリ〔命名・frontmatter は inbox と同一、status で状態区分〕、命名 YYYY-MM-DD-<slug>.md、frontmatter 4フィールド〔id/created_at/source/status〕、intake と同一構造、本文は13フィールド形式を保持） | learning inbox・deferred がディレクトリ構造となり、旧ファイルが削除済みで、関連スキル・設計書の参照パスが更新済みであること | TS-003 |
      | new:integrity-verification-refresh-005 | 検証エンジンをプラグイン型アーキテクチャへ再構築し正本を src/ 配下、.opencode/ 側を投影として管理すること（AG-005 のモジュール構成。repo-local・配布対象外は維持）。既存の検査能力（sidecar 重複キー検出・未追跡ファイル検出・異言語文字混入検出を含む）を新構造へ移行して保持すること | cli.ts 全量実行が Exit 0 となり、投影整合（IR-016/IR-068）が維持され、移行対象の検査能力の回帰テストが存在すること | TS-004 |
      | new:integrity-verification-refresh-006 | 共通コンテキストキャッシュ（単一走査・ParsedFile 事前パース・ルール内での直接 I/O 禁止）、差分実行（--changed、対象外のみは即時 Exit 0）、自動起票（--emit-intake、同一 rule-id での再生成スキップによる冪等性）、カタログ自動生成（rules レジストリからの単一ソース化）を実装すること | 差分実行の対象外変更で即時 Exit 0、warning 検出時の自動起票と冪等スキップ、カタログがレジストリから自動生成されることが確認できること | TS-005 |
      | new:integrity-verification-refresh-007 | 旧モノリス・過剰チェッカー・肥大化テストを削除・統合すること（AG-007 列挙対象の削除、trusted-distribution-gate 履歴別テスト20ファイルの boundary-pipeline/boundary-gate への統合、rules.test.ts 新設） | bun test が全件 PASS（Exit 0）し、削除済み旧チェッカーの起票が行われないこと | TS-007 |
      | new:integrity-verification-refresh-008 | scripts/git-hooks/pre-commit を実装すること（src/ ステージング検出時の投影自動実行と .opencode/ 自動ステージ、cli.ts --changed 差分整合チェック、インデックス鮮度チェック、目標2秒、失敗時のコミット物理ブロック、--no-verify 緊急バイパス案内） | bash scripts/git-hooks/pre-commit がエラー0件で通過し、意図的違反時（投影忘れ・250行超過）に非ゼロ終了でブロックすること | TS-008 |
      | new:integrity-verification-refresh-009 | scripts/git-hooks/pre-push を実装すること（cli.ts 全量実行、トレーサビリティ検証、検証エンジンのテストスイート実行〔REQ-060 の実行形態に従う〕、目標10秒） | bash scripts/git-hooks/pre-push が全量整合性チェック・トレーサビリティ検査・bun test 全て Exit 0 で完了すること | TS-009 |
      | new:integrity-verification-refresh-010 | scripts/setup-hooks.ts を実装すること（worktree 対応、core.hooksPath 冪等設定、実行権限付与、.gitattributes の eol=lf 追記、README-INSTALL.md への手順記載。ルート package.json は存在しないため scripts セクション追記は適用外） | setup-hooks 実行後 git config --get core.hooksPath が scripts/git-hooks となり、worktree 環境でも動作すること | TS-010 |
      | new:integrity-verification-refresh-011 | IR-075（ir-file-size）を新設すること（AG-011 の対象パス・250行総行数判定・バイト数目安併記・references/ 除外・行数とバイト数の両方を出力するエラーメッセージ） | 250行超過ファイルの検出、references/ 除外、バイト数のみの超過が違犯とならないことが確認できること | TS-011 |
      | new:integrity-verification-refresh-012 | 250行超過の巨大コマンド・スキル6ファイル（AG-012 列挙）を骨格（150〜200行）＋ references/<name>/ へ分割すること（遅延読み込み指示の明記、投影マニフェストの走査対象への references/ 包含確認） | 分割後の全ファイルが250行以内で、references/ パスのリンク切れが IR-008/IR-062 で検出されないこと | TS-012 |
      | new:integrity-verification-refresh-013 | intake-triage コマンドを新設すること（AG-013 の構成。Workflow Skill 委譲必須、3ルート自動振り分け〔Route A 即時修正、Route B 理由記録なし即時破棄、Route C RU 生成〔REQ-039-007 採番規律適用〕〕、サマリー出力） | 3ルートの振り分け動作と残件0件のサマリー出力が確認できること | TS-013 |
      | new:integrity-verification-refresh-014 | AGENTS.md・残存 Design・スキル文書から削除資産への参照を除去し、traceability/ 配下 YAML の参照切れ（IR-062/IR-067 違反）を解消すること | 参照除去の grep 確認とトレーサビリティ検査の合格が確認できること | TS-014 |
      | new:integrity-verification-refresh-015 | Phase 1〜4 を通しで完遂し、各フェーズ完了時点で検証通過後にローカルコミット（refactor(phase1..2)/feat(phase3..4)）を作成し、最終検証（投影・generate_indexes・pre-commit エラー0件・pre-push 全て Exit 0）を通過すること | 4フェーズ分のコミット存在と最終検証の全 Exit Code 0 が確認できること | TS-015 |
      | new:integrity-verification-refresh-016 | 完了報告に①削減された IR ルール数とファイルサイズ変化のビフォー・アフター、②分割されたコマンド・スキルの一覧、③pre-commit/pre-push の実測実行時間を含めること | 完了報告に3項目が全て含まれること | TS-015 |

      ## 適用範囲

      - 対象: IR ルール体系の削減と残存コアルールの確定、廃止連動資産の削除、検証エンジンのプラグイン型再構築と src/ 正本化、ローカル Git Hook ゲート（pre-commit/pre-push/setup-hooks）、IR-075 による行数上限、巨大コマンド・スキルの分割、intake-triage コマンドの新設、learning inbox の1トピック1ファイル移行、残存ドキュメントの参照除去とトレーサビリティ整合、最終検証と完了報告
      - 対象外: GitHub Actions・CI の新設（ローカル Git Hook への移行が方針）、リリース公開・版タグ作成、agentdev-textlint-guard Plugin 本体（src/opencode/plugins/ 等）の削除

      ## 検証

      検証手段は要件テーブルの検証列（TS-001〜TS-015）が所有する。test_strategy の詳細
      （verification / pass_criteria / on_failure）は親 Case の要件doc（.agentdev/drafts/req-draft-integrity-verification-refresh.md）を投影元とし、完了判定は検証手段の実行と証跡記録で行う。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-001, AG-002, AG-005, AG-007, AG-014]
    content: |
      【変更後要件行（修正8行・削除2行。変更しない行は本 content に含めない）】

      修正行:
      | REQ-010-007 | docs-check は基準既知の検出事項と新規検出事項を区別できること。integrity 系検査は既知集合管理を廃止して全件を新規扱いで即時解消すること |
      | REQ-010-071 | 配布物の構造と参照の決定的整合性検査を配布 command と skill 全体へ適用すること。共通検査で代替できない構造と参照の検査は既存の責務を維持し、各検査クラスは REQ-010-068 の回帰テストを伴うこと |
      | REQ-010-074 | docs-check の既知 delta は解消済み、残存、警告相当の区分で維持管理し、報告と終了コードは severity に従うこと。既知 delta は検出時点の解消管理とすること |
      | REQ-010-075 | 本体の保存、完了、品質検査から文章表層品質の共通自動検査を要求しないこと。導入先用の最終検査は docs-check に依存せず、履歴文脈、廃止語彙、旧パスと識別子に対する既存の整合性検査は維持すること |
      | REQ-010-079 | docs-check は warning 総数の未解決残置を許容しないこと。warning の解消または検出対象からの明示的な除外判断を都度の判断記録として扱うこと |
      | REQ-010-083 | docs-check は意図しない異言語文字混入（既知混入形の確定一致）を docs design 本文を含む走査対象で機械検出する検査ルールを持つこと |
      | REQ-010-084 | docs-check の恒常 checker は、リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリを検出する検査を持つこと。承認一覧（ng-baseline）による恒久管理は行わず、検出は都度の解消または gitignore 対象化の明示判断で処理し、検査実行が承認を自動追加しないこと |

      削除行（req-updated-freshness〔IR-072〕検出機構の廃止に伴い、当該機構を前提とする行を削除する）:
      - REQ-010-081（削除）
      - REQ-010-085（削除）

      【適用範囲（対象）の変更後全文】

      - **対象**:
        - docs-check 自己監査 command の検査責務と配布境界、機械検出と意味診断の分離境界（docs-check 側）、検査層と severity 分類、検出事項の報告、整合性検証基盤自身の整合性検証、checker 詳細の委譲、回帰テスト、索引と README と規則カタログと文書地図の整合性検証、保存工程と完了工程の変更ファイル限定検査、変更ファイル限定検査の files_checked 空時の検査見逃し扱い、AUTOGEN 鮮度検出、self-hosting 配布境界検査、テストの checker 規則再実装禁止
        - 共通ポリシー意味識別子の整合性検査（未定義参照、重複定義、廃止済み Gxx 表記の残存検出、REQ-051-005）、実行時配布対象の未解決プレースホルダー検査（許容条件付き）、廃止語彙検査（歴史的識別子許可付き）、旧パス・削除済み名称検査、新規検査クラスの回帰テスト義務
        - 関連REQ表の retired REQ 実パスリンク検査、docs/designs 相対リンク実在検査
        - 既知 delta の区分維持の報告反映
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-053.md
    source_items: [AG-002, AG-014]
    content: |
      【全面改稿。変更後の本文全文（frontmatter の id/title は不変、updated は保存時に進行）】

      ## 目的

      文書と配布物の文章品質契約を所有する。文章表層品質の共通自動検査機構（textlint 共通基盤のプロジェクト側
      設定・runtime Design・センチネル検査・決定的破損検査クラス）は廃止済みであり、agentdev-textlint-guard
      Plugin 本体は配布資産として維持する（consumer が任意に利用）。日本語表現の用語基準は REQ-094 が、
      推敲工程は REQ-098 が、構造と参照の整合性検査は残存 IR 群がそれぞれの責務で担保する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-053-001 | 文章表層品質の正規参照点は agentdev-textlint-guard Plugin の標準規則とすること。本体リポジトリの保存・完了工程で文章表層品質の共通自動検査を実行せず、プロジェクト固有用語設定（prh 辞書）を本体リポジトリで保持しないこと。Plugin 本体は配布資産として維持すること |
      | REQ-053-002 | 配布物はメタ指示（実行時に意味を持たない LLM 宛指示文）を含まないこと |
      | REQ-053-003 | 配布物の各文は主述が完結し、未完結文を含まないこと |
      | REQ-053-005 | 「〜を正とする」「〜が正」形式の規範宣言は、規範原本への参照を伴い、定義元・参照元・所有関係のいずれの関係か一義的に判断できる場合に限り使用でき、同一文書内で濫用しないこと |
      | REQ-053-008 | 配布物は Markdown 構造破損（見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損）を含まないこと |
      | REQ-053-009 | 配布物は制御文字、不正な Unicode 文字、意図しない異言語文字を含まないこと |
      | REQ-053-010 | 配布物は既知形式の参照残骸（確認済みの不要参照、実在しない参照先を指す既知形式の記述）を含まないこと |
      | REQ-053-023 | 配布 skill の references/ 配下は既知の異言語文字混入、誤記リンク、参照残骸を保持しないこと。検出用の例示や歴史的識別子の許容は現行の構造認識とライフサイクル規則に従うこと |
      | REQ-053-036 | 現行成果物の文章品質の実行と規範参照は旧文章品質スキルへの依存を持たず、歴史記録は事実と識別子を保持すること |
      | REQ-053-040 | 正規成果物内の REQ 行引用は、参照先 REQ 行の実本文と整合する文言のみを含むこと。参照先の実本文に存在しない引用文言を出所不明のまま保持せず、実本文と整合しない参照は実本文に即した表現へ修正するか、当該参照を取り除いて適切な根拠へ付け替えること |

      ## 適用範囲

      - 対象: 配布物の文章品質契約（メタ指示の排除、主述の完結、規範宣言形式、Markdown 構造の健全性、参照残骸の排除、references/ 配下の品質、REQ 行引用の整合）、textlint Plugin 本体の配布資産としての維持と正規参照点としての位置づけ
      - 対象外: 文章表層品質の共通自動検査機構（書込み前検査・完了前検査・ファイル単位結果の再利用・センチネル検査・決定的破損検査クラス。廃止済み）、Plugin 本体の依存供給・版固定（DEC-047）、日本語表現の用語基準（REQ-094）、推敲工程（REQ-098）、構造と参照の機械検査（残存 IR 群）
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-050.md
    source_items: [AG-008, AG-009, AG-010]
    content: |
      【変更後要件行】

      | REQ-050-001 | scripts/ 直下の通常利用者向け公開入口は、consumer 向けの scripts/install.ps1、self-hosting 向けの scripts/self-sync.ps1、開発環境セットアップ向けの scripts/setup-hooks.ts の3本に限定すること |
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    source_items: [AG-002, AG-014]
    content: |
      【変更後要件行】

      | REQ-036-008 | inspect-docs は本体専用の構造と参照の整合性検査を docs-check へ委譲し、意味診断側に同じ検査を保持しないこと |
      | REQ-036-023 | 文脈解釈、意味判断、設計妥当性判断を必要とする検査は文書種別と成果物種別に対応する既存の診断能力が所有すること。docs 横断の意味診断、REQ の事後構造診断、Command と Skill の意味構造診断を分離すること |
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-002.md
    source_items: [AG-005]
    content: |
      【変更後要件行】

      | REQ-002-020 | 配布物が依存しない repo-local 専用 skill は .opencode/skills/ を投影先として管理する。repo-agentdev-integrity（検証エンジン）に限り、正本を src/ 配下に配置し .opencode/ 側を投影として管理することを許容する。いずれも consumer への配布対象外とすること |
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-047.md
    source_items: [AG-001, AG-002, AG-005]
    content: |
      【変更後要件行】

      | REQ-047-001 | 対象規則（ガードレール識別体系（共通ポリシー意味識別子）、廃止語彙と旧パス、配布境界、同種の integrity 検査定義）ごとに、正規契約、機械判定可能な定義、checker、test の対応が整理され、正規所有者が一意に定義されていること |
      | REQ-047-009 | 検査定義 yaml（distribution-targets、skill-projection-manifest）は検査定義の原本であり、checker は yaml を読み込む単一経路で検査を実行すること。yaml 欠損時は fail-closed で停止すること |
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-038.md
    source_items: [AG-004]
    content: |
      【変更後要件行】

      | REQ-038-006 | learning-promote の deferred 読込は .agentdev/learning/deferred/*.md（1トピック1ファイル、命名規則と frontmatter スキーマは learning inbox と同一、status フィールドで deferred・未処理・再評価対象の状態区分を保持）に対して、プールサイズに依存しない突合スコープ（インデックススキャンと候補絞り込みによる2フェーズ読込）で行い、候補0件または判定が曖昧なエントリの全面読みフォールバックを契約とすること。処分区分・living pool 維持・自動削除禁止（REQ-003-024）の意味仕様は変更しないこと |
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-117.md
    source_items: [AG-001, AG-005, AG-007]
    content: |
      【変更後要件行】

      | REQ-117-011 | prepare_definition_pr に、generate_indexes 実行後・検証エンジン実行前の計測日不整合（req-metrics 計測日 AUTOGEN 更新）を検出して明示パス指定で補正 commit を script 内で完結させる拡張 step を維持すること。対象抽出は req-metrics 計測日 AUTOGEN の報告形式を対象とし、REQ ファイル名のみの報告形式（docs/requirements/ プレフィックスなしのファイル名のみ報告）と既存のプレフィックス付き報告形式の双方を捕捉すること。NG 報告対象と補正適用対象の差分検査（補正漏れの fail-closed 検出）を step に含めること。手順契約へ追随更新を含めること。frontmatter updated の鮮度追随検出（req-updated-freshness〔IR-072〕）は廃止済みであるため対象から除外すること |
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-094.md
    source_items: [AG-002, AG-014]
    content: |
      【適用範囲の変更後（対象3つ目の行と対象外末尾の行）】

      - 対象: 「語彙管理データの区別軸構造（語彙レジストリ実体・プロジェクト用語 prh 辞書は廃止済みであり、区別軸の所有は本 REQ の要件行〔REQ-094-003・008〕が担う）」
      - 対象外: 「文章表層品質検査における機械検査対象ファイル範囲の拡大（歴史記録の扱いは現行維持）」
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:integrity-verification-refresh
    source_items: [AG-001, AG-002, AG-003, AG-005, AG-006, AG-007, AG-011]
    content: |
      # タイトル案: 整合性検証体制の中核化（IR 24+IR-075 体系・プラグイン型検証エンジン・src 正本化）

      ## 背景

      IR ルール体系（56個）には旧世代の移行監視、AI の記述スタイルへの過剰介入、散文品質・メタデータ鮮度の
      過剰監視が含まれ、DEC-064（実験前提の3原則）が排除対象と定めた過剰統制に該当する。検証エンジンは
      check_integrity.ts 351KB のモノリスであり、ルール定義とカタログの二重管理も発生している。DEC-064 は
      削除スコープを明示8ルール（IR-009/014/021/046/054/057/065/066）に限定したため、今回の32ルール削減は
      DEC-064 の適用ではなく、DEC-064 原則に基づく新規の統制縮小判断である。

      ## 決定

      1. IR ルール体系を56個から24個のコア整合性ルールへ削減する。廃止32ルールの処分理由はカテゴリ分類
         （A: 旧世代監視、B: 記述スタイルへの過剰介入、C: 禁止用語・散文品質・鮮度・残骸監視）をもって
         決済記録とする（DEC-064 原則3の適用形。黙認と区別する）。
      2. IR-072（req-updated-freshness）を廃止する。DEC-064 決定2の存続検査明言のうち IR-073
         （untracked-residue）はルール登録を終了するが、未追跡ファイル検出の能力は検証エンジンの検査として
         REQ-010-084 の規定どおり維持する。IR-055・IR-059 は残存24が維持する。
      3. 検証エンジンをプラグイン型アーキテクチャ（IntegrityRule/IntegrityContext 型定義、1ルール1ファイル、
         単一走査の共有コンテキストキャッシュ、差分実行、warning 自動起票）へ再構築する。正本を src/ 配下に
         配置し .opencode/ 側を投影とする（repo-local・配布対象外は維持。REQ-002-020 の例外を定める）。
         ルールカタログは rules レジストリから自動生成し単一ソース化する。
      4. textlint プロジェクト側設定・runtime Design・センチネル検査・決定的破損検査クラスを廃止し、本体
         リポジトリにおける文章表層品質の自動検査運用を終了する。agentdev-textlint-guard Plugin 本体は配布
         資産として維持し、DEC-028/DEC-047 の Plugin 製品としての決定（textlint 採用・版固定情報解決）は
         維持する。AGENTS.md の正規参照点記述を現行化する。
      5. IR-075（ir-file-size、250行上限）を新設する。新規恒久統制として DEC-001 決定4 の7条件立証は次のとおり:
         再現する問題は巨大コマンド・スキルによるコンテキスト圧迫と指示遵守率低下（Lost in the Middle）、
         強制に値する被害は検証忘れ・投影忘れの定着、削除・統合・縮小では防げない理由は認知的制約は文書構造で
         しか制御できないこと、実行可能性は行数判定という決定的検査で担保されること、単一の所有者は IR-075
         ルール定義、削減される旧機構はなし（既存行数ガイドの集約）、再評価条件は分割後の運用実測と
         references/ 利用状況の観察とする。

      ## 代替案

      段階的削減（カテゴリごとの個別 Case）は移行期間中の二重管理を残すため不採用。ルール定義の残置による
      実質停止は DEC-064 原則2（後方互換性の完全破棄）に反するため不採用。

      ## 結果と影響

      REQ（新規収容REQ）が作業単位を所有し、REQ-010/053/036/002/047/050 の現行化を伴う。
      traceability/ YAML の参照切り、AGENTS.md・Design の参照除去を要する。IR カタログ・ルール所有権
      マトリクス・索引は自動生成で再構成される。

      ## 関係

      relates-to DEC-064（原則の第二波適用・IR-073 まわりの限定）、DEC-013（IR 登録モデル維持の下での
      具体集合変更）、DEC-014（IR-059 は残存24が維持、範囲・経路は不変）、DEC-027（観測ベース統制縮小の
      系列）、DEC-049（src 正本・投影モデルの適用拡張）、DEC-028/DEC-047（Plugin 製品としての決定は維持）。
  - id: ACT-DEC-002
    artifact: decision
    operation: create
    target: new:local-git-hook-gates
    source_items: [AG-008, AG-009, AG-010]
    content: |
      # タイトル案: ローカル Git Hook による決定論的検証ゲート（CI 非依存）

      ## 背景

      DEC-063 により GitHub Actions CI は撤去され、検証はローカル実行が前提となった。AI エージェントの
      自己申告やコマンド実行忘れに依存しない決定論的な検証ゲートが不在である。Git Hook を定める
      Decision/REQ/Design は現存しない（2026-11-18 実測。唯一の言及は index-auto-generation Design の
      実装オプション例示）。

      ## 決定

      1. scripts/git-hooks/pre-commit を決定論的ローカルゲートとして採用する（src/ ステージング検出時の
         投影自動実行と .opencode/ 自動ステージング、差分整合性チェック、インデックス鮮度チェック、目標2秒、
         失敗時のコミット物理ブロック）。緊急時のロールバック等では git commit --no-verify によるバイパスを
         許容し、エラーメッセージに案内する。
      2. scripts/git-hooks/pre-push を全量ゲートとして採用する（全ルール検証、トレーサビリティ検証、
         検証エンジンのテストスイート実行、目標10秒）。bun test 実行形態は REQ-060 に従う。
      3. scripts/setup-hooks.ts を scripts/ 直下の公開入口に追加する。DEC-021（scripts 公開入口の2本固定）
         を3本へ拡張する限定変更とし、REQ-050-001 を更新する。セットアップは worktree 環境で冪等に動作する。
      4. 新規恒久統制として DEC-001 決定4 の7条件立証は次のとおり: 再現する問題は投影忘れによる IR-016 違反
         と検査省略、強制に値する被害は配布物破損の main 反映、削除・統合では防げない理由は人手・自己申告の
         忘却は物理ブロックでしか防止できないこと、実行可能性は git hooks 標準機構と決定的チェッカーで担保
         されること、単一の所有者は pre-commit/pre-push スクリプト、削減される旧機構はなし、再評価条件は
         実行時間の実測（目標2秒/10秒の超過）とバイパス運用の発生状況とする。

      ## 代替案

      GitHub Actions の再導入は対象外（ローカル Git Hook への移行が方針）。pre-push 単独はコミット積み上げ後の
      発見となるため pre-commit 併用を採用。

      ## 結果と影響

      新規収容REQの作業単位行（pre-commit/pre-push/setup-hooks）が要件を所有する。新規 Design
      （local-verification-gates）が実行契約を所有する。REQ-050-001 の3本化、.gitattributes の eol=lf 追加、
      README-INSTALL.md の手順追記を伴う。

      ## 関係

      relates-to DEC-063（CI 撤去が空けた実行基盤領域への新規判断記録）、DEC-021（公開入口2本固定の3本への
      限定拡張）、DEC-064（実験・ロールバック許容の原則と --no-verify バイパス許容の整合）。
  - id: ACT-DEC-003
    artifact: decision
    operation: update
    target: docs/decisions/DEC-028.md
    source_items: [AG-002]
    content: |
      【本文冒頭への部分置換注記の追記（既存の B3-4 部分置換注記の直後に配置）】

      > 部分置換注記（整合性検証体制の中核化、2026-11-18 確定）: 本 Decision のうち本体リポジトリにおける文章
      > 表層品質の共通自動検査運用（プロジェクト側設定と、Plugin による書込み前検査・最終検査の本体実行接続）は
      > 新規 Decision「整合性検証体制の中核化」が部分置換する。Plugin 製品としての決定（textlint 採用、Plugin に
      > よる書込み前検査と最終検査の同じ基盤使用、標準規則と実行および配布の接続の所有）は維持する。

      【frontmatter supersede_note への追記文】

      本体リポジトリにおける共通自動検査運用の終了は新規 Decision（整合性検証体制の中核化）が部分置換する（Plugin 製品としての決定は維持）

      【docs/decisions/README.md の索引反映】

      決定インデックスは自動生成（title 注記の反映を含む）に従う。
  - id: ACT-DESIGN-001
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: integrity
      slug: integrity-engine-plugin-architecture
    canonical_owner: 整合性検証エンジン（repo-agentdev-integrity）のアーキテクチャ契約
    source_items: [AG-005, AG-006, AG-007, AG-011]
    content: |
      ---
      title: 検証エンジン プラグインアーキテクチャ Design
      status: draft
      created: 2026-11-18
      ---

      # 検証エンジン プラグインアーキテクチャ Design

      repo-agentdev-integrity 検証エンジンのプラグイン型アーキテクチャ、共有コンテキストキャッシュ、差分実行、
      自動起票、カタログ自動生成の契約を所有する（検証体制中核化 Decision の実行契約）。

      ## モジュール構成（src/ 正本）

      正本は src/ 配下（既存 src/ 構造に準拠）とし、.opencode/ 側を投影として管理する（repo-local・配布対象外は
      維持。IR-016/IR-068 の投影マニフェストに copy 投影として登録）。

      - scripts/cli.ts: エントリーポイント（--changed / --emit-intake / --rule <id> / --json）
      - scripts/generate_indexes.ts: 残存ルールから integrity-rule-catalog.md と各種 README を生成
      - scripts/check_autogen_freshness.ts: インデックス鮮度検査
      - engine/types.ts: IntegrityRule、IntegrityContext、RuleViolation の型定義
      - engine/context.ts: 単一走査・AST/YAML/リンクキャッシュ構築エンジン
      - engine/runner.ts: glob フィルタリング・並列実行オーケストレータ
      - engine/reporter.ts: 標準出力フォーマットと --emit-intake 自動起票
      - rules/index.ts: 全ルールのレジストリ
      - rules/ir-001.ts 〜: 1ルール1ファイル（24+IR-075 モジュール）
      - lib/: 共通ユーティリティ（minimal-yaml、glob_walk 等）
      - trusted-distribution-gate/: 配布境界検証モジュール群
      - data/: distribution-targets.yaml、skill-projection-manifest.yaml

      ## IntegrityRule インターフェース

      RuleViolation は ruleId、severity（error/warning）、filePath、line（任意）、message、remediationHint（任意）を
      持つ。IntegrityRule は id、slug、title、description、relatedReqs、targetGlobs（差分実行のトリガーパス）、
      globalScan（全体整合が必要な相互参照系は true）、severity、check(ctx) を持つ。

      ## 共有コンテキストキャッシュ

      buildContext 実行時に対象ディレクトリ（docs/、src/、.opencode/、.agentdev/、traceability/）配下の
      Markdown/YAML を1度だけ走査し、Map<string, ParsedFile> に格納する。ParsedFile は path（リポジトリルート
      相対）、rawContent、lines、frontmatter（YAML パース済み）、markdownLinks（抽出済み相対リンク配列）、
      reqReferences（抽出済み REQ/DEC 参照配列）を保持する。個別ルール内での fs.readFileSync・glob 直接呼出を
      禁止し、ctx.files または ctx.getFilesByGlob(pattern) 経由で取得する。

      ## 差分実行・自動起票ランナー

      cli.ts --changed は git diff --cached --name-only（ステージング空の場合は git diff --name-only HEAD）から
      変更ファイル一覧を取得し、各ルールの targetGlobs と照合し、マッチするルール（と globalScan: true の最小限の
      相互参照ルール）のみを並列実行する。変更ファイルが対象外のみの場合は即座に Exit Code 0 で終了する。
      cli.ts --emit-intake は severity: warning の RuleViolation を
      .agentdev/intake/inbox/YYYY-MM-DD-auto-<rule-id-lower>.md として自動生成し、同一 rule-id の自動起票
      ファイルが既に存在する場合は新規作成せずスキップする（冪等性）。

      ## カタログ自動生成（単一ソース）

      generate_indexes.ts は rules/index.ts に登録された全 IntegrityRule オブジェクトのメタデータ（id、title、
      description、relatedReqs、severity）から docs/designs/integrity/integrity-rule-catalog.md を自動生成する。
      ドキュメントと実装の二重管理を廃止し、レジストリが単一ソースとなる。

      ## 保持する検査能力

      旧構造から以下の検査能力を新構造へ移行して保持する: sidecar malformed-declarations 重複キー検出
      （REQ-117-006）、未追跡かつ gitignore 管理対象外ファイル検出（REQ-010-084）、既知混入形の異言語文字混入
      検出（REQ-010-083）、残存24ルールの全検出内容、IR-075（ir-file-size、対象・250行総行数判定・references/
      除外・行数とバイト数の両方を出力するエラーメッセージ）。

      ## テスト構成

      scripts/rules/rules.test.ts が残存ルールの正常系・異常系をインメモリ IntegrityContext モックで検証する。
      trusted-distribution-gate の境界テストは boundary-pipeline.test.ts・boundary-gate.test.ts に統合する。

      ## 対象外

      Git Hook スクリプトの実行契約（local-verification-gates Design）、intake-triage コマンド
      （commands/intake-triage Design）、配布境界の意味モデル（distribution-boundary Design）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: integrity
      slug: local-verification-gates
    canonical_owner: ローカル検証ゲート（pre-commit/pre-push/setup-hooks）の実行契約
    source_items: [AG-008, AG-009, AG-010]
    content: |
      ---
      title: ローカル検証ゲート Design
      status: draft
      created: 2026-11-18
      ---

      # ローカル検証ゲート Design

      バージョン管理された Git Hook による決定論的ローカル検証ゲートの実行契約を所有する
      （ローカル Git Hook 決定論的ゲート Decision の実行契約）。

      ## pre-commit（scripts/git-hooks/pre-commit、目標2秒）

      シェルスクリプト本体は薄いラッパーとし、実処理は TypeScript（Bun 実行）または #!/usr/bin/env bash
      （set -euo pipefail）で明確なエラーメッセージを出力する構成とする。REPO_ROOT は
      git rev-parse --show-toplevel を起点とする（worktree 環境対応）。

      - Step 1（src/ → .opencode/ 自動投影・同期）: git diff --cached --name-only に src/ 配下のファイルが
        含まれる場合のみ投影・ビルドスクリプトを自動実行し、投影で更新された .opencode/ 配下の差分を
        git add .opencode/ でステージングへ追加する（投影忘れによる IR-016 違反の未然防止）。
      - Step 2（差分整合性チェック）: bun run "$REPO_ROOT/.opencode/skills/repo-agentdev-integrity/scripts/cli.ts" --changed
        を実行し、ステージングされたファイルに関連する IR ルールのみを高速検証する。
      - Step 3（インデックス鮮度チェック）: docs/ や src/ に変更が含まれる場合
        bun run "$REPO_ROOT/.opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts" を実行する。
      - いずれかの失敗は非ゼロ終了でコミットを物理ブロックする。緊急バイパス規定として
        git commit --no-verify の許容をエラーメッセージに案内する。

      ## pre-push（scripts/git-hooks/pre-push、目標10秒）

      - Step 1: cli.ts 全量実行（全24+IR-075 ルールをリポジトリ全体へ適用）。
      - Step 2: トレーサビリティ検証（bun run "$REPO_ROOT/src/common/skills/agentdev-traceability/scripts/src/check.ts"
        または投影先スクリプト）。
      - Step 3: bun test "$REPO_ROOT/.opencode/skills/repo-agentdev-integrity/scripts/"（実行形態は REQ-060 に従う）。

      ## セットアップ（scripts/setup-hooks.ts）

      git rev-parse --git-common-dir と --show-toplevel で通常クローンと worktree の双方に対応する。
      git config core.hooksPath scripts/git-hooks を冪等に設定（設定済みはスキップ）、両フックスクリプトへ
      実行権限（fs.chmodSync 0o755）を付与、.gitattributes へ scripts/git-hooks/* text eol=lf を追記する
      （CRLF 混入による実行エラー防止）。README-INSTALL.md のセットアップ手順に
      bun run scripts/setup-hooks.ts の実行と git config --get core.hooksPath の確認を記載する。
      ルート package.json は存在しないため scripts セクション追記は適用外とする。

      ## 対象外

      検証エンジン自体のアーキテクチャ（integrity-engine-plugin-architecture Design）、GitHub Actions・CI
      （導入しない方針）、トレーサビリティ検証の検出内容（agentdev-traceability Design）。
  - id: ACT-DESIGN-003
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: commands
      slug: intake-triage
    canonical_owner: intake-triage コマンドの公開契約
    source_items: [AG-013]
    content: |
      ---
      title: intake-triage Design
      status: draft
      created: 2026-11-18
      ---

      # intake-triage Design

      本 command は .agentdev/intake/inbox/ と .agentdev/learning/inbox/ に蓄積した項目を人手を介さず高速消化する
      軽量自動トリアージコマンドである。公開コマンド分類（REQ-005-010）では補助フローに分類する。

      ## 入力

      - .agentdev/intake/inbox/*.md と .agentdev/learning/inbox/*.md（.gitkeep 除外）

      ## 出力

      - 処理結果サマリー（Route A 解決件数、Route B 破棄件数、Route C 昇格件数、残件 0 件の確認）
      - Route C 生成物: .agentdev/backlog/req-units/ への要件ユニット（REQ-039-007 の採番規律を適用）

      ## 実行アルゴリズム

      - Step 1（一括走査とクラスタリング）: 対象 inbox の全ファイルを読み込み、対象コンポーネント、関連 IR/REQ ID、
        問題の種類が重複・類似しているアイテムを1クラスタにグルーピングする。
      - Step 2（3ルート自動振り分けと即時実行）:
        - Route A（即時決済 / Quick-Fix）: タイポ修正、リンク切れ修復、未使用キー削除、既存設計書への1〜2文追記等、
          設計判断を伴わず1〜2ファイルで完結する軽微修正。その場で対象ファイルを直接修正し、処理済み inbox
          ファイルを削除する。
        - Route B（即時破棄 / Drop）: DEC-064 の原則（後方互換不要・過剰監視の排除・実験優先）に照らして
          不要・陳腐化している提案。理由を記録せず即座に削除する（DEC-064 原則3の処分理由明示は測定待ち案件の
          スコープと解釈し、未処理 inbox 項目の即時トリアージ処分は適用外とする。破棄はサマリー件数で把握できる）。
        - Route C（バックログ昇格 / Promote）: 複数ファイルの構造変更や新規設計が必要な案件。クラスタ単位で
          統合した要件ユニットを .agentdev/backlog/req-units/ に生成（REQ-039-007 の採番規律・履歴検査を適用）
          し、元の inbox ファイルを削除する。
      - Step 3（サマリー出力）: 処理結果（各ルート件数、残件 0 件の確認）を簡潔に報告する。

      ## 構成

      - 正本: src/common/commands/agentdev/intake-triage.md（200行以内の軽量設計。command は薄い入口とし
        workflow 手順本体は Workflow Skill へ委譲する〔REQ-002-001/002〕）
      - Workflow Skill: agentdev-workflow-intake-triage
      - 設計書: docs/designs/commands/intake-triage.md（本 Design）

      ## 対象外

      intake-promote の分類・評価・HITL（REQ-037）、backlog-review の統合判定（REQ-039）、learning-promote の
      評価（REQ-038）、adversarial-review。

      ## 検証観点

      - 3ルートの振り分け判定とクラスタリングの妥当性
      - Route C の RU 採番が REQ-039-007 に従うこと
      - 残件 0 件の確認とサマリー出力の完全性
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/quality/quality-specs.md
    target_area: ## 文書品質ルール
    canonical_owner: コマンド・スキル本文・コマンド Design 文書の行数上限の品質仕様
    source_items: [AG-011, AG-012]
    content: |
      ## 文書品質ルール

      以下の文書品質ルールの原本 Design として機能する（rule-ownership.md 参照）:

      - 行数上限: コマンド定義本文（src/**/commands/*.md と投影）、SKILL.md 本文（src/**/skills/*/SKILL.md と投影）、
        コマンド Design 文書（docs/designs/commands/*.md、_template.md を除く）は YAML Frontmatter を含む総行数
        250 行以内であること（8,192 bytes は目安の併記とし、バイト数のみの超過は違反としない）
      - 上限超過の解消手段: メインファイルは制御フロー骨格（150〜200行目標）とし、詳細仕様・判定マトリクス・
        委譲プロンプトテンプレート・異常系手順は references/<name>/ 配下へ分離する（段階的開示。
        **/references/**/*.md は行数上限の対象外）
      - 検出手順・エラーメッセージ形式の機械検査仕様は IR-075（ir-file-size）ルール定義が所有する
      - 執筆完了基準（Authoring DoD）: 行数、Steps、共通化、正規パス（`canonical path`）
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-learning-capture.md
    target_area: ## 提供する判断、操作
    canonical_owner: learning inbox 項目の構造スキーマ
    source_items: [AG-004]
    content: |
      ## 提供する判断、操作

      - 自律的検知、抽出
      - 1トピック1ファイル形式での learning item 生成: 保存先は .agentdev/learning/inbox/YYYY-MM-DD-<slug>.md
        （命名規則と YAML Frontmatter スキーマ〔id: learn-YYYYMMDD-<slug>、created_at: YYYY-MM-DD、source、
        status: inbox〕は .agentdev/intake/inbox/ と同一構造とする）。ファイル本文は13フィールド形式
        （問題事象、発生局面、検知方法、根本原因、自律対応内容、ユーザー確認有無、Decision/REQ/spec 影響、
        横展開観点、再発条件、予防策候補、想定反映先、関連、タグ）を保持する
      - Split Rule（learning vs intake 分離）
      - 閾値チェック（inbox ディレクトリ内の item 15件以上で promote 提案）

conflict_resolutions:
  - id: CR-001
    conflict: |
      IR-072・IR-073 の廃止が DEC-064 決定2の存続検査明言（IR-055・IR-059・IR-073 等）と REQ-010-081/084 の
      存続前提記述と衝突する。
    resolution: |
      実行指示書（2026-11-18 受領）が両ルールの廃止を明示列挙しており、DEC-064（2026-11-17 accepted）より後時の
      利用者明示判断として廃止を確定する。新規 Decision（ACT-DEC-001 決定2）で DEC-064 存続宣言の限定
      （IR-073 はルール登録終了、未追跡検出能力はエンジン検査として維持）を宣言し、REQ-010-081/085 の削除と
      REQ-010-084 の現行化をセットで実施する。
  - id: CR-002
    conflict: |
      intake-triage Route B「理由を記録せず即時破棄」と DEC-064 原則3「完全削除処分は処分理由の明示をもって
      決済記録とし、黙認と区別する」が正面衝突する疑い。
    resolution: |
      DEC-064 原則3の処分理由明示は「測定待ち案件（deferred/blocked 系の保留案件）」の二択即決のスコープと
      狭義に解釈する（DEC-064 決定4の狭義解釈と同型）。未処理 inbox 項目の即時トリアージ処分は適用外とし、
      破棄はサマリー件数で把握する。指示書が Route B の挙動を明示規定していることを採用根拠とし、
      intake-triage Design（ACT-DESIGN-003）にこの解釈を明記する。deferred 機構（REQ-038-006）の処分契約は不変。
  - id: CR-003
    conflict: |
      intake-triage Route C の RU 直接生成が、intake-promote（HITL あり）→ backlog-review の正規経路を通らない
      昇格となり、REQ-037-004（成果物配置先は inbox または promoted に限定）・REQ-039（RU 生成の正規経路）と緊張する。
    resolution: |
      指示書が Route C を明示規定していることを採用根拠とする。Route C の RU 生成には REQ-039-007 の採番規律
      （履歴検査込み）を適用し、RU は REQ-008-009 の一時成果物契約に従う。REQ-037-004 は intake pipeline の
      蓄積・採用成果物（inbox/promoted）への配置規定であり、triage 経由の RU は backlog 領域の成果物として
      区別する。収容REQの作業単位行と intake-triage Design にこの位置づけを明記する。
  - id: CR-004
    conflict: |
      検証エンジンの src/ 正本化が REQ-002-020「repo-local 専用 skill は .opencode/skills/ のまま管理し、
      src 昇格の対象外とすること」と衝突する。
    resolution: |
      指示書の確定事項3が src/ 正本化（.opencode/ 側を投影とする）を明示するため、REQ-002-020 を
      repo-agentdev-integrity に限る例外規定へ現行化する（ACT-REQ-006）。配布対象外・repo-local の位置づけは
      維持し、投影は IR-016/IR-068 のマニフェストに copy 投影として登録する。
  - id: CR-005
    conflict: |
      scripts/setup-hooks.ts の新設が REQ-050-001「scripts/ 直下の公開入口は2本に限定」と DEC-021
      （scripts 公開入口の2本固定と安定契約）と衝突する。
    resolution: |
      指示書が scripts/setup-hooks.ts の作成・実行と README-INSTALL 記載を必須としているため、REQ-050-001 を
      3本化（install.ps1・self-sync.ps1・setup-hooks.ts）へ現行化する（ACT-REQ-004）。DEC-021 との関係は
      新規 Decision（ACT-DEC-002 決定3）で3本への限定拡張として宣言する。
  - id: CR-006
    conflict: |
      Phase 3-2 の「ルート package.json の scripts セクション追記（setup:hooks・postinstall）」と、ルート
      package.json が存在しない実測が食い違う。
    resolution: |
      要件入力の確定事項5どおり、scripts セクション追記は適用外とする。setup-hooks.ts の作成・実行、
      core.hooksPath の確認、README-INSTALL.md への記載、.gitattributes への eol=lf 追加は必須として維持する。
  - id: CR-007
    conflict: |
      textlint プロジェクト側設定・runtime Design の削除により、REQ-053 の約20行（書込み前/完了前共通検査・
      ファイル単位結果・センチネル・決定的破損検査に依存する行）と REQ-010-071/075/079 の存立基盤が失われる。
    resolution: |
      REQ-053 は全面改訂（ACT-REQ-003）により検査機構に依存しない品質契約行のみ存置し、Plugin 本体は配布資産
      として維持する（Jev 先行評価 q5: 全面改訂 0.82、保守的な選択肢として存続行を保持）。REQ-010 は
      該当行の現行化・削除（ACT-REQ-002）で追従する。決定の記録は ACT-DEC-001 決定4が所有する。
      この処置は重要変更としてドラフト保存前に利用者へ事前通知済みである（2026-11-18）。
  - id: CR-008
    conflict: |
      指示書 1-4 の learning inbox 移行（inbox.md・deferred.md 削除）が、単一ファイル機構を規定する
      REQ-038-006（deferred.md 読込契約）・REQ-003-024（deferred 自動削除禁止）と衝突する。
    resolution: |
      deferred 機構自体は存続させ（DEC-064 決定4の狭義解釈・REQ-003-024 の安全境界と整合）、保存先を
      .agentdev/learning/deferred/ ディレクトリ（1トピック1ファイル、命名・frontmatter は inbox と同一、
      status で状態区分）へ移行する。AG-004・収容REQ行004・ACT-REQ-008（REQ-038-006 現行化）で規定する。
      現行 deferred.md の実データは 0 件（2026-11-18 実測）のためデータ移行は発生しない。
  - id: CR-009
    conflict: |
      REQ-117（完了済み作業単位）の検証列・受け入れ条件が廃止済み機構（check_integrity、IR-044/072/073、
      req-updated-freshness、check_content_corruption）を参照し、AG-007 の解体後に陳腐化する。
    resolution: |
      REQ-117-011 のみ現行スクリプト契約（prepare_definition_pr の拡張 step）であるため ACT-REQ-009 で
      現行化する。REQ-117-003/004/006 および REQ-119 の旧機構名参照は完了済み作業単位の検証手段記録
      （達成時点の手段の記録）であり歴史記録として維持し、現行契約として参照しない（docs/reports/ の
      歴史記録扱いと同型）。

operation_units:
  - ou_id: OU-001
    target_req: new:integrity-verification-refresh
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-010
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-003
    target_req: REQ-053
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-004
    target_req: REQ-050
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-005
    target_req: REQ-036
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-006
    target_req: REQ-002
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-007
    target_req: REQ-047
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-008
    target_req: REQ-038
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-009
    target_req: REQ-117
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-010
    target_req: REQ-094
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
      docs/designs/integrity/rules/ 配下の IR ルール定義ファイル数を機械的に数え、残存24個であることを確認する。
      廃止対象32ファイル（指示書列挙、実パス解決済み）が git 履歴から削除済みであることを git log で確認する。
    pass_criteria: |
      ルール定義ファイルが残存24個（+IR-075 新設後は25個）であり、廃止32ファイルの実在削除と過不足なし
      （廃止32＋残存24＝56）が確認できること。
    on_failure: |
      fix-and-reverify: 削除漏れ・誤削除を修正し、カタログ再生成後に再検証する。残存24の対応付けミスは
      AG-003 の移行判断へ戻して解消する。
  - id: TS-002
    target_item: AG-002
    verification: |
      AG-002 列挙対象（data 2 yaml、references/vocabulary-registry.md、authoring 2 Design、textlint 系3 Design、
      .agentdev/config/plugins/ 2 yml、textlint_guard_project_config.test.ts）の実在削除を確認する。削除資産名
      （廃止32 IR ID、旧 checker 名、textlint-quality-runtime、command-format-rules、vocabulary-registry、
      agentdev-textlint-guard-prh）で docs/・src/・.opencode/・.agentdev/・AGENTS.md を検索し、参照残存を確認する
      （検索範囲は修正対象列挙と一致させる。docs/reports/ と docs/requirements/retired/ は履歴記録として対象外
      とする。See Also 等の参照行の検索除外は削除対象への実リンクを含まない行に限定し、削除ファイルへの
      実リンクは IR-062 検出対象として除去する扱いを明示する）。
    pass_criteria: |
      列挙資産が全て削除済みであり、残存ドキュメントから削除資産への実パス参照・現行手順としての言及が
      0 件であること。Plugin 本体（src/opencode/plugins/agentdev-textlint-guard）は残存していること。
    on_failure: |
      fix-and-reverify: 参照残存箇所を特定して参照除去または文言現行化を行い、再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |
      .agentdev/learning/inbox/ と .agentdev/learning/deferred/ がディレクトリとして存在し（各 .gitkeep 配置）、
      inbox.md・deferred.md が削除済みであることを確認する。learning item のサンプル生成により命名規則（YYYY-MM-DD-<slug>.md）と frontmatter
      4フィールド（id/created_at/source/status）を検証する。learning-capture・learning-promote の関連スキル・
      設計書・workflow skill に旧パス（.agentdev/learning/inbox.md）参照が残らないことを検索で確認する。
    pass_criteria: |
      1トピック1ファイル構造とスキーマが要件どおりであり、旧パス参照が 0 件で、learning-promote が新構造で
      一巡動作すること。
    on_failure: |
      fix-and-reverify: スキーマ・パス修正を行い、learning-promote の動作再検証まで戻って解消する。
  - id: TS-004
    target_item: AG-005
    verification: |
      bun run .opencode/skills/repo-agentdev-integrity/scripts/cli.ts（全量実行）の Exit Code を確認する。
      src/ 正本と .opencode/ 投影の整合を投影チェック（IR-016/IR-068）で確認する。sidecar 重複キー検出・
      未追跡ファイル検出・異言語文字混入検出の回帰テストが存在し PASS することを確認する。
    pass_criteria: |
      cli.ts 全量実行が Exit 0、投影整合が維持、移行保持対象の3検査能力の回帰テストが全て PASS であること。
    on_failure: |
      fix-and-reverify: エンジン実装の該当ルールを修正し、全量実行と回帰テストの再実行で解消する。
  - id: TS-005
    target_item: AG-006
    verification: |
      対象外ファイルのみをステージした状態で cli.ts --changed を実行し即時 Exit 0 となることを確認する。
      対象ファイルを含むステージで該当ルールのみ実行されることを確認する。severity: warning を発生させる
      テストデータで --emit-intake を実行し自動起票ファイルが生成されること、同一 rule-id で再実行時に
      スキップされることを確認する。
    pass_criteria: |
      差分実行の即時 Exit 0・ルール選択・自動起票の冪等スキップが全て仕様どおり動作すること。
    on_failure: |
      fix-and-reverify: runner/reporter 実装を修正し、差分・起票の再検証で解消する。
  - id: TS-006
    target_item: AG-003
    verification: |
      bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts を実行し、生成された
      integrity-rule-catalog.md が rules レジストリ（24+IR-075）と一致することを確認する。カタログ本文を
      手編集した状態で再生成により上書きされることで単一ソース化を確認する。
    pass_criteria: |
      カタログがレジストリから自動生成され、24+IR-075 構成と一致すること。旧構造由来の放置チェッカー残存が
      ないこと。
    on_failure: |
      fix-and-reverify: レジストリまたは生成スクリプトを修正し、再生成で解消する。
  - id: TS-007
    target_item: AG-007
    verification: |
      AG-007 列挙の旧スクリプト・テストが削除済みであることを確認する。リポジトリルートを cwd とし ./ 付き
      パス指定で bun test を実行（REQ-060）し、全件 PASS・Exit 0 を確認する。boundary-pipeline.test.ts・
      boundary-gate.test.ts に統合された境界テストケースが重要ケース（配布境界の主要判定）をカバーしている
      ことを確認する。
    pass_criteria: |
      旧チェッカー削除済み、bun test 全緑（Exit 0）、統合境界テストが主要判定をカバーしていること。
    on_failure: |
      fix-and-reverify: テストまたは実装を修正して再実行する。統合漏れの境界ケースは boundary テストへ追加する。
  - id: TS-008
    target_item: AG-008
    verification: |
      bash scripts/git-hooks/pre-commit を直接実行しエラー0件・目標時間（2秒以内）で通過することを確認する。
      src/ 側に意図的な未投影変更をステージして実行し、投影自動実行と .opencode/ 自動ステージが働くことを
      確認する。250行超過ファイルをステージして実行し、ir-file-size 違反で非ゼロ終了（コミットブロック）と
      なることを確認する。エラーメッセージに --no-verify 案内が含まれることを確認する。
    pass_criteria: |
      正常系がエラー0件で通過、投影自動化が動作、違反時の物理ブロックとバイパス案内が確認できること。
      自動ステージが自変更（.opencode/ 投影分）のみを対象とすること。
    on_failure: |
      fix-and-reverify: hook スクリプト・投影起動・チェック呼出を修正し、正常系と違反系の再検証で解消する。
  - id: TS-009
    target_item: AG-009
    verification: |
      bash scripts/git-hooks/pre-push を直接実行し、全量整合性チェック・トレーサビリティ検査・bun test が
      全て Exit 0 で完了することと目標時間（10秒以内）を確認する。
    pass_criteria: |
      3 Step 全て Exit 0 で完了すること。
    on_failure: |
      fix-and-reverify: 検出された違反を本体側で解消するか、hook 実装を修正して再実行する。
  - id: TS-010
    target_item: AG-010
    verification: |
      bun run scripts/setup-hooks.ts を実行し、git config --get core.hooksPath が scripts/git-hooks を返す
      ことを確認する。再実行して冪等であること（設定済みスキップ）、.gitattributes に
      scripts/git-hooks/* text eol=lf が追記されていること、両フックスクリプトに実行権限が付与されている
      ことを確認する。worktree 環境で setup-hooks を実行し動作することを確認する。
    pass_criteria: |
      core.hooksPath 設定・冪等性・eol=lf 追記・実行権限・worktree 対応が全て確認できること。
    on_failure: |
      fix-and-reverify: setup-hooks 実装を修正し、再実行で解消する。
  - id: TS-011
    target_item: AG-011
    verification: |
      250行超過のテスト用 Markdown（Frontmatter 込み）を対象パスに配置して cli.ts を実行し、ir-file-size 違反が
      検出されること、エラーメッセージに行数とバイト数の両方が出力されることを確認する。**/references/**
      配下の 250 行超過ファイルが検出されないこと、249行ファイルとバイト数のみ超過のファイルが違反とならない
      ことを確認する。
    pass_criteria: |
      総行数判定・references/ 除外・バイト数のみの超過非違反・エラーメッセージ内容が仕様どおりであること。
    on_failure: |
      fix-and-reverify: ir-file-size ルール実装を修正し、境界ケースの再検証で解消する。
  - id: TS-012
    target_item: AG-012
    verification: |
      分割対象6ファイル（docs/designs/commands/ 5ファイル、repo-agentdev-integrity SKILL.md）と src 側正本の
      分割後行数を機械測定し、全て250行以内であることを確認する。分割後のメインファイルに references/ への
      明示参照と遅延読み込み指示が存在すること、references/ パスの実在が IR-008/IR-062 で検証されることを
      確認する。投影マニフェスト・ビルドスクリプトの走査対象に references/ が含まれることを確認する。
    pass_criteria: |
      対象全ファイルが250行以内、参照・遅延読み込み指示が明記、references/ リンク切れ 0 件、投影対象包含
      確認済みであること。
    on_failure: |
      fix-and-reverify: 分割構成を調整し、行数測定とリンク検証の再実行で解消する。
  - id: TS-013
    target_item: AG-013
    verification: |
      テスト用 inbox 項目（軽微修正・陳腐化提案・構造変更案件の3種）を .agentdev/intake/inbox/ と
      .agentdev/learning/inbox/ に配置して intake-triage を実行し、3ルートの振り分けと即時実行
      （A 修正・B 破棄・C RU 生成）とサマリー出力（各件数・残件 0 件）を確認する。Route C 生成 RU の採番が
      REQ-039-007 の規律に従うことを確認する。
    pass_criteria: |
      3ルートの振り分け・即時実行・残件 0 件のサマリー・RU 採番規律の適用が全て確認できること。
    on_failure: |
      fix-and-reverify: トリアージ判定またはコマンド実装を修正し、再実行で解消する。
  - id: TS-014
    target_item: AG-014
    verification: |
      traceability 検査（agentdev-traceability の check）を実行し、参照切れ（IR-062/IR-067 違反）が 0 件である
      ことを確認する。traceability/ 配下 YAML から削除 IR・旧チェッカーの紐付け除去を確認する。AGENTS.md の
      textlint 正規参照点記述が現行化されていることを確認する。
    pass_criteria: |
      トレーサビリティ検査合格、YAML 参照整合、AGENTS.md 現行化が確認できること。
    on_failure: |
      fix-and-reverify: sidecar・参照箇所を修正し、検査再実行で解消する。
  - id: TS-015
    target_item: AG-015
    verification: |
      git log で Phase 1〜4 の各フェーズ完了コミット（refactor(phase1)/refactor(phase2)/feat(phase3)/feat(phase4)）
      の存在を確認する。最終検証として投影スクリプト実行、generate_indexes 実行、bash scripts/git-hooks/pre-commit
      （ir-file-size 含めエラー0件）、bash scripts/git-hooks/pre-push（全量・トレーサビリティ・bun test）の全てが
      Exit 0 となることを確認する。実行時間を実測記録する。
    pass_criteria: |
      4フェーズのコミット存在と最終検証全項目 Exit 0、実測実行時間の記録が確認できること。
    on_failure: |
      fix-and-reverify: 検出された違反を解消し、最終検証全体を再実行する。

realization_actions:
  - id: RA-001
    concern: 廃止32 IR ルール定義ファイルと連動資産の削除
    responsibility: Phase 1 の削除操作（git rm）。指示書列挙の32ルールファイル、AG-002 列挙のデータ・設計書・設定・テストを削除する
    ownership_hints:
      - docs/designs/integrity/rules/（廃止32ファイル。指示書カテゴリA/B/C 列挙）
      - .opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml・delegation-contract-patterns.yaml・references/vocabulary-registry.md
      - docs/designs/authoring/command-file-format.md・vocabulary-registry.md（参照なし確認後に削除）
      - docs/designs/integrity/content-corruption-checker.md・prose-quality-sentinel-checks.md
      - docs/designs/quality/textlint-quality-runtime.md
      - .agentdev/config/plugins/agentdev-textlint-guard-prh.yml・agentdev-textlint-guard.yaml・textlint_guard_project_config.test.ts
    intent: DEC-064 原則に基づく過剰統制の削減。履歴性は Git 履歴で担保し対照表等の防衛的資産は作らない
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: 検証エンジンの src/ 実装と投影切替
    responsibility: プラグイン型エンジンの実装（Phase 2 一式）。src/ 正本配置、.opencode/ 投影化、IR-016/IR-068 マニフェストへの copy 投影登録、旧 .opencode/ 実ディレクトリの撤去（REQ-058 境界）
    ownership_hints:
      - src/ 配下の新設スキル構造（既存 src/common/skills/ 構造に準拠。ACT-DESIGN-001 のモジュール構成）
      - scripts/self-sync.ps1・runtime-package-boundary.md Design（走査対象・投影契約の現行化）
      - docs/designs/foundations/multi-host-canonical-model.md（投影モデルの対象追記）
      - docs/designs/integrity/integrity-rule-catalog.md・rule-ownership.md（自動生成による再構成）
      - docs/designs/integrity/rules/IR-075 新設ルール文書と残存24ルール文書の implementation_path 更新
    intent: 高速な差分・並列実行が可能なプラグイン構造への再構築と src 正本・.opencode 投影の単一方向化
    verification_refs: [TS-004, TS-005, TS-006]
    source_items: [AG-005, AG-006]
  - id: RA-003
    concern: Git Hook スクリプト・セットアップ資材の実装
    responsibility: scripts/git-hooks/pre-commit・pre-push・scripts/setup-hooks.ts の実装、.gitattributes 追記、README-INSTALL.md の手順追記
    ownership_hints:
      - scripts/git-hooks/pre-commit・pre-push（ACT-DESIGN-002 の実行契約）
      - scripts/setup-hooks.ts（REQ-050-001 3本化）
      - .gitattributes・README-INSTALL.md
    intent: CI 非依存の決定論的ローカルゲート。実装は DEC-062 以降の scripts 公開入口契約に従う
    verification_refs: [TS-008, TS-009, TS-010]
    source_items: [AG-008, AG-009, AG-010]
  - id: RA-004
    concern: 巨大コマンド・スキル6ファイルの分割
    responsibility: docs/designs/commands/ 5ファイルと repo-agentdev-integrity SKILL.md、および対応する src 側正本を骨格＋references/<name>/ 構造へ分割。遅延読み込み指示の明記、投影マニフェストの走査対象拡張
    ownership_hints:
      - docs/designs/commands/req-define.md・case-auto.md・case-run.md・case-close.md・case-open.md
      - src 側対応正本（分割対象スキル・コマンド）と .opencode/ 投影
      - agentdev-skill-authoring・agentdev-command-authoring の行数ガイドの 250 上限への整合
      - docs/designs/quality/design-health-metrics.md との閾値関係整理
    intent: Lost in the Middle 対策のプログレッシブ・ディスクロージャー（指示書 Phase 4-2 設計原則）
    verification_refs: [TS-011, TS-012]
    source_items: [AG-011, AG-012]
  - id: RA-005
    concern: AGENTS.md の現行化と残存ドキュメントの横断参照除去
    responsibility: AGENTS.md 行動規範の textlint 共通基盤正規参照点記述を Plugin 標準規則参照へ現行化する（ACT-DEC-001 決定4）。AG-014 の横断参照除去（integrity 系 Design〔RA-009〕・traceability YAML〔RA-006〕・learning パス更新〔RA-007〕の担当分を除く残存ドキュメント全体の参照除去）を所有する
    ownership_hints:
      - AGENTS.md（行動規範節）
      - docs/guides/（intake-learning-backlog-flow.md の learning/inbox.md・deferred.md 言及等）
      - docs/knowledge/
      - textlint・廃止資産への言及が残るその他の skill 定義・Design・テンプレート
    intent: 削除資産への参照除去（確定事項6）
    verification_refs: [TS-002, TS-014]
    source_items: [AG-014]
  - id: RA-006
    concern: traceability YAML のクリーンアップ
    responsibility: traceability/ 配下 YAML から削除 IR・旧チェッカーへの紐付け（verified_by/rules 等）を除去する
    ownership_hints:
      - traceability/（sidecar・policy）
    intent: 参照切れ（IR-062/IR-067 違反）の解消
    verification_refs: [TS-014]
    source_items: [AG-014]
  - id: RA-007
    concern: learning inbox 移行の機械的追随
    responsibility: inbox.md・deferred.md の削除、inbox/.gitkeep・deferred/.gitkeep 作成、deferred 項目の .agentdev/learning/deferred/ ディレクトリ移行、learning-capture/learning-promote/backlog-integration/backlog-review/case 系・req-define の各 Design・src スキル・workflow skill の .agentdev/learning パス更新、.agentdev/README.md 状態表の現行化
    ownership_hints:
      - .agentdev/learning/（inbox.md・deferred.md 削除、inbox/.gitkeep 作成）
      - docs/designs/commands/learning-promote.md（入力・出力・skip 条件の inbox.md 記述）と src 側正本
      - docs/designs/skills/agentdev-learning-pipeline.md・agentdev-backlog-integration.md
      - docs/designs/commands/backlog-review.md・case-close.md・case-run.md・case-auto.md・req-define.md
      - docs/designs/workflows/capture-boundaries.md・collaboration-loop.md・docs/designs/foundations/system.md
      - .agentdev/README.md（状態表）
    intent: 1トピック1ファイル構造への移行完遂（AG-004）。スキーマの正は ACT-DESIGN-005 と収容REQ行が所有
    verification_refs: [TS-003, TS-014]
    source_items: [AG-004]
  - id: RA-008
    concern: intake-triage コマンド・Workflow Skill の実装
    responsibility: src/common/commands/agentdev/intake-triage.md（200行以内）、agentdev-workflow-intake-triage スキル、コマンド README・索引（IR-024 整合）の追加
    ownership_hints:
      - src/common/commands/agentdev/intake-triage.md
      - src/common/skills/agentdev-workflow-intake-triage/（Workflow Skill 新設）
      - src/common/commands/agentdev/README.md・各種索引
    intent: 未処理 inbox の自動高速消化（指示書 Phase 4-3）
    verification_refs: [TS-013]
    source_items: [AG-013]
  - id: RA-009
    concern: integrity 系 Design・ checker 実行契約の現行化
    responsibility: integrity-contracts.md・checker-execution-contracts.md の checker パス・実行プロファイル記述の現行化、docs/designs/README.md の索引更新、IR-016 の旧スクリプト名（sync-opencode.ps1）記述の更新
    ownership_hints:
      - docs/designs/integrity/integrity-contracts.md・checker-execution-contracts.md・index-auto-generation.md
      - docs/designs/integrity/rules/IR-016-source-projection-integrity.md・IR-068-skill-projection-manifest.md
      - docs/designs/README.md（Design 索引・rules 行）
    intent: 新エンジン構造への契約追随と参照切れ防止
    verification_refs: [TS-002, TS-014]
    source_items: [AG-005, AG-014]
  - id: RA-010
    concern: trusted-distribution-gate テスト統合とフェーズ別コミット運用
    responsibility: バージョン履歴別テスト20ファイルの削除と boundary-pipeline.test.ts・boundary-gate.test.ts への統合。各フェーズ完了時の検証とローカルコミット（refactor(phase1..2)/feat(phase3..4)）、完了報告3項目の作成
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/（src 正本化後は src 側）
      - Git 操作は非対話経路（AGENTS.md ハーネス選定）
    intent: テスト資産のスリム化とフェーズ完遂の記録（指示書全体ルール2・完了条件）
    verification_refs: [TS-007, TS-015]
    source_items: [AG-007, AG-015]

review_dispositions:
  - id: RD-001
    source_item: req-input-arch-refactoring-20261118.対象外-1
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      GitHub Actions・CI の新設は要件入力の対象外宣言により本 draft 対象外。ローカル Git Hook への移行が方針。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-arch-refactoring-20261118.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: req-input-arch-refactoring-20261118.対象外-2
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      リリース公開・版タグ作成は対象外（本案件は開発工程のみ）。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-arch-refactoring-20261118.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_item: req-input-arch-refactoring-20261118.対象外-3
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      agentdev-textlint-guard Plugin 本体（src/opencode/plugins/ 等）の削除は対象外。削除対象は指示書列挙の
      プロジェクト側設定・設計書・テストのみであり、Plugin 本体は配布資産として維持する。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-arch-refactoring-20261118.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: true
  decomposition: |
    実行指示書の Phase 1〜4 を Wave 構成の参考とする。Phase 1（IR 減量・learning inbox 移行・連動資産削除）は
    Phase 2（エンジン再構築・src 正本化）に先行し、Phase 3（Git Hook ゲート）は Phase 2 の cli.ts を利用するため
    Phase 2 完了後、Phase 4（IR-075・分割・intake-triage・最終検証）は Phase 1〜3 の成果に依存する。
    REQ 行 001〜004 が Phase 1、005〜007 が Phase 2、008〜010 が Phase 3、011〜016 が Phase 4 におおむね対応する。
    Definition 系（REQ/Decision/Design の保存）は実装 Phase と並行して早期確定できる。
  wave_hints:
    - Wave 1: Definition 確定（OU-001〜010、Decision 2本＋DEC-028 現行化、Design 5アクション）+ Phase 1（AG-001〜004、RA-001、RA-005〔AGENTS.md 現行化〕、RA-006、RA-007）
    - Wave 2: Phase 2（AG-005〜007、RA-002、RA-009、RA-010 のテスト統合）
    - Wave 3: Phase 3（AG-008〜010、RA-003）
    - Wave 4: Phase 4（AG-011〜015、RA-004、RA-008、参照除去の最終一括確認（AG-014 最終 grep・TS-002/TS-014）、最終検証）
```

# summary

本 draft は実行指示書（architecture-refactoring-plan-20261118.md）を決定済み仕様として受理し、整合性検証体制の
刷新を16作業単位の収容 REQ として確定したものである。既存 REQ 6件の現行化（REQ-010 の9行処置・REQ-053 全面
改訂・REQ-050 の3本化・REQ-036 の2行・REQ-002-020 の例外規定・REQ-047 の2行）、新規 Decision 2件
（検証体制中核化・ローカル Git Hook ゲート）、Design 5アクション（エンジンアーキテクチャ・ローカル検証
ゲート・intake-triage の3新規、quality-specs・learning-capture の2更新）を定義する。実現面は realization_actions
10件に構造化した。重要変更（32 IR ルール廃止・textlint プロジェクト側運用廃止による REQ-053 全面改訂・
IR-072/073 廃止に伴う DEC-064 存続宣言の限定・REQ-002-020/REQ-050-001 の境界変更）はドラフト保存前に
利用者へ事前通知した（2026-11-18。通知は保存実行より先に出力）。対立判断は Jev 先行評価2件
（既存REQ照合: observation 20261118T041334Z-be69、最終分類: 20261118T041849Z-6da6）と
architecture-advisory 助言（4ラベル構造、2026-11-18）を経て確定し、衝突の解釈は conflict_resolutions に記録した。
STEP-8 adversarial-review（受理 8件・棄却 7件・未解決 0件）の受理済み指摘を反映済みである
（F-1: deferred 移行先の定義と REQ-038-006 現行化、F-2: REQ-010 適用範囲の変更後全文確定、F-3: REQ-053-009
契約行の存置、F-4: DEC-028 部分置換注記、F-5: REQ-117-011・REQ-094 の現行化、F-6: RA-005 の横断参照除去所有、
F-7: wave_hints の Wave 1 への参照除去移動、F-8: TS-002 の See Also 除外の限定）。
