# `candidate_limit/` — 高位問い合わせ候補数上限回帰 (REQ-{NNNN}-006)

高位問い合わせの標準候補数上限を決定する根拠となる回帰検証資産。
**代表質問回帰検証（REQ-{NNNN}-003、親 [effectiveness/](../README.md)）の体系に接続して運用する**。

> **本サブスイートは回帰試験である。** 親 effectiveness harness が diagnostic 専用
> （終了コード 0 固定）であるのに対し、本サブスイートは必須候補欠落・増幅未再現・
> 誤通過・境界違反を検出した場合に終了コード 1 を返す。

## REQ-{NNNN}-003 体系への接続

- **実行契機**: 解析スクリプト、抽出ルール、関係意味表の変更時、および定期回帰検証。
  親 effectiveness harness と同じ契機で実行する
- **実入力原則**: 代表ケースは real artifact（docs 配下の正規成果物、extension 定義）のみを
  参照し、mock/stub を使用しない（実入力 fixture 設計原則に準拠）
- **再現性**: 同一 Graph（`manifest.json` の `input_digest` 同一）から同一の判定結果を得る
- **境界**: 親 harness が所有する代表質問 6 query suite と 10件選定基準は再定義しない。
  本ディレクトリの代表ケースは「代表質問」とは別概念の
  「候補数上限決定用代表ケース」（高位問い合わせ要件の代理検証ケース）である
- **版管理**: 代表ケース（`cases.ts`）の追加、変更、廃止は選定根拠
  （`selectionRationale`）を更新した上で行う

## 構成

```
candidate_limit/
├── types.ts      — 代表ケース、結果5要素、過多時5項目、問い合わせ設定の型
├── semantics.ts  — TIM 語彙カタログ定義（Graph manifest）に基づく候補列挙
├── cases.ts      — 代表ケース6件（real artifact 参照、選定基準メタデータ付き）
├── limit.ts      — 候補数上限の適用（決定論的優先・除外規則、過多時5項目）
├── harness.ts    — 代表ケース実行、増幅再現、意味分離、境界不変式の判定
├── run.ts        — CLI entry point（回帰レポート / JSON 出力、不合格時 exit 1）
└── README.md     — 本ファイル
```

単体試験（境界試験、増幅再現の機構検証）は `tests/candidate_limit.test.ts` が所有する。

## 実行方法

```bash
cd src/opencode/skills/agentdev-artifact-graph/scripts

# 前提: Graph 生成済み（親 effectiveness と同一手順）
bun src/build_graph.ts --root ../../../../../.. --output ../../../../../../.agentdev/graph

# 回帰試験の実行（不合格時は終了コード 1）
bun effectiveness/candidate_limit/run.ts --root ../../../../../.. --graph ../../../../../../.agentdev/graph

# 問い合わせ設定の候補数上限を実行時上書きする場合
bun effectiveness/candidate_limit/run.ts --root ../../../../../.. --graph ../../../../../../.agentdev/graph --limit 20

# JSON 形式（CI / 後段集計）
bun effectiveness/candidate_limit/run.ts --root ../../../../../.. --graph ../../../../../../.agentdev/graph --json
```

## 代表ケース6件

| id | class | profile | 起点 | 確認対象 |
|---|---|---|---|---|
| case-1 | normal | related | 要件（解析品質 REQ） | 直結参照のみの基線。一般参照で到達する AG SPEC のみ（ファイル層は索引役割で除外） |
| case-2 | amplification | related | 要件（解析品質 REQ） | README 経由の既知の候補増幅の再現（索引・集約成果物ファンアウト） |
| case-3 | amplification | related | SPEC（agentdev-artifact-graph） | SPEC 索引経由の増幅。委譲元 extension（delegates_to のカタログ意味定義）と拡張関係（extends）の参加 |
| case-4 | semantic-separation | impact | 要件（解析品質 REQ） | 変更影響関係の到達点はファイル層（索引役割）のみ → 正常な空結果。一般参照の誤通過なし |
| case-5 | semantic-separation | impact | Decision（superseded 済み Decision） | supersedes の変更影響なし（TIM カタログ確定値）→ 正常な空結果。README 増幅の排除 |
| case-6 | semantic-separation | dependency | extension（委譲元 workflow extension） | delegates_to / extends の依存意味（カタログ意味定義から導出）による依存先の特定 |

