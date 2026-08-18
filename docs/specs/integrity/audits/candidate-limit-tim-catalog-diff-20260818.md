---
id: AUDIT-CANDIDATE-LIMIT-TIM-CATALOG-DIFF
title: "候補数上限回帰の TIM 語彙カタログ置換に伴う期待出力差分と標準上限値決定記録（OU-0002 #2204）"
status: accepted
created: 2026-08-18
audit_for: REQ-040 (REQ-040-008) / REQ-020 (REQ-020-006)
source_issue: "#2204 (OU-0002)"
parent_epic: "#2202 (Epic EU-A Wave 2)"
source_ru: "RU-0047 (OU-0002)"
base_ref: a08384a2 (origin/main)
---

# 候補数上限回帰の TIM 語彙カタログ置換に伴う期待出力差分と標準上限値決定記録（OU-0002 #2204）

> **位置づけ**: 本ファイルは Issue #2204（OU-0002）の実行記録である。
> candidate_limit サブスイートの暫定関係意味表（semantics.ts）を TIM 語彙カタログ定義へ置換し、
> 回帰を再実行して期待出力の差異を文書化した（AG SPEC「標準候補数上限の決定手順」手順1〜3）。
> 標準上限値の最終決定（手順4）と増幅実測値との突合結果を含む。
> 本ファイルは Report であり規範文書ではない（要件の正規定義は REQ-040、REQ-020、手順の正規定義は AG SPEC が所有する）。

## 1. 判定メタデータ

| 項目 | 値 |
|---|---|
| 実施日 | 2026-08-18 (JST) |
| worktree | `.worktrees/2204-feature` (branch: `feature/issue-2204`、base: `a08384a2`) |
| 対象スイート | `src/opencode/skills/agentdev-artifact-graph/scripts/effectiveness/candidate_limit/` |
| 実行コマンド | `bun effectiveness/candidate_limit/run.ts --root <worktree-root> --graph <worktree-root>/.agentdev/graph --json`（scripts ディレクトリを cwd として実行） |
| グラフ生成 | `bun src/build_graph.ts --root <worktree-root> --output <worktree-root>/.agentdev/graph`（同上） |
| 置換前 Graph | input_digest `596060b0…`（1082 nodes / 1634 edges、augmentation 宣言なし） |
| 置換後 Graph | input_digest `4c2c191b…`（1082 nodes / 1634 edges、augmentation 宣言あり） |
| 根拠要件 | REQ-040-008（代表ケース回帰に基づく決定、増幅の上限だけでない抑制）、REQ-020-006（README 経由増幅の再現を含む回帰試験） |
| 関連 ADR 拘束 | CR-001（語彙移行は実測基準。カタログ確定を前提とする手順順序の維持） |

## 2. 置換内容

### 2.1 暫定関係意味表の廃止（semantics.ts）

置換前の `semantics.ts` は契約テキストから直接導出した暫定の関係意味表
（`RELATION_SEMANTICS`、`UNDEFINED_RELATION_SEMANTICS`）とノード役割表
（`NODE_TYPE_ROLES`、`source_file` 型の型ベース割当て）をコード内に保持していた。

置換後は Graph manifest に保存された解決済み TIM 語彙カタログ定義
（`lib/tim.ts` の標準コア関係型 + augmentation の拡張関係型意味定義、`resolveTraceModel` と同一源泉）を
唯一の意味源泉とし、プロファイル参加導出を Trace Query 実装（`lib/trace_query.ts` の PROFILES）と
同一規則へ揃えた。索引・集約役割ノードの除外は中間経路と到達点の両方へ適用する
（TIM 語彙カタログ SPEC「索引・集約成果物の役割識別」、REQ-040-008）。

### 2.2 カタログ実体の宣言（self-hosting augmentation）

`.agentdev/artifact-graph.yaml` へ TIM 語彙カタログ SPEC の宣言様式を適用した。

| 宣言 | 内容 | 出典 |
|---|---|---|
| `delegates_to` の意味定義 | 意味スロット `depend`、変更影響方向 `backward` | TIM SPEC「意味定義の例（self-hosting augmentation）」 |
| `governs` の意味定義 | 意味スロットなし、変更影響方向 `forward` | 同上 |
| `source_file` の役割宣言 | `role: index`（ファイル層を索引役割として探索経路から除外） | TIM SPEC「索引・集約成果物の役割識別」 |

`source_file` 型への一律宣言は、README 等の索引・集約成果物がファイル層にのみ存在する
本リポジトリの構造に基づく粗い宣言である（暫定役割表の型ベース割当てと同範囲）。
定義所在ファイル（REQ-020.md 等）のノードも対象となるため、defined_in 依存の到達点が
dependency 結果から除外される。ファイル単位の細分宣言は将来の改善候補である（本 PR の対象外）。

## 3. 期待出力の差分

### 3.1 代表ケース別の計測値

