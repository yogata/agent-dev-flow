# 評価レポート

## メタデータ
- **実行日時**: 2026-06-25 00:00
- **対象エントリ数**: 14件（inbox: 14件, archive: 0件新規参照）
- **問題クラス数**: 3（未分類含む）

## 正規化結果

inbox 14件中、L-001〜L-009（9件）は旧フォーマット（発生源/学び/適用場面）、L-010〜L-014（5件）は新フォーマット（13項目）。旧フォーマットは解析時に以下マッピングで正規化（元ファイルは書き換えず）:

- 発生源 → 関連
- 学び → 根本原因 + 自律対応内容 + 予防策候補 に分割
- 適用場面 → 横展開観点 + 想定反映先 に分割

## 問題クラス一覧

### 問題クラス1: worktree 環境の junction 非伝播に起因する検査偽陽性・参照断絶

- **根本原因**: worktree 内で `.opencode/`（skills/commands）への junction が git worktree + `.gitignore` により再作成されず、junction 依存の整合性検査で偽陽性が発生し、標準版スキル参照でも `.opencode/` 経由が失敗する
- **再発条件**: worktree 環境で junction 依存の整合性検査を追加・変更する場合、または標準版スキル・コマンドの構造を `.opencode/` 経由で参照する場合
- **予防策**: (1) junction 依存検査に `isInsideWorktree` ヘルパー（`.git` が file かで判定）を適用 (2) worktree 環境では SoT パス（`src/opencode/`）を直接参照する運用の標準化 (3) `isInsideWorktree` の適用範囲拡張候補の評価

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（L-003, L-008） |
| 影響度 | 4/5 | 偽陽性27件発生・実装時の参照断絶 |
| 横展開性 | 4/5 | worktree 環境で junction 依存処理全般 |
| 反映先明確度 | 4/5 | agentdev-git-worktree, integrity 検査 |
| 自動化適性 | 4/5 | isInsideWorktree ヘルパーで自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | worktree+junction 固有の運用知見 |
| 再発可能性 | 4/5 | worktree 使用継続でほぼ確実 |
| 費用対効果 | 4/5 | ヘルパー適用・運用明文化で低コスト高効果 |
| **加重合計** | **30/40** | |

- **推奨処分案**: **既存 skill へ反映** — `isInsideWorktree` ヘルパーは L-003 で checkSourceProjectionConsistency に適用済み（偽陽性27件解消）。ただし worktree 環境の標準運用（src/opencode/ 直接参照）および `isInsideWorktree` の適用範囲拡張候補の評価が `agentdev-git-worktree` に明文化されていない。運用ガイドラインの標準化が必要。

#### エントリ一覧
- 2026-06-23 L-003: worktree 環境で junction 未伝播に起因する偽陽性の汎用化 [inbox]
- 2026-06-23 L-008: worktree + .gitignore で junction が切れた環境では src/opencode/skills/ を直接参照 [inbox]

---

### 問題クラス2: case-close Step 9 の pull --ff-only が共有 main worktree の並列セッション未コミット変更でブロックされる

- **根本原因**: case-close の Step 9-11 は共有 main worktree で動作し、Step 1-1（重複ファイルチェック）は開始時点のスナップショット検査のため、Step 9 実行までの間に並列セッションが加えた未コミット変更を検知できない。当該変更が pull 取り込み対象と重複すると pull が拒否される
- **再発条件**: 共有 main worktree で複数セッションが並列実行され、case-close の Step 9 実行前に他セッションが PR 変更対象ファイルへ未コミット変更を残した場合
- **予防策**: (1) Step 1-1 を Step 9 直前にも再実行する (2) pull 失敗時の並列セッション安全なフォールバック手順の明文化 (3) post-merge ステップ（9-11）の worktree 隔離設計変更の検討

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（L-013） |
| 影響度 | 3/5 | case-close ブロック、ただし破壊的操作なしで停止 |
| 横展開性 | 3/5 | 共有 main worktree で case-close を実行する環境全般 |
| 反映先明確度 | 4/5 | case-close.md Step 9, agentdev-git-worktree |
| 自動化適性 | 3/5 | Step 1-1 再実行・フォールバック手順化可能 |
| プロジェクト固有知識再利用性 | 4/5 | AgentDevFlow 固有の case-close 工程 |
| 再発可能性 | 4/5 | 並列実行継続で高確率 |
| 費用対効果 | 3/5 | 手順追加コスト妥当、隔離設計は要検討 |
| **加重合計** | **25/40** | |

