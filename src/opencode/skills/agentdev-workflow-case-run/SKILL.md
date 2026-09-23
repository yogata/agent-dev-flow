---
name: agentdev-workflow-case-run
description: "内部 lifecycle 段階 case-run の workflow 実装本体。単一 Issue 実行への収斂（実行担当サブエージェント委譲1件、result 4状態処理、前置/最終 gate）を所有する。Epic・Wave を処理対象とする実行契約は廃止され、Wave 実行制御（Wave 構成の読み取り、現在 Wave 判定、fan-out/fan-in、子 Issue 並列起動、共有 active Issue task 枠）は case-auto の orchestration stage 3 が単一所有する。USE FOR: case-run 実行時の workflow 制御（単一 Issue 実行・再開フェーズ判定・委譲・前置/最終 gate）。DO NOT USE FOR: 実装実行そのもの（委譲内の実行担当サブエージェントが担う）、Epic や Wave の実行制御（case-auto orchestration stage 3 の責務）、単独起動（case-auto の内部 lifecycle orchestration から起動される内部段階である）。"
---


# case-run workflow スキル

case-run command の workflow 実装本体である。
与えられた単一 Issue の実行を実行担当サブエージェントへ委譲し、その result を処理する制御構造を所有する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない。

case-run は常に単一 Issue を処理し、Epic や Wave を処理対象とする実行契約は廃止されている。
Wave 実行制御（Wave 構成の読み取り、現在 Wave 判定、fan-out/fan-in、子 Issue 並列起動、共有 active Issue task 枠）は case-auto の orchestration stage 3 が単一所有し、case-run 経由で case-auto の管理外の実行枠（独立実行枠）を生成できない。

case-run command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}）。

## 入力

- Issue番号またはURL（単一 Issue 実行モード。case-run が受理するのは常に単一 Issue 入力であり、Epic Issue 入力経由の Wave 実行制御は case-auto の orchestration stage 3 へ移転済み。Epic Issue 入力の扱いは case-auto 経由の正規呼出へ限定する）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## 副作用

- worktree・ブランチ作成（`agentdev-git-worktree` 経由）
- 実行担当サブエージェント起動（adapter skill 読込、委譲 prompt 内で実行 command 指定。委譲1件、並列委譲なし）
- 親Epic ステータス更新（STEP-S3、`agentdev-epic-tracker` 経由。対象 Issue が Epic の子 Issue の場合）
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-run command の worktree 隔離に従う）

## Workflow 構成（単一 Issue 実行への収斂）

case-run は単一 Issue 実行（single workflow）のみを所有する。
かつて single workflow と epic-wave workflow の 2 workflow に分離していた構成は、Epic Wave 実行モード（case-run #epic）の実行契約廃止により single workflow へ収斂した。
旧 epic-wave workflow が所有していた6契約軸（target cardinality、parallelism、fan-out・fan-in、child task recovery、partial result、Wave-level completion）の実行契約は case-auto orchestration stage 3 へ移転済みであり、本スキルは保持しない（`<workflows/workflow-skill-model>` Design「1:N 分割基準の適用実例（case-run）」参照）。

- **single workflow**: 対象1 Issue。準備・委譲・クリーンアップの3フェーズを順次実行する

Epic Issue 入力時も case-run 自身の Wave 構成の読み取り、現在 Wave 判定、fan-out/fan-in、子 Issue 並列起動を行わない。Epic 全体の進行管理・未完了 Wave の処理は case-auto が所有する。

## 制御平面（STEP 一覧）

各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`docs/designs/<foundations/v4-durable-state-and-recovery>.md`）。
会話コンテキストに依存せず、永続状態（GitHub Issue/PR、Issue コメント、worktree・ブランチの存在、PR URL）から再開点を再構成する。

