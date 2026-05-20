---
name: agentdev-learning-pipeline
description: Tips pipeline（capture → refactor → elevate）の共通知識。inbox entry schema、問題クラス分類基準、8軸評価ディメンション、evaluation-report schema、処分区分、既存対策照合、Requirement Source staging stub schema、prune 方針、各層の責任分界を定義する。USE FOR: tips-refactor/tips-elevate の実行時参照、tips pipeline の拡張・変更時の基準確認。DO NOT USE FOR: agentdev-learning-capture（capture専用として独立）、issue-req（staging stub の消費側だが本 skill は参照しない）、一般的なコマンド作成。
---

# agentdev-learning-pipeline

tips pipeline（capture → refactor → elevate）の共通知識ベース。schema・分類基準・評価ディメンション・prune 方針・責任分界を定義し、tips-refactor / tips-elevate が参照する。

## Pipeline Overview

```
capture → inbox.md → refactor → archive.md + evaluation-report.md → elevate → elevation-staging/
```

- **capture**（agentdev-learning-capture skill）: エージェント主体で学びを検知・抽出・inbox.md に自律蓄積
- **refactor**（tips-refactor command）: 問題クラス分類・8軸評価・evaluation-report 生成・inbox→archive 移動
- **elevate**（tips-elevate command）: 昇華判定・Requirement Source stub 生成・prune

## 責任分界

| 層 | command | 責務 |
|---|---------|------|
| capture | agentdev-learning-capture（skill） | 検知・抽出・自律蓄積。昇格判断・品質評価は行わない |
| refactor | tips-refactor（command） | 正規化・問題クラス分類・8軸評価・evaluation-report 生成・archive 移動 |
| elevate | tips-elevate（command） | 廃棄判定・Requirement Source stub 生成・prune |

- tips-refactor と tips-elevate は本 skill を参照して schema・基準を取得する
- agentdev-learning-capture は独立 skill であり本 skill を参照しない
- raw tips を runtime で直接読ませない。学びは昇華後に command / skill / template / AGENTS.md / docs へ組み込んで利用する

## Inbox Entry Schema

### 新フォーマット（13フィールド）

```
## YYYY-MM-DD: タイトル

- **問題事象**: ...
- **発生局面**: ...
- **検知方法**: ...
- **根本原因**: ...
- **自律対応内容**: ...
- **ユーザー確認の有無**: ...
- **ADR/REQ/spec影響**: ...
- **横展開観点**: ...
- **再発条件**: ...
- **予防策候補**: ...
- **想定反映先**: ...
- **関連**: ...
- **タグ**: #xxx #yyy

---
```

### 旧フォーマット（5フィールド）からのマッピング

旧フィールド → 新フィールド:

| 旧フィールド | 新フィールド | 備考 |
|---|---|---|
| 事象 | 問題事象 | |
| 原因 | 根本原因 | |
| 対策 | 自律対応内容 | |
| 状況 | 問題事象 | 事象と重複時は長い方を採用 |
| 解決策 | 自律対応内容 | 対策と重複時は長い方を採用 |
| 教訓 | 予防策候補 | |
| 関連 | 関連 | そのまま |
| タグ | タグ | そのまま |

### 正規化ルール

- 旧フォーマットに存在しないフィールドは空文字（推測補完はしない）
- 発生局面、検知方法、ユーザー確認の有無、ADR/REQ/spec影響、横展開観点、再発条件、想定反映先 は旧フォーマットでは空
- 正規化は解析時のみ適用。元ファイルの内容は書き換えない

## 問題クラス分類基準

テーマクラスタリングではなく**問題クラス**（根本原因 + 再発条件 + 予防策が同じ単位）で分類する。

- **分類基準**: 以下の3要素が全て同じエントリを同一問題クラスにグループ化
  1. 根本原因が本質的に同じ
  2. 再発条件が同じ
  3. 予防策が同じ
- **最小クラスタサイズ**: 2エントリ以上。単独エントリは「未分類」クラスタへ
- **分類粒度**: 「Windows環境でのパスエスケープ問題」「Supabase RLSポリシーの権限漏れ」レベルの具体性
- **タグの取り扱い**: タグは参考情報。分類の主軸にはしない

## 8軸評価ディメンション

各問題クラスに対して以下の8軸で評価（各1-5スケール）。加重合計スコア（満点40）を算出する。

