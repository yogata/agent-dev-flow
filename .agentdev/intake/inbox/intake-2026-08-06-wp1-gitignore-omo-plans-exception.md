# intake: WP-1 で .gitignore の .omo/plans/ 例外追加を検討し証拠ファイル永続化方針を確定

## 発生日

2026-08-06

## 発生元

- Issue: #1925 (WP-0 現状固定と事前状態確認 OU-001)
- PR: #1932
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1932 本文「## Findings / Capture候補」セクション

## 問題事象

`.omo/` は `.gitignore` L11 で gitignore 対象。一方 WP-6（Release Report）で変更前後比較を行うため、`.omo/plans/agentdev-migration-2026-08-05.*` の証拠ファイルは WP-0〜WP-5 を通じて参照可能である必要がある。worktree-per-WP モデル（case-auto が各 WP ごとに worktree 作成）では、local-only の `.omo/` は後続 WP の worktree から参照できない。

WP-0 では `.gitignore` を変更せず `git add -f` で証拠ファイルのみ強制追加して対処した。WP-1 以降も同一方針を踏襲する想定だが、`git add -f` を毎回実行する運用は忘却リスクがあり、`.gitignore` に `!.omo/plans/` 例外を追加する方針の方が堅牢な可能性がある。方針が未確定。

## 影響

- WP-1〜WP-5 の各 case-run で `git add -f .omo/plans/agentdev-migration-2026-08-05.*` の実行を忘れた場合、証拠ファイルが当該 WP の worktree にのみ存在し、後続 WP や WP-6 統合検証で参照不可となる
- WP-6 Release Report の変更前後比較が一部欠損するリスク
- 運用の一貫性: WP ごとに `git add -f` を忘れた場合の発見が遅れる

## 発生局面

実装（WP-0 case-run、PR #1932 作成時）

## 検知方法

WP-0 case-run 実装中、`.omo/` が gitignore 対象であるため証拠ファイルを通常の `git add` では追跡できず、`git add -f` が必要なことを確認。worktree-per-WP モデルで後続 WP への受け渡し要件と照合し、永続化方針の検討課題として PR 本文 Findings へ記録。

## 想定される対応方向

- WP-1（#1926）の case-run または case-open で `.gitignore` の `.omo/` エントリを維持しつつ `!.omo/plans/agentdev-migration-2026-08-05.*` 例外を追加し、以降の WP で `git add -f` 不要とする
- または現行の `git add -f` 運用を維持し、各 WP の完了条件へ「証拠ファイルが main へ反映済み」を明示して忘却を防ぐ
- WP-1 case-run の Findings で最終方針を確定し、必要に応じて移行計画へ追記

## 関連

- Epic: #1924
- Issue: #1925 (WP-0)、#1926 (WP-1)
- PR: #1932 (squash merge 0fac102d)
- 対象ファイル: `.gitignore` L11（`.omo/` エントリ）
- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md`

## 出典引用

PR #1932 本文「## Findings / Capture候補」より:

> `.omo/` は `.gitignore` L11 で gitignore 対象。しかし WP-6（Release Report）で変更前後比較を行うため、証拠ファイルは WP-0〜WP-5 を通じて参照可能である必要がある。worktree-per-WP モデル（case-auto が各 WP ごとに worktree 作成）では、local-only の `.omo/` は後続 WP から参照できない。
> 本 PR では `.gitignore` を変更せず（SPEC 変更を伴わない範囲）、`git add -f` で移行証拠ファイル（`.omo/plans/agentdev-migration-2026-08-05.*`）のみを明示追加した。
> WP-1 以降でも同一方針を踏襲することを想定。もし別方針（`.gitignore` に `!.omo/plans/` 例外追加 等）が望ましい場合は WP-1 で調整可能。

## タグ

#intake #gitignore #omo-plans #worktree-per-wp #wp-1 #evidence-persistence #migration-2026-08
