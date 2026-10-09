---
name: agentdev-workflow-case-ready
description: "case-ready workflow 本体。Definition PR 受入、canonical Definition 再取得、Decision 受理、execution contract と Standard/Epic 構造確定、traceability gate、ready 遷移、draft/RU 削除、冪等再実行を制御する。USE FOR: case-ready の工程制御。DO NOT USE FOR: 単独起動（case-auto 内部段階）、Root Case/Definition PR 作成（case-open）、実装（case-run）、PR 完了判定（case-close）。"
---


# case-ready workflow スキル

case-ready command の workflow 実装本体である。
設計PR受入、canonical Definition 再取得、Decision 受理評価、execution contract 確定、Standard / Epic 確定、トレーサビリティ完全性ゲート、ready 遷移、draft / RU 削除、冪等再実行までの制御構造を所有する。
case-ready は Definition 確定境界として単一責務を保ち、REQ / Decision / Design の保存実体は Capability Skill へ委譲する（保存手続きを実装しない）。
Wave は意味的な依存関係のまとまりとして扱い、Wave 構成の導出は実行上限の数値に依存しない。

case-ready command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}）。

## 入力

- case-ready command から渡される Root Case（Issue 番号または URL、状態 open）
- 関連する req_draft（存在する場合。`.agentdev/drafts/req-draft-*.md`。`agreed_items` / `operation_units` / `realization_actions` / `review_dispositions` / `case_open_hints` / `conflict_resolutions`）
- 設計PR / 設計修正PR（存在する場合）

## 出力

- ready 状態の Root Case
- 確定済み実行契約（Root Case 本文へ確定。実行契約の要素は本文基本構造の各章へ分布させる: 対象範囲・対象外〔対象要件、主な変更対象、scope-affecting impact candidate を含む〕、実現方針〔条件付き章。再判断不可の合意済み事項と関連 Decision 拘束条件〕、完了条件〔検証方法・合格条件へ必須品質統制と test strategy を統合〕。実行識別情報・テスト戦略・必須品質統制・review 発動契約等の独立章は生成しない）
- 実行構造（Standard は Root Case 自身を単一 execution unit。Epic は Child Issue と Wave / 依存構造、Epic Issue 本文へ構成推論の根拠を記録）
- 完了報告（case-ready 完了報告テンプレート）

## 副作用

