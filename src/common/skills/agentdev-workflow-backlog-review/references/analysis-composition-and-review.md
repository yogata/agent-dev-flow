# STEP 詳細: 実行前同期・成果物検出 / 分析・暫定分類 / 統合分割判定 / review / HITL（backlog-review）

> 本 reference は `agentdev-workflow-backlog-review` SKILL.md の制御平面（STEP 一覧）STEP-1〜STEP-5 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-1: 実行前同期・成果物検出
- STEP-2: 分析・暫定分類付与
- STEP-3: 統合・分割判定・depends_on 依存解決
- STEP-4: review（adversarial-review）
- STEP-5: HITL（ユーザー承認、RU 生成承認を兼ねる）

## STEP-1: 実行前同期・成果物検出

### Purpose

実行前同期を行い、対象の採用済み成果物を検出する。

### Input Resolution

- backlog-review command から渡される引数（ファイルパス指定）の有無（durable state 最優先は promoted/ 実ファイル）
- ドメイン状態永続化プロシージャは `agentdev-git-worktree` に従う

### Preconditions

- backlog-review command が起動されている

### Procedure

1. `git pull --ff-only` を実行する。失敗時は構造化エラーメッセージを表示して停止する（`agentdev-git-worktree` と同一のエラー形式。自動解消しない）
2. 引数の有無に応じて対象を切り替える。
引数なしの場合は三ディレクトリ（`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md`）から採用済み成果物を検出する。
引数ありの場合は指定されたファイルパスのみを対象とし、存在しないパスはエラー報告してスキップする
3. 検出結果を判定する。
0件の場合は正常終了とする（エラー扱いとしない。完了報告で「対象なし」と報告）。
1件以上の場合はファイルパス昇順で STEP-2 へ進む

### Result

- 対象成果物一覧（ファイルパス昇順）

### Evidence

- 検出結果（対象ディレクトリ、ファイルパス一覧）

### Completion Verification

- 引数指定時は指定パスの存在確認結果が記録されていること
- 対象 0 件時に正常終了扱いであること

### Resume-Idempotency

- promoted/ 実ファイルから検出を再構築できる。読み取りのみのため再実行に副作用がない

## STEP-2: 分析・暫定分類付与

### Purpose

各成果物を読み込み、分析し、RU 候補ごとに暫定分類を付与する。

### Input Resolution

- STEP-1 の対象成果物一覧（durable state: promoted/ 実ファイル）
- 分析基準、前工程からの引き継ぎメタデータ付与ルールは `agentdev-backlog-integration` の公開操作契約に従う
- docs/knowledge/ 知識文書保存・重複・陳腐化した知識の削除・保留の処置候補判定は `agentdev-backlog-integration` の docs/knowledge/ 知識文書保存と backlog 自体の処置の契約に従う
- document-model Design（extension 経由）の文書7分類モデルを参照する

### Preconditions

- 対象成果物が 1件以上検出済みであること

### Procedure

1. 各採用済み成果物を読み込み、分析する
2. 各 RU 候補について、document-model Design（extension 経由）の文書7分類モデル（REQ、挙動Design、カタログDesign、guide、learning維持、作業記録、対象外）を参照して暫定分類を付与する
3. docs/knowledge/ への知識文書保存へ処置すると判定した採用済み成果物（source type は問わない。learning-promote が知識としての保存適否ありと判定して受け渡したものを含む）については、`agentdev-backlog-integration` の docs/knowledge/ 知識文書保存と backlog 自体の処置の契約に従い処置候補（docs/knowledge/ 知識文書保存、知識の削除、保留）を判定する。docs/knowledge/ 知識文書保存の処置候補については、既存 docs/knowledge/ 配下ファイルとの重複・陳腐化を確認し、新規、更新、置換、削除の操作種別を判定する。REQ / Decision / Design 反映、ガードレール移管、Project Extension 接続、通常の Issue による修正等の具体的実現先へのルーティングは learning 由来を含めて行わず、システム変更を必要とするものは RU 構成案へ含める
4. 分析結果と併せて RU frontmatter に `tentative_classification` として記録する（記録は STEP-7 の RU 生成時。本 STEP は付与内容を確定する）

