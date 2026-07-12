# REQ 構造レビュー

REQ 構造レビューの判定ロジック（REQ参照ID整合性、第一参照導線、現行/廃止/世代境界、6観点診断、未処理成果物確認、診断結果出力スキーマ）を定義する。
各判定は検査対象を直接修正しない診断であり、ファイル変更や成果物処理は行わない。

## REQ参照ID整合性確認

各 REQ ファイルについて以下を確認する:

- **(a) frontmatter `id` 一意性**: 現行/廃止を通じて `id` の重複がないか
- **(b) frontmatter `id` ↔ ファイル名**: ファイル名 `REQ-{NNNN}.md` の `{NNNN}` と frontmatter の `id` 値が一致するか
- **(c) 相互参照の存在確認**: REQ本文、ADR、specs で参照されている REQ ID が実在するか

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

要件行数、関心分類数、成果物種別数の定量閾値と SPLIT シグナル加算ルールは req-health-metrics SPECに定義する。
本観点の SPLIT シグナル計算は同 SPEC の閾値を参照する。

SPEC分離基準違反シグナルは high-specificity signal として扱う。
現行 REQ の要件行で以下のいずれかが主たる文意になっている場合、1シグナルでも MOVE 検出事項候補として出す。
安定契約例外（公開 command 名、ドメイン状態の位置づけ、接続契約、安全境界、停止条件の大枠等）に該当する可能性がある場合は、確信度を medium/low に下げ、根拠に例外候補を明記する。

## SPEC分離基準違反検出

document-model SPEC の SPEC Separation Criteria に基づき、現行 REQ の要件テーブル行を対象に、HOW 詳細または内部パラメータが要件行の主たる文意になっていないかを検出する。
検出時の観点は `MOVE`、推奨アクションは `MOVE` または `UPDATE` とする。

### 検出シグナル

| シグナル | 検出対象 | 例 |
|----------|----------|----|
| schema field残留 | report/schema field 名の列挙または field 定義が要件行を占有している | `level/category/route/file/line/evidence`, `field`, `schema` |
| enum値一覧残留 | enum 値の一覧そのものが要件内容になっている | `promote/defer/reject`, `accepted/superseded/deprecated`, `strict/heuristic/observation` |
| route判定表残留 | route/category/status の詳細判定表または分岐表が要件行に入っている | `route 判定`, `category 判定`, `status 判定`, `分類表`, `判定表` |
| file pattern残留 | 具体的な glob/path pattern が要件行の主内容になっている | `docs/requirements/REQ-*.md`, `*.md`, `src/opencode/**/*.md` |
| template variant残留 | テンプレート種別の選択ロジックまたは種別名一覧が要件行を占有している | `standard/compact`, `variant`, `テンプレート種別`, `選択ロジック` |
| report format残留 | report 出力形式、列、セクション、ファイル名形式の詳細が要件行を占有している | `report format`, `出力形式`, `7フィールド`, `列構成`, `finding-{timestamp}.md` |
| 内部アルゴリズム残留 | 検査、抽出、検証の内部手順やアルゴリズムが要件行を占有している | `抽出手順`, `検証手順`, `照合順`, `スコアリング`, `正規表現で検出` |
| 作業履歴残留 | PR/commit/rename/retire/migration 等の作業記録が要件行を占有している | `PR #123`, `commit abc1234`, `renamed`, `retired history`, `移行履歴` |
| 実装パラメータ残留 | retry/token/line/step/phase 等の実装上限や内部実行値が要件行を占有している | `retry 3回`, `token 目安`, `行数上限`, `Step 5`, `Phase 2` |

### 判定ルール

- 現行 REQ の要件テーブル行を優先して確認する。目的、適用範囲に同種の HOW 詳細があり、要件行の解釈に影響する場合は補助根拠として扱う。
- 単語の出現だけではなく、当該行の主たる文意が SPEC、rule catalog、command reference、skill reference、test docs に置くべき詳細かを判定する。
- 要件行が外部契約を要約し、詳細値だけを例示している場合は安定契約例外候補として扱い、即時 high 検出事項にしない。
- 同一 REQ 内で複数種の SPEC分離基準違反シグナルが出た場合、根拠をまとめて1件の MOVE 検出事項候補として出す。

## 配布物 ID 汚染検出

AgentDevFlow 内部 ID（`REQ-XXXX`/`ADR-XXXX`/`SPEC-{KIND}-{NNN}`/`IR-XX` 等）が配布物に残留していないかを検出する。
配布物（`src/opencode/commands/`、`src/opencode/skills/`）は AgentDevFlow 利用者が読む成果物であり、内部 ID はノイズとなるため記述しない（OU-009 原則）。

### 検査対象

