---
name: agentdev-workflow-case-run
description: "内部 lifecycle 段階 case-run の workflow 実装本体。単一 Issue 実行への収斂（実行担当サブエージェント委譲1件、result 4状態処理、前置/最終 gate）を所有する。Epic・Wave を処理対象とする実行契約は廃止され、Wave 実行制御は case-auto の orchestration stage 3 が単一所有する。USE FOR: case-run 実行時の workflow 制御（単一 Issue 実行・再開フェーズ判定・委譲・前置/最終 gate）。DO NOT USE FOR: 実装実行そのもの（委譲内の実行担当サブエージェントが担う）、Epic や Wave の実行制御（case-auto orchestration stage 3 の責務）、単独起動（case-auto の内部 lifecycle orchestration から起動される内部段階である）。"
---

# case-run workflow スキル

単一 Issue の番号または URL とブランチ名を受け取り、実行担当サブエージェント1件へ委譲する。Wave は case-auto stage 3 が所有し、case-run 経由で case-auto の管理外の実行枠（独立実行枠）を生成できない。実装・検証・PR 作成は委譲先が実行する。

**case-run の成功成果は PR 作成である**。例外の verify-only closure は検証証跡を Issue コメントに保存して終了する。ファイル編集は対象 worktree 内に限定し、worktree 作成元・PR base・同期基準は main とする。

## 制御平面（STEP 一覧）

| STEP | 実行・出口条件 | 手順 |
|---|---|---|
| STEP-S1 | 単一 Issue を確認し、再開点と引き継ぎ停止を判定 | [single](references/single.md) |
| STEP-S2 | 要件・受け入れ基準・関連 Decision・work_type を照合し、採用根拠照合（依拠する正規成果物の採用根拠を既存の採用基準へ照合）と実行境界を適用 | [single](references/single.md) |
| STEP-S3 | worktree とブランチを準備し、precondition・staleness・targeted docs・配布依存境界の前置 gate と AUTOGEN 索引再生成を適用 | [single](references/single.md) |
| STEP-S4 | 前置 gate 合格後に adapter 経由で1件を委譲。並列兄弟 branch の実差分交差確認は委譲内の commit・push 直前に実施 | [delegation-and-result](references/delegation-and-result.md)、交差確認は [single](references/single.md) |
| STEP-S5 | 3点ゲートと result 4状態の処理。`completed-pr` は配布依存境界の最終 gate へ | [delegation-and-result](references/delegation-and-result.md) |
| STEP-S6 | 最終 gate 合格後、未コミット変更と当該実行の `.agentdev/tmp/` 残存を確認し報告。停止結果では報告のみ | [single](references/single.md) |

worktree・ブランチの作成はべき等。Epic の子 Issue では STEP-S3 で `agentdev-epic-tracker` を利用し、Epic 本文は case-close のみが書き込む。`agentdev_handoff: true` の停止判定は `agentdev-workflow-lifecycle` に従う。worktree precondition が不合格なら起動前に停止する。最終 gate 違反は PR 本文の `### distribution-boundary` に記録して停止し、adapter result を上書きしない。

- **並列兄弟 branch 実差分交差確認**: STEP-S4 委譲内で行い、前置 gate 群（STEP-S3）では実施しない。references/single.md「並列兄弟 branch 実差分交差確認（commit・push 前置）」を参照する。

### 再開プロトコル（resume protocol）

安定した STEP ID と永続状態で再開点を復元する。worktree・ブランチ未準備なら準備へ、PR 未作成かつ result 未確定なら委譲へ、`completed-pr` 後は cleanup へ進む。verify-only closure は検証証跡の SSoT コメントを確認して再開する。会話記憶や外部ハーネスの中間成果物を根拠にしない。

**未決依存の保留と実行継続の区別**: 前置 gate と委譲では未決判断に依存する部分を保留し、未決事項の存在だけを理由に依存しない作業を停止しない。明示的に許可した試作は正式採用・正規成果物の確定・本番適用と区別する。試作の実施、成果物の存在、試験の成功を当該候補の正式採用や未決事項の解決として扱わない。未決の設計候補について試作として実施するには利用者の明示的な指示または許可を要し、明示的な指示・許可がない試作を開始しない。明示的な指示・許可がない限り、当該部分は未決判断に依存する実装として保留する。

## 単独工程からの実装・検証接続（v5 有限実行モード）

確定済み設計、有限な実装対象、既存の検証条件を入力に、実装・検証だけを同じ委譲契約で実行する。実行境界が要求・設計の正規情報を再所有せず、要件確定・設計確定の再形成を一律に要求しない。採用規約の解決結果と正規状態で実行基準を確認し、未採用の参照工程を基準に含めない。検証証拠を確認し、実行した事実だけを完了の根拠にしない。再開時は採用済み・未決・試作・成立済み作業の4区分を正規情報から再構成し、成立済み作業を不当に重複実行しない。

