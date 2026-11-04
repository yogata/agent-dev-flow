# REQ-106-012〜016・REQ-111-025〜026 の S5 通し検証記録（Epic #3907 Wave 2）

対象は Issue #3916、親 Epic #3907、委譲識別子 DEL-3916-1、実行単位 S5 通し検証と証拠整備。作業ブランチ case-3916、開始 HEAD は main 21df6658a（Wave 1 の成果 PR #3921 merge dececb7ca を含む）。本記録は今回限りの記録であり、恒久台帳ではない。版台帳・汎用依存グラフ・専用履歴データベース・第2の管理台帳は作らない。本記録の根拠は、このファイル、`traceability/req-106-111-s5-verification.yaml`（verification 対応宣言）、一時検証環境の Git 履歴と改訂実行記録、そして PR 本文の検証差分セクションに退避した観測証跡である。

## 検証環境と実行経路

通し事例は一時検証環境（`C:/WINDOWS/TEMP/opencode/s5-e2e-3916/`、委譲契約が明示許可した通し事例実行用のエフェメラル環境）で実行した。正規の変更（本記録と verification 対応宣言）は worktree `.worktrees/3916-case` 配下のみで行い、メインリポジトリには触れていない。作業開始前に worktree 内判定（`git rev-parse --show-toplevel`）で worktree 内であることを自己検証済みである。

実行経路は正規利用経路である。phase-artifacts-update Workflow Skill の「完了済み過去工程の正規改訂と影響伝播」節の手順に従い、影響評価の入力を `agentdev-traceability` の relied-diff 公開 CLI から取得し、変更反映完了の判定を Capability Skill `agentdev-phase-theme-collaboration` の revision-record 公開 CLI で確定させた。部品試験の結果だけを完遂の証明とせず、複数工程の正規利用経路を通した実行の記録で確認した。worktree junction 未伝播のため、両 CLI は worktree 内の原本パス（`src/common/skills/agentdev-traceability/scripts/src/relied-diff.ts`、`src/common/skills/agentdev-phase-theme-collaboration/scripts/src/revision-record.ts`）から実行した（正規代替経路）。実行環境は Windows、bun、agentdev_gh による SSoT 再取得（Issue #3916・Epic #3907 本文）を伴う。

一時検証環境の成果物と版は次のとおりである。要件定義（req.md）→詳細設計（design.md）→実装（impl.md）→検証計画（testplan.md）の工程モデルに、旧検証証拠（verify-evidence.md）と作成・未確認の各候補を加えた 5 ファイル構成である。

| 版 | commit（短縮） | 内容 |
|---|---|---|
| v0 | 97e8fc79 | 初版。全成果物が仕様 A（JSON 応答）に依拠 |
| v1 | d1e3445c | 上流改訂（仕様 A→B）と、中間版への実依拠追随（impl.md が仕様 B に更新） |
| v2 | f02f31b | 上流を仕様 A に戻す（req.md は v0 と正味差分ゼロ。履歴では 2 回触れている） |
| v3 | b046164 | 影響処理の実行。impl.md を仕様 A に追随更新、new-capture.md を作成 |
| v4 | 107fa855 | 再開。pending の作成候補 missing-downstream.md を作成 |

## 通しシナリオと観測証跡

各シナリオの CLI 出力は PR 本文の検証差分セクションに退避した。ここでは対象・引数・主要な観測値と、Epic 完了条件との対応を記録する。

### シナリオ A: 依拠版 v0 基準の影響評価（v0..v2）

`relied-diff --relied v0 --head v2 --paths docs/design.md,docs/impl.md,docs/testplan.md,docs/req.md --downstream docs/impl.md --evidence-basis v0`、終了コード 0。

