# ADR-0001 本文に旧 skill 名残存

## 観測
`docs/adr/ADR-0001.md` L37 の結果・影響セクションに旧 skill 名が残存している:
- `issue-work-orchestration`（現行: `agentdev-workflow-orchestration`）
- `tips-pipeline-orchestration`（現行: `agentdev-learning-pipeline`）

## 影響
ADR-0001 は status: proposed であり、将来の判断参照時に旧名称が混在していると混乱を招く。

## レビューで決めること
- 該当箇所の旧 skill 名を現行名に更新するか
- ADR が歴史的記録であるためそのままとするか

## 根拠
- Integrity Check Report 2026-05-31 F-03
- 分類: `document-drift`
- 推奨ルート: `intake`
