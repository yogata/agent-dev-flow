# docs/guides/project-docs-and-specs.md の REQ 範囲表記陳腐化

## 観測

`docs/guides/project-docs-and-specs.md` が REQ 範囲を「REQ-0101 から REQ-0147」と記述しているが、実際の最終 active REQ は REQ-0151（43 files）。REQ-0148〜REQ-0151 追加時にガイドの範囲記述が更新されなかったと推定される。

## 根拠

PR #1134（test strategy 3要素構造定義）Findings:

> - **内容**: 同ファイルが REQ 範囲を `REQ-0101 から REQ-0147` と記述しているが、実際の最終 active REQ は REQ-0151 (43 files)。REQ-0148〜REQ-0151 追加時 (commit 061ed8f5 等) にガイドの範囲記述が更新されなかったものと推定される。
> - **推奨事項**: 別 Issue で `docs/guides/project-docs-and-specs.md` の REQ 範囲記述を REQ-0151 まで拡張すること。intake 候補。

PR #1137 でも `req-range-staleness` NG として pre-existing であることが記録されている。

補足: PR #1297（docs-check安定NG F-1/F-2解消）で req-range 検出の動的参照化が実施された可能性あり。現在の解消状況は要確認。
