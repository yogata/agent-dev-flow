# Upstream Handoff 共通方針

AgentDevFlow 適用プロジェクト（consumer repo）で AgentDevFlow 本体の不具合・改善点を発見した場合の upstream handoff protocol。

## 基本原則

- AgentDevFlow workflow の実装対象は現在のプロジェクトである（REQ-0104-017）。
- AgentDevFlow 適用プロジェクトでは、AgentDevFlow 本体・配布 command・配布 skill・配布 template・配布 script を直接改修対象にしない（REQ-0104-018）。
- agent-dev-flow repository では、AgentDevFlow 本体が現在プロジェクトの成果物であるため、通常の req/case workflow で改修対象にできる（REQ-0104-020）。

## Handoff Metadata

upstream handoff 用 RU には以下の frontmatter metadata を記録する:

```yaml
handoff_target: agent-dev-flow
apply_in_current_project: false
```

## 各 Command の Handoff 停止条件

### req-define

AgentDevFlow 本体改善要求を現在プロジェクトの通常要件docとして定義せず、upstream handoff 用 RU 入力として整理する。出力には `handoff_target: agent-dev-flow` と `apply_in_current_project: false` を含める（REQ-0104-022）。

### backlog-review

AgentDevFlow 本体改善 artifact に upstream handoff metadata（`handoff_target: agent-dev-flow`, `apply_in_current_project: false`）を付与する（REQ-0104-023）。

### backlog-review

upstream handoff metadata を RU frontmatter に転記する。RU 本文に現在プロジェクトでは実装しない upstream handoff 用 RU であることを記載する（REQ-0104-024）。

### case-open

要件docまたは RU に `apply_in_current_project: false` がある場合、Issue を作成せず停止する。agent-dev-flow repository への手動取り込み対象として報告する（REQ-0104-025）。

### case-run

Issue 本文、要件doc、Requirement Source に `apply_in_current_project: false` がある場合、実装を開始せず停止する。agent-dev-flow repository への手動取り込み対象として報告する（REQ-0104-026）。

## 参照

- REQ-0104-017〜027（Workflow / Command Protocol — upstream handoff workflow protocol）
- retired ADR-0021（Upstream Handoff Metadata Convention、現在は SPEC workflow-contracts.md で規定）
