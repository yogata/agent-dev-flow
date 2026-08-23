---
name: agentdev-issue-tracking
description: docs/issue-list/ 配下の課題ファイルによる未解決事項の追跡能力を提供する課題管理 Capability Skill。要件定義、設計、レビュー、実装、検証等で生じた未解決事項を発生から解決、正規成果物への反映確認まで追跡する。USE FOR: 課題の新規起票と状態更新、保留課題の再評価条件の確認と再評価、解決結論と反映先の記録、クローズ前の反映確認、frontmatter スキャンによる課題の検索・一覧、他 workflow からの課題管理利用。DO NOT USE FOR: GitHub Issue の作成・更新・確認（agentdev-issue-management）、Decision/REQ/Design 等の正規成果物の更新実行（各成果物を所有するスキルの責務）、Intake / Learning の検出事項や学びの管理、RU の生成と統合。
---

# `agentdev-issue-tracking`

課題管理 Capability Skill。
開発過程で生じた未解決事項を `docs/issue-list/` の課題ファイルとして、発生から検討、保留、解決、正規成果物への反映確認まで継続して追跡するための共通能力を提供する。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-issue-tracking` Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## 責務と境界

- 本スキルは `docs/issue-list/` 配下の課題ファイルの管理を担う。課題ファイルは永続的な git 管理対象の正規成果物であり、`.agentdev/` 配下の一時成果物とは扱いを区別する。
- GitHub Issue の作成、更新、確認の操作手続きは `agentdev-issue-management` が担う。両者の対象体系は異なる（課題ファイル = リポジトリ内の永続的な未解決事項の追跡、GitHub Issue = req/case パイプラインの作業単位）。
- 課題の解決結果を正規成果物へ反映する更新は、当該成果物を所有する ADF 能力へ委譲する（references/operations.md「反映追跡と委譲」）。本スキルは何が結論となったか、どこへ反映すべきか、実際に反映されたかの追跡に徹する。
- Intake / Learning（AI 駆動開発の改善循環）、RU（変更要求）、Decision（判断理由を保持すべき解決結果）は別系統であり、本スキルはそれらの管理を行わない。

## 課題ファイル（要約）

| 項目 | 規約 |
|---|---|
| 正規配置先 | `docs/issue-list/` |
| ファイル構成 | 1課題1ファイル。ファイル名は課題 ID + `.md`。状態によるディレクトリ移動は行わない |
| 課題 ID | `ISL-{NNN}`（3桁ゼロ埋め、単調増加、欠番維持）。接頭辞とハイフンにより GitHub Issue 番号 `#NNNN` と機械的にも人間にも混同できない |
| 状態 | 各ファイルの frontmatter `status` が保持する。値は `open`（未着手）、`in-progress`（検討中）、`on-hold`（保留）、`resolved`（解決済み）、`closed`（クローズ済み）の5値 |
| 保持情報 | 課題 ID、件名、状態、課題内容、背景、影響、関連成果物、選択肢、判断材料・証拠、不足情報、担当、期限、再評価条件、検討経過、結論、反映先、クローズ確認。不要な項目は省略できる |
| 検査区分 | 課題ファイルは検討経過を保持する履歴系文書であり、文意品質検査の現行文書基準の適用対象外 |

形式の詳細（frontmatter スキーマ、本文セクション、状態別必須項目、再評価条件の記述形式、テンプレート）は [references/issue-file-format.md](references/issue-file-format.md) を正とする。

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが課題の検索、一覧、形式検証を機械的に実行する。実装は TypeScript + bun。
全 ADF コマンド実行時に `docs/issue-list/` 全文を読み込むことを要求しない。list は各課題ファイルの frontmatter（最初の `---` ブロック）のみを解析し、validate は本文の見出しのみを検査する。

### I/O 契約（共通）

