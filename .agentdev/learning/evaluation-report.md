# 評価レポート

## メタデータ
- **実行日時**: 2026-10-03 00:50
- **対象エントリ数**: 40件（inbox: 36件, deferred 候補: 4件）
- **問題クラス数**: 7（未分類 18 単位を含む判定単位合計 24）

## 問題クラス一覧

### 問題クラス1: agentdev_gh gh exit 66 起動環境劣化・障害（PC-1）

- **根本原因**: harness（OpenCode serve / plugin host）内 gh spawn 起動環境の障害・劣化（REQ-093 既知事象）。恒常型（RU-0136/0149）から劣化サイクル型（serve 再起動後も約8呼出で再発、窓は〜2呼出の場合も）まで複パターン。全コンテキストが同一 serve を共有するため親子で同時失敗する
- **再発条件**: serve 内 gh spawn が劣化した状態で agentdev_gh 操作（特に書込系）が必要になった場合。batch 並行実行では全サブエージェントの書込が同時 blocked し得る
- **予防策**: (a) case-auto orchestrator の委譲前疎通確認（軽量読取1操作）、(b) gh 呼出の最小副作用単位分割と durable state 先行ステージング、(c) payload の `.agentdev/drafts/proxy-{stage}-{slug}.md` 標準配置による冪等再開、(d) agentdev_gh 側 gh spawn 異常時の自動 respawn 検討、(e) REQ-093 known-issues への劣化サイクル観測蓄積

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | 7件（5-7件帯） |
| 影響度 | 4/5 | workflow 全停止・書込不能。ただし fail-closed で副作用なし |
| 横展開性 | 3/5 | 同種 harness 環境では汎用。serve 内 spawn 構造に依存 |
| 反映先明確度 | 4/5 | REQ-093・issue-operation-safety.md known-issues 節・custom-tool-contracts contingency 節が明確 |
| 自動化適性 | 4/5 | 疎通確認・payload 標準化は既存枠組みで自動化可（Jev 分布 0.79） |
| プロジェクト固有知識再利用性 | 4/5 | agentdev_gh 障害時の診断・縮退運用手順として高再利用 |
| 再発可能性 | 4/5 | 観測継続中。回復窓も存在し常態化と言い切れない（Jev 分布 0.78） |
| 費用対効果 | 5/5 | 影響緩和策の体系化は低コスト高効果（Jev 分布 0.71） |
| **加重合計** | **32/40** | Jev 検証済み（observation 20261002T155542Z-cd77） |

- **推奨処分案**: 5 既存対策の更新（REQ-093 known-issues・issue-operation-safety.md 起動環境障害節への劣化サイクル・窓枯渇・durable state 先行の追補と、委譲前疎通確認・payload 標準配置の運用周知）。既存対策との照合: issue-operation-safety.md「起動環境障害の known-issues」節は診断・回復・作業再開を所有するが、劣化サイクルの定量観測と縮退運用パターンの体系記述は未蓄積 → fix gap

#### エントリ一覧
- 2026-09-30 case-open（RU-0136）: gh exit 66 サブエージェント回復不能 [inbox]
- 2026-09-30 case-open（RU-0149）: 冪等検出完了済み blocked・委譲前疎通確認 [inbox]
- 2026-10-01 case-open（#3278）: 約8呼出劣化サイクル・payload 永続化 [inbox]
- 2026-10-01（#3278 case-ready）: 起動直後〜2呼出の窓枯渇反証 [inbox]
- 2026-10-01 case-run（#3278 Wave1）: write-proxy 二重遮断・proxy package [inbox]
- 2026-10-01（third-party-presupposition）: durable state 先行で再開コスト最小化 [inbox]
- 2026-10-01 case-run（#3289）: bash gh 例外手順で PR 完遂の証跡 [inbox]

### 問題クラス2: 正本・宣言的データ変更とテスト期待値の同期漏れ（PC-2）

