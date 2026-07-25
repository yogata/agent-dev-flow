---
id: ADR-001
title: "v3 charter（AgentDevFlow v3 憲章）"
status: accepted
created: "2026-07-24"
updated: "2026-07-24"
---

# ADR-001: v3 charter（AgentDevFlow v3 憲章）

## 背景

AgentDevFlow v2.11.0 までに蓄積した統制体系は、開発効率と品質を支えてきた一方で、次の過剰・重複を生じていた。

- 配布 command の frontmatter `agent:` 固定など、harness 選定領域へ ADF core が踏み込む統制
- SPEC へ実装詳細（CLI 引数、report スキーマ、fixture 構成等）が侵出し、契約と実装が混在
- 一度限りの移行検査（IR-009/057）と歴史経緯語彙検出が恒久 integrity rule 化
- `requirements/mapping-table.md` が現行判断の入り口として参照され、一時成果物が恒久化
- ADR-011/ADR-011、ADR-001/ADR-011-038 等、同じ意味空間を複数成果物が所有

v3.0.0 は機能追加ではなく、これら過剰統制の削減、責務の限定と明確化、harness・model・project との責任分界の明確化、REQ/ADR/SPEC/command/skill/template/checker の重複削減、新規統制を安易に追加しない仕組みの確立を目的とする基準体系の再構築である（plan.md sec1）。

過剰統制を是正するために巨大な新規統制体系を作っては本末転倒である。本 ADR は v3 の基本原則を最小限の決定として定め、個別の統制追加・削除・統合判断をこの原則へ照らして行うための基準を提供する。

## 決定

### 決定1: ADF の中心責務

ADF は次を所有する（plan.md sec3.1）。

- 要求の形成と合意
- 事実調査とユーザー意思決定の分離
- REQ/ADR/SPEC 等の成果物責任分界
- 実行可能な作業単位の形成
- Issue/PR/Case 間の工程接続
- SSoT の移行
- 承認境界
- 許可・禁止副作用
- 永続状態
- 依存、停止、再開、競合防止
- 受け入れ条件と完了証拠
- 実装中の発見の還流

### 決定2: ADF が所有しない領域

次の具体的実現方法は harness、AI モデル、適用プロジェクトへ委譲する（plan.md sec3.2）。

- モデル選定、エージェント選定、サブエージェント階層
- skill の具体的な呼出し
- timeout、retry、context 管理
- TDD の具体的手順
- コードレビューエージェントの種類と構成
- デバッグ方法
- 実装計画の内部形式
- コード構造とテスト構造

ADF は検証能力、回帰防止、独立レビュー等の「必要能力」と「標準方針」を定義してよい。ただし特定のエージェント名、skill 名、起動 API、実行順序まで ADF core で固定しない。

### 決定3: hard governance の限定

hard governance（工程停止を要求する機械的強制）は、次の8点に限定する（plan.md sec3.3）。

1. 状態破壊
2. 権限逸脱
3. ユーザー合意の偽装
4. 作業または永続情報の喪失
5. 二重実行、競合更新
6. 誤った成果物の正規化
7. 下流工程の実行不能
8. 後から検出・回復できない重大な失敗

文章品質、推奨する実装方法、分類の細部、改善候補は、原則として guidance または finding として扱い、工程停止条件にしない。

### 決定4: 新規統制追加の原則

新しい REQ、SPEC、ADR、command、skill、state、schema、gate、必須 field、checker を追加しないことを既定とする（plan.md sec5）。

新規 hard control を提案する場合は、次の7条件を全て立証すること。

1. 再現可能または複数回観測された問題がある
2. 被害が hard control に値する
3. 削除、統合、interface 縮小、guidance 改善では防げない
4. 実際に機械的または運用上強制できる
5. 正規所有者が一つに定まる
6. 既存の何を削除または簡略化できるか説明できる
7. 将来の削除条件または再評価条件がある

「念のため」「将来必要かもしれない」「網羅性を上げたい」のみでは追加理由としない。

### 決定5: v3 管理方式

