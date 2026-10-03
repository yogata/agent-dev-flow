# intake: REQ-099-020 implementation 未帰着と REQ-099-001/020 verification 未帰着の対応候補

## 内容

traceability check（REQ-099-001〜020）で baseline 既出として継続している対応関係の欠落。

1. **REQ-099-020 missing-implementation**: installer・archive 生成系（package-release-archive、consumer archive install、同梱 README、archive レイアウト規定、trusted-distribution-gate）の implementation 対応未帰着。OU-004（#3334）の RA-004 担当範囲。
2. **REQ-099-001・020 missing-verification**: REQ 行変更を伴わない Case では対応せず baseline 継続。

対応候補: #3334（OU-004）の実装時に REQ-099-020 implementation 対応宣言を帰着させる。REQ-099-001・020 の verification 対応は REQ 行変更を伴う Case での帰着候補。

## 根拠

- 観測元: PR #3386（Case #3364・OU-003）本文 Findings / Capture候補 セクション
- 元テキスト: 「REQ-099-020 implementation 未帰着: installer・archive 系（OU-004・#3334 の RA-004 担当範囲）。本 Case 検出ではなく確認事項の記録」「REQ-099-001・020 verification 未帰着: baseline 既出。REQ 行変更を伴わないため本 Case では対応せず記録」
- case-close 再実測（2026-10-03・PR HEAD worktree 3684f85e・bun check.ts）: pass 7 / fail 2 で同一 fail を再現（case-run baseline と完全同一）
- captured_at_commit: 511dadd161b8ffeeba5eb17c16a6fdc2de52704f
