---
draft_type: req_draft
topic_slug: remove-split3-daily-ci
status: draft
created_at: 2026-11-16T17:36:09+09:00
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  分割③ CI 日次定期実行 workflow（.github/workflows/integrity-suite-split3-windows.yml。毎日 03:00 UTC cron・
  workflow_dispatch・push/pr 起動を含む）と、それ専用の fail クラス baseline
  （.github/integrity-split3-fail-baseline.json。2026-11-16 の CI 初回実測で環境差 fail クラス 9 件登録済み）を
  Pull Request（squash merge）で main から削除し、遠隔へ反映する。RU-0283（backlog-auto 一式
  20261115T191842JST・Epic #4071）の受け入れ義務のうち定期実行部分（Issue #4076・PR #4111・commit 40029e94b
  で実装）が 2026-11-16 の利用者判断により撤回された旨を、新規 Decision として正規文書に記録する。
  RU-0283・Issue #4076・PR #4111 の履歴記録と一式 set-state は書き換えない。Issue #4076 は CLOSED 維持とし、
  本件は新規 Case として扱う。分割③試験本体と 3 cwd 分割正規形・ローカル実行手順（依存整備前置を含む）は
  削除しない。削除後、cron を含む workflow が 0 件であることを機械検索で証明し、正規文書に定期実行の要求が
  残らないことと正規検査（check_integrity 等）の合格を確認する。当該 workflow が削除時点でこのリポジトリ唯一の
  workflow であるため GitHub Actions による CI 実行は消滅する（branch protection の required check は
  削除時点で設定されておらず、PR 運用への阻害はない）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      削除対象と削除方式。.github/workflows/integrity-suite-split3-windows.yml（分割③ Windows CI 日次定期実行
      workflow。schedule cron "0 3 * * *"・workflow_dispatch・push/pr 起動を含む 83 行）と
      .github/integrity-split3-fail-baseline.json（分割③専用 fail クラス baseline。2026-11-16 の CI 初回実測で
      観測された環境差 fail クラス 9 件を登録済み）の 2 ファイルを main から削除し、遠隔へ反映する。
      削除は Pull Request で行い、main への直接コミットはしない。統合形式はリポジトリの慣行（squash）に従う。
      削除対象は上記 2 ファイルのみとし、分割③試験本体（./.opencode/plugins/ と ./scripts/ の bun test 対象）と、
      その 3 cwd 分割正規形・ローカル実行手順（依存整備前置を含む）は削除しない。
  - id: AG-002
    content: |
      撤回の判断記録。RU-0283（backlog-auto 一式 20261115T191842JST・Epic #4071・義務スナップショット）の
      受け入れ義務のうち「Windows CI runner での bun test 分割③定期実行と fail クラス baseline の機械突合の整備」
      （Issue #4076・PR #4111・commit 40029e94b で実装）が 2026-11-16 の利用者判断により撤回された旨を、
      新規 Decision として正規文書に残す。判断に記録する要素: 判断主体（利用者 2026-11-16「不要である。削除は
      必須である。ADFワークフローに従って処理すること」）、撤回対象（RU-0283 受け入れ義務の定期実行部分とその
      実装）、経緯（当該定期実行の起源は一式の整理サイクルで昇格された intake 記録であり、要否の審査は工程の
      どこでも行われていなかったこと）、失われる監視能力（CI 環境差 fail クラス 9 件の追跡。把握は従来どおり
      ローカル実行による）、分割③試験本体と正規実行形態の維持。RU-0283・Issue #4076・PR #4111 の履歴記録と
      一式 set-state は書き換えない。Issue #4076 は CLOSED 維持とし、本件は新規 Case として扱う。
  - id: AG-003
    content: |
      定期実行不在の証明と正規検査合格。削除・マージ後、(a) grep -rn "cron" .github/ が 0 件であること
      （.github/ 配下に cron を含むファイルがないこと。.github/ が存在しない場合は 0 件として記録）、
      (b) 追跡対象ファイル全体で cron を含むファイルが 0 件であること（git grep による強証明）を機械検索で
      証明する。正規文書（docs/requirements・docs/designs・docs/decisions・docs/guides・AGENTS.md・README.md・
      traceability/）に分割③ CI 定期実行・baseline 突合を要求する記述が残存しないことを確認する
      （docs/reports/・docs/knowledge/ の非規範記述と .agentdev/ 履歴記録は対象外。docs-check full audit 等の
      無関係な「定期実行」語の使用は監査運用語彙として検出対象外）。リポジトリの正規検査（check_integrity 等）が
      合格することを確認する。

