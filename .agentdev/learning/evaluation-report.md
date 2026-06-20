# 評価レポート

## メタデータ
- **実行日時**: 2026-06-21 (JST)
- **対象エントリ数**: 16件（inbox: 11件, archive: 5件）
- **問題クラス数**: 0（厳密基準でクラスタ形成なし、全エントリ未分類）

## 分析サマリ

### 正規化結果
- inbox 全11エントリは旧フォーマット（状況 / 学び / 再発防止 の3フィールド形式）
- 正規化マッピング（解析時のみ適用、元ファイル不改修）:
  - `状況` → `問題事象`
  - `学び` → `根本原因` + `予防策候補`（文脈で分割）
  - `再発防止` → `自律対応内容` + `予防策候補`
- 旧フォーマットに存在しないフィールド（発生局面/検知方法/ユーザー確認有無/ADR-REQ-spec影響/横展開観点/再発条件/想定反映先）は空文字（推測補完しない）

### 問題クラス分類結果
- **厳密基準（根本原因+再発条件+予防策 が同一）でのクラスタ**: 0件
- **未分類（単独エントリ）**: 16件（inbox 11件 + archive 5件）
- inbox と archive の間でも同一問題クラスを形成する組合せなし
- 関連テーマで3つの promoted artifact にグループ化（後述）

### 既存対策確認サマリ（inbox 11件に対し explore agent x4 で照会）

| # | エントリ | 確認対象 | 結果 | ギャップ分類 |
|---|---------|---------|------|-------------|
| 1 | case-open cleanup git add -A | case-open/case-close G23/G24/G17, REQ-0137-005 | あり | なし |
| 2 | REQ/IR ID 桁数取り違え | REQ-0101-003, req-file-manager, AGENTS.md | 部分 | fix gap（IR ID 3桁規定なし） |
| 3 | gate hook strict/heuristic | cli_utils.ts determineExitCode/classifyResult | なし | fix gap（実装削除済） |
| 4 | Windows+junction worktree | workflow-orchestration 22-27行 | 部分 | application miss（driver 引き継ぎルール不在） |
| 5 | REQ Step 番号 drift | REQ-0101-068, req-file-manager, AGENTS.md | 部分 | application miss（実践ガイド不在） |
| 6 | gh CLI Shift-JIS 文字化け | gh-cli SKILL Section 1/2 | 部分 | application miss（コンソール初期化手順不在） |
| 7 | req-define ADR 番号矛盾 | req-define/req-save artifact_actions | 部分 | 部分（req-define 側推測指定ガイド不在） |
| 8 | worktree 古い commit で PR conflict | case-run Step 4 (行56) | 部分 | fix gap（git fetch origin 明示不在） |
| 9 | oh-my-openagent 存在確認で停止 | case-run Step 5 (行75-76) | あり | なし（AGENTS.md 信頼方針明記済） |
| 10 | bunx モジュール解決エラー | adapter/references/oh-my-openagent.md | なし | fix gap（npx フォールバック不在） |
| 11 | ハーネス タイムアウト | adapter/references/oh-my-openagent.md 72-80行 | 部分 | guardrail insufficiency（事後処理手順不在） |

## 問題クラス一覧

厳密基準でクラスタ形成なし。全エントリを未分類として個別評価。

### 未分類（inbox 11件）

#### エントリ1: case-open cleanup で git add -A を使用すると意図しないファイル削除が混入 [inbox]

- **根本原因**: cleanup操作で `git add -A` を使うと作業ディレクトリの全状態を巻き込む
- **再発条件**: cleanup系操作で `git add -A` を使う時
- **予防策**: 削除対象ファイルのパスを明示的に `git rm` / `git add` で指定

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（1件） |
| 影響度 | 3/5 | 復元commitが必要だがデータ損失なし |
| 横展開性 | 4/5 | 全cleanup操作で発生し得る |
| 反映先明確度 | 5/5 | case-open/case-close G23/G24/G17 で特定済 |
| 自動化適性 | 4/5 | 明示パス指定ルールで容易に徹底可能 |
| プロジェクト固有知識再利用性 | 3/5 | git の汎用知識だが AgentDevFlow 固有の cleanup 文脈 |
| 再発可能性 | 3/5 | ルール明文化で低下するが残リスク |
| 費用対効果 | 5/5 | ルール徹定で防止可能、コスト低 |
| **加重合計** | **28/40** | |