docs/req.md は依拠版と現行版の blob が同一（正味差分ゼロ）だが、`intermediateTouched: true` で列挙され `propagationRequired: true` となり、根拠に「正味差分ゼロでも中間版に依拠する下流への影響を無条件に除外しない」が出た。変更起点の後続引き継ぎが機械的に機能している。docs/design.md と docs/testplan.md は `up-to-date`（更新不要相当）でも列挙から落ちておらず、中間工程の更新不要を理由とした後続評価の打ち切りは発生していない。docs/impl.md は `update`・`propagationRequired: true`（中間版仕様 B への実依拠）であった。`evidence.status` は `stale`、stalePaths は docs/impl.md であり、出力の note は「freshPaths は blob 一致の機械的事実であり、証拠が対象とした工程・入力と現行の一致は呼出側の意味判断である」として旧証拠の無条件再利用を禁じている。`fullyPropagated` は `no`（update が残存）。

### シナリオ A2: 依拠版 v1 基準の影響評価（impl.md の実依拠版）

`relied-diff --relied v1 --head v2 --paths docs/impl.md --downstream docs/impl.md`、終了コード 0。

同一リポジトリでも依拠版の選択で影響分類が変化した。docs/req.md が `modified`・`update` 分類（仕様 B→A）となり、docs/impl.md は依拠版 v1 と blob 一致の `up-to-date` で列挙された。影響評価が依拠版ごとに実行されていることを実測で確認した。`--evidence-basis` を指定しないため `evidence.status` は `unconfirmed`（「証拠対象版が特定できないため上流整合は未確認」）であり、依拠版が特定できない対象を完了側に含めない判定の入力になる。

### シナリオ E1・E2: 依拠版未解決と未確認候補の列挙

E1（`--relied does-not-exist`）では `comparisonRange: "unresolved"`・`fullyPropagated: "undetermined"` となり、note に依拠版の再確認と再実行の指示が出た。「根拠がない限り影響なしや完了と判定しない」ことを確認した。E2（`--paths docs/ghost.md --downstream docs/missing-downstream.md`）では docs/ghost.md が `unverified`（「依拠版・現行版のいずれにもパスが存在せず、分類の判断根拠が得られない。根拠が得られないため影響なしや完了と判定しない」）、docs/missing-downstream.md が downstream `create` 候補（「存在しない旧下流成果物との比較を要求しない」）となった。未確認候補が残ると `fullyPropagated` は `undetermined` になり、機械的に完了判定が出ない。

### シナリオ F1a: 一部成立での中断記録（revision-record CLI）

処理実行後（v3 コミット）の依拠版基準影響評価（`--relied v2 --head v3`、ghost・作成候補を含む列挙、`--evidence-basis v0`）を `--impact` として渡し、6 下流対象の処置（no-update 2・updated 1・created 1・unconfirmed 1・pending 1）と承認記録・通知 3 時点区分を入力した。終了コード 0、保存先は一時環境の `.agentdev/phase/revisions/2026-11-04-s5-e2e-mock-revision-1.json`。

影響評価の入力が未解決（`fullyPropagated: "undetermined"`）のため、処置が揃った対象を含めて全 6 対象が `completed: false` になり、`completion: "incomplete"` となった。`excludedFromCompletion` に各対象の理由が記録され、全反映完了の宣言は存在しない。`resumeTargets` は空だが、記録の note と excludedFromCompletion の理由が「依拠版の確認と公開 CLI での再実行」までの再開手順を示し、再開に必要な情報は記録から再構成できる。

### シナリオ F2: fail-closed の 5 事例（非ゼロ終了の確認）

revision-record CLI に対し、次の 5 事例を同経路で試し、すべて終了コード 1（非ゼロ終了・記録確定なし）を確認した。

| 事例 | 入力 | 終了コード | 拒否メッセージ（要点） |
|---|---|---|---|
| F2-1 | 検証結果なしの updated | 1 | 更新・作成した下流対象に実施した検証の結果がなく記録を確定しない |
| F2-2 | 承認記録が空（未承認改訂） | 1 | 適用した承認の対象・内容・範囲の記録が空で改訂実行記録を生成できない |
| F2-3 | 語彙外の通知時点区分（during） | 1 | 通知の時点区分が不正 |
| F2-4 | 下流対象の識別重複 | 1 | 下流対象の識別が重複している |
| F2-5 | 破損した影響評価の入力（mode 不一致） | 1 | 影響評価の入力が relied-diff の出力でない |

