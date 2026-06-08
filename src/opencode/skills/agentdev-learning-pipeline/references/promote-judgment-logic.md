# Promote Judgment Logic

<!-- 元コマンド: learning-promote.md -->
<!-- 抽出日: 2026-06-07 -->

learning-promote コマンドの Steps における判定ロジック（旧フォーマット正規化・問題クラス分類・8軸評価・廃棄判定・HITL承認）を定義する。

## Phase 2: Internal Normalize（旧フォーマット正規化）

全エントリの読込と旧フォーマット正規化:

- inbox.md + archive/active.md から全エントリをパース
- **旧フォーマット正規化**を必ず実施。スキーマとマッピングは `agentdev-learning-pipeline` skill の「Inbox Entry Schema」を参照
- 正規化は解析時のみ適用し、元ファイル（inbox.md / archive/active.md）の内容は書き換えない
- 旧フォーマットパース失敗時 → 当該エントリをスキップし警告を出力。処理は継続

## Phase 3: Internal Classify + 8-axis Evaluation

### 問題クラス分類

- 分類基準は `agentdev-learning-pipeline` skill の「問題クラス分類基準」を参照
- テーマクラスタリングではなく、**問題クラス**（根本原因 + 再発条件 + 予防策が同じ単位）で分類する

### 8軸評価スコアリング

- 評価ディメンションとスコア基準は `agentdev-learning-pipeline` skill の「8軸評価ディメンション」を参照
- 各問題クラスに対して8軸で評価（各1-5スケール）し、加重合計スコア（満点40）を算出

### evaluation-report.md の生成・更新

- パス: `.agentdev/learning/evaluation-report.md`（毎回上書き、追記しない）
- スキーマは `agentdev-learning-pipeline` skill の「Evaluation-Report Schema」に従う
- evaluation-report.md は本コマンドの評価根拠中間成果物であり、外部コマンドの入力としての依存関係を持たない

## Phase 4: Disposal Judgment + Existing Measure Check

### 廃棄判定（11カテゴリ + duplicate）

- **主入力**: Phase 3 で生成した evaluation-report.md の問題クラスラスタ（raw learning item の再分類は禁止）
- 廃棄カテゴリ一覧、反映先マッピングは `agentdev-learning-pipeline` skill の「処分区分」を参照
- 各クラスタに対し最適な廃棄先を判定

### 既存対策確認

- 各クラスタの内容に対し、既存の command/skill/template/docs に類似対策が存在するか確認
- 確認対象とギャップ分類は `agentdev-learning-pipeline` skill の「処分区分 → 既存対策照合」を参照
- 「新規X化」より「既存Xへ反映」を優先

## Phase 5: HITL Confirmation

### ユーザーへの判定結果提示

- 判定結果を表形式で提示（クラスタ / テーマ / 8軸評価スコア / 廃棄判定 / 既存対策 / 理由）
- 統計サマリ（昇華対象・保留・却下・重複の件数）を併記
- アーカイブ移動の承認もあわせて求める

### ユーザー承認

- ユーザーが各クラスタの廃棄判定を確認・修正
- 判定の変更指示があれば廃棄判定・既存対策確認を再実行
- 承認したクラスタのみ処理
- 承認しない → 「昇華をキャンセルしました」と報告して終了
- **自動確定禁止**: AI 単独で promote / prune の最終確定を行ってはならない（MUST NOT）
