# retired Decision（docs/decisions/retired/）の related_reqs 取扱いの確定

## 観測内容

- 発生源: PR 2761（Issue 2756 / Epic 2755 W1）の Findings/intake 記録を回収
- capture 元: case-close Epic Wave 1（Epic 2755、delegation DEL-2756-1）
- captured_at: 2026-09-10

retired Decision（docs/decisions/retired/ 配下）の related_reqs 取扱いは REQ-059・index-auto-generation Design で明示されていない。本実装（generate_indexes.ts 生成・未宣言検出）は現行 Decision（docs/decisions/ 配下）のみを対象とした。retired Decision 復帰時（現行への再配置時）に frontmatter related_reqs の有無・未宣言検出対象への包含可否の確定が必要。

2026-09-11 時点の現行突合: REQ-059-001 は現行 Decision の frontmatter related_reqs 宣言のみを規定し、retired Decision の復帰時扱いの規定は確認できなかった（仕様ギャップの指摘は正確）。

## 影響・課題

- retired Decision の復帰時に related_reqs 未宣言検出が意図しない失敗または見逃しを生み得る
- 仕様の空白であり、復帰操作のたびに都度判断が発生する

## 後続判断に残る選択肢

- retired Decision 復帰時の related_reqs 必須性（有無の規定、空宣言の要求）
- 未宣言検出対象への包含可否（retired から現行へ再配置された時点で検出対象に入るか）

## 既存要件・契約との関連

- REQ-059（Decision と REQ の関連宣言管理）
- docs/designs/integrity/index-auto-generation.md
- docs/designs/foundations/decision-lifecycle.md