- **根本原因**: docs 文言・extension yaml・正本パス等を期待値・参照として pin するテストが、当該データの変更と同一変更単位で更新されない。REQ-019 gate（check_test_impact）は Design 文書への文字列参照しか検出契機にできず、宣言的データ由来の陳腐化は検出外
- **再発条件**: 配布物文言・宣言的データ（extensions/sidecar/config）を変更する Definition PR・Case で pin テストが存在する場合
- **予防策**: (a) REQ-019 gate の検出契機に「宣言的データ参照テスト」を加える拡張、(b) 該当類型の変更を含む Case の test strategy へ integrity suite 実行を含める、(c) case-close STEP-3 full suite を最後の防衛線として省略しない運用の明文化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 4件（inbox 3 + deferred 1） |
| 影響度 | 3/5 | pre-existing fail の混入で QG-4 判定汚染・差し戻し。実害は検証時のみ |
| 横展開性 | 4/5 | 文言 pin・構造ハードコード系テスト全般（Jev 分布 0.67） |
| 反映先明確度 | 4/5 | REQ-019 gate・test-impact-detection-gate.md が具体的 |
| 自動化適性 | 4/5 | gate 検出契機拡張で自動化可能（Jev 分布 0.61） |
| プロジェクト固有知識再利用性 | 4/5 | 配布物と契約テストの同期課題として高価値 |
| 再発可能性 | 4/5 | Definition PR 運用が続く限り構造的 |
| 費用対効果 | 4/5 | gate 拡張は限定変更で効果大 |
| **加重合計** | **30/40** | Jev 検証済み（observation 20261002T155542Z-cd77） |

- **推奨処分案**: 5 既存対策の更新（REQ-019 gate の適用範囲ギャップとして fix gap。test-impact-detection-gate.md・check_test_impact.ts の検出契機拡張候補を req-define へ引き渡す）

#### エントリ一覧
- 2026-09-18: Definition 変更でテスト期待文言陳腐化 [deferred]
- 2026-10-01（#3293 Wave 1）: 契約テスト期待値同期・docs guard profile [inbox]
- 2026-10-02 case-close（#3311）: extension yaml 暗黙依存は REQ-019 gate 検出外 [inbox]
- 2026-10-02 case-run（PR #3328）: textlint-guard テスト期待値不整合 pre-existing [inbox]

（注: PR #3327 旧正本参照は Jev 先行評価（observation 20261002T155352Z-9da3、PC-6 0.91）により直接原因が構造移設追随と判定し PC-6 へ移動）

### 問題クラス3: spawnSync 型回帰テストの固定 timeout 超過（PC-3）

- **根本原因**: check_integrity.test.ts の spawn 系回帰 4 test（IR-055 実修復 ×2・NG21 N16/N17 ×2）の timeout 15秒固定値が、checker 実行時間の増加（配布物追加 +3.7秒・環境負荷・実行形態）を考慮しない
- **再発条件**: checker 実測所要時間が 15秒を超える環境・時点で main root 正規形の suite を実行した場合（現行 16.9秒で継続超過中）
- **予防策**: timeout 値（15000ms）を実測に見合う値（30〜60秒）へ引き上げ（Case 化）、checker 実測分離確認と baseline 対照実行の手順運用（docs/knowledge/windows-bun-test-spawn-timeout-classification.md が所有）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（inbox 2 + deferred 1。#3293 事象3 は PC-2 帰属のため計数から除外） |
| 影響度 | 3/5 | QG-4 fail 由来分類の手間。fail 証拠として不完全 |
| 横展開性 | 4/5 | spawn 系テスト全般・環境性能差は汎用（Jev 分布は水準5に 0.70、水準4 に確定） |
| 反映先明確度 | 4/5 | 対象 test ファイル・知識文書が特定済み |
| 自動化適性 | 3/5 | timeout 値調整は一度の修正。環境差吸収の標準化は継続課題 |
| プロジェクト固有知識再利用性 | 4/5 | baseline 対照・実測分離手順として再利用性高 |
| 再発可能性 | 4/5 | 配布物増加傾向で超過継続・既に3回観測 |
| 費用対効果 | 3/5 | 修正は容易だが根本は checker 実行時間の増加傾向 |
| **加重合計** | **29/40** | Jev 検証済み（observation 20261002T155542Z-cd77） |

