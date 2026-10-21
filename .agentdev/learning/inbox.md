# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-10-20: Bun.YAML 重複パスキーの last-wins shadow により sidecar 追記が無効化される

- **問題事象**: traceability/agentdev-workflow-req-define.yaml の implementation ロール配下に同一パスキーの重複ブロックが2組存在し（6f414e5ff 時点からの構造的負債）、Bun.YAML の last-wins 解釈で先行ブロックが実効無効化されていた。DEL-3816-1 が shadow される側（先行）ブロックへ REQ-004-064/065 宣言を追記したため、追記が実効読み取りされず、PR 本文の検証差分申告「対象20行の欠落が全件解消」と case-close QG-4 の missing 検出（REQ-004-064/065 missing-implementation）が乖離した
- **発生局面**: case-close STEP-2 QG-4 のトレーサビリティ 3 完全性ゲート（canonical main 上の check で missing 検出）
- **検知方法**: case-close QG-4 独立再検査（--req 対象20行 check）が PR 本文の申告と乖離する missing を検出。停止記録（issuecomment-6279710115）で原因の機械実測（bun v1.3.6 での parse 実測）を実施
- **根本原因**: sidecar への追記が「同一キーの既存ブロックへの統合」ではなく「重複キーを新設する追記」となり、YAML の last-wins 解釈で先行ブロック全体が shadow された。検出系は shadow 後の実効集合を見るため追記が黙って捨てられ、申告と実測が乖離するまで気付けない
- **自律対応内容**: PR #3819 で重複2キーを統合解消（union を単一ブロックへ保存・71エントリ集合一致を機械検証）。canonical main 上で対象20行 check exit 0 を再実測して解消を確認
- **ユーザー確認の有無**: なし（case-close 停止記録の差し戻し指示に基づく機械的修正）
- **REQ/Decision/Design影響**: なし（本件は sidecar 更新手順の運用知見。重複パスキー事前検出の構造的予防は intake 候補として回収済み）
- **横展開観点**: 全70 sidecar を node 線形走査で再確認済み（本ファイルのみ重複）。他の YAML 宣言的データ（policy.yaml・extension yaml 等）への追記・更新でも同一リスクが成立し得る
- **再発条件**: sidecar 等の YAML 宣言的データへ「既存キーのブロックと同一キー」の追記を行った場合
- **予防策候補**: sidecar 追記・更新は「同一キーの既存ブロックへの統合」を正規手順とする。重複キー検出の導入（check の malformed-declarations 拡張等）は intake 候補として回収済み
- **想定反映先**: learning-promote による評価・昇華
- **関連**: Issue #3816・PR #3818・PR #3819・停止記録 issuecomment-6279710115・対応記録コメント（本 Case）
- **タグ**: #traceability #yaml #sidecar

---

## 並行 merge により draft 合意の REQ 行採番が消費され case-open 適用前検証で差し戻しが発生

