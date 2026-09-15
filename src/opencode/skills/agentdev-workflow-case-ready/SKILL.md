---
name: agentdev-workflow-case-ready
description: "case-ready command の workflow 実装本体。Definition PR 受入（忠実性・整合性・品質検査の確認、新しい意味判断が不要な場合の自動確定・merge、HITL 停止、CI 失敗時の ready 不遷移と既存 PR 保持）、canonical Definition 再取得、proposed Decision の受理評価と accepted 遷移、execution contract 確定、Standard / Epic 確定（連結成分と3軸判断、Child Issue / Wave / 依存構造生成、構成検証、Wave 重複前置検出）、検証対応要否最終ゲート（横断依存検査を含む）、ready 遷移、draft / RU 削除、冪等再実行を所有する。USE FOR: case-ready 実行時の workflow 制御（Definition 受入・自動確定・merge・HITL 停止・canonical 再取得・Decision 受理評価・execution contract 確定・Standard / Epic 確定・検証ゲート・横断依存検査・ready 遷移・draft / RU 削除・冪等再実行）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）、Root Case 確立・Definition Package 生成・Draft Definition PR 作成（case-open 側の責務）、実装実行（case-run 側の責務）、PR マージ判定・完了条件チェックボックス評価（case-close 側の責務）。"
---

<!-- ADF-COVERS(implementation): REQ-061-001, REQ-061-002, REQ-061-003, REQ-061-004, REQ-061-005, REQ-061-006, REQ-061-007, REQ-061-008, REQ-061-009, REQ-061-010, REQ-061-011, REQ-061-012, REQ-061-013, REQ-061-014, REQ-061-015, REQ-061-016, REQ-061-017, REQ-061-018, REQ-061-019, REQ-061-020, REQ-061-021, REQ-061-022, REQ-061-023, REQ-061-024, REQ-061-025, REQ-061-026, REQ-061-027, REQ-061-028, REQ-061-029, REQ-061-030, REQ-061-031, REQ-017-001, REQ-017-002, REQ-017-004, REQ-017-005, REQ-017-008, REQ-017-009, REQ-017-010, REQ-017-011, REQ-017-012, REQ-017-013, REQ-017-014, REQ-017-015, REQ-017-016, REQ-017-017, REQ-035-013, REQ-035-014, REQ-035-015 -->

# case-ready workflow スキル

case-ready command の workflow 実装本体である。
Definition PR 受入、canonical Definition 再取得、Decision 受理評価、execution contract 確定、Standard / Epic 確定、検証対応要否最終ゲート、ready 遷移、draft / RU 削除、冪等再実行までの制御構造を所有する。
case-ready は Definition 確定境界として単一責務を保ち、REQ / Decision / Design の保存実体は Capability Skill へ委譲する（保存手続きを実装しない）。

case-ready command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}）。

## 入力

- case-ready command から渡される Root Case（Issue 番号または URL、状態 open）
- 関連する req_draft（存在する場合。`.agentdev/drafts/req-draft-*.md`。`agreed_items` / `operation_units` / `realization_actions` / `review_dispositions` / `case_open_hints` / `conflict_resolutions`）
- Draft Definition PR / Definition Amendment PR（存在する場合）

## 出力

- ready 状態の Root Case
- 確定済み execution contract（Root Case 本文へ確定。対象範囲、変更対象成果物、関連 REQ / Decision / Design、完了条件、test strategy、必須品質統制、scope-affecting impact candidate、review 発動契約、work_type / scale / Issue structure）
- 実行構造（Standard は Root Case 自身を単一 execution unit。Epic は Child Issue と Wave / 依存構造、Epic Issue 本文へ構成推論の根拠を記録）
- 完了報告（case-ready 完了報告テンプレート）

## 副作用

