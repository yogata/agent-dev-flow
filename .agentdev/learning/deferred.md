# 学び deferred pool（生きている learning プール）

未処理・保留中・再評価対象の learning item を保持する多状態の生きている learning プール（SHALL）。deferred（11廃棄判定カテゴリの1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する（AG-005）。
learning-capture によって inbox.md に追記されたエントリが、learning-promote の処分判定や prune によって動的に変化する。

終端保管ではなく、次回 `/agentdev/learning-promote` 実行時に再評価の対象となる。処分済みの learning item は prune 対象となる。昇格対象の根拠は staging スタブに残す。

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
- **移動日**: YYYY-MM-DD（learning-promote 実行日）

---
```

## 旧フォーマット互換

過去のエントリ（5項目形式: 事象/原因/対策/関連/タグ）は learning-promote 実行時に正規化される。

正規化マッピング:
- 状況/事象 → 問題事象
- 原因 → 根本原因
- 解決策/対策/教訓 → 自律対応内容（解決策・対策）/ 予防策候補（教訓）

## Prune ポリシー

deferred.md は append-only ではなく、以下のタイミングでエントリが削除される:
- **promote 内部分析フェーズ時 prune**（MAY）: 長期間再発していない単発レアケース。ただし判断基準・技術知識・プロジェクト固有知識を含む learning item は削除不可
- **promote 時 prune**（SHALL）: staged / rejected / duplicate の learning item。deferred/未処理/再評価対象の learning item は削除不可（REQ-0147-007）

**注意**: learning-refine は廃止済み（REQ-0105-051）。refine 機能は learning-promote に統合されている。

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

## 2026-06-18: gate hook の strict/heuristic 区別は --strict-only flag で解決する（global exit code 変更禁止）

**状況**: Issue #899 の Delta Guard / Impact Guard 実装で、`check_integrity.ts` の exit code が strict 違反（block）と heuristic 違反（warning）を区別できない問題に直面した。`determineExitCode()` は ng と warning の両方で EXIT_NG(1) を返すため、heuristic 違反でも commit/push が block されてしまう。global な `determineExitCode()` の挙動を変更すると full-audit mode の既存テストが壊れるリスクがあった。

**学び**: gate hook で strict/heuristic を区別する必要がある場合、global exit code semantics を変更せず、`--strict-only` flag を追加して `determineExitCodeStrict()` を実装すること。これにより既存の full-audit 呼び出しは影響を受けず、gate hook のみが strict-only モードで動作する。併せて `classifyResult()` が `finding_level` を未設定のまま残す既存不具合も root-cause fix した（`--strict-only` の前提となるため）。

**再発防止**: exit code の strict/heuristic 区別が必要な場面では、呼び出し元が flag で挙動を切り替えられるようにする。global な関数の挙動を変更すると影響範囲が予測不能なため、flag-based の opt-in アプローチを優先する。
- **移動日**: 2026-06-21
- **処分判定**: deferred（PR #912 で実装後、commit a27a8e56「3層ゲート・本体運用自動化を取り下げ汎用仕組みのみに縮小」で削除。現行 integrity-check 方針と整合せず別途議論が必要）

---

---

## import.meta.main ガードパターン（bun）

- **問題事象**: check_integrity.ts の main() がモジュール末尾で無条件実行されており、テストファイルからの import 時に副作用（スクリプト実行）が発生していた。
- **発生局面**: 実装（テストファイルからの import 時）
- **検知方法**: テスト実行時の副作用検出
- **根本原因**: main() の無条件実行（import.meta.main ガード未使用）
- **自律対応内容**: なし（観察記録）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: bun のエントリポイント判定パターンとして他のスクリプトでも推奨候補
- **再発条件**: 新規スクリプト作成時に import.meta.main ガードを使用しない場合
- **予防策候補**: bun の import.meta.main を用いたガードはエントリポイント判定の標準パターンとして推奨。新規スクリプト作成時のデフォルトパターン化を検討すべきか。
- **想定反映先**: AGENTS.md または programming skill
- **関連**: PR #976
- **タグ**: #bun #import.meta.main #entry-point-guard
- **移動日**: 2026-06-22
- **処分判定**: deferred（汎用的なbun/TypeScriptパターン。AgentDevFlowの枠組みでは扱いにくい。情報断片的）

---

## 2026-06-22 Epic #1028 Wave 1 close

### L-001: check_integrity.ts 検出ルール追加時の fixture/categoryMap ペア更新

- **問題事象**: check_integrity.ts の新規検出ルール追加時、テスト fixture と categoryToCheckPattern map の更新がペアで行われないと乖離が発生する
- **発生局面**: 実装（integrity 検出ルールの新規追加・変更時）
- **検知方法**: copyScripts + drift detection テストの自動検出
- **根本原因**: 検出ルール追加時の fixture/categoryMap ペア更新漏れ
- **自律対応内容**: copyScripts + drift detection テストが乖離を自動検出する仕組みが有効
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: integrity 検出ルールの新規追加・変更時
- **再発条件**: check_integrity.ts の検出ルール追加時に fixture/categoryMap のペア更新を省略した場合
- **予防策候補**: copyScripts + drift detection テストによる自動検出（既存・機能中）
- **想定反映先**: なし（自動検出仕組みが既存）
- **関連**: PR #1035 (#1029 / REQ-0144)
- **タグ**: `#check_integrity` `#fixture` `#categoryMap` `#test-pair`
- **移動日**: 2026-06-25
- **処分判定**: deferred（copyScripts + drift detection で自動検出済。運用徹底レベルの知見、新規対策不要）

---

### L-002: HITL 境界精密化パターンの汎用性

- **問題事象**: HITL 境界の精密化パターン（判断確定→自動実行・破壊的変更は別承認）の汎用性
- **発生局面**: HITL 境界設計全般
- **検知方法**: 設計レビュー
- **根本原因**: HITL 境界パターンが promote/review 系以外に明示されていない
- **自律対応内容**: REQ-0147 で promote 系に実装
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: REQ-0147（promote 系に実装済み）
- **横展開観点**: case-close 等の他コマンドにも適用可能な汎用パターン
- **再発条件**: HITL 境界を設計する新規コマンド追加時
- **予防策候補**: 別途整備候補（具体性・出現回数ともに不足）
- **想定反映先**: 検討候補
- **関連**: PR #1033 (#1031 / REQ-0147)
- **タグ**: `#hitl` `#boundary` `#precision` `#generalization`
- **移動日**: 2026-06-25
- **処分判定**: deferred（promote 系以外への汎用化は候補止まり。具体性不足）

---

### L-004: docs 系 Issue で case-run task() 委譲不可時に adapter skill フォールバックパスが有効

