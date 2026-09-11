# req-health-metrics.md の AUTOGEN 計測日乖離の解消（generate_indexes.ts 再実行）

## 概要

docs/designs/quality/req-health-metrics.md:142 の req-metrics-measurement-example AUTOGEN ブロックで計測日乖離（保持値 2026-09-10 → 導出値 2026-09-12）が発生しており、IR-061 NG（route intake）として機械検出されている。base main（72bc6950）でも発生している既出乖離で、case 2779 では対象範囲外のため未解消のまま持ち帰る。

## 内容

- full check_integrity で `index-generation-consistency: req-metrics-measurement-example AUTOGEN block out of sync. first mismatch at line 52 (current=計測日: 2026-09-10。, expected=計測日: 2026-09-12。)` が NG 検出される（IR-061、SC-002）
- case 2779 の case-close 再検証（2026-09-12）で worktree（6320ffa3・junction-absent）と base main（72bc6950）の双方で同一乖離を確認 = base 既知・本 case 変更非起因
- 解消方法は `generate_indexes.ts` の再実行（計測日 AUTOGEN ブロック更新）で、REQ-059 系の生成ロジック変更は不要
- docs コミットが計測日の導出基準日を進めるたびに再発し得るため、docs 変更を伴う case での full check_integrity 実行時は本乖離を base 既知として分離し、残置した場合は intake 化して持ち帰る運用を継続する

## 根拠

- 観測元: PR 2780（case 2779 / issue 2779、`## Findings / Capture候補` intake セクション）、case-close（2026-09-12）で回収
- 元テキスト: 「docs/designs/quality/req-health-metrics.md:142 の AUTOGEN 計測日乖離（保持値 2026-09-10 → 導出値 2026-09-12、IR-061 NG・route intake として機械検出済み）: base main（72bc6950 = origin/main）でも発生している既出乖離。generate_indexes.ts の再実行（計測日 AUTOGEN ブロック更新）で解消するが、本 Issue の対象範囲外のため持ち帰り。」
