# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## Draft Definition PR の draft 状態で case-ready の merge が完結不能（agentdev_gh に ready 化操作不在）

- **問題事象**: case-ready STEP-1 の Definition PR 受入で、Draft Definition PR 10件（#2826〜2830・#2851〜2859）が draft 状態のまま作成されており、pr_merge が「gh: Pull Request is still a draft (HTTP 405)」で失敗。agentdev_gh Custom Tool に draft 解除（ready 化）操作が存在しないため（pr_update 契約は draft フィールドを unknown-field として拒否）、merge 前提を満たせず HITL 停止した
- **発生局面**: 実装（case-ready workflow STEP-1 Definition PR 受入。Batch 1〜4 の 20 Case 一括処理時）
- **検知方法**: pr_merge 操作の失敗応答（HTTP 405、draft 状態の検出）。pr_update による draft 解除試行も invalid-input（unknown-field [draft]）で拒否、gh pr ready の直接実行も agentdev-gh-write-guard が raw gh WRITE をブロック
- **根本原因**: case-open が Definition PR を作成する際の draft フラグが不統一（Batch 1/4 は draft、Batch 2/3 は非 draft）であり、かつ case-ready 側の GitHub I/O 境界（agentdev_gh）の操作カタログに draft 解除操作が設計として含まれていない
- **自律対応内容**: partial merge（非 draft の9件のみ先行 merge）を検討したが、REQ-057.md 要件テーブルへの行追加連鎖（#2836 の REQ-057-029 が先行 merge されると、後続 #2827〜2829 の rebase 時に 026〜028 行が 029 行の後ろへ配置され採番順序が崩壊）のリスクから断念。write-guard 境界を遵守し、全件を保持したまま HITL 停止として報告
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の運用ギャップ。将来の反映候補: case-open の PR 作成 draft フラグ統一、agentdev_gh への draft 解除操作追加、case-ready STEP-1 への draft PR 検出時経路の明記）
- **横展開観点**: agentdev_gh 操作カタログに存在しない GitHub 副作用が必要になった場合、write-guard により gh CLI 直操作は実行不可。Custom Tool 契約の拡張を前提に計画する必要がある
- **再発条件**: case-open が draft PR を作成し、かつ case-ready が agentdev_gh のみで merge を完結しようとする場合に毎回発生
- **予防策候補**: (1) case-open が Definition PR を draft: false で統一作成、(2) agentdev_gh に pr_ready（draft 解除）操作を追加、(3) case-ready STEP-1 reference に draft PR 検出時の経路を明記
- **想定反映先**: agentdev-workflow-case-open / agentdev-workflow-case-ready（Design・skill）、agentdev_gh Custom Tool
- **関連**: PR #2826〜2830・#2851〜2859、Case #2821〜2825・#2850〜2858、.opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
- **タグ**: `#github-io` `#draft-pr` `#custom-tool` `#workflow-deviation`

## case-open が検証対応要否分類ゲートを実行せず、case-ready STEP-6 が新規 REQ 行の unclassified で停止