| case | 暫定表 semantic | カタログ semantic | naive（両時点共通） | 増幅（暫定 → カタログ） | 主な差異要因 |
|---|---|---|---|---|---|
| case-1 related REQ-020 d1 | 4 | 1 | 4 | 0 → 3 | ファイル層（索引役割）の到達点除外 |
| case-2 related REQ-020 d2 | 19 | 13 | 73 | 54 → 60 | 索引候補の除外、delegates_to 意味定義による委譲元 extension の参加 |
| case-3 related AG SPEC d2 | 64 | 46 | 120 | 56 → 74 | 深さ2の索引候補（暫定: 除外規則で削減）が列挙段階で不在、委譲元・skill 参加 |
| case-4 impact REQ-020 d2 | 0 | 0 | 73 | 73 → 73 | 空結果の根拠が「変更影響意味なし」から「到達点が索引役割」へ変化 |
| case-5 impact DEC-005 d2 | 2 | 0 | 42 | 40 → 42 | supersedes の変更影響が `none`（カタログ確定値）へ確定 |
| case-6 dependency ext-case-close d2 | 3 | 3 | 64 | 61 → 61 | 必須候補 3件は不変（delegates_to/extends の意味導出結果が暫定表と一致） |

### 3.2 関係意味の差異（暫定表 → TIM 語彙カタログ確定値）

| 関係型 | 暫定表 | カタログ確定値 | 実測への影響 |
|---|---|---|---|
| `supersedes` | 変更影響 双方向 | 変更影響 `none` | case-5 の後継 Decision 取得が消失（2 → 0） |
| `contains` | impact/dependency 不参加 | `bidirectional`、意味スロット `decompose` で参加 | 到達点がファイル層（索引役割）のため直接の候補増なし |
| `defined_in` | impact/dependency 不参加 | `backward`、意味スロット `specify` で参加 | 同上 |
| `extends` | 依存のみ参加 | `bidirectional`、意味スロット `refine`（impact にも参加） | 必須候補の導出結果は不変 |
| `delegates_to` | コード内暫定表で定義 | augmentation 宣言（`depend`、`backward`） | 導出結果は不変、意味定義の所在をコードから宣言へ移管 |
| `governs` | 定義済み（related 参加のみ） | augmentation 宣言（スロットなし、`forward`） | 導出結果は不変 |
| 実現系列（`realizes` 等） | 不参加 | 不参加（グラフに存在しない） | implementation は正常な空結果で不変 |

### 3.3 期待値の更新（cases.ts、tests/candidate_limit.test.ts）

- case-1 の必須候補: AG SPEC、requirements README、decisions README、自己ファイルの 4件 → AG SPEC の 1件
- case-2 の必須候補: ファイル層 3件を削除（索引役割で候補外）。委譲元 extension は delegates_to の意味定義により残存
- case-5 の必須候補: 後継 Decision（DEC-006）→ なし（supersedes 変更影響なしの確認ケースへ変更）
- 単体テスト: impact の supersedes 両方向追跡を除外へ変更、synthetic Graph の manifest へ TIM カタログ定義と索引役割宣言を付与

## 4. 標準上限値の決定（手順4）

| 項目 | 値 |
|---|---|
| recommended_standard_limit（置換後実測） | 9（全代表ケースの必須候補を保持する最小上限値。暫定表実測は 12） |
| 増幅実測値（naive 巡回との差分） | 42〜74 件（case-5 が 42、case-3 が 74） |
| 決定した標準上限値 | 12（related、impact、dependency、implementation。diagnostics は対象外） |
| 反映先 | `lib/tim.ts` の `DEFAULT_QUERY_SETTINGS.limits`、`effectiveness/candidate_limit/limit.ts` の `DEFAULT_CANDIDATE_LIMIT` |

決定根拠: 実測推奨値 9 以上で AI へ渡す候補量の実用範囲に収まる値として 12 を決定した。
索引・集約成果物経由の増幅は候補数上限ではなく索引役割宣言による探索経路除外で抑制しており、
上限の役割は必須候補の保持と候補過多時5項目の返却に限定される
（REQ-040-008「索引成果物等による候補増幅を候補数上限だけで抑制しない」）。
上限適用後の代表ケース結果: case-2 は 13 候補中 12 を返却（候補過多時5項目あり）、
case-3 は 46 候補中 12 を返却（同）、必須候補の欠落は全ケースでなし（passed: true）。

## 5. Trace Query 実運用への影響

augmentation 宣言の追加により、Trace Query 実装（`lib/trace_query.ts`）の 코드は不変のまま、
本リポジトリのグラフに対する高位問い合わせの挙動が次へ変化する。

- ファイル層（`source_file` 型ノード）が related、impact、dependency、implementation の
  探索経路と到達点から除外される（低位問い合わせ、明示的な索引構造問い合わせでは引き続き利用可能）
- `delegates_to` が impact（逆方向）と dependency（順方向）に、`governs` が impact（順方向）に参加する

## 6. 関連情報

- [agentdev-artifact-graph SPEC「標準候補数上限の決定手順」](../../skills/agentdev-artifact-graph.md) — 手順と決定値の正規定義
- [TIM 語彙カタログ SPEC](../../foundations/traceability-model.md) — 関係意味・役割の正規定義
- Issue #2204（OU-0002）、Epic #2202（EU-A）
