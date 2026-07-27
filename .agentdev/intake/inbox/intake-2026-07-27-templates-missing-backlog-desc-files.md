# intake: agentdev-workflow-templates SPEC が参照する backlog 系テンプレート実ファイル不在

## 発生日

2026-07-27

## 発生元

- Epic: #1864 (Wave 1 最終 Wave)
- Issue: #1866 (OU-002)
- PR: #1894 (agentdev-workflow-templates test strategy 記述ガイドライン)
- 取得元: PR 本文「Findings / Capture候補」セクション

## 問題事象

`docs/specs/skills/agentdev-workflow-templates.md` の「参照する references」節が `issue_desc_backlog_child.md` と `issue_desc_backlog_epic.md` を列挙しているが、`src/opencode/skills/agentdev-workflow-templates/templates/` 配下にこれらの実ファイルが存在しない。

## 影響

- SPEC ↔ 配布物の不整合。SPEC が存在を前提に読者を誘導するが、実ファイルがないためリンク切れ相当となる。
- backlog-* テンプレートを前提とする運用（backlog-review → case-open 等）で参照漏れを生じる可能性がある。

## 発生局面

実装 (Wave 1 case-close 時の PR 本文 capture 回収)

## 検知方法

PR #1894 のテンプレート追加作業中に backlog 系テンプレートファイルを探し、SPEC 列挙と実体が不一致であることを確認。

## 想定される対応方向

下記いずれかが想定されるが、要件定義工程で確定させる必要がある。

- backlog 系テンプレートを新規作成する
- SPEC「参照する references」から backlog 系を削除する（廃止意图の確認）

## 関連

- SPEC: `docs/specs/skills/agentdev-workflow-templates.md`
- テンプレート配置想定: `src/opencode/skills/agentdev-workflow-templates/templates/`
- 既存テンプレート（参考）: `issue_desc_feature.md`, `issue_desc_bug.md`, `issue_desc_child.md`, `issue_desc_epic.md`

## 出典引用

PR #1894 本文「Findings / Capture候補」より引用:

> issue_desc_backlog_child.md, issue_desc_backlog_epic.md は SPEC「参照する references」に列挙されているが、実ファイル存在を確認できなかった（別Issue候補）。

## タグ

#intake #templates #workflow-templates #spec-distribution-mismatch