- **問題事象**: docs 系（REQ/ADR ファイル検証・カタログ参照追加）の Issue で、case-run の Sisyphus-Junior への task() 委譲がハーネス制約で利用不可になる場合がある
- **発生局面**: 実装（case-run で docs 系 Issue を扱い task() 委譲が利用不可の場合）
- **検知方法**: task() 起動失敗のハーネス応答
- **根本原因**: ハーネスのツール制約で task() による別サブエージェント起動が不可
- **自律対応内容**: `agentdev-case-run-execution-adapter` スキルの「task() 起動失敗時事後処理（Item 5）」パス（手動修正または PR 化）に従い、検証とカタログ更新を直接実施して PR 化
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（adapter skill のフォールバックパス適用範囲内）
- **横展開観点**: task() 委譲がハーネス制約で不可な環境では adapter skill フォールバックパスで完結できる
- **再発条件**: task() ツールを提供しないハーネス環境で case-run を実行する場合
- **予防策候補**: adapter skill のフォールバック判断基準の運用実証
- **想定反映先**: agentdev-case-run-execution-adapter
- **関連**: PR #1068 (#1061 / REQ-0148 + ADR-0129)
- **タグ**: `#case-run` `#task-delegation` `#adapter-skill` `#fallback` `#docs-issue`
- **移動日**: 2026-06-25
- **処分判定**: deferred（adapter skill L131-148 が task() 起動失敗時フォールバックを完全カバー。L-010 とともに既存設計の妥当性実証記録。事前 probe 強化のみ未成熟）

---

### L-006: 並列機械的テキスト置換 OU の Wave 実行で文字レベルマージが必要になる

- **問題事象**: 異なる文字種（中黒・em-dash・LLM表現・一文一行）の機械的置換を並列 Wave で実行した場合、同一行に複数種の変更が及ぶと行レベルの git merge が必ず競合する
- **発生局面**: 実装（複数の機械的テキスト置換 OU を並列 Wave で実行する場合）
- **検知方法**: git merge 競合の発生
- **根本原因**: 異なる文字種の置換を同一 Wave で並列実行すると同一行に複数種の変更が及ぶ
- **自律対応内容**: `git apply --3way` で 3-way マージを試行後、残った競合マーカーを Python スクリプトで文字レベル結合（SequenceMatcher）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 異なる文字種の置換を同一 Wave で並列実行する場合の競合解消コストの見積もり
- **再発条件**: 機械的テキスト置換を並列 Wave で実行し、同一行に複数種の変更が及ぶ場合
- **予防策候補**: 文字レベルマージツールの事前準備
- **想定反映先**: agentdev-workflow-orchestration（Wave 設計ガイダンス）
- **関連**: PR #1088/#1089/#1090/#1091 (#1078/#1076/#1079/#1080 / OU-001〜004)
- **タグ**: `#mechanical-replacement` `#parallel-wave` `#merge-conflict` `#character-level-merge`
- **移動日**: 2026-06-25
- **処分判定**: deferred（文字レベルマージツール未標準化・出現1件。専用ツール整備が前提）

---

### L-007: REQ の手続き列挙に中核操作（PR 作成）が抜けていた場合の SPEC 拡張判断

- **問題事象**: REQ-0149-002 は agentdev-gh-cli の8手続きを列挙したが「PR 作成」が含まれていなかった
- **発生局面**: 実装（REQ で手続き・API・コマンド等を列挙定義した場合）
- **検知方法**: 実装中の REQ 整合確認
- **根本原因**: 要件定義で「列挙」を明示した場合、実装上必須の中核操作が漏れることがある
- **自律対応内容**: SPEC 拡張として「PR 作成」を追加（9手続き）し、REQ-0149-002 本体への追記は別途検討。SPEC 拡張で即時対応しつつ REQ 更新を後続工程に委ねる二段階判断
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: SPEC（standard-procedures）に「PR 作成」追加
- **横展開観点**: 実装で中核操作の欠落に気づいた際、SPEC 拡張で即時対応しつつ REQ 更新を後続工程に委ねる判断基準
- **再発条件**: REQ で手続き・API・コマンド等を列挙定義し、実装上必須の中核操作が漏れた場合
- **予防策候補**: 二段階判断フロー（SPEC 拡張で即時対応 + REQ 更新は後続 req-save で処理）
- **想定反映先**: req-define, req-save
- **関連**: PR #1098 (#1094 / REQ-0149 + ADR-0130)
- **タグ**: `#req` `#enumeration` `#core-operation` `#spec-extension` `#two-stage-judgment`
- **移動日**: 2026-06-25
- **処分判定**: deferred（出現1件・手順化困難。個別判断で対応可能）

---

### L-010: ハーネス制約で task() 委譲不可時に同一エージェント統合実行が有効（adapter protocol 準拠）

- **問題事象**: case-run orchestration（worktree 準備・Step 1-5 相当）と Sisyphus-Junior 実装実行を別エージェントへ task() 委譲しようとしたが、ハーネスのツール制約で task() による別 Sisyphus-Junior 起動が不可だった
- **発生局面**: 実装（case-run の実行担当サブエージェント起動ステップ）
- **検知方法**: task() 起動失敗のハーネス応答
- **根本原因**: 当該ハーネス実行環境では task() ツールが提供されておらず、別サブエージェント起動経路が存在しない
- **自律対応内容**: case-run orchestration と実装実行を同一エージェント（case-run 起動元の Sisyphus-Junior）が統合実施。adapter protocol（証拠ベース実装・品質ゲート・PR 作成・worktree 隔離・Findings 配置）には従い、委譲先が不在でもプロトコル要件を満たす形で完結
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。adapter protocol（agentdev-case-run-execution-adapter）のフォールバックパス適用範囲内。L-004 と同根の知見だが本件は docs 系に限らず task() 不可時の汎用パターンとして再実証
- **横展開観点**: task() 委譲がハーネス制約で不可な環境では、起動元エージェントが orchestration + 実装を統合実行する経路を標準的に取る
- **再発条件**: task() ツールを提供しないハーネス環境（またはツール権限で task() が無効化された環境）で case-run を実行する場合
- **予防策候補**: case-run の driver 起動ステップで task() 可否を事前 probe し、不可の場合は起動元統合実行へ自動切替するプロトコル記述を adapter skill に明記
- **想定反映先**: agentdev-case-run-execution-adapter（task() 起動失敗時事後処理セクションの拡充）、agentdev-workflow-orchestration references（委譲可否 probe 手順）
- **関連**: PR #1103 (#1102)、L-004 (PR #1068)、agentdev-case-run-execution-adapter SKILL.md
- **タグ**: `#case-run` `#task-delegation` `#adapter-protocol` `#harness-constraint`
- **移動日**: 2026-06-25
- **処分判定**: deferred（adapter skill L131-148 が task() 起動失敗時フォールバックを完全カバー。L-004 とともに既存設計の妥当性実証記録。事前 probe 強化のみ未成熟）