### Result

- 分析結果、暫定分類付与結果、RU 以外の処置候補（docs/knowledge/ 知識文書保存候補は操作種別判定結果を含む）

### Evidence

- 各成果物の分析結果、暫定分類（文書7分類モデルのいずれか）、RU 以外の処置候補、docs/knowledge/ 知識文書保存候補の操作種別（保存候補がある場合）

### Completion Verification

- 全 RU 候補に暫定分類が付与されていること
- docs/knowledge/ 知識文書保存へ処置すると判定した採用済み成果物について処置候補が判定されていること。RU 構成案へ含める成果物と RU 以外の処置の成果物の割り当てが記録されていること
- docs/knowledge/ 知識文書保存の処置候補について操作種別（新規、更新、置換、削除）が判定されていること

### Resume-Idempotency

- promoted/ 実ファイルから分析・暫定分類を再構築できる。不可逆処理を含まないため再実行に副作用がない

## STEP-3: 統合・分割判定・depends_on 依存解決

### Purpose

採用済み成果物の統合、分割を判定し、depends_on 依存を解決して RU 構成案を確定する。
既存の意味、対象範囲、優先順位を変更しない統合・分割は委譲された裁量として自律確定し（REQ-{NNNN}-{NNN}。判断方法: 閉じた意味評価。確定権限: 委譲された裁量）、統合・分割によって意味の選択、破棄、対象範囲変更、優先順位判断、未解決規範矛盾の解消が必要になる場合は人間判断へ移行する（STEP-5 HITL・STEP-6 矛盾検出）。

### Input Resolution

- STEP-2 の分析結果、暫定分類（中断時は promoted/ 実ファイルから STEP-2 を再構築して導出する）
- 統合、分割判定基準、depends_on 依存解決ルールは `agentdev-backlog-integration` の公開操作契約に従う

### Preconditions

- STEP-2 完了（分析・暫定分類付与済み）

### Procedure

1. 統合、分割判定を行う（N:1 統合 / 1:N 分割 / 1:1）
2. depends_on 依存解決を行う（未解決、循環、並べ替え可能性の検証）
3. RU 構成案（統合・分割判定結果、depends_on 解決結果、暫定分類付与結果）を確定する
4. docs/knowledge/ 知識文書保存、知識の削除、保留の処置と判定された成果物を RU 構成案から除外し、RU 以外の処置案として承認提示対象へ含める（処置内容は `agentdev-backlog-integration` の docs/knowledge/ 知識文書保存と backlog 自体の処置の契約に従う）

### Result

- RU 構成案、RU 以外の処置案

### Evidence

- RU 構成案（統合・分割の判断根拠、depends_on 検証結果）、RU 以外の処置案（処置別内訳）

### Completion Verification

- 全成果物が RU 構成案または RU 以外の処置案のいずれかに割り当てられていること
- depends_on に unresolved、循環が残っていないこと

### Resume-Idempotency

- promoted/ 実ファイルから RU 構成案を再構築できる。不可逆処理を含まないため再実行に副作用がない

## STEP-4: review（adversarial-review）

### Purpose

RU 構成案の意味的決定を adversarial-review で検証し、accepted finding を RU 構成案へ反映する。
発動条件判定と review 呼出を分離して実施する。

### Input Resolution

- STEP-3 で確定した RU 構成案（runtime artifact。中断時は promoted/ 実ファイルから再構築する）
- 候補判断基準、内部手続きは `agentdev-backlog-integration` の公開操作契約に従う
- 共通 caller integration 契約の正規所有者は adversarial-review Design である

### Preconditions

- STEP-3 完了（RU 構成案確定済み）
- 挿入境界、発動条件、順序、矛盾取扱いの正規所有者は backlog-review command Design「adversarial-review 挿入境界（backlog-review）」節である

### Procedure

