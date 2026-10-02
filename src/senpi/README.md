# src/senpi/（Senpi ホスト別接続領域）

Senpi（OmO Native v5）ホスト向けの接続を配置する領域である。ホスト接続領域の配置契約（公開入口、Tool 登録、extension、引数・結果・実行 context の変換）は、マルチホスト正本モデル Design（`docs/designs/foundations/multi-host-canonical-model.md`）を正とする。共通正本（業務契約・本文、template、Tool engine、guard 共通判定）は `src/common/` に配置されており、本領域は接続の配線のみを担う。

## 配置内容

| パス | 内容 |
|---|---|
| `skill-discovery/` | Skill 探索・読込接続。共通正本の Skill 探索契約（`src/common/skills/agentdev-skill-resolution/`）へ、Senpi 公開入口（`.senpi/skills/`）と指定 workspace の束縛を行う接続。解決規則は共通正本側に置き、本領域では重複実装しない |
| `plugins/agentdev-guard-connection/` | guard 接続。Senpi 編集操作（write/edit/patch 等の対応編集）と生の書込み経路を `src/common/guards/` の guard 共通判定へ接続する（マルチホスト正本モデル Design「guard 編集解釈の分離」節） |

本領域は Wave 2 以降の接続系実行単位（Tool 接続、guard 接続、Skill 読込・workspace 解決、installer 投影）が順次配置する。配置される接続成果物は `src/opencode/` の対応する接続と同じ業務契約（`src/common/` 配下の共通正本）へ委譲する。

Tool 接続は `tools/` 配下に配置済みである（`agentdev_gh`、`agentdev_jev`、`agentdev_third_party` の Senpi 向け Tool 登録単位と変換。詳細は `tools/README.md` を参照）。

## 拘束条件

- 本領域に共通業務 Workflow 本文・Capability Skill 本文・command 業務契約・template を重複配置しない（独立編集構造を持たない）
- 両ホストで業務名（req-define、case-auto 等）と引数の意味を維持し、表記が異なる場合は対応表を提供して同じ Workflow Skill へ到達させる
