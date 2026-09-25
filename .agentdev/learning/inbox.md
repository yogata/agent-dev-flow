# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-26: agentdev_gh pr_create は head branch 未 push 状態で HTTP 422 を返す（branch push 前段が必要）

- **問題事象**: case-open STEP-4 で Definition branch を worktree 上で新規作成した直後に agentdev_gh の pr_create を実行したところ、HTTP 422 Validation Failed（operation-failed、retryable: true、fallbacks: なし）で失敗した
- **発生局面**: case-open STEP-4（Definition PR 作成）。Case 専用 worktree（.worktrees/{N}-definition）で origin/main HEAD から definition/issue-{N} を新規作成し commit 済みだが push 前の状態で pr_create を呼出した初回
- **検知方法**: agentdev_gh の構造化 failure（kind: operation-failed、detail: gh: Validation Failed (HTTP 422)）
- **根本原因**: pr_create は GitHub 側に head branch が存在しない場合 PR を作成できず、Custom Tool は branch push（git push）を内部で行わない。branch の新規作成と push は呼出側の前段操作である
- **自律対応内容**: git push -u origin definition/{branch} を前段で実行した上で pr_create を再実行し作成成功（VERIFY 通過）。gh CLI への切替は行わなかった（書込み操作のため切替範囲外）
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（既存契約の範囲内。pr_create 操作契約・REQ-083 に変更なし）
- **横展開観点**: case-revise の Definition Amendment PR も branch 新規作成後に pr_create する構成であり同条件になり得る
- **再発条件**: branch を新規作成した直後に push 前段なしで pr_create を呼出した場合
- **予防策候補**: case-open / case-revise の reference に「pr_create 前に head branch を origin へ push する」前段手順の明記。gh CLI 切替継続手順（definition-pr-and-idempotency.md）は読み取り切替のみを扱い、書込み系の 422 への言及がない
- **想定反映先**: agentdev-workflow-case-open references/definition-pr-and-idempotency.md、agentdev-workflow-case-revise の同等手順
- **関連**: Case #3142、PR #3147、REQ-083（definition/issue-{N}）
- **タグ**: #gh-cli #pr-create #branch-push #case-open

---

## 2026-09-26: check_integrity --json の stdout にレポート書込みメッセージが混入し機械的 JSON 解析が壊れる（メッセージ分離 workaround）

- **問題事象**: check_integrity.ts --json の stdout を node で JSON.parse したところ、JSON 直後に "Report written to: ..." メッセージ行が連結され SyntaxError（Unexpected non-whitespace character after JSON）で解析失敗した
- **発生局面**: 実装（case-open STEP-4、Definition PR の検査期待値確定前の branch HEAD 実測。worktree root を --root 指定して実行）
- **検知方法**: 初回実行で node JSON.parse の SyntaxError を検知
- **根本原因**: checker は --json 指定でも標準出力へ JSON と人間向けレポート書込みメッセージ（Report written to: <path>）を連結出力する。--json 出力契約とメッセージ出力が同一チャネルに混在する
- **自律対応内容**: stdout を "Report written" で分割して JSON 部分のみを切り出してから JSON.parse する workaround で実測を取得（レポートファイルパス自体はメッセージから確認）
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（checker 実装の現行挙動の観測であり契約変更なし）
- **横展開観点**: 同系 checker を --json で機械解析する工程（QG 検証、case-run 検証等）で同型の解析失敗が起こり得る
- **再発条件**: --json 指定の checker 出力を機械的に JSON.parse する工程でレポート書込み（.agentdev/integrity/reports/ への書込みあり時）が発生した場合
- **予防策候補**: checker 側で --json 時はレポート書込みメッセージを stderr へ分離、または JSON を単独チャネルに出力。呼出側は --json 時にメッセージ混在を前提とした解析とする
- **想定反映先**: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（出力分離）、checker 実行手順を扱う reference
- **関連**: Case #3146、check_integrity.ts、.agentdev/integrity/reports/（非永続領域）
- **タグ**: `#checker` `#json-output` `#workaround` `#case-open`

---

## 2026-09-26: 配布物本文への canonical 参照は節名のみで記述する（要件行 ID 直書きは配布境界 checker の新規違反になる）

