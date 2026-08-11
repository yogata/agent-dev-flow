---
name: agentdev-intake-pipeline
description: intake-from-github（GitHub残課題抽出）と intake-promote（review、分類、振り分け）の知識ベース。USE FOR: GitHub intake抽出ロジック（期間解釈、データ取得、構造検出、LLM解析、item生成）、intake-promote時のreview、分類、整形、振り分け基準、Inbox確認、Review観点、採用/保留/却下の分類判定、promoted/ への保存、Git永続化手順。DO NOT USE FOR: Issue作成（`agentdev-issue-management`）、RU生成（`agentdev-backlog-integration`）、REQ構造診断（`agentdev-req-structure-diagnostics`）、work_type判定（`agentdev-workflow-lifecycle`）
---

# Intake パイプライン知識ベース

intake-from-github と intake-promote コマンドの知識ベース。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-intake-pipeline` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## USE FOR

- GitHub intake抽出ロジック: 期間解釈、データ取得、構造検出、LLM全文解析、intake item生成
- intake-promote時のreview、分類、整形、振り分け基準
- Inbox確認、Review観点、採用/保留/却下の分類判定
- promoted/ への保存、Git永続化手順

## DO NOT USE FOR

- Issue作成: `agentdev-issue-management` を参照
- RU生成: `agentdev-backlog-integration` を参照
- REQ構造診断: `agentdev-req-structure-diagnostics` を参照
- work_type判定: `agentdev-workflow-lifecycle` を参照

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| `/agentdev/intake-from-github` | クローズ済み Issue/PR から残課題を抽出し inbox item を生成する |
| `/agentdev/intake-promote` | inbox item を review、分類、整形、振り分けし promoted/ に保存する |

## 参考文献

| ファイル | 内容 |
|----------|------|
| `references/intake-extraction.md` | GitHub残課題抽出ロジック: 期間解釈、データ取得、構造検出、LLM全文解析、intake item生成 |
| `references/intake-promotion.md` | intake-promote詳細手順: Inbox確認、Review観点、分類提示、ユーザー確認、採用item整形、保存と振り分け、Git永続化、adversarial-review候補判断と内部手続き（経路C） |

## adversarial-review 候補判断と内部手続き（経路C）

本スキルは intake-promote 経路C の review 候補判断と内部手続きの参照実装を `references/intake-promotion.md` に保持する。正典は `agentdev-intake-pipeline` SPEC「adversarial-review 候補判断と内部挿入」節（REQ-{NNNN}-{NNN}）であり、本 SKILL.md は重複定義しない（REQ-{NNNN}-{NNN}）。

| 項目 | 要件 | 概要 |
|---|---|---|
| 挿入位置 | REQ-{NNNN}-{NNN} | Step 4（暫定分類生成）完了後、Step 5（ユーザ提示）開始前 |
| 発動条件判定 / review 呼出 Step 分離 | REQ-{NNNN}-{NNN} | 発動条件判定 Step と review 呼出 Step を独立手順として分離 |
| ユーザー明示指定時の発動 | REQ-{NNNN}-{NNN} | ユーザー明示指定時は必ず発動 |
| 条件非該当時の従来フロー維持 | REQ-{NNNN}-{NNN} | 条件非該当時は従来フローを維持 |

挿入境界、発動条件、戻り先は intake-promote command SPEC「adversarial-review 挿入境界（経路C）」節が正であり、共通契約（任意性、副作用禁止、accepted finding 反映責務、再 review 条件、停止条件、呼出失敗時取扱い）は adversarial-review SPEC「adversarial-review caller integration 共通契約」節（REQ-{NNNN}）が正とする。

## STEP model 連携（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Capability Skill として、intake-from-github / intake-promote command の各 STEP から呼び出される（`docs/specs/<workflows/workflow-skill-model>.md`）。本スキル自身は STEP を所有しない。

### 永続成果物と Input Resolution

本スキルが扱う intake item（`.agentdev/intake/inbox/*.md`）、採用済み成果物（`.agentdev/intake/promoted/*.md`）は durable state 優先順位に従う。(1) SSoT 再構成（inbox/ promoted/ 配下の永続ファイル、REQ/Decision/SPEC は docs/ 配下）、(2) identifier 保持（item path、promoted item path）、(3) 最小 scalar、(4) runtime artifact（暫定分類、評価結果、adversarial-review findings、REQ-{NNNN} lifecycle）。優先順位の詳細は `docs/specs/<workflows/input-resolution-and-durable-state>.md` 参照。

呼出元 STEP は本スキルの出力（採用済み成果物、分類結果レポート）を STEP の result evidence として扱い、次 STEP の Input Resolution で再取得できる。STEP reference 8 要素は `docs/specs/<workflows/step-reference-contract>.md` 参照。

## See Also

- **agentdev-workflow-lifecycle**: work_type判定基準、フェーズ定義
- **agentdev-backlog-integration**: 採用済み成果物から RU への変換