- **問題事象**: req-draft-heading-scan-code-fence（2026-10-20T00:20 合意）の case-open 実行時、REQ-004-064/065 が並行 merge acf86dd5a（PR #3817、2026-10-20T06:54）で追加済みであり、draft の REQ-004-064〜066 が採番衝突した。docs/designs/commands/req-define.md も同 merge で frontmatter updated と ADF-COVERS 宣言行が変わり target_content_sha256 が陳腐化した
- **発生局面**: 実装（case-open STEP-3 の artifact_actions 適用前検証。Root Case #3820）
- **検知方法**: STEP-3 手順 1.5 の採番衝突検査（REQ-004.md 既存行 ID 突合）と assembly_evidence の target_content_sha256 と現行 HEAD の突合
- **根本原因**: req-define 合意時点の採番対象行が、case-auto 起動までの間に別 Case（一式 20261019T231959JST）の Definition merge で消費される非同期競合。draft は保存後も採番し直しを持たない
- **自律対応内容**: 適用を中止し非公式補完（番号振り直し・部分適用）を行わず、req-define への差し戻しと blocked 報告を実施。draft・関連 jev 観測3件は先行 commit c6258ce08 で永続化済み
- **ユーザー確認有無**: なし（case-open スキル契約 STEP-3 手順 1.5 の fail-closed 差し戻しの機械的適用）
- **Decision/REQ/spec影響**: なし（既存契約どおりの動作。契約変更不要。適用前検証が並行 merge を確実に検出した）
- **横展開観点**: REQ 行追加を含む全 draft の case-open 適用で同一競合が成立し得る。採番衝突検査と sha256 突合の有効性を実証した
- **再発条件**: draft 合意時点から case-open 適用時点の間に、同一 REQ ファイルへの REQ 行追加を含む Definition merge が入る場合
- **予防策候補**: 契約側の追加は不要（手順 1.5 が検出済み）。運用上は case-open 実行開始の早期化が陳腐化窓を縮める
- **想定反映先**: learning-promote による評価・昇華
- **関連**: .agentdev/drafts/req-draft-heading-scan-code-fence.md・Root Case #3820・merge acf86dd5a（PR #3817）
- **タグ**: #case-open #採番衝突 #並行merge #fail-closed

---

## worktree の .opencode junction 供給が切れると配布依存境界 link profile が zero-targets fail-closed する