- **推奨処分案**: **既存 skill/command へ反映** — `agentdev-git-worktree/references/git-common-procedures.md` Section 1（pull --ff-only）と Section 3（重複ファイルチェック）は既存だが、(a) Step 1-1 の Step 9 直前再実行、(b) 並列セッション由来変更の取扱い、(c) pull 失敗時フォールバック手順の標準化が未規定。`case-close.md` Step 9 と `git-common-procedures.md` への手順追加が必要。

#### エントリ一覧
- 2026-06-24 L-013: case-close Step 9 の pull --ff-only は共有 main worktree で並列セッションの未コミット変更によりブロックされる [inbox]

---

### 問題クラス3: task() 委譲不可時に adapter skill フォールバックパスが有効

- **根本原因**: ハーネスのツール制約で task() による別サブエージェント起動が不可。委譲先不在でも case-run の orchestration + 実装を完結させる必要がある
- **再発条件**: task() ツールを提供しないハーネス環境（またはツール権限で task() が無効化された環境）で case-run を実行する場合
- **予防策**: (1) adapter skill の「task() 起動失敗時事後処理」フォールバックパスに従い起動元エージェントが統合実行 (2) task() 可否の事前 probe と自動切替プロトコルの明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（L-004, L-010） |
| 影響度 | 3/5 | case-run ブロック回避、プロトコル準拠で完結 |
| 横展開性 | 4/5 | 全ハーネス環境の case-run で発生し得る |
| 反映先明確度 | 5/5 | agentdev-case-run-execution-adapter（特定済） |
| 自動化適性 | 3/5 | 事前 probe は自動化可能だが現状未実装 |
| プロジェクト固有知識再利用性 | 4/5 | adapter protocol 固有の運用知見 |
| 再発可能性 | 4/5 | ハーネス制約継続で高確率 |
| 費用対効果 | 3/5 | フォールバックは既存、probe 強化は将来 |
| **加重合計** | **28/40** | |

- **推奨処分案**: **deferred** — `agentdev-case-run-execution-adapter/SKILL.md` L131-148「task() 起動失敗、異常終了時事後処理」がフォールバックパス（事後処理 Item 1-5、PR 化）を完全カバー。L-004（docs系）・L-010（汎用）は既存設計の妥当性を実証する記録。新規に昇華すべき内容は「事前 probe による自動切替」のみだが、出現2件とも事後フォールバックで完結しており、probe 強化の成熟度不足。将来の再蓄積を待つ。

#### エントリ一覧
- 2026-06-23 L-004: docs 系 Issue で case-run task() 委譲不可時に adapter skill フォールバックパスが有効 [inbox]
- 2026-06-24 L-010: ハーネス制約で task() 委譲不可時に同一エージェント統合実行が有効（adapter protocol 準拠）[inbox]

---

### 未分類

#### L-001: check_integrity.ts 検出ルール追加時の fixture/categoryMap ペア更新
- **8軸加重合計**: 23/40
- **推奨処分案**: **deferred** — copyScripts + drift detection テストが fixture/categoryMap 乖離を自動検出する仕組みが既存かつ有効。運用徹底レベルの知見であり、新規対策不要。
- **既存対策**: あり（自動検出仕組み存在・機能中）

#### L-002: HITL 境界精密化パターンの汎用性
- **8軸加重合計**: 21/40
- **推奨処分案**: **deferred** — REQ-0147 で promote 系に実装済み。case-close 等への汎用化は別途整備候補だが、具体性・出現回数ともに不足。
- **既存対策**: あり（REQ-0147 で promote 系に実装済み）

