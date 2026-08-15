# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## gh CLI WRITE 操作で Step 0 encoding 初期化を省略し --body-file 本文が mojibake（--title は正常）

- **問題事象**: PR 本文の初回作成時、`agentdev-gh-cli` SPEC Section 2 Step 0 のコンソールエンコーディング初期化3行（`[Console]::OutputEncoding` / `$OutputEncoding` / `chcp 65001`）を省略して `gh pr edit --body-file` を実行した。結果、PR 本文（body）のみ mojibake が発生し、`--title`（日本語含む）は正常にレンダリングされた。非対称な症状（title OK / body mojibake）を観測。
- **発生局面**: 実装（case-run 内の PR 作成・本文設定）
- **検知方法**: PR 作成後の読み戻し VERIFY（Node.js execSync 経由 `gh pr view --json body`）で本文の日本語が文字化けしていることを検知
- **根本原因**: SPEC Section 2 Step 0 のコンソールエンコーディング初期化を前置しなかった。Step 0 は gh CLI がコンソールコードページを参照してメタデータや引数を符号化する経路に対する必須対策。省略時の症状が `--title` と `--body-file` で非対称になる観測事実は、引数 decode 経路とファイル読み取り経路の cp932 影響差分を示唆する
- **自律対応内容**: `gh pr edit` で本文を再設定（Step 0 初期化を前置して再実行）、その後 Node.js execSync で読み戻し VERIFY を実施して mojibake 解消を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（`agentdev-gh-cli` SPEC Section 2 Step 0 既存規定の再確認事象。SPEC 改修不要、運用遵守の提醒）
- **横展開観点**: Windows 環境の全 gh WRITE 手続き（Issue 作成/更新、PR 作成、コメント追加、PR merge、Issue close、title 修正 REST API PATCH）で Step 0 の3行を前置すること。Linux/macOS/WSL では不要
- **再発条件**: Windows PowerShell/pwsh 環境で gh WRITE 操作を実行する際、Step 0 のコンソールエンコーディング初期化を省略した場合
- **予防策候補**: gh WRITE 操作を実行する command/skill が SPEC Section 2 Step 0 の3行を必須前置することを手続き上で保証（既 SPEC 規定の運用徹底）
- **想定反映先**: なし（既 SPEC `agentdev-gh-cli` Section 2 Step 0 に網羅。本エントリは運用インシデント記録）
- **関連**: PR #2051, Issue #2050, `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0, RU-0005 AG-001
- **タグ**: `#encoding` `#gh-cli` `#windows` `#mojibake` `#spec-compliance`

## git commit -F <file> で encoding 初期化を省略し commit message が cp932 二重エンコード mojibake

- **問題事象**: case-run 内で `git commit -F <file>` により commit message を file から読み込ませて作成した際、コンソールエンコーディング初期化3行（`[Console]::OutputEncoding` / `$OutputEncoding` / `chcp 65001`）を前置しなかった。UTF-8 BOM なしで作成した commit message file が cp932 二重エンコードで読み込まれ、commit message の日本語が mojibake 破損した。PR 上で commit title と本文の日本語が文字化けしていることを観測。
- **発生局面**: 実装（case-run 内の commit 作成、worktree 上での実装 commit）
- **検知方法**: PR 作成後の読み戻し VERIFY（`gh pr view --json title,headRefOid` と `git log --oneline -1` の commit message 確認）で日本語文字化けを検知
- **根本原因**: `git commit -F <file>` は file 内容を commit message へ読み込むが、pwsh 環境でコンソールコードページが cp932 (932) の場合、git が file 読み取り時にも cp932 として decode し、UTF-8 バイト列を cp932 → UTF-8 の二重エンコードで解釈して mojibake が発生する。`agentdev-gh-cli` SPEC Section 2 Step 0 は gh CLI WRITE 操作向けだが、`git commit -F` 等 file 読み取り経路でも同等のコンソールエンコーディング初期化が必要という知見。OU2 capture（gh CLI `--body-file` mojibake、PR #2051）とは発生経路が異なる（gh CLI ではなく git CLI 直接操作）が、根本対策は同一
- **自律対応内容**: worktree 上で `git commit --amend -F <file>` により commit message を再作成（encoding 初期化3行を前置して再実行）、`git push --force-with-lease origin refactor/issue-2054` で遠隔へ反映。PR 上の commit message で mojibake 解消を確認後、PR merge へ進行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（`agentdev-gh-cli` SPEC Section 2 Step 0 の対象範囲が gh CLI WRITE 手続きに限定されており、`git commit -F` 等の git CLI 直接操作時の encoding 初期化要件が明文化されていない可能性あり。本エントリは運用インシデント記録として蓄積し、learning-promote で SPEC 改修要否を評価する対象とする）
- **横展開観点**: Windows 環境の全 git WRITE 操作（`git commit -F`、`git commit -m`、`git tag -F`、`git tag -m`、`git merge` 等、message file を読み込む経路）で Step 0 の3行を前置すること。Linux/macOS/WSL では不要。本知見は gh CLI 直接操作（OU2 capture）と git CLI 直接操作の両方に共通する根底要件
- **再発条件**: Windows PowerShell/pwsh 環境で `git commit -F <file>` を実行する際、コンソールエンコーディング初期化を省略した場合
- **予防策候補**: git WRITE 操作（commit/tag/merge 等、message file 経由）を実行する command/skill が SPEC Section 2 Step 0 の3行、または同等のコンソールエンコーディング初期化を必須前置すること。現 SPEC は gh CLI 向けだが、git CLI 直接操作時も同等の初期化が必要という知見の文書化（learning-promote で SPEC `agentdev-gh-cli` Section 2 Step 0 適用範囲拡張 または `agentdev-git-worktree` 等の git 操作 skill への注意喚起を評価）
- **想定反映先**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0（gh CLI 向け規定の git CLI 直接操作への適用範囲拡張候補）、または `agentdev-git-worktree` skill（git CLI 直接操作時の encoding 初期化要件の明文化候補）
- **関連**: PR #2055, Issue #2054, RU-0004 OU-001, OU2 capture entry（PR #2051, Issue #2050, gh CLI `--body-file` mojibake）, `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0
- **タグ**: `#encoding` `#git-cli` `#windows` `#mojibake` `#commit-message` `#spec-compliance`

## gh pr create --title --body-file で Step 0 encoding 初期化3行前置にも関わらず --body-file 本文が cp932 二重エンコード mojibake（第3の経路）

- **問題事象**: case-run（PR #2059 作成）で `agentdev-gh-cli` SPEC Section 2 Step 0 のコンソールエンコーディング初期化3行を前置した上で `gh pr create --title "..." --body-file <UTF-8 BOM なし file>` を実行した。結果、PR 本文（body）が cp932 二重エンコード mojibake を発生した。`--title` と `--body-file` を同時渡しする `gh pr create` 複合呼び出しで、Step 0 を前置しても body 側に mojibake が残る事象を観測。修復のために `gh api --input <JSON>` 経由（REST API 直接呼出し、JSON ファイル渡し）へ切り替えて本文を再設定した。
- **発生局面**: 実装（case-run 内の PR 作成、worktree 上での実行）
- **検知方法**: PR 作成後の読み戻し VERIFY（Node.js execSync 経由 `gh pr view --json body`）で本文の日本語が文字化けしていることを検知
- **根本原因**: `gh pr create --title --body-file` の呼び出しで、`--title` 引数の inline 日本語（RU-0005 AG-001 で禁止されているが発生）と `--body-file` の file 読み取り経路が同時に存在する場合、Step 0 のコンソールコードページ切替えが `--body-file` の decode 経路へ波及しなかった可能性。OU2（Step 0 省略で `--body-file` mojibake）や OU4（git commit -F 省略で mojibake）とは異なり、Step 0 を前置しても `gh pr create` の複合引数（`--title` + `--body-file` 同時）で body 側に mojibake が残る第3の経路
- **自律対応内容**: `gh pr create` の本文設定を破棄し、`gh api --input <JSON>` 経由（JSON ファイルに title と body を纏めて格納、REST API へ file 渡し）で PR 本文を再設定。読み戻し VERIFY で mojibake 解消を確認後、後続工程へ進行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（`agentdev-gh-cli` SPEC Section 2 Step 0 の `--body-file` 保証が `gh pr create --title --body-file` 複合呼び出しで成立しない事象。RU-0005 AG-001 の `--title` inline 禁止規定と Step 0 の組合せでも body 側保護が不十分な可能性）。learning-promote で SPEC 改修要否（`gh pr create` 時の `--title`/`--body-file` 分離、REST API 経由推奨化等）を評価する対象
- **横展開観点**: Windows 環境の gh CLI WRITE 操作で `--title` と `--body-file` を同時に渡す手続き（`gh pr create`、`gh issue create` 等）。Step 0 前置であっても `--title` inline の混入は `--body-file` 側へ cp932 影響を波及させうるため、`--title` は REST API PATCH 経由（RU-0005 AG-002）、`--body-file` は別立てで渡す分離構成、または全本文を `gh api --input <JSON>` 経由で処理することを検討
- **再発条件**: Windows PowerShell/pwsh 環境で `gh pr create --title "日本語" --body-file <file>` を実行する際、Step 0 初期化3行を前置しても `--title` inline が同時に存在する場合
- **予防策候補**: `gh pr create --title --body-file` の複合呼び出しを避け、(1) ASCII 仮 title で `gh pr create --body-file` のみ実行、(2) 別途 REST API PATCH（RU-0005 AG-002）で日本語 title を設定、の2段階シーケンスを SPEC 標準とすること。または `gh pr create` 自体を `gh api --input <JSON>` 経由へ切替えること
- **想定反映先**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` PR 作成手続き（`gh pr create --title --body-file` 複合呼び出しから2段階シーケンスへの標準化候補）、RU-0005 AG-001/AG-002（`--title` inline 禁止と REST API PATCH 標準の組合せ拡張候補）
- **関連**: PR #2059, Issue #2058, RU-0007 OU-006 case-run, OU2 capture entry（PR #2051, Step 0 省略で `--body-file` mojibake）, OU4 capture entry（PR #2055, git commit -F 省略で mojibake）, `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0, RU-0005 AG-001/AG-002
- **タグ**: `#encoding` `#gh-cli` `#windows` `#mojibake` `#pr-create` `#spec-gap`

