# 並行委譲間の worktree / git 作業境界を強化する

## 背景

inbox 1件と deferred 2件の3系統で branch 混入、メインリポジトリ一時汚染、並行書き込みが発生。

## 問題

複数の並行 case-open / 委譲が同一 worktree・checkout 状態を共有し、worktree の 1-writer 前提が崩れて branch 混入・並行書込み・cd 誤りによる main 汚染が発生する

## 望ましい変更

Case 専用 worktree での branch 作成、PR 作成前の merge-base と diff --stat 検査、明示パスステージ、git status 検知、早期断念基準

## 対象範囲

### 対象

- case-open branch/worktree 運用手順、adapter protocol、case-auto 委譲境界

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | case-open branch/worktree 運用手順、adapter protocol、case-auto 委譲境界 | Case 専用 worktree 前置、PR前 merge-base / diff --stat 検査、1-writer 早期断念基準が未明文化。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: case-open branch/worktree 運用手順、adapter protocol、case-auto 委譲境界
- **ギャップ分類**: fix gap
- **ギャップ詳細**: Case 専用 worktree 前置、PR前 merge-base / diff --stat 検査、1-writer 早期断念基準が未明文化。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: 並行委譲間の worktree / git 作業境界を強化する
- **根拠**: inbox 1件と deferred 2件の3系統で branch 混入、メインリポジトリ一時汚染、並行書き込みが発生。
- **再発条件**: evaluation-report の問題クラス8および原エントリを参照
- **横展開可能性**: 全並行委譲

### 原エントリ（証跡）

### Inbox 原文 1

## 並行 Case の共有 worktree で branch 混入を検知したら隔離 worktree で差分を再構成する

- **問題事象**: 複数の並行 case-open が同じ worktree を共有し、別 Case のコミットが Definition branch の親履歴へ混入した。共有 worktree は別委譲による checkout・commit の影響も受け、対象 Case 専用 branch を保証できなかった
- **発生局面**: 運用（case-open STEP-4 Definition PR 作成、Case #3087 / RU-0127）
- **検知方法**: `git log` で Definition branch の親コミットが別 Case #3088 の commit `cb59cb4e` と判明し、main 起点との差分に別 Case の履歴が含まれることを確認
- **根本原因**: 並行 Case の branch / checkout / commit 操作が共有 worktree と共有 git checkout 状態に対して行われ、個別の委譲作業境界が git worktree によって隔離されていなかった
- **自律対応内容**: 汚染 branch を PR に使用せず、main 起点の `.worktrees/3087-chore` 隔離 worktree を作成し、対象ファイルだけを含む自分の commit の差分を cherry-pick して、branch 差分が `docs/requirements/REQ-001.md` のみに限定されることを確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の並列作業境界に関する知見。現時点では正規成果物の変更判断をしない）
- **横展開観点**: 同一バッチ内で複数 Case が git 操作を行うすべての並行委譲に適用する。Issue ごとの作業ディレクトリと branch を共有 checkout から分離する
- **再発条件**: 複数委譲が同時に同一 worktree / checkout で branch 切替、編集、commit を行う場合
- **予防策候補**: case-open の Definition branch 作成を Case 専用 worktree 内で行い、PR 作成前に `merge-base` と `diff --stat` を検査して対象 Case の artifact path 以外の commit / file が含まれないことを確認する
- **想定反映先**: `agentdev-workflow-case-open` の branch / worktree 運用手順、および `case-auto` 並列 stage の委譲境界
- **関連**: Case #3087、Case #3088、Definition PR #3091、`definition/issue-3087`、`907a081e`、`a50ff629`
- **タグ**: `#parallel-case` `#worktree` `#branch-isolation` `#case-open`

---

### Deferred 吸収元 1

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

### Deferred 吸収元 2

## 2026-09-15 case 2805 OU-006（PR #2820）: worktree 内並行書き込みの検知と明示パス・ステージ確認の対処

