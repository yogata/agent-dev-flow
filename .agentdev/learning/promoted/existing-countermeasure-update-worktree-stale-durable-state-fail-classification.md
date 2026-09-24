# worktree の旧 durable state 追随不足による疑似 fail の由来分類

## 背景

IR-055 baseline更新未追随で Expected 0 / Received 8。3点の証拠（単独再実行、分岐点 main root 再現、baseline差し替え同一テスト）で環境依存と確定。

## 問題

並行 sibling の main merge により baseline 系 durable state（IR-055 baseline・REQ 解消行等）が更新されても、分岐時点の旧 state のままの worktree で suite を実行すると delta guard・traceability check が「新規違反」と誤分類する

## 望ましい変更

由来分類3点（単独再実行 → baseline/分岐点の main root 再現確認 → baseline 差し替え同一テスト再実行〔検証後復元〕）、merge-base と時系列確認

## 対象範囲

### 対象

- qg-4-final-acceptance.md「fail 由来分類」節、worktree-operations.md の bun test 実行環境前提

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | qg-4-final-acceptance.md「fail 由来分類」節、worktree-operations.md の bun test 実行環境前提 | baseline 系 durable state の並行追随差と、baseline差し替え同一テスト再実行（検証後復元）の手順が未記載。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: qg-4-final-acceptance.md「fail 由来分類」節、worktree-operations.md の bun test 実行環境前提
- **ギャップ分類**: fix gap
- **ギャップ詳細**: baseline 系 durable state の並行追随差と、baseline差し替え同一テスト再実行（検証後復元）の手順が未記載。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: worktree の旧 durable state 追随不足による疑似 fail の由来分類
- **根拠**: IR-055 baseline更新未追随で Expected 0 / Received 8。3点の証拠（単独再実行、分岐点 main root 再現、baseline差し替え同一テスト）で環境依存と確定。
- **再発条件**: evaluation-report の問題クラス6および原エントリを参照
- **横展開可能性**: baseline 系 durable state を持つ全検査

### 原エントリ（証跡）

### Inbox 原文 1

## worktree での bun test 3-split 実行は並行マージによる IR-055 baseline 更新の未追随で delta guard 疑似 fail を出す（由来分類は baseline 再現確認で機械確定）

- **問題事象**: case-close の full integrity suite（bun test 3-split）を PR HEAD worktree で実行したところ、IR-055 delta guard（配布物に新規 delta 違反なし）が Expected 0 / Received 8 で fail。本 PR は docs guide のみ変更で配布物を変更していない
- **発生局面**: 実装（case-close STEP-3 full integrity suite。Case #3086 case-close 実行中）
- **検知方法**: 分割①の 1 fail（check_integrity.test.ts IR-055 delta guard）と違反 8 件の抽出（いずれも本 PR 未変更の配布物ファイル）
- **根本原因**: 並行 sibling case-close（Case #3085、main merge 610fafd5）が IR-055 baseline に 8 件を baseline-known 登録済みで、worktree HEAD は分岐時点の旧 baseline（generated_at 2026-09-15）のまま。worktree の追随不足により baseline-known 判定が効かず「new (delta from baseline)」と誤分類される
- **自律対応内容**: 3 点の証拠で環境依存と由来分類した。①単独再実行で再現（151 pass/1 fail）、②baseline commit（分岐点 b2e74364）の main root 変更ゼロ実行で 0 fail（152 pass）、③worktree の baseline を main 正規版へ一時差し替えた同一テストで 0 fail（152 pass、検証後復元）。由来不明 0 件で suite を受理
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 起点の integrity suite 実行では、並行 main 進行による baseline 系 durable state の追随差を fail 由来分類の前提に入れる。QG-4「durable state 上で解消済みの対象を本変更起因の失敗と誤判定しない」の実手順として baseline 差し替え再実行が決定的証拠になる
- **再発条件**: 並行セッションが IR-055 baseline（または同種 baseline 系ファイル）を更新した commit が main にマージした後、旧 baseline のままの worktree で delta guard を含む suite を実行した場合
- **予防策候補**: bun test 3-split の worktree 実行手順に、baseline 系 fail 発生時の由来分類手順（単独再実行 → baseline commit main root 再現確認 → baseline 差し替え再実行〔検証後復元〕）を明記
- **想定反映先**: agentdev-quality-gates references qg-4-final-acceptance.md「fail 由来分類」節、agentdev-git-worktree worktree-operations.md の bun test 実行環境前提
- **関連**: Case #3086、Case #3085（baseline 更新元 main merge 610fafd5）、.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json
- **タグ**: `#IR-055` `#baseline` `#worktree` `#由来分類` `#bun-test`

---

### Deferred 吸収元 1

## 2026-09-17: 実装 PR 分岐後に先行 merge された main 側解消行が case-close の全 corpus check で新規 missing に誤解釈され得る

