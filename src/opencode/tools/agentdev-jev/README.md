# agentdev-jev（Custom Tool 本体）

Jev 先行評価 Custom Tool `agentdev_jev` の本体（REQ-{NNNN}、DEC-{NNN}）。Plugin（`src/opencode/plugins/agentdev-jev-tool/`）は登録の配線のみを担い、操作契約・正規化・失敗の構造化・観測の形式検証は本 Tool が所有する。

判断対象の意味、評価基準、Jev を呼ぶべき箇所、reasoning model による最終判断は Workflow / Capability Skill が所有し、本 Tool は所有しない（機械処理のみ）。

## 操作カタログ

| operation | 内容 |
|---|---|
| `evaluate` | 閉じた判断入力への Jev 先行評価。質問ごとの結果・候別別確率分布・provider が返した confidence（evaluation 単位。返さない場合は返さない）・inputTokens（provider が返す場合）・機械的処理時間を返す。失敗は構造化失敗（not_configured、timeout、rate_limited、server_error、network_error、response_invalid）。自動 retry なし。evaluator 成功後・呼出元 Workflow が reasoning model へ進む前に、当該評価の観測（1 semantic evaluation = 1 observation、1 JSON）を `.agentdev/jev-observations/` へ永続化し、実際の呼出し開始後の失敗は失敗観測を永続化する。未設定（not_configured）と評価入力の事前検証失敗では観測を生成しない。永続化失敗は評価結果と独立した warning（fail-open） |
| `observation_write` | evaluator 成功観測（`observationId` で特定）の同一 JSON へ reasoning model の最終判断結果（final result）を追記する。追記入力は最終判断結果のみ（schemaVersion と finalResult）を受け付け、evaluator 返却結果との1対1対応と差異条件を検証する。evaluator 返却結果と最終判断が異なる場合のみ差異理由分類（evaluation_input_defect / semantic_disagreement / deterministic_override / unknown）を保持する。追記は冪等で重複 JSON を生成しない。失敗観測・存在しない観測 ID・現行契約外の観測（履歴観測を含む）への追記は拒否する |

## 観測の永続化と最終判断の反映

evaluate は evaluator 成功後の時点で、evaluator 返却結果・候補別確率分布・provider 返却 confidence・入力再構成情報・呼出し時間・input token 数（provider 返却時のみ）を含む観測を 1 semantic evaluation = 1 observation（1 JSON）として永続化する。永続化成功後の中断でも当該評価の観測は失われない。observation_write は reasoning model による最終判断の確定後、evaluator 成功観測の同一 JSON へ最終判断結果と差異理由分類（差異時のみ）を追記する。観測は append-only の一次事実であり、Workflow 再開・再実行による同一判断の再観測を排除・統合しない。永続化の失敗は評価結果の返却と独立した warning であり、rollback・再実行・擬似再生成を行わない。

観測の schemaVersion は 2。既存の旧形式観測（schemaVersion 1）は履歴として保持され、migration・変換・読み取り互換を要求せず、本 Tool は現行契約の観測として受理しない。

## 公開契約

- 操作契約の正は Custom Tool 操作契約 Design「Jev 先行評価」節（extension 経由で解決）
- 公開契約は provider・SDK 非依存。provider 接続と評価 SDK 固有の名称・型・格納位置（provider 固有の confidence 格納位置を含む）は adapter パッケージ（`adapter-vercel/`）が内部吸収し、公開スキーマと Workflow 層へ漏らさない
- 質問型（独立命題・排他候補・順序水準）と boolean/choice/score の対応づけは adapter mapping
- canonical result は provider 固有表現に依存せず、boolean は真偽、choice は候補、score は scale level として正規化する。評価入力の各質問と各結果は questionId で1対1対応し、各質問の結果と候補別確率分布の双方を保持する
- confidence は provider が実際に返した場合のみ evaluation 単位で保存する。質問単位への複製、確率分布からの代替 confidence の生成・永続化は行わない
- 観測書込みの形式検証は必須一次事実を検証し、schema 外の field（閾値依存の分類結果等）を拒否する
- 再構成可能な判断入力は全文保存せず、評価リクエストの digest（sha256）と参照で保持する。再構成不能な入力のみ最小 snapshot を許容する。provider・model 構成値は source revision から導出可能なため観測ごとの必須保存とせず、非導出の identity 差異（provider が解決した model ID 等）を実行時観測した場合のみ保持する
- 失敗観測は実際の evaluator 呼出し開始後の失敗のみを対象とし、失敗分類（timeout、429、5xx、network error、response validation error の5分類）と最小 diagnostic、実評価の呼出し時間を保持する

## provider 動的解決

provider 実装は `adapter-vercel/` パッケージを動的に解決する（配布依存境界: 評価 SDK 依存は adapter パッケージに閉じる）。adapter が配布物に存在しない環境では `not_configured` として構造化失敗を返し、呼出し元 Workflow は従来 LLM 経路のみで継続できる。

## テスト実行

```bash
bun test ./tests/   # cwd: repo root（REQ-{NNN}）
```
