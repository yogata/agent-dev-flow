# 評価レポート

## メタデータ

- **実行日時**: 2026-09-30（backlog-auto stage 2 learning 系統）
- **対象エントリ数**: 11件（inbox: 11件〔Cases #3233×4・#3236×4・#3239×3〕、deferred: 138件〔見出し計測〕）
- **正規化適用**: Case #3236・#3239 由来 7件は本文13フィールド形式。Case #3233 由来 4件は箇条書き形式（旧形式相当として解析時マッピング適用、元ファイル不変）
- **deferred.md 読込**: 2フェーズ実施（第1フェーズ＝インデックススキャン138エントリ、第2フェーズ＝直近40見出し＋タグ・トークン一致候補の本文読込）。3類型フォールバック該当なし
- **前回実行（2026-09-28）の状況**: promoted/ は空（前回採用済み成果物は backlog-review が RU 化して消費済み）。前回 report は bc4c0c63 で確認
- **Jev 先行評価**: 実施（6評価6観測: 問題クラス分類1・8軸評価3・廃棄判定1・昇華可能性1。各 evaluate 後に判断確定し observation_write 反映済み）
- **実行範囲**: STEP-1〜STEP-5（本レポートに STEP-4 review 結果と STEP-5 判定確定を含む）。STEP-6 永続化・STEP-7 報告は orchestration 実行

## 問題クラス一覧

多エントリ問題クラス（最小2エントリ）は形成されなかった。U1（bun test フル suite 実測による timeout 標準の裏付け）と U8（環境依存 fail の base 再現確認）の帰属を Jev 評価に付したが、根本原因（実測確認の観測 vs 環境性能差による fail と分類手順の欠如）・再発条件・予防策がすべて同じとは言えず、両者とも単独扱い（観測 20260929T172148Z-9039、判断一致）。

### 未分類（単独エントリ11件）

| # | エントリ（inbox） | 8軸合計 | 処分区分 | 既存対策照合（実測） | 昇華可能性 | HITL |
|---|---|---|---|---|---|---|
| 単独1 | REQ-060-007 timeout 300〜600秒標準の実測裏付け（bun test フル suite 197.77〜235.88秒、#3233） | **18/40** | rejected（7） | あり・match（REQ-060.md L22 が 300〜600秒指定を規定済み。追加変更不要） | 低 | 自律確定可能 |
| 単独2 | worktree 配布物編集の gate 語彙制約と traceability sidecar 集約の運用実績（9 sidecar 更新・1 新規、#3233） | **23/40** | deferred（6） | あり・部分match（distribution boundary・IR-055 gate は機構化済み、sidecar 集約規則は deferred 既存エントリ〔L2576〕が保有。残差は実績数値のみ） | 低〜中 | 自律確定可能 |
| 単独3 | git 履歴依存 checker（IR-072 等）の commit 前後実測変化と検証記録への実測局面明示（#3233） | **24/40** | duplicate（+） | あり・match（checker 側は frontmatter のみ commit 除外で恒久対応済み e7f1f639・REQ-032-030 が merge 直前 HEAD 実施を規定・同一知見の Design 記載候補は intake item 2026-09-29-3233-checker-execution-contracts-lifecycle-notes 候補2として処理中） | 低 | 自律確定可能 |
| 単独4 | case-close の Design 状態評価による Design 本体への経緯追記は merge 前に PR へ含める規律（#3233） | **19/40** | deferred（6） | あり・match（docs-and-design-promotion.md が PR マージ前の Design 確定フローを規定済み。merge 後追記分は intake 回収済み。残差は経路限定の説明知識） | 低 | 自律確定可能 |
| 単独5 | copyTree 型再帰コピーの skip 判定は root 起点の相対パスで行う（TS-005 配布検査 4 fail→修正 8 pass、#3236） | **30/40** | project knowledge（4） | なし（当該判断基準をカバーする恒久契約・知識なし〔実測確認〕。根本原因・再発条件・予防策・テスト方針が自足的に記録済み） | 高 | ユーザー判断必要 |
| 単独6 | 同一 worktree・同一ブランチへの複数サブエージェント並行委譲は二重実装競合を生む（#3236） | **25/40** | deferred（6） | あり・部分match（case-auto SKILL.md L90 の委譲前重複実行時検出〔変更対象ファイル集合重複検出・一時直列化〕と worktree-operations.md 同一ファイル複数 edit 規律で大部分を機構化済み。残差は durable state 帰属確認の運用実践で契約変更なし） | 低〜中 | 自律確定可能 |
| 単独7 | PowerShell 5.1 実行経路の案内文言は ASCII 限定が安全（#3236） | **29/40** | 既存対策の更新（5） | あり・fix gap（docs/knowledge/windows-powershell-bulk-io-corruption.md に表示文言 ASCII 制限は未記載〔grep 実測: ASCII/文言/案内 0件〕。AGENTS.md の PowerShell 一括読み書き禁止規律と同根） | 高 | ユーザー判断必要 |
| 単独8 | 環境依存 fail の分類は base 再現確認を証跡として残す（#3236） | **30/40** | project knowledge（4） | なし（REQ-060 bun test 実行形態に fail 分類・base 再現手順なし〔grep 実測: 分類/base/再現 0件〕。QG 検証手順にも未整備） | 高 | ユーザー判断必要 |
| 単独9 | 検証スクリプト内の gh コマンド文字列リテラルは write guard が誤検出する（#3239） | **29/40** | 既存対策の更新（5） | あり・fix gap（worktree-operations.md「書込み guard 運用指針」節に gh リテラル誤検出事例と regex 抽出＋定数比較構成は未記載〔grep 実測〕。guard の fail-closed 維持原則は既存） | 高 | ユーザー判断必要 |
| 単独10 | bun install 済み worktree の git worktree remove は Filename too long で部分削除になる（#3239） | **26/40** | 既存対策の更新（5） | あり・fix gap（worktree-operations.md に junction 系の手順は既存だが MAX_PATH 超過 node_modules 深階層ケースと prune→fs.rmSync recursive フォールバックは未記載〔grep 実測〕） | 中〜高 | ユーザー判断必要 |
| 単独11 | main 側に帰着した Jev 観測 untracked ファイルは hash 同一性証明後に削除して pull で復元する（#3239） | **29/40** | 既存対策の更新（5） | あり・fix gap（case-close STEP-6-3-1〔cleanup-and-capture.md L105-108〕は「検出時は構造化エラー停止・ユーザー対応」のみで hash 同一性証明による解消手順は未記載〔grep 実測〕） | 高 | ユーザー判断必要 |

