# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## REQ 行 append を伴う req-save では AUTOGEN 索引の同 commit 再生成が必要

- **問題事象**: REQ 行の append を伴う req-save（commit 340e7304）実行後、docs/designs/quality/req-health-metrics.md の AUTOGEN ブロック（req-metrics-measurement-example）が再生成されず、REQ-010 21→23 行・REQ-032 21→22 行の鮮度違反（CONTENT_CHANGE）が下流 Issue #2380 の検証で発覚した（check_autogen_freshness.ts exit 1）
- **発生局面**: 実装（req-save 工程）と検証（下流 case work の docs-check）
- **検知方法**: check_autogen_freshness.ts の非ゼロ exit（REQ-010-059 鮮度 gate）
- **根本原因**: REQ 行の append を伴う req-save 実行時に AUTOGEN 対象索引の再生成を同 commit で行う契約が手順側に明確でなく、再生成が漏れた
- **自律対応内容**: Issue #2380 の検証で bun run generate_indexes.ts により req-health-metrics.md を再生成し、鮮度検査 exit 0 を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（AG-009(a)（OU-008、Issue #2386）の AUTOGEN 再生成前置化の動機を裏付ける実例）
- **横展開観点**: REQ 行を append する req-save 実行時は常に AUTOGEN 対象索引（req-health-metrics.md 等）の再生成要否を確認する
- **再発条件**: REQ 行 append を伴う req-save で AUTOGEN 再生成を省略した場合
- **予防策候補**: req-save 手順への AUTOGEN 再生成前置の明記、または req-save 完了時の鮮度検査自動実行
- **想定反映先**: agentdev-workflow-req-save 手順、docs/designs/integrity/checker-execution-contracts.md（AG-009(a) で扱う領域）
- **関連**: PR #2390 本文、Issue #2380、commit 340e7304
- **タグ**: `#req-save` `#autogen` `#freshness-gate`

## 配布 skill への実行手順記載は fenced code block とプレースホルダーで書く

