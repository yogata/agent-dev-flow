# 評価レポート

## メタデータ
- **実行日時**: 2026-06-07 (JST)
- **対象エントリ数**: 11件（inbox: 3件, archive: 8件）
- **問題クラス数**: 5（未分類含む）

## 問題クラス一覧

### 問題クラスA: Wave間スコープ横断検証不足

- **根本原因**: 複数の独立した変更スコープ（Wave/PR/Issue）間で、横断的な残存参照検索・整合性確認が実行されない。各スコープは自身の変更に集中し、全体整合性の確認が遅延する
- **再発条件**: 複数Wave/PRが同じファイル群を変更し、各スコープが独立して参照更新を行う場合
- **予防策**: Wave/PR完了時に廃止対象キーワードの全文検索を定型チェックとして組み込む。コマンド廃止・namespace変更時は廃止名をチェックリスト化して境界で検証する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（inbox #1, archive #4） |
| 影響度 | 3/5 | 追加コミットで修正可能だが、見落としリスクあり |
| 横展開性 | 4/5 | 複数Wave構成のEpic全般で発生し得る |
| 反映先明確度 | 4/5 | workflow-orchestration Wave完了時チェック、case-run guardrails |
| 自動化適性 | 4/5 | 廃止キーワード全文検索はgrepで自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | Wave設計パターンとして汎用的 |
| 再発可能性 | 4/5 | 複数Wave構成で継続的に発生しやすい |
| 費用対効果 | 5/5 | grep1行追加で高い予防効果 |
| **加重合計** | **29/40** | |

- **推奨処分案**: 既存 command/skill へ反映。case-run の spec compliance sweep を強化、workflow-orchestration にWave境界検証ステップ追加

#### エントリ一覧
- Epic Orchestrator の Wave間変更漏れパターン [inbox]
- spec compliance sweep で直接矛盾リスト外の古い参照を検出 [archive]

### 問題クラスB: command/skill定義のパス参照明確性不足

- **根本原因**: command定義内のテンプレート参照が暗黙的（skill名のみ）で、runtime path が明示されていない。また integrity-check のパス解決が cross-skill 参照で false positive を出す
- **再発条件**: command定義がテンプレート参照をskill名のみで記述し、runtime pathを明示しない場合。cross-skill参照で相対パス解決ルールが不明確な場合
- **予防策**: command定義のテンプレート参照は必ずruntime path（`.opencode/...`）を明示する。integrity-checkでruntime path誤参照を検出

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（inbox #2, archive #1） |
| 影響度 | 3/5 | バグ発生、修正に手間がかかる |
| 横展開性 | 5/5 | 全command/skill定義に適用される問題 |
| 反映先明確度 | 5/5 | command-authoring + artifact-contracts.md + REQ-0108 |
| 自動化適性 | 4/5 | integrity-check（REQ-0108-169/170）で検出可能 |
| プロジェクト固有知識再利用性 | 3/5 | プラグインアーキテクチャの知見として汎用 |
| 再発可能性 | 3/5 | 規約浸透で低下するが、新規作成時はリスク |
| 費用対効果 | 4/5 | 規約追加で予防可能 |
| **加重合計** | **29/40** | |

- **推奨処分案**: 既存 command/skill へ反映。command-authoring の品質基準にruntime path明示を追加、artifact-contracts.md SPEC更新

#### エントリ一覧
- runtime template path の暗黙参照が誤用を招くパターン [inbox]
- cross-skill 参照の false positive: path 存在検査の精度限界 [archive]

### 問題クラスD: subagent edit操作の安全性不足

