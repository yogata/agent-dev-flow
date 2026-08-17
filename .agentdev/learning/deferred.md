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

---


## 2026-07-18: inspect 連鎖委任の正規 Issue/PR による追跡パターン (#1532 → #1533)

- **問題事象**: inspect-docs (#1532) で検出された agentdev-inspect-skills への意味的診断観点追加が必要な課題が、#1532 本体のスコープ外でありながら関連性が高い。そのまま #1532 に含めると完了条件が曖昧になり、別途 Issue 化しないと追跡が途切れる
- **発生局面**: レビュー (inspect-docs → case-close)
- **検知方法**: #1532 case-run の SPEC確定候補分析で inspect-skills への反映が別 Issue として #1533 へ委任されることが明記され、#1533 で当該委任を正規対応したことを PR #1535 Findings に記録
- **根本原因**: inspect-docs は検出と主題分割に専念し、具体的 skill 改修は個別 Issue で実施する責務分界。しかし「委任」と明示的に記録しないと連鎖が途切れる
- **自律対応内容**: #1532 の Findings に inspect-skills 反映を #1533 委任と明記、#1533 の Findings に「委任連鎖の正規対応」と明記。両 PR の Findings を突き合わせることで委任の完結が追跡可能
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし。既存の inspect-docs / inspect-skills / case-open / case-close フローで完結する運用知見
- **横展開観点**: inspect-docs で複数の主題独立な改善候補を検出した際、各々を主題別 Issue に分割して委任関係を Findings で明示的に記録する運用が有効
- **再発条件**: inspect-docs が複数配布物にまたがる改善候補を検出し、各配布物ごとに個別 skill 改修 Issue を起票する場合
- **予防策候補**: (a) inspect-docs の Findings 形式に「委任先 Issue 番号」欄を明示、(b) case-open が inspect 由来 Issue に「委任元 Issue」リンクを自動付与、(c) inspect-promote が主題分割を自動提案
- **想定反映先**: src/opencode/skills/agentdev-intake-pipeline/references/ (intake-from-github の委任追跡)、src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md (capture 境界の委任記録)
- **関連**: Issue #1532 (PR #1534 merge 61edb46), Issue #1533 (PR #1535 merge 1c10ad2), OU-002 / RU-20260718-01
- **タグ**: `#inspect-chain` `#delegation-tracking` `#findings-linkage` `#case-close`
- **移動日**: 2026-07-18
- **処分判定**: deferred（出現1件・ADR/REQ/spec影響なし・運用知見。現状の inspect-docs / inspect-skills / case-open / case-close フローで完結。情報断片的）

---


## 要件追加が既存基準の明文化で実変換を伴わない no-op パターン

- **問題事象**: TS-002（配布物 Markdown BOM なし UTF-8 統一）を含む Issue で、配布物が既に BOM なし UTF-8 へ準拠済みであるにもかかわらず、新規要件（REQ-0108-271）の追加が発生した。要件追加は将来のドリフト防止が主目的で、実変換は不要であった。しかし pass_criteria の表現からは「実変換を伴う合格」と「no-op confirmed の合格」の区別が読み取れず、レビュー時にスコープ過大評価やテスト不足誤認の恐れがあった。
- **発生局面**: レビュー・クローズ（case-run 終了後、case-close での完了条件照合時）
- **検知方法**: 手動確認。配布物 Markdown の BOM 有無をバイト先頭確認で走査した結果、変換対象ファイル 0件であった。worktree HEAD が `origin/main`（`b0a00fe1`）到達時点でエンコーディング変更不要であり、全配布物が既に BOM なし UTF-8 へ準拠済みと判明。
- **根本原因**: pass_criteria が状態（BOM なし UTF-8 であること）を規定するのみで、遷移（変換を実施したか、既存準拠か）を区別しない。そのため「fail 0件」の合格が、変換起因か元から不合格でなかったか、pass_criteria 文面からは判別できない。AG-002 のスコープ判断が PR 本文 Findings での明示に依存していた。
- **自律対応内容**: 本 Issue の case-run で PR 本文の TS-002 結果欄に「no-op confirmed」と明記し、変換ファイルリストが空であることをテスト戦略欄と突合して評価者が誤認しないよう措置。新規要件（REQ-0108-271）は将来のドリフト防止目的であることを Findings に併記。
- **ユーザー確認有無**: なし（エージェント自律で PR 本文に明記）
- **ADR/REQ/spec影響**: なし（本件は pass_criteria の運用上の読み取り方の知見であり、REQ/SPEC 文面の改訂を要しない）。REQ-0108-271 自体は将来のドリフト防止要件として有効。
- **横展開観点**: pass_criteria が「状態」を規定するテスト戦略（エンコーディング、リンタ0件、フォーマット準拠等）で、要件追加が既存基準の明文化に過ぎないケース全般に適用可能。case-run は PR 本文の該当 TS 結果欄に「no-op confirmed」「conversion applied」等の遷移区分を明示することで、case-close の QG-4 評価および将来の inspect 系ドリフト検出の material として機能する。
- **再発条件**: (1) 既存基準に合致済みの状態を規定する pass_criteria、(2) 将来のドリフト防止を主目的とする新規要件追加、(3) case-run が no-op であることを PR 本文に明示しない、の全てが揃った場合。
- **予防策候補**: (a) case-run テンプレート（pr_desc.md）の Test Strategy 結果欄に「状態合格」か「変換実施」かの区分を小タグ等で明記する項を設ける。(b) QG-4 評価時に「状態合格で変換 0件」のケースを明示的に許容する観点を qg-4-final-acceptance.md に追記する。
- **想定反映先**: workflow-templates skill `templates/pr_desc.md`（Test Strategy 結果欄）、quality-gates skill `references/qg-4-final-acceptance.md`（test strategy 処理完了の検査観点）
- **関連**: PR #1553, Issue #1552, AG-002, TS-002, REQ-0108-271（commit `d9480642`）
- **タグ**: `#no-op` `#pass-criteria` `#test-strategy` `#case-run` `#case-close` `#qg-4`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## extension が未サポート形式の brief 授権で意味マッピング処理するパターン

- **問題事象**: lightweight draft（Form C）形式の要件 doc を入力とした req-save / case-open で、req-save extension が Form C を明示サポートしていないため、要件マッピング（要件行 → REQ/ADR 紐付け）が extension の標準処理経路では処理できない事象が発生。今回の事例（Issue #1556、bugfix/small/Form C）では、extension 経路の自動処理に頼らずユーザーから明示的な brief 授権を受け、要件 doc の意味を読んで REQ-0158 へ REQ-0158-001 を APPEND する形でマッピングを完遂した。
- **発生局面**: 要件定義・保存（req-define → req-save、lightweight draft 入力時）
- **検知方法**: 手動確認。req-save extension の対象形式リストに Form C が含まれないことを踏まえ、本ケースでは brief 授権で直接処理する方針を選択。extension 経路を強制せず、意味マッピングを優先して完遂。
- **根本原因**: req-save extension の入力形式サポートが standard / lightweight（Form A/B）を前提としており、Form C（最 lightweight）が明示サポート対象外。Form C は要件 doc の構造が緩いため、extension のパターンマッチ処理が安定しないことが理由と推定される。一方で、要件の意味内容自体はマッピング可能なケースがあり、形式未サポートと意味未マッピングは同義ではない。
- **自律対応内容**: extension の Form C 未サポートを検知した後、ユーザーからの brief 授権（本ケースでは Form C 入力で REQ-0158 へ APPEND する意図の明示）を受けて、extension 経路を迂回し意味ベースで REQ-0158-001 を新設。req-save の成果物（REQ ファイル更新、`docs/requirements/README.md` のエントリ確認）は extension 経路と同等の品質を担保。Windows worktree lint 検証時のジャンクション手動作成パターン（既存 learning）と同等の「extension が未カバーする形式を brief 授権で補完」アプローチ。
- **ユーザー確認有無**: あり（brief 授権をユーザーから受領。Form C 入力時の REQ 追記方針を事前合意）
- **ADR/REQ/spec影響**: あり（要評価）。req-save extension の入力形式サポートを Form C まで拡張するか、または brief 授権経路を SPEC/extension で明文化するかの判断候補。REQ-0103（Artifact 責任分界）、REQ-0105（Intake / Learning / Backlog lifecycle）周辺、req-save SPEC、`agentdev-req-file-manager` skill 規約が関連。
- **横展開観点**: extension が標準サポート対象外の形式・経路（Form C 入力、adjacency marker 不在、RU 由来でない session-sourced 入力等）であっても、ユーザーの brief 授権があれば意味マッピング経路で完遂できる。extension 未サポートを即座にエラー停止せず、brief 授権経路へ分岐する判定を req-save / spec-save / case-open 共通で持つ価値がある。ただし brief 授権の判定基準・記録形式が未整備のため、整備が必要。
- **再発条件**: (1) lightweight draft（Form C）入力、(2) req-save / spec-save / case-open extension が Form C を明示サポートしない、(3) ユーザーの brief 授権が得られる、の全てが揃った場合。
- **予防策候補**: (a) req-save extension の入力形式サポートを Form C まで拡張し、自動処理経路を整備する。(b) brief 授権経路を SPEC/extension で明文化し、Form C 入力時の標準フォールバックとして位置付ける。(c) brief 授権を PR Findings 等の証跡に残す運用を case-open / req-save のガイドに明記し、後続の inspect 系ドリフト検出の material とする。
- **想定反映先**: req-save SPEC、`agentdev-req-file-manager` skill 規約、または workflow-lifecycle skill の work_type / draft_type 判定基準（Form C 入力時の extension 経路 vs brief 授権経路の分岐規則）
- **関連**: PR #1557, Issue #1556, draft_type=lightweight (Form C), REQ-0158-001 APPEND（commit `64745a36`）
- **タグ**: `#form-c` `#lightweight-draft` `#brief-authorization` `#extension-fallback` `#req-save` `#meaning-mapping`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## TS-004 subagent 委譲プロトコル適用効果の実証を record-in-findings で処理した判断基準

- **問題事象**: Issue #1566 テスト戦略 TS-004「#1538 と同等の case-open 委譲を `category=unspecified-high` + MUST NOT DO 強化プロンプトで実施し、スコープ逸脱なく case-open 本来責務に到達することを確認する」は、本 Issue の実装修復 OU-002/003/004（ドキュメント整備）単体では検証できない。case-close QG-4 評価時に合格・不合格の二値判定が下せない test strategy 項目。
- **発生局面**: case-close（QG-4 最終受け入れ）
- **検知方法**: Issue #1566 テスト戦略 TS-004 pass_criteria と本 PR 変更範囲（OU-002/003/004 のドキュメント整備のみ）の対比。PR #1539 で既に `category=unspecified-high` + MUST NOT DO 強化により #1538 スコープ逸脱が解消済みであることも確認。
- **根本原因**: TS-004 は「適用効果の運用観測」を合格基準に置いており、プロトコルを文書化する実装修復単体では完結しない。一方で REQ-0163 は #1538 由来事象（PR #1539）の解消知見を要件化したものであり、構造的に TS-004 pass_criteria（スコープ逸脱なし）を担保する。
- **自律対応内容**: record-in-findings 扱いで PR 本文の Findings/Capture候補 セクションに経緯と判断基準を記録し、次回 case-open 委譲時に個別 case で観測する運用知見として後続へ委譲。本 PR で別 case を起動して実証するのはスコープ膨張と判断し見送り。
- **ユーザー確認有無**: なし（エージェントが PR 本文に明記）
- **ADR/REQ/spec影響**: REQ-0163（本 Issue の要件基準）。REQ-0131-026（test strategy on_failure/pass_criteria に対する record-in-findings 運用）。次回 case-open 委譲時の観測結果次第で REQ-0163-001/002/003 の精査余地が生じうる。
- **横展開観点**: 「適用効果を観測する test strategy」全般に適用可能。実装修復 PR 単体では観測できず運用観測に委ねる TS 項目は、(a) 構造的担保（要件化）の確認、(b) 運用観測の判断基準明示、を両方 PR 本文 Findings に記録することで case-close QG-4 評価資料とする。
- **再発条件**: (1) test strategy が「適用効果の運用観測」を pass_criteria に含み、(2) 実装修復 PR がプロトコル文書化等の構造的担保のみを提供し観測を含まない場合。
- **予防策候補**: case-open でテスト戦略を記載する際、「適用効果観測」型の TS は on_failure に「次回適用時に観測」と明示し、本 PR で完結しないことを case-open 時点で構造化する。QG-4 で record-in-findings 判断基準を共通化する。
- **想定反映先**: quality-gates skill `references/qg-4-final-acceptance.md`（record-in-findings 判断基準）、workflow-templates skill `templates/issue_desc_feature.md`（test strategy on_failure 記載ガイド）
- **関連**: PR #1568, Issue #1566, TS-004, REQ-0163, Issue #1538（由来事象）, PR #1539（解消 PR）, REQ-0131-026
- **タグ**: `#test-strategy` `#record-in-findings` `#subagent-protocol` `#qg-4` `#case-close` `#req-0163`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## ADR frontmatter の relates-to / supersedes を本文と Decision Map で表現する運用

- **問題事象**: ADR-0138 を新規作成する Issue #1582 の完了条件に「relates-to=ADR-0136,ADR-0137,ADR-0129,ADR-0132、supersedes=none であること」と frontmatter 項目として扱う前提で記載されていた。しかし本リポジトリの ADR frontmatter は `id/title/status/created/updated` のみで構成され（ADR-0135/0136/0137/0138 で一貫）、`relates-to` / `supersedes` は本文「関連する決定」セクションと ADR-README の Decision Map テーブルで表現する形式が採用されている。Issue 完了条件の記述と実体の表現形式が一致しておらず、QG-4 評価時に形式の齟齬を解釈する手間が発生した。
- **発生局面**: レビュー・クローズ（case-close の QG-4 完了条件評価）
- **検知方法**: 手動確認。PR #1589 の QG-3 staleness check で ADR-0138 frontmatter に `relates-to` / `supersedes` が無いことを確認し、Decision Map と本文「関連する決定」セクションで表現されていることを照合。
- **根本原因**: case-open が Issue 完了条件を起票する際、ADR frontmatter の形式を `id/title/status/created/updated/relates-to/supersedes` の7項目と想定して記載した。リポジトリの実運用では relates-to / supersedes を frontmatter ではなく本文 + Decision Map で表現する方針が暗黙に採用されているが、これが SPEC/ガイドレベルで明文化されていないため、case-open の自動生成条件文に齟齬が混入した。
- **自律対応内容**: PR #1589 本文の Findings セクションに「ADR frontmatter は id/title/status/created/updated のみ。relates-to/supersedes は本文と Decision Map で表現する形式」と明記し、Issue 完了条件を実体の表現形式で達成していることを記録した。Issue 本文の完了条件は frontmatter 項目としての記載のままで、case-close で実体照合により pass 判定。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり。document-type-responsibilities SPEC または ADR 運用ガイドで「ADR frontmatter の必須項目は id/title/status/created/updated。relates-to/supersedes は本文 + Decision Map で表現する」ことが明文化されていない。ADR 形式 SPEC への追記候補。
- **横展開観点**: REQ/ADR を対象とする case-open の自動完了条件生成で、対象文書の実運用形式（frontmatter vs 本文 vs 別ファイル）を前提とする記述を置く際、実形式との整合を確認せず一般的テンプレートで記載すると同種の齟齬が再発する。SPEC や README の形式定義を参照してから完了条件を書く、または「実運用形式に従い表現されていること」の抽象度で記載することが望ましい。
- **再発条件**: (1) ADR を新規作成または更新する Issue を case-open が起票する、(2) 完了条件に frontmatter 項目として relates-to/supersedes を指定する、(3) リポジトリの実運用が frontmatter 項目ではなく本文 + Decision Map 表現を採用している、の全てが揃った場合。
- **予防策候補**: (a) ADR 形式 SPEC または agentdev-adr-file-manager skill に「ADR frontmatter 構成要素（id/title/status/created/updated の5項目）と relates-to/supersedes の表現場所（本文 + Decision Map）」を明文化する。(b) case-open テンプレートで ADR を対象とする完了条件を「指定メタデータが frontmatter または本文の適切な位置に表現されていること」の抽象度で記載する。
- **想定反映先**: ADR 運用形式 SPEC（document-type-responsibilities 配下）、agentdev-adr-file-manager skill、case-open テンプレート（ADR 対応の完了条件記述抽象度）
- **関連**: PR #1589, Issue #1582, Epic #1581, ADR-0138, ADR-0136（限定注記）, ADR-README Decision Map
- **タグ**: `#adr` `#frontmatter` `#case-open` `#completion-criteria` `#qg-4` `#form-policy`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## Issue 本文崩壊（LF 圧縮・見出し消失）の修復手法と予防線

- **問題事象**: Issue #1533 の本文が LF=0（事実上1行化）に圧縮され、Markdown の見出し構造（`## ...`）が崩壊。GitHub Web UI で見出しが見出しとしてレンダリングされず、本文全体が平文化して読めなくなっていた。前工程の draft（commit `51fff8b2`）は LF=246 で正常、テンプレート原本も正常であり、#1525〜#1535 の11件中 #1533 だけが異常だった。
- **発生局面**: 完了処理（case-close Step 2 QG-4 評価の前置として AG-007 修復を実施）
- **検知方法**: `gh api ... --jq .body` で取得した本文の LF 数計測で LF=0 を検出。`-1` を含む `headings` 計測で「見出し行頭の `##` が 0 件」を確認。
- **根本原因**: case-open の本文作成経路が、テンプレート読込後の本文をファイル経由で扱わず、PowerShell 文字列変数で持ち回し、`gh` CLI へ渡す前に LF 圧縮・空行正規化が走っていた。LF 欠損は Markdown 構造破壊（見出しの見出しとしての認識消失）の直接原因。
- **自律対応内容**: REQ-0125.md（UTF-8 LF 保存済みの原本）を主ソースとして意味内容を抽出し、`issue_desc_feature.md` テンプレート構造で本文を再構成。`.tmp/issue1533-body.md` を Write tool（Node.js による UTF-8 BOM なし LF 書き出し）で作成し、`gh issue edit 1533 --body-file <path>` で投稿。修復後 LF=204、見出し16個すべて直前空行またはファイル先頭、行中 `##` 0件、日本語文字化けなし。
- **ユーザー確認有無**: なし（AG-007 は Issue #1537 の完了条件に含まれ、エージェント自律で修復を実施）
- **ADR/REQ/spec影響**: あり。本件は既に REQ-0132-024/025/026（case-open ファイル経由本文保持）および REQ-0149-010（VERIFY の LF 数一致・見出し空行・行頭検証）として実装済み（PR #1539）。本学びは修復手法の記録であり、新規 REQ ではない。
- **横展開観点**: GitHub Issue に限らず、Markdown 構造を持つ任意の成果物（PR 本文、完了報告コメント、Case ファイル（ローカル版））で LF 圧縮・見出し消失の同種事故が発生し得る。本文作成時は常に `[System.IO.File]::WriteAllText` UTF8Encoding($false) によるファイル経由を固定し、読み戻し時に LF 数・見出し空行・行頭検証を行う VERIFY を併用する。修復が必要な場合は UTF-8 LF の原本ソース（REQ ファイル、draft commit 等）を主ソースとし、テンプレート構造で再構成する。
- **再発条件**: (1) PowerShell パイプライン経由で本文を取り回す、(2) `--body` 直接指定する、(3) VERIFY で LF 数と見出し構造を検査しない、のいずれかが発生した場合。
- **予防策候補**: (a) REQ-0132-024/025/026 実装（既実施）により構造的に防止。(b) 修復が必要になった場合、標準手順として「原本ソースの特定 → テンプレート構造で再構成 → `[System.IO.File]::WriteAllText` UTF8Encoding($false) でファイル作成 → `gh ... --body-file` で投稿 → Node.js `execSync` で LF 数・見出し数を読み戻し検証」を常に踏む。
- **想定反映先**: `agentdev-gh-cli/references/standard-procedures.md`（本文修復手順の記載）、`agentdev-issue-management/references/issue-operation-safety.md`（修復時の前後スナップショット比較）。両者とも REQ-0132/0149 実装で既カバーされており、本学びは具体的事例の補強。
- **関連**: PR #1600, Issue #1537（AG-007）, Issue #1533（修復対象）, RU-20260718-01（起点 RU）, REQ-0132-024/025/026, REQ-0149-010, PR #1539（実装 PR）
- **タグ**: `#case-close` `#issue-body-restore` `#lf-corruption` `#markdown-structure` `#verify` `#ag-007` `#powershell-encoding` `#req-0132-024` `#req-0149-010`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## 2026-07-20: req-save/spec-save 統合委譲で生成された SPEC 本文への中国語文字混入

- **問題事象**: req-save/spec-save 統合委譲（commit cb8e5891）で新設された SC-001 SPEC（`docs/specs/foundations/numbering-policy.md`）の L10 に中国語文字「单」（U+5355）が混入していた。AGENTS.md「基本言語は日本語。あらゆる場面で中国語の使用を禁止する」への違反。PR #1613（Issue #1603、Epic #1601 Wave 1）の case-run で検出され、「単」（U+5358）へ修正済み。
- **発生局面**: 要件保存・SPEC 保存（req-save/spec-save 統合委譲による SPEC 新設時）
- **検知方法**: case-run 実装中の SPEC 本文 review で発見。機械的検出ではなく作業者の目視。
- **根本原因**: 統合委譲で SPEC 本文を一括生成した際、原稿（要件ドラフトまたは前段テキスト）に混入した中国語文字をそのまま引き継いだ。req-save/spec-save フローに日本語以外の CJK 文字を検出する自動検査工程が存在せず、レビュー段階で拾えなかった可能性が高い。AGENTS.md の中国語禁止ルールは人手による遵守に依存している。
- **自律対応内容**: 本 PR #1613 で「单」→「単」へ修正。他の SPEC ファイル（SC-002, SC-003、既存 SPEC UPDATE 分）には同様の混入なしことを確認済み。
- **ユーザー確認有無**: なし（エージェント自律で PR 本文 Findings に記録し修正）
- **ADR/REQ/spec影響**: なし。本件は SPEC 本文の表記修正であり、新規 REQ/ADR/SPEC 影響なし。AGENTS.md 既存ルールの運用改善候補。
- **横展開観点**: req-save/spec-save 統合委譲に限らず、AgentDevFlow 配布物（commands/, skills/, docs/）を新規生成・編集する全局面で、CJK 同形異字（「单」と「単」、「学」と「學」等）、簡体字・繁体字の混入リスクがある。文字コード検査（U+4E00〜U+9FFF のうち日本語外字を検出する正規表現等）を VERIFY に組み込む候補。
- **再発条件**: (1) req-save/spec-save 統合委譲または同等の一括生成フロー、(2) 原稿に中国語文字が含まれる、(3) 自動的な CJK 文字検査が存在しない、の全てが揃った場合。
- **予防策候補**: (a) agentdev-gh-cli VERIFY 観点「Markdown 構造」に「日本語外 CJK 文字検出」を追加する（中国語簡体字・繁体字を検出する正規表現パターンを用意）。(b) inspect-docs または inspect-skills に「日中同形異字」検出カテゴリを新設する。(c) req-save/spec-save フローの post-condition に「日本語外 CJK 文字 0件」を加える。
- **想定反映先**: `agentdev-gh-cli/references/verify.md`（VERIFY 観点拡張）、`docs/specs/integrity/integrity-rule-catalog.md`（IR 追加候補）、inspect-docs または inspect-skills の検出カテゴリ
- **関連**: PR #1613, Issue #1603, Epic #1601 Wave 1, commit cb8e5891（統合委譲本体）, AGENTS.md「基本言語は日本語」
- **タグ**: `#japanese` `#chinese-character` `#cjk` `#verify` `#spec-save` `#req-save` `#integrated-delegation` `#ag-001`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## 2026-07-20: 要件行は進捗値ではなく仕様としてベースライン値を記述すべき（#1606）

- **問題事象**: REQ-0162-010 が「影響範囲 NG 218件・WARNING 10件」と記述しているが、現状は intake-2026-07-19 で NG 216件・WARNING 10件に減少（PR #1579 で req-save.md/spec-save.md 処理済み）。ベースライン（起票時 218件）と現状進捗値（216件）の使い分けが REQ-0162-010/-011 で混在しており、case-close QG-4 評価時に「進捗値の更新漏れか、意図的なベースライン記述か」を判別する手間が発生した。
- **発生局面**: レビュー・クローズ（case-close の QG-4 完了条件照合時）
- **検知方法**: PR #1617 Findings セクションに「ベースライン値 vs 進捗値の使い分けは適切」と明記されていたことで判別可能だった。しかし REQ-0162-010/-011 本文だけでは意図が読めず、Findings に依存する構造。
- **根本原因**: 要件行に数量を記述する際「ベースライン値（仕様として固定）」と「進捗値（現状報告）」の運用区別が SPEC/ガイドレベルで未明文化。両者が混在すると、数量が変動した場合に「要件行を更新すべきか」「更新不要（ベースライン）か」が判断できない。
- **自律対応内容**: case-close では REQ-0162-010 をベースライン値のままとし、216件への更新を実施しなかった。PR #1617 Findings で「要件行は進捗値ではなく仕様としてベースラインを記述すべき」と明文化済み。進捗値は intake item（intake-2026-07-19-concrete-id-path-remaining-216-ng-10-warn.md）が別途追跡する二重管理構造とした。
- **ユーザー確認有無**: なし（エージェント自律で判断、PR Findings に記録済み）
- **ADR/REQ/spec影響**: なし（運用規約の明文化候補）。REQ-0162-010/-011 文面は現状維持。要件行数量記述ガイドラインの整備候補。
- **横展開観点**: 数量ベースラインを要件行に含む全ケース（影響範囲、検出件数、ファイル数等）で、「ベースライン（仕様）」と「進捗値（運用報告）」を区別する記述ガイドラインが有効。進捗値は intake/learning 等の別 artifact で追跡し、要件行は仕様としてベースラインを保持する二重管理構造を標準化する。
- **再発条件**: (1) 要件行に数量を記述、(2) 数量が運用進捗で変動、(3) ベースラインと進捗値の運用区別が SPEC/ガイドで未明文化、の全てが揃った場合。
- **予防策候補**: (a) REQ/SPEC 記述ガイドに「要件行の数量は起票時ベースラインを記述し、運用進捗値は intake/learning 等の別 artifact で追跡する」運用を明文化する。(b) 数量の後に `(baseline YYYY-MM-DD)` 等の日付明示でベースライン値であることを形式化する。
- **想定反映先**: document-type-responsibilities SPEC（要件行記述ガイド）、または workflow-templates skill `templates/req_*.md`（数量記述ガイドライン）
- **関連**: PR #1617, Issue #1606, Epic #1601 Wave 2, REQ-0162-010/-011, intake-2026-07-19-concrete-id-path-remaining-216-ng-10-warn.md
- **タグ**: `#requirements` `#baseline-value` `#progress-value` `#quantity-description` `#case-close` `#qg-4` `#req-0162`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## 2026-07-20: 再構成検証型 Issue で「決定」更新後に「結果・影響」節が取り残される内部矛盾パターン（#1607）

- **問題事象**: ADR-0114/0125/0127/0128 再構成（commit cb8e5891）で「決定」本文の更新は実施されたが、「結果・影響」「保持責務リスト」等の派生節が旧い前提のまま取り残される内部矛盾2件を検出。ADR-0114.md line 66「ドライバー結果の3状態契約により」は §2 で4状態契約へ拡張したのに結果節が3状態のまま。ADR-0127.md §3「case-run 並行委譲制御」は §1 で case-run を構成工程委譲対象外に変更したのに保持責務リストが旧表現のまま。
- **発生局面**: 実装・検証（case-run 検証フェーズ、Wave 2 #1607 PR #1616）
- **検知方法**: case-run 検証フェーズで ADR 内のセクション間整合性を精読し発見。§1 vs §3、決定節 vs 結果節の突き合わせで機械的に検出可能。
- **根本原因**: ADR 再構成を「決定本文」中心で実施した際、派生節（結果・影響、保持責務、関連項目等）の追随更新が漏れた。req-save/spec-save 統合委譲（cb8e5891）はバッチ処理で主要節を更新したが、派生節の網羅性確認プロセスが無かった。
- **自律対応内容**: PR #1616 で2件の内部矛盾を補完修正。ADR-0114.md line 66 を「3状態」→「4状態（blocked / failed / delegation-unavailable）」へ更新、ADR-0127.md §3 を「並行委譲制御」→「インライン実行制御」へ更新。Q4 壁打ち合意に合致。
- **ユーザー確認有無**: なし（エージェント自律で検出・修正、PR 本文に記録）
- **ADR/REQ/spec影響**: なし。本件は ADR 再構成の運用知見であり、新規 ADR/REQ/spec 影響なし。
- **横展開観点**: 文書再構成を「決定節」中心で実施する全ケース（ADR, REQ, SPEC の大規模 UPDATE）で、派生節（結果・影響、保持責務、関連項目、Decision Map、Consequences 等）の追随確認を検証フェーズで実施する観点が有効。再構成 PR には「派生節整合性確認」チェックリストを含める運用。
- **再発条件**: (1) 文書の主要節を再構成、(2) 派生節（結果・影響等）が旧前提を保持、(3) 派生節の網羅性確認プロセスが存在しない、の全てが揃った場合。
- **予防策候補**: (a) case-run 検証テンプレートに「再構成を伴う ADR/REQ/SPEC は §単位の整合性（決定 vs 結果・影響、§1 vs §3 等）を確認する観点」を追加する。(b) inspect-docs に「文書内セクション間整合性（同一概念の表記揺れ、旧前提の取り残し）」検出カテゴリを新設する。
- **想定反映先**: case-run skill 検証テンプレート、workflow-templates skill `templates/pr_desc.md`（再構成 PR の検証項目）、inspect-docs 検出カテゴリ候補
- **関連**: PR #1616, Issue #1607, Epic #1601 Wave 2, ADR-0114（3状態→4状態）, ADR-0127（並行委譲→インライン実行）, commit cb8e5891（統合委譲本体）, Q4 壁打ち合意（2026-07-19）
- **タグ**: `#adr` `#restructure` `#internal-contradiction` `#section-consistency` `#case-run` `#verification` `#ag-005`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## 2026-07-20: 物理統合時の参照更新網羅性チェックパターン（#1608）

- **問題事象**: `docs/specs/foundations/workflow-contracts.md`（旧版縮小互換索引）を完全削除し `docs/specs/workflows/workflow-contracts.md` へ物理統合する際、active 文書10件（docs/README.md, DOC-MAP.md, specs/local/local-generation.md, specs/README.md, ADR-0127.md, REQ-0112/0119/0126/0137）に残存する旧パス参照の網羅的更新が必要だった。grep で `obsolete-path-map.yaml`（IR-057 exemption 対象）のみ残ることを確認し、stub/redirect/互換索引の残置なしを検証した。
- **発生局面**: 実装・検証（case-run 実装フェーズ、Wave 2 #1608 PR #1619）
- **検知方法**: リポジトリ全体 git grep で旧パス文字列を検索し、active 文書から完全除去されたことを確認。`obsolete-path-map.yaml` は IR-057 検査の exemption リストとして意図的に残置する設計のため除外。
- **根本原因**: 物理統合（ファイル削除・移動）では参照元の網羅的更新が必須だが、手動 grep では見落としリスクがある。本 case では `obsolete-path-map.yaml` に旧パス→新パス対応を追記し、IR-057 が旧パス参照を検出できる二重安全装置を設定。
- **自律対応内容**: PR #1619 で10件の active 文書の旧パス参照を新パスへ更新、`obsolete-path-map.yaml` に新エントリ追加、stub/redirect/互換索引を残さず完全削除。acceptance 検証表で5項目（旧パス削除、新パス存在、active 文書参照残存ゼロ、obsolete map 記録、stub なし）を全て ✅ で確認。
- **ユーザー確認有無**: なし（エージェント自律で実施、PR 本文に詳細記録）
- **ADR/REQ/spec影響**: なし。本件は物理統合時の運用知見であり、新規 ADR/REQ/spec 影響なし。`obsolete-path-map.yaml` の運用が有効性を実証。
- **横展開観点**: SPEC/ADR/REQ の物理統合、ファイル移動、リネーム全般で適用可能。(a) 旧パスを網羅的に grep、(b) active 文書の参照を新パスへ更新、(c) `obsolete-path-map.yaml` への対応記録、(d) stub/redirect/互換索引を残さない、の4ステップを標準パターンとする。
- **再発条件**: (1) SPEC/ADR/REQ の物理統合・移動を実施、(2) 参照元の網羅的更新が必要、(3) stub/redirect 残置の判断が必要、の全てが揃った場合。
- **予防策候補**: (a) workflow-templates skill に「物理統合・ファイル移動時の標準4ステップ（grep、active 更新、obsolete map 記録、stub 残置なし）」テンプレートを追加する。(b) inspect-docs に「物理統合・移動後の参照残存検出（`obsolete-path-map.yaml` 連動）」検出カテゴリを強化する。
- **想定反映先**: workflow-templates skill `templates/*.md`（物理統合テンプレート）、inspect-docs 検出カテゴリ（`obsolete-path-map.yaml` 連動）、`docs/specs/integrity/obsolete-path-map.yaml`（運用実例の補強）
- **関連**: PR #1619, Issue #1608, Epic #1601 Wave 2, IR-057（obsolete path 参照検出）, `docs/specs/integrity/obsolete-path-map.yaml`, ACT-SPEC-004（U-007 物理統合）, commit cb8e5891
- **タグ**: `#physical-integration` `#reference-update` `#obsolete-path-map` `#ir-057` `#case-run` `#verification` `#ag-002`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## 2026-07-20: AG-001 制約内で公開 SKILL.md の文書構成を是正する REFERENCE 強化パターン（#1610）

- **問題事象**: doc-writing SKILL.md の査読観点 table が `references/` 配下10ファイルのうち `mechanical-replacement-rules.md`, `japanese-replacement-dictionary.md` の2ファイルへの参照を欠いていた。また doc-map SKILL.md に intro 段落と重複する redundant な `### 目的` subsection が存在した。これらは AG-006' 候補6/7 Wave 1 が指摘する SKILL.md 重複問題の一部だが、動作（発火条件、判定ロジック等）に影響しない文書構成の不備であり、AG-001「公開 skill 動作不改」制約内で修正可能かの判断が必要だった。
- **発生局面**: 実装・検証（case-run 実装フェーズ、Wave 3 #1610 PR #1621）
- **検知方法**: Phase1 監査台帳 AG-006' M節 item 8（候補6/7 Wave 1）の指示と、`src/opencode/skills/agentdev-doc-writing/SKILL.md` の査読観点 table と `references/` 配下実ファイルの突合で検出。doc-map については冒頭 `# DOC-MAP 読み方ガイド` 直下の `### 目的` が intro 段落と意味重複するかの精読で検出。
- **根本原因**: SKILL.md の参照漏れ・redundant subsection は拡張時の accumulate 結果。動作不改範囲での是正判断基準が SPEC に明示されず、「動作箇所（description frontmatter, Trigger conditions, 制約事項, コマンド実行, フラグ判定, 判定ロジック等）に触れない変更」と「文書構成（查読観点 table の参照追加、原本 section の対応表、リード文への構造変更、count 表記訂正）」の区別を case-run 側で都度判断していた。
- **自律対応内容**: PR #1621 で3変更を適用。(a) doc-writing 査読観点 table へ2参照を追加、(b) doc-writing「原本」section に「運用ビュー↔原本」対応表を新設（原本節は `japanese-tech-writing`、document-type-responsibilities SPEC と明示）、(c) doc-map redundant `### 目的` subsection を intro 段落へ統合、参照可能 section の count 表記を 7→10 ファイルへ訂正。`git diff` で動作箇所への変更なしを確認。
- **ユーザー確認有無**: なし（エージェント自律で実施、PR 本文に AG-001 制約遵守確認セクションを明記）
- **ADR/REQ/spec影響**: なし。AG-001 制約内の運用知見であり、新規 ADR/REQ/spec 影響なし。SC-002 DERIVE/GENERATE 機構（フェーズ3対象）で SKILL.md 参照整合性を自動維持する候補が補強される。
- **横展開観点**: 公開 SKILL.md の動作不改範囲での文書構成是正（参照追加、redundant subsection 統合、count 表記訂正、原本への対応表新設等）は Wave 1 パターンとして標準化可能。動作箇所（発火・判定・実行）と文書構成箇所（参照・構造・表記）を `git diff` で区別して確認する観点が、他の agentdev-* SKILL.md でも適用可能。
- **再発条件**: (1) 公開 SKILL.md に `references/` 配下ファイルへの参照漏れ、redundant subsection、count 表記不正のいずれかが存在、(2) AG-001「公開 skill 動作不改」制約下で修正可否の判断が必要、(3) 動作箇所と文書構成箇所の区別基準が SPEC に未明文化、の全てが揃った場合。
- **予防策候補**: (a) document-type-responsibilities SPEC（または後続SPEC）に「SKILL.md 重複読の優先度基準と段階的スケジュール」節で Wave 1 対象ファイル一覧（doc-writing, doc-map 等）を明示する。(b) case-run skill 検証テンプレートに「SKILL.md 変更時は動作箇所（Trigger/制約/ロジック）と文書構成箇所（参照/構造/表記）を git diff で区別確認」の観点を追加する。
- **想定反映先**: `docs/specs/responsibilities/document-type-responsibilities.md`（SKILL.md 重複読章）、case-run skill 検証テンプレート、workflow-templates skill `templates/pr_desc.md`（AG-001 制約確認セクション）
- **関連**: PR #1621, Issue #1610, Epic #1601 Wave 3, AG-006' 候補6（doc-writing REFERENCE 強化）・候補7 Wave 1（SKILL.md 手作業重複除去）, CR-003 フェーズ2/3 振り分け基準
- **タグ**: `#ag-001` `#skill-md` `#reference` `#redundant-subsection` `#wave-1` `#case-run` `#verification` `#ag-008`
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## IR-* frontmatter の Related REQ/SPEC フィールド不在と本文 prose 抽出代替パターン

- **問題事象**: IR-061 の frontmatter は新形式（id/title/domain 等）だが elated_req / elated_spec フィールドを持たない。関連情報は本文「## 関連」セクションに prose 形式で記載される。そのため rule-ownership appendix の IR-061 行は Related REQ/SPEC が - となる。Wave 1 では Phase E での対応候補として記録するにとどめ、この Issue スコープ外とする。
- **発生局面**: 実装（Wave 1: catalog + rule-ownership GENERATE 化、IR-* 依存）
- **検知方法**: 実装中に IR-061 frontmatter を読み込み、elated_req / elated_spec フィールド不在を確認。IR-060/062 には同フィールドが存在することと対比し、IR-061 の frontmatter 形式不整合を検知。
- **根本原因**: IR-061 は Phase C（生成スクリプト実装）で新規作成された IR であり、IR-* frontmatter の標準形式（id/title/domain/related_req/related_spec）への移行が不完全であった。関連情報は本文 prose で記載する暫定形式が採用された。
- **自律対応内容**: Wave 1 では本 Issue スコープ外として記録のみ。rule-ownership appendix の IR-061 行は Related REQ/SPEC を - とし、Phase E での対応候補として PR 本文 Findings に明記。appendix 自体は Wave 1 スコープで完成させた。
- **ユーザー確認有無**: なし（エージェント自律でスコープ外判断、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: なし（本件は IR-061 の frontmatter 形式不整合であり、既存 IR-* 形式への整合化は Phase E 以降のスコープ）。
- **横展開観点**: IR-* frontmatter 形式統一に向けた知見。新規 IR 作成時は標準形式（id/title/domain/related_req/related_spec）を必須とし、本文 prose は補足用途とすることで、機械的処理（rule-ownership appendix 生成等）の信頼性向上。
- **再発条件**: (1) 新規 IR 作成、(2) IR-* frontmatter 標準形式不遵守、(3) 機械的処理（appendix 生成等）で関連情報参照、の全てが揃った場合。
- **予防策候補**: (a) 新規 IR 作成時、frontmatter に elated_req / elated_spec フィールドを必須化する。(b) Phase E で IR-061 frontmatter への同フィールド追加、または本文 prose からの抽出拡張を実装。
- **想定反映先**: IR-061 frontmatter、Phase E での IR-* 形式整合化、rule-ownership appendix 生成ロジック
- **関連**: PR #1628, Issue #1623, IR-061, Wave 1, Phase E
- **タグ**: #ir-format #frontmatter #related-req-spec #phase-e #wave-1 #rule-ownership
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## 配布物 SKILL.md の DERIVE 宣言に内部 ID を含めると IR-055 strict violation となる設計制約（Wave 4 実証）

- **問題事象**: Wave 4（PR #1631）で src/opencode/skills/agentdev-*/SKILL.md 25ファイルへ原本（SSoT）節を新設し、SPEC 参照と DERIVE 宣言を記述した際、初期実装で原本節に `REQ-0140-041/042` を含めたところ IR-055 strict violation（84件）が検出された。配布物（src/opencode/skills/）は consumer 環境（AgentDevFlow プラグイン利用先）へ配布されるため、consumer 側に存在しない内部 REQ-ID への未解決参照となり strict violation となる。
- **発生局面**: 実装（case-run Wave 4 #1627 PR #1631、SKILL.md 原本節新設時）
- **検知方法**: check_integrity.ts 実行で IR-055 strict violation 84件を検出。追加行に `REQ-[0-9]` パターンが含まれることを `git diff main` で確認。
- **根本原因**: IR-055 は配布物（src/opencode/{commands,skills}/）に AgentDevFlow 内部 ID（REQ-XXXX/ADR-XXXX/SPEC-{KIND}-{NNN}/IR-XX 等）が残留することを検出するルール。consumer 環境ではこれらの内部 ID は解決できないため、配布物仕様として禁止されている。SKILL.md の DERIVE 宣言は配布物の一部であり、内部 ID の直接言及は IR-055 違反となる。
- **自律対応内容**: PR #1631 で原本節から内部 REQ-ID を除去し、SPEC 参照リンク（`docs/specs/skills/agentdev-{name}.md`）と機能的記述（「本 SKILL.md は実行入口であり、SPEC を SSoT として DERIVE する」「extension は標準 SKILL.md を前提とし、重複しない補完情報のみを提供する」）のみで DERIVE 宣言を完結。再検証で IR-055 violation 0件を確認。
- **ユーザー確認有無**: なし（エージェント自律で設計判断、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: あり（要評価）。REQ-0108（配布物境界）の具体的事例。SC-002 SPEC または document-type-responsibilities SPEC に「SKILL.md DERIVE 宣言は SPEC 参照リンクと機能的記述のみで完結し、内部 ID の直接言及は避ける」設計指針の明文化候補。
- **横展開観点**: 配布物（src/opencode/{commands,skills}/）の自然言語記述で内部 ID を参照する全ケースに適用可能。DERIVE 機構、REFERENCE、See Also 等の参照リンクは SPEC または外部ドキュメントへの相対パスで表現し、内部 ID（REQ-/ADR-/SPEC-/IR-）の直接言及は避ける設計が適切。
- **再発条件**: (1) 配布物（src/opencode/skills/）の SKILL.md を編集、(2) DERIVE 宣言または参照記述に内部 ID（REQ-XXXX 等）を含める、(3) check_integrity.ts または CI で IR-055 を検査、の全てが揃った場合。
- **予防策候補**: (a) SC-002 SPEC または document-type-responsibilities SPEC に「SKILL.md DERIVE 宣言は SPEC 参照リンクと機能的記述のみで完結し、内部 ID の直接言及は避ける」設計指針を明文化する。(b) case-run skill の検証テンプレートに「配布物変更時は IR-055 strict violation 0件を必須確認」項を追加する。(c) SKILL.md テンプレート（agentdev-skill-authoring）に原本節の標準フォーマット（内部 ID を含めない）を定義する。
- **想定反映先**: `docs/specs/responsibilities/document-type-responsibilities.md`（SKILL.md DERIVE 機構の設計指針）、`docs/specs/integrity/index-auto-generation.md`（SC-002 SPEC、配布物と内部 ID の境界）、`src/opencode/skills/agentdev-skill-authoring/`（SKILL.md テンプレート）、case-run skill 検証テンプレート
- **関連**: PR #1631, Issue #1627, Epic #1622 Wave 4, REQ-0140-041/042, IR-055, SC-002 Phase D, AG-012, U-012
- **タグ**: #wave4 #skill-md #derive #ir-055 #strict-violation #internal-id #distribution-boundary #consumer-environment #sc-002 #phase-d
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## worktree 委譲先での cd 操作誤りによるメインリポジトリ一時汚染と検出・是正パターン（Wave 5 実証）

- **問題事象**: Wave 5（PR #1632）で case-run 実行担当サブエージェント（deep category）へ worktree root（`.worktrees/1626-maintenance`）配下での作業を委譲した際、委譲先が検証ステップで cd 操作を誤り、一時的にメインリポジトリ（`C:/Users/ogatay/work/agent-dev-flow`）の作業ツリーへ変更を迷い込ませた。委譲先は即座に異常を検知し、(a) パッチ抽出、(b) worktree 再適用、(c) メインリポジトリ `git checkout --` で原状復帰する手順で是正。最終状態でメインリポジトリに本 PR 由来の変更は一切残らなかったが、worktree 隔離原則の一時的破綻事例として記録する。
- **発生局面**: 実装・検証（case-run Wave 5 #1626 PR #1632、委譲先での検証ステップ）
- **検知方法**: 委譲先の自律検知。cd 操作後に git status で対象ファイルパスが worktree root 配下でないことを確認し、即座に是正シーケンスへ移行。
- **根本原因**: 委譲先プロンプトで worktree root の絶対パスを明示していたが、検証ステップで bash コマンドを連続実行する際に `cd` を伴う操作（例: 別ディレクトリへの移動を伴うスクリプト実行）で worktree root を離れる余地があった。委譲先は worktree 隔離原則を理解していたが、操作の連続性の中で一時的な離脱が発生。
- **自律対応内容**: 委譲先が (a) 異常検知、(b) 変更内容のパッチ抽出、(c) worktree root への再適用、(d) メインリポジトリ `git checkout --` で原状復帰、(e) 最終 git status でクリーン状態を確認、の5ステップで是正。PR 本文 Findings に経緯を明示。case-auto 側でもマージ前に git status でメインリポジトリの状態を確認し、本 PR 由来の変更が残っていないことを検証済み。
- **ユーザー確認有無**: なし（エージェント自律で検出・是正、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: なし（本件は case-run 委譲時の worktree 運用リスクの運用知見であり、新規 ADR/REQ/spec 影響はない。adapter protocol で規定される worktree 隔離原則の一時的破綻と回復の具体的事例）。
- **横展開観点**: case-run 実行担当サブエージェントへ worktree root 配下での作業を委譲する全ケースに適用可能。(a) 委譲先プロンプトで worktree root の絶対パスを明示するだけでなく、検証ステップで `cd` を伴う操作を禁止する、または worktree root 配下でのみ実行するスクリプト形式を推奨する。(b) case-auto 親ループは case-run 委譲完了後にメインリポジトリの git status を確認し、本 PR 由来の変更がないことを検証する防壁を標準搭載する。(c) 委譲先は worktree 隔離原則を事前確認し、cd 操作の必要性がある場合は作業前に親へ申請する運用。
- **再発条件**: (1) case-run を委譲先へ worktree root 配下で実行させる、(2) 委譲先が検証ステップで `cd` を伴う操作を実行する、(3) worktree root の絶対パスを離れる余地がある、の全てが揃った場合。
- **予防策候補**: (a) 委譲先プロンプトの MUST DO に「worktree root 配下でのみ作業し、cd で worktree root を離れる操作は禁止。検証コマンドは worktree root を基準とした相対パスまたは絶対パスで実行」を明記。(b) adapter protocol skill または case-run skill に worktree 隔離原則違反時の検出・是正手順を標準化。(c) case-auto 親ループに「case-run 委譲完了後、メインリポジトリ git status でクリーン状態を確認する」標準ゲートを組み込む。
- **想定反映先**: `agentdev-case-run-execution-adapter` SKILL.md（worktree 隔離原則と検出・是正手順）、case-auto command SPEC（委譲完了後のメインリポジトリ状態確認ゲート）
- **関連**: PR #1632, Issue #1626, Epic #1622 Wave 5, adapter protocol, worktree 隔離原則
- **タグ**: #wave5 #worktree #isolation-violation #delegation #adapter-protocol #case-auto #case-run #recovery
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## verification-only 空 PR の squash merge 許容性

- **問題事象**: Epic #1711 Wave 1 (OU-001 #1712) は完全性台帳作成のみで実装差分0件の verification-only PR となった。GitHub が空コミット単体の squash merge を許容するか不確実だったため、マージ可否の事前確認が必要だった。
- **発生局面**: case-close（PR マージ）
- **検知方法**: `gh pr view 1715 --json mergeable,mergeStateStatus` で MERGEABLE/CLEAN を確認後、`gh pr merge 1715 --squash` を実行
- **根本原因**: REQ-0158-002 で verification-only PR の PASS ロジックが要件化されているが、GitHub が空コミット単体の squash merge を許容するかの実証がなかった
- **自律対応内容**: GitHub が空コミット単体の squash merge を許容することを実証（PR #1715 merge commit 41cf19de）。REQ-0108-279 の「GitHub が空 PR の squash merge を許可し空 commit を生成することを前提とする」が実証済みとなった
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（実証結果。REQ-0108-279 の前提を強化する観測結果）
- **横展開観点**: 今後 verification-only PR を作成する case で、GitHub squash merge が許容されることが確定したため、空 PR の取り扱いで躊躇不要
- **再発条件**: verification-only PR（実装差分0件）を作成する case
- **予防策候補**: 特になし（実証済み）。case-run で verification-only PR を作成する際、mergeable 確認後に自信を持ってマージ可能
- **想定反映先**: REQ-0108-279 の実証根拠（参照用）、case-run execution adapter（verification-only PR 作成時の判断材料）
- **関連**: PR #1715, Issue #1712, REQ-0158-002, REQ-0108-279, Epic #1711
- **タグ**: #verification-only-pr #empty-commit #squash-merge #github #req-0108-279 #epic-1711
- **移動日**: 2026-07-22
- **処分判定**: deferred（learning-promote 2026-07-22 評価。詳細は evaluation-report.md 参照）

---


## 2026-07-23: 用語表記揺れの横断確認不足（SPEC 起票時の揺れが同一文書内に残留）

- **問題事象**: `spec-health-metrics.md`「SPEC 横断診断」節に「論理区分不当混成」（機械化境界段落）と「論理区分不当混在」（検出パターンテーブル行）の表記揺れが同一節内に残留していた。Phase 1 commit 0192019c 起票時の揺れと推定される。REQ-0108-285（「論理区分の不当な混在」）、Issue #1742 完了条件 #6（「不当混在」）とも矛盾する表記。同種の揺れが他 SPEC にも残留していないか、inspect-docs / doc-writing 査読での横断確認が望ましい。
- **発生局面**: case-close（Wave 3 PR #1749、SPEC 起票時）
- **検知方法**: PR 本文 Findings / Capture候補 セクション（Wave 3 PR #1749）
- **根本原因**: SPEC 起票時の用語統一チェックが不十分。
- **自律対応内容**: 表記揺れを是正（どちらかに統一）。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（表記是正のみ）
- **横展開観点**: 他 SPEC でも用語揺れは発生し得る。SPEC 全般に適用可能な汎用課題。
- **再発条件**: SPEC 起票時に用語統一を意識しない場合。Phase 1 commit 起票時の揺れが SPEC merge 後も残存し得る。
- **予防策候補**: (a) SPEC 起票時の用語統一チェックの強化、(b) inspect-docs への用語揺れ検出パターン追加の検討
- **想定反映先**: `inspect-docs` command（用語揺れ検出パターン）、`agentdev-doc-writing` skill（SPEC 起票時チェック強化）
- **関連**: PR #1749, Issue #1742, Epic #1736, REQ-0108-285, `docs/specs/skills/spec-health-metrics.md`, commit 0192019c
- **タグ**: `#terminology` `#表記揺れ` `#spec-health-metrics` `#横断確認` `#spec-authoring`
- **移動日**: 2026-07-23
- **処分判定**: deferred（出現1件、即時昇華には具体性不足。deferred.md に類似事例（duty keyword 中黒化、SUB-D gloss 形式）あり。次回再評価対象）

---


---


## 2026-08-09: 移行計画 §5.3 の明示対象不足による壊れた fixture 修復見送りリスク

- **問題事象**: 移行計画 §5.3 で `commands_error_cases.test.ts` の修復を明示したが、`commands_structure.test.ts` と `command_fixtures.test.ts` も同様の文字化け・改行崩壊があった。§5.3 は前者のみを明示対象としたが、壊れた fixture の修復としては後者2件も含めて対処すべきだった
- **発生局面**: 実装（Wave 2 WP-1 case-run、PR #1933 作成時）
- **検知方法**: PR #1933 本文「Findings / Capture候補」セクション learning の自己申告。実装修復中に §5.3 明示対象外の fixture にも同種の文字化け・改行崩壊を発見
- **根本原因**: 移行計画の事前調査が壊れた fixture を網羅せず、代表例のみを明示対象とした。同種の問題を持つファイルの横展開確認が計画段階で実施されなかった
- **自律対応内容**: PR #1933 で §5.3 明示対象外の `commands_structure.test.ts`、`command_fixtures.test.ts` も併せて修復し、新 frontmatter 契約（description 単一）へ適合させた
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（移行計画の記載精度の改善候補。SPEC/REQ 本文の変更は伴わない）
- **横展開観点**: 移行計画や要件定義で「代表例を明示」する全ケースで、同種の問題を持つ対象の横展開確認を計画段階で実施すべき。明示対象を「例示」として扱い、同種調査を暗黙に含意させる記述が有効
- **再発条件**: 移行計画や要件定義で、同種の問題を持つ複数対象のうち代表例のみを明示し、横展開確認を省いた場合
- **予防策候補**: 移行計画の対象一覧に「同種問題の横展開確認」を暗黙の前提とする旨を記載、または明示対象を「例示」と注記する運用ルールを定める
- **想定反映先**: 移行計画テンプレート（`.omo/plans/` 配下）の対象一覧記述ガイドライン、または `docs/guides/` の計画策定解説文書
- **関連**: Epic #1924、Issue #1926（WP-1）、PR #1933、移行計画 `.omo/plans/agentdev-migration-2026-08-05.md` §5.3
- **タグ**: `#learning` `#migration-plan` `#fixture-repair` `#scope-precision` `#horizontal-expansion`
- **移動日**: 2026-08-09
- **処分判定**: deferred（出現1件・反映先曖昧・移行一回限り・情報断片的。次回 learning-promote で再評価）

---


## 2026-08-09: command 薄型化による既存参照の行移動で baseline 比較が新規 delta を生む制約

- **問題事象**: WP-4 command 薄型化で `case-run.md`、`case-close.md` 内の `repo-agentdev-integrity` スクリプト呼出し参照行が、周辺行の大規模削除に伴って元の行位置から別行へ移動した。IR-055 RuntimeReference baseline は行位置で既知参照を管理しているため、機能的に同一の参照が baseline 比較で新規 delta（unmanaged NG）として検出された。check_integrity.ts の NG 件数が 3件（IR-061 既知）から 5件（IR-061 既知3 + IR-055 delta 2）へ増加した
- **発生局面**: 実装（WP-4 case-run、command 薄型化による大規模行削除・移動時）
- **検知方法**: WP-4 case-run で check_integrity.ts の before（HEAD: 18002bfe）と after（HEAD: 90592b53）delta を比較し、NG +2件が IR-055 RuntimeReference delta であることを特定。PR #1936 本文「## 残リスク / follow-up」へ記録
- **根本原因**: IR-055 RuntimeReference baseline が参照の「存在」ではなく「行位置」で既知性を管理している。command 薄型化のように行数を大幅に削減するリファクタでは、内容が同一でも参照行が移動し baseline との不一致が生じる。baseline は commit 単位で更新される前提だが、TASK MUST NOT DO「baseline を修正しない」により薄型化 PR 内で解消できない
- **自律対応内容**: PR #1936 では baseline を更新せず（MUST NOT DO 拘束）、IR-055 delta 2件を PR 本文「残リスク / follow-up」へ明示的に記録し、WP-6（#1931 索引再生成・統合検証）での一括解消または独立 baseline メンテナンス Issue へ委譲することを推奨。機能的変更ではないことを PR 本文で証明（WP-2 PR #1934 で対応済みの `repo-*` 参照の行移動のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（baseline 運用設計の改善候補。REQ/ADR/SPEC 本文の変更は伴わない。IR-055 baseline の管理粒度＝行位置ベースか内容ベースかは checker 実装の設計事項）
- **横展開観点**: 行位置ベースで既知参照を管理する checker（RuntimeReference baseline 等）全般で、大規模リファクタ・縮約を実施すると既存参照の行移動が delta として検出される。command 薄型化、skill 統合、ファイル分割・マージ等の構造変更を伴う作業で同様の制約が顕在化する
- **再発条件**: 行位置ベースの baseline で参照を管理する checker が存在する状態で、当該 baseline 対象ファイルの行数を大幅に削減・再構成するリファクタを実施する場合
- **予防策候補**: (a) baseline の管理粒度を「行位置」から「参照識別子（ファイルパス + 参照名）」へ移行し行移動に鈍感にする、(b) 大規模リファクタ PR の完了条件へ「baseline 更新または delta 許容の明示」を含める、(c) checker 側で行移動のみの delta を info/warning へ再分類する option を追加する
- **想定反映先**: repo-agentdev-integrity SPEC / check_integrity.ts（baseline 管理粒度の見直し候補）、agentdev-workflow-lifecycle（大規模リファクタ時の baseline 取扱手順）、移行計画 `.omo/plans/agentdev-migration-2026-08-05.md` §10.6（baseline 新規追加 0件 の運用解釈）
- **関連**: Epic #1924、Issue #1929（WP-4）、PR #1936、`src/integrity/baselines/*.json`、`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- **タグ**: `#learning` `#baseline` `#integrity-checker` `#command-thinning` `#line-position-tracking` `#refactor-delta` `#wp-4` `#migration-2026-08`
- **移動日**: 2026-08-09
- **処分判定**: deferred（出現1件・費用対効果やや割高・技術判断含むが未成熟。大規模リファクタ再発時に再評価。ADR 候補は具体性不足で見送り）

---


## 2026-08-09: bun test の Bun.spawnSync は Windows 環境で CLI 引数パース順序に注意が必要

- **問題事象**: bun test で CLI 引数をパースするテストを Bun.spawnSync 経由で実行した際、Windows 環境でフラグと値のペアをスキップする順序が期待と異なり、テストが意図した引数を認識しなかった
- **発生局面**: 実装（agentdev-artifact-graph 標準スキルのテスト作成時、CLI エントリポイント build_graph/check_graph/query_graph の引数解釈を検証するテスト）
- **検知方法**: PR #1955 実装者が Windows 環境でテストを実行し引数スキップ挙動の差異へ遭遇、Findings セクションへ自己申告した
- **根本原因**: Bun.spawnSync の引数配列処理が Windows ではプラットフォーム固有の挙動を持ち、フラグ+値のペアを正しくスキップするためにパース順序を明示する必要があった
- **自律対応内容**: フラグ+値のペアを正しくスキップするようパース処理を修正し対応
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。実装・テスト環境依存知見であり、正規仕様の要件は変更しない
- **横展開観点**: Bun.spawnSync 経由で CLI の引数処理を検証するテスト全般で、Windows と POSIX で引数スキップ順序の差異を考慮する必要がある
- **再発条件**: bun test で CLI 引数解釈を検証し、かつ実行環境が Windows の場合
- **予防策候補**: Bun.spawnSync の引数処理テストは Windows と POSIX 両方で実行し差異を検出する。フラグ+値のペアスキップは位置ではなくトークン種別で判定する
- **想定反映先**: agentdev-artifact-graph のテスト設計、Bun.spawnSync を用いる CLI テストのマルチプラットフォーム対応手順
- **関連**: Epic #1948、Issue #1949、PR #1955、`src/opencode/skills/agentdev-artifact-graph/scripts/tests/`
- **タグ**: `#learning` `#bun` `#bun-test` `#windows` `#cli-args` `#cross-platform`
- **移動日**: 2026-08-09
- **処分判定**: deferred（出現1件・環境依存・具体性やや不足。Bun.spawnSync CLI テスト再発時に具体化）

## 2026-08-10: Windows PowerShell で gh pr create --body-file が多重エンコード化け、gh api PATCH で修復した事象

- **問題事象**: Windows PowerShell 環境で gh pr create --body-file に UTF-8 BOM なしファイルを渡して PR を作成したところ、PR 本文が多重エンコード化け（UTF-8 バイト列を ASCII 数字文字列として展開した状態）になった。chcp 65001 + PYTHONIOENCODING=utf-8 のコンソールエンコーディング初期化を実施しても防止できなかった。
- **発生局面**: 実装（case-run インライン実行での PR 作成、PR #1976 経路D learning-promote）
- **検知方法**: PR 作成後に PR 本文を目視確認した際、日本語が数値列へ破損していることを発見
- **根本原因**: agentdev-gh-cli standard-procedures.md「コンソールエンコーディング初期化」（Section 2 Step 0 の3行）は gh CLI の stdout/引数渡し経路の一部を保護するが、gh pr create --body-file の本文読み込み経路において Windows 環境固有の多重エンコード変換を完全には防止できない。ファイル本文の decode 経路が Step 0 のコンソールコードページ切替えとは独立して cp932 影響を受ける場合がある。
- **自律対応内容**: gh pr create で一旦 PR を作成した後、Node.js で本文を UTF-8 JSON ファイルへ書き出し、gh api -X PATCH /repos/{owner}/{repo}/pulls/{N} --input <JSON> 経由で PR 本文を上書き修復した。
- **ユーザー確認有無**: なし（エージェント自律で検知・修復）
- **ADR/REQ/spec影響**: あり。agentdev-gh-cli SPEC / standard-procedures.md の WRITE 手続き（PR 作成）において、--body-file のみで本文化けが残るリスクと gh api PATCH による修復経路の標準化が必要。RU-0005 AG-001（--title inline 禁止、title 修正は REST API PATCH 標準手続き）と同種の経路分離問題だが本文側。
- **横展開観点**: Windows 環境で gh CLI の WRITE 操作（Issue 作成、Issue 本文更新、PR 作成、コメント追加）全般で、--body-file 指定でも本文 decode 経路の cp932 影響を完全排除できない可能性。Step 0 実施を前提としつつ、作成後の本文 VERIFY（読み戻し）で化け検出を必須化すべき。
- **再発条件**: Windows PowerShell/pwsh 環境で gh pr create --body-file（または gh issue create --body-file）を日本語本文付きで実行し、コンソールエンコーディング初期化後でも本文 decode 経路が cp932 影響を受ける条件。
- **予防策候補**: (1) WRITE 後 VERIFY で本文を読み戻し mojibake 検出を必須化、(2) 本文化け検出時は gh api -X PATCH --input <JSON>（Node.js UTF-8 書き出し）で修復する標準手順を standard-procedures.md へ追記、(3) title 修正 REST API PATCH 標準手続きと対になる本文修正手順の整備。
- **想定反映先**: .opencode/skills/agentdev-gh-cli/references/standard-procedures.md（WRITE 手続きセクション、VERIFY セクション）、verify.md（mojibake 検出観点）
- **関連**: PR #1976（経路D learning-promote）、PR #1973（Wave 1、本件発生時は観測されず本文正常を確認済み）、agentdev-gh-cli standard-procedures.md Section 2 Step 0、RU-0005 AG-001/AG-002
- **タグ**: `#windows` `#encoding` `#gh-cli` `#write-procedure` `#verify`
- **移動日**: 2026-08-10
- **処分判定**: deferred（現行 retry.md 維持、再発時再評価。VERIFY で検出可能、retry.md は自動代替禁止・停止報告を要求）

---


## 2026-08-10: docs/adr/ 削除時の guides/ 配下参照更新スコープの初期漏れ

- **問題事象**: docs/adr/ 配下を DEC-001..008 移行後に削除した際（Wave 3a #2035）、参照更新スコープの初期設計で docs/guides/ 配下（artifacts-and-state.md, diagnostics-and-maintenance.md, glossary.md, project-docs-and-specs.md の4ファイル）からの docs/adr/ パス参照を見落とすリスクがあった。docs/guides/ は案内層（REQ-001）であり SPEC 層とは別物のため、SPEC 移行スコープに暗黙に含まれなかった。
- **発生局面**: 実装（Wave 3a #2035 ADR-001..008 → DEC-001..008 移行、docs/adr/ 削除、PR #2040）
- **検知方法**: Wave 3b #2036 consumer・検証基盤移行、Wave 4 #2037 E2E 検証時の残骸検査 grep により docs/adr/ 参照残存を確認。現在は docs/guides/ 配下で docs/adr/ 参照は0件、docs/decisions/ 参照4ファイルへ更新完了済み
- **根本原因**: 移行スコープを「SPEC と検証基盤」として設計した際、案内層（docs/guides/）を独立 consumer として明示的にスコープに入れていなかった。docs/guides/ はREQ-001 の案内層に属し SPEC 体系とは別階層のため、横断 grep の対象ディレクトリリストから漏れやすい
- **自律対応内容**: Wave 3b で consumer 一括更新、Wave 4 で残骸検査により docs/guides/ 配下の docs/adr/ → docs/decisions/ 参照更新を完了。最終的に broken link 0件を確認
- **ユーザー確認有無**: なし（Epic 完了判定内で自律完結）
- **ADR/REQ/spec影響**: あり。REQ-001（文書体系、案内層・基準境界）において、ディレクトリ削除・rename を伴う横断変更時の案内層（docs/guides/）スコープ明示要件、または agentdev-artifact-validation の change-impact チェック対象へ docs/guides/ を含める検討が必要
- **横展開観点**: ディレクトリ削除・大量 rename を伴う変更全般で、SPEC/REQ/ADR の基準層だけでなく案内層（guides）、README、AGENTS.md も独立 consumer としてスコープ管理すべき。将来の document-type 移行（例: SPEC → 別体系）でも同様
- **再発条件**: docs/ 配下のディレクトリ削除・rename を伴う変更において、案内層（docs/guides/）や README を参照更新スコープから漏らす場合
- **予防策候補**: (1) agentdev-artifact-validation check-change-impact の対象ディレクトリへ docs/guides/ を明示追加、(2) ディレクトリ削除前の broken link 一括検査プロセス標準化（grep -r "docs/{old_dir}/" docs/）、(3) case-open の Wave 分解時に案内層 consumer を明示スコープに含める基準の整備
- **想定反映先**: `agentdev-artifact-validation` スキル、REQ-001 文書体系 SPEC、`agentdev-workflow-lifecycle` スキル（Wave スコープ設計基準）
- **関連**: Epic #2032, #2035 (PR #2040, 9ea67084), #2036 (PR #2041), #2037 (PR #2042), docs/guides/artifacts-and-state.md, docs/guides/glossary.md, docs/guides/project-docs-and-specs.md, docs/guides/diagnostics-and-maintenance.md
- **タグ**: `#broken-link` `#guides-scope` `#案内層` `#change-impact` `#migration`
- **移動日**: 2026-08-10
- **処分判定**: deferred（IR-057 拡張で対応候補、再評価時まで保留。check-change-impact.ts では未変更 path 検出不可）

---


## 2026-08-10: v2: 履歴参照保護の運用成功（AG-010、大規模 rename 移行事例）

- **問題事象**: ADR → Decision 移行は大規模 rename（766件の ADR 参照、Artifact Graph 776 nodes が対象）であり、Git history rewrite や文字列一括置換で v2:ADR-* 歴史参照を破壊するリスクがあった。AG-010（v2:ADR-* 履歴参照は維持、文字列一括置換禁止、AG-016）を運用基準として採用し、52件の v2:ADR-* 歴史参照を破壊なく維持して移行を完遂した。これは「v2: prefix による履歴参照保護」運用の成功事例である。
- **発生局面**: 実装（Wave 3a/3b/4 #2035, #2036, #2037、移行全行程）
- **検知方法**: Wave 4 #2037 E2E 検証・残骸検査で v2:ADR-* 歴史参照52件が維持されていることを確認。Artifact Graph で decision node 9件、adr node 0件、valid=true を確認。DEC-009 が AG-010 関連を明記し relates-to で v2:ADR-* を参照
- **根本原因**: （成功事例のため根本原因ではなく成功要因）成功要因は3点: (a) v2: prefix による履歴参照と現行参照の構文的分離が事前に確立されていた、(b) 文字列一括置換を禁止し8分類で個別対応する方針（AG-016, CR-005）を厳格運用、(c) Artifact Graph が node_type で移行前後を区別し破壊的変更を検知可能だった
- **自律対応内容**: Wave 3a/3b で v2:ADR-* 参照を一括置換対象から明示除外し、現行 ADR-NNNN 参照のみ DEC-NNN へ個別更新。Wave 4 で v2: 参照件数維持を E2E 検証項目に含め回帰確認
- **ユーザー確認有無**: なし（AG-010 は case-open 時に合意済みの運用基準）
- **ADR/REQ/spec影響**: あり（肯定的影響）。AG-010 運用成功事例として、REQ-001（識別子不変原則、056-064）と DEC-009 に v2: 履歴参照保護パターンの成功実績が記録された。将来の大規模 rename 移行（SPEC 体系変更、RU ID 形式変更等）で同パターンを再利用すべき
- **横展開観点**: v2: prefix による履歴参照保護パターンは ADR → Decision に限定されず、あらゆる ID 形式変更を伴う移行で適用可能。成功の3要因（構文的分離、個別対応方針、Graph による検知）をセットで将来移行に適用すべき
- **再発条件**: （成功事例のため再発ではなく再適用条件）ID 形式変更を伴う大規模 rename 移行で、(a) v2: prefix 等の履歴参照構文が事前確立、(b) 文字列一括置換禁止と個別分類対応の方針採用、(c) Artifact Graph 等の破壊検知基盤存在、の3条件が揃う場合
- **予防策候補**: （成功事例のため予防策ではなく再利用提案）(1) REQ-001 または guides に「大規模 rename 移行時の v2: 履歴参照保護パターン」を成功実績として明記、(2) 将来の ID 形式変更を伴う RU（SPEC 体系変更等）で AG-010 相当の運用基準を case-open の合意事項に標準組み込み、(3) inspect-docs / artifact-validation に「v2: 参照件数の移行前後比較」チェック観点を追加
- **想定反映先**: docs/guides/artifacts-and-state.md（v2: 履歴参照の運用解説）, REQ-001 文書体系 SPEC（識別子不変原則・056-064 補強）, `agentdev-workflow-lifecycle` スキル（大規模 rename 移行の Wave 設計基準）
- **関連**: Epic #2032, #2035 (PR #2040), #2036 (PR #2041), #2037 (PR #2042), DEC-009（AG-010 relates-to 明記）, AG-010, AG-016, CR-005（8分類）, REQ-001-056〜064
- **タグ**: `#v2-history` `#ag-010` `#rename-migration` `#成功事例` `#artifact-graph`
- **移動日**: 2026-08-10
- **処分判定**: deferred（理由修正: REQ-001-008/012〜015 + DEC-009 AG-010/016 で本質カバー。playbook 未整備は low-pri）

---


## detector 個別 unit test 拡充不足パターン（file-scope violation 検出 vs detector 単位カバレッジ）
- **問題事象**: Phase 6 (OU-007 #2083) で Phase 3 §5.1 残り7件 detector（IR-028/029/030/031/034/035/046/047/048）を集約実装した。全ファイルスキャン（`check_command_format.ts`/`check_distribution_boundary.ts`/`check_integrity.ts`）で violation 0件、test suite pass を確認したが、各 detector の violation 検出ロジックを個別に検証する unit test（violation を含む fixture を与えて当該 detector が正しく検出するかを検証するテスト）が拡充不足。TS-006（現存全 IR に regression test が存在する）は file-scope violation 検出なしで合格だが、detector 単位のカバレッジ品質は warn 事項として記録
- **発生局面**: 実装（case-run Phase 3 §5.1 detector 集約）、完了処理（case-close QG-4 AC-06/TS-006 評価）
- **検知方法**: PR #2090 の Phase 6 最終検証レポート（`docs/specs/integrity/audits/final-reverification-20260811.md`）で AC-06 = TS-006 を warn 評価。pass_criteria「violation 検出なし」は満たすが、detector 単位の violation 含み fixture を用いた unit test が網羅されていないことを検知
- **根本原因**: detector 実装時、(a) 既存ファイルに対する violation 検出がないことの確認（file-scope）は実施するが、(b) 意図的に violation を含む fixture を与えて当該 detector の検出ロジックを直接検証する unit test の実装を detector 集約時に組み込む運用が明文化されていない。REQ-028-006「detector 単位 regression test」の運用基準が SPEC で不明確
- **自律対応内容**: TS-006 pass_criteria「violation 検出なし、regression test 存在」は満たすため AC-06 を warn（継続課題）として合格判定。file-scope の regression test は既存 test suite で担保されているため REQ-028 全要件成立を妨げない。detector 単位 unit test 拡充は intake inbox（Wave 7）へ課題記録
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（REQ-028-006 detector 単位 regression test の運用基準、AC-06/TS-006 pass_criteria の明確化）。learning-promote で SPEC 改修要否を評価する対象
- **横展開観点**: 将来 detector を追加実装する全 IR 対応（Phase 3 §5.1 以降の拡張、新規 IR登録 gate での detector 実装）で同様の detector 単位 unit test 拡充不足が再発する可能性
- **再発条件**: detector を集約実装・追加実装する際、file-scope violation 検出テストのみで detector 単位の violation 含み fixture テストを省略した場合
- **予防策候補**: detector 実装時の必須 deliverable として「violation 含み fixture を用いた unit test」を文書化。REQ-028-006 SPEC へ detector 単位テストの運用基準を追記
- **想定反映先**: `docs/specs/integrity/integrity-contracts.md`（REQ-028-006 detector 単位 regression test 基準）、`src/opencode/skills/repo-agentdev-integrity/scripts/`（detector unit test 拡充）、`docs/requirements/REQ-028.md`（REQ-028-006 運用基準明記）
- **関連**: PR #2090 Findings AC-06 warn, Epic #2076 OU-007 Phase 6, IR-028/029/030/031/034/035/046/047/048
- **タグ**: `#detector` `#unit-test` `#regression-test` `#coverage` `#req-028-006`
- **移動日**: 2026-08-15
- **処分判定**: deferred（出現1件。REQ-028-006 運用基準明確化の再評価対象（intake inbox Wave 7 記録あり））

---


## verify-only 検証で MOVE/RETIRE 済み REQ 行の現行根拠参照を grep 検出するパターン
- **問題事象**: OU-009 verify-only 検証の TS-012（参照残骸健全性）で、REQ-002 の MOVE/RETIRE 済み行（021..026, 028, 029, 032, 035）が `docs/specs/**` で現行根拠として参照されていた事例を検出した。TS-012 の現行根拠参照件数が 0 でない状態（1件: `harness-separation-model.md:125` の REQ-002-022）。
- **発生局面**: 検証（verify-only の参照残骸健全性検査、TS-012）
- **検知方法**: `grep -rE "REQ-002-(021|022|023|024|025|026|028|029|032|035)" docs/specs/` で MOVE/RETIRE 済み行 ID を検索し、履歴文脈（従来/MOVE先/RETIRE後/保有していた/move/retire/移動/廃止/欠番）を除外して現行根拠参照のみを抽出する。`grep ... | grep -iv "move\|retire\|従来\|移動\|廃止\|欠番\|context分離"` が有効に機能した。
- **根本原因**: REQ-002 → REQ-029 MOVE 実行時、`docs/specs/**` 内の現行根拠引用の全文洗い替えが 1件漏れていた。MOVE 操作時の cross-reference クリーンアップは原本（REQ ファイル）と SPEC/Decision 両方で必要だが、SPEC 本文内の括弧書き引用まで届いていなかった。
- **自律対応内容**: case-close QG-4 remediation scope（trivial citation fix）として REQ-002-022 → REQ-029-007 へ更新（commit 5c920055）。TS-012 stale-reference 件数を 0 へ解消し、QG-4 完了条件を達成。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（citation ID のみ修正、意味内容と enforcement は正しく維持。SPEC/REQ 本文変更なし、status frontmatter のみ更新）
- **横展開観点**: 将来の REQ MOVE/RETIRE 操作（req-save SPLIT/MERGE/MOVE）実行時、`docs/specs/**` と `docs/decisions/**` の現行根拠参照を grep 検査し、stale reference をクリーンアップする手順を検証工程または case-close QG-4 に組み込むことが望ましい。特に括弧書きの補足引用（「DEC-001 context管理harness委譲、REQ-NNN-NNN ...」形式）は機械的検出から漏れやすい。
- **再発条件**: REQ 行を MOVE/RETIRE する req-save 操作で、cross-reference の全文洗い替え（SPEC 本文内の括弧書き引用含む）が漏れた場合
- **予防策候補**: req-save MOVE/RETIRE 時、または case-close QG-4 で、MOVE/RETIRE 済み REQ 行 ID の docs 現行根拠参照を grep 検査する gate を検証工程へ導入する候補（別途 backlog-review で判断）。
- **想定反映先**: なし（本エントリは検証パターン記録。検出 gate の恒久化は別途 backlog-review で判断）
- **関連**: PR #2098, Issue #2093 (OU-009), Epic #2091, commit 5c920055, TS-012
- **タグ**: `#stale-reference` `#req-move` `#verify-only` `#grep-detection` `#ts-012` `#case-close-remediation`
- **移動日**: 2026-08-15
- **処分判定**: deferred（出現1件。検証パターン記録。具体修正は intake-2026-08-14-stale-req-002-022-reference-resolved.md で対応済み）

---


## 旧表現を禁止する是正注記で旧表現の字面を引用すると grep 0 件基準の機械検査と衝突する
- **問題事象**: system.md の Workflow Architecture Inventory 旧表現禁止注記が、禁止対象の旧表現の字面（「Command 定義が SSoT である」）をそのまま引用していた。このため「旧表現が 0 件であること」という grep 0 件基準の完了条件・機械検査と衝突する状態だった（禁止注記自体が grep に hit する）
- **発生局面**: 実装（case-run、OU-001 規範契約整合の検証・修正）
- **検知方法**: 完了条件の再 grep（「Command 定義が SSoT」全リポジトリ検索）で禁止注記の引用行が hit することで検知
- **根本原因**: 是正注記の執筆時に、禁止対象の意味と旧表現の字面を分離していなかった。「〜という旧表現を使用しない」形式は意味としては正しいが、機械検査（grep 0 件基準）と両立しない
- **自律対応内容**: 禁止の意図を維持したまま描写形（「Command 定義を権威情報源とする旧表現」）へ言い換え、字面の出現を 0 件にした（PR 2111、commit ce4ea7fd）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（執筆規範レベルの知見。agentdev-doc-writing / japanese-tech-writing の検証観点候補）
- **横展開観点**: 横断是正・用語統一を行うすべての Issue で、是正注記・移行注記に旧語の字面を引用しない。完了条件に grep 0 件基準を置く場合は特に注意
- **再発条件**: 旧表現禁止・用語統一のは正注記を、禁止対象の字面引用付きで執筆した場合
- **予防策候補**: 是正注記は描写形（「X を権威情報源とする旧表現」等）で書く。grep 0 件基準の完了条件を持つ Issue では、注記も含めた全体 grep を case-run と case-close の両方で実施する
- **想定反映先**: なし（知見記録。規範化の要否は backlog-review で判断）
- **関連**: PR 2111 Findings learning セクション, Issue 2101（OU-001）, Epic 2099
- **タグ**: #grep-zero-criteria #remediation-note #machine-check #writing-convention
- **移動日**: 2026-08-15
- **処分判定**: deferred（出現1件。執筆規範レベル知見。agentdev-doc-writing / japanese-tech-writing 検証観点の再評価対象）

---


## 配布物へ Workflow Skill の STEP 表を書く際、具体番号を書ける ID ファミリーは STEP / QG に限定される
- **問題事象**: 配布物（src/opencode/）に Workflow Skill の STEP 表を記述する際、STEP / QG 接頭辞は具体番号付きで配布可能（distributed-control として境界検査を通過）だが、他の全 ID ファミリー（REQ / DEC / ADR / AG / IR / TS / OU / RU / EC 等）は具体番号を書くと配布依存境界検査で違反または未分類エラーになる
- **発生局面**: 実装（Wave 2 Workflow Skill 作成、OU-002 / OU-003 / OU-004 並列 Wave）
- **検知方法**: `check_distribution_boundary.ts --profile source --json` の実行（具体番号記述が concrete_id_hits として検出される）
- **根本原因**: 配布依存境界 SPEC の ID 衛生規則。具体番号は消費者環境で解決不能なプロジェクト内部 ID である一方、STEP / QG は workflow 定義内で閉じた distributed-control の識別子として扱われる
- **自律対応内容**: 具体番号が必要な場面を STEP / QG に限定し、それ以外はマスク形式（REQ-{NNNN}-{NNN} 等）で統一して Wave 2 の3 Workflow Skill を作成した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（配布依存境界 SPEC の既定運用の明確化事象）
- **横展開観点**: 並列 Wave での Workflow Skill / Command 作成時、作成段階からマスク形式で書くことで境界検査の手戻りを防げる
- **再発条件**: 配布物にプロジェクト内部 ID の具体番号を記述した場合
- **予防策候補**: Workflow Skill / Command の新規作成手順（agentdev-skill-authoring / agentdev-command-authoring）への「具体番号は STEP / QG のみ、他はマスク形式」注意喚起の反映候補
- **想定反映先**: `src/opencode/skills/agentdev-skill-authoring/**` または agentdev-command-authoring（執筆規範側。要否は learning-promote で判断）
- **関連**: PR 2112 Findings learning セクション, Issue 2104（OU-004）, Epic 2099, 同時並行 Wave（PR 2113 / PR 2114）
- **タグ**: `#distribution-boundary` `#id-hygiene` `#mask-form` `#workflow-skill-authoring`
- **移動日**: 2026-08-15
- **処分判定**: deferred（出現1件。authoring 注意喚起候補（agentdev-skill-authoring / agentdev-command-authoring））

---


## ハーネス Write ツールのリポジトリ外 temp 書き込みが distribution-boundary-guard でブロックされる（worktree 内配置で回避）
- **問題事象**: ハーネス（OpenCode）の Write ツールでリポジトリ外 temp（`C:\WINDOWS\TEMP\opencode`）へスクリプトファイルを作成しようとすると、distribution-boundary-guard（`tool.execute.before` フック）にブロックされる事象を確認した。機械一括是正の作業ファイル出力先として同 temp を使用できない
- **発生局面**: 実装（case-run Wave 3、TS-105 機械判定是正のスクリプト作成時）
- **検知方法**: Write ツール実行時の distribution-boundary-guard によるブロック通知
- **根本原因**: 配布依存境界の多層 enforcement（REQ-029、DEC-014）が tool.execute.before フックでリポジトリ外書き込み経路を検出・ブロックする構成として機能している。設計どおりの挙動である
- **自律対応内容**: edit ツールによる逐次実行、または worktree 内（`.agentdev/tmp` 等、.git 管理領域配下）への作業ファイル配置で回避した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（guard の設計どおり。運用回避策の知見）
- **横展開観点**: 機械一括是正・スクリプト実行を伴う作業の作業ファイルは worktree 内へ配置する。agentdev-gh-cli 標準手続きの `.agentdev/tmp`（workspace-local）配置規定と同一方向の運用
- **再発条件**: Write ツールでリポジトリ外 temp へスクリプト等の作業ファイル作成を試みた場合
- **予防策候補**: 作業ファイルの worktree 内配置（`.agentdev/tmp` 等）の徹底。既存配置規定（RU-{NNNN} AG-{NNN} の workspace-local 配置）との重複確認
- **想定反映先**: なし（運用知見。規範化の要否は learning-promote で判断）
- **関連**: PR 2115 Findings learning セクション, Issue 2105（OU-005）, Epic 2099, REQ-029（配布依存境界）, DEC-014（多層 enforcement）
- **タグ**: `#distribution-boundary-guard` `#write-tool` `#temp-workspace` `#tool-execute-before` `#operations`
- **移動日**: 2026-08-15
- **処分判定**: deferred（出現1件。guard 設計どおりの挙動。回避策（worktree 内配置）の運用知見）

---


## autogen-index-regeneration-diff 拡張check の指定ツール generate_indexes.ts が adr-to-decision rename 未追随で EXIT_ERROR（中間 Wave は PR 索引影響なしで継続判断）
- **問題事象**: case-close（Epic #2119 Wave 2 クローズ）の Step E5b 前段で、workflow extension checks の `autogen-index-regeneration-diff`（.agentdev/extensions/skills/agentdev-workflow-case-close.yaml）が指定する `generate_indexes.ts --dry-run` が `docs/adr/README.md not found` で EXIT_ERROR 即時終了した。スクリプト最終更新 14f202f6（2026-07-26）は `docs/adr/` と `adr-*` block ID を前提とするが、リポジトリは adr-to-decision rename（a0143600、2026-08-10、#2042）後の `docs/decisions/` + `decision-*` block ID（14ブロック）へ移行済み。差分あり/なしのいずれの判定も出力不能な状態
- **発生局面**: 完了処理（case-close Epic Wave クローズ、Step E5b 前段の索引健全性検証）
- **検知方法**: `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts --dry-run` の実行で ADR README not found エラー。補助的に `check_autogen_freshness.ts --json`（REQ-010-059）を実行し、stale AUTOGEN block 4件（integrity-rule-catalog と rule-ownership の「ADR ↔REQ」→「Decision ↔REQ」用語 drift、req-health-metrics/spec-health-metrics の測定 block 古データ）を検出。DOC-MAP.md は #1958 で削除済みのため skip は正当
- **根本原因**: adr-to-decision rename（OU-005 #2042）が `generate_indexes.ts` の対象パス・block ID 定義に未反映。rename を横断是正する工程で配下スクリプトの追従検査が機能しなかった。また stale 4件はいずれも main HEAD 時点の既存債務で、本 Wave の PR はファイル変更 0 の verify-only PR（索引への影響なし）
- **自律対応内容**: 中間 Wave 2 では当該 PR が索引に影響を与えない（changedFiles=0）ため、check の保護目的（当該 PR 由来の再生成漏れ防止）は空しく充足されると判断してクローズを継続した。ツール破損と既存 stale 4件を完了報告へ明記し、解消（スクリプトの decisions 追随、または索引再生成 commit）は Wave 3 最終クローズまでの課題として先送りした。case-close 自身は索引ファイルを直接編集・commit していない（契約遵守）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（index-auto-generation SPEC が稼働契約とする生成スクリプトが実行不能。learning-promote で (a) generate_indexes.ts の docs/decisions 追随、(b) 拡張check の指定ツールを check_autogen_freshness.ts へ変更、(c) 索引再生成の専用工程化のいずれかを評価する対象）
- **横展開観点**: 同拡張check を持つ全 case-close（単一 Issue Step 3-3 含む）で同エラーが発生する。docs 構造変更（rename、削除）を伴う工期では配下の整合スクリプト追従を検証工程に組み込む必要がある
- **再発条件**: `generate_indexes.ts` が `docs/adr/` 前提のまま case-close の Step 3-3 / Step E5b 前段が実行される場合、全 case-close で再発
- **予防策候補**: rename 横断是正 PR に「参照スクリプトのパス・ID 定義追従確認」を必須項目化。または拡張check を、実行可能な freshness gate（check_autogen_freshness.ts）へ指定ツール変更し、 stale 時の停止条件を明文化
- **想定反映先**: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`（docs/decisions + decision-* block ID 追随）、`.agentdev/extensions/skills/agentdev-workflow-case-close.yaml`（checks セクションの指定ツール・失敗時扱いの明確化。要 learning-promote / backlog-review 判断）
- **関連**: Epic 2119 Wave 2, Issue 2121（OU-002）, PR 2125, a0143600（adr-to-decision rename #2042）, 87f00c48（DOC-MAP 削除 #1958）, docs/specs/integrity/index-auto-generation.md
- **タグ**: `#autogen` `#generate-indexes` `#adr-to-decision` `#extension-check` `#tool-broken` `#pre-existing-staleness` `#intermediate-wave`
- **移動日**: 2026-08-15
- **処分判定**: deferred（同一事象の intake item（intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md）が具体修正を管理中。次回実行時に intake 側処分と照合。一般化予防策（rename 横断是正 PR への参照スクリプト追従確認の必須項目化、拡張check 指定ツールの freshness gate 変更）は delta として次回昇華可否を判断する）

---


## RU-0004 が git 未コミットのまま Form Zero で削除され evidence 保存前提が欠落（審議実体は投影記録で検証）
- **問題事象**: RU-0004（`.agentdev/backlog/req-units/RU-0004.md`）が git に一度もコミットされないまま case-open の Form Zero クリーンアップで削除された。削除 commit 8249916c のメッセージは「RU-0001〜0004 を削除」と記載するが、実 diff は RU-0001〜0003 の3ファイルのみ。RU-0004 の受け入れ条件原本（1〜12）が git 履歴から復元不能になり、Epic 2119 完了条件（RD evidence の checked_at_commit 時点実在）の evidence 保存前提に欠陥が生じた
- **発生局面**: 完了処理（Epic 2119 Wave 3 クローズ、RD-004 evidence 実在評価）
- **検知方法**: PR #2127 検証時（Issue 2122 / OU-003）。commit 8249916c のメッセージと実 diff の不一致、および checked_at_commit 9d279917 時点の git tree に RU-0004.md が存在しないことの確認
- **根本原因**: backlog-review が session 由来 RU を生成した時点で git commit せず、Form Zero クリーンアップが untracked ファイルも削除対象とした。削除コミットメッセージと実 diff の乖離を検知する仕組みがない
- **自律対応内容**: RD-004 の審議実体（disposition: covered / reason_code: fully_applied）は Issue 完了条件への投影と Epic RD-004 記録を根拠に PR #2127 で検証した。Epic 2119 完了条件 Box4 は審議実体に基づき達成と評価し、記録プロセス欠陥を Epic 本文へ事実注記した（条件文言は不変更）。再発防止候補を本 entry として回収
- **ユーザー確認有無**: なし（case-auto の bounded parent decision resolution による作業仮定つき親判断）
- **ADR/REQ/spec影響**: なし（Epic 完了条件の評価記録は Epic Issue 本文へ注記済み。RU 生成・Form Zero 手順の変更は learning-promote / backlog-review で評価）
- **横展開観点**: session 由来 RU を扱う全 backlog-review / case-open（Form Zero）。evidence の git 実在を完了条件とする Epic の起票時
- **再発条件**: backlog-review が RU を git commit せず、case-open が Form Zero で untracked RU を削除した場合
- **予防策候補**: backlog-review が session 由来 RU を生成した時点でのコミット、または Form Zero 実行時の untracked RU 有無確認
- **想定反映先**: backlog-review の RU 生成手順、case-open の Form Zero 手順（いずれも要 learning-promote / backlog-review 判断）
- **関連**: PR #2127 Findings learning セクション, Issue 2122（OU-003）, Epic 2119（RD-004、Box4 評価注記）, commit 8249916c, RU-0004
- **タグ**: `#form-zero` `#req-unit` `#untracked-file` `#evidence-preservation` `#git-commit` `#epic-2119`
- **移動日**: 2026-08-15
- **処分判定**: deferred（出現1件。backlog-review（session 由来 RU の生成時コミット）と case-open（Form Zero の untracked RU 確認）の手順変更候補）

---


## Windows 環境でスクリプトの network 系コマンド不使用を「呼び出し記録型ダミー git.cmd」で実行時証明する検証技法
- **問題事象**: 導入系スクリプト（install-consumer-opencode.ps1）の「network 系コマンド不使用」をコード検査（grep）のみで証明すると、間接呼び出しや動的構築コマンドの見逃しリスクが残る。実行時に外部コマンドが実際に起動されないことを直接証明する手段が欲しい
- **発生局面**: 実装（case-run のテスト戦略 TS-001 検証）
- **検知方法**: 該当なし（検証技法の確立・回収事象。PR #2131 テスト戦略の結果セクションに手法と結果を記録）
- **根本原因**: 該当なし（技法知見の回収）
- **自律対応内容**: PATH 先頭に「呼び出しをログへ記録するダミーの git.cmd」を配置した状態でスクリプトを実行し、(1) 呼び出しログが空（GIT_INVOCATIONS=NONE）であること、(2) exit 0 で正常完了すること、の2点を確認した。clone、fetch、reset、その他 network access が一切起動されないことを実行時証明でき、コード検査（実行箇所 0 件の grep）と併用で証拠強度を高めた
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証技法の知見。DEC-016 導入系スクリプトの副作用ゼロ原則の検証手段として活用可能）
- **横展開観点**: Windows 環境で「外部コマンド（git、curl 等）を起動しないこと」を完了条件とするスクリプト系 Issue のテスト戦略全般。ダミーコマンドの呼び出しログはコード検査のみより強い実行時証拠になる
- **再発条件**: 該当なし（適用場面: スクリプトの network access 不実行を強い証拠で検証する必要がある場合）
- **予防策候補**: スクリプト系テスト戦略の立案時に本技法（ダミーコマンド配置による実行時証明）を候補として挙げる運用（要 learning-promote / backlog-review 判断）
- **想定反映先**: なし（テスト戦略は Issue 単位で定義されるため、汎用技法の文書化要否は learning-promote で評価）
- **関連**: PR #2131 Findings learning セクション, Issue #2128（OU-001、TS-001）, DEC-016
- **タグ**: `#test-strategy` `#runtime-proof` `#dummy-command` `#network-access` `#windows` `#operational-knowledge`
- **移動日**: 2026-08-15
- **処分判定**: deferred（出現1件。検証技法知見。テスト戦略立案時の候補技法として維持）

---


## プレースホルダ除去時の IR-055 baseline delta 再検証必須（OU-005、PR #2187）

- **問題事象**: プレースホルダ ID（{NNN} 形式）を含む行は IR-055 の検査免除（template placeholder exemption）になるため、プレースホルダ除去は同行の他パターン（src/opencode/、repo-local、docs/specs/ 参照）を新規違反として顕在化させ得る。PR #2187 で 6 件顕在化し、即時修正した。
- **発生局面**: 実装（references 配下のプレースホルダ ID 表記整理）
- **検知方法**: プレースホルダ除去後の check_integrity.ts 実行で新規 delta として検出
- **根本原因**: IR-055 の exemption が行単位（{...} 含む行全体を走査免除）であり、プレースホルダ以外の違反も同行は隠蔽される構造
- **自律対応内容**: 顕在化した 6 件を配布物向け表現（.opencode/...、自己ホストリポジトリ固有 等）へ修正して解消
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 配布物のプレースホルダ整理時は IR-055 baseline delta の再検証を必須工程とする
- **再発条件**: プレースホルダを含む行のプレースホルダのみを除去する編集を行う場合
- **予防策候補**: プレースホルダ整理 Issue の検証手順へ IR-055 delta 再検証を明示する
- **想定反映先**: agentdev-skill-authoring または checker 実行契約の参考（learning-promote で判定）
- **関連**: PR #2187, Issue #2182 (CLOSED), Epic #2178
- **タグ**: #ir055 #placeholder #baseline
- **移動日**: 2026-08-18
- **処分判定**: deferred（learning-promote 2026-08-18 評価。同一メカニズム（IR-055 exemption の行単位性による delta 顕在化）の intake item（spec-cand-ir055-exemption-new-delta-emergence）が checker 実行点の明確化を管理中。living pool で維持し次回 intake 側処分と照合）

---

## 検証スクリプトの対象ファイル収集で git diff --diff-filter=d による削除済み除外（OU-005、PR #2187）

- **問題事象**: git diff --name-only の出力には削除済みファイルが含まれるため、検証スクリプトが各ファイルを読む前に ENOENT が発生した。
- **発生局面**: 実装（TS-008 検証: 変更ファイル群の注記走査）
- **検知方法**: 検証スクリプト実行時の ENOENT エラー
- **根本原因**: --name-only が削除済みパスも返す仕様に対し、対象全件が存在することを前提とした読み込みを行っていた
- **自律対応内容**: --diff-filter=d で削除済みファイルを除外して再実行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: diff 出力をファイル読み込みに使う検証スクリプト全般に当てはまる
- **再発条件**: 削除を含む変更セットを --name-only で収集して直接読む場合
- **予防策候補**: 対象収集には常に --diff-filter=d（または存在確認）を組み合わせる
- **想定反映先**: 検証スクリプト・テスト戦略テンプレートの参考（learning-promote で判定）
- **関連**: PR #2187, Issue #2182 (CLOSED), Epic #2178
- **タグ**: #git #verification
- **移動日**: 2026-08-18
- **処分判定**: deferred（learning-promote 2026-08-18 評価。出現1件。検証スクリプト技法の知見）

---

## PowerShell 一括読み書きによる配布物ファイル破壊の再発防止（OU-0001、PR #2198）

- **問題事象**: PowerShell で await を含む誤ったコマンドが部分失敗した際、後続の Set-Content が空変数のまま実行され8ファイルが空になった（git 復元 + 再構築で回復）。
- **発生局面**: 実装（配布スキル src/opencode/skills/agentdev-artifact-graph 配下の編集）
- **検知方法**: 部分失敗したコマンド列の実行後、対象ファイルが空であることを確認
- **根本原因**: PowerShell のパイプライン・変数展開を含む一括読み書きは部分失敗時に空書き込みへ到達しうる。逐次 edit ツールと異なり中間状態の検証がない
- **自律対応内容**: git 復元と再構築で回復。以後の配布物編集は per-line edit ツールに限定
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows 環境での配布物編集全般。AGENTS.md の「Write ツール全面上書きは新規ファイル限定」警告の PowerShell 版として一般化できる
- **再発条件**: PowerShell による複数ファイルへの一括読み書き（Get-Content → 加工 → Set-Content）を失敗しうる-chain で実行する場合
- **予防策候補**: 配布物編集は per-line edit ツールに限定し、PowerShell 一括読み書きを禁止/制限する規約化
- **想定反映先**: agentdev-skill-authoring または AGENTS.md 編集規約の参考（learning-promote で判定）
- **関連**: PR #2198, Issue #2190 (CLOSED), Epic #2189
- **タグ**: #powershell #encoding #editing
- **移動日**: 2026-08-18
- **処分判定**: deferred（learning-promote 2026-08-18 評価。出現1件。AGENTS.md 既存警告の PowerShell 版一般化候補）

---

## 配布物への具体 ID・docs パス直書きは配布依存境界 gate で違反になる（OU-0004、PR #2199）

- **問題事象**: 配布物（src/opencode/skills 配下）へ具体 ID（REQ-020 等）や docs/ 配下パスを直接記述すると配布依存境界 gate（check_distribution_boundary --profile source）が違反になる。
- **発生局面**: 実装（effectiveness/candidate_limit サブスイート作成）
- **検知方法**: 配布依存境界 gate 実行（case-run Step 7-1）
- **根本原因**: 配布物はプロジェクト非依存が要件であり、具体 ID・docs パスはプロジェクト固有情報
- **自律対応内容**: effectiveness 既存資産の規約（REQ-{NNNN} プレースホルダ、採番フォーマッタ関数による ID 合成、文字列分割によるパス合成）に従って通過
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 配布物へ言及を書く場面全般
- **再発条件**: 配布物に具体 ID や docs パスを文字列リテラルで記述する場合
- **予防策候補**: 配布物編集時のプレースホルダ・合成規約を authoring ガイドへ集約する
- **想定反映先**: agentdev-skill-authoring または effectiveness 資産規約の参考（learning-promote で判定）
- **関連**: PR #2199, Issue #2193 (CLOSED), Epic #2189
- **タグ**: #distribution-boundary #placeholder
- **移動日**: 2026-08-18
- **処分判定**: deferred（learning-promote 2026-08-18 評価。出現1件。対策本体は配布依存境界 gate と effectiveness 既存資産の規約が既存。authoring ガイドへの集約は改善候補の域）

---

## 複数 worktree 検査はループ変数で作業ディレクトリを切り替える（case-close 実行、Epic 2189）

- **問題事象**: 複数 worktree で同一 detector を実行する際、bash ツールの workdir を最初の worktree に固定したまま foreach ループを回したため、4回すべて同一 worktree で検査を実施していた（検査対象の取り違え）。
- **発生局面**: case-close E4-0（配布依存境界 最終 gate の4 worktree 実行）
- **検知方法**: 実行結果の scanned_files 件数が全ループ同一（313）であることに着眼して疑い、workdir 指定の誤りを特定。workdir を個別指定して再実行し是正
- **根本原因**: ループ変数（worktree 名）を出力表示にのみ使い、実行場所（workdir）に反映していなかった
- **自律対応内容**: worktree ごとに個別 workdir 指定で再実行し、scanned_files の差異（314/306/314）で実施場所を検証
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 複数ディレクトリに対する同一コマンド実行全般。実行場所は出力だけでなく実行結果の指標（件数・パス）でも検証する
- **再発条件**: ループ内でディレクトリを扱う際、実行場所をループ変数にバインドし忘れた場合
- **予防策候補**: 複数 worktree 検査手順に「実行結果の指標で実施場所を検証」を明示する
- **想定反映先**: case-close E4-0 運用の参考（learning-promote で判定）
- **関連**: Epic #2189（case-close 実行中に検知・是正。PR 由来ではない自律学び）
- **タグ**: #worktree #verification #tooling
- **移動日**: 2026-08-18
- **処分判定**: deferred（learning-promote 2026-08-18 評価。出現1件。実行指標（件数・パス）による実施場所検証の技法。一般ツール運用知見）

---

## Phase 0（req-save/spec-save）起因の AUTOGEN 陳腐化は case-close の dry-run ゲートで差戻しになる（OU-001 case-close、PR #2201）

- **問題事象**: req-save / spec-save が REQ・SPEC を追加しても AUTOGEN メトリクスブロック（req-health-metrics.md / spec-health-metrics.md の計測例）を再生成しないため、case-close の project extension チェック autogen-index-regeneration-diff（generate_indexes.ts --dry-run）が WOULD UPDATE 2 件を検出し、PR 起因ではなく main 既存の陳腐化でもマージ前に構造化停止・case-run 差戻しとなった。
- **発生局面**: case-close（STEP-3 拡張チェック autogen-index-regeneration-diff。Phase 0 の commit e864af5e / 7ad962cf 起因）
- **検知方法**: PR head worktree と main 双方での generate_indexes.ts --dry-run 比較（両方 WOULD UPDATE → PR 外起因と帰属）、check_integrity の IndexGenerationConsistency NG 2 件
- **根本原因**: req-save / spec-save 工程は AUTOGEN 対象ブロックを更新しない。AUTOGEN ゲートは起因を問わず差分を検出して停止する契約（複数 PR 跨ぎの再生成漏れ防止）のため、Phase 0 起因分も case-close 到達時に表面化する
- **自律対応内容**: ゲート契約に従いマージせず case-auto へ partial 報告（差戻し）。case-run が worktree で generate_indexes.ts を実行して再生成 commit（3632878a）を PR へ追加、case-close 再実行で dry-run 差分ゼロ・check_integrity NG 0 を確認してマージ完了
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（case-close SPEC Step 3-3・extension checks の契約どおりの作動事例）
- **横展開観点**: 機能追加フローで SPEC/REQ を追加する場合、AUTOGEN 再生成は case-run 側で先に実施しておくと case-close の差戻しを回避できる。case-close 側で再生成して完結する手段は契約上禁止
- **再発条件**: req-save / spec-save で REQ・SPEC を追加し、case-run が AUTOGEN 再生成を実施しないまま PR を作成した場合
- **予防策候補**: case-run の前置 gate に AUTOGEN dry-run 差分チェックを追加する、または spec-save 完了報告時にメトリクス系 AUTOGEN ブロックの再生成を案内する
- **想定反映先**: case-run 前置 gate / spec-save 完了報告の参考（learning-promote で判定）
- **関連**: PR #2201 (MERGED 962dc688), Issue #2200 (CLOSED), 再生成 commit 3632878a
- **タグ**: #autogen #case-close #phase0 #gate
- **移動日**: 2026-08-18
- **処分判定**: deferred（learning-promote 2026-08-18 評価。出現1件だが反映先（case-run 前置 gate への dry-run チェック追加 / spec-save 完了報告での再生成案内）が明確で影響大（Epic 差戻し直結）。ユーザー承認（HITL）にて deferred 維持を確定。次回 living pool 再評価の最優先候補）

---