- **推奨処分案**: **duplicate**。理由: case-open G23/G24、case-close G17 + REQ-0137-005 で既存対策が完全。学びは既存ルールの再確認に相当

---

#### エントリ2: REQ ID は4桁、IR ID は3桁 — パーサ実装で桁数を取り違える落とし穴 [inbox]

- **根本原因**: REQ(4桁)とIR(3桁)の桁数差を認識せず正規表現を書く
- **再発条件**: パーサ・バリデータ実装時
- **予防策**: 実データサンプルをコメントに併記

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 3/5 | パーサ不具合だがテストで早期発見 |
| 横展開性 | 2/5 | パーサ実装者のみ、限定 |
| 反映先明確度 | 4/5 | docs/specs/system.md ID体系、REQ-0101 で明確 |
| 自動化適性 | 3/5 | 実データサンプルテストで可能 |
| プロジェクト固有知識再利用性 | 5/5 | AgentDevFlow 固有のID体系 |
| 再発可能性 | 3/5 | 中程度 |
| 費用対効果 | 4/5 | 良い（規定追記で予防） |
| **加重合計** | **25/40** | |

- **推奨処分案**: **既存 REQ/SPEC へ反映**。理由: fix gap（IR ID 3桁の規定が docs/specs/system.md / REQ-0101 / AGENTS.md のいずれにも不在）。promoted artifact C にグループ化

---

#### エントリ3: gate hook の strict/heuristic 区別は --strict-only flag で解決する [inbox]

- **根本原因**: `determineExitCode()` が ng と warning を区別せず、heuristic 違反でも EXIT_NG を返す
- **再発条件**: gate hook で strict/heuristic を区別する必要がある場面
- **予防策**: flag-based opt-in（--strict-only flag と determineExitCodeStrict()）

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 4/5 | commit/push が block される |
| 横展開性 | 3/5 | gate hook 設計一般 |
| 反映先明確度 | 4/5 | integrity-check / cli_utils.ts で明確 |
| 自動化適性 | 4/5 | flag 追加で解決容易 |
| プロジェクト固有知識再利用性 | 4/5 | flag-based opt-in パターン |
| 再発可能性 | 2/5 | 実装削除の経緯あり、別途議論が必要 |
| 費用対効果 | 4/5 | 良い（ただし現状仕様との整合要議論） |
| **加重合計** | **26/40** | |

- **推奨処分案**: **deferred**。理由: PR #912 で実装されたが commit a27a8e56「3層ゲート・本体運用自動化を取り下げ汎用仕組みのみに縮小」で削除済。現在の integrity-check 方針（汎用仕組みのみ）と整合しないため、別途議論が必要。学び自体は有効だが即時反映先が未定

##### 既存対策確認
- **確認結果**: なし（fix gap）
- **該当ファイル**: `.opencode/skills/repo-agentdev-integrity/scripts/cli_utils.ts` 行353-356 `determineExitCode()`
- **ギャップ詳細**: PR #912 (commit 3e1099bf) で `--strict-only` flag と `determineExitCodeStrict()` が実装されたが、commit a27a8e56 で削除。現在 `determineExitCode()` は `summary.ng > 0 || summary.warning > 0` で EXIT_NG を返す。`classifyFindingLevel()` は strict/heuristic/observation を区別するが `determineExitCode()` はこれを考慮しない

---

#### エントリ4: Windows+junction worktree では .opencode/ が空になり source/projection 手動同期が必要 [inbox]

