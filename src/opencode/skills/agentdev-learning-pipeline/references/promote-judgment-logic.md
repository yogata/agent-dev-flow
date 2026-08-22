# 昇華判定ロジック

<!-- 元コマンド: learning-promote.md -->
<!-- 抽出日: 2026-06-07 -->

learning-promote コマンドの Steps における判定ロジック（旧フォーマット正規化、問題クラス分類、8軸評価、廃棄判定、HITL承認）を定義する。

## Phase 2: 内部正規化（旧フォーマット正規化）

全エントリの読込と旧フォーマット正規化:

- inbox.md + deferred.md から全エントリをパース
- **旧フォーマット正規化**を必ず実施。スキーマとマッピングは `agentdev-learning-pipeline` skill の `references/inbox-and-evaluation-schema.md`（Inbox Entry Schema）を参照
- 正規化は解析時のみ適用し、元ファイル（inbox.md/ deferred.md）の内容は書き換えない
- 旧フォーマットパース失敗時 → 当該エントリをスキップし警告を出力。処理は継続

## Phase 3: 内部分類 + 8軸評価

### 問題クラス分類

- 分類基準は `agentdev-learning-pipeline` skill の `references/inbox-and-evaluation-schema.md`（問題クラス分類基準）を参照
- テーマクラスタリングではなく、**問題クラス**（根本原因 + 再発条件 + 予防策が同じ単位）で分類する

### 8軸評価スコアリング

- 評価ディメンションとスコア基準は `agentdev-learning-pipeline` skill の `references/inbox-and-evaluation-schema.md`（8軸評価ディメンション）を参照
- 各問題クラスに対して8軸で評価（各1-5スケール）し、加重合計スコア（満点40）を算出

### evaluation-report.md の生成、更新

- パス: `.agentdev/learning/evaluation-report.md`（毎回上書き、追記しない）
- スキーマは `agentdev-learning-pipeline` skill の `references/inbox-and-evaluation-schema.md`（Evaluation-Report Schema）に従う
- evaluation-report.md は本コマンドの評価根拠中間成果物であり、外部コマンドの入力としての依存関係を持たない

## Phase 4: 廃棄判定 + 既存対策確認

### 廃棄判定（11カテゴリ + duplicate）

- **主入力**: Phase 3 で生成した evaluation-report.md の問題クラスラスタ（raw learning item の再分類は禁止）
- 廃棄カテゴリ一覧、反映先マッピングは `agentdev-learning-pipeline` skill の `references/disposition-and-artifact-schema.md`（処分区分）を参照
- 各クラスタに対し最適な廃棄先を判定

### 既存対策確認

- 各クラスタの内容に対し、既存の command/skill/template/docs に類似対策が存在するか確認
- 確認対象とギャップ分類は `agentdev-learning-pipeline` skill の `references/disposition-and-artifact-schema.md`（既存対策照合）を参照
- 「新規X化」より「既存Xへ反映」を優先

## Phase 4-R: adversarial-review 候補判断と内部挿入（経路D）

本 Phase は learning-promote 経路D における review 候補判断と内部手続きの実装詳細を提供する。
経路D の発動条件、挿入位置、戻り先、Step 6 戻しループは learning-promote command Design「adversarial-review 挿入境界（経路D）」節と `agentdev-learning-pipeline` Design「adversarial-review 候補判断と内部挿入」節が正規所有し、本 Phase は再定義しない。
共通 caller integration 契約は `agentdev-adversarial-review` Design が正規所有する。

### 候補判断（Step 8-R1）

Phase 4（廃棄判定 + 既存対策確認）完了後、Phase 5（HITL 承認）前に候補判断を行う。
候補は次のいずれも満たす場合に確定する。

- ユーザーが adversarial-review を明示要求していること
- evaluation-report.md が Step 6 で生成・更新済みであり、Step 7（廃棄判定）と Step 8（既存対策確認）の結果が反映されていること

候補確定後、Step 8-R2（review 呼出）へ進む。
非成立時は Step 8-R2 を迂回し Phase 5 へ進む。

### review 呼出（Step 8-R2）

review 対象は evaluation-report.md のみとする。
呼出失敗時は silent skip を禁止し、利用不能を報告した上で Phase 5 以降の従来フローと既存 HITL を維持する。

accepted finding は learning-promote が責任を持って判定対象へ反映する。
adversarial-review 自身は反映を行わない。

### Step 6 戻しループ

accepted finding を反映し review 対象の意味内容が変更された場合、Step 6（evaluation-report 生成、更新）へ戻り、関連 Step を再実行する。
再実行順は Step 6 → Step 7（廃棄判定）→ Step 8（既存対策確認）→ Step 8-R1（候補判断）→ Step 8-R2（review 呼出）。
再 review の発動は新たな本質的争点が生じ得る場合に限り許容し、停止条件（4点）を満たした時点でループを離脱し Phase 5 へ進む。

unresolved な本質的争点またはユーザー判断事項が残る場合、Phase 5（判定結果提示）、Phase 5 のユーザー承認、Phase 6（採用済み成果物生成、deferred 移動、prune、commit/push）等の不可逆処理へ進まない。
unresolved は既存の HITL（Step 10 ユーザー承認）または blocker 扱いへ振り向ける。

## Phase 5: HITL承認

### ユーザーへの判定結果提示

- 判定結果を表形式で提示（クラスタ/ テーマ/ 8軸評価スコア/ 廃棄判定/ 既存対策/ 理由）
- 統計サマリ（昇華対象、保留、却下、重複の件数）を併記
- アーカイブ移動の承認もあわせて求める

### ユーザー承認

- ユーザーが各クラスタの廃棄判定を確認、修正
- 判定の変更指示があれば廃棄判定、既存対策確認を再実行
- 承認したクラスタのみ処理
- 承認しない → 「昇華をキャンセルしました」と報告して終了
- **自律確定の境界**: 問題クラス分類、8軸評価、廃棄判定、昇華可能性、既存対策との関係から取得可能な根拠で処置を一意に確定できるクラスタはユーザー承認なしで確定し、ユーザー判断が必要なクラスタのみ本 Phase の承認対象とする