- **推奨処分案**: 5 既存対策の更新（docs/knowledge/windows-bun-test-spawn-timeout-classification.md が由来分類・再現手順を所有するが、timeout 値調整は未解決〔deferred の再評価条件「timeout 設定方針の処分確定時」に合致〕。fix gap として timeout 値調整 Case の要否を req-define へ引き渡す）

#### エントリ一覧
- 2026-09-19: check_integrity spawn 系固定 timeout flaky（5000ms→15000ms 猶予済み） [deferred]
- 2026-09-30 case-close（RU-0150）: 4 test timeout 継続 fail・checker 実測分離 [inbox]
- 2026-10-01 case-close（#3289）: 配布物追加で +3.7秒・baseline 対照 [inbox]

（注: #3293 複合エントリは Jev 判定（observation 20261002T155352Z-9da3）で PC-2 に主要帰属確定。同事象3〔IR-055 timeout 変動〕は本クラスの補助観測として再発可能性根拠にのみ参照。エントリの帰属は PC-2）

### 問題クラス4: worktree での git stash 事故（PC-4）

- **根本原因**: stash は refs/stash としてリポジトリ全体（全 worktree 共有）に保存されるため、worktree からの stash 系操作が他環境の stash を誤って適用し得る。失敗を無視する連結実行（`;`）がリスクを増幅
- **再発条件**: worktree 内から stash 系操作を実行し他環境 stash entry が存在する場合
- **予防策**: worktree 検証では stash を使わない（detached worktree・git show による base 比較）。利用は既存手順の条件付き例外に従う

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（inbox 1 + deferred 1） |
| 影響度 | 3/5 | コンフリクト発生・復旧手順を要したが stash entry は無損失 |
| 横展開性 | 3/5 | worktree + stash 運用を行う全 workflow |
| 反映先明確度 | 4/5 | agentdev-git-worktree worktree-operations.md が明確 |
| 自動化適性 | 2/5 | 手順規約による予防中心 |
| プロジェクト固有知識再利用性 | 3/5 | worktree 運用の基礎知識 |
| 再発可能性 | 3/5 | 一時状態切替が必要な場面は残存 |
| 費用対効果 | 4/5 | stash 不使用への置換は低コスト |
| **加重合計** | **24/40** | |

- **推奨処分案**: duplicate。既存対策照合: worktree-operations.md「git stash 運用手順（一時退避）」節が「worktree 検証で一時退避が必要な場合 git stash を使わない」「detached worktree による代替が成立しない場合に限り利用を認める」と規定済みであり、両エントリの予防策を既存手順がカバー。refs/stash 共有性の説明は既存節の理由記述で実質包含（adversarial-review B5 限定合意: 共有性の明示的理由の追加は既存節の改善案として記録に留め、duplicate 判定は予防策カバレッジで維持）

#### エントリ一覧
- 2026-09-04: worktree での git stash pathspec 失敗と誤 pop リスク [deferred]
- 2026-09-30 case-run（#3243）: git stash pop 事故・stash 不使用 git show 推奨 [inbox]

### 問題クラス5: Windows rename EPERM による原子的書込み flaky（PC-5）

