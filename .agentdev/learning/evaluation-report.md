# 評価レポート

## メタデータ
- **実行日時**: 2026-07-06 00:00
- **対象エントリ数**: 7件（inbox: 7件, deferred: 18件 living pool 参照）
- **問題クラス数**: 5（未分類なし）

## 正規化結果

inbox 7件は全て新フォーマット（13フィールド）。正規化不要。
deferred 18件は living pool。クラスタD（task() 委譲失敗）の関連エントリとして L-004, L-010 を参照。

## 問題クラス一覧

### 問題クラス1: case-open の完了条件・事前状態に埋め込んだ件数スナップショットが並行PRマージで陳腐化する

- **根本原因**: case-open が RU/inspect 由来の一括是正 Issue の完了条件や参考情報として件数・参照範囲のスナップショットを埋め込む。case-open → case-run の間に別PRが同ファイル群を修正し、件数前提が陳腐化する。case-open 側に「完了条件展開前の最新状態再確認手順」が未整備。case-run Step 5-3 QG-3 staleness check（REQ-0130-031）は機能し陳腐化を検出するが、case-open 側の予防が不在。
- **再発条件**: (1) RU/inspect がN件の一括是正を検出し、(2) 検出から case-open 起票までの間に別PRが同一ファイル群を修正し、(3) case-open が完了条件展開前に再確認しない場合。順次Wave構成でも同様（先行Wave が後続Wave の件数前提を変化させる）。
- **予防策**: (a) case-open が完了条件を本文に展開する前、対象パスでrg/grepを再実行し検出内容が現在も有効か確認するステップを追加（同日内複数PRマージ時は必須）。(b) 件数を行動基準にせず「check_*.ts = 0件」を完了条件の主軸にする。(c) 順次Waveでは件数記載時に「Wave 1 マージ後に再計算される可能性」注記を添える。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（一括是正Issue介入PR陳腐化、順次Wave件数前提陳腐化、inspect-docs cross-case陳腐化） |
| 影響度 | 3/5 | cosmetic影響が主だが、空コミットPR・QG-4調整コスト・Findings記録の手戻り |
| 横展開性 | 4/5 | case-open→case-run 間の並行PR運用、順次Wave構成、cross-case全般で高い |
| 反映先明確度 | 4/5 | case-open command（完了条件展開前再確認ステップ）、case-run QG-3（既存）。明確 |
| 自動化適性 | 4/5 | case-open 完了条件展開前のrg/grep再実行は手順化容易 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow case ライフサイクル固有だが、並行PR運用では汎用 |
| 再発可能性 | 4/5 | 同日内複数PRマージは高頻度、順次Wave構成でも systemic |
| 費用対効果 | 4/5 | case-open ステップ追加は低コスト、QG-3/QG-4 手戻り大幅低減 |
| **加重合計** | **29/40** | |

- **推奨処分案**: 既存 command へ反映（case-open に完了条件展開前の最新状態再確認ステップ追加）。fix gap（case-open 側の予防手順なし）+ application miss（QG-3 は機能するが case-open で予防できていない）。

#### エントリ一覧
- 一括テキスト是正 Issue が介入 PR により陳腐化し scope-partial PR となる [inbox]
- 順次Wave構成で先行Wave の実装が後続Wave 子Issue の件数前提を陳腐化させる [inbox]
- inspect-docs スナップショットが case-open 時点で先行 PR により陳腐化している（cross-case） [inbox]

### 問題クラス2: check_changed_docs.ts の --base-ref が main ワークツリーで空 diff を返し docs guard が false-clean になる

