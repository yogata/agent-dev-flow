# src/common/（共通正本領域）

AgentDevFlow の host 非依存の共通正本を配置する領域である。共通正本の配置契約、投影モデル、バックエンド×ホスト接続構成、guard 編集解釈の分離は、マルチホスト正本モデル Design（`docs/designs/foundations/multi-host-canonical-model.md`）を正とする。ホスト別接続領域は `src/opencode/`（OpenCode）、`src/senpi/`（Senpi）、`src/codex/`（Codex）、`src/antigravity/`（Antigravity）であり、全ホストの公開入口は同じ業務契約を参照する。

## 配置内容

| パス | 内容 |
|---|---|
| `commands/agentdev/` | 共通の command 業務契約・本文と templates（REQ-002-005、REQ-002-008） |
| `skills/agentdev-*/` | 共通の Workflow Skill と Capability Skill（REQ-002-008、REQ-002-019） |
| `tools/` | 共有可能な Tool engine。`agentdev-gh/`（操作契約・fail-closed ゲート・GitHub 実装・プラグイン接続境界〔`plugin-runner.ts`〕と GitHub 実行経路の設定読取り・adapter 共通部〔`github-route.ts`、`route-adapter.ts`〕）、`tools/agentdev-gh/local/`（ローカル版 Custom Tool の Local 実装。ローカル版はこの領域の原本を接続する〔REQ-009-015/016〕）、`agentdev-third-party/` |
| `guards/` | guard の共通判定。`gh-write/gh-command-detector.ts`（生 gh WRITE 迂回検出器）、`distribution-boundary/`（配布依存境界 guard の純関数評価器群）。ホスト接続側は当該ホストの編集操作の意味論を解釈して共通判定へ接続する |

## 拘束条件

- 共通正本は host 非依存とし、ホスト名、起動 API、実行制御パラメータを本文に固定しない（配布物の harness 非依存性、harness 分離モデル Design）
- ホスト別コピーの業務手順を独立編集する構造を持たない
- Tool engine とホスト接続の境界は Custom Tool 操作契約に限定し、新たなバックエンド抽象層と GitHub 互換ローカルサーバを導入しない（REQ-009-035 維持）
- `tools/agentdev-gh/local/` は通常版の同期・インストールの配布対象から除外する（REQ-009-016）