#### L-005: Windows 環境で Write ツールが既存 UTF-8 ファイルを cp932 で書き出す
- **8軸加重合計**: 28/40
- **推奨処分案**: **既存 skill へ反映** — `agentdev-gh-cli/references/standard-procedures.md` L57 は「OpenCode の Write tool も使用可能（BOMなしUTF-8で書き出す）」と記載するが、L-005 は既存 UTF-8 ファイル上書き時に cp932 で書き出される事象を実証。記載と事実が矛盾しており、既存 UTF-8 ファイル編集時は edit ツール（per-line string replace）を優先するルールの明文化が必要。`agentdev-gh-cli` と `AGENTS.md`（常時ルール候補）への反映。
- **既存対策**: あり（部分的・事実矛盾）。WriteAllText 規定は存在するが、Write ツールの既存ファイル上書き挙動の注意喚起なし。

#### L-006: 並列機械的テキスト置換 OU の Wave 実行で文字レベルマージが必要になる
- **8軸加重合計**: 22/40
- **推奨処分案**: **deferred** — 文字レベル SequenceMatcher 結合の実証記録。ツール事前準備が前提だが、出現回数1件・汎用化には専用ツール整備が必要。Wave 設計ガイダンスへの競合コスト見積もり追記は将来検討。
- **既存対策**: なし（文字レベルマージツール未標準化）

#### L-007: REQ の手続き列挙に中核操作（PR 作成）が抜けていた場合の SPEC 拡張判断
- **8軸加重合計**: 21/40
- **推奨処分案**: **deferred** — REQ 列挙で中核操作が漏れるパターンの実証。SPEC 拡張で即時対応しつつ REQ 更新を後続工程に委ねる二段階判断は有効だったが、出現1件・手順化困難。
- **既存対策**: なし（二段階判断フロー未明記だが、個別判断で対応可能）

#### L-009: Windows + worktree 環境で git mv の実行形式による成否差異
- **8軸加重合計**: 23/40
- **推奨処分案**: **既存 skill へ反映** — `git -C <worktree> mv` が失敗し `workdir` 指定 + 平置き `git mv` が成功した事象。Windows + worktree 環境の git mv で `git -C` と `workdir` の挙動差を `agentdev-git-worktree` に明記。ディレクトリ移動を伴う git mv では workdir 指定を優先するフォールバック手順の追記。
- **既存対策**: なし（git mv の実行形式差異に関する記載なし）

#### L-011: 作成時ゲート vs 事後機械検出 の責務分担（二重安全網の許容）
- **8軸加重合計**: 21/40
- **推奨処分案**: **deferred** — REQ-0101-047/048/049（作成時ゲート）と IR-036（事後機械検出）の両方が既存。冗長性を許容する設計指針の観察記録。新規対策不要。
- **既存対策**: あり（ゲート + 機械検出の二重構造が既存）

#### L-012: 機械横断修正の完了宣言には再 grep 0 件確認が必須
- **8軸加重合計**: 27/40
- **推奨処分案**: **既存 skill へ反映** — `agentdev-doc-writing/references/mechanical-replacement-rules.md`「再現性の担保」節（L178-190）に Step 3 で0件確認手順が既存。しかし PR #1090 で運用されず残存3件を見落とした（application miss）。`agentdev-quality-gates` の QG-3/QG-4 に機械横断是正向け「再 grep 0 件証拠」要求項が未整備（guardrail insufficiency）。QG 検査項目拡充 + 運用徹底の明記が必要。
- **既存対策**: あり（手順存在・運用未徹底）。ギャップ分類: application miss + guardrail insufficiency。

