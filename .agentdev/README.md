# .agentdev/ — AgentDevFlow Domain State Directory

AgentDevFlow の永続 domain state を格納するディレクトリ（REQ-001、REQ-002）。

`.agentdev/` は canonical domain state であり、コマンド間で受け渡される永続的な成果物を保持する（`integrity/reports/` は例外: 非永続・git管理対象外）。agent-dev-flow が管理するドラフトは `.agentdev/drafts/` に配置する（REQ-002）。

## 状態表

| Path | 状態 | Producer | Consumer / Next command | Retention / Removal |
|------|------|----------|------------------------|---------------------|
| `backlog/intake/inbox/*.md` | raw item | 会話経由の intake capture（`agentdev-intake-pipeline` スキル）、docs-check（`/repo/docs-check`） | intake-promote workflow（backlog-auto stage 2 駆動） | intake-promote workflow の分類確定後に削除（採用 item は promoted/ へ保存、却下 item は即時削除） |
| `backlog/intake/promoted/*.md` | promoted artifact | intake-promote workflow（backlog-auto stage 2 駆動）、inspect-promote workflow（--auto） | backlog-review workflow（backlog-auto stage 3 駆動） | backlog-review workflow による RU 化成功後に削除 |
| `backlog/learning/inbox/*.md` | 未整理エントリ（1トピック1ファイル、命名 YYYY-MM-DD-<slug>.md、frontmatter 4フィールド id/created_at/source/status） | `learning-capture`（skill） | learning-promote workflow（backlog-auto stage 2 駆動） | learning-promote workflow 成功後に処理済みファイルを削除 |
| `backlog/learning/deferred/*.md` | 分類済み living pool（1トピック1ファイル、status で状態区分。スキーマは inbox と同一） | learning-promote workflow | learning-promote workflow | 多状態 living pool。staged/rejected/duplicate は promote 時 prune、deferred/未処理/再評価対象は保持 |
| `backlog/learning/evaluation-report.md` | 境界 artifact | learning-promote workflow | learning-promote workflow | 毎回上書き |
| `backlog/learning/promoted/*.md` | promoted artifact | learning-promote workflow | backlog-review workflow（backlog-auto stage 3 駆動） | backlog-review workflow による RU 化成功後に削除 |
| `backlog/req-units/RU-*.md` | RU（Requirement Unit） | `backlog-review`, session-sourced | `req-define`, `case-open` | `case-ready` 成功後に削除（blocked / failed / 中断時は保持。REQ-008-010, REQ-008-011） |
| `drafts/req-draft-*.md` | working draft | `req-define` | `case-open`, `case-ready`, `case-revise` | `case-ready` 成功後に削除（blocked / failed / 中断時は保持。REQ-008-010, REQ-008-011） |
| `drafts/requirements-review-finding-*.md` | review finding | `req-define`（SPLIT 検出時） | `req-define` | `req-define` の消化後に削除 |
| `integrity/reports/*.md` | 検証レポート（非永続） | `docs-check` | `docs-check`（intake化）・ユーザー参照 | 非永続・git管理対象外（`.gitignore` で除外） |
| `backlog/inspect/inbox/*.md` | 未分類 inspect finding | inspect-docs workflow（backlog-auto stage 1 駆動） | inspect-promote workflow（backlog-auto stage 2 駆動） | inspect-promote workflow の分類後に削除（promote 時は promoted/ へ保存、reject 時は即時削除、defer 時は inbox 残置） |
| `backlog/inspect/promoted/*.md` | promoted artifact（採用済み・RU化対象） | inspect-promote workflow | backlog-review workflow（backlog-auto stage 3 駆動） | backlog-review workflow による RU 化成功後に削除 |
| `backlog/inspect/promoted/auto-promote-log.md` | `--auto` 実行ログ（append-only） | inspect-promote workflow(--auto) | ユーザー参照・revoke 手順 | 永続（トレーサビリティ） |
| `issues/issue-*.md` | ローカルIssue（追跡Issue / Case Issue。ローカル版のみ） | 会話経由の追跡Issue操作（`agentdev-issue-tracking` スキル）、case-open/run/close（Tool 操作契約経由） | 会話経由の追跡Issue操作、`/agentdev/req-define`（実行確定時の要件化経路） | なし（永続。Issue/PR 相当の永続情報として git 管理対象、REQ-009-026） |
| `project/identity.yaml`、`project/themes.md`、`project/issue-log.md`、`project/received/*.md`、`project/decision-log/*.json`、`project/phase-gates/*` | 工程駆動の保存状態（取組・対象版・現在工程の最小識別、検討テーマ正本、未決事項と判断根拠、受領済み途中検討知見の受領記録、直接採用の採否記録、工程遷移の遷移記録） | 工程駆動の4操作（phase-tasks-create、phase-tasks-update、phase-artifacts-update、phase-review）と利用者判断による工程遷移（phase-transition） | 同4操作と工程遷移、別セッション再開 | 永続。テーマ一覧と工程全体像は正本と正規成果物群から導出し、一覧・閲覧像を恒久保存するファイルを作らない（各ファイルの様式と導出規律は `project/README.md`） |
| `backlog/runs/<一式識別子>/set-state.json`（evidence 配下に検証証跡） | backlog-auto 一気通貫実行の状態記録（義務スナップショット、対応表、基準点情報、進捗、リリース状態） | backlog-auto（同一実行の単一書き手） | backlog-auto 再開・全体完了突合・リリース手順 | 全体完了とリリース完了まで保持する。リリース完了後の削除可否は結果報告に記録する（配置・形式・単一書き手の規約は backlog-auto の workflow skill references「set-state 永続化契約」節） |
| `install-state.json` | 導入済み配布版の記録 | install.ps1 apply（完了時に記録） | install.ps1 check（記録版と配布版の版比較） | 永続。旧痕跡がある間は記録を更新しない（/agentdev/migrate の案内対象） |