- **根本原因**: subagentへの委譲時に、edit操作の安全性（oldString範囲の適切さ、連続edit時の関数破損リスク、大規模ファイルのタイムアウトリスク）が担保されていない
- **再発条件**: (1) 入れ子関数を持つファイルの連続edit、(2) 1000行超のファイルを単一タスクに委譲、(3) subagentがコンテキスト理解に時間を要する
- **予防策**: (1) edit後にRead tool で該当関数全体を確認する手順、(2) 大規模ファイルは分割して並列委譲、(3) 機械的置換はAST-grepやedit toolで直接実行

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（archive #2, archive #8） |
| 影響度 | 4/5 | 関数定義破損・タイムアウトで大きな手戻り |
| 横展開性 | 4/5 | subagent利用全般に適用 |
| 反映先明確度 | 4/5 | workflow-orchestration サブエージェントprotocol |
| 自動化適性 | 3/5 | edit後Read検証は手順化可能だが完全自動化は困難 |
| プロジェクト固有知識再利用性 | 3/5 | 委譲パターンとして汎用的 |
| 再発可能性 | 4/5 | 大規模ファイル操作で継続的に再発 |
| 費用対効果 | 4/5 | 手順追加・分割委譲で予防可能 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 skill へ反映。workflow-orchestration のサブエージェントprotocol にedit安全手順・大規模ファイル分割委譲ガイダンスを追加

#### エントリ一覧
- サブエージェントの連続editによる関数定義破損（Wave 3 #586） [archive]
- 大規模テストファイル(2700+行)の修正委譲でタイムアウト発生 [archive]

### 問題クラスF: SKILL.md品質ガバナンス不足

- **根本原因**: スキルファイルの品質基準（行数閾値、フォーマット規約）が明確でなく、SKILL.mdの肥大化や表記不統一が放置される
- **再発条件**: スキル内容を継続的に追加・拡充する運用で、lint基準がない場合
- **予防策**: (1) 行数超過時の references/ 抽出ルール明確化、(2) USE FOR / DO NOT USE FOR の表記規約決定と適用

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（archive #5, archive #6） |
| 影響度 | 2/5 | 品質低下だが機能障害ではない |
| 横展開性 | 4/5 | 全スキルに適用される問題 |
| 反映先明確度 | 4/5 | skill-authoring に反映先が明確 |
| 自動化適性 | 5/5 | integrity-check で既に検出済み |
| プロジェクト固有知識再利用性 | 2/5 | スキル運用の品質管理手法 |
| 再発可能性 | 4/5 | スキル拡充で継続発生 |
| 費用対効果 | 4/5 | integrity-check既存で対応可能 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 既存 skill へ反映。skill-authoring の品質基準に行数上限・フォーマット規約を追加

#### エントリ一覧
- SKILL.md 行数超過 — agentdev-no-ai-slop-writing (542行) [archive]
- USE FOR / DO NOT USE FOR の専用セクション不足（17/21スキル） [archive]

### 未分類

単独エントリ（最小クラスタサイズ2未満のため未分類）:

- **C: 複数Wave同一ファイル競合** — Squash merge conflict resolution: check_integrity.ts 統合パターン [inbox] — 根本原因: W1とW2が同じ関数を異なる抽象レベルで改善。予防策: Wave設計時にファイル変更重複を検出し、後続Waveのbranchを先行に基づかせる
- **E: baseline/分類体系の事前整合性確認不足** — baseline分類の乖離と解決 [archive] — 根本原因: baseline作成時の分類が先行REQより細かく設計。予防策: baseline作成時にREQ定義との整合性チェック
- **G: コミット前ファイル有効性検証不在** — スクリプトエンコーディング破損が HEAD にコミットされている [archive] — 根本原因: ビルド・コミットパイプラインでTypeScriptファイルの有効性チェックがない。予防策: pre-commit hookでの構文検証

## promote 時prune結果

- **対象エントリ数**: 0件
- **prune実施**: なし
- **prune候補**: 0件
- **prune却下**: 0件

## 全体傾向

- **高頻出・高影響の問題クラス**: クラスA（Wave間横断検証、29/40）、クラスB（パス参照明確性、29/40）、クラスD（subagent edit安全性、28/40）が上位3クラスタ
- **横展開性が高い問題クラス**: クラスB（5/5: 全command/skillに適用）、クラスA/D/F（4/5: Wave設計・subagent・全スキルに適用）
- **自動化適性が高い問題クラス**: クラスF（5/5: integrity-check既存）、クラスA/B（4/5: grep・integrity-checkで対応）
- **全体的な観察所見**: Wave境界の品質管理、command/skill定義の厳密性、subagent委譲の安全性が主要テーマ。いずれも既存 command/skill への追記で対応可能であり、新規作成より既存反映が適している
