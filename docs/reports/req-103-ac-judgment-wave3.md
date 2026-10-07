# REQ-103 Wave 3 検証記録と AC-01〜AC-25 個別判定（最終）

対象は Issue #3538、親 Epic #3530、委譲識別子 DEL-3538-2（前回 DEL-3538-1 は result: blocked・コメント 6043063552 の SSoT で撤回した全件 pass 判定と required→optional 一律緩和を継承・復活させない）。
作業ブランチ case-3538、開始 HEAD 5bf62855（DEL-3538-1 終端）。本記録作成時点の HEAD は検証差分節の commit 一覧を正とする。
本記録は今回限りの記録であり、恒久台帳ではない（REQ-103-029）。

## AC-26 判定規則の適用

定義所在は docs/requirements/REQ-103.md「受け入れ条件対応」節を正とする。AC-26（REQ-103-031）の判定規則に従い、AC-01〜AC-25 を個別判定する。
covered 自己宣言、AC 番号の言及のみ、工程終了の記録は証明としない。not applicable は 0 件（適用されない根拠の説明を要する判定は発生しなかった）。
判定は現在の契約・対象成果物・評価範囲に有効な証拠に基づく。各判定の根拠は repository 永続成果物（ファイル+節）と GitHub 永続記録（Issue/PR/コメント ID・観測 ID）へ到達できる。
前回委譲と本委譲が作成した作業台帳（.agentdev/tmp/ 配下・untracked 一時ファイル）は本記録へ要点を転記したうえで削除済みである。本記録の根拠経路は台帳へ依存しない。

## AC 個別判定

