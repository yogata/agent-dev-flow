# 評価レポート

## メタデータ
- **実行日時**: 2026-06-17 (JST)
- **対象エントリ数**: 10件（inbox: 5件, archive: 5件）
- **問題クラス数**: 1（未分類のみ - 全エントリが単独問題クラス）

## 分析サマリ

### 正規化結果
- inbox 全5エントリが新13フィールドフォーマット準拠（タイトル日付プレフィックスなしは非ブロッキング軽微ドリフト）
- 旧フォーマットからの変換不要

### 問題クラス分類結果
- **多エントリクラスタ**: 0件（最小クラスタサイズ=2に満たず）
- **未分類（単独エントリ）**: 10件（inbox 5件 + archive 5件）
- 全エントリが異なる (根本原因 + 再発条件 + 予防策) を持つため、クラスタ形成なし

### 既存対策確認サマリ（inbox 5件に対し explore agent x5 で照会）

| # | エントリ | 確認対象 | 結果 | ギャップ分類 |
|---|---------|---------|------|-------------|
| 1 | worktree junction integrity | workflow-orchestration, check_integrity.ts, AGENTS.md | partial | application miss |
| 2 | RFC2119 retired REQ historical mention | check_integrity.ts RFC2119 regex | partial | guardrail insufficiency（ただし影響度極低） |
| 3 | REQ range glob verification | req-analysis, workflow-orchestration, req-define, case-run | no | fix gap |
| 4 | case-close duplicate file check | case-close.md, git-common-procedures.md | no（特定重複チェック） | fix gap |
| 5 | REQ-0119-025 precedent reuse | req-file-manager, req-analysis, templates | no | application miss |

## 問題クラス一覧

全エントリが未分類（単独）のため、未分類セクションに個別評価を記載。

### 未分類

#### エントリ1: worktree 環境で integrity スクリプトの source-projection-sync が失敗する [inbox]

- **根本原因**: worktree は独立チェックアウトであり、install-consumer-opencode.ps1 が作成する junction link が伝播しない
- **再発条件**: worktree 上で integrity/projection 関連チェックを実行する全ケース
- **予防策**: case-run worktree セットアップに junction 再作成ステップを組み込む、または integrity スクリプトが worktree を検知して該当チェックをスキップ/警告

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（1件） |
| 影響度 | 3/5 | integrity 検証が失敗し手動 workaround が必要。ブロックするが致命的ではない |
| 横展開性 | 4/5 | 全 case-run worktree 環境で発生し得る。Windows+junction 環境で顕著 |
| 反映先明確度 | 4/5 | workflow-orchestration（case-run worktree セットアップ）、check_integrity.ts（worktree 検知）で明確 |
| 自動化適性 | 3/5 | integrity スクリプトでの worktree 検知は可能。junction 再作成の自動化も検討可能 |
| プロジェクト固有知識再利用性 | 4/5 | worktree+junction+integrity は AgentDevFlow 固有の技術的落とし穴 |
| 再発可能性 | 4/5 | worktree で integrity を実行する全ケースで再発 |
| 費用対効果 | 4/5 | 低コスト（手順追記またはスクリプト拡張）で手動 workaround を削減 |
| **加重合計** | **27/40** | |

- **推奨処分案**: **既存 skill へ反映**（`agentdev-workflow-orchestration`）。理由: application miss であり、既存の fallback (`resolvePathWithFallback`) は存在するが worktree 特有の手順が未整備。副次反映先: `scripts/check_integrity.ts`（worktree 検知）

##### 既存対策確認
- **確認結果**: 既存対策 partial
- **該当ファイル**: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（`resolvePathWithFallback` 関数、REQ-0108-173 broken junction 検出 gate）、`agentdev-git-worktree/references/worktree-operations.md`（Windows junction 削除フォールバック）
- **ギャップ分類**: application miss
- **ギャップ詳細**: fallback logic と broken junction 検出は存在するが、(1) worktree 環境での手順が `agentdev-workflow-orchestration` に未記載、(2) integrity スクリプトに worktree 明示検知がない、(3) AGENTS.md にガイドレールなし

---

#### エントリ2: retired REQ の履歴言及における規範語の位置づけ（REQ-0109-038）[inbox]

