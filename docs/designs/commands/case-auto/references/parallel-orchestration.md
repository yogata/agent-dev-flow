---
title: 複数 execution_unit 並列 orchestration
status: accepted
created: "2026-11-19"
updated: "2026-11-27"
---

<!-- 親: docs/designs/commands/case-auto.md から参照される詳細仕様（遅延読み込み）。 -->

# 複数 execution_unit 並列 orchestration

<!-- ADF-COVERS(design): REQ-034-049, REQ-034-050 -->

## 前工程の case-close 中に行う先行作業

先行作業は stage 3 内の後続 Issue の準備である。入力に確定済み Definition、対象 Issue、基点 SHA、安定した作業識別子、読取・書込範囲、個別試験を持つ。親は、未統合差分と未確定のインターフェースへの依存を照合する。根拠が取れた独立範囲だけを候補にし、別 worktree・別ブランチで起動する。同じ作業識別子の稼働中・状態不明・処理済みの候補を再起動しない。

例えばホスト別の接続実装と各単体試験、確定済みの境界を用いる経路設定は、変更・参照範囲が独立していれば先行できる。共有する配布一覧、トレーサビリティ、文書、統合試験、前工程で確定する契約を必要とする変更は正式担当が扱う。先行担当の副作用は許可パス内のローカルコミットと個別試験に限定する。

先行作業経路では stage 3 の正式実行・先行作業・進行中の case-close を合計して同時5本以内とする。case-close は既存の active Issue task 枠には計上せず、この実稼働上限に計上する。稼働が不明な委譲は終了確認まで数える。前回の起動時刻から10秒以上経ち、空きができた時点で1件ずつ投入する。既存ゲートを満たす case-close と正式 case-run を先行作業より優先する。先行作業の開始・終了による Issue の正式状態、Wave の収束、依存充足の遷移は発生しない。依存先の case-close の対象には Epic 内で閉じる子 Issue も含める。

正式 case-run の起動時に、確定した依存結果と先行作業のローカル記録を読み戻す。所属、実測した基点・コミット、許可範囲の差分、個別試験を照合する。正式基点が進んだ場合は基点間の差分が先行作業の読取・書込範囲に重ならないことを確認して取り込み候補とする。観測不能、差分競合、証拠不足または試験失敗の成果は取り込まず、正式実行を既存経路で継続する。取り込み後は個別試験と最終 HEAD の品質ゲートを実行し、正式担当だけが共有成果物を編集し、GitHub に反映する。

## 複数 execution_unit 並列 orchestration（REQ-006、現行の責務体制は DEC-036（DEC-038/039 が補完））