1. **発動条件判定**: RU 構成案（統合・分割判定、depends_on 依存解決）に意味的決定が存在する場合に発動する（default-on）。
ユーザー明示指定は通常発動の必須条件ではない。
skip 条件（RU 構成要素が1件のみで統合・分割判定不要、depends_on 解決不要、矛盾検出対象が存在しない）該当時は省略して従来フロー（STEP-5 以降）を継続する。
skip 判断のためだけの新規 HITL、承認点は追加しない。
ユーザーが review の実施を明示的に指示した場合は通常のユーザー指示としてその場で実行する（専用の検出・フラグ・保存・伝播・skip 条件の専用上書き処理を持たない）
2. **review 呼出**: 発動と判定された場合のみ `agentdev-adversarial-review` を起動する。
審議対象は RU 構成案（統合・分割判定結果、depends_on 解決結果、暫定分類付与結果）。
呼出契約、返却契約、副作用境界は `agentdev-adversarial-review` と v4-delegation-contracts Design（`semantic_review`、書き込み禁止型）を正とする
3. **accepted finding 反映**: accepted finding の RU 構成案への反映は本 workflow（呼出元）の責務である。
反映後に RU 構成案の意味内容が変更された場合、必要な既存検証（depends_on 再解決、矛盾検出再実行）を行い、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる。
同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない
4. **矛盾の扱い**: review 審議で採用済み成果物間の矛盾が指摘された場合、当該矛盾は STEP-6（既存矛盾検出）へ引き渡す。adversarial-review 自身は矛盾を自動解決せず、矛盾の判定、partial success 扱い、ユーザー追加判断への委ねは STEP-6 の既存矛盾検出ロジックが正である
5. **unresolved 時の取扱い**: unresolved な本質的争点またはユーザー判断事項が残る場合、RU 生成（STEP-7）、採用済み成果物削除、Git 永続化（STEP-8）等の後続不可逆処理へ進まない
6. **呼出失敗時**: silent skip を禁止し、従来フロー（STEP-5 以降）を維持する

### Result

- review 結果反映済み RU 構成案（skip 時、呼出失敗時は STEP-3 の構成案をそのまま継承）

### Evidence

- 発動条件判定結果（発動/ skip と根拠）、review 呼出記録、accepted finding と反映結果（発動時）

### Completion Verification

- 発動条件判定が記録されていること（発動・skip いずれも）
- 発動時は accepted finding の反映結果が RU 構成案へ反映済みであること

### Resume-Idempotency

- review は書き込み禁止型（`semantic_review`）のため再呼出に副作用がない。promoted/ 実ファイルから RU 構成案を再構築し、発動条件判定からやり直す

## STEP-5: HITL（ユーザー承認、RU 生成承認を兼ねる）

### Purpose

RU 構成案をユーザーに提示し、明示的な承認を得る。
ユーザー承認は RU 作成承認を兼ねる。

### Input Resolution

- STEP-3 / STEP-4 の RU 構成案（中断時は promoted/ 実ファイルから再構築する）
- 承認フローは `agentdev-backlog-integration` の公開操作契約に従う

### Preconditions

- RU 構成案確定、STEP-4 skip または review 完了であること

### Procedure

1. RU 構成案（統合・分割判定、depends_on 解決結果、暫定分類）と RU 以外の処置案（docs/knowledge/ 知識文書保存、知識の削除、保留）をユーザーに提示する
2. ユーザーの修正指示を受け付け、必要に応じて STEP-3 をやり直す
3. 明示的な承認を得て承認を確定する
4. 後続の STEP-6 で矛盾が検出されない場合、本 STEP の統合、分割判定承認を RU 生成承認（STEP-7）としても扱う。単一承認で処理し、追加の HITL は不要
5. 破壊的変更（矛盾解消、要件仕様スコープ変更、大量成果物削除等）は明示承認を維持する
  6. RU 以外の処置（docs/knowledge/ 知識文書保存、知識の削除、保留を含む）もユーザーの明示承認を経る。docs/knowledge/ 知識文書保存は操作種別（新規、更新、置換、削除）ごとの変更内容（整形後の知識文書、対象ファイル、変更内容）を利用者へ提示し、承認を得る。未承認の処置は実行せず、当該成果物は promoted に残置する。承認なしの docs/knowledge/ 書き込みは行わない（REQ-{NNNN}-{NNN}）

