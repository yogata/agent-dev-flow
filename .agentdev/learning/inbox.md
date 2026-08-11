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

