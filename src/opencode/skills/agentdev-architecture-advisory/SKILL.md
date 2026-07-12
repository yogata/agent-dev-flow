---
name: agentdev-architecture-advisory
description: "Requirement definition architecture review support. USE FOR: req-define before ADR judgment when requirements may affect architecture, responsibility boundaries, existing REQ/ADR/SPEC consistency, or external agent integration. DO NOT USE FOR: implementation execution, case-run execution, momus plan review, or file editing."
---

# アーキテクチャ助言（req-define 事前確認）

req-define が要件を確定する前にアーキテクチャ上の影響を確認するためのスキル。
oracle は助言役であり、最終判断は親エージェントが行う。
oracle の助言のみを根拠にドラフト本文へ確定事項を混入させない。

- **参照元**: `req-define`（Step 4「要件展開」後、Step 5「ADR判断」前）
- **特性**: アーキテクチャ助言の確認、分類のみを提供する。実装実行、case-run 実行、momus 実行計画確認、ファイル編集は本スキルの対象外。

## 実行条件

req-define が以下のいずれかに該当する場合、ドラフト完了前かつ ADR 判断確定前に oracle へ確認する:

- 既存 REQ/ADR/SPEC との衝突可能性
- 新規 ADR 作成または既存 ADR 更新候補
- command/ skill/ workflow/ docs の責務境界変更
- 外部実行手段、OpenCode プラグイン、サブエージェントの責務境界影響
- 複数コマンドにまたがるアーキテクチャ判断
- ユーザー合意だけでは技術的妥当性を確定しづらい場合

## 呼び出し位置

req-define Step 4「要件展開」後、Step 5「ADR判断」前。
ADR 判断が確定した後の確認は本スキルの対象外。

## oracle 相談の標準入力テンプレート（REQ）

oracle への相談入力は以下 5 要素の標準テンプレートで構築する。
親エージェント（req-define）がテンプレートに沿って入力を組み立て、欠落要素がないか確認してから oracle へ渡す。

| 要素 | 内容 |
|------|------|
| 要件候補 | 今回確定しようとする要件行候補、対象範囲 |
| 衝突候補 | 既存 REQ/ADR/SPEC との矛盾、責務境界変更候補 |
| ADR 候補 | 新規 ADR 作成または既存 ADR 更新の候補 |
| 既存 ADR との関連 | 既存 ADR との意味的重複、適用範囲の重なり、relates-to 関係 |
| 親エージェントの判断質問 | oracle に答えてほしい具体的質問、未決分岐 |

SPEC 分離候補は要件候補、衝突候補に付随情報として併記し、独立要素とはしない。

## oracle 出力の 4 ラベル構造（soft-contract、REQ）

oracle への出力を 4 ラベル構造で要求する。
ラベル構造は soft-contract（ADR）とし、厳格なスキーマ検証を導入しない。
oracle は助言にラベルを付けて返すが、最終的なラベル分類の権限は親エージェントが保持する。
親エージェントは oracle のラベル付けを参考にしつつ、最終分類を自身で確定する。

| ラベル | 意味 | 親エージェントの扱い |
|--------|------|---------------------|
| 確定事項 | 既存文書またはユーザー合意で裏付けられた内容 | ドラフト本文へ反映可能 |
| 推定事項 | 裏付けがなく推定に留まる内容 | 確定事項としてドラフトへ混入させない |
| ユーザー確認事項 | ユーザー合意が必要な内容 | ユーザーへ確認する |
| ブロッカー | 解決不能な未決事項 | ブロッカーとして報告する |

oracle は推奨方針、設計リスク、ADR 要否判断、衝突解消方針、根拠ファイル、確信度を助言内容として含め、各助言に上記ラベルを付ける。
ラベルは soft-contract であり、oracle が付けたラベルを親エージェントがそのまま採用するとは限らない。

## 親エージェントの分類権限

oracle の助言は判断材料である。
親エージェントは oracle が付けたラベルを参考にしつつ、最終的な分類を自身で確定する。
既存文書またはユーザー合意で裏付けられていない内容を要件本文へ確定事項として混入させないこと。
未決事項が残る場合、req-define は要件doc生成へ進まず壁打ち（Step 2）へ差し戻すこと。

## oracle 利用不可時の取り扱い

外部助言エージェントが利用できない状態で助言確認が必要な条件（実行条件参照）に該当する場合、req-define はブロッカーとして報告し、静かにスキップしない。

## 非対象

本スキルは以下を扱わない:

| 非対象 | 責務主体 |
|--------|----------|
| 実装実行 | case-run（`agentdev-case-run-execution-adapter`） |
| 実行計画確認（実装開始前） | momus（外部実行基盤利用時） |
| ADR 判断の確定、記録 | req-define 親エージェント（`agentdev-adr-guidelines`） |
| ファイル編集 | 親エージェント、各コマンド |

oracle はファイル編集主体ではない。
ドラフト、REQ、ADR、SPEC、Issue、PR を直接更新しない。

## See Also

- **agentdev-adr-guidelines**: ADR 判断基準、記録（本スキルは ADR 判断前の事前確認）
- **agentdev-req-analysis**: 要件展開、分類ゲート、SPEC 分離候補抽出


