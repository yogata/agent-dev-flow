# STEP-4 / STEP-5: 自動 promote・adversarial-review（auto-promote-and-review）

> 本 reference は `agentdev-workflow-inspect-promote` SKILL.md の制御平面（STEP 一覧）STEP-4、STEP-5 詳細である。
> 各 STEP は resume point を持つ（`<foundations/v4-durable-state-and-recovery>` Design）。

## STEP-4: 自動 promote（`--auto` opt-in 時のみ）

- **Purpose**: 機械的に特定可能で移行先が一意に定まる高確信度検出事項を、HITL を経ずに intake/promoted/ へ自動投入する（fast path）
- **Input Resolution**: STEP-3 の暫定分類結果。自動 promote 対象カテゴリ、安定契約例外、否定文脈の判定基準は v4-responsibility-boundaries Design（extension 経由で解決）を正とする
- **Preconditions**: `--auto` が明示指定されていること、STEP-3 完了
- **Procedure**: 分類結果のうち v4-responsibility-boundaries Design（extension 経由）の自動 promote 対象カテゴリに合致し、かつ安定契約例外および否定文脈を満たさない高確信度検出事項を `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md` へ投入する。各投入を `.agentdev/inspect/promoted/auto-promote-log.md` に追記する（対象検出事項、カテゴリ、投入先ファイル、根拠）。`--auto` 未指定時は本 STEP をスキップし、自動投入を行わない
- **Result**: 自動投入済み検出事項、auto-promote-log 記録
- **Evidence**: `.agentdev/intake/promoted/inspect-auto-*.md` ファイルと auto-promote-log の追記エントリ
- **Completion Verification**: 自動投入対象が全て投入済みで、各投入がログに記録済みであること
- **Resume-Idempotency**: auto-promote-log 記載済みかつ投入先ファイルが存在する検出事項は自動 promote 確定として再投入しない。再開時はログと投入先ファイルの突合により未投入分のみを処理する

## STEP-5: adversarial-review

- **Purpose**: 暫定分類結果を adversarial-review による対論的審議へかけ、分類の妥当性を高める
- **Input Resolution**: 手動分類対象の検出事項とその暫定分類結果（promote/defer/reject 判定と根拠）を入力コンテキストとする
- **Preconditions**: review 挿入境界（暫定分類後・HITL 前）への到達。発動条件は後述の判定に従う
- **Procedure**:
  1. **発動条件判定**: inspect-promote は adversarial-review を原則実行する（default-on）。
手動分類対象の検出事項（review 対象）が1件以上存在する場合に発動する。
ユーザー明示指定は通常発動の必須条件ではない
  2. **skip 条件**: `--auto` 経路（fast path）、または手動分類対象の検出事項が0件（inbox 空、全件 fast path 完了）の場合、省略して従来フロー（STEP-6 確定）を継続できる。skip 判断のためだけの新規 HITL、承認点は追加しない
  3. **ユーザー明示指定時の必須実行**: ユーザーが本コマンド起動時に adversarial-review を明示的に要求した場合、skip 条件の該当にかかわらず必ず発動する。ただし review 対象（手動分類対象）が存在しない場合は発動しない
  4. **review 呼出**: 手動分類対象の検出事項と暫定分類結果を入力コンテキストとして adversarial-review を呼び出す。
adversarial-review は任意助言手段であり、必須工程、QG、承認ゲート、統制ゲートとして導入しない。
共通契約（入力コンテキスト、返却契約、呼出失敗時取扱い、再 review 条件、停止条件4点）は adversarial-review Design を正とし、本 STEP は再定義しない
  5. **結果反映**: accepted finding を暫定分類結果へ反映する。反映で暫定分類の意味内容が変更された場合、STEP-3（検出事項分類）へ戻し再分類する
- **Result**: review 結果反映済みの暫定分類、または unresolved 停止、または従来フロー継続
- **Evidence**: review 呼出の実行記録、accepted finding の反映記録
- **Completion Verification**: accepted finding の反映が完了していること、または unresolved 判定時に停止していること、または skip 条件該当時に従来フローへ遷移していること
- **Resume-Idempotency**: `--auto` により STEP-4 で自動 promote された検出事項は HITL を経由しない fast path であり、本判定、本 review の対象外とする（review 挿入迂回）。skip 条件該当時、呼出失敗時は review を実行せず従来フロー（STEP-6 確定）を維持する。unresolved な本質的争点が残る場合、STEP-6 へ進まずユーザー判断事項として停止する（adversarial-review 自体を恒久的な統制ゲートとしない）。呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローを維持する

