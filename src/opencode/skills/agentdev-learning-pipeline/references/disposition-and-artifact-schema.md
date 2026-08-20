# 処分区分と採用済み成果物スキーマ

本ファイルは `agentdev-learning-pipeline` SKILL.md の補助資料であり、処分区分（11カテゴリ + duplicate）、反映先マッピング、既存対策照合、採用済み成果物スキーマ、カテゴリ別反映先パス例、プロジェクト固有知識の振り分け、prune 方針の詳細を扱う。
SKILL.md 本文では処分区分の存在と living pool 維持の不変条件のみを提示し、判定基準表、schema 雛形、prune 対象特定基準は本ファイルを参照する。

## 目次

- [処分区分](#処分区分)
- [反映先マッピング](#反映先マッピング)
- [既存対策照合](#既存対策照合)
- [採用済み成果物スキーマ](#採用済み成果物スキーマ)
- [カテゴリ別の反映先パス例](#カテゴリ別の反映先パス例)
- [プロジェクト固有知識の反映先振り分け](#プロジェクト固有知識の反映先振り分け)
- [Prune 方針](#prune-方針)

## 処分区分

learning-promote が各クラスタに対して判定する廃棄カテゴリ。

**昇華可能性評価、無条件自動REQ化禁止**: 各問題クラスについて恒久契約（REQ/ADR/Design）への昇華可能性を評価する。
8軸評価スコア、禁止条件フィルタリングゲート、既存対策照合を基に判定する。
**無条件の自動REQ化は禁止する**。
学びは `promoted/` → `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save` の昇華経路を経て初めて REQ 化される。

**living pool 維持**: 昇華不能な知見（`deferred` 判定、情報が断片的、出現回数が少ない等）は `deferred.md` の living pool で維持し、REQ 化しない。
living pool は終端保管ではなく、次回 `/agentdev/learning-promote` 実行時に再評価の対象となる。
`deferred.md` は deferred カテゴリ（11廃棄判定カテゴリの1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する多状態の living pool である。

| # | カテゴリ | 判定基準 |
|---|---|---|
| 1 | 既存 command へ反映 | 既存コマンドのステップ、ガードレール、エラーハンドリングに追加すべき手順、制約 |
| 2 | 既存 skill へ反映 | 既存スキルのPrerequisites/Steps/Guardrails/禁止事項に追加すべき知見 |
| 3 | 新規 skill 化 | 汎用的なパターン、複数プロジェクト/コンテキストで再利用可能、独立した判断、手順が確立 |
| 4 | 新規 command 化 | 特定の操作フローが繰り返し現れている、自動化すべき手順が明確 |
| 5 | template 反映 | ドキュメント、Issue、PR等のテンプレート形式に反映すべきフォーマット知見 |
| 6 | ADR 候補 | アーキテクチャに関する設計判断、技術選定の理由を記録すべき内容 |
| 7 | spec 候補 | システム仕様、実装パターン、設計原則として docs/designs/ に反映すべき内容 |
| 8 | REQ 候補 | 要件変更、機能追加の要因となる知見、既存REQの更新が必要な内容。**自動REQ化ではなく候補扱い**。確定は `/agentdev/req-define` → `/agentdev/req-save` 経路で行う |
| 9 | project-local knowledge | プロジェクト固有の落とし穴、環境依存の知見、汎用化が難しい内容 |
| 10 | deferred | まだ昇華の余地がない、情報が断片的、出現回数が少ない。**living pool（`deferred.md`）で維持し REQ 化しない** |
| 11 | rejected | ユーザーが明示的に却下、すでに別の対策で十分対応済み |
| + | duplicate | 既存の command/skill/template/docs で既に同等の内容が十分にカバーされている |

## 反映先マッピング

- **knowledge**（汎用知見）→ skill の Steps/Guardrails
- **procedures**（手順）→ command の Step
- **constraints**（制約、注意事項）→ command/skill の Guardrails/禁止事項
- **format**（フォーマット）→ template + command のフォーマット検証
- **user-confirmed work**（ユーザー確認済み作業フロー）→ command workflow
- **architecture**（アーキテクチャ決定）→ ADR 候補
- **system spec**（システム仕様）→ docs/designs/
- **requirement change**（要件変更）→ REQ/Issue 更新
- **project-specific pitfalls**（プロジェクト固有の落とし穴）→ project-local knowledge

## 既存対策照合

既存対策の確認対象:
- `.opencode/commands/` 配下の全コマンド
- `.opencode/skills/` 配下の全スキル
- `.opencode/skills/agentdev-workflow-templates/templates/` 配下
- `.opencode/skills/agentdev-req-file-manager/templates/`, `agentdev-decision-file-manager/templates/`, `agentdev-spec-compliance/templates/` 配下
- `docs/designs/`, `docs/decisions/`, `docs/requirements/` 配下

ギャップ分類:
- **fix gap**: 対策内容に不備、欠落がある
- **application miss**: 対策は存在するが適用されていないケースがある
- **load miss**: 対策は存在するが該当コマンド/skillがロードされていない
- **guardrail insufficiency**: ガードレール、禁止事項が不十分

判定ルール: 「新規X化」より「既存Xへ反映」を優先する。

## 採用済み成果物スキーマ

learning-promote が出力する採用済み成果物の形式。
`/agentdev/backlog-review` が読み込み、RU 化後に `/agentdev/req-define` に合流する。
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

| 種別 | パス | 変更内容 |
|------|------|----------|
| {command/skill/template/spec/adr/req/agents} | {ファイルパス} | {何を変更するか} |

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

## カテゴリ別の反映先パス例

| カテゴリ | 反映先パス例 |
|---|---|
| 既存 command へ反映 | `.opencode/commands/{target-command}.md` |
| 既存 skill へ反映 | `.opencode/skills/{target-skill}/SKILL.md` |
| 新規 skill 化 | `.opencode/skills/{new-skill}/SKILL.md` |
| 新規 command 化 | `.opencode/commands/{new-command}.md` |
| template 反映 | `.opencode/skills/agentdev-workflow-templates/templates/{template}.md` |
| Decision 候補 | `docs/decisions/DEC-{NNN}-{name}.md` |
| spec 候補 | `docs/designs/{domain}/{spec-name}.md` |
| REQ 候補 | `docs/requirements/REQ-{NNNN}.md` |
| project-local knowledge | 内容に応じた振り分け（後述参照） |

## プロジェクト固有知識の反映先振り分け

project-local knowledge を一律 `.agentdev/learning/project-knowledge.md` に保存せず、内容に応じて振り分ける:

| 内容の性質 | 反映先 |
|---|---|
| 常時必要な短いルール | `AGENTS.md` |
| 作業種別に応じて必要な知識 | `.opencode/skills/<domain>/SKILL.md` |
| 長い詳細 | `.opencode/skills/<domain>/references/*.md` |
| 仕様として固定すべき内容 | `docs/designs/<**/*>.md` |
| 設計判断 | `docs/decisions/<*>.md` |
| 要件変更 | `docs/requirements/<*>.md` |

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