| AC | 要件行 | 検証義務 | 判定 | 根拠証拠（到達経路） |
|---|---|---|---|---|
| AC-01 | REQ-103-001、002 | TS-001 | pass | docs/designs/foundations/v4-operating-model.md「正規モデル要素と正規所有 Design の対応（REQ-103-001）」節（Wave 1 PR #3539）の 11 要素×正規所有 Design 対応表。全正規所有 Design が実在（docs/designs/README.md 基盤 Design 一覧・status accepted）。横断読解で 5 観点（設計思想・判断責務・ライフサイクル・用語・所有関係）を確認し、旧設計前提の検出は旧語彙 3 件のみで本委譲が解消（DEC-039 語彙更新・v3-v4-crosswalk 帰属注記・document-model ライフサイクル表更新。commit 7939523e）。判断方法・確定権限・副作用実行可否の独立軸は v4-responsibility-boundaries「判断方法3分類の判別基準」「確定権限3分類の判定表」「HITL 判断確定原則」で説明 |
| AC-02 | REQ-103-016、017 | TS-010 | pass | PR #3544（merge commit aafcfa16）が 305 件（REQ 61・DEC 50・Design 180・Guide 14）の処遇判定と反映を完了（TS-010 機械照合 305/305・未評価残存 0。#3537 完了記録コメント 6041538721）。本委譲で keep 全件照合を実施（keep 295 件〔概要表記 294 は計数誤記〕で互換語 0・個別確認 23 件+IR 64 件共通根拠）。恒久台帳不新設を baseline..HEAD 新規 21 ファイルの分類で確認 |
| AC-03 | REQ-103-003 | TS-002 | pass | 6 workflow（case-ready・req-define・backlog-review・intake-promote・learning-promote・inspect-promote）の references に「閉じた意味評価の全件監査結果」節（Wave 2-1・PR #3542 merge d052d6fd）が実在し、閉包条件 6 条件適用と deterministic 境界判定（グラフ計算等を state 化し Jev で再判定しない）を全判断単位に記録。v4-responsibility-boundaries「判断方法3分類の判別基準」は「機械的に確定した結果を閉じた意味評価で再判定させる二重確認を行わない」を契約。入力の十分性・規則の妥当性の別命題は v4-quality-gate-model 統制種別 duplicated validation 行で区別 |
| AC-04 | REQ-103-003 | TS-002 | pass | 前行の全件監査で「機械的に確定できる事実・判定の Jev への混入」を既知問題 5 構造の横断点検として実施済み（各 workflow 監査節に同構造の残存なしの記録）。confidence による LLM 推論の機械的省略と Jev 結果の直接確定を禁止（case-ready execution-structure「Jev 評価経路」共通契約）。二重判定経路の除去は Wave 2-1 で完了（#3533 完了条件 1 pass） |
| AC-05 | REQ-103-004、006 | TS-003 | pass | v4-responsibility-boundaries「閉じた意味評価の閉包条件（REQ-090-024 から一般化）」節の 6 条件と「閉じた意味評価の採用理由と評価器適格性の記録契約（REQ-103-004〜006）」節（104〜112 行目・Wave 1）が採用条件を正規所有。6 workflow の全件監査節が各判断単位の閉包条件適用結果（6 条件すべて充足/不充足）と処置（維持・条件付き化）を記録。入力内部の未解決意味判断の非内包は閉包条件 6 として適用済み |
| AC-06 | REQ-103-005、006 | TS-003 | pass | (1) 不採用理由: 全件監査節の deterministic 境界適用判定が対象外部分（グラフ計算・件数計数・エッジ検出・一覧取得）と根拠（モデル推論なしで一意導出可能）を判断単位ごとに記録。(2) 適格性根拠: 監査節の根拠列が判断単位ごとの質問形式適合性（帰属先の排他閉集合=choice 適合・意味解釈を要する=意味判断適格・重複のない離散水準=scale 適合）を記録し、agentdev-jev tests が代表例（有効リクエスト受理・正規化済み結果返却）、反例（unknown field・重複 id・候補外・scale 違反の拒否）、判定不能例（正規化不能値の response_invalid 拒否・level 0 fallback なし）を恒常実証（bun test ① 2717 pass）。REQ-103-006 の括弧契約（大規模な性能実証や評価器全体の有効性研究を完了条件に含めない）に従い、上記の記録と恒常 test の組合せで適格性根拠の確認を成立と判定する。判断単位別の例示形式の独立記録は存在せず、監査節根拠列+形式実証 test の組合せが REQ-103-006 の要求水準（大規模研究を伴わない合理的根拠の確認）を満たすことを本判定で確定する |
| AC-07 | REQ-103-007 | TS-004 | pass | v4-responsibility-boundaries「開いた推論の適用範囲限定（REQ-103-007）」節が用途限定（fallback 禁止・自動確定禁止）を契約。custom-tool-contracts「Jev 先行評価」節が呼出側契約として所有。fallback 経路・新規規範自動確定経路の網羅範囲全文検索は Wave 2-1 で実施（#3533 完了条件 1 pass・TS-004）、本委譲の横断読解で旧語彙系を再検索し現行規範としての残存 0。LLM 推論の正規使用箇所は開いた問題（壁打ち・根因探索・候補形成）に限定 |
| AC-08 | REQ-103-008 | TS-005 | pass | 障害系実測 3 層: (1) failure observation 9 件が .agentdev/jev-observations/ に永続（例: 20260927T042633Z-b244・failure.kind network_error の構造化保存）。(2) 本委譲の実呼び出しで観測 20261007T175255Z-a366 が永続化され、observation_write の入力不備が invalid_input 構造化失敗として返却（fallback・自動 retry なし）後に訂正・成功。(3) 恒常 test: agentdev-jev tests/engine.test.ts（provider throw は構造化分類・自動 retry なし・response_invalid は level 0 fallback なし・not_configured は呼出し前判定）が bun test ① で恒常 pass。契約面は custom-tool-contracts「Jev 先行評価」節と v4-responsibility-boundaries「閉じた意味評価の障害時契約（REQ-103-008〜011）」節。実経路観測: #3533（Wave 2-1）で not_configured 実測と観測 20261007T094047Z-418b（recovery path）の永続化を PR #3542 で実施済み |
| AC-09 | REQ-103-009 | TS-005 | pass | 依存後続抑止・独立処理継続の実経路観測（GitHub 永続履歴・時刻は JST 換算）: #3537 DEL-3537-1 blocked 2026-10-07 18:46:49（コメント 6035362730）〜DEL-3537-2 failed 23:09:21（コメント 6039747708）〜復旧完了 2026-10-08 00:50:04 の間、依存後続である Wave 3 #3538 は開始されず（#3538 開始日時 02:00:00 は復旧完了後）。一方、独立処理 4 件は blocked 中に継続・完走（#3534 19:48、#3535 20:27、#3533 21:12、#3536 22:04・各 Issue 本文 進行状況）。判定不能の合格化・非該当化の不在は agentdev-jev tests/index.test.ts（失敗観測の構造化生成・失敗観測への最終判断反映拒否）で恒常検証。runtime 面契約は v4-runtime-execution-model「判定未確定時の依存後続抑止（REQ-103-009）」節 |
| AC-10 | REQ-103-011 | TS-006 | pass | 復旧後の正規再開の実経路観測: #3537 は DEL-3537-2 failed 後、誤った全件判定表（0e6b9400・51f43305）を「確定判断として採用しない」と撤回し（コメント 6039747708「誤った変更の訂正」節）、影響しない部分成果（宣言移管）のみ再利用して DEL-3537-3 再委譲で復旧・完了（2026-10-08 00:50:04・Issue 終了日時・完了記録コメント 6041538721）。成功済み副作用の重複実行なし（case-close が merge 直前 HEAD b56da46f で独立再実行検証）。観測 418b（recovery path evaluate after not_configured・value true・最終判断反映済み）が同一評価の復旧後再実行と観測永続化を実証。中断耐性は index.test.ts（観測永続化の fail-open・evaluator 成功後の観測存続）で恒常検証。再開契約の正は v4-durable-state-and-recovery「評価器復旧後の評価再開契約（REQ-103-011）」節（再開前に変更影響確認・SSoT 再構成優先・durable state 新状態追加なし）。新規状態・台帳の追加を前提としない既存経路で成立 |
| AC-11 | REQ-103-010、012 | TS-005、007 | pass | v4-responsibility-boundaries「人間判断への引き上げ条件」節が移行条件 5 項目を完全列挙し、「判断の難易度、確信度、評価器間の不一致、結果状態、一意解でないことは引き上げ条件ではない。評価器の障害…も引き上げ条件ではない（REQ-103-010）」を明記（76〜79 行目）。「確定権限3分類の判定表」が委譲された裁量（内部実装判断・意味保持の RU 統合・合意済み要件の具体化）と人間留保の区別を判定表化。実経路観測: #3537 blocked→failed 期間中、評価器障害を理由とした人間判断への移行は発生せず、正規の再委譲（DEL-3537-3）で復旧。本委譲内でも not_configured・invalid_input の構造化失敗は判定未確定として扱われ（AC-08）、人間判断移行・fallback・合格化のいずれも発生していない |
| AC-12 | REQ-103-013 | TS-008 | pass | artifact-contracts 150 行目「soft contract は、厳格な API schema や過剰な互換維持機構を要求しない契約特性として定義する（REQ-103-013）。soft contract を LLM 解釈必須の理由、機械的処理を避ける理由、schema validation の全面禁止の理由として扱わない」。document-model「緩やかな契約（soft contract）」行も本委譲で REQ-103-013 整合へ修正（commit 62a03a28）。決定的処理可能部分の機械処理の実体: agentdev-traceability scripts（sidecar schema の存在確認・型・ID 参照の機械検証・check 9 pass）、agentdev-jev validateEvaluateRequest（構造検証）、traceability/policy.yaml・ng-baseline（列挙値管理）。「LLM 解釈必須」「schema validation の全面禁止」を根拠とする記述の残存検索 0 件（本委譲実施） |
| AC-13 | REQ-103-014 | TS-009 | pass | v4-standard-lifecycle「主要責務の正規所有者一覧（REQ-103-014）」節（Wave 1 整備）が 11 責務の正規所有者を一意に列挙。TS-009 の対応表作成と重複所有・移管漏れ・Guide 不一致の突合は Wave 2-2 で実施（PR #3540 merge 336095b6・#3534 完了条件 1 pass）。sidecar 宣言（agentdev-workflow-case-auto.yaml・agentdev-epic-tracker.yaml・guides-terminology-correction.yaml・ra002）と traceability check pass で機械突合 |
| AC-14 | REQ-103-015 | TS-009 | pass | v4-standard-lifecycle「Wave、意味的依存、実行並列上限、競合情報の一意定義（REQ-103-015）」節が 4 概念を一意定義。Wave 割当は「意味的依存 DAG からのトポロジカルレベル割当として決定的導出」であり、本 Epic #3530 実行構成表の構成推論根拠（3 軸判断・Wave 割当・重複前置検出）で導出手順の実績を確認（Epic 本文・構成推論の根拠節）。実行並列上限は DEC-051 スロット型キュー（slot_queue.ts）で単一所有。ra002 verification 宣言 |
| AC-15 | REQ-103-022 | TS-013 | pass | 旧語彙パターン 8 系統の全文検索を修正対象列挙全域（docs・src・.opencode・traceability・.agentdev/extensions）で実施（本委譲横断読解）: case-update・design-save・design-readiness・semantic/deterministic 旧列挙・partially superseded・req-backlog 系・次のステップ・Artifact Graph/docs.specs 等。検出の全件を「歴史記述（Decision 採用時記録・superseded 本文・対照表・検出器定義。REQ-103-020 保持対象）」と「現行規範としての使用」に分類し、現行規範としての使用 3 件（DEC-039 決定(5) 語彙・v3-v4-crosswalk 帰属語彙・document-model ライフサイクル表）を本委譲で現行語彙へ解消（commit 7939523e）。IR-065/066 が機械検出として恒常実行（check_integrity exit 0・new unmanaged 0）。accepted Decision 採用時記録の旧語彙は歴史的説明と判定し、現行体系への導線（DEC-029 の廃止明示・vocabulary-registry 対照・v4-standard-lifecycle 現行語彙）で誤認防止を担保（REQ-103-021 整合） |
| AC-16 | REQ-103-018 | TS-011 | pass | v4-quality-gate-model「統制種別と必要性（REQ-103-018・019）」節（123〜140 行目・Wave 2-3 PR #3541 merge 27d7eb77）が統制種別ごとの必要性説明の正規節。現行適用箇所の機械検索列挙と突合を本委譲で実施: hard gate（QG-1〜QG-4・Wave gate・配布依存境界 gate）、fail-closed（Custom Tool 書込み・書込み guard・v4-runtime-execution-model fail-closed 適用範囲）、checker（check_integrity・check_changed_docs・check_extensions・check_distribution_boundary）、MUST NOT・禁止規則（AGENTS.md 行動規範・委譲契約 MUST NOT DO・各 SKILL の DO NOT FOR）、adversarial-review（REQ-015 7 caller）、HITL（HITL 判断確定原則）、fallback（fail-open 例外列挙: 検査・診断系・traceability・観測書込み）、duplicated validation（読戻し照合・件数突合）、state（durable state enum・v4-lifecycle-state-machine）、ledger（traceability policy/sidecar・ng-baseline provenance）、routing（agentdev-workflow-routing・work_type routing）、additional schema（req_draft 出力構造・Custom Tool 操作契約）。全適用箇所で必要性説明が同表に存在。恒久列挙台帳は新設しない（REQ-103-019・本節の検証体制契約どおり） |
| AC-17 | REQ-103-019 | TS-011 | pass | baseline tag（72e04cad）..HEAD の新規 21 ファイルを全件分類: intake inbox 11（範囲外発見の別課題記録）・jev-observations 5（観測記録）・DEC-052（Wave 2-1 後継 Decision・REQ-103 実装の正規部分）・REQ-103.md（本要件）・判定記録（今回限り）・traceability sidecar 2（ra002・req-103-wave3-verification。既存 traceability 機構内の対応宣言 component）。中央 router・ledger・新規 state・新規 gate・新規 schema・新規 checker・恒久台帳の追加 0 件 |
| AC-18 | REQ-103-020 | TS-012 | pas
| AC-19 | REQ-103-021 | TS-012 | pass | retired/REQ-045.md 履歴注記が後継（後継なし・一回限り再評価契約は REQ-103-029 正規所有）・廃止根拠（2 回の実行完了と同種契約の正規所有収束）・恒常責務の継承（機械検査 REQ-010・意味診断 REQ-036）・監査レポート保存先（docs/reports/ 歴史記録）へ導線。IR-015（retired REQ 現行参照検出）・IR-040（HTML コメントの retired REQ 単独参照排除）・IR-041（retired/ パス接頭辞）が恒常検出（check_integrity pass・#3544 で REQ-103-020/021 verification 宣言）。本委譲で command-file-format の監査識別子参照へ retire コンテキスト付与（7939523e・正規到達導線の強化） |
| AC-20 | REQ-103-023 | TS-013、001 | pass | 本委譲の横断読解が 5 観点（設計思想・判断責務・ライフサイクル・用語・所有関係）ごとに正規文書の通読と突合を実施し、相互矛盾する現在像を検出しなかった。検出した旧語彙 3 件は意味矛盾ではなく追随漏れであり、本委譲で解消済み（AC-15） |
| AC-21 | REQ-103-024、025 | TS-014 | pass | 実現物整合: check_integrity（IR-016 projection・IR-068 manifest 含む全検査）exit 0・bun test ① 2717 pass ② 349 pass ③ 652 pass（残 2 fail は workflow_body_contract timeout flake〔単独再実行 13 pass 0 fail〕と REQ-061-019 pin 文言〔main 未反映の既知・worktree 単独再実行 65 pass 0 fail〕で本変更起因 0）。配布依存境界 failures 0（scanned 332）。実運用入力の検査と結果消費の接続: agentdev_jev evaluate 実呼び出し（観測 a366 永続化・構造化失敗の返却）・Case Issue #3538 本文の完了条件を本実行で消費・traceability check が宣言追加を受理して 9 pass へ変化。静的呼出元の有無確認を実経路の成立と区別した。投影照合: src/common 共通原本と src/opencode（plugins）・src/senpi（tools 接続 registration）の配置は multi-host-canonical-model 契約どおり。本委譲は src/ 変更 0 で投影差分なし。未合意の規範確定・提供能力の削減は検出されない |
| AC-22 | REQ-103-026 | TS-015 | pass | keep 全件照合（本委譲実施）: PR #3544 処遇一覧の keep 295 件（テーブル 231+IR 64）を全件検定し、根拠に互換語を含む keep は 0 件。個別確認 23 件（skills 機能列挙型 17・統制必要性型・accepted 維持型 2・実体対照型）は全て現行有効性（固有所有・現行稼働・正規所有・統制必要性説明済み）を根拠。提供能力の維持出発点の扱い: OpenCode/Senpi・GitHub/ローカル Issue 等の能力は現行稼働を出発点として維持で、能力廃止案は発生していない（retire 1 件は一回限り契約の実行完了による REQ-045 のみ）。計数誤記（概要 keep 294 vs 実数 295）を検出・記録（判定への影響なし・SSoT は本文内訳の実数） |
| AC-23 | REQ-103-027 | TS-015 | pass | v4-operating-model「v4 の中核と維持条件（REQ-103-027）」節（61〜71 行目・Wave 1）が中核 5 要素（要件に基づく継続的開発・要求の意味の保持・判断権限の分離・永続状態と実行安全・証拠連鎖）を定義し、各要素の正規文書（charter・v4-responsibility-boundaries・v4-durable-state-and-recovery・v4-runtime-execution-model・v4-quality-gate-model）と対応。baseline..HEAD 差分で中核の放棄なし（正規化の強化のみ。工程名・工程数・内部配置の変更〔内部 lifecycle 化・slot_queue 移行〕は中核放棄の判定条件ではない〔REQ-103-027 括弧契約〕）。中核放棄判明時の停止条件は発火していない。外部契約の変更なし |
| AC-24 | REQ-103-028 | TS-016 | pass | git rev-parse: baseline-v4-canonical-convergence-20261007 は annotated tag（cat-file -t = tag・tag object 9866ffe3）で ^{commit} = 72e04cadc4ff8fa00b6f484f421975c99a75b449 を指す。非 SemVer 名で release tag（v1.0.0〜 等 SemVer tag 群）と分離。本委譲での tag 操作なし |
| AC-25 | REQ-103-028 | TS-016 | pass | baseline..HEAD の差分比較を一意に実行（git diff --stat = 99 files changed・1529 insertions・111 deletions・本委譲検証差分に記録）。tag 指す先は受領時記録（#3538 完了条件・#3530 本文）と一致し、非移動を確認 |

