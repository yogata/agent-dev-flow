# 前工程からの引き継ぎ 共通方針

AgentDevFlow 適用プロジェクト（consumer repo）で AgentDevFlow 本体の不具合・改善点を発見した場合の、前工程からの引き継ぎプロトコル。

## 基本原則

- AgentDevFlow workflow の実装対象は現在のプロジェクトである。
- AgentDevFlow 適用プロジェクトでは、AgentDevFlow 本体・配布 command・配布 skill・配布 template・配布 script を直接改修対象にしない。
- agent-dev-flow repository では、AgentDevFlow 本体が現在プロジェクトの成果物であるため、通常の req/case workflow で改修対象にできる。

## 引き継ぎメタデータ

前工程からの引き継ぎ用 RU には以下の frontmatter metadata を記録する:

```yaml
agentdev_handoff: true
```

- `agentdev_handoff: true` は AgentDevFlow 本体向けの引き継ぎマーカーである。
- 通常の RU には `agentdev_handoff` を含めない（`agentdev_handoff: false` も記録しない）。
- consumer repo では case-open/ case-run が `agentdev_handoff: true` を停止条件とする。agent-dev-flow repo 本体では停止せず、通常の req/case workflow 入力として扱う。

## 各 Command の引き継ぎ停止条件

### req-define

AgentDevFlow 本体改善要求を現在プロジェクトの通常要件docとして定義せず、前工程からの引き継ぎ用 RU 入力として整理する。出力に `agentdev_handoff: true` を含める。

### backlog-review

AgentDevFlow 本体改善成果物に前工程からの引き継ぎメタデータ（`agentdev_handoff: true`）を付与する。

### backlog-review

前工程からの引き継ぎメタデータ（`agentdev_handoff: true`）を RU frontmatter に転記する。RU 本文に現在プロジェクトでは実装しない前工程からの引き継ぎ用 RU であることを記載する。

### case-open

要件docまたは RU に `agentdev_handoff: true` がある場合、Issue を作成せず停止する。agent-dev-flow repository への手動取り込み対象として報告する。

### case-run

Issue 本文、要件doc本文に `agentdev_handoff: true` がある場合、実装を開始せず停止する。agent-dev-flow repository への手動取り込み対象として報告する。

## 参照

- 前工程からの引き継ぎワークフロープロトコル（Workflow/ Command Protocol で規定）
- 前工程からの引き継ぎメタデータ規約

