---
status: draft
topic_slug: cleanup-gate-untracked-detection-extension
source: GitHub Issue #3828
created: "2026-10-22"
---

# 要件doc: クリーンアップ検証ゲートの検出対象拡張（一時作業領域・作業記録の追跡漏れ防止）

## 概要

クリーンアップ検証ゲートと恒常 checker（check_integrity）の両方に、未追跡かつ gitignore 管理対象外のファイル・ディレクトリの検出を追加し、#3826 で実証された3系統の運用漏れ（作業記録のコミット漏れ・一時作業領域の残置・削除漏れ）がすべて検出を素通りした状態を解消する。許容は gitignore（正規の非追跡領域宣言）と承認一覧（provenance 付きの恒久承認記録）で契約管理し、無制限な汎用検査による誤検知での運用停止を避ける。あわせて case-open の前提整備としての状態記録コミットを慣行から正規契約へ昇格する。

## 背景

- Issue #3828（追跡案件・maintenance）。#3826 で実証された検出不能:
  1. 作業記録のコミット漏れ: jev 観測5件（agent-dev-flow 側）・4件（staff-schedule 側）、第1回一気通貫実行の set-state、リリース草稿2件。いずれも git 管理対象契約を持つ状態記録で、コミット責任の所在とタイミングが契約化されず未追跡が蓄積した
  2. 一時作業領域の残置: `scratch/`（リポジトリ直下・3.2MB・8日間）が慣行で成立し、正規の一時領域 `.agentdev/tmp/`（gitignore 済み）と併存した。由来は審査委譲の書込み先指示で、配置契約を持たない領域が滞留しても誰も検出しなかった
  3. 削除漏れ: リポジトリ直下の `NUL`（誤リダイレクトの実体化）・空ファイル `inject.txt`。正規成果物ではないため契約検査の対象外で、未追跡ファイルとして放置された
- #3826 は実害の個別解消（コミット・削除・scratch/ 消滅）を完了済み（closed）。本件は恒久策（検出不能の解消）として起票
- 実行時点でも本 repo で jev 観測 8 件が未追跡のまま存在し（RU-0244 要件定義セッション由来）、問題が現在進行形であることを実証していた（後に Case #3839 の前提整備 commit e916d36ce で解消）
- 現行インフラ: `.gitignore` が第一層の許容集合（`.agentdev/tmp/`・`.agentdev/cache/`・`.agentdev/graph/`・`.agentdev/integrity/reports/`・`docs/reports/local/`・`.worktrees/` 等が正規の非追跡領域）。check_integrity は ng-baseline + exemptions による provenance 付き承認一覧の機構を既に持つ（delta が exit driver）。クリーンアップ検証ゲート（case-auto stage 2→3）と case-close は配布 workflow 契約（consumer 配布効果あり、case-close には決定的スクリプト close_mechanical_steps が存在）

## 合意内容（AG）

- **AG-001（載せ先・両方）**: 検出強化は既存の2仕組みの両方に載せる（新規ゲートは作成しない）。
  - クリーンアップ検証ゲート（case-auto の stage 2→3 ゲート）と case-close の完了判定工程: 配布 workflow 契約。lifecycle 時点のゼロ強制と consumer 配布効果を持つ（#3826 の staff-schedule 側漏れはこれでしか防げない）
  - check_integrity（repo-local 恒常 checker）: docs 変更ケース・docs-check で発火する棚卸し時点の蓄積検出。ケース外蓄積（リリース草稿・set-state 等 backlog-auto 出力）もここで検出する