- **根本原因**: junction 未伝播 + .gitignore で .opencode/agentdev-* が追跡対象外
- **再発条件**: Windows+junction 環境で worktree 作成時
- **予防策**: source/projection 両辺手動編集、driver subagent 引き継ぎプロンプトに明記

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 4/5 | worktree 内で検証失敗 |
| 横展開性 | 2/5 | Windows+junction 環境限定 |
| 反映先明確度 | 5/5 | workflow-orchestration SKILL 22-27行で特定済 |
| 自動化適性 | 2/5 | 手動両辺編集が必要 |
| プロジェクト固有知識再利用性 | 5/5 | Windows 固有の技術的落とし穴 |
| 再発可能性 | 5/5 | Windows 環境ではほぼ確実 |
| 費用対効果 | 4/5 | 良い（引き継ぎルール追加で低コスト） |
| **加重合計** | **28/40** | |

- **推奨処分案**: **既存 skill へ反映**（application miss）。理由: workflow-orchestration 22-27行で制約記載あり、しかし driver subagent 引き継ぎプロンプトへの明記ルールが不在。promoted artifact A にグループ化

---

#### エントリ5: REQ に command の Step 番号を固定すると drift する [inbox]

- **根本原因**: REQ に command の Step 番号を直接書くと command リファクタで即座に陳腐化
- **再発条件**: REQ 作成・更新時
- **予防策**: 振る舞いで書き、Step 番号は command reference へ

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（ただし複数REQ-0131-010/REQ-0104-047/REQ-0114-060/063/REQ-0136-010 で発生） |
| 影響度 | 3/5 | REQ 陳腐化、IR-044 で検出 |
| 横展開性 | 4/5 | 全REQ作成で発生 |
| 反映先明確度 | 5/5 | REQ-0101-068 / req-file-manager / AGENTS.md で特定済 |
| 自動化適性 | 4/5 | REQ lint でStep番号検出可能 |
| プロジェクト固有知識再利用性 | 4/5 | REQ/SPEC 責務分離の実践的知見 |
| 再発可能性 | 4/5 | 高い（実践ガイド不在のため） |
| 費用対効果 | 5/5 | 極めて良い（ガイド追記で予防） |
| **加重合計** | **30/40** | |

- **推奨処分案**: **既存 skill/AGENTS.md へ反映**（application miss）。理由: REQ-0101-068 で「Step番号のみを主たる文意とする場合は command reference 等に配置」は規定済み、しかし req-file-manager SKILL/AGENTS.md 編集ガードレールに実践ガイドが不在。promoted artifact C にグループ化

---

#### エントリ6: gh CLI の --body-file が Windows Shift-JIS コンソール環境で文字化け [inbox]

- **根本原因**: PowerShell コンソールエンコーディングが shift_jis（chcp 932）
- **再発条件**: Windows PowerShell から gh CLI を --body-file/--title で呼ぶ
- **予防策**: `[Console]::OutputEncoding = UTF8` + `cmd /c chcp 65001`

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 4/5 | GitHub 上の本文が文字化け |
| 横展開性 | 3/5 | Windows PowerShell + gh CLI 利用者 |
| 反映先明確度 | 5/5 | gh-cli SKILL Section 1/2 で特定済 |
| 自動化適性 | 5/5 | 初期化ステップ追加で即自動化可 |
| プロジェクト固有知識再利用性 | 4/5 | Windows + gh CLI 固有 |
| 再発可能性 | 5/5 | 現行設定に未記載のためほぼ確実 |
| 費用対効果 | 5/5 | 極めて良い（初期化ステップ追記で防止） |
| **加重合計** | **32/40** | 最高スコア |

- **推奨処分案**: **既存 skill へ反映**（application miss）。理由: gh-cli SKILL Section 1/2 に UTF-8 BOM なし保存・WriteAllText 規定はあるが、コンソールエンコーディング初期化手順が不在。promoted artifact B（単独）にグループ化

---

#### エントリ7: req-define で指定した ADR 番号が adr-file-manager 採番ルールと矛盾 [inbox]

