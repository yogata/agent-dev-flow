# REQ 構造レビュー

REQ 構造レビューの判定ロジック（REQ参照ID整合性・第一参照導線・現行/廃止/世代境界・6観点診断・未処理成果物確認・診断結果出力スキーマ）を定義する。各判定は検査対象を直接修正しない診断であり、ファイル変更や成果物処理は行わない。

## REQ参照ID整合性確認

各 REQ ファイルについて以下を確認する:

- **(a) frontmatter `id` 一意性**: 現行/廃止を通じて `id` の重複がないか
- **(b) frontmatter `id` ↔ ファイル名**: ファイル名 `REQ-{NNNN}.md` の `{NNNN}` と frontmatter の `id` 値が一致するか
- **(c) 相互参照の存在確認**: REQ本文・ADR・specs で参照されている REQ ID が実在するか

## 第一参照導線確認

REQ体系の第一参照導線を確認する:

- **(a) DOC-MAP 導線**: `docs/DOC-MAP.md` から現行 REQ への導線が正しいか
- **(b) README 導線**: `README.md` のワークフロー入口テーブルが現行コマンドと一致するか
- **(c) requirements/README.md 導線**: REQ インデックスが現行/廃止の実体と一致するか

## 現行/廃止/世代境界確認

REQ の現行/廃止/世代境界の整合性を確認する:

- **(a) 廃止側にのみ存在する ID**: mapping-table に記録されているか
- **(b) 現行/廃止の二重存在**: 同一 ID が両方に存在していないか
- **(c) 100s番台境界**: 世代変更（例: 0100番台→0200番台）が基準に従っているか

## 6観点診断

収集した成果物を以下の6観点で診断する:

| 観点 | 診断内容 | 検出シグナル |
|------|----------|-------------|
| **SPLIT** | 単一REQが複数の独立した関心事を含んでおり、分割が適切か | (a) 1つのREQに複数の関心対象、(b) 複数成果物種別の混在、(c) 複数 command family の混在、(d) 複数 lifecycle 段階の混在 |
| **MERGE** | 複数のREQが密接に関連しており、統合が適切か | (a) 複数REQが同じ目的、(b) 同じ対象成果物、(c) 同じ command、(d) 同じ責務を扱っている |
| **MOVE** | REQの内容が別の文書種（specs/guides/ADR）に移動すべきか | (a) REQ行が変更後仕様ではなく反映作業そのものになっている、(b) SPEC分離基準違反シグナルが REQ 要件行に残留している |
| **DUPLICATE** | REQ間またはREQと他文書で内容が重複しているか | (a) 現行 REQ 間または REQ と spec/guide/command の間で同じ 必達要件 相当の責務が重複 |
| **RETIRE** | 現行 REQのうち、廃止すべき（現行仕様として不要な）ものがないか | (a) 現行 REQ が現行案内から参照されない、(b) 関心対象が既存 現行 REQ に吸収済み |
| **DRIFT** | REQ本文と実体（specs/実装/コマンド）の間に乖離がないか | (a) REQ が要求する対象と実体ファイルまたは command 定義が矛盾している |

### シグナル閾値

| シグナル数 | 扱い |
|-----------|------|
| 1シグナルのみ | 観察メモに留め、問題候補検出事項としては出さない |
| 2シグナル以上 | 問題候補検出事項として出す |
| 3シグナル以上、または 現行/廃止 判断に影響 | 高優先度候補として出す |

要件行数・関心分類数・成果物種別数の定量閾値と SPLIT シグナル加算ルールは `docs/specs/req-health-metrics.md`に定義する。本観点の SPLIT シグナル計算は同 SPEC の閾値を参照する。

SPEC分離基準違反シグナルは high-specificity signal として扱う。現行 REQ の要件行で以下のいずれかが主たる文意になっている場合、1シグナルでも MOVE 検出事項候補として出す。安定契約例外（公開 command 名、ドメイン状態の位置づけ、接続契約、安全境界、停止条件の大枠等）に該当する可能性がある場合は、確信度を medium/low に下げ、根拠に例外候補を明記する。

## SPEC分離基準違反検出

`docs/specs/document-model.md` の SPEC Separation Criteria に基づき、現行 REQ の要件テーブル行を対象に、HOW 詳細または内部パラメータが要件行の主たる文意になっていないかを検出する。検出時の観点は `MOVE`、推奨アクションは `MOVE` または `UPDATE` とする。

