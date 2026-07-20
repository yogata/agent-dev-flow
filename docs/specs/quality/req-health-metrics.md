---
status: accepted
---

# REQ 健全性メトリクス

REQ の肥大化、関心ズレを定量的に検出するための閾値を定義する（REQ-0136-040）。
`req-define` の Step 3（既存 REQ 照合）、Step 10-2（統合/分離判定）、`inspect-docs`、`agentdev-req-structure-diagnostics` スキルが本 SPEC を参照して SPLIT 予兆を判定する。

## 適用範囲

- **対象**: 現行 REQ ファイル（`docs/requirements/REQ-NNNN.md`）の要件テーブル行（`| REQ-NNNN-MMM | ... |`）。目的、適用範囲セクションの散文は計測対象外
- **対象外**: 廃止 REQ、draft、SPEC、ADR、guides

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

### SPEC 分離基準違反（high-specificity signal）

`agentdev-req-structure-diagnostics` スキルの SPEC 分離基準違反シグナル（`req-structure-review.md`「SPEC 分離基準違反検出」）は、1 シグナルでも検出された場合 SPLIT シグナル +1 として扱う。
これは要件行数、関心分類数とは独立に加算する。

安定契約例外（REQ-0101-069、`document-model.md`「安定契約の例外」）に該当する要件行は、SPEC 分離基準違反の検出対象外とする。

## 推奨アクションへの対応付け

合算した SPLIT シグナル数に基づき、`req-define` Step 10-2 と `agentdev-req-structure-diagnostics` が推奨アクションを提示する:

| SPLIT シグナル合計 | 推奨アクション | req-define での扱い |
|---|---|---|
| 0〜1 | no-action / APPEND | 既存 REQ への APPEND を許可 |
| 2 | SPLIT 検討 | APPEND の前にユーザーへ SPLIT 要否を提案 |
| 3 以上 | SPLIT 推奨 | SPLIT を強く推奨。APPEND の場合は理由を明記 |

`agentdev-req-structure-diagnostics` スキルのシグナル閾値（1 シグナル=観察メモ、2 シグナル=問題候補、3 シグナル=高優先度）と本 SPEC の閾値は整合する。
同スキルの判定結果出力スキーマ（観点、対象、根拠、シグナル数、確信度、推奨アクション、req-define 入力案）に本 SPEC のシグナル計算結果を埋め込む。

## 現行 REQ の計測例（参照値）

本 SPEC の閾値を現行 REQ に適用した結果の参照値。
定期計測時の推移比較に使用する。

<!-- AUTOGEN:BEGIN:id=req-metrics-measurement-example -->
| REQ | 要件行数 | 行数シグナル | 備考 |
|---|---|---|---|
| REQ-0114 | 98 | +2 | case-auto。ライフサイクル段階混在で関心シグナル追加 |
| REQ-0103 | 90 | +2 | アーティファクト責任分界。肥大化 |
| REQ-0101 | 63 | +1 | 文書、REQ 管理基準 |
| REQ-0102 | 62 | +1 | 要件定義、保存 |
| REQ-0112 | 55 | +1 | ADR ライフサイクル |
| REQ-0104 | 51 | +1 |  |
| REQ-0108 | 46 | +0 | docs-check / Validation |
| REQ-0140 | 41 | +0 |  |
| REQ-0138 | 33 | +0 |  |
| REQ-0141 | 33 | +0 |  |
| REQ-0119 | 31 | +0 | コマンド、スキル責務分界 |
| REQ-0130 | 31 | +0 |  |
| REQ-0131 | 28 | +0 |  |
| REQ-0144 | 27 | +0 |  |
| REQ-0132 | 26 | +0 |  |
| REQ-0109 | 25 | +0 |  |
| REQ-0148 | 24 | +0 |  |
| REQ-0127 | 22 | +0 |  |
| REQ-0136 | 21 | +0 | REQ/SPEC/ADR 適正運用自動化 |
| REQ-0124 | 20 | +0 |  |
| REQ-0145 | 17 | +0 |  |
| REQ-0105 | 15 | +0 |  |
| REQ-0107 | 14 | +0 |  |
| REQ-0139 | 13 | +0 |  |
| REQ-0146 | 13 | +0 |  |
| REQ-0149 | 12 | +0 |  |
| REQ-0156 | 12 | +0 |  |
| REQ-0162 | 12 | +0 |  |
| REQ-0125 | 11 | +0 |  |
| REQ-0151 | 11 | +0 |  |
| REQ-0113 | 10 | +0 |  |
| REQ-0126 | 10 | +0 |  |
| REQ-0129 | 10 | +0 |  |
| REQ-0123 | 9 | +0 |  |
| REQ-0147 | 9 | +0 |  |
| REQ-0128 | 8 | +0 |  |
| REQ-0133 | 8 | +0 |  |
| REQ-0137 | 8 | +0 |  |
| REQ-0150 | 8 | +0 |  |
| REQ-0155 | 8 | +0 |  |
| REQ-0142 | 7 | +0 |  |
| REQ-0106 | 6 | +0 |  |
| REQ-0110 | 5 | +0 |  |
| REQ-0161 | 5 | +0 |  |
| REQ-0143 | 4 | +0 |  |
| REQ-0154 | 4 | +0 |  |
| REQ-0159 | 4 | +0 |  |
| REQ-0152 | 3 | +0 |  |
| REQ-0163 | 3 | +0 |  |
| REQ-0153 | 2 | +0 |  |
| REQ-0158 | 2 | +0 |  |
| REQ-0134 | 0 | +0 |  |
| REQ-0135 | 0 | +0 |  |
| REQ-0160 | 0 | +0 |  |

計測日: 2026-07-20。
<!-- AUTOGEN:END -->

要件行数は要件テーブル行のみをカウント（目的、適用範囲セクションの散文は除外）。

## 他 SPEC、スキルとの関係

- **`document-model.md` SPEC 分離基準（REQ-0101-068）**: SPEC 分離基準違反シグナルの判定基準。本 SPEC は閾値とシグナル加算のみを定義し、SPEC 分離の判定本体は `document-model.md` に従う
- **`document-model.md` 安定契約の例外（REQ-0101-069）**: 安定契約例外の定義。本 SPEC の SPEC 分離基準違反検出はこの例外を尊重する
- **`agentdev-req-structure-diagnostics` スキル `req-structure-review.md`**: 6 観点診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）と SPEC 分離基準違反の 9 シグナル定義。本 SPEC の閾値はこのスキルの SPLIT 観点の入力
- **`req-impact-map.md`**: アーティファクト種別数の計測に使用する「影響するアーティファクト」列
- **`integrity-rule-catalog.md` IR-044**: REQ/SPEC 境界違反検出。本 SPEC の SPEC 分離基準違反シグナルと連動する

## 機械化境界

本 SPEC は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

- **req-define Step 3/10-2**: ドラフト段階で SPLIT シグナルを計算し `draft-meta.split-forecast` に記録（REQ-0136-011）
- **agentdev-req-structure-diagnostics スキル**: 既存 REQ の健全性診断で本 SPEC の閾値を適用
- **生成スクリプト**（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）: 本 SPEC の「現行 REQ の計測例（参照値）」テーブルを実ファイルから再生成する（AG-006 候補5、SC-002 Phase C）。定期実行を前提とし、計測結果を実ファイルの最新状態に追従させる

本 SPEC 自体は計測ロジックを実装しない。
閾値の変更は本 SPEC の更新をもって正とし、各実装は本 SPEC を参照する。