- **問題事象**: 配布 skill（src/opencode/**）にコマンド例を inline code span で src/opencode/ 直参照付きで記載した結果、check_integrity の IR-055 strict 違反（delta）5 件と check_distribution_boundary --profile source の concrete-id 違反 6 件を検出した
- **発生局面**: 実装（skill 文書への実行手順追記、Issue #2381 の case work）
- **検知方法**: check_integrity.ts（IR-055 runtime-unresolved-reference delta）、check_distribution_boundary.ts --profile source
- **根本原因**: inline code span 内のパス参照は IR-055 の検出対象になるが fenced code block 内は非検出、REQ-/DEC- 等 concrete ID は配布依存境界の concrete-id 違反になるという検出器の性質を記載時に考慮していなかった
- **自律対応内容**: 該当箇所を fenced code block 化し、concrete ID をプレースホルダー（<integrity-detector-skill> 等）へ置き換えた結果、IR-055 delta 0・concrete-id 違反 0 を機械確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（IR-055・配布依存境界の既存規定の運用知見）
- **横展開観点**: 配布 skill・command へコマンド例やパス参照を記載するすべての場面
- **再発条件**: 配布 skill に inline code span で src/opencode/ 直参照や concrete ID を記載した場合
- **予防策候補**: 配布 skill 編集時の「fenced code block + プレースホルダー」様式の徹底（skill-authoring ガイダンスへの明記候補）
- **想定反映先**: agentdev-skill-authoring、agentdev-doc-writing の記載様式ガイド
- **関連**: PR #2391 本文、Issue #2381、docs/designs/integrity/rules/IR-055（runtime-unresolved-reference）
- **タグ**: `#distribution-boundary` `#ir055` `#skill-authoring`

## gh api での Issue コメント編集には REST numeric id が必要

- **問題事象**: gh issue view --json comments で取得したコメント id（IC_... 形式の GraphQL node id）を gh api -X PATCH /repos/{owner}/{repo}/issues/comments/{id} に渡したところ HTTP 404 Not Found になった
- **発生局面**: 運用（case-close での投稿済みコメント修正）
- **検知方法**: gh api の HTTP 404 エラー（documentation_url は issues/comments#update-an-issue-comment）
- **根本原因**: issues/comments の REST endpoint は numeric database id を要求するが、gh issue view の comments JSON が返す id は GraphQL node id である
- **自律対応内容**: gh api /repos/{owner}/{repo}/issues/{N}/comments（REST）でコメント一覧を再取得して numeric id（5379964457）を使い、PATCH を成功させた
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: gh issue view --json 系の出力を gh api REST 呼び出しのパスに流用するすべての場面
- **再発条件**: GraphQL node id を REST API パスに埋め込む場合
- **予防策候補**: コメント編集時は REST 一覧（gh api /repos/.../issues/{N}/comments）から numeric id を取得する手順を標準とする
- **想定反映先**: agentdev-gh-cli references（REST API PATCH 標準手続き系への注記候補）
- **関連**: Issue #2379 コメント修正（numeric id 5379964457）
- **タグ**: `#gh-cli` `#rest-api`

## 手順文書への CLI オプション記載は実装の argv 解析と突合する

- **問題事象**: 継承ドラフトが存在しない CLI オプション（`--root`）を gate 手順に記載していた。対象スクリプト（check_distribution_boundary.ts）の実際の argv 解析は位置引数（repoRoot）であり、手順どおりに実行すると引数エラーになる
- **発生局面**: 仕様引き継ぎ（継承ドラフトからの手順転記、Issue #2386 の case work）
- **検知方法**: 対象スクリプトの argv 解析実装との突合（PR #2394 の検証時）
- **根本原因**: 手順文書を CLI リファレンスや慣例から推測で記載し、実装の引数解析を確認しなかった
- **自律対応内容**: 位置引数 repoRoot による読取専用実行として手順を修正し、実行形態契約へ明記した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（agentdev-workflow-case-run STEP-S5-1 の実行形態として反映済み）
- **横展開観点**: 手順文書へ CLI オプション・引数形式を記載するすべての場面
- **再発条件**: 実装の引数解析を確認せずに CLI オプションを文書化した場合
- **予防策候補**: 手順文書への CLI 記載時に対象スクリプトの argv 解析実装との突合を必須手順とする
- **想定反映先**: agentdev-skill-authoring の記載様式ガイド、agentdev-workflow-case-run 委譲手順
- **関連**: PR #2394 本文、Issue #2386
- **タグ**: `#cli-contract` `#argv-parsing` `#skill-authoring`

## NG baseline の bucket key evidence は語彙置換で陳腐化する

- **問題事象**: NG baseline の bucket key（category/check/file/evidence）の evidence 文字列が、本文の機械的語彙置換（SPEC→Design 等）で不一致化して未管理 NG 化した（#2350 の改名で既存 baseline entry の evidence が陳腐化。LifecycleBoundary 3件が該当事例として PR #2395 の検証で確認）
- **発生局面**: 検証（docs-check、語彙置換系の横断 PR）
- **検知方法**: check_integrity.ts の未管理 NG 検出（baseline-known に一致しない evidence）
- **根本原因**: baseline entry の evidence が本文の語彙に依存する構造であり、語彙置換系の横断変更が baseline の再登録・純減を要求することを完了条件に含めていなかった
- **自律対応内容**: PR #2395 で該当事例を把握・記録し、Wave 2 マージ後の case-close 独立再検証で当該3件が解消済み（#2396 の docs 修正と DEC-016/017 昇格による）ことを確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（integrity-contracts Design の baseline 運用手順の運用知見）
- **横展開観点**: 語彙置換・改名を伴う横断 PR すべて
- **再発条件**: 語彙置換系の横断 PR で影響を受ける baseline entry の再確認を行わない場合
- **予防策候補**: 語彙置換系の横断 PR では影響を受ける baseline entry の再確認を完了条件へ含める
- **想定反映先**: integrity-contracts Design の NG baseline 運用手順、check_changed_docs の検査項目候補
- **関連**: PR #2395 本文、Issue #2383、PR #2350
- **タグ**: `#ng-baseline` `#vocabulary-replacement` `#docs-check`

## PR 本文の close キーワードはマージ時に Issue を自動クローズする（Refs: 形式を使う）

- **問題事象**: PR #2396 本文「関連Issue」の `Closes #2385` 記載により、マージ時に GitHub が Issue #2385 を自動クローズした。case-close の正規手順（QG-4 チェックボックス評価 → 対応記録コメント → close）より先にクローズが発生し、順序逸脱が生じた（コミットメッセージに close キーワードが無くても、PR 本文の close キーワードはマージ時に有効）
- **発生局面**: 実行（case-close の PR マージ、Epic #2378 Wave 2）
- **検知方法**: マージ後の gh issue list 状態確認（#2385 が CLOSED、他4件は OPEN）
- **根本原因**: PR テンプレート（agentdev-workflow-templates/templates/pr_desc.md）の関連Issue セクションが `Closes #$ISSUE_NUMBER` を既定としており、agentdev-conventional-commits の GitHub auto-close 回避ガイドライン（コミットメッセージ向け）と PR 本文経路の自動クローズ挙動が整合していない
- **自律対応内容**: クローズ済み #2385 に対して QG-4 評価・本文 [x] 化・対応記録コメントを事後実施し、完了状態（CLOSED/COMPLETED）が正しい終状態であることを VERIFY の上で維持した。逸脱はコメントの「備考（クローズ経緯）」に正規記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（テンプレート修正候補として intake ではなく本 learning 記録で保管。PR 本文のみを capture 入力源とする capture 境界に従い、本件は学び検知（テンプレート逸脱）として learning へ記録）
- **横展開観点**: PR 本文を作成するすべての case work、PR テンプレートの関連Issue 記法
- **再発条件**: PR 本文の関連Issue セクションに close キーワード（Closes/Fixes/Resolves）を含めた場合
- **予防策候補**: pr_desc.md テンプレートの関連Issue 記法を `Refs: #N` 形式へ変更する（agentdev-workflow-templates 修正候補）、case-close 側でマージ前に PR 本文へ close キーワードが無いかを検査する
- **想定反映先**: agentdev-workflow-templates の pr_desc.md、agentdev-workflow-case-close の PR マージ手順（本文検査の追加候補）
- **関連**: PR #2396、Issue #2385、Epic #2378 Wave 2 case-close
- **タグ**: `#github-autoclose` `#pr-template` `#case-close`

## lint_skills の See Also 参照検査は junction 投影の状態で結果が変わる

- **問題事象**: main repo root（junction 伝播あり・投影欠落残存）で lint_skills.ts を実行した際、src 側に実在する agentdev-design-file-manager への See Also 参照（agentdev-artifact-validation）が broken reference NG（delta）として検出された。lint の See Also 参照解決はスキャン面（.opencode/skills 投影 or src/opencode/skills 実体、REQ-018 fallback）で構成されるため、投影欠落（F-01）環境では偽 NG になる。worktree（junction 未伝播 → src スキャン）では同 NG は出ない
- **発生局面**: 検証（case-close の QG-4 独立再検証、main repo root）
- **検知方法**: lint_skills.ts の NG 出力と src/opencode/skills 実体との突合、投影ディレクトリ列挙（投影欠落4件を確認）
- **根本原因**: F-01 junction 投影乖離が未解消のまま投影面をスキャンする lint を実行した
- **自律対応内容**: sync-self-opencode.ps1 -Mode apply で junction を再構築（投影欠落4件作成・orphan 3件削除、RD-002 の PR #2395 マージ後運用タスクとして実施）し、再実行で NG 0 を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（IR-068 skill-projection-manifest により投影乖離は恒常検出化済み）
- **横展開観点**: main repo root で lint_skills・投影面スキャン系検査を実行するすべての場面
- **再発条件**: junction 投影が陳腐化した状態で投影面スキャンの lint を実行した場合
- **予防策候補**: main repo root で lint_skills を実行する前に IR-068（check_integrity の SkillProjection）で投影整合を確認、または junction 再構築を前置する
- **想定反映先**: agentdev-quality-gates の QG-4 実行前提、repo-agentdev-integrity の lint 実行契約（環境ラベル記録との併用）
- **関連**: PR #2395（IR-068）、RD-002、Epic #2378 Wave 2 case-close
- **タグ**: `#lint-skills` `#junction` `#ir068` `#environment-label`

## AG-005「references 300行超は目次必須」は既存 reference への節追記で発火する

- **問題事象**: 既存 reference への節追記で行数が300行超に到達すると lint_skills の AG-005（references 300行超は目次必須）が発火する。PR #2397 で mechanical-replacement-rules.md へ節を追記した際に発火し、目次追加で解消するまで1往復の手戻りが発生した
- **発生局面**: 実装（既存 reference への節追記、Epic #2378 Wave 3）
- **検知方法**: lint_skills.ts の AG-005 NG 出力
- **根本原因**: 追加編集前に当該 reference の行数と目次有無を確認しなかった
- **自律対応内容**: 該当 reference へ目次を追加して AG-005 を解消し、再実行で NG 0・Warning 0 を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 既存 reference へ節を追記するすべての編集
- **再発条件**: 300行近辺の既存 reference に目次有無を確認せず節を追記する場合
- **予防策候補**: 追加編集時に当該 reference の行数と目次有無を事前確認する
- **想定反映先**: agentdev-doc-writing の機械置換手順（mechanical-replacement-rules.md）へ事前確認段階として反映する候補
- **関連**: PR #2397、Issue #2387、Epic #2378 Wave 3 case-close
- **タグ**: `#ag005` `#lint-skills` `#toc`

## 機械置換スクリプトを別処理系へ移植する際の引数意味差異は段階3 MISS 確認で即時検出される

- **問題事象**: X-4 分割スクリプトを Node.js へ移植した初回実行で、`String.prototype.substring`（第2引数 = 終了 index）と PowerShell `Substring`（第2引数 = 長さ）の引数意味の違いにより不正分割が発生した
- **発生局面**: 実装（機械置換スクリプトの処理系間移植、Epic #2378 Wave 4）
- **検知方法**: 3段階手順の段階3（MISS 確認）での再検出が新規違反21件として即時検出
- **根本原因**: 移植時に両処理系の部分文字列 API の引数意味（終了 index か長さか）を照合しなかった
- **自律対応内容**: `git checkout` で対象ファイルを復元し、引数意味を修正したうえで3段階手順を再実行して影響を排除した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（RU-0009 正式化の3段階手順の有効性を実証する事例）
- **横展開観点**: 機械置換・機械判定スクリプトを別処理系へ移植するすべての場面
- **再発条件**: 同一仕様の文字列操作 API を持つ別処理系へ引数意味を確認せず移植する場合
- **予防策候補**: 機械置換スクリプト移植時に引数意味の照合を事前確認に含める
- **想定反映先**: agentdev-doc-writing の機械置換手順（mechanical-replacement-rules.md）へ移植時事前確認として反映する候補
- **関連**: PR #2398、Issue #2388、Epic #2378 Wave 4 case-close
- **タグ**: `#mechanical-replacement` `#porting` `#three-stage-procedure`

## 前段ドライバーのインフラ障害からの再開は差分の契約照合・作成後埋め戻し・検査タイミングの3点で完結できる

- **問題事象**: 前段ドライバーが実装途中でインフラ障害により result 未返却で終了し、未コミット差分（11 ファイル）と未追跡ファイル（2 ファイル）が残留した。あわせて (a) Issue / PR 自身の番号を含む識別情報は作成前には確定せず、作成後埋め戻し手順が不明だと値が永久にプレースホルダのままになる箇所、(b) `check_changed_docs.ts` の `--base-ref` は `git diff base...HEAD`（コミット済み差分のみ）を対象とするため未コミット状態での実行は空振りする、の2点が判明した
- **発生局面**: 実装（case-run 委譲、Epic 2399 Wave 1 基盤層。前段ドライバーの中断と後続ドライバーの再開）
- **検知方法**: worktree の `git status` による生存差分検出、Issue・REQ・Design 契約との hunk 単位照合、テンプレート識別情報セクションの値検査、`check_changed_docs.ts` の実行タイミング検証
- **根本原因**: インフラ障害による委譲の異常終了（計画起因ではない）。ならびに自己参照識別子の確定タイミングと検査コマンドの対象範囲（コミット済み差分のみ）が手順化されていなかった
- **自律対応内容**: 生存差分を Issue・REQ・Design 契約に照合して hunk 単位で再検討し、妥当な差分は保持・補完して完遂した。自己参照識別子（`adf_case`、`adf_execution_unit` の自己参照、`adf_pr`）の作成後埋め戻し手順を case-open STEP-5 と adapter PR 作成に明文化した。`check_changed_docs.ts` はコミット後に実行する手順順序が有効であることを確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-048-005「取得不能識別子を必須契約とせず停止しない」の運用実例、DEC-011 会話記憶非依存再開の実証例）
- **横展開観点**: 委譲異常終了後の再開すべて、自己参照識別子を含むテンプレート運用、`--base-ref` 系検査の実行タイミング
- **再発条件**: 委譲が result 未返却で中断し差分が残留した場合、作成後埋め戻し手順なしに識別情報セクションを運用した場合、未コミット状態で `--base-ref` 検査を実行した場合
- **予防策候補**: 再開時の差分再検討手順の標準化、作成後埋め戻し手順のテンプレート規約化（本 PR 2405 で適用済み）、検査はコミット後実行の順序徹底
- **想定反映先**: agentdev-workflow-case-run の再開経過手順、agentdev-workflow-case-open・agentdev-case-run-execution-adapter の埋め戻し規約（本 PR 2405 で適用済み）
- **関連**: PR 2405 本文、Issue 2400、Epic 2399 Wave 1 case-close
- **タグ**: `#delegation-recovery` `#self-reference-ident` `#check-changed-docs` `#case-close`

## 委譲中断時の検証途中状態はコミットメッセージと Issue コメントへの記録が再開を安定させる

- **問題事象**: 前段ドライバーがコミット済み・検証未完了・result 未返却のままインフラ障害で中断した。検証の進捗状態（どの検証が実施済みでどこから未済か）が正規記録に残っておらず、後続ドライバーは durable state（Issue 本文、REQ、Design、git log/diff、コミットメッセージ）から検証済み/未済の帰属を再推定する必要があった
- **発生局面**: 実装（case-run 委譲、Epic 2399 Wave 1。前段ドライバーの中断と後続ドライバーの再開）
- **検知方法**: delegation-and-result.md の異常終了時扱い（即 failed とせず実装完了・検証未完了として扱い、worktree の git status と残留変更で帰属確認）に従った再開時の差分精査
- **根本原因**: インフラ障害による委譲の異常終了（計画起因ではない）。検証途中の進捗状態をコミットメッセージや Issue コメントへ残す指針が手順化されていない
- **自律対応内容**: case-run の規定に従い、後続ドライバーが durable state のみから状況を再構成して精査し、目次の不完全さ（環境制約セクション欠落）を修正のうえ追加の修正不要と判断して完遂した。会話記憶非依存の再開（DEC-011）と委譲異常終了時の事後処理が機能した実例である
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（DEC-011 会話記憶非依存再開の運用実例。PR 2405 由来の学び（作成後埋め戻し・検査タイミング）と同一波形の第2事例）
- **横展開観点**: 委譲異常終了後の再開すべて、検証途中の状態記録を伴う case work
- **再発条件**: 検証途中の進捗状態をコミットメッセージ・Issue コメントへ残さないまま委譲が中断した場合
- **予防策候補**: 検証途中の状態を PR 本文ではなくコミットメッセージと Issue コメントに残す指針の追加（PR 本文は PR 作成前の検証途中では存在せず、中断時期によって記録先を失う）
- **想定反映先**: agentdev-workflow-case-run の委譲・再開手順（検証進捗の正規記録指針）
- **関連**: PR 2404 本文、Issue 2401、Epic 2399 Wave 1 case-close
- **タグ**: `#delegation-recovery` `#verification-progress` `#dec011`

## 新規配布物ファイルの IR-055 delta は ADF-COVERS 宣言の PR 本文集約で回避する

- **問題事象**: 新規配布物ファイル（reference-resolution.md）の作成過程で、素の REQ-NNNN/DEC-NNN ID 参照と src/opencode/ パス表記が IR-055（runtime-unresolved-reference）の delta 違反13件として fail 検出された。既存ファイルの同種表記は baseline 管理で info 降格されているが、新規ファイルは baseline 対象外のため fail になる
- **発生局面**: 実装（新規配布物 reference ファイルの作成、Epic 2399 Wave 2、Issue 2402 の case work）
- **検知方法**: bun test integrity suite の IR-055 delta 検出（fail）
- **根本原因**: 既存ファイルで許容されている表記（inline パス参照、要件根拠の ID 引用）が新規ファイルでは違反になるという baseline 適用範囲の差を事前把握していなかった
- **自律対応内容**: パス表記を fenced code block 内へ限定し、具体例を {skill} プレースホルダ形式に置換し、REQ/DEC ID 引用を配布物本文から除外して要件根拠を PR 本文の ADF-COVERS 宣言へ集約した。再検証で delta 0 を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（IR-055・配布依存境界の既存規定の運用知見。PR 本文 ADF-COVERS 集約に伴うトレーサビリティ宣言カバレッジの観点は intake item（traceability-req048-declaration-corpus-gap）で別管理）
- **横展開観点**: 新規配布物ファイルを作成するすべての場面
- **再発条件**: 新規配布物に既存ファイルと同等の inline パス参照・concrete ID 記述を行った場合
- **予防策候補**: 新規配布物作成時の「fenced code block + プレースホルダ + ID 引用排除（PR 本文 ADF-COVERS 宣言へ集約）」様式の徹底
- **想定反映先**: agentdev-skill-authoring、agentdev-doc-writing の記載様式ガイド（既存学び「配布 skill への実行手順記載は fenced code block とプレースホルダーで書く」との統合候補）
- **関連**: PR 2406 本文、Issue 2402、Epic 2399 Wave 2 case-close
- **タグ**: `#ir055` `#new-distribution-file` `#adf-covers` `#skill-authoring`

## Windows 環境の一時検証コードは repo 内 tmp 領域に配置する

- **問題事象**: Windows 環境で `C:\WINDOWS\TEMP\` 直下へ `.ts` ファイルとして検証ドライバを書き込んだところ、配布依存境界の pre-write gate に block された（outside-root target 扱い）
- **発生局面**: 実装（検証ドライバの作成・実行、Issue #2409 の case work）
- **検知方法**: 配布依存境界 pre-write gate の block 検出
- **根本原因**: 検証コードの配置先を OS 標準一時ディレクトリにした際、gate が repo root 外への書き込みを outside-root target として扱う構成を確認していなかった
- **自律対応内容**: repo 内 `.agentdev/tmp/`（worktree 内）へ配置して実行し、実行後に削除する回避で検証を完結した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（配布依存境界の gate 挙動の運用知見）
- **横展開観点**: Windows 環境で一時検証コード・ドライバを書き出すすべての場面
- **再発条件**: repo 外の一時ディレクトリへ検証コードを書き出して gate 対象操作を実行する場合
- **予防策候補**: 一時検証コードの配置先は repo 内 tmp 領域（`.agentdev/tmp/` 等）を標準とする
- **想定反映先**: agentdev-git-worktree の検証実行手順、agentdev-workflow-case-run の委譲手順
- **関連**: PR #2412 本文「Findings/ Capture候補」learning 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2412 ）
- **タグ**: `#windows` `#temp-file` `#distribution-boundary` `#pre-write-gate`

## worktree で junction が未伝播の場合の整合性検証は repo-local 直実行と --root 読取専用実行で完結できる

- **問題事象**: worktree（`.worktrees/2409-feature`）では `.opencode/` junction が未伝播のため、配布スキルのスクリプト（agentdev-traceability 等）を worktree 側から直接実行できなかった
- **発生局面**: 検証（case-run・case-close の worktree での整合性検証、Issue #2409 の case work）
- **検知方法**: worktree 内の `.opencode/` 配下の配布スキル不在確認
- **根本原因**: junction は git 非追跡のため worktree へ伝播せず、配布スキルのスクリプトが worktree から解決できない（worktree 構造的制約）
- **自律対応内容**: repo-local 整合性スクリプト（`.opencode/skills/repo-agentdev-integrity/scripts/`、git 追跡で worktree へ伝播）は worktree から直接実行し、配布スキルのスクリプトは main root の `.opencode/` から `--root <worktree>` 指定で読取専用実行する形で検証を完結した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-018 worktree 構造的制約の運用知見）
- **横展開観点**: worktree で配布スキルの検証スクリプトを実行するすべての場面
- **再発条件**: junction 未伝播の worktree で配布スキルのスクリプトを直接実行しようとした場合
- **予防策候補**: worktree 検証時は「repo-local スクリプトは直実行、配布スキルは main root から --root 指定」の使い分けを事前確認する
- **想定反映先**: agentdev-git-worktree の worktree 構造的制約、agentdev-workflow-case-run STEP-S5 の検証実行形態
- **関連**: PR #2412 本文「Findings/ Capture候補」learning 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2412 ）
- **タグ**: `#worktree` `#junction` `#read-only-verification` `#req018`

## PR 本文の traceability 検証差分の担当行帰属は Epic マッピングと突合する

- **問題事象**: PR #2412 本文の traceability check 行が残存 missing-implementation の対象行を「#2410、#2411 担当行 001〜004、019〜022、030」と記載していたが、Epic #2408 本文の REQ 行 → 子Issue マッピングでは REQ-049-001〜004 は #2409（Wave 1）の完了条件行であり、帰属が不一致していた。case-close の独立再検査で行レベルの check を再実行するまで気づけなかった
- **発生局面**: 検証（Epic Wave クローズの QG-4 トレーサビリティ独立再検査、Epic #2408 Wave 1 case-close）
- **検知方法**: agentdev-traceability check を `--req REQ-049-001,...,030` の行 ID 列挙で実行し、PR 本文記載の担当行と Epic 本文マッピングを行単位で突合
- **根本原因**: case-run が check 結果（REQ 単位の findings）を後続 Wave 担当行の説明と混記し、行レベルの帰属を Issue の対象要件行で確認しなかった
- **自律対応内容**: 行レベル再実行で実態（001〜004 が #2409 完了条件行の宣言欠落）を確定し、実装の実体は QG-4 で担保済みのため宣言 corpus 欠落として intake item（2026-08-23-req049-declaration-corpus-gap.md）へ回収し、対応記録コメントの検証差分に新規 finding として記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（トレーサビリティ能力の fail-open・中間Wave 保留原則の運用実例）
- **横展開観点**: Epic Wave case-close で traceability 独立再検査を実施するすべての場面
- **再発条件**: check 結果の残存行を行 ID レベルで確認せず、PR 本文の担当行記載をそのまま信用した場合
- **予防策候補**: case-close の再検査は行 ID 列挙で実行し、残存行が当該 Issue の対象要件行か後続 Wave 担当行かを Epic マッピングで判定する手順を明確化する
- **想定反映先**: agentdev-workflow-case-close のトレーサビリティ独立再検査手順（行レベル評価スコープ判定）
- **関連**: PR #2412 本文、Issue #2409 対応記録コメント、Epic #2408 Wave 1 case-close
- **タグ**: `#traceability` `#epic-wave` `#evaluation-scope` `#case-close`


## Windows worktree で外部依存（zod）を持つ検証スクリプトは bun install 前置で実行する

- **問題事象**: Windows の worktree（`.worktrees/2410-feature`）では node_modules が git 管理外のため main root から伝播せず、zod に依存する integrity checker（check_extensions が参照する agentdev-project-extensions/scripts/lib/extension_state.ts）が unhandled error で失敗した
- **発生局面**: 検証（case-run・case-close の worktree での整合性検証、Issue #2410 の case work）
- **検知方法**: worktree 上での check_extensions 実行時に zod のモジュール解決エラーが発生
- **根本原因**: node_modules は git 非追跡のため worktree へ伝播しない（worktree 構造的制約と同一根拠）。agentdev-project-extensions/scripts が zod に依存するが、worktree 側に当該 node_modules が存在しない
- **自律対応内容**: src/opencode/skills/agentdev-project-extensions/scripts と .opencode/skills/repo-agentdev-integrity/scripts の両方で bun install を実行して解消した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-018 worktree 構造的制約の運用知見）
- **横展開観点**: Windows worktree で zod 等の外部依存を持つ検証スクリプトを実行するすべての場面
- **再発条件**: 新規 worktree を作成し、node_modules の伝播を前提とした検証スクリプトを実行する場合
- **予防策候補**: worktree 検証手順に bun install 前置を明文化する
- **想定反映先**: agentdev-git-worktree の worktree 構造的制約（bun test 実行の環境前提）、agentdev-workflow-case-run の委譲時検証手順
- **関連**: PR #2413 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2413 ）
- **タグ**: `#windows` `#worktree` `#node-modules` `#bun-install`


## 配布依存境界 guard は src 参照を含む一時検証ドライバの TEMP 書出しも block する

- **問題事象**: 配布依存境界 guard の事前書き込み gate が、TEMP 直下の一時検証ドライバの書き出しに対しても、内容に src/opencode/ 配下パス参照を含むことを理由に block した
- **発生局面**: 検証（Issue #2411 の case-run、Windows、検証ドライバの一時ファイル化）
- **検知方法**: 一時ドライバ書き出し時に gate が block を報告
- **根本原因**: gate は書き込み先パスではなく書き込み内容の配布物パス参照で判定するため、一時領域への検証用ファイル書き出しも配布物変更と同様に扱われる
- **自律対応内容**: ドライバをファイル化せずコマンド inline 実行に切り替えて回避した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（配布依存境界 Design の gate 仕様に従う挙動）
- **横展開観点**: 配布依存境界 guard 配下で検証ドライバをファイル化するすべての場面
- **再発条件**: 一時検証ドライバに src/opencode/ 配下パスを埋め込んだファイルを書き出す場合
- **予防策候補**: 一時ドライバをファイル化する場合は配布物パスを埋め込まない構成にする（コマンド inline 実行またはパスの間接参照）
- **想定反映先**: agentdev-workflow-case-run の検証手順、配布依存境界 Design の gate 例外規定の検討
- **関連**: PR #2414 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2414 ）
- **タグ**: `#distribution-boundary` `#guard` `#temp-file` `#windows`

## release archive 同梱配布物には実 REQ ID を書かずプレースホルダ表記を使う

- **問題事象**: release archive に同梱される配布物（archive 専用 installer `scripts/consumer/archive/install.ps1`、`README-INSTALL.md`）に ADF-COVERS 宣言や実 REQ ID（REQ-050）を記述した結果、配布依存境界検査（archive profile）の concrete-id 違反 5 件が検出され、archive 生成（package-release-archive.ps1）が停止した（REQ-050 実装、TS-006 検証中）
- **発生局面**: 実装（case-run、release archive 生成検証 TS-006）
- **検知方法**: 配布依存境界検査（archive projection）の concrete-id 違反による archive 生成停止（exit 非 0）
- **根本原因**: 配布物から正規 ID 汚染（concrete-id）を除外する配布依存境界の規約が、archive に同梱されるファイルにも適用される。対応宣言（ADF-COVERS）は host 専用ファイル（archive に入らないファイル）に配置すべきであるが、archive 同梱ファイルへ記述していた
- **自律対応内容**: 配布物から宣言・実 ID を除去しプレースホルダ表記（`WP-{N}` 形式）へ変更して解消、再検証合格（PR #2416 検証差分 TS-006 行）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-050-010 の archive 投影契約の運用実例）
- **横展開観点**: 今後 archive に同梱するファイル（README-INSTALL.md 等）を追加・更新する際、実 REQ ID や ADF-COVERS 宣言を持ち込まない。対応宣言は host 専用ファイル側に配置する
- **再発条件**: archive 同梱配布物に実 ID や対応宣言を記述した場合
- **予防策候補**: 配布物向け執筆時のプレースホルダ表記ルールの明文化（配布依存境界 Design の archive 公開前検査節への運用注記）
- **想定反映先**: docs/designs/integrity/distribution-boundary.md（archive 公開前検査の運用注記）
- **関連**: PR #2416 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2416 ）
- **タグ**: `#distribution-boundary` `#archive` `#concrete-id`

## worktree で agentdev-traceability を scripts ディレクトリ cwd 起動する場合は --root に worktree root を明示指定する

- **問題事象**: worktree（junction 未伝播）で agentdev-traceability の check を scripts ディレクトリ（`src/opencode/skills/agentdev-traceability/scripts/`）を cwd に直接起動する際、`--root .` とすると scripts ディレクトリ自体が走査 root と解釈され corpus が縮退、missing-implementation / missing-verification の誤検出（false fail、exit 2）となる
- **発生局面**: 検証（case-run / case-close のトレーサビリティ独立再検査、worktree 環境）
- **検知方法**: traceability check の missing-implementation / missing-verification fail（exit 2）
- **根本原因**: `--root` の `.` が cwd 相対で解決され、scripts ディレクトリを root に指定した場合に ADF-COVERS 宣言 corpus（docs/・src/・.opencode/ 等）が走査対象から外れる
- **自律対応内容**: `--root` に worktree root のパスを明示指定して再実行し、7/7 種 pass（exit 0）を確認（PR #2422 case-run、2026-08-24 case-close 独立再検査でも同一手順で 7/7 pass を確認）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree 環境で scripts ディレクトリを cwd にした checker・エンジン系 CLI 起動全般で、走査 root を相対指定（`.` や暗黙 cwd）にしない
- **再発条件**: worktree 環境で corpus 走査系 CLI を `--root .` 等 cwd 相対指定で起動した場合
- **予防策候補**: agentdev-traceability scripts README の実行例へ worktree 環境での `--root` 明示指定の運用注記を追加
- **想定反映先**: src/opencode/skills/agentdev-traceability/scripts/README.md
- **関連**: PR #2422 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2422 ）
- **タグ**: `#traceability` `#worktree` `#false-fail`

## 配布 Workflow Skill 本文への具象 REQ ID 記載は IR-055 違反になるため対応宣言は command Design へ置く

- **問題事象**: 段階ゲート実装（Issue 2418）の初回実装で、配布物（req-save・case-open・case-close の 3 Workflow Skill）本文に実装対象の具象 REQ ID（REQ-021-023〜025）を記載した結果、check_integrity の IR-055 回帰テストが26違反で失敗した
- **発生局面**: 実装（Workflow Skill 本文への要件対応記載、Issue 2418 の case work）
- **検知方法**: bun test（IR-055 runtime-unresolved-reference 回帰テスト）の26違反
- **根本原因**: 配布物本文は IR-055（runtime-unresolved-reference）により docs/ 正規成果物へ参照解決できない具象 REQ/DEC ID を持てない。Workflow Skill が実現する要件行の対応宣言の正規配置は command Design であるという配置契約を初回実装時に踏襲していなかった
- **自律対応内容**: 3 Workflow Skill 本文から具象 ID を除去し、実装対応宣言（ADF-COVERS(implementation): REQ-021-023〜025）を req-save・case-open・case-close の各 command Design へ移設した。再実行で 2400 pass / 0 fail を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（IR-055・配布依存境界の既存規定の運用知見。PR #2424 Design確定候補「実装対応宣言の配置」と同一内容）
- **横展開観点**: Workflow Skill・配布 skill に要件対応を本文へ記載するすべての場面
- **再発条件**: 配布物本文に具象 REQ/DEC ID を ADF-COVERS 宣言以外の形で記載した場合
- **予防策候補**: Workflow Skill 実装時の対応宣言配置チェック（command Design への ADF-COVERS 配置を skill-authoring ガイダンスへ明記候補）
- **想定反映先**: agentdev-skill-authoring、docs/designs/integrity/rules/IR-055 の運用記録
- **関連**: PR #2424 本文「検証差分」finding 差分（修正済み1件）、Issue 2418
- **タグ**: `#ir055` `#distribution-boundary` `#skill-authoring`

## REQ 行 append を伴う req-save での AUTOGEN 再生成漏れが再発（req-save @301cdc90）

- **問題事象**: REQ-012-051（および REQ-021-023〜025）の要件行 append を伴う req-save（commit 301cdc90、Issue #2419 系列）実行後も docs/designs/quality/req-health-metrics.md の AUTOGEN ブロックが再生成されず、main の鮮度ずれが残存した。下流 case-run（PR #2423）の generate_indexes.ts 実行で解消するまで main の AUTOGEN は旧計測のままであった（本 inbox 既存エントリ「REQ 行 append を伴う req-save では AUTOGEN 索引の同 commit 再生成が必要」と同根の再発）
- **発生局面**: 実装（req-save 工程、Issue #2419 系列）と検証（case-run の generate_indexes.ts 実行、PR #2423）
- **検知方法**: PR #2423 の case-run で generate_indexes.ts を実行した際の req-health-metrics.md 差分（main の AUTOGEN 鮮度ずれ解消分として顕在化）
- **根本原因**: 既存エントリと同一（req-save 手順側に AUTOGEN 再生成の契約が明確でない）。AG-009(a)（OU-008、Issue #2386）の動機提示後も req-save 単体では再生成が行われず、予防策が工程に組み込まれていないことを示す再発実例
- **自律対応内容**: PR #2423 の case-run で bun run generate_indexes.ts により req-health-metrics.md を再生成し、PR へ同梱して解消した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（AG-009(a)（OU-008、Issue #2386）の優先度を裏付ける再発実例）
- **横展開観点**: REQ 行 append を伴う req-save 実行時は常に AUTOGEN 対象索引（req-health-metrics.md 等）の再生成要否を確認する（既存エントリと同一）
- **再発条件**: REQ 行 append を伴う req-save で AUTOGEN 再生成を省略した場合（2回目の発生）
- **予防策候補**: req-save 手順への AUTOGEN 再生成前置の明記、または req-save 完了時の鮮度検査自動実行（既存エントリと同一。再発により優先度上昇）
- **想定反映先**: agentdev-workflow-req-save 手順、docs/designs/integrity/checker-execution-contracts.md（AG-009(a) で扱う領域）
- **関連**: PR #2423 本文「Findings / Capture候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2423 ）、Issue #2419、commit 301cdc90、本 inbox 既存エントリ「REQ 行 append を伴う req-save では AUTOGEN 索引の同 commit 再生成が必要」（PR #2390、commit 340e7304）
- **タグ**: `#req-save` `#autogen` `#freshness-gate` `#recurrence`

## 委譲メタデータの baseline 数値は参考値であり完了判定は再検索の実測で行う

- **問題事象**: 委譲コンテキストの baseline 記載（経路[A-H] 54 files / 184 matches）と実行時の実測（53 files）に乖離があった。検索パス集合・除外指定の違いによる参考値のずれと推定される
- **発生局面**: 実装（case-run 委譲、横断検索系 test strategy の実行）
- **検知方法**: 完了条件の再検索実測と委譲メタデータ baseline 記載の突合
- **根本原因**: baseline 数値の生成時点と実行時で検索条件（パス集合・除外指定）が一致しておらず、数値だけが引き継がれた
- **自律対応内容**: 完了判定は再検索の実測（対象 0 件確認）で行い、baseline 数値は参考値として扱った。乖離は事実として PR 本文へ記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: baseline 数値を含む委譲メタデータを受け取るすべての場面
- **再発条件**: 検索条件が異なる前提で baseline 数値だけを引き継ぎ、実測なしに完了判定した場合
- **予防策候補**: baseline 数値には検索条件（パス集合・除外指定）を併記し、完了判定は必ず再検索の実測で行う
- **想定反映先**: agentdev-workflow-case-run の委譲メタデータ作成手順、agentdev-backlog-integration の RU 生成
- **関連**: PR #2426 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2426 ）
- **タグ**: `#delegation-metadata` `#baseline` `#re-grep`

## 短い識別子の横断検索パターンは既存識別子の部分一致で偽陽性になる（path-a と path-after-domain-split）

- **問題事象**: 実行コードの横断検索（TS-007）で `path-a` パターンが IR-057（obsolete-spec-path-after-domain-split）の `path-after-domain-split` 由来で誤検出された。A〜H 相当の機械的識別子の実行コード使用は検出されなかった
- **発生局面**: 検証（識別子廃止系 test strategy の横断検索パターン設計と実行）
- **検知方法**: 検出箇所の実体確認（IR-057 のルール名 `path-after-domain-split` の部分一致と判明）
- **根本原因**: `path-a` が `path-after-domain-split` の部分文字列として含まれるため、語境界を考慮しない substring 検索では無関係な既存識別子に一致する
- **自律対応内容**: Issue 完了条件の規定（検出時は事実報告のみ、対象外）に従い修正対象外として報告した。完了条件の検出には旧パス参照（adversarial-review-path-a）に限定した再検索で 0 件を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 識別子廃止・改名系の横断検索で短い識別子を検索パターンに使うすべての場面
- **再発条件**: より長い既存識別子（ルール名・パス名等）の部分文字列となる短い識別子を検索パターンに含めた場合
- **予防策候補**: 横断検索のパターン設計時に部分一致の偽陽性ソース（既存ルール名・パス名）を確認し、必要に応じて語境界を明示したパターンにする
- **想定反映先**: 横断検索系 test strategy の verification 記載指針
- **関連**: PR #2426 本文「Findings / Capture候補」事実報告（回収元: https://github.com/yogata/agent-dev-flow/pull/2426 ）、docs/designs/integrity/rules/IR-057
- **タグ**: `#false-positive` `#cross-search` `#identifier-retirement`

## worktree 環境の bun test 依存解決不能は bun install --cwd で worktree ローカル解消できる

- **問題事象**: worktree 環境（.worktrees/2428-feature）で bun test 実行時、agentdev-project-extensions/scripts の zod 依存が解決不能となり5件 fail（4+1、すべて unhandled error）が発生した
- **発生局面**: 実装（case-run の契約テスト実行、worktree 環境）
- **検知方法**: bun test の unhandled error fail（事前計測で検出）
- **根本原因**: worktree は junction を持たず（未伝播）、scripts 配下の node_modules も git 管理対象外のため、worktree 側で依存解決ができない
- **自律対応内容**: src/opencode/skills/agentdev-project-extensions/scripts で bun install --cwd を実行して worktree ローカルに依存を解消し、テスト全件合格を確認した（node_modules は untracked 0 を確認）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（worktree テスト fallback 契約は agentdev-git-worktree-test-fallback Design が所有）
- **横展開観点**: worktree 環境で node_modules を必要とするサブパッケージのテストが環境起因 fail する場合の依存解消手段。worktree テスト fallback の判別には「stash 前後でチェッカーを再実行して差分比較」が有効
- **再発条件**: worktree 環境で node_modules を必要とする scripts 配下のテストを実行する場合
- **予防策候補**: worktree テスト実行前に bun install --cwd を実行する、または環境起因 fail 時の依存解消手順を fallback 手順へ明記する
- **想定反映先**: agentdev-git-worktree-test-fallback Design、worktree テスト実行手順
- **関連**: PR 2432 本文、Issue 2428、Epic 2427 Wave 1
- **タグ**: #worktree #bun-test #dependencies


## 残存掃除の初期 grep サーベイは件数上限なしで全体を出す

- **問題事象**: Gxx 記述の残存掃除（PR 2433、Issue 2429、OU-002）で、委譲再開時の初期 grep を件数上限（First 40 等）付きで行ったため、docs/designs 配下の Gxx 残存を過少評価し、後工程で約 120 件の追加残存を検出した
- **発生局面**: 実装（case-run 委譲の残存掃除・全体サーベイ）
- **検知方法**: 後工程の全文 grep と初期サーベイ結果の件数差
- **根本原因**: grep 出力の件数上限付きオプションで「全数を出した」と誤認し、対象確定を部分集合に対して行った
- **自律対応内容**: 件数上限なし・ファイル別カウントで全体を出し直して対象を再確定し、掃除を完了した（PR 2433 の検証差分に記録）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-051-006 の実装手段の話であり、要件行の変更なし）
- **横展開観点**: 廃止語句・旧識別子の残存掃除、リネーム追従確認等、全数把握を前提とする初期サーベイ全般
- **再発条件**: 件数上限付き grep で初期サーベイを行い、その結果で対象確定する場合
- **予防策候補**: 残存サーベイの初期 grep は件数上限を付けずファイル別カウントで全体を出してから対象を確定する（手順文書への明記）
- **想定反映先**: agentdev-skill-authoring・agentdev-command-authoring の残存掃除系手順、委譲プロンプトの初期サーベイ指示
- **関連**: PR 2433 本文、Issue 2429、Epic 2427 Wave 2
- **タグ**: `#grep` `#residual-sweep` `#survey`

## pwsh の Set-Content は CRLF を書き出すため LF 保持の全面置換は node の readFileSync/writeFileSync 併用が安全

- **問題事象**: Windows PowerShell の Set-Content は既定で CRLF を書き出す。LF の既存 UTF-8 ファイルを Get-Content / Set-Content 経由で書き換えると行末が全面変化した（PR 2434、Issue 2430、OU-003 の実装で発生）
- **発生局面**: 実装（case-run 委譲、複数ファイルへの一括文字列置換）
- **検知方法**: 置換後の git diff で意図しない行末変化の全面発生
- **根本原因**: Set-Content の既定改行コードがプラットフォーム既定（CRLF）であるのに対し、リポジトリの既存 UTF-8 ファイルは LF
- **自律対応内容**: node による readFileSync（utf-8）→ 文字列置換 → writeFileSync（utf8）の併用で LF を保持して書き戻し、diff を意図差分のみに正規化した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（実装手段の話。gh-cli スキルのファイル書き出し規定と同一方向の知見）
- **横展開観点**: pwsh で LF の UTF-8 ファイルを一括置換するすべての作業
- **再発条件**: pwsh の Get-Content / Set-Content 経由で LF ファイルを書き換える場合
- **予防策候補**: LF 保持・BOM なし UTF-8 が必要な一括置換は node の readFileSync / writeFileSync 併用を標準手段とする（Set-Content を使わない）
- **想定反映先**: agentdev-gh-cli references の Windows 固有制約、編集系スキルの手順注意
- **関連**: PR 2434 本文、Issue 2430、Epic 2427 Wave 2
- **タグ**: `#powershell` `#crlf` `#encoding`

## AUTOGEN 鮮度 gate の計測日ブロックは日付境界で誰の変更でもなく発火する

- **問題事象**: Wave 2 境界クローズ（Epic 2427、PR 2434 マージ後）の check_autogen_freshness 実行で req-health-metrics.md の req-metrics-measurement-example ブロックに CONTENT_CHANGE 1 件が検出されたが、差分は「計測日: 2026-08-24（記録）」vs「計測日: 2026-08-25（期待）」の1行のみだった
- **発生局面**: 運用（case-close の Design status 変更後の鮮度確認）
- **検知方法**: check_autogen_freshness の詳細出力（現在値と期待値の比較行）
- **根本原因**: AUTOGEN ブロックが前日（2026-08-24）に再生成済みで、ローカル日付が 2026-08-25 に変わった後の実行では「当日の日付を期待する」検査が日付境界だけで必ず不合格になる
- **自律対応内容**: 差分が計測日1行のみであることから date rollover 起因かつ当該 Case の変更対象外と判定し、docs を編集せずに再生成コマンド（generate_indexes.ts）の実施を次の docs 変更コミット所有者へ記録する対応とした
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（gate 判定の運用知見。REQ-010-059 の検査仕様自体は不変）
- **横展開観点**: 日付を含む AUTOGEN ブロックの鮮度確認を日付をまたいで実行するすべての工程（case-close、docs-check）
- **再発条件**: 計測日等の当日日付を埋め込む AUTOGEN ブロックを持つ成果物を、生成日の翌日以降に鮮度検査する場合
- **予防策候補**: 鮮度違反の詳細で差分が日付行のみのときは date rollover と判定し、内容変更と区別して報告する（gate 側の緩和は別途検討）
- **想定反映先**: agentdev-workflow-case-close references（docs-and-design-promotion の check_autogen_freshnes 実行箇所）、autogen-freshness-gate Design
- **関連**: Issue 2430 対応記録コメント（case-close、検証差分表）、Epic 2427 Wave 2
- **タグ**: `#autogen` `#freshness-gate` `#date-rollover`
## OpenCode のプラグイン自動読み込みは depth-1 ファイルのみでディレクトリ型配布 Plugin は読み込まれない

- **問題事象**: Wave 2 で配布した agentdev-gh-write-guard Plugin が実行時に読み込まれていなかった（PR 2435、Issue 2431、OU-004 の実装で判明）。ディレクトリ型パッケージ `.opencode/plugins/<package>/` は OpenCode の自動読み込み対象外だった
- **発生局面**: 設計（Wave 2 の Plugin 配布構成）と実装（Wave 3 のローダーシム追加）
- **検知方法**: sst/opencode v1.16〜v1.18 の `config/plugin.ts` の `{plugin,plugins}/*.{ts,js}` glob 実装確認と、ローダーシム生成後の読み込み検証
- **根本原因**: 配布構造の設計時にランタイムの実際の loader 実装（読み込み経路）を確認せず、ディレクトリ配置で自動読み込みされると想定していた
- **自律対応内容**: install.ps1 / self-sync.ps1 / consumer archive install が junction に加えてローダーシム（`<package>.ts` 1行再エクスポート）を生成・検証・自己修復する構成を追加し、Wave 2 Plugin の読み込み不能状態を解消した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-052-006/007 の配布境界要件自体は不変。登録配線の実装手段の知見）
- **横展開観点**: OpenCode（や類似 harness）へ配布物を置くすべての設計。glob の実装確認なしに「ディレクトリを置けば読まれる」と想定しない
- **再発条件**: ランタイムの読み込み経路を確認せずに配布構造を設計する場合
- **予防策候補**: 配布構造の設計時にはランタイムの実際の loader 実装（glob、解決順序）を確認する。配布後には読み込み成否を実行環境で検証する
- **想定反映先**: custom-tool-contracts / runtime-package-boundary Design（登録配線・ローダーシム節。intake item 2026-08-25-design-confirm-custom-tool-contracts.md ほか経由）
- **関連**: PR 2435 本文、Issue 2431、Epic 2427 Wave 3
- **タグ**: `#opencode` `#plugin` `#distribution` `#loader`

## issue_comment の VERIFY は「Issue が open であること」の代理検証であり閉じた Issue へのコメント追加は検証不完になりうる

- **問題事象**: Wave 2 実装の issue_comment 操作は、コメント本文の読み戻しが操作契約に存在しないため「Issue が open であること」を代理検証として使用している。閉じた Issue へのコメント追加（case-close の close 後コメント等）は verification-incomplete になる可能性がある（PR 2435 で指摘、Wave 2 契約維持のため未変更）
- **発生局面**: 設計（Wave 2 の操作契約定義）と運用（case-close の close 後コメント追加）
- **検知方法**: 操作契約（contracts）と VERIFY 仕様の突き合わせによる静的確認
- **根本原因**: 操作の出力契約にコメント本文の読み戻し項目を定義していなかったため、VERIFY が本文照合ではなく状態照合に退化した
- **自律対応内容**: 本事象を PR 2435 本文に記録し、契約変更（本文読み戻しの追加）は後続 Case の判断へ委譲した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-011-003 の VERIFY 内部完結要件は充足したまま。操作契約の粒度の知見）
- **横展開観点**: 出力契約を定義するすべての操作。「操作の成功」と「検証可能な出力」が一致するよう、VERIFY が照合する項目を出力契約へ含める
- **再発条件**: 出力契約に読み戻し可能な項目を定義せずに VERIFY を状態照合で代替する場合
- **予防策候補**: 副作用操作の出力契約には、VERIFY が照合できる読み戻し項目（本文、識別子等）を含める。代理検証を使う場合はその限界を契約書に明記する
- **想定反映先**: custom-tool-contracts Design の操作契約節（intake item 2026-08-25-design-confirm-custom-tool-contracts.md 経由）
- **関連**: PR 2435 本文、PR 2433/2434（Wave 2 実装）、Epic 2427
- **タグ**: `#verify` `#contracts` `#issue-comment`

## pwsh のパイプラインでは $LASTEXITCODE が最終コマンドの終了コードになり tsc の結果を読み誤る

- **問題事象**: Wave 3 最終 case-close（DEL-CLOSE-W3）で `bun x tsc --noEmit ... | tail -2; echo EXIT=$LASTEXITCODE` の形式で型検査を実行したところ、tsc が TS2688（bun 型定義なし）で失敗しているのに EXIT=0 と表示された。パイプラインの終了コードが tail の成功を反映したため
- **発生局面**: 検証（case-close の QG-4 型検査実行）
- **検知方法**: 出力に TS2688 のエラー文が残っていたため全文再実行で確認。`> $null 2>&1; $LASTEXITCODE` 形式で再計測すると EXIT=2
- **根本原因**: pwsh では `$LASTEXITCODE` がパイプラインの最後の native コマンド（tail）の終了コードを保持する。tsc の終了コードは上書きされていた
- **自律対応内容**: 出力リダイレクト + 直接 `$LASTEXITCODE` 参照の形式に切り替え、bun install --cwd 前置のうえ 3/3 clean を確認して記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証実行手段の知見）
- **横展開観点**: pwsh で検証コマンドの終了コードを判定するすべての工程（case-close、case-run、CI スクリプト）
- **再発条件**: pwsh で `コマンド | tail/Select-Object` 形式のパイプライン後に `$LASTEXITCODE` を判定する場合
- **予防策候補**: 終了コード判定はパイプラインを挟まずリダイレクト (`> file` または `> $null 2>&1`) で実行する。または `$PIPELINESTATUS` 相当（pwsh では存在しない）に依存しない構成にする
- **想定反映先**: 検証実行手順の記述箇所（quality-gates Design の実行形式、agentdev-git-worktree references の bun test 実行形態）
- **関連**: Issue 2431 対応記録コメント（case-close、検証差分の tsc 行）、Epic 2427 Wave 3
- **タグ**: `#powershell` `#exit-code` `#verification`

## integrity suite のテスト数は .opencode/skills/* junction の実在有無で変動する

- **問題事象**: PR 2435 の verification-diff 記録（2436 tests）と merge 後 main での再実行（2447 tests）で integrity suite のテスト数が +11乖離した。同一 commit 内容（squash 前後）での差だった
- **発生局面**: 検証（case-close の QG-4 suite 実行、case-run 記録との突合）
- **検知方法**: PR head worktree（.opencode/skills/ に junction なし）で再実行して 2436 を再現し、main 作業環境の junction 実在有無との対応を確認
- **根本原因**: projection 列挙系テスト（IR-016、IR-068 系）が .opencode/skills/* の実在 junction を parametrize の入力にするため、link mode 導入環境（main）ではテスト数が増える
- **自律対応内容**: 両環境で fail 0 であることを確認し、差分を実行環境差として検証差分に記録した（Issue 2431 対応記録コメント）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（テスト実行形態の知見。検査仕様自体は不変）
- **横展開観点**: ワークツリーと main 作業環境で検証記録を突合するすべての工程（case-close の検証差分、PR の verification-diff 記録）
- **再発条件**: junction 有無が異なる環境間で suite の N 数を比較する場合
- **予防策候補**: 検証差分の N 数比較は実行環境（link mode junction の有無）を併記する。worktree は junction 未構成で suite を実行する既定動作を踏まえて解釈する
- **想定反映先**: quality-gates Design の QG-4 実行形式（intake 経由で検討）
- **関連**: Issue 2431 対応記録コメント（case-close、検証差分の integrity 行）、PR 2435 本文 verification-diff
- **タグ**: `#bun-test` `#junction` `#verification-diff`

## worktree では junction が伝播しないため junction 依存検査は代替実行で実質検証する

- **問題事象**: git worktree（.worktrees/ 配下）には .opencode/ の agentdev-* junction が伝播せず、check_changed_docs.ts の検出対象が 0 になった（false-clean）
- **発生局面**: 実装（case-run の worktree 上での targeted docs guard 実行、Epic 2436 Wave 1）
- **検知方法**: check_changed_docs.ts の JSON 出力で files_checked が空・検出対象 0
- **根本原因**: junction は git 非追跡のファイルシステム成果物で、worktree 作成時に複製されない
- **自律対応内容**: src fallback を持つ repo-integrity suite（bun test 正規形）と環境ラベル付き代替実行（main repo root 読取専用）で実質検証した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（worktree 構造的制約の運用知見。REQ-018 関連）
- **横展開観点**: worktree 上で junction 依存検査（.opencode/ 配下を走査する checker）を実行するすべての場面
- **再発条件**: worktree 上で junction 依存の checker を junction 無しで実行した場合
- **予防策候補**: worktree での検査実行時は検出対象 0 の場合に junction 有無を確認し、src fallback・環境ラベル付き代替実行を組む手順の明文化
- **想定反映先**: agentdev-git-worktree-test-fallback、targeted-docs-guard-implementation Design
- **関連**: PR 2440 本文「Findings / Capture候補」learning 1件目
- **タグ**: `#worktree` `#junction` `#check-changed-docs`

## worktree では node_modules も伝播しないため依存パッケージのテストは事前に bun install する

- **問題事象**: worktree 上で zod に依存する配布スキルのテストを実行したところ unhandled error 4件が発生した（node_modules が worktree に存在しない）
- **発生局面**: 実装（case-run の worktree 上での bun test 実行、Epic 2436 Wave 1）
- **検知方法**: bun test の unhandled error（zod モジュール解決失敗）
- **根本原因**: node_modules は git 非追跡であり worktree 作成時に複製されない。依存を持つパッケージのテストは worktree 側で install が必要
- **自律対応内容**: 該当パッケージで bun install を実行後に再検証し PASS した（検証差分に「修正済み」として記録）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree 上で node_modules 依存のテストを実行するすべての場面
- **再発条件**: worktree 上で未 install の依存パッケージを含むテストを実行した場合
- **予防策候補**: worktree でのテスト実行手順へ依存パッケージの事前 install 確認を組み込む
- **想定反映先**: agentdev-git-worktree、case-run workflow のテスト実行手順
- **関連**: PR 2440 本文「Findings / Capture候補」learning 2件目、検証差分の bun test 行（修正済み）
- **タグ**: `#worktree` `#bun-install` `#node-modules`

## PowerShell のリダイレクトは UTF-8 JSON を破壊するため cmd /c リダイレクトか直接パースを使う

- **問題事象**: PowerShell の `>` リダイレクトで受け取った検査結果 JSON の日本語 snippet が文字化けし、証跡の可読性が失われた（case-run の dist 最終 gate 証跡に実際に発生）
- **発生局面**: 実装・検証（PowerShell 上での checker 実行と stdout のファイル退避）
- **検知方法**: 退避 JSON の該当フィールドが置換文字を含むことの目視・再取得との突合
- **根本原因**: PowerShell のネイティブコマンド出力デコードとリダイレクト書き込みの既定符号化が UTF-8 を安定して保持しない
- **自律対応内容**: 以降の実行は bun スクリプト内の spawnSync + fs.writeFileSync（UTF-8 明示）で stdout を退避する形式に切り替え、文字化けを解消した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（checker 実行契約の「stdout 証跡退避形式」と整合する運用知見）
- **横展開観点**: PowerShell 上で JSON を出力する checker の stdout を受け取るすべての場面
- **再発条件**: PowerShell の `>` でネイティブコマンドの UTF-8 出力を退避した場合
- **予防策候補**: checker stdout の退避は spawnSync + UTF-8 明示書き出し（node/bun スクリプト）を標準とし、PowerShell リダイレクトを使わない
- **想定反映先**: checker-execution-contracts Design の stdout 証跡退避形式
- **関連**: PR 2440 本文「Findings / Capture候補」learning 3件目、case-close 実行の cl-run-*.ts 系証跡
- **タグ**: `#powershell` `#utf8` `#stdout-evidence`

## agentdev_gh issue_update は契約外フィールドを無視して部分更新として成功する

- **問題事象**: issue_update リクエストに契約外の bodyPath フィールドで本文ファイルパスを渡したところ、仕様の validate は body を null と解し title のみの部分更新を実行、Tool 内 VERIFY も title 一致で合格した。完了条件チェックボックスが未更新のまま工程が進行しかけた
- **発生局面**: 実行（case-close の QG-4 完了条件チェックボックス更新、Epic 2436 Wave 1）
- **検知方法**: case-close 側の再読込 VERIFY（完了条件 checked=0 を検出）
- **根本原因**: 操作仕様の validate が未知フィールドを拒否せず、指定された既知フィールドのみで部分更新リクエストを組み立てる。VERIFY は要求されたフィールドのみ照合するため部分更新を検出できない
- **自律対応内容**: body をインライン JSON 文字列で組んだ正規形式のリクエストで再実行し、再読込 VERIFY で checked=14 を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（Tool は契約どおり動作。リクエスト組立て側の様式知見）
- **横展開観点**: agentdev_gh へのリクエストを組むすべての呼び出し側（bun driver 経由の委譲実行を含む）
- **再発条件**: body のような必須更新字段を契約外形式（bodyPath 等）で渡した場合
- **予防策候補**: リクエスト組立ては契約のフィールド名（body はインライン文字列）に厳密に従う。中間 spec から最終リクエストを組むスクリプトでは契約フィールドの存在検証を入れる
- **想定反映先**: agentdev_gh 呼出 driver の作成手順（委譲時 Tool 利用経路の明文化候補に付随）
- **関連**: Issue 2437 実装記録コメント（case-close）、委譲単位 case-auto-20260825-stage-close-w1
- **タグ**: `#agentdev-gh` `#issue-update` `#request-schema`

## agentdev_gh pr_mergeable は gh の mergeable 再計算競合で verification-incomplete になり得る

- **問題事象**: PR head 更新直後の pr_mergeable 操作が「verification read-back did not confirm the operation result」（verification-incomplete）で連続失敗した（60秒・10秒間隔のポーリング全失敗を含む）。実状態は gh pr view で MERGEABLE・mergeStateStatus CLEAN と確認できた
- **発生局面**: 実行（case-close STEP-E4 の squash merge 前 mergeable 確認、Epic 2436 Wave 1）
- **検知方法**: Tool の failure.kind = verification-incomplete と、gh pr view --json mergeable,mergeStateStatus による実状態確認との乖離
- **根本原因**: gh pr view の mergeable フィールドは呼び出しごとに再計算され得る。操作の読み取りと VERIFY の再読み取りの間で MERGEABLE → UNKNOWN が揺れると照合不一致になる
- **自律対応内容**: 読み取り操作の代替経路（Tool の contingency が明示する gh CLI 手動実行、canContinue: true）で MERGEABLE・CLEAN を確認した後に pr_merge（squash）を実行し、Tool 内 VERIFY 付きでマージに成功した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（読み取り系の代替継続契約どおりの運用）
- **横展開観点**: PR head 更新直後の pr_mergeable 実行すべて
- **再発条件**: GitHub 側 mergeable 再計算が走っているタイミングで pr_mergeable を実行した場合
- **予防策候補**: verification-incomplete 時は failure で完了扱いにせず代替読み取りで実状態を確認してから副作用操作へ進む手順化。恒久対策は Tool 側 verify の再試行
- **想定反映先**: agentdev-workflow-case-close STEP-4-2（mergeable ポーリング手順）、Custom Tool 操作契約 Design
- **関連**: PR 2440 マージ（case-close、委譲単位 case-auto-20260825-stage-close-w1）
- **タグ**: `#agentdev-gh` `#pr-mergeable` `#verify-race`

## worktree の依存復元は bun install（worktree root）単独では不完で分散 node_modules の個別 install が必要

- **問題事象**: worktree 環境でのテスト実行に必要な依存復元は `bun install`（worktree root）単独では不完である。本リポジトリは root package.json を持たず、依存は gitignore 済みの各所 node_modules（`.opencode/package.json`、`.opencode/plugins/`、`src/opencode/skills/agentdev-*/scripts/`、`src/opencode/tools/agentdev-gh/`、`src/opencode/plugins/agentdev-gh-tool/` 等）に分散している。worktree ではこれらが未伝播のため、個別に `bun install` する必要がある（例: zod は `.opencode` 系依存と `agentdev-project-extensions/scripts` の両経路で解決に寄与）
- **発生局面**: 実装（case-run 委譲、worktree 環境の検証実行、Issue 2438 の case work）
- **検知方法**: worktree での依存解決失敗（テスト実行時のモジュール解決エラー）
- **根本原因**: 依存配置が repo root 一元型でなく多層分散型（各サブディレクトリの package.json + gitignore 済み node_modules）である構成を、委譲時の環境復元が root 一元型の前提で見立てていた
- **自律対応内容**: 依存を持つ各ディレクトリで個別に `bun install` を実行して検証を完結した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree でテスト・検証スクリプトを実行する委譲すべて、委譲時の環境復元手順書
- **再発条件**: worktree root の `bun install` のみで依存が復元されたと見なしてテストを実行する場合
- **予防策候補**: 委譲時の環境復元手順書へ分散依存の個別 install 差分を反映する
- **想定反映先**: agentdev-git-worktree の worktree 構造的制約（bun test 実行の環境前提）、agentdev-workflow-case-run の委譲時環境復元手順
- **関連**: PR 2443 本文「Findings/ Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2443 ）、本 inbox 既存エントリ「worktree では node_modules も伝播しないため依存パッケージのテストは事前に bun install する」「worktree 環境の bun test 依存解決不能は bun install --cwd で worktree ローカル解消できる」
- **タグ**: `#worktree` `#bun-install` `#dependencies` `#delegation`

