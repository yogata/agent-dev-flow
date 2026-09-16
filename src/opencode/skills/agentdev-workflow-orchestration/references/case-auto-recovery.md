# case-auto 子 task 中断回復プロトコル

case-auto 最大自走モードから起動した case-run 子 task（実行担当サブエージェント）がハーネスの bg task 機能で破棄された際の回復パスを解説する。
状態分類と各状態の回復手順の詳細は case-auto Design「子 task 中断回復パス」を正とし、command case-auto「子 task bg task 破棄検知時の回復」がその実行指示を記載する。
本ファイルは Design と command 本文が既に更新済みであることを前提とし、両者が依拠する設計原則（ライフサイクル分離）と拡張可能性（Epic Wave 並列委譲）の解説を担う。
references 単独の作成で本件を完了扱いしない。

## ライフサイクル分離原則

子 task の bg task 破棄は子 task のライフサイクル事象である。
子 task が作成中の成果物（commit、working tree 変更、PR）のライフサイクルとは独立に扱う。

サブエージェントが破棄されても成果物は worktree に残留する。
この残留前提が回復パスの出発点になる。
親ループ（case-auto）は破棄された子 task のライフサイクルを終結させつつ、残留する成果物を別途引き継ぐ。

子 task の状態（pending 戻し、blocked 報告等）と成果物の状態（PR 作成済み、未作成等）を別々に管理する。
bg task 破棄が子 task の成果物へ意図せぬ影響を与えることを、この分離によって防ぐ。

## 中断時回復プロトコル

中断検知後の状態分類と各状態の回復手順の詳細は case-auto Design「子 task 中断回復パス」を正とする。
本節はその概要と参照構造を示す。

中断検知は Wave 内子 task の bg task 破棄検知で始まる。
case-auto 親ループは当該子 task の worktree で `git status` を実行し、以下の3状態へ分類する。

| 状態 | 判定条件 | 回復手順の参照先 |
|---|---|---|
| (a) commit 済み、PR 未作成 | commit 履歴があるが PR が未作成 | Design「状態 (a) の回復」 |
| (b) 未コミット変更あり | worktree に未コミット変更が残留 | Design「状態 (b) の回復」 |
| (c) クリーン | commit 履歴も未コミット変更もない | 後述「状態 (c) の取扱い」 |

状態 (a) は rebase、push、PR 作成代行、`completed-pr` 記録、case-close 合流の順に進む。
PR 作成代行は case-auto 親ループの責務であり、子 task 側で再び委譲を起こさない。

状態 (b) は作業意図整合確認ステップを必須とする。
未コミット変更の帰属は安全上の懸念になるため、変更内容が子 task の case-run 作業意図（Issue の受け入れ条件、実装計画）と整合するかを確認する。
整合確認ができた場合のみ commit、push、PR 作成を代行する。
整合確認できない場合は当該子 task を `blocked` とし、「未コミット変更の帰属不明」として報告する。
未確認の変更を強制 commit しない。
強制 commit は帰属不明の変更を本流へ持ち込む原因になる。

状態 (c) は回復対象がないため回復処理をスキップし、当該子 task を pending へ戻す。

rebase で解消できないコンフリクトは Design が定めるコンフリクト解消モデル（3レベルエスカレーション）Level 2/3 へ委譲する。
bg task 破棄時の状態別回復とコンフリクト解消モデルは協調関係にあり、rebase 失敗を境に後者へ委譲する。

## orchestration stage barrier への復帰（接続規則）

本回復プロトコルは case-auto の orchestration stage barrier 契約と接続する。
stage 再構成規則の正本は epic-wave-model Design「ドラフト間並列実行モデル」節と `agentdev-workflow-case-auto` SKILL.md「再開プロトコル」が保持し、本ファイルは正本を持たない。

- 中断回復後に再開する場合、現在 stage を stage cursor ではなく永続状態（起動時対象集合と各対象の正規状態）から最も早い未収束 stage として再構成し、当該 stage の対象群 barrier へ復帰する
- 回復した単一対象を後続 stage へ先行させない。他対象が当該 stage で未収束である間は、回復済み対象も次 stage を開始しない
- 回復完了済み対象は当該 stage の収束判定に含め、完了済み対象を再実行しない

## Epic Wave 並列委譲への拡張可能性

本プロトコルは case-auto の単一 Wave 内の子 task を対象とする。
Epic Wave 並列委譲で同種の子 task 破棄が発生した場合も、本回復プロトコルを per-Wave で適用できることを否定しない。

Epic Wave 並列委譲では複数の子 task が同時に起動し、それぞれが独立した worktree を持つ。
本プロトコルを並列委譲へ拡張する場合、各並列子 task の worktree を個別に管理し、中断検知を各 worktree で実施する必要がある。
並列委譲の集約原則に従い、各子 task の回復結果を case-auto 親ループが集約する。

拡張の検証、実装は本ファイルの対象外とし、将来の Decision、REQ で判断する。

## 前提と完了の扱い

本ファイルは以下を前提とする。

- Design case-auto「子 task 中断回復パス」が既に記述済みであること（Wave 1 成果物）
- command case-auto「子 task bg task 破棄検知時の回復」が既に実装済みであること（Wave 2 成果物）

references 単独の作成で本件を完了扱いしない。
Design と command 本文が更新済みであることを前提とし、本 references は分離原則と拡張可能性の解説のみを担う。

## See Also

- Design case-auto「子 task 中断回復パス」: 状態分類と各状態の回復手順の正
- command case-auto「子 task bg task 破棄検知時の回復」: 実行指示
- [capture-boundaries.md](capture-boundaries.md): キャプチャ境界、委譲可否 probe と Inability 記録
- [subagent-protocol.md](subagent-protocol.md): サブエージェント編集安全プロトコル、前工程完了度に応じた振る舞い指針
- [self-healing-and-errors.md](self-healing-and-errors.md): 自律修正ループ、CI 対応ループ、エラー回復
