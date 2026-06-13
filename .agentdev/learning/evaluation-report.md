# 評価レポート

## メタデータ
- **実行日時**: 2026-06-14 00:00
- **対象エントリ数**: 6件（inbox: 1件, archive: 5件）
- **問題クラス数**: 0（全エントリ単独 → 未分類）

## 問題クラス一覧

（2件以上のエントリから成る問題クラスは不存在。全エントリが異なる根本原因・再発条件・予防策を持つため、未分類に振り分け。）

## 未分類

### エントリ1: integrity-rule-catalog SPEC の追記 lag [inbox]

- **正規化元形式**: 旧3フィールド（コンテキスト/学び/再発防止）
- **正規化後**:
  - **問題事象**: REQ-0108-244 APPEND時に `docs/specs/integrity-rule-catalog.md` への新規 catalog entry 追加を漏らした
  - **発生局面**: req-save 実行時（REQ-0108 への APPEND 操作）
  - **検知方法**: 事後確認（自律検出）
  - **根本原因**: REQ-0108 への新規要件 APPEND は catalog entry 追加とセットで行う必要があるが、req-save にその連動更新の確認ステップが存在しない。catalog は REQ-0108-150/151 時点の定義が基準であり、以降の APPEND 分は手動追記が必要
  - **自律対応内容**: （記載なし）
  - **ユーザー確認の有無**: （記載なし）
  - **ADR/REQ/spec影響**: REQ-0108, `docs/specs/integrity-rule-catalog.md`
  - **横展開観点**: 他の SPEC（artifact-contracts.md, integrity-contracts.md 等）でも REQ APPEND 時の連動 SPEC 更新が必要なものがある可能性
  - **再発条件**: req-save で REQ-0108 に新規要件を APPEND する際
  - **予防策候補**: req-save で REQ-0108 に APPEND する際、integrity-rule-catalog.md の該当 entry 有無を確認ステップに含める
  - **想定反映先**: req-save command
  - **関連**: REQ-0108-244, integrity-rule-catalog.md

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（今回初めて記録） |
| 影響度 | 3/5 | catalog entry 欠落 → integrity 検査の対象漏れ → ドキュメント整合性の盲点。致命的ではないが手戻り発生 |
| 横展開性 | 4/5 | REQ APPEND → SPEC 連動更新パターンは他 SPEC でも発生し得る汎用パターン |
| 反映先明確度 | 4/5 | req-save command の Step 4〜7 付近に確認ステップを追加すべきと明確 |
| 自動化適性 | 3/5 | req-save ステップへの組込は可能だが、catalog entry 有無の判断は半手動（新規ルールか既存かの判別が必要） |
| プロジェクト固有知識再利用性 | 4/5 | REQ-0108 と catalog の連動は本プロジェクト固有の技術的落とし穴として再利用価値が高い |
| 再発可能性 | 4/5 | REQ-0108 への APPEND は今後も継続的に発生。手動運用のため漏れやすい |
| 費用対効果 | 5/5 | ステップ1行の追加で、高リスク（検査対象漏れ）を低コストで防止可能 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command へ反映（Category 1）。req-save に REQ-0108 APPEND 時の catalog entry 確認ステップを追加

#### 既存対策確認
- **確認結果**: 既存対策なし（gap あり）
- **該当ファイル**: `src/opencode/commands/agentdev/req-save.md`（catalog / integrity-rule への言及なし）
- **ギャップ分類**: fix gap（req-save に catalog entry 確認ステップが存在しない）
- **ギャップ詳細**: req-save Step 4 で REQ-0108 への APPEND を処理するが、対応する integrity-rule-catalog.md entry の有無を確認するステップが不在。Step 7（docs 変更整合性検証）も REQ 番号の連続性と frontmatter 一致のみで、SPEC 連動更新の検証を含まない

### エントリ2〜6: archive からの継続エントリ [archive]

以下のエントリは前回 promote で deferred 扱いとなり、archive/active.md に残置中。今回も新たなクラスタを形成しないため deferred を継続。

| # | タイトル | 移動日 | 前回判定 | 今回判定 |
|---|---------|--------|---------|---------|
| 2 | baseline分類の乖離と解決 | 2026-06-06 | deferred | deferred（継続） |
| 3 | スクリプトエンコーディング破損 | 2026-06-06 | deferred | deferred（継続） |
| 4 | Squash merge conflict resolution W1→W2 | 2026-06-07 | deferred | deferred（継続） |
| 5 | Epic Orchestrator Wave間変更漏れ | 2026-06-07 | deferred（継続） | deferred（継続） |
| 6 | runtime template path 暗黙参照 | 2026-06-07 | deferred（継続） | deferred（継続） |

※ 全エントリが記録から1週間未満（2026-06-14 現在）。内部分析フェーズ時 prune 基準（3ヶ月以上経過）に該当しないため prune 対象外。

## promote 時prune結果

- **対象エントリ数**: 1件（inbox entry のみ判定対象）
- **prune実施**: なし（inbox entry は staged 扱い → promoted artifact 生成後に archive から除去予定）
- **prune候補**: 0件（archive の deferred エントリは全て prune 非対象）
- **prune却下**: 0件

## 全体傾向
- **高スコア単発エントリ**: inbox の catalog 追記 lag エントリは加重合計 28/40 と高スコア。反映先が明確（req-save）で費用対効果も高く、即時 promote 推奨
- **横展開性の高いパターン**: 「REQ/SPEC 操作時の連動更新漏れ」は今回の catalog lag 以外にも、過去の archive エントリ（baseline分類乖離、runtime template path）で同種の「定義と実装の同期ズレ」が観察される。ただし根本原因が異なるため同一問題クラスとはならず、個別対応が適切
- **archive の蓄積**: deferred エントリが5件蓄積中。再発パターンの共通化が進めば将来クラスタ化する可能性あり。現時点では観察継続
- **ADR候補**: 本イテレーションでは ADR 候補なし（全エントリが command仕様・運用ルール・プロジェクト固有知識に分類）

## ADR候補除外記録
- **対象item**: integrity-rule-catalog SPEC の追記 lag
- **除外理由**: command仕様（command の手順・ガードレールの定義に該当）
- **根拠事実**: アーキテクチャ上の決定ではなく、req-save command の実行手順へのチェックステップ追加を求めるもの。技術的トレードオフを含まない
- **代替反映先候補**: req-save command