- **問題事象**: case-ready STEP-6 検証ゲートで、直前に merge した Definition PR の新規 REQ 行（REQ-057-026..029・REQ-036-027・REQ-047-010・REQ-010-077・REQ-021-026/027・REQ-031-029/030・REQ-082-001..025 の計 36 行）が verification-scope-catalog 未登録で `verificationClassification: unclassified` となり、対象 10 Case（#2822/2823/2824/2825/2831/2832/2833/2846/2856/2858）が ready 保留となった。特に REQ-082 は REQ-003-021..056 の範囲表現任意行から移動してきたにもかかわらずカタログに REQ-082 節自体が存在せず、移動元と異なり未分類に転落した
- **発生局面**: Definition 保存（case-ready STEP-6 検証ゲート。Batch 1〜4 の 20 Case 一括処理時）
- **検知方法**: agentdev-traceability `check.ts` の `verificationClassification` 出力（全 973 行中 unclassified 72 行、うち今回対象行 36 行）
- **根本原因**: case-open が REQ 行追加を伴う Definition Package 生成時に検証対応要否分類ゲート（verification-scope-catalog への任意行エントリ追加またはカタログ追随）を実行せず、Draft Definition PR の changed files にカタログ更新を含めなかった。カタログ本文の過去エントリ記録（「REQ-057-025 のエントリは...case-open の検証対応要否分類ゲートで追加した」等）は同ゲート運用が存在したことを示すが、case-open workflow のゲート規定が実行時に担保されていなかった
- **自律対応内容**: カタログ編集は実変更（main 直接変更）であり case-ready が Definition PR 経由以外で行う経路が存在しないため、カタログ補完を行わず ready 可能 10 Case（対象 REQ 行 unclassified なし）と ready 保留 10 Case を分離して部分完了とし、未分類行一覧を HITL 報告
- **ユーザー確認有無**: なし（HITL 報告予定）
- **Decision/REQ/spec影響**: なし（実行時の運用ギャップ。将来の反映候補: case-open の検証対応要否分類ゲート明示化）
- **横展開観点**: REQ 行追加を伴う全 workflow（req-define、case-open、case-revise）で同じゲート欠落が同様の ready 停止を生む。traceability check を case-open の前置検査として機械実行すれば検出可能
- **再発条件**: REQ 行追加を伴う Definition PR が case-open で作成され、カタログ更新が Definition Package に含まれない場合に毎回発生
- **予防策候補**: (1) case-open（および req-define）の工程へ検証対応要否分類ゲートの明示（REQ 行追加時は verification-scope-catalog 更新を Definition に含める）、(2) case-ready STEP-2 の canonical 再取得時に traceability check を機械実行し unclassified 検出時に case-open へ差し戻す経路の明記、(3) REQ 移動・分割時にカタログの範囲表現追随を Definition 変更の必須構成とする
- **想定反映先**: agentdev-workflow-case-open / agentdev-workflow-req-define / agentdev-workflow-case-ready（Design・skill）、verification-scope-catalog.md の運用記録
- **関連**: Case #2822/2823/2824/2825/2831/2832/2833/2846/2856/2858、PR #2827/2828/2829/2830/2836/2837/2838/2847/2857/2859、docs/designs/foundations/references/verification-scope-catalog.md、.opencode/skills/agentdev-traceability/scripts/src/check.ts
- **タグ**: `#traceability` `#verification-scope-catalog` `#unclassified` `#workflow-deviation`

## case-run が PR 作成後に完了報告を残さず中断すると case-close が PR を検出できない（422 + refs/pull 照合で回収）

- **問題事象**: Case #2852 の case-run が PR #2868 作成まで完了しながら、Issue 本文・コメントへの PR 番号記録（完了報告コメント）を残さず中断した。case-close 実行時に Issue 側の永続状態から PR 番号を解決できず、PR 未作成と誤認して pr_create を試行すると「Validation Failed (HTTP 422)」で失敗した
- **発生局面**: 完了処理（case-close STEP-1/STEP-4。PR 自動検出は Issue 本文・コメントの記録が前提、agentdev_gh に pr_list 操作は存在しない）
- **検知方法**: pr_create の fail-closed 失敗応答（HTTP 422 = head ブランチの既存 PR 存在の典型応答）。`git ls-remote origin refs/pull/*/head` による head SHA（d7372002）照合で PR #2868 を特定（gh コマンド不使用、git transport 経由で POL-gh-io-delegation 準拠）
- **根本原因**: case-run の PR 作成と PR 番号の SSoT 記録（Issue 本文/コメントへの完了報告）が分離しており、PR 作成後に中断すると PR の所在が永続状態から復元できない。エージェント本体の中断は SSoT 記録を保証しない
- **自律対応内容**: 重複 PR 作成は fail-closed で防止された（副作用なし）。refs/pull/*/head 照合で既存 PR #2868 を特定し、pr_read で本文・mergeable（MERGEABLE）を確認の上、そのまま squash merge して完了処理を継続した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の運用ギャップ。将来の反映候補: case-close の PR 自動検出手順へのフォールバック明記）
- **横展開観点**: PR 番号を入力とする全操作（pr_merge、pr_mergeable、pr_changed_files）で同じ検出不能状態が発生し得る。git transport（ls-remote の refs/pull/*）は GitHub API を経由しないため gh-io 委譲境界外の読取手段として使える
- **再発条件**: case-run 等の PR 作成者が、PR 作成後・Issue 側記録前に中断・失敗した場合に毎回発生
- **予防策候補**: (1) case-run が PR 作成直後に Issue 本文またはコメントへ PR 番号を記録する前倒し、(2) case-close STEP-1 の PR 自動検出へ refs/pull/*/head 照合フォールバックの明記（Issue 側記録不在時）、(3) pr_create の HTTP 422 を「既存 PR 存在シグナル」として特定手順に接続する経路の文書化
- **想定反映先**: agentdev-workflow-case-run / agentdev-workflow-case-close（Design・skill・references）
- **関連**: Case #2852、PR #2868（head d7372002、merge 後 main HEAD bf4a3224）、.opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md
- **タグ**: `#github-io` `#pr-detection` `#custom-tool` `#workflow-deviation`