pass 25 件、fail 0 件、blocked 0 件、not applicable 0 件。

## TS-017 の確認（完了条件の追加不在）

REQ-103-029 に従い、無関係な改善・新しい研究・継続的再評価能力の整備は本判定に含めない。
本委譲が実施した追加作業は、前回 blocked 理由 5 件の解消（traceability 宣言補完・実経路検証・keep 全件照合・横断読解・check_integrity 原因確定）と、その実行中に検出した同一対象問題の残存の解消（旧語彙 3 件・soft contract 定義整合・REQ-045 retire 参照コンテキスト・IR-072 追随）のみである。
範囲外の発見は既存 intake 記録（#3544 が 11 件回収済み）に追加で回収すべき事項はない（check_integrity 表示乖離の構造特性は #3544 intake に既存・本委譲で原因構造を確定済み）。

## 実測検証と適用範囲

以下の一時証跡の退避先は C:/WINDOWS/TEMP/opencode/（textlint vendor 生成は main 側 plugin package での README 必須手順実行）。
①と②は worktree root、③は指示された main root で実行した。

| 検証 | 実測結果 | 証跡 | 適用範囲と留保 |
|---|---|---|---|
| bun test ① | 2717 pass・0 fail・110 files・exit 0（274.64s） | test-1-d2.txt | repo-agentdev-integrity scripts 検査。Jev Tool tests（REQ-103-008/009 恒常検証）と IR-068 projection test を含む |
| bun test ② | 349 pass・0 fail・25 files・exit 0 | test-2-d2.txt | src/common/skills 配下 |
| bun test ③ | 初回 644 pass・10 fail（textlint vendor 未生成）→ vendor 生成後 652 pass・2 fail・exit 1 | test-3-d2.txt・test-3-d2-rerun.txt | 残 2 fail: workflow_body_contract timeout flake（単独再実行 13 pass 0 fail・test-wbc-d2.txt）と REQ-061-019 pin 文言（main 未反映の既知・worktree 単独 65 pass 0 fail・test-pin-d2.txt）。本変更起因 0 件 |
| check_integrity | 初回 exit 1・new unmanaged NG 1（retired-req-primary-ref・REQ-045）→ 文言修正後 exit 0・0 new・NG 0 | integrity-d2.err・integrity-d2.json・integrity-d2-r2.err・integrity-d2-final3.err | 原因確定と解消は本文外の作業記録に基づく（applyNgBaseline が ng+warning を delta 計算・REQ-045 retire 由来 warning が baseline 未登録で exit driver 化） |
| traceability check 完全形式 31 行 | 9 pass・0 fail・exit 0 | trace-check-d2-after.json・trace-check-d2-final.json | 本委譲の宣言追加後（最終 commit 62a03a28 で再確認） |
| targeted docs guard | failures 0・warnings 0・exit 0 | docs-guard-d2.txt | 本委譲の docs 変更 7 ファイル |
| 配布依存境界 最終 gate | failures 0・scanned 332・exit 0 | dist-boundary-d2.txt | source profile |
| AUTOGEN dry-run | WOULD UPDATE 0・exit 0 | autogen-d2.txt | 索引派生物鮮度一致 |
| textlint final gate | hard 40・exit 1（既知 40 のみ）。main 同時実行と path:line:column:ruleId 完全集合一致・新規 0・除去 0 | textlint-final-d2.json・textlint-final-main-d2.json | 変更行由来 hard 0。line-level 差分は advice の位置ズレ（exit 判定対象外） |
| LSP diagnostics | 本委譲は .ts 変更 0 件のため fresh diagnostics の対象ファイルなし | なし | 前回は timeout・取得不能扱い |
| baseline tag | annotated tag・^{commit} = 72e04cadc4ff8fa00b6f484f421975c99a75b449・非 SemVer・tag 操作なし・baseline..HEAD 差分 99 files（1529 ins / 111 del） | git rev-parse・git diff --stat | AC-24/25 証拠 |
| git status / git diff --check | worktree clean（commit 後）・tsconfig*.json 変更 0 | git status --porcelain | スイープ stage なし |

