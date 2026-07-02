# 評価レポート

## メタデータ
- **実行日時**: 2026-07-03 00:00
- **対象エントリ数**: 9件（inbox: 9件, archive: 0件新規参照）
- **問題クラス数**: 7（クラスタ1 + 未分類6）

## 正規化結果

inbox 9件は全て新フォーマット（13フィールド）。正規化不要。

## 問題クラス一覧

### 問題クラス1: case-close Step 9 git main同期の前提条件・順序・並列性干渉

- **根本原因**: case-close Step 9（git pull --ff-only）は「main worktree が main ブランチにあり、ローカル変更がなく、他の fetch 系操作が並行していない」という暗黙前提に依存する。Epic Wave クローズ（複数PR連続マージ）、case-auto 並列実行（sibling が main worktree を占有）、手順順序（SPEC 昇格編集 → pull）のいずれかで前提が崩れると pull がブロック・失敗する。
- **再発条件**: case-close で main 同期（Step 9）を実行する際、暗黙前提（ブランチ状態・並列性・手順順序）が崩れる条件が成立した時。
- **予防策**: git-common-procedures.md に「main 同期前の前提条件チェック（現在ブランチ確認・fetch 系直列化・編集は pull 後・stash 戦略）」を追加し、case-close SPEC の Step 7 / Step 3-2 / Step 9 の順序依存性を明記する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（ref lock 並列、SPEC編集→pull順序、非mainブランチ占有） |
| 影響度 | 4/5 | pull 失敗で case-close 全体ブロック、Epic Wave で手戻り大 |
| 横展開性 | 4/5 | case-close/case-auto の main 同期全般、並列 worktree 運用環境で高い |
| 反映先明確度 | 4/5 | agentdev-git-worktree git-common-procedures.md + case-close SPEC。明確 |
| 自動化適性 | 4/5 | 前提条件チェック（branch 確認・直列化）は手順化容易 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 固有の Step 構成だが、並列 worktree 運用は汎用 |
| 再発可能性 | 5/5 | Epic Wave / case-auto 並列実行でほぼ確実に再発 |
| 費用対効果 | 4/5 | 手順追記で高リスク低減、低コスト高効果 |
| **加重合計** | **31/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-git-worktree git-common-procedures.md）+ 既存 SPEC へ反映（case-close Step 7/3-2/9 順序依存性）。fix gap + guardrail insufficiency。

#### エントリ一覧
- git pull と git fetch --prune の並列実行による ref lock 競合 [inbox]
- case-close Epic Wave クローズ手順中の SPEC 昇格編集が origin/main 進行後に行われることによる working tree 衝突 [inbox]
- case-auto 並列実行中に main worktree が sibling ブランチにいる場合の main ref 同期 [inbox]

### 問題クラス2（未分類）: GitHub mergeable UNKNOWN ポーリング待機手順の未規定

- **根本原因**: GitHub が PR マージ後にバックグラウンドで mergeable を再計算する仕様。連続 squash merge（Epic Wave クローズ等）で後続 PR の mergeable が UNKNOWN になり、UNKNOWN 状態でマージ試行すると失敗する。case-close Step 4 は「最大5回リトライ」だが mergeable UNKNOWN 専用のポーリング待機手順がない。
- **再発条件**: GitHub で連続 squash merge を実行する全ケース。特に同一ファイルを変更する PR が連続する場合。
- **予防策**: case-close Step 4 に「mergeable UNKNOWN 時のポーリング待機（gh pr view で mergeable を確認、UNKNOWN の間は待機）」手順を明記。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | UNKNOWN でマージ失敗、Epic Wave で遅延・リトライ浪費 |
| 横展開性 | 4/5 | 連続 squash merge 全般、case-auto 自動マージ処理で高い |
| 反映先明確度 | 4/5 | case-close Step 4、agentdev-workflow-orchestration。明確 |
| 自動化適性 | 4/5 | ポーリング待機は手順化容易 |
| プロジェクト固有知識再利用性 | 3/5 | GitHub 仕様依存、AgentDevFlow 固有でない |
| 再発可能性 | 5/5 | 連続 squash merge でほぼ確実 |
| 費用対効果 | 4/5 | ポーリング手順追記で中-高リスク低減 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command/SPEC へ反映（case-close Step 4、case-close SPEC）。fix gap（mergeable ポーリング専用手順なし）。

#### エントリ一覧
- case-close Epic Wave クローズ時の GitHub mergeable UNKNOWN ポーリング待機 [inbox]

### 問題クラス3（未分類）: gh CLI WRITE 操作でコンソールエンコーディング初期化（Step 0）の参照欠落

