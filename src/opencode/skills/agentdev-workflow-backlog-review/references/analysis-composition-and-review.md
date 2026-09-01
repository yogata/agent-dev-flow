# STEP 詳細: 実行前同期・成果物検出 / 分析・暫定分類 / 統合分割判定 / review / HITL（backlog-review）

> 本 reference は `agentdev-workflow-backlog-review` SKILL.md の Control Plane STEP-1〜STEP-5 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-1: 実行前同期・成果物検出
- STEP-2: 分析・暫定分類付与
- STEP-3: 統合・分割判定・depends_on 依存解決
- STEP-4: review（adversarial-review）
- STEP-5: HITL（ユーザー承認、RU 生成承認を兼ねる）

## STEP-1: 実行前同期・成果物検出

### Purpose

実行前同期を行い、対象の採用済み成果物を検出する。

### Input Resolution

- backlog-review command から渡される引数（ファイルパス指定）の有無（durable state 最優先は promoted/ 実ファイル）
- ドメイン状態永続化プロシージャは `agentdev-git-worktree` に従う

### Preconditions

- backlog-review command が起動されている

### Procedure

1. `git pull --ff-only` を実行する。失敗時は構造化エラーメッセージを表示して停止する（`agentdev-git-worktree` と同一のエラー形式。自動解消しない）
2. 引数の有無に応じて対象を切り替える。
引数なしの場合は三ディレクトリ（`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md`）から採用済み成果物を検出する。
引数ありの場合は指定されたファイルパスのみを対象とし、存在しないパスはエラー報告してスキップする
3. 検出結果を判定する。
0件の場合は正常終了とする（エラー扱いとしない。完了報告で「対象なし」と報告）。
1件以上の場合はファイルパス昇順で STEP-2 へ進む

### Result

- 対象成果物一覧（ファイルパス昇順）

### Evidence

- 検出結果（対象ディレクトリ、ファイルパス一覧）

### Completion Verification

- 引数指定時は指定パスの存在確認結果が記録されていること
- 対象 0 件時に正常終了扱いであること

### Resume-Idempotency

- promoted/ 実ファイルから検出を再構築できる。読み取りのみのため再実行に副作用がない

## STEP-2: 分析・暫定分類付与

### Purpose

各成果物を読み込み、分析し、RU 候補ごとに暫定分類を付与する。

### Input Resolution

- STEP-1 の対象成果物一覧（durable state: promoted/ 実ファイル）
- 分析基準、前工程からの引き継ぎメタデータ付与ルールは `agentdev-backlog-integration` の公開操作契約に従う
- learning 由来の採用済み成果物の反映先分類結果の消費と昇華先ルーティング判定は `agentdev-backlog-integration` の昇華先ルーティング契約に従う
- document-model Design（extension 経由）の文書7分類モデルを参照する

### Preconditions

- 対象成果物が 1件以上検出済みであること

### Procedure

1. 各採用済み成果物を読み込み、分析する
2. 各 RU 候補について、document-model Design（extension 経由）の文書7分類モデル（REQ、挙動Design、カタログDesign、guide、learning維持、作業記録、対象外）を参照して暫定分類を付与する
3. learning 由来の採用済み成果物については、学習パイプラインが前工程で付与した反映先分類結果を読み込み、`agentdev-backlog-integration` の昇華先ルーティング契約に従い昇華先ルート（docs/knowledge/ 知識文書保存を含む昇華、Issue 修正、削除、保留）の処置候補を判定する。docs/knowledge/ 知識文書保存の処置候補については、既存 docs/knowledge/ 配下ファイルとの重複・陳腐化を確認し、新規、更新、置換、削除の操作種別を判定する。intake / inspect 由来は本判定の対象としない。反映先分類が記録されていない場合は現行の RU 化経路に従う
4. 分析結果と併せて RU frontmatter に `tentative_classification` として記録する（記録は STEP-7 の RU 生成時。本 STEP は付与内容を確定する）

### Result