- **根本原因**: Windows の renameSync 置換（tmp → 既存ファイル）がアンチウイルス等の瞬間ロックで非決定的 EPERM を返す。単体実行では再現せず並行実行でのみ顕在化
- **再発条件**: Windows 環境で rename ベースの原子的書込みを並行実行コンテキストで行う場合
- **予防策**: bounded retry（指数バックオフ・最大約150ms）を適用（PR #3329 で runner-local.ts に実施済み）。同型の新規書込み実装へ横展開。移設・リファクタ系変更では「変更前構成での同頻度再現」対照プローブで環境起因を先に実証

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（同一主題の先行観測と完結） |
| 影響度 | 3/5 | bun test の flaky fail・差し戻し誘発リスク |
| 横展開性 | 4/5 | Windows で原子的書込みを実装する全コード（Jev 分布分散、水準4 に確定） |
| 反映先明確度 | 4/5 | 再現手法（Promise.all 模倣）と対処（bounded retry）が確立済み |
| 自動化適性 | 4/5 | bounded retry パターンは適用済み・横展開容易（Jev 分布 0.81） |
| プロジェクト固有知識再利用性 | 4/5 | Windows 開発の定番環境知見 |
| 再発可能性 | 4/5 | 同型新規実装時に高頻度で再発（Jev 分布 0.66） |
| 費用対効果 | 4/5 | パターン適用は低コスト |
| **加重合計** | **29/40** | Jev 検証済み（observation 20261002T155542Z-cd77） |

- **推奨処分案**: 4 project knowledge（対照プローブによる環境起因実証手法と bounded retry パターンの知識文書化。backlog-review の利用者承認後に docs/knowledge/ へ直接保存される候補）

#### エントリ一覧
- 2026-10-02 case-run（PR #3325）: 対照プローブで環境起因実証（旧6/20・新5/20） [inbox]
- 2026-10-02 case-run（PR #3329）: Promise.all 模倣再現・bounded retry 対処で完結 [inbox]

### 問題クラス6: 構造移設の追随漏れ（PC-6）

- **根本原因**: 構造移設（src/opencode → src/common 等）は走査先・baseline・除外定義・文言・fixture・test 内部パス参照を多点で変えるが、追随が部分的になり pre-existing fail・走査漏れ・構文破損として残る
- **再発条件**: 構造移設を伴う変更で追随対象の横断検索（src + scripts/self、検索語バリエーション含む）を行わない場合
- **予防策**: (a) 走査先変更は baseline・除外定義・文言の 3点セット同時変更、(b) 一括置換後は対象 fixture 全実行（構文実行）で検出、(c) 移設系 Issue の完了条件に src + scripts 横断の旧パス検索を含める

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件 |
| 影響度 | 3/5 | pre-existing fail 混入・検証難航 |
| 横展開性 | 3/5 | 次回構造移設時・大規模 rename 時 |
| 反映先明確度 | 4/5 | checker 実行契約・test_strategy 規約が具体的 |
| 自動化適性 | 3/5 | 参照切れ検出の範囲拡張は自動化可 |
| プロジェクト固有知識再利用性 | 3/5 | 移設系作業の実務手順 |
| 再発可能性 | 3/5 | 次回移設時は高、頻度は低 |
| 費用対効果 | 4/5 | 手順の明文化は低コスト |
| **加重合計** | **26/40** | |

- **推奨処分案**: 4 project knowledge（3点セット・fixture 全実行・横断旧パス検索の手順知見。docs/knowledge/ 直接保存候補。検出範囲拡張の実装判断は req-define への情報候補として付記）

#### エントリ一覧
- 2026-10-02 case-run（PR #3326）: 走査先変更 3点セット [inbox]
- 2026-10-02 case-run（PR #3327）: third-party-sync-contract.test.ts 旧正本参照（移設追随漏れ・Jev 判定で PC-2 から移動） [inbox]
- 2026-10-02 case-close（PR #3332）: scripts/self 配下の旧構成前提残存 [inbox]

（注: PR #3326 一括置換構文破損は Jev 先行評価（単独 0.70）により移設に依存しない編集手法の知見として U18 へ独立）

### 未分類（単発 17 単位）

8軸は代表軸の要点のみ記載（全軸の根拠は各エントリ本文）。

