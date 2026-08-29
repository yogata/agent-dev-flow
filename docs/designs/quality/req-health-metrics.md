---
title: REQ 健全性メトリクス
status: accepted
created: 2026-08-20
updated: 2026-07-24
---
<!-- ADF-COVERS(implementation): REQ-001-044 -->

# REQ 健全性メトリクス

REQ の肥大化、関心ズレを定量的に検出するための閾値を定義する（REQ-001-040）。
`req-define` の Step 3（既存 REQ 照合）、Step 10-2（統合/分離判定）、`inspect-docs`、`agentdev-req-structure-diagnostics` スキルが本 Design を参照して SPLIT 予兆を判定する。

## 適用範囲

- **対象**: 現行 REQ ファイル（`docs/requirements/REQ-NNNN.md`）の要件テーブル行（`| REQ-NNNN-MMM | ... |`）。目的、適用範囲セクションの散文は計測対象外
- **対象外**: 廃止 REQ、draft、Design、Decision、guides

## 測定対象と計測方法

| メトリクス | 定義 | 計測方法 |
|---|---|---|
| 要件行数 | 現行 REQ の要件テーブル行数 | `^\| REQ-NNNN-\d{3} \|` に一致する行数 |
| 関心分類数 | 1 REQ 内で混在する関心対象の分類数 | 後述「関心分類」の定義に従い、要件行の主たる文意から分類 |
| アーティファクト種別数 | 1 REQ が影響するアーティファクト種別の数 | `req-impact-map.md` の「影響するアーティファクト」列、または要件本文の対象アーティファクト記述から集計 |

### 関心分類

関心分類は、1 つの REQ が複数の独立した関心事を含んでいるかを判定するための分類。`agentdev-req-structure-diagnostics` スキルの SPLIT 観点（`req-structure-review.md`）に定義する 4 シグナルに基づく:

1. 関心対象（要件の主題となる対象領域）の複数混在
2. 複数アーティファクト種別の混在（command + skill + template 等）
3. 複数 command family の混在
4. 複数ライフサイクル段階の混在

異なる分類シグナルが 1 つでも検出された場合、関心分類数を +1 する。
複数シグナルが検出された場合は、検出シグナル数を関心分類数とする。

## 閾値と SPLIT シグナル

要件行数、関心分類数、アーティファクト種別数を以下の閾値で評価し、SPLIT シグナルを加算する。
SPLIT シグナルは `agentdev-req-structure-diagnostics` スキルの推奨アクション判定（SPLIT / APPEND / no-action）の入力となる。

### 要件行数

| 要件行数 | SPLIT シグナル | 判定 |
|---|---|---|
| 0〜50 | +0 | 健全。APPEND 検討に支障なし |
| 51〜80 | +1 | 肥大化傾向。APPEND の前に SPLIT 要否を検討 |
| 81 以上 | +2 | 肥大化。SPLIT を強く推奨 |

### 関心分類数

| 関心分類数 | SPLIT シグナル | 判定 |
|---|---|---|
| 0〜1 | +0 | 単一関心。健全 |
| 2 以上 | +1 | 複数関心の混在。SPLIT 候補 |

### アーティファクト種別数

| アーティファクト種別数 | SPLIT シグナル | 判定 |
|---|---|---|
| 1〜2 | +0 | 単一〜隣接アーティファクト責務。健全 |
| 3 以上 | +1 | 複数アーティファクト種別への影響。責務分界の再検討候補 |

### Design 分離基準違反（high-specificity signal）

`agentdev-req-structure-diagnostics` スキルの Design 分離基準違反シグナル（`req-structure-review.md`「Design 分離基準違反検出」）は、1 シグナルでも検出された場合 SPLIT シグナル +1 として扱う。
これは要件行数、関心分類数とは独立に加算する。

安定契約例外（REQ-001-069、`document-model.md`「安定契約の例外」）に該当する要件行は、Design 分離基準違反の検出対象外とする。

## 推奨アクションへの対応付け

合算した SPLIT シグナル数に基づき、`req-define` Step 10-2 と `agentdev-req-structure-diagnostics` が推奨アクションを提示する:

| SPLIT シグナル合計 | 推奨アクション | req-define での扱い |
|---|---|---|
| 0〜1 | no-action / APPEND | 既存 REQ への APPEND を許可 |
| 2 | SPLIT 検討 | APPEND の前にユーザーへ SPLIT 要否を提案 |
| 3 以上 | SPLIT 推奨 | SPLIT を強く推奨。APPEND の場合は理由を明記 |

`agentdev-req-structure-diagnostics` スキルのシグナル閾値（1 シグナル=観察メモ、2 シグナル=問題候補、3 シグナル=高優先度）と本 Design の閾値は整合する。
同スキルの判定結果出力スキーマ（観点、対象、根拠、シグナル数、確信度、推奨アクション、req-define 入力案）に本 Design のシグナル計算結果を埋め込む。

## 現行 REQ の計測例（参照値）

本 Design の閾値を現行 REQ に適用した結果の参照値。
定期計測時の推移比較に使用する。