- **根本原因**: case-close は main ワークツリーで実行され PR ブランチを checkout しないため、HEAD は main 先端（= merge-base と同一）になり diff が空になる。`--base-ref` は PR ブランチ上で実行する前提だが、case-close 手順はその前提を明記していない。スクリプト側も `files_checked` 空時に warning を出さない。
- **再発条件**: case-close 等 main ワークツリーで実行するコマンドが `--base-ref` で docs guard / integrity check を起動し、結果の `files_checked` 空を確認せず pass 判断した場合。
- **予防策**: (a) case-close Step 3-1 の起動例を `--files`（PR 変更ファイル明示）を標準とする。(b) スクリプトが `files_checked` 空時に warning を出す。(c) case-close 手順に「`files_checked` が空でないことの確認」を追加する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（PR #1426） |
| 影響度 | 3/5 | false-clean は検査見逃しリスク、機能影響は middle |
| 横展開性 | 4/5 | `--base-ref` を使う整合性スクリプト全般（check_integrity.ts 等）で同パターン |
| 反映先明確度 | 5/5 | case-close Step 3-1、check_changed_docs.ts。特定済 |
| 自動化適性 | 4/5 | files_checked 空警告追加は容易 |
| プロジェクト固有知識再利用性 | 3/5 | main ワークツリー運用固有だがスクリプト挙動は汎用 |
| 再発可能性 | 4/5 | main ワークツリー運用継続で発生 |
| 費用対効果 | 4/5 | 手順明確化・warning 追加で低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command へ反映（case-close Step 3-1 の手順明確化：`--files` 標準化、`files_checked` 空確認ステップ追加）+ スクリプト改善（check_changed_docs.ts に `files_checked` 空時 warning 追加）。guardrail insufficiency（`--base-ref` 前提明記なし、`files_checked` 空チェックなし）。ユーザー承認で staged に繰り上げ。

#### エントリ一覧
- check_changed_docs.ts の --base-ref が main チェックアウト時に空 diff を返し docs guard が false-clean になる [inbox]

### 問題クラス3: 機械的テキスト置換で rg 検出結果を用途分類なしに一律置換すると誤置換が発生する

- **根本原因**: em-dash 等の文字列検索（`rg " — "`）は表記用途の異なるヒット（本文同格、テーブルセルプレースホルダ、メタ参照）を全て捕捉する。用途分類なしの機械一律置換は意味破壊（`| — |` → `| ： |` 等）を生む。`mechanical-replacement-rules.md` section 2 は判定基準を定義済みだが、適用実例の追記がない。
- **再発条件**: (1) `rg` 等で特定文字列パターンを横断検出し、(2) ヒット全件を同一置換先で機械置換した場合。
- **予防策**: (1) 検出結果をパターン別（表記用途別）に分類してから置換先を決定する。(2) メタ参照（ルール・テンプレートで当該文字を記述対象とするもの）は保持リストとして明示管理。(3) `mechanical-replacement-rules.md` section 2 のパターン定義を前提とし、適用実例を追記する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（em-dash 193件置換・8件保持、PR #1435） |
| 影響度 | 2/5 | 誤置換リスクだが3段階（検出→分類→置換）で防げる |
| 横展開性 | 4/5 | 機械横断置換全般で高い |
| 反映先明確度 | 5/5 | mechanical-replacement-rules.md section 2（既存）。特定済 |
| 自動化適性 | 2/5 | 文脈判定は人間判断、機械化困難 |
| プロジェクト固有知識再利用性 | 3/5 | docs_chore 運用固有だが表記是正は汎用 |
| 再発可能性 | 4/5 | 文字列検索する限り発生 |
| 費用対効果 | 4/5 | 既存SPECの適用実例追記で低コスト |
| **加重合計** | **25/40** | |

- **推奨処分案**: 保留（deferred）。出現1件・既存SPECカバー（section 2）。適用実例追記候補として living pool で維持。

#### エントリ一覧
- em-dash body 置換の文脈判定パターンと rg 検出時の混在注意 [inbox]

### 問題クラス4: case-auto 最大自走モードで call_omo_agent 許可リスト制約により ADR-0127 フォールバックが連続発動する

