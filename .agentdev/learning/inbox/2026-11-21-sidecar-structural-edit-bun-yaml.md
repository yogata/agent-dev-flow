---
id: 2026-11-21-sidecar-structural-edit-bun-yaml
created_at: 2026-11-22T03:45:00+09:00
source: case-run #4180 の sidecar 機械処理（PR #4197・Findings/Learning 候補の回収）
status: unreviewed
---

traceability sidecar の REQ 行除去は role/file の多階層構造（2・4インデント混在・旧 schema の role 直下リスト）を持つため、行単位の正規表現処理では file キー喪失・空 role 残存を招く。Bun.YAML（Bun.YAML.parse〔sidecar.ts の YAML 標準 API 委譲と同一〕）による構造保持除去が正解経路。

観点: sidecar 一括編集が必要な workflow は Bun.YAML ベースの処理を前置すべき。REQ-124 一式の RETIRE 実行（PR #4197）で実際に発生した修正体験に基づく。
