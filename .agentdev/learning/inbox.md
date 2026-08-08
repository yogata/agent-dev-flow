# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## Phase 0 commit と孫 Issue テスト戦略のスコープ交差

- **問題事象**: Phase 0 commit で適用した SPEC 変更（REQ-006-021 UPDATE 等）と、Wave 1 子 Issue のテスト戦略 TS-001（capture-boundaries.md 表整合性）が同じファイル (`docs/specs/workflows/capture-boundaries.md`) で重複スコープを持った。PR #1898 は TS-001 の on_failure (fix-and-reverify) に基づき SPEC 追随修正を実施したが、本来は Wave 2 子 Issue #1873 (OU-002) のスコープと重複していた
- **発生局面**: 実装 (Wave 1 case-run → case-close)
- **検知方法**: PR #1898 本文「Findings / Capture候補」の自己申告
- **根本原因**: Phase 0 戦略は「target_area 未検出 SPEC は follow-up Issue へ分割」を取るが、孫 Issue のテスト戦略が親 Epic 由来の検証要件（REQ-006 整合性など）を含む場合、SPEC 整合性の修正スコープが複数の孫 Issue にまたがる。運用として on_failure へ「要件定義で SPEC の記載を修正して再検証」が明示されていない場合、スコープ重複を孫 Issue 間で処理できず横断的な手戻りが生じる
- **自律対応内容**: PR #1898 は TS-001 on_failure を起動して capture-boundaries.md 表を修正しマージへ到達。重複スコープの残作業（新規セクション「工程別 capture 責務」追加、契約詳細化）は Wave 2 #1873 へ委譲したことを明示的に PR 本文で記録
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。case-run テスト戦略 on_failure 記述の運用解釈に関するもので、REQ/SPEC 本文の変更は伴わない）
- **横展開観点**: 親 Epic が複数 Wave に分割され、かつ Phase 0 commit で SPEC 群を一括適用するケース全般で、孫 Issue 間の SPEC スコープ交差が発生し得る。テスト戦略 on_failure へ「要件定義で SPEC の記載を修正して再検証」を明示することで、孫 Issue 内で SPEC 整合性修正を完結できる運用が有効
- **再発条件**: Phase 0 commit で複数 SPEC を一括適用した上で、Wave 分割された子 Issue が同一 SPEC ファイルの異なるセクションを検証対象とする場合
- **予防策候補**: case-run テスト戦略 on_failure へ「要件定義で SPEC の記載を修正して再検証」を明示的に許容する運用ルールを workflow-templates または case-run SPEC へ記載する
- **想定反映先**: `docs/specs/commands/case-run.md`、`docs/specs/skills/agentdev-workflow-templates.md`、`src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_*.md` の test strategy on_failure 記述
- **関連**: Epic #1871、Issue #1872、PR #1898、Wave 2 Issue #1873 (OU-002)
- **タグ**: `#learning` `#test-strategy` `#phase-0` `#scope-overlap` `#epic-wave`

---

## Phase 0 commit で直接 main へ適用した変更と追跡 PR のスコープ分離

