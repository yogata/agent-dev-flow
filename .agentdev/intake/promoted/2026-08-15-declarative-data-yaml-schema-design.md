# declarative data 化候補4件の YAML スキーマ設計

## 観測内容

REQ-028 Phase 3 設計で特定した4つの declarative data YAML ファイル（retired-artifact-registry.yaml 等）のスキーマ設計が未確定。Phase 5 実装着手の前提条件が欠如している。正は SPEC、YAML は検出用ビューという設計原則の具体化手法も未確定。

## 影響

- Phase 5 実装着手の前提（スキーマ確定）が揃わない
- 設計原則（SPEC 正規・YAML ビュー）の具体化方針が定まらないまま実装が進むリスク

## 課題

4つの YAML スキーマ設計と設計原則の SPEC 化を進める。Phase 5 スコープに含めるか独立作業とするかは backlog-review で優先度判断する。

## 既存要件・成果物との関連

- 対象: 4つの declarative data YAML（retired-artifact-registry.yaml 等）、docs/specs/ への SPEC 追加
- 関連: REQ-028 Phase 3 設計、Epic #2076（Phase 4/5）

## 出典

- 発生日: 2026-08-11
- 取得元: REQ-028 Phase 3 設計過程の観測
- 元 item: intake-2026-08-11-declarative-data-yaml-schema-design.md
- 注記: intake-promote 経路C review で採用（item が backlog-review での優先度判断を明記）。Phase 進捗は backlog-review 分析時に再確認すること