| 対象 | 理由 |
|------|------|
| `src/opencode/commands/**/*.md` | 利用者向けコマンド定義 |
| `src/opencode/skills/**/*.md` | 利用者向けスキル知識ベース |

`docs/` 配下、`scripts/` 配下は検査対象外（AgentDevFlow 内部アーティファクトであり内部 ID 記述を許容する）。

### 検出パターン

| パターン | 検出対象 | 例外（許容） |
|----------|----------|--------------|
| `REQ-\d{4}` | REQ 番号の直接参照 | - |
| `ADR-\d{4}` | ADR 番号の直接参照 | - |
| `SPEC-[A-Z]+(-[A-Z]+)*-\d+` | SPEC-ID 形式 | - |
| `IR-\d{2,}` | Implementation Requirement 番号 | - |

コードブロック内、テンプレート変数プレースホルダー（`{xxx}`）、フロントマターの `name`/`description` 以外の本文行で検出した場合、検出事項候補（観点 `MOVE`、確信度 `high`）として出す。
推奨アクションは「内部 ID を機能的記述（コマンド名、スキル名、機能概要）へ置換」。

### 判定ルール

- 単語露出のみならず、当該 ID 参照が利用者にとって意味を持つかを判定する（利用者が当該 ID を追跡する導線がない場合は除去）。
- `agentdev-*` スキル名、`/agentdev/*` コマンド名は配布物自身の識別子であり許容する（内部 ID ではない）。
- 内部 ID を含む説明が必要な場合は、配布物ではなく `docs/specs/` または `docs/guides/` に配置する。

## 配布物統合性検出

内部管理 ID 除去後に配布物へ残る二次被害（構文破損、主要構造重複、壊れた参照残骸、責務説明矛盾）を検出する。
検出パターンと NG 分類は docs-spec-rebuild-integrity SPEC に準拠する。
ID 汚染（前節）が 0 件でも本検査は実施する。

### 検査対象

| 対象 | 理由 |
|------|------|
| `src/opencode/commands/**/*.md` | 利用者向けコマンド定義 |
| `src/opencode/skills/**/*.md` | 利用者向けスキル知識ベース |

### 構文健全性検査