case-auto は case-open が生成した execution_unit 群（standard | epic の混在）を orchestration 対象とする（REQ-034-018）。
従来の「単一 Epic の Wave 反復制御」を「複数 execution_unit 群反復制御」へ一般化する。
case-auto は case-open の判定結果に従い、Standard Issue と Epic 子 Issue を単一 Issue の case-run で実行する（Epic 子 Issue は stage 3 のインライン case-run。case-run(#epic) 独立経路は廃止済み。薄いオーケストレーター原則、Issue 階層決定・子 Issue 選択・Epic 化判定の委譲を維持）。
Issue 階層決定、子 Issue 選択、Epic 化判定の判断ロジックは持たない。

### 処理単位の一級概念化（現行の責務体制は DEC-036（DEC-038/039 が補完））

case-auto は処理単位を一級概念として扱う（REQ-034-035）。
処理単位は少なくとも次の意味を持つ。

- 安定した識別子
- 入力
- 出力
- 依存関係
- 所有対象
- 現在状態
- 完了条件
- 検証結果
- 必要な場合の worktree との対応

処理単位の具体的な格納形式、スキーマは本 Design の対象外とし、Design 側（orchestration 層の詳細仕様）で確定する。
Git 上の変更を伴う並列処理では処理単位を worktree で隔離する（REQ-035-011）。

依存関係上独立した処理単位は並列実行可能と判定する。
実行可能な処理単位、並列可能性、合流条件、一部失敗時の全体状態遷移は ADF 側の判断として所有し、実際に起動するエージェント数、起動 API、実行基盤固有の並列化手段は正規契約へ固定しない（REQ-034-036）。
並列処理の一部が失敗・中断した場合、完了済み処理を未完了へ戻さず、全体の次状態を規則に従って判定し、必須処理単位が揃っていない状態で後続処理へ進まない（REQ-035-011）。

### 並列実行の判定

並列可否は連結成分（必須依存のみをエッジとする）で判定する（REQ-034-013）:

- 必須依存がない複数 execution_unit 間（Epic 間、Standard 間、混在）は並列実行
- 同一 Epic 内の子 Issue 間は意味的依存で順序づけ、依存充足済みの子 Issue からスロット型キューで投入する（REQ-034-012）
- 技術的依存レベル（L0-L3）は並列判定軸から外す。ファイル衝突（L2）があっても並列を許容し、PR マージコンフリクトは後続 PR の rebase で解決する（REQ-034-013, REQ-031-003）

グローバル並列上限は設定しない（REQ-034-013）。
実行並列上限は 1 回の orchestration の stage 3 全体で共有される active Issue task 数の上限（REQ-034-027、数値 5）として case-auto が単一所有する（DEC-041）。
Epic、Wave、Standard Issue、case-run 呼出しごとの独立した実行枠は設けない。N 個の execution_unit が並列実行された場合も、stage 3 全体で共有される active Issue task 数のみが制御対象となる。論理上限と harness の同時起動制限（bg task API 上限等）は切り離し、harness 制限は adapter・実装制約（キューイング・バンドリング等）として扱い、論理上限の値の根拠としない（DEC-041）。

### runtime 制御契約

stage 3 の runtime 制御ループは case-auto が所有し、次の契約に従う（REQ-034-040〜045、REQ-035-016、REQ-035-017、DEC-041、DEC-042。詳細は runtime-execution-model「runtime 制御ループ」節）:

- 共有 active 枠: 1 active task は 1 Issue への実装実行委譲であり、Epic・Wave・Standard Issue を横断して active Issue task 数が上限（現行 5）を超えない
- 空き枠補充: 各 Epic の依存充足済みの子 Issue（Wave の前後を前提としない）と Standard Issue から開始条件を満たす Issue を候補として認識し、active 数が上限未満で実行上の安全条件を満たす候補がある限り補充する（横断補充は best-effort でなく必須）。最初に起動した全 task の完了を待つ固定 batch 方式を取らず、起動間隔（10 秒）と局所的な競合回避の運用は維持する（REQ-034-040）
- 状態管理: Issue 実行の状態を pending、ready、active、実行結果確定で区別して管理する（REQ-034-041）
- 再開: 再開時は既存の active task を計上し、同一 Issue の二重起動と上限超過を防ぐ。状態不明の task は終了確認まで実行枠を解放せず、完了済み Issue を未完了に戻さない（REQ-034-041）
- 統合処理: 統合処理（マージ・クローズ相当）は active Issue task の実行枠を消費しないが、共有書き込みの直列化点として扱う（REQ-034-042）
- 依存充足ゲートとスロット型キュー: 子 Issue の開始は当該子 Issue に必要な全ての意味的依存条件の充足（必要な統合・マージの完了を含む）のみを条件とし、Wave 収束（全子 Issue の実行結果確定、未処理・実行中・状態不明なし）を後続の子 Issue 開始の前提としない（完了即次投入のスロット型キュー）。Wave 構成は意味的依存 DAG から決定的に導出される実行構成の記録単位として維持し（REQ-061-038）、依存充足の判定には wave-gate の依存充足ゲート純関数を再利用する。blocked、failed、delegation-unavailable は依存充足とはみなさない（REQ-034-012、REQ-035-016、REQ-035-017）。依存関係のある Definition merge は排他維持する
- 重複の実行時検出: stage 3 の委譲前に同一 Wave 内の子 Issue 間で変更対象ファイル集合の重複を検出し、一時直列化・変更対象の調整・merge 順序・衝突解消担当の判断に用いる。変更対象集合が取得不能な子 Issue を含む場合は比較を省略せず検出不能として報告する（REQ-034-043、REQ-035-012）
- Wave 表現: Wave 表現は子 Issue 数の上限を持たない（Epic サイズ上限のみ適用）。runtime 上の batch や一時直列化を Wave 分割として永続化しない（DEC-041）
- 並列維持（REQ-034-028、REQ-034-044、DEC-042）: 並列実行は必須であり、実行環境由来の障害（background task の消失、親 run の中断、プロバイダー障害等）を理由とする同期逐次実行（順次フォールバック）への切替を行わない。並列起動が当該 stage の起動可能対象集合に対して1件も成立しない場合は、直列化で完了を装わず停止理由「並列起動不能」（原因の断定を含まない）と再開可能性を報告して停止する。再開時は REQ-034-025 の再開契約および REQ-034-041（再開時の active task 計上、同一 Issue の二重起動防止）に従うことを条件に、durable state（Issue、PR、RU、draft、bg task 状態、worktree の git 状態）を照合して未完了かつ再試行可能な対象のみを特定し、起動間隔契約（最初の委譲は直ちに開始、以降の委譲起動ごとに間隔を置く、同一ツール呼び出し一括ブロックでの複数起動を行わない、前 task の完了待ちを起動の条件にしない）に従う staggered background fan-out で並列再委譲し、並列性の回復を resume の反復で追求する（反復に回数上限を設けない）。REQ-034-029 の状態別回復（親ループによる代行回復を含む）および REQ-034-030 のコンフリクト解消再委譲は本条の対象外とし各既存契約に従う

### 委譲指示の構築規律（case-ready・case-close の並列委譲起動）

stage 2（case-ready 委譲起動）と stage 4（case-close 委譲起動）の委譲指示は、本書の並列実行契約（「並列実行の判定」「execution_unit 群反復制御への一般化」）を実行文言に反映して構築する。本節は既存契約の変更ではなく、委譲指示の構築規律を明示する。

- 委譲指示は独立した対象全体の逐次実行を命じない。独立対象は並列起動し、必須依存で結合された対象群のみを局所的に順序づける。stage 間の順序（stage 間 fan-in）と stage 内の対象間順序を混同しない
- 競合する共有書込み（main への merge、push、採番、AUTOGEN 索引更新、同一 Epic Issue 本文更新）は競合対象を特定した上で当該部分のみ直列化し、競合の存在を隠さない
- 並列起動が1件も成立しない場合は「並列起動不能」停止に従い、逐次実行による成功偽装をしない
- 委譲指示の静的検査（指示文言の確認）、局所排他の検証、実 workflow の並列実行確認（対象別の起動・処理・終了証跡）を区別する。静的検査だけを実行時の並列性の証明として扱わない
- stage 4（case-close 委譲起動）の委譲指示の MUST DO には、Design 状態評価（対象 REQ に関係する draft Design の棚卸し制）と Design README（docs/designs/README.md）status 列更新を必須項目として含める。委譲指示は、委譲先 workflow skill が契約する STEP 表と MUST DO 義務を網羅確認してから構築し、指示から落ちた工程が委譲先で実行されないことを前提に項目漏れを作らない。本項目は case-close の Design 状態評価契約（REQ-032-024〜026）の実行を委譲指示構築側で確実にする規律であり、case-close 側の棚卸し評価手順は変更しない

### blocked 部分停止、ready 継続判定フロー

各 execution_unit の状態（closed/blocked/failed/running/ready）を読み取り、以下の判定フローで orchestration する（REQ-034-035, REQ-034-015）:

| execution_unit 状態 | case-auto アクション |
|---|---|
| ready | 起動（共有 active Issue task 枠でインライン case-run を起動。case-run は常に単一 Issue 実行） |
| running | 完了待機 |
| completed | case-close 相当処理へ進行 |
| blocked | 当該 execution_unit のみ停止。他の ready 対象は継続 |
| failed | 当該 execution_unit のみ case-close 対象外。他の completed-pr は case-close 対象 |

**終了条件**: 全 execution_unit が closed/blocked/failed になったら終了する。
一部 blocked が残存する場合は partial blocked として報告する（REQ-034-015）。

### execution_unit 群反復制御への一般化

従来の「単一 Epic の Wave 反復制御」は execution_unit 群反復制御の特殊ケース（execution_unit = 1 件の Epic）となる。
execution_unit 群の実行は orchestration stage を stage 内最大並列・stage 間全対象収束で制御し、execution_unit 単位の縦切り pipeline（各 unit が case-run → case-close を先行完結する実行）として制御しない（REQ-034-025）。

- execution_unit が standard issue の場合: stage 3 で case-run(standard) を実行し、stage 3 の対象群収束後に stage 4 で case-close を実行
- execution_unit が epic issue の場合: stage 3 で Wave 反復制御を完遂する（子 Issue へのインライン case-run 実行と case-close(#epic) 相当の統合処理の反復。制御は case-auto stage 3 が単一所有し、case-run は単一 Issue 実行として呼び出される。DEC-041、REQ-031-015）。Wave 間および最終 Wave の case-close(#epic) 相当の統合処理は Wave 反復を進行・完遂させる stage 3 内部処理であり、stage 4 の開始とはみなさない。stage 4 では追加の case-close を行わない

OU 逐次処理（REQ-034-011）は、必須依存で結合した execution_unit 群に適用される。
必須依存のない execution_unit 群は順序を問わず並列実行できる（REQ-034-011 例外条項）。

共有書き込みの局所直列化（REQ-034-026）の対象範囲と単位は、共有資源カテゴリごとに次のとおりである。

- main への merge / push はリポジトリ単位で直列化する
- 同一 Epic Issue 本文への更新は Epic 単位で直列化する（per-Epic 単一書き手。無関係な Epic 間は並列可）
- 採番・AUTOGEN 索引更新はグローバルに直列化する
- 対象固有ファイルは対象単位で並列実行可

lock、queue、scheduler 方式は本 Design の範囲外とする（REQ-034-036）。

#### 段階派遣の single-flight 保護（REQ-034-047）

stage 3 の段階的派遣（case-ready 起動、子 Issue 起票を含む）は、同一 orchestration 対象（Epic / Wave 単位）ごとに single-flight とする。進行中の派遣が存在する場合、後行の派遣要求は新規派遣を行わず既存派遣の再利用（待機・合流）へ切り替える。

- 進行中派遣の検出は、当該 orchestration 対象に紐付く Issue 状態・実行記録から判定する。lock / queue / scheduler 方式は範囲外（REQ-034-036）と同様に、本節は共有状態への書き込み順序と再利用の判断のみを規定し、新規の同期機構を導入しない
- 子 Issue の新規作成は、作成前に既存オープン Issue の検索（重複検知）を前置し、既存 Issue の再利用を優先する（冪等性。Epic #3457 の二重派遣・子 Issue 重複事例の再発防止）
- 二重派遣を検知した場合は、後行インスタンスが先行インスタンスの最終状態を確認してから是正（重複子 Issue の無力化・クローズ）し、先行結果の自動破棄を行わない

### 結果集約

各 execution_unit の結果（completed-pr / blocked / failed / delegation-unavailable）を case-auto が集約し最終判定に反映する（REQ-034-031）。
親コンテキスト非累積原則に従い、実装詳細は保持せず Issue / PR 状態から再読込する。

### 停止理由分類（REQ-034-015/108 拡張）

case-auto は停止時に停止理由を以下の分類で報告する。本節が停止理由分類（10分類）の値域・定義・対応（実行結果状態、利用者判断の要否、再開入口）の単一正本であり、Workflow Skill（`agentdev-workflow-case-auto`）の実行参照文書・停止報告・再開指示は本節の分類値を列挙し本節を名前で参照する（配布物本文に REQ/Decision 識別子の新規参照を追加しない）。分類は再開コマンド選択とユーザー通知の精度向上が目的であり、HITL 境界の変更ではない。本節は分類の新設・廃止を行わず、現行10分類の値域を維持する。

本節は次の概念を区別する。停止条件（いつ停止するか。全量は REQ-034-015）、停止理由分類（なぜ停止したかの報告分類。本節の10分類）、原因別処理（失敗・停止理由の原因分類。8原因分類は REQ-096-012）、停止種別（Case 失敗 blocked / failed と区別される報告種別。infra-transient）、停止伝播に付随する報告分類（user-decision-required。分類一覧の値ではない）。検出・分類適用・報告の手順は Workflow Skill が所有し、本節はこれらを複製しない。

| 分類 | 定義 | 対応停止条件 | 実行結果状態 | 利用者判断の要否 | 再開入口 |
|---|---|---|---|---|---|
| req-define 合意要件からの逸脱 | case-open または後続工程が合意済み要件、対象外、受け入れ条件を変更した場合、合意されていない機能要件または制約を追加した場合、合意済み OU を欠落・統合・分割して要件の意味を変更した場合 | (1) | blocked（要件再合意が必要） | 要 | req-define での再合意後に case-auto を再開（Root Case 指定） |
| command 契約・実装不整合 | execution_unit へ分割可能であるにもかかわらず case-open が単一 Epic 子 Issue 上限により停止した場合、case-open または後続工程の実装が契約へ整合していない場合、構成生成事前検証（REQ-032-015）が実装されていない場合 | (11) | fail（実装・契約側の欠陥） | 原則不要（実装の修正） | 実装修正後に case-auto を再開 |
| 要件未合意のスコープ拡大 | 合意されていないスコープが実行中に追加された場合 | (2) | blocked（要件再合意が必要） | 要 | req-define での再合意後に case-auto を再開 |
| repo 外実体変更 | DB マイグレーション実行、デプロイ/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更が必要な場合 | (3)(4)(5)(6) | blocked（repo 外操作の実行待ち） | 要（repo 外操作の実行判断） | 利用者による repo 外操作の実行・承認後に case-auto を再開 |
| CI/test/lint 失敗 | コンフリクト解消モデル（v2:ADR-0132）の Level 2 まで試行しても自己修復不能な場合 | (7)(8) | fail | 原則不要（実装・検証の修正） | 修正後に case-auto を再開 |
| branch 削除検出 | 作成元不明 branch / user-owned branch / 他作業 branch の削除を検出した場合 | (9) | blocked（削除判断待ち） | 要（削除の判断） | 利用者の削除判断後に case-auto を再開 |
| 未コミット変更の帰属不明 | 変更の由来が不明で安全に続行できない場合 | (10) | blocked（帰属確認待ち） | 要（帰属の確認） | 帰属確認後に case-auto を再開 |
| 上位合意矛盾 | bounded parent decision resolution で decision_context が現行正規情報源間の矛盾に起因し、既存正規契約から導出できない場合に限る。解決可能な不一致は権威優先で解消して自走停止にせず、未解決規範矛盾に該当する場合のみ本分類で報告する（REQ-034-034、DEC-008 決定3） | —（STEP-6 経由） | blocked（矛盾解消待ち） | 要（矛盾の解消判断） | 矛盾解消（finding 経路を含む）後に case-auto を再開 |
| 新規ユーザー判断事項 | 同 decision_context が、新しいユーザー価値判断、対象範囲変更、外部契約変更を必要とし、正規契約から導出できず case-auto に委譲された裁量（REQ-096-015）の範囲外である場合、すなわち人間に留保された判断（REQ-096-005）の新規確定を要する場合（REQ-034-034、DEC-008 決定4） | —（STEP-6 経由） | blocked（新規判断の確定待ち） | 要（人間に留保された判断の新規確定） | req-define での再合意後に case-auto を再開 |
| 並列起動不能（実行環境由来） | 停止条件11項目に対応しない独立停止事由。当該 stage の起動可能対象集合に対して背景起動が1件も成立しない場合。原因の断定を含まない。delegation-unavailable との弁別基準は「委譲起動不能時の扱い」節を参照（REQ-034-028、REQ-034-044、DEC-042）。停止報告には起動試行履歴（試行回数、起動成立数、最終成功起動時刻）を含める（REQ-034-045） | —（独立停止事由） | 停止（並列性の回復待ち） | 要（実行環境の回復運用） | 実行環境の回復後に durable state からの冪等再開（REQ-034-044） |
infra-transient（ツール基盤故障）は停止種別であり、本表の分類軸ではない。Case 失敗（blocked / failed）と区別して報告し、判定条件（単一ツール恒常失敗・プロセス生存・再試行無効・他経路正常の4条件同時成立）と回復経路は「infra-transient（ツール基盤故障）停止分類」節が所有する。

user-decision-required（adversarial-review 由来）は停止伝播に付随する報告分類であり、本表の分類軸ではない（case-run result enum の第5状態でもない）。受領した decision_context はまず bounded parent decision resolution へ入力し、上位合意矛盾・新規ユーザー判断事項のいずれかに帰着した場合に限り自走停止してユーザー判断を待機し、正規契約から導出可能なもの・委譲された裁量の範囲内のものは回答して当該下位の resume point から再開する（位置づけは「user-decision-required の位置づけ（REQ-014-012）」節）。

execution_unit 分割可能性があるにもかかわらず case-open が停止した場合、「req-define 合意要件からの逸脱」ではなく「command 契約・実装不整合」として報告する。
これは case-open の契約・実装不整合であり、要件doc側の問題ではない。

「上位合意矛盾」「新規ユーザー判断事項」は bounded parent decision resolution（REQ-034-032〜034、DEC-008）で case-auto が decision_context を自律解決できない場合の停止理由分類である。
case-auto は正規契約から導出できる（REQ-096-003）、または case-auto の工程進行・実行調整に委譲された裁量（REQ-096-015）の範囲内にある decision_context を自律解決するが、それらの範囲外のものは本2分類のいずれかへ分類してユーザーへ返す。
本分類は REQ-096-012 の失敗・停止理由の原因別処理（8原因分類: 実装不具合、証拠不足、外部依存障害、運用前提不足、上流投影不備、解決可能な不一致、未解決規範矛盾、人間留保判断）と対応し、各原因に対する回復責務の判定は REQ-096-012 を正とする。
詳細は後述「bounded parent decision resolution（REQ-034-032〜034、DEC-008）」節を参照。

詳細な停止条件の全量は REQ-034-015（本拡張で11項目）を参照。

### infra-transient（ツール基盤故障）停止分類

infra-transient はツール基盤（harness・Custom Tool 実行環境）の故障に起因する停止種別であり、
Case 失敗（blocked / failed）と区別して報告する。判定条件は次の4条件の同時成立とする:

1. 単一ツールの恒常失敗（再試行でも成功しない、決定的な失敗）
2. プロセス生存（長寿命実行プロセス自体は生存し、HTTP API 等は応答する）
3. 再試行無効（同一プロセス内での再試行が成功しない）
4. 他経路正常（git・DB・ローカル FS 等の他の実行経路は正常に動作する）

infra-transient と分類した場合、停止報告に回復経路を記載する: supervisor 等による harness 再起動で
回復可能であること、および durable state（Issue、PR、RU、draft、git 状態）からの冪等再開が成立する
こと。停止理由の分類は case-ready / case-run / case-close の停止報告を case-auto が集約する既存構造に
のせ、各 workflow の停止報告形式に infra-transient の分類と回復経路の記載欄を反映する。
harness 側の修正（fresh process 分離・自動再初期化）は本リポジトリの対象外とする。

### コンフリクト解消モデル（3レベルエスカレーション）（REQ-003, v2:ADR-0132）

PR マージコンフリクト発生時は、以下3レベルのエスカレーションで解消を図る。
各レベルを試行しても解消できない場合のみ次のレベルへ進む。
機械的競合（rebase で自動解決可能）は停止条件に含まず、Level 1 で case-close が解消する。

| Level | 実行主体 | 解消手法 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消。自動解決時は再マージ（REQ-003-001） | case-auto へエスカレーション（REQ-003-002） |
| Level 2 | case-auto | 両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けて case-run へ再委譲。最大2回（元の並列実行を含む計3回の case-run 実行）（REQ-003-003/004） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離（REQ-034-035 拡張） | 停止 |

**停止条件の段階化**: case-auto はコンフリクト解消に対して常に全力で解消を図る。
発生元（同一 case-auto 内、別 case-auto 跨ぎ）に関わらずアクセス可能な文脈を総動員する（REQ-003-005）。
停止条件は Level 2 の再委譲を上限回数（2回）試行しても解消しない場合とする（REQ-003-006）。
Level 1 で解消できる機械的競合は case-auto の停止条件から除外する。

Level 1 の rebase 実行、エスカレーション判定は case-close の責務（`docs/designs/commands/case-close.md` コンフリクト解消 rebase パス参照）。
case-auto は Level 2/3 のオーケストレーション級判断を担う。

**Level 2 解消レシピ（AUTOGEN ブロックの競合）**: AUTOGEN ブロック（README 索引、件数キャプション、メトリクス表等）の競合は、手動での競合解決を行わず「新 base 上での再生成」で解消する。先にマージ済み PR を取り込んだ新 base（main）上で `generate_indexes.ts` を再実行し、再生成結果で当該 AUTOGEN ブロックを解消する。この経路を Level 2 の正道とし、AUTOGEN ブロックに対する手動マージを試行しない。