### シナリオ F3: 再開と変更反映完了の判定（completed 記録）

再開では、F1a の記録から残る未成立処理（作成候補 missing-downstream.md）だけを処理した。v4 コミット（107fa855）で対象を作成・検証し、`git diff --name-status v3 v4` は `A docs/missing-downstream.md` の 1 件のみであった。成立済みの更新（impl・new-capture）と更新不要（design・testplan）は再適用しておらず、内容の重複は生じていない。

そのうえで、処理後の下流が実際に依拠する版 v4 を依拠版とした再評価（`--relied v4 --head v4`、`fullyPropagated: "yes"`・resolved）を `--impact` に渡し、5 下流対象（no-update 2・updated 1・created 2）と承認記録・通知 4 件（pre 1・in-progress 2・post 1）を入力した。終了コード 0、`completion: "completed"`、`excludedFromCompletion` 0 件、`resumeTargets` 0 件。保存先は `.agentdev/phase/revisions/2026-11-04-s5-e2e-mock-revision-2.json`。同一区分の複数回（in-progress 2 回）が許容されることも確認した。

旧証拠の適用可能性は対象ごとに記録した。design・testplan は `applicable`（blob 一致・現行上流との整合根拠を確認済み）、impl は v0 旧証拠を再利用せず新規検証で置き換えたため `null`、作成した 2 対象は旧証拠が存在しないため `null` である。

### シナリオ G: 承認範囲外・自動巻き戻しの不合格機構と対象外 4 項の禁止保持

承認されていない改訂（F2-2・承認記録空）は非ゼロ終了で記録が確定しない。phase-artifacts-update SKILL「完了済み過去工程の正規改訂と影響伝播」節の「有効な承認の対象・内容・範囲を特定できない場合は改訂を実行せず、確認対象として保留する。範囲外の内容の反映要求は承認範囲の再確認なしに実行しない」の記述が正規成果物本文で保持されている。承認の記録と実際の変更内容の対応は、改訂実行記録の approval フィールドと items の突合で確認できる。

現在工程の自動巻き戻しについては、revision-record・relied-diff の両 CLI に巻き戻し・取消の機能は存在しない（語彙検索 0 件）。SKILL 同節の「遷移記録の取消や現在工程の巻き戻しは行わない」が保持されている。

対象外 4 項の禁止は次のとおり保持されている。(1) 第1段階の差分評価機能は再実装せず公開 CLI を利用した（本変更は検証記録と sidecar のみで、relied-diff・revision-record のコード変更を含まない）。(2) 無影響部分の無条件な再生成は行っていない（処理コミット v3 の差分は impl.md・new-capture.md の 2 件のみで、up-to-date 判定の design・testplan は触れていない）。(3) 現在工程の自動巻き戻しの機構は存在しない（前項）。(4) 版台帳・汎用依存グラフ・専用履歴データベース・第2の管理台帳は作っていない（改訂実行記録は 1 改訂 1 ファイルで保存し、一覧性・索引性を持つ台帳は設けていない。SKILL・phase-readme の revisions/ の様式が契約）。

## Epic 完了条件との突合