- **AG-002（検出対象の正・許容集合）**: 検出対象はリポジトリの未追跡（untracked）かつ gitignore 管理対象外（non-ignored）のファイル・ディレクトリすべて。契約パス列挙には限定しない（scratch/ はまさに列挙外だった）。許容は承認一覧（provenance 付きの恒久承認記録、既存 ng-baseline と同一の管理方式）で管理し、承認一覧対象外の検出は fail（終了コード駆動）とする。承認の追加は人間の運用判断による明示承認として記録される
- **AG-003（前提整備の契約化）**: case-open の前提整備として、入力 RU・要件doc draft・関連する git 管理契約の状態記録（jev 観測等）に未追跡分がある場合、Root Case 確立に先立って commit する（慣行 c0b04146e・e916d36ce の契約化）。正常経路で未追跡を残さないことでゲート常時 green を維持する
- **AG-004（検出レイヤの補完関係）**: lifecycle gate はケース実行の完了時点でゼロ強制するが、ケース実行外の蓄積と発火タイミングの限界がある。恒常 checker は発火が docs 変更ケース等に依存するが repo 全体を棚卸しする。両レイヤは補完関係にあり、いずれか単独では要件を満たさない
- **AG-005（並行 Case 一時成果物の扱い）**: ライフサイクル時点の carve-out（実行中 draft 等の無条件許容）は設けず、並行 Case の in-flight 成果物を含めすべて検出し、許容は承認一覧で管理する（判断②の設計を踏襲）。承認一覧対象の消失後の整理は運用課題とする（調整事項へ記録）
- **AG-006（対象範囲）**: 3系統の運用漏れのうち系統1（コミット漏れ）と系統2（一時領域残置）を主対象とする（利用者指示「1,2それぞれ実行して」）。系統3（削除漏れ）は個別対処済み（#3826）であり、untracked 全般検出の自然被覆として明示対象にはしない

## 競合解決（CR）

- **CR-001**: Issue 本文に「本 issue の記載は確定要件ではない（着手時に req-define による要件化・壁打ちを経る）」とある一方、2026-10-21 の壁打ちで三判断（載せ先・検出対象の正・現行未追跡分の処置）が利用者により確定済み。→ draft は三判断を正とし、Issue 記載の方向案（案・確定ではない）は判断確定の経緯記録として扱う
- **CR-002**: Issue に「新規ゲートではなく既存検査への拡張が望ましい」とある。→ 新規ゲートは作成せず、クリーンアップ検証ゲート（検証項目追加）と check_integrity（検査追加）への拡張で確定
- **CR-003**: REQ-032-034 は全称・不存在条件（「残存0件」等）について正規契約から導出した評価範囲での反例探索を要求する。→ 新規検査の評価範囲は「git 管理契約から導出した全状態記録パス＋リポジトリ全体の untracked non-ignored」とし、変更ファイル限定の確認としない（REQ-032-042 の行文言に明記）
- **CR-004**: 承認一覧を gate 用と checker 用の2系統に分けると管理が分岐し腐敗する。→ 承認一覧の物理実体は当該リポジトリで単一の管理方式にまとめる。本 repo では既存 ng-baseline 方式を拡張して同一の承認記録を両検出レイヤから参照する（gate 側は repo 非依存の契約文言とし、物理実体は各リポジトリの運用に委ねる）

## 要件展開（変更対象・artifact_actions）

いずれも既存 REQ への行追加（append）。既存行の意味変更は含まない（design 対応事前確認の対象外。新規行は case-run で対応関係が作成される）。

### 1. REQ-010-084（docs-check 恒常 checker への検査追加）

追加行内容:

> REQ-010-084 | docs-check の恒常 checker（check_integrity）は、リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリを検出する検査を持つこと。許容は承認一覧（provenance 付きの恒久承認記録。既存 ng-baseline と同一の管理方式で物理実体を単一化）で管理し、承認一覧対象外の検出は NG として終了コードを駆動し、承認済み検出は承認記録として報告にとどめること。承認の追加は検出契機ごとに人間の運用判断による明示承認として記録され、検査実行が承認を自動追加しないこと。検査の採番・報告形式は既存検査（IR 採番規則）に従うこと

### 2. REQ-030-031（case-open 前提整備の契約化）

追加行内容:

> REQ-030-031 | case-open は Root Case 確立の前提整備として、入力 RU・要件doc draft・および当該要件定義に伴い生成された git 管理契約の状態記録（jev 観測等）に未追跡分がある場合、Root Case 作成に先立ってこれらを commit して git 管理状態へ置くこと。前提整備の commit は明示パス指定とし、スイープ操作を行わないこと

### 3. REQ-032-042（case-close 完了判定への検証追加）

追加行内容:

> REQ-032-042 | case-close は完了判定工程で、当該 Case 実行に関連して生成・更新された git 管理契約の状態記録（jev 観測、ローカル issues、capture 成果物等の正規契約で git 管理対象と宣言される記録）がコミット済みであること、およびリポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリが承認一覧対象外に残存しないことを検証し、未コミット・残存の検出時は完了扱いとしないこと。評価範囲は正規契約から導出した全状態記録パスとリポジトリ全体の未追跡対象とし（REQ-032-034）、変更ファイルのみの確認で達成しないこと。検証は機械工程（決定的スクリプト）で実行でき、帰属が機械判定できない検出は完了判定の前に人間確認事項として報告し、確認なしに完了判定へ進めないこと

### 4. REQ-034-048（クリーンアップ検証ゲートの検証対象拡張）

追加行内容:

> REQ-034-048 | case-auto のクリーンアップ検証ゲートは draft・RU・設計系 worktree・ブランチ残存に加え、リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリが承認一覧対象外に残存しないことを検証し、残存検出時は fail-closed で停止して残存対象と対応を報告すること。検証対象は対象リポジトリ全体の状態とし、作業 worktree ローカルの一時ファイルは case-close の既存一時ファイル検査の管轄として本検査と混同しないこと。許容は gitignore（正規の非追跡領域宣言）と承認一覧で管理し、ゲート実行が承認を自動追加しないこと

## 実現方針（RA）

- **RA-001**: REQ-034-048 を case-auto workflow 契約（SKILL.md・references のクリーンアップ検証ゲート記述）へ反映。検証項目の追加は既存 REQ-034-020（draft/RU 残存）・REQ-034-046（worktree/branch 残存）と同列の fail-closed 停止条件とする
- **RA-002**: REQ-032-042 を case-close workflow 契約へ反映し、完了判定工程への機械検査追加を close_mechanical_steps への検査ステップとして決定的化する（phase の所属〔pre-merge / post-merge〕と入力契約は実装設計で確定）。状態記録のコミット済み検証は「当該 Case 実行に関連して生成・更新された分」の帰属判定（Case 番号・実行期間・パス契約からの導出）を含む
- **RA-003**: REQ-010-084 を check_integrity（repo-local）へ実装。検出は `git ls-files --others --exclude-standard` 相当（untracked non-ignored）とし、承認一覧は既存 ng-baseline 方式の拡張（category/check/file/evidence/count/provenance/reason 構造を踏襲）で単一実体化。検出報告には gitignore（正規の非追跡領域）への追加提案と承認登録の手引きを併記し、許容判断の運用を閉じる
- **RA-004**: REQ-030-031 を case-open workflow 契約（前提整備手順）へ反映。慣行 c0b04146e・e916d36ce を正規契約へ昇格する
- **RA-005**: 配布境界を維持する: workflow 契約（case-auto/case-close/case-open の SKILL.md・references・close_mechanical_steps）は配布物（consumer に配布効果）、check_integrity は repo-local（配布対象外）。配布物の対応宣言は repository top-level traceability/ sidecar へ、docs REQ ファイルは inline ADF-COVERS 宣言へ従って case-run が作成する
- **RA-006**: 承認一覧の初期整備: 適用時点の本 repo は untracked 0（#3839 完了後 clean）のため初期承認登録は不要。適用後の新規検出は都度の明示承認で登録する。承認一覧エントリの陳腐化（対象消失後の残置）は棚卸し時の整理運用とする（調整事項参照）

