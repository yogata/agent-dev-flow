# 評価レポート

## メタデータ
- **実行日時**: 2026-06-27 00:00
- **対象エントリ数**: 9件（inbox: 9件, archive: 0件新規参照）
- **問題クラス数**: 8（クラスタ1 + 未分類7）

## 正規化結果

inbox 9件は全て新フォーマット（13フィールド）。正規化不要。

## 問題クラス一覧

### 問題クラス1: Windows PowerShell + UTF-8 エンコーディング不一致による mojibake

- **根本原因**: Windows PowerShell（日本語ロケール）でネイティブコマンドの stdout 取り込み・stdin 引数受け渡し時に `[Console]::OutputEncoding` が既定（cp932）となり、UTF-8 バイト列を cp932 として誤デコードする。L-005（Write ツール既存 UTF-8 ファイル cp932 化）と同根だが、発生経路が gh CLI stdout 読込・git commit -m 引数で異なる。
- **再発条件**: PowerShell（Windows、日本語ロケール環境）で `[Console]::OutputEncoding` を UTF-8 に設定せずに、日本語を含む CLI 出力の取り込み・加工・書き戻し、または日本語を含む `-m` 引数の commit 作成を行う場合。
- **予防策**: (a) PowerShell 実行時に `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` を標準設定、(b) git commit の日本語メッセージは `-F <utf8-file>` 使用、`-m` は ASCII-only に限定、(c) 書き戻し後の VERIFY に mojibake チェックを含める。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（gh CLI stdout、git commit -m） |
| 影響度 | 3/5 | Issue 本文破損（書き戻しで mojibake 上書き）は重大だが VERIFY 再読込で検知可能。commit message タイトル破損は実害軽微 |
| 横展開性 | 5/5 | PowerShell（Windows）で日本語含む全 CLI 出力/入力経路で汎用的に発生 |
| 反映先明確度 | 4/5 | agentdev-gh-cli（standard-procedures.md, verify.md）、agentdev-conventional-commits。特定済 |
| 自動化適性 | 4/5 | encoding 設定の標準手順化、`-F` 使用ルール化で容易 |
| プロジェクト固有知識再利用性 | 4/5 | Windows + PowerShell + 日本語環境の落とし穴として再利用価値高い |
| 再発可能性 | 5/5 | 設定しない限り日本語ロケール環境で毎回発生 |
| 費用対効果 | 5/5 | 標準手順への追記のみで低コスト・高効果 |
| **加重合計** | **32/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-gh-cli standard-procedures.md / verify.md、agentdev-conventional-commits）。L-005 の適用範囲を gh CLI stdout・git commit -m 経路へ拡張。

#### エントリ一覧
- gh CLI の日本語出力を PowerShell で捕獲すると stdout encoding 不一致で mojibake し書き戻しで本文破損 [inbox]
- git commit -m の日本語タイトル行が PowerShell で mojibake（本文は正常） [inbox]

### 問題クラス2（未分類）: gh pr merge --delete-branch が worktree 占有で local/remote 削除を巻き込み失敗

- **根本原因**: `--delete-branch` は local→remote の順で削除を試みる。local 削除が worktree 占有エラーで失敗すると全体が中断され、remote 削除フェーズに到達しない。case-close Step 4 と Step 7 の順序は正しいが、Step 4 で `--delete-branch` を使うと順序が逆転する。
- **再発条件**: case-close Step 4 で `gh pr merge --squash --delete-branch` を実行し、対象ブランチがアクティブ worktree に checkout されている場合。
- **予防策**: case-close の PR マージ手続きを `gh pr merge <N> --squash`（`--delete-branch` なし）に統一し、branch 削除は Step 7 で worktree 削除後に明示実行する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | remote branch 残存、手動 cleanup で復旧可能だが手戻り発生 |
| 横展開性 | 3/5 | worktree 運用 + gh pr merge --delete-branch の組み合わせ環境で中程度 |
| 反映先明確度 | 4/5 | case-close Step 4/7、agentdev-gh-cli standard-procedures.md。特定済 |
| 自動化適性 | 4/5 | `--delete-branch` なし運用への統一で容易 |
| プロジェクト固有知識再利用性 | 3/5 | worktree 運用環境固有の落とし穴 |
| 再発可能性 | 4/5 | `--delete-branch` を使えば worktree 運用下で再発 |
| 費用対効果 | 4/5 | 手順変更のみで低コスト |
| **加重合計** | **26/40** | |

