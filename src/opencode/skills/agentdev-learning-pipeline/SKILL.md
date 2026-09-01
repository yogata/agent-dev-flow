---
name: agentdev-learning-pipeline
description: Learning pipeline（capture → promote）の共通知識。inbox entry schema、問題クラス分類基準、8軸評価ディメンション、evaluation-report schema、処分区分、採用済み成果物スキーマ、prune 方針、各層の責任分界を定義する。USE FOR: learning-promote の実行時参照、learning pipeline の拡張・変更時の基準確認。DO NOT USE FOR: 学びの検知・抽出・inbox.md 蓄積（capture 専用スキルの責務）、一般的なコマンド作成。
---

# `agentdev-learning-pipeline`

learning pipeline（capture → promote）の共通知識ベースである。
schema、分類基準、評価ディメンション、prune 方針、責任分界を定義し、learning-promote が参照する。

## パイプライン概要

```
capture → inbox.md → promote（内部分析フェーズ + 昇華判定フェーズ） → promoted/
```

- **capture**（`agentdev-learning-capture` skill）: エージェント主体で学びを検知、抽出、inbox.md に自律蓄積
- **promote**（learning-promote command）: 問題クラス分類、8軸評価、evaluation-report 生成、inbox→deferred 移動、昇華判定、採用済み成果物の生成、prune を一括実行

## 成果物ライフサイクル

pipeline 各層を構成する 4 成果物の役割、性格、command 間の振る舞いを定義する。

| 成果物 | 役割 | 性格 | Command 間の振る舞い |
|---|---|---|---|
| inbox.md | 未整理 learning エントリの現行キュー。capture で蓄積し、promote 成功後にクリアされる。永続ストレージではない | 一時キュー。promote の入力として取り込みされ、処理完了後に空になる | capture が書き込む（append）。promote が読み取り、移動後にクリアする |
| deferred.md | 保留プール（living pool。終端保管ではない）。promote 内部分析フェーズで inbox から移動したエントリを保持。昇華判定フェーズの入力として参照され、promote 時の prune により動的に変化する多状態プール（deferred / 未処理 / 再評価対象を保持） | 動的プール。promote のたびに内容が変化し、未処理エントリは次回 promote の対象として残る | promote が inbox から移動して書き込み、読み取り、prune する。capture は参照しない |
| evaluation-report.md | promote 内部で生成される境界成果物。毎回上書きされ長期履歴ではない。promote の分析フェーズで生成され、昇華判定フェーズの主入力として取り込みされる | 境界成果物。promote 内部の分析→昇華判定間の受け渡し専用。履歴蓄積は行わない | promote が生成（上書き）し、読み取り、取り込みする。capture は参照しない |
| promoted/ | 採用済み成果物の staging 領域。生成された成果物は `/agentdev/backlog-review` が読み込み、RU 化後に `/agentdev/req-define` に合流する。learning 由来で docs/knowledge/ への知識文書保存に分類された成果物は、backlog-review の利用者承認後に docs/knowledge/ へ直接保存され、RU → req-define を経ない。`.opencode/` や実装コードへの直接反映は禁止。`case-run` への直接受け渡しも禁止 | staging 専用。promote が生成し、backlog-review が取り込みする。pipeline 外への直接反映は不可 | promote が採用済み成果物を生成する。backlog-review が明示的に読み取る |

**制約**: raw learning item を実行時コマンド/ skill の直接参照対象にしない。
学びは昇華（promote → 採用済み成果物 → backlog-review → RU → req-define。docs/knowledge/ への知識文書保存に分類された learning 由来分は、backlog-review の利用者承認後に docs/knowledge/ へ直接保存され、RU → req-define を経ない）を経て初めて command/ skill/ template/ AGENTS.md/ docs へ組み込まれる。

## 責任分界

| 層 | command | 責務 |
|---|---|---|
| capture | `agentdev-learning-capture`（skill） | 検知、抽出、自律蓄積。昇格判断、品質評価は行わない |
| promote | learning-promote（command） | 正規化、問題クラス分類、8軸評価、evaluation-report 生成、inbox のエントリを deferred.md に移動、inbox クリア、廃棄判定、採用済み成果物の生成。deferred.md から staged/ rejected/ duplicate を prune し、deferred/ 未処理/ 再評価対象を保持 |

- learning-promote は本 skill を参照して schema、基準を取得する
- `agentdev-learning-capture` は独立 skill であり本 skill を参照しない
- raw learning item を実行時コマンドで直接読ませない。学びは昇華後に command/ skill/ template/ AGENTS.md/ docs へ組み込んで利用する

