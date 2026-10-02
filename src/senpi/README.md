# src/senpi/（Senpi ホスト別接続領域）

Senpi（OmO Native v5）ホスト向けの接続を配置する領域である。ホスト接続領域の配置契約（公開入口、Tool 登録、extension、引数・結果・実行 context の変換）は、マルチホスト正本モデル Design（`docs/designs/foundations/multi-host-canonical-model.md`）を正とする。共通正本（業務契約・本文、template、Tool engine、guard 共通判定）は `src/common/` に配置されており、本領域は接続の配線のみを担う。

## 配置内容

本領域は Wave 2 以降の接続系実行単位（Tool 接続、guard 接続、Skill 読込・workspace 解決、installer 投影）が順次配置する。配置される接続成果物は `src/opencode/` の対応する接続と同じ業務契約（`src/common/` 配下の共通正本）へ委譲する。

## 拘束条件

- 本領域に共通業務 Workflow 本文・Capability Skill 本文・command 業務契約・template を重複配置しない（独立編集構造を持たない）
- 両ホストで業務名（req-define、case-auto 等）と引数の意味を維持し、表記が異なる場合は対応表を提供して同じ Workflow Skill へ到達させる