---

### L-011: 作成時ゲート vs 事後機械検出 の責務分担（二重安全網の許容）

- **問題事象**: IR-036（accepted ADR の作業手段主題検出）は `baseline_status: new` かつ未実装だが、その検出対象は req-define の ADR 作成可否ゲート（REQ-0101-047/048/049）と重複する
- **発生局面**: 検出ルール設計（既存の作成時ゲートと同じ主題を事後機械検出でも扱うか否かを判断する場合）
- **検知方法**: 設計レビュー
- **根本原因**: なし（設計上の冗長性の許容判断）
- **自律対応内容**: なし（設計指針の観察記録）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: SPEC 設計で「作成時ゲート」と「事後機械検出」を重複して持つことは、片方の逸脱をもう片方で拾う冗長性として許容・有効な場合がある
- **再発条件**: 検出ルール設計で、既存の作成時ゲートと同じ主題を事後機械検出でも扱うか否かを判断する場合
- **予防策候補**: 両者の責務を明示的に分離（ゲート=阻止、機械検出=検知のみ）しておけば、実装順序やカバレッジ差を許容できる
- **想定反映先**: なし（対策既存・観察記録）
- **関連**: PR #1108 (#1105 / docs-check / command file format SPEC)
- **タグ**: `#creation-gate` `#post-detection` `#dual-safety-net` `#redundancy`
- **移動日**: 2026-06-25
- **処分判定**: deferred（REQ-0101-047/048/049 ゲート + IR-036 機械検出の二重構造が既存。冗長性許容の設計指針の観察記録、新規対策不要）


---

## 複合ラベルの duty keyword 是正では読点（、）ではなく中黒（・）を使用する

- **問題事象**: case-close.md G21 の capture 責務 duty keyword「回収・保存」が読点表記「回収、保存」になっており、check_integrity.ts の `duties["case-close.md"].dutyKeyword`（値: `回収・保存`）と不一致のため command-capture-duty NG が報告されていた。文書是正で読点（、）を中黒（・）に修正して解消した。
- **発生局面**: 実装（case-run での文書是正）
- **検知方法**: check_integrity.ts の command-capture-duty ルールによる検出。NG メッセージから該当 duty keyword と期待値を特定。
- **根本原因**: 複合ラベル（複数の責務を1語で表す duty keyword）の区切り文字が読点と中黒のどちらかについて、文書作成時に規定が曖昧だった。check_integrity.ts 側は中黒（`・`）を期待しているが、case-close.md 本文は読点（`、`）を使用していた。日本語の複合語区切りには読点と中黒の両方が使われ得るため、機械的検出と文書表記の不一致が生じた。
- **自律対応内容**: case-close.md G21 の「回収、保存」を「回収・保存」に修正（中黒化）。check_integrity.ts の dutyKeyword 期待値と完全一致させることで NG を解消。PR 本文で「回収・保存」は capture 責務の複合ラベルであり、流動的並列（OU-001 読点化対象）ではないことを明記した。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。check_integrity.ts の dutyKeyword 定義が正（single source of truth）であり、文書側を是正するのが正しい方向。
- **横展開観点**: 他のコマンド（case-run, req-save 等の G21相当箇所）でも duty keyword が複合ラベルの場合、中黒表記を使用すべき。読点は「流動的並列」（プロセス段階の列挙等）に使い、中黒は「複合ラベル」（1語として固定の責務名）に使うという使い分け規約を文書化すると再発防止になる。
- **再発条件**: 複合ラベル duty keyword を読点区切りで文書に記載し、check_integrity.ts が中黒を期待している場合。
- **予防策候補**: (a) duty keyword の区切り文字規約（読点=流動的並列、中黒=複合ラベル）を `integrity-rule-catalog.md` または `japanese-tech-writing` スキルに明文化する、(b) 新規コマンド追加時に duty keyword を check_integrity.ts と文書で同時設定するチェックリストを設ける。
- **想定反映先**: `integrity-rule-catalog.md`（duty keyword 区切り文字規約）、`japanese-tech-writing` スキル（複合ラベルの中黒使用）
- **関連**: Issue #1145, PR #1147, `src/opencode/commands/agentdev/case-close.md` G21, `scripts/check_integrity.ts` dutyKeyword 定義
- **タグ**: `#docs-check` `#duty-keyword` `#文書是正` `#中黒` `#複合ラベル`
- **移動日**: 2026-06-27
- **処分判定**: deferred（出現1件。duty keyword NG 再発時に具体化して昇華を再評価）

---

## PR #1122 の「X-6 = 0 件」宣言が再 grep 確認不備で 5 件残存していた

- **問題事象**: PR #1122 は X-6（「において」）について「7 ディレクトリ完全対応、残存 0 件」と宣言してマージされたが、PR #1163 の inspect-docs 再実行カタログで 5 件の残存を検出した。コミットログ照合の結果、5 件中 4 件（REQ-0102.md L83、req-define.md SPEC L81、spec-save.md SPEC L50、spec-save.md command L169）は PR #1122 以前から存在し、1 件（backticks-identifier-threshold.md L12）は spec-save コミット 465d9047（2026-06-25、PR #1122 merge 後）で新規発生。PR #1122 の完了宣言は不正確だった。
- **発生局面**: レビュー（OU-003 inspect-docs 再実行による裏付けカタログ生成）
- **検知方法**: PR #1163 の inspect-docs 機械判定アルゴリズム（`mechanical-replacement-rules.md`）による「において」の grep 再実行。検出件数と PR #1122 宣言値（0 件）の突き合わせ。
- **根本原因**: `mechanical-replacement-rules.md`「再現性の担保」節 Step 3-4（再 grep 0 件確認、REQ-0153 で必須化済み）が PR #1122 の完了宣言時に実行されなかった可能性。PR 完了宣言と機械的検証の連動が機能しなかった。
- **自律対応内容**: PR #1163 の Findings セクションに 5 件の残存（4 件 PR #1122 以前由来 + 1 件以後由来）をコミットログ照合で裏付け付きで記録し、AG-010 是正時に 5 件すべてを機械置換（`において`→`で`）で対応するよう明記した。本 case-close では intake F-1 としても分離回収。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。REQ-0153 で「再 grep 0 件確認」はすでに必須化済み。本件は REQ-0153 適用の運用徹底を要する事例であり、SPEC/REQ の新規改廃を要さない。
- **横展開観点**: 機械横断修正を伴う PR の完了宣言時には、`mechanical-replacement-rules.md` Step 3-4 の再 grep 0 件確認を case-run/case-close のどちらかで必ず実行し、PR 本文 Findings に 0 件確認結果を記録する運用の徹底が必要。case-close の QG-3/QG-4 検査項目に「再 grep 結果の記録」を組み込む拡張が有効。
- **再発条件**: 機械横断置換を伴う PR で、`mechanical-replacement-rules.md` Step 3-4（再 grep 0 件確認）を省略して完了宣言した場合。
- **予防策候補**: (a) case-close QG-4 の test strategy 処理完了確認に「機械横断置換を伴う PR は再 grep 0 件確認結果を Findings に記録すること」を検査項目として追加する、(b) `mechanical-replacement-rules.md` Step 3-4 を case-run の test-fix ループに組み込み PR 本文に自動記録する仕組みを設ける。
- **想定反映先**: `agentdev-quality-gates`（QG-4 検査項目拡充）、`agentdev-doc-writing`（`mechanical-replacement-rules.md` Step 3-4 の case-run 連動）
- **関連**: Issue #1162, PR #1163, PR #1122, 既知 L-012（再 grep 0 件確認）を補強する追加事例、REQ-0153、commit 465d9047、`src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`
- **タグ**: `#inspect-docs` `#機械横断修正` `#完了宣言` `#再grep確認` `#宣言不一致`
- **移動日**: 2026-06-27
- **処分判定**: deferred（REQ-0153 で再 grep 0件確認は既に必須化済み。application miss・運用徹底レベル）

