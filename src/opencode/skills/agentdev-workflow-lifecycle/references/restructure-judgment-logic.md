# Restructure Judgment Logic

<!-- 元コマンド: req-restructure-review.md -->
<!-- 抽出日: 2026-06-07 -->

req-restructure-review コマンドの Steps 2〜7 における診断ロジック（REQ参照ID整合性・第一参照導線・active/retired境界・6観点診断・未処理artifact確認・診断結果出力スキーマ）を定義する。

## Step 2: REQ参照ID整合性確認

各 REQ ファイルについて以下を確認する:

- **(a) frontmatter `id` 一意性**: active/retired を通じて `id` の重複がないか
- **(b) frontmatter `id` ↔ ファイル名**: ファイル名 `REQ-{NNNN}.md` の `{NNNN}` と frontmatter の `id` 値が一致するか
- **(c) 相互参照の存在確認**: REQ本文・ADR・specs で参照されている REQ ID が実在するか

## Step 3: 第一参照導線確認

REQ体系の第一参照導線を確認する:

- **(a) DOC-MAP 導線**: `docs/DOC-MAP.md` から active REQ への導線が正しいか
- **(b) README 導線**: `README.md` のワークフロー入口テーブルが現行コマンドと一致するか
- **(c) requirements/README.md 導線**: REQ インデックスが active/retired の実体と一致するか

## Step 4: active/retired/世代境界確認

REQ の active/retired/世代境界の整合性を確認する:

- **(a) retired にのみ存在する ID**: mapping-table に記録されているか
- **(b) active/retired の二重存在**: 同一 ID が両方に存在していないか
- **(c) 100s番台境界**: 世代変更（例: 0100番台→0200番台）が基準に従っているか

## Step 5: 6観点診断

収集した artifact を以下の6観点で診断する:

| 観点 | 診断内容 | 検出シグナル |
|------|----------|-------------|
| **SPLIT** | 単一REQが複数の独立した関心事を含んでおり、分割が適切か | (a) 1つのREQに複数の関心対象、(b) 複数 artifact 種別の混在、(c) 複数 command family の混在、(d) 複数 lifecycle 段階の混在 |
| **MERGE** | 複数のREQが密接に関連しており、統合が適切か | (a) 複数REQが同じ目的、(b) 同じ対象 artifact、(c) 同じ command、(d) 同じ責務を扱っている |
| **MOVE** | REQの内容が別の文書種（specs/guides/ADR）に移動すべきか | (a) REQ行が変更後仕様ではなく反映作業そのものになっている |
| **DUPLICATE** | REQ間またはREQと他文書で内容が重複しているか | (a) active REQ 間または REQ と spec/guide/command の間で同じ 必達要件 相当の責務が重複 |
| **RETIRE** | active REQのうち、retire すべき（現行仕様として不要な）ものがないか | (a) active REQ が現行案内から参照されない、(b) 関心対象が既存 active REQ に吸収済み |
| **DRIFT** | REQ本文と実体（specs/実装/コマンド）の間に乖離がないか | (a) REQ が要求する対象と実体ファイルまたは command 定義が矛盾している |

### シグナル閾値

| シグナル数 | 扱い |
|-----------|------|
| 1シグナルのみ | 観察メモに留め、問題候補 finding としては出さない |
| 2シグナル以上 | 問題候補 finding として出す |
| 3シグナル以上、または active/retired 判断に影響 | 高優先度候補として出す |

## Step 6: 未処理artifact確認

未処理の intake/learning/RU が存在する場合、その存在と影響のみを報告する:

- **(a) intake inbox**: `.agentdev/intake/inbox/` に未処理 item が存在するか
- **(b) learning inbox**: `.agentdev/learning/inbox.md` に未処理 entry が存在するか
- **(c) promoted artifact**: `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` に未処理 artifact が存在するか
- **(d) RU**: `.agentdev/backlog/req-units/` に未処理 RU が存在するか

存在する場合は件数と診断への潜在的影響を提示する。処理は行わない。

## Step 7: 診断結果の出力

診断結果を以下の構成でユーザーに提示する:

1. **診断サマリ**: スキャン対象の件数、各観点の結果概要
2. **問題候補**: 各観点で検出された問題候補（REQ ID、観点、問題の概要）
3. **推奨アクション**: 問題に対する推奨対応（req-define での再壁打ち、retire、MERGE 等）
4. **req-define入力案**: 再構成が必要な場合、req-define で壁打ちすべき内容のドラフト（REQ ID 単位）

### 問題候補出力スキーマ

各問題候補は以下の7フィールドを含めること:

| フィールド | 内容 |
|-----------|------|
| 観点 | SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT のいずれか |
| 対象 | REQ ID または対象 artifact |
| 根拠 | 検出されたシグナルの具体的内容 |
| シグナル数 | 検出されたシグナル数（2以上で finding 化） |
| 確信度 | high / medium / low のいずれか |
| 推奨アクション | SPLIT / MERGE / MOVE / RETIRE / UPDATE / APPEND / no-action のいずれか |
| req-define入力案 | req-define での壁打ち内容のドラフト（不要な場合は「—」） |
