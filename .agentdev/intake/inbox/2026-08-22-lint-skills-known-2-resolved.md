# lint_skills 既知指摘2件の解消記録（Wave 2 マージ後）

## 観測

PR #2396 時点で main 由来の lint 違反2件（本 PR では未計測・無変更として記録）とされていた指摘は、Wave 2 全マージ後（main 74571d3f + junction 再構築後）の case-close 独立再検証で NG 0 / Warning 0 / Info 2（agentdev- prefix 系の既知情報2件のみ）となった。内訳: (1) agentdev-traceability SKILL.md description 631字超過は PR #2393 (f) で590字へ修復され解消。(2) agentdev-artifact-validation の See Also「agentdev-design-file-manager」broken reference は .opencode/skills 投影欠落（F-01）に由来する環境依存の検出（lint は投影面をスキャンするため）であり、PR #2395 マージ後の junction 再構築（sync-self-opencode.ps1 -Mode apply、投影欠落4件作成・orphan 3件削除）で解消。

## 今回扱わない理由

Wave 2 の各 PR で解消済み・または運用タスク（junction 再構築）で解消済みであり、新たな変更候補が存在しないため（解消記録として保管）。

## 影響

なし（lint NG 0 の状態を維持。baseline 適用 0 baseline-known / 0 delta）。

## レビューで決めること

- なし（解消記録として保管。再評価不要）

## 根拠

- PR #2396 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2396 ）
- PR #2394 本文「Findings / Capture候補」（631字指摘の記録元、回収元: https://github.com/yogata/agent-dev-flow/pull/2394 ）
- case-close Wave 2 独立再検証: lint_skills.ts NG 0 / Warning 0 / Info 2（2026-08-22、main 74571d3f）