- **問題事象**: 配布 skill reference・テンプレート（src/opencode 配下）への canonical 文書参照追記において、要件行 ID（REQ-{NNNN}-{NNN} 形式）や CR 番号を本文に直書きした箇所があり、配布境界 final gate（--profile source）で concrete_id_hits が BASE 38 から 42（+4）へ増加し「新規違反ゼロ」要求を不合格とした
- **発生局面**: case-run 委譲（DEL-3144-1）での配布依存境界 final gate 1 回目実行時
- **検知方法**: check_distribution_boundary.ts --profile source --json の concrete_id_hits 増分（BASE との差分比較）
- **根本原因**: 配布物本文へ canonical 参照を書く際、機械参照可能な concrete ID を併記すると配布境界 checker が concrete_id 直書きとして計上する。参照導線自体は ID を必要としない
- **自律対応内容**: 該当 5 件の concrete ID を節名のみの参照（例: 「case-auto Design「停止理由分類」節」）へ書き換え、2 回目 gate 実行で BASE 同値（38）へ復帰・合格
- **ユーザー確認の有無**: なし（fix-and-reverify で自律解決）
- **Decision/REQ/spec影響**: なし（配布境界契約の遵守方法の知識であり、契約変更なし）
- **横展開観点**: src/opencode 配下の reference・テンプレートへ canonical 文書を参照させる追記を行う全 Case（RA 実装系）で同型違反が起こり得る。evidence 併記規約（Case #3144 本体変更）により evidence path の prune 後識別子併記はケースバイケースで必要になるが、配布物本文への concrete ID 直書きは避ける
- **再発条件**: 配布物本文へ REQ 行 ID・DEC 番号・CR 番号等の concrete ID を含む canonical 参照文言を追記した場合
- **予防策候補**: case-run 実装委譲時の指示へ「配布物本文の canonical 参照は節名のみで記述する」規約の明示。実装前段での事前周知
- **想定反映先**: agentdev-case-run-execution-adapter references（実装指示規約）、case-run delegation-and-result.md
- **関連**: Case #3144、PR #3155、DEL-3144-1（PR 本文検証差分セクション参照）
- **タグ**: `#distribution-boundary` `#concrete-id` `#canonical-reference` `#case-run`

---

## 2026-09-26: worktree 上の bun スクリプト実行は ./ prefix 形式のみ動作し、テストの import.meta.dir は junction パスを返す

- **問題事象**: Case 専用 worktree 上で `.opencode` projection 配下のスキルスクリプトを `bun <path>` 形式で実行すると Module not found で失敗する。`bun run ./.<path>` の `./` prefix 形式のみ動作する。また bun test で実行する契約テストの `import.meta.dir` は junction パス（worktree 側の実ファイル）を返す
- **発生局面**: case-run 委譲（DEL-3144-1）での検証実行（worktree root での checker・契約テスト実行）
- **検知方法**: bun 実行時の Module not found エラー。probe test による import.meta.dir の表示確認
- **根本原因**: bun の path filter 解析は相対 path 指定に `./` prefix を要求する。worktree の `.opencode` projection は junction 未伝播のため、checker 本体は projection 側（main root 側実装）を解決するが検査対象は worktree root になる。テストの import.meta.dir は junction パスを返すためテストは worktree の実ファイルを読む
- **自律対応内容**: 全 bun 実行を `./` prefix 形式（`bun run ./.opencode/skills/...`、`bun test ./.opencode/...`）に統一。probe test でテストが読むツリーを事前確認してから検証を実行
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（実行環境の挙動観測であり契約変更なし）
- **横展開観点**: worktree 上での検証実行を行う全 Case（case-run / case-close STEP-3）で同型の実行失敗が起こり得る。bun test は `./` prefix 形式が既定の実行形態契約
- **再発条件**: worktree root を cwd として `bun <path>` 形式でスクリプト・テストを実行した場合
- **予防策候補**: worktree 上の検証手順へ「bun は ./ prefix 形式」「check_templates.ts 単独実行は worktree で skip（junction 未伝播）するが check_templates.test.ts が補完する」旨の明記
- **想定反映先**: agentdev-case-run-execution-adapter references/harness-delegation.md（実行コマンド形式指示）、repo-agentdev-integrity の実行契約記述
- **関連**: Case #3144、PR #3155、DEL-3144-1
- **タグ**: `#bun` `#worktree` `#junction` `#verification` `#case-run`

---

## 2026-09-26: issue_list の role: case labels 絞り込み 0 件帰着が横断依存検査の検出源収集で再観測（topic_slug 選択的 search への切替で回避）

