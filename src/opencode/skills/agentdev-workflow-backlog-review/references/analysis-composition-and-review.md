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
ユーザー明示指定時は skip 条件の該当にかかわらず必ず発動する
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

- 利用可否は `AI_GATEWAY_API_KEY` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は API を呼び出さず構造化失敗（not_configured）を返し、観測を生成せず従来 LLM 経路のみで本 Workflow を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動 retry せず即座に従来 LLM 経路へ fallback し、失敗観測に失敗分類と最小 diagnostic が記録される。正規状態を破損しない
- 観測は 1 semantic evaluation = 1 observation（1 JSON）で `.agentdev/jev-observations/` に保存する。confidence は evaluation 単位の一次事実であり、provider が返した場合のみ保存する。質問単位への複製・確率分布からの代替生成を行わない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
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