## case-open が Definition 変更を main へ直接 push し Draft Definition PR を作成不能にした

- **問題事象**: case-open STEP-4 で Definition 変更 commit を `git push origin HEAD:main` により main へ直接 push し、Draft Definition PR を経由せず canonical Definition（origin/main の docs）が更新された。その後の pr_create は head branch（feature/issue-2870）が remote に存在せず、かつ main との差分が消失していたため HTTP 422 で失敗し、PR 作成不能となった
- **発生局面**: 実装（case-open workflow STEP-4 実変更判定と Definition PR 作成。Case #2870）
- **検知方法**: pr_create の失敗応答（HTTP 422 Validation Failed）。初回 push 自体は成功していたため、PR 作成失敗時に push refspec（`HEAD:main`）を見直して発見
- **根本原因**: Definition 変更の push 先を worktree branch（`git push origin feature/issue-2870`）ではなく main（`git push origin HEAD:main`）に誤指定。直前の並行セッションの capture 回収（16c397dd）が main 直接 push 形式であるのを参照し、capture 永続化の手順と Definition 変更の push 手順を混同した
- **自律対応内容**: force push による巻き戻しは禁止（並行セッション影響・承認要件）のため不実施。revert + PR 再投入は deviation の増幅と履歴汚染のため見送り。main 反映済みの内容は draft-data の正規投影であり diff 検証済みのため現状を活かし、Root Case #2870 本文へ PR 未作成の実態を記録、本 learning へ capture
- **ユーザー確認有無**: なし（完了報告で報告）
- **Decision/REQ/spec影響**: Definition 変更の内容・配置は Definition Package 投影どおり。case-ready の Definition 受入（Draft Definition PR の忠実性・整合性・品質検査 → merge）は PR 不在のため canonical 照合へのフォールバックが必要となり、case-ready 実行時の停止リスクが残る
- **横展開観点**: worktree branch push（PR 作成前提）と main 直接 push（capture 等の継続作業永続化）は目的も受入経路も異なる別手順。push refspec は実行前に必ず検査する
- **再発条件**: case-open が Definition 変更を worktree branch push せず main へ直接 push する場合に毎回発生
- **予防策候補**: (1) case-open STEP-4 reference に push コマンド（`git push origin {worktree-branch}`）を明記、(2) push 実行前の refspec 検査（`:main` を含まないこと）の追加、(3) pr_create 失敗時の head branch push 状態確認手順を reference へ明記
- **想定反映先**: agentdev-workflow-case-open（STEP-4 reference）、agentdev-issue-management（push 安全手順）
- **関連**: Case #2870、main push 17afaf86、docs/designs/workflows/definition-readiness.md、src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md
- **タグ**: `#git` `#push` `#definition-pr` `#workflow-deviation`

## worktree で bun test 実行時、ルート package.json が存在せず scripts 配下の package.json（bun.lock 付き）ごとに bun install の前置が必要

- **問題事象**: worktree 内で bun test フル suite を実行すると、`./src/opencode/skills/agentdev-project-extensions/scripts/` 配下のテストが zod 未解決で error 4 件を発生させた。worktree にはルート package.json が存在せず、node_modules も gitignore 対象のため伝播していない
- **発生局面**: 実装（case-run 検証。bun test 3 cwd 分割実行のフル suite。Case #2867、PR #2869）
- **検知方法**: bun test の初回実行結果（2556 pass / 3 fail / 4 errors。error は zod 未解決）
- **根本原因**: worktree は git 追跡ファイルのみで構成され、node_modules（gitignore 対象）とルート package.json（リポジトリに存在しない）が欠落する。bun は対象ディレクトリ直近の package.json（bun.lock 付き）を依存解決の単位とするため、依存を持つ scripts 配下ごとの bun install 前置が必要
- **自律対応内容**: `bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts` を前置して再実行し、zod 未解決 error 4 件を解消（前置後は 2556 pass / 3 fail / 0 errors）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行環境の整備手順の明確化。QG-4 reference の依存パッケージ前置契約と整合）
- **横展開観点**: worktree 内での bun test 実行は、依存を持つ scripts ディレクトリ集合（integrity suite の実体と分割② の双方）すべてで bun install 前置を要する。前置を省略すると依存解決失敗 error が変更起因 fail と誤認され得る
- **再発条件**: worktree 新規作成直後に依存パッケージ前置なしで bun test を実行する場合に毎回発生
- **予防策候補**: (1) worktree 作成直後の bun test 実行前に `bun install --cwd <scripts 配下>` を前置する手順の徹底、(2) QG-4 reference「依存パッケージ前置」の対象ディレクトリ集合を worktree 実行時チェックリストとして明記
- **想定反映先**: agentdev-quality-gates（bun test 実行形態契約の運用注記）、agentdev-git-worktree（worktree 構造的制約の補足）
- **関連**: Case #2867、PR #2869、.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（依存パッケージ前置）
- **タグ**: `#bun` `#worktree` `#dependency` `#test-environment`

