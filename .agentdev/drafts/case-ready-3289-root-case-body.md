# proxy-case-ready: Root Case 本文確定候補（gh exit 66 blocked 時の resume payload）

> 本ファイルは case-ready STEP-4〜STEP-6 の Root Case 本文更新が agentdev_gh 起動環境障害（gh exit 66）で blocked となった際の resume payload である。
> resume 時は本本文を Custom Tool `agentdev_gh` issue_update（number: 3289）の body 引数としてそのまま渡す（verbatim）。

## 概要
<!-- 【必須】 -->

third-party 成果物（Skill 形式・package 形式の2形態、環境ツール対象外）の包括定義を文書で確立し、
宣言された third-party Skill を全環境で導入済みとする運用前提契約（導入系3経路の drift 検知と案内、
tool package 内 CLI 一括実行面、宣言解決の2候補化）を新規 REQ として確定する。
あわせて最初の実宣言として yomiyasu（commit hash 固定・ディレクトリ型・MIT）を導入し、
dry-run・実取得・drift 検知緑・git 管理外確認の実証で機構を固定する。

機能要件、非機能要件、制約、対象外、受け入れ条件は新規に作成せず合意済み入力を反映する。合意済み本文の正は draft-data（`.agentdev/drafts/req-draft-third-party-presupposition.md`）である。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #3289
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象 REQ
<!-- 【必須】 -->

- REQ-097: third-party 成果物の運用前提と導入検知

## Definition Package
<!-- 【必須】 -->

- 要件行: REQ-097 新規4行（REQ-097-001〜004）。変更後本文は canonical Definition（docs/requirements/REQ-097.md）として確定済み
- Decision: 新規 Decision なし（DEC-023/047/021 の枠内の機構詳細。req-define で Decision 追加不要と判定済み。case-ready 受理評価: 評価対象 0 件・accepted 遷移なし）
- Design: `docs/designs/local/third-party-skill-management.md` へ新規4節追加済み（third-party 成果物の包括定義／宣言ファイルの配置と解決（2候補）／一括実行面（cli.ts）／drift 検知（導入系3経路））。ADF-COVERS(design) 宣言（REQ-097-001〜004）含む
- Issue 構成案: OU-001 1件（target_req: REQ-097、operation: create、scale: standard、issue_policy: single、depends_on: []、recommended_order: 1）。Epic 構成なし
- 受入条件一式: Execution Contract「テスト戦略」TS-001〜TS-010（本本文へ投影済み）
- realization_actions: RA-001〜RA-007（本本文 Execution Contract「変更対象成果物」へ投影済み）
- Definition PR: merge 済み: #3290（追加承認なしで自動確定）

## Execution Contract
<!-- 【必須】 -->