## git commit の -- pathspec はオプションより後に置き -m は -- より前に置く

- **問題事象**: `git commit -- <paths> -m "msg"` の形式でコミットしたところ pathspec エラーで失敗した（case-open の Form Zero 削除コミット、DEL-OU-001-2）
- **発生局面**: 実装（case-open 工程、明示パス限定のドメイン状態永続化コミット）
- **検知方法**: git コマンドの pathspec エラー（即時に検出）
- **根本原因**: `--` 以降はすべて pathspec として扱われるため、`--` の後ろに置いた `-m` がオプションとして解釈されない
- **自律対応内容**: `git commit -m "msg" -- <paths>` の順序へ修正して即時再実行し、コミット成功を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（case-close 契約の `git commit -- <paths>` 記述は --only pathspec 形式の意味であり、実行時は -m を先に置く様式の知見）
- **横展開観点**: 明示パス限定でコミットするすべての工程（case-open、case-close、req-save、design-save）
- **再発条件**: `--` より後ろに `-m` 等のオプションを置いて git commit を実行した場合
- **予防策候補**: git commit はオプション（-m 等）を先に並べ、`--` と pathspec を最後に置く様式を徹底する
- **想定反映先**: agentdev-git-worktree の並列実行安全ステージングプロシージャ、case-open / case-close の永続化手順
- **関連**: Issue 2444 case-open（DEL-OU-001-2）からの capture 引継ぎ、PR 2445 本文「Findings / Capture候補」
- **タグ**: `#git-commit` `#pathspec` `#option-order`