## 入力

- `inbox.md`（capture が蓄積した未整理エントリ）、`deferred.md`（保留プールの既存エントリ）

## 出力

- `evaluation-report.md`（毎回上書き）、`promoted/` 配下の採用済み成果物、prune 済みの `deferred.md`、クリア済みの `inbox.md`

## 副作用

- `.agentdev/learning/` 配下の inbox.md、deferred.md、evaluation-report.md、promoted/ を更新する
- git 永続化（commit/push）は呼出元 command の責務

## 常に守る不変条件

- **無条件の自動REQ化は禁止する**（REQ）。学びは `promoted/` → backlog-review → req-define → req-save の昇華経路を経て初めて REQ 化される
- **保留プール維持**: 昇華不能な知見（deferred 判定、情報断片、出現回数少）は `deferred.md` で維持し REQ 化しない（REQ）
- raw learning item を実行時コマンド/ skill の直接参照対象にしない
- Decision 候補分類の前に `agentdev-decision-guidelines` の除外基準（禁止条件フィルタリングゲート）を必須適用する
- `case-run` への直接受け渡しは禁止（`backlog-review` → `req-define` を経由すること）
- **adversarial-review は任意助言手段（learning-promote、REQ）**: ユーザー明示要求時のみ Step 8-R1（発動条件判定）→ Step 8-R2（review 呼出）を経て発動する。明示要求がない場合は Phase 5 へ従来フローを維持する（REQ-{NNNN}-{NNN}/{NNN}）。共通 caller integration 契約（任意性、副作用禁止、再 review 条件、停止条件、呼出失敗時取扱い）は `agentdev-adversarial-review` Design（REQ-{NNNN}）が正規所有する。本 skill は learning-promote 固有の候補判断、呼出タイミング、evaluation-report 反映、Step 6 戻しループの実装詳細のみを提供する

## 主要な判断順序

1. 旧フォーマット正規化（解析時のみ、元ファイル不変）
2. 問題クラス分類（根本原因 + 再発条件 + 予防策が同じ単位、最小2エントリ）
3. 8軸評価スコアリング（加重合計 /40）と evaluation-report 生成
4. 禁止条件フィルタリングゲート適用（ADR 候補除外）
5. 処分区分判定（11カテゴリ + duplicate）と既存対策照合（「新規X化」より「既存Xへ反映」優先）
6. inbox → deferred 原子的移動、prune（staged/rejected/duplicate のみ）、採用済み成果物生成

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| inbox entry の13フィールド schema、旧5フィールドからのマッピング、正規化ルール、問題クラス分類基準、8軸評価ディメンション、禁止条件フィルタリングゲート、evaluation-report schema が必要な場合 | [references/inbox-and-evaluation-schema.md](references/inbox-and-evaluation-schema.md) |
| 処分区分（11カテゴリ + duplicate）、反映先マッピング、既存対策照合、採用済み成果物スキーマ、カテゴリ別反映先パス例、プロジェクト固有知識の振り分け、prune 方針詳細が必要な場合 | [references/disposition-and-artifact-schema.md](references/disposition-and-artifact-schema.md) |
| learning-promote の Phase ごとの判定ロジック（正規化、分類、8軸評価、廃棄判定、HITL承認）、learning-promote の review 候補判断と内部挿入（Step 8-R1/8-R2、Step 6 戻しループ）を実行する場合 | [references/promote-judgment-logic.md](references/promote-judgment-logic.md) |
| inbox → deferred の原子的移動プロシージャ（追記、検証、クリア）を実行する場合 | [references/deferred-atomic-move-procedure.md](references/deferred-atomic-move-procedure.md) |

## 反映ルート

```
promoted/ → /agentdev/backlog-review → /agentdev/req-define → /agentdev/req-save → /agentdev/design-save（Design候補がある場合）→ /agentdev/case-open → /agentdev/case-run
```

- 採用済み成果物は `/agentdev/backlog-review` が読み込み、RU 化後に `/agentdev/req-define` の明示入力として扱われる
- learning 由来で docs/knowledge/ への知識文書保存に分類された成果物は、`/agentdev/backlog-review` の利用者承認後に docs/knowledge/ へ直接保存される。この経路では RU を生成せず、`/agentdev/req-define` の要件化経路を通らない（Project Knowledge の所有と workflow 利用の要件、backlog-review Design の知識文書保存手順を正とする）
- 採用済み成果物の形式要件は `references/disposition-and-artifact-schema.md` の「採用済み成果物スキーマ」参照
- `case-run` への直接受け渡しは禁止（`backlog-review` → `req-define` を経由すること）
