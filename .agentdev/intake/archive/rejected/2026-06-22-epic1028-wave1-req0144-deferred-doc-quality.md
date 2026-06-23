# REQ-0144-002/003/004 繰越: docs/ 広範囲文書品質是正

## 発生源

- Epic: #1028 (Wave 1)
- Issue: #1029 (REQ-0144 docs-check/integrity 運用是正)
- PR: #1035 (merged, squash baa6bba7)
- 発生日: 2026-06-22

## 内容

REQ-0144 の完了条件 002/003/004 は docs/ 配下全体にわたる広範囲な文書是正のため、PR #1035 のスコープ外として繰越:

- **REQ-0144-002**: 現行文書に workflow 否定表現（"not X" 形式）を含めない（REQ-0112 廃止 6状態否定表現の除去）
- **REQ-0144-003**: 現行文書に RFC2119 マーカー（MUST/SHOULD 等）を含めない（REQ-0122 廃止準拠）
- **REQ-0144-004**: docs 配下の日本語品質は REQ-0101-061・REQ-0140-003 に準拠する（英語混じり・不適切カタカナ語・文体不統一の排除）

## 推奨対応先

Wave 2（#1032 / REQ-0145 検出設計改善）または別途整備 Issue。REQ-0145 が検出ルール設計を扱うため、機械検出による特定後に是正 Issue を分割することが望ましい。

## 現在の追跡状態

- #1029 Issue 本文: 3項目 unchecked + deviation note で明示
- Epic #1028 完了条件: REQ-0144 全14要件完了は未達（Epic 自体は未クローズ）
- Wave 2 #1032: pending（#1029 クローズにより実行可能）

## 解消状態（2026-06-22 Wave 2 close）

- **解消**: PR #1036 (squash 244ea3b4, #1032 / REQ-0145 Wave 2) にて解消
  - REQ-0144-002: `checkWorkflowStatusProhibition` が data-model enum context をスキップ（phase word が backtick 内の場合）+ `extractReadmeTableReqIds` が retired section 認識を拡張
  - REQ-0144-003: `agentdev-workflow-orchestration/SKILL.md` の `（MUST）` legacy marker 見出し削除
  - REQ-0144-004: IR-045 (`checkDocLanguageQuality`) が frontmatter・filename-only link をスキップ + `agentdev-architecture-advisory.md` SPEC 見出しに日本語注記追加
- この intake item は archive/promoted へ移動可能（採用済み・解消済み）。
