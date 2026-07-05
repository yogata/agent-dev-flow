# 評価レポート

## メタデータ
- **実行日時**: 2026-07-05 00:00
- **対象エントリ数**: 27件（inbox: 5件, deferred: 22件参照）
- **問題クラス数**: 5（未分類なし）

## 正規化結果

inbox 5件は全て新フォーマット（13フィールド）。正規化不要。
deferred 22件は前回実行（2026-07-03）までの living pool。再評価・重複照合・再発パターン確認用として参照。

## 問題クラス一覧

### 問題クラス1: case-open Issue body に埋め込んだ外部状態スナップショットが case-run 時点で陳腐化し QG-3/QG-4 で事実乖離として検出される

- **根本原因**: case-open が Issue 完了条件・事前状態セクションに、ファイルパスや検査結果件数等の変化しやすい外部状態のスナップショットを埋め込む。case-open → case-run の間に、参照先の外部実体（ファイル名/パス、check_integrity.ts 本体等）が rename PR や検査ルール改修で変化すると、Issue 本文が陳腐化する。case-run 冒頭で Issue 本文の参照整合性を再検証する staleness check が手順化されていない。
- **再発条件**: case-open が外部状態スナップショット（ファイルパス参照、検査結果件数等）を Issue 本文に記録し、case-open → case-run の間に当該外部実体を変更する PR/commit がマージされた場合。
- **予防策**: (a) case-run 冒頭（QG-3 前置）で Issue 本文が参照するファイルパス・検査結果の staleness check を実施し、差異があれば Findings に記録して case-update で Issue 本文を現行化する。(b) case-open は件数等の変動しやすい実測値スナップショットではなく、安定した識別子（ファイル相対パス、NG 識別子）を主情報として記録し、件数は補助値とする。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（rename PR によるファイルパス陳腐化 + check_integrity.ts 改修による件数スナップショット陳腐化） |
| 影響度 | 3/5 | QG-3/QG-4 で spec-bug 分類、実装修正・読替作業、Findings 記録の手戻り |
| 横展開性 | 4/5 | case-open→case-run 間に並行 PR がマージされる全運用、手動 case・Wave 間双方で高い |
| 反映先明確度 | 4/5 | case-run command（QG-3 前置 staleness check）、case-open command（記録粒度）。明確 |
| 自動化適性 | 4/5 | Issue 本文のファイルパス抽出と現行存在確認、件数再計測は手順化容易 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の case ライフサイクル固有だが、並行 PR 運用では汎用的 |
| 再発可能性 | 4/5 | case ライフサイクル中の並行 PR マージは高頻度 |
| 費用対効果 | 4/5 | case-run 冒頭の staleness check 追記は低コスト、QG-3/QG-4 手戻り大幅低減 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command へ反映（case-run QG-3 前置 staleness check、case-open 記録粒度ガイドライン）。fix gap（staleness check 手順なし）+ guardrail insufficiency（case-open 記録粒度規定なし）。

#### エントリ一覧
- case-open と case-run の間に rename PR がマージされると Issue 本文のファイル名参照が陳腐化する [inbox]
- Issue 本文の事前状態記載が実装時点と乖離し、既解消 NG が残存NGとして列挙されていた [deferred, 移動日 2026-06-27]

### 問題クラス2: commit message 内の複合語（case-close 等）が GitHub auto-close キーワードを誘発し Issue を意図せずクローズする

