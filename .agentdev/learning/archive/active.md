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

## サブエージェントの連続editによる関数定義破損（Wave 3 #586）

- **問題事象**: Wave 3 (#586) のサブエージェントが `check_integrity.ts` の `checkReqBacklogResidual` 関数に対し、exempt パターン追加の連続editを2回実行した際、いずれも内側の `scanDir` 関数定義を oldString に含めてしまい関数ボディ全体を削除。2回目も同一ミスを繰り返し、最終的に `checkPatternResidual` と `checkReqBacklogResidual` が融合する破壊的状態になった。3回目の手動修復で復旧。
- **発生局面**: case-run Wave 3 → サブエージェントのedit操作
- **検知方法**: スクリプト実行時のJSON出力空、および関数定義の目視確認
- **根本原因**: edit ツールの oldString マッチングが意図より広範囲にマッチし、内側関数定義を含む範囲を置換。複数行 oldString で内側スコープ境界（function定義行）を含むと、意図しない削除が発生しやすい。
- **自律対応内容**: 関数全体を正しく再構築してeditで修復。3回目で成功。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: サブエージェントが入れ子関数を持つファイルを連続editする場面で一般的なリスク
- **再発条件**: oldString に内側関数の定義行を含む置換を連続実行
- **予防策候補**: (1) edit後に Read tool で該当関数の全体を確認する手順を徹底、(2) 大きな関数の部分editでは oldString を最小限に限定、(3) 連続edit前に全体構造を把握してから実行
- **想定反映先**: agentdev-workflow-orchestration のサブエージェント protocol
- **関連**: PR #592, Issue #586
- **タグ**: `#edit-tool` `#subagent` `#function-corruption` `#typescript`
- **移動日**: 2026-06-06

---

## baseline分類の乖離と解決

- **問題事象**: integrity audit実行時に使用したpractical finding分類（7種）が、先行REQ-0108-148で規定されていた分類（4種）と乖離していた
- **発生局面**: 実装（PR #603 #598）→ 解決（PR #606 #600）
- **検知方法**: 自律検出（REQ-0108-148と実装のbaseline分類を比較して発見）
- **根本原因**: baseline作成時の分類が先行REQより細かく設計され、個別実装が先行したため
- **自律対応内容**: Wave 3（PR #606）のrule catalogで分類を拡張・統合し、REQ-0108-148に合致する形式へ調整した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（仕様内での整合性調整）
- **横展開観点**: baselineや個別ルール実装前に先行REQ定義を確認するプロセスが必要
- **再発条件**: baseline作成とREQ定義のタイミングずれ、実装先行による仕様逸脱
- **予防策候補**: baseline作成時にREQ定義との整合性チェックを実施、rule catalog化で分類を固定化
- **想定反映先**: agentdev-workflow-orchestrationのintegrity audit手順、baseline作成プロトコル
- **関連**: PR #603, PR #606, Issue #598, Issue #600, REQ-0108-148
- **タグ**: `#integrity` `#baseline` `#spec-drift` `#rule-catalog` `#self-corrected`
- **移動日**: 2026-06-06

---

## spec compliance sweep で直接矛盾リスト外の古い参照を検出

- **問題事象**: Issue #610 の「直接矛盾9件」リストに含まれていなかった `docs/specs/workflow-contracts.md` に `/agentdev/integrity-check` の古い参照が残存していた。case-run の spec compliance check で検出・修正した。
- **発生局面**: 実装（case-run）→ spec compliance check → 追加修正
- **検知方法**: case-run 中の spec compliance sweep（grep ベースの残存参照検査）で自律検出
- **根本原因**: Issue 作成時の直接矛盾リストが手動整理であり、`workflow-contracts.md` が見落とされていた。コマンド名変更の影響範囲を完全に網羅する機械的検証が実行前には存在しなかった
- **自律対応内容**: spec compliance check で検出後、`workflow-contracts.md` を追加更新（10件目の docs 更新として）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用上の知見）
- **横展開観点**: コマンド名変更・namespace移動を伴う実装では、Issue の直接矛盾リストだけでなく、機械的な全文検索（grep/ripgrep）を必ず実行すべき
- **再発条件**: 手動整理の影響範囲リストに依存し、機械的検証を省略した場合
- **予防策候補**: (1) case-run の spec compliance check を標準ステップとして位置づけ、(2) コマンド名変更・namespace移動の PR では必ず全文 grep を実行する guardrail を case-run に追加
- **想定反映先**: case-run コマンドの guardrails、agentdev-spec-compliance スキル
- **関連**: Issue #610, PR #611, `docs/specs/workflow-contracts.md`
- **タグ**: `#spec-compliance` `#grep-sweep` `#namespace-migration` `#self-corrected`
- **移動日**: 2026-06-06

---

## [2026-06-06] SKILL.md 行数超過 — agentdev-no-ai-slop-writing (542行)

- **問題事象**: `agentdev-no-ai-slop-writing` SKILL.md が 542 行で、500 行閾値を超過している。`references/` ディレクトリが存在し、内容の一部を抽出することで行数削減の余地がある。
- **発生局面**: integrity-check (F-002)
- **検知方法**: integrity-check 自動検出
- **根本原因**: スキル内容の蓄積により行数が閾値を超過
- **自律対応内容**: なし（検出のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 全スキルで発生し得る行数肥大化
- **再発条件**: スキル内容を継続的に追加・拡充する運用
- **予防策候補**: 内容を `references/` 配下に抽出し、SKILL.md 本体を 500 行以下に縮小する
- **想定反映先**: agentdev-no-ai-slop-writing スキル、agentdev-skill-authoring スキル
- **関連**: integrity-check F-002
- **タグ**: `#skill-size` `#integrity-check` `#document-drift`
- **移動日**: 2026-06-06

---

## [2026-06-06] USE FOR / DO NOT USE FOR の専用セクション不足（17/21スキル）

- **問題事象**: 21技能のうち 17 技能が `## USE FOR` / `## DO NOT USE FOR` を専用セクションとして持たず、frontmatter `description` フィールドに埋め込んでいる。専用セクションを持つのは 4 技能のみ（`agentdev-workflow-lifecycle`, `agentdev-workflow-routing`, `agentdev-workflow-templates`, `repo-agentdev-integrity`）。
- **発生局面**: integrity-check (F-003)
- **検知方法**: integrity-check 自動検出
- **根本原因**: 表記規約の不在。description 埋め込みと専用セクションのどちらを正とするか未決定
- **自律対応内容**: なし（検出のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 全スキルのフォーマット統一
- **再発条件**: 新規スキル作成時にフォーマット規約がない場合
- **予防策候補**: 表記規約を見直し、description 埋め込みと専用セクションのどちらを正とするか決定する
- **想定反映先**: agentdev-skill-authoring スキル、全スキル
- **関連**: integrity-check F-003
- **タグ**: `#skill-format` `#integrity-check` `#document-drift`
- **移動日**: 2026-06-06

---

## [2026-06-06] スクリプトエンコーディング破損が HEAD にコミットされている

- **問題事象**: 3本の整合性スクリプト（合計 ~148KB）が単一行化・エンコーディング破損した状態で HEAD にコミットされている。最終変更コミット e32b935 で発生。`bun` / `npx tsx` ともパース不能。
- **発生局面**: integrity-check (F-004)
- **検知方法**: integrity-check 自動検出
- **根本原因**: ビルド・コミットパイプラインで TypeScript ファイルの有効性チェックがない
- **自律対応内容**: なし（検出のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 全TypeScriptプロジェクトで発生し得る
- **再発条件**: コミットパイプラインでファイル有効性チェックがない場合
- **予防策候補**: ビルド・コミットパイプラインで TypeScript ファイルの有効性チェックを導入する。pre-commit hook での構文検証を検討する
- **想定反映先**: pre-commit hook、CI パイプライン
- **関連**: integrity-check F-004, コミット e32b935
- **タグ**: `#encoding` `#integrity-check` `#pre-commit` `#integrity-rule-gap`
- **移動日**: 2026-06-06

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
