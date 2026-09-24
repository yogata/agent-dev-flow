# agentdev-jev-tool（Plugin / Custom Tool 登録）

Custom Tool `agentdev_jev` を OpenCode の実行時へ登録する ADF 汎用 Plugin（REQ-{NNNN}、REQ-{NNN}、DEC-{NNN}）。

Jev 先行評価は最終判断者ではなく、後段の LLM 推論への追加情報として扱う（Stage 1: 観測可能化）。Plugin は登録の配線のみを担い、操作契約・正規化・失敗の構造化・観測の形式検証は Tool 本体（`src/opencode/tools/agentdev-jev/`）が所有する。判断対象の意味、評価基準、Jev を呼ぶべき箇所、LLM 最終判断は Workflow / Capability Skill が所有する（REQ-{NNNN}-{NNN}）。

## 操作カタログ

| operation | 内容 |
|---|---|
| `evaluate` | 閉じた判断入力への Jev 先行評価。質問ごとの結果・候別別確率分布・正規化済み confidence・inputTokens（provider が返す場合）・機械的処理時間を返す。失敗は構造化失敗（not_configured、timeout、rate_limited、server_error、network_error、response_invalid）。自動 retry なし。評価完了（not_configured を含む）時点で部分レコード（recordState partial）を `.agentdev/jev-observations/` へ書込み、書込み失敗は評価結果と独立した warning（REQ-090-013） |
| `observation_write` | 観測 JSON（1 Workflow 実行 = 1 JSON）の形式検証と `.agentdev/jev-observations/` への書込み（REQ-{NNNN}-{NNN}）。observationId 付きは evaluate 時点部分レコードの同一 JSON への追記完成 mode（冪等・重複 JSON なし） |

## 2段階書込み（REQ-090-013）

evaluate は評価完了（not_configured を含む）時点で、機械判別可能な完了状態 field（`recordState: "partial"`）と Jev 側観測項目を含む部分レコードを永続化し、observation_write は同一 JSON へ LLM 最終判断関連 field（llmFinalJudgment、llmTreatment）を追記して完成させる。消費者は recordState で部分/完全を機械判別する。

## 公開契約

操作契約の正は Custom Tool 操作契約 Design「Jev 先行評価」節（extension 経由で解決）。公開契約は provider・SDK 非依存であり、provider 接続（初期 Vercel adapter）と評価 SDK の名称・型・格納位置は adapter パッケージ（`src/opencode/tools/agentdev-jev/adapter-vercel/`）内部に隠蔽される（配布依存境界: REQ-{NNN}・DEC-{NNN} 決定2）。

- 利用可否: `AI_GATEWAY_API_KEY` 環境変数の設定有無で決まる（feature flag・opt-in 手続きは不要）
- 未設定時: API を呼び出さず `not_configured` を返す（Jev API 失敗に含めない）。呼出し元 Workflow は従来 LLM 経路のみで完了させる
- API 障害時: 自動 retry せず構造化失敗を返す。呼出し元 Workflow は即座に従来 LLM 経路へ fallback する
- 観測書込み失敗時: Workflow の成否と独立（完了報告で識別可能な warning として扱うのは呼出し元の責務）。evaluate 内部の部分レコード書込み失敗は評価結果の返却と独立した warning とし、評価結果を失わない（REQ-090-013）
- 評価言語: 日本語（state、instructions、criteria、判断の意味）
- 責務境界: Tool は機械処理のみ。判断の意味・基準・Jev 呼出し位置・最終判断は所有しない（REQ-{NNNN}-{NNN}）

## 仕組み

OpenCode は `.opencode/plugins/` 直下のファイル（depth-1）のみを自動読み込みする。本パッケージはディレクトリ型のため、インストーラ（`scripts/install.ps1` 等）が junction 作成に加えて、同ディレクトリ直下へローダーシム `<パッケージ名>.ts`（`plugin.ts` の default を再エクスポートする1行）を生成する。シム経由で本 Plugin が読み込まれ、custom tool `agentdev_jev` が登録される。

provider 実装は Tool 本体が動的解決する（`adapter-vercel/` パッケージが配布物に存在しない環境では `not_configured` として構造化失敗を返し、配布依存境界を維持する）。

## テスト実行

```bash
bun test        # cwd: src/opencode/plugins/agentdev-jev-tool
```