| Epic 完了条件の要求 | 本検証での成立 | 根拠 |
|---|---|---|
| 必要な全下流工程が採用した工程間関係に沿って列挙される | 列挙は指定パス・依拠版..現行版の差分・履歴 touched の集合で行われ、中間更新不要（design・testplan）も正味差分ゼロ（req.md）も列挙から落ちなかった | シナリオ A |
| 各工程の影響評価が依拠版ごとに実行されている | 依拠版 v0 基準と v1 基準で影響分類が変化し、処理後の依拠版 v4 基準で再評価した | シナリオ A・A2・F3 |
| 更新・作成・再検証が実際の成果物で成立する | v3 で impl 更新・new-capture 作成、v4 で missing-downstream 作成。各対象に検証結果を記録 | シナリオ F1a・F3・版一覧 |
| 更新不要の候補に現行上流との整合を示す根拠がある | blob 一致と up-to-date 分類を根拠に no-update として記録 | シナリオ A・F3 items |
| 未確認の候補が完了側に含まれない | ghost（unverified）残存で fullyPropagated が undetermined になり全対象が完了側から除外された | シナリオ E2・F1a |
| 第1段階能力の再実装・契約変更が存在しない | 公開 CLI をそのまま利用し、本変更は docs/reports と sidecar のみ | シナリオ G・本変更の差分 |
| 失敗・未確認対象が完了側に含まれず再開に必要な情報が再構成できる | F1a は incomplete で全対象完了側除外・再開手順を記録。再開は未成立処理のみに触れ、F3 で completed になった | シナリオ F1a・F3 |
| 承認されていない内容を含む改訂と自動巻き戻しが実際に不合格と判定される | 未承認改訂（承認記録空）は非ゼロ終了で確定しない。巻き戻し機構は存在しない | シナリオ F2・G |

## 対象 7 行との対応

| 要件行 | 本検証で確認した成立面 |
|---|---|
| REQ-106-012 | 全下流の列挙と、中間更新不要を理由としない後続評価の継続（シナリオ A） |
| REQ-106-013 | 分類ごとの処理・更新不要の整合根拠・操作成功だけを完了証拠にしない機械規則（シナリオ F3・F2-1） |
| REQ-106-014 | 旧証拠の適用可能性の対象ごとの記録（stale・unconfirmed・applicable・null）と完了側からの除外（シナリオ A・A2・F1a・F3） |
| REQ-106-015 | 一部成立での中断からの成立状態再構成・未成立だけの継続・再適用による重複なし（シナリオ F1a→F3・git diff v3 v4） |
| REQ-106-016 | 判定材料（影響分類・更新内容・検証結果・未確認）を改訂実行記録と Git 履歴から再構成可能な形で保持（シナリオ F3・revisions/ 保存記録） |
| REQ-111-025 | 承認の対象・内容・範囲の記録必須化（空は非ゼロ終了）と記録からの対応確認（シナリオ F2-2・F3 approval フィールド） |
| REQ-111-026 | 通知の時点区分（pre・in-progress・post）の記録保持と同一区分の複数回許容（シナリオ F3 notices・F2-3 語彙外拒否） |

## 検証の限界

一時検証環境の成果物（仕様 A/B の模擬文書）は検証用の仮入力であり、利用者仕様の採用ではない。改訂実行記録の approval フィールドに記録した承認も一時環境での模擬承認であり、本リポジトリの正規成果物改訂に対する承認ではない。承認の記録と実際の変更内容の対応の機械検査は、approval 記録の存在必須化（空は非ゼロ終了）までを機械が担い、範囲対応の判断は工程管理側（phase-artifacts-update の手順）の判断責務である。この限界は対象 7 行の義務構造を変えない。verification 対応完全性の最終完全性検査は case-close QG-4 が担う。

## 品質統制

- docs 変更は本記録 1 件と `traceability/req-106-111-s5-verification.yaml` の 2 ファイルである。本記録の frontmatter はなし（docs/reports/ の記録様式に従う。REQ インデックス・Design インデックスへの影響なし）。
- 本文は yomiyasu 適用の自検を実施した（非生物主語の解体・冗長な補足カッコの削除・観測項目の地の文への統合・箇条書き比率の 38.6% から 8.1% への低減）。lint 実行（`yomiyasu_lint.py`）で箇条書き比率と太字頻度は推奨値内となった。英単語前後の半角空白の警告は、本リポジトリの既存文書様式（textlint 共通基盤の表記基準）に整合する表記であるため保持する。適用記録をこの節に保持する。
- traceability check（対象 7 行 scope 限定・9 検出項目）は PR 作成前に実行し、結果を PR 本文の検証差分に記録する。