## Epic ステータス追跡テーブル形式の契約不一致（agentdev-epic-tracker 新4列/旧4列 vs case-open 件数テーブル）

- **問題事象**: Epic #2076 のステータス追跡テーブルが `agentdev-epic-tracker` SKILL.md および `references/regex-and-merge-conflict.md` の定義形式（新4列 `#/Issue/ステータス/内容` または旧4列 `#/Issue/タイトル/ステータス`）ではなく、「状態別件数テーブル（`pending/running/completed/blocked/failed` × 件数）」+「Wave テーブル（`Wave/Issue/実行方法/前提`、ステータス列なし）」形式であった。`agentdev-workflow-case-close` SKILL.md の STEP-1「テーブル存在時: Epic Wave クローズ、テーブル不存在時: 単一 Issue クローズ」ルーティング判定に照らすと形式不一致だが、Epic である事実（label: epic、子Issue #2077..#2083）と競合する。task MUST「#2077 を pending→completed に更新」と形式定義が合致しない事象を観測。
- **発生局面**: 完了処理（case-close Epic Wave クローズ STEP-E1/E5）
- **検知方法**: Epic #2076 本文読込後、`agentdev-epic-tracker` の正規表現パターン `(\| \d+-\d+ \| #2077 \| )pending (\|)`（新4列）および `(\| \d+ \| #2077 \| [^|]* \| )pending (\|)`（旧4列）を適用し、いずれも合致しないことを検知
- **根本原因**: `case-open` テンプレート（`.opencode/commands/agentdev/templates/issue_desc_epic.md` 等または draft-data 生成ロジック）と `agentdev-epic-tracker` SKILL.md で定義する Epic Issue 本文ステータス追跡テーブル形式の契約不一致。case-open 側が件数テーブル形式を採用し、agentdev-epic-tracker 側が新4列/旧4列形式を前提としている。両者の SSoT 整合性が取れていない
- **自律対応内容**: 厳密仕様（テーブル不存在 → 単一 Issue クローズ）に従うと Epic #2076 自体をクローズしようとするが、子Issue #2078..#2083 が未完了のため OPEN 維持が必要。task MUST「件数テーブルで #2077 の pending→completed を反映」を達成するため、件数テーブルの数値を更新（`pending 7 → 6`、`completed 0 → 1`）して実質的な進捗反映を実施。`agentdev-epic-tracker` の正規表現契約からの逸脱は case-close 完了報告で user へ明記し、形式標準化を別途検討課題として提示
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（`agentdev-epic-tracker` SKILL.md「新4列/旧4列形式」と case-open の Epic テンプレート形式の不一致。learning-promote で SPEC 改修要否を評価する対象。候補: (a) case-open テンプレートを新4列形式へ移行、(b) agentdev-epic-tracker を件数テーブル形式へ対応拡張、(c) 両者が一致する別形式へ統一）
- **横展開観点**: 既存の全 Epic Issue で同様の形式不一致が潜在。case-close Epic Wave クローズ（STEP-E1〜E6）の agentsdev-epic-tracker 正規表現ベースの更新が、件数テーブル形式 Epic では機能しない。Wave テーブルからの running 子Issue 特定も機能しない（ステータス列無いため）
- **再発条件**: case-open が件数テーブル形式で Epic Issue を作成し、case-close Epic Wave クローズが agentdev-epic-tracker の新4列/旧4列正規表現を前提に動作する場合
- **予防策候補**: case-open テンプレート形式と agentdev-epic-tracker 形式契約の SSoT 統一。具体的には (a) case-open が agentdev-epic-tracker の新4列形式（子Issue 行にステータス列を持つ）を採用、(b) agentdev-epic-tracker が件数テーブル + Wave テーブル形式へ対応拡張、(c) 新4列と件数テーブルの両方をサポートするハイブリッド形式の定義、いずれかの統一
- **想定反映先**: `src/opencode/skills/agentdev-epic-tracker/SKILL.md`（テーブル形式定義）、`src/opencode/skills/agentdev-epic-tracker/references/regex-and-merge-conflict.md`（正規表現パターン）、`src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md`（テーブル存在判定ロジック）、`src/opencode/commands/agentdev/templates/issue_desc_epic.md`（Epic テンプレート形式）
- **関連**: Epic #2076, 子Issue #2077, PR #2084, REQ-028 OU-001 Phase 0 case-close
- **タグ**: `#epic-tracker` `#case-open` `#template-mismatch` `#spec-gap` `#form-standardization`

## docs/specs/ 配下の非 SPEC ファイル（baseline snapshot）の SPEC README 登録対象判定

- **問題事象**: Phase 0 baseline ファイル `docs/specs/integrity/baselines/pre-audit-baseline-20260811.md` を作成した際、`check_changed_docs.ts --workflow case-run`（targeted docs guard）が `spec_readme_update_required: true` フラグを検出した。本ファイルは SPEC ではなく参照用 baseline スナップショットであるため、`docs/specs/README.md` への登録要否が case-close で判断対象となった。`docs/specs/` 配下に配置されるが SPEC schema を持たないファイル群の README 登録判定基準が明示的に文書化されていない
- **発生局面**: 完了処理（case-close docs 検証 STEP-3、targeted docs guard）
- **検知方法**: PR #2084 の `## Findings / Capture候補` > `### docs-integrity` セクションに `spec_readme_update_required: true` フラグ検出の記録あり。case-close で該当フラグの取り扱いを判断
- **根本原因**: `docs/specs/` 配下に SPEC 以外のファイル（baseline snapshot、参照用メモ、analysis 結果等）が配置される場合の SPEC README 登録対象判定基準が明文化されていない。targeted docs guard は `docs/specs/` 配下の新規ファイルを機械的に SPEC README 登録候補とするが、ファイルの役割（SPEC schema 準拠 vs 非 SPEC）を意味判断していない
- **自律対応内容**: 本 baseline ファイルは SPEC ではなく参照用 snapshot であるため SPEC README 登録対象外と判断。case-close 完了報告で user へ明記。targeted docs guard のフラグは warning 扱いで継続
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（`docs/specs/README.md` の登録対象基準、または targeted docs guard の判定ロジック）。learning-promote で SPEC 改修要否を評価する対象。候補: (a) `docs/specs/README.md` の登録対象を「SPEC schema 準拠ファイルのみ」と明記、(b) targeted docs guard が frontmatter で SPEC か否かを判定して `spec_readme_update_required` フラグを制御、(c) `docs/specs/baselines/` 等の非 SPEC サブディレクトリを README 対象外とする規約策定
- **横展開観点**: 将来 `docs/specs/` 配下に配置される非 SPEC ファイル（analysis 結果、参照用メモ、過去ログ等）で同様の false positive が発生する可能性
- **再発条件**: `docs/specs/` 配下に SPEC schema を持たないファイルを新規作成し、targeted docs guard を実行した場合
- **予防策候補**: targeted docs guard（`check_changed_docs.ts`）が frontmatter または配置ディレクトリに基づき SPEC 判定を行い、非 SPEC ファイルは `spec_readme_update_required` フラグを抑止。または `docs/specs/README.md` の登録対象基準を SPEC ファイルのみに限定する規約を docs に明記
- **想定反映先**: `src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts`（targeted docs guard の判定ロジック）、`docs/specs/README.md`（登録対象基準の明文化）、`docs/specs/foundations/document-model.md`（文書種別と配置基準の補強）
- **関連**: PR #2084 Findings docs-integrity セクション, `docs/specs/integrity/baselines/pre-audit-baseline-20260811.md`, Epic #2076 OU-001 Phase 0
- **タグ**: `#docs-check` `#spec-readme` `#targeted-docs-guard` `#false-positive` `#spec-gap`

## 廃止 IR 識別子の歴史参照を監査文書・baseline に残置する運用（DEC-013 AG-008 履歴担保原則の適用事例）