- Definition PR の merge、Epic Issue / 子 Issue の作成、Root Case 本文の更新、コメントの追加（Custom Tool `agentdev_gh` 経由。VERIFY は Tool 内部）
- Decision ファイルの proposed から accepted への状態遷移（`agentdev-decision-file-manager` 委譲）
- draft / RU の削除（成功時のみ。blocked、failed、中断時は保持）
- deviation capture 保存: 自工程で実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline` へ委譲し、capture 境界 Design の Split Rule に従い `.agentdev/intake/` または `.agentdev/learning/` へ保存する。git 永続化は明示パス指定（並列実行安全ステージング）で行う
- 行わない副作用: Epic Issue 本文のステータス追跡テーブル更新（単一書き手は case-close）、実装実行、完了条件チェックボックスの評価と更新

## 制御平面（STEP 一覧）

case-ready workflow は次の7 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`<workflows/step-reference-contract>` Design）。
会話コンテキストに依存せず、永続状態（Root Case Issue、Definition PR、REQ / Decision / Design、Epic Issue、capture 成果物）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | Definition PR 受入 | Root Case 受領 | Definition PR 確定判定完了（自動確定・merge 実行済み / 実変更なしで PR 不在のまま継続 / HITL 停止 / CI 失敗停止） | [references/definition-acceptance.md](references/definition-acceptance.md) |
| STEP-2 | canonical 再取得 | STEP-1 確定判定完了 | canonical Definition 再取得済み、以降の処理基準確定 | [references/definition-acceptance.md](references/definition-acceptance.md) |
| STEP-3 | Decision 受理評価 | STEP-2 完了 | proposed Decision の評価完了（accepted 遷移実行 / 受理不能で停止 / 評価対象 0 件で継続） | [references/decision-acceptance.md](references/decision-acceptance.md) |
| STEP-4 | execution contract 確定 | STEP-3 完了 | execution contract を Root Case 本文へ確定済み | [references/execution-contract.md](references/execution-contract.md) |
| STEP-5 | 実行構造確定 | STEP-4 完了 | Standard / Epic 確定済み。Epic 時は Child Issue / Wave / 依存構造作成済み、構成検証合格 | [references/execution-structure.md](references/execution-structure.md) |
| STEP-6 | 検証ゲートと ready 遷移 | STEP-5 完了 | 対象要件行の未分類 0 件確認、横断依存検査実施済み（警告提示記録または検出不能報告。警告は ready 遷移判定を変更しない）、Root Case を ready へ遷移済み | [references/readiness-and-cleanup.md](references/readiness-and-cleanup.md) |
| STEP-7 | draft / RU 削除と同期確認 | STEP-6 完了 | draft / RU 削除済み、main ブランチの作業ディレクトリとリモートの同期確認済み | [references/readiness-and-cleanup.md](references/readiness-and-cleanup.md) |

### STEP 間の依存と分岐

- **基本順序**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6 → STEP-7
- **実変更なし分岐（STEP-1）**: Definition PR が存在しない場合（実変更のない bugfix 等の Case）は Definition PR を作らず canonical Definition は現行 main の状態を採用し、execution contract 確定と ready 遷移へ進む。空の Definition PR を作成する経路は存在しない
- **HITL 分岐（STEP-1）**: 新しい Decision、意味変更、対象範囲拡大、意味的な不整合解消が必要と判定した場合は停止し、既存 PR を保持したままユーザー判断を求める
- **CI 失敗分岐（STEP-1）**: Definition PR の CI / 品質検査失敗時は ready へ遷移せず、既存 PR を保持したまま停止する。修復後に再実行できる
- **Epic 分岐（STEP-5）**: Epic 確定時は Child Issue と Wave / 依存構造を作成する。Standard 確定時は Child Issue を作成しない
- **冪等分岐（全体）**: 再実行時、merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分だけを処理する

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: Root Case Issue の状態、Definition PR の存在と状態（merge 済みかどうかを含む）、Decision ファイルの status、Epic Issue / 子 Issue の存在、capture 成果物
- merge 済み Definition PR の検出後は merge を巻き戻さず、canonical Definition（merge 済み main の docs 永続文書）を基準として再開する
- 冪等キー（definition-readiness Design）で既存成果物を検出し、会話コンテキストの記憶に依存せず再利用する

### 終了条件（termination）

- 正常終了: draft / RU 削除・同期確認 STEP の完了報告出力まで
- 停止終了: Definition PR の忠実性・整合性・品質検査で新しい意味判断が必要な場合、CI / 品質検査失敗、構成検証の上限超過または構成不備、受理不能または判断情報不足の proposed Decision、検証対応要否の未分類残存、main 同期不一致

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-req-file-manager` / `agentdev-decision-file-manager` / `agentdev-design-file-manager`: REQ / Decision / Design の保存実体の委譲先。case-ready 自身は保存手続きを実装しない
- `agentdev-artifact-validation`: REQ / Decision frontmatter id↔filename 整合、README entry 存在、変更範囲検証の公開検証契約
- `agentdev-issue-management`: Issue 操作の安全手続き、Parent / Child Issue 間リンク確認、Issue 更新時の前後内容比較
- `agentdev-workflow-templates`: Issue 本文 / 完了報告テンプレート選定、実行識別情報セクション形式
- `agentdev-workflow-lifecycle`: work_type 判定、ラベル付与、Standard / Epic 判定の lifecycle 基準
- `agentdev-workflow-orchestration`: capture 境界の Split Rule、deviation capture 委譲
- `agentdev-traceability`: coverage / check による実装・検証対応の整合確認、検証対応要否分類状態の導出
- Custom Tool `agentdev_gh`: GitHub I/O 境界（issue_read、issue_update、issue_create、pr_read、pr_merge、comment_create。VERIFY は Tool 内部）
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: deviation capture 委譲（実観測時）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（capture 成果物の git 永続化）
- `agentdev-project-extensions`: 検証ゲート横断依存検査の共有領域解決（workflow-extension の context。fail-open）
- 横断依存検査エンジン（`agentdev-workflow-case-open` スキル配下 `scripts/src/inspect_cross_dependencies.ts`）: 検証ゲート横断次元の機械的比較の単一実装。case-open STEP-5 と比較手続きを共有する（重複実装禁止）

