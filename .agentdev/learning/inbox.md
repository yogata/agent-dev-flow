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
