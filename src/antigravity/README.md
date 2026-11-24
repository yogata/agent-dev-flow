# src/antigravity/（Antigravity ホスト別接続領域）

Antigravity ホスト向けの接続を配置する領域である。ホスト接続領域の配置契約（公開入口、Tool 登録、plugin/hook、引数・結果・実行 context の変換）は、マルチホスト正本モデル Design（`docs/designs/foundations/multi-host-canonical-model.md`）を正とする。共通正本（業務契約・本文、template、Tool engine、guard 共通判定）は `src/common/` に配置されており、本領域は接続の配線のみを担う。

Antigravity の入口構成（`.agents/skills/`）は公開資料に基づく静的検討による。実機での確認項目と期待結果はマルチホスト運用ガイド（`docs/guides/multi-host-operations.md`）が提供する。

## 配置内容

| パス | 内容 |
|---|---|
| `skill-discovery/` | Skill 探索・読込と公開 command 入口の接続。共通正本の契約（`src/common/skills/agentdev-skill-resolution/`）へ、Antigravity 公開入口（`.agents/skills/`）と指定 workspace の束縛を行う接続。解決規則は共通正本側に置き、本領域では重複実装しない |
| `document-management.md` | 文書管理の接続指示。Antigravity 上で command を適用する際の workspace 確認・command 全文の適用・全条件適用・副作用前の拒否規則 |

## 公開入口

Antigravity の公開入口は `.agents/skills/` 配下のスキル投影である。公開8コマンド（req-define、backlog-auto、case-auto、phase 系5操作）は `agentdev-workflow-<業務名>` スキルを公開入口とする。入口は command 全文（`src/common/commands/agentdev/<業務名>.md`）と委譲先 Workflow Skill と無改変の引数を返す。

導入先への実際の投影（installer）は後続の接続系実行単位が所有し、本領域は repo 内で検証可能な接続のみを配置する。GitHub 操作は Antigravity 既存の GitHub プラグイン能力を利用者が確認してから用いる（共通案内スキル `agentdev-host-github-guidance`）。Issue/PR 作成は OpenCode 側へ引き渡す。

## 拘束条件

- 本領域に共通業務 Workflow 本文・Capability Skill 本文・command 業務契約・template を重複配置しない（独立編集構造を持たない）
- 本領域の `.ts` は `src/common/`（共通正本）と `node:` 組込みモジュールのみを参照する。他ホスト接続領域（`src/opencode/`、`src/senpi/`、`src/codex/`）は参照しない（横断構造テストで固定）
- 業務名（req-define、case-auto 等）と引数の意味を維持し、表記が異なる場合は同じ Workflow Skill へ到達させる
- textlint の事前書き込み hook、gh 書き込み guard、配布境界 guard、third-party 取得機構の4種を本ホストへ登録しない（品質確認は既存の終了時ゲートを利用）

## テスト実行

```bash
bun test ./src/antigravity/   # cwd: repo root
```