### single workflow（単一 Issue 実行モード）

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-S1 | フェーズ判定・再開ポイント検出 | case-run 起動（Issue番号受領） | 単一 Issue 実行モード確定、再開フェーズ判定、引き継ぎ停止判定 | [references/single.md](references/single.md) |
| STEP-S2 | Issue 抽出・確認・判定 | 実行モード確定（single） | 要件doc・受け入れ基準抽出、関連Decision 確認、work_type metadata 整合確認、execution contract 消費境界適用 | [references/single.md](references/single.md) |
| STEP-S3 | Worktree 作成・ブランチ準備・前置 gate 群 | Issue 判定完了 | worktree+ブランチ作成（べき等）、前置 gate 群（precondition / staleness / targeted docs / 配布依存境界 事前 gate / AUTOGEN 索引再生成）合格、L2 計測 | [references/single.md](references/single.md) |
| STEP-S4 | 実行担当サブエージェント委譲 | STEP-S3 合格（worktree 内検証済み） | 委譲起動、L2 計測、adapter 委譲内 adversarial-review | [references/delegation-and-result.md](references/delegation-and-result.md) |
| STEP-S5 | result 処理・配布依存境界 最終 gate | 委譲 result 受領 | 委譲応答の3点ゲート（4状態 result・commit hash・PR URL 必須検査）、result 4状態処理、配布依存境界 最終 gate 判定、L2 受け渡し | [references/delegation-and-result.md](references/delegation-and-result.md) |
| STEP-S6 | worktree クリーンアップ確認・完了報告 | result 処理完了（completed-pr 時は最終 gate 合格後） | 未コミット変更確認、tmp/ 残存確認、完了報告（L2 内訳含む） | [references/single.md](references/single.md) |

### STEP 間の依存と分岐

- **single**: STEP-S1 → STEP-S2 → STEP-S3 → STEP-S4 → STEP-S5 → STEP-S6。worktree+ブランチ既存時は STEP-S3 の作成をスキップ（べき等）。result が blocked / failed / delegation-unavailable 時は STEP-S5 で停止（STEP-S6 の報告のみ）
- **最終 gate 違反**: STEP-S5 で配布依存境界 最終 gate 違反時、PR 本文に `### distribution-boundary` を記録して停止（adapter result は上書きしない）

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: worktree・ブランチの存在（準備フェーズ完了）、PR の存在と PR URL（委譲完了）、Issue コメント（blocked/failed の SSoT、verify-only closure の検証証跡 SSoT コメント）
- フェーズ再開条件: 準備フェーズ（worktree+ブランチが存在しない）、委譲フェーズ（PR 未作成かつ result 未確定）、クリーンアップフェーズ（result が completed-pr。verify-only closure では SSoT コメントの記録有無で検証・記録工程の再開点を判定する）
- 会話コンテキスト・自然言語の前 STEP result のみを再開の根拠（resume source）としない

### 終了条件（termination）

