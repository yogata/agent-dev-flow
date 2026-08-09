# 評価レポート

## メタデータ
- **実行日時**: 2026-08-09
- **対象エントリ数**: 12件（inbox: 12件, deferred: 既存プールは参照対象外）
- **問題クラス数**: 3（未分類単独 6）

## 問題クラス一覧

### 問題クラス1: Phase 0 commit スコープ管理運用（C1）

- **根本原因**: Phase 0 commit のスコープ設計（ドメイン state 更新と成果物変更の境界、on_failure での SPEC 修正許容）が不明示
- **再発条件**: Phase 0 commit で複数 SPEC を一括適用し、Wave 分割された子 Issue が同一 SPEC の異なるセクションを検証対象とする場合。または Phase 0 で REQ/SPEC 実体変更と管理メタデータを同一コミットへ含める場合
- **予防策**: Phase 0 commit のスコープ設計運用ルール（2 分割、on_failure SPEC 修正許容）を SPEC/guide へ明文化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（#1, #2） |
| 影響度 | 3/5 | 横断的手戻り・追跡 PR 空コミット化・レビュー可能性低下（中〜大） |
| 横展開性 | 3/5 | Phase 0 commit を発行する全ケース。AgentDevFlow 固有だが同 FW 内で汎用 |
| 反映先明確度 | 4/5 | case-open/case-auto/case-run SPEC、workflow-templates。明確 |
| 自動化適性 | 2/5 | 運用ルール明文化が中心。commit 分割判断は人/エージェント |
| プロジェクト固有知識再利用性 | 4/5 | Phase 0 commit は AgentDevFlow 固有概念。プロジェクト固有度高 |
| 再発可能性 | 4/5 | Phase 0 commit を発行する全ケースで発生し得る |
| 費用対効果 | 4/5 | 運用ルール明文化（低コスト）でスコープ重複・空コミット化（中リスク）を低減 |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote（spec/guide）。スコア中高、反映先明確、再発可能性高。運用ルールのため ADR 対象外（禁止条件フィルタリングゲート: 運用ルール該当）。

#### エントリ一覧
- Phase 0 commit と孫 Issue テスト戦略のスコープ交差 [inbox]
- Phase 0 commit で直接 main へ適用した変更と追跡 PR のスコープ分離 [inbox]

---

### 問題クラス2: worktree 独立 working tree の構造的制約（C2）

- **根本原因**: worktree は独立した working tree を持ち、親 worktree の untracked/gitignore/junction を引き継がない
- **再発条件**: worktree-per-WP / worktree-per-issue モデルで gitignore 対象ディレクトリ配下のファイルを複数 worktree 間で共有する場合。または git worktree 環境で junction 依存 checker を実行する場合
- **予防策**: worktree 制約を agentdev-git-worktree skill references へ明示。統合検証・最終検査はメインリポジトリで実施

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（#4, #5） |
| 影響度 | 3/5 | gitignore 引き継ぎ不可・junction checker skip。作業妨害・検証ギャップ（中） |
| 横展開性 | 4/5 | worktree 分割モデル全般。git worktree を使う他プロジェクトでも発生 |
| 反映先明確度 | 4/5 | agentdev-git-worktree skill、repo-agentdev-integrity SPEC。明確 |
| 自動化適性 | 2/5 | 判断基準明示が中心。checker option 追加は実装コスト要 |
| プロジェクト固有知識再利用性 | 3/5 | worktree 運用は AgentDevFlow で使用、知見自体は git worktree 汎用 |
| 再発可能性 | 4/5 | worktree 環境で作業する全ケース |
| 費用対効果 | 4/5 | skill/SPEC 明示（低コスト）で作業妨害・検証ギャップ（中リスク）を低減 |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote（skill/spec）。技術判断不在・プロジェクト固有作業制約のため ADR 対象外。

#### エントリ一覧
- worktree-per-WP モデルでの gitignore 対象ファイルの受け渡し判断基準 [inbox]
- worktree 環境で junction 依存 checker が skip される制約 [inbox]

---

### 問題クラス3: 外部依存のメジャーバージョン互換性（C3）