各ケースの選定根拠は `cases.ts` の `selectionRationale` を参照。

## 判定基準（回帰試験の合否）

1. **必須候補の欠落なし**: 全代表ケースの `requiredCandidates` が、意味列挙と
   上限適用（既定の問い合わせ設定）後の返却候補に含まれること
2. **既知の候補増幅の再現**: 増幅ケースで、意味フィルタなし巡回（neighbors）と
   プロファイル意味列挙の差分が `minAmplifiedCount` 以上であること
3. **一般参照の誤通過なし**: impact / dependency の結果に一般参照
   （`references`）で到達した候補が含まれないこと
4. **空結果の正常扱い**: 候補が存在しない場合に truncation 等の異常扱いをしないこと
5. **境界不変式**: 上限直前（過多時5項目の返却）、上限一致（truncation なし・全候補返却）、
   上限超過（同左）がすべて成立すること。過多時5項目は候補過多であること、全候補数、
   返却候補数、適用した絞り込み規則、独立探索へ移行可能であること
6. **根拠分離**: 問い合わせ結果（結果5要素: 候補成果物、理由、トレースリンク型、
   探索方向、到達経路）に根拠詳細が重複保持されないこと。根拠詳細は根拠問い合わせ
   （provenance、`query_graph.ts`）で取得する

## 標準上限値の決定手順

1. 本回帰を実行し、`recommended_standard_limit`（全代表ケースの必須候補を保持する
   最小上限値）と増幅実測値（`amplified` 列）を確認する
2. 標準上限値は `recommended_standard_limit` 以上で、AI へ渡す候補量の実用範囲に
   収まる値として決定する。決定した値は問い合わせ設定
   （`limit.ts` の `DEFAULT_CANDIDATE_LIMIT`）として管理し、適用ロジックへ直書きしない
3. 上限値の変更によって TIM 上の関係意味または探索意味を変更しない
   （TIM 4層分離 Decision の拘束。本サブスイートの上限適用は順序付けと件数制限のみを行う）

現在の標準上限値は 12 である（TIM 語彙カタログ置換後の再計測に基づく決定値。
recommended_standard_limit 実測値 9、決定手順と決定根拠は AG SPEC
「標準候補数上限の決定手順」節、期待出力の差異は
candidate-limit-tim-catalog-diff-20260818.md を参照）。

## 関係意味とノード役割の定義源泉（重要な制約）

`semantics.ts` の関係意味（変更影響方向、依存方向、実現系列への参加）とノード役割
（索引・集約成果物の識別）は、Graph manifest に保存された解決済み TIM 語彙カタログ定義
（`lib/tim.ts` の標準コア関係型 + augmentation の拡張関係型意味定義・役割宣言）から導出する。
本サブスイートは独自の関係意味表を持たない（暫定関係意味表は TIM カタログ置換で廃止）。
カタログ定義（augmentation の意味定義・役割宣言を含む）を変更した場合は本回帰を再実行して
期待出力の差異を文書化する（代表質問回帰検証の合格基準に準拠）。
拡張関係型は augmentation 内に意味定義を宣言しない限り高位問い合わせに参加しない
（TIM 語彙カタログ SPEC「意味の自動推定の禁止」）。

## 対象外

- diagnostics プロファイル（構造診断であり候補数上限回帰の対象外）
- 高位問い合わせ実装本体（Trace Query 層エンジン）の振る舞い検証。
  本サブスイートは上限決定の根拠計測と契約不変式の回帰を所有し、
  エンジン本体の検証は実装側の test suite が所有する

## 関連情報

- [REQ-{NNNN}](../../../../../../../docs/requirements/REQ-{NNNN}.md) — 代表質問回帰検証、候補数上限回帰の接続（解析品質 REQ）
- [REQ-{NNNN}](../../../../../../../docs/requirements/REQ-{NNNN}.md) — 高位問い合わせ、候補数上限、候補過多時動作（Trace Query REQ）
- AG SPEC「高位問い合わせプロファイル」節 — 共通規則、標準上限値の決定手順と決定値
- TIM 語彙カタログ SPEC — 関係意味の正規定義（本サブスイートの意味源泉）
- 親 [effectiveness/README.md](../README.md) — 代表質問回帰検証（REQ-{NNNN}-003）