- **根本原因**: REQ-0109-038（REQ-0122 retire 宣言）に RFC2119 キーワードが含まれ、規範的使用に見える可能性
- **再発条件**: retired REQ の規範語を active 文書で歴史的に言及する全ケース
- **予防策**: integrity スクリプトの RFC2119 検知 regex に retired/historical コンテキスト例外追加、または言及時に「履歴言及」マーカー付与

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（1件） |
| 影響度 | 1/5 | 実際の integrity 違反なし。見た目の懸念のみ。スクリプトは活性REQをスキャンしないため非検知 |
| 横展開性 | 3/5 | retired REQ の歴史言及で発生し得るが頻度は低い |
| 反映先明確度 | 3/5 | check_integrity.ts（regex 例外）。ただし既存の `/retired\/REQ-/` 例外で大部分対応済み |
| 自動化適性 | 3/5 | 既存 regex 例外が大部分を自動化済み。残差の意味論的判別は困難 |
| プロジェクト固有知識再利用性 | 3/5 | integrity rule のプロジェクト固有知識。再利用価値は中程度 |
| 再発可能性 | 3/5 | retire 宣言で規範語を歴史言及する全ケース。頻度は中程度 |
| 費用対効果 | 3/5 | 影響度が極めて低く、既存対策で大部分カバー。追加投資の費用対効果は妥当レベル |
| **加重合計** | **20/40** | |

- **推奨処分案**: **rejected**（HITL 承認済）。理由: 主懸念（integrity スクリプトの誤検知）は既存の `/retired\/REQ-/` 例外と活性REQ非スキャン設計で技術的に解決済み。影響度スコア1/5（極低）で実害なし。副次的予防策（履歴言及マーカーの文書化）は情報断片的で優先度低。すでに別の対策で十分対応済みのため rejected とし、再評価対象外とする