### Result

- 承認確定（RU 生成承認を兼ねる）

### Evidence

- RU 構成案の提示とユーザー承認の対話記録

### Completion Verification

- RU 構成案がユーザー承認済みであること

### Resume-Idempotency

- 承認状態は単独では durable state に記録されない。RU 実ファイル（STEP-7 の成果物）を承認証跡として扱い、証跡がない場合は未承認と解釈して本 STEP をやり直す。承認前の再実行に副作用はない

## Jev 先行評価の逐次経路（REQ-{NNNN}、DEC-{NNN}）

閉じた意味判断ごとに、次の基本判断経路（逐次経路）を実行できる。Jev は最終判断者ではなく、後段の LLM 推論への追加情報として扱う（Stage 1: 観測可能化）。

1. **Jev 先行評価**: Custom Tool `agentdev_jev` の `evaluate` に、本 Workflow が構成した閉じた判断入力（state、指示、基準、質問群。日本語。repository 全文を渡さない）を渡す。evaluator 成功後・LLM 推論へ進む前に、当該評価の観測（1 semantic evaluation = 1 observation）が `.agentdev/jev-observations/` へ永続化される
2. **LLM 推論**: Jev 結果・候補別確率分布・取得できた confidence を情報として含み、従来の判断材料（promoted 実ファイル本文、文書7分類モデル、統合・分割判定基準、docs/knowledge/ 処置契約）も参照して推論する。Jev 結果だけで判断しない
3. **LLM 最終判断**: 従来経路と同一の判断基準で最終判断を確定する。Jev 結果・confidence は最終判断を確定させない
4. **最終判断の観測反映**: Custom Tool `agentdev_jev` の `observation_write` で、evaluator 成功観測へ最終判断結果（final result）を追記する。evaluator 返却結果と最終判断が異なる場合のみ、差異理由の分類（evaluation_input_defect / semantic_disagreement / deterministic_override / unknown）を記録する

共通契約:

- 利用可否は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は API を呼び出さず構造化失敗（not_configured）を返し、観測を生成しない
- 評価器障害（not_configured、timeout、429、5xx、network error、response validation error 等）で評価が成立しない場合、LLM 推論へ fallback して判定を継続せず、当該判定を未確定として扱い、当該判定に依存する後続の副作用および状態遷移を開始しない。判定未確定を不合格または非該当へ変換せず、依存しない独立処理を一律に停止せず、評価器障害だけを理由に人間判断へ移行しない。判定未確定の停止（停止条件と再開条件を含む）を報告し、状態記録は証跡として残す。契約の正は v4-responsibility-boundaries Design「閉じた意味評価の障害時契約」節（runtime 面の適用は v4-runtime-execution-model Design「判定未確定時の依存後続抑止」節）
- Jev API 失敗時は自動再試行せず、失敗観測に失敗分類と最小 diagnostic が記録される。正規状態を破損しない
- 評価器復旧後は、正規の再実行・再開経路で評価を再実行する。再開前に入力・規則・成果物・証拠への変更影響を確認し、影響する古い判定を再利用せず、成功済み副作用を重複実行せず、影響しない証拠は再利用する。修復・再試行・設定等の運用介入を判定方式の代替または新規規範の確定と混同しない。再開契約の正は v4-durable-state-and-recovery Design「評価器復旧後の評価再開契約」節
- 観測は 1 semantic evaluation = 1 observation（1 JSON）で `.agentdev/jev-observations/` に保存する。confidence は evaluation 単位の一次事実であり、provider が返した場合のみ保存する。質問単位への複製・確率分布からの代替生成を行わない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 条件付き評価の発動制御（REQ-{NNNN}-{NNN}）: 親となる判断の結果によって後続判断の必要性が決まる場合、親判断の最終確定結果が発動条件を満たした場合だけ後続の意味評価を生成する。Jev による親判断の先行評価結果のみをもって後続評価を発動しない。発動条件が成立しない場合は後続質問自体を生成せず、後続の意味評価に対応する観測記録（非該当等を表すためだけのものを含む）も生成しない
- 観測識別子の安定性（REQ-{NNNN}-{NNN}）: 同じ意味判断を継続する場合は観測識別子（workflow、evaluationKind、questionId）を維持する。判断対象、結果範囲または判断基準の意味が変わり変更前後を同一の意味判断として比較できなくなる場合、および複数の判断を統合した場合は新しい questionId を使用する。入力および契約の版の違いは sourceRevision、requestDigest 等の既存の観測項目で区別する。既存の観測記録に対して移行、書換え、識別子の付替えを行わない
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