| 項目 | 規約 |
|---|---|
| 入力 | argv（`--root` 必須、任意: `--status`, `--related`, `--id`, `--format`, `--validate`） |
| 出力 | stdout に JSON（`--format md` 指定時は Markdown 表） |
| エラー | 実行エラーで終了コード 1。`--validate` 指定時に形式検証の fail ありで終了コード 2 |
| 走査 | `--root` 配下の `docs/issue-list/ISL-*.md`。`docs/issue-list/` が存在しない場合は空の一覧を返す |

### 公開操作契約（スクリプト一覧）

| スクリプト | 能力 | 引数 | 出力の要点 |
|---|---|---|---|
| `src/list.ts` | list / search / validate | `--root` + 任意フィルタ（`--status` は状態、`--related` は関連成果物、`--id` は課題 ID） | JSON: `issues`（課題レコード一覧）、`counts`（状態別件数）、`validation`（形式検証 findings）。`--format md` は Markdown 表 |

### 実行方法

```bash
# 全課題の一覧（状態別件数つき）
bun .opencode/skills/agentdev-issue-tracking/scripts/src/list.ts --root .

# フィルタ: 保留課題（再評価条件の要約を含む）
bun .opencode/skills/agentdev-issue-tracking/scripts/src/list.ts --root . --status on-hold

# フィルタ: 関連成果物に関連する課題
bun .opencode/skills/agentdev-issue-tracking/scripts/src/list.ts --root . --related docs/requirements/REQ-{NNN}.md

# 形式検証（状態別必須項目。fail ありで終了コード 2）
bun .opencode/skills/agentdev-issue-tracking/scripts/src/list.ts --root . --validate
```

スクリプト構成の詳細は [scripts/README.md](scripts/README.md) 参照。

## 操作能力

検知、新規起票、検索・参照、更新、検討経過の追加、保留、再評価、解決、反映確認、クローズ、再オープンの11操作の実行手順は [references/operations.md](references/operations.md) が提供する。
いずれの操作も本スキルを読み込んだ ADF エージェントが自然言語の指示と現在の会話文脈から判断して実行する。ユーザーに操作文法の暗記を要求しない。

## reference選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 課題ファイルの作成、編集、frontmatter、状態遷移、テンプレートが必要な場合 | [references/issue-file-format.md](references/issue-file-format.md) |
| 11操作の実行手順、反映追跡と委譲、クローズ抑止が必要な場合 | [references/operations.md](references/operations.md) |

## 他 workflow からの利用

本スキルは共有能力であり、人間向け公開入口（`/agentdev/issue` command）の明示実行を利用の必須条件としない。

- 要件定義、設計、レビュー、実装、検証等の各 workflow、各 skill は、未解決事項を認識した場合に本スキルを直接読み込み、課題化、検索、更新を行える。
- 保留課題の再評価条件への到達は `--status on-hold`、作業対象に関連する保留課題の確認は `--related` で行う。関連する作業、設計、レビュー、分析を行う際に保留課題の条件成立を確認する。
- 本スキルの利用にあたって新規の承認点を追加しない。既存の承認、判断境界（ユーザー合意が必要な設計判断を本スキルが勝手に確定しない等）は維持する。

## 禁止事項

- 本スキルで GitHub Issue の作成、更新、確認を行わないこと（`agentdev-issue-management` の責務）
- 本スキルで Decision、REQ、Design 等の正規成果物を直接更新しないこと（当該成果物を所有する ADF 能力への委譲が前提）
- 課題起票時に反映先を決め打ちしないこと
- 解決済みの課題を反映完了または反映不要の確認なしにクローズしないこと
- 状態によって課題ファイルを移動、複製、分割しないこと
- すべての疑問、TODO、一時エラーを無条件に課題化しないこと（現在の作業で解決できず、将来の設計、実装、検証、合意に影響する未解決事項を課題化候補とする）

## See Also

- **agentdev-issue-management**: GitHub Issue 操作手続き。本スキルと対象体系が異なる
- **agentdev-decision-file-manager**: 解決結果を Decision へ反映する際の委譲先
- **agentdev-req-file-manager**: 解決結果を REQ へ反映する際の委譲先
- **agentdev-design-file-manager**: 解決結果を Design へ反映する際の委譲先
