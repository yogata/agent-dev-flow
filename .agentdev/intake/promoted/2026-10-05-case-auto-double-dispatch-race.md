# 採用済み成果物: case-auto 段階派遣の重複実行による成果物競合（single-flight 保護の導入）

## 観測内容

case-auto stage 2 の case-ready 段階委任（Root Case #3457）が2系統で並走した。先行実行（PR #3458 merge 4389c49f・子 Issue #3459〜#3465 の7件作成・ready 遷移まで完了）の実行中に後行実行が起動し、子 Issue #3466〜#3475 を10件重複作成し、Epic #3457 本文（実行構成表・正規状態）を先行実行の確定内容へ上書きした（正規状態が ready から open へ後退）。後行実行は ready 遷移未到達で停滞した。先行実行側が是正（本文復元・重複子 not_planned クローズ・コメント 5984571855）して完了した。

## 影響

- 並走期間中の Epic 本文・子 Issue の書込み競合（lost update の実発生）
- 重複子 Issue 10件の作成とクローズ是正のコスト。後行実行が再開した場合、クローズ済み子への誤操作の可能性が残る
- Stage 2 fan-in 判定は是正後の正規成果物（#3459〜#3465・ready）を正として扱う必要があった

## 課題（統合先・現行状態の明記）

adversarial-review（Stream B・契約適合検証）による前提の修正を反映する:

- 元 item の「専有 Git スロットは merge/push のみ保護」という記述は不正確。実在契約は case-auto Design「共有書き込みの局所直列化（REQ-034-026）」（docs/designs/commands/case-auto.md:257-262）であり、main merge/push = リポジトリ単位直列化、**同一 Epic Issue 本文への更新 = Epic 単位直列化（per-Epic 単一書き手）**、採番・AUTOGEN 索引更新 = グローバル直列化が既に規定済み。Epic 本文上書きは「契約外領域」ではなく既存直列化契約の対象領域での違反発生であった
- 一方、**子 Issue の新規作成の重複**（#3466〜#3475）と **Jev 評価**は既存直列化契約の明示対象外であり、この指摘は正確

解決すべき論点（既存規定ゼロを確認済み — single-flight・再派遣防止の設計は docs/designs 配下に存在しない）:

1. case-auto の段階派遣への single-flight 保護（同一 Root Case×同一残階階の実行中再派遣の禁止、または既存実行の成果物検知による再利用）の導入
2. 子 Issue 新規作成の idempotency（先行実行が作成済みの子 Issue の検知・再利用を冪等再実行契約として履行させる）
3. Jev 評価・GitHub Issue 書込みの保護範囲検討（per-Epic 単一書き手は Epic 本文更新のみを対象とし、子 Issue 作成・Jev 観測書込みは未カバー）
4. 後行実行インスタンスの最終状態確認（停滞のまま残存か後始末済みかが元 item に未記載。backlog-review 側で Epic #3457 コメント 5984571855 等により確認すること）

## 既存要件との関連

- REQ-034-026（共有書き込みの局所直列化）、case-auto Design runtime 制御契約、per-Epic 単一書き手（POL-epic-tracking-single-writer）
- DEC-051（case-auto stage 3 スロット型キュー — stage 3 投入制御であり stage 2 段階委任の single-flight とは別機構）
- case-auto の冪等再実行契約（既存子 Issue の検知・再利用）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-05-case-auto-double-dispatch-race.md`（分類採用により削除済み）
- Epic #3457 コメント 5984571855（停止記録・是正内容）
- Jev 観測: 先行 20261004T211249Z-12d1・20261004T211357Z-a7fd・20261004T211358Z-d87a / 後行 20261004T211635Z-91e2・20261004T211751Z-36d3・20261004T211751Z-7502
- 子 Issue: 正規 #3459〜#3455（open）/ 重複 #3466〜#3475（not_planned クローズ済み）、merge commit 4389c49f（git log 実在確認済み）
- adversarial-review Stream A/B（backlog-auto/intake-promote、2026-10-07 実施）