## テスト戦略（TS）

- **TS-001 検出陽性**: 検証方法: 作業 worktree に seed した未追跡 non-ignored ファイル（リポジトリ直下と `.agentdev/` 契約外パスの両方）を用意し、新規 check_integrity 検査とゲート検証が検出することを確認する。合格条件: seed した全ファイルが承認一覧対象外として NG/fail-closed 停止で検出される
- **TS-002 許容**: 検証方法: gitignore 対象パス（`.agentdev/tmp/` 等）にファイルを置き検出対象外であること、承認一覧に provenance 付きで登録したパスが NG とならず承認記録として報告されることを確認する。合格条件: ignored は非検出、承認済みは非 NG・報告は承認区分で区別される
- **TS-003 ゲート試験**: 検証方法: クリーンアップ検証ゲートと case-close 完了判定が、残存検出時に fail-closed で停止/完了拒否し残存対象を報告することを確認する（契約記述とスクリプト検査の双方）。合格条件: 両ゲートの停止条件に未追跡残存が含まれ、スクリプト検査の拒否経路が動作する
- **TS-004 現行状態**: 検証方法: 適用後の本リポジトリで check_integrity を実行する。合格条件: 新規検査で unmanaged NG 0 件（適用時点の clean 状態が基準。既存検査の NG も 0 維持）
- **TS-005 既存検査非破壊**: 検証方法: check_integrity 既存検査・bun test 正規形 suite・配布依存境界 checker・textlint gate を実行する。合格条件: 既存検査は全 pass、配布境界は ok、新規検査追加による既存挙動の変化なし
- **TS-006 契約文書整合**: 検証方法: 追加 REQ 4行と workflow skill 定義（case-auto/case-close/case-open）・スクリプト実装の記述一致を確認する。合格条件: REQ 行文言が契約変更と過不足なく対応し、評価範囲が REQ-032-034 規範に適合する

## 見送り・判断記録（review_dispositions）

- 採用源: GitHub Issue #3828（追跡案件）＋2026-10-21 壁打ち三判断（質問応答で確定: ①両載せ ②untracked 全般＋承認一覧管理 ③case-open 前提整備でコミット）
- STEP-8 adversarial-review 実施済み（2026-10-22、2系統独立 challenge → counter-challenge → convergence audit）。accepted 3件を反映: REQ-034-048 へ検証対象位置の明確化（worktree ローカルとの混同防止）、REQ-032-042 へ帰属判定不能時の人間確認事項明記、RA-003 へ検出報告の案内併記（gitignore 追加提案・承認登録手引き）。却下 4件（in-flight draft 承認肥大は AG-005 利用者確定・REQ-030-031 により窗口最小化、REQ-010 配置は 081〜083 先例同一、B3 文言要件十分、B4 AG-004 明示受諾済み）。unresolved なユーザー判断事項なし
- 採用: 三判断、既存検査への拡張（CR-002）、承認一覧の単一実体化（CR-004）、系統1+2 を主対象（AG-006）
- 見送り: なし（系統3 削除漏れは #3826 で個別解消済み・untracked 検出の自然被覆）
- 前工程引き継ぎ（agentdev_handoff）: なし。本要件は producer リポジトリ自身の workflow 契約・repo-local checker の改善であり、当該 repo の通常要件docとして扱う

## 調整事項（coordination_notes）

- draft-generation.md STEP-9 の完了検証に「保存した draft ファイルを commit で git 永続化」とあるが、req-define SKILL.md の副作用制約（git コマンド実行禁止）と三判断③（draft は case-open 前提整備でコミット）に従い、本 draft は保存のみで commit しない。契約文書側の矛盾は別途 docs 整合の検討対象
- 承認一覧エントリの陳腐化整理（in-flight draft 消失後の残置エントリ）は運用課題。初回適用では発生しない（untracked 0 起点）
- close_mechanical_steps への検査追加位置（phase 所属・入力契約）と IR 採番は実装設計で確定する（本 draft は文言要件のみ拘束）
- Issue #3828 は本要件の Case 完了時にクローズ判定される（追跡案件の処置は case-close が所有）