- **問題事象**: OU-006 Phase 5 で DELETE 対象となった IR-019/022/026/036 の識別子が、監査文書（`docs/specs/integrity/audits/*.md`）、pre-audit baseline（`docs/specs/integrity/baselines/pre-audit-baseline-20260811.md`）、`docs/specs/quality/spec-health-metrics.md`、`docs/requirements/REQ-025.md`、`docs/specs/integrity/rules/IR-025-retired-adr-path-rule.md` に歴史的理由で言及されていた。TS-017（DELETE IR 残存参照 全 repository 検索）で該当5件を検出したが、削除すべきか残置すべきかの判定基準が DEC-013 AG-008 で明文化されていない
- **発生局面**: 実装（case-run Phase 5、DELETE IR 残存物除去）、完了処理（case-close QG-4 完了条件評価、TS-017 評価）
- **検知方法**: TS-017 で catalog/rule-ownership AUTOGEN から除外後に `src/` 配下で 0 件、docs 配下で既知履歴参照5件を検出
- **根本原因**: DEC-013 AG-008 は「tombstone 廃止、交叉参照は req-impact-map/retired/ へ再配置、履歴性は Git で担保」を謳うが、監査文書・baseline 等の「歴史記録ファイル」に言及される識別子の取り扱いが規定されていない。AG-008 の「履歴性は Git で担保」原則をどう適用するか（文言削除 vs 残置）の運用基準が不明確
- **自律対応内容**: 監査文書・baseline は「時点 snapshot」であり、編集すると歴史価値を損なうため、識別子言及をそのまま残置。REQ-025・IR-025 rule ファイルは依然として現行 IR として参照されるため残置（IR-025 は Phase 5 で新 detector `check_retired_artifact_residual.ts` の検出対象として存続）。Phase 5 の完了条件（TS-017「残存参照が存在しない」）は「現行 IR としての機能的残存参照」を意味し、歴史記録としての言及は合格と解釈して QG-4 判定
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（DEC-013 AG-008「履歴性は Git で担保」の適用範囲が監査文書・baseline 等の歴史記録ファイルを含むか明示されていない）。learning-promote で SPEC 改修要否を評価する対象。候補: (a) AG-008 へ「時点 snapshot の歴史記録ファイルは削除対象外」を明記、(b) TS-017 の pass_criteria へ「歴史記録由来の言及は除外」を追記、(c) `docs/specs/integrity/audits/` と `baselines/` を対象外ディレクトリとして明示
- **横展開観点**: 将来の IR 廃止・MERGE 作業で同様の時点 snapshot 与する参照が発生するたびに判定が必要になる。REQ-028 以外の IR 整理（Phase 6 #2083 全体再検証、将来の IR 廃止）でも再発
- **再発条件**: IR DELETE/MERGE 作業で、識別子が監査文書・baseline・history 系ドキュメントに歴史的経緯で言及されている場合
- **予防策候補**: DEC-013 AG-008 または TS-017 SPEC へ「歴史記録ファイル（`docs/specs/integrity/audits/`、`docs/specs/integrity/baselines/`、git history 由来の参照）は残存参照判定の対象外」を明文化。targeted docs guard（`check_changed_docs.ts`）が history 系ディレクトリを除外リストで扱うよう拡張
- **想定反映先**: `docs/decisions/DEC-013.md`（AG-008 適用範囲の明確化）、`docs/specs/integrity/integrity-contracts.md` または同等の IR 運用 SPEC（TS-017 判定基準の拡張）、`src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts`（history 系ディレクトリ除外）
- **関連**: PR #2089 Findings TS-017 / 履歴参照の整理 セクション, Epic #2076 OU-006 Phase 5, IR-019/022/026/036, DEC-013 AG-008
- **タグ**: `#ir-lifecycle` `#delete-residual` `#history-keeping` `#spec-gap` `#dec-013`

## baseline 未反映による check_integrity.test.ts IR-055 pre-existing failure（Phase 6 #2083 委譲）