- 対象範囲: third-party 成果物の包括定義と文書化（glossary、third-party Skill 管理 Design、README-INSTALL）、取得機構の一括実行面（src/opencode/tools/agentdev-third-party/ 内 CLI）、宣言ファイルの2候補解決、導入系3経路（scripts/install.ps1、scripts/self-sync.ps1、scripts/consumer/archive/install.ps1）の drift 検知、最初の実宣言（yomiyasu）と実証。対象外: 環境ツール（bun、git、gh、OpenCode）の検知・宣言・インストール支援、release archive への skills.yaml 収録（consumer は .agentdev/third-party/ で自己宣言するため）、宣言の自動生成・自動取得（REQ-009-050 維持）、Provenance 履歴の拡張、package 形式の新たな検知（既存 textlint vendor 検知のまま）、複数 third-party Skill 運用への拡張（1エントリで機構を固める。2つ目以降は後続要件）、package-release-archive.ps1 への skills.yaml 収録要否検証の新規実装。制約: REQ-009-046（導入系 network access 禁止）、REQ-009-050（導入系の取得不実施）、REQ-002-042〜044（third-party Skill の宣言・取得・配布契約）を維持する。Windows UTF-8 編集規律（per-line string replace、PowerShell リダイレクト禁止）を遵守する。ADF-COVERS 宣言行を編集時に保持する
- 変更対象成果物（実現面）: src/opencode/tools/agentdev-third-party/cli.ts（新設・RA-001）、src/opencode/tools/agentdev-third-party/README.md（使用方法追記・RA-007）、src/opencode/plugins/agentdev-third-party-tool/plugin.ts（resolveDeclarationPath 2候補化・RA-002）、scripts/install.ps1・scripts/self-sync.ps1・scripts/consumer/archive/install.ps1（drift 検知追加・3経路1コミット同期・RA-003）、src/third-party/skills.yaml（yomiyasu 宣言追加・RA-004）、README-INSTALL.md（third-party 全体像節新設・RA-005）、docs/guides/glossary.md（third-party 成果物定義追記・RA-006）。確定済み Definition（docs/requirements/REQ-097.md、docs/designs/local/third-party-skill-management.md、docs/README.md、docs/requirements/README.md、docs/designs/quality/req-health-metrics.md）は PR #3290 で確定済みのため case-run で変更しない
- 関連 REQ / Decision / Design: REQ-097（REQ-097-001〜004）。参照維持 REQ: REQ-002-012、REQ-002-042〜044、REQ-009-046、REQ-009-050、REQ-029-009、REQ-029-012、REQ-029-013、REQ-050-001。Decision: 新規なし・受理評価対象 0 件（DEC-023・DEC-047・DEC-021 は機構詳細の参照維持、意味不変）。Design: docs/designs/local/third-party-skill-management.md
- 完了条件:
  - [ ] RA-001〜RA-007 の実現面が全て実装済みである（cli.ts 新設、resolveDeclarationPath 2候補化、導入系3経路 drift 検知、yomiyasu 宣言、README-INSTALL 節、glossary 定義、tool README 追記）
  - [ ] テスト戦略 TS-001〜TS-010 に基づく検証が全て pass している（on_failure 発動時は fix-and-reverify 後の pass をもって合格）
  - [ ] 実装が確定済み Definition（REQ-097-001〜004、Design 4節）と整合している
  - [ ] 必須品質統制（文書品質査読、配布境界 checker、self release tests）が合格している
  - [ ] 導入系3経路の drift 検知追加が同一コミットに含まれている（TS-009・部分適用なし）