- **問題事象**: 実装 PR の分岐以降に Definition Amendment（検証対応要否カタログ登録）や他 Case の解消 commit が先行 merge された状態で case-close を実行すると、PR HEAD worktree 起点の全 corpus traceability check で main 側で解消済みの行が「新規 missing-implementation / missing-verification」「unclassified」として列挙され、完了ゲートの誤差し戻しを招き得る。
- **発生局面**: case-close STEP-2 / STEP-3（Case #2908。PR #2927 は 6b35b5df 分岐、Amendment #2932 と AUTOGEN 修正 #2933 が先行 merge 済みの状態で再開）。
- **検知方法**: worktree 起点 check で REQ-057-034 の unclassified / missing-verification を検出。worktree vs main の reqId 集合差分に REQ-014-016、REQ-057-034/035/036、REQ-061-033 の4行が出現。
- **根本原因**: worktree vs main の全 corpus 差分の reqId 集合比較は「PR 変更起因の新規 missing」と「ブランチ分岐後の main 側後続解消（worktree だけが旧状態を保持）」を区別しない。
- **自律対応内容**: 既存契約（case-close の worktree root 起点再実行・カタログ登録 commit の時系列確認）に従い main 起点で check を再実行し、対象行の分岐前後関係を確認して誤差し戻しを回避。merge 後に main 起点で対象行 missing 0 / 0 を再検証して完了判定。
- **ユーザー確認の有無**: なし（既存契約内の運用）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 並行セッションで main が進む docs_chore PR の case-close 全般で再発し得る。worktree vs main 差分行は merge-base と main 解消 commit の時系列を確認してから「新規」判定する。coverage の `--req` は単一 ID のみ対応のため複数行確認は個別実行が必要。
- **再発条件**: PR 分岐後に main 側で対象 REQ 行のカタログ登録・宣言付与・他 Case 解消が入る場合。
- **予防策候補**: case-close references に「worktree vs main 差分行の分岐後 main 解消確認」手順を明記する候補。
- **想定反映先**: case-close references（issue-resolution-and-qg4.md、docs-and-design-promotion.md）。
- **関連**: Case #2908（Refs）、PR #2927（Refs）、PR #2932（Refs）。
- **タグ**: #traceability #case-close #parallel-execution #worktree
- **移動日**: 2026-09-18

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 6
- **確定処分**: 既存対策の更新 (category 5)
- **加重合計**: 25/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred 1件 |
| 影響度 | 3/5 | QG-4 完了判定の誤差し戻しリスク |
| 横展開性 | 3/5 | baseline 系 durable state を持つ全検査 |
| 反映先明確度 | 4/5 | qg-4 fail 由来分類・traceability 手順 |
| 自動化適性 | 2/5 | 手続的由来分類 |
| プロジェクト固有知識再利用性 | 4/5 | QG-4 運用の中核知識 |
| 再発可能性 | 4/5 | 並行 case-close / sibling merge が常態 |
| 費用対効果 | 3/5 | 手順追記で済む |

### 判定基礎（evaluation-report verbatim）

### 問題クラス6: worktree の旧 durable state（baseline・解消行）追随不足による疑似 fail の由来分類
- **根本原因**: 並行 sibling の main merge により baseline 系 durable state（IR-055 baseline・REQ 解消行等）が更新されても、分岐時点の旧 state のままの worktree で suite を実行すると delta guard・traceability check が「新規違反」と誤分類する
- **再発条件**: 並行マージ後に旧 baseline / 旧解消状態の worktree で delta guard や全 corpus check を実行した場合
- **予防策**: 由来分類3点（単独再実行 → baseline/分岐点の main root 再現確認 → baseline 差し替え同一テスト再実行〔検証後復元〕）、merge-base と時系列確認

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred case 2908 同種1件 |
| 影響度 | 3/5 | QG-4 完了判定の誤差し戻しリスク（今回は3点証拠で機械確定し回避） |
| 横展開性 | 3/5 | baseline 系 durable state を持つ全検査 |
| 反映先明確度 | 4/5 | qg-4「fail 由来分類」「traceability check の横断 durable state 前提手順」 |
| 自動化適性 | 2/5 | 手続的由来分類 |
| プロジェクト固有知識再利用性 | 4/5 | QG-4 運用の中核的崩し手知識 |
| 再発可能性 | 4/5 | 並行 case-close / sibling merge が常態 |
| 費用対効果 | 3/5 | 手順追記で済む |
| **加重合計** | **25/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— 既存の qg-4 fail 由来分類（単独再実行・baseline 再現確認〔detached worktree〕）は存在するが、「baseline 系 durable state の並行追随差」を明示した fail パターンと、baseline 差し替え同一テスト再実行（検証後復元）による決定的対照証拠の手順は未記載（fix gap）。gap 分類: fix gap（baseline 系追随差の明示と対照実行手順の追記候補）
- **エントリ一覧**: worktree での bun test 3-split 実行は並行マージによる IR-055 baseline 更新の未追随で delta guard 疑似 fail を出す [inbox] / 2026-09-17 実装 PR 分岐後に先行 merge された main 側解消行が誤解釈され得る [deferred]