- 観測元: case 2805 OU-006（DEL-2811-2、PR #2820）本文 learning 候補、case-close 2026-09-15 回収
- 内容: 作業中に git status の差分監視で別主体とみられる書き込み（routing references・learning 関連・docs/designs 多数ファイル）を検知した。対処として (1) in-scope ファイルのみ明示パス指定でステージ、(2) ステージ後の `git diff --stat <scope>` が空であることの確認、(3) コミットはステージスナップショットに対して実行、により PR への混入を防止できた。worktree は 1 writer 前提であり、並行書き込み検知時の早期断念基準（in-scope ファイルへの書き込み検知時は直ちに停止等）を adapter protocol 側で明文化すると再発防止になる
- 関連: Issue #2811（OU-006）、PR #2820 対応記録
- タグ: `#worktree` `#parallel-write` `#staging` `#adapter-protocol`

- **移動日**: 2026-09-15
- **処分判定**: deferred（出現1件。adapter protocol の早期断念基準明文化は候補止まり）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 8
- **確定処分**: 既存対策の更新 (category 5)
- **加重合計**: 29/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 1件 + deferred 同種2件 |
| 影響度 | 4/5 | 別 Case commit の PR 混入・PR 作り直し |
| 横展開性 | 4/5 | 全並行委譲 |
| 反映先明確度 | 4/5 | case-open・adapter・case-auto の境界 |
| 自動化適性 | 3/5 | merge-base / diff --stat / git status 検査 |
| プロジェクト固有知識再利用性 | 4/5 |  |
| 再発可能性 | 3/5 | 並行投入が常態化し得る |
| 費用対効果 | 4/5 | 検査前置の追加のみ |

### 判定基礎（evaluation-report verbatim）

### 問題クラス8: 並行委譲間の worktree / git 作業境界の侵害
- **根本原因**: 複数の並行 case-open / 委譲が同一 worktree・checkout 状態を共有し、worktree の 1-writer 前提が崩れて branch 混入・並行書込み・cd 誤りによる main 汚染が発生する
- **再発条件**: 複数委譲が同時に同一 worktree / checkout で branch 切替・編集・commit を行う場合
- **予防策**: Case 専用 worktree での branch 作成、PR 作成前の merge-base と diff --stat 検査、明示パスステージ、git status 検知、早期断念基準

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 1件 + deferred 同種2件（wave5 隔離違反・case 2805 並行書込み） |
| 影響度 | 4/5 | 別 Case commit の PR 混入・PR 作り直し |
| 横展開性 | 4/5 | 全並行委譲（case-open / case-run / capture） |
| 反映先明確度 | 4/5 | case-open branch/worktree 運用手順・adapter protocol・case-auto 委譲境界 |
| 自動化適性 | 3/5 | merge-base / diff --stat / git status 検査は機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | |
| 再発可能性 | 3/5 | 並行投入は backlog-auto stage 構造上常态化し得る |
| 費用対効果 | 4/5 | 検査前置の追加のみ |
| **加重合計** | **29/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— worktree 隔離原則（adapter protocol・case-open「worktree root 配下以外を編集しない」）は存在するが、(a) 並行 case-open 間で Case 専用 worktree を強制する前置、(b) PR 作成前の merge-base / diff --stat による混入検査、(c) worktree 1-writer 前提の早期断念基準、は明文化されていない（fix gap）。3系統の同種発生で適用漏れが構造化された。Jev は category 4 を示唆したが、隔離原則と運用手順が既存であり追加すべきは前置検査・早期断念基準の記述（既存対策への追記）であるため category 5 と判定
- **エントリ一覧**: 並行 Case の共有 worktree で branch 混入を検知したら隔離 worktree で差分を再構成する [inbox] / wave5 cd 操作誤りによるメインリポジトリ一時汚染 [deferred] / case 2805 worktree 内並行書き込みの検知と明示パス・ステージ確認 [deferred]