### 検出シグナル

| シグナル | 検出対象 | 例 |
|----------|----------|----|
| schema field残留 | report/schema field 名の列挙または field 定義が要件行を占有している | `level/category/route/file/line/evidence`, `field`, `schema` |
| enum値一覧残留 | enum 値の一覧そのものが要件内容になっている | `promote/defer/reject`, `accepted/superseded/deprecated`, `strict/heuristic/observation` |
| route判定表残留 | route/category/status の詳細判定表または分岐表が要件行に入っている | `route 判定`, `category 判定`, `status 判定`, `分類表`, `判定表` |
| file pattern残留 | 具体的な glob/path pattern が要件行の主内容になっている | `docs/requirements/REQ-*.md`, `*.md`, `src/opencode/**/*.md` |
| template variant残留 | テンプレート種別の選択ロジックまたは種別名一覧が要件行を占有している | `standard/compact`, `variant`, `テンプレート種別`, `選択ロジック` |
| report format残留 | report 出力形式、列、セクション、ファイル名形式の詳細が要件行を占有している | `report format`, `出力形式`, `7フィールド`, `列構成`, `finding-{timestamp}.md` |
| 内部アルゴリズム残留 | 検査・抽出・検証の内部手順やアルゴリズムが要件行を占有している | `抽出手順`, `検証手順`, `照合順`, `スコアリング`, `正規表現で検出` |
| 作業履歴残留 | PR/commit/rename/retire/migration 等の作業記録が要件行を占有している | `PR #123`, `commit abc1234`, `renamed`, `retired history`, `移行履歴` |
| 実装パラメータ残留 | retry/token/line/step/phase 等の実装上限や内部実行値が要件行を占有している | `retry 3回`, `token 目安`, `行数上限`, `Step 5`, `Phase 2` |

### 判定ルール

- 現行 REQ の要件テーブル行を優先して確認する。目的・適用範囲に同種の HOW 詳細があり、要件行の解釈に影響する場合は補助根拠として扱う。
- 単語の出現だけではなく、当該行の主たる文意が SPEC・rule catalog・command reference・skill reference・test docs に置くべき詳細かを判定する。
- 要件行が外部契約を要約し、詳細値だけを例示している場合は安定契約例外候補として扱い、即時 high 検出事項にしない。
- 同一 REQ 内で複数種の SPEC分離基準違反シグナルが出た場合、根拠をまとめて1件の MOVE 検出事項候補として出す。

## 未処理成果物の確認

未処理の intake/learning/RU が存在する場合、その存在と影響のみを報告する:

- **(a) intake inbox**: `.agentdev/intake/inbox/` に未処理 item が存在するか
- **(b) learning inbox**: `.agentdev/learning/inbox.md` に未処理 entry が存在するか
- **(c) 採用済み成果物**: `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` に未処理成果物が存在するか
- **(d) RU**: `.agentdev/backlog/req-units/` に未処理 RU が存在するか

存在する場合は件数と診断への潜在的影響を提示する。処理は行わない。

## 診断結果の出力

診断結果を以下の構成でユーザーに提示する:

1. **診断サマリ**: スキャン対象の件数、各観点の結果概要
2. **問題候補**: 各観点で検出された問題候補（REQ ID、観点、問題の概要）
3. **推奨アクション**: 問題に対する推奨対応（req-define での再壁打ち、廃止、MERGE 等）
4. **req-define入力案**: 再構成が必要な場合、req-define で壁打ちすべき内容のドラフト（REQ ID 単位）

### 問題候補出力スキーマ

各問題候補は以下の7フィールドを含めること:

| フィールド | 内容 |
|-----------|------|
| 観点 | SPLIT/ MERGE/ MOVE/ DUPLICATE/ RETIRE/ DRIFT のいずれか |
| 対象 | REQ ID または対象成果物 |
| 根拠 | 検出されたシグナルの具体的内容 |
| シグナル数 | 検出されたシグナル数（通常は2以上で検出事項化、SPEC分離基準違反の high-specificity signal は1以上で検出事項候補化） |
| 確信度 | high/ medium/ low のいずれか |
| 推奨アクション | SPLIT/ MERGE/ MOVE/ RETIRE/ UPDATE/ APPEND/ no-action のいずれか |
| req-define入力案 | req-define での壁打ち内容のドラフト（不要な場合は「—」） |