- **根本原因**: 外部依存ライブラリ（TypeScript / zod）のメジャーバージョンアップに伴う非互換。事前確認手順が未確立
- **再発条件**: 外部依存ライブラリのメジャーアップデートを追従、または世代のずれた環境でスクリプト・検査器を実行する場合
- **予防策**: 依存ライブラリの世代・API 互換性事前確認、メジャーアップデート時の非互換 API 一括スキャン、検査器の実行環境分離

> 審議メモ: #8（TS 世代不一致）と #10（zod v3→v4 API 変更）は根本原因の具体的技術が異なる。予防策フレーム（依存互換性事前確認 + 非互換スキャン + 環境分離）の共通性でクラスタリングし、採用済み成果物で #8/#10 を別節化して具体性を担保する（対論型レビュー R1 部分合意）。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（#8, #10） |
| 影響度 | 3/5 | 検査器実行不能（代替検証へ退化）、型エラー発生。回避策あり（中） |
| 横展開性 | 4/5 | 独立 package.json を持つ TS スクリプト群、zod 利用スキル全般。汎用 |
| 反映先明確度 | 4/5 | 検査器実行手順、TS スクリプト検証ガイド、zod スキル実装ガイド。明確 |
| 自動化適性 | 3/5 | 非互換 API 一括スキャンは自動化可能。世代判定・環境分離は設計判断 |
| プロジェクト固有知識再利用性 | 2/5 | 外部依存の互換性管理は汎用。プロジェクト固有度低 |
| 再発可能性 | 4/5 | 外部依存のメジャーアップデートは継続的に発生 |
| 費用対効果 | 4/5 | 事前確認・スキャン手順の明文化（低コスト）で作業妨害（中リスク）を低減 |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote（guide/spec）。運用ルール・実装依存知見のため ADR 対象外。

#### エントリ一覧
- TypeScript 世代差により no-excuse 検査器を実行できない場合の代替検証 [inbox]
- zod v4 の .refine(fn, messageFn) 第2引数が文字列または静的オブジェクトのみ受け付ける [inbox]

---

### 未分類（単独エントリ）

#### U1: Windows 環境での git commit メッセージ encoding 手順（#3）

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | コミットメッセージ化け。CI/履歴の汚損（中） |
| 横展開性 | 4/5 | Windows 環境で git commit/tag/ネイティブコマンドへ日本語ファイルを渡す全ケース |
| 反映先明確度 | 5/5 | agentdev-gh-cli standard-procedures.md。特定済み |
| 自動化適性 | 4/5 | 標準手順の対象拡張。容易 |
| プロジェクト固有知識再利用性 | 4/5 | Windows + PowerShell + git の組み合わせ。AgentDevFlow で頻出 |
| 再発可能性 | 4/5 | Windows 環境で git commit を実行する全ケース |
| 費用対効果 | 5/5 | 既存 WRITE 手順の対象拡張（極低コスト）で化け（中リスク）を防止 |
| **加重合計** | **30/40** | |

- **推奨処分案**: promote（skill、fix gap）。スコア最高、反映先特定済み、費用対効果極高。command/skill 仕様のため ADR 対象外。

#### U4: 実入力に合わない fixture が関係抽出漏れを隠す（#9）

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 4/5 | 関係抽出漏れ（10件中8件の見逃し）。検出されないバグ（大） |
| 横展開性 | 4/5 | 構造化設定を独自解析するテスト全般 |
| 反映先明確度 | 4/5 | repo-agentdev-artifact-graph テスト設計。明確 |
| 自動化適性 | 3/5 | 実入力回帰検証の組み込み。可能 |
| プロジェクト固有知識再利用性 | 3/5 | artifact-graph 固有だがテスト設計原則として汎用 |
| 再発可能性 | 3/5 | 実入力が配列内 mapping を含む場合（中） |
| 費用対効果 | 4/5 | 実入力由来 fixture 追加（低中コスト）で見逃し（大リスク）を防止 |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote（skill/テスト設計、fix gap）。影響度大・予防策具体・既存ギャップ実在。実装依存（テスト設計）のため ADR 対象外。出現1件のため backlog-review/req-define で慎重判断を促す。