- **問題事象**: case-open STEP-5 の横断依存検査で未クローズ Case 群を収集するため agentdev_gh issue_list に labels: ["case"] + state: open を指定したところ 0 件帰着し、並行バッチ兄弟 Case を含む未クローズ Case 群の全体列挙ができなかった
- **発生局面**: case-open STEP-5（横断依存検査の検出源収集）。並行 case-open 5件稼働中の自 Case（Case #3145）
- **検知方法**: issue_list 成功応答（ok: true）で issues: [] の 0 件帰着。自 Case #3145 が open 状態で存在する事実との矛盾で即検知
- **根本原因**: issue_create（role: case）で作成した Case Issue の物理ラベルには case が付かず（role は論理判定のみ）、labels: ["case"] による物理ラベル絞り込みは何も一致しない。REQ-092-002 が記録済みの既知挙動の再観測
- **自律対応内容**: 切替判定に従い 1 回再試行（search トークン変更）でも 0 件帰着を確認した後、検出源の取得方法を topic_slug（委譲構造化文脈に含まれる値・draft 読込不要）の選択的 search（REQ-092-004 相当の選択性規律）へ切替し、兄弟 4 Case（#3142 / #3143 / #3144 / #3146）を取得。検査入力の source_failures に「open の Case Issue 全体列挙不能・部分集合」を記録しエンジンの detection_unavailable に出力（比較の黙示省略を回避）。検査自体は成立し警告 0 件
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（REQ-092-002 既知。運用指針の整備は本 Case の成果物 REQ-092-004 / issue-operation-safety.md 追記〔AG-003〕が担当）
- **横展開観点**: 横断依存検査の検出源収集（case-open STEP-5 / case-ready トレーサビリティ完全性ゲート共通）で同条件が再現し得る。Case 群列挙に role: case labels 絞り込みを用いないこと
- **再発条件**: Case Issue の role 論理軸を labels 引数の物理値として信頼した検索を行った場合
- **予防策候補**: 横断依存検査の検出源収集手順に「labels: case 絞り込みは使用せず、topic_slug / REQ 番号等の選択的 search で列挙する」注記。AG-003 の運用指針追記（本 Case）と方向性は同一
- **想定反映先**: agentdev-workflow-case-open references/definition-pr-and-idempotency.md（横断依存検査節）、agentdev-issue-management references/issue-operation-safety.md（AG-003 追記先）
- **関連**: Case #3145、REQ-092-002、REQ-092-004（本 Case 成果物）
- **タグ**: #issue-list #labels-zero-hit #cross-dependency-inspection #case-open

---

## 2026-09-26: write guard が workspace 外一時ファイル書込みを fail-closed ブロック、git 管理対象外の .agentdev/integrity/reports/ への配置で解消

- **問題事象**: 横断依存検査エンジンの検査入力 JSON を環境指定の一時ディレクトリ（C:\WINDOWS\TEMP\opencode）へ Write したところ、agentdev-textlint-guard が project root 外書込みとして fail-closed ブロックした
- **発生局面**: case-open STEP-5（横断依存検査の検査入力 JSON 作成。Case #3145）
- **検知方法**: write 時の guard ブロック応答（fail-closed、迂回指示なし）
- **根本原因**: guard の書込み範囲制御は project root を境界とし、ワークスペース外の一時ディレクトリは許可済みであっても guard 層ではブロックされる（guard と環境側の一時許可設定の粒度差）
- **自律対応内容**: guard を解除・迂回せず標準手段へ切替し、検査入力 JSON を git 管理対象外の worktree 内 `.agentdev/integrity/reports/`（AGENTS.md・.agentdev/README.md が非永続領域として規定、検証レポート配置先）へ配置して解消
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（既存指針「guard による書込みブロックは fail-closed として維持し、標準手段へ切替」の実践）
- **横展開観点**: 検査入力 JSON 等の一時ファイル置き場所指針は RU-0131（Case #3142 が scripts/README.md へ規定予定）と同一主題。本観測はその実ユースケースでの実証であり、RU-0131 の置き場所指針に `.agentdev/integrity/reports/`（git 管理対象外）を候補として含める根拠になる
- **再発条件**: guard 有効環境でワークスペース外へ一時ファイルを書込んだ場合
- **予防策候補**: RU-0131 による scripts/README.md への一時ファイル置き場所指針の規定（実施済み RU の適用待ち）
- **想定反映先**: agentdev-workflow-case-open scripts/README.md（RU-0131 / Case #3142 の成果物）
- **関連**: Case #3145、Case #3142（RU-0131）、AGENTS.md 書込み guard 運用指針
- **タグ**: #write-guard #fail-closed #temp-file #cross-dependency-inspection