- **根本原因**: oh-my-openagent 提供の `call_omo_agent` は explore/librarian サブエージェントのみを許可する仕様。case-run Step 6（ADR-0128 task() 委譲モデル）が前提とする Sisyphus-Junior 起動と、caller environment の許可リストが整合していない。case-auto 最大自走モードは委譲前提のため、許可リスト差異がフォールバック連鎖を引き起こす。
- **再発条件**: (1) case-auto 最大自走モード起動、(2) case-run Step 6 で `call_omo_agent(subagent_type="Sisyphus-Junior")` 試行、(3) 許可リスト制約で拒否 → ADR-0127 フォールバック遷移。
- **予防策**: (a) oh-my-openagent 側の `call_omo_agent` 許可リスト拡張（Sisyphus-Junior 追加）。(b) case-run command が caller environment の許可リストを事前検出して task() とインライン実行を自動選択するフォールバック判定の明示化。(c) ADR-0127 フォールバック時でもインライン実施内容が Sisyphus-Junior 相当の検査網を漏れなく実施するテンプレ整備。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 1件 + deferred L-004, L-010（adapter skill L131-148 完全カバーと実証済み） |
| 影響度 | 2/5 | インライン実行で代替可能、機能影響なし |
| 横展開性 | 4/5 | case-auto 最大自走モード全般で高い |
| 反映先明確度 | 4/5 | ADR-0127, case-run Step 6, adapter skill。明確 |
| 自動化適性 | 3/5 | 許可リスト事前検出で自動選択可能 |
| プロジェクト固有知識再利用性 | 4/5 | AgentDevFlow + oh-my-openagent 固有 |
| 再発可能性 | 5/5 | 許可リスト拡張されない限り常態化 |
| 費用対効果 | 3/5 | adapter skill が既にフォールバックを完全カバー、予防策費用対効果は中 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 保留（deferred）。既存 adapter skill L131-148 が task() 起動失敗時フォールバックを完全カバー（L-004/L-010 で実証済み）。事前 probe 強化のみ未成熟。living pool で維持。

#### エントリ一覧
- case-auto 最大自走モードで ADR-0127 フォールバック（インライン実行）が連続事例で発動し続ける [inbox]
- L-004: docs 系 Issue で case-run task() 委譲不可時に adapter skill フォールバックパスが有効 [deferred, 移動日 2026-06-25]
- L-010: ハーネス制約で task() 委譲不可時に同一エージェント統合実行が有効（adapter protocol 準拠） [deferred, 移動日 2026-06-25]

### 問題クラス5: req-define 壁打ちで構造的分析フレームを先行せず自明な質問と逃げ回答を繰り返す

- **根本原因**: req-define/agentdev-req-analysis は「evidence-first 原則」「状態要件と反映作業の分離基準」を規定するが、「壁打ち開始時に構造的分析フレーム（二軸マトリクス等）を立てる手順」「二項選択では件数と根拠でどちらかを明示する規定」「修正には実装とSPECの両面があることを検討する規定」が明示されていない。規定された evidence-first や分離基準を遵守しても、分析枠なしでは「質問/結論を急ぐ」失敗パターンに陥る。
- **再発条件**: (1) 複数件の入力（integrity report、複数RU、複数finding等）を入力として req-define 等の壁打ちコマンドを起動、(2) Step 3 で構造的分析フレームを立てず、(3) evidence-first 原則を運用せずに質問/結論を生成した場合。
- **予防策**: (1) req-define Step 3 に「壁打ち開始時の構造的分析フレーム先行」手順を追加（入力データを二軸以上のマトリクスに配置してから個別に入る）。(2) agentdev-req-analysis SKILL「質問運用ルール」に「二項選択では件数と根拠でどちらかを明示」「修正は実装とSPECの両面を検討」を追記。(3) evidence-first 違反を検出するチェック機構の検討（QG-1 等での「docs 参照証拠なき質問」検出）。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（ses_0cd07cf96ffeOS2zdW4Ce0N3tO の自己採点） |
| 影響度 | 4/5 | 要件化の質が下がる、ユーザー4度の深掘りでようやく思考が進む受動的構造、手戻り大 |
| 横展開性 | 4/5 | req-define 以外の壁打ちフェーズを持つコマンド（intake-capture, backlog-review, inspect-promote）全般で同パターン リスク |
| 反映先明確度 | 5/5 | req-define SPEC Step 3、agentdev-req-analysis SKILL、QG-1。特定済 |
| 自動化適性 | 3/5 | フレームテンプレ化は可能、evidence-first 違反検出は困難 |
| プロジェクト固有知識再利用性 | 3/5 | AgentDevFlow 壁打ちコマンド固有だが分析手法は汎用 |
| 再発可能性 | 4/5 | 現行の手順では再発（規定されていないため） |
| 費用対効果 | 4/5 | 手順追加・SKILL追記で予防可能、低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command へ反映 + 既存 skill へ反映（req-define SPEC Step 3 構造的分析フレーム先行手順、agentdev-req-analysis SKILL 質問運用ルール拡充、QG-1 evidence-first 違反検出候補）。guardrail insufficiency（手順の不備）。ユーザー確認あり・改善要望明確。

#### エントリ一覧
- req-define 壁打ちで構造的分析フレームを先行せず自明な質問と逃げ回答を繰り返す [inbox]