artifact_actions:
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:remove-split3-daily-ci
    source_items: [AG-002]
    content: |
      # Decision: 分割③ CI 日次定期実行（cron schedule）の撤去

      ## 決定

      1. Windows CI runner での integrity suite 分割③（bun test ./.opencode/plugins/ ./scripts/）日次定期実行
      workflow（.github/workflows/integrity-suite-split3-windows.yml）と、それ専用の fail クラス baseline
      （.github/integrity-split3-fail-baseline.json）を main から削除する。削除により、このリポジトリの
      GitHub Actions による CI 実行は消滅する（定期・push・pull_request 起動のすべて。削除時点で他の workflow は 0 件）。
      2. RU-0283（backlog-auto 一式 20261115T191842JST・Epic #4071・義務スナップショット）の受け入れ義務のうち
      「Windows CI runner での bun test 分割③定期実行と fail クラス baseline の機械突合の整備」（Issue #4076・
      PR #4111・commit 40029e94b で実装）は、2026-11-16 の利用者判断により撤回する。RU-0283・Issue #4076・
      PR #4111 の履歴記録は書き換えない。
      3. 分割③試験本体とその正規実行形態は維持する。QG-4 の分割③受理対象（full suite の受理対象から除外しない
      規定）と 3 cwd 分割正規形・bun test 実行形態契約は変更せず、その正（agentdev-quality-gates・
      checker-execution-contracts の両 Design）も変更しない。本 Decision が撤去するのは CI 定期実行の実行基盤のみである。
      4. 本 Decision は CI 基盤（GitHub Actions）自体の利用可否を変更しない。将来の CI・定期実行の導入は、
      その時点の新たな利用者判断と判断記録を要する。

      ## 背景

      - 一式 20261115T191842JST（v5.2.1）の義務 RU-0283 の受け入れ義務として、Windows CI runner での分割③
      定期実行と fail クラス baseline 機械突合が Issue #4076・PR #4111（commit 40029e94b）で実装・merge された
      （2026-11-15）。
      - 当該定期実行の起源は一式の整理サイクルで昇格された intake 記録（「Windows CI runner 定期実行」）であり、
      要否の審査は工程のどこでも行われていなかった（RU 化・要件定義・承認中継の各段階で個別審査なし）。
      - 2026-11-16、利用者が当該日次定期実行を「明らかに不要・削除は必須」と判断した（判断主体: 利用者。
      監督側は不要性を覆す材料を持たない）。
      - 2026-11-16 の CI 初回実測では、CI 環境の構成差（fresh checkout・vendor 未生成・junction 未伝播）に由来し
      worktree 通常実行では発生しない環境差 fail クラス 9 件（共有 judgment モジュール系・reflect.ts 決定性系 4 件・
      orphan junction・textlint-guard vendor 系 3 件）が観測され baseline に登録されていた（観測記録: baseline JSON
      本文と PR #4111 本文の評価記録）。
      - 削除時点の実測: 追跡対象ファイル全体で cron の出現は当該 workflow のみ（git grep 実測 2 行）。削除対象
      2 ファイルへの参照は docs/・scripts/・src/・traceability/ いずれも 0 件（git grep 実測）。正規文書
      （REQ・Decision・Design）に定期実行・baseline 突合を要求する記述は存在しない。
      - 履歴記録上の注意: 一式 set-state の対応表には当該実行単位（#4076）を RU-0284 に紐づける表記があるが、
      義務スナップショット（RU-0283 受け入れ義務）・Issue #4076・PR #4111・workflow ヘッダの一次記録はいずれも
      RU-0283 由来を示しており、撤回対象の実体はこれら一次記録で特定する。対応表を含む履歴記録は本 Decision
      では書き換えない。

      ## 代替案と選択根拠

      1. schedule トリガのみ削除し push/pr トリガは残す — 却下。fail クラス baseline 突合は定期実行と一体の
      機構であり、push/pr 起動の CI 運用は利用者判断に含まれない（他 workflow 0 件）。部分的残存は撤去対象の
      管理を二重化する。
      2. baseline 突合をローカル実行手順へ移設する — 却下。分割③のローカル実行規律（3 cwd 分割正規形・依存整備
      前置）は既に品質ゲートが正規所有しており、CI 専用の baseline 突合の移設は利用者判断の範囲外である。
      3. 2 ファイルの削除と撤回の判断記録の新規作成（採用）— 参照実測 0 件により最小差分で完了し、履歴記録は
      一切書き換えない。

      ## 判断根拠

      - 利用者判断（2026-11-16「不要である。削除は必須である。ADFワークフローに従って処理すること」）
      - 当該定期実行は要否審査を経ずに実装された実績（intake 記録由来）であり、撤回が既存の正規契約
      （REQ・Decision・Design）と衝突しないことの実測（正規文書に要求 0 件・削除対象への参照 0 件）
      - 分割③試験本体とその正規実行形態が影響を受けないこと（workflow は CI 定期実行の実行基盤のみを提供する
      という当初の責務分離）
      - req-define のアーキテクチャ助言（4 ラベル構造）において、既存 REQ/Decision/Design との整合性損害なし・
      Decision 形式の妥当性・見逃し伝播リスクなしの助言を得た（ブロッカー・ユーザー確認事項なし）

      ## 影響

      - このリポジトリの GitHub Actions による CI 実行が消滅する（branch protection の required check は
      削除時点で設定されていないため、PR 運用への阻害はない）。
      - Windows runner での環境差監視（分割③ fail クラス 9 件の CI 側追跡）は失われる。fail クラスの把握は
      従来どおりローカル実行（品質ゲート正規形）による。
      - v5.2.1 タグ・Release、一式の他義務の成果物は変更しない。
      - 削除後、追跡対象全体で cron を含むファイルは 0 件となる（git grep で証明）。

      ## 関連する決定

      - なし（既存 Decision に CI 定期実行を要求するものは存在しない。分割③の正規実行形態は
      agentdev-quality-gates・checker-execution-contracts の両 Design が所有し、本 Decision はこれを変更しない）

