# .agentdev/ — AgentDevFlow Domain State Directory

AgentDevFlow plugin の canonical domain state を格納するディレクトリ。

## 目的

AgentDevFlow の永続化すべき domain artifact（intake items、learning data、integrity reports 等）を格納する。各サブディレクトリの構成は、実装を担当する子issueで定義される（REQ-0017-009）。

## .sisyphus/ との責任分離

| ディレクトリ | 役割 | 内容 |
|---|---|---|
| `.sisyphus/` | Sisyphus runtime workspace | 実行計画 (plans)、証跡 (evidence)、タスク (tasks)、実行状態 (execution)、下書き (drafts)、レポート (reports)、アーカイブ (archives) |
| `.agentdev/` | AgentDevFlow domain state | intake items、learning pipeline data、integrity reports 等の canonical domain artifact |

### 原則

- `.sisyphus/` は Sisyphus runtime が管理する一時的な作業領域
- `.agentdev/` は AgentDevFlow の domain として永続化すべき状態
- 両者は明確に分離され、互いに依存しない

### 例外: .sisyphus/drafts/req-draft-*.md (REQ-0017-046)

`/agentdev/req-define` が生成する draft は、Prometheus runtime constraint により `.sisyphus/drafts/` に保存される。これらの working draft は **AgentDevFlow の canonical domain state ではない**。

- `.sisyphus/drafts/req-draft-*.md` = Prometheus working draft（canonical domain state ではない）
- `/agentdev/req-save` の出力（REQ / ADR / requirements index）= AgentDevFlow domain artifact（canonical）
- 既存の `.sisyphus/drafts/req-draft-*.md` を `.agentdev/` 配下へ移行する要件はない

## サブディレクトリ構成

初期状態では `.agentdev/` 直下にファイルを配置しない。各サブディレクトリは対応する子issueで作成される:

| サブディレクトリ | 対象 Issue | 内容 |
|---|---|---|
| `intake/` | #286 | intake items |
| `learning/` | #288 | learning pipeline data |
| `integrity/` | #291 | integrity reports |

## learning pipeline の canonical storage 位置づけ（REQ-0019-032）

当面の learning pipeline の canonical storage は既存互換のため `docs/tips/` とする。`.agentdev/learning/` への移行は別 Requirement / 別 Case とする。

## 参照

- REQ-0017: AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化
- REQ-0017-007: `.agentdev/` SHALL be the domain state directory
- REQ-0017-008: `.sisyphus/` = runtime workspace, `.agentdev/` = domain state
- REQ-0017-009: Sub-directory structure defined by child issues
- REQ-0017-046: `.sisyphus/drafts/req-draft-*.md` exception
- ADR-0005: AgentDevFlow plugin namespace 採用