- **問題事象**: Phase 0 commit `0176a0ac` で REQ-006-089 へ case-run internal lifecycle 非保持明記と REQ-011-017/018 導線追記を実施した。この変更は Phase 0 commit に含まれる `.agentdev/drafts/` のステータス更新（管理メタデータ）と同一コミットに混在した。OU-002 (#1890) は追跡 PR として空コミット (`a5a2c24`) のみを発行し、Phase 0 commit 由来のファイル変更を再分割しなかった
- **発生局面**: 計画（Phase 0 commit 設計）+ 実装（追跡 PR 発行）
- **検知方法**: PR #1900 本文「Findings / Capture候補」の自己申告（learning 候補として明示的に記録）
- **根本原因**: Phase 0 commit を「要件定義ドラフトの確定」と「SPEC/REQ ファイルの実体変更」の2種類の変更が単一コミットに混在する形で運用した。ドメイン state 更新（`.agentdev/drafts/`）と成果物変更（`docs/`）を分離する境界が明示でなかった
- **自律対応内容**: OU-002 は追跡 PR を空コミットで発行しトラッカビリティを確保。Phase 0 commit 由来の REQ-006 変更が OU-002 の完了条件を満たすことを PR 本文で明示的に検証記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。Phase 0 commit のスコープ設計運用に関するもので、SPEC/REQ 本文の変更は伴わない）
- **横展開観点**: Phase 0 commit を発行する全ケースで、ドメイン state 更新と成果物変更をコミット分割する運用が有効。混在コミットは後続 Issue の追跡 PR を空にせざるを得なくし、レビュー可能性を下げる
- **再発条件**: Phase 0 で REQ/SPEC の実体変更と管理メタデータ（`.agentdev/drafts/`）を同一コミットへ含める場合
- **予防策候補**: Phase 0 commit を2分割する運用ルールを定める。（第1コミット）`.agentdev/drafts/` の status 更新のみ、（第2コミット）docs/ 配下の成果物変更。これにより各 Issue の追跡 PR が実体変更を持ち、レビュー可能性が確保される
- **想定反映先**: Phase 0 commit 運用手順（`docs/specs/workflows/` 配下の case-open または case-auto 関連 SPEC）、または `docs/guides/` の Phase 0 解説文書
- **関連**: Epic #1888、Issue #1890 (OU-002)、PR #1900、Phase 0 commit `0176a0ac`
- **タグ**: `#learning` `#phase-0` `#commit-hygiene` `#tracking-pr` `#scope-separation`


---

## Windows 環境での git commit メッセージ encoding 手順

- **問題事象**: Windows 環境で git commit メッセージに日本語を含める際、PowerShell の `Out-File -Encoding utf8` でメッセージファイルを作成すると BOM 付き UTF-8 となり、コミットメッセージ先頭に BOM 文字が混入して化けが発生する
- **発生局面**: 実装（commit 作成時）
- **検知方法**: PR #1921 case-run 実装中の自己申告（PR 本文 Findings / Capture候補 learning セクション）
- **根本原因**: PowerShell の `Out-File -Encoding utf8` は Windows PowerShell 5.x で BOM 付き UTF-8 を生成する。agentdev-gh-cli WRITE 標準手続きは `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` を規定するが、commit メッセージ作成時は同手続きの対象外として運用されていた
- **自律対応内容**: `node -e` + `fs.writeFileSync(path, content, 'utf-8')` で commit メッセージファイルを作成後、`git commit -F <file>` でコミットする手法へ切替えて安定化した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（agentdev-gh-cli standard-procedures.md の WRITE 手続き対象へ git commit メッセージ作成を含めるか否かが検討課題。現状は Issue/PR 本文へ限定）
- **横展開観点**: Windows 環境で `git commit`、`git tag`、その他ネイティブコマンドへ日本語ファイルを渡す全ケースで BOM 付き UTF-8 化けが発生し得る
- **再発条件**: Windows 環境で PowerShell の `Out-File`/ `Set-Content`/ `>` リダイレクトで commit メッセージファイルを作成する場合
- **予防策候補**: agentdev-gh-cli standard-procedures.md の WRITE 標準手順（Section 2 Step 1）を git commit メッセージ作成時へも拡張適用する旨を明文化する。または別セクション「git commit メッセージ作成時」を新設し `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` を規定する
- **想定反映先**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（既存 WRITE 標準手順の対象拡張または新規セクション）
- **関連**: PR #1921、Issue #1918、agentdev-gh-cli WRITE 標準手順
- **タグ**: `#learning` `#windows` `#encoding` `#git-commit` `#powershell-bom`


---

## worktree-per-WP モデルでの gitignore 対象ファイルの受け渡し判断基準

- **問題事象**: worktree-per-WP モデル（case-auto が各 WP ごとに独立 worktree を作成）で、gitignore 対象ディレクトリ（`.omo/`）配下のファイルを後続 WP へ受け渡す必要がある場合、各 worktree は独立した working tree を持つため local-only の gitignore 対象ファイルは後続 WP の worktree から参照できない
- **発生局面**: 実装（WP-0 case-run、移行証拠ファイル永続化時）
- **検知方法**: PR #1932 case-run 実装中、`.omo/` が gitignore 対象のため `git add` で追跡できず、`git add -f` で強制追加する必要を確認。worktree-per-WP モデルで後続 WP への受け渡し要件と照合し判断基準の検討課題として PR 本文 Findings へ記録
- **根本原因**: worktree は独立した working tree を持つため、親 worktree の untracked / gitignore 対象ファイルは子 worktree へ引き継がれない。gitignore 対象を追跡対象へ昇格しない限り、commit 経由でしか受け渡せない
- **自律対応内容**: WP-0 では `.gitignore` を変更せず（SPEC 変更スコープ外）、`git add -f .omo/plans/agentdev-migration-2026-08-05.*` で証拠ファイルのみ明示追加。`.gitignore` の `.omo/` エントリは維持し、証拠ファイルのみ例外的に追跡対象化
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（本件は運用方針の判断基準であり、REQ/ADR/SPEC の変更を要さない。`.gitignore` 運用はプロジェクト固有）
- **横展開観点**: worktree-per-feature / worktree-per-issue 等の worktree 分割モデル全般で、gitignore 対象のビルド成果物・証拠ファイル・キャッシュを後続 worktree へ受け渡す際に同問題が発生し得る
- **再発条件**: worktree-per-WP / worktree-per-issue モデルで、gitignore 対象ディレクトリ配下のファイルを複数 worktree 間で共有する必要がある場合
- **予防策候補**: (a) `.gitignore` に `!<path>` 例外を追加して追跡対象化（堅牢、忘却リスク低）、(b) 各 case-run の完了条件へ「gitignore 対象証拠ファイルが main へ反映済み」を明示（運用でカバー）、(c) 証拠ファイル配置先を gitignore 対象外へ変更（構造変更）。ワークフロー特性に応じて選択
- **想定反映先**: 移行計画 `.omo/plans/agentdev-migration-2026-08-05.md`（WP-1 で方針確定時）、agentdev-git-worktree skill references（worktree-per-issue モデルの注意点として一般化可能）
- **関連**: PR #1932、Issue #1925（WP-0）、Epic #1924、`.gitignore` L11
- **タグ**: `#learning` `#worktree` `#gitignore` `#worktree-per-wp` `#evidence-persistence` `#git-add-force`


---

## worktree 環境で junction 依存 checker が skip される制約

- **問題事象**: Integrity Checker の `source-projection-sync` チェックは git worktree 環境で「Skipped inside git worktree（junctions not recreated）」となり、junction 整合性が検証されない。worktree では junction（Windows のディレクトリシンボリックリンク）が再作成されないため、原本リポジトリの `src/opencode/` と配布先（`.opencode/commands/agentdev/` 等）の接続整合性を検証できない
- **発生局面**: 実装（WP-0 case-run、変更前検査実行時）
- **検知方法**: WP-0 case-run で `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --json --root .` を worktree 内で実行した際、`source-projection-sync` 結果が info「Skipped inside git worktree」となることを確認
- **根本原因**: git worktree は `.git` ディレクトリを共有するが working tree は独立しており、post-checkout / post-merge フック等で再作成される前提の junction が worktree では作成されない。checker 側は worktree 検出時に skip する安全側に倒れている
- **自律対応内容**: worktree 環境での検査結果は「skip」として記録し、メインリポジトリでの再評価を WP-6 の作業候補として PR 本文 Findings へ記録。WP-0 のスコープでは junction 再作成を試みず、変更前状態の記録として保持
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（checker の既知の制約の記録であり、REQ/ADR/SPEC 変更を要さない）
- **横展開観点**: worktree 運用全般で、junction / symlink / post-checkout フック依存の checker・ビルドツールは同様に skip または不完全な結果を返す可能性がある。CI と worktree で結果が乖離するリスク
- **再発条件**: git worktree 環境で junction 依存の checker（source-projection-sync 等）を実行する場合
- **予防策候補**: (a) 統合検証・最終検査はメインリポジトリで実行することをワークフローへ明示、(b) checker 側で worktree 検出時に警告レベルを上げて skip 理由を明示、(c) worktree でも junction 再作成を試みる option 追加（実装コスト要）
- **想定反映先**: agentdev-git-worktree skill references（worktree での checker 制約として）、repo-agentdev-integrity SPEC / check_integrity.ts（skip 時の警告レベル調整候補）
- **関連**: PR #1932、Issue #1925（WP-0）、Epic #1924、`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- **タグ**: `#learning` `#worktree` `#junction` `#source-projection` `#integrity-checker` `#skip-constraint`


---

## 移行計画 §5.3 の明示対象不足による壊れた fixture 修復見送りリスク

- **問題事象**: 移行計画 §5.3 で `commands_error_cases.test.ts` の修復を明示したが、`commands_structure.test.ts` と `command_fixtures.test.ts` も同様の文字化け・改行崩壊があった。§5.3 は前者のみを明示対象としたが、壊れた fixture の修復としては後者2件も含めて対処すべきだった
- **発生局面**: 実装（Wave 2 WP-1 case-run、PR #1933 作成時）
- **検知方法**: PR #1933 本文「Findings / Capture候補」セクション learning の自己申告。実装修復中に §5.3 明示対象外の fixture にも同種の文字化け・改行崩壊を発見
- **根本原因**: 移行計画の事前調査が壊れた fixture を網羅せず、代表例のみを明示対象とした。同種の問題を持つファイルの横展開確認が計画段階で実施されなかった
- **自律対応内容**: PR #1933 で §5.3 明示対象外の `commands_structure.test.ts`、`command_fixtures.test.ts` も併せて修復し、新 frontmatter 契約（description 単一）へ適合させた
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（移行計画の記載精度の改善候補。SPEC/REQ 本文の変更は伴わない）
- **横展開観点**: 移行計画や要件定義で「代表例を明示」する全ケースで、同種の問題を持つ対象の横展開確認を計画段階で実施すべき。明示対象を「例示」として扱い、同種調査を暗黙に含意させる記述が有効
- **再発条件**: 移行計画や要件定義で、同種の問題を持つ複数対象のうち代表例のみを明示し、横展開確認を省いた場合
- **予防策候補**: 移行計画の対象一覧に「同種問題の横展開確認」を暗黙の前提とする旨を記載、または明示対象を「例示」と注記する運用ルールを定める
- **想定反映先**: 移行計画テンプレート（`.omo/plans/` 配下）の対象一覧記述ガイドライン、または `docs/guides/` の計画策定解説文書
- **関連**: Epic #1924、Issue #1926（WP-1）、PR #1933、移行計画 `.omo/plans/agentdev-migration-2026-08-05.md` §5.3
- **タグ**: `#learning` `#migration-plan` `#fixture-repair` `#scope-precision` `#horizontal-expansion`


---

## command 薄型化による既存参照の行移動で baseline 比較が新規 delta を生む制約

- **問題事象**: WP-4 command 薄型化で `case-run.md`、`case-close.md` 内の `repo-agentdev-integrity` スクリプト呼出し参照行が、周辺行の大規模削除に伴って元の行位置から別行へ移動した。IR-055 RuntimeReference baseline は行位置で既知参照を管理しているため、機能的に同一の参照が baseline 比較で新規 delta（unmanaged NG）として検出された。check_integrity.ts の NG 件数が 3件（IR-061 既知）から 5件（IR-061 既知3 + IR-055 delta 2）へ増加した
- **発生局面**: 実装（WP-4 case-run、command 薄型化による大規模行削除・移動時）
- **検知方法**: WP-4 case-run で check_integrity.ts の before（HEAD: 18002bfe）と after（HEAD: 90592b53）delta を比較し、NG +2件が IR-055 RuntimeReference delta であることを特定。PR #1936 本文「## 残リスク / follow-up」へ記録
- **根本原因**: IR-055 RuntimeReference baseline が参照の「存在」ではなく「行位置」で既知性を管理している。command 薄型化のように行数を大幅に削減するリファクタでは、内容が同一でも参照行が移動し baseline との不一致が生じる。baseline は commit 単位で更新される前提だが、TASK MUST NOT DO「baseline を修正しない」により薄型化 PR 内で解消できない
- **自律対応内容**: PR #1936 では baseline を更新せず（MUST NOT DO 拘束）、IR-055 delta 2件を PR 本文「残リスク / follow-up」へ明示的に記録し、WP-6（#1931 索引再生成・統合検証）での一括解消または独立 baseline メンテナンス Issue へ委譲することを推奨。機能的変更ではないことを PR 本文で証明（WP-2 PR #1934 で対応済みの `repo-*` 参照の行移動のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（baseline 運用設計の改善候補。REQ/ADR/SPEC 本文の変更は伴わない。IR-055 baseline の管理粒度＝行位置ベースか内容ベースかは checker 実装の設計事項）
- **横展開観点**: 行位置ベースで既知参照を管理する checker（RuntimeReference baseline 等）全般で、大規模リファクタ・縮約を実施すると既存参照の行移動が delta として検出される。command 薄型化、skill 統合、ファイル分割・マージ等の構造変更を伴う作業で同様の制約が顕在化する
- **再発条件**: 行位置ベースの baseline で参照を管理する checker が存在する状態で、当該 baseline 対象ファイルの行数を大幅に削減・再構成するリファクタを実施する場合
- **予防策候補**: (a) baseline の管理粒度を「行位置」から「参照識別子（ファイルパス + 参照名）」へ移行し行移動に鈍感にする、(b) 大規模リファクタ PR の完了条件へ「baseline 更新または delta 許容の明示」を含める、(c) checker 側で行移動のみの delta を info/warning へ再分類する option を追加する
- **想定反映先**: repo-agentdev-integrity SPEC / check_integrity.ts（baseline 管理粒度の見直し候補）、agentdev-workflow-lifecycle（大規模リファクタ時の baseline 取扱手順）、移行計画 `.omo/plans/agentdev-migration-2026-08-05.md` §10.6（baseline 新規追加 0件 の運用解釈）
- **関連**: Epic #1924、Issue #1929（WP-4）、PR #1936、`src/integrity/baselines/*.json`、`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- **タグ**: `#learning` `#baseline` `#integrity-checker` `#command-thinning` `#line-position-tracking` `#refactor-delta` `#wp-4` `#migration-2026-08`

---

## TypeScript世代差によりno-excuse検査器を実行できない場合の代替検証

- **問題事象**: no-excuse検査器がTypeScript 7の`typescript/unstable/*`を要求した一方、Artifact Graphの新規スクリプトはリポジトリ標準設定によりTypeScript 5.9を解決したため、検査器を起動できなかった
- **発生局面**: 実装
- **検知方法**: PR #1945の実装検証でno-excuse検査器を起動し、解決済みTypeScriptの世代不一致を確認した
- **根本原因**: 検査器が要求するTypeScript世代と、検査対象パッケージがロックファイルから解決するTypeScript世代が一致していなかった
- **自律対応内容**: 型検査、LSP診断、対象限定の禁止構文走査を実行し、検査器が確認する項目を代替手段で検証した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。実装検証手段の互換性に関する運用知見であり、今回の正規仕様は変更しない
- **横展開観点**: 独立したpackage.jsonとロックファイルを持つTypeScriptスクリプト群では、共有検査器のTypeScript要求世代との不一致が発生し得る
- **再発条件**: 検査対象がTypeScript 6以前を解決し、共有検査器がTypeScript 7の不安定APIを直接読み込む場合
- **予防策候補**: 検査器を対象パッケージのTypeScript世代に依存しない実行環境へ分離するか、起動不能時の代替検証項目を手順として定義する
- **想定反映先**: no-excuse検査器の実行手順、TypeScriptスクリプトの検証ガイド
- **関連**: Issue #1942、PR #1945、`.opencode/skills/repo-agentdev-artifact-graph/scripts/package.json`
- **タグ**: `#learning` `#typescript` `#toolchain` `#no-excuse` `#validation-fallback`

---

## 実入力に合わないfixtureが関係抽出漏れを隠す

- **問題事象**: 単純化したテストデータが実際のProject Extensionの配列形式を再現しておらず、既存テストが`rules.skill`と`context.paths`の関係抽出漏れを検出できなかった
- **発生局面**: 実装
- **検知方法**: Issue #1944のTS-013で代表質問10件を従来探索と比較し、初回結果の10件中8件に重大な見逃しがあることを確認した
- **根本原因**: fixtureがmapping中心の入力だけを表現し、`- id: ...`から始まる配列要素と後続fieldの親文脈を再現していなかった
- **自律対応内容**: 配列要素の親文脈を保持するよう解析処理を修正し、実際の拡張定義と同じ配列形式のfixtureと回帰検査を追加して代表質問を再評価した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。Artifact Graphの実装検証方法に関する知見であり、正規仕様の要件は変更しない
- **横展開観点**: 構造化設定を独自解析するテストでは、最小fixtureだけでなく実入力と同じ入れ子、配列、親子関係を含むfixtureと実入力検証を併用する
- **再発条件**: 実入力が配列内mappingを含む一方、fixtureが平坦なmappingだけを表現する場合
- **予防策候補**: 対応する入力構造ごとに実例由来のfixtureを置き、代表入力を使う横断回帰検証で局所fixtureの不足を補う
- **想定反映先**: repo-agentdev-artifact-graphのテスト設計と実入力回帰検証手順
- **関連**: Epic #1941、Issue #1944、PR #1947、`.opencode/skills/repo-agentdev-artifact-graph/scripts/lib/parse.ts`
- **タグ**: `#learning` `#artifact-graph` `#fixture` `#yaml` `#regression-test` `#real-input`

---

## zod v4 の .refine(fn, messageFn) 第2引数が文字列または静的オブジェクトのみ受け付ける（zod v3 とは非互換）

- **問題事象**: agentdev-artifact-graph 標準配布スキルの model.ts で zod schema を定義する際、zod v3 で許容されていた `.refine(fn, messageFn)` 形式（第2引数へ関数を渡す）が zod v4 ではエラーになる。第2引数は文字列または静的オブジェクトのみ受け付ける仕様へ変更された
- **発生局面**: 実装（標準スキル新設、model.ts の open extension point zod schema 定義時）
- **検知方法**: PR #1955 実装者が型チェック（tsc --noEmit）と実装中に zod v4 の型エラーへ遭遇し Findings セクションへ自己申告した
- **根本原因**: zod v3 から v4 へのメジャーバージョンアップで `.refine` の第2引数型が狭まり、関数形式のメッセージ生成が排除された。パッケージ側で zod v4 を採用したため表面化した
- **自律対応内容**: 第2引数へ関数を渡さない形式（文字列または静的オブジェクト）へ書き換えて対応
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。実装依存知見であり、正規仕様の要件は変更しない
- **横展開観点**: zod を schema 定義に用いる他の標準配布スキル、独立 package.json を持つスクリプト群でも zod バージョンと refine API の互換性を確認する必要がある
- **再発条件**: zod v3 由来のコードを zod v4 環境へ移植する場合、または zod のメジャーアップデートを追従する場合
- **予防策候補**: zod schema を新規実装する際は対象 zod バージョンの `.refine` 第2引数型を先に確認する。zod v3→v4 移行では refine 以外にも非互換 API（`.passthrough`、`.partial` 等）を一括スキャンする
- **想定反映先**: zod を利用する標準配布スキルの実装ガイド、agentdev-artifact-graph 以外の zod schema 移行手順
- **関連**: Epic #1948、Issue #1949、PR #1955、`src/opencode/skills/agentdev-artifact-graph/scripts/lib/model.ts`
- **タグ**: `#learning` `#zod` `#zod-v4` `#schema` `#breaking-change` `#type-safety`

---

## bun test の Bun.spawnSync は Windows 環境で CLI 引数パース順序に注意が必要

- **問題事象**: bun test で CLI 引数をパースするテストを Bun.spawnSync 経由で実行した際、Windows 環境でフラグと値のペアをスキップする順序が期待と異なり、テストが意図した引数を認識しなかった
- **発生局面**: 実装（agentdev-artifact-graph 標準スキルのテスト作成時、CLI エントリポイント build_graph/check_graph/query_graph の引数解釈を検証するテスト）
- **検知方法**: PR #1955 実装者が Windows 環境でテストを実行し引数スキップ挙動の差異へ遭遇、Findings セクションへ自己申告した
- **根本原因**: Bun.spawnSync の引数配列処理が Windows ではプラットフォーム固有の挙動を持ち、フラグ+値のペアを正しくスキップするためにパース順序を明示する必要があった
- **自律対応内容**: フラグ+値のペアを正しくスキップするようパース処理を修正し対応
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。実装・テスト環境依存知見であり、正規仕様の要件は変更しない
- **横展開観点**: Bun.spawnSync 経由で CLI の引数処理を検証するテスト全般で、Windows と POSIX で引数スキップ順序の差異を考慮する必要がある
- **再発条件**: bun test で CLI 引数解釈を検証し、かつ実行環境が Windows の場合
- **予防策候補**: Bun.spawnSync の引数処理テストは Windows と POSIX 両方で実行し差異を検出する。フラグ+値のペアスキップは位置ではなくトークン種別で判定する
- **想定反映先**: agentdev-artifact-graph のテスト設計、Bun.spawnSync を用いる CLI テストのマルチプラットフォーム対応手順
- **関連**: Epic #1948、Issue #1949、PR #1955、`src/opencode/skills/agentdev-artifact-graph/scripts/tests/`
- **タグ**: `#learning` `#bun` `#bun-test` `#windows` `#cli-args` `#cross-platform`
