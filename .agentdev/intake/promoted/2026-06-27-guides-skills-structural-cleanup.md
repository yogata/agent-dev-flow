# docs/guides/ と src/opencode/skills/ の構造的整形（SUB-B/SUB-C）

## 観測内容

PR #1084（Issue #1075 OU-007「個別構造課題 SUB-A/D/E」）は SUB-A（docs/adr 表記揺れ是正）、SUB-D（docs/specs 散文英語）、SUB-E（要件番号参照形式）を完了した。SUB-B（docs/guides/）、SUB-C（src/opencode/skills/）は「対象外・後続課題」と明示して本 PR スコープから除外した。

未対応のサブ課題:
- **SUB-B-1**: `docs/guides/` 配下のアクター不明箇所に行為者が明示されていること
- **SUB-B-2**: `docs/guides/` 配下の複数概念 1 文が概念ごとに分割済みであること
- **SUB-C**: `src/opencode/skills/` 配下の概要節と機能節の役割分担が統一されていること

## 影響

- docs/guides/ 配下にアクター不明箇所、複数概念 1 文が残存し、読み手の負荷が高い。
- src/opencode/skills/ 配下の SKILL.md の概要節と機能節の役割分担が統一されておらず、スキル構造の揺れが生じている。

## 課題

- SUB-B/C ともに per-file 査読と文脈判断が必要。対象ディレクトリと編集規範（japanese-tech-writing）の整合性確認。
- SUB-B-1（アクター明示）は「39 REQ ファイル群の主語明示」課題と重複する可能性。統合または分離の判断。
- SUB-C は `src/opencode/skills/*/SKILL.md` の構造標準化（agentdev-skill-authoring 規範との整合）に帰着するか。

## 既存要件との関連

- 親 Issue: #1075（Wave 1）。
- REQ 参照: REQ-0140-026（文書品質準拠）。
- 編集規範: japanese-tech-writing skill。
- スキル構造規範: agentdev-skill-authoring skill。

## 観測元

- PR #1084
- 親 Issue: #1075（Wave 1）
