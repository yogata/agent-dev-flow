# intake: Artifact Graph augmentation ファイルの配置先を専用配置 `.agentdev/artifact-graph.yaml` とするか project-extensions 慣行 `.agentdev/extensions/skills/agentdev-artifact-graph.yaml` とするか

## 発生日

2026-08-08

## 発生元

- Epic: #1948（REQ-012: Artifact Graph 標準化）
- Issue: #1949（REQ-012 段階1: 標準コア分離）
- PR: #1955
- 取得元: PR #1955 本文「## Findings / Capture候補」セクション

## 問題事象

標準配布スキル `agentdev-artifact-graph` の augmentation ファイル配置先について、`.agentdev/extensions/skills/agentdev-artifact-graph.yaml`（project-extensions 慣行に従う）と `.agentdev/artifact-graph.yaml`（専用配置）の2案が存在し、本実装では専用配置を選択した。配置先の正規化基準が SPEC に明示されておらず、consumer と self-hosting で一貫した運用基準が必要である。

## 影響

- consumer と self-hosting の両環境で augmentation 配置先が統一されていない場合、検索対象 path の重複・欠落が生じ得る。
- project-extensions 慣行との混同により、拡張スキーマの配置先が使用者の期待とずれる可能性がある。

## 発生局面

実装（agentdev-artifact-graph 標準配布スキル新設、config.ts の augmentation 読込 path 設計時）

## 検知方法

PR #1955 実装者が設計判断の分岐を Findings セクションへ自己申告した。

## 想定される対応方向

- augmentation 配置先を SPEC `docs/specs/skills/agentdev-artifact-graph.md` へ明示し、project-extensions との関係（別概念として分離、または統合）を明記する。
- 段階3 #1951（Self-hosting 移行）で project-extensions 機構との整合性を再評価する。

## 関連

- Epic: #1948
- Issue: #1949
- PR: #1955
- 仕様: `docs/specs/skills/agentdev-artifact-graph.md`（draft）
- 実装: `src/opencode/skills/agentdev-artifact-graph/scripts/lib/config.ts`

## 出典引用

PR #1955 本文「## Findings / Capture候補」より:

> augmentation ファイル配置先を `.agentdev/extensions/skills/agentdev-artifact-graph.yaml` (project-extensions 慣行) とするか `.agentdev/artifact-graph.yaml` (専用配置) とするかは設計判断が分かれる。本実装では専用配置を選択した。

## タグ

#intake #artifact-graph #augmentation #config-path #design-decision #issue-1949