- **根本原因**: gh CLI は --body-file 読込時にコンソールのコードページ（chcp）を参照する。agentdev-gh-cli standard-procedures.md Section 2 Step 0（3行のコンソールエンコーディング初期化）は既存・規定済みだが、gh CLI WRITE を呼ぶ各 command（case-close 等）が Step 0 を参照していない。新規セッションで Step 0 を省略すると UTF-8 BOM なしファイルでも mojibake 化する。
- **再発条件**: Windows PowerShell / pwsh 環境で chcp 932 のまま、かつ Step 0 の3行を実行せずに gh CLI WRITE 操作（--body-file/--title）を実行した場合。
- **予防策**: (a) gh CLI WRITE を呼ぶ全 command の該当 Step に「agentdev-gh-cli standard-procedures Section 2 Step 0 を必ず実行」を明記、(b) verify.md の書き込み後 VERIFY に mojibake チェック項目を追加。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | Issue 本文 mojibake、復元作業発生 |
| 横展開性 | 4/5 | gh CLI WRITE 全操作、全 gh 使用 command で高い |
| 反映先明確度 | 4/5 | 既存 standard-procedures.md Step 0（既存）+ 各 command + verify.md。明確 |
| 自動化適性 | 4/5 | Step 0 参照明記 + mojibake 検査 VERIFY 追加で容易 |
| プロジェクト固有知識再利用性 | 4/5 | Windows + gh CLI 固有の落とし穴として再利用価値高い |
| 再発可能性 | 4/5 | 新規セッションで Step 0 省略時に高い |
| 費用対効果 | 4/5 | 既存手順の参照明記 + VERIFY 追加で低コスト高効果 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command/skill へ反映（case-close 等 gh WRITE command の該当 Step、agentdev-gh-cli verify.md）。application miss（既存手順あり・呼び出し元参照なし）+ fix gap（verify.md mojibake 検査なし）。

#### エントリ一覧
- gh issue edit --body-file でコンソールエンコーディング初期化（Step 0）を省略すると UTF-8 BOM なしファイルでも本文が mojibake 化する [inbox]

### 問題クラス4（未分類）: check_read_contracts.ts の実行ランタイム（Bun）未明記

- **根本原因**: check_read_contracts.ts は TypeScript + CommonJS require を Bun 上で動かす前提で書かれている（`require() as typeof import()` 記法、テストは `bun:test`）。docs-check.md Step 1 と inspect-read-contracts SPEC は「check_read_contracts.ts を実行し」とだけ書き、ランナー（Bun）を明記していない。node 系ランナーで実行すると ESM エラーで失敗する。
- **再発条件**: 新規セッションや CI で check_read_contracts.ts を node 系ランナー（node --experimental-strip-types 等）で実行しようとした場合。
- **予防策**: (a) docs-check.md Step 1 と inspect-read-contracts SPEC に「Bun で実行し（bun run / bun test）」を明記、(b) スクリプト冒頭に実行方法コメント追記。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | node 実行で ReferenceError、docs-check / QG-4 証拠取得失敗 |
| 横展開性 | 4/5 | repo-agentdev-integrity 配下スクリプト全般、docs-check/inspect-read-contracts/case-close Step 3-1 で高い |
| 反映先明確度 | 4/5 | docs-check.md Step 1、inspect-read-contracts SPEC。明確 |
| 自動化適性 | 5/5 | 「Bun で実行」の明記は極めて容易 |
| プロジェクト固有知識再利用性 | 4/5 | プロジェクト固有スクリプトのランタイム前提 |
| 再発可能性 | 4/5 | 新規セッション/CI で node 使用時に高い |
| 費用対効果 | 5/5 | 1行追記で高効果、極めて低コスト |
| **加重合計** | **30/40** | |

- **推奨処分案**: 既存 command/SPEC へ反映（docs-check.md Step 1、inspect-read-contracts SPEC）。fix gap（ランナー未明記）。

#### エントリ一覧
- check_read_contracts.ts は Bun ランタイム必須（node --experimental-strip-types は ESM エラーで失敗） [inbox]

### 問題クラス5（未分類）: docs_chore + artifact:spec の case-run/spec-save 責務境界（PR 作成不能）

