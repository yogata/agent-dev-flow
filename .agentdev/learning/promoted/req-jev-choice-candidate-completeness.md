# 閉じた choice 判断の候補集合に正解クラスを含める

## 背景

Jev観測14 JSON・55判断のうち corrected 10判断中7判断が同一構造。候補欠落時に最近似候補へ高確率で張り付き、LLM是正に依存。

## 問題

STEP-3 既存REQ照合判断の choice 候補集合が「REQ操作なし」系の正解クラスを含まず（requirement-development.md STEP-3 質問形式表「choice（CREATE・APPEND・UPDATE）」— 本実行で L181 を検証し候補欠落を確認済み）、閉じた構成では分布が候補欠落を通知しないため最近似候補へ高確率で張り付く

## 望ましい変更

choice 質問構成時の候補完備性チェック（正解クラス網羅・NULL 候補の含む/含まない明示判断）、候補欠落由来の是正は判断構成側の欠陥として分類する運用ルール

## 対象範囲

### 対象

- requirement-development.md STEP-3 質問形式表、Jev 質問構成規約

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | requirement-development.md STEP-3 質問形式表、Jev 質問構成規約 | choice 候補集合に「REQ操作なし」系の正解クラスが欠落。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: requirement-development.md STEP-3 質問形式表、Jev 質問構成規約
- **ギャップ分類**: fix gap
- **ギャップ詳細**: choice 候補集合に「REQ操作なし」系の正解クラスが欠落。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: 閉じた choice 判断の候補集合に正解クラスを含める
- **根拠**: Jev観測14 JSON・55判断のうち corrected 10判断中7判断が同一構造。候補欠落時に最近似候補へ高確率で張り付き、LLM是正に依存。
- **再発条件**: evaluation-report の問題クラス10および原エントリを参照
- **横展開可能性**: choice を構成する6系統 workflow

### 原エントリ（証跡）

### Inbox 原文 1

## 閉じた choice 判断の候補集合は正解クラスを尽くさないと意味評価器が最近似候補へ高確率で張り付き分布は候補欠落を通知しない

- **問題事象**: 2026-09-24 の req-define 7 RU 一括実行（RU-0122〜0128 → Case #3083〜#3089）における Jev 観測14 JSON・55判断のうち、req-define レーンの corrected 10判断中7判断が同一構造だった。既存REQ照合判断（STEP-3）の choice 候補集合に「REQ操作なし（realization 作業のみ）」が存在せず、Jev が最近似の UPDATE/APPEND を選び（top 0.9/0.96/0.99 を含む高確率）、LLM が「REQ操作なし」へ是正した。一方 2026-09-22 観測（20260922T134720Z-61b9、RU-0127）では none_req_impact が候補に存在し top 1.00 で unchanged であり、同一契約下で質問構成（候補集合）が run 間で変動し、是正率が候補構成の偶発に左右されることが判明した
- **発生局面**: 運用（req-define 7 RU 一括実行の Jev 先行評価観測。Stage 1 Jev 観測分析）
- **検知方法**: Stage 1 Jev 観測分析（14 JSON・55判断の corrected 分布集計で7判断の同一構造性を検出し、候補集合の run 間比較で候補欠落と是正の相関を確認）
- **根本原因**: STEP-3 既存REQ照合判断の choice 候補集合が、契約側（requirement-development.md の STEP-3 質問形式表「choice（CREATE・APPEND・UPDATE）」）で「REQ操作なし」系の正解クラスを含まず正解クラスを尽くしていなかった。閉じた choice 構成では候補が欠落しても意味評価器の分布（top・margin）は候補欠落を通知しないため（closed-looking construction）、最近似候補への高確率張り付きが発生し、正解が是正に依存する構造になった。加えて同一契約下で候補構成が run 間で変動しており、是正率が候補構成の偶発に左右されていた
- **自律対応内容**: LLM 最終判断が「REQ操作なし」へ是正して判断を救済した（corrected として観測記録）。分析段階で7判断の同一構造性を検出し、この種のは正（false positive 的選択）は判断器の誤りではなく判断構成側（候補集合）の欠陥として分類した
- **ユーザー確認有無**: なし（Stage 1 Jev 観測分析由来のエージェント抽出知見。正規投入指示のみ）
- **Decision/REQ/spec影響**: 候補: src/opencode/skills/agentdev-workflow-req-define/references/requirement-development.md の STEP-3 質問形式表（choice 候補集合）。反映判断は learning-promote 以降に委ねる
- **横展開観点**: agentdev_jev evaluate で choice 形式質問を構成する全 workflow（learning-promote、req-define、case-ready、intake-promote、inspect-promote、backlog-review の6系統）に適用する。閉じた choice 判断を構成する際は候補集合が正解クラスを尽くすこと、特に「何もしない・対象外・影響なし」系の正解（NULL 候補）を除外しないことを構成規則とする
- **再発条件**: 閉じた choice 判断の候補集合に正解クラス（特に「操作なし・対象外・影響なし」系）が含まれないまま質問を構成した場合。意味評価器は最近似候補へ高確率で張り付き、分布の top・margin は候補欠落を通知しないため検知困難
- **予防策候補**: choice 質問構成時の候補完備性チェック（正解クラスの網羅確認、NULL 候補の含む/含まないの明示判断）を Jev 質問構成手順へ明記する。候補欠落由来のは正は判断器精度の劣化として集計しない（判断構成側の欠陥として分類する）運用ルールを Jev 観測評価に設ける
- **想定反映先**: src/opencode/skills/agentdev-workflow-req-define/references/requirement-development.md（STEP-3 質問形式表の候補集合）、Jev 評価の質問構成規約を所有する箇所（agentdev_jev 契約文書または各 workflow skill の Jev 質問構成 reference）
- **関連**: .agentdev/jev-observations/20260923T150333Z-281e.json、20260923T150426Z-bee6、20260923T150431Z-66a3、20260923T150522Z-9e05、20260923T150655Z-ba81、20260923T151003Z-083f、20260923T151417Z-76e4（commit 57561bcc、REQ-090-006）、20260922T134720Z-61b9（RU-0127 比較対照）、hermes-vault ideas/2026-09-23-jev-semantic-observation-integrated-evaluation.md §9.2.2、RU-0122〜0128、Case #3083〜#3089
- **タグ**: `#Jev` `#choice候補` `#候補完備性` `#req-define` `#判断構成`

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 10
- **確定処分**: 恒久契約候補（REQ, category 1）
- **加重合計**: 31/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単一観測バッチ（同一構造の corrected 7判断を含む） |
| 影響度 | 4/5 | 7判断が Jev の誤選択 + LLM 是正で成立 |
| 横展開性 | 5/5 | choice を構成する6系統 workflow |
| 反映先明確度 | 5/5 | requirement-development.md STEP-3 表を特定 |
| 自動化適性 | 4/5 | 候補完備性チェックを機械的適用可能 |
| プロジェクト固有知識再利用性 | 4/5 | Jev 運用の中核規則 |
| 再発可能性 | 4/5 | choice 構成のたびに発生 |
| 費用対効果 | 4/5 | 形式表・規則の更新のみ |