## 関連 STEP

- 前: STEP-3（inbox-scan-and-classification）
- 次: STEP-6（hitl-and-disposition）

## 関連 Capability Skill

- `agentdev-adversarial-review`: inspect-promote の review 呼出（共通契約の正規所有者）
- `agentdev-project-extensions`: v4-responsibility-boundaries Design の extension 経由解決

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- ガードレール（ユーザーの明示的な承認なしに採用済み成果物を生成しない。`--auto` による自動 promote 対象を除く、`POL-promoted-artifact-requires-approval`）
- ガードレール（`--auto` は明示 opt-in の場合のみ有効。省略時は自動 promote を一切行わない）
- 不変条件（`--auto` 実行の都度、投入対象、根拠を `.agentdev/inspect/promoted/auto-promote-log.md` に記録する。誤検知 revoke 手順は同 Design 参照）

## Jev 先行評価の逐次経路（REQ-{NNNN}、DEC-{NNN}）

閉じた意味判断ごとに、次の逐次経路を実行できる。Jev は最終判断者ではなく、後段の LLM 推論への追加情報として扱う（Stage 1: 観測可能化）。

1. **Jev 先行評価**: Custom Tool `agentdev_jev` の `evaluate` に、本 Workflow が構成した閉じた判断入力（state、指示、基準、質問群。日本語。repository 全文を渡さない）を渡す
2. **LLM 推論**: Jev 結果と confidence を情報として含み、従来の判断材料（検出事項本文、検出観点、分類基準、target 対象の文書種別）も参照して推論する。Jev 結果だけで判断しない
3. **LLM 最終判断**: 従来経路と同一の判断基準で最終判断を確定する。Jev 結果・confidence は最終判断を確定させない
4. **unchanged/corrected 記録**: Jev 結果に対して LLM が判断を変更しなかったか（unchanged）/変更したか（corrected）を観測事実として記録する。評価カテゴリを混入させない

共通契約:

- 利用可否は `AI_GATEWAY_API_KEY` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は呼び出さず `not_configured` を観測に記録し、従来 LLM 経路のみで本 Workflow を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動 retry せず即座に従来 LLM 経路へ fallback し、失敗分類を観測に記録する。正規状態を破損しない
- 観測は 1 Workflow 実行 = 1 JSON で `.agentdev/jev-observations/` に保存する（`agentdev_jev` の `observation_write`）。判断単位の confidence と llm_treatment は独立した一次観測値とし、閾値依存の分類結果を含めない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

適用位置: STEP-3（inbox-scan-and-classification）の promote/defer/reject 分類、STEP-5 の発動条件判定に適用する。STEP-4（自動 promote、fast path）の検出と投入は決定的な対象カテゴリ適合であり、適用対象外とする。

初期割当て（適用対象19件のうち本 Workflow が所有する2件）:

| 判断単位 | 質問形式 |
|---|---|
| 検出事項分類（promote/ defer/ reject） | choice（promote・defer・reject） |
| adversarial-review 発動条件判定 | boolean（発動/ skip。skip 条件該当の有無） |

choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）:

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正（最近似候補への高確率張り付きと LLM 是正の組合せ）は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。unchanged/corrected 記録時に候補構造欠落由来と判明した是正は、判断器精度評価の集計から除外する

適用可否を本 Case 内で確定した判断（REQ-{NNNN}-{NNN}）:

- **自動 promote 対象判定（STEP-4 の高確信度検出事項判定）: Jev を適用しない。**
  理由: 自動 promote は HITL を経由しない fast path であり、対象判定は v4-responsibility-boundaries Design の自動 promote 対象カテゴリへの決定的適合（安定契約例外・否定文脈の確認を含む）を契約とする。Jev の confidence を高確信度判定へ用いることは、決定的カテゴリ適合という現行の判定原理を確率的判断へ置換する変更（confidence 閾値に基づく判断への接続）に繋がり、Stage 1（観測可能化、Issue C の置換は対象外）の範囲を超える。本判定は Stage 1 では現行の決定的基準のみで維持する。将来の適用は観測結果（Issue B）と別 Decision を前提に再評価する。

