# 共通 finding 出力契約

inspect-docs command が出力する docs 横断診断の検出事項（finding）に共通する証拠構造、severity、信頼度、出力ファイル契約を定義する。
REQ 固有診断、文意品質診断等の専門診断からルーティングされてきた検出事項も本契約へ適合させる（共通証拠構造の統一）。

本契約は inspect-docs command が出力する最終的な共通証拠構造である。専門 skill が内部で保持する診断観点別の出力形式（例: `agentdev-req-structure-diagnostics` の問題候補出力スキーマ7フィールド）は各専門 skill の内部スキーマであり、本契約へ正規化して統合する。専門 skill の内部スキーマを再定義せず、変換契約のみを本節で定義する。

## 専門 skill 内部スキーマとの関係

| 専門 skill | 内部スキーマ | 本契約への正規化 |
|------------|--------------|------------------|
| `agentdev-req-structure-diagnostics` | 問題候補出力スキーマ7フィールド（観点、対象、根拠、シグナル数、確信度、推奨アクション、req-define入力案） | 観点→category、対象→target、根拠→evidence、シグナル数→notes、確信度→confidence、推奨アクション→recommended_route、req-define入力案→notes へマッピング。severity、source_of_truth、ng_classification は本スキルが横断的に付与 |
| `agentdev-doc-writing` | 査読出力形式（`references/review-output.md`） | 本契約の target、evidence、recommended_route へ正規化 |
| `agentdev-doc-map` | 影響確認フロー結果 | 本契約の target、evidence、recommended_route へ正規化 |

## finding schema（共通証拠構造）

各検出事項は以下のフィールドを持つ。inspect-docs command は本スキルが定める schema に従い検出事項を出力する。

| フィールド | 内容 | 必須 |
|-----------|------|------|
| id | 検出事項の一意識別子（セッション内連番または `{category}-{n}` 形式） | 必須 |
| category | 横断診断カテゴリ（`diagnostic-categories.md` 参照）またはルーティング元の専門診断観点 | 必須 |
| target | 対象ファイルパス、REQ ID、ADR ID、SPEC パス等の識別子 | 必須 |
| evidence | 根拠となる参照、本文要約、検出シグナルの具体的内容 | 必須 |
| severity | 重要度（後述 severity 分類） | 必須 |
| confidence | 確信度（後述 信頼度） | 必須 |
| source_of_truth | source-of-truth priority に基づく判定結果（どの文書を正としたか） | 必須 |
| recommended_route | 推奨される委譲先または後続処理（`diagnostic-routing.md` 参照） | 必須 |
| ng_classification | NG 分類（false positive / pre-existing / 今回修正対象、後述） | 必須 |
| notes | 補足、安定契約例外候補、要ヒューマンレビュー等の付随情報 | 任意 |

## severity 分類

| severity | 意味 | 即時対応目安 |
|----------|------|--------------|
| high | 現行判断に直接影響する矛盾、ID 不整合、配布物汚染 | 次リリース前に対応推奨 |
| medium | 文書品質、参照整合性の局所的破綻 | 計画的対応 |
| low | 觀察メモ、改善提案、安定契約例外候補 | 機会ある時に対応 |

### severity 決定ルール

- retired REQ/SPEC 由来記述が「現行判断の根拠」として使われている場合は high
- REQ/SPEC 境界違反（SPEC 分離基準違反シグナル）は high-specificity signal につき、1シグナルでも原則 high（安定契約例外候補の場合は medium に下げる）
- 横断契約矛盾で上位文書（REQ、承認済み ADR）を正として下位文書が矛盾する場合は high
- 文意品質、「旧名称残存」等の局所的問題は medium または low

## 信頼度（confidence）

| confidence | 意味 |
|------------|------|
| high | 機械的シグナル、明確なパターンマッチで確定判定可能 |
| medium | 文脈確認で確定判定可能、安定契約例外候補を含む |
| low | ヒューマンレビューが必要、複数解釈が可能 |

### confidence 決定ルール

- 機械的に一意に判定できるパターン（例: retired ID の直接参照）は high
- 文脈依存の判定（例: 履歴参照 vs 現行判断の区別）は medium 以下
- 安定契約例外候補、複数解釈が可能な場合は low または medium

## 出力ファイル契約

### 出力先

`.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`（REQ-0124-004、REQ-0124-015、REQ-0103-140 準拠）。
ファイル名の `{timestamp}` は ISO 8601 形式（`YYYYMMDDTHHMMSSZ` 等のタイムゾーン付き）。

### 出力構成

検出事項ファイルは以下の構成を持つ。

```
# inspect-docs finding {timestamp}

## サマリ
- スキャン対象の件数
- 各カテゴリの検出件数
- high severity の件数

## 検出事項リスト
（finding schema に従う各検出事項）

## 推奨アクション
- 各検出事項に対する推奨対応（route 先、req-define 再壁打ち候補 等）

## 対象外（Out of Scope）
- 本スキャンで明示的に対象外とした事項
```

### inspect lifecycle との協調

- 検出事項ファイルは `.agentdev/inspect/inbox/` に配置し、`inspect-promote` への入力となる（REQ-0124-004）
- reject された検出事項は即時削除する（REQ-0103-140、REQ-0103-146）
- promote された検出事項は `.agentdev/inspect/promoted/` へ保存し、`backlog-review` の入力となる（REQ-0103-146、REQ-0103-147）
- 検出事項の source_type は `inspect`（REQ-0124-014、REQ-0103-149）

## NG 分類

検出事項には以下の NG 分類を付ける（docs-spec-rebuild-integrity SPEC NG 分類表に準拠、`agentdev-req-structure-diagnostics` 配布物統合性検出と共通）。

| 分類 | 定義 | 後続対象 |
|------|------|----------|
| false positive | 検査ルールの誤検知 | 検査ルールの修正 |
| pre-existing | 今回の変更以前から存在する既知の問題 | 別途要件化 |
| 今回修正対象 | 今回の変更で導入、残存した問題 | 今回の Issue で修正 |

NG 分類は recommended_route とは別軸で付ける。
検出事項が属する分類が不明な場合は「要ヒューマンレビュー」と明記する。

## source-of-truth priority

矛盾判定時の優先順位（REQ-0109-013 準拠）。

1. 現行 REQ（`docs/requirements/REQ-*.md`、retired/ 配下を除く）
2. 承認済み ADR（`status: accepted` の ADR）
3. SPEC（`docs/specs/**/*.md`）
4. DOC-MAP / guides（補助文書）

下位文書が上位文書と矛盾する場合、下位文書の記述を検出事項とする。

## 許可される副作用

本スキルが関与する診断結果の副作用は以下のみを許可する（REQ-0103-140-151、inspect lifecycle 準拠）。

| 副作用 | 許可 |
|--------|------|
| `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成 | 許可 |
| `.agentdev/inspect/` 配下の git 永続化（commit/push） | 許可（commit message: `chore(agentdev): capture inspect-docs finding`） |
| 検査対象（docs/、src/opencode/）のファイル編集 | 禁止 |
| Issue/PR 作成、worktree 作成、branch 操作 | 禁止 |
| intake/learning/RU の処理 | 禁止 |