### 判定基礎（evaluation-report verbatim）

### 問題クラス10: 閉じた choice 判断の候補集合の正解クラス欠落（Jev 候補完備性）
- **根本原因**: STEP-3 既存REQ照合判断の choice 候補集合が「REQ操作なし」系の正解クラスを含まず（requirement-development.md STEP-3 質問形式表「choice（CREATE・APPEND・UPDATE）」— 本実行で L181 を検証し候補欠落を確認済み）、閉じた構成では分布が候補欠落を通知しないため最近似候補へ高確率で張り付く
- **再発条件**: 閉じた choice 判断の候補集合に正解クラス（特に「操作なし・対象外・影響なし」系 NULL 候補）が含まれないまま質問を構成した場合
- **予防策**: choice 質問構成時の候補完備性チェック（正解クラス網羅・NULL 候補の含む/含まない明示判断）、候補欠落由来の是正は判断構成側の欠陥として分類する運用ルール

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（ただし同一観測バッチ内に同一構造の corrected 7判断を含む単一観測バッチ） |
| 影響度 | 4/5 | 7判断が Jev の誤選択 + LLM 是正で成立、評価の質が候補構成の偶発に左右される |
| 横展開性 | 5/5 | agentdev_jev evaluate で choice を構成する6系統 workflow 全般 |
| 反映先明確度 | 5/5 | requirement-development.md STEP-3 質問形式表（L181）を特定・検証済み |
| 自動化適性 | 4/5 | 候補完備性チェックは構成規則として機械的適用可能 |
| プロジェクト固有知識再利用性 | 4/5 | Jev 運用（REQ-090・DEC-027 観測ループ）の中核規則 |
| 再発可能性 | 4/5 | choice 構成は判断のたびに発生 |
| 費用対効果 | 4/5 | 形式表の候補追加と構成規則の明記のみ |
| **加重合計** | **31/40** | |

- **推奨処分案**: 恒久契約候補（REQ）（category 1）— Jev 質問構成契約（STEP-3 質問形式表・Jev 構成規約）の変更を要する要件変更要因。無条件の自動REQ化ではなく候補として promoted/ へ出力し、backlog-review → req-define 経路で確定する。Decision 候補ではなく REQ・配布 workflow reference 更新が代替反映先（「Decision候補除外記録」参照）
- **エントリ一覧**: 閉じた choice 判断の候補集合は正解クラスを尽くさないと意味評価器が最近似候補へ高確率で張り付く [inbox]