- テスト戦略: 合意済み draft-data test_strategy TS-001〜TS-010 をそのまま投影する（verification / pass_criteria / on_failure の3要素）:
  - TS-001（target: AG-003 / refs: RA-001）verification: 本体 repo root を cwd とし bun src/opencode/tools/agentdev-third-party/cli.ts --dry-run を実行する（name 省略=全宣言一括）。表示される取得計画（対象、配置先、dry-run である旨）を記録する。pass_criteria: dry-run が取得計画を表示し、配置を伴わず、終了コード 0 で完了する。宣言（yomiyasu 1エントリ）が計画に含まれる。on_failure: fix-and-reverify を選択する。CLI の引数解きまたは engine 呼出の不具合を修正して再実行する。一括実行面は本要件の中核であり記録のみでは完了しない
  - TS-002（target: AG-005 / refs: RA-001, RA-004）verification: bun src/opencode/tools/agentdev-third-party/cli.ts を実行して実取得する。.opencode/skills/yomiyasu/ 配下の SKILL.md とディレクトリ構成を読み戻し、provenance マーカーの存在を確認する。pass_criteria: yomiyasu が .opencode/skills/yomiyasu/ へ配置され、読み戻し検証（fail-closed の read-back）が成功し、終了コード 0 となる。on_failure: fix-and-reverify を選択する。取得トランスポートまたは配置検証の不具合を修正し再取得する
  - TS-003（target: AG-002 / refs: RA-003, RA-004）verification: yomiyasu 取得済み状態で scripts/install.ps1 -Mode check と scripts/self-sync.ps1 -Mode check を実行する。third-party drift 検知の実行結果（検査対象、違反 0）を記録する。pass_criteria: 両 check が third-party 宣言=配置の drift なしを報告し（検査が実行され、違反 0）、check 全体として合格の終了コードを返す。on_failure: fix-and-reverify を選択する。検知器または配置の不整合を修正して再実行する
  - TS-004（target: AG-002 / refs: RA-003）verification: 検証環境で .opencode/skills/yomiyasu/ を一時的に退避し、scripts/install.ps1 -Mode check と scripts/self-sync.ps1 -Mode check を実行して cli.ts 案内文の表示と終了コードを確認する。確認後ただちに配置を復元し、check が緑に戻ることを確認する。pass_criteria: 宣言済み・配置欠落が ERROR 停止（終了コード分離）として報告され、cli.ts への案内が表示される（install.ps1・self-sync.ps1 の両経路）。復元後に check が緑に戻る。on_failure: fix-and-reverify を選択する。検知分岐または案内文を修正する。fail-closed 停止は本要件の中核契約のため記録のみでは完了しない
  - TS-005（target: AG-004 / refs: RA-002, RA-003）verification: (a) 宣言ファイルを2候補とも置かない検証環境（consumer 想定）で scripts/install.ps1 -Mode check と scripts/self-sync.ps1 -Mode check を実行する。(b) .agentdev/third-party/skills.yaml に最小宣言を配置した検証環境で cli.ts --dry-run を実行する。pass_criteria: (a) 宣言不在環境で third-party 検査が検査対象外として正常扱いとなり（ERROR 停止しない）導入系 check が完了する。(b) consumer 宣言配置環境で cli.ts の dry-run が当該宣言の取得計画を表示する。on_failure: fix-and-reverify を選択する。宣言不在分岐またはフォールバック解決を修正する
  - TS-006（target: AG-005 / refs: RA-004）verification: git check-ignore .opencode/skills/yomiyasu/SKILL.md（配置代表パス）を実行する。pass_criteria: check-ignore が当該パスを無視対象として報告する（gitignore 特例が機能し、配置が git 追跡外である）。on_failure: fix-and-reverify を選択する。gitignore 設定を修正する（REQ-002-043 の Git 管理対象外契約に違反するため）
  - TS-007（target: AG-003 / refs: RA-001）verification: 配布境界 checker（agentdev-distribution-boundary-guard、--root .）と self release tests（各 plugin 配下 test suite）を実行する。あわせて cli.ts を含む tool package が release archive 投影に含まれること、および依存成果物未生成の環境（node_modules なし）で cli.ts --dry-run が動作することを確認する。pass_criteria: checker と self release tests が pass する。cli.ts の runtime 依存が bun 組み込みのみで解決され、archive 提供 consumer 環境で dry-run が動作する。on_failure: fix-and-reverify を選択する。配布境界違反または依存解決の問題を修正する
  - TS-008（target: AG-001 / refs: RA-005, RA-006）verification: README-INSTALL.md の third-party 節と docs/guides/glossary.md の third-party 成果物定義を確認する。README-INSTALL の節が2形態表（宣言の場所・解決手順・配置先・drift 検知の意味）と consumer での導入手順（.agentdev/third-party/skills.yaml 作成 → cli.ts 実行）を含むことを確認する。pass_criteria: 両文書の該当節・エントリが存在し、README-INSTALL.md を読むだけで consumer での third-party 導入手順が完結する内容である。on_failure: fix-and-reverify を選択する。文書を補完して再確認する
  - TS-009（target: AG-002 / refs: RA-003）verification: 3経路の drift 検知追加を含む同期コミットの diff において、scripts/install.ps1、scripts/self-sync.ps1、scripts/consumer/archive/install.ps1 の3経路すべてに検知追加が含まれることを確認する。参照行（See Also 等）は検出対象外とする。pass_criteria: 3経路の検知追加が同一コミットに含まれる（部分適用がない）。on_failure: fix-and-reverify を選択する。欠落経路を同一コミットへ追加する。検知の部分適用は3経路同期契約に違反するため記録のみでは完了しない
  - TS-010（target: AG-002 / refs: RA-003）verification: ステージングした仮想 consumer 環境（archive 展開構成で、src/third-party/ と .agentdev/third-party/ のいずれの宣言も不在）において、scripts/consumer/archive/install.ps1 -Mode copy を1回実行し、third-party 検知の出力と終了コードを記録する。consumer archive installer には check モードが存在しないため、copy 実行の正常完了で検証する。pass_criteria: 宣言不在（2候補とも不在）のため third-party 検知が検査対象外として正常扱いとなり、ERROR 停止せずにインストール処理が完了する（CR-001 の archive 環境常時経路の実証）。on_failure: fix-and-reverify を選択する。宣言不在分岐の誤実装（ERROR 停止等）を修正して再実行する。archive 提供 consumer 環境がすべて停止する回帰に相当するため記録のみでは完了しない
