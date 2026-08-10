# 移行計画 §7.7.1 の回帰マトリクス文書 regression.md の backfill

## 観測内容

AgentDevFlow 2026-08 移行（Epic #1924）の移行計画 §7.7.1 は回帰マトリクス文書 `regression.md` の作成を要件するが、未作成である。WP-3（OU-004, Issue #1928）で生成されるべきだったが存在せず、WP-6 でも補完されなかった。機能面の回帰担保は unit test 82 pass + WP-6 の3 profile 実測（source/installed/release 全 exit 0）で代替確保しており、欠損は文書化 artifact のみ。

## 影響

- 移行計画 §7.7.1 の形式要件を満たさない。
- 今後の類似移行で回帰検証の参照文書が存在しない。
- Release Report §10.5 に記載済み。

## 課題

回帰マトリクス文書が未作成であり、移行前後の検出力比較を文書化した参照 asset が存在しない。文書化 artifact の補完（backfill）が必要。

> 注記: adversarial-review 審議にて「RU/REQ 変換よりも docs_chore の直接 Issue として扱う方が適切」との指摘あり。backlog-review にて docs_chore 直接 Issue 候補として評価することを推奨。

## 既存要件との関連

- Epic: #1924（AgentDevFlow 2026-08 移行）
- Issue: #1931（WP-6）
- PR: #1938
- 関連 Issue: #1928（WP-3 / OU-004、本来の生成箇所）
- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md` §7.7.1
- Release Report: §10.5

## 対応方向

- 別 Issue を起票し、§7.7.1 に基づく `regression.md` を backfill する。
- 内容: WP-3 前後の検出力比較マトリクス、各 profile（source/installed/release）の strict/warning/info 件数推移。
- 配置先候補: `.omo/plans/agentdev-migration-2026-08-05.regression.md`

## 出典

- Issue #1931（WP-6）、PR #1938
- Release Report §10.5
