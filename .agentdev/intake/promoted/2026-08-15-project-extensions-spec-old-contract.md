# agentdev-project-extensions skill SPEC の旧契約記述残存

## 観測内容

agentdev-project-extensions skill SPEC（agentdev-project-extensions.md）が旧配置（`.agentdev/extensions/commands/` 併記）と旧状態分類（不在/破損のみ）で記述されており、foundations/project-extensions.md（新3種 kind、5状態分類）と乖離している。skill SPEC と foundations SPEC の交叉不一致。

## 影響

- 読む agent が旧配置・旧状態分類を正と誤認する恐れがある
- SPEC 間の権威関係（foundations が正）に反する記述が残存する

## 課題

agentdev-project-extensions.md を foundations/project-extensions.md の新契約（3種 kind、5状態分類、`.agentdev/extensions/skills/` 配置）に整合させる。

## 既存要件・成果物との関連

- 対象: docs/specs/skills/agentdev-project-extensions.md（skill SPEC）
- 正規: docs/specs/foundations/project-extensions.md
- 関連: PR 2116 Findings で発見

## 出典

- 発生日: 2026-08-15
- 取得元: PR 2116 Findings / Capture候補
- 元 item: intake-2026-08-15-project-extensions-spec-old-contract.md