- **問題事象**: worktree では main 側で junction 供給される .opencode/skills/agentdev-*・commands/agentdev・tools・plugins が不在となり、配布依存境界 link profile が zero-targets で fail-closed する（checker の警告文もこの確認を促す）。検出が構造的であり、実装問題と誤認しやすい
- **発生局面**: case-run STEP-S5-1 配布依存境界 最終 gate（Root Case #3820、worktree .worktrees/3820-fix）
- **検知方法**: link profile checker の zero-targets 事前警告と初回実行の fail-closed
- **根本原因**: worktree へは git 管理外実体（junction・node_modules）が伝播しない構造的制約
- **自律対応内容**: worktree 内 src/** 向け junction を再作成してから link profile を再実行し、ok・failures 0・scanned 485 を確認（証跡 .agentdev/tmp/dist-gate-final-link.json 初回分）
- **ユーザー確認有無**: なし（未追跡の環境整備であり、管理対象ファイルへの変更なし）
- **REQ/Decision/Design影響**: なし（checker 実行契約 Design の既存 fallback 契約どおりの運用）
- **横展開観点**: worktree 実行の link profile・checker 依存検査全般に同一前提が成立。junction 再作成→再実行の手順が安定する
- **再発条件**: worktree 内で .opencode/** junction を前提とする checker を junction 再作成なしに実行した場合
- **予防策候補**: worktree 作成手順への junction 再作成前置の明示（検証時のみ。削除は worktree remove 前に junction エントリのみ）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: 実装PR #3822 本文 検証差分（case-run link profile 行）・Root Case #3820
- **タグ**: #worktree #junction #配布依存境界 #link-profile

---

## record-comments.ts applySection のセクション置換で直前空行が消え見出しが前文に接続する

- **問題事象**: case-close STEP-5-2 の本文結果セクション更新で applySection（agentdev-workflow-case-run scripts/record-comments.ts）を用いたところ、置換対象セクションの直前に空行があっても `before` 末尾の `\n+` が剥ぎ取られ、`## 進行状況`・`## 結果` の見出しが前文行へ直接接続した（GitHub 描画は成立するが Markdown 構造が崩れる）
- **発生局面**: case-close STEP-5-2 本文更新（Root Case #3820、commit 1968b0ac 済み Case の Issue 本文更新）
- **検知方法**: issue_update 前の適用後本文の目視確認（glued headings の機械チェックを追加して検出）
- **根本原因**: applySection の `${before}\n${sectionMarkdown}` 連結が `before` の末尾空行を保持しない
- **自律対応内容**: 適用後に `\n## 見出し` へ空行を補完する後処理を実施してから GitHub 書込み
- **ユーザー確認有無**: なし（書込み前の整形後処理）
- **REQ/Decision/Design影響**: なし（出力の整形問題であり、セクション構築・適用の契約は不変）
- **横展開観点**: Epic 本文更新（applyEpicChildStatusUpdates は行内置換で影響なし）を除き、applySection 経由の Issue 本文更新全般に成立し得る
- **再発条件**: applySection で既存セクションを置換した場合（新規追加時は base 末尾に空行が付くため不成立）
- **予防策候補**: applySection の連結前に before 末尾へ空行 1 行を保証する修正（record-comments.ts 側）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: agentdev-workflow-case-run/scripts/record-comments.ts applySection・Root Case #3820 対応記録コメント
- **タグ**: #record-comments #applySection #issue-update

---

## req-draft の全セクション content フィールドが変更なし行で現行本文と漂う差異を含み行レベル適用との突合を阻害し得る

- **問題事象**: case-open STEP-3/STEP-4 で draft（req-draft-release-publish-and-ru-numbering）の ACT-DESIGN-001 content（対象セクション全文形式）を現行本文と突合したところ、変更対象外の行（GitHub版/Local版等価性の pr_merge 行）で現行本文の「…使用しない。:48 の宣言に対応）」に対し content 側は「:48 の宣言に対応」を欠くレンダリングになっており、全文置換すると既存記述が黙示的に削除される形状だった。同一 draft の assembly_evidence（15 実行・各 changed_lines_count 1〜2）は行レベル適用の実績と一致する
- **発生局面**: case-open STEP-3 artifact_actions 適用前検証（content 完全性検証）／Case #3823
- **検知方法**: artifact_actions 適用前検証（STEP-3 手順1.5(4)）で content と対象セクション現行全文の差分照合
- **根本原因**: req-define の draft 生成で、全セクション形式の content フィールドは変更行以外を現行本文から転記するため、変更なし行の文言が現行本文や assembly_evidence の実適用範囲から漂って転記され得る
- **自律対応内容**: 全文置換を行わず、assembly_evidence の行レベル実行と draft content の変更行のみを DefinitionEdit（oldText 完全一致）に分解して適用し、変更なし行は現行本文を保持した（適用後 verbatim 包含突合 32 項目すべて成立）
- **ユーザー確認有無**: なし（既存記述の非削除を保証する保守的適用）
- **Decision/REQ/spec影響**: なし（合意内容・契約文言の変更なし。適用方法の工学的判断）
- **横展開観点**: 全セクション content 形式の draft/RU を case-open / case-revise / case-ready で適用するすべての Case で成立し得る
- **再発条件**: draft の artifact_actions content がセクション全文形式で、かつ変更行以外の文言が現行本文と字句的に漂っている場合
- **予防策候補**: req-define draft 生成時に content を変更行の行レベル差分で表現するか、content 全文と現行セクションの機械 diff（変更行集合と assembly_evidence の一致検査）を draft 保存前検査へ追加する
- **想定反映先**: learning-promote による評価・昇華（req-define draft-generation の検査強化候補）
- **関連**: .agentdev/drafts/req-draft-release-publish-and-ru-numbering.md（ACT-DESIGN-001・assembly_evidence）、Root Case #3823、設計PR #3824
- **タグ**: #draft-content #artifact-actions #case-open

---

## deno LSP diagnostics が bun 前提テストファイルの bun 固有 API を誤検知し単一ファイル diagnostics が不採用になる

- **問題事象**: skills 配下の bun 前提テストファイル（`import.meta.dir` 等）に対し deno LSP diagnostics が誤検知し、3 秒タイムアウトも再現するため、単一ファイル diagnostics を検証証拠に使えない
- **発生局面**: case-run（DEL-3823-2）LSP diagnostics 実行／Root Case #3823
- **検知方法**: LSP diagnostics 実行で誤検知（bun 固有 API の未解決参照）とタイムアウトの再現を確認
- **根本原因**: deno LSP は bun 固有 API を解決できない。当該ファイルは skills 配下に tsconfig 不在で tsc 対象外のため LSP 側の補正も入らない
- **自律対応内容**: 単一ファイル diagnostics を不採用とし、typecheck（tsc --noEmit、package tsconfig で tests/*.ts を include）+ bun test 実行（split2 779 pass）で代替検証。差分がコメント 1 行のみのファイルは実行検証で十分と判断
- **ユーザー確認有無**: なし（検証手段の代替。観測能力は同等以上: typecheck は当該 API を含む型解決、bun test は実行時検証）
- **REQ/Decision/Design影響**: なし（検証運用の知見。契約変更なし）
- **横展開観点**: bun 前提のテストファイルを deno LSP で診断するすべての検証で成立し得る
- **再発条件**: bun 固有 API を参照するファイルを deno LSP で単一ファイル diagnostics する場合
- **予防策候補**: bun 前提ファイルの diagnostics は package tsconfig 経由の tsc --noEmit + bun test を正規代替とする運用を検証手順に明記する（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3825 本文「Findings / Capture候補」2 件目、src/common/skills/agentdev-workflow-backlog-auto/tests/end-to-end-contract.test.ts
- **タグ**: #lsp #deno-lsp #bun #verification

---

## generate_indexes 派生物自身の frontmatter updated 追随が case-open 計測日収束手順の明示対象外で補正 commit が増加した

- **問題事象**: REQ 行追加を伴う Definition Package の prepare_definition_pr 実行で、check_integrity の req-updated-freshness（IR-072）が generate_indexes 派生物 req-health-metrics.md 自身の frontmatter updated 未追随を検出し、計測日収束のための補正 commit が 3 回の script 呼び出しに増えた
- **発生局面**: case-open STEP-4（Definition PR 作成の機械工程）／Root Case #3829
- **検知方法**: prepare_definition_pr script 内の check_integrity gate が exit 1（NG 2件 → 補正後 1件）で検知
- **根本原因**: reference の計測日収束手順（2段検出）は (a) req-metrics 計測日 AUTOGEN 更新と (b) req-updated-freshness による frontmatter updated 追随を REQ・Design 側の追随として記述するが、generate_indexes 派生物（req-health-metrics.md）自身の frontmatter updated は AUTOGEN 再生成対象外であり、派生物の内容変更が発生した場合の frontmatter 追随が手順上明示されていなかった
- **自律対応内容**: 派生物 req-health-metrics.md の frontmatter updated（2026-10-20 → 2026-10-21）を DefinitionEdit で追随させ、明示パス指定補正 commit（52de5c241e）で収束させ、check_integrity pass を確認した
- **ユーザー確認有無**: なし（既存 integrity rule IR-072 の機械検査に従った追随）
- **Decision/REQ/spec影響**: なし（契約変更なし。機械検査の検出に従った追随作業）
- **横展開観点**: REQ 行追加を伴う Definition Package を生成するすべての Case で、generate_indexes が派生物の内容を変更した場合に派生物自身の frontmatter updated 追随が残作業として生じ得る
- **再発条件**: REQ 行追加等で generate_indexes 派生物（req-health-metrics.md 等）の内容が変化し、派生物の frontmatter updated が最終内容変更日より旧い場合
- **予防策候補**: case-open STEP-4 reference「計測日収束」節に、generate_indexes 派生物自身の frontmatter updated 追随（IR-072）を補正 commit 対象として明記する（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華（case-open reference の手順強化候補）
- **関連**: docs/designs/quality/req-health-metrics.md、.worktrees/3829-definition、設計PR #3830、Root Case #3829
- **タグ**: #case-open #generate_indexes #frontmatter #計測日収束

---

## worktree 環境の配布依存境界 link profile は zero-targets fail-closed となり junction 構成 root での読み取り専用実行が正

- **問題事象**: worktree 環境では `.opencode` 側の junction 投影が構成されず、配布依存境界 link profile は zero-targets fail-closed（検査不能=不合格）になる。link profile の実行は junction 構成 root（host main root）での読み取り専用実行が正しい環境分離である
- **発生局面**: case-run STEP-S5 品質統制8（配布依存境界 checker 実行）／Root Case #3829、Issue #3831
- **検知方法**: worktree 内で link profile を実行すると zero-targets:link failure（fail-closed、EXIT=1、scanned_files 0）を観測
- **根本原因**: worktree には `.opencode/skills/agentdev-*` の junction が伝播せず、link projection 走査対象が 0 件になる構造的制約
- **自律対応内容**: worktree 内 link 実行を無効実行（検査対象外）として扱い、host main root（junction 構成 root）での読み取り専用実行を正規経路として採用した。checker 実行記録表に fail-closed 実測（3行目）と main root 合格根拠（2行目）を併記した
- **ユーザー確認の有無**: なし（checker 実行契約 Design「link profile 実効実行要件」節の既存契約に従った環境分離）
- **REQ/Decision/spec影響**: なし（既存契約どおりの動作の実証）
- **横展開観点**: junction 系 skill scripts・plugins 系 gate を用いる検査はすべて同一の構造的制約を持つ（main root 実体 + --root 指定の汎用手順）。worktree 内で source / link 両 profile 実行を品質統制に組み込む場合はこの環境差を事前に織り込む必要がある
- **再発条件**: worktree 内で link profile（`.opencode/**` の link projection 走査）を実行した場合
- **予防策候補**: 品質統制定義時に link profile の実行環境を junction 構成 root へ明示指定する。worktree 実行時は無効分類として記録し、zero-targets を clean 扱いや暗黙の検査省略にしない
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3833 本文「Findings / Capture候補」learning 1 件、checker 実行記録表、checker 実行契約 Design「link profile 実効実行要件」節
- **タグ**: #worktree #junction #link-profile #配布依存境界 #環境分離

---

## Windows 環境の git worktree remove がメタデータ削除済み・物理ディレクトリ残存の半失敗状態を返すことがある

- **問題事象**: `git worktree remove`（--force なし）が Windows 環境で exit 255 を返し、`git worktree list` からは登録消滅している一方で物理ディレクトリ（`.worktrees/3831-feature`）が残存する半失敗状態になった
- **発生局面**: case-close STEP-6-1 worktree 削除（Issue #3831、post-merge 機械工程 script の cleanup-worktree-branch step）
- **検知方法**: post-merge script 報告 JSON の worktreeRemoveExitCode 255 と cleanup-worktree-branch step の warn（needs-judgment）
- **根本原因**: worktree remove 処理の途中でメタデータ削除とディレクトリ削除の間に失敗（ファイルロック等の Windows 特有要因と推定。根本は未特定）
- **自律対応内容**: `git worktree list` と物理ディレクトリの実在確認で半失敗を特定し、`git worktree prune` 後に残骸ディレクトリを明示削除（EXIT=0）して worktree と branch のクリーンアップ完了を確認した
- **ユーザー確認の有無**: なし
- **REQ/Decision/spec影響**: なし（cleanup 結果の実体確認は既存の完了検証規律どおり）
- **横展開観点**: worktree cleanup の自動化経路では、remove の非ゼロ終了を直ちに失敗と断定せず、worktree list・物理ディレクトリの実在確認で実体状態を判定する必要がある。branch 削除（-d）は同一実行で成功しており、worktree と branch の状態を別々に確認する
- **再発条件**: Windows 環境で worktree 内のファイルがロックされたまま worktree remove が実行された場合
- **予防策候補**: cleanup 自動化に remove 失敗時の worktree list + 物理残骸確認と残骸削除の再試行経路を補う（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: close_mechanical_steps.ts post-merge 報告 JSON、`.worktrees/3831-feature`、Issue #3831
- **タグ**: #worktree #cleanup #windows #case-close