- **問題事象**: main HEAD `8c6c1897` で `check_integrity.test.ts` の IR-055 runtime-unresolved-reference テストが 1件 fail する。Phase 4（OU-005 #2081）で追加された `docs/specs/**` への参照が baseline へ未反映のため。本 PR #2089 起因でないことを `git stash` で本 PR 変更を退避した状態で同一 failure が再現することで確認した。Phase 5（OU-006 #2082）の完了条件 TS-022（regression なし）への影響は「本 PR 起因でない pre-existing」として合格判定したが、Epic #2076 完了前に対処が必要
- **発生局面**: 完了処理（case-close QG-4 TS-022 評価、test suite 実行）
- **検知方法**: `bun test .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts` で 83 pass / 1 fail。fail は IR-055 runtime-unresolved-reference。`git stash` で Phase 5 変更退避後も同一 failure 再現
- **根本原因**: Phase 4（OU-005 #2081）で `docs/specs/**` への新規参照が追加されたが、IR-055 が参照する baseline（runtime reference snapshot）へ反映されていない。Phase 4 case-close（PR #2088）で baseline 更新が漏れた、または baseline 更新タイミングが Phase 6（全体再検証）を想定していた可能性
- **自律対応内容**: 本 PR 起因でないため Phase 5 完了条件 TS-022 は合格と判定。Phase 6 (#2083) 委譲事項として PR本文「Phase 6 (#2083) への委譲事項」項目2「IR-055 baseline 更新または実体修正」へ明記。Phase 6 全体再検証で対処予定
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし直接影響なし。ただし Phase 4 case-close（PR #2088）で baseline 更新を漏れた可能性があり、case-close の docs 検証 STEP-3 で baseline 整合性を確認する手続きの有無が課題。learning-promote で評価対象
- **横展開観点**: `docs/specs/**` への新規参照を伴う Phase（Phase 4 以降、Phase 6）で同様の baseline 未反映が再発しうる。特に docs-check 系 checker の baseline は `docs/specs/**` の構成変化へ追随する必要がある
- **再発条件**: `docs/specs/**` への新規参照を伴う実装を行った Phase で、IR-055 baseline の再生成をスキップした場合
- **予防策候補**: case-close の docs 検証 STEP-3 で、PR 対象ファイルに `docs/specs/**` が含まれる場合、IR-055 baseline 再生成を必須チェックとして追加。または IR-055 テスト failure 時の case-close マニュアル判定（pre-existing vs 本 PR 起因）手順を文書化
- **想定反映先**: `src/opencode/skills/agentdev-workflow-case-close/references/`（docs 検証 STEP-3 の baseline チェック拡張候補）、`docs/specs/integrity/baselines/`（IR-055 baseline 運用規約）
- **関連**: PR #2089 Findings IR-055 pre-existing failure セクション, PR #2088 Phase 4 (OU-005 #2081), Epic #2076 OU-006 Phase 5 / OU-007 Phase 6 (#2083) 委譲事項
- **タグ**: `#baseline` `#ir-055` `#pre-existing-failure` `#regression-detection` `#phase-handoff`

## detector 個別 unit test 拡充不足パターン（file-scope violation 検出 vs detector 単位カバレッジ）

- **問題事象**: Phase 6 (OU-007 #2083) で Phase 3 §5.1 残り7件 detector（IR-028/029/030/031/034/035/046/047/048）を集約実装した。全ファイルスキャン（`check_command_format.ts`/`check_distribution_boundary.ts`/`check_integrity.ts`）で violation 0件、test suite pass を確認したが、各 detector の violation 検出ロジックを個別に検証する unit test（violation を含む fixture を与えて当該 detector が正しく検出するかを検証するテスト）が拡充不足。TS-006（現存全 IR に regression test が存在する）は file-scope violation 検出なしで合格だが、detector 単位のカバレッジ品質は warn 事項として記録
- **発生局面**: 実装（case-run Phase 3 §5.1 detector 集約）、完了処理（case-close QG-4 AC-06/TS-006 評価）
- **検知方法**: PR #2090 の Phase 6 最終検証レポート（`docs/specs/integrity/audits/final-reverification-20260811.md`）で AC-06 = TS-006 を warn 評価。pass_criteria「violation 検出なし」は満たすが、detector 単位の violation 含み fixture を用いた unit test が網羅されていないことを検知
- **根本原因**: detector 実装時、(a) 既存ファイルに対する violation 検出がないことの確認（file-scope）は実施するが、(b) 意図的に violation を含む fixture を与えて当該 detector の検出ロジックを直接検証する unit test の実装を detector 集約時に組み込む運用が明文化されていない。REQ-028-006「detector 単位 regression test」の運用基準が SPEC で不明確
- **自律対応内容**: TS-006 pass_criteria「violation 検出なし、regression test 存在」は満たすため AC-06 を warn（継続課題）として合格判定。file-scope の regression test は既存 test suite で担保されているため REQ-028 全要件成立を妨げない。detector 単位 unit test 拡充は intake inbox（Wave 7）へ課題記録
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（REQ-028-006 detector 単位 regression test の運用基準、AC-06/TS-006 pass_criteria の明確化）。learning-promote で SPEC 改修要否を評価する対象
- **横展開観点**: 将来 detector を追加実装する全 IR 対応（Phase 3 §5.1 以降の拡張、新規 IR登録 gate での detector 実装）で同様の detector 単位 unit test 拡充不足が再発する可能性
- **再発条件**: detector を集約実装・追加実装する際、file-scope violation 検出テストのみで detector 単位の violation 含み fixture テストを省略した場合
- **予防策候補**: detector 実装時の必須 deliverable として「violation 含み fixture を用いた unit test」を文書化。REQ-028-006 SPEC へ detector 単位テストの運用基準を追記
- **想定反映先**: `docs/specs/integrity/integrity-contracts.md`（REQ-028-006 detector 単位 regression test 基準）、`src/opencode/skills/repo-agentdev-integrity/scripts/`（detector unit test 拡充）、`docs/requirements/REQ-028.md`（REQ-028-006 運用基準明記）
- **関連**: PR #2090 Findings AC-06 warn, Epic #2076 OU-007 Phase 6, IR-028/029/030/031/034/035/046/047/048
- **タグ**: `#detector` `#unit-test` `#regression-test` `#coverage` `#req-028-006`

## Windows + ジャンクション環境 worktree での check_templates.ts worktree 固有 false positive（.opencode/skills/agentdev-* 空洞化）

- **問題事象**: Phase 6 (OU-007 #2083) の regression テスト（TS-022）で、worktree `.worktrees/2083-feature` 上で `check_templates.ts` の `--dry-run` flag 関連 3件 が fail する事象を観測。うち 2件（`TS-009 encoding 記述豺麗` と `See Also agentdev-adr-guidelines`）は worktree 固有の non-applicable false positive、1件は無害。worktree では `.opencode/skills/agentdev-*` が空（ジャンクション未伝播）のため、template 参照解決ができず false positive が発生。main リポジトリ merge 後に解消されるため実害はないが、TS-022 regression 評価でノイズとなる
- **発生局面**: 実装（case-run Phase 6 worktree での regression テスト実行）、完了処理（case-close QG-4 TS-022 regression 評価）
- **検知方法**: PR #2090 Test Strategy 結果セクションで Phase 6 worktree 12 fail / main baseline 11 fail の差分 1件 を分析。うち check_templates.ts `--dry-run` flag 関連が worktree 固有と特定
- **根本原因**: Windows + ジャンクション環境の worktree では `.opencode/skills/agentdev-*`、`.opencode/commands/agentdev/` が空になる（ジャンクション未伝播）。agentdev-workflow-orchestration SKILL.md「準備フェーズの既知の制約」に記載の制約。check_templates.ts が `.opencode/skills/` 配下の template 参照を解決する際、worktree では template が存在せず false positive が発生
- **自律対応内容**: main リポジトリ merge 後に false positive が解消されるため実害なし。TS-022「Phase 6 変更起因 regression 0件」は worktree 固有 false positive を除外して判定（main baseline 11 fail は pre-existing、worktree 追加 1件は worktree 環境固有）。AC-22 pass 判定
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（agentdev-workflow-orchestration SKILL.md「準備フェーズの既知の制約」既知事象の具体的事例記録。SPEC 改修不要、運用遵守の事例化）
- **横展開観点**: Windows + ジャンクション環境の worktree で `.opencode/skills/agentdev-*` 配下を参照する checker（check_templates.ts 以外にも発生しうる）で同様の worktree 固有 false positive が発生しうる
- **再発条件**: Windows + ジャンクション環境で worktree を作成し、`.opencode/skills/agentdev-*` 配下を参照する checker を worktree 上で実行した場合
- **予防策候補**: worktree 上で実行する checker が `.opencode/skills/` の空洞化を検知した場合、当該 checker の結果を warning 扱いとするフラグ、または worktree での checker 実行時に main リポジトリの projection を参照するフォールバック機構
- **想定反映先**: `src/opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts`（worktree 環境検出時の skip/warning ロジック候補）、`src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`（準備フェーズの既知の制約の具体的事例追記候補）
- **関連**: PR #2090 Test Strategy TS-022 regression 結果, Epic #2076 OU-007 Phase 6, agentdev-workflow-orchestration SKILL.md 準備フェーズの既知の制約
- **タグ**: `#windows` `#junction` `#worktree` `#false-positive` `#check-templates`

## verify-only 検証で MOVE/RETIRE 済み REQ 行の現行根拠参照を grep 検出するパターン

- **問題事象**: OU-009 verify-only 検証の TS-012（参照残骸健全性）で、REQ-002 の MOVE/RETIRE 済み行（021..026, 028, 029, 032, 035）が `docs/specs/**` で現行根拠として参照されていた事例を検出した。TS-012 の現行根拠参照件数が 0 でない状態（1件: `harness-separation-model.md:125` の REQ-002-022）。
- **発生局面**: 検証（verify-only の参照残骸健全性検査、TS-012）
- **検知方法**: `grep -rE "REQ-002-(021|022|023|024|025|026|028|029|032|035)" docs/specs/` で MOVE/RETIRE 済み行 ID を検索し、履歴文脈（従来/MOVE先/RETIRE後/保有していた/move/retire/移動/廃止/欠番）を除外して現行根拠参照のみを抽出する。`grep ... | grep -iv "move\|retire\|従来\|移動\|廃止\|欠番\|context分離"` が有効に機能した。
- **根本原因**: REQ-002 → REQ-029 MOVE 実行時、`docs/specs/**` 内の現行根拠引用の全文洗い替えが 1件漏れていた。MOVE 操作時の cross-reference クリーンアップは原本（REQ ファイル）と SPEC/Decision 両方で必要だが、SPEC 本文内の括弧書き引用まで届いていなかった。
- **自律対応内容**: case-close QG-4 remediation scope（trivial citation fix）として REQ-002-022 → REQ-029-007 へ更新（commit 5c920055）。TS-012 stale-reference 件数を 0 へ解消し、QG-4 完了条件を達成。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（citation ID のみ修正、意味内容と enforcement は正しく維持。SPEC/REQ 本文変更なし、status frontmatter のみ更新）
- **横展開観点**: 将来の REQ MOVE/RETIRE 操作（req-save SPLIT/MERGE/MOVE）実行時、`docs/specs/**` と `docs/decisions/**` の現行根拠参照を grep 検査し、stale reference をクリーンアップする手順を検証工程または case-close QG-4 に組み込むことが望ましい。特に括弧書きの補足引用（「DEC-001 context管理harness委譲、REQ-NNN-NNN ...」形式）は機械的検出から漏れやすい。
- **再発条件**: REQ 行を MOVE/RETIRE する req-save 操作で、cross-reference の全文洗い替え（SPEC 本文内の括弧書き引用含む）が漏れた場合
- **予防策候補**: req-save MOVE/RETIRE 時、または case-close QG-4 で、MOVE/RETIRE 済み REQ 行 ID の docs 現行根拠参照を grep 検査する gate を検証工程へ導入する候補（別途 backlog-review で判断）。
- **想定反映先**: なし（本エントリは検証パターン記録。検出 gate の恒久化は別途 backlog-review で判断）
- **関連**: PR #2098, Issue #2093 (OU-009), Epic #2091, commit 5c920055, TS-012
- **タグ**: `#stale-reference` `#req-move` `#verify-only` `#grep-detection` `#ts-012` `#case-close-remediation`

## Workflow Skill reference が配布テンプレート実ファイルを参照せず「参照のみ存在」状態で運用継続

- **問題事象**: case-open 実行（Epic #2099 Issue 化）で、`agentdev-workflow-case-open/references/termination-and-cleanup.md` Step 15 が完了報告テンプレート `templates/case-open/{standard,epic,multi-req-epic}.md` を参照しているが、`agentdev-workflow-templates` 配布物に当該ディレクトリ・ファイルが一切存在しないことを検出した。参照整合が取れないまま運用されており、完了報告の構造が実行時解釈に委ねられていた（今回の実行は case-auto stage1_result 出力契約が代替）。Epic #2060 false-positive completion と同種の「定義と配布の不整合」パターン。
- **発生局面**: 運用（case-open terminal STEP、完了報告テンプレート読込）
- **検知方法**: case-open 実行時に `src/opencode/skills/agentdev-workflow-templates/templates/` の glob 一覧（11ファイル、case-open/ なし）と termination-and-cleanup.md Step 15 の参照パス突合
- **根本原因**: Workflow Skill reference から配布成果物（テンプレート）への参照追加時に、配布側への実ファイル作成または参照側の実態合わせのいずれも完了しなかった。参照存在と配布存在の突合を authoring / 検査工程で強制していない
- **自律対応内容**: 今回の実行は case-auto の出力契約（stage1_result 構造）が完了報告の代替となったため blockers なしで継続。具体的不整合は intake item（`intake-2026-08-14-case-open-completion-report-templates-missing.md`）へ分離して記録（Split Rule）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（配布物整合の是正は intake / backlog 経由で判断。本エントリは再発防止知見の記録）
- **横展開観点**: Workflow Skill / Capability Skill の reference・SKILL.md から配布成果物（テンプレート、scripts、他 skill ファイル）へのパス参照を記述する際、参照先実ファイルの存在を authoring 時に突合する。特に agentdev-skill-authoring の品質軸「参照整合」と inspect-skills の検出対象で網羅されているかの確認が有効
- **再発条件**: 配布物間参照（テンプレート参照等）を追加するスキル編集で、参照先実ファイルの作成・確認を行わずに merge した場合
- **予防策候補**: スキル編集時の参照先実ファイル存在確認を agentdev-skill-authoring の査読プロトコルに明示、または check_templates 系 checker に「skill reference から templates/ へのパス参照→実ファイル存在」検査を追加
- **想定反映先**: `src/opencode/skills/agentdev-skill-authoring/`（参照整合の査読観点）、`src/opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts`（参照→実ファイル存在検査の追加候補。要 backlog-review 判断）
- **関連**: Epic #2099, intake item `intake-2026-08-14-case-open-completion-report-templates-missing.md`, `src/opencode/skills/agentdev-workflow-case-open/references/termination-and-cleanup.md` Step 15
- **タグ**: `#missing-template` `#workflow-case-open` `#workflow-templates` `#false-positive-completion` `#reference-integrity`

## G03（子Issue 先頭行 Parent）と issue_desc_child テンプレート構造の突合欠陥（解決時に重複記載で両立）

- **問題事象**: case-open 実行（Epic #2099 子Issue #2100〜#2109 作成）で、ガードレール G03「子Issue本文の先頭行に `Parent: #{epic_number}` を必ず含める」と `issue_desc_child.md` テンプレート構造（本文先頭が `## 親Issue` セクション、`Parent:` 行は本文4行目）が突合しないことを検出した。先行実績（#2092）は本文1行目に `Parent: #2091` を配置し `## 親Issue` セクション自体を持たない形式で、テンプレートとも G03 の文字要件とも異なる第3の状態だった。初回作成時にテンプレート構造のみに従い G03 先頭行要件を満たさず、作成後に全10子Issue を修正（本文1行目に `Parent: #2099` を付与、テンプレートの `## 親Issue` セクションは維持）した。
- **発生局面**: 実装（case-open Step 8 子Issue 作成、G03 準拠検証）
- **検知方法**: 子Issue #2100 作成後の VERIFY に続く先行実績突合（#2092 本文先頭行の確認）。テンプレート・ガードレール・実績の3者比較で不一致を特定
- **根本原因**: テンプレート（`## 親Issue` セクション内に `Parent:` 行）と command ガードレール（本文先頭行）で Parent 配置の正規位置が二重定義されており、テンプレート準拠検証（G09）と G03 検証が独立に存在する。テンプレートが G03 の文字要件を構造的に表現できていない
- **自律対応内容**: 全10子Issue の本文1行目に `Parent: #2099` を付与する `gh issue edit` を実施し再 VERIFY（テンプレートの `## 親Issue` 【必須】セクションは維持、Parent 行は結果的に二重記載）。G03 と G09 の双方を満たす最小変更とした
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（テンプレート正規形の変更は本 run の範囲外。知見記録のみ）
- **横展開観点**: テンプレート変数の配置位置がガードレールの文字要件（先頭行等）と突合するかを authoring 時に確認する。テンプレートとガードレールで同一情報の正規位置を二重定義しない
- **再発条件**: `issue_desc_child.md` テンプレートをそのまま適用して子Issue を作成した場合（G03 先頭行要件を個別確認しない限り毎回）
- **予防策候補**: テンプレート本文先頭に `Parent: #{epic_number}` 行を置き `## 親Issue` セクションを廃止または参照化するテンプレート改訂（要 backlog-review）。または case-open の G03 検証手順に「本文1行目の文字一致」を明示
- **想定反映先**: `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md`（正規形改訂候補）、`src/opencode/commands/agentdev/case-open.md` G03（検証手順の明示候補。いずれも要 backlog-review）
- **関連**: Epic #2099, 子Issue #2100〜#2109, 先行実績 #2092/#2091, `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md`
- **タグ**: `#g03` `#template-mismatch` `#case-open` `#parent-link` `#guardrail-alignment`


## Windows + junction worktree で git show 等 READ 系出力が cp932 mojibake（READ 手順でも OutputEncoding 前置が実質必要）

- **問題事象**: Windows + junction 未伝播 worktree 環境で、`git show`、`Select-String`、`Get-Content` 等の READ 系コマンド出力の日本語が PowerShell 既定コンソールエンコーディング（cp932）で mojibake になった。OU-000 baseline 抽出（`git show 49f4db17:<path>` による両ソース抽出）作業中に実際に発生し、`[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` の前置で解消した。case-close Stage 3 でも `.agentdev/learning/inbox.md` の `Get-Content` 読み出しと checker スクリプトの `Select-String` 出力で同現象が再発した
- **発生局面**: 検証（verify-only OU の baseline 抽出、capture 記録時のファイル読み出し）
- **検知方法**: 読み出したテキストの日本語が文字化け（U+FFFD 置換や cp932 逆変換文字列）として観測されること
- **根本原因**: `agentdev-gh-cli` の READ 安全手続き（Node.js execSync でパイプラインをバイパス）は gh CLI 出力を対象としており、PowerShell ネイティブコマンドレット（Get-Content / Select-String）やパイプライン経由の git 出力の decode は `[Console]::OutputEncoding` 既定値（cp932）に依存する。WRITE 手続きの Step 0（コンソールエンコーディング初期化3行）は READ 操作を明示対象外としており、手作業 READ 時の前置は規定されていなかった
- **自律対応内容**: READ 操作の実行前に `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` を前置して再実行し、正常な日本語出力を確認。以降の READ 操作では Node.js `fs.readFileSync` + `node -e` console.log、または Read tool を使用して mojibake を回避
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（agentdev-gh-cli SPEC Section 2 Step 0 は WRITE 向け規定であり、READ 向け手順の明文化要件は learning-promote で評価する対象とする）
- **横展開観点**: Windows 環境で PowerShell パイプライン経由で日本語テキストを扱う全 READ 操作（git log / git show / checker スクリプトの出力受取、既存ドキュメントの grep 的読み出し）で同リスクがある。Node.js execSync / fs.readFileSync 経由、または Read tool の使用が構造的に安全
- **再発条件**: Windows PowerShell/pwsh 環境でコンソールエンコーディング初期化なしに、パイプライン経由で日本語を含むコマンド出力やファイル内容を取得する場合
- **予防策候補**: READ 操作でも `[Console]::OutputEncoding = UTF8` 前置を習慣化する、または Node.js `fs.readFileSync` 経由に統一する。手作業 READ 手順の明文化要否は learning-promote で判断
- **想定反映先**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` READ 手続き（Node.js execSync 以外の経路を扱う場合の注意喚起候補。現行規定は execSync で安全なため変更必須ではない）
- **関連**: Issue 2100（OU-000）, PR 2110, Epic 2099, 既存 entry「gh CLI WRITE 操作で Step 0 encoding 初期化を省略し --body-file 本文が mojibake」（WRITE 経路、本 entry は READ 経路で別事象）, 「Windows + ジャンクション環境 worktree での check_templates.ts worktree 固有 false positive」（同環境系だが checker 欠陥側）
- **タグ**: `#encoding` `#read-procedure` `#windows` `#mojibake` `#junction` `#cp932`

## 旧表現を禁止する是正注記で旧表現の字面を引用すると grep 0 件基準の機械検査と衝突する

- **問題事象**: system.md の Workflow Architecture Inventory 旧表現禁止注記が、禁止対象の旧表現の字面（「Command 定義が SSoT である」）をそのまま引用していた。このため「旧表現が 0 件であること」という grep 0 件基準の完了条件・機械検査と衝突する状態だった（禁止注記自体が grep に hit する）
- **発生局面**: 実装（case-run、OU-001 規範契約整合の検証・修正）
- **検知方法**: 完了条件の再 grep（「Command 定義が SSoT」全リポジトリ検索）で禁止注記の引用行が hit することで検知
- **根本原因**: 是正注記の執筆時に、禁止対象の意味と旧表現の字面を分離していなかった。「〜という旧表現を使用しない」形式は意味としては正しいが、機械検査（grep 0 件基準）と両立しない
- **自律対応内容**: 禁止の意図を維持したまま描写形（「Command 定義を権威情報源とする旧表現」）へ言い換え、字面の出現を 0 件にした（PR 2111、commit ce4ea7fd）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（執筆規範レベルの知見。agentdev-doc-writing / japanese-tech-writing の検証観点候補）
- **横展開観点**: 横断是正・用語統一を行うすべての Issue で、是正注記・移行注記に旧語の字面を引用しない。完了条件に grep 0 件基準を置く場合は特に注意
- **再発条件**: 旧表現禁止・用語統一のは正注記を、禁止対象の字面引用付きで執筆した場合
- **予防策候補**: 是正注記は描写形（「X を権威情報源とする旧表現」等）で書く。grep 0 件基準の完了条件を持つ Issue では、注記も含めた全体 grep を case-run と case-close の両方で実施する
- **想定反映先**: なし（知見記録。規範化の要否は backlog-review で判断）
- **関連**: PR 2111 Findings learning セクション, Issue 2101（OU-001）, Epic 2099
- **タグ**: #grep-zero-criteria #remediation-note #machine-check #writing-convention

## 配布物へ Workflow Skill の STEP 表を書く際、具体番号を書ける ID ファミリーは STEP / QG に限定される

- **問題事象**: 配布物（src/opencode/）に Workflow Skill の STEP 表を記述する際、STEP / QG 接頭辞は具体番号付きで配布可能（distributed-control として境界検査を通過）だが、他の全 ID ファミリー（REQ / DEC / ADR / AG / IR / TS / OU / RU / EC 等）は具体番号を書くと配布依存境界検査で違反または未分類エラーになる
- **発生局面**: 実装（Wave 2 Workflow Skill 作成、OU-002 / OU-003 / OU-004 並列 Wave）
- **検知方法**: `check_distribution_boundary.ts --profile source --json` の実行（具体番号記述が concrete_id_hits として検出される）
- **根本原因**: 配布依存境界 SPEC の ID 衛生規則。具体番号は消費者環境で解決不能なプロジェクト内部 ID である一方、STEP / QG は workflow 定義内で閉じた distributed-control の識別子として扱われる
- **自律対応内容**: 具体番号が必要な場面を STEP / QG に限定し、それ以外はマスク形式（REQ-{NNNN}-{NNN} 等）で統一して Wave 2 の3 Workflow Skill を作成した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（配布依存境界 SPEC の既定運用の明確化事象）
- **横展開観点**: 並列 Wave での Workflow Skill / Command 作成時、作成段階からマスク形式で書くことで境界検査の手戻りを防げる
- **再発条件**: 配布物にプロジェクト内部 ID の具体番号を記述した場合
- **予防策候補**: Workflow Skill / Command の新規作成手順（agentdev-skill-authoring / agentdev-command-authoring）への「具体番号は STEP / QG のみ、他はマスク形式」注意喚起の反映候補
- **想定反映先**: `src/opencode/skills/agentdev-skill-authoring/**` または agentdev-command-authoring（執筆規範側。要否は learning-promote で判断）
- **関連**: PR 2112 Findings learning セクション, Issue 2104（OU-004）, Epic 2099, 同時並行 Wave（PR 2113 / PR 2114）
- **タグ**: `#distribution-boundary` `#id-hygiene` `#mask-form` `#workflow-skill-authoring`

## workflow 実装を command から skill へ移設すると IR-055 baseline 再生成が移設作業の標準手順として機能する

- **問題事象**: workflow 実装を command から skill へ移設すると、同一文言の参照でも移設先ファイルが baseline 未登録のため IR-055 delta 違反になる
- **発生局面**: 実装（OU-002 core 8 Command の Workflow Skill 移行）
- **検知方法**: IR-055 delta 検出（移設後の check_integrity 実行）
- **根本原因**: IR-055 baseline は file 単位の違反登録であるため、参照文言が同一でも移設先の新規 file は baseline に登録されない
- **自律対応内容**: 正規 CLI（`check_integrity.ts --update-ir055-baseline`）での baseline 再生成を移設作業に組み込み、98 から 61 entries へ純減（thin 化により command 側参照が減少。ratchet として健全）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（IR-055 baseline 運用手順の知見）
- **横展開観点**: 今後の command → skill 移設・文件移設を伴うすべての変更で、移設完了時に正規 CLI による baseline 再生成を標準手順として実施する
- **再発条件**: file 移設を伴う変更で baseline を再生成しない場合
- **予防策候補**: 移設系 PR の手順に baseline 再生成ステップを組み込む（case-run / driver の移設作業ガイドへの反映候補）
- **想定反映先**: なし（運用知見。規範化の要否は learning-promote で判断）
- **関連**: PR 2114 Findings learning セクション, Issue 2102（OU-002）, Epic 2099, 既存 entry「baseline 世代交代による check_integrity.test.ts IR-055 pre-existing failure」（別事象: test 側）
- **タグ**: `#ir-055` `#baseline-regeneration` `#file-migration` `#ratchet`

## 並列 Wave の1つが共有 baseline を再生成すると、兄弟 Wave の変更が merge 後 staging で delta warning を生む

- **問題事象**: Wave 2 の3 PR（2112 / 2113 / 2114）はファイル集合が不整合で merge conflict はないが、PR 2114 が IR-055 baseline を自 HEAD 基準で再生成（98 → 61 entries）したため、先行 merge した PR 2112 / 2113 の新規ファイル（Workflow Skill 配下）が baseline 未登録のまま staging に乗った。merge 後 staging で check_integrity を実行すると IR-055 heuristic delta warning が2件（agentdev-workflow-inspect-docs/references/scan-and-doc-diagnostics.md の docs/specs/ ・ docs/guides/ 参照）増分として検出される（NG 増分なし、warning 増分 +5: IR-055 ×2 と ir035 See Also ×3）
- **発生局面**: 完了処理（case-close Stage 3、Epic Wave クローズの merge 順序実行）
- **検知方法**: merge 前シミュレーション（3 worktree のファイル集合を合成した一時ツリーで check_integrity 実行）と staging 単体での control 実行の差分比較
- **根本原因**: baseline が「単一 PR の HEAD」基準で再生成される一方、merge 順序上の兄弟 Wave 変更はその baseline に含まれない。ファイル不整合でも baseline ratchet の登録集合は波間で相互作用する
- **自律対応内容**: merge 前にシミュレーション検証で増分を事前特定し、NG 増分がないことを確認してから指示どおりの順序で merge した。warning 増分は Phase 3（OU-005）以降の管轄として報告に記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（baseline 運用と Wave 実行モデルの相互作用の知見）
- **横展開観点**: 並列 Wave で共有 baseline / 共有 index を再生成する OU を含める場合、(1) Wave 境界（case-auto Stage 3 集約時）での再生成、または (2) merge 順序最後の PR が全兄弟変更を取り込んでから再生成、のいずれかで整列する。case-close の事前シミュレーション（ファイル集合合成 + check_integrity）は増分事前検出に有効
- **再発条件**: 並列 Wave の一部が共有 baseline を再生成し、兄弟 Wave が新規配布ファイルを追加する場合
- **予防策候補**: baseline 再生成を行う OU の実行契約に「兄弟 Wave 分を含めた状態での再生成（または Wave 境界での再実行）」を明記する候補
- **想定反映先**: なし（運用知見。OU-005 / OU-008a 実行時の注意点として報告済み）
- **関連**: Issue 2102（OU-002）, Issue 2103（OU-003）, Issue 2104（OU-004）, PR 2112 / 2113 / 2114, Epic 2099, 前段 entry「workflow 実装を command から skill へ移設すると IR-055 baseline 再生成が移設作業の標準手順として機能する」
- **タグ**: `#ir-055` `#baseline` `#parallel-wave` `#merge-order` `#staging-integration`

## check_changed_docs.ts --base-ref はコミット前実行だと files_checked 空の warning になり pass 誤認リスクがある

- **問題事象**: コミット前の worktree 上で `check_changed_docs.ts --base-ref <base>` を実行すると、`git diff <base>...HEAD` がコミット済み範囲のみを対象とするため files_checked が空になり「対象ファイルが検出されませんでした」warning となる。空結果を gate pass と誤認できる状態が生じる
- **発生局面**: 実装（case-run Wave 3、targeted docs gate の実行タイミング運用）
- **検知方法**: gate 実行時の JSON 出力で files_checked 空配列と warnings の「対象ファイルが検出されませんでした」を観測
- **根本原因**: --base-ref モードの diff 算出がコミット済み HEAD 基準である一方、case-run の実装作業ではコミット前に gate を実行しうる運用が存在する
- **自律対応内容**: コミット後に gate を再実行し、実ファイル検査結果（変更19ファイル + coupled 2ファイル、failures 0 / warnings 0）を取得して判定した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（targeted docs guard の CLI 契約どおりの挙動。運用タイミングの知見）
- **横展開観点**: case-run の gate 実行はコミット後が前提。コミット前実行で空結果を pass 扱いにしない。files_checked 空時の確認規定（targeted-docs-guard-implementation SPEC）と組み合わせて判定する
- **再発条件**: コミット前に --base-ref 指定で targeted docs guard を実行した場合
- **予防策候補**: gate 実行手順への「--base-ref はコミット後実行」前提の明記候補（要否は learning-promote で判断）
- **想定反映先**: なし（運用知見。targeted-docs-guard-implementation SPEC または case-run reference の注意喚起候補）
- **関連**: PR 2115 Findings learning セクション, Issue 2105（OU-005）, Epic 2099
- **タグ**: `#targeted-docs-guard` `#base-ref` `#pre-commit` `#empty-result` `#gate-timing`

## ハーネス Write ツールのリポジトリ外 temp 書き込みが distribution-boundary-guard でブロックされる（worktree 内配置で回避）

- **問題事象**: ハーネス（OpenCode）の Write ツールでリポジトリ外 temp（`C:\WINDOWS\TEMP\opencode`）へスクリプトファイルを作成しようとすると、distribution-boundary-guard（`tool.execute.before` フック）にブロックされる事象を確認した。機械一括是正の作業ファイル出力先として同 temp を使用できない
- **発生局面**: 実装（case-run Wave 3、TS-105 機械判定是正のスクリプト作成時）
- **検知方法**: Write ツール実行時の distribution-boundary-guard によるブロック通知
- **根本原因**: 配布依存境界の多層 enforcement（REQ-029、DEC-014）が tool.execute.before フックでリポジトリ外書き込み経路を検出・ブロックする構成として機能している。設計どおりの挙動である
- **自律対応内容**: edit ツールによる逐次実行、または worktree 内（`.agentdev/tmp` 等、.git 管理領域配下）への作業ファイル配置で回避した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（guard の設計どおり。運用回避策の知見）
- **横展開観点**: 機械一括是正・スクリプト実行を伴う作業の作業ファイルは worktree 内へ配置する。agentdev-gh-cli 標準手続きの `.agentdev/tmp`（workspace-local）配置規定と同一方向の運用
- **再発条件**: Write ツールでリポジトリ外 temp へスクリプト等の作業ファイル作成を試みた場合
- **予防策候補**: 作業ファイルの worktree 内配置（`.agentdev/tmp` 等）の徹底。既存配置規定（RU-{NNNN} AG-{NNN} の workspace-local 配置）との重複確認
- **想定反映先**: なし（運用知見。規範化の要否は learning-promote で判断）
- **関連**: PR 2115 Findings learning セクション, Issue 2105（OU-005）, Epic 2099, REQ-029（配布依存境界）, DEC-014（多層 enforcement）
- **タグ**: `#distribution-boundary-guard` `#write-tool` `#temp-workspace` `#tool-execute-before` `#operations`
## Command 本文 thin 化圧縮時に契約テスト固定トークンの事前確認を省略し一時失敗

- **問題事象**: case-run Step 7-1 の手続本体圧縮（OU-007 thin 化）時に、`distribution_boundary_routing_contract.test.ts` が detector entrypoint（`check_distribution_boundary.ts`）と `--profile source` を当該節の公開契約トークンとして固定していることを踏まえずに圧縮し、同テスト 4件を一時的に失敗させた。圧縮版から当該トークンを復元して解決し、最終的に 24/24 pass を確認した
- **発生局面**: 実装（Wave 5 OU-007。case-run Step 7-1 手続本体の summary 圧縮）
- **検知方法**: test-fix ループ中の `bun test` 失敗（routing contract テスト 4件）
- **根本原因**: Command 本文の特定セクション（手続の公開契約トークン）を固定する契約テストの存在を圧縮前に確認しなかった。routing contract 系テストは Command/SKILL 本文のトークンを検証対象にするため、本文圧縮はテスト契約破壊になり得る
- **自律対応内容**: 固定トークン（detector entrypoint と `--profile source`）を圧縮後の summary に復元し、テストを再実行して全 pass を確認。復元トークンは委譲先 Workflow Skill（STEP-S5）の公開契約として本文に残置
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（既存テスト契約の遵守事象。規範化の要否は learning-promote で判断）
- **横展開観点**: Command 本文の thin 化・圧縮を行う場合は、本文の特定セクションを固定する契約テスト（routing contract 系）の存在を先に確認する。修正→テスト失敗→復元の順でなく、固定トークン特定→圧縮→テストの順で行う
- **再発条件**: 契約テストが本文トークンを固定する領域（command 定義、SKILL 本文）を機械的・一括で圧縮・リライトする場合
- **予防策候補**: 本文圧縮前に当該ファイル名・セクション名を参照する `*.test.ts` の grep 確認を thin 化手順に組み込む（運用知見。規範化の要否は learning-promote で判断）
- **想定反映先**: なし（運用知見）
- **関連**: PR 2117 Findings learning セクション, Issue 2107（OU-007）, Epic 2099, `distribution_boundary_routing_contract.test.ts`
- **タグ**: `#thin-command` `#routing-contract` `#test-fix-loop` `#command-compression` `#operations`

## 「pre-existing fail」の由来判定は PR base（staging 相対）基準ではなく remediation 開始前 baseline commit 基準で行う

- **問題事象**: OU-008a（Issue #2108）の AC-17 判定作業で、「pre-existing fail」の由来判定を PR の base（当時の staging）基準で行うと、同一 Epic の前 Wave が導入した失敗が pre-existing に分類される事象を観測した。Wave 4/5 の「26件は base から同一」という記録は Wave 3 適用後の staging を base とした基準であり、remediation 開始前 baseline（`49f4db17`）基準では 24件が新規発生だった
- **発生局面**: 検証（OU-008a v1 の AC-17 判定、full integrity suite の由来分類）
- **検知方法**: baseline commit `49f4db17` に対する `git show` での当該テスト期待値確認（baseline では pass していた陳腐化期待値 24 件の特定）
- **根本原因**: 「pre-existing」の基準 commit が定義されず、各 Wave の PR base（直前 staging 状態）を相対基準にすると、同一 Epic 内の先行 Wave 起因の失敗が「元から存在」に見える。Epic 完了検証では false-positive completion に直結する
- **自律対応内容**: v1 判定では remediation 開始前 baseline commit を基準に `git show` 等で由来判定を実施し、24 件を remediation 由来と確定して AC-17 を fail とし差し戻した。fix（PR #2118）後に v2 で再判定して pass を確定した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証基準の運用知見。「full integrity suite pass」受入れ基準の明文化候補と併せて learning-promote で評価対象）
- **横展開観点**: 複数 Wave・複数 PR にまたがる Epic の完了検証で fail の由来判定を行うすべての場面。被差し戻し PR の「base から同一」表記を pre-existing 証拠として採用しない
- **再発条件**: Epic 内の先行 Wave がテスト期待値を陳腐化させる変更を行い、後続 Wave が自 PR の base 比較だけで由来判定した場合
- **予防策候補**: Epic 完了検証・受入れ判定の由來判定は「Epic 開始前 baseline commit での当該テスト状態」を基準とする手順の明文化（要否は learning-promote で判断）
- **想定反映先**: なし（運用知見。SPEC確定候補「full integrity suite pass 受入れ基準の明文化」と併せて評価）
- **関連**: PR #2118 Findings learning セクション, Issue #2108（OU-008a）, Epic 2099, v1 報告 issuecomment-5299652896 §2, intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md
- **タグ**: `#pre-existing-classification` `#baseline-commit` `#false-positive-completion` `#epic-verification` `#origin-analysis`

## アーキテクチャ構造変更 PR の完了条件に「固定するテストの期待値更新」を明示的に含める

- **問題事象**: OU-008a v1 の差し戻し分析で、アーキテクチャ変更（thin 化等）を伴う PR が契約テスト（構造を固定するテスト）の期待値更新を完了条件に含めなかった場合、並列 Wave で更新が一部だけ行われ漏れが発生する事象を確認した。OU-002（PR #2114）は core 8 Command の期待値更新を実施した一方、OU-003（PR #2113）/ OU-004（PR #2112）は未更新のまま merge され、統合状態で 24 件の陳腐化期待値 fail として顕在化した
- **発生局面**: 実装（Wave 2 並列 Wave の各 PR 完了判定）、検証（OU-008a v1 の full integrity suite）
- **検知方法**: staging 統合状態での `bun test` により REQ-0030-009/010/011 系 24 fail を検出し、`git show 49f4db17:<path>` との比較で remediation 由来と特定
- **根本原因**: 構造変更 PR の完了条件に「当該構造を固定する契約テストの期待値更新」が含まれておらず、各 Wave が配布物本体の移行のみを完了条件として判断した。並列 Wave では他 Wave の更新状況が見えないため、部分的実施が検出できない
- **自律対応内容**: OU-008a v1 で OU-003/OU-004 へ差し戻し相当と記録し、fix（PR #2118）で 3 テストファイルの期待値を thin Command モデルへ更新 + IR-055 baseline 再生成して解消、v2 で全 AC pass を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（Issue 完了条件の書き方規約の知見。規範化の要否は learning-promote で判断）
- **横展開観点**: 構造変更（thin 化、schema 変更、命名規約変更等）を伴うすべての PR。既存 entry「Command 本文 thin 化圧縮時に契約テスト固定トークンの事前確認を省略し一時失敗」（PR 2117、圧縮前の固定トークン確認）と相補関係（同 entry = 実行時の手順、本 entry = 完了条件の設計）
- **再発条件**: 構造を固定する契約テストが存在する状態で、当該構造を変更する PR を期待値更新なしで完了判定した場合（特に並列 Wave）
- **予防策候補**: 構造変更 PR の完了条件テンプレートに「当該構造を固定する契約テスト（`*.test.ts`）の期待値更新」を明示的に含める（要否は learning-promote で判断）
- **想定反映先**: なし（case-open の完了条件記載ガイドライン候補。規範化は learning-promote 経由で判断）
- **関連**: PR #2118 Findings learning セクション, Issue #2108（OU-008a）, Issue 2102/2103/2104（OU-002/003/004）, PR 2112 / 2113 / 2114, Epic 2099, 既存 entry「Command 本文 thin 化圧縮時に契約テスト固定トークンの事前確認を省略し一時失敗」
- **タグ**: `#contract-test` `#stale-expectation` `#parallel-wave` `#completion-criteria` `#structural-change`

## full integrity suite の fail 構成は検証環境（worktree / main、junction・node_modules 有無）で変化する

- **問題事象**: OU-008a case-close の独立再検証（QG-4 観点8「全体」スコープ）で main repo 上で `bun test ./.opencode/skills/repo-agentdev-integrity/` を実施したところ 1873 pass / 3 fail（テスト数 1876）となり、v2 の worktree 検証（1964 pass / 4 fail、テスト数 1968）と fail 構成もテスト数も一致しない事象を観測した。main 環境の 3 fail は (1) TS-009 エンコーディング検査が git 管理外の `node_modules/@types/bun/README.md` を検出、(2) REQ-0030-004 See Also 参照検査が junction 伝播環境でのみ走査対象となる `.opencode/skills` 側の stale 参照（`agentdev-adr-guidelines`、rename 4cab9fad / Issue 2039 由来、参照自体は #611 由来）を検出、(3) ADR README pre-remediation fail（両環境共通）。逆に worktree で fail していた check_templates 系 3 件（junction 未伝播）は main 環境では pass した
- **発生局面**: 完了処理（case-close QG-4、full integrity suite の独立再実行）
- **検知方法**: main repo での `bun test` full suite 再実行と v2 記録（worktree）との fail 構成・テスト数の差分比較。`skills_structure.test.ts` は `.opencode/skills/agentdev-workflow-templates` の存在で走査ディレクトリを分岐することを確認
- **根本原因**: 検査対象ディレクトリが junction 伝播状態で分岐するテスト実装と、git 管理外アーティファクト（node_modules）の有無という環境差。「full integrity suite pass」の受入れ判定に検証環境の規定がなく、単一環境の結果が絶視された場合に誤った合格・不合格の双方を生みうる
- **自律対応内容**: CB2 判定は両環境の fail 全件について由来判定（node_modules 環境依存 / pre-remediation stale 参照 / pre-remediation 既知）を行い「remediation 由来 fail 0」が環境によらず成立することを確認して pass とした。環境差の事実と受入れ基準明文化の必要性を SPEC確定候補（見送り intake 化: intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md）へ記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証環境の記録要件は SPEC確定候補として intake route で後続判断）
- **横展開観点**: worktree で検証するすべての OU・Wave。worktree 検証は main 環境の fail（node_modules 検出、junction 環境の stale 参照）を検出できず、逆に worktree 固有の false positive を生む。既存 entry「Windows + ジャンクション環境 worktree での check_templates.ts worktree 固有 false positive」の逆方向（worktree で見逃し、main で検出）を含む拡張事象
- **再発条件**: 検証環境（junction 伝播・node_modules インストール状態）が異なる複数環境で full suite の受入れ判定を行う場合
- **予防策候補**: 受入れ記録への検証環境明記（worktree / main、junction、node_modules）と fail 全件の由来分類証跡。受入れ基準自体の明文化は intake 化した SPEC確定候補経由で判断
- **想定反映先**: なし（運用知見。SPEC確定候補と併せて learning-promote で評価）
- **関連**: Issue 2108（OU-008a）, PR 2118, Epic 2099, v2 報告 issuecomment-5299817790 §2, 既存 entry「Windows + ジャンクション環境 worktree での check_templates.ts worktree 固有 false positive」, intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md
- **タグ**: `#environment-dependent` `#full-integrity-suite` `#worktree` `#junction` `#node-modules` `#acceptance-evidence`

## check_changed_docs.ts の --base-ref モードはコミット済み差分のみ検出（コミット前は --files モードで明示指定）

- **問題事象**: case-run（Issue 2120 / PR #2124）で targeted docs guard（check_changed_docs.ts --workflow case-run）を実行した際、--base-ref モード（git diff base...HEAD）はコミット済み差分のみを検出対象とするため、コミット前の作業ツリー変更が検出されず「対象ファイルが検出されませんでした」となる事象を観測した
- **発生局面**: 実装（case-run 内の targeted docs guard 実行、コミット前検証）
- **検知方法**: コミット前に --base-ref モードでガードを実行して検出対象が空となり、コミット後の同モード再実行で対象ファイルが検出された差分から特定
- **根本原因**: --base-ref モードの変更ファイル検出が git diff <base>...HEAD（コミット済み差分）に依存する設計。作業ツリーの未コミット変更は diff に現れない
- **自律対応内容**: コミット前にガードを実行する場合は --files モードで変更ファイルを明示指定し、コミット後には --base-ref モードで再実行する運用で検証漏れを回避した（PR #2124 では両モードで failures 0 / warnings 0 を確認）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（check_changed_docs.ts の mode 設計仕様に由来する運用知見。mode 使い分けの明文化要否は learning-promote で評価）
- **横展開観点**: worktree 上でコミット前に targeted docs guard を実行する全 workflow（case-run 等）。コミット前: --files、コミット後: --base-ref の使い分けを手順に織り込むことで検証漏れを構造的に防止できる
- **再発条件**: コミット前の作業ツリー状態で --base-ref モードのガードのみを実行した場合
- **予防策候補**: case-run 等のガード実行手順への「コミット前は --files、コミット後は --base-ref」使い分けの明記。または --base-ref モードが作業ツリーに未コミット変更を検出した際に警告する拡張
- **想定反映先**: src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts（未コミット変更検出警告の候補）、case-run workflow のガード実行手順（mode 使い分け明記候補。いずれも要 learning-promote / backlog-review 判断）
- **関連**: PR #2124 Findings learning セクション, Issue 2120（OU-001）, Epic 2119 Wave 1
- **タグ**: `#targeted-docs-guard` `#check-changed-docs` `#base-ref` `#files-mode` `#uncommitted-changes` `#operational-knowledge`

## autogen-index-regeneration-diff 拡張check の指定ツール generate_indexes.ts が adr-to-decision rename 未追随で EXIT_ERROR（中間 Wave は PR 索引影響なしで継続判断）

- **問題事象**: case-close（Epic #2119 Wave 2 クローズ）の Step E5b 前段で、workflow extension checks の `autogen-index-regeneration-diff`（.agentdev/extensions/skills/agentdev-workflow-case-close.yaml）が指定する `generate_indexes.ts --dry-run` が `docs/adr/README.md not found` で EXIT_ERROR 即時終了した。スクリプト最終更新 14f202f6（2026-07-26）は `docs/adr/` と `adr-*` block ID を前提とするが、リポジトリは adr-to-decision rename（a0143600、2026-08-10、#2042）後の `docs/decisions/` + `decision-*` block ID（14ブロック）へ移行済み。差分あり/なしのいずれの判定も出力不能な状態
- **発生局面**: 完了処理（case-close Epic Wave クローズ、Step E5b 前段の索引健全性検証）
- **検知方法**: `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts --dry-run` の実行で ADR README not found エラー。補助的に `check_autogen_freshness.ts --json`（REQ-010-059）を実行し、stale AUTOGEN block 4件（integrity-rule-catalog と rule-ownership の「ADR ↔REQ」→「Decision ↔REQ」用語 drift、req-health-metrics/spec-health-metrics の測定 block 古データ）を検出。DOC-MAP.md は #1958 で削除済みのため skip は正当
- **根本原因**: adr-to-decision rename（OU-005 #2042）が `generate_indexes.ts` の対象パス・block ID 定義に未反映。rename を横断是正する工程で配下スクリプトの追従検査が機能しなかった。また stale 4件はいずれも main HEAD 時点の既存債務で、本 Wave の PR はファイル変更 0 の verify-only PR（索引への影響なし）
- **自律対応内容**: 中間 Wave 2 では当該 PR が索引に影響を与えない（changedFiles=0）ため、check の保護目的（当該 PR 由来の再生成漏れ防止）は空しく充足されると判断してクローズを継続した。ツール破損と既存 stale 4件を完了報告へ明記し、解消（スクリプトの decisions 追随、または索引再生成 commit）は Wave 3 最終クローズまでの課題として先送りした。case-close 自身は索引ファイルを直接編集・commit していない（契約遵守）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（index-auto-generation SPEC が稼働契約とする生成スクリプトが実行不能。learning-promote で (a) generate_indexes.ts の docs/decisions 追随、(b) 拡張check の指定ツールを check_autogen_freshness.ts へ変更、(c) 索引再生成の専用工程化のいずれかを評価する対象）
- **横展開観点**: 同拡張check を持つ全 case-close（単一 Issue Step 3-3 含む）で同エラーが発生する。docs 構造変更（rename、削除）を伴う工期では配下の整合スクリプト追従を検証工程に組み込む必要がある
- **再発条件**: `generate_indexes.ts` が `docs/adr/` 前提のまま case-close の Step 3-3 / Step E5b 前段が実行される場合、全 case-close で再発
- **予防策候補**: rename 横断是正 PR に「参照スクリプトのパス・ID 定義追従確認」を必須項目化。または拡張check を、実行可能な freshness gate（check_autogen_freshness.ts）へ指定ツール変更し、 stale 時の停止条件を明文化
- **想定反映先**: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`（docs/decisions + decision-* block ID 追随）、`.agentdev/extensions/skills/agentdev-workflow-case-close.yaml`（checks セクションの指定ツール・失敗時扱いの明確化。要 learning-promote / backlog-review 判断）
- **関連**: Epic 2119 Wave 2, Issue 2121（OU-002）, PR 2125, a0143600（adr-to-decision rename #2042）, 87f00c48（DOC-MAP 削除 #1958）, docs/specs/integrity/index-auto-generation.md
- **タグ**: `#autogen` `#generate-indexes` `#adr-to-decision` `#extension-check` `#tool-broken` `#pre-existing-staleness` `#intermediate-wave`