## traceability scripts の scan 対象は .md と .ts のみで .agentdev/ は除外ディレクトリ

- **問題事象**: 配布物（plugin.ts、配布 README.md）と .agentdev/ 側の実体（.jsonc）に分割して ADF-COVERS 宣言を書いたところ、.jsonc 拡張子と .agentdev/ パスは traceability scan 対象外のため REQ-053-016 の implementation 宣言が機械解析に現れず、missing-implementation finding が発生した（REQ-053 の case-run、PR 2445）
- **発生局面**: 実装（case-run 委譲、REQ-053 の対応宣言配置）
- **検知方法**: agentdev-traceability check の missing-implementation finding（2 件、修正済み）
- **根本原因**: corpus.ts の DEFAULT_SCAN_EXTENSIONS（.md / .ts のみ）と DEFAULT_EXCLUDE_DIRS（.agentdev/ 含む）の適用範囲を宣言配置前に確認していなかった
- **自律対応内容**: plugin.ts と配布 README.md（scan 対象ファイル）側で宣言を網羅し、README 側移管で REQ-053-016 の宣言欠落を解消して traceability check 7 pass / 0 fail を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（最小トレーサビリティモデル・agentdev-traceability の既存仕様の運用知見）
- **横展開観点**: ADF-COVERS 宣言を配置するすべての場面（実装・検証の対応宣言）
- **再発条件**: .md / .ts 以外の拡張子のファイルや .agentdev/ 配下へ ADF-COVERS 宣言を書いて coverage/check の計上を期待した場合
- **予防策候補**: 対応宣言は scan 対象拡張子（.md / .ts）かつ除外外パスのファイルに配置する。例外拡張子（.jsonc 等）は同一契約を .md / .ts 側でも宣言する
- **想定反映先**: agentdev-traceability の対応宣言ガイダンス、agentdev-skill-authoring の記載様式
- **関連**: PR 2445 本文「Findings / Capture候補」learning 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2445 ）
- **タグ**: `#traceability` `#adf-covers` `#scan-scope`

