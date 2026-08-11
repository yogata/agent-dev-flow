# intake: declarative data 化候補4件の YAML スキーマ設計（Phase 4/5 実施候補）

## 発生日

2026-08-11

## 発生元

- Issue: #2080 (OU-004 Phase 3 横断的 invariant 統合設計)
- PR: #2087 (feat(spec): REQ-028 Phase 3 IMPLEMENT 22 IR 横断的統合設計)
- Epic: #2076 (REQ-028: IR portfolio audit and existence-condition hardening)
- 取得元: PR #2087 本文「## Findings / Capture候補」>「### intake 候補」、設計書 `docs/specs/integrity/audits/cross-cutting-integration-design-20260811.md` §6

## 問題事象

REQ-028 Phase 3 横断的統合設計で共通 detector 統合対象16件の検出データを declarative data（YAML）として切り出す候補を4件特定したが、実体 YAML ファイルのスキーマ設計（配置先、フィールド構成、SPEC との協調方法）が未実施である。Phase 5（OU-006）で detector 実装時に YAML 実体を作成する必要があるが、スキーマ設計が未確定では実装作業の着手準備が不十分となる。

特定済み候補（設計書 §6.1〜§6.4）:
1. `retired-artifact-registry.yaml` — IR-025/037/043 共通データソース
2. `command-format-rules.yaml` — IR-028/029/030/031 共通データソース
3. `distribution-targets.yaml` — IR-046/047/048 共通データソース
4. `delegation-contract-patterns.yaml` — IR-032/033 共通データソース

## 影響

- Phase 5（OU-006 #2082）実装着手の準備不足: YAML スキーマ未確定は detector 実装の前提欠如
- §6.5 設計原則「正は SPEC、YAML は検出用ビュー」の実体化手段が未確定: 二重管理回避の具体的マッシュアップ方式、SPEC ↔ YAML 同期方向の機械化など
- REQ-028-005「共通 detector と declarative data 統合可能性」完全達成の阻害要素

## 発生局面

実装（REQ-028 Phase 3 横断的統合設計での declarative data 化候補特定）

## 検知方法

Phase 3 設計書 §6.1〜§6.4 で4候補を特定し、§6.5 で設計原則を示したが、実体 YAML ファイルのスキーマ設計は「Phase 5 で実施」と明記的に先送りした。PR #2087 本文「### intake 候補」に明記。

## 想定される対応方向

- **Phase 4 (OU-005 #2081) または Phase 5 (OU-006 #2082) 開始時にスキーマ設計を実施**: 4 YAML のフィールド構成、配置先（`docs/specs/integrity/data/` 等の候補）、SPEC との協調方法（正は SPEC、YAML はビュー）を確定
- **§6.5 設計原則の SPEC 化**: 設計書 §11.1 SPEC確定候補「共通 detector と declarative data の分離原則」を `integrity-contracts.md` または `validator-split-criteria.md` へ明文化する候補を Phase 5 で確定
- **backlog-review で優先度判断**: Phase 5 スコープに含めるか、独立作業とするかを評価

## 関連

- Epic: #2076 (REQ-028 IR portfolio audit)
- Issue: #2080 (OU-004 Phase 3)
- PR: #2087 (squash merge commit b834c84a)
- 設計書: `docs/specs/integrity/audits/cross-cutting-integration-design-20260811.md` §6, §11.1
- 関連要件: REQ-028-005（共通 detector 統合可能性）
- 後続 Issue: #2081 (OU-005 Phase 4)、#2082 (OU-006 Phase 5)

## 出典引用

PR #2087 本文「## Findings / Capture候補」>「### intake 候補」より:

> - declarative data 化候補4件（§6）の YAML スキーマ設計を Phase 4 または Phase 5 開始時に実施すべき候補

設計書 §6.5「declarative data 化の設計原則」より:

> 4. **Phase 5 での実体作成**: 本 Phase 3 は候補特定までとし、YAML ファイルの実体作成、detector への組込は Phase 5（OU-006）で実施する。

## タグ

#intake #declarative-data #yaml-schema #req-028 #epic-2076 #ir-portfolio-audit #phase-delegation #phase-5