- **推奨処分案**: 既存 command/skill へ反映（case-close guardrail、agentdev-gh-cli standard-procedures.md）。既存手順は正しいが `--delete-branch` 使用の副作用に対するガードレール不十分。

#### エントリ一覧
- gh pr merge --delete-branch が worktree 活動中ブランチで local/remote 削除を巻き込み失敗 [inbox]

### 問題クラス3（未分類）: Issue 本文の事前状態記載が実装時点と乖離し陳腐化

- **根本原因**: Issue 本文（case-open 成果物）に check_integrity.ts の実行時点スナップショット（絶対件数）を記載するが、その後の本体改修で検出結果が変動しても Issue 本文は追従更新されない。事前状態記載の粒度・更新タイミングに SPEC 上の規定がない。
- **再発条件**: case-open で check_integrity.ts の絶対件数を事前状態として Issue 本文に記載し、case-open から case-run の間に本体が改修された場合。
- **予防策**: (a) case-open の事前状態記載を「NG 識別子リスト」中心にし件数は補助情報とする、(b) case-run 開始時に再計測して差異があれば Findings に記録する手順の明文化。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 2/5 | case-run で差異記録が必要になる程度。実害は限定的 |
| 横展開性 | 3/5 | check_integrity.ts 件数を記載する全 case-open で中程度 |
| 反映先明確度 | 4/5 | case-open（事前状態フォーマット）、case-run（再計測手順）。特定済 |
| 自動化適性 | 3/5 | フォーマット変更（識別子中心）で可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の case-open 運用固有 |
| 再発可能性 | 3/5 | check_integrity.ts 改修建度に依存 |
| 費用対効果 | 3/5 | フォーマット調整で中コスト中効果 |
| **加重合計** | **22/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・中スコア。事前状態フォーマット調整は有効だが、再発時に具体化してから昇華を再評価する。

### 問題クラス4（未分類）: 複合ラベル duty keyword の区切り文字規約未整備

- **根本原因**: 複合ラベル（複数の責務を1語で表す duty keyword）の区切り文字が読点と中黒のどちらかについて規定が曖昧。check_integrity.ts 側は中黒を期待するが文書側が読点を使用し、機械的検出と文書表記が不一致。
- **再発条件**: 複合ラベル duty keyword を読点区切りで文書に記載し、check_integrity.ts が中黒を期待している場合。
- **予防策**: duty keyword の区切り文字規約（読点=流動的並列、中黒=複合ラベル）を integrity-rule-catalog.md または japanese-tech-writing スキルに明文化する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 2/5 | check_integrity NG 1件。文書是正で即解消 |
| 横展開性 | 3/5 | 全コマンドの G21 duty keyword で中程度 |
| 反映先明確度 | 4/5 | integrity-rule-catalog.md、japanese-tech-writing。特定済 |
| 自動化適性 | 3/5 | 区切り文字規約の明文化で可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の duty keyword 規約固有 |
| 再発可能性 | 3/5 | 新規コマンド追加時に再発し得る |
| 費用対効果 | 4/5 | 規約明文化のみで低コスト |
| **加重合計** | **23/40** | |

- **推奨処分案**: 保留（deferred）。出現1件。再利用性ある規約だが、duty keyword NG が再発した場合に具体化して昇華を再評価する。

### 問題クラス5（未分類）: 機械横断置換 PR の完了宣言と再 grep 確認の連動不備

- **根本原因**: `mechanical-replacement-rules.md`「再現性の担保」Step 3-4（再 grep 0 件確認、REQ-0153 で必須化済み）が PR の完了宣言時に実行されなかった可能性。PR 完了宣言と機械的検証の連動が機能しなかった。
- **再発条件**: 機械横断置換を伴う PR で、Step 3-4（再 grep 0 件確認）を省略して完了宣言した場合。
- **予防策**: (a) case-close QG-4 の検査項目に「機械横断置換を伴う PR は再 grep 0 件確認結果を Findings に記録」を追加、(b) mechanical-replacement-rules.md Step 3-4 を case-run の test-fix ループに組み込む。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | 完了宣言不正確、後続 inspect で検出 |
| 横展開性 | 3/5 | 機械横断置換 PR 全般で中程度 |
| 反映先明確度 | 4/5 | agentdev-quality-gates（QG-4）、agentdev-doc-writing。特定済 |
| 自動化適性 | 3/5 | case-run test-fix ループへの組み込みで可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の機械横断置換運用固有 |
| 再発可能性 | 3/5 | REQ-0153 必須化済みだが運用徹底次第 |
| 費用対効果 | 4/5 | QG-4 検査項目追加で低コスト |
| **加重合計** | **24/40** | |

