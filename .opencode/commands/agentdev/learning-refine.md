---
description: inbox.mdとarchive.mdをセマンティック分析し、evaluation-report.mdを出力後inbox→archive移動を行う
agent: sisyphus
load_skills:
  - agentdev-learning-capture
  - tips-pipeline-orchestration
---

# 学びの問題クラス分類・8軸評価とアーカイブ

`docs/tips/inbox.md` の学びエントリと `docs/tips/archive.md` の過去エントリを正規化・問題クラス分類し、8軸評価スコアを算出して `docs/tips/evaluation-report.md` に出力。refine 時 prune（任意）を実施後、ユーザー承認を経て inbox → archive へ原子的に移動する。

evaluation-report.md は評価済み中間レポートであり、learning-promote が昇格・保留・破棄を判断するための境界成果物である。毎回上書きし、長期履歴にはしない。

## Input

- `docs/tips/inbox.md`（必須）— 未処理の学びエントリ
- `docs/tips/archive.md`（任意）— 過去エントリ

## Output

- `docs/tips/evaluation-report.md`（毎回上書き）
- `docs/tips/archive.md`（inbox からの移動分を追記）
- `docs/tips/inbox.md`（ヘッダーのみにクリア）

## Steps

### 1. inbox.md の内容確認

- `docs/tips/inbox.md` を読み込む
- ファイルが存在しない → エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」
- `---` 区切りのエントリをカウント（ヘッダー除く）
- 0件 → 「分析対象の学びがありません」と報告して終了

### 2. archive.md の読込

- `docs/tips/archive.md` が存在すれば読み込む
- 存在しない場合は空として扱う

### 3. 全エントリの読込と旧フォーマット正規化

- inbox.md + archive.md から全エントリをパース
- **旧フォーマット正規化**を必ず実施。スキーマとマッピングは `tips-pipeline-orchestration` skill の「Inbox Entry Schema」を参照
- 正規化は解析時のみ適用し、元ファイル（inbox.md / archive.md）の内容は書き換えない

### 4. 問題クラス分類

- 分類基準は `tips-pipeline-orchestration` skill の「問題クラス分類基準」を参照
- テーマクラスタリングではなく、**問題クラス**（根本原因 + 再発条件 + 予防策が同じ単位）で分類する

### 5. 8軸評価スコアリング

- 評価ディメンションとスコア基準は `tips-pipeline-orchestration` skill の「8軸評価ディメンション」を参照
- 各問題クラスに対して8軸で評価（各1-5スケール）し、加重合計スコア（満点40）を算出

### 6. evaluation-report.md の生成

- パス: `docs/tips/evaluation-report.md`（毎回上書き、追記しない）
- スキーマは `tips-pipeline-orchestration` skill の「Evaluation-Report Schema」に従う

### 7. refine 時 prune（MAY、任意）

archive.md 内の古い単発レアケースを削除候補として特定する。**必須ではない。** inboxエントリ数が15件未満の場合やユーザーが明示的にスキップを指定した場合は実施しない。

- prune 対象の特定基準、削除禁止エントリ、実施フローは `tips-pipeline-orchestration` skill の「Prune 方針 → refine 時 prune」を参照

### 8. ユーザーに分析結果提示

- evaluation-report.md の内容を表示（問題クラス一覧と8軸評価スコア、prune 結果、全体傾向）
- アーカイブ移動の承認を求める
- ユーザーが承認しない → 「アーカイブをキャンセルしました。evaluation-report.mdは保存済みです」と報告して終了

### 9. アーカイブ移動（原子的操作 — 最重要）

- **Step A**: inbox.md の全エントリを archive.md に追記。各エントリに `**移動日**: YYYY-MM-DD` フィールドを追加
- **Step B**: archive.md の書込を検証（追記したエントリ数をカウントして照合）
- **Step C**: Step B が成功した場合のみ、inbox.md をヘッダーのみにクリア:
  ```markdown
  # 学び・教訓

  このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
  まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

  ---
  ```
- Step B が失敗 → inbox.md は変更しない。エラー内容を報告

### 10. 完了報告

- 問題クラス数（未分類含む）
- 処理したエントリ数（inbox → archive）
- prune したエントリ数（実施した場合）
- evaluation-report.md のパス

### 11. learning-promote 提案

- evaluation-report.md に問題クラスが検出された場合:
  「問題クラスが検出されました。`/agentdev/learning-promote` で昇華判定を行うことを推奨します」
- 未分類エントリのみの場合でも、evaluation-report.md は保存済み

## ユーザー確認ポイント

1. **Step 7**: prune 候補の承認（任意実施時）
2. **Step 8**: アーカイブ移動の承認

## Error Handling

| エラー | 対処 |
|--------|------|
| inbox.md が存在しない | エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」 |
| 学びが0件 | 「分析対象の学びがありません」と報告して終了 |
| ユーザーがアーカイブ承認しない | 「アーカイブをキャンセルしました。evaluation-report.mdは保存済みです」と報告 |
| archive.md 書込失敗 | inbox.md は変更しない。エラー内容を報告 |
| 旧フォーマットパース失敗 | 当該エントリをスキップし、警告を出力。処理は継続 |
| prune候補抽出エラー | prune をスキップし、分類・評価・アーカイブ移動は継続 |

## 注意事項

- **evaluation-report.md は毎回上書き**: 過去のレポートは保持しない
- **evaluation-report.md は境界成果物**: learning-refine と learning-promote 間の受け渡し物
- **archive.md は生きている learning プール**: 永久保存先ではなく、prune・promote 時 prune で動的に変化する
- **昇格判定は別コマンド**: evaluation-report.md に基づく昇格推奨は `/agentdev/learning-promote` の役割