#### U2: 移行計画 §5.3 の明示対象不足による壊れた fixture 修復見送りリスク（#6）

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 2/5 | 壊れた fixture の修復見送り。横展開で対応済み（小） |
| 横展開性 | 3/5 | 移行計画・要件定義で代表例を明示する全ケース |
| 反映先明確度 | 3/5 | 移行計画テンプレート、docs/guides。候補だが具体先は曖昧 |
| 自動化適性 | 2/5 | 運用ルール明文化。困難 |
| プロジェクト固有知識再利用性 | 3/5 | 移行計画はプロジェクト固有 |
| 再発可能性 | 3/5 | 移行計画・要件定義で代表例を明示する際（中） |
| 費用対効果 | 3/5 | テンプレート注記（低コスト）で見送りリスク（小）を低減 |
| **加重合計** | **20/40** | |

- **推奨処分案**: deferred（living pool 維持）。出現1件・反映先曖昧・移行一回限り・情報断片的。

#### U3: command 薄型化による既存参照の行移動で baseline 比較が新規 delta を生む制約（#7）

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 2/5 | baseline NG 増加・follow-up 委譲。機能的変更なし（中だが実害軽微） |
| 横展開性 | 3/5 | 行位置ベース baseline で参照管理する checker 全般。限定 |
| 反映先明確度 | 4/5 | repo-agentdev-integrity SPEC、agentdev-workflow-lifecycle、移行計画 §10.6 |
| 自動化適性 | 2/5 | baseline 管理粒度移行は設計変更。option 追加はコスト要 |
| プロジェクト固有知識再利用性 | 3/5 | IR-055 baseline は repo 固有。知見は checker 設計に有用 |
| 再発可能性 | 3/5 | 大規模リファクタ時（中） |
| 費用対効果 | 2/5 | baseline 管理粒度移行（高コスト）vs delta 許容（中リスク）。やや割高 |
| **加重合計** | **20/40** | |

- **推奨処分案**: deferred（living pool 維持）。出現1件・費用対効果やや割高・技術判断含むが未成熟（対論型レビュー R7）。大規模リファクタ再発時に再評価。ADR 候補見送り（具体性不足）。

#### U5: bun test の Bun.spawnSync は Windows 環境で CLI 引数パース順序に注意が必要（#11）

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | テストが引数を認識しない。テスト不正確（中） |
| 横展開性 | 3/5 | Bun.spawnSync 経由で CLI 引数処理を検証するテスト全般 |
| 反映先明確度 | 4/5 | agentdev-artifact-graph テスト設計、Bun.spawnSync CLI テスト手順 |
| 自動化適性 | 3/5 | Windows/POSIX 両実行。可能 |
| プロジェクト固有知識再利用性 | 2/5 | Bun + Windows の組み合わせ。限定 |
| 再発可能性 | 3/5 | bun test で CLI 引数解釈 + Windows（限定〜中） |
| 費用対効果 | 3/5 | マルチプラットフォーム実行（低中コスト）でテスト不正確（中リスク）を防止 |
| **加重合計** | **22/40** | |

- **推奨処分案**: deferred（living pool 維持）。出現1件・環境依存・具体性やや不足。再発時に具体化。

#### U6: SPEC rename/supersede 時の historical 参照と check_extensions warning は TS-001 と既存パターンで許容される（#12）

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 1/5 | 修正不要と判断済み。実害なし |
| 横展開性 | 2/5 | SPEC rename/supersede 操作時。限定 |
| 反映先明確度 | 3/5 | agentdev-quality-gates QG-3 解説、capture-boundaries SPEC。候補 |
| 自動化適性 | 1/5 | 運用ルールの記録。困難 |
| プロジェクト固有知識再利用性 | 3/5 | TS-001 例外と check_extensions 設計の運用知見 |
| 再発可能性 | 2/5 | SPEC rename/supersede 時（低〜中） |
| 費用対効果 | 2/5 | 既存仕様が扱いを規定済み。新規対策不要 |
| **加重合計** | **15/40** | |

- **推奨処分案**: duplicate（既存カバー）。TS-001 pass_criteria と check_extensions.ts severity:warning が扱いを規定。実害なし。capture 回収 routing 分離も capture-boundaries SPEC が intake/learning 分離を規定（対論型レビュー R3）。

---

## promote 時 prune 結果

