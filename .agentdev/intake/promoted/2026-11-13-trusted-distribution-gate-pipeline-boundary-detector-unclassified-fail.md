# trusted-distribution-gate pipeline の boundary detector unclassified 大量検出による archive stage FAIL の解消

## 観測内容

- Case #4026 stage 4（Root Case close・2026-11-13）で AG-013 最終合格確認のため trusted-distribution-gate.ps1 を main root・bootstrap mode（base 9ec88e649 → candidate ff4677e01）で実行した結果、code=9 で fail した。
- boundary detector が .opencode/** 配下 tests のサンプル文字列（wave-gate.test.ts の「FN-1」等）を unclassified-entry として大量検出し、「projection detections bound exceeded」を記録。manifests の4投影すべて entries 空で、archive stage で配布対象多数 missing となった。
- distribution-boundary.md「検査対象の除外領域」節は「共通原本側 tests/ 配下（検出刺激用のサンプル文字列を含むテスト。Issue #2480）」を検査対象外として規定しており、gate 実装側がこの規定を適用していない乖離の疑いがある。

## 影響

- archive 公開前検査（trusted-distribution-gate pipeline）が Design 規定（検査対象の除外領域）を適用せず、unclassified 大量検出で archive stage が FAIL する。AG-013 最終合格確認の実行が技術的に不可能な状態であり、配布整合検査の最終合格条件が達成できない。
- 対応済みの観測: E4-1 配布依存境界 最終 gate（check_distribution_boundary --profile source）は本 Case の Wave 境界・#4043 再マージ後 main root で failures 0 を記録済みであり、本 pipeline 乖離は archive 公開経路の検査装置側の問題として扱う。

## 課題

- trusted-distribution-gate の boundary detector へ distribution-boundary.md「検査対象の除外領域」規定の適用（tests 配下の検出刺激用サンプル文字列の除外）。検出 bound 設定と unclassified 扱いの見直し。
- blob 分類（loadAndClassify）と manifest projection entries が空になる経路の解明と整備（main root・Windows 環境での pipeline 実行前提の検証手順整備を含む）。

## 既存要件との関連

- Case #4026 stage 4 完了記録コメント・learning inbox 2026-11-13 エントリ
- distribution-boundary.md「検査対象の除外領域」節・「検査エラーの意味」節
- DEC-014 決定7・REQ-009-045（archive 公開前検査）