- 分析結果、暫定分類付与結果、learning 由来の昇華先ルーティング処置候補（docs/knowledge/ 知識文書保存候補は操作種別判定結果を含む）

### Evidence

- 各成果物の分析結果、暫定分類（文書7分類モデルのいずれか）、learning 由来の反映先分類結果と対応付けた処置候補、docs/knowledge/ 知識文書保存候補の操作種別（保存候補がある場合）

### Completion Verification

- 全 RU 候補に暫定分類が付与されていること
- learning 由来の全成果物について昇華先ルートの処置候補が判定されていること（反映先分類未記録時は RU 化経路へのフォールバックを記録）
- docs/knowledge/ 知識文書保存の処置候補について操作種別（新規、更新、置換、削除）が判定されていること

### Resume-Idempotency

- promoted/ 実ファイルから分析・暫定分類を再構築できる。不可逆処理を含まないため再実行に副作用がない

## STEP-3: 統合・分割判定・depends_on 依存解決

### Purpose

採用済み成果物の統合、分割を判定し、depends_on 依存を解決して RU 構成案を確定する。

### Input Resolution

- STEP-2 の分析結果、暫定分類（中断時は promoted/ 実ファイルから STEP-2 を再構築して導出する）
- 統合、分割判定基準、depends_on 依存解決ルールは `agentdev-backlog-integration` の公開操作契約に従う

### Preconditions

- STEP-2 完了（分析・暫定分類付与済み）

### Procedure

1. 統合、分割判定を行う（N:1 統合 / 1:N 分割 / 1:1）
2. depends_on 依存解決を行う（未解決、循環、並べ替え可能性の検証）
3. RU 構成案（統合・分割判定結果、depends_on 解決結果、暫定分類付与結果）を確定する
4. learning 由来のうち昇華先ルーティングで RU 以外の処置と判定された成果物を RU 構成案から除外し、ルーティング処置案として承認提示対象へ含める（昇華、Issue 修正、削除、保留の処置内容は `agentdev-backlog-integration` の昇華先ルーティング契約に従う）

### Result

- RU 構成案、ルーティング処置案（learning 由来）

### Evidence

- RU 構成案（統合・分割の判断根拠、depends_on 検証結果）、ルーティング処置案（learning 由来の処置別内訳）

### Completion Verification

- 全成果物が RU 構成案またはルーティング処置案のいずれかに割り当てられていること
- depends_on に unresolved、循環が残っていないこと

### Resume-Idempotency

- promoted/ 実ファイルから RU 構成案を再構築できる。不可逆処理を含まないため再実行に副作用がない

## STEP-4: review（adversarial-review）

### Purpose

RU 構成案の意味的決定を adversarial-review で検証し、accepted finding を RU 構成案へ反映する。
発動条件判定と review 呼出を分離して実施する。

### Input Resolution

- STEP-3 で確定した RU 構成案（runtime artifact。中断時は promoted/ 実ファイルから再構築する）
- 候補判断基準、内部手続きは `agentdev-backlog-integration` の公開操作契約に従う
- 共通 caller integration 契約の正規所有者は adversarial-review Design である

### Preconditions

- STEP-3 完了（RU 構成案確定済み）
- 挿入境界、発動条件、順序、矛盾取扱いの正規所有者は backlog-review command Design「adversarial-review 挿入境界（backlog-review）」節である

### Procedure

