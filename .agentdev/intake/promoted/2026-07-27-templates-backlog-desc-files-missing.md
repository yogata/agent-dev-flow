# SPEC 列挙テンプレート backlog 系2ファイルの実体不在

## 観測内容

【検証済み】`docs/specs/skills/agentdev-workflow-templates.md` L34-35 が `templates/issue_desc_backlog_child.md` と `templates/issue_desc_backlog_epic.md` を列挙している。
しかし `src/opencode/skills/agentdev-workflow-templates/templates/` 配下（11ファイル）にこれらの実ファイルは存在しない。
PR #1894 のテンプレート追加作業中に SPEC 列挙と実体の不一致を確認した。

## 影響

SPEC ↔ 配布物の不整合であり、SPEC が存在を前提に読者を誘導するが実ファイルがないためリンク切れ相当となる。
backlog-* テンプレートを前提とする運用（backlog-review → case-open 等）で参照漏れを生じ得る。
優先度は中。実害はまだ確認されていないが、SPEC 読者の誘導ミスが継続する。

## 課題

下記いずれかを要件定義工程で確定する。
- backlog 系テンプレート（`issue_desc_backlog_child.md`、`issue_desc_backlog_epic.md`）を新規作成する
- SPEC「参照する references」から backlog 系2ファイルを削除する（廃止意図の確認）

既存テンプレート（`issue_desc_feature.md`、`issue_desc_bug.md`、`issue_desc_child.md`、`issue_desc_epic.md`）を参考に配置方針を判断する。

## 既存要件との関連

- 対象 SPEC: `docs/specs/skills/agentdev-workflow-templates.md` L34-35
- テンプレート配置想定: `src/opencode/skills/agentdev-workflow-templates/templates/`
- Epic: #1864（Wave 1 最終 Wave）
- Issue: #1866（OU-002）
- PR: #1894

## 出典

- inbox 元ファイル: `intake-2026-07-27-templates-missing-backlog-desc-files.md`
- 発生日: 2026-07-27
- PR: #1894（Issue #1866 / OU-002, Epic #1864 Wave 1）