| 単位 | エントリ | 8軸要点 | 推奨処分案 |
|---|---|---|---|
| U1 | #3252 verify-only closure 前の RA 実測確認 | intake item 2026-09-30-3252-delegation-context-realization-state-mismatch.md として回収済み（本文明記・inbox 実在確認済み） | duplicate |
| U2 | #3252 checker node vs bun 実行経路 | 20/40。checker-execution-contracts.md「安定実行経路」が node 標準/bun 例外の枠組み所有、require 未定義の実機制約明記は無し | 5 既存対策の更新（実機制約の追記候補・軽微） |
| U3 | RU-0147 search トークン正規化不一致 | 23/40。偽陰性（空の成功応答）で重複生成リスク。issue-operation-safety.md search 節への追記候補が具体的 | 5 既存対策の更新 |
| U4 | #3278 link profile worktree zero-targets | 21/40。REQ-018 worktree fallback 契約の適用事例。checker 出力 guidance 改善候補 | 6 deferred（軽微・REQ-018 適用事例の観察記録） |
| U5 | REQ-036-021「高確信度」語彙の現行性 | 16/40。将来確認候補の記録のみ | 6 deferred |
| U6 | #3289 traceability sidecar 重複制約 | 23/40。sidecar authoring 手順への事前確認手順追記候補。前回 deferred の sidecar 集約観測（9/29 #3233）と統合判断は backlog-review 側 | 5 既存対策の更新 |
| U7 | #3300 IR-072 Wave merge 起因の既存起因 | 21/40。Epic Wave 運用の観察。IR-072 false_positive_risk 追補候補 | 6 deferred |
| U8 | #3300 worktree build:engine vendor 書き出し | 20/40。plugin README 注意書き候補・src 不変で実害なし | 6 deferred |
| U9 | #3302 missing-design 3段判定 | 23/40。check-interpretation.md への 3段判定追記候補が具体的 | 5 既存対策の更新 |
| U10 | #3303 旧語彙検索 0件の縮約判定 3段判定 | 20/40。AG-006 運用補助。担当 (OU-0008) へ記録済み | 6 deferred |
| U11 | #3304 robocopy /MIR による残存掃除 | 24/40。worktree-operations.md 削除手順への追記候補。手順が具体的（空 dir + robocopy /MIR + 残存検証） | 5 既存対策の更新 |
| U12 | #3311 MSYS パスの静かな空走査 | 25/40。traceability SKILL.md 実行前提に MSYS 形式の事故像追記候補（実測: 既存節は相対パスのみ）。偽 fail から構成誤差し戻しの誘発リスク | 4 project knowledge（Jev 判定採用。fix gap 性も付記） |
| U13 | #3314 generate_indexes 散文言未更新 | 24/40。REQ 新設 Definition PR で2回連続発生。generate_indexes 更新範囲拡張 or checker 案内文の判断候補 | 5 既存対策の更新 |
| U14 | #3325 ADF-COVERS 全角括弧パーサ | 24/40。宣言書式規約（ID 列挙のみ）の明文化候補 | 5 既存対策の更新 |
| U15 | #3327 AG-005 description budget 超過傾向 | 20/40。budget 再設定は後続 Case 対象・観察 | 6 deferred |
| U16 | #3330 PowerShell 補間 `${t}:${rel}` | 22/40。PowerShell テスト手順への注意追記候補。Parser 検査前段の有効性 | 6 deferred（Jev 判定採用。既存手順書の実在未確認のため fix gap と断定せず） |
| U17 | #3332 runner 能力欠落の fail-closed 検出 | 25/40。存在チェックと能力検証の分離パターン（設計原則）。同型実装への横展開価値 | 3 恒久契約候補（Design）（Jev 判定採用 0.62） |
| U18 | #3326 multi-line fixture 一括置換の構文破損 | 22/40。移設に依存しない編集手法リスク。置換後 fixture 全実行で検出。Jev 判定で PC-6 から独立 | 6 deferred（出現1回・知識文書化の反復要件未達。再発時に知識化） |

## promote 時prune結果

