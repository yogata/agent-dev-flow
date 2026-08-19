---
title: キャプチャ境界
status: accepted
created: 2026-06-21
updated: 2026-07-27
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

case-run で発見した本筋外検出事項（Finding）の永続化チャネルとして PR 本文を使用する（REQ-006）。

- 書込み元: case-run 経由の実行担当サブエージェント（Step 6 委譲先）
- 読取り元: case-close（Step 9-2）
- 各 case-run は自身の PR にのみ書込み。`.agentdev/intake/inbox/` は直接変更しない
- capture 候補を intake 候補と learning 候補に分け、別々の成果物として扱う（Split Rule に準拠）
- Epic 横断回収: Epic モード時、case-close は関連子 Issue PR 群の本文を横断走査して検出事項を回収

### PR 本文セクション構造

PR 本文の capture 関連セクションは以下を分離する:

- `## Findings / Capture候補`（本筋外発見（intake/learning 候補））。case-run 経由の実行担当サブエージェントが記録
- `## SPEC確定候補`（実装で判明した SPEC レベル詳細（schema、enum、判定表、内部アルゴリズム等））。`## Findings / Capture候補` とは別セクション（v2:ADR-0123 Decision #4, REQ-001-015）

## 各コマンドの capture 責務

| コマンド | intake | learning | 備考 |
|---|---|---|---|
| req-define | 非関与 | 非関与 | - |
| req-save | REQ 再構成 intake に加え自工程 deviation capture | 自工程 deviation capture | Split Rule で分類、Skill 委譲で保存（REQ-006-106） |
| design-save | 自工程 deviation capture | 自工程 deviation capture | 従来非関与から変更（REQ-006-107） |
| case-open | 自工程 deviation capture | 自工程 deviation capture | case-close への委譲を廃止（REQ-006-021） |
| case-run | PR 本文記録のみ（直接 inbox 変更禁止） | PR 本文記録のみ（直接 inbox.md 変更禁止） | 実行担当サブエージェント経由 |
| case-close | PR 本文から回収 + 自工程 deviation capture | PR 本文から回収 + 自工程 deviation capture | Epic 横断回収含む（REQ-006-105） |
| case-auto | 各工程の保存結果参照と件数集計のみ | 各工程の保存結果参照と件数集計のみ | capture 本文の再分類・再保存は行わない（REQ-006-108） |
| case-update | 非関与 | 非関与 | REQ 更新、レビュー NG コメント、Issue 本文更新のみ |
| intake-* | 各コマンド責務（各 command SPEC 参照） | - | - |
| learning-promote | - | 各コマンド責務（command SPEC 参照） | - |
| inspect-* | 各コマンド責務（各 command SPEC 参照） | - | - |
| backlog-review | 非関与 | 非関与 | RU 生成のみ |

詳細は各 command SPEC を参照。

### CaptureBoundary 検査の例外判定規則

CaptureBoundary 検査（`check_integrity.ts` の `command-capture-duty`）は、上記 capture 責務表を起点とした一般規則で例外を判定する。
command ごとの固定例外リストは持たない。

判定規則は次のとおり。

- capture 責務表の intake または learning 列が「各工程の保存結果参照と件数集計のみ」または「非関与」と定義する command は、`capture-boundaries` 参照を個別に持たなくても CaptureBoundary 検査の検出対象としない。
- capture 責務表の intake または learning 列が具体的な責務記述（PR 本文記録、回収、自工程 deviation capture、REQ 再構成 intake 生成等）である command は、`capture-boundaries` 参照を個別に持ち、対応する capture 導線を実装する。

例外の根拠は本 capture 責務表である。
同表は case-auto の intake、learning をともに「各工程の保存結果参照と件数集計のみ」と定義し、case-auto 自身は inbox、inbox.md の直接生成を行わない設計を示す。
v2:ADR-0127（case-auto 構成工程の委譲）と v2:ADR-0137（case-run インライン実行）が、case-auto を統合委譲起点とする現行設計を裏付ける。

## 工程別 capture 責務

主ワークフロー構成 6 工程（req-save / design-save / case-open / case-run / case-close / case-auto）の capture 責務、保存先、git 永続化担当を工程別に定義する。
各工程分散型（選択肢A、REQ-006-021 / REQ-006-105〜108）に従う。

