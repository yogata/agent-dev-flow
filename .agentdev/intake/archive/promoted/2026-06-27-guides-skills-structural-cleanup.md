# docs/guides/ と src/opencode/skills/ の構造的整形（SUB-B/SUB-C）後続課題

## 観察

PR #1084（Issue #1075 OU-007「個別構造課題 SUB-A/D/E」）は SUB-A（docs/adr 表記揺れ是正）、SUB-D（docs/specs 散文英語）、SUB-E（要件番号参照形式）を完了した。SUB-B（docs/guides/）、SUB-C（src/opencode/skills/）は「対象外・後続課題」と明示して本 PR スコープから除外した。

未対応のサブ課題:
- **SUB-B-1**: `docs/guides/` 配下のアクター不明箇所に行為者が明示されていること
- **SUB-B-2**: `docs/guides/` 配下の複数概念 1 文が概念ごとに分割済みであること
- **SUB-C**: `src/opencode/skills/` 配下の概要節と機能節の役割分担が統一されていること

## 修正されなかった理由

対象ファイル数が大きく個別判断を要するため、本 PR では取り扱わず「独立フォローアップで実施する」と明示して残置した。

## 課題

- SUB-B/C ともに per-file 査読と文脈判断が必要。対象ディレクトリと編集規範（japanese-tech-writing）の整合性確認
- SUB-B-1（アクター明示）は ISSUE #1085 の要件 2（操作主体明示）と重複する可能性。統合または分離の判断
- SUB-C は `src/opencode/skills/*/SKILL.md` の構造標準化（agentdev-skill-authoring 規範との整合）に帰着するか

## 根拠

PR #1084 本文の完了条件 checkbox および「補足情報」より引用:

> - [ ] docs/guides/ アクター不明箇所に行為者が明示されている (SUB-B: 対象外・後続課題)
> - [ ] docs/guides/ 複数概念 1文が概念ごとに分割済み (SUB-B: 対象外・後続課題)
> - [ ] src/opencode/skills/ 概要節と機能節の役割分担が統一されている (SUB-C: 対象外・後続課題)

> SUB-B (docs/guides アクター明示)・SUB-C (skills 概要節/機能節) は対象ファイル数が大きく個別判断を要するため、本 PR では対象外とし独立フォローアップで実施する。

## 観測元

- PR #1084
- 親 Issue: #1075（Wave 1）
- REQ 参照: REQ-0140-026