- 設計PRの merge、Epic Issue / 子 Issue の作成、Root Case 本文の更新、コメントの追加（Custom Tool `agentdev_gh` 経由。VERIFY は Tool 内部）
- Decision ファイルの proposed から accepted への状態遷移（`agentdev-decision-file-manager` 委譲）
- draft / RU の削除（成功時のみ。blocked、failed、中断時は保持）
- deviation capture 保存: 自工程で実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline` へ委譲し、capture 境界 Design の Split Rule に従い `.agentdev/intake/` または `.agentdev/learning/` へ保存する。git 永続化は明示パス指定（並列実行安全ステージング）で行う
- 行わない副作用: Epic Issue 本文の実行構成表更新（単一書き手は case-close）、実装実行、完了条件チェックボックスの評価と更新

## 制御平面（STEP 一覧）

case-ready workflow は次の7 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`<foundations/v4-durable-state-and-recovery>` Design）。
会話コンテキストに依存せず、永続状態（Root Case Issue、設計PR、REQ / Decision / Design、Epic Issue、capture 成果物）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 設計PR受入 | Root Case 受領 | 設計PR確定判定完了（自動確定・merge 実行済み / 実変更なしで PR 不在のまま継続 / HITL 停止 / CI 失敗停止） | [references/definition-acceptance.md](references/definition-acceptance.md) |
| STEP-2 | canonical 再取得 | STEP-1 確定判定完了 | canonical Definition 再取得済み、traceability check 機械実行済み（missing-design または verification policy の不正検出時は case-open へ差し戻し）、以降の処理基準確定 | [references/definition-acceptance.md](references/definition-acceptance.md) |
| STEP-3 | Decision 受理評価 | STEP-2 完了 | proposed Decision の評価完了（accepted 遷移実行 / 受理不能で停止 / 評価対象 0 件で継続） | [references/decision-acceptance.md](references/decision-acceptance.md) |
| STEP-4 | execution contract 確定 | STEP-3 完了 | execution contract を Root Case 本文へ確定済み | [references/execution-contract.md](references/execution-contract.md) |
| STEP-5 | 実行構造確定 | STEP-4 完了 | Standard / Epic 確定済み。Epic 時は Child Issue / Wave / 依存構造作成済み、構成検証合格 | [references/execution-structure.md](references/execution-structure.md) |
| STEP-6 | 検証ゲートと ready 遷移 | STEP-5 完了 | 対象要件行の Design 対応 1 件以上・トレーサビリティポリシー有効の確認（missing-design / policy 不正 0 件）、横断依存検査実施済み（警告提示記録または検出不能報告。警告は ready 遷移判定を変更しない）、Root Case を ready へ遷移済み | [references/readiness-and-cleanup.md](references/readiness-and-cleanup.md) |
| STEP-7 | draft / RU 削除と同期確認 | STEP-6 完了 | draft / RU 削除済み、main ブランチの作業ディレクトリとリモートの同期確認済み | [references/readiness-and-cleanup.md](references/readiness-and-cleanup.md) |

### STEP 間の依存と分岐

- **基本順序**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6 → STEP-7
- **missing-design / policy 不正差し戻し分岐（STEP-2）**: canonical 再取得時の traceability check 機械実行で missing-design または verification policy の不正を検出した場合は case-open へ差し戻し、ready へ遷移せず停止する。トレーサビリティ完全性ゲート（STEP-6）は case-ready が所有し続け、STEP-2 との二重定義は行わない。required 行の verification 対応欠落（missing-verification）は ready 拒否条件に含めない。verification 対応の作成・更新は case-run が担い、対応完全性の最終完全性検査は case-close が所有する
- **実変更なし分岐（STEP-1）**: 設計PRが存在しない場合（実変更のない bugfix 等の Case）は設計PRを作らず canonical Definition は現行 main の状態を採用し、execution contract 確定と ready 遷移へ進む。空の設計PRを作成する経路は存在しない
- **HITL 分岐（STEP-1）**: 当該判断が人間に留保された判断（REQ-{NNNN}-{NNN}）を新規に確定する必要がある場合、または既存の安全境界が要求する操作承認を要する場合は停止し、既存 PR を保持したままユーザー判断を求める。人間判断への移送の判定は語の使用（新しい Decision、意味変更、対象範囲の確定、意味的な不整合の解消）だけで行わず、`REQ-{NNNN}-{NNN}` の留保事項該当性で行う。判断の難易度、確信度、評価器間の不一致、結果状態、唯一解でないことだけを理由として移送しない
- **CI 失敗分岐（STEP-1）**: 設計PRの CI / 品質検査失敗時は ready へ遷移せず、既存 PR を保持したまま停止する。修復後に再実行できる
- **Draft 状態分岐（STEP-1）**: merge 実行前に pr_read の isDraft で Draft 状態を確認する（REQ-{NNNN}-{NNN}）。isDraft: true の場合は pr_merge を実行せず、GitHub Draft PR が正規 lifecycle 外であることを識別可能な理由とともに blocked で停止する。draft 解除の自動実行、pr_ready 相当操作、raw gh WRITE による復旧は行わない
- **Epic 分岐（STEP-5）**: Epic 確定時は Child Issue と Wave / 依存構造を作成する。Standard 確定時は Child Issue を作成しない
- **冪等分岐（全体）**: 再実行時、merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分だけを処理する

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: Root Case Issue の状態、設計PRの存在と状態（merge 済みかどうかを含む）、Decision ファイルの status、Epic Issue / 子 Issue の存在、capture 成果物
- merge 済み設計PRの検出後は merge を巻き戻さず、canonical Definition（merge 済み main の docs 永続文書）を基準として再開する
- 冪等キー（case-open / case-ready Design）で既存成果物を検出し、会話コンテキストの記憶に依存せず再利用する

### 終了条件（termination）

- 正常終了: draft / RU 削除・同期確認 STEP の完了報告出力まで
- 停止終了: 設計PRの忠実性・整合性・品質検査で人間に留保された判断（REQ-{NNNN}-{NNN}）の新規確定または既存の安全境界が要求する操作承認が必要な場合（停止理由は REQ-{NNNN}-{NNN} の原因分類へ対応させる）、CI / 品質検査失敗、canonical 再取得時の traceability check による missing-design または verification policy の不正検出（case-open へ差し戻し）、構成検証の上限超過または構成不備、受理不能または判断情報不足の proposed Decision、トレーサビリティ完全性ゲートの missing-design / policy 不正残存、main 同期不一致

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-req-file-manager` / `agentdev-decision-file-manager` / `agentdev-design-file-manager`: REQ / Decision / Design の保存実体の委譲先。case-ready 自身は保存手続きを実装しない
- `agentdev-artifact-validation`: REQ / Decision frontmatter id↔filename 整合、README entry 存在、変更範囲検証の公開検証契約
- `agentdev-issue-management`: Issue 操作の安全手続き、Parent / Child Issue 間リンク確認、Issue 更新時の前後内容比較
- `agentdev-workflow-templates`: Issue 本文 / 完了報告テンプレート選定（Issue 本文テンプレートは新形式。実行識別情報セクションは PR テンプレートのみ）
- `agentdev-workflow-lifecycle`: work_type 判定、ラベル付与、Standard / Epic 判定の lifecycle 基準
- `agentdev-workflow-orchestration`: capture 境界の Split Rule、deviation capture 委譲
- `agentdev-traceability`: coverage / check による対応関係の整合確認、Design 対応・トレーサビリティポリシー有効性のゲート判定
- Custom Tool `agentdev_gh`: GitHub I/O 境界（issue_read、issue_update、issue_create、pr_read、pr_merge、comment_create。VERIFY は Tool 内部）
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: deviation capture 委譲（実観測時）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（capture 成果物の git 永続化）
- `agentdev-project-extensions`: 検証ゲート横断依存検査の共有領域解決（workflow-extension の context。fail-open）
- 横断依存検査エンジン（`agentdev-workflow-case-open` スキル配下 `.opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts`）: 検証ゲート横断次元の機械的比較の単一実装。case-open STEP-5 と比較手続きを共有する（重複実装禁止）

