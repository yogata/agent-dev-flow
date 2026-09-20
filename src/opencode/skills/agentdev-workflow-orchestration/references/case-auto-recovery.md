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

## orchestration stage モデルへの復帰（接続規則）

本回復プロトコルは case-auto の orchestration stage モデル（stage 1 case-open（例外経路時は case-revise）/ stage 2 case-ready / stage 3 case-run / stage 4 case-close、stage 内最大並列・stage 間全対象収束 fan-in）と接続する。
stage 再構成規則の正本は case-auto Design「ドラフト間並列実行モデル」節と `agentdev-workflow-case-auto` SKILL.md「再開プロトコル」が保持し、本ファイルは正本を持たない。

- 中断回復後に再開する場合、現在 stage を stage cursor ではなく永続状態（起動時対象集合と各対象の正規状態）から最も早い未収束 stage として再構成し、当該 stage の全対象収束（fan-in）へ復帰する
- 回復した単一対象を後続 stage へ先行させない。他対象が当該 stage で未収束である間は、回復済み対象も次 stage を開始しない
- 回復完了済み対象は当該 stage の収束判定に含め、完了済み対象を再実行しない

### 対象別 stage 進行度再構成規則（4-stage 版）

再開時の対象別 stage 進行度は、永続状態の次の証跡の組み合わせから再構成する。単一の証跡だけで判定せず、証跡同士が矛盾する場合は安全側（判定不能）へ分類する。

| 証跡 | 判定内容 |
|---|---|
| draft / RU の存在 | stage 1 または stage 2 未収束。Root Case Issue 未確立なら stage 1 未完了、確立済みなら stage 1 完了・stage 2 未完了と組み合わせ判定 |
| Root Case Issue state（open / ready / running / review / closed） | stage 2 収束後の stage 進行判定（ready → stage 2 収束済み、running / review → stage 3 進行中または完了、closed → stage 4 収束済み候補） |
| PR の存在と状態 | stage 3 完了判定（PR 作成済み）と stage 4 完了判定（PR merged） |
| Epic Issue ステータス追跡テーブル | Epic execution_unit の場合、Wave 反復の進行度と stage 3 内部処理の完了判定に使用（case-auto は読取のみ、単一書き手は case-close） |

- draft / RU 存在 → stage 1 / stage 2 の未収束判定に使用。draft / RU の存在だけでは stage 1 と stage 2 を区別できないため、Root Case Issue の有無と state を組み合わせる
- Issue state と PR 存在 → stage 2〜4 の各 stage 完了判定に使用。Issue state、PR 番号、merge 状態は durable state（Issue 本文・GitHub 状態）から再取得する
- Epic Issue ステータス追跡テーブル → Epic execution_unit の stage 3 完了判定（全子Issue 終端と Epic Issue 状態。既存 Epic/Wave workflow の完了状態基準に従い、内部ロジックを複製しない）
- これらの証跡から対象の stage 進行度を一意に判定できない場合は、当該対象を再実行せず blocked として報告する（安全側規則）。判定不能対象を根拠に完了済み対象を巻き戻さない

### stage 1 / 2 / 4 並列委譲の bg task 破棄回復（適用範囲拡張）

orchestration stage モデルの 4-stage 化により、stage 1（case-open / case-revise 委譲）、stage 2（case-ready 委譲）、stage 4（case-close 委譲）も並列委譲し得る。
本プロトコルの bg task 破棄回復（ライフサイクル分離原則、成果物状態の区別、回復パターン適用）は、stage 3（case-run 子 task）に限定せず、stage 1 / 2 / 4 の並列委譲の子 task へも、case-auto の bg task 破棄回復契約（commit 済み PR 未作成状態と未コミット変更残存状態の区別と対応する回復パターン適用）の適用範囲拡張として適用する。

- stage 1 / 2 / 4 の委譲子 task は worktree を作成・保持しないため、成果物状態の区別の証跡は当該委譲工程の成果物の durable state（Issue / PR の存在と状態）で行う。worktree の `git status` による3状態分類は stage 3 の case-run 子 task に固有の手順であり、stage 1 / 2 / 4 では成果物種別へ読み替える
- 読み替えの対応: stage 1（case-open / case-revise）は Root Case Issue の確立有無、Amendment PR の作成有無を区別する。stage 2（case-ready）は Definition PR の作成有無、merge 完了・未完了を区別する。stage 4（case-close）は PR merge 完了・未完了、Issue close 完了・未完了を区別する
- 区別された状態に対応する回復パターン（成果物引き継ぎ、代行処理、pending 戻し）を適用する。子 task のライフサイクル事象と成果物のライフサイクルを分離する原則（前述）は各 stage 共通とする
- 状態 (c)（回復対象なし）と判定した場合は当該子 task を pending へ戻す（委譲起動不能時の pending 戻し契約）。delegation-unavailable 起因の pending 戻し対象は当該実行の後続 stage から除外して再開時に扱う（case-auto 実行契約）

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
