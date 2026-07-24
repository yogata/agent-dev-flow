# docs 横断診断カテゴリ

inspect-docs command が実行する docs 横断診断のカテゴリ定義と、各専門 skill へのルーティング対象を定義する。
本スキルは「横断的に複数文書をスキャンして専門診断の対象を特定する」役割のみを持ち、各カテゴリの判定シグナル、閾値、出力 schema の詳細は専門 skill が所有する（`diagnostic-routing.md` 参照）。
専門診断の判定ロジックを本カテゴリで再定義しない（AC-014）。

## カテゴリ一覧

| カテゴリ | 横断スキャン観点 | ルーティング先 |
|----------|------------------|----------------|
| 廃止 REQ/SPEC 由来記述残置 | retired REQ/SPEC ID をソースとした記述が活性文書に残置していないか | `agentdev-req-structure-diagnostics`（REQ 体系境界、配布物 ID 汚染） |
| REQ/SPEC 境界違反 | HOW 詳細が現行 REQ 要件行に残留しているか（document-model SPEC Separation Criteria 準拠） | `agentdev-req-structure-diagnostics`（MOVE 観点） |
| REQ 粒度過小 | 1 REQ に複数関心、成果物種別、command family、lifecycle 段階が混在しているか | `agentdev-req-structure-diagnostics`（SPLIT 観点） |
| 横断契約矛盾 | REQ/ADR/SPEC/guides/DOC-MAP 間で source-of-truth priority に基づく矛盾があるか | `agentdev-req-structure-diagnostics`（DRIFT 等）、`agentdev-doc-writing`（文意品質） |
| 文意品質候補 | LLM っぽい表現、空虚語、英語混じり表現、実行主体分類の誤認が残存しているか | `agentdev-doc-writing` |
| 探索順と索引の不整合 | DOC-MAP 記載と実際の基準文書構造が不整合でないか | `agentdev-doc-map` |

各カテゴリの検出シグナル、シグナル閾値、判定ルールの詳細はルーティング先の専門 skill が所有する。
本スキルは「どのカテゴリを横断的にスキャンするか」「どの専門 skill へルーティングするか」のみを定義する。

## 廃止 REQ/SPEC 由来記述残置

活性文書（現行 docs/、配布物）に retired REQ/SPEC ID をソースとした記述が残置していないかを横断的にスキャンする。
活性 REQ/SPEC（現行セット）への言及は対象外とする。

### 横断スキャン対象

| 対象 | 理由 |
|------|------|
| `docs/requirements/**/*.md`（retired/ 配下は除く） | 現行要件の参照整合性保持 |
| `docs/adr/**/*.md` | 現行 ADR の参照整合性保持 |
| SPEC ファイル群 | 現行 SPEC の参照整合性保持 |
| ガイドファイル群 | ガイドの参照整合性保持 |
| `docs/DOC-MAP.md` | 探索経路インデックスの整合性保持 |
| agentdev command 群 | 配布物の ID 汚染検出（利用者向け） |
| agentdev skill 群 | 配布物の ID 汚染検出（利用者向け） |

`docs/requirements/retired/` 配下、`docs/requirements/mapping-table.md` は履歴保持のため対象外とする。

### 横断スキャン観点

- retired REQ/SPEC ID の一覧を `retired REQ ディレクトリ`、`retired SPEC ディレクトリ` 等から収集する
- 収集した ID をキーに活性文書を横断検索する
- 「現行判断の根拠」として使われている言及を high severity 候補としてルーティングする
- 履歴参照、移行履歴説明目的の言及は対象外とする（文脈で判定）

詳細な検出パターン、配布物 ID 汚染の判定ルール、配布物統合性検査は `agentdev-req-structure-diagnostics` が所有する。本スキルはルーティング対象の特定のみを行う。

## REQ/SPEC 境界違反

現行 REQ の要件行に SPEC 分離基準違反（HOW 詳細、内部パラメータ）が残留していないかを横断的にスキャンする（document-model SPEC Separation Criteria 準拠）。

### 横断スキャン観点

- 現行 REQ の要件テーブル行を優先して確認する
- 要件行が SPEC、rule catalog、command reference、skill reference、test docs に置くべき詳細（HOW）を主たる文意としているかを判定する
- 安定契約例外候補（公開 command 名、ドメイン状態の位置づけ、外部接続契約、安全境界、停止条件の大枠）に該当する可能性がある場合は確信度を下げる

### 安定契約例外候補

次の要素は安定契約（外部公開が必要）に該当する可能性があり、例外として扱う。確信度を medium/low に下げ、根拠に例外候補を明記する。

- 公開 command 名（`/agentdev/*`）
- ドメイン状態の位置づけ（`.agentdev/` 配下の構造要素）
- 外部接続契約（委譲、入出力、ライフサイクル境界）
- 安全境界、停止条件の大枠

例外判定の SSoT は document-model SPEC（extension 経由で参照）。本スキルは例外候補の抽出と確信度調整のみを行う。

### ルーティング先

検出シグナルの詳細カタログ（schema field、enum 値一覧、route 判定表、file pattern、template variant、report format、内部アルゴリズム、作業履歴、実装パラメータ等）、判定ルール、出力 schema は `agentdev-req-structure-diagnostics`（MOVE 観点）が所有する。本スキルは横断スキャンでシグナル候補を抽出し、ルーティングする。

## REQ 粒度過小

1 つの現行 REQ に複数の独立した関心が混在し、分割が適切かを横断的に診断する（SPLIT 観点の横断適用）。

### 横断スキャン観点

- 複数 REQ を横断比較し、関心の重複、境界の曖昧さを検出する
- 1 REQ に複数の関心対象、複数成果物種別、複数 command family、複数 lifecycle 段階が混在していないかを走査する
- 要件行数、関心分類数、成果物種別数の定量閾値は req-health-metrics SPEC が所有する