## トレーサビリティ能力の利用

case-ready はトレーサビリティ完全性ゲートで、対象要件行の Design 対応の成立とトレーサビリティポリシーの有効性を ready 遷移の必要条件として確認する。

- 実行対象 REQ の要件行について `agentdev-traceability` の check を用い、Design 対応 1 件以上の存在とトレーサビリティポリシーの有効性を確認する。missing-design が残る行または verification policy の不正がある場合は ready へ遷移させない
- required 行の verification 対応の欠落（missing-verification）は本ゲートの ready 拒否条件に含めない。verification 対応の作成・更新は case-run が担い、対応完全性の最終検査は case-close の QG-4 が担う
- canonical Definition 再取得時（STEP-2）にも traceability check を機械実行し、missing-design または verification policy の不正を検出した場合は case-open へ差し戻す。トレーサビリティ完全性ゲート（STEP-6）は引き続き case-ready が所有し、STEP-2 との二重定義は行わない
- Design 対応が 0 件の行または policy 不正が残る場合は ready へ遷移させず、停止理由と該当行一覧を報告する
- 問い合わせ結果は候補提供であり最終判断としない。機能の不在、実行失敗、空結果の場合は README 索引、正規成果物の直接読取等の代替探索で継続する（fail-open）

## 共通制約

