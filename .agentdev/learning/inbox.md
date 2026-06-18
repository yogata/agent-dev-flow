# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-18: case-open cleanup で git add -A を使用すると意図しないファイル削除が混入するリスク

**状況**: case-open の後段処理（draft/RU削除）で `git add -A` を使用したところ、過去のcase-auto実行で作業ディレクトリから物理削除されていた他のtracked draftファイルの削除も同時にstagingしてしまった。対象外のdraft 2件が誤削除され、復元commitが必要になった。

**学び**: cleanup処理で `git add -A` を使う前に `git status` で意図しない変更・削除がないか必ず確認すること。または、削除対象ファイルのパスを明示的に `git rm` / `git add` で指定し、`git add -A` を避けること。

**再発防止**: case-open/case-close のcleanup stepでは、削除対象ファイルを明示的に指定して staging する。

## 2026-06-18: REQ ID は4桁、IR ID は3桁 — パーサ実装で桁数を取り違える落とし穴

**状況**: Issue #898 の catalog/impact-map パーサ実装で、REQ ID の正規表現を `/^REQ-\d{3}$/` と書いてしまった（3桁）。実際の REQ ID は4桁（REQ-0101 等）であり、テストで REQ ID が一切マッチしない不具合が発生した。IR ID は3桁（IR-001 等）であるため、両者を混同しやすい。

**学び**: AgentDevFlow の ID 体系では「REQ は4桁（REQ-NNNN）、IR は3桁（IR-NNN）」と桁数が異なる。パーサやバリデータを実装する際は、ID 種別ごとの桁数を明示的に確認し、正規表現の桁数を取り違えないこと。

**再発防止**: ID の正規表現を書く際は、対象 ID の実際のサンプル（REQ-0101, IR-001 等）をコメントに併記し、桁数を誤らないようにする。テストでは必ず実データ（catalog や impact-map からの実 ID）を使用して検証する。

## 2026-06-18: gate hook の strict/heuristic 区別は --strict-only flag で解決する（global exit code 変更禁止）

**状況**: Issue #899 の Delta Guard / Impact Guard 実装で、`check_integrity.ts` の exit code が strict 違反（block）と heuristic 違反（warning）を区別できない問題に直面した。`determineExitCode()` は ng と warning の両方で EXIT_NG(1) を返すため、heuristic 違反でも commit/push が block されてしまう。global な `determineExitCode()` の挙動を変更すると full-audit mode の既存テストが壊れるリスクがあった。

**学び**: gate hook で strict/heuristic を区別する必要がある場合、global exit code semantics を変更せず、`--strict-only` flag を追加して `determineExitCodeStrict()` を実装すること。これにより既存の full-audit 呼び出しは影響を受けず、gate hook のみが strict-only モードで動作する。併せて `classifyResult()` が `finding_level` を未設定のまま残す既存不具合も root-cause fix した（`--strict-only` の前提となるため）。

**再発防止**: exit code の strict/heuristic 区別が必要な場面では、呼び出し元が flag で挙動を切り替えられるようにする。global な関数の挙動を変更すると影響範囲が予測不能なため、flag-based の opt-in アプローチを優先する。