- 正常終了: single は PR 作成確認とクリーンアップ完了報告まで。verify-only closure（PR を作成しない完了）は検証完了と SSoT コメント記録まで（references/single.md「verify-only closure の検証実行と SSoT コメント記録」参照）
- 一時ファイル残存: 正常終了の前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（STEP-S6 で確認。一時ファイル cleanup 規定（workflow 側で生成した `.agentdev/tmp/` 一時ファイルは当該実行内で削除する。Custom Tool 内部の一時ファイルは Tool が操作ごとに自動削除する））
- 停止終了: blocked / failed（Issue コメント SSoT）、delegation-unavailable（Issue を pending へ戻す）、配布依存境界 最終 gate 違反（PR 本文 SSoT）、worktree precondition gate 失敗（実行担当サブエージェント起動前に停止）
- 引き継ぎ停止: Issue 本文に `agentdev_handoff: true` を含む場合、リポジトリ種別に応じた停止判定（`agentdev-workflow-lifecycle` runtime-package-boundary）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-workflow-orchestration`: 再開ポイント判定、状態機械、CI 対応ループ、capture 境界、障害伝播
- `agentdev-case-run-execution-adapter`: 実行担当サブエージェント委譲の adapter protocol、result 4状態契約、adapter 委譲内 adversarial-review
- `agentdev-git-worktree`: worktree 作成・削除、worktree 内判定ヘルパー、並列実行安全ステージング
- `agentdev-workflow-lifecycle`: work_type 判定、引き継ぎ停止判定（runtime-package-boundary）
- `agentdev-epic-tracker`: 親Epic ステータス更新（STEP-S3-1。Epic Issue 本文読取は参照のみ）
- `agentdev-req-analysis`: チェックボックス品質基準
- `agentdev-quality-gates`: QG-3 前置の鮮度検出、QG-4 bun test フル suite 正規形（機械受理基準）
- Custom Tool `agentdev_gh`: Issue 本文読取等の I/O 操作
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `agentdev-traceability`: トレーサビリティ能力（coverage、check。委譲内の対応関係確認と PR 作成前検査。fail-open）
- integrity checker skill（リポジトリ固有・配布対象外）: check_changed_docs.ts（targeted docs guard）、check_extensions.ts（IR-{NNN}）、check_distribution_boundary.ts（配布依存境界、source / link 両 profile）、generate_indexes.ts（AUTOGEN 索引再生成）

## トレーサビリティ能力の利用

case-run の実行担当（委譲内サブエージェント）は、対象要件について `agentdev-traceability` の coverage で既存の対応関係を確認しながら、実際に要件を実現する成果物へ実装対応を、実際に要件を検証する恒常的な検証手段へ検証対応を作成・更新する（STEP-S2 の関連Decision確認、委譲内 context 再確認）。対応宣言の作成先は成果物の配布境界で決定する。consumer distribution closure に含まれる配布対象成果物（command、skill、template、runtime script 等）の対応関係は、repository top-level の `traceability/` 配下の component / package 単位 sidecar へ作成・更新する。producer 側の開発管理成果物（docs 配下の正規成果物）の対応関係は、inline `ADF-COVERS` 宣言または sidecar へ作成・更新でき、sidecar と inline declaration は同じ論理的な対応関係へ正規化される。
実行担当は PR 作成前に対象要件行に scope を限定した check（`--req`）を実行し、Design 対応欠落、implementation 対応欠落、policy が required と判定する要件行の verification 対応欠落、verification policy の不正、sidecar / inline declaration の構文不正、同一論理関係の不整合な重複を検出対象として検査する。Decision 対応の欠落は検出対象に含めない。
対応宣言の表記仕様は `agentdev-traceability` Design「対応宣言の表記」が正規所有し、本スキルは表記仕様を再定義しない。

- 単に変更されたファイルであることを理由に、そのファイルを要件へ自動的に対応付けない
- 上記の作成先規約は、新規配布物の作成を含む委譲において、委譲 context へ作成時の予防観点として引き渡される（委譲手順の項目は delegation-and-result reference の「配布物対応宣言の作成先規約の予防観点引き渡し」参照）。引き渡しは作成時予防であり、配布依存境界 checker による事後検知（事前書き込み gate・最終 gate）と両面運用で両立する。予防観点の引き渡しは検知機構の代替にも検知機構の変更にもしない
- check の不合格が承認済み対象範囲内で修正可能な場合は修正して再検証する。要件変更、対象範囲拡大、追加設計判断、外部依存解消が必要な場合は blocked として必要な判断事項を報告する
- 検証対応は「何が要件を検証するか」という検証手段との恒常的な対応関係であり、「今回その検証を実行して合格したか」という実行結果は Issue、PR、QG 側で扱う
- 中断後の再実行では、正規成果物に保存済みの対応関係を再利用し、同じ対応宣言を重複生成しない
- トレーサビリティ能力を利用して新規の依存関係、実行構成、Wave 構成、実行順序を設計しない。依存関係と実行構成の決定責務は上流工程（case-open の execution_unit 構成）が所有し、Wave 実行制御（共有 active Issue task 枠、Wave 収束と依存充足の gate）は case-auto orchestration stage 3 が所有する
- agentdev-traceability の不在、実行失敗、空結果、候補過多だけを理由として workflow を停止しない（fail-open）。README 索引、正規成果物の直接読取、`rg` 等の独立探索手段で継続し、正規成果物そのものの異常とトレーサビリティ機能側の異常を区別する

## 共通制約

- **スコープ**: 単一 Issue のみを処理する。Epic や Wave を処理対象とする実行契約は廃止されており、Wave 実行制御は case-auto orchestration stage 3 が単一所有する。Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）は扱わない。Epic 再指定時の次 Wave 処理も引き受けない（Epic 全体の進行管理は case-auto が所有）
- **統合先基準（作業起点・PR base）**: worktree の作成元と PR の base は main を参照する。rebase・同期基準、鮮度確認、Epic 後続 Wave の作業起点も main を参照する
- **実装実行の非所有**: case-run 本体は work plan 生成、実装、TDD、乖離検出、specs 更新、PR 本文作成、PR 作成を行わない（実行担当サブエージェント責務、adapter protocol 参照）
- **SSoT**: blocked/failed の詳細本文 SSoT は Issue コメント。completed の SSoT は PR 本文。verify-only closure（PR も carrier commit も存在しない Issue 完了）ではこの例外として、検証証跡（3検査+integrity suite の結果と再実行可能な実行コマンド列）を SSoT コメント（Issue コメント）へ記録する。一時会話コンテキスト、中間ファイルは SSoT としない
- **委譲応答の3点ゲート**: 委譲結果の受領時に最終ゲートとして4状態 result（completed-pr / blocked / failed / delegation-unavailable）・commit hash・PR URL の3点を必須検査し、不足する委譲応答を completed-pr として扱わず再開（再委譲または継続指示）する。実装・検証の要約は3点検査の通過を代替しない。verify-only closure は SSoT コメント契約の別経路として既存どおり扱い、3点の不足判定を適用しない（詳細は `agentdev-case-run-execution-adapter` 参照）
- **background 委譲の起動消失の回復**: background 委譲の起動直後消失を検知した場合、durable state（worktree の git status、PR 存在、Issue コメント）で実行の帰属を確認し、実行未試行と判定した場合は同期実行による再委譲を行う。実行中断と判定した場合の継続判断も当該 durable state に基づく。同期実行への切替は消失検知時のフォールバックに限定する。実行並列上限（共有 active Issue task 枠）は case-auto orchestration stage 3 が単一所有し、case-run は独立した実行枠を持たない
- **blocked 正規再開経路**: 実装中に新たな変更影響候補を発見した場合、既存 Issue scope 内で処理可能な内部実装上の影響は自律処理する。Issue scope、完了条件、REQ/Decision/Design、必須品質統制の追加変更が必要な場合は blocked とし、Root Case の resume_command による正規再開経路（新しい意味判断が必要な場合は req-define、再合意済みの場合は case-revise）に従う。staleness check で差異を検出した場合も Issue 本文を単独で書き換えず、差異を報告して blocked とし同一の正規再開経路に従う
- **docs 整合性検査連携**: PR 対象ファイルに docs 変更を含む場合は docs 整合性検査を実行し、結果を PR 本文に記録して case-close へ連携する。検査対象 root の誤解決（配置先起点の誤リポジトリ検査）は検査見逃しとして扱う
- **完了条件チェックボックス**: case-run、実行担当サブエージェントは完了条件チェックボックスを更新しない（case-close QG-4 の責務）
- **Findings / Design確定候補**: 実行担当サブエージェントが PR 本文の `## Findings / Capture候補` と `## Design確定候補` に記録する（別セクション、混在させない）。case-run の capture 責務は記録のみ
- **外部実行ハーネスの中間成果物**: plan artifact 等を AgentDevFlow の永続成果物として扱わず、最終結果は PR URL で受領する
- **L2 タイムスタンプ**: worktree 設定、実行担当サブエージェント実行、worktree クリーンアップの各開始・終了時刻（JST）を計測し、完了報告の L2 内訳に含める（case-auto の L1 内訳の入力）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<foundations/v4-durable-state-and-recovery>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-run command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