### ルーティング先

SPLIT 観点の判定ロジック、シグナル閾値（1シグナルは觀察メモ、2シグナル以上は検出事項 等）、出力 schema（7フィールド）は `agentdev-req-structure-diagnostics` が所有する。本スキルは横断比較によるシグナル候補抽出とルーティングのみを行う。

## 横断契約矛盾

REQ/ADR/SPEC/guides/DOC-MAP 間で、source-of-truth priority に基づく矛盾の有無を検出する。
source-of-truth priority: 現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides。

### 横断スキャン観点

| シグナル | 内容 |
|----------|------|
| 下位文書の上位文書への矛盾 | DOC-MAP/guides の記述が現行 REQ/承認済み ADR と矛盾する |
| SPEC と REQ の責務説明矛盾 | SPEC の責務記述が現行 REQ の要件と矛盾する |
| 旧名称、旧概念の残存 | 改名、廃止済みの概念が活性文書に残存している（DRIFT 的観点の横断適用） |

### 判定ルール

- 矛盾判定は source-of-truth priority に従う。上位文書を正とし、下位文書の矛盾を検出事項とする
- 旧名称、旧概念の残存は DRIFT 観点として `agentdev-req-structure-diagnostics` へルーティングする
- 文意品質に起因する矛盾（表現揺れ、曖昧語）は `agentdev-doc-writing` へルーティングする
- 履歴説明目的の言及は対象外とする（文脈で判定）

## 文意品質候補

LLM っぽい表現、空虚な形容/動詞、英語混じり表現、実行主体分類の誤認（command を skill と呼ぶ等）が活性文書に残存していないかを横断的にスキャンする。

### 横断スキャン観点

- 対象は `docs/**`、配布物（commands/、skills/）の自然言語記述
- 横断的に出現パターンを走査し、文意品質問題の候補を抽出する

### ルーティング先

判定辞書（置換辞書、LLM 表現辞書、英語抽象語書き換え辞書）、機械的置換ルール、査読出力形式は `agentdev-doc-writing` が所有する。本スキルは横断スキャンで候補を抽出し、ルーティングする。

## 探索順と索引の不整合

DOC-MAP 記載と実際の基準文書（REQ/ADR/SPEC）の構造が不整合でないかを横断的にスキャンする。

### 横断スキャン観点

- DOC-MAP の対象領域セクションに列挙された基準文書パスが実在するか
- DOC-MAP の要約と基準文書の内容が矛盾していないか
- 索引の範囲を超えて DOC-MAP が要件、判断、仕様を記述していないか

### ルーティング先

DOC-MAP の読み方ガイド、ドキュメント探索順序、影響確認ルールは `agentdev-doc-map` が所有する。本スキルは横断スキャンで不整合候補を抽出し、ルーティングする。

## 配布物統合性

配布物（commands/、skills/）について、docs-spec-rebuild-integrity SPEC（extension 経由）が定義する検査パターンに従い、構文健全性、文意保持、責務整合を診断する。docs-spec-rebuild-integrity SPEC が検出パターンを定義し、本スキルが診断カテゴリ、共通証拠構造、finding 出力契約を正規所有する。判定ロジック、検出手順、問題候補出力スキーマは `agentdev-req-structure-diagnostics` が所有し、本スキルは対象範囲の特定とルーティングを行う。

### 構文健全性検査パターン

docs-spec-rebuild-integrity SPEC が定義する5パターンを配布物整合性診断を提供する各 command（inspect-docs、inspect-skills）に共通で適用する。

| パターン | 横断スキャン観点 | 検出対象外 |
|----------|------------------|------------|
| frontmatter 重複 | 配布物 Markdown frontmatter の重複、破損 | 許容される重複（テンプレート等） |
| 見出し重複 | 同一文書内の H1/H2 等の主要見出しの意図せぬ重複 | 許容される重複（手順番号等） |
| Markdown 構文破損 | 正規表現破損、未対応フェンス、不正インラインコード等 | （該当なし） |
| 存在しない command 参照 | README listing と command 本文の相互参照で存在しない command を指す参照 | 実在する command 参照 |
| エンコーディング不整合 | UTF-8 BOM 付きファイル、単一ファイル内の CRLF/LF 混在 | BOM なし UTF-8 かつ単一改行コードで構成されたファイル |

存在しない command 参照の検出は README listing（agentdev command README の command 一覧）と command 本文（各 `*.md`）の相互参照について `/agentdev/*` 参照を抽出し、実在する command 一覧と照合する。実在確認であった command 参照は検出対象外とする。

エンコーディング不整合の検出は配布物 Markdown の先頭3バイトから UTF-8 BOM（`EF BB BF`）の有無を判定し、当該ファイル内の改行コード出現集合（CRLF、LF のいずれか、または両方）から混在を判定する。BOM なし UTF-8 かつ単一の改行コードで構成されたファイルは検出対象外とする。

### ルーティング先

判定ロジック、検出手順、問題候補出力スキーマ（7フィールド）は `agentdev-req-structure-diagnostics` が所有する。本スキルは配布物統合性を inspect-docs Step 11、inspect-skills Step 3 でルーティングし、検出事項を共通 finding 出力契約（`finding-output-contract.md`）へ正規化する。

## 安定契約例外の総合判定

複数カテゴリにまたがる安定契約例外候補は、個別カテゴリで確信度を調整した上で横断的に再評価する。
例外確定の場合は検出事項から外し、例外でない場合は該当カテゴリの severity で出力する。

例外判定の SSoT は document-model SPEC（extension 経由で参照）。本 reference では例外候補の抽出と確信度調整のみを行う。