conflict_resolutions:
  - id: CR-001
    conflict: |
      分割③ CI 日次定期実行の要否（維持 vs 削除）。実装済み（PR #4111・2026-11-15 merge）であり、
      2026-11-16 に利用者が「明らかに不要・削除は必須」と判断した。
    resolution: |
      利用者判断（2026-11-16「不要である。削除は必須である。ADFワークフローに従って処理すること」）により
      削除で確定。監督側は不要性を覆す材料を持たない。撤回の経緯は新規 Decision に正規記録する
      （履歴記録は書き換えない）。
  - id: CR-002
    conflict: |
      履歴記録上の RU↔Issue 対応の揺れ。一式 set-state の対応表は #4076 を RU-0284 に紐づけるが、
      義務スナップショット（RU-0283 受け入れ義務）・Issue #4076・PR #4111・workflow ヘッダの一次記録は
      RU-0283 由来を示す。
    resolution: |
      撤回対象の特定には対応表を用いず一次記録（RU-0283 受け入れ義務の定期実行部分 + Issue #4076・PR #4111・
      commit 40029e94b）を採用する。対応表を含む履歴記録は書き換えない。判断記録（Decision）の背景に
      この扱いを明記する。

operation_units:
  - id: OU-001
    description: |
      分割③ CI 日次定期実行の撤去（単一 Issue）。(.github/workflows/integrity-suite-split3-windows.yml と
      .github/integrity-split3-fail-baseline.json の 2 ファイル削除（AG-001・PR 経由・squash）、
      撤回の判断記録としての新規 Decision 作成（AG-002・ACT-DEC-001）、cron 0 件の証明と正規文書残存確認・
      正規検査合格（AG-003）を同一 PR で完結させる。
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      削除 PR の作成・squash merge を実施する（main への直接コミットは行わない）。マージ後に main を最新化し、
      (1) git ls-files で .github/workflows/integrity-suite-split3-windows.yml と
      .github/integrity-split3-fail-baseline.json が追跡対象から存在しないこと、(2) git fetch 後に origin/main
      側（遠隔）にも当該 2 ファイルが存在しないこと、(3) 作業環境のファイルシステム上にも当該 2 ファイルが
      存在しないことを確認する。結果として空となるディレクトリ（.github/workflows・.github）が作業環境に
      残存する場合は併せて除去する（空ディレクトリは check_integrity の未追跡検出〔IR-073〕の検出対象外であり
      必須ではないが、残存しない状態を整える。merge 時に git が空ディレクトリを除去する場合は不要）。
    pass_criteria: |
      2 ファイルが main（遠隔 origin/main を含む）から存在しないこと。削除が PR（squash merge）で実行されて
      いること（main への直接コミットなし）。空ディレクトリの残存有無の確認結果が記録されていること。
    on_failure: |
      fix-and-reverify。削除漏れ・遠隔未反映があれば削除を完了させて再検証する。PR 以外の経路で変更が
      行われた場合は対象を戻し、PR 経由でやり直す（削除方式の違反は軽微な差異では許容しないため）。
  - id: TS-002
    target_item: AG-003
    verification: |
      マージ後の main で (1) grep -rn "cron" .github/ を実行する（.github/ が存在しない場合は 0 件・
      ディレクトリ不在として記録する）、(2) git grep -n "cron" を追跡対象全体で実行する。
      検索系検証の網羅範囲（.github/ 全体・追跡対象全体）は修正対象列挙（削除 2 ファイル）と一致している
      （.github/ の内容が削除 2 ファイルのみであることを事前実測済みであり、参照行の検出除外は不要）。
    pass_criteria: |
      両検索のヒットが 0 件であること。検索コマンドと出力を証跡として残すこと。
    on_failure: |
      fix-and-reverify。残存する cron 記述が検出された場合は対象を特定して除去し、再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      マージ後の main で (1) 正規文書群（docs/requirements・docs/designs・docs/decisions・docs/guides・
      AGENTS.md・README.md・traceability/）に対し、識別子検索（integrity-suite-split3 / split3-windows /
      integrity-split3-fail-baseline / Windows CI runner / Windows runner / 環境差監視）と cron・定期実行要求の
      意味確認を実施する。docs-check full audit 等の無関係な「定期実行」語の使用
      （docs/guides/diagnostics-and-maintenance.md・docs/designs/integrity/integrity-rule-catalog.md・
      IR-054-draft-spec-abandonment-detection.md の実施タイミング記述）は監査運用語彙として検出対象外とする。
      (2) リポジトリの正規検査（check_integrity、および本 Case の変更範囲に関連する gate）を実行する。
    pass_criteria: |
      分割③ CI 定期実行・baseline 突合を要求する正規文書記述の残存が 0 件であること（撤回を記録する本 Decision
      の記述は要求ではなく判断記録として区別する）。正規検査が新規 NG なしで合格すること。
    on_failure: |
      fix-and-reverify。要求記述の残存・検査不合格があれば、削除の趣旨に沿って正規経路（PR）で修正し再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      新規 Decision ファイル（docs/decisions/DEC-NNN.md）が main に存在することを確認し、内容を照合する:
      (1) 判断主体=利用者 2026-11-16、(2) 撤回対象=RU-0283 受け入れ義務の定期実行部分（Issue #4076・PR #4111・
      commit 40029e94b）、(3) RU-0283・Issue #4076・PR #4111 の履歴記録を書き換えない旨、(4) 分割③試験本体と
      正規実行形態（QG-4 受理対象・3 cwd 分割正規形）の維持、(5) GitHub Actions CI の消滅と環境差監視
      （fail クラス 9 件追跡）の放棄という帰結。Decision インデックス（docs/decisions/README.md の AUTOGEN 表）
      への反映も確認する。
    pass_criteria: |
      Decision が上記 (1)〜(5) を過不足なく記録し、Decision ライフサイクル（decision-lifecycle Design）に従って
      受理されていること。インデックス AUTOGEN 表が実ファイルと整合していること。
    on_failure: |
      fix-and-reverify。記載漏れ・誤りは Decision を更新（正規経路）して再検証する。

realization_actions:
  - id: RA-001
    concern: 分割③ CI 日次定期実行の実行基盤（workflow と fail クラス baseline）の削除
    responsibility: |
      .github/workflows/integrity-suite-split3-windows.yml と .github/integrity-split3-fail-baseline.json を
      リポジトリから削除する。当該実現面は RU-0283 受け入れ義務として PR #4111（commit 40029e94b）で導入された
      CI 実行基盤であり、正規文書上の恒久契約（REQ・Design）を持たない実装物である。正規実行形態
      （3 cwd 分割正規形・bun test 実行形態契約）の正は agentdev-quality-gates・checker-execution-contracts の
      両 Design が引き続き所有し、削除対象から除外する。
    ownership_hints:
      - "削除対象: .github/workflows/integrity-suite-split3-windows.yml（83 行。schedule cron 0 3 * * *・workflow_dispatch・push・pull_request 起動）"
      - "削除対象: .github/integrity-split3-fail-baseline.json（16 行。環境差 fail クラス 9 件登録済み）"
      - "導入経緯: RU-0283 受け入れ義務（backlog 一式 20261115T191842JST・Epic #4071）・Issue #4076・PR #4111・commit 40029e94b"
      - "参照実測: 削除対象 2 ファイルへの参照は docs/・scripts/・src/・traceability/ で 0 件（git grep）。branch protection なし（required check 阻害なし・削除時点実測）"
      - "維持対象: 分割③試験本体（bun test ./.opencode/plugins/ ./scripts/）と 3 cwd 分割正規形・ローカル実行手順"
    intent: |
      定期実行（cron schedule）をこのリポジトリに存在させない。分割③試験本体とローカル実行規律は維持する。
      CI 環境差監視（fail クラス baseline 突合）は本変更で放棄する（fail クラスの把握はローカル実行による）。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-003]

review_dispositions: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

分割③ CI 日次定期実行（毎日 03:00 UTC cron）の撤去。削除対象は workflow と fail クラス baseline の 2 ファイル
のみで、分割③試験本体・3 cwd 分割正規形・ローカル実行手順は維持する。RU-0283 受け入れ義務の定期実行部分の
撤回（判断主体: 利用者 2026-11-16）を新規 Decision に正規記録し、履歴記録（RU-0283・Issue #4076・PR #4111・
set-state）は書き換えない。削除は PR（squash）で行い、完了は cron 0 件の機械証明・正規文書の要求残存なし・
正規検査合格で判定する。req-define の調査（git grep 実測）とアーキテクチャ助言・対論型レビューにより、
削除対象への外部参照 0 件・正規文書への要求残存 0 件・branch protection 阻害なしを確認済みである。
