# src/opencode/（OpenCode ホスト別接続領域）

OpenCode ホスト向けの接続を配置する領域である。ホスト接続領域の配置契約（公開入口、Tool 登録、plugin/hook、引数・結果・実行 context の変換）は、マルチホスト正本モデル Design（`docs/designs/foundations/multi-host-canonical-model.md`）を正とする。共通正本（業務契約・本文、template、Tool engine、guard 共通判定）は `src/common/` に配置されており、本領域は接続の配線のみを担う。

## 配置内容

| パス | 内容 |
|---|---|
| `plugins/` | OpenCode plugin/hook の正本（REQ-002-045）。Tool 登録配線（`agentdev-gh-tool`、`agentdev-jev-tool`、`agentdev-third-party-tool`）、guard 接続（`agentdev-gh-write-guard`、`agentdev-distribution-boundary-guard`、`agentdev-textlint-guard`） |

OpenCode 用 plugin/hook の正本は本パッケージ配下の独立 Plugin パッケージとして管理する（REQ-002-045）。OpenCode は `.opencode/plugins/` 直下の depth-1 ファイルのみを自動読み込みするため、導入時はインストーラが junction 作成とローダーシム生成を行う。

## 拘束条件

- 本領域に共通業務 Workflow 本文・Capability Skill 本文・command 業務契約・template を重複配置しない（独立編集構造を持たない）
- OpenCode を first-class reference harness として扱い、OmO のバージョンだけでホストを推測しない