- **根本原因**: req-define が ADR 番号を推測指定（ADR-0115）したが adr-file-manager 採番ルール（max+1, 欠番埋め禁止）と矛盾
- **再発条件**: req-define で ADR 番号を content タイトルに直接書く場合
- **予防策**: req-save が採番ルールで再検証、または req-define では `new:{slug}` のみ

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 3/5 | 番号置換の手戻り |
| 横展開性 | 3/5 | req-define で ADR 番号指定時に発生 |
| 反映先明確度 | 5/5 | req-define/req-save/adr-file-manager で特定済 |
| 自動化適性 | 4/5 | req-save での番号再検証で容易 |
| プロジェクト固有知識再利用性 | 4/5 | adr-file-manager 採番ルール固有 |
| 再発可能性 | 4/5 | 高い（ガイド不在） |
| 費用対効果 | 4/5 | 良い（ガイド追記で予防） |
| **加重合計** | **28/40** | |

- **推奨処分案**: **既存 command/skill へ反映**（部分）。理由: `target_spec` の `new:{topic-slug}` 仕様は規定済み、しかし req-define 側での ADR 番号推測指定のガイドが不在。promoted artifact C にグループ化

---

#### エントリ8: 実行担当サブエージェントの worktree が古い commit 基準だと PR conflict [inbox]

- **根本原因**: worktree 作成時に origin/main が最新でない（並列 Wave 実行で前 Wave merge 後に更新）
- **再発条件**: 並列 Wave 実行で前 Wave merge 後に次 Wave の worktree を作る時
- **予防策**: worktree 作成前に `git fetch origin` 必須

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 4/5 | PR conflict で force-push 必要 |
| 横展開性 | 4/5 | 並列 Wave 実行一般 |
| 反映先明確度 | 5/5 | case-run Step 4 で特定済 |
| 自動化適性 | 5/5 | `git fetch origin` 追加で即自動化可 |
| プロジェクト固有知識再利用性 | 4/5 | case-run worktree 固有 |
| 再発可能性 | 4/5 | 高い（手順不在） |
| 費用対効果 | 5/5 | 極めて良い（1行追加で予防） |
| **加重合計** | **32/40** | 最高スコア |

- **推奨処分案**: **既存 command へ反映**（fix gap）。理由: case-run Step 4 で `origin/main` ベース記載あるが `git fetch origin` の明示不在。promoted artifact A にグループ化

---

#### エントリ9: case-run で oh-my-openagent の存在確認をして停止した [inbox]

- **根本原因**: 不要な事前検出（bunx で常に起動可能）
- **再発条件**: case-run Step 5 で存在確認を行う
- **予防策**: AGENTS.md のハーネス選定を信頼し bunx で直接起動

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 3/5 | case-run 停止だが即復帰可能 |
| 横展開性 | 3/5 | case-run Step 5 利用者 |
| 反映先明確度 | 5/5 | case-run Step 5 / adapter で特定済 |
| 自動化適性 | 5/5 | 存在確認ステップ削除で即解決 |
| プロジェクト固有知識再利用性 | 4/5 | oh-my-openagent 統合固有 |
| 再発可能性 | 3/5 | 中程度 |
| 費用対効果 | 5/5 | 極めて良い |
| **加重合計** | **29/40** | |

- **推奨処分案**: **duplicate**。理由: case-run Step 5（行75-76）で「AGENTS.md のハーネス選定を信頼して起動する」方針が既に明記済。学びは既存ルールの再確認に相当

---

#### エントリ10: bunx oh-my-opencode run が Windows でモジュール解決エラー [inbox]

- **根本原因**: bunx の Windows でのバイナリ解決バグ（oh-my-openagent-windows-x64 等のパッケージ構造と不一致）
- **再発条件**: Windows で bunx 経由で oh-my-opencode を起動
- **予防策**: `npx oh-my-opencode run` フォールバック

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 3/5 | npx で回避可能 |
| 横展開性 | 3/5 | Windows + bunx 利用者 |
| 反映先明確度 | 5/5 | adapter/references/oh-my-openagent.md で特定済 |
| 自動化適性 | 4/5 | npx フォールバック記述で容易 |
| プロジェクト固有知識再利用性 | 5/5 | oh-my-openagent Windows 固有 |
| 再発可能性 | 4/5 | bunx バグ継続限り高い |
| 費用対効果 | 5/5 | 極めて良い |
| **加重合計** | **30/40** | |