- **推奨処分案**: 保留（deferred）。REQ-0153 で再 grep 0 件確認は既に必須化済み。本件は適用徹底レベルの知見（application miss）。QG-4 明示的組み込みは有効だが、REQ-0153 適用の運用徹底で対応可能な範囲。

### 問題クラス6（未分類）: SUB-D 網羅検証の gloss 形式判定規則未整備

- **根本原因**: SUB-D 網羅検証は候補語の bare 英語出現を grep 抽出するため `日本語（英語）` gloss 形式も候補に含まれる。これを「未置換」と扱うか「推奨訳語置換済」と扱うかの判定規則が明文化されていない。
- **再発条件**: SUB-D 網羅検証で候補語 grep を実行し、`日本語（英語）` gloss 形式インスタンスが含まれる場合。
- **予防策**: SUB-D 検証手順に「gloss 形式 `日本語（英語）` は推奨訳語置換済として再置換対象外とする」運用規則を明文化する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | 誤置換で gloss 情報欠落・重複リスク |
| 横展開性 | 3/5 | SUB-D 検証全般、他 SPEC ファイルで中程度 |
| 反映先明確度 | 3/5 | backticks-identifier-threshold.md 境界ケース追記 or 新規 SPEC。候補あり |
| 自動化適性 | 3/5 | 判定規則の明文化で可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の表記是正運用固有 |
| 再発可能性 | 3/5 | SUB-D 検証で gloss 形式出現度に依存 |
| 費用対効果 | 4/5 | 運用規則明文化で低コスト |
| **加重合計** | **23/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・SUB-D 検証の境界ケース。gloss 形式誤置換が再発した場合に具体化して昇華を再評価する。

### 問題クラス7（未分類）: case-open direct scope 外と Issue 完了条件の表現乖離

- **根本原因**: case-open の case_open_hints は direct scope 外を明記するが、Issue 完了条件（REQ から機械生成）は direct scope 外要件を除外せず構造存在要求の表現を維持する。case_open_hints と完了条件の間に同期仕組みがない。
- **再発条件**: case-open で direct scope 外要件を完了条件に含め、完了条件が構造存在要求の表現のまま残存する場合。
- **予防策**: (a) case-open で direct scope 外要件の完了条件を達成可能な表現に調整、(b) case-auto で case_open_hints と完了条件の整合性をチェックするステップを追加。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | QG-4 で完了条件調整が必要 |
| 横展開性 | 3/5 | direct scope 外要件を含む case-open 全般で中程度 |
| 反映先明確度 | 4/5 | case-open、case-auto。特定済 |
| 自動化適性 | 3/5 | 整合性チェックステップで可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の case-open 運用固有 |
| 再発可能性 | 3/5 | direct scope 外要件を含める度に |
| 費用対効果 | 3/5 | 手順追加で中コスト中効果 |
| **加重合計** | **23/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・中スコア。case-open/case-auto の整合性チェックは有効だが再発時に具体化して昇華を再評価する。

### 問題クラス8（未分類）: Epic 分解時に既存 Issue とのスコープ完全重複を検知できず空コミット PR に終始