---

## SUB-D 網羅検証で gloss 形式 `日本語（英語）` を「推奨訳語置換済」と扱う判定規則

- **問題事象**: `integrity-rule-catalog.md` の SUB-D 網羅検証（OU-005 #1167）で `baseline`, `provider`, `variant`, `fixture` 候補語を grep 抽出した際、`基準（baseline）`、`種別パス（variant path）`、`有効なテストデータ（valid fixture）` 等、日本語主語 + 英語 gloss 形式のインスタンスが多数出現した。これらを「未置換の散文普通名詞」と誤認し再置換すると、gloss 情報の欠落、重複、または PR #1084 前例との不整合を生じる。
- **発生局面**: 実装（SUB-D per-instance 判定フェーズ）
- **検知方法**: PR #1084 `valid fixture→有効なテストデータ（valid fixture）` 前例出力形式と照合し、gloss 形式が既に PR #1084 出力形式と合致することを確認。判定結果を PR #1177 本文の per-instance 判定表に明記。
- **根本原因**: SUB-D 網羅検証は候補語の bare 英語出現を grep で抽出するため、`日本語（英語）` 形式も候補に含まれる。これを「未置換」と扱うか「推奨訳語置換済」と扱うかの判定規則が明文化されておらず、運用者の判断に委ねられやすいため。
- **自律対応内容**: gloss 形式 `日本語（英語）` を「推奨訳語置換済」として再置換対象外に分類。gloss は識別子（`baseline.json`、`baseline_status`、artifact list 値等）へのクロスリファレンス機能を保持するため英語括弧を維持したまま日本語を主語とする形式を尊重。PR #1177 で再置換対象外とした 8 インスタンス（L279/282/291/427/431/775/915/1210、うち L1210 は PR #1084 由来）に本規則を適用。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。`docs/specs/backticks-identifier-threshold.md`（#1164 accepted）は gloss 形式を明示的に扱っていないが、機械判定閾値（backtick 必須/任意）とは独立した運用規則であり、SPEC 本文の改廃を要さない。
- **横展開観点**: 他 SPEC ファイル（`mechanical-replacement-rules.md`、`runtime-package-boundary.md` 等）や `docs/specs/` 全般で SUB-D 検証を実施する場合に同規則を適用可能。`document-type-responsibilities.md` 訳語表の全エントリを網羅対象とする独立 OU（intake inbox 参照）でも適用対象。
- **再発条件**: SUB-D 網羅検証で候補語 grep を実行し、`日本語（英語）` gloss 形式インスタンスが含まれる場合。
- **予防策候補**: SUB-D 検証手順（`docs/specs/backticks-identifier-threshold.md` 適用ガイド等）に「gloss 形式 `日本語（英語）` は『推奨訳語置換済』として再置換対象外とする」旨の運用規則を明文化する。
- **想定反映先**: `docs/specs/backticks-identifier-threshold.md`（境界ケース実例の追記、case-close Step 3-2 (c) 見送り候補として既記録）、または新規 SPEC（表記是正運用規則集）の検討
- **関連**: Issue #1167, PR #1177, PR #1084（前例）, `docs/specs/integrity-rule-catalog.md` L279/282/291/427/431/775/915/1210, `docs/specs/backticks-identifier-threshold.md`
- **タグ**: `#sub-d` `#表記是正` `#backticks` `#gloss` `#translation`
- **移動日**: 2026-06-27
- **処分判定**: deferred（出現1件・SUB-D 検証の境界ケース。gloss 誤置換再発時に具体化）

---

## case-open の direct scope 外明記と Issue 完了条件の表現が乖離し QG-4 で調整が必要になった

- **問題事象**: RU-0002（REQ-0156）の case-open で case_open_hints に「既存SPECの段階移送（inspect/backlog 経由）は別 Issue / 別 Wave（direct scope 外）」と明記したが、Issue #1212 の完了条件 REQ-0156-005/006/008 は「移送が段階的かつ個別に行われていること」「参照先が移送単位で更新されていること」「integrity/rules/ サブディレクトリが存在し」と構造の存在を要求する表現のまま残存した。case-close（QG-4）で完了条件を評価する際、direct scope 外要件が未達として検出される潜在的乖離が生じた。
- **発生局面**: 完了処理（case-close Step 2 QG-4 完了条件評価）
- **検知方法**: case-run 工程3 の PR 本文 Findings F-001 として記録。case-close で完了条件 [x] 化の際に方針解釈が必要なことが顕在化。
- **根本原因**: case-open の case_open_hints は direct scope 外を明記するが、Issue 完了条件（REQ から機械生成）は direct scope 外要件を除外せず、構造存在要求の表現を維持する。case_open_hints と Issue 完了条件の間に同期仕組みがない。
- **自律対応内容**: 親エージェントが解決方針を確定（REQ-0156-005/006/008 の本来の意図は「SPEC 規範化（方針記載）」であり、実際の移送・分割は別 Issue）。case-close で「方針が SPEC に記載されていること」を達成基準として [x] 化し、follow-up Issue #1214 を作成して実移送・分割を参照。
- **ユーザー確認有無**: あり（親エージェントが解決方針を確定）
- **ADR/REQ/spec影響**: なし。case-open/case-auto の手続き上の留意点であり、SPEC/REQ/ADR の新規改廃を要さない。
- **横展開観点**: case-open で direct scope 外要件を完了条件に含める場合、完了条件を達成可能な表現（方針記載等）に調整すべき。または case-open が direct scope 外要件を明示的に完了条件から除外する運用。case-auto で case_open_hints と完了条件の整合性をチェックする仕組みが有効。
- **再発条件**: case-open で direct scope 外要件を完了条件に含め、完了条件が構造存在要求の表現のまま残存する場合。
- **予防策候補**: (a) case-open で direct scope 外要件の完了条件を「方針記載」等の達成可能な表現に調整する、(b) case-auto で case_open_hints と完了条件の整合性をチェックするステップを追加する。
- **想定反映先**: `case-open` コマンド（完了条件調整）、`case-auto` コマンド（整合性チェック）
- **関連**: Issue #1212, PR #1213, follow-up Issue #1214, RU-0002 case_open_hints
- **タグ**: `#case-open` `#case-auto` `#direct-scope` `#完了条件` `#整合性`
- **移動日**: 2026-06-27
- **処分判定**: deferred（出現1件・中スコア。case-open/case-auto 整合性チェックは再発時に具体化）