## STEP-3 処分判定サマリ

| 判定単位 | スコア | 処分区分候補 | HITL 推奨 |
|---|---|---|---|
| 単独1 | 18/40 | rejected（7） | 自律確定可能 |
| 単独2 | 23/40 | deferred（6） | 自律確定可能 |
| 単独3 | 24/40 | duplicate（+） | 自律確定可能 |
| 単独4 | 19/40 | deferred（6） | 自律確定可能 |
| 単独5 | 30/40 | project knowledge（4） | ユーザー判断必要 |
| 単独6 | 25/40 | deferred（6） | 自律確定可能 |
| 単独7 | 29/40 | 既存対策の更新（5） | ユーザー判断必要 |
| 単独8 | 30/40 | project knowledge（4） | ユーザー判断必要 |
| 単独9 | 29/40 | 既存対策の更新（5） | ユーザー判断必要 |
| 単独10 | 26/40 | 既存対策の更新（5） | ユーザー判断必要 |
| 単独11 | 29/40 | 既存対策の更新（5） | ユーザー判断必要 |

- **内訳**: promote 候補 6単位（単独5・7・8・9・10・11＝inbox 6エントリ分）、deferred 候補 3単位（単独2・4・6＝inbox 3エントリ分）、duplicate 1件（単独3）、rejected 1件（単独1）
- **該当 deferred エントリ（duplicate）集計**: 0単位（近縁: 単独2↔deferred L2576「トレーサビリティ対応宣言は未宣言の artifact のみを新規 sidecar に集約」、単独6↔case-auto 委譲前重複実行時検出）

## Decision 候補除外記録

禁止条件フィルタリングゲートを全11判定単位に適用。**恒久契約候補（Decision）への昇華対象は 0件**。

- 単独1〜4・6（実測裏付・運用実績・規律確認の記録）→ 除外理由: **運用ルール**。代替反映先: REQ-060・case-close workflow reference・deferred（living pool）
- 単独5・8（util 実装判断基準・fail 分類手順）→ 除外理由: **技術判断不在（手続知見）**。代替反映先: docs/knowledge/ 知識文書候補
- 単独7・9・10・11（文言規律・検証構成・削除フォールバック・同期解消手順）→ 除外理由: **運用ルール**。代替反映先: docs/knowledge/・worktree-operations.md・case-close cleanup reference

## Jev 先行評価の適用記録（REQ-090-004）

| 判断単位 | 観測ID | 最終判断との差異 |
|---|---|---|
| 問題クラス分類（U1/U8 帰属） | 20260929T172148Z-9039 | なし（両者単独・未分類で一致） |
| 8軸評価（単独1〜4） | 20260929T172244Z-485c | u3-費用対効果 5→3（semantic_disagreement: 対応済み・intake 処理中で追加投資対象が残存しない） |
| 8軸評価（単独5〜8） | 20260929T172458Z-662f | なし |
| 8軸評価（単独9〜11） | 20260929T172557Z-2123 | なし |
| 廃棄判定（全11単位） | 20260929T173122Z-0e14 | 4件（単独4 rejected→deferred〔semantic_disagreement: coverage match の残差知識は前回実行前例どおり deferred 保持〕、単独5 Design→project knowledge〔同: 再利用判断知識でありシステム事実の固定でない〕、単独6 更新→deferred〔同: 既存機構で大部分カバー・出現1回の運用実践〕、単独8 Design→project knowledge〔同: 手続知見は判断知識〕） |
| 昇華可能性（全11単位） | 20260929T173230Z-27bc | なし（単独5・7〜11 のみ昇華可能で一致） |