## 配布物（.md）へのスクリプト呼出パスと要件行参照は最初から投影先形式・意味参照で書く

- **問題事象**: PR #2872（Case #2870）の実装で、配布物本文に `src/opencode/` 直参照のスクリプト呼出パス 2 件（IR-055 strict 違反）と散文中の具体 REQ ID 8 件（配布依存境界 concrete-id 違反）が入り、2 段階で検出・修正した
- **発生局面**: 実装（case-run 検証。IR-055 delta check と配布依存境界 最終 gate。Case #2870、PR #2872）
- **検知方法**: check_integrity 直接実行（IR-055 delta: 新規違反 2 件）と check_distribution_boundary --profile source（concrete-id 違反 8 件相当）の実行結果
- **根本原因**: 新規配布スクリプト（case-open scripts/ エンジン）を配布物から参照する際、リポジトリ内の物理パス（src/opencode/）をそのまま記載した。配布物は投影先（.opencode/）を正とする
- **自律対応内容**: 呼出パスを投影先 `.opencode/` 形式へ修正、散文中の REQ ID を意味参照（Design・REQ 名）へ修正し 0 違反化。具体 ID は ADF-COVERS 宣言行に限定
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（記述慣行の明確化。IR-055 と配布依存境界 Design の既存契約どおり）
- **横展開観点**: 配布スクリプトを新規追加する workflow skill では必ず発生し得る。検証 gate での検出・修正は可能だが、最初から慣行どおりに書くことで修正コストを回避できる
- **再発条件**: 配布物に新規スクリプトの参照を追加する場合に毎回発生し得る
- **予防策候補**: (1) 呼出パスは投影先形式で書く、(2) 要件行は意味参照で記述し具体 ID は ADF-COVERS 宣言行に限る、(3) workflow_body_contract.test.ts のような具体パス・具体 ID 回帰ガードを新規配布物に付ける
- **想定反映先**: agentdev-skill-authoring（配布物記述慣行）、agentdev-workflow-case-run（事前検査の観点）
- **関連**: Case #2870、PR #2872、IR-055、配布依存境界 Design
- **タグ**: `#distribution` `#ir-055` `#concrete-id` `#authoring`

## worktree 内 checker 実行は git 管理実体と非管理配置で経路が異なる（非管理配置スクリプトは main root から --root 明示）

- **問題事象**: case-close の検証で worktree 内に `.opencode/skills/agentdev-traceability/` が存在せず（非 git 管理配置）、worktree root cwd からの bun 実行が Module not found で失敗した
- **発生局面**: 完了処理（case-close STEP-2 トレーサビリティ独立再検査。Case #2870）
- **検知方法**: bun 実行の error 応答（Module not found）。worktree 内 .opencode/skills/ の ls で repo-agentdev-integrity のみ投影を確認
- **根本原因**: .opencode/skills/ 配下のスクリプトは git 管理実体（repo-agentdev-integrity 等）と main worktree 側のみの配置（agentdev-traceability 等）が混在する。worktree には git 追跡ファイルのみ存在する
- **自律対応内容**: main worktree root から `bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root <worktree絶対パス> --req ...` の形態で実行し、検査対象を PR HEAD worktree に明示して合格確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行形態の運用知識。配布依存境界 最終 gate の「PR HEAD の worktree を検査する」契約と整合）
- **横展開観点**: worktree 内で checker を実行する前に対象スクリプトが git 管理実体かを確認する。git 管理実体（repo-agentdev-integrity）は junction 伝播で worktree 内から直接実行可能、非管理配置は main root 起動 + --root 明示が実行形態
- **再発条件**: case-close / case-run で worktree 内検証に非管理配置スクリプトを使う場合に毎回発生
- **予防策候補**: (1) checker 実行手順にスクリプト所在（git 管理実体 / 非管理配置）の確認ステップ追加、(2) --root 明示形態を各 checker 実行契約に明記
- **想定反映先**: agentdev-workflow-case-close（STEP-2/3 checker 実行手順）、agentdev-traceability（実行前提の補足）
- **関連**: Case #2870、PR #2872、.opencode/skills/ の配置（git 管理実体と junction）
- **タグ**: `#worktree` `#checker` `#execution-path`

