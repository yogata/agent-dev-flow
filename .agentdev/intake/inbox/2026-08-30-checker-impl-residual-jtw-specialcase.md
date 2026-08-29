# checker 実装系の残存特例: distribution-boundary 系 lib/plugin に japanese-tech-writing 特例が残存

## 観測

`.opencode/skills/repo-agentdev-integrity/` 配下（`scripts/lib/distribution-boundary-fs.ts`、`trusted-distribution-gate/manifest.ts` 等）と `src/opencode/plugins/distribution-boundary-guard`（+lib、tests）に japanese-tech-writing 特例が残存している。

- PR #2462（commit 882e7194）は README / guides / scripts / gitignore の特例を除去したが、checker 実装系は Issue #2452 の管轄として触れていなかった
- Issue #2452（IR-058 3分岐検査の適用実装）は check_integrity.ts の判定 3 分岐化がスコープであり、distribution-boundary 系 lib/plugin 内の個別 Skill 名特例の除去までは確認されていない
- 配布依存境界 最終 gate（IR-059 baseline delta）は新規違反 0 で通過しており、現状は baseline 管理下または検出非対象

## 今回扱わない理由

Epic #2446 の子 Issue（#2452）の完了条件（IR-058 3分岐+逆検査の Design 一致、exemption 新設なし、strict fail 復帰）は成立済み。checker lib/plugin 内の残余特例の有無確認と除去は新たな対応範囲。

## 影響

個別 Skill 名（japanese-tech-writing）が checker 実装にハードコードされ続ける場合、DEC-023 決定5（個別特例の新設禁止と既存特例の統合解消）の観点で残存特例が残る。skills.yaml 宣言の単一情報源化が不完全。

## レビューで決めること

- 上記ファイル群の japanese-tech-writing 特例の現状調査（宣言読込への置換可否）
- 置換する場合の IR-059 baseline への影響確認

## 根拠

- PR #2462 本文「Findings / Capture候補」intake 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2462 ）
- Issue #2452 対応記録コメント（case-close 検証差分）