| パターン | 検出対象 | 例 |
|----------|----------|----|
| frontmatter 重複 | 同一ファイル内に frontmatter 開始/終了 delimiter（`---`）が複数対出現し、`description:`/`agent:`/`name:` 等が重複している | `---\n...frontmatter...\n---\n...本文...\n---\n...同一frontmatter...\n---` |
| 主要見出し重複 | 同一ファイル内で同一 H1（`#`）または H2（`##`）テキストが意図せず重複している | `# 最大自走モード` が2回出現 |
| Markdown 構文破損 | frontmatter delimiter、コードフェンス、インラインコードの対応破綻、正規表現の truncate | `引数が数値のみ（`^\d+---` 等の regex truncate |

### 文意保持検査

| パターン | 検出対象 | 例 |
|----------|----------|----|
| 壊れた括弧 | 全角/半角括弧内が空、スラッシュのみ、内部 ID の prefix/番号のみ | `（OU-012/）`、`（）`、`（/）`、`（REQ-/）` |
| 壊れた参照表現 | 内部 ID 除去後に文脈を失った参照、リンク切れ、行き先不明の代名詞 | `（OU-XXX に基づく）` の ID 部分のみ除去され `（）` 等になった残骸 |
| 主語/目的語欠落文 | ID 除去により文の主語、目的語が欠落し文意が成立しない | `case-run Step 6 で実行担当サブエージェントへ引き継ぐプロンプトには、以下を必須項目として明記する（OU-012/）。` |

### 責務整合検査

同一 command の責務説明が command 本体、command SPEC、関連 skill の間で矛盾していないかを照合する。

| 照合対象 | 確認内容 |
|----------|----------|
| command 本体 ↔ command SPEC | 責務範囲、入力、出力、ガードレールが矛盾していないか |
| command 本体 ↔ 関連 skill | 当該 command の責務、権限、禁止事項が skill 記述と矛盾していないか |
| case-open ↔ case-run ↔ case-close ↔ case-auto | 責務境界（PR 作成、Wave 境界、Epic Issue 単一書き手、クリーンアップ、委譲モデル）が全ての記述元で一致しているか |

判定の SSoT 優先順位: 現行 REQ（REQ〜REQ, REQ）> 承認済み ADR（ADR, ADR, ADR, ADR）> SPEC（command SPEC 群、epic-wave-model SPEC）> command 本体 > skill。

### NG 分類

検出事項には以下の NG 分類を付ける（docs-spec-rebuild-integrity SPEC NG 分類表に準拠）:

| 分類 | 定義 | 後続対象 |
|------|------|----------|
| false positive | 検査ルールの誤検知 | 検査ルールの修正 |
| pre-existing | 今回の変更以前から存在する既知の問題 | 別途要件化 |
| 今回修正対象 | 今回の変更で導入、残存した問題 | 今回の Issue で修正 |

NG 分類は推奨アクション（MOVE/ UPDATE 等）とは別軸で付ける。
検出事項が属する分類が不明な場合は「要ヒューマンレビュー」と明記する。

### 判定ルール

- 検査対象は配布物のみ。`docs/`、`scripts/`、`.agentdev/` は対象外。
- 構文健全性検査は機械的シグナル（`---` 出現数、同一見出し重複、対応破綻）で判定可能。
- 文意保持検査はパターンベースで候補抽出し、文脈確認で確定判定する。
- 責務整合検査は複数ソースのcross-referenceで、SSoT 優先順位に従い矛盾を確定する。
- 既知の false positive、pre-existing 問題は、誤って「今回修正対象」と判定しないため、過去の inspect-docs/ docs-check の finding 履歴を参照する。

## SPEC 三層構造の整合性検出

SPEC は 3 層構造（commands、skills、workflows）を持ち、横断 SPEC（workflows）は個別 command/skill の現在動作を含まない（OU-002 原則）。
これに違反する配置を検出する。

### 検出シグナル

| 観点 | 検出対象 | 推奨アクション |
|------|----------|----------------|
| 横断 SPEC 中の個別動作 | workflows SPEC に個別 command または skill のみに適用される手順、ステップ、判定表が含まれる | 該当 command/skill SPEC へ移送（`MOVE`） |
| 個別 SPEC 中の横断契約 | command SPEC または skill SPEC に複数 command/skill をまたぐ契約が含まれる | 横断 SPEC へ移送（`MOVE`） |
| 旧 grab-bag SPEC 残存 | `docs/specs/**/*.md`（基盤SPECドメイン直下）に複数関心事が混在 | 関心事別 SPEC へ分割（`SPLIT`） |

### 判定ルール

- 個別 SPEC は1コマンドまたは1スキルの現在動作のみを記述する。
- 複数コマンド/スキル間の契約（委譲、キャプチャ境界、Wave モデル等）は `workflows/` に配置する。
- `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring}/*.md` 直下の SPEC は基盤 SPEC（system/document-type-responsibilities/patterns/design-principles 等）のみとし、command/skill 固有の動作は含まない。

## HOW 除去後の acceptance-criteria 順位検証

機械的（単パス）な HOW 除去を実施した後、完了条件（acceptance criteria）順位で再検証を行う。
前工程で機械的に HOW を除去しても残余 violation が残る場合がある（OU-008/Wave 4 学習: 8件の残余 violation を検出）。

### 検証手順

1. **完了条件の展開**: Issue の完了条件、REQ の必達要件を受け入れ基準単位に展開し、優先順位をつける
2. **順位順の検証**: 高優先度の完了条件から順に、REQ ファイル、配布物、SPEC を照合し、HOW 残存、ID 残留、責務混入がないか確認する
3. **残余検出時**: 機械的除去で見逃されたパターン（複数行にまたがる HOW 記述、文脈依存の ID 参照、間接的なスキル名直参照等）を検出事項候補として出す

### 残余 violation の高頻度パターン

| パターン | 例 | 検出観点 |
|----------|----|----------|
| 複数行にまたがる HOW 記述 | ステップ番号参照が別段落に分散 | `MOVE` |
| 文脈依存の ID 参照 | 「当該 REQ」等の代名詞的参照 | `MOVE` |
| 間接的なスキル名直参照 | `agentdev-xxx` を要件文中に埋め込み | `MOVE` |
| 旧名称の残存 | diagnostics → inspect 改名前の名称 | `DRIFT` |
| CLI 詳細の抽象化漏れ | コマンドライン引数、フラグ詳細 | `MOVE` |
| ファイルパスの直接参照 | `src/opencode/...` 等の実装パス | `MOVE` |

機械的除去の単パスでこれらを完全に捕えられないため、acceptance criteria 順位による再検証を必ず実施する。

## 未処理成果物の確認

未処理の intake/learning/RU が存在する場合、その存在と影響のみを報告する:

- **(a) intake inbox**: `.agentdev/intake/inbox/` に未処理 item が存在するか
- **(b) learning inbox**: `.agentdev/learning/inbox.md` に未処理 entry が存在するか
- **(c) 採用済み成果物**: `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` に未処理成果物が存在するか
- **(d) RU**: `.agentdev/backlog/req-units/` に未処理 RU が存在するか

存在する場合は件数と診断への潜在的影響を提示する。
処理は行わない。

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


