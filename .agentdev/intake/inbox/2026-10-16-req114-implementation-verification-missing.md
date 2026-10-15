# intake: REQ-114 全行の implementation / verification 対応欠落（既存未充足・本 Case 対象外）

- **発見元**: PR #3757（子 Issue #3744 / OU-012）case-run 検証、traceability check --req REQ-114-001〜015
- **内容**: REQ-114 の全 15 行が missing-implementation と missing-verification で検出される（main baseline と同一の既出）。REQ-114 は 2026-10-15 新設の REQ であり、実装・検証対応は本 Case #3729 の対象外（REQ-114 反映未完了群 DB02/DS17/DS19 の処理も対象外）として残留している
- **状態**: 未対応（Case #3729 完了後も継続）。REQ-114 の実現 Case の起票候補
- **識別子**: docs/requirements/REQ-114.md、REQ-114-001〜015、関連 Case #3729（PR #3757、merge commit bb848836）
- **capture 由来**: case-close Capture 回収 2026-10-16（Epic #3732 / PR 本文 Findings セクション）