適用位置: STEP-2 の暫定分類付与と docs/knowledge/ 処置候補判定、STEP-3 の統合・分割判定と depends_on 解決の並べ替え可能性検証、STEP-4 の発動条件判定に適用する。

初期割当て（適用対象19件のうち本 Workflow が所有する4件）:

| 判断単位 | 質問形式 |
|---|---|
| 暫定分類（文書7分類モデルへの帰属） | choice（REQ・挙動Design・カタログDesign・guide・learning維持・作業記録・対象外） |
| docs/knowledge/ 処置候補判定（処置候補と操作種別） | choice（保存・削除・保留）+ choice（新規・更新・置換・削除） |
| 統合・分割判定（N:1 / 1:N / 1:1） | choice（統合・分割・1:1） |
| depends_on 解決の並べ替え可能性検証 | boolean（並べ替え可能/不能） + score（循環・未解決の影響度水準） |

choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）:

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正（最近似候補への高確率張り付きと LLM 是正の組合せ）は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。最終判断の観測反映時に差異理由（evaluation_input_defect）として記録された是正のうち候補構造欠落由来と判明したものは、判断器精度評価の集計から除外する

判断単位ごとの閉じた判断入力構成（REQ-{NNNN}-{NNN}）:

各判断単位の評価入力は、当該評価入力だけで判断可能な形に閉じて構成する。score 形式は重複のない離散 scale と各 level の意味境界を評価入力に明示し、boolean 形式は true / false の判断条件を評価入力のみから解釈可能に記録する。choice 形式の NULL 候補含否は前節の規約に従い、判断単位ごとに明示判断を記録する。表中の「─」は当該質問形式を使用しない単位であることを示す。

| 判断単位 | score scale（重複のない離散水準と各 level の意味境界） | boolean の true / false 条件 | choice の NULL 候補含否の明示判断 |
|---|---|---|---|
| 暫定分類（文書7分類モデルへの帰属） | ─ | ─ | 含めない。文書7分類モデルの「対象外」クラスが NULL 相当（いずれの文書種別にも帰属しない）を網羅するため、NULL 候補を加えると意味が重複する。構成時に含めないと判断して確定する |
| docs/knowledge/ 処置候補判定 | ─ | ─ | 含めない。第1 choice（保存・削除・保留）は保留が非確定系を網羅し、第2 choice（新規・更新・置換・削除）は処置候補=保存または削除時にのみ問う操作種別の閉集合である。いずれも NULL 候補の追加箇所がないと構成時に判断した |
| 統合・分割判定 | ─ | ─ | 含めない。1:1 クラスが統合も分割も不要な場合を網羅し、NULL 候補を加えると意味が重複する。構成時に含めないと判断して確定する |
| depends_on 解決の並べ替え可能性検証 | 循環・未解決の影響度に 3水準（低/ 中/ 高。重複なし）。低 = 循環なし・未解決参照なし、中 = 未解決参照があるが解決経路が明確、高 = 循環がある、または解決に新たな判断を要する | true = 並べ替え可能（依存が必須でなく、部分順序での実行が可能）。false = 並べ替え不能（必須依存が実行順序を固定する） | ─ |

deterministic 境界の適用判定（REQ-{NNNN}-{NNN}）:

境界判定基準「モデル推論なしで一意に導出できること」を各判断単位に適用した結果を次に記録する。対象外とした部分の導出結果は後続の semantic evaluation の state として利用し、deterministic に確定した結果を Jev で再判定させない。評価後に判明した deterministic な確定は差異理由 deterministic_override として処理する。境界判定が確定できない部分は、閉じた意味評価の閉包条件（REQ-{NNNN}。判別基準の正典は `<foundations/v4-responsibility-boundaries>` Design「閉じた意味評価の閉包条件」節が集約所有する）によって判定し、「決定的処理として確定できない」という理由のみで評価対象に分類しない。

| 判断単位 | 対象外とした部分 | 根拠 |
|---|---|---|
| 暫定分類 | promoted 実ファイルの存在・frontmatter 形式の検証 | 機械検証で一意に判定できる。検証結果を state として渡し、文書種別への帰属判断のみを質問する |
| docs/knowledge/ 処置候補判定 | 既存 docs/knowledge/ ファイルの slug 一致検索 | 検索は事実確認であり一意に導出できる。検索結果（既存知識文書の一覧）を state として渡し、処置判断のみを質問する |
| 統合・分割判定 | 同一対象 REQ への複数 promoted の検出 | 対応関係の検索による機械的検出で一意に導出できる。検出結果を state として渡し、統合・分割の意味判断のみを質問する |
| depends_on 解決の並べ替え可能性検証 | 依存グラフの循環検出・未解決参照の検出 | グラフ走査による決定的判定で一意に導出できる。検出結果（循環・未解決の一覧）を state として渡し、並べ替え可能性の意味判断と影響度評価のみを質問する |

## 閉じた意味評価の全件監査結果（REQ-{NNNN}）

導入時に割当てられた本 Workflow の判断単位（4件）を存続を前提とせず全件監査し、各判断に「維持」「決定的処理への移行」「条件付き化」「統合」「削除」「T1（正規判断主体の再設計）への持ち越し」のいずれかの処置を確定した。閉じた意味評価の閉包条件（REQ-{NNNN}。判別基準の正典は `<foundations/v4-responsibility-boundaries>` Design「閉じた意味評価の閉包条件」節）の6条件を各判断単位に適用した。現行の質問数・質問構造の維持を監査の制約としない。

| 判断単位 | 閉包条件適用結果 | 処置 | 根拠 |
|---|---|---|---|
| 暫定分類（文書7分類モデルへの帰属） | 適格（6条件すべて充足） | 維持 | 「対象外」クラスが NULL 相当を網羅する候補集合であり、機械検証結果を state として渡す入力閉包が確定している。帰属判断は文脈解釈を要する意味判断 |
| docs/knowledge/ 処置候補判定（処置候補と操作種別） | 適格（6条件すべて充足） | 条件付き化 | 第1 choice（保存・削除・保留）の最終確定結果が保存または削除である場合に限り、第2 choice（新規・更新・置換・削除）の後続質問を生成する。保留と確定した場合は第2 choice の質問自体を生成せず、対応する観測記録も生成しない。判断対象・質問形式・判断基準の意味は変更しないため観測識別子（workflow、evaluationKind、questionId）は維持する |
| 統合・分割判定（N:1 / 1:N / 1:1） | 適格（6条件すべて充足） | 維持 | 1:1 クラスが統合も分割も不要な場合を網羅する閉集合。対応関係の機械的検出結果を state として渡す入力閉包が確定している |
| depends_on 解決の並べ替え可能性検証 | 適格（6条件すべて充足） | 条件付き化 | 循環・未解決参照の検出結果が空でない場合に限り、score 形式（循環・未解決の影響度水準）の後続質問を生成する。検出結果が空の場合は影響度「低」を検出結果から機械導出し、score 質問自体を生成せず対応する観測記録も生成しない。並べ替え可能性の boolean は常に判断対象である。判断対象・質問形式・判断基準の意味は変更しないため観測識別子（workflow、evaluationKind、questionId）は維持する |

