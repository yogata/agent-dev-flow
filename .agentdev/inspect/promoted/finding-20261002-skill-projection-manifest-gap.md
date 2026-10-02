# SkillProjection 不整合 6件（agentdev-skill-resolution src-only ×2・stale junction ×4）

- **分類**: inspect finding promote（F-08・severity medium・confidence high）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1・check_integrity.ts IR-068 機械的検出）

## 観測（evidence・機械的検出・実測確認済み）

- `agentdev-skill-resolution` が `src/common/skills/` に実在するが、`skill-projection-manifest.yaml`（.opencode・src/opencode 両 baseline）と `.opencode/skills/` 投影の両方に不在（src-only ×2）→ 実行環境からの欠落リスク
- `explainer` / `explainer-book` / `first-reader` / `yomiyasu` が `.opencode/skills/` 投影に存在するが `src/common/skills/` に不在（stale junction ×4）→ repo-local skill のため consumer 影響なし
- 実測: `src/common/skills/agentdev-skill-resolution` 存在・manifest 両方に登録なし・`.opencode/skills/agentdev-skill-resolution` 不在を確認

## 影響課題

新規 skill（agentdev-skill-resolution）の投影漏れは配布物・実行環境からの欠落リスク。stale junction は repo-local skill のため実害は限定的だが正本不在の投影実体は catalog 整合を乱す。

## 対応候補

- manifest へ agentdev-skill-resolution の追加・src/common 正本からの投影反映
- stale junction 4件の junction 再構築（`install-consumer-opencode.ps1 -Mode apply`）

## 既存要件関連

IR-068（skill-projection-manifest）と `src/common/skills/` の実一覧を正とする。

## 統合注記（backlog-review での統合判定候補）

なし（投影整備の単独対応）。