<!-- AUTOGEN:BEGIN:id=req-metrics-measurement-example -->
| REQ | 要件行数 | 行数シグナル | 備考 |
|---|---|---|---|
| REQ-001 | 61 | +1 |  |
| REQ-008 | 58 | +1 |  |
| REQ-003 | 56 | +1 |  |
| REQ-004 | 54 | +1 |  |
| REQ-009 | 50 | +0 |  |
| REQ-034 | 43 | +0 |  |
| REQ-002 | 35 | +0 |  |
| REQ-043 | 30 | +0 |  |
| REQ-005 | 28 | +0 |  |
| REQ-012 | 26 | +0 |  |
| REQ-010 | 24 | +0 |  |
| REQ-011 | 24 | +0 |  |
| REQ-031 | 24 | +0 |  |
| REQ-036 | 24 | +0 |  |
| REQ-032 | 22 | +0 |  |
| REQ-030 | 21 | +0 |  |
| REQ-048 | 21 | +0 |  |
| REQ-049 | 19 | +0 |  |
| REQ-017 | 16 | +0 |  |
| REQ-041 | 16 | +0 |  |
| REQ-014 | 15 | +0 |  |
| REQ-021 | 15 | +0 |  |
| REQ-050 | 14 | +0 |  |
| REQ-053 | 13 | +0 |  |
| REQ-015 | 12 | +0 |  |
| REQ-035 | 12 | +0 |  |
| REQ-042 | 12 | +0 |  |
| REQ-052 | 11 | +0 |  |
| REQ-016 | 10 | +0 |  |
| REQ-037 | 10 | +0 |  |
| REQ-007 | 9 | +0 |  |
| REQ-029 | 9 | +0 |  |
| REQ-045 | 9 | +0 |  |
| REQ-046 | 8 | +0 |  |
| REQ-047 | 8 | +0 |  |
| REQ-051 | 8 | +0 |  |
| REQ-006 | 6 | +0 |  |
| REQ-033 | 5 | +0 |  |
| REQ-038 | 5 | +0 |  |
| REQ-039 | 5 | +0 |  |
| REQ-044 | 5 | +0 |  |
| REQ-027 | 3 | +0 |  |
| REQ-018 | 2 | +0 |  |
| REQ-019 | 2 | +0 |  |

計測日: 2026-08-30。
<!-- AUTOGEN:END -->

要件行数は要件テーブル行のみをカウント（目的、適用範囲セクションの散文は除外）。

## 他 Design、スキルとの関係

- **`document-model.md` Design 分離基準（REQ-001-068）**: Design 分離基準違反シグナルの判定基準。本 Design は閾値とシグナル加算のみを定義し、Design 分離の判定本体は `document-model.md` に従う
- **`document-model.md` 安定契約の例外（REQ-001-069）**: 安定契約例外の定義。本 Design の Design 分離基準違反検出はこの例外を尊重する
- **`agentdev-req-structure-diagnostics` スキル `req-structure-review.md`**: 6 観点診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）と Design 分離基準違反の 9 シグナル定義。本 Design の閾値はこのスキルの SPLIT 観点の入力
- **`req-impact-map.md`**: アーティファクト種別数の計測に使用する「影響するアーティファクト」列
- **`integrity-rule-catalog.md` IR-044**: REQ/Design 境界違反検出。本 Design の Design 分離基準違反シグナルと連動する

## 機械化境界

本 Design は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

- **req-define Step 3/10-2**: ドラフト段階で SPLIT シグナルを計算し `draft-meta.split-forecast` に記録（REQ-001-011）
- **agentdev-req-structure-diagnostics スキル**: 既存 REQ の健全性診断で本 Design の閾値を適用
- **生成スクリプト**（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）: 本 Design の「現行 REQ の計測例（参照値）」テーブルを実ファイルから再生成する（SC-002）。定期実行を前提とし、計測結果を実ファイルの最新状態に追従させる

本 Design 自体は計測ロジックを実装しない。
閾値の変更は本 Design の更新をもって正とし、各実装は本 Design を参照する。

## REQ 横断診断

REQ 健全性診断は行数・関心数に加え、ステークホルダー視点（REQ-001-079）と Design 分離基準（REQ-001-068）に基づく次の検出パターンを追加する（REQ-036-009、REQ-001）。

### 検出パターン

| パターン | 内容 | SPLIT シグナル計算への反映 |
|---|---|---|
| ステークホルダー不在要件 | 主語がステークホルダーでなく内部成果物、または要求元ステークホルダーが不明（REQ-001-079 違反） | Design 分離基準違反シグナルと同様に +1 |
| 内部成果物主語要件 | 内部成果物（command、skill、script、ファイル）だけを主語とする要件 | +1 |
| パラメータ主題要件 | パス、フィールド、enum、閾値、内部アルゴリズムを主題とする要件（REQ-001-068 Design 分離基準違反） | Design 分離基準違反シグナルとして既存 +1 |
| 作業履歴主題要件 | 作業履歴または是正結果を主題とする要件 | +1 |
| 要件行なしREQ | 要件テーブルが空、または目的・適用範囲のみで要件行を持たない現行 REQ | 計測不能として警告（シグナル加算対象外） |

### 安定契約例外の扱い

安定契約例外（REQ-001-069）に該当する要件行は、上記検出パターンの対象外とする。
例外該当判定は REQ-001-069 の安定契約一覧（公開 command 名、公開入口、ドメイン状態の位置づけ、他 command との接続契約、利用者に見える分類体系、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約）に従う。

### 機械化境界

上記検出パターンの機械判定可能範囲（固有名詞主語検出、 Design 分離基準キーワード検出等）は docs-check が担う。
文脈解釈を要する判定は inspect-docs / `agentdev-doc-writing` が担う（3層検出構造、REQ-036-008）。
本 Design は検出パターンの定義のみを提供し、各実装を規定しない。
