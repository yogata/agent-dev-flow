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

