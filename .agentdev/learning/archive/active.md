# 学びアーカイブ（生きている learning プール）

未処分・保留中・再評価対象の learning item を保持する生きている learning プール（SHALL）。
/agentdev/learning-refine の実行時に inbox.md から移動されたエントリが格納され、/agentdev/learning-promote の処分判定や /agentdev/learning-refine の prune によって動的に変化する。

永久保存先ではなく、処分済みの learning item は削除される。昇格対象の根拠は staging スタブに残す。

## エントリフォーマット（13項目 + 移動日）

```markdown
## YYYY-MM-DD: タイトル

- **問題事象**: 何が起きたか
- **発生局面**: いつ/どこで発生したか。例: 実装、CI、レビュー、デプロイ
- **検知方法**: どう検知したか。例: CI失敗、lint警告、レビュー指摘、手動確認
- **根本原因**: なぜ起きたか
- **自律対応内容**: エージェントがどう修正・回避・対応したか
- **ユーザー確認有無**: ユーザー確認が関与したか。あり/なし
- **ADR/REQ/spec影響**: ADR/REQ/specへの影響可能性。なし、または具体的な影響先
- **横展開観点**: 同種の状況への適用方法
- **再発条件**: どのような条件で再発するか
- **予防策候補**: 将来の予防方法
- **想定反映先**: 反映先。例: コマンド/スキル/テンプレート/docs
- **関連**: 関連ファイルパス、Issue番号等
- **タグ**: `#タグ1` `#タグ2`
- **移動日**: YYYY-MM-DD（/agentdev/learning-refine実行日）

---
```

## 旧フォーマット互換

過去のエントリ（5項目形式: 事象/原因/対策/関連/タグ）は /agentdev/learning-refine 実行時に正規化される。

正規化マッピング:
- 状況/事象 → 問題事象
- 原因 → 根本原因
- 解決策/対策/教訓 → 自律対応内容（解決策・対策）/ 予防策候補（教訓）

## Prune ポリシー

archive.md は append-only ではなく、以下のタイミングでエントリが削除される:

- **refine 時 prune**（MAY）: 長期間再発していない単発レアケース。ただし判断基準・技術知識・プロジェクト固有知識を含む learning item は削除不可
- **promote 時 prune**（SHALL）: staged / rejected / duplicate の learning item。deferred・未処分の learning item は削除不可

---

## cross-skill 参照の false positive: path 存在検査の精度限界

- **問題事象**: `checkScriptTemplateReferencePaths()` が cross-skill の相対パス参照を false positive として8件検出。skill 内からの参照は skill-relative だが、他の skill から参照されるパスはリポジトリルート相対として解釈されるため、実在するファイルが "missing" と判定される
- **発生局面**: 実装（case-run Step 6 の integrity-check 拡張）
- **検知方法**: integrity-check 実行時の 35 ReferencePath results（27 ok, 8 ng）
- **根本原因**: path 存在検査が参照元ファイルのディレクトリを基準に相対パスを解決するが、cross-skill 参照では参照元 skill のディレクトリではなくリポジトリルートが意図されるケースがある。Markdown 内の相対パス解決ルールとファイルシステムの相対パス解決ルールの差
- **自律対応内容**: false positive を既知の制約として受け入れ、完了報告に明記。修正はスコープ外
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-0108-115/116 の要件は充足）
- **横展開観点**: integrity-check の path 存在検査全般に適用。Markdown 内リンクとファイルシステムパスの解決ルール差異に起因する false positive パターン
- **再発条件**: (1) skill A が skill B のファイルを相対パスで参照、(2) 参照元を基準にパス解決すると実在しないパスになる、(3) リポジトリルート基準なら実在する
- **予防策候補**: (1) 参照元の種別（command/skill）に応じたベースディレクトリ切替、(2) Markdown link 解決ルールの明文化、(3) false positive を抑制する除外パターンの導入
- **想定反映先**: agentdev-integrity の checkScriptTemplateReferencePaths() 改善、または REQ-0108 の path 解決ルール明文化
- **関連**: Issue #544, PR #545, REQ-0108-115/116, check_integrity.ts
- **タグ**: `#integrity-check` `#false-positive` `#path-resolution` `#cross-skill`
- **移動日**: 2026-06-04

---

## 2026-06-04: 大規模テストファイル(2700+行)の修正委譲でタイムアウト発生

- **問題事象**: check_integrity.test.ts (2771行、52箇所のload_skills参照) の修正をdeep categoryのsubagentに委譲したところ、30分のタイムアウトでタスク失敗。変更自体は適用されていたが、タスク管理上は失敗扱いとなり結果回収ができなかった
- **発生局面**: 実装（case-run Step 5 の委譲）
- **検知方法**: background_output(task_id) の "Task not found" エラー。git status で変更が適用済みであることを確認
- **根本原因**: (1) 2771行のテストファイル全体の修正を単一タスクに詰め込んだ、(2) load_skills参照のコンテキスト理解に時間を要した、(3) deep categoryのタイムアウト(30分)を超過した
- **自律対応内容**: (1) git statusで変更が適用済みであることを確認、(2) bun test でテストパスを検証、(3) タイムアウトしたが変更は正しく適用されていたことを確認して次ステップに進んだ
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 大規模ファイル(1000行超)の修正を委譲する全パターンに適用。特にテストファイルのfixture書き換えは行数が多くても変更パターンが機械的
- **再発条件**: (1) 1000行超のファイル修正を単一タスクに委譲する、(2) 変更箇所がファイル全体に散在する、(3) subagentがコンテキスト理解に時間を要する
- **予防策候補**: (1) 大規模ファイルは修正箇所ごとに分割して並列委譲する（例: fixture修正用とテスト削除用）、(2) 機械的な置換パターンの場合はAST-grepやedit toolで直接実行する方が高速、(3) quick categoryで検証のみを別タスクにする
- **想定反映先**: case-runの委譲分割ガイドライン、またはSisyphusの実装委譲ベストプラクティス
- **関連**: Issue #572, PR #573, check_integrity.test.ts
- **タグ**: `#delegation` `#timeout` `#large-file` `#test-fix`
- **移動日**: 2026-06-04

---