- **対象エントリ数**: 40件（inbox 36 + deferred 判定対象 4）
- **prune実施**: deferred.md から 3件除去（STEP-6 実施）
  - 1567（2026-09-04 stash pathspec 誤 pop）: duplicate（PC-4）として除去。判定根拠は本 report PC-4 節に記録済み
  - 2199（2026-09-18 Definition 変更テスト期待文言陳腐化）: staged（PC-2）として除去。証拠は promoted/existing-measure-update-test-expectation-sync-gate.md「元learning item / 根拠」に保存
  - 2278（2026-09-19 spawn 固定 timeout flaky）: staged（PC-3）として除去。証拠は promoted/existing-measure-update-spawnsync-test-timeout.md「元learning item / 根拠」に保存
  - 2299（2026-09-19 release fixture 文言一致）: 残留（今回の判定対象外・living pool 継続）
- **inbox.md クリア**: 36エントリ全振り分てい完了（promoted 所属 26・deferred 移行 8・duplicate 2）によりヘッダーのみにクリア
- **prune却下**: なし

## 全体傾向

- **高頻出・高影響の問題クラス**: PC-1（gh exit 66 起動環境劣化、7件・31/40）が最大。観測は 9/30〜10/1 に集中し、harness serve の劣化サイクルが運用妨害の主因として定着しつつある。PC-2（テスト期待値同期漏れ、5件・31/40）も構造的に反復
- **横展開性が高い問題クラス**: PC-2（文言 pin テスト全般）・PC-3（spawn 系テスト全般）・PC-5（Windows 原子的書込み全般）
- **自動化適性が高い問題クラス**: PC-2（gate 検出契機拡張）・PC-5（bounded retry）・U13（索引更新範囲拡張）
- **全体的な観察所見**: (a) REQ-093 既知事象の観測蓄積が learning inbox の最大系統を形成、known-issues 節への体系的追補が有効。(b) pre-existing fail の由来分類（対照実行・baseline 比較）が検証運用に定着しつつあり、知識文書・手順化の価値が高い。(c) 構造移設（src/common 化）由来の追随漏れが新系統として出現（PC-6 に #3327 を含む・U6・U8）、移設完了後の横断検索手順の知識化が有効

## deferred 反映先実在性確認（STEP-3 手続き4・adversarial-review A6 反映）

判定対象とした deferred 候補 4件の `想定反映先` について実測確認した。全候補の反映先が実在するため、現行化・廃棄（prune）への処理は不要。

| deferred エントリ | 想定反映先 | 実測結果 |
|---|---|---|
| 2026-09-04 stash pathspec | agentdev-git-worktree skill の git 操作知識 | worktree-operations.md 実在（git stash 関連 15 箇所・「git stash 運用手順」節あり） |
| 2026-09-18 テスト期待文言陳腐化 | REQ-019 影響範囲検出 gate、case-open/case-ready Definition 品質検査 | check_test_impact.ts 実在（.opencode/skills/repo-agentdev-integrity/scripts/） |
| 2026-09-19 spawn 系固定 timeout | repo-agentdev-integrity scripts（timeout 方針見直し） | .opencode/skills/repo-agentdev-integrity/scripts/ 実在・check_integrity.test.ts 実在 |
| 2026-09-19 release fixture 文言一致 | scripts/self/release（fixture 運用） | scripts/self/release/ 実在（case-ready-definition-readiness.test.ts 等 8 ファイル） |

## Decision候補除外記録

- **対象item**: 全判定単位（PC-1〜PC-6・U1〜U17）
- **除外理由**: 技術判断不在（本報告の知見は運用手順・既知事象の追補・知識文書化が主体で、アーキテクチャ上の決定・技術選定を含まない。agentdev_gh 自動 respawn の導入検討〔PC-1〕は技術選定の性質を持つが、実現判断・実現先は req-define → case 経路の調査後に確定されるべきであり learning 段階では Decision 候補として確定しない）
- **根拠事実**: 各エントリの Decision/REQ/spec影響フィールドがすべて「なし」と記録。予防策は手順追記・checker 改善・運用周知が主体
- **代替反映先候補**: REQ-093 関連 reference（PC-1）、REQ-019 gate 関連 Design/checker（PC-2）、check_integrity.test.ts（PC-3）、docs/knowledge/（PC-5・PC-6・U17）、各 skill reference（U2/U3/U9/U11/U12/U14/U16）
