---
title: 子 task 中断回復パス
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-auto.md から参照される詳細仕様（遅延読み込み）。 -->

# 子 task 中断回復パス

## 子 task 中断回復パス（v2:ADR-0138, REQ-002）

case-auto が Phase 2（case-run インライン実行）で起動した子 task の bg task が破棄された場合、case-auto 親ループが当該子 task の状態を回復する。
本節は v2:ADR-0138 で合意された bg task 状態管理、破棄検知時の状態別回復の Design 実装であり、v2:ADR-0137 の委譲起点折りたたみモデル、v2:ADR-0132 のコンフリクト解消モデルと協調する。

### 中断検知と状態分類

case-auto が子 task の bg task 破棄を検知した場合、当該子 task の worktree で `git status` を実行し、以下の3状態のいずれかに分類する。

| 状態 | 判定条件 |
|---|---|
| (a) commit 済み、PR 未作成 | commit 履歴があるが PR が未作成 |
| (b) 未コミット変更あり | worktree に未コミット変更が残留 |
| (c) クリーン | commit 履歴も未コミット変更もない |

状態 (c) クリーンの場合は回復対象がないため回復処理をスキップし、当該子 task を pending へ戻す（REQ-002-004 準拠）。
状態 (a) (b) はそれぞれ後述の回復手順へ進む。

### 状態 (a) の回復（commit 済み、PR 未作成）

case-auto 親ループが当該 worktree で回復処理を代行する。

1. `git rebase origin/main` で最新の main へ追従する（必要時）。rebase で解消できないコンフリクトは v2:ADR-0132 のコンフリクト解消モデル Level 2/3 へ委譲する
2. `git push` でリモートへ反映する
3. PR 作成を代行する。PR の base branch、タイトル、本文は子 task の Issue に紐づく情報（Issue 番号、Issue タイトル、受け入れ条件、work_type）から生成する。子 task の Issue タイトルは Issue タイトル記述規則（`workflows/issue-title-policy` Design）適用済みの表示用タイトルである。PR タイトル自体は Conventional Commits 形式であり Issue タイトル記述規則 Design の対象外であるため、生成時に書式を複製せず Issue タイトルを入力として参照する
4. 作成した PR 番号を子 task の result に `completed-pr` として記録する
5. 通常の case-close フローへ合流させる

回復時の PR 作成代行は case-auto 親ループの責務である（v2:ADR-0137 の委譲起点折りたたみモデルを維持し、子 task 側で再度委譲を起こさない）。

### 状態 (b) の回復（未コミット変更あり）

未コミット変更の帰属は安全上の懸念となるため、変更内容の作業意図整合確認ステップを必須とする。

1. worktree の変更内容（`git diff`、`git status`）を確認する
2. 変更内容が子 task の case-run 作業意図（Issue の受け入れ条件、実装計画）と整合するかを確認する
3. 整合確認ができた場合のみ、commit、push、PR 作成を代行する（PR 生成情報の Issue 紐づけは状態 (a) と同じ）
4. 整合確認できない場合（別 Issue 由来の変更混入、意図不明の変更等）は当該子 task を `blocked` とし、停止理由を「未コミット変更の帰属不明」（REQ-006-108）として報告する

安全のため、未確認の変更を強制 commit しない。
強制 commit は帰属不明の変更を本流へ持ち込む原因となる。

### v2:ADR-0137/0138/0132 との整合関係

- **v2:ADR-0138（case-auto オーケストレーション制御の AgentDevFlow 側集約）**: 本回復パスは v2:ADR-0138 で合意された bg task 状態管理、破棄検知時の状態別回復の Design 実装である。Phase 2 の実行制御、固定並列数、bg task 状態管理を AgentDevFlow 側で規定する方針に従う
- **v2:ADR-0132（コンフリクト解消モデル）**: 状態 (a) の rebase で解消できないコンフリクトは v2:ADR-0132 の 3レベルエスカレーションモデル（Level 2/3）へ委譲する。bg task 破棄時の状態別回復とコンフリクト解消モデルは協調関係にある（v2:ADR-0138 relates-to v2:ADR-0132）
- **v2:ADR-0137（case-run インライン実行、多重委譲回避）**: 回復時の PR 作成代行は case-auto 親ループの責務とし、委譲起点の折りたたみモデルを維持する。子 task 側で再び委譲を起こして多重委譲を誘発しない

### 回復後の再委譲形態（REQ-034-044）

状態 (a)/(b) の親ループによる回復代行（REQ-034-029）は維持する。回復代行によらず子 task へ再委譲する場合（実行未試行判定時等）、再委譲の形態は同期実行によらず staggered background fan-out とし、並列性の回復を resume の反復で追求する（REQ-034-044、REQ-031-030、DEC-042）。background 再委譲の起動失敗が継続する場合は、Design が所有する再試行計上契約に基づき delegation-unavailable として再開可能な停止報告へ確定する。
