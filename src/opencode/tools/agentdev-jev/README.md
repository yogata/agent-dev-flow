# agentdev-jev（Custom Tool 本体）

Jev 先行評価 Custom Tool `agentdev_jev` の本体（REQ-{NNNN}、DEC-{NNN}）。Plugin（`src/opencode/plugins/agentdev-jev-tool/`）は登録の配線のみを担い、操作契約・正規化・失敗の構造化・観測の形式検証は本 Tool が所有する。

判断対象の意味、評価基準、Jev を呼ぶべき箇所、LLM 最終判断は Workflow / Capability Skill が所有し、本 Tool は所有しない（機械処理のみ）。

## 操作カタログ

| operation | 内容 |
|---|---|
| `evaluate` | 閉じた判断入力への Jev 先行評価。質問ごとの結果・候別別確率分布・正規化済み confidence・inputTokens（provider が返す場合）・機械的処理時間を返す。失敗は構造化失敗（not_configured、timeout、rate_limited、server_error、network_error、response_invalid）。自動 retry なし。評価完了（not_configured を含む）時点で Jev 側観測項目を含む部分レコード（`recordState: "partial"`）を `.agentdev/jev-observations/` へ書込み、書込み失敗は評価結果と独立した warning として返す（REQ-090-013）。呼出し元は `observationMetadata`（workflow、judgmentKind、subject、sourceRevision、observationId 等）で run 級 field を提供でき、同一 run の複数 evaluate で同一 observationId を渡すと同一 JSON 内 judgments へ追記する（1実行 1 JSON 維持） |
| `observation_write` | 観測 JSON（1 Workflow 実行 = 1 JSON）の形式検証と `.agentdev/jev-observations/` への原子的書込み（一時ファイル + rename）。JSONL は生成しない。`observationId` 付きは追記完成 mode で、evaluate 時点部分レコードの同一 JSON へ LLM 最終判断関連 field（llmFinalJudgment、llmTreatment）を judgmentId 単位で追記し、完了状態 field（recordState）を complete へ更新する（冪等・重複 JSON なし）。`observationId` なしは完成観測の新規書込み（後方互換経路）。recordState partial の直接書込みは拒否する |

## 2段階書込み（REQ-090-013）

evaluate は評価完了（not_configured を含む）時点で、機械判別可能な完了状態 field（`recordState: "partial"`）と Jev 側観測項目（質問ごとの結果・確率分布・confidence・失敗分類）を含む部分レコードを作成・永続化する。evaluate 成功から observation_write 到達前の委譲境界死亡でも部分レコードが残存する。observation_write は同一 JSON へ LLM 最終判断関連 field を追記して完成させる（追記完成 mode）。消費者（Issue B 評価）は recordState で部分/完全を機械判別し、不完全レコードを完全な観測と誤認しない。観測の永続化は evaluate の時点書込みと observation_write の完成書込みのみが行う。evaluate 内部の書込み失敗は評価結果の返却と独立した warning である。

## 公開契約

- 操作契約の正は Custom Tool 操作契約 Design「Jev 先行評価」節（extension 経由で解決）
- 公開契約は provider・SDK 非依存。provider 接続と評価 SDK 固有の名称・型・格納位置（provider 固有の confidence 格納位置を含む）は adapter パッケージ（`adapter-vercel/`）が内部吸収し、公開スキーマと Workflow 層へ漏らさない
- 質問型（独立命題・排他候補・順序水準）と boolean/choice/score の対応づけは adapter mapping
- 観測書込みの形式検証は REQ-{NNNN}-{NNN} の必須観測項目を検証し、schema 外の field（閾値依存の分類結果等）を拒否する。confidence と llm_treatment は独立した一次観測値として保存する
- 再構成可能な判断入力は全文保存せず、評価リクエストの digest（sha256）と参照で保持する。再構成不能な入力のみ最小 snapshot を許容する

## provider 動的解決

provider 実装は `adapter-vercel/` パッケージを動的に解決する（配布依存境界: 評価 SDK 依存は adapter パッケージに閉じる）。adapter が配布物に存在しない環境では `not_configured` として構造化失敗を返し、呼出し元 Workflow は従来 LLM 経路のみで継続できる。

## テスト実行

```bash
bun test        # cwd: src/opencode/tools/agentdev-jev
```