- 必須品質統制: 変更対象成果物の種別から導出する。(1) 文書変更（README-INSTALL.md、docs/guides/glossary.md、src/opencode/tools/agentdev-third-party/README.md）→ 文書品質査読（textlint、agentdev-textlint-guard 共通基盤・prh 辞書）。(2) 実装変更（cli.ts、plugin.ts、導入系3経路、skills.yaml）→ テスト実行（self release tests・各 plugin 配下 test suite）と配布境界 checker（agentdev-distribution-boundary-guard、TS-007）。(3) 導入系3経路は1コミット同期（TS-009）を必須品質統制として適用する。(4) 関連 Decision の拘束条件: DEC-021（scripts 公開入口境界）と DEC-023・DEC-047（取得経路・lockfile 正）は Design 4節で解決済みのため追加制約なし（CR-002 / CR-003 / CR-005）
- scope-affecting impact candidate: 横断依存検査（case-open 実測・case-ready 確認）: 未クローズ Issue は #3289 のみ・警告 0 件。cli.ts 追加と scripts 公開入口境界（REQ-050-001、DEC-021）の関係は Design「一括実行面（cli.ts）」節で非該当と解決済み（CR-002）。cli.ts の network access と導入系 network access 禁止（REQ-009-046/050）の関係は CR-003 で非違と解決済み。宣言不在環境の扱いは CR-001 で解決済み。対象範囲拡大を要求する影響候補なし
- review 発動契約: 該当なし（ユーザー明示指定なし。req-define の adversarial-review（PASS-with-findings）採用分は draft 本文へ反映済みで、本 Case での新規発動契約なし）
- work_type / scale / Issue structure: feature / standard / Standard（単一 execution unit。OU-001: target_req REQ-097、operation create、scale standard、issue_policy single、depends_on なし、recommended_order 1。Child Issue / Wave / 依存構造なし）

## Case 状態と次工程
<!-- 【必須】 -->

- 状態: ready
- 実行構造: Standard（単一 execution unit）
- 次工程: `case-run`

## レビュー判断
<!-- 【必須】 -->

該当なし（draft-data に `review_dispositions` なし。req-define の adversarial-review（PASS-with-findings）の採用分は draft 本文へ反映済み）

## 補足情報（オプション）

- work_type: feature / scale: standard（draft-data 宣言値）
- 対象 REQ 番号 REQ-097 は case-open 実行時に決定的採番スクリプト（alloc-req-number.ts）で採番確定済み
- `conflict_resolutions` CR-001〜CR-005 は記録済みのため本 Case では再確認しない
- case-ready 受入検査実測（2026-10-01）: PR #3290 は isDraft false / MERGEABLE / CLEAN / checks なし、head f85216a085ba7638b233805e4951bf8ab5e131c1 は case-open 検査時から不変。忠実性（draft 投影と行単位一致）、整合性（frontmatter id↔filename、README entry、AUTOGEN カウント 58→59）、traceability（REQ-097-001〜004 ↔ ADF-COVERS(design) 4宣言、missing-design 0）を確認