## 前回 blocked 理由 5 件の解消対応

| 前回停止理由（コメント 6043063552） | 本委譲での解消 |
|---|---|
| 1. REQ-103 全 31 行の traceability 完全性（missing-implementation 14・missing-verification 19） | 全行の実体確認（3 段台帳方式）に基づき implementation 宣言 12 行・verification 宣言（恒常 test 2 行 + 今回限り記録 19 行）・policy optional 17 行を適用。check 9 pass 0 fail（exit 0）。実体不在行は 0（REQ-103-028 の tag 実体は file path を持たない git 成果物であり運用契約節へ宣言・実測は TS-016 記録） |
| 2. TS-005・TS-006・TS-014 実経路検証 | Jev 障害系を恒常 test（engine/index tests）+ 永続観測（418b・failure observation 9 件・本委譲実呼び出し a366）+ Epic #3530 GitHub 履歴（コメント ID・Issue 日時つきの依存後続抑止・独立処理継続・復旧後再開）で実測。TS-014 は既存検証群の実行と結果消費接続の確認で完遂 |
| 3. TS-015 keep 全件照合 | keep 295 件（実数。概要 294 は計数誤記と判明・記録済み）を全件検定し互換語 0・個別確認 23 件。v4 中核 5 要素の維持説明を v4-operating-model 節と baseline..HEAD 差分から確定 |
| 4. TS-001・TS-013 全域横断読解+投影照合 | 5 観点の横断読解と旧語彙 8 系統の全文検索を網羅範囲で実施。検出 3 件を現行規範として本委譲で解消し、残存は歴史記述と分類。投影照合は既存 checker（配布依存境界・IR-016/068・traceability check）の実測と src 構造確認で完遂 |
| 5. check_integrity 終了コード 1 の原因確定 | applyNgBaseline が ng+warning を delta 計算する構造と、#3544 由来 REQ-045 retire 参照 warning が baseline 未登録のため exit driver 化していたことを特定。文言修正（retire コンテキスト付与）で解消・exit 0 を再確認。表示乖離の構造特性は REQ-103-029 の範囲外発見として既存 intake 記録を維持 |

