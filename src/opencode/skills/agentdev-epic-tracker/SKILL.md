---
name: agentdev-epic-tracker
description: Updates parent Epic Issue status tracking tables in case-close workflows (single-writer). USE FOR: case-close Epic Issue status writes (pending→completed/blocked/failed), tracking child Issue progress in parent Epics, detecting parent-child relationships via Parent: #N patterns. DO NOT USE FOR: creating Epics, managing non-Epic Issues, general Issue operations.
---

# Epic 状態追跡（Epic Status Tracker）

親Epic Issueのステータス追跡テーブル（`pending`/ `completed`/ `blocked`/ `failed`）を更新する知識ベース。
`ready`/ `running` は case-run(#epic) の内部状態であり、Epic Issue 本文（永続状態）には書き込まれない（ADR 単一書き手制約、epic-wave-model SPEC 参照）。

- **参照元**: `case-close`（completed/ blocked/ failed 更新、単一書き手）。`case-auto`、`case-run` は Epic Issue 本文を読み取るのみで書き込まない
- **`⏭スキップ` は採用しない**。前提未達の Issue は `pending` のまま選択対象外となる。Wave status は保存せず、Wave 内 Issue 状態から導出する

## 原本（SSoT）

本スキルの原本仕様は `agentdev-epic-tracker` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-epic-tracker.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- 子Issue 本文（`Parent: #{N}` パターン）、子Issue の実行結果（completed-pr/ blocked/ failed）、PR 番号/ URL

## 出力

- 更新された親Epic Issue 本文のステータス追跡テーブル行（`pending` → `completed ([PR#N](URL))`/ `blocked`/ `failed`）

## 副作用

- 親Epic Issue 本文を更新する（`agentdev-gh-cli` の Issue 本文更新手続き経由）。子Issue 本文、PR は更新しない

## 常に守る不変条件

- **単一書き手**: Epic Issue 本文のステータス追跡テーブルは case-close(#epic) のみが書き込む（ADR）。case-run(#epic)、case-auto は書き込まない
- **永続状態に書き込むステータス値**: `pending`/ `completed`/ `blocked`/ `failed` のみ。`ready`/ `running` は case-run(#epic) の内部状態であり、Epic Issue 本文には書き込まれない
- **べき等性**: 既に `completed`/ `blocked`/ `failed` の行は更新対象外（スキップ）。case-close は確定済み終了状態を上書きしない
- **一括更新順序**: 複数子Issueの一括更新時は子Issue番号の昇順

## ステータス値定義

子Issue 実行状態 enum（epic-wave-model SPEC「子Issue実行状態 enum」参照）:

| 値 | 意味 | 設定主体 | 終了状態 |
|---|---|---|---|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-open（初期値） | いいえ |
| `ready` | 依存が満たされ、case-run(#epic) が実行可能と判定した状態。**永続状態には書き込まれない** | case-run 内部判定（永続状態に書き込まない） | いいえ |
| `running` | case-run(#epic) が委譲起動し実行中の状態。**永続状態には書き込まれない** | case-run 内部状態（永続状態に書き込まない） | いいえ |
| `completed` | Issue の実装、検証、必要な case-close が完了した状態 | case-close | はい |
| `blocked` | 要件曖昧性、外部副作用、権限不足、矛盾等により自動継続できない状態 | case-close（実行結果から確定） | はい |
| `failed` | 実装、検証、CI、PR 作成などの実行結果として失敗した状態 | case-close（実行結果から確定） | はい |

Epic自動クローズ判定では `completed` を終了状態として扱う（`blocked`/ `failed` は終了状態だが自動クローズ完了とはみなさない）。

**永続状態遷移**: Epic Issue 本文（永続状態）に書き込まれるのは `pending` → `completed`/ `blocked`/ `failed` の遷移のみ。

## 親Epic検出

子Issue本文から `Parent: #{N}` パターンを検出し、`{N}` を親Epic Issue番号として扱う。

- `Parent:` パターンなし → 親Epicなし。ステータス更新をスキップ（エラーにしない）
- `Parent: #N` の `#` は省略可能（`Parent: 42` も有効）

## 主要な判断順序（case-close: completed/ blocked/ failed 更新）

1. 子Issue本文から `Parent: #{N}` を検出。親Epicが存在しない → スキップ
2. Issue 本文読込手続き（`agentdev-gh-cli`）でEpic本文を取得
3. 正規表現で該当子Issue行を特定（新4列/旧4列形式に対応）
4. べき等性確認（既に終了状態ならスキップ）
5. `pending` を置換（completed なら PR番号/ URL 付き、blocked/ failed なら当該ステータス値）
6. Issue 本文更新手続き（`agentdev-gh-cli`）でEpic本文を更新

`blocked`/ `failed` は case-close が case-run(#epic) の実行結果（`completed-pr`/ `blocked`/ `failed`）から確定して Epic Issue 本文へ反映する終了状態。

## reference選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 新4列/旧4列形式の正規表現パターン、pending → completed/ blocked/ failed の置換、完了状態のべき等性確認、べき等性確認手順が必要な場合 | [references/regex-and-merge-conflict.md](references/regex-and-merge-conflict.md) |
| PR merge 前後の Epic 状態遷移、merge 失敗時の Epic ステータス対応、Epic 本文の conflict リスクと予防、conflict 解決手順、更新失敗フォールバックが必要な場合 | [references/regex-and-merge-conflict.md](references/regex-and-merge-conflict.md) |

## See Also

- **agentdev-gh-cli**
- **agentdev-workflow-lifecycle**: Epic振る舞いルール、進捗追跡テーブル定義