## 委譲結果と停止

- result は `completed-pr`、`blocked`、`failed`、`delegation-unavailable`。前者には commit hash と PR URL、停止結果には理由と再開情報（SSoT 記録先）を求める。不足は再委譲または継続指示で解消し、要約を証拠に代用しない。起動不能は `pending` に戻す。
- **委譲応答の返却サマリ上限**: 委譲応答（実行担当から case-run への最終返却本文）は、ステータス（報告用 `completed` / `blocked` / `failed`）、副作用有無を含む判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果の pass/fail 件数、未達事項/ブロッカー、詳細成果物パスの八項目からなる構造化サマリとし、UTF-8 上限目安 3〜4 KB 以内。長大な詳細は退避先（PR 本文・Issue コメント等）へ退避し、返却本文には退避先のパス/URL 参照のみを含める。case-run はサマリと退避先の証拠を参照して進行判定を行い、報告用ステータスから PR 完了やゲート合格を導出しない（詳細は `agentdev-case-run-execution-adapter` 参照）。
- completed の SSoT は PR 本文、`blocked` / `failed` は Issue コメント。verify-only closure では PR・carrier commit を要求せず、必要な検証を省略しない。3検査と検証結果、実行・非実行の範囲と根拠、再実行可能なコマンドを Issue コメントに保存する。
- 起動直後に background 委譲が消失したら、worktree・PR・Issue コメントで未試行と中断を区別する。未試行なら親の起動間隔契約に従い background で再委譲し、起動失敗の継続は再試行計上契約に従って `delegation-unavailable` に確定する。
- **blocked 正規再開経路**: 既存 Issue scope 内で処理可能な内部実装上の影響は自律処理する。Issue scope、完了条件、REQ/Decision/Design、必須品質統制の追加変更が必要な場合は blocked とし、Root Case 指定による正規再開経路（経路解決は Root Case の正規状態、Epic 実行構成、既存成果物、実行の生存状況の照合で行う。人間に留保された判断の新規確定が必要な場合は req-define、再合意済みの場合は case-revise）に従う。staleness check で差異を検出した場合も Issue 本文を単独で書き換えず、差異を報告して blocked とし同一の正規再開経路に従う。
- STEP-S4 で一時資材の作成・利用・回収義務を渡し、STEP-S5 で片付け結果・根拠・残件を確認する。権限外の副作用は停止する。Findings と Design 確定候補は PR 本文の別節に記録する。
- **docs 整合性検査連携**: 文書変更時は対象 root で docs 整合性検査を実行し、結果を PR 本文に記録して case-close へ連携する。

## トレーサビリティ能力の利用

委譲内で `agentdev-traceability` の coverage を利用し、実現成果物と恒常的な検証手段へ対応を付ける。変更された事実だけで対応付けず、再開時は保存済み宣言を再利用する。consumer distribution closure に含まれる成果物はリポジトリ直下の `traceability/` の component / package 単位 sidecar、producer 側の正規成果物は inline `ADF-COVERS` 宣言または sidecar を用いる。新規配布物ではこの規約を委譲 prompt へ渡し、前置・最終 gate も維持する。

PR 前に対象要件に限定した `check --req` を実施し、対応欠落・宣言不正・検証ポリシー不正・不整合な重複を検査する。Decision 対応の欠落は検出対象に含めない。承認範囲なら修正して再検証し、変更判断が必要なら `blocked` とする。機能の不在・失敗・空結果・候補過多では独立探索に切り替える。対応関係を依存構成や Wave 設計に転用せず、今回の検証結果は Issue・PR・QG に記録する。

## 工程記録の取りまとめ反映（記録契機）

記録契機は停止・判断変更・検証証拠。着手・引き渡し・再開ではコメントを生成しない。実着手報告で進行状況の開始日時を一度だけ設定する。停止・判断変更の途中報告は result 確定を待たず反映する。`scripts/record-comments.ts` 合格後に `agentdev_gh` の `comment_create` と `issue_update` を用いる。Epic 反映待ちでも子 Issue の最新記録を維持する。完了判定・結果確定・完了条件チェックボックス更新は case-close の責務とする。

## 重要変更の通知と結果説明

委譲契約に重要変更の識別と報告を含める。未反映の重要変更は正規反映の前に利用者へ提示する。反映済みなら区別し、事後説明を事前通知として扱わない。裁量の範囲内は追加承認なしで継続し、通知のみを理由とする新たな一律停止を設けない。利用者判断が必要なら `blocked` に従う。照合・影響評価・更新・再検証を通知で代替しない。

STEP-S6 の報告には実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。事前通知したが実施しなかった変更を実施済みと報告せず、一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して報告する。worktree 準備・委譲実行・cleanup の L2 計測（JST）も報告する。
