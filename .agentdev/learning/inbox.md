# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-16: 並列テストプロセスの一時成果物が os.tmpdir() 横断走査で外部残渣として誤検出される

- **問題事象**: bun test フルスイート並列実行下で、archive-builder staging path テストの `os.tmpdir()` 横断 orphan scan が並列プロセスの `trust-archive-*` 一時残渣を検出し、テスト本体と無関係な flaky fail を生じていた（RU-0021）。
- **発生局面**: case-run（REQ-083-001 の flaky 隔離是正。PR #2885 RA-001）。
- **検知方法**: フルスイート並列実行の反復で flaky fail が継続することを case-open 前の観察で検知。
- **根本原因**: テスト固有の一時領域と並列プロセス間で共有される `os.tmpdir()` を走査対象として区別していなかった。
- **自律対応内容**: suite-private TMP/TMPDIR/TEMP 隔離を `mkdtempSync` で実装し、fixture 作成と残渣検査を同一専用領域へ閉じた（PR #2885 で適用済み・マージ済み）。
- **ユーザー確認の有無**: なし（case-run / case-close の検証で解消確認）。
- **Decision/REQ/spec影響**: なし（REQ-083-001 の完了条件として解消済み）。
- **横展開観点**: `os.tmpdir()` を横断走査するテスト・検査スクリプト全般で同種の誤検出が発生し得る。専用領域への閉じ込みは汎用パターン。
- **再発条件**: 新規テストが再びグローバル `os.tmpdir()` を横断走査対象に含めた場合。
- **予防策候補**: 残渣検査を含むテストではテスト固有 TMP を `mkdtempSync` で確保し、検査範囲をその配下に限定する規約化。
- **想定反映先**: REQ-083 隣接資産（trusted-distribution-gate 検査テスト規約）、将来の検査テスト新設時。
- **関連**: Issue #2882（Ref）、PR #2885（Refs）。
- **タグ**: #testing #parallel-flaky #tempdir

---

## 2026-09-16: TEMP に残存する既存 trust-archive-verify 残渣の観察

- **問題事象**: `trust-archive-verify-y0os8C` が本 Case 実行前に TEMP へ残存（作成時刻 2026-09-14）。PRE/POST で増分なし、本 Case の対象外。
- **発生局面**: case-run 検証（REQ-083-001 の orphan 検査 PRE/POST 計測）。
- **検知方法**: 検証時の TEMP trust-archive 残渣 PRE/POST 突合。
- **根本原因**: 過去の verify 系実行が残渣を清理せず放置した痕跡と推定（特定は未実施、対象外）。
- **自律対応内容**: 既存残渣として記録し、本 Case では増分なし（無変動）を確認。
- **ユーザー確認の有無**: なし（記録のみ）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: checker 本体の残渣管理（古い残渣の清掃・期限管理）の別候補。
- **再発条件**: verify 系ツールが TEMP 残渣を清理しないまま運用が続く場合。
- **予防策候補**: checker 本体側の残渣クリーンアップ・期限切れ残渣の掃除導入を検討。
- **想定反映先**: trusted-distribution-gate checker 本体の残渣管理（将来の追跡Issue候補）。
- **関連**: PR #2885（Refs）の Findings 記録。
- **タグ**: #tempdir #residue #cleanup

---