## トレーサビリティ能力の利用

case-ready は検証対応要否の最終ゲートで、対象要件行の実装対応・検証対応の整合を確認する。

- 実行対象 REQ の要件行について `agentdev-traceability` の coverage / check を用い、実装対応・検証対応の未分類行を検出する
- 未分類行が残る場合は ready へ遷移させず、停止理由と未分類行一覧を報告する
- 問い合わせ結果は候補提供であり最終判断としない。機能の不在、実行失敗、空結果の場合は README 索引、正規成果物の直接読取等の代替探索で継続する（fail-open）

## 共通制約

- **Definition 受入**: 忠実性確認（req-define 合意内容との投影検査）、整合性検査、品質検査を Definition PR 確定前に行う。新しい意味判断を必要としない場合は追加承認なしで merge する。merge 後は canonical Definition を再取得し、merge を巻き戻さない
- **execution contract 投影**: 機能要件、非機能要件、制約、対象外、受け入れ条件は新規作成せず合意済み Definition を投影する。runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）は事前確定せず case-run の安全検査として維持する
- **Standard / Epic 確定**: 連結成分（必須依存のみをエッジ）と依存強度、Epic サイズ、機能的一貫性の3軸で自律生成する。単独根は Epic 化せず Standard flow とする。無関係な operation_unit 群を単一 Epic へ機械的に集約しない
- **Decision 受理の冪等**: 再実行時、既に accepted へ遷移済みの Decision に対して重複する状態遷移や承認記録を生成しない
- **実行識別情報の記録**: Root Case 本文の実行識別情報セクション（実行単位）を case-ready で確定した値へ更新する。形式は `agentdev-workflow-templates` の実行識別情報セクション規約に従う。取得不能な場合は「N/A」を記録し workflow を停止しない
- **本文 verbatim**: Root Case 本文、Issue 本文は Custom Tool `agentdev_gh` の操作引数としてそのまま渡す（文字コード・一時ファイルの実装詳細は Tool 内部）（`POL-gh-io-delegation`）
- **Issue 本文のファイル経由扱い**: 長文本文は一時ファイル経由で構成し、Markdown 行構造（LF、セクション間空行、インデント）を保持する

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`<workflows/definition-readiness>` Design**: Definition Package、Definition PR lifecycle、canonical Definition 判定、冪等キー
- **`<workflows/epic-wave-model>` Design**: OU / Epic / Wave / Issue 階層、execution_unit 構成、Wave 重複前置検出
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **case-ready command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **case-open workflow スキル**: 前工程（Root Case 確立と Definition Package 生成、Draft Definition PR 作成）
- **case-run workflow スキル**: 後続工程（execution contract の消費と実装実行）