- **根本原因**: commit message 末尾の "(case-close #N)" 等の括弧内コマンド名+issue番号表記において、GitHub が "close" を auto-close キーワードの部分文字列として認識し、直後の "#N" を issue 参照として解釈する。"close"/"fix"/"resolve" を含む複合語（case-close, learning-promote 等の慣習表記）と #N の併存で systemic リスク。agentdev-conventional-commits skill に auto-close 回避ガイドラインがない。
- **再発条件**: commit message に "close/closes/closed/fix/fixes/fixed/resolve/resolves/resolved" を部分文字列として含む複合語と、同一行または近接する issue 番号参照（#N）が同時に存在し、当該 commit が main へ push された場合。
- **予防策**: (a) agentdev-conventional-commits skill のコミットメッセージ規約に「auto-close キーワードを含む複合語と #N の併存回避」ガイドラインを追加。(b) commit message でコマンド名と issue 番号を分離（例: "case-close for Epic 1403"、# 記号を避ける）。(c) pre-commit hook / commit lint で "close #N" パターン（複合語内含む）を検出して警告。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（Epic #1403 不意クローズ） |
| 影響度 | 3/5 | Epic が COMPLETED で自動クローズ、残 Wave の管理崩壊、reopen 作業発生 |
| 横展開性 | 5/5 | GitHub + agentdev commit 規約（case-close 等の "close" 含むコマンド名）全般、汎用 |
| 反映先明確度 | 4/5 | agentdev-conventional-commits skill、case-close Step 11。明確 |
| 自動化適性 | 4/5 | commit lint / pre-commit hook でパターン検出可能、規約追記も容易 |
| プロジェクト固有知識再利用性 | 3/5 | GitHub auto-close 仕様は汎用、agentdev コマンド命名規約は固有 |
| 再発可能性 | 4/5 | "close" を含むコマンド名（case-close）と #N の組み合わせは慣習的 |
| 費用対効果 | 4/5 | 規約追記・# 省略で低コスト、不意クローズ防止の効果大 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-conventional-commits に auto-close 回避ガイドライン追加）+ 既存 command へ反映（case-close Step 11 で #N 使用抑制）。fix gap（回避ガイドラインなし）。