- **根本原因**: spec-save は SPEC ファイルを直接 main へコミットするが、case-run はブランチ + PR モデルを前提とする。docs_chore + artifact:spec の組み合わせで両者が競合し case-run の出力（PR）が空になる。artifact 種別に応じた PR 要否判定が case-run/case-open に存在しない。
- **再発条件**: work_type: docs_chore（または maintenance）で artifact: spec を指定し、spec-save → case-run → case-close と進めた時。
- **予防策**: (a) case-run に artifact 種別に応じた PR 要否判定を組み込み、(b) case-open 時に work_type + artifact から PR 不要フラグを設定、(c) case-close に「PR なしクローズ」の明示手順を追加して正規ルート化。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 4/5 | PR 作成不能、標準フローから逸脱、case-close がエッジケース扱い |
| 横展開性 | 4/5 | artifact 種別拡張（adr 等）でも発生、spec-save が main 直接 commit する全ケース |
| 反映先明確度 | 4/5 | SPEC case-run/case-close/spec-save、REQ-0130/0131。明確 |
| 自動化適性 | 3/5 | artifact 種別→PR 要否判定は可能だが設計複雑 |
| プロジェクト固有知識再利用性 | 4/5 | AgentDevFlow 固有の責務境界設計 |
| 再発可能性 | 5/5 | docs_chore + spec-save でほぼ確実 |
| 費用対効果 | 2/5 | アーキテクチャ変更(a/b)は大規模で高コスト。最小手順(c)は妥当だが全体では割高 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 保留（deferred）。出現1件。現状は「PR なしクローズ運用」で回避済み。完全な責務境界再設計（a/b）は大規模変更で費用対効果が低い。最小手順（c: case-close の PR なしクローズ正規化）は有望だが、单独昇華には具体性不足。living pool で維持し、docs_chore + spec-save の再発時または artifact 種別拡張時に再評価する。

#### エントリ一覧
- docs_chore + artifact:spec の場合の case-run/spec-save 境界（PR が作成できない） [inbox]

### 問題クラス6（未分類）: REQ スキーマ要件のフィールド所有者階層（per-entry/top-level）未明示

- **根本原因**: REQ のスキーマ定義で「ファイル全体が持つフィールド」と「各エントリが持つフィールド」の階層区別が明示されていない。REQ-0156-011「各エントリは old、new、severity、scope を持つ」が scope を per-entry のように読ませ、実装（top-level 共有）と解釈が分岐した。
- **再発条件**: REQ でスキーマ要件を「各エントリは ... を持つ」形式で記述し、所有者階層（file/entry）を明示しない場合。
- **予防策**: (a) REQ/SPEC でスキーマ要件を記述する際、フィールド所有者（file top-level/各 entry/別ノード）を明示する表記規約、(b) agentdev-req-analysis / agentdev-doc-writing skill に「スキーマ要件は所有者階層を明示」チェック項目を追加。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 2/5 | 実装解釈分岐、yaml ヘッダコメントで運用回避済み |
| 横展開性 | 4/5 | スキーマ要件定義全般、integrity rule ファイル群 |
| 反映先明確度 | 4/5 | REQ-0156-011 文言、req-analysis/doc-writing skill。明確 |
| 自動化適性 | 3/5 | 表記規約の明文化で可能 |
| プロジェクト固有知識再利用性 | 3/5 | 汎用的なスキーマ記述問題 |
| 再発可能性 | 3/5 | スキーマ要件記述時に中程度 |
| 費用対効果 | 3/5 | REQ 文言修正 + 規約明記で妥当 |
| **加重合計** | **23/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・影響小・運用回避済み。「スキーマ要件は所有者階層明示」規約は有効だが、単発では具体性不足。living pool で維持し、スキーマ要件の解釈分岐が再発した場合に再評価する。

#### エントリ一覧
- REQ スキーマ要件の記述が per-entry / top-level の区別を曖昧にし、実装と解釈が分岐した [inbox]

### 問題クラス7（未分類）: backticks 機械付与の frontmatter 除外 + Level 2 コンフリクト解消モデル実証

- **根本原因**: (a) backticks 機械付与対象の除外ロジックが YAML frontmatter 等の構造データを考慮していなかった。(b) case-close 実行中に別 PR が origin/main へ push され conflict 発生。
- **再発条件**: (a) 構造データ除外判定なしに機械横断是正を実行、(b) case-close 実行中に別 PR が同一ファイルへ push。
- **予防策**: (a)(b) ともに既に対処済み（REQ-0140/0153、inspect-skills 検出基準 skill-frontmatter-name-backtick、SPEC backticks-identifier-threshold.md、case-auto コンフリクト解消モデル Level 1/2、case-close Step 4-2）。

#### 8軸評価スコア

- 既に対処済みのため加重合計算出の意義薄。発生件数 1/5、他軸も既存対策でカバー済み。

