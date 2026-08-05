# baseline 変更前状態（WP-0 §4.1-5）

- 取得日時: 2026-08-06（worktree feature/issue-1925, baseline origin/main = 8f6558de）
- 取得方法: `Get-FileHash -Algorithm SHA256`
- 用途: WP-0 は baseline を更新しない（§4.2）。本ファイルは baseline が WP-0 前後で不変であることの証拠。WP-6 で再ハッシュし一致を確認する。

## baseline ファイル一覧（3ファイル）

baseline 配下: `.opencode/skills/repo-agentdev-integrity/baselines/`

| file | size (bytes) | SHA256 |
|---|---:|---|
| ir-055-baseline.json | 21549 | 93FC7ED91415BDACCD9F966C88F6FC1E5243335E9B1AC36E4C44AD7D3D20C5F0 |
| ir-059-baseline.json | 18693 | BC77FD6D5C32C1925F0D98C5063D81155A4462BD2187AFEED2F044C8146D6542 |
| ng-baseline.json | 124691 | AE9806BFE2798836646D30B068319435FCDDFE077AFB1750F7EA1789E2F98DDF |

## baseline 不変確認（TS-001 pass_criteria）

- WP-0 では baseline ファイルを修正しない（§4.2 注意点）。
- `git status` で `.opencode/skills/repo-agentdev-integrity/baselines/` 配下が clean であることを TS-001 で確認する。
- 本ファイルに記録した SHA256 は WP-0 完了後も不变であるべき値。WP-6 で再計測し、WP-0 開始時と一致することを確認する。

## baseline 役割概要

- `ir-055-baseline.json`: RuntimeReference（IR-055）の既知違反セット。checker は現行違反と baseline を比較し、delta（新規未管理違反）を NG として扱う。
- `ir-059-baseline.json`: legacy namespace residual（IR-059）の既知違反セット。
- `ng-baseline.json`: NG 全般の既知セット。WP-1〜WP-5 で違反を減らした後に `--update-ng-baseline` で更新する（移行残件を減らす方向のみ、§2 固定方針）。

本 WP-0 ではこれら baseline の更新を行わない。WP-1〜WP-5 完了後、WP-6 で最終評価し、必要に応じて §2 固定方針（「既存違反を新しいbaselineへ吸収して検査を通過扱いにしない。baselineは移行残件を減らす方向にのみ更新する」）に従い更新する。
