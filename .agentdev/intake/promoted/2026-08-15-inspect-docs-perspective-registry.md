# inspect-docs 観点レジストリの要件化（実体化）

## 観測内容

REQ-028-007 に基づき Phase 3 で IR-019/022/026/036 の4件を inspect-docs 観点への移管候補と判定したが、移管先である inspect-docs 観点レジストリが現在暗黙的に保持されておりレジストリ化が未実施。Phase 4 で IR catalog から除外する際、移管先レジストリが存在しなければ除外作業が完了しない。

## 影響

- Phase 4 の IR catalog 除外作業の完了条件が揃わない
- 観点の管理が暗黙的であり、観点の追加・変更が追跡できない

## 課題

観点 schema・配置先を確定し、inspect-docs 観点レジストリを実体化する。Phase 4 スコープに含めるか独立作業とするかは backlog-review で優先度判断する（item 明記）。

## 既存要件・成果物との関連

- 対象: inspect-docs 観点レジストリ（新設）、観点 schema・配置先
- 関連: REQ-028-007、IR-019/022/026/036、Epic #2076 Phase 4

## 出典

- 発生日: 2026-08-11
- 取得元: REQ-028 Phase 3 設計過程の観測
- 元 item: intake-2026-08-11-inspect-docs-perspective-registry.md
- 注記: intake-promote 経路C review の一貫性指摘（backlog-review 選定明記 item との基準統一）により保留から採用へ変更。Phase 進捗は backlog-review 分析時に再確認すること