# draft-data
```yaml
topic_slug: cleanup-gate-untracked-detection-extension
source:
  type: github_issue
  identifier: "3828"
  url: https://github.com/yogata/agent-dev-flow/issues/3828
work_type: feature
scale: standard
summary: >
  クリーンアップ検証ゲート（case-auto/case-close・配布 workflow 契約）と恒常 checker
  （check_integrity・repo-local）の両方へ、未追跡かつ gitignore 管理対象外のファイル・
  ディレクトリ検出を追加する。許容は承認一覧（ng-baseline 方式・provenance 付き）で
  契約管理する。あわせて case-open 前提整備の状態記録コミットを正規契約へ昇格する。
auto_gate:
  auto_ready: true
  reason: 三判断は2026-10-21に利用者が確定済み。未解決質問・未解決衝突なし。
agreed_items:
  - id: AG-001
    content: 検出強化はクリーンアップ検証ゲートと check_integrity の両方に載せる（新規ゲート不作成）
  - id: AG-002
    content: 検出対象は untracked かつ non-ignored のファイル・ディレクトリすべて。許容は承認一覧（provenance 付き）で管理し対象外検出は fail
  - id: AG-003
    content: case-open 前提整備として RU・draft・関連状態記録（jev 観測等）の未追跡分を Root Case 確立前に commit する（慣行の契約化）
  - id: AG-004
    content: lifecycle gate（完了時点ゼロ強制・consumer 配布効果）と恒常 checker（棚卸し時点の蓄積検出）は補完関係。単独では要件を満たさない
  - id: AG-005
    content: 並行 Case の in-flight 成果物を含めすべて検出し、ライフサイクル carve-out を設けず承認一覧で管理する
  - id: AG-006
    content: 主対象は系統1（コミット漏れ）と系統2（一時領域残置）。系統3（削除漏れ）は untracked 検出の自然被覆
conflict_resolutions:
  - id: CR-001
    content: Issue 記載は確定要件ではないが三判断が利用者確定済み。draft は三判断を正とし方向案は経緯記録として扱う
  - id: CR-002
    content: 新規ゲート不作成。既存検査（ゲート・check_integrity）への拡張で確定
  - id: CR-003
    content: 評価範囲は正規契約導出の全状態記録パス＋リポジトリ全体（REQ-032-034 準拠）。変更ファイル限定としない
  - id: CR-004
    content: 承認一覧の物理実体はリポジトリで単一の管理方式にまとめる（本 repo は ng-baseline 方式を拡張）
artifact_actions:
  - artifact: req
    action: append
    target: docs/requirements/REQ-010.md
    target_area: 要件テーブル末尾（REQ-010-083 の直後）
    content: "REQ-010-084 | docs-check の恒常 checker（check_integrity）は、リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリを検出する検査を持つこと。許容は承認一覧（provenance 付きの恒久承認記録。既存 ng-baseline と同一の管理方式で物理実体を単一化）で管理し、承認一覧対象外の検出は NG として終了コードを駆動し、承認済み検出は承認記録として報告にとどめること。承認の追加は検出契機ごとに人間の運用判断による明示承認として記録され、検査実行が承認を自動追加しないこと。検査の採番・報告形式は既存検査（IR 採番規則）に従うこと"
  - artifact: req
    action: append
    target: docs/requirements/REQ-030.md
    target_area: 要件テーブル末尾（REQ-030-030 の直後）
    content: "REQ-030-031 | case-open は Root Case 確立の前提整備として、入力 RU・要件doc draft・および当該要件定義に伴い生成された git 管理契約の状態記録（jev 観測等）に未追跡分がある場合、Root Case 作成に先立ってこれらを commit して git 管理状態へ置くこと。前提整備の commit は明示パス指定とし、スイープ操作を行わないこと"
  - artifact: req
    action: append
    target: docs/requirements/REQ-032.md
    target_area: 要件テーブル末尾（REQ-032-041 の直後）
    content: "REQ-032-042 | case-close は完了判定工程で、当該 Case 実行に関連して生成・更新された git 管理契約の状態記録（jev 観測、ローカル issues、capture 成果物等の正規契約で git 管理対象と宣言される記録）がコミット済みであること、およびリポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリが承認一覧対象外に残存しないことを検証し、未コミット・残存の検出時は完了扱いとしないこと。評価範囲は正規契約から導出した全状態記録パスとリポジトリ全体の未追跡対象とし（REQ-032-034）、変更ファイルのみの確認で達成しないこと。検証は機械工程（決定的スクリプト）で実行でき、帰属が機械判定できない検出は完了判定の前に人間確認事項として報告し、確認なしに完了判定へ進めないこと"
  - artifact: req
    action: append
    target: docs/requirements/REQ-034.md
    target_area: 要件テーブル末尾（REQ-034-047 の直後）
    content: "REQ-034-048 | case-auto のクリーンアップ検証ゲートは draft・RU・設計系 worktree・ブランチ残存に加え、リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリが承認一覧対象外に残存しないことを検証し、残存検出時は fail-closed で停止して残存対象と対応を報告すること。検証対象は対象リポジトリ全体の状態とし、作業 worktree ローカルの一時ファイルは case-close の既存一時ファイル検査の管轄として本検査と混同しないこと。許容は gitignore（正規の非追跡領域宣言）と承認一覧で管理し、ゲート実行が承認を自動追加しないこと"
operation_units:
  - id: OU-001
    summary: 検出拡張の実装（REQ 4行追加・workflow 契約反映・check_integrity 検査実装・機械工程追加）
    depends_on: []
    recommended_order: 1
    issue_policy: single
case_open_hints:
  epic_needed: false
  note: 単一 OU・標準フロー。配布物（workflow 契約・close_mechanical_steps）と repo-local（check_integrity）の双方を含むため配布境界の対応宣言作成先に注意（RA-005）
review_dispositions:
  source: GitHub Issue #3828（追跡案件・maintenance）
  adopted:
    - 三判断（2026-10-21 壁打ち確定）
    - 既存検査への拡張（新規ゲート不作成）
    - 承認一覧の単一実体化
    - 系統1+2 を主対象とする対象範囲
  deferred: []
  rejected: []
decision_judgment:
  required: false
  reason: 既存機構（クリーンアップ検証ゲート・ng-baseline 承認一覧・close 機械工程）の適用範囲拡張であり、新規アーキテクチャの導入や取り消し困難な意思決定を含まない（可逆: 承認一覧・検査は調整可能）
agentdev_handoff: false
assembly_evidence:
  structure_checks:
    - "REQ-010.md 最終行 REQ-010-083（grep 実測 2026-10-22）・2列テーブル（ID | 要件）"
    - "REQ-030.md 最終行 REQ-030-030（grep 実測 2026-10-22）・同構造"
    - "REQ-032.md 最終行 REQ-032-041（grep 実測 2026-10-22）・同構造"
    - "REQ-034.md 最終行 REQ-034-047（grep 実測 2026-10-22）・同構造"
    - "全 action が append（新規行追加）であり既存行の意味変更を含まないため design 対応事前確認（coverage --req）の対象外"
  scope_facts:
    - "ng-baseline.json 構造実測: entries[{category,check,file,evidence,count,provenance,reason}]・rule_id NG-BASELINE"
    - "check_integrity の IR 採番実測最大 IR-072"
    - "適用時点 untracked 0 件（git status 実測 2026-10-22、#3839 完了後 clean）"
    - "close_mechanical_steps.ts の phase 入力契約: pre-merge | post-merge"
```
