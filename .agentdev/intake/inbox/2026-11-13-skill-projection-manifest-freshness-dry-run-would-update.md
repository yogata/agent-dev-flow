# skill-projection-manifest.yaml の鮮度是正要否（generate_indexes --dry-run が WOULD UPDATE）

## 観測事実

- Epic 4026 Wave 2（PR 4041、Issue 4032 対応）の本文 Findings で、main root（2b99930f7 検証済みクリーン状態）で `generate_indexes.ts --dry-run` が skill-projection-manifest.yaml を WOULD UPDATE すると報告された。main 側の手動残置との陳腐化であり、当該 PR では checkout で退けて範囲外混入を回避した。
- manifest 鮮度の是正要否は promote 判断で評価する候補として申告済み。

## 具体的な修正対象

- skill-projection-manifest.yaml を AUTOGEN 正規手順で再生成し、main の手動残置分と導出結果の差分を解消する。手動残置が正である理由（意図的な手動定義）がある場合はその根拠を記録し、dry-run が WOULD UPDATE を報告しない状態へ戻す。
- あわせて manifest 鮮度の機械検査（AUTOGEN freshness 系 checker への組み込み）の要否を評価する。

## 関連

- Epic 4026・PR 4041 本文 Findings / Capture候補（Issue 4032 対応）
- repo-agentdev-integrity generate_indexes.ts