#### エントリ一覧
- commit message の (case-close #N) 等の複合語が GitHub auto-close キーワードを誘発し、参照先 Issue を意図せずクローズする [inbox]

### 問題クラス3: 限定的検査の通過で機能達成を宣言すると、後続Waveの包括的検査で達成前提が覆る

- **根本原因**: 限定的検査（対象パスのみ検査）の通過をもって「機能達成」と宣言し、検査対象外の違反を見逃す。達成報告が「どの検査項目を満たしたか」を明示せず、「限定的検査項目達成」と「全体達成」を同義扱いする。Epic の最終 Wave で包括的検査機構を実装すると、前 Wave の達成前提が覆る。
- **再発条件**: (a) 機能達成を限定的検査の通過で代用し、達成報告が検査範囲を明示しない場合。(b) Epic の最終 Wave で包括的検査機構を実装し、前 Wave の達成前提を覆す場合。
- **予防策**: (a) 達成報告時に「どの検査項目を満たしたか」を明示し「全体達成」と「部分達成」を区別する。(b) case-open/case-run で受け入れ基準を立てる際、検査可能な基準と検査未実装の基準を分離し、後者は「検査機構実装後に確認」と注記する。(c) QG-2 で受け入れ基準の網羅性（検査カバレッジ）を確認する観点の追加を検討する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（配布物参照境界、Wave 1/2 → Wave 3 で303件検出） |
| 影響度 | 4/5 | Wave 1/2 達成報告が覆る、303件違反の別 Issue 化、大規模手戻り |
| 横展開性 | 3/5 | 段階的実装（Wave分割）+ 最終 Wave で検査機構実装の Epic 構成で中程度 |
| 反映先明確度 | 3/5 | case-open（受け入れ基準）、QG-2（検査カバレッジ）、quality-gates skill。候補あり |
| 自動化適性 | 2/5 | 「検査可能 vs 未実装の分離」「達成報告の網羅性明示」は soft guideline、機械化困難 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の Wave/Epic 構成に依存 |
| 再発可能性 | 3/5 | 最終 Wave で検査機構を実装する Epic 構成で中程度 |
| 費用対効果 | 3/5 | guideline 追記は低コストだが、効果は Epic 規模に依存 |
| **加重合計** | **22/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・自動化適性低（soft guideline）・Epic 構成依存の situational な知見。living pool で維持し、限定的検査→包括的検査で達成前提が覆る事象の再発時に具体化して再評価する。ただし「達成報告は検査項目を明示」の横展開観点は有望。

#### エントリ一覧
- 限定的検査による「配布物参照境界達成」報告が包括的検査で覆る（Wave 1/2 → Wave 3） [inbox]

### 問題クラス4: case-open の完了条件に実測値（件数等）を記載する際に実ファイル確認を省略し推定値が混入する

- **根本原因**: case-open が完了条件・pass criteria に件数・行数等の実測値を記載する際、実ファイルの計測を省略し推定値を記載する。実測値を含める場合の実ファイル確認を必須とする手順が存在しない。推定値は case-run 実装担当者が実測値と照合できず、QG-3/QG-4 で spec-bug として処理する手戻りを生む。
- **再発条件**: case-open が完了条件に実測値（件数、行数、サイズ等）を含め、実ファイル確認を省略して推定値を記載した場合。
- **予防策**: (a) case-open の完了条件記載時に件数・行数等の実測値を要求する場合、実ファイル確認を必須化する。(b) 完了条件には「実測値」ではなく「性質」（例: learning entry が保持されていること）を記載し、実測値は pass criteria 検証時に測る運用にする。(c) case-open の test strategy verification に「実測値を含む場合、当該ファイルの実測を行う」ステップを追加する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（Issue #1412 AG-004「8件」推定、実測17件） |
| 影響度 | 3/5 | 完了条件の事実誤認、case-run で spec-bug 処理、Findings 記録の手戻り |
| 横展開性 | 3/5 | case-open で件数・行数・サイズ等を実測値で記載する全般で中程度 |
| 反映先明確度 | 4/5 | case-open command（完了条件記載ガイドライン）、issue-management skill。明確 |
| 自動化適性 | 2/5 | 実ファイル計測の必須化は手順化可能だが、記述粒度の機械検証は困難 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の case-open 記述規律 |
| 再発可能性 | 3/5 | case-open で実測値を記載する頻度に依存、中程度 |
| 費用対効果 | 4/5 | ガイドライン追記・性質中心記載で低コスト、事実誤認防止の効果大 |
| **加重合計** | **23/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・自動化適性低。PC-1（case-run 冒頭 staleness check）の昇華で、case-run 検証時に推定値と実測値の乖離を検出する経路が部分カバーする。単独昇華には具体性不足。living pool で維持し、case-open 完了条件の推定値混入が再発した場合に具体化して再評価する。

#### エントリ一覧
- case-open の完了条件に実測値（件数等）を記載する際に実ファイル確認を省略すると事実誤認が混入する [inbox]

### 問題クラス5: 廃止 REQ/SPEC 由来の SKILL/command 記述が孤儿化し、inspect 系で検出されない documentation drift

- **根本原因**: REQ/SPEC/ADR 廃止時（retired 化、supersede）に、当該由来の SKILL/command/guide 本文に埋め込まれた運用ルール記述まで追跡・整理する仕組みがない。廃止イベントと下流 SKILL 本文の紐付けがなく、文書間で孤儿化したまま停滞する。inspect-skills/inspect-docs の検出観点に「廃止 REQ/SPEC 由来の記述残置」カテゴリが明示されていない。
- **再発条件**: (a) REQ/SPEC/ADR が廃止・supersede され、(b) 当該由来の記述が SKILL/command/guide 本文に埋め込まれており、(c) 廃止時の横断クリーンアップが実行されない場合。
- **予防策**: (a) inspect-skills/inspect-docs の検出観点に「廃止 REQ/SPEC 由来の記述残置」カテゴリを追加し、retired 化された REQ/SPEC への言及を SKILL/command/guide 本文から横断検索する。(b) REQ/SPEC 廃止手順（req-save/spec-save または専用コマンド）に、下流 SKILL/command/guide 記述のクリーンアップステップを組み込む。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（learning-pipeline/SKILL.md の REQ-0023 廃止後残置セクション） |
| 影響度 | 3/5 | documentation drift、陳腐化した運用ルールが実装を誘導、実装者混乱 |
| 横展開性 | 4/5 | REQ/SPEC/ADR 廃止 + 下流 docs 埋め込みの全パターン、汎用的 |
| 反映先明確度 | 4/5 | inspect-skills skill、inspect-docs skill、REQ/SPEC 廃止手順。明確 |
| 自動化適性 | 4/5 | retired REQ/SPEC ID の grep 横断検索は手順化・機械化容易 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の廃止ワークフロー固有だが、文書間 drift は汎用 |
| 再発可能性 | 3/5 | REQ/SPEC 廃止頻度に依存、下流クリーンアップ漏れは中程度 |
| 費用対効果 | 4/5 | 検出カテゴリ追加・クリーンアップステップ追加で低コスト、drift 予防効果大 |
| **加重合計** | **26/40** | |

- **推奨処分案**: 既存 skill へ反映（inspect-skills/inspect-docs に「廃止REQ/SPEC由来記述残置」検出カテゴリ追加候補）+ 廃止手順へ横断クリーンアップステップ追加候補。fix gap（検出カテゴリなし）+ guardrail insufficiency（廃止手順にクリーンアップなし）。

#### エントリ一覧
- 廃止 REQ 由来の SKILL 記述が残置する documentation drift は inspect 系で検出されていない [inbox]

## promote 時prune結果

- **対象エントリ数**: 27件（inbox 5件 + deferred 22件）
- **prune実施**: 予定あり（staged のみ。REQ-0147-006/007 準拠）
- **prune候補**: 1件（PC-1 の deferred メンバー「Issue 本文の事前状態記載が実装時点と乖離」→ staged 化に伴い prune。根拠は PC-1 採用済み成果物の「元learning item/根拠」に保存）
- **prune却下**: 0件
- **prune 非対象（living pool 維持）**: deferred 21件（deferred/未処理/再評価対象）+ inbox の PC-3/PC-4（deferred 判定で deferred.md へ移動）

## 全体傾向

- **高頻出・高影響の問題クラス**: PC-1（Issue body スナップショット陳腐化、28/40、2件）が唯一の複数件数クラス。case-open→case-run 間の並行 PR マージで再発確実。PC-2（commit auto-close、28/40）・PC-5（inspect 検出カテゴリ、26/40）も昇華優先度高。
- **横展開性が高い問題クラス**: PC-2（5/5、GitHub auto-close は汎用）、PC-1/PC-5（4/5）。
- **自動化適性が高い問題クラス**: PC-5（4/5、retired ID grep 横断検索）、PC-1/PC-2（4/5、staleness check・commit lint）。
- **全体的な観察所見**: 5件中3件（PC-1/PC-2/PC-5）が明確な昇華対象（既存 command/skill への反映、fix gap）。2件（PC-3/PC-4）は deferred（出現1件・自動化適性低・soft guideline）。REQ-0155-005（無条件自動REQ化禁止、living pool 維持）に従い、昇華対象は promoted/ → backlog-review → RU → req-define 経路のみ。全問題クラスとも ADR 除外基準該当（技術判断不在）で ADR 候補0件。

## ADR候補除外記録

全問題クラスについて `agentdev-adr-guidelines` の除外基準を適用した結果、ADR 候補は0件。全て運用ルール・command仕様・skill手順・SPEC の範疇。

| 問題クラス | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| PC-1 (Issue body snapshot staleness) | command仕様・運用ルール | case-run の staleness check 手順追加・case-open の記録粒度ガイドラインであり技術判断不在 | case-run command, case-open command |
| PC-2 (commit auto-close keyword) | 運用ルール・command仕様 | commit message 規約の auto-close 回避ガイドラインであり技術判断不在 | agentdev-conventional-commits skill, case-close command |
| PC-3 (limited inspection overturns) | 運用ルール | 達成報告の表現ガイドライン・受け入れ基準の検査可能性明示であり技術判断不在 | case-open command, agentdev-quality-gates skill |
| PC-4 (case-open estimated count) | command仕様・運用ルール | 完了条件記載時の実ファイル確認必須化であり技術判断不在 | case-open command, agentdev-issue-management skill |
| PC-5 (orphaned skill from retired REQ) | 仕様変更・command仕様 | inspect 検出カテゴリ追加・廃止手順のクリーンアップステップ追加であり技術判断不在 | inspect-skills skill, inspect-docs skill, REQ/SPEC 廃止手順 |

## 既存対策確認サマリ

| 問題クラス | 既存対策 | ギャップ分類 | 詳細 |
|---|---|---|---|
| PC-1 | case-run に「前提確認」フェーズあり、case-update command で Issue 本文更新可能 | fix gap + guardrail insufficiency | Issue 本文のファイルパス参照・検査結果スナップショットの staleness check（case-run 冒頭）が手順化されていない。case-open の記録粒度（識別子中心 vs 件数スナップショット）規定なし |
| PC-2 | agentdev-conventional-commits skill 既存（commit message 規約） | fix gap | auto-close キーワード（close/fix/resolve を含む複合語）と #N 併存の回避ガイドラインなし。case-close Step 11 の commit message 生成で #N 使用抑制なし |
| PC-3 | agentdev-quality-gates skill（QG-2 acceptance criteria coverage）あり | guardrail insufficiency | 達成報告の検査範囲明示、検査可能/未実装基準の分離、検査カバレッジ観点の規定なし。ただし soft guideline 性質 |
| PC-4 | case-open に test strategy verification ステップあり | fix gap + application miss | 実測値（件数等）記載時の実ファイル確認必須化なし。性質中心記載のガイドラインなし |
| PC-5 | inspect-skills/inspect-docs command 既存、req-save/spec-save が廃止を扱う | fix gap + guardrail insufficiency | 「廃止 REQ/SPEC 由来の記述残置」検出カテゴリなし。廃止手順に下流 SKILL/command/guide 横断クリーンアップステップなし |
