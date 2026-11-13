# Windows CI runner での installer 系 e2e 定期実行（環境既知 fail と実回帰の区別容易化）

## 観測事実

- Epic 4026 Wave 2（PR 4044、Issue 4031 対応）の本文 Findings で、Pester 3試験と bun e2e 系（scripts-behavior 等）が開発環境で恒常的に fail する（junction 生成・コンソール cp932 等の環境起因）ことが報告された。baseline 対照運用で吸収されているが、CI 上の Windows runner での定期実行があれば環境既知 fail と実回帰の区別が容易になる（改善候補・当該 PR スコープ外）。
- Epic 4026 の最終受入検査（2026-11-13・case-close 境界）でも、分割③の 11 fail が全て同一 fail クラス（install.ps1 系環境依存・textlint-guard distribution 2件）で baseline と完全一致することを機械突合で確認しており、対照運用は機能している一方で人手突合を要している。

## 具体的な修正対象

- Windows runner での bun test 分割③（install.ps1 e2e 系）定期実行と、fail クラス baseline の機械突合（既知 fail クラス集合との差分検出）の整備。実現すれば Wave 境界ごとの人手 fail set 突合を機械化できる。

## 関連

- Epic 4026・PR 4044 本文 Findings / Capture候補（Issue 4031 対応）
- agentdev-quality-gates bun test 正規形（3分割実行・fail 由来分類）