| 軸 | 説明 | スコア基準（1-5） |
|---|---|---|
| 発生件数 | 同一問題クラス内のエントリ数 | 1=1件, 2=2件, 3=3-4件, 4=5-7件, 5=8件以上 |
| 影響度 | 発生時の被害・手戻りの大きさ | 1=軽微, 2=小, 3=中, 4=大, 5=致命的 |
| 横展開性 | 他のプロジェクト・コンテキストでも発生し得るか | 1=固有, 2=限定, 3=中程度, 4=高い, 5=汎用 |
| 反映先明確度 | どの command/skill/template に反映すべきか明確か | 1=不明, 2=曖昧, 3=候補あり, 4=明確, 5=特定済 |
| 自動化適性 | 予防策を自動化できるか | 1=困難, 2=低い, 3=可能, 4=容易, 5=即自動化可 |
| プロジェクト固有知識再利用性 | プロジェクト固有の技術的落とし穴として再利用価値があるか | 1=低い, 2=やや低い, 3=中程度, 4=高い, 5=極めて高い |
| 再発可能性 | 今後同じ問題が再発する可能性 | 1=極低, 2=低い, 3=中程度, 4=高い, 5=ほぼ確実 |
| 費用対効果 | 予防策実装コスト対リスク低減効果 | 1=割高, 2=やや割高, 3=妥当, 4=良い, 5=極めて良い |

高スコア = 昇格優先度高（tips-elevate での処分判定材料）。

## Evaluation-Report Schema

パス: `docs/tips/evaluation-report.md`（毎回上書き、追記しない）

```markdown
# 評価レポート

## メタデータ
- **実行日時**: YYYY-MM-DD HH:mm
- **対象エントリ数**: N件（inbox: N件, archive: N件）
- **問題クラス数**: N（未分類含む）

## 問題クラス一覧

### 問題クラス1: {問題クラス名}

- **根本原因**: {共通する根本原因}
- **再発条件**: {共通する再発条件}
- **予防策**: {共通する予防策}

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | N/5 | ... |
| 影響度 | N/5 | ... |
| 横展開性 | N/5 | ... |
| 反映先明確度 | N/5 | ... |
| 自動化適性 | N/5 | ... |
| プロジェクト固有知識再利用性 | N/5 | ... |
| 再発可能性 | N/5 | ... |
| 費用対効果 | N/5 | ... |
| **加重合計** | **N/40** | |

- **推奨処分案**: {スキル化/コマンド化/ワークフロー組み込み/保留 のいずれかと理由}

#### エントリ一覧
- YYYY-MM-DD: タイトル [inbox/archive]

### 未分類
- （単独エントリの一覧）

## refactor時prune結果

- **対象エントリ数**: N件
- **prune実施**: あり/なし
- **prune候補**: N件（実施時のみ）
- **prune却下**: N件（実施時のみ）

## 全体傾向
- 高頻出・高影響の問題クラス
- 横展開性が高い問題クラス
- 自動化適性が高い問題クラス
- 全体的な観察所見
```

## 処分区分

tips-elevate が各クラスタに対して判定する廃棄カテゴリ。

| # | カテゴリ | 判定基準 |
|---|---------|---------|
| 1 | 既存 command へ反映 | 既存コマンドのステップ・ガードレール・エラーハンドリングに追加すべき手順・制約 |
| 2 | 既存 skill へ反映 | 既存スキルのPrerequisites/Steps/Guardrails/MUST NOTに追加すべき知見 |
| 3 | 新規 skill 化 | 汎用的なパターン、複数プロジェクト/コンテキストで再利用可能、独立した判断・手順が確立 |
| 4 | 新規 command 化 | 特定の操作フローが繰り返し現れている、自動化すべき手順が明確 |
| 5 | template 反映 | ドキュメント・Issue・PR等のテンプレート形式に反映すべきフォーマット知見 |
| 6 | ADR 候補 | アーキテクチャに関する設計判断・技術選定の理由を記録すべき内容 |
| 7 | spec 候補 | システム仕様・実装パターン・設計原則として docs/specs/ に反映すべき内容 |
| 8 | REQ 候補 | 要件変更・機能追加の要因となる知見、既存REQの更新が必要な内容 |
| 9 | project-local knowledge | プロジェクト固有の落とし穴・環境依存の知見、汎用化が難しい内容 |
| 10 | deferred | まだ昇華の余地がない、情報が断片的、出現回数が少ない |
| 11 | rejected | ユーザーが明示的に却下、すでに別の対策で十分対応済み |
| + | duplicate | 既存の command/skill/template/docs で既に同等の内容が十分にカバーされている |

### 反映先マッピング

- **knowledge**（汎用知見）→ skill の Steps/Guardrails
- **procedures**（手順）→ command の Step
- **constraints**（制約・注意事項）→ command/skill の Guardrails/MUST NOT
- **format**（フォーマット）→ template + command のフォーマット検証
- **user-confirmed work**（ユーザー確認済み作業フロー）→ command workflow
- **architecture**（アーキテクチャ決定）→ ADR 候補
- **system spec**（システム仕様）→ docs/specs/
- **requirement change**（要件変更）→ REQ/Issue 更新
- **project-specific pitfalls**（プロジェクト固有の落とし穴）→ project-local knowledge