| 項目 | v3 における取扱い |
|------|------------------|
| 最終 v2 tag | v2.11.0（commit d1b4699）。v2 の完全な履歴基準 |
| v3 統合ブランチ | `v3/rebuild`。cutover 時 `main` へ反映 |
| v2 保守 | 停止。cutover 後 v2 への修正は行わず、tag 参照のみ |
| prerelease tag | なし。直接 `v3.0.0` を付与。smoke 検証は commit hash で実施 |
| REQ/ADR 番号 | 新枠 `REQ-001〜`、`ADR-001〜`（3桁プレフィックス廃止）。v2 文書は `v2:REQ-0119` 等の表記で区別 |
| docs ディレクトリ配置 | 現行配置（`docs/requirements\|adr\|specs\|guides`）を維持 |
| Local backend | 必須範囲に維持。仕様は最小契約へ縮小（WS-9 で対応） |
| draft 形式 | 案B（承認済 change brief）へ縮小。詳細は別途 REQ で定義 |

状態管理の分離（plan.md sec6.3）: 基準文書と実装は Git、作業状態は GitHub Issue/Project、v2/v3 履歴境界は Git tag、棚卸し対応表は one-time 成果物、実装差分は PR。Issue/Project の状態を REQ/ADR/SPEC/draft へ複製しない。

### 決定6: cutover 条件

v3.0.0 の cutover（main 統合と tag 付与）は、次の全てを満たした場合のみ行う（plan.md sec7 Stage7）。

1. 本 charter の決定1〜5を満たす
2. v3 基準文書が v2 を読まずに自足している
3. command、skill、template、checker が v3 基準と整合する
4. 必須シナリオ（plan.md sec7 Stage6 の10シナリオ）が通る
5. v2 互換範囲が明確
6. active な v2 draft、RU、Issue の扱いが決着している（現状 open=0、空）
7. one-time 成果物の移管漏れがない
8. migration note または release note がある
9. main へ統合可能
10. v3.0.0 tag を付与可能

## 代替案

1. **v2 からの逐語修正で v3 を表現**: 履歴境界が曖昧になる、過剰統制が温存されるため不採用。clean-slate 再構成を許容する（plan.md sec7 Stage4）。
2. **新枠番号を採用せず v2 からの継続採番（v2:REQ-0164〜、v2:ADR-0140〜）**: v2/v3 の視覚的区別が付きにくい、`mapping-table.md` が不要にならないため不採用。ユーザー指示により新枠（`REQ-001〜`、`ADR-001〜`）を採用。
3. **charter を複数 REQ へ細分化**: charter の精神を個別要件へ分散させると原則判断の場が失われる。本 ADR で一括定義し、必要に応じて Stage 4 で REQ 群へ展開する。

## 結果、影響

- 配布物（command/skill/SPEC/template/script）から harness 固有記述を除去する個別判断は、本 charter の決定2へ照らして行う。
- 既存 SPEC から実装詳細を剥離する判断は、決定3（hard governance 限定）と決定4（新規統制追加抑制）へ照らして行う。
- 既存の v2:ADR-0136（harness 実行制御分離）、v2:ADR-0139（正規所有モデル）は本 charter の先駆的適用として維持し、v3 文脈で本体へ昇格する（relates-to）。
- 既存 v2 ADR の本文は書き換えない。tag 参照で維持する（plan.md sec11）。
- 既存 v2 REQ/SPEC は Stage 4 で再構築する。`requirements/mapping-table.md` は新枠採用により不要となるため廃止する。
- one-time 成果物（`.agentdev/v3-migration/decisions.md` 等）は Stage 4/5 完了後に廃棄する。

## 関連する決定

- v2:ADR-0136（配布物の harness 実行制御分離）: relates-to。決定2（ADF が所有しない領域）の先駆的適用。v2 では個別事象として処理していたものを、v3 では charter 原則として確立する。
- v2:ADR-0139（REQ/SPEC 意味分類と正規所有モデル）: relates-to。決定4（新規統制追加原則）と組み合わせ、正規所有の一意性と重複所有の排除を担保する基盤。
- v2:ADR-0102〜0107（実行時/編集時分離、文書種別責務境界、実行時独立性、source/projection 分離、責任分界）: relates-to。v3 でも枠組みを維持するが、個別表現は Stage 4 で再構築する。

## 承認記録

- 承認日: 2026-07-24
- 承認根拠: v3 移行計画初回出力（plan.md sec12 14項目）のユーザー承認（Z:i）と、Stage 0 合意事項（`.agentdev/v3-migration/decisions.md`）に基づく U1〜U11 の確定。