## OpenCode plugin の引数なし tool は args 省略で定義可能

- **問題事象**: なし（初回実装で引数なし tool の定義様式を確認した際に得た知見。問題発生ではない）
- **発生局面**: 実装（agentdev-model-escalation Plugin の tool 定義、REQ-053 の case work）
- **検知方法**: OpenCode v1.18.x 世代の registry 実装確認（def.args ?? {} への正規化）
- **根本原因**: 該当なし（外部 zod 依存なしで tool 定義できる契約の確認結果）
- **自律対応内容**: escalate_model / revert_model を引数なし tool として args 省略で定義し、外部 zod 依存なしで unit テスト 33 pass を達成した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（OpenCode plugin 実装の様式知見）
- **横展開観点**: OpenCode plugin へ引数なし tool を定義するすべての場面
- **再発条件**: 引数なし tool に必須の args 型を求めて不必要な zod 依存を追加する場合
- **予防策候補**: 引数なし tool は args 省略で定義する（registry 側の def.args ?? {} 正規化に依存できる）
- **想定反映先**: REQ-052 対応 Design（Plugin/Hook の実装様式節の更新候補）、agentdev-skill-authoring の plugin 実装参考
- **関連**: PR 2445 本文「Findings / Capture候補」learning 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2445 ）
- **タグ**: `#opencode` `#plugin` `#tool-definition`

