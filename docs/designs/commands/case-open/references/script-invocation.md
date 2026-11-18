---
title: 機械工程の script 呼び出し契約と検査入力の接続
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-open.md から参照される詳細仕様（遅延読み込み）。 -->

# 機械工程の script 呼び出し契約と検査入力の接続

### 機械工程の script 呼び出し契約（RU-0162）

case-open STEP-4（実変更判定と設計PR作成）の機械工程（専用 worktree 作成、Definition branch 作成、REQ 行編集、generate_indexes、検証エンジン cli.ts（--changed）、traceability check、明示パス指定 stage・commit まで）は、工程別 script 1 回の呼び出しに束ねる。script はローカル決定的処理のみを担当し、GitHub I/O（Issue/PR 作成・マージ・クローズ）は Custom Tool agentdev_gh の境界を維持し、script 内で直接実行しない。

- 入力 JSON: 対象 draft パス、Root Case 識別子、Definition branch 名など所定の入力一式を渡す
- 報告 JSON: 実行結果（各処理の成否）、差分、警告、提案する Issue/PR 本文を stdout へ返す。提案本文の採否と報告内容の意味レビューはモデルが担当する
- 終了コード: 成功は 0、要判断・失敗は非 0 を区別する。script は処理を省略せず、失敗時は途中結果とともに非 0 で終了する
- 計測日収束（REQ-117-011）: 計測日不整合・req-updated-freshness NG（旧 IR-072 検出器。DEC-065 により廃止済み。REQ-117-011 の対応手順として本 step を維持）を trigger 条件として、frontmatter updated 追随と generate_indexes 再実行を script 内の measurement-convergence step で補正 commit まで完結する。対象抽出は req-updated-freshness 報告の REQ ファイル名のみ形式（docs/requirements/ プレフィックスなしのファイル名のみ報告）とプレフィックス付き形式の双方を捕捉し、NG 報告対象と補正適用対象の差分検査（補正漏れの fail-closed 検出）を step に含める。trigger 条件が満たされない場合は本 step を生成せず、既存の一巡実行の挙動は変化しない。手動 contingency は本 step の失敗時救済として維持する
- 既存の品質ゲート（検証エンジン cli.ts（--changed）、traceability check、generate_indexes 差分検出）は script 内で実行し、省略しない
- traceability gate を有効にする入力では、判定対象 REQ 集合（traceabilityReqIds）の存在と有効性を gate 実行前に検証する（REQ-030-028）。欠落・空・不整合入力は fail-closed で報告し、空配列への暗黙正規化で入力不備を隠蔽しない
- REQ 追加を伴う Definition Package 生成時は、docs/README.md 手動管理区間の件数記述の照合を初回の変更・検証範囲に含め（REQ-030-029）、REQ 行数由来の派生物が stage paths に事前包含できない場合は既存の事後突合 contingency 手順に従う
- script の実装は inspect_cross_dependencies.ts と同じ作りに従う。ゲート実行体の解決と可用性検査、引数検査、--validate-input 相当の入力検査実行など反復可能な機械処理に限り、agentdev-artifact-validation が所有する共有 lib（supported lib interface 経由）を利用できる。工程固有のゲート選択・順序・実行条件・結果解釈は各工程の Design が所有し続け、横断的な共通基盤を新設しない
- 意味判断（停止判断、deviation 分類、adversarial review、警告の重要度評価）はモデルが担当し続け、script は機械的に確定した手順のみを実行する
- workflow skill 参照文面（references/*.md）は、LLM が bash コマンドを逐次実行する指示から script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
- 本契約は Definition 編集（DefinitionEdit による対象パス + 旧文完全一致置換）の script 適用について規定するものであり、新規 REQ/Decision ファイルの worktree 内前置作成（agentdev-git-worktree 標準手順 type=definition による前置作成、node writeFileSync による UTF-8 明示配置）を排除しない。前置作成済みファイルは script の冪等再利用（branch 確認済み worktree 再利用）と整合して扱う。前置作成の具体的手順は配布 reference（definition-pr-and-idempotency.md）の STEP-4 手順が所有する
- DefinitionEdit の入力 JSON 組立後、各編集の newText の行構造（oldText から newText への行区切りの保全）を、oldText 末尾の行末改行の有無に依存しない方法で機械検証する事前確認を script 入力検証として経る。行区切りの連結など事前確認に不合格の編集を含む入力は fail-closed で拒否する。当該確認は適用後の verbatim 包含突合（REQ-030-027）を代替しない（REQ-030-030）
#### artifact_actions 適用後の verbatim 包含突合（REQ-030-027）

script 呼び出しによる Definition 適用の後、設計PR作成の前に、モデル側の受入検査として適用後成果物への突合を実行する。

- 突合対象は、当該 Case の draft の artifact_actions のうち適用済みと扱う全 action の content とする。追記・置換の各 edit について、適用後ファイルを直接読み、合意済み content の各段落・各行が逐語的に存在することを機械的検索で確認する
- 節見出しだけが適用され本文段落が欠落している状態、置換により既存記述が黙示的に欠落している状態は突合不成立とする
- 突合不成立が判明した場合は設計PRを作成せず停止する（fail-closed）。欠落の再適用は DefinitionEdit の旧文完全一致契約の範囲で行い、冪等再実行の手順（適用済み工程の確認と不足分のみの再適用）と非競合とする
- 突合成立後の PR 本文の検証記録は、適用後成果物への突合結果を根拠として記録する。適用予定内容の記述を適用済みの証拠として記録しない
- verbatim 適用を主張する検証記録には、適用後成果物への包含突合（または edit 単位の再現確認）を伴う規律を、同型の適用系操作全般へ適用する

#### 機械工程 script の実行前提の解決（REQ-029-014〜016）

機械工程 script は producer 側の採番・構成の前提（REQ 行IDの桁数・書式、producer 固有ツールの存在、パス引数の環境形式）を埋め込み値として要求しない。実行前提は workflow 側で Project Extensions（`.agentdev/extensions/`）等のプロジェクト固有値から解決し、script へは明示入力として渡す。script 側の既定値に producer 前提を保持しない。

- REQ 行IDの書式検証は桁数を固定しない許容書式（traceability checker 契約と同じ REQ-{NNNN}-{MMM} 形式）で行い、存在と有効性の検証（REQ-030-028 の規律）と組み合わせる
- producer 固有のゲート（generate_indexes、検証エンジン cli.ts（--changed）、traceability-check 等）を必須とする場合、script は当該ゲート実行体の配布先での存在を検査してから起動する。欠落時は fail-closed で報告し、正規の代替経路（証跡化、手動相当手順、対照実行による悪化ゼロ件の機械証明）への切替を報告 JSON に含める。代替経路の履行なしに検査を省略して成功扱いとしない
- 横断依存検査（inspect_cross_dependencies.ts）の `--root` 等のパス引数は、Windows と Unix 系 shell のパス形式の違い（Git Bash の `/c/...` 形式等）を検出または正規化して受け付ける。正規化不能な形式は検査不能（detection_unavailable）として通過させず、形式エラーとして報告し、形式の違いだけで検出不能とならない
- 本節の規律は case-ready、case-close の機械工程 script 呼び出しにも同一に適用される（各 Design の既有の同一規律参照を維持する）

#### 対象 REQ 行が0件の案件の正規の入力構成と前提の検証の順序（REQ-029-017）

機械工程の入力構成と前提の検証の順序（全試験の前に案件の構成・入力の検証）を Design へ反映する。

- 対象 REQ 行が0件の案件（Decision のみの作成・変更など）を正当な案件の構成として扱う。機械工程の入力検証に、REQ 行の変更を伴わない案件の正規の入力構成（対象の集合が空であることを明示したうえでの、全体を対象とする検査の mode）を加える。既存の代替経路（REQ-029-014〜016）は救済として維持し、正規の入力構成の追加をもって廃止しない
- 検査の前提を、高価な全試験の前に確認する。機械工程の各 phase で、案件の構成と入力の前提の検証を全試験の起動より先に実行し、前提が満たされない失敗が早い段階で確定する順序にする。実行する検査の総数は減らさない（検査の省略ではなく、失敗を検出する順序の是正）

### 検査入力と実行証拠の接続

REQ-030-025/026の実現は既存の工程別実行器・入力型・下位検査契約を再利用する。標準出力と標準エラーは全文を保持し、終了コード、対象版、実行条件（実行コマンド、引数、作業ディレクトリ、指定された実行上限と検査設定）と対応付けて、一回の検査の報告として保存・消費する。末尾抜粋や集計要約だけで原結果を代替しない。既存の実行記録を用い、終了コードや証拠の再取得のみを目的とする同一条件の全再実行を行わない。

既知の検査入力は既存入力型と下位コマンドの契約から固定生成し、必須項目、対象、パス、許容値、必須引数を高価な検査の前に検証する。形状検査だけでなく不正workflow値等の下位引数も拒否する。兄弟実行器と結果消費の規律をそろえ、単一Case専用処理や任意コマンドの汎用解釈器を作らない。既存の計測日二段収束・派生物処理とcommit境界・版変更後の必要検査はそのまま維持する。