## STEP-4 adversarial-review 結果（2026-09-30 実施）

**発動条件判定**: 発動。evaluation-report.md 反映済み、skip 条件非該当（inbox 11件、1件のみでもなく空でもない。単独1・3は重複確実だが全体の廃棄判定確定ではない）。Jev 評価 20260929T173655Z-b3fd（発動 true・判断一致）。不可逆処理は未実行であることを確認済み。review は in-context（Orchestrator・Reviewer・Reviewee 3論理役割、初期 challenge 2系統）で実施した。

**動的レビュー戦略**: (1) 処分判定の過小・過大昇格（prune による情報喪失／promote 過剰）、(2) 既存対策照合の実測妥当性、(3) 分類（単独扱い・クラス形成漏れ）、(4) 8軸スコアと処分の整合、(5) Jev 差異是正4件の妥当性、を疑点軸として設定。

**findings**:

- A-1（成果物生成時反映）: 単独6 の deferred 追記行に近縁相互参照（case-auto SKILL.md 委譲前重複実行時検出・worktree-operations.md 同一ファイル複数 edit 規律への明示参照と「統合判断は次回再評価で実行」注記）を含め、次回再評価での統合判断を可能にする
- A-2（成果物生成時反映）: 単独5 の採用済み成果物「対象範囲」に、当該知見が特定スクリプト（textlint-guard-distribution.test.ts）固有でなく再帰コピー・再帰列挙 util 全般の判断基準である旨を明記する（単一スクリプトの技術的詳細への矮小化を防ぐ）
- 確認1: 単独4 の rejected→deferred オーバーライドは「前例のみ」でなく、merge 後追記の経路限定という説明知識が既存配布物のどこにも明文化されていない事実（残差価値）に根拠があることを確認
- 棘却1: 単独1 を rejected とすると実測値（197.77〜235.88秒）が pool から失われる → 棘却。PR #3235 本文および本レポートの git 履歴に記録が保持され、deferred の近縁実測系エントリ（2026-09-14 bun test フル suite 関係）も残存する
- 棘却2: 単独3 の duplicate は intake item が inbox 未処理であり reject される可能性がある → 棘却。intake 経路の処理は intake-promote/backlog-review の責務で、learning 側の二重保持は契約なし。仮に intake 側で reject されても REQ-032-030 と恒久対応コード（e7f1f639）が残る
- 棘却3: Case #3239 の3件（単独9・10・11）を「case-close 運用障害の回復手順」クラスへ統合すべき → 棘却。根本原因（guard パターンマッチ構造 / MAX_PATH 制約 / 書込先 root 契約と PR commit の組合せ）がすべて異なる機構で、予防策もそれぞれ別
- 棘却4: 単独10（26/40）の promote は過剰 → 棘却。worktree-operations.md 削除失敗系 fallback への追記で junction 系と同形式、fix gap は実測確認済み、前回 promote 最低水準（25/40）と同等。HITL でユーザーが制御可能

**ループ離脱**: A-1・A-2 の反映は deferred 追記様式と成果物対象範囲記載の補強であり、分類・スコア・処分区分の意味内容は不変。再 review 発動条件（新たな本質的争点）非該当。停止条件（新 finding なし・全 finding 処理済み）を満たし離脱。unresolved 残存なし。

## STEP-5 判定確定

**自律確定 5単位**（取得可能な根拠から処置を一意に確定できるもの。ユーザー承認なしで確定）:

| 単位 | 処分 | 主な根拠 | HITL 不要理由 |
|---|---|---|---|
| 単独1 | rejected | 18/40。REQ-060-007 が 300〜600秒標準を規定済み（L22 実測確認）で追加変更の対象が残存しない | 既存恒久契約で十分対応済み。昇華根拠なし（Jev rejected 0.82・昇華不能 0.94 一致） |
| 単独2 | deferred | 23/40。両 gate 機構化済み・sidecar 集約規則は既存。残差は実績数値のみの断片 | 情報断片で昇華の余地なし。deferred 維持以外の処置に根拠なし |
| 単独3 | duplicate | 24/40。恒久対応済み（e7f1f639）+ REQ-032-030 + intake item 候補2で処理中 | 同一知見が既存対策と intake 経路で二重に保持済み。learning 側の保持は不要 |
| 単独4 | deferred | 19/40。PR マージ前フロー規定済み・追記分は intake 回収済み。残差は説明知識のみ | 既存フローで機能した観測記録。低スコア・低影響。deferred 保持が前回前例と整合 |
| 単独6 | deferred | 25/40。委譲前重複実行時検出・edit 規律で大部分機構化済み。残差は運用実践1回 | 既存機構の補完観察。契約変更なし。次回再評価で出現頻度確認（A-1 反映） |

**HITL 対象 6単位**: 単独5（project knowledge）・単独7・9・10・11（既存対策の更新）・単独8（project knowledge）— promote 昇格の承認に意味判断を含むため、ユーザー承認を求める（提示実施、承認待ち）。
