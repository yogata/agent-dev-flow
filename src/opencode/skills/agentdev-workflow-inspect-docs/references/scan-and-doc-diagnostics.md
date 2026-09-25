# STEP-1 / STEP-2: スキャン対象収集・候補整理・REQ 体系・文書種別別意味診断（scan-and-doc-diagnostics）

> 本 reference は `agentdev-workflow-inspect-docs` SKILL.md の制御平面（STEP 一覧）STEP-1、STEP-2 詳細である。
> read-only-diagnostic型のため resume point を持たない。

## 目次

- [開始条件](#開始条件)
- [結果](#結果)
- [手順](#手順)
- [エラー処理](#エラー処理)
- [関連 STEP](#関連-step)
- [関連 Capability Skill](#関連-capability-skill)
- [関連ガードレール](#関連ガードレール)

## 開始条件

- STEP-1: inspect-docs command の実行開始
- STEP-2: スキャン対象一覧の確定

## 結果

- REQ/Decision/Design/guides/README の意味診断結果（検出事項候補、根拠、source-of-truth 判定、推奨 route）
- STEP-2 の意味診断は範囲が重複しない診断担当への並列委譲で実行し、親が fan-in した統合結果を本 STEP の結果とする

## 手順

### STEP-1-1: スキャン対象の収集

`docs/requirements/`、`docs/decisions/`、`docs/designs/`、`docs/guides/`、`README.md`、`.opencode/` を収集する。

### STEP-2-0: 候補整理の前置

並列委譲に先立ち、既存の機械的手段で診断候補を収集し、診断担当ごとに対象範囲と根拠箇所へ整理する。
機械的検査の既存 owner を再利用し、本スキル内で機械的検査を再実装しない。

| 収集手段 | 取り扱い |
|---|---|
| docs-check（機械的検査の既存 owner） | 利用可能な環境では実行結果を機械的候補として取り込む。利用できない環境では残りの手段で候補収集を継続する |
| README 索引 | README 索引の記載を実ファイル一覧と突き合わせ、導線範囲の超過候補と索引対象の実在候補を収集する |
| `rg` | 未解決参照、superseded 成果物への現行参照、廃止済み識別子、参照先が取得できない記述、正規所有者のいない成果物、構造的重複候補の文字列シグナルを探索する |
| 正規成果物の直接読取 | REQ/Decision/Design/guides/README の frontmatter、見出し、関連情報節を直接読み、文書種別、状態、関連宣言の候補を収集する |

- 収集結果は診断担当ごとに次の要素へ整理する: 対象範囲（ファイル一覧）、根拠箇所（file:line 形式）、機械的シグナルの種別
- agentdev-traceability の coverage、impact、check を候補探索に使用しない
- 候補は未検証 evidence であり、決定的判定を行わず意味診断の入力として診断担当へ引き渡す

### STEP-2-1: 診断担当への分割と委譲

STEP-2 の意味診断（STEP-2-2〜2-10）を、範囲が重複しない診断担当へ分割して並列委譲する。
委譲は書込み禁止型のサブエージェント委譲とし、診断担当は検査対象ファイルを変更しない。

| 診断担当 | 対象工程 | 対象範囲 |
|---|---|---|
| REQ 体系担当 | STEP-2-2、2-3、2-4、2-9、2-10 | `docs/requirements/`（REQ 参照 ID 整合性、第一参照導線、現行/廃止/世代境界、6観点 structure review、文書分類一貫性） |
| Design 担当 | STEP-2-5 | `docs/designs/`（Design 意味診断） |
| Decision/guides/README 担当 | STEP-2-6、2-7、2-8 | `docs/decisions/`、`docs/guides/`、`README.md`（Decision 意味診断、guides 意味診断、README 索引診断） |

- 担当間で同一の対象工程、同一の診断観点を重複して割り当てない
- 担当の対象範囲が大きく完了できない見込みの場合は、完了できる単位（判定対象のファイル群、観点の部分集合）へ切り分ける。切り分けは担当の内部分割であり、担当間の範囲重複を生まない。6観点の網羅確認は親の fan-in 手順で行うため、担当の切り分けは網羅性を損なわない
- 委譲 prompt には次を含める: 対象範囲、STEP-2-0 で収集した候補と根拠箇所（file:line 形式）、判定基準（正規情報源と source-of-truth priority）、戻り値契約
- 戻り値契約: 検出事項候補、根拠（file:line 形式）、根拠とした正規情報源、不確実性（判断に迷った箇所とその理由）
- 診断担当の戻り値は中間成果であり、親の最終判断で採用、修正、却下する

#### 委譲方式の選択

| 条件 | 方式 |
|---|---|
| 同期委譲で完了できる単位 | 同期方式。親が子の完了を待ち、結果を受け取って次へ進む |
| 同期委譲では完了が見込めない単位 | 非同期委譲。背景起動し、子の完了まで親の実行コンテキストを維持する |

- 非同期委譲では、親は子の完了待ちを明示的に行い、子の完了前に後続工程へ進まない（子の完了前に親の実行コンテキストが終了すると、実行基盤が背景子を中断させ得るため）
- 背景子の中断（Abort）を検出した場合は、中断された担当のみを再委譲する。中断を検知できない経路では、完了通知が得られなかった担当を未完了として扱い、同一手順で再委譲する
- 起動手段、待機、並列実行制御の具体は harness 責務であり、AGENTS.md（ハーネス選定）に従う

#### 測定内容の対称性確認（並列化比較測定）

並列化の変更前後で比較測定を実施する場合、測定設計時に両系統（変更前・変更後）の測定内容が対称であることを確認する。
測定対象は、同一 Git revision の診断対象 corpus と既知 finding を比較基準とし、壁時計時間、意味診断工程の時間、各診断担当の開始・完了・待機、委譲の失敗と再実行、モデル呼出とツール呼出である。

| 対称性の要素 | 確認内容 |
|---|---|
| 候補検証の有無 | 両系統で収集した候補の検証（採否判定・正当理由の付与）を同等の手順で行っていること。片系統のみ検証を省略しない |
| 候補入力の同一性 | 両系統に与える診断対象 corpus（対象ファイル一覧・revision）を同一に揃えていること。片系統のみ異なる入力を与えない |
| 読み取り内容の同一性 | 両系統が読み取る正規成果物・参照情報の範囲を同一に揃えていること。片系統のみ追加の読み取りをしない |

- 対称でない測定（片系統のみ候補検証を省略した subset 測定等）は、短縮効果の成功証拠として扱わない（subset 測定自体は禁止しない。その場合も検出漏れ・過剰検出の確認は対称条件で別途行う）
- 測定記録には、上記3要素の対称性確認の結果と手動検証した対照例の確認を残す。finding 差分には全件に正当理由を付す

#### 同期委譲の実効判定（observed-time 原則）

「同期委譲で完了できる単位」かどうかの実効判定は、固定の数値閾値を設けず、環境 timeout の実観測（当該環境・当該単位での実際の所要時間と timeout 発生の有無）に基づいて行う（observed-time 原則）。

- 判定の根拠は、実環境での観測値（前回の同等単位の所要時間、当該単位の試行結果等）とする。本 reference に固定の秒数・件数の閾値を定義せず、閾値を暗黙に固定運用しない
- 同期委譲で timeout または失敗が観測された単位は、非同期委譲への切替経路（上表の非同期方式と子の完了待ち手順）が機能することを確認した上で、該当単位を非同期委譲へ切替する
- observed-time の観測結果は検証記録の環境ラベル（実行環境、所要時間、timeout 発生の有無）へ記録し、判定の再現可能性を保つ

#### fan-in 手順

全診断担当の結果回収後、親が次の順で統合する。

1. 回収確認: 委譲した担当すべてについて、担当識別子ごとに完了、失敗、未完了を記録する
2. 6観点の網羅確認: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT の各観点が担当の結果のいずれかで扱われていることを確認し、欠けている観点があれば該当担当の再委譲で補う
3. 横断矛盾判定: 担当間の結果が矛盾しないかを source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）で判定する
4. 重複排除: 複数担当から同一対象、同一根拠の候補が返った場合は 1 件へ統合する
5. 既知 defer/false positive 照合: すでに保留、除外と判断済みの候補を照合し、差分へ反映する
6. 統合結果を STEP-2 の結果とし、STEP-3 以降へ引き渡す

#### 失敗診断担当の識別と再実行

- 委譲ごとに担当識別子（担当名と対象範囲）を付与し、完了、失敗、未完了を判別する
- 失敗または未完了の担当だけを、同一担当識別子、同一対象範囲、同一根拠一覧で再委譲する。再実行は担当単位であり、親による全系統の全面再診断を行わない
- 失敗回避のために並列実行を全体逐次化しない。同期方式への切替は、当該単位が同期委譲で完了できると判断した場合の選択としてのみ行う
- 再実行でも失敗が繰り返される場合は、当該担当の対象範囲を完了できる単位へ切り分けて再委譲する

### STEP-2-2: REQ 参照ID整合性確認（REQ 体系担当）

`agentdev-req-structure-diagnostics` 参照。

### STEP-2-3: 第一参照導線確認（REQ 体系担当）

`agentdev-req-structure-diagnostics` 参照。

### STEP-2-4: 現行/廃止/世代境界確認（REQ 体系担当）

`agentdev-req-structure-diagnostics` 参照。

### STEP-2-5: Design 意味診断（Design 担当）

Design が REQ/Decision/guides の代替、将来計画の混入、実行時依存先としての不適切扱いを確認する。

### STEP-2-6: Decision 意味診断（Decision/guides/README 担当）

承認済み Decision のみを現行判断の根拠として扱っているか確認する。

### STEP-2-7: guides 意味診断（Decision/guides/README 担当）

guides が navigation layer の範囲を超えていないか確認する。
履歴混入を検出した場合 route を追加する。

### STEP-2-8: README 索引診断（Decision/guides/README 担当）

README 索引が導線の範囲を超えていないか確認する。
内容過多を検出した場合分割を誘導する。

### STEP-2-9: REQ structure review（6観点）（REQ 体系担当）

SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT。
`agentdev-req-structure-diagnostics` 参照。

### STEP-2-10: 文書分類一貫性検査（REQ 体系担当）

document-model Design（extension 経由）の classification policy への適合確認。
REQ 要件行に schema field、enum 値一覧、route/category/status 判定表、file pattern、テンプレート種別、report format、内部アルゴリズム、作業履歴、実装パラメータ等の Design分離基準違反が残留していないかを `agentdev-req-structure-diagnostics` に従って自動検出する。

- STEP-2-2〜2-10 の工程番号は診断担当内部での実行順序の整理ラベルであり、担当間の実行順序を規定しない（診断担当は並列に実行される）
- 診断担当は対象を変更せず、候補、file:line 形式の根拠、正規情報源、不確実性を親へ返す

## エラー処理

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| 診断担当の委譲失敗、未完了 | 失敗または未完了の担当のみを同一対象範囲・同一根拠一覧で再委譲する（「失敗診断担当の識別と再実行」参照。全系統の全面再診断、全体逐次化はしない） |
| docs-check が利用できない環境 | docs-check を候補収集から外し、README 索引、`rg`、正規成果物の直接読取で候補収集を継続 |

## 関連 STEP

- 前: なし（workflow 先頭）
- 次: STEP-3（distribution-check-and-output）

## 関連 Capability Skill

- `agentdev-req-structure-diagnostics`: STEP-2-2〜2-4、2-9、2-10 の判定ロジック
- `agentdev-doc-diagnostics`: 診断カテゴリ、証拠構造、文書種別別ルーティング
- `agentdev-project-extensions`: document-model Design の extension 経由解決

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- ガードレール（ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可）
- 不変条件（source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）に従って矛盾を判定）