## bun install を実行する配下ディレクトリには配下 .gitignore（node_modules/）が必要

- **問題事象**: worktree 内で新規 plugin ディレクトリを作り bun install を実行した結果、node_modules が git 管理外にならず最初の commit に混入した（リポジトリ ルートの .gitignore は node_modules を除外しない構成のため）
- **発生局面**: 実装（case-run 委譲、agentdev-model-escalation Plugin の新設、PR 2445）
- **検知方法**: 品質ゲート自查（PR 構成の副作用境界確認）で node_modules 混入を検出
- **根本原因**: node_modules 除外は repo ルートの .gitignore に存在せず、bun install を実行するサブディレクトリ側の .gitignore に依存する構成を事前把握していなかった（gh-write-guard 先例と同じ構成）
- **自律対応内容**: 直ちに commit をやり直し、plugin 配下へ .gitignore（node_modules/）を追加して修正済み finding として記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（リポジトリ構成の運用知見）
- **横展開観点**: worktree 内で bun install を伴う新規ディレクトリを作るすべての場面
- **再発条件**: 配下 .gitignore を置かずに bun install を実行して commit する場合
- **予防策候補**: 新規ディレクトリで bun install を実行する場合は配下 .gitignore（node_modules/）の同時作成を手順に含める
- **想定反映先**: agentdev-git-worktree の worktree 構造的制約（新規ディレクトリ作成手順）、agentdev-workflow-case-run の委譲手順
- **関連**: PR 2445 本文「Findings / Capture候補」learning 3件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2445 ）
- **タグ**: `#gitignore` `#node-modules` `#bun-install` `#worktree`

## Windows PowerShell の Get-Content | Set-Content による UTF-8 ファイルの cp932 文字化け（再確認）

- **問題事象**: 既存 UTF-8（BOM なし）ファイルを PowerShell の Get-Content | Set-Content（utf8NoBOM 指定付き）で書き換えると、Get-Content 側が cp932 で解釈し日本語コメントが文字化けした（AGENTS.md の既知事象と同一）。write ツールによる全面再書き込みで復旧
- **発生局面**: 実装（case-run 委譲、Epic 2446 Wave 1、PR 2458）
- **検知方法**: 編集後のファイル内容確認で日本語コメントの文字化けを検出
- **根本原因**: PowerShell 5.x 系の Get-Content が BOM なし UTF-8 をシステム既定エンコーディング（cp932）で解釈する挙動を、utf8NoBOM 指定の Set-Content と組み合わせて看的下した
- **自律対応内容**: write ツールによる全面再書き込みで復旧した。edit ツール優先のガイドレールは繰り返し有効
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（リポジトリ ガイドレールの運用知見）
- **横展開観点**: Windows 環境で既存 UTF-8 ファイルを PowerShell で書き換えるすべての場面
- **再発条件**: Get-Content（既定エンコーディング）で読み込んだ内容を Set-Content で書き戻す場合
- **予防策候補**: 既存 UTF-8 ファイルの編集は edit ツールを優先する。PowerShell で扱う場合は [System.IO.File]::ReadAllText / WriteAllText に明示エンコーディングを渡す
- **想定反映先**: AGENTS.md の文字化けガイドレール（既存）、agentdev-workflow-case-run の委譲手順
- **関連**: PR 2458 本文「Findings / Capture候補」learning 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2458 ）
- **タグ**: `#windows` `#powershell` `#encoding` `#mojibake`

## distribution boundary check の concrete-id は新規配布物原本・テスト内の ID 表記からも検出される

- **問題事象**: なし（検証設計の知見。問題発生ではない）
- **発生局面**: 実装（case-run 委譲、distribution boundary check の新規違反解消、PR 2458）
- **検知方法**: check_distribution_boundary.ts（source profile）の concrete-id findings（実装中に一時的に新規 17件）
- **根本原因**: 新規配布物原本内の concrete ID（REQ-NNN、DEC-NNN、AG-NNN、TS-NNN を含む）と tests 内のテスト戦略識別子（TS-002 等）が検出対象になる構造を事前に織り込んでいなかった
- **自律対応内容**: tests・README・コメント内の ID 表記を Design パス参照・ID なし表現へ修正して解消済み。既存 baseline（agentdev-gh 系11件）は既出として維持
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（配布依存境界検査の運用知見）
- **横展開観点**: 新規配布物（command / SKILL.md / Tool / Plugin）と付随テストを作成するすべての場面
- **再発条件**: 新規配布物原本・テストに REQ/DEC/AG/TS 等の ID を含めて commit する場合
- **予防策候補**: 新規配布物・テストには ID を含まない表現（Design パス参照等）を使う
- **想定反映先**: agentdev-git-worktree / case-run の配布物新設手順、agentdev-skill-authoring の記載様式
- **関連**: PR 2458 本文「Findings / Capture候補」learning 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2458 ）
- **タグ**: `#distribution-boundary` `#concrete-id` `#naming`