##### 既存対策確認
- **確認結果**: 既存対策 partial（主懸念は既存対策で解決済み）
- **該当ファイル**: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` lines 6943-6950（`LEGACY_NORMATIVE_MARKER_EXEMPT_PATHS` に `/retired\/REQ-/` 含む）、`checkCanonicalBoundary()` は活性REQファイルをスキャンしない
- **ギャップ分類**: guardrail insufficiency（ただし影響度極低）
- **ギャップ詳細**: 経路ベース例外（`/retired\/REQ-/`）は存在するが、活性文書内の歴史言及 vs 規範的使用の意味論的判別は未実装。ただし現状の設計（活性REQ非スキャン + retired パス例外）で実害なし

---

#### エントリ3: 要件定義・plan 作成時に active REQ の実ファイル一覧を grep/glob で実証確認すべき [inbox]

- **根本原因**: 文書の REQ 番号レンジ（例: REQ-0101〜REQ-0123）を信頼し、実ファイル一覧の glob/grep 実証確認を怠った
- **再発条件**: 文書のレンジ表現を信頼して実ファイル一覧を確認しない場合
- **予防策**: req-define / case-run plan 作成ステップに「active REQ 実ファイル一覧の glob 確認」を必須ステップとして組み込む

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（1件） |
| 影響度 | 4/5 | REQ 见落としは要件定義の抜け漏れに直結。Momus review で指摘されるレベル |
| 横展開性 | 4/5 | 全ての要件定義・plan 作成で発生し得る。ADR 番号等でも同様 |
| 反映先明確度 | 4/5 | req-analysis（要件定義手順）、workflow-orchestration（case-run plan 作成）で明確 |
| 自動化適性 | 4/5 | glob 確認ステップは手順化が容易。REQ/ADR 番号レンジ照合も自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | 「文書レンジを信頼せず実証確認」という規範は汎用性高い |
| 再発可能性 | 4/5 | 文書レンジを信頼する運用が継続する限り再発 |
| 費用対効果 | 5/5 | 極めて低コスト（glob 1行）で major rework を予防 |
| **加重合計** | **30/40** | |

- **推奨処分案**: **既存 skill へ反映**（`agentdev-req-analysis`）。副次反映先: `agentdev-workflow-orchestration`（case-run plan 作成）、`req-define.md`（Step 3-4）。理由: fix gap であり、実証確認ステップが明示的に存在しない

##### 既存対策確認
- **確認結果**: 既存対策なし（fix gap）
- **該当ファイル**: なし（`agentdev-req-analysis/SKILL.md`、`agentdev-workflow-orchestration/SKILL.md`、`req-define.md` Step 3-4 のいずれにも glob 実証確認ステップなし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: req-define Step 3（既存REQ照合）は `agentdev-req-file-manager` の照合方法論に従うが、実ファイル一覧の glob 確認は明示されていない。Step 4-1（関連ドキュメント更新候補抽出）は glob を探索に使うが、番号レンジと実ファイルの一致検証は不在

---

#### エントリ4: case-close 実行前にメインリポジトリの未コミット変更と対象 PR の変更ファイル重複をチェックすべき [inbox]

- **根本原因**: 別件作業の未コミット変更が対象 PR の変更ファイルと重複し、`git pull --ff-only` が拒否される
- **再発条件**: メインリポジトリに未コミット変更がある状態で case-close を実行し、変更ファイルが対象 PR と重複する場合
- **予防策**: case-close Step 1（Issue 番号解決）直後にメインリポジトリの `git status --short` と PR 変更ファイル一覧（`gh pr view --json files`）の重複チェック追加。重複時は Step 4（merge）前にユーザーに警告

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（1件） |
| 影響度 | 4/5 | Domain state 永続化（Step 11）がブロックされ、手動リカバリが必要 |
| 横展開性 | 4/5 | 並行作業（複数 Issue 同時進行）環境で特に発生しやすい |
| 反映先明確度 | 5/5 | case-close.md Step 1-2 に特定済み。修正箇所が明確 |
| 自動化適性 | 4/5 | `gh pr view --json files` と `git status --short` の比較は容易に自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | case-close ワークフロー固有の並行作業パターン |
| 再発可能性 | 4/5 | 並行作業環境では高確率で再発 |
| 費用対効果 | 5/5 | 低コスト（早期チェック追加）で Step 9-11 ブロックを予防 |
| **加重合計** | **31/40** | 最高スコア |

- **推奨処分案**: **既存 command へ反映**（`case-close.md` Step 1-2）。理由: fix gap であり、既存の「任意のローカル変更で停止」チェックは粗すぎる。重複特化の早期警告が必要

##### 既存対策確認
- **確認結果**: 既存対策なし（特定の重複チェックが不在）
- **該当ファイル**: `agentdev-git-worktree/references/git-common-procedures.md`（「実行前同期」手順に `git status --porcelain` で任意のローカル変更を検出して停止するチェックは存在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存チェックは「任意のローカル変更」で停止する粗い粒度。学びが提案する「PR 変更ファイルとの重複特化チェック」は不在。重複時の早期警告（Step 1-2）も不在で、Step 9 で初めて発覚

---

#### エントリ5: REQ-0119-025 precedent 形式は retire 宣言（APPEND）で再利用可能 [inbox]

- **根本原因**: なし（ポジティブ学び。REQ-0119-025 precedent 形式で REQ-0109-038 を機械的に作成できた）
- **再発条件**: retire 宣言を行う全ケース
- **予防策**: retire 宣言用のテンプレート化、または precedent 参照を req-define 手順に明記

##### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（1件、ポジティブ） |
| 影響度 | 3/5 | 今後の retire 宣言の設計工数を削減。直接の被害なし |
| 横展開性 | 4/5 | 全ての今後の retire 宣言で再利用可能 |
| 反映先明確度 | 4/5 | req-file-manager（retire 宣言テンプレート）、req-analysis（precedent 活用手順）で明確 |
| 自動化適性 | 2/5 | precedent 参照は文書化が主で自動化適性は低い |
| プロジェクト固有知識再利用性 | 4/5 | retire 宣言パターンは AgentDevFlow プロジェクト固有の知識 |
| 再発可能性 | 5/5 | retire 宣言を行う全ケースでほぼ確実に再利用可能 |
| 費用対効果 | 5/5 | 極めて低コスト（precedent 参照追記）で今後の設計工数を削減 |
| **加重合計** | **28/40** | |

- **推奨処分案**: **既存 skill へ反映**（`agentdev-req-file-manager`、`agentdev-req-analysis`）。理由: application miss であり、pattern は実在するが skill に文書化されていない

##### 既存対策確認
- **確認結果**: 既存対策なし（application miss）
- **該当ファイル**: なし（`agentdev-req-file-manager/SKILL.md` APPEND セクション、`agentdev-req-analysis/SKILL.md`、`templates/doc_requirement.md` のいずれにも retire 宣言 precedent の記載なし）
- **ギャップ分類**: application miss
- **ギャップ詳細**: REQ-0119-025 → REQ-0109-038 の機械的再利用パターンは実在するが、(1) retire 宣言テンプレートが不在、(2) precedent 活用手順が req-define に未記載、(3) REQ-0119-025 への参照が skill に一切なし

---

#### archive 継続エントリ（entries 6-10）[archive]

以下のエントリは前回 promote で deferred 扱いとなり archive/active.md に残置中。今回も新たなクラスタを形成しないため deferred を継続。

| # | タイトル | 移動日 | 経過期間 | 今回判定 |
|---|---------|--------|---------|---------|
| 6 | baseline分類の乖離と解決 | 2026-06-06 | 約11日 | deferred（継続） |
| 7 | スクリプトエンコーディング破損 | 2026-06-06 | 約11日 | deferred（継続） |
| 8 | Squash merge conflict resolution W1→W2 | 2026-06-07 | 約10日 | deferred（継続） |
| 9 | Epic Orchestrator Wave間変更漏れ | 2026-06-07 | 約10日 | deferred（継続） |
| 10 | runtime template path 暗黙参照 | 2026-06-07 | 約10日 | deferred（継続） |

※ 全エントリが記録から約10-11日経過（2026-06-17 現在）。内部分析フェーズ時 prune 基準（3ヶ月以上経過）に該当しないため prune 対象外。

## promote 時 prune結果

- **対象エントリ数**: 5件（inbox からの移動分）
- **prune実施**: なし（HITL承認後に実施予定）
- **prune候補**: 5件（staged: entries 1, 3, 4, 5 ＋ rejected: entry 2）
- **prune却下**: 0件

## 全体傾向

- **高スコア領域**: 「実証確認の欠如」（entry 3: 30/40）と「並行作業の競合検知」（entry 4: 31/40）が高スコア。いずれも低コストで予防可能な手順改善
- **横展開性の高さ**: inbox 5エントリ中4エントリが横展開性スコア4以上。AgentDevFlow 運用全体に関わる知見が多い
- **自動化適性**: entries 3, 4 は自動化適性スコア4。glob 確認・ファイル重複チェックは容易に自動化可能
- **ポジティブ学びの存在**: entry 5 は成功パターンの記録。今後の retire 宣言で再利用可能
- **低優先度エントリ**: entry 2 は既存対策で大部分カバーされており、rejected（再評価対象外）。HITL承認済
- **ADR候補なし**: 全エントリがアーキテクチャ判断ではなく運用・手順・技術的落とし穴。ADR 除外フィルタで全件除外、適切な反映先（skill/command）に振り分け
- **archive 蓄積**: deferred エントリが5件蓄積中（約10-11日経過）。prune 基準（3ヶ月）には遠く、観察継続

## ADR候補除外記録

| 対象item | 除外理由 | 根拠事実 | 代替反映先候補 |
|---------|---------|---------|---------------|
| Entry 1: worktree junction | 運用ルール | worktree セットアップ手順の運用制約であり、技術的トレードオフを含まない | agentdev-workflow-orchestration, check_integrity.ts |
| Entry 2: RFC2119 retired historical | 運用ルール | integrity rule の運用詳細であり、アーキテクチャ判断ではない | check_integrity.ts（既存で大部分対応済み） |
| Entry 3: REQ range glob | 運用ルール | 要件定義手順の改善であり、技術的トレードオフを含まない | agentdev-req-analysis, agentdev-workflow-orchestration |
| Entry 4: case-close duplicate check | command仕様 | case-close の手順・ガードレール改善であり、アーキテクチャ判断ではない | case-close.md |
| Entry 5: retire precedent | 運用ルール | precedent 再利用の文書化であり、技術的トレードオフを含まない | agentdev-req-file-manager, agentdev-req-analysis |