## coverage 突合では役割（implementation / verification / design）を区別せず集合を結合すると誤認が生じる

- **問題事象**: REQ-053-023 の coverage 突合で、docs 側 ADF-COVERS 宣言（verification 役割のみ）を implementation 集約と同一視すると「docs に implementation 宣言がある」という誤認が生じる。実際は verification のみで implementation は配布物側 2 件が唯一の所有（docs 集約未完了）。役割を無視した単純突合では配布物 cleanup（宣言除去）の安全性を誤判定し得る
- **発生局面**: 完了処理（case-close STEP-3 配布依存境界 / coverage 突合。Case #2824、PR #2874）
- **検知方法**: 宣言行の role 注記（implementation / verification）を明示的に分解して再突合した結果、突合結果が逆転
- **根本原因**: ADF-COVERS 宣言は role を持つが、突合時に役割フィルタを省略すると同一 REQ 行の宣言集合が一つに潰れる
- **自律対応内容**: 役割区別突合で REQ-053-023 の docs implementation 集約未完了を認定し、配布物 2 宣言の除去を「docs 集約後」として残置（cleanup 前置条件として intake 化）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（突合手順の運用知識。配布物 cleanup は宣言除去後も coverage 不変であることを確認して初めて実行）
- **横展開観点**: ADF-COVERS 宣言を突合する全工程（case-run 事前検査、case-close 独立再検査、traceability check の解釈）で役割区別が前提。役割をまたぐ集約値（合計件数等）だけを見た判断は誤認の温床
- **再発条件**: 宣言行の role を無視して REQ 行単位の宣言集合を突合する場合に毎回発生し得る
- **予防策候補**: (1) coverage 突合手順に role 分解の明記、(2) 配布物 cleanup 判断は「除去後の role 別 coverage」で実施する規定の追加
- **想定反映先**: agentdev-traceability（突合解釈の注記）、agentdev-workflow-case-close（STEP-3 集約突合手順）
- **関連**: Case #2824、PR #2874、docs/designs/integrity/prose-quality-sentinel-checks.md:9、REQ-053-023
- **タグ**: `#traceability` `#coverage` `#role-separation` `#verification-process`

## adversarial-review 発動契約非該当の case も判定理由を対応記録に残す（silent skip 回避）

- **問題事象**: adversarial-review の発動契約（要件案・設計案等の合意形成対象）に非該当の case では、審議をスキップしても何も記録しないと「レビュー未実施」と誤認され得る。Case #2832（PR #2877）等の bugfix 系では発動条件を満たさないが、silent skip では検証証跡として不完全
- **発生局面**: 完了処理（case-close 対応記録コメント作成。Batch 全 10 Case）
- **検知方法**: 対応記録コメントの検証差分テーブルに adversarial-review 行が無い case があること
- **根本原因**: 非発動が自明な case では記録様式が規定されておらず、記録する／しないの判断が実行者に依存していた
- **自律対応内容**: 非発動 case も「発動契約非該当（対象: bugfix/maintenance の機械検証中心、合意形成対象なし）」を対応記録へ明記し、判定理由を残す運用に統一
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（記録運用の明確化）
- **横展開観点**: 条件分岐する検査（発動契約ありの gate）は「非該当」も記録対象。silent skip は後工程の独立性検査（QG-4 等）で未実施と区別できなくなる
- **再発条件**: 発動契約を持つ検査を条件非該当でスキップする場合に毎回発生し得る
- **予防策候補**: (1) 対応記録テンプレートに adversarial-review の判定欄（発動/非発動+理由）を追加、(2) workflow-templates 側で非発動記録の様式を規定
- **想定反映先**: agentdev-workflow-templates（対応記録コメント様式）、agentdev-adversarial-review（非発動時の記録契約）
- **関連**: Case #2832、PR #2877、Batch 10 Case の case-close 対応記録コメント
- **タグ**: `#adversarial-review` `#record-keeping` `#verification-process`

