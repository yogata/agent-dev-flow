# proxy-case-open: Root Case 本文候補（gh exit 66 blocked 時の resume payload）

> 本ファイルは case-open STEP-2 の Root Case 作成が agentdev_gh 起動環境障害（gh exit 66）で blocked となった際の resume payload である。
> resume 時は本本文を Custom Tool `agentdev_gh` issue_create の body 引数としてそのまま渡す（verbatim）。
> 作成後、`adf_case` 行と「Case 状態と次工程」セクションの Definition PR 行を issue_update で埋め戻す。

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

- adf_case: N/A（Issue 作成後に埋め戻し）
- adf_execution_unit: N/A（実行構成未確定。case-ready が execution contract 確定後に確定する）

## 対象 REQ
<!-- 【必須】 -->

- REQ-097: third-party 成果物の運用前提と導入検知

## Definition Package
<!-- 【必須】 -->

- 要件行: REQ-097 新規4行（REQ-097-001〜004）。変更後本文は draft-data `artifact_actions` ACT-REQ-001 を正とし、Definition PR branch `docs/requirements/REQ-097.md` として作成する
- Decision: 新規 Decision なし（DEC-023/047/021 の枠内の機構詳細。req-define で Decision 追加不要と判定済み。accepted 遷移なし）
- Design: `docs/designs/local/third-party-skill-management.md` へ新規4節追加（ACT-DESIGN-001。target_area「## third-party 成果物の包括定義」、placement before_anchor、anchor「## Design で確定する実装判断」。既存節は全て不変）。REQ 行変更に伴う ADF-COVERS(design) 宣言追随を同一 PR へ含める
- Issue 構成案: OU-001 1件（target_req: REQ-097、operation: create、scale: standard、issue_policy: single、depends_on: []、recommended_order: 1）。Epic 構成なし（case_open_hints.epic_needed: false、wave_hints: []）
- 受入条件一式: draft-data `test_strategy` TS-001〜TS-010（合意済み入力をそのまま引き継ぐ）
- realization_actions: RA-001〜RA-007（draft-data `realization_actions` を構成要素として保持する構造化ハンドオフ。execution contract への投影は case-ready が実行する）

## Case 状態と次工程
<!-- 【必須】 -->

- 状態: open
- Definition PR: 作成予定（case-open STEP-4。作成後に本節へ埋め戻す）
- 次工程: `case-ready`

## レビュー判断
<!-- 【必須】 -->

該当なし（draft-data に `review_dispositions` なし。req-define の adversarial-review（PASS-with-findings）の採用分は draft 本文へ反映済み）

## 補足情報（オプション）

- work_type: feature / scale: standard（draft-data 宣言値）
- 対象 REQ 番号は擬似採番 REQ-097。case-open 実行時に決定的採番スクリプト（alloc-req-number.ts）を実行済みで REQ-097 を確認（保存時に確定）
- `conflict_resolutions` CR-001〜CR-005 は記録済みのため本 Case では再確認しない
