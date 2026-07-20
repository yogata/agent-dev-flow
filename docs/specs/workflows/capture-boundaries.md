---
title: キャプチャ境界
status: accepted
created: 2026-06-21
updated: 2026-07-12
---

# キャプチャ境界（Capture Boundaries）

> 本 SPEC は intake / learning の境界定義、Split Rule、PR 本文永続チャネル、REQ 再構成 intake など、複数コマンド、スキルにまたがるキャプチャ契約を定義する。
> 個別 command の capture 責務は各 command SPEC を参照。

## 目的

各コマンドが作業中に発見した本筋外情報をどこに、どの形式で退避するかの境界を定める。
capture は作業本筋を進めるための副作用管理機構であり、主成果物に混入させないことを目的とする。

## Intake / Learning 境界

| 領域 | 定義 | 保存先 | 目的 |
|---|---|---|---|
| **intake** | 今回の作業本筋では扱わないが、後で対応要否を判断すべき具体的な作業候補、不整合、規約違反、未回収課題 | `.agentdev/intake/inbox/` | 積み残し作業の回収、Issue化 |
| **learning** | 作業中の失敗、回避、修正、判断ミス、手順漏れから次回以降の再発防止に使う知見 | `.agentdev/learning/` | 知見の分類、昇華、反映 |

## 分割ルール（Split Rule）

```
具体的修正対象がある → intake item
再発防止知見がある → learning item
両方ある → 分割（intake item + learning item を別々に作成）
どちらでもない → 記録対象外（完了報告に候補として提示）
```

intake 候補と learning 候補は必ず別々の成果物として扱い、混在させない。

## PR 本文永続チャネル

case-run で発見した本筋外検出事項（Finding）の永続化チャネルとして PR 本文を使用する（REQ-0106）。

- 書込み元: case-run 経由の実行担当サブエージェント（Step 6 委譲先）
- 読取り元: case-close（Step 9-2）
- 各 case-run は自身の PR にのみ書込み。`.agentdev/intake/inbox/` は直接変更しない
- capture 候補を intake 候補と learning 候補に分け、別々の成果物として扱う（Split Rule に準拠）
- Epic 横断回収: Epic モード時、case-close は関連子 Issue PR 群の本文を横断走査して検出事項を回収

### PR 本文セクション構造

PR 本文の capture 関連セクションは以下を分離する:

- `## Findings / Capture候補`（本筋外発見（intake/learning 候補））。case-run 経由の実行担当サブエージェントが記録
- `## SPEC確定候補`（実装で判明した SPEC レベル詳細（schema、enum、判定表、内部アルゴリズム等））。`## Findings / Capture候補` とは別セクション（ADR-0123 Decision #4, REQ-0136-015）

## 各コマンドの capture 責務

| コマンド | intake | learning | 備考 |
|---|---|---|---|
| req-define | 非関与 | 非関与 | - |
| req-save | REQ再構成 intake（`.agentdev/intake/inbox/req-restructure/`）のみ生成可能 | 非関与 | 例外のみ許可 |
| spec-save | 非関与 | 非関与 | - |
| case-open | 非関与 | 非関与 | - |
| case-run | PR 本文記録のみ（直接 inbox 変更禁止） | PR 本文記録のみ（直接 inbox.md 変更禁止） | 実行担当サブエージェント経由 |
| case-close | PR 本文から回収し inbox へ保存 | PR 本文から回収し inbox.md へ保存 | Epic 横断回収含む |
| case-auto | 各工程の責務を継承 | 各工程の責務を継承 | - |
| case-update | 非関与 | 非関与 | REQ 更新、レビュー NG コメント、Issue 本文更新のみ |
| intake-* | 各コマンド責務（各 command SPEC 参照） | - | - |
| learning-promote | - | 各コマンド責務（command SPEC 参照） | - |
| inspect-* | 各コマンド責務（各 command SPEC 参照） | - | - |
| backlog-review | 非関与 | 非関与 | RU 生成のみ |

詳細は各 command SPEC を参照。

## REQ 再構成 intake

通常intakeとは独立した配置規約（REQ-0109）。

| 状態 | パス |
|---|---|
| inbox | `.agentdev/intake/inbox/req-restructure/` |
| 却下 | 即時削除（`archive/rejected/` 廃止）。reject commit message に却下理由を含めることで監査証跡を確保 |

req-define の明示入力としてルーティングする（backlog-review 経由ではない）。検知カテゴリ: SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT

## Post-Run Capture（実行後キャプチャ）

`case-run` および `case-close` での本筋外発見の退避仕様。

- 一次参照: `agentdev-workflow-orchestration` skill の `references/capture-boundaries.md`
- case-run 退避方針: case-run command SPEC 参照
- case-close post-run capture: case-close command SPEC 参照

## See Also

- [workflow-contracts.md](workflow-contracts.md)（ワークフロー全体契約）
- [backlog-artifact-lifecycle.md](backlog-artifact-lifecycle.md)（採用済み成果物 lifecycle）
- 各 command SPEC（`docs/specs/commands/`）
- `agentdev-workflow-orchestration` skill（capture 境界の詳細）
- REQ-0106（Case実行オーケストレーション / Epic、Wave）
- REQ-0109（REQ 再構成 intake）
