# 処分区分と採用済み成果物スキーマ

本ファイルは `agentdev-learning-pipeline` SKILL.md の補助資料であり、処分区分（7カテゴリ + duplicate）、既存対策照合、採用済み成果物スキーマ、req-define 変更影響分析への情報候補、プロジェクト固有知識の振り分け、prune 方針の詳細を扱う。
SKILL.md 本文では処分区分の存在と living pool 維持の不変条件のみを提示し、判定基準表、schema 雛形、prune 対象特定基準は本ファイルを参照する。

## 目次

- [処分区分](#処分区分)
- [既存対策照合](#既存対策照合)
- [採用済み成果物スキーマ](#採用済み成果物スキーマ)
- [req-define 変更影響分析への情報候補](#req-define-変更影響分析への情報候補)
- [プロジェクト固有知識の反映先振り分け](#プロジェクト固有知識の反映先振り分け)
- [Prune 方針](#prune-方針)

## 処分区分

learning-promote が各クラスタに対して判定する処分カテゴリ。
処分区分は、学習価値、問題クラス、8軸評価、change_nature、再発条件、知識としての保存適否（docs/knowledge/ 候補判定）、重複・陳腐化、保留要否の learning 固有の評価結果に基づいて判定する。
Skill、Command、script、checker、hook、Custom Tool 等の具体的な実現先を選ぶ分類・マッピングは処分区分に含めない。実現先の選択は req-define の変更影響分析が確定する責務であり、learning-promote は先取りしない。実現物種別の情報は、採用済み成果物の「反映先候補」として req-define 変更影響分析への情報候補に留める。

**昇華可能性評価、無条件自動REQ化禁止**: 各問題クラスについて恒久契約（REQ/Decision/Design）への昇華可能性を評価する。
8軸評価スコア、禁止条件フィルタリングゲート、既存対策照合を基に判定する。
**無条件の自動REQ化は禁止する**。
学びは `promoted/` → `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save` の昇華経路を経て初めて REQ 化される。

**living pool 維持**: 昇華不能な知見（`deferred` 判定、情報が断片的、出現回数が少ない等）は `deferred.md` の living pool で維持し、REQ 化しない。
living pool は終端保管ではなく、次回 `/agentdev/learning-promote` 実行時に再評価の対象となる。
`deferred.md` は deferred カテゴリ（処分区分の1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する多状態の living pool である。

| # | カテゴリ | 判定基準 |
|---|---|---|
| 1 | 恒久契約候補（REQ） | 要件変更、機能追加の要因となる知見、既存 REQ の更新が必要な内容。**自動 REQ 化ではなく候補扱い**。確定は `/agentdev/req-define` → `/agentdev/req-save` 経路で行う |
| 2 | 恒久契約候補（Decision） | アーキテクチャに関する設計判断、技術選定の理由を記録すべき内容。禁止条件フィルタリングゲート適用後の候補 |
| 3 | 恒久契約候補（Design） | システム仕様、実装パターン、設計原則として docs/designs/ に反映すべき内容 |
| 4 | project knowledge | プロジェクト固有の落とし穴、環境依存の知見、汎用化が難しい内容。保存先の候補判定は「プロジェクト固有知識の反映先振り分け」参照 |
| 5 | 既存対策の更新 | 同種の問題を防止する既存対策が存在するが、陳腐化、不備、適用漏れがある。既存事実の整備状況（ギャップ分類と詳細）として req-define へ引き渡す |
| 6 | deferred | まだ昇華の余地がない、情報が断片的、出現回数が少ない。**living pool（`deferred.md`）で維持し REQ 化しない** |
| 7 | rejected | ユーザーが明示的に却下、すでに別の対策で十分対応済み |
| + | duplicate | 同等の内容が既存の恒久契約、知識、配布物で十分にカバーされている |

## 既存対策照合

既存対策の確認は、学びが既存事実で十分にカバーされているか、既存対策の整備状況にギャップがあるかを評価する learning 固有の評価である（重複・陳腐化の評価）。
確認結果は、req-define が変更方針を確定できる既存事実の整備状況として採用済み成果物へ記録する。実現先の選択は行わない。

既存対策の確認対象:
- `docs/requirements/`, `docs/designs/`, `docs/decisions/` 配下（恒久契約）
- `docs/knowledge/` 配下（プロジェクト知識）
- `.opencode/commands/`, `.opencode/skills/` 配下（配布 command・skill。templates、scripts、hook、Custom Tool の契約を含む）

ギャップ分類:
- **fix gap**: 対策内容に不備、欠落がある
- **application miss**: 対策は存在するが適用されていないケースがある
- **load miss**: 対策は存在するが該当コマンド/skillがロードされていない
- **guardrail insufficiency**: ガードレール、禁止事項が不十分

## 採用済み成果物スキーマ

learning-promote が出力する採用済み成果物の形式。
採用済み成果物は、問題、根拠、望ましい状態、制約、既存事実を req-define が既存 REQ / Decision / Design と実装を再調査して変更方針を確定できる自足的な情報として保持する。
learning-promote は実現先を確定せず、「反映先候補」は req-define 変更影響分析への情報候補である。
`/agentdev/backlog-review` が読み込み、RU 化後に `/agentdev/req-define` に合流する。learning 由来で docs/knowledge/ への知識文書保存に分類された成果物は、backlog-review の利用者承認後に docs/knowledge/ へ直接保存され、RU 化を経ない。
採用済み成果物は backlog-review 以前の段階（pre-backlog-review）であり、RU への変換は backlog-review が行う。

```markdown
# {name}

## 背景

{なぜこの変更が必要になったか。問題が発生した文脈と動機}

## 問題

{解決すべき問題の明確な記述。現状の何が悪いか}

## 望ましい変更

{問題解決のためにどのような変更が望ましいか}

## 対象範囲

### 対象

- {対象となるファイル・モジュール・機能}

### 対象外

- {対象外とする内容}

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| {REQ/Decision/Design/配布command/配布skill/template/knowledge/AGENTS.md 等の情報候補} | {ファイルパス} | {何を変更するか} |

## 既存対策確認

- **確認結果**: {既存対策あり/なし}
- **該当ファイル**: {既存コマンド/skill/template/docsのパス、なしの場合は「なし」}
- **ギャップ分類**: {fix gap / application miss / load miss / guardrail insufficiency / なし}
- **ギャップ詳細**: {具体的な不備・欠落の内容、なしの場合は「なし」}

## 制約

{実装時の制約・注意事項。既存機能への影響、後方互換性、環境依存等}

## 受け入れ条件

- [ ] {完了条件1}
- [ ] {完了条件2}
- [ ] {完了条件3}

## 元learning item / 根拠

- **要約**: {クラスタのテーマ概要}
- **根拠**: {判定の根拠となった事象・原因・対策の要約}
- **再発条件**: {同じ問題が再発する可能性のある条件}
- **横展開可能性**: {他のプロジェクト/コンテキストでも発生しうるか}

## 推奨Issue分類

- **分類**: {feature / fix / refactor / chore}
- **推奨ラベル**: {enhancement, bug, ...}
- **関連Issue**: {関連するIssue番号、なしの場合は「なし」}
```

## req-define 変更影響分析への情報候補

learning-promote は、学びの性質ごとの情報を req-define の変更影響分析への情報候補として採用済み成果物へ保持できる。
以下は情報候補の観点であり、実現先を最終選択する固定的なマッピングではない。

- **knowledge**（汎用知見）: 手順、ガードレール、判断基準として価値を持つ知見
- **procedures**（手順）: 繰り返し現れる操作フロー、自動化すべき手順
- **constraints**（制約、注意事項）: 禁止事項、環境依存の制約
- **format**（フォーマット）: ドキュメント、Issue、PR 等の形式に関する知見
- **user-confirmed work**（ユーザー確認済み作業フロー）: 承認境界を含む作業フロー
- **architecture**（アーキテクチャ決定）: 設計判断、技術選定の理由
- **system spec**（システム仕様）: 現在のシステム事実として固定すべき内容
- **requirement change**（要件変更）: 要件、機能の変更要因
- **project-specific pitfalls**（プロジェクト固有の落とし穴）: 汎用化が難しいプロジェクト固有の知見

これらの観点は、req-define が実現先（既存 REQ / Decision / Design、配布 command・skill、template、docs/knowledge/、AGENTS.md 等のどの実現面を変更するか）を変更影響分析で確定する際の情報として採用済み成果物へ記録できる。
learning-promote はこの観点で実現先を分類・確定しない。

## プロジェクト固有知識の反映先振り分け

project knowledge を一律 `.agentdev/learning/project-knowledge.md` に保存せず、内容に応じて振り分ける。
技術固有知識（リスク判断知識）の恒久所有先は、Project Knowledge の所有と workflow 利用の要件が正規所有する所有面の契約に従い、Design（現在のシステム事実）と docs/knowledge/ 配下の知識文書（プロジェクト知識の正規知識層）に分担する。

| 内容の性質 | 反映先 |
|---|---|
| 常時必要な短いルール | `AGENTS.md` |
| 現在のシステム事実として固定すべき技術事実 | `docs/designs/<**/*>.md` |
| 再利用可能な判断知識（リスク導出規則） | `docs/knowledge/`（知識文書契約（1知識1ファイル、kebab-case slug、必須内容5項目）に従う知識文書として保存する。backlog-review の利用者承認後に docs/knowledge/ へ直接保存され、RU → req-define の要件化経路を通らない） |
| 設計判断 | `docs/decisions/<*>.md` |
| 要件変更 | `docs/requirements/<*>.md` |

docs/knowledge/ の知識文書は、利用可能なハーネスの探索能力を通じて関連知識が判断材料として利用される（Project Knowledge の所有と workflow 利用の要件が正規所有する利用面の契約）。本ファイルはその機構の契約を再定義せず名レベルで参照する。
配布成果物（ADF core）は一般規則のみを保持し、技術固有知識を保持しない（配布成果物の責務境界の要件が正規所有する技術固有知識非保持の原則）。一般規則へ昇華できる内容のみ、恒久契約（REQ/Decision/Design）の経路を経て配布成果物へ反映する。
docs/knowledge/ 向けの知識文書は、利用者承認を経て backlog-review が docs/knowledge/ へ直接保存する正規昇華経路（バックログ統合の要件が正規所有する知識文書保存契約）を経由して流入し、判断の材料として使われる成長する資産として扱う。docs/knowledge/ への知識文書保存にも既存恒久所有先への昇華にも該当しない知識は deferred として保留する。

## Prune 方針

### promote 内部分析フェーズ時 prune

deferred.md 内の古い単発レアケースを削除候補として特定する。
**必須ではない。
**

#### prune 対象の特定基準（全てを満たすもの）

- 記録から一定期間（目安: 3ヶ月以上）経過している
- その後、本質的に同じ問題が再発していない
- 影響度が低い（スコア2以下）
- 再発条件が曖昧（空または汎用的すぎる記述）
- 横展開性が低い（スコア2以下）
- 費用対効果が低い（スコア2以下）

#### 削除禁止エントリ

- **判断基準**を含む learning item（「〜すべき」「〜してはならない」等の明確な判定ルール）
- **技術知識**を含む learning item（API仕様、設定値、制約事項等の技術的事実）
- **プロジェクト固有知識**を含む learning item（プロジェクト特有のアーキテクチャ、ワークフロー、環境依存の知識）

### promote 時 prune

- **prune 対象**: staged（採用済み成果物生成済み）/ rejected/ duplicate のエントリのみ
- **prune 非対象**: deferred/ 未処理/ 再評価対象のエントリは deferred.md に残す
- **証拠保存**: staged エントリを除去する際、採用済み成果物の「元learning item/ 根拠」セクションに保存してから除去
