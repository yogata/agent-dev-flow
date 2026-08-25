# v1〜v4 監査観点再走査での新規検査クラス化不採用の記録

## 観測

Issue #2383 (b)（REQ-010-070）の v1〜v4 監査観点再走査で、新規検査クラス化を不採用とした候補の記録: 監査観点 V1（agentdev-doc-diagnostics/SKILL.md L22 の（ADR）注記）・V4（repo-agentdev-integrity/SKILL.md L28 の agentdev-spec-compliance 参照）の Wave 1 取りこぼし2件は PR #2375 PC-01 で修正済みであり、当該パターンは Issue #2372 の IR-065/IR-066 導入時に既に検査体系へ組み込まれている。重複する新規クラス追加は行わなかった。

## 今回扱わない理由

不採用記録（TS-003 on_failure record-in-findings 要求による記録物）。対応不要の決定済み事項であり、変更候補として扱わない。

## 影響

なし（不採用により検査体系の重複が回避されている）。

## レビューで決めること

- なし（不採用記録として保管。再評価不要）

## 根拠

- PR #2395 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2395 ）
- IR-066 ルール文書「v1〜v4 監査観点再走査での採用（Issue #2383 (b)、REQ-010-070）」節
