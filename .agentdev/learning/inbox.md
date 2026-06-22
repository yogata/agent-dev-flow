# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-21 PR #974 (Issue #973 / OU-11: agentdev-gh-cli Windows 文字化け対策)

### PowerShell ヒアドキュメント選択のガードレール明文化候補

- 観測: 本 PR 本文生成時、oh-my-openagent 側で展開ヒアドキュメント（`@"..."@`）を使用した結果、コードフェンス（```` ``` ````）のバッククォートがエスケープ文字として処理されて fence 欠損、`$OutputEncoding` が変数展開されて `System.Text.UTF8Encoding+UTF8EncodingSealed` に化ける事象が発生した。
- 自己修復: SKILL.md Section 6 (b) 内容再生成ルート（非展開ヒアドキュメント `@'...'@` 切替）で解決。
- 教訓候補: 「コードフェンス・`$variable` を含む本文は非展開ヒアドキュメント `@'...'@` を使用」の明文化を `agentdev-gh-cli` または専用 learning で検討すべきか。

### SKILL VERIFY 操作の有効性証左

- 観測: 今回の PR 本文生成プロセスが、今回 SKILL に追記した Section 2 Step 0（コンソールエンコーディング初期化）→ Step 1（`[System.IO.File]::WriteAllText` UTF-8 BOM なし）→ Step 3（`gh pr create --body-file`）→ Section 5-8 VERIFY 操作までを自然に実践し、読み戻し検証で Markdown 構造崩れを検出して Section 6 (b) で自己修復した。
- 教訓: SKILL 手順化（Step 0 → Step 1 → Step 3 → VERIFY）の有効性を示す実証事例。同種の手順化推進の根拠として使える。

### oh-my-openagent の Findings / Capture候補 セクション自動生成未対応

- 観測: 本 PR では case-run 実行担当サブエージェントが事後補完した。
- 改善候補: `references/oh-my-openagent.md` の指示プロンプト雛形に `## Findings / Capture候補`（`### intake` / `### learning` 小見出し）のテンプレート埋め込みを検討すべきか。

## 2026-06-21 PR #975 (Issue #970 / バッチB 文書品質・整備)

### REQ 要件行の振る舞い単位記述と既存 REQ の遡及適用

- 観測: REQ 要件行の「振る舞い単位記述」と「Step 番号参照の排除」は、既存の多くの REQ で部分的に逸脱している可能性が高い（例: REQ 行が「Step N-M で処理する」といった表現を含むケース）。
- リスク: 本 PR で追記したガイドを既存 REQ に遡及適用するかは別 Issue の範囲だが、整備時に暗黙に後方互換性を損なうリスクがある。
- 教訓: 「既存 REQ は現状維持・新規 REQ から適用」の運用ルールがあちこちで暗黙仮定されている。この運用ルールを文書化（REQ-0101 等）すべきか。

### ADR 採番ルールの SKILL↔command 重複と同期リスク

- 観測: ADR 採番（max+1, 欠番埋め禁止）の強調ブロックを SKILL.md と req-save.md の両方に記載した。知識の二重保持は意図的（SKILL は知識ベース・command は実行手順）だが、将来の改定時に同期漏れが起き得る。
- 教訓: SKILL ↔ command の同一ルール重複を許容するか・一方向参照にするかの判断基準が artfact-responsibilities で明示されていない。SKILL/command の責務分割原則に「同一ルール重複」の許容条件を追加すべきか。

## 2026-06-21 PR #976 (Issue #972 / バッチD 記録・検出精度)

### SPEC catalog と実装の同期重要

- 観測: IR-044 検出関数は commit a27a8e56 で「3層ゲート自動化と共に削除」されたが、catalog 定義（IR-044）は維持された。SPEC catalog と実装の間に乖離が生じないよう、削除時は catalog の `baseline_status` を `new` から `resolved` に変更する等の同期運用が必要。
- 教訓: 今回の再実装でこの教訓を反映し、catalog（spec-save 済み）と実装を一致させた。今後 SPEC catalog ↔ 実装の削除・復活時には双方向同期を必須とする。

### `import.meta.main` ガードパターン（bun）