- **根本原因**: Epic case-open のディレクトリ単位分割時に、既存 OPEN Issue の AG（acceptance goal）スコープと分解候補 OU の照合をスキップした。両者の分解軸（ディレクトリ vs AG）が直交しないため構造的に重複が発生し得る。
- **再発条件**: 横断是正 Epic を case-open でディレクトリ単位分割する際、同一リポジトリに doc-structural-cleanup 系の横断 Issue が OPEN/進行中で、かつその AG が Epic 子 Issue の OU と同じ対象を含む場合。
- **予防策**: (a) case-open の Epic 分解フローで既存 OPEN Issue の AG/対象ファイル群と分解候補 OU の照合ステップを追加、(b) 横断是正 Epic と横断 Issue 並行時のスコープ境界事前合意運用を SPEC に明文化。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 3/5 | 空コミット PR でリソース消費 |
| 横展開性 | 2/5 | 横断是正 Epic + 横断 Issue 並行運用の特定条件で限定 |
| 反映先明確度 | 4/5 | case-open（Epic 分解ロジック）、docs/specs/commands/case-open.md。特定済 |
| 自動化適性 | 3/5 | 既存 Issue AG 照合ステップで可能 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow の Epic 運用固有 |
| 再発可能性 | 3/5 | 横断是正 Epic と横断 Issue 並行時に中程度 |
| 費用対効果 | 3/5 | 照合ステップ追加で中コスト中効果 |
| **加重合計** | **22/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・特定シナリオ。Epic 分解と横断 Issue 並行が再発した場合に具体化して昇華を再評価する。

## promote 時prune結果

- **対象エントリ数**: 9件
- **prune実施**: あり（staged エントリのみ）
- **prune候補**: 3件（PC-1 エントリ2件 + PC-2 エントリ1件）
- **prune却下**: 0件

## 全体傾向

- **高頻出・高影響の問題クラス**: Windows PowerShell + UTF-8 エンコーディング不一致（PC-1、32/40）が突出。L-005 系の知見が新たな経路（gh CLI stdout、git commit -m）で再実証されており、Windows 環境の継続的な落とし穴。
- **横展開性が高い問題クラス**: PC-1（5/5）が圧倒的。PowerShell で日本語を扱う全経路が対象。PC-2（worktree + --delete-branch）も worktree 運用環境で横展開性あり。
- **自動化適性が高い問題クラス**: PC-1（encoding 設定標準化）、PC-2（--delete-branch なし運用）ともに手順変更のみで対応可能。
- **全体的な観察所見**: 9件中2件（PC-1 クラスタ）が明確な昇華対象。残り7件は出現1件の中スコア（22-24/40）で、再発時に具体化する deferred 判定が妥当。REQ-0155-005（無条件自動REQ化禁止、living pool 維持）に従い、断片的・単発の知見は living pool で維持する。

## ADR候補除外記録

全問題クラスについて `agentdev-adr-guidelines` の除外基準を適用した結果、ADR 候補は0件。全て運用ルール・command仕様・skill 手順の範疇。

| 問題クラス | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| PC-1 (PowerShell mojibake) | 運用ルール | encoding 設定の標準手順化・`-F` 使用ルール化であり技術判断不在 | agentdev-gh-cli skill, agentdev-conventional-commits |
| PC-2 (--delete-branch worktree) | 運用ルール・command仕様 | `--delete-branch` 使用の副作用に対するガードレール追加 | case-close command, agentdev-gh-cli skill |
| PC-3〜PC-8 | 運用ルール・command仕様 | 各々手続き・フォーマット・運用徹底の範疇 | 各 command/skill/spec |

## 既存対策確認サマリ

| 問題クラス | 既存対策 | ギャップ分類 | 詳細 |
|---|---|---|---|
| PC-1 | L-005（AGENTS.md, standard-procedures.md）は Write ツール経路のみカバー | fix gap | gh CLI stdout・git commit -m 経路は未カバー。verify.md に mojibake チェックなし |
| PC-2 | case-close Step 4/7 は正しい順序を規定済み | guardrail insufficiency | `--delete-branch` 使用の副作用に対するガードレール不十分 |
| PC-3 | 事前状態記載の粒度・更新タイミングに SPEC 規定なし | fix gap | 規定なし |
| PC-4 | duty keyword 区切り文字規約なし（check_integrity.ts は中黒期待） | fix gap | 規約未明文化 |
| PC-5 | REQ-0153 で再 grep 0 件確認は必須化済み | application miss | 規定は存在するが適用されていないケースあり |
| PC-6 | backticks-identifier-threshold.md は gloss 形式を明示的に扱わない | fix gap | 判定規則未明文化 |
| PC-7 | case_open_hints と完了条件の整合性チェック規定なし | fix gap | 規定なし |
| PC-8 | case-open SPEC に既存 Issue AG 照合手順なし | fix gap | 規定なし |
