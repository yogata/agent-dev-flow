# SPEC確定候補: Workflow/Capability 機械分類規則の明文化

## 観測内容

deterministic checker（check_extensions.ts）が実装した Workflow/Capability 機械判定規則が、workflow-skill-model SPEC では例外表から暗黙に導出可能なのみで、分類表として明文所有されていない。checker 実装と SPEC の間で分類規則が暗黙依存になっており、SPEC 側の例外表変更が checker 挙動に暗黙反映される構造になっている。

## 影響

- SPEC を読む agent は checker の分類規則を正確に再現できない
- SPEC と checker の規則乖離が検出されにくい

## 課題

機械分類規則を workflow-skill-model SPEC に分類表として明文化する。SPEC 内容変更を伴うため case-close スコープ外と見送り記録済み。選定は backlog-review で判断する。

## 既存要件・成果物との関連

- 対象: workflow-skill-model SPEC、check_extensions.ts
- 関連: SPEC 確定候補群（他3件）、Epic #2099

## 出典

- 発生日: 2026-08-15
- 取得元: case-close 見送り記録（SPEC確定候補）
- 元 item: intake-2026-08-15-spec-candidate-workflow-capability-machine-classification.md
- 注記: intake-promote 経路C review で「backlog-review での選定判断を item が明記」を根拠に採用。現状の Phase 進捗は backlog-review 分析時に再確認すること