### 既存対策照合

既存対策の確認対象:
- `.opencode/commands/` 配下の全コマンド
- `.opencode/skills/` 配下の全スキル
- `.opencode/skills/agentdev-workflow-templates/templates/` 配下
- `.opencode/skills/agentdev-req-file-manager/templates/`, `agentdev-adr-file-manager/templates/`, `agentdev-spec-compliance/templates/` 配下
- `docs/specs/`, `docs/adr/`, `docs/requirements/` 配下

ギャップ分類:
- **fix gap**: 対策内容に不備・欠落がある
- **application miss**: 対策は存在するが適用されていないケースがある
- **load miss**: 対策は存在するが該当コマンド/skillがロードされていない
- **guardrail insufficiency**: ガードレール・MUST NOTが不十分

判定ルール: 「新規X化」より「既存Xへ反映」を優先する。

## Requirement Source Staging Stub Schema

tips-elevate が出力する staging stub の形式。issue-req への汎用入力ファイルとして機能する。

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

## 元tips / 根拠

- **要約**: {クラスタのテーマ概要}
- **根拠**: {判定の根拠となった事象・原因・対策の要約}
- **再発条件**: {同じ問題が再発する可能性のある条件}
- **横展開可能性**: {他のプロジェクト/コンテキストでも発生しうるか}

## 推奨Issue分類

- **分類**: {feature / fix / refactor / chore}
- **推奨ラベル**: {enhancement, bug, ...}
- **関連Issue**: {関連するIssue番号、なしの場合は「なし」}
```

### カテゴリ別の反映先パス例

| カテゴリ | 反映先パス例 |
|---------|-------------|
| 既存 command へ反映 | `.opencode/commands/{target-command}.md` |
| 既存 skill へ反映 | `.opencode/skills/{target-skill}/SKILL.md` |
| 新規 skill 化 | `.opencode/skills/{new-skill}/SKILL.md` |
| 新規 command 化 | `.opencode/commands/{new-command}.md` |
| template 反映 | `.opencode/skills/agentdev-workflow-templates/templates/{template}.md` |
| ADR 候補 | `docs/adr/ADR-{NNNN}-{name}.md` |
| spec 候補 | `docs/specs/{spec-name}.md` |
| REQ 候補 | `docs/requirements/REQ-{NNNN}-{name}.md` |
| project-local knowledge | 内容に応じた振り分け（下記参照） |

## Project-Local Knowledge 反映先振り分け

project-local knowledge を一律 `docs/tips/project-knowledge.md` に保存せず、内容に応じて振り分ける:

| 内容の性質 | 反映先 |
|---|---|
| 常時必要な短いルール | `AGENTS.md` |
| 作業種別に応じて必要な知識 | `.opencode/skills/<domain>/SKILL.md` |
| 長い詳細 | `.opencode/skills/<domain>/references/*.md` |
| 仕様として固定すべき内容 | `docs/specs/*.md` |
| 設計判断 | `docs/adr/*.md` |
| 要件変更 | `docs/requirements/*.md` |

## Prune 方針

### refactor 時 prune（MAY）

archive.md 内の古い単発レアケースを削除候補として特定する。**必須ではない。**

#### prune 対象の特定基準（全てを満たすもの）

- 記録から一定期間（目安: 3ヶ月以上）経過している
- その後、本質的に同じ問題が再発していない
- 影響度が低い（スコア2以下）
- 再発条件が曖昧（空または汎用的すぎる記述）
- 横展開性が低い（スコア2以下）
- 費用対効果が低い（スコア2以下）

#### 削除禁止エントリ

- **判断基準**を含む tips（「〜すべき」「〜してはならない」等の明確な判定ルール）
- **技術知識**を含む tips（API仕様、設定値、制約事項等の技術的事実）
- **プロジェクト固有知識**を含む tips（プロジェクト特有のアーキテクチャ、ワークフロー、環境依存の知識）

### elevate 時 prune

- **prune 対象**: staged（stub 生成済み）/ rejected / duplicate のエントリのみ
- **prune 非対象**: deferred / 未処理のエントリは archive.md に残す
- **証拠保存**: staged エントリを除去する際、stub の「元tips / 根拠」セクションに保存してから除去

## 反映ルート

```
elevation-staging/ → issue-req（明示入力ファイル）→ issue-save-req → issue-create → issue-work
```

- staging stub は `issue-req` の「明示入力ファイル」として扱われる
- `.opencode/` への直接配置は禁止
- `issue-work` への直接受け渡しは禁止（`issue-req` を経由すること）
