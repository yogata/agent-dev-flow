# Artifact Graph augmentation ファイル配置先の SPEC 明示化

## 観測内容

標準配布スキル `agentdev-artifact-graph` の augmentation ファイル配置先について、`.agentdev/extensions/skills/agentdev-artifact-graph.yaml`（project-extensions 慣行）と `.agentdev/artifact-graph.yaml`（専用配置）の2案が存在する。REQ-012 段階1（Issue #1949, PR #1955）の本実装では専用配置（`.agentdev/artifact-graph.yaml`）を選択した。配置先の正規化基準が SPEC に明示されていない。

## 影響

- consumer と self-hosting の両環境で augmentation 配置先が統一されていない場合、検索対象 path の重複/欠落が生じ得る。
- project-extensions 慣行との混同により、拡張スキーマの配置先が使用者の期待とずれる可能性がある。

## 課題

augmentation 配置先の正規化基準が SPEC に明示されておらず、consumer/self-hosting で一貫した運用基準がない。project-extensions 機構との関係（別概念として分離 or 統合）も未定義。

## 既存要件との関連

- Epic: #1948（REQ-012: Artifact Graph 標準化）
- Issue: #1949（REQ-012 段階1）
- PR: #1955
- 仕様: `docs/specs/skills/agentdev-artifact-graph.md`（draft）
- 実装: `config.ts`
- 関連: REQ-012 段階3 #1951（Self-hosting 移行）

## 対応方向

- augmentation 配置先を SPEC `docs/specs/skills/agentdev-artifact-graph.md` へ明示する。
- project-extensions との関係（別概念として分離 or 統合）を明記する。
- 段階3 #1951（Self-hosting 移行）で project-extensions 機構との整合性を再評価する。

## 出典

- PR #1955（専用配置選択の実装）
- Issue #1949（REQ-012 段階1）
