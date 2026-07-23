# case-auto 子 task 中断回復プロトコル

case-auto 最大自走モードから起動した case-run 子 task（実行担当サブエージェント）がハーネスの bg task 機能で破棄された際の回復パスを解説する。
状態分類と各状態の回復手順の詳細は SPEC `docs/specs/commands/case-auto.md`「子 task 中断回復パス（ADR-0138, REQ-0162）」を正とし、command `src/opencode/commands/agentdev/case-auto.md`「子 task bg task 破棄検知時の回復」がその実行指示を記載する。
本ファイルは SPEC と command 本文が既に更新済みであることを前提とし、両者が依拠する設計原則（ライフサイクル分離）と拡張可能性（Epic Wave 並列委譲）の解説を担う。
references 単独の作成で本件（OU-003）を完了扱いしない。

## ライフサイクル分離原則

子 task の bg task 破棄は子 task のライフサイクル事象である（AG-004）。
子 task が作成中の成果物（commit、working tree 変更、PR）のライフサイクルとは独立に扱う。

サブエージェントが破棄されても成果物は worktree に残留する。
この残留前提が回復パスの出発点になる。
親ループ（case-auto）は破棄された子 task のライフサイクルを終結させつつ、残留する成果物を別途引き継ぐ。

子 task の状態（pending 戻し、blocked 報告等）と成果物の状態（PR 作成済み、未作成等）を別々に管理する。
bg task 破棄が子 task の成果物へ意図せぬ影響を与えることを、この分離によって防ぐ。

## 中断時回復プロトコル

中断検知後の状態分類と各状態の回復手順の詳細は SPEC `docs/specs/commands/case-auto.md`「子 task 中断回復パス」を正とする。
本節はその概要と参照構造を示す。

中断検知は Wave 内子 task の bg task 破棄検知で始まる。
case-auto 親ループは当該子 task の worktree で `git status` を実行し、以下の3状態へ分類する。

| 状態 | 判定条件 | 回復手順の参照先 |
|---|---|---|
| (a) commit 済み、PR 未作成 | commit 履歴があるが PR が未作成 | SPEC「状態 (a) の回復」 |
| (b) 未コミット変更あり | worktree に未コミット変更が残留 | SPEC「状態 (b) の回復」 |
| (c) クリーン | commit 履歴も未コミット変更もない | 後述「状態 (c) の取扱い」 |

状態 (a) は rebase、push、PR 作成代行、`completed-pr` 記録、case-close 合流の順に進む（AG-002）。
PR 作成代行は case-auto 親ループの責務であり、子 task 側で再び委譲を起こさない（ADR-0137 の委譲起点折りたたみモデル）。

状態 (b) は作業意図整合確認ステップを必須とする（AG-003）。
未コミット変更の帰属は安全上の懸念になるため、変更内容が子 task の case-run 作業意図（Issue の受け入れ条件、実装計画）と整合するかを確認する。
整合確認ができた場合のみ commit、push、PR 作成を代行する。
整合確認できない場合は当該子 task を `blocked` とし、「未コミット変更の帰属不明」（REQ-0114-108）として報告する。
未確認の変更を強制 commit しない。
強制 commit は帰属不明の変更を本流へ持ち込む原因になる。

状態 (c) は回復対象がないため回復処理をスキップし、当該子 task を pending へ戻す（REQ-0162-004、AG-001）。

rebase で解消できないコンフリクトは SPEC が定める ADR-0132 のコンフリクト解消モデル（3レベルエスカレーション）Level 2/3 へ委譲する。
bg task 破棄時の状態別回復とコンフリクト解消モデルは協調関係にあり、rebase 失敗を境に後者へ委譲する。

## Epic Wave 並列委譲への拡張可能性

本プロトコルは case-auto の単一 Wave 内の子 task を対象とする。
Epic Wave 並列委譲（REQ-0114-087〜093、ADR-0125）で同種の子 task 破棄が発生した場合も、本回復プロトコルを per-Wave で適用できることを否定しない。

Epic Wave 並列委譲では複数の子 task が同時に起動し、それぞれが独立した worktree を持つ。
本プロトコルを並列委譲へ拡張する場合、各並列子 task の worktree を個別に管理し、中断検知を各 worktree で実施する必要がある。
並列委譲の集約原則（REQ-0114-092）に従い、各子 task の回復結果を case-auto 親ループが集約する。

拡張の検証、実装は本ファイルの対象外とし、将来の ADR、REQ で判断する。

## 前提と完了の扱い

本ファイルは以下を前提とする。

- SPEC `docs/specs/commands/case-auto.md`「子 task 中断回復パス（ADR-0138, REQ-0162）」が既に記述済みであること（OU-001 成果物、Wave 1）
- command `src/opencode/commands/agentdev/case-auto.md`「子 task bg task 破棄検知時の回復」が既に実装済みであること（OU-002 成果物、Wave 2）

references 単独の作成で本件（OU-003）を完了扱いしない。
SPEC と command 本文が更新済みであることを前提とし、本 references は分離原則と拡張可能性の解説のみを担う。

## See Also

- SPEC `docs/specs/commands/case-auto.md`「子 task 中断回復パス（ADR-0138, REQ-0162）」: 状態分類と各状態の回復手順の正
- command `src/opencode/commands/agentdev/case-auto.md`「子 task bg task 破棄検知時の回復」: 実行指示
- [capture-boundaries.md](capture-boundaries.md): キャプチャ境界、委譲可否 probe と Inability 記録
- [subagent-protocol.md](subagent-protocol.md): サブエージェント編集安全プロトコル、前工程完了度に応じた振る舞い指針
- [self-healing-and-errors.md](self-healing-and-errors.md): 自律修正ループ、CI 対応ループ、エラー回復
- REQ-0162: 配布物の harness 実行制御分離（REQ-0162-002/003/004）
- REQ-0114: case-auto 最大自走モード（REQ-0114-087〜093、REQ-0114-092、REQ-0114-108）
- ADR-0125: Epic Wave 並列委譲
- ADR-0132: コンフリクト解消モデル（3レベルエスカレーション）
- ADR-0137: case-run インライン実行（委譲起点折りたたみモデル）
- ADR-0138: case-auto オーケストレーション制御の AgentDevFlow 側集約