- **内蔵ツール使用規律**: ファイル検索・内容検索・ディレクトリ列挙は実行基盤の内蔵ツール（ファイル検索、内容検索、読み取り）を使用し、bash 内蔵コマンド（grep、ls 等）を標準手順としない。bash 実行が本来必要な処理（script 呼び出し、git 操作等）は本規律の対象外とする（workflow-skill-model Design「workflow skill 本文における内蔵ツール使用規律」節）
- **機械工程の script 呼び出し**: 忠実性・整合性・品質検査、overlap 突合、AUTOGEN 再生成差分検出、traceability check（STEP-1 受入検査）、merge 後 canonical 再取得と draft/RU 削除の git rm・明示パス指定 commit（STEP-2 / STEP-7）は、工程別 script `scripts/src/accept_definition_checks.ts` の呼び出しで実行する（phase: acceptance-checks / canonical-and-cleanup）。報告 JSON（実行結果・差分・警告・提案本文）の意味レビューと agentdev_gh による I/O はモデルが担う（case-ready Design「機械工程の script 呼び出し契約」節）
- **Definition 受入**: 忠実性確認（req-define 合意内容との投影検査）、整合性検査、品質検査を設計PR確定前に行う。merge 実行前に pr_read の isDraft 確認を行い、isDraft: true 時は pr_merge を実行せず blocked で停止する。人間に留保された判断（REQ-{NNNN}-{NNN}）の新規確定が不要で、既存の正規契約から導出できる解消と委譲された裁量の範囲内の判断である場合は追加承認なしで merge する。merge 後は canonical Definition を再取得し、merge を巻き戻さない
- **execution contract 投影**: 機能要件、非機能要件、制約、対象外、受け入れ条件は新規作成せず合意済み Definition を投影する。runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）は事前確定せず case-run の安全検査として維持する
- **Standard / Epic 確定**: 連結成分（必須依存のみをエッジ）と依存強度、Epic サイズ、機能的一貫性の3軸で自律生成する。単独根は Epic 化せず Standard flow とする。無関係な operation_unit 群を単一 Epic へ機械的に集約しない
- **Decision 受理の冪等**: 再実行時、既に accepted へ遷移済みの Decision に対して重複する状態遷移や承認記録を生成しない
- **realization_actions の投影（Issue Execution Contract REQ「realization_actions の投影」条項）**: draft-data の realization_actions は、Root Case 本文の実現方針（条件付き章。再判断不可の合意済み事項のみを記載し、該当がない場合は章を常設しない）と完了条件の検証方法・合格条件へ投影する。realization_actions の内部属性一式（concern、responsibility 等の構造化一覧）は転記せず、合意済み内容を本文の該当章へ分布させる。case-ready 成功後は case-run が Issue 本文だけで変更責務、変更意図、検証方針を取得できる
- **本文 verbatim**: Root Case 本文、Issue 本文は Custom Tool `agentdev_gh` の操作引数としてそのまま渡す（文字コード・一時ファイルの実装詳細は Tool 内部）（`POL-gh-io-delegation`）
- **Issue 本文のファイル経由扱い**: 長文本文は一時ファイル経由で構成し、Markdown 行構造（LF、セクション間空行、インデント）を保持する

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<foundations/v4-durable-state-and-recovery>` Design**: STEP reference 構造、resume point
- **case-open / case-ready Design**: Definition Package、設計PR lifecycle、canonical Definition 判定、冪等キー
- **`<workflows/v4-standard-lifecycle>` Design**: work_type / scale / Epic / Wave の v4 意味モデル（OU / Epic / Wave / Issue 階層の語彙）
- **`<workflows/issue-title-policy>` Design**: Epic 確定時の Root Case 接頭辞更新（`Epic: 主題`）と子 Issue タイトル（`Wave-N: 主題`。`Task:` 接頭辞は廃止）の書式の単一参照点
- **case-open / case-ready Design**: execution_unit 構成（連結成分・3軸判断の機械的判定手順を含む）と Wave 構成・Wave 重複前置検出
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **case-ready command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **case-open workflow スキル**: 前工程（Root Case 確立と Definition Package 生成、設計PR作成）
- **case-run workflow スキル**: 後続工程（execution contract の消費と実装実行）