- **推奨処分案**: **既存 skill へ反映**（fix gap）。理由: adapter/references/oh-my-openagent.md に bunx のみ記載、npx フォールバック経路が完全不在。promoted artifact A にグループ化

---

#### エントリ11: oh-my-opencode ハーネスは最終検証フェーズでタイムアウト [inbox]

- **根本原因**: ハーネスの最終検証フェーズが時間を要する + タイムアウト後の処理フロー未定義
- **再発条件**: 大規模実装をハーネスに任せる時
- **予防策**: タイムアウト後の worktree git status 確認・残留 grep・手動修正手順

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独（1件） |
| 影響度 | 3/5 | 手動コミットが必要だが実装は完了 |
| 横展開性 | 3/5 | 大規模実装をハーネス任せる全ケース |
| 反映先明確度 | 4/5 | case-run / adapter で明確 |
| 自動化適性 | 3/5 | タイムアウト後手順の定型化は可能 |
| プロジェクト固有知識再利用性 | 4/5 | oh-my-opencode ハーネス固有 |
| 再発可能性 | 4/5 | 高い（事後処理手順不在） |
| 費用対効果 | 4/5 | 良い |
| **加重合計** | **26/40** | |

- **推奨処分案**: **既存 command/skill へ反映**（guardrail insufficiency）。理由: adapter/references/oh-my-openagent.md 72-80行に「タイムアウト=failed として処理」記載あるが、事後処理（worktree git status・残留 grep・手動修正）が不在。promoted artifact A にグループ化

---

### 未分類（archive 継続 5件）

以下のエントリは前回 promote で deferred 扱いとなり archive/active.md に残置中。今回 inbox 11エントリと厳密な問題クラスを形成しなかったため deferred を継続。

| # | タイトル | 移動日 | 経過期間 | 今回判定 |
|---|---------|--------|---------|---------|
| A1 | baseline分類の乖離と解決 | 2026-06-06 | 約15日 | deferred（継続） |
| A2 | スクリプトエンコーディング破損 | 2026-06-06 | 約15日 | deferred（継続） |
| A3 | Squash merge conflict resolution W1→W2 | 2026-06-07 | 約14日 | deferred（継続） |
| A4 | Epic Orchestrator Wave間変更漏れ | 2026-06-07 | 約14日 | deferred（継続） |
| A5 | runtime template path 暗黙参照 | 2026-06-07 | 約14日 | deferred（継続） |

※ 全エントリが記録から約14-15日経過（2026-06-21 現在）。内部分析フェーズ時 prune 基準（3ヶ月以上経過）に該当しないため prune 対象外。

## promoted artifact グループ化

promote 対象 8エントリを関連テーマで3つの artifact にグループ化。厳密な問題クラス分類ではなく、反映先の近接性による実用的まとまり。

### Artifact A: case-run worktree・ハーネス手順の強化（4エントリ）
- **対象**: #4, #8, #10, #11
- **テーマ**: case-run の worktree 作成・ハーネス起動・タイムアウト事後処理
- **反映先**: workflow-orchestration SKILL / git-worktree SKILL / case-run command / adapter SKILL + references/oh-my-openagent.md
- **出力ファイル**: `.agentdev/learning/promoted/case-run-worktree-harness-hardening.md`

### Artifact B: gh CLI Windows 文字化け対策（1エントリ）
- **対象**: #6
- **テーマ**: Windows PowerShell 環境での gh CLI --body-file/--title 文字化け防止
- **反映先**: agentdev-gh-cli SKILL Section 1（禁止事項）/ Section 2（標準手順）
- **出力ファイル**: `.agentdev/learning/promoted/gh-cli-windows-encoding.md`