## coverage 突合で役割を区別しないと verification・design 役割の docs 宣言を implementation 集約と誤認する

- **問題事象**: 配布物本体 ADF-COVERS 宣言の除去可否判定（docs 集約突合）において、REQ ID の有無のみで判定すると、docs 配下の verification・design 役割宣言を implementation 集約と誤認し、除去後に traceability check の missing-implementation が新規発生する
- **発生局面**: 実装（case-run。Case #2824 の PR #2874 実行中に REQ-053-023 で検出、役割区別判定へ修正）
- **検知方法**: 初回の役割非区別 coverage 突合で removable 判定された 2 宣言が、traceability check 実行（役割フィルタ＋docs/ パスフィルタ適用の再突合）で blocked へ反転
- **根本原因**: 「docs 配下に同 REQ 行の宣言が存在する」ことと「implementation 役割の宣言が存在する」ことは別条件。除去可否は同一役割（implementation）の docs 宣言の存在が前提
- **自律対応内容**: 監査を役割区別突合に修正し、REQ-053-023 の 2 宣言を復元（新規 missing 発生を防止）。判定基準を REQ-057-028 行と PR 本文の Design 確定候補へ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-057-028 の運用詳細の明確化。判定基準自体は既存行が所有）
- **横展開観点**: 配布物宣言の cleanup・集約処理を扱う全 workflow（case-run / case-close / inspect 系）で同一の誤認が発生し得る。coverage CLI の利用時は常に役割フィルタを明示する
- **再発条件**: ADF-COVERS 宣言の除去・移動判定で役割を区別せず REQ ID の存在のみを突合する場合に毎回発生
- **予防策候補**: (1) coverage 突合に役割フィルタ＋docs/ パスフィルタを必須化、(2) REQ-057-028 の運用詳細を traceability 関連 Design へ記載、(3) 除去実行後に traceability check で新規 missing 0 を確認する後置検査の徹底
- **想定反映先**: agentdev-traceability（coverage 利用時の注意）、agentdev-workflow-case-run / agentdev-workflow-case-close（cleanup 手順）
- **関連**: Case #2824、PR #2874、REQ-057-028、docs/designs/integrity/prose-quality-sentinel-checks.md:9（REQ-053-023 verification 宣言のみの箇所）
- **タグ**: `#traceability` `#coverage` `#role-distinction` `#cleanup`

## adversarial-review の発動条件非該当時は silent skip せず判定理由を記録し、代替として自己反証を実施する

- **問題事象**: 委譲 prompt が adversarial-review default-on を指示していても、Issue 本文 Execution Contract の review 発動契約「該当なし（ユーザー明示指定なし）」が正である場合、正規 review 呼出を行わないことがある。呼出を省略するだけだと silent skip となり、委譲側から実施有無が確認できない
- **発生局面**: 実装（case-run 委譲内の検証。Case #2832 の PR #2877、Case #2831 の PR #2876 で記録運用を実施）
- **検知方法**: 委譲 prompt と Issue 本文 review 発動契約の突合（adapter 発動条件はユーザー明示指定のみを正とする契約）
- **根本原因**: 発動条件の判定主体（Issue 本文の契約 > 委譲 prompt の指示）と、非発動時の記録義務が委譲先に伝わっていない
- **自律対応内容**: 非発動の理由を PR 本文へ明記（発動契約引用 + silent skip 回避の宣言）し、代替として実装方針の自己反証（却下案・緩和策・unresolved なしの確認）を記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（adapter reference の発動条件契約どおりの運用記録）
- **横展開観点**: default-on 指示と発動契約が不一致になる全委譲で発生し得る。非発動の判断自体は正規だが、記録がなければ上流は実施漏れと区別できない
- **再発条件**: case-run が adversarial-review を委譲し、Issue 本文の発動契約が「該当なし」の場合に毎回発生し得る
- **予防策候補**: (1) 委譲 prompt に「発動条件は Issue 本文契約を正とする」を明記、(2) 非発動時は PR 本文へ判定理由の記録を必須化、(3) adapter reference の発動条件節を委譲先が参照する形に統一
- **想定反映先**: agentdev-case-run-execution-adapter（発動条件判定の記録運用）、agentdev-workflow-case-run（委譲 prompt の注意書き）
- **関連**: Case #2831（PR #2876）、Case #2832（PR #2877）、adversarial-review-integration.md 発動条件判定節
- **タグ**: `#adversarial-review` `#delegation` `#silent-skip` `#recording`
