---
description: inbox.mdから正規化、分類、8軸評価、HITL確定を経て採用済み成果物を生成する
---

# 学びの正規化、評価、昇華判定と採用済み成果物生成

`.agentdev/learning/inbox.md` の学びエントリを読み込み、正規化、問題クラス分類、8軸評価、廃棄判定、既存対策確認、HITL承認を経て採用済み成果物を生成する。

**重要**: `.opencode/` への直接配置、直接反映は行わない。
反映ルート: promoted → `/agentdev/backlog-review`（RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`。
旧 `learning-refine` の全機能を吸収済み（事前実行不要）。

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/learning-promote.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- `.agentdev/learning/inbox.md`（必須）— 未処理の学びエントリ
- `.agentdev/learning/deferred.md`（任意）— 過去エントリ参照用

## 出力

- `.agentdev/learning/evaluation-report.md`（8軸評価レポート、評価根拠中間成果物）
- `.agentdev/learning/promoted/{category}-{name}.md`（採用済み成果物）
- `.agentdev/learning/deferred.md`（inbox からの移動分を追記）
- `.agentdev/learning/inbox.md`（ヘッダーのみにクリア）

## 手順

### Step 1: inbox.md 読込

ファイルなし → エラー終了（「先に `agentdev-learning-capture` skill で学びを追加してください」）。`---` 区切りエントリをカウント、0件 → 「分析対象の学びがありません」と終了

### Step 2: deferred.md 読込

存在すれば読込、不存在は空として扱う

### Step 3: 全エントリの読込と旧フォーマット正規化

`agentdev-learning-pipeline` を参照

### Step 4: 問題クラス分類

`agentdev-learning-pipeline` を参照

### Step 5: 8軸評価スコアリング

`agentdev-learning-pipeline` を参照

### Step 6: evaluation-report.md 生成、更新

`agentdev-learning-pipeline` を参照

### Step 7: 廃棄判定（11カテゴリ + duplicate）

`agentdev-learning-pipeline` を参照

**昇華可能性評価、無条件自動REQ化禁止（REQ）**: 各問題クラスについて恒久契約（REQ/ADR/SPEC）への昇華可能性を評価する。
8軸評価スコア、禁止条件フィルタリングゲート、既存対策照合を基に昇華可否を判定する。
**無条件の自動REQ化は禁止する**。
学びは昇華（`promoted/` → `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save`）を経て初めて REQ 化される。
学びを直接 REQ 化しない。

**living pool 維持（REQ）**: 昇華不能な知見（`deferred` 判定、情報が断片的、出現回数が少ない等）は `deferred.md` の living pool で維持し、REQ 化しない。`deferred.md` は deferred カテゴリ（11廃棄判定カテゴリの1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する多状態の living pool である（AG-005）。終端保管ではなく、次回 `/agentdev/learning-promote` 実行時に再評価の対象となる。

### Step 8: 既存対策確認

`agentdev-learning-pipeline` を参照

### Step 8-R1: adversarial-review 発動条件判定（経路D）

`agentdev-learning-pipeline` の「adversarial-review 候補判断と内部挿入」節（経路D）を参照。本 Step は発動条件判定のみを行い、review 呼出（Step 8-R2）と分離する（REQ-015-001）。

発動条件は次のいずれも満たすこと。

- ユーザーが adversarial-review を明示的に要求していること（REQ-015-002）。明示要求がない場合は発動せず、Step 9 へ進む（REQ-015-003）
- evaluation-report.md が Step 6 で生成・更新済みであり、Step 7（廃棄判定）と Step 8（既存対策確認）の結果が反映されていること

明示要求がない限り review は発動せず、従来フローを維持する。adversarial-review は任意助言手段であり、新規必須工程、QG、承認ゲートとして導入しない（REQ-014-001）。共通 caller integration 契約の正規所有者は `agentdev-adversarial-review` SPEC（REQ-014）である。

発動条件成立時は Step 8-R2 へ進む。非成立時は Step 8-R2 を迂回し Step 9 へ進む。

### Step 8-R2: adversarial-review 呼出（経路D）

`agentdev-learning-pipeline` の「adversarial-review 候補判断と内部挿入」節（経路D）を参照。本 Step は review 呼出のみを行い、発動条件判定（Step 8-R1）と分離する（REQ-015-001）。

review 対象は evaluation-report.md のみとする（正規化結果、問題クラス分類、8軸評価スコア、廃棄判定、既存対策照合結果）。inbox → deferred 移動（Step 13）、prune（Step 14）、commit/push（Step 15）等の不可逆処理は未実行である。

呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し（REQ-014-010）、利用不能を報告した上で従来フロー（Step 9 以降）と既存 HITL（Step 10 ユーザー承認）を維持する。

accepted finding は learning-promote が責任を持って判定対象へ反映する（REQ-014-006）。adversarial-review 自身は反映を行わない。

review 反映時（review 対象の意味内容が変更された場合）は Step 6 へ戻り、次の順で関連 Step を再実行する（REQ-015-007、Step 6 戻しループ）。

1. Step 6（evaluation-report 生成、更新）: accepted finding の反映結果を evaluation-report.md へ集約
2. Step 7（廃棄判定）: 反映後の判定結果で再判定
3. Step 8（既存対策確認）: 反映後の対策照合結果で再確認
4. Step 8-R1（発動条件判定）: 再発動可否を判定
5. Step 8-R2（review 呼出）: REQ-014-007 が定める再 review 発動条件（新たな本質的争点が生じ得る場合）を満たす場合のみ再 review

再 review の停止条件（REQ-014-008、4点）を満たした時点でループを離脱し、Step 9 へ進む。新証拠、新前提、異なる failure condition、未評価範囲のいずれも伴わない同一 finding の再起票を禁止する（REQ-014-007）。

unresolved な本質的争点またはユーザー判断事項が残る場合、Step 9（判定結果提示）、Step 10（ユーザー承認）、Step 13（deferred 移動）、Step 14（prune）、Step 15（commit/push）等の不可逆処理へ進まない（REQ-014-009）。unresolved は既存の HITL（Step 10 ユーザー承認）または blocker 扱いへ振り向ける。adversarial-review 自体を恒久的な統制ゲートとしない。

### Step 9: ユーザーへの判定結果提示

`agentdev-learning-pipeline` を参照

### Step 10: ユーザー承認

`agentdev-learning-pipeline` を参照

**判定基準参照**: Step 3〜10 の判定基準、スコアリングルール、提示形式、承認フローは、全て `agentdev-learning-pipeline` の該当 Phase を参照。

### Step 11: 実行前同期（git pull）

- `git pull --ff-only` を実行
- **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（自動解消しない）

### Step 12: 採用済み成果物生成（staging領域のみ）

- 出力先: `.agentdev/learning/promoted/{disposal-category}-{name}.md`
- **`.opencode/` 直接書込禁止**/ **`case-run` への直接受け渡し禁止**（`backlog-review` 経由で RU 化）
- フォーマット: `agentdev-learning-pipeline` を参照

### Step 13: deferred 移動（原子的操作）

`agentdev-learning-pipeline` の「deferred 移動原子的操作プロシージャ」に従い、当該プロシージャが定める inbox.md 全エントリの deferred.md 追記、書込検証、inbox.md クリアを実行する。本手順は原子的操作であり、検証失敗時は inbox.md を変更せずエラー内容を報告する（データ喪失防止）。

### Step 14: 昇華時 prune（deferred.md からの除去）

- **prune 対象**: staged（採用済み成果物生成済み）/ rejected/ duplicate のエントリのみ
- **prune 非対象**: deferred/ 未処理のエントリは残す（REQ）
- **証拠保存**: staged エントリ除去時に採用済み成果物の「元learning item/ 根拠」セクションに保存
- **自動実行**（REQ）: Step 10 のユーザー承認（判定確定）と同時に prune も承認済みとみなす。staged（根拠は採用済み成果物に保存済み）/ rejected / duplicate（判定理由は記録済み）のエントリは追加確認なしで削除する。
- 詳細は `agentdev-learning-pipeline` を参照

### Step 15: .agentdev 変更の commit と push

- `git diff --name-only` で `.agentdev/` 配下の変更を確認
- **変更なし時**: commit/push せず完了報告で「変更なし」と報告
- **変更あり時**:
 1. `git add` は `.agentdev/learning/` 配下のみを対象とする。
 並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い明示パスでステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。
 `.agentdev/` 全体の一括スコープは禁止し、スイープ操作（`git add -A`/ `git add .` 等）も禁止
 2. commit message: `chore(agentdev): promote learning findings`
 3. `git push` 実行
 4. **push 失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（完了扱いにしない）

### Step 16: 完了報告

template: `.opencode/commands/agentdev/templates/learning-promote/standard.md`。8軸評価サマリ、判定結果（promote/defer/reject/duplicate 件数）、後続ルート（`/agentdev/backlog-review`）、git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）を含める

## ガードレール

- G01: `.opencode/` 直接反映禁止: 採用済み成果物は `.agentdev/learning/promoted/` のみに生成
- G02: `evaluation-report.md` は本コマンドが生成、管理: 外部コマンドの事前生成に依存しない
- G03: `case-run` への直接受け渡し禁止: `/agentdev/backlog-review` 経由のみ
- G04: 主入力は `inbox.md`: raw learning item の再分類は禁止
- G05: 既存対策を優先: 「新規X化」より「既存Xへ反映」を優先
- G06: ユーザー承認必須: 判定、prune ともに承認なしに実行しない
- G07: 管理用ファイル（`elevation-ledger.md` 等）は生成しない
- G08: `learning-refine` への依存禁止: 本コマンドは旧機能を内包し事前実行を前提としない
- G09: 破壊的変更（inbox.md 全体強制クリア、大量エントリ一括削除等）は Step 10 承認とは別に明示承認を維持する（REQ）
- G10: 無条件の自動REQ化禁止（REQ）: 学びを直接 REQ 化しない。恒久契約（REQ/ADR/SPEC）への昇華可能性を Step 7 で評価し、昇華可能なもののみ `promoted/` へ出力する。昇華不能な知見は living pool（`deferred.md`）で維持する
- G11: adversarial-review は任意助言手段（経路D、REQ）: ユーザー明示要求時のみ Step 8-R1（発動条件判定）→ Step 8-R2（review 呼出）を経て発動する。明示要求時以外は Step 9 へ従来フローを維持する。review 反映時は Step 6 へ戻し関連 Step を再実行する（REQ-015-007）。共通契約（任意性、副作用禁止、再 review 条件、停止条件、呼出失敗時取扱い）は `agentdev-adversarial-review` SPEC（REQ-014）が正規所有する

## ユーザー確認ポイント、エラー処理

ユーザー確認ポイント、エラー処理表、各成果物のライフサイクル詳細は `agentdev-learning-pipeline` を参照。主要項目のみ本節に抜粋する:

- **Step 9-10**: 廃棄判定結果、8軸評価スコアの確認、修正、承認（判断の確定、REQ）
- **Step 14**: prune は Step 10 承認と同時に承認済みとみなし自動実行（REQ）。staged/rejected/duplicate の追加確認は不要
- **inbox.md 不在**: エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」
- **git pull/push 失敗**: 構造化エラー表示して停止（push 失敗時は完了扱いにしない）
- **learning-promote の責務**: normalize → classify → 8-axis eval → evaluation-report → disposal judgment → HITL → 採用済み成果物生成 → archive move → prune。採用済み成果物は `/agentdev/backlog-review` 経由で RU 化後に `/agentdev/req-define` に合流する