---

## 2026-09-26: canonical REQ 行 ID の運用文書への展開は sidecar 宣言パターンで行う（配布物への直書きは配布境界 checker の新規 hit になる）

- **問題事象**: case-run 実装（DEL-3145-1）で選択性指針節の運用文書追記に canonical REQ 行 ID（REQ-092-004）を直書きした箇所があり、配布依存境界 final gate で新規 concrete_id hit 1件として検出された
- **発生局面**: case-run 委譲（DEL-3145-1）での配布依存境界 final gate 実行時（PR #3153）
- **検知方法**: check_distribution_boundary.ts --profile source --json の failures 増分（baseline 38 → 途中 39、最終 34）
- **根本原因**: canonical REQ 行から運用文書へ規律を展開する際、REQ 行 ID を運用文書本文に直書きすると配布境界 checker（concrete-id ルール）が新規 hit として計上する。規律の展開自体は ID を本文に必要としない
- **自律対応内容**: 運用文書側の表記を機能的記述のみへ修正し、対応関係は traceability/ 配下 sidecar（agentdev-issue-management.yaml の implementation 宣言）で宣言する方式へ切替。最終 gate で baseline delta -4（本 Case 解消分）・新規 0件を確認
- **ユーザー確認の有無**: なし（fix-and-reverify で自律解決）
- **Decision/REQ/spec影響**: なし（配布境界契約・traceability 宣言契約の遵守方法の知識であり契約変更なし）
- **横展開観点**: canonical REQ 行から運用文書へ規律を展開する全 Case で同型違反が起こり得る。sidecar 宣言パターンが正規の対応関係記録手段。「配布物本文への canonical 参照は節名のみで記述する」（Case #3144 capture 分）と同主題で、sidecar 宣言まで含む実装パターンとしての補完
- **再発条件**: canonical REQ 行 ID を配布物（src/ 配下）本文へ直書きした場合
- **予防策候補**: 配布物追記時は機能的記述のみとし、REQ 行との対応は sidecar 宣言で行う。baseline delta の機械確認を final gate で必須化（現行契約どおり）
- **想定反映先**: agentdev-issue-tracking（REQ-092-004 運用規律）、agentdev-case-run-execution-adapter references（実装指示規約）
- **関連**: Case #3145、PR #3153、DEL-3145-1、traceability/agentdev-issue-management.yaml
- **タグ**: #distribution-boundary #concrete-id #traceability-sidecar #case-run

---

## 2026-09-26: bash の node -e への正規表現 inline 記述は Git Bash の escape 解釈で破損する（checker 出力解析は一時スクリプトファイル経由が確実）

- **問題事象**: bash から `node -e` で正規表現を inline 記述した場合（`replace(/\\/g,'/')` 等のバックスラッシュを含むパターン）、Git Bash の escape 解釈により意図しない文字列として node へ渡り、解析処理が破損する
- **発生局面**: case-run 委譲（DEL-3142-1）での checker stdout 解析時（PR #3154）
- **検知方法**: checker 出力の解析結果が期待と不一致となることで発覚
- **根本原因**: Git Bash は引数内のバックスラッシュを escape 解釈するため、shell 引数経由で正規表現リテラルを inline 記述すると、node に到達する時点でパターンが変質する。worktree-operations.md「main root 実体 + --root 指定」節の backslash 警告と同根の shell 解釈起因
- **自律対応内容**: checker stdout の解析は、node スクリプトを project root 内の一時ファイルへ配置して実行する方式へ切替（scripts/README.md の置き場所指針に従い、project root 内限定・commit 対象外・検査後削除を実施）
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（既存指針の実践であり契約変更なし）
- **横展開観点**: checker 出力の機械解析を行う全 workflow（case-run / case-close / inspect 系）で同型破損が起こり得る。一時スクリプトファイル経由の実行が標準手段
- **再発条件**: bash から `node -e` 等の shell 引数経由でバックスラッシュを含む正規表現を inline 記述した場合
- **予防策候補**: 正規表現を含む解析は shell 引数に inline 記述せず、project root 内の一時スクリプトファイルへ配置して実行し、検査後に削除する
- **想定反映先**: worktree-operations.md「書込み guard 運用指針」節（標準手段切替の知見拡張候補）
- **関連**: Case #3142、PR #3154、DEL-3142-1、scripts/README.md「検査入力 JSON の置き場所指針」
- **タグ**: #git-bash #escape #node-e #temp-file #checker-output

---

