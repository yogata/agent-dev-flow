---
name: agentdev-architecture-advisory
description: "Requirement definition architecture review support. USE FOR: req-define before ADR judgment when requirements may affect architecture, responsibility boundaries, existing REQ/ADR/SPEC consistency, or external agent integration. DO NOT USE FOR: implementation execution, case-run execution, momus plan review, or file editing."
---

# Architecture Advisory (req-define 事前確認)

req-define が要件を確定する前にアーキテクチャ上の影響を確認するためのスキル。oracle は助言役であり、最終判断は親エージェントが行う。oracle の助言のみを根拠に draft 本文へ確定事項を混入させない（REQ-0139-002, REQ-0139-003, REQ-0139-004）。

- **参照元**: `req-define`（Step 4「要件展開」後・Step 5「ADR判断」前）
- **特性**: アーキテクチャ助言の確認・分類のみを提供する。実装実行・case-run 実行・momus 実行計画確認・ファイル編集は本 skill の対象外。

## 実行条件

req-define が以下のいずれかに該当する場合、draft 完了前かつ ADR 判断確定前に oracle へ確認する（REQ-0139-009）:

- 既存 REQ/ADR/SPEC との衝突可能性
- 新規 ADR 作成または既存 ADR 更新候補
- command / skill / workflow / docs の責務境界変更
- 外部実行手段・OpenCode プラグイン・サブエージェントの責務境界影響
- 複数コマンドにまたがるアーキテクチャ判断
- ユーザー合意だけでは技術的妥当性を確定しづらい場合

## 呼び出し位置

req-define Step 4「要件展開」後、Step 5「ADR判断」前。ADR 判断が確定した後の確認は本 skill の対象外。

## oracle に渡す情報

- 要件候補
- 衝突候補（既存 REQ/ADR/SPEC との矛盾）
- ADR 候補
- SPEC 候補
- 責務境界変更候補
- 未決分岐
- 親エージェントの具体的質問

## oracle から得たい助言

- 推奨方針
- 設計リスク
- ADR 要否判断
- SPEC 分離候補
- 衝突解消方針
- 根拠ファイル
- 確信度

## 親エージェント側の扱い

oracle の助言は判断材料である（REQ-0139-004）。親エージェントは助言内容を以下の4分類に振り分ける:

- **確定事項**: 既存文書またはユーザー合意で裏付けられた内容のみ。draft 本文へ反映可能
- **推定事項**: 裏付けがなく推定に留まる内容。確定事項として draft へ混入させない
- **ユーザー確認事項**: ユーザー合意が必要な内容。ユーザーへ確認する
- **ブロッカー**: 解決不能な未決事項。ブロッカーとして報告する

裏付けのない内容を要件本文へ確定事項として混入させないこと。未決事項が残る場合、req-define は要件doc生成へ進まず壁打ち（Step 2）へ差し戻すこと（REQ-0139-014）。

## oracle 利用不可時の取り扱い

外部助言エージェントが利用できない状態で助言確認が必要な条件（実行条件参照）に該当する場合、req-define はブロッカーとして報告し、静かにスキップしない（REQ-0139-005）。

## 非対象

本 skill は以下を扱わない:

| 非対象 | 責務主体 |
|--------|----------|
| 実装実行 | case-run（`agentdev-case-run-execution-adapter`） |
| 実行計画確認（実装開始前） | momus（oh-my-openagent 利用時） |
| ADR 判断の確定・記録 | req-define 親エージェント（`agentdev-adr-guidelines`） |
| ファイル編集 | 親エージェント・各コマンド |

oracle はファイル編集主体ではない（REQ-0139-003）。draft・REQ・ADR・SPEC・Issue・PR を直接更新しない。

## See Also

- **agentdev-adr-guidelines**: ADR 判断基準・記録（本 skill は ADR 判断前の事前確認）
- **agentdev-req-analysis**: 要件展開・分類ゲート・SPEC 分離候補抽出