- 観測: `check_integrity.ts` の `main()` がモジュール末尾で無条件実行されており、テストファイルからの import 時に副作用（スクリプト実行）が発生していた。
- 教訓: bun の `import.meta.main` を用いたガードは、エントリポイント判定の標準パターンとして他のスクリプトでも推奨。新規スクリプト作成時のデフォルトパターン化を検討すべきか。

## 2026-06-21 PR #977 (Issue #971 / バッチC 実行インフラ改善)

### ハーネスタイムアウト事後処理の実証

- 観測: 本 Issue の実装プロセス自体が「oh-my-openagent 起動失敗 → 直接実装へ切り替え」の事後処理手順（OU-013 で新設）の実証例となった。`bunx oh-my-openagent run` に prompt を標準入力で渡すと `error: missing required argument 'message'` で即時失敗したことを契機に、直接実装へ切り替えて PR を完遂した。
- 教訓: ハーネス起動失敗時の事後処理として以下の 3 点が有効だった: (1) CLI 引数仕様の事前検証（`--help` で必須引数を確認）、(2) タイムアウト後の worktree `git status` 確認（未コミット変更の有無で再実装 vs 継続を判断）、(3) フォールバック時も REQ/ADR/SPEC/docs を再確認する（driver 引き継ぎプロンプト制約の実践）。本 PR で SKILL 化した手順が即座に自己適用された形。
- 関連 intake: `2026-06-21-issue971-oh-my-openagent-cli-arg-spec.md`（CLI 引数仕様の文脈）。

## 2026-06-21 Epic #979 Wave1 #982 (case-auto worktree基点問題による sub-agent スコープ違反)

### case-auto worktree作成タイミングと中間成果物commitタイミングの不整合

- 観測: Epic #979 Wave 1 の #982 sub-agent が、worktree（origin/main基点＝REQ/ADR 旧状態）で作業中、Issue本文に「REQ-0139-013 は req-save で保存済み」と記載されているにも関わらず worktree内ファイルが旧状態である矛盾に直面。sub-agent はこの矛盾を「修正すべき不具合」と解釈し、MUST NOT DO で禁止されていた REQ/ADR/SPEC ファイルを編集してしまった（PR #986 スコープ違反）。
- 根本原因: case-auto が req-save/spec-save 成果物を main に commit+push する前に worktree を作成したため、worktree に中間成果物が含まれていなかった。Issue本文（「保存済み」）と worktree実ファイル（旧状態）の乖離が発生。
- 影響: PR #986 がスコープ違反でクローズ。REQ/ADR/SPEC の canonical版（main commit 29004a3）と重複する変更が PR に含まれ、マージ時に競合リスクが発生。
- 再発防止候補1: case-auto は case-run（worktree作成）の前に、req-save/spec-save 成果物を main に commit+push するべき。これにより worktree が最新の中間成果物を含む。
- 再発防止候補2: sub-agent のプロンプトで「worktree のファイルが Issue 本文と乖離している場合、REQ/ADR/SPEC を編集せず blocked として報告せよ」と明記する。
- 教訓: 複数工程にまたがるパイプライン（req-save → spec-save → case-open → case-run → case-close）で、中間工程の成果物が main に commit されないまま後続工程の worktree が作成されると、sub-agent がファイル状態の矛盾に直面しスコープ違反を起こすリスクがある。

## 2026-06-21 PR #1009 (Issue #998 / OU-008: REQ HOW 除去と SPEC 移管)

### 前工程実施済みの機械的除去でも acceptance criteria 順位検証が残余 violation を捕える