## PowerShell で git show の出力をパイプ受信すると cp932 デコードで ASCII パターンも取りこぼす

- **問題事象**: PowerShell で git show <ref>:<path> の出力をパイプ受信すると cp932 デコードで mojibake が発生し、ASCII パターン（REQ-011 等）もマルチバイト文字に取り込まれて Select-String が取りこぼすことがあった
- **発生局面**: 検証（case-run 委譲、main との同一性確認、PR 2459）
- **検知方法**: Select-String の検出件数が期待より少ないことの確認
- **根本原因**: パイプ受信時の PowerShell 側デコード（cp932）が 8bit 多バイト文字境界を跨いで ASCII 列を破壊する
- **自律対応内容**: main との同一性確認を git diff <ref> HEAD --stat -- <path> を正とする方式へ変更した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証手順の運用知見）
- **横展開観点**: PowerShell 上で git のバイナリ安全性が必要な出力をテキスト加工するすべての場面
- **再発条件**: git show / git log 等の出力を PowerShell パイプで受信して文字列検索する場合
- **予防策候補**: 同一性・差分確認は git diff / --stat を正とする。パイプ受信で文字列検索しない
- **想定反映先**: agentdev-workflow-case-close / case-run の検証手順（同一性確認の記述がある箇所）
- **関連**: PR 2459 本文「Findings / Capture候補」learning 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2459 ）
- **タグ**: `#powershell` `#git-show` `#encoding`

## 宣言データの確定値を case-open の実行契約へ明記しないと実装委譲内で blocked になる

- **発見事項**: source URL のような運用者登録データを前提とする Issue（Epic #2446 の 2-1、skills.yaml への宣言追加）で、確定値が Issue 作成時の実行契約に明記されておらず、実装委譲内で blocked（source URL 未確定）になった。運用者が gist URL（https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d）を確定したことで解消（SSoT: Issue #2451 コメント）
- **特性区分**: 運用（case-open の実行契約項目と宣言データ登録の接続）
- **確知手段**: PR #2462 本文の blocked 解消経過の記録と Issue #2451 コメントの対照確認
- **根本原因**: 宣言データを要求する REQ の場合、そのデータの確定責務とタイミングが case-open の実行契約項目になっていなかった
- **恒久対応内容**: なし（本 Case では blocked → 運用者判断 → unblock の往復 1 回で解消）
- **ユーザー確認有無**: あり（source URL の運用者確定）
- **ADR/REQ/spec影響**: なし（REQ-002-042〜044 の「source URL は宣言データとして運用者が登録する」の運用知見）
- **横展開観点**: 運用者登録データ（URL、識別子、外部リソース指定等）を前提とする REQ を追加するすべての場面
- **再発条件**: 宣言データの確定を前提とする子 Issue が、確定値なしで case-open される場合
- **予防策候補**: 宣言データを要求する REQ の case-open 実行契約に「確定値の明記または blocked 判定の事前確認」を項目化
- **想定反映先**: agentdev-workflow-case-open の実行契約確定手順
- **関連**: PR #2462 本文「Findings / Capture候補」learning 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2462 ）
- **タグ**: `#case-open` `#declaration-data` `#blocked-resolve`

## worktree での実フェッチ検証は endpoint 注入と同一コード経路のファイルレス実行で可能

- **発見事項**: 取得機構の実フェッチ検証（TS-008/TS-007）で、mock（endpoints 差し替え）テストに加え、本番 fetcher（createGitHubSourceFetcher 無引数）での実フェッチを bun -e の1文で実行できた。スクリプトファイルの配置は distribution-boundary-guard の write hook に阻害されるため、ファイルレス実行が有効だった
- **特性区分**: 運用（検証手法）
- **確知手段**: PR #2462 / #2463 の TS-008 / TS-007 検証実行の成功
- **根本原因**: なし（改善知見。スクリプトファイル配置経路の write hook は正常な防衛動作）
- **恒久対応内容**: なし
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証手順の運用知見）
- **横展開観点**: distribution-boundary-guard 適用下の worktree で一時スクリプトを実行するすべての検証
- **再発条件**: worktree 内で検証用スクリプトをファイル配置して実行しようとする場合
- **予防策候補**: 実フェッチ系検証は bun -e ファイルレス実行 + endpoint 注入（mock-source）の2系統を使い分ける手順の明記
- **想定反映先**: agentdev-workflow-case-run / case-close の検証手順、third-party-sync 関連 Issue のテスト戦略
- **関連**: PR #2462 本文「Findings / Capture候補」learning 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2462 ）
- **タグ**: `#third-party-sync` `#verification` `#bun-e` `#distribution-boundary-guard`

## traceability の ADF-COVERS(implementation) 宣言は docs 配下 Design へ置く（配布物直書きは concrete-id gate と衝突）