既知問題5構造（正解となり得る選択肢の欠落、機械的に確定できる事実・判定の Jev への混入、親条件不成立時の後続質問生成、評価尺度の水準間での意味境界の重複、実際の評価対象と固定された適用一覧の不一致）の横断点検を実施した。文書7分類モデルの「対象外」クラスによる正解クラス網羅を確認済み、deterministic 境界判定によりグラフ走査等の機械的確定の混入なし、本節の条件付き化により親条件不成立時の後続質問生成なし、影響度 scale は重複のない離散3水準、本節により適用一覧を実態と一致させて更新済みであり、本 Workflow の判断単位に同構造の残存はない。T1（正規判断主体の再設計）への引継ぎ事項は発生しなかった。

### 判断単位別の機械化不採用と評価器適格性根拠（監査追記）

正規モデル全面収束要件の Wave-3 完了訂正において、決定的処理不採用理由の具体と評価器適格性根拠の記録水準に対応して、本 Workflow の判断単位ごとの代表例・反例・判定不能例と機械化不採用案を追記する。引用する観測 ID は .agentdev/jev-observations/ 配下の永続観測であり、失敗観測は failure.kind 付きの構造化保存として記録され、評価不能の合格化・非該当化は発生していない。

| 判断単位 | 代表例（成功観測・実値） | 反例（機械化すると誤判定になる実例） | 判定不能例（評価不能の実測） | 機械化不採用案（候補・負担・崩れ方） |
|---|---|---|---|---|
| 暫定分類（文書7分類モデルへの帰属） | 20261006T165221Z-5a46（7分類+対象外が同一 run に実出現。対象外=NULL 相当）・20261004T172146Z-9a7e | 拡張子・配置パス規則による文書種別判定は本節の deterministic 対象外化済みであり、残る帰属判断をパス規則へ置換すると内容主題に基づく帰属（guide と Design の境界等）を誤る | 20260927T072207Z-8240（analysis-step23。暫定分類と統合・分割判定・depends_on 解決を含む run が network_error で構造化保存） | パス・frontmatter 規則マッチ（実装低・存在確認と形式検証は既に deterministic 対象外化済み。残る内容帰属の語面規則化は文書主題の多様性への追随負担で崩れる） |
| docs/knowledge/ 処置候補判定（処置候補と操作種別） | 20261004T172300Z-2c95（第1 choice=保存）→20261004T172435Z-d3ce（第2 choice=新規）の条件付き連鎖を実測 | 既存 slug 一致検索は本節の deterministic 対象外化済み。残る処置判断を検索結果へ機械写像すると「新規保存候補だが既存文書と主題重複」の判断を誤る（検索一致 0 件でも更新が正解の候補があり得る） | 本単位の失敗観測なし。判定不能実測は暫定分類の行を参照 | 検索一致数による機械導出（実装低・一致 0 件=新規という規則は主題重複の判断を内包し崩れる） |
| 統合・分割判定（N:1 / 1:N / 1:1） | 20261004T172435Z-681e（統合 10・1:1 構成 8 が同一 run に実出現。1:1=NULL 相当） | 対応関係検出は本節の deterministic 対象外化済み。残る統合・分割判断を検出件数規則へ置換すると「同一 REQ への複数 promoted があっても独立維持が正解」の候補を誤統合する | 本単位の失敗観測なし。判定不能実測は暫定分類の行を参照 | 検出件数閾値による機械統合（実装低・件数と統合可否は非相関。独立維持が正解の複数対応候補を誤統合する） |
| depends_on 解決の並べ替え可能性検証 | 20261004T172456Z-0754（reorderable=true。循環・未解決なしで影響度 score を不生成とする条件付き化を実測） | 循環・未解決の検出は本節の deterministic 対象外化済み。残る並べ替え可能性判断をグラフ形態規則へ置換すると、辺数が同型でも実行順序制約の意味が異なる候補を誤る | 本単位の失敗観測なし。判定不能実測は暫定分類の行を参照 | グラフ形態規則による並列化判定（実装中・実行順序非依存性の意味をグラフ規則として追随する負担。同形態で正解が分かれる候補を誤る） |