1. **発動条件判定**: RU 構成案（統合・分割判定、depends_on 依存解決）に意味的決定が存在する場合に発動する（default-on）。
ユーザー明示指定は通常発動の必須条件ではない。
skip 条件（RU 構成要素が1件のみで統合・分割判定不要、depends_on 解決不要、矛盾検出対象が存在しない）該当時は省略して従来フロー（STEP-5 以降）を継続する。
skip 判断のためだけの新規 HITL、承認点は追加しない。
ユーザー明示指定時は skip 条件の該当にかかわらず必ず発動する
2. **review 呼出**: 発動と判定された場合のみ `agentdev-adversarial-review` を起動する。
審議対象は RU 構成案（統合・分割判定結果、depends_on 解決結果、暫定分類付与結果）。
呼出契約、返却契約、副作用境界は `agentdev-adversarial-review` と delegation-contracts Design（`semantic_review`、書き込み禁止型）を正とする
3. **accepted finding 反映**: accepted finding の RU 構成案への反映は本 workflow（呼出元）の責務である。
反映後に RU 構成案の意味内容が変更された場合、必要な既存検証（depends_on 再解決、矛盾検出再実行）を行い、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる。
同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない
4. **矛盾の扱い**: review 審議で採用済み成果物間の矛盾が指摘された場合、当該矛盾は STEP-6（既存矛盾検出）へ引き渡す。adversarial-review 自身は矛盾を自動解決せず、矛盾の判定、partial success 扱い、ユーザー追加判断への委ねは STEP-6 の既存矛盾検出ロジックが正である
5. **unresolved 時の取扱い**: unresolved な本質的争点またはユーザー判断事項が残る場合、RU 生成（STEP-7）、採用済み成果物削除、Git 永続化（STEP-8）等の後続不可逆処理へ進まない
6. **呼出失敗時**: silent skip を禁止し、従来フロー（STEP-5 以降）を維持する

### Result

- review 結果反映済み RU 構成案（skip 時、呼出失敗時は STEP-3 の構成案をそのまま継承）

### Evidence

- 発動条件判定結果（発動/ skip と根拠）、review 呼出記録、accepted finding と反映結果（発動時）

### Completion Verification

- 発動条件判定が記録されていること（発動・skip いずれも）
- 発動時は accepted finding の反映結果が RU 構成案へ反映済みであること

### Resume-Idempotency

- review は書き込み禁止型（`semantic_review`）のため再呼出に副作用がない。promoted/ 実ファイルから RU 構成案を再構築し、発動条件判定からやり直す

## STEP-5: HITL（ユーザー承認、RU 生成承認を兼ねる）

### Purpose

RU 構成案をユーザーに提示し、明示的な承認を得る。
ユーザー承認は RU 作成承認を兼ねる。

### Input Resolution

- STEP-3 / STEP-4 の RU 構成案（中断時は promoted/ 実ファイルから再構築する）
- 承認フローは `agentdev-backlog-integration` の公開操作契約に従う

### Preconditions

- RU 構成案確定、STEP-4 skip または review 完了であること

### Procedure

1. RU 構成案（統合・分割判定、depends_on 解決結果、暫定分類）と learning 由来のルーティング処置案をユーザーに提示する
2. ユーザーの修正指示を受け付け、必要に応じて STEP-3 をやり直す
3. 明示的な承認を得て承認を確定する
4. 後続の STEP-6 で矛盾が検出されない場合、本 STEP の統合、分割判定承認を RU 生成承認（STEP-7）としても扱う。単一承認で処理し、追加の HITL は不要
5. 破壊的変更（矛盾解消、要件仕様スコープ変更、大量成果物削除等）は明示承認を維持する
 6. ルーティング処置（docs/knowledge/ 知識文書保存、RU 以外への昇華、Issue 修正、削除、保留を含む）もユーザーの明示承認を経る。docs/knowledge/ 知識文書保存は操作種別（新規、更新、置換、削除）ごとの変更内容（整形後の知識文書、対象ファイル、変更内容）を利用者へ提示し、承認を得る。未承認の処置は実行せず、当該成果物は promoted に残置する。承認なしの docs/knowledge/ 書き込みは行わない（REQ-{NNNN}-{NNN}）

### Result

- 承認確定（RU 生成承認を兼ねる）

### Evidence

- RU 構成案の提示とユーザー承認の対話記録

### Completion Verification

- RU 構成案がユーザー承認済みであること

### Resume-Idempotency

- 承認状態は単独では durable state に記録されない。RU 実ファイル（STEP-7 の成果物）を承認証跡として扱い、証跡がない場合は未承認と解釈して本 STEP をやり直す。承認前の再実行に副作用はない