状態表の約束対象は上記の正規状態の領域に限定する。正規状態でない実行時キャッシュ・検証記録・設定・拡張・一時領域（`cache/`・`close-acceptance/`・`config/`・`extensions/`・`tmp/`）は本表の約束対象外とする。


## .agentdev/ の性質

| ディレクトリ | 性質 | 内容 |
|---|---|---|
| `.agentdev/` | 永続 domain state（`integrity/reports/` は例外: 非永続・git管理対象外） | intake items、learning data、RU、drafts（req-draft, review finding） |

**原則**: `req-define` が生成する working draft（`.agentdev/drafts/req-draft-*.md`）は command 間ハンドオフ用の中間アーティファクトであり、`case-ready` が保存・確定した Definition Package が canonical である。

## ディレクトリ構成

```
.agentdev/
├── install-state.json     ← 導入済み配布版の記録（install.ps1 apply 完了時に記録、check が記録版と配布版の版比較）
├── backlog/               ← バックログ集約領域（取込・学習・検査・要件単位・一気通貫実行の状態）
│   ├── intake/
│   │   ├── inbox/       ← 会話経由の intake capture（agentdev-intake-pipeline スキル）が raw item を保存
│   │   └── promoted/    ← intake-promote workflow が派生 artifact を出力（フラット）
│   ├── learning/
│   │   ├── inbox/       ← learning-capture が生学びを1トピック1ファイルで保存
│   │   ├── evaluation-report.md ← learning-promote workflow が評価レポートを生成
│   │   ├── deferred/    ← 分類済み learning entry の living pool（1トピック1ファイル）
│   │   └── promoted/    ← learning-promote workflow が promoted artifact を出力（フラット）
│   ├── inspect/
│   │   ├── inbox/       ← inspect-docs workflow が未分類 finding を保存
│   │   └── promoted/    ← inspect-promote workflow が採用済み artifact を出力（フラット）
│   ├── req-units/       ← backlog-review workflow が RU を生成
│   │   └── RU-*.md
│   └── runs/            ← backlog-auto 一気通貫実行の状態記録（set-state と evidence）
│       └── <一式識別子>/
│           ├── set-state.json
│           └── evidence/
├── drafts/              ← req-define が要件ドラフトを保存（case-open / case-ready / case-revise で消費、case-ready 成功後に削除）
├── issues/              ← ローカルIssue（ローカル版のみ。Tool 操作契約経由で読み書き）
│   └── issue-{NNNN}.md
│   └── *.json
├── project/               ← 工程駆動の保存領域（テーマ正本、最小識別状態、未決事項、受領済み知見、採否記録、遷移記録。様式は project/README.md）
│   ├── identity.yaml    ← 取組・対象版・現在工程の最小識別状態
│   ├── themes.md        ← 検討テーマ正本（テーマ一覧はこのファイルから導出）
│   ├── issue-log.md      ← 未決事項と判断根拠
│   ├── received/        ← 受領済み途中検討知見（1受領1ファイル）
│   ├── decision-log/     ← 直接採用の採否記録（1採用1ファイル）
│   └── phase-gates/     ← 工程遷移の遷移記録（1遷移1ファイル）
└── integrity/
    └── reports/         ← docs-check が検証結果を保存（非永続・git管理対象外）
```

## 参照

- [REQ-001](../docs/requirements/REQ-001.md): 文書体系と持続可能な基準構造（domain state、案内層、基準境界）
- [REQ-002](../docs/requirements/REQ-002.md): 配布成果物の責務境界（drafts 配置、配布境界）
- [REQ-008](../docs/requirements/REQ-008.md): 一時成果物ライフサイクル（intake / learning / backlog lifecycle）
- [REQ-111](../docs/requirements/REQ-111.md): ADF v5.1 工程遷移・独立レビューと変更駆動併存（工程駆動実行は変更駆動経路と別経路として併存する移行期の経路。対応する状態は後継経路の実現・採用時に本表へ追加する）
- [DEC-001](../docs/decisions/DEC-001.md): AgentDevFlow 憲章（namespace、基本原則）
- [DEC-005](../docs/decisions/DEC-005.md): Project Extensions Architecture（`.agentdev/extensions/**`）。superseded by DEC-006（extensions 機構の配置規約は現行のまま、DEC-006 が inspect-extensions 廃止と extension 検査の責務分離により部分置換）