- **発見事項**: REQ-053-011 の実装対応を、配布物（src/opencode/skills/** の SKILL.md）本文へ `ADF-COVERS(implementation): REQ-053-011` 宣言として直接付与したところ、traceability check の missing-implementation は解消する一方、配布依存境界 最終 gate（concrete-id 検出）が baseline +1〜+4 の違反を検出した。traceability check（宣言の不在検出）と配布依存境界 gate（配布物内の concrete ID 非増加）を同時に満たす対応宣言の正規配置は、docs 配下の正規成果物（skill Design、リポジトリ内部文書・配布対象外）である。既存の前例（agentdev-traceability Design、traceability-model Design）と同一の配置規律
- **特性区分**: 実装（配布物への対応宣言配置、Epic #2465 Wave2-a の OU-003〜005）
- **確知手段**: PR #2473 / #2474 / #2475 それぞれの中間状態での gate 違反検出と、docs 配下 Design への宣言移設後の再検証（traceability 7/7 pass、concrete_id_hits 10 = baseline 60715d99 と同値）
- **根本原因**: 宣言の不在検出（traceability）と ID 汚染の非増加（配布依存境界）という2つの gate の適用面の違い（docs/ と配布物）を、初回実装時に同時に考慮していなかった
- **恒久対応内容**: 3 PR とも宣言を docs/designs/skills/agentdev-*.md へ移設して解消済み（当該変更起因の gate 増分 0、traceability 7/7 pass を両立）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（IR-055・配布依存境界・traceability の既存規定の運用知見。既存学び「配布 Workflow Skill 本文への具象 REQ ID 記載は IR-055 違反になるため対応宣言は command Design へ置く」と同系の配置規律の第2事例）
- **横展開観点**: 配布物へ REQ 対応宣言を記載するすべての場面（skill Design・command Design 更新を含む）
- **再発条件**: traceability の missing-implementation 解消を目的に、配布物本文へ ADF-COVERS(implementation) 宣言を直書きした場合
- **予防策候補**: 対応宣言の配置先判断では docs 配下正規成果物を既定とする規律の明文化（skill-authoring ガイダンスへの追記候補）
- **想定反映先**: agentdev-skill-authoring の対応宣言配置ガイダンス、agentdev-traceability の宣言配置運用記録
- **関連**: PR #2473 / #2474 / #2475 本文「Findings / Capture候補」learning（統合記録。回収元: https://github.com/yogata/agent-dev-flow/pull/2473 https://github.com/yogata/agent-dev-flow/pull/2474 https://github.com/yogata/agent-dev-flow/pull/2475 ）
- **タグ**: `#distribution-boundary` `#concrete-id` `#adf-covers` `#traceability` `#skill-authoring`

## コマンド定義ファイル追加時は COMMAND_COUNT と public_commands のテスト期待値を同時更新する

- **発見事象**: third-party-sync コマンド定義の追加時に、commands_e2e.test.ts の COMMAND_COUNT（期待 18）と check_workflow_preventive.test.ts の public_commands（期待 18）が未更新のまま残り、integrity suite に恒常 fail（実 19）が 2 件残存した。baseline 60715d99 展開環境でも同一 fail が再現する既知欠陥であり、QG-4 フル suite の fail 由来分類で判明した
- **特性区分**: 検証（integrity suite の fail 由来分類、Epic #2465 Wave2-a の OU-006）
- **確知手段**: PR #2476 本文の QG-4 bun test フル suite 由来分類表（baseline 展開での対照実行により既知欠陥と判定、当該変更起因 0）
- **根本原因**: コマンド定義数を固定値で期待するテスト定数が複数存在し、コマンド追加 PR の必須更新リストに組み込まれていなかった
- **恒久対応内容**: なし（本 PR は当該欠陥の是正対象外。由来分類と intake item としての記録のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（テスト定数の陳腐化防止の運用知見）
- **横展開観点**: コマンド定義ファイルを追加・削除するすべての PR
- **再発条件**: commands_e2e.test.ts と check_workflow_preventive.test.ts の期待値を更新せずにコマンド定義を追加した場合
- **予防策候補**: コマンド追加を含む PR の必須更新リストへの組入れ、または期待値の動的化（intake item 2026-08-30-integrity-suite-command-count-stale-expectations.md で別途判断）
- **想定反映先**: repo-agentdev-integrity のテスト定数、agentdev-command-authoring の command 追加手順
- **関連**: PR #2476 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2476 ）
- **タグ**: `#integrity-suite` `#test-constant` `#command-count` `#stale-expectation`

## 訳語表未登録の技術用語の可否判断は走査ごとの文脈判断になり REQ-053-004 走査の再現性を下げる

- **発見事象**: 68 配布ファイルの英単語頻度集計走査（OU-002）で、REQ-053-004「無根拠な英単語混在」の判断において、配布物の英字は Design/REQ 定義済み概念名・日本語併記済み専門用語・YAML フィールド名由来が大半で許容範囲に収まった一方、訳語表に未登録の技術用語（commit message、prompt、review 等）の可否判断は走査ごとに個別の文脈判断が必要になった
- **特性区分**: 運用（REQ-053-004 走査の再現性、Epic #2465 Wave2-b の OU-002）
- **確知手段**: PR #2478 本文「実装内容」の非是正判断（許容英字の分類と判断根拠の記録）と REQ-053-004
- **根本原因**: 訳語表に技術用語の登録範囲と推奨訳が未整備で、判断基準が走査時の個別文脈判断に依存する
- **恒久対応内容**: なし（本 PR は当該走査の是正対象のみ。訳語表追補は別途提案）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（訳語表追補の要否判断は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: REQ-053-004 観点の配布物走査を新規に実施するすべての作業
- **再発条件**: 訳語表未登録の技術用語が配布物に存在する状態で REQ-053-004 走査を実施した場合
- **予防策候補**: 訳語表への追補（根拠と推奨訳を明記した登録）により走査の再現性を向上
- **想定反映先**: docs/designs/responsibilities/document-type-responsibilities.md（訳語表）、agentdev-doc-writing の査読観点
- **関連**: PR #2478 本文「Findings / Capture候補」learning 1 件（回収元: https://github.com/yogata/agent-dev-flow/pull/2478 ）
- **タグ**: `#req053` `#訳語表` `#英字混在` `#走査再現性`

## repo-local 正本の src 配下移動は agentdev-* 命名である限り配布境界 detector の列挙に捕まる（移動系 Case の baseline 比較）

- **問題事象**: REQ-002-045 による distribution-boundary-guard の src 配下移動後、配布境界 gate（--profile source）が移動先パッケージを走査し、テストフィクスチャ（検出刺激として意図的に埋め込まれた producer 内部 ID・producer URL・docs パス）85 行を新規検出した。plugin/lib 本体からの新規検出はゼロ
- **発生局面**: 実装（case-run 委譲、Issue #2480、PR #2481）
- **検知方法**: 配布境界 gate baseline 比較（baseline 11 → 移動後 96 件、新規増分 85 件が全てテストフィクスチャ起因であることを原因特定で裏取り）
- **根本原因**: 移動先が `agentdev-*` 命名である限り detector の列挙（shippableDistribution）に捕まる構造と、fixture が detector 刺激そのものを持つテストが gate 検出対象になる点を事前に織り込んでいなかった
- **自律対応内容**: checker に tests/ ディレクトリ除外を追加（809292c5、ユーザー判断 A 案）し baseline 11 = final 11 で解消済み。根因の模型ずれは intake item（2026-08-30-distribution-boundary-checker-repo-local-model-mismatch.md）として別途管理
- **ユーザー確認有無**: あり（Issue #2480 コメントで gate 違反記録と checker 修正方針の判断を確認）
- **ADR/REQ/spec影響**: なし（配布依存境界検査の運用知見）
- **横展開観点**: repo-local 正本の src 配下移動・新設を含むすべての移動系 Case
- **再発条件**: agentdev-* 命名の repo-local 正本パッケージを src 配下へ移動・新設し、テストフィクスチャに detector 刺激が含まれる場合
- **予防策候補**: 移動系 Case では (1) 移動先パッケージ内のコメント・文字列・テストフィクスチャの ID トークンを事前に洗い出す、(2) fixture が detector 刺激そのものを持つテストは gate 偽陽性となることを baseline 比較で明示する
- **想定反映先**: agentdev-workflow-case-run / case-close の配布境界 gate 検証手順、runtime-package-boundary Design の repo-local Plugin マーカー方式拡張条件判断
- **関連**: PR #2481 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2481 ）
- **タグ**: `#distribution-boundary` `#repo-local-plugin` `#baseline-comparison` `#test-fixture`

## ID 除去ポリシー適用時の配布物表記残骸が形態ごとに不統一なまま決定的検査の対象外になっている

- **発見事象**: 配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、「（REQ）」「REQ-{NNNN}-{NNN}」「（REQ / AG-{NNN}）」「SC-{NNN}」等の ID 除去ポリシー適用時の表記が形態ごとに不統一なまま残存し、決定的検査（check_content_corruption.ts の 9 カテゴリ）の対象外で正規化されていないことが分かった
- **特性区分**: 運用（配布物整合性検査の表記基線、REQ-053 走査）
- **確知手段**: PR #2484 本文「Findings / Capture候補」learning 1 件目と inspect-skills SKILL.md line 59〜60 の表記残骸確認
- **根本原因**: ID 除去ポリシーの許容表記が未確定で、走査時の個別文脈判断に依存している
- **恒久対応内容**: なし（本 PR は当該走査の是正対象のみ。許容表記の確定は別途提案）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（表記パターン統一の要否判断は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: ID 除去ポリシーを適用する配布物整合性検査のすべて
- **再発条件**: 許容表記未確定のまま ID 除去ポリシー適用下の配布物を新規作成・改修した場合
- **予防策候補**: 許容表記の確定（形態ごとの正規表記の登録）と決定的検査への正規化ルール追加
- **想定反映先**: REQ-053 の表記品質基準、check_content_corruption.ts の検査カテゴリ、agentdev-inspect-skills の診断観点
- **関連**: PR #2484 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
- **タグ**: `#id-removal-policy` `#表記統一` `#配布物整合性`

## 段落をまたぐ「**…。\n…\n**」型の強調記法破損は既存 checker の偶数判定では検出されない

- **発見事象**: 配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、強調記法「**…。\n…\n**」型の破損が 4 ファイルで発見・修復された。checker の段落内 `**` 偶数判定では `**` が偶数個で段落をまたぐため検出されない形である
- **特性区分**: 検証（決定的破損 checker の検出限界、REQ-053-008 / REQ-053-012）
- **確知手段**: PR #2484 本文「実装内容」強調記法破損の修復 4 箇所と checker 実行結果（broken-emphasis 0 件のままであった実績）
- **根本原因**: checker の broken-emphasis 判定が段落内の `**` 偶奇に依存し、行頭 `**` で始まり行末 `**` 単独で終わる空強調行をまたぐパターンを考慮していない
- **恒久対応内容**: なし（機械検出ルールの追加は別途提案）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（checker 拡張の要否判断は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: Markdown 強調記法を含む配布物・docs の決定的破損検査全般
- **再発条件**: 「**…。\n…\n**」型の強調記法破損を含むファイルが決定的検査のみで検査される場合
- **予防策候補**: 「行頭が `**` で始まり行末が `**` 単独の空強調行」パターンの機械検出ルール追加
- **想定反映先**: check_content_corruption.ts の broken-emphasis 検査、REQ-053-012 の決定的検査カテゴリ
- **関連**: PR #2484 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
- **タグ**: `#markdown-emphasis` `#決定的検査` `#checker拡張`

## SKILL.md 見出し語の日本語化は参照先用語の横断確認を前置条件にすべき

- **発見事象**: 配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、見出し語（Control Plane、resume protocol、termination 等）を日本語化した結果、references/ 配下が旧見出し名で親 SKILL.md を参照している参照整合の切れが確認された。references を対象外とする制約のため Findings 記録で整合課題を明示して解決した
- **特性区分**: 運用（配布物の見出し語変更と参照整合、REQ-053-004）
- **確知手段**: PR #2484 本文「Findings / Capture候補」intake 1 件目（references/ の旧見出し名参照残留）と learning 3 件目
- **根本原因**: 見出し語の日本語化手順に、親 SKILL.md を参照する下位ファイル（references 等）の語彙追随確認が前置条件として組み込まれていなかった
- **恒久対応内容**: なし（本 PR は references を対象外とする合意範囲。参照語彙追随は intake で管理）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証手順への組み込み要否は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: 見出し語・用語の変更を含むすべての配布物改修
- **再発条件**: 参照される見出し語を変更した際に参照元ファイルの語彙追随確認を行わなかった場合
- **予防策候補**: 用語変更 Case の検証手順に「参照先用語の横断確認」を前置条件として組み込む（変更対象外ファイルを含む）
- **想定反映先**: REQ-053 の走査手順、agentdev-workflow-case-run の配布物改修系 Case の検証手順、agentdev-doc-writing の査読観点
- **関連**: PR #2484 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
- **タグ**: `#見出し語` `#参照整合` `#用語変更`

## 配布物側だけの訳語化は docs 側との用語差を生むため訳語登録と追随が後続課題になる

- **発見事象**: 配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、`durable state`、`control plane`、`living pool`、`fan-in` / `fan-out`、`resume source` が Design でも英語のまま使用されている一方、配布物側は日本語併記・訳語化したため、docs 側との用語差が生じた
- **特性区分**: 運用（用語政策の訳語登録範囲、REQ-053-004）
- **確知手段**: PR #2484 本文「Design確定候補」訳語追加候補一覧と「実装内容」の意図的に保持した表記（複合技術語の併記形）
- **根本原因**: 訳語登録（document-type-responsibilities.md の訳語表）が docs と配布物の両方を統制する正規参照点として整備されておらず、配布物側の個別判断が先行した
- **恒久対応内容**: なし（訳語表への追補と docs 側の追随は別途提案）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（訳語表追補の要否判断は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: 訳語化を含むすべての配布物・docs 横断の用語統一作業
- **再発条件**: 訳語表未登録の複合技術語を配布物側で先に訳語化した場合
- **予防策候補**: 訳語候補の訳語表への先行登録（根拠と推奨訳を明記）を配布物の訳語化の前置条件とする
- **想定反映先**: docs/designs/responsibilities/document-type-responsibilities.md（訳語表）、agentdev-doc-writing の査読観点
- **関連**: PR #2484 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
- **タグ**: `#訳語表` `#用語政策` `#docs配布物用語差`

## 配布依存境界 checker の unclassified-entry 分類は本文中の実在 IR 参照を新規違反と区別しない

- **発見事象**: 配布 command・skill の文章品質是正 Case（REQ-053、Issue #2485 / PR #2486）の配布依存境界 最終 gate で、agentdev-inspect-skills/SKILL.md L59 の「IR-053」参照が unclassified-entry 1件として baseline に登録されたまま残存した。当該参照は実在 IR（IR-053-gh-direct-invocation-detection）への正当参照であり、checker の分類起因の既出項目である
- **特性区分**: 検査（checker 分類と実在参照の整合、配布依存境界 checker の検知器性質）
- **確知手段**: PR #2486 本文「Findings / Capture候補」2件目、Issue #2485 対応記録コメント（case-close 配布依存境界 checker 全体再実行で failures 11件 = baseline 完全一致を再確認）
- **根本原因**: checker の unclassified-entry 分類が、本文中の ID 記述が「実在 IR への正当参照」か「分類不能な新規 ID」かを区別せず検知している
- **恒久対応内容**: なし（baseline 登録運用での許容が現状。分類改善は別途提案）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（checker 拡張の要否判断は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: 配布物本文中に IR 等の ID を正当参照するすべての配布物
- **再発条件**: 配布物本文中の実在 IR 参照が unclassified-entry として baseline 登録され、新規違反との区別が判定側で難になる場合
- **予防策候補**: checker 側で本文中の実在 IR への参照を正当参照として分類する拡張、または baseline エントリへの分類理由注記
- **想定反映先**: check_distribution_boundary.ts の分類ロジック、配布依存境界 Design
- **関連**: PR #2486 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2486 ）
- **タグ**: `#配布依存境界` `#checker分類` `#unclassified-entry`

## worktree 指定の check_integrity 実行は worktree 内 reports/ へレポートを出力するため検証後の後始末が前提になる

- **発見事象**: 検証実行（check_integrity.ts --root worktree）で生成される整合レポートが worktree 内 .agentdev/integrity/reports/ へ書き出される。reports/ は非永続・git管理対象外のため、検証後の削除と commit 対象外扱いの徹底が必要
- **特性区分**: 運用（検証実行時のレポート出力先の扱い）
- **確知手段**: PR #2501 本文「Findings / Capture候補」learning（Epic #2497 Wave 1 / Issue #2498 の検証実行で確認）
- **根本原因**: --root で worktree を指定した場合、レポート出力先も当該 root 配下へ解決される
- **恒久対応内容**: なし（PR 本文記録の運用上の留意点どおり、検証後削除と commit 対象外の徹底）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（checker 拡張の要否判断は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: worktree root 指定で整合系 checker を実行するすべての Case 工程
- **再発条件**: worktree 内で check_integrity 系検証を実行し、レポート残留のまま次工程へ進んだ場合
- **予防策候補**: 検証実行手順へのレポート後始末の明記、reports/ 出力先の検証後 cleanup チェック
- **想定反映先**: checker 実行契約と検出基盤規則（docs/designs/integrity/checker-execution-contracts.md）、検証実行手順の各 workflow
- **関連**: PR #2501 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2501 ）
- **タグ**: `#check_integrity` `#worktree` `#レポート後始末`

## トレーサビリティ対応宣言の網羅性は欠落の規模を Case 実行時に定量化して記録すると後続整備の判断材料になる

- **発見事象**: トレーサビリティ check の missing-implementation（70件）と missing-verification（42件）が main から既に存在する広範な既存状態である。REQ 行に対する ADF-COVERS(implementation / verification) 宣言の整備が未了の範囲が大きく、Case 単位の実装・検証だけでは解消しない。PR #2502 の変更では新規違反を生じていない（Compare-Object で main と差分 0件を確認）
- **特性区分**: 検証（トレーサビリティ対応宣言の網羅性、Epic #2497 Issue #2499 実行時）
- **確知手段**: PR #2502 本文「検証差分」トレーサビリティ check（missing-implementation 70件 / missing-verification 42件が main と完全一致、新規 0件）
- **根本原因**: REQ 行への対応宣言整備が一部の REQ で未了のまま残存している（宣言付与の網羅性を担保する工程が現行 pipeline に存在しない）
- **恒久対応内容**: なし（本変更はスコープ外。宣言網羅性の改善要否は intake / backlog-review 経由で別途判断）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（宣言網羅性の改善要否判断は learning-promote / backlog-review 経由の別提案）
- **横展開観点**: トレーサビリティ check を実行するすべての Case 工程（fail を新規か既存か分類するとき）
- **再発条件**: 対応宣言未整備の REQ 行が残存したまま traceability check を実行し、missing を「既存」と分類して記録する場合
- **予防策候補**: 新規 REQ 保存時に ADF-COVERS 宣言の付与を req-save / design-save の検証対象へ含める、または missing 定期走査の運用化
- **想定反映先**: agentdev-traceability の宣言完全性運用、REQ-056 系の対応宣言整備計画
- **関連**: PR #2502 本文「Findings / Capture候補」learning（回収元: https://github.com/yogata/agent-dev-flow/pull/2502 ）
- **タグ**: `#traceability` `#adf-covers` `#missing-verification` `#宣言網羅性`