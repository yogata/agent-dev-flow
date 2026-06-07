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

## Squash merge conflict resolution: W1→W2 間の check_integrity.ts 統合パターン

- **問題事象**: W1 PR #635（isLegacyExemptPath + stripInlineCode）と W2 PR #637（vocabulary-registry exempt + line-by-line + pathRefExemptPatterns）が共に check_integrity.ts を変更し、rebase 時に2箇所の競合が発生
- **発生局面**: case-close（PRマージ）
- **検知方法**: `gh pr merge --squash` 失敗 → rebase で競合検出
- **根本原因**: W1 と W2 が同じ関数（checkLegacyNamespace, checkExpandedLegacyNamespace）を異なるアプローチで改善。W1はモジュールレベル関数（isLegacyExemptPath, stripInlineCode）で全体を処理、W2は行単位（line-by-line + per-line exemption patterns）で処理
- **自律対応内容**: 両方の改善を統合する解決。isLegacyExemptPath で全体 exempt → line-by-line で行単位 → stripInlineCode で各行のインラインコード除外 → pathRefExemptPatterns/expandedPathRefExemptPatterns で行レベル exempt の多層防御構成
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 同一ファイルを複数Waveで変更する場合、先行Waveの改善パターンと後続Waveの改善パターンが直交することがある。統合時は「全体→行単位→除外」のレイヤー構造で両方を保持できる
- **再発条件**: 複数PRが同じ関数を異なる抽象レベル（全体処理 vs 行単位処理）で改善する場合
- **予防策候補**: Wave設計時にファイル変更の重複を検出し、重複がある場合は後続Waveの branch を先行Waveの branch に基づかせる
- **想定反映先**: workflow-orchestration のWave設計ガイダンス
- **関連**: Issue #628, #629, PR #635, #637, Epic #627
- **タグ**: `#squash-merge` `#conflict-resolution` `#wave-design` `#check_integrity`
- **移動日**: 2026-06-07

---

## Epic Orchestrator の Wave間変更漏れパターン

- **問題事象**: Epic Orchestrator による Wave 1（3子Issue並列）→ Wave 2（2子Issue並列）の実行後、最終コミット（dc32df0）で廃止コマンド名（intake-review, learning-refine, accepted/）の残存参照が残っていることを検知し、追加コミットで修正した
- **発生局面**: 実装
- **検知方法**: エージェントによる自律確認（最終コミット前の横断検索で残存参照を発見）
- **根本原因**: Wave 1 で各子Issueが独立して変更を行う際、他の子Issueの変更内容を踏まえた横断的な残存参照確認がWave間の境界で実行されなかった。各子Issueは自身のスコープ内の変更に集中し、全体の整合性確認がWave 2終了後まで遅延した
- **自律対応内容**: 最終コミット（dc32df0）で README.md、SKILL.md、workflow-lifecycle 等 6ファイルの残存参照を一括修正。内容は intake-review → intake-promote、learning-refine → learning-promote、accepted/ → inbox/ の置換
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（本質的には実行時の品質管理の話であり、ADR/REQ/specの定義には影響しない）
- **横展開観点**: 複数Wave構成のEpicで、後続Waveが先行Waveの変更を前提とする場合、各Wave終了時にスコープ横断的な残存参照検索を実行することで最終的な修正コミットを減らせる
- **再発条件**: 複数子Issueが同じファイル群を変更し、各子Issueが独立したスコープで参照更新を行う場合
- **予防策候補**: Wave完了時に「廃止対象キーワードの全文検索」を定型チェックとして組み込む。コマンド廃止系の変更では、廃止名をチェックリスト化してWave境界で検証する
- **想定反映先**: case-run の Wave完了時チェック手順、または workflow-orchestration スキルのWave境界検証ステップ
- **関連**: Issue #618, #619, PR #624, commit dc32df0
- **タグ**: `#epic-orchestrator` `#wave` `#残存参照` `#横断検証`
- **移動日**: 2026-06-07

---

## runtime template path の暗黙参照が誤用を招くパターン

- **問題事象**: case-close が Issueコメントテンプレートの参照先を skill 名だけで記述し、runtime path が不明確だったため、command-local templates 側に誤探索するバグが発生。また case-auto が委譲先コマンド定義を読み込む際、`src/opencode/...` を runtime path に読み替えていた
- **発生局面**: 実行（case-auto / case-close）
- **検知方法**: コードレビュー（ユーザー指摘）
- **根本原因**: command定義内のテンプレート参照が skill 名のみの暗黙参照であり、runtime path が明示されていなかった。ADR-0013/0018でruntime/authoring分離は規定されていたが、command定義でのパス記述粒度が不足していた
- **自律対応内容**: case-close Step 4にruntime path（`.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md`）を明示。case-autoにG11/G12 guardrail追加。artifact-contracts.mdにテンプレート種別別参照先テーブルを新設。REQ-0108に誤参照検出ルール（169-170）をAPPEND
- **ユーザー確認有無**: あり（Issue #625起票者が指摘）
- **ADR/REQ/spec影響**: artifact-contracts.md SPEC更新、REQ-0108 APPEND
- **横展開観点**: 他のcommand定義でもテンプレート参照が暗黙的になっていないか確認が必要
- **再発条件**: command定義がテンプレート参照をskill名のみで記述し、runtime pathを明示しない場合
- **予防策候補**: command定義のテンプレート参照は必ずruntime path（`.opencode/...`）を明示する。integrity-check（REQ-0108-169/170）でruntime path誤参照を検出
- **想定反映先**: agentdev-command-authoring の品質基準
- **関連**: Issue #625, PR #626
- **タグ**: `#runtime-path` `#template-resolution` `#command-definition` `#暗黙参照`
- **移動日**: 2026-06-07

---