- **問題事象**: req-save commit `5c7fed3` で実施済みとされた REQ HOW 除去（10 REQ ファイル）を、case-run 検証フェーズで acceptance criteria 順位検証した結果、8 件の residual violation を検出した（REQ-0114-002/004/030/034 ファイルパス詳細、REQ-0102-045 ファイルパス詳細、REQ-0124-018 旧名称参照 `req-restructure-review`、REQ-0127 scope ファイルパス詳細、REQ-0133 scope CLI コマンド詳細 `gh issue list 禁止`）。
- **発生局面**: 実装（検証中心 Issue の case-run）。前工程 (req-save) で機械的除去完了済み、後工程 (case-run) で検証時に発見。
- **検知方法**: 各 REQ の `## 完了条件` チェックボックスを順位検証（criterion-by-criterion）。REQ-NNNN-NNN 単位の acceptance criteria を 1 件ずつ REQ 本文行と照合。
- **根本原因**: 単一パスの機械的除去は複数 HOW カテゴリ（ファイルパス / CLI コマンド詳細 / 旧名称参照 / スキル名直参照 / プロンプト文字列 / 【廃止】履歴 / API シグネチャ）を横断するため、カテゴリ毎の抜けが生じる。特に REQ-0114-030 は REQ-0131-005 で同パターンを除去済みだったのに不整合で残存するなど、横断 REQ 間での除去一貫性も崩れやすい。
- **自律対応内容**: case-run 実行担当が 8 件を補完修正し PR #1009 として提出。PR 本文に修正対比表（REQ / 行 / criterion / 修正）を記録し、QG-4 で完了条件チェックボックス 13 件全て [x] 化。
- **ユーザー確認有無**: なし（検証→補完修正→マージまで自律完結）。
- **ADR/REQ/spec影響**: あり。REQ HOW 除去の判定基準（API シグネチャ・プロンプト・【廃止】・スキル名・CLI コマンド・ファイルパスの各パターンと適否判断）は SPEC `docs/specs/req-health-metrics.md` または document-model SPEC に判定表として記載すべき候補。Wave 5 (#1000) 横断検査スコープで処理予定。
- **横展開観点**: 配布物内部 ID 除去（Issue #999）と同パターン。複数カテゴリを横断する機械的除去（命名規則・ID 参照・特定文字列表現等）では全て、単一パス実施後に acceptance criteria 順位検証を挟むことで残余 violation を効率的に捕獲できる。
- **再発条件**: (1) 複数カテゴリの機械的除去を単一パスで実施する場合、(2) 前工程 (req-save 等) の成果物を case-run で「検証中心」として引き継ぐ場合、(3) acceptance criteria が細粒度（REQ-NNNN-NNN 単位）で定義されている場合。
- **予防策候補**: (1) `agentdev-req-structure-diagnostics` スキルに「HOW 除去のカテゴリ別チェックリスト」を追加し、機械的検出を強化。 (2) req-save が HOW 除去を実施する際、acceptance criteria を checklist として用いた自己検証を必須化。 (3) case-run 検証フェーズで「前工程完了済み」の前提に頼らず、必ず acceptance criteria 順位検証を実施。
- **想定反映先**: `src/opencode/skills/agentdev-req-structure-diagnostics/`（HOW 検出カテゴリ拡張）、`docs/specs/req-health-metrics.md` または `docs/specs/document-model.md`（HOW 除去判定表）、Wave 5 (#1000) の横断検査スコープ。
- **関連**: PR #1009, Issue #998, Epic #990 OU-008, commit `d44e408`
- **タグ**: `#REQ-HOW-removal` `#acceptance-criteria-verification` `#case-run` `#mechanical-refactor-residual` `#multi-category-removal`

## 2026-06-21 PR #1010 (Issue #1000 / Epic #990 Wave 5 OU-010: ADR 整理・Stream1 改善・横断検査)

### 機械的除去後の残余 violation パターンを再発防止ルールとしてスキルへ恒久反映

- **問題事象**: OU-008/Wave 4 で検出した「機械的 HOW 除去後の残余 violation 8 件」の再発防止パターン（複数行 HOW 記述・文脈依存 ID 参照・間接的スキル名直参照・旧名称残存・CLI 詳細抽象化漏れ・ファイルパス直接参照）を、本 PR Stream B で 4 つの docs 運用スキル（`agentdev-req-structure-diagnostics`・`agentdev-doc-writing`・`agentdev-req-file-manager`・`agentdev-adr-file-manager`）に恒久的な検証ルール・検出パターンとして反映した。学びが単発の事象記録で終わらず、実行される検証ロジックの一部に昇華された事例。
- **発生局面**: 実装（Epic 最終 Wave・横断検査中心 Issue の case-run）。
- **検知方法**: OU-008 で得た学びを Stream1 改善の入力とし、各スキルの責務範囲に合わせて検出シグナル・判定ルール・修正方針の 3 セットに整理して SKILL.md/references に記述。
- **根本原因**: 従来の docs 運用スキル群は「単発の検証ルール」を場当たり的に持つ構造で、過去の機械的除去作業で得た「残余しやすいパターン」の体系化がなかった。これが結果的に毎回手作業での再発見を要求していた。
- **自律対応内容**: case-run 実行担当が OU-008 学びを分類し直して各スキルの検出ポイントに配置。AG-014（機能変更禁止）を遵守し、検証ルールの追加のみで既存機能（採番・ライフサイクル・査読・診断）の動作は変更せず。
- **ユーザー確認有無**: なし（学びの反映先設計→実装→検証まで自律完結）。
- **ADR/REQ/spec影響**: あり。学びのスキル恒久反映プロセス自体が learning-pipeline → skill SKILL.md/references 更新の正式経路として機能したことを示す実証。`learning-promote` → `backlog-review` → `req-define` → `req-save`/`spec-save` の正規ルートを経由せず、学びの性質が「検証ルール」として明確な場合は case-run で直接 SKILL 化する簡易経路も有用。この判定基準（正規ルート vs 簡易経路）を learning-pipeline SPEC に明文化すべきか。
- **横展開観点**: 今回の 4 スキル以外でも、学びが「検証可能なシグナル」に変換できる場合は SKILL.md/references への直接反映が有効。候補: `agentdev-doc-map`（索引整合性検出）・`agentdev-architecture-advisory`（REQ/ADR/SPEC 責務分離検出）等。
- **再発条件**: (1) 学びが明確な検出シグナルに変換可能な場合、(2) 対象スキルの責務範囲内である場合、(3) 機能変更なしで検証ルール追加として表現できる場合（AG-014 準拠）。
- **予防策候補**: (1) learning-capture で「検出シグナル化可能か」を判定基準に追加し、可能な場合は SKILL 直接反映を正規ルートの補完として明示する。(2) 定期的に inbox.md を再確認し、未昇華の学びで検出シグナル化できるものを抽出するサイクルを組織化する。
- **想定反映先**: `docs/specs/skills/agentdev-learning-pipeline.md` または `docs/specs/workflows/learning-lifecycle.md`（学び → SKILL 直接反映の簡易経路条件）。
- **関連**: PR #1010, Issue #1000, Epic #990 OU-010 Stream B, OU-008 学びエントリ (PR #1009)
- **タグ**: `#learning-to-skill-feedback` `#verification-rule` `#recurrence-prevention` `#AG-014-compliant` `#skill-references`

### 配布物 ID 除外のテストフィクスチャ例外設計（docs-check 対象ファイル設計）

- **問題事象**: PR #1010 Stream C 横断検査で `src/opencode/skills/` 配下に 5 件の内部 ID パターン残留を検出したが、全て `agentdev-gh-cli/scripts/` 配下のテストフィクスチャ・検証スクリプト内のコード（`verify_body.ts:332` パターン説明・`verify_body.test.ts:100,105,110` リンク検証テスト入力）だった。これらは「正当な ID 使用」であり、配布物（.md）からの ID 除去は完了しているが checker の対象ファイル設計を .md に絞った理由が SPEC に明示されていなかった。
- **発生局面**: 実装（Epic 最終 Wave・横断検査 Stream C）。
- **検知方法**: `src/opencode/commands/`・`src/opencode/skills/` で `REQ-\d{4}`・`ADR-\d{4}`・`SPEC-[A-Z]+(-[A-Z]+)*-\d+`・`IR-\d{2,}` を grep し、.md と .ts を分離集計。
- **根本原因**: docs-check は「ドキュメントの整合性」を検査するため .md ファイルのみを対象とする設計だが、この設計判断（「テストコードは正当に ID を使用するため対象外」）が SPEC に明示されておらず、将来の checker 拡張時に対象範囲拡張（.ts 含む）の判断基準が不明確。
- **自律対応内容**: 本 PR では設計判断を維持し（.md のみ対象）、Stream C 検査結果に「scripts/ 配下テストフィクスチャは設計上除外」と明記。ただし SPEC 明文化は見送った。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: あり。`docs/specs/skills/agentdev-doc-writing.md` または `docs/specs/integrity-rule-catalog.md` に「docs-check の対象ファイル設計（.md のみ・.ts/.js 等のテストコードは正当使用のため対象外）」を明示すべきか。
- **横展開観点**: 類似の「正当使用例外」パターンとして、SPEC サンプルコード内の ID・テストデータの ID・検証スクリプトのパターン入力がある。これらを一括して「正当使用例外」として SPEC 化するか。
- **再発条件**: (1) checker の対象ファイル拡張子設計を SPEC 明文化せず、(2) 将来の checker 拡張で .ts/.js を対象にするか否かの判断が発生した場合。
- **予防策候補**: `docs/specs/integrity-rule-catalog.md` または `docs/specs/skills/agentdev-doc-writing.md` に「docs-check 対象ファイル = .md ファイルのみ・正当使用例外（テストコード・検証スクリプト内の ID パターン）」を明文化。
- **想定反映先**: `docs/specs/integrity-rule-catalog.md`（checker 対象ファイル設計）、`docs/specs/skills/agentdev-doc-writing.md`（配布物 ID 除外の対象範囲）。
- **関連**: PR #1010, Issue #1000, Epic #990 OU-009 (PR #1008), OU-010 Stream C
- **タグ**: `#distribution-id-removal` `#test-fixture-exception` `#docs-check-design` `#scope-design`

## 2026-06-21 Epic #990 完了 (10 OUs / 5 Waves / 文書体系再構築全体)

### 検証中心 Issue と実装中心 Issue の明示的区別が二重実施を防ぐ（Epic 実行プロセス学習）

- **問題事象**: Epic #990 の 10 OUs 中、6 OUs（#991〜#997・#1000）は「前工程（req-save commit `5c7fed3`・spec-save commit `266517a`）でファイル操作完了済み」を前提とする検証中心 Issue だった。これらの子Issue では「実装は既に完了しているので、検証・補完・横断検査のみを行う」ことが Issue 本文に明示されていたため、sub-agent が二重実装に走るリスクが回避された。一方 Wave 4 #998 (REQ HOW 除去の補完) のように「前工程完了済みだが acceptance criteria 順位検証で残余 violation を発見し補完実装する」パターンも存在し、単純な「検証 only」と「補完実装あり」の区別が平坦でなかった。
- **発生局面**: 実装（Epic 全体実行・Wave 1〜5 を通じて観察）。
- **検知方法**: 各子Issue の「補足情報: 前工程の進捗状況」セクション（draft 由来・case-open で子Issue 本文に埋め込み）と、acceptance criteria 順位検証結果との対比。
- **根本原因**: draft 段階で「前工程で実施済み」マーカーを各 OU に付与していたが、「検証中心（実装追加なし）」vs「検証中心だが補完実装あり得る」の区別までは明文化されていなかった。Wave 4 #998 で実際に 8 件の残余 violation を発見し補完したことで、両者の境界が事後的にしか分からなかった。
- **自律対応内容**: sub-agent は「前工程完了済み」を前提としつつも acceptance criteria 順位検証で必ず再確認し、残余があれば補完するという運用で対処。case-run/ driver は「前工程完了済み」を鵜呑みにせず検証を必須とする振る舞い（PR #1009 学びで SKILL 反映済み）で一貫した。
- **ユーザー確認有無**: なし（Epic 完了まで自律完結）。
- **ADR/REQ/spec影響**: あり。`docs/specs/workflows/epic-wave-model.md` または case-open SPEC で「検証中心 Issue」「実装中心 Issue」「補完実装を許容する検証中心 Issue」の分類と、それぞれの sub-agent への引き継ぎプロンプト指示（二重実装禁止・残余発見時の振る舞い）を明文化すべきか。
- **横展開観点**: 今後大規模 Epic（req-save/spec-save 前工程あり）を組む際、各 OU の「前工程完了度」を 3 段階（完全完了・検証のみ・補完あり）で draft 段階で分類しておくと、sub-agent のスコープ違反リスクを更に下げられる。
- **再発条件**: (1) req-save/spec-save 前工程を持つ大規模 Epic を case-auto で実行する場合、(2)「前工程完了済み」OU と「未処理」OU が混在する場合、(3) sub-agent が「完了済み」を過信して acceptance criteria 順位検証を省略する場合。
- **予防策候補**: (1) draft 階階で各 OU に「前工程完了度: 完全完了 / 検証のみ / 補完あり」属性を付与。 (2) case-open で子Issue 本文に当該属性を埋め込み。 (3) sub-agent 起動プロンプトで当該属性に応じた振る舞い（検証のみの場合でも acceptance criteria 順位検証は必須等）を明示。
- **想定反映先**: `docs/specs/workflows/epic-wave-model.md`（OU 属性分類）、`src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md`（sub-agent 起動プロンプトテンプレート）。
- **関連**: Epic #990 全 OUs（#991〜#1000）, Wave 1〜5 実行, PR #1009 (Wave 4 #998 残余 violation 発見時)
- **タグ**: `#epic-execution` `#verification-centric-issue` `#acceptance-criteria-verification` `#subagent-scope-control` `#case-auto`

## 2026-06-21 PR #1012 (Issue #1011 / REQ-0142: 配布物 ID 除去後の整合性回復)

### docs-check バックエンドへの検査カテゴリ追加と skill-category-gap NG 汚染のトレードオフ

- **問題事象**: REQ-0142-006/007 で新設した配布物整合性検査パターン（構文健全性・文意保持・責務整合）を `inspect-docs` / `inspect-skills` / `req-structure-diagnostics` の各 skill に実装したが、docs-check 自動バックエンド（`check_integrity.ts`）へのカテゴリ直接追加は見送った。追加すると `skill-category-gap` NG が新カテゴリで汚染され、既存の「配布物↔スキルカテゴリ一致」チェックのターゲットングが隠退化するため。
- **発生局面**: 実装（機能追加・横断検査観点拡充 Issue の case-run）。
- **検知方法**: case-run 実行担当が `check_integrity.ts` 拡張を検討した際、`skill-category-gap` ルールとの相互作用を事前検証し、追加不可を判定。
- **根本原因**: docs-check には「スクリプト修正を含める自動チェック項目」と「command/skill 定義レベルの手動検査項目」の 2 系統があるが、この境界と各 NG ルール（skill-category-gap 等）との相互作用が SPEC 化されていない。新カテゴリを追加する際は既存 NG への副作用を毎回手動で評価する必要がある。
- **自律対応内容**: case-run 実行担当はバックエンド直接追加を回避し、command/skill 定義レベル（inspect-docs Step 11・inspect-skills Step 3・req-structure-review.md）に検査パターンを実装。この判断基準（何をバックエンドに入れ・何を skill 定義に入れるか）は PR Findings と intake inbox に記録（別途 RU 化候補）。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: あり。docs-check の項目役割範囲（スクリプト修正を含める範囲 vs 含めない範囲）を SPEC として明文化すべきか。候補: `docs/specs/integrity-rule-catalog.md` または `docs/specs/skills/repo-agentdev-integrity.md`。
- **横展開観点**: 既存の他 NG ルール（`req-range-staleness`・`legacy-normative-marker`・`source-projection-sync` 等）でも、新カテゴリ・新対象ファイル追加時の副作用を事前評価する仕組みが欠けている。NG ルール間の依存関係マップ（カテゴリ追加 → 影響を受ける NG 一覧）があると、追加判断を機械化できる。
- **再発条件**: (1) 新たな検査カテゴリを docs-check に追加する要件が発生した場合、(2) 既存 NG ルール（skill-category-gap 等）との相互作用を SPEC 化していない場合、(3) case-run 実行担当が毎回手動で副作用を評価する運用が続く場合。
- **予防策候補**: (1) docs-check 項目役割範囲（バックエンド対象 vs skill 定義対象）を SPEC 明文化。 (2) NG ルール間依存関係マップ（新カテゴリ追加時の影響 NG 一覧）を `integrity-rule-catalog.md` に整備。 (3) case-run で新カテゴリ追加を検討する際の判定フロー（既存 NG への副作用 → 追加可否）を SKILL に明示。
- **想定反映先**: `docs/specs/integrity-rule-catalog.md`（docs-check 項目役割範囲・NG 依存関係マップ）、`src/opencode/skills/repo-agentdev-integrity/SKILL.md`（新カテゴリ追加判定フロー）。
- **関連**: PR #1012, Issue #1011, REQ-0142-006/007, SPEC `docs/specs/docs-spec-rebuild-integrity.md`, intake `2026-06-21-issue1011-docs-check-backend-category-scope.md`
- **タグ**: `#docs-check-design` `#NG-rule-interaction` `#skill-category-gap` `#scope-tradeoff` `#intake-coupled`

### case-auto 委譲契約 MUST NOT DO と case-close G22 SPEC 昇格責務の衝突

- **問題事象**: case-auto（最大自走モード）から case-close への工程委譲契約で「REQ/ADR/SPEC ファイルを変更しない」という MUST NOT DO が指定されていた。一方 case-close の G22 ガードレールは「SPEC status 昇格（draft → accepted）は case-close の責務」と明示しており、両者が衝突した。本セッションでは SPEC `docs-spec-rebuild-integrity.md`（draft）の accepted 昇格が G22 条件（draft + 実装による検証済み）を満たしていたが、委譲契約の MUST NOT DO を優先して昇格を見送り、後続課題として報告した。
- **発生局面**: 完了処理（case-close Step 3-2 SPEC 確定フロー・case-auto からの委譲実行）。
- **検知方法**: case-close Step 3-2 の手順に従い SPEC 昇格可否を評価した際、委譲契約の MUST NOT DO と G22 の責務定義が両立しないことを検出。
- **根本原因**: case-auto の委譲契約設計が「要件・仕様・決定の実質的変更」を禁止する意図で「REQ/ADR/SPEC ファイルを変更しない」と包括的に表現したが、SPEC lifecycle 状態遷移（draft → accepted のみの機械的更新）まで巻き込んでいた。SPEC 昇格は case-close の正当な責務（G22）であり、要件内容の変更とは区別されるべき。
- **自律対応内容**: システムプロンプト「task conflicts with repo instructions or safety constraints, follow the higher-priority rule and report the conflict」に従い、ユーザー（委譲元）の MUST NOT DO を高優先とし、G22 の昇格を見送って完了報告に「SPEC 昇格見送り・後続推奨」と明記。実施後コメントにも同じ内容を記録。
- **ユーザー確認有無**: あり（case-auto からの委譲契約がユーザー指定のため）。
- **ADR/REQ/spec影響**: あり。case-auto → case-close の委譲契約で SPEC 昇格を許容するか否かを明文化すべき。候補: (a) MUST NOT DO を「実質的 SPEC 内容編集のみ禁止・lifecycle 状態遷移は許容」に精密化、(b) case-close 側で SPEC 昇格を実施した場合昇格対象 SPEC を明示して委譲元に取り消し機会を与える、(c) 現状通り包括禁止を維持する場合は SPEC 昇格を別コマンド（case-update 等）で実施する運用を明文化。
- **横展開観点**: 他の工程委譲（case-open → case-run 等）でも「状態遷移は許可・実質編集は禁止」の区別が同様に必要な場合がある。例: case-open の Issue 作成、case-run の PR 作成等。
- **再発条件**: (1) case-auto で SPEC 候補を含む feature Issue を自走する場合、(2) 委譲契約に「REQ/ADR/SPEC ファイルを変更しない」が包括的に含まれる場合、(3) case-close が SPEC 昇格条件（draft + 検証済み）を満たす場合。
- **予防策候補**: (1) case-auto 委譲契約テンプレートの MUST NOT DO を「実質的 SPEC 内容編集禁止（lifecycle 状態遷移 draft→accepted は除く）」に精密化。 (2) case-auto と case-close の責務境界 SPEC で SPEC 昇格の取扱いを明示。 (3) case-close 完了報告テンプレートに「SPEC 昇格見送り」セクションを設け、後続コマンド（case-update）への引継ぎを標準化。
- **想定反映先**: `src/opencode/commands/agentdev/case-auto.md`（委譲契約出力契約・Step 5）、`docs/specs/workflow-contracts.md` または case-close SPEC（SPEC lifecycle 取扱い）、`src/opencode/commands/agentdev/templates/case-close/standard.md`（完了報告テンプレート）。
- **関連**: PR #1012, Issue #1011, case-close Step 3-2 / G22, case-auto MUST NOT DO, SPEC `docs/specs/docs-spec-rebuild-integrity.md`（昇格見送り対象）
- **タグ**: `#delegation-contract` `#MUST-NOT-DO-scope` `#SPEC-lifecycle` `#case-close-G22` `#case-auto`

## 2026-06-22 PR #1014 (Issue #1013 / REQ-0143: command file format 標準化)

### case-open の未 push `.agentdev/` commit と squash merge による post-merge ローカル分岐

- **問題事象**: case-close Step 9（実行前同期 `git pull --ff-only`）で、ローカル main が origin/main と分岐しており fast-forward 不可になった。原因は case-open が消費済み RU 削除 commit（`4eecd980`）をローカル main に作成したが push せず、そのローカル main から feature branch を作成したため、squash merge（`ee246c5d`）が当該 commit の内容（RU 削除）を取り込んでいたこと。結果としてローカル main の `4eecd980` は内容が squash merge と重複し、履歴のみが分岐した状態になった。
- **発生局面**: 完了処理（case-close Step 9 実行前同期・squash merge 後）。
- **検知方法**: Step 9 の `git pull --ff-only` 実行前に `git log origin/main..HEAD` でローカル先行 commit を検出し、`git diff --stat HEAD origin/main` と `git cat-file -e origin/main:<RU path>` で origin/main が当該 commit の内容を既に取り込んでいる（strict superset）ことを確認。
- **根本原因**: case-open が `.agentdev/` 配下の commit（RU 削除）をローカルに留めたまま case-run へ引き継ぎ、case-run がそのローカル main を起点に feature branch を作成した。squash merge は feature branch の全 diff（未 push の case-open commit 含む）を取り込むため、merge 後にローカル main の当該 commit が冗長化する。case-close Step 9 はこの分岐を想定した手順を持たない。
- **自律対応内容**: `git diff --stat HEAD origin/main` で origin/main が strict superset（RU ファイル削除も origin 側で完了）であることを検証した上で、ワーキングツリー clean を確認し `git reset --hard origin/main` で内容ロスなくローカル main を `ee246c5d` へ同期。冗長 commit `4eecd980` は内容が squash merge に完全に含まれるため履歴オブジェクトのみ消失。
- **ユーザー確認有無**: なし（case-close 単一 Issue フロー内で自律完結）。
- **ADR/REQ/spec影響**: あり。case-open の `.agentdev/` commit の push タイミング、および case-close Step 9 の分岐ハンドリング手順を明文化すべきか。候補: (a) case-open が RU 削除 commit を即座に push する運用、(b) case-close Step 9 に「ローカル先行 commit が squash merge に取り込み済みか」の検証と reset 手順を追加。
- **横展開観点**: case-open → case-run → case-close 以外でも、コマンド間でローカル commit を引き継ぐ工程（req-save → spec-save 等）で squash merge 時に同種の分岐が発生し得る。特に `.agentdev/` のドメイン状態 commit は case-open/backlog-review 等でローカルに蓄積しやすい。
- **再発条件**: (1) case-open が `.agentdev/` commit を push せずに case-run へ引き継ぐ場合、(2) case-run がそのローカル main から feature branch を作成し squash merge する場合、(3) case-close Step 9 が `git pull --ff-only` のみで分岐を想定しない場合。
- **予防策候補**: (1) case-open の RU 削除 commit を即座に push する手順を case-open command へ明示。 (2) case-close Step 9（agentdev-git-worktree）に「squash merge 後のローカル先行 commit 検出 → 内容重複確認 → reset 手順」を追加。 (3) `git pull --ff-only` 失敗時のフォールバック手順（reset / rebase の判断基準）を skill に明示。
- **想定反映先**: `src/opencode/commands/agentdev/case-open.md`（RU 削除 commit の push タイミング）、`src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md`（squash merge 後分岐ハンドリング）、`src/opencode/commands/agentdev/case-close.md` Step 9 参照先。
- **関連**: PR #1014, Issue #1013, case-close Step 9（実行前同期）, commit `4eecd980`（case-open RU 削除・未 push）, commit `ee246c5d`（squash merge）
- **タグ**: `#case-open-unpushed-commit` `#squash-merge-divergence` `#git-pull-ff-only` `#case-close-step9` `#agentdev-persistence`


