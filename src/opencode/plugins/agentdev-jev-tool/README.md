# agentdev-jev-tool（Plugin / Custom Tool 登録）

Custom Tool `agentdev_jev` を OpenCode の実行時へ登録する ADF 汎用 Plugin（REQ-{NNNN}、REQ-{NNN}、DEC-{NNN}）。

Jev 先行評価は最終判断者ではなく、後段の reasoning model 推論への追加情報として扱う（Stage 1: 観測可能化）。Plugin は登録の配線のみを担い、操作契約・正規化・失敗の構造化・観測の形式検証は Tool 本体（`src/opencode/tools/agentdev-jev/`）が所有する。判断対象の意味、評価基準、Jev を呼ぶべき箇所、最終判断は Workflow / Capability Skill が所有する（REQ-{NNNN}-{NNN}）。

## 操作カタログ

| operation | 内容 |
|---|---|
| `evaluate` | 閉じた判断入力への Jev 先行評価。質問ごとの結果・候別別確率分布・provider が返した confidence（evaluation 単位。返さない場合は返さない）・inputTokens（provider が返す場合）・機械的処理時間を返す。失敗は構造化失敗（not_configured、timeout、rate_limited、server_error、network_error、response_invalid）。自動 retry なし。evaluator 成功後・呼出元 Workflow が reasoning model へ進む前に、当該評価の観測（1 semantic evaluation = 1 observation、1 JSON）を `.agentdev/jev-observations/` へ永続化し、実際の呼出し開始後の失敗は失敗観測を永続化する。未設定と評価入力の事前検証失敗では観測を生成しない。永続化失敗は評価結果と独立した warning（fail-open） |
| `observation_write` | evaluator 成功観測（`observationId` で特定）の同一 JSON へ reasoning model の最終判断結果（final result）を追記する（冪等・重複 JSON なし）。追記入力は最終判断結果のみを受け付け、evaluator 返却結果と異なる場合のみ差異理由分類を保持する。失敗観測・存在しない観測 ID・現行契約外の観測への追記は拒否する |

## 観測の永続化と最終判断の反映

evaluate は evaluator 成功後の時点で観測（1 semantic evaluation = 1 observation）を永続化し、observation_write は reasoning model による最終判断の確定後、evaluator 成功観測の同一 JSON へ最終判断結果を追記する。evaluator 返却結果と最終判断が異なる場合のみ、差異理由分類（evaluation_input_defect / semantic_disagreement / deterministic_override / unknown）が記録される。観測の schemaVersion は 2 であり、旧形式観測（schemaVersion 1）は履歴として保持される（migration・読み取り互換は要求しない）。

## 公開契約

操作契約の正は Custom Tool 操作契約 Design「Jev 先行評価」節（extension 経由で解決）。公開契約は provider・SDK 非依存であり、provider 接続（初期 Vercel adapter）と評価 SDK の名称・型・格納位置は adapter パッケージ（`src/opencode/tools/agentdev-jev/adapter-vercel/`）内部に隠蔽される（配布依存境界: REQ-{NNN}・DEC-{NNN} 決定2）。

- 利用可否: `AI_GATEWAY_API_KEY` 環境変数の設定有無で決まる（feature flag・opt-in 手続きは不要）
- 未設定時: API を呼び出さず構造化失敗（not_configured）を返し、観測を生成しない。呼出し元 Workflow は従来 LLM 経路のみで完了させる
- API 障害時: 自動 retry せず構造化失敗を返し、失敗観測に失敗分類と最小 diagnostic が記録される。呼出し元 Workflow は即座に従来 LLM 経路へ fallback する
- 観測書込み失敗時: Workflow の成否と独立（完了報告で識別可能な warning として扱うのは呼出し元の責務）。evaluate 内部の観測永続化失敗は評価結果の返却と独立した warning とし、評価結果を失わない（fail-open。rollback・再実行・擬似再生成なし）
- 評価言語: 日本語（state、instructions、criteria、判断の意味）
- 責務境界: Tool は機械処理のみ。判断の意味・基準・Jev 呼出し位置・最終判断は所有しない（REQ-{NNNN}-{NNN}）

## 仕組み

OpenCode は `.opencode/plugins/` 直下のファイル（depth-1）のみを自動読み込みする。本パッケージはディレクトリ型のため、インストーラ（`scripts/install.ps1` 等）が junction 作成に加えて、同ディレクトリ直下へローダーシム `<パッケージ名>.ts`（`plugin.ts` の default を再エクスポートする1行）を生成する。シム経由で本 Plugin が読み込まれ、custom tool `agentdev_jev` が登録される。

provider 実装は Tool 本体が動的解決する（`adapter-vercel/` パッケージが配布物に存在しない環境では not_configured として構造化失敗を返し、配布依存境界を維持する）。

## テスト実行

```bash
bun test ./tests/   # cwd: repo root（REQ-{NNN}）
```
