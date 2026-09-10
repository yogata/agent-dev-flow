# intake: retired Decision（docs/decisions/retired/）の related_reqs 取扱いの確定

- **発生源**: PR #2761（Issue #2756 / Epic #2755 W1）の Findings/intake 記録を回収
- **capture 元**: case-close Epic Wave 1（Epic #2755、delegation DEL-2756-1）
- **captured_at**: 2026-09-10

## 内容

retired Decision（docs/decisions/retired/ 配下）の related_reqs 取扱いは REQ-059・index-auto-generation Design で明示されていない。本実装（generate_indexes.ts 生成・未宣言検出）は現行 Decision（docs/decisions/ 配下）のみを対象とした。retired Decision 復帰時（現行への再配置時）に frontmatter related_reqs の有無・未宣言検出対象への包含可否の確定が必要。

## 補足