## promote 時prune結果

- **対象エントリ数**: 7件（inbox 7件）
- **prune実施**: 予定あり（staged のみ。REQ-0147-006/007 準拠）
- **prune候補**: 0件（inbox エントリは全て deferred.md へ移動。staged 判定の PC-1/PC-2/PC-5 の根拠は採用済み成果物の「元learning item/根拠」に保存予定）
- **prune却下**: 0件
- **prune 非対象（living pool 維持）**: deferred 18件（既存）+ inbox の PC-3/PC-4（deferred 判定で deferred.md へ移動）

## 全体傾向

- **高頻出・高影響の問題クラス**: PC-1（Issue件数スナップショット陳腐化、29/40、3件）が唯一の複数件数クラス。case-open→case-run 間の並行PR運用・順次Wave構成で systemic に再発。PC-5（req-define 壁打ち品質、28/40）は単発だが影響度4・ユーザー確認ありで昇華優先度高。
- **横展開性が高い問題クラス**: PC-1/PC-2/PC-3/PC-4/PC-5 全て4/5。AgentDevFlow の case ライフサイクル・req-define 壁打ち・機械置換・task() 委譲全般に共通。
- **自動化適性が高い問題クラス**: PC-1（4/5、rg/grep 再実行）、PC-2（4/5、files_checked 空警告）。
- **全体的な観察所見**: 5問題クラス中3件（PC-1/PC-2/PC-5）が昇華対象（既存 command/skill への反映、staged）。2件（PC-3/PC-4）は deferred（出現1件・既存カバー・特定シナリオ）。REQ-0155-005（無条件自動REQ化禁止、living pool 維持）に従い、昇華対象は promoted/ → backlog-review → RU → req-define 経路のみ。全問題クラスとも ADR 除外基準該当（技術判断不在）で ADR 候補0件。

## ADR候補除外記録

全問題クラスについて `agentdev-adr-guidelines` の除外基準を適用した結果、ADR 候補は0件。全て運用ルール・command仕様・skill手順・SPEC の範疇。

| 問題クラス | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| PC-1 (Issue件数snapshot staleness) | command仕様・運用ルール | case-open の完了条件展開前再確認ステップ追加であり技術判断不在 | case-open command, case-run QG-3 |
| PC-2 (docs guard false-clean) | command仕様 | case-close 手順明確化・スクリプト warning 追加であり技術判断不在 | case-close command, check_changed_docs.ts |
| PC-3 (機械置換文脈判定) | 運用ルール | 既存SPECの適用実例追記であり技術判断不在 | mechanical-replacement-rules.md |
| PC-4 (task() 委譲失敗) | command仕様・運用ルール | adapter skill フォールバックカバー既存・事前 probe 強化であり技術判断不在 | ADR-0127, case-run Step 6, adapter skill |
| PC-5 (req-define 壁打ち品質) | command仕様・運用ルール | req-define Step 3 手順追加・SKILL質問運用ルール拡充であり技術判断不在 | req-define command, agentdev-req-analysis SKILL, QG-1 |

## 既存対策確認サマリ

| 問題クラス | 既存対策 | ギャップ分類 | 詳細 |
|---|---|---|---|
| PC-1 | case-run Step 5-3 QG-3 staleness check（REQ-0130-031、機能中）、case-update command | fix gap + application miss | case-open 側の「完了条件展開前の最新状態再確認手順」なし。QG-3 は機能するが case-open で予防できていない |
| PC-2 | REQ-0158-003（case-close Step 3-1 targeted docs guard） | guardrail insufficiency | `--base-ref` の前提（PR ブランチ上実行）明記なし、`files_checked` 空チェックなし |
| PC-3 | `mechanical-replacement-rules.md` section 2（判定基準既存） | fix gap | 適用実例の追記なし（em-dash 193件置換・8件保持の実例） |
| PC-4 | adapter skill L131-148（task() 起動失敗時フォールバック完全カバー、L-004/L-010 実証済み） | なし | 事前 probe 強化のみ未成熟だが既存設計は妥当 |
| PC-5 | req-define SPEC（evidence-first原則、状態要件と反映作業の分離基準） | guardrail insufficiency | 構造的分析フレーム先行手順、二項選択回答規定、実装/SPEC 二軸分析規定なし |