### 工程別 capture 責務表

| 工程 | capture 責務 | 保存先 | git 永続化担当 |
|---|---|---|---|
| req-save | REQ 再構成 intake + 自工程 deviation capture（REQ-006-106） | `.agentdev/intake/inbox/`、`.agentdev/learning/` | req-save command |
| design-save | 自工程 deviation capture（REQ-006-107） | `.agentdev/intake/inbox/`、`.agentdev/learning/` | design-save command |
| case-open | 自工程 deviation capture（case-close への委譲を廃止、REQ-006-021） | `.agentdev/intake/inbox/`、`.agentdev/learning/` | case-open command |
| case-run | PR 本文記録のみ（`.agentdev/` 直接変更禁止） | PR 本文 `## Findings / Capture候補` | 実行担当サブエージェント（PR 作成時） |
| case-close | PR 本文から回収 + 自工程 deviation capture（REQ-006-105、Epic 横断回収含む） | `.agentdev/intake/inbox/`、`.agentdev/learning/` | case-close command |
| case-auto | 各工程の保存結果参照と件数集計のみ（REQ-006-108）。capture 本文の再分類、再保存は行わない | （保存しない） | （git 永続化なし） |

### 委譲契約（Command→Skill 依存方向）

各 command は Command→Skill 依存方向（`docs/designs/responsibilities/artifact-contracts.md`「依存方向」参照）に従い、capture 成果物の生成を Skill へ委譲する。
command は `intake-capture` 等の他 command を呼び出さない。

| 種別 | 委譲先 Skill | 役割 |
|---|---|---|
| learning | `agentdev-learning-capture` skill | 失敗、回避、修正、判断ミスの知見抽出と `inbox.md` エントリ生成 |
| intake | `agentdev-intake-pipeline` skill | 作業候補、不整合、規約違反の item 生成操作 |

git 永続化（commit、push）は呼出元 command が担う。
Skill は候補生成と file 書き込みまでを担い、commit 実行は委譲しない。

### Epic Issue 単一書き手制約（case-close 経由）

Epic Issue 本文（ステータス追跡テーブル）の更新は `case-close(#epic)` のみが行う（REQ-006-021、`docs/designs/workflows/epic-wave-model.md`「Epic Issue 本文の単一書き手制約」参照）。

- `case-run(#epic)` は Epic Issue 本文を読み取るのみで書き込まない
- `case-auto` 自身は Epic Issue を更新せず、case-close 経由で更新する
- 複数 execution_unit 並列実行時も per-Epic-Issue-body の単一書き手が維持される（REQ-006-021）

### 完了報告（Capture結果）

各 command の完了報告には `Capture結果` 小節を含める。
共通意味契約は `docs/designs/responsibilities/artifact-contracts.md`「Capture結果 小節（共通意味契約）」が正規所有する。

記載内容:

- 保存先パス（`.agentdev/intake/inbox/*.md`、`.agentdev/learning/inbox.md`）
- 分類（intake / learning）
- 保存結果（成功/失敗、件数、コミットハッシュ等）

capture 本文は完了報告に含めない。
具体的な表示構造は各 command-local Template が正規所有する。

## REQ 再構成 intake

通常intakeとは独立した配置規約（REQ-037）。

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
- [epic-wave-model.md](epic-wave-model.md)（Epic Issue 本文の単一書き手制約）
- [backlog-artifact-lifecycle.md](backlog-artifact-lifecycle.md)（採用済み成果物 lifecycle）
- [../responsibilities/artifact-contracts.md](../responsibilities/artifact-contracts.md)（Command→Skill 依存方向、`Capture結果` 小節の共通意味契約）
- 各 command SPEC（`docs/designs/commands/`）
- `agentdev-workflow-orchestration` skill（capture 境界の詳細）
- `agentdev-learning-capture` skill、`agentdev-intake-pipeline` skill（capture 成果物の生成委譲先）
- REQ-006（Case実行オーケストレーション / Epic、Wave、各工程分散型 capture 責務 REQ-006-021/105〜108）
- REQ-037（REQ 再構成 intake）