- **対象エントリ数**: 12件
- **prune 実施**: あり
- **prune 候補**: 9件（staged 8件: #1,#2,#3,#4,#5,#8,#9,#10 + duplicate 1件: #12）
- **prune 却下**: 0件
- **prune 非対象（deferred 残置）**: 3件（#6, #7, #11）
- **prune 方式**: staged エントリの根拠は採用済み成果物の「元learning item/根拠」セクションへ保存済み。duplicate の判定理由は本レポート U6 に記録済み。staged/duplicate エントリは deferred.md への追記をスキップし（追記後即 prune と等価）、deferred 判定3件のみ deferred.md へ移動日付きで追記。

## 全体傾向

- **高スコア（promote）**: Windows 環境のエンコーディング手順（U1, 30点）が最高。反映先特定済み・費用対効果極高。
- **中高スコアクラスター**: Phase 0 commit 運用（C1, 26）、worktree 制約（C2, 26）、外部依存互換性（C3, 26）、実入力 fixture（U4, 26）。いずれも共通予防策フレームで昇華可能。
- **横展開性が高い**: worktree 制約（C2, 4）、外部依存互換性（C3, 4）、Windows エンコーディング（U1, 4）、実入力 fixture（U4, 4）。
- **自動化適性が高い**: Windows エンコーディング（U1, 4）。他は運用ルール明文化が中心。
- **全体的観察**: Phase 0 commit・worktree・外部依存の3テーマで複数エントリが集積。AgentDevFlow の大規模移行（Epic #1924 等）と標準スキル新設（artifact-graph, adversarial-review）の局面で発生した運用知見が多い。単独エントリの昇華判断は影響度・予防策具体性・既存ギャップ実在を基準に、backlog-review/req-define での慎重判断を促す形で promote した。

## ADR候補除外記録

禁止条件フィルタリングゲート（agentdev-adr-guidelines 除外基準）を全 promote 候補へ適用。ADR 候補は 0件。

- **C1（Phase 0 commit スコープ管理運用）**: 除外理由「運用ルール」（作業手順・承認手順・運用上の制約の定義）。根拠: Phase 0 commit のスコープ設計・コミット分割・on_failure SPEC 修正許容は運用手順。代替反映先: SPEC/guide（case-auto, case-run, workflow-templates）。
- **C2（worktree 構造的制約）**: 除外理由「技術判断不在」（アーキテクチャ上の決定・技術選定・設計判断を含まない）。根拠: worktree の独立 working tree 制約は git worktree の既知の挙動の記録であり、新規技術判断を含まない。代替反映先: skill references/SPEC。
- **C3（外部依存メジャーバージョン互換性）**: 除外理由「運用ルール」（検証手順・実装依存知見）。根拠: 依存ライブラリの世代・API 互換性の事前確認手順は運用ルール。代替反映先: guide/spec。
- **U1（Windows commit メッセージ encoding）**: 除外理由「command仕様」（既存 skill 手順の対象拡張）。根拠: agentdev-gh-cli WRITE 標準手続きの対象拡張。代替反映先: skill references。
- **U4（実入力 fixture）**: 除外理由「運用ルール」（テスト設計原則・実装依存知見）。根拠: 実入力構造を再現する fixture と回帰検証の併用はテスト設計原則。代替反映先: skill/テスト設計。
- **U3（baseline delta）※deferred**: 技術判断（checker baseline 管理粒度の設計）を含むが ADR 候補評価対象外（出現1件・具体性不足・deferred）。大規模リファクタ再発時に再評価。

## 審議経緯（対論型レビュー）

ユーザー指示により agentdev-adversarial-review を実施。Orchestrator/Reviewer/Reviewee の3論理的役割で判定案を審議。8つの本質的争点（R1-R8）を抽出し、相互反証の結果、判定案（promote 5/deferred 3/duplicate 1）は維持。主な採用 finding:
- C1/C3 のクラスタリングは予防策共通性で許容、採用済み成果物で個別エントリを別節化（R1/R8 部分合意）
- 出現1件エントリ（U1/U4）の promote は影響度・予防策具体性・既存ギャップ実在で正当化、成果物に出現件数・再発性を明記し backlog-review の慎重判断を促す（R2 維持）
- entry 7 の ADR 候補可能性は見送り（未成熟、deferred で再評価）（R7 維持）