---

## Epic 分解時に既存 Issue/PR とのスコープ完全重複を検知できず空コミット PR に終始した

- **問題事象**: Epic #1231（docs 機械判定表記是正）の子 Issue #1239（OU-001-8: IR-025〜051 regression_test 表記統一）の作業対象が、並行して進行していた別 Issue #1240（doc-structural-cleanup、AG-005: IR 表記統一）の PR #1240 で完全に処理済みだった。case-run は重複を検知して PR #1247 を空コミットとし、Findings に「既処理（DEFERRED）」と記録して PR #1240/#1246 のマージで完了条件を満たす構成とした。結果として #1239 の case-open/case-run/case-close リソースが空コミット PR に消費され、8子 Issue 中1つが実質作業なしとなった。
- **発生局面**: 完了処理（case-close(#epic) Wave 2 close 時の Capture 回収で顕在化）
- **検知方法**: PR #1247 本文の Findings セクション「重複作業の回避（既処理）」記載と、Epic #1231 ステータステーブル上の #1239 行が `pending → completed ([PR#1247])` に遷移したが PR #1247 は files 差分0件（空コミット）であることの突合。
- **根本原因**: Epic #1231 の case-open でのディレクトリ単位8分割（OU-001-1〜8）時に、既存 OPEN Issue #1240（doc-structural-cleanup）の AG-005 スコープ（IR 表記統一）と OU-001-8 のスコープが完全一致することを検知しなかった。両者は AG（acceptance goal）粒度で同じ「IR regression_test 表記統一」を対象としていたが、Epic 分解はディレクトリ/ファイル単位で行い、既存 Issue の AG 単位との照合をスキップした。
- **自律対応内容**: case-run（#1239 担当）は task hint「既に処理済みの場合はスキップし、PR 本文の Findings に『既処理』と記録」に従い空コミット PR #1247 を作成。case-close(#epic) Wave 2 close では #1239 を `completed ([PR#1247])` として扱い、AG-005 は PR #1240/#1246（merge 0b6e6428）で満たされたことを VERIFY の上で Epic 完了判定に組み込んだ。本 learning と intake（`2026-06-27-epic1231-wave2-issue1239-pr1240-scope-overlap.md`）に記録。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。本件は case-open の Epic 分解手順の運用上の改善余地であり、現行 SPEC（`docs/specs/commands/case-open.md`）に既存 Issue との AG 粒度照合手順は規定なし。
- **横展開観点**: 横断是正 Epic（ディレクトリ/パターン単位分割）と、doc-structural-cleanup のような横断 Issue（AG 単位で複数パターンを束ねる）が並行運用される場合、スコープ重複が構造的に発生し得る。両者の分解軸（ディレクトリ vs AG）が直交しないため。
- **再発条件**: 横断是正 Epic を case-open でディレクトリ単位分割する際、同一リポジトリに doc-structural-cleanup 系の横断 Issue が OPEN/進行中で、かつその AG が Epic 子 Issue の OU と同じ対象（ファイル群 or パターン）を含む場合。
- **予防策候補**: (a) case-open の Epic 分解フローで、既存 OPEN Issue の AG/対象ファイル群と分解候補 OU の照合ステップを追加する、(b) doc-structural-cleanup Issue と並行する横断是正 Epic を起票する場合、両者のスコープ境界を事前に合意（CR）する運用を SPEC に明文化する。
- **想定反映先**: `case-open` コマンド（Epic 分解ロジック、既存 Issue 照合）、`docs/specs/commands/case-open.md`（分解 SPEC）
- **関連**: Epic #1231、Issue #1239/#1240、PR #1247/#1240/#1246、`docs/specs/commands/case-open.md`、`docs/specs/commands/case-auto.md`
- **タグ**: `#case-open` `#epic-decomposition` `#scope-overlap` `#cross-epic` `#横断是正`
- **移動日**: 2026-06-27
- **処分判定**: deferred（出現1件・特定シナリオ。横断是正 Epic と横断 Issue 並行再発時に具体化）

---

## 学び: docs_chore + `artifact: spec` の場合の case-run/spec-save 境界（PR が作成できない）

- **問題事象**: `work_type: docs_chore` で SPEC ファイルそのものが実装成果物（`artifact: spec`）のケースでは、spec-save が SPEC 変更を直接 main へコミットする。このため case-run は作業ブランチを作成しても main との差分が空（empty diff）となり、意味ある PR を作成できない。結果として case-close は「PR マージ → 子Issue クローズ」の標準フローから外れ、「PR なし・変更は main 上にある」というエッジケースとして子Issue を直接クローズする運用になった。
- **発生局面**: case-run（実装フェーズ、Step 5-6: 実装とPR作成）、case-close（Step E3: PR作成済み子Issue 特定、Step E4: PRマージ）
- **検知方法**: Epic #1301 Wave 1 の case-close 実行時。子Issue #1302〜#1307 は case-run で受け入れ基準 TS-001〜TS-006 を PASS（verify-complete）したが、紐づく PR が一つも存在しなかった。コミット 7f9e3472 で SPEC 変更が既に main にあることを確認して境界事象と判定。
- **根本原因**: spec-save と case-run の責務境界設計。spec-save は SPEC ファイルを直接 main にコミットするが、case-run はブランチ + PR モデルを前提としている。`docs_chore` + `artifact: spec` の組み合わせでは、両者が競合し case-run の出力（PR）が空になる。設計上、artifact 種別に応じた PR 要否判定が case-run/case-open に存在しない。
- **自律対応内容**: case-close で PR マージステップをスキップし、子Issue を直接クローズする運用で対応。各子Issue の close comment で「SPEC 変更は main commit 7f9e3472 で適用済み、PR は作成されていない（docs_chore + spec-save ワークフロー）」と理由を明示。
- **ユーザー確認の有無**: あり（タスク指示で「PR は存在しない、変更は main 上にある」という境界条件が明示指定された）。
- **ADR/REQ/spec影響**: あり。case-run SPEC、case-close SPEC、spec-save SPEC、REQ-0130（case-run）、REQ-0131（case-close）で「artifact 種別に応じた PR 要否」の境界仕様を見直す候補。
- **横展開観点**: docs_chore 以外で spec-save が main に直接コミットする全ケース。将来 artifact 種別が拡張された場合（`artifact: adr` 等）にも同様の境界が発生する可能性。
- **再発条件**: `work_type: docs_chore`（または maintenance）で `artifact: spec` を指定し、spec-save → case-run → case-close と進めた時。
- **予防策候補**: (a) case-run に「artifact 種別に応じた PR 要否判定」を組み込み、spec の場合は PR スキップを自動判定する。(b) case-open 時に work_type + artifact から PR 不要フラグを設定し、case-run/case-close がそれに従う。(c) case-close に「PR なしクローズ」の明示手順を追加し、エッジケースを正規ルートとして文書化する。
- **想定反映先**: SPEC `docs/specs/commands/case-run.md`（PR 作成要否判定）、SPEC `docs/specs/commands/case-close.md` Step E3/E4（PR なしクローズ手順）、SPEC `docs/specs/commands/spec-save.md`（commit 直接適用時の case-run 連携）、REQ-0130、REQ-0131。
- **関連**: Epic #1301、子Issue #1302〜#1307、SPEC 変更 main commit 7f9e3472。実行日時 2026-06-27。
- **タグ**: `#case-run` `#spec-save` `#docs-chore` `#edge-case` `#boundary` `#pr-less-close`
- **移動日**: 2026-07-03
- **処分判定**: deferred（出現1件。完全な責務境界再設計(a/b)は費用対効果低、現状は「PR なしクローズ運用」で回避済み。最小手順(c)は有望だが単独昇華には具体性不足。docs_chore + spec-save 再発時または artifact 種別拡張時に再評価）

---

## 学び: REQ スキーマ要件の記述が per-entry / top-level の区別を曖昧にし、実装と解釈が分岐した

- **問題事象**: REQ-0156-011「各エントリは old、new、severity、scope（include、exclude）を持つこと」という記述が `scope` を per-entry フィールドのように読ませる一方、実装（`docs/specs/integrity/obsolete-path-map.yaml` と IR-057 rule file、`check_integrity.ts`）は `scope` を top-level 共有フィールドとして扱っている。両者の解釈が分岐しており、REQ 文面だけを読むとエントリごとに `scope` を書くべきだと誤読する可能性があった。
- **発生局面**: 要件定義（REQ-0156 APPEND、REQ-0156-011 の解釈）、実装検証（TS-001 Verify-1 完了条件 #2「REQ-0156-011 の要件が実際のエントリと整合していることを検証する」）。
- **検知方法**: OU-003 PR 本文の TS-001 Verify-1 で22 entries を照合した際、実装は top-level `scope` であることと REQ 文面の「各エントリは ... scope ... を持つ」が食い違うことを確認。yaml ヘッダコメントで運用上の曖昧性を除去。
- **根本原因**: REQ のスキーマ定義で「ファイル全体が持つフィールド」と「各エントリが持つフィールド」の階層区別が明示されていなかった。REQ-0156-011 のみでなく、スキーマ系要件全般で「所有者（file / entry / 別の場所）」を明記しないと実装時の解釈が分かれ得る。
- **自律対応内容**: (a) 本 PR (#1360) で yaml ヘッダコメントに「ファイル構成（REQ-0156-011 スキーマ）」セクションを設け、`scope` が top-level 共有フィールドであることを明記して運用上の曖昧性を即時解消。(b) REQ-0156-011 文言自体の修正は別 Issue での対応を PR 本文の Findings に記録して委譲。
- **ユーザー確認の有無**: なし。
- **ADR/REQ/spec影響**: あり。REQ-0156-011 の文言修正候補。本 PR では yaml ヘッダで運用上の曖昧性を除去済みだが、REQ 側の表現自体は依然として per-entry のように読めるため、今後の SPEC ドメイン再編時や新規エントリ追記時に誤読リスクが残る。
- **横展開観点**: REQ/SPEC でデータスキーマを定義する全要件。特に YAML/JSON 等の階層構造を持つファイル形式では、フィールドの「所有者（file/entry/別ノード）」を明示しないと実装者間の解釈が分かれる。
- **再発条件**: (a) REQ でスキーマ要件を「各エントリは ... を持つ」形式で記述し、所有者階層を明示しない場合、(b) 実装者が REQ を一次ソースとして読み、実装パターン（既存類似ファイル等）を参照せずにスキーマを設計した場合。
- **予防策候補**: (a) REQ/SPEC でスキーマ要件を記述する際、フィールド所有者（file top-level / 各 entry / 別ノード）を明示する表記規約を設ける、(b) agentdev-req-analysis / agentdev-doc-writing skill に「スキーマ要件は所有者階層を明示する」チェック項目を追加、(c) REQ-0156-011 を別 Issue で修正。
- **想定反映先**: (a) REQ-0156-011 文言（別 Issue で修正候補）、(b) `src/opencode/skills/agentdev-req-analysis/`、`src/opencode/skills/agentdev-doc-writing/`（スキーマ要件の表記規約）、(c) `docs/specs/integrity/obsolete-path-map.yaml` ヘッダ（本 PR で対応済み、参照例）。
- **関連**: Issue #1359、PR #1360（case-auto Draft 2 OU-003 FINAL、squash merge 562148cf）。REQ-0156-010/011/012、IR-057、`docs/specs/integrity/obsolete-path-map.yaml`。実行日時 2026-07-02。
- **タグ**: `#req-wording` `#schema-ambiguity` `#field-ownership` `#req-0156` `#integrity` `#learning-candidate`
- **移動日**: 2026-07-03
- **処分判定**: deferred（出現1件・影響小・運用回避済み。「スキーマ要件は所有者階層明示」規約は有効だが単発では具体性不足。スキーマ要件の解釈分岐再発時に再評価）

---

## 限定的検査による「配布物参照境界達成」報告が包括的検査で覆る（Wave 1/2 → Wave 3）

- **問題事象**: Epic #1403 Wave 1 (#1404/#1405) と Wave 2 (#1406) において、配布 command/skill 本文から docs/specs/{domain}/** 直参照を除去したことで「配布物参照境界達成」と報告された。しかし Wave 3 (#1407) で包括的検査（check_distribution_boundary.ts）を実装した結果、`ADR-NNNN`/`REQ-NNNN` の具体ID参照が303件（56ファイル）残存していることが発覚した。Wave 1/2 の達成報告は「限定的検査（check_extensions.ts 検査 #9/#10 は docs/specs/{domain}/** 直参照のみ対象）による部分達成」だった。
- **発生局面**: case-close（Wave 3 PR #1411 の QG-3 評定時、新検査機構の実行結果確認）
- **検知方法**: check_distribution_boundary.ts の実行結果（303件検出）と Wave 1/2 達成報告（`docs/specs/{domain}/**` 直参照のみ検査）の比較
- **根本原因**: Wave 1/2 で使われた check_extensions.ts 検査 #9/#10 は「具体パス（docs/specs/{domain}/**）」のみを検査対象とし、「具体ID（ADR-NNNN, REQ-NNNN の4桁数字）」は検査対象外だった。達成報告が検査対象の範囲内のみで「達成」と判断され、検査対象外の違反が見逃された。検査の網羅性と達成報告の表現（「配布物参照境界達成」vs「限定的検査項目達成」）に乖離があった
- **自律対応内容**: 発見事実を PR #1411 Findings セクションへ記録。303件の既存違反は別 Issue 化（intake inbox へ Capture）。
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（プロセス改善候補の記録のみ）。ただし SPEC project-extensions.md「具体ID 記述禁止」厳格定義と実態の乖離判断が未解決（関連 intake: spec-concrete-id-strictness-divergence）
- **横展開観点**: 「検査項目達成」を「機能要件達成」と同義に扱う報告表現は、検査の網羅性が限定的な場合に誤解を生む。特に段階的実装（Wave分割）で前 Wave の達成が後 Wave の包括的検査で覆るリスクは、Epic 構成で「検査機構実装」を最終 Wave に配置する場合に systemic に発生しうる
- **再発条件**: (1) 機能達成を限定的検査の通過で代用し、達成報告が検査範囲を明示しない場合。(2) Epic の最終 Wave で包括的検査機構を実装し、前 Wave の達成前提を覆す場合
- **予防策候補**: (1) 達成報告時に「どの検査項目を満たしたか」を明示し「全体達成」と「部分達成」を区別する。(2) case-open/case-run で受け入れ基準を立てる際、検査可能な基準と検査未実装の基準を分離し、後者は「検査機構実装後に確認」と注記する。(3) QG-2/QG-3 で受け入れ基準の網羅性（検査カバレッジ）を確認する観点を追加するか検討
- **想定反映先**: case-open（受け入れ基準の検査可能性明示）、QG-2（acceptance criteria coverage に検査カバレッジ観点追加を検討）、agentdev-quality-gates skill（達成報告の表現ガイドライン）
- **関連**: Epic #1403, Wave 1 (#1404/#1405), Wave 2 (#1406), Wave 3 (#1407/PR#1411), check_extensions.ts 検査 #9/#10, check_distribution_boundary.ts
- **タグ**: `#wave-coverage` `#acceptance-criteria` `#partial-achievement` `#qg-2`
- **移動日**: 2026-07-05
- **処分判定**: deferred（出現1件・自動化適性低・soft guideline・situational。達成報告の検査項目明示は有望だが再発時に具体化して昇華を再評価）

---

## case-open の完了条件に実測値（件数等）を記載する際に実ファイル確認を省略すると事実誤認が混入する

- **問題事象**: Issue #1412 AG-004 pass criteria「learning entry（8件）が保持されていること」は事実誤認で、実際の `.agentdev/learning/deferred.md`（旧 `archive/active.md`）には17件の学びエントリが存在した（H2 セクション20件からメタセクション3件を除いた値）。本 PR では `git mv` で全学びエントリを完全保持したため、「learning entry が保持されていること」という本質的 pass criteria は満たした
- **発生局面**: case-close（QG-4 完了条件チェックボックス評価時、PR 本文 Findings の記録内容から発覚）
- **検知方法**: case-run 実装担当者が AG-004 検証時に実ファイルのエントリ数をカウントし、Issue 本文の「8件」と乖離していることを PR 本文 Findings に記録。case-close QG-4 で当該 Findings を確認
- **根本原因**: case-open 完了条件記載時に `.agentdev/learning/archive/active.md` の実エントリ数を実測せず、推定値（8件）を記載した。完了条件に件数等の実測値を含めた場合、実ファイル確認を前置する手順が存在しなかった
- **自律対応内容**: 本 PR では `git mv` で全学びエントリを完全保持し、本質的 pass criteria「learning entry が保持されていること」を満たす形で実装。case-close QG-4 で AG-004 を pass 判定し、PR 本文 Findings に事実誤認（spec-bug 分類）を記録。Issue 本文の「8件」は CLOSED 済みのため修正せず、Findings 記録で処理
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（プロセス改善候補の記録のみ）。REQ/ADR/SPEC 本文の数値記載ではなく、Issue 完了条件の記載精度の問題
- **横展開観点**: case-open で件数・行数・サイズ等の実測値を完了条件・pass criteria に記載する場合全般に同様のリスクがある。特にドメイン状態（`.agentdev/**`）の集計値や、仕様書の節数、コードの行数等を記載する場合。推定値が記載されると case-run 実装担当者が実測値と照合できず、QG-3/QG-4 でspec-bug として処理する手戻りが生じる
- **再発条件**: case-open が完了条件に実測値（件数、行数、サイズ等）を含め、かつ実ファイル確認を省略して推定値を記載した場合
- **予防策候補**: (1) case-open の完了条件記載時に件数・行数等の実測値を要求する場合、実ファイル確認を必須化する。(2) 完了条件には「実測値」ではなく「性質」（例: learning entry が保持されていること）を記載し、実測値は pass criteria の検証時に測る運用にする。(3) case-open の test strategy verification に「実測値を含む場合、当該ファイルの実測を行う」ステップを追加する
- **想定反映先**: case-open command 手順（完了条件記載ガイドライン）、agentdev-issue-management skill（実測値記載時の実ファイル確認必須化）、または case-open test strategy テンプレート
- **関連**: Issue #1412 AG-004, PR #1413 Findings セクション, QG-4 no-deviation 判定
- **タグ**: `#case-open` `#acceptance-criteria` `#actual-count` `#qg-4`
- **移動日**: 2026-07-05
- **処分判定**: deferred（出現1件・PC-1 昇華で部分カバー・単独昇華は具体性不足。case-open 完了条件の推定値混入再発時に再評価）

---

## em-dash body 置換の文脈判定パターンと rg 検出時の混在注意

- **問題事象**: 和文 em-dash（` — `）本文横断是正で「参照 — 説明」（リスト項目・見出し・prose の同格・補足・言い換え）パターンが多数（DOC-MAP.md の SPEC 一覧等）を占めた。当該パターンの置換先を全角コロン `：` に統一したが、機械一律ではなく文脈判定が必要。また `rg " — "` はテーブルセル N/A プレースホルダ `| — |` と本文 ` — ` の両方を捕捉するため、検出結果をそのまま置換対象とすると誤置換（`| — |` を `| ： |` にする等）が発生する。
- **発生局面**: docs_chore（em-dash 横断是正）。配布物 docs/skills の表記品質是正時。
- **検知方法**: PR #1435 実装時に `rg " — "` の全ヒットを目視分類し、本文同格（`：` 置換）・テーブルセルプレースホルダ（`-` ハイフン1文字置換）・閉括弧直後（`：` 置換）・メタ参照（保持）の4パターンに振り分けて差分を確認。
- **根本原因**: em-dash は表記用途ごとに置換先が異なる（`mechanical-replacement-rules.md` section 2 パターン A〜D）。`rg " — "` は文字列 ` — ` を含む全行を捕捉するため、用途分類なしの機械置換は誤り。テーブルセル `| — |` は「N/A」意味のプレースホルダであり全角コロン置換は意味破壊。
- **自律対応内容**: 全ヒットを目視分類し、パターン別に置換先を決定（本文同格→`：`、テーブルセル→`-`、閉括弧直後→`：`）。メタ参照（ルール定義書・テンプレート指示で em-dash 文字自体を記述対象とするもの）8件は文書意味保全のため意図的に保持。PR #1435 は193件置換・メタ参照8件保持で完了。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。`mechanical-replacement-rules.md` section 2 が既に判定基準を定義しており、本件はその適用実例）
- **横展開観点**: 文字列検索（`rg`）で機械的に検出できる表記揺れであっても、ヒットごとの表記用途分類なしに一律置換してはならない。検出→分類→パターン別置換の3段階を踏むこと。
- **再発条件**: (1) `rg` 等で特定文字列パターンを横断検出し、(2) ヒット全件を同一置換先で機械置換した場合。
- **予防策候補**: (1) 検出結果をパターン別（表記用途別）に分類してから置換先を決定する、(2) メタ参照（ルール・テンプレートで当該文字を記述対象とするもの）は保持リストとして明示管理する、(3) `mechanical-replacement-rules.md` section 2 のパターン定義を前提とする。
- **想定反映先**: `mechanical-replacement-rules.md` section 2（適用実例の追記候補）、docs_chore 運用
- **関連**: Issue #1434, PR #1435, RU-0022, PR #1122（X-2 follow-up 元）
- **タグ**: `#docs-chore` `#em-dash` `#文脈判定` `#mechanical-replacement-rules`
- **移動日**: 2026-07-06
- **処分判定**: deferred（出現1件・既存SPECカバー。適用実例追記候補として living pool で維持）

---

## case-auto 最大自走モードで ADR-0127 フォールバック（インライン実行）が連続事例で発動し続ける

- **問題事象**: case-auto 最大自走モードから起動された case-run 工程（OU-002 Issue #1457 / PR #1458）で、委譲ツール `call_omo_agent(subagent_type="Sisyphus-Junior")` が explore/librarian のみを許可し Sisyphus-Junior 起動を拒否したため、ADR-0127 フォールバック（インライン実行）へ遷移した。OU-001（PR #1456）に続く2回目の発動で、case-auto 最大自走モードでは常態化している。
- **発生局面**: case-auto 最大自走モードでの case-run 実装工程
- **検知方法**: case-run Step 6 で `call_omo_agent` を試行した際、許可リスト制約により Sisyphus-Junior を起動できず、ADR-0127 フォールバック条件（委譲失敗）として検知。PR 本文 Findings / Capture候補 の execution-context 小見出しに記録。
- **根本原因**: oh-my-openagent 提供の `call_omo_agent` は explore/librarian サブエージェントのみを許可する仕様。case-run Step 6（ADR-0128 task() 委譲モデル）が前提とする Sisyphus-Junior 起動と、caller environment の許可リストが整合していない。case-auto 最大自走モードは委譲前提で組まれているため、許可リスト差異がフォールバック連鎖を引き起こす。
- **自律対応内容**: ADR-0127 フォールバック（インライン実行）へ遷移。実装者は Sisyphus-Junior 相当の制約（単一 Issue スコープ、worktree 隔離、test-fix ルール準拠、capture 境界遵守）で原本追記を実施。Step 7 worktree/branch 削除、Step 9 git pull --ff-only まで完遂。
- **ユーザー確認有無**: なし（case-auto 最大自走モード内で自律遷移）
- **ADR/REQ/spec影響**: あり。ADR-0127 フォールバック発動事例の蓄積（OU-002 で2事例目）。ADR-0128 task() 委譲モデルと caller environment 許可リストの整合性が継続課題。
- **横展開観点**: case-auto 最大自走モードで case-run を起動する全ケースで、call_omo_agent 許可リストが Sisyphus-Junior を含まない限り同一パターンが継続する。REQ-0158 docs guard や test strategy 等、委譲先が実施する想定の検査もインライン実施に回るため、検査網の維持確認が必須。
- **再発条件**: (1) case-auto 最大自走モード起動、(2) case-run Step 6 で `call_omo_agent(subagent_type="Sisyphus-Junior")` 試行、(3) 許可リスト制約で拒否 → ADR-0127 フォールバック遷移。
- **予防策候補**: (a) oh-my-openagent 側の `call_omo_agent` 許可リスト拡張（Sisyphus-Junior 追加）、(b) case-run command が caller environment の許可リストを事前検出して task() とインライン実行を自動選択するフォールバック判定の明示化、(c) ADR-0127 フォールバック時でもインライン実施内容が Sisyphus-Junior 相当の検査網（targeted docs guard / IR-056 / test strategy）を漏れなく実施するテンプレ整備。
- **想定反映先**: ADR-0127（フォールバック発動事例の追記候補）、case-run command Step 6（caller environment 事前検出とフォールバック判定の明示化）
- **関連**: Issue #1457, PR #1458, ADR-0127, ADR-0128, OU-001 (PR #1456, Issue #1455)
- **タグ**: `#case-auto` `#case-run` `#adr-0127-fallback` `#task-delegation` `#inline-execution`
- **移動日**: 2026-07-06
- **処分判定**: deferred（adapter skill L131-148 が task() 起動失敗時フォールバックを完全カバー。L-004/L-010 とともに既存設計の妥当性実証記録。事前 probe 強化のみ未成熟）