- **推奨処分案**: duplicate（既存対策で十分カバー・既に対処済み）。REQ-0140/0153、inspect-skills 検出基準、SPEC 文書化、case-auto Level 2 実績により新規対策不要。

#### エントリ一覧
- 機械横断是正の除外ロジックが YAML frontmatter を考慮していなかった事例と Level 2 コンフリクト解消モデルの実証 [inbox]

## promote 時prune結果

- **対象エントリ数**: 9件
- **prune実施**: あり（staged/rejected/duplicate のみ、REQ-0147-006/007 準拠）
- **prune候補**: 5件（PC-1: 3件 staged + PC-2: 1件 staged + PC-3: 1件 staged + PC-4: 1件 staged + PC-7: 1件 duplicate = 計7件。ただし PC-7 duplicate 1件含む）
- **prune却下**: 0件
- **prune 非対象（living pool 維持）**: PC-5, PC-6（deferred）の2件

## 全体傾向

- **高頻出・高影響の問題クラス**: PC-1（case-close git main同期干渉、31/40、3件）が突出。Epic Wave / case-auto 並列実行で再発確実。PC-4（Bun ランタイム、30/40）も費用対効果 5/5 で即対応価値高い。
- **横展開性が高い問題クラス**: PC-1（4/5）、PC-2/3/4/5（4/5）。いずれも複数 command/skill/SPEC にまたがる。
- **自動化適性が高い問題クラス**: PC-4（5/5、1行追記）、PC-1/2/3（4/5、手順追記）。
- **全体的な観察所見**: 9件中4件（PC-1/2/3/4）が明確な昇華対象（既存 command/skill/SPEC への反映、fix gap/application miss）。2件（PC-5/6）は deferred（出現1件・費用対効果または影響度次第）。1件（PC-7）は既対処で duplicate。REQ-0155-005（無条件自動REQ化禁止、living pool 維持）に従い、昇華対象は promoted/ → backlog-review → RU → req-define 経路のみ。

## ADR候補除外記録

全問題クラスについて `agentdev-adr-guidelines` の除外基準を適用した結果、ADR 候補は0件。全て運用ルール・command仕様・skill手順・SPEC の範疇。

| 問題クラス | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| PC-1 (git main同期干渉) | 運用ルール・command仕様 | git 操作手順の前提条件チェック・順序明示であり技術判断不在 | agentdev-git-worktree skill, case-close SPEC |
| PC-2 (mergeable polling) | command仕様 | case-close Step 4 の手順追加であり技術判断不在 | case-close command/SPEC |
| PC-3 (gh encoding Step 0) | 運用ルール | 既存手順の参照徹底・VERIFY 追加であり技術判断不在 | 各 gh WRITE command, agentdev-gh-cli verify.md |
| PC-4 (Bun runtime) | command仕様・SPEC | 実行ランナーの明記であり技術判断不在 | docs-check command, inspect-read-contracts SPEC |
| PC-5/6/7 | 運用ルール・仕様変更・既対処 | 各々手続き・スキーマ表記・既存対策の範疇 | 各 command/skill/spec/REQ |

## 既存対策確認サマリ

| 問題クラス | 既存対策 | ギャップ分類 | 詳細 |
|---|---|---|---|
| PC-1 | git-common-procedures.md Section 1（pull手順・ローカル変更検出）/ Section 8（並列セッション pull 拒否フォールバック）は部分カバー | fix gap + guardrail insufficiency | pull/fetch --prune 直列化、非 main ブランチ時の ref 同期（git fetch origin main:main）、SPEC 編集→pull 順序の明示なし |
| PC-2 | case-close Step 4（最大5回リトライ）あり | fix gap | mergeable UNKNOWN 専用ポーリング待機手順なし |
| PC-3 | agentdev-gh-cli standard-procedures.md Section 2 Step 0 既存・規定済み | application miss + fix gap | calling command（case-close 等）が Step 0 を参照なし。verify.md に mojibake 検査なし |
| PC-4 | なし（docs-check.md Step 1、inspect-read-contracts SPEC にランナー記述なし） | fix gap | 実行ランナー（Bun）未明記 |
| PC-5 | なし（artifact 種別→PR 要否判定なし） | fix gap | 責務境界設計未規定。ただし現状は運用回避済み |
| PC-6 | なし（本 PR で yaml ヘッダコメントで運用回避のみ） | fix gap | REQ スキーマの所有者階層表記規約なし |
| PC-7 | REQ-0140/0153、inspect-skills 検出基準、SPEC、case-auto Level 2 で対処済み | duplicate | 既存対策で十分カバー |