### Artifact C: ドキュメント作成品質ガイドの強化（3エントリ）
- **対象**: #2, #5, #7
- **テーマ**: ID 桁数規定・REQ Step 番号の扱い・ADR 番号取り扱い
- **反映先**: docs/specs/system.md / REQ-0101 / req-file-manager SKILL / AGENTS.md / req-define command / req-save command / adr-file-manager SKILL
- **出力ファイル**: `.agentdev/learning/promoted/docs-quality-id-and-step-numbering.md`

## promote 時 prune 計画

- **対象エントリ数**: 11件（inbox からの移動分）
- **prune実施**: あり（HITL承認後に実施予定）
- **prune候補**: 10件
  - staged（promoted artifact 生成済み）: 8件（#2, #4, #5, #6, #7, #8, #10, #11）
  - duplicate: 2件（#1, #9）
- **prune非対象**: 1件
  - deferred: #3（archive/active.md に残置）

## 全体傾向

- **高スコア領域**: #6 (gh CLI 文字化け, 32/40) と #8 (worktree 古い commit, 32/40) が最高スコア。いずれも1行〜数行の追記で予防可能
- **横展開性の高さ**: inbox 11エントリ中、横展開性スコア4以上は #1, #5, #6, #7, #8（5件）。AgentDevFlow 運用全体に関わる知見が多い
- **自動化適性**: #6, #8, #9 は自動化適性スコア5。初期化ステップ・fetch・ステップ削除で即解決
- **既存対策との重複**: #1, #9 は既存ルールで完全カバー（duplicate）。学びの再確認価値はあるが新規 artifact 不要
- **deferred の存在**: #3 は PR #912 で実装後、方針転換で削除された経緯あり。現在の integrity-check 方針（汎用仕組みのみ）と整合しないため別途議論が必要
- **ADR候補なし**: 全エントリが運用ルール・手順・仕様追加・command 仕様が主でアーキテクチャ判断を含まない。ADR 除外フィルタで全件除外
- **archive 蓄積**: deferred エントリが5件蓄積中（約14-15日経過）。prune 基準（3ヶ月）には遠く、観察継続

## ADR候補除外記録

| 対象item | 除外理由 | 根拠事実 | 代替反映先候補 |
|---------|---------|---------|---------------|
| #1 case-open cleanup git add -A | 運用ルール | git cleanup 操作手順の運用制約。技術的トレードオフ不含 | case-open/case-close（既存対策あり=duplicate） |
| #2 REQ/IR ID 桁数 | 仕様変更のみ | ID 体系の仕様追記。技術判断不含 | docs/specs/system.md, REQ-0101, AGENTS.md |
| #3 gate hook strict/heuristic | command仕様 | integrity-check の挙動設計。ただし方針転換で削除済 | cli_utils.ts（要議論=deferred） |
| #4 Windows+junction worktree | 運用ルール | worktree セットアップの環境固有手順。技術判断不含 | workflow-orchestration, git-worktree |
| #5 REQ Step 番号 drift | 運用ルール | REQ 作成時の記述ガイドライン。REQ-0101-068 で規定済 | req-file-manager, AGENTS.md, command-authoring |
| #6 gh CLI Shift-JIS | 運用ルール | gh CLI 呼び出し時のコンソール初期化手順 | agentdev-gh-cli |
| #7 req-define ADR 番号 | command仕様 | req-define/req-save の番号取り扱い手順 | req-define, req-save, adr-file-manager |
| #8 worktree 古い commit | command仕様 | case-run Step 4 の手順改善 | case-run |
| #9 oh-my-openagent 存在確認 | 運用ルール | ハーネス起動時の存在確認不要ルール | case-run（既存対策あり=duplicate） |
| #10 bunx モジュール解決 | 運用ルール | Windows 環境でのフォールバック手順 | adapter/references/oh-my-openagent.md |
| #11 ハーネス タイムアウト | command仕様 | case-run / adapter のタイムアウト事後処理手順 | case-run, adapter |
