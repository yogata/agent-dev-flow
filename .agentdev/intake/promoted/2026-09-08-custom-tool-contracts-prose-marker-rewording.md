# custom-tool-contracts.md:91 の散文中 ADF-COVERS マーカー文字列の言い換え

## 観測内容

`docs/designs/responsibilities/custom-tool-contracts.md` 91行目（移管記録節）の散文が ADF-COVERS(implementation) マーカー文字列を文中に含み、agentdev-traceability check の malformed-declarations（宣言形式を満たさない既知ロール付きマーカー）として検出される。case-close 検証差分では fail-open 運用下で既知 finding（既出）として扱われており、Epic #2686 の各 case-close でも継続的に報告されている。

## 影響

- 配布物ではない docs であり workflow 上の実害は限定的だが、マーカー文字列の文中使用が検査妨害（malformed-declaration の常態化）になっている
- traceability check の signal-to-noise 比を下げ、新規の正当な malformed 検出を埋める

## 変更候補

- 91行目の散文中マーカー文字列を、宣言形式と区別される表現へ言い換える（例: バッククォート内の宣言形式文字列を避け、自然文で言及する）

## 既存要件・成果物との関連

- `docs/designs/responsibilities/custom-tool-contracts.md`（status: accepted）
- agentdev-traceability の malformed-declarations 検出規則
- learning promoted 成果物「update-distribution-boundary-id-writing-discipline」（文中 ID 使用の執筆規律）と互补関係: 本項は docs 側の直接的修正対象

## 出所

- 元 intake item: `2026-09-08-custom-tool-contracts-prose-marker-2691.md`（PR #2691 の case-run トレーサビリティ check → case-close 再検査 → Capture 回収由来、Issue #2687・Epic #2686 Wave 1）