#### L-014: 複数 checker で共用される関数の削除要求は対象スコープ明示が前提
- **8軸加重合計**: 25/40
- **推奨処分案**: **既存 skill/command へ反映** — `agentdev-workflow-templates` の Issue 完了条件テンプレート（checkbox 形式）は既存だが、関数削除要求時のスコープ明示（「from checkX」表記）ガイドが未整備（fix gap）。`case-run.md` のテスト戦略（TS）に削除対象関数の全使用箇所 grep 確認の標準化も未実施。
- **既存対策**: あり（部分的）。完了条件テンプレート存在、スコープ明示ルールなし。

---

### 除外エントリ（deferred）の根拠

| 対象 | 除外理由 | 根拠 |
|------|---------|------|
| L-001 | 既存自動検出で対応済 | copyScripts + drift detection が機能中 |
| L-002 | 汎用化の具体性不足 | promote 系以外への適用は候補止まり |
| L-006 | ツール前提・出現1件 | 文字レベルマージツール未整備 |
| L-007 | 手順化困難・出現1件 | 二段階判断は個別対応可能 |
| L-011 | 対策既存・観察記録 | ゲート + 機械検出の二重構造が既存 |

## promote 時 prune 計画

- **対象エントリ数**: 14件（inbox から移動予定）
- **prune 予定**: staged 7件（L-003, L-005, L-008, L-009, L-012, L-013, L-014）— 証拠は各採用済み成果物の「元learning item / 根拠」セクションに保存
- **prune 対象外**: deferred 7件（L-001, L-002, L-004, L-006, L-007, L-010, L-011）は archive/active.md に残存

## 全体傾向
- **高スコアクラス**: 問題クラス1（worktree junction、30/40）と問題クラス3（task() フォールバック、28/40）。worktree 環境の運用落とし穴が複数回にわたり再発しており、`agentdev-git-worktree` へのガードレール強化が優先度高。
- **横展開性が高い**: worktree 関連（L-003, L-008, L-009, L-013）は worktree 使用継続でほぼ確実に再発。Windows 環境固有（L-005, L-009）も consumer repo 配布先で同様の落とし穴が予測される。
- **自動化適性が高い**: L-012（再 grep 0 件確認）は QG-3/QG-4 への検査項目組み込みで自動化可能。L-003/L-008 の isInsideWorktree ヘルパーも適用範囲拡張で自動化可能。
- **全体的な観察所見**: 2026-06-22〜25（Epic #1028〜#1138）の集中的な学び蓄積。Wave 実行・機械横断是正・worktree 運用・ハーネス制約の4テーマで知見が集中。既存スキル（git-worktree, gh-cli, doc-writing, quality-gates, workflow-templates）へのガードレール追加が主な昇華先。

## ADR候補除外記録

全 staged 候補に対して `agentdev-adr-guidelines` の除外基準を適用:

| 対象item | 除外理由 | 根拠事実 | 代替反映先候補 |
|----------|---------|---------|--------------|
| 問題クラス1（worktree junction） | 運用ルール | worktree 環境の標準運用（src/opencode/ 直接参照）・ヘルパー適用範囲の文書化であり、技術選定・設計判断を含まない | skill（agentdev-git-worktree） |
| 問題クラス2（pull block） | command仕様・運用ルール | case-close Step 9 の手順追加・フォールバック手順の標準化であり、アーキテクチャ決定を含まない | command（case-close.md）, skill（agentdev-git-worktree） |
| L-005（Write cp932） | 運用ルール | edit ツール優先ルールの文書化であり、技術判断を含まない | skill（agentdev-gh-cli）, AGENTS.md |
| L-009（git mv 実行形式） | 運用ルール | workdir 指定フォールバック手順の文書化 | skill（agentdev-git-worktree） |
| L-012（再 grep 確認） | 運用ルール | QG 検査項目拡充・運用徹底の文書化 | skill（agentdev-quality-gates, agentdev-doc-writing） |
| L-014（関数削除スコープ） | 運用ルール | Issue 完了条件の書き方ガイド・TS 標準化の文書化 | skill（agentdev-workflow-templates）, command（case-run.md） |
